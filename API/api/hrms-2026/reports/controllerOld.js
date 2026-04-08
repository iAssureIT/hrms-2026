const mongoose = require("mongoose");
const Approval = require("../approval-details/model.js");
const AnnualPlan = require("../annual-plan/model.js");
const Utilization = require("../utilization-details/model.js");
const FundReceipt = require("../fund-management/model.js");
const Plantation = require("../plantation/model.js");
const WRD = require("../wrd/model.js");
const ObjectId = require("mongoose").Types.ObjectId;
// const { ObjectId } = require("mongodb");

// exports.approval_vs_utilization_report = (req, res, next) => {
//   let recsPerPage = req.body.recsPerPage;
//   let pageNum = req.body.pageNumber;
//   let skipRec = recsPerPage * (pageNum - 1);
//   var query = "1";
//   var query = {};
//   if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
//     query.approvalDate = {
//       $gte: req.body.fromDate,
//       $lte: req.body.toDate,
//     };
//   }
//   // console.log("req.body", req.body);

//   if (req.body.center_ID !== "all")
//     query.center_id = new ObjectId(req.body.center_ID);

//   if (req.body.program_id !== "all") {
//     query.program_id = new ObjectId(req.body.program_id);
//   }
//   if (req.body.project_id !== "all") {
//     query.project_id = new ObjectId(req.body.project_id);
//   }
//   if (req.body.activityName_id !== "all") {
//     query.activityName_id = new ObjectId(req.body.activityName_id);
//   }
//   if (req.body.subactivityName_id !== "all") {
//     query.subactivityName_id = new ObjectId(req.body.subactivityName_id);
//   }

//   //  search text condition
//   // console.log("req.body.searchText",req.body)
//   // console.log("query",query)
//   if (req.body.searchText !== "-") {
//     const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
//     query.$or = [
//       { centerName: searchRegex },
//       { program: searchRegex },
//       { project: searchRegex },
//       { activityName: searchRegex },
//       { subactivityName: searchRegex },
//       { unit: searchRegex },
//     ];
//   }
//   // console.log("query", query);
//   // let totalRecs = "";

//   // console.log("totalRecs", totalRecs);

//   Utilization.aggregate([
//     {
//       $match: query,
//     },
//     {
//       $project: {
//         _id: 0,
//         centerName: 1,
//         program: 1,
//         project: 1,
//         activityName: 1,
//         subactivityName: 1,
//         center_id: 1,
//         program_id: 1,
//         project_id: 1,
//         activityName_id: 1,
//         subactivityName_id: 1,
//         utilApprovalNo: "$approvalNo",
//         quantity: 1,
//         totalCost: 1,
//         sourceofFund: 1,
//         convergence: 1,
//         noOfHouseholds: 1,
//         noOfBeneficiaries: 1,
//       },
//     },
//     {
//       $lookup: {
//         from: "approvaldetails",
//         localField: "utilApprovalNo",
//         foreignField: "approvalNo",
//         as: "approvaldata",
//       },
//     },
//     {
//       $unwind: "$approvaldata",
//     },
//     {
//       $project: {
//         _id: 0,
//         centerName: 1,
//         program: 1,
//         project: 1,
//         activityName: 1,
//         subactivityName: 1,
//         center_id: 1,
//         program_id: 1,
//         project_id: 1,
//         activityName_id: 1,
//         subactivityName_id: 1,
//         approvalNo: "$approvaldata.approvalNo",
//         approvalUnit: "$approvaldata.unit",
//         approvalQuantity: "$approvaldata.quantity",
//         totalApprovalAmount: "$approvaldata.totalCost",
//         approvalLHWRF: "$approvaldata.sourceofFund.LHWRF",
//         approvalCC: "$approvaldata.sourceofFund.CC",
//         approvalExtGrant: "$approvaldata.sourceofFund.grant",
//         utilizationQuantity: "$quantity",
//         utilizedAmount: "$totalCost",
//         utilisedLHWRF: "$sourceofFund.LHWRF",
//         utilisedCC: "$sourceofFund.CC",
//         utilisedExtGrant: "$sourceofFund.grant",
//         approvalNoOfHouseholds: "$approvaldata.noOfHouseholds",
//         approvalNoOfBeneficiaries: "$approvaldata.noOfBeneficiaries",
//         utilizedNoOfHouseholds: "$noOfHouseholds",
//         utilizedNoOfBeneficiaries: "$noOfBeneficiaries",
//         approvalConvergence: "$approvaldata.convergence",
//         utilizedConvergence: "$convergence",
//       },
//     },
//     {
//       $group: {
//         _id: {
//           approvalNo: "$approvalNo",
//           centerName: "$centerName",
//           program: "$program",
//           project: "$project",
//           activityName: "$activityName",
//           subactivityName: "$subactivityName",
//           center_id: "$center_id",
//           program_id: "$program_id",
//           project_id: "$project_id",
//           activityName_id: "$activityName_id",
//           subactivityName_id: "$subactivityName_id",
//           approvalUnit: "$approvalUnit",
//           approvalQuantity: "$approvalQuantity",
//           totalApprovalAmount: "$totalApprovalAmount",
//           approvalLHWRF: "$approvalLHWRF",
//           approvalCC: "$approvalCC",
//           approvalConvergence: "$approvalConvergence",
//           approvalExtGrant: "$approvalExtGrant",

//           approvalNoOfHouseholds: "$approvalNoOfHouseholds",
//           approvalNoOfBeneficiaries: "$approvalNoOfBeneficiaries",
//         },
//         // utilizationUnit: "$utilizationUnit",
//         totalUtilisedQuantity: { $sum: "$utilizationQuantity" },
//         totalUtilisedAmount: { $sum: "$utilizedAmount" },
//         totalUtilisedLHWRF: { $sum: "$utilisedLHWRF" },
//         totalUtilisedCC: { $sum: "$utilisedCC" },
//         totalUtilisedExtGrant: { $sum: "$utilisedExtGrant" },
//         totalConvergence: { $sum: "$utilizedConvergence" },
//         totalNoOfHouseholds: { $sum: "$utilizedNoOfHouseholds" },
//         totalNoOfBeneficiaries: { $sum: "$utilizedNoOfBeneficiaries" },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         centerName: "$_id.centerName",
//         program: "$_id.program",
//         project: "$_id.project",
//         activityName: "$_id.activityName",
//         subactivityName: "$_id.subactivityName",
//         center_id: "$_id.center_id",
//         program_id: "$_id.program_id",
//         project_id: "$_id.project_id",
//         activityName_id: "$_id.activityName_id",
//         subactivityName_id: "$_id.subactivityName_id",
//         approvalNo: "$_id.approvalNo",
//         approvalUnit: "$_id.approvalUnit",
//         approvalQuantity: "$_id.approvalQuantity",
//         totalApprovalAmount: "$_id.totalApprovalAmount",
//         approvalLHWRF: "$_id.approvalLHWRF",
//         approvalCC: "$_id.approvalCC",
//         approvalExtGrant: "$_id.approvalExtGrant",
//         approvalConvergence: "$_id.approvalConvergence",
//         approvalNoOfHouseholds: "$_id.approvalNoOfHouseholds",
//         approvalNoOfBeneficiaries: "$_id.approvalNoOfBeneficiaries",
//         totalUtilisedQuantity: "$totalUtilisedQuantity",
//         // utilizationUnit: "$utilizationUnit",
//         totalUtilisedAmount: "$totalUtilisedAmount",
//         totalUtilisedLHWRF: "$totalUtilisedLHWRF",
//         totalUtilisedCC: "$totalUtilisedCC",
//         totalUtilisedExtGrant: "$totalUtilisedExtGrant",
//         totalConvergence: "$totalConvergence",
//         totalNoOfHouseholds: "$totalNoOfHouseholds",
//         totalNoOfBeneficiaries: "$totalNoOfBeneficiaries",
//         percentageUtilizedAgainstApproval: {
//           $cond: [
//             { $eq: ["$_id.totalApprovalAmount", 0] },
//             0,
//             {
//               $round: [
//                 {
//                   $multiply: [
//                     {
//                       $divide: [
//                         "$totalUtilisedAmount",
//                         "$_id.totalApprovalAmount",
//                       ],
//                     },
//                     100,
//                   ],
//                 },
//                 2,
//               ],
//             },
//           ],
//         },
//         balanceAmount: {
//           $subtract: ["$_id.totalApprovalAmount", "$totalUtilisedAmount"],
//         },
//       },
//     },
//   ])
//     .skip(parseInt(skipRec))
//     .limit(parseInt(recsPerPage))
//     .sort({ approvalNo: 1 })
//     .then((data) => {
//       // console.log("data", data);
//       const totalRecs = data.length;
//       var approvalQuantity = 0;
//       var totalApprovalAmount = 0;
//       var approvalLHWRF = 0;
//       var approvalCC = 0;
//       var approvalExtGrant = 0;
//       var approvalConvergence = 0;
//       var approvalNoOfHouseholds = 0;
//       var approvalNoOfBeneficiaries = 0;
//       var totalUtilisedQuantity = 0;
//       var totalUtilisedAmount = 0;
//       var totalUtilisedLHWRF = 0;
//       var totalUtilisedCC = 0;
//       var totalUtilisedExtGrant = 0;
//       var totalConvergence = 0;
//       var totalNoOfHouseholds = 0;
//       var totalNoOfBeneficiaries = 0;
//       var totalPercentageUtilized = 0;
//       var balanceAmount = 0;
//       var cumulativeData = [];
//       for (var index = 0; index < data.length; index++) {
//         approvalQuantity += data[index].approvalQuantity
//           ? data[index].approvalQuantity
//           : 0;
//         totalApprovalAmount += data[index].totalApprovalAmount
//           ? data[index].totalApprovalAmount
//           : 0;
//         approvalLHWRF += data[index].approvalLHWRF
//           ? data[index].approvalLHWRF
//           : 0;
//         approvalCC += data[index].approvalCC ? data[index].approvalCC : 0;
//         approvalExtGrant += data[index].approvalExtGrant
//           ? data[index].approvalExtGrant
//           : 0;
//         approvalConvergence += data[index].approvalConvergence
//           ? data[index].approvalConvergence
//           : 0;
//         approvalNoOfHouseholds += data[index].approvalNoOfHouseholds
//           ? data[index].approvalNoOfHouseholds
//           : 0;
//         approvalNoOfBeneficiaries += data[index].approvalNoOfBeneficiaries
//           ? data[index].approvalNoOfBeneficiaries
//           : 0;
//         totalUtilisedQuantity += data[index].totalUtilisedQuantity
//           ? data[index].totalUtilisedQuantity
//           : 0;
//         totalUtilisedAmount += data[index].totalUtilisedAmount
//           ? data[index].totalUtilisedAmount
//           : 0;
//         totalUtilisedLHWRF += data[index].totalUtilisedLHWRF
//           ? data[index].totalUtilisedLHWRF
//           : 0;
//         totalUtilisedCC += data[index].totalUtilisedCC
//           ? data[index].totalUtilisedCC
//           : 0;
//         totalUtilisedExtGrant += data[index].totalUtilisedExtGrant
//           ? data[index].totalUtilisedExtGrant
//           : 0;
//         totalConvergence += data[index].totalConvergence
//           ? data[index].totalConvergence
//           : 0;
//         totalNoOfHouseholds += data[index].totalNoOfHouseholds
//           ? data[index].totalNoOfHouseholds
//           : 0;
//         totalNoOfBeneficiaries += data[index].totalNoOfBeneficiaries
//           ? data[index].totalNoOfBeneficiaries
//           : 0;
//         if (totalApprovalAmount > 0) {
//           totalPercentageUtilized =
//             (totalUtilisedAmount / totalApprovalAmount) * 100;
//         }
//         balanceAmount += data[index].balanceAmount
//           ? data[index].balanceAmount
//           : 0;
//       }
//       if (index >= data.length && data.length > 0) {
//         const totalPercentage = totalApprovalAmount
//           ? (totalUtilisedAmount / totalApprovalAmount) * 100
//           : 0;

//         const roundedTotalPercentage = Math.round(totalPercentage * 100) / 100;

//         data.push({
//           centerName: "Total",
//           program: "-",
//           project: "-",
//           activityName: "-",
//           subactivityName: "-",
//           program_id: "-",
//           project_id: "-",
//           activityName_id: "-",
//           subactivityName_id: "-",
//           approvalNo: "-",
//           approvalUnit: "-",
//           approvalQuantity: approvalQuantity ? approvalQuantity : 0,
//           totalApprovalAmount: totalApprovalAmount ? totalApprovalAmount : 0,
//           approvalLHWRF: approvalLHWRF ? approvalLHWRF : 0,
//           approvalCC: approvalCC ? approvalCC : 0,
//           approvalExtGrant: approvalExtGrant ? approvalExtGrant : 0,
//           approvalConvergence: approvalConvergence ? approvalConvergence : 0,
//           approvalNoOfHouseholds: approvalNoOfHouseholds
//             ? approvalNoOfHouseholds
//             : 0,
//           approvalNoOfBeneficiaries: approvalNoOfBeneficiaries
//             ? approvalNoOfBeneficiaries
//             : 0,
//           // utilizationUnit: "-",
//           totalUtilisedQuantity: totalUtilisedQuantity
//             ? totalUtilisedQuantity
//             : 0,
//           totalUtilisedAmount: totalUtilisedAmount ? totalUtilisedAmount : 0,
//           totalUtilisedLHWRF: totalUtilisedLHWRF ? totalUtilisedLHWRF : 0,
//           totalUtilisedCC: totalUtilisedCC ? totalUtilisedCC : 0,
//           totalUtilisedExtGrant: totalUtilisedExtGrant
//             ? totalUtilisedExtGrant
//             : 0,
//           totalConvergence: totalConvergence ? totalConvergence : 0,
//           totalNoOfHouseholds: totalNoOfHouseholds ? totalNoOfHouseholds : 0,
//           totalNoOfBeneficiaries: totalNoOfBeneficiaries
//             ? totalNoOfBeneficiaries
//             : 0,
//           percentageUtilizedAgainstApproval: roundedTotalPercentage
//             ? roundedTotalPercentage
//             : 0,
//           balanceAmount: balanceAmount ? balanceAmount : 0,
//         });
//       }
//       // console.log("data",data)

//       res.status(200).json({
//         totalRecs: totalRecs,
//         tableData: data,
//         success: true,
//       });

//       // console.log("approval vs utilization data", data);
//     })
//     .catch((error) => {
//       console.log("Error in ApprovalList  => ", error);
//       res.status(500).json({ errorMsg: error.message, success: false });
//     });
// };

exports.approval_vs_utilization_report = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  var query = {};
  if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
    query.approvalDate = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  }
  // console.log("req.body", req.body);

  if (req.body.center_ID !== "all")
    query.center_id = new ObjectId(req.body.center_ID);

  if (req.body.program_id !== "all") {
    query.program_id = new ObjectId(req.body.program_id);
  }
  if (req.body.project_id !== "all") {
    query.project_id = new ObjectId(req.body.project_id);
  }
  if (req.body.activityName_id !== "all") {
    query.activityName_id = new ObjectId(req.body.activityName_id);
  }
  if (req.body.subactivityName_id !== "all") {
    query.subactivityName_id = new ObjectId(req.body.subactivityName_id);
  }

  //  search text condition
  // console.log("req.body.searchText",req.body)
  // console.log("query",query)
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
  // console.log("query", query);
  // let totalRecs = "";

  // console.log("totalRecs", totalRecs);

  Utilization.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "approvaldetails",
        localField: "approvalNo",
        foreignField: "approvalNo",
        as: "approvaldata",
      },
    },
    { $unwind: "$approvaldata" },
    {
      $group: {
        _id: {
          approvalNo: "$approvalNo",
          centerName: "$centerName",
          program: "$program",
          project: "$project",
          activityName: "$activityName",
          subactivityName: "$subactivityName",
          center_id: "$center_id",
          program_id: "$program_id",
          project_id: "$project_id",
          activityName_id: "$activityName_id",
          subactivityName_id: "$subactivityName_id",
          s,
        },
      },
    },
    { $count: "totalRecords" },
  ])
    .then((countResult) => {
      // let totalRecs = countResult.length > 0 ? countResult[0].totalRecords : 0;

      console.log("totalRecs", countResult);
      Utilization.aggregate([
        {
          $match: query,
        },
        {
          $project: {
            _id: 0,
            centerName: 1,
            program: 1,
            project: 1,
            activityName: 1,
            subactivityName: 1,
            center_id: 1,
            program_id: 1,
            project_id: 1,
            activityName_id: 1,
            subactivityName_id: 1,
            utilApprovalNo: "$approvalNo",
            quantity: 1,
            totalCost: 1,
            sourceofFund: 1,
            convergence: 1,
            noOfHouseholds: 1,
            noOfBeneficiaries: 1,
          },
        },
        {
          $lookup: {
            from: "approvaldetails",
            localField: "utilApprovalNo",
            foreignField: "approvalNo",
            as: "approvaldata",
          },
        },
        {
          $unwind: "$approvaldata",
        },
        {
          $project: {
            _id: 0,
            centerName: 1,
            program: 1,
            project: 1,
            activityName: 1,
            subactivityName: 1,
            center_id: 1,
            program_id: 1,
            project_id: 1,
            activityName_id: 1,
            subactivityName_id: 1,
            approvalNo: "$approvaldata.approvalNo",
            approvalUnit: "$approvaldata.unit",
            approvalQuantity: "$approvaldata.quantity",
            totalApprovalAmount: "$approvaldata.totalCost",
            approvalLHWRF: "$approvaldata.sourceofFund.LHWRF",
            approvalCC: "$approvaldata.sourceofFund.CC",
            approvalExtGrant: "$approvaldata.sourceofFund.grant",
            utilizationQuantity: "$quantity",
            utilizedAmount: "$totalCost",
            utilisedLHWRF: "$sourceofFund.LHWRF",
            utilisedCC: "$sourceofFund.CC",
            utilisedExtGrant: "$sourceofFund.grant",
            approvalNoOfHouseholds: "$approvaldata.noOfHouseholds",
            approvalNoOfBeneficiaries: "$approvaldata.noOfBeneficiaries",
            utilizedNoOfHouseholds: "$noOfHouseholds",
            utilizedNoOfBeneficiaries: "$noOfBeneficiaries",
            approvalConvergence: "$approvaldata.convergence",
            utilizedConvergence: "$convergence",
          },
        },
        {
          $group: {
            _id: {
              approvalNo: "$approvalNo",
              centerName: "$centerName",
              program: "$program",
              project: "$project",
              activityName: "$activityName",
              subactivityName: "$subactivityName",
              center_id: "$center_id",
              program_id: "$program_id",
              project_id: "$project_id",
              activityName_id: "$activityName_id",
              subactivityName_id: "$subactivityName_id",
              approvalUnit: "$approvalUnit",
              approvalQuantity: "$approvalQuantity",
              totalApprovalAmount: "$totalApprovalAmount",
              approvalLHWRF: "$approvalLHWRF",
              approvalCC: "$approvalCC",
              approvalConvergence: "$approvalConvergence",
              approvalExtGrant: "$approvalExtGrant",

              approvalNoOfHouseholds: "$approvalNoOfHouseholds",
              approvalNoOfBeneficiaries: "$approvalNoOfBeneficiaries",
            },
            // utilizationUnit: "$utilizationUnit",
            totalUtilisedQuantity: { $sum: "$utilizationQuantity" },
            totalUtilisedAmount: { $sum: "$utilizedAmount" },
            totalUtilisedLHWRF: { $sum: "$utilisedLHWRF" },
            totalUtilisedCC: { $sum: "$utilisedCC" },
            totalUtilisedExtGrant: { $sum: "$utilisedExtGrant" },
            totalConvergence: { $sum: "$utilizedConvergence" },
            totalNoOfHouseholds: { $sum: "$utilizedNoOfHouseholds" },
            totalNoOfBeneficiaries: { $sum: "$utilizedNoOfBeneficiaries" },
          },
        },
        {
          $project: {
            _id: 0,
            centerName: "$_id.centerName",
            program: "$_id.program",
            project: "$_id.project",
            activityName: "$_id.activityName",
            subactivityName: "$_id.subactivityName",
            center_id: "$_id.center_id",
            program_id: "$_id.program_id",
            project_id: "$_id.project_id",
            activityName_id: "$_id.activityName_id",
            subactivityName_id: "$_id.subactivityName_id",
            approvalNo: "$_id.approvalNo",
            approvalUnit: "$_id.approvalUnit",
            approvalQuantity: "$_id.approvalQuantity",
            totalApprovalAmount: "$_id.totalApprovalAmount",
            approvalLHWRF: "$_id.approvalLHWRF",
            approvalCC: "$_id.approvalCC",
            approvalExtGrant: "$_id.approvalExtGrant",
            approvalConvergence: "$_id.approvalConvergence",
            approvalNoOfHouseholds: "$_id.approvalNoOfHouseholds",
            approvalNoOfBeneficiaries: "$_id.approvalNoOfBeneficiaries",
            totalUtilisedQuantity: "$totalUtilisedQuantity",
            // utilizationUnit: "$utilizationUnit",
            totalUtilisedAmount: "$totalUtilisedAmount",
            totalUtilisedLHWRF: "$totalUtilisedLHWRF",
            totalUtilisedCC: "$totalUtilisedCC",
            totalUtilisedExtGrant: "$totalUtilisedExtGrant",
            totalConvergence: "$totalConvergence",
            totalNoOfHouseholds: "$totalNoOfHouseholds",
            totalNoOfBeneficiaries: "$totalNoOfBeneficiaries",
            percentageUtilizedAgainstApproval: {
              $cond: [
                { $eq: ["$_id.totalApprovalAmount", 0] },
                0,
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$totalUtilisedAmount",
                            "$_id.totalApprovalAmount",
                          ],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
              ],
            },
            balanceAmount: {
              $subtract: ["$_id.totalApprovalAmount", "$totalUtilisedAmount"],
            },
          },
        },
      ])
        .skip(parseInt(skipRec))
        .limit(parseInt(recsPerPage))
        .sort({ approvalNo: 1 })
        .then((data) => {
          console.log("data", data);
          var approvalQuantity = 0;
          var totalApprovalAmount = 0;
          var approvalLHWRF = 0;
          var approvalCC = 0;
          var approvalExtGrant = 0;
          var approvalConvergence = 0;
          var approvalNoOfHouseholds = 0;
          var approvalNoOfBeneficiaries = 0;
          var totalUtilisedQuantity = 0;
          var totalUtilisedAmount = 0;
          var totalUtilisedLHWRF = 0;
          var totalUtilisedCC = 0;
          var totalUtilisedExtGrant = 0;
          var totalConvergence = 0;
          var totalNoOfHouseholds = 0;
          var totalNoOfBeneficiaries = 0;
          var totalPercentageUtilized = 0;
          var balanceAmount = 0;
          var cumulativeData = [];
          for (var index = 0; index < data.length; index++) {
            approvalQuantity += data[index].approvalQuantity
              ? data[index].approvalQuantity
              : 0;
            totalApprovalAmount += data[index].totalApprovalAmount
              ? data[index].totalApprovalAmount
              : 0;
            approvalLHWRF += data[index].approvalLHWRF
              ? data[index].approvalLHWRF
              : 0;
            approvalCC += data[index].approvalCC ? data[index].approvalCC : 0;
            approvalExtGrant += data[index].approvalExtGrant
              ? data[index].approvalExtGrant
              : 0;
            approvalConvergence += data[index].approvalConvergence
              ? data[index].approvalConvergence
              : 0;
            approvalNoOfHouseholds += data[index].approvalNoOfHouseholds
              ? data[index].approvalNoOfHouseholds
              : 0;
            approvalNoOfBeneficiaries += data[index].approvalNoOfBeneficiaries
              ? data[index].approvalNoOfBeneficiaries
              : 0;
            totalUtilisedQuantity += data[index].totalUtilisedQuantity
              ? data[index].totalUtilisedQuantity
              : 0;
            totalUtilisedAmount += data[index].totalUtilisedAmount
              ? data[index].totalUtilisedAmount
              : 0;
            totalUtilisedLHWRF += data[index].totalUtilisedLHWRF
              ? data[index].totalUtilisedLHWRF
              : 0;
            totalUtilisedCC += data[index].totalUtilisedCC
              ? data[index].totalUtilisedCC
              : 0;
            totalUtilisedExtGrant += data[index].totalUtilisedExtGrant
              ? data[index].totalUtilisedExtGrant
              : 0;
            totalConvergence += data[index].totalConvergence
              ? data[index].totalConvergence
              : 0;
            totalNoOfHouseholds += data[index].totalNoOfHouseholds
              ? data[index].totalNoOfHouseholds
              : 0;
            totalNoOfBeneficiaries += data[index].totalNoOfBeneficiaries
              ? data[index].totalNoOfBeneficiaries
              : 0;
            if (totalApprovalAmount > 0) {
              totalPercentageUtilized =
                (totalUtilisedAmount / totalApprovalAmount) * 100;
            }
            balanceAmount += data[index].balanceAmount
              ? data[index].balanceAmount
              : 0;
          }
          if (index >= data.length && data.length > 0) {
            const totalPercentage = totalApprovalAmount
              ? (totalUtilisedAmount / totalApprovalAmount) * 100
              : 0;

            const roundedTotalPercentage =
              Math.round(totalPercentage * 100) / 100;

            data.push({
              centerName: "Total",
              program: "-",
              project: "-",
              activityName: "-",
              subactivityName: "-",
              program_id: "-",
              project_id: "-",
              activityName_id: "-",
              subactivityName_id: "-",
              approvalNo: "-",
              approvalUnit: "-",
              approvalQuantity: approvalQuantity ? approvalQuantity : 0,
              totalApprovalAmount: totalApprovalAmount
                ? totalApprovalAmount
                : 0,
              approvalLHWRF: approvalLHWRF ? approvalLHWRF : 0,
              approvalCC: approvalCC ? approvalCC : 0,
              approvalExtGrant: approvalExtGrant ? approvalExtGrant : 0,
              approvalConvergence: approvalConvergence
                ? approvalConvergence
                : 0,
              approvalNoOfHouseholds: approvalNoOfHouseholds
                ? approvalNoOfHouseholds
                : 0,
              approvalNoOfBeneficiaries: approvalNoOfBeneficiaries
                ? approvalNoOfBeneficiaries
                : 0,
              // utilizationUnit: "-",
              totalUtilisedQuantity: totalUtilisedQuantity
                ? totalUtilisedQuantity
                : 0,
              totalUtilisedAmount: totalUtilisedAmount
                ? totalUtilisedAmount
                : 0,
              totalUtilisedLHWRF: totalUtilisedLHWRF ? totalUtilisedLHWRF : 0,
              totalUtilisedCC: totalUtilisedCC ? totalUtilisedCC : 0,
              totalUtilisedExtGrant: totalUtilisedExtGrant
                ? totalUtilisedExtGrant
                : 0,
              totalConvergence: totalConvergence ? totalConvergence : 0,
              totalNoOfHouseholds: totalNoOfHouseholds
                ? totalNoOfHouseholds
                : 0,
              totalNoOfBeneficiaries: totalNoOfBeneficiaries
                ? totalNoOfBeneficiaries
                : 0,
              percentageUtilizedAgainstApproval: roundedTotalPercentage
                ? roundedTotalPercentage
                : 0,
              balanceAmount: balanceAmount ? balanceAmount : 0,
            });
          }
          // console.log("data",data)

          res.status(200).json({
            // totalRecs: totalRecs,
            tableData: data,
            success: true,
          });

          // console.log("approval vs utilization data", data);
        })
        .catch((error) => {
          console.log("Error in ApprovalList  => ", error);
          res.status(500).json({ errorMsg: error.message, success: false });
        });
    })
    .catch((error) => {
      console.log("Error in counting total records => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};

exports.plan_vs_utilization_report = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = {};

  if (req.body.year !== "all") {
    query.year = req.body.year;
    const { startDate, endDate } = getFinancialYearDates(req.body.year);
    // console.log("startDate", startDate);
    // console.log("endDate", endDate);
  }

  if (req.body.center_ID !== "all")
    query.center_id = new ObjectId(req.body.center_ID);

  if (req.body.program_id !== "all") {
    query.program_id = new ObjectId(req.body.program_id);
  }
  if (req.body.project_id !== "all") {
    query.project_id = new ObjectId(req.body.project_id);
  }
  if (req.body.activityName_id !== "all") {
    query.activityName_id = new ObjectId(req.body.activityName_id);
  }
  if (req.body.subactivityName_id !== "all") {
    query.subactivityName_id = new ObjectId(req.body.subactivityName_id);
  }

  // console.log("req.body.fromDate", req.body.fromDate);
  // console.log("req.body.toDate", req.body.toDate);

  // if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
  //   query.approvalDate = {
  //     $gte: req.body.fromDate,
  //     $lte: req.body.toDate,
  //   };
  // }

  //  search text condition
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
  // console.log("query", query);

  AnnualPlan.aggregate([
    {
      $match: query,
    },
    {
      $project: {
        _id: 0,
        centerName: 1,
        program: 1,
        project: 1,
        activityName: 1,
        subactivityName: 1,
        center_id: 1,
        program_id: 1,
        project_id: 1,
        activityName_id: 1,
        subactivityName_id: 1,
        unit: 1,
        quantity: 1,
        totalCost: 1,
        sourceofFund: 1,
        convergence: 1,
        noOfHouseholds: 1,
        noOfBeneficiaries: 1,
      },
    },
    {
      $lookup: {
        from: "utilizationdetails", // Collection to join
        let: {
          subactivityName_id: "$subactivityName_id",
          center_id: "$center_id",
          // startDate: "$approvalDate", // Define the startDate
          // endDate: "$approvalDate", // Define the endDate
        }, // Local variables
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$subactivityName_id", "$$subactivityName_id"] }, // Match on subactivityName_id
                  { $eq: ["$center_id", "$$center_id"] }, // Match on center_id
                  {
                    $gte: ["$approvalDate", req.body.fromDate], // Greater than or equal to fromDate
                  },
                  {
                    $lte: ["$approvalDate", req.body.toDate], // Less than or equal to toDate
                  },
                  // { $eq: ["$voucherDate", "2024-09-13"] }, // Match on center_id
                  // { $gt: ["$approvalDate", req.body.startDate] }, // Greater than or equal to startDate
                  // { $lt: ["$approvalDate", req.body.endDate] }, // Less than or equal to endDate
                ],
              },
            },
          },
        ],
        as: "utilizationData",
      },
    },
    {
      $unwind: "$utilizationData",
    },
    {
      $project: {
        _id: 0,
        centerName: 1,
        program: 1,
        project: 1,
        activityName: 1,
        subactivityName: 1,
        program_id: 1,
        project_id: 1,
        activityName_id: 1,
        subactivityName_id: 1,
        plannedUnit: "$unit",
        plannedQuantity: "$quantity",
        plannedAmount: "$totalCost",
        plannedLHWRF: "$sourceofFund.LHWRF",
        plannedCC: "$sourceofFund.CC",
        plannedConvergence: "$convergence",
        plannedExtGrant: "$sourceofFund.grant",
        plannedNoOfHouseholds: "$noOfHouseholds",
        plannedNoOfBeneficiaries: "$noOfBeneficiaries",
        utilizationQuantity: "$utilizationData.quantity",
        utilizationAmount: "$utilizationData.totalCost",
        utilizationLHWRF: "$utilizationData.sourceofFund.LHWRF",
        utilizationCC: "$utilizationData.sourceofFund.CC",
        utilizationExtGrant: "$utilizationData.sourceofFund.grant",
        utilizationConvergence: "utilizationData.convergence",
        utilizationNoOfHouseholds: "$utilizationData.noOfHouseholds",
        utilizationNoOfBeneficiaries: "$utilizationData.noOfBeneficiaries",
      },
    },
    {
      $group: {
        _id: {
          centerName: "$centerName",
          program: "$program",
          project: "$project",
          activityName: "$activityName",
          subactivityName: "$subactivityName",
          program_id: "$program_id",
          project_id: "$project_id",
          activityName_id: "$activityName_id",
          subactivityName_id: "$subactivityName_id",
          plannedUnit: "$plannedUnit",
          plannedQuantity: "$plannedQuantity",
          plannedAmount: "$plannedAmount",
          plannedLHWRF: "$plannedLHWRF",
          plannedCC: "$plannedCC",
          plannedExtGrant: "$plannedExtGrant",
          plannedConvergence: "$plannedConvergence",
          plannedNoOfHouseholds: "$plannedNoOfHouseholds",
          plannedNoOfBeneficiaries: "$plannedNoOfBeneficiaries",
        },
        totalUtilisedQuantity: { $sum: "$utilizationQuantity" },
        totalUtilisedAmount: { $sum: "$utilizationAmount" },
        totalUtilisedLHWRF: { $sum: "$utilizationLHWRF" },
        totalUtilisedCC: { $sum: "$utilizationCC" },
        totalUtilisedExtGrant: { $sum: "$utilizationExtGrant" },
        totalUtilisedConvergence: { $sum: "$utilizationConvergence" },
        totalNoOfHouseholds: { $sum: "$utilizationNoOfHouseholds" },
        totalNoOfBeneficiaries: { $sum: "$utilizationNoOfBeneficiaries" },
      },
    },
    {
      $project: {
        _id: 0,
        centerName: "$_id.centerName",
        program: "$_id.program",
        project: "$_id.project",
        activityName: "$_id.activityName",
        subactivityName: "$_id.subactivityName",
        program_id: "$_id.program_id",
        project_id: "$_id.project_id",
        activityName_id: "$_id.activityName_id",
        subactivityName_id: "$_id.subactivityName_id",
        plannedUnit: "$_id.plannedUnit",
        plannedQuantity: "$_id.plannedQuantity",
        plannedAmount: "$_id.plannedAmount",
        plannedLHWRF: "$_id.plannedLHWRF",
        plannedCC: "$_id.plannedCC",
        plannedExtGrant: "$_id.plannedExtGrant",
        plannedConvergence: "$_id.plannedConvergence",
        plannedNoOfHouseholds: "$_id.plannedNoOfHouseholds",
        plannedNoOfBeneficiaries: "$_id.plannedNoOfBeneficiaries",

        totalUtilisedQuantity: "$totalUtilisedQuantity",
        totalUtilisedAmount: "$totalUtilisedAmount",
        totalUtilisedLHWRF: "$totalUtilisedLHWRF",
        totalUtilisedCC: "$totalUtilisedCC",
        totalUtilisedExtGrant: "$totalUtilisedExtGrant",
        totalUtilisedConvergence: "$totalUtilisedConvergence",
        totalNoOfHouseholds: "$totalNoOfHouseholds",
        totalNoOfBeneficiaries: "$totalNoOfBeneficiaries",
        percentageUtilizedAgainstPlan: {
          $cond: [
            { $eq: ["$_id.plannedAmount", 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: ["$totalUtilisedAmount", "$_id.plannedAmount"],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          ],
        },
        balanceAmount: {
          $subtract: ["$_id.plannedAmount", "$totalUtilisedAmount"],
        },
      },
    },
  ])
    .skip(parseInt(skipRec))
    .limit(parseInt(recsPerPage))
    .then((data) => {
      // console.log("data", data);
      const totalRecs = data.length;
      var plannedQuantity = 0;
      var plannedAmount = 0;
      var plannedLHWRF = 0;
      var plannedCC = 0;
      var plannedExtGrant = 0;
      var plannedConvergence = 0;
      var plannedNoOfHouseholds = 0;
      var plannedNoOfBeneficiaries = 0;
      var totalUtilisedQuantity = 0;
      var totalUtilisedAmount = 0;
      var totalUtilisedLHWRF = 0;
      var totalUtilisedCC = 0;
      var totalUtilisedExtGrant = 0;
      var totalUtilisedConvergence = 0;
      var totalNoOfHouseholds = 0;
      var totalNoOfBeneficiaries = 0;
      var totalPercentageUtilized = 0;
      var balanceAmount = 0;
      var cumulativeData = [];
      for (var index = 0; index < data.length; index++) {
        plannedQuantity += data[index].plannedQuantity
          ? data[index].plannedQuantity
          : 0;
        plannedAmount += data[index].plannedAmount
          ? data[index].plannedAmount
          : 0;
        plannedLHWRF += data[index].plannedLHWRF ? data[index].plannedLHWRF : 0;
        plannedCC += data[index].plannedCC ? data[index].plannedCC : 0;
        plannedExtGrant += data[index].plannedExtGrant
          ? data[index].plannedExtGrant
          : 0;
        plannedConvergence += data[index].plannedConvergence
          ? data[index].plannedConvergence
          : 0;
        plannedNoOfHouseholds += data[index].plannedNoOfHouseholds
          ? data[index].plannedNoOfHouseholds
          : 0;
        plannedNoOfBeneficiaries += data[index].plannedNoOfBeneficiaries
          ? data[index].plannedNoOfBeneficiaries
          : 0;
        totalUtilisedQuantity += data[index].totalUtilisedQuantity
          ? data[index].totalUtilisedQuantity
          : 0;
        totalUtilisedAmount += data[index].totalUtilisedAmount
          ? data[index].totalUtilisedAmount
          : 0;
        totalUtilisedLHWRF += data[index].totalUtilisedLHWRF
          ? data[index].totalUtilisedLHWRF
          : 0;
        totalUtilisedCC += data[index].totalUtilisedCC
          ? data[index].totalUtilisedCC
          : 0;
        totalUtilisedExtGrant += data[index].totalUtilisedExtGrant
          ? data[index].totalUtilisedExtGrant
          : 0;
        totalUtilisedConvergence += data[index].totalUtilisedConvergence
          ? data[index].totalUtilisedConvergence
          : 0;
        totalNoOfHouseholds += data[index].totalNoOfHouseholds
          ? data[index].totalNoOfHouseholds
          : 0;
        totalNoOfBeneficiaries += data[index].totalNoOfBeneficiaries
          ? data[index].totalNoOfBeneficiaries
          : 0;
        if (plannedAmount > 0) {
          totalPercentageUtilized = (totalUtilisedAmount / plannedAmount) * 100;
        }
        balanceAmount += data[index].balanceAmount
          ? data[index].balanceAmount
          : 0;
      }
      if (index >= data.length && data.length > 0) {
        const totalPercentage = plannedAmount
          ? (totalUtilisedAmount / plannedAmount) * 100
          : 0;

        const roundedTotalPercentage = Math.round(totalPercentage * 100) / 100;

        data.push({
          centerName: "Total",
          program: "-",
          project: "-",
          activityName: "-",
          subactivityName: "-",
          program_id: "-",
          project_id: "-",
          activityName_id: "-",
          subactivityName_id: "-",
          plannedUnit: "-",
          plannedQuantity: plannedQuantity,
          plannedAmount: plannedAmount,
          plannedLHWRF: plannedLHWRF,
          plannedCC: plannedCC,
          plannedExtGrant: plannedExtGrant,
          plannedConvergence: plannedConvergence,
          plannedNoOfHouseholds: plannedNoOfHouseholds,
          plannedNoOfBeneficiaries: plannedNoOfBeneficiaries,
          totalUtilisedQuantity: totalUtilisedQuantity
            ? totalUtilisedQuantity
            : 0,
          totalUtilisedAmount: totalUtilisedAmount ? totalUtilisedAmount : 0,
          totalUtilisedLHWRF: totalUtilisedLHWRF ? totalUtilisedLHWRF : 0,
          totalUtilisedCC: totalUtilisedCC ? totalUtilisedCC : 0,
          totalUtilisedExtGrant: totalUtilisedExtGrant
            ? totalUtilisedExtGrant
            : 0,
          totalUtilisedConvergence: totalUtilisedConvergence
            ? totalUtilisedConvergence
            : 0,
          totalNoOfHouseholds: totalNoOfHouseholds ? totalNoOfHouseholds : 0,
          totalNoOfBeneficiaries: totalNoOfBeneficiaries
            ? totalNoOfBeneficiaries
            : 0,
          percentageUtilizedAgainstPlan: roundedTotalPercentage
            ? roundedTotalPercentage
            : 0,
          balanceAmount: balanceAmount ? balanceAmount : 0,
        });
      }
      // console.log("data",data)
      res.status(200).json({
        totalRecs: totalRecs,
        tableData: data,
        success: true,
      });
    })
    .catch((error) => {
      console.log("Error in ApprovalList  => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};

function getFinancialYearDates(financialYear) {
  const [startYear, endYearSuffix] = financialYear.split("-").map(Number);
  const startDate = new Date(`${startYear}-04-01`);
  const endDate = new Date(`${startYear + 1}-03-31`);
  const formatToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatToYYYYMMDD(startDate),
    endDate: formatToYYYYMMDD(endDate),
  };
}
function getFinancialYearFromDate(date) {
  const givenDate = new Date(date);
  const year = givenDate.getFullYear();
  const month = givenDate.getMonth() + 1; // Month is 0-indexed

  if (month >= 4) {
    // If the month is April (4) or later, financial year starts in this year and ends next year
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    // If the month is before April, financial year starts in the previous year and ends this year
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

exports.fund_status_report = (req, res, next) => {
  // console.log("req.body", req.body);
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = {};
  var startDate = req.body.fromDate;
  var endDate = req.body.toDate;

  const financialYear = getFinancialYearFromDate(endDate); //find financialYear from toDate for plans lookup
  // console.log("financialYear", financialYear);

  if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
    query.amountReceivedDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  if (req.body.center_ID !== "all")
    query.center_id = new ObjectId(req.body.center_ID);

  if (req.body.program_id !== "all") {
    query.program_id = new ObjectId(req.body.program_id);
  }
  if (req.body.project_id !== "all") {
    query.project_id = new ObjectId(req.body.project_id);
  }
  if (req.body.activityName_id !== "all") {
    query.activityName_id = new ObjectId(req.body.activityName_id);
  }
  if (req.body.subactivityName_id !== "all") {
    query.subactivityName_id = new ObjectId(req.body.subactivityName_id);
  }
  // if (req.body.fundingAgencyName !== "all") query.fundingAgencyName = req.body.fundingAgencyName;

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
      // { fundingAgencyName: searchRegex },
    ];
  }

  // console.log("query", query);

  FundReceipt.aggregate([
    {
      $match: query,
    },
    {
      $project: {
        centerName: 1,
        program: 1,
        project: 1,
        activityName: 1,
        subactivityName: 1,
        center_id: 1,
        program_id: 1,
        project_id: 1,
        activityName_id: 1,
        subactivityName_id: 1,
        // fundingAgencyName: 1,
        fundType: 1,
        amountReceived: 1,
        amountReceivedDate: 1,
      },
    },
    {
      $group: {
        _id: {
          centerName: "$centerName",
          program: "$program",
          project: "$project",
          activityName: "$activityName",
          subactivityName: "$subactivityName",
          center_id: "$center_id",
          program_id: "$program_id",
          project_id: "$project_id",
          activityName_id: "$activityName_id",
          subactivityName_id: "$subactivityName_id",
          // fundingAgencyName: "$fundingAgencyName",
        },
        fundReceiptCC: {
          $sum: {
            $cond: [
              { $eq: ["$fundType", "Community Contribution"] },
              "$amountReceived",
              0,
            ],
          },
        },
        // Calculate the sum for External Grant
        fundReceiptExtGrant: {
          $sum: {
            $cond: [
              { $eq: ["$fundType", "External Grant"] },
              "$amountReceived",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        centerName: "$_id.centerName",
        program: "$_id.program",
        project: "$_id.project",
        activityName: "$_id.activityName",
        subactivityName: "$_id.subactivityName",
        center_id: "$_id.center_id",
        program_id: "$_id.program_id",
        project_id: "$_id.project_id",
        activityName_id: "$_id.activityName_id",
        subactivityName_id: "$_id.subactivityName_id",
        // fundingAgencyName :"$_id.fundingAgencyName",
        fundReceiptCC: "$fundReceiptCC",
        fundReceiptExtGrant: "$fundReceiptExtGrant",
      },
    },
    {
      $lookup: {
        from: "utilizationdetails", // Collection to join
        let: {
          subactivityName_id: "$subactivityName_id",
          center_id: "$center_id",
        }, // Local variables
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$subactivityName_id", "$$subactivityName_id"] }, // Match on subactivityName_id
                  { $eq: ["$center_id", "$$center_id"] }, // Match on center_id

                  { $gte: ["$voucherDate", startDate] }, // Greater than or equal to startDate
                  { $lte: ["$voucherDate", endDate] }, // Less than or equal to endDate
                ],
              },
            },
          },
        ],
        as: "utilizationData",
      },
    },
    // {
    //   $unwind: "$utilizationData",
    // },
    {
      $lookup: {
        from: "annualplans",
        let: {
          subactivityName_id: "$subactivityName_id",
          center_id: "$center_id",
          year: financialYear.toString(),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$subactivityName_id", "$$subactivityName_id"] }, // Match on subactivityName_id
                  { $eq: ["$center_id", "$$center_id"] }, // Match on center_id
                  { $eq: ["$year", "$$year"] },
                ],
              },
            },
          },
        ],
        as: "planData",
      },
    },
    // {
    //   $unwind: "$planData",
    // },
    {
      $project: {
        _id: 0,
        centerName: 1,
        program: 1,
        project: 1,
        activityName: 1,
        subactivityName: 1,
        program_id: 1,
        project_id: 1,
        activityName_id: 1,
        subactivityName_id: 1,
        center_id: 1,
        fundReceiptCC: 1,
        fundReceiptExtGrant: 1,

        utilisedAmount: "$utilizationData.totalCost",
        utilisedLHWRF: "$utilizationData.sourceofFund.LHWRF",
        utilisedCC: "$utilizationData.sourceofFund.CC",
        utilisedExtGrant: "$utilizationData.sourceofFund.grant",

        plannedAmount: "$planData.totalCost",
        plannedLHWRF: "$planData.sourceofFund.LHWRF",
        plannedCC: "$planData.sourceofFund.CC",
        plannedExtGrant: "$planData.sourceofFund.grant",
      },
    },

    {
      $project: {
        centerName: "$centerName",
        program: "$program",
        project: "$project",
        activityName: "$activityName",
        subactivityName: "$subactivityName",
        program_id: "$program_id",
        project_id: "$project_id",
        activityName_id: "$activityName_id",
        subactivityName_id: "$subactivityName_id",

        plannedExtGrant: {
          $reduce: {
            input: "$plannedExtGrant",
            initialValue: 0,
            in: { $add: ["$$value", "$$this"] },
          },
        },
        fundReceiptExtGrant: "$fundReceiptExtGrant",
        utilisedExtGrant: {
          $reduce: {
            input: "$utilisedExtGrant",
            initialValue: 0,
            in: { $add: ["$$value", "$$this"] },
          },
        },
        plannedCC: {
          $reduce: {
            input: "$plannedCC",
            initialValue: 0,
            in: { $add: ["$$value", "$$this"] },
          },
        },
        fundReceiptCC: "$fundReceiptCC",
        utilisedCC: {
          $reduce: {
            input: "$utilisedCC",
            initialValue: 0,
            in: { $add: ["$$value", "$$this"] },
          },
        },

        plannedLHWRF: {
          $reduce: {
            input: "$plannedLHWRF",
            initialValue: 0,
            in: { $add: ["$$value", "$$this"] },
          },
        },
        utilisedLHWRF: {
          $reduce: {
            input: "$utilisedLHWRF",
            initialValue: 0,
            in: { $add: ["$$value", "$$this"] },
          },
        },
      },
    },
  ])
    .skip(parseInt(skipRec))
    .limit(parseInt(recsPerPage))
    .then((data) => {
      // console.log("fund_status_report 1", data);
      const totalRecs = data.length;
      var plannedLHWRF = 0;
      var plannedCC = 0;
      var plannedExtGrant = 0;

      var totalfundReceiptLHWRF = 0;
      var totalfundReceiptCC = 0;
      var totalfundReceiptExtGrant = 0;

      var totalUtilisedLHWRF = 0;
      var totalUtilisedCC = 0;
      var totalUtilisedExtGrant = 0;
      for (var index = 0; index < data.length; index++) {
        plannedLHWRF += data[index].plannedLHWRF ? data[index].plannedLHWRF : 0;
        plannedCC += data[index].plannedCC ? data[index].plannedCC : 0;
        plannedExtGrant += data[index].plannedExtGrant
          ? data[index].plannedExtGrant
          : 0;

        totalfundReceiptCC += data[index].fundReceiptCC
          ? data[index].fundReceiptCC
          : 0;
        totalfundReceiptExtGrant += data[index].fundReceiptExtGrant
          ? data[index].fundReceiptExtGrant
          : 0;

        totalUtilisedLHWRF += data[index].utilisedLHWRF
          ? data[index].utilisedLHWRF
          : 0;
        totalUtilisedCC += data[index].utilisedCC ? data[index].utilisedCC : 0;
        totalUtilisedExtGrant += data[index].utilisedExtGrant
          ? data[index].utilisedExtGrant
          : 0;
      }

      if (index >= data.length && data.length > 0) {
        data.push({
          centerName: "Total",
          program: "-",
          project: "-",
          activityName: "-",
          subactivityName: "-",
          program_id: "-",
          project_id: "-",
          activityName_id: "-",
          subactivityName_id: "-",

          plannedExtGrant: plannedExtGrant ? plannedExtGrant : 0,
          fundReceiptExtGrant: totalfundReceiptExtGrant
            ? totalfundReceiptExtGrant
            : 0,
          utilisedExtGrant: totalUtilisedExtGrant ? totalUtilisedExtGrant : 0,

          plannedCC: plannedCC ? plannedCC : 0,
          fundReceiptCC: totalfundReceiptCC ? totalfundReceiptCC : 0,
          utilisedCC: totalUtilisedCC ? totalUtilisedCC : 0,

          plannedLHWRF: plannedLHWRF ? plannedLHWRF : 0,
          utilisedLHWRF: totalUtilisedLHWRF ? totalUtilisedLHWRF : 0,
        });
      }

      // console.log("fund_status_report 2", data);
      res.status(200).json({
        totalRecs: totalRecs,
        tableData: data,
        success: true,
      });
    })
    .catch((error) => {
      console.log("Error in fund  => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};

exports.plantation_report = (req, res, next) => {
  // console.log("plantation_report req.body => ", req.body);

  let query = {};

  if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
    query["plantationDetails.plantationDate"] = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  }

  if (req.body.centerName !== "all") {
    query.centerName = req.body.centerName;
  }
  if (req.body.district !== "all") {
    query["locationDetails.district"] = req.body.district;
  }
  if (req.body.block !== "all") {
    query["locationDetails.block"] = req.body.block;
  }
  if (req.body.speciesName !== "all") {
    query["plantationDetails.speciesDetails.speciesName"] =
      req.body.speciesName;
  }

  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i");
    query.$or = [
      { centerName: searchRegex },
      { project: searchRegex },
      { "locationDetails.district": searchRegex },
      { "locationDetails.block": searchRegex },
      { "locationDetails.village": searchRegex },
      { "plantationDetails.speciesDetails.speciesName": searchRegex },
      { "farmerDetails.farmerName": searchRegex },
      { "locationDetails.gatKasara": searchRegex },
      { "locationDetails.state": searchRegex },
    ];
  }

  // console.log("plantation_report Query => ", query);

  Plantation.find(query)
    .sort({ createdAt: -1 })
    .then((data) => {
      // console.log("plantation_report data => ", data);
      res.status(200).json({
        totalRecs: data.length,
        tableData: data,
        success: true,
      });
    })
    .catch((error) => {
      console.error("Error in plantation report => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};

exports.wrd_report = (req, res, next) => {
  // console.log("req.body", req.body);

  let query = {};

  if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
    query["wrdDetails.constructionDate"] = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  }

  if (req.body.centerName !== "all") query.centerName = req.body.centerName;
  if (req.body.district !== "all")
    query["locationDetails.district"] = req.body.district;
  if (req.body.block !== "all") query["locationDetails.block"] = req.body.block;
  if (req.body.soilType !== "all")
    query["wrdDetails.soilType"] = req.body.soilType;

  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i");
    query.$or = [
      { centerName: searchRegex },
      { project: searchRegex },
      { "locationDetails.district": searchRegex },
      { "locationDetails.block": searchRegex },
      { "locationDetails.village": searchRegex },
      { "wrdDetails.soilType": searchRegex },
      { "farmerDetails.farmerName": searchRegex },
      { "locationDetails.gatKasara": searchRegex },
      { "locationDetails.state": searchRegex },
    ];
  }
  // console.log("WRD Report Query => ", query);

  WRD.find(query)
    .sort({ createdAt: -1 })
    .then((data) => {
      // console.log("Total WRD records found => ", data.length);
      res.status(200).json({
        totalRecs: data.length,
        tableData: data,
        success: true,
      });
    })
    .catch((error) => {
      console.error("Error in wrd report => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};
