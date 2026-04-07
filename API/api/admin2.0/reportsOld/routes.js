const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/get/consultant-data',Controller.getConsultantReport);
router.post('/post/consultant-introductory-calls',Controller.getConsultantIntroCallsReport);
router.post('/get/profile-editing',Controller.getProfileEditingReport);
router.post('/get/enterprise-listing-plan',Controller.getEnterpriseListingPlanReport);
router.post('/get/leads-generated',Controller.getLeadsGeneratedReport);
router.post('/get/review-rating',Controller.getReviewRatingReport);
router.post('/get/consultant-complaints',Controller.getConsultantComplaintReport);
router.post('/get/consultant-settlement',Controller.getConsultantSettlementReport);
router.post('/get/user-data',Controller.getUserDataReport);
router.post('/get/user-introductory-calls',Controller.getUserIntroductoryCallsReport);
router.post('/get/user-complaints',Controller.getUserComplaintsReport);
router.post('/get/listing-fees',Controller.getListingFeesReport);
router.post('/get/feedback',Controller.getFeedbackReport);

module.exports = router;
