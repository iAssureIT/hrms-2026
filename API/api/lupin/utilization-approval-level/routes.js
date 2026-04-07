const express 	= require("express");
const router 	= express.Router();

const ApprovalLevelController = require('./controller.js');

router.post('/post',ApprovalLevelController.create_approval);

router.put('/put/update',ApprovalLevelController.update_approval);

router.get('/list',ApprovalLevelController.list_approval);

// router.get('/list/:recsPerPage/:pageNumber',ApprovalLevelController.list_approval_with_limits);

router.post('/post/list', ApprovalLevelController.list_approval_with_limits);

router.get('/get/one/:ID',ApprovalLevelController.fetch_approval);

router.delete('/delete/:ID',ApprovalLevelController.delete_approval);

module.exports = router;