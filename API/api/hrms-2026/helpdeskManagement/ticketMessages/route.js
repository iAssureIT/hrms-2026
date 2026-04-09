const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/send", controller.sendMessage);
router.get("/:ticketId", controller.getMessagesByTicket);

module.exports = router;
