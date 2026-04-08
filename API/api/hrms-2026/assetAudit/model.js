const mongoose = require('mongoose');

const assetAuditSchema = mongoose.Schema({
    auditNo: { type: String, required: true, unique: true },
    auditTitle: { type: String, required: true },
    center_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Centers', required: true },
    auditDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Draft', 'In-Progress', 'Completed'], default: 'Draft' },
    summary: {
        totalAssets: { type: Number, default: 0 },
        verifiedAssets: { type: Number, default: 0 },
        missingAssets: { type: Number, default: 0 },
        discrepancyCount: { type: Number, default: 0 }
    },
    auditResults: [{
        asset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetManagement' },
        assetName: String,
        assetID: String,
        physicalStatus: { type: String, enum: ['Found', 'Missing', 'Damaged', 'Not Verified'], default: 'Not Verified' },
        locationMatch: { type: Boolean, default: true },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        remarks: String,
        verifiedAt: { type: Date }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AssetAudit', assetAuditSchema);
