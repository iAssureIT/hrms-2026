const mongoose = require("mongoose");

const leavePolicySchema = new mongoose.Schema(
  {
    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leavetypes",
      required: true,
    },

    policyName: {
      type: String,
      required: true,
      trim: true,
    }, // e.g. "Casual Leave Policy 2026"

    maxConsecutiveDays: {
      type: Number,
      default: 3,
    }, // Max days in one stretch

    minNoticeDays: {
      type: Number,
      default: 1,
    }, // Apply at least X days before

    isProbationEligible: {
      type: Boolean,
      default: false,
    }, // Can probation employees apply?

    isEncashmentAllowed: {
      type: Boolean,
      default: false,
    }, // Can unused leaves be encashed?

    maxEncashmentDays: {
      type: Number,
      default: 0,
    },

    accrualType: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "YEARLY", "NONE"],
      default: "YEARLY",
    }, // How leave is credited

    accrualDays: {
      type: Number,
      default: 0,
    }, // Days credited per accrual cycle

    applicableFrom: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("leavepolicies", leavePolicySchema);
