const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/", controller.createLeaveType); // CREATE
router.get("/", controller.getLeaveTypes); // GET ALL
router.patch("/:id", controller.updateLeaveType); // UPDATE
router.delete("/:id", controller.deleteLeaveType); // DELETE

module.exports = router;
