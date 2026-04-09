const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/create", controller.createTicket);
router.get("/list", controller.listTickets);
router.get("/:id", controller.getTicket);
router.patch("/assign/:id", controller.assignTicket);
router.patch("/update-status/:id", controller.updateStatus);

module.exports = router;
