const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/", controller.createLeavePolicy);       // CREATE
router.get("/", controller.getAllLeavePolicies);       // GET ALL
router.get("/:id", controller.getLeavePolicyById);    // GET BY ID
router.patch("/:id", controller.updateLeavePolicy);   // UPDATE
router.delete("/:id", controller.deleteLeavePolicy);  // DELETE

module.exports = router;
