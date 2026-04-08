const AssetDisposal = require("./model.js");
const Asset = require("../assetManagementnew/model.js");
const mongoose = require("mongoose");
const { Types: { ObjectId } } = mongoose;
const moment = require("moment");
const User = require("../../admin2.0/userManagementnew/ModelUsers.js");

const resolveUserName = async (user_id, userName) => {
  if (user_id && mongoose.Types.ObjectId.isValid(user_id) && (!userName || userName === "System")) {
    try {
      const user = await User.findById(user_id);
      if (user && user.profile) {
        return user.profile.fullName || `${user.profile.firstname} ${user.profile.lastname || ""}`.trim() || user.profile.name || userName;
      }
    } catch (e) {
      console.error("Error resolving name:", e);
    }
  }
  return userName || "System";
};

// Helper to calculate NBV (Net Book Value) as of a specific date
const calculateNBV = (purchaseCost, purchaseDate, usefulLife, asOfDate) => {
    if (!purchaseCost || !purchaseDate || !usefulLife) return 0;
    
    const pDate = moment(purchaseDate);
    const dDate = moment(asOfDate);
    const yearsHeld = dDate.diff(pDate, 'years', true);
    
    if (yearsHeld < 0) return purchaseCost;
    
    const annualDepr = purchaseCost / usefulLife;
    const accumulatedDepr = Math.min(purchaseCost, annualDepr * yearsHeld);
    const nbv = Math.max(0, purchaseCost - accumulatedDepr);
    
    return Math.round(nbv);
};

exports.createDisposalRequest = async (req, res) => {
    try {
        const { asset_id, disposalDate, disposalValue, makerRemarks, center_id, user_id, userName: providedUserName } = req.body;
        const userName = await resolveUserName(user_id, providedUserName);
        
        if (!asset_id) {
            return res.status(400).json({ success: false, message: "Asset ID is required" });
        }

        const asset = await Asset.findById(asset_id);
        if (!asset) {
            return res.status(404).json({ success: false, message: "Asset not found" });
        }

        const nbvAtDisposal = calculateNBV(
            asset.purchaseCost, 
            asset.purchaseDate, 
            asset.usefulLife, 
            disposalDate
        );

        const financialImpact = parseFloat((disposalValue - nbvAtDisposal).toFixed(2));

        // Fallback for center_id if not provided
        const finalCenterId = center_id && center_id !== "all" 
            ? center_id 
            : (asset.currentAllocation?.center?._id || asset.center_id);

        if (!finalCenterId) {
            return res.status(400).json({ success: false, message: "Center ID is required for disposal records" });
        }

        const disposal = new AssetDisposal({
            ...req.body,
            center_id: finalCenterId,
            nbvAtDisposal,
            disposalValue: Math.round(disposalValue),
            financialImpact,
            status: "PENDING",
            createdBy: user_id ? new ObjectId(user_id) : null,
            makerRemarks: makerRemarks || "Asset disposal request"
        });

        const result = await disposal.save();
        
        // Update asset status to DISPOSAL_PENDING while disposal is pending
        await Asset.findByIdAndUpdate(asset_id, { 
            assetStatus: "DISPOSAL_PENDING",
            $push: { 
                statusHistory: {
                    action: "DISPOSAL_REQUEST",
                    status: "DISPOSAL_PENDING",
                    performedBy: { _id: user_id, name: userName },
                    remarks: makerRemarks || "Disposal request submitted",
                    date: new Date()
                }
            }
        });

        res.status(201).json({ success: true, message: "Disposal Request Submitted", data: result });
    } catch (error) {
        console.error("Create Disposal Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getDisposalList = async (req, res) => {
    try {
        const { center_id, status } = req.body;
        const query = {};
        if (center_id && center_id !== "all") query.center_id = new ObjectId(center_id);
        if (status && status !== "all") query.status = status;

        const list = await AssetDisposal.find(query)
            .populate("asset_id", "assetID assetName category model purchaseCost")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, tableData: list });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.approveDisposal = async (req, res) => {
    try {
        const { disposalId, status, remarks, user_id, userName: providedUserName } = req.body;
        const userName = await resolveUserName(user_id, providedUserName);
        
        const disposal = await AssetDisposal.findById(disposalId);
        if (!disposal) {
            return res.status(404).json({ success: false, message: "Disposal record not found" });
        }

        if (status === "APPROVED") {
            disposal.status = "APPROVED";
            disposal.approvedBy = {
                _id: new ObjectId(user_id),
                name: userName,
                at: new Date()
            };
            
            // Mark asset as DISPOSED permanent
            await Asset.findByIdAndUpdate(disposal.asset_id, { 
                assetStatus: "DISPOSED",
                $push: { 
                    statusHistory: {
                        action: "DISPOSAL",
                        status: "DISPOSED",
                        performedBy: { _id: user_id, name: userName },
                        remarks: remarks || "Asset Disposed",
                        date: new Date()
                    }
                }
            });
        } else {
            disposal.status = "REJECTED";
            // Return asset to INACTIVE (since it was likely inactive before disposal request)
            await Asset.findByIdAndUpdate(disposal.asset_id, { 
                assetStatus: "INACTIVE",
                $push: { 
                    statusHistory: {
                        action: "DISPOSAL_REJECTION",
                        status: "INACTIVE",
                        performedBy: { _id: user_id, name: userName },
                        remarks: remarks || "Disposal Request Rejected",
                        date: new Date()
                    }
                }
            });
        }

        await disposal.save();
        res.status(200).json({ success: true, message: `Disposal Request ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
