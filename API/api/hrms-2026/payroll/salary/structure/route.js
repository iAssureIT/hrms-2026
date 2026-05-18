const express = require("express");
const router = express.Router();

const {
  createEmployeeSalary,
  getEmployeeSalary,
  getEmployeeSalaryByEmployeeId,
} = require(
  "./controller"
);

router.post("/", createEmployeeSalary);
router.get("/", getEmployeeSalary);
router.get("/:employeeId", getEmployeeSalaryByEmployeeId);

module.exports = router;