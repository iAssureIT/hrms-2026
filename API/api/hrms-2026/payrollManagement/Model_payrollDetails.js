const mongoose = require("mongoose");

const payrollDetailsSchema = new mongoose.Schema({

    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId,
    },

    payrollBatchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PayrollSummary",
        required: true,
    },

  payrollBatchNo: {
    type: String,
    required: true,
    trim: true,
  },

  employeeID: {
    type: String,
    required: true,
    index: true,
  },

  employeeFullName: {
    type: String,
    required: true,
    trim: true,
  },

  payrollEligibility: {
    type: String,
    enum: ["Eligible", "Blocked", "Hold"],
    default: "Eligible",
  },

  attendanceStatus: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
  },

  salaryStructureStatus: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },

  employeeProfile: {
    businessUnit: String,
    location: String,
    department: String,
    designation: String,
    jobType: String,
    jobTiming: String,
    employeeCategory: String,
    joiningDate: Date,
  },

  payrollBatchCycle: {
    payrollMonth: Number,
    payrollYear: Number,
    payrollStartDate: Date,
    payrollEndDate: Date,
  },

  employeeSalaryStructure: {
    annualCTC: {
      type: Number,
      default: 0,
    },

    monthlyCTC: {
      type: Number,
      default: 0,
    },

    grossMonthlySalary: {
      type: Number,
      default: 0,
    },

    salaryComponents: [
      {
        componentCode: String,
        componentName: String,
        monthlyAmount: Number,
        annualAmount: Number,
      },
    ],
  },

  attendanceSummary: {
    totalCalendarDays: {
      type: Number,
      default: 0,
    },

    totalWorkingDays: {
      type: Number,
      default: 0,
    },

    totalPresentDays: {
      type: Number,
      default: 0,
    },

    totalAbsentDays: {
      type: Number,
      default: 0,
    },

    totalWeeklyOffs: {
      type: Number,
      default: 0,
    },

    totalPublicHolidays: {
      type: Number,
      default: 0,
    },

    totalHalfDays: {
      type: Number,
      default: 0,
    },

    overtimeHours: {
      type: Number,
      default: 0,
    },

    attendanceFetchedDateTime: Date,
  },

  leaveLedger: {
    annualLeaveAllocation: {
      type: Number,
      default: 0,
    },

    leavesTakenTillDate: {
      type: Number,
      default: 0,
    },

    balanceLeaves: {
      type: Number,
      default: 0,
    },

    leavesTakenThisMonth: {
      type: Number,
      default: 0,
    },

    paidLeavesThisMonth: {
      type: Number,
      default: 0,
    },

    unpaidLeavesThisMonth: {
      type: Number,
      default: 0,
    },
  },

  calculatedNetSalary: {
    grossSalary: {
      type: Number,
      default: 0,
    },

    salaryForPaidDays: {
      type: Number,
      default: 0,
    },

    unpaidLeaveDeduction: {
      type: Number,
      default: 0,
    },

    pfDeduction: {
      type: Number,
      default: 0,
    },

    ptDeduction: {
      type: Number,
      default: 0,
    },

    esicDeduction: {
      type: Number,
      default: 0,
    },

    tdsDeduction: {
      type: Number,
      default: 0,
    },

    totalDeductions: {
      type: Number,
      default: 0,
    },

    employerPFContribution: {
      type: Number,
      default: 0,
    },

    employerESICContribution: {
      type: Number,
      default: 0,
    },

    netSalaryPayable: {
      type: Number,
      default: 0,
    },

    payrollCalculatedDateTime: Date,
  },

  createdBy: {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Users",
    },
    userName: {
        type: String,   
        trim: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,      
    },

});

// Useful indexes
payrollDetailsSchema.index({
  payrollBatchId: 1,
});

payrollDetailsSchema.index({
  payrollBatchNo: 1,
});

payrollDetailsSchema.index({
  employeeId: 1,
});

payrollDetailsSchema.index({
  payrollBatchId: 1,
  employeeId: 1,
}, {
  unique: true,
});

module.exports = mongoose.model(
  "PayrollDetails",
  payrollDetailsSchema
);