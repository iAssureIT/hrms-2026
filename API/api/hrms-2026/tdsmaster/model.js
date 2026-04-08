const mongoose = require("mongoose");

const tdsMasterSchema = new mongoose.Schema(
  {
    sectionCode: {
      type: String,
      required: true,
      trim: true,
    },
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    tdsRate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tdsmaster", tdsMasterSchema);
