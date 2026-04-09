const mongoose = require('mongoose');

const attendanceSettingsSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    shifts: [
        {
            shiftName: { type: String, required: true },
            inTime: { type: String, required: true }, // Format HH:mm
            outTime: { type: String, required: true },
            gracePeriod: { type: Number, default: 15 }, // in minutes
            halfDayThreshold: { type: Number, default: 240 }, // in minutes (e.g. 4 hours)
            fullDayThreshold: { type: Number, default: 480 }, // in minutes (e.g. 8 hours)
            weeklyOffs: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }]
        }
    ],
    holidays: [
        {
            date: { type: Date, required: true },
            reason: { type: String }
        }
    ],
    center_id: { type: mongoose.Schema.Types.ObjectId, ref: 'centers' }, // Optional: rules per center
    company_id: { type: String }, // For multi-tenant if applicable
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AttendanceSettings', attendanceSettingsSchema);
