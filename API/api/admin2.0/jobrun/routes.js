const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');



router.post('/call-reminder-2hrs-ago',Controller.callReminder2HrsAgo);

router.post('/update-subscription-plan-renewal',Controller.updateSubplanRenewal);


module.exports = router;
