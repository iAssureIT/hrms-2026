const JobTypeMaster = require("./model.js");
const mongoose = require("mongoose");

exports.createJobTiming = async (req, res) => {
    console.log("Request Body:", req.body); // Debugging log
    
    try {
        const existing = await JobTimingMaster.findOne({
            fieldValue: req.body.fieldValue,
        });

        if (existing) {
            return res.status(409).json({ message: "JobTiming already exists" });
        }

        const jobtiming = new JobTimingMaster({
            _id: new mongoose.Types.ObjectId(),
            fieldValue: req.body.fieldValue,
            createdBy: req.body.user_id,
        });

        const result = await jobtiming.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getJobTimings = async (req, res) => {
    try {
        const data = await JobTimingMaster.find().sort({ fieldValue: 1 });
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
        const totalRecs = await JobTimingMaster.countDocuments();
        const data = await JobTimingMaster.find()
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

exports.updateJobTiming = async (req, res) => {
    try {
        const jobtiming = await JobTimingMaster.findById(req.params.id);

        if (!jobtiming) {
            return res.status(404).json({ error: "JobTiming not found" });
        }

        const { fieldValue, user_id } = req.body;

        const existing = await JobTimingMaster.findOne({
            fieldValue: fieldValue,
            _id: { $ne: req.params.id },
        });

        if (existing) {
            return res.status(409).json({ message: "JobTiming with this name already exists" });
        }

        let updated = false;
        if (jobtiming.fieldValue !== fieldValue) {
            jobtiming.fieldValue = fieldValue;
            updated = true;
        }

        if (updated) {
            jobtiming.updateLog.push({
                updatedBy: user_id,
                updatedAt: new Date(),
            });
            const result = await jobtiming.save();
            return res.status(200).json({ result, success: true, message: "JobTiming updated successfully" });
        } else {
            return res.status(200).json({ success: false, message: "No changes detected" });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.deleteJobTiming = async (req, res) => {
    try {
        await JobTimingMaster.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "JobTiming deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};
