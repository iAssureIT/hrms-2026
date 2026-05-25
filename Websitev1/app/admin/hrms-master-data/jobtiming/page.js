"use client";
import React from "react";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent";

const Page = () => {
    
    const inputObj = {
        fieldlabel: "Job Timing",
        getListAPI: "/api/job-timing-master/get",
    };

    return (
        <div className="flex flex-col gap-10">
            <OneFieldComponent
                fieldLabel="Job Timing Master"
                inputObj={inputObj}
            />
        </div>
    );
};

export default Page;
