const BusinessUnitMaster = require("./model.js");
const mongoose = require("mongoose");

exports.createBusinessUnit = async (req, res) => {
    try {
        const existing = await BusinessUnitMaster.findOne({
            fieldValue: req.body.fieldValue,
        });

        if (existing) {
            return res.status(409).json({ message: "BusinessUnit already exists" });
        }

        const businessunit = new BusinessUnitMaster({
            _id: new mongoose.Types.ObjectId(),
            fieldValue: req.body.fieldValue,
            createdBy: req.body.user_id,
        });

        const result = await businessunit.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getBusinessUnits = async (req, res) => {
    try {
        const data = await BusinessUnitMaster.find().sort({ fieldValue: 1 });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getData = async (req, res) => {
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);

    try {
        const totalRecs = await BusinessUnitMaster.countDocuments();
        const data = await BusinessUnitMaster.find()
            .skip(parseInt(skipRec))
            .limit(parseInt(recsPerPage))
            .sort({ createdAt: -1 });

        res.status(200).json({
            totalRecs: totalRecs,
            tableData: data,
            success: true,
        });
    } catch (error) {
        res.status(500).json({ errorMsg: error.message, success: false });
    }
};

exports.updateBusinessUnit = async (req, res) => {
    try {
        const businessunit = await BusinessUnitMaster.findById(req.params.id);

        if (!businessunit) {
            return res.status(404).json({ error: "BusinessUnit not found" });
        }

        const { fieldValue, user_id } = req.body;

        const existing = await BusinessUnitMaster.findOne({
            fieldValue: fieldValue,
            _id: { $ne: req.params.id },
        });

        if (existing) {
            return res.status(409).json({ message: "BusinessUnit with this name already exists" });
        }

        let updated = false;
        if (businessunit.fieldValue !== fieldValue) {
            businessunit.fieldValue = fieldValue;
            updated = true;
        }

        if (updated) {
            businessunit.updateLog.push({
                updatedBy: user_id,
                updatedAt: new Date(),
            });
            const result = await businessunit.save();
            return res.status(200).json({ result, success: true, message: "BusinessUnit updated successfully" });
        } else {
            return res.status(200).json({ success: false, message: "No changes detected" });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.deleteBusinessUnit = async (req, res) => {
    try {
        await BusinessUnitMaster.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "BusinessUnit deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};
