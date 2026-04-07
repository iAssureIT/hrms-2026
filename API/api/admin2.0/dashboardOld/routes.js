const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');


router.post('/post/summarydata',Controller.getSummaryData);

router.post('/get/location-wise-revenue',Controller.getLocationWiseRevenue);

router.post('/get/category-wise-revenue',Controller.getCategoryWiseRevenue);



module.exports = router;
