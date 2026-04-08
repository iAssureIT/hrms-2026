const mongoose = require("mongoose");
var moment = require("moment");

const Centers = require("./model");
// const Subactivity = require("../SubactivityMapping/model.js");
const FailedRecords = require("../failedRecords/model.js");

exports.create_centers = (req, res, next) => {
  Centers.findOne({ centerName: req.body.centerName })
    .exec()
    .then((data) => {
      if (data) {
        res.status(409).json({ message: "Center already exists" });
      } else {
        const centers = new Centers({
          _id: new mongoose.Types.ObjectId(),
          centerName: req.body.centerName,
          address: {
            addressLine: req.body.addressLine,
            district: req.body.district,
            state: req.body.state,
            pincode: req.body.pincode,
          },
          centerInchargeDetails: {
            Name: "",
            mobileNumber: "",
            email: "",
          },
          seniorManagerDetails: {
            Name: "",
            mobileNumber: "",
            email: "",
          },
          accountPersonDetails: {
            Name: "",
            mobileNumber: "",
            email: "",
          },
          onRoll: req.body.onRoll,
          thirdParty: req.body.thirdParty,
          totalEmp: req.body.totalEmp,
          assetManagementCenterCode: req.body.assetManagementCenterCode,
          createdBy: req.body.user_id,
          createdAt: new Date(),
        });
        centers
          .save()
          .then((data) => {
            res.status(200).json({
              message: "Center Details submitted Successfully.",
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

exports.bulkUpload_Geographical_Data = (req, res, next) => {
  console.log("req.body.data", req.body);
  var excelData = req.body.data;
  var validData = [];
  var validObjects = [];
  var invalidData = [];
  var invalidObjects = {};
  var remark = "";
  var failedRecords = [];
  var Count = 0;
  var DuplicateCount = 0;
  const fileName = req.body.fileName;
  const createdBy = req.body.createdBy;

  processData();
  async function processData() {
    try {
      for (var k = 0; k < excelData.length; k++) {
        let remark = "";

        // Validations
        if (excelData[k].centerName === "-") remark += " Center Name not found";
        if (excelData[k].village === "-") remark += " Village not found";
        if (excelData[k].block === "-") remark += " Block not found";
        if (excelData[k].district === "-") remark += " District not found";
        if (excelData[k].state === "-") remark += " State not found";
        if (remark === "") {
          // Find center
          const center = await Centers.findOne({
            centerName: excelData[k].centerName.trim(),
          });
          if (!center) {
            remark += " Center not found in master data.";
            invalidObjects = excelData[k];
            invalidObjects.failedRemark = remark;
            invalidData.push(invalidObjects);
          } else {
            // Check if village already exists in villagesCovered
            const existingVillage = center.villagesCovered.find(
              (village) =>
                village.village === excelData[k].village &&
                village.block === excelData[k].block &&
                village.district === excelData[k].district &&
                village.state === excelData[k].state,
            );

            if (existingVillage) {
              remark += " Village Location details already exist.";
              invalidObjects = excelData[k];
              invalidObjects.failedRemark = remark;
              invalidData.push(invalidObjects);
            } else {
              validData.push({
                village: excelData[k].village,
                block: excelData[k].block,
                district: excelData[k].district,
                state: excelData[k].state,
                fileName,
                createdBy,
                createdAt: new Date(),
              });
            }
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
        console.log("remark", k, remark);

        remark = "";
      }
      console.log("validData.length", validData.length);
      // Update Centers collection with validData
      if (validData.length > 0) {
        await Centers.updateMany(
          { centerName: req.body.data[0].centerName },
          { $push: { villagesCovered: { $each: validData } } },
        );
      }

      // Insert failed records if any
      if (invalidData.length > 0) {
        failedRecords.FailedRecords = invalidData;
        failedRecords.fileName = fileName;
        failedRecords.totalRecords = invalidData.length;
        await insertFailedRecords(failedRecords, req.body.updateBadData);
      }

      res.status(200).json({
        message: "Bulk upload process completed successfully!",
        failedRecords: invalidData,
        goodRecords: validData,
        completed: true,
      });
    } catch (error) {
      console.error("Error in bulk upload:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  }
};

var getAllCenters = async () => {
  return new Promise(function (resolve, reject) {
    Centers.find()
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
                { $set: { failedRecords: [] } },
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
                      },
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
                },
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
              },
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
    Centers.deleteMany({ fileName: fileName })
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
  Centers.find({ fileName: req.params.fileName })
    .exec()
    .then((data) => {
      //finaldata.push({goodrecords: data})
      finaldata.goodrecords = data.villagesCovered;
      finaldata.totalRecords = data.length;
      FailedRecords.find({ fileName: req.params.fileName })
        .exec()
        .then((badData) => {
          finaldata.failedRecords =
            badData.length > 0 ? badData[0].failedRecords : [];
          finaldata.totalRecords = badData[0].totalRecords;
          console.log("filedetails finaldata=======>", finaldata);
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

exports.update_centers = (req, res, next) => {
  console.log("Request Body:", req.body); // Log request body for debugging
  Centers.updateOne(
    { _id: req.body.center_ID },
    {
      $set: {
        centerName: req.body.centerName,
        "address.addressLine": req.body.addressLine,
        "address.district": req.body.district,
        "address.block": req.body.block,
        "address.village": req.body.village,
        "address.state": req.body.state,
        "address.pincode": req.body.pincode,
        "centerInchargeDetails.centerInchargeName": req.body.centerInchargeName,
        "centerInchargeDetails.mobileNumber": req.body.mobileNumber,
        "centerInchargeDetails.email": req.body.email,
        seniorManager: req.body.seniorManager,
        seniorManagerMobile: req.body.seniorManagerMobile,
        seniorManagerEmail: req.body.seniorManagerEmail,
        accountPerson: req.body.accountPerson,
        accountPersonMobile: req.body.accountPersonMobile,
        accountPersonEmail: req.body.accountPersonEmail,
        onRoll: req.body.onRoll,
        thirdParty: req.body.thirdParty,
        totalEmp: req.body.totalEmp,
        assetManagementCenterCode: req.body.assetManagementCenterCode,
      },
    },
  )
    .exec()
    .then((data) => {
      // console.log("Update Result:", data); // Log the result of the update operation
      if (data.modifiedCount == 1 || data.modifiedCount == 1) {
        Centers.updateOne(
          { _id: req.body.center_ID },
          {
            $push: {
              updateLog: [
                { updatedAt: new Date(), updatedBy: req.body.user_id },
              ],
            },
          },
        )
          .exec()
          .then((data) => {
            res.status(200).json({
              data,
              success: true,
              message: "Center Details updated Successfully.",
            });
          });
      } else {
        res.status(200).json({
          data,
          success: false,
          message: "Center Details not modified",
        });
      }
    })
    .catch((err) => {
      console.log("Update Error:", err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.add_center_incharge = (req, res, next) => {
  console.log("Request Body:", req.body); // Log request body for debugging
  Centers.findOne({ _id: req.body.center_ID })
    .then((centerData) => {
      let updateLog = centerData.updateLog;
      updateLog.push({
        updatedAt: new Date(),
        updatedBy: req.body.user_id,
      });
      Centers.updateOne(
        { _id: req.body.center_ID },
        {
          $set: {
            "centerInchargeDetails.Name": req.body.centerInchargeName,
            "centerInchargeDetails.mobileNumber":
              req.body.centerInchargeMobileNumber,
            "centerInchargeDetails.email": req.body.centerInchargeEmail,

            "seniorManagerDetails.Name": req.body.seniorManagerName,
            "seniorManagerDetails.mobileNumber":
              req.body.seniorManagerMobileNumber,
            "seniorManagerDetails.email": req.body.seniorManagerEmail,

            "accountPersonDetails.Name": req.body.accountPersonName,
            "accountPersonDetails.mobileNumber":
              req.body.accountPersonMobileNumber,
            "accountPersonDetails.email": req.body.accountPersonEmail,
            updateLog: updateLog,
          },
        },
      )
        .then((data) => {
          // console.log("data => ",data);
          if (data.modifiedCount == 1) {
            res.status(200).json({
              data,
              success: true,
              message: "Center Details updated Successfully.",
            });
          } else {
            res.status(200).json({
              data,
              success: false,
              message: "Center Details not modified",
            });
          }
        })
        .catch((err) => {
          console.log("Update Error:", err);
          res.status(500).json({
            error: err.message,
            success: false,
          });
        });
    })
    .catch((err) => {
      console.log("Find Error:", err);
      res.status(500).json({
        error: err.message,
        success: false,
      });
    });
};

exports.list_centers = (req, res, next) => {
  Centers.find()
    .sort({ centerName: 1 })
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
exports.list_centers_with_limits = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  // console.log("Page Number", pageNum);
  let skipRec = recsPerPage * (pageNum - 1);
  let query = {};
  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
    query.$or = [
      { centerName: searchRegex },
      { "seniorManagerDetails.Name": searchRegex },
      { "seniorManagerDetails.Email": searchRegex },
    ];
  }

  Centers.countDocuments(query)
    .then((totalRecs) => {
      console.log("totalRecs => ", totalRecs);
      let centersQuery = Centers.find(query);
      if (!req.body.removePagination) {
        centersQuery = centersQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }
      centersQuery
        .sort({ createdAt: -1 })
        .then((data) => {
          var centerdata = data.map((center, index) => {
            // console.log("center => ",center)
            return {
              _id: center._id,
              centerName: center?.centerName,
              address:
                center?.address?.addressLine +
                ", " +
                center?.address?.district +
                ", " +
                center?.address?.state +
                ", " +
                center?.address?.pincode,

              centerInchargeName: center.centerInchargeDetails.Name
                ? center.centerInchargeDetails.Name
                : "-NA-",
              centerInchargeMobile: center.centerInchargeDetails.mobileNumber
                ? center.centerInchargeDetails.mobileNumber
                : "-NA-",
              centerInchargeEmail: center.centerInchargeDetails.email
                ? center.centerInchargeDetails.email
                : "-NA-",

              seniorManagerName: center.seniorManagerDetails.Name
                ? center.seniorManagerDetails.Name
                : "-NA-",
              seniorManagerMobile: center.seniorManagerDetails.mobileNumber
                ? center.seniorManagerDetails.mobileNumber
                : "-NA-",
              seniorManagerEmail: center.seniorManagerDetails.email
                ? center.seniorManagerDetails.email
                : "-NA-",

              accountPersonName: center.accountPersonDetails.Name
                ? center.accountPersonDetails.Name
                : "-NA-",
              accountPersonMobile: center.accountPersonDetails.mobileNumber
                ? center.accountPersonDetails.mobileNumber
                : "-NA-",
              accountPersonEmail: center.accountPersonDetails.email
                ? center.accountPersonDetails.email
                : "-NA-",

              onRoll: center?.onRoll,
              thirdParty: center?.thirdParty,
              totalEmp: center?.totalEmp,
              assetManagementCenterCode: center?.assetManagementCenterCode,
            };
          });
          res.status(200).json({
            totalRecs: totalRecs,
            tableData: centerdata,
            success: true,
          });
        })
        .catch((error) => {
          console.log("Error in ApprovalLevelsList  => ", error);
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

exports.fetch_centers = (req, res, next) => {
  Centers.find({ _id: req.params.centerID })
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

exports.fetch_centers_by_SM = (req, res, next) => {
  //fetch_centers_by_senior_manger
  Centers.find({ "seniorManagerDetails.user_id": req.params.user_id })
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

exports.fetch_center_by_name = (req, res, next) => {
  Centers.findOne({ centerName: req.params.centerName })
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
exports.fetch_center_by_names = (req, res, next) => {
  const centerName = req.params.centerName;
  Centers.findOne({
    centerName: {
      $regex: new RegExp("^" + centerName.trim() + "$", "i"),
    },
  })
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
exports.delete_center = (req, res, next) => {
  Centers.deleteOne({ _id: req.params.centerID })
    .exec()
    .then((data) => {
      res.status(200).json({
        message: "Center Details deleted Successfully.",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
exports.mailIfMonthlyPlanNotFilled = (req, res, next) => {
  // var now = new Date("2019-12-25");
  var now = new Date();
  // console.log("now ",now);
  var nextMonth = now.getMonth() + 1;
  var year = now.getFullYear();
  var month = "";
  // var current = now.getMonth()+1;
  if (nextMonth >= 12) {
    year = year + 1;
    month = moment(new Date(year, nextMonth)).format("MMMM");
  } else {
    month = moment(new Date(year, nextMonth)).format("MMMM");
  }
  year = year.toString();
  // console.log("Month ",month," Year ",year);
  // res.status(200).json({"Date":now,"Next Month":nextMonth,"Month":month,"Year":year});

  if (req.body.securityPass === "Lupin123") {
    Centers.aggregate([
      { $addFields: { article_id: { $toString: "$_id" } } },
      {
        $lookup: {
          from: "monthlyplans",
          localField: "article_id",
          foreignField: "center_ID",
          as: "monthlyplans",
        },
      },
      {
        $unwind: "$monthlyplans",
      },
      {
        $match: {
          $and: [
            { "monthlyplans.month": month },
            { "monthlyplans.year": year },
          ],
        },
      },
    ])
      .then((data) => {
        if (data) {
          console.log("length ", data.length);
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        console.log("Failed while fatching center data");
        res.status(500).json({ error: err.message });
      });
  } else {
    res.status(200).json("Invalid Operation");
  }
};
