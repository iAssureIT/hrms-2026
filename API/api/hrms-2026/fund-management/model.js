const mongoose = require("mongoose");

const FundReceiptSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  fundType: String,
  approvalNo: String,
  paymentType: String,
  center_id: { type: mongoose.Schema.Types.ObjectId, ref: "centers" },
  centerName: String,
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: "programs" },
  program: String,
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: "projects" },
  project: String,
  activityName_id: { type: mongoose.Schema.Types.ObjectId, ref: "activities" },
  activityName: String,
  subactivityName_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subactivities",
  },
  subactivityName: String,
  fundingAgencyName: String,
  fundReceiptNumber: String,
  amountReceivedDate: String,
  amountReceived: Number,
  depositSlipNumber: String,
  utrTransactionNumber: String,
  bank_id: Array,
  lhwrfBankName: String,
  lhwrfBranchName: String,
  lhwrfAccountNumber: Number,
  totalContributors: Number,
  contributorData: [
    {
      contributorName: String,
      village: String,
      aadhaarNo: Number,
      amountDeposited: Number,
      uploadTime: Date,
      fileName: String,
    },
  ],
  uploadTime: Date,
  fileName: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt: Date,
  updateLog: [
    {
      updatedAt: Date,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    },
  ],
});
module.exports = mongoose.model("fundReceipts", FundReceiptSchema);