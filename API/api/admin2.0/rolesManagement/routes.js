const express 	= require("express");
const router 	= express.Router();
const RoleController = require('./controller.js');

router.post('/post', RoleController.create_role);
router.post('/get/list', RoleController.list_role);
router.get('/get/one/:ID', RoleController.detail_role);
router.patch('/patch',RoleController.update_role);
router.delete('/delete/all',RoleController.delete_all_role);
// router.delete('/delete/:ID',RoleController.delete_role);
router.delete('/delete/:ID',RoleController.delete_role);

module.exports = router;
