const Vendor = require("./model");
const mongoose = require("mongoose");

exports.createVendor = async (req, res) => {
  try {
    /* ================= VALIDATION ================= */

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

    /* ================= DUPLICATE CHECK ================= */

    const existingVendor = await Vendor.findOne({
      "vendorInfo.panNumber": req.body.vendorInfo.panNumber,
    });

    if (existingVendor) {
      return res.status(409).json({
        message: "Vendor with this PAN already exists",
      });
    }

    /* ================= AUTO GENERATE VENDOR CODE ================= */

    const lastVendor = await Vendor.findOne({})
      .sort({ vendorCode: -1 }) // safer than createdAt
      .select("vendorCode");

    let vendorCode = "VND001";

    if (lastVendor && lastVendor.vendorCode) {
      const lastNumber = parseInt(
        lastVendor.vendorCode.replace("VND", ""),
        10
      );

      if (!isNaN(lastNumber)) {
        vendorCode = `VND${String(lastNumber + 1).padStart(3, "0")}`;
      }
    }

    /* ================= CREATE VENDOR ================= */

    const vendor = new Vendor({
      _id: new mongoose.Types.ObjectId(),
      vendorCode,
      vendorStatus: req.body.vendorStatus || "Active",
      vendorInfo: req.body.vendorInfo,
      bankDetails: req.body.bankDetails || {},
      addressDetails: req.body.addressDetails || {},
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




// exports.getVendors = async (req, res) => {
//   try {
//     let { page = 1, limit = 10, search = "" } = req.query;

//     page = Number(page);
//     limit = Number(limit);

//     const matchStage = {
//       $match: {
//         $or: [
//           { vendorCode: { $regex: search, $options: "i" } },
//           { "vendorInfo.nameOfCompany": { $regex: search, $options: "i" } },
//           { "vendorInfo.mobileNumber": { $regex: search, $options: "i" } },
//         ],
//       },
//     };

//     const totalData = await Vendor.aggregate([
//       matchStage,
//       { $count: "total" },
//     ]);

//     const total = totalData[0]?.total || 0;

//     const vendors = await Vendor.aggregate([
//       matchStage,
//       { $sort: { createdAt: -1 } },
//       { $skip: (page - 1) * limit },
//       { $limit: limit },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: vendors,
//       total,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.getVendors = async (req, res) => {
  try {

    let { page = 1, limit = 10, search = "" } = req.body;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;


    const matchStage = {};

    if (search && search.trim() !== "") {
      matchStage.$or = [
        { vendorCode: { $regex: search.trim(), $options: "i" } },
        { "vendorInfo.nameOfCompany": { $regex: search.trim(), $options: "i" } },
        { "vendorInfo.mobileNumber": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pipeline = [];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    /* ================= GET TOTAL COUNT ================= */

    const totalResult = await Vendor.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    /* ================= GET PAGINATED DATA ================= */

    const vendors = await Vendor.aggregate([
      ...pipeline,
      { $sort: { createdAt: -1 } }, // ensure timestamps:true in schema
      { $skip: skip },
      { $limit: limit },
    ]);

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      data: vendors,
      total,
      currentPage: page,
      totalPages: total > 0 ? Math.ceil(total / limit) : 1,
      limit,
    });

  } catch (error) {
    console.error("GET VENDORS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.getVendors = async (req, res) => {
//   try {
//     const subactivities = await Vendor.find();
//     res.json(subactivities);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


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

exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Prevent duplicate vendorCode
    if (req.body.vendorCode) {
      const existing = await Vendor.findOne({
        vendorCode: req.body.vendorCode,
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Vendor Code already exists",
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


// Helper to generate unique vendor code
let vendorCodeCounter = 1; // start from 1, could also fetch last code from DB

const generateVendorCode = () => {
  const code = "VND" + vendorCodeCounter.toString().padStart(3, "0");
  vendorCodeCounter++;
  return code;
};

// Bulk upload vendors controller
exports.bulkUpload_Vendors = (req, res, next) => {
  var excelData = req.body.data; // Expecting array of rows from client
  var validData = [];
  var invalidData = [];
  var failedRecords = [];
  var rowSet = new Set();
  var DuplicateCount = 0;

  processData();

  async function processData() {
    try {
      // Fetch all existing vendors (to check duplicates in DB)
      let allVendors = await Vendor.find({}, "vendorInfo.nameOfCompany").lean();

      for (var k = 0; k < excelData.length; k++) {
        let row = excelData[k];
        let companyName = row.nameOfCompany?.trim() || "";
        let remark = ""; // Reset remark for each row

        // Check if the company name exists in the file
        if (!companyName || companyName === "-") {
          remark = "Company name not found";
          invalidData.push({ ...row, failedRemark: remark });
          continue;
        }

        // Check for duplicates within the uploaded file
        if (rowSet.has(companyName)) {
          remark = "Duplicate company in the file";
          invalidData.push({ ...row, failedRemark: remark });
          DuplicateCount++;
          continue;
        }

        rowSet.add(companyName);

        // Check if company already exists in DB
        let companyExists = allVendors.some(
          (item) => item.vendorInfo.nameOfCompany === companyName
        );

        if (!companyExists) {
          // Valid data
          validData.push({
            _id: new mongoose.Types.ObjectId(),
            vendorCode: generateVendorCode(),
            vendorStatus: row.vendorStatus || "Active",
            vendorInfo: {
              nameOfCompany: row.nameOfCompany || "",
              vendorCategory: row.vendorCategory || "",
              vendorType: row.vendorType || "",
              panNumber: row.panNumber || "",
              gstin: row.gstin || "",
              tdsApplicable:
                row.tdsApplicable === true ||
                row.tdsApplicable === "TRUE" ||
                row.tdsApplicable === "true",
              lupinFoundationCenterName: row.lupinFoundationCenterName || "",
              primaryContactPersonName: row.primaryContactPersonName || "",
              designation: row.designation || "",
              mobileNumber: row.mobileNumber || "",
              officialEmailId: row.officialEmailId || "",
            },
            bankDetails: {
              bankName: row.bankName || "",
              branchName: row.branchName || "",
              accountHolderName: row.accountHolderName || "",
              accountNumber: row.accountNumber || "",
              ifscCode: row.ifscCode || "",
              accountType: row.accountType || "",
            },
            addressDetails: {
              addressLine1: row.addressLine1 || "",
              city: row.city || "",
              district: row.district || "",
              state: row.state || "",
              country: row.country || "",
              pinCode: row.pinCode || "",
            },
            fileName: req.body.fileName || "Unknown_File",
          });
        } else {
          remark = "Company already exists in the system";
          invalidData.push({ ...row, failedRemark: remark });
        }
      }

      // Insert valid records into DB
      if (validData.length > 0) {
        await Vendor.insertMany(validData);
      }

      // Log invalid records if any (example: could save to another collection)
      if (invalidData.length > 0) {
        failedRecords.FailedRecords = invalidData;
        failedRecords.fileName = req.body.fileName || "Unknown";
        failedRecords.totalRecords = invalidData.length;

        // Here you can insert invalidData into a collection if needed
        // await insertFailedRecords(failedRecords, req.body.updateBadData);
      }

      // Return response
      res.status(200).json({
        message: "Bulk upload process completed successfully!",
        completed: true,
        validRecords: validData.length,
        invalidRecords: invalidData.length,
        duplicates: DuplicateCount,
        validData,        // <-- include this for frontend table
        failedRecords,    // <-- include this for frontend table
    });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};