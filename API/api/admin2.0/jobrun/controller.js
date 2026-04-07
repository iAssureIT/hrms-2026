const mongoose						= require("mongoose");
const Axios 						= require('axios');
const moment 						= require('moment');
const { sendNotification }   	= require("../common/globalFunctions");
const globalVariable 			= require("../../../nodemonConfig.js");
const Appointments 				= require('../appointments/model.js');
const Users 						= require('../userManagementnew/ModelUsers.js');
var ObjectId 						= require('mongodb').ObjectID;


exports.callReminder2HrsAgo = (req,res,next) => {
	var currDate               = moment(new Date()).format("DD-MM-YYYY")

	Appointments.find({appointmentDate:currDate })
	.then(async appointments=>{
		// console.log("appointments => ",appointments.length);
		if(appointments && appointments.length > 0){
			for(var i=0; i<appointments.length; i++){
				var currTime 		= moment().tz('Asia/Kolkata');
				var limitTime		= moment(appointments[i].meetingRoomDetails.scheduledTime).tz('Asia/Kolkata')
				// console.log("appointments[i].meetingRoomDetails.scheduledTime",appointments[i].meetingRoomDetails.scheduledTime)
				// console.log("limitTime",moment(limitTime).format("hh:mm"))
				// console.log("currTime",moment(currTime).format("hh:mm"))
				var timeDifference = (limitTime.diff(currTime, 'minutes'))
				// console.log("timeDifference",timeDifference)
				if(timeDifference <=125 && timeDifference >110){
					var sendReminderData = await sendReminder(appointments[i].user_id,appointments[i].consultant_id,appointments[i].meetingRoomDetails.scheduledTime,appointments[i].appointmentDate,appointments[i].appointmentTime);
					// console.log("sendReminderData=",sendReminderData)
					if(sendReminderData === 0){
						break;
						res.status(500).json({success : false, message : "Error while sending Reminder to User or Consultant." })
					}
					var remindersDates = [];
					var reminderCounts = remindersDates.push(appointments[i].meetingRoomDetails.scheduledTime)
					// console.log("reminderCounts",reminderCounts)
					if(i >= reminderCounts){
						// console.log("Total "+reminderCounts+" reminders sent today!");
						var result  = true
						var message = "Total "+reminderCounts+" reminders sent today!"
					}
				}else{
					var result  = true
					var message = "No reminders sent today !"
				}
			}
		}else{				
			// console.log("No reminders are sent today!");
			var result  = true
			var message = "No reminders are sent today!"
		}
		res.status(200).json({success : result, message : message });
	})
	.catch(error => {
		console.log("1 Error during Find Appointment : ", error);
		res.status(500).json({ message: "Error during Find Appointment", error: error });
	})
}
function sendReminder(user_id, consultant_id, scheduledTime,appointmentDate,appointmentTime){
	return new Promise( (resolve,reject)=>{
		Users.findOne({_id:ObjectId(user_id)})
		.then( user => {
			Users.findOne({_id:ObjectId(consultant_id)})
			.then(async consultant => {
				
				// console.log("user",user.profile.email);
				// console.log("consultant",consultant.profile.email);
				var userNotificationValues = {
		         toEmail          : user.profile.email,
		         toMobileNumber   : user.profile.isdCode + user.profile.mobile,
		         event            : "Call Reminder 2 Hours Ago",
		         toUserRole       : "user",
		         variables        : { 
		                              UserFullName		: user.profile.fullName,
		                              ConsultantName 	: consultant.profile.fullName,
		                              IntroCallDate		: appointmentDate,
												IntroCallTime		: appointmentTime + " IST",
		                              AppointmentTime 	: moment(scheduledTime).format("DD.MM.YYYY HH:mm"),
		                              IntroCallLink 		: "Link TBD"
		                           },
		     	};  
		     
				var consultantNotificationValues = {
		         toEmail          : consultant.profile.email,
		         toMobileNumber   : consultant.profile.isdCode + consultant.profile.mobile,
		         event            : "Call Reminder 2 Hours Ago",
		         toUserRole       : "consultant",
		         variables        : { 
		                              UserFullName		: user.profile.fullName,
		                              ConsultantName 	: consultant.profile.fullName,
		                              IntroCallDate		: appointmentDate,
												IntroCallTime		: appointmentTime + " IST",
		                              AppointmentTime 	: moment(scheduledTime).format("DD.MM.YYYY HH:mm"),
		                              IntroCallLink 		: "Link TBD"
		                           },
		     	};    
				var send_notification_to_consultant = await sendNotification(consultantNotificationValues);
				var send_notification_to_user 		= await sendNotification(userNotificationValues);
				resolve(1);

			})
			.catch(error=>{
				console.log("sendReminder consultant error => ",error);
				resolve(0);
			})
		})
		.catch(error=>{
			console.log("sendReminder user error => ",error);
			resolve(0);
		})
	})
}


exports.updateSubplanRenewal = (req,res,next) => {

	var endDateISO = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
	// console.log("endDateISO => ",endDateISO);

	Users.find({"subscriptionDetails.endDateISO" : endDateISO},{subscriptionDetails : 1})
		.then(async lastDaySubplans => {
			// console.log("lastDaySubplans => ",lastDaySubplans);
			if(lastDaySubplans && lastDaySubplans.length > 0){
				for(var i=0; i<lastDaySubplans.length; i++){
					var updateUser = await updateUserSubplan(lastDaySubplans[i]._id);					
					// console.log(i," updateUser => ",updateUser);
					if(updateUser === 0){
						break;
						res.status(500).json({success : false, message : "Error while updateUserSubplan " })
					}
				}
				if(i >= lastDaySubplans.length){
					// console.log("Total "+lastDaySubplans.length+" users plan expired today!");
					res.status(200).json({success : true, message : "Total "+lastDaySubplans.length+" users plan expired today!" })
				}
			}else{				
				// console.log("No user had expiry of subscription plan!");
				res.status(200).json({success : true, message : "No user had expiry of subscription plan!" });
			}
		})
		.catch(error =>{
			// console.log("updateSubplanRenewal error => ",error);
			res.status(500).json({success : false, message : "Error while updateSubplanRenewal => "+error.message })
		})


}

function updateUserSubplan(user_id){

	return new Promise( (resolve,reject)=>{
		Users.findOneAndUpdate(
					{_id : user_id},
					{$set : {"subscriptionDetails.status" : "expired"} },
					{returnNewDocument : true}
				)
			.then(async updatedUser => {
				// console.log("updatedUser.subscriptionDetails.status => ",updatedUser.subscriptionDetails.status);
				var prevSub = updatedUser.subscriptionDetails;
				if(updatedUser.subscriptionDetails.futurePlans.length > 0){
					var addPlanHistoryToUser = await addPlanHistory_User(user_id, prevSub)
					var paidFutureArr = updatedUser.subscriptionDetails.futurePlans.filter((item)=>{return item.status === 'paid'})
					var x = paidFutureArr[0];
					function removeValue(value, index, arr) {
					    if (value.order_id == x.order_id) {
					        arr.splice(index, 1);
					        return true;
					    }
					    return false;
					}
					var removedValue = paidFutureArr.filter(removeValue);

					Users.updateOne({_id : user_id},
										{
											$set:{
														"subscriptionDetails.planName" 			: x.planName,
														"subscriptionDetails.planCost" 			: x.planCost,
														"subscriptionDetails.gstRate" 			: x.gstRate,
														"subscriptionDetails.gstAmount" 			: x.gstAmount,
														"subscriptionDetails.amountPayable" 	: x.amountPayable,
														"subscriptionDetails.planType" 			: x.planType,
														"subscriptionDetails.startDate" 			: x.startDate,
														"subscriptionDetails.startDateISO" 		: x.startDateISO,
														"subscriptionDetails.endDate" 			: x.endDate,
														"subscriptionDetails.endDateISO" 		: x.endDateISO,
														"subscriptionDetails.order_id" 			: x.order_id,
														"subscriptionDetails.status" 				: x.status,	
														"subscriptionDetails.futurePlans" 		: paidFutureArr,																
													},
										})
					.then(uu2 => {
						console.log("uu2 => ",uu2);
            			sendNotif("New Subscription Plan Activated", x.planName);
						resolve(1);
					})
					.catch(error=>{
						console.log("updateUserSubplan error => ",error);
						resolve(0);
					})

				}else{
           		sendNotif("Subscription Plan Expired","");
					console.log("no futurePlans")
			      resolve(1)					
				}
				function sendNotif(event,newPlan){
			      sendNotification({
			         toEmail          : updatedUser.profile.email,
			         toMobileNumber   : updatedUser.profile.isdCode + updatedUser.profile.mobile,
			         event            : event,
			         toUserRole       : "consultant",
			         variables        : { 
			                              UserFullName: updatedUser.profile.fullName,
			                              PrevPlan: prevSub.planName,
			                              NewPlan:newPlan
			                          
			                           },
			     });         	
			   }

			})
			.catch(error=>{
				console.log("updateUserSubplan error => ",error);
				resolve(0);
			})
	})
}

function addPlanHistory_User(user_id, prevSub){
	return new Promise( (resolve,reject)=>{
		Users.updateOne(
							{_id : user_id},
							{
								$push : {
									"subscriptionDetails.planHistory" : {
										"planName" 			: prevSub.planName,
										"planCost" 			: prevSub.planCost,
										"gstRate" 			: prevSub.gstRate,
										"gstAmount" 		: prevSub.gstAmount,
										"amountPayable" 	: prevSub.amountPayable,
										"planType" 			: prevSub.planType,
										"startDate" 		: prevSub.startDate,
										"startDateISO" 	: prevSub.startDateISO,
										"endDate" 			: prevSub.endDate,
										"endDateISO" 		: prevSub.endDateISO,
										"order_id" 			: prevSub.order_id,
										"status" 			: "expired"															
									}
								}
							})
					.then(updateData => {
						console.log("addPlanHistoryToUser => ",updateData);
						resolve(1);
					})
					.catch(error=>{
						console.log("addPlanHistoryToUser error => ",error);
						resolve(0);
					})
	})
}


					// 	const formValues = {
				   //      	"email"         	 : updatedUser.profile.fullName ,
				   //      	"subject"       : "New Subscription Plan Activated",
				   //      	"text"          : "",
				   //      	"mail"          : "<p>Dear User,</p> \n\n" +
					//                         "<p>Your Previous "+ prevSub.planName +"Subscription Plan has been expired today. \n" +
					//                         "<p>& New "+ x.planName +"Subscription Plan is activated successfully. \n" +
					//                         "<p>==================== <br/>\n" + 
					//                         "Thanks & Regards <br/>\n" + 
					//                         "admin2.0 Portal System</p>" ,
					//   	};
					// Axios.post('http://localhost:' + globalVariable.port + '/api/send-email', formValues)
				   //      .then((res)=>{
				   //      	console.log("sendmail new Plan activated res")
					// 		})
					// 		.catch((error)=>{
					// 			console.log("sendmail new Plan activated error = ", error);				
					// 		});


					// const formValues = {
			      //   	"email"         	 : updatedUser.profile.fullName ,
			      //   	"subject"       : "Subscription Plan Expired",
			      //   	"text"          : "",
			      //   	"mail"          : "<p>Dear User,</p> \n\n" +
				   //                      "<p>Your Subscription Plan has been expired today. \n" +
				   //                      "<p>==================== <br/>\n" + 
				   //                      "Thanks & Regards <br/>\n" + 
				   //                      "admin2.0 Portal System</p>" ,
				  	// };
					// Axios.post('http://localhost:' + globalVariable.port + '/api/send-email', formValues)
			      //   .then((res)=>{
			      //   	console.log("sendmail Expired res")
					// 	})
					// 	.catch((error)=>{
			      //   		resolve(0)
					// 		console.log("sendmail Expired error = ", error);				
					// 	});