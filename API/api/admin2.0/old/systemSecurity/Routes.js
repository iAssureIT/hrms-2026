const express = require("express");
const router = express.Router();
const checkAuth = require("../middlerware/check-auth.js");
const UserController = require("./controller.js");

router.post("/post/login", UserController.user_login); //Working
router.post("/post/signup/user/otp", UserController.user_signup_user_email_otp); //Working
router.post('/post/signup/user', UserController.user_signup_user); //Working
router.post("/post/logout", UserController.logouthistory); //Working
router.post(
  "/patch/send-otp-using-username",
  UserController.send_otp_using_username
);
router.post(
  "/post/verify-otp-for-signup",
  UserController.verify_otp_for_signup
);
router.post(
  "/post/signup/social_media",
  UserController.user_signup_social_media
);
router.post(
  "/post/send-otp-forgot-password",
  UserController.send_otp_forgot_password
);

router.post(
  "/post/send-otp-forgot-password-without-notification",
  UserController.send_otp_forgot_password_without_notification
);
router.post("/post/login/mob_email", UserController.user_login_mob_email);
router.post(
  "/post/login/mob_email_new",
  UserController.user_login_mob_email_new
);
router.post("/post/signup/guest_login", UserController.user_signup_guest_login);
router.post("/post/send-otp-for-login", UserController.send_otp_for_login);
router.post("/post/verify-otp-for-login", UserController.verify_otp_for_login);
router.post(
  "/post/signup/verify-email/otp",
  UserController.user_signup_verify_email_otp
); //Working

router.get(
  "/get/checkmobileotp/usingID/:ID/:mobileotp",
  UserController.check_userID_MobileOTP
); //Working

router.patch(
  "/patch/setsendmobileotpusingID/:user_id",
  UserController.set_send_mobileotp_usingID
); //working
router.patch(
  "/patch/change-password-after-login",
  UserController.change_password_after_login
); //working
router.patch(
  "/patch/change-password-using-username",
  UserController.change_password_using_username
); //working
router.patch("/patch/set_send_otp/:username", UserController.set_send_otp);
router.post('/getS3Details/S3',UserController.s3_details)
module.exports = router;
