const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post',Controller.insertBlog);

router.get('/get/single-blog/:blog_id', Controller.fetch_blog_using_id);

router.get('/get/:blogURL', Controller.fetch_blog_url);

router.get('/get/list/:numOfBlogs', Controller.getBlogList)

router.get('/get/list/by-user_id/:user_id', Controller.getBlogListByUserId);

router.get('/get/saved-items-list/:user_id', Controller.getSavedItemsList);

router.get('/get/list/trending/:numOfBlogs/:pageNum', Controller.getTrendingBlogList);

router.get('/get/list/visited/:numOfBlogs/:pageNum', Controller.getMostVisitedBlog);

router.get('/get/list/liked/:numOfBlogs/:pageNum', Controller.getMostLikedBlogList);

router.get('/search/:searchTxt', Controller.searchByTitle);

router.get('/get/list/categorywise/:category', Controller.getListCategoryWise);

router.get('/get-list/addNumberOfWords', Controller.addNumberOfWords);

router.post('/search-blogs', Controller.searchBlogs);

router.patch('/patch/blog',Controller.update_for_userLikes);


router.patch('/patch/update/blog',Controller.update_blog);

router.post('/patch/update/blog1',Controller.update_blog1);

router.get('/get/update/blog-author-names',Controller.update_blog_author_names);

router.delete('/delete/delete-blog/:blog_id',Controller.deleteBlog);

router.get('/blogslist',Controller.getBlogsList);

router.patch('/approveBlog',Controller.approveBlog);

router.get("/get/getblogcount/:user_id", Controller.getTypewiseCount);

module.exports = router;