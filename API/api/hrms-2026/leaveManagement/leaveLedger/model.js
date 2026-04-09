const mongoose = require("mongoose");

const leaveLedgerSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
    },

    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leavetypes",
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    transactionType: {
      type: String,
      enum: [
        "OPENING",    // Start of year balance
        "EARNED",     // Credit (monthly/quarterly accrual)
        "USED",       // Debit (leave approved)
        "CARRY_FORWARD", // Carry forward from last year
        "ENCASHED",   // Leave encashment
        "LAPSED",     // Leave lapsed at year end
        "ADJUSTED",   // Manual adjustment by admin
      ],
      required: true,
    },

    days: {
      type: Number,
      required: true,
    }, // +ve for credit, -ve for debit

    balanceAfter: {
      type: Number,
      required: true,
    }, // Running balance after this transaction

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    }, // leaveApplicationId or null for manual entries

    referenceType: {
      type: String,
      enum: ["LEAVE_APPLICATION", "MANUAL", "SYSTEM"],
      default: "SYSTEM",
    },

    remarks: {
      type: String,
      trim: true,
    },

    transactionDate: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("leaveledgers", leaveLedgerSchema);
