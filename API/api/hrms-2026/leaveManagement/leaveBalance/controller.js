const mongoose = require("mongoose");
const LeaveBalance = require("./model");
const Employee = require("../../employeeManagement/model");
const LeaveType = require("../leaveTypes/model");
const LeaveLedger = require("../leaveLedger/model");
const FailedRecords = require("../../failedRecords/model.js");
const moment = require("moment");

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

// SYNC ALL BALANCES for current year
exports.syncAllBalances = async (req, res) => {
  try {
    const year = req.body.year || moment().year();
    const createdBy = req.body.createdBy;

    const employees = await Employee.find(); // Handle records without status field
    const leaveTypes = await LeaveType.find({ 
      leaveCode: { $ne: "LOP" },
      $or: [{ status: "ACTIVE" }, { status: { $exists: false } }] 
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (let emp of employees) {
      for (let type of leaveTypes) {
        // Check if balance already exists
        const exists = await LeaveBalance.findOne({
          employeeId: emp._id,
          leaveTypeId: type._id,
          year: year,
        });

        if (!exists) {
          const balance = await LeaveBalance.create({
            employeeId: emp._id,
            leaveTypeId: type._id,
            year: year,
            openingBalance: type.maxDaysPerYear || 0,
            remainingBalance: type.maxDaysPerYear || 0,
            earnedDays: 0,
            usedDays: 0,
            createdBy: createdBy,
          });

          await LeaveLedger.create({
            employeeId: emp._id,
            leaveTypeId: type._id,
            year: year,
            transactionType: "OPENING",
            days: type.maxDaysPerYear || 0,
            balanceAfter: type.maxDaysPerYear || 0,
            remarks: `Yearly balance initialization for ${year}`,
            createdBy: createdBy,
          });

          createdCount++;
        } else {
          skippedCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Sync completed. Created: ${createdCount}, Skipped: ${skippedCount}`,
    });
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

// BULK UPLOAD leave balances
exports.bulkUpload = async (req, res) => {
  try {
    const { data: excelData, fileName, createdBy } = req.body;
    if (!Array.isArray(excelData)) {
      return res.status(400).json({ message: "Invalid data format. Expected an array." });
    }

    const validData = [];
    const invalidData = [];
    const year = req.body.year || moment().year();

    for (let row of excelData) {
      let remark = "";

      // Mandatory field checks
      if (!row.employeeID || row.employeeID === "-") remark += "Employee ID missing, ";
      if (!row.leaveTypeCode || row.leaveTypeCode === "-") remark += "Leave Type Code missing, ";
      if (!row.openingBalance && row.openingBalance !== 0) remark += "Opening Balance missing, ";

      if (remark) {
        invalidData.push({ ...row, failedRemark: remark.trim().replace(/,$/, "") });
        continue;
      }

      // Resolve Employee
      const employee = await Employee.findOne({ employeeID: row.employeeID.toString().trim() });
      if (!employee) {
        invalidData.push({ ...row, failedRemark: `Employee ID '${row.employeeID}' not found in system` });
        continue;
      }

      // Resolve Leave Type
      const leaveType = await LeaveType.findOne({ leaveCode: row.leaveTypeCode.toString().trim().toUpperCase() });
      if (!leaveType) {
        invalidData.push({ ...row, failedRemark: `Leave Type Code '${row.leaveTypeCode}' not found in system` });
        continue;
      }

      // Check duplicate in DB
      const exists = await LeaveBalance.findOne({
        employeeId: employee._id,
        leaveTypeId: leaveType._id,
        year: Number(row.year || year),
      });
      if (exists) {
        invalidData.push({ ...row, failedRemark: "Balance record already exists for this employee, leave type, and year" });
        continue;
      }

      validData.push({
        employeeId: employee._id,
        employeeName: employee.employeeName,
        employeeID: employee.employeeID,
        leaveTypeId: leaveType._id,
        leaveTypeName: leaveType.leaveTypeName,
        leaveTypeCode: leaveType.leaveCode,
        year: Number(row.year || year),
        openingBalance: Number(row.openingBalance) || 0,
        remainingBalance: Number(row.openingBalance) || 0,
        earnedDays: Number(row.earnedDays) || 0,
        usedDays: 0,
        fileName: fileName,
        createdBy: createdBy,
      });
    }

    if (validData.length > 0) {
      const insertedRecords = await LeaveBalance.insertMany(validData, { ordered: false });
      // Create opening ledger entries
      for (let rec of insertedRecords) {
        await LeaveLedger.create({
          employeeId: rec.employeeId,
          leaveTypeId: rec.leaveTypeId,
          year: rec.year,
          transactionType: "OPENING",
          days: rec.openingBalance,
          balanceAfter: rec.openingBalance,
          remarks: `Bulk upload opening balance for ${rec.year}`,
          createdBy: createdBy,
        });
      }
    }

    if (invalidData.length > 0) {
      const failedPayload = {
        FailedRecords: invalidData,
        fileName: fileName,
        totalRecords: invalidData.length,
      };
      await insertFailedRecords(failedPayload, req.body.updateBadData);
    }

    res.status(200).json({
      success: true,
      completed: true,
      message: "Leave balance bulk upload completed",
      validCount: validData.length,
      invalidCount: invalidData.length,
    });
  } catch (error) {
    console.error("Leave Balance Bulk Upload Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// FILE DETAILS for bulk upload results
exports.filedetails = async (req, res) => {
  try {
    const { fileName } = req.params;
    const goodrecords = await LeaveBalance.find({ fileName: fileName })
      .populate("employeeId", "employeeName employeeID")
      .populate("leaveTypeId", "leaveTypeName leaveCode");
    const failedRecordsData = await FailedRecords.findOne({ fileName: fileName });
    res.status(200).json({
      goodrecords: goodrecords.map(r => ({
        employeeName: r.employeeId?.employeeName || "-NA-",
        employeeID: r.employeeId?.employeeID || "-NA-",
        leaveTypeName: r.leaveTypeId?.leaveTypeName || "-NA-",
        leaveTypeCode: r.leaveTypeId?.leaveCode || "-NA-",
        year: r.year,
        openingBalance: r.openingBalance,
        earnedDays: r.earnedDays,
      })),
      failedRecords: failedRecordsData ? failedRecordsData.failedRecords : [],
      totalRecords: goodrecords.length + (failedRecordsData ? failedRecordsData.totalRecords : 0),
    });
  } catch (error) {
    console.error("File Details Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};

var insertFailedRecords = async (invalidData, updateBadData) => {
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
              ).then(() => {
                FailedRecords.updateOne(
                  { fileName: invalidData.fileName },
                  {
                    $set: { totalRecords: invalidData.totalRecords },
                    $push: { failedRecords: invalidData.FailedRecords },
                  }
                ).then(resolve).catch(reject);
              }).catch(reject);
            } else {
              FailedRecords.updateOne(
                { fileName: invalidData.fileName },
                {
                  $set: { totalRecords: invalidData.totalRecords },
                  $push: { failedRecords: invalidData.FailedRecords },
                }
              ).then(resolve).catch(reject);
            }
          } else {
            FailedRecords.updateOne(
              { fileName: invalidData.fileName },
              {
                $set: { totalRecords: invalidData.totalRecords },
                $push: { failedRecords: invalidData.FailedRecords },
              }
            ).then(resolve).catch(reject);
          }
        } else {
          const failedRecords = new FailedRecords({
            _id: new mongoose.Types.ObjectId(),
            failedRecords: invalidData.FailedRecords,
            fileName: invalidData.fileName,
            totalRecords: invalidData.totalRecords,
            createdAt: new Date(),
          });
          failedRecords.save().then((d) => resolve(d._id)).catch(reject);
        }
      });
  });
};
