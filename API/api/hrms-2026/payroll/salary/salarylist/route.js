const express = require("express");
const router = express.Router();
const salStrController = require('./controller.js');

router.get("/salaries-list", salStrController.getEmployeeSalaryList);
router.delete("/salaries-list/:id", salStrController.deleteEmployeeSalary);

module.exports = router;