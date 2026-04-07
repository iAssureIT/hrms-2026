const mongoose = require("mongoose");
const AssetAllocation = require("./model");
const AssetManagement = require("../assetManagement/model");

// CREATE ALLOCATION
exports.createAllocation = async (req, res) => {
    try {
        console.log("Creating allocation for asset:", req.body.assetID);
        const {
            assetID,
            assetName,
            allocationType,
            employee,
            center_id,
            center,
            subLocation_id,
            subLocation,
            department_id,
            department,
            subDepartment_id,
            subDepartment,
            inspectionRemarks,
            createdBy,
            asset_id
        } = req.body;

        // Validation for ObjectIds
        const validCreatedBy = mongoose.Types.ObjectId.isValid(createdBy) ? createdBy : null;
        const validAssetId = mongoose.Types.ObjectId.isValid(asset_id) ? asset_id : null;
        const validCenterId = mongoose.Types.ObjectId.isValid(center_id) ? center_id : null;
        const validDeptId = mongoose.Types.ObjectId.isValid(department_id) ? department_id : null;

        // Prevent duplicate pending allocations for the same asset
        if (allocationType === "ALLOCATE") {
            const existingPending = await AssetAllocation.findOne({
                assetID: assetID,
                allocationApprovalStatus: "PENDING",
                allocationType: "ALLOCATE"
            });
            if (existingPending) {
                return res.status(400).json({ message: "An allocation request for this asset is already pending approval.", success: false });
            }
        }

        const newAllocation = new AssetAllocation({
            asset_id: validAssetId,
            assetID,
            assetName,
            allocationType,
            employee,
            center_id: validCenterId,
            center,
            subLocation_id: mongoose.Types.ObjectId.isValid(subLocation_id) ? subLocation_id : null,
            subLocation,
            department_id: validDeptId,
            department,
            subDepartment_id: mongoose.Types.ObjectId.isValid(subDepartment_id) ? subDepartment_id : null,
            subDepartment,
            inspectionRemarks,
            createdBy: validCreatedBy,
            allocationApprovalStatus: "PENDING",
            allocationApprovalLog: [{
                allocationApprovalStatus: "PENDING"
            }]
        });

        const savedAllocation = await newAllocation.save();
        console.log("Allocation saved:", savedAllocation._id);

        // Integrate with AssetManagement: Update the asset's current location and status
        if (validAssetId) {
            const updateData = {
                $set: {
                    center_id: validCenterId,
                    centerName: center,
                    sublocation_id: mongoose.Types.ObjectId.isValid(subLocation_id) ? subLocation_id : null,
                    sublocationName: subLocation,
                    department_id: validDeptId,
                    departmentName: department,
                    subdepartment_id: mongoose.Types.ObjectId.isValid(subDepartment_id) ? subDepartment_id : null,
                    subdepartmentName: subDepartment,
                    employee_id: employee && employee.length > 0 && mongoose.Types.ObjectId.isValid(employee[0].employee_id) ? employee[0].employee_id : null,
                    employeeName: employee && employee.length > 0 ? employee[0].name : null,
                    employeeEmail: employee && employee.length > 0 ? employee[0].email : null,
                    employeeMobile: employee && employee.length > 0 ? employee[0].mobile : null,
                    employeeDesignation: employee && employee.length > 0 ? employee[0].designation : null,
                    remarks: inspectionRemarks,
                    assetStatus: "ALLOCATION_APPROVAL_PENDING",
                    allocationApprovalStatus: "PENDING"
                }
            };

            const assetUpdate = await AssetManagement.updateOne({ _id: validAssetId }, updateData);
            console.log("AssetManagement update result:", assetUpdate);
        }

        res.status(201).json({
            message: "Allocation recorded and asset updated",
            success: true,
            data: savedAllocation
        });
    } catch (err) {
        console.error("Error in createAllocation:", err);
        res.status(500).json({ error: err.message, success: false });
    }
};

// GET ALL ALLOCATIONS
exports.getAllAllocations = (req, res) => {
    AssetAllocation.find()
        .sort({ createdAt: -1 })
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(500).json({ error: err.message, success: false }));
};

// GET ONE ALLOCATION
exports.getOneAllocation = (req, res) => {
    AssetAllocation.findById(req.params.id)
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(500).json({ error: err.message, success: false }));
};

// UPDATE ALLOCATION STATUS OR REGISTRY STATUS
exports.updateAllocationStatus = async (req, res) => {
    try {
        const { status, approvedBy, type } = req.body;
        const id = req.params.id;

        if (type === "registry") {
            // Registry Approval (Status: Active/APPROVED, Rejected/REJECTED, Pending)
            let assetStatus = "ASSET_APPROVAL_PENDING";
            if (status === "Active" || status === "APPROVED") assetStatus = "ACTIVE";
            else if (status === "Rejected" || status === "REJECTED") assetStatus = "ASSET_APPROVAL_REJECTED";
            else if (status === "Pending") assetStatus = "ASSET_APPROVAL_PENDING";

            await AssetManagement.updateOne({ _id: id }, { $set: { assetStatus } });
            return res.status(200).json({ success: true, message: "Registry status updated successfully" });
        } else {
            // Allocation Approval (Status: APPROVED, REJECTED)
            let updatedAllocation;

            // Try finding by allocation id first (for calls from AllocationApproval page)
            if (mongoose.Types.ObjectId.isValid(id)) {
                updatedAllocation = await AssetAllocation.findById(id);
            }

            // If not found, it might be an asset_id passed from ViewAsset page
            if (!updatedAllocation && mongoose.Types.ObjectId.isValid(id)) {
                updatedAllocation = await AssetAllocation.findOne({
                    asset_id: id,
                    allocationApprovalStatus: "PENDING",
                    allocationType: "ALLOCATE"
                });
            }

            if (!updatedAllocation) {
                return res.status(404).json({ message: "Allocation record not found", success: false });
            }

            if (status === "APPROVED") {
                // IMPORTANT: Close any existing APPROVED allocations for this asset first
                await AssetAllocation.updateMany(
                    { assetID: updatedAllocation.assetID, allocationApprovalStatus: "APPROVED", allocationType: "ALLOCATE" },
                    { $set: { allocationApprovalStatus: "CLOSED" } }
                );
            }

            // Perform update on found allocation
            updatedAllocation = await AssetAllocation.findByIdAndUpdate(
                updatedAllocation._id,
                {
                    $set: { allocationApprovalStatus: status },
                    $push: {
                        allocationApprovalLog: {
                            allocationApprovalStatus: status,
                            approvedBy: approvedBy || req.body.user_id,
                            approvedAt: new Date()
                        }
                    }
                },
                { new: true }
            );

            // Update the AssetManagement record based on allocation status
            // Use status from request body directly to determine mapping
            const assetUpdateData = status === "APPROVED"
                ? { assetStatus: "ALLOCATED", allocationApprovalStatus: "APPROVED" }
                : { assetStatus: "ALLOCATION_APPROVAL_REJECTED", allocationApprovalStatus: "REJECTED" };

            await AssetManagement.updateOne(
                { assetID: updatedAllocation.assetID },
                { $set: assetUpdateData }
            );

            return res.status(200).json({
                message: `Allocation ${status.toLowerCase()}ed`,
                success: true,
                data: updatedAllocation
            });
        }
    } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({ error: err.message, success: false });
    }
};

// DEALLOCATE ASSET
exports.deallocateAsset = async (req, res) => {
    try {
        const asset_id = req.params.id;
        const asset = await AssetManagement.findById(asset_id);
        if (!asset) {
            return res.status(404).json({ message: "Asset not found", success: false });
        }

        // 1. Create Deallocation Transaction
        const newDeallocation = new AssetAllocation({
            assetID: asset.assetID,
            assetName: asset.assetName,
            allocationType: "DEALLOCATE",
            employee: [{
                name: asset.employeeName,
                email: asset.employeeEmail,
                mobile: asset.employeeMobile,
                designation: asset.employeeDesignation,
                employee_id: asset.employee_id
            }],
            center_id: asset.center_id,
            center: asset.centerName,
            subLocation_id: asset.sublocation_id,
            subLocation: asset.sublocationName,
            department_id: asset.department_id,
            department: asset.departmentName,
            subDepartment_id: asset.subdepartment_id,
            subDepartment: asset.subdepartmentName,
            createdBy: req.body.user_id,
            allocationApprovalStatus: "CLOSED"
        });
        await newDeallocation.save();

        // Close any existing APPROVED allocations for this asset
        await AssetAllocation.updateMany(
            { assetID: asset.assetID, allocationApprovalStatus: "APPROVED", allocationType: "ALLOCATE" },
            { $set: { allocationApprovalStatus: "CLOSED" } }
        );

        // 2. Update AssetManagement Record (Reset to Active and Clear current location/employee)
        await AssetManagement.updateOne(
            { _id: asset_id },
            {
                $set: {
                    assetStatus: "ACTIVE",
                    center_id: null,
                    centerName: null,
                    sublocation_id: null,
                    sublocationName: null,
                    department_id: null,
                    departmentName: null,
                    subdepartment_id: null,
                    subdepartmentName: null,
                    employee_id: null,
                    employeeName: null,
                    employeeEmail: null,
                    employeeMobile: null,
                    employeeDesignation: null,
                    allocationApprovalStatus: "PENDING"
                }
            }
        );

        res.status(200).json({ message: "Asset deallocated successfully", success: true });
    } catch (err) {
        console.error("Deallocation error:", err);
        res.status(500).json({ error: err.message, success: false });
    }
};
