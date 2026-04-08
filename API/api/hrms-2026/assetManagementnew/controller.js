const AssetsModal = require("./model.js");
const mongoose = require("mongoose");
const FailedRecords = require("../failedRecords/model.js");
const User = require("../../admin2.0/userManagementnew/ModelUsers.js");
const Centers = require("../centers/model.js");
const Vendor = require("../vendorMaster/model.js");
const moment = require("moment");
const AssetCategory = require("../oneFieldModules/assetCategory/model.js");
const AssetSubCategory = require("../oneFieldModules/assetSubCategory/model.js");
const Department = require("../oneFieldModules/departmentMaster/model.js");
const SubDepartment = require("../oneFieldModules/subdepartmentMaster/model.js");
const SubLocation = require("../oneFieldModules/locationSubcategory/model.js");
const AssetDepreciationMaster = require("../assetDepreciationMaster/model.js");

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

// CREATE ASSET
exports.createAssets = async (req, res) => {
  try {
    const {
      assetID,
      assetName,
      brand,
      model,
      serialNumber,
      vendor,
      category,
      category_id,
      subCategory,
      subCategory_id,
      purchaseCost,
      purchaseDate,
      residualValue,
      usefulLife,
      description,
      invoiceNumber,
      specifications,
      docs,
      assetImage,
      user_id,
      userName: providedUserName,
      currentAllocation
    } = req.body;

    const userName = await resolveUserName(user_id, providedUserName);

    // Generate Asset ID if not provided
    let finalAssetID = assetID;
    if (!finalAssetID) {
      const centerID = currentAllocation?.center?._id;
      const categoryID = category_id;

      if (!centerID || !categoryID) {
        return res.status(400).json({ message: "Center and Category are required for Asset ID generation", success: false });
      }

      const center = await Centers.findById(centerID);
      const categoryMaster = await AssetDepreciationMaster.findOne({ dropdown_id: categoryID });

      const centerCode = center?.assetManagementCenterCode || "NA";
      const categoryCode = categoryMaster?.categoryShortName || "NA";
      const prefix = `LF-${centerCode}-${categoryCode}-`;

      const lastAsset = await AssetsModal.findOne({ assetID: { $regex: new RegExp(`^${prefix}`) } }).sort({ assetID: -1 });
      let nextCount = 1;
      if (lastAsset && lastAsset.assetID) {
        const parts = lastAsset.assetID.split("-");
        const lastCount = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastCount)) nextCount = lastCount + 1;
      }
      finalAssetID = `${prefix}${nextCount.toString().padStart(6, "0")}`;
    } else {
      const existingAsset = await AssetsModal.findOne({ assetID });
      if (existingAsset) {
        return res.status(409).json({ message: "Asset ID already exists", success: false });
      }
    }

    const newAsset = new AssetsModal({
      assetID: finalAssetID,
      assetName,
      brand,
      model,
      serialNumber,
      vendor: vendor || {},
      category,
      category_id: mongoose.Types.ObjectId.isValid(category_id) ? category_id : null,
      subCategory,
      subCategory_id: mongoose.Types.ObjectId.isValid(subCategory_id) ? subCategory_id : null,
      purchaseCost,
      purchaseDate,
      residualValue,
      usefulLife,
      description,
      invoiceNumber,
      specifications: Array.isArray(specifications) ? specifications : [],
      docs: Array.isArray(docs) ? docs : [],
      assetImage: Array.isArray(assetImage) ? assetImage : [],
      assetStatus: "ASSET_APPROVAL_PENDING",
      assetApproval: {
        status: "PENDING",
        requestedBy: { _id: user_id, name: userName }
      },
      statusHistory: [{
        action: "CREATION",
        status: "ASSET_APPROVAL_PENDING",
        performedBy: { _id: user_id, name: userName },
        remarks: "Asset created and pending approval"
      }],
      createdBy: { _id: user_id, name: userName },
      currentAllocation: currentAllocation || undefined
    });

    const result = await newAsset.save();
    res.status(201).json({ message: "Asset created successfully", success: true, data: result });
  } catch (error) {
    console.error("Create Asset Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// GET ASSETS WITH PAGINATION & FILTERING
exports.getAssetsData = async (req, res) => {
  try {
    const { recsPerPage = 10, pageNumber = 1, searchText, assetStatus, center_ID, department_ID, subdepartment_ID, category_id } = req.body;
    const skipRec = parseInt(recsPerPage) * (parseInt(pageNumber) - 1);

    let query = {};
    const filterConditions = [];

    if (searchText && searchText !== "-" && searchText.trim() !== "") {
      const safeSearchText = searchText.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filterConditions.push({
        $or: [
          { assetID: { $regex: safeSearchText, $options: "i" } },
          { assetName: { $regex: safeSearchText, $options: "i" } },
          { serialNumber: { $regex: safeSearchText, $options: "i" } },
          { brand: { $regex: safeSearchText, $options: "i" } },
          { model: { $regex: safeSearchText, $options: "i" } },
          { category: { $regex: safeSearchText, $options: "i" } }
        ]
      });
    }

    if (assetStatus && assetStatus !== "all") {
      if (assetStatus === "PENDING") {
        filterConditions.push({ assetStatus: { $in: ["ASSET_APPROVAL_PENDING", "ALLOCATION_APPROVAL_PENDING"] } });
      } else if (assetStatus === "REJECTED") {
        filterConditions.push({ assetStatus: { $in: ["ASSET_APPROVAL_REJECTED", "ALLOCATION_APPROVAL_REJECTED", "REJECTED"] } });
      } else if (assetStatus === "INACTIVE") {
        filterConditions.push({ assetStatus: { $in: ["INACTIVE", "ASSET_APPROVAL_REJECTED"] } });
      } else {
        filterConditions.push({ assetStatus: assetStatus });
      }
    }

    if (req.body.excludeStatus) {
      filterConditions.push({ assetStatus: { $ne: req.body.excludeStatus } });
    }

    if (center_ID && center_ID !== "all") {
      if (mongoose.Types.ObjectId.isValid(center_ID)) {
        filterConditions.push({ "currentAllocation.center._id": new mongoose.Types.ObjectId(center_ID) });
      }
    }
    if (department_ID && department_ID !== "all") {
      if (mongoose.Types.ObjectId.isValid(department_ID)) {
        filterConditions.push({ "currentAllocation.department._id": new mongoose.Types.ObjectId(department_ID) });
      }
    }
    if (subdepartment_ID && subdepartment_ID !== "all") {
      if (mongoose.Types.ObjectId.isValid(subdepartment_ID)) {
        filterConditions.push({ "currentAllocation.subDepartment._id": new mongoose.Types.ObjectId(subdepartment_ID) });
      }
    }
    if (category_id && category_id !== "all") {
      if (mongoose.Types.ObjectId.isValid(category_id)) {
        filterConditions.push({ category_id: new mongoose.Types.ObjectId(category_id) });
      }
    }

    if (filterConditions.length > 0) {
      query = { $and: filterConditions };
    }

    const totalRecs = await AssetsModal.countDocuments(query);

    // Calculate Total Cost for all filtered records
    const costResult = await AssetsModal.aggregate([
      { $match: query },
      { $group: { _id: null, totalCost: { $sum: "$purchaseCost" } } }
    ]);
    const totalCost = costResult.length > 0 ? costResult[0].totalCost : 0;

    let data;
    if (req.body.removePagination) {
      data = await AssetsModal.find(query).sort({ createdAt: -1 });
    } else {
      data = await AssetsModal.find(query)
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
    console.error("Get Assets Data Error:", error);
    res.status(500).json({ errorMsg: error.message, success: false });
  }
};

// GET ONE ASSET
exports.getOneAsset = async (req, res) => {
  try {
    const asset = await AssetsModal.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found", success: false });
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// UPDATE ASSET
exports.updateAssets = async (req, res) => {
  try {
    const asset = await AssetsModal.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: "Asset not found", success: false });

    const { user_id, userName: providedUserName, ...updateData } = req.body;
    const userName = await resolveUserName(user_id, providedUserName);

    // Log the update
    asset.updateLog.push({
      updatedBy: { _id: user_id, name: userName },
      updatedAt: new Date()
    });

    // Handle status change history
    if (updateData.assetStatus && updateData.assetStatus !== asset.assetStatus) {
      asset.statusHistory.push({
        action: "UPDATE",
        status: updateData.assetStatus,
        performedBy: { _id: user_id, name: userName },
        remarks: req.body.remarks || "Status updated"
      });
    }

    // Direct object update for top-level fields
    Object.assign(asset, updateData);

    const result = await asset.save();
    res.status(200).json({ message: "Asset updated successfully", success: true, data: result });
  } catch (error) {
    console.error("Update Asset Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};

// PATCH /api/asset-management-new/patch/status/:id
exports.updateRegistryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, user_id, userName } = req.body;

    const asset = await AssetsModal.findById(id);
    if (!asset) return res.status(404).json({ message: "Asset not found", success: false });

    let finalStatus = "";
    if (status === "APPROVED") finalStatus = "ACTIVE";
    else if (status === "REJECTED") finalStatus = "ASSET_APPROVAL_REJECTED";
    else finalStatus = status;

    asset.assetStatus = finalStatus;
    asset.assetApproval.status = status;
    asset.assetApproval.approvedBy = { _id: user_id, name: userName };
    asset.assetApproval.approvedAt = new Date();
    asset.assetApproval.remarks = remarks;

    asset.statusHistory.push({
      action: "REGISTRY_APPROVAL",
      status: finalStatus,
      performedBy: { _id: user_id, name: userName },
      remarks: `Registry ${status.toLowerCase()}`
    });

    await asset.save();
    res.status(200).json({ message: `Registry ${status.toLowerCase()} successfully`, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// DELETE ASSET
exports.deleteAssets = async (req, res) => {
  try {
    await AssetsModal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Asset deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
};

// BULK UPLOAD ASSETS
exports.bulkUpload_Assets = async (req, res) => {
  try {
    const { data: excelData, fileName, createdBy, userName } = req.body;
    console.log(`[bulkUpload_Assets] Upload started for file: ${fileName}, by user: ${userName} (${createdBy})`);
    console.log(`[bulkUpload_Assets] Total rows received: ${excelData?.length}`);

    // Fetch user profile based on createdBy to get roles and center
    const uploadingUser = await User.findById(createdBy).lean();
    if (!uploadingUser) {
      console.error(`[bulkUpload_Assets] User not found with ID: ${createdBy}`);
    }
    const userRoles = uploadingUser?.roles || [];
    // Extremely robust role check: any role containing "incharge"
    const isAssetIncharge = userRoles.some(role => {
      const r = (typeof role === "string" ? role : role?.role || role?.name || "").toLowerCase().trim();
      return r.includes("incharge");
    });
    // Check multiple possible field names for center ID
    const userCenter_id = uploadingUser?.profile?.center_id || uploadingUser?.profile?.centerID || uploadingUser?.profile?.center_ID;
    const userCenterName = uploadingUser?.profile?.centerName;

    console.log(`[bulkUpload_Assets] User Roles:`, userRoles);
    console.log(`[bulkUpload_Assets] isAssetIncharge:`, isAssetIncharge);
    console.log(`[bulkUpload_Assets] userCenterName:`, userCenterName);
    console.log(`[bulkUpload_Assets] userCenter_id:`, userCenter_id);

    const validData = [];
    const invalidData = [];
    const rowSet = new Set();
    let duplicateCount = 0;

    // Fetch all centers and vendors to avoid repeated DB calls in loop
    const allCentersPromise = Centers.find({}, { _id: 1, centerName: 1, assetManagementCenterCode: 1 }).lean();
    const allVendorsPromise = Vendor.find({}, { _id: 1, "vendorInfo.nameOfCompany": 1, vendorID: 1 }).lean();
    const allCategoriesPromise = AssetCategory.find({}, { _id: 1, fieldValue: 1 }).lean();
    const allSubCategoriesPromise = AssetSubCategory.find({}, { _id: 1, inputValue: 1, dropdown_id: 1 }).lean();
    const allDepartmentsPromise = Department.find({}, { _id: 1, fieldValue: 1 }).lean();
    const allSubDepartmentsPromise = SubDepartment.find({}, { _id: 1, inputValue: 1, dropdown_id: 1 }).lean();
    const allSubLocationsPromise = SubLocation.find({}, { _id: 1, inputValue: 1, dropdown_id: 1 }).lean();
    const allDepreciationMasterPromise = AssetDepreciationMaster.find({}, { dropdown_id: 1, categoryShortName: 1 }).lean();

    const [allCenters, allVendors, allCategories, allSubCategories, allDepartments, allSubDepartments, allSubLocations, allDepreciationMasters] = await Promise.all([
      allCentersPromise, allVendorsPromise, allCategoriesPromise, allSubCategoriesPromise, allDepartmentsPromise, allSubDepartmentsPromise, allSubLocationsPromise, allDepreciationMasterPromise
    ]);

    // Robustly resolve user center name from allCenters if missing in profile
    let resolvedUserCenterName = userCenterName;
    if (!resolvedUserCenterName && userCenter_id && allCenters && allCenters.length > 0) {
      const uCenter = allCenters.find(c => c._id && c._id.toString() === userCenter_id.toString());
      if (uCenter) {
        resolvedUserCenterName = uCenter.centerName;
        console.log(`[bulkUpload_Assets] Center name resolved from master via center_id: ${resolvedUserCenterName}`);
      }
    }
    console.log(`[bulkUpload_Assets] Final Resolved User Center Name:`, resolvedUserCenterName);

    // Tracking sequence counts per prefix to handle multiple records in bulk upload
    const prefixSequenceCounts = {};

    const getNextAssetID = async (prefix) => {
      if (!prefixSequenceCounts[prefix]) {
        const lastAsset = await AssetsModal.findOne({ assetID: { $regex: new RegExp(`^${prefix}`) } }).sort({ assetID: -1 });
        let nextCount = 1;
        if (lastAsset && lastAsset.assetID) {
          const parts = lastAsset.assetID.split("-");
          const lastCount = parseInt(parts[parts.length - 1]);
          if (!isNaN(lastCount)) nextCount = lastCount + 1;
        }
        prefixSequenceCounts[prefix] = nextCount;
      } else {
        prefixSequenceCounts[prefix]++;
      }
      return `${prefix}${prefixSequenceCounts[prefix].toString().padStart(6, "0")}`;
    };

    // Detect column indices or keys from the first row
    let headers = [];
    let isArrayOfArrays = false;

    if (Array.isArray(excelData[0])) {
      headers = excelData[0];
      isArrayOfArrays = true;
    } else if (excelData[0] && typeof excelData[0] === 'object') {
      headers = Object.keys(excelData[0]);
      isArrayOfArrays = false;
    }

    const getIdxOrKey = (possibleNames) => {
      if (isArrayOfArrays) {
        return headers.findIndex(h => possibleNames.some(name => h && String(h).trim().toLowerCase() === name.toLowerCase()));
      } else {
        return headers.find(h => possibleNames.some(name => h && String(h).trim().toLowerCase() === name.toLowerCase()));
      }
    };

    const idx = {
      assetID: getIdxOrKey(["Asset ID", "assetID"]),
      assetName: getIdxOrKey(["Asset Name", "assetName"]),
      brand: getIdxOrKey(["Brand", "brand"]),
      model: getIdxOrKey(["Model", "model"]),
      serialNo: getIdxOrKey(["Serial No", "Serial Number", "serialNo", "serialNumber"]),
      category: getIdxOrKey(["Category", "assetCategory"]),
      subCategory: getIdxOrKey(["SubCategory", "assetSubCategory"]),
      quantity: getIdxOrKey(["Quantity", "quantity", "qty"]),
      center: getIdxOrKey(["Center", "centerName", "center"]),
      sublocation: getIdxOrKey(["Sub-Location", "sublocationName", "subLocation"]),
      department: getIdxOrKey(["Department", "departmentName", "department"]),
      subdepartment: getIdxOrKey(["Sub-Department", "subdepartmentName", "subDepartment"]),
      vendor: getIdxOrKey(["Vendor", "vendorName", "vendor"]),
      cost: getIdxOrKey(["Purchase Cost", "purchaseCost", "Cost"]),
      purchaseDate: getIdxOrKey(["Purchase Date", "purchaseDate"]),
      invoiceNo: getIdxOrKey(["Invoice Number", "invoiceNumber", "Invoice No"]),
      warrantyDate: getIdxOrKey(["Warranty Date", "warrantyDate"]),
      description: getIdxOrKey(["Description", "description"])
    };

    // If it's an array of arrays, the first row is headers, so skip it.
    // If it's an array of objects, the first row is data.
    const dataToProcess = isArrayOfArrays ? excelData.slice(1) : excelData;

    for (let row of dataToProcess) {
      if (!row) continue;

      const getValue = (keyOrIdx) => {
        if (keyOrIdx === -1 || keyOrIdx === undefined) return undefined;
        return row[keyOrIdx];
      };

      const sanitize = (val) => (val !== undefined && val !== null && String(val).trim() !== "" && String(val).trim() !== "-") ? String(val).trim() : null;

      let assetID = sanitize(getValue(idx.assetID));
      const assetName = getValue(idx.assetName) || "Unknown Asset";
      const brand = sanitize(getValue(idx.brand));
      const model = sanitize(getValue(idx.model));
      const serialNumber = sanitize(getValue(idx.serialNo));
      const category = sanitize(getValue(idx.category));
      const subCategory = sanitize(getValue(idx.subCategory));
      const quantity = parseInt(getValue(idx.quantity) || 1);
      const rawCost = getValue(idx.cost);
      let purchaseCost = 0;
      if (rawCost !== undefined && rawCost !== null) {
        if (typeof rawCost === "number") {
          purchaseCost = rawCost;
        } else {
          // Remove currency symbols, commas, and other non-numeric chars except decimal point
          const cleanedCost = String(rawCost).replace(/[^0-9.-]+/g, "");
          purchaseCost = parseFloat(cleanedCost);
        }
      }
      if (isNaN(purchaseCost)) purchaseCost = 0;
      const description = getValue(idx.description);

      const parseDate = (rawDate) => {
        if (!rawDate) return null;
        if (typeof rawDate === "number") {
          // Handle Excel numeric date
          return new Date(Math.round((rawDate - 25569) * 86400 * 1000));
        }
        if (typeof rawDate === "string") {
          const parsedDate = moment(rawDate, ["DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"], true);
          if (parsedDate.isValid()) return parsedDate.toDate();
          const nativeDate = new Date(rawDate);
          if (!isNaN(nativeDate.getTime())) return nativeDate;
        } else if (rawDate instanceof Date) {
          return rawDate;
        }
        return null;
      };

      const purchaseDate = parseDate(getValue(idx.purchaseDate));
      const warrantyDate = parseDate(getValue(idx.warrantyDate));
      const invoiceNumber = getValue(idx.invoiceNo);

      const centerName = sanitize(getValue(idx.center));
      const sublocationName = sanitize(getValue(idx.sublocation));
      const departmentName = sanitize(getValue(idx.department));
      const subdepartmentName = sanitize(getValue(idx.subdepartment));
      const vendorName = sanitize(getValue(idx.vendor));

      // Check if ID is provided and if it already exists
      if (assetID) {
        if (rowSet.has(assetID)) {
          invalidData.push({ ...row, failedRemark: "Duplicate Asset ID in file" });
          duplicateCount++;
          continue;
        }
        const exists = await AssetsModal.findOne({ assetID });
        if (exists) {
          invalidData.push({ ...row, failedRemark: "Asset ID already exists in system" });
          continue;
        }
        rowSet.add(assetID);
      }

      // Resolve Center (Mandatory)
      let centerObj = undefined;
      let finalCenterName = centerName;

      // If Center is blank and user is asset-incharge (or has a center assigned), use user's center
      const isRoleMatch = userRoles.some(role => {
        const r = (typeof role === "string" ? role : role?.role || role?.name || "").toLowerCase().trim();
        return r.includes("incharge");
      });

      if (!finalCenterName && (isAssetIncharge || isRoleMatch || userCenter_id) && resolvedUserCenterName) {
        finalCenterName = resolvedUserCenterName;
      }

      if (!finalCenterName) {
        invalidData.push({ ...row, failedRemark: "Center is mandatory" });
        continue;
      }

      if (finalCenterName) {
        const center = allCenters.find(c => c.centerName?.toLowerCase().trim() === finalCenterName.toLowerCase().trim());
        if (!center) {
          invalidData.push({ ...row, failedRemark: `Center '${finalCenterName}' not found in system` });
          continue;
        }
        centerObj = { _id: center._id, name: center.centerName, assetManagementCenterCode: center.assetManagementCenterCode };
      }

      // Resolve Category (Required)
      if (!category) {
        invalidData.push({ ...row, failedRemark: "Category is required" });
        continue;
      }
      const categoryDetails = allCategories.find(c => c.fieldValue?.toLowerCase() === category?.toLowerCase());
      if (!categoryDetails) {
        invalidData.push({ ...row, failedRemark: `Category '${category}' not found in system` });
        continue;
      }

      // Resolve SubCategory (Required)
      if (!subCategory) {
        invalidData.push({ ...row, failedRemark: "Sub-Category is required" });
        continue;
      }
      const subCategoryDetails = allSubCategories.find(s => s.inputValue?.toLowerCase() === subCategory?.toLowerCase() && s.dropdown_id?.toString() === categoryDetails._id.toString());
      if (!subCategoryDetails) {
        invalidData.push({ ...row, failedRemark: `Sub-Category '${subCategory}' not found for Category '${category}'` });
        continue;
      }

      // Resolve Department (Optional but validate if provided)
      let departmentObj = undefined;
      if (departmentName) {
        const dept = allDepartments.find(d => d.fieldValue?.toLowerCase() === departmentName.toLowerCase());
        if (!dept) {
          invalidData.push({ ...row, failedRemark: `Department '${departmentName}' not found in system` });
          continue;
        }
        departmentObj = { _id: dept._id, name: dept.fieldValue };
      }

      // Resolve Sub-Department (Optional but validate if provided)
      let subdepartmentObj = undefined;
      if (subdepartmentName) {
        if (!departmentObj) {
          invalidData.push({ ...row, failedRemark: "Sub-Department provided without Department" });
          continue;
        }
        const sd = allSubDepartments.find(s => s.inputValue?.toLowerCase() === subdepartmentName.toLowerCase() && s.dropdown_id?.toString() === departmentObj._id.toString());
        if (!sd) {
          invalidData.push({ ...row, failedRemark: `Sub-Department '${subdepartmentName}' not found for Department '${departmentName}'` });
          continue;
        }
        subdepartmentObj = { _id: sd._id, name: sd.inputValue };
      }

      // Resolve Sub-Location (Optional but validate if provided)
      let sublocationObj = undefined;
      if (sublocationName) {
        if (!centerObj) {
          invalidData.push({ ...row, failedRemark: "Sub-Location provided without Center" });
          continue;
        }
        const sl = allSubLocations.find(l => l.inputValue?.toLowerCase() === sublocationName.toLowerCase() && l.dropdown_id?.toString() === centerObj._id.toString());
        if (!sl) {
          invalidData.push({ ...row, failedRemark: `Sub-Location '${sublocationName}' not found for Center '${centerName}'` });
          continue;
        }
        sublocationObj = { _id: sl._id, name: sl.inputValue };
      }

      // Resolve Vendor
      let vendorObj = null;
      if (vendorName) {
        const v = allVendors.find(vend => vend.vendorInfo?.nameOfCompany?.toLowerCase() === vendorName.toLowerCase());
        if (v) {
          vendorObj = { _id: v._id, name: v.vendorInfo.nameOfCompany };
        } else {
          vendorObj = { name: vendorName };
        }
      }

      // Quantity Logic: Loop to create multiple records
      console.log(`Processing ${assetName} with quantity ${quantity}`);

      const centerCode = centerObj?.assetManagementCenterCode || "NA";
      const depMaster = allDepreciationMasters.find(d => d.dropdown_id?.toString() === categoryDetails._id.toString());
      const categoryCode = depMaster?.categoryShortName || "NA";
      const prefix = `LF-${centerCode}-${categoryCode}-`;

      for (let i = 0; i < (quantity > 0 ? quantity : 1); i++) {
        let finalAssetID = assetID;
        if (!finalAssetID) {
          finalAssetID = await getNextAssetID(prefix);
        }
        console.log(`Creating copy ${i + 1} with ID: ${finalAssetID}`);

        validData.push({
          assetID: finalAssetID,
          assetName,
          brand,
          model,
          serialNumber, // Note: In bulk upload with quantity > 1, they might all get same serial if provided. Usually user should provide one row per serial if they are unique.
          category: categoryDetails.fieldValue,
          category_id: categoryDetails._id,
          subCategory: subCategoryDetails.inputValue,
          subCategory_id: subCategoryDetails._id,
          purchaseCost,
          purchaseDate,
          warrantyDate,
          invoiceNumber,
          description,
          vendor: vendorObj,
          assetStatus: "ASSET_APPROVAL_PENDING",
          currentAllocation: {
            center: centerObj,
            subLocation: sublocationObj,
            department: departmentObj,
            subDepartment: subdepartmentObj,
          },
          assetApproval: {
            status: "PENDING",
            requestedBy: { _id: createdBy, name: userName }
          },
          statusHistory: [{
            action: "BULK_UPLOAD",
            status: "ASSET_APPROVAL_PENDING",
            performedBy: { _id: createdBy, name: userName },
            remarks: `Bulk uploaded from ${fileName}`
          }],
          createdBy: { _id: createdBy, name: userName }
        });

        // Reseting assetID for next iteration of quantity loop (if any) so it gets a new auto-generated ID
        if (!assetID) {
          // already incremented nextCount, so next record will get new ID
        } else {
          // If assetID was provided in row, we can't really auto-generate for the 2nd copy easily without conflict 
          // unless we append something or only auto-generate if missing.
          // User said "if quantity is 2 then same 2 assets will be uploaded with same info". 
          // If assetID is provided, it must be unique. So normally quantity > 1 should be used with missing Asset ID.
          // If they provide Asset ID AND Quantity > 1, it will fail on 2nd record due to duplicate.
          // I'll add a check or just let it fail if they provide the same ID.
          // Actually, if assetID is provided, I'll clear it after the first one so subsequent ones get auto-generated? 
          // Or better: only allow quantity > 1 if assetID is missing.
          if (i === 0) assetID = null; // Next copies get auto-generated IDs
        }
      }
    }

    if (validData.length > 0) {
      console.log(`[bulkUpload_Assets] Inserting ${validData.length} valid records`);
      const fs = require('fs');
      try {
        fs.writeFileSync('C:/iAssureit/Lupin/LupinMIS2024/API/tmp/bulk_debug.json', JSON.stringify(validData, null, 2));
      } catch (e) {
        console.error("Failed to write debug log", e);
      }
      await AssetsModal.insertMany(validData);
    }

    if (invalidData.length > 0) {
      const failedRecords = {
        FailedRecords: invalidData,
        fileName: fileName,
        totalRecords: invalidData.length
      };
      await insertFailedRecords(failedRecords, req.body.updateBadData || false);
    }

    res.status(200).json({
      message: "Bulk upload completed",
      success: true,
      completed: true,
      validRecordsCount: validData.length,
      invalidRecordsCount: invalidData.length,
      duplicates: duplicateCount
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
};

exports.filedetails = async (req, res) => {
  try {
    let { fileName } = req.params;
    fileName = decodeURIComponent(fileName);
    console.log(`[filedetails] Request for decoded file: ${fileName}`);
    const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const query = { "statusHistory.remarks": { $regex: escapedFileName, $options: "i" } };
    const goodrecords = await AssetsModal.find(query).lean();

    // Fallback if regex fails, search by original fileName directly
    if (goodrecords.length === 0) {
      const allAssets = await AssetsModal.find({ "statusHistory.action": "BULK_UPLOAD" }).lean();
      const finalResults = allAssets.filter(r =>
        r.statusHistory?.some(s => s.remarks && s.remarks.toLowerCase().includes(fileName.toLowerCase()))
      );
      if (finalResults.length > 0) goodrecords.push(...finalResults);
    }

    const badrecords = await FailedRecords.findOne({ fileName: { $regex: escapedFileName, $options: "i" } }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      goodrecords,
      failedRecords: badrecords ? badrecords.failedRecords : [],
      totalRecords: goodrecords.length + (badrecords ? badrecords.totalRecords : 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET DASHBOARD COUNTS
exports.getDashboardCounts = async (req, res) => {
  try {
    const { center_ID } = req.query;
    let query = {};
    if (center_ID && center_ID !== "all") {
      if (mongoose.Types.ObjectId.isValid(center_ID)) {
        query = { "currentAllocation.center._id": new mongoose.Types.ObjectId(center_ID) };
      } else {
        // Fallback for cases where it might be passed as a string but not valid ObjectId
        // Or if it's a specific "all" related string
      }
    }

    const total = await AssetsModal.countDocuments(query);
    const allocated = await AssetsModal.countDocuments({ ...query, assetStatus: "ALLOCATED" });
    const available = await AssetsModal.countDocuments({ ...query, assetStatus: "ACTIVE" });
    const pending = await AssetsModal.countDocuments({
      ...query,
      assetStatus: { $in: ["ASSET_APPROVAL_PENDING", "ALLOCATION_APPROVAL_PENDING"] }
    });
    const rejected = await AssetsModal.countDocuments({
      ...query,
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

var insertFailedRecords = async (invalidData, updateBadData) => {
  return new Promise(function (resolve, reject) {
    FailedRecords.find({ fileName: invalidData.fileName })
      .exec()
      .then((data) => {
        if (data.length > 0) {
          if (data[0].failedRecords.length > 0) {
            if (updateBadData) {
              FailedRecords.updateOne(
                { fileName: invalidData.fileName },
                { $set: { failedRecords: [] } }
              )
                .then((data) => {
                  if (data.modifiedCount == 1) {
                    FailedRecords.updateOne(
                      { fileName: invalidData.fileName },
                      {
                        $set: {
                          totalRecords: invalidData.totalRecords
                        },
                        $push: { failedRecords: invalidData.FailedRecords },
                      }
                    )
                      .then((data) => {
                        resolve(data);
                      })
                      .catch((err) => {
                        reject(err);
                      });
                  } else {
                    resolve(0);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            } else {
              FailedRecords.updateOne(
                { fileName: invalidData.fileName },
                {
                  $set: {
                    totalRecords: invalidData.totalRecords
                  },
                  $push: { failedRecords: { $each: invalidData.FailedRecords } },
                }
              )
                .then((data) => {
                  resolve(data);
                })
                .catch((err) => {
                  reject(err);
                });
            }
          } else {
            FailedRecords.updateOne(
              { fileName: invalidData.fileName },
              {
                $set: {
                  totalRecords: invalidData.totalRecords
                },
                $push: { failedRecords: { $each: invalidData.FailedRecords } },
              }
            )
              .then((data) => {
                resolve(data);
              })
              .catch((err) => {
                reject(err);
              });
          }
        } else {
          const failedRecords = new FailedRecords({
            _id: new mongoose.Types.ObjectId(),
            failedRecords: invalidData.FailedRecords,
            fileName: invalidData.fileName,
            totalRecords: invalidData.totalRecords,
            createdAt: new Date(),
          });

          failedRecords
            .save()
            .then((data) => {
              resolve(data._id);
            })
            .catch((err) => {
              reject(err);
            });
        }
      });
  });
};
