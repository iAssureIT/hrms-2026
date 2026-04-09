const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employees",
      required: true,
    },

    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leavetypes",
      required: true,
    },

    year: {
      type: Number,
      required: true,
    }, // e.g. 2026

    openingBalance: {
      type: Number,
      default: 0,
    }, // Balance at start of year

    earnedDays: {
      type: Number,
      default: 0,
    }, // Leave credited during the year

    usedDays: {
      type: Number,
      default: 0,
    }, // Leave consumed

    remainingBalance: {
      type: Number,
      default: 0,
    }, // openingBalance + earnedDays - usedDays

    carryForwardDays: {
      type: Number,
      default: 0,
    }, // Carried from previous year

    encashedDays: {
      type: Number,
      default: 0,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true },
);

// Unique: one balance record per employee per leave type per year
leaveBalanceSchema.index(
  { employeeId: 1, leaveTypeId: 1, year: 1 },
  { unique: true },
);

module.exports = mongoose.model("leavebalances", leaveBalanceSchema);
