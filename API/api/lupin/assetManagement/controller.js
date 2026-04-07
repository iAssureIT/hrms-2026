const mongoose = require("mongoose");
const AssetManagement = require("./model");
const AssetCategoryMaster = require("../oneFieldModules/assetCategory/model.js");
const CenterMaster = require("../centers/model.js");
const LocationSubcategoryMaster = require("../oneFieldModules/locationSubcategory/model.js");
const DepartmentMaster = require("../oneFieldModules/departmentMaster/model.js");
const SubdepartmentMaster = require("../oneFieldModules/subdepartmentMaster/model.js");
const AssetAllocation = require("../assetAllocation/model");
const ObjectId = require("mongodb").ObjectId;

// CREATE
exports.createAsset = async (req, res) => {
    try {
        const lastAsset = await AssetManagement.findOne({ assetID: { $regex: /^ASSET-/ } }).sort({ assetID: -1 });
        let nextCount = 1;
        if (lastAsset && lastAsset.assetID) {
            const lastCount = parseInt(lastAsset.assetID.split('-')[1]);
            if (!isNaN(lastCount)) {
                nextCount = lastCount + 1;
            }
        }
        const assetID = `ASSET-${nextCount.toString().padStart(4, '0')}`;

        const newItem = new AssetManagement({
            assetID: assetID,
            assetName: req.body.assetName,
            brand: req.body.brand,
            model: req.body.model,
            serialNo: req.body.serialNo,
            serialNumber: req.body.serialNo, // Mapping for both fields
            vendorName: req.body.vendor,
            purchaseCost: req.body.cost,
            warrantyDate: req.body.warrantyDate,
            description: req.body.description,
            purchaseDate: req.body.purchaseDate,
            invoiceNumber: req.body.invoiceNumber,
            residualValue: req.body.residualValue,
            usefulLife: req.body.usefulLife,
            specifications: req.body.specifications || [],
            docs: (req.body.uploadedFiles || []).map(f => f.fileName), // New schema expects array of strings
            category: req.body.dropdownvalue,
            category_id: req.body.dropdown_id,
            subCategory: req.body.inputValue,
            subCategory_id: req.body.subCategory_id, // We'll need to send this from frontend or look it up
            assetStatus: "ASSET_APPROVAL_PENDING",
            assetImage: req.body.assetImage ? [{ url: req.body.assetImage, fileName: "asset_image" }] : [],
            createdBy: req.body.user_id,
            assetApprovalLog: [{
                assetApprovalStatus: "PENDING",
                requestedBy: req.body.user_id,
            }],
            // Location fields
            center_id: req.body.center_id,
            centerName: req.body.centerName,
            sublocation_id: req.body.sublocation_id,
            sublocationName: req.body.sublocationName,
            department_id: req.body.department_id,
            departmentName: req.body.departmentName,
            subdepartment_id: req.body.subdepartment_id,
            subdepartmentName: req.body.subdepartmentName,
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// READ ALL WITH LIMITS
exports.getAllAssetsWithLimits = (req, res) => {
    let recsPerPage = req.body.recsPerPage || 10;
    let pageNum = req.body.pageNumber || 1;
    let skipRec = recsPerPage * (pageNum - 1);
    let query = {};

    if (req.body.center_ID && req.body.center_ID !== "all") query.center_id = req.body.center_ID;
    if (req.body.department_ID && req.body.department_ID !== "all") query.department_id = req.body.department_ID;
    if (req.body.status && req.body.status !== "all") {
        // Map status from frontend to new schema
        if (req.body.status.toLowerCase() === "pending") query.assetStatus = { $in: ["ASSET_APPROVAL_PENDING", "ALLOCATION_APPROVAL_PENDING"] };
        else if (req.body.status.toLowerCase() === "active") query.assetStatus = "ALLOCATED";
        else if (req.body.status.toLowerCase() === "available") query.assetStatus = "ACTIVE";
        else if (req.body.status.toLowerCase() === "rejected") query.assetStatus = { $in: ["ASSET_APPROVAL_REJECTED", "ALLOCATION_APPROVAL_REJECTED", "REJECTED"] };
    }

    if (req.body.searchText && req.body.searchText !== "-") {
        const searchRegex = new RegExp(req.body.searchText, "i");
        query.$or = [
            { assetID: searchRegex },
            { assetName: searchRegex },
            { brand: searchRegex },
            { model: searchRegex },
            { serialNo: searchRegex },
            { category: searchRegex },
            { subCategory: searchRegex },
            { centerName: searchRegex },
            { departmentName: searchRegex },
        ];
    }

    AssetManagement.countDocuments(query).then((totalRecs) => {
        AssetManagement.find(query)
            .skip(parseInt(skipRec))
            .limit(parseInt(recsPerPage))
            .sort({ createdAt: -1 })
            .then((data) => {
                const tableData = data.map((item) => ({
                    _id: item._id,
                    assetStatus: item.assetStatus,
                    employee_id: item.employee_id,
                    employeeName: item.employeeName || "-",
                    employeeEmail: item.employeeEmail || "-",
                    employeeMobile: item.employeeMobile || "-",
                    employeeDesignation: item.employeeDesignation || "-",
                    center_id: item.center_id,
                    centerName: item.centerName || "-",
                    sublocation_id: item.sublocation_id,
                    sublocationName: item.sublocationName || "-",
                    department_id: item.department_id,
                    departmentName: item.departmentName || "-",
                    subdepartment_id: item.subdepartment_id,
                    subdepartmentName: item.subdepartmentName || "-",
                    assetCategory: item.category || "-",
                    assetSubCategory: item.subCategory || "-",
                    assetID: item.assetID || "-",
                    assetName: item.assetName || "-",
                    brand: item.brand || "-",
                    model: item.model || "-",
                    serialNo: item.serialNo || "-",
                    vendor: item.vendorName || "-",
                    cost: item.purchaseCost || "-",
                    purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('en-IN') : "-",
                    invoiceNumber: item.invoiceNumber || "-",
                    registryStatus: (item.assetStatus === "ASSET_APPROVAL_PENDING") ? "Pending" :
                        (item.assetStatus === "ASSET_APPROVAL_REJECTED") ? "Rejected" : "Approved",
                    status: (item.assetStatus === "ALLOCATED") ? "Active" :
                        (item.assetStatus === "ASSET_APPROVAL_REJECTED" || item.assetStatus === "ALLOCATION_APPROVAL_REJECTED" || item.assetStatus === "REJECTED") ? "Rejected" : "Pending",
                    employeeDetails: item.employeeName
                        ? `<b>${item.employeeName}</b><br/><span style="font-size: 10px; color: #666;">${item.employeeEmail}</span><br/><span style="font-size: 10px; color: #666;">${item.employeeMobile}</span><br/><span style="font-size: 10px; color: #666;">${item.employeeDesignation}</span>`
                        : "-",
                    remarks: item.remarks || ""
                }));
                res.status(200).json({ totalRecs, tableData, success: true });
            });
    }).catch(err => res.status(500).json({ errorMsg: err.message, success: false }));
};


// GET ONE
exports.getOneAsset = async (req, res) => {
    try {
        const data = await AssetManagement.findById(req.params.id);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE
exports.updateAsset = async (req, res) => {
    try {
        const updateData = {
            assetName: req.body.assetName,
            brand: req.body.brand,
            model: req.body.model,
            serialNo: req.body.serialNo,
            serialNumber: req.body.serialNo,
            vendorName: req.body.vendor,
            purchaseCost: req.body.cost,
            warrantyDate: req.body.warrantyDate,
            description: req.body.description,
            purchaseDate: req.body.purchaseDate,
            invoiceNumber: req.body.invoiceNumber,
            residualValue: req.body.residualValue,
            usefulLife: req.body.usefulLife,
            specifications: req.body.specifications || [],
            docs: (req.body.uploadedFiles || []).map(f => f.fileName),
            category: req.body.dropdownvalue,
            category_id: req.body.dropdown_id,
            subCategory: req.body.inputValue,
            subCategory_id: req.body.subCategory_id,
            assetImage: req.body.assetImage ? [{ url: req.body.assetImage, fileName: "asset_image" }] : [],
            // Location fields
            center_id: req.body.center_id,
            centerName: req.body.centerName,
            sublocation_id: req.body.sublocation_id,
            sublocationName: req.body.sublocationName,
            department_id: req.body.department_id,
            departmentName: req.body.departmentName,
            subdepartment_id: req.body.subdepartment_id,
            subdepartmentName: req.body.subdepartmentName,
        };
        await AssetManagement.updateOne({ _id: req.params.id }, { $set: updateData });
        res.status(200).json({ success: true, message: "Asset updated" });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: err.message, success: false });
    }
};

// DELETE
exports.deleteAsset = async (req, res) => {
    try {
        await AssetManagement.findByIdAndDelete(req.params.id);
        res.json({ message: "Asset deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET DASHBOARD COUNTS
exports.getDashboardCounts = async (req, res) => {
    try {
        const total = await AssetManagement.countDocuments();
        const allocated = await AssetManagement.countDocuments({ assetStatus: "ALLOCATED" });
        const available = await AssetManagement.countDocuments({ assetStatus: "ACTIVE" });
        const pending = await AssetManagement.countDocuments({
            assetStatus: { $in: ["ASSET_APPROVAL_PENDING", "ALLOCATION_APPROVAL_PENDING"] }
        });
        const rejected = await AssetManagement.countDocuments({
            assetStatus: { $in: ["ASSET_APPROVAL_REJECTED", "ALLOCATION_APPROVAL_REJECTED", "REJECTED"] }
        });

        res.status(200).json({
            success: true,
            total,
            allocated,
            available,
            pending,
            rejected
        });
    } catch (err) {
        res.status(500).json({ message: err.message, success: false });
    }
};
