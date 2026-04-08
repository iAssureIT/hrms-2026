const mongoose = require("mongoose");

const unitSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  fieldValue: { type: String, trim: true, required: true },
  //   imageName: { type: String, trim: true },
  //   imageUrl: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now() },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    updateLog: [
        {
            updatedAt: { type: Date, default: Date.now() },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
        }
    ]
});

module.exports = mongoose.model("units", unitSchema);
