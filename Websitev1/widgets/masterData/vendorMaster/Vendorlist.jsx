"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import GenericTable from "./FilterTable";
import { Tooltip } from "flowbite-react";
import { MdOutlineAddBusiness } from "react-icons/md";
import { FaSpinner, FaFileUpload } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";

function VendorList() {
    const router = useRouter();

    /* ================= STATES ================= */

    const [vendors, setVendors] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [filterData, setFilterData] = useState([]);

    const [runCount, setRunCount] = useState(0);

    const [recsPerPage, setRecsPerPage] = useState(10);
    const [numOfPages, setNumOfPages] = useState([1]);
    const [pageNumber, setPageNumber] = useState(1);

    const [searchText, setSearchText] = useState("");
    const [totalRecs, setTotalRecs] = useState(0);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [vendorCategory, setVendorCategory] = useState("");
    const [vendorSubCategory, setVendorSubCategory] = useState("");
    const [centerName, setCenterName] = useState("");

    const [dropdownOptions, setDropdownOptions] = useState({
        vendorCategories: [],
        vendorSubCategories: [],
        centers: [],
    });
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);

    /* ================= TABLE HEADING ================= */

    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                const res = await axios.get("/api/vendor-master/dropdown-options");
                const data = res?.data?.data || {};

                setDropdownOptions({
                    vendorCategories: data.vendorCategories || [],
                    vendorSubCategories: data.vendorSubCategories || [],
                    centers: data.centers || [],
                });
            } catch (error) {
                console.error("Error fetching vendor dropdown options:", error);
            }
        };

        fetchDropdownOptions();
    }, []);

    // GET SUBCAT DEPEND ON CAT SELECTED
    const handleCategoryChange = async (categoryId) => {

        setVendorCategory(categoryId);
        setVendorSubCategory("");
        setPageNumber(1);

        if (!categoryId) {
            setFilteredSubCategories([]);
            return;
        }

        try {
            const res = await axios.get(`/api/vendor-master/subcategory/${categoryId}`);
            console.log("selected subcat res", res);

            setFilteredSubCategories(res?.data?.data || []);
        } catch (error) {
            console.error("Subcategory fetch error:", error);
        }
    };

    const tableHeading = {
        actions: "Actions",
        centerName: "Center Name",

        vendorID: "Vendor ID",

        vendorStatus: "Status",
        nameOfCompany: "Vendor Name",
        contactDetails: "Contact Details",
        // primaryContactPersonName: "Contact Person",
        // mobileNumber: "Mobile",
        // officialEmailId: "Email",
        gstin: "GSTIN",
        panNumber: "PAN",
        categoryInfo: "Vendor Category",
        // vendorCategory: "Vendor Category",
        // vendorSubCategory: "Vendor SubCategory",

        accountHolderName: "Account Holder",
        bankInfo: "Bank Details",
        // bankName: "Bank Name",
        branchName: "Branch",
        // accountNumber: "Account Number",
        // ifscCode: "IFSC",
        // accountType: "Account Type",

        addressLine1: "Address",
        city: "City",
        district: "District",
        state: "State",
        pinCode: "Pincode",
        country: "Country",



        tdsApplicable: "TDS",
        designation: "Designation"
    };

    const excelHeading = {
        vendorID: "Vendor ID",

        "vendorInfo.nameOfCompany": "Company Name",
        "vendorInfo.primaryContactPersonName": "Contact Person",
        "vendorInfo.mobileNumber": "Mobile",
        "vendorInfo.officialEmailId": "Email",
        "vendorInfo.gstin": "GSTIN",
        "vendorInfo.panNumber": "PAN",
        "vendorInfo.vendorCategory": "Vendor Category",
        "vendorInfo.vendorSubCategory": "Vendor SubCategory",

        "addressDetails.addressLine1": "Address",
        "addressDetails.city": "City",
        "addressDetails.district": "District",
        "addressDetails.state": "State",
        "addressDetails.pinCode": "Pincode",
        "addressDetails.country": "Country",

        "bankDetails.accountHolderName": "Account Holder",
        "bankDetails.bankName": "Bank Name",
        "bankDetails.branchName": "Branch",
        "bankDetails.accountNumber": "Account Number",
        "bankDetails.ifscCode": "IFSC",
        "bankDetails.accountType": "Account Type",

        vendorStatus: "Status",
    };

    const tableObjects = {
        apiURL: "/api/vendor-master",
        deleteMethod: "delete",
        getListMethod: "post",
        editURL: "/master-data/vendor-master/add-vendor/",
        downloadApply: true,
        searchApply: true,
        showButton: true,
        formText: "Vendor Form",
        titleMsg: "Vendor List",
    };

    /* ================= GET DATA ================= */

    const getData = async () => {
        const formValues = {
            page: pageNumber,
            limit: recsPerPage,
            search: searchText,
            vendorCategory,
            vendorSubCategory,
            centerName
        };
        console.log("get data form values ", formValues);

        setFilterData(formValues)
        try {
            setLoading(true);

            const response = await axios.post(
                "/api/vendor-master/post/list",
                formValues
            );

            console.log('response', response);


            if (response.data.success) {
                const vendors = response.data.tableData || [];

                setTotalRecs(response.data.total || 0);

                // IMPORTANT: set number of pages for GenericTable
                const pages = Array.from(
                    { length: response.data.totalPages || 1 },
                    (_, i) => i + 1
                );
                setNumOfPages(pages);

                console.log('vendors', vendors);



                // const formattedData = vendors.map((vendor, index) => ({
                //     _id: vendor._id,

                //     srNo: (pageNumber - 1) * recsPerPage + index + 1,

                //     vendorInfo: `
                //       <div class="text-left text-xs space-y-1">
                //         <p><strong>Company:</strong> ${vendor.vendorInfo?.nameOfCompany || ""}</p>
                //         <p><strong>Code:</strong> ${vendor.vendorCode || ""}</p>
                //         <p><strong>Designation:</strong> ${vendor.vendorInfo?.designation || ""}</p>
                //         <p><strong>Primary Contact:</strong> ${vendor.vendorInfo?.primaryContactPersonName || ""}</p>
                //         <p><strong>Mobile:</strong> ${vendor.vendorInfo?.mobileNumber || ""}</p>
                //         <p><strong>Email:</strong> ${vendor.vendorInfo?.officialEmailId || ""}</p>
                //       </div>
                //     `,

                //     businessInfo: `
                //       <div class="text-left text-xs space-y-1">
                //         <p><strong>Vendor Type:</strong> ${vendor.vendorInfo?.vendorType || ""}</p>
                //         <p><strong>Vendor Category:</strong> ${vendor.vendorInfo?.vendorCategory || ""}</p>
                //         <p><strong>GSTIN:</strong> ${vendor.vendorInfo?.gstin || ""}</p>
                //         <p><strong>PAN:</strong> ${vendor.vendorInfo?.panNumber || ""}</p>
                //         <p><strong>Center:</strong> ${vendor.vendorInfo?.centerName || ""}</p>
                //         <p><strong>TDS Applicable:</strong> ${vendor.vendorInfo?.tdsApplicable ? "Yes" : "No"}</p>
                //       </div>
                //     `,

                //     bank: `
                //       <div class="text-left text-xs space-y-1">
                //         <p><strong>Bank Name:</strong> ${vendor.bankDetails?.bankName || ""}</p>
                //         <p><strong>Branch:</strong> ${vendor.bankDetails?.branchName || ""}</p>
                //         <p><strong>Account Holder:</strong> ${vendor.bankDetails?.accountHolderName || ""}</p>
                //         <p><strong>Account Number:</strong> ${vendor.bankDetails?.accountNumber || ""}</p>
                //         <p><strong>Account Type:</strong> ${vendor.bankDetails?.accountType || ""}</p>
                //         <p><strong>IFSC:</strong> ${vendor.bankDetails?.ifscCode || ""}</p>
                //       </div>
                //     `,

                //     address: `
                //       <div class="text-left text-xs space-y-1">
                //         <p><strong>Address:</strong> ${vendor.addressDetails?.addressLine1 || ""}</p>
                //         <p><strong>City:</strong> ${vendor.addressDetails?.city || ""}</p>
                //         <p><strong>District:</strong> ${vendor.addressDetails?.district || ""}</p>
                //         <p><strong>State:</strong> ${vendor.addressDetails?.state || ""}</p>
                //         <p><strong>Country:</strong> ${vendor.addressDetails?.country || ""}</p>
                //         <p><strong>PIN Code:</strong> ${vendor.addressDetails?.pinCode || ""}</p>
                //       </div>
                //     `,

                //     vendorStatus: `
                //       <span class="inline-block px-3 py-1 rounded-full text-xs font-medium ${vendor.vendorStatus === "Active"
                //             ? "bg-green-100 text-green-700"
                //             : "bg-red-100 text-red-700"
                //         }">
                //         ${vendor.vendorStatus || ""}
                //       </span>
                //     `,
                // }));

                const formattedData = vendors.map((vendor, index) => ({
                    _id: vendor._id,

                    srNo: (pageNumber - 1) * recsPerPage + index + 1,
                    centerName: vendor.vendorInfo?.centerName || "",
                    vendorID: vendor.vendorID || "",

                    vendorStatus: `
                    <span class="px-2 py-1 rounded text-xs ${vendor.vendorStatus === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }">
                      ${vendor.vendorStatus || ""}
                    </span>
                  `,
                    nameOfCompany: vendor.vendorInfo?.nameOfCompany || "",
                    contactDetails: `
                                <div class="text-left">
                                    <p class="font-semibold text-sm">${vendor.vendorInfo?.primaryContactPersonName || "-"}</p>
                                    <p class="text-xs text-gray-700">${vendor.vendorInfo?.mobileNumber || "-"}</p>
                                    <p class="text-xs text-gray-700">${vendor.vendorInfo?.officialEmailId || "-"}</p>
                                </div>
                                `,
                    // primaryContactPersonName: vendor.vendorInfo?.primaryContactPersonName || "",
                    // mobileNumber: vendor.vendorInfo?.mobileNumber || "",
                    // officialEmailId: vendor.vendorInfo?.officialEmailId || "",
                    gstin: vendor.vendorInfo?.gstin || "",
                    panNumber: vendor.vendorInfo?.panNumber || "",
                    categoryInfo: `
                                    <div class="text-left">
                                        <p class="font-semibold text-sm">${vendor.vendorInfo?.vendorCategory || "-"}</p>
                                        <p class="text-xs text-gray-700">${vendor.vendorInfo?.vendorSubCategory || "-"}</p>
                                    </div>
                                    `,
                    // vendorCategory: vendor.vendorInfo?.vendorCategory || "",
                    // vendorSubCategory: vendor.vendorInfo?.vendorSubCategory || "",


                    accountHolderName: vendor.bankDetails?.accountHolderName || "",
                    bankInfo: `
                                <div class="text-left">
                                    <p class="text-sm font-medium">${vendor.bankDetails?.bankName || "-"}</p>
                                    <p class="text-xs text-gray-700">A/C: ${vendor.bankDetails?.accountNumber || "-"}</p>
                                    <p class="text-xs text-gray-700">Type: ${vendor.bankDetails?.accountType || "-"}</p>
                                    <p class="text-xs text-gray-700">IFSC: ${vendor.bankDetails?.ifscCode || "-"}</p>
                                </div>
                                `,
                    // bankName: vendor.bankDetails?.bankName || "",
                    branchName: vendor.bankDetails?.branchName || "",
                    // accountNumber: vendor.bankDetails?.accountNumber || "",
                    // ifscCode: vendor.bankDetails?.ifscCode || "",
                    // accountType: vendor.bankDetails?.accountType || "",

                    addressLine1: vendor.addressDetails?.addressLine1 || "",
                    city: vendor.addressDetails?.city || "",
                    district: vendor.addressDetails?.district || "",
                    state: vendor.addressDetails?.state || "",
                    pinCode: vendor.addressDetails?.pinCode || "",
                    country: vendor.addressDetails?.country || "",

                    tdsApplicable: vendor.vendorInfo?.tdsApplicable ? "Yes" : "No",
                    designation: vendor.vendorInfo?.designation || "",
                }));
                setTableData(formattedData);
            }
        } catch (error) {
            console.error("Error fetching vendors:", error);
        } finally {
            setLoading(false);
        }
    };

    /* ================= USE EFFECT ================= */

    useEffect(() => {
        getData();
    }, [pageNumber, recsPerPage, runCount, searchText, vendorCategory, vendorSubCategory, centerName]);


    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`/api/vendor-master/delete/${id}`);
            Swal.fire("Deleted!", "Vendor deleted successfully.", "success");
            setRunCount(runCount + 1);
        } catch (error) {
            Swal.fire("Error", "Delete failed", "error");
        }
    };


    console.log('setTableData', tableData);


    return (
        <section className="section p-6 md:p-10 bg-white min-h-screen border-t-[3px] border-[#3c8dbc]">
            <div className="max-w-[1440px] mx-auto">
                {/* Theme-aligned Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Vendor Management</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Vendor <span className="text-[#3c8dbc] font-black">Master</span>
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
                            <Tooltip content="Add New Vendor" placement="bottom" arrow={false} className="z-50 bg-[#3c8dbc] text-white text-sm px-2 py-1 rounded">
                                <BsPlusSquare
                                    className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                                    onClick={() => {
                                        const basePath = window.location.pathname.includes("admin") ? "/admin" : "/asset";
                                        router.push(
                                            `${basePath}/master-data/vendor-master/add-vendor`
                                        )
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                        Comprehensive directory of approved organizational vendors, including contact details, compliance status, and banking information.
                    </p>
                </div>

                <div className="bg-white pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Center Name */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 mb-1">
                                Center
                            </label>
                            <select
                                value={centerName}
                                onChange={(e) => {
                                    setCenterName(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="stdSelectField !pl-3"
                            >
                                <option value="">All</option>
                                {dropdownOptions.centers.map((center) => (
                                    <option key={center._id} value={center.centerName}>
                                        {center.centerName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Vendor Category */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 mb-1">
                                Vendor Category
                            </label>
                            <select
                                value={vendorCategory}
                                onChange={(e) => {
                                    // setVendorCategory(e.target.value);
                                    // setPageNumber(1);
                                    handleCategoryChange(e.target.value);
                                }}
                                className="stdSelectField !pl-3"
                            >
                                <option value="">All</option>
                                {dropdownOptions.vendorCategories.map((category, index) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Vendor Type */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 mb-1">
                                Vendor Sub Categories
                            </label>
                            <select
                                value={vendorSubCategory}
                                onChange={(e) => {
                                    setVendorSubCategory(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="stdSelectField !pl-3"
                            >
                                <option value="">All</option>
                                {filteredSubCategories.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <GenericTable
                        tableHeading={tableHeading}
                        excelHeading={excelHeading}
                        tableObjects={tableObjects}
                        tableData={tableData}
                        setTableData={setTableData}
                        filterData={filterData}
                        recsPerPage={recsPerPage}
                        setRecsPerPage={setRecsPerPage}
                        pageNumber={pageNumber}
                        setPageNumber={setPageNumber}
                        numOfPages={numOfPages}
                        setNumOfPages={setNumOfPages}
                        totalRecs={totalRecs}
                        setTotalRecs={setTotalRecs}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        runCount={runCount}
                        setRunCount={setRunCount}
                        getData={getData}
                        loading={loading}
                    />
                </div>
            </div>
        </section>
    );
}

export default VendorList;
