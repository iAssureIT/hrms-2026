const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.get("/employee/:employeeId", controller.getBalanceByEmployee);        // GET BY EMPLOYEE
router.get("/specific", controller.getSpecificBalance);                      // GET BY EMPLOYEE + TYPE + YEAR
router.patch("/:id", controller.updateLeaveBalance);                         // UPDATE
router.delete("/:id", controller.deleteLeaveBalance);                        // DELETE

module.exports = router;
