const express 	= require("express");
const router 	= express.Router();
const StartupController = require('./startup.js');

router.get('/',StartupController.admin_account_on_startup);

router.get('/add-role/:role',StartupController.add_role_on_startup);

module.exports = router;
