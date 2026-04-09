const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employees', required: true },
    employeeName: { type: String },
    employeeID: { type: String },
    leaveType: { type: String, enum: ['Annual Leave', 'Sick Leave', 'Maternity Leave', 'Casual Leave', 'LOP'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: String }, // e.g. "3 Days", "Half Day"
    reason: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    appliedAt: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    approvedAt: { type: Date }
});

module.exports = mongoose.model('LeaveRequests', leaveRequestSchema);
