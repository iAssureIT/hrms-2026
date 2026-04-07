const express = require('express');
const router = express.Router();
const assetsController = require('./controller');

router.post('/post', assetsController.createAssets);
router.get('/get', assetsController.getAssets);
router.post("/getdata", assetsController.getAssetsData);
router.put('/put/:id', assetsController.updateAssets);
router.delete('/delete/:id', assetsController.deleteAssets);


router.post('/bulkUpload',assetsController.bulkUpload_Assets);

// router.get('/get/filedetails/:fileName',assetsController.filedetails);


module.exports = router;
