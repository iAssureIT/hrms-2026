const AccountHeadMasterModal = require("./model");
const mongoose = require("mongoose");

exports.createAccountHeadMaster = async (req, res) => {
  try {
    const existingAssets = await AccountHeadMasterModal.findOne({
      fieldValue: req.body.fieldValue,
    });

    if (existingAssets) {
      return res.status(409).json({ message: "Account Head already exists" });
    }

    const assets = new AccountHeadMasterModal({
      _id: new mongoose.Types.ObjectId(),
      fieldValue: req.body.fieldValue,
      createdBy: req.body.user_id,
    });

    const result = await assets.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// exports.getAssets = async (req, res) => {
//   try {
//     const activitys = await AccountHeadMasterModal.find();
//     res.status(200).json(activitys);
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// };

exports.getAccountHeadMasterData = async (req, res) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  // console.log("req.body => ", req.body);

  AccountHeadMasterModal.countDocuments()
    .then((totalRecs) => {
      // console.log("totalRecs => ", totalRecs);
      AccountHeadMasterModal.find()
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

exports.updateAccountHeadMaster = async (req, res) => {
  // console.log(req.body);
  try {
    const activity = await AccountHeadMasterModal.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ error: "Assets not found" });
    }
    const { fieldValue, fieldLableName, imageName, imageUrl, user_id } =
      req.body;

    const existingAssets = await AccountHeadMasterModal.findOne({
      fieldValue: req.body.fieldValue,
      _id: { $ne: req.params.id }, // Exclude the current activity from the check
    });

    if (existingAssets) {
      // If an activity with the same fieldValue and fieldName exists, send a response indicating duplication
      return res
        .status(409)
        .json({ message: "Assets with the same name already exists" });
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
          // WRD.updateMany(
          //   { activity_id: result._id },
          //   { $set: { activity: result.fieldValue } }
          // ),
        ]);
      } catch (updateError) {
        console.error("AssetName updated, but cascading update failed:", updateError);
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

exports.deleteAccountHeadMaster = async (req, res) => {
  try {
    await AccountHeadMasterModal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Assets deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.bulkUpload_AccountHeader = (req, res, next) => {
  var excelData = req.body.data;
  var validData = [];
  var invalidData = [];
  var failedRecords = [];
  var rowSet = new Set();
  var DuplicateCount = 0;

  processData();

  async function processData() {
    try {
      // Fetch all existing records
      let allAccountHeaders = await AccountHeadMasterModal.find({}).select("fieldValue");

      for (var k = 0; k < excelData.length; k++) {
        let currentFieldValue = excelData[k].fieldValue?.trim();
        let remark = "";

        // ❌ If empty
        if (!currentFieldValue || currentFieldValue === "-") {
          remark = "Account Header not found";
          invalidData.push({ ...excelData[k], failedRemark: remark });
          continue;
        }

        // ❌ Duplicate inside uploaded file
        if (rowSet.has(currentFieldValue.toLowerCase())) {
          remark = "Duplicate Account Header in the file";
          invalidData.push({ ...excelData[k], failedRemark: remark });
          DuplicateCount++;
          continue;
        }

        rowSet.add(currentFieldValue.toLowerCase());

        // ❌ Check if already exists in DB
        let alreadyExists = allAccountHeaders?.some(
          (item) =>
            item.fieldValue?.toLowerCase() ===
            currentFieldValue.toLowerCase()
        );

        if (!alreadyExists) {
          // ✅ Valid record
          validData.push({
            _id: new mongoose.Types.ObjectId(),
            fieldValue: currentFieldValue,
            fileName: req.body?.fileName,
            createdBy: req.body?.createdBy,
            createdAt: new Date(),
          });
        } else {
          remark = "Account Header already exists.";
          invalidData.push({ ...excelData[k], failedRemark: remark });
        }
      }

      // ✅ Insert valid records
      if (validData.length > 0) {
        await AccountHeadMasterModal.insertMany(validData);
      }

      // ❌ Store failed records (if you have failedRecords collection)
      if (invalidData.length > 0) {
        failedRecords.FailedRecords = invalidData;
        failedRecords.fileName = req.body.fileName;
        failedRecords.totalRecords = invalidData.length;

        if (typeof insertFailedRecords === "function") {
          await insertFailedRecords(
            failedRecords,
            req.body.updateBadData
          );
        }
      }

      // ✅ Final Response
      res.status(200).json({
        message: "Bulk upload process completed successfully!",
        completed: true,
        validRecords: validData.length,
        invalidRecords: invalidData.length,
        duplicates: DuplicateCount,
      });

    } catch (error) {
      console.log("Bulk Upload Error:", error);
      res.status(500).json({
        message: "Internal Server Error",
        completed: false,
      });
    }
  }
};



exports.getAccountHeadList = async (req, res) => {
  try {
    console.log("getAccountHeadList");

    // ✅ Get good records
    const goodData = await AccountHeadMasterModal.find(
      {},
      { fieldValue: 1 }
    )
      .sort({ fieldValue: 1 })
      .lean();

    const formattedGoodData = goodData.map((item) => ({
      _id: item._id,
      fieldValue: item.fieldValue,
    }));

    // ✅ Get failed records (latest file OR based on fileName if passed)
    let failedData = [];

    if (req.query.fileName) {
      const failed = await FailedRecordsModal.findOne({
        fileName: req.query.fileName,
      }).lean();

      if (failed && failed.FailedRecords) {
        failedData = failed.FailedRecords;
      }
    }

    // ✅ Final response
    res.status(200).json({
      success: true,
      goodrecords: formattedGoodData,
      failedRecords: failedData,
    });
  } catch (error) {
    console.error("Error fetching account heads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch account heads",
    });
  }
};
