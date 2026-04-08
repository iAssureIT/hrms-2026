const mongoose = require("mongoose");

const assetDepreciationMasterSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dropdownvalue: { type: String, required: true }, // Asset Category Name
    categoryShortName: { type: String }, // Manual Category Short Name
    dropdown_id: { type: mongoose.Schema.Types.ObjectId, ref: "assetcategorymasters", required: true },
    inputValue: { type: Number, required: true }, // Depreciation Rate


    dropdownLabel: { type: String },
    inputLabel: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    createdAt: { type: Date, default: Date.now },
    updateLog: [
        {
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
            updatedAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("assetdepreciationmasters", assetDepreciationMasterSchema);
