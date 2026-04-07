const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/post/", controller.createTdsMaster);
router.get("/get/", controller.getTdsMaster);
router.put("/put/:id", controller.updateTdsMaster);
router.delete("/delete/:id", controller.deleteTdsMaster);

module.exports = router;
