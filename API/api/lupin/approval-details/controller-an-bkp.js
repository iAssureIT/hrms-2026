const mongoose = require("mongoose");
const _ = require("underscore");
const moment = require("moment");
const Approval = require("./model.js");


exports.create_approval = (req, res, next) => {
  getData();

  async function getData() {
    try {
      // Determine the current financial year
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      let financialYear;

      if (currentMonth >= 3) { // If current month is April or later
        financialYear = `${currentYear}-${currentYear + 1}`;
      } else { // If current month is January, February, or March
        financialYear = `${currentYear - 1}-${currentYear}`;
      }

      // Extract the first three letters of the centerName
      const centerName = req.body.centerName.toUpperCase();
      const centerCode = centerName.substring(0, 3);

      // Fetch the latest approval number for the current financial year and center
      const lastApproval = await Approval.findOne({ 
        approvalNo: new RegExp(`^${financialYear}/${centerCode}/AP-`) 
      })
      .sort({ approvalNo: -1 })
      .exec();

      let newApprovalNumber = "01"; // Default approval number if no records found

      if (lastApproval) {
        const lastApprovalNo = lastApproval.approvalNo.split('-').pop();
        const lastNumber = parseInt(lastApprovalNo, 10);
        newApprovalNumber = (lastNumber + 1).toString().padStart(2, '0');
      }

      // Construct the new approval number
      const approvalNo = `${financialYear}/${centerCode}/AP-${newApprovalNumber}`;



      // Create new approval
      const approval = new Approval({
        _id: new mongoose.Types.ObjectId(),
        status: req.body.status,
        center_id: req.body.center_id,
        centerName: req.body.centerName,
        approvalDate: req.body.approvalDate,
        approvalNo: approvalNo,
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
        createdBy: req.body.user_id,
        createdAt: new Date(),
      });

      // Save the new approval
      const response = await approval.save();

      res.status(200).json({
        message: "Approval Details submitted Successfully.",
        insertedLevel: response,
        success: true,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    }
  }
};


// exports.create_approval = (req, res, next) => {
//   getData();
//   async function getData() {
//     const approval = new Approval({
//       _id: new mongoose.Types.ObjectId(),
//       status: req.body.status,
//       center_id: req.body.center_id,
//       centerName: req.body.centerName,
//       approvalDate: req.body.approvalDate,
//       approvalNo: approvalNo,
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
//     approval
//       .save()
//       .then((response) => {
//         res.status(200).json({
//           message: "Approval Details submitted Successfully.",
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

exports.update_approval = (req, res, next) => {
  Approval.updateOne(
    { _id: req.body.ID },
    {
      $set: {
        center_id: req.body.center_id,
        centerName: req.body.centerName,
        approvalDate: req.body.approvalDate,
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
      },
    }
  )
    .exec()
    .then((data) => {
      if (data.modifiedCount == 1 || data.modifiedCount == 1) {
        Approval.updateOne(
            { _id:req.body.ID}, 
            {
                $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                            updatedBy      : req.body.user_id 
                                        }] 
                        }
            })
            .exec()
.then(data=>{
        res.status(200).json({
            data, success: true,
            "message": "Approval Details updated Successfully."
        });
    })
    }else{
        res.status(200).json({data,
            success:true,
            "message": "Approval Details not modified"
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

exports.update_approval_status = (req, res, next) => {
  Approval.updateOne(
    { _id: req.body.ID },
    {
      $push: {
        approvalAuthourities: {
          approvalLevel       :req.body.approvalLevel,
          approvalAuthRole    :req.body.approvalAuthRole,
          approvalAuthName    :req.body.approvalAuthName,
          status              :req.body.status,
          remark              :req.body.remark,
          updatedAt           :new Date(),
          updatedBy           :req.body.user_id,
        },
      },
    }
  )
    .exec()
    .then((data) => {
      console.log("data", data);
      // main status of approval is remaining when all level will be approved 
      if (data.modifiedCount == 1) {
        res.status(200).json({
          data,
          success: true,
          message: "Status of Approval Details updated Successfully.",
        });
      } else {
        res.status(200).json({
          message: "Status of Approval Details are not modified",
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
exports.list_approval = (req, res, next) => {
  // var query = "1";
  // if(req.params.center_id === 'all'){
  //     query = {};
  // }else{
  //     query = { "center_id" : req.params.center_id};
  // }
  // if(query != "1"){
  // Approval.find(query)
  Approval.find()
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
exports.list_approval_with_limitsOld = (req, res, next) => {
  var query = "1";
  if (req.params.center_id === "all") {
    query = {};
  } else {
    query = { center_id: req.params.center_id };
  }
  if (query != "1") {
    Approval.find(query)
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

exports.list_approvaldetails_with_limits = (req, res, next) => {
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
    Approval.countDocuments(query)
      .then((totalRecs) => {
        console.log("totalRecs => ", totalRecs);
        Approval.find(query)
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage))
          .then((data) => {
            var approvalData = data.map((item, index) => {
              return {
                _id: item._id,
                center_id: item.center_id ? item.center_id : "all",
                centerName: item.centerName ? item.centerName : "All",
                approvalDate: moment(item.approvalDate).format("DD-MM-YYYY"),
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
            console.log("approvalData", approvalData);
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
  }
};
exports.list_approvaldetails_with_filters = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  var query = {};
  if (req.body.fromDate !== "all" && req.body.toDate !== "all"){
    query.approvalDate = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  }
  
  if (req.body.center_ID !== "all") query.center_id = req.body.center_ID;
  if (req.body.program_id !== "") query.program_id = req.body.program_id;
  if (req.body.project_id !== "") query.project_id = req.body.project_id;
  if (req.body.activityName_id !== "")
    query.activityName_id = req.body.activityName_id;
  if (req.body.subactivityName_id !== "")
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
      console.log("totalRecs => ", totalRecs);
       // Approval.find(query)
      //   .skip(parseInt(skipRec))
      //   .limit(parseInt(recsPerPage))
      let approvalQuery = Approval.find(query);
      if (!req.body.removePagination) {
        approvalQuery = approvalQuery.skip(parseInt(skipRec)).limit(parseInt(recsPerPage));
      }
      approvalQuery
        .sort({ createdAt: -1 })
        .then((data) => {
          var approvalData = data.map((item, index) => {
            return {
              _id: item._id,
              center_id: item.center_id ? item.center_id : "all",
              centerName: item.centerName ? item.centerName : "All",
              approvalDate: moment(item.approvalDate).format("DD-MM-YYYY"),
              approvalNo:item.approvalNo,
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
              status: item.status ? item.status : "-",
            };
          });
          console.log("approvalData", approvalData);
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
exports.fetch_approval = (req, res, next) => {
  Approval.find({ _id: req.params.ID })
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
  // console.log("req.params.ID ",req.params.ID);
  Approval.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      // console.log('data ',data);
      // if(data.deletedCount === 1){
      res.status(200).json({
        deleted: true,
        message: "Approval List deleted Successfully.",
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
