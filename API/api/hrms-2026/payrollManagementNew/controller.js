const mongoose = require("mongoose");
const PayrollSummary = require("./Model_payrollSummary.js");
const PayrollDetails = require("./Model_payrollDetails.js");
const EmployeeSalary = require("../payroll/salary/structure/model.js");
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
    const payrollBatchNo = `PAY-${payrollYear}${String(payrollMonth).padStart(2, "0")}-${String(payrollCycleNumber).padStart(3, "0")}-${employeeData.employeeID}`;

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

    // Create Payroll Details Records
    let insertedRecords = [];

    if (employeeData && Array.isArray(employeeData) && employeeData.length > 0 ) {
      const records = employeeData.map(
        (item) => ({
            _id: new mongoose.Types.ObjectId(),
            payrollBatchId: payrollBatch._id,
            payrollBatchNo: payrollBatch.payrollBatchNo,
            employeeID: item.employeeID,
            employeeFullName: item.employeeName,
        })
      );

      insertedRecords =
        await PayrollDetails.insertMany(
          records
        );
    }

    return res.status(201).json({
      success: true,
      message:
        "Payroll batch and payroll details created successfully.",
      payrollBatchId: payrollBatch._id,
      payrollBatchNo:
        payrollBatch.payrollBatchNo,
      totalEmployees:
        insertedRecords.length,
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


// // Create Payroll Summary
// exports.createPayrollBatch = async (req, res) => {
//   try {
//     console.log(" req.body => ", req.body);

//     const {
//       payrollMonth,
//       payrollYear,
//       payrollStartDate,
//       payrollEndDate,
//       businessUnits,
//       locations,
//       departments,
//       designations,
//       jobTypes,
//       jobTimings,
//       createdBy,
//       remarks,
//     } = req.body;

//     // const payrollCycleNumber = payrollCycleNumber ? parseInt(payrollCycleNumber) : 1;
//     // const maxPayrollCycleNumber = await PayrollSummary.findOne({ payrollYear, payrollMonth }).sort({ payrollCycleNumber: -1 }).select('payrollCycleNumber');
//     // let newPayrollCycleNumber = parseInt(maxPayrollCycleNumber.payrollCycleNumber ? maxPayrollCycleNumber.payrollCycleNumber : 0) + 1
//     // const payrollBatchNo = `PAY-${payrollYear}${String(payrollMonth).padStart(2, "0")}-${String(newPayrollCycleNumber).padStart(3, "0")}`;
//     const payrollBatchNo = `PAY-${payrollYear}${payrollMonth}-003`;

//     const existingBatch = await PayrollSummary.findOne({payrollMonth,
//       payrollYear,
//       payrollStartDate,
//       payrollEndDate,
//       businessUnits,
//       locations,
//       departments,
//       designations,
//       jobTypes,
//       jobTimings,
//     });

//     if (existingBatch) {
//     return res.status(400).json({
//         success: false,
//         message: `
//             Payroll batch already exists for:
//             Month: ${payrollMonth}
//             Year: ${payrollYear}
//             Business Units: ${businessUnits?.join(", ") || "N/A"}
//             Locations: ${locations?.join(", ") || "N/A"}
//             Departments: ${departments?.join(", ") || "N/A"}
//             Designations: ${designations?.join(", ") || "N/A"}
//             Job Types: ${jobTypes?.join(", ") || "N/A"}
//             Job Timings: ${jobTimings?.join(", ") || "N/A"}
//         `.trim(),
//     });
//     }

//     const payrollBatch = await PayrollSummary.create({
//         _id: new mongoose.Types.ObjectId(),
//         payrollBatchNo,
//         payrollMonth,
//         payrollYear,
//         payrollStartDate,
//         payrollEndDate,
//         businessUnits,
//         locations,
//         departments,
//         designations,
//         jobTypes,
//         jobTimings,
//         totalEmployees: 0,
//         payrollEligibleEmployees: 0,
//         blockedEmployees: 0,
//         createdBy,
//         remarks,
//     });

//     res.status(201).json({
//       success: true,
//       data: payrollBatch,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };




// exports.createPayrollDetails = async (req, res) => {
//   try {
//     const { payrollBatchId, payrollDetails } = req.body;

//     if (!payrollBatchId) {
//       return res.status(400).json({
//         success: false,
//         message: "Payroll Batch ID is required",
//       });
//     }

//     if (
//       !payrollDetails ||
//       !Array.isArray(payrollDetails) ||
//       payrollDetails.length === 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Payroll Details are required",
//       });
//     }

//     const batch = await PayrollSummary.findById(
//       payrollBatchId
//     );

//     if (!batch) {
//       return res.status(404).json({
//         success: false,
//         message: "Payroll batch not found",
//       });
//     }

//     const records = payrollDetails.map((item) => ({
//       payrollBatchId: batch._id,
//       payrollBatchNo: batch.payrollBatchNo,

//       employeeId: item.employeeID,
//       employeeFullName: item.employeeName,

//       payrollEligibility: "Eligible",

//       auditInfo: {
//         createdDateTime: new Date(),
//         updatedDateTime: new Date(),
//       },
//     }));

//     const insertedRecords =
//       await PayrollDetails.insertMany(records);

//     return res.status(201).json({
//       success: true,
//       message: "Payroll details saved successfully.",
//       count: insertedRecords.length,
//     });
//   } catch (error) {
//     console.error(
//       "Create Payroll Details Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };




exports.getPayrollSummaryById = async (req, res) => {
  try {
    const { id } = req.params;

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