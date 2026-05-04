const express = require('express');
const router = express.Router();
const employeeController = require('./controller');

router.post('/post', employeeController.upsertEmployee);
router.post('/bulk-upload', employeeController.bulkUpload);
router.get('/get', employeeController.getAllEmployees);
router.get('/get/:id', employeeController.getOneEmployee);
router.delete('/delete/:id', employeeController.deleteEmployee);
router.get('/filedetails/:fileName', employeeController.filedetails);
router.post('/list/:recsPerPage/:pageNumber', employeeController.getEmployeeList);
router.post('/post/list', employeeController.getEmployeeList);
router.post('/get/metrics', employeeController.getMetrics);

module.exports = router;
