const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/", controller.addLedgerEntry);                                                      // ADD ENTRY
router.get("/", controller.getAllLedgerEntries);                                                   // GET ALL (admin)
router.get("/employee/:employeeId", controller.getLedgerByEmployee);                              // BY EMPLOYEE
router.get("/employee/:employeeId/type/:leaveTypeId", controller.getLedgerByEmployeeAndType);    // BY EMPLOYEE + TYPE
router.delete("/:id", controller.deleteLedgerEntry);                                              // DELETE ENTRY

module.exports = router;
