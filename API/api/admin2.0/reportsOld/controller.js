const mongoose			  		   = require("mongoose");
var ObjectID 				      = require('mongodb').ObjectID;
const AppointmentSlots  		= require('../appointmentSlots/model')
const Appointments 				= require('../appointments/model')
const moment 			  			= require('moment');
const User 							= require('../userManagementnew/ModelUsers.js');
const Queries	 					= require('../queries/model.js');
const Feedback	 					= require('../feedback/model.js');

exports.getConsultantReport = (req, res, next) => {
	// console.log("req.body = ",req.body);
	var selector = { 
			'createdAt' : {$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) },			
         roles 			: 'consultant',
         // approvalStatus : "Approved"
		};
	if(req.body.searchText !== ""){
		selector = {...selector, $or : [
                  {"profile.companyName"  				 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.firstname"                 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.lastname"                  : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.fullName"                  : { "$regex" : req.body.searchText, $options: "i" }},
               ]
            }
	}
	// console.log("selector => ",selector);
	User.find(selector)
		.populate("profile.company_id")
		.then(response => {
			// console.log("response => ",response.length)
			const consultants = response.map(async (consultant, index) => {
				const appointmentSlot = await AppointmentSlots.find({ user_id: consultant ? consultant._id : ""});
				const workingDays     = appointmentSlot?.dayWiseSlots?.length > 0 ? appointmentSlot.dayWiseSlots.map((slotObj) => slotObj.day).join(", ") : "DEFAULT";
				return {
					srNo 							: index + 1,
					enterpriseName 			: consultant?.profile?.company_id.enterpriseName?consultant?.profile?.company_id.enterpriseName:"-",
					enterprisePANGST 			: consultant?.profile?.company_id?.GSTNumber?consultant?.profile?.company_id?.GSTNumber:"-",
					address 						: consultant?.profile?.company_id?.address?.addressLine?consultant?.profile?.company_id?.address?.addressLine:"-",
					branches 					: consultant?.profile?.company_id?.address?.city?consultant?.profile?.company_id?.address?.city:"-",
					entpMainCatg 				: consultant?.profile?.company_id?.businessCategory ? consultant?.profile?.company_id?.businessCategory:"-",
					entpSubCatg 				: consultant?.profile?.company_id?.catg_subCatg_expertise?.map(s => s?.subCategory?.map(c => c?.businessSubCategory)?.join(",")),
					entpExpertise 				: consultant?.profile?.company_id?.catg_subCatg_expertise?.map(s => s?.expertise?.map(c => c?.expertise)?.join(",")),
					entpExperience 			: consultant?.profile?.company_id?.experience?consultant?.profile?.company_id?.experience:"-",
					staffStrength 				: consultant?.profile?.company_id?.totalStaff?consultant?.profile?.company_id?.totalStaff:"-",
					entpAwardsMembership 	: consultant?.profile?.company_id?.awards?consultant?.profile?.company_id?.awards:"-",
					consultantName 			: consultant?.profile?.fullName?consultant?.profile?.fullName:"-",
					consultantExperience 	: consultant?.otherInfo?.experience?consultant?.otherInfo?.experience:"-",
					qualification 			   : consultant?.otherInfo?.qualification?consultant?.otherInfo?.qualification:"-",
					consultantPAN 			   : consultant?.otherInfo?.panNumber?consultant?.otherInfo?.panNumber:"-",
					languagesKnown 			: consultant?.otherInfo?.languages?.map(lang => lang?.language)?.join(","),
					consultantMainCatg		: consultant?.profile?.company_id?.businessCategory?consultant?.profile?.company_id?.businessCategory:"-",
					consultantSubCatg			: consultant?.profile?.company_id?.catg_subCatg_expertise?.map(s => s?.subCategory?.map(c => c?.businessSubCategory)?.join(",")),
					consultantExpertise 		: consultant?.profile?.company_id?.catg_subCatg_expertise?.map(s => s?.expertise?.map(c => c?.expertise)?.join(",")),
					descriptionSkills 		: consultant?.otherInfo?.aboutMyself?consultant?.otherInfo?.aboutMyself:"-",
					pastWorkExperience 		: consultant?.otherInfo?.pastWorkExp?consultant?.otherInfo?.pastWorkExp:"-",
					consAwardsMembership 	: consultant?.otherInfo?.membership?consultant?.otherInfo?.membership:"-",
					leadTime 					: 'Lead Time',
					IntroCallsFees 			: consultant?.otherInfo?.fees?consultant?.otherInfo?.fees:0,
					workingDays 				: workingDays?workingDays:0,
					onlineTime 					: 'Online Time',
					selectedPlan 				: consultant.subscriptionDetails.planName?consultant.subscriptionDetails.planName:"-",
					joinedasaConsultant 		: consultant.joinAsConsultant ? "YES" : "NO",
					invitedConsultant 		: consultant.invitedConsultant ? "YES" : "NO",
					registrationDate 			: moment(consultant.createdAt).format("DD/MM/YYYY"),
				}
			})

			Promise.all(consultants).then((consultantsObj) =>{
				console.log("consultantsObj => ",consultantsObj.length)
				res.status(200).json({ data: consultantsObj, dataCount: consultantsObj.length })
			})					
		})
		.catch(error =>{
			console.log("getConsultantIntroCallsReport error => ",error);
			res.status(500).json({ data: [], dataCount: 0, message:error.message }) 
		})
}
exports.getConsultantIntroCallsReport = (req, res, nxt) => {
	// console.log("req.body => ",req.body);
	var selector =  {
		'createdAt':{$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) }
	};
	if(req.body.searchText !== ""){
		selector = {...selector, $or : [
                  {"consultant_id.profile.companyName"      	: { "$regex" : req.body.searchText, $options: "i" }},
                  {"user_id.profile.fullName"                  : { "$regex" : req.body.searchText, $options: "i" }},
                  {"user_id.profile.lastName"                  : { "$regex" : req.body.searchText, $options: "i" }},
                  {"user_id.profile.fullName"                  : { "$regex" : req.body.searchText, $options: "i" }},
                  {"consultant_id.profile.fullName"            : { "$regex" : req.body.searchText, $options: "i" }},
                  {"consultant_id.profile.lastName"            : { "$regex" : req.body.searchText, $options: "i" }},
                  {"consultant_id.profile.fullName"            : { "$regex" : req.body.searchText, $options: "i" }},
               ]
            }
	}
	Appointments.find(selector)
		.populate("consultant_id")
		.populate("user_id")
		.populate("order_id")
		.then(response => {
			const appointments = response.map(async (appointment, index) => {
				if(appointment.status=="rescheduled" && appointment.rescheduledBy){
					if(appointment.rescheduledBy==appointment.consultant_id._id){
						var rescheduledBy = appointment.consultant_id?.profile?.fullName?appointment.consultant_id?.profile?.fullName:"-"
					}else if(appointment.rescheduledBy==appointment.user_id._id){
						var rescheduledBy = appointment.user_id?.profile.fullName ? appointment.user_id?.profile.fullName :"-"
					}
				}
				console.log("getConsultantIntroCallsReport response => ",appointment);
				return {
					srNo                           	         : index + 1,
					userID      										: appointment.user_id?appointment.user_id._id:"",
					userName										      : appointment.user_id?.profile.fullName,
					dateofBooking 						 			   : moment(appointment.createdAt).format("DD-MM-YYYY"),
					dateofIntroductoryCall	                  : appointment.appointmentDate,
					consultantID                              : appointment.consultant_id?appointment.consultant_id._id:"",
					consultantName      								: appointment.consultant_id?.profile?.fullName?appointment.consultant_id?.profile?.fullName:"-",
					enterpriseName 		                  	: appointment.consultant_id?.profile?.companyName?appointment.consultant_id?.profile?.companyName:"-",
					consultantLocation         					: (appointment.consultant_id?.address?.addressLine?appointment.consultant_id?.address?.addressLine+", " :"")+(appointment.consultant_id?.address?.city ? appointment.consultant_id?.address?.city : "")+(appointment.consultant_id?.address?.pincode ? ", "+appointment.consultant_id?.address?.pincode:""),
					professionMainCategory                 	: appointment.consultant_id?.catg_subCatg_expertise?.category?appointment.consultant_id?.catg_subCatg_expertise?.category:"-",
					timeSlot                                  : "timeSlot",
					userLocation            						: (appointment.user_id?.address?.addressLine?appointment.user_id?.address?.addressLine+", " :"")+(appointment.user_id?.address?.city ? appointment.user_id?.address?.city : "")+(appointment.user_id?.address?.pincode ? ", "+appointment.user_id?.address?.pincode:""),
					userType                                  : "userType",
					userBusinessCategory                   	: appointment.user_id?.profile?.userBusinessInfo?.businessCategory?appointment.user_id?.profile?.userBusinessInfo?.businessCategory:"-",
					timeAtWhichConsultantLoggedInForTheCall  	: "timeAtWhichConsultantLoggedInForTheCall",
					timeAtWhichUserLoggedInForTheCall			: "timeAtWhichUserLoggedInForTheCall",
					durationOfTheCall                         : appointment.cancelDetails?.appointmentDuration?appointment.cancelDetails?.appointmentDuration:"-",
					introductoryCallTokenID 						: appointment.tokenNumber?appointment.tokenNumber:"-",
					fees 									 				: appointment.fees?appointment.fees:"-",
					whetherPaymentSettledAtThePlatform        : "whetherPaymentSettledAtThePlatform",
					paymentReferenceID                        : appointment.order_id.paymentDetail.transactionId?appointment.order_id.paymentDetail.transactionId:"",
					callQualityRatingByTheConsultant          : "callQualityRatingByTheConsultant",
					callQualityRatingByTheUser		    	      : "callQualityRatingByTheUser",
					whetherCallCancelled                      : appointment.cancelDetails?.cancelledBy_id?"YES":"NO",
					dateOfCancellation                        : appointment.cancelDetails?.cancelledOn ? moment(appointment.cancelDetails.cancelledOn).format("DD-MM-YYYY"):"-",
					timeOfCancellation                        : appointment.cancelDetails?.cancelledOn ? moment(appointment.cancelDetails.cancelledOn).format("HH:mm"):"-",
					whoCancelledTheCall                       : appointment.cancelDetails?.cancelledByName?appointment.cancelDetails?.cancelledByName:"-",
					ReasonForCancellation                     : appointment.cancelDetails?.reasonForCancel?appointment.cancelDetails?.reasonForCancel:"-",
					whetherCallRescheduled                    : appointment.status=="rescheduled" ? "Yes":"No",
					whoRescheduledTheCall                     : rescheduledBy,
					newTimeSlot                               : appointment.status=="rescheduled" ?("<div class='noWrapText'>"+ appointment.appointmentDate+" "+appointment.appointmentTime+"</div>"):"-",
				}
			})
			Promise.all(appointments).then((appointmentsObj) =>{
				res.status(200).json({ data: appointmentsObj, dataCount: appointmentsObj.length }) 
			})
		})
		.catch(error =>{
			console.log("getConsultantIntroCallsReport error => ",error);
			res.status(500).json({ data: [], dataCount: 0, message:error.message }) 
		})
}
exports.getProfileEditingReport = (req, res, next) => {
	// console.log("req.body = ",req.body);
	var selector = { 
			'createdAt'    : {$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) },			
         roles 			: 'consultant',
         // approvalStatus : "Approved"
		};
	if(req.body.searchText !== ""){
		selector = {...selector, $or : [
                  {"profile.companyName"  				 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.firstname"                 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.lastname"                  : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.fullName"                  : { "$regex" : req.body.searchText, $options: "i" }},
               ]
            }
	}
	// console.log("selector => ",selector);
	User.find(selector)
		.populate("profile.company_id")
		.then(response => {
			const profilesEditedReport = response.map((consultant, index) => {
				// console.log("consultant=================================================",consultant)
				return {
					srNo 				   : index + 1,
					consultantID      : consultant?.profile?.employeeID?consultant?.profile?.employeeID:"-",
					dateOfEditing     : 'Date of editing',
					profileEditTrails : 'Profile Edit Trails',
					whetherPlanChanged: 'Whether plan changed?',
					previousPlan      : 'Previous Plan',
					newOrExistingPlan : consultant?.subscriptionDetails?.planName,
				}
			})
			res.status(200).json({ data: profilesEditedReport, dataCount: profilesEditedReport.length })
		})
}
exports.getEnterpriseListingPlanReport = (req, res, next) => {
	var selector = { 
			'createdAt'    : {$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) },			
         roles 			: 'consultant',
         // approvalStatus : "Approved"
		};
	if(req.body.searchText !== ""){
		selector = {...selector, $or : [
                  {"profile.companyName"  				 : { "$regex" : req.body.searchText, $options: "i" }},
               ]
            }
	}
	User.find(selector)
		.populate("profile.company_id")
		.then(response => {
			const enterpriseListingPlanData = response.map((consultant, index) => {
				var startDate= moment(consultant?.subscriptionDetails?.startDate);
				var expiryDate = moment(consultant?.subscriptionDetails?.endDate);
				var today = moment(new Date());
				var periodForWhichtheCurrentOrPreviousPlanActive = today.diff(startDate, 'months',true)
				var planToExpireInDays = expiryDate.diff(today, 'days')
				var planDuration = expiryDate.diff(startDate, 'months', true)
				// console.log("startDate",startDate)
				// console.log("expiryDate",expiryDate)
				// console.log("today",today)
				// console.log("planToExpireInDays=",planToExpireInDays)
				// console.log("planDuration=",planDuration)

				return {
					srNo 				                              : index + 1,
					enterpriseID                                 : consultant?.profile?.companyID? consultant?.profile?.companyID      : "-",
					enterpriseName                               : consultant?.profile?.companyName? consultant?.profile?.companyName      : "-",
					planType                                     : consultant?.subscriptionDetails?.planType? consultant?.subscriptionDetails?.planType     :"-",
					chargesForThePlan                            : consultant?.subscriptionDetails?.planCost ? consultant?.subscriptionDetails?.planCost     :"-",
					dateOfPayment                                : consultant?.subscriptionDetails?.startDate?moment(consultant?.subscriptionDetails?.startDate).format("DD/MM/YYYY")     :"",
					planDuration 				                     : planDuration,                     //(In Months)
					planToExpireInDays			                  : planToExpireInDays,
					expiryDate                                   : consultant?.subscriptionDetails?.endDate?moment(consultant?.subscriptionDetails?.endDate).format("DD/MM/YYYY") : "-",
					whetherRenewed 				                  : 'Whether renewed?',
					periodForWhichtheCurrentOrPreviousPlanActive : periodForWhichtheCurrentOrPreviousPlanActive,  //(No. of months)
					dateOfJoiningOfTheEnterprise            		: consultant?.profile?.createdOn? moment(consultant?.profile?.createdOn).format("DD/MM/YYYY") :"-",
					reasonForNotRenewing		                		: 'Reason for not renewing if provided through mail survey',
				}
			})
			res.status(200).json({ data: enterpriseListingPlanData, dataCount: enterpriseListingPlanData.length })
		})
}
exports.getLeadsGeneratedReport = (req, res, next) => {
	console.log("req.body",req.body)
	var selector = { 
		'appointmentDate'    : {$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) },			
	};
	Appointments.aggregate([
									{
										$match : selector 
									},							  
								   {
                              $lookup : {
                                      	from          : "user",
                                      	localField    : "consultant_id",
                                      	foreignField  : "_id",
                                      	as            : "consultant"
                              }
                          	},
                          	{
                              $unwind : "$consultant" 
                          	},
									{
                              $project : {
                                  "enterpriseID"				: "$consultant.profile.companyID",
                                  "enterpriseName"				: "$consultant.profile.companyName",
                                  "consultantID"				: "$consultant.profile.employeeID",
                                  "consultantName"				: "$consultant.profile.fullName",
                                  "cancelledBy_id"				: "$cancelDetails.cancelledBy_id",
                                  "appointmentDate"			: 1,
                                  "callsAttended"           : { $cond: { if: { $isArray: "$videoConferenceDetails" }, then: { $size: "$videoConferenceDetails" }, else: 0} },
                                            
                              },
                           },
                           {
                           	$group :{
                           		_id:{
                                  "enterpriseID"						: "$enterpriseID",
                                  "enterpriseName"						: "$enterpriseName",
                                  "consultantID"						: "$consultantID",
                                  "consultantName"						: "$consultantName",
                           		},
                           		"introductoryCallsCancelled"		: { $count:  "cancelledBy_id"  },
                           		"introductoryCallsAttended"		: { $count:  "callsAttended"  },	
								// 				introductoryCallsBooked: 'Introductory calls booked',
								// 				collectionsFromIntroductoryCall: 'Collections from introductory call',
								// 				platformShare: 'Platform Share',
								// 				earningsOfConsultant: 'Earnings of consultant',
                           	}
                           }
								])
							.then(leadsGeneratedReport=>{
								console.log("leadsGeneratedReport",leadsGeneratedReport)
								res.status(200).json({ data: leadsGeneratedReport, dataCount: leadsGeneratedReport.length })
							})
							.catch(err =>{
                        console.log("err ",err);
                        res.status(500).json(err);
                    });
}


exports.getReviewRatingReport = (req, res, next) => {

	User.find({ joinAsConsultant: true })
		.populate("profile.company_id")
		.then(response => {
			const leadsGeneratedReport = response.map((consultant, index) => {
				return {
					srNo: 'Sr. No',
					enterpriseID: 'Enterprise ID',
					enterpriseName: 'Enterprise Name',
					consultantID: 'Consultant ID',
					consultantName: 'Consultant Name',
					userID: 'User ID',
					userName: 'User Name',
					ratingReviewIntroductoryCallTokenID: 'Rating/review Introductory Call Token ID ',
					rating: 'Rating',
					reviewKeyWords: 'Review Key Words',
					reviewByUser: 'Review by User',
					replyByConsultant: 'Reply by consultant',
					recommended: 'Recommended ? Yes / No',
				}
			})

			res.status(200).json({ data: leadsGeneratedReport, dataCount: leadsGeneratedReport.length })
		})
}

exports.getConsultantComplaintReport = (req, res, next) => {

	User.find({ joinAsConsultant: true })
		.populate("profile.company_id")
		.then(response => {
			const leadsGeneratedReport = response.map((consultant, index) => {
				return {
					srNo: 'Sr. No',
					enterpriseID: 'Enterprise ID',
					consultantID: 'Consultant ID',
					dateOfRaisingQuery: 'Date of raising query ',
					particularsOfQuery: 'Particulars of query',
					responseToQuery: 'Response to query',
					dateOfSolvingQuery: 'Date of solving query',
					nameIDWhoSolvedQuery: 'Name/ ID Who Solved Query',
					turnaroundTime: 'Turnaround time',
					dateOfFeedback: 'Date of Feedback',
					particularsOfFeedback: 'Particulars of feedback',
					responseToFeedback: 'Response to feedback',
					dateOfResponseToFeedback: 'Date of Response to Feedback',
					nameIDWhoRespondedFeedback: 'Name/ID  Who Responded Feedback',

				}
			})

			res.status(200).json({ data: leadsGeneratedReport, dataCount: leadsGeneratedReport.length })
		})
}

exports.getConsultantSettlementReport = (req, res, next) => {

	User.find({ joinAsConsultant: true })
		.populate("profile.company_id")
		.then(response => {
			const leadsGeneratedReport = response.map((consultant, index) => {
				return {
					srNo: 'Sr. No',
					enterpriseID: 'Enterprise ID',
					consultantID: 'Consultant ID',
					consultantName: 'Consultant Name',
					introductoryCallTokenID: 'Introductory Call token ID',
					dateOfCall: 'Date of Call',
					consultantFees: 'Consultant Fees',
					discountGiven: 'Discount given',
					amountChargedToUser: 'Amount Charged to User',
					amountPaidByUser: 'Amount paid by user',
					shareOfPlatform: 'Share of platform',
					shareOfConsultant: 'Share of consultant',
					whetherPaymentMadeToConsultant: 'Whether payment made to consultant?',
					paymentReferenceID: 'Payment Reference ID',
					paymentDate: 'Payment Date',
				}
			})

			res.status(200).json({ data: leadsGeneratedReport, dataCount: leadsGeneratedReport.length })
		})
}

exports.getUserDataReport = (req, res, next) => {
	var selector = { 
		'createdAt' : {$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) },			
      'roles' 		: 'user',
	};
	if(req.body.searchText !== ""){
		selector = {...selector, $or : [
                  {"profile.firstname"                 				 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.lastname"                  				 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.fullname"                  				 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.mobile"	 		  				 				 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.email"  		 				 				 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.userBusinessInfo.businessCategory"  	 : { "$regex" : req.body.searchText, $options: "i" }},
                  {"profile.userBusinessInfo.businessTradeName"  	 : { "$regex" : req.body.searchText, $options: "i" }},
               ]
            }
	}
	User.find(selector)
		.sort({"createdAt":-1})
		.then(response => {
			const getUserData = response.map((user, index) => {
				console.log("user",user)
				return {
					srNo 							: index + 1,
					firstName 					: user?.profile?.firstname?user?.profile?.firstname:"-",
					lastName 					: user?.profile?.lastname?user?.profile?.lastname:"-",
					mobileNumber 				: user?.profile?.mobile?user?.profile?.mobile:"-",
					emailId 						: user?.profile?.email?user?.profile?.email:"-",
					businessTradeName 		: user?.profile?.userBusinessInfo?.businessTradeName ? user?.profile?.userBusinessInfo?.businessTradeName : "-",           
					gst 				 			: user?.profile?.userBusinessInfo?.GSTNumber?user?.profile?.userBusinessInfo?.GSTNumber:"-",
					address 						: user?.address?.addressLine?user?.address?.addressLine:"-",
					city 							: user?.address?.city?user?.address?.city:"-",
					state 						: user?.address?.state?user?.address?.state:"-",
					country 						: user?.address?.country?user?.address?.country:"-",
					pincode 						: user?.address?.pincode?user?.address?.pincode:"-",
					businessCategory 			: user?.profile?.userBusinessInfo?.businessCategory ? user?.profile?.userBusinessInfo?.businessCategory:"-",
		 		}
			})
			res.status(200).json({ data: getUserData, dataCount: getUserData.length })
		})
}

exports.getUserIntroductoryCallsReport = (req, res, next) => {
	var selector =  {
		'createdAt':{$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) }
	};
	Appointments.aggregate([
									{
										$match : selector 
									},							  
								   {
                              $lookup : {
                                      	from          : "user",
                                      	localField    : "user_id",
                                      	foreignField  : "_id",
                                      	as            : "user"
                              }
                          	},
                          	{
                              $unwind : "$user" 
                          	},
                          	/*{
                              $lookup : {
                                      	from          : "wallets",
                                      	localField    : "user_id",
                                      	foreignField  : "_id",
                                      	as            : "wallets"
                              }
                          	},
                          	{
                              $unwind : "wallets" 
                          	},*/
                          	{
                              $project : {
                              	"userID"	      							   : "$user.profile.employeeID",
											"userName"									   : "$user.profile.fullName",
											"businessName"  								: "$user.profile.userBusinessInfo.businessTradeName",           
											"location"            						: "$user.address.addressLine+', '+user.address.city+ ', '+user.address.pincode",
											"fees" 									 	   : 1,
                                 "cancelDetails"								: "$cancelDetails.cancelledBy_id",
                                 "appointmentDate"								: 1,
                                 "callsAttended"           					: { $cond: { if: { $isArray: "$videoConferenceDetails" }, then: { $size: "$videoConferenceDetails" }, else: 0} },
                                 "walletAmount"									: "$wallets.walletAmount"      
                              },
                           },
                           {
                           	$group :{
                           		_id:{
                           			"userID"	      							   : "$userID",
												"userName"									   : "$userName",
												"businessName"  								: "$businessName",           
												"location"            						: "$location",
                           		},
                           		"totalCalls"										: { $count:  "appointmentDate"  },
                           		"categoryCallsCount" 							: "",
                           		"fees"												: { $sum:  "$fees"  },
                           		"discount" 											: "",
                           		"walletAmountUsed"								: "",
                           		"amountPaidforIntroductoryCalls"				: "",
                           		"callCancelledcount"								: { $count:  "cancelDetails"  },
                           		"callsAttended"									: { $count:  "callsAttended"  },	
                           	}
                           }
		])
		.then(userIntroductoryCallsData=>{
			console.log("userIntroductoryCallsData",userIntroductoryCallsData)
			res.status(200).json({ data: userIntroductoryCallsData, dataCount: userIntroductoryCallsData.length })
		})
		.catch(err =>{
		   console.log("err ",err);
		   res.status(500).json(err);
			});
	}

exports.getListingFeesReport = (req, res, next) => {
	var selector =  {
		'createdAt':{$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) }
	};
	Appointments.aggregate([
									{
										$match : selector 
									},							  
								   {
                              $lookup : {
                                	from          : "user",
                                	localField    : "user_id",
                                	foreignField  : "_id",
                                	as            : "user"
                              }
                          	},
                          	{
                              $unwind : "$user" 
                          	},
                          	{
                              $project : {
                              	"userID"	      							   : "$user.profile.employeeID",
											"userName"									   : "$user.profile.fullName",
											"dateOfTransaction"							: "$videoConferenceDetails.trans_date",
											"enterpriseID"  								: "$user.profile.companyID",           
											"fees" 									 	   : 1,
                              },
                           },
                           {
                           	$group :{
                           		_id:{
                           			"userID"	      							   : "$userID",
												"userName"									   : "$userName",
												"dateOfTransaction"  						: "$dateOfTransaction",           
												"enterpriseID"            					: "$enterpriseID",
                           		},
                           		"fees"												: { $sum:  "$fees"  },
                           		/*listingFee: 'Listing Fee',
											listingFeesPaidForMonth: 'Listing Fees Paid for (Months)',
											listingFeesPaidForPeriod: 'Listing Fees Paid for (Period)',*/
                           	}
                           }
		])
		.then(getListingFeesData=>{
			console.log("getListingFeesData",getListingFeesData)
			res.status(200).json({ data: getListingFeesData, dataCount: getListingFeesData.length })
		})
		.catch(err =>{
		   console.log("err ",err);
		   res.status(500).json(err);
		});
}

exports.getUserComplaintsReport = (req, res, next) => {
	var selector =  {
		'createdAt':{$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) }
	};
	Queries.find(selector)
		.sort({"createdAt":-1})
		.then(response => {
			const userComplaintsReport = response.map((user, index) => {
				return {
					srNo                    : index + 1,
					userID 						: user.user_id ? user.user_id : "-",
					consultantID 				: user.consultant_id ? user.consultant_id : "-",
					introductoryCallID 		: user.tokenNumber ? user.tokenNumber: "-",
					dateOfRaisingComplain 	: user.callDate ? user.callDate: "-",
					particularsOfComplain 	: user.raisedQuery ? user.raisedQuery: "-",
					responseToComplain 		: 'Response to complain',
					dateOfSolvingComplain 	: 'Date of solving complain',
					nameIDWhoIsSolvingQuery : 'Name/ ID  who is solving Query',
					turnaroundTime 			: 'Turnaround time',
				}
			})
			res.status(200).json({ data: userComplaintsReport, dataCount: userComplaintsReport.length })
		})
}
exports.getFeedbackReport = (req, res, next) => {

	var selector =  {
		'createdAt':{$gte : new Date(req.body.startDate), $lte : new Date(req.body.endDate) }
	};
	Feedback.find(selector)
		.sort({"createdAt":-1})
		.then(response => {
			const feedbackReport = response.map((user, index) => {
				return {
					srNo           	: index + 1,
					name 					: user.name ? user.name : "-",
					emailId 				: user.email ? user.email : "-",
					mobile  				: user.mobile ? user.mobile : "-",
					feedback 			: user.feedback ? user.feedback : "-",
				}
			})

			res.status(200).json({ data: feedbackReport, dataCount: feedbackReport.length })
		})
}