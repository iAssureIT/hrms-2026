const express 	= require("express");
const router 	= express.Router();
const AnnualPlanController = require('./controller.js');

router.post('/post', AnnualPlanController.create_annualPlan);

router.patch('/patch',AnnualPlanController.update_annualPlan);

// router.get('/get/list/:center_id', AnnualPlanController.list_annualPlan);

router.get('/get/list', AnnualPlanController.list_annualPlan);

router.post('/list/:recsPerPage/:pageNumber', AnnualPlanController.list_annualPlan_with_limits);

router.post('/post/list', AnnualPlanController.list_annualPlan_with_filters);

router.get('/get/one/:ID', AnnualPlanController.fetch_annualPlan);

router.delete('/delete/:ID',AnnualPlanController.delete_annualPlan);

router.post('/bulkUpload',AnnualPlanController.bulkUpload_annualPlan);

router.get('/get/filedetails/:fileName',AnnualPlanController.filedetails);
// router.get('/get/filedetails/:center_id/:fileName',AnnualPlanController.filedetails);

module.exports = router;
