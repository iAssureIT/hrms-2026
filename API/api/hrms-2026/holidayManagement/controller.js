const Holiday = require("./model");
const moment = require("moment");
const Employee = require("../employeeManagement/model");
const Attendance = require("../attendance/model");

// CREATE
exports.createHoliday = async (req, res) => {
  try {
    const data = await Holiday.create(req.body);
    // Sync Attendance
    await syncAttendanceForHoliday(data);
    res.status(200).json({ success: true, data, message: "Holiday created successfully and attendance synced" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET LIST
exports.getHolidays = async (req, res) => {
  try {
    const { location, year } = req.query;
    let query = {};

    if (year) {
      const startOfYear = moment().year(year).startOf("year").toDate();
      const endOfYear = moment().year(year).endOf("year").toDate();
      query.date = { $gte: startOfYear, $lte: endOfYear };
    }

    if (location && location !== "All" && location !== "Global") {
      query.locations = { $in: [location, "Global"] };
    }

    const data = await Holiday.find(query).sort({ date: 1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateHoliday = async (req, res) => {
  try {
    const data = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: "Holiday not found" });
    res.status(200).json({ success: true, data, message: "Holiday updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteHoliday = async (req, res) => {
  try {
    const data = await Holiday.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Holiday not found" });
    res.status(200).json({ success: true, message: "Holiday deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// BULK UPLOAD
exports.bulkUploadHolidays = async (req, res) => {
  try {
    const { holidayData, createdBy } = req.body;
    if (!holidayData || !Array.isArray(holidayData)) {
      return res.status(400).json({ success: false, message: "Invalid data format" });
    }

    const processedData = holidayData.map((item) => ({
      holidayName: item.holidayName,
      date: new Date(item.date),
      locations: Array.isArray(item.location) ? item.location : item.location.split(",").map((l) => l.trim()),
      type: item.type || "Mandatory",
      createdBy: createdBy,
    }));

    // Use insertMany with ordered: false to skip duplicates instead of failing entire batch
    const result = await Holiday.insertMany(processedData, { ordered: false });
    
    // Sync Attendance for each new holiday in the batch
    for (const holiday of result) {
      await syncAttendanceForHoliday(holiday);
    }
    
    res.status(200).json({ success: true, message: "Bulk upload successful", inserted: result.length });
  } catch (err) {
    res.status(500).json({ 
      error: err.message, 
      message: "Partial success or duplicate records avoided",
      inserted: err.result?.nInserted || 0 
    });
  }
};

// Helper to sync attendance
const syncAttendanceForHoliday = async (holiday) => {
    try {
        const holidayDate = moment(holiday.date).startOf("day").toDate();
        let employeeQuery = {};
        
        if (!holiday.locations.includes("Global")) {
            employeeQuery.subLocationName = { $in: holiday.locations };
        }

        const employees = await Employee.find(employeeQuery);
        
        for (const emp of employees) {
            await Attendance.findOneAndUpdate(
                { employeeId: emp._id, date: holidayDate },
                { 
                    status: "HOLIDAY",
                    remarks: `Holiday: ${holiday.holidayName}`,
                },
                { upsert: true, new: true }
            );
        }
    } catch (err) {
        console.error("Attendance sync error:", err);
    }
};
