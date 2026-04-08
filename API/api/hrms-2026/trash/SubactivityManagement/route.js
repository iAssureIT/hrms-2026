const express = require('express');
const router = express.Router();
const activityController = require('./controller');

router.post('/post', activityController.createItem);
router.get('/get', activityController.getAllItems);
router.get('/get/:id', activityController.getSubactivitiesByActivity); 
router.put('/put/:id', activityController.updateItem);
router.patch('/patch/:id', activityController.updateDropdownItem);
router.delete('/delete/:id', activityController.deleteItem);


module.exports = router;
