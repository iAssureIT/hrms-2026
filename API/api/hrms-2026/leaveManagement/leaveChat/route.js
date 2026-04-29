const express = require("express");
const router = express.Router();
const chatController = require("./controller");

router.post("/", chatController.processChat);
router.get("/history/:employeeId", chatController.getChatHistory);

module.exports = router;
