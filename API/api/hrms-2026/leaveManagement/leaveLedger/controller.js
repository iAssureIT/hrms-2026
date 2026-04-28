const LeaveLedger = require("./model");
const Employee = require("../../employeeManagement/model");
const LeaveType = require("../leaveTypes/model");
const LeaveBalance = require("../leaveBalance/model");
const moment = require("moment");

// ADD LEDGER ENTRY (credit/debit)
exports.addLedgerEntry = async (req, res) => {
  try {
    const data = await LeaveLedger.create(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET FULL LEDGER BY EMPLOYEE (all leave types, filtered by year/month/type)
exports.getLedgerByEmployee = async (req, res) => {
  try {
    const year = Number(req.query.year || moment().year());
    const month = req.query.month ? Number(req.query.month) : null;
    const leaveTypeId = req.query.leaveTypeId;

    let query = {
      employeeId: req.params.employeeId,
      year: year,
    };

    if (month) {
      const startOfMonth = moment([year, month - 1]).startOf("month").toDate();
      const endOfMonth = moment([year, month - 1]).endOf("month").toDate();
      query.transactionDate = { $gte: startOfMonth, $lte: endOfMonth };
    }

    if (leaveTypeId && leaveTypeId !== "all") {
      query.leaveTypeId = leaveTypeId;
    }

    const data = await LeaveLedger.find(query)
      .populate("leaveTypeId")
      .populate("employeeId")
      .sort({ transactionDate: -1 });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ACCRUE MONTHLY LEAVES (1 EL per month)
exports.accrueMonthlyLeaves = async (req, res) => {
  try {
    const year = moment().year();
    const month = moment().month(); // 0-11
    const monthName = moment().format("MMMM");

    // 1. Find the Earned Leave Type
    const elType = await LeaveType.findOne({
      $or: [{ leaveCode: "EL" }, { leaveTypeName: /Earned Leave/i }],
    });

    if (!elType) {
      return res.status(404).json({ success: false, message: "Earned Leave type not defined in system." });
    }

    const employees = await Employee.find();
    let count = 0;
    let creditedEmployees = [];

    for (let emp of employees) {
      // 2. Check if already credited this month
      const existing = await LeaveLedger.findOne({
        employeeId: emp._id,
        leaveTypeId: elType._id,
        transactionType: "EARNED",
        remarks: { $regex: new RegExp(monthName + " " + year, "i") },
      });

      if (!existing) {
        // 3. Update Balance
        const balance = await LeaveBalance.findOneAndUpdate(
          { employeeId: emp._id, leaveTypeId: elType._id, year: year },
          { $inc: { earnedDays: 1, remainingBalance: 1 } },
          { new: true, upsert: true }
        );

        // 4. Add Ledger Entry
        await LeaveLedger.create({
          employeeId: emp._id,
          leaveTypeId: elType._id,
          year: year,
          transactionType: "EARNED",
          days: 1,
          balanceAfter: balance.remainingBalance,
          remarks: `Monthly Accrual: ${monthName} ${year}`,
          referenceType: "SYSTEM",
        });

        // 5. Adjust with LOP if debt exists
        await adjustLOPDebt(emp._id, elType._id, year, 1, "EL");

        count++;
        creditedEmployees.push(emp.employeeName);
      }
    }

    res.status(200).json({ 
        success: true, 
        message: count > 0 
            ? `Accrual completed. Credited ${count} employees: ${creditedEmployees.join(", ")}`
            : `Accrual completed. No new employees needed credits for ${monthName}.`,
        count,
        creditedEmployees
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD COMP OFF
exports.addCompOff = async (req, res) => {
  try {
    const { employeeId, dateWorked, days, reason, approvedBy } = req.body;
    const year = moment(dateWorked).year();

    // 1. Find Comp Off Leave Type
    const coType = await LeaveType.findOne({
      $or: [{ leaveCode: "CO" }, { leaveCode: "COMP OFF" }, { leaveTypeName: /Comp Off/i }],
    });

    if (!coType) {
      return res.status(404).json({ success: false, message: "Comp Off leave type not defined in system." });
    }

    // 2. Update Balance
    const balance = await LeaveBalance.findOneAndUpdate(
      { employeeId, leaveTypeId: coType._id, year: year },
      { $inc: { earnedDays: Number(days), remainingBalance: Number(days) } },
      { new: true, upsert: true }
    );

    // 3. Add Ledger Entry
    const data = await LeaveLedger.create({
      employeeId,
      leaveTypeId: coType._id,
      year: year,
      transactionType: "EARNED", // Comp off is earned
      days: Number(days),
      balanceAfter: balance.remainingBalance,
      remarks: `Comp Off for work on ${moment(dateWorked).format("DD MMM YYYY")}. ${reason || ""}`,
      referenceType: "MANUAL",
      createdBy: approvedBy,
    });

    // 4. Adjust with LOP if debt exists
    await adjustLOPDebt(employeeId, coType._id, year, Number(days), "CO");

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET LEDGER BY EMPLOYEE + LEAVE TYPE
exports.getLedgerByEmployeeAndType = async (req, res) => {
  try {
    const { employeeId, leaveTypeId } = req.params;
    const year = req.query.year || new Date().getFullYear();
    const data = await LeaveLedger.find({
      employeeId,
      leaveTypeId,
      year: Number(year),
    })
      .populate("leaveTypeId")
      .sort({ transactionDate: -1 });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL LEDGER ENTRIES (admin)
exports.getAllLedgerEntries = async (req, res) => {
  try {
    const data = await LeaveLedger.find()
      .populate("employeeId")
      .populate("leaveTypeId")
      .sort({ transactionDate: -1 });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE ENTRY (admin correction only)
exports.deleteLedgerEntry = async (req, res) => {
  try {
    await LeaveLedger.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Ledger entry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// HELPER: Adjust LOP Debt with newly earned leaves
const adjustLOPDebt = async (employeeId, leaveTypeId, year, newlyEarnedDays, leaveCode) => {
  try {
    // 1. Find LOP Type
    const lopType = await LeaveType.findOne({ leaveCode: "LOP" });
    if (!lopType) return;

    // 2. Find LOP Balance for the year
    const lopBalance = await LeaveBalance.findOne({
      employeeId,
      leaveTypeId: lopType._id,
      year,
    });

    // If usedDays > 0, there is debt to pay off
    if (lopBalance && lopBalance.usedDays > 0) {
      const adjustment = Math.min(newlyEarnedDays, lopBalance.usedDays);
      if (adjustment <= 0) return;

      // 3. Update LOP Balance (reduce usedDays, increase remainingBalance)
      lopBalance = await LeaveBalance.findOneAndUpdate(
        { _id: lopBalance._id },
        { $inc: { usedDays: -adjustment, remainingBalance: adjustment } },
        { new: true }
      );

      // 4. Update the newly earned leave balance (reduce remainingBalance, increase usedDays)
      const earnedBalance = await LeaveBalance.findOneAndUpdate(
        { employeeId, leaveTypeId, year },
        { $inc: { remainingBalance: -adjustment, usedDays: adjustment } },
        { new: true }
      );
      
      if (earnedBalance) {

        // 5. Create Ledger Entry for the newly earned leave (USED)
        await LeaveLedger.create({
          employeeId,
          leaveTypeId,
          year,
          transactionType: "USED",
          days: -adjustment,
          balanceAfter: earnedBalance.remainingBalance,
          remarks: `LOP adjusted using ${leaveCode} (post accrual)`,
          adjustedWith: "LOP",
          referenceType: "SYSTEM",
        });

        // 6. Create Ledger Entry for LOP (ADJUSTED)
        await LeaveLedger.create({
          employeeId,
          leaveTypeId: lopType._id,
          year,
          transactionType: "ADJUSTED",
          days: adjustment,
          balanceAfter: lopBalance.remainingBalance,
          remarks: `${adjustment} day(s) LOP cleared (post accrual)`,
          adjustedWith: leaveCode,
          referenceType: "SYSTEM",
        });
      }
    }
  } catch (err) {
    console.error("Error adjusting LOP debt:", err);
  }
};
