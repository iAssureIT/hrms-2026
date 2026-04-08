const mongoose = require("mongoose");
const { Schema } = mongoose;

const gatePassSchema = new Schema(
  {
    passNo: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    gateLocation: { type: String, default: "Main Gate" },
    issuedBy: { type: String },
    bearerDetails: {
      fullName: { type: String, required: true },
      empID: { type: String, required: true },
      department: { type: String },
      contact: { type: String },
      validFrom: { type: Date },
      validTo: { type: Date }
    },
    assets: [
      {
        assetName: { type: String },
        assetID: { type: String },
        model: { type: String },
        quantity: { type: Number, default: 1 },
        type: { type: String, enum: ["RETURNABLE", "NON-RETURNABLE"], default: "RETURNABLE" },
        reason: { type: String }
      }
    ],
    authorizedBy: { type: String },
    remarks: { type: String },
    status: {
      type: String,
      enum: ["Approved", "In Transit", "Pending", "Returned", "Overdue", "Rejected"],
      default: "Pending"
    },
    center_id: {
      type: Schema.Types.ObjectId,
      ref: "Centers",
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },
    updateLog: [
      {
        updatedBy: { type: Schema.Types.ObjectId, ref: "users" },
        updatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("gatepasses", gatePassSchema);
