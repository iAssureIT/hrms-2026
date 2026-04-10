const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/get', controller.getSettings);
router.patch('/update', controller.updateSettings);

module.exports = router;
