const mongoose = require("mongoose");

const employeeSalarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },

    salaryData: [
      {
        components: {
          type: String,
        },

        amount: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmployeeSalary",
  employeeSalarySchema
);