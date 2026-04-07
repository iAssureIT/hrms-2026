const express = require('express');
const router = express.Router();
const assetSubCategoryController = require('./controller');

router.post('/post', assetSubCategoryController.createAssetSubCategory);
router.get('/get', assetSubCategoryController.getAssetSubCategories);
router.post("/getdata", assetSubCategoryController.getAssetSubCategoryData);
router.put('/put/:id', assetSubCategoryController.updateAssetSubCategory);
router.delete('/delete/:id', assetSubCategoryController.deleteAssetSubCategory);
router.post('/bulkUpload', assetSubCategoryController.bulkUpload_AssetSubCategory);

module.exports = router;
