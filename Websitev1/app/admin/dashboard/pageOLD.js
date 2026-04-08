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
        userButtonURL     ="/admin/user-management"
        productsButton    ="Add"
        productsButtonURL ="/admin/product-management"
        photoButton       ="Add"
        photoButtonURL    ="/admin/photo/add-new-photo"
        ArticleButton     ="Create"
        ArticleButtonURL  ="/admin/news/create-new-article"

      />
    </div>
  );
};

export default Dashboardpage;