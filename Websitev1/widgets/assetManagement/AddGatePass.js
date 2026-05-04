"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import dynamic from "next/dynamic";
import { FaSpinner, FaPlus, FaTrash, FaSearch, FaArrowLeft, FaCheck, FaBuilding, FaPhone } from "react-icons/fa";
import {
    MdOutlineSecurity,
    MdPerson,
    MdDateRange,
    MdShoppingBag,
    MdPin,
    MdBusiness,
    MdEmail,
    MdDescription,
    MdMoreTime
} from "react-icons/md";
const ReactDatePicker = dynamic(
    () => import("react-datepicker").then((mod) => mod.default || mod),
    {
        ssr: false,
        loading: () => <div className="h-10 w-full animate-pulse bg-slate-50 rounded-xl border border-slate-100" />
    }
);
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { FaFileUpload, FaListUl, FaUserPlus } from "react-icons/fa";


const AddGatePass = ({ editId }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [loggedInRole, setLoggedInRole] = useState("");
    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }));

    const [loading, setLoading] = useState(false);
    const [assetSearch, setAssetSearch] = useState("");
    const [assetResults, setAssetResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [empSearch, setEmpSearch] = useState("");
    const [empResults, setEmpResults] = useState([]);
    const [isSearchingEmp, setIsSearchingEmp] = useState(false);

    const [formData, setFormData] = useState({
        gateLocation: "Main Gate",
        bearerDetails: {
            fullName: "",
            empID: "",
            department: "",
            contact: "",
            email: "",
            validFrom: new Date(),
            validTo: moment().add(1, 'day').toDate()
        },
        assets: [],
        remarks: "",
        center_id: ""
    });

    const [centers, setCenters] = useState([]);

    useEffect(() => {
        fetchCenters();
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
        setFormData(prev => ({ ...prev, center_id: userDetails?.center_id }));

        if (editId) {
            fetchGatePassDetails(editId);
        }
    }, [pathname, editId, userDetails]);

    const fetchCenters = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`);
            setCenters(res.data);
        } catch (error) {
            console.error("Error fetching centers:", error);
        }
    };

    const fetchGatePassDetails = async (id) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gate-pass/get/details/${id}`);
            if (res.data.success) {
                const data = res.data.data;
                if (data.status !== "Pending") {
                    router.push(`${pathname.replace('/add-gate-pass', '')}/print-gate-pass/${id}`);
                    return;
                }
                setFormData({
                    ...data,
                    bearerDetails: {
                        ...data.bearerDetails,
                        validFrom: new Date(data.bearerDetails.validFrom),
                        validTo: new Date(data.bearerDetails.validTo)
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching gate pass details:", error);
            Swal.fire("Error", "Failed to load gate pass details.", "error");
        }
    };

    // ── Section Header ──
    const SectionHeader = ({ title, subtitle }) => (
        <div className="mb-5 border-b border-gray-100 pb-2">
            <h3 className="text-[15px] font-bold text-black uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] font-normal text-gray-500">{subtitle}</p>
        </div>
    );

    const IconWrapper = ({ icon: Icon }) => (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm pr-2 border-r-2 border-gray-300">
                <Icon className="icon" />
            </span>
        </div>
    );


    const handleSearchAsset = async (query) => {
        setAssetSearch(query);
        if (query.length < 2) {
            setAssetResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/post/list`, {
                searchText: query,
                pageNumber: 1,
                recsPerPage: 10,
                center_ID: "all",
                department_ID: "all",
                subdepartment_ID: "all",
                dropdown_id: "all",
                excludeStatus: "DISPOSED"
            });
            setAssetResults(res.data.tableData || []);
        } catch (error) {
            console.error("Asset search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchEmployee = async (query) => {
        setEmpSearch(query);
        if (query.length < 2) {
            setEmpResults([]);
            return;
        }
        setIsSearchingEmp(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/list/10/1`, {
                searchText: query,
                pageNumber: 1,
                recsPerPage: 10
            });
            setEmpResults(res.data.tableData || []);
        } catch (error) {
            console.error("Employee search error:", error);
        } finally {
            setIsSearchingEmp(false);
        }
    };

    const selectEmployee = (emp) => {
        setFormData({
            ...formData,
            bearerDetails: {
                ...formData.bearerDetails,
                fullName: emp.employeeName || "",
                empID: emp.employeeID || "",
                department: emp.departmentName || "",
                contact: emp.employeeMobile || "",
                email: emp.employeeEmail || ""
            }
        });
        setEmpSearch("");
        setEmpResults([]);
    };

    const addAssetToList = (asset) => {
        if (formData.assets.find(a => a.assetID === asset.assetID)) {
            Swal.fire("Note", "Asset already added to list", "info");
            return;
        }

        // Get center_id from asset allocation
        const assetCenterId = asset.currentAllocation?.center?._id;

        const newAsset = {
            assetName: asset.assetName,
            assetID: asset.assetID,
            model: asset.model || "N/A",
            quantity: 1,
            type: "RETURNABLE",
            reason: ""
        };

        const updatedData = { ...formData, assets: [...formData.assets, newAsset] };

        // If formData.center_id is empty or this is the first asset, set center_id from asset
        if (!updatedData.center_id && assetCenterId) {
            updatedData.center_id = assetCenterId;
        }

        setFormData(updatedData);
        setAssetSearch("");
        setAssetResults([]);
    };

    const removeAsset = (index) => {
        const updated = formData.assets.filter((_, i) => i !== index);
        setFormData({ ...formData, assets: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.assets.length === 0) {
            Swal.fire("Error", "Please add at least one asset", "error");
            return;
        }
        if (!formData.center_id) {
            Swal.fire("Error", "Center is required. Please select a center or ensure user profile has a center assigned.", "error");
            return;
        }
        setLoading(true);
        try {
            const url = editId
                ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/gate-pass/patch/update/${editId}`
                : `${process.env.NEXT_PUBLIC_BASE_URL}/api/gate-pass/post`;

            const method = editId ? 'patch' : 'post';

            const res = await axios({
                method: method,
                url: url,
                data: {
                    ...formData,
                    user_id: userDetails?.user_id || userDetails?.userId || userDetails?._id
                }
            });

            if (res.data.success) {
                Swal.fire("Success", res.data.message, "success");
                router.push(`${pathname.replace('/add-gate-pass', '')}/gate-pass-management`);
            }
        } catch (error) {
            console.error("Error submitting gate pass:", error);
            Swal.fire("Error", error.response?.data?.error || error.response?.data?.message || "Failed to submit gate pass request.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        const userDetails = ls.get("userDetails", { decrypt: true }) || {};
        const roles = userDetails?.roles || [];
        const isIncharge = roles.includes("account-incharge") || roles.includes("center-incharge");
        const isAuthorized = roles.includes("admin") || roles.includes("account-admin") || roles.includes("account-manager") || roles.includes("asset-manager") || roles.includes("asset-admin");

        if (isIncharge && !isAuthorized) {
            Swal.fire("Access Denied", "You do not have permission to approve gate passes.", "error");
            return;
        }

        const confirm = await Swal.fire({
            title: 'Approve Gate Pass?',
            text: "This will authorize the asset movement.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            confirmButtonText: 'Yes, Approve'
        });

        if (confirm.isConfirmed) {
            setLoading(true);
            try {
                const userName = userDetails.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails.fullName || userDetails.name || "System");
                const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gate-pass/patch/approve/${editId}`, {
                    user_id: userDetails?.user_id || userDetails?.userId || userDetails?._id,
                    userName: userName
                });
                if (res.data.success) {
                    Swal.fire("Approved!", "Gate Pass has been approved.", "success");
                    router.push(`${pathname.replace('/add-gate-pass', '')}/gate-pass-management`);
                }
            } catch (error) {
                console.error("Approval error:", error);
                Swal.fire("Error", error.response?.data?.error || error.response?.data?.message || "Failed to approve gate pass", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleReject = async () => {
        const userDetails = ls.get("userDetails", { decrypt: true }) || {};
        const roles = userDetails?.roles || [];
        const isIncharge = roles.includes("account-incharge") || roles.includes("center-incharge");
        const isAuthorized = roles.includes("admin") || roles.includes("account-admin") || roles.includes("account-manager") || roles.includes("asset-manager") || roles.includes("asset-admin");

        if (isIncharge && !isAuthorized) {
            Swal.fire("Access Denied", "You do not have permission to reject gate passes.", "error");
            return;
        }

        const { value: remarks } = await Swal.fire({
            title: 'Reject Gate Pass?',
            input: 'textarea',
            inputPlaceholder: 'Enter rejection reason...',
            text: "This request will be denied.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Reject',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to provide a reason for rejection!'
                }
            }
        });

        if (remarks) {
            setLoading(true);
            try {
                const userName = userDetails.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails.name || "System");
                const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gate-pass/patch/reject/${editId}`, {
                    user_id: userDetails?.user_id || userDetails?.userId || userDetails?._id,
                    remarks,
                    userName: userName
                });
                if (res.data.success) {
                    Swal.fire("Rejected!", "Gate Pass has been rejected.", "success");
                    router.push(`${pathname.replace('/add-gate-pass', '')}/gate-pass-management`);
                }
            } catch (error) {
                console.error("Rejection error:", error);
                Swal.fire("Error", error.response?.data?.error || error.response?.data?.message || "Failed to reject gate pass", "error");
            } finally {
                setLoading(false);
            }
        }

    };

    return (
        <section className="section admin-box box-primary">
            <div className="hr-card hr-fade-in">
                {/* --- Page Header --- */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Movement Operations</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Issue <span className="text-[#3c8dbc] font-black">Gate Pass</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 pt-4 md:pt-0 mb-1">
                            <Tooltip content="Gate Pass List" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                                <div onClick={() => router.push(`${pathname.replace('/add-gate-pass', '')}/gate-pass-management`)}
                                    className="text-[#3c8dbc] border border-[#3c8dbc] p-1.5 rounded cursor-pointer hover:bg-[#3c8dbc] hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[32px] w-[32px]">
                                    <CiViewList size={20} />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                        Authorize the external movement of enterprise assets. Valid documentation is required for security clearance at all exit points.
                    </p>
                </div>


                <div className="px-10 py-6">
                    <form onSubmit={handleSubmit} className="space-y-8 bg-white text-secondary">

                        {/* Main Details */}
                        <div className="space-y-8">
                            {/* Bearer Details Section */}
                            <div className="border border-gray-200 rounded-lg p-5 mt-2 shadow-md">
                                <SectionHeader
                                    title="Bearer Information"
                                    subtitle="Details of the person carrying the assets."
                                />

                                {/* Employee Search Autocomplete */}
                                <div className="relative mb-8 pb-8 border-b border-gray-50">
                                    <label className="inputLabel mb-2 block font-semibold text-gray-700">Search Existing Employee</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 max-w-md">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaSearch className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="stdInputField pl-10 h-11"
                                            placeholder="Search by candidate name or ID..."
                                            value={empSearch}
                                            onChange={(e) => handleSearchEmployee(e.target.value)}
                                        />
                                        {isSearchingEmp && <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-green" />}
                                    </div>

                                    {empResults.length > 0 && (
                                        <div className="absolute z-[100] mt-1 w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="max-h-64 overflow-y-auto">
                                                {empResults.map((emp) => (
                                                    <div
                                                        key={emp._id}
                                                        className="p-4 hover:bg-green/5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                                                        onClick={() => selectEmployee(emp)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-bold text-gray-900 group-hover:text-green transition-colors">{emp.employeeName}</p>
                                                                <div className="flex gap-3 text-[11px] text-gray-500 mt-1">
                                                                    <span className="bg-gray-100 px-2 py-0.5 rounded uppercase font-medium">{emp.employeeID}</span>
                                                                    <span className="truncate max-w-[150px]">{emp.departmentName || "No Department"}</span>
                                                                </div>
                                                            </div>
                                                            <div className="bg-green/10 text-green px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Select</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-gray-400 mt-2 italic">* Use search to quickly fill details, or enter manually below.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                                    <div className="">
                                        <label className="inputLabel mb-1">Full Name <span className="text-red-500">*</span></label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdPerson} />
                                            <input
                                                type="text" required
                                                className="stdInputField w-full pl-12"
                                                placeholder="John Davis"
                                                value={formData.bearerDetails.fullName}
                                                onChange={(e) => setFormData({ ...formData, bearerDetails: { ...formData.bearerDetails, fullName: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                    <div className="">
                                        <label className="inputLabel mb-1">Employee ID <span className="text-red-500">*</span></label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdPin} />
                                            <input
                                                type="text" required
                                                className="stdInputField w-full pl-12"
                                                placeholder="GI-7890"
                                                value={formData.bearerDetails.empID}
                                                onChange={(e) => setFormData({ ...formData, bearerDetails: { ...formData.bearerDetails, empID: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                    <div className="">
                                        <label className="inputLabel mb-1">Department</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdBusiness} />
                                            <input
                                                type="text"
                                                className="stdInputField w-full pl-12"
                                                placeholder="IT Operations"
                                                value={formData.bearerDetails.department}
                                                onChange={(e) => setFormData({ ...formData, bearerDetails: { ...formData.bearerDetails, department: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                    <div className="">
                                        <label className="inputLabel mb-1">Contact No <span className="text-red-500">*</span></label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={FaPhone} />
                                            <input
                                                type="text" required
                                                className="stdInputField w-full pl-12"
                                                placeholder="9876543210"
                                                maxLength={10}
                                                value={formData.bearerDetails.contact}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, "");
                                                    if (val.length <= 10) {
                                                        setFormData({ ...formData, bearerDetails: { ...formData.bearerDetails, contact: val } });
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="">
                                        <label className="inputLabel mb-1">Email Address <span className="text-red-500">*</span></label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdEmail} />
                                            <input
                                                type="email" required
                                                className="stdInputField w-full pl-12"
                                                placeholder="john.davis@example.com"
                                                value={formData.bearerDetails.email}
                                                onChange={(e) => setFormData({ ...formData, bearerDetails: { ...formData.bearerDetails, email: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Asset List Section */}
                            <div className="border border-gray-200 rounded-lg p-5 mt-5 shadow-md">
                                <SectionHeader
                                    title="Assets To Be Issued"
                                    subtitle="Select and manage assets for movement."
                                />


                                {/* Center Selection (Visible to Admin, Account and Center roles) */}
                                {((loggedInRole === "admin" || loggedInRole === "asset" || loggedInRole === "center") || !formData.center_id) && (
                                    <div className="mb-8 border-b border-gray-100 pb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FaBuilding size={20} /></div>
                                            <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-widest">Select Center</h3>
                                        </div>
                                        <div className="max-w-md">
                                            <label className="inputLabel mb-1">Responsible Center</label>
                                            <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                <IconWrapper icon={FaBuilding} />
                                                <select
                                                    className="stdSelectField w-full pl-12"
                                                    value={formData.center_id}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, center_id: e.target.value }))}
                                                    disabled={
                                                        !!editId ||
                                                        (userDetails?.roles?.includes("asset-incharge") &&
                                                            !userDetails?.roles?.includes("admin") &&
                                                            !userDetails?.roles?.includes("asset-admin"))
                                                    }
                                                >
                                                    <option value="">-- Select Center --</option>
                                                    {centers.map(center => (
                                                        <option key={center._id} value={center._id}>{center.centerName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="relative mb-8">
                                    <label className="inputLabel mb-1 block">Search and Add Asset</label>
                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={FaSearch} />
                                        <input
                                            type="text"
                                            className="stdInputField w-full pl-12"
                                            placeholder="Type asset name or ID..."
                                            value={assetSearch}
                                            onChange={(e) => handleSearchAsset(e.target.value)}
                                        />
                                        {isSearching && <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-green" />}
                                    </div>

                                    {assetResults.length > 0 && (
                                        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {assetResults.map(asset => (
                                                <div
                                                    key={asset._id}
                                                    onClick={() => addAssetToList(asset)}
                                                    className="p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer flex justify-between items-center group"
                                                >
                                                    <div>
                                                        <p className="font-extrabold text-slate-800 text-[13px]">{asset.assetName}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{asset.assetID} • {asset.category}</p>
                                                    </div>
                                                    <FaPlus size={12} className="text-slate-300 group-hover:text-green-600 group-hover:scale-125 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {formData.assets.length === 0 ? (
                                        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                                            <div className="p-4 bg-slate-50 rounded-full text-slate-300 mb-4"><MdShoppingBag size={40} /></div>
                                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No assets added yet</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-2xl border border-slate-50">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50">
                                                    <tr className="border-b border-slate-100">
                                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name/ID</th>
                                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Type</th>
                                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                                        <th className="p-4 w-12 text-center"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.assets.map((asset, idx) => (
                                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                                                            <td className="p-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-extrabold text-slate-800 text-[13px] leading-tight">{asset.assetName}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{asset.assetID}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <select
                                                                    className="w-full bg-white border border-slate-100 rounded-lg text-[11px] font-bold p-2 outline-none focus:ring-1 focus:ring-green-500"
                                                                    value={asset.type}
                                                                    onChange={(e) => {
                                                                        const updated = [...formData.assets];
                                                                        updated[idx].type = e.target.value;
                                                                        setFormData({ ...formData, assets: updated });
                                                                    }}
                                                                >
                                                                    <option value="RETURNABLE">RETURNABLE</option>
                                                                    <option value="NON-RETURNABLE">NON-RETURNABLE</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-4">
                                                                <input
                                                                    className="w-full bg-white border border-slate-100 rounded-lg text-[11px] font-bold p-2 outline-none focus:ring-1 focus:ring-green-500"
                                                                    placeholder="e.g. Repair, Site Visit"
                                                                    value={asset.reason}
                                                                    onChange={(e) => {
                                                                        const updated = [...formData.assets];
                                                                        updated[idx].reason = e.target.value;
                                                                        setFormData({ ...formData, assets: updated });
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeAsset(idx)}
                                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <FaTrash size={12} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Validity Section */}
                            <div className="border border-gray-200 rounded-lg p-5 mt-5 shadow-md">
                                <SectionHeader
                                    title="Pass Validity"
                                    subtitle="Authorization timeframe and location."
                                />

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="">
                                        <label className="inputLabel mb-1">Valid From (Date & Time)</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdDateRange} />
                                            <ReactDatePicker
                                                selected={formData.bearerDetails.validFrom}
                                                onChange={(date) => setFormData({ ...formData, bearerDetails: { ...formData.bearerDetails, validFrom: date } })}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                className="stdInputField w-full pl-12"
                                            />
                                        </div>
                                    </div>
                                    <div className="">
                                        <label className="inputLabel mb-1">Valid To (Estimated Return)</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdMoreTime} />
                                            <ReactDatePicker
                                                selected={formData.bearerDetails.validTo}
                                                onChange={(date) => setFormData({ ...formData, bearerDetails: { ...formData.bearerDetails, validTo: date } })}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                className="stdInputField w-full pl-12"
                                            />
                                        </div>
                                    </div>
                                    <div className="">
                                        <label className="inputLabel mb-1">Gate Location</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdOutlineSecurity} />
                                            <input
                                                type="text"
                                                className="stdInputField w-full pl-12"
                                                placeholder="MAIN GATE - 1"
                                                value={formData.gateLocation}
                                                onChange={(e) => setFormData({ ...formData, gateLocation: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submission Section */}
                            <div className="border border-gray-200 rounded-lg p-5 mt-8 shadow-md">
                                <SectionHeader
                                    title="Final Submission"
                                    subtitle="Compliance registry and manager approval."
                                />

                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div>
                                        <p className="text-gray-400 text-[11px] leading-relaxed font-semibold uppercase tracking-wider">
                                            By issuing this pass, the asset status will be monitored for movement. Manager approval is required before security clearance.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-end gap-3">
                                            {editId && (userDetails?.roles?.includes("account-manager") ||
                                                userDetails?.roles?.includes("account-admin") ||
                                                userDetails?.roles?.includes("asset-manager") ||
                                                userDetails?.roles?.includes("asset-admin") ||
                                                userDetails?.roles?.includes("admin")) && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={handleReject}
                                                            disabled={loading}
                                                            className="px-6 py-2 border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold rounded-md transition-all active:scale-95 disabled:opacity-50 text-sm"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleApprove}
                                                            disabled={loading}
                                                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-md transition-all active:scale-95 disabled:opacity-50 text-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                    </>
                                                )}
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="formButtons min-w-[150px]"
                                            >
                                                {loading ? <FaSpinner className="animate-spin inline-block mr-2" /> : (editId ? "Update Request" : "Submit Pass")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AddGatePass;
