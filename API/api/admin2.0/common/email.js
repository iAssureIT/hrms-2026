const mongoose	            = require("mongoose");
const nodeMailer            = require('nodemailer');
const globalVariable        = require("../../../nodemonConfig.js");



function sendEmail(toEmail,subject,content,attachment){
    // console.log('====**INSIDE EMAIL**=====',toEmail, subject, content, attachment)
    return new Promise(function (resolve, reject) {
        if(attachment === null || attachment === undefined || attachment === ""){
            var attachment = []
        }else{
            var attachment = [attachment]
        }

               // console.log("globalVariable => ", globalVariable);

               const senderEmail       = globalVariable.user;
               const senderEmailPwd    = globalVariable.pass;
               const emailHost         = globalVariable.emailHost;
               const emailPort         = globalVariable.emailPort;
               const projectName       = globalVariable.projectName;
                
               // create reusable transporter object using the default SMTP transport
               let transporter = nodeMailer.createTransport({
                                    host    : emailHost,
                                    port    : emailPort,
                                    // secure  : false, // true for 465, false for other ports
                                    auth    : {
                                                user    : senderEmail, 
                                                pass    : senderEmailPwd 
                                    }
                                });

                // send mail with defined transport object
               var mailOptions = {
                    from        : projectName+'" Admin" <' + senderEmail + '>', // sender address
                    to          : toEmail, // list of receiver
                    subject     : subject, // Subject line
                    html        : "<pre>" + content + "</pre>", // html body
                    attachments : attachment,
                };
               
               // console.log("mailOptions => ",mailOptions);

               let info =  transporter.sendMail(mailOptions, (error, info) => {
                     console.log("Message sent: %s", error, "-", info);
                     if(error === null){
                        resolve(true)
                     }else{
                        console.log("Error While sending email => ",error)
                        resolve(false)
                     }
               });     
    })  
}

module.exports = sendEmail;
