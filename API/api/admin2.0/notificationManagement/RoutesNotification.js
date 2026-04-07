const express 	= require("express");
const router 	= express.Router();
const checkAuth     = require('../middlerware/check-auth.js');
const NotificationController = require('./ControllerNotifications.js');

router.post('/post', NotificationController.create_notification);
router.get('/get/list/:status/:userID', NotificationController.list_notification);
router.patch('/patch/list/:status/:userID', NotificationController.update_status);
router.get('/get/allList/:userID', NotificationController.alllist_notification);
router.get('/get/:notification_ID', NotificationController.detail_notification);
router.put('/put/:ID', NotificationController.update_notification);
router.delete('/delete/:notification_ID',NotificationController.delete_notification);
router.delete('/delete/all',NotificationController.delete_all_notification);

module.exports = router;