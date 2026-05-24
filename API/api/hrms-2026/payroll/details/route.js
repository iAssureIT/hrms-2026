// routes/payrollDetailsRoutes.js

const express =
  require("express");

const router =
  express.Router();

const controller =
  require("./controller");

// CREATE
router.post(
  "/",
  controller.createPayrollDetails
);

// GET ALL
router.get(
  "/",
  controller.getPayrollDetails
);

// GET SINGLE
router.get(
  "/:id",
  controller.getPayrollDetailsById
);

module.exports = router;