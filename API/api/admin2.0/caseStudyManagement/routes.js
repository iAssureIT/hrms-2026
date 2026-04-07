const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post',Controller.addCaseStudy);

router.get('/get/single-case-study-page/:pageURL', Controller.fetch_page_using_id);

router.get('/case-study-list',Controller.getCaseStudyList);

router.get('/case-study-list/:service',Controller.getCaseStudyListByService);

router.delete('/delete/:_id', Controller.deleteCaseStudy);

module.exports = router;