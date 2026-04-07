const mongoose				= require("mongoose");
var   ObjectID 			= require('mongodb').ObjectID;
const moment 				= require('moment');

const User 						= require('../userManagementnew/ModelUsers.js');
const Enterprise 				= require('../enterprise/model.js');
const BusinessCategory 		= require('../masterBusinessCategory/Model.js');
const BusinessSubCategory 	= require('../masterBusinessSubCategory/Model.js');
const Appointments 			= require('../appointments/model.js');
const Reviews 					= require('../review/model.js');

const globalVariable 		= require("../../../nodemonConfig.js");


exports.getSummaryData = (req,res,next)=>{
	//console.log("getSummaryData========== => ",req.params);
	// console.log("req.body========== => ",req.body);
    var selector = {};
    selector= {"consultant_id" : ObjectID(req.body.user_id) , "isoAppointmentDate" : {$gte : req.body.fromDate, $lte : req.body.toDate}};
    var query = { $match : selector};
    
	//console.log("======================getSummaryData currDate => ",currDate);
   var statusList =["captured","TXN_SUCCESS"];
	Appointments.aggregate([
            query,	
            {
					$match : {
						status : {$ne : "cancelled"}, 
					} 
				},
				{
			    	$lookup:
			        	{
			           from: "orders",
			           localField: "order_id",
			           foreignField: "_id",
			           as: "order"
			        	}
			   },
			   { "$unwind": "$order" },
			   {
				   $project: {
				      "_id" 	: 1,
				      "fees" 	: 1,
				      "status" : "$order.status"
					}
				},
				{ 
					"$match": { 
			        	"status": { "$in": statusList },
			    	} 
			   }, 
				{
					$group: {
						_id 			: ObjectID(req.body.user_id), 
						totalCalls 	: { $sum : 1 }, 
						totalBill 	: { $sum : "$fees"},
					} 
				}
		])
		.then(totals => {
			
			// console.log("totals => ",totals.length);
			// ==== Future Calls ====
			// isoAppointmentDate > currentDate 
			var currentDate = moment().tz('Asia/Kolkata').format("YYYY-MM-DD");
		   var currTime = moment().tz('Asia/Kolkata').format("HH:mm");

			// console.log("getSummaryData currentDate => ",currentDate,currTime);
    		var query1 ={$match:{"consultant_id" : ObjectID(req.body.user_id),"isoAppointmentDate" : {$gte : currentDate, $lte : req.body.toDate}}}
			Appointments.aggregate([
					query1,
					{
						$match : {
							status : {$ne : "cancelled"}, 
						} 
					},					
					{
				    	$lookup:
				        	{
				           from: "orders",
				           localField: "order_id",
				           foreignField: "_id",
				           as: "order"
				        	}
				   },
				   { "$unwind": "$order" },
					{ 
						"$match": { 
				        	"order.status": { "$in": statusList },
				    	} 
				   }, 
				])
				.then(futureCalls => {
					// console.log("futureCalls",futureCalls)
					var appointmentsArr = [];
					var totalFutureCalls = futureCalls.length;

	            for(var i=0; i<totalFutureCalls; i++){
	            	var apmtTime = futureCalls[i].appointmentEnd ? futureCalls[i].appointmentEnd : futureCalls[i].appointmentTime;
	               if((isApmtTimeSmallerThanCT(apmtTime) && currentDate ==  futureCalls[i].isoAppointmentDate)){
	               	totalFutureCalls--;
	               }
	            }

					//==== Today's Calls ====
					Appointments.aggregate([
								{
									$match : {
										"consultant_id" : ObjectID(req.body.user_id) ,
										status : {$ne : "cancelled"}, 
										isoAppointmentDate : currentDate  
									}
								},
								{
							    	$lookup:
							        	{
							           from: "orders",
							           localField: "order_id",
							           foreignField: "_id",
							           as: "order"
							        	}
							   },
							   { "$unwind": "$order" },
							   {
								   $project: {
								      "_id" 	: 1,
								      "fees" 	: 1,
								      "status" : "$order.status"
									}
								},
								{ 
									"$match": { 
							        	"status": { "$in": statusList },
							    	} 
							   }, 
								{$group: {_id : req.params.user_id, todaysCalls :{ $sum : 1 } } }
						])
						.then(todaysCalls => {
							// console.log("todaysCalls => ",todaysCalls);

							res.status(200).json({
								success 	: true,
								totals  	: {
													totalCalls 		: totals && totals.length>0 ? totals[0].totalCalls : 0,
													totalBill 		: totals && totals.length>0 ? totals[0].totalBill 	: 0,
													futureCalls 	: totalFutureCalls,
													todaysCalls 	: todaysCalls && todaysCalls.length>0 ? todaysCalls[0].todaysCalls : 0
												}
							})
						})
						.catch(error => {
							console.log("getSummaryData error =>",error);
							res.status(500).json({
								success 		: false,
								error 	: error
							})
						})	
				})
				.catch(error => {
					console.log("getSummaryData error =>",error);
					res.status(500).json({
						success 		: false,
						error 	: error
					})
				})	
		})
		.catch(error => {
			console.log("getSummaryData error =>",error);
			res.status(500).json({
				success 		: false,
				error 	: error
			})
		})	
}


function isApmtTimeSmallerThanCT(apmtTime){
   const currTime = moment().tz('Asia/Kolkata').format("HH:mm").toUpperCase();
//    console.log("currTime => ",currTime);

   if(apmtTime.includes('PM')){
      var atArr   = apmtTime.split(" ");
      var atTime  = atArr[0].split(":");
      var atHr    = parseInt(atTime[0]) + 12;
      var at      = atHr +":"+ atTime[1];
   }else if(apmtTime.includes('AM')){
      var at = apmtTime.substr(0,apmtTime.length-2).trim();
   }else{
      var at = apmtTime;
   }
//    console.log("1 at => ",at);

   if(at < currTime){
      return true;
   }else{
      return false;
   }
}




function getNumOfIntroductoryCalls(consultant_id){
	return new Promise((resolve,reject)=>{
		Appointments.countDocuments({consultant_id : consultant_id})
					.then(numOfAppointments => {
						// console.log("numOfAppointments => ",numOfAppointments);
						resolve(parseInt(numOfAppointments));
					})
					.catch(error => {
						console.log("getNumOfIntroductoryCalls error =>",error);
						reject(-1)
					})
	})
}

exports.getLocationWiseRevenue = (req,res,next)=>{	
	// console.log("req.body getLocationWiseRevenue",req.body)
    var selector = {};
    selector= {"consultant_id" : ObjectID(req.body.user_id), "isoAppointmentDate" : {$gte : req.body.fromDate, $lte : req.body.toDate}};
    var query = { $match : selector};
    
	Appointments.aggregate([
			query,
			{$match 	: {status 	: {$ne : "cancelled"}}},
			{$lookup : {from 		: 'users', localField:'user_id', foreignField : '_id', as: 'user_id'} },
			{$group 	: {
				_id 		: "$user_id.profile.userBusinessInfo.address.city", 
				totalCalls :{ $sum : 1 }, 
				revenue : {$sum : "$fees"} 
			} },
			{$sort 	: {revenue 	: -1 } }
		])
		.then(totals => {
			// console.log("totals",totals)
			var outputTotals = [];
			for(var i=0; i<totals.length; i++){
				if(totals[i]._id.length > 0){
					outputTotals.push(totals[i]);
				}
			}

			if(i>=totals.length){
				// console.log("getLocationWiseRevenue totals => ",outputTotals);
				res.status(200).json({
					success 	: true,
					totals  	: outputTotals
				})				
			}
		})
		.catch(error => {
			console.log("getLocationWiseRevenue error =>",error);
			res.status(500).json({
				success 	: false,
				error 	: error
			})
		})	
}

exports.getCategoryWiseRevenue = (req,res,next)=>{
	// console.log("req.body",req.body)
    var selector = {};
    selector= {"consultant_id" : ObjectID(req.body.user_id), "isoAppointmentDate" : {$gte : req.body.fromDate, $lte : req.body.toDate}};
    var query = { $match : selector};
    
	Appointments.aggregate([
			query,
			{ $match 	: {status 	: {$ne : "cancelled"}}},
			{ $lookup 	: {from 		: 'users', localField:'user_id', foreignField : '_id', as: 'user_id'} },
			{ $project  : {"user_id.services" : 0,"user_id.otherInfo" : 0,"user_id.documents" : 0,"user_id.catg_subCatg_expertise":0,"user_id.myConsultants" : 0,"user_id.subscriptionDetails" : 0,"user_id.address" : 0,"user_id.subcatgApprovalLog": 0,"user_id.expertiseApprovalLog": 0} },
			{ $unwind   : "$user_id" },
			{ $group 	: {_id 		: "$user_id.profile.userBusinessInfo.businessCategory", totalCalls:{$sum:1}, revenue:{$sum:"$fees"} } },
			{ $sort 		: {revenue 	: -1 } }
		])
		.then(totals => {
			// console.log("getCategoryWiseRevenue totals => ",totals);
			res.status(200).json({
				success 	: true,
				totals  	: totals
			})

		})
		.catch(error => {
			console.log("getCategoryWiseRevenue error =>",error);
			res.status(500).json({
				success 	: false,
				error 	: error
			})
		})	
}
