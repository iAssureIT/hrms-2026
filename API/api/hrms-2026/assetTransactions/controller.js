const Transactions = require("./model.js");
const Assets = require("../assetManagementnew/model.js");
const mongoose = require("mongoose");
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

// POST /api/asset-transactions/
exports.createTransaction = async (req, res) => {
  try {
    const {
      asset_id,
      assetID,
      assetName,
      transactionType,
      employee,
      center,
      subLocation,
      department,
      subDepartment,
      inspectionChecklist,
      inspectionRemarks,
      remarks,
      user_id,
      userName: providedUserName
    } = req.body;

    const userName = await resolveUserName(user_id, providedUserName);

    const newTransaction = new Transactions({
      asset_id,
      assetID,
      assetName,
      transactionType,
      transactionStatus: "APPROVAL_PENDING",
      employee: employee || {},
      center: center || {},
      subLocation: subLocation || {},
      department: department || {},
      subDepartment: subDepartment || {},
      inspectionChecklist: Array.isArray(inspectionChecklist) ? inspectionChecklist : [],
      inspectionRemarks,
      remarks,
      approval: {
        status: "PENDING",
        requestedBy: { _id: user_id, name: userName }
      },
      createdBy: { _id: user_id, name: userName }
    });

    const result = await newTransaction.save();

    // Update Asset Status to reflect pending transaction
    let newAssetStatus = "";
    if (transactionType === "ALLOCATION") newAssetStatus = "ALLOCATION_APPROVAL_PENDING";
    else if (transactionType === "DEALLOCATION") newAssetStatus = "DEALLOCATION_APPROVAL_PENDING";
    else if (transactionType === "MAINTENANCE") newAssetStatus = "MAINTENANCE";

    if (newAssetStatus) {
      await Assets.findByIdAndUpdate(asset_id, {
        $set: { assetStatus: newAssetStatus },
        $push: {
          statusHistory: {
            action: transactionType,
            status: newAssetStatus,
            performedBy: { _id: user_id, name: userName },
            remarks: `Transaction initiated for ${transactionType}`
          }
        }
      });
    }

    res.status(201).json({ message: "Transaction created and pending approval", success: true, data: result });
  } catch (error) {
    console.error("Create Transaction Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// GET /api/asset-transactions/get
exports.getAllTransactions = async (req, res) => {
  try {
    const { center_id } = req.query;
    let query = {};
    if (center_id && center_id !== "all" && mongoose.Types.ObjectId.isValid(center_id)) {
      query = { "center._id": new mongoose.Types.ObjectId(center_id) };
    }
    const transactions = await Transactions.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// PATCH /api/asset-transactions/patch/status/:id
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, user_id, userName: providedUserName, type } = req.body;
    const userName = await resolveUserName(user_id, providedUserName);

    let transaction;

    if (type === "registry") {
      // Direct registry approval handling
      const asset = await Assets.findById(id);
      if (!asset) throw new Error("Asset not found");

      let finalAssetStatus = status === "APPROVED" ? "ACTIVE" : "ASSET_APPROVAL_REJECTED";

      asset.assetStatus = finalAssetStatus;
      asset.assetApproval.status = status;
      asset.assetApproval.approvedBy = { _id: user_id, name: userName };
      asset.assetApproval.approvedAt = new Date();
      asset.assetApproval.remarks = remarks;

      asset.statusHistory.push({
        action: "REGISTRY_APPROVAL",
        status: finalAssetStatus,
        performedBy: { _id: user_id, name: userName },
        remarks: `Registry ${status.toLowerCase()}`
      });

      await asset.save();
      return res.status(200).json({ message: `Registry ${status.toLowerCase()} successfully`, success: true });
    }

    // Try finding by transaction ID
    transaction = await Transactions.findById(id);

    // If not found, it might be an Asset ID passed from the frontend
    if (!transaction) {
      transaction = await Transactions.findOne({
        asset_id: id,
        transactionStatus: "APPROVAL_PENDING"
      });
    }

    if (!transaction) throw new Error("Pending transaction not found for this ID/Asset");

    transaction.transactionStatus = status;
    transaction.approval.status = status;
    transaction.approval.approvedBy = { _id: user_id, name: userName };
    transaction.approval.approvedAt = new Date();
    transaction.approval.remarks = remarks;

    if (status === "APPROVED") {
      transaction.transactionStatus = "COMPLETED";
    }

    await transaction.save();

    // Sync with Asset Master
    if (status === "APPROVED") {
      const updateObj = {};
      let auditStatus = "";

      if (transaction.transactionType === "ALLOCATION") {
        updateObj.assetStatus = "ALLOCATED";
        updateObj.currentAllocation = {
          employee: transaction.employee,
          center: transaction.center,
          subLocation: transaction.subLocation,
          department: transaction.department,
          subDepartment: transaction.subDepartment,
          allocatedAt: new Date()
        };
        auditStatus = "ALLOCATED";
      } else if (transaction.transactionType === "DEALLOCATION") {
        updateObj.assetStatus = "ACTIVE";
        updateObj.currentAllocation = null;
        auditStatus = "ACTIVE";
      }

      if (auditStatus) {
        await Assets.findByIdAndUpdate(transaction.asset_id, {
          $set: updateObj,
          $push: {
            statusHistory: {
              action: "TRANSACTION_APPROVAL",
              status: auditStatus,
              performedBy: { _id: user_id, name: userName },
              remarks: `Transaction approved for ${transaction.employee.name || "employee"}`
            }
          }
        });
      }
    } else if (status === "REJECTED") {
      // Revert Asset status to Active or previous state
      await Assets.findByIdAndUpdate(transaction.asset_id, {
        $set: { assetStatus: transaction.transactionType === "ALLOCATION" ? "ACTIVE" : "ALLOCATED" },
        $push: {
          statusHistory: {
            action: "TRANSACTION_REJECTION",
            status: transaction.transactionType === "ALLOCATION" ? "ACTIVE" : "ALLOCATED",
            performedBy: { _id: user_id, name: userName },
            remarks: `Transaction rejected for ${transaction.employee.name || "employee"}`
          }
        }
      });
    }

    res.status(200).json({ message: `Transaction ${status.toLowerCase()} successfully`, success: true });
  } catch (error) {
    console.error("Update Transaction Status Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// PATCH /api/asset-transactions/patch/deallocate/:asset_id
exports.deallocateAsset = async (req, res) => {
  try {
    const { asset_id } = req.params;
    const { user_id, userName, remarks } = req.body;

    const asset = await Assets.findById(asset_id);
    if (!asset) throw new Error("Asset not found");

    const deallocation = new Transactions({
      asset_id,
      assetID: asset.assetID,
      assetName: asset.assetName,
      transactionType: "DEALLOCATION",
      transactionStatus: "COMPLETED",
      employee: asset.currentAllocation.employee,
      center: asset.currentAllocation.center,
      department: asset.currentAllocation.department,
      remarks: remarks || "Direct Deallocation",
      approval: {
        status: "APPROVED",
        approvedBy: { _id: user_id, name: userName },
        approvedAt: new Date()
      },
      createdBy: { _id: user_id, name: userName }
    });

    await deallocation.save();

    await Assets.findByIdAndUpdate(asset_id, {
      $set: { assetStatus: "ACTIVE", currentAllocation: null },
      $push: {
        statusHistory: {
          action: "DEALLOCATION",
          status: "ACTIVE",
          performedBy: { _id: user_id, name: userName },
          remarks: `Asset deallocated from ${asset.currentAllocation?.employee?.name || "employee"}`
        }
      }
    });

    res.status(200).json({ message: "Asset deallocated successfully", success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};
