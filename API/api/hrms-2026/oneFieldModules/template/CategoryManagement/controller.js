const Category = require('./model');
const mongoose = require('mongoose');

exports.createCategory = async (req, res) => {
    console.log('Creating category',req.body.formValues);
    const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        fieldValue: req.body.fieldValue, 
        imageName : req.body.imageName, 
        imageUrl  : req.body.imageUrl, 
    });

    try {
        const result = await category.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const degrees = await Category.find();
        res.status(200).json(degrees);
    } catch (error) {
        res.status(500).json({ error });
    }
};


exports.updateCategory = async (req, res) => {
    console.log(req.body);
    try {
        // Find the existing category by ID
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const newFieldValue = req.body;
        category.fieldValue = `${newFieldValue.fieldValue}`;
        category.imageName = `${newFieldValue.imageName}`; 
        category.imageUrl  = `${newFieldValue.imageUrl}`; 
        const result = await category.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error });
    }
};
