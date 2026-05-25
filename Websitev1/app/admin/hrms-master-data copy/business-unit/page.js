"use client";
import React from "react";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent";

const Page = () => {
    const inputObj = {
        fieldlabel: "Business Unit",
        getListAPI: "/api/business-unit-master/get",
    };

    return (
        <div className="flex flex-col gap-10">
            <OneFieldComponent
                fieldLabel="Business Unit Master"
                inputObj={inputObj}
            />
        </div>
    );
};

export default Page;
