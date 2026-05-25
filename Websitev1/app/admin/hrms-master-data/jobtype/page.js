"use client";
import React from "react";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent";

const Page = () => {
    const inputObj = {
        fieldlabel: "Job Type",
        getListAPI: "/api/job-type-master/get",
    };

    return (
        <div className="flex flex-col gap-10">
            <OneFieldComponent
                fieldLabel="Job Type Master"
                inputObj={inputObj}
            />
        </div>
    );
};

export default Page;
