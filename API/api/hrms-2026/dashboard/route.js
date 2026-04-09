const express = require('express');
const router = express.Router();
const dashboardController = require('./controller.js');

router.get('/get/stats', dashboardController.getDashboardStats);

module.exports = router;
