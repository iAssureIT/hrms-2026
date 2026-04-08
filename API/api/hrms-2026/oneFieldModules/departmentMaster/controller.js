const DepartmentMaster = require("./model.js");
const mongoose = require("mongoose");

exports.createDepartment = async (req, res) => {
    try {
        const existing = await DepartmentMaster.findOne({
            fieldValue: req.body.fieldValue,
        });

        if (existing) {
            return res.status(409).json({ message: "Department already exists" });
        }

        const department = new DepartmentMaster({
            _id: new mongoose.Types.ObjectId(),
            fieldValue: req.body.fieldValue,
            createdBy: req.body.user_id,
        });

        const result = await department.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getDepartments = async (req, res) => {
    try {
        const data = await DepartmentMaster.find().sort({ fieldValue: 1 });
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
        const totalRecs = await DepartmentMaster.countDocuments();
        const data = await DepartmentMaster.find()
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

exports.updateDepartment = async (req, res) => {
    try {
        const department = await DepartmentMaster.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }

        const { fieldValue, user_id } = req.body;

        const existing = await DepartmentMaster.findOne({
            fieldValue: fieldValue,
            _id: { $ne: req.params.id },
        });

        if (existing) {
            return res.status(409).json({ message: "Department with this name already exists" });
        }

        let updated = false;
        if (department.fieldValue !== fieldValue) {
            department.fieldValue = fieldValue;
            updated = true;
        }

        if (updated) {
            department.updateLog.push({
                updatedBy: user_id,
                updatedAt: new Date(),
            });
            const result = await department.save();
            return res.status(200).json({ result, success: true, message: "Department updated successfully" });
        } else {
            return res.status(200).json({ success: false, message: "No changes detected" });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        await DepartmentMaster.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Department deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};
