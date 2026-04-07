const mongoose	            = require("mongoose");
const Masternotifications   = require('./ModelMasterNotification.js');
const Notifications         = require('./ModelNotification.js');
const User 				    = require('../userManagement/ModelUsers.js');
const PersonMaster          = require('../personMaster/ModelPersonMaster.js');
const EntityMaster          = require('../entityMaster/ModelEntityMaster.js');
const EventTokenMaster      = require('../EventTokenMaster/ModelEventTokenMaster.js');
const nodeMailer            = require('nodemailer');
const GlobalMaster          = require('../projectSettings/ModelProjectSettings.js');
const plivo                 = require('plivo');
const FailedRecords         = require('../failedRecords/ModelFailedRecords');


exports.create_masternotification = (req,res,next)=>{
	Masternotifications.findOne({templateType:req.body.templateType,event:req.body.event,role:req.body.role,status:req.body.status,company:req.body.company})
    .exec()
    .then(data =>{
        if(data){
            return res.status(200).json({
                message: 'Notification Details already exists'
            });
        }else{
            const masternotifications = new Masternotifications({
                _id             : new mongoose.Types.ObjectId(),
                templateType    : req.body.templateType,	
                event           : req.body.event,    
                templateName    : req.body.templateName,    
                role            : req.body.role,
                company         : req.body.company,
                subject         : req.body.subject,
                content         : req.body.content,	
                status          : req.body.status, 
                createdAt       : new Date(),
                createdBy       : req.body.createdBy,
            });
            masternotifications.save()
            .then(data=>{
                res.status(200).json({message: "Notification Details Added",ID:data._id});
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.list_masternotification = (req,res,next)=>{
    Masternotifications.find({})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.list_mode_masternotification = (req,res,next)=>{
    Masternotifications.find({"templateType":req.body.mode,"event":req.body.event})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.list_type_masternotification = (req,res,next)=>{
    Masternotifications.find({"templateType":req.params.type})
    .sort({createdAt: -1})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.detail_masternotification = (req,res,next)=>{
    Masternotifications.findOne({_id:req.params.notificationmaster_ID})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.update_masternotification = (req,res,next)=>{
    Masternotifications.updateOne(
        { _id:req.body.editId},  
        {
            $set:{
                status          : req.body.status,
                subject         : req.body.subject,
                content         : req.body.content
            }
        }
    )
    .exec()
    .then(data=>{
        if(data.modifiedCount == 1){
            res.status(200).json({ message:"Master notifications Updated"});
        }else{
            res.status(401).json({ message:"Master notifications Found"});
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.update_status = (req,res,next)=>{
    Masternotifications.updateOne(
        { _id:req.body.notifId},  
        {
            $set:{
                status          : req.body.status,
            }
        }
    )
    .exec()
    .then(data=>{
        if(data.modifiedCount == 1){
            res.status(200).json({ updated : true });
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.delete_masternotification = (req,res,next)=>{
    Masternotifications.deleteOne({_id:req.params.ID})
        .exec()
        .then(data=>{
            if(data.deletedCount == 1){
                res.status(200).json("Master notification deleted");
            }else{
                res.status(401).json("Master notification not found");
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.deleteall_masternotification = (req,res,next)=>{
    Masternotifications.deleteMany({})
        .exec()
        .then(data=>{
            if(data.deletedCount > 0){
                res.status(200).json("All Master notification deleted");
            }else{
                res.status(401).json("Master notification not found");
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.filterTemplate = (req,res,next)=>{
    var selector = {}; 
    selector['$and']=[];

    if (req.body.filterEvent) {
        selector["$and"].push({ templateName : { $regex : req.body.filterEvent, $options: "i"}  })
    }
    if (req.body.filterRole) {
        selector["$and"].push({ role : { $regex : req.body.filterRole, $options: "i"}  })
    }
    if (req.body.filterStatus) {
        selector["$and"].push({ status : { $regex : req.body.filterStatus, $options: "i"}  })
    }
    if (req.body.filterCompany) {
        selector["$and"].push({ company : req.body.filterCompany })
    }
    if (req.params.type) {
        selector["$and"].push({ templateType : req.params.type })
    }
    
    Masternotifications.find(selector)
    .sort({createdAt : -1})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.send_notifications = (req, res, next) => {
    // console.log("notification body => ", req.body)
    Masternotifications.find({event : req.body.event, status :'active'})
    .sort({createdAt : 1})
    .exec()
    .then(data=>{
        main();
        async function main(){
            // console.log('========================================================')
            var returnData = data
            // console.log('returnData=>',returnData)
            if(returnData && returnData.length > 0){
                for(var i=0 ; i< returnData.length ; i++){
                    // console.log("Entering for loop for returnData at : ",i)
                    var role = returnData[i].role;
                    
                    // console.log("role : ",role)

                    var company         = req.body.company_id;
                    var templateName    = returnData[i].event;
                    var mode            = returnData[i].templateType;
                    
                    // console.log("mode", mode);

                    // console.log('notification data=>',role, company, templateName, mode, req.body.toUserRole)


                    if(role == 'admin'){
                        // console.log('admin==>',mode,templateName,company)
                        var userData = await getAdminUserData();
                        if(userData && userData.length > 0){
                           for(var j=0 ; j<userData.length ; j++){
                                var userRole  = userData[j].role
                                var checkRole = userRole.includes(role);
                                if(checkRole){
                                    await callTemplates(mode,userData[j],role,templateName,company,req.body.variables,req.body.attachment)
                                }
                           }//j 
                        //    if(j >= userData.length){
                        //         res.status(200).json({ message : "Message sent successfully"});
                        //    }
                        }
                        
                    }else if(role === req.body.toUserRole){
                        // console.log('admin toUserrole==>',role)
                        var userData    = await getSelfUserData(req.body.toUser_id);
                        // console.log("userData->",userData)
                        var userRole    = userData.role
                        // console.log("userRole->",userRole)
                        var checkRole   = userRole.includes(role);
                        // console.log("checkRole->",checkRole)
                        if(checkRole){
                            var a = await callTemplates(mode,userData,role,templateName,company,req.body.variables,req.body.attachment)
                            // console.log("a => ",a);
                            // if(a){
                            //     res.status(200).json({ message : "Message sent successfully"});
                            // }
                        }
                        // else{
                        //     res.status(200).json({ message : "Failed to sent message successfully"});
                        // }
                        
                    }else if(role === req.body.intendedUserRole){
                        // console.log('manager==>',mode,templateName,company)
                        var userData    = await getIntendedUserData(req.body.intendedUser_id);
                        var userRole    = userData.role
                        var checkRole   = userRole.includes(role);
                        if(checkRole){
                            var b = await callTemplates(mode,userData,role,templateName,company,req.body.variables,req.body.attachment)
                        }
                        // res.status(200).json({ message : "Message sent successfully"});
                    }else if(role === req.body.otherAdminRole && req.body.company_id){
                        //  console.log('corporate==>',mode,templateName,company)
                        var userData = await getOtherAdminData(req.body.otherAdminRole,req.body.company_id);
                        if(userData && userData.length > 0){
                           for(var j=0 ; j<userData.length ; j++){
                            var userRole    = userData[j].role
                            var checkRole   = userRole.includes(role);
                                if(checkRole){
                                    var c = await callTemplates(mode,userData[j],role,templateName,company,req.body.variables,req.body.attachment)
                                    // console.log("c  => ",c)
                                }
                            }//j 
                            // if(j >= userData.length){
                            //     res.status(200).json({ message : "Message sent successfully"});
                            // }
                        }
                    }else{
                        console.log('No data found')
                    }
                    // console.log('***************************************************')
                }//i
                if(i >= returnData.length){
                    res.status(200).json({ message : "Message sent successfully"});
                }
            }else{
                res.status(200).json({ message : "No event available for Place New Order" });
            }//returnData
        }
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });   
}

function callTemplates(mode,userData,role,templateName,company,variables,attachment){
    return new Promise(function (resolve, reject) {
        sub();
        async function sub(){
            // console.log("mode,userData,role,templateName,company,variables,attachment",mode,userData,role,templateName,company,variables,attachment);
            //==============  SEND EMAIL ================
            if(mode === 'Email'){
                var toEmail         = userData.email;
                const emailDetails  = await getTemplateDetailsEmail(company,templateName,userData.role,variables);
                const sendMail      = await sendEmail(toEmail,emailDetails.subject,emailDetails.content,attachment)
                resolve(true);
            }else if(mode === 'Notification'){
                var toUserId                = userData.id;
                const notificationDetails   = await getTemplateDetailsInApp(company,templateName,userData.role,variables); 
                const sendNotification      = await sendInAppNotification(toUserId,userData.email,templateName,notificationDetails)
                resolve(true);
            }else if(mode === 'SMS'){
                // console.log("Inside SMS",company,templateName,userData,role,variables);
                if(userData.mobile){
                    var toMobile        = userData.mobile.replace(/[|&;$%@"<>()-+-,]/g, "");
                    const SMSDetails    = await getTemplateDetailsSMS(company,templateName,userData.role,variables);
                    var text            = SMSDetails.content.replace(/<[^>]+>/g, '');
                    // console.log("toMobile",toMobile);
                    const SMS           = await sendSMS(toMobile, text);  
                    // console.log("SMS => ",SMS)  
                }
                resolve(true);            
            }// mode == 'SMS'
        }
    })
}

function getAdminUserData() {
    return new Promise(function (resolve, reject) {
        User.find({"roles" : "admin"})
        .exec()
        .then(data => {
            if(data && data.length>0){
                var userData = [];

                for(var i=0 ; i<data.length ; i++){

                    if(data[i].profile){
                        userData.push({email:data[i].profile.email,
                            id      : data[i]._id,
                            mobile  : data[i].profile.mobile,
                            role    : "admin"
                        });
                    }
                }//i
                resolve(userData)
            }
        })
        .catch(err => {
            console.log(err);
            reject({
                error : err
            });
        });

    });
}

function getSelfUserData(toUserId) {
    // console.log("toUserId",toUserId);
    return new Promise(function (resolve, reject) {
        User.findOne({ "_id": toUserId })
        .exec()
        .then(data => {
            // console.log("data",data)
            if(data && data.profile){
                resolve({
                    email       : data.profile.email,
                    id          : data._id,
                    mobile      : data.profile.mobile,
                    role        : data.roles
                });
            }   
        })
        .catch(err => {
            console.log(err);
            reject({
                error: err
            });
        });    
    });
}

function getIntendedUserData(toUserId) {
    return new Promise(function (resolve, reject) {
        PersonMaster.findOne({'_id':toUserId})
        .exec()
        .then(result=>{
         User
            .findOne({ "_id": result.userId })
            .exec()
            .then(data => {
                if(data && data.profile){
                resolve({email:data.profile.email,
                        id: data._id,
                        mobile: data.profile.mobile,
                        role:data.roles
                });
                }
            })
            .catch(err => {
                console.log(err);
                reject({
                    error: err
                });
            });
        })
        .catch(err =>{
            console.log('personMaster error: ',err)
        })

    });
}
function getOtherAdminData(role,company_id){
    return new Promise(function (resolve, reject) {
        EntityMaster.findOne({'_id':company_id})
        .exec()
        .then(result => {
            if(result.companyID){
                User.find({ "profile.companyID": result.companyID, "roles":role})
                .exec()
                .then(data => {
                    if(data && data.length>0){
                        var userData = []
                        for(var i=0 ; i<data.length ; i++){
                            if(data[i].profile){
                                userData.push({email:data[i].profile.email,
                                        id: data[i]._id,
                                        mobile: data[i].profile.mobile,
                                        role:data[i].roles
                                });
                            }
                        }//i
                        resolve(userData)
                    }
                })
                .catch(err => {
                    console.log(err);
                    reject({
                        error: err
                    });
                });
            }
        })
        .catch(err =>{
            console.log('entityMaster error: ',err)
        })

    });
}


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
function sendSMS(MobileNumber,text){
    return new Promise(function (resolve, reject) {
    // console.log('=====INSIDE SMS======',MobileNumber,text)
        GlobalMaster.findOne({type:'SMS'})
        .exec() 
        .then(data=>{
            // console.log("data => ",data)
            if(data !== null){
                // console.log('data.authID,data.authToken,data.sourceMobile: ',data.authToken, data.sourceMobile)
                var msg91 = require("msg91")(data.authToken, "FIVEBE", "4" );
                var mobileNo = MobileNumber.split(" ").join("");
                // console.log("mobileNo IN SMS=====>",MobileNumber.replaceAll("[\\D]", ""));
                // console.log("mobileNo IN SMS=====>",mobileNo);
                msg91.send(mobileNo, text.toString(), function(err, response){
                    // console.log(err);
                    // console.log("response IN SMS =====>",response);
                    resolve(true)
                });
            }else{
                resolve("No SMS Data Found")
            }
        })
        .catch(err =>{
            reject(err)
        });
    })
}

function sendInAppNotification(toUserId,email,event,notificationDetails){
    return new Promise(function (resolve, reject) {
        const InAppNotification = new Notifications({
            _id             : new mongoose.Types.ObjectId(),
            masternotificationId : notificationDetails.id,
            toMailId        : email,
            event           : event,
            toUserId         : toUserId,
            status          : 'Unread',
            notifBody       : notificationDetails.content,
            createdAt       : new Date()
        });
        InAppNotification.save()
        .then(data=>{
            resolve(data);
        })
        .catch(err =>{
            reject(err);
        });
    })
}

function sendEmail(toEmail,subject,content,attachment){
    // console.log('====**INSIDE EMAIL**=====',toEmail,subject,content,attachment)
    if(attachment == null || attachment == undefined || attachment == ""){
        var attachment = []
    }else{
        var attachment = [attachment]
    }
    // async function main() { 
      GlobalMaster.findOne({type:'EMAIL'})
        .exec() 
        .then(data=>{
            const senderEmail = data.user;
            const senderEmailPwd = data.password;
            // create reusable transporter object using the default SMTP transport
              let transporter = nodeMailer.createTransport({
                host: data.emailHost,
                port: data.port,
                // secure: false, // true for 465, false for other ports
                auth: {
                  user: senderEmail, 
                  pass: senderEmailPwd 
                }
              });

              // send mail with defined transport object
              var mailOptions = {
                    from: data.projectName+'" Admin" <' + senderEmail + '>', // sender address
                    to: toEmail, // list of receiver
                    subject: subject, // Subject line
                    html: "<pre>" + content + "</pre>", // html body
                    attachments: attachment,
                };
               let info =  transporter.sendMail(mailOptions, (error, info) => {
                    // console.log("Message sent: %s", error,info);
                });
             
              // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // console.log("Message sent: %s", info.messageId);
              // Preview only available when sending through an Ethereal account
              // console.log("Preview URL: %s", nodeMailer.getTestMessageUrl(info));
              // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
              
            

        })
        .catch(err =>{
            console.log('mail error=>',err)
        });
         // main().catch(err=>{console.log('mail error=>',err)});
      
   // }
   
}


function getTemplateDetailsEmail(company,templateName,role,variables) {
    // console.log(company,templateName, variables)
    
   return new Promise(function (resolve, reject) {
      Masternotifications.findOne({ "event": templateName, "templateType": 'Email', "role":role, status:'active' })
         .exec()
         .then(async NotificationData => {
            if (NotificationData) {
               var content = NotificationData.content;
               var replacedContent = await relpaceVariables(content,variables);

               var subject = NotificationData.subject;
               var replacedSubject = await relpaceVariables(subject,variables);

               var tData = {
                  content: replacedContent,
                  subject: replacedSubject
               }
               console.log("Masternotifications tData => ", tData);
               resolve(tData);
            }
         })
         .catch(err => {
             console.log(err);
             reject(err);
         });
   });           
}

function relpaceVariables(text,variables){   
   return new Promise((resolve,reject)=>{
      var wordsplit = [];
      if (text.indexOf('[') > -1) {
         wordsplit = text.split('[');
      }
      var tokens = [];
      var n = 0;
      for (i = 0; i < wordsplit.length; i++) {
         if (wordsplit[i].indexOf(']') > -1) {
            tokensArr = wordsplit[i].split(']');
            tokens[n] = tokensArr[0];
            n++;
         }
      }
      var numOfVar = Object.keys(variables).length;
      for (i = 0; i < numOfVar; i++) {
         text = text.replace(tokens[i], variables[tokens[i]]);
      }
      if(i >= numOfVar){
           text = text.split("[").join(" ");
           text = text.split("]").join(" ");

           console.log("relpaceVariables text => ",text);

           resolve(text);
      }      
   })
}

function getTemplateDetailsSMS(company, templateName,role,variables) {
    // console.log('|||||||||||||INSIDE SMS TEMPLATE||||||||||||',company, templateName,role,variables)
    return new Promise(function (resolve, reject) {
        Masternotifications.findOne({ "event": templateName, "templateType": 'SMS', "company": company, "role":role, status:'active' })
            .exec()
            .then(NotificationData => {
                if (NotificationData) {
                    var content = NotificationData.content;
                    var wordsplit = [];
                    if (content.indexOf('[') > -1) {
                        wordsplit = content.split('[');
                    }
                    var tokens = [];
                    var n = 0;
                    for (i = 0; i < wordsplit.length; i++) {
                        if (wordsplit[i].indexOf(']') > -1) {
                            tokensArr = wordsplit[i].split(']');
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
                        subject: NotificationData.subject
                    }
                    resolve(tData);
                }else{
                     Masternotifications.findOne({ "event": templateName, "templateType": 'SMS', "company": null, "role":role, status:'active' })
                    .exec()
                    .then(NotificationData => {
                        if (NotificationData) {
                            var content = NotificationData.content;
                            var wordsplit = [];
                            if (content.indexOf('[') > -1) {
                                wordsplit = content.split('[');
                            }
                            var tokens = [];
                            var n = 0;
                            for (i = 0; i < wordsplit.length; i++) {
                                if (wordsplit[i].indexOf(']') > -1) {
                                    tokensArr = wordsplit[i].split(']');
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
                                subject: NotificationData.subject
                            }
                            resolve(tData);
                        }//NotificationData
                    })
                    .catch(err => {
                        console.log(err);
                        err.status(500).json({
                            error: err
                        });
                    });
                }
            })
            .catch(err => {
                console.log(err);
                err.status(500).json({
                    error: err
                });
            });
    });
}

function getTemplateDetailsInApp(company, templateName,role,variables) {
    // console.log('in app: ',company,templateName, variables)
    return new Promise(function (resolve, reject) {
        Masternotifications.findOne({ "event": templateName, "templateType": 'Notification', "company": company, "role":role, status:'active' })
            .exec()
            .then(NotificationData => {
                if (NotificationData) {
                    var content = NotificationData.content;
                    var wordsplit = [];
                    if (content.indexOf('[') > -1) {
                        wordsplit = content.split('[');
                    }
                    var tokens = [];
                    var n = 0;
                    for (i = 0; i < wordsplit.length; i++) {
                        if (wordsplit[i].indexOf(']') > -1) {
                            tokensArr = wordsplit[i].split(']');
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
                        id:NotificationData._id,  
                        content: content,
                    }
                    resolve(tData);
                }else{
                     Masternotifications.findOne({ "event": templateName, "templateType": 'Notification', "company": null, "role":role, status:'active' })
                    .exec()
                    .then(NotificationData => {
                        if (NotificationData) {
                            var content = NotificationData.content;
                            var wordsplit = [];
                            if (content.indexOf('[') > -1) {
                                wordsplit = content.split('[');
                            }
                            var tokens = [];
                            var n = 0;
                            for (i = 0; i < wordsplit.length; i++) {
                                if (wordsplit[i].indexOf(']') > -1) {
                                    tokensArr = wordsplit[i].split(']');
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
                                id:NotificationData._id,  
                                content: content,
                            }
                            resolve(tData);
                        }//NotificationData
                    })
                    .catch(err => {
                        console.log(err);
                        reject({
                            error: err
                        });
                    });
                }
            })
            .catch(err => {
                console.log(err);
                reject({
                    error: err
                });
            });
    });
}

exports.filedetails = (req,res,next)=>{
    // console.log('req------',req,'res',res);
    var finaldata = {};
    // console.log(req.params.fileName)
    Masternotifications.find( { fileName:req.params.fileName  }
    )
    .exec()
    .then(data=>{
        // finaldata.push({goodrecords: data})
        finaldata.goodrecords = data;
        FailedRecords.find({fileName:req.params.fileName})  
            .exec()
            .then(badData=>{
                finaldata.failedRecords = badData[0].failedRecords
                finaldata.totalRecords = badData[0].totalRecords
                res.status(200).json(finaldata);
            })
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};


var fetchAllNotification = async (type) => {
    return new Promise(function (resolve, reject) {
        Masternotifications.find({entityType:type})
            .sort({ createdAt: -1 })
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
};

function getcompany(entityType,company){
    return new Promise(function (resolve, reject) {
       EntityMaster.findOne({companyName : { $regex : company, $options: "i"},entityType : entityType})
        .exec()
        .then(data=>{
            // console.log("company data----",data);
            if(data){
                resolve(data._id);
            }else{
                resolve({message:"COMPANY_NOT_FOUND"})
            }
        })
        .catch(err =>{
            reject(err);
        });
    });
};

function getEvent(templateName){
    return new Promise(function (resolve, reject) {
        EventTokenMaster.findOne({templateName : templateName})
        .exec()
        .then(data=>{
            if(data){
                resolve(data.event);
            }else{
                resolve({message:"EVENT_NOT_FOUND"})
            }
        })
        .catch(err =>{
            reject(err);
        });
    });
};

exports.bulkUploadNotification = (req, res, next) => {
    var Notification = req.body.data;
    // console.log("Notification",req.body.data)
    var validData = [];
    var validObjects = [];
    var invalidData = [];
    var invalidObjects = [];
    var remark = '';
    var failedRecords = [];
    var Count = 0;
    var DuplicateCount = 0;
    processData();
    async function processData() {

        for (var k = 0; k < Notification.length; k++) {
            if (Notification[k].templateType == '-') {
                remark += "templateType not found, ";
            }
            if (Notification[k].event == '-') {
                remark += "event not found, ";
            }
            if (Notification[k].templateName == '-') {
                remark += "templateName not found, ";
            }
            if (Notification[k].role == '-') {
                remark += "role not found, ";
            }
            // if (Notification[k].company == '-') {
            //     remark += "company not found, ";
            // }
            if (Notification[k].templateType == 'Email' && Notification[k].subject == '-') {
                remark += "subject not found, ";
            }
            if (Notification[k].content== '-') {
                remark += "content  not found, ";
            }
           
            // else if(entity[i].state != "-" && entity[i].GSTIN !="-"&& entity[i].PAN){

            // }
            var companylist=[];
            var company = await getcompany(Notification[k].entityType,Notification[k].company)
            // console.log("company list",company);
            if(Notification[k].company != '-' && company){
                if(company.message === 'COMPANY_NOT_FOUND'){
                    remark += "company not found, ";
                    var companyId = null
                }else{
                    var companyId = company
                }
                
            }
            var event = await getEvent(Notification[k].templateName)
            if(event){
                if(event.message === 'EVENT_NOT_FOUND'){
                    remark += "event not found, ";
                }else{
                    var eventName = event
                }
                
            }

            if (remark == '') {
               
                var AllNotification = await fetchAllNotification(req.body.reqdata.entityType);
                
                // check if employee exists
                var notificationExists = AllNotification.filter((data) => {
                    if (data.templateType == Notification[k].templateType
                        && data.event == Notification[k].event
                        && data.templateName == Notification[k].templateName
                        && data.company == Notification[k].company) {
                        return data;
                    }
                })

                if (notificationExists.length == 0) {

                    validObjects = {
                    fileName       : req.body.fileName,       
                    templateType    : Notification[k].templateType,  
                    event           : eventName,
                    templateName    : Notification[k].templateName,    
                    role            : Notification[k].role,
                    company         : companyId ? companyId : null,
                    subject         : Notification[k].subject,
                    content         : Notification[k].content,
                    status          : "active"
                    }

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
            remark = '';
        }
        //console.log("validData",validData);
        Masternotifications.insertMany(validData)
            .then(data => {

            })
            .catch(err => {
                console.log(err);
            });

        failedRecords.FailedRecords = invalidData;
        failedRecords.fileName = req.body.fileName;
        failedRecords.totalRecords = req.body.totalRecords;

        await insertFailedRecords(failedRecords, req.body.updateBadData);

        res.status(200).json({
            "message": "Bulk upload process is completed successfully!",
            "completed": true
        });
    }
};
var insertFailedRecords = async (invalidData, updateBadData) => {
    //console.log('invalidData',invalidData);
    return new Promise(function (resolve, reject) {
        FailedRecords.find({ fileName: invalidData.fileName })
            .exec()
            .then(data => {
                if (data.length > 0) {
                    //console.log('data',data[0].failedRecords.length)   
                    if (data[0].failedRecords.length > 0) {
                        if (updateBadData) {
                            FailedRecords.updateOne({ fileName: invalidData.fileName },
                                { $set: { 'failedRecords': [] } })
                                .then(data => {
                                    if (data.modifiedCount == 1) {
                                        FailedRecords.updateOne({ fileName: invalidData.fileName },
                                            {
                                                $set: { 'totalRecords': invalidData.totalRecords },
                                                $push: { 'failedRecords': invalidData.FailedRecords }
                                            })
                                            .then(data => {
                                                if (data.modifiedCount == 1) {
                                                    resolve(data);
                                                } else {
                                                    resolve(data);
                                                }
                                            })
                                            .catch(err => { reject(err); });
                                    } else {
                                        resolve(0);
                                    }
                                })
                                .catch(err => { reject(err); });
                        } else {
                            FailedRecords.updateOne({ fileName: invalidData.fileName },
                                {
                                    $set: { 'totalRecords': invalidData.totalRecords },
                                    $push: { 'failedRecords': invalidData.FailedRecords }
                                })
                                .then(data => {
                                    if (data.modifiedCount == 1) {
                                        resolve(data);
                                    } else {
                                        resolve(data);
                                    }
                                })
                                .catch(err => { reject(err); });
                        }

                    } else {
                        FailedRecords.updateOne({ fileName: invalidData.fileName },
                            {
                                $set: { 'totalRecords': invalidData.totalRecords },
                                $push: { 'failedRecords': invalidData.FailedRecords }
                            })
                            .then(data => {
                                if (data.modifiedCount == 1) {
                                    resolve(data);
                                } else {
                                    resolve(data);
                                }
                            })
                            .catch(err => { reject(err); });
                    }
                } else {
                    const failedRecords = new FailedRecords({
                        _id: new mongoose.Types.ObjectId(),
                        failedRecords: invalidData.FailedRecords,
                        fileName: invalidData.fileName,
                        totalRecords: invalidData.totalRecords,
                        createdAt: new Date()
                    });

                    failedRecords
                        .save()
                        .then(data => {
                            resolve(data._id);
                        })
                        .catch(err => {
                            console.log(err);
                            reject(err);
                        });
                }
            })

    })
}




