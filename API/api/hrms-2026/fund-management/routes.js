const express = require("express");
const router = express.Router();
const FundController = require("./controller.js");

router.post("/post", FundController.create_fund);

router.patch("/patch", FundController.update_fund);

// router.get('/get/list/:center_id', AnnualPlanController.list_annualPlan);

router.get("/get/list", FundController.list_grant);

// router.get("/get/list", FundController.list_cc);

router.post(
  "/list/:recsPerPage/:pageNumber",
  FundController.list_grant_with_limits
);

router.post(
  "/list/:recsPerPage/:pageNumber",
  FundController.list_cc_with_limits
);

router.post("/post/list", FundController.list_funds_with_filters);

router.post("/post/contribution-report", FundController.contribution_report);

router.post(
  "/post/contributors-list",
  FundController.list_contributors_with_filters
);

router.get("/get/one/:ID", FundController.fetch_fund);

router.delete("/delete/:ID", FundController.delete_fund);

// router.post(
//   "/community-contribution/bulkUpload",
//   FundController.bulkUpload_fund_community_contribution_without_contributors
// );

router.post(
  "/community-contribution/bulkUpload",
  FundController.bulkUpload_fund_community_contribution
);

router.post(
  "/external-grant/bulkUpload",
  FundController.bulkUpload_fund_external_grant
);

router.post(
  "/community-contribution/contributors-bulkUpload",
  FundController.bulkUpload_contributor_data
);

router.get("/get/filedetails/:fundType/:fileName", FundController.filedetails);

router.get(
  "/get/community-contributors/filedetails/:fileName",
  FundController.community_contributors_filedetails
);

module.exports = router;
