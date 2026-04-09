const express = require('express');
const router = express.Router();
const attendanceController = require('./controller.js');

// Attendance Matrix
router.post('/post/matrix', attendanceController.getAttendanceMatrix);

// Manual Entry
router.post('/post/save', attendanceController.saveAttendance);

// Mappings
router.post('/post/mapping', attendanceController.saveColumnMapping);
router.get('/get/mappings/:user_id', attendanceController.getMappings);

module.exports = router;
