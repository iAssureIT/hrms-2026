"use client";
import React from "react";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent";

const Page = () => {
    
    const inputObj = {
        fieldlabel: "Designation",
        getListAPI: "/api/designation-master/get",
    };

    return (
        <div className="flex flex-col gap-10">
            <OneFieldComponent
                fieldLabel="Designation Master"
                inputObj={inputObj}
            />
        </div>
    );
};

export default Page;
