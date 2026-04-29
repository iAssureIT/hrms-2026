const mongoose = require("mongoose");

const leaveChatLogSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
  userMessage: { type: String },
  aiResponse: { type: String },
  dataContext: { type: Object },
  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("leaveChatLogs", leaveChatLogSchema);
