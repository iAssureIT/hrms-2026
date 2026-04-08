const express = require("express");
const router = express.Router();
const FundController = require("./controller.js");

router.post("/post", FundController.create_external_grant);

router.patch("/patch", FundController.update_external_grant);

// router.get('/get/list/:center_id', AnnualPlanController.list_annualPlan);

router.get("/get/list", FundController.list_external_grant);

router.post(
  "/list/:recsPerPage/:pageNumber",
  FundController.list_external_grant_with_limits
);

router.get("/get/one/:ID", FundController.fetch_external_grant);

router.delete("/delete/:ID", FundController.delete_external_grant);

module.exports = router;
