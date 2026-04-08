const express = require('express');
const router = express.Router();
const accountHeadMasterController = require('./controller');

router.post('/post', accountHeadMasterController.createAccountHeadMaster);
// router.get('/get', accountHeadMasterController.getAccountHeadMaster);
router.post("/getdata", accountHeadMasterController.getAccountHeadMasterData);
router.get("/list", accountHeadMasterController.getAccountHeadList);
router.put('/put/:id', accountHeadMasterController.updateAccountHeadMaster);
router.delete('/delete/:id', accountHeadMasterController.deleteAccountHeadMaster);


router.post('/bulkUpload',accountHeadMasterController.bulkUpload_AccountHeader);

router.get('/get/filedetails/:fileName',accountHeadMasterController.getAccountHeadList);


module.exports = router;
