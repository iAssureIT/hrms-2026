const express = require("express");
const router = express.Router();
const controller = require("./controller");

// Apply Leave
router.post("/", controller.applyLeave);

// Get All (Admin)
router.get("/", controller.getAllLeaveApplications);

// Get My Leaves
router.get("/employee/:employeeId", controller.getMyLeaveApplications);

// Approve / Reject
router.patch("/:id", controller.updateLeaveStatus);

// Delete
router.delete("/:id", controller.deleteLeaveApplication);

module.exports = router;
