const mongoose = require("mongoose");
const Holiday = require("./model");
const moment = require("moment");
const Employee = require("../employeeManagement/model");
const Attendance = require("../attendance/model");
const FailedRecords = require("../failedRecords/model.js");

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

    if (location && location !== "All") {
      if (location === "Global") {
        query.locations = { $in: [/^Global$/i] };
      } else {
        query.locations = { $in: [new RegExp(`^${location}$`, "i"), /^Global$/i] };
      }
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

// BULK UPLOAD — full validData/invalidData/failedRecords pattern
exports.bulkUploadHolidays = async (req, res) => {
  try {
    const { data: excelData, fileName, createdBy } = req.body;

    if (!Array.isArray(excelData)) {
      return res.status(400).json({ message: "Invalid data format. Expected an array." });
    }

    const validData = [];
    const invalidData = [];

    for (let row of excelData) {
      let remark = "";

      // Mandatory field checks
      if (!row.holidayName || row.holidayName === "-") remark += "Holiday Name missing, ";
      if (!row.date || row.date === "-") remark += "Date missing, ";
      if (!row.location || row.location === "-") remark += "Location missing, ";

      if (remark) {
        invalidData.push({ ...row, failedRemark: remark.trim().replace(/,$/, "") });
        continue;
      }

      // Parse date — support DD/MM/YYYY and YYYY-MM-DD
      let parsedDate = moment(row.date, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"], true);
      if (!parsedDate.isValid()) {
        parsedDate = moment(row.date);
      }
      if (!parsedDate.isValid()) {
        invalidData.push({ ...row, failedRemark: `Invalid date format: '${row.date}'. Use DD/MM/YYYY or YYYY-MM-DD` });
        continue;
      }

      // Parse locations — comma-separated string or array
      let locations = [];
      if (Array.isArray(row.location)) {
        locations = row.location.map((l) => l.trim()).filter(Boolean);
      } else {
        locations = row.location.toString().split(",").map((l) => l.trim()).filter(Boolean);
      }

      // Validate type
      const type = row.type && ["Mandatory", "Optional"].includes(row.type) ? row.type : "Mandatory";

      // Check duplicate in DB
      const exists = await Holiday.findOne({
        holidayName: row.holidayName.toString().trim(),
        date: parsedDate.toDate(),
      });
      if (exists) {
        invalidData.push({
          ...row,
          failedRemark: `Holiday '${row.holidayName}' on '${row.date}' already exists`,
        });
        continue;
      }

      validData.push({
        holidayName: row.holidayName.toString().trim(),
        date: parsedDate.toDate(),
        locations,
        type,
        fileName,
        createdBy,
      });
    }

    // Insert valid records
    if (validData.length > 0) {
      const inserted = await Holiday.insertMany(validData, { ordered: false });
      // Sync Attendance for each new holiday
      for (const holiday of inserted) {
        await syncAttendanceForHoliday(holiday);
      }
    }

    // Persist failed records
    if (invalidData.length > 0) {
      await insertFailedRecords(
        { FailedRecords: invalidData, fileName, totalRecords: invalidData.length },
        req.body.updateBadData
      );
    }

    res.status(200).json({
      success: true,
      completed: true,
      message: "Holiday bulk upload completed",
      validCount: validData.length,
      invalidCount: invalidData.length,
    });
  } catch (err) {
    console.error("Holiday Bulk Upload Error:", err);
    res.status(500).json({ error: err.message, success: false });
  }
};

// FILE DETAILS for bulk upload results
exports.filedetails = async (req, res) => {
  try {
    const { fileName } = req.params;

    const goodrecords = await Holiday.find({ fileName });
    const failedRecordsData = await FailedRecords.findOne({ fileName });

    res.status(200).json({
      goodrecords: goodrecords.map((r) => ({
        holidayName: r.holidayName,
        date: moment(r.date).format("DD/MM/YYYY"),
        location: Array.isArray(r.locations) ? r.locations.join(", ") : (r.locations || "-NA-"),
        type: r.type,
      })),
      failedRecords: failedRecordsData ? failedRecordsData.failedRecords : [],
      totalRecords:
        goodrecords.length + (failedRecordsData ? failedRecordsData.totalRecords : 0),
    });
  } catch (err) {
    console.error("Holiday File Details Error:", err);
    res.status(500).json({ error: err.message, success: false });
  }
};

// ─── Helper: sync Attendance for a holiday ───────────────────────────────────
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

// ─── Helper: persist failed records (same pattern as leaveBalance) ────────────
const insertFailedRecords = async (invalidData, updateBadData) => {
  return new Promise(function (resolve, reject) {
    FailedRecords.find({ fileName: invalidData.fileName })
      .exec()
      .then((data) => {
        if (data.length > 0) {
          if (data[0].failedRecords.length > 0) {
            if (updateBadData) {
              FailedRecords.updateOne(
                { fileName: invalidData.fileName },
                { $set: { failedRecords: [] } }
              )
                .then(() => {
                  FailedRecords.updateOne(
                    { fileName: invalidData.fileName },
                    {
                      $set: { totalRecords: invalidData.totalRecords },
                      $push: { failedRecords: invalidData.FailedRecords },
                    }
                  )
                    .then(resolve)
                    .catch(reject);
                })
                .catch(reject);
            } else {
              FailedRecords.updateOne(
                { fileName: invalidData.fileName },
                {
                  $set: { totalRecords: invalidData.totalRecords },
                  $push: { failedRecords: invalidData.FailedRecords },
                }
              )
                .then(resolve)
                .catch(reject);
            }
          } else {
            FailedRecords.updateOne(
              { fileName: invalidData.fileName },
              {
                $set: { totalRecords: invalidData.totalRecords },
                $push: { failedRecords: invalidData.FailedRecords },
              }
            )
              .then(resolve)
              .catch(reject);
          }
        } else {
          const failedRecord = new FailedRecords({
            _id: new mongoose.Types.ObjectId(),
            failedRecords: invalidData.FailedRecords,
            fileName: invalidData.fileName,
            totalRecords: invalidData.totalRecords,
            createdAt: new Date(),
          });
          failedRecord.save().then((d) => resolve(d._id)).catch(reject);
        }
      });
  });
};
