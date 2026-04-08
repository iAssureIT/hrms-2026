const VendorCategoryModal = require("./model.js");
const mongoose = require("mongoose");
const FailedRecords = require("../../failedRecords/model.js");
// const SubactivityMapping = require("../../SubactivityMapping/model.js");
// const AnnualPlan = require("../../annual-plan/model.js");
// const Approval = require("../../approval-details/model.js");
// const Utilization = require("../../utilization-details/model.js");
// const FundManagement = require("../../fund-management/model.js");
// const Plantation = require("../../plantation/model.js");
// const WRD = require("../../wrd/model.js");

exports.createVendorCategory = async (req, res) => {
  try {
    const existingVendorCategory = await VendorCategoryModal.findOne({
      fieldValue: req.body.fieldValue,
    });

    if (existingVendorCategory) {
      return res
        .status(409)
        .json({ message: "Vendor Category already exists" });
    }

    const vendors = new VendorCategoryModal({
      _id: new mongoose.Types.ObjectId(),
      fieldValue: req.body.fieldValue,
      createdBy: req.body.user_id,
    });

    const result = await vendors.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getVendorCategory = async (req, res) => {
  try {
    const vendorCategories = await VendorCategoryModal.find();
    res.status(200).json(vendorCategories);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getVendorCategoryData = async (req, res) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  // console.log("req.body => ", req.body);

  VendorCategoryModal.countDocuments()
    .then((totalRecs) => {
      // console.log("totalRecs => ", totalRecs);
      VendorCategoryModal.find()
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
exports.updateVendorCategory = async (req, res) => {
  // console.log(req.body);
  try {
    const vendorCategory = await VendorCategoryModal.findById(req.params.id);

    if (!vendorCategory) {
      return res.status(404).json({ error: "Vendor Category not found" });
    }
    const { fieldValue, fieldLableName, imageName, imageUrl, user_id } =
      req.body;

    const existingVendorCategory = await VendorCategoryModal.findOne({
      fieldValue: req.body.fieldValue,
      _id: { $ne: req.params.id }, // Exclude the current activity from the check
    });

    if (existingVendorCategory) {
      // If an activity with the same fieldValue and fieldName exists, send a response indicating duplication
      return res
        .status(409)
        .json({ message: "Vendor Category with the same name already exists" });
    }

    let updated = false;
    if (vendorCategory.fieldValue !== fieldValue) {
      vendorCategory.fieldValue = fieldValue;
      updated = true;
    }
    if (vendorCategory.imageName !== imageName) {
      vendorCategory.imageName = imageName;
      updated = true;
    }
    if (vendorCategory.imageUrl !== imageUrl) {
      vendorCategory.imageUrl = imageUrl;
      updated = true;
    }

    if (updated) {
      vendorCategory.updateLog.push({
        updatedBy: user_id,
        updatedAt: new Date(),
      });

      const result = await vendorCategory.save();
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
          // WRD.updateMany(
          //   { activity_id: result._id },
          //   { $set: { activity: result.fieldValue } }
          // ),
        ]);
      } catch (updateError) {
        console.error(
          "VendorName updated, but cascading update failed:",
          updateError,
        );
      }
      return res.status(200).json({ result, updated: true });
    } else {
      return res
        .status(200)
        .json({ message: "No changes detected", updated: false });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.deleteVendorCategory = async (req, res) => {
  try {
    await VendorCategoryModal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Vendor Category deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// var getAllVendorss = async () => {
//   return new Promise(function (resolve, reject) {
//     VendorsModal.find()
//       .then((data) => {
//         resolve(data);
//       })
//       .catch((err) => {
//         console.log(err);
//         reject(err);
//       });
//   });
// };

// exports.bulkUpload_Vendors = (req, res, next) => {
//   var excelData = req.body.data;
//   var validData = [];
//   var invalidData = [];
//   var failedRecords = [];
//   var rowSet = new Set();
//   var DuplicateCount = 0;

//   processData();

//   async function processData() {
//     for (var k = 0; k < excelData.length; k++) {
//       let currentVendors = excelData[k].activity?.trim();

//       if (!currentVendors || currentVendors === "-") {
//         let remark = "Vendors not found";
//         invalidData.push({ ...excelData[k], failedRemark: remark });
//         continue;
//       }

//       if (rowSet.has(currentVendors)) {
//         let remark = "Duplicate activity in the file";
//         invalidData.push({ ...excelData[k], failedRemark: remark });
//         DuplicateCount++;
//         continue;
//       }

//       rowSet.add(currentVendors);

//       let allVendorss = await getAllVendorss({});
//       let activityExists = allVendorss?.some(
//         (item) => item.fieldValue === currentVendors
//       );

//       if (!activityExists) {
//         validData.push({
//           fieldValue: currentVendors,
//           fileName: req.body?.fileName,
//           createdBy: req.body?.createdBy,
//           createdAt: new Date(),
//         });
//       } else {
//         let remark = "Vendors details already exist.";
//         invalidData.push({ ...excelData[k], failedRemark: remark });
//       }
//     }

//     if (validData.length > 0) {
//       VendorsModal.insertMany(validData)
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

exports.bulkUpload_VendorCategory = (req, res, next) => {
  var excelData = req.body.data;
  var validData = [];
  var invalidData = [];
  var failedRecords = [];
  var rowSet = new Set();
  var DuplicateCount = 0;

  processData();

  async function processData() {
    let allVendorCategories = await getAllVendorCategories({});

    for (var k = 0; k < excelData.length; k++) {
      let currentVendorCategory = excelData[k].activity?.trim();
      let remark = ""; // Reset remark for each row

      // Check if the activity is valid in the file
      if (!currentVendorCategory || currentVendorCategory === "-") {
        remark = "Vendor Category not found";
        invalidData.push({ ...excelData[k], failedRemark: remark });
        continue; // Skip the rest of the loop for this iteration
      }

      // Check for duplicates within the uploaded file itself
      if (rowSet.has(currentVendorCategory)) {
        remark = "Duplicate Vendor Category in the file";
        invalidData.push({ ...excelData[k], failedRemark: remark });
        DuplicateCount++;
        continue; // Skip the rest of the loop for this iteration
      }

      rowSet.add(currentVendorCategory);

      // Check if the activity already exists in the system (database)
      let vendorCategoryExists = allVendorCategories?.some(
        (item) => item.fieldValue === currentVendorCategory,
      );

      // If activity doesn't exist in the system, it's valid
      if (!vendorCategoryExists) {
        validData.push({
          fieldValue: currentVendorCategory,
          fileName: req.body?.fileName,
          createdBy: req.body?.createdBy,
          createdAt: new Date(),
        });
      } else {
        // If the activity already exists in the database, mark it as invalid
        remark = "Vendor Category details already exist.";
        invalidData.push({ ...excelData[k], failedRemark: remark });
      }
    }

    // Insert valid data into the "good" records collection
    if (validData.length > 0) {
      VendorCategoryModal.insertMany(validData)
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

// var insertFailedRecords = async (invalidData, updateBadData) => {
//   //// console.log('invalidData',invalidData);
//   return new Promise(function (resolve, reject) {
//     FailedRecords.find({ fileName: invalidData.fileName })
//       .exec()
//       .then((data) => {
//         if (data.length > 0) {
//           //// console.log('data',data[0].failedRecords.length)
//           if (data[0].failedRecords.length > 0) {
//             if (updateBadData) {
//               FailedRecords.updateOne(
//                 { fileName: invalidData.fileName },
//                 { $set: { failedRecords: [] } }
//               )
//                 .then((data) => {
//                   if (data.modifiedCount == 1) {
//                     FailedRecords.updateOne(
//                       { fileName: invalidData.fileName },
//                       {
//                         $set: {
//                           totalRecords: invalidData.totalRecords,
//                           // 'failedRecords' : invalidData.FailedRecords
//                         },
//                         $push: { failedRecords: invalidData.FailedRecords },
//                       }
//                     )
//                       .then((data) => {
//                         if (data.modifiedCount == 1) {
//                           resolve(data);
//                         } else {
//                           resolve(data);
//                         }
//                       })
//                       .catch((err) => {
//                         reject(err);
//                       });
//                   } else {
//                     resolve(0);
//                   }
//                 })
//                 .catch((err) => {
//                   reject(err);
//                 });
//             } else {
//               FailedRecords.updateOne(
//                 { fileName: invalidData.fileName },
//                 {
//                   $set: {
//                     totalRecords: invalidData.totalRecords,
//                     // 'failedRecords' : invalidData.FailedRecords
//                   },
//                   $push: { failedRecords: invalidData.FailedRecords },
//                 }
//               )
//                 .then((data) => {
//                   if (data.modifiedCount == 1) {
//                     resolve(data);
//                   } else {
//                     resolve(data);
//                   }
//                 })
//                 .catch((err) => {
//                   reject(err);
//                 });
//             }
//           } else {
//             FailedRecords.updateOne(
//               { fileName: invalidData.fileName },
//               {
//                 $set: {
//                   totalRecords: invalidData.totalRecords,
//                   // 'failedRecords' : invalidData.FailedRecords
//                 },
//                 $push: { failedRecords: invalidData.FailedRecords },
//               }
//             )
//               .then((data) => {
//                 if (data.modifiedCount == 1) {
//                   resolve(data);
//                 } else {
//                   resolve(data);
//                 }
//               })
//               .catch((err) => {
//                 reject(err);
//               });
//           }
//         } else {
//           const failedRecords = new FailedRecords({
//             _id: new mongoose.Types.ObjectId(),
//             failedRecords: invalidData.FailedRecords,
//             fileName: invalidData.fileName,
//             totalRecords: invalidData.totalRecords,
//             createdAt: new Date(),
//           });

//           failedRecords
//             .save()
//             .then((data) => {
//               resolve(data._id);
//             })
//             .catch((err) => {
//               // console.log(err);
//               reject(err);
//             });
//         }
//       });
//   });
// };

// exports.filedetails = (req, res, next) => {
//   var finaldata = {};
//   // console.log(req.params.fileName)
//   // AnnualPlan.find({center_id:req.params.center_id,fileName:req.params.fileName})
//   VendorsModal.find({ fileName: req.params.fileName })
//     .exec()
//     .then((data) => {
//       //finaldata.push({goodrecords: data})
//       finaldata.goodrecords = data;
//       finaldata.totalRecords = data.length;
//       FailedRecords.find({ fileName: req.params.fileName })
//         .exec()
//         .then((badData) => {
//           var failedRecords =
//             badData.length > 0 ? badData[0].failedRecords : [];
//           finaldata.failedRecords = failedRecords.flat();
//           finaldata.totalRecords = badData[0].totalRecords;
//           // console.log("filedetails finaldata=======>", finaldata);
//           res.status(200).json(finaldata);
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };

// exports.bulkUpload_Vendors = (req, res, next) => {
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
//         var allVendorss = await getAllVendorss({});
//         console.log("allVendorss", allVendorss.length);

//         var activityExists = allVendorss?.filter((item) => {
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
//             "invalidObjects VendorsExists",
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
//     VendorsModal.insertMany(validData)
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
