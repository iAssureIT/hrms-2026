const express = require('express');
const router = express.Router();
const activityController = require('./controller');

router.post('/post', activityController.createActivity);
router.get('/get', activityController.getActivity);
router.post("/getdata", activityController.getActivityData);
router.put('/put/:id', activityController.updateActivity);
router.delete('/delete/:id', activityController.deleteActivity);
router.post('/bulkUpload',activityController.bulkUpload_Activity);

router.get('/get/filedetails/:fileName',activityController.filedetails);


module.exports = router;
