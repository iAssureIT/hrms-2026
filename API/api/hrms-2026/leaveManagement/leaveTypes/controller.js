const LeaveType = require("./model");

// CREATE
exports.createLeaveType = async (req, res) => {
  try {
    const data = await LeaveType.create(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
exports.getLeaveTypes = async (req, res) => {
  try {
    const data = await LeaveType.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateLeaveType = async (req, res) => {
  try {
    const data = await LeaveType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteLeaveType = async (req, res) => {
  try {
    await LeaveType.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
