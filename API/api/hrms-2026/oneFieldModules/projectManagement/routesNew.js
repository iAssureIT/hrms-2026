const express = require("express");
const router = express.Router();
const projectController = require("./controllerNew");

router.post("/post", projectController.createProject);
router.get("/get", projectController.getProject);
router.post("/getdata", projectController.getProjectData);
router.put("/put/:id", projectController.updateProject);
router.delete("/delete/:id", projectController.deleteProject);
router.post('/bulkUpload',projectController.bulkUpload_Project);

router.get('/get/filedetails/:fileName',projectController.filedetails);

module.exports = router;
