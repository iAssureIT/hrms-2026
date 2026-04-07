const mongoose = require("mongoose");
const SubactivityMapping = require("./model");
const ProgramMaster = require("../oneFieldModules/programManagement/modelNew.js");
const ProjectMaster = require("../oneFieldModules/projectManagement/modelNew.js");
const ActivityMaster = require("../oneFieldModules/ActivityManagement/model.js");
const ObjectId = require("mongodb").ObjectId;
const Subactivity = require("../SubactivityMapping/model.js");
const FailedRecords = require("../failedRecords/model.js");

// CREATE
exports.createSubactivity = async (req, res) => {
  try {
    SubactivityMapping.findOne({
      field1Value: req.body.field1Value,
      field2Value: req.body.field2Value,
      field3Value: req.body.field3Value,
      inputValue: req.body.inputValue,
    })
      .exec()
      .then(async (data) => {
        if (data) {
          res.status(200).json({ message: "Data already exists" });
        } else {
          const newSubactivity = new SubactivityMapping({
            _id: new mongoose.Types.ObjectId(),

            field1_id: req.body.field1_id,
            field1Label: req.body.field1Label,
            field1Value: req.body.field1Value,

            field2_id: req.body.field2_id,
            field2Label: req.body.field2Label,
            field2Value: req.body.field2Value,

            field3_id: req.body.field3_id,
            field3Label: req.body.field3Label,
            field3Value: req.body.field3Value,

            inputLabel: req.body.inputLabel,
            inputValue: req.body.inputValue,

            createdAt: new Date(),
            createdBy: req.body.user_id,
          });

          const savedSubactivity = await newSubactivity.save();

          res.status(200).json({
            data: savedSubactivity,
            success: true,
            message: "SubActivity created Successfully.",
          });
        }
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkUpload_subactivity = (req, res, next) => {
  // console.log("req.body?.fileName", req.body?.fileName);
  var excelData = req.body.data;
  var validData = [];
  var invalidData = [];
  var failedRecords = [];

  // Set to store unique combinations of program, project, activity, and subactivity
  var uniqueCombinations = new Set();

  processData();

  async function processData() {
    var allPrograms = await getAllProgramMaster({});
    var allProjects = await getAllProjects({});
    var allActivities = await getAllActivities({});
    var allSubactivities = await getAllSubactivities({});

    for (var k = 0; k < excelData.length; k++) {
      let remark = ""; // Reset remark for each record
      let validObjects = {}; // Reset validObjects for each row

      // Check for empty fields
      if (excelData[k].program == "-") {
        remark += " program not found";
      }
      if (excelData[k].project == "-") {
        remark += " project not found";
      }
      if (excelData[k].activityName == "-") {
        remark += " activity not found";
      }
      if (excelData[k].subactivityName == "-") {
        remark += " subactivity not found";
      }

      // Create a key for the combination of program, project, activity, and subactivity
      let combinationKey = `${excelData[k].program
        .toLowerCase()
        .trim()}_${excelData[k].project.toLowerCase().trim()}_${excelData[
        k
      ].activityName
        .toLowerCase()
        .trim()}_${excelData[k].subactivityName.toLowerCase().trim()}`;

      // Check if the combination is already in the unique set
      if (uniqueCombinations.has(combinationKey)) {
        remark = "Duplicate Subactivity details found in the file.";
      } else {
        // Add the combination to the set if not a duplicate
        uniqueCombinations.add(combinationKey);
      }

      // If no initial remark (i.e., no empty fields) and no duplicate found
      if (remark === "") {
        var programAvailability = allPrograms.filter(
          (item) =>
            item.fieldValue.toLowerCase() ===
            excelData[k].program.toLowerCase().trim()
        );

        var projectAvailability = allProjects.filter(
          (item) =>
            item.fieldValue.toLowerCase() ===
            excelData[k].project.toLowerCase().trim()
        );

        var activityAvailability = allActivities.filter(
          (item) =>
            item.fieldValue.toLowerCase() ===
            excelData[k].activityName.toLowerCase().trim()
        );

        if (programAvailability.length === 0) {
          remark +=
            excelData[k].program + " is not available in Program Master,";
        }
        if (projectAvailability.length === 0) {
          remark +=
            " " + excelData[k].project + " is not available in Project Master,";
        }
        if (activityAvailability.length === 0) {
          remark +=
            " " +
            excelData[k].activityName +
            " is not available in Activity Master,";
        }

        if (remark === "") {
          var subactivityExists = allSubactivities.filter(
            (item) =>
              item.field1Value.toLowerCase() ===
                excelData[k].program.toLowerCase().trim() &&
              item.field2Value.toLowerCase() ===
                excelData[k].project.toLowerCase().trim() &&
              item.field3Value.toLowerCase() ===
                excelData[k].activityName.toLowerCase().trim() &&
              item.inputValue.toLowerCase() ===
                excelData[k].subactivityName.toLowerCase().trim()
          );

          if (subactivityExists.length === 0) {
            validObjects.field1_id = programAvailability[0]?._id;
            validObjects.field1Label = "program";
            validObjects.field1Value = programAvailability[0]?.fieldValue;

            validObjects.field2_id = projectAvailability[0]?._id;
            validObjects.field2Label = "projects";
            validObjects.field2Value = projectAvailability[0]?.fieldValue;

            validObjects.field3_id = activityAvailability[0]?._id;
            validObjects.field3Label = "activity";
            validObjects.field3Value = activityAvailability[0]?.fieldValue;

            validObjects.inputLabel = "subactivity";
            validObjects.inputValue = excelData[k].subactivityName.trim();

            validObjects.fileName = req.body.fileName;
            validObjects.createdBy = req.body?.createdBy;
            validObjects.createdAt = new Date();

            validData.push(validObjects); // Push validObjects into validData array
          } else {
            remark = "Subactivity details already exist.";
          }
        }
      }

      // If remark is present, it's an invalid record
      if (remark !== "") {
        let invalidObjects = { ...excelData[k], failedRemark: remark };
        invalidData.push(invalidObjects);
      }
    }

    // console.log("validData", validData.length);
    // console.log("invalidData", invalidData.length);

    // Insert valid data into good records
    if (validData.length > 0) {
      SubactivityMapping.insertMany(validData)
        .then((data) => {
          // console.log("Good records inserted successfully:", data);
        })
        .catch((err) => {
          // console.log("Error inserting good records:", err);
        });
    }

    // Log invalid data into bad records
    if (invalidData.length > 0) {
      failedRecords.FailedRecords = invalidData;
      failedRecords.fileName = req.body.fileName;
      failedRecords.totalRecords = invalidData.length;

      const failedData = await insertFailedRecords(
        failedRecords,
        req.body.updateBadData
      );
      // console.log("Failed records logged:", failedData);
    }

    res.status(200).json({
      message: "Bulk upload process is completed successfully!",
      completed: true,
      validRecords: validData.length,
      invalidRecords: invalidData.length,
    });
  }
};

var getAllProgramMaster = async () => {
  return new Promise(function (resolve, reject) {
    ProgramMaster.find()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        // console.log(err);
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
        // console.log(err);
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
var getAllSubactivities = async ({}) => {
  return new Promise(function (resolve, reject) {
    SubactivityMapping.find({})
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
var removeFailedRecords = async (fileName) => {
  return new Promise(function (resolve, reject) {
    SubactivityMapping.deleteMany({ fileName: fileName })
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
  SubactivityMapping.find({ fileName: req.params.fileName })
    .exec()
    .then((data) => {
      finaldata.goodrecords = data;
      finaldata.totalRecords = data.length;
      FailedRecords.find({ fileName: req.params.fileName })
        .exec()
        .then((badData) => {
          var failedRecords =
            badData?.length > 0 ? badData[0]?.failedRecords : [];
          finaldata.failedRecords = failedRecords.flat();
          finaldata.totalRecords = badData[0]?.totalRecords;
          // console.log('filedetails finaldata=======>',finaldata);
          res.status(200).json(finaldata);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.updateSubactivity = (req, res, next) => {
  // console.log("Request Body:", req.body); // Log request body for debugging
  SubactivityMapping.updateOne(
    { _id: req.params.id },
    {
      $set: {
        field1_id: req.body.field1_id,
        field1Label: req.body.field1Label,
        field1Value: req.body.field1Value,

        field2_id: req.body.field2_id,
        field2Label: req.body.field2Label,
        field2Value: req.body.field2Value,

        field3_id: req.body.field3_id,
        field3Label: req.body.field3Label,
        field3Value: req.body.field3Value,

        inputLabel: req.body.inputLabel,
        inputValue: req.body.inputValue,
      },
    }
  )
    .exec()
    .then((data) => {
      // console.log("Update Result:", data); // Log the result of the update operation
      if (data.modifiedCount == 1 || data.modifiedCount == 1) {
        SubactivityMapping.updateOne(
          { _id: req.params.id },
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
              message: "SubActivity updated Successfully.",
            });
          });
      } else {
        res.status(200).json({
          data,
          success: false,
          message: "SubActivity not modified",
        });
      }
    })
    .catch((err) => {
      // console.log("Update Error:", err);
      res.status(500).json({
        error: err,
      });
    });
};
exports.getAllSubactivityWithLimits = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  // console.log("Page Number", pageNum);
  let skipRec = recsPerPage * (pageNum - 1);
  let query = {};
  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
    query.$or = [
      { field1Value: searchRegex },
      { field2Value: searchRegex },
      { field3Value: searchRegex },
      { inputValue: searchRegex },
    ];
  }

  SubactivityMapping.countDocuments(query)
    .then((totalRecs) => {
      // console.log("totalRecs => ", totalRecs);

      let subactivityQuery = SubactivityMapping.find(query);
      if (!req.body.removePagination) {
        subactivityQuery = subactivityQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }
      subactivityQuery
        .sort({ createdAt: -1 })
        .then((data) => {
          var subactivityData = data.map((item, index) => {
            return {
              _id: item._id,
              program: item.field1Value,
              project: item.field2Value,
              activity: item.field3Value,
              subactivity: item.inputValue,
            };
          });
          // console.log("subactivityData",subactivityData)
          res.status(200).json({
            totalRecs: totalRecs,
            tableData: subactivityData,
            success: true,
          });
        })
        .catch((error) => {
          // console.log("Error in ApprovalLevelsList  => ", error);
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
// exports.getfield2List = async (req, res) => {
//   //get ProjectMaster List
//   try {
//     var query = {};
//     if (req.params.field1_id !== "all") query.field1_id = req.params.field1_id;
//     // query.field1_id = ObjectId(req.params.field1_id);

//     // const subactivity = await SubactivityMapping.find({ field1_id: ObjectId(req.params.field1_id) });
//     const subactivity = await SubactivityMapping.find(query);
//     const projectList =
//       subactivity.length > 0 &&
//       subactivity.map((item, index) => ({
//         field2_id: item.field2_id,
//         field2Value: item.field2Value,
//       }));
//     // Using reduce to create a unique list
//     const uniqueProjects = Object.values(
//       projectList?.reduce((acc, project) => {
//         acc[project.field2_id] = project;
//         return acc;
//       }, {})
//     );
//     console.log("uniqueProjects", uniqueProjects.length);

//     res.status(200).json(uniqueProjects);
//   } catch (err) {
//     console.log("err.message", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getfield2List = async (req, res) => {
  // Get ProjectMaster List
  try {
    var query = {};
    if (req.params.field1_id !== "all") query.field1_id = req.params.field1_id;

    const subactivity = await SubactivityMapping.find(query);

    // Ensure projectList is an array, even if subactivity is empty
    const projectList =
      subactivity.length > 0
        ? subactivity.map((item) => ({
            field2_id: item.field2_id,
            field2Value: item.field2Value,
          }))
        : [];

    // Using reduce to create a unique list
    const uniqueProjects = Object.values(
      projectList.reduce((acc, project) => {
        acc[project.field2_id] = project;
        return acc;
      }, {})
    );

    // console.log("uniqueProjects", uniqueProjects.length);
    res.status(200).json(uniqueProjects);
  } catch (err) {
    console.log("err.message", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getfield3List = async (req, res) => {
  //get ActivityMaster List
  try {
    var query = {};
    if (req.params.field1_id !== "all") query.field1_id = req.params.field1_id;
    if (req.params.field2_id !== "all") query.field2_id = req.params.field2_id;

    const subactivity = await SubactivityMapping.find(query);
    // const subactivity = await SubactivityMapping.find(
    //                       {
    //                         field1_id: req.params.field1_id,
    //                         field2_id: req.params.field2_id,
    //                       });
    // console.log("subactivity",subactivity)
    const activityList =
      subactivity.length > 0
        ? subactivity.map((item, index) => ({
            field3_id: item.field3_id,
            field3Value: item.field3Value,
          }))
        : [];
    // Using reduce to create a unique list
    const uniqueactivity =
      activityList.length > 0
        ? Object.values(
            activityList?.reduce((acc, activity) => {
              acc[activity.field3_id] = activity;
              return acc;
            }, {})
          )
        : [];
    uniqueactivity.sort((a, b) => a.field3Value.localeCompare(b.field3Value));
    
    // console.log("uniqueactivity", uniqueactivity.length);

    res.status(200).json(uniqueactivity);
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getfield4List = async (req, res) => {
  try {
    var query = {};
    if (req.params.field1_id !== "all") query.field1_id = req.params.field1_id;
    if (req.params.field2_id !== "all") query.field2_id = req.params.field2_id;
    if (req.params.field3_id !== "all") query.field3_id = req.params.field3_id;

    const subactivity = await SubactivityMapping.find(query);
    // const subactivity = await SubactivityMapping.find(
    //                       {
    //                         field1_id: req.params.field1_id,
    //                         field2_id: req.params.field2_id,
    //                         field3_id: req.params.field3_id,
    //                       });
    const subactivityList =
      subactivity.length > 0
        ? subactivity.map((item, index) => ({
            _id: item._id,
            inputValue: item.inputValue,
          }))
        : [];
    // Using reduce to create a unique list
    const uniqueSubactivityList =
      subactivityList.length > 0
        ? Object.values(
            subactivityList?.reduce((acc, subactivity) => {
              acc[subactivity._id] = subactivity;
              return acc;
            }, {})
          )
        : [];
    uniqueSubactivityList.sort((a, b) => a.inputValue.localeCompare(b.inputValue));
    console.log("uniqueSubactivityList", uniqueSubactivityList.length);

    res.status(200).json(uniqueSubactivityList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL
exports.getAllSubactivity = async (req, res) => {
  try {
    const subactivities = await SubactivityMapping.find();
    res.json(subactivities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOneSubactivity = async (req, res) => {
  try {
    const subactivity = await SubactivityMapping.findOne({
      _id: req.params.id,
    });
    res.status(200).json(subactivity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// DELETE
exports.deleteSubactivity = async (req, res) => {
  try {
    const deletedSubactivity = await SubactivityMapping.findByIdAndDelete(
      req.params.id
    );
    if (!deletedSubactivity)
      return res.status(404).json({ message: "Subactivity not found" });
    res.json({ message: "Subactivity deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDropdownSubactivity = async (req, res) => {
  const newdropdownvalue = req.body[0];
  const dropdownId = req.params.id;

  try {
    const result = await SubactivityMapping.updateMany(
      { dropdown_id: dropdownId },
      { $set: { dropdownvalue: newdropdownvalue } },
      { new: true }
    );
    //   result.updateLog.push({
    //     updatedAt:new Date(),
    //     updatedBy:req.body.user_id,

    // })
    if (result) {
      // console.log("Document updated:", result);
    } else {
      console.log("No document found with the given dropdown_id");
    }
  } catch (err) {
    console.error("Error updating document:", err);
  }
};

// exports.bulkUpload_subactivity = (req, res, next) => {
//   console.log("req.body?.fileName", req.body?.fileName);
//   var excelData = req.body.data;
//   var validData = [];
//   var validObjects = [];
//   var invalidData = [];
//   var invalidObjects = {};
//   var remark = "";
//   var failedRecords = [];
//   var Count = 0;
//   var DuplicateCount = 0;

//   processData();
//   async function processData() {

//     var allPrograms = await getAllProgramMaster({});
//     var allProjects = await getAllProjects({});
//     var allActivities = await getAllActivities({});
//     var allSubactivities = await getAllSubactivities({});

//     // console.log("allPrograms",allPrograms);
//     // // console.log("allProjects",allProjects);
//     // // console.log("allActivities",allActivities);
//     // console.log("allSubactivities",allSubactivities);
//     for (var k = 0; k < excelData.length; k++) {
//       if (excelData[k].program == "-") {
//         remark += " program not found";
//       }
//       if (excelData[k].project == "-") {
//         remark += " project not found";
//       }
//       if (excelData[k].activityName == '-') {
//         remark += " activity not found";
//       }
//       if (excelData[k].subactivityName == '-') {
//         remark += " subactivity not found";
//       }
//       // console.log("remark", remark)
//       if (remark == '') {

//         var programAvailability = allPrograms.filter((item) => {
//           if ( (item.fieldValue).toLowerCase() === (excelData[k].program).toLowerCase().trim()) {
//             return item;
//           }
//         });
//         // console.log("programAvailability",programAvailability)
//         var projectAvailability = allProjects.filter((item) => {
//           if ( (item.fieldValue).toLowerCase() === (excelData[k].project).toLowerCase().trim()) {
//             return item;
//           }
//         });
//         // console.log("projectAvailability",projectAvailability)
//         var activityAvailability = allActivities.filter((item) => {
//           if ( (item.fieldValue).toLowerCase() === (excelData[k].activityName).toLowerCase().trim()) {
//             return item;
//           }
//         })
//         if(programAvailability.length == 0){
//           remark += excelData[k].program+ " is not available in Program Master,";
//         }
//         // console.log("remark 2", remark);
//         if(projectAvailability.length == 0){
//           remark += " "+excelData[k].project+ " is not available in Project Master,";
//         }
//         // console.log("remark 3", remark);
//         if(activityAvailability.length == 0){
//           remark += " "+excelData[k].activityName+ " is not available in Activity Master,";
//         }
//         console.log("remark============1",remark)
//         if(remark ==''){
//           var subactivityExists = allSubactivities.filter((item) => {
//             if ( (item.field1Value).toLowerCase() === (excelData[k].program).toLowerCase().trim()
//               && (item.field2Value).toLowerCase() === (excelData[k].project).toLowerCase().trim()
//               && (item.field3Value).toLowerCase() === (excelData[k].activityName).toLowerCase().trim()
//               && (item.inputValue).toLowerCase() === (excelData[k].subactivityName).toLowerCase().trim()) {
//                 return item;
//               }
//           })
//           console.log(" subactivityExists", subactivityExists.length);
//           if (subactivityExists.length == 0) {
//             validObjects.field1_id     = programAvailability[0]?._id;
//             validObjects.field1Label   = "program";
//             validObjects.field1Value   = programAvailability[0]?.fieldValue;

//             validObjects.field2_id     = projectAvailability[0]?._id;
//             validObjects.field2Label   = "projects";
//             validObjects.field2Value   = projectAvailability[0]?.fieldValue;

//             validObjects.field3_id     = activityAvailability[0]?._id;
//             validObjects.field3Label   = "activity";
//             validObjects.field3Value   = activityAvailability[0]?.fieldValue;

//             validObjects.inputLabel    = "subactivity";
//             validObjects.inputValue    = (excelData[k].subactivityName).trim();

//             validObjects.fileName       = req.body.fileName;
//             validObjects.createdBy      = req.body?.createdBy;
//             validObjects.createdAt      = new Date();
//             // console.log("validObjects",validObjects)
//             validData.push(validObjects);
//           } else {
//             remark = "Subactivity Details already exists.";
//             invalidObjects                = excelData[k];
//             invalidObjects.failedRemark   = remark;
//             invalidData.push(invalidObjects);
//             console.log("invalidObjects subactivityExists",invalidObjects,invalidObjects.failedRemark)
//           }
//         }else{
//           invalidObjects                = excelData[k];
//           invalidObjects.failedRemark   = remark;
//           console.log("remark============2",remark)
//           invalidData.push(invalidObjects);
//         }
//       } else {
//         invalidObjects = excelData[k];
//         invalidObjects.failedRemark = remark;
//         invalidData.push(invalidObjects);
//       }
//       remark = "";
//     }
//     console.log("validData", validData.length);
//     console.log("remark 1", remark);
//     SubactivityMapping.insertMany(validData)
//       .then(async (data) => {
//         console.log("data", data);
//         // await removeFailedRecords(data.fileName);
//       })
//       .catch((err) => {
//         console.log("err", err);
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
//     });
//   }
// };
