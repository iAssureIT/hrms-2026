const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ObjectId = mongoose.Types.ObjectId;
var request = require("request-promise");

const nodeMailer = require("nodemailer");
const moment = require("moment-timezone");
const User = require("./ModelUsers.js");
const Role = require("../rolesManagement/model.js");
// const Approval = require("../../lupin/approval-details/model.js");
const Centers = require("../../lupin/centers/model.js");
const globalVariable = require("../../../nodemonConfig.js");
// const sendNotification = require("../notificationManagement/SendNotification.js");
const { sendNotification } = require("../common/globalFunctions");
const { isError } = require("underscore");

//shaavi - PB added specific user for Shaavi --starts

exports.add_user_details = (req, res, next) => {
  if (req.body.email && req.body.password && req.body.role) {
    var emailId = req.body.email;
    var role_lower = req.body.role;
    // console.log("role ", role_lower, role_lower && emailId);
    // console.log("req.body ", req.body);

    if (role_lower && emailId) {
      Role.findOne({ role: role_lower })
        .exec()
        .then((role) => {
          // console.log("role",role);

          if (role && role !== null) {
            User.find({ username: emailId.toLowerCase() })
              .exec()
              .then((user) => {
                // console.log("user => ", user);
                // console.log("user length => ", user.length);
                if (user.length > 0) {
                  return res.status(200).json({
                    message: "Email Id already exists.",
                    success: false,
                  });
                } else {
                  bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                      return res.status(500).json({
                        message: "Failed to match the password",
                        error: err,
                      });
                    } else {
                      const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        createdAt: new Date(),
                        services: {
                          password: {
                            bcrypt: hash,
                          },
                        },
                        username: emailId.toLowerCase(),
                        authService: req.body.authService,
                        department: req.body.department,
                        designation: req.body.designation,
                        orgLevel: req.body.orgLevel,
                        reporting_id: req.body.reporting_id,
                        profile: {
                          firstname: req.body.firstName,
                          lastname: req.body.lastName,
                          fullName:
                            req.body.firstName + " " + req.body.lastName,
                          email: emailId.toLowerCase(),
                          isdCode: "+91",
                          mobile: req.body.mobile,
                          companyID: req.body.companyID,
                          company_id: req.body.company_ID,
                          pincode: req.body.pincode,
                          companyName: req.body.companyName,
                          center_id:
                            req.body.center_id &&
                            req.body.center_id.trim() !== ""
                              ? req.body.center_id
                              : null,
                          centerName:
                            req.body.centerName &&
                            req.body.centerName.trim() !== ""
                              ? req.body.centerName
                              : null,

                          city: req.body.cityName,
                          states: req.body.states,
                          status: req.body.status ? req.body.status : "blocked",
                          createdBy: req.body.createdBy,
                          createdAt: new Date(),
                        },
                        deliveryAddress: [],
                        roles: role_lower,
                        recieveNotifications: req.body.recieveNotifications,
                      });
                      if (!req.body.firstname) {
                        user.profile.fullName = req.body.fullName;
                      }
                      user
                        .save()
                        .then(async (result) => {
                          // console.log(
                          //   "user.roles.includes('admin')",
                          //   !user.roles.includes("admin")
                          // );
                          // if (!user.roles.includes("admin")) {
                          // send Notification, email, sms to customer

                          const admin = await getAdmin();

                          var userNotificationValues = {
                            event: "User Management - Create User",
                            toUser_id: user._id.toString(),
                            toEmail: user.profile.email,
                            toMobileNumber:
                              user.profile.isdCode + user.profile.mobile,
                            toUserRole: user.roles[0],
                            userDetails: user,
                            variables: {
                              userName:
                                user.profile.firstname +
                                " " +
                                user.profile.lastname,
                              email: user.profile.email,
                              mobile: user.profile.mobile,
                              role: user.roles[0],
                              createdAt: moment(result.createdAt).format(
                                "MMMM Do YYYY, h:mm:ss a"
                              ),
                              centerName: user.profile.centerName,
                            },
                          };
                          var send_notification_to_user =
                            await sendNotification(userNotificationValues);
                          // console.log(
                          //   "send_notification_to_user",
                          //   send_notification_to_user
                          // );
                          // send Notification, email, sms to admin
                          var adminNotificationValues = {
                            event: "Create User",
                            toUser_id: admin._id.toString(),
                            toEmail: admin.profile.email,
                            toMobileNumber:
                              admin.profile.isdCode + admin.profile.mobile,
                            toUserRole: "admin",
                            userDetails: admin,
                            variables: {
                              firstName: admin.profile.firstname,
                              lastName: admin.profile.lastname,
                              emailId: admin.profile.email,
                              mobileNumber: admin.profile.mobile,
                              loginID: admin.username,
                              signupDate: moment(admin.createdAt).format(
                                "MMMM Do YYYY, h:mm:ss a"
                              ),
                            },
                          };
                          var send_notification_to_admin =
                            await sendNotification(adminNotificationValues);
                          // console.log(
                          //   "send_notification_to_admin",
                          //   send_notification_to_admin
                          // );

                          // }
                          res.status(200).json({
                            message: "USER_CREATED",
                            ID: result._id,
                            success: true,
                          });
                        })
                        .catch((err) => {
                          console.log(err);
                          res.status(500).json({
                            message: "Failed to save User Details",
                            error: err,
                          });
                        });
                    }
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  message: "Failed which finding the User",
                  error: err,
                });
              });
          } else {
            res.status(200).json({ message: "Role does not exist" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            message: "Failed when trying to find Role",
            error: err,
          });
        });
    }
  } else {
    res.status(200).json({ message: "Email, pwd and role are mandatory" });
  }
};

function getAdmin() {
  return new Promise((resolve, reject) => {
    User.findOne({ roles: { $in: ["admin"] } })
      .then((admin) => {
        // console.log("SUPERR ADMIN DETAILSSS",superAdmin)
        if (admin) {
          resolve(admin);
          // console.log(admin);
        } else {
          resolve(0);
        }
      })
      .catch((err) => {
        reject(0);
      });
  });
}

exports.update_user_details = (req, res, next) => {
  // console.log("req.body", req.body);
  const roles = req.body.role;
  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      // console.log("user got", user);
      if (user) {
        // console.log("before updation center_id", user.profile.center_id);
        const changedFields = [];
        if (user.profile.firstname !== req.body?.firstName) {
          changedFields.push("firstname");
        }
        if (user.profile.lastname !== req.body?.lastName) {
          changedFields.push("lastname");
        }
        if (user.profile.mobile !== req.body?.mobile) {
          changedFields.push("mobile");
        }
        if (user.profile.centerName !== req.body?.centerName) {
          changedFields.push("centerName");
        }
        if (user.profile.email !== req.body?.email) {
          changedFields.push("email");
        }
        if (
          Array.isArray(user.roles) &&
          Array.isArray(roles) &&
          user.roles.toString() !== roles.toString()
        ) {
          changedFields.push("roles");
        }
        User.updateOne(
          { _id: req.params.ID },
          {
            $set: {
              "profile.firstname": req.body?.firstName,
              "profile.lastname": req.body?.lastName,
              "profile.fullName":
                req.body?.firstName + " " + req.body?.lastName,
              "profile.isdCode": "+91",
              "profile.mobile": req.body?.mobile,
              "profile.center_id": req.body?.center_id,
              "profile.centerName": req.body?.centerName,
              roles: roles,
              "profile.email": req.body?.email,
              username: req.body?.email,
            },
          }
        )
          .exec()
          .then(async (data) => {
            // console.log("after updation center_id", user.profile.center_id);
            // console.log("Inside Edit");

            // console.log("data",data)
            if (data.modifiedCount == 1) {
              // console.log("modified data", data);
              // console.log("Inside modification");
              const userData = await User.findOne({ _id: req.params.ID });
              // console.log("userr Data", userData);

              // await Centers.updateMany(
              //   {
              //     $or: [
              //       { "centerInchargeDetails.user_id": req.params.ID },
              //       { "seniorManagerDetails.user_id": req.params.ID },
              //     ],
              //   },
              //   {
              //     $set: {
              //       ...(userData.profile && {
              //         "centerInchargeDetails.user_id": userData._id,
              //         "centerInchargeDetails.Name": `${userData.profile.firstname} ${userData.profile.lastname}`,
              //         "centerInchargeDetails.mobileNumber":
              //           userData.profile.mobile,
              //         "centerInchargeDetails.email": userData.profile.email,
              //         "seniorManagerDetails.user_id": userData._id,
              //         "seniorManagerDetails.Name": `${userData.profile.firstname} ${userData.profile.lastname}`,
              //         "seniorManagerDetails.mobileNumber":
              //           userData.profile.mobile,
              //         "seniorManagerDetails.email": userData.profile.email,
              //       }),
              //     },
              //   }
              // );

              // console.log(
              //   "req.body.lastName",
              //   user.profile.firstname + " " + user.profile.lastname
              // );

              // await Approval.updateMany(
              //   {
              //     "approvalAuthourities.approvalAuthRole": userData.roles[0],
              //     "approvalAuthourities.approvalAuthName":
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //   },
              //   {
              //     $set: {
              //       ...(userData.profile && {
              //         "approvalAuthourities.$.approvalAuthName": `${userData.profile.firstname} ${userData.profile.lastname}`,
              //         "approvalAuthourities.$.approvalAuthMobile":
              //           userData.profile.mobile,
              //         "approvalAuthourities.$.approvalAuthEmail":
              //           userData.profile.email,
              //       }),
              //     },
              //   }
              // );

              const admin = await getAdmin();
              const seniorManager = await getSeniorManager(
                userData.profile.centerName
              );
              const headLivelihood = await getHeadLivelihood();
              const headCSR = await getHeadCSR();

              // Define notifications
              const notificationsMap = {
                "center-incharge": [
                  createNotificationPayload(
                    "User Management - Edit User",
                    userData,
                    seniorManager,
                    "senior-manager",
                    changedFields
                  ),
                  createNotificationPayload(
                    "User Management - Edit User",
                    userData,
                    headLivelihood,
                    "head-livelihood",
                    changedFields
                  ),
                  createNotificationPayload(
                    "User Management - Edit User",
                    userData,
                    headCSR,
                    "head-csr",
                    changedFields
                  ),
                ],
                "senior-manager": [
                  createNotificationPayload(
                    "User Management - Edit User",
                    userData,
                    headLivelihood,
                    "head-livelihood",
                    changedFields
                  ),
                  createNotificationPayload(
                    "User Management - Edit User",
                    userData,
                    headCSR,
                    "head-csr",
                    changedFields
                  ),
                ],
                "head-livelihood": [
                  createNotificationPayload(
                    "User Management - Edit User",
                    userData,
                    headCSR,
                    "head-csr",
                    changedFields
                  ),
                ],
              };

              // Send notifications based on role
              if (notificationsMap[roles]) {
                for (const notification of notificationsMap[roles]) {
                  const result = await sendNotification(notification);
                  console.log(
                    `Notification sent to ${notification.toUserRole}:`,
                    result
                  );
                }
              }

              // Notify the user themselves
              const userNotificationValues = createNotificationPayload(
                "User Management - Edit User",
                userData,
                userData,
                userData.roles[0],
                changedFields
              );
              await sendNotification(userNotificationValues);

              // Notify the admin
              const adminNotification = createNotificationPayload(
                "User Management - Edit User",
                userData,
                admin,
                "admin",
                changedFields
              );
              await sendNotification(adminNotification);

              // const admin = await getAdmin();
              // const seniorManager = await getSeniorManager(
              //   userData.profile.centerName
              // );
              // const headLivelihood = await getHeadLivelihood();
              // const headCSR = await getHeadCSR();

              // let userNotificationValues = {
              //   event: "User Management - Edit User",
              //   toUser_id: userData._id.toString(),
              //   toEmail: userData.profile.email,
              //   toMobileNumber:
              //     user.profile.isdCode +
              //     userData.profile.mobile.replace(/\s+/g, ""),
              //   toUserRole: user.roles[0],
              //   userDetails: userData,
              //   variables: {
              //     UserName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     ClientName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     email: userData.profile.email,
              //     mobile: userData.profile.mobile,
              //     role: userData.roles[0],
              //     centerName: userData.profile.centerName,
              //     Date: moment
              //       .tz(new Date(), "Asia/Kolkata")
              //       .format("MMMM Do YYYY, h:mm:ss a"),
              //     ChangedFields: changedFields.join(", "), // Include changed fields in the notification
              //   },
              // };
              // var send_notification_to_user = await sendNotification(
              //   userNotificationValues
              // );
              // console.log(
              //   "send_notification_to_user",
              //   send_notification_to_user
              // );

              // let adminNotification = {
              //   event: "User Management - Edit User",
              //   toUser_id: admin?._id?.toString(),
              //   toEmail: admin?.profile.email,
              //   toMobileNumber: admin.profile.isdCode + admin.profile.mobile,
              //   toUserRole: "admin",
              //   userDetails: admin,
              //   variables: {
              //     UserName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     ClientName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     email: userData.profile.email,
              //     role: userData.roles[0],
              //     createdAt: moment
              //       .tz(new Date(), "Asia/Kolkata")
              //       .format("MMMM Do YYYY, h:mm:ss a"),
              //     ChangedFields: changedFields.join(", "),
              //   },
              // };
              // var send_notification_to_Admin = await sendNotification(
              //   adminNotification
              // );
              // console.log(
              //   "send_notification_to_SA",
              //   send_notification_to_Admin
              // );

              // console.log("senior Manager email", seniorManager);

              // let seniorManagerNotification = {
              //   event: "User Management - Edit User",
              //   toUser_id: seniorManager?._id?.toString(),
              //   toEmail: seniorManager?.profile.email,
              //   toMobileNumber:
              //     seniorManager.profile.isdCode + seniorManager.profile.mobile,
              //   toUserRole: "senior-manager",
              //   userDetails: seniorManager,
              //   variables: {
              //     UserName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     ClientName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     email: user.profile.email,
              //     role: userData.roles[0],
              //     createdAt: moment
              //       .tz(new Date(), "Asia/Kolkata")
              //       .format("MMMM Do YYYY, h:mm:ss a"),
              //     ChangedFields: changedFields.join(", "),
              //   },
              // };

              // let headLivelihoodNotification = {
              //   event: "User Management - Edit User",
              //   toUser_id: headLivelihood?._id?.toString(),
              //   toEmail: headLivelihood.profile.email,
              //   toMobileNumber:
              //     headLivelihood.profile.isdCode +
              //     headLivelihood?.profile.mobile,
              //   toUserRole: "head-livelihood",
              //   userDetails: headLivelihood,
              //   variables: {
              //     UserName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     ClientName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     email: userData.profile.email,
              //     role: userData.roles[0],
              //     createdAt: moment
              //       .tz(new Date(), "Asia/Kolkata")
              //       .format("MMMM Do YYYY, h:mm:ss a"),
              //     ChangedFields: changedFields.join(", "),
              //   },
              // };

              // var headCSRNotification = {
              //   event: "User Management - Edit User",
              //   toUser_id: headCSR._id?.toString(),
              //   toEmail: headCSR.profile.email,
              //   toMobileNumber:
              //     headCSR.profile.isdCode + headCSR.profile.mobile,
              //   toUserRole: "head-csr",
              //   userDetails: headCSR,
              //   variables: {
              //     UserName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     ClientName:
              //       userData.profile.firstname +
              //       " " +
              //       userData.profile.lastname,
              //     email: userData.profile.email,
              //     role: userData.roles[0],
              //     createdAt: moment
              //       .tz(new Date(), "Asia/Kolkata")
              //       .format("MMMM Do YYYY, h:mm:ss a"),
              //     ChangedFields: changedFields.join(", "),
              //   },
              // };

              // if (roles === "center-incharge") {
              //   var send_notification_to_Senior_Manager =
              //     await sendNotification(seniorManagerNotification);
              //   console.log(
              //     "send_notification_to_SM",
              //     send_notification_to_Senior_Manager
              //   );

              //   var send_notification_to_Head_Livelihood =
              //     await sendNotification(headLivelihoodNotification);
              //   console.log(
              //     "send_notification_to_HL",
              //     send_notification_to_Head_Livelihood
              //   );

              //   var send_notification_to_headCSR = await sendNotification(
              //     headCSRNotification
              //   );
              // }

              // if (roles === "senior-manager") {
              //   var send_notification_to_Head_Livelihood =
              //     await sendNotification(headLivelihoodNotification);
              //   console.log(
              //     "send_notification_to_HL",
              //     send_notification_to_Head_Livelihood
              //   );

              //   var send_notification_to_headCSR = await sendNotification(
              //     headCSRNotification
              //   );
              // }

              // if (roles === "head-livelihood") {
              //   var send_notification_to_headCSR = await sendNotification(
              //     headCSRNotification
              //   );
              // }

              res.status(200).json("USER_UPDATED");
            } else {
              res.status(200).json({
                updated: false,
                message: "USER_NOT_UPDATED",
              });
              // res.status(401).status("USER_NOT_UPDATED")
            }
          })
          .catch((err) => {
            console.log("err in updating", err);
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      console.log("err in updating 2", err);
      res.status(500).json({
        error: err,
      });
    });
};

function createNotificationPayload(
  event,
  userData,
  recipient,
  role,
  changedFields
) {
  return {
    event: event,
    toUser_id: recipient?._id?.toString(),
    toEmail: recipient?.profile?.email,
    toMobileNumber: recipient?.profile?.mobile,
    toUserRole: role,
    userDetails: recipient,
    variables: {
      UserName: userData.profile.firstname + " " + userData.profile.lastname,
      ClientName: userData.profile.firstname + " " + userData.profile.lastname,
      email: userData.profile.email,
      mobile: userData.profile.mobile,
      role: userData.roles[0],
      createdAt: moment
        .tz(new Date(), "Asia/Kolkata")
        .format("MMMM Do YYYY, h:mm:ss a"),
      ChangedFields: changedFields.join(", "),
    },
  };
}
//shaavi - PB added specific user for Shaavi --ends

function getAdmin() {
  return new Promise((resolve, reject) => {
    User.findOne({ roles: { $in: ["admin"] } })
      .then((admin) => {
        // console.log("SUPERR ADMIN DETAILSSS",superAdmin)
        if (admin) {
          resolve(admin);
        } else {
          resolve(0);
        }
      })
      .catch((err) => {
        reject(0);
      });
  });
}

async function getSeniorManager(centerName) {
  try {
    // Find the center by name
    const center = await Centers.findOne({ centerName: centerName });

    // Handle case where the center does not exist or has no senior manager assigned
    console.log("center", center);

    if (!center || !center.seniorManagerDetails) {
      console.error("Center or senior manager details not found");
      return 0; // No senior manager assigned
    }

    // Find the user associated with the senior manager
    const user = await User.findOne({
      "profile.email": center.seniorManagerDetails.email,
    });

    // Handle case where user is not found
    if (!user) {
      console.error("Senior Manager user not found");
      return 0;
    }

    // Return the user details
    return user;
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching senior manager:", error);
    return 0; // Return 0 in case of an error
  }
}

function getHeadLivelihood() {
  return new Promise((resolve, reject) => {
    User.findOne({ roles: { $in: ["head-livelihood"] } })
      .then((headLivelihood) => {
        // console.log("SUPERR ADMIN DETAILSSS",superAdmin)
        if (headLivelihood) {
          resolve(headLivelihood);
        } else {
          resolve(0);
        }
      })
      .catch((err) => {
        reject(0);
      });
  });
}

function getHeadCSR() {
  return new Promise((resolve, reject) => {
    User.findOne({ roles: { $in: ["head-csr"] } })
      .then((headCSR) => {
        // console.log("SUPERR ADMIN DETAILSSS",superAdmin)
        if (headCSR) {
          resolve(headCSR);
        } else {
          resolve(0);
        }
      })
      .catch((err) => {
        reject(0);
      });
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.user_signup_admin = (req, res, next) => {
  if (req.body.email && req.body.pwd) {
    User.find({ emails: { $elemMatch: { address: req.body.email } } })
      .exec()
      .then((user) => {
        if (user.length > 0) {
          return res.status(409).json({
            message: "Email Id already exits.",
          });
        } else {
          bcrypt.hash(req.body.pwd, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
                services: {
                  password: {
                    bcrypt: hash,
                  },
                },
                username: req.body.email,
                emails: [
                  {
                    address: req.body.email,
                    verified: true,
                  },
                ],
                profile: {
                  firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  fullName: req.body.firstname + " " + req.body.lastname,
                  emailId: req.body.email,
                  mobile: req.body.mobile,
                  createdOn: new Date(),
                  status: "active",
                },
                roles: [req.body.role],
              });
              if (!req.body.firstname) {
                user.profile.fullName = req.body.fullName;
              }
              user
                .save()
                .then((result) => {
                  res.status(201).json({
                    message: "USER_CREATED",
                    ID: result._id,
                  });
                })
                .catch((err) => {
                  res.status(500).json({
                    error: err,
                  });
                });
            }
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  } else {
    res.status(200).json({ message: "Email and pwd are mandatory" });
  }
};

exports.user_signup_user = (req, res, next) => {
  // console.log("user_signup_user req.body = ", req.body);
  if (req.body.role && req.body.email && req.body.pwd) {
    User.find({ emails: { $elemMatch: { address: req.body.email } } })
      .exec()
      .then((user) => {
        if (user.length > 0) {
          return res.status(409).json({
            message: "Email Id already exits.",
          });
        } else {
          bcrypt.hash(req.body.pwd, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
                createdBy: req.body.createdBy,
                services: {
                  password: {
                    bcrypt: hash,
                  },
                },
                username: req.body.email,
                emails: [
                  {
                    address: req.body.email,
                    verified: true,
                  },
                ],
                profile: {
                  firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  fullName: req.body.firstname + " " + req.body.lastname,
                  emailId: req.body.email,
                  mobNumber: req.body.mobNumber,
                  createdOn: new Date(),
                  status: req.body.status,
                },
                roles: [req.body.role],
              });
              if (!req.body.firstname) {
                user.profile.fullName = req.body.fullName;
              }
              user
                .save()
                .then((result) => {
                  res.status(201).json({
                    message: "User created",
                    ID: result._id,
                  });
                })
                .catch((err) => {
                  res.status(500).json({
                    error: err,
                  });
                });
            }
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  } else {
    res.status(200).json({ message: "Email , pwd and Role are mandatory" });
  }
};

exports.user_signup_user_email_otp = (req, res, next) => {
  if (req.body.role && req.body.email && req.body.pwd) {
    User.find({ emails: { $elemMatch: { address: req.body.email } } })
      .exec()
      .then((user) => {
        if (user.length > 0) {
          return res.status(409).json({
            message: "Email Id already exits.",
          });
        } else {
          bcrypt.hash(req.body.pwd, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              User.find({ roles: "user" })
                .countDocuments()
                .exec()
                .then((countuser) => {
                  var emailOTP = getRandomInt(1000, 9999);
                  if (emailOTP) {
                    const user = new User({
                      _id: new mongoose.Types.ObjectId(),
                      createdAt: new Date(),
                      createdBy: req.body.createdBy,
                      services: {
                        password: {
                          bcrypt: hash,
                        },
                      },
                      username: req.body.email,
                      emails: [
                        {
                          address: req.body.email,
                          verified: true,
                        },
                      ],
                      profile: {
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        fullName: req.body.firstname + " " + req.body.lastname,
                        emailId: req.body.email,
                        mobNumber: req.body.mobNumber,
                        createdOn: new Date(),
                        optEmail: emailOTP,
                        status: req.body.status,
                        clientId: "WL" + (countuser + 1),
                      },
                      roles: [req.body.role],
                    });
                    if (!req.body.firstname) {
                      user.profile.fullName = req.body.fullName;
                    }
                    user
                      .save()
                      .then((result) => {
                        if (result) {
                          request({
                            method: "POST",
                            url:
                              "http://localhost:" +
                              globalVariable.port +
                              "/send-email",
                            body: {
                              email: req.body.email,
                              subject:
                                "Successfully Creation of your Account on Pipito",
                              text:
                                "Dear " +
                                result.profile.fullName +
                                "Your OTP is " +
                                emailOTP,
                            },
                            json: true,
                            headers: {
                              "User-Agent": "Test Agent",
                            },
                          })
                            .then((source) => {
                              res.status(201).json({
                                message: "USER__CREATED",
                                ID: result._id,
                              });
                            })
                            .catch((err) => {
                              res.status(500).json({
                                error: err,
                              });
                            });
                        } else {
                          res.status(200).json({ message: "USER_NOT_CREATED" });
                        }
                      })
                      .catch((err) => {
                        res.status(500).json({
                          error: err,
                        });
                      });
                  }
                })
                .catch((err) => {
                  res.status(500).json({
                    error: err,
                  });
                });
            }
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  } else {
    res.status(200).json({ message: "Email , pwd and Role are mandatory" });
  }
};

exports.user_login = (req, res, next) => {
  // console.log("Inside user_login");
  User.findOne({ emails: { $elemMatch: { address: req.body.email } } })
    .exec()
    .then((user) => {
      if (user) {
        var pwd = user.services.password.bcrypt;
        if (pwd) {
          bcrypt.compare(req.body.password, pwd, (err, result) => {
            if (err || !result) {
              return res.status(401).json({
                message: "Auth failed",
              });
            }
            if (result) {
              const token = jwt.sign(
                {
                  email: req.body.email,
                  userId: user._id,
                },
                globalVariable.JWT_KEY,
                {
                  expiresIn: "365d",
                }
              );
              User.updateOne(
                { emails: { $elemMatch: { address: req.body.email } } },
                {
                  $push: {
                    "services.resume.loginTokens": {
                      loginTimeStamp: new Date(),
                      hashedToken: token,
                      logoutTimeStamp: null,
                    },
                  },
                }
              )
                .exec()
                .then((updateUser) => {
                  if (updateUser.modifiedCount == 1) {
                    //===========================================================
                    //====  Change Done by Ashish Naik ==========================
                    // After login, send Company ID and Location ID of User
                    // So at the time of creation of User, we must have
                    // companyID & locationID available for each user.
                    // From Org-Setting form, we can get these things for Admin.
                    // We need to check into Entity master
                    // where CompanyID & LocID are available
                    //===========================================================

                    const companyID = "";
                    const locID = "";
                    if (user.companyID) {
                      companyID = user.companyID;
                    } else {
                      companyID = 0;
                    }

                    if (user.locID) {
                      locID = user.locID;
                    } else {
                      locID = 0;
                    }

                    res.status(200).json({
                      message: "Auth successful",
                      token: token,
                      ID: user._id,
                      companyID: companyID,
                      locID: locID,
                    });
                  } else {
                    return res.status(401).json({
                      message: "Auth failed",
                    });
                  }
                })
                .catch((err) => {
                  res.status(500).json(err);
                });
            }
          });
        } else {
          res.status(409).status({ message: "Password not found" });
        }
      } else {
        res.status(409).status({ message: "User Not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.admin_login = (req, res, next) => {
  User.findOne({
    emails: { $elemMatch: { address: req.body.email } },
    roles: ["admin"],
  })
    .exec()
    .then((user) => {
      if (user != null && user != undefined) {
        var pwd = user.services.password.bcrypt;
        if (pwd) {
          bcrypt.compare(req.body.password, pwd, (err, result) => {
            if (err || !result) {
              return res.status(401).json({
                message: "Auth failed",
              });
            }
            if (result) {
              const token = jwt.sign(
                {
                  email: req.body.email,
                  userId: user._id,
                },
                globalVariable.JWT_KEY,
                {
                  expiresIn: "1h",
                }
              );
              User.updateOne(
                { emails: { $elemMatch: { address: req.body.email } } },
                {
                  $push: {
                    "services.resume.loginTokens": {
                      loginTimeStamp: new Date(),
                      hashedToken: token,
                      logoutTimeStamp: null,
                    },
                  },
                }
              )
                .exec()
                .then((updateUser) => {
                  if (updateUser.modifiedCount == 1) {
                    //===========================================================
                    //====  Change Done by Ashish Naik ==========================
                    // After login, send Company ID and Location ID of User
                    // So at the time of creation of User, we must have
                    // companyID & locationID available for each user.
                    // From Org-Setting form, we can get these things for Admin.
                    // We need to check into Entity master
                    // where CompanyID & LocID are available
                    //===========================================================

                    const companyID = "";
                    const locID = "";
                    if (user.companyID) {
                      companyID = user.companyID;
                    } else {
                      companyID = 0;
                    }

                    if (user.locID) {
                      locID = user.locID;
                    } else {
                      locID = 0;
                    }

                    res.status(200).json({
                      message: "Auth successful",
                      token: token,
                      ID: user._id,
                      companyID: companyID,
                      locID: locID,
                    });
                  } else {
                    return res.status(401).json({
                      message: "Auth failed",
                    });
                  }
                })
                .catch((err) => {
                  res.status(500).json(err);
                });
            }
          });
        } else {
          res.status(409).status({ message: "Password not found" });
        }
      } else {
        res
          .status(409)
          .status({ message: "User Not found Or User is not a admin" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_update_name_mobile1 = (req, res, next) => {
  // console.log("update", req.body);
  const roles = [];
  if (req.body.role) {
    roles.push(req.body.role);
  }

  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      // console.log("useruseruser",user.profile.email)
      if (user) {
        // if(user.email == req.body.email){
        //   false
        // }
        // else{
        //   true
        // }
        // if
        User.updateOne(
          { _id: req.params.ID },
          {
            $set: {
              username: req.body.email ? req.body.email : user.username,
              profile: {
                firstname: req.body.firstname
                  ? req.body.firstname
                  : user.profile.firstname,
                lastname: req.body.lastname
                  ? req.body.lastname
                  : user.profile.lastname,
                fullName:
                  req.body.firstname && req.body.lastname
                    ? req.body.firstname + " " + req.body.lastname
                    : user.profile.firstname + "" + user.profile.lastname,
                email: req.body.email ? req.body.email : user.profile.email,
                centerName: req.body.centerName
                  ? req.body.centerName
                  : user.profile.centerName,
                mobile: req.body.mobNumber
                  ? req.body.mobNumber
                  : user.profile.mobile,
                createdOn: new Date(),
                optEmail: 0,
                status: req.body.status ? req.body.status : user.profile.status,
                // 'clientId'   : "WL"+(countuser+1),
              },
              roles: ["user"],
            },
          }
        )
          .exec()
          .then((data) => {
            // console.log("Update Profile data ====>>>",data);
            if (data.modifiedCount == 1) {
              res.status(200).json("USER_UPDATED");
            } else {
              res.status(200).json({
                updated: false,
                message: "USER_NOT_UPDATED",
              });
              // res.status(401).status("USER_NOT_UPDATED")
            }
          })
          .catch((err) => {
            console.log(" user_update_name_mobile err 1", err);
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      console.log(" user_update_name_mobile err 2", err);

      res.status(500).json({
        error: err,
      });
    });
};

exports.user_update_name_mobile = (req, res, next) => {
  // console.log("update", req.body);
  const roles = [];
  if (req.body.role) {
    roles.push(req.body.role);
  }
  var role = req.body.role ? req.body.role : "user";
  var mobile = req.body.mobNumber ? req.body.mobNumber : req.body.mobile;
  // console.log("MOBILE", mobile);

  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      if (user) {
        // console.log("user",user);
        if (req.body.email && req.body.email !== user.profile.email) {
          // Check if the provided email is different from the current user's email
          User.findOne({ "profile.email": req.body.email })
            .exec()
            .then((existingUser) => {
              if (existingUser) {
                // console.log("inside 409 ", res.status);
                res.status(200).json("Email already exists"); // Send a 409 Conflict status for duplicate email
              } else {
                // Update the user's data

                User.updateOne(
                  { _id: req.params.ID },
                  {
                    $set: {
                      username: req.body.email ? req.body.email : user.username,
                      profile: {
                        firstname: req.body.firstname
                          ? req.body.firstname
                          : user.profile.firstname,
                        lastname: req.body.lastname
                          ? req.body.lastname
                          : user.profile.lastname,
                        fullName:
                          req.body.firstname && req.body.lastname
                            ? req.body.firstname + " " + req.body.lastname
                            : user.profile.firstname +
                              "" +
                              user.profile.lastname,
                        email: req.body.email
                          ? req.body.email
                          : user.profile.email,
                        mobile: mobile ? mobile : user.profile.mobile,
                        centerName: req.body.centerName
                          ? req.body.centerName
                          : user.profile.centerName,
                        createdOn: new Date(),
                        optEmail: 0,
                        status: req.body.status
                          ? req.body.status
                          : user.profile.status,
                        // 'clientId'   : "WL"+(countuser+1),
                      },
                      roles: [role],
                    },
                  }
                )
                  .exec()
                  .then((data) => {
                    if (data.modifiedCount == 1) {
                      res.status(200).json("USER_UPDATED");
                    } else {
                      res.status(200).json({
                        updated: false,
                        message: "USER_NOT_UPDATED",
                      });
                    }
                  })
                  .catch((err) => {
                    console.log(" user_update_name_mobile err 1", err);
                    res.status(500).json({ error: err });
                  });
              }
            })
            .catch((err) => {
              console.log("Error finding existing user by email", err);
              res.status(500).json({ error: err });
            });
        } else {
          // console.log("Inside else");
          // If email is not being updated or is the same, proceed with the update directly
          User.updateOne(
            { _id: req.params.ID },
            {
              $set: {
                username: req.body.email ? req.body.email : user.username,
                profile: {
                  firstname: req.body.firstname
                    ? req.body.firstname
                    : user.profile.firstname,
                  lastname: req.body.lastname
                    ? req.body.lastname
                    : user.profile.lastname,
                  fullName:
                    req.body.firstname && req.body.lastname
                      ? req.body.firstname + " " + req.body.lastname
                      : user.profile.firstname + "" + user.profile.lastname,
                  email: req.body.email ? req.body.email : user.profile.email,
                  mobile: mobile ? mobile : user.profile.mobile,
                  centerName: req.body.centerName
                    ? req.body.centerName
                    : user.profile.centerName,
                  createdOn: new Date(),
                  optEmail: 0,
                  status: req.body.status
                    ? req.body.status
                    : user.profile.status,
                  // 'clientId'   : "WL"+(countuser+1),
                },
                roles: role,
              },
            }
          )
            .exec()
            .then((data) => {
              if (data.modifiedCount == 1) {
                res.status(200).json("USER_UPDATED");
              } else {
                res.status(200).json({
                  updated: false,
                  message: "USER_NOT_UPDATED",
                });
              }
            })
            .catch((err) => {
              console.log(" user_update_name_mobile err 1", err);
              res.status(500).json({ error: err });
            });
        }
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      console.log(" user_update_name_mobile err 2", err);
      res.status(500).json({ error: err });
    });
};

//amit===================
exports.user_update_name_mobile_profile = (req, res, next) => {
  // console.log("req.body", req.body);
  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      if (user) {
        User.updateOne(
          { _id: req.params.ID },
          {
            $set: {
              "profile.firstname": req.body.firstname,
              "profile.lastname": req.body.lastname,
              "profile.fullName": req.body.firstname + " " + req.body.lastname,
              "profile.mobile": req.body.mobNumber,
              // "profile.image": req.body.image,
              "profile.center_id": req.body.center_id,
              "profile.centerName": req.body.centerName,
              "profile.lastname": req.body.lastname,
              "profile.email": req.body.email,
              department: req.body.department,
              orgLevel: req.body.orgLevel,
              designation: req.body.designation,
              reporting_id: req.body.reporting_id,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data.modifiedCount == 1) {
              res.status(200).json("USER_UPDATED");
            } else {
              res.status(200).json({
                updated: false,
                message: "USER_NOT_UPDATED",
              });
              // res.status(401).status("USER_NOT_UPDATED")
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_update_name_mobile_profile = (req, res, next) => {
  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      if (user) {
        User.updateOne(
          { _id: req.params.ID },
          {
            $set: {
              "profile.firstname": req.body.firstname,
              "profile.lastname": req.body.lastname,
              "profile.fullName": req.body.firstname + " " + req.body.lastname,
              "profile.mobile": req.body.mobNumber,
              "profile.image": req.body.image,
              role: req.body.role,
              "profile.email": req.body.email,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data.modifiedCount == 1) {
              res.status(200).json("USER_UPDATED");
            } else {
              res.status(200).json({
                updated: false,
                message: "USER_NOT_UPDATED",
              });
              // res.status(401).status("USER_NOT_UPDATED")
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

//=================================
exports.user_update_status = (req, res, next) => {
  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      if (user) {
        User.updateOne(
          { _id: req.params.ID },
          {
            $set: {
              "profile.status": req.body.status,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data.modifiedCount == 1) {
              User.updateOne(
                { _id: req.params.ID },
                {
                  $push: {
                    statusLog: [
                      {
                        status: req.body.status,
                        updatedAt: new Date(),
                        updatedBy: req.body.username,
                      },
                    ],
                  },
                }
              )
                .exec()
                .then((data) => {
                  res.status(200).json("USER_STATUS_UPDATED");
                });
            } else {
              res.status(200).json("USER_STATUS_NOT_UPDATED");
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(200).json("User Not Found");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_update_delete_status = (req, res, next) => {
  // console.log("*******&&&&&&&&&**************",req.body);
  // console.log("req.body.user_id_tobedeleted==>",req.body.user_id_tobedeleted);
  User.findOne({ _id: req.body.user_id_tobedeleted })
    .exec()
    .then((user) => {
      if (user) {
        // console.log("req.user==>",user);
        // var newstatus = "";
        // if (user.profile.status === "active") {
        //   newstatus = "deleted-active";
        // }
        // if (user.profile.status === "blocked") {
        //   newstatus = "deleted-blocked";
        // }
        // if (user.profile.status === "unverified") {
        //   newstatus = "deleted-unverified";
        // }
        // if (user.profile.status === "inactive") {
        //   newstatus = "deleted-inactive";
        // }

        var newstatus = "deleted";
        User.updateOne(
          { _id: req.body.user_id_tobedeleted },
          {
            $set: {
              "profile.status": newstatus,
            },
          }
        )
          .exec()
          .then((data) => {
            // console.log("RESPONSE.data==>",data);
            if (data.modifiedCount == 1) {
              User.updateOne(
                { _id: req.body.user_id_tobedeleted },
                {
                  $push: {
                    statusLog: [
                      {
                        status: newstatus,
                        updatedAt: new Date(),
                        updatedBy: req.body.updatedBy,
                      },
                    ],
                  },
                }
              )
                .exec()
                .then((data) => {
                  res.status(200).json("USER_SOFT_DELETED");
                });
            } else {
              res.status(200).json("USER_NOT_DELETED");
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(200).json("User Not Found");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_update_recover_status = (req, res, next) => {
  User.findOne({ _id: req.body.user_id_toberecover })
    .exec()
    .then((user) => {
      if (user) {
        var newstatus = "inactive";
        // var newstatus = "";
        // if (user.profile.status === "deleted-active") {
        //   newstatus = "active";
        // }
        // if (user.profile.status === "deleted-blocked") {
        //   newstatus = "blocked";
        // }
        // if (user.profile.status === "deleted-unverified") {
        //   newstatus = "unverified";
        // }
        // if (user.profile.status === "deleted-inactive") {
        //   newstatus = "inactive";
        // }
        User.updateOne(
          { _id: req.body.user_id_toberecover },
          {
            $set: {
              "profile.status": newstatus,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data.modifiedCount == 1) {
              User.updateOne(
                { _id: req.body.user_id_toberecover },
                {
                  $push: {
                    statusLog: [
                      {
                        status: newstatus,
                        updatedAt: new Date(),
                        updatedBy: req.body.updatedBy,
                      },
                    ],
                  },
                }
              )
                .exec()
                .then((data) => {
                  res.status(200).json("USER_SOFT_DELETED");
                });
            } else {
              res.status(200).json("USER_NOT_DELETED");
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(200).json("User Not Found");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_update_many_status = (req, res, next) => {
  var userID = req.body?.userID;
  // console.log("userID", userID);
  // var userIDs = userID?.map((a, i) => ObjectID(a));
  // console.log("userIDs",userIDs)
  User.updateMany(
    { _id: { $in: userID } },
    {
      $set: {
        "profile.status": req.body.status,
      },
    }
  )
    .exec()
    .then((data) => {
      // console.log("data", data);
      if (data.modifiedCount != 0) {
        User.findOneAndUpdate(
          { _id: { $in: userID } },
          {
            $push: {
              statusLog: [
                {
                  status: req.body.status,
                  updatedAt: new Date(),
                  updatedBy: req.body.username,
                },
              ],
            },
          }
        )
          .exec()
          .then(async (user) => {
            // console.log("user", user);
            if (req.body.status === "active") {
              var userNotificationValues = {
                event: "User Management - User Activated",
                toUser_id: user._id.toString(),
                toEmail: user.profile.email,
                toMobileNumber: user.profile.isdCode + user.profile.mobile,
                toUserRole: user.roles[0],
                userDetails: user,
                variables: {
                  userName:
                    user.profile.firstname + " " + user.profile.lastname,
                  supportEmail: "support@lupin.com",
                },
              };
              var send_notification_to_user = await sendNotification(
                userNotificationValues
              );
              // console.log(
              //   "send_notification_to_user",
              //   send_notification_to_user
              // );
            } else if (req.body.status === "inactive") {
              var userNotificationValues = {
                event: "User Management - User Inactivated",
                toUser_id: user._id.toString(),
                toEmail: user.profile.email,
                toMobileNumber: user.profile.isdCode + user.profile.mobile,
                toUserRole: user.roles[0],
                userDetails: user,
                variables: {
                  userName:
                    user.profile.firstname + " " + user.profile.lastname,
                  supportEmail: "support@lupin.com",
                },
              };
              var send_notification_to_user = await sendNotification(
                userNotificationValues
              );
              // console.log(
              //   "send_notification_to_user",
              //   send_notification_to_user
              // );
            }
            res.status(200).json("USER_STATUS_UPDATED");
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(200).json("USER_STATUS_NOT_UPDATED");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.user_update_many_role = (req, res, next) => {
  // console.log("Request Bodyyyyyyyyyyyyyyyy:", req.body);

  if (req.body.action === "add") {
    User.find({ _id: { $in: req.body.userID } })
      .exec()
      .then((users) => {
        let roleExists = false;

        users.forEach((user) => {
          if (user.roles.includes(req.body.role)) {
            roleExists = true;
          }
        });

        if (roleExists) {
          // console.log("Role already exists");
          res.status(200).json("USER_ROLE_ALREADY_EXISTS");
        } else {
          const query = {
            $push: {
              roles: req.body.role,
            },
          };

          User.updateMany({ _id: { $in: req.body.userID } }, query)
            .exec()
            .then((data) => {
              // console.log("DATA:", data);
              if (data.modifiedCount > 0) {
                User.updateOne(
                  { _id: { $in: req.body.userID } },
                  {
                    $push: {
                      statusLog: [
                        {
                          status: req.body.status,
                          updatedAt: new Date(),
                          updatedBy: req.body.username,
                        },
                      ],
                    },
                  }
                )
                  .exec()
                  .then((datas) => {
                    // console.log("data2:", datas);
                    res.status(200).json("USER_ROLE_UPDATED");
                  });
              } else {
                res.status(200).json("USER_ROLE_NOT_UPDATED");
              }
            })
            .catch((err) => {
              res.status(500).json({
                error: err,
              });
            });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  } else if (req.body.action === "remove") {
    const query = {
      $pull: {
        roles: req.body.role,
      },
    };

    User.updateMany({ _id: { $in: req.body.userID } }, query)
      .exec()
      .then((data) => {
        // console.log("DATA:", data);
        if (data.modifiedCount > 0) {
          User.updateOne(
            { _id: { $in: req.body.userID } },
            {
              $push: {
                statusLog: [
                  {
                    status: req.body.status,
                    updatedAt: new Date(),
                    updatedBy: req.body.username,
                  },
                ],
              },
            }
          )
            .exec()
            .then((datas) => {
              // console.log("data2:", datas);
              res.status(200).json("USER_ROLE_UPDATED");
            });
        } else {
          res.status(200).json("USER_ROLE_NOT_UPDATED");
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};

// exports.user_update_many_role = (req, res, next) => {
//   // console.log("req.body", req.body);
//   // var userID = req.body.userID?.map((a, i) => ObjectID(a));
//   // console.log("userID", userID);
//   if (req.body.action === "add") {
//     var query = {
//       $push: {
//         roles: req.body.role,
//       },
//     };
//   } else if (req.body.action === "remove") {
//     var query = {
//       $pull: {
//         roles: req.body.role,
//       },
//     };
//   }
//   console.log("query", query);
//   // var selector = {
//   //   _id: { $in: req.body.userID },
//   //   roles: req.body.role,
//     // roles: { $in:[req.body.role]},
//   // };
//   // User.find({ selector })
//   //   .exec()
//   //   .then((user) => {
//   //     console.log("user", user);
//   //     if (user.length > 0) {
//   //       console.log("USER_ROLE_ALREADY_EXISTS");
//   //       res.status(200).json("USER_ROLE_ALREADY_EXISTS");
//   //     } else {
//         User.updateMany({ _id: { $in: req.body.userID } }, query)
//           .exec()
//           .then((data) => {
//             if (data.modifiedCount > 0) {
//               User.updateOne(
//                 { _id: { $in: req.body.userID } },
//                 {
//                   $push: {
//                     statusLog: [
//                       {
//                         status: req.body.status,
//                         updatedAt: new Date(),
//                         updatedBy: req.body.username,
//                       },
//                     ],
//                   },
//                 }
//               )
//                 .exec()
//                 .then((datas) => {
//                   console.log("data2", datas);
//                   res.status(200).json("USER_ROLE_UPDATED");
//                 });
//             } else {
//               res.status(200).json("USER_ROLE_NOT_UPDATED");
//             }
//           })
//           .catch((err) => {
//             res.status(500).json({
//               error: err,
//             });
//           });
//     //   }
//     // })
//     // .catch((err) => {
//     //   res.status(500).json({
//     //     error: err,
//     //   });
//     // });
// };

exports.user_update_role = (req, res, next) => {
  switch (req.params.action) {
    case "assign":
      User.findOne({ _id: req.params.ID, roles: req.body.role })
        .exec()
        .then((data) => {
          if (data) {
            res.status(200).json("USER_ROLE_ASSIGNED");
          } else {
            User.updateOne(
              { _id: req.params.ID },
              {
                $push: {
                  roles: req.body.role,
                },
              }
            )
              .exec()
              .then((data) => {
                if (data.modifiedCount == 1) {
                  res.status(200).json("USER_ROLE_ASSIGNED");
                } else {
                  res.status(401).json("USER_ROLE_NOT_ASSIGNED");
                }
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              });
          }
        })
        .catch((err) => {
          res.status(500).json({
            error: err,
          });
        });
      break;
    case "remove":
      User.findOne({ _id: req.params.ID })
        .exec()
        .then((data) => {
          if (data.roles.length == 1) {
            res.status(200).json("USER_ROLE_ASSIGNED");
          } else {
            User.updateOne(
              { _id: req.params.ID },
              {
                $pull: {
                  roles: req.body.role,
                },
              }
            )
              .exec()
              .then((data) => {
                if (data.modifiedCount == 1) {
                  res.status(200).json("USER_ROLE_REMOVED");
                } else {
                  res.status(401).json("USER_ROLE_NOT_REMOVED");
                }
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              });
          }
        })
        .catch((err) => {
          res.status(500).json({
            error: err,
          });
        });
      break;
    default:
      res.status(200).json({ message: "INVALID_ACTION" });
  }
};

exports.user_update_password_ID = (req, res, next) => {
  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      if (user) {
        bcrypt.hash(req.body.pwd, 10, (err, hash) => {
          User.updateOne(
            { _id: req.params.ID },
            {
              $set: {
                services: {
                  password: {
                    bcrypt: hash,
                  },
                },
              },
            }
          )
            .exec()
            .then((data) => {
              console.log("reset data", data);
              if (data.modifiedCount == 1) {
                res.status(200).json("PASSWORD_RESET");
              } else {
                res.status(401).json("PASSWORD_NOT_RESET");
              }
            })
            .catch((err) => {
              res.status(500).json({
                error: err,
              });
            });
        });
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.fetch_user_ID = (req, res, next) => {
  User.findOne({ _id: req.params.ID })
    // .populate('reporting_id')
    .then((data) => {
      if (data) {
        // console.log("fetch_user_ID",data);
        var loginTokenscount = data.services.resume.loginTokens.length;
        var statuslogLength = data.statusLog ? data.statusLog.length : 0;
        // console.log("inside  fetch_user_ID ",data)
        data.logDetails =
          loginTokenscount > 0 ? data.services.resume.loginTokens : "-";
        // var userData={
        //   ...data,
        //   logDetails:
        //     loginTokenscount > 0 ? data.services.resume.loginTokens : "-",
        // }
        console.log("data", data);
        res.status(200).json(data);
      } else {
        res.status(200).json({ message: "USER_NOT_FOUND" });
      }
    })
    .catch((err) => {
      console.log("user error ", err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.fetch_user_loginDetails = (req, res, next) => {
  User.findOne({ _id: req.params.ID })
    .then((data) => {
      if (data) {
        var loginTokenscount = data.services.resume.loginTokens.length;
        data.logDetails =
          loginTokenscount > 0 ? data.services.resume.loginTokens : "-";
        console.log("inside  fetch_user_ID ", data);

        res.status(200).json({
          data: data,
          logDetails: data.logDetails,
        });
      } else {
        res.status(200).json({ message: "USER_NOT_FOUND" });
      }
    })
    .catch((err) => {
      console.log("user error ", err);
      res.status(500).json({
        error: err,
      });
    });
};

// exports.fetch_user_ID = (req,res,next)=>{
// 	console.log("inside  fetch_user_ID ",)
// 	User.findOne({_id:req.params.ID})
// 		.exec()
// 		.then(data=>{
// 			if(data){
// 				var loginTokenscount = data.services.resume.loginTokens.length;
// 				var statuslogLength = data.statusLog.length;
// 				console.log("inside  fetch_user_ID ",data)

// 				res.status(200).json({
// 					"_id"		: data._id,
// 					"firstname" : data.profile.firstname,
// 					"lastname"	: data.profile.lastname,
// 					"companyID"	: data.profile.companyID,
// 					"companyName"	: data.profile.companyName,
// 					"email"		: data.email, //Mandatory
// 					"mobile" 	: data.profile.mobile,
// 					"designation" 	: data.profile.designation,
// 					"department" 	: data.profile.department,
// 					"city" 	: data.profile.city,
// 					"states" 	: data.profile.states,
// 					"role"      : data.roles, //Mandatory
// 					"image" 	: data.profile.image,
// 					"status"	: data.profile.status, //Either "Active" or "Inactive"
// 					"fullName"	: data.profile.fullName,
// 					"createdAt" : data.createdAt,
// 					"logDetails": loginTokenscount > 0 ? data.services.resume.loginTokens: "-",

// 				});
// 			}else{
// 				res.status(200).json({message:"USER_NOT_FOUND"});
// 			}
// 		})
// 		.catch(err =>{
// 			res.status(500).json({
// 				error: err
// 			});
// 		});
// };

// exports.post_list_deleted_users = (req,res,next)=>{
// 	var companyID= req.body.companyID;
// 	if(req.body.companyID){
// 		if(companyID === 1 || (companyID === "1")){
// 			// var selector = {roles:{$ne:["admin"]}};
// 			var selector = {roles:{$ne:["admin"]}, "profile.status":{$ne:"active"}};
// 		}else{
// 			var selector = {"profile.companyID":companyID,roles:{$ne:["admin"]}};
// 		}
// 		console.log("selector", selector)
// 		User.find(selector)
// 			// .select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens statusLog")
// 			.select("profile.firstname profile.lastname profile.status  profile.fullName roles profile.email profile.mobile  createdAt services.resume.loginTokens statusLog")
// 			.sort({createdAt : -1})
// 			.skip(req.body.startRange)
// 			.limit(req.body.limitRange)
// 			.exec()
// 			.then(data=>{
// 				console.log("data1111", data)
// 				if(data){
// 					var i = 0;
// 					var returnData = [];
// 					for(i = 0 ; i < data.length ; i++){
// 						var loginTokenscount = data[i].services.resume.loginTokens.length
// 						// console.log('data in services.resume.loginTokens ==>',data[i].services.resume.loginTokens);
// 						var statuslogLength = data[i].statusLog.length
// 						returnData.push({
// 							"_id"		      : data[i]._id,
// 							"firstname"       : data[i].profile.firstname,
// 							"lastname"	      : data[i].profile.lastname,
// 							"companyID"	      : data[i].profile.companyID,
// 							"companyName"	  : data[i].profile.companyName,
// 							"email"		      : data[i].profile.email, //Mandatory
// 							"mobNumber"       : data[i].profile.mobile,
// 							"role"            : data[i].roles, //Mandatory
// 							"status"		  : data[i].profile.status, //Either "Active" or "Inactive"
// 							"fullName"	      : data[i].profile.fullName,
// 							"createdAt"       : data[i].createdAt,
// 							"clientId"	      : data[i].clientId,
// 							"lastLogin"       : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null ,
// 							"statusupdatedAt" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedAt : "-",
// 							"statusupdatedBy" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedBy : "-"

// 						});
// 					}
// 					if( i >= data.length){
// 						res.status(200).json(returnData);
// 						// console.log('returnData',returnData);
// 					}
// 				}else{
// 					res.status(200).json({message:"USER_NOT_FOUND"});
// 				}
// 			})
// 			.catch(err =>{
// 				res.status(500).json({
// 					error: err
// 				});
// 			});
// 	} //end of if condition
// 	else{
// 		res.status(500).json({
// 			message : "COMPANYID_NOT_AVAILABLE",
// 			error: err
// 		});
// 	}
// };
exports.post_list_deleted_users = async (req, res, next) => {
  try {
    const companyID = req.body.companyID;

    // Check if companyID is present in the request body
    if (!companyID) {
      return res.status(400).json({ message: "COMPANYID_NOT_AVAILABLE" });
    }

    let selector;
    if (companyID === 1 || companyID === "1") {
      selector = {
        // roles: { $ne: ["admin"] },
        "profile.status": {
          $in: [
            "deleted",
            "deleted-active",
            "deleted-blocked",
            "deleted-unverified",
            "deleted-inactive",
          ],
        },
      };
    } else {
      selector = { "profile.companyID": companyID, roles: { $ne: ["admin"] } };
    }
    // console.log("selector", selector);
    // Fetch users based on the constructed selector
    const data = await User.find(selector)
      .select(
        "profile.firstname profile.lastname profile.status profile.fullName roles profile.email profile.mobile createdAt services.resume.loginTokens statusLog"
      )
      .sort({ createdAt: -1 })
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec();
    // console.log("data", data);

    if (!data || data.length === 0) {
      return res.status(200).json({ message: "USER_NOT_FOUND" });
    }

    const returnData = data.map((user) => {
      const lastLogin =
        user.services?.resume?.loginTokens?.length > 0
          ? user.services.resume.loginTokens[
              user.services.resume.loginTokens.length - 1
            ].loginTimeStamp
          : null;

      const statusupdatedAt =
        user.statusLog?.length > 0
          ? user.statusLog[user.statusLog.length - 1].updatedAt
          : "-";

      const statusupdatedBy =
        user.statusLog?.length > 0
          ? user.statusLog[user.statusLog.length - 1].updatedBy
          : "-";

      return {
        _id: user._id,
        firstname: user.profile.firstname,
        lastname: user.profile.lastname,
        companyID: user.profile.companyID,
        companyName: user.profile.companyName,
        center_id: user.profile.center_id,
        centerName: user.profile.centerName,
        email: user.profile.email,
        mobNumber: user.profile.mobile,
        role: user.roles,
        status: user.profile.status,
        fullName: user.profile.fullName,
        createdAt: user.createdAt,
        clientId: user.clientId,
        lastLogin,
        statusupdatedAt,
        statusupdatedBy,
      };
    });
    // console.log("returnData", returnData);
    res.status(200).json(returnData);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.user_update_password_withoutotp_ID = (req, res, next) => {
  // console.log(
  //   "user_update_password_withoutotp_ID body => ",
  //   req.body,
  //   req.params.ID
  // );

  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      // console.log("user_update_password_withoutotp_ID===========>>>>>>", user);
      if (user) {
        bcrypt.hash(req.body.pwd, 10, (err, hash) => {
          User.updateOne(
            { _id: req.params.ID },
            {
              $set: {
                services: {
                  password: {
                    bcrypt: hash,
                  },
                },
              },
            }
          )
            .exec()
            .then((data) => {
              // console.log("data===========>>>>>>", data);

              if (data.modifiedCount == 1) {
                res.status(200).json("PASSWORD_RESET");
              } else {
                res.status(200).json("PASSWORD_NOT_RESET");
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                error: err,
              });
            });
        });
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      // console.log('update user status error ',err);
      res.status(500).json({
        error: err,
      });
    });
};
exports.post_list_users = (req, res, next) => {
  var companyID = req.body.companyID;
  var startRange = req.body.startRange;
  var limitRange = req.body.limitRange;

  // console.log("req.body => ", req.body);
  if (req.body.companyID) {
    if (companyID === 1) {
      // var selector = {roles:{$ne:["admin"]}, "profile.status":{$ne:"deleted-active"}};
      var selector = {
        "profile.status": {
          $nin: [
            "deleted-active",
            "deleted-inactive",
            "deleted-unverified",
            "deleted-blocked",
            "deleted",
          ],
        },
        authService: { $ne: "guest" },
      };
      // console.log("selector",selector);
    } else {
      // var selector = {"profile.companyID":companyID,roles:{$ne:["admin"]}};
      var selector = {
        "profile.companyID": companyID,
        // "profile.status": { $ne: "deleted-active" },
        "profile.status": {
          $nin: [
            "deleted-active",
            "deleted-inactive",
            "deleted-unverified",
            "deleted-blocked",
            "deleted",
          ],
        },
        authService: { $ne: "guest" },
      };
    }
    // console.log("selector", selector);
    User.find(selector)
      // .select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens statusLog")
      .sort({ createdAt: -1 })
      .skip(startRange)
      .limit(limitRange)
      .exec()
      .then((data) => {
        if (data) {
          var i = 0;
          var returnData = [];
          for (i = 0; i < data.length; i++) {
            // console.log('data in post ==>',data[i].profile);
            var loginTokenscount = data[i].services.resume.loginTokens.length;
            // console.log('data in services.resume.loginTokens ==>',loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null );
            var statuslogLength = data[i].statusLog
              ? data[i].statusLog.length
              : 0;
            returnData.push({
              _id: data[i]._id,
              firstname: data[i].profile.firstname,
              lastname: data[i].profile.lastname,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
              center_id: data[i].profile.center_id,
              centerName: data[i].profile.centerName,
              workLocation: data[i].profile.workLocation,
              email: data[i].profile.email, //Mandatory
              mobNumber: data[i].profile.mobile,
              role: data[i].roles, //Mandatory
              status: data[i].profile.status, //Either "Active" or "Inactive"
              fullName: data[i].profile.fullName,
              createdAt: data[i].createdAt,
              clientId: data[i].clientId,
              dob: data[i].profile.dob,
              age: data[i].profile.age,
              location: data[i].profile.location,
              keepUserActivateFor: data[i].profile.keepUserActivateFor,
              specialization: data[i].profile.specialization,
              qualification: data[i].profile.qualification,
              experience: data[i].profile.experience,
              registrationNo: data[i].profile.registrationNo,
              notification: data[i].profile.notification,
              expertise: data[i].profile.expertise,
              lastLogin:
                loginTokenscount > 0
                  ? data[i].services.resume.loginTokens[loginTokenscount - 1]
                      .loginTimeStamp
                  : null,
              statusupdatedAt:
                statuslogLength > 0
                  ? data[i].statusLog[statuslogLength - 1].updatedAt
                  : "-",
              statusupdatedBy:
                statuslogLength > 0
                  ? data[i].statusLog[statuslogLength - 1].updatedBy
                  : "-",
            });
          }
          if (i >= data.length) {
            // console.log('returnData=============>',returnData);
            res.status(200).json(returnData);
          }
        } else {
          res.status(200).json({ message: "USER_NOT_FOUND" });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  } //end of if condition
  else {
    res.status(500).json({
      message: "COMPANYID_NOT_AVAILABLE",
      error: err,
    });
  }
};
exports.list_users_recsPerPage = (req, res, next) => {
  var companyID = req.body.companyID;
  // console.log("req.body => ", req.body);
  var selector = "1";

  if (req.body.companyID) {
    if (companyID === 1) {
      selector = {
        "profile.status": {
          $nin: [
            "deleted-active",
            "deleted-inactive",
            "deleted-unverified",
            "deleted-blocked",
            "deleted",
          ],
        },
        authService: { $ne: "guest" },
      };
      // console.log("selector",selector);
    } else {
      // var selector = {"profile.companyID":companyID,roles:{$ne:["admin"]}};
      selector = {
        "profile.companyID": companyID,
        "profile.status": {
          $nin: [
            "deleted-active",
            "deleted-inactive",
            "deleted-unverified",
            "deleted-blocked",
            "deleted",
          ],
        },
        authService: { $ne: "guest" },
      };
    }
    let recsPerPage = req.params.recsPerPage;
    let pageNum = req.params.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);

    // console.log("Page Number",pageNum,"selector",selector,"req.body")

    if (selector != "1") {
      // User.countDocuments(selector)
      User.countDocuments(selector)
        .then((totalRecs) => {
          // console.log("totalRecs => ", totalRecs);
          User.find(selector)
            // .select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens statusLog")
            .sort({ createdAt: -1 })
            .skip(parseInt(skipRec))
            .limit(parseInt(recsPerPage))
            .exec()
            .then((data) => {
              if (data) {
                var i = 0;
                var returnData = [];
                for (i = 0; i < data.length; i++) {
                  // console.log('data in post ==>',data[i].profile);
                  var loginTokenscount =
                    data[i].services.resume.loginTokens.length;
                  // console.log('data in services.resume.loginTokens ==>',loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null );
                  var statuslogLength = data[i].statusLog
                    ? data[i].statusLog.length
                    : 0;
                  returnData.push({
                    _id: data[i]._id,
                    firstname: data[i].profile.firstname,
                    lastname: data[i].profile.lastname,
                    companyID: data[i].profile.companyID,
                    companyName: data[i].profile.companyName,
                    center_id: data[i].profile.center_id,
                    centerName: data[i].profile.centerName,
                    workLocation: data[i].profile.workLocation,
                    email: data[i].profile.email, //Mandatory
                    mobNumber: data[i].profile.mobile,
                    role: data[i].roles, //Mandatory
                    status: data[i].profile.status, //Either "Active" or "Inactive"
                    fullName: data[i].profile.fullName,
                    createdAt: data[i].createdAt,
                    clientId: data[i].clientId,
                    lastLogin:
                      loginTokenscount > 0
                        ? data[i].services.resume.loginTokens[
                            loginTokenscount - 1
                          ].loginTimeStamp
                        : null,
                    statusupdatedAt:
                      statuslogLength > 0
                        ? data[i].statusLog[statuslogLength - 1].updatedAt
                        : "-",
                    statusupdatedBy:
                      statuslogLength > 0
                        ? data[i].statusLog[statuslogLength - 1].updatedBy
                        : "-",
                  });
                }
                if (i >= data.length) {
                  // console.log('returnData=============>',returnData);
                  res.status(200).json({
                    totalRecs: totalRecs,
                    success: true,
                    tableData: returnData,
                  });
                }
              } else {
                res.status(200).json({ message: "USER_NOT_FOUND" });
              }
            })
            .catch((err) => {
              res.status(500).json({
                error: err,
              });
            });
        })
        .catch((err) => {
          res.status(500).json({
            error: err,
          });
        });
    }
  } //end of if condition
  else {
    res.status(500).json({
      message: "COMPANYID_NOT_AVAILABLE",
      error: err,
    });
  }
};

exports.fetch_users_withlimits = (req, res, next) => {
  var companyID = req.body.companyID;
  var startRange = req.body.startRange;
  var limitRange = req.body.limitRange;
  // console.log("=====================req==================",req.body,startRange,limitRange);
  if (req.body.companyID) {
    if (companyID === 1) {
      // var selector = {roles:{$ne:["admin"]}, "profile.status":{$ne:"deleted-active"}};
      var selector = { "profile.status": { $ne: "deleted-active" } };
      // console.log("selector",selector);
    } else {
      // var selector = {"profile.companyID":companyID,roles:{$ne:["admin"]}};
      var selector = { "profile.companyID": companyID };
    }
    // console.log("selector",selector);

    User.aggregate([{ $match: selector }])
      .sort({ createdAt: -1 })
      .skip(startRange)
      .limit(limitRange)
      .exec()
      .then((data) => {
        if (data) {
          var i = 0;
          var returnData = [];
          for (i = 0; i < data.length; i++) {
            var loginTokenscount = data[i].services.resume.loginTokens.length;
            returnData.push({
              _id: data[i]._id,
              firstname: data[i].profile.firstname,
              lastname: data[i].profile.lastname,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
              center_id: data[i].profile.center_id,
              centerName: data[i].profile.centerName,
              workLocation: data[i].profile.workLocation,
              email: data[i].profile.email, //Mandatory
              mobNumber: data[i].profile.mobile,
              role: data[i].roles, //Mandatory
              status: data[i].profile.status, //Either "Active" or "Inactive"
              // status:
              //   data[i].profile.status === "active" &&
              //   data[i].profile.status !== "deleted"
              //     ? '<span class="label label-success statusLabel">' +
              //       data[i].profile.status +
              //       "</span>"
              //     : '<span class="label label-default statusLabel">' +
              //       data[i].profile.status +
              //       "</span>", //Either "Active" or "Inactive"
              fullName: data[i].profile.fullName,
              lastLogin:
                loginTokenscount > 0
                  ? data[i].services.resume.loginTokens[loginTokenscount - 1]
                      .loginTimeStamp
                  : null,
            });
            // console.log("returnData==>",returnData);
          }
          if (i >= data.length) {
            res.status(200).json(returnData);
          }
        } else {
          res.status(200).json({ message: "USER_NOT_FOUND" });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};

exports.fetch_users_Companies = (req, res, next) => {
  // console.log("re============>",req.body);
  var companyID = req.body.companyID;
  var companyName = req.params.company;
  var centerName = req.params.centerName;
  // User.find({roles:req.params.role})
  // console.log("companyID",companyID);
  if (req.body.companyID) {
    if (companyID === 1) {
      var selector = { roles: { $ne: ["admin"] } };
    } else {
      var selector = {
        "profile.companyID": companyID,
        roles: { $ne: ["admin"] },
      };
    }
    // console.log("selector==>",selector);
    User.aggregate([
      { $match: selector },
      {
        $match: {
          "profile.status": {
            $nin: [
              "deleted-active",
              "deleted-inactive",
              "deleted-unverified",
              "deleted-blocked",
              "deleted",
            ],
          },
          // "profile.status": { $nin: ["deleted-active", "deleted-blocked"] },
        },
      },
      { $match: { "profile.companyName": companyName } },
    ])
      // User.find({"profile.companyName":req.params.company})
      // .select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens")
      .sort({ createdAt: -1 })
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec()
      .then((data) => {
        if (data) {
          var i = 0;
          var returnData = [];
          for (i = 0; i < data.length; i++) {
            var loginTokenscount = data[i].services.resume.loginTokens.length;
            returnData.push({
              _id: data[i]._id,
              firstname: data[i].profile.firstname,
              lastname: data[i].profile.lastname,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
              centerName: data[i].profile.centerName,
              workLocation: data[i].profile.workLocation,
              email: data[i].profile.email, //Mandatory
              mobNumber: data[i].profile.mobile,
              role: data[i].roles, //Mandatory
              status: data[i].profile.status,
              // status:
              //   data[i].profile.status === "active" &&
              //   data[i].profile.status !== "deleted"
              //     ? '<span class="label label-success statusLabel">' +
              //       data[i].profile.status +
              //       "</span>"
              //     : '<span class="label label-default statusLabel">' +
              //       data[i].profile.status +
              //       "</span>", //Either "Active" or "Inactive"
              fullName: data[i].profile.fullName,
              lastLogin:
                loginTokenscount > 0
                  ? data[i].services.resume.loginTokens[loginTokenscount - 1]
                      .loginTimeStamp
                  : null,
            });
            // console.log("returnData==>",returnData);
          }
          if (i >= data.length) {
            res.status(200).json(returnData);
          }
        } else {
          res.status(200).json({ message: "USER_NOT_FOUND" });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};
exports.fetch_users_roles = (req, res, next) => {
  // console.log("req.body =>", req.body);
  var companyID = req.body.companyID;
  var role = req.params.role;
  if (req.body.companyID) {
    if (companyID === 1) {
      var selector = {
        roles: { $in: [role] },
      };
      // { roles: { $ne: ["admin"] } };
    } else {
      var selector = {
        "profile.companyID": companyID,
        roles: { $in: [role] },

        // roles: { $ne: ["admin"] },
      };
    }
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);

    // console.log("Page Number", pageNum, "selector", selector, "req.body");

    // console.log("selector==>", selector);
    User.countDocuments(selector)
      .then((totalRecs) => {
        // console.log("totalRecs => ", totalRecs);
        User.aggregate([
          { $match: selector },
          {
            $match: {
              "profile.status": {
                $nin: [
                  "deleted-active",
                  "deleted-inactive",
                  "deleted-unverified",
                  "deleted-blocked",
                  "deleted",
                  "inactive",
                ],
              },
            },
          },
          // { $match: { roles: role } },
        ])
          .sort({ createdAt: -1 })
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage))
          .exec()
          .then((data) => {
            // console.log("data.length==>", data.length);
            if (data) {
              var i = 0;
              var returnData = [];
              for (i = 0; i < data.length; i++) {
                var loginTokenscount =
                  data[i]?.services?.resume?.loginTokens?.length;
                returnData.push({
                  _id: data[i]._id,
                  firstname: data[i].profile.firstname,
                  lastname: data[i].profile.lastname,
                  companyID: data[i].profile.companyID,
                  companyName: data[i].profile.companyName,
                  center_id: data[i].profile.center_id,
                  centerName: data[i].profile.centerName,
                  workLocation: data[i].profile.workLocation,
                  email: data[i].profile.email, //Mandatory
                  mobNumber: data[i].profile.mobile,
                  createdAt: data[i].createdAt,
                  role: data[i].roles, //Mandatory
                  status: data[i].profile.status,
                  // status:
                  //   data[i].profile.status === "active" &&
                  //   data[i].profile.status !== "deleted"
                  //     ? '<span class="label label-success statusLabel">' +
                  //       data[i].profile.status +
                  //       "</span>"
                  //     : '<span class="label label-default statusLabel">' +
                  //       data[i].profile.status +
                  //       "</span>", //Either "Active" or "Inactive"
                  fullName: data[i].profile.fullName
                    ? data[i].profile.fullName
                    : data[i].profile.firstname +
                      " " +
                      data[i].profile.lastname,
                  lastLogin:
                    loginTokenscount > 0
                      ? data[i].services.resume.loginTokens[
                          loginTokenscount - 1
                        ].loginTimeStamp
                      : null,
                });
                // console.log("returnData==>", returnData);
              }
              if (i >= data.length) {
                res.status(200).json({
                  totalRecs: totalRecs,
                  success: true,
                  tableData: returnData,
                });
              }
            } else {
              res.status(200).json({ message: "USER_NOT_FOUND" });
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};

exports.fetch_users_status = (req, res, next) => {
  var companyID = req.body.companyID;
  var status = req.params.status;
  // console.log("req.body==>", req.body);
  if (req.body.companyID) {
    if (companyID === 1) {
      var selector = {
        "profile.status": status,
      };
      // { roles: { $ne: ["admin"] } };
    } else {
      var selector = {
        "profile.companyID": companyID,
        "profile.status": status,
        // roles: { $ne: ["admin"] },
      };
    }

    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);

    // console.log("Page Number", pageNum, "selector", selector, "req.body");

    // console.log("selector==>", selector);
    // console.log("req.params.status==>",status);

    User.countDocuments(selector)
      .then((totalRecs) => {
        // console.log("totalRecs => ", totalRecs);
        User.aggregate([
          { $match: selector },
          {
            $match: {
              "profile.status": {
                $nin: [
                  "deleted-active",
                  "deleted-inactive",
                  "deleted-unverified",
                  "deleted-blocked",
                  "deleted",
                ],
              },
            },
          },
          // { $match: { "profile.status": status } },
        ])
          // .select("profile.firstname profile.lastname profile.status profile.companyID profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens")
          .sort({ createdAt: -1 })
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage))
          .exec()
          .then((data) => {
            // console.log("data", data.length);
            if (data) {
              var i = 0;
              var returnData = [];
              for (i = 0; i < data.length; i++) {
                var loginTokenscount =
                  data[i]?.services?.resume?.loginTokens?.length;
                var statuslogLength = data[i]?.statusLog?.length;
                returnData.push({
                  _id: data[i]._id,
                  firstname: data[i].profile.firstname,
                  lastname: data[i].profile.lastname,
                  companyID: data[i].profile.companyID,
                  companyName: data[i].profile.companyName,
                  center_id: data[i].profile.center_id,
                  centerName: data[i].profile.centerName,
                  workLocation: data[i].profile.workLocation,
                  email: data[i].profile.email, //Mandatory
                  mobNumber: data[i].profile.mobile,
                  role: data[i].roles, //Mandatory
                  // "status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
                  status: data[i].profile.status, //Either "Active" or "Inactive"
                  fullName: data[i].profile.fullName
                    ? data[i].profile.fullName
                    : data[i].profile.firstname +
                      " " +
                      data[i].profile.lastname,
                  createdAt: data[i].createdAt,
                  lastLogin:
                    loginTokenscount > 0
                      ? data[i].services.resume.loginTokens[
                          loginTokenscount - 1
                        ].loginTimeStamp
                      : null,
                  statusupdatedAt:
                    statuslogLength > 0
                      ? data[i]?.statusLog[statuslogLength - 1]?.updatedAt
                      : "-",
                  statusupdatedBy:
                    statuslogLength > 0
                      ? data[i]?.statusLog[statuslogLength - 1]?.updatedBy
                      : "-",
                });
              }
              if (i >= data.length) {
                res.status(200).json({
                  totalRecs: totalRecs,
                  success: true,
                  tableData: returnData,
                });
              }
            } else {
              res.status(200).json({ message: "USER_NOT_FOUND" });
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};

exports.post_list_users_filter = (req, res, next) => {
  var status = req.body.status;
  var role = req.body.role;
  if (
    (role === "all" || role === "-") &&
    (status === "all" || status === "-")
  ) {
    var selector = {
      "profile.status": {
        $nin: [
          "deleted",
          "deleted-active",
          "deleted-blocked",
          "deleted-inactive",
        ],
      },
    };
  } else if (status === "all" || status === "-") {
    var selector = {
      roles: { $in: [role] },
      "profile.status": {
        $nin: [
          "deleted",
          "deleted-active",
          "deleted-blocked",
          "deleted-inactive",
        ],
      },
    };
  } else if (role === "all" || role === "-") {
    var selector = {
      $and: [
        { "profile.status": req.body.status },
        {
          "profile.status": {
            $nin: [
              "deleted",
              "deleted-active",
              "deleted-blocked",
              "deleted-inactive",
            ],
          },
        },
      ],
    };
  } else {
    var selector = {
      $and: [
        { "profile.status": status },
        {
          "profile.status": {
            $nin: [
              "deleted",
              "deleted-active",
              "deleted-blocked",
              "deleted-inactive",
            ],
          },
        },
      ],
      roles: { $in: [role] },
    };
  }
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);

  if (req.body.searchText !== "-") {
    const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
    selector.$or = [
      { "profile.firstname": searchRegex },
      { "profile.lastname": searchRegex },
      { "profile.email": searchRegex },
      { "profile.centerName": searchRegex },
      { "profile.mobile": searchRegex },
      { "roles.0": searchRegex },
      { "profile.status": searchRegex },
    ];
  }
  // console.log("selector user==>",req.body.searchText,selector);
  // console.log("selector user==>",selector);

  User.countDocuments(selector)
    .then((totalRecs) => {
      // console.log("totalRecs => ",totalRecs);
      let usersQuery = User.aggregate([{ $match: selector }]).sort({
        createdAt: -1,
      });
      if (!req.body.removePagination) {
        usersQuery = usersQuery
          .skip(parseInt(skipRec))
          .limit(parseInt(recsPerPage));
      }
      usersQuery
        .exec()
        .then((data) => {
          // console.log('data post/list==>>',data);
          if (data) {
            var returnData = data.map((user) => {
              var loginTokenscount =
                user?.services?.resume?.loginTokens?.length;
              return {
                _id: user._id,
                firstname: user.profile.firstname,
                lastname: user.profile.lastname,
                companyID: user.profile.companyID,
                companyName: user.profile.companyName,
                center_id: user.profile.center_id,
                centerName: user.profile.centerName,
                email: user.profile.email ? user.profile.email : " ",
                mobNumber: user.profile.mobile ? user.profile.mobile : " ",
                role: user.roles,
                status: user.profile.status,
                fullName: user.profile.fullName,
                createdAt: user.createdAt,
                lastLogin:
                  loginTokenscount > 0
                    ? user.services.resume.loginTokens[loginTokenscount - 1]
                        .loginTimeStamp
                    : null,
              };
            });
            res.status(200).json({
              totalRecs: totalRecs,
              success: true,
              tableData: returnData,
            });
          } else {
            // console.log("USER_NOT_FOUND" );
            res.status(200).json({ message: "USER_NOT_FOUND" });
          }
        })
        .catch((err) => {
          console.log("err 1", err);

          res.status(500).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      console.log("err 2", err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.fetch_users_status_roles = (req, res, next) => {
  var companyID = req.body.companyID;
  var status = req.params.status;
  var role = req.params.role;
  // console.log("status => role=>companyID=>",req.body,req.params);
  if (
    (role === "all" || role === "-") &&
    (status === "all" || status === "-")
  ) {
    var selector = {};
  } else if (status === "all" || status === "-") {
    var selector = {
      // "profile.companyID": (companyID?companyID:1),
      roles: { $in: [role] },
      // roles: { $ne: ["admin"] },
    };
  } else if (role === "all" || role === "-") {
    var selector = {
      // "profile.companyID": (companyID?companyID:1),
      "profile.status": status,
    };
  } else {
    var selector = {
      // "profile.companyID": (companyID?companyID:1),
      "profile.status": status,
      roles: { $in: [role] },
      // roles: { $ne: ["admin"] },
    };
  }
  // console.log("selector==>",selector);
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);

  // console.log("Page Number",pageNum,"selector",selector,"req.body")

  // console.log("selector user==>",selector);
  // console.log("req.params.status==>",status);

  User.countDocuments(selector)
    .then((totalRecs) => {
      // console.log("totalRecs => ",totalRecs);
      User.aggregate([
        { $match: selector },
        {
          $match: {
            "profile.status": {
              $nin: [
                "deleted",
                "deleted-active",
                "deleted-blocked",
                "deleted-inactive",
              ],
            },
          },
        },
        // { $match: { "profile.status": status, roles: role } },
      ])
        .sort({ createdAt: -1 })
        .skip(parseInt(skipRec))
        .limit(parseInt(recsPerPage))
        .exec()
        .then((data) => {
          // console.log('data in role status==>>',data);
          if (data) {
            var i = 0;
            var returnData = [];
            for (i = 0; i < data.length; i++) {
              var loginTokenscount =
                data[i]?.services?.resume?.loginTokens?.length;
              returnData.push({
                _id: data[i]._id,
                firstname: data[i].profile.firstname,
                lastname: data[i].profile.lastname,
                companyID: data[i].profile.companyID,
                companyName: data[i].profile.companyName,
                center_id: data[i].profile.center_id,
                centerName: data[i].profile.centerName,
                workLocation: data[i].profile.workLocation,
                email: data[i].profile.email, //Mandatory
                mobNumber: data[i].profile.mobile,
                role: data[i].roles, //Mandatory
                // "status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
                status: data[i].profile.status, //Either "Active" or "Inactive"
                fullName: data[i].profile.fullName,
                lastLogin:
                  loginTokenscount > 0
                    ? data[i].services.resume.loginTokens[loginTokenscount - 1]
                        .loginTimeStamp
                    : null,
              });
            }
            if (i >= data.length) {
              res.status(200).json({
                totalRecs: totalRecs,
                success: true,
                tableData: returnData,
              });
            }
          } else {
            res.status(200).json({ message: "USER_NOT_FOUND" });
          }
        })
        .catch((err) => {
          res.status(500).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.fetch_users_company_status_role = (req, res, next) => {
  var companyID = req.body.companyID;
  var company = req.params.company;
  var status = req.params.status;
  var role = req.params.role;
  // console.log("req.body==>",req.body);
  // console.log("req.params==>",req.params);
  if (req.body.companyID) {
    if (companyID === 1) {
      var selector = { roles: { $ne: ["admin"] } };
    } else {
      var selector = {
        "profile.companyID": companyID,
        roles: { $ne: ["admin"] },
      };
    }
    // console.log("selector==>",selector);
    User.aggregate([
      { $match: selector },
      {
        $match: {
          "profile.status": {
            $nin: ["deleted-active", "deleted-blocked", "deleted-inactive"],
          },
        },
      },
      {
        $match: {
          "profile.companyName": company,
          "profile.status": status,
          roles: role,
        },
      },
    ])
      .sort({ createdAt: -1 })
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec()
      .then((data) => {
        // console.log('data in Status company==>>',data);
        if (data) {
          var i = 0;
          var returnData = [];
          for (i = 0; i < data.length; i++) {
            var loginTokenscount = data[i].services.resume.loginTokens.length;
            returnData.push({
              _id: data[i]._id,
              firstname: data[i].profile.firstname,
              lastname: data[i].profile.lastname,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
              center_id: data[i].profile.center_id,
              centerName: data[i].profile.centerName,
              workLocation: data[i].profile.workLocation,
              email: data[i].profile.email, //Mandatory
              mobNumber: data[i].profile.mobile,
              role: data[i].roles, //Mandatory
              // "status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
              status: data[i].profile.status, //Either "Active" or "Inactive"
              fullName: data[i].profile.fullName,
              lastLogin:
                loginTokenscount > 0
                  ? data[i].services.resume.loginTokens[loginTokenscount - 1]
                      .loginTimeStamp
                  : null,
            });
          }
          if (i >= data.length) {
            res.status(200).json(returnData);
            // console.log('returnData================	',returnData);
          }
        } else {
          res.status(200).json({ message: "USER_NOT_FOUND" });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};
exports.fetch_users_company_status = (req, res, next) => {
  var companyID = req.body.companyID;
  var company = req.params.company;
  var status = req.params.status;
  // console.log("req.body==>",req.body);
  // console.log("req.params==>",req.params);
  if (req.body.companyID) {
    if (companyID === 1) {
      var companynames = { "profile.companyName": company };
      var selector = { roles: { $ne: ["admin"] } };
    } else {
      var selector = {
        "profile.companyID": companyID,
        roles: { $ne: ["admin"] },
      };
    }
    // console.log("selector==>",selector);
    // console.log("profile.companyName==>",companynames);
    User.aggregate([
      { $match: selector },
      {
        $match: {
          "profile.status": {
            $nin: ["deleted-active", "deleted-blocked", "deleted-inactive"],
          },
        },
      },
      { $match: { "profile.companyName": company, "profile.status": status } },
    ])
      .sort({ createdAt: -1 })
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec()
      .then((data) => {
        // console.log('data in Status company==>>',data);
        if (data) {
          var i = 0;
          var returnData = [];
          for (i = 0; i < data.length; i++) {
            var loginTokenscount = data[i].services.resume.loginTokens.length;
            returnData.push({
              _id: data[i]._id,
              firstname: data[i].profile.firstname,
              lastname: data[i].profile.lastname,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
              center_id: data[i].profile.center_id,
              centerName: data[i].profile.centerName,
              workLocation: data[i].profile.workLocation,
              email: data[i].profile.email, //Mandatory
              mobNumber: data[i].profile.mobile,
              role: data[i].roles, //Mandatory
              // "status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
              status: data[i].profile.status, //Either "Active" or "Inactive"
              fullName: data[i].profile.fullName,
              lastLogin:
                loginTokenscount > 0
                  ? data[i].services.resume.loginTokens[loginTokenscount - 1]
                      .loginTimeStamp
                  : null,
            });
          }
          if (i >= data.length) {
            res.status(200).json(returnData);
            // console.log('returnData================	',returnData);
          }
        } else {
          res.status(200).json({ message: "USER_NOT_FOUND" });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};
exports.fetch_users_company_roles = (req, res, next) => {
  var companyID = req.body.companyID;
  var company = req.params.company;
  var role = req.params.role;
  // console.log("status => role=>companyID=>",req.body);

  // console.log("req.params==>",req.params);
  if (req.body.companyID) {
    if (companyID === 1) {
      var companynames = { "profile.companyName": company };
      var selector = { roles: { $ne: ["admin"] } };
    } else {
      var selector = {
        "profile.companyID": companyID,
        roles: { $ne: ["admin"] },
      };
    }
    // console.log("selector==>",selector);
    // console.log("profile.companyName==>",companynames);
    User.aggregate([
      { $match: selector },
      {
        $match: {
          "profile.status": {
            $nin: ["deleted-active", "deleted-blocked", "deleted-inactive"],
          },
        },
      },
      { $match: { "profile.companyName": company, roles: role } },
    ])
      .sort({ createdAt: -1 })
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec()
      .then((data) => {
        // console.log('data in role company==>>',data);
        if (data) {
          var i = 0;
          var returnData = [];
          for (i = 0; i < data.length; i++) {
            var loginTokenscount = data[i].services.resume.loginTokens.length;
            returnData.push({
              _id: data[i]._id,
              firstname: data[i].profile.firstname,
              lastname: data[i].profile.lastname,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
              center_id: data[i].profile.center_id,
              centerName: data[i].profile.centerName,
              workLocation: data[i].profile.workLocation,
              email: data[i].profile.email, //Mandatory
              mobNumber: data[i].profile.mobile,
              role: data[i].roles, //Mandatory
              // "status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
              status: data[i].profile.status, //Either "Active" or "Inactive"
              fullName: data[i].profile.fullName,
              lastLogin:
                loginTokenscount > 0
                  ? data[i].services.resume.loginTokens[loginTokenscount - 1]
                      .loginTimeStamp
                  : null,
            });
          }
          if (i >= data.length) {
            res.status(200).json(returnData);
            // console.log('returnData================	',returnData);
          }
        } else {
          res.status(200).json({ message: "USER_NOT_FOUND" });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};
exports.delete_user_ID = (req, res, next) => {
  User.deleteOne({ _id: req.params.ID })
    .exec()
    .then((data) => {
      if (data.deletedCount === 1) {
        res.status(200).json({ message: "USER_DELETED" });
      } else {
        res.status(200).json({ message: "USER_NOT_DELETED" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.check_EmailOTP = (req, res, next) => {
  User.find({ _id: req.params.ID, "profile.optEmail": req.params.emailotp })
    .exec()
    .then((data) => {
      if (data.length > 0) {
        User.updateOne(
          { _id: req.params.ID },
          {
            $set: {
              "profile.optEmail": 0,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data.modifiedCount === 1) {
              res.status(200).json({ message: "SUCCESS" });
            } else {
              res.status(200).json({ message: "SUCCESS_OTP_NOT_RESET" });
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(200).json({ message: "FAILED" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.update_email_otp = (req, res, next) => {
  var optEmail = getRandomInt(1000, 9999);
  User.updateOne(
    { _id: req.params.ID },
    {
      $set: {
        "profile.optEmail": optEmail,
      },
    }
  )
    .exec()
    .then((data) => {
      if (data.modifiedCount == 1) {
        request({
          method: "POST",
          url: "http://localhost:" + globalVariable.port + "/send-email",
          body: {
            email: req.body.email,
            subject: "Pipito OTP",
            text: "Pipito updated OTP is " + optEmail,
          },
          json: true,
          headers: {
            "User-Agent": "Test Agent",
          },
        })
          .then((source) => {
            res.status(201).json({ message: "OTP_UPDATED" });
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(401).status("USER_NOT_UPDATED");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.update_email_otp_email = (req, res, next) => {
  var optEmail = getRandomInt(1000, 9999);
  User.updateOne(
    { _username: req.body.emailId },
    {
      $set: {
        "profile.optEmail": optEmail,
      },
    }
  )
    .exec()
    .then((data) => {
      if (data.modifiedCount == 1) {
        request({
          method: "POST",
          url: "http://localhost:" + globalVariable.port + "/send-email",
          body: {
            email: req.body.emailId,
            subject: "Pipito OTP",
            text: "Pipito updated OTP is " + optEmail,
          },
          json: true,
          headers: {
            "User-Agent": "Test Agent",
          },
        })
          .then((source) => {
            res.status(201).json({ message: "OTP_UPDATED" });
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(401).status("USER_NOT_UPDATED");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.change_password_email_verify = (req, res, next) => {
  User.findOne({ username: req.body.emailId })
    .exec()
    .then((data) => {
      if (data) {
        request({
          method: "PATCH",
          url:
            "http://localhost:" +
            globalVariable.port +
            "/api/users/patch/optEmail/" +
            data._id,
          body: { email: data.username },
          json: true,
          headers: {
            "User-Agent": "Test Agent",
          },
        })
          .then((source) => {
            if (source.message === "OTP_UPDATED") {
              res.status(201).json({ message: "OTP_UPDATED", ID: data._id });
            } else {
              res.status(201).json({ message: "OTP_NOT_UPDATED" });
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        //end of if data
        res.status(200).json({ message: "USER_NOT_FOUND" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.search_text = (req, res, next) => {
  // console.log("req.body in search==>",req.body);
  // var companyID= req.body.companyID;
  var companyID = 1;

  if (companyID) {
    // console.log("inside companyID ==>",companyID);
    var selector = {};
    if (companyID === 1) {
      // console.log("req.body in search companyID==>",companyID);
      // selector = {roles:{$in:["admin"]}};
      // selector = {'roles':{$in:["admin","user"]}}
    } else {
      // console.log("req.body in search ekse companyID==>",companyID);
      selector = { "profile.companyID": companyID };
      // selector = {"profile.companyID":companyID,'roles':{$in:["admin","user"]}}
    }
    // console.log("selector==>",selector);
    User.aggregate([
      { $match: selector },
      {
        $match: {
          "profile.status": {
            $nin: ["deleted-active", "deleted-blocked", "deleted"],
          },
        },
      },
      {
        $match: {
          $or: [
            {
              "profile.firstname": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
            {
              "profile.lastname": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
            { "profile.email": { $regex: req.body.searchText, $options: "i" } },
            {
              "profile.location": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
            {
              "profile.qualification": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
            {
              "profile.experience": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
            {
              "profile.mobile": { $regex: req.body.searchText, $options: "i" },
            },
            { "roles.0": { $regex: req.body.searchText, $options: "i" } },
            // { "roles"				: {'$in': [req.body.searchText]}},
            // { "roles"				: { "$regex": req.body.searchText, $options: "i" } },
            {
              "profile.status": { $regex: req.body.searchText, $options: "i" },
            },
            {
              "profile.companyName": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
            {
              "profile.fullName": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
          ],
        },
      },
    ])
      // .select("profile.firstname profile.lastname profile.companyName profile.companyID profile.status profile.fullName roles profile.email profile.mobile services.resume.loginTokens")
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec()
      .then((data) => {
        // console.log("Data in search==>",data)
        if (data) {
          var i = 0;
          var returnData = [];
          for (i = 0; i < data.length; i++) {
            var loginTokenscount =
              data[i]?.services?.resume?.loginTokens?.length;
            var statuslogLength = data[i]?.statusLog?.length;

            returnData.push({
              _id: data[i]._id,
              firstname: data[i].profile.firstname,
              lastname: data[i].profile.lastname,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
              center_id: data[i].profile.center_id,
              centerName: data[i].profile.centerName,
              workLocation: data[i].profile.workLocation,
              email: data[i].profile.email, //Mandatory
              mobNumber: data[i].profile.mobile,
              role: data[i].roles, //Mandatory
              status: data[i].profile.status, //Either "Active" or "Inactive"
              fullName: data[i].profile.fullName
                ? data[i].profile.fullName
                : data[i].profile.firstname + " " + data[i].profile.lastname,
              createdAt: data[i].createdAt,
              clientId: data[i].clientId,
              lastLogin:
                loginTokenscount > 0
                  ? data[i]?.services?.resume?.loginTokens[loginTokenscount - 1]
                      ?.loginTimeStamp
                  : null,
              statusupdatedAt:
                statuslogLength > 0
                  ? data[i]?.statusLog[statuslogLength - 1]?.updatedAt
                  : "-",
              statusupdatedBy:
                statuslogLength > 0
                  ? data[i]?.statusLog[statuslogLength - 1]?.updatedBy
                  : "-",
            });
          }
          if (i >= data.length) {
            res.status(200).json(returnData);
          }
        } else {
          res.status(200).json({ message: "USER_NOT_FOUND" });
        }
      })
      .catch((err) => {
        console.log("err", err);
        res.status(500).json({
          error: err,
        });
      });
  }
};

exports.search_textCompRoleStatus = (req, res, next) => {
  // console.log("req=======>>",req.body);
  if (req.body.companyID) {
    var selector = {};
    // console.log("selector",selector);
    /* if(req.body.companyID) {
	            selector.companyID = req.body.companyID 
	        }
	        if(req.body.searchText) {
	            selector.searchText =  req.body.searchText 
	        }
	        if(req.body.role) {
	            selector.role =  req.body.role 
	        }
	        if(req.body.status) {
	            selector.status =   req.body.status 
	        }
	        if(req.body.company) {
	            selector.company =  req.body.company } 
	        }*/

    selector["$and"] = [];
    var companyID = req.body.companyID;
    if (companyID === 1) {
      // console.log("req.body in search companyID==>",companyID);
      selector["$and"].push({ roles: { $ne: ["admin"] } });
    } else {
      // console.log("req.body in search ekse companyID==>",companyID);
      selector["$and"].push({
        "profile.companyID": companyID,
        roles: { $ne: ["admin"] },
      });
    }
    // console.log("selector",selector);

    if (req.body.role) {
      selector["$and"].push({ roles: req.body.role });
      // console.log("selector in search ekse selector==>",selector);
    } else {
      selector["$and"].push({ roles: { $ne: "" } });
    }
    // console.log("selector",selector);

    if (req.body.status) {
      // console.log("req.body in search ekse companyID==>",companyID);
      selector["$and"].push({ "profile.status": req.body.status });
      // console.log("selector in search ekse selector==>",selector);
    } else {
      selector["$and"].push({ "profile.status": { $ne: "" } });
    }
    // console.log("selector",selector);

    if (req.body.company) {
      // console.log("req.body in search ekse companyID==>",req.body.company);
      selector["$and"].push({ "profile.companyName": req.body.company });
      // console.log("selector in search ekse selector==>",selector);
    } else {
      selector["$and"].push({ "profile.companyName": { $ne: "" } });
    }
    // console.log("selector",selector);
    // console.log(" search above selector==>",req.body.search);

    /*  if(req.body.search){
			console.log(" search in if selector==>",req.body.search);

	    	selector["$or"].push({ "profile.firstname"	: { "$regex": req.body.search, $options: "i" } })
			selector["$or"].push({ "profile.lastname"	: { "$regex": req.body.search, $options: "i" } })
			selector["$or"].push({ "profile.email"		: { "$regex": req.body.search, $options: "i" } })
			selector["$or"].push({ "profile.mobile"		: { "$regex": req.body.search, $options: "i" } })
			selector["$or"].push({ "role"				: { "$regex": req.body.search, $options: "i" } })
			selector["$or"].push({ "profile.status"		: { "$regex": req.body.search, $options: "i" } })
			selector["$or"].push({ "profile.companyName"	: { "$regex": req.body.search, $options: "i" } })
			selector["$or"].push({ "profile.fullName"	: { "$regex": req.body.search, $options: "i" } })
	    }*/
    // console.log("selector in search ekse selector==>",selector);

    User.aggregate([
      { $match: selector },
      {
        $match: {
          "profile.status": { $nin: ["deleted-active", "deleted-blocked"] },
        },
      },
      {
        $match: {
          $or: [
            { "profile.firstname": { $regex: req.body.search, $options: "i" } },
            { "profile.lastname": { $regex: req.body.search, $options: "i" } },
            { "profile.email": { $regex: req.body.search, $options: "i" } },
            { "profile.mobile": { $regex: req.body.search, $options: "i" } },
            { "roles.0": { $regex: req.body.search, $options: "i" } },
            { "profile.status": { $regex: req.body.search, $options: "i" } },
            {
              "profile.companyName": { $regex: req.body.search, $options: "i" },
            },
            { "profile.fullName": { $regex: req.body.search, $options: "i" } },
          ],
        },
      },
    ])
      // .select("profile.firstname profile.lastname profile.companyName profile.companyID profile.status profile.fullName roles profile.email profile.mobile services.resume.loginTokens")
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec()
      .then((data) => {
        // console.log("Data in search==>",data)
        if (data) {
          var i = 0;
          var returnData = [];
          for (i = 0; i < data.length; i++) {
            var loginTokenscount = data[i].services.resume.loginTokens.length;
            returnData.push({
              _id: data[i]._id,
              email: data[i].profile.email, //Mandatory
              firstname: data[i].profile.firstname,
              lastname: data[i].profile.lastname,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
              center_id: data[i].profile.center_id,
              centerName: data[i].profile.centerName,
              workLocation: data[i].profile.workLocation,
              mobNumber: data[i].profile.mobile,
              role: data[i].roles, //Mandatory
              status: data[i].profile.status, //Either "Active" or "Inactive"
              fullName: data[i].profile.fullName,
              lastLogin:
                loginTokenscount > 0
                  ? data[i].services.resume.loginTokens[loginTokenscount - 1]
                      .loginTimeStamp
                  : null,
            });
          }
          if (i >= data.length) {
            res.status(200).json(returnData);
          }
        } else {
          res.status(200).json({ message: "USER_NOT_FOUND" });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
};

// exports.search_text_delete = (req, res, next)=>{
// 	User.find({
// 		$and:[
// 				{$or:[
// 					{ "profile.firstname"	: { "$regex": req.body.searchText, $options: "i" } },
// 					{ "profile.lastname"	: { "$regex": req.body.searchText, $options: "i" } },
// 					{ "profile.email"		: { "$regex": req.body.searchText, $options: "i" } },
// 					{ "profile.fullName"	: { "$regex": req.body.searchText, $options: "i" } },
// 					{ "roles.0"				: { "$regex": req.body.searchText, $options: "i" } },
// 				]},

// 				{$or:[
// 					{"profile.status": "deleted-active"},
// 					{"profile.status": "deleted-blocked"}
// 				]},
// 		]
// 	})
// 	.select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens statusLog")
// 	.skip(req.body.startRange)
// 	.limit(req.body.limitRange)
// 	.exec()
// 	.then(data=>{
// 		// console.log("Data in delete list==>",data)
// 		if(data){
// 			var i = 0;
// 					var returnData = [];
// 					for(i = 0 ; i < data.length ; i++){
// 						var loginTokenscount = data[i].services.resume.loginTokens.length;
// 						var statuslogLength = data[i].statusLog.length
// 						returnData.push({
// 							"_id"		      : data[i]._id,
// 							"firstname"       : data[i].profile.firstname,
// 							"lastname"	      : data[i].profile.lastname,
// 							"companyID"	      : data[i].profile.companyID,
// 							"companyName"	  : data[i].profile.companyName,
// 							"workLocation"	  : data[i].profile.workLocation,
// 							"email"		      : data[i].profile.email, //Mandatory
// 							"mobNumber"       : data[i].profile.mobile,
// 							"role"            : data[i].roles, //Mandatory
// 							"status"		  : data[i].profile.status, //Either "Active" or "Inactive"
// 							"fullName"	      : data[i].profile.fullName,
// 							"createdAt"       : data[i].createdAt,
// 							"clientId"	      : data[i].clientId,
// 							"lastLogin"       : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null ,
// 							"statusupdatedAt" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedAt : "-",
// 							"statusupdatedBy" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedBy : "-"

// 						});
// 					}

// 			if( i >= data.length){
// 				res.status(200).json(returnData);
// 			}
// 		}else{
// 			res.status(200).json({message:"USER_NOT_FOUND"});
// 		}
// 	})
// 	.catch(err=>{
// 		res.status(500).json({
// 			error : err
// 		})
// 	})
// }
exports.search_text_delete = (req, res, next) => {
  try {
    User.find({
      $and: [
        {
          $or: [
            {
              "profile.firstname": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
            {
              "profile.lastname": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
            { "profile.email": { $regex: req.body.searchText, $options: "i" } },
            {
              "profile.fullName": {
                $regex: req.body.searchText,
                $options: "i",
              },
            },
            { "roles.0": { $regex: req.body.searchText, $options: "i" } },
          ],
        },
        {
          $or: [
            { "profile.status": "deleted-active" },
            { "profile.status": "deleted-blocked" },
          ],
        },
      ],
    })
      .select(
        "profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens statusLog"
      )
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec()
      .then((data) => {
        if (data && data.length > 0) {
          var returnData = data.map((user) => {
            const loginTokenscount = user.services.resume.loginTokens
              ? user.services.resume.loginTokens.length
              : 0;
            const statuslogLength = user.statusLog ? user.statusLog.length : 0;

            return {
              _id: user._id,
              firstname: user.profile.firstname,
              lastname: user.profile.lastname,
              companyID: user.profile.companyID,
              companyName: user.profile.companyName,
              center_id: data[i].profile.center_id,
              centerName: user.profile.centerName,
              workLocation: user.profile.workLocation,
              email: user.profile.email,
              mobNumber: user.profile.mobile,
              role: user.roles,
              status: user.profile.status,
              fullName: user.profile.fullName,
              createdAt: user.createdAt,
              clientId: user.clientId,
              lastLogin:
                loginTokenscount > 0
                  ? user.services.resume.loginTokens[loginTokenscount - 1]
                      .loginTimeStamp
                  : null,
              statusupdatedAt:
                statuslogLength > 0
                  ? user.statusLog[statuslogLength - 1].updatedAt
                  : "-",
              statusupdatedBy:
                statuslogLength > 0
                  ? user.statusLog[statuslogLength - 1].updatedBy
                  : "-",
            };
          });

          res.status(200).json(returnData);
        } else {
          res.status(200).json({ message: "USER_NOT_FOUND" });
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      });
  } catch (error) {
    console.error("Unexpected error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
exports.user_update_img = (req, res, next) => {
  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      if (user) {
        User.updateOne(
          { _id: req.params.ID },
          {
            $set: {
              "profile.image": req.body.userImg,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data.modifiedCount == 1) {
              res.status(200).json("USER_IMAGE_UPDATED");
            } else {
              res.status(401).status("USER_IMAGE_NOT_UPDATED");
            }
          })
          .catch((err) => {
            console.log("user error ", err);
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      console.log("update user error ", err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.fetch_email = (req, res, next) => {
  User.findOne({ _id: req.params.userID })
    .exec()
    .then((data) => {
      res.status(200).json(data.username);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.getID = (req, res, next) => {
  User.findOne({ _id: req.params.id })
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

exports.getUserList = (req, res, next) => {
  // console.log("getUserList = ", req.body);
  User.find(
    {
      // "profile.companyID" 	: req.body.companyID,
      roles: req.body.role,
    },

    { services: 0, subscriptionDetails: 0, otherInfo: 0, documents: 0 }
  )
    .exec()
    .then((data) => {
      // console.log("data = ",data);
      res.status(200).json(data);
    })

    .catch((err) => {
      console.log("err", err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.getUserOtp = (req, res, next) => {
  User.findOne({ _id: req.params.user_id })
    .exec()
    .then((data) => {
      // console.log("data===>",data)
      res.status(200).json(data.profile.otpMobile);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.getuserCount = (req, res, next) => {
  User.find({ roles: req.params.role })
    .countDocuments()
    .exec()
    .then((data) => {
      // console.log("data===>",data)
      res.status(200).json({ count: data });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.getUsersList = (req, res, next) => {
  User.find({ roles: req.params.roles === "senior-manager" })
    .countDocuments()
    .exec()
    .then((data) => {
      // console.log("data===>",data)
      res.status(200).json({ count: data });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.update_user_company = (req, res, next) => {
  User.findOne({ _id: req.params.userID })
    .exec()
    .then((user) => {
      if (user) {
        User.updateOne(
          { _id: req.params.userID },
          {
            $set: {
              "profile.companyID": req.body.companyID,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data.modifiedCount == 1) {
              res.status(200).json("USER_UPDATED");
            } else {
              res.status(200).json({
                updated: false,
                message: "USER_NOT_UPDATED",
              });
              // res.status(401).status("USER_NOT_UPDATED")
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.onlineUserCount = (req, res, next) => {
  // console.log("onlineUserCount",req)
  User.find({ roles: ["user"] })
    .exec()
    .then((data) => {
      res.status(200).json({ dataCount: data.length });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.countUsers = (req, res, next) => {
  var selector = {};
  if (req.params.user_id === "All") {
    selector = {};
  } else {
    selector = { _id: req.params.user_id };
  }
  User.countDocuments(selector)
    .exec()
    .then((data) => {
      res.status(200).json({ dataCount: data });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.deleteAllUsers = (req, res, next) => {
  // console.log("deleteAllUsers");
  User.remove({})
    .exec()
    .then((data) => {
      res.status(200).json({
        message: "All Users Deleted Successfully.",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

//   ============ New API by Jyoti ==============

exports.update_user_profile = (req, res, next) => {
  // console.log("body => ", req.body);
  User.findOne({ _id: req.body.user_id })
    .exec()
    .then((user) => {
      if (user) {
        // console.log("user => ",user)
        if (req.body.mobileChange) {
          // var otpMobile = getRandomInt(1000, 9999);
          var otpMobile = 1234;

          User.updateOne(
            { _id: req.body.user_id },
            {
              $set: {
                "profile.otpMobile": otpMobile,
              },
            }
          )
            .exec()
            .then(async (data) => {
              // console.log("data => ", data);
              // if(data.modifiedCount === 1){
              var userNotificationValues = {
                event: "SendOTP",
                toUser_id: req.body.user_id,
                toUserRole: user.roles[0],
                toMobileNumber: req.body.isdCode + req.body.mobile,
                variables: {
                  subject: "Change Mobile Number",
                  OTP: otpMobile,
                },
              };
              var send_notification_to_user =
                await sendNotification.send_notification_function(
                  userNotificationValues
                );
              res.status(200).json({
                messageCode: true,
                message: "OTP sent on your mobile number",
              });
              // }else{
              // 	res.status(200).json({
              // 		messageCode : false,
              // 		message   	: "Failed to send OTP on mobile number",
              // 	});
              // 	// res.status(401).status("USER_NOT_UPDATED")
              // }
            })
            .catch((err) => {
              res.status(500).json({
                error: err,
              });
            });
        } else if (req.body.emailChange) {
          var previousPassword = user.services.password.bcrypt;
          // console.log("previousPassword => ", previousPassword);
          if (previousPassword) {
            // console.log(
            //   " Condition => ",
            //   bcrypt.compare(req.body.currentPassword, previousPassword)
            // );
            bcrypt.compare(
              req.body.currentPassword,
              previousPassword,
              (error, result) => {
                // console.log("error => ", error);
                // console.log("result => ", result);
                if (error) {
                  return res.status(200).json({
                    message: "You entered wrong current password",
                    messageCode: false,
                  });
                }
                if (result) {
                  User.updateOne(
                    { _id: req.body.user_id },
                    {
                      $set: {
                        "profile.email": req.body.email,
                      },
                    }
                  )
                    .then((data) => {
                      // console.log("data => ", data);
                      if (data.modifiedCount === 1) {
                        res.status(200).json({
                          message: "Email Id updated successfully",
                          messageCode: true,
                        });
                      } else {
                        res.status(200).json({
                          message: "It seems that you didn't change anything",
                          messageCode: false,
                        });
                      }
                    })
                    .catch((err) => {
                      console.log("Error while updating email => ", err);
                      res.status(500).json({
                        error: err,
                        message: "Error while updating email",
                        messageCode: false,
                      });
                    });
                } else {
                  console.log("Current Password is wrong");
                  return res.status(200).json({
                    message: "Current Password is wrong",
                    messageCode: false,
                  });
                }
              }
            );
          } else {
            console.log("Something went wrong");
            res.status(200).json({
              message: "Something went wrong",
              messageCode: false,
            });
          }
        } else {
          User.updateOne(
            { _id: req.body.user_id },
            {
              $set: {
                "profile.firstname": req.body.firstname,
                "profile.lastname": req.body.lastname,
                "profile.fullName": req.body.fullName,
                image: req.body.image,
              },
            }
          )
            .then((data) => {
              console.log("data => ", data);
              if (data.modifiedCount === 1) {
                res.status(200).json({
                  message: "User profile updated successfully",
                  messageCode: true,
                });
              } else {
                res.status(200).json({
                  message: "It seems that you didn't change anything",
                  messageCode: false,
                });
              }
            })
            .catch((err) => {
              console.log("Error while updating profile details => ", err);
              res.status(500).json({
                error: err,
                message: "Error while updating profile details",
                messageCode: false,
              });
            });
        }
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

// exports.getManagerList=(req, res, next)=>{
//   User.find({roles:["manager"]})
//   .exec()
//   .then(data=>{
//     res.status(200).json(data);
//   })
//   .catch(err=>{
//     console.log("err",err)
//   })
// }

exports.getManagerList = (req, res, next) => {
  User.find({ roles: req.params.role })
    .exec()
    .then((data) => {
      // console.log("data===>",data)
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

/**=========== Verify OTP ===========*/
exports.verify_user_otp = (req, res, next) => {
  console.log("req body", req.body);
  User.findOne({ _id: ObjectID(req.body.user_id) })
    .then((data) => {
      console.log("data", data);
      if (data && data !== null) {
        if (String(data.profile.otpMobile) === String(req.body.otp)) {
          User.updateOne(
            { _id: ObjectID(req.body.user_id) },
            {
              $set: {
                "profile.otpMobile": 0,
                "profile.mobile": req.body.mobile,
                "profile.isdCode": req.body.isdCode,
                "profile.status": "active",
              },
            }
          )
            .exec()
            .then((data) => {
              if (data.modifiedCount === 1) {
                res.status(200).json({
                  messageCode: true,
                  message: "Mobile number updated successfully",
                });
              } else {
                res.status(200).json({
                  messageCode: false,
                  message: "It seems that you didn't change anything",
                });
              }
            })
            .catch((err) => {
              console.log("user error ", err);
              res.status(500).json({
                messageCode: false,
                message: "Failed to update Mobile Number",
                error: err,
              });
            });
        } else {
          res.status(200).json({
            messageCode: false,
            message: "Wrong OTP",
          });
        }
      } else {
        res.status(200).json({
          messageCode: false,
          message: "No user found",
        });
      }
    })
    .catch((err) => {
      console.log("user error ", err);
      res.status(500).json({
        messageCode: false,
        message: "Failed to find the user",
        error: err,
      });
    });
};

/**============ Update User Profile ===========*/
// exports.set_send_emailotp_usingEmail = (req, res, next) => {
// 	User.findOne({ "profile.email": req.params.emailId })
// 	.then(user => {
// 		if(user){
// 			// console.log('user status====',user.profile.status)
//  			if ((user.profile.status).toLowerCase() === "active") {
//  				var optEmail = getRandomInt(1000, 9999);
// 				// console.log("optEmail", optEmail, req.body);
// 				User.updateOne(
// 					{ "profile.email": req.params.emailId },
// 					{
// 						$set: {
// 							"profile.otpEmail": optEmail,
// 						},
// 					}
// 				)
// 				.exec()
// 				.then(data => {
// 					if (data.modifiedCount === 1) {
// 						User.findOne({ "profile.email": req.params.emailId })
// 							.then(user => {
// 								if (user) {
// 									main();
// 									async function main(){
// 										var sendMail = await sendEmail(req.params.emailId,req.body.emailSubject,req.body.emailContent + " Please enter this otp " + optEmail+ " to reset your password");
// 										res.status(200).json({ message: "OTP_UPDATED", ID: user._id,profile:user.profile })
// 									 }
// 								} else {
// 									res.status(200).json({ message: "User not found" });
// 								}
// 							})
// 							.catch(err => {
// 								res.status(500).json({
// 									message: "Failed to find User",
// 									error: err
// 								});
// 							});
// 					} else {
// 						res.status(401).json({ message: "OTP_NOT_UPDATED" })
// 					}
// 				})
// 				.catch(err => {
// 					res.status(500).json({
// 						message: "Failed to update User",
// 						error: err
// 					});
// 				});
//  			}else if ((user.profile.status).toLowerCase() == "blocked") {
// 				// console.log("user.USER_BLOCK IN ==>")
// 				res.status(200).json({ message: "USER_BLOCK" });
// 			} else if ((user.profile.status).toLowerCase() == "unverified") {
// 				res.status(200).json({ message: "USER_UNVERIFIED" });
// 			}
// 		}else{
// 			res.status(200).json({ message: "NOT_REGISTER" })
// 		}
// 	})
// 	.catch(err => {
// 		res.status(500).json({
// 			message: "Failed to find User",
// 			error: err
// 		});
// 	});
// };

exports.update_user_company = (req, res, next) => {
  User.findOne({ _id: req.params.userID })
    .exec()
    .then((user) => {
      if (user) {
        User.updateOne(
          { _id: req.params.userID },
          {
            $set: {
              "profile.companyID": req.body.companyID,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data.modifiedCount == 1) {
              res.status(200).json("USER_UPDATED");
            } else {
              res.status(200).json({
                updated: false,
                message: "USER_NOT_UPDATED",
              });
              // res.status(401).status("USER_NOT_UPDATED")
            }
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(404).json("User Not Found");
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.update_complete_user_profile = (req, res, next) => {
  console.log("update_complete_user_profile req body => ", req.body);
};

exports.getSeniorManagerList = async (req, res) => {
  try {
    // Fetch users with role 'senior-manager' from the database
    const seniorManagers = await User.find(
      { roles: "senior-manager" },
      "profile.firstname profile.lastname profile.email profile.mobile"
    );

    // Map the data to the desired format
    const seniorManagerList = seniorManagers.map((user) => ({
      name: `${user.profile.firstname} ${user.profile.lastname}`,
      email: user.profile.email,
      mobile: user.profile.mobile,
      id: user._id, // Include the user ID for a unique key
    }));

    res.status(200).json(seniorManagerList);
  } catch (error) {
    res.status(500).json({ error: "Error while fetching senior manager list" });
  }
};

exports.getAccountPersonList = async (req, res) => {
  try {
    // Fetch users with role 'senior-manager' from the database
    const accountPersons = await User.find(
      { roles: "account-person" },
      "profile.firstname profile.lastname profile.email profile.mobile"
    );

    // Map the data to the desired format
    const accountPersonList = accountPersons.map((user) => ({
      name: `${user.profile.firstname} ${user.profile.lastname}`,
      email: user.profile.email,
      mobile: user.profile.mobile,
      id: user._id, // Include the user ID for a unique key
    }));

    res.status(200).json(accountPersonList);
  } catch (error) {
    res.status(500).json({ error: "Error while fetching account person list" });
  }
};

exports.getCenterInchargeList = async (req, res) => {
  try {
    // Fetch users with role 'senior-manager' from the database
    const centerIncharge = await User.find(
      { roles: "center-incharge" },
      "profile.firstname profile.lastname profile.email profile.mobile"
    );

    // Map the data to the desired format
    const centerInchargeList = centerIncharge.map((user) => ({
      name: `${user.profile.firstname} ${user.profile.lastname}`,
      email: user.profile.email,
      mobile: user.profile.mobile,
      id: user._id, // Include the user ID for a unique key
    }));

    res.status(200).json(centerInchargeList);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error while fetching center incharge list" });
  }
};
