const SubdepartmentMaster = require("./model.js");
const mongoose = require("mongoose");

exports.createSubdepartment = async (req, res) => {
    try {
        const existing = await SubdepartmentMaster.findOne({
            dropdown_id: req.body.dropdown_id, // Department ID
            inputValue: req.body.inputValue, // Sub-Department Name
        });

        if (existing) {
            return res.status(409).json({ message: "Sub-department already exists for this Department" });
        }

        const subdepartment = new SubdepartmentMaster({
            _id: new mongoose.Types.ObjectId(),
            dropdownvalue: req.body.dropdownvalue,
            dropdown_id: req.body.dropdown_id,
            inputValue: req.body.inputValue,
            dropdownLabel: req.body.dropdownLabel,
            inputLabel: req.body.inputLabel,
            createdBy: req.body.user_id,
        });

        const result = await subdepartment.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getSubdepartments = async (req, res) => {
    try {
        const data = await SubdepartmentMaster.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.updateSubdepartment = async (req, res) => {
    try {
        const subdepartment = await SubdepartmentMaster.findById(req.params.id);

        if (!subdepartment) {
            return res.status(404).json({ error: "Sub-department not found" });
        }

        const { dropdownvalue, dropdown_id, inputValue, user_id } = req.body;

        const existing = await SubdepartmentMaster.findOne({
            dropdown_id: dropdown_id,
            inputValue: inputValue,
            _id: { $ne: req.params.id },
        });

        if (existing) {
            return res.status(409).json({ message: "Sub-department already exists for this Department" });
        }

        subdepartment.dropdownvalue = dropdownvalue;
        subdepartment.dropdown_id = dropdown_id;
        subdepartment.inputValue = inputValue;
        subdepartment.updateLog.push({
            updatedBy: user_id,
            updatedAt: new Date(),
        });

        const result = await subdepartment.save();
        res.status(200).json({ result, success: true, message: "Sub-department updated successfully" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.deleteSubdepartment = async (req, res) => {
    try {
        await SubdepartmentMaster.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Sub-department deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};
