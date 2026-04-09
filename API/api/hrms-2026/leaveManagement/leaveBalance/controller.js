const LeaveBalance = require("./model");
const Employee = require("../../employeeManagement/model");
const LeaveType = require("../leaveTypes/model");
const LeaveLedger = require("../leaveLedger/model");
const moment = require("moment");

// CREATE or INITIALIZE balance for employee
exports.createLeaveBalance = async (req, res) => {
  try {
    const data = await LeaveBalance.create(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL balances (admin)
exports.getAllLeaveBalances = async (req, res) => {
  try {
    const data = await LeaveBalance.find()
      .populate("employeeId")
      .populate("leaveTypeId")
      .sort({ year: -1 });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET BALANCE BY EMPLOYEE (current year or specific year)
exports.getBalanceByEmployee = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const data = await LeaveBalance.find({
      employeeId: req.params.employeeId,
      year: Number(year),
    }).populate("leaveTypeId");
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET BALANCE BY EMPLOYEE + LEAVE TYPE + YEAR
exports.getSpecificBalance = async (req, res) => {
  try {
    const { employeeId, leaveTypeId, year } = req.query;
    const data = await LeaveBalance.findOne({
      employeeId,
      leaveTypeId,
      year: Number(year),
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE BALANCE (deduct / credit)
exports.updateLeaveBalance = async (req, res) => {
  try {
    const data = await LeaveBalance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SYNC ALL BALANCES for current year
exports.syncAllBalances = async (req, res) => {
  try {
    const year = req.body.year || moment().year();
    const createdBy = req.body.createdBy;

    const employees = await Employee.find(); // Handle records without status field
    const leaveTypes = await LeaveType.find({ 
      leaveCode: { $ne: "LOP" },
      $or: [{ status: "ACTIVE" }, { status: { $exists: false } }] 
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (let emp of employees) {
      for (let type of leaveTypes) {
        // Check if balance already exists
        const exists = await LeaveBalance.findOne({
          employeeId: emp._id,
          leaveTypeId: type._id,
          year: year,
        });

        if (!exists) {
          const balance = await LeaveBalance.create({
            employeeId: emp._id,
            leaveTypeId: type._id,
            year: year,
            openingBalance: type.maxDaysPerYear || 0,
            remainingBalance: type.maxDaysPerYear || 0,
            earnedDays: 0,
            usedDays: 0,
            createdBy: createdBy,
          });

          await LeaveLedger.create({
            employeeId: emp._id,
            leaveTypeId: type._id,
            year: year,
            transactionType: "OPENING",
            days: type.maxDaysPerYear || 0,
            balanceAfter: type.maxDaysPerYear || 0,
            remarks: `Yearly balance initialization for ${year}`,
            createdBy: createdBy,
          });

          createdCount++;
        } else {
          skippedCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Sync completed. Created: ${createdCount}, Skipped: ${skippedCount}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteLeaveBalance = async (req, res) => {
  try {
    await LeaveBalance.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Balance record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
