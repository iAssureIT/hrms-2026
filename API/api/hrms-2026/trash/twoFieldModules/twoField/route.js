const express = require('express');
const router = express.Router();
const itemController = require('./controller');

router.post('/post', itemController.createItem);
router.get('/get', itemController.getAllItems);
router.put('/put/:id', itemController.updateItem);
router.delete('/delete/:id', itemController.deleteItem);

module.exports = router;
