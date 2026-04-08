"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaFileDownload,
} from "react-icons/fa";
function PlantationReport() {
  const migrateImages = async () => {
    try {
      const response = await axios.post("/api/migrateImages/get");
      
      const data = await response.json();
      console.log("Migration response:", data);
    } catch (error) {
      console.error("Migration failed:", error);
    }
  };
  
  const migratewrdImages = async () => {
    try {
      const response = await axios.post("/api/migrateImages/getwrd");
      
      const data = await response.json();
      console.log("migratewrdImages response:", data);
    } catch (error) {
      console.error("migratewrdImages failed:", error);
    }
  };
  
  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading h-auto content-center">Migration from Old to New Bucket</h1>
          </div>
        </div>
        <div className="mt-7 ml-4">
          <FaFileDownload
            onClick={migrateImages}
            size={"2rem"}
            className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
          />
          Migrate Plantation images
        </div>
        <div className="mt-7 ml-4">
          <FaFileDownload
          onClick={migratewrdImages}
          
          size={"2rem"}
          className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
          />
          Migrate WRD images
          </div> 
    </div>
    </section>
  );
}

export default PlantationReport;
