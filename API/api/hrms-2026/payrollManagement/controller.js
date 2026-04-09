const mongoose = require("mongoose");
const { SalaryStructure, SalaryMaster, PayrollBatch, PayrollRecord } = require("./models.js");
const AttendanceLogs = require("../attendanceManagement/model.js");
const Employees = require("../employeeManagement/model.js");
const moment = require("moment");

// Helper: Calculate Statutory Deductions (India Standard)
const calculateStatutory = (gross, basic) => {
    let pf = 0;
    let esic = 0;
    let pt = 0;

    // PF: 12% of Basic or 1800 (12% of 15000 ceiling)
    pf = basic * 0.12;
    if (pf > 1800) pf = 1800;

    // ESIC: 0.75% of Gross if Gross <= 21000
    if (gross <= 21000) {
        esic = gross * 0.0075;
    }

    // PT: Slabs (Simplified Maharashtra style)
    if (gross > 10000) pt = 200;
    else if (gross > 7500) pt = 175;

    return { pf, esic, pt };
};

// INITIATE PAYROLL RUN
exports.initiatePayrollRun = async (req, res) => {
    try {
        const { month, year, user_id } = req.body;
        const startDate = moment([year, month - 1]).startOf('month').toDate();
        const endDate = moment([year, month - 1]).endOf('month').toDate();
        const daysInMonth = moment([year, month - 1]).daysInMonth();

        // 1. Create/Find Batch
        let batch = await PayrollBatch.findOneAndUpdate(
            { month, year },
            { $set: { processedBy: user_id, processedAt: new Date(), status: 'Draft' } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 2. Clear old records for this batch
        await PayrollRecord.deleteMany({ batch_id: batch._id });

        // 3. Process each employee
        const employees = await Employees.find({}).lean();
        const salaryMasters = await SalaryMaster.find({}).lean();
        const attendanceLogs = await AttendanceLogs.find({
            date: { $gte: startDate, $lte: endDate }
        }).lean();

        const payrollRecords = [];

        for (const emp of employees) {
            const master = salaryMasters.find(m => m.employee_id.toString() === emp._id.toString());
            if (!master) continue;

            // Attendance Inputs
            const empLogs = attendanceLogs.filter(l => l.employee_id.toString() === emp._id.toString());
            const presentDays = empLogs.filter(l => ['P', 'L', 'E', 'H', 'W'].includes(l.status)).length;
            const lopDays = daysInMonth - presentDays;

            // Calculation
            const dailyRate = master.grossSalary / daysInMonth;
            const actualGross = master.grossSalary - (dailyRate * lopDays);
            
            // Simplified Components
            const basic = actualGross * 0.5; // Assuming 50% Basic
            const hra = actualGross * 0.2; // Assuming 20% HRA
            const otherAllowance = actualGross - basic - hra;

            const { pf, esic, pt } = calculateStatutory(actualGross, basic);

            const record = new PayrollRecord({
                _id: new mongoose.Types.ObjectId(),
                batch_id: batch._id,
                employee_id: emp._id,
                employeeName: emp.employeeName,
                employeeID: emp.employeeID,
                departmentName: emp.departmentName,
                paidDays: presentDays,
                lopDays: lopDays,
                earnings: [
                    { name: 'Basic', amount: Math.round(basic) },
                    { name: 'HRA', amount: Math.round(hra) },
                    { name: 'Special Allowance', amount: Math.round(otherAllowance) }
                ],
                deductions: [
                    { name: 'PF', amount: Math.round(pf) },
                    { name: 'ESIC', amount: Math.round(esic) },
                    { name: 'PT', amount: Math.round(pt) }
                ],
                grossSalary: Math.round(actualGross),
                totalDeductions: Math.round(pf + esic + pt),
                netSalary: Math.round(actualGross - (pf + esic + pt))
            });

            payrollRecords.push(record);
        }

        await PayrollRecord.insertMany(payrollRecords);
        
        // Update batch total
        const totalNet = payrollRecords.reduce((sum, r) => sum + r.netSalary, 0);
        batch.totalNetPayout = totalNet;
        await batch.save();

        res.status(200).json({ success: true, batch, totalRecords: payrollRecords.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET PAYROLL BATCH DATA
exports.getPayrollBatch = async (req, res) => {
    try {
        const { month, year } = req.body;
        const batch = await PayrollBatch.findOne({ month, year });
        if (!batch) return res.status(200).json({ success: false, message: "No batch found" });

        const records = await PayrollRecord.find({ batch_id: batch._id });
        res.status(200).json({ success: true, batch, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// APPROVE BATCH
exports.approveBatch = async (req, res) => {
    try {
        const { batch_id, user_id } = req.body;
        const batch = await PayrollBatch.findByIdAndUpdate(batch_id, {
            status: 'Approved',
            approvedBy: user_id,
            approvedAt: new Date()
        }, { new: true });
        
        await PayrollRecord.updateMany({ batch_id }, { status: 'Approved' });
        res.status(200).json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SALARY MASTER CRUD
exports.upsertSalaryMaster = async (req, res) => {
    try {
        const data = req.body;
        const result = await SalaryMaster.findOneAndUpdate(
            { employee_id: data.employee_id },
            { $set: data },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
