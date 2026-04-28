const mongoose = require("mongoose");

const leaveApplicationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
    },

    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leavetypes",
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    remarks: {
      type: String,
    },
    adjustedWith: {
      type: String,
      trim: true,
    },

    leaveBreakdown: [
      {
        leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "leavetypes" },
        leaveCode: String,
        days: Number,
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("leaveapplications", leaveApplicationSchema);
