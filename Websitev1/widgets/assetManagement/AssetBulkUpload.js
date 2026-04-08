"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "./BulkUpload_Asset";
import axios from "axios";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { FaWpforms, FaSpinner, FaFileUpload, FaListUl, FaUserPlus } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import { useRouter, usePathname } from "next/navigation";
import ls from "localstorage-slim";
import * as XLSX from "xlsx";

const AssetBulkUpload = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [loggedInRole, setLoggedInRole] = useState("admin");
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);

    useEffect(() => {
        const fetchUser = () => {
            const user = ls.get("userDetails", { decrypt: true }) || ls.get("userDetails");
            if (user) setUserDetails(user);
        };
        fetchUser();

        if (pathname?.includes("admin")) {
            setLoggedInRole("admin");
        } else if (pathname?.includes("center")) {
            setLoggedInRole("center");
        } else if (pathname?.includes("asset")) {
            setLoggedInRole("asset");
        }
    }, [pathname]);

    const [fileDetailUrl, setFileDetailUrl] = useState(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/get/filedetails/`);
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
        quantity: "Quantity",
        centerName: "Center",
        sublocationName: "Sub-Location",
        departmentName: "Department",
        subdepartmentName: "Sub-Department",
        vendor: "Vendor",
        cost: "Cost",
        purchaseDate: "Purchase Date",
        invoiceNumber: "Invoice No",
        warrantyDate: "Warranty Date",
        description: "Description",
    });

    const [failedtableHeading, setFailedtableHeading] = useState({
        assetID: "Asset ID",
        assetName: "Asset Name",
        brand: "Brand",
        model: "Model",
        serialNo: "Serial No",
        assetCategory: "Category",
        assetSubCategory: "SubCategory",
        quantity: "Quantity",
        centerName: "Center",
        sublocationName: "Sub-Location",
        departmentName: "Department",
        subdepartmentName: "Sub-Department",
        vendor: "Vendor",
        cost: "Cost",
        purchaseDate: "Purchase Date",
        invoiceNumber: "Invoice No",
        warrantyDate: "Warranty Date",
        description: "Description",
        failedRemark: "Failed Data Remark",
    });

    const [tableObjects, setTableObjects] = useState({
        deleteMethod: "delete",
        apiLink: "/api/asset-management-new",
        downloadApply: true,
        paginationApply: false,
        searchApply: false,
    });

    const [fileDetails, setFileDetails] = useState();
    const [goodDataCount, setGoodDataCount] = useState(0);
    const [failedRecordsCount, setFailedRecordsCount] = useState(0);

    const uploadedData = (data) => {
        getData();
    };

    const getData = () => {
        axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/post/list`)
            .then((response) => {
                // If you want to use tableData directly, set it here
                // We'll rely on the bulk upload component structure for now
            })
            .catch((error) => console.error(error));
    };

    const getFileDetails = (fileName) => {
        axios
            .get(fileDetailUrl + encodeURIComponent(fileName))
            .then((response) => {
                if (response.data) {
                    setFileDetails(response.data);
                    setGoodDataCount(response.data.goodrecords ? response.data.goodrecords.length : 0);
                    setFailedRecordsCount(response.data.failedRecords ? response.data.failedRecords.length : 0);

                    const safeString = (val) => (val !== undefined && val !== null ? String(val) : "-");
                    
                    const tableData = response.data.goodrecords.map((item, idx) => {
                        try {
                            if (!item) return null;
                            const obj = {};
                            
                            // Handling both Object and Array (Excel header:1) formats
                            const get = (key, arrayIdx) => {
                                if (Array.isArray(item)) return safeString(item[arrayIdx]);
                                return safeString(item[key]);
                            };

                            const getNested = (path, arrayIdx) => {
                                if (Array.isArray(item)) return safeString(item[arrayIdx]);
                                try {
                                    const parts = path.split('.');
                                    let current = item;
                                    for (const part of parts) {
                                        if (current && typeof current === 'object') {
                                            current = current[part];
                                        } else {
                                            return "-";
                                        }
                                    }
                                    return safeString(current);
                                } catch(e) { return "-"; }
                            };

                            obj.assetID = get("assetID", 0);
                            obj.assetName = get("assetName", 1);
                            obj.brand = get("brand", 2);
                            obj.model = get("model", 3);
                            obj.serialNo = Array.isArray(item) ? get("", 4) : safeString(item.serialNo || item.serialNumber);
                            obj.assetCategory = Array.isArray(item) ? get("", 5) : safeString(item.assetCategory || item.category);
                            obj.assetSubCategory = Array.isArray(item) ? get("", 6) : safeString(item.assetSubCategory || item.subCategory);
                            obj.quantity = "1";
                            obj.centerName = getNested("currentAllocation.center.name", 8);
                            obj.sublocationName = getNested("currentAllocation.subLocation.name", 9);
                            obj.departmentName = getNested("currentAllocation.department.name", 10);
                            obj.subdepartmentName = getNested("currentAllocation.subDepartment.name", 11);
                            obj.vendor = Array.isArray(item) ? get("", 12) : safeString(item.vendor?.name || item.vendorName);
                            obj.cost = Array.isArray(item) ? get("", 13) : safeString(item.purchaseCost || item.cost);
                            
                            let rawDate = Array.isArray(item) ? item[14] : item.purchaseDate;
                            obj.purchaseDate = rawDate ? new Date(rawDate).toLocaleDateString('en-IN') : "-";
                            
                            obj.invoiceNumber = get("invoiceNumber", 15);
                            
                            let rawWarranty = Array.isArray(item) ? item[16] : item.warrantyDate;
                            obj.warrantyDate = rawWarranty ? new Date(rawWarranty).toLocaleDateString('en-IN') : "-";
                            
                            obj.description = get("description", 17);
                            obj._id = item._id || (Array.isArray(item) ? idx : "id_"+idx);
                            
                            return obj;
                        } catch (err) {
                            console.error("Mapping error for good record:", err, item);
                            return null;
                        }
                    }).filter(x => x !== null);

                    const getVal = (item, possibleKeys, arrayIdx) => {
                        if (Array.isArray(item)) return item[arrayIdx] !== undefined ? item[arrayIdx] : "-";
                        for (let k of possibleKeys) {
                            if (item && item[k] !== undefined && item[k] !== null) return item[k];
                        }
                        return "-";
                    };

                    const failedRecords = (response.data.failedRecords || []).map((item, idx) => {
                        try {
                            const obj = {};
                            obj.assetID = safeString(getVal(item, ["Asset ID", "assetID", "AssetID"], 0));
                            obj.assetName = safeString(getVal(item, ["Asset Name", "assetName"], 1));
                            obj.brand = safeString(getVal(item, ["Brand", "brand"], 2));
                            obj.model = safeString(getVal(item, ["Model", "model"], 3));
                            obj.serialNo = safeString(getVal(item, ["Serial No", "Serial Number", "serialNo", "serialNumber"], 4));
                            obj.assetCategory = safeString(getVal(item, ["Category", "assetCategory", "category"], 5));
                            obj.assetSubCategory = safeString(getVal(item, ["SubCategory", "assetSubCategory", "subCategory"], 6));
                            obj.quantity = safeString(getVal(item, ["Quantity", "quantity", "qty"], 7));
                            obj.centerName = safeString(getVal(item, ["Center", "centerName", "center"], 8));
                            obj.sublocationName = safeString(getVal(item, ["Sub-Location", "sublocationName", "subLocation"], 9));
                            obj.departmentName = safeString(getVal(item, ["Department", "departmentName", "department"], 10));
                            obj.subdepartmentName = safeString(getVal(item, ["Sub-Department", "subdepartmentName", "subDepartment"], 11));
                            obj.vendor = safeString(getVal(item, ["Vendor", "vendor", "vendorName"], 12));
                            obj.cost = safeString(getVal(item, ["Cost", "purchaseCost", "cost"], 13));
                            obj.purchaseDate = safeString(getVal(item, ["Purchase Date", "purchaseDate"], 14));
                            obj.invoiceNumber = safeString(getVal(item, ["Invoice No", "invoiceNumber", "Invoice Number"], 15));
                            obj.warrantyDate = safeString(getVal(item, ["Warranty Date", "warrantyDate"], 16));
                            obj.description = safeString(getVal(item, ["Description", "description"], 17));
                            obj.failedRemark = safeString(getVal(item, ["failedRemark", "Failed Data Remark"], Array.isArray(item) ? item.length - 1 : -1));
                            return obj;
                        } catch(e) {
                            console.error("Mapping error for failed record:", e);
                            return null;
                        }
                    }).filter(x => x !== null);

                    setFailedRecordsTable(failedRecords);
                    setGoodRecordsTable(tableData);
                }
            })
            .catch((error) => {
                console.error("Error fetching file details:", error);
            });
    };

    const downloadTemplate = (e) => {
        e.preventDefault();
        const templateData = [
            [
                "Asset ID",
                "Asset Name",
                "Brand",
                "Model",
                "Serial No",
                "Category",
                "SubCategory",
                "Quantity",
                "Center",
                "Sub-Location",
                "Department",
                "Sub-Department",
                "Vendor",
                "Cost",
                "Purchase Date",
                "Invoice No",
                "Warranty Date",
                "Description"
            ],
            [
                "",
                "MacBook Pro 16",
                "Apple",
                "M3 Max / 32GB / 1TB",
                "SN123456789",
                "IT Assets",
                "Laptops",
                "1",
                "Mulshi",
                "Ground Floor",
                "IT",
                "Engineering",
                "Reliable Digital Solutions",
                "250000",
                "01/04/2024",
                "INV-LUP-001",
                "31/03/2027",
                "High-performance laptop for development team"
            ],
            [
                "AST-MUL-002",
                "Office Chair",
                "Godrej",
                "Ergo Comfort",
                "SN987654321",
                "Furniture",
                "Chairs",
                "5",
                "Mulshi",
                "First Floor",
                "HR",
                "Recruitment",
                "Godrej Interio",
                "15000",
                "15/03/2024",
                "INV-LUP-002",
                "14/03/2025",
                "Ergonomic chairs for new joiners"
            ]
        ];
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, "Asset-Bulk-Upload-Template.xlsx");
    };

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md bg-white">
                <div className="uppercase text-xl font-semibold border-b-2 border-gray-300 flex justify-between px-10">
                    <div className="flex items-center gap-3 py-5">
                        <h1 className="text-2xl text-gray-900 tracking-tight">Asset Bulk Upload</h1>
                    </div>
                    <div className="flex gap-3 my-5 items-center">
                        <Tooltip
                            content="Asset List"
                            placement="bottom"
                            className="bg-green"
                            arrow={false}
                        >
                            <div
                                onClick={() =>
                                    router.push(`/${loggedInRole}/management`)
                                }
                                className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[30px] w-[30px] shrink-0"
                            >
                                <CiViewList size={20} />
                            </div>
                        </Tooltip>
                        <Tooltip
                            content="Add Asset"
                            placement="bottom"
                            className="bg-green"
                            arrow={false}
                        >
                            <div
                                onClick={() =>
                                    router.push(
                                        `/${loggedInRole}/management/asset-submission`,
                                    )
                                }
                                className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[30px] w-[30px] shrink-0"
                            >
                                <BsPlusSquare size={18} />
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <div className="p-5">
                    <BulkUpload
                        url={process.env.NEXT_PUBLIC_BASE_URL + "/api/asset-management-new/bulkUpload"}
                        fileurl=""
                        downloadTemplate={downloadTemplate}
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
