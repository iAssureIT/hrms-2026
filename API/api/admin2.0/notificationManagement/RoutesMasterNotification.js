const express 	                    = require("express");
const router 	                    = express.Router();
const checkAuth                     = require('../middlerware/check-auth.js');
const MasternotificationController  = require('./ControllerMasterNotificationsNew.js');
// const MasternotificationController  = require('./ControllerMasterNotifications.js');

router.post('/post',                        MasternotificationController.create_masternotification);

router.post('/post/sendNotification',       MasternotificationController.send_notifications);

// router.post('/post/sendWhatsApp',       MasternotificationController.send_whatsapp);

router.get('/get/list',                     MasternotificationController.list_masternotification);

router.get('/get/countByType',              MasternotificationController.templateType_wise_count_masternotification);

router.get('/get/countByEvent',             MasternotificationController.event_wise_count_masternotification);

router.get('/get/listByType/:type/:event',  MasternotificationController.list_type_masternotification);

router.post('/get/listByMode',              MasternotificationController.list_mode_masternotification);

router.get('/get/:notificationmaster_ID',   MasternotificationController.detail_masternotification);

router.patch('/update',                     MasternotificationController.update_masternotification);

router.patch('/patch/status',               MasternotificationController.update_status);

router.delete('/delete/all',                MasternotificationController.deleteall_masternotification);

router.delete('/delete/:ID',                MasternotificationController.delete_masternotification);

router.post('/get/filterTemplate/:type',    MasternotificationController.filterTemplate);

router.post('/bulkUploadNotification',      MasternotificationController.bulkUploadNotification);

router.get('/get/filedetails/:fileName',    MasternotificationController.filedetails);

module.exports = router;