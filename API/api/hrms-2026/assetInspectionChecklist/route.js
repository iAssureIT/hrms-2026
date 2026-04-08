const express = require("express");
const router = express.Router();
const checklistController = require("./controller.js");

router.post("/post", checklistController.createChecklist);
router.get("/get", checklistController.getAllChecklists);
router.get("/get/category/:category_id/subcategory/:subCategory_id", checklistController.getChecklistByCategory);
router.patch("/update/:id", checklistController.updateChecklist);
router.delete("/delete/:id", checklistController.deleteChecklist);

module.exports = router;
