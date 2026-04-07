const express = require("express");
const router = express.Router();

const WrdController = require("./controller.js");

router.post("/post", WrdController.insert_wrd_form);
router.get("/get/one/:wrd_id", WrdController.get_one_wrd_data);
router.get("/get/list/:centerName", WrdController.get_wrd_list_for_center);

router.patch("/patch", WrdController.edit_wrd_form);
router.patch("/patch/submit_inspection", WrdController.submit_inspection);

router.delete("/delete/:wrd_id", WrdController.delete_wrd_data);

router.post("/post/list", WrdController.list_wrd_with_filters);

router.get("/get/wrd-dates-correction", WrdController.get_wrd_dates_correction);

module.exports = router;
