const AssetDepreciationMaster = require("./model.js");
const mongoose = require("mongoose");

exports.createDepreciationMaster = async (req, res) => {
    try {
        const existing = await AssetDepreciationMaster.findOne({
            dropdown_id: req.body.dropdown_id
        });

        if (existing) {
            return res.status(409).json({ message: "Depreciation rate already exists for this Category. Please update the existing record." });
        }

        const master = new AssetDepreciationMaster({
            _id: new mongoose.Types.ObjectId(),
            dropdownvalue: req.body.dropdownvalue,
            categoryShortName: req.body.categoryShortName,
            dropdown_id: req.body.dropdown_id,
            inputValue: req.body.inputValue,
            dropdownLabel: req.body.dropdownLabel,

            inputLabel: req.body.inputLabel,
            createdBy: req.body.user_id,
        });


        const result = await master.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getDepreciationMasterData = async (req, res) => {
    try {
        const data = await AssetDepreciationMaster.find().sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
};

// For TwoFieldComponent which might use POST /getdata for pagination (though TwoField often uses GET /get)
exports.getDepreciationMasterPagination = async (req, res) => {
    let recsPerPage = req.body.recsPerPage || 10;
    let pageNum = req.body.pageNumber || 1;
    let skipRec = recsPerPage * (pageNum - 1);

    AssetDepreciationMaster.countDocuments()
        .then((totalRecs) => {
            AssetDepreciationMaster.find()
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

exports.updateDepreciationMaster = async (req, res) => {
    try {
        const master = await AssetDepreciationMaster.findById(req.params.id);

        if (!master) {
            return res.status(404).json({ error: "Record not found" });
        }

        const { dropdownvalue, dropdown_id, inputValue, user_id } = req.body;

        const existing = await AssetDepreciationMaster.findOne({
            dropdown_id: dropdown_id,
            _id: { $ne: req.params.id },
        });

        if (existing) {
            return res.status(409).json({ message: "Depreciation rate already exists for this Category" });
        }

        master.dropdownvalue = dropdownvalue;
        master.categoryShortName = req.body.categoryShortName;
        master.dropdown_id = dropdown_id;
        master.inputValue = inputValue;


        master.updateLog.push({
            updatedBy: user_id,
            updatedAt: new Date(),
        });

        const result = await master.save();
        res.status(200).json({ result, success: true, message: "Depreciation rate updated successfully" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.deleteDepreciationMaster = async (req, res) => {
    try {
        await AssetDepreciationMaster.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Record deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};
