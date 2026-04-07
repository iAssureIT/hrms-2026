const express = require('express');
const router = express.Router();
const accountheadermasterController = require('./controller');

router.post('/post', accountheadermasterController.createAccountheadermaster);
// router.get('/get', accountheadermasterController.getAccountheadermaster);
router.post("/getdata", accountheadermasterController.getAccountheadermasterData);
router.put('/put/:id', accountheadermasterController.updateAccountheadermaster);
router.delete('/delete/:id', accountheadermasterController.deleteAccountheadermaster);


router.post('/bulkUpload',accountheadermasterController.bulkUpload_AccountHeader);

// router.get('/get/filedetails/:fileName',accountheadermasterController.filedetails);


module.exports = router;
