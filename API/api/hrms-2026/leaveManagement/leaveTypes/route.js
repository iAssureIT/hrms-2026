const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/add", controller.createLeaveType);
router.get("/list", controller.getLeaveTypes);
router.patch("/update/:id", controller.updateLeaveType);
router.delete("/delete/:id", controller.deleteLeaveType);

module.exports = router;
