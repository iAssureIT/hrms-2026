const express = require("express");
const router = express.Router();
const AssetDisposalController = require("./controller.js");

router.post("/post", AssetDisposalController.createDisposalRequest);
router.post("/get/list", AssetDisposalController.getDisposalList);
router.post("/patch/approve", AssetDisposalController.approveDisposal);

module.exports = router;
