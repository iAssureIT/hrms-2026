const express = require("express");
const router = express.Router();
const GatePassController = require("./controller.js");

router.post("/post", GatePassController.createGatePass);
router.post("/get/list", GatePassController.getGatePassList);
router.get("/get/details/:id", GatePassController.getGatePassDetails);
router.patch("/patch/update/:id", GatePassController.updateGatePass);
router.delete("/delete/:id", GatePassController.deleteGatePass);
router.patch("/patch/approve/:id", GatePassController.approveGatePass);
router.patch("/patch/reject/:id", GatePassController.rejectGatePass);
router.post("/get/metrics", GatePassController.getGatePassMetrics);

module.exports = router;
