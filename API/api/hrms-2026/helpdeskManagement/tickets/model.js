const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketID: {
      type: String, // e.g., TKT-1001
      unique: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      // Optional to support admin-created tickets or cases where employee record isn't yet linked
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Attendance Issues", "Payroll Issues", "Leave Issues", "General"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // references the HR/Admin user
    },
    assignedAt: {
      type: Date,
    },
    slaDeadline: {
      type: Date,
    },
    breached: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tickets", ticketSchema);
