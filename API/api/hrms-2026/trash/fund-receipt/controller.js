const mongoose = require("mongoose");
const _ = require("underscore");
const moment = require("moment");
const Fund = require("./model.js");

exports.create_external_grant = (req, res, next) => {
  getData();
  async function getData() {
    const fund = new Fund({
      _id: new mongoose.Types.ObjectId(),

      // fundType: req.body.fundType,
      // paymentType: req.body.paymentType,
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
      fundingAgencyName: req.body.fundingAgencyName,
      fundReceiptNumber: req.body.fundReceiptNumber,
      amountReceivedDate: req.body.amountReceivedDate,
      amountReceived: req.body.amountReceived,
      utrTransactionNumber: req.body.utrTransactionNumber,
      lhwrfBankName: req.body.lhwrfBankName,
      branchName: req.body.branchName,
      accountNumber: req.body.accountNumber,
      createdBy: req.body.createdBy,
      createdAt: new Date(),
    });
    fund
      .save()
      .then((response) => {
        res.status(200).json({
          message: "Fund Details submitted Successfully.",
          insertedLevel: response,
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

exports.update_external_grant = (req, res, next) => {
  Fund.updateOne(
    { _id: req.body.ID },
    {
      $set: {
        // fundType: req.body.fundType,
        // paymentType: req.body.paymentType,
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
        fundingAgencyName: req.body.fundingAgencyName,
        fundReceiptNumber: req.body.fundReceiptNumber,
        amountReceivedDate: req.body.amountReceivedDate,
        amountReceived: req.body.amountReceived,
        utrTransactionNumber: req.body.utrTransactionNumber,
        lhwrfBankName: req.body.lhwrfBankName,
        branchName: req.body.branchName,
        accountNumber: req.body.accountNumber,
      },
    }
  )
    .exec()
    .then((data) => {
      // if(data.modifiedCount == 1){
      res.status(200).json({
        data,
        success: true,
        message: "Fund Details updated Successfully.",
      });
      // }else{
      // res.status(200).json({
      //     "message": "AnnualPlan Details not modified"
      // });
      // }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.list_external_grant = (req, res, next) => {
  // var query = "1";
  // if(req.params.center_id === 'all'){
  //     query = {};
  // }else{
  //     query = { "center_id" : req.params.center_id};
  // }
  // if(query != "1"){
  // AnnualPlan.find(query)
  Fund.find()
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
exports.list_external_grant_with_limitsOld = (req, res, next) => {
  var query = "1";
  if (req.params.center_id === "all") {
    query = {};
  } else {
    query = { center_id: req.params.center_id };
  }
  if (query != "1") {
    Fund.find(query)
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

exports.list_external_grant_with_limits = (req, res, next) => {
  let recsPerPage = req.params.recsPerPage;
  let pageNum = req.params.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  if (req.body.center_ID === "all") {
    query = {};
  } else {
    query = { center_id: req.body.center_ID };
  }
  console.log(
    "Page Number",
    pageNum,
    "query",
    query,
    "req.body",
    req.body.center_ID
  );

  if (query != "1") {
    Fund.estimatedDocumentCount(query)
      .then((totalRecs) => {
        console.log("totalRecs => ", totalRecs);
        Fund.find(query)
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage))
          .then((data) => {
            var fundData = data.map((item, index) => {
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
                lhwrfBankName: item.lhwrfBankName,
                branchName: item.branchName,
                accountNumber: item.accountNumber,
              };
            });
            console.log("fundData", fundData);
            res.status(200).json({
              totalRecs: totalRecs,
              tableData: fundData,
              success: true,
            });
          })
          .catch((error) => {
            console.log("Error in fundList  => ", error);
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

exports.fetch_external_grant = (req, res, next) => {
  Fund.find({ _id: req.params.ID })
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

exports.delete_external_grant = (req, res, next) => {
  // console.log("req.params.ID ",req.params.ID);
  Fund.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      // console.log('data ',data);
      // if(data.deletedCount === 1){
      res.status(200).json({
        deleted: true,
        message: "Fund List deleted Successfully.",
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
