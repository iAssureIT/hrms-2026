const express = require('express');
const router = express.Router();
const categoryController = require('./controller');

router.post('/post', categoryController.createCategory);
router.get('/get', categoryController.getCategory);
router.put('/put/:id', categoryController.updateCategory);
router.delete('/delete/:id', categoryController.deleteCategory);

module.exports = router;
