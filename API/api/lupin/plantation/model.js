const mongoose = require("mongoose");

const plantationSchema = mongoose.Schema({
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
  subActivity_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subactivities",
  },

  farmerDetails: {
    farmerName: String,
    aadharCard: String,
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
  plantationDetails: [
    {
      plantationDate: String,
      sitePhotos: [],
      speciesDetails: [
        {
          speciesName: String,
          numberOfSaplings: Number,
          numberOfTreesSurvived: Number,
          avgHeight: Number,
          unitofHeight: String,
          avgDiameter: Number,
          unitofDiameter: String,
          yeild: Number,
          unitofYeild: String,
          income: Number,
          unitofIncome: String,
        },
      ],
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

module.exports = mongoose.model("plantation", plantationSchema);
