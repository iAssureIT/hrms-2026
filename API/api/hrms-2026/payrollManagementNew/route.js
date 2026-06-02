const express = require('express');
const router = express.Router();
const payrollController = require('./controller.js');

//Payroll Execution Process
router.post('/create-payroll-batch', payrollController.createPayrollBatch);
router.get("/summaryData/:id", payrollController.getPayrollSummaryById);
router.get("/employeeDetails/:id", payrollController.getPayrollEmployeeDetailsById);

module.exports = router;
