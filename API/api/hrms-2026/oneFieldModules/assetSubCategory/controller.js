const AssetSubCategory = require("./model.js");
const mongoose = require("mongoose");
const FailedRecords = require("../../failedRecords/model.js");

exports.createAssetSubCategory = async (req, res) => {
    try {
        const existing = await AssetSubCategory.findOne({
            dropdown_id: req.body.dropdown_id,
            inputValue: req.body.inputValue,
        });

        if (existing) {
            return res.status(409).json({ message: "Asset Subcategory already exists for this Category" });
        }

        const subcategory = new AssetSubCategory({
            _id: new mongoose.Types.ObjectId(),
            dropdownvalue: req.body.dropdownvalue,
            dropdown_id: req.body.dropdown_id,
            inputValue: req.body.inputValue,
            dropdownLabel: req.body.dropdownLabel,
            inputLabel: req.body.inputLabel,
            createdBy: req.body.user_id,
        });

        const result = await subcategory.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getAssetSubCategories = async (req, res) => {
    try {
        const data = await AssetSubCategory.find().sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getAssetSubCategoryData = async (req, res) => {
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);

    AssetSubCategory.countDocuments()
        .then((totalRecs) => {
            AssetSubCategory.find()
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
                    res.status(500).json({ errorMsg: error.message, success: false });
                });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
};

exports.updateAssetSubCategory = async (req, res) => {
    try {
        const subcategory = await AssetSubCategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ error: "Asset Subcategory not found" });
        }

        const { dropdownvalue, dropdown_id, inputValue, user_id } = req.body;

        const existing = await AssetSubCategory.findOne({
            dropdown_id: dropdown_id,
            inputValue: inputValue,
            _id: { $ne: req.params.id },
        });

        if (existing) {
            return res.status(409).json({ message: "Asset Subcategory already exists for this Category" });
        }

        subcategory.dropdownvalue = dropdownvalue;
        subcategory.dropdown_id = dropdown_id;
        subcategory.inputValue = inputValue;
        subcategory.updateLog.push({
            updatedBy: user_id,
            updatedAt: new Date(),
        });

        const result = await subcategory.save();
        res.status(200).json({ result, success: true, message: "Asset Subcategory updated successfully" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.deleteAssetSubCategory = async (req, res) => {
    try {
        await AssetSubCategory.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Asset Subcategory deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

var getAllAssetCategorys = async () => {
    const AssetCategory = mongoose.model('assetcategorymasters');
    return new Promise(function (resolve, reject) {
        AssetCategory.find()
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    });
};

exports.bulkUpload_AssetSubCategory = (req, res, next) => {
    var excelData = req.body.data;
    var validData = [];
    var invalidData = [];
    var failedRecords = [];
    var rowSet = new Set();
    var DuplicateCount = 0;

    processData();

    async function processData() {
        let allCategories = await getAllAssetCategorys();
        let allSubcategories = await AssetSubCategory.find();

        for (var k = 0; k < excelData.length; k++) {
            let categoryName = excelData[k].assetCategory?.trim();
            let subcategoryName = excelData[k].assetSubCategory?.trim();
            let remark = "";

            if (!categoryName || categoryName === "-") {
                remark += "Asset Category not found, ";
            }
            if (!subcategoryName || subcategoryName === "-") {
                remark += "Asset Subcategory not found, ";
            }

            let combinationKey = `${categoryName?.toLowerCase()}_${subcategoryName?.toLowerCase()}`;
            if (rowSet.has(combinationKey)) {
                remark = "Duplicate row in the file";
                invalidData.push({ ...excelData[k], failedRemark: remark });
                DuplicateCount++;
                continue;
            }
            rowSet.add(combinationKey);

            if (remark === "") {
                let categoryAvailability = allCategories.filter(
                    (item) => item.fieldValue.toLowerCase() === categoryName.toLowerCase()
                );

                if (categoryAvailability.length === 0) {
                    remark = categoryName + " is not available in Asset Category Master";
                    invalidData.push({ ...excelData[k], failedRemark: remark });
                } else {
                    let subcategoryExists = allSubcategories.filter(
                        (item) =>
                            item.dropdown_id.toString() === categoryAvailability[0]._id.toString() &&
                            item.inputValue.toLowerCase() === subcategoryName.toLowerCase()
                    );

                    if (subcategoryExists.length === 0) {
                        validData.push({
                            _id: new mongoose.Types.ObjectId(),
                            dropdownvalue: categoryAvailability[0].fieldValue,
                            dropdown_id: categoryAvailability[0]._id,
                            inputValue: subcategoryName,
                            dropdownLabel: "asset category",
                            inputLabel: "asset subcategory",
                            fileName: req.body?.fileName,
                            createdBy: req.body?.createdBy,
                            createdAt: new Date(),
                        });
                    } else {
                        remark = "Asset Subcategory details already exist.";
                        invalidData.push({ ...excelData[k], failedRemark: remark });
                    }
                }
            } else {
                invalidData.push({ ...excelData[k], failedRemark: remark });
            }
        }

        if (validData.length > 0) {
            AssetSubCategory.insertMany(validData)
                .catch((err) => console.log("Bulk Upload Insert Error:", err));
        }

        if (invalidData.length > 0) {
            failedRecords.FailedRecords = invalidData;
            failedRecords.fileName = req.body.fileName;
            failedRecords.totalRecords = invalidData.length;

            const failedRecordsModal = new FailedRecords({
                _id: new mongoose.Types.ObjectId(),
                failedRecords: invalidData,
                fileName: req.body.fileName,
                totalRecords: invalidData.length,
                createdAt: new Date(),
            });
            await failedRecordsModal.save();
        }

        res.status(200).json({
            message: "Bulk upload process completed successfully!",
            completed: true,
            validRecords: validData.length,
            invalidRecords: invalidData.length,
            duplicates: DuplicateCount,
        });
    }
};
