const Vendor = require("./model");
const mongoose = require("mongoose");
const Centers = require("../centers/model");
const Categories = require("../oneFieldModules/vendorCategory/model")
const SubCategories = require("../oneFieldModules/vendorSubCategory/model")
const globalVariable = require("../../../nodemonConfig")

const VendorCategory = require("../oneFieldModules/vendorCategory/model");
const VendorSubCategory = require("../oneFieldModules/vendorSubCategory/model");
const getCurrentYear = () => {
  return new Date().getFullYear();
};

async function getShortCenterName(centerName) {
  const centersArray = globalVariable?.centersArray;

  const center = centersArray?.find(
    (c) => c?.centerName?.toLowerCase() === centerName?.toLowerCase()
  );

  return center ? center?.shortName : null;
}

// const generateVendorCode = async (centerName, sequenceMap) => {
//   const year = getCurrentYear();
//   const centerShortCode = await getShortCenterName(centerName);

//   if (!centerShortCode) {
//     throw new Error("Invalid center name");
//   }

//   const key = "GLOBAL_SEQUENCE"; // 🔥 one global key

//   // 🔹 Initialize only once
//   if (!sequenceMap[key]) {
//     const lastVendor = await Vendor.findOne({
//       vendorID: { $regex: `VEN-` }, // 🔥 ignore center
//     })
//       .sort({ vendorID: -1 })
//       .select("vendorID")
//       .lean();

//     let lastSeq = 0;

//     if (lastVendor && lastVendor.vendorID) {
//       const seqPart = lastVendor.vendorID.split("VEN-")[1];
//       lastSeq = parseInt(seqPart) || 0;
//     }

//     sequenceMap[key] = lastSeq;
//   }

//   // 🔹 Increment globally
//   sequenceMap[key] += 1;

//   const sequence = String(sequenceMap[key]).padStart(6, "0");

//   return `${year}/${centerShortCode}/VEN-${sequence}`;
// };


exports.createVendor = async (req, res) => {
  console.log("CREATE VENDOR REQUEST BODY:", req.body);
  try {

    if (!req.body.vendorInfo || !req.body.vendorInfo.panNumber) {
      return res.status(400).json({
        message: "PAN Number is required",
      });
    }

    if (!req.body.vendorInfo.nameOfCompany) {
      return res.status(400).json({
        message: "Company Name is required",
      });
    }

    if (!req.body.vendorInfo.vendorCategory_id) {
      return res.status(400).json({
        message: "Vendor Category is required",
      });
    }

    if (!req.body.vendorInfo.vendorSubCategory_id) {
      return res.status(400).json({
        message: "Vendor SubCategory is required",
      });
    }

    const existingVendor = await Vendor.findOne({
      "vendorInfo.panNumber": req.body.vendorInfo.panNumber,
    });

    if (existingVendor) {
      return res.status(409).json({
        message: "Vendor with this PAN already exists",
      });
    }

    const centerName =
      req.body.vendorInfo?.lupinFoundationCenterName;

    const vendorCode = await generateVendorCode(centerName, sequenceMap = {});


    const vendor = new Vendor({
      _id: new mongoose.Types.ObjectId(),
      vendorID: vendorCode,
      vendorStatus: "Active",
      vendorInfo: req.body.vendorInfo,
      bankDetails: req.body.bankDetails || {},
      addressDetails: req.body.addressDetails || {},
      docs: req.body.docs || [],
      createdBy: req.body.user_id || null,
    });

    const result = await vendor.save();

    return res.status(201).json({
      success: true,
      message: "Vendor Created Successfully",
      data: result,
    });

  } catch (error) {
    console.error("CREATE VENDOR ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getVendors = async (req, res) => {
  try {

    let {
      page = 1,
      limit = 10,
      search = "",
      removePagination = false,
      vendorCategory,
      vendorSubCategory,
      centerName
    } = req.body;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const matchStage = {};

    /* ================= SEARCH ================= */

    if (search && search.trim() !== "") {
      matchStage.$or = [
        { vendorID: { $regex: search.trim(), $options: "i" } },
        { "vendorInfo.nameOfCompany": { $regex: search.trim(), $options: "i" } },
        { "vendorInfo.mobileNumber": { $regex: search.trim(), $options: "i" } },
      ];
    }

    /* ================= FILTERS ================= */

    // if (vendorCategory && vendorCategory !== "") {
    //   matchStage["vendorInfo.vendorCategory"] = vendorCategory;
    // }

    // if (vendorSubCategory && vendorSubCategory !== "") {
    //   matchStage["vendorInfo.vendorSubCategory"] = vendorSubCategory;
    // }
    if (vendorCategory && vendorCategory !== "") {
      matchStage["vendorInfo.vendorCategory_id"] = new mongoose.Types.ObjectId(vendorCategory);
    }

    if (vendorSubCategory && vendorSubCategory !== "") {
      matchStage["vendorInfo.vendorSubCategory_id"] = new mongoose.Types.ObjectId(vendorSubCategory);
    }

    if (centerName && centerName !== "") {
      matchStage["vendorInfo.lupinFoundationCenterName"] = centerName;
    }

    const pipeline = [];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    /* ================= TOTAL COUNT ================= */

    const totalResult = await Vendor.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    /* ================= DATA ================= */

    const dataPipeline = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
    ];

    if (!removePagination) {
      dataPipeline.push({ $skip: skip });
      dataPipeline.push({ $limit: limit });
    }

    const vendors = await Vendor.aggregate(dataPipeline);

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      tableData: vendors,
      total,
      currentPage: removePagination ? 1 : page,
      totalPages: removePagination ? 1 : Math.ceil(total / limit),
      limit: removePagination ? total : limit,
    });

  } catch (error) {
    console.error("GET VENDORS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.updateVendor = async (req, res) => {
//   try {
//     const vendor = await Vendor.findById(req.params.id);

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: "Vendor not found",
//       });
//     }

//     // Prevent duplicate vendorCode
//     if (req.body.vendorID) {
//       const existing = await Vendor.findOne({
//         vendorID: req.body.vendorID,
//         _id: { $ne: req.params.id },
//       });

//       if (existing) {
//         return res.status(400).json({
//           success: false,
//           message: "Vendor ID already exists",
//         });
//       }
//     }

//     const updated = await Vendor.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Vendor Updated Successfully",
//       data: updated,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // ✅ Clean empty fields
    const cleanObject = (obj) => {
      Object.keys(obj).forEach((key) => {
        if (obj[key] === "") {
          delete obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          cleanObject(obj[key]);
        }
      });
    };

    cleanObject(req.body);

    // Prevent duplicate vendorID
    if (req.body.vendorID) {
      const existing = await Vendor.findOne({
        vendorID: req.body.vendorID,
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Vendor ID already exists",
        });
      }
    }

    const updated = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Vendor Updated Successfully",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    await Vendor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vendor Deleted Successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFinancialYear = () => {
  const today = new Date();

  const currentYear = today.getFullYear();
  const month = today.getMonth() + 1; // January = 0

  let startYear;
  let endYear;

  if (month >= 4) {
    // April to December
    startYear = currentYear;
    endYear = currentYear + 1;
  } else {
    // January to March
    startYear = currentYear - 1;
    endYear = currentYear;
  }

  // Example: 2026-27
  return `${startYear}-${String(endYear).slice(-2)}`;
};

const generateVendorCode = async (centerName, sequenceMap) => {
  // const year = new Date().getFullYear();  // get current year as 4-digit number
  const financialYear  = getFinancialYear();

  let centerShortCode = "LUP";
  if (centerName && centerName.trim() !== "") {
    const shortCode = await getShortCenterName(centerName);
    if (shortCode) {
      centerShortCode = shortCode;
    }
  }
  // const centerShortCode = await getShortCenterName(centerName);

  if (!centerShortCode) {
    throw new Error("Invalid center name");
  }

  const key = "GLOBAL_SEQUENCE";

  if (!sequenceMap[key]) {
    const lastVendor = await Vendor.findOne({
      vendorID: { $regex: `VEN-` },
    })
      .sort({ vendorID: -1 })
      .select("vendorID")
      .lean();

    let lastSeq = 0;

    if (lastVendor && lastVendor.vendorID) {
      const seqPart = lastVendor.vendorID.split("VEN-")[1];
      lastSeq = parseInt(seqPart) || 0;
    }

    sequenceMap[key] = lastSeq;
  }

  sequenceMap[key] += 1;

  const sequence = String(sequenceMap[key]).padStart(6, "0");

  return `${financialYear}/LUP/VEN-${sequence}`;
  // return `${year}/${centerShortCode}/VEN-${sequence}`;
};


const getOrCreateCategory = async (categoryName, categoryMap) => {
  if (!categoryName) return null;

  const key = categoryName.trim().toLowerCase();

  // From memory
  if (categoryMap.has(key)) {
    return categoryMap.get(key);
  }

  // From DB (case-insensitive)
  let existing = await VendorCategory.findOne({
    fieldValue: { $regex: `^${categoryName}$`, $options: "i" },
  }).lean();

  if (existing) {
    categoryMap.set(key, existing._id);
    return existing._id;
  }

  // Create new
  const newCategory = await VendorCategory.create({
    _id: new mongoose.Types.ObjectId(),
    fieldValue: categoryName,
    createdAt: new Date(),
  });

  categoryMap.set(key, newCategory._id);

  return newCategory._id;
};

const getOrCreateSubCategory = async (
  categoryName,
  subCategoryName,
  categoryId,
  subCategoryMap
) => {
  if (!categoryName || !subCategoryName) return;

  const key = `${categoryName.trim().toLowerCase()}|${subCategoryName
    .trim()
    .toLowerCase()}`;

  // From memory
  if (subCategoryMap.has(key)) return;

  // From DB
  let existing = await VendorSubCategory.findOne({
    dropdownvalue: { $regex: `^${categoryName}$`, $options: "i" },
    inputValue: { $regex: `^${subCategoryName}$`, $options: "i" },
  }).lean();

  if (existing) {
    subCategoryMap.set(key, true);
    return;
  }

  // Create new
  await VendorSubCategory.create({
    _id: new mongoose.Types.ObjectId(),
    dropdownvalue: categoryName,
    dropdown_id: categoryId,
    inputValue: subCategoryName,
    dropdownLabel: "vendor category",
    inputLabel: "vendor subcategory",
    createdAt: new Date(),
  });

  subCategoryMap.set(key, true);
};


const validateVendorRow = (row) => {
  let errors = [];

  const vendorInfo = row;
  const bankDetails = row;
  const addressDetails = row;

  /* ================= VENDOR INFO ================= */

  if (!vendorInfo.vendorName?.trim()) {
    errors.push("Vendor Name is required");
  }

  if (!vendorInfo.panNumber?.trim()) {
    errors.push("PAN Number is required");
  } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(vendorInfo.panNumber)) {
    errors.push("Invalid PAN format");
  }

  if (vendorInfo.gstin?.trim()) {
    if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        vendorInfo.gstin
      )
    ) {
      errors.push("Invalid GSTIN format");
    }
  }

  if (!vendorInfo.primaryContactPersonName?.trim()) {
    errors.push("Primary Contact Person is required");
  }

  if (!vendorInfo.designation?.trim()) {
    errors.push("Designation is required");
  }

  if (!vendorInfo.mobileNumber?.trim()) {
    errors.push("Mobile Number is required");
  } else if (!/^[6-9]\d{9}$/.test(vendorInfo.mobileNumber)) {
    errors.push("Invalid Mobile Number");
  }

  if (!vendorInfo.officialEmailId?.trim()) {
    errors.push("Official Email is required");
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorInfo.officialEmailId)
  ) {
    errors.push("Invalid Email");
  }

  /* ================= BANK ================= */

  if (!bankDetails.bankName?.trim()) {
    errors.push("Bank Name is required");
  }

  if (!bankDetails.branchName?.trim()) {
    errors.push("Branch Name is required");
  }

  if (!bankDetails.accountHolderName?.trim()) {
    errors.push("Account Holder Name is required");
  }

  if (!bankDetails.accountNumber?.trim()) {
    errors.push("Account Number is required");
  } else if (!/^\d+$/.test(bankDetails.accountNumber)) {
    errors.push("Account Number must be numeric");
  }

  if (!bankDetails.ifscCode?.trim()) {
    errors.push("IFSC Code is required");
  } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
    errors.push("Invalid IFSC Code");
  }

  if (!bankDetails.accountType?.trim()) {
    errors.push("Account Type is required");
  }

  /* ================= ADDRESS ================= */

  if (!addressDetails.addressLine1?.trim()) {
    errors.push("Address is required");
  }

  if (!addressDetails.city?.trim()) {
    errors.push("City is required");
  }

  if (!addressDetails.district?.trim()) {
    errors.push("District is required");
  }

  if (!addressDetails.state?.trim()) {
    errors.push("State is required");
  }

  if (!addressDetails.country?.trim()) {
    errors.push("Country is required");
  }

  if (!addressDetails.pinCode?.trim()) {
    errors.push("PIN Code is required");
  } else if (!/^\d{6}$/.test(addressDetails.pinCode)) {
    errors.push("Invalid PIN Code");
  }

  return errors;
};

exports.bulkUpload_Vendors = (req, res, next) => {
  var excelData = req.body.data;
  var validData = [];
  var invalidData = [];
  var failedRecords = {};
  var rowSet = new Set();
  var DuplicateCount = 0;

  processData();

  async function processData() {
    try {
      let sequenceMap = {};


      const allVendors = await Vendor.find(
        {},
        "vendorInfo.nameOfCompany"
      ).lean();

      const allCategories = await VendorCategory.find(
        {},
        "fieldValue"
      ).lean();

      const allSubCategories = await VendorSubCategory.find(
        {},
        "dropdownvalue inputValue"
      ).lean();


      for (let k = 0; k < excelData.length; k++) {
        let row = excelData[k];
        let remark = "";

        const companyName = row.vendorName?.trim() || "";

        /* ================= BASIC CHECK ================= */

        if (!companyName || companyName === "-") {
          remark += "Company name not found, ";
        }

        if (rowSet.has(companyName)) {
          remark += "Duplicate company in file, ";
          DuplicateCount++;
        }

        rowSet.add(companyName);

        const companyExists = allVendors.some(
          (item) => item.vendorInfo.nameOfCompany === companyName
        );

        if (companyExists) {
          remark += "Vendor already exists in system, ";
        }

        /* ================= CATEGORY ================= */

        const categoryName = row.vendorCategory?.trim();
        const subCategoryName =
          row.vendorType?.trim() || row.vendorSubCategory?.trim();

        const categoryAvailability = allCategories.filter((item) => {
          if (
            item.fieldValue.toLowerCase() ===
            categoryName?.toLowerCase()
          ) {
            return item;
          }
        });

        if (!categoryName) {
          remark += "Vendor Category is required, ";
        } else if (categoryAvailability.length === 0) {
          remark += `${categoryName} is not available in Vendor Category Master, `;
        }

        const subCategoryAvailability = allSubCategories.filter((item) => {
          if (
            item.dropdownvalue.toLowerCase() ===
            categoryName?.toLowerCase() &&
            item.inputValue.toLowerCase() ===
            subCategoryName?.toLowerCase()
          ) {
            return item;
          }
        });

        if (!subCategoryName) {
          remark += "Vendor SubCategory is required, ";
        } else if (subCategoryAvailability.length === 0) {
          remark += `${subCategoryName} is not available under ${categoryName}, `;
        }

        /* ================= FORM VALIDATION ================= */

        const validationErrors = validateVendorRow(row);

        if (validationErrors.length > 0) {
          remark += validationErrors.join(", ") + ", ";
        }

        /* ================= FINAL DECISION ================= */

        if (remark === "") {
          /* ✅ USE DB VALUES */
          const finalCategoryName =
            categoryAvailability[0].fieldValue;

          const finalSubCategoryName =
            subCategoryAvailability[0].inputValue;

          const vendorID = await generateVendorCode(
            row.centerName,
            sequenceMap
          );

          validData.push({
            _id: new mongoose.Types.ObjectId(),
            vendorID,
            vendorStatus: "Active",

            vendorInfo: {
              nameOfCompany: row.vendorName,
              vendorCategory: finalCategoryName,
              vendorSubCategory: finalSubCategoryName,
              panNumber: row.panNumber,
              gstin: row.gstin,
              tdsApplicable:
                row.tdsApplicable === true ||
                row.tdsApplicable === "TRUE" ||
                row.tdsApplicable === "true",
              lupinFoundationCenterName:
                row.centerName,
              primaryContactPersonName:
                row.primaryContactPersonName,
              designation: row.designation,
              mobileNumber: row.mobileNumber,
              officialEmailId: row.officialEmailId,
            },

            bankDetails: {
              bankName: row.bankName,
              branchName: row.branchName,
              accountHolderName: row.accountHolderName,
              accountNumber: row.accountNumber,
              ifscCode: row.ifscCode
                ? row.ifscCode.trim().toUpperCase()
                : "",
              accountType: row.accountType,
            },

            addressDetails: {
              addressLine1: row.addressLine1,
              city: row.city,
              district: row.district,
              state: row.state,
              country: row.country,
              pinCode: row.pinCode,
            },

            fileName: req.body.fileName || "Unknown_File",
          });
        } else {

          invalidData.push({
            ...row,
            failedRemark: remark.replace(/,\s*$/, ""), // remove last comma
          });
        }
      }

      /* =========================================
         INSERT
      ========================================= */
      if (validData.length > 0) {
        await Vendor.insertMany(validData);
      }

      if (invalidData.length > 0) {
        failedRecords.FailedRecords = invalidData;
        failedRecords.totalRecords = invalidData.length;
        failedRecords.fileName = req.body.fileName || "Unknown";
      }

      /* =========================================
         RESPONSE
      ========================================= */
      res.status(200).json({
        message: "Bulk upload process completed successfully!",
        completed: true,
        validRecords: validData.length,
        invalidRecords: invalidData.length,
        duplicates: DuplicateCount,
        validData,
        failedRecords,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
};


exports.vendorFileDetails = async (req, res, next) => {
  try {
    const fileName = req.params.fileName;

    if (!fileName) {
      return res.status(400).json({
        message: "File name is required",
      });
    }

    // 1️⃣ Get Successful Records
    const goodRecords = await Vendor.find(
      { fileName },
      {
        vendorID: 1,
        vendorStatus: 1,
        vendorInfo: 1,
        bankDetails: 1,
        addressDetails: 1,
        createdAt: 1,
      }
    ).lean();

    // 2️⃣ Get Failed Records
    const uploadLog = await BulkUploadLogs.findOne({
      fileName,
      module: "Vendor",
    }).lean();

    const failedRecords = uploadLog?.failedRecords || [];

    return res.status(200).json({
      message: "File details fetched successfully",
      completed: true,

      // ✅ SAME FORMAT AS BULK UPLOAD API
      validData: goodRecords,
      failedRecords: failedRecords,

      validRecords: goodRecords.length,
      invalidRecords: failedRecords.length,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Old Get distinct dropdown options for Vendor Category, Vendor SubCategory and Center Name
// exports.getVendorDropdownOptions = async (req, res) => {
//   try {
//     const [categories, types, centers] = await Promise.all([
//       Vendor.distinct("vendorInfo.vendorCategory"),
//       Vendor.distinct("vendorInfo.vendorSubCategory"),
//       Centers.find({}, { _id: 1, centerName: 1 }).lean(),
//     ]);

//     const cleanStrings = (arr) =>
//       (arr || [])
//         .filter((v) => v !== null && v !== undefined)
//         .map((v) => String(v).trim())
//         .filter((v) => v.length > 0);

//     const cleanCenters = (arr) =>
//       (arr || [])
//         .filter((c) => c && c._id && c.centerName)
//         .map((c) => ({
//           _id: c._id,
//           centerName: String(c.centerName).trim(),
//         }));

//     return res.status(200).json({
//       success: true,
//       data: {
//         vendorCategories: cleanStrings(categories),
//         vendorSubCategories: cleanStrings(types),
//         centers: cleanCenters(centers),
//       },
//     });
//   } catch (error) {
//     console.error("GET VENDOR DROPDOWN OPTIONS ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


exports.getVendorDropdownOptions = async (req, res) => {
  try {

    const [categories, subCategories, centers] = await Promise.all([
      Categories.find({}, { _id: 1, fieldValue: 1 }).lean(),
      SubCategories.find({}, { _id: 1, inputValue: 1, dropdown_id: 1 }).lean(),
      Centers.find({}, { _id: 1, centerName: 1 }).lean(),
    ]);

    // Clean Categories
    const vendorCategories = (categories || [])
      .filter((c) => c && c.fieldValue)
      .map((c) => ({
        _id: c._id,
        name: String(c.fieldValue).trim(),
      }));

    // Clean SubCategories
    const vendorSubCategories = (subCategories || [])
      .filter((s) => s && s.inputValue)
      .map((s) => ({
        _id: s._id,
        name: String(s.inputValue).trim(),
        categoryId: s.dropdown_id, // link to category
      }));

    // Clean Centers
    const cleanCenters = (centers || [])
      .filter((c) => c && c.centerName)
      .map((c) => ({
        _id: c._id,
        centerName: String(c.centerName).trim(),
      }));

    // console.log("vendorCategories -->", vendorCategories);
    // console.log("cleanCenters -->", cleanCenters);


    return res.status(200).json({
      success: true,
      data: {
        vendorCategories,
        // vendorSubCategories,
        centers: cleanCenters,
      },
    });

  } catch (error) {
    console.error("GET VENDOR DROPDOWN OPTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getSubCategoriesByCategory = async (req, res) => {
  try {

    const { categoryId } = req.params;

    const subCategories = await SubCategories.find(
      { dropdown_id: categoryId },
      { _id: 1, inputValue: 1 }
    ).lean();

    const cleanSubCategories = (subCategories || []).map((s) => ({
      _id: s._id,
      name: s.inputValue
    }));

    return res.status(200).json({
      success: true,
      data: cleanSubCategories
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL VENDOR LIST WITH UNIQUE FORMAT - VENDORNAME - VENDORID (FOR DROPDOWN IN UTILIZATION)
exports.getAllVendorList = async (req, res) => {
  console.log("req.params---> ", req.params);
  try {
    const { centerId } = req.params;

    let filter = {};

    // 👉 If centerId is provided
    if (centerId) {
      const center = await Centers.findById(centerId);

      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      // assuming center has field: centerName
      filter["vendorInfo.lupinFoundationCenterName"] = center.centerName;
    }


    // const vendors = await Vendor.find(filter, {
    //   vendorID: 1,
    //   "vendorInfo.nameOfCompany": 1,
    // }).sort({ "vendorInfo.nameOfCompany": 1 });

    // 👉 Fetch FULL vendor data
    const vendors = await Vendor.find(filter).sort({
      "vendorInfo.nameOfCompany": 1,
    });

    const formattedVendors = vendors.map((v) => ({
      ...v.toObject(),
      label: `${v.vendorInfo?.nameOfCompany || ""} - ${v.vendorID}`,
      value: v._id,
      vendorName: v.vendorInfo?.nameOfCompany || "",
    }));

    res.status(200).json({
      success: true,
      count: formattedVendors.length,
      data: formattedVendors,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};