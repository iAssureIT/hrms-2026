"use client";

import { useState, useEffect } from "react";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent";

const Page = () => {
  const [openModal, setOpenModal] = useState(true);

  let goodRecordsHeading = {
    fieldValue: "Field Value"
  }

  return (
    <div className="p-4">
      <OneFieldComponent
        fieldLabel="Account-Head-Master"
        openModal={openModal}
        setOpenModal={setOpenModal}
        fileDetailUrl={'/api/account-head-master/get/filedetails/'}
        goodRecordsHeading={goodRecordsHeading}
      />
    </div>
  );
};

export default Page;
