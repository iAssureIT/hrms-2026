const mongoose = require("mongoose");
// var moment              = require('moment');

const ApprovalLevels = require("./model.js");
const { response } = require("express");

exports.create_approval = (req, res, next) => {
  ApprovalLevels.findOne({
    approverLevel: req.body.approverLevel,
    maxCost: req.body.maxCost,
    approverAuthRole: req.body.approverAuthRole,
  })
    .exec()
    .then((data) => {
      if (data) {
        res.status(200).json({ message: "Data already exists" });
      } else {
        const approvals = new ApprovalLevels({
          _id: new mongoose.Types.ObjectId(),
          approverLevel: req.body.approverLevel,
          maxCost: req.body.maxCost,
          approverAuthRole: req.body.approverAuthRole,
          createdBy: req.body.user_id,
          createdAt: new Date(),
          // approverAuth_id           : req.body.approverAuth_id,
        });
        approvals
          .save()
          .then((response) => {
            res.status(200).json({
              insertedLevel: response,
              success: true,
              message: "Approval Level submitted Successfully.",
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
              success: false,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
};

// };
exports.update_approval = (req, res, next) => {
  ApprovalLevels.updateOne(
    { _id: req.body.ID },
    {
      $set: {
        // approverLevel           : req.body.approverLevel,
        approverLevel: req.body.approverLevel,
        maxCost: req.body.maxCost,
        approverAuthRole: req.body.approverAuthRole,
        // "approverAuth_id"           : req.body.approverAuth_id,
        // branchName                  : req.body.branchName,
        // accountType                 : req.body.accountType,
        // ifscCode                    : req.body.ifscCode,
        // branchAddress               : req.body.branchAddress,
      },
    }
  )
    // .exec()
    .then((data) => {
      if (data.modifiedCount == 1 || data.modifiedCount == 1) {
        ApprovalLevels.updateOne(
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
            // res.status(200).json({ updated : true });
            res.status(200).json({
              data,
              success: true,
              message: "Approval Level updated Successfully.",
            });
          });
      } else {
        // res.status(200).json({ updated : false });
        res.status(200).json({
          data,
          success: false,
          message: "Approval Level are not modified.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
        success: false,
      });
    });
};

exports.list_approval = (req, res, next) => {
  ApprovalLevels.find()
    .sort({ approverLevel: 1 })
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
exports.fetch_approval = (req, res, next) => {
  ApprovalLevels.find({ _id: req.params.ID })
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

exports.delete_approval = (req, res, next) => {
  ApprovalLevels.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      res.status(200).json({
        message: "Approval Level deleted Successfully.",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

// function addCommas(x) {
//     x=x.toString();
//     if(x.includes('%')){
//         return x;
//     }else{
//       if(x.includes('.')){
//         var pointN = x.split('.')[1];
//         var lastN = x.split('.')[0];
//         var lastThree = lastN.substring(lastN.length-3);
//         var otherNumbers = lastN.substring(0,lastN.length-3);
//         if(otherNumbers !== '')
//             lastThree = ',' + lastThree;
//         var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree+"."+pointN;
//         // console.log("x",x,"lastN",lastN,"lastThree",lastThree,"otherNumbers",otherNumbers,"res",res)
//         return(res);
//       }else{
//         var lastThree = x.substring(x.length-3);
//         var otherNumbers = x.substring(0,x.length-3);
//         if(otherNumbers !== '')
//             lastThree = ',' + lastThree;
//         var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
//         // console.log("lastThree",lastThree,"otherNumbers",otherNumbers,"res",res);
//         return(res);
//       }
//     }
// }

// exports.list_approval_with_limits = (req, res, next) => {
//   let recsPerPage = req.body.recsPerPage;
//   let pageNum = req.body.pageNumber;
//   console.log("Page Number", pageNum);
//   let skipRec = recsPerPage * (pageNum - 1);
//   let query = {};

//   if (req.body.searchText) {
//     const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
//     query.$or = [
//       { approverLevel: searchRegex },
//       // { maxCost: searchRegex },
//       { approverAuthRole: searchRegex },
//     ];
//   }

//   ApprovalLevels.estimatedDocumentCount(query)
//     .then((totalRecs) => {
//       console.log("totalRecs => ", totalRecs);
//       ApprovalLevels.find(query)
//         .sort({ createdAt: -1 })
//         .skip(parseInt(skipRec))
//         .limit(parseInt(recsPerPage))
//         .then((data) => {
//           var returnData = data.map((item, index) => {
//             // Function to format maxCost
//             const formatMaxCost = (cost) => {
//               if (cost >= 100000) {
//                 return (
//                   (cost / 100000).toFixed(cost % 100000 !== 0 ? 1 : 0) + "L"
//                 );
//               } else if (cost >= 1000) {
//                 return (cost / 1000).toFixed(cost % 1000 !== 0 ? 1 : 0) + "k";
//               } else {
//                 return cost.toString();
//               }
//             };

//             var maxCost = formatMaxCost(item.maxCost);
//             return {
//               _id: item._id,
//               approverLevel: item.approverLevel,
//               maxCost: maxCost,
//               approverAuthRole: item.approverAuthRole,
//             };
//           });
//           console.log("returnData", returnData);
//           res.status(200).json({
//             totalRecs: totalRecs,
//             tableData: returnData,
//             success: true,
//           });
//         })
//         .catch((error) => {
//           console.log("Error in ApprovalLevelsList => ", error);
//           res.status(500).json({ errorMsg: error.message, success: false });
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };

exports.list_approval_with_limits = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  let query = {};

  if (req.body.searchText) {
    const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
    query.$or = [
      { approverLevel: searchRegex },
      // { maxCost: searchRegex },
      { approverAuthRole: searchRegex },
    ];
  }

  ApprovalLevels.countDocuments(query)
    .then((totalRecs) => {
      // ApprovalLevels.find(query)
      //   .skip(parseInt(skipRec))
      //   .limit(parseInt(recsPerPage))

      let approvalLevelsQuery = ApprovalLevels.find(query);
      if (!req.body.removePagination) {
        approvalLevelsQuery = approvalLevelsQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }
      approvalLevelsQuery
        .sort({ approverLevel: 1 })
        // .sort({ createdAt: -1 })
        .then((data) => {
          // Find Level-3 maxCost
          const level3Item = data.find(
            (item) => item.approverLevel === "Level-3"
          );
          const level3MaxCost = level3Item ? level3Item.maxCost : 0;
          const formattedLevel3MaxCost = formatMaxCost(level3MaxCost);

          const returnData = data.map((item) => {
            // Function to format maxCost
            const formatMaxCost = (cost) => {
              if (cost >= 100000) {
                return (
                  (cost / 100000).toFixed(cost % 100000 !== 0 ? 1 : 0) + "L"
                );
              } else if (cost >= 1000) {
                return (cost / 1000).toFixed(cost % 1000 !== 0 ? 1 : 0) + "k";
              } else {
                return cost.toString();
              }
            };

            let maxCost = "";
            if (item.approverLevel === "Level-4") {
              maxCost = `above ${formattedLevel3MaxCost}`;
            } else {
              maxCost = `upto ${formatMaxCost(item.maxCost)}`;
            }

            return {
              _id: item._id,
              approverLevel: item.approverLevel,
              maxCost: maxCost ? maxCost : 0,
              approverAuthRole: item.approverAuthRole,
            };
          });

          res.status(200).json({
            totalRecs: totalRecs,
            tableData: returnData,
            success: true,
          });
        })
        .catch((error) => {
          res.status(500).json({ errorMsg: error.message, success: false });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });

  // Function to format maxCost
  const formatMaxCost = (cost) => {
    if (cost >= 100000) {
      return (cost / 100000).toFixed(cost % 100000 !== 0 ? 1 : 0) + "L";
    } else if (cost >= 1000) {
      return (cost / 1000).toFixed(cost % 1000 !== 0 ? 1 : 0) + "k";
    } else {
      return cost.toString();
    }
  };
};

// exports.list_approval_with_limits = (req,res,next)=>{

//     let recsPerPage       = req.body.recsPerPage;
//     let pageNum           = req.body.pageNumber;
//     console.log("Page Number",pageNum)
//     let skipRec = recsPerPage * (pageNum-1);
//     let query = {};
//   if (req.body.searchText) {
//     const searchRegex = new RegExp(req.body.searchText, 'i'); // 'i' for case-insensitive
//     query.$or = [
//         { approverLevel: searchRegex },
//         { maxCost: searchRegex },
//         { approverAuthDesignation: searchRegex },

//     ];
// }

//     ApprovalLevels.estimatedDocumentCount(query)
//     .then(totalRecs =>{
//         console.log("totalRecs => ",totalRecs);
//         ApprovalLevels.find()
//         .sort({ createdAt: -1 })
//         .skip(parseInt(skipRec))
//         .limit(parseInt(recsPerPage))
//         .then(data => {

//             var returnData= data.map((item,index)=>{
//                 // console.log("item",item)
//                 // var maxCost =   addCommas(item.maxCost);
//                 // console.log("maxCost",maxCost)
//                 return {
//                     _id		                    : item._id,
//                     approverLevel               : item.approverLevel,
//                     maxCost                     : item.maxCost,
//                     approverAuthDesignation            : item.approverAuthDesignation,
//                 }
//             })
//             console.log("returnData",returnData)
//             res.status(200).json({
//                 totalRecs   : totalRecs,
//                 tableData   : returnData,
//                 success     : true
//             });
//         })
//         .catch(error=>{
//             console.log("Error in ApprovalLevelsList  => ", error);
//             res.status(500).json({errorMsg: error.message, success: false});
//         })

//     })
//     .catch(err =>{
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// };
