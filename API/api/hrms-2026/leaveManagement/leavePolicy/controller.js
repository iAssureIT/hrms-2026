const LeavePolicy = require("./model");

// CREATE
exports.createLeavePolicy = async (req, res) => {
  try {
    const data = await LeavePolicy.create(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
exports.getAllLeavePolicies = async (req, res) => {
  try {
    const data = await LeavePolicy.find()
      .populate("leaveTypeId")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET BY ID
exports.getLeavePolicyById = async (req, res) => {
  try {
    const data = await LeavePolicy.findById(req.params.id).populate(
      "leaveTypeId"
    );
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateLeavePolicy = async (req, res) => {
  try {
    const data = await LeavePolicy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteLeavePolicy = async (req, res) => {
  try {
    await LeavePolicy.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Policy deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
