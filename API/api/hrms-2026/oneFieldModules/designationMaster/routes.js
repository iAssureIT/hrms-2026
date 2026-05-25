const express = require('express');
const router = express.Router();
const designationController = require('./controller');

router.post('/post', designationController.createDesignation);
router.post('/getdata', designationController.getData);
router.get('/get', designationController.getDesignations);
router.put('/put/:id', designationController.updateDesignation);
router.delete('/delete/:id', designationController.deleteDesignation);

module.exports = router;
