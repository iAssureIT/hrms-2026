const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/create", controller.createHoliday);
router.get("/list", controller.getHolidays);
router.put("/update/:id", controller.updateHoliday);
router.delete("/delete/:id", controller.deleteHoliday);
router.post("/bulk-upload", controller.bulkUploadHolidays);

module.exports = router;
