const mongoose = require("mongoose");
const _ = require("underscore");
const moment = require("moment");
const Approval = require("./model.js");
const Utilization = require("../utilization-details/model.js");
const ApprovalLevels = require("../approval-level/model.js");
const ProgramMaster = require("../oneFieldModules/programManagement/modelNew.js");
const ProjectMaster = require("../oneFieldModules/projectManagement/modelNew.js");
const ActivityMaster = require("../oneFieldModules/ActivityManagement/model.js");
const Subactivity = require("../SubactivityMapping/model.js");
const CenterDetails = require("../centers/model.js");
const UnitMaster = require("../oneFieldModules/unitManagement/modelNew.js");
const FailedRecords = require("../failedRecords/model.js");
const Users = require("../../admin2.0/userManagementnew/ModelUsers.js");
const ObjectID = require("mongodb").ObjectId;
const { sendNotification } = require("../../admin2.0/common/globalFunctions");
const globalVariable = require("../../../nodemonConfig.js");
const { ObjectId } = require("mongodb");
const { utc } = require("moment/moment.js");

exports.create_approval = async (req, res, next) => {
  let centerName = req.body.centerName.toUpperCase();
  let approvalSubmissionDate = req.body.approvalSubmissionDate;
  let center_id = req.body.center_id;
  let totalCost = req.body.totalCost;

  let approvalNoObj = await generateNewApprovalNo(
    centerName,
    approvalSubmissionDate
  );
  if (approvalNoObj.approvalNo) {
    let approvalAuthourities = await findapprovalAuthourities(
      center_id,
      totalCost
    );
    // console.log("approvalAuthourities => ", approvalAuthourities);

    // Create new approval

    Approval.findOne({
      center_id: req.body.center_id,
      program_id: req.body.program_id,
      project_id: req.body.project_id,
      activityName_id: req.body.activityName_id,
      subactivityName_id: req.body.subactivityName_id,
      approvalSubmissionDate: moment(req.body.approvalSubmissionDate).format(
        "YYYY-MM-DD"
      ),
    })
      .exec()
      .then((data) => {
        if (data) {
          res.status(200).json({
            message:
              "Approval already exists for this Center, Masters and Approval Submission Date",
            success: false,
          });
        } else {
          const approval = new Approval({
            _id: new mongoose.Types.ObjectId(),
            plan_id:req.body.plan_id,
            center_id: req.body.center_id,
            centerName: req.body.centerName,
            approvalSubmissionDate: req.body.approvalSubmissionDate,
            approvalNo: approvalNoObj.approvalNo,
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
            sourceofFund: {
              LHWRF: req.body.LHWRF,
              grant: req.body.grant,
              CC: req.body.CC,
              // total               : req.body.total,
            },
            convergence: req.body.convergence,
            remarks: req.body.remarks,
            fileName: req.body.filedocument,
            documentUrl: req.body.documentUrl,
            documentName: req.body.documentName,
            finalStatus: req.body.finalStatus,
            approvalAuthourities: approvalAuthourities,
            createdBy: req.body.user_id,
            createdAt: new Date(),
          });

          // Save the new approval
          approval
            .save()
            .then(async (approvalRecord) => {
              const userDetails = await Users.findOne(
                { _id: req.body.user_id },
                { service: 0 }
              );
              // console.log("userDetails", userDetails.profile.email);

              if (userDetails) {
                var notificationData_user = {
                  event: "Approval Management - Create Approval",
                  toEmail: userDetails.profile.email,
                  toMobileNumber: userDetails.profile.mobile,
                  toUserRole: userDetails.roles,
                  toUser_id: req.body.user_id,
                  userDetails: userDetails,
                  variables: {
                    userName:
                      userDetails.profile.firstname +
                      " " +
                      userDetails.profile.lastname,
                    email: userDetails.profile.email,
                    mobile: userDetails.profile.mobile,
                    role: userDetails.roles[0],
                    createdAt: moment(approvalRecord.createdAt).format(
                      "MMMM Do YYYY, h:mm:ss a"
                    ),
                    centerName: req.body.centerName,
                    approvalLevel: "Level-1",
                    costTobeApproved: req.body.totalCost,
                    approvalNo: approvalNoObj.approvalNo,
                    program: req.body.program,
                    project: req.body.project,
                    activity: req.body.activityName,
                    subactivity: req.body.subactivityName,
                  },
                };
                var send_notification_to_user = await sendNotification(
                  notificationData_user
                );
                console.log(
                  "send_notification_to_user",
                  send_notification_to_user
                );
              }
              if (approvalAuthourities && approvalAuthourities.length > 0) {
                if (approvalAuthourities[0].approvalLevel === "Level-1") {
                  var email = approvalAuthourities[0].approvalAuthEmail;
                  var mobileNumber = approvalAuthourities[0].approvalAuthMobile;
                  var role = approvalAuthourities[0].approvalAuthRole;
                  var userName = approvalAuthourities[0].approvalAuthName;
                  var notificationData_Authority = {
                    event: "Approval Management - Inform Authourity - Approval Action",
                    toEmail: email,
                    toMobileNumber: "+91" + mobileNumber,
                    toUserRole: role,
                    variables: {
                      userName: userName,
                      email: email,
                      mobile: mobileNumber,
                      role: role,
                      createdAt: moment(approvalRecord.createdAt).format(
                        "MMMM Do YYYY, h:mm:ss a"
                      ),
                      centerName: req.body.centerName,
                      approvalLevel: "Level-1",
                      costTobeApproved: req.body.totalCost,
                      approvalNo: approvalNoObj.approvalNo,
                      program: req.body.program,
                      project: req.body.project,
                      activity: req.body.activityName,
                      subactivity: req.body.subactivityName,
                    },
                  };
                  var send_notification_to_Authority = await sendNotification(
                    notificationData_Authority
                  );
                  console.log(
                    "send_notification_to_Authority",
                    send_notification_to_Authority
                  );
                }
              }
              res.status(200).json({
                message: "Approval Details submitted Successfully.",
                approvalRecord: approvalRecord,
                success: true,
              });
            })
            .catch((error) => {
              console.log("create_approval error => ", error);
              res.status(500).json({
                message: error.message,
                success: false,
              });
            });
        }
      });
  } else {
    console.log("approvalNoObj => ", approvalNoObj.approvalNo);
    res.status(500).json({
      message: "Approval Number not generated",
      success: false,
    });
  }
};

// function isValidDateFormatDDMMYYYY(inputDate) {
//   if (typeof inputDate == "number") {
//     inputDate = moment(inputDate).format("DD/MM/YYYY");
//   } else {
//     inputDate = inputDate;
//   }
//   // console.log("inputDate",inputDate)
//   var date_regex =
//     /^(?:(?:31(\/)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
//   // var date_regex = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
//   return date_regex.test(inputDate);
// }
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

exports.bulkUpload_approval = (req, res, next) => {
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

    // const approvalGroups = {}; // { "2024-25/BHA": [index1, index2, ...] }

    // excelData.forEach(async (row, index) => {
    //   const approvalSubmissionDate = new Date(
    //     Math.round((row.approvalSubmissionDate - 25569) * 86400 * 1000)
    //   );
    //   const month = approvalSubmissionDate.getMonth();
    //   const year = approvalSubmissionDate.getFullYear();
    //   const startYear = month >= 3 ? year : year - 1;
    //   const endYear = startYear + 1;
    //   const financialYear = `${startYear}-${String(endYear).slice(-2)}`;

    //   // const centerCode = row.centerName.substring(0, 3).toUpperCase();
    //   const centerCode = await getShortCenterName(row.centerName);
    //   const groupKey = `${financialYear}/${centerCode}`;
    //   console.log("groupKey1",groupKey)

    //   if (!approvalGroups[groupKey]) {
    //     approvalGroups[groupKey] = [];
    //   }

    //   approvalGroups[groupKey].push(index);
    // });

    // // Now generate approval numbers per group
    // const approvalNosMap = {}; // { index: approvalNo }
    // console.log("approvalGroups",approvalGroups)
    // for (const groupKey of Object.keys(approvalGroups)) {
    //   console.log("groupKey2",groupKey)
    //   const [financialYear, centerCode] = groupKey.split("/");

    //   const sampleIndex = approvalGroups[groupKey][0];
    //   const approvalSubmissionDate = new Date(
    //     Math.round(
    //       (excelData[sampleIndex].approvalSubmissionDate - 25569) * 86400 * 1000
    //     )
    //   );

    //   const bulkIndexes = approvalGroups[groupKey];
    //   const bulkArray = new Array(bulkIndexes.length).fill({});

    //   const { approvalNos } = await generateNewApprovalNo(
    //     row.centerName,
    //     approvalSubmissionDate,
    //     bulkArray
    //   );
    //   console.log("approvalNos--------",approvalNos)
    //   bulkIndexes.forEach((idx, i) => {
    //     approvalNosMap[idx] = approvalNos[i];
    //   });
    // }

    // 1) Build approvalGroups synchronously
    const approvalGroups = {}; // { "2024-25/TRP": [0,1,2], … }
    for (let index = 0; index < excelData.length; index++) {
      const row = excelData[index];
      const dt = new Date(
        Math.round((row.approvalSubmissionDate - 25569) * 86400 * 1000)
      );
      const month = dt.getMonth(),
        year = dt.getFullYear();
      const startYear = month >= 3 ? year : year - 1;
      const endYear = startYear + 1;
      const financialYear = `${startYear}-${String(endYear).slice(-2)}`;

      const centerCode = await getShortCenterName(row.centerName);
      const groupKey = `${financialYear}/${centerCode}`;
      // console.log("groupKey1", groupKey);

      if (!approvalGroups[groupKey]) approvalGroups[groupKey] = [];
      approvalGroups[groupKey].push(index);
    }

    // console.log("approvalGroups", approvalGroups);

    // 2) Generate approval numbers per group
    const approvalNosMap = {}; // will map row‑index → generated approvalNo
    for (const groupKey of Object.keys(approvalGroups)) {
      // console.log("groupKey2", groupKey);

      const indexes = approvalGroups[groupKey];
      const sampleRow = excelData[indexes[0]];
      const dt = new Date(
        Math.round((sampleRow.approvalSubmissionDate - 25569) * 86400 * 1000)
      );

      // fill an array of empty objects just to tell generateNewApprovalNo how many
      const bulkArray = new Array(indexes.length).fill({});
      const { approvalNos } = await generateNewApprovalNo(
        sampleRow.centerName,
        dt,
        bulkArray
      );
      // console.log("approvalNos--------", approvalNos);

      // assign back to map
      indexes.forEach((idx, i) => {
        approvalNosMap[idx] = approvalNos[i];
      });
    }

    for (var k = 0; k < excelData.length; k++) {
      if (excelData[k].centerName == "-") {
        remark += " Center Name not found";
      }
      if (excelData[k].approvalSubmissionDate == "-") {
        remark += " approvalSubmissionDate not found, ";
      } else {
        // console.log("excelData[k].approvalSubmissionDate",excelData[k].approvalSubmissionDate)
        var validDate = isValidDateFormatDDMMYYYY(
          excelData[k].approvalSubmissionDate
        );
        if (validDate) {
          // console.log("validDate=====",validDate)
          var approvalSubmissionDate;
          if (typeof excelData[k].approvalSubmissionDate == "number") {
            approvalSubmissionDate = moment(
              new Date(
                Math.round(
                  (excelData[k].approvalSubmissionDate - 25569) * 86400 * 1000
                )
              )
            ).format("YYYY-MM-DD");
            // console.log(
            //   "approvalSubmissionDate************",
            //   approvalSubmissionDate
            // );
          } else {
            var approvalSubmissionDate1 = moment(
              excelData[k].approvalSubmissionDate,
              "YYYY-MM-DD"
            )._i;
            var DD = approvalSubmissionDate1.substring(0, 2);
            var MM = approvalSubmissionDate1.substring(3, 5);
            var YYYY = approvalSubmissionDate1.substring(6, 10);
            approvalSubmissionDate = YYYY + "-" + MM + "-" + DD;
            // console.log(
            //   "approvalSubmissionDate=================",
            //   approvalSubmissionDate
            // );
          }
          // console.log("approvalSubmissionDate", approvalSubmissionDate);
        } else {
          remark +=
            "approvalSubmissionDate is not valid. The format should be DD/MM/YYYY, ";
        }
      }
      if (excelData[k].program == "-") {
        remark += "program not found";
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
        remark += "quantity not found";
      } else if (!numberPattern.test(excelData[k].quantity)) {
        remark += "quantity should only contain numbers, ";
      }
      if (excelData[k].unit == "-") {
        remark += "unit not found";
      }
      if (excelData[k].unitCost == "-") {
        remark += "unitCost not found";
      } else if (!numberPattern.test(excelData[k].unitCost)) {
        remark += "unitCost should only contain numbers, ";
      }
      if (excelData[k].noOfHouseHolds == "-") {
        remark += "noOfHouseHolds not found";
      }
      if (excelData[k].noOfBeneficiaries == "-") {
        remark += "noOfBeneficiaries not found";
      } else if (!numberPattern.test(excelData[k].noOfBeneficiaries)) {
        remark += "noOfBeneficiaries should only contain numbers, ";
      }
      if (excelData[k].totalCost == "-") {
        remark += " totalCost not found";
      } else if (!numberPattern.test(excelData[k].totalCost)) {
        remark += "totalCost should only contain numbers, ";
      }
      if (excelData[k].externalGrant == "-") {
        remark += " externalGrant not found";
      } else if (!numberPattern.test(excelData[k].externalGrant)) {
        remark += "externalGrant should only contain numbers, ";
      }
      if (excelData[k].CC == "-") {
        remark += " CC not found";
      } else if (!numberPattern.test(excelData[k].CC)) {
        remark += "CC should only contain numbers, ";
      }
      if (excelData[k].LHWRF == "-") {
        remark += " LHWRF not found";
      } else if (!numberPattern.test(excelData[k].LHWRF)) {
        remark += " LHWRF should only contain numbers, ";
      }
      // if (excelData[k].convergence == "-") {
      //   remark += " convergence not found";
      // } else
      if (
        excelData[k].convergence != "-" &&
        !numberPattern.test(excelData[k].convergence)
      ) {
        remark += "convergence should only contain numbers, ";
      }
      var totalCost = (
        parseFloat(excelData[k].quantity) * parseFloat(excelData[k].unitCost)
      ).toFixed(4);

      var LHWRF = isNaN(Number(excelData[k].LHWRF))
        ? 0
        : parseFloat(excelData[k].LHWRF);
      var grant = isNaN(Number(excelData[k].externalGrant))
        ? 0
        : parseFloat(excelData[k].externalGrant);
      var CC = isNaN(Number(excelData[k].CC)) ? 0 : parseFloat(excelData[k].CC);

      if (totalCost != (LHWRF + grant + CC).toFixed(4)) {
        remark += "total cost should be equal to sum of 3 Source of Funds, ";
      }
      // console.log("remark", remark);

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
        .trim()}_${excelData[k].approvalNo}_${
        excelData[k].approvalSubmissionDate
      }`;

      // Check if the combination is already in the unique set
      if (uniqueCombinations.has(combinationKey)) {
        remark = "Duplicate Approval Details found in the file.";
      } else {
        // Add the combination to the set if not a duplicate
        uniqueCombinations.add(combinationKey);
      }

      if (remark == "") {
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
        if (programAvailability.length == 0) {
          remark +=
            excelData[k].program + " is not available in Program Master,";
        }
        // console.log("remark 2", remark);
        if (projectAvailability.length == 0) {
          remark +=
            " " + excelData[k].project + " is not available in Project Master,";
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
        8;
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
          var centerDetails = await getCenterDetails(
            excelData[k]?.centerName.trim()
          );

          var query = { centerName: centerDetails?.centerName };
          var allApprovals = await getAllApprovals(query); // pass center_id to get less data
          var ApprovalExists = allApprovals.filter((item) => {
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
              moment(item.approvalSubmissionDate).format("YYYY-MM-DD") ===
                moment(
                  new Date(
                    Math.round(
                      (excelData[k].approvalSubmissionDate - 25569) *
                        86400 *
                        1000
                    )
                  )
                ).format("YYYY-MM-DD")
            ) {
              return item;
            }
          });
          // console.log("in else ApprovalExists", ApprovalExists.length);
          if (ApprovalExists.length === 0) {
            // var validMomentDate = excelSerialToDate(
            //   excelData[k].approvalSubmissionDate
            // );

            let centerName = centerDetails.centerName.toUpperCase();
            let center_id = centerDetails._id;
            let totalCost = parseInt(excelData[k].totalCost);

            let approvalAuthourities = await findapprovalAuthourities(
              center_id,
              totalCost
            );
            // console.log("approvalAuthourities => ", approvalAuthourities);

            var approvalSubmissionDate = moment(
              new Date(
                Math.round(
                  (excelData[k].approvalSubmissionDate - 25569) * 86400 * 1000
                )
              )
            ).format("YYYY-MM-DD");

            const approvalNoToBeSubmitted = approvalNosMap[k];
            console.log("approvalNoToBeSubmitted", approvalNoToBeSubmitted);
            validObjects = excelData[k];
            validObjects.approvalAuthourities = approvalAuthourities
              ? approvalAuthourities
              : [];
            validObjects.sourceofFund = {
              LHWRF: parseInt(excelData[k].LHWRF),
              grant: parseInt(excelData[k].externalGrant),
              CC: parseInt(excelData[k].CC),
            };
            validObjects.approvalSubmissionDate = approvalSubmissionDate;
            validObjects.unit = unit;
            validObjects.centerName = centerDetails?.centerName;
            validObjects.center_id = centerDetails?._id;
            validObjects.program_id = program_id;
            validObjects.project_id = project_id;
            validObjects.activityName_id = activityName_id;
            validObjects.subactivityName_id = subactivityName_id;
            validObjects.approvalNo = approvalNoToBeSubmitted;

            validObjects.program = program;
            validObjects.project = project;
            validObjects.activityName = activityName;
            validObjects.subactivityName = subactivityName;
            validObjects.finalStatus = "pending";
            validObjects.fileName = req.body?.fileName;
            validObjects.createdBy = req.body?.createdBy;
            validObjects.createdAt = new Date();
            validData.push(validObjects);
            // console.log("validObjects", validObjects);
          } else {
            remark += "Approval details already exists.";
            invalidObjects = excelData[k];
            invalidObjects.failedRemark = remark;
            invalidData.push(invalidObjects);
            // console.log(
            //   "invalidObjects ApprovalExists",
            //   invalidObjects,
            //   invalidObjects.failedRemark
            // );
          }
        } else {
          invalidObjects = excelData[k];
          invalidObjects.failedRemark = remark;
          invalidData.push(invalidObjects);
          console.log(
            "invalidObjects subactivitiesAvailability",
            "k------",
            k,
            invalidObjects.failedRemark
          );
        }
      } else {
        invalidObjects = excelData[k];
        invalidObjects.failedRemark = remark;
        invalidData.push(invalidObjects);
      }
      remark = "";
    }

    console.log("remark 1", remark);
    Approval.insertMany(validData)
      .then((data) => {
        // console.log("insertMany data",data);
      })
      .catch((err) => {
        console.log("insertMany err", err);
      });
    console.log("invalidData", invalidData.length);
    if (invalidData.length > 0) {
      failedRecords.FailedRecords = invalidData;
      failedRecords.fileName = req.body.fileName;
      failedRecords.totalRecords = invalidData.length;
      const failedData = await insertFailedRecords(
        failedRecords,
        req.body.updateBadData
      );
      console.log("failedData", failedData.length);
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
        console.log("getunit err", err);
        reject(err);
      });
  });
};
var getCenterDetails = async (centerName) => {
  return new Promise(function (resolve, reject) {
    console.log("centerName", centerName);
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

var getAllApprovals = async (query) => {
  return new Promise(function (resolve, reject) {
    Approval.find(query)
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
    Approval.deleteMany({ fileName: fileName })
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
  // Approval.find({center_id:req.params.center_id,fileName:req.params.fileName})
  Approval.find({ fileName: req.params.fileName })
    .exec()
    .then((data) => {
      finaldata.goodrecords = data;
      finaldata.totalRecords = data.length;
      FailedRecords.find({ fileName: req.params.fileName })
        .exec()
        .then((badData) => {
          var failedRecords =
            badData.length > 0 ? badData[0].failedRecords : [];
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
async function getShortCenterName(centerName) {
  const centersArray = globalVariable?.centersArray;
  const center = centersArray?.find(
    (c) => c?.centerName?.toLowerCase() === centerName?.toLowerCase()
  );
  return center ? center?.shortName : null;
}

async function generateNewApprovalNo(
  centerName,
  approvalSubmissionDate,
  bulkArray = []
) {
  const formattedDate = moment(approvalSubmissionDate).format("YYYY-MM-DD");
  const now = new Date(formattedDate);
  const month = now.getMonth();
  const year = now.getFullYear();

  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  const financialYear = `${startYear}-${String(endYear).slice(-2)}`;
  // const centerCode = centerName.substring(0, 3).toUpperCase();
  const centerCode = await getShortCenterName(centerName);
  const prefix = `${financialYear}/${centerCode}/AP-`;

  const regex = new RegExp(`^${prefix}\\d{6}$`);
  const existingApprovals = await Approval.find({ approvalNo: regex }).select(
    "approvalNo"
  );

  const existingNumbers = existingApprovals.map((doc) =>
    parseInt(doc.approvalNo.split("-").pop(), 10)
  );
  const existingSet = new Set(existingNumbers);
  const maxExistingNumber =
    existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;

  const countToGenerate = bulkArray.length === 0 ? 1 : bulkArray.length;
  const newApprovalNos = [];

  let nextNumber = maxExistingNumber + 1;

  // Generate unique numbers even in current call
  while (newApprovalNos.length < countToGenerate) {
    if (!existingSet.has(nextNumber)) {
      const newApprovalNo = `${prefix}${String(nextNumber).padStart(6, "0")}`;
      newApprovalNos.push(newApprovalNo);
      existingSet.add(nextNumber); // prevent reuse within this call
    }
    nextNumber++;
  }

  if (bulkArray.length === 0) {
    return {
      approvalNos: newApprovalNos,
      approvalNo: newApprovalNos[0],
    };
  }

  return {
    approvalNos: newApprovalNos,
  };
}

// function generateNewApprovalNo(centerName, approvalSubmissionDate) {
//   const formattedDate = moment(approvalSubmissionDate).format("YYYY-MM-DD");
//   console.log("approvalSubmissionDate", approvalSubmissionDate);
//   console.log("formattedDate", formattedDate);
//   const now = new Date(formattedDate);
//   const month = now.getMonth();
//   const year = now.getFullYear();
//   let financialYear;

//   let startYear, endYear;
//   if (month >= 3) {
//     // If the current month is April (3) or later
//     startYear = year;
//     endYear = year + 1;
//   } else {
//     // If the current month is before April
//     startYear = year - 1;
//     endYear = year;
//   }

//   financialYear = `${startYear}-${String(endYear).slice(-2)}`;

//   // Extract the first three letters of the centerName
//   const centerCode = centerName.substring(0, 3);

//   // Fetch the latest approval number for the current financial year and center
//   return new Promise((resolve, reject) => {
//     // Fetch the latest approval number for the current financial year and center
//     Approval.findOne({
//       approvalNo: new RegExp(`^${financialYear}/${centerCode}/AP-`),
//     })
//       .sort({ approvalNo: -1 })
//       .then((lastApprovalRecord) => {
//         let newApprovalNumber = "000001"; // Default approval number if no records found
//         if (lastApprovalRecord) {
//           const lastApprovalNo = lastApprovalRecord.approvalNo.split("-").pop();
//           const lastNumber = parseInt(lastApprovalNo, 10);
//           newApprovalNumber = (lastNumber + 1).toString().padStart(6, "0");
//           console.log("newApprovalNumber==", newApprovalNumber);
//         }
//         // console.log( `${financialYear}/${centerCode}/AP-${newApprovalNumber}`)
//         // Construct the new approval number
//         const approvalNo = `${financialYear}/${centerCode}/AP-${newApprovalNumber}`;
//         let returnValue = {
//           success: true,
//           approvalNo: approvalNo,
//         };
//         resolve(returnValue);
//       })
//       .catch((error) => {
//         let returnValue = {
//           success: false,
//           approvalNo: error,
//         };
//       });
//   });
// }

function findapprovalAuthourities(center_id, totalCost) {
  // Step-1
  // Using totalCost, find all applicable Levels and Roles
  // of approving authorities from approval_level master.
  // Level-1 = Rs. 20,000
  // Level-2 = Rs. 1,00,000
  // Level-3 = Rs. 1,50,000
  // Level-4 = Rs. 1,50,000+ >

  // Step-2
  // Using center_id and Roles, find authorities from
  // Center_details master & User Management

  // Step-3
  // Return the authorities Array

  //totalcost = 1,25,000

  return new Promise((resolve, reject) => {
    ApprovalLevels.find({})
      .sort({ approverLevel: 1 })
      .then(async (approvalLevels) => {
        if (approvalLevels && approvalLevels.length > 0) {
          let approvalAuth = [];
          var selector1 = {
            _id: center_id,
          };
          var centerData = await CenterDetails.findOne(selector1, {
            villagesCovered: 0,
          });
          // console.log("selector1 j => ",  selector1);
          // console.log("centerData j => ", centerData);

          approvalAuth.push({
            approvalLevel: approvalLevels[0].approverLevel,
            approvalAuthRole: approvalLevels[0].approverAuthRole,
            approvalAuthName: centerData.centerInchargeDetails.Name,
            approvalAuthMobile: centerData.centerInchargeDetails.mobileNumber,
            approvalAuthEmail: centerData.centerInchargeDetails.email,
            status: "pending",
          });

          for (let i = 1; i < approvalLevels.length; i++) {
            // 1,50,000 <= 3,00,000
            //20000 <=20000
            // console.log("approvalLevels[i-1].maxCost <= totalCost",approvalLevels[i-1].maxCost <= totalCost,approvalLevels[i-1].maxCost,totalCost)
            // if(approvalLevels[i-1].maxCost <= totalCost){
            if (approvalLevels[i - 1].maxCost < totalCost) {
              if (i == 1) {
                approvalAuth.push({
                  approvalLevel: approvalLevels[i].approverLevel,
                  approvalAuthRole: approvalLevels[i].approverAuthRole,
                  approvalAuthName: centerData.seniorManagerDetails.Name,
                  approvalAuthMobile:
                    centerData.seniorManagerDetails.mobileNumber,
                  approvalAuthEmail: centerData.seniorManagerDetails.email,
                  status: "pending",
                });
              } else {
                var selector2 = {
                  roles: { $in: approvalLevels[i].approverAuthRole },
                };
                // console.log("selector2 i => ", i, "|", selector2);
                var userData = await Users.findOne(selector2, { services: 0 });
                // console.log("userData i => ", i, "|", userData);

                if (userData) {
                  approvalAuth.push({
                    approvalLevel: approvalLevels[i].approverLevel,
                    approvalAuthRole: approvalLevels[i].approverAuthRole,
                    approvalAuthName:
                      userData.profile.firstname +
                      " " +
                      userData.profile.lastname,
                    approvalAuthMobile: userData.profile.mobile,
                    approvalAuthEmail: userData.profile.email,
                    status: "pending",
                  });
                  // console.log("approvalAuth userData i => ",i, "|",approvalAuth)
                }
              }
            }
          }
          // console.log("approvalAuth 929",approvalAuth)

          if (approvalAuth.length > 0) {
            // console.log("approvalAuth if ", approvalAuth);
          } else {
            resolve({
              message: "Approval Authority Not Found",
              success: false,
            });
          }
          // console.log("approvalAuth end of for ", approvalAuth);

          resolve(approvalAuth);
        } else {
          // console.log("ApprovalLevels data not found error => ");
          reject({
            success: false,
          });
        }
      })
      .catch((error) => {
        // console.log("error 2", error);
        reject({
          message: error.message,
          success: false,
        });
      });
  });
}

exports.update_approval = async (req, res, next) => {
  try {
    const { ID, center_id, totalCost, user_id } = req.body;

    let approvalData = await Approval.findOne({ _id: ID });
    if (!approvalData) {
      return res
        .status(404)
        .json({ success: false, message: "Approval not found" });
    }

    let approvalAuthourities = [];
    if (
      center_id !== approvalData.center_id ||
      totalCost !== approvalData.totalCost
    ) {
      approvalAuthourities = await findapprovalAuthourities(
        center_id,
        totalCost
      ); // <-- Await here
    }

    // console.log("totalCost", totalCost);
    // console.log("approvalData.totalCost", approvalData.totalCost);
    // console.log("Center_id", center_id);
    // console.log("Center_id", approvalData.center_id);
    // console.log("ApprovalData", approvalData);
    // console.log("approval Authorities", approvalAuthourities);

    const updateData = {
      center_id: req.body.center_id,
      centerName: req.body.centerName,
      approvalSubmissionDate: req.body.approvalSubmissionDate,
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
      sourceofFund: {
        LHWRF: req.body.LHWRF,
        grant: req.body.grant,
        CC: req.body.CC,
      },
      convergence: req.body.convergence,
      remarks: req.body.remarks,
      fileName: req.body.fileName,
      documentUrl: req.body.documentUrl,
      documentName: req.body.documentName,
      approvalAuthourities,
    };

    const updateResult = await Approval.updateOne(
      { _id: ID },
      { $set: updateData }
    );

    // console.log("updateResult", updateResult.modifiedCount);

    if (updateResult?.modifiedCount > 0) {
      await Approval.updateOne(
        { _id: ID },
        { $push: { updateLog: { updatedAt: new Date(), updatedBy: user_id } } }
      );
      return res.status(200).json({
        success: true,
        message: "Approval Details updated Successfully.",
        data: updateResult,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Approval Details not modified" });
  } catch (error) {
    console.error("Error updating approval:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const excelSerialToDate = (serial) => {
  // Excel's epoch starts at 1900-01-01
  const excelEpoch = new Date(1899, 11, 30); // Adjust for Excel's leap year bug
  const converted = new Date(excelEpoch.getTime() + serial * 86400000);
  return moment(converted); // Now Moment will accept it
};

// exports.update_approval = (req, res, next) => {
//   let approvalData = [];

//   Approval.findOne({ _id: req.body.ID }).then((data) => {
//     console.log("approval data in update", data);
//     approvalData = data;
//   });

//   let center_id = req.body.center_id;
//   let totalCost = req.body.totalCost;
//   let approvalAuthourities = [];

//   if (
//     center_id !== approvalData.center_id ||
//     totalCost !== approvalData.totalCost
//   ) {
//     approvalAuthourities = findapprovalAuthourities(center_id, totalCost);
//   }

//   console.log("totalCost", totalCost);
//   console.log("approvalData.totalCost", approvalData.totalCost);
//   console.log("Center_id", center_id);
//   console.log("Center_id", approvalData.center_id);
//   console.log("ApprovalData", approvalData);

//   console.log("approval Authorities", approvalAuthourities);

//   Approval.updateOne(
//     { _id: req.body.ID },
//     {
//       $set: {
//         center_id: req.body.center_id,
//         centerName: req.body.centerName,
//         approvalSubmissionDate: req.body.approvalSubmissionDate,
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
//         remarks: req.body.remarks,
//         fileName: req.body.fileName,
//         documentUrl: req.body.documentUrl,
//         documentName: req.body.documentName,
//         approvalAuthourities: approvalAuthourities,
//       },
//     }
//   )
//     .exec()
//     .then((data) => {
//       if (data.modifiedCount == 1 || data.modifiedCount == 1) {
//         Approval.updateOne(
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
//               message: "Approval Details updated Successfully.",
//             });
//           });
//       } else {
//         res.status(200).json({
//           data,
//           success: true,
//           message: "Approval Details not modified",
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

exports.update_approval_status = (req, res, next) => {
  // console.log("update_approval_status req.body => ", req.body);
  Approval.findOneAndUpdate(
    {
      _id: req.body.ID,
      approvalAuthourities: {
        $elemMatch: {
          approvalAuthRole: req.body.approvalAuthRole,
          approvalAuthName: req.body.approvalAuthName,
        },
      },
    },
    {
      $set: {
        "approvalAuthourities.$.status": req.body.status,
        "approvalAuthourities.$.remark": req.body.remark,
        "approvalAuthourities.$.updatedAt": new Date(),
        "approvalAuthourities.$.updatedBy": req.body.user_id,
      },
    },
    { new: true }
  )
    .then(async (approvalRecord) => {
      // console.log("approvalRecord1 => ", approvalRecord);
      // main status of approval is remaining when all level will be approved
      if (approvalRecord) {
        let approvalAuthArr = approvalRecord.approvalAuthourities;
        let centerName = approvalRecord.centerName;
        let finalStatus = "";
        if (approvalAuthArr && approvalAuthArr.length > 0) {
          // console.log("finalStatus==============1",finalStatus)
          let allApproved = approvalAuthArr.every(
            (auth) => auth.status === "approved"
          );
          // if (
          //   approvalAuthArr[approvalAuthArr.length - 1].status === "approved"
          // )
          if (allApproved) {
            finalStatus = "approved";
            // console.log("finalStatus==============2",finalStatus)
          } else if (req.body.status === "rejected") {
            finalStatus = "rejected";
            // console.log("finalStatus==============3",finalStatus)
          } else {
            finalStatus = "pending";
            // console.log("finalStatus==============4",finalStatus)
          }
        }
        // console.log("finalStatus==============5",finalStatus)
        function findIndexByRole(role) {
          return approvalAuthArr.findIndex(
            (authority) => authority.approvalAuthRole === role
          );
        }
        // Example usage:
        const roleToFind = req.body.approvalAuthRole;
        const index = findIndexByRole(roleToFind);

        // console.log("index",index);
        const updatedStatusOfAuthourity = approvalAuthArr[index];
        const nextAuthourity = approvalAuthArr[index + 1];
        // console.log("updatedStatusOfAuthourity", updatedStatusOfAuthourity);
        // console.log("nextAuthourity", nextAuthourity);

        if (req.body.status == "approved") {
          var event = "Approval Management - Approval Status Approved";
          var approvalAction = "approved";
        } else if (req.body.status == "rejected") {
          var event = "Approval Management - Approval Status Rejected";
          var approvalAction = "rejected";
        }
        var notificationData_updatedStatusOfAuthourity = {
          event: event,
          toEmail: updatedStatusOfAuthourity.approvalAuthEmail,
          toMobileNumber: "+91" + updatedStatusOfAuthourity.approvalAuthMobile,
          toUserRole: updatedStatusOfAuthourity.approvalAuthRole,
          variables: {
            userName: updatedStatusOfAuthourity.approvalAuthName,
            email: updatedStatusOfAuthourity.approvalAuthEmail,
            mobile: updatedStatusOfAuthourity.approvalAuthMobile,
            role: updatedStatusOfAuthourity.approvalAuthRole,
            centerName: centerName,
            approvalLevel: updatedStatusOfAuthourity.approvalLevel,
            costTobeApproved: approvalRecord.totalCost,
            approvalAction: approvalAction,
            approvalNo: approvalRecord.approvalNo,
            here: `/${updatedStatusOfAuthourity.approvalAuthRole}/approval-management/approval-details/${approvalRecord._id}`,
            nextAuthorityName: `${nextAuthourity?.approvalAuthName} - ${nextAuthourity?.approvalAuthRole}`,
            rejectionRemark: updatedStatusOfAuthourity.remark
              ? updatedStatusOfAuthourity.remark
              : "-",      
            program: approvalRecord.program,
            project: approvalRecord.project,
            activity: approvalRecord.activityName,
            subactivity: approvalRecord.subactivityName,

          },
        };
        var send_notification_to_updatedStatusOfAuthourity =
          await sendNotification(notificationData_updatedStatusOfAuthourity);
        console.log(
          "send_notification_to_updatedStatusOfAuthourity",
          send_notification_to_updatedStatusOfAuthourity
        );
        // "Inform Applicant - Approval Action"

        // const applicantsToNotify = [];

        // const applicantDetails = await Users.findOne(
        //   { _id: req.body.updatedBy },
        //   { service: 0 }
        // );

        const approvalCreatorDetails = await Users.findOne(
          { _id: approvalRecord.createdBy },
          { service: 0 }
        );
        // console.log("applicantDetails", applicantDetails.profile.email);

        // applicantsToNotify.push(approvalCreatorDetails);

        // if (approvalCreatorDetails) {
        //   // for (applicant of applicantsToNotify) {
        //   var notificationData_user = {
        //     event: "Inform Applicant - Approval Action",
        //     toEmail: approvalCreatorDetails.profile.email,
        //     toMobileNumber: approvalCreatorDetails.profile.mobile,
        //     toUserRole: approvalCreatorDetails.roles,
        //     toUser_id: approvalCreatorDetails._id,
        //     applicantDetails: approvalCreatorDetails,
        //     variables: {
        //       userName:
        //         approvalCreatorDetails.profile.firstname +
        //         " " +
        //         approvalCreatorDetails.profile.lastname,
        //       email: approvalCreatorDetails.profile.email,
        //       mobile: approvalCreatorDetails.profile.mobile,
        //       role: approvalCreatorDetails.roles[0],
        //       centerName: approvalRecord.centerName,
        //       approvalNo: approvalRecord.approvalNo,
        //       approvalLevel: updatedStatusOfAuthourity.approvalLevel,
        //       costTobeApproved: approvalRecord.totalCost,
        //       approvalAction: approvalAction,
        //     },
        //   };
        //   var send_notification_to_applicant = await sendNotification(
        //     notificationData_user
        //   );
        //   console.log(
        //     "send_notification_to_applicant",
        //     send_notification_to_applicant
        //   );
        //   // }
        // }

        // Check if current authority is the last and either finalStatus is approved or this authority rejected
        const isLastAuthority = index === approvalAuthArr.length - 1;

        if (
          approvalCreatorDetails &&
          ((finalStatus === "approved" && isLastAuthority) ||
            req.body.status === "rejected")
        ) {
          console.log("updatedStatusOfAuthourity", updatedStatusOfAuthourity);
          var notificationData_user = {
            event: "Approval Management - Inform Applicant - Approval Action",
            toEmail: approvalCreatorDetails.profile.email,
            toMobileNumber: approvalCreatorDetails.profile.mobile,
            toUserRole: approvalCreatorDetails.roles,
            toUser_id: approvalCreatorDetails._id,
            applicantDetails: approvalCreatorDetails,
            variables: {
              userName:
                approvalCreatorDetails.profile.firstname +
                " " +
                approvalCreatorDetails.profile.lastname,
              email: approvalCreatorDetails.profile.email,
              mobile: approvalCreatorDetails.profile.mobile,
              role: approvalCreatorDetails.roles[0],
              centerName: approvalRecord.centerName,
              approvalNo: approvalRecord.approvalNo,
              approverName: updatedStatusOfAuthourity.approvalAuthName,
              approverRole: updatedStatusOfAuthourity.approvalAuthRole,
              approvalLevel: updatedStatusOfAuthourity.approvalLevel,
              costTobeApproved: approvalRecord.totalCost,
              approvalAction: approvalAction,    
              program: approvalRecord.program,
              project: approvalRecord.project,
              activity: approvalRecord.activityName,
              subactivity: approvalRecord.subactivityName,
            },
          };
          var send_notification_to_applicant = await sendNotification(
            notificationData_user
          );
          console.log(
            "send_notification_to_applicant",
            send_notification_to_applicant
          );
        }

        if (req.body.status == "approved" &&nextAuthourity?.approvalAuthEmail) {
          var notificationData_nextAuthourity = {
            event: "Approval Management - Inform Authourity - Approval Action",
            toEmail: nextAuthourity.approvalAuthEmail,
            toMobileNumber: "+91" + nextAuthourity.approvalAuthMobile,
            toUserRole: nextAuthourity.approvalAuthRole,
            variables: {
              approverName: updatedStatusOfAuthourity.approvalAuthName,
              approverRole: updatedStatusOfAuthourity.approvalAuthRole,
              centerName: centerName,
              approverLevel: updatedStatusOfAuthourity.approvalLevel,
              centerInchargeName: approvalAuthArr[0].approvalAuthName,
              centerInchargeRole: approvalAuthArr[0].approvalAuthRole,
              nextAuthourityName: nextAuthourity.approvalAuthName,
              nextAuthourityRole: nextAuthourity.approvalAuthRole,
              nextAuthourityLevel: nextAuthourity.approvalLevel,
              costTobeApproved: approvalRecord.totalCost,
              approvalNo: approvalRecord.approvalNo,    
              program: approvalRecord.program,
              project: approvalRecord.project,
              activity: approvalRecord.activityName,
              subactivity: approvalRecord.subactivityName,
            },
          };
          var send_notification_to_nextAuthourity = await sendNotification(
            notificationData_nextAuthourity
          );
          console.log(
            "send_notification_to_nextAuthourity",
            send_notification_to_nextAuthourity
          );
        }

        // All Approved and All Rejected Notification
        console.log("approvalCreatorDetails", approvalCreatorDetails);

        if (finalStatus === "approved") {
          var notificationData_Applicant_All_Approved = {
            event: "Approval Management - Inform Applicant - Approval Activity All Level Approved",
            toEmail: approvalCreatorDetails.profile.email,
            toMobileNumber: approvalCreatorDetails.profile.mobile,
            toUserRole: approvalCreatorDetails.roles,
            toUser_id: approvalCreatorDetails._id,
            applicantDetails: approvalCreatorDetails,
            variables: {
              userName:
                approvalCreatorDetails?.profile?.firstname +
                " " +
                approvalCreatorDetails?.profile?.lastname,
              email: approvalCreatorDetails?.profile?.email,
              mobile: approvalCreatorDetails?.profile?.mobile,
              role: approvalCreatorDetails?.roles[0],
              centerName: approvalRecord.centerName,
              approvalNo: approvalRecord.approvalNo,
              approverName: updatedStatusOfAuthourity.approvalAuthName,
              approverRole: updatedStatusOfAuthourity.approvalAuthRole,
              approvalLevel: updatedStatusOfAuthourity.approvalLevel,
              costTobeApproved: approvalRecord.totalCost,
              approvalAction: approvalAction,    
              program: approvalRecord.program,
              project: approvalRecord.project,
              activity: approvalRecord.activityName,
              subactivity: approvalRecord.subactivityName,
            },
          };
          var send_notification_to_applicant_All_Approved = await sendNotification(
            notificationData_Applicant_All_Approved
          );
          console.log("notificationData_Applicant_All_Approved",notificationData_Applicant_All_Approved);
          console.log("send_notification_to_applicant_All_Approved",send_notification_to_applicant_All_Approved);
          let approvalAuthorityNames = [];
          approvalAuthArr.map((authority) => {
            approvalAuthorityNames.push(
              `${authority.approvalAuthName} - ${authority.approvalAuthRole}`
            );
          });

          for (authority of approvalAuthArr) {
            var notificationData_allAuthouritiesApproved = {
              event: "Approval Management - Inform Authourities - Approval Activity All Level Approved",
              toEmail: authority.approvalAuthEmail,
              toMobileNumber: "+91" + authority.approvalAuthMobile,
              toUserRole: authority.approvalAuthRole,
              variables: {
                recipient: authority.approvalAuthName,
                authorityNames: approvalAuthorityNames.join(", "),
                approverRole: authority.approvalAuthRole,
                centerName: centerName,
                approvedCost: approvalRecord.totalCost,
                approvalNo: approvalRecord.approvalNo,    
                program: approvalRecord.program,
                project: approvalRecord.project,
                activity: approvalRecord.activityName,
                subactivity: approvalRecord.subactivityName,
              },
            };
            var send_notification_to_allAuthourities = await sendNotification(
              notificationData_allAuthouritiesApproved
            );
            console.log(
              "send_notification_to_allAuthourities",
              send_notification_to_allAuthourities
            );
          }
        } else if (finalStatus === "rejected") {
          
          var notificationData_Applicant_All_Rejected = {
            event: "Approval Management - Inform Applicant - Approval Activity All Level Rejected",
            toEmail: approvalCreatorDetails.profile.email,
            toMobileNumber: approvalCreatorDetails.profile.mobile,
            toUserRole: approvalCreatorDetails.roles,
            toUser_id: approvalCreatorDetails._id,
            applicantDetails: approvalCreatorDetails,
            variables: {
              userName:
                approvalCreatorDetails.profile.firstname +
                " " +
                approvalCreatorDetails.profile.lastname,
              email: approvalCreatorDetails.profile.email,
              mobile: approvalCreatorDetails.profile.mobile,
              role: approvalCreatorDetails.roles[0],
              centerName: approvalRecord.centerName,
              approvalNo: approvalRecord.approvalNo,
              approverName: updatedStatusOfAuthourity.approvalAuthName,
              approverRole: updatedStatusOfAuthourity.approvalAuthRole,
              approvalLevel: updatedStatusOfAuthourity.approvalLevel,
              costTobeApproved: approvalRecord.totalCost,
              approvalAction: approvalAction,    
              program: approvalRecord.program,
              project: approvalRecord.project,
              activity: approvalRecord.activityName,
              subactivity: approvalRecord.subactivityName,
            },
          };
          var send_notification_to_applicant_All_Rejected = await sendNotification(
            notificationData_Applicant_All_Rejected
          );
          console.log("notificationData_Applicant_All_Rejected",notificationData_Applicant_All_Rejected)
          console.log("send_notification_to_applicant_All_Rejected",send_notification_to_applicant_All_Rejected)
          let approvalAuthorityNames = [];
          // Find the rejecting authority's index
          const rejectingAuthorityIndex = approvalAuthArr.findIndex(
            (auth) =>
              auth.approvalAuthEmail ===
              updatedStatusOfAuthourity.approvalAuthEmail
          );
          // Get previous authorities + the rejecting authority
          const authoritiesToNotify = approvalAuthArr.slice(
            0,
            rejectingAuthorityIndex + 1
          );
          authoritiesToNotify.map((authority) => {
            approvalAuthorityNames.push(
              `${authority.approvalAuthName} - ${authority.approvalAuthRole}`
            );
          });
          for (const authority of authoritiesToNotify) {
            var notificationData_allAuthouritiesRejected = {
              event: "Approval Management - Inform Authourities - Approval Activity All Level Rejected",
              toEmail: authority.approvalAuthEmail,
              toMobileNumber: "+91" + authority.approvalAuthMobile,
              toUserRole: authority.approvalAuthRole,
              variables: {
                recipient: authority.approvalAuthName,
                authorityNames: approvalAuthorityNames.join(", "),
                rejectorAuthority: `${approvalAuthArr[rejectingAuthorityIndex].approvalAuthName} - ${approvalAuthArr[rejectingAuthorityIndex].approvalAuthRole}`,
                approverRole: authority.approvalAuthRole,
                centerName: centerName,
                approvalNo: approvalRecord.approvalNo,    
                program: approvalRecord.program,
                project: approvalRecord.project,
                activity: approvalRecord.activityName,
                subactivity: approvalRecord.subactivityName,
              },
            };

            var send_notification_to_allAuthourities = await sendNotification(
              notificationData_allAuthouritiesRejected
            );

            console.log(
              "send_notification_to_allAuthourities",
              send_notification_to_allAuthourities
            );
          }
        }
        Approval.updateOne(
          { _id: req.body.ID },
          {
            $set: {
              finalStatus: finalStatus,
              approvalDate: moment(new Date()).format("YYYY-MM-DD"),
            },
            $push: {
              updateLog: [
                { updatedAt: new Date(), updatedBy: req.body.updatedBy },
              ],
            },
          }
        )
          .then((data) => {
            console.log("data => ", data);

            if (data.modifiedCount == 1) {
              res.status(200).json({
                data,
                success: true,
                message: "Status of Approval Details updated Successfully.",
              });
            } else {
              console.log("Status of Approval Details are not modified");

              res.status(200).json({
                success: false,
                message: "Status of Approval Details are not modified",
              });
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              success: false,
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        success: false,
        error: err,
      });
    });
};

const getCurrentFinancialYearRange = () => {
  const today = moment();

  const financialYearStartMonth = 3;
  const financialYearStartDay = 1;
  const financialYearEndMonth = 2;
  const financialYearEndDay = 31;

  let startDate, endDate;

  if (today.month() >= financialYearStartMonth) {
    startDate = moment([
      today.year(),
      financialYearStartMonth,
      financialYearStartDay,
    ]);
    endDate = moment([
      today.year() + 1,
      financialYearEndMonth,
      financialYearEndDay,
    ]);
  } else {
    startDate = moment([
      today.year() - 1,
      financialYearStartMonth,
      financialYearStartDay,
    ]);
    endDate = moment([
      today.year(),
      financialYearEndMonth,
      financialYearEndDay,
    ]);
  }

  return {
    startDate: startDate.format("DD-MM-YYYY"),
    endDate: endDate.format("DD-MM-YYYY"),
  };
};
function getFirstPendingAfterApproved(approvalAuthourities) {
  if (!Array.isArray(approvalAuthourities) || approvalAuthourities.length === 0)
    return null;

  const allPending = approvalAuthourities.every(
    (auth) => auth.status === "pending"
  );
  if (allPending) {
    return approvalAuthourities[0]; // Return Level-1 if all are pending
  }

  // Find index of last approved status
  const lastApprovedIndex = approvalAuthourities.findIndex((auth, index) => {
    const next = approvalAuthourities[index + 1];
    return auth.status === "approved" && (!next || next.status === "pending");
  });

  const nextPending = approvalAuthourities[lastApprovedIndex + 1];
  if (nextPending && nextPending.status === "pending") {
    return nextPending;
  }

  return null;
}

exports.list_approvaldetails_with_filters = async (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  let query = {};

  if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
    query.approvalSubmissionDate = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  }

  if (req.body.center_ID !== "all") query.center_id = req.body.center_ID;
  if (req.body.program_id !== "all") query.program_id = req.body.program_id;
  if (req.body.project_id !== "all") query.project_id = req.body.project_id;
  if (req.body.activityName_id !== "all")
    query.activityName_id = req.body.activityName_id;
  if (req.body.subactivityName_id !== "all")
    query.subactivityName_id = req.body.subactivityName_id;

  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i");
    query.$or = [
      { centerName: searchRegex },
      { program: searchRegex },
      { project: searchRegex },
      { activityName: searchRegex },
      { subactivityName: searchRegex },
      { unit: searchRegex },
      { approvalNo: searchRegex },
      { finalStatus: searchRegex },
      { utilizationStatus: searchRegex },
    ];
  }
  try {
    const totalRecs = await Approval.countDocuments(query);

    let approvalQuery = Approval.find(query);
    if (!req.body.removePagination) {
      approvalQuery = approvalQuery
        .skip(parseInt(skipRec))
        .limit(parseInt(recsPerPage));
    }

    const approvals = await approvalQuery.sort({ createdAt: -1 }).exec();

    const approvalData = await Promise.all(
      approvals.map(async (item) => {
        const approvalTotalCost = item.totalCost;
        const approvalConvergence = item.convergence ? item.convergence : 0;

        const utilizationSum = await Utilization.aggregate([
          { $match: 
            { approvalNo: item.approvalNo } 
          },
          {
            $group: {
              _id: null,
              totalUtilizedCost: { $sum: "$totalCost" },
              utilizedConvergence: { $sum: "$convergence" },
            },
          },
        ]);

        // console.log("utilizationSum", utilizationSum);
        const totalUtilizedCost =
          utilizationSum.length > 0 ? utilizationSum[0].totalUtilizedCost : 0;
        const utilizedConvergence =
          utilizationSum.length > 0 ? utilizationSum[0].utilizedConvergence : 0;

        const costDifference = totalUtilizedCost - approvalTotalCost;
        let hideUtilizationButton = false;
        var approvalDate = moment(item?.approvalDate)?.format("DD-MM-YYYY");
       
        if (
          (approvalTotalCost !== 0 && totalUtilizedCost >= approvalTotalCost) ||
          (approvalConvergence !== 0 &&
            utilizedConvergence >= approvalConvergence) ||
          // || costDifference <= item.unitCost
          !isDateInFinancialYear(approvalDate) 
        ) {
          hideUtilizationButton = true;
        }

        const finalStatus = item.finalStatus ? item.finalStatus : "pending";
        const pendingLevel =
          finalStatus === "pending"
            ? getFirstPendingAfterApproved(item.approvalAuthourities)
            : "";
        // console.log(index, "--------", finalStatus, "--------", pendingLevel);

        // console.log("hideUtilizationButton", hideUtilizationButton);
        return {
          _id: item._id,
          finalStatus:
            finalStatus === "pending"
              ? finalStatus +
                (pendingLevel?.approvalLevel
                  ? " (" + pendingLevel?.approvalLevel + ")"
                  : "")
              : finalStatus,
          approvalDate:
            item?.finalStatus === "approved"
              ? moment(item.approvalDate).format("DD-MM-YYYY")
              : "--NA--",
          center_id: item.center_id ? item.center_id : "--NA--",
          centerName: item.centerName ? item.centerName : "--NA--",
          approvalSubmissionDate: item.approvalSubmissionDate
            ? moment(item.approvalSubmissionDate).format("DD-MM-YYYY")
            : "--NA--",
          approvalNo: item.approvalNo ? item.approvalNo : "--NA--",
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
          unit: item.unit ? item.unit : "--NA--",
          unitCost: item.unitCost ? item.unitCost : 0,
          quantity: item.quantity ? item.quantity : 0,
          noOfHouseholds: item.noOfHouseholds ? item.noOfHouseholds : 0,
          noOfBeneficiaries: item.noOfBeneficiaries
            ? item.noOfBeneficiaries
            : 0,
          totalCost: approvalTotalCost ? approvalTotalCost : 0,
          totalUtilizedCost: totalUtilizedCost ? totalUtilizedCost : 0,
          LHWRF: item.sourceofFund.LHWRF ? item.sourceofFund.LHWRF : 0,
          grant: item.sourceofFund.grant ? item.sourceofFund.grant : 0,
          CC: item.sourceofFund.CC ? item.sourceofFund.CC : 0,
          convergence: item.convergence ? item.convergence : 0,
          remarks: item.remarks ? item.remarks : "--NA--",
          hideUtilizationButton: hideUtilizationButton,
          utilizationStatus:item.utilizationStatus,
        };
      })
    );

    var noOfHouseholds = 0;
    var noOfBeneficiaries = 0;
    var totalCost = 0;
    var totalUtilizedCost = 0;
    var LHWRF = 0;
    var grant = 0;
    var CC = 0;
    var convergence = 0;
    for (var index = 0; index < approvalData.length; index++) {
      noOfHouseholds += approvalData[index].noOfHouseholds
        ? approvalData[index].noOfHouseholds
        : 0;
      noOfBeneficiaries += approvalData[index].noOfBeneficiaries
        ? approvalData[index].noOfBeneficiaries
        : 0;
      totalCost += approvalData[index].totalCost
        ? approvalData[index].totalCost
        : 0;
      totalUtilizedCost += approvalData[index].totalUtilizedCost
        ? approvalData[index].totalUtilizedCost
        : 0;
      LHWRF += approvalData[index].LHWRF ? approvalData[index].LHWRF : 0;
      grant += approvalData[index].grant ? approvalData[index].grant : 0;
      CC += approvalData[index].CC ? approvalData[index].CC : 0;
      convergence += approvalData[index].convergence
        ? approvalData[index].convergence
        : 0;
    }
    if (index >= approvalData.length && approvalData.length > 0) {
      approvalData.push({
        _id: 0,
        finalStatus: "-",
        approvalDate: "-",
        center_id: "-",
        centerName: "Total",
        approvalSubmissionDate: "-",
        approvalNo: "-",
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
        totalUtilizedCost: totalUtilizedCost,
        LHWRF: LHWRF,
        grant: grant,
        CC: CC,
        convergence: convergence,
        remarks: "-",

        hideUtilizationButton: "-",
      });
    }
    res.status(200).json({
      totalRecs: totalRecs,
      tableData: approvalData,
      success: true,
    });
  } catch (error) {
    console.log("Error in Approval List => ", error);
    res.status(500).json({ errorMsg: error.message, success: false });
  }
};
function isDateInFinancialYear(dateString) {
  // Parse the date string (format: 'DD-MM-YYYY')
  const [day, month, year] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month - 1 because months are 0-indexed in JS

  // Get today's date
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based (Jan = 0, Feb = 1, ..., Dec = 11)

  // Determine financial year dynamically
  let financialYearStart, financialYearEnd;

  if (currentMonth < 3) {
    // If today is before April (Jan, Feb, March), financial year is (last year - current year)
    financialYearStart = new Date(currentYear - 1, 3, 1); // April 1 of last year
    financialYearEnd = new Date(currentYear, 2, 31); // March 31 of current year
  } else {
    // If today is April or later, financial year is (current year - next year)
    financialYearStart = new Date(currentYear, 3, 1); // April 1 of this year
    financialYearEnd = new Date(currentYear + 1, 2, 31); // March 31 of next year
  }

  // console.log("Financial Year Start:", financialYearStart);
  // console.log("Financial Year End:", financialYearEnd);
  // Check if the date is within the financial year
  return date >= financialYearStart && date <= financialYearEnd;
}

exports.fetch_approval = (req, res, next) => {
  Approval.find({ _id: req.params.ID })
    .exec()
    .then((data) => {
      // console.log("data", data);

      if (data[0]?.approvalAuthourities?.length === 0) {
        let center_id = data[0]?.center_id;
        let totalCost = data[0]?.totalCost;
        let approvalAuthourities = findapprovalAuthourities(
          center_id,
          totalCost
        );
        Approval.updateOne(
          { _id: req.params.ID },
          {
            $set: {
              approvalAuthourities: approvalAuthourities,
            },
          }
        )
          .then((data) => {
            // console.log("approvalAuthorities updated", data);
          })
          .catch((error) => {
            console.log("error in updating approval authorities", error);
          });
      }
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

const getCurrentFinancialYear = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0 for January, so +1 to make it 1-12
  let startYear, endYear;

  if (currentMonth >= 4) {
    // If it's April or later, the current financial year starts this year and ends next year
    startYear = currentYear;
    endYear = currentYear + 1;
  } else {
    // If it's before April, the financial year started last year and ends this year
    startYear = currentYear - 1;
    endYear = currentYear;
  }

  return `${startYear}-${String(endYear).slice(-2)}`; // e.g., "2024-25"
};

const currentFinancialYear = getCurrentFinancialYear();

exports.list_approvaldetails_without_filters = (req, res, next) => {
  console.log("req.params.centerID", req.params.centerID);
  if (req.params.centerID !== "all") {
    Approval.find({
      center_id: req.params.centerID,
      // approvalNo: new RegExp(`${currentFinancialYear}`),
    })
      .exec()
      .then((data) => {
        res.status(200).json({
          data: data,
          success: true,
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

exports.delete_approval = (req, res, next) => {
  // console.log("req.params.ID ",req.params.ID);
  Approval.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      res.status(200).json({
        deleted: true,
        message: "Approval List deleted Successfully.",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.list_approvaldetails_with_filtersold = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  var query = {};
  if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
    query.approvalSubmissionDate = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  }

  if (req.body.center_ID !== "all") query.center_id = req.body.center_ID;
  if (req.body.program_id !== "all") query.program_id = req.body.program_id;
  if (req.body.project_id !== "all") query.project_id = req.body.project_id;
  if (req.body.activityName_id !== "all")
    query.activityName_id = req.body.activityName_id;
  if (req.body.subactivityName_id !== "all")
    query.subactivityName_id = req.body.subactivityName_id;
  //  search text condition
  // console.log("req.body.searchText",req.body)
  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
    query.$or = [
      { centerName: searchRegex },
      { program: searchRegex },
      { project: searchRegex },
      { activityName: searchRegex },
      { subactivityName: searchRegex },
      { unit: searchRegex },
    ];
  }

  Approval.countDocuments(query)
    .then((totalRecs) => {
      // console.log("totalRecs => ", totalRecs);
      let approvalQuery = Approval.find(query);
      if (!req.body.removePagination) {
        approvalQuery = approvalQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }
      approvalQuery
        .sort({ createdAt: -1 })
        .then((data) => {
          var approvalData = data.map((item, index) => {
            return {
              _id: item._id,
              center_id: item.center_id ? item.center_id : "--NA--",
              centerName: item.centerName ? item.centerName : "--NA--",
              approvalSubmissionDate: item.approvalSubmissionDate
                ? moment(item.approvalSubmissionDate).format("DD-MM-YYYY")
                : "--NA--",
              approvalNo: item.approvalNo ? item.approvalNo : "--NA--",
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
              unit: item.unit ? item.unit : "--NA--",
              unitCost: item.unitCost ? item.unitCost : "--NA",
              quantity: item.quantity ? item.quantity : "--NA",
              noOfHouseholds: item.noOfHouseholds
                ? item.noOfHouseholds
                : "--NA",
              noOfBeneficiaries: item.noOfBeneficiaries
                ? item.noOfBeneficiaries
                : "--NA",
              totalCost: item.totalCost ? item.totalCost : "--NA",
              LHWRF: item.sourceofFund.LHWRF
                ? item.sourceofFund.LHWRF
                : "--NA--",
              grant: item.sourceofFund.grant
                ? item.sourceofFund.grant
                : "--NA--",
              CC: item.sourceofFund.CC ? item.sourceofFund.CC : "--NA--",
              convergence: item.convergence ? item.convergence : "--NA--",
              remarks: item.remarks ? item.remarks : "--NA--",
              finalStatus: item.finalStatus ? item.finalStatus : "pending",
            };
          });
          console.log("approvalData", approvalData.length);
          res.status(200).json({
            totalRecs: totalRecs,
            tableData: approvalData,
            success: true,
          });
        })
        .catch((error) => {
          console.log("Error in ApprovalList  => ", error);
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
