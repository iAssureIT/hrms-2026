"use client";
import React from "react";
import TwoFieldComponent from "@/widgets/masterData/twoFieldComponent/TwoFieldComponent";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent";

const Page = () => {
    const departmentInputObj = {
        fieldlabel: "Department",
        getListAPI: "/api/department-master/get",
        apiPath: "department-master", // Used by OneFieldComponent in modal
    };

    const subDepartmentInputObj = {
        fieldlabel: "Sub-Department",
        insertAPI: "/api/subdepartment-master/post",
        getListAPI: "/api/subdepartment-master/get",
        editAPI: "/api/subdepartment-master/put",
        deleteAPI: "/api/subdepartment-master/delete",
    };

    return (
        <div className="flex flex-col gap-10">
            <TwoFieldComponent
                oneField={departmentInputObj}
                oneFieldLable="Department"
                twoFieldLable="Sub-Department"
                twoField={subDepartmentInputObj}
                showAddButton={true}
            />
        </div>
    );
};

export default Page;
