const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    leaveTypeName: {
      type: String,
      required: true,
      trim: true,
    }, // e.g. Casual Leave

    leaveCode: {
      type: String,
      required: true,
      uppercase: true,
    }, // CL, SL

    maxDaysPerYear: {
      type: Number,
      required: false,
    },

    isPaid: {
      type: Boolean,
      default: true,
    },

    carryForward: {
      type: Boolean,
      default: false,
    },

    carryForwardLimit: {
      type: Number,
      default: 0,
    },

    applicableGender: {
      type: String,
      enum: ["ALL", "MALE", "FEMALE"],
      default: "ALL",
    },

    description: {
      type: String,
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

module.exports = mongoose.model("leavetypes", leaveTypeSchema);
