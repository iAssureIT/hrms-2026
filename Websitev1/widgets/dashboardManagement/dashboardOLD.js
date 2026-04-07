"use client";
import React from "react";
import Axios from "axios";
import { useState, useEffect } from "react";

const Dashboard = (props) => {
  const [user_id, setuser_id] = useState(0);
  const [blogCount, setBlogsCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  
  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      setuser_id(userDetailsParse.user_id) 
      // console.log("userDetailsParse",userDetailsParse)
      if(props.showBlogs){
        // getBlogs(userDetailsParse.user_id)
        getBlogs("All")
      }
      if(props.showUsers){
        getUsers("All") 
      }
      if(props.showProducts){
        getProducts("All")
      }
      if(props.showPhotos){
        getPhotos("All")
      }      
    }
  }, []);
  const getPhotos = async (user_id) => {
    try {
      // console.log("user_id=============",user_id)
      const response = await Axios.get("/api/photo-gallery/get/getphotocount/"+user_id);
      const photosData = response.data;
      // console.log("photosData",response)
      setPhotoCount(photosData);
    } catch (error) {
      console.error("Error while fetching photo:", error.message);
    }
  };
  const getBlogs = async (user_id) => {
    try {
      const response = await Axios.get("/api/blogs2/get/getblogcount/"+user_id);
      const blogData = response.data;
      // console.log("blogData",blogData)
      setBlogsCount(blogData);
    } catch (error) {
      console.error("Error while fetching blogs:", error.message);
    }
  };
  const getProducts = async (user_id) => {
  }
  const getUsers = async (user_id) => {
    try {
      const response = await Axios.get("/api/users/get/admin/count/"+user_id);
      const userData = response.data.dataCount;
      // console.log("userData",userData)
      setUserCount(userData);
    } catch (error) {
      console.error("Error while fetching blogs:", error.message);
    }
  };
  
  return (
    <section className="items-center m-10" id="dashboard" >
      {/* <div className={"w-full"}>
        <div className="block flex justify-center mt-48 mb-10 text-2xl font-extrabold text-center md:text-left text-lightBlue sm:text-2xl lg:text-3xl xxl:text-4xls lg:leading-tight">
         {props.title}
        </div>
      </div>
      <h1 className="text-lightBlue font-extrabold text-8xl flex justify-center">... Coming Soon ... </h1> */}
      <div  className={ "w-full mx-auto h-100 bg-white rounded"}>
        <div className="container mx-auto m-5">
          <div className="grid grid-cols-1  lg:grid-cols-3 gap-3 lg:gap-6">
            <div className="lg:col-span-2 grid grid-cols-1  lg:grid-cols-2 gap-3 lg:gap-6">
              {
                props.showUsers
                ?
                  <div className="justify-center  border border-gray-300 rounded-lg shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] bg-white">
                    <div className="grid w-full grid-cols-1 px-2 py-1 font-normal text-gray-800 border-b border-gray-300 text-m">
                      <div className="container flex">
                        <span className="flex w-1/2 font-extrabold">Users</span>
                        <span className="flex w-1/2 ">
                          <div className="w-full ">
                            <a target="_blank" href={props.userButtonURL}>
                              {" "}
                              <button className="float-right px-2 py-1 mr-2 text-xs text-white bg-blue-800 rounded hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                              {
                                props.userButton=== "Add"
                                ?
                                  <span>
                                    <i className="mr-1 text-blue-900 bg-white fa-solid fa-plus"></i>
                                    Add
                                  </span>
                                :
                                <span>Manage</span>
                              }
                              </button>
                            </a>
                          </div>
                        </span>
                      </div>
                    </div>
                    <div className="container flex my-auto">
                      <div className="flex justify-center w-full p-10 text-4xl font-bold ">
                        {userCount}
                      </div>
                    </div>
                  </div>
                :null
              }
              {
                props.showProducts
                ?
                  <div className="justify-center  border border-gray-300 rounded-lg shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] bg-white">
                    <div className="grid w-full grid-cols-1 px-2 py-1 font-normal text-gray-800 border-b border-gray-300 text-m">
                      <div className="container flex">
                        <span className="flex w-1/2 font-extrabold">Products</span>
                        <span className="flex w-1/2 ">
                          <div className="w-full ">
                            <a target="_blank" href={props.productsButtonURL}>
                              {" "}
                              <button className="float-right px-2 py-1 mr-2 text-xs text-white bg-blue-800 rounded hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                {
                                  props.productsButton==="Add"
                                  ?
                                    <span>
                                      <i className="mr-1 text-blue-900 bg-white fa-solid fa-plus"></i>
                                      Add
                                    </span>
                                  :
                                  <span>Manage</span>
                                }
                              </button>
                            </a>
                          </div>
                        </span>
                      </div>
                    </div>
                    <div className="container flex my-auto">
                      <div className="flex justify-center w-full p-10 text-4xl font-bold ">
                        {productCount? productCount:0}
                      </div>
                    </div>
                  </div>
                :null
              }
              {
                props.showPhotos
                ?
                  <div className="justify-center  border border-gray-300 rounded-lg shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]  bg-white">
                    <div className="grid w-full grid-cols-1 px-2 py-1 font-normal text-gray-800  text-md border-b border-gray-300">
                      <div className="container flex">
                        <span className="flex w-1/2 font-extrabold">Photos</span>
                        <span className="flex w-1/2 ">
                          <div className="w-full ">
                            <a target="_blank" href={props.photoButtonURL}>
                              {" "}
                              <button className="float-right px-2 py-1 mr-2 text-xs text-white bg-blue-800 rounded hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                {
                                  props.photoButton==="Add"
                                  ?
                                    <span>
                                      <i className="mr-1 text-blue-900 bg-white fa-solid fa-plus"></i>
                                      Add
                                    </span>
                                  :
                                  <span>Manage</span>
                                }
                              </button>
                            </a>
                          </div>
                        </span>
                      </div>
                    </div>
                    <div className="container flex divide-x">
                      {
                        photoCount?.data?.map((photo,index)=>{
                        //  { console.log("photo",photo)}
                          return(
                            <>
                            <div className="container w-1/2 divide-y  border-gray-300">
                              <div className="flex justify-center w-full py-2 text-xl font-normal">
                                {photo.type}
                              </div>
                              <div className="flex justify-center w-full p-10 text-4xl font-bold ">
                                {photo.count}
                              </div>
                            </div>
                            </>
                          )
                        })
                      }
                    </div>
                  </div>
                :null
              }
              {
                props.showBlogs
                ?
                  <div className="justify-center  border border-gray-300 rounded-lg shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]  bg-white">
                    <div className="grid w-full grid-cols-1 px-2 py-1 font-normal text-gray-800 text-md border-b border-gray-300">
                      <div className="container flex">
                        <span className="flex w-1/2 font-extrabold">Articles</span>
                        <span className="flex w-1/2 ">
                          <div className="w-full ">
                            <a target="_blank" href={props.ArticleButtonURL}>
                              {" "}
                              <button className="float-right px-2 py-1 mr-2 text-xs text-white bg-blue-800 rounded hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                {
                                   props.ArticleButton     ==="Create"
                                   ?
                                   <span>
                                      <i className="mr-1 text-blue-900 bg-white fa-solid fa-plus"></i>
                                      Create
                                   </span>
                                   :
                                   <span>Manage</span>
                                }
                                
                              </button>
                            </a>
                          </div>
                        </span>
                      </div>
                    </div>
                    <div className="container flex divide-x ">
                      {
                        blogCount?.data?.map((blogs,index)=>{
                        //  { console.log("blogs",blogs)}
                          return(
                            <>
                            <div className="container w-1/2 divide-y  border-gray-300">
                              <div className="flex justify-center w-full py-2 text-xl font-normal ">
                                {blogs.type}
                              </div>
                              <div className="flex justify-center w-full p-10 text-4xl font-bold ">
                                {blogs.count}
                              </div>
                            </div>
                            </>
                          )
                        })
                      }
                    </div>
                  </div>
                :null
              }
            </div>
            {
              props.showGraph
              ?
                <div className="justify-center  border border-gray-300 rounded-lg shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] bg-white">
                </div>
              :null
            }
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
