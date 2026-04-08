const mongoose = require("mongoose");

const centersSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  centerName: String,
  address: {
    addressLine: String,
    district: String,
    state: String,
    pincode: String,
  },
  centerInchargeDetails: {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    Name: String,
    mobileNumber: String,
    email: String,
  },
  seniorManagerDetails: {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    Name: String,
    mobileNumber: String,
    email: String,
  },
  accountPersonDetails: {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    Name: String,
    mobileNumber: String,
    email: String,
  },
  villagesCovered: Array,
  assetManagementCenterCode: String,
  onRoll: Number,
  thirdParty: Number,
  totalEmp: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt: Date,
  updateLog: [
    {
      updatedAt: Date,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    },
  ],
});

module.exports = mongoose.model("Centers", centersSchema);

// db.centers.updateOne({centerName :'Pune' },{$push:{villagesCovered:{state: 'Maharashtra',district : 'Pune',block : 'Bhor',village: 'Varavand',status: 'active'}}})
