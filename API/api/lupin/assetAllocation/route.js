const express = require("express");
const router = express.Router();
const assetAllocationController = require("./controller");

router.post("/", assetAllocationController.createAllocation);
router.get("/get", assetAllocationController.getAllAllocations);
router.get("/get/:id", assetAllocationController.getOneAllocation);
router.patch("/patch/status/:id", assetAllocationController.updateAllocationStatus);
router.patch("/patch/approve/:id", assetAllocationController.updateAllocationStatus);
router.patch("/patch/reject/:id", assetAllocationController.updateAllocationStatus);
router.patch("/patch/deallocate/:id", assetAllocationController.deallocateAsset); // Using patch for deallocate as it updates

module.exports = router;
