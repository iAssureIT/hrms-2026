const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LEAVE", "HALFDAY", "HOLIDAY", "WEEKOFF"],
      default: "PRESENT",
    },
    checkInTime: {
      type: String, // e.g. "09:00 AM"
    },
    checkOutTime: {
      type: String, // e.g. "06:00 PM"
    },
    totalHours: {
      type: Number,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

// Unique index: one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("attendances", attendanceSchema);
