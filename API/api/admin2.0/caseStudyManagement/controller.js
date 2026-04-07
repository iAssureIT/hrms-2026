const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
const moment = require("moment");
const _ = require("underscore");
const Model = require('./model.js');
const User = require('../userManagementnew/ModelUsers.js');
const globalVariable = require("../../../nodemonConfig.js");
const MasterNotifications = require('../notificationManagement/ModelMasterNotification.js');
const { sendNotification } = require("../common/globalFunctions");
const multer = require("multer");


exports.addCaseStudy = (req, res, next) => {
	// console.log(" req body 25============>:", req);
		
        // Continue processing for other fields and values
        var numOfWords = 0;
        var readingInMin = 0;

        if (req.body.projectDescription) {
            numOfWords = req.body.projectDescription.split(" ").length;
            readingInMin = Math.round(parseInt(numOfWords) / 200) + 1;
        }

		User.findOne({ _id: ObjectId(req.body.user_id?.trim()) })
			.then(user => {
				var caseStudy = new Model({
					_id: new mongoose.Types.ObjectId(),
					user_id: req.body.user_id,
					projectName: req.body.projectName,
					service: req.body.service,
					pageURL: req.body.pageURL,
					titleColor: req.body.titleColor,
					projectDescription: req.body.projectDescription,
					technologies: req.body.technologies,

					frontendTechnologies: req.body.frontendTechnologies,
					backendTechnologies: req.body.backendTechnologies,
					databaseTechnologies: req.body.databaseTechnologies,

					logo 			: req.body.logo,
					bannerImage1 	: req.body.bannerImage1,
					bannerImage2 	: req.body.bannerImage2,
					bannerImage3 	: req.body.bannerImage3,
					bannerMobileImage1	: req.body.bannerMobileImage1,
					bannerSubImage1	: req.body.bannerSubImage1,
					bannerSubImage2	: req.body.bannerSubImage2,
					bannerSubImage3	: req.body.bannerSubImage3,
					image_LCRI1 	: req.body.image_LCRI1,
					image_LCRI2 	: req.body.image_LCRI2,
					image_LCRI3 	: req.body.image_LCRI3,
					image_RCLI1 	: req.body.image_RCLI1,
					image_RCLI2 	: req.body.image_RCLI2,
					
					heading_LCRI1	: req.body.heading_LCRI1,
					content_LCRI1	: req.body.content_LCRI1,
					heading_LCRI2	: req.body.heading_LCRI2,
					content_LCRI2	: req.body.content_LCRI2,
					heading_LCRI3	: req.body.heading_LCRI3,
					content_LCRI3	: req.body.content_LCRI3,
					heading_RCLI1	: req.body.heading_RCLI1,
					content_RCLI1	: req.body.content_RCLI1,
					heading_RCLI2	: req.body.heading_RCLI2,
					content_RCLI2	: req.body.content_RCLI2,

					numOfWords: numOfWords,
					readingInMin: readingInMin,
					createdBy: req.body.user_id,
					authorName: user?.profile?.firstname + " " + user?.profile?.lastname,
					createdAt: new Date(),
				});
				// console.log("caseStudy",caseStudy.pageURL)
				caseStudy.save()
					.then(insertedCaseStudy => {
						// console.log("insertedCaseStudy => ", insertedCaseStudy);
						res.status(200).json({
							success: true,
							message: "Case Study inserted successfully",
							feedback: insertedCaseStudy
						});
					})
					.catch(error => {
						console.log("Error while inserting Case Study -> ",error);
						res.status(500).json({
							message: "Error while inserting Case Study",
							success: false,
							error: error
						});
					})
			})
			.catch(error => {
				console.log("Error while inserting Case Study -> ",error);
				res.status(500).json({
					message: "Error while finding Case Study author name",
					success: false,
					error: error
				});
			})
	// });
};
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/images"); // Specify the destination folder for logos
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname); // Rename the uploaded logo
	},
});
// console.log("storage", storage)
const upload = multer({ storage: storage });

exports.insertCaseStudyold2 = (req, res, next) => {
	// console.log(" req body 25============>:", req.body);
	upload.fields([
        // { name: "bannerImage", maxCount: 1 },
        // { name: "rightImg1", maxCount: 1 },
		// { name: "bannerImg2", maxCount: 1 },
		// { name: "leftImg1", maxCount: 1 },
		// { name: "bannerImg3", maxCount: 1 },
		// { name: "leftImg2", maxCount: 1 },
		// { name: "rightImg2", maxCount: 1 },
		// { name: "leftImg4", maxCount: 1 },
		// { name: "bannerImg4", maxCount: 1 },

	{ name:"bannerImage", maxCount: 1 },
	{ name:"smallBannerImage", maxCount: 1 },
	{ name:"bannerImageRILC1", maxCount: 1 },
	{ name:"smallBannerImageRILC1", maxCount: 1 },
	{ name:"rightImg1", maxCount: 1 },
	{ name:"bannerImg2", maxCount: 1 },
	{ name:"smallBannerImg2", maxCount: 1 },
	{ name:"bannerImageLIRC1", maxCount: 1 },
	{ name:"smallBannerImageLIRC1", maxCount: 1 },
	{ name:"leftImg1", maxCount: 1 },
	{ name:"bannerImg3", maxCount: 1 },
	{ name:"smallBannerImg3", maxCount: 1 },
	{ name:"bannerImageLIRC2", maxCount: 1 },
	{ name:"smallBannerImageLIRC2", maxCount: 1 },
	{ name:"leftImg2", maxCount: 1 },
	{ name:"bannerImageRILC2", maxCount: 1 },
	{ name:"smallBannerImageRILC2", maxCount: 1 },
	{ name:"rightImg2", maxCount: 1 },
	{ name:"bannerImageLIRC3", maxCount: 1 },
	{ name:"smallBannerImageLIRC3", maxCount: 1 },
	{ name:"leftImg4", maxCount: 1 },
	{ name:"bannerImg4", maxCount: 1 },
	{ name:"smallBannerImg4", maxCount: 1 },
		
    ])(req, res, function (err) {
        console.log("err", err);

        if (err instanceof multer.MulterError) {
            console.log("MulterError code:", err.code);
            console.log("MulterError message:", err.message);
            console.log("MulterError field:", err.field);
            return res.status(400).json({ success: false, message: "File upload error" });
        } else if (err) {
            console.log(err, "err");
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        console.log("req.body40=====>", req.body);

        // const bannerImageFilePath = req.files["bannerImage"][0].path;
        // const rightImg1FilePath = req.files["rightImg1"][0].path;
		// const bannerImg2FilePath = req.files["bannerImg2"][0].path;
		// const leftImg1FilePath = req.files["leftImg1"][0].path;
		// const bannerImg3FilePath = req.files["bannerImg3"][0].path;
		// const leftImg2FilePath = req.files["leftImg2"][0].path;
		// const rightImg2FilePath = req.files["rightImg2"][0].path;
		// const leftImg4FilePath = req.files["leftImg4"][0].path;
		// const bannerImg4FilePath = req.files["bannerImg4"][0].path;
		
		
		const bannerImageFilePath = req.files["bannerImage"][0].path;
		const smallBannerImageFilePath = req.files["smallBannerImage"][0].path;
		const bannerImageRILC1FilePath = req.files["bannerImageRILC1"][0].path;
		const smallBannerImageRILC1FilePath = req.files["smallBannerImageRILC1"][0].path;
		const rightImg1FilePath = req.files["rightImg1"][0].path;
		const bannerImg2FilePath = req.files["bannerImg2"][0].path;
		const smallBannerImg2FilePath = req.files["smallBannerImg2"][0].path;
		const bannerImageLIRC1FilePath = req.files["bannerImageLIRC1"][0].path;
		const smallBannerImageLIRC1FilePath = req.files["smallBannerImageLIRC1"][0].path;
		const leftImg1FilePath = req.files["leftImg1"][0].path;
		const bannerImg3FilePath = req.files["bannerImg3"][0].path;
		const smallBannerImg3FilePath = req.files["smallBannerImg3"][0].path;
		const bannerImageLIRC2FilePath = req.files["bannerImageLIRC2"][0].path;
		const smallBannerImageLIRC2FilePath = req.files["smallBannerImageLIRC2"][0].path;
		const leftImg2FilePath = req.files["leftImg2"][0].path;
		const bannerImageRILC2FilePath = req.files["bannerImageRILC2"][0].path;
		const smallBannerImageRILC2FilePath = req.files["smallBannerImageRILC2"][0].path;
		const rightImg2FilePath = req.files["rightImg2"][0].path;
		const bannerImageLIRC3FilePath = req.files["bannerImageLIRC3"][0].path;
		const smallBannerImageLIRC3FilePath = req.files["smallBannerImageLIRC3"][0].path;
		const leftImg4FilePath = req.files["leftImg4"][0].path;
		const bannerImg4FilePath = req.files["bannerImg4"][0].path;
		const smallBannerImg4FilePath = req.files["smallBannerImg4"][0].path;

        console.log("bannerImageFilePath", bannerImageFilePath);
        console.log("rightImg1FilePath", rightImg1FilePath);

        // Continue processing for other fields and values
        console.log("req.body.image", req.body.image);
        console.log("insert req.body => ", req.body);
        var numOfWords = 0;
        var readingInMin = 0;

        if (req.body.projectDescription) {
            numOfWords = req.body.projectDescription.split(" ").length;
            readingInMin = Math.round(parseInt(numOfWords) / 200) + 1;
        }

		User.findOne({ _id: ObjectId(req.body.user_id.trim()) })
			.then(user => {
				var caseStudy = new Model({
					_id: new mongoose.Types.ObjectId(),
					user_id: req.body.user_id,
					projectName: req.body.projectName,
					service: req.body.service,
					pageURL: req.body.pageURL,
					projectDescription: req.body.projectDescription,
					leftContent1: req.body.leftContent1,
					rightContent1:req.body.rightContent1 ,
					rightContent2:req.body.rightContent2 ,
					leftContent2:req.body.leftContent2,
					rightContent3:req.body.rightContent3 ,	
					bannerImage : bannerImageFilePath,
					smallBannerImage : smallBannerImageFilePath,
					bannerImageRILC1 : bannerImageRILC1FilePath,
					smallBannerImageRILC1 : smallBannerImageRILC1FilePath,
					rightImg1 : rightImg1FilePath,
					bannerImg2 : bannerImg2FilePath,
					smallBannerImg2 : smallBannerImg2FilePath,
					bannerImageLIRC1 : bannerImageLIRC1FilePath,
					smallBannerImageLIRC1 : smallBannerImageLIRC1FilePath,
					leftImg1 : leftImg1FilePath,
					bannerImg3 : bannerImg3FilePath,
					smallBannerImg3 : smallBannerImg3FilePath,
					bannerImageLIRC2 : bannerImageLIRC2FilePath,
					smallBannerImageLIRC2 : smallBannerImageLIRC2FilePath,
					leftImg2 : leftImg2FilePath,
					bannerImageRILC2 : bannerImageRILC2FilePath,
					smallBannerImageRILC2 : smallBannerImageRILC2FilePath,
					rightImg2 : rightImg2FilePath,
					bannerImageLIRC3 : bannerImageLIRC3FilePath,
					smallBannerImageLIRC3 : smallBannerImageLIRC3FilePath,
					leftImg4 : leftImg4FilePath,
					bannerImg4 : bannerImg4FilePath,
					smallBannerImg4 : smallBannerImg4FilePath,
					numOfWords: numOfWords,
					readingInMin: readingInMin,
					createdBy: req.body.user_id,
					authorName: user.profile.firstname + " " + user.profile.lastname,
					createdAt: new Date(),
				});
				console.log("caseStudy",caseStudy)
				caseStudy.save()
					.then(insertedCaseStudy => {
						console.log("insertedCaseStudy => ", insertedCaseStudy);
						res.status(200).json({
							success: true,
							message: "Case Study inserted successfully",
							feedback: insertedCaseStudy
						});
					})
					.catch(error => {
						console.log("Error while inserting Case Study -> ",error);
						res.status(500).json({
							message: "Error while inserting Case Study",
							success: false,
							error: error
						});
					})
			})
			.catch(error => {
				console.log("Error while inserting Case Study -> ",error);
				res.status(500).json({
					message: "Error while finding Case Study author name",
					success: false,
					error: error
				});
			})
	});
};


exports.insertCaseStudyold = (req, res, next) => {
	console.log(" req body 25============>:", req.body);
	upload.fields([
	{ name:"bannerImage1", maxCount: 1 },
	{ name:"bannerImage2", maxCount: 1 },
	{ name:"bannerImage3", maxCount: 1 },
	{ name:"image_LCRI1", maxCount: 1 },
	{ name:"image_LCRI2", maxCount: 1 },
	{ name:"image_LCRI3", maxCount: 1 },
	{ name:"image_RCLI1", maxCount: 1 },
	{ name:"image_RCLI2", maxCount: 1 },
    ])(req, res, function (err) {
        console.log("err", err);

        if (err instanceof multer.MulterError) {
            console.log("MulterError code:", err.code);
            console.log("MulterError message:", err.message);
            console.log("MulterError field:", err.field);
            return res.status(400).json({ success: false, message: "File upload error" });
        } else if (err) {
            console.log(err, "err");
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        console.log("req.body40=====>", req.body);
		
		const bannerImage1FilePath 	= req.files["bannerImage1"][0]?.path;
		const bannerImage2FilePath 	= req.files["bannerImage2"][0]?.path;
		const bannerImage3FilePath 	= req.files["bannerImage3"][0]?.path;
		const image_LCRI1FilePath 	= req.files["image_LCRI1"][0]?.path;
		const image_LCRI2FilePath 	= req.files["image_LCRI2"][0]?.path;
		const image_LCRI3FilePath 	= req.files["image_LCRI3"][0]?.path;
		const image_RCLI1FilePath 	= req.files["image_RCLI1"][0]?.path;
		const image_RCLI2FilePath 	= req.files["image_RCLI2"][0]?.path;
		
        console.log("bannerImage1FilePath", bannerImage1FilePath);

        // Continue processing for other fields and values
        console.log("insert req.body => ", req.body);
        var numOfWords = 0;
        var readingInMin = 0;

        if (req.body.projectDescription) {
            numOfWords = req.body.projectDescription.split(" ").length;
            readingInMin = Math.round(parseInt(numOfWords) / 200) + 1;
        }

		User.findOne({ _id: ObjectId(req.body.user_id.trim()) })
			.then(user => {
				var caseStudy = new Model({
					_id: new mongoose.Types.ObjectId(),
					user_id: req.body.user_id,
					projectName: req.body.projectName,
					service: req.body.service,
					pageURL: req.body.pageURL,
					projectDescription: req.body.projectDescription,

					bannerImage1 	: bannerImage1FilePath,
					bannerImage2 	: bannerImage2FilePath,
					bannerImage3 	: bannerImage3FilePath,
					image_LCRI1 	: image_LCRI1FilePath,
					image_LCRI2 	: image_LCRI2FilePath,
					image_LCRI3 	: image_LCRI3FilePath,
					image_RCLI1 	: image_RCLI1FilePath,
					image_RCLI2 	: image_RCLI2FilePath,
					
					heading_LCRI1	: req.body.heading_LCRI1,
					content_LCRI1	: req.body.content_LCRI1,
					heading_LCRI2	: req.body.heading_LCRI2,
					content_LCRI2	: req.body.content_LCRI2,
					heading_LCRI3	: req.body.heading_LCRI3,
					content_LCRI3	: req.body.content_LCRI3,
					heading_RCLI1	: req.body.heading_RCLI1,
					content_RCLI1	: req.body.content_RCLI1,
					heading_RCLI2	: req.body.heading_RCLI2,
					content_RCLI2	: req.body.content_RCLI2,

					numOfWords: numOfWords,
					readingInMin: readingInMin,
					createdBy: req.body.user_id,
					authorName: user.profile.firstname + " " + user.profile.lastname,
					createdAt: new Date(),
				});
				console.log("caseStudy",caseStudy)
				caseStudy.save()
					.then(insertedCaseStudy => {
						console.log("insertedCaseStudy => ", insertedCaseStudy);
						res.status(200).json({
							success: true,
							message: "Case Study inserted successfully",
							feedback: insertedCaseStudy
						});
					})
					.catch(error => {
						console.log("Error while inserting Case Study -> ",error);
						res.status(500).json({
							message: "Error while inserting Case Study",
							success: false,
							error: error
						});
					})
			})
			.catch(error => {
				console.log("Error while inserting Case Study -> ",error);
				res.status(500).json({
					message: "Error while finding Case Study author name",
					success: false,
					error: error
				});
			})
	});
};



exports.getCaseStudyList = (req, res, next) => {

	Model.find()
		.populate("createdBy")
		.sort({ "createdAt": -1 })
		.then((caseStudyList) => {
			console.log("caseStudyList", caseStudyList);
			var caseStudyListArr = [];

			if (caseStudyList.length > 0) {
				console.log("caseStudyList[i] 100", caseStudyList[0]);
				for (var i = 0; i < caseStudyList.length; i++) {
					var x = {
						_id: caseStudyList[i]._id,
						projectName: caseStudyList[i].projectName,
						pageURL: caseStudyList[i].pageURL,
						projectDescription: caseStudyList[i].projectDescription,
						bannerImage: caseStudyList[i].bannerImage,
						createdBy: caseStudyList[i].createdBy,
						createdAt: caseStudyList[i].createdAt,
						userFullName: caseStudyList[i].createdBy ? caseStudyList[i].createdBy.profile.fullName : "-",
						email: caseStudyList[i].createdBy ? caseStudyList[i].createdBy.profile.email : "-",
						mobile: caseStudyList[i].createdBy ? caseStudyList[i].createdBy.profile.mobile : "-",
						// userPic: caseStudyList[i].createdBy ? caseStudyList[i].createdBy.documents && caseStudyList[i].createdBy.documents?.profilePhoto ? caseStudyList[i].createdBy.documents.profilePhoto[0].url : "-" : "-",
						usersLiked: caseStudyList[i].usersLiked ? caseStudyList[i].usersLiked : "-",
						approvalStatus: caseStudyList[i].approvalStatus ? caseStudyList[i].approvalStatus : "-",
						approvalDate: caseStudyList[i]?.approvalLog.slice(-1)[0]?.updatedAt
							? moment(caseStudyList[i]?.approvalLog.slice(-1)[0]?.updatedAt).format(
								"DD/MM/YYYY"
							)
							: "Not available",
						remark: caseStudyList[i]?.approvalLog.slice(-1)[0]?.remark ?? "None",

					}

					caseStudyListArr.push(x);
				}

				if (i >= caseStudyList.length) {
					// console.log("caseStudyListArr = ",caseStudyListArr);

					res.status(200).json({
						success: true,
						data: caseStudyListArr,
						message: "Data Found successfully"
					});
				}
			} else {
				res.status(200).json({
					success: false,
					data: [],
					message: "Data Not Found"
				});
			}

		})
		.catch(error => {
			console.log("Issue occured while getting blog list : error => ", error);
			res.status(500).json({
				error: error,
				success: false,
				message: "Issue occured while getting blog list"
			})
		});
}


exports.getCaseStudyListByService = (req, res, next) => {
	if(req.params.service==="All"){
		var selector ={}
	}else{
		var selector ={service:req.params.service}
	}
	Model.find(selector)
		.populate("createdBy")
		.sort({ "createdAt": -1 })
		.then((caseStudyList) => {
			console.log("caseStudyList", caseStudyList);
			var caseStudyListArr = [];

			if (caseStudyList.length > 0) {
				// for (var i = 0; i < caseStudyList.length; i++) {
				// 	var x = {
				// 		_id: caseStudyList[i]._id,
				// 		projectName: caseStudyList[i].projectName,
				// 		pageURL: caseStudyList[i].pageURL,
				// 		projectDescription: caseStudyList[i].projectDescription,
				// 		bannerImage: caseStudyList[i].bannerImage,
				// 		createdBy: caseStudyList[i].createdBy,
				// 		createdAt: caseStudyList[i].createdAt,
				// 		userFullName: caseStudyList[i].createdBy ? caseStudyList[i].createdBy.profile.fullName : "-",
				// 		email: caseStudyList[i].createdBy ? caseStudyList[i].createdBy.profile.email : "-",
				// 		mobile: caseStudyList[i].createdBy ? caseStudyList[i].createdBy.profile.mobile : "-",
				// 		// userPic: caseStudyList[i].createdBy ? caseStudyList[i].createdBy.documents && caseStudyList[i].createdBy.documents?.profilePhoto ? caseStudyList[i].createdBy.documents.profilePhoto[0].url : "-" : "-",
				// 		usersLiked: caseStudyList[i].usersLiked ? caseStudyList[i].usersLiked : "-",
				// 		approvalStatus: caseStudyList[i].approvalStatus ? caseStudyList[i].approvalStatus : "-",
				// 		approvalDate: caseStudyList[i]?.approvalLog.slice(-1)[0]?.updatedAt
				// 			? moment(caseStudyList[i]?.approvalLog.slice(-1)[0]?.updatedAt).format(
				// 				"DD/MM/YYYY"
				// 			)
				// 			: "Not available",
				// 		remark: caseStudyList[i]?.approvalLog.slice(-1)[0]?.remark ?? "None",

				// 	}

				// 	caseStudyListArr.push(x);
				// }

				// if (i >= caseStudyList.length) {
					// console.log("caseStudyListArr = ",caseStudyListArr);

					res.status(200).json({
						success: true,
						data: caseStudyList,
						message: "Data Found successfully"
					});
				// }
			} else {
				res.status(200).json({
					success: false,
					data: [],
					message: "Data Not Found"
				});
			}

		})
		.catch(error => {
			console.log("Issue occured while getting blog list : error => ", error);
			res.status(500).json({
				error: error,
				success: false,
				message: "Issue occured while getting blog list"
			})
		});
};

exports.fetch_page_using_id = (req, res, next) => {
	console.log(" req.params.pageURL => ",req.params.pageURL);    
	Model.findOne({ "pageURL": req.params.pageURL })
		.populate("createdBy")
		.then(pageData => {

			res.status(200).json(pageData);
		})
		.catch(err => {
			// console.log(err);
			res.status(500).json({
				error: err
			});
		});
};


exports.deleteCaseStudy = (req, res, next)=>{
    Model.deleteOne({_id: req.params._id})
        .exec()
        .then(data=>{
            if(data.deletedCount === 1){
                res.status(200).json({ deleted : true });
            }else{
                res.status(200).json({ deleted : false });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        });           
};