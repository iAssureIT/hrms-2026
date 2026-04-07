const express = require("express");
const router = express.Router();
const UtilizationDetailsController = require("./controller.js");

router.post("/post", UtilizationDetailsController.create_utilization);

router.patch("/patch", UtilizationDetailsController.update_utilization);

router.patch(
  "/patch/payment-status",  UtilizationDetailsController.update_payment_status
);

router.post(
  "/get/account-person",
  UtilizationDetailsController.get_account_person
);

router.patch(
  "/patch/status",  
  UtilizationDetailsController.update_utilization_approval_status
);

router.post(
  "/post/list",
  UtilizationDetailsController.list_utilizationdetails_with_filters
);

router.get("/get/one/:ID", UtilizationDetailsController.fetch_utilization);

router.delete("/delete/:ID", UtilizationDetailsController.delete_utilization);

router.post("/bulkUpload", UtilizationDetailsController.bulkUpload_utilization);

router.get(
  "/get/filedetails/:fileName",
  UtilizationDetailsController.filedetails
);

module.exports = router;
