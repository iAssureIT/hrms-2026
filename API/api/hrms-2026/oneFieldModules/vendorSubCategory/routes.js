const express = require('express');
const router = express.Router();
const vendorSubCategoryController = require('./controller');

router.post('/post', vendorSubCategoryController.createVendorSubCategory);
router.get('/get', vendorSubCategoryController.getVendorSubCategories);
router.post("/getdata", vendorSubCategoryController.getVendorSubCategoryData);
router.put('/put/:id', vendorSubCategoryController.updateVendorSubCategory);
router.delete('/delete/:id', vendorSubCategoryController.deleteVendorSubCategory);
router.post('/bulkUpload', vendorSubCategoryController.bulkUpload_VendorSubCategory);

module.exports = router;
