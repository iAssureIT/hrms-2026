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
    const oneFieldInputObj = createInputObj("Asset Category");
    oneFieldInputObj.showImg = false;
    const fieldlabel = "Asset Subcategory";
    const lowercaseFieldlabel = "asset-master-subcategory";
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
                oneFieldLable="Asset Category"
                twoFieldLable="Asset Subcategory"
                twoField={twoFieldInputObj}
                modalComponent={modalComponent}
                showAddButton={false}
            />
        </div>
    );
};

export default Page;