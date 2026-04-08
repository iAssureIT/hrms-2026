const mongoose = require("mongoose");

const bankDetailsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  accountHolderName: String,
  bankName: String,
  bankAccountNumber: Number,
  branchName: String,
  // accountType                 : String,
  ifscCode: String,
  projectRemark: String,
  // branchAddress               : String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt: Date,
  updateLog: [
    {
      updatedAt: Date,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    },
  ],
});

module.exports = mongoose.model("bankDetails", bankDetailsSchema);
