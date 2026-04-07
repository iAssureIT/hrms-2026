const express = require("express");
const router = express.Router();

const PlantationController = require("./controller.js");

router.post("/post", PlantationController.insert_plantation_form);
router.get(
  "/get/one/:plantation_id",
  PlantationController.get_one_plantation_data
);
router.get(
  "/get/list/:centerName",
  PlantationController.get_plantation_list_for_center
);

router.patch("/patch", PlantationController.edit_plantation_form);
router.patch(
  "/patch/submit_inspection",
  PlantationController.submit_inspection
);

router.delete(
  "/delete/:plantation_id",
  PlantationController.delete_plantation_data
);

router.post("/post/list", PlantationController.list_plantation_with_filters);


router.get("/get/plantation-dates-correction", PlantationController.get_plantation_dates_correction);


router.get("/get/species/:centerName", PlantationController.get_species_list_for_center
);
module.exports = router;

