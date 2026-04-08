"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { MdLayers, MdLocationOn, MdBusiness, MdAssignmentTurnedIn, MdInfoOutline, MdPersonOutline, MdPersonAddAlt1, MdOutlineFactCheck } from "react-icons/md";
import { FaSearch, FaEnvelope, FaPhoneAlt, FaUserTie, FaFileUpload, FaListUl, FaUserPlus } from "react-icons/fa";
import { BsPersonVcard, BsPlusSquare } from "react-icons/bs";
import ls from "localstorage-slim";
import { FaSpinner } from "react-icons/fa";

const AssetAllocation = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loggedInRole, setLoggedInRole] = useState("admin");

    // ── Master Data State ──
    const [centerList, setCenterList] = useState([]);
    const [subLocationList, setSubLocationList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [subDepartmentList, setSubDepartmentList] = useState([]);

    // ── Form State ──
    const [center, setCenter] = useState("");
    const [subLocation, setSubLocation] = useState("");
    const [department, setDepartment] = useState("");
    const [subDepartment, setSubDepartment] = useState("");
    const [remarks, setRemarks] = useState("");
    const [inspectionChecklist, setInspectionChecklist] = useState([]);
    const [selectedInspectionItems, setSelectedInspectionItems] = useState([]);

    // ── Employee Details State ──
    const [employeeName, setEmployeeName] = useState("");
    const [employeeID, setEmployeeID] = useState("");
    const [employeeEmail, setEmployeeEmail] = useState("");
    const [employeeMobile, setEmployeeMobile] = useState("");
    const [employeeDesignation, setEmployeeDesignation] = useState("");
    const [formErrors, setFormErrors] = useState({});

    // ── Search & Selection State ──
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // ── Employee Search State ──
    const [employeeSearchText, setEmployeeSearchText] = useState("");
    const [employeeSuggestions, setEmployeeSuggestions] = useState([]);
    const [showEmployeeSuggestions, setShowEmployeeSuggestions] = useState(false);
    const [loadingEmployeeSearch, setLoadingEmployeeSearch] = useState(false);

    const pathname = usePathname();

    useEffect(() => {
        const userDetails = ls.get("userDetails", { decrypt: true });
        const roles = userDetails?.roles || [];
        const isAssetIncharge = roles.includes("asset-incharge");
        const isAssetAdmin = roles.includes("admin") || roles.includes("asset-admin");

        if (pathname.includes("admin")) {
            setLoggedInRole("admin");
        } else if (pathname.includes("center")) {
            setLoggedInRole("center");
        } else if (pathname.includes("asset")) {
            setLoggedInRole("asset");
        } else if (pathname.includes("account")) {
            setLoggedInRole("account");
        } else {
            setLoggedInRole("executive");
        }

        // Pre-fill center for asset-incharge
        if (isAssetIncharge && !isAssetAdmin && userDetails?.center_id) {
            if (userDetails.centerName) {
                setCenter(`${userDetails.centerName}|${userDetails.center_id}`);
                getSubLocationList(userDetails.center_id);
            }
        }

        // Load recent searches from local storage (limit to 2)
        const savedRecent = ls.get("recentAssetSearches") || [];
        setRecentSearches(savedRecent.slice(0, 2));

        // Initial Data Fetch
        getCenterList();
        getDepartmentList();

        // Handle pre-selection via query param
        const assetIDParam = searchParams.get("assetID");
        if (assetIDParam) {
            handleSearch(assetIDParam).then((results) => {
                if (results && results.length > 0) {
                    const exactMatch = results.find(a => a.assetID === assetIDParam);
                    if (exactMatch) {
                        selectAsset(exactMatch);
                    }
                }
            });
        }
    }, [searchParams]);

    // ── Master Data Fetching ──
    const getCenterList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
            .then(res => setCenterList(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Error fetching centers:", err));
    };

    const getSubLocationList = (center_id) => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/location-subcategory/get`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setSubLocationList(data.filter(item => item.dropdown_id === center_id));
            })
            .catch(err => console.error("Error fetching sub-locations:", err));
    };

    const getDepartmentList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
            .then(res => setDepartmentList(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Error fetching departments:", err));
    };

    const getSubDepartmentList = (dept_id) => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subdepartment-master/get`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setSubDepartmentList(data.filter(item => item.dropdown_id === dept_id));
            })
            .catch(err => console.error("Error fetching sub-departments:", err));
    };

    // ── Search Logic ──
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchText.length > 2) {
                handleSearch(searchText);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchText]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (employeeSearchText.length > 2) {
                handleEmployeeSearch(employeeSearchText);
            } else {
                setEmployeeSuggestions([]);
                setShowEmployeeSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [employeeSearchText]);

    const handleEmployeeSearch = async (text) => {
        setLoadingEmployeeSearch(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/get`);
            if (Array.isArray(response.data)) {
                const filtered = response.data.filter(emp =>
                    emp.employeeName?.toLowerCase().includes(text.toLowerCase()) ||
                    emp.employeeID?.toLowerCase().includes(text.toLowerCase()) ||
                    emp.employeeEmail?.toLowerCase().includes(text.toLowerCase())
                );
                setEmployeeSuggestions(filtered);
                setShowEmployeeSuggestions(true);
            }
        } catch (error) {
            console.error("Employee search error:", error);
        } finally {
            setLoadingEmployeeSearch(false);
        }
    };

    const selectEmployee = (emp) => {
        setEmployeeName(emp.employeeName || "");
        setEmployeeID(emp.employeeID || "");
        setEmployeeEmail(emp.employeeEmail || "");
        setEmployeeMobile(emp.employeeMobile || "");
        setEmployeeDesignation(emp.employeeDesignation || "");

        // Auto-populate location if available in employee master
        if (emp.center_id) {
            const centerVal = `${emp.centerName}|${emp.center_id}`;
            setCenter(centerVal);
            getSubLocationList(emp.center_id);
            if (emp.subLocation_id) {
                setSubLocation(`${emp.subLocationName}|${emp.subLocation_id}`);
            }
        }

        if (emp.department_id) {
            const deptVal = `${emp.departmentName}|${emp.department_id}`;
            setDepartment(deptVal);
            getSubDepartmentList(emp.department_id);
            if (emp.subDepartment_id) {
                setSubDepartment(`${emp.subDepartmentName}|${emp.subDepartment_id}`);
            }
        }

        setEmployeeSearchText("");
        setEmployeeSuggestions([]);
        setShowEmployeeSuggestions(false);
    };

    const handleSearch = async (text, autoSelect = false) => {
        setLoadingSearch(true);
        try {
            const userDetails = ls.get("userDetails", { decrypt: true });
            const roles = userDetails?.roles || [];
            const isAssetIncharge = roles.includes("asset-incharge");
            const isAssetAdmin = roles.includes("admin") || roles.includes("asset-admin");
            
            const formValues = {
                searchText: text,
                pageNumber: 1,
                recsPerPage: 10,
                center_ID: (isAssetIncharge && !isAssetAdmin) ? userDetails?.center_id : "all",
                department_ID: "all",
                subdepartment_ID: "all",
                dropdown_id: "all",
                assetStatus: "ACTIVE"
            };
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/post/list`, formValues);
            if (response.data && response.data.tableData) {
                setSuggestions(response.data.tableData);
                setShowSuggestions(true);
                return response.data.tableData;
            }
            return [];
        } catch (error) {
            console.error("Search error:", error);
            return [];
        } finally {
            setLoadingSearch(false);
        }
    };

    const selectAsset = (asset) => {
        setSelectedAsset(asset);
        setSearchText("");
        setSuggestions([]);
        setShowSuggestions(false);

        // Pre-fill and disable if already allocated or pending allocation
        if (asset.assetStatus === "ALLOCATED" || asset.assetStatus === "ALLOCATION_APPROVAL_PENDING") {
            const alloc = asset.currentAllocation || {};

            // Reconstruct name|id format for select fields
            const centerVal = alloc.center?._id ? `${alloc.center.name}|${alloc.center._id}` : "";
            const subLocVal = alloc.subLocation?._id ? `${alloc.subLocation.name}|${alloc.subLocation._id}` : "";
            const deptVal = alloc.department?._id ? `${alloc.department.name}|${alloc.department._id}` : "";
            const subDeptVal = alloc.subDepartment?._id ? `${alloc.subDepartment.name}|${alloc.subDepartment._id}` : "";

            setCenter(centerVal);
            setSubLocation(subLocVal);
            setDepartment(deptVal);
            setSubDepartment(subDeptVal);

            setEmployeeName(alloc.employee?.name || "");
            setEmployeeID(alloc.employee?.employeeID || "");
            setEmployeeEmail(alloc.employee?.email || "");
            setEmployeeMobile(alloc.employee?.mobile || "");
            setEmployeeDesignation(alloc.employee?.designation || "");
            setRemarks(asset.remarks || "");

            // Fetch dependent lists for pre-filled values
            if (alloc.center?._id) getSubLocationList(alloc.center._id);
            if (alloc.department?._id) getSubDepartmentList(alloc.department._id);
        } else {
            // Reset fields for available assets
            setCenter("");
            setSubLocation("");
            setDepartment("");
            setSubDepartment("");
            setEmployeeName("");
            setEmployeeID("");
            setEmployeeEmail("");
            setEmployeeMobile("");
            setEmployeeDesignation("");
            setRemarks("");
            setSelectedInspectionItems([]);
        }

        // Fetch Checklist
        const catId = asset.category_id || asset.assetCategory_id;
        const subCatId = asset.subCategory_id || asset.assetSubCategory_id;

        if (catId && subCatId) {
            const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-inspection-checklist/get/category/${catId}/subcategory/${subCatId}`;
            axios.get(url)
                .then(res => {
                    setInspectionChecklist(res.data.checklist || []);
                })
                .catch(err => {
                    console.error("Checklist fetch error:", err);
                    setInspectionChecklist([]);
                });
        } else {
            setInspectionChecklist([]);
        }

        // Update Recent Searches (limit to 2 unique)
        const updatedRecent = [asset, ...recentSearches.filter(item => item.assetID !== asset.assetID)].slice(0, 2);
        setRecentSearches(updatedRecent);
        ls.set("recentAssetSearches", updatedRecent);
    };

    // ── Cascaded Dropdown Handlers ──
    const handleCenterChange = (e) => {
        const value = e.target.value;
        setCenter(value);
        setSubLocation("");
        if (value) {
            const [, id] = value.split("|");
            getSubLocationList(id);
        } else {
            setSubLocationList([]);
        }
    };

    const handleDeptChange = (e) => {
        const value = e.target.value;
        setDepartment(value);
        setSubDepartment("");
        if (value) {
            const [, id] = value.split("|");
            getSubDepartmentList(id);
        } else {
            setSubDepartmentList([]);
        }
    };

    // ── Validation Logic ──
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validateMobile = (mobile) => {
        return /^[0-9]{10}$/.test(mobile);
    };

    const validateForm = () => {
        const errors = {};
        if (!selectedAsset) errors.asset = "Please select an asset";
        if (!center) errors.center = "Center is required";
        if (!department) errors.department = "Department is required";

        // Employee details are now optional. 
        // We only validate format if a value is provided.
        if (employeeEmail && !validateEmail(employeeEmail)) {
            errors.employeeEmail = "Invalid email format";
        }

        if (employeeMobile && !validateMobile(employeeMobile)) {
            errors.employeeMobile = "Invalid mobile (Must be exactly 10 digits)";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setLoadingSearch(true);
            try {
                // 1. Save/Update Employee (Only if name/email provided)
                let employee_id = null;
                if (employeeName || employeeEmail || employeeID) {
                    const employeeData = {
                        employeeName,
                        employeeID,
                        employeeEmail,
                        employeeMobile,
                        employeeDesignation
                    };
                    const empRes = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/post`, employeeData);
                    employee_id = empRes.data.employee_id;
                }

                // 2. Transact Asset Allocation (New Module)
                const userDetails = ls.get("userDetails", { decrypt: true });
                const newAllocationData = {
                    asset_id: selectedAsset._id,
                    assetID: selectedAsset.assetID,
                    assetName: selectedAsset.assetName,
                    transactionType: "ALLOCATION",
                    employee: {
                        _id: employee_id,
                        employeeID: employeeID,
                        name: employeeName,
                        mobile: employeeMobile,
                        email: employeeEmail,
                        designation: employeeDesignation
                    },
                    center: {
                        _id: center.split("|")[1],
                        name: center.split("|")[0]
                    },
                    subLocation: subLocation ? {
                        _id: subLocation.split("|")[1],
                        name: subLocation.split("|")[0]
                    } : null,
                    department: {
                        _id: department.split("|")[1],
                        name: department.split("|")[0]
                    },
                    subDepartment: subDepartment ? {
                        _id: subDepartment.split("|")[1],
                        name: subDepartment.split("|")[0]
                    } : null,
                    inspectionChecklist: selectedInspectionItems,
                    inspectionRemarks: remarks,
                    user_id: userDetails?.user_id || userDetails?.userId || userDetails?._id,
                    userName: userDetails?.name
                };

                const allocRes = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-transactions/`, newAllocationData);

                if (allocRes.data.success) {
                    Swal.fire({
                        title: "Success!",
                        text: "Asset allocated successfully.",
                        icon: "success",
                        confirmButtonColor: "#00af50",
                    }).then(() => {
                        router.push(`/${loggedInRole}/management`);
                    });
                }
            } catch (error) {
                console.error("Allocation error:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Something went wrong during allocation.",
                    icon: "error",
                    confirmButtonColor: "#d33",
                });
            } finally {
                setLoadingSearch(false);
            }
        }
    };

    // ── Section Header ──
    const SectionHeader = ({ title, subtitle }) => (
        <div className="mb-5 border-b border-gray-100 pb-2">
            <h3 className="text-[15px] font-bold text-black uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] font-normal text-gray-500">{subtitle}</p>
        </div>
    );

    // ── Icon Input Wrapper ──
    const IconWrapper = ({ icon: Icon }) => (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm pr-2 border-r-2 border-gray-300">
                <Icon className="icon" />
            </span>
        </div>
    );

    const isInactive = selectedAsset?.assetStatus === "INACTIVE" || selectedAsset?.assetStatus === "ASSET_APPROVAL_REJECTED";
    const isAllocated = selectedAsset?.assetStatus === "ALLOCATED" || selectedAsset?.assetStatus === "ALLOCATION_APPROVAL_PENDING";
    const isFormDisabled = isInactive || isAllocated;

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md bg-white">
                {/* ── Page Header ── */}
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300 flex justify-between">
                        <h1 className="heading h-auto content-center">Asset Allocation</h1>
                        <div className="flex gap-3 my-5 me-10 items-center">
                            <Tooltip content="Asset List" placement="bottom" className="bg-green" arrow={false}>
                                <CiViewList
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        router.push(`/${loggedInRole}/management`);
                                    }}
                                />
                            </Tooltip>
                            {/* Allocate Asset icon hidden as we are on this page */}
                            <Tooltip
                                content="Allocation Approval List"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                            >
                                <FaListUl
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        router.push(`/${loggedInRole}/management/allocation-approval-list`);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip
                                content="Bulk Upload"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                            >
                                <FaFileUpload
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        router.push(`/${loggedInRole}/management/bulk-upload`);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip
                                content="Add Asset"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                            >
                                <BsPlusSquare
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        router.push(`/${loggedInRole}/management/asset-submission`);
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-8">
                    <div className="space-y-8 max-w-6xl mx-auto">

                        {/* SECTION 1 — Asset Selection */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-md relative">
                            <SectionHeader
                                title="Asset Selection"
                                subtitle="Search and select the asset for allocation."
                            />
                            {selectedAsset ? (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 animate-fadeIn">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-green rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-md border-2 border-white">
                                                    {selectedAsset.assetID?.substring(selectedAsset.assetID.length - 2)}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xl font-bold text-gray-800">{selectedAsset.assetName}</h4>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                        <p className="text-[12px] text-gray-600 font-bold uppercase tracking-wider">
                                                            ID: <span className="text-green-700">{selectedAsset.assetID}</span>
                                                        </p>
                                                        <p className="text-[12px] text-gray-600 font-bold uppercase tracking-wider">
                                                            Serial: <span className="text-green-700">{selectedAsset.serialNo}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedAsset(null)}
                                                className="text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-md hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                            >
                                                Change Asset
                                            </button>
                                        </div>

                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-green-100">
                                            <div className="flex items-center gap-3 bg-white/80 p-3 rounded-lg border border-white shadow-sm">
                                                <MdBusiness className="text-green shrink-0" size={20} />
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">Make & Model</p>
                                                    <p className="text-[12px] font-bold text-gray-800">{selectedAsset.brand} {selectedAsset.model}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 bg-white/80 p-3 rounded-lg border border-white shadow-sm">
                                                <MdLayers className="text-green shrink-0" size={20} />
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">Asset Category</p>
                                                    <p className="text-[12px] font-bold text-gray-800">{selectedAsset.assetCategory || selectedAsset.category || "-"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 bg-white/80 p-3 rounded-lg border border-white shadow-sm">
                                                <MdLocationOn className="text-green shrink-0" size={20} />
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">Current Location</p>
                                                    <p className="text-[12px] font-bold text-gray-800">{selectedAsset.centerName || "Not Assigned"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={FaSearch} />
                                        <input
                                            type="text"
                                            className="stdInputField w-full pl-12"
                                            placeholder="Search Asset by ID, Serial Number, or Name..."
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                        />

                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                {suggestions.map((asset) => (
                                                    <div
                                                        key={asset._id}
                                                        className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center transition-colors"
                                                        onClick={() => selectAsset(asset)}
                                                    >
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800">{asset.assetName}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">{asset.assetID} • {asset.brand} {asset.model}</p>
                                                        </div>
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                                            {asset.serialNo}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-[10px] pl-1">
                                        <span className="text-gray-400 font-bold uppercase tracking-tight">Recent:</span>
                                        {recentSearches.length > 0 ? recentSearches.map((asset) => (
                                            <button
                                                key={asset._id}
                                                onClick={() => selectAsset(asset)}
                                                className="text-blue-600 hover:text-blue-800 font-bold uppercase tracking-tight bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100 transition-colors"
                                            >
                                                {asset.assetID}
                                            </button>
                                        )) : (
                                            <span className="text-gray-300 italic uppercase">No History</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>



                        {/* SECTION 2 — Employee Details */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-md relative">
                            <SectionHeader
                                title="Employee Details"
                                subtitle="Search or enter details of the team member."
                            />

                            {/* Employee Search Bar */}
                            <div className="mb-6">
                                <label className="inputLabel mb-1 block">Search Employee (Name, ID, Email)</label>
                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                    <IconWrapper icon={FaSearch} />
                                    <input
                                        type="text"
                                        className="stdInputField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Search by Employee Name, ID, or Email..."
                                        value={employeeSearchText}
                                        onChange={(e) => setEmployeeSearchText(e.target.value)}
                                        disabled={isAllocated}
                                    />
                                    {loadingEmployeeSearch && <div className="absolute right-3 top-2.5"><FaSpinner className="animate-spin text-green-500" /></div>}

                                    {/* Employee Suggestions Dropdown */}
                                    {showEmployeeSuggestions && employeeSuggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {employeeSuggestions.map((emp) => (
                                                <div
                                                    key={emp._id}
                                                    className="px-5 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center transition-colors"
                                                    onClick={() => selectEmployee(emp)}
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">{emp.employeeName}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase">{emp.employeeID} • {emp.employeeDesignation}</p>
                                                    </div>
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                                        {emp.employeeEmail}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t border-gray-50">
                                <div className="md:col-span-2">
                                    <label className="inputLabel mb-1 block">Full Name</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={MdPersonOutline} />
                                        <input
                                            type="text"
                                            className="stdInputField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="Enter Employee Name"
                                            value={employeeName}
                                            onChange={(e) => setEmployeeName(e.target.value)}
                                            disabled={isFormDisabled}
                                        />
                                        {formErrors.employeeName && <p className="text-[10px] text-red-500 mt-1">{formErrors.employeeName}</p>}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="inputLabel mb-1 block">Email Address</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={FaEnvelope} />
                                        <input
                                            type="email"
                                            className="stdInputField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="email@enterprise.com"
                                            value={employeeEmail}
                                            onChange={(e) => setEmployeeEmail(e.target.value)}
                                            disabled={isFormDisabled}
                                        />
                                        {formErrors.employeeEmail && <p className="text-[10px] text-red-500 mt-1">{formErrors.employeeEmail}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4 mt-4">
                                <div>
                                    <label className="inputLabel mb-1 block">Employee ID</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={MdPersonAddAlt1} />
                                        <input
                                            type="text"
                                            className="stdInputField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="EMP-12345"
                                            value={employeeID}
                                            onChange={(e) => setEmployeeID(e.target.value)}
                                            disabled={isAllocated}
                                        />
                                        {formErrors.employeeID && <p className="text-[10px] text-red-500 mt-1">{formErrors.employeeID}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Phone Number</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 flex items-center">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-600 font-bold sm:text-sm pr-2 border-r-2 border-gray-300">
                                                +91
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            className="stdInputField w-full pl-14 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="Phone Number"
                                            value={employeeMobile}
                                            maxLength={10}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                setEmployeeMobile(val.slice(0, 10));
                                            }}
                                            disabled={isFormDisabled}
                                        />
                                        {formErrors.employeeMobile && <p className="text-[10px] text-red-500 mt-1">{formErrors.employeeMobile}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Designation</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={BsPersonVcard} />
                                        <input
                                            type="text"
                                            className="stdInputField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="e.g. Senior Analyst"
                                            value={employeeDesignation}
                                            onChange={(e) => setEmployeeDesignation(e.target.value)}
                                            disabled={isFormDisabled}
                                        />
                                        {formErrors.employeeDesignation && <p className="text-[10px] text-red-500 mt-1">{formErrors.employeeDesignation}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3 — Target Location Mapping */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-md">
                            <SectionHeader
                                title="Target Location Mapping"
                                subtitle="Define the destination for this asset."
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                <div>
                                    <label className="inputLabel mb-1 block">Center / Location <span className="text-red-500">*</span></label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                        <IconWrapper icon={MdLocationOn} />
                                        <select
                                            className="stdSelectField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={center}
                                            onChange={handleCenterChange}
                                            disabled={
                                                isFormDisabled ||
                                                (ls.get("userDetails", { decrypt: true })?.roles?.includes("asset-incharge") &&
                                                    !ls.get("userDetails", { decrypt: true })?.roles?.includes("admin") &&
                                                    !ls.get("userDetails", { decrypt: true })?.roles?.includes("asset-admin"))
                                            }
                                        >
                                            <option value="">-- Select Center --</option>
                                            {centerList.map((c) => (
                                                <option key={c._id} value={`${c.centerName}|${c._id}`}>{c.centerName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Sub-Location</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                        <IconWrapper icon={MdLayers} />
                                        <select
                                            className="stdSelectField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={subLocation}
                                            onChange={(e) => setSubLocation(e.target.value)}
                                            disabled={!center || isFormDisabled}
                                        >
                                            <option value="">-- Select Sub-Location --</option>
                                            {subLocationList.map((sl) => (
                                                <option key={sl._id} value={`${sl.inputValue}|${sl._id}`}>{sl.inputValue}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Department <span className="text-red-500">*</span></label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                        <IconWrapper icon={MdBusiness} />
                                        <select
                                            className="stdSelectField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={department}
                                            onChange={handleDeptChange}
                                            disabled={isFormDisabled}
                                        >
                                            <option value="">-- Select Department --</option>
                                            {departmentList.map((dept) => (
                                                <option key={dept._id} value={`${dept.fieldValue}|${dept._id}`}>{dept.fieldValue}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Sub-Department</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                        <IconWrapper icon={MdLayers} />
                                        <select
                                            className="stdSelectField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={subDepartment}
                                            onChange={(e) => setSubDepartment(e.target.value)}
                                            disabled={!department || isFormDisabled}
                                        >
                                            <option value="">-- Select Sub-Department --</option>
                                            {subDepartmentList.map((sd) => (
                                                <option key={sd._id} value={`${sd.inputValue}|${sd._id}`}>{sd.inputValue}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3.5 — Physical Inspection Checklist */}
                        {selectedAsset && (
                            <div className="border border-gray-200 rounded-lg p-5 shadow-md">
                                <SectionHeader
                                    title="Asset Inspection Checklist"
                                    subtitle={`Verify the condition of ${selectedAsset?.assetName || "this asset"} before allocation.`}
                                />
                                {inspectionChecklist && inspectionChecklist.length > 0 ? (
                                    <div className="mt-4 grid gap-x-6 gap-y-3" style={{ gridTemplateRows: 'repeat(2, minmax(0, 1fr))', gridAutoFlow: 'column' }}>
                                        {inspectionChecklist.map((item, index) => (
                                            <label key={index} className="flex items-center gap-3 cursor-pointer text-sm text-gray-700 hover:text-[#00af50] transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#00af50] border-gray-300 rounded focus:ring-[#00af50] disabled:opacity-50"
                                                    disabled={isFormDisabled}
                                                    checked={selectedInspectionItems.includes(item)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedInspectionItems([...selectedInspectionItems, item]);
                                                        } else {
                                                            setSelectedInspectionItems(selectedInspectionItems.filter(i => i !== item));
                                                        }
                                                    }}
                                                />
                                                {item}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                                        <MdInfoOutline className="text-amber-500 text-xl" />
                                        <p className="text-[13px] text-amber-700 font-medium italic">
                                            No inspection checklist added for this category.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTION 4 — Physical Inspection Remarks */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-md">
                            <SectionHeader
                                title="Physical Inspection Remarks"
                                subtitle="Condition and handover notes."
                            />
                            <textarea
                                rows={4}
                                className="block rounded-md border-0 py-2 px-3 w-full font-normal text-gray-900 ring-1 ring-inset ring-grayThree text-[13px] placeholder:text-[14px] placeholder:text-grayThree focus:ring-2 focus:ring-inset focus:ring-green resize-none mt-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Provide any specific notes about the asset condition or handover instructions..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                disabled={isFormDisabled}
                            />
                        </div>
                    </div>


                    {/* Footer Actions */}
                    <div className="mt-12 flex items-center justify-end border-t border-gray-200 pt-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSubmit}
                                className={`formButtons min-w-[200px] flex items-center justify-center gap-2 ${(!selectedAsset || isFormDisabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!selectedAsset || isFormDisabled}
                            >
                                {loadingSearch ? (
                                    <FaSpinner className="animate-spin text-lg" />
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AssetAllocation;
