const express = require('express');
const router = express.Router();
const jobTypeController = require('./controller');

router.post('/post', jobTypeController.createJobType);
router.post('/getdata', jobTypeController.getData);
router.get('/get', jobTypeController.getJobTypes);
router.put('/put/:id', jobTypeController.updateJobType);
router.delete('/delete/:id', jobTypeController.deleteJobType);

module.exports = router;
