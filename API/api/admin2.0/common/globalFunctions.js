const mongoose = require("mongoose");
const Users = require("../userManagementnew/ModelUsers.js");
const Masternotifications = require("../notificationManagement/ModelMasterNotification");
// const sendEmail = require("./email-service.js"); //using ses service
const sendEmail = require("./email.js"); //using nodemailer service
const sendSMSService = require("./sms-service.js");
const ObjectId = require("mongodb").ObjectID;
const globalVariable = require("../../../nodemonConfig.js");
const { default: axios } = require("axios");
const Notifications = require("../notificationManagement/ModelNotification.js");

// exports.sendNotification = async (userName, eventName, role, variables) => {
exports.sendNotification = async (inputObj) => {
  var email = inputObj.toEmail;
  var mobileNumber = inputObj.toMobileNumber;
  var eventName = inputObj.event;
  var role = inputObj.toUserRole;
  var variables = inputObj.variables;
  var userContacts = "";
  var user_id = inputObj?.toUser_id;
  // console.log("1 sendNotification inputObj 	=> ", inputObj);

  if (inputObj.role === "admin") {
    userContacts = await getAdminContacts();
  } else {
    if (inputObj.userDetails) {
      userContacts = {
        success: true,
        email: [inputObj.userDetails.profile.email],
        mobileNumber: inputObj.toMobileNumber
          ? inputObj.toMobileNumber
          : inputObj.userDetails.profile.isdCode +
            inputObj.userDetails.profile.mobile,
        user_name: inputObj.userDetails.profile.fullName
          ? inputObj.userDetails.profile.fullName
          : inputObj.userDetails.profile.firstname +
            " " +
            inputObj.userDetails.profile.lastname,
        userDetails: inputObj.userDetails,
      };
    } else {
      userContacts = await getUserContacts(email, user_id);
    }
  }

  // console.log("sendNotification userContacts => ", userContacts);
  // console.log("sendNotification inputObj.toMobileNumber => ", inputObj.toMobileNumber);
  // console.log("sendNotification mobileNumber=> ", mobileNumber);

  if (userContacts && userContacts.success) {
    //========================================================
    // 1.  Add In-App Notifications
    //========================================================

    const inAppNotifTemplate = await this.getNotificationTemplate(
      eventName,
      role,
      variables,
      "Notification"
    );
    // console.log("sendNotification inAppNotifTemplate => ",role,"====", inAppNotifTemplate);

    if (inAppNotifTemplate && inAppNotifTemplate.success) {
      // const inAppcontent = removeTags(inAppNotifTemplate.content);

      const inAppcontent = inAppNotifTemplate.content;

      const inputObj = {
        masternotificationId: inAppNotifTemplate._id,
        event: eventName,
        toMailId: userContacts.email,
        toUserId: userContacts.userDetails._id,
        notifBody: inAppcontent,
      };
      var x = await insertNotification(inputObj);

      // console.log("sendNotification insertNotification x => ", x);
    }

    //========================================================
    // 2.  Send Email Notifications
    //========================================================

    const emailTemplate = await this.getNotificationTemplate(
      eventName,
      role,
      { ...variables, user_name: userContacts.user_name },
      "EMAIL"
    );
    // function sendEmail(toEmail,subject,content,attachment){

    console.log("sendNotification emailTemplate => ", emailTemplate);

    if (emailTemplate.success) {
      // using nodemailer email - service

      sendEmail(
        userContacts.email,
        emailTemplate.subject,
        emailTemplate.content
      );
      // using ses email - service
      // sendEmail(
      //   userContacts.email,
      //   globalVariable.projectName +
      //     " Admin <" +
      //     globalVariable.SES_EMAIL +
      //     ">",
      //   emailTemplate.subject,
      //   emailTemplate.content
      // );
    }

    //========================================================
    // 3.  Send SMS Notifications
    //========================================================

    const mobileTemplate = await this.getNotificationTemplate(
      eventName,
      role,
      variables,
      "SMS"
    );
    // console.log("sendNotification SMS Template => ", mobileTemplate);

    if (mobileTemplate.success && mobileNumber) {
      const content = removeTags(mobileTemplate.content);
      sendSMSService(mobileNumber, mobileTemplate.dltTemplateId, content);
    }

    return;
  }
};

const insertNotification = (inputObj) => {
  // console.log("inputObj => ",inputObj);

  // console.log("inputObj.toMailId => ",inputObj.toMailId);

  const notifications = new Notifications({
    _id: new mongoose.Types.ObjectId(),
    masternotificationId: ObjectId(inputObj.masternotification_id),
    event: inputObj.event,
    toMailId: inputObj.toMailId[0],
    toUserId: inputObj.toUserId,
    notifBody: inputObj.notifBody,
    status: "Unread",
    createdAt: new Date(),
    createdBy: inputObj.toUserId,
  });

  return new Promise((resolve, reject) => {
    notifications
      .save()
      .then((data) => {
        resolve({
          success: true,
          message: "Notification Details Added",
          ID: data._id,
        });
      })
      .catch((err) => {
        console.log(err);
        reject({ success: false, message: err });
      });
  });
};

const getUserContacts = (email, user_id) => {
  return new Promise((resolve, reject) => {
    var selector = {};
    if (email) {
      selector = { "profile.email": email };
    } else if (user_id) {
      selector = { _id: user_id };
    }

    Users.findOne(selector, { services: 0 })
      .then((userDetails) => {
        // console.log("userDetails => ",userDetails);

        if (userDetails) {
          resolve({
            success: true,
            email: [userDetails.profile.email],
            mobileNumber: userDetails.profile.mobile,
            user_name: userDetails.profile.fullName,
            userDetails: userDetails,
          });
        } else {
          resolve({
            success: false,
            message: "Record Not Found",
          });
        }
      })
      .catch((error) => {
        console.log("getUserContacts error => ", error);
        reject({
          success: false,
          message: error.message,
        });
      });
  });
};

const getAdminContacts = () => {
  return new Promise((resolve, reject) => {
    Users.findOne(
      {
        roles: "admin",
      },
      { services: 0 }
    )
      .then((adminDetails) => {
        if (adminDetails) {
          // console.log("adminDetails => ", adminDetails);
          resolve({
            success: true,
            email: adminDetails.profile.email,
            mobileNumber: adminDetails.profile.mobile,
            user_name: adminDetails.profile.fullName,
            userDetails: adminDetails,
          });
        } else {
          resolve({
            success: false,
            message: "Record Not Found",
          });
        }
      })
      .catch((error) => {
        console.log("getAdminContacts error => ", error);
        reject({
          success: false,
          message: error.message,
        });
      });
  });
};

exports.getNotificationTemplate = (eventName, role, variables, type) => {
  var selector = {
    templateType: type,
    event: eventName,
    role: role,
    status: "active",
  };

  // console.log("getNotificationTemplate selector => ", selector);

  return new Promise((resolve, reject) => {
    Masternotifications.findOne(selector)
      .then((template) => {
        // console.log("template ===================> ", template);

        if (template) {
          // console.log("type ===================> ", type);

          const res =
            type === "SMS"
              ? {
                  _id: template._id,
                  dltTemplateId: template.dltTemplateId,
                  content: replaceVariables(template.content, variables),
                }
              : type === "EMAIL"
              ? {
                  _id: template._id,
                  subject: template.subject,
                  // subject: replaceVariables(template.subject, variables),
                  content: replaceVariables(template.content, variables),
                }
              : {
                  _id: template._id,
                  content: replaceVariables(template.content, variables),
                };

          if (type === "SMS") {
            // console.log("SMS------- template => ", role, "---", template);
          }
          console.log("getNotificationTemplate res => ", type,res);

          resolve({ success: true, ...res });
        } else {
          resolve({
            success: false,
            message: "Template Not Found",
          });
        }
      })
      .catch((error) => {
        console.log("getMailTemplate error => ", error);
        reject({
          success: false,
          message: error.message,
        });
      });
  });
};

exports.getVideConferenceDetailReport = (roomId) => {
  const basicAuth = `Basic NjI0ODI3YmI3OTdhNGYzZjljNTIxZTczOjV5NWVheWV5WWVNYVJ5RHlEdXF1SmVCdXp1R3U0dVVlU2VyZQ==`;
  return axios
    .get(`https://api.enablex.io/video/v2/cdr/room/${roomId}`, {
      headers: {
        AUTHORIZATION: basicAuth,
      },
    })
    .then(function (response) {
      return { success: true, data: response.data };
    })

    .catch(function (err) {
      // console.warn('Enablex Service:getVideConferenceDetailReport =>error ', err);
      return { success: false, error: err };
    });
};

exports.createVideoConferencingRoom = (
  roomName,
  scheduledTime,
  user_Id,
  consultant_id,
  duration
) => {
  const roomOptionsPayload = {
    name: roomName,
    owner_ref: consultant_id,
    settings: {
      description: "Order ID: " + roomName,
      mode: "group",
      scheduled: true,
      wait_for_moderator: true,
      adhoc: false,
      scheduled_time: scheduledTime,
      duration: duration || 30,
      participants: 2,
    },
  };

  const basicAuth = `Basic NjI0ODI3YmI3OTdhNGYzZjljNTIxZTczOjV5NWVheWV5WWVNYVJ5RHlEdXF1SmVCdXp1R3U0dVVlU2VyZQ==`;
  return axios
    .post(`https://api.enablex.io/video/v2/rooms`, roomOptionsPayload, {
      headers: {
        AUTHORIZATION: basicAuth,
      },
    })
    .then(function (response) {
      return response.data;
    })

    .catch(function (err) {
      // console.warn('Enablex Error: ', err);
      return err;
    });
};

exports.rescheduleVideoConference = (roomId, newTime) => {
  // console.log(`Enablex Service: rescheduling meeting with room id=>${roomId} to ${newTime}.`);
  const basicAuth = `Basic NjI0ODI3YmI3OTdhNGYzZjljNTIxZTczOjV5NWVheWV5WWVNYVJ5RHlEdXF1SmVCdXp1R3U0dVVlU2VyZQ==`;
  return axios
    .patch(
      `https://api.enablex.io/video/v2/rooms/${roomId}`,
      {
        settings: { scheduled_time: newTime },
      },
      {
        headers: {
          AUTHORIZATION: basicAuth,
        },
      }
    )
    .then(function (response) {
      // console.log(`Enablex Service: meeting rescheduled response:`, response);
      return response.data;
    })

    .catch(function (err) {
      console.warn("Enablex Service: meeting rescheduled error ", err);
      return err;
    });
};

exports.cancelVideoConference = (roomId) => {
  // console.log(`Enablex Service: cancelling meeting with room id=>${roomId}`);
  const basicAuth = `Basic NjI0ODI3YmI3OTdhNGYzZjljNTIxZTczOjV5NWVheWV5WWVNYVJ5RHlEdXF1SmVCdXp1R3U0dVVlU2VyZQ==`;
  return axios
    .delete(`https://api.enablex.io/video/v2/rooms/${roomId}`, {
      headers: {
        AUTHORIZATION: basicAuth,
      },
    })
    .then(function (response) {
      // console.log(`Enablex Service: meeting cancelled response:`, response);
      return response.data;
    })

    .catch(function (err) {
      // console.warn('Enablex Service: ', err);
      return err;
    });
};

function removeTags(str) {
  if (str === null || str === "") return false;
  else str = str.toString();
  return str
    .replace(/(<([^>]+)>)/gi, "")
    .replace(/\&nbsp;/g, "")
    .replace(/\&#39;/g, "'");
}

function replaceVariables(text, variables) {
  // console.log("text => ", text);
  // console.log("variables => ", variables);

  var wordsplit = [];
  if (text?.indexOf("[") > -1) {
    wordsplit = text.split("[");
  }
  var tokens = [];
  var n = 0;
  for (i = 0; i < wordsplit.length; i++) {
    if (wordsplit[i].indexOf("]") > -1) {
      tokensArr = wordsplit[i].split("]");
      tokens[n] = tokensArr[0];
      n++;
    }
  }
  var numOfVar = Object?.keys(variables).length;
  for (i = 0; i < numOfVar; i++) {
    text = text.replace(tokens[i], variables[tokens[i]]);
  }
  if (i >= numOfVar) {
    text = text?.split("[").join(" ");
    text = text.split("]").join(" ");
    // console.log("relpaceVariables text => ", text);
    return text;
  }
}

exports.getUserDetailsWith_id = (_id) => {
  // console.log("_id => ",_id);
  return new Promise((resolve, reject) => {
    Users.findOne({ _id: ObjectId(_id) }, { services: 0 })
      .populate("profile.company_id")
      .then((user) => {
        // console.log("user => ",user);

        if (user) {
          resolve({ user: user, success: true, message: 1 });
        } else {
          resolve({ user: 0, success: false, message: 1 });
        }
      })
      .catch((error) => {
        reject({ user: 0, success: false, message: error });
      });
  });
};
