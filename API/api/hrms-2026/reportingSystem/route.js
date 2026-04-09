const express = require('express');
const router = express.Router();
const reportingController = require('./controller.js');

router.post('/post/attendance', reportingController.getAttendanceReport);
router.post('/post/payroll', reportingController.getPayrollReport);
router.post('/get/compliance', reportingController.getComplianceReport);

module.exports = router;
