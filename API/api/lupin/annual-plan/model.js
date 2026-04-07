const mongoose = require("mongoose");

const AnnualPlanSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  center_id: { type: mongoose.Schema.Types.ObjectId, ref: "centers" },
  centerName: String,
  year: String,
  startDate:String,
  endDate:String,
  quarter: String,
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: "programs" },
  program: String,
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: "projects" },
  project: String,
  activityName_id: { type: mongoose.Schema.Types.ObjectId, ref: "activities" },
  activityName: String,
  subactivityName_id: { type: mongoose.Schema.Types.ObjectId,  ref: "subactivities" },
  subactivityName: String,
  unit: String,
  unitCost: Number,
  quantity: Number,
  noOfHouseholds: Number,
  noOfBeneficiaries: Number,
  totalCost: Number,
  sourceofFund: {
    LHWRF: Number,
    grant: Number,
    CC: Number,
    // total               : Number,
  },
  convergence: Number,
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
module.exports = mongoose.model("annualplans", AnnualPlanSchema);