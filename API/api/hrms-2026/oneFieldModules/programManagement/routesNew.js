const express = require("express");
const router = express.Router();
const programController = require("./controllerNew");

router.post("/post", programController.createProgram);
router.get("/get", programController.getProgram);
router.post("/getdata", programController.getProgramData);
router.put("/put/:id", programController.updateProgram);
router.delete("/delete/:id", programController.deleteProgram);
router.post('/bulkUpload',programController.bulkUpload_Program);

router.get('/get/filedetails/:fileName',programController.filedetails);

module.exports = router;
