const express = require("express");
const router = express.Router();

const CentersController = require("./controller.js");

router.post("/post", CentersController.create_centers);

router.patch("/patch/update", CentersController.update_centers);

router.patch(
  "/patch/add-center-incharge",
  CentersController.add_center_incharge
);

router.get("/list", CentersController.list_centers);

router.post("/post/list", CentersController.list_centers_with_limits);

router.get("/get/one/:centerID", CentersController.fetch_centers);

router.get("/get/centersBySM/:user_id", CentersController.fetch_centers_by_SM); //fetch_centers_by_senior_manger

router.get("/get/name/:centerName", CentersController.fetch_center_by_name);

router.delete("/delete/:centerID", CentersController.delete_center);

router.post("/sendnotification", CentersController.mailIfMonthlyPlanNotFilled);

router.post(
  "/geographical-data-bulkUpload",
  CentersController.bulkUpload_Geographical_Data
);

router.get("/get/filedetails/:fileName", CentersController.filedetails);

module.exports = router;
