const Activity = require("./model.js");
const mongoose = require("mongoose");
const FailedRecords = require("../../failedRecords/model.js");
// const SubactivityMapping = require("../../SubactivityMapping/model.js");
// const AnnualPlan = require("../../annual-plan/model.js");
// const Approval = require("../../approval-details/model.js");
// const Utilization = require("../../utilization-details/model.js");
// const FundManagement = require("../../fund-management/model.js");
// const Plantation = require("../../plantation/model.js");
// const WRD = require("../../wrd/model.js");

exports.createActivity = async (req, res) => {
    try {
        // Check if an activity with the same fieldValue and fieldName already exists
        const existingActivitiy = await Activity.findOne({
            fieldValue: req.body.fieldValue,
        });

        if (existingActivitiy) {
            // If the activity already exists, send a response indicating duplication
            return res.status(409).json({ message: "Activity already exists" });
        }
        const activity = new Activity({
            _id: new mongoose.Types.ObjectId(),
            fieldValue: req.body.fieldValue,
            createdBy: req.body.user_id,
            // imageName: req.body.imageName,
            // imageUrl: req.body.imageUrl,
        });

        const result = await activity.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getActivity = async (req, res) => {
    try {
        const activitys = await Activity.find();
        res.status(200).json(activitys);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getActivityData = async (req, res) => {
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    // console.log("req.body => ", req.body);

    Activity.countDocuments()
        .then((totalRecs) => {
            // console.log("totalRecs => ", totalRecs);
            Activity.find()
                .skip(parseInt(skipRec))
                .limit(parseInt(recsPerPage))
                .sort({ createdAt: -1 })
                .then((data) => {
                    res.status(200).json({
                        totalRecs: totalRecs,
                        tableData: data,
                        success: true,
                    });
                })
                .catch((error) => {
                    // console.log("Error 1  => ", error);
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
exports.updateActivity = async (req, res) => {
    // console.log(req.body);
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ error: "Activity not found" });
        }
        const { fieldValue, fieldLableName, imageName, imageUrl, user_id } =
            req.body;

        const existingActivitiy = await Activity.findOne({
            fieldValue: req.body.fieldValue,
            _id: { $ne: req.params.id }, // Exclude the current activity from the check
        });

        if (existingActivitiy) {
            // If an activity with the same fieldValue and fieldName exists, send a response indicating duplication
            return res
                .status(409)
                .json({ message: "Activity with the same name already exists" });
        }

        let updated = false;
        if (activity.fieldValue !== fieldValue) {
            activity.fieldValue = fieldValue;
            updated = true;
        }
        if (activity.imageName !== imageName) {
            activity.imageName = imageName;
            updated = true;
        }
        if (activity.imageUrl !== imageUrl) {
            activity.imageUrl = imageUrl;
            updated = true;
        }

        if (updated) {
            activity.updateLog.push({
                updatedBy: user_id,
                updatedAt: new Date(),
            });

<<<<<<< Updated upstream
      const result = await activity.save();
      try {
        await Promise.all([
          SubactivityMapping.updateMany(
            { field3_id: result._id },
            { $set: { field3Value: result.fieldValue } },
          ),
          AnnualPlan.updateMany(
            { activityName_id: result._id },
            { $set: { activityName: result.fieldValue } },
          ),
          Approval.updateMany(
            { activityName_id: result._id },
            { $set: { activityName: result.fieldValue } },
          ),
          Utilization.updateMany(
            { activityName_id: result._id },
            { $set: { activityName: result.fieldValue } },
          ),
          FundManagement.updateMany(
            { activityName_id: result._id },
            { $set: { activityName: result.fieldValue } },
          ),
          Plantation.updateMany(
            { activity_id: result._id },
            { $set: { activity: result.fieldValue } },
          ),
          WRD.updateMany(
            { activity_id: result._id },
            { $set: { activity: result.fieldValue } },
          ),
        ]);
      } catch (updateError) {
        console.error(
          "activityName updated, but cascading update failed:",
          updateError,
        );
      }
      return res.status(200).json({ result, updated: true });
    } else {
      return res
        .status(200)
        .json({ message: "No changes detected", updated: false });
=======
            const result = await activity.save();
            try {
                await Promise.all([
                    SubactivityMapping.updateMany(
                        { field3_id: result._id },
                        { $set: { field3Value: result.fieldValue } }
                    ),
                    AnnualPlan.updateMany(
                        { activityName_id: result._id },
                        { $set: { activityName: result.fieldValue } }
                    ),
                    Approval.updateMany(
                        { activityName_id: result._id },
                        { $set: { activityName: result.fieldValue } }
                    ),
                    Utilization.updateMany(
                        { activityName_id: result._id },
                        { $set: { activityName: result.fieldValue } }
                    ),
                    FundManagement.updateMany(
                        { activityName_id: result._id },
                        { $set: { activityName: result.fieldValue } }
                    ),
                    Plantation.updateMany(
                        { activity_id: result._id },
                        { $set: { activity: result.fieldValue } }
                    ),
                    WRD.updateMany(
                        { activity_id: result._id },
                        { $set: { activity: result.fieldValue } }
                    ),
                ]);
            } catch (updateError) {
                console.error("activityName updated, but cascading update failed:", updateError);
            }
            return res.status(200).json({ result, updated: true });
        } else {
            return res
                .status(200)
                .json({ message: "No changes detected", updated: false });
        }
    } catch (error) {
        res.status(500).json({ error });
>>>>>>> Stashed changes
    }
};

exports.deleteActivity = async (req, res) => {
    try {
        await Activity.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Activity deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

var getAllActivitys = async () => {
    return new Promise(function (resolve, reject) {
        Activity.find()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
};

// exports.bulkUpload_Activity = (req, res, next) => {
//   var excelData = req.body.data;
//   var validData = [];
//   var invalidData = [];
//   var failedRecords = [];
//   var rowSet = new Set();
//   var DuplicateCount = 0;

//   processData();

//   async function processData() {
//     for (var k = 0; k < excelData.length; k++) {
//       let currentActivity = excelData[k].activity?.trim();

//       if (!currentActivity || currentActivity === "-") {
//         let remark = "Activity not found";
//         invalidData.push({ ...excelData[k], failedRemark: remark });
//         continue;
//       }

//       if (rowSet.has(currentActivity)) {
//         let remark = "Duplicate activity in the file";
//         invalidData.push({ ...excelData[k], failedRemark: remark });
//         DuplicateCount++;
//         continue;
//       }

//       rowSet.add(currentActivity);

//       let allActivitys = await getAllActivitys({});
//       let activityExists = allActivitys?.some(
//         (item) => item.fieldValue === currentActivity
//       );

//       if (!activityExists) {
//         validData.push({
//           fieldValue: currentActivity,
//           fileName: req.body?.fileName,
//           createdBy: req.body?.createdBy,
//           createdAt: new Date(),
//         });
//       } else {
//         let remark = "Activity details already exist.";
//         invalidData.push({ ...excelData[k], failedRemark: remark });
//       }
//     }

//     if (validData.length > 0) {
//       Activity.insertMany(validData)
//         .then((data) => {
//           console.log("Valid data inserted", data);
//         })
//         .catch((err) => {
//           console.log("Error inserting valid data", err);
//         });
//     }

//     if (invalidData.length > 0) {
//       failedRecords.FailedRecords = invalidData;
//       failedRecords.fileName = req.body.fileName;
//       failedRecords.totalRecords = invalidData.length;
//       const failedData = await insertFailedRecords(
//         failedRecords,
//         req.body.updateBadData
//       );
//       console.log("Failed data", failedData);
//     }

//     res.status(200).json({
//       message: "Bulk upload process completed successfully!",
//       completed: true,
//       duplicates: DuplicateCount,
//     });
//   }
// };

exports.bulkUpload_Activity = (req, res, next) => {
    var excelData = req.body.data;
    var validData = [];
    var invalidData = [];
    var failedRecords = [];
    var rowSet = new Set();
    var DuplicateCount = 0;

    processData();

    async function processData() {
        // Fetch all existing activities in the system
        let allActivities = await getAllActivitys({});

        for (var k = 0; k < excelData.length; k++) {
            let currentActivity = excelData[k].activity?.trim();
            let remark = ""; // Reset remark for each row

            // Check if the activity is valid in the file
            if (!currentActivity || currentActivity === "-") {
                remark = "Activity not found";
                invalidData.push({ ...excelData[k], failedRemark: remark });
                continue; // Skip the rest of the loop for this iteration
            }

            // Check for duplicates within the uploaded file itself
            if (rowSet.has(currentActivity)) {
                remark = "Duplicate activity in the file";
                invalidData.push({ ...excelData[k], failedRemark: remark });
                DuplicateCount++;
                continue; // Skip the rest of the loop for this iteration
            }

            rowSet.add(currentActivity);

<<<<<<< Updated upstream
      // Check if the activity already exists in the system (database)
      let activityExists = allActivities?.some(
        (item) => item.fieldValue === currentActivity,
      );
=======
            // Check if the activity already exists in the system (database)
            let activityExists = allActivities?.some(
                (item) => item.fieldValue === currentActivity
            );
>>>>>>> Stashed changes

            // If activity doesn't exist in the system, it's valid
            if (!activityExists) {
                validData.push({
                    fieldValue: currentActivity,
                    fileName: req.body?.fileName,
                    createdBy: req.body?.createdBy,
                    createdAt: new Date(),
                });
            } else {
                // If the activity already exists in the database, mark it as invalid
                remark = "Activity details already exist.";
                invalidData.push({ ...excelData[k], failedRemark: remark });
            }
        }

        // Insert valid data into the "good" records collection
        if (validData.length > 0) {
            Activity.insertMany(validData)
                .then((data) => {
                    // console.log("Valid data inserted", data);
                })
                .catch((err) => {
                    console.log("Error inserting valid data", err);
                });
        }

        // Log invalid data into the "bad" records collection
        if (invalidData.length > 0) {
            failedRecords.FailedRecords = invalidData;
            failedRecords.fileName = req.body.fileName;
            failedRecords.totalRecords = invalidData.length;

            const failedData = await insertFailedRecords(
                failedRecords,
                req.body.updateBadData
            );
            // console.log("Failed data", failedData);
        }

        // Return a response with the status of the upload
        res.status(200).json({
            message: "Bulk upload process completed successfully!",
            completed: true,
            validRecords: validData.length,
            invalidRecords: invalidData.length,
            duplicates: DuplicateCount,
        });
    }
<<<<<<< Updated upstream

    // Log invalid data into the "bad" records collection
    if (invalidData.length > 0) {
      failedRecords.FailedRecords = invalidData;
      failedRecords.fileName = req.body.fileName;
      failedRecords.totalRecords = invalidData.length;

      const failedData = await insertFailedRecords(
        failedRecords,
        req.body.updateBadData,
      );
      // console.log("Failed data", failedData);
    }

    // Return a response with the status of the upload
    res.status(200).json({
      message: "Bulk upload process completed successfully!",
      completed: true,
      validRecords: validData.length,
      invalidRecords: invalidData.length,
      duplicates: DuplicateCount,
    });
  }
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
=======
};

var insertFailedRecords = async (invalidData, updateBadData) => {
    //// console.log('invalidData',invalidData);
    return new Promise(function (resolve, reject) {
        FailedRecords.find({ fileName: invalidData.fileName })
            .exec()
>>>>>>> Stashed changes
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
    // AnnualPlan.find({center_id:req.params.center_id,fileName:req.params.fileName})
    Activity.find({ fileName: req.params.fileName })
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
                    finaldata.totalRecords = badData[0].totalRecords;
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

// exports.bulkUpload_Activity = (req, res, next) => {
//   // console.log("req.body.data",req.body.data)
//   var excelData = req.body.data;
//   var validData = [];
//   var validObjects = [];
//   var invalidData = [];
//   var invalidObjects = {};
//   var remark = "";
//   var failedRecords = [];
//   var rowSet = new Set();
//   var Count = 0;
//   var DuplicateCount = 0;

//   processData();
//   async function processData() {
//     for (var k = 0; k < excelData.length; k++) {
//       if (excelData[k].activity == "-") {
//         remark += "activity not found";
//       }

//       let currentRowString = JSON.stringify(excelData[k]);

//       // Check if the entire row (not just activity) is a duplicate within the excelData itself
//       if (rowSet.has(currentRowString)) {
//         remark = "Duplicate row in the file";
//         invalidObjects = { ...excelData[k], failedRemark: remark };
//         invalidData.push(invalidObjects);
//         DuplicateCount++;
//         continue; // Skip processing this duplicate row
//       }

//       rowSet.add(currentRowString); // Add the row to the set to track this row
//       console.log("remark", remark);
//       if (remark === "") {
//         var allActivitys = await getAllActivitys({});
//         console.log("allActivitys", allActivitys.length);

//         var activityExists = allActivitys?.filter((item) => {
//           if (item.fieldValue === excelData[k].activity.trim()) {
//             return item;
//           }
//         });
//         console.log("activityExists", activityExists);

//         if (activityExists.length == 0) {
//           validObjects.fieldValue = excelData[k].activity.trim();
//           validObjects.fileName = req.body?.fileName;
//           validObjects.createdBy = req.body?.createdBy;
//           validObjects.createdAt = new Date();
//           console.log("validObjects", validObjects);
//           validData.push(validObjects);
//         } else {
//           remark = "activity details already exists.";
//           invalidObjects.fieldValue = excelData[k].activity;
//           invalidObjects = excelData[k];
//           invalidObjects.failedRemark = remark;
//           invalidData.push(invalidObjects);
//           console.log(
//             "invalidObjects ActivityExists",
//             invalidObjects,
//             invalidObjects.failedRemark
//           );
//         }
//       } else {
//         console.log("inside else");
//         invalidObjects.fieldValue = excelData[k].activity;
//         console.log("invalidObjects.fieldValue", invalidObjects.fieldValue);
//         invalidObjects = excelData[k];
//         invalidObjects.failedRemark = remark;
//         invalidData.push(invalidObjects);
//       }
//       remark = "";
//     }
//     console.log("validData", validData.length);
//     console.log("remark 1", remark);
//     Activity.insertMany(validData)
//       .then(async (data) => {
//         console.log("data", data);
//       })
//       .catch((err) => {
//         console.log("activity.insertMany", err);
//       });
//     console.log("invalidData", invalidData);
//     if (invalidData.length > 0) {
//       failedRecords.FailedRecords = invalidData;
//       failedRecords.fileName = req.body.fileName;
//       failedRecords.totalRecords = invalidData.length;
//       const failedData = await insertFailedRecords(
//         failedRecords,
//         req.body.updateBadData
//       );
//       console.log("failedData", failedData);
//     }
//     res.status(200).json({
//       message: "Bulk upload process is completed successfully!",
//       completed: true,
//       duplicates: DuplicateCount,
//     });
//   }
// };
