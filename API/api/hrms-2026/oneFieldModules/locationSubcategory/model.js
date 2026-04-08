const mongoose = require('mongoose');

const locationSubcategorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dropdownvalue: { type: String, trim: true, required: true },
    dropdown_id: { type: mongoose.Schema.Types.ObjectId, ref: "Centers" },
    inputValue: { type: String, trim: true, required: true },
    dropdownLabel: { type: String, trim: true },
    inputLabel: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now() },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    updateLog: [
        {
            updatedAt: { type: Date, default: Date.now() },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
        }
    ],
    fileName: String,
});

module.exports = mongoose.model('locationSubcategories', locationSubcategorySchema);
