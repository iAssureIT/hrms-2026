const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    vendorCode: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    fileName: String,
    vendorStatus: {
      type: String,
      default: "Active",
    },

    vendorInfo: {
      nameOfCompany: { type: String, trim: true },
      vendorCategory: { type: String, trim: true },
      vendorType: { type: String, trim: true },
      panNumber: { type: String, trim: true },
      gstin: { type: String, trim: true },
      tdsApplicable: { type: Boolean, default: false },
      lupinFoundationCenterName: { type: String, trim: true },
      primaryContactPersonName: { type: String, trim: true },
      designation: { type: String, trim: true },
      mobileNumber: { type: String, trim: true },
      officialEmailId: { type: String, trim: true },
    },

    bankDetails: {
      bankName: { type: String, trim: true },
      branchName: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      accountType: { type: String, trim: true },
    },

    addressDetails: {
      addressLine1: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      pinCode: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorMaster", vendorSchema);
