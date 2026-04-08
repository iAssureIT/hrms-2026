const express = require("express");
const router = express.Router();
const vendorController = require("./controller");

router.post("/create", vendorController.createVendor);
router.post("/post/list", vendorController.getVendors);
router.get("/get/:id", vendorController.getVendorById);
router.put("/update/:id", vendorController.updateVendor);
router.delete("/delete/:id", vendorController.deleteVendor);
router.post("/bulk-upload", vendorController.bulkUpload_Vendors);
router.get("/get/filedetails/:fileName", vendorController.vendorFileDetails);
router.get("/dropdown-options", vendorController.getVendorDropdownOptions);
router.get("/subcategory/:categoryId",vendorController.getSubCategoriesByCategory);
router.get("/get/vendors/list", vendorController.getAllVendorList);
router.get("/get/vendors/list/:centerId", vendorController.getAllVendorList);

module.exports = router;
