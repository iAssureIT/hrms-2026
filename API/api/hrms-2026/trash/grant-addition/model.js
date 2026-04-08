// const mongoose = require("mongoose");

// const GrantAdditionSchema = mongoose.Schema({
//   _id: mongoose.Schema.Types.ObjectId,
//   center_id           : { type: mongoose.Schema.Types.ObjectId, ref: 'centers' },
//   centerName: String,
//   program_id             : { type: mongoose.Schema.Types.ObjectId, ref: 'programs' },
//   program: String,
//   project_id             :{ type: mongoose.Schema.Types.ObjectId, ref: 'projects' },
//   project: String,
//   activityName_id: { type: mongoose.Schema.Types.ObjectId, ref: "activities" },
//   activityName: String,
//   subactivityName_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "subactivities",
//   },
//   subactivityName: String,
//   grantReceiptNumber: Number,
//   grantReceived: Number,
//   bankDepositDate: String,
//   utrTransactionNumber: Number,
//   lhwrfBankName: String,
//   lhwrfBranchName: String,
//   lhwrfAccountNumber: Number,
//   fundingAgencyName: String,
//   //   sourceofFund: {
//   //     LHWRF: Number,
//   //     grant: Number,
//   //     CC: Number,
//   //     total: Number,
//   //     convergence: Number,
//   //   },
//   uploadTime: Date,
//   fileName: String,
//   createdAt: Date,
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
// });
// module.exports = mongoose.model("grants", GrantAdditionSchema);
