const LeaveLedger = require("./model");
const Employee = require("../../employeeManagement/model");
const LeaveType = require("../leaveTypes/model");
const LeaveBalance = require("../leaveBalance/model");
const LeaveApplication = require("../leaveApplications/model");
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

// GET FULL LEDGER BY EMPLOYEE (all leave types, current year)
exports.getLedgerByEmployee = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const data = await LeaveLedger.find({
      employeeId: req.params.employeeId,
      year: Number(year),
    })
      .populate("leaveTypeId")
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
        count++;
      }
    }

    res.status(200).json({ success: true, message: `Accrual completed. Credited ${count} employees.` });
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

// MANUAL CLEANUP (Simplification of leave types)
exports.manualCleanup = async (req, res) => {
  try {
    // 1. Deactivate UNUSED leave types
    const deact = await LeaveType.updateMany(
      { leaveCode: { $in: ["SL", "CL"] } },
      { $set: { status: "INACTIVE" } }
    );

    // 2. Cleanup Priyanka Bhanavase's accidental sick leave records
    const priyankaId = "69e7214579d9a3a8196e7418";
    const slType = await LeaveType.findOne({ leaveCode: "SL" });

    if (slType) {
      await LeaveBalance.deleteMany({ employeeId: priyankaId, leaveTypeId: slType._id });
      await LeaveApplication.deleteMany({ employeeId: priyankaId, leaveTypeId: slType._id });
      await LeaveLedger.deleteMany({ employeeId: priyankaId, leaveTypeId: slType._id });
    }

    res.status(200).json({ 
      success: true, 
      message: `System cleaned up. ${deact.modifiedCount} types deactivated. Priyanka's erroneous SL records removed.` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
