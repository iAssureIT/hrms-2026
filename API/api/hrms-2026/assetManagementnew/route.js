const express = require("express");
const router = express.Router();
const controller = require("./controller.js");

router.post("/", controller.createAssets);
router.post("/post/list", controller.getAssetsData);
router.get("/get/:id", controller.getOneAsset);
router.patch("/patch/:id", controller.updateAssets);
router.patch("/patch/status/:id", controller.updateRegistryStatus);
router.delete("/delete/:id", controller.deleteAssets);
router.post("/bulkUpload", controller.bulkUpload_Assets);
router.get("/get/dashboard/counts", controller.getDashboardCounts);
router.get("/get/filedetails/:fileName", controller.filedetails);

module.exports = router;
