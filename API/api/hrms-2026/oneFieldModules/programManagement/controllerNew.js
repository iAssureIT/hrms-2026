const Program = require("./modelNew");
const mongoose = require("mongoose");
const FailedRecords = require("../../failedRecords/model.js");
const SubactivityMapping = require("../../SubactivityMapping/model.js");
const AnnualPlan = require("../../annual-plan/model.js");
const Approval = require("../../approval-details/model.js");
const Utilization = require("../../utilization-details/model.js");
const FundManagement = require("../../fund-management/model.js");
const Plantation = require("../../plantation/model.js");
const WRD = require("../../wrd/model.js");


exports.createProgram = async (req, res) => {
  // console.log("Creating Program", req.body);
  // const { fieldValue, fieldLableName, imageName, imageUrl, user_id } = req.body;

  try {
    // Check if an activity with the same fieldValue and fieldName already exists
    const existingProgram = await Program.findOne({
      fieldValue: req.body.fieldValue,
    });

    if (existingProgram) {
      // If the activity already exists, send a response indicating duplication
      return res.status(409).json({ message: "Program already exists" });
    }
    const program = new Program({
      _id: new mongoose.Types.ObjectId(),
      fieldValue: req.body.fieldValue,
      createdBy: req.body.user_id,
      // imageName: req.body.imageName,
      // imageUrl: req.body.imageUrl,
    });

    const result = await program.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getProgram = async (req, res) => {
  try {
    const programs = await Program.find();
    // console.log(programs);
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getProgramData = async (req, res) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  console.log("req.body => ", req.body);

  Program.countDocuments()
    .then((totalRecs) => {
      console.log("totalRecs => ", totalRecs);
      Program.find()
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
exports.updateProgram = async (req, res) => {
  // console.log(req.body);
  try {
    // Find the existing Program by ID
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    const { fieldValue, fieldLableName, imageName, imageUrl, user_id } =
      req.body;

    // Check if an activity with the new fieldValue and fieldName already exists
    const existingProgram = await Program.findOne({
      fieldValue: req.body.fieldValue,
      _id: { $ne: req.params.id }, // Exclude the current activity from the check
    });

    if (existingProgram) {
      // If an activity with the same fieldValue and fieldName exists, send a response indicating duplication
      return res
        .status(409)
        .json({ message: "Program with the same name already exists" });
    }

    let updated = false;
    if (program.fieldValue !== fieldValue) {
      program.fieldValue = fieldValue;
      updated = true;
    }
    if (program.imageName !== imageName) {
      program.imageName = imageName;
      updated = true;
    }
    if (program.imageUrl !== imageUrl) {
      program.imageUrl = imageUrl;
      updated = true;
    }

    if (updated) {
      program.updateLog.push({
        updatedBy: user_id,
        updatedAt: new Date(),
      });

      const result = await program.save();
      try {
      // 🔁 Cascade update to related collections
        await Promise.all([
          SubactivityMapping.updateMany(
            { field1_id: program._id },
            { $set: { field1Value: program.fieldValue } }
          ),
          AnnualPlan.updateMany(
            { program_id: program._id },
            { $set: { program: program.fieldValue } }
          ),
          Approval.updateMany(
            { program_id: program._id },
            { $set: { program: program.fieldValue } }
          ),
          Utilization.updateMany(
            { program_id: program._id },
            { $set: { program: program.fieldValue } }
          ),        
          FundManagement.updateMany(
            { program_id: program._id },
            { $set: { program: program.fieldValue } }
          ),
          Plantation.updateMany(
            { program_id: program._id },
            { $set: { program: program.fieldValue } }
          ),
          WRD.updateMany(
            { program_id: program._id },
            { $set: { program: program.fieldValue } }
          ),
        ]);
      } catch (updateError) {
        console.error("program updated, but cascading update failed:", updateError);
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

  //   const newFieldValue = req.body;
  //   program.fieldValue = `${newFieldValue.fieldValue}`;

  //   program.updateLog.push({
  //     updatedBy:newFieldValue.user_id,
  //     updatedAt:new Date(),
  // })
  //   const result = await program.save();
  //   res.status(200).json(result);
  // } catch (error) {
  //   res.status(500).json({ error });
  // }
};

exports.deleteProgram = async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Program deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

var getAllPrograms = async () => {
  return new Promise(function (resolve, reject) {
    Program.find()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.bulkUpload_Program = (req, res, next) => {
  var excelData = req.body.data;
  var validData = [];
  var invalidData = [];
  var failedRecords = [];
  var rowSet = new Set();
  var DuplicateCount = 0;

  processData();

  async function processData() {
    // Fetch all existing programs in the database
    let allPrograms = await getAllPrograms({});

    for (var k = 0; k < excelData.length; k++) {
      let currentProgram = excelData[k].program?.trim();
      let remark = ""; // Reset remark for each row

      // Check if the program is valid in the file
      if (!currentProgram || currentProgram === "-") {
        remark = "Program not found";
        invalidData.push({ ...excelData[k], failedRemark: remark });
        continue; // Skip the rest of the loop for this iteration
      }

      // Check for duplicates within the uploaded file itself
      if (rowSet.has(currentProgram)) {
        remark = "Duplicate program in the file";
        invalidData.push({ ...excelData[k], failedRemark: remark });
        DuplicateCount++;
        continue; // Skip the rest of the loop for this iteration
      }

      rowSet.add(currentProgram);

      // Check if the program already exists in the system (database)
      let programExists = allPrograms?.some(
        (item) => item.fieldValue === currentProgram
      );

      // If the program doesn't exist in the system, it's valid
      if (!programExists) {
        validData.push({
          fieldValue: currentProgram,
          fileName: req.body?.fileName,
          createdBy: req.body?.createdBy,
          createdAt: new Date(),
        });
      } else {
        // If the program already exists in the database, mark it as invalid
        remark = "Program details already exist.";
        invalidData.push({ ...excelData[k], failedRemark: remark });
      }
    }

    // Insert valid data into the "good" records collection
    if (validData.length > 0) {
      Program.insertMany(validData)
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
        req.body.updateBadData
      );
      console.log("Failed data", failedData);
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
  Program.find({ fileName: req.params.fileName })
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

// exports.bulkUpload_Program = (req, res, next) => {
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
//       if (excelData[k].program == "-") {
//         remark += "program not found";
//       }

//       console.log("remark", remark);
//       if (remark == "") {
//         var allPrograms = await getAllPrograms({});
//         console.log("allPrograms", allPrograms.length);

//         var programExists = allPrograms?.filter((item) => {
//           if (item.fieldValue === excelData[k].program.trim()) {
//             return item;
//           }
//         });
//         console.log("programExists", programExists);

//         if (programExists.length == 0) {
//           validObjects.fieldValue = excelData[k].program.trim();
//           validObjects.fileName = req.body?.fileName;
//           validObjects.createdBy = req.body?.createdBy;
//           validObjects.createdAt = new Date();
//           console.log("validObjects", validObjects);
//           validData.push(validObjects);
//         } else {
//           remark = "Program details already exists.";
//           invalidObjects.fieldValue = excelData[k].program;
//           invalidObjects = excelData[k];
//           invalidObjects.failedRemark = remark;
//           invalidData.push(invalidObjects);
//           console.log(
//             "invalidObjects programExists",
//             invalidObjects,
//             invalidObjects.failedRemark
//           );
//         }
//       } else {
//         invalidObjects.fieldValue = excelData[k].program;
//         invalidObjects = excelData[k];
//         invalidObjects.failedRemark = remark;
//         invalidData.push(invalidObjects);
//       }
//       remark = "";
//     }
//     console.log("validData", validData.length);
//     console.log("remark 1", remark);
//     Program.insertMany(validData)
//       .then(async (data) => {
//         console.log("data", data);
//       })
//       .catch((err) => {
//         console.log("Program.insertMany", err);
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
