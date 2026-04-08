const Project = require("./modelNew");
const mongoose = require("mongoose");
const FailedRecords = require("../../failedRecords/model.js");
// const SubactivityMapping = require("../../SubactivityMapping/model.js");
// const AnnualPlan = require("../../annual-plan/model.js");
// const Approval = require("../../approval-details/model.js");
// const Utilization = require("../../utilization-details/model.js");
// const FundManagement = require("../../fund-management/model.js");
// const Plantation = require("../../plantation/model.js");
// const WRD = require("../../wrd/model.js");

exports.createProject = async (req, res) => {
  // console.log("Creating Project", req.body.formValues);

  try {
    // Check if an activity with the same fieldValue and fieldName already exists
    const existingProject = await Project.findOne({
      fieldValue: req.body.fieldValue,
    });

    if (existingProject) {
      // If the activity already exists, send a response indicating duplication
      return res.status(409).json({ message: "Project already exists" });
    }
    const project = new Project({
      _id: new mongoose.Types.ObjectId(),
      fieldValue: req.body.fieldValue,
      createdBy: req.body.user_id,
      // imageName: req.body.imageName,
      // imageUrl: req.body.imageUrl,
    });

    const result = await project.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getProject = async (req, res) => {
  try {
    const projects = await Project.find();
    // console.log(projects);
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getProjectData = async (req, res) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  // console.log("req.body => ", req.body);

  Project.countDocuments()
    .then((totalRecs) => {
      // console.log("totalRecs => ", totalRecs);
      Project.find()
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
          console.log("Error 1  => ", error);
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

exports.updateProject = async (req, res) => {
  // console.log(req.body);
  try {
    // Find the existing Project by ID
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const { fieldValue, fieldLableName, imageName, imageUrl, user_id } =
      req.body;

    const existingProject = await Project.findOne({
      fieldValue: req.body.fieldValue,
      _id: { $ne: req.params.id }, // Exclude the current activity from the check
    });

    if (existingProject) {
      // If an activity with the same fieldValue and fieldName exists, send a response indicating duplication
      return res
        .status(409)
        .json({ message: "Project with the same name already exists" });
    }

    let updated = false;
    if (project.fieldValue !== fieldValue) {
      project.fieldValue = fieldValue;
      updated = true;
    }
    if (project.imageName !== imageName) {
      project.imageName = imageName;
      updated = true;
    }
    if (project.imageUrl !== imageUrl) {
      project.imageUrl = imageUrl;
      updated = true;
    }

    if (updated) {
      project.updateLog.push({
        updatedBy: user_id,
        updatedAt: new Date(),
      });

      const result = await project.save();
      // console.log("Project updated successfully", result);
      try {
        await Promise.all([
          SubactivityMapping.updateMany(
            { field2_id: result._id },
            { $set: { field2Value: result.fieldValue } },
          ),
          AnnualPlan.updateMany(
            { project_id: result._id },
            { $set: { project: result.fieldValue } },
          ),
          Approval.updateMany(
            { project_id: result._id },
            { $set: { project: result.fieldValue } },
          ),
          Utilization.updateMany(
            { project_id: result._id },
            { $set: { project: result.fieldValue } },
          ),
          FundManagement.updateMany(
            { project_id: result._id },
            { $set: { project: result.fieldValue } },
          ),
          Plantation.updateMany(
            { project_id: result._id },
            { $set: { project: result.fieldValue } },
          ),
          WRD.updateMany(
            { project_id: result._id },
            { $set: { project: result.fieldValue } },
          ),
        ]);
      } catch (updateError) {
        console.error(
          "project updated, but cascading update failed:",
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

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

var getAllProjects = async () => {
  return new Promise(function (resolve, reject) {
    Project.find()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

// exports.bulkUpload_Project = (req, res, next) => {
//   var excelData = req.body.data;
//   var validData = [];
//   var invalidData = [];
//   var failedRecords = [];
//   var rowSet = new Set();
//   var DuplicateCount = 0;

//   processData();

//   async function processData() {
//     for (var k = 0; k < excelData.length; k++) {
//       let currentProject = excelData[k].project?.trim();

//       if (!currentProject || currentProject === "-") {
//         let remark = "Project not found";
//         invalidData.push({ ...excelData[k], failedRemark: remark });
//         continue;
//       }

//       if (rowSet.has(currentProject)) {
//         let remark = "Duplicate project in the file";
//         invalidData.push({ ...excelData[k], failedRemark: remark });
//         DuplicateCount++;
//         continue;
//       }

//       rowSet.add(currentProject);

//       let allProjects = await getAllProjects({});
//       let projectExists = allProjects?.some(
//         (item) => item.fieldValue === currentProject
//       );

//       if (!projectExists) {
//         validData.push({
//           fieldValue: currentProject,
//           fileName: req.body?.fileName,
//           createdBy: req.body?.createdBy,
//           createdAt: new Date(),
//         });
//       } else {
//         let remark = "Project details already exist.";
//         invalidData.push({ ...excelData[k], failedRemark: remark });
//       }
//     }

//     if (validData.length > 0) {
//       Project.insertMany(validData)
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

exports.bulkUpload_Project = (req, res, next) => {
  var excelData = req.body.data;
  var validData = [];
  var invalidData = [];
  var failedRecords = [];
  var rowSet = new Set();
  var DuplicateCount = 0;

  processData();

  async function processData() {
    // Fetch all existing projects from the database
    let allProjects = await getAllProjects({});

    for (var k = 0; k < excelData.length; k++) {
      let currentProject = excelData[k].project?.trim();
      let remark = ""; // Initialize remark

      // Check if project is valid in the file
      if (!currentProject || currentProject === "-") {
        remark = "Project not found";
        invalidData.push({ ...excelData[k], failedRemark: remark });
        continue; // Skip to the next iteration
      }

      // Check for duplicate entries in the same file
      if (rowSet.has(currentProject)) {
        remark = "Duplicate project in the file";
        invalidData.push({ ...excelData[k], failedRemark: remark });
        DuplicateCount++;
        continue; // Skip to the next iteration
      }

      rowSet.add(currentProject); // Add project to the set to track duplicates

      // Check if the project already exists in the database
      let projectExists = allProjects?.some(
        (item) => item.fieldValue === currentProject,
      );

      if (!projectExists) {
        // If the project doesn't exist, add to valid data
        validData.push({
          fieldValue: currentProject,
          fileName: req.body?.fileName,
          createdBy: req.body?.createdBy,
          createdAt: new Date(),
        });
      } else {
        // If the project already exists, add to invalid data
        remark = "Project details already exist.";
        invalidData.push({ ...excelData[k], failedRemark: remark });
      }
    }

    // Insert valid data into the "good" records collection
    if (validData.length > 0) {
      Project.insertMany(validData)
        .then((data) => {
          console.log("Valid data inserted", data);
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

    // Return a response with the status of the upload process
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
  Project.find({ fileName: req.params.fileName })
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
          finaldata.totalRecords = badData[0]?.totalRecords;
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

// exports.bulkUpload_Project = (req, res, next) => {
//   // console.log("req.body.data",req.body.data)
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
//     for (var k = 0; k < excelData.length; k++) {
//       if (excelData[k].project == "-") {
//         remark += "project not found";
//       }

//       console.log("remark", remark);
//       if (remark == "") {
//         var allProjects = await getAllProjects({});
//         console.log("allProjects", allProjects.length);

//         var projectExists = allProjects?.filter((item) => {
//           if (item.fieldValue === excelData[k].project.trim()) {
//             return item;
//           }
//         });
//         console.log("projectExists", projectExists);

//         if (projectExists.length == 0) {
//           validObjects.fieldValue = excelData[k].project.trim();
//           validObjects.fileName = req.body?.fileName;
//           validObjects.createdBy = req.body?.createdBy;
//           validObjects.createdAt = new Date();
//           console.log("validObjects", validObjects);
//           validData.push(validObjects);
//         } else {
//           remark = "Project details already exists.";
//           invalidObjects.fieldValue = excelData[k].project;
//           invalidObjects = excelData[k];
//           invalidObjects.failedRemark = remark;
//           invalidData.push(invalidObjects);
//           console.log(
//             "invalidObjects projectExists",
//             invalidObjects,
//             invalidObjects.failedRemark
//           );
//         }
//       } else {
//         invalidObjects.fieldValue = excelData[k].project;
//         invalidObjects = excelData[k];
//         invalidObjects.failedRemark = remark;
//         invalidData.push(invalidObjects);
//       }
//       remark = "";
//     }
//     console.log("validData", validData.length);
//     console.log("remark 1", remark);
//     Project.insertMany(validData)
//       .then(async (data) => {
//         console.log("data", data);
//       })
//       .catch((err) => {
//         console.log("Project.insertMany", err);
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
