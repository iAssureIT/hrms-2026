const mongoose = require("mongoose");
const PayrollSummary = require("./Model_payrollSummary.js");
const PayrollDetails = require("./Model_payrollDetails.js");
const EmployeeSalary = require("../payroll/salary/structure/model.js");
const AttendanceLogs = require("../attendanceManagement/model.js");
const Holiday = require("../holidayManagement/model.js");

const moment = require("moment");

exports.createPayrollBatch = async (req, res) => {
  try {
    const {
      payrollMonth, 
      payrollYear,
      payrollStartDate,
      payrollEndDate,
      businessUnits,
      locations,
      departments,
      designations,
      jobTypes,
      jobTimings,
      createdBy,
      remarks,
      employeeData,
    } = req.body;

    console.log("Received createPayrollBatch request with data:", req.body);

    const existingBatch = await PayrollSummary.findOne({
      payrollMonth,
      payrollYear,
      payrollStartDate,
      payrollEndDate,
      businessUnits,
      locations,
      departments,
      designations,
      jobTypes,
      jobTimings,
    });

    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: `
          Payroll batch already exists for:
          Month: ${payrollMonth}
          Year: ${payrollYear}
          Business Units: ${businessUnits?.join(", ") || "N/A"}
          Locations: ${locations?.join(", ") || "N/A"}
          Departments: ${departments?.join(", ") || "N/A"}
          Designations: ${designations?.join(", ") || "N/A"}
          Job Types: ${jobTypes?.join(", ") || "N/A"}
          Job Timings: ${jobTimings?.join(", ") || "N/A"}
        `.trim(),
      });
    }

    // Generate batch number
    const lastPayroll = await PayrollSummary
      .findOne({ payrollYear, payrollMonth })
      .sort({ payrollCycleNumber: -1 })
      .select("payrollCycleNumber");

    const payrollCycleNumber = (lastPayroll?.payrollCycleNumber || 0) + 1;
    const payrollBatchNo = `PAY-${payrollYear}${String(payrollMonth).padStart(2, "0")}-${String(payrollCycleNumber).padStart(3, "0")}`;

    // Create Summary
    const payrollBatch = await PayrollSummary.create({
      _id: new mongoose.Types.ObjectId(),
      payrollBatchNo,
      payrollCycleNumber,
      payrollMonth,
      payrollYear,
      payrollStartDate,
      payrollEndDate,
      businessUnits,
      locations,
      departments,
      designations,
      jobTypes,
      jobTimings,
      totalEmployees: employeeData?.length || 0,
      payrollEligibleEmployees:
        employeeData?.length || 0,
      blockedEmployees: 0,
      createdBy,
      remarks,
    });

    const employeeIds = employeeData.map(emp => emp.employeeID);

    const salaryStructures = await EmployeeSalary.find({
      employeeId: { $in: employeeIds }
    }).lean();

    const salaryMap = new Map(
      salaryStructures.map(item => [item.employeeId, item])
    );


    const startDate = new Date(
      payrollYear,
      payrollMonth - 1,
      1
    );

    const endDate = new Date(
      payrollYear,
      payrollMonth,
      0,
      23,
      59,
      59,
      999
    );

    const attendanceLogs =
      await AttendanceLogs.find({
        employeeID: { $in: employeeIds },
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).lean();

    const attendanceMap = new Map();

    attendanceLogs.forEach((log) => {
      if (!attendanceMap.has(log.employeeID)) {
        attendanceMap.set(log.employeeID, []);
      }

      attendanceMap.get(log.employeeID).push({
        employeeID: log.employeeID,
        date: log.date,
        inTime: log.inTime,
        outTime: log.outTime,
        overtime: log.overtime,
      });
    });

    const records = employeeData.map((item) => {

        const salary = salaryMap.get(item.employeeID);
        const attendance =
          attendanceMap.get(
            item.employeeID
          ) || [];        

          const totalPresentDays = attendance.filter(
            (a) => a.status === "P"
          ).length;

          const totalAbsentDays = attendance.filter(
            (a) => a.status === "A"
          ).length;

          const totalHalfDays = attendance.filter(
            (a) => a.status === "HD"
          ).length;

          const overtimeHours = attendance.reduce(
            (sum, a) => sum + (a.overtime || 0),
            0
          );


        return {
          _id: new mongoose.Types.ObjectId(),
          payrollBatchId: payrollBatch._id,
          payrollBatchNo: payrollBatch.payrollBatchNo,
          employeeID: item.employeeID,
          employeeFullName: item.employeeName,

          employeeSalaryStructure: {
            annualCTC:
              salary?.salaryData?.find(
                s => s.components === "CTC"
              )?.amount || 0,

            salaryComponents:
              salary?.salaryData?.map(comp => ({
                componentCode: comp.components,
                componentName: comp.components,
                monthlyAmount: comp.amount,
                annualAmount: comp.amount * 12,
              })) || [],
          },
          
          attendanceSummary: {
              totalCalendarDays: endDate.getDate(),
              totalWorkingDays: 22,
              totalPresentDays: attendance.length,
              totalAbsentDays: 22 - attendance.length,
              totalWeeklyOffs: 8,
              totalPublicHolidays: 0,
              totalHalfDays,
              overtimeHours,
            },
        };

    });

    await PayrollDetails.insertMany(records);

    return res.status(201).json({
      success: true,
      message:
        "Payroll batch and payroll details created successfully.",
      payrollBatchId: payrollBatch._id,
      payrollBatchNo:
        payrollBatch.payrollBatchNo,
    });
  } catch (error) {
    console.error(
      "Create Payroll Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPayrollSummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching payroll summary for ID:", id);
    const payrollSummary = await PayrollSummary.findById(id);

    if (!payrollSummary) {
      return res.status(404).json({
        success: false,
        message: "Payroll summary not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: payrollSummary,
    });
  } catch (error) {
    console.error("Error fetching payroll summary:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// exports.getPayrollEmployeeDetailsById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const payrollDetails = await PayrollDetails.find({
//       payrollBatchId: id,
//     });

//     return res.status(200).json({
//       success: true,
//       count: payrollDetails.length,
//       data: payrollDetails,
//     });
//   } catch (error) {
//     console.error("Error fetching payroll details:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


exports.getPayrollEmployeeDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const payrollDetails = await PayrollDetails.find({
      payrollBatchId: id,
    });

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let employerContri = 0;

    const employeeData = payrollDetails.map((employee) => {
      let gross = 0;
      let deductions = 0;

      employee.employeeSalaryStructure.salaryComponents.forEach(
        (component) => {
          const amount = Number(component.monthlyAmount || 0);

          if (
            ["PF Employer"].includes(component.componentCode)
          ) {
            employerContri += Math.abs(amount);
          }

          if (
            [
              "PF Employee",
              "PF Employer",
              "TDS",
              "Professional Tax (PT)",
            ].includes(component.componentCode)
          ) {
            deductions += Math.abs(amount);
          } else {
            gross += amount;
          }
        }
      );

      const netSalary = gross - deductions;

      totalGross += gross;
      totalDeductions += deductions;
      totalNet += netSalary;

      return {
        ...employee.toObject(),
        gross,
        deductions,
        netSalary,
      };
    });

    return res.status(200).json({
      success: true,
      data: employeeData,
      summary: {
        totalGross,
        totalDeductions,
        totalNet,
        employerContri
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getPayrollEmployeeAttendance = async (req, res) => {
  try {
    const { employeeIds, month, year } = req.body;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const attendance = await AttendanceLogs.aggregate([
      {
        $match: {
          employeeID: { $in: employeeIds },
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$employeeID",
          workingDays: { $sum: 1 },
          records: { $push: "$$ROOT" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.getHolidaysCount = async (req, res) => { 
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "year and month are required",
      });
    }

    const startDate = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    const endDate = new Date(
      Number(year),
      Number(month),
      1
    );

    const holidayCount = await Holiday.countDocuments({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    return res.status(200).json({
      success: true,
      year,
      month,
      holidayCount,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
