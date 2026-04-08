const express = require('express');
const router = express.Router();
const vendorCategoryController = require('./controller');

router.post('/post', vendorCategoryController.createVendorCategory);
router.get('/get', vendorCategoryController.getVendorCategory);
router.post("/getdata", vendorCategoryController.getVendorCategoryData);
router.put('/put/:id', vendorCategoryController.updateVendorCategory);
router.delete('/delete/:id', vendorCategoryController.deleteVendorCategory);


router.post('/bulkUpload', vendorCategoryController.bulkUpload_VendorCategory);

// router.get('/get/filedetails/:fileName',vendorCategoryController.filedetails);


module.exports = router;
