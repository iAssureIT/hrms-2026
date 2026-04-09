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
    const { employeeId, leaveTypeId, fromDate, toDate, reason, createdBy } = req.body;

    // 1. Calculate Total Days
    const start = moment(fromDate).startOf("day");
    const end = moment(toDate).startOf("day");
    const totalDays = end.diff(start, "days") + 1;

    if (totalDays <= 0) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    // 2. Prevent Overlapping Leaves
    const overlap = await LeaveApplication.findOne({
      employeeId,
      status: { $ne: "REJECTED" },
      $or: [
        { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
      ]
    });

    if (overlap) {
      return res.status(400).json({ success: false, message: "Leave already applied for these dates" });
    }

    // 3. Validate Leave Balance
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: "Leave type not found" });
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
        openingBalance: leaveType.maxDaysPerYear || 0,
        remainingBalance: leaveType.maxDaysPerYear || 0,
        earnedDays: 0,
        usedDays: 0,
        createdBy: createdBy || employeeId // Fallback to employeeId if createdBy is missing
      });
      
      // Also create a ledger entry for initialization
      await LeaveLedger.create({
        employeeId,
        leaveTypeId,
        year,
        transactionType: "OPENING",
        days: leaveType.maxDaysPerYear || 0,
        balanceAfter: leaveType.maxDaysPerYear || 0,
        remarks: "Auto-initialized balance on first application",
        createdBy: createdBy || employeeId
      });
    }

    // 5. Validate Balance
    if (leaveType.leaveCode !== "LOP") {
      if (balance.remainingBalance < totalDays) {
        return res.status(400).json({ success: false, message: "Insufficient leave balance" });
      }
    }

    // 4. Create Application
    const data = await LeaveApplication.create({
      ...req.body,
      totalDays
    });

    // 5. If status is APPROVED (Pre-authorized), update Balance and Ledger
    if (data.status === "APPROVED") {
      const year = moment(data.fromDate).year();

      // Update Leave Balance
      const balance = await LeaveBalance.findOneAndUpdate(
        {
          employeeId: data.employeeId,
          leaveTypeId: data.leaveTypeId,
          year: year,
        },
        {
          $inc: {
            usedDays: data.totalDays,
            remainingBalance: -data.totalDays,
          },
        },
        { new: true, upsert: true }
      );

      // Create Ledger Entry
      await LeaveLedger.create({
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        year: year,
        transactionType: "USED",
        days: -data.totalDays,
        balanceAfter: balance.remainingBalance,
        referenceId: data._id,
        referenceType: "LEAVE_APPLICATION",
        remarks: `Leave applied & approved: ${data.reason}`,
        createdBy: data.createdBy,
      });

      // Attendance Integration (Placeholder)
      // TODO
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
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const data = await LeaveApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // If status changed to APPROVED, update Balance and Ledger
    if (req.body.status === "APPROVED" && previousApplication.status !== "APPROVED") {
      const year = moment(data.fromDate).year();

      // 1. Update Leave Balance
      const balance = await LeaveBalance.findOneAndUpdate(
        {
          employeeId: data.employeeId,
          leaveTypeId: data.leaveTypeId,
          year: year,
        },
        {
          $inc: {
            usedDays: data.totalDays,
            remainingBalance: -data.totalDays,
          },
        },
        { new: true, upsert: true }
      );

      // 2. Create Ledger Entry
      await LeaveLedger.create({
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        year: year,
        transactionType: "USED",
        days: -data.totalDays,
        balanceAfter: balance.remainingBalance,
        referenceId: data._id,
        referenceType: "LEAVE_APPLICATION",
        remarks: `Leave approved: ${data.reason}`,
        createdBy: req.body.approvedBy || data.createdBy,
      });

      // 3. Attendance Integration
      const start = moment(data.fromDate).startOf("day");
      const end = moment(data.toDate).startOf("day");
      const daysCount = end.diff(start, "days") + 1;

      for (let i = 0; i < daysCount; i++) {
        const currentDate = moment(start).add(i, "days").toDate();
        await Attendance.findOneAndUpdate(
          {
            employeeId: data.employeeId,
            date: currentDate,
          },
          {
            status: "LEAVE",
            remarks: `Approved ${data.leaveTypeId?.leaveCode || "Leave"}`,
          },
          { upsert: true, new: true }
        );
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
    await LeaveApplication.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
