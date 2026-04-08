const MaintenanceModel = require("./model.js");
const Assets = require("../assetManagementnew/model.js");
const mongoose = require("mongoose");
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

// CREATE MAINTENANCE RECORD
exports.createMaintenance = async (req, res) => {
  try {
    const {
      maintenanceID,
      asset_id,
      assetID,
      assetName,
      category,
      subCategory,
      location,
      department,
      issue,
      vendor,
      costs,
      docs,
      user_id,
      userName: providedUserName
    } = req.body;

    const userName = await resolveUserName(user_id, providedUserName);

    // Generate Maintenance ID if not provided
    let finalMaintenanceID = maintenanceID;
    if (!finalMaintenanceID) {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const startYear = month >= 3 ? year : year - 1;
      const endYear = startYear + 1;
      const financialYear = `${startYear}-${String(endYear).slice(-2)}`;
      const prefix = `MT-${financialYear}-`;

      const lastRecord = await MaintenanceModel.findOne({ maintenanceID: { $regex: new RegExp(`^${prefix}`) } }).sort({ maintenanceID: -1 });
      let nextCount = 1;
      if (lastRecord && lastRecord.maintenanceID) {
        const lastCount = parseInt(lastRecord.maintenanceID.split("-").pop());
        if (!isNaN(lastCount)) nextCount = lastCount + 1;
      }
      finalMaintenanceID = `${prefix}${nextCount.toString().padStart(6, "0")}`;
    }

    const newMaintenance = new MaintenanceModel({
      maintenanceID: finalMaintenanceID,
      asset_id,
      assetID,
      assetName,
      category,
      subCategory,
      location,
      department,
      issue: {
        description: issue?.description,
        reportedDate: issue?.reportedDate || new Date(),
        isAMC: issue?.isAMC === true
      },
      vendor,
      costs: {
        serviceFee: parseFloat(costs?.serviceFee) || 0,
        currency: costs?.currency || "INR",
        isTaxExempt: costs?.isTaxExempt || "No",
        spareParts: Array.isArray(costs?.spareParts) ? costs?.spareParts : [],
        totalAmount: parseFloat(costs?.totalAmount) || 0
      },
      docs: Array.isArray(docs) ? docs : [],
      status: "AWAITING_APPROVAL",
      approval: {
        status: "PENDING",
        requestedBy: { _id: user_id, name: userName }
      },
      createdBy: { _id: user_id, name: userName }
    });

    const result = await newMaintenance.save();
    res.status(201).json({ message: "Maintenance record created successfully", success: true, data: result });
  } catch (error) {
    console.error("Create Maintenance Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// GET MAINTENANCE LIST WITH PAGINATION & FILTERING
exports.getMaintenanceList = async (req, res) => {
  try {
    const { recsPerPage = 10, pageNumber = 1, searchText, status, center_ID, department_ID, asset_id, assetID, issueType, fromDate, toDate } = req.body;
    const skipRec = parseInt(recsPerPage) * (parseInt(pageNumber) - 1);

    let query = {};
    if (searchText) {
      query.$or = [
        { maintenanceID: { $regex: searchText, $options: "i" } },
        { assetID: { $regex: searchText, $options: "i" } },
        { assetName: { $regex: searchText, $options: "i" } }
      ];
    }

    if (status && status !== "all") {
      query.status = status.toUpperCase().replace(/ /g, "_");
    }

    if (asset_id && mongoose.Types.ObjectId.isValid(asset_id)) {
      query.asset_id = mongoose.Types.ObjectId(asset_id);
    }

    if (assetID) {
      query.assetID = assetID;
    }

    if (center_ID && center_ID !== "all") {
      query["location.center._id"] = mongoose.Types.ObjectId(center_ID);
    }

    if (department_ID && department_ID !== "all") {
      query["department.department._id"] = mongoose.Types.ObjectId(department_ID);
    }

    if (fromDate && fromDate !== "all" && toDate && toDate !== "all") {
      query["issue.reportedDate"] = {
        $gte: moment(fromDate).startOf("day").toDate(),
        $lte: moment(toDate).endOf("day").toDate()
      };
    }

    const totalRecs = await MaintenanceModel.countDocuments(query);

    // Calculate Total Cost for all filtered records
    const costResult = await MaintenanceModel.aggregate([
      { $match: query },
      { $group: { _id: null, totalCost: { $sum: "$costs.totalAmount" } } }
    ]);
    const totalCost = costResult.length > 0 ? costResult[0].totalCost : 0;

    let data;
    if (req.body.removePagination) {
      data = await MaintenanceModel.find(query).sort({ createdAt: -1 });
    } else {
      data = await MaintenanceModel.find(query)
        .skip(skipRec)
        .limit(parseInt(recsPerPage))
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      totalRecs,
      tableData: data,
      totalCost,
      success: true
    });
  } catch (error) {
    console.error("Get Maintenance List Error:", error);
    res.status(500).json({ errorMsg: error.message, success: false });
  }
};

// GET ONE MAINTENANCE RECORD
exports.getOneMaintenance = async (req, res) => {
  try {
    const record = await MaintenanceModel.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found", success: false });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// UPDATE MAINTENANCE RECORD
exports.updateMaintenance = async (req, res) => {
  try {
    const record = await MaintenanceModel.findById(req.params.id);
    if (!record) return res.status(404).json({ error: "Record not found", success: false });

    const { user_id, userName: providedUserName, ...updateData } = req.body;
    const userName = await resolveUserName(user_id, providedUserName);

    record.updateLog.push({
      updatedBy: { _id: user_id, name: userName },
      updatedAt: new Date(),
      action: "EDIT"
    });

    Object.assign(record, updateData);

    const result = await record.save();
    res.status(200).json({ message: "Maintenance record updated successfully", success: true, data: result });
  } catch (error) {
    console.error("Update Maintenance Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// DELETE MAINTENANCE RECORD
exports.deleteMaintenance = async (req, res) => {
  try {
    await MaintenanceModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Record deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// GET DASHBOARD COUNTS
exports.getDashboardCounts = async (req, res) => {
  try {
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const activeMaintenance = await MaintenanceModel.countDocuments({ status: "IN_PROGRESS" });
    const awaitingApproval = await MaintenanceModel.countDocuments({ status: "AWAITING_APPROVAL" });

    // Total Cost (MTD)
    const costResult = await MaintenanceModel.aggregate([
      {
        $match: {
          "issue.reportedDate": { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$costs.totalAmount" }
        }
      }
    ]);
    const totalCostMTD = costResult.length > 0 ? costResult[0].totalCost : 0;

    // AMC Compliance
    const totalRecords = await MaintenanceModel.countDocuments();
    const amcRecords = await MaintenanceModel.countDocuments({ "issue.isAMC": true });
    const amcCompliance = totalRecords > 0 ? ((amcRecords / totalRecords) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      activeMaintenance,
      awaitingApproval,
      totalCostMTD,
      amcCompliance
    });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
};
// UPDATE MAINTENANCE STATUS (APPROVAL/REJECTION)
exports.patchMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, user_id, userName: providedUserName } = req.body;
    const userName = await resolveUserName(user_id, providedUserName);

    const record = await MaintenanceModel.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found", success: false });

    // Map incoming status to UPPERCASE enum
    const finalStatus = status.toUpperCase().replace(/ /g, "_");
    record.status = finalStatus;

    if (finalStatus === "SCHEDULED" || finalStatus === "REJECTED") {
        record.approval.status = finalStatus === "SCHEDULED" ? "APPROVED" : "REJECTED";
        record.approval.approvedBy = { _id: user_id, name: userName };
        record.approval.approvedAt = new Date();
        record.approval.remarks = remarks;
    }

    record.updateLog.push({
      updatedBy: { _id: user_id, name: userName },
      updatedAt: new Date(),
      action: "STATUS_CHANGE",
      status: finalStatus
    });

    const result = await record.save();

    // --- SYNC WITH ASSET MASTER ---
    if (finalStatus === "IN_PROGRESS" || finalStatus === "COMPLETED") {
        const asset = await Assets.findById(record.asset_id);
        if (asset) {
            let newAssetStatus = "";
            if (finalStatus === "IN_PROGRESS") {
                newAssetStatus = "MAINTENANCE";
            } else {
                // Completion logic: Check if it's currently allocated
                newAssetStatus = (asset.currentAllocation && asset.currentAllocation.employee?._id) 
                    ? "ALLOCATED" 
                    : "ACTIVE";
            }
            
            await Assets.findByIdAndUpdate(record.asset_id, {
                $set: { assetStatus: newAssetStatus },
                $push: {
                    statusHistory: {
                        action: "MAINTENANCE_SYNC",
                        status: newAssetStatus,
                        performedBy: { _id: user_id, name: userName },
                        remarks: `Maintenance status updated to ${status}. Ref: ${record.maintenanceID}`
                    }
                }
            });
        }
    }

    res.status(200).json({ message: `Maintenance record ${status} successfully`, success: true, data: result });
  } catch (error) {
    console.error("Patch Maintenance Status Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};
