"use client";
import React from "react";
import Axios from "axios";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [items1, setItems1] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [location, setLocation] = useState([]);
  const [user_id, setuser_id] = useState([]);
  const [BlogListCount, setBlogListCount] = useState([]);

  const getList1 = async () => {
    try {
      const response = await Axios.get("/api/location-info/getAllLocations");

      // Assuming locationList.data.data is the value you want to return
      const locationData = response.data;

      setItems(locationData);

      // You can also log the data if needed
      // console.log("list => ", locationData);

      return locationData;
    } catch (error) {
      // Handle errors here
      console.error("Error while fetching location:", error.message);
      throw error; // Rethrow the error to be handled in the calling code if necessary
    }
  };

 

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      console.log("userDetailsParse",userDetailsParse)
      setuser_id(userDetailsParse.user_id ) 
      
    }
    Axios
      .get("/api/blogs2/get/list/by-user_id/"+user_id)
      .then(res => {
        console.log("res -> ", res.data.data.length);
        var Data = res.data;
        if (Data) {
          setBlogListCount(res.data.data.length);
        } else {

        }
      })
      .catch(error=>{
        console.error("Error while fetching data:", error.message);
      })
    const getListBlog = async () => {
      try {
        const response = await Axios.get("/api/blogs2/blogslist");
  
        // Assuming locationList.data.data is the value you want to return
        const blogData = response.data.data;
        console.log("blogData",blogData)
        setItems1(blogData);
  
        // You can also log the data if needed
        // console.log("list => ", blogData);
  
        return blogData;
      } catch (error) {
        // Handle errors here
        console.error("Error while fetching location:", error.message);
        throw error; // Rethrow the error to be handled in the calling code if necessary
      }
    };
    // setItems(props.inputData.cardsArray);
    // (async () => {
    //   try {
    //     const locationData1 = await getList1();
    //     const blogData1 = await getListBlog();
    //     setLocation(locationData1);
    //     setBlogs(blogData1);
    //   } catch (err) {
    //     console.log("Error occurred when fetching location:", err.message);
    //   }
    // })();
  }, []);

  return (
    <div className="h-auto px-4 py-5 pb-24 mx-auto bg-white shadow-xl xs:w-80 sm:w-80 xl:w-full lg:w-full md:w-full max-w-8xl sm:px-6 lg:px-2 shadow-black-500/50">
      <div className="w-full h-auto pb-5 text-xl font-bold text-gray-800 border-b border-gray-500">
        <span className="mx-5">User Dashboard</span>
      </div>

      <div className="container mx-auto m-5">
        <div className="grid grid-cols-1  lg:grid-cols-3 gap-3 lg:gap-6">
          {/* <div className=" justify-center  border border-gray-300 rounded-l  bg-white">
            <div className="grid w-full grid-cols-1 px-2 py-1 font-normal text-gray-800 border-b border-gray-300 text-m">
              <div className="container flex">
                <span className="flex w-1/2 ">Locations</span>
                <span className="flex w-1/2 ">
                  <div className="w-full ">
                    <a target="_blank" href="/admin/add-new-location">
                      {" "}
                      <button className="float-right px-2 py-1 mr-2 text-xs text-white rounded bg-lightBlue hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                        <i className="mr-1 text-blue-900 bg-white fa-solid fa-plus"></i>
                        Add
                      </button>
                    </a>
                  </div>
                </span>
              </div>
            </div>
            <div className="container flex">
            
            </div>
            <div className="container flex">
              <div className="flex justify-center w-full p-10 text-4xl font-bold ">
                {items?.length ? items?.length : "0"}
              </div>
              
            </div>
          </div> */}
          <div className=" justify-center  border border-gray-300 rounded-l  bg-white">
            <div className="grid w-full grid-cols-1 px-2 py-1 font-normal text-gray-800 border-b border-gray-300 text-m">
              <div className="container flex">
                <span className="flex w-1/2 ">Blogs</span>
                <span className="flex w-1/2 ">
                  <div className="w-full ">
                    <a target="_blank" href="/admin/blogs/create-new-blog">
                      {" "}
                      <button className="float-right px-2 py-1 mr-2 text-xs text-white bg-blue-800 rounded hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                        <i className="mr-1 text-blue-900 bg-white fa-solid fa-plus"></i>
                        Add
                      </button>
                    </a>
                  </div>
                </span>
              </div>
              
            </div>
            <div className="container flex">
              {/* <div className="flex justify-center w-1/2 py-2 text-xl font-normal border-r border-gray-300">
                Given
              </div>
              <div className="flex justify-center w-1/2 py-2 text-xl font-normal">
                Received
              </div> */}
            </div>
            <div className="container flex">
              <div className="flex justify-center w-full p-10 text-4xl font-bold ">
                {BlogListCount}
              </div>
              {/* <div className="flex justify-center w-1/2 h-24 p-2 text-4xl font-bold ">
                6
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
