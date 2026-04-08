const mongoose = require("mongoose");
var moment = require("moment");

const Banks = require("./model");
const { response } = require("express");

// exports.create_bank_details = (req, res, next) => {
//   Banks.findOne({ accountHolderName: req.body.accountHolderName })
//     .exec()
//     .then((data) => {
//       if (data) {
//         res.status(200).json({ message: "Bank details already exists" });
//       } else {
//         const centers = new Banks({
//           _id: new mongoose.Types.ObjectId(),
//           // accountHolderName           : req.body.accountHolderName,
//           accountHolderName: req.body.accountHolderName,

//           bankName: req.body.bankName,

//           bankAccountNumber: req.body.bankAccountNumber,

//           branchName: req.body.branchName,
//           // accountType                 : req.body.accountType,
//           ifscCode: req.body.ifscCode,
//           projectRemark: req.body.projectRemark,
//           // branchAddress               : req.body.branchAddress,
//           createdBy: req.body.user_id,
//           createdAt: new Date(),
//         });
//         centers
//           .save()
//           .then((response) => {
//             res.status(200).json({
//               success: true,
//               // insertedLevel: response,
//               message: "Bank Details submitted Successfully.",
//             });
//           })
//           .catch((err) => {
//             console.log(err);
//             res.status(500).json({
//               error: err,
//             });
//           });
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };
exports.create_bank_details = (req, res, next) => {
  Banks.findOne({
    bankName: req.body.bankName,
    branchName: req.body.branchName,
  })
    .exec()
    .then((data) => {
      if (data) {
        res.status(200).json({ message: "Bank and branch already exists" });
      } else {
        const centers = new Banks({
          _id: new mongoose.Types.ObjectId(),
          accountHolderName: req.body.accountHolderName,
          bankName: req.body.bankName,
          bankAccountNumber: req.body.bankAccountNumber,
          branchName: req.body.branchName,
          ifscCode: req.body.ifscCode,
          projectRemark: req.body.projectRemark,
          createdBy: req.body.user_id,
          createdAt: new Date(),
        });
        centers
          .save()
          .then((response) => {
            res.status(200).json({
              success: true,
              message: "Bank Details submitted Successfully.",
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.update_bank_details = (req, res, next) => {
  Banks.updateOne(
    { _id: req.body.ID },
    {
      $set: {
        // accountHolderName           : req.body.accountHolderName,
        accountHolderName: req.body.accountHolderName,
        bankName: req.body.bankName,
        bankAccountNumber: req.body.bankAccountNumber,
        branchName: req.body.branchName,
        // accountType                 : req.body.accountType,
        ifscCode: req.body.ifscCode,
        projectRemark: req.body.projectRemark,
        // branchAddress               : req.body.branchAddress,
      },
    }
  )
    .exec()
    .then((data) => {
      if (data.modifiedCount == 1 || data.modifiedCount == 1) {
        Banks.updateOne(
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
              message: "Bank Details updated Successfully.",
            });
          });
      } else {
        res.status(200).json({
          data,
          success: false,
          message: "Bank Details not modified",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.list_bank_details = (req, res, next) => {
  Banks.find()
    .sort({ accountHolderName: 1 })
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
// exports.list_bank_details_with_limits = (req,res,next)=>{
//     Banks.aggregate([
//                 {
//                     $project : {
//                         accountHolderName           : 1,
//                         // accountHolderName           : 1,
//                         bankName                    : 1,
//                         bankAccountNumber           : 1,
//                         branchName                  : 1,
//                         // accountType                 : 1,
//                         ifscCode                    : 1,
//                         projectRemark               : 1,
//                         // branchAddress               : 1,
//                     }
//                 }
//             ]
//         )
//     .sort({"createdAt":1})
//     .skip(parseInt(req.params.startRange))
//     .limit(parseInt(req.params.limitRange))
//     .exec()
//     .then(data=>{
//         // console.log(" data ",data);
//         res.status(200).json(data);
//     })
//     .catch(err =>{
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// };
exports.fetch_bank_details = (req, res, next) => {
  Banks.find({ _id: req.params.ID })
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

exports.delete_bank_details = (req, res, next) => {
  Banks.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      res.status(200).json({
        message: "Bank Details deleted Successfully.",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.list_bank_details_with_limits = (req, res, next) => {
  // console.log("req.body => ",req.body);

  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  // console.log("Page Number",pageNum)
  let skipRec = recsPerPage * (pageNum - 1);
  let query = {};
  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
    query.$or = [
      { accountHolderName: searchRegex },
      { bankName: searchRegex },
      { branchName: searchRegex },
      { ifscCode: searchRegex },
      { projectRemark: searchRegex },
    ];
  }

  Banks.countDocuments(query)
    .then((totalRecs) => {
      // Banks.find(query)
      //   .skip(parseInt(skipRec))
      //   .limit(parseInt(recsPerPage))

      let banksQuery = Banks.find(query);
      if (!req.body.removePagination) {
        banksQuery = banksQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }
      banksQuery
        .sort({ createdAt: -1 })
        .then((data) => {
          // console.log("data => ",data);
          var returnData = data.map((item, index) => {
            return {
              _id: item._id,
              accountHolderName: item.accountHolderName,

              bankName: item.bankName,

              branchName: item.branchName,
              ifscCode: item.ifscCode,

              bankAccountNumber: item.bankAccountNumber,
              projectRemark: item.projectRemark ? item.projectRemark : "--NA--",
            };
          });
          res.status(200).json({
            totalRecs: totalRecs,
            tableData: returnData,
            success: true,
          });
        })
        .catch((error) => {
          console.log("Error in BanksList  => ", error);
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
