const express = require("express");
const router = express.Router();
const controller = require("./controller.js");

router.post("/post", controller.createLocationSubcategory);
router.get("/get", controller.getLocationSubcategories);
router.put("/put/:id", controller.updateLocationSubcategory);
router.delete("/delete/:id", controller.deleteLocationSubcategory);

module.exports = router;
