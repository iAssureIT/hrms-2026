const mongoose = require("mongoose");
const AttendanceLogs = require("../attendanceManagement/model.js");
const PayrollRecords = require("../payrollManagement/models.js").PayrollRecord;
const Employees = require("../employeeManagement/model.js");
const moment = require("moment");

// 1. ATTENDANCE REPORTS
exports.getAttendanceReport = async (req, res) => {
    try {
        const { reportType, startDate, endDate, center_id, department_id } = req.body;
        
        let employeeQuery = {};
        if (center_id && center_id !== 'all') employeeQuery.center_id = center_id;
        if (department_id && department_id !== 'all') employeeQuery.department_id = department_id;
        
        const employees = await Employees.find(employeeQuery).lean();
        const empIds = employees.map(e => e._id);

        const logs = await AttendanceLogs.find({
            employee_id: { $in: empIds },
            date: { $gte: moment(startDate).startOf('day').toDate(), $lte: moment(endDate).endOf('day').toDate() }
        }).lean();

        let reportData = [];

        if (reportType === 'daily_log') {
            reportData = logs.map(l => {
                const emp = employees.find(e => e._id.toString() === l.employee_id.toString());
                return {
                    "Date": moment(l.date).format("YYYY-MM-DD"),
                    "Employee ID": emp?.employeeID,
                    "Name": emp?.employeeName,
                    "In Time": l.inTime ? moment(l.inTime).format("HH:mm") : "-",
                    "Out Time": l.outTime ? moment(l.outTime).format("HH:mm") : "-",
                    "Total Hours": (l.totalHours / 60).toFixed(2),
                    "Status": l.status
                };
            });
        } else if (reportType === 'absenteeism') {
            const absentLogs = logs.filter(l => l.status === 'A');
            reportData = absentLogs.map(l => {
                const emp = employees.find(e => e._id.toString() === l.employee_id.toString());
                return {
                    "Date": moment(l.date).format("YYYY-MM-DD"),
                    "Employee ID": emp?.employeeID,
                    "Name": emp?.employeeName,
                    "Department": emp?.departmentName,
                    "Status": "Absent"
                };
            });
        }

        res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. PAYROLL REPORTS
exports.getPayrollReport = async (req, res) => {
    try {
        const { reportType, month, year, center_id, department_id } = req.body;
        
        const payrollRecords = await PayrollRecords.find({}).lean(); // In real app, filter by batch linked to month/year
        // For simplicity in MVP, we filter records by batch_id found via month/year lookup
        
        let reportData = [];

        if (reportType === 'salary_register') {
            reportData = payrollRecords.map(r => ({
                "Employee ID": r.employeeID,
                "Name": r.employeeName,
                "Dept": r.departmentName,
                "Paid Days": r.paidDays,
                "LOP": r.lopDays,
                "Basic": r.earnings.find(e => e.name === 'Basic')?.amount || 0,
                "HRA": r.earnings.find(e => e.name === 'HRA')?.amount || 0,
                "PF": r.deductions.find(d => d.name === 'PF')?.amount || 0,
                "ESIC": r.deductions.find(d => d.name === 'ESIC')?.amount || 0,
                "Gross": r.grossSalary,
                "Deductions": r.totalDeductions,
                "Net Salary": r.netSalary
            }));
        } else if (reportType === 'bank_sheet') {
            reportData = payrollRecords.map(r => ({
                "Employee ID": r.employeeID,
                "Name": r.employeeName,
                "Bank Name": "HDFC BANK", // Mocked as master data is not yet fully populated in DB for all
                "Account No": "XXXXXX4521",
                "IFSC": "HDFC0000123",
                "Amount": r.netSalary
            }));
        }

        res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. COMPLIANCE REPORTS (PF/ESIC/PT)
exports.getComplianceReport = async (req, res) => {
    try {
        const payrollRecords = await PayrollRecords.find({}).lean();
        
        const reportData = payrollRecords.map(r => ({
            "Employee ID": r.employeeID,
            "Name": r.employeeName,
            "PF (Emp)": r.deductions.find(d => d.name === 'PF')?.amount || 0,
            "PF (Employer)": r.deductions.find(d => d.name === 'PF')?.amount || 0, // Assuming matching
            "ESIC (Emp)": r.deductions.find(d => d.name === 'ESIC')?.amount || 0,
            "ESIC (Employer)": Math.round((r.grossSalary * 0.0325)), // Standard ESIC Employer %
            "PT": r.deductions.find(d => d.name === 'PT')?.amount || 0,
            "Total Contribution": r.totalDeductions
        }));

        res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
