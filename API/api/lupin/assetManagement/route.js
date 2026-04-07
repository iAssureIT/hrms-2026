const express = require('express');
const router = express.Router();
const assetManagementController = require('./controller');

router.post('/post', assetManagementController.createAsset);
router.get('/get', assetManagementController.getOneAsset); // Note: Original had both /get and /get/:id
router.get('/get/:id', assetManagementController.getOneAsset);
router.post('/post/list', assetManagementController.getAllAssetsWithLimits);
router.put('/put/:id', assetManagementController.updateAsset);
router.delete('/delete/:id', assetManagementController.deleteAsset);
router.get('/get/dashboard/counts', assetManagementController.getDashboardCounts);

module.exports = router;
