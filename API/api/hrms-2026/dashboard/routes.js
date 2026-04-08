const express = require("express");
const router = express.Router();

const DashboardController = require("./controller.js");

router.get(
  "/get/dashboardData/:center_id/:year/:dataType",
  DashboardController.getDashboardData
);

router.post(
  "/post/centerwise-approval-vs-utilization-report",
  DashboardController.centerwise_approval_vs_utilization_report
);
router.post(
  "/post/centerwise-plan-vs-utilization-report",
  DashboardController.centerwise_plan_vs_utilization_report
);

router.post(
  "/post/dashboard-approval-vs-utilization-report",
  DashboardController.approval_vs_utilization_report
);
router.post(
  "/post/dashboard-plan-vs-utilization-report",
  DashboardController.plan_vs_utilization_report
);

router.get(
  "/get/mobile-dashboard-data/:centerName",
  DashboardController.get_mobile_app_dashboard_data
);

module.exports = router;
