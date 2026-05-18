const express = require("express");

const router = express.Router();

const {
  createSalarySlip,
  getSalarySlips,
} = require(
  "./controller"
);

// CREATE
router.post("/", createSalarySlip);

// GET
router.get("/", getSalarySlips);

module.exports = router;