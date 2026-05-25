const DesignationMaster = require("./model.js");
const mongoose = require("mongoose");

exports.createDesignation = async (req, res) => {
    try {
        const existing = await DesignationMaster.findOne({
            fieldValue: req.body.fieldValue,
        });

        if (existing) {
            return res.status(409).json({ message: "Designation already exists" });
        }

        const designation = new DesignationMaster({
            _id: new mongoose.Types.ObjectId(),
            fieldValue: req.body.fieldValue,
            createdBy: req.body.user_id,
        });

        const result = await designation.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getDesignations = async (req, res) => {
    try {
        const data = await DesignationMaster.find().sort({ fieldValue: 1 });
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
        const totalRecs = await DesignationMaster.countDocuments();
        const data = await DesignationMaster.find()
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

exports.updateDesignation = async (req, res) => {
    try {
        const designation = await DesignationMaster.findById(req.params.id);

        if (!designation) {
            return res.status(404).json({ error: "Designation not found" });
        }

        const { fieldValue, user_id } = req.body;

        const existing = await DesignationMaster.findOne({
            fieldValue: fieldValue,
            _id: { $ne: req.params.id },
        });

        if (existing) {
            return res.status(409).json({ message: "Designation with this name already exists" });
        }

        let updated = false;
        if (designation.fieldValue !== fieldValue) {
            designation.fieldValue = fieldValue;
            updated = true;
        }

        if (updated) {
            designation.updateLog.push({
                updatedBy: user_id,
                updatedAt: new Date(),
            });
            const result = await designation.save();
            return res.status(200).json({ result, success: true, message: "Designation updated successfully" });
        } else {
            return res.status(200).json({ success: false, message: "No changes detected" });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.deleteDesignation = async (req, res) => {
    try {
        await DesignationMaster.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Designation deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};
