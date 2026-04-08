const express = require("express");
const router = express.Router();
const ReportController = require("./controller.js");
const AssetFinancialController = require("./assetFinancialController.js");
const DepreciationController = require("./depreciationController.js");

router.post("/post/approval-vs-utilization-report",ReportController.approval_vs_utilization_report);
router.post("/get/asset-financial-report", AssetFinancialController.getAssetFinancialReport);
router.post("/get/depreciation-report", DepreciationController.getDepreciationReport);
router.get("/get/asset-projection/:assetID", DepreciationController.getAssetProjection);

router.post("/post/plan-vs-utilization-report",ReportController.getPlanVsUtilizationReport);

router.post("/post/fund-status-report", ReportController.fund_status_report);

router.post("/post/convergence-report", ReportController.convergence_report);

router.post("/post/plantation-report", ReportController.plantation_report);

router.post("/post/wrd-report", ReportController.wrd_report);

router.post('/post/without-plan', ReportController.plan_vs_utilization_report_defect_data_having_no_plans);

module.exports = router;
