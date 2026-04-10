const mongoose = require('mongoose');

const systemConfigurationSchema = new mongoose.Schema({
    attendance: {
        standardWorkHours: { type: Number, default: 8 },
        lateArrivalGracePeriod: { type: Number, default: 15 }, // in minutes
        halfDayMinHours: { type: Number, default: 4 },
        earlyDeparturePenalty: { type: String, default: 'None' },
        strictIPTracking: { type: Boolean, default: false },
        autoAbsentMissingLogs: { type: Boolean, default: false },
        requireOvertimeApproval: { type: Boolean, default: true }
    },
    leave: {
        leaveTypes: [
            {
                name: { type: String, required: true },
                maxLeaves: { type: Number, default: 0 },
                carryForward: { type: Boolean, default: false },
                carryForwardLimit: { type: Number, default: 0 }
            }
        ],
        approvalWorkflow: { type: String, default: 'Manager -> HR' }
    },
    payroll: {
        salaryCycle: { type: String, default: 'Monthly' },
        overtimeCalculation: { type: Boolean, default: true },
        taxDeductionSettings: {
            standardDeduction: { type: Number, default: 0 },
            ptaxEnabled: { type: Boolean, default: true }
        },
        payslipGenerationDate: { type: Number, default: 1 } // day of month
    },
    notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
        events: {
            leaveRequest: { type: Boolean, default: true },
            attendanceAlerts: { type: Boolean, default: true },
            payrollProcessed: { type: Boolean, default: true }
        }
    },
    general: {
        companyWorkingDays: [{ type: String, default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }],
        timeZone: { type: String, default: 'Asia/Kolkata' },
        dateFormat: { type: String, default: 'DD-MM-YYYY' },
        defaultLanguage: { type: String, default: 'English' }
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
}, { timestamps: true });

module.exports = mongoose.model('systemconfigurations', systemConfigurationSchema);
