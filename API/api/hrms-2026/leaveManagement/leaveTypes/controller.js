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

// GET BY ID
exports.getLeaveTypeById = async (req, res) => {
  try {
    const data = await LeaveType.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Leave type not found" });
    }
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

exports.list_leave_types_with_limits = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  let query = {};

  if (req.body.searchText && req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i");
    query.$or = [{ leaveTypeName: searchRegex }, { leaveCode: searchRegex }];
  }

  LeaveType.countDocuments(query)
    .then((totalRecs) => {
      let leaveQuery = LeaveType.find(query);
      if (!req.body.removePagination) {
        leaveQuery = leaveQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }

      leaveQuery
        .sort({ createdAt: -1 })
        .then((data) => {
          var tableData = data.map((item, index) => {
            return {
              _id: item._id,
              leaveTypeName: item.leaveTypeName,
              leaveCode: `<span class="bg-blue-50 text-[#3c8dbc] text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">${item.leaveCode}</span>`,
              isPaid: item.isPaid
                ? `<span class="text-green-600 font-bold text-xs uppercase flex items-center justify-center gap-1"><i class="fas fa-check mr-1" style="font-size: 10px;"></i> Paid</span>`
                : `<span class="text-red-500 font-bold text-xs uppercase flex items-center justify-center gap-1"><i class="fas fa-times mr-1" style="font-size: 10px;"></i> Unpaid</span>`,
              carryForward: item.carryForward
                ? `<div><span class="text-green-600 font-bold text-xs uppercase">Yes</span>${item.carryForwardLimit > 0 ? `<div class="text-[10px] text-gray-400 font-bold">Limit: ${item.carryForwardLimit}</div>` : ""}</div>`
                : `<span class="text-gray-400 font-bold text-xs uppercase">No</span>`,
            };
          });
          res.status(200).json({
            totalRecs: totalRecs,
            tableData: tableData,
            success: true,
          });
        })
        .catch((error) => {
          console.log("Error in list_leave_types_with_limits => ", error);
          res.status(500).json({ errorMsg: error.message, success: false });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};
