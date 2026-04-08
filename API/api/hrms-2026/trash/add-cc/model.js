const mongoose = require("mongoose");

// const ContributorDetailsSchema = new mongoose.Schema(
//   {
//     contributorName: String,
//     village: String,
//     aadhaarNo: Number,
//     amountDeposited: Number,
//   },
//   { _id: false }
// );

const AddCCSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  approvalNo: Number,
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
  fundReceiptNumber: Number,
  amountReceivedDate: String,
  amountReceived: Number,
  depositSlipNumber: Number,
  utrTransactionNumber: Number,
  lhwrfBankName: String,
  lhwrfBranchName: String,
  lhwrfAccountNumber: Number,
  uploadTime: Date,
  fileName: String,
  createdAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});
module.exports = mongoose.model("community-contributions", AddCCSchema);
