const mongoose = require("mongoose");
const AttendanceLogs = require("./model.js");
const AttendanceSettings = require("./settingsModel.js");
const ColumnMappings = require("./mappingModel.js");
const Employees = require("../employeeManagement/model.js");
const moment = require("moment");

// Helper: Calculate Attendance Status
const calculateStatus = (inTime, outTime, settings) => {
    if (!inTime) return { status: 'A', lateBy: 0, earlyExitBy: 0, totalHours: 0 };
    
    // Default shift if none provided (9 AM - 6 PM)
    const defaultShift = { inTime: "09:00", outTime: "18:00", gracePeriod: 15, halfDayThreshold: 240 };
    const shift = (settings && settings.shifts && settings.shifts.length > 0) ? settings.shifts[0] : defaultShift;
    
    const logIn = moment(inTime);
    const logOut = outTime ? moment(outTime) : null;
    
    const shiftIn = moment(logIn).set({ 
        hour: shift.inTime.split(":")[0], 
        minute: shift.inTime.split(":")[1], 
        second: 0 
    });
    
    const shiftOut = moment(logIn).set({ 
        hour: shift.outTime.split(":")[0], 
        minute: shift.outTime.split(":")[1], 
        second: 0 
    });

    let lateBy = logIn.diff(shiftIn, 'minutes');
    lateBy = lateBy > shift.gracePeriod ? lateBy : 0;

    let earlyExitBy = 0;
    if (logOut) {
        earlyExitBy = shiftOut.diff(logOut, 'minutes');
        earlyExitBy = earlyExitBy > 0 ? earlyExitBy : 0;
    }

    let totalHours = logOut ? logOut.diff(logIn, 'minutes') : 0;
    
    let status = 'P'; // Default Present
    if (lateBy > 0) status = 'L';
    if (earlyExitBy > 15) status = 'E'; // 15 min buffer for early exit
    if (totalHours < (shift.halfDayThreshold || 240)) status = 'F'; // Half Day
    if (totalHours === 0) status = 'A';

    return { status, lateBy, earlyExitBy, totalHours };
};

// GET ATTENDANCE MATRIX
exports.getAttendanceMatrix = async (req, res) => {
    try {
        const { year, month, center_id, department_id } = req.body;
        const startDate = moment([year, month - 1]).startOf('month').toDate();
        const endDate = moment([year, month - 1]).endOf('month').toDate();

        // 1. Get Employees based on filters
        let employeeQuery = {};
        if (center_id && center_id !== 'all') employeeQuery.center_id = center_id;
        if (department_id && department_id !== 'all') employeeQuery.department_id = department_id;
        
        const employees = await Employees.find(employeeQuery).lean();

        // 2. Get Attendance Logs for the month
        const logs = await AttendanceLogs.find({
            date: { $gte: startDate, $lte: endDate }
        }).lean();

        // 3. Map logs to employees
        const matrix = employees.map(emp => {
            const empLogs = logs.filter(log => log.employee_id.toString() === emp._id.toString());
            const daysData = {};
            const detailedTimings = {};
            
            let monthlyStats = { P: 0, A: 0, L: 0, E: 0, F: 0, H: 0, W: 0, totalHours: 0 };
            let weeklyHours = { W1: 0, W2: 0, W3: 0, W4: 0, W5: 0 };

            for (let d = 1; d <= moment(endDate).date(); d++) {
                const dayDate = moment([year, month - 1, d]).format("YYYY-MM-DD");
                const log = empLogs.find(l => moment(l.date).format("YYYY-MM-DD") === dayDate);
                
                if (log) {
                    daysData[d] = log.status;
                    detailedTimings[d] = {
                        in: log.inTime ? moment(log.inTime).format("HH:mm") : "-",
                        out: log.outTime ? moment(log.outTime).format("HH:mm") : "-",
                        total: log.totalHours || 0
                    };
                    
                    if (monthlyStats[log.status] !== undefined) monthlyStats[log.status]++;
                    monthlyStats.totalHours += (log.totalHours || 0);

                    const weekNum = Math.ceil(d / 7);
                    if (weekNum <= 5) weeklyHours[`W${weekNum}`] += (log.totalHours || 0);
                } else {
                    // Check for Weekly Off or Holiday
                    const checkDate = moment([year, month - 1, d]);
                    const dayName = checkDate.format("ddd");
                    const isHoliday = settings?.holidays?.some(h => moment(h.date).isSame(checkDate, 'day'));
                    const isWeeklyOff = settings?.shifts?.[0]?.weeklyOffs?.includes(dayName);

                    if (isHoliday) {
                        daysData[d] = 'H';
                        if (monthlyStats['H'] !== undefined) monthlyStats['H']++;
                    } else if (isWeeklyOff) {
                        daysData[d] = 'W';
                        if (monthlyStats['W'] !== undefined) monthlyStats['W']++;
                    } else {
                        daysData[d] = 'X'; // No data / Potential Absent
                    }
                    detailedTimings[d] = null;
                }
            }

            return {
                employee_id: emp._id,
                employeeName: emp.employeeName,
                employeeID: emp.employeeID,
                departmentName: emp.departmentName,
                attendance: daysData,
                timings: detailedTimings,
                weeklyHours,
                monthlyStats
            };
        });

        res.status(200).json({ success: true, total: matrix.length, data: matrix });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SAVE ATTENDANCE (Manual & Bulk)
exports.saveAttendance = async (req, res) => {
    try {
        const { attendanceData, user_id } = req.body; 
        const settings = await AttendanceSettings.findOne(); // Global settings
        
        const results = [];
        for (const record of attendanceData) {
            let employee_id = record.employee_id;
            
            // Resolve employee_id if only employeeID (string) is provided (Bulk Upload case)
            if (!employee_id && record.employeeID) {
                const emp = await Employees.findOne({ employeeID: record.employeeID }).select('_id');
                if (emp) employee_id = emp._id;
            }

            if (!employee_id) continue;

            const { status, lateBy, earlyExitBy, totalHours } = calculateStatus(record.inTime, record.outTime, settings);

            const update = {
                ...record,
                employee_id,
                status: record.status && record.status !== 'X' ? record.status : status,
                lateBy,
                earlyExitBy,
                totalHours,
                createdBy: user_id,
                updatedAt: new Date()
            };

            const result = await AttendanceLogs.findOneAndUpdate(
                { employee_id, date: record.date },
                { $set: update },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            results.push(result);
        }

        res.status(200).json({ success: true, message: `Processed ${results.length} records`, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SAVE/UPDATE COLUMN MAPPING
exports.saveColumnMapping = async (req, res) => {
    try {
        const { mappingName, mappings, user_id } = req.body;
        const result = await ColumnMappings.findOneAndUpdate(
            { mappingName, user_id },
            { $set: { mappings, updatedAt: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET SAVED MAPPINGS
exports.getMappings = async (req, res) => {
    try {
        const mappings = await ColumnMappings.find({ user_id: req.params.user_id });
        res.status(200).json({ success: true, data: mappings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
