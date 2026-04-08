const express = require("express");
const router = express.Router();
const CCController = require("./controller.js");

router.post("/post", CCController.create_cc);

router.patch("/patch", CCController.update_cc);

// router.get('/get/list/:center_id', AnnualPlanController.list_annualPlan);

router.get("/get/list", CCController.list_cc);

router.post("/list/:recsPerPage/:pageNumber", CCController.list_cc_with_limits);

router.get("/get/one/:ID", CCController.fetch_cc);

router.delete("/delete/:ID", CCController.delete_cc);

module.exports = router;
