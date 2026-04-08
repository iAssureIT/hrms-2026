const mongoose = require("mongoose");

const FundReceiptSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
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
  fundReceiptNumber: Number,
  amountReceivedDate: String,
  amountReceived: Number,
  utrTransactionNumber: Number,
  lhwrfBankName: String,
  branchName: String,
  accountNumber: Number,
  uploadTime: Date,
  fileName: String,
  createdAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});
module.exports = mongoose.model("funds", FundReceiptSchema);
