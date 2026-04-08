const mongoose = require("mongoose");
const AssetInspectionChecklist = require("./model");

// CREATE
exports.createChecklist = async (req, res) => {
    try {
        const { category_id, subCategory_id, checklist } = req.body;

        // Check if one already exists for this category + subcategory
        const existingChecklist = await AssetInspectionChecklist.findOne({
            category_id,
            subCategory_id
        });

        if (existingChecklist) {
            return res.status(400).json({
                message: "A checklist already exists for this Asset Category and Sub-Category.",
                success: false
            });
        }

        const newChecklist = new AssetInspectionChecklist({
            category_id,
            subCategory_id,
            checklist: checklist || [],
            createdBy: req.body.user_id,
        });

        const savedChecklist = await newChecklist.save();
        res.status(201).json({ message: "Checklist created successfully", data: savedChecklist });
    } catch (err) {
        res.status(400).json({ message: err.message, success: false });
    }
};

// READ ALL
exports.getAllChecklists = async (req, res) => {
    try {
        const data = await AssetInspectionChecklist.find()
            .populate('category_id')
            .populate('subCategory_id')
            .sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ BY CATEGORY AND SUBCATEGORY
exports.getChecklistByCategory = async (req, res) => {
    try {
        const { category_id, subCategory_id } = req.params;
        const data = await AssetInspectionChecklist.findOne({
            category_id,
            subCategory_id
        }).populate('category_id').populate('subCategory_id');

        if (!data) return res.status(404).json({ message: "No checklist found for this category.", checklist: [] });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE
exports.updateChecklist = async (req, res) => {
    try {
        const updateData = {
            category_id: req.body.category_id,
            subCategory_id: req.body.subCategory_id,
            checklist: req.body.checklist,
            updatedBy: req.body.user_id,
            updatedAt: new Date()
        };

        const updatedItem = await AssetInspectionChecklist.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ message: "Checklist not found" });

        res.status(200).json({ message: "Checklist updated", data: updatedItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE
exports.deleteChecklist = async (req, res) => {
    try {
        await AssetInspectionChecklist.findByIdAndDelete(req.params.id);
        res.json({ message: "Checklist deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
