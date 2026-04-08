const mongoose = require("mongoose");
const { Schema } = mongoose;

const assetTransactionSchema = new Schema(
  {
    asset_id: {
      type: Schema.Types.ObjectId,
      ref: "assets",
      required: true,
      index: true
    },

    assetID: String,
    assetName: String,

    transactionType: {
      type: String,
      enum: [
        "ALLOCATION",
        "DEALLOCATION",
        "MAINTENANCE",
        "DISPOSAL",
        "TRANSFER",
        "GATEPASS",
        "AUDIT",
        "RECONCILIATION"
      ],
      required: true,
      index: true
    },

    transactionStatus: {
      type: String,
      enum: [
        "REQUESTED",
        "APPROVAL_PENDING",
        "APPROVED",
        "REJECTED",
        "COMPLETED"
      ],
      default: "REQUESTED"
    },

    /* -------- Allocation Details -------- */

    employee: {
      _id: { type: Schema.Types.ObjectId, ref: "employees" },
      employeeID: String,
      name: String,
      mobile: String,
      email: String,
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

    /* -------- Approval -------- */

    approval: {

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


    inspectionChecklist: [
      { type: String, trim: true }
    ],

    createdBy: {
      _id: Schema.Types.ObjectId,
      name: String
    }

  },
  { timestamps: true }
);

/* -------- Indexes for Performance -------- */

assetTransactionSchema.index({ asset_id: 1, createdAt: -1 });

module.exports = mongoose.model(
  "asset_transactions",
  assetTransactionSchema
);
