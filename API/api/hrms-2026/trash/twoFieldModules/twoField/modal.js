const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dropdownValue: { type: String, trim: true, required: true },
    inputValue: { type: String, trim: true, required: true }
});

module.exports = mongoose.model('Item', itemSchema);
