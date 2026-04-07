const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var ObjectID = require("mongodb").ObjectID;
var request = require("request-promise");

const nodeMailer = require("nodemailer");
const moment = require("moment-timezone");
const User = require("./ModelUsers.js");
// const Role = require("../rolesManagement/model.js");
const Role = require("../oneFieldModules/rolesManagement/routes.js");
const globalVariable = require("../../../nodemonConfig.js");
// const sendNotification = require("../notificationManagement/SendNotification.js");
const { sendNotification } = require("../common/globalFunctions");

//shaavi - PB added specific user for Shaavi --starts

exports.add_user_details = (req, res, next) => {
  if (req.body.email && req.body.password && req.body.role) {
    var emailId = req.body.email;
    var role_lower = req.body.role.toLowerCase();
    console.log("role ", role_lower, role_lower && emailId);
    console.log("req.body ", req.body);

    if (role_lower && emailId) {
      Role.findOne({ role: role_lower })
        .exec()
        .then((role) => {
          // console.log("role",role);

          if (role && role !== null) {
            User.find({ username: emailId.toLowerCase() })
              .exec()
              .then((user) => {
                // console.log("user => ",user)
                // console.log("user length => ",user.length)
                if (user.length > 0) {
                  return res.status(200).json({
                    message: "Email Id already exist.",
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
                          center_id		: req.body.center_id,
                          centerName	: req.body.centerName,
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

                          city: req.body.cityName,
                          states: req.body.states,
                          status: req.body.status ? req.body.status : "blocked",
                          createdBy: req.body.createdBy,
                          createdAt: new Date(),
                        },
                        deliveryAddress: [],
                        roles: [role_lower],
                        recieveNotifications: req.body.recieveNotifications,
                      });
                      if (!req.body.firstname) {
                        user.profile.fullName = req.body.fullName;
                      }
                      user
                        .save()
                        .then(async (result) => {
                          if (!user.roles.includes("admin")) {
                            // send Notification, email, sms to customer

                            var userNotificationValues = {
                              event: "Create User",
                              toUser_id: user._id.toString(),
                              toEmail: user.profile.email,
                              toMobileNumber:
                                user.profile.isdCode + user.profile.mobile,
                              toUserRole: user.roles[0],
                              userDetails: user,
                              variables: {
                                userName: req.body.userName,
                                // OTPSendForReason: "OTP for SignUp",
                                // OTPValue: otp,
                              },
                            };
                            var send_notification_to_user =
                              await sendNotification(userNotificationValues);

                            // send Notification, email, sms to admin
                            var adminNotificationValues = {
                              event: "Create User",
                              toUser_id: user._id.toString(),
                              toEmail: user.profile.email,
                              toMobileNumber:
                                user.profile.isdCode + user.profile.mobile,
                              toUserRole: user.roles[0],
                              userDetails: user,
                              variables: {
                                firstName: result.profile.firstName,
                                lastName: result.profile.lastName,
                                fullName: result.profile.fullName,
                                emailId: result.profile.email,
                                mobileNumber: result.profile.mobile,
                                loginID: result.username,
                                signupDate: moment(result.createdAt).format(
                                  "MMMM Do YYYY, h:mm:ss a"
                                ),
                              },
                            };
                            var send_notification_to_user =
                              await sendNotification(adminNotificationValues);
                          }
                          res.status(200).json({
                            message: "USER_CREATED",
                            ID: result._id,
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

exports.update_user_details = (req, res, next) => {
  console.log("req.body", req.body);
  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      if (user) {
        User.updateOne(
          { _id: req.params.ID },
          {
            $set: {
              "profile.firstname"   : req.body?.firstName,
              "profile.lastname"    : req.body?.lastName,
              "profile.center_id"		: req.body?.center_id,
              "profile.centerName"	: req.body?.centerName,
              "profile.fullName"    : req.body?.firstName + " " + req.body?.lastName,
              "profile.isdCode"     : "+91",
              "profile.mobile"      : req.body?.mobile,
              role                  : req.body?.role,
              "profile.email"       : req.body?.email,
              department            : req.body?.department,
              orgLevel              : req.body?.orgLevel,
              designation           : req.body?.designation,
              reporting_id          : req.body?.reporting_id,
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
//shaavi - PB added specific user for Shaavi --ends

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
  console.log("update", req.body);
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
                console.log("inside 409 ", res.status);
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
          console.log("Inside else");
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
  console.log("req.body", req.body);
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
              role: req.body.role,
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
        var newstatus = "";
        if (user.profile.status === "active") {
          newstatus = "deleted-active";
        }
        if (user.profile.status === "blocked") {
          newstatus = "deleted-blocked";
        }
        if (user.profile.status === "unverified") {
          newstatus = "deleted-unverified";
        }
        if (user.profile.status === "inactive") {
          newstatus = "deleted-inactive";
        }
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
        var newstatus = "";
        if (user.profile.status === "deleted-active") {
          newstatus = "active";
        }
        if (user.profile.status === "deleted-blocked") {
          newstatus = "blocked";
        }
        if (user.profile.status === "deleted-unverified") {
          newstatus = "unverified";
        }
        if (user.profile.status === "deleted-inactive") {
          newstatus = "inactive";
        }
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
  var userID = req.body.userID.map((a, i) => ObjectID(a));
  console.log("userID", userID);
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
      if (data.modifiedCount == 1) {
        User.updateOne(
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
};

exports.user_update_many_role = (req, res, next) => {
  var userID = req.body.userID.map((a, i) => ObjectID(a));
  console.log("userID", userID);
  if (req.body.action === "add") {
    var query = {
      $push: {
        roles: req.body.role,
      },
    };
  } else if (req.body.action === "remove") {
    var query = {
      $pull: {
        roles: req.body.role,
      },
    };
  }
  User.updateMany({ _id: { $in: userID } }, query)
    .exec()
    .then((data) => {
      if (data.modifiedCount == 1) {
        User.updateOne(
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
};

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
        console.log("fetch_user_ID", data);
        var loginTokenscount = data.services.resume.loginTokens.length;
        var statuslogLength = data.statusLog ? data.statusLog.length : 0;
        // console.log("inside  fetch_user_ID ",data)
        (data.logDetails =
          loginTokenscount > 0 ? data.services.resume.loginTokens : "-"),
          // var userData={
          //   ...data,
          //   logDetails:
          //     loginTokenscount > 0 ? data.services.resume.loginTokens : "-",
          // }
          // console.log("userData",userData);
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

    // Fetch users based on the constructed selector
    const data = await User.find(selector)
      .select(
        "profile.firstname profile.lastname profile.status profile.fullName roles profile.email profile.mobile createdAt services.resume.loginTokens statusLog"
      )
      .sort({ createdAt: -1 })
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec();

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
    console.log("returnData", returnData);
    res.status(200).json(returnData);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.user_update_password_withoutotp_ID = (req, res, next) => {
  console.log("user_update_password_withoutotp_ID body => ", req.body);

  User.findOne({ _id: req.params.ID })
    .exec()
    .then((user) => {
      // console.log("user_update_password_withoutotp_ID===========>>>>>>",user)
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
              if (data.modifiedCount == 1) {
                res.status(200).json("PASSWORD_RESET");
              } else {
                res.status(401).json("PASSWORD_NOT_RESET");
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

  console.log("req.body => ", req.body);
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
          ],
        },
        authService: { $ne: "guest" },
      };
    }
    console.log("selector", selector);
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
              center_id		:data[i]?.profile?.center_id,
              centerName	:data[i]?.profile?.centerName,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
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
  console.log("re============>", req.body);
  var companyID = req.body.companyID;
  var role = req.params.role;
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
    console.log("selector==>", selector);
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
            ],
          },
        },
      },
      { $match: { roles: role } },
    ])
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
              workLocation: data[i].profile.workLocation,
              email: data[i].profile.email, //Mandatory
              mobNumber: data[i].profile.mobile,
              createdAt: data[i].createdAt,
              role: data[i].roles, //Mandatory
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

exports.fetch_users_status = (req, res, next) => {
  // User.find({"profile.status":req.params.status})
  var companyID = req.body.companyID;
  var status = req.params.status;
  console.log("req.body==>", req.body);
  if (req.body.companyID) {
    if (companyID === 1) {
      var selector = { roles: { $ne: ["admin"] } };
    } else {
      var selector = {
        "profile.companyID": companyID,
        roles: { $ne: ["admin"] },
      };
    }
    console.log("selector==>", selector);
    console.log("req.params.status==>", status);
    // User.find({"profile.status":status})
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
            ],
          },
        },
      },
      { $match: { "profile.status": status } },
    ])
      // .select("profile.firstname profile.lastname profile.status profile.companyID profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens")
      .sort({ createdAt: -1 })
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec()
      .then((data) => {
        console.log("data", data);
        if (data) {
          var i = 0;
          var returnData = [];
          for (i = 0; i < data.length; i++) {
            var loginTokenscount = data[i].services.resume.loginTokens.length;
            var statuslogLength = data[i]?.statusLog?.length;
            returnData.push({
              _id: data[i]._id,
              firstname: data[i].profile.firstname,
              lastname: data[i].profile.lastname,
              companyID: data[i].profile.companyID,
              companyName: data[i].profile.companyName,
              workLocation: data[i].profile.workLocation,
              email: data[i].profile.email, //Mandatory
              mobNumber: data[i].profile.mobile,
              role: data[i].roles, //Mandatory
              // "status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
              status: data[i].profile.status, //Either "Active" or "Inactive"
              fullName: data[i].profile.fullName,
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
              createdAt: data[i].createdAt,
              lastLogin:
                loginTokenscount > 0
                  ? data[i].services.resume.loginTokens[loginTokenscount - 1]
                      .loginTimeStamp
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
        res.status(500).json({
          error: err,
        });
      });
  }
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

exports.fetch_users_status_roles = (req, res, next) => {
  var companyID = req.body.companyID;
  var status = req.params.status;
  var role = req.params.role;
  // console.log("status => role=>companyID=>",req.body,status,role);
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
      { $match: { "profile.status": status, roles: role } },
    ])
      .sort({ createdAt: -1 })
      .skip(req.body.startRange)
      .limit(req.body.limitRange)
      .exec()
      .then((data) => {
        // console.log('data in role status==>>',data);
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
  console.log("body => ", req.body);
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
              console.log("data => ", data);
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
          console.log("previousPassword => ", previousPassword);
          if (previousPassword) {
            console.log(
              " Condition => ",
              bcrypt.compare(req.body.currentPassword, previousPassword)
            );
            bcrypt.compare(
              req.body.currentPassword,
              previousPassword,
              (error, result) => {
                console.log("error => ", error);
                console.log("result => ", result);
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
                      console.log("data => ", data);
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
