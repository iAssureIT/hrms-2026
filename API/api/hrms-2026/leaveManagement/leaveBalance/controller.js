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

// GET LEAVE SUMMARY BY EMPLOYEE (Aggregated + Monthly)
exports.getSummaryByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = Number(req.query.year || moment().year());
    const month = req.query.month ? Number(req.query.month) : null;

    const balances = await LeaveBalance.find({
      employeeId,
      year: year,
    }).populate("leaveTypeId");

    // Get Ledger entries for the month if specified
    let monthlyTransactions = [];
    let openingTransactions = [];

    if (month !== null) {
      const startOfMonth = moment([year, month - 1])
        .startOf("month")
        .toDate();
      const endOfMonth = moment([year, month - 1])
        .endOf("month")
        .toDate();

      monthlyTransactions = await LeaveLedger.find({
        employeeId,
        transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
      }).populate("leaveTypeId");

      // Opening balance = all transactions before start of month
      openingTransactions = await LeaveLedger.find({
        employeeId,
        year: year,
        transactionDate: { $lt: startOfMonth },
      });
    }

    const summary = {
      earnedLeave: {
        opening: 0,
        earned: 0,
        used: 0,
        balance: 0,
        monthlyEarned: 0,
        monthlyUsed: 0,
      },
      compOff: {
        opening: 0,
        earned: 0,
        used: 0,
        balance: 0,
        monthlyEarned: 0,
        monthlyUsed: 0,
      },
      others: [],
      totalBalance: 0,
      lop: 0,
    };

    balances.forEach((b) => {
      const code = b.leaveTypeId?.leaveCode?.toUpperCase();
      const name = b.leaveTypeId?.leaveTypeName;

      // Monthly Earned/Used
      const relevantTx = monthlyTransactions.filter(
        (tx) => String(tx.leaveTypeId?._id || tx.leaveTypeId) === String(b.leaveTypeId?._id)
      );
      let mEarned = 0;
      let mUsed = 0;
      relevantTx.forEach((tx) => {
        if (tx.days > 0) mEarned += tx.days;
        else if (tx.days < 0 && tx.transactionType !== "ADJUSTED") mUsed += Math.abs(tx.days);
      });

      // Opening Balance for the month
      const typeOpeningTx = openingTransactions
        .filter((tx) => String(tx.leaveTypeId) === String(b.leaveTypeId?._id))
        .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

      const openingBal = typeOpeningTx.length > 0 ? typeOpeningTx[0].balanceAfter : 0;

      const stats = {
        opening: openingBal,
        earned: b.earnedDays + b.openingBalance,
        used: b.usedDays,
        balance: b.remainingBalance,
        monthlyEarned: mEarned,
        monthlyUsed: mUsed,
      };

      if (code === "EL" || name?.toLowerCase().includes("earned")) {
        summary.earnedLeave = stats;
      } else if (code === "CO" || name?.toLowerCase().includes("comp off")) {
        summary.compOff = stats;
      }

      if (code === "EL" || code === "CO") {
        summary.totalBalance += b.remainingBalance;
      }
      if (code === "LOP") {
        summary.lopBalance = b.remainingBalance;
      }
    });

    // Explicitly handle LOP from transactions if not in balances
    let monthlyLopUsed = 0;
    monthlyTransactions.forEach((tx) => {
      if (tx.leaveTypeId?.leaveCode === "LOP" && tx.days < 0 && tx.transactionType !== "ADJUSTED") {
        monthlyLopUsed += Math.abs(tx.days);
      }
    });

    summary.monthlyLopUsed = monthlyLopUsed;

    // LOP calculation (consistency with Monthly Report):
    // 1. Deficit in EL/CO balance (cumulative)
    // 2. Outstanding LOP debt (cumulative)
    // 3. LOP usage this month (even if already adjusted)
    const lopDebt = Math.abs(summary.lopBalance < 0 ? summary.lopBalance : 0);
    const deficit = summary.totalBalance < 0 ? Math.abs(summary.totalBalance) : 0;

    summary.lop = Math.max(lopDebt, monthlyLopUsed) + deficit;

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET MONTHLY REPORT FOR ALL EMPLOYEES
exports.getMonthlyReport = async (req, res) => {
  try {
    const year = Number(req.query.year || moment().year());
    const month = Number(req.query.month || moment().month() + 1);

    const startOfMonth = moment([year, month - 1])
      .startOf("month")
      .toDate();
    const endOfMonth = moment([year, month - 1])
      .endOf("month")
      .toDate();

    const employees = await Employee.find();
    const balances = await LeaveBalance.find({ year: year }).populate(
      "leaveTypeId",
    );

    const monthlyTransactions = await LeaveLedger.find({
      transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate("leaveTypeId");

    const report = employees.map((emp) => {
      const empBalances = balances.filter((b) => String(b.employeeId) === String(emp._id));
      const empTransactions = monthlyTransactions.filter((tx) => String(tx.employeeId) === String(emp._id));

      let elBalance = 0;
      let coBalance = 0;
      let lopBalance = 0;
      let totalUsedInMonth = 0;

      empBalances.forEach((b) => {
        const code = b.leaveTypeId?.leaveCode?.toUpperCase();
        if (code === "EL") elBalance = b.remainingBalance;
        if (code === "CO") coBalance = b.remainingBalance;
        if (code === "LOP") lopBalance = b.remainingBalance;
      });

      let monthlyLopUsed = 0;
      empTransactions.forEach((tx) => {
        if (tx.days < 0 && tx.transactionType !== "ADJUSTED") {
          totalUsedInMonth += Math.abs(tx.days);
          // If it's an LOP transaction, add to monthly LOP count
          if (tx.leaveTypeId?.leaveCode === "LOP") {
            monthlyLopUsed += Math.abs(tx.days);
          }
        }
      });

      const totalBalance = elBalance + coBalance;

      // LOP calculation (consistency with Matrix Summary):
      // 1. Deficit in EL/CO balance (cumulative)
      // 2. Outstanding LOP debt (cumulative)
      // 3. LOP usage this month (even if already adjusted)
      const lopDebt = Math.abs(lopBalance < 0 ? lopBalance : 0);
      const deficit = totalBalance < 0 ? Math.abs(totalBalance) : 0;

      let lop = Math.max(lopDebt, monthlyLopUsed) + deficit;

      return {
        _id: emp._id,
        employeeName: emp.employeeName,
        employeeID: emp.employeeID,
        elBalance,
        coBalance,
        totalBalance,
        usedInMonth: totalUsedInMonth,
        lop,
      };
    });

    res.status(200).json({ success: true, data: report });
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
      $or: [{ status: "ACTIVE" }, { status: { $exists: false } }],
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
            openingBalance: 0,
            remainingBalance: 0,
            earnedDays: 0,
            usedDays: 0,
            fileName: req.body.fileName,
            createdBy: req.body.createdBy,
            createdAt: new Date(),
          });

          await LeaveLedger.create({
            employeeId: emp._id,
            leaveTypeId: type._id,
            year: year,
            transactionType: "OPENING",
            days: 0,
            balanceAfter: 0,
            remarks: `Yearly balance initialization for ${year} (Starting with 0)`,
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
      return res
        .status(400)
        .json({ message: "Invalid data format. Expected an array." });
    }

    const validData = [];
    const invalidData = [];
    const year = req.body.year || moment().year();

    for (let row of excelData) {
      let remark = "";

      // Resolve Employee
      let employee;
      if (row.employeeID && row.employeeID !== "-") {
        const lookupValue = row.employeeID.toString().trim();
        employee = await Employee.findOne({
          $or: [
            {
              employeeID: { $regex: new RegExp("^" + lookupValue + "$", "i") },
            },
            {
              employee_id: { $regex: new RegExp("^" + lookupValue + "$", "i") },
            },
          ],
        });
        if (employee) {
          row.employeeName = employee.employeeName;
        } else {
          remark += `Employee ID '${row.employeeID}' not found in system, `;
        }
      } else {
        remark += "Employee ID missing, ";
      }

      // Resolve Leave Type
      let leaveType;
      if (row.leaveTypeCode && row.leaveTypeCode !== "-") {
        leaveType = await LeaveType.findOne({
          leaveCode: row.leaveTypeCode.toString().trim().toUpperCase(),
        });
        if (leaveType) {
          row.leaveTypeName = leaveType.leaveTypeName;
        } else {
          remark += `Leave Type Code '${row.leaveTypeCode}' not found in system, `;
        }
      } else {
        remark += "Leave Type Code missing, ";
      }

      if (!row.openingBalance && row.openingBalance !== 0)
        remark += "Opening Balance missing, ";

      if (remark) {
        invalidData.push({
          ...row,
          failedRemark: remark.trim().replace(/,$/, ""),
        });
        continue;
      }

      // Check duplicate in DB
      const exists = await LeaveBalance.findOne({
        employeeId: employee._id,
        leaveTypeId: leaveType._id,
        year: Number(row.year || year),
      });
      if (exists) {
        invalidData.push({
          ...row,
          failedRemark:
            "Balance record already exists for this employee, leave type, and year",
        });
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
      const insertedRecords = await LeaveBalance.insertMany(validData, {
        ordered: false,
      });
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
    const failedRecordsData = await FailedRecords.findOne({
      fileName: fileName,
    });
    res.status(200).json({
      goodrecords: goodrecords.map((r) => ({
        employeeName: r.employeeId?.employeeName || "-NA-",
        employeeID: r.employeeId?.employeeID || "-NA-",
        leaveTypeName: r.leaveTypeId?.leaveTypeName || "-NA-",
        leaveTypeCode: r.leaveTypeId?.leaveCode || "-NA-",
        year: r.year,
        openingBalance: r.openingBalance,
        earnedDays: r.earnedDays,
      })),
      failedRecords: failedRecordsData ? failedRecordsData.failedRecords : [],
      totalRecords:
        goodrecords.length +
        (failedRecordsData ? failedRecordsData.totalRecords : 0),
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
                { $set: { failedRecords: [] } },
              )
                .then(() => {
                  FailedRecords.updateOne(
                    { fileName: invalidData.fileName },
                    {
                      $set: { totalRecords: invalidData.totalRecords },
                      $push: { failedRecords: invalidData.FailedRecords },
                    },
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
                },
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
              },
            )
              .then(resolve)
              .catch(reject);
          }
        } else {
          const failedRecords = new FailedRecords({
            _id: new mongoose.Types.ObjectId(),
            failedRecords: invalidData.FailedRecords,
            fileName: invalidData.fileName,
            totalRecords: invalidData.totalRecords,
            createdAt: new Date(),
          });
          failedRecords
            .save()
            .then((d) => resolve(d._id))
            .catch(reject);
        }
      });
  });
};
