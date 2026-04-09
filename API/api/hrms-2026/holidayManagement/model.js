const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    holidayName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    locations: [
      {
        type: String, // Storing Location Names or IDs (e.g., Global, New York, London, Bangalore)
        trim: true,
      },
    ],
    type: {
      type: String,
      enum: ["Mandatory", "Optional"],
      default: "Mandatory",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

// Ensure a holiday belongs to a specific date (can have multiple holidays on same date if locations differ)
holidaySchema.index({ date: 1, holidayName: 1 }, { unique: true });

module.exports = mongoose.model("holidays", holidaySchema);
