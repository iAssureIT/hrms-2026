const mongoose				= require("mongoose");
var   ObjectId 				= require('mongodb').ObjectID;
const moment 				= require("moment");
const _                 	= require("underscore");
const Blogs 				= require('./model.js');
const User 					= require('../userManagementnew/ModelUsers.js');
const globalVariable 		= require("../../../nodemonConfig.js");
const MasterNotifications 	= require('../notificationManagement/ModelMasterNotification.js');
const { sendNotification }  = require("../common/globalFunctions");
const multer 				= require("multer");


exports.insertBlog = (req, res, next) => {
	var numOfWords = 0;
	var readingInMin = 0;

	if (req.body.blogContent) {
		numOfWords = req.body.blogContent.split(" ").length;
		readingInMin = Math.round(parseInt(numOfWords) / 200) + 1;
		// console.log("readingInMin = ",readingInMin,"numOfWords",numOfWords);
	}
	// console.log("req.body",req.body)

	User.findOne({_id : ObjectId(req.body.user_id)})
		.then(user=>{
			// console.log("user",user)
			var blog = 	new Blogs({
				_id  			: new mongoose.Types.ObjectId(),
				user_id 		: req.body.user_id,
				blogTitle      	: req.body.blogTitle,
				blogURL      	: req.body.blogURL,
				type      		: req.body.type,
				blogCategory   	: req.body.blogCategory,
				blogSummary    	: req.body.blogSummary,
				blogHeaderImage : req.body.blogHeaderImage,
				blogContent    	: req.body.blogContent,
				numOfWords 		: numOfWords,
				readingInMin 	: readingInMin,
				createdBy 		: req.body.user_id,
				authorName 		: user.profile.firstname+" "+user.profile.lastname,
				createdAt 		: new Date(),
			});
			blog.save()
				.then(insertedBlog =>{
					// console.log("insertedBlog => ",insertedBlog);
					res.status(200).json({
								success 	: true,
								message 	: "Blog inserted successfully",
								feedback 	: insertedBlog
					});
				})
				.catch(error => {
					console.log("Error while inserting Blog -> ",error);
					res.status(500).json({
								message 	: "Error while inserting Blog",
								success 	: false,
								error 	: error
					});
				})
		})
		.catch(error => {
			console.log("user Error while inserting Blog -> ",error);
			res.status(500).json({
				message 	: "Error while finding blog author name",
				success 	: false,
				error 	: error
			});
		})
};
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, "uploads/images"); // Specify the destination folder for logos
	},
	filename: function (req, file, cb) {
	  cb(null, Date.now() + "-" + file.originalname); // Rename the uploaded logo
	},
  });
//   console.log("storage",storage)
  const upload = multer({ storage: storage }); 

exports.insertBlogOld = (req, res, next) => {
	// console.log(" req body 25============>:", req.body);
	upload.single("blogHeaderImage")(req, res, function (err) {
		// console.log("err",err)
		if (err instanceof multer.MulterError) {
	// console.log(" req body 29============>:", req.body);

		//   console.log("MulterError code:", err.code);
		//   console.log("MulterError message:", err.message);
		//   console.log("MulterError field:", err.field);
		  return res
			.status(400)
			.json({ success: false, message: "File upload error" });
		} else if (err) {
		  console.log(err, "err");
		  return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
		}
		// console.log("req.body40=====>", req.body);
		// console.log("req.body.image", req.body.image);
		const imageFilePath = req.file.path;
	// 	console.log("imageFilePath",imageFilePath);
	// console.log("insertBlog req.body => ", req.body);
	var numOfWords = 0;
	var readingInMin = 0;

	if (req.body.blogContent) {
		numOfWords = req.body.blogContent.split(" ").length;
		readingInMin = Math.round(parseInt(numOfWords) / 200) + 1;
		// console.log("readingInMin = ",readingInMin);
	}

	User.findOne({_id : ObjectId(req.body.user_id)})
		.then(user=>{
				var blog = 	new Blogs({
			  					_id  			: new mongoose.Types.ObjectId(),
								user_id 		: req.body.user_id,
					            blogTitle      	: req.body.blogTitle,
					            blogURL      	: req.body.blogURL,
					            blogCategory   	: req.body.blogCategory,
					            blogSummary    	: req.body.blogSummary,
					            blogHeaderImage : imageFilePath,
					            blogContent    	: req.body.blogContent,
					            numOfWords 		: numOfWords,
					            readingInMin 	: readingInMin,
								createdBy 		: req.body.user_id,
								authorName 		: user.profile.firstname+" "+user.profile.lastname,
								createdAt 		: new Date(),
			});

			blog.save()
						.then(insertedBlog =>{
							// console.log("insertedBlog => ",insertedBlog);
					res.status(200).json({
								success 	: true,
								message 	: "Blog inserted successfully",
								feedback 	: insertedBlog
					});
				})
				.catch(error => {
					//console.log("Error while inserting Blog -> ",error);
					res.status(500).json({
								message 	: "Error while inserting Blog",
								success 	: false,
								error 	: error
					});
				})
		})
		.catch(error => {
			//console.log("Error while inserting Blog -> ",error);
			res.status(500).json({
				message 	: "Error while finding blog author name",
				success 	: false,
				error 	: error
			});
		})
	});
};

function getUserProfile(user_id) {

	return new Promise((resolve, reject) => {
		User.findOne({ _id: ObjectId(user_id) }, { services: 0 })
			.populate("profile.company_id")
			.then(user => {
				// console.log(user_id, " | getUserProfile user => ",user);

				if (user) {
					resolve(user);
				} else {
					resolve(0);
				}
			})
			.catch(error => {
				// console.log("Error while finding User profile -> ",error);
				reject(0);
			})
	});
}


exports.getAppointmentSlots = (req, res, next) => {
	// console.log("req.body -> ",req.body);

	AppointmentSlots.findOne({ user_id: ObjectId(req.body.user_id) })
		.then(data => {
			// console.log("data -> ",data);
			if (data) {
				res.status(200).json(data);
			} else {
				res.status(200).json("Data Not Found");
			}
		})
		.catch(error => {
			// console.log("Error -> ",error);
			res.status(500).json({
				message: "Error while finding AppointmentSlots",
				error: error
			});
		})
}

exports.fetch_blog_url = (req, res, next) => {
	// console.log("fetch_blog_url req.params.blogURL =>1144444 ", req.params.blogURL);

	// Blogs.findOne({"blogURL" : req.params.blogURL, approvalStatus : "Approved"})
	Blogs.findOne({ "blogURL": req.params.blogURL })
		.populate("createdBy")
		.exec()
		.then(blog => {
			// console.log("fetch_blog_url => ",blog);

			if (blog) {
				Blogs.updateOne(
					{ "blogURL": req.params.blogURL },
					{
						$inc: { noOfVisited: 1 }
					}
				)
					.exec()
					.then(data => {
						// console.log("fetch_blog_url data",data)
						res.status(200).json(blog);
					})
					.catch(err => {
						// console.log(err);
						res.status(500).json({
							error: err
						});
					});
			} else {
				res.status(200).json({ message: "DATA_NOT_FOUND" })
			}
		})
		.catch(err => {
			// console.log(err);
			res.status(500).json({
				error: err
			});
		});
};

exports.fetch_blog_using_id = (req, res, next) => {
	// console.log("fetch_blog_url req.params.blogURL => ",req.params.blogURL);    
	Blogs.findOne({ "_id": req.params.blog_id })
		.populate("createdBy")
		.then(blog => {
			res.status(200).json(blog);
		})
		.catch(err => {
			// console.log(err);
			res.status(500).json({
				error: err
			});
		});
};


exports.getBlogList = (req, res, next) => {
	var numOfBlogs = parseInt(req.params.numOfBlogs);
	// console.log("numOfBlogs",numOfBlogs);

	Blogs.find({ approvalStatus: "Approved" })
		.populate("createdBy")
		.sort({ "createdAt": -1 })
		.limit(numOfBlogs)
		.then((blogList) => {
			// console.log("blogList",blogList);
			var blogListArr = [];

			if (blogList.length > 0) {
				//console.log("blogList[i] 100",blogList[0]);
				for (var i = 0; i < blogList.length; i++) {
					var x = {
										_id 				: blogList[i]._id,
									    blogTitle           : blogList[i].blogTitle,
									    blogURL             : blogList[i].blogURL,
									    blogCategory        : blogList[i].blogCategory,
									    blogHeaderImage     : blogList[i].blogHeaderImage,
									    blogSummary         : blogList[i].blogSummary,
									    blogContent         : blogList[i].blogContent,
									    createdBy           : blogList[i].createdBy,
									    createdAt           : blogList[i].createdAt,
									    userFullName 		: blogList[i].createdBy ? blogList[i].createdBy.profile.fullName : "-",
									   // userPic 			: blogList[i].createdBy ? blogList[i].createdBy.documents && blogList[i].createdBy.documents.profilePhoto ? blogList[i].createdBy.documents.profilePhoto[0].url : "-" : "-",
					}
					blogListArr.push(x);
				}

				if (i >= blogList.length) {
					// console.log("blogListArr = ",blogListArr);

					res.status(200).json({
						success: true,
						data: blogListArr,
						message: "Data Found successfully"
					});
				}
			} else {
				res.status(200).json({
						success : false,
						data 	: [],
						message : "Data Not Found"
				});
			}

		})
		.catch(error => {
			console.log("Issue occured while getting blog list : error => ", error);
			res.status(500).json({
					error   : error,
					success : false,
					message : "Issue occured while getting blog list"
			})
		});
}

exports.getBlogListByUserId = (req, res, next) => {
	Blogs.find({ user_id: req.params.user_id })
		.populate("createdBy")
		.sort({ "createdAt": -1 })
		.then((blogList) => {
			var blogListArr = [];
			if (blogList.length > 0) {
				for (var i = 0; i < blogList.length; i++) {
					var x = {
						_id: blogList[i]?._id,
						blogTitle: blogList[i]?.blogTitle,
						blogURL: blogList[i]?.blogURL,
						blogCategory: blogList[i]?.blogCategory,
						blogHeaderImage: blogList[i]?.blogHeaderImage,
						blogSummary: blogList[i]?.blogSummary,
						blogContent: blogList[i]?.blogContent,
						createdBy: blogList[i]?.createdBy,
						createdAt: blogList[i]?.createdAt,
						userFullName: blogList[i]?.createdBy.profile.fullName,
						userPic: blogList[i]?.createdBy?.documents && blogList[i]?.createdBy?.documents?.profilePhoto ? blogList[i]?.createdBy?.documents?.profilePhoto[0]?.url : "-",
						usersLiked: blogList[i]?.usersLiked ? blogList[i]?.usersLiked : "-"
					}
					blogListArr.push(x);
				}
				if (i >= blogList.length) {
					res.status(200).json({
						success: true,
						data: blogListArr,
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
			res.status(500).json({
				error: error,
				success: false,
				message: "Issue occured while getting blog list"
			})
		});
}

exports.getSavedItemsList = (req, res, next) => {
	Blogs.find({ usersLiked: req.params.user_id })
		.populate("createdBy")
		.sort({ "createdAt": -1 })
		.then((blogList) => {
			var blogListArr = [];
			if (blogList.length > 0) {
				for (var i = 0; i < blogList.length; i++) {
					var x = {
						_id: blogList[i]._id,
						blogTitle: blogList[i].blogTitle,
						blogURL: blogList[i].blogURL,
						blogCategory: blogList[i].blogCategory,
						blogHeaderImage: blogList[i].blogHeaderImage,
						blogSummary: blogList[i].blogSummary,
						blogContent: blogList[i].blogContent,
						createdBy: blogList[i].createdBy,
						createdAt: blogList[i].createdAt,
						userFullName: blogList[i].createdBy && blogList[i].createdBy.profile ? blogList[i].createdBy.profile.fullName : "-",
						userPic: blogList[i].createdBy && blogList[i].createdBy.documents && blogList[i].createdBy.documents.profilePhoto ? blogList[i].createdBy.documents.profilePhoto[0].url : "-",
						usersLiked: blogList[i].usersLiked ? blogList[i].usersLiked : "-"
					}

					// console.log("blogTitle => ",blogList[i].blogTitle);

					blogListArr.push(x);
				}

				if (i >= blogList.length) {
					res.status(200).json({
						success: true,
						data: blogListArr,
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
			console.log("getSavedItemsList error => ", error);
			res.status(500).json({
				error: error,
				success: false,
				message: "Issue occured while getting blog list"
			})
		});
}

exports.getTrendingBlogList = (req, res, next) => {
	var numOfBlogs = parseInt(req.params.numOfBlogs);
	var pageNum = parseInt(req.params.pageNum) > 0 ? parseInt(req.params.pageNum) : 1;
	var skipItems = 0;
	if (pageNum > 0 & numOfBlogs > 0) {
		skipItems = (pageNum - 1) * numOfBlogs;
	}

	// console.log("numOfBlogs => ",numOfBlogs," | pageNum => ",pageNum," | skipItems => ",skipItems);

	Blogs.find({ approvalStatus: "Approved" })
		.populate("createdBy")
		.sort({ "createdAt": -1 })
		.limit(numOfBlogs)
		.skip(skipItems)
		.then((blogList) => {
			var blogListArr = [];
			// console.log("blogListArr length => ",blogList.length);

			if (blogList.length > 0) {
				for (var i = 0; i < blogList.length; i++) {
					// console.log("i => ",i);

					var x = {
						_id: blogList[i]._id,
						blogTitle: blogList[i].blogTitle,
						blogURL: blogList[i].blogURL,
						blogCategory: blogList[i].blogCategory,
						blogHeaderImage: blogList[i].blogHeaderImage,
						blogSummary: blogList[i].blogSummary,
						blogContent: blogList[i].blogContent,
						createdBy: blogList[i].createdBy,
						createdAt: blogList[i].createdAt,
						userFullName: blogList[i].createdBy && blogList[i].createdBy.profile && blogList[i].createdBy.profile.fullName ? blogList[i].createdBy.profile.fullName : "-NA-",
						userPic: blogList[i].createdBy && blogList[i].createdBy.documents && blogList[i].createdBy.documents.profilePhoto && blogList[i].createdBy.documents.profilePhoto[0].url ? blogList[i].createdBy.documents.profilePhoto[0].url : "-",
					}
					blogListArr.push(x);
				}

				// console.log("final i => ",i);
				if (i >= blogList.length) {

					Blogs.countDocuments()
						.then(blogCount => {
							// console.log("blogListArr count => ",blogListArr.length," | total count => ",blogCount);
							res.status(200).json({
								success: true,
								blogList: blogListArr,
								blogCount: blogCount,
								message: "Data Found successfully"
							});
						})
						.catch(error => {
							res.status(500).json({
								error: error,
								success: false,
								blogCount: blogCount,
								message: "Issue occured while getting blog count"
							})
						});
				}
			} else {
				res.status(200).json({
					success: false,
					blogCount: 0,
					blogList: [],
					message: "Data Not Found"
				});
			}

		})
		.catch(error => {
			res.status(500).json({
				error: error,
				success: false,
				message: "Issue occured while getting blog list"
			})
		});
}


exports.getMostVisitedBlog = (req, res, next) => {
	var numOfBlogs = parseInt(req.params.numOfBlogs);
	var pageNum = parseInt(req.params.pageNum) > 0 ? parseInt(req.params.pageNum) : 1;
	var skipItems = 0;
	if (pageNum > 0 & numOfBlogs > 0) {
		skipItems = (pageNum - 1) * numOfBlogs;
	}

	// console.log("numOfBlogs => ",numOfBlogs," | pageNum => ",pageNum," | skipItems => ",skipItems);

	Blogs.find({ approvalStatus: "Approved" })
		.populate("createdBy")
		.sort({ "createdAt": 1 })
		.limit(numOfBlogs)
		.skip(skipItems)
		.then((blogList) => {
			var blogListArr = [];
			// console.log("blogListArr length => ",blogList.length);

			if (blogList.length > 0) {
				for (var i = 0; i < blogList.length; i++) {
					// console.log("i => ",i);

					var x = {
						_id: blogList[i]._id,
						blogTitle: blogList[i].blogTitle,
						blogURL: blogList[i].blogURL,
						blogCategory: blogList[i].blogCategory,
						blogHeaderImage: blogList[i].blogHeaderImage,
						blogSummary: blogList[i].blogSummary,
						blogContent: blogList[i].blogContent,
						createdBy: blogList[i].createdBy,
						createdAt: blogList[i].createdAt,
						userFullName: blogList[i].createdBy && blogList[i].createdBy.profile && blogList[i].createdBy.profile.fullName ? blogList[i].createdBy.profile.fullName : "-NA-",
						userPic: blogList[i].createdBy && blogList[i].createdBy.documents && blogList[i].createdBy.documents.profilePhoto && blogList[i].createdBy.documents.profilePhoto[0].url ? blogList[i].createdBy.documents.profilePhoto[0].url : "-",
					}
					blogListArr.push(x);
				}

				// console.log("final i => ",i);
				if (i >= blogList.length) {

					Blogs.countDocuments()
						.then(blogCount => {
							// console.log("blogListArr count => ",blogListArr.length," | total count => ",blogCount);
							res.status(200).json({
								success: true,
								blogList: blogListArr,
								blogCount: blogCount,
								message: "Data Found successfully"
							});
						})
						.catch(error => {
							res.status(500).json({
								error: error,
								success: false,
								blogCount: blogCount,
								message: "Issue occured while getting blog count"
							})
						});
				}
			} else {
				res.status(200).json({
					success: false,
					blogCount: 0,
					blogList: [],
					message: "Data Not Found"
				});
			}

		})
		.catch(error => {
			res.status(500).json({
				error: error,
				success: false,
				message: "Issue occured while getting blog list"
			})
		});
}

exports.getMostLikedBlogList = (req, res, next) => {
	var numOfBlogs = parseInt(req.params.numOfBlogs);
	var pageNum = parseInt(req.params.pageNum) > 0 ? parseInt(req.params.pageNum) : 1;
	var skipItems = 0;
	if (pageNum > 0 & numOfBlogs > 0) {
		skipItems = (pageNum - 1) * numOfBlogs;
	}

	// console.log("numOfBlogs => ",numOfBlogs," | pageNum => ",pageNum," | skipItems => ",skipItems);

	Blogs.find({ approvalStatus: "Approved" })
		.populate("createdBy")
		.sort({ "createdAt": 1 })
		.limit(numOfBlogs)
		.skip(skipItems)
		.then((blogList) => {
			var blogListArr = [];
			// console.log("blogListArr length => ",blogList.length);

			if (blogList.length > 0) {
				for (var i = 0; i < blogList.length; i++) {
					// console.log("i => ",i);

					var x = {
						_id: blogList[i]._id,
						blogTitle: blogList[i].blogTitle,
						blogURL: blogList[i].blogURL,
						blogCategory: blogList[i].blogCategory,
						blogHeaderImage: blogList[i].blogHeaderImage,
						blogSummary: blogList[i].blogSummary,
						blogContent: blogList[i].blogContent,
						createdBy: blogList[i].createdBy,
						createdAt: blogList[i].createdAt,
						userFullName: blogList[i].createdBy && blogList[i].createdBy.profile && blogList[i].createdBy.profile.fullName ? blogList[i].createdBy.profile.fullName : "-NA-",
						userPic: blogList[i].createdBy && blogList[i].createdBy.documents && blogList[i].createdBy.documents.profilePhoto && blogList[i].createdBy.documents.profilePhoto[0].url ? blogList[i].createdBy.documents.profilePhoto[0].url : "-",
					}
					blogListArr.push(x);
				}

				// console.log("final i => ",i);
				if (i >= blogList.length) {

					Blogs.countDocuments()
						.then(blogCount => {
							// console.log("blogListArr count => ",blogListArr.length," | total count => ",blogCount);
							res.status(200).json({
								success: true,
								blogList: blogListArr,
								blogCount: blogCount,
								message: "Data Found successfully"
							});
						})
						.catch(error => {
							res.status(500).json({
								error: error,
								success: false,
								blogCount: blogCount,
								message: "Issue occured while getting blog count"
							})
						});
				}
			} else {
				res.status(200).json({
					success: false,
					blogCount: 0,
					blogList: [],
					message: "Data Not Found"
				});
			}

		})
		.catch(error => {
			res.status(500).json({
				error: error,
				success: false,
				message: "Issue occured while getting blog list"
			})
		});
}



exports.searchByTitle = (req, res, next) => {
	Blogs.find({ blogTitle: req.params.searchTxt, approvalStatus: "Approved" })
		.exec()
		.then(data => {
			res.status(200).json(data);
		})
		.catch(err => {
			res.status(500).json({ error: err });
		});
};

exports.getListCategoryWise = (req, res, next) => {
	Blogs.find({ blogCategory: req.params.category, approvalStatus: "Approved" })
		.exec()
		.then(blogListArr => {
			if (blogListArr.length > 0) {
				res.status(200).json({
					success: true,
					blogList: blogListArr,
					message: "Data Found successfully"
				});
			} else {
				res.status(200).json({
					success: false,
					blogList: [],
					message: "Data Not Found"
				});
			}
		})
		.catch(err => {
			res.status(500).json({
				error: error,
				success: false,
				message: "Issue occured while getting Categorywise blog list"
			})
		});
};


exports.searchBlogs = (req, res, next) => {

	// console.log("searchBlogs req.body => ", req.body);

	var category = req.body.category;
	var searchPhrase = req.body.searchPhrase;
	var pageNum = parseInt(req.body.pageNum) > 0 ? parseInt(req.body.pageNum) : 1;
	var sendItems = parseInt(req.body.sendItems) > 0 ? parseInt(req.body.sendItems) : 8;
	var selector = {};
	var skipItems = 0;

	if (pageNum > 0 & sendItems > 0) {
		skipItems = (pageNum - 1) * sendItems;
	}

	if (category === "*" & searchPhrase !== "*") {
		selector = {
			$or: [
				{ "blogTitle": new RegExp(searchPhrase, 'i') },
				{ "blogCategory": new RegExp(searchPhrase, 'i') },
				{ "blogSummary": new RegExp(searchPhrase, 'i') },
				{ "blogContent": new RegExp(searchPhrase, 'i') },
				{ "authorName": new RegExp(searchPhrase, 'i') },
			],
			approvalStatus: "Approved"
		};
	}

	if (category !== "*" & searchPhrase === "*") {
		selector = { blogCategory: category, approvalStatus: "Approved" };
	}

	if (category !== "*" & searchPhrase !== "*") {
		selector = {
			blogCategory: category, approvalStatus: "Approved",
			$or: [
				{ "blogTitle": new RegExp(searchPhrase, 'i') },
				{ "blogCategory": new RegExp(searchPhrase, 'i') },
				{ "blogSummary": new RegExp(searchPhrase, 'i') },
				{ "blogContent": new RegExp(searchPhrase, 'i') },
				{ "authorName": new RegExp(searchPhrase, 'i') },
			]
		};
	}

	// console.log("searchBlogs selector => ", selector);

	Blogs.find(selector)
		.populate('createdBy')
		.sort({ createdAt: -1 })
		.limit(sendItems)
		.skip(skipItems)
		.then(blogListArr => {
			// console.log("searchBlogs blogListArr => ", blogListArr);


			Blogs.find(selector)
				.countDocuments()
				.then(blogListCount => {
					if (blogListArr.length > 0) {
						res.status(200).json({
							success: true,
							blogList: blogListArr,
							blogCount: blogListCount,
							message: "Data Found successfully",
						});
					} else {
						res.status(200).json({
							success: false,
							blogList: [],
							blogCount: blogListCount,
							message: "Data Not Found"
						});
					}
				})
				.catch(err => {
					res.status(500).json({
						error: error,
						success: false,
						message: "Issue occured while getting blog list count"
					})
				});
		})
		.catch(err => {
			res.status(500).json({
				error: error,
				success: false,
				message: "Issue occured while getting Categorywise blog list"
			})
		});
};


exports.addNumberOfWords = (req, res, next) => {

	Blogs.find({ approvalStatus: "Approved" })
		.then(async (blogList) => {
			// console.log("blogList = ",blogList.length);

			if (blogList.length > 0) {
				for (var i = 0; i < blogList.length; i++) {
					var updateBlogVar = await updateBlog(blogList[i]._id, blogList[i].blogContent);
					// console.log("updateBlogVar output = ",updateBlogVar);
				}
				if (i >= blogList.length) {
					res.status(200).json({ message: "All blogs updated successfully!" });
				}
			} else {
				res.status(500).json({ message: "No Blogs Found" });
			}
		})
		.catch(err => {
			console.log("updateBlog err = ", err);
			res.status(500).json({
				error: err,
				success: false,
				message: "addNumberOfWords Issue occured while getting blog list"
			})
		});

}

function updateBlog(_id, content) {

	if (content) {
		var numOfWords = content.split(" ").length;
		var readingInMin = Math.round(parseInt(numOfWords) / 200) + 1;
		// console.log("numOfWords => ",numOfWords," | readingInMin = ",readingInMin);
	}

	return new Promise((resolve, reject) => {
		Blogs.updateOne(
			{ "_id": _id },
			{
				$set: {
					numOfWords: numOfWords,
					readingInMin: readingInMin,
				}
			}
		)
			.then(updatedBlog => {
				// console.log(_id," | updatedBlog => ",updatedBlog);
				resolve(updatedBlog);
			})
			.catch(error => {
				reject(error);
			})
	})
}

exports.update_blog = (req, res, next) => {

	// console.log("update_blog req.body => ",req.body);

	Blogs.updateOne(
		{ _id: req.body.blog_id },
		{
			$set: {
				user_id: req.body.user_id,
				blogTitle: req.body.blogTitle,
				blogURL: req.body.blogURL,
				blogCategory: req.body.blogCategory,
				blogSummary: req.body.blogSummary,
				blogHeaderImage: req.body.blogHeaderImage,
				blogContent: req.body.blogContent,
				updatedAt: new Date(),
			}
		},
	)
		.then(updatedBlog => {
			// console.log("update blog Msg -> ",updatedBlog);

			Blogs.findOne({ _id: req.body.blog_id })
				.then(blogDoc => {
					res.status(200).json({
						message: "Blog updated Successfully",
						success: true,
						data: updatedBlog,
						blogDoc: blogDoc
					})
				})
				.catch(error => {
					console.log("update blog error -> ", error);
					res.status(500).json({ message: "Error occured while getting blogdoc", success: false, error: error });
				})

		})
		.catch(error => {
			console.log("update blog error -> ", error);
			res.status(500).json({ message: "Error occured while updating blog" });
		})
};

exports.update_blog1 = (req, res, next) => {

	upload.single("blogHeaderImage")(req, res, function (err) {
		// console.log("err 843", err)
		if (err instanceof multer.MulterError) {
			// console.log(" req body 29============>:", req.body);

			return res
				.status(400)
				.json({ success: false, message: "File upload error" });
		} else if (err) {
			console.log(err, "err 851");
			return res
				.status(500)
				.json({ success: false, message: "Internal server error" });
		}
		// console.log("req.body40=====>", req.body);
		// console.log("req.body.image", req.body.image);
		const imageFilePath = req.file?.path;
		// console.log("imageFilePath", imageFilePath);



		Blogs.updateOne(
			{ _id: req.body?.blog_id },
			{
				$set: {
					user_id: req.body?.user_id,
					blogTitle: req.body?.blogTitle,
					blogURL: req.body?.blogURL,
					blogSummary: req.body?.blogSummary,
					blogHeaderImage: imageFilePath,
					blogContent: req.body.blogContent,
					updatedAt: new Date(),
				}
			},
		)
			.then(updatedBlog => {
				// console.log("update blog Msg -> ", updatedBlog);

				Blogs.findOne({ _id: req.body?.blog_id })
					.then(blogDoc => {
						// console.log("blogDoc", blogDoc)
						res.status(200).json({
							message: "Blog updated Successfully",
							success: true,
							data: updatedBlog,
							blogDoc: blogDoc
						})
					})
					.catch(error => {
						// console.log("update blog error -> ", error);
						res.status(500).json({ message: "Error occured while getting blogdoc", success: false, error: error });
					})

			})
			.catch(error => {
				console.log("update blog error -> ", error);
				res.status(500).json({ message: "Error occured while updating blog" });
			})
	});


};
exports.update_blog_author_names = (req, res, next) => {

	Blogs.find({ approvalStatus: "Approved" })
		.then(async (blogs) => {
			if (blogs && blogs.length > 0) {
				// console.log("blogs.length => ",blogs.length);

				for (var i = 0; i < blogs.length; i++) {
					if (blogs[i].createdBy) {
						// console.log("blogs[i].createdBy => ",blogs[i].createdBy);
						var authorNameUpdate = await updateAuthorNames(blogs[i]._id, blogs[i].createdBy);
						if (!authorNameUpdate) {
							// console.log("Error for blog ", blogs[i]._id);
						}
					}
				}
				if (i >= blogs.length) {
					res.status(200).json({ message: "All Blogs successfully updated" })
				}
			} else {
				res.status(200).json({ message: "No Blog Found" });
			}
		})
		.catch(error => {
			console.log("update blog error -> ", error);
			res.status(500).json({ message: "Error occured while finding blogs" });
		})
};

function updateAuthorNames(blog_id, user_id) {
	// console.log("blog_id -> ",blog_id,' | user_id => ',user_id);

	return new Promise((resolve, reject) => {
		User.findOne({ _id: user_id })
			.then(user => {
				if (user) {
					// console.log("user => ",user.profile.firstname);
					var authorName = user.profile.firstname + " " + user.profile.lastname;
					Blogs.updateOne(
						{ _id: blog_id },
						{ $set: { authorName: authorName } }
					)
						.then(updatedBlog => {
							// console.log("updatedBlog => ",updatedBlog);
							resolve(true);
						})
						.catch(error => {
							console.log("blog update error -> ", error);
							reject(false);
						})
				} else {
					// console.log("user_id not found -> ",user_id);
					resolve(false);
				}
			})
			.catch(error => {
				console.log("blog find author error -> ", error);
				reject(false)
			})
	})

}


exports.update_for_userLikes = (req, res, next) => {
	var ready = false;
	var added = false;
	Blogs.findOne({ _id: req.body.blog_id })
		.then(blogData => {
			// console.log("blogData", blogData);
			var usersLiked = blogData.usersLiked;
			var index = usersLiked.indexOf(req.body.user_id);
			// console.log("usersLiked 662", usersLiked);
			// console.log("index",index);
			if (index > -1) {
				usersLiked.splice(index, 1);
				ready = true;
			} else {
				usersLiked.push(req.body.user_id);
				ready = true;
				added = true;
			}
			// console.log("usersLiked 672",usersLiked);
			if (ready) {
				Blogs.updateOne(
					{ _id: req.body.blog_id },
					{ $set: { usersLiked: usersLiked } }
				)
					.then(updatedblogLikes => {
						// console.log("updatedblogLikes => ",updatedblogLikes," | added = ",added);

						Blogs.findOne({ _id: req.body.blog_id })
							.populate("createdBy")
							.then(blogDetails => {
								res.status(200).json({
									message: "Update Successful!",
									data: updatedblogLikes,
									blogDetails: blogDetails,
									success: true,
								})
							})
							.catch(error => {
								console.log("update blog error -> ", error);
								res.status(500).json({
									message: "Error occured while getting blogDetails",
									success: false,
									error: error
								});
							})

					})
					.catch(error => {
						console.log("Error while update for likes", error);
						res.status(500).json({ message: "Error while update for likes", error: error });
					})
			}
		})
		.catch(error => {
			console.log("Error while find user", error);
			res.status(500).json({ message: "Error while find user", error: error });
		})
}
exports.deleteBlog = (req, res, next) => {
	Blogs.deleteOne({ "_id": req.params.blog_id })
		.then((deletedBata) => {
			res.status(200).json({
				message: "Blog deleted Successfully",
				data: deletedBata
			});

		})
		.catch(error => {
			res.status(500).json({
				error: error,
				message: "Some issue occurred during deleting blog!"
			});
		});
}

exports.getBlogsList = (req, res, next) => {

	Blogs.find()
		.populate("createdBy")
		.sort({ "createdAt": -1 })
		.then((blogList) => {
			// console.log("blogList", blogList);
			var blogListArr = [];

			if (blogList.length > 0) {
				//console.log("blogList[i] 100",blogList[0]);
				for (var i = 0; i < blogList.length; i++) {
					var x = {
						_id: blogList[i]._id,
						blogTitle: blogList[i].blogTitle,
						blogURL: blogList[i].blogURL,
						blogCategory: blogList[i].blogCategory,
						blogHeaderImage: blogList[i].blogHeaderImage,
						blogSummary: (blogList[i].blogSummary),
						blogContent: (blogList[i].blogContent),
						createdBy: blogList[i].createdBy,
						createdAt: blogList[i].createdAt,
						userFullName: blogList[i].createdBy ? blogList[i].createdBy.profile.fullName : "-",
						email: blogList[i].createdBy ? blogList[i].createdBy.profile.email : "-",
						mobile: blogList[i].createdBy ? blogList[i].createdBy.profile.mobile : "-",
						userPic: blogList[i].createdBy ? blogList[i].createdBy.documents && blogList[i].createdBy.documents.profilePhoto ? blogList[i].createdBy.documents.profilePhoto[0].url : "-" : "-",
						usersLiked: blogList[i].usersLiked ? blogList[i].usersLiked : "-",
						approvalStatus: blogList[i].approvalStatus ? blogList[i].approvalStatus : "-",
						approvalDate: blogList[i]?.approvalLog.slice(-1)[0]?.updatedAt
							? moment(blogList[i]?.approvalLog.slice(-1)[0]?.updatedAt).format(
								"DD/MM/YYYY"
							)
							: "Not available",
						remark: blogList[i]?.approvalLog.slice(-1)[0]?.remark ?? "None",

					}

					blogListArr.push(x);
				}

				if (i >= blogList.length) {
					// console.log("blogListArr = ",blogListArr);

					res.status(200).json({
						success: true,
						data: blogListArr,
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

exports.approveBlog = (req, res, next) => {
	// console.log("req.body",req.body)
	Blogs.updateOne(
		{ _id: ObjectId(req.body.blog_id) },
		{
			$set: {
				approvalStatus: req.body.status,
			},
			$push: {
				approvalLog: {
					status: req.body.status,
					updatedAt: Date.now(),
					updatedBy: "Admin",
					remark: req.body.remark,
				},
			},
		}
	)
		.exec()
		.then((updateLog) => {
			// console.log("updateLog", updateLog)
			if (updateLog.modifiedCount === 1) {
				res.status(200).json({ updateData: updateLog, success: true, status: req.body.status, blogTitle: req.body.blogTitle });
				sendNotification({
					toEmail: req.body.email,
					toMobileNumber: req.body.phoneNumber,
					event: "Blog Approval",
					toUserRole: "consultant",
					variables: {
						consultant_name: req.body.consultantName,
						status: req.body.status,
						remark: req.body.remark ?? 'None'
					},
				});
			} else {
				res.status(200).json({ message: "Status update didn't happen", success: false });
			}

		})
		.catch((error) => {
			console.log("error=", error)
		})
};


exports.getTypewiseCount = (req, res, next) => {
	// console.log(" Input Req.params => ", req.params);
	var selector = {};
	if(req.params.user_id ==="All"){
	  selector = {}
	}else{
	  selector = {"createdBy":ObjectId(req.params.user_id)}
	}
	Blogs.aggregate([
		{
		  $match : selector
		},					  
		{
			$group :{
				_id:{
					"type" : "$type",
				},
				"count": { "$sum": 1 }
			}
		},
		{
			$project:{
				_id: 0,
				type    :"$_id.type",
				count   :"$count"
			}
		}
	])
	  .then((data) => {
		// console.log("getTypewiseCount=> ", data);
		if (data) {
		  const totalCount = data.reduce((total, { count }) => total + count, 0);
		//   console.log("totalCount=> ", totalCount);
		  res.status(200).json({
			  success: true,
			  totalCount:totalCount,
			  data: data,
			});
		} else {
		  res.status(200).json({
			success: false,
			message: "Data Not Found",
		  });
		}
	  })
	  .catch((error) => {
		console.log("error => ", error);
		res.status(501).json({
		  success: false,
		  message: "Get List error! - " + error.message,
		});
	  });
  };
  