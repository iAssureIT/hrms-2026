const mongoose = require("mongoose");

const ticketHistorySchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tickets",
      required: true,
    },
    action: {
      type: String, // Created, Assigned, Status Updated, Resolved, Closed
      required: true,
    },
    details: {
      type: String,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tickethistories", ticketHistorySchema);
