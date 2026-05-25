const express = require('express');
const router = express.Router();
const businessunitController = require('./controller');

router.post('/post', businessunitController.createBusinessUnit);
router.post('/getdata', businessunitController.getData);
router.get('/get', businessunitController.getBusinessUnits);
router.put('/put/:id', businessunitController.updateBusinessUnit);
router.delete('/delete/:id', businessunitController.deleteBusinessUnit);

module.exports = router;
