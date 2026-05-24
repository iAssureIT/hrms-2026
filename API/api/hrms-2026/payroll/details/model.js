// models/PayrollDetails.js

const mongoose =
  require("mongoose");

const payrollDetailsSchema =
  new mongoose.Schema(
    {
      payrollMonth: {
        type: String,
        required: true,
      },

      payrollDate: {
        type: String,
        required: true,
      },

      departments: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: "Department",
        },
      ],

      totalEmployees: {
        type: Number,
        default: 0,
      },

      totalPayrollAmount: {
        type: Number,
        default: 0,
      },

      processedBy: {
        type: String,
        default: "",
      },

      payrollStatus: {
        type: String,
        default: "Completed",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "PayrollDetails",
    payrollDetailsSchema
  );