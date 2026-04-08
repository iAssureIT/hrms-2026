const express = require("express");
const router = express.Router();
const controller = require("./controller.js");

router.post("/", controller.createTransaction);
router.get("/get", controller.getAllTransactions);
router.patch("/patch/status/:id", controller.updateTransactionStatus);
router.patch("/patch/deallocate/:asset_id", controller.deallocateAsset);

module.exports = router;
