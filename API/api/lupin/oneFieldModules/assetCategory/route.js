const express = require('express');
const router = express.Router();
const assetCategoryController = require('./controller');

router.post('/post', assetCategoryController.createAssetCategory);
router.get('/get', assetCategoryController.getAssetCategory);
router.post("/getdata", assetCategoryController.getAssetCategoryData);
router.put('/put/:id', assetCategoryController.updateAssetCategory);
router.delete('/delete/:id', assetCategoryController.deleteAssetCategory);


router.post('/bulkUpload', assetCategoryController.bulkUpload_AssetCategory);

// router.get('/get/filedetails/:fileName',assetCategoryController.filedetails);


module.exports = router;
