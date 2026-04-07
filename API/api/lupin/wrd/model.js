const mongoose = require("mongoose");

const wrdSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  centerName: String,
  center_id: { type: mongoose.Schema.Types.ObjectId, ref: "Centers" },
  program: String,
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: "programs" },

  project: String,
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: "projects" },

  activity: String,
  activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "activities" },

  subActivity: String,
  subActivity_id: { type: mongoose.Schema.Types.ObjectId, ref: "subactivities" },
  
  typeOfStructure: String,

  farmerDetails: {
    landType    : String,
    farmerName  : String,
    aadharCard  : String,
  },
  locationDetails: {
    gatKasara: String,
    village: String,
    block: String,
    district: String,
    state: String,
    country: String,
    latitude: String,
    longitude: String,
  },
  wrdDetails: [
    {
      constructionDate: String,
      soilType: String,
      currentStatus: String,
      beneficiaryNos: Number,
      areaIrrigated: String,
      costOfStructure: {
        LHWRF: Number,
        beneficiary: Number,
        other: Number,
      },
      measurementOfStructure: {
        height: Number,
        length: Number,
        width: Number,
      },
      measurementOfSubmergence: {
        depth: Number,
        length: Number,
        width: Number,
      },
      sitePhotos: [],
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt: Date,
  updateLog: [
    {
      updatedAt: Date,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    },
  ],
});

module.exports = mongoose.model("wrd", wrdSchema);
