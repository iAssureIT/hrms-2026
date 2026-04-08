const LocationSubcategory = require("./model.js");
const mongoose = require("mongoose");

exports.createLocationSubcategory = async (req, res) => {
    try {
        const existing = await LocationSubcategory.findOne({
            dropdown_id: req.body.dropdown_id,
            inputValue: req.body.inputValue,
        });

        if (existing) {
            return res.status(409).json({ message: "Sub-location already exists for this Center" });
        }

        const subcategory = new LocationSubcategory({
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

exports.getLocationSubcategories = async (req, res) => {
    try {
        const data = await LocationSubcategory.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.updateLocationSubcategory = async (req, res) => {
    try {
        const subcategory = await LocationSubcategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ error: "Sub-location not found" });
        }

        const { dropdownvalue, dropdown_id, inputValue, user_id } = req.body;

        const existing = await LocationSubcategory.findOne({
            dropdown_id: dropdown_id,
            inputValue: inputValue,
            _id: { $ne: req.params.id },
        });

        if (existing) {
            return res.status(409).json({ message: "Sub-location already exists for this Center" });
        }

        subcategory.dropdownvalue = dropdownvalue;
        subcategory.dropdown_id = dropdown_id;
        subcategory.inputValue = inputValue;
        subcategory.updateLog.push({
            updatedBy: user_id,
            updatedAt: new Date(),
        });

        const result = await subcategory.save();
        res.status(200).json({ result, success: true, message: "Sub-location updated successfully" });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.deleteLocationSubcategory = async (req, res) => {
    try {
        await LocationSubcategory.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Sub-location deleted" });
    } catch (error) {
        res.status(500).json({ error });
    }
};
