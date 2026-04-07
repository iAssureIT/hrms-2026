const mongoose			= require("mongoose");
const bcrypt			= require("bcryptjs");
const jwt				= require("jsonwebtoken");
var ObjectID 			= require('mongodb').ObjectID;
var request         	= require('request-promise');
const User 				= require('./ModelUsers.js');
const Roles 			= require('../rolesManagement/model.js');
const globalVariable = require("../../../nodemonConfig.js");



exports.admin_account_on_startup = (req,res,next)=>{
	if(globalVariable.adminAccountEmail && globalVariable.adminAccountPwd){
		var adminAccountEmail = globalVariable.adminAccountEmail;
		var adminAccountPwd = globalVariable.adminAccountPwd;		
	}else{
		console.log('-----------------------------------------------------------------------------------');
		console.log('Admin account details not available. Provide adminAccountEmail & adminAccountPwd.');
		console.log('-----------------------------------------------------------------------------------');

		return res.status(500).json({
			message: 'Admin account details not available. Provide adminAccountEmail & adminAccountPwd.'
		});		
	}

	if( adminAccountEmail && adminAccountPwd){
		User.find({"profile.email" : adminAccountEmail})
			.exec()
			.then(user =>{
				if(user.length > 0){
					console.log('Admin account not created, as it is already existing.');
					return res.status(200).json({
						message: 'Admin account not created, as it is already existing.'
					});
				}else{
					bcrypt.hash(adminAccountPwd,10,(err,hash)=>{
						if(err){
							return res.status(500).json({
								error:err
							});
						}else{
							const roles = new Roles({
								_id			: new mongoose.Types.ObjectId(),
								role 			: "admin"
							});
							roles.save();


							const user = new User({
											_id			: new mongoose.Types.ObjectId(),
											createdAt	: new Date,
											services	: {
												password:{
															bcrypt:hash
															
														},
											},
											username	: adminAccountEmail,
											emails		: [
													{
														address  : adminAccountEmail,
														verified : true 
													}
											],
											profile		:
													{
														firstname     : "System",
														lastname      : "Admin",
														fullName      : 'System Admin',
														email         : adminAccountEmail,
														mobile     	  : "9876543210",
														companyID 	  : 1,														
														createdOn     : new Date(),
														status		  : 'active',
													},
											roles 		: ["admin"]
							});	
							if(!req.body.firstname){
								user.profile.fullName = req.body.fullName;
							}
							user.save()
								.then(result =>{
									console.log("new user created => ",result);
									
									res.status(200).json({
										message	: 'USER_CREATED',
										ID 		: result._id,
										adminAccountEmail : adminAccountEmail,
										adminAccountPwd : adminAccountPwd
									})
								})
								.catch(err =>{
									res.status(500).json({
										error: err
									});
								});
						}			
					});
				}
			})
			.catch(err =>{
				res.status(500).json({
					error: err
				});
			});
	}else{
		res.status(200).json({message:"Email and pwd are mandatory"});
	}
};


exports.add_role_on_startup = (req,res,next)=>{
		const role = req.params.role;
		console.log("role = ", role);

		const roles = new Roles({
			_id	: new mongoose.Types.ObjectId(),
			role 	: role
		});
		roles.save()
			.then(result =>{
				res.status(201).json({
					message	: 'ROLE_ADDED',
					ID 		: result._id,
				})
			})
			.catch(error =>{
				console.log("add_role_on_startup error => ",error);
				res.status(500).json({
					error: JSON.stringify(error,null)
				});
			});

};