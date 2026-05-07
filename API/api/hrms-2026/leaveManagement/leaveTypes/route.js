const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/", controller.createLeaveType); // CREATE
router.get("/", controller.getLeaveTypes); // GET ALL
router.get("/get", controller.getLeaveTypes);
router.post("/post/list", controller.list_leave_types_with_limits);
router.get("/:id", controller.getLeaveTypeById);
router.patch("/:id", controller.updateLeaveType); // UPDATE
router.delete("/delete/:id", controller.deleteLeaveType);
router.delete("/:id", controller.deleteLeaveType); // DELETE

module.exports = router;
