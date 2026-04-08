const AssetAudit = require('./model.js');
const AssetManagement = require('../assetManagementnew/model.js');
const Centers = require('../centers/model.js');
const mongoose = require('mongoose');
const User = require("../../admin2.0/userManagementnew/ModelUsers.js");

exports.createAudit = async (req, res) => {
    try {
        const { auditTitle, center_id, user_id } = req.body;
        
        // Generate Audit No
        const lastAudit = await AssetAudit.findOne().sort({ createdAt: -1 });
        let nextNo = 1;
        if (lastAudit && lastAudit.auditNo) {
            const lastNo = parseInt(lastAudit.auditNo.split('-').pop());
            nextNo = lastNo + 1;
        }
        const auditNo = `AUDIT-2024-${nextNo.toString().padStart(4, '0')}`;

        // Fetch all assets for this center to initialize audit (Exclude DISPOSED assets)
        const query = center_id === 'all' 
            ? { assetStatus: { $ne: 'DISPOSED' } } 
            : { 'currentAllocation.center._id': new mongoose.Types.ObjectId(center_id), assetStatus: { $ne: 'DISPOSED' } };
        console.log("Audit Initialization Query:", query);
        const assets = await AssetManagement.find(query).select('assetName assetID _id category location');
        console.log("Assets Found for Audit:", assets.length);

        const auditResults = assets.map(asset => ({
            asset_id: asset._id,
            assetName: asset.assetName,
            assetID: asset.assetID,
            physicalStatus: 'Not Verified',
            locationMatch: true
        }));

        const newAudit = new AssetAudit({
            auditNo,
            auditTitle,
            center_id: center_id === 'all' ? null : center_id,
            auditResults,
            summary: {
                totalAssets: assets.length,
                verifiedAssets: 0,
                missingAssets: 0,
                discrepancyCount: 0
            },
            createdBy: user_id,
            status: 'In-Progress'
        });

        await newAudit.save();
        res.status(200).json({ success: true, message: "Audit Initialized", audit_id: newAudit._id });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAuditList = async (req, res) => {
    try {
        const { center_id } = req.body;
        const query = (center_id && center_id !== 'all') ? { center_id: { $in: [center_id, 'all'] } } : {};
        const list = await AssetAudit.find(query).sort({ createdAt: -1 }).populate('center_id', 'centerName');
        
        const tableData = list.map(item => ({
            _id: item._id,
            auditNo: item.auditNo,
            auditTitle: item.auditTitle,
            centerName: item.center_id?.centerName || 'All Centers',
            auditDate: item.auditDate,
            status: item.status,
            summary: item.summary
        }));

        res.status(200).json({ success: true, tableData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAuditDetails = async (req, res) => {
    try {
        const { audit_id } = req.params;
        const audit = await AssetAudit.findById(audit_id).populate('center_id', 'centerName');
        res.status(200).json({ success: true, data: audit });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateAuditResult = async (req, res) => {
    try {
        const { audit_id, asset_id, physicalStatus, locationMatch, remarks, user_id } = req.body;
        
        const audit = await AssetAudit.findById(audit_id);
        if (!audit) return res.status(404).json({ success: false, message: "Audit not found" });

        const resultIndex = audit.auditResults.findIndex(r => r.asset_id.toString() === asset_id);
        if (resultIndex === -1) return res.status(404).json({ success: false, message: "Asset not found in audit" });

        audit.auditResults[resultIndex].physicalStatus = physicalStatus;
        audit.auditResults[resultIndex].locationMatch = locationMatch;
        audit.auditResults[resultIndex].remarks = remarks;
        audit.auditResults[resultIndex].verifiedBy = user_id;
        audit.auditResults[resultIndex].verifiedAt = new Date();

        // Update Summary
        const verified = audit.auditResults.filter(r => r.physicalStatus !== 'Not Verified').length;
        const missing = audit.auditResults.filter(r => r.physicalStatus === 'Missing').length;
        const discrepancies = audit.auditResults.filter(r => !r.locationMatch || r.physicalStatus === 'Damaged').length;

        audit.summary.verifiedAssets = verified;
        audit.summary.missingAssets = missing;
        audit.summary.discrepancyCount = discrepancies;

        await audit.save();

        // Update Asset Registry status
        const asset = await AssetManagement.findById(asset_id);
        if (asset) {
            if (physicalStatus === 'Missing') {
                if (asset.assetStatus !== 'MISSING') {
                    asset.previousStatusBeforeMissing = asset.assetStatus;
                    asset.assetStatus = 'MISSING';
                    await asset.save();
                }
            } else if (physicalStatus === 'Found') {
                if (asset.assetStatus === 'MISSING') {
                    asset.assetStatus = asset.previousStatusBeforeMissing || 'ACTIVE';
                    asset.previousStatusBeforeMissing = undefined;
                    await asset.save();
                }
            }
        }

        res.status(200).json({ success: true, message: "Result updated", summary: audit.summary });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.finalizeAudit = async (req, res) => {
    try {
        const { audit_id } = req.body;
        await AssetAudit.findByIdAndUpdate(audit_id, { status: 'Completed' });
        res.status(200).json({ success: true, message: "Audit finalized" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAssetHistory = async (req, res) => {
    try {
        const { asset_id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(asset_id)) {
            return res.status(400).json({ success: false, message: "Invalid asset ID" });
        }
        const asset = await AssetManagement.findById(asset_id);
        if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });

        const history = await Promise.all(asset.statusHistory.map(async (item) => {
            // Helper to format status Labels
            let statusLabel = item.status;
            if (statusLabel === "ASSET_APPROVAL_PENDING") statusLabel = "Pending Approval";
            else if (statusLabel === "ACTIVE") statusLabel = "Active / Available";
            else if (statusLabel === "ALLOCATED") statusLabel = "Allocated";
            else statusLabel = statusLabel?.replace(/_/g, ' ');

            // Helper for Role titles
            let roleTitle = "System";
            if (item.action === "CREATION") roleTitle = "Asset Incharge";
            else if (item.action === "REGISTRY_APPROVAL") roleTitle = "Asset Manager / Admin";
            else if (item.action === "TRANSACTION_APPROVAL") roleTitle = "Asset Manager";
            else if (item.action === "ALLOCATION") roleTitle = "Asset Incharge";

            // Resolve name if "System" or missing but ID is present
            let displayName = item.performedBy?.name || "System";
            let resolveId = item.performedBy?._id || (item.action === "CREATION" ? asset.createdBy?._id : null);
            
            if ((displayName === "System" || !item.performedBy?.name) && resolveId && mongoose.Types.ObjectId.isValid(resolveId)) {
                try {
                    const user = await User.findById(resolveId);
                    if (user && user.profile) {
                        displayName = user.profile.fullName || `${user.profile.firstname} ${user.profile.lastname || ""}`.trim() || user.profile.name || displayName;
                    } else if (item.action === "CREATION" && asset.createdBy?.name) {
                        displayName = asset.createdBy.name;
                    }
                } catch (e) {
                    console.error("Error resolving name for history:", e);
                }
            }
            
            return {
                title: item.action?.replace(/_/g, ' '),
                statusLabel: statusLabel,
                employeeName: displayName,
                date: item.date || item.createdAt || asset.createdAt,
                remarks: item.remarks,
                roleTitle: roleTitle
            };
        }));

        // Sort history by date descending for the timeline if needed, 
        // but frontend usually expects ascending for timeline. 
        // Let's keep it as is (insertion order).

        res.status(200).json({ success: true, history: history.reverse() }); // Reverse to show latest first or as per timeline design
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
