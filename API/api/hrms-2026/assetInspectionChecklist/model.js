const mongoose = require("mongoose");
const { Schema } = mongoose;

const assetInspectionChecklistSchema = new Schema(
    {
        category_id: { type: Schema.Types.ObjectId, ref: "assetcategorymasters", required: true },
        subCategory_id: { type: Schema.Types.ObjectId, ref: "assetsubcategories", required: true },
        checklist: [
            { type: String, trim: true }
        ],
        createdBy: { type: Schema.Types.ObjectId, ref: "users" },
        createdAt: { type: Date, default: Date.now },
        updatedBy: { type: Schema.Types.ObjectId, ref: "users" },
        updatedAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model("asset-inspection-checklists", assetInspectionChecklistSchema);
