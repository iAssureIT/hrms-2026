const express = require("express");
const morgan = require("morgan"); // morgan call next function if problem occure
const bodyParser = require("body-parser"); // this package use to formate json data
const mongoose = require("mongoose");
const fs = require("fs");
var nodeMailer = require("nodemailer");
const cron = require("node-cron");
const axios = require("axios");
// for performance
const compression = require("compression");
// for performance

const globalVariable = require("./nodemonConfig.js");

const MyEmitter = require("events");
const sendEmail = require("./api/admin2.0/common/email-service.js");

mongoose.connect("mongodb://127.0.0.1/" + globalVariable.dbname);
mongoose.promise = global.Promise;

// Initialize Leave Accrual Worker (Monthly Cron)
require("./api/hrms-2026/leaveManagement/accrualWorker.js");

//=====  Create NodeJs App =====

const app = express();

// for performance
app.use(compression());
app.use(express.static("public"));
// for performance

app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
// app.use("/static", express.static('./static/'));

const cors = require("cors");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  methods: ["OPTIONS", "GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "x-requested-with",
    "Authorization",
    "Accept",
    "token",
  ],
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

const myEmitter = new MyEmitter();
// increase the limit/users/post/signup/user
myEmitter.setMaxListeners(11);

myEmitter.emit("event");

//======= Import all Routes =====
appRoutes = require("./app-routes.js");
appRoutes(app);
//===============================

app.post("/send-email-ses", async (req, res) => {
  const sendmailVar = await sendEmail(
    [req.body.adminEmail],
    globalVariable.projectName + " Admin <" + globalVariable.SES_EMAIL + ">",
    req.body.subject,
    req.body.content
  );

  // console.log("sendmailVar => ", sendmailVar);
  if (sendmailVar) {
    res.status(200).json({ sendmailVar: sendmailVar });
  }
});

app.post("/send-email", (req, res) => {
  // console.log("/send-email req => ", req.body);

  let nodemailerValues = {
    host: globalVariable.emailHost,
    port: globalVariable.emailPort,
    auth: {
      user: globalVariable.user,
      pass: globalVariable.pass,
    },
  };

  // console.log("nodemailerValues => ", nodemailerValues);

  let transporter = nodeMailer.createTransport(nodemailerValues);

  let mailOptions = {
    from: globalVariable.projectName + "<" + globalVariable.user + ">", // sender address
    to: req.body.email ? req.body.email : req.body.toEmail, // list of receivers
    subject: req.body.subject, // Subject line
    text: req.body.text, // plain text body
    html: req.body.mail, // html body
  };

  // console.log("211 mailoptions", mailOptions);

  if (req.body.AddToContacts) {
    var url = "http://localhost:" + globalVariable.port + "/api/contacts/post";
    // console.log("url => ", url);
    axios
      .post(url, req.body)
      .then((contactResponse) => {
        // console.log("contactResponse => ", contactResponse);

        if (contactResponse.data.success) {
          //now send email to admin

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              // console.log("sendMail error => ", error);
              res.status(500).json({
                message: "Failed",
                data: error,
              });
            }
            if (info) {
              // console.log("sendMail info => ", info);
              res.status(200).json({
                message: "Success",
                data: info,
              });
            }
            // res.render('index');
          });
        } else {
          // console.log("catch error 242", contactResponse);
          res.status(500).json({
            message: "Error in Contact Insert",
            success: false,
            contactResponse: contactResponse,
          });
        }
      })
      .catch((error) => {
        // console.log("catch error 249", error);
        res.status(500).json({
          message: "Error in Contact Insert",
          success: false,
          error: error,
        });
      });
  } else {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.log("259 sendMail error => ", error);
        return "Failed";
      }
      if (info) {
        // console.log("263 sendMail info => ", info);
        res.status(200).json({
          message: "Success",
        });
      }
      res.render("index");
    });
  }
});

app.post("/send-email-mobile", (req, res) => {
  // console.log("inside app.js req:", req.body);
  let transporter = nodeMailer.createTransport({
    host: globalVariable.emailHost,
    port: globalVariable.emailPort,
    auth: {
      user: globalVariable.user,
      pass: globalVariable.pass,
    },
  });

  let mailOptions = {
    from: req.body.email, // list of receivers
    to: globalVariable.project + "<" + globalVariable.user + ">", // sender address
    subject: req.body.subject, // Subject line
    text: req.body.text, // plain text body
    html: req.body.mail, // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return "Failed";
    }
    if (info) {
      res.status(200).json({
        message: "Success",
      });
    } else {
      res.status(200).json({
        message: "Failed",
      });
    }
    res.render("index");
  });
});

app.use((req, res, next) => {
  const error = new Error("This Page Is Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  fs.readFile("./index.html", function (err, html) {
    if (err) {
      // console.log(err);
      res.end();
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(html);
      res.end();
    }
  });
});

module.exports = app;
