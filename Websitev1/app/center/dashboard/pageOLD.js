import React from "react";
import Dashboard from "@/widgets/dashboardManagement/dashboard";

const Dashboardpage = () => {
  return (
    <div>
      <Dashboard  
        title         ="Dashboard" 
        showBlogs     ={true}
        showProducts  ={true}
        showUsers     ={true}
        showPhotos    ={true}
        showGraph     ={true}
        userButton        ="Manage"
        userButtonURL     ="/center/user-management"
        productsButton    ="Add"
        productsButtonURL ="/center/product-management"
        photoButton       ="Add"
        photoButtonURL    ="/center/photo/add-new-photo"
        ArticleButton     ="Create"
        ArticleButtonURL  ="/center/news/create-new-article"

      />
    </div>
  );
};

export default Dashboardpage;