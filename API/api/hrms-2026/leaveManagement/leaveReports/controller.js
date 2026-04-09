const LeaveBalance = require("../leaveBalance/model");
const LeaveApplication = require("../leaveApplications/model");
const LeaveLedger = require("../leaveLedger/model");
const mongoose = require("mongoose");

// GET SUMMARY BY EMPLOYEE
exports.getEmployeeLeaveSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year || new Date().getFullYear();

    const summary = await LeaveBalance.find({
      employeeId: employeeId,
      year: Number(year),
    }).populate("leaveTypeId");

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET LEAVE USAGE TRENDS (Monthly)
exports.getLeaveUsageTrends = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const trends = await LeaveApplication.aggregate([
      {
        $match: {
          status: "APPROVED",
          fromDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$fromDate" },
          totalLeaves: { $sum: 1 },
          totalDays: { $sum: "$totalDays" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, data: trends });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET DEPARTMENT-WISE LEAVE ANALYSIS
exports.getDepartmentLeaveAnalysis = async (req, res) => {
  try {
    // This requires employee department info which resides in the 'employees' collection
    const analysis = await LeaveApplication.aggregate([
      { $match: { status: "APPROVED" } },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeInfo",
        },
      },
      { $unwind: "$employeeInfo" },
      {
        $group: {
          _id: "$employeeInfo.department",
          totalLeaves: { $sum: 1 },
          totalDays: { $sum: "$totalDays" },
        },
      },
    ]);

    res.status(200).json({ success: true, data: analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
