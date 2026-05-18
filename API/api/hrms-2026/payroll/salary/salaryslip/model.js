const mongoose = require("mongoose");

const salarySlipSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },

    salaryMonth: {
      type: String,
      required: true,
    },

    salaryData: [
      {
        components: String,
        amount: Number,
      },
    ],

    totalEarnings: Number,

    totalDeductions: Number,

    netSalary: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmpSalarySlip",
  salarySlipSchema
);