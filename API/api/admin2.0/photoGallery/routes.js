const express = require("express");
const router = express.Router();
// const checkAuth = require('../../middlerware/check-auth.js');
const PhotoController = require("./controller");

router.post("/post", PhotoController.insertPhoto);

router.patch("/patch/:_id", PhotoController.updatePhoto);

router.get("/get/:_id", PhotoController.getPhoto);

router.get("/getAll", PhotoController.getAllPhotos);

router.delete("/delete/:_id", PhotoController.deletePhoto);

router.get("/get/get-typewise/:id", PhotoController.getTypewise);

router.get("/get/getphotocount/:user_id", PhotoController.getTypewiseCount);

module.exports = router;
