const express 	= require("express");
const router 	= express.Router();
const AccessController =  require("./controller.js")

router.post('/post', AccessController.create_accessPermission);
router.patch("/update", AccessController.update_accessPermission);

router.get('/get/list', AccessController.getList_allRolesPermissions);
router.post('/post/list', AccessController.getListByRoles);
router.get("/role/:ID", AccessController.fetch_Access_ID);
router.get("/roles", AccessController.fetch_All_Access);
router.delete('/delete/:ID', AccessController.delete_accessPermission);

module.exports = router;