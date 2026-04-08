const mongoose = require("mongoose");
const { Schema } = mongoose;

const assetDisposalSchema = new Schema(
  {
    asset_id: {
      type: Schema.Types.ObjectId,
      ref: "assets",
      required: true
    },
    disposalType: {
      type: String,
      required: true,
      enum: ["Public/Private Sale", "Scrap", "Donation", "Transfer", "Lost/Damage"]
    },
    disposalDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    disposalValue: {
      type: Number,
      required: true,
      default: 0
    },
    nbvAtDisposal: {
      type: Number,
      required: true
    },
    financialImpact: {
      type: Number, // positive for gain, negative for loss
      required: true
    },
    uploadProof: [String], // URLs of documents
    makerRemarks: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
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
    approvedBy: {
      _id: { type: Schema.Types.ObjectId, ref: "users" },
      name: String,
      at: Date
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

module.exports = mongoose.model("assetdisposals", assetDisposalSchema);
