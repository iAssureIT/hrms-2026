const express = require('express');
const router = express.Router();
const subdepartmentController = require('./controller');

router.post('/post', subdepartmentController.createSubdepartment);
router.get('/get', subdepartmentController.getSubdepartments);
router.put('/put/:id', subdepartmentController.updateSubdepartment);
router.delete('/delete/:id', subdepartmentController.deleteSubdepartment);

module.exports = router;
