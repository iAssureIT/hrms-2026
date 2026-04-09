const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.get("/employee-summary/:employeeId", controller.getEmployeeLeaveSummary);
router.get("/usage-trends", controller.getLeaveUsageTrends);
router.get("/department-analysis", controller.getDepartmentLeaveAnalysis);

module.exports = router;
