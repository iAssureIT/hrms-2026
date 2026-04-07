const express 	= require("express");
const router 	= express.Router();

const BankDetailsController = require('./controller.js');

router.post('/post',   BankDetailsController.create_bank_details);

router.patch('/patch/update',   BankDetailsController.update_bank_details);

router.get('/list', BankDetailsController.list_bank_details);

// router.get('/list/:startRange/:limitRange', BankDetailsController.list_bank_details_with_limits);
// router.get('/list/:recsPerPage/:pageNumber',BankDetailsController.list_bank_details_with_limits);
router.post('/post/list', BankDetailsController.list_bank_details_with_limits);

router.get('/get/one/:ID',   BankDetailsController.fetch_bank_details);

router.delete('/delete/:ID',  BankDetailsController.delete_bank_details);

module.exports = router;