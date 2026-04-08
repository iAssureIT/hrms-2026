const mongoose = require('mongoose');

const subdepartmentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dropdownvalue: { type: String, trim: true, required: true }, // Department Name
    dropdown_id: { type: mongoose.Schema.Types.ObjectId, ref: "departmentmasters" },
    inputValue: { type: String, trim: true, required: true }, // Sub-Department Name
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

module.exports = mongoose.model('subdepartmentmasters', subdepartmentSchema);
