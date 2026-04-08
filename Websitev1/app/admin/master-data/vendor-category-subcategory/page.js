"use client";
import React, { useState } from "react";
import TwoFieldComponent from "@/widgets/masterData/twoFieldComponent/TwoFieldComponent";

const createInputObj = (label) => {
    const lowercaseLabel = label.toLowerCase().replace(/\s+/g, '-');
    return {
        fieldlabel: label,
        insertAPI: "/api/" + lowercaseLabel + "/post",
        getListAPI: "/api/" + lowercaseLabel + "/get",
        editAPI: "/api/" + lowercaseLabel + "/put",
        deleteAPI: "/api/" + lowercaseLabel + "/delete",
        showImg: true,
    };
};

const Page = ({ modalComponent }) => {
    const oneFieldInputObj = createInputObj("Vendor Category");
    oneFieldInputObj.showImg = false;
    const fieldlabel = "Vendor Subcategory";
    const lowercaseFieldlabel = "vendor-master-subcategory";
    const twoFieldInputObj = {
        fieldlabel: fieldlabel,
        insertAPI: "/api/" + lowercaseFieldlabel + "/post",
        editAPI: "/api/" + lowercaseFieldlabel + "/put",
        deleteAPI: "/api/" + lowercaseFieldlabel + "/delete",
        getListAPI: "/api/" + lowercaseFieldlabel + "/get",
        editDdListAPI: "/api/" + lowercaseFieldlabel + "/patch",
        showImg: false,
    };

    return (
        <div>
            <TwoFieldComponent
                oneField={oneFieldInputObj}
                oneFieldLable="Vendor Category"
                twoFieldLable="Vendor Subcategory"
                twoField={twoFieldInputObj}
                modalComponent={modalComponent}
                showAddButton={true}
            />
        </div>
    );
};

export default Page;