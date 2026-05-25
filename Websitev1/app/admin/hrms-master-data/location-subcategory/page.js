"use client";
import React from "react";
import TwoFieldComponent from "@/widgets/masterData/twoFieldComponent/TwoFieldComponent";

const Page = () => {
    const oneFieldInputObj = {
        fieldlabel: "Center",
        getListAPI: "/api/centers/list",
    };

    const twoFieldInputObj = {
        fieldlabel: "Sub-Location",
        insertAPI: "/api/location-subcategory/post",
        getListAPI: "/api/location-subcategory/get",
        editAPI: "/api/location-subcategory/put",
        deleteAPI: "/api/location-subcategory/delete",
    };

    return (
        <div>
            <TwoFieldComponent
                oneField={oneFieldInputObj}
                oneFieldLable="Center"
                twoFieldLable="Sub-Location"
                twoField={twoFieldInputObj}
                showAddButton={false}
            />
        </div>
    );
};

export default Page;
