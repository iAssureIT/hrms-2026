const mongoose = require("mongoose");
const _ = require("underscore");
const moment = require("moment");
const FundReceipt = require("./model.js");
const ProgramMaster = require("../oneFieldModules/programManagement/modelNew.js");
const ProjectMaster = require("../oneFieldModules/projectManagement/modelNew.js");
const ActivityMaster = require("../oneFieldModules/ActivityManagement/model.js");
const Subactivity = require("../SubactivityMapping/model.js");
const FailedRecords = require("../failedRecords/model.js");
const CenterDetails = require("../centers/model.js");
const Approval = require("../approval-details/model.js");
const BankDetails = require("../bank-details/model.js");
const globalVariable = require("../../../nodemonConfig.js");

function getShortCenterName(centerName) {
  const centersArray = globalVariable?.centersArray;
  const center = centersArray.find(
    (c) => c.centerName.toLowerCase() === centerName.toLowerCase()
  );
  return center ? center.shortName : null;
}

// function generateFundReceiptNumber(centerName, fundType) {
//   return new Promise((resolve, reject) => {
//     const now = new Date();
//     const month = now.getMonth();
//     const year = now.getFullYear();
//     let financialYear;

//     let startYear, endYear;
//     if (month >= 3) {
//       // If the current month is April (3) or later
//       startYear = year;
//       endYear = year + 1;
//     } else {
//       // If the current month is before April
//       startYear = year - 1;
//       endYear = year;
//     }

//     financialYear = `${startYear}-${String(endYear).slice(-2)}`;

//     // Extract the first three letters of the centerName
//     const centerCode = centerName.substring(0, 3);

//     // Fetch the latest fund receipt number for the current financial year and center
//     FundReceipt.findOne({
//       centerName: centerName,
//       fundType: fundType,
//     })
//       .sort({ fundReceiptNumber: -1 })
//       .then((lastFundReceipt) => {
//         let newReceiptNumber = "000001"; // Default receipt number if no records found

//         if (lastFundReceipt) {
//           const lastReceiptNo = lastFundReceipt.fundReceiptNumber
//             .split("-")
//             .pop();
//           const lastNumber = parseInt(lastReceiptNo, 10);
//           newReceiptNumber = (lastNumber + 1).toString().padStart(6, "0");
//         }
//         if (fundType === "External Grant") {
//           var voucherCode = `RVEG`;
//         } else if (fundType === "Community Contribution") {
//           var voucherCode = `RVCC`;
//         }
//         // Community contribution
//         // RVCC/PUN/2024-25/000001
//         // External Grant
//         // RVEG/PUN/2024-25/000001
//         // Construct the new fund receipt number
//         const fundReceiptNumber = `${voucherCode}/${financialYear}/${centerCode}/${newReceiptNumber}`;
//         resolve(fundReceiptNumber);
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// }

async function generateFundReceiptNumber(centerName, fundType, bulkArray = []) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  const financialYear = `${startYear}-${String(endYear).slice(-2)}`;

  const centerCode = await getShortCenterName(centerName);

  let voucherCode = "";

  const normalizedFundType = fundType?.trim().toLowerCase();
  if (normalizedFundType === "external grant") {
    voucherCode = "RVEG";
  } else if (normalizedFundType === "community contribution") {
    voucherCode = "RVCC";
  } else {
    throw new Error(`Invalid fund type provided: ${fundType}`);
  }

  // if (fundType === "External Grant") {
  //   voucherCode = "RVEG";
  // } else if (fundType === "Community Contribution") {
  //   voucherCode = "RVCC";
  // } else {
  //   throw new Error("Invalid fund type provided.");
  // }

  const prefix = `${voucherCode}/${financialYear}/${centerCode}/`;

  // Fetch all matching records
  const existingGrants = await FundReceipt.find({
    fundReceiptNumber: { $regex: `^${prefix}\\d{6}$` },
  }).select("fundReceiptNumber");

  // Extract and sort the existing numbers
  let existingNumbers = existingGrants.map((receipt) => {
    const parts = receipt.fundReceiptNumber.split("/");
    return parseInt(parts[3], 10);
  });

  existingNumbers.sort((a, b) => b - a); // Descending order

  let lastNumber = existingNumbers.length > 0 ? existingNumbers[0] : 0;

  // If bulk array is passed (bulk upload case)
  if (bulkArray.length > 0) {
    const fundReceiptNumbers = [];
    for (let i = 0; i < bulkArray.length; i++) {
      lastNumber++;
      const newNumber = String(lastNumber).padStart(6, "0");
      const newFundReceiptNo = `${voucherCode}/${financialYear}/${centerCode}/${newNumber}`;
      fundReceiptNumbers.push(newFundReceiptNo);
    }
    return fundReceiptNumbers;
  } else {
    // Single entry
    lastNumber++;
    const newNumber = String(lastNumber).padStart(6, "0");
    const fundReceiptNumber = `${voucherCode}/${financialYear}/${centerCode}/${newNumber}`;
    return fundReceiptNumber;
  }
}

exports.create_fund = (req, res, next) => {
  getData();

  async function getData() {
    try {
      const centerName = req.body.centerName.toUpperCase();
      const fundReceiptNumber = await generateFundReceiptNumber(
        centerName,
        req.body.fundType
      );

      // Create new fund receipt

      FundReceipt.findOne({
        center_id: req.body.center_id,
        program_id: req.body.program_id,
        project_id: req.body.project_id,
        activityName_id: req.body.activityName_id,
        subactivityName_id: req.body.subactivityName_id,
        fundType: req.body.fundType,
        amountReceivedDate: moment(req.body.amountReceivedDate).format(
          "YYYY-MM-DD"
        ),
        utrTransactionNumber:req.body.utrTransactionNumber,
        depositSlipNumber: req.body.depositSlipNumber,
        amountReceived: req.body.amountReceived,

      })
        .exec()
        .then(async (data) => {
          if (data) {
            res.status(200).json({
              message:
                "External Grant or CC Details already exists for this Center, Masters and Amount Received Date",
              success: false,
            });
          } else {
            const fund = new FundReceipt({
              _id: new mongoose.Types.ObjectId(),
              fundType: req.body.fundType,
              approvalNo: req.body.approvalNo,
              paymentType: req.body.paymentType,
              center_id: req.body.center_id,
              centerName: req.body.centerName,
              program_id: req.body.program_id,
              program: req.body.program,
              project_id: req.body.project_id,
              project: req.body.project,
              activityName_id: req.body.activityName_id
                ? req.body.activityName_id
                : null,
              activityName: req.body.activityName,
              subactivityName_id: req.body.subactivityName_id
                ? req.body.subactivityName_id
                : null,
              subactivityName: req.body.subactivityName,
              fundingAgencyName: req.body.fundingAgencyName,
              fundReceiptNumber: fundReceiptNumber,
              amountReceivedDate: req.body.amountReceivedDate,
              amountReceived: req.body.amountReceived,
              depositSlipNumber: req.body.depositSlipNumber,
              utrTransactionNumber: req.body.utrTransactionNumber,
              bank_id: req.body.bank_id,
              lhwrfBankName: req.body.lhwrfBankName,
              lhwrfBranchName: req.body.lhwrfBranchName,
              lhwrfAccountNumber: req.body.lhwrfAccountNumber,
              totalContributors: req.body.totalContributors,
              contributorData: req.body.contributorData,
              createdBy: req.body.user_id,
              createdAt: new Date(),
            });

            // Save the new fund receipt
            const response = await fund.save();

            res.status(200).json({
              message: "Fund submitted Successfully.",
              insertedLevel: response,
              success: true,
            });
          }
        })
        .catch((error) => {
          res.status(500).json({
            message: error.message,
            success: false,
          });
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    }
  }
};

// Bulk upload without contributors
exports.bulkUpload_fund_community_contribution_without_contributors = (
  req,
  res,
  next
) => {
  // console.log("req.body.data",req.body.data)
  var excelData = req.body.data;
  var validData = [];
  var validObjects = [];
  var invalidData = [];
  var invalidObjects = {};
  var remark = "";
  var failedRecords = [];
  var Count = 0;
  var DuplicateCount = 0;
  const numberPattern = /^\d+(\.\d+)?$/;

  var uniqueCombinations = new Set();

  processData();
  async function processData() {
    var centerName = excelData[0]?.centerName.toUpperCase();
    const fundReceiptNumber = await generateFundReceiptNumber(
      centerName,
      "Community Contribution"
    );

    var allPrograms = await getAllProgramMaster({});
    var allProjects = await getAllProjects({});
    var allActivities = await getAllActivities({});
    var allBankDetails = await getAllBankDetails({});
    for (var k = 0; k < excelData.length; k++) {
      if (excelData[k].centerName === "-") {
        remark += " Center Name not found";
      }
      if (excelData[k].approvalNo === "-") {
        remark += " Approval Number not found";
      }
      if (excelData[k].paymentType === "-") {
        remark += "Payment Type not found";
      }
      if (excelData[k].program === "-") {
        remark += "program not found";
      }
      if (excelData[k].project === "-") {
        remark += " project not found";
      }
      if (excelData[k].activityName === "-") {
        remark += " activityName not found";
      }
      if (excelData[k].subactivityName === "-") {
        remark += " subactivityName not found";
      }
      if (excelData[k].amountReceived === "-") {
        remark += "Amount received not found";
      } else if (!numberPattern.test(excelData[k].amountReceived)) {
        remark += "Amount Received should only contain numbers, ";
      }

      if (excelData[k].amountReceivedDate == "-") {
        remark += "Amount received date not found";
      } else {
        // console.log("excelData[k].amountReceivedDate",excelData[k].amountReceivedDate)
        var validDate = isValidDateFormatDDMMYYYY(
          excelData[k].amountReceivedDate
        );
        if (validDate) {
          // console.log("validDate=======================================",validDate)
          var amountReceivedDate;
          if (typeof excelData[k].amountReceivedDate == "number") {
            amountReceivedDate = moment(
              new Date(
                Math.round(
                  (excelData[k].amountReceivedDate - 25569) * 86400 * 1000
                )
              )
            ).format("YYYY-MM-DD");
          } else {
            var amountReceivedDate1 = moment(
              excelData[k].amountReceivedDate,
              "YYYY-MM-DD"
            )._i;
            var DD = amountReceivedDate1.substring(0, 2);
            var MM = amountReceivedDate1.substring(3, 5);
            var YYYY = amountReceivedDate1.substring(6, 10);
            amountReceivedDate = YYYY + "-" + MM + "-" + DD;
           
          }
        } else {
          remark +=
            "amountReceivedDate is not valid. The format should be DD/MM/YYYY, ";
        }
      }
      if (excelData[k].depositSlipNumber === "-") {
        remark += "Deposit slip number not found";
      }
      if (excelData[k].utrTransactionNumber === "-") {
        remark += "UTR transaction number not found";
      }
      if (excelData[k].lhwrfBankName === "-") {
        remark += "LHWRF Bank Name not found";
      }
      if (excelData[k].lhwrfBranchName === "-") {
        remark += "LHWRF Branch Name not found";
      }
      const lhwrfAccountNumber = String(excelData[k].lhwrfAccountNumber).trim();
      if (lhwrfAccountNumber === "-") {
        remark += "LHWRF account number not found";
      } else if (!numberPattern.test(lhwrfAccountNumber)) {
        remark += "lhwrfAccountNumber should only contain numbers, ";
      }

      if (remark === "") {
        var centerDetails = await getCenterDetails(
          excelData[k]?.centerName.trim()
        );
        var programAvailability = allPrograms.filter((item) => {
          if (
            item.fieldValue.toLowerCase() ===
            excelData[k].program.toLowerCase().trim()
          ) {
            return item;
          }
        });
        // console.log("programAvailability",programAvailability)
        var projectAvailability = allProjects.filter((item) => {
          if (
            item.fieldValue.toLowerCase() ===
            excelData[k].project.toLowerCase().trim()
          ) {
            return item;
          }
        });
        // console.log("projectAvailability",projectAvailability)
        var activityAvailability = allActivities.filter((item) => {
          if (
            item.fieldValue.toLowerCase() ===
            excelData[k].activityName.toLowerCase().trim()
          ) {
            return item;
          }
        });
        var subactivitiesAvailability = await getSubactivitiesAvailability(
          excelData[k].program.toLowerCase().trim(),
          excelData[k].project.toLowerCase().trim(),
          excelData[k].activityName.toLowerCase().trim(),
          excelData[k].subactivityName.toLowerCase().trim()
        );
        // console.log("remark 1", remark);

        var bankNameAvailability = allBankDetails.filter((item) => {
          if (
            item.bankName.toLowerCase() ===
            excelData[k].lhwrfBankName.toLowerCase().trim()
          ) {
            return item;
          }
        });
        var branchNameAvailability = allBankDetails.filter((item) => {
          if (
            item.branchName.toLowerCase() ===
            excelData[k].lhwrfBranchName.toLowerCase().trim()
          ) {
            return item;
          }
        });
        var bankAccountNumberAvailability = allBankDetails.filter((item) => {
          if (
            item.bankAccountNumber.toString().trim() ===
            excelData[k].lhwrfAccountNumber.toString().trim()
          ) {
            return item;
          }
        });
        // console.log("bankAccountNumberAvailability",bankAccountNumberAvailability)
        if (programAvailability.length === 0) {
          remark +=
            excelData[k].program + " is not available in Program Master,";
        }
        // console.log("remark 2", remark);
        if (projectAvailability.length === 0) {
          remark +=
            " " + excelData[k].project + " is not available in Project Master,";
        }
        // console.log("remark 3", remark);
        if (activityAvailability.length === 0) {
          remark +=
            " " +
            excelData[k].activityName +
            " is not available in Activity Master,";
        }
        // console.log("remark 4", remark);
        if (subactivitiesAvailability.length === 0) {
          remark +=
            " " +
            excelData[k].subactivityName +
            " is not available in Subactivity Master. Program, Project, Activity, Subactivity should be link with each other";
        }
        // console.log("remark 5", remark);

        if (bankNameAvailability.length === 0) {
          remark +=
            " " +
            excelData[k].lhwrfBankName +
            " is not available in Bank Details Master,";
        }
        if (branchNameAvailability.length === 0) {
          remark +=
            " " +
            excelData[k].lhwrfBranchName +
            " is not available in Bank Details Master,";
        }
        if (bankAccountNumberAvailability.length === 0) {
          remark +=
            " " +
            excelData[k].lhwrfAccountNumber +
            " is not available in Bank Details Master,";
        }

        let combinationKey = `${excelData[k].centerName
          .toLowerCase()
          .trim()}_${excelData[k].program.toLowerCase().trim()}_${excelData[
          k
        ].project
          .toLowerCase()
          .trim()}_${excelData[k].activityName
          .toLowerCase()
          .trim()}_${excelData[k].subactivityName.toLowerCase().trim()}_${
          excelData[k].amountReceivedDate
        }_${excelData[k].utrTransactionNumber}
          `;

        // Check if the combination is already in the unique set
        if (uniqueCombinations.has(combinationKey)) {
          remark =
            "Duplicate Community Contribution Details found in the file.";
        } else {
          // Add the combination to the set if not a duplicate
          uniqueCombinations.add(combinationKey);
        }

        // console.log("remark 6", remark);
        if (remark === "") {
          const verifyApproval = await verifyApprovalNumber(
            excelData[k].approvalNo.toString().trim()
          );
          if (verifyApproval) {
            var subactivityName = subactivitiesAvailability[0].inputValue;
            var program = subactivitiesAvailability[0].field1Value;
            var project = subactivitiesAvailability[0].field2Value;
            var activityName = subactivitiesAvailability[0].field3Value;
            var subactivityName_id = subactivitiesAvailability[0]._id;
            var program_id = subactivitiesAvailability[0].field1_id;
            var project_id = subactivitiesAvailability[0].field2_id;
            var activityName_id = subactivitiesAvailability[0].field3_id;

            var query = {
              centerName: centerDetails?.centerName,
              fundType: "Community Contribution",
            };
            var allFunds = await getAllFunds(query); // pass center_id to get less data

            var FundExists = allFunds.filter((item) => {
              if (
                item.centerName.toLowerCase() ===
                  excelData[k].centerName.toLowerCase().trim() &&
                item.program.toLowerCase() ===
                  excelData[k].program.toLowerCase().trim() &&
                item.project.toLowerCase() ===
                  excelData[k].project.toLowerCase().trim() &&
                item.activityName.toLowerCase() ===
                  excelData[k].activityName.toLowerCase().trim() &&
                item.subactivityName.toLowerCase() ===
                  excelData[k].subactivityName.toLowerCase().trim() &&
                item.fundType.toLowerCase() === "community contribution" &&
                moment(item.amountReceivedDate).format("YYYY-MM-DD") ===
                  moment(
                    new Date(
                      Math.round(
                        (excelData[k].amountReceivedDate - 25569) * 86400 * 1000
                      )
                    )
                  ).format("YYYY-MM-DD")
              ) {
                return item;
              }
            });
            if (FundExists.length === 0) {
              validObjects = excelData[k];
              validObjects.fundType = "Community Contribution";
              validObjects.amountReceivedDate = amountReceivedDate;

              validObjects.centerName = centerDetails?.centerName;
              validObjects.center_id = centerDetails?._id;

              validObjects.program_id = program_id;
              validObjects.project_id = project_id;
              validObjects.activityName_id = activityName_id;
              validObjects.subactivityName_id = subactivityName_id;

              validObjects.program = program;
              validObjects.project = project;
              validObjects.activityName = activityName;
              validObjects.subactivityName = subactivityName;

              validObjects.fileName = req.body?.fileName;
              validObjects.createdBy = req.body?.createdBy;
              validObjects.createdAt = new Date();
              // console.log("validObjects",validObjects)
              validData.push(validObjects);
            } else {
              remark = "This Fund details already exists.";
              invalidObjects = excelData[k];
              invalidObjects.failedRemark = remark;
              invalidData.push(invalidObjects);
              // console.log(
              //   "invalidObjects FundExists",
              //   // invalidObjects,
              //   invalidObjects.failedRemark
              // );
            }
          } else {
            remark = "Approval Number is not available.";
            invalidObjects = excelData[k];
            invalidObjects.failedRemark = remark;
            invalidData.push(invalidObjects);
            // console.log(
            //   invalidObjects,
            //   invalidObjects.failedRemark
            // );
          }
        } else {
          invalidObjects = excelData[k];
          invalidObjects.failedRemark = remark;
          invalidData.push(invalidObjects);
          // console.log(
          //   "invalidObjects subactivitiesAvailability",
          //   invalidObjects,
          //   invalidObjects.failedRemark
          // );
        }
      } else {
        invalidObjects = excelData[k];
        invalidObjects.failedRemark = remark;
        invalidData.push(invalidObjects);
      }
      remark = "";
    }

    let currentFundReceiptNumber = fundReceiptNumber;
    var validData1 = generateFundreceiptNumbers(
      currentFundReceiptNumber,
      validData
    );

    FundReceipt.insertMany(validData1)
      .then(async (data) => {})
      .catch((err) => {
        console.log(err);
      });
    // console.log("invalidData", invalidData.length);
    if (invalidData.length > 0) {
      failedRecords.FailedRecords = invalidData;
      failedRecords.fileName = req.body.fileName;
      failedRecords.totalRecords = invalidData.length;
      const failedData = await insertFailedRecords(
        failedRecords,
        req.body.updateBadData
      );
    }
    res.status(200).json({
      message: "Bulk upload process is completed successfully!",
      completed: true,
    });
  }
};
exports.bulkUpload_fund_community_contribution_without_contributors = (
  req,
  res,
  next
) => {
  var excelData = req.body.data;
  var validData = [];
  var validObjects = [];
  var invalidData = [];
  var invalidObjects = {};
  var remark = "";
  var failedRecords = [];
  var uniqueCombinations = new Set();
  const numberPattern = /^\d+(\.\d+)?$/;

  processData();
  async function processData() {
    var centerName = excelData[0]?.centerName?.toUpperCase();
    const fundReceiptNumber = await generateFundReceiptNumber(
      centerName,
      "Community Contribution"
    );

    var allPrograms = await getAllProgramMaster({});
    var allProjects = await getAllProjects({});
    var allActivities = await getAllActivities({});
    var allBankDetails = await getAllBankDetails({});

    for (var k = 0; k < excelData.length; k++) {
      let row = excelData[k];
      let isContributorOnly =
        row.hasOwnProperty("contributorData") && Object.keys(row).length === 1; // Contributor-only row check

      if (!isContributorOnly) {
        // **Validate only the main entry (skip contributor rows)**
        if (!row.centerName || row.centerName === "-")
          remark += "Center Name not found, ";
        if (!row.approvalNo || row.approvalNo === "-")
          remark += "Approval Number not found, ";
        if (!row.paymentType || row.paymentType === "-")
          remark += "Payment Type not found, ";
        if (!row.program || row.program === "-")
          remark += "Program not found, ";
        if (!row.project || row.project === "-")
          remark += "Project not found, ";
        if (!row.activityName || row.activityName === "-")
          remark += "Activity Name not found, ";
        if (!row.subactivityName || row.subactivityName === "-")
          remark += "Subactivity Name not found, ";

        if (!row.amountReceived || row.amountReceived === "-") {
          remark += "Amount Received not found, ";
        } else if (!numberPattern.test(row.amountReceived)) {
          remark += "Amount Received should only contain numbers, ";
        }

        if (!row.amountReceivedDate || row.amountReceivedDate === "-") {
          remark += "Amount Received Date not found, ";
        }
      }

      // **Process date format**
      let amountReceivedDate = "";
      if (row.amountReceivedDate && row.amountReceivedDate !== "-") {
        let validDate = isValidDateFormatDDMMYYYY(row.amountReceivedDate);
        if (validDate) {
          amountReceivedDate = moment(
            row.amountReceivedDate,
            "DD/MM/YYYY"
          ).format("YYYY-MM-DD");
        } else {
          remark +=
            "Amount Received Date is not valid. The format should be DD/MM/YYYY, ";
        }
      }

      if (!isContributorOnly) {
        // **Check for duplicate entry only for main rows**
        let combinationKey = `${row.centerName
          ?.toLowerCase()
          .trim()}_${row.program?.toLowerCase().trim()}_${row.project
          ?.toLowerCase()
          .trim()}_${row.activityName
          ?.toLowerCase()
          .trim()}_${row.subactivityName?.toLowerCase().trim()}_${
          row.amountReceivedDate
        }_${row.utrTransactionNumber}`;

        if (uniqueCombinations.has(combinationKey)) {
          remark =
            "Duplicate Community Contribution Details found in the file.";
        } else {
          uniqueCombinations.add(combinationKey);
        }

        // **Validate sum of contributors' deposited amounts only once per main entry**
        if (row.contributorData && row.contributorData.length > 0) {
          let totalDeposited = row.contributorData.reduce(
            (sum, contributor) => sum + (contributor.amountDeposited || 0),
            0
          );
          if (totalDeposited !== Number(row.amountReceived)) {
            remark +=
              "Sum of contributors' deposited amounts does not match Amount Received, ";
          }
        }
      }

      if (remark === "") {
        // Store valid entry
        validObjects = {
          ...row,
          fundType: "Community Contribution",
          amountReceivedDate,
        };
        validData.push(validObjects);
      } else {
        // Store invalid entry
        invalidObjects = { ...row, failedRemark: remark };
        invalidData.push(invalidObjects);
      }

      remark = ""; // Reset remark for next row
    }

    let currentFundReceiptNumber = fundReceiptNumber;
    var validData1 = generateFundreceiptNumbers(
      currentFundReceiptNumber,
      validData
    );

    FundReceipt.insertMany(validData1)
      .then(() => {})
      .catch((err) => console.log(err));

    if (invalidData.length > 0) {
      failedRecords.FailedRecords = invalidData;
      failedRecords.fileName = req.body.fileName;
      failedRecords.totalRecords = invalidData.length;
      await insertFailedRecords(failedRecords, req.body.updateBadData);
    }

    res.status(200).json({
      message: "Bulk upload process is completed successfully!",
      completed: true,
    });
  }
};

const processCommunityContributionDataold = async (
  excelData,
  fileName,
  createdBy
) => {
  let validData = [];
  let invalidData = [];
  let uniqueCombinations = new Set();
  const numberPattern = /^\d+(\.\d+)?$/;

  const allPrograms = await getAllProgramMaster({});
  const allProjects = await getAllProjects({});
  const allActivities = await getAllActivities({});
  const allBankDetails = await getAllBankDetails({});

  let contributionGroups = {}; // Store grouped contributions

  for (let k = 0; k < excelData.length; k++) {
    let row = excelData[k];
    let remark = "";

    // **Group Contributions Based on Unique Key**
    let groupKey = `${k}_${row.centerName}_${row.program}_${row.project}_${row.activityName}_${row.subactivityName}_${row.amountReceivedDate}_${row.utrTransactionNumber}`;

    if (!contributionGroups[groupKey]) {
      contributionGroups[groupKey] = {
        totalDepositedAmount: 0,
        amountReceived: 0,
        contributorData: [],
      };
    }

    // **Ensure amountReceived is properly converted**
    if (row.amountReceived !== "-") {
      row.amountReceived = row.amountReceived.toString().trim();
      if (numberPattern.test(row.amountReceived)) {
        row.amountReceived = Number(row.amountReceived);
        contributionGroups[groupKey].amountReceived = row.amountReceived; // Store in group
      } else {
        remark += " Amount Received should only contain numbers,";
      }
    } else {
      remark += " Amount received not found,";
    }

    // **Ensure amountDeposited is properly converted & added**
    if (
      row.centerName == "-" &&
      row.program == "-" &&
      row.contributorName !== "-" &&
      row.amountDeposited !== "-"
    ) {

      row.amountDeposited = row.amountDeposited.toString().trim();
      if (numberPattern.test(row.amountDeposited)) {
        let amountDeposited = Number(row.amountDeposited);

        //  **Fix: Ensure all contributors are pushed into the array**
        contributionGroups[groupKey].contributorData.push({
          contributorName: row.contributorName,
          village: row.village !== "-" ? row.village : "",
          aadhaarNo: row.aadhaarNo !== "-" ? row.aadhaarNo : null,
          amountDeposited: amountDeposited,
          uploadTime: new Date(),
          fileName: fileName,
        });

        contributionGroups[groupKey].totalDepositedAmount += amountDeposited; //  Add to total sum
      } else {
        remark += " Amount Deposited should only contain numbers,";
      }
    }
   
    // **Skip Common Data Validation for Contributor Rows (2nd, 3rd, etc.)**
    let isContributorRow = k > 0 && row.centerName === "-";
    if (!isContributorRow) {
      if (row.centerName === "-") remark += " Center Name not found,";
      if (row.approvalNo === "-") remark += " Approval Number not found,";
      if (row.paymentType === "-") remark += " Payment Type not found,";
      if (row.program === "-") remark += " Program not found,";
      if (row.project === "-") remark += " Project not found,";
      if (row.activityName === "-") remark += " Activity Name not found,";
      if (row.subactivityName === "-") remark += " Subactivity Name not found,";
      if (row.amountReceivedDate === "-")
        remark += " Amount received date not found,";
      if (row.lhwrfBankName === "-") remark += " LHWRF Bank Name not found,";
      if (row.lhwrfBranchName === "-")
        remark += " LHWRF Branch Name not found,";
      if (row.lhwrfAccountNumber === "-")
        remark += " LHWRF Account Number not found,";
    }

    // **Validate & Add Common Data Only Once (First Occurrence)**
    if (!isContributorRow && remark === "") {
      let centerDetails = await getCenterDetails(row.centerName.trim());
      let programAvailability = allPrograms.find(
        (p) => p.fieldValue.toLowerCase() === row.program.toLowerCase().trim()
      );
      let projectAvailability = allProjects.find(
        (p) => p.fieldValue.toLowerCase() === row.project.toLowerCase().trim()
      );
      let activityAvailability = allActivities.find(
        (a) =>
          a.fieldValue.toLowerCase() === row.activityName.toLowerCase().trim()
      );
      let bankAccountNumberAvailability = allBankDetails.find(
        (b) =>
          b.bankAccountNumber.toString().trim() ===
          row.lhwrfAccountNumber.toString().trim()
      );

      if (!programAvailability)
        remark += `${row.program} is not available in Program Master,`;
      if (!projectAvailability)
        remark += `${row.project} is not available in Project Master,`;
      if (!activityAvailability)
        remark += `${row.activityName} is not available in Activity Master,`;
      if (!bankAccountNumberAvailability)
        remark += `${row.lhwrfAccountNumber} is not available in Bank Master,`;

      let combinationKey = `${row.centerName.toLowerCase().trim()}_${row.program
        .toLowerCase()
        .trim()}_${row.project.toLowerCase().trim()}_${row.activityName
        .toLowerCase()
        .trim()}_${row.subactivityName.toLowerCase().trim()}_${
        row.amountReceivedDate
      }_${row.utrTransactionNumber}`;

      if (uniqueCombinations.has(combinationKey)) {
        remark +=
          " Duplicate Community Contribution Details found in the file.";
      } else {
        uniqueCombinations.add(combinationKey);
      }
   
      if (remark === "") {
        // **Final Amount Validation**
        let totalDeposited = contributionGroups[groupKey].totalDepositedAmount;
        let receivedAmount = contributionGroups[groupKey].amountReceived;

        if (totalDeposited !== receivedAmount) {
          remark += ` Sum of contributor deposits (${totalDeposited}) does not match Amount Received (${receivedAmount}),`;
        }

        if (remark === "") {
          let validRecord = {
            fundType: "Community Contribution",
            centerName: centerDetails?.centerName,
            center_id: centerDetails?._id,
            approvalNo: row.approvalNo,
            paymentType: row.paymentType,
            program: programAvailability?.fieldValue,
            program_id: programAvailability?._id,
            project: projectAvailability?.fieldValue,
            project_id: projectAvailability?._id,
            activityName: activityAvailability?.fieldValue,
            activityName_id: activityAvailability?._id,
            subactivityName: row.subactivityName,
            amountReceivedDate: row.amountReceivedDate,
            amountReceived: row.amountReceived,
            depositSlipNumber: row.depositSlipNumber,
            utrTransactionNumber: row.utrTransactionNumber,
            lhwrfBankName: row.lhwrfBankName,
            lhwrfBranchName: row.lhwrfBranchName,
            lhwrfAccountNumber: row.lhwrfAccountNumber,
            contributorData: contributionGroups[groupKey].contributorData, //  Now includes all contributors
            fileName: fileName,
            createdBy: createdBy,
            createdAt: new Date(),
          };
          validData.push(validRecord);
        } else {
          invalidData.push({ ...row, failedRemark: remark });
        }
      } else {
        invalidData.push({ ...row, failedRemark: remark });
      }
    }
  }
  return { validData, invalidData };
};

const processCommunityContributionDataL = async (
  excelData,
  fileName,
  createdBy
) => {
  let validData = [];
  let invalidData = [];
  let uniqueCombinations = new Set();
  const numberPattern = /^\d+(\.\d+)?$/;
  const allPrograms = await getAllProgramMaster({});
  const allProjects = await getAllProjects({});
  const allActivities = await getAllActivities({});
  const allBankDetails = await getAllBankDetails({});
  let contributionGroups = {}; // Store grouped contributions
  let currentGroupKey = null; // Track the current active groupKey

  for (let k = 0; k < excelData.length; k++) {
    let row = excelData[k];
    let remark = "";

    let isContributorOnly =
      row.centerName === "-" &&
      row.program === "-" &&
      row.contributorName !== "-";

    // **Detect New Group (Main Entry)**
    if (!isContributorOnly) {
      currentGroupKey = `${row.centerName}_${row.program}_${row.project}_${row.activityName}_${row.subactivityName}_${row.amountReceivedDate}_${row.utrTransactionNumber}`;

      if (!contributionGroups[currentGroupKey]) {
        contributionGroups[currentGroupKey] = {
          fundType: "Community Contribution",
          centerName: row.centerName,
          approvalNo: row.approvalNo,
          paymentType: row.paymentType,
          program: row.program,
          project: row.project,
          activityName: row.activityName,
          subactivityName: row.subactivityName,
          amountReceived: numberPattern.test(row.amountReceived)
            ? Number(row.amountReceived)
            : 0,
          amountReceivedDate: moment(
            row.amountReceivedDate,
            "DD/MM/YYYY"
          ).format("YYYY-MM-DD"),
          depositSlipNumber: row.depositSlipNumber,
          utrTransactionNumber: row.utrTransactionNumber,
          lhwrfBankName: row.lhwrfBankName,
          lhwrfBranchName: row.lhwrfBranchName,
          lhwrfAccountNumber: numberPattern.test(row.lhwrfAccountNumber)
            ? Number(row.lhwrfAccountNumber)
            : null,
          contributorData: [
            {
              contributorName: row.contributorName,
              village: row.village !== "-" ? row.village : "",
              aadhaarNo: row.aadhaarNo !== "-" ? row.aadhaarNo : null,
              amountDeposited: numberPattern.test(row.amountDeposited)
                ? Number(row.amountDeposited)
                : 0,
              uploadTime: new Date(),
              fileName: fileName,
            },
          ],
          totalDepositedAmount: numberPattern.test(row.amountDeposited)
            ? Number(row.amountDeposited)
            : 0,
          fileName: fileName,
          createdBy: createdBy,
          createdAt: new Date(),
        };
      }
    }

    // **Adding Contributor Data to the Current Group**
    if (isContributorOnly && currentGroupKey) {
      if (row.amountDeposited !== "-") {
        row.amountDeposited = row.amountDeposited.toString().trim();
        if (numberPattern.test(row.amountDeposited)) {
          let amountDeposited = Number(row.amountDeposited);
          // **Push contributor into the active group**
          contributionGroups[currentGroupKey].contributorData.push({
            contributorName: row.contributorName,
            village: row.village !== "-" ? row.village : "",
            aadhaarNo: row.aadhaarNo !== "-" ? row.aadhaarNo : null,
            amountDeposited: amountDeposited,
            uploadTime: new Date(),
            fileName: fileName,
          });

          // **Update Total Deposited Amount**
          contributionGroups[currentGroupKey].totalDepositedAmount +=
            amountDeposited;
        } else {
          remark += " Amount Deposited should only contain numbers, ";
        }
      }
    }
  }
  // **Final Validation: Check Total Deposited Amount Against Amount Received**
  for (let groupKey in contributionGroups) {
    let group = contributionGroups[groupKey];

    let totalDeposited = group.totalDepositedAmount;
    let receivedAmount = group.amountReceived;

    if (totalDeposited !== receivedAmount) {
      group.failedRemark = `Sum of contributor deposits (${totalDeposited}) does not match Amount Received (${receivedAmount}),`;
      invalidData.push(group);
    } else {
      validData.push(group);
    }
  }

  return { validData, invalidData };
};

async function processCommunityContributionData(
  excelData,
  fileName,
  createdBy
) {
  let validData = [];
  let invalidData = [];
  let uniqueCombinations = new Set();
  const numberPattern = /^\d+(\.\d+)?$/;
  const aadhaarPattern = /^\d{12}$/;

  const allPrograms = await getAllProgramMaster({});
  const allProjects = await getAllProjects({});
  const allActivities = await getAllActivities({});
  const allBankDetails = await getAllBankDetails({});

  let contributionGroups = {}; // Store grouped contributions
  let currentGroupKey = null; // Track the current active groupKey
  let fundReceiptGroups = {}; // To group valid records for receipt number generation

  // Step 1: Validate all rows and group contributions
  for (let index = 0; index < excelData.length; index++) {
    const row = excelData[index];
    let remark = "";

    // Skip contributor-only rows for initial validation
    const isContributorOnly =
      row.centerName === "-" &&
      row.program === "-" &&
      row.contributorName !== "-";

    if (isContributorOnly) {
      // Handle contributor-only rows later, after main entry is validated
      if (currentGroupKey && contributionGroups[currentGroupKey]) {
        if (row.amountDeposited !== "-") {
          row.amountDeposited = row.amountDeposited.toString().trim();
          if (numberPattern.test(row.amountDeposited)) {
            let amountDeposited = Number(row.amountDeposited);
            contributionGroups[currentGroupKey]?.contributorData.push({
              contributorName: row.contributorName,
              village: row.village !== "-" ? row.village : "",
              aadhaarNo: row.aadhaarNo !== "-" ? row.aadhaarNo : null,
              amountDeposited: amountDeposited,
              uploadTime: new Date(),
              fileName: fileName,
            });
            contributionGroups[currentGroupKey].totalDepositedAmount +=
              amountDeposited;
          } else {
            remark += "Amount Deposited should only contain numbers, ";
            invalidData.push({ ...row, failedRemark: remark });
          }
        }
      }
      continue;
    }

    // Check for blank fundType
    if (!row.fundType || String(row.fundType).trim() === "") {
      invalidData.push({ ...row, failedRemark: "Fund Type is required" });
      continue;
    }

    // Calculate financial year
    const dt = new Date(Math.round((row.receiptDate - 25569) * 86400 * 1000));
    const month = dt.getMonth();
    const year = dt.getFullYear();
    const startYear = month >= 3 ? year : year - 1;
    const endYear = startYear + 1;
    const financialYear = `${startYear}-${String(endYear).slice(-2)}`;

    const centerCode = await getShortCenterName(row.centerName);
    const fundType = row.fundType;

    // Create groupKey for fund receipt grouping
    const groupKey = `${financialYear}/${centerCode}/${fundType}`;
    if (!fundReceiptGroups[groupKey]) fundReceiptGroups[groupKey] = [];
    fundReceiptGroups[groupKey].push(index);

    // Create unique key for main entry
    currentGroupKey = `${row.centerName}_${row.program}_${row.project}_${row.activityName}_${row.subactivityName}_${row.amountReceivedDate}_${row.utrTransactionNumber}`;

    // Field validations for main entry
    if (!row.centerName || row.centerName === "-")
      remark += "Center Name not found, ";
    if (!row.fundType || row.fundType === "-")
      remark += "Fund Type not found, ";
    if (!row.approvalNo || row.approvalNo === "-")
      remark += "Approval Number not found, ";
    if (!row.paymentType || row.paymentType === "-")
      remark += "Payment Type not found, ";
    if (!row.program || row.program === "-") remark += "Program not found, ";
    if (!row.project || row.project === "-") remark += "Project not found, ";
    if (!row.activityName || row.activityName === "-")
      remark += "Activity Name not found, ";
    if (!row.subactivityName || row.subactivityName === "-")
      remark += "Subactivity Name not found, ";
    if (!row.amountReceivedDate || row.amountReceivedDate === "-")
      remark += "Amount received date not found, ";
    if (!row.lhwrfBankName || row.lhwrfBankName === "-")
      remark += "LHWRF Bank Name not found, ";
    if (!row.lhwrfBranchName || row.lhwrfBranchName === "-")
      remark += "LHWRF Branch Name not found, ";
    if (!row.lhwrfAccountNumber || row.lhwrfAccountNumber === "-")
      remark += "LHWRF Account Number not found, ";

    if (remark === "") {
      let centerDetails = await getCenterDetails(row.centerName.trim());
      let programAvailability = allPrograms.find(
        (p) => p.fieldValue.toLowerCase() === row.program.toLowerCase().trim()
      );
      let projectAvailability = allProjects.find(
        (p) => p.fieldValue.toLowerCase() === row.project.toLowerCase().trim()
      );
      let activityAvailability = allActivities.find(
        (a) =>
          a.fieldValue.toLowerCase() === row.activityName.toLowerCase().trim()
      );
      let bankAccountNumberAvailability = allBankDetails.find(
        (b) =>
          b.bankAccountNumber.toString().trim() === row.lhwrfAccountNumber.toString().trim() 
          && b.branchName.toString().trim() === row.lhwrfBranchName.toString().trim() 
          && b.bankName.toString().trim() === row.lhwrfBankName.toString().trim() 
      );

      if (!programAvailability)
        remark += `${row.program} is not available in Program Master, `;
      if (!projectAvailability)
        remark += `${row.project} is not available in Project Master, `;
      if (!activityAvailability)
        remark += `${row.activityName} is not available in Activity Master, `;
      if (!bankAccountNumberAvailability)
        remark += ` Account no ${row.lhwrfAccountNumber} of ${row.lhwrfBankName} with ${row.lhwrfBranchName} branch is not available in Bank Master, `;

      if (remark === "") {
        let subactivityAvailability = await getSubactivitiesAvailability(
          row.program.toLowerCase().trim(),
          row.project.toLowerCase().trim(),
          row.activityName.toLowerCase().trim(),
          row.subactivityName.toLowerCase().trim()
        );

        if (subactivityAvailability.length > 0) {
          // Check for duplicates
          let combinationKey = `
          ${row.centerName.toLowerCase().trim()}_${row.program.toLowerCase().trim()}
          _${row.project.toLowerCase().trim()}
          _${row.activityName.toLowerCase().trim()}
          _${row.subactivityName.toLowerCase().trim()}
          _${row.fundType.toLowerCase().trim()}
          _${row.utrTransactionNumber}
          _${row.amountReceived}
          _${row.depositSlipNumber}
          _${row.amountReceivedDate}`;

          if (uniqueCombinations.has(combinationKey)) {
            remark +=
              "Duplicate Community Contribution Details found in the file, ";
            invalidData.push({ ...row, failedRemark: remark });
          } else {
            uniqueCombinations.add(combinationKey);
            // Add to contribution group
            contributionGroups[currentGroupKey] = {
              fundType: "Community Contribution",
              centerName: row.centerName.trim(),
              center_id: centerDetails?._id,
              approvalNo: row.approvalNo.trim(),
              paymentType: row.paymentType.trim(),
              program: subactivityAvailability[0].field1Value,
              program_id: subactivityAvailability[0].field1_id,
              project: subactivityAvailability[0].field2Value,
              project_id: subactivityAvailability[0].field2_id,
              activityName: subactivityAvailability[0].field3Value,
              activityName_id: subactivityAvailability[0].field3_id,
              subactivityName: subactivityAvailability[0].inputValue,
              subactivityName_id: subactivityAvailability[0]._id,
              fundReceiptNumber: null, // Placeholder, will be set later
              amountReceived: numberPattern.test(
                String(row.amountReceived).trim()
              )
                ? Number(String(row.amountReceived).trim())
                : NaN,
              amountReceivedDate: moment(
                typeof row?.amountReceivedDate === "number"
                  ? moment
                      .utc("1899-12-30")
                      .add(row?.amountReceivedDate, "days")
                  : row?.amountReceivedDate
              ).format("YYYY-MM-DD"),
              depositSlipNumber: row.depositSlipNumber,
              utrTransactionNumber: row.utrTransactionNumber,
              lhwrfBankName: row.lhwrfBankName.trim(),
              lhwrfBranchName: row.lhwrfBranchName.trim(),
              lhwrfAccountNumber: numberPattern.test(
                String(row.lhwrfAccountNumber).trim()
              )
                ? Number(String(row.lhwrfAccountNumber).trim())
                : null,
              totalContributors: row.totalContributors,
              contributorData: [
                {
                  contributorName: row.contributorName,
                  village: row.village !== "-" ? row.village : "",
                  aadhaarNo: row.aadhaarNo !== "-" ? row.aadhaarNo : null,
                  amountDeposited: numberPattern.test(
                    String(row.amountDeposited).trim()
                  )
                    ? Number(String(row.amountDeposited).trim())
                    : 0,
                  uploadTime: new Date(),
                  fileName: fileName,
                },
              ],
              totalDepositedAmount: numberPattern.test(
                String(row.amountDeposited).trim()
              )
                ? Number(String(row.amountDeposited).trim())
                : 0,
              fileName: fileName,
              createdBy: createdBy,
              createdAt: new Date(),
              index, // Store index for mapping receipt numbers
            };
          }
        } else {
          remark += `${row.program} ${row.project} ${row.activityName} ${row.subactivityName} are not linked with each other, `;
          invalidData.push({ ...row, failedRemark: remark });
        }
      } else {
        invalidData.push({ ...row, failedRemark: remark });
      }
    } else {
      invalidData.push({ ...row, failedRemark: remark });
    }
  }

  // Step 2: Generate fund receipt numbers for valid groups only
  const fundReceiptNosMap = {};
  for (const groupKey of Object.keys(fundReceiptGroups)) {
    const indexes = fundReceiptGroups[groupKey];
    // Filter only valid indexes
    const validIndexes = indexes.filter((idx) => {
      const group = Object.values(contributionGroups).find(
        (g) => g.index === idx
      );
      return group && !invalidData.some((d) => d.index === idx);
    });

    if (validIndexes.length === 0) continue;

    const sampleRow = excelData[validIndexes[0]];
    const centerName = sampleRow.centerName;
    const fundType = sampleRow.fundType;

    // Create dummy array with same number of elements
    const bulkArray = new Array(validIndexes.length).fill({});

    const fundReceiptNos = await generateFundReceiptNumber(
      centerName,
      fundType,
      bulkArray
    );

    validIndexes.forEach((idx, i) => {
      fundReceiptNosMap[idx] = fundReceiptNos[i];
    });
  }

  // Step 3: Assign fund receipt numbers to valid groups and perform final validations
  for (let groupKey in contributionGroups) {
    let group = contributionGroups[groupKey];
    let totalDeposited = group.totalDepositedAmount;
    let receivedAmount = group.amountReceived;

    // Assign fund receipt number
    group.fundReceiptNumber = fundReceiptNosMap[group.index] || null;

    const invalidContributor = group.contributorData.find((contributor) => {
      const aadhaarNo = contributor.aadhaarNo?.toString().trim();
      return aadhaarNo && !aadhaarPattern.test(aadhaarNo);
    });

    let existingRecord = await FundReceipt.findOne({
      fundType: "Community Contribution",
      centerName: group.centerName,
      program: group.program,
      project: group.project,
      activityName: group.activityName,
      subactivityName: group.subactivityName,
      amountReceivedDate: group.amountReceivedDate,
      utrTransactionNumber: group.utrTransactionNumber,
      depositSlipNumber: group.depositSlipNumber,
      amountReceived: group.amountReceived,
    });
  
    if (invalidContributor) {
      group.failedRemark = `Aadhaar No (${invalidContributor.aadhaarNo}) is not valid.`;
      invalidData.push(group);
    } else if (totalDeposited !== receivedAmount) {
      group.failedRemark = `Sum of contributor deposits (${totalDeposited}) does not match Amount Received (${receivedAmount}), `;
      invalidData.push(group);
    } else if (existingRecord) {
      group.failedRemark = `Community Contribution Details already exists.`;
      invalidData.push(group);
    } else if (!group.fundReceiptNumber) {
      group.failedRemark = `Failed to generate fund receipt number.`;
      invalidData.push(group);
    } else {
      validData.push(group);
    }
  }

  // Remove index from validData to clean up
  validData.forEach((group) => delete group.index);
  invalidData.forEach((item) => {
    if (item.index) delete item.index;
  });

  return { validData, invalidData };
}

const processCommunityContributionData1 = async (
  excelData,
  fileName,
  createdBy
) => {
  let validData = [];
  let invalidData = [];
  let uniqueCombinations = new Set();
  const numberPattern = /^\d+(\.\d+)?$/;

  const allPrograms = await getAllProgramMaster({});
  const allProjects = await getAllProjects({});
  const allActivities = await getAllActivities({});
  const allBankDetails = await getAllBankDetails({});

  let contributionGroups = {}; // Store grouped contributions
  let currentGroupKey = null; // Track the current active groupKey

  for (let k = 0; k < excelData.length; k++) {
    let row = excelData[k];
    let remark = "";

    let isContributorOnly =
      row.centerName === "-" &&
      row.program === "-" &&
      row.contributorName !== "-";

    // **Generate a clean, consistent group key**
    currentGroupKey = `${(row.centerName || "").trim().toLowerCase()}_${(
      row.program || ""
    )
      .trim()
      .toLowerCase()}_${(row.project || "").trim().toLowerCase()}_${(
      row.activityName || ""
    )
      .trim()
      .toLowerCase()}_${(row.subactivityName || "")
      .trim()
      .toLowerCase()}_${moment(row.amountReceivedDate, "DD/MM/YYYY").format(
      "YYYY-MM-DD"
    )}`;

    // // **Check for duplicates in the same session (Uploaded File)**
    // if (uniqueCombinations.has(currentGroupKey)) {
    //   remark += "Duplicate Community Contribution Details found in the uploaded file. ";
    // } else {
    //   uniqueCombinations.add(currentGroupKey);
    // }
    // console.log("row",row)
    // // **Check for duplicates in the database**
    // let existingEntry = await FundReceipt.findOne({
    //   centerName: row.centerName.trim(),
    //   approvalNo: row.approvalNo.trim(),
    //   paymentType: row.paymentType.trim(),
    //   program: row.program.trim(),
    //   project: row.project.trim(),
    //   activityName: row.activityName.trim(),
    //   subactivityName: row.subactivityName.trim(),
    //   amountReceivedDate: moment(row.amountReceivedDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
    //   utrTransactionNumber: row.utrTransactionNumber,
    // });

    // if (existingEntry) {
    //   remark += "Duplicate Community Contribution Details found in the database. ";
    // }

    // **Skip processing if it's already a duplicate**
    if (remark !== "") {
      invalidData.push({ ...row, failedRemark: remark });
      continue; // Move to next row without adding this to validData
    }

    // **Initialize the Group if not already created**
    if (!contributionGroups[currentGroupKey]) {
      contributionGroups[currentGroupKey] = {
        fundType: "Community Contribution",
        centerName: row.centerName.trim(),
        approvalNo: row.approvalNo.trim(),
        paymentType: row.paymentType.trim(),
        program: row.program.trim(),
        project: row.project.trim(),
        activityName: row.activityName.trim(),
        subactivityName: row.subactivityName.trim(),
        amountReceived: numberPattern.test(row.amountReceived)
          ? Number(row.amountReceived)
          : NaN,
        amountReceivedDate: moment(row.amountReceivedDate, "DD/MM/YYYY").format(
          "YYYY-MM-DD"
        ),
        depositSlipNumber: row.depositSlipNumber.trim(),
        utrTransactionNumber: row.utrTransactionNumber.trim(),
        lhwrfBankName: row.lhwrfBankName.trim(),
        lhwrfBranchName: row.lhwrfBranchName.trim(),
        lhwrfAccountNumber: numberPattern.test(row.lhwrfAccountNumber)
          ? Number(row.lhwrfAccountNumber)
          : null,
        contributorData: [],
        totalDepositedAmount: 0,
        fileName: fileName,
        createdBy: createdBy,
        createdAt: new Date(),
      };
    }

    // **Adding Contributor Data to the Current Group**
    if (isContributorOnly) {
      if (row.amountDeposited !== "-") {
        row.amountDeposited = row.amountDeposited.toString().trim();
        if (numberPattern.test(row.amountDeposited)) {
          let amountDeposited = Number(row.amountDeposited);

          // **Push contributor into the active group**
          contributionGroups[currentGroupKey].contributorData.push({
            contributorName: row.contributorName.trim(),
            village: row.village !== "-" ? row.village.trim() : "",
            aadhaarNo: row.aadhaarNo !== "-" ? row.aadhaarNo.trim() : null,
            amountDeposited: amountDeposited,
            uploadTime: new Date(),
            fileName: fileName,
          });

          // **Update Total Deposited Amount**
          contributionGroups[currentGroupKey].totalDepositedAmount +=
            amountDeposited;
        } else {
          remark += " Amount Deposited should only contain numbers, ";
        }
      }
    }
  }

  // **Final Validation: Check Total Deposited Amount Against Amount Received**
  for (let groupKey in contributionGroups) {
    let group = contributionGroups[groupKey];

    let totalDeposited = group.totalDepositedAmount;
    let receivedAmount = group.amountReceived;

    if (totalDeposited !== receivedAmount) {
      group.failedRemark = `Sum of contributor deposits (${totalDeposited}) does not match Amount Received (${receivedAmount}), `;
      invalidData.push(group);
    } else {
      validData.push(group);
    }
  }

  return { validData, invalidData };
};

exports.bulkUpload_fund_community_contribution = async (req, res, next) => {
  let excelData = req.body.data;
  let fileName = req.body.fileName;
  let createdBy = req.body.createdBy;

  try {
    let { validData, invalidData } = await processCommunityContributionData(
      excelData,
      fileName,
      createdBy
    );

    if (validData.length > 0) {
      await FundReceipt.insertMany(validData);
    }


    if (invalidData.length > 0) {
      let failedRecords = {
        FailedRecords: invalidData,
        fileName: fileName,
        totalRecords: invalidData.length,
      };
      await insertFailedRecords(failedRecords, req.body.updateBadData);
    }

    res.status(200).json({
      message: "Bulk upload process is completed successfully!",
      completed: true,
      success: true,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: error,
      success: false,
    });
  }
};

exports.bulkUpload_contributor_data = (req, res, next) => {
  var excelData = req.body.data;
  var validData = [];
  var invalidData = [];
  var invalidObjects = {};
  var remark = "";
  var failedRecords = [];
  var numberPattern = /^\d+(\.\d+)?$/;
  var uploadTime = new Date();

  var uniqueCombinations = new Set();

  // console.log("req.body",req.body,req.body.reqdata)
  processData();

  async function processData() {
    const CCDetails = await FundReceipt.findOne({ _id: req.body.reqdata._id });

    for (var k = 0; k < excelData.length; k++) {
      if (
        !excelData[k].contributorName ||
        excelData[k].contributorName === "-"
      ) {
        remark += " Contributor Name not found,";
      }
      if (!excelData[k].village || excelData[k].village === "-") {
        remark += " Village not found,";
      }
      if (excelData[k].aadhaarNo === "-") {
        remark += "Aadhaar Number not found. ";
      } else if (!/^\d{12}$/.test(excelData[k].aadhaarNo)) {
        remark +=
          "Aadhaar Number should be 12 digits long and contain only numbers. ";
      }
      if (excelData[k].amountDeposited === "-") {
        remark += "Amount Deposited not found";
      } else if (!numberPattern.test(excelData[k].amountDeposited)) {
        remark += "Amount Deposited should only contain numbers, ";
      }

      // Calculate the sum of amountDeposited
      const sumDeposited = excelData.reduce((accumulator, current) => {
        return accumulator + (current.amountDeposited || 0); // Ensure it adds 0 if amountDeposited is undefined
      }, 0);

      // Check if the sum matches the totalAmount
      if (CCDetails && sumDeposited !== CCDetails.amountReceived) {
        remark +=
          "The total amount does not match the sum of amount deposited.";
      }

      if (remark === "") {
        const contributorData = {
          contributorName: excelData[k].contributorName,
          village: excelData[k].village,
          aadhaarNo: excelData[k].aadhaarNo,
          amountDeposited: excelData[k].amountDeposited,
          fileName: req.body?.fileName,
          uploadTime: uploadTime,
        };
        validData.push(contributorData);
      } else {
        invalidObjects = excelData[k];
        invalidObjects.failedRemark = remark;
        invalidData.push(invalidObjects);
      }
      remark = "";
    }

    if (remark === "") {
      if (validData.length > 0) {
        try {
          const addCCData = FundReceipt.updateOne(
            { _id: req.body.reqdata._id },
            {
              $set: {
                contributorData: validData,
                totalContributors: validData.length,
              },
            }
          )
            .exec()
            .then((data) => {
              // console.log("addCCData data", data);
            })
            .catch((error) => {});
        } catch (error) {
          remark = "Error while updating document: " + error.message;
          invalidObjects = excelData[k];
          invalidObjects.failedRemark = remark;
          invalidData.push(invalidObjects);
        }
      }
    }
    if (invalidData.length > 0) {
      failedRecords.FailedRecords = invalidData;
      failedRecords.fileName = req.body.fileName;
      failedRecords.totalRecords = invalidData.length;
      await insertFailedRecords(failedRecords, req.body.updateBadData);
    }

    res.status(200).json({
      message: "Bulk upload of contributor data completed successfully!",
      completed: true,
    });
  }
};

function generateFundreceiptNumbers(initialNumber, array) {
  // Extract the numeric part and the prefix

  const parts = initialNumber.split("/");
  const prefix = parts.slice(0, -1).join("/") + "/";
  let number = parseInt(parts[parts.length - 1]);

  // Assign the fundReceiptNumber to each object
  array.forEach((obj) => {
    const newNumber = String(number).padStart(6, "0"); // Ensure the number has leading zeros
    obj.fundReceiptNumber = prefix + newNumber;
    number += 1; // Increment the number
  });

  return array;
}

function isValidDateFormatDDMMYYYY(inputDate) {
  // If input is a number (e.g., Excel timestamp), convert to DD/MM/YYYY format
  if (typeof inputDate === "number") {
    inputDate = moment(inputDate).format("DD/MM/YYYY");
  }

  // Strict regex to validate only DD/MM/YYYY format
  const date_regex = /^(0[1-9]|[1-2][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  return date_regex.test(inputDate);

  // // Test if the format matches
  // if (!date_regex.test(inputDate)) {
  //   return false;
  // }

  // // Further check to validate the actual date exists
  // const [day, month, year] = inputDate.split("/").map(Number);
  // const isValidDate = new Date(year, month - 1, day).getDate() === day;

  // return isValidDate;
}

exports.bulkUpload_fund_external_grant = (req, res, next) => {
  // console.log("req.body.data",req.body.data)
  var excelData = req.body.data;
  var validData = [];
  var validObjects = [];
  var invalidData = [];
  var invalidObjects = {};
  var remark = "";
  var failedRecords = [];
  var Count = 0;
  var DuplicateCount = 0;
  const numberPattern = /^\d+(\.\d+)?$/;

  var uniqueCombinations = new Set();

  processData();
  async function processData() {
    var centerName = excelData[0]?.centerName.toUpperCase();

    var allPrograms = await getAllProgramMaster({});
    var allProjects = await getAllProjects({});
    var allActivities = await getAllActivities({});
    var allBankDetails = await getAllBankDetails({});

    const fundReceiptGroups = {}; // Example: { "2024-25/PUN/External Grant": [0,1,2], … }
    for (let index = 0; index < excelData.length; index++) {
      const row = excelData[index];

      const dt = new Date(
        Math.round((row.receiptDate - 25569) * 86400 * 1000) // assuming you have receipt date in excel
      );
      const month = dt.getMonth();
      const year = dt.getFullYear();
      const startYear = month >= 3 ? year : year - 1;
      const endYear = startYear + 1;
      const financialYear = `${startYear}-${String(endYear).slice(-2)}`;

      const centerCode = await getShortCenterName(row.centerName);
      const fundType = row.fundType; // External Grant / Community Contribution

      const groupKey = `${financialYear}/${centerCode}/${fundType}`;

      if (!fundReceiptGroups[groupKey]) fundReceiptGroups[groupKey] = [];
      fundReceiptGroups[groupKey].push(index);
    }


    const fundReceiptNosMap = {}; // row-index → generated receiptNo
    for (const groupKey of Object.keys(fundReceiptGroups)) {
      const indexes = fundReceiptGroups[groupKey];
      const sampleRow = excelData[indexes[0]];

      const receiptDate = new Date(
        Math.round((sampleRow.receiptDate - 25569) * 86400 * 1000)
      );

      // Parse from groupKey if needed
      const centerName = sampleRow.centerName;
      const fundType = sampleRow.fundType;

      // Create dummy array with same number of elements
      const bulkArray = new Array(indexes.length).fill({});

      const fundReceiptNos = await generateFundReceiptNumber(
        centerName,
        fundType,
        bulkArray
      );

      indexes.forEach((idx, i) => {
        fundReceiptNosMap[idx] = fundReceiptNos[i];
      });
    }

    for (var k = 0; k < excelData.length; k++) {
      if (excelData[k].centerName === "-") {
        remark += " Center Name not found";
      }
      if (excelData[k].program === "-") {
        remark += " program not found";
      }
      if (excelData[k].project === "-") {
        remark += " project not found";
      }
      if (excelData[k].fundingAgencyName === "-") {
        remark += " fundingAgencyName not found";
      }

      if (excelData[k].amountReceivedDate == "-") {
        remark += "Amount received date not found";
      } else {
        // console.log("excelData[k].amountReceivedDate",excelData[k].amountReceivedDate)
        var validDate = isValidDateFormatDDMMYYYY(
          excelData[k].amountReceivedDate
        );
        if (validDate) {
          // console.log("validDate=======================================",validDate)
          var amountReceivedDate;
          if (typeof excelData[k].amountReceivedDate == "number") {
            amountReceivedDate = moment(
              new Date(
                Math.round(
                  (excelData[k].amountReceivedDate - 25569) * 86400 * 1000
                )
              )
            ).format("YYYY-MM-DD");
            // console.log("amountReceivedDate************", amountReceivedDate);
          } else {
            var amountReceivedDate1 = moment(
              excelData[k].amountReceivedDate,
              "YYYY-MM-DD"
            )._i;
            var DD = amountReceivedDate1.substring(0, 2);
            var MM = amountReceivedDate1.substring(3, 5);
            var YYYY = amountReceivedDate1.substring(6, 10);
            amountReceivedDate = YYYY + "-" + MM + "-" + DD;
           
          }
        } else {
          remark +=
            "amountReceivedDate is not valid. The format should be DD/MM/YYYY, ";
        }
      }
      if (excelData[k].amountReceived === "-") {
        remark += " amountReceived not found";
      } else if (!numberPattern.test(excelData[k].amountReceived)) {
        remark += " amountReceived should only contain numbers, ";
      }
      if (excelData[k].utrTransactionNumber === "-") {
        remark += " utrTransactionNumber not found";
      }
      if (excelData[k].lhwrfBankName === "-") {
        remark += " lhwrfBankName not found";
      }
      if (excelData[k].lhwrfBranchName === "-") {
        remark += " lhwrfBranchName not found";
      }
      const lhwrfAccountNumber = String(excelData[k].lhwrfAccountNumber).trim();
      if (lhwrfAccountNumber === "-") {
        remark += "LHWRF account number not found";
      } else if (!numberPattern.test(lhwrfAccountNumber)) {
        remark += "lhwrfAccountNumber should only contain numbers, ";
      }

      // if (excelData[k].lhwrfAccountNumber === "-") {
      //   remark += " lhwrfAccountNumber not found";
      // } else  if (!numberPattern.test(excelData[k].lhwrfAccountNumber)) {
      //   remark += " lhwrfAccountNumber should only contain numbers, ";
      // }

      let combinationKey = `${excelData[k].centerName
        .toLowerCase()
        .trim()}_${excelData[k].program.toLowerCase().trim()}_${excelData[
        k
      ].project
        .toLowerCase()
        .trim()}_${excelData[k].activityName.toLowerCase().trim()}_${excelData[
        k
      ].subactivityName
        .toLowerCase()
        .trim()}_${excelData[k].amountReceivedDate}_${
        excelData[k].utrTransactionNumber
      }`;

      if (uniqueCombinations.has(combinationKey)) {
        remark = "Duplicate External Grant found in the file.";
      } else {
        // Add the combination to the set if not a duplicate
        uniqueCombinations.add(combinationKey);
      }

      // const activityNameCheck = excelData[k].activityName?.trim() || "";
      // const subactivityNameCheck = excelData[k].subactivityName?.trim() || "";

      // const isActivityProvided = activityNameCheck !== "";
      // const isSubactivityProvided = subactivityNameCheck !== "";

      if (remark === "") {
        var centerDetails = await getCenterDetails(
          excelData[k]?.centerName.trim()
        );
        // console.log("centerDetails",centerDetails);
        var programAvailability = allPrograms.filter((item) => {
          if (
            item.fieldValue.toLowerCase() ===
            excelData[k].program.toLowerCase().trim()
          ) {
            return item;
          }
        });
        // console.log("programAvailability",programAvailability)
        var projectAvailability = allProjects.filter((item) => {
          if (
            item.fieldValue.toLowerCase() ===
            excelData[k].project.toLowerCase().trim()
          ) {
            return item;
          }
        });
        // console.log("projectAvailability",projectAvailability)

        if (
          excelData[k].activityName !== "-" &&
          excelData[k].activityName.trim() !== ""
        ) {
          var activityAvailability = allActivities.filter((item) => {
            return (
              item.fieldValue.toLowerCase() ===
              excelData[k].activityName.toLowerCase().trim()
            );
          });

          if (activityAvailability.length === 0) {
            remark += ` ${excelData[k].activityName} is not available in Activity Master,`;
          }
        } else {
          // If activityName is blank, set it to an empty string
          validObjects.activityName = "";
          validObjects.activityName_id = null;
        }

        // if (isActivityProvided && isSubactivityProvided) {
        //   var subactivitiesAvailability = await getSubactivitiesAvailability(
        //     excelData[k].program.toLowerCase().trim(),
        //     excelData[k].project.toLowerCase().trim(),
        //     excelData[k].activityName.toLowerCase().trim(),
        //     excelData[k].subactivityName.toLowerCase().trim()
        //   );
        // }

        if (
          excelData[k].activityName === "-" ||
          excelData[k].activityName.trim() === ""
        ) {
          validObjects.activityName = "";
          validObjects.subactivityName = "";
          validObjects.activityName_id = null;
          validObjects.subactivityName_id = null;
        } else {
          // Only perform the subactivity availability check if both fields are provided
          var subactivitiesAvailability = await getSubactivitiesAvailability(
            excelData[k].program.toLowerCase().trim(),
            excelData[k].project.toLowerCase().trim(),
            excelData[k].activityName.toLowerCase().trim(),
            excelData[k].subactivityName.toLowerCase().trim()
          );

          if (subactivitiesAvailability.length > 0) {
            validObjects.activityName =
              subactivitiesAvailability[0].field3Value;
            validObjects.subactivityName =
              subactivitiesAvailability[0].inputValue;
            validObjects.activityName_id =
              subactivitiesAvailability[0].field3_id;
            validObjects.subactivityName_id = subactivitiesAvailability[0]._id;
          } else {
            remark += `Linked subactivity details not found for provided combination. `;
          }
        }

        var bankNameAvailability = allBankDetails.filter((item) => {
          if (
            item.bankName.toLowerCase() ===
            excelData[k].lhwrfBankName.toLowerCase().trim()
          ) {
            return item;
          }
        });
        var branchNameAvailability = allBankDetails.filter((item) => {
          if (
            item.branchName.toLowerCase() ===
            excelData[k].lhwrfBranchName.toLowerCase().trim()
          ) {
            return item;
          }
        });
        var bankAccountNumberAvailability = allBankDetails.filter((item) => {
          if (item.bankAccountNumber === excelData[k].lhwrfAccountNumber) {
            return item;
          }
        });
        // console.log("remark 1", remark);
        if (programAvailability.length === 0) {
          remark +=
            excelData[k].program + " is not available in Program Master,";
        }
        // console.log("remark 2", remark);
        if (projectAvailability.length === 0) {
          remark +=
            " " + excelData[k].project + " is not available in Project Master,";
        }
        // console.log("remark 3", remark);

        // if (activityAvailability.length === 0) {
        //   remark +=
        //     " " +
        //     excelData[k].activityName +
        //     " is not available in Activity Master,";
        // }
        // console.log("remark 4", remark);
        // if (
        //   isActivityProvided &&
        //   isSubactivityProvided &&
        //   subactivitiesAvailability.length === 0
        // ) {
        //   remark +=
        //     " " +
        //     excelData[k].subactivityName +
        //     " is not available in Subactivity Master. Program, Project, Activity, Subactivity should be link with each other";
        // }
        // console.log("remark 5", remark);

        if (bankNameAvailability.length === 0) {
          remark +=
            " " +
            excelData[k].lhwrfBankName +
            " is not available in Bank Details Master,";
        }
        if (branchNameAvailability.length === 0) {
          remark +=
            " " +
            excelData[k].lhwrfBranchName +
            " is not available in Bank Details Master,";
        }
        if (bankAccountNumberAvailability.length === 0) {
          remark +=
            " " +
            excelData[k].lhwrfAccountNumber +
            " is not available in Bank Details Master,";
        }
        // console.log("remark 6", remark);
        if (remark === "") {
          // const verifyApproval    = await verifyApprovalNumber(excelData[k].approvalNo.toString().trim());
          // console.log("verifyApproval",verifyApproval)
          // if (verifyApproval) {

          // var subactivityName = subactivitiesAvailability[0];

          if (subactivitiesAvailability?.length > 0) {
            var program = subactivitiesAvailability[0].field1Value;
            var project = subactivitiesAvailability[0].field2Value;
            var program_id = subactivitiesAvailability[0].field1_id;
            var project_id = subactivitiesAvailability[0].field2_id;
          } else {
            var program = excelData[k].program || "";
            var project = excelData[k].project || "";
            var program_id = null;
            var project_id = null;
          }
          // var activityName = finalActivityName;
          // var subactivityName_id = subactivitiesAvailability[0]._id;

          // var activityName_id = subactivitiesAvailability[0].field3_id;

          var query = {
            centerName: centerDetails?.centerName,
            fundType: "External Grant",
          };
          var allFunds = await getAllFunds(query); // pass center_id to get less data
          var FundExists = allFunds.filter((item) => {
            if (
              item.centerName.toLowerCase() ===
                excelData[k].centerName.toLowerCase().trim() &&
              item.program.toLowerCase() ===
                excelData[k].program.toLowerCase().trim() &&
              item.project.toLowerCase() ===
                excelData[k].project.toLowerCase().trim() &&
              item.activityName.toLowerCase() ===
                excelData[k].activityName.toLowerCase().trim() &&
              item.fundType.toLowerCase() === "external grant" &&
              item.subactivityName.toLowerCase() ===
                excelData[k].subactivityName.toLowerCase().trim() &&
              moment(item.amountReceivedDate).format("YYYY-MM-DD") ===
                moment(
                  new Date(
                    Math.round(
                      (excelData[k].amountReceivedDate - 25569) * 86400 * 1000
                    )
                  )
                ).format("YYYY-MM-DD")
            ) {
              return item;
            }
          });

          const fundReceiptNoToBeSubmitted = fundReceiptNosMap[k];

          if (FundExists.length === 0) {
            validObjects = excelData[k];
            validObjects.fundType = "External Grant";
            // validObjects.fundReceiptNumber    = fundReceiptNumber;

            validObjects.centerName = centerDetails?.centerName;
            validObjects.center_id = centerDetails?._id;
            validObjects.amountReceivedDate = amountReceivedDate;

            validObjects.program_id = program_id;
            validObjects.project_id = project_id;
            // validObjects.activityName_id = activityName_id
            //   ? activityName_id
            //   : null;
            // validObjects.subactivityName_id = subactivityName_id
            //   ? subactivityName_id
            //   : null;

            validObjects.program = program;
            validObjects.project = project;
            validObjects.fundReceiptNumber = fundReceiptNoToBeSubmitted;

            // validObjects.activityName = activityName;
            // validObjects.subactivityName = subactivityName;

            validObjects.fileName = req.body?.fileName;
            validObjects.createdBy = req.body?.createdBy;
            validObjects.createdAt = new Date();
            // console.log("validObjects",validObjects)
            validData.push(validObjects);
          } else {
            remark = "This Fund details already exists.";
            invalidObjects = excelData[k];
            invalidObjects.failedRemark = remark;
            invalidData.push(invalidObjects);
         
          }
          // }else{
          //   remark = "Approval Number is not available.";
          //   invalidObjects = excelData[k];
          //   invalidObjects.failedRemark = remark;
          //   invalidData.push(invalidObjects);
          //   // console.log(
          //   //   invalidObjects,
          //   //   invalidObjects.failedRemark
          //   // );
          // }
        } else {
          invalidObjects = excelData[k];
          invalidObjects.failedRemark = remark;
          invalidData.push(invalidObjects);
        
        }
      } else {
        invalidObjects = excelData[k];
        invalidObjects.failedRemark = remark;
        invalidData.push(invalidObjects);
      }
      remark = "";
    }

    // let currentFundReceiptNumber = fundReceiptNumber;
    // var validData = generateFundreceiptNumbers(
    //   currentFundReceiptNumber,
    //   validData
    // );

    FundReceipt.insertMany(validData)
      .then(async (data) => {})
      .catch((err) => {
        console.log(err);
      });
    // console.log("invalidData", invalidData.length);
    if (invalidData.length > 0) {
      failedRecords.FailedRecords = invalidData;
      failedRecords.fileName = req.body.fileName;
      failedRecords.totalRecords = invalidData.length;
      const failedData = await insertFailedRecords(
        failedRecords,
        req.body.updateBadData
      );
      // console.log("failedData", failedData);
    }
    res.status(200).json({
      message: "Bulk upload process is completed successfully!",
      completed: true,
    });
  }
};

var getAllBankDetails = async () => {
  return new Promise(function (resolve, reject) {
    BankDetails.find()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
var verifyApprovalNumber = (approvalNo) => {
  return new Promise(function (resolve, reject) {
    // console.log("unit",unit)
    Approval.findOne({ approvalNo: approvalNo })
      .then((data) => {
        // console.log("data",data)
        resolve(data?.approvalNo);
      })
      .catch((err) => {
        console.log("getCenterDetails err", err);
        reject(err);
      });
  });
};
var getCenterDetails = async (centerName) => {
  return new Promise(function (resolve, reject) {
    CenterDetails.findOne({ centerName: centerName })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("getCenterDetails err", err);
        reject(err);
      });
  });
};
var getAllProgramMaster = async () => {
  return new Promise(function (resolve, reject) {
    ProgramMaster.find()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
var getAllProjects = async ({}) => {
  return new Promise(function (resolve, reject) {
    ProjectMaster.find({})
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
var getAllActivities = async ({}) => {
  return new Promise(function (resolve, reject) {
    ActivityMaster.find({})
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

var escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters
};
var getSubactivitiesAvailability = async (
  program,
  project,
  activityName,
  subactivityName
) => {
  return new Promise(function (resolve, reject) {
    Subactivity.find({
      field1Value: new RegExp(`^${escapeRegExp(program.trim())}$`, "i"),
      field2Value: new RegExp(`^${escapeRegExp(project.trim())}$`, "i"),
      field3Value: new RegExp(`^${escapeRegExp(activityName.trim())}$`, "i"),
      inputValue: new RegExp(`^${escapeRegExp(subactivityName.trim())}$`, "i"),
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

var getAllFunds = async (query) => {
  return new Promise(function (resolve, reject) {
    FundReceipt.find(query)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

var insertFailedRecords = async (invalidData, updateBadData) => {
  //// console.log('invalidData',invalidData);
  return new Promise(function (resolve, reject) {
    FailedRecords.find({ fileName: invalidData.fileName })
      .exec()
      .then((data) => {
        if (data.length > 0) {
          //// console.log('data',data[0].failedRecords.length)
          if (data[0].failedRecords.length > 0) {
            if (updateBadData) {
              FailedRecords.updateOne(
                { fileName: invalidData.fileName },
                { $set: { failedRecords: [] } }
              )
                .then((data) => {
                  if (data.modifiedCount === 1) {
                    FailedRecords.updateOne(
                      { fileName: invalidData.fileName },
                      {
                        $set: {
                          totalRecords: invalidData.totalRecords,
                          // 'failedRecords' : invalidData.FailedRecords
                        },
                        $push: { failedRecords: invalidData.FailedRecords },
                      }
                    )
                      .then((data) => {
                        if (data.modifiedCount === 1) {
                          resolve(data);
                        } else {
                          resolve(data);
                        }
                      })
                      .catch((err) => {
                        reject(err);
                      });
                  } else {
                    resolve(0);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            } else {
              FailedRecords.updateOne(
                { fileName: invalidData.fileName },
                {
                  $set: {
                    totalRecords: invalidData.totalRecords,
                    // 'failedRecords' : invalidData.FailedRecords
                  },
                  $push: { failedRecords: invalidData.FailedRecords },
                }
              )
                .then((data) => {
                  if (data.modifiedCount === 1) {
                    resolve(data);
                  } else {
                    resolve(data);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            }
          } else {
            FailedRecords.updateOne(
              { fileName: invalidData.fileName },
              {
                $set: {
                  totalRecords: invalidData.totalRecords,
                  // 'failedRecords' : invalidData.FailedRecords
                },
                $push: { failedRecords: invalidData.FailedRecords },
              }
            )
              .then((data) => {
                if (data.modifiedCount === 1) {
                  resolve(data);
                } else {
                  resolve(data);
                }
              })
              .catch((err) => {
                reject(err);
              });
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
            .then((data) => {
              resolve(data._id);
            })
            .catch((err) => {
              // console.log(err);
              reject(err);
            });
        }
      });
  });
};

var removeFailedRecords = async (fileName) => {
  return new Promise(function (resolve, reject) {
    FundReceipt.deleteMany({ fileName: fileName })
      .exec()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.filedetails = (req, res, next) => {
  var finaldata = {};
  // console.log(req.params.fileName)
  FundReceipt.find({
    fileName: req.params.fileName,
    fundType: req.params.fundType,
  })
    .exec()
    .then((data) => {
      //finaldata.push({goodrecords: data})
      finaldata.goodrecords = data;
      finaldata.totalRecords = data.length;
      FailedRecords.find({ fileName: req.params.fileName })
        .exec()
        .then((badData) => {
          var failedRecords =
            badData.length > 0 ? badData[0].failedRecords : [];
          finaldata.failedRecords = failedRecords.flat();
          finaldata.totalRecords = badData[0]?.totalRecords;
          // console.log("filedetails finaldata.failedRecords=======>", finaldata.failedRecords);
          res.status(200).json(finaldata);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.community_contributors_filedetails = (req, res, next) => {
  // console.log(req.params,"req.params")
  var finaldata = {};
  FundReceipt.aggregate([
    {
      $match: {
        fundType: "Community Contribution",
        "contributorData.fileName": req.params.fileName,
      },
    },
    { $unwind: "$contributorData" },
  ])
    .exec()
    .then((data) => {
      // console.log("data",data)
      finaldata.goodrecords = data;
      finaldata.totalRecords = data.length;
      FailedRecords.find({ fileName: req.params.fileName })
        .exec()
        .then((badData) => {
          var failedRecords =
            badData.length > 0 ? badData[0]?.failedRecords : [];
          finaldata.failedRecords = failedRecords.flat();
          finaldata.totalRecords = badData[0]?.totalRecords;
          res.status(200).json(finaldata);
        })
        .catch((err) => {
          console.log("err", err);
          res.status(500).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).json({
        error: err,
      });
    });
};
exports.update_fund = (req, res, next) => {
  FundReceipt.updateOne(
    { _id: req.body.ID },
    {
      $set: {
        approvalNo: req.body.approvalNo,
        paymentType: req.body.paymentType,
        center_id: req.body.center_id,
        centerName: req.body.centerName,
        program_id: req.body.program_id,
        program: req.body.program,
        project_id: req.body.project_id,
        project: req.body.project,
        activityName_id: req.body.activityName_id,
        activityName: req.body.activityName,
        subactivityName_id: req.body.subactivityName_id,
        subactivityName: req.body.subactivityName,
        fundReceiptNumber: req.body.fundReceiptNumber,
        amountReceivedDate: req.body.amountReceivedDate,
        amountReceived: req.body.amountReceived,
        depositSlipNumber: req.body.depositSlipNumber,
        utrTransactionNumber: req.body.utrTransactionNumber,
        bank_id: req.body.bank_id,
        lhwrfBankName: req.body.lhwrfBankName,
        lhwrfBranchName: req.body.lhwrfBranchName,
        lhwrfAccountNumber: req.body.lhwrfAccountNumber,
        totalContributors: req.body.totalContributors,
        contributorData: req.body.contributorData,
      },
    }
  )
    .exec()
    .then((data) => {
      // if(data.modifiedCount === 1){
      res.status(200).json({
        data,
        success: true,
        message: "Fund Details updated Successfully.",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.list_grant = (req, res, next) => {
  FundReceipt.find()
    // .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
  // }
};

exports.list_cc = (req, res, next) => {
  FundReceipt.find()
    // .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
  // }
};

exports.list_fund_with_limitsOld = (req, res, next) => {
  var query = "1";
  if (req.params.center_id === "all") {
    query = {};
  } else {
    query = { center_id: req.params.center_id };
  }
  if (query != "1") {
    FundReceipt.find(query)
      .sort({ createdAt: -1 })
      .exec()
      .then((data) => {
        if (data) {
          res
            .status(200)
            .json(data.slice(req.body.startRange, req.body.limitRange));
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
};

exports.list_fund_with_limits = (req, res, next) => {
  let recsPerPage = req.params.recsPerPage;
  let pageNum = req.params.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  if (req.body.center_ID === "all") {
    query = {};
  } else {
    query = { center_id: req.body.center_ID };
  }

  if (query != "1") {
    FundReceipt.estimatedDocumentCount(query)
      .then((totalRecs) => {
        // console.log("totalRecs => ", totalRecs);
        FundReceipt.find(query)
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage))
          .then((data) => {
            var grantData = data.map((item, index) => {
              return {
                _id: item._id,
                center_id: item.center_id ? item.center_id : "all",
                centerName: item.centerName ? item.centerName : "All",
                program_id: item.program_id,
                program: item.program,
                project_id: item.project_id,
                project: item.project,
                activityName_id: item.activityName_id,
                activityName: item.activityName,
                subactivityName_id: item.subactivityName_id,
                subactivityName: item.subactivityName,
                fundingAgencyName: item.fundingAgencyName,
                fundReceiptNumber: item.fundReceiptNumber,
                amountReceivedDate: item.amountReceivedDate,
                amountReceived: item.amountReceived,
                utrTransactionNumber: item.utrTransactionNumber,
                bank_id: item.bank_id,
                lhwrfBankName: item.lhwrfBankName,
                lhwrfBranchName: item.lhwrfBranchName,
                lhwrfAccountNumber: item.lhwrfAccountNumber,
              };
            });
            // console.log("CCData", grantData);
            res.status(200).json({
              totalRecs: totalRecs,
              tableData: grantData,
              success: true,
            });
          })
          .catch((error) => {
            // console.log("Error in CCList  => ", error);
            res.status(500).json({ errorMsg: error.message, success: false });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
};

exports.list_grant_with_limits = (req, res, next) => {
  let recsPerPage = req.params.recsPerPage;
  let pageNum = req.params.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  if (req.body.center_ID === "all") {
    query = {};
  } else {
    query = { center_id: req.body.center_ID };
  }
 
  if (query != "1") {
    FundReceipt.estimatedDocumentCount(query)
      .then((totalRecs) => {
        // console.log("totalRecs => ", totalRecs);
        FundReceipt.find(query)
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage))
          .then((data) => {
            var grantData = data.map((item, index) => {
              return {
                _id: item._id,
                center_id: item.center_id ? item.center_id : "all",
                centerName: item.centerName ? item.centerName : "All",
                program_id: item.program_id,
                program: item.program,
                project_id: item.project_id,
                project: item.project,
                activityName_id: item.activityName_id,
                activityName: item.activityName,
                subactivityName_id: item.subactivityName_id,
                subactivityName: item.subactivityName,
                fundingAgencyName: item.fundingAgencyName,
                fundReceiptNumber: item.fundReceiptNumber,
                amountReceivedDate: item.amountReceivedDate,
                amountReceived: item.amountReceived,
                utrTransactionNumber: item.utrTransactionNumber,
                bank_id: item.bank_id,
                lhwrfBankName: item.lhwrfBankName,
                lhwrfBranchName: item.lhwrfBranchName,
                lhwrfAccountNumber: item.lhwrfAccountNumber,
              };
            });
            // console.log("CCData", grantData);
            res.status(200).json({
              totalRecs: totalRecs,
              tableData: grantData,
              success: true,
            });
          })
          .catch((error) => {
            // console.log("Error in CCList  => ", error);
            res.status(500).json({ errorMsg: error.message, success: false });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
};

exports.list_funds_with_filters = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);

  let query = {};
  query.fundType = req.body.fundType;

  const centerArray = globalVariable.centersArray;

  // console.log("centersArray", centerArray);

  if (req.body.fromDate !== "all" && req.body.toDate !== "all")
    query.amountReceivedDate = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  if (req.body.fundingAgencyName !== "all")
    query.fundingAgencyName = req.body.fundingAgencyName;
  if (req.body.center_ID !== "all") query.center_id = req.body.center_ID;
  if (req.body.quarter !== "all") query.quarter = req.body.quarter;
  if (req.body.program_id !== "all") query.program_id = req.body.program_id;
  if (req.body.project_id !== "all") query.project_id = req.body.project_id;
  if (req.body.activityName_id !== "all")
    query.activityName_id = req.body.activityName_id;
  if (req.body.subactivityName_id !== "all")
    query.subactivityName_id = req.body.subactivityName_id;
  //  search text condition
  // console.log("req.body.searchText", req.body);
  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
    query.$or = [
      { centerName: searchRegex },
      { fundingAgencyName: searchRegex },
      { quarter: searchRegex },
      { program: searchRegex },
      { project: searchRegex },
      { activityName: searchRegex },
      { subactivityName: searchRegex },
      { unit: searchRegex },
      { fundReceiptNumber: searchRegex },
      { lhwrfBranchName: searchRegex },
      { paymentType: searchRegex },
      { lhwrfBranchName: searchRegex },
      { approvalNo: searchRegex },
      { lhwrfBankName: searchRegex },
      { lhwrfBranchName: searchRegex },
      { paymentType: searchRegex },
    ];
  }
  // console.log("query", query);

  // FundReceipt.estimatedDocumentCount(query)
  FundReceipt.countDocuments(query)
    .then((totalRecs) => {
      // console.log("totalRecs => ", totalRecs);
      // FundReceipt.find(query)
      //   .skip(parseInt(skipRec))
      //   .limit(parseInt(recsPerPage))
      let fundReceiptQuery = FundReceipt.find(query);
      if (!req.body.removePagination) {
        fundReceiptQuery = fundReceiptQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }
      fundReceiptQuery
        .sort({ createdAt: -1 })
        .then((data) => {
          var grantData = data.map((item, index) => {
            return {
              _id: item._id,
              center_id: item.center_id ? item.center_id : "--NA--",
              centerName: item.centerName ? item.centerName : "--NA--",
              approvalNo: item?.approvalNo ? item?.approvalNo : "--NA--",
              paymentType: item?.paymentType ? item?.paymentType : "--NA--",
              program_id: item.program_id ? item.program_id : "--NA--",
              program: item.program ? item.program : "--NA--",
              project_id: item.project_id ? item.project_id : "--NA--",
              project: item.project ? item.project : "--NA--",
              activityName_id: item.activityName_id
                ? item.activityName_id
                : "--NA--",
              activityName: item.activityName ? item.activityName : "--NA--",
              subactivityName_id: item.subactivityName_id
                ? item.subactivityName_id
                : "--NA--",
              subactivityName: item.subactivityName
                ? item.subactivityName
                : "--NA--",
              fundingAgencyName: item.fundingAgencyName
                ? item.fundingAgencyName
                : "--NA--",
              fundReceiptNumber: item.fundReceiptNumber
                ? item.fundReceiptNumber
                : "--NA--",
              amountReceivedDate: item.amountReceivedDate
                ? moment(item.amountReceivedDate).format("DD-MM-YYYY")
                : "--NA--",
              amountReceived: item.amountReceived ? item.amountReceived : 0,
              depositSlipNumber: item.depositSlipNumber
                ? item.depositSlipNumber
                : "--NA--",
              utrTransactionNumber: item.utrTransactionNumber
                ? item.utrTransactionNumber
                : "--NA--",
              bank_id: item.bank_id ? item.bank_id : "--NA--",
              lhwrfBankName: item.lhwrfBankName ? item.lhwrfBankName : "--NA--",
              lhwrfBranchName: item.lhwrfBranchName
                ? item.lhwrfBranchName
                : "--NA--",
              lhwrfAccountNumber: item.lhwrfAccountNumber
                ? item.lhwrfAccountNumber
                : "--NA--",
              totalContributors: item.totalContributors
                ? item.totalContributors
                : 0,
              contributorData: item.contributorData
                ? item.contributorData
                : "--NA--",
            };
          });
          var amountReceived = 0;
          var totalContributors = 0;
          for (var index = 0; index < grantData.length; index++) {
            amountReceived += grantData[index].amountReceived
              ? grantData[index].amountReceived
              : 0;
            totalContributors += grantData[index].totalContributors
              ? grantData[index].totalContributors
              : 0;
          }
          if (index >= grantData.length && grantData.length > 0) {
            grantData.push({
              _id: 0,
              center_id: "-",
              centerName: "Total",
              approvalNo: "-",
              paymentType: "-",
              program_id: "-",
              program: "-",
              project_id: "-",
              project: "-",
              activityName_id: "-",
              activityName: "-",
              subactivityName_id: "-",
              subactivityName: "-",
              fundingAgencyName: "-",
              fundReceiptNumber: "-",
              amountReceivedDate: "-",
              amountReceived: amountReceived,
              depositSlipNumber: "-",
              utrTransactionNumber: "-",
              bank_id: "-",
              lhwrfBankName: "-",
              lhwrfBranchName: "-",
              lhwrfAccountNumber: "-",
              totalContributors: totalContributors,
              contributorData: "-",
            });
          }
          res.status(200).json({
            totalRecs: totalRecs,
            tableData: grantData,
            success: true,
          });
        })
        .catch((error) => {
          console.log("Error in CCList  => ", error);
          res.status(500).json({ errorMsg: error.message, success: false });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.contribution_report = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);

  let query = {};
  query.fundType = req.body.fundType;

  if (req.body.fromDate !== "all" && req.body.toDate !== "all")
    query.amountReceivedDate = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  if (req.body.center_ID !== "all") {
    try {
      query.center_id = new mongoose.Types.ObjectId(req.body.center_ID);
    } catch (err) {
      return res
        .status(400)
        .json({ errorMsg: "Invalid Center ID format", success: false });
    }
  }
  if (req.body.program_id !== "all") query.program_id = req.body.program_id;
  if (req.body.project_id !== "all") query.project_id = req.body.project_id;
  if (req.body.activityName_id !== "all")
    query.activityName_id = req.body.activityName_id;
  if (req.body.subactivityName_id !== "all")
    query.subactivityName_id = req.body.subactivityName_id;
  //  search text condition
  // console.log("req.body.searchText", req.body);
  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
    query.$or = [
      { centerName: searchRegex },
      { fundingAgencyName: searchRegex },
      { program: searchRegex },
      { project: searchRegex },
      { activityName: searchRegex },
      { subactivityName: searchRegex },
      { unit: searchRegex },
      { lhwrfBankName: searchRegex },
      { lhwrfBranchName: searchRegex },
      { paymentType: searchRegex },
      { utrTransactionNumber: searchRegex },
      { lhwrfAccountNumber: searchRegex },
    ];
  }
  let paginationStages = [{ $sort: { centerName: 1 } }];

  if (!req.body.removePagination) {
    paginationStages.push(
      { $skip: parseInt(skipRec) },
      { $limit: parseInt(recsPerPage) }
    );
  }
  FundReceipt.aggregate([
    { $match: query },
    { $unwind: { path: "$contributorData", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$_id",
        fundType: { $first: "$fundType" },
        approvalNo: { $first: "$approvalNo" },
        paymentType: { $first: "$paymentType" },
        center_id: { $first: "$center_id" },
        centerName: { $first: "$centerName" },
        program_id: { $first: "$program_id" },
        program: { $first: "$program" },
        project_id: { $first: "$project_id" },
        project: { $first: "$project" },
        activityName_id: { $first: "$activityName_id" },
        activityName: { $first: "$activityName" },
        subactivityName_id: { $first: "$subactivityName_id" },
        subactivityName: { $first: "$subactivityName" },
        fundReceiptNumber: { $first: "$fundReceiptNumber" },
        amountReceivedDate: { $first: "$amountReceivedDate" },
        amountReceived: { $first: "$amountReceived" },
        depositSlipNumber: { $first: "$depositSlipNumber" },
        utrTransactionNumber: { $first: "$utrTransactionNumber" },
        bank_id: { $first: "$bank_id" },
        lhwrfBankName: { $first: "$lhwrfBankName" },
        lhwrfBranchName: { $first: "$lhwrfBranchName" },
        lhwrfAccountNumber: { $first: "$lhwrfAccountNumber" },
        contributorData: {
          $push: "$contributorData",
        },
      },
    },
    {
      $project: {
        _id: 1,
        fundType: 1,
        approvalNo: 1,
        paymentType: 1,
        center_id: 1,
        centerName: 1,
        program_id: 1,
        program: 1,
        project_id: 1,
        project: 1,
        activityName_id: 1,
        activityName: 1,
        subactivityName_id: 1,
        subactivityName: 1,
        fundReceiptNumber: 1,
        amountReceivedDate: 1,
        amountReceived: 1,
        depositSlipNumber: 1,
        utrTransactionNumber: 1,
        bank_id: 1,
        lhwrfBankName: 1,
        lhwrfBranchName: 1,
        lhwrfAccountNumber: 1,
        contributorData: 1
      }
    },
    {
      $facet: {
        totalRecords: [{ $count: "count" }],
        paginatedData: paginationStages,
      },
    },
    {
      $project: {
        totalRecords: {
          $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0],
        },
        paginatedData: 1,
      },
    },
  ])
    .then((response) => {
      let grantData = [];
      var data = response[0].paginatedData;

      data.forEach((item) => {
        let contributorNames = [];
        let villages = [];
        let aadhaarNos = [];
        let amountsDeposited = [];
        let amountsDepositedperItem = 0;
        if (item.contributorData && item.contributorData.length > 0) {
          item.contributorData.forEach((contributor) => {
            contributorNames.push(contributor.contributorName || "--NA--");
            villages.push(contributor.village || "--NA--");
            aadhaarNos.push(contributor.aadhaarNo || "--NA--");
            
            const amount = Number(contributor.amountDeposited) || 0;
            amountsDeposited.push(amount);
            amountsDepositedperItem += amount; // ✅ sum here

          });
        } else {
          contributorNames.push("--NA--");
          villages.push("--NA--");
          aadhaarNos.push("--NA--");
          amountsDeposited.push(0);
        }

        grantData.push({
          _id: item._id,
          center_id: item.center_id || "--NA--",
          centerName: item.centerName || "--NA--",
          approvalNo: item.approvalNo || "--NA--",
          paymentType: item.paymentType || "--NA--",
          program_id: item.program_id || "--NA--",
          program: item.program || "--NA--",
          project_id: item.project_id || "--NA--",
          project: item.project || "--NA--",
          activityName_id: item.activityName_id || "--NA--",
          activityName: item.activityName || "--NA--",
          subactivityName_id: item.subactivityName_id || "--NA--",
          subactivityName: item.subactivityName || "--NA--",
          fundingAgencyName: item.fundingAgencyName || "--NA--",
          fundReceiptNumber: item.fundReceiptNumber || "--NA--",
          amountReceivedDate: moment(item.amountReceivedDate).format(
            "DD-MM-YYYY"
          ),
          amountReceived: item.amountReceived || 0,
          depositSlipNumber: item.depositSlipNumber || "--NA--",
          utrTransactionNumber: item.utrTransactionNumber || "--NA--",
          bank_id: item.bank_id || "--NA--",
          lhwrfBankName: item.lhwrfBankName || "--NA--",
          lhwrfBranchName: item.lhwrfBranchName || "--NA--",
          lhwrfAccountNumber: item.lhwrfAccountNumber || "--NA--",
          contributorName: contributorNames.join("<br>"),
          village: villages.join("<br>"),
          aadhaarNo: aadhaarNos.join("<br>"),
          amountDeposited: amountsDeposited.join("<br>"),
          amountsDepositedperItem: amountsDepositedperItem
        });
      });

      // Compute totals
      let totalAmountReceived = grantData.reduce(
        (sum, item) => sum + (Number(item.amountReceived) || 0),
        0
      );
      let totalAmountDeposited = grantData.reduce(
        (sum, item) => sum + (Number(item.amountsDepositedperItem) || 0),
        0
      );

      if (grantData.length > 0) {
        grantData.push({
          _id: 0,
          center_id: "-",
          centerName: "Total",
          approvalNo: "-",
          paymentType: "-",
          program_id: "-",
          program: "-",
          project_id: "-",
          project: "-",
          activityName_id: "-",
          activityName: "-",
          subactivityName_id: "-",
          subactivityName: "-",
          fundingAgencyName: "-",
          fundReceiptNumber: "-",
          amountReceivedDate: "-",
          amountReceived: totalAmountReceived,
          depositSlipNumber: "-",
          utrTransactionNumber: "-",
          bank_id: "-",
          lhwrfBankName: "-",
          lhwrfBranchName: "-",
          lhwrfAccountNumber: "-",
          contributorName: "-",
          village: "-",
          aadhaarNo: "-",
          amountDeposited: totalAmountDeposited,
        });
      }

      res.status(200).json({
        tableData: grantData,
        success: true,
        totalRecs: response[0].totalRecords,
      });
    })
    .catch((error) => {
      console.log("Error   => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};



// exports.contribution_report = (req, res, next) => {
//   let recsPerPage = req.body.recsPerPage;
//   let pageNum = req.body.pageNumber;
//   let skipRec = recsPerPage * (pageNum - 1);

//   let query = {};
//   query.fundType = req.body.fundType;

//   if (req.body.fromDate !== "all" && req.body.toDate !== "all")
//     query.amountReceivedDate = {
//       $gte: req.body.fromDate,
//       $lte: req.body.toDate,
//     };
//   if (req.body.fundingAgencyName !== "all")
//     query.fundingAgencyName = req.body.fundingAgencyName;
//   if (req.body.center_ID !== "all") query.center_id = req.body.center_ID;
//   if (req.body.quarter !== "all") query.quarter = req.body.quarter;
//   if (req.body.program_id !== "all") query.program_id = req.body.program_id;
//   if (req.body.project_id !== "all") query.project_id = req.body.project_id;
//   if (req.body.activityName_id !== "all")
//     query.activityName_id = req.body.activityName_id;
//   if (req.body.subactivityName_id !== "all")
//     query.subactivityName_id = req.body.subactivityName_id;
//   //  search text condition
//   // console.log("req.body.searchText", req.body);
//   if (req.body.searchText !== "-") {
//     const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
//     query.$or = [
//       { centerName: searchRegex },
//       { fundingAgencyName: searchRegex },
//       { quarter: searchRegex },
//       { program: searchRegex },
//       { project: searchRegex },
//       { activityName: searchRegex },
//       { subactivityName: searchRegex },
//       { unit: searchRegex },
//       { lhwrfBankName: searchRegex },
//       { lhwrfBranchName: searchRegex },
//       { paymentType: searchRegex },
//       { utrTransactionNumber: searchRegex },
//       { lhwrfAccountNumber: searchRegex },
//     ];
//   }
//   // console.log("query", query);
//   FundReceipt.aggregate([
//     {
//       $match: query,
//     },
//     { $unwind: { path: "$contributorData", preserveNullAndEmptyArrays: true } },
//     {
//       $project: {
//         fundType: "$fundType",
//         approvalNo: "$approvalNo",
//         paymentType: "$paymentType",
//         center_id: "$center_id",
//         centerName: "$centerName",
//         program_id: "$program_id",
//         program: "$program",
//         project_id: "$project_id",
//         project: "$project",
//         activityName_id: "$activityName_id",
//         activityName: "$activityName",
//         subactivityName_id: "$subactivityName_id",
//         subactivityName: "$subactivityName",
//         fundReceiptNumber: "$fundReceiptNumber",
//         amountReceivedDate: "$amountReceivedDate",
//         amountReceived: "$amountReceived",
//         depositSlipNumber: "$depositSlipNumber",
//         utrTransactionNumber: "$utrTransactionNumber",
//         bank_id: "$bank_id",
//         lhwrfBankName: "$lhwrfBankName",
//         lhwrfBranchName: "$lhwrfBranchName",
//         lhwrfAccountNumber: "$lhwrfAccountNumber",
//         contributorName: "$contributorData.contributorName",
//         village: "$contributorData.village",
//         aadhaarNo: "$contributorData.aadhaarNo",
//         amountDeposited: "$contributorData.amountDeposited",
//       },
//     },
//   ])
//     .sort({ createdAt: -1 })
//     .then((data) => {
//       console.log("data", data);
//       var grantData = data.map((item, index) => {
//         return {
//           _id: item._id,
//           center_id: item.center_id ? item.center_id : "--NA--",
//           centerName: item.centerName ? item.centerName : "--NA--",
//           approvalNo: item?.approvalNo ? item?.approvalNo : "--NA--",
//           paymentType: item?.paymentType ? item?.paymentType : "--NA--",
//           program_id: item.program_id ? item.program_id : "--NA--",
//           program: item.program ? item.program : "--NA--",
//           project_id: item.project_id ? item.project_id : "--NA--",
//           project: item.project ? item.project : "--NA--",
//           activityName_id: item.activityName_id
//             ? item.activityName_id
//             : "--NA--",
//           activityName: item.activityName ? item.activityName : "--NA--",
//           subactivityName_id: item.subactivityName_id
//             ? item.subactivityName_id
//             : "--NA--",
//           subactivityName: item.subactivityName
//             ? item.subactivityName
//             : "--NA--",
//           fundingAgencyName: item.fundingAgencyName
//             ? item.fundingAgencyName
//             : "--NA--",
//           fundReceiptNumber: item.fundReceiptNumber
//             ? item.fundReceiptNumber
//             : "--NA--",
//           amountReceivedDate: item.amountReceivedDate
//             ? moment(item.amountReceivedDate).format("DD-MM-YYYY")
//             : "--NA--",
//           amountReceived: item.amountReceived ? item.amountReceived : 0,
//           depositSlipNumber: item.depositSlipNumber
//             ? item.depositSlipNumber
//             : "--NA--",
//           utrTransactionNumber: item.utrTransactionNumber
//             ? item.utrTransactionNumber
//             : "--NA--",
//           bank_id: item.bank_id ? item.bank_id : "--NA--",
//           lhwrfBankName: item.lhwrfBankName ? item.lhwrfBankName : "--NA--",
//           lhwrfBranchName: item.lhwrfBranchName
//             ? item.lhwrfBranchName
//             : "--NA--",
//           lhwrfAccountNumber: item.lhwrfAccountNumber
//             ? item.lhwrfAccountNumber
//             : "--NA--",
//           totalContributors: item.totalContributors
//             ? item.totalContributors
//             : 0,
//           contributorName: item.contributorName
//             ? item.contributorName
//             : "--NA--",
//           village: item.village ? item.village : "--NA--",
//           aadhaarNo: item.aadhaarNo ? item.aadhaarNo : "--NA--",
//           amountDeposited: item.amountDeposited ? item.amountDeposited : 0,
//           contributorData: item.contributorData
//             ? item.contributorData
//             : "--NA--",
//         };
//       });
//       var amountReceived = 0;
//       var totalContributors = 0;
//       for (var index = 0; index < grantData.length; index++) {
//         amountReceived += grantData[index].amountReceived
//           ? grantData[index].amountReceived
//           : 0;
//         totalContributors += grantData[index].totalContributors
//           ? grantData[index].totalContributors
//           : 0;
//       }
//       if (index >= grantData.length && grantData.length > 0) {
//         grantData.push({
//           _id: 0,
//           center_id: "-",
//           centerName: "Total",
//           approvalNo: "-",
//           paymentType: "-",
//           program_id: "-",
//           program: "-",
//           project_id: "-",
//           project: "-",
//           activityName_id: "-",
//           activityName: "-",
//           subactivityName_id: "-",
//           subactivityName: "-",
//           fundingAgencyName: "-",
//           fundReceiptNumber: "-",
//           amountReceivedDate: "-",
//           amountReceived: amountReceived,
//           depositSlipNumber: "-",
//           utrTransactionNumber: "-",
//           bank_id: "-",
//           lhwrfBankName: "-",
//           lhwrfBranchName: "-",
//           lhwrfAccountNumber: "-",
//           contributorName: "-",
//           village: "-",
//           aadhaarNo: "-",
//           amountDeposited: "-",
//           totalContributors: totalContributors,
//           contributorData: "-",
//         });
//       }
//       res.status(200).json({
//         // totalRecs: totalRecs,
//         tableData: grantData,
//         success: true,
//       });
//     })
//     .catch((error) => {
//       console.log("Error in CCList  => ", error);
//       res.status(500).json({ errorMsg: error.message, success: false });
//     });
// };

exports.list_contributors_with_filters = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);

  let query = {};
  query.fundType = req.body.fundType;
  query._id = req.body._id;

  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i");
    const searchNumber = !isNaN(req.body.searchText)
      ? Number(req.body.searchText)
      : null;

    query.$or = [
      { "contributorData.contributorName": searchRegex },
      { "contributorData.village": searchRegex },
      // { "contributorData.aadhaarNo": searchRegex },
      { "contributorData.amountDeposited": searchNumber },
    ];
  }
  // console.log("query", query);

  // FundReceipt.estimatedDocumentCount(query)
  FundReceipt.countDocuments(query)
    .then((totalRecs) => {
      // console.log("totalRecs => ", totalRecs);
      // FundReceipt.find(query)
      //   .skip(parseInt(skipRec))
      //   .limit(parseInt(recsPerPage))
      let fundReceiptQuery = FundReceipt.find(query);
      if (!req.body.removePagination) {
        fundReceiptQuery = fundReceiptQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }
      fundReceiptQuery
        .sort({ createdAt: -1 })
        .then((data) => {
          let contributorsList = [];
          var grantData = data.map((item, index) => {
            contributorsList = item.contributorData.map((contributor) => {
              // console.log("contributor", contributor);
              return {
                _id: contributor._id,
                contributorName: contributor?.contributorName
                  ? contributor.contributorName
                  : "--NA--",
                village: contributor?.village ? contributor.village : "--NA--",
                aadhaarNo: contributor.aadhaarNo
                  ? contributor.aadhaarNo
                  : "--NA--",
                amountDeposited: contributor.amountDeposited
                  ? contributor.amountDeposited
                  : "--NA--",
              };
            });
          });
          // console.log("CCData", contributorsList);
          res.status(200).json({
            totalRecs: totalRecs,
            tableData: contributorsList,
            success: true,
          });
        })
        .catch((error) => {
          // console.log("Error in CCList  => ", error);
          res.status(500).json({ errorMsg: error.message, success: false });
        });
    })
    .catch((err) => {
      // console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.list_cc_with_limits = (req, res, next) => {
  let recsPerPage = req.params.recsPerPage;
  let pageNum = req.params.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  if (req.body.center_ID === "all") {
    query = {};
  } else {
    query = { center_id: req.body.center_ID };
  }
  if (query != "1") {
    FundReceipt.estimatedDocumentCount(query)
      .then((totalRecs) => {
        FundReceipt.find(query)
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage))
          .then((data) => {
            var ccData = data.map((item, index) => {
              return {
                _id: item._id,
                approvalNo: item.approvalNo ? item.approvalNo : "-",
                paymentType: item.paymentType ? item.paymentType : "-",
                center_id: item.center_id ? item.center_id : "all",
                centerName: item.centerName ? item.centerName : "All",
                program_id: item.program_id,
                program: item.program,
                project_id: item.project_id,
                project: item.project,
                activityName_id: item.activityName_id,
                activityName: item.activityName,
                subactivityName_id: item.subactivityName_id,
                subactivityName: item.subactivityName,
                fundReceiptNumber: item.fundReceiptNumber,
                amountReceivedDate: item.amountReceivedDate,
                amountReceived: item.amountReceived,
                depositSlipNumber: item.depositSlipNumber,
                utrTransactionNumber: item.utrTransactionNumber,
                bank_id: item.bank_id,
                lhwrfBankName: item.lhwrfBankName,
                lhwrfBranchName: item.lhwrfBranchName,
                lhwrfAccountNumber: item.lhwrfAccountNumber,
                totalContributors: item.totalContributors,
              };
            });
            // console.log("CCData", ccData);
            res.status(200).json({
              totalRecs: totalRecs,
              tableData: ccData,
              success: true,
            });
          })
          .catch((error) => {
            console.log("Error in CCList  => ", error);
            res.status(500).json({ errorMsg: error.message, success: false });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
};

exports.fetch_fund = (req, res, next) => {
  FundReceipt.find({ _id: req.params.ID })
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.delete_fund = (req, res, next) => {
  // console.log("req.params.ID ",req.params.ID);
  FundReceipt.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      // console.log('data ',data);
      // if(data.deletedCount === 1){
      res.status(200).json({
        deleted: true,
        message: "CC List deleted Successfully.",
      });
      // }else{
      //    res.status(200).json({ deleted : false });
      // }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
