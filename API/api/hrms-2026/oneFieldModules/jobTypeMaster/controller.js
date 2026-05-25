const JobTypeMaster = require("./model.js");
const mongoose = require("mongoose");

exports.createJobType = async (req, res) => {
    try {
        const existing = await JobTypeMaster.findOne({
            fieldValue: req.body.fieldValue,
        });

        if (existing) {
            return res.status(409).json({ message: "JobType already exists" });
        }

        const jobtype = new JobTypeMaster({
            _id: new mongoose.Types.ObjectId(),
            fieldValue: req.body.fieldValue,
            createdBy: req.body.user_id,
        });

        const result = await jobtype.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getJobTypes = async (req, res) => {
    try {
        const data = await JobTypeMaster.find().sort({ fieldValue: 1 });
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
        const totalRecs = await JobTypeMaster.countDocuments();
        const data = await JobTypeMaster.find()
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

exports.updateJobType = async (req, res) => {
    try {
        const jobtype = await JobTypeMaster.findById(req.params.id);

        if (!jobtype) {
            return res.status(404).json({ error: "JobType not found" });
        }

        const { fieldValue, user_id } = req.body;

        const existing = await JobTypeMaster.findOne({
            fieldValue: fieldValue,
            _id: { $ne: req.params.id },
        });

        if (existing) {
            return res.status(409).json({ message: "JobType with this name already exists" });
        }

        let updated = false;
        if (jobtype.fieldValue !== fieldValue) {
            jobtype.fieldValue = fieldValue;
            updated = true;
        }

        if (updated) {
            jobtype.updateLog.push({
                updatedBy: user_id,
                updatedAt: new Date(),
            });
            const result = await jobtype.save();
            return res.status(200).json({ result, success: true, message: "JobType updated successfully" });
        } else {
            return res.status(200).json({ success: false, message: "No changes detected" });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.deleteJobType = async (req, res) => {
    try {
        await JobTypeMaster.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "JobType deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};
