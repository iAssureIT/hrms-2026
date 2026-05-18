const express = require("express");

const router = express.Router();

const controller = require(
  "./controller"
);

// GET ALL DEPARTMENTS
router.get("/", controller.getPayrollDepartments);

router.get("/premp", controller.getEmployeesByDepartments);

module.exports = router;