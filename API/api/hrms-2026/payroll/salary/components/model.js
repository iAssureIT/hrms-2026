const mongoose = require("mongoose");

const salaryComponentSchema = new mongoose.Schema(
  {
    sequence: {
      type: Number,
      required: true,
    },

    component: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["earning", "deduction"],
      required: true,
    },

    formula: {
      type: String,
      enum: ["fixed", "percentage"],
      required: true,
    },

    byValue: {
      type: Number,
      required: true,
    },

    basedOn: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SalaryComponentMaster",
  salaryComponentSchema
);