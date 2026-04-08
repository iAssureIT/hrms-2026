const express = require('express');
const router = express.Router();
const assetAuditController = require('./controller.js');

router.post('/post', assetAuditController.createAudit);
router.post('/get/list', assetAuditController.getAuditList);
router.get('/get/one/:audit_id', assetAuditController.getAuditDetails);
router.patch('/patch/result', assetAuditController.updateAuditResult);
router.patch('/patch/finalize', assetAuditController.finalizeAudit);
router.get('/get/history/:asset_id', assetAuditController.getAssetHistory);

module.exports = router;
