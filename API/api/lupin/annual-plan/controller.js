const mongoose = require("mongoose");
const _ = require("underscore");
const moment = require("moment");
const AnnualPlan = require("./model.js");
const ObjectId = mongoose.Types.ObjectId;

const ProgramMaster = require("../oneFieldModules/programManagement/modelNew.js");
const ProjectMaster = require("../oneFieldModules/projectManagement/modelNew.js");
const ActivityMaster = require("../oneFieldModules/ActivityManagement/model.js");
const Subactivity = require("../SubactivityMapping/model.js");
const FailedRecords = require("../failedRecords/model.js");
const CenterDetails = require("../centers/model.js");
const UnitMaster = require("../oneFieldModules/unitManagement/modelNew.js");

// Function to get financial year dates and quarters
// Function to get financial year dates and quarters
function getFinancialYearDates(financialYear) {
  const [startYear, endYearSuffix] = financialYear.split("-").map(Number);
  const startDate = new Date(`${startYear}-04-01`);
  const endDate = new Date(`${startYear + 1}-03-31`);

  const quarters = [
    {
      start: new Date(`${startYear}-04-01`),
      end: new Date(`${startYear}-06-30`),
    },
    {
      start: new Date(`${startYear}-07-01`),
      end: new Date(`${startYear}-09-30`),
    },
    {
      start: new Date(`${startYear}-10-01`),
      end: new Date(`${startYear}-12-31`),
    },
    {
      start: new Date(`${startYear + 1}-01-01`),
      end: new Date(`${startYear + 1}-03-31`),
    },
  ];

  const formatToYYYYDDMM = (date) => {
    const year = date.getFullYear();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-${day}`;
    
  };

  return {
    startDate: formatToYYYYDDMM(startDate),
    endDate: formatToYYYYDDMM(endDate),
    quarters: quarters.map((q) => ({
      start: formatToYYYYDDMM(q.start),
      end: formatToYYYYDDMM(q.end),
    })),
  };
}

exports.create_annualPlan = (req, res, next) => {
  getData();

  async function getData() {
    const financialYear = req.body.year;
    const quarter = req.body.quarter;

    // Get the start and end dates for the financial year
    const { startDate, endDate, quarters } =
      getFinancialYearDates(financialYear);

    // Determine the specific start and end dates based on the selected quarter
    let selectedStartDate, selectedEndDate;
    if (quarter === "All") {
      selectedStartDate = startDate;
      selectedEndDate = endDate;
    } else {
      const quarterIndex = ["Q1", "Q2", "Q3", "Q4"].indexOf(quarter);
      if (quarterIndex !== -1) {
        selectedStartDate = quarters[quarterIndex].start;
        selectedEndDate = quarters[quarterIndex].end;
      } else {
        return res.status(400).json({ error: "Invalid quarter selected" });
      }
    }

    AnnualPlan.findOne({
      center_id: req.body.center_id,
      program_id: req.body.program_id,
      project_id: req.body.project_id,
      activityName_id: req.body.activityName_id,
      subactivityName_id: req.body.subactivityName_id,
      year: req.body.year,
      quarter: req.body.quarter,
    })
      .exec()
      .then((data) => {
        if (data) {
          res.status(200).json({
            message:
              "The Annual Plan already exists for this Center, Year, Quarter and Masters",
            success: false,
          });
        } else {
          const annualPlan = new AnnualPlan({
            _id: new mongoose.Types.ObjectId(),
            center_id: req.body.center_id,
            centerName: req.body.centerName,
            year: req.body.year,
            quarter: req.body.quarter,
            program_id: req.body.program_id,
            program: req.body.program,
            project_id: req.body.project_id,
            project: req.body.project,
            activityName_id: req.body.activityName_id,
            activityName: req.body.activityName,
            subactivityName_id: req.body.subactivityName_id,
            subactivityName: req.body.subactivityName,
            unit: req.body.unit,
            unitCost: req.body.unitCost,
            quantity: req.body.quantity,
            noOfHouseholds: req.body.noOfHouseholds,
            noOfBeneficiaries: req.body.noOfBeneficiaries,
            totalCost: req.body.totalCost,
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            sourceofFund: {
              LHWRF: req.body.LHWRF,
              grant: req.body.grant,
              CC: req.body.CC,
            },
            convergence: req.body.convergence,
            createdBy: req.body.user_id,
            createdAt: new Date(),
          });

          annualPlan
            .save()
            .then((response) => {
              res.status(200).json({
                message: "AnnualPlan Details submitted Successfully.",
                insertedLevel: response,
                success: true,
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({ error: err, success: false });
            });
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

// OLD CODE BEFORE START DATE AND END DATE

// exports.create_annualPlan = (req, res, next) => {
//   getData();
//   async function getData() {
//     const annualPlan = new AnnualPlan({
//       _id: new mongoose.Types.ObjectId(),

//       center_id: req.body.center_id,
//       centerName: req.body.centerName,
//       year: req.body.year,
//       quarter: req.body.quarter,
//       program_id: req.body.program_id,
//       program: req.body.program,
//       project_id: req.body.project_id,
//       project: req.body.project,
//       activityName_id: req.body.activityName_id,
//       activityName: req.body.activityName,
//       subactivityName_id: req.body.subactivityName_id,
//       subactivityName: req.body.subactivityName,
//       unit: req.body.unit,
//       unitCost: req.body.unitCost,
//       quantity: req.body.quantity,
//       noOfHouseholds: req.body.noOfHouseholds,
//       noOfBeneficiaries: req.body.noOfBeneficiaries,
//       totalCost: req.body.totalCost,

//       sourceofFund: {
//         LHWRF: req.body.LHWRF,
//         grant: req.body.grant,
//         CC: req.body.CC,
//         // total               : req.body.total,
//       },
//       convergence: req.body.convergence,
//       createdBy: req.body.user_id,
//       createdAt: new Date(),
//     });
//     annualPlan
//       .save()
//       .then((response) => {
//         res.status(200).json({
//           message: "AnnualPlan Details submitted Successfully.",
//           insertedLevel: response,
//           success: true,
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//           error: err,
//         });
//       });
//   }
// };

exports.bulkUpload_annualPlan = (req, res, next) => {
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
    var allPrograms = await getAllProgramMaster({});
    var allProjects = await getAllProjects({});
    var allActivities = await getAllActivities({});

    for (var k = 0; k < excelData.length; k++) {
      if (excelData[k].centerName == "-") {
        remark += " Center Name not found";
      }
      if (excelData[k].year == "-") {
        remark += " year not found";
      }
      if (excelData[k].quarter == "-") {
        remark += " quarter not found";
      }
      if (excelData[k].program == "-") {
        remark += " program not found";
      }
      if (excelData[k].project == "-") {
        remark += " project not found";
      }
      if (excelData[k].activityName == "-") {
        remark += " activityName not found";
      }
      if (excelData[k].subactivityName == "-") {
        remark += " subactivityName not found";
      }
      if (excelData[k].quantity == "-") {
        remark += " quantity not found";
      } else if (!numberPattern.test(excelData[k].quantity)) {
        remark += " quantity should only contain numbers, ";
      }
      if (excelData[k].unit == "-") {
        remark += " unit not found";
      }
      if (excelData[k].unitCost == "-") {
        remark += " unitCost not found";
      } else if (!numberPattern.test(excelData[k].unitCost)) {
        remark += " unitCost should only contain numbers, ";
      }
      if (excelData[k].noOfHouseholds == "-") {
        remark += " noOfHouseholds not found";
      } else if (!numberPattern.test(excelData[k].noOfHouseholds)) {
        remark += " noOfHouseholds should only contain numbers, ";
      }
      if (excelData[k].noOfBeneficiaries == "-") {
        remark += " noOfBeneficiaries not found";
      } else if (!numberPattern.test(excelData[k].noOfBeneficiaries)) {
        remark += " noOfBeneficiaries should only contain numbers, ";
      }
      if (excelData[k].totalCost == "-") {
        remark += "  totalCost not found";
      } else if (!numberPattern.test(excelData[k].totalCost)) {
        remark += " totalCost should only contain numbers, ";
      }
      if (excelData[k].LHWRF == "-") {
        remark += "  LHWRF not found";
      } else if (!numberPattern.test(excelData[k].LHWRF)) {
        remark += " LHWRF should only contain numbers, ";
      }
      if (excelData[k].externalGrant == "-") {
        remark += "  grant not found";
      } else if (!numberPattern.test(excelData[k].externalGrant)) {
        remark += " externalGrant should only contain numbers, ";
      }
      if (excelData[k].CC == "-") {
        remark += " CC not found";
      } else if (!numberPattern.test(excelData[k].CC)) {
        remark += " CC should only contain numbers, ";
      }
      if (excelData[k].convergence == "-") {
        remark += " convergence not found";
      } else if (!numberPattern.test(excelData[k].convergence)) {
        remark += " convergence should only contain numbers, ";
      }
      var totalCost = (
        parseFloat(excelData[k].quantity) * parseFloat(excelData[k].unitCost)
      ).toFixed(4);

      var LHWRF = isNaN(parseFloat(excelData[k].LHWRF))
        ? 0
        : parseFloat(excelData[k].LHWRF);
      var grant = isNaN(parseFloat(excelData[k].externalGrant))
        ? 0
        : parseFloat(excelData[k].externalGrant);
      var CC = isNaN(parseFloat(excelData[k].CC))
        ? 0
        : parseFloat(excelData[k].CC);

      if (totalCost != (LHWRF + grant + CC).toFixed(4)) {
        remark += " Total Cost should be equal to sum of 3 Source of Funds, ";
      }
      console.log("remark 167", remark);

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
        .trim()}_${excelData[k].year.toLowerCase().trim()}_${excelData[
        k
      ].quarter
        .toLowerCase()
        .trim()}`;

      // Check if the combination is already in the unique set
      if (uniqueCombinations.has(combinationKey)) {
        remark = "Duplicate Annual Plan found in the file.";
      } else {
        // Add the combination to the set if not a duplicate
        uniqueCombinations.add(combinationKey);
      }

      if (remark == "") {
        var centerDetails = await getCenterDetails(
          (excelData[k]?.centerName).trim()
        );
        // console.log("centerDetails",centerDetails);
        if (centerDetails) {
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
          if (programAvailability.length == 0) {
            remark +=
              excelData[k].program + " is not available in Program Master,";
          }
          // console.log("remark 2", remark);
          if (projectAvailability.length == 0) {
            remark +=
              " " +
              excelData[k].project +
              " is not available in Project Master,";
          }
          // console.log("remark 3", remark);
          if (activityAvailability.length == 0) {
            remark +=
              " " +
              excelData[k].activityName +
              " is not available in Activity Master,";
          }
          // console.log("remark 4", remark);
          if (subactivitiesAvailability.length == 0) {
            remark +=
              " " +
              excelData[k].subactivityName +
              " is not available in Subactivity Master. Program, Project, Activity, Subactivity should be link with each other";
          }
          // console.log("remark 5", remark);

          var unitAvailability = await getUnit(excelData[k].unit.trim());
          // console.log("unitAvailability", unitAvailability);
          if (!unitAvailability) {
            remark +=
              " " + excelData[k].unit + " is not available in Unit master";
          }

          const financialYear = excelData[k].year;
          const quarter = excelData[k].quarter;

          // Get the start and end dates for the financial year
          const { startDate, endDate, quarters } =
            getFinancialYearDates(financialYear);

          // Determine the specific start and end dates based on the selected quarter
          let selectedStartDate, selectedEndDate;
          if (quarter === "All") {
            selectedStartDate = startDate;
            selectedEndDate = endDate;
          } else {
            const quarterIndex = ["Q1", "Q2", "Q3", "Q4"].indexOf(quarter);
            if (quarterIndex !== -1) {
              selectedStartDate = quarters[quarterIndex].start;
              selectedEndDate = quarters[quarterIndex].end;
            } else {
              remark += " Invalid quarter selected.";
            }
          }
          // console.log("remark 6", remark);
          if (remark == "") {
            var unit = unitAvailability?.fieldValue;
            var subactivityName = subactivitiesAvailability[0].inputValue;
            var program = subactivitiesAvailability[0].field1Value;
            var project = subactivitiesAvailability[0].field2Value;
            var activityName = subactivitiesAvailability[0].field3Value;
            var subactivityName_id = subactivitiesAvailability[0]._id;
            var program_id = subactivitiesAvailability[0].field1_id;
            var project_id = subactivitiesAvailability[0].field2_id;
            var activityName_id = subactivitiesAvailability[0].field3_id;

            var query = { centerName: centerDetails?.centerName };
            var allPlans = await getAllPlans(query); // pass center_id to get less data

            var PlanExists = allPlans.filter((item) => {
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
                item.year.toLowerCase() ===
                  excelData[k].year.toLowerCase().trim() &&
                item.quarter.toLowerCase() ===
                  excelData[k].quarter.toLowerCase().trim()
              ) {
                return item;
              }
            });
            console.log("in else PlanExists", PlanExists.length);
            if (PlanExists.length == 0) {
              validObjects = excelData[k];
              validObjects.sourceofFund = {
                LHWRF: parseFloat(excelData[k].LHWRF)
                  ? parseFloat(excelData[k].LHWRF)
                  : 0,
                grant: parseFloat(excelData[k].externalGrant)
                  ? parseFloat(excelData[k].externalGrant)
                  : 0,
                CC: parseFloat(excelData[k].CC)
                  ? parseFloat(excelData[k].CC)
                  : 0,
              };
              validObjects.unit = unit;
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

              (validObjects.startDate = selectedStartDate),
                (validObjects.endDate = selectedEndDate),
                (validObjects.fileName = req.body?.fileName);
              validObjects.createdBy = req.body?.createdBy;
              validObjects.createdAt = new Date();
              console.log("validObjects", validObjects);
              validData.push(validObjects);
            } else {
              remark += " Plan details already exists.";
              invalidObjects = excelData[k];
              invalidObjects.failedRemark = remark;
              invalidData.push(invalidObjects);
              // console.log(
              //   "invalidObjects PlanExists",
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
            //   "k------",
            //   k,
            //   invalidObjects.failedRemark
            // );
          }
        } else {
          remark =
            excelData[k]?.centerName + " is not available in Center master";
          invalidObjects = excelData[k];
          invalidObjects.failedRemark = remark;
          invalidData.push(invalidObjects);
          // console.log("invalidData 272 Center", invalidData.length);
        }
      } else {
        invalidObjects = excelData[k];
        invalidObjects.failedRemark = remark;
        invalidData.push(invalidObjects);
        // console.log("invalidData 278", invalidData.length);
      }
      remark = "";
    }
    // console.log("validData", validData.length);
    // console.log("invalidData 321", invalidData.length);
    // console.log("remark 283", remark);
    AnnualPlan.insertMany(validData)
      .then(async (data) => {})
      .catch((err) => {
        console.log(err);
      });
    if (invalidData.length > 0) {
      failedRecords.FailedRecords = invalidData;
      failedRecords.fileName = req.body.fileName;
      failedRecords.totalRecords = invalidData.length;
      const failedData = await insertFailedRecords(
        failedRecords,
        req.body.updateBadData
      );
      // console.log("failedData", failedData.length);
    }
    res.status(200).json({
      message: "Bulk upload process is completed successfully!",
      completed: true,
    });
  }
};

var getUnit = async (unit) => {
  return new Promise(function (resolve, reject) {
    // console.log("unit",unit)
    UnitMaster.findOne({
      fieldValue: new RegExp(`^${unit.trim()}$`, "i"),
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("getCenterDetails err", err);
        reject(err);
      });
  });
};

var getCenterDetails = async (centerName) => {
  return new Promise(function (resolve, reject) {
    // console.log("centerName",centerName)
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

var getAllPlans = async (query) => {
  return new Promise(function (resolve, reject) {
    AnnualPlan.find(query)
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
                  if (data.modifiedCount == 1) {
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
                        console.log("data", data);
                        if (data.modifiedCount == 1) {
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
                  if (data.modifiedCount == 1) {
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
                if (data.modifiedCount == 1) {
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
    AnnualPlan.deleteMany({ fileName: fileName })
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
  // AnnualPlan.find({center_id:req.params.center_id,fileName:req.params.fileName})
  AnnualPlan.find({ fileName: req.params.fileName })
    .exec()
    .then((data) => {
      //finaldata.push({goodrecords: data})
      finaldata.goodrecords = data;
      finaldata.totalRecords = data?.length;
      FailedRecords.find({ fileName: req.params.fileName })
        .exec()
        .then((badData) => {
          var failedRecords =
            badData.length > 0 ? badData[0]?.failedRecords : [];
          finaldata.failedRecords = failedRecords.flat();
          finaldata.totalRecords = badData[0]?.totalRecords;
          // console.log("filedetails finaldata=======>", finaldata);
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

exports.update_annualPlan = (req, res, next) => {
  // Find the existing AnnualPlan
  AnnualPlan.findOne({ _id: req.body.ID })
    .exec()
    .then((existingPlan) => {
      if (!existingPlan) {
        return res.status(404).json({ message: "AnnualPlan not found" });
      }

      const financialYear = req.body.year;
      const quarter = req.body.quarter;

      // Get the start and end dates for the financial year
      const { startDate, endDate, quarters } =
        getFinancialYearDates(financialYear);

      // Determine the specific start and end dates based on the selected quarter
      let selectedStartDate, selectedEndDate;
      if (quarter === "All") {
        selectedStartDate = startDate;
        selectedEndDate = endDate;
      } else {
        const quarterIndex = ["Q1", "Q2", "Q3", "Q4"].indexOf(quarter);
        if (quarterIndex !== -1) {
          selectedStartDate = quarters[quarterIndex].start;
          selectedEndDate = quarters[quarterIndex].end;
        } else {
          return res.status(400).json({ error: "Invalid quarter selected" });
        }
      }

      // Update the AnnualPlan
      AnnualPlan.updateOne(
        { _id: req.body.ID },
        {
          $set: {
            center_id: req.body.center_id,
            centerName: req.body.centerName,
            year: req.body.year,
            quarter: req.body.quarter,
            program_id: req.body.program_id,
            program: req.body.program,
            project_id: req.body.project_id,
            project: req.body.project,
            activityName_id: req.body.activityName_id,
            activityName: req.body.activityName,
            subactivityName_id: req.body.subactivityName_id,
            subactivityName: req.body.subactivityName,
            unit: req.body.unit,
            unitCost: req.body.unitCost,
            quantity: req.body.quantity,
            noOfHouseholds: req.body.noOfHouseholds,
            noOfBeneficiaries: req.body.noOfBeneficiaries,
            totalCost: req.body.totalCost,
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            sourceofFund: {
              LHWRF: req.body.LHWRF,
              grant: req.body.grant,
              CC: req.body.CC,
            },
            convergence: req.body.convergence,
          },
        }
      )
        .exec()
        .then((data) => {
          if (data.modifiedCount === 1) {
            AnnualPlan.updateOne(
              { _id: req.body.ID },
              {
                $push: {
                  updateLog: [
                    { updatedAt: new Date(), updatedBy: req.body.user_id },
                  ],
                },
              }
            )
              .exec()
              .then((data) => {
                res.status(200).json({
                  data,
                  success: true,
                  message: "AnnualPlan Details updated Successfully.",
                });
              });
          } else {
            res.status(200).json({
              data,
              success: true,
              message: "AnnualPlan Details not modified",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

// OLD CODE BEFORE START DATE AND END DATE

// exports.update_annualPlan = (req, res, next) => {
//   AnnualPlan.updateOne(
//     { _id: req.body.ID },
//     {
//       $set: {
//         center_id: req.body.center_id,
//         centerName: req.body.centerName,
//         year: req.body.year,
//         quarter: req.body.quarter,
//         program_id: req.body.program_id,
//         program: req.body.program,
//         project_id: req.body.project_id,
//         project: req.body.project,
//         activityName_id: req.body.activityName_id,
//         activityName: req.body.activityName,
//         subactivityName_id: req.body.subactivityName_id,
//         subactivityName: req.body.subactivityName,
//         unit: req.body.unit,
//         unitCost: req.body.unitCost,
//         quantity: req.body.quantity,
//         noOfHouseholds: req.body.noOfHouseholds,
//         noOfBeneficiaries: req.body.noOfBeneficiaries,
//         totalCost: req.body.totalCost,

//         sourceofFund: {
//           LHWRF: req.body.LHWRF,
//           grant: req.body.grant,
//           CC: req.body.CC,
//           // total               : req.body.total,
//         },
//         convergence: req.body.convergence,
//       },
//     }
//   )
//     .exec()
//     .then((data) => {
//       if (data.modifiedCount == 1) {
//         AnnualPlan.updateOne(
//           { _id: req.body.ID },
//           {
//             $push: {
//               updateLog: [
//                 { updatedAt: new Date(), updatedBy: req.body.user_id },
//               ],
//             },
//           }
//         )
//           .exec()
//           .then((data) => {
//             res.status(200).json({
//               data,
//               success: true,
//               message: "AnnualPlan Details updated Successfully.",
//             });
//           });
//       } else {
//         res.status(200).json({
//           data,
//           success: true,
//           message: "AnnualPlan Details not modified",
//         });
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };
exports.list_annualPlan = (req, res, next) => {
  AnnualPlan.find()
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
exports.list_annualPlan_with_limits = (req, res, next) => {
  let recsPerPage = req.params.recsPerPage;
  let pageNum = req.params.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  if (req.body.center_ID === "all") {
    query = {};
  } else {
    query = { center_id: req.body.center_ID };
  }
  // console.log("Page Number",pageNum,"query",query,"req.body",req.body.center_id)

  if (query != "1") {
    AnnualPlan.estimatedDocumentCount(query)
      .then((totalRecs) => {
        // console.log("totalRecs => ", totalRecs);
        AnnualPlan.find(query)
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage))
          .then((data) => {
            // console.log("data", data);
            var annualPlanData = data.map((item, index) => {
              return {
                _id: item._id,
                center_id: item.center_id ? item.center_id : "all",
                centerName: item.centerName ? item.centerName : "All",
                quarter: item.quarter,
                year: item.year,
                program_id: item.program_id,
                program: item.program,
                project_id: item.project_id,
                project: item.project,
                activityName_id: item.activityName_id,
                activityName: item.activityName,
                subactivityName_id: item.subactivityName_id,
                subactivityName: item.subactivityName,
                unit: item.unit ? item.unit : "-",
                unitCost: item.unitCost,
                quantity: item.quantity,
                noOfHouseholds: item.noOfHouseholds,
                noOfBeneficiaries: item.noOfBeneficiaries,
                totalCost: item.totalCost,
                LHWRF: item.sourceofFund.LHWRF,
                grant: item.sourceofFund.grant,
                CC: item.sourceofFund.CC,
                // total               : item.total,
                convergence: item.convergence ? item.convergence : "-",
              };
            });
            // console.log("annualPlanData", annualPlanData);
            res.status(200).json({
              totalRecs: totalRecs,
              tableData: annualPlanData,
              success: true,
            });
          })
          .catch((error) => {
            console.log("Error in AnnualPlanList  => ", error);
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
// exports.list_annualPlan_with_filters = (req, res, next) => {
//   let recsPerPage = req.body.recsPerPage;
//   let pageNum = req.body.pageNumber;
//   let skipRec = recsPerPage * (pageNum - 1);
//   var query = "1";
//   var query = {};

//   if (req.body.center_ID !== "all") query.center_id = req.body.center_ID;
//   if (req.body.year !== "all") query.year = req.body.year;
//   // if (req.body.quarter !== "all")
//   query.quarter = req.body.quarter;
//   if (req.body.program_id !== "all") query.program_id = req.body.program_id;
//   if (req.body.project_id !== "all") query.project_id = req.body.project_id;
//   if (req.body.activityName_id !== "all")
//     query.activityName_id = req.body.activityName_id;
//   if (req.body.subactivityName_id !== "all")
//     query.subactivityName_id = req.body.subactivityName_id;
//   //  search text condition
//   console.log("req.body", req.body);
//   if (req.body.searchText !== "-") {
//     const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
//     query.$or = [
//       { centerName: searchRegex },
//       { year: searchRegex },
//       { quarter: searchRegex },
//       { program: searchRegex },
//       { project: searchRegex },
//       { activityName: searchRegex },
//       { subactivityName: searchRegex },
//       { unit: searchRegex },
//       { fileName: searchRegex },
//     ];
//   }
//   // AnnualPlan.estimatedDocumentCount(query)
//   AnnualPlan.countDocuments(query)
//     .then((totalRecs) => {
//       let annualPlanQuery = AnnualPlan.find(query);
//       if (!req.body.removePagination) {
//         annualPlanQuery = annualPlanQuery
//           .skip(parseInt(skipRec))
//           .limit(parseInt(recsPerPage));
//       }
//       annualPlanQuery
//         .sort({ createdAt: -1 })
//         .then((data) => {
//           console.log("list_annualPlan_with_filters", data.length);
//           let annualPlanData = data.map((item, index) => ({
//             _id: item._id,
//             center_id: item.center_id ? item.center_id : "all",
//             centerName: item.centerName ? item.centerName : "--NA--",
//             quarter: item.quarter ? item.quarter : "--NA--",
//             year: item.year ? item.year : "--NA--",
//             program_id: item.program_id ? item.program_id : "--NA--",
//             program: item.program ? item.program : "--NA--",
//             project_id: item.project_id ? item.project_id : "--NA--",
//             project: item.project ? item.project : "--NA--",
//             activityName_id: item.activityName_id
//               ? item.activityName_id
//               : "--NA--",
//             activityName: item.activityName ? item.activityName : "--NA--",
//             subactivityName_id: item.subactivityName_id
//               ? item.subactivityName_id
//               : "--NA--",
//             subactivityName: item.subactivityName
//               ? item.subactivityName
//               : "--NA--",
//             unit: item.unit ? item.unit : "--NA--",
//             unitCost: item.unitCost ? item.unitCost : 0,
//             quantity: item.quantity ? item.quantity : 0,
//             noOfHouseholds: item.noOfHouseholds ? item.noOfHouseholds : 0,
//             noOfBeneficiaries: item.noOfBeneficiaries
//               ? item.noOfBeneficiaries
//               : 0,
//             totalCost: item.totalCost ? item.totalCost : 0,
//             LHWRF: item.sourceofFund.LHWRF ? item.sourceofFund.LHWRF : 0,
//             grant: item.sourceofFund.grant ? item.sourceofFund.grant : 0,
//             CC: item.sourceofFund.CC ? item.sourceofFund.CC : 0,
//             convergence: item.convergence ? item.convergence : 0,
//           }));
//           res.status(200).json({
//             totalRecs: totalRecs,
//             tableData: annualPlanData,
//             success: true,
//           });
//         })
//         .catch((error) => {
//           console.log("Error in AnnualPlanList  => ", error);
//           res.status(500).json({ errorMsg: error.message, success: false });
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({ error: err });
//     });
// };

// exports.list_annualPlan_with_filters = async (req, res, next) => {
//   let recsPerPage = req.body.recsPerPage;
//   let pageNum = req.body.pageNumber;
//   let skipRec = recsPerPage * (pageNum - 1);
//   let query = {};

//   if (req.body.center_ID !== "all") query.center_id = req.body.center_ID;
//   if (req.body.year !== "all") query.year = req.body.year;
//   if (req.body.quarter !== "all") query.quarter = req.body.quarter;
//   if (req.body.program_id !== "all") query.program_id = req.body.program_id;
//   if (req.body.project_id !== "all") query.project_id = req.body.project_id;
//   if (req.body.activityName_id !== "all")
//     query.activityName_id = req.body.activityName_id;
//   if (req.body.subactivityName_id !== "all")
//     query.subactivityName_id = req.body.subactivityName_id;

//   if (req.body.searchText !== "-") {
//     const searchRegex = new RegExp(req.body.searchText, "i");
//     query.$or = [
//       { centerName: searchRegex },
//       { year: searchRegex },
//       { quarter: searchRegex },
//       { program: searchRegex },
//       { project: searchRegex },
//       { activityName: searchRegex },
//       { subactivityName: searchRegex },
//       { unit: searchRegex },
//       { fileName: searchRegex },
//     ];
//   }

//   try {
//     const totalRecs = await AnnualPlan.countDocuments(query);

//     let annualPlanQuery = AnnualPlan.find(query);
//     if (!req.body.removePagination) {
//       annualPlanQuery = annualPlanQuery
//         .skip(parseInt(skipRec))
//         .limit(parseInt(recsPerPage));
//     }

//     const data = await annualPlanQuery.sort({ createdAt: -1 }).exec();

//     let totals = {
//       unitCost: 0,
//       quantity: 0,
//       noOfHouseholds: 0,
//       noOfBeneficiaries: 0,
//       totalCost: 0,
//       LHWRF: 0,
//       grant: 0,
//       CC: 0,
//       convergence: 0,
//     };

//     if (req.body.quarter === "all") {
//       const aggregationResult = await AnnualPlan.aggregate([
//         { $match: { ...query } },
//         {
//           $group: {
//             _id: null,
//             totalUnitCost: { $sum: "$unitCost" },
//             totalQuantity: { $sum: "$quantity" },
//             totalNoOfHouseholds: { $sum: "$noOfHouseholds" },
//             totalNoOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
//             totalTotalCost: { $sum: "$totalCost" },
//             totalLHWRF: { $sum: "$sourceofFund.LHWRF" },
//             totalGrant: { $sum: "$sourceofFund.grant" },
//             totalCC: { $sum: "$sourceofFund.CC" },
//             totalConvergence: { $sum: "$convergence" },
//           },
//         },
//       ]);

//       if (aggregationResult.length > 0) {
//         totals = {
//           unitCost: aggregationResult[0].totalUnitCost,
//           quantity: aggregationResult[0].totalQuantity,
//           noOfHouseholds: aggregationResult[0].totalNoOfHouseholds,
//           noOfBeneficiaries: aggregationResult[0].totalNoOfBeneficiaries,
//           totalCost: aggregationResult[0].totalTotalCost,
//           LHWRF: aggregationResult[0].totalLHWRF,
//           grant: aggregationResult[0].totalGrant,
//           CC: aggregationResult[0].totalCC,
//           convergence: aggregationResult[0].totalConvergence,
//         };
//       }
//     }

//     let annualPlanData = data.map((item) => ({
//       _id: item._id,
//       center_id: item.center_id ? item.center_id : "all",
//       centerName: item.centerName ? item.centerName : "--NA--",
//       quarter: item.quarter ? item.quarter : "--NA--",
//       year: item.year ? item.year : "--NA--",
//       program_id: item.program_id ? item.program_id : "--NA--",
//       program: item.program ? item.program : "--NA--",
//       project_id: item.project_id ? item.project_id : "--NA--",
//       project: item.project ? item.project : "--NA--",
//       activityName_id: item.activityName_id ? item.activityName_id : "--NA--",
//       activityName: item.activityName ? item.activityName : "--NA--",
//       subactivityName_id: item.subactivityName_id
//         ? item.subactivityName_id
//         : "--NA--",
//       subactivityName: item.subactivityName ? item.subactivityName : "--NA--",
//       unit: item.unit ? item.unit : "--NA--",
//       unitCost: item.unitCost ? item.unitCost : 0,
//       quantity: item.quantity ? item.quantity : 0,
//       noOfHouseholds: item.noOfHouseholds ? item.noOfHouseholds : 0,
//       noOfBeneficiaries: item.noOfBeneficiaries ? item.noOfBeneficiaries : 0,
//       totalCost: item.totalCost ? item.totalCost : 0,
//       LHWRF: item.sourceofFund.LHWRF ? item.sourceofFund.LHWRF : 0,
//       grant: item.sourceofFund.grant ? item.sourceofFund.grant : 0,
//       CC: item.sourceofFund.CC ? item.sourceofFund.CC : 0,
//       convergence: item.convergence ? item.convergence : 0,
//     }));

//     if (req.body.quarter === "all" && annualPlanData.length > 0) {
//       annualPlanData.push({
//         _id: "totals",
//         center_id: "--",
//         centerName: "Total",
//         quarter: "--",
//         year: "--",
//         program_id: "--",
//         program: "--",
//         project_id: "--",
//         project: "--",
//         activityName_id: "--",
//         activityName: "--",
//         subactivityName_id: "--",
//         subactivityName: "--",
//         unit: "--",
//         unitCost: totals.unitCost,
//         quantity: totals.quantity,
//         noOfHouseholds: totals.noOfHouseholds,
//         noOfBeneficiaries: totals.noOfBeneficiaries,
//         totalCost: totals.totalCost,
//         LHWRF: totals.LHWRF,
//         grant: totals.grant,
//         CC: totals.CC,
//         convergence: totals.convergence,
//       });
//     }

//     res.status(200).json({
//       totalRecs: totalRecs,
//       tableData: annualPlanData,
//       success: true,
//     });
//   } catch (error) {
//     console.log("Error in AnnualPlanList  => ", error);
//     res.status(500).json({ errorMsg: error.message, success: false });
//   }
// };

exports.list_annualPlan_with_filtersOld = async (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  let query = {};

  // Construct the query based on filters
  if (req.body.center_ID !== "all")
    query.center_id = new ObjectId(req.body.center_ID);
  if (req.body.year !== "all") query.year = req.body.year;
  if (req.body.quarter !== "all") query.quarter = req.body.quarter;
  if (req.body.program_id !== "all")
    query.program_id = new ObjectId(req.body.program_id);
  if (req.body.project_id !== "all") query.project_id = req.body.project_id;
  if (req.body.activityName_id !== "all")
    query.activityName_id = req.body.activityName_id;
  if (req.body.subactivityName_id !== "all")
    query.subactivityName_id = req.body.subactivityName_id;

  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i");
    query.$or = [
      { centerName: searchRegex },
      { year: searchRegex },
      { quarter: searchRegex },
      { program: searchRegex },
      { project: searchRegex },
      { activityName: searchRegex },
      { subactivityName: searchRegex },
      { unit: searchRegex },
      { fileName: searchRegex },
    ];
  }

  try {
    // Fetch total record count for pagination
    const totalRecs = await AnnualPlan.countDocuments(query);

    // If "all" is selected for quarters, perform aggregation to get totals for all quarters
    if (req.body.quarter === "all") {
      const aggregationResult = await AnnualPlan.aggregate([
        { $match: { ...query } },
        {
          $group: {
            _id: {
              center_id: "$center_id",
              centerName: "$centerName",
              year: "$year",
              program_id: "$program_id",
              program: "$program",
              project_id: "$project_id",
              project: "$project",
              activityName_id: "$activityName_id",
              activityName: "$activityName",
              subactivityName_id: "$subactivityName_id",
              subactivityName: "$subactivityName",
              unit: "$unit",
              unitCost: "$unitCost",
            },
            quantity: { $sum: "$quantity" },
            noOfHouseholds: { $sum: "$noOfHouseholds" },
            noOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
            totalCost: { $sum: "$totalCost" },
            LHWRF: { $sum: "$sourceofFund.LHWRF" },
            grant: { $sum: "$sourceofFund.grant" },
            CC: { $sum: "$sourceofFund.CC" },
            convergence: { $sum: "$convergence" },
          },
        },
        {
          $project: {
            center_id: "$_id.center_id",
            centerName: "$_id.centerName",
            quarter: "All",
            year: "$_id.year",
            program_id: "$_id.program_id",
            program: "$_id.program",
            project_id: "$_id.project_id",
            project: "$_id.project",
            activityName_id: "$_id.activityName_id",
            activityName: "$_id.activityName",
            subactivityName_id: "$_id.subactivityName_id",
            subactivityName: "$_id.subactivityName",
            unit: "$_id.unit",
            unitCost: "$_id.unitCost",
            quantity: "$quantity",
            noOfHouseholds: "$noOfHouseholds",
            noOfBeneficiaries: "$noOfBeneficiaries",
            totalCost: "$totalCost",
            LHWRF: "$LHWRF",
            grant: "$grant",
            CC: "$CC",
            convergence: "$convergence",
          },
        },
      ]);

      // If aggregation result is found, create the total row
      let annualPlanData = [];
      if (aggregationResult.length > 0) {
        const totals = {
          unitCost: aggregationResult[0].totalUnitCost,
          quantity: aggregationResult[0].totalQuantity,
          noOfHouseholds: aggregationResult[0].totalNoOfHouseholds,
          noOfBeneficiaries: aggregationResult[0].totalNoOfBeneficiaries,
          totalCost: aggregationResult[0].totalTotalCost,
          LHWRF: aggregationResult[0].totalLHWRF,
          grant: aggregationResult[0].totalGrant,
          CC: aggregationResult[0].totalCC,
          convergence: aggregationResult[0].totalConvergence,
        };

        // Add the total row to the data
        annualPlanData.push({
          _id: "totals",
          center_id: "--",
          centerName: "Total",
          quarter: "--",
          year: "--",
          program_id: "--",
          program: "--",
          project_id: "--",
          project: "--",
          activityName_id: "--",
          activityName: "--",
          subactivityName_id: "--",
          subactivityName: "--",
          unit: "--",
          unitCost: totals.unitCost,
          quantity: totals.quantity,
          noOfHouseholds: totals.noOfHouseholds,
          noOfBeneficiaries: totals.noOfBeneficiaries,
          totalCost: totals.totalCost,
          LHWRF: totals.LHWRF,
          grant: totals.grant,
          CC: totals.CC,
          convergence: totals.convergence,
        });
      }

      // Return the total row
      return res.status(200).json({
        totalRecs: 1, // Only one total row
        tableData: annualPlanData,
        success: true,
      });
    }

    // Fetch individual records if a specific quarter is selected
    let annualPlanQuery = AnnualPlan.find(query);
    if (!req.body.removePagination) {
      annualPlanQuery = annualPlanQuery
        .skip(parseInt(skipRec))
        .limit(parseInt(recsPerPage));
    }

    const data = await annualPlanQuery.sort({ createdAt: -1 }).exec();

    // Transform the fetched data
    let annualPlanData = data.map((item) => ({
      _id: item._id,
      center_id: item.center_id ? item.center_id : "all",
      centerName: item.centerName ? item.centerName : "--NA--",
      quarter: item.quarter ? item.quarter : "--NA--",
      year: item.year ? item.year : "--NA--",
      program_id: item.program_id ? item.program_id : "--NA--",
      program: item.program ? item.program : "--NA--",
      project_id: item.project_id ? item.project_id : "--NA--",
      project: item.project ? item.project : "--NA--",
      activityName_id: item.activityName_id ? item.activityName_id : "--NA--",
      activityName: item.activityName ? item.activityName : "--NA--",
      subactivityName_id: item.subactivityName_id
        ? item.subactivityName_id
        : "--NA--",
      subactivityName: item.subactivityName ? item.subactivityName : "--NA--",
      unit: item.unit ? item.unit : "--NA--",
      unitCost: item.unitCost ? item.unitCost : 0,
      quantity: item.quantity ? item.quantity : 0,
      noOfHouseholds: item.noOfHouseholds ? item.noOfHouseholds : 0,
      noOfBeneficiaries: item.noOfBeneficiaries ? item.noOfBeneficiaries : 0,
      totalCost: item.totalCost ? item.totalCost : 0,
      LHWRF: item.sourceofFund.LHWRF ? item.sourceofFund.LHWRF : 0,
      grant: item.sourceofFund.grant ? item.sourceofFund.grant : 0,
      CC: item.sourceofFund.CC ? item.sourceofFund.CC : 0,
      convergence: item.convergence ? item.convergence : 0,
    }));

    // Return the individual records if a specific quarter is selected
    res.status(200).json({
      totalRecs: totalRecs,
      tableData: annualPlanData,
      success: true,
    });
  } catch (error) {
    console.log("Error in AnnualPlanList  => ", error);
    res.status(500).json({ errorMsg: error.message, success: false });
  }
};

exports.list_annualPlan_with_filters = async (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  let query = {};

  // Construct the query based on filters
  if (req.body.center_ID !== "all")
    query.center_id = new ObjectId(req.body.center_ID);
  if (req.body.year !== "all") query.year = req.body.year;
  if (req.body.quarter !== "all") query.quarter = req.body.quarter;
  if (req.body.program_id !== "all")
    query.program_id = new ObjectId(req.body.program_id);
  if (req.body.project_id !== "all") query.project_id = req.body.project_id;
  if (req.body.activityName_id !== "all")
    query.activityName_id = req.body.activityName_id;
  if (req.body.subactivityName_id !== "all")
    query.subactivityName_id = req.body.subactivityName_id;

  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i");
    query.$or = [
      { centerName: searchRegex },
      { year: searchRegex },
      { quarter: searchRegex },
      { program: searchRegex },
      { project: searchRegex },
      { activityName: searchRegex },
      { subactivityName: searchRegex },
      { unit: searchRegex },
      { fileName: searchRegex },
    ];
  }
  try {
    // Fetch total record count for pagination
    const totalRecs = await AnnualPlan.countDocuments(query);

    // If "all" is selected for quarters, perform aggregation to get totals for all quarters
    // if (req.body.quarter === "all") {
    //   const aggregationResult = await AnnualPlan.aggregate([
    //     { $match: { ...query } },
    //     {
    //       $group: {
    //         _id: {
    //           center_id: "$center_id",
    //           centerName: "$centerName",
    //           year: "$year",
    //           program_id: "$program_id",
    //           program: "$program",
    //           project_id: "$project_id",
    //           project: "$project",
    //           activityName_id: "$activityName_id",
    //           activityName: "$activityName",
    //           subactivityName_id: "$subactivityName_id",
    //           subactivityName: "$subactivityName",
    //           unit: "$unit",
    //           unitCost: "$unitCost",
    //         },
    //         quantity: { $sum: "$quantity" },
    //         noOfHouseholds: { $sum: "$noOfHouseholds" },
    //         noOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
    //         totalCost: { $sum: "$totalCost" },
    //         LHWRF: { $sum: "$sourceofFund.LHWRF" },
    //         grant: { $sum: "$sourceofFund.grant" },
    //         CC: { $sum: "$sourceofFund.CC" },
    //         convergence: { $sum: "$convergence" },
    //       },
    //     },
    //     {
    //       $project: {
    //         center_id: "$_id.center_id",
    //         centerName: "$_id.centerName",
    //         quarter: "All",
    //         year: "$_id.year",
    //         program_id: "$_id.program_id",
    //         program: "$_id.program",
    //         project_id: "$_id.project_id",
    //         project: "$_id.project",
    //         activityName_id: "$_id.activityName_id",
    //         activityName: "$_id.activityName",
    //         subactivityName_id: "$_id.subactivityName_id",
    //         subactivityName: "$_id.subactivityName",
    //         unit: "$_id.unit",
    //         unitCost: "$_id.unitCost",
    //         quantity: "$quantity",
    //         noOfHouseholds: "$noOfHouseholds",
    //         noOfBeneficiaries: "$noOfBeneficiaries",
    //         totalCost: "$totalCost",
    //         LHWRF: "$LHWRF",
    //         grant: "$grant",
    //         CC: "$CC",
    //         convergence: "$convergence",
    //       },
    //     },
    //   ])
    //   .skip(parseInt(skipRec))
    //   .limit(parseInt(recsPerPage));
    //     var noOfHouseholds = 0;
    //     var noOfBeneficiaries = 0;
    //     var totalCost = 0;
    //     var LHWRF = 0;
    //     var grant = 0;
    //     var CC = 0;
    //     var convergence = 0;
    //     for (var index = 0; index < aggregationResult.length; index++) {
    //       noOfHouseholds += aggregationResult[index].noOfHouseholds ? aggregationResult[index].noOfHouseholds : 0;
    //       noOfBeneficiaries += aggregationResult[index].noOfBeneficiaries ? aggregationResult[index].noOfBeneficiaries : 0;
    //       totalCost += aggregationResult[index].totalCost ? aggregationResult[index].totalCost : 0;
    //       LHWRF += aggregationResult[index].LHWRF ? aggregationResult[index].LHWRF : 0;
    //       grant += aggregationResult[index].grant ? aggregationResult[index].grant : 0;
    //       CC += aggregationResult[index].CC ? aggregationResult[index].CC : 0;
    //       convergence += aggregationResult[index].convergence ? aggregationResult[index].convergence : 0;
    //     }
    //     if (index >= aggregationResult.length && aggregationResult.length > 0) {
    //       aggregationResult.push({
    //         _id: 0,
    //         center_id: "-",
    //         centerName: "Total",
    //         quarter: "-",
    //         year: "-",
    //         program_id: "-",
    //         program: "-",
    //         project_id: "-",
    //         project: "-",
    //         activityName_id: "-",
    //         activityName: "-",
    //         subactivityName_id: "-",
    //         subactivityName: "-",
    //         unit: "-",
    //         unitCost: "-",
    //         quantity: "-",
    //         noOfHouseholds: noOfHouseholds,
    //         noOfBeneficiaries: noOfBeneficiaries,
    //         totalCost: totalCost,
    //         LHWRF: LHWRF,
    //         grant: grant,
    //         CC: CC,
    //         convergence: convergence,
    //       })
    //     }
    //   // Return the total row
    //   return res.status(200).json({
    //     totalRecs: aggregationResult.length, // Only one total row
    //     tableData: aggregationResult,
    //     success: true,
    //   });
    // }
    // console.log("query",query)
    // Fetch individual records if a specific quarter is selected
    let annualPlanQuery = AnnualPlan.find(query);
    if (!req.body.removePagination) {
      annualPlanQuery = annualPlanQuery
        .skip(parseInt(skipRec))
        .limit(parseInt(recsPerPage));
    }

    const data = await annualPlanQuery.sort({ createdAt: -1 }).exec();

    // Transform the fetched data
    let annualPlanData = data.map((item) => ({
      _id: item._id,
      center_id: item.center_id ? item.center_id : "all",
      centerName: item.centerName ? item.centerName : "--NA--",
      quarter: item.quarter ? item.quarter : "--NA--",
      year: item.year ? item.year : "--NA--",
      program_id: item.program_id ? item.program_id : "--NA--",
      program: item.program ? item.program : "--NA--",
      project_id: item.project_id ? item.project_id : "--NA--",
      project: item.project ? item.project : "--NA--",
      activityName_id: item.activityName_id ? item.activityName_id : "--NA--",
      activityName: item.activityName ? item.activityName : "--NA--",
      subactivityName_id: item.subactivityName_id ? item.subactivityName_id : "--NA--",
      subactivityName: item.subactivityName ? item.subactivityName : "--NA--",
      unit: item.unit ? item.unit : "--NA--",
      unitCost: item.unitCost ? item.unitCost : 0,
      quantity: item.quantity ? item.quantity : 0,
      noOfHouseholds: item.noOfHouseholds ? item.noOfHouseholds : 0,
      noOfBeneficiaries: item.noOfBeneficiaries ? item.noOfBeneficiaries : 0,
      totalCost: item.totalCost ? item.totalCost : 0,
      LHWRF: item.sourceofFund.LHWRF ? item.sourceofFund.LHWRF : 0,
      grant: item.sourceofFund.grant ? item.sourceofFund.grant : 0,
      CC: item.sourceofFund.CC ? item.sourceofFund.CC : 0,
      convergence: item.convergence ? item.convergence : 0,
    }));

    var noOfHouseholds = 0;
    var noOfBeneficiaries = 0;
    var totalCost = 0;
    var LHWRF = 0;
    var grant = 0;
    var CC = 0;
    var convergence = 0;
    for (var index = 0; index < annualPlanData.length; index++) {
      noOfHouseholds += annualPlanData[index].noOfHouseholds ? annualPlanData[index].noOfHouseholds : 0;
      noOfBeneficiaries += annualPlanData[index].noOfBeneficiaries ? annualPlanData[index].noOfBeneficiaries : 0;
      totalCost += annualPlanData[index].totalCost ? annualPlanData[index].totalCost : 0;
      LHWRF += annualPlanData[index].LHWRF ? annualPlanData[index].LHWRF : 0;
      grant += annualPlanData[index].grant ? annualPlanData[index].grant : 0;
      CC += annualPlanData[index].CC ? annualPlanData[index].CC : 0;
      convergence += annualPlanData[index].convergence ? annualPlanData[index].convergence : 0;
    }
    if (index >= annualPlanData.length && annualPlanData.length > 0) {
      annualPlanData.push({
        _id: 0,
        center_id: "-",
        centerName: "Total",
        quarter: "-",
        year: "-",
        program_id: "-",
        program: "-",
        project_id: "-",
        project: "-",
        activityName_id: "-",
        activityName: "-",
        subactivityName_id: "-",
        subactivityName: "-",
        unit: "-",
        unitCost: "-",
        quantity: "-",
        noOfHouseholds: noOfHouseholds,
        noOfBeneficiaries: noOfBeneficiaries,
        totalCost: totalCost,
        LHWRF: LHWRF,
        grant: grant,
        CC: CC,
        convergence: convergence,
      })
    }
    // Return the individual records if a specific quarter is selected
    res.status(200).json({
      totalRecs: totalRecs,
      tableData: annualPlanData,
      success: true,
    });
  } catch (error) {
    console.log("Error in AnnualPlanList  => ", error);
    res.status(500).json({ errorMsg: error.message, success: false });
  }
};
exports.fetch_annualPlan = (req, res, next) => {
  AnnualPlan.find({ _id: req.params.ID })
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
exports.delete_annualPlan = (req, res, next) => {
  // console.log("req.params.ID ",req.params.ID);
  AnnualPlan.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      // console.log('data ',data);
      // if(data.deletedCount === 1){
      res.status(200).json({
        deleted: true,
        message: "Annual Plan List deleted Successfully.",
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
