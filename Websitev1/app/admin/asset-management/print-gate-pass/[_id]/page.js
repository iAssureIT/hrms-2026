"use client";

import React from "react";
import PrintGatePass from "@/widgets/assetManagement/PrintGatePass";
import { useParams } from "next/navigation";

const PrintGatePassPage = () => {
    const params = useParams();
    return <PrintGatePass passId={params._id} />;
};

export default PrintGatePassPage;
