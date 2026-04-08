const mongoose = require("mongoose");
const { Schema } = mongoose;

const maintenanceSchema = new Schema(
  {
    maintenanceID: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // Reference to master asset
    asset_id: { 
      type: Schema.Types.ObjectId, 
      ref: "assets", 
      required: true, 
      index: true 
    },

    // Denormalized for performance (standard across your modules)
    assetID: String,
    assetName: String,
    category: String,
    subCategory: String,

    // Link to global transaction ledger
    transaction_id: { 
      type: Schema.Types.ObjectId, 
      ref: "asset_transactions",
      index: true
    },

    location: {
      center: {
        _id: { type: Schema.Types.ObjectId, ref: "Centers" },
        name: String
      },
      subLocation: {
        _id: { type: Schema.Types.ObjectId, ref: "locationSubcategories" },
        name: String
      }
    },

    department: {
      department: {
        _id: { type: Schema.Types.ObjectId, ref: "departmentmasters" },
        name: String
      },
      subDepartment: {
        _id: { type: Schema.Types.ObjectId, ref: "subdepartmentmasters" },
        name: String
      }
    },

    issue: {
      description: { type: String, trim: true },
      reportedDate: { type: Date, default: Date.now, index: true },
      isAMC: { type: Boolean, default: false }
    },

    vendor: {
        _id: { type: Schema.Types.ObjectId, ref: "vendors" }, // Link to master vendors if exists
        name: String,
        contact: String
    },

    costs: {
      serviceFee: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
      isTaxExempt: { type: String, default: "No" },
      spareParts: [
        {
          partName: String,
          qty: Number,
          unitPrice: Number,
          totalAmount: Number
        }
      ],
      totalAmount: { type: Number, default: 0, index: true }
    },

    docs: [String],

    status: {
      type: String,
      enum: ["AWAITING_APPROVAL", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "UNDER_OBSERVATION", "CANCELLED", "REJECTED"],
      default: "AWAITING_APPROVAL",
      index: true
    },

    // Unified Approval Structure (Matches Assets/Transactions)
    approval: {
      status: { 
        type: String, 
        enum: ["PENDING", "APPROVED", "REJECTED"], 
        default: "PENDING" 
      },
      requestedBy: { _id: Schema.Types.ObjectId, name: String },
      approvedBy: { _id: Schema.Types.ObjectId, name: String },
      approvedAt: Date,
      remarks: String
    },

    completion: {
      actualDate: Date,
      completionRemarks: String
    },

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
        },
        action: String,
        status: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("assetMaintenance", maintenanceSchema);
