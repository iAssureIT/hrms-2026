const express = require('express');
const router = express.Router();
const subactivityController = require('./controller');

router.post('/post', subactivityController.createSubactivity);
router.get('/get', subactivityController.getAllSubactivity);
router.post('/post/list', subactivityController.getAllSubactivityWithLimits);
router.get('/get/:id', subactivityController.getOneSubactivity); 
router.put('/put/:id', subactivityController.updateSubactivity);
router.patch('/patch/:id', subactivityController.updateDropdownSubactivity);
router.delete('/delete/:id', subactivityController.deleteSubactivity);

router.get('/get/list/:field1_id', subactivityController.getfield2List); //get Project List
router.get('/get/list/:field1_id/:field2_id', subactivityController.getfield3List); //get Activity List
router.get('/get/list/:field1_id/:field2_id/:field3_id', subactivityController.getfield4List); //get SubActivity List

router.post('/bulkUpload',subactivityController.bulkUpload_subactivity);

router.get('/get/filedetails/:fileName',subactivityController.filedetails);


module.exports = router;
