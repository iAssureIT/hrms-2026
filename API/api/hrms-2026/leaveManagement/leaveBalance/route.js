const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/bulk-upload", controller.bulkUpload);                          // BULK UPLOAD
router.get("/filedetails/:fileName", controller.filedetails);                // FILE DETAILS after upload
router.get("/employee/:employeeId", controller.getBalanceByEmployee); // GET BY EMPLOYEE
router.get("/summary/:employeeId", controller.getSummaryByEmployee); // GET SUMMARY BY EMPLOYEE (Aggregated)
router.get("/monthly-report", controller.getMonthlyReport); // GET MONTHLY REPORT ALL EMPLOYEES
router.get("/specific", controller.getSpecificBalance); // GET BY EMPLOYEE + TYPE + YEAR
router.patch("/:id", controller.updateLeaveBalance);                         // UPDATE
router.delete("/:id", controller.deleteLeaveBalance);                        // DELETE

module.exports = router;
