const express 	= require("express");
const router 	= express.Router();
const UserController = require('./ControllerUsers.js');


router.patch('/patch/user/:ID', UserController.update_user_details); 
router.post('/post/user', UserController.add_user_details);
router.post('/post/list',UserController.post_list_users);

router.patch('/patch/deletestatus',UserController.user_update_delete_status);

router.patch('/patch/restorestatus',UserController.user_update_recover_status);
router.post('/post/deleteduser/list',UserController.post_list_deleted_users);

// router.patch('/patch/:ID',UserController.user_update_name_mobile);

router.patch('/patch/profile/:ID', UserController.user_update_name_mobile_profile);
router.patch('/patch/status',UserController.user_update_many_status);

router.patch('/patch/role',UserController.user_update_many_role);



router.patch('/patch/status/:ID',UserController.user_update_status);

router.patch('/patch/userimg/:ID',UserController.user_update_img);


router.patch('/patch/role/:action/:ID',UserController.user_update_role);


router.post('/get/list/role/:role',UserController.fetch_users_roles);

router.post('/get/list/companies/:company',UserController.fetch_users_Companies);

router.post('/get/list/status/:status',UserController.fetch_users_status);

router.post('/get/list/statusrole/:role/:status',UserController.fetch_users_status_roles);

router.post('/get/list/rolecompany/:role/:company',UserController.fetch_users_company_roles);

router.post('/get/list/statuscompany/:company/:status',UserController.fetch_users_company_status);

router.post('/get/list/statuscompanyrole/:company/:status/:role',UserController.fetch_users_company_status_role);

router.post('/get/searchlist',UserController.search_text);

router.post('/get/searchfilterwise',UserController.search_textCompRoleStatus);

router.post('/get/searchlist/delete',UserController.search_text_delete);


router.post('/post/listwithlimits',UserController.fetch_users_withlimits);

router.patch('/patch/change_password_withoutotp/id/:ID',UserController.user_update_password_withoutotp_ID);


router.get('/get/:ID',UserController.fetch_user_ID);

router.get('/get/managerlist/:role',UserController.getManagerList);

// router.patch('/patch/:ID', UserController.update_user_ID);


router.get('/get/email/:userID',UserController.fetch_email);

router.get('/get/id/:id',UserController.getID);

router.get('/get/count/:role',UserController.getuserCount);

router.post('/get/list',UserController.getUserList);

router.delete('/delete/:ID',UserController.delete_user_ID);

router.get('/get/otp/:user_id',UserController.getUserOtp);

router.patch('/patch/Company/:userID',UserController.update_user_company);

router.get('/get/user/count/:user_id',UserController.countUsers); //for dashboard

router.get('/get/onlineUserCount/count',UserController.onlineUserCount);

// router.delete('/delete/users',UserController.deleteAllUsers);
router.delete('/get/deleteAllUsers',UserController.deleteAllUsers);


// =============

router.patch('/update/user_profile_details',    UserController.update_user_profile);

router.patch('/update/verify_user_otp',         UserController.verify_user_otp);

//==========

router.patch('/patch/complete-user-profile/:ID',UserController.update_complete_user_profile);



module.exports = router;
