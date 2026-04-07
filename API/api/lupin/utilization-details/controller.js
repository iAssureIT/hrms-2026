const mongoose = require("mongoose");
const _ = require("underscore");
const moment = require("moment");
const { sendNotification } = require("../../admin2.0/common/globalFunctions");
const Utilization = require("./model.js");
const Approval = require("../approval-details/model.js");
const ProgramMaster = require("../oneFieldModules/programManagement/modelNew.js");
const ProjectMaster = require("../oneFieldModules/projectManagement/modelNew.js");
const ActivityMaster = require("../oneFieldModules/ActivityManagement/model.js");
const Subactivity = require("../SubactivityMapping/model.js");
const FailedRecords = require("../failedRecords/model.js");
const CenterDetails = require("../centers/model.js");
const UnitMaster = require("../oneFieldModules/unitManagement/modelNew.js");
const UtilizationApprovalLevel = require("../utilization-approval-level/model.js");
const Users = require("../../admin2.0/userManagementnew/ModelUsers.js");
const ObjectId = mongoose.Types.ObjectId;
const globalVariable = require("../../../nodemonConfig.js");

exports.create_utilization = async (req, res, next) => {
  try {
    const {
      approvalNo,
      LHWRF,
      center_id,
      centerName,
      approvalDate,
      voucherDate,
      program_id,
      program,
      project_id,
      project,
      activityName_id,
      activityName,
      subactivityName_id,
      subactivityName,
      unit,
      unitCost,
      quantity,
      totalCost,
      grant,
      CC,
      convergence,
      noOfHouseholds,
      noOfBeneficiaries,
      activityStatus,
      convergenceAgencyName,
      convergenceDocumentName,
      convergenceNote,
      fileName,
      voucherDocumentUrl,
      voucherDocumentName,
      convergenceDocumentUrl,
      S3ConvergenceDocumentName,
      user_id,
    } = req.body;

    const approval = await Approval.findOne({ approvalNo });
    console.log(approval);
    if (!approval) {
      return res
        .status(400)
        .json({ error: "Approval record not found", success: false });
    }
    const totalUtilized = await Utilization.aggregate([
      { $match: { approvalNo } },
      { $group: { _id: null, totalLHWRF: { $sum: "$sourceofFund.LHWRF" } } },
    ]);
    const totalUtilizedAmount =
      totalUtilized.length > 0 ? totalUtilized[0].totalLHWRF : 0;
    if (
      parseInt(totalUtilizedAmount) + parseInt(LHWRF) >
      approval.sourceofFund.LHWRF
    ) {
      return res.status(400).json({
        error: "Total Utilized LHWRF amount exceeds the approved LHWRF amount.",
        success: false,
      });
    }

    let voucherNoObj = await generateNewVoucherNo(centerName, voucherDate);
    if (voucherNoObj.voucherNo) {
      // Utilization.findOne({
      //   center_id: center_id,
      //   program_id: program_id,
      //   project_id: project_id,
      //   activityName_id: activityName_id,
      //   subactivityName_id: subactivityName_id,
      //   voucherDate: moment(voucherDate).format("YYYY-MM-DD"),
      // })
      //   .exec()
      //   .then(async (data) => {
      //     if (data) {
      //       res.status(200).json({
      //         message:
      //           "Utilization details already exists for this Center, Masters and Voucher Date",
      //         success: false,
      //       });
      //     } else {
      let approvalAuthourities = await findapprovalAuthourities(
        center_id,
        totalCost
      );

      // console.log("approvalAuthourities => ", approvalAuthourities);

      const utilization = new Utilization({
        _id: new mongoose.Types.ObjectId(),
        center_id,
        centerName,
        approvalDate,
        approvalNo,
        voucherDate,
        voucherNumber: voucherNoObj.voucherNo,
        program_id,
        program,
        project_id,
        project,
        activityName_id,
        activityName,
        subactivityName_id,
        subactivityName,
        unit,
        unitCost,
        quantity,
        totalCost,
        sourceofFund: {
          LHWRF,
          grant,
          CC,
        },
        convergence,
        noOfHouseholds,
        noOfBeneficiaries,
        activityStatus,
        convergenceAgencyName,
        convergenceDocumentName,
        convergenceNote,
        fileName,
        voucherDocumentUrl,
        voucherDocumentName,
        convergenceDocumentUrl,
        S3ConvergenceDocumentName,
        finalStatus: "pending",
        paymentDetails: {
          UTRNumber: "",
          paymentDate: "",
          paymentStatus: "pending",
          updatedAt: new Date(),
          updatedBy: user_id,
        },
        approvalAuthourities: approvalAuthourities,
        createdBy: user_id,
        createdAt: new Date(),
      });
      const response = await utilization.save();
      console.log("response", response);
      if(activityStatus==="Completed"){
        const UpdateUtilizationStatus = await Approval.updateOne(
          { approvalNo : approvalNo },
          { $set: {utilizationStatus: "Completed"} } )
        console.log("UpdateUtilizationStatus",UpdateUtilizationStatus)
      }else{
        const UpdateUtilizationStatus = await Approval.updateOne(
          { approvalNo : approvalNo },
          { $set: {utilizationStatus: "Pending"} } )
      }
      const userDetails = await Users.findOne(
        { _id: req.body.user_id },
        { service: 0 }
      );
      // console.log("userDetails", userDetails);
      if (userDetails) {
        var notificationData_user = {
          event: "Utilization Management - Create Utilization Approval",
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
            createdAt: moment(response.createdAt).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            centerName: req.body.centerName,
            approvalLevel: "Level-1",
            costTobeApproved: req.body.totalCost,
            approvalNo: req.body.approvalNo,
            voucherNumber: voucherNoObj.voucherNo,
            program: req.body.program,
            project: req.body.project,
            activity: req.body.activityName,
            subactivity: req.body.subactivityName,
          },
        };
        var send_notification_to_user = await sendNotification(
          notificationData_user
        );
        console.log("send_notification_to_user", send_notification_to_user);
      }
      if (approvalAuthourities && approvalAuthourities.length > 0) {
        if (approvalAuthourities[0].approvalLevel === "Level-1") {
          var email = approvalAuthourities[0].approvalAuthEmail;
          var mobileNumber = approvalAuthourities[0].approvalAuthMobile;
          var role = approvalAuthourities[0].approvalAuthRole;
          var userName = approvalAuthourities[0].approvalAuthName;
          var notificationData_Authority = {
            event: "Utilization Management - Inform Authourity for Utilization Approval",
            toEmail: email,
            toMobileNumber: "+91" + mobileNumber,
            toUserRole: role,
            variables: {
              userName: userName,
              email: email,
              mobile: mobileNumber,
              role: role,
              createdAt: moment(response.createdAt).format(
                "MMMM Do YYYY, h:mm:ss a"
              ),
              centerName: req.body.centerName,
              approvalLevel: "Level-1",
              costTobeApproved: req.body.totalCost,
              approvalNo: req.body.approvalNo,
              voucherNumber: voucherNoObj.voucherNo,
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
        message: "Utilization Details submitted Successfully.",
        insertedLevel: response,
        success: true,
      });
      // }
      // })
      // .catch((error) => {
      //   console.log("create_approval error => ", error);
      //   res.status(500).json({
      //     message: error.message,
      //     success: false,
      //   });
      // });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};

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
    UtilizationApprovalLevel.find({})
      .sort({ approverLevel: 1 })
      .then(async (approvalLevels) => {
        // console.log("approval levels", approvalLevels);
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
          console.log("UtilizationApprovalLevel data not found error => ");
          reject({
            success: false,
          });
        }
      })
      .catch((error) => {
        console.log("error 2", error);
        reject({
          message: error.message,
          success: false,
        });
      });
  });
}

function getShortCenterName(centerName) {
  const centersArray = globalVariable?.centersArray;
  const center = centersArray.find(
    (c) => c.centerName.toLowerCase() === centerName.toLowerCase()
  );
  return center ? center.shortName : null;
}
async function generateNewVoucherNo(centerName, voucherDate, bulkArray = []) {
  const formattedDate = moment(voucherDate).format("YYYY-MM-DD");
  const now = new Date(formattedDate);
  const month = now.getMonth();
  const year = now.getFullYear();

  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  const financialYear = `${startYear}-${String(endYear).slice(-2)}`;
  // const centerCode = centerName.substring(0, 3).toUpperCase();
  const centerCode = await getShortCenterName(centerName);

  const prefix = `${financialYear}/${centerCode}/VR-`;

  const regex = new RegExp(`^${prefix}\\d{6}$`);
  const existingVouchers = await Utilization.find({
    voucherNumber: regex,
  }).select("voucherNumber");

  const existingNumbers = existingVouchers.map((doc) =>
    parseInt(doc.voucherNumber.split("-").pop(), 10)
  );
  const existingSet = new Set(existingNumbers);
  const maxExistingNumber =
    existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;

  const countToGenerate = bulkArray.length === 0 ? 1 : bulkArray.length;
  const newVoucherNos = [];

  let nextNumber = maxExistingNumber + 1;

  // Generate unique numbers even in current call
  while (newVoucherNos.length < countToGenerate) {
    if (!existingSet.has(nextNumber)) {
      const newVoucherNo = `${prefix}${String(nextNumber).padStart(6, "0")}`;
      newVoucherNos.push(newVoucherNo);
      existingSet.add(nextNumber); // prevent reuse within this call
    }
    nextNumber++;
  }

  if (bulkArray.length === 0) {
    return {
      voucherNos: newVoucherNos,
      voucherNo: newVoucherNos[0],
    };
  }

  return {
    voucherNos: newVoucherNos,
  };
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

exports.bulkUpload_utilization = (req, res, next) => {
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

  processData();
  async function processData() {
    const centerName = await excelData[0]?.centerName;
    var voucherDate = await excelData[0]?.voucherDate;
    var allPrograms = await getAllProgramMaster({});
    var allProjects = await getAllProjects({});
    var allActivities = await getAllActivities({});

    var uniqueCombinations = new Set();

    const voucherGroups = {}; // { "2024-25/BHA": [index1, index2, ...] }

    for (let index = 0; index < excelData.length; index++) {
      const row = excelData[index];
      const voucherDate = new Date(
        Math.round((row.voucherDate - 25569) * 86400 * 1000)
      );
      const month = voucherDate.getMonth();
      const year = voucherDate.getFullYear();
      const startYear = month >= 3 ? year : year - 1;
      const endYear = startYear + 1;
      const financialYear = `${startYear}-${String(endYear).slice(-2)}`;

      // const centerCode = row.centerName.substring(0, 3).toUpperCase();
      const centerCode = await getShortCenterName(row.centerName);
      const groupKey = `${financialYear}/${centerCode}`;
      // console.log("groupKey1", groupKey);

      if (!voucherGroups[groupKey]) {
        voucherGroups[groupKey] = [];
      }

      voucherGroups[groupKey].push(index);
    }

    // Now generate approval numbers per group
    const voucherNosMap = {}; // { index: approvalNo }

    for (const groupKey of Object.keys(voucherGroups)) {
      // console.log("groupKey2", groupKey);

      const [financialYear, centerCode] = groupKey.split("/");

      const indexes = voucherGroups[groupKey];
      const sampleRow = excelData[indexes[0]];
      const voucherDate = new Date(
        Math.round((sampleRow.voucherDate - 25569) * 86400 * 1000)
      );

      const bulkArray = new Array(indexes.length).fill({});

      const { voucherNos } = await generateNewVoucherNo(
        sampleRow.centerName,
        voucherDate,
        bulkArray
      );

      indexes.forEach((idx, i) => {
        voucherNosMap[idx] = voucherNos[i];
      });
    }

    for (var k = 0; k < excelData.length; k++) {
      if (excelData[k].centerName == "-") {
        remark += " Center Name not found, ";
      }
      if (excelData[k].approvalDate == "-") {
        remark += " approvalDate not found, ";
      } else {
        // console.log("excelData[k].approvalDate",excelData[k].approvalDate)
        var validDate = isValidDateFormatDDMMYYYY(excelData[k].approvalDate);
        if (validDate) {
          // console.log("validDate=======================================",validDate)
          var approvalDate;
          if (typeof excelData[k].approvalDate == "number") {
            approvalDate = moment(
              new Date(
                Math.round((excelData[k].approvalDate - 25569) * 86400 * 1000)
              )
            ).format("YYYY-MM-DD");
            // console.log("approvalDate************", approvalDate);
          } else {
            var approvalDate1 = moment(
              excelData[k].approvalDate,
              "YYYY-MM-DD"
            )._i;
            var DD = approvalDate1.substring(0, 2);
            var MM = approvalDate1.substring(3, 5);
            var YYYY = approvalDate1.substring(6, 10);
            approvalDate = YYYY + "-" + MM + "-" + DD;
            // console.log("approvalDate=================", approvalDate);
          }
          // console.log("approvalDate", approvalDate);
        } else {
          remark +=
            "approvalDate is not valid. The format should be DD/MM/YYYY, ";
        }
      }
      if (excelData[k].approvalNo == "-") {
        remark += " approvalNo not found, ";
      }
      if (excelData[k].voucherDate == "-") {
        remark += " voucherDate not found, ";
      } else {
        // console.log("excelData[k].voucherDate",excelData[k].voucherDate)
        var validDate = isValidDateFormatDDMMYYYY(excelData[k].voucherDate);
        if (validDate) {
          // console.log("validDate=======================================",validDate)
          var voucherDate;
          if (typeof excelData[k].voucherDate == "number") {
            voucherDate = moment(
              new Date(
                Math.round((excelData[k].voucherDate - 25569) * 86400 * 1000)
              )
            ).format("YYYY-MM-DD");
            // console.log("voucherDate************", voucherDate);
          } else {
            var voucherDate1 = moment(
              excelData[k].voucherDate,
              "YYYY-MM-DD"
            )._i;
            var DD = voucherDate1.substring(0, 2);
            var MM = voucherDate1.substring(3, 5);
            var YYYY = voucherDate1.substring(6, 10);
            voucherDate = YYYY + "-" + MM + "-" + DD;
            // console.log("voucherDate=================", voucherDate);
          }
          // console.log("voucherDate", voucherDate);
        } else {
          remark +=
            "voucherDate is not valid. The format should be DD/MM/YYYY, ";
        }
      }
      if (excelData[k].voucherNumber == "-") {
        remark += "voucherNumber not found, ";
      }
      if (excelData[k].program == "-") {
        remark += "program not found, ";
      }
      if (excelData[k].project == "-") {
        remark += " project not found, ";
      }
      if (excelData[k].activityName == "-") {
        remark += " activityName not found, ";
      }
      if (excelData[k].subactivityName == "-") {
        remark += " subactivityName not found, ";
      }
      if (excelData[k].unit == "-") {
        remark += "unit not found, ";
      }
      if (excelData[k].unitCost == "-") {
        remark += "unitCost not found, ";
      } else if (!numberPattern.test(excelData[k].unitCost)) {
        remark += "unitCost should only contain numbers, ";
      }
      if (excelData[k].quantity == "-") {
        remark += "quantity not found, ";
      } else if (!numberPattern.test(excelData[k].quantity)) {
        remark += "quantity should only contain numbers, ";
      }
      if (excelData[k].totalCost == "-") {
        remark += " totalCost not found, ";
      } else if (!numberPattern.test(excelData[k].totalCost)) {
        remark += "totalCost should only contain numbers, ";
      }
      if (excelData[k].LHWRF == "-") {
        remark += " LHWRF not found, ";
      } else if (!numberPattern.test(excelData[k].LHWRF)) {
        remark += "LHWRF should only contain numbers, ";
      }
      if (excelData[k].externalGrant == "-") {
        remark += " grant not found, ";
      } else if (!numberPattern.test(excelData[k].externalGrant)) {
        remark += "externalGrant should only contain numbers, ";
      }
      if (excelData[k].CC == "-") {
        remark += " CC not found, ";
      } else if (!numberPattern.test(excelData[k].CC)) {
        remark += "CC should only contain numbers, ";
      }
      if (excelData[k].convergence == "-") {
        remark += " convergence not found, ";
      } else if (!numberPattern.test(excelData[k].convergence)) {
        remark += "convergence should only contain numbers, ";
      }
      if (excelData[k].noOfHouseholds == "-") {
        remark += "noOfHouseholds not found, ";
      } else if (!numberPattern.test(excelData[k].noOfHouseholds)) {
        remark += "noOfHouseholds should only contain numbers, ";
      }
      if (excelData[k].noOfBeneficiaries == "-") {
        remark += "noOfBeneficiaries not found, ";
      } else if (!numberPattern.test(excelData[k].noOfBeneficiaries)) {
        remark += "noOfBeneficiaries should only contain numbers, ";
      }
      if (excelData[k].activityStatus == "-") {
        remark += "activityStatus not found, ";
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

      var approvalNo = excelData[k].approvalNo.trim();
      var utilizedLHWRF = 0; // The LHWRF value from the Excel sheet

      excelData.forEach((row) => {
        if (row.approvalNo === approvalNo) {
          utilizedLHWRF += parseInt(row.LHWRF);
        }
      });

      const approval = await Approval.findOne({ approvalNo });

      if (!approval) {
        remark += "Approval No. not found in Approval Data.";
      } else {
        // Aggregate the total LHWRF utilized so far for the approvalNo from the Utilization collection
        const totalUtilized = await Utilization.aggregate([
          { $match: { approvalNo } },
          {
            $group: { _id: null, totalLHWRF: { $sum: "$sourceofFund.LHWRF" } },
          }, // Sum the LHWRF field
        ]);

        // Get the current total utilized amount or set it to 0 if no utilization exists
        const totalUtilizedAmount =
          totalUtilized.length > 0 ? totalUtilized[0].totalLHWRF : 0;

        // Compare the total utilized + new utilized amount against the approved amount
        if (
          parseInt(totalUtilizedAmount) + parseInt(utilizedLHWRF) >
          parseInt(approval.sourceofFund.LHWRF)
        ) {
          remark +=
            "Total Utilized LHWRF amount exceeds the approved LHWRF amount.";
        }
      }

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
        .trim()}_${excelData[k].voucherDate}}`;

      if (uniqueCombinations.has(combinationKey)) {
        remark = "Duplicate Utilization Details found in the file.";
      } else {
        // Add the combination to the set if not a duplicate
        uniqueCombinations.add(combinationKey);
      }

      // console.log("remark", remark);

      if (remark == "") {
        var centerDetails = await getCenterDetails(
          excelData[k]?.centerName.trim()
        );
        // console.log("centerDetails",centerDetails);
        if (centerDetails) {
          var programAvailability = allPrograms.filter((item) => {
            if (
              item.fieldValue.toLowerCase().trim() ===
              excelData[k].program.toLowerCase().trim()
            ) {
              return item;
            }
          });
          // console.log("programAvailability",programAvailability)
          var projectAvailability = allProjects.filter((item) => {
            if (
              item.fieldValue.toLowerCase().trim() ===
              excelData[k].project.toLowerCase().trim()
            ) {
              return item;
            }
          });
          // console.log("projectAvailability",projectAvailability)
          var activityAvailability = allActivities.filter((item) => {
            if (
              item.fieldValue.toLowerCase().trim() ===
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
            // var allUtilizations= await getAllUtilizations(req.body.reqdata? req.body.reqdata:{});
            var allUtilizations = await getAllUtilizations(query); // pass center_id to get less data
            var UtilizationExists = await allUtilizations.filter((item) => {
              // console.log("moment(item.voucherDate).format(YYYY-MM-DD)",moment(item.voucherDate).format("YYYY-MM-DD"));
              // console.log("moment(excelData[k].voucherDate).format(YYYY-MM-DD)",moment(excelData[k].voucherDate).format("YYYY-MM-DD"));
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
                moment(item.voucherDate).format("YYYY-MM-DD") ===
                  moment(
                    new Date(
                      Math.round(
                        (excelData[k].voucherDate - 25569) * 86400 * 1000
                      )
                    )
                  ).format("YYYY-MM-DD")
                // item.voucherNumber === excelData[k].voucherNumber.trim()
              ) {
                return item;
              }
            });
            // console.log("in else UtilizationExists", UtilizationExists.length);
            // if (UtilizationExists.length == 0) {
            let center_id = centerDetails._id;
            let totalCost = parseInt(excelData[k].totalCost);

            let approvalAuthourities = await findapprovalAuthourities(
              center_id,
              totalCost
            );
            // console.log("approvalAuthourities => ", approvalAuthourities);

            var voucherDate = moment(
              new Date(
                Math.round((excelData[k].voucherDate - 25569) * 86400 * 1000)
              )
            ).format("YYYY-MM-DD");

            const voucherNoToBeSubmitted = voucherNosMap[k];

            validObjects = excelData[k];
            validObjects.approvalAuthourities = approvalAuthourities
              ? approvalAuthourities
              : [];
            validObjects.sourceofFund = {
              LHWRF: parseInt(excelData[k].LHWRF),
              grant: parseInt(excelData[k].externalGrant),
              CC: parseInt(excelData[k].CC),
            };
            validObjects.unit = unit;
            validObjects.centerName = centerDetails?.centerName;
            validObjects.center_id = centerDetails?._id;
            validObjects.program_id = program_id;
            validObjects.project_id = project_id;
            validObjects.activityName_id = activityName_id;
            validObjects.subactivityName_id = subactivityName_id;
            validObjects.approvalDate = approvalDate;
            validObjects.voucherDate = voucherDate;
            validObjects.program = program;
            validObjects.project = project;
            validObjects.activityName = activityName;
            validObjects.subactivityName = subactivityName;
            validObjects.voucherNumber = voucherNoToBeSubmitted;

            validObjects.fileName = req.body?.fileName;
            validObjects.createdBy = req.body?.createdBy;
            validObjects.createdAt = new Date();
            // console.log(
            //   "validObjects.voucherNumber",
            //   validObjects.voucherNumber
            // );
            validData.push(validObjects);

            // console.log("remark 1", remark);
            // } else {
            //   remark = "Utilization details already exists.";
            //   invalidObjects = { ...excelData[k], failedRemark: remark };
            //   invalidData.push(invalidObjects);
            //   console.log(
            //     "invalidObjects Utilization details already exists",
            //     invalidObjects.failedRemark
            //   );
            // }
          } else {
            invalidObjects = { ...excelData[k], failedRemark: remark };
            invalidData.push(invalidObjects);
            // console.log(
            //   "invalidObjects subactivitiesAvailability",
            //   invalidObjects.failedRemark
            // );
          }
        } else {
          remark = " Center is not available in master";
          invalidObjects = { ...excelData[k], failedRemark: remark };
          invalidData.push(invalidObjects);
        }
      } else {
        invalidObjects = { ...excelData[k], failedRemark: remark };
        invalidData.push(invalidObjects);
      }
      remark = "";
    }
    // console.log("validData", validData.length);
    // console.log("remark 1", remark);
    // Utilization.insertMany(validData).catch((err) => {
    //   console.log(err);
    // });
    if (validData.length > 0) {
      Utilization.insertMany(validData)
        .then(async(data) => {
          for (let i = 0; i < validData.length; i++) {
            const element = validData[i];
            if(element.activityStatus==="Completed"){
              const UpdateUtilizationStatus = await Approval.updateOne(
                        { approvalNo : element.approvalNo },
                        { $set: {utilizationStatus: "Completed"} } )
              console.log("UpdateUtilizationStatus",UpdateUtilizationStatus)
            }else{
              const UpdateUtilizationStatus_P = await Approval.updateOne(
                { approvalNo : element.approvalNo },
                { $set: {utilizationStatus: "Pending"} } )
            } 
          }
          // console.log("insertMany data",data);
        })
        .catch((err) => {
          console.log("insertMany err", err);
        });
    }
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
    // console.log("centerName", centerName);
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

var getAllUtilizations = async (query) => {
  return new Promise(function (resolve, reject) {
    Utilization.find(query)
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

exports.filedetails = (req, res, next) => {
  var finaldata = {};
  // console.log(req.params.fileName)
  // Utilization.find({center_id:req.params.center_id,fileName:req.params.fileName})
  Utilization.find({ fileName: req.params.fileName })
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

exports.update_utilization = async (req, res, next) => {
  try {
    const { ID, center_id, totalCost, user_id } = req.body;

    // Fetch the existing utilization data
    let utilizationData = await Utilization.findOne({ _id: ID });
    if (!utilizationData) {
      return res
        .status(404)
        .json({ success: false, message: "Utilization not found" });
    }

    let approvalAuthourities = [];

    // Ensure findapprovalAuthourities resolves before proceeding
    if (
      center_id !== utilizationData.center_id ||
      totalCost !== utilizationData.totalCost
    ) {
      approvalAuthourities = await findapprovalAuthourities(
        center_id,
        totalCost
      ); // <-- Await here

      // console.log("totalCost", totalCost);
      // console.log("approvalData.totalCost", utilizationData.totalCost);
      // console.log("Center_id", center_id);
      // console.log("Center_id", utilizationData.center_id);
      // console.log("ApprovalData", utilizationData);
      // console.log("approval Authorities", approvalAuthourities);
    }

    const updateData = {
      center_id: req.body.center_id,
      centerName: req.body.centerName,
      approvalDate: req.body.approvalDate,
      approvalNo: req.body.approvalNo,
      voucherDate: req.body.voucherDate,
      voucherNumber: req.body.voucherNumber,
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
      totalCost: req.body.totalCost,
      sourceofFund: {
        LHWRF: req.body.LHWRF,
        grant: req.body.grant,
        CC: req.body.CC,
      },
      convergence: req.body.convergence,
      noOfHouseholds: req.body.noOfHouseholds,
      noOfBeneficiaries: req.body.noOfBeneficiaries,
      activityStatus: req.body.activityStatus,
      convergenceAgencyName: req.body.convergenceAgencyName,
      convergenceDocumentName: req.body.convergenceDocumentName,
      convergenceNote: req.body.convergenceNote,
      fileName: req.body.fileName,
      voucherDocumentUrl: req.body.voucherDocumentUrl,
      voucherDocumentName: req.body.voucherDocumentName,
      convergenceDocumentUrl: req.body.convergenceDocumentUrl,
      S3ConvergenceDocumentName: req.body.S3ConvergenceDocumentName,
      approvalAuthourities,
    };

    const updateResult = await Utilization.updateOne(
      { _id: ID },
      { $set: updateData }
    );

    if (updateResult.modifiedCount > 0) {
      if(req.body.activityStatus==="Completed"){
        const UpdateUtilizationStatus = await Approval.updateOne(
                  { approvalNo : req.body.approvalNo },
                  { $set: {utilizationStatus: "Completed"} } )
        // console.log("UpdateUtilizationStatus",UpdateUtilizationStatus)
      }else{
        const UpdateUtilizationStatus_P = await Approval.updateOne(
          { approvalNo : req.body.approvalNo },
          { $set: {utilizationStatus: "Pending"} } )
      }
      await Utilization.updateOne(
        { _id: ID },
        { $push: { updateLog: { updatedAt: new Date(), updatedBy: user_id } } }
      );
      return res.status(200).json({
        success: true,
        message: "Utilization Details updated Successfully.",
        data: updateResult,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Utilization Details not modified" });
  } catch (error) {
    console.error("Error updating utilization:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.check_utilization_lhwrf_against_approval = async (req, res, next) => {
  try {
    const { approvalNo, LHWRF } = req.body;

    // Find the corresponding approval record
    const approval = await Approval.findOne({ approvalNo });
    if (!approval) {
      return res.status(400).json({ error: "Approval record not found" });
    }

    // Find the total amount already utilized for this approval
    const totalUtilized = await Utilization.aggregate([
      { $match: { approvalNo } },
      { $group: { _id: null, total: { $sum: "$LHWRF" } } },
    ]);

    const totalUtilizedAmount =
      totalUtilized.length > 0 ? totalUtilized[0].total : 0;

    // Check if adding the new utilization amount exceeds the approved amount
    if (totalUtilizedAmount + LHWRF > approval.LHWRF) {
      return res.status(400).json({
        error: "Total utilized LHWRF amount exceeds the approved LHWRF amount.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
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
exports.list_utilizationdetails_with_filters2 = async (req, res) => {
  try {
    const {
      pageNumber,
      recsPerPage,
      fromDate,
      toDate,
      center_ID,
      program_id,
      project_id,
      activityName_id,
      subactivityName_id,
      statusWithLevel,
      searchText,
    } = req.body;

    const matchStage = {};

    let pageNum = pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    if (fromDate !== "all" && toDate !== "all") {
      matchStage.voucherDate = { $gte: new Date(fromDate), $lte: new Date(toDate) };
      matchStage.approvalDate = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    }
    if (center_ID !== "all") matchStage.center_id = center_ID;
    if (program_id !== "all") matchStage.program_id = program_id;
    if (project_id !== "all") matchStage.project_id = project_id;
    if (activityName_id !== "all") matchStage.activityName_id = activityName_id;
    if (subactivityName_id !== "all") matchStage.subactivityName_id = subactivityName_id;

    if (searchText && searchText !== "-") {
      const regex = new RegExp(searchText, "i");
      matchStage.$or = [
        { centerName: regex },
        { year: regex },
        { quarter: regex },
        { program: regex },
        { project: regex },
        { activityName: regex },
        { subactivityName: regex },
        { unit: regex },
        { fileName: regex },
      ];
    }
    
  let paginatedDataStages = [];

  // Apply pagination only if removePagination is false
  if (!req.body.removePagination) {
    paginatedDataStages.push(
      { $skip: parseInt(skipRec) },
      { $limit: parseInt(recsPerPage) }
    );
  }
    // Determine filter for current pending level
    let pendingLevelToMatch = null;
    if (statusWithLevel?.startsWith("pending")) {
      const split = statusWithLevel.split("_");
      pendingLevelToMatch = split[1]; // Example: "Level-3"
    }

    const pipeline = [
      { $match: matchStage },

      // 1. Compute currentPendingLevel via aggregation logic
      {
        $addFields: {
          currentPendingLevel: {
            $let: {
              vars: {
                auths: "$approvalAuthourities",
                approvedIndexes: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$approvalAuthourities",
                        as: "a",
                        cond: { $eq: ["$$a.status", "approved"] },
                      },
                    },
                    as: "app",
                    in: { $indexOfArray: ["$approvalAuthourities", "$$app"] },
                  },
                },
              },
              in: {
                $let: {
                  vars: {
                    lastApprovedIndex: { $max: "$$approvedIndexes" },
                  },
                  in: {
                    $let: {
                      vars: {
                        nextPending: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: {
                                  $slice: [
                                    "$$auths",
                                    { $add: ["$$lastApprovedIndex", 1] },
                                    { $size: "$$auths" },
                                  ],
                                },
                                as: "auth",
                                cond: { $eq: ["$$auth.status", "pending"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: { $ifNull: ["$$nextPending.approvalLevel", null] },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // 2. Filter based on selected pendingLevel
      ...(pendingLevelToMatch
        ? [{ $match: { currentPendingLevel: pendingLevelToMatch } }]
        : []),

      // 3. Count total for pagination + totals
      {
        $facet: {
          paginatedResults: [
            { $sort: { createdAt: -1 } },
            { $skip: (pageNumber - 1) * recsPerPage },
            { $limit: recsPerPage },
          ],
          totalCounts: [{ $count: "total" }],
          totalsGroup: [
            {
              $group: {
                _id: null,
                totalCost: { $sum: "$totalCost" },
                LHWRF: { $sum: "$sourceofFund.LHWRF" },
                grant: { $sum: "$sourceofFund.grant" },
                CC: { $sum: "$sourceofFund.CC" },
                convergence: { $sum: "$convergence" },
                noOfHouseholds: { $sum: "$noOfHouseholds" },
                noOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
              },
            },
          ],
        },
      },

      // 4. Unwind results
      { $unwind: "$totalCounts" },
      { $unwind: "$totalsGroup" },
    ];

    const response = await Utilization.aggregate(pipeline);
    console.log("Aggregation response:", response);
    const [
      { paginatedResults, totalCounts, totalsGroup },
    ] = response;

    // Format data with pending-level string
    const tableData = paginatedResults.map((item) => {
      const finalStatus = item.finalStatus || "pending";
      const pendingLevel = finalStatus === "pending" && item.currentPendingLevel;
      return {
        _id: item._id,
        /* other fields ... */
        finalStatus:
          finalStatus === "pending" && pendingLevel
            ? `pending (${pendingLevel})`
            : finalStatus,
        // format dates, etc.
      };
    });

    // Add totals row
    if (tableData.length) {
      tableData.push({
        _id: 0,
        centerName: "Total",
        totalCost: totalsGroup.totalCost || 0,
        LHWRF: totalsGroup.LHWRF || 0,
        grant: totalsGroup.grant || 0,
        CC: totalsGroup.CC || 0,
        convergence: totalsGroup.convergence || 0,
        noOfHouseholds: totalsGroup.noOfHouseholds || 0,
        noOfBeneficiaries: totalsGroup.noOfBeneficiaries || 0,
        finalStatus: "-",
        paymentStatus: "-",
        /* fill other columns with "-" */
      });
    }

    return res.json({
      totalRecs: totalCounts.total || 0,
      tableData,
      success: true,
    });
  } catch (err) {
    console.error("Aggregation error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
exports.list_utilizationdetails_with_filtersNew = async (req, res, next) => {
  try {
    const recsPerPage = req.body.recsPerPage || 10;
    const pageNum = req.body.pageNumber || 1;
    const skipRec = recsPerPage * (pageNum - 1);

    let query = {};

    // Date filter: Only apply voucherDate or approvalDate (not both)
    if (req.body.dateFilterType === "voucherDate") {
      if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
        query.voucherDate = {
          $gte: req.body.fromDate,
          $lte: req.body.toDate,
        };
      }
    } else if (req.body.dateFilterType === "approvalDate") {
      if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
        query.approvalDate = {
          $gte: req.body.fromDate,
          $lte: req.body.toDate,
        };
      }
    }

    // Other filters
    if (req.body.center_ID !== "all") query.center_id = req.body.center_ID;
    if (req.body.program_id !== "all") query.program_id = req.body.program_id;
    if (req.body.project_id !== "all") query.project_id = req.body.project_id;
    if (req.body.activityName_id !== "all")
      query.activityName_id = req.body.activityName_id;
    if (req.body.subactivityName_id !== "all")
      query.subactivityName_id = req.body.subactivityName_id;

    // Text Search
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

    // Count total records for pagination
    const totalRecs = await Utilization.countDocuments(query);

    // Fetch data with pagination
    let utilizationQuery = Utilization.find(query);
    if (!req.body.removePagination) {
      utilizationQuery = utilizationQuery.skip(skipRec).limit(recsPerPage);
    }

    const data = await utilizationQuery.sort({ createdAt: -1 });

    // Post-process results
    const utilizationData = data.map((item) => {
      const finalStatus = item.finalStatus || "pending";

      const getFirstPendingAfterApproved = (approvals) => {
        if (!approvals || !approvals.length) return null;
        const approvedSet = new Set();
        for (let auth of approvals) {
          if (auth.status === "Approved") {
            approvedSet.add(auth.approvalLevel);
          } else if (auth.status === "Pending") {
            if (!approvedSet.has(auth.approvalLevel)) return auth;
          }
        }
        return approvals.find((auth) => auth.status === "Pending") || null;
      };

      const pendingLevel =
        finalStatus === "pending"
          ? getFirstPendingAfterApproved(item.approvalAuthourities)
          : "";

      return {
        _id: item._id,
        center_id: item.center_id || "--NA--",
        centerName: item.centerName || "--NA--",
        approvalDate: item.approvalDate
          ? moment(item.approvalDate).format("DD-MM-YYYY")
          : "--NA--",
        voucherDate: item.voucherDate
          ? moment(item.voucherDate).format("DD-MM-YYYY")
          : "--NA--",
        approvalNo: item.approvalNo || "--NA--",
        voucherNumber: item.voucherNumber || "--NA--",
        program: item.program || "--NA--",
        project: item.project || "--NA--",
        activityName: item.activityName || "--NA--",
        subactivityName: item.subactivityName || "--NA--",
        unit: item.unit || "--NA--",
        unitCost: item.unitCost || 0,
        quantity: item.quantity || 0,
        totalCost: item.totalCost || 0,
        LHWRF: item.sourceofFund.LHWRF || 0,
        grant: item.sourceofFund.grant || 0,
        CC: item.sourceofFund.CC || 0,
        convergence: item.convergence || 0,
        convergenceAgencyName:
          item.convergence > 0 && item.convergenceAgencyName
            ? item.convergenceAgencyName
            : "--NA--",
        convergenceDocumentName:
          item.convergence > 0 && item.convergenceDocumentName
            ? item.convergenceDocumentName
            : "--NA--",
        noOfHouseholds: item.noOfHouseholds || 0,
        noOfBeneficiaries: item.noOfBeneficiaries || 0,
        finalStatus:
          finalStatus === "pending"
            ? finalStatus +
              (pendingLevel?.approvalLevel
                ? " (" + pendingLevel.approvalLevel + ")"
                : "")
            : finalStatus,
        paymentStatus: item.paymentDetails?.paymentStatus || "pending",
        paymentDate: item.paymentDetails?.paymentDate
          ? moment(item.paymentDetails.paymentDate).format("DD-MM-YYYY")
          : "--NA--",
        UTRNumber: item.paymentDetails?.UTRNumber || "--NA--",
        convergenceNote: item.convergenceNote || "--NA--",
        activityStatus: item.activityStatus || "--NA--",
      };
    });

    // Add Total Summary Row
    if (utilizationData.length > 0) {
      const totals = utilizationData.reduce(
        (acc, item) => {
          acc.totalCost += item.totalCost;
          acc.LHWRF += item.LHWRF;
          acc.grant += item.grant;
          acc.CC += item.CC;
          acc.convergence += item.convergence;
          acc.noOfHouseholds += item.noOfHouseholds;
          acc.noOfBeneficiaries += item.noOfBeneficiaries;
          return acc;
        },
        {
          totalCost: 0,
          LHWRF: 0,
          grant: 0,
          CC: 0,
          convergence: 0,
          noOfHouseholds: 0,
          noOfBeneficiaries: 0,
        }
      );

      utilizationData.push({
        _id: 0,
        centerName: "Total",
        totalCost: totals.totalCost,
        LHWRF: totals.LHWRF,
        grant: totals.grant,
        CC: totals.CC,
        convergence: totals.convergence,
        noOfHouseholds: totals.noOfHouseholds,
        noOfBeneficiaries: totals.noOfBeneficiaries,
        finalStatus: "-",
        paymentStatus: "-",
        activityStatus: "-",
        // all other fields as "-"/"0" if needed
      });
    }

    res.status(200).json({
      totalRecs: totalRecs,
      tableData: utilizationData,
      success: true,
    });
  } catch (error) {
    console.error("Error in list_utilizationdetails_with_filters1:", error);
    res.status(500).json({ errorMsg: error.message, success: false });
  }
};

exports.list_utilizationdetails_with_filters = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  var query = {};

  // if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
  //   query.approvalDate = {
  //     $gte: req.body.fromDate,
  //     $lte: req.body.toDate,
  //   };
  // }
  if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
    query.voucherDate = {
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
      { fileName: searchRegex },
      { activityStatus: searchRegex },
      { approvalNo: searchRegex },
      { voucherNumber: searchRegex },
      { finalStatus: searchRegex },
    ];
  }
  // console.log("query", JSON.stringify(query, null, 2));

  // Utilization.estimatedDocumentCount(query)
  Utilization.countDocuments(query)
    .then((totalRecs) => {
      // console.log("query => ", query);

      let utilizationQuery = Utilization.find(query);
      if (!req.body.removePagination) {
        utilizationQuery = utilizationQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }
      utilizationQuery
        .sort({ createdAt: -1 })
        .then((data) => {
          var utilizationData = data.map((item, index) => {
            const finalStatus = item.finalStatus ? item.finalStatus : "pending";
            const pendingLevel =
              finalStatus === "pending"
                ? getFirstPendingAfterApproved(item.approvalAuthourities)
                : "";

            return {
              _id: item._id,
              activityStatus: item.activityStatus
                ? item.activityStatus
                : "--NA--",
              finalStatus:
                finalStatus === "pending"
                  ? finalStatus +
                    (pendingLevel?.approvalLevel
                      ? " (" + pendingLevel?.approvalLevel + ")"
                      : "")
                  : finalStatus,
              // finalStatus: item.finalStatus ? item.finalStatus : "pending",
              paymentStatus: item.paymentDetails.paymentStatus
                ? item.paymentDetails.paymentStatus
                : "pending",
              center_id: item.center_id ? item.center_id : "--NA--",
              centerName: item.centerName ? item.centerName : "--NA--",
              approvalDate: item.approvalDate
                ? moment(item.approvalDate).format("DD-MM-YYYY")
                : "--NA--",
              approvalNo: item.approvalNo ? item.approvalNo : "--NA--",
              voucherDate: item.voucherDate
                ? moment(item.voucherDate).format("DD-MM-YYYY")
                : "--NA--",
              voucherNumber: item.voucherNumber ? item.voucherNumber : "--NA--",
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
              totalCost: item.totalCost ? item.totalCost : 0,
              LHWRF: item.sourceofFund.LHWRF ? item.sourceofFund.LHWRF : 0,
              grant: item.sourceofFund.grant ? item.sourceofFund.grant : 0,
              CC: item.sourceofFund.CC ? item.sourceofFund.CC : 0,
              convergence: item.convergence ? item.convergence : 0,
              convergenceAgencyName:
                item.convergence > 0 && item.convergenceAgencyName
                  ? item.convergenceAgencyName
                  : "--NA--",
              convergenceDocumentName:
                item.convergence > 0 && item.convergenceDocumentName
                  ? item.convergenceDocumentName
                  : "--NA--",
              noOfHouseholds: item.noOfHouseholds ? item.noOfHouseholds : 0,
              noOfBeneficiaries: item.noOfBeneficiaries
                ? item.noOfBeneficiaries
                : 0,

              UTRNumber: item.paymentDetails.UTRNumber
                ? item.paymentDetails.UTRNumber
                : "--NA--",
              paymentDate: item.paymentDetails.paymentDate
                ? moment(item.paymentDetails.paymentDate).format("DD-MM-YYYY")
                : "--NA--",
              convergenceNote: item.convergenceNote
                ? item.convergenceNote
                : "--NA--",
            };
          });
          var totalCost = 0;
          var LHWRF = 0;
          var grant = 0;
          var CC = 0;
          var convergence = 0;
          var noOfHouseholds = 0;
          var noOfBeneficiaries = 0;
          for (var index = 0; index < utilizationData.length; index++) {
            totalCost += utilizationData[index].totalCost
              ? utilizationData[index].totalCost
              : 0;
            LHWRF += utilizationData[index].LHWRF
              ? utilizationData[index].LHWRF
              : 0;
            grant += utilizationData[index].grant
              ? utilizationData[index].grant
              : 0;
            CC += utilizationData[index].CC ? utilizationData[index].CC : 0;
            convergence += utilizationData[index].convergence
              ? utilizationData[index].convergence
              : 0;
            noOfHouseholds += utilizationData[index].noOfHouseholds
              ? utilizationData[index].noOfHouseholds
              : 0;
            noOfBeneficiaries += utilizationData[index].noOfBeneficiaries
              ? utilizationData[index].noOfBeneficiaries
              : 0;
          }

          if (index >= utilizationData.length && utilizationData.length > 0) {
            utilizationData.push({
              _id: 0,
              activityStatus: "-",
              finalStatus: "-",
              paymentStatus: "-",
              center_id: "-",
              centerName: "Total",
              approvalDate: "-",
              approvalNo: "-",
              voucherDate: "-",
              voucherNumber: "-",
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
              totalCost: totalCost,
              LHWRF: LHWRF,
              grant: grant,
              CC: CC,
              convergence: convergence,
              convergenceAgencyName: "-",
              convergenceDocumentName: "-",
              noOfHouseholds: noOfHouseholds,
              noOfBeneficiaries: noOfBeneficiaries,

              UTRNumber: "-",
              paymentDate: "-",
              convergenceNote: "-",
            });
          }
          res.status(200).json({
            totalRecs: totalRecs,
            tableData: utilizationData,
            success: true,
          });
        })
        .catch((error) => {
          console.log("Error in UtilizationList  => ", error);
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

exports.update_payment_status = (req, res, next) => {
  // console.log("update_utilization_approval_status req.body => ", req.body);
  Utilization.updateOne(
    {
      _id: req.body.ID,
      finalStatus: "approved",
    },
    {
      $set: {
        "paymentDetails.UTRNumber": req.body.UTRNumber,
        "paymentDetails.paymentDate": req.body.paymentDate,
        "paymentDetails.paymentStatus": "payment-released",
        "paymentDetails.updatedByName": req.body.updatedByName,
        "paymentDetails.updatedByRole": req.body.updatedByRole,
        "paymentDetails.updatedAt": new Date(),
        "paymentDetails.updatedBy": req.body.user_id,
      },
    }
  )
    .then(async (utilizationRecord) => {
      if (utilizationRecord.modifiedCount == 1) {
        // console.log("utilizationRecord", utilizationRecord);
        res.status(200).json({
          success: true,
          data: utilizationRecord,
        });
      } else {
        res.status(200).json({
          message: "Utilization Amount is yet to be Approved",
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

// exports.get_account_person = (req, res, next) => {
//   // if (
//   //   !mongoose.Types.ObjectId.isValid(req.body.user_id) ||
//   //   !mongoose.Types.ObjectId.isValid(req.body.center_id)
//   // ) {
//   //   return res
//   //     .status(400)
//   //     .json({ success: false, message: "Invalid user_id or center_id" });
//   // }

//   let selector = {
//     _id: mongoose.Types.ObjectId(req.body.center_id),
//     "accountPersonDetails.user_id": mongoose.Types.ObjectId(req.body.user_id),
//   };

//   console.log("selector for account person", selector);
//   CenterDetails.findOne(selector)
//     .then((data) => {
//       let financeAuth = {};
//       console.log("data of account person", data);
//       if (data && data.accountPersonDetails) {
//         financeAuth = {
//           financeAuthName: data.accountPersonDetails.Name || "",
//           financeAuthEmail: data.accountPersonDetails.email || "",
//           financeAuthMobile: data.accountPersonDetails.mobileNumber || "",
//         };
//         console.log("financeAuth", financeAuth);
//         res.status(200).json({ financeAuth: financeAuth, success: true });
//       } else {
//         return res
//           .status(404)
//           .json({ success: false, message: "Account person not found" });
//       }
//     })
//     .catch((error) => {
//       console.log("Error while assigning account person", error);
//       res.status(500).json({ success: false, message: error.message });
//     });
// };

exports.get_account_person = async (req, res) => {
  try {
    if (
      // !mongoose.Types.ObjectId.isValid(req.body.user_id) ||
      !mongoose.Types.ObjectId.isValid(req.body.center_id)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user_id or center_id" });
    }

    const center = await CenterDetails.find({
      _id: new mongoose.Types.ObjectId(req.body.center_id),
    });

    for (let centers of center) {
      // console.log("center", centers);
      // console.log("center", center);
      // console.log("center.accountPersonDetails", centers.accountPersonDetails);
      if (
        !center ||
        !centers.accountPersonDetails ||
        centers.accountPersonDetails.length === 0
      ) {
        return res
          .status(404)
          .json({ success: false, message: "Account person not found" });
      }
      const { Name, email, mobileNumber } = centers.accountPersonDetails;
      return res.status(200).json({
        success: true,
        financeAuth: {
          financeAuthName: Name,
          financeAuthEmail: email,
          financeAuthMobile: mobileNumber,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching account person", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.update_utilization_approval_status = (req, res, next) => {
  // console.log("update_utilization_approval_status req.body => ", req.body);
  Utilization.findOneAndUpdate(
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
          var event = "Utilization Management - Utilization Approval Status Approved";
          var approvalAction = "approved";
        } else if (req.body.status == "rejected") {
          var event = "Utilization Management - Utilization Approval Status Rejected";
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
            voucherNumber: approvalRecord.voucherNumber,
            program: approvalRecord.program,
            project: approvalRecord.project,
            activity: approvalRecord.activityName,
            subactivity: approvalRecord.subactivityName,
            here: `/${updatedStatusOfAuthourity.approvalAuthRole}/approval-management/approval-details/${approvalRecord._id}`,
            nextAuthorityName: `${nextAuthourity?.approvalAuthName} - ${nextAuthourity?.approvalAuthRole}`,
            rejectionRemark: updatedStatusOfAuthourity.remark ? updatedStatusOfAuthourity.remark : "-",
          },
        };
        var send_notification_to_updatedStatusOfAuthourity =
          await sendNotification(notificationData_updatedStatusOfAuthourity);
        console.log("send_notification_to_updatedStatusOfAuthourity",send_notification_to_updatedStatusOfAuthourity);
        const approvalCreatorDetails = await Users.findOne(
          { _id: approvalRecord.createdBy },
          { service: 0 }
        );
        // console.log("approvalCreatorDetails", approvalCreatorDetails);

        // applicantsToNotify.push(approvalCreatorDetails);

        const isLastAuthority = index === approvalAuthArr.length - 1;

        if (
          approvalCreatorDetails &&
          ((finalStatus === "approved" && isLastAuthority) ||
            req.body.status === "rejected")
        ) {
          // for (applicant of applicantsToNotify) {
          var notificationData_user = {
            event: "Utilization Management - Inform Applicant - Utilization Approval Action",
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
              voucherNumber: approvalRecord.voucherNumber,
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
        if (
          req.body.status == "approved" &&
          nextAuthourity?.approvalAuthEmail
        ) {

          var notificationData_nextAuthourity = {
            event: "Utilization Management - Inform Authourity for Utilization Approval",
            toEmail: nextAuthourity.approvalAuthEmail,
            toMobileNumber: "+91" + nextAuthourity.approvalAuthMobile,
            toUserRole: nextAuthourity.approvalAuthRole,
            variables: {
              approverName: updatedStatusOfAuthourity.approvalAuthName,
              approverRole: updatedStatusOfAuthourity.approvalAuthRole,
              centerName: centerName,
              centerInchargeName: approvalAuthArr[0].approvalAuthName,
              centerInchargeRole: approvalAuthArr[0].approvalAuthRole,
              approverLevel: updatedStatusOfAuthourity.approvalLevel,
              nextAuthourityName: nextAuthourity.approvalAuthName,
              nextAuthourityRole: nextAuthourity.approvalAuthRole,
              nextAuthourityLevel: nextAuthourity.approvalLevel,
              costTobeApproved: approvalRecord.totalCost,
              approvalNo: approvalRecord.approvalNo,
              voucherNumber: approvalRecord.voucherNumber,    
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
        
        if (finalStatus === "approved") {
          var notificationData_Applicant_All_Approved = {
            event: "Utilization Management - Inform Applicant - Utilization All Level Approved",
            toEmail: approvalCreatorDetails.profile.email,
            toMobileNumber: approvalCreatorDetails.profile.mobile,
            toUserRole: approvalCreatorDetails.roles,
            toUser_id: approvalCreatorDetails._id,
            applicantDetails: approvalCreatorDetails,
            variables: {                  
              userName:approvalCreatorDetails.profile.firstname +
                " " +
                approvalCreatorDetails.profile.lastname,
              email: approvalCreatorDetails.profile.email,
              mobile: approvalCreatorDetails.profile.mobile,
              role: approvalCreatorDetails.roles[0],
              centerName: approvalRecord.centerName,
              approvalNo: approvalRecord.approvalNo,
              voucherNumber: approvalRecord.voucherNumber,
              costTobeApproved: approvalRecord.totalCost,
              program: approvalRecord.program,
              project: approvalRecord.project,
              activity: approvalRecord.activityName,
              subactivity: approvalRecord.subactivityName,
            },
          };          
          var send_notification_to_Applicant_All_Approved = await sendNotification(
            notificationData_Applicant_All_Approved
          );
          console.log("send_notification_to_Applicant_All_Approved",send_notification_to_Applicant_All_Approved)
          let approvalAuthorityNames = [];
          approvalAuthArr.map((authority) => {
            approvalAuthorityNames.push(
              `${authority.approvalAuthName} - ${authority.approvalAuthRole}`
            );
          });
          for (authority of approvalAuthArr) {
            var notificationData_allAuthouritiesApproved = {
              event: "Utilization Management - Inform Authourities - Utilization All Level Approved",
              toEmail: authority.approvalAuthEmail,
              toMobileNumber: "+91" + authority.approvalAuthMobile,
              toUserRole: authority.approvalAuthRole,
              variables: {
                recipient: authority.approvalAuthName,
                authorityNames: approvalAuthorityNames.join(", "),
                approverRole: authority.approvalAuthRole,
                centerName: centerName,
                costTobeApproved: approvalRecord.totalCost,
                approvalNo: approvalRecord.approvalNo,
                voucherNumber: approvalRecord.voucherNumber,
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
              notificationData_allAuthouritiesApproved
            );
          }
          // console.log("approvalRecord?.center_id", approvalRecord?.center_id);
          var accountPersonDetails = await CenterDetails.findOne(
            { _id: approvalRecord?.center_id },
            { services: 0 }
          );
          var financeManagerDetails = await Users.findOne(
            { roles: { $in: ["ho-person"] } }, // Wrap in an array
            { services: 0 }
          );
          // console.log("financeManagerDetails", financeManagerDetails);
          // console.log("accountPersonDetails", accountPersonDetails);

          var notificationData_account_person = {
            event: "Utilization Management - Inform Account Person - Utilization All Level Approved",
            toEmail: accountPersonDetails.accountPersonDetails.email,
            toMobileNumber:
              "+91" + accountPersonDetails.accountPersonDetails.mobileNumber,
            toUserRole: "account-person",
            variables: {
              recipient: accountPersonDetails.accountPersonDetails.Name,
              authorityNames: approvalAuthorityNames.join(", "),
              approverRole: "account-person",
              centerName: centerName,
              approvedCost: approvalRecord.totalCost,
              approvalNo: approvalRecord.approvalNo,
              voucherNumber: approvalRecord.voucherNumber,
              program: approvalRecord.program,
              project: approvalRecord.project,
              activity: approvalRecord.activityName,
              subactivity: approvalRecord.subactivityName,
            },
          };
          var send_notification_to_account_person_allAuthourities =
            await sendNotification(notificationData_account_person);
          var notificationData_finance_manager = {
            event: "Utilization Management - Inform Finance Manager - Utilization All Level Approved",
            toEmail: financeManagerDetails.profile.email,
            toMobileNumber: "+91" + financeManagerDetails.profile.mobile,
            toUserRole: "ho-person",
            variables: {
              recipient:
                financeManagerDetails.profile.firstname +
                " " +
                financeManagerDetails.profile.lastname,
              authorityNames: approvalAuthorityNames.join(", "),
              approverRole: "ho-person",
              centerName: centerName,
              approvedCost: approvalRecord.totalCost,
              approvalNo: approvalRecord.approvalNo,
              voucherNumber: approvalRecord.voucherNumber,
              program: approvalRecord.program,
              project: approvalRecord.project,
              activity: approvalRecord.activityName,
              subactivity: approvalRecord.subactivityName,
            },
          };
          var send_notification_to_finance_manager_allAuthourities =
            await sendNotification(notificationData_finance_manager);
          console.log(
            "send_notification_to_finance_manager_allAuthourities",
            notificationData_finance_manager
          );

        } else if (finalStatus === "rejected") {

          var notificationData_Applicant_All_Rejected = {
            event: "Utilization Management - Inform Applicant - Utilization All Level Rejected",
            toEmail: approvalCreatorDetails.profile.email,
            toMobileNumber: approvalCreatorDetails.profile.mobile,
            toUserRole: approvalCreatorDetails.roles,
            toUser_id: approvalCreatorDetails._id,
            applicantDetails: approvalCreatorDetails,
            variables: {                  
              userName:approvalCreatorDetails.profile.firstname +
                " " +
                approvalCreatorDetails.profile.lastname,
              email: approvalCreatorDetails.profile.email,
              mobile: approvalCreatorDetails.profile.mobile,
              role: approvalCreatorDetails.roles[0],
              centerName: approvalRecord.centerName,
              approvalNo: approvalRecord.approvalNo,
              voucherNumber: approvalRecord.voucherNumber,
              costTobeApproved: approvalRecord.totalCost,
              program: approvalRecord.program,
              project: approvalRecord.project,
              activity: approvalRecord.activityName,
              subactivity: approvalRecord.subactivityName,
            },
          };          
          var send_notification_to_Applicant_All_Approved = await sendNotification(
            notificationData_Applicant_All_Rejected
          );
          console.log("send_notification_to_Applicant_All_Approved",send_notification_to_Applicant_All_Approved)
          
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
              event: "Utilization Management - Inform Authourities - Utilization All Level Rejected",
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
                costTobeApproved: approvalRecord.totalCost,
                voucherNumber: approvalRecord.voucherNumber,
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
        Utilization.updateOne(
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
            // console.log("data => ", data);

            if (data.modifiedCount == 1) {
              res.status(200).json({
                data,
                success: true,
                message: "Status of Approval Details updated Successfully.",
              });
            } else {
              // console.log("Status of Approval Details are not modified");

              res.status(200).json({
                success: false,
                message: "Status of Approval Details are not modified",
              });
            }
          })
          .catch((err) => {
            // console.log(err);
            res.status(500).json({
              success: false,
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      // console.log(err);
      res.status(500).json({
        success: false,
        error: err,
      });
    });
};

exports.fetch_utilization = (req, res, next) => {
  Utilization.find({ _id: req.params.ID })
    .exec()
    .then((data) => {
      if (data[0]?.approvalAuthourities?.length === 0) {
        let center_id = data[0]?.center_id;
        let totalCost = data[0]?.totalCost;
        let approvalAuthourities = findapprovalAuthourities(
          center_id,
          totalCost
        );
        Utilization.updateOne(
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
exports.delete_utilization = (req, res, next) => {
  // console.log("req.params.ID ",req.params.ID);
  Utilization.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      // console.log('data ',data);
      // if(data.deletedCount === 1){
      res.status(200).json({
        deleted: true,
        message: "Utilization List deleted Successfully.",
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
