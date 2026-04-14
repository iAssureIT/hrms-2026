const mongoose = require("mongoose");
const Employees = require("../employeeManagement/model.js");
const AttendanceLogs = require("../attendanceManagement/model.js");
const PayrollBatch = require("../payrollManagement/models.js").PayrollBatch;
const LeaveRequests = require("../leaveManagement/leaveApplications/model.js");
const moment = require("moment");

exports.getDashboardStats = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const startDate_14 = moment().subtract(14, "days").startOf("day").toDate();
    const endDate_today = moment().endOf("day").toDate();

    // 1. KPI Cards
    const totalEmployees = await Employees.countDocuments({});

    const logsToday = await AttendanceLogs.find({
      date: {
        $gte: moment(today).startOf("day").toDate(),
        $lte: moment(today).endOf("day").toDate(),
      },
    }).lean();

    const presentToday = logsToday.filter((l) =>
      ["P", "L", "E"].includes(l.status),
    ).length;
    const absentToday = totalEmployees - presentToday;
    const lateToday = logsToday.filter((l) => l.status === "L").length;

    const latestPayroll = await PayrollBatch.findOne({}).sort({
      year: -1,
      month: -1,
    });

    // 2. Attendance Trends (Last 14 Days)
    const trendsRaw = await AttendanceLogs.aggregate([
      { $match: { date: { $gte: startDate_14, $lte: endDate_today } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          present: {
            $sum: { $cond: [{ $in: ["$status", ["P", "L", "E"]] }, 1, 0] },
          },
          absent: { $sum: { $cond: [{ $eq: ["$status", "A"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Department Distribution
    const deptDistribution = await Employees.aggregate([
      { $group: { _id: "$departmentName", count: { $sum: 1 } } },
    ]);

    // 4. Alerts & Action Needed
    const pendingRaw = await LeaveRequests.find({ status: "PENDING" })
      .limit(5)
      .populate("employeeId", "employeeName employeeID")
      .populate("leaveTypeId", "leaveTypeName");

    const missingLogs = []; // Logic to find employees without logs today
    const employees = await Employees.find({}).limit(10).lean(); // Placeholder for quick list

    const recentRaw = await LeaveRequests.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("employeeId", "employeeName employeeID")
      .populate("leaveTypeId", "leaveTypeName");

    // Map data to match frontend expectations
    const pendingLeaves = pendingRaw.map((l) => ({
      ...l._doc,
      employeeName: l.employeeId?.employeeName,
      leaveType: l.leaveTypeId?.leaveTypeName,
      startDate: l.fromDate,
    }));

    const recentLeaves = recentRaw.map((l) => ({
      ...l._doc,
      employeeName: l.employeeId?.employeeName,
      leaveType: l.leaveTypeId?.leaveTypeName,
      startDate: l.fromDate,
      endDate: l.toDate,
    }));

    res.status(200).json({
      success: true,
      kpis: {
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        payrollStatus: latestPayroll
          ? `Cycle ${latestPayroll.month}/${latestPayroll.year}`
          : "N/A",
      },
      trends: trendsRaw,
      departmentDistribution: deptDistribution,
      pendingLeaves,
      recentLeaves,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
