const mongoose = require("mongoose");

const payrollSummarySchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: mongoose.Types.ObjectId,
    },
    payrollBatchNo: {
      type: String,     //202601-B4
      required: true,
      //unique: true,
      trim: true,
    },
    payrollCycleNumber: {
      type: Number,   //1,2,3,4
      default: 1,
    }, 
    payrollMonth:  {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    payrollYear: {
      type: Number,
      required: true,
    },

    payrollStartDate: {
      type: Date,
      required: true,
    },

    payrollEndDate: {
      type: Date,
      required: true,
    },

    businessUnits: [
      {
        type: String,
        trim: true,
      },
    ],

    locations: [
      {
        type: String,
        trim: true,
      },
    ],

    departments: [
      {
        type: String,
        trim: true,
      },
    ],

    designations: [
      {
        type: String,
        trim: true,
      },
    ],

    jobTypes: [
      {
        type: String,
        trim: true,
      },
    ],

    jobTimings: [
      {
        type: String,
        trim: true,
      },
    ],

    totalEmployees: {
      type: Number,
      default: 0,
    },

    totalGross: {
      type: String,
      default: 0,
    },

    totalDeduction: {
      type: String,
      default: 0,
    },

    totalNet: {
      type: String,
      default: 0,
    },

    payrollEligibleEmployees: {
      type: Number,
      default: 0,
    },

    blockedEmployees: {
      type: Number,
      default: 0,
    },

    currentStage: {
      type: String,
      enum: [
        "EmployeeSelection",
        "PayrollProcessing",
        "Approval",
        "Completed",
      ],
      default: "EmployeeSelection",
    },

    payrollStatus: {
      type: String,
      enum: [
        "Draft",
        "In Progress",
        "Processed",
        "Completed",
        "Cancelled",
      ],
      default: "Draft",
    },

    approvalStatus: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },

    approvsalLog: [
      {
        workflowLevel: { type: String, trim: true, },
        userId: { type: mongoose.Schema.Types.Mixed, },
        userName: { type: String, trim: true, },
        empId: { type: String, trim: true, },
        role: { type: String, trim: true, },
        action: { type: String, enum: ["Approved", "Rejected"], },
        remarks: { type: String, trim: true, default: "", },
        dateTime: { type: Date, default: Date.now, },
      }
    ],

    createdBy: {
      userId: {
        type: mongoose.Schema.Types.Mixed,
      },

      userName: {
        type: String,
        trim: true,
      },
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updateLog:[
      {
        updatedBy: {
          type: mongoose.Schema.Types.Mixed,
          ref: "Users",     
        },
        userName: {
          type: String,
          trim: true  
        },
        updatedDateTime: {
          type: Date,
          default: Date.now
        },
        changeRemarks: {
          type: String,
          trim: true, 
        },  
        changedFields: [
          {
            fieldName: { type: String, trim: true },  
            oldValue: { type: mongoose.Schema.Types.Mixed },
            newValue: { type: mongoose.Schema.Types.Mixed },
          }
        ]
      } 
    ]
  }
);

module.exports = mongoose.model("PayrollSummary", payrollSummarySchema);


