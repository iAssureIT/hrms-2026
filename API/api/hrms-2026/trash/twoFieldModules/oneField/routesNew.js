const express = require("express");
const router = express.Router();
const ActivityController = require("./controllerNew");

router.post("/post", ActivityController.createActivity);
router.get("/get", ActivityController.getActivity);
router.put("/put/:id", ActivityController.updateActivity);
router.delete("/delete/:id", ActivityController.deleteActivity);

module.exports = router;
