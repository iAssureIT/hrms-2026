"use client";

import { useState, useEffect } from "react";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent";

const Page = () => {
  const [openModal, setOpenModal] = useState(true);

  return (
    <div className="p-4">
      <OneFieldComponent
        fieldLabel="Account-Header-Master"
        // editURL='/admin/master-data/department/'  //edit url by _id is remaining
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </div>
  );
};

export default Page;
