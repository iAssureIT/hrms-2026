const express = require("express");
const router = express.Router();
const unitController = require("./controllerNew");

router.post("/post", unitController.createUnit);
router.get("/get", unitController.getUnit);
router.post("/getdata", unitController.getUnitData);
router.put("/put/:id", unitController.updateUnit);
router.delete("/delete/:id", unitController.deleteUnit);

module.exports = router;
