"use client";

import { useState, useEffect } from "react";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent";

const Page = () => {
    const [checkReload, setCheckReload] = useState(0);

    return (
        <div>
            <OneFieldComponent
                fieldLabel="Asset Category"
                setCheckReload={setCheckReload}
            />
        </div>
    );
};

export default Page;
