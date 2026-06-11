const express = require('express');
const router = express.Router();
const payrollController = require('./controller.js');

//  Payroll Execution Process
router.post("/create-payroll-batch", payrollController.createPayrollBatch);
router.get("/summaryData/:id", payrollController.getPayrollSummaryById);
router.get("/summaryAllData", payrollController.getPayrollSummary);
router.get("/employeeDetails/:id", payrollController.getPayrollEmployeeDetailsById);
router.post("/employeePayrollAttendance", payrollController.getPayrollEmployeeAttendance);
router.get("/holidaysCount", payrollController.getHolidaysCount);
router.post("/createPayrollWorkflow", payrollController.createPayrollWorkflowMaster);
router.get("/patroll-workflow-approvers", payrollController.getWorkflowApproverList);
router.delete(
  "/deletePayrollBatch/:id",
  payrollController.deletePayrollBatch
);

module.exports = router;