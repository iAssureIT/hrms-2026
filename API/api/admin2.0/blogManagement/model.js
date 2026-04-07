const mongoose = require("mongoose");

const blogs = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  blogTitle: String,
  type: String,
  blogURL: String,
  blogCategory: String,
  blogHeaderImage: String,
  // blogHeaderImage     : {
  // 					"path"  	: String,
  // 					"name"		: String,
  // 					},
  blogSummary: String,
  blogContent: String,
  numOfWords: Number,
  readingInMin: Number,
  noOfVisited: Number,
  usersLiked: Array,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  authorName: String,
  createdAt: Date,
  updatedAt: Date,
  approvalStatus: { type: String, default: "Approved" },
  approvalLog: [
    {
      status: String,
      updatedAt: Date,
      updatedBy: String,
      remark: String,
    },
  ],
});

module.exports = mongoose.model("blogs", blogs);
