const mongoose = require("mongoose");

const approvalLevelSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  approverLevel: String,
  maxCost: Number,
  approverAuthRole: String,
  approverAuth_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt: Date,
  updateLog    :   [
    {
        updatedAt   : Date,
        updatedBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
    }
  ]
});

module.exports = mongoose.model("utilizationapprovallevel", approvalLevelSchema);
