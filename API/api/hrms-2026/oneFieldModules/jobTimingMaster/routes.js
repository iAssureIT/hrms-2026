const express = require('express');
const router = express.Router();
const jobTimingController = require('./controller');

router.post('/post', jobTimingController.createJobTiming);
router.post('/getdata', jobTimingController.getData);
router.get('/get', jobTimingController.getJobTimings);
router.put('/put/:id', jobTimingController.updateJobTiming);
router.delete('/delete/:id', jobTimingController.deleteJobTiming);

module.exports = router;
