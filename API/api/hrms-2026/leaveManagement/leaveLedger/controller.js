const LeaveLedger = require("./model");

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
      .sort({ transactionDate: 1 });
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
      .sort({ transactionDate: 1 });
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
