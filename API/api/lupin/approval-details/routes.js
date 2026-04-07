const express = require("express");
const router = express.Router();
const ApprovalDetailsController = require("./controller.js");

router.post("/post", ApprovalDetailsController.create_approval);

router.patch("/patch", ApprovalDetailsController.update_approval);

router.patch("/patch/status", ApprovalDetailsController.update_approval_status);

router.get(
  "/get/list/:centerID",
  ApprovalDetailsController.list_approvaldetails_without_filters
);

router.post(
  "/post/list",
  ApprovalDetailsController.list_approvaldetails_with_filters
);

router.get("/get/one/:ID", ApprovalDetailsController.fetch_approval);

router.delete("/delete/:ID", ApprovalDetailsController.delete_approval);

router.post("/bulkUpload", ApprovalDetailsController.bulkUpload_approval);

router.get("/get/filedetails/:fileName", ApprovalDetailsController.filedetails);

module.exports = router;
