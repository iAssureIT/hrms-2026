const LeaveApplication = require("./model");
const Employee = require("../../employeeManagement/model");
const LeaveBalance = require("../leaveBalance/model");
const LeaveLedger = require("../leaveLedger/model");
const LeaveType = require("../leaveTypes/model");
const Attendance = require("../../attendance/model");
const moment = require("moment");

// ✅ APPLY LEAVE
exports.applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveTypeId, fromDate, toDate, reason, createdBy } =
      req.body;

    // 1. Calculate Total Days
    const start = moment(fromDate).startOf("day");
    const end = moment(toDate).startOf("day");
    const totalDays = end.diff(start, "days") + 1;

    if (totalDays <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date range" });
    }

    // 2. Prevent Overlapping Leaves
    const overlap = await LeaveApplication.findOne({
      employeeId,
      status: { $ne: "REJECTED" },
      $or: [{ fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }],
    });

    if (overlap) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Leave already applied for these dates",
        });
    }

    // 3. Validate Leave Balance
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return res
        .status(404)
        .json({ success: false, message: "Leave type not found" });
    }

    const year = moment(fromDate).year();
    let balance = await LeaveBalance.findOne({ employeeId, leaveTypeId, year });

    // 4. Auto-initialize balance if missing (except for Loss of Pay)
    if (!balance && leaveType.leaveCode !== "LOP") {
      // Create initial balance from leaveType.maxDaysPerYear
      balance = await LeaveBalance.create({
        employeeId,
        leaveTypeId,
        year,
        openingBalance: 0,
        remainingBalance: 0,
        earnedDays: 0,
        usedDays: 0,
        createdBy: createdBy || employeeId,
      });

      // Also create a ledger entry for initialization
      await LeaveLedger.create({
        employeeId,
        leaveTypeId,
        year,
        transactionType: "OPENING",
        days: 0,
        balanceAfter: 0,
        remarks: "Auto-initialized balance on first application (0 balance)",
        createdBy: createdBy || employeeId,
      });
    }

    // 5. Validate Balance (Removed hard failure to allow LOP conversion later)
    /* 
    if (leaveType.leaveCode !== "LOP") {
      if (balance.remainingBalance < totalDays) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient leave balance" });
      }
    }
    */

    // 4. Create Application
    const data = await LeaveApplication.create({
      ...req.body,
      totalDays,
    });

    // 5. If status is APPROVED (Pre-authorized), update Balance and Ledger
    if (data.status === "APPROVED") {
      await deductLeaveBalance(data, data.createdBy);
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ALL (ADMIN)
exports.getAllLeaveApplications = async (req, res) => {
  try {
    const data = await LeaveApplication.find()
      .populate("leaveTypeId")
      .populate("employeeId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET MY LEAVES
exports.getMyLeaveApplications = async (req, res) => {
  try {
    const data = await LeaveApplication.find({
      employeeId: req.params.employeeId,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE STATUS (APPROVE / REJECT)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const previousApplication = await LeaveApplication.findById(req.params.id);
    if (!previousApplication) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    const data = await LeaveApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    // Case A: If status changed to APPROVED (Deduct Balance)
    if (req.body.status === "APPROVED" && previousApplication.status !== "APPROVED") {
      await deductLeaveBalance(data, req.body.approvedBy || data.createdBy);
    }
    
    // Case B: If status changed FROM APPROVED to REJECTED/CANCELLED (Restore Balance)
    if (previousApplication.status === "APPROVED" && (req.body.status === "REJECTED" || req.body.status === "CANCELLED")) {
      await restoreLeaveBalance(data, req.body.rejectedBy || req.body.approvedBy);
    }

    // 4. Attendance Integration
    if (req.body.status === "APPROVED") {
      const start = moment(data.fromDate).startOf("day");
      const end = moment(data.toDate).startOf("day");
      const daysCount = end.diff(start, "days") + 1;

      for (let i = 0; i < daysCount; i++) {
        const currentDate = moment(start).add(i, "days").toDate();
        await Attendance.findOneAndUpdate(
          { employeeId: data.employeeId, date: currentDate },
          { status: "LEAVE", remarks: `Approved Leave (${data.totalDays} days)` },
          { upsert: true, new: true }
        );
      }
    } else if (req.body.status === "REJECTED" || req.body.status === "CANCELLED") {
       // Clear attendance if it was previously set to LEAVE
       const start = moment(data.fromDate).startOf("day");
       const end = moment(data.toDate).startOf("day");
       const daysCount = end.diff(start, "days") + 1;
       for (let i = 0; i < daysCount; i++) {
         const currentDate = moment(start).add(i, "days").toDate();
         await Attendance.findOneAndDelete({ employeeId: data.employeeId, date: currentDate, status: "LEAVE" });
       }
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE
exports.deleteLeaveApplication = async (req, res) => {
  try {
    const app = await LeaveApplication.findById(req.params.id);
    if (app && app.status === "APPROVED") {
        await restoreLeaveBalance(app, "SYSTEM_DELETE");
    }
    await LeaveApplication.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Helper Functions for Production Readiness ---

async function deductLeaveBalance(data, actorId) {
    const year = moment(data.fromDate).year();
    let remainingToDeduct = data.totalDays;

    const elType = await LeaveType.findOne({ $or: [{ leaveCode: "EL" }, { leaveTypeName: /Earned Leave/i }] });
    const coType = await LeaveType.findOne({ $or: [{ leaveCode: "CO" }, { leaveCode: "COMP OFF" }, { leaveTypeName: /Comp Off/i }] });
    const lopType = await LeaveType.findOne({ leaveCode: "LOP" });

    const hierarchy = [coType, elType];
    
    for (let type of hierarchy) {
      if (!type || remainingToDeduct <= 0) continue;
      let bal = await LeaveBalance.findOne({ employeeId: data.employeeId, leaveTypeId: type._id, year: year });
      if (!bal) bal = await LeaveBalance.create({ employeeId: data.employeeId, leaveTypeId: type._id, year: year, openingBalance: 0, remainingBalance: 0 });

      if (bal.remainingBalance > 0) {
        const toUse = Math.min(bal.remainingBalance, remainingToDeduct);
        const updatedBal = await LeaveBalance.findOneAndUpdate(
          { _id: bal._id },
          { $inc: { usedDays: toUse, remainingBalance: -toUse } },
          { new: true }
        );

        await LeaveLedger.create({
          employeeId: data.employeeId,
          leaveTypeId: type._id,
          year: year,
          transactionType: "USED",
          days: -toUse,
          balanceAfter: updatedBal.remainingBalance,
          referenceId: data._id,
          referenceType: "LEAVE_APPLICATION",
          remarks: `Leave approved (Partially/Fully from ${type.leaveCode})`,
          createdBy: actorId,
        });
        remainingToDeduct -= toUse;
      }
    }

    if (remainingToDeduct > 0 && lopType) {
        let lopBal = await LeaveBalance.findOne({ employeeId: data.employeeId, leaveTypeId: lopType._id, year: year });
        if (!lopBal) lopBal = await LeaveBalance.create({ employeeId: data.employeeId, leaveTypeId: lopType._id, year: year, openingBalance: 0, remainingBalance: 0 });

        const updatedLop = await LeaveBalance.findOneAndUpdate(
            { _id: lopBal._id },
            { $inc: { usedDays: remainingToDeduct, remainingBalance: -remainingToDeduct } },
            { new: true }
        );

        await LeaveLedger.create({
            employeeId: data.employeeId,
            leaveTypeId: lopType._id,
            year: year,
            transactionType: "USED",
            days: -remainingToDeduct,
            balanceAfter: updatedLop.remainingBalance,
            referenceId: data._id,
            referenceType: "LEAVE_APPLICATION",
            remarks: `Leave approved (Converted to LOP)`,
            createdBy: actorId,
        });
    }
}

async function restoreLeaveBalance(data, actorId) {
    const year = moment(data.fromDate).year();
    const entries = await LeaveLedger.find({ referenceId: data._id, referenceType: "LEAVE_APPLICATION", transactionType: "USED" });

    for (let entry of entries) {
        const amountToRestore = Math.abs(entry.days);
        
        const updatedBal = await LeaveBalance.findOneAndUpdate(
            { employeeId: data.employeeId, leaveTypeId: entry.leaveTypeId, year: year },
            { $inc: { usedDays: -amountToRestore, remainingBalance: amountToRestore } },
            { new: true }
        );

        await LeaveLedger.create({
            employeeId: data.employeeId,
            leaveTypeId: entry.leaveTypeId,
            year: year,
            transactionType: "RESTORED",
            days: amountToRestore,
            balanceAfter: updatedBal.remainingBalance,
            referenceId: data._id,
            referenceType: "LEAVE_APPLICATION",
            remarks: `Leave reversal: Balance restored`,
            createdBy: actorId,
        });
    }
}
