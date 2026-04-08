const express = require("express");
const router = express.Router();
const maintenanceController = require("./controller.js");

router.post("/", maintenanceController.createMaintenance);
router.post("/post/list", maintenanceController.getMaintenanceList);
router.get("/get/one/:id", maintenanceController.getOneMaintenance);
router.patch("/patch/:id", maintenanceController.updateMaintenance);
router.patch("/patch/status/:id", maintenanceController.patchMaintenanceStatus);
router.delete("/delete/:id", maintenanceController.deleteMaintenance);
router.get("/get/dashboard/counts", maintenanceController.getDashboardCounts);

module.exports = router;
