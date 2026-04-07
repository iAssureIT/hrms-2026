"use client";
import React, { useState } from "react";
import FourFieldComponent from "@/widgets/masterData/fourFieldComponent/FourFieldComponent.jsx";

const createInputObj = (label) => {
  const lowercaseLabel = label.toLowerCase();

  return {
    fieldLabel: label,
    insertAPI: "/api/" + lowercaseLabel + "/post",
    getListAPI: "/api/" + lowercaseLabel + "/get",
    editAPI: "/api/" + lowercaseLabel + "/put",
    deleteAPI: "/api/" + lowercaseLabel + "/delete",
    showImg: false,
    goodRecordsHeading: { fieldValue: label },
    failedtableHeading: {
      fieldValue: label,
      failedRemark: "Failed Data Remark",
    },
    fileDetailUrl: "/api/" + lowercaseLabel + "/get/filedetails/",
    fileurl:
      "https://test-digitalexellence.s3.amazonaws.com/" +
      lowercaseLabel +
      "-bulk-upload.xlsx",
  };
};

const createInputObj1 = (label) => {
  // const lowercaseLabel = label.toLowerCase();
  const lowercaseLabel = "subactivity-mapping";
  return {
    fieldLabel: label,
    insertAPI: "/api/" + lowercaseLabel + "/post",
    getListAPI: "/api/" + lowercaseLabel + "/post/list",
    editAPI: "/api/" + lowercaseLabel + "/put",
    deleteAPI: "/api/" + lowercaseLabel + "/delete",
    showImg: false,
  };
};

const tableHeading = {
  actions: "Actions",
  program: "Program",
  project: "Project",
  activity: "Activity",
  subactivity: "Subactivity",
};
const tableObjects = {
  tableName: "Subactivity List",
  deleteMethod: "delete",
  getListMethod: "post",
  apiURL: "/api/subactivity-mapping",
  editURL: "/master-data/program-project-activity-subactivity/",
  searchApply: true,
  downloadApply: true,
  showButton: false,
  titleMsg: "Subactivity Details",
};
const Page = () => {
  const field1InputObj = createInputObj("Programs");
  const field2InputObj = createInputObj("Projects");
  const field3InputObj = createInputObj("Activity");
  const field4InputObj = createInputObj1("SubActivity");

  return (
    <div>
      <FourFieldComponent
        field1={field1InputObj}
        field2={field2InputObj}
        field3={field3InputObj}
        field4={field4InputObj}
        tableObjects={tableObjects}
        tableHeading={tableHeading}
      />
    </div>
  );
};

export default Page;
