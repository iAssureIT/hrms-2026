const mongoose = require("mongoose");
const { Schema } = mongoose;

const assetSchema = new Schema(
  {
    assetID: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    assetName: {
      type: String,
      required: true,
      trim: true
    },

    brand: { type: String, trim: true },
    model: { type: String, trim: true },

    serialNumber: {
      type: String,
      trim: true,
      index: true
    },

    vendor: {
      _id: { type: Schema.Types.ObjectId, ref: "vendors" },
      name: String
    },

    warrantyDate: Date,

    reviewRemarks: String,

    category: String,
    category_id: { type: Schema.Types.ObjectId, ref: "assetcategorymasters" },

    subCategory: String,
    subCategory_id: { type: Schema.Types.ObjectId, ref: "assetsubcategories" },

    purchaseCost: Number,
    purchaseDate: Date,

    residualValue: Number,
    usefulLife: Number,

    description: String,
    invoiceNumber: String,

    specifications: [
      {
        label: String,
        value: String
      }
    ],

    docs: [String],

    assetImage: [
      {
        url: String,
        fileName: String
      }
    ],

    assetStatus: {
      type: String,
      enum: [
        "ASSET_APPROVAL_PENDING",
        "ASSET_APPROVAL_REJECTED",
        "ACTIVE",
        "INACTIVE",
        "ALLOCATION_PENDING",
        "ALLOCATED",
        "MAINTENANCE",
        "DISPOSED",
        "MISSING"
      ],
      default: "ASSET_APPROVAL_PENDING",
      index: true
    },

    previousStatusBeforeMissing: String,

    /* -------- Asset Approval -------- */

    assetApproval: {

      status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
      },

      requestedBy: {
        _id: Schema.Types.ObjectId,
        name: String
      },

      approvedBy: {
        _id: Schema.Types.ObjectId,
        name: String
      },

      approvedAt: Date,

      remarks: String
    },

    /* -------- Current Allocation -------- */

    currentAllocation: {

      employee: {
        _id: { type: Schema.Types.ObjectId, ref: "employees" },
        employeeID: String,
        name: String,
        email: String,
        mobile: String,
        designation: String
      },

      center: {
        _id: { type: Schema.Types.ObjectId, ref: "Centers" },
        name: String
      },

      subLocation: {
        _id: { type: Schema.Types.ObjectId, ref: "locationSubcategories" },
        name: String
      },

      department: {
        _id: { type: Schema.Types.ObjectId, ref: "departmentmasters" },
        name: String
      },

      subDepartment: {
        _id: { type: Schema.Types.ObjectId, ref: "subdepartmentmasters" },
        name: String
      },

      allocatedAt: Date
    },

    /* -------- Asset Status History -------- */

    statusHistory: [
      {
        action: String,

        status: String,

        performedBy: {
          _id: Schema.Types.ObjectId,
          name: String
        },

        remarks: String,

        date: {
          type: Date,
          default: Date.now
        }
      }
    ],

    createdBy: {
      _id: Schema.Types.ObjectId,
      name: String
    },

    updateLog: [
      {
        updatedBy: {
          _id: Schema.Types.ObjectId,
          name: String
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]

  },
  { timestamps: true }
);

module.exports = mongoose.model("assets", assetSchema);
