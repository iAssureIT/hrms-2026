const express = require('express');
const router = express.Router();
const departmentController = require('./controller');

router.post('/post', departmentController.createDepartment);
router.post('/getdata', departmentController.getData);
router.get('/get', departmentController.getDepartments);
router.put('/put/:id', departmentController.updateDepartment);
router.delete('/delete/:id', departmentController.deleteDepartment);

module.exports = router;
