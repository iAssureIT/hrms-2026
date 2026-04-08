// const mongoose = require("mongoose");
// const _ = require("underscore");
// const moment = require("moment");
// const CommunityContribution = require("./model.js");

// exports.create_communityContribution = (req, res, next) => {
//   getData();
//   async function getData() {
//     const communityContribution = new CommunityContribution({
//       _id: new mongoose.Types.ObjectId(),

//       center_id: req.body.center_id,
//       centerName: req.body.centerName,
//       program_id: req.body.program_id,
//       program: req.body.program,
//       project_id: req.body.project_id,
//       project: req.body.project,
//       activityName_id: req.body.activityName_id,
//       activityName: req.body.activityName,
//       subactivityName_id: req.body.subactivityName_id,
//       subactivityName: req.body.subactivityName,
//       ccReceiptNumber: req.body.ccReceiptNumber,
//       ccReceived: req.body.ccReceived,
//       paymentDate: req.body.paymentDate,
//       paymentType: req.body.paymentType,
//       utrTransactionNumber: req.body.utrTransactionNumber,
//       depositorSlipNumber: req.body.depositorSlipNumber,
//       lhwrfBankName: req.body.lhwrfBankName,
//       lhwrfBranchName: req.body.lhwrfBranchName,
//       lhwrfAccountNumber: req.body.lhwrfAccountNumber,
//       totalAmountDeposited: req.body.totalAmountDeposited,
//       beneficiaryDetails: req.body.beneficiaryDetails,

//       //   sourceofFund: {
//       //     LHWRF: req.body.LHWRF,
//       //     grant: req.body.grant,
//       //     CC: req.body.CC,
//       //     total: req.body.total,
//       //     convergence: req.body.convergence,
//       //   },
//       createdBy: req.body.createdBy,
//       createdAt: new Date(),
//     });
//     communityContribution
//       .save()
//       .then((response) => {
//         res.status(200).json({
//           message: "Community Contribution Details submitted Successfully.",
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

// exports.update_communityContribution = (req, res, next) => {
//   CommunityContribution.updateOne(
//     { _id: req.body.ID },
//     {
//       $set: {
//         center_id: req.body.center_id,
//         centerName: req.body.centerName,
//         program_id: req.body.program_id,
//         program: req.body.program,
//         project_id: req.body.project_id,
//         project: req.body.project,
//         activityName_id: req.body.activityName_id,
//         activityName: req.body.activityName,
//         subactivityName_id: req.body.subactivityName_id,
//         subactivityName: req.body.subactivityName,
//         ccReceiptNumber: req.body.ccReceiptNumber,
//         ccReceived: req.body.ccReceived,
//         paymentDate: req.body.paymentDate,
//         paymentType: req.body.paymentType,
//         utrTransactionNumber: req.body.utrTransactionNumber,
//         depositorSlipNumber: req.body.depositorSlipNumber,
//         lhwrfBankName: req.body.lhwrfBankName,
//         lhwrfBranchName: req.body.lhwrfBranchName,
//         lhwrfAccountNumber: req.body.lhwrfAccountNumber,
//         totalAmountDeposited: req.body.totalAmountDeposited,
//         beneficiaryDetails: req.body.beneficiaryDetails,
//         // sourceofFund: {
//         //   LHWRF: req.body.LHWRF,
//         //   grant: req.body.grant,
//         //   CC: req.body.CC,
//         //   total: req.body.total,
//         //   convergence: req.body.convergence,
//         // },
//       },
//     }
//   )
//     .exec()
//     .then((data) => {
//       // if(data.modifiedCount == 1){
//       res.status(200).json({
//         data,
//         success: true,
//         message: "Commmunity Contribution Details updated Successfully.",
//       });
//       // }else{
//       // res.status(200).json({
//       //     "message": "AnnualPlan Details not modified"
//       // });
//       // }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };

// exports.list_communityContribution = (req, res, next) => {
//   // var query = "1";
//   // if(req.params.center_id === 'all'){
//   //     query = {};
//   // }else{
//   //     query = { "center_id" : req.params.center_id};
//   // }
//   // if(query != "1"){
//   // AnnualPlan.find(query)
//   CommunityContribution.find()
//     // .exec()
//     .then((data) => {
//       res.status(200).json(data);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
//   // }
// };
// exports.list_communityContribution_with_limitsOld = (req, res, next) => {
//   var query = "1";
//   if (req.params.center_id === "all") {
//     query = {};
//   } else {
//     query = { center_id: req.params.center_id };
//   }
//   if (query != "1") {
//     CommunityContribution.find(query)
//       .sort({ createdAt: -1 })
//       .exec()
//       .then((data) => {
//         if (data) {
//           res
//             .status(200)
//             .json(data.slice(req.body.startRange, req.body.limitRange));
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//           error: err,
//         });
//       });
//   }
// };

// exports.list_communityContribution_with_limits = (req, res, next) => {
//   let recsPerPage = req.params.recsPerPage;
//   let pageNum = req.params.pageNumber;
//   let skipRec = recsPerPage * (pageNum - 1);
//   var query = "1";
//   if (req.body.center_ID === "all") {
//     query = {};
//   } else {
//     query = { center_id: req.body.center_ID };
//   }
//   console.log(
//     "Page Number",
//     pageNum,
//     "query",
//     query,
//     "req.body",
//     req.body.center_ID
//   );

//   if (query != "1") {
//     CommunityContribution.estimatedDocumentCount(query)
//       .then((totalRecs) => {
//         console.log("totalRecs => ", totalRecs);
//         CommunityContribution.find(query)
//           .skip(parseInt(skipRec))
//           .limit(parseInt(recsPerPage))
//           .then((data) => {
//             var ccData = data.map((item, index) => {
//               return {
//                 _id: item._id,
//                 center_id: item.center_id ? item.center_id : "all",
//                 centerName: item.centerName ? item.centerName : "All",
//                 program_id: item.program_id,
//                 program: item.program,
//                 project_id: item.project_id,
//                 project: item.project,
//                 activityName_id: item.activityName_id,
//                 activityName: item.activityName,
//                 subactivityName_id: item.subactivityName_id,
//                 subactivityName: item.subactivityName,
//                 ccReceiptNumber: item.ccReceiptNumber,
//                 ccReceived: item.ccReceived,
//                 paymentDate: item.paymentDate,
//                 paymentType: item.paymentType,
//                 utrTransactionNumber: item.utrTransactionNumber,
//                 depositorSlipNumber: item.depositorSlipNumber,
//                 lhwrfBankName: item.lhwrfBankName,
//                 lhwrfBranchName: item.lhwrfBranchName,
//                 lhwrfAccountNumber: item.lhwrfAccountNumber,
//                 totalAmountDeposited: item.totalAmountDeposited,
//                 beneficiaryDetails: item.beneficiaryDetails,
//               };
//             });
//             console.log("grantData", ccData);
//             res.status(200).json({
//               totalRecs: totalRecs,
//               tableData: ccData,
//               success: true,
//             });
//           })
//           .catch((error) => {
//             console.log("Error in CC List  => ", error);
//             res.status(500).json({ errorMsg: error.message, success: false });
//           });
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//           error: err,
//         });
//       });
//   }
// };

// exports.fetch_communityContribution = (req, res, next) => {
//   CommunityContribution.find({ _id: req.params.ID })
//     .exec()
//     .then((data) => {
//       res.status(200).json(data);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };

// exports.delete_communityContribution = (req, res, next) => {
//   // console.log("req.params.ID ",req.params.ID);
//   CommunityContribution.deleteOne({ _id: req.params.ID })
//     .exec()
//     .then((data) => {
//       // console.log('data ',data);
//       // if(data.deletedCount === 1){
//       res.status(200).json({
//         deleted: true,
//         message: "CC List deleted Successfully.",
//       });
//       // }else{
//       //    res.status(200).json({ deleted : false });
//       // }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };
