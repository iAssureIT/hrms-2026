const express = require('express');
const router = express.Router();
const employeeController = require('./controller');

router.post('/post', employeeController.upsertEmployee);
router.get('/get', employeeController.getAllEmployees);
router.get('/get/:id', employeeController.getOneEmployee);

module.exports = router;
