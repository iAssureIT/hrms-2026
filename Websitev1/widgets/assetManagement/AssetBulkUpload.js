"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "@/widgets/BulkUpload/BulkUpload";
import axios from "axios";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { FaWpforms } from "react-icons/fa";
import { useRouter } from "next/navigation";

const AssetBulkUpload = () => {
    const router = useRouter();
    const [fileDetailUrl, setFileDetailUrl] = useState(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management/get/filedetails/`);
    const [goodRecordsTable, setGoodRecordsTable] = useState([]);
    const [failedRecordsTable, setFailedRecordsTable] = useState([]);

    const [goodRecordsHeading, setGoodRecordsHeading] = useState({
        assetID: "Asset ID",
        assetName: "Asset Name",
        brand: "Brand",
        model: "Model",
        serialNo: "Serial No",
        assetCategory: "Category",
        assetSubCategory: "SubCategory",
        centerName: "Center",
        sublocationName: "Sub-Location",
        departmentName: "Department",
        subdepartmentName: "Sub-Department",
        vendor: "Vendor",
        cost: "Cost",
        purchaseDate: "Purchase Date",
        invoiceNumber: "Invoice No",
    });

    const [failedtableHeading, setFailedtableHeading] = useState({
        assetName: "Asset Name",
        brand: "Brand",
        model: "Model",
        serialNo: "Serial No",
        assetCategory: "Category",
        assetSubCategory: "SubCategory",
        centerName: "Center",
        sublocationName: "Sub-Location",
        departmentName: "Department",
        subdepartmentName: "Sub-Department",
        vendor: "Vendor",
        cost: "Cost",
        purchaseDate: "Purchase Date",
        invoiceNumber: "Invoice No",
        failedRemark: "Failed Data Remark",
    });

    const [tableObjects, setTableObjects] = useState({
        deleteMethod: "delete",
        apiLink: "/api/asset-management",
        downloadApply: true,
        paginationApply: false,
        searchApply: false,
    });

    const [fileDetails, setFileDetails] = useState();
    const [goodDataCount, setGoodDataCount] = useState(0);
    const [failedRecordsCount, setFailedRecordsCount] = useState(0);

    const uploadedData = (data) => {
        // Handle post-upload logic if needed
    };

    const getData = () => {
        // Implementation for general data refresh if needed
    };

    const getFileDetails = (fileName) => {
        axios
            .get(fileDetailUrl + fileName)
            .then((response) => {
                if (response.data) {
                    setFileDetails(response.data);
                    setGoodDataCount(response.data.goodrecords.length);
                    setFailedRecordsCount(response.data.failedRecords.length);

                    const tableData = response.data.goodrecords.map((item) => ({
                        assetID: item.assetID,
                        assetName: item.assetName,
                        brand: item.brand,
                        model: item.model,
                        serialNo: item.serialNo,
                        assetCategory: item.dropdownvalue,
                        assetSubCategory: item.inputValue,
                        centerName: item.centerName,
                        sublocationName: item.sublocationName,
                        departmentName: item.departmentName,
                        subdepartmentName: item.subdepartmentName,
                        vendor: item.vendor,
                        cost: item.cost,
                        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('en-IN') : "-",
                        invoiceNumber: item.invoiceNumber,
                    }));

                    const failedRecords = response.data.failedRecords.map((item) => ({
                        assetName: item.assetName,
                        brand: item.brand,
                        model: item.model,
                        serialNo: item.serialNo,
                        assetCategory: item.assetCategory,
                        assetSubCategory: item.assetSubCategory,
                        centerName: item.centerName,
                        sublocationName: item.sublocationName,
                        departmentName: item.departmentName,
                        subdepartmentName: item.subdepartmentName,
                        vendor: item.vendor,
                        cost: item.cost,
                        purchaseDate: item.purchaseDate,
                        invoiceNumber: item.invoiceNumber,
                        failedRemark: item.failedRemark,
                    }));

                    setFailedRecordsTable(failedRecords);
                    setGoodRecordsTable(tableData);
                }
            })
            .catch((error) => {
                console.error("Error fetching file details:", error);
            });
    };

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md">
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300 flex justify-between">
                        <h1 className="heading">Asset Bulk Upload</h1>
                        <div className="flex gap-3 my-6 me-10">
                            <Tooltip content="Add Asset" placement="bottom">
                                <FaWpforms
                                    className="icon hover:text-gray-800 border border-gray-400 p-0.5 hover:border-gray-700 rounded text-[30px]"
                                    onClick={() => {
                                        router.push("/admin/asset-management/asset-submission");
                                    }}
                                />
                            </Tooltip>
                            <Tooltip content="Asset List" placement="bottom">
                                <CiViewList
                                    className="icon hover:text-gray-800 border border-gray-400 p-0.5 hover:border-gray-700 rounded text-[30px]"
                                    onClick={() => {
                                        router.push("/admin/asset-management");
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <div className="">
                    <BulkUpload
                        url={process.env.NEXT_PUBLIC_BASE_URL + "/api/asset-management/bulkUpload"}
                        data={[]}
                        uploadedData={uploadedData}
                        getData={getData}
                        getFileDetails={getFileDetails}
                        fileDetails={fileDetails}
                        tableObjects={tableObjects}
                        goodRecordsHeading={goodRecordsHeading}
                        failedtableHeading={failedtableHeading}
                        failedRecordsTable={failedRecordsTable}
                        failedRecordsCount={failedRecordsCount}
                        goodRecordsTable={goodRecordsTable}
                        goodDataCount={goodDataCount}
                    />
                </div>
            </div>
        </section>
    );
};

export default AssetBulkUpload;
