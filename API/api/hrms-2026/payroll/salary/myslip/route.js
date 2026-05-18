const express = require("express");
const router = express.Router();

const {
  getSalarySlipsByYear,
} = require(
  "./controller"
);

router.get("/:employeeId/:year", getSalarySlipsByYear);