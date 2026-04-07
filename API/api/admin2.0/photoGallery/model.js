const mongoose = require("mongoose");

const PhotoSchema = mongoose.Schema({
  _id         : mongoose.Schema.Types.ObjectId,
  name        : String,
  type        : String,
  description : String,
  image       : String,
  createdBy   : { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt   : Date,
  updateLog   : [
    {
      updatedAt: Date,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    },
  ],
});

module.exports = mongoose.model("photos", PhotoSchema);
