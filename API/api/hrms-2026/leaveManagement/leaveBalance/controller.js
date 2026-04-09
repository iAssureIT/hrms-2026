const LeaveBalance = require("./model");

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

// DELETE
exports.deleteLeaveBalance = async (req, res) => {
  try {
    await LeaveBalance.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Balance record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
