const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employees', required: true },
    employeeID: { type: String, trim: true }, // For quick lookup
    date: { type: Date, required: true },
    inTime: { type: Date },
    outTime: { type: Date },
    status: { 
        type: String, 
        enum: ['P', 'A', 'H', 'W', 'O', 'U', 'L', 'E', 'C', 'F', 'X'],
        default: 'X'
    },
    totalHours: { type: Number, default: 0 },
    lateBy: { type: Number, default: 0 }, // in minutes
    earlyExitBy: { type: Number, default: 0 }, // in minutes
    overtime: { type: Number, default: 0 }, // in minutes
    earlyHours: { type: Number, default: 0 }, // in minutes
    source: { type: String, enum: ['Manual', 'Excel_Biometric', 'Excel_WFH'], default: 'Manual' },
    records: [
        {
            time: { type: Date },
            type: { type: String, enum: ['IN', 'OUT'] },
            location: { type: String }
        }
    ],
    remarks: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now },
    updateLog: [
        {
            updatedAt: { type: Date, default: Date.now },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            remarks: String
        }
    ]
});

// Compound index to ensure uniqueness per employee per day
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceLogs', attendanceSchema);
