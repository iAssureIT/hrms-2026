"use client";
import React from "react";
import { Suspense } from "react";
import AssetAllocation from "@/widgets/assetManagement/AssetAllocation";

const Page = () => {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <AssetAllocation />
            </Suspense>
        </div>
    );
};

export default Page;
