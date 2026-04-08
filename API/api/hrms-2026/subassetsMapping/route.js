const express = require('express');
const router = express.Router();
const subassetsController = require('./controller');

router.post('/post', subassetsController.createSubassets);
router.get('/get', subassetsController.getAllSubassets);
router.get('/get/:id', subassetsController.getOneSubassets); 
router.put('/put/:id', subassetsController.updateSubassets);
// router.patch('/patch/:id', subassetsController.updateDropdownsubassets);
router.delete('/delete/:id', subassetsController.deleteSubassets);

// router.get('/get/list/:field1_id', subassetsController.getfield2List); //get Project List
// router.get('/get/list/:field1_id/:field2_id', subassetsController.getfield3List); //get Activity List
// router.get('/get/list/:field1_id/:field2_id/:field3_id', subassetsController.getfield4List); //get subassets List

// router.post('/bulkUpload',subassetsController.bulkUpload_subassets);

// router.get('/get/filedetails/:fileName',subassetsController.filedetails);


module.exports = router;
