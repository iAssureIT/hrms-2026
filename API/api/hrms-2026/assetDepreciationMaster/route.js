const express = require('express');
const router = express.Router();
const deprController = require('./controller');

router.post('/post', deprController.createDepreciationMaster);
router.get('/get', deprController.getDepreciationMasterData);
router.post("/getdata", deprController.getDepreciationMasterPagination);
router.put('/put/:id', deprController.updateDepreciationMaster);
router.delete('/delete/:id', deprController.deleteDepreciationMaster);

module.exports = router;
