const mongoose = require("mongoose");
const Masternotifications = require("./ModelMasterNotification.js");
const Notifications = require("./ModelNotification.js");
const User = require("../userManagementnew/ModelUsers.js");
// const PersonMaster       = require('../personMaster/ModelPersonMaster.js');
// const EntityMaster       = require('../entityMaster/ModelEntityMaster.js');
// const EventTokenMaster   = require('../EventTokenMaster/ModelEventTokenMaster.js');
const nodeMailer = require("nodemailer");
// const GlobalMaster       = require('../projectSettings/ModelProjectSettings.js');
const plivo = require("plivo");
var ObjectId = require("mongodb").ObjectID;
// const FailedRecords      = require('../failedRecords/ModelFailedRecords');
const { response } = require("express");
const globalVariable = require("../../../nodemonConfig.js");
const request = require("request");

/**=========== create master notification ===========*/
exports.create_masternotification = (req, res, next) => {
  Masternotifications.findOne({
    templateType: req.body.templateType,
    event: req.body.event,
    role: req.body.role,
    status: req.body.status,
    company: req.body.company,
  })
    .exec()
    .then((data) => {
      if (data) {
        return res.status(200).json({
          message: "Notification Details already exists",
        });
      } else {
        const masternotifications = new Masternotifications({
          _id: new mongoose.Types.ObjectId(),
          templateType: req.body.templateType,
          event: req.body.event,
          templateName: req.body.templateName,
          role: req.body.role,
          company: req.body.company,
          subject: req.body.subject,
          content: req.body.content,
          status: req.body.status,
          createdAt: new Date(),
          createdBy: req.body.user_id,
        });
        masternotifications
          .save()
          .then((data) => {
            res
              .status(200)
              .json({ message: "Notification Details Added", ID: data._id });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.event_wise_count_masternotification = (req, res, next) => {
  Masternotifications.aggregate([
    {
      $group: {
        _id: {
          event: "$event",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        event: "$_id.event",
        count: "$count",
      },
    },
  ])
    .sort({ event: 1 })
    .exec()
    .then((data) => {
      // console.log("event data",data)
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.templateType_wise_count_masternotification = (req, res, next) => {
  Masternotifications.aggregate([
    {
      $group: {
        _id: {
          templateType: "$templateType",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        type: "$_id.templateType",
        count: "$count",
      },
    },
  ])
    .exec()
    .then((data) => {
      // console.log("templateType_wise_count_masternotification data",data)
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== return list of master notifications ===========*/
exports.list_masternotification = (req, res, next) => {
  Masternotifications.find({})
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== return list of notifications for particular template type ===========*/
exports.list_mode_masternotification = (req, res, next) => {
  Masternotifications.find({
    templateType: req.body.mode,
    event: req.body.event,
  })
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    }); 
};

/**=========== return list of master notifications ===========*/
exports.list_type_masternotification = (req, res, next) => {
  var query = {};
  query.templateType = req.params.type;
  if (req.params.event !== "all") query.event = req.params.event;
  Masternotifications.find(query)
    .sort({ createdAt: -1 })
    .exec()
    .then((data) => {
      // console.log("list_type_masternotification data => ", data);
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== return details of single master notification ===========*/
exports.detail_masternotification = (req, res, next) => {
  Masternotifications.findOne({ _id: req.params.notificationmaster_ID })
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== update masternotification ===========*/
exports.update_masternotification = (req, res, next) => {
  Masternotifications.updateOne(
    { _id: req.body.editId },
    {
      $set: {
        role: req.body.role,
        status: req.body.status,
        subject: req.body.subject,
        content: req.body.content,
      },
    }
  )
    .exec()
    .then((data) => {
      // console.log("role modified", data);
      if (data.modifiedCount == 1 ) {
        Masternotifications.updateOne(
          { _id: req.body.editId },
          {
            $push: {
              updateLog: [
                { updatedAt: new Date(), updatedBy: req.body.user_id },
              ],
            },
          }
        )
          .exec()
          .then((data) => {
            res.status(200).json({
              data,
              message: "Master notifications Updated",
            });
          });
      } else {
        res.status(200).json({
          data,
          message: "Master notifications are not modified",
        });
      }
      // if(data.modifiedCount == 1){
      //     res.status(200).json({ message:"Master notifications Updated"});
      // }else{
      //     res.status(200).json({ message:"Master notifications are not modifed"});
      // }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== update status of particular master notification ===========*/
exports.update_status = (req, res, next) => {
  Masternotifications.updateOne(
    { _id: req.body.notifId },
    {
      $set: {
        status: req.body.status,
      },
    }
  )
    .exec()
    .then((data) => {
      if (data.modifiedCount == 1 || data.modifiedCount == 1) {
        Masternotifications.updateOne(
          { _id: req.body.notifId },
          {
            $push: {
              updateLog: [
                { updatedAt: new Date(), updatedBy: req.body.user_id },
              ],
            },
          }
        )
          .exec()
          .then((data) => {
            res.status(200).json({ updated: true });
          });
      }
      // if(data.modifiedCount == 1){
      //     res.status(200).json({ updated : true });
      // }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== delete master notification ===========*/
exports.delete_masternotification = (req, res, next) => {
  Masternotifications.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      if (data.deletedCount == 1) {
        res.status(200).json("Master notification deleted");
      } else {
        res.status(401).json("Master notification not found");
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== delete all master notifications ===========*/
exports.deleteall_masternotification = (req, res, next) => {
  Masternotifications.deleteMany({})
    .exec()
    .then((data) => {
      if (data.deletedCount > 0) {
        res.status(200).json("All Master notification deleted");
      } else {
        res.status(401).json("Master notification not found");
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== filter master notification templates ===========*/
exports.filterTemplate = (req, res, next) => {
  var selector = {};
  selector["$and"] = [];

  if (req.body.filterEvent) {
    selector["$and"].push({
      templateName: { $regex: req.body.filterEvent, $options: "i" },
    });
  }
  if (req.body.filterRole) {
    selector["$and"].push({
      role: { $regex: req.body.filterRole, $options: "i" },
    });
  }
  if (req.body.filterStatus) {
    selector["$and"].push({
      status: { $regex: req.body.filterStatus, $options: "i" },
    });
  }
  if (req.body.filterCompany) {
    selector["$and"].push({ company: req.body.filterCompany });
  }
  if (req.params.type) {
    selector["$and"].push({ templateType: req.params.type });
  }

  Masternotifications.find(selector)
    .sort({ createdAt: -1 })
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== send messages (inApp notification / email / sms) ===========*/
exports.send_notifications = (req, res, next) => {
  // console.log("send_notifications body => ", req.body);
  Masternotifications.find({
    event: req.body.event,
    templateType: req.body.templateType,
    status: "active",
    role: req.body.toUserRole,
  })
    .sort({ createdAt: 1 })
    .exec()
    .then((data) => {
      main();
      async function main() {
        // console.log('========================================================')
        var returnData = data;
        // console.log(req.body.toUserRole + " send_notifications data =>", data);

        if (returnData && returnData.length > 0) {
          for (var i = 0; i < returnData.length; i++) {
            // console.log("Entering for loop for returnData at : ",i)
            var role = returnData[i].role;

            // console.log("role : ",role, " | toUserRole = ",req.body.toUserRole)

            var company = req.body.company_id;
            var templateName = returnData[i].event;
            var mode = returnData[i].templateType;

            // console.log("mode", mode);
            // console.log(
            //   "send_notifications 267 notification data=>",
            //   role,
            //   company,
            //   templateName,
            //   mode,
            //   req.body.toUserRole
            // );

            if (role === "admin" && req.body.toUserRole !== "admin") {
              // console.log('admin==>',mode,templateName,company)
              var userData = await getAdminUserData();
              if (userData && userData.length > 0) {
                for (var j = 0; j < userData.length; j++) {
                  var userRole = userData[j].role;
                  var checkRole = userRole.includes(role);
                  if (checkRole) {
                    await callTemplates(
                      mode,
                      userData[j],
                      role,
                      templateName,
                      company,
                      req.body.variables,
                      req.body.attachment
                    );
                  }
                } //j
                // if(j >= userData.length){
                //      res.status(200).json({ message : "Message sent successfully"});
                // }
              }
            } else if (role === req.body.toUserRole && req.body.toUser_id) {
              // console.log('admin toUserrole==>',role)
              var userData = await getSelfUserData(req.body.toUser_id);
              // console.log("userData->",userData)
              var userRole = userData.role;
              // console.log("userRole->",userRole)
              var checkRole = userRole.includes(role);
              // console.log("checkRole->", checkRole);
              if (checkRole) {
                var a = await callTemplates(
                  mode,
                  userData,
                  role,
                  templateName,
                  company,
                  req.body.variables,
                  req.body.attachment,
                  req.body.toMobileNumber
                );
                // console.log("a => ",a);
                // if(a){
                //     res.status(200).json({ message : "Message sent successfully"});
                // }
              }
              // else{
              //     res.status(200).json({ message : "Failed to sent message successfully"});
              // }
            } else if (role === req.body.intendedUserRole) {
              // console.log('manager==>',mode,templateName,company)
              var userData = await getIntendedUserData(
                req.body.intendedUser_id
              );
              var userRole = userData.role;
              var checkRole = userRole.includes(role);
              if (checkRole) {
                var b = await callTemplates(
                  mode,
                  userData,
                  role,
                  templateName,
                  company,
                  req.body.variables,
                  req.body.attachment
                );
              }
              // res.status(200).json({ message : "Message sent successfully"});
            } else if (
              role === req.body.otherAdminRole &&
              req.body.company_id
            ) {
              //  console.log('corporate==>',mode,templateName,company)
              var userData = await getOtherAdminData(
                req.body.otherAdminRole,
                req.body.company_id
              );
              // console.log("userData => ",userData)
              if (userData && userData.length > 0) {
                for (var j = 0; j < userData.length; j++) {
                  var userRole = userData[j].role;
                  var checkRole = userRole.includes(role);
                  // console.log("checkRole => ",checkRole)
                  if (checkRole) {
                    var c = await callTemplates(
                      mode,
                      userData[j],
                      role,
                      templateName,
                      company,
                      req.body.variables,
                      req.body.attachment
                    );
                    // console.log("c  => ",c)
                  }
                } //j
                // if(j >= userData.length){
                //     res.status(200).json({ message : "Message sent successfully"});
                // }
              }
            } else if (role === "admin" && req.body.toUserRole === "admin") {
              var userData = await getAdminUserData();

              // console.log("admin userData => ",userData);

              if (userData && userData.length > 0) {
                for (var j = 0; j < userData.length; j++) {
                  var userRole = "admin";
                  var checkRole = userRole.includes(role);
                  if (checkRole) {
                    await callTemplates(
                      mode,
                      userData[j],
                      role,
                      templateName,
                      company,
                      req.body.variables,
                      req.body.attachment
                    );
                  }
                }
              }
            } else {
              // console.log("send_notifications 331 No data found");
            }
          }

          if (i >= returnData.length) {
            res.status(200).json({ message: "Message sent successfully" });
          }
        } else {
          res
            .status(200)
            .json({ message: "No event available for this event" });
        } //returnData
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

/**=========== call Template ===========*/
function callTemplates(
  mode,
  userData,
  role,
  templateName,
  company,
  variables,
  attachment,
  toMobileNumber
) {
  return new Promise(function (resolve, reject) {
    sub();
    async function sub() {
      // console.log("mode", mode);
      // console.log("variables => ", variables);
      if (mode === "EMAIL") {
        //==============  Send Email ================
        var toEmail = userData.email;
        const emailDetails = await getTemplateDetailsEmail(
          company,
          templateName,
          userData.role,
          variables
        );
        // console.log("emailDetails => ", emailDetails);
        if (
          emailDetails &&
          emailDetails !== undefined &&
          emailDetails !== null
        ) {
          const sendMail = await sendEmail(
            toEmail,
            emailDetails.subject,
            emailDetails.content,
            attachment
          );
          // console.log("sendMail => ", sendMail);
          resolve(sendMail);
        } else {
          resolve(false);
        }
      } else if (mode === "Notification") {
        //==============  Send InApp Notification ================
        var toUserId = userData.id;
        const notificationDetails = await getTemplateDetailsInApp(
          company,
          templateName,
          userData.role,
          variables
        );
        if (
          notificationDetails &&
          notificationDetails !== undefined &&
          notificationDetails !== null
        ) {
          const sendNotification = await sendInAppNotification(
            toUserId,
            userData.email,
            templateName,
            notificationDetails
          );
          resolve(sendNotification);
        } else {
          resolve(false);
        }
      } else if (mode === "SMS") {
        //==============  Send SMS ================
        // console.log("Inside SMS",company,templateName,userData,role,variables);
        // console.log("toMobileNumber => ",toMobileNumber);
        if (
          toMobileNumber &&
          toMobileNumber !== undefined &&
          toMobileNumber !== null
        ) {
          // var toMobile        = userData.mobile.replace(/[|&;$%@"<>()-+-,]/g, "");
          var toMobile = toMobileNumber.replace(/[|&;$%@"<>()-+-,]/g, "");
          // console.log("if toMobile => ",toMobile);
          const smsDetails = await getTemplateDetailsSMS(
            company,
            templateName,
            role,
            variables
          );

          if (smsDetails && smsDetails !== undefined && smsDetails !== null) {
            var textMsg = await smsDetails.content.replace(/<[^>]+>/g, "");
            // console.log("textMsg 1 2 => ",textMsg)
            textMsg = textMsg.replace(/&nbsp;/g, "");
            // console.log("textMsg 1 => ",textMsg)
            const sms = await sendSMS(toMobile, textMsg);
            // console.log("if sms => ",sms)
            resolve(sms);
          } else {
            resolve(false);
          }
          // console.log("SMS if => ",sms)
          // resolve(true);
        } else if (userData.mobile) {
          var isdCode = userData.isdCode ? userData.isdCode : "";
          // console.log("isdCode => ",isdCode)
          var toMobile =
            isdCode + userData.mobile.replace(/[|&;$%@"<>()-+-,]/g, "");
          // console.log("else if toMobile => ",toMobile);
          const smsDetails = await getTemplateDetailsSMS(
            company,
            templateName,
            role,
            variables
          );
          if (smsDetails && smsDetails !== undefined && smsDetails !== null) {
            var textMsg = await smsDetails.content.replace(/<[^>]+>/g, "");
            // console.log("textMsg 1 2 => ",textMsg)
            textMsg = textMsg.replace(/&nbsp;/g, "");
            // console.log("textMsg 2 => ",textMsg)
            // console.log("toMobile",toMobile);
            const sms = await sendSMS(toMobile, textMsg);
            // console.log("sms => ",sms)
            // console.log("SMS else if => ",sms)
            resolve(sms);
            // resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      } else if (mode === "WHATSAPP") {
        //==============  Send SMS ================
        // console.log("Inside SMS",company,templateName,userData,role,variables);
        // console.log("toMobileNumber => ",toMobileNumber);
        if (
          toMobileNumber &&
          toMobileNumber !== undefined &&
          toMobileNumber !== null
        ) {
          // var toMobile        = userData.mobile.replace(/[|&;$%@"<>()-+-,]/g, "");
          var toMobile = toMobileNumber.replace(/[|&;$%@"<>()-+-,]/g, "");
          // console.log("if toMobile => ",toMobile);
          const smsDetails = await getTemplateDetailsWhatsApp(
            company,
            templateName,
            role,
            variables
          );

          if (smsDetails && smsDetails !== undefined && smsDetails !== null) {
            var textMsg = await smsDetails.content.replace(/<[^>]+>/g, "");
            // console.log("textMsg 1 2 => ",textMsg)
            textMsg = textMsg.replace(/&nbsp;/g, "");
            // console.log("textMsg 1 => ",textMsg)
            const sms = await send_whatsapp(toMobile, textMsg);
            // console.log("if sms => ",sms)
            resolve(sms);
          } else {
            resolve(false);
          }
          // console.log("SMS if => ",sms)
          // resolve(true);
        } else if (userData.mobile) {
          var isdCode = userData.isdCode ? userData.isdCode : "";
          // console.log("isdCode => ",isdCode)
          var toMobile =
            isdCode + userData.mobile.replace(/[|&;$%@"<>()-+-,]/g, "");
          // console.log("else if toMobile => ",toMobile);
          const smsDetails = await getTemplateDetailsWhatsApp(
            company,
            templateName,
            role,
            variables
          );
          if (smsDetails && smsDetails !== undefined && smsDetails !== null) {
            var textMsg = await smsDetails.content.replace(/<[^>]+>/g, "");
            // console.log("textMsg 1 2 => ",textMsg)
            textMsg = textMsg.replace(/&nbsp;/g, "");
            // console.log("textMsg 2 => ",textMsg)
            // console.log("toMobile",toMobile);
            const sms = await send_whatsapp(toMobile, textMsg);
            // console.log("sms => ",sms)
            // console.log("SMS else if => ",sms)
            resolve(sms);
            // resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      }
    }
  });
}

/**=========== get user Roles  ===========*/
function getAdminUserData() {
  return new Promise(function (resolve, reject) {
    User.find({ roles: "admin" })
      .exec()
      .then((data) => {
        if (data && data.length > 0) {
          var userData = [];

          for (var i = 0; i < data.length; i++) {
            if (data[i].profile) {
              userData.push({
                email: data[i].profile.email,
                id: data[i]._id,
                mobile: data[i].profile.mobile,
                isdCode: data[i].profile.isdCode,
                role: "admin",
              });
            }
          } //i
          resolve(userData);
        }
      })
      .catch((err) => {
        console.log(err);
        reject({
          error: err,
        });
      });
  });
}

/**=========== get user data ===========*/
function getSelfUserData(toUserId) {
  // console.log("toUserId",toUserId);
  return new Promise(function (resolve, reject) {
    User.findOne({ _id: toUserId })
      .exec()
      .then(async (data) => {
        // console.log("data => ",data)
        // console.log("isd => ",data.profile.isdCode)
        // console.log("mobile => ",data.profile.mobile)
        if (data && data.profile) {
          var profile = data.profile;
          profile.id = await data._id;
          profile.role = await data.roles;
          resolve(profile);
          // resolve({
          //     email       : data.profile.email,
          //     id          : data._id,
          //     mobile      : data.profile.mobile,
          //     isdCode : data.profile.isdCode,
          //     role        : data.roles,
          // });
        }
      })
      .catch((err) => {
        console.log(err);
        reject({
          error: err,
        });
      });
  });
}

/**=========== get intended user data ===========*/
function getIntendedUserData(toUserId) {
  return new Promise(function (resolve, reject) {
    PersonMaster.findOne({ _id: toUserId })
      .exec()
      .then((result) => {
        User.findOne({ _id: result.userId })
          .exec()
          .then((data) => {
            if (data && data.profile) {
              resolve({
                email: data.profile.email,
                id: data._id,
                mobile: data.profile.mobile,
                isdCode: data.profile.isdCode,
                role: data.roles,
              });
            }
          })
          .catch((err) => {
            console.log(err);
            reject({
              error: err,
            });
          });
      })
      .catch((err) => {
        console.log("personMaster error: ", err);
      });
  });
}

/**=========== get other admin data ===========*/
function getOtherAdminData(role, company_id) {
  return new Promise(function (resolve, reject) {
    EntityMaster.findOne({ _id: company_id })
      .exec()
      .then((result) => {
        console.log("result => ", result);
        if (result.companyID) {
          User.find({
            "profile.companyID": result.companyID,
            roles: role,
            recieveNotifications: true,
          })
            .exec()
            .then((data) => {
              // console.log("data => ",data)
              if (data && data.length > 0) {
                var userData = [];
                for (var i = 0; i < data.length; i++) {
                  if (data[i].profile) {
                    userData.push({
                      email: data[i].profile.email,
                      id: data[i]._id,
                      mobile: data[i].profile.mobile,
                      isdCode: data[i].profile.isdCode,
                      role: data[i].roles,
                    });
                  }
                } //i
                if (i >= data.length) {
                  resolve(userData);
                }
              }
            })
            .catch((err) => {
              console.log(err);
              reject({
                error: err,
              });
            });
        }
      })
      .catch((err) => {
        console.log("entityMaster error: ", err);
      });
  });
}

/**=========== send sms ===========*/
// function sendSMS(MobileNumber,text){
//     // console.log('=====INSIDE SMS======',MobileNumber,text)
//     // return new Promise(function (resolve, reject) {
//         GlobalMaster.findOne({type:'SMS'})
//         .exec()
//         .then(data=>{
//             // console.log('data.authID,data.authToken,data.sourceMobile: ',data.authID,data.authToken,data.sourceMobile)
//             const client = new plivo.Client(data.authID,data.authToken);   // Vowels LLP
//             const sourceMobile = data.sourceMobile;
//             client.messages.create(
//             src = sourceMobile,
//             dst = MobileNumber,
//             text = text
//             ).then((result) => {
//                 // console.log('result: ',result)
//                 return(result)
//             })
//             .catch(error => {
//                 console.log('sms error inside: ',error)
//                 return(error);
//             });
//         })
//         .catch(err =>{
//             console.log('sms error: ',err)
//         });
//     // })
// }

/**=========== Send SMS ===========*/
// function sendSMS(MobileNumber,text){
//     return new Promise(function (resolve, reject) {
//     // console.log('=====INSIDE SMS======',MobileNumber,text)
//         GlobalMaster.findOne({type : 'SMS'})
//         .exec()
//         .then(data=>{
//             // console.log("data => ",data)
//             if(data !== null){
//                 // console.log('data.authID,data.authToken,data.sourceMobile: ',data.authToken, data.sourceMobile)
//                 // var msg91 = require("msg91")(data.authToken, "FIVEBE", "4" );
//                 // var mobileNo = MobileNumber.split(" ").join("");
//                 // // console.log("mobileNo IN SMS=====>",MobileNumber.replaceAll("[\\D]", ""));
//                 // // console.log("mobileNo IN SMS=====>",mobileNo);
//                 // msg91.send(mobileNo, text.toString(), function(err, response){
//                     // console.log(err);
//                     // console.log("response IN SMS =====>",response);
//                     resolve(true)
//                 // });
//             }else{
//                 resolve("No SMS Data Found")
//             }
//         })
//         .catch(err =>{
//             reject(err)
//         });
//     })
// }

function sendSMS(mobileNumber, textMsg) {
  return new Promise(function (resolve, reject) {
    GlobalMaster.findOne({ type: "SMS" })
      .exec()
      .then((data) => {
        // console.log("data => ",data)
        if (data !== null) {
          var smsFormValues = {
            origin: data.origin,
            destination: mobileNumber,
            message: textMsg,
          };
          // console.log("smsFormValues=> ", smsFormValues);
          var smsglobal = require("smsglobal")(data.authID, data.authToken);

          smsglobal.sms.send(smsFormValues, function (error, response) {
            // console.log("SMS response 1 => ", response);
            if (
              response &&
              response !== undefined &&
              response.statusCode &&
              response.statusCode === 200 &&
              response.status === "OK"
            ) {
              // console.log("SMS response => ", response);
              resolve(true);
            } else {
              if (
                error &&
                error !== undefined &&
                error.data &&
                error.data !== undefined
              ) {
                console.log("error => ", error.data);
                // console.log("SMS error => ",error.data.errors.origin.errors);
              }
              resolve(false);
            }
            // resolve(true);
          });
        } else {
          console.log("SMS Gateway Details Not Found");
          resolve(false);
        }
      })
      .catch((err) => {
        console.log("Error while finding SMS Gateway Details => ", err);
        resolve(false);
      });
  });
}

// function send_whatsapp(to,template_name){
//     return new Promise(function (resolve, reject) {
//     const options = {
//         method: 'POST',
//         url: 'https://public.doubletick.io/whatsapp/message/template',
//         headers: {
//           accept: 'application/json',
//           'content-type': 'application/json',
//           Authorization: globalVariable.WHATSAPP_API_KEY
//         },
//         data: {
//           messages: [
//             {
//               content: {language: 'en', templateName: req.body.template_name},
//               to: req.body.to
//             }
//           ]
//         }
//       };

//       axios
//         .request(options)
//         .then( response=>{
//              resolve(response.data);
//         })
//         .catch(error=> {
//              reject(response.data);
//         });
//     })
// };

function send_whatsapp(to, textMsg) {
  return new Promise(function (resolve, reject) {
    const options = {
      method: "POST",
      url: "https://graph.facebook.com/v17.0/354971447692163/messages",
      headers: {
        Authorization: globalVariable.WHATSAPP_API_TOKEN,
        "Content-Type": "application/json",
      },
      body: {
        messaging_product: "whatsapp",
        to: "+919322664533",
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US",
          },
        },
      },
      json: true,
    };
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      //+++++++++++++++++++++++++++++++++++++++++++++
      console.log("response", response);
      resolve(response);
    });
  });
}

//  exports.send_whatsapp = (req,res,next)=>{
//         const options = {
//             method: 'POST',
//             url: 'https://graph.facebook.com/v19.0/354971447692163/messages',
//             headers: {
//                 Authorization: globalVariable.WHATSAPP_API_TOKEN,
//                 'Content-Type': 'application/json'
//             },
//             body: {
//                 messaging_product: 'whatsapp',
//                 to: "+919322664533",
//                 type: 'template',
//                 template: {
//                     name: 'hello_world',
//                     language: {
//                         code: 'en_US'
//                     }
//                 }
//             },
//             json: true
//         };
//         console.log("options",options);
//         request(options, function(error, response, body) {
//             if (error) throw new Error(error);
//             //+++++++++++++++++++++++++++++++++++++++++++++
//             console.log("response",response.data);
//             res.status(200).json(response);
//         });
// };

/**=========== Send inApp Notification ===========*/
function sendInAppNotification(toUserId, email, event, notificationDetails) {
  return new Promise(function (resolve, reject) {
    const inAppNotification = new Notifications({
      _id: new mongoose.Types.ObjectId(),
      masternotificationId: notificationDetails.id,
      toMailId: email,
      event: event,
      toUserId: toUserId,
      status: "Unread",
      notifBody: notificationDetails.content,
      createdAt: new Date(),
    });

    inAppNotification
      .save()
      .then((data) => {
        if (data && data !== null) {
          resolve(true);
        } else {
          console.log("Unable to Save InApp Notifications");
          resolve(false);
        }
      })
      .catch((err) => {
        console.log("Error While Saving InApp Notifications => ", err);
        reject(false);
      });
  });
}

/**=========== Function to send Email ===========*/
function sendEmail(toEmail, subject, content, attachment) {
  // console.log('====**INSIDE EMAIL**=====',toEmail, subject, content, attachment)
  return new Promise(function (resolve, reject) {
    if (attachment === null || attachment === undefined || attachment === "") {
      var attachment = [];
    } else {
      var attachment = [attachment];
    }
    // async function main() {

    // GlobalMaster.findOne({type : 'EMAIL'})
    // .exec()
    // .then(data=>{
    // console.log("sendEmail 714 GlobalMaster Data => ", data);
    // if(data){
    //    const senderEmail       = data.user;
    //    const senderEmailPwd    = data.password;
    //    const projectName       = data.projectName;
    //    // create reusable transporter object using the default SMTP transport
    //    let transporter = nodeMailer.createTransport({
    //                         host    : data.emailHost,
    //                         port    : data.port,
    //                         // secure  : false, // true for 465, false for other ports
    //                         auth    : {
    //                                     user    : senderEmail,
    //                                     pass    : senderEmailPwd
    //                         }
    //                     });
    //    // send mail with defined transport object
    //    var mailOptions = {
    //       from        : '" Admin" <' + senderEmail + '>', // sender address
    //       to          : toEmail, // list of receiver
    //       subject     : subject, // Subject line
    //       html        : "<pre>" + content + "</pre>", // html body
    //       attachments : attachment,
    //    };

    //    let info =  transporter.sendMail(mailOptions, (error, info) => {
    //        // console.log("Message sent: %s", error, "-", info);
    //        if(error === null){
    //            resolve(true)
    //        }else{
    //            console.log("Error While sending email => ",error)
    //            resolve(false)
    //        }
    //    });
    // }else{
    //It means ProjectSettings collection is not available or some error.
    //Now check nodemonConfig file.

    // console.log("globalVariable => ", globalVariable);

    const senderEmail = globalVariable.user;
    const senderEmailPwd = globalVariable.pass;
    const emailHost = globalVariable.emailHost;
    const emailPort = globalVariable.emailPort;
    const projectName = globalVariable.projectName;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodeMailer.createTransport({
      host: emailHost,
      port: emailPort,
      // secure  : false, // true for 465, false for other ports
      auth: {
        user: senderEmail,
        pass: senderEmailPwd,
      },
    });

    // send mail with defined transport object
    var mailOptions = {
      from: projectName + '" Admin" <' + senderEmail + ">", // sender address
      to: toEmail, // list of receiver
      subject: subject, // Subject line
      html: "<pre>" + content + "</pre>", // html body
      attachments: attachment,
    };

    // console.log("mailOptions => ",mailOptions);

    let info = transporter.sendMail(mailOptions, (error, info) => {
      // console.log("Message sent: %s", error, "-", info);
      if (error === null) {
        resolve(true);
      } else {
        console.log("Error While sending email => ", error);
        resolve(false);
      }
    });
    // }
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodeMailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    // })
    // .catch(err =>{
    //     console.log('Error while finding email gateway details => ',err)
    //     resolve(false)
    // });
    // main().catch(err=>{console.log('mail error=>',err)});
    // }
  });
}

/**=========== get Template Details ===========*/
function getTemplateDetailsEmail(company, templateName, role, variables) {
  console.log(
    "company,templateName, variables => ",
    company,
    templateName,
    variables
  );

  return new Promise(function (resolve, reject) {
    Masternotifications.findOne({
      event: templateName,
      templateType: "EMAIL",
      company: company,
      role: role,
      status: "active",
    })
      .exec()
      .then(async (NotificationData) => {
        if (NotificationData) {
          var content = NotificationData.content;
          var replacedContent = await relpaceVariables(content, variables);

          var subject = NotificationData.subject;
          var replacedSubject = await relpaceVariables(subject, variables);

          var tData = {
            content: replacedContent,
            subject: replacedSubject,
          };
          console.log("Masternotifications tData => ", tData);
          resolve(tData);
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

function relpaceVariables(text, variables) {
  return new Promise((resolve, reject) => {
    var wordsplit = [];
    if (text.indexOf("[") > -1) {
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
    var numOfVar = Object.keys(variables).length;
    for (i = 0; i < numOfVar; i++) {
      text = text.replace(tokens[i], variables[tokens[i]]);
    }
    if (i >= numOfVar) {
      text = text.split("[").join(" ");
      text = text.split("]").join(" ");

      console.log("relpaceVariables text => ", text);

      resolve(text);
    }
  });
}

/**=========== get SMS Template Details ===========*/
function getTemplateDetailsSMS(company, templateName, role, variables) {
  // console.log('|||||||||||||INSIDE SMS TEMPLATE||||||||||||',company, templateName,role,variables)
  return new Promise(function (resolve, reject) {
    Masternotifications.findOne({
      event: templateName,
      templateType: "SMS",
      company: company,
      role: role,
      status: "active",
    })
      .exec()
      .then((NotificationData) => {
        if (NotificationData && NotificationData !== null) {
          var content = NotificationData.content;
          var wordsplit = [];
          if (content.indexOf("[") > -1) {
            wordsplit = content.split("[");
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
          var numOfVar = Object.keys(variables).length;
          for (i = 0; i < numOfVar; i++) {
            content = content.replace(tokens[i], variables[tokens[i]]);
          }
          content = content.split("[").join(" ");
          content = content.split("]").join(" ");
          var tData = {
            content: content,
            subject: NotificationData.subject,
          };
          resolve(tData);
        } else {
          Masternotifications.findOne({
            event: templateName,
            templateType: "SMS",
            company: null,
            role: role,
            status: "active",
          })
            .exec()
            .then((NotificationData) => {
              if (NotificationData && NotificationData !== null) {
                var content = NotificationData.content;
                var wordsplit = [];
                if (content.indexOf("[") > -1) {
                  wordsplit = content.split("[");
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
                var numOfVar = Object.keys(variables).length;
                for (i = 0; i < numOfVar; i++) {
                  content = content.replace(tokens[i], variables[tokens[i]]);
                }
                content = content.split("[").join(" ");
                content = content.split("]").join(" ");
                var tData = {
                  content: content,
                  subject: NotificationData.subject,
                };
                resolve(tData);
              } else {
                resolve(false);
              }
            })
            .catch((err) => {
              console.log(err);
              err.status(500).json({
                error: err,
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        err.status(500).json({
          error: err,
        });
      });
  });
}

/**=========== get WHATSAPP Template Details ===========*/
function getTemplateDetailsWhatsApp(company, templateName, role, variables) {
  // console.log('|||||||||||||INSIDE SMS TEMPLATE||||||||||||',company, templateName,role,variables)
  return new Promise(function (resolve, reject) {
    Masternotifications.findOne({
      event: templateName,
      templateType: "WHATSAPP",
      company: company,
      role: role,
      status: "active",
    })
      .exec()
      .then((NotificationData) => {
        if (NotificationData && NotificationData !== null) {
          var content = NotificationData.content;
          var wordsplit = [];
          if (content.indexOf("[") > -1) {
            wordsplit = content.split("[");
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
          var numOfVar = Object.keys(variables).length;
          for (i = 0; i < numOfVar; i++) {
            content = content.replace(tokens[i], variables[tokens[i]]);
          }
          content = content.split("[").join(" ");
          content = content.split("]").join(" ");
          var tData = {
            content: content,
            subject: NotificationData.subject,
          };
          resolve(tData);
        } else {
          Masternotifications.findOne({
            event: templateName,
            templateType: "SMS",
            company: null,
            role: role,
            status: "active",
          })
            .exec()
            .then((NotificationData) => {
              if (NotificationData && NotificationData !== null) {
                var content = NotificationData.content;
                var wordsplit = [];
                if (content.indexOf("[") > -1) {
                  wordsplit = content.split("[");
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
                var numOfVar = Object.keys(variables).length;
                for (i = 0; i < numOfVar; i++) {
                  content = content.replace(tokens[i], variables[tokens[i]]);
                }
                content = content.split("[").join(" ");
                content = content.split("]").join(" ");
                var tData = {
                  content: content,
                  subject: NotificationData.subject,
                };
                resolve(tData);
              } else {
                resolve(false);
              }
            })
            .catch((err) => {
              console.log(err);
              err.status(500).json({
                error: err,
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        err.status(500).json({
          error: err,
        });
      });
  });
}

/**=========== get inApp notification template details ===========*/
function getTemplateDetailsInApp(company, templateName, role, variables) {
  // console.log('in app: ',company,templateName, variables)
  return new Promise(function (resolve, reject) {
    Masternotifications.findOne({
      event: templateName,
      templateType: "Notification",
      company: company,
      role: role,
      status: "active",
    })
      .exec()
      .then((NotificationData) => {
        if (NotificationData && NotificationData !== null) {
          var content = NotificationData.content;
          var wordsplit = [];
          if (content.indexOf("[") > -1) {
            wordsplit = content.split("[");
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
          var numOfVar = Object.keys(variables).length;
          for (i = 0; i < numOfVar; i++) {
            content = content.replace(tokens[i], variables[tokens[i]]);
          }
          content = content.split("[").join(" ");
          content = content.split("]").join(" ");
          var tData = {
            id: NotificationData._id,
            content: content,
          };
          resolve(tData);
        } else {
          Masternotifications.findOne({
            event: templateName,
            templateType: "Notification",
            company: null,
            role: role,
            status: "active",
          })
            .exec()
            .then((NotificationData) => {
              if (NotificationData && NotificationData !== null) {
                var content = NotificationData.content;
                var wordsplit = [];
                if (content.indexOf("[") > -1) {
                  wordsplit = content.split("[");
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
                var numOfVar = Object.keys(variables).length;
                for (i = 0; i < numOfVar; i++) {
                  content = content.replace(tokens[i], variables[tokens[i]]);
                }
                content = content.split("[").join(" ");
                content = content.split("]").join(" ");
                var tData = {
                  id: NotificationData._id,
                  content: content,
                };
                resolve(tData);
              } else {
                resolve(false);
              }
            })
            .catch((err) => {
              console.log(err);
              reject({
                error: err,
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        reject({
          error: err,
        });
      });
  });
}

/**=========== return file details ===========*/
exports.filedetails = (req, res, next) => {
  // console.log('req------',req,'res',res);
  var finaldata = {};
  // console.log(req.params.fileName)
  Masternotifications.find({ fileName: req.params.fileName })
    .exec()
    .then((data) => {
      // finaldata.push({goodrecords: data})
      finaldata.goodrecords = data;
      FailedRecords.find({ fileName: req.params.fileName })
        .exec()
        .then((badData) => {
          finaldata.failedRecords = badData[0].failedRecords;
          finaldata.totalRecords = badData[0].totalRecords;
          res.status(200).json(finaldata);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

/**=========== fetch all notifications ===========*/
var fetchAllNotification = async (type) => {
  return new Promise(function (resolve, reject) {
    Masternotifications.find({ entityType: type })
      .sort({ createdAt: -1 })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**=========== get company details ===========*/
function getcompany(entityType, company) {
  return new Promise(function (resolve, reject) {
    EntityMaster.findOne({
      companyName: { $regex: company, $options: "i" },
      entityType: entityType,
    })
      .exec()
      .then((data) => {
        // console.log("company data----",data);
        if (data) {
          resolve(data._id);
        } else {
          resolve({ message: "COMPANY_NOT_FOUND" });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**=========== get single event details ===========*/
function getEvent(templateName) {
  return new Promise(function (resolve, reject) {
    EventTokenMaster.findOne({ templateName: templateName })
      .exec()
      .then((data) => {
        if (data) {
          resolve(data.event);
        } else {
          resolve({ message: "EVENT_NOT_FOUND" });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**=========== bulk upload notification ===========*/
exports.bulkUploadNotification = (req, res, next) => {
  var Notification = req.body.data;
  // console.log("Notification",req.body.data)
  var validData = [];
  var validObjects = [];
  var invalidData = [];
  var invalidObjects = [];
  var remark = "";
  var failedRecords = [];
  var Count = 0;
  var DuplicateCount = 0;
  processData();
  async function processData() {
    for (var k = 0; k < Notification.length; k++) {
      if (Notification[k].templateType == "-") {
        remark += "templateType not found, ";
      }
      if (Notification[k].event == "-") {
        remark += "event not found, ";
      }
      if (Notification[k].templateName == "-") {
        remark += "templateName not found, ";
      }
      if (Notification[k].role == "-") {
        remark += "role not found, ";
      }
      // if (Notification[k].company == '-') {
      //     remark += "company not found, ";
      // }
      if (
        Notification[k].templateType == "Email" &&
        Notification[k].subject == "-"
      ) {
        remark += "subject not found, ";
      }
      if (Notification[k].content == "-") {
        remark += "content  not found, ";
      }

      // else if(entity[i].state != "-" && entity[i].GSTIN !="-"&& entity[i].PAN){

      // }
      var companylist = [];
      var company = await getcompany(
        Notification[k].entityType,
        Notification[k].company
      );
      // console.log("company list",company);
      if (Notification[k].company != "-" && company) {
        if (company.message === "COMPANY_NOT_FOUND") {
          remark += "company not found, ";
          var companyId = null;
        } else {
          var companyId = company;
        }
      }
      var event = await getEvent(Notification[k].templateName);
      if (event) {
        if (event.message === "EVENT_NOT_FOUND") {
          remark += "event not found, ";
        } else {
          var eventName = event;
        }
      }

      if (remark == "") {
        var AllNotification = await fetchAllNotification(
          req.body.reqdata.entityType
        );

        // check if employee exists
        var notificationExists = AllNotification.filter((data) => {
          if (
            data.templateType == Notification[k].templateType &&
            data.event == Notification[k].event &&
            data.templateName == Notification[k].templateName &&
            data.company == Notification[k].company
          ) {
            return data;
          }
        });

        if (notificationExists.length == 0) {
          validObjects = {
            fileName: req.body.fileName,
            templateType: Notification[k].templateType,
            event: eventName,
            templateName: Notification[k].templateName,
            role: Notification[k].role,
            company: companyId ? companyId : null,
            subject: Notification[k].subject,
            content: Notification[k].content,
            status: "active",
          };

          validData.push(validObjects);
        } else {
          remark += "data already exists.";

          invalidObjects = Notification[k];
          invalidObjects.failedRemark = remark;
          invalidData.push(invalidObjects);
        }
      } else {
        invalidObjects = Notification[k];
        invalidObjects.failedRemark = remark;
        invalidData.push(invalidObjects);
      }
      remark = "";
    }
    //console.log("validData",validData);
    Masternotifications.insertMany(validData)
      .then((data) => {})
      .catch((err) => {
        console.log(err);
      });

    failedRecords.FailedRecords = invalidData;
    failedRecords.fileName = req.body.fileName;
    failedRecords.totalRecords = req.body.totalRecords;

    await insertFailedRecords(failedRecords, req.body.updateBadData);

    res.status(200).json({
      message: "Bulk upload process is completed successfully!",
      completed: true,
    });
  }
};

/**=========== bulk upload faild records ===========*/
var insertFailedRecords = async (invalidData, updateBadData) => {
  //console.log('invalidData',invalidData);
  return new Promise(function (resolve, reject) {
    FailedRecords.find({ fileName: invalidData.fileName })
      .exec()
      .then((data) => {
        if (data.length > 0) {
          //console.log('data',data[0].failedRecords.length)
          if (data[0].failedRecords.length > 0) {
            if (updateBadData) {
              FailedRecords.updateOne(
                { fileName: invalidData.fileName },
                { $set: { failedRecords: [] } }
              )
                .then((data) => {
                  if (data.modifiedCount == 1) {
                    FailedRecords.updateOne(
                      { fileName: invalidData.fileName },
                      {
                        $set: { totalRecords: invalidData.totalRecords },
                        $push: { failedRecords: invalidData.FailedRecords },
                      }
                    )
                      .then((data) => {
                        if (data.modifiedCount == 1) {
                          resolve(data);
                        } else {
                          resolve(data);
                        }
                      })
                      .catch((err) => {
                        reject(err);
                      });
                  } else {
                    resolve(0);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            } else {
              FailedRecords.updateOne(
                { fileName: invalidData.fileName },
                {
                  $set: { totalRecords: invalidData.totalRecords },
                  $push: { failedRecords: invalidData.FailedRecords },
                }
              )
                .then((data) => {
                  if (data.modifiedCount == 1) {
                    resolve(data);
                  } else {
                    resolve(data);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            }
          } else {
            FailedRecords.updateOne(
              { fileName: invalidData.fileName },
              {
                $set: { totalRecords: invalidData.totalRecords },
                $push: { failedRecords: invalidData.FailedRecords },
              }
            )
              .then((data) => {
                if (data.modifiedCount == 1) {
                  resolve(data);
                } else {
                  resolve(data);
                }
              })
              .catch((err) => {
                reject(err);
              });
          }
        } else {
          const failedRecords = new FailedRecords({
            _id: new mongoose.Types.ObjectId(),
            failedRecords: invalidData.FailedRecords,
            fileName: invalidData.fileName,
            totalRecords: invalidData.totalRecords,
            createdAt: new Date(),
          });

          failedRecords
            .save()
            .then((data) => {
              resolve(data._id);
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        }
      });
  });
};
