const express = require("express");
const router = express.Router();
const vendorController = require("./controller");

router.post("/create", vendorController.createVendor);
router.post("/post", vendorController.getVendors);
router.get("/get/:id", vendorController.getVendorById);
router.put("/update/:id", vendorController.updateVendor);
router.delete("/delete/:id", vendorController.deleteVendor);
router.post("/bulk-upload", vendorController.bulkUpload_Vendors);

module.exports = router;
