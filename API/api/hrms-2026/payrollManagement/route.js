const express = require('express');
const router = express.Router();
const payrollController = require('./controller.js');

// Process
router.post('/post/initiate', payrollController.initiatePayrollRun);
router.post('/post/batch-data', payrollController.getPayrollBatch);
router.post('/post/approve', payrollController.approveBatch);

// Salary Master
router.post('/post/salary-master', payrollController.upsertSalaryMaster);

module.exports = router;
