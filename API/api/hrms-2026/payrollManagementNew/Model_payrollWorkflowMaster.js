const mongoose = require("mongoose");

const payrollWorkflowMasterSchema = new mongoose.Schema(
  {
    approvalLevel: {
      type: Number,
      required: true,
    },
    approverRole: {
      type: String,
      required: true,
      trim: true,
    },
    processName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PayrollWorkflowMaster",
  payrollWorkflowMasterSchema
);