const express = require("express");
const router = express.Router();

const {
  createSalaryComponent,
  getSalaryComponents,
  getSalaryComponentById,
  updateSalaryComponent,
  deleteSalaryComponent,
} = require("./controller");


// CREATE
router.post("/", createSalaryComponent);

// GET ALL
router.get("/", getSalaryComponents);

// GET SINGLE
router.get("/:id", getSalaryComponentById);

// UPDATE
router.put("/:id", updateSalaryComponent);

// DELETE
router.delete("/:id", deleteSalaryComponent);

module.exports = router;