"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { MdLayers, MdLocationOn, MdBusiness, MdAssignmentTurnedIn, MdInfoOutline, MdPersonOutline, MdPersonAddAlt1, MdOutlineFactCheck } from "react-icons/md";
import { FaSearch, FaEnvelope, FaPhoneAlt, FaUserTie } from "react-icons/fa";
import { BsPersonVcard } from "react-icons/bs";
import ls from "localstorage-slim";

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

    // ── Employee Details State ──
    const [employeeName, setEmployeeName] = useState("");
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

    useEffect(() => {
        const role = ls.get("role") || "admin";
        setLoggedInRole(role);

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
            if (searchText.length > 1) {
                handleSearch(searchText);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchText]);

    const handleSearch = async (text, autoSelect = false) => {
        setLoadingSearch(true);
        try {
            const formValues = {
                searchText: text,
                pageNumber: 1,
                recsPerPage: 10,
                center_ID: "all",
                department_ID: "all",
                subdepartment_ID: "all",
                dropdown_id: "all"
            };
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management/post/list`, formValues);
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
            // Reconstruct name|id format for select fields
            const centerVal = asset.center_id ? `${asset.centerName}|${asset.center_id}` : "";
            const subLocVal = asset.sublocation_id ? `${asset.sublocationName}|${asset.sublocation_id}` : "";
            const deptVal = asset.department_id ? `${asset.departmentName}|${asset.department_id}` : "";
            const subDeptVal = asset.subdepartment_id ? `${asset.subdepartmentName}|${asset.subdepartment_id}` : "";

            setCenter(centerVal);
            setSubLocation(subLocVal);
            setDepartment(deptVal);
            setSubDepartment(subDeptVal);

            setEmployeeName(asset.employeeName || "");
            setEmployeeEmail(asset.employeeEmail || "");
            setEmployeeMobile(asset.employeeMobile || "");
            setEmployeeDesignation(asset.employeeDesignation || "");
            setRemarks(asset.remarks || "");

            // Fetch dependent lists for pre-filled values
            if (asset.center_id) getSubLocationList(asset.center_id);
            if (asset.department_id) getSubDepartmentList(asset.department_id);
        } else {
            // Reset fields for available assets
            setCenter("");
            setSubLocation("");
            setDepartment("");
            setSubDepartment("");
            setEmployeeName("");
            setEmployeeEmail("");
            setEmployeeMobile("");
            setEmployeeDesignation("");
            setRemarks("");
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
        if (!employeeName) errors.employeeName = "Employee name is required";

        if (!employeeEmail) {
            errors.employeeEmail = "Email is required";
        } else if (!validateEmail(employeeEmail)) {
            errors.employeeEmail = "Invalid email format";
        }

        if (!employeeMobile) {
            errors.employeeMobile = "Mobile number is required";
        } else if (!validateMobile(employeeMobile)) {
            errors.employeeMobile = "Invalid mobile (Must be exactly 10 digits)";
        }

        if (!employeeDesignation) errors.employeeDesignation = "Designation is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setLoadingSearch(true);
            try {
                // 1. Save/Update Employee
                const employeeData = {
                    employeeName,
                    employeeEmail,
                    employeeMobile,
                    employeeDesignation
                };
                const empRes = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/post`, employeeData);
                const employee_id = empRes.data.employee_id;

                // 2. Transact Asset Allocation (New Module)
                const userDetails = ls.get("userDetails", { decrypt: true });
                const newAllocationData = {
                    assetID: selectedAsset.assetID,
                    assetName: selectedAsset.assetName,
                    allocationType: "ALLOCATE",
                    employee: [{
                        name: employeeName,
                        mobile: employeeMobile,
                        email: employeeEmail,
                        designation: employeeDesignation,
                        employee_id: employee_id
                    }],
                    center_id: center.split("|")[1],
                    center: center.split("|")[0],
                    subLocation_id: subLocation ? subLocation.split("|")[1] : null,
                    subLocation: subLocation ? subLocation.split("|")[0] : null,
                    department_id: department.split("|")[1],
                    department: department.split("|")[0],
                    subDepartment_id: subDepartment ? subDepartment.split("|")[1] : null,
                    subDepartment: subDepartment ? subDepartment.split("|")[0] : null,
                    inspectionRemarks: remarks,
                    createdBy: userDetails?.user_id || userDetails?._id,
                    asset_id: selectedAsset._id
                };

                const allocRes = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-allocation/`, newAllocationData);

                if (allocRes.data.success) {
                    Swal.fire({
                        title: "Success!",
                        text: "Asset allocated successfully.",
                        icon: "success",
                        confirmButtonColor: "#00af50",
                    }).then(() => {
                        router.push(`/${loggedInRole}/asset-management`);
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

    const isAllocated = selectedAsset?.assetStatus === "ALLOCATED" || selectedAsset?.assetStatus === "ALLOCATION_APPROVAL_PENDING";

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md bg-white">
                {/* ── Page Header ── */}
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300 flex justify-between">
                        <div className="flex flex-col px-10 py-5">
                            {/* <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                TRANSACTIONS &gt; <span className="text-blue-500">ALLOCATIONS</span>
                            </p> */}
                            <h1 className="heading h-auto content-center">Asset Allocation</h1>
                        </div>
                        <div className="flex gap-3 my-5 me-10">
                            <Tooltip
                                content="Asset Allocation Approval"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                            >
                                <MdOutlineFactCheck
                                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        router.push(`/${loggedInRole}/asset-management/movement-authorization`);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip content="Asset List" placement="bottom" className="bg-green" arrow={false}>
                                <CiViewList
                                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        router.push(`/${loggedInRole}/asset-management`);
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
                                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all animate-fadeIn">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                            {selectedAsset.assetID?.substring(selectedAsset.assetID.length - 2)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{selectedAsset.assetName}</h4>
                                            <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{selectedAsset.assetID} | SN: {selectedAsset.serialNo}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedAsset(null)}
                                        className="text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        Change
                                    </button>
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

                        {/* SECTION 1.5 — Asset Current Status (Horizontal) */}
                        <div className={`border border-gray-200 rounded-lg p-6 shadow-md transition-all ${isAllocated ? 'bg-orange-50 border-orange-200' : selectedAsset ? 'bg-green/5 border-green/20' : 'bg-gray-50 border-gray-100'}`}>
                            {isAllocated && (
                                <div className="mb-4 bg-orange-100/50 border border-orange-200 p-3 rounded-lg flex items-center gap-3 animate-pulse">
                                    <MdInfoOutline className="text-orange-600" size={20} />
                                    <p className="text-[11px] font-bold text-orange-800 uppercase tracking-tight">
                                        This asset is already allocated. Please deallocate it first to make changes.
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                                        <MdInfoOutline size={20} className="text-green" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold uppercase tracking-widest text-[12px] text-black">Asset Status</h3>
                                        <p className="text-[10px] text-gray-400 font-medium">Real-time status in Registry</p>
                                    </div>
                                </div>

                                {selectedAsset ? (
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                                        <div className="flex items-center gap-3 bg-white/50 p-3 rounded-lg border border-white/80">
                                            <MdLocationOn className="text-green" size={18} />
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Currently At</p>
                                                <p className="text-[12px] font-bold text-gray-800">{selectedAsset.centerName || "Not Assigned"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-white/50 p-3 rounded-lg border border-white/80">
                                            <MdBusiness className="text-green" size={18} />
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Department</p>
                                                <p className="text-[12px] font-bold text-gray-800">{selectedAsset.departmentName || "General Stock"}</p>
                                            </div>
                                        </div>

                                        <div className={`flex items-center justify-center rounded-lg px-4 py-3 font-bold text-[11px] uppercase tracking-widest border shadow-sm ${selectedAsset.status === 'Active' ? 'bg-green text-white border-green' : 'bg-red-500 text-white border-red-500'}`}>
                                            Status: {selectedAsset.status === 'Active' ? 'Available' : selectedAsset.status}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center py-2 text-gray-400 italic text-[12px] border-2 border-dashed border-gray-200 rounded-lg">
                                        Search and select an asset to view its current allocation status.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION 2 — Target Location Mapping */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-md">
                            <SectionHeader
                                title="Target Location Mapping"
                                subtitle="Define the destination for this asset."
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                <div>
                                    <label className="inputLabel mb-1 block">Center / Location</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                        <IconWrapper icon={MdLocationOn} />
                                        <select
                                            className="stdSelectField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={center}
                                            onChange={handleCenterChange}
                                            disabled={isAllocated}
                                        >
                                            <option value="">-- Select Center --</option>
                                            {centerList.map((c) => (
                                                <option key={c._id} value={`${c.centerName}|${c._id}`}>{c.centerName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Sub-Location / Floor</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                        <IconWrapper icon={MdLayers} />
                                        <select
                                            className="stdSelectField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={subLocation}
                                            onChange={(e) => setSubLocation(e.target.value)}
                                            disabled={!center || isAllocated}
                                        >
                                            <option value="">-- Select Sub-Location --</option>
                                            {subLocationList.map((sl) => (
                                                <option key={sl._id} value={`${sl.inputValue}|${sl._id}`}>{sl.inputValue}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Department</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                        <IconWrapper icon={MdBusiness} />
                                        <select
                                            className="stdSelectField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={department}
                                            onChange={handleDeptChange}
                                            disabled={isAllocated}
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
                                            disabled={!department || isAllocated}
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

                        {/* SECTION 3 — Employee Details */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-md">
                            <SectionHeader
                                title="Employee Details"
                                subtitle="Assign asset to a specific team member."
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                <div>
                                    <label className="inputLabel mb-1 block">Full Name <span className="text-red-500">*</span></label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={MdPersonOutline} />
                                        <input
                                            type="text"
                                            className="stdInputField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="Enter Employee Name"
                                            value={employeeName}
                                            onChange={(e) => setEmployeeName(e.target.value)}
                                            disabled={isAllocated}
                                        />
                                        {formErrors.employeeName && <p className="text-[10px] text-red-500 mt-1">{formErrors.employeeName}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Email Address <span className="text-red-500">*</span></label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={FaEnvelope} />
                                        <input
                                            type="email"
                                            className="stdInputField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="email@enterprise.com"
                                            value={employeeEmail}
                                            onChange={(e) => setEmployeeEmail(e.target.value)}
                                            disabled={isAllocated}
                                        />
                                        {formErrors.employeeEmail && <p className="text-[10px] text-red-500 mt-1">{formErrors.employeeEmail}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Phone Number <span className="text-red-500">*</span></label>
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
                                            disabled={isAllocated}
                                        />
                                        {formErrors.employeeMobile && <p className="text-[10px] text-red-500 mt-1">{formErrors.employeeMobile}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-1 block">Designation <span className="text-red-500">*</span></label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={BsPersonVcard} />
                                        <input
                                            type="text"
                                            className="stdInputField w-full pl-12 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="e.g. Senior Analyst"
                                            value={employeeDesignation}
                                            onChange={(e) => setEmployeeDesignation(e.target.value)}
                                            disabled={isAllocated}
                                        />
                                        {formErrors.employeeDesignation && <p className="text-[10px] text-red-500 mt-1">{formErrors.employeeDesignation}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                disabled={isAllocated}
                            />
                        </div>
                    </div>


                    {/* Footer Actions */}
                    <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 pt-8 gap-6">
                        <div className="flex items-center gap-3 text-gray-500 bg-gray-50 px-5 py-3 rounded-lg border border-gray-100 shadow-sm">
                            <MdInfoOutline size={22} className="text-blue-500" />
                            <p className="text-xs font-semibold uppercase tracking-tight">Submission initiates Department Head verification task.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push(`/${loggedInRole}/asset-management`)}
                                className="bg-white hover:bg-gray-100 px-8 py-2 border border-gray-300 rounded font-bold text-sm transition-all"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`formButtons min-w-[200px] flex items-center justify-center gap-2 ${(!selectedAsset || isAllocated) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!selectedAsset || isAllocated}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Submit Allocation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AssetAllocation;
