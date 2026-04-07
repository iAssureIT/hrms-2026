"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import {
    MdOutlineMoveToInbox,
    MdOutlineTransferWithinAStation,
    MdAssignmentTurnedIn,
    MdOutlineFactCheck,
    MdSearch,
    MdFilterList,
    MdFileDownload,
    MdMoreVert,
    MdChevronRight,
    MdAccessTime,
    MdPriorityHigh,
    MdTrendingUp,
    MdDoneAll,
    MdClose,
    MdInfoOutline,
    MdHistory
} from "react-icons/md";
import { FaFileUpload, FaUserCircle } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import ls from "localstorage-slim";
import * as XLSX from "xlsx";
import moment from "moment";

const MetricCard = ({ title, value, icon: Icon, iconColor, iconBg, onClick, isActive, tooltip }) => (
    <div className="w-full">
        <Tooltip content={tooltip} placement="top" arrow={false} trigger="hover" className="bg-green">
            <div
                onClick={onClick}
                className={`w-full cursor-pointer rounded-xl p-5 shadow-sm border-2 transition-all duration-300 flex items-center justify-between group min-h-[115px] h-full
        ${isActive
                        ? 'border-[#50c878] bg-[#50c878]/5 shadow-md transform -translate-y-1'
                        : 'bg-white border-gray-100 hover:border-[#50c878]/30 hover:shadow-lg hover:-translate-y-1'}`}
            >
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-gray-500">{title}</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
                </div>
                <div className={`p-3 rounded-full ${iconBg} ${iconColor} transition-transform duration-300 group-hover:scale-110 ml-4`}>
                    <Icon size={24} />
                </div>
            </div>
        </Tooltip>
    </div>
);

const AllocationApproval = () => {
    const router = useRouter();
    const [loggedInRole, setLoggedInRole] = useState("admin");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Autocomplete Search State
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const getStatusPlain = (status) => {
        if (!status) return "";
        const plain = status.replace(/<[^>]*>/g, '').split(" - ")[0].trim();
        // Capitalize first letter to match our filter labels
        return plain.charAt(0).toUpperCase() + plain.slice(1).toLowerCase();
    };

    // Master Data State
    const [centerList, setCenterList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [subDepartmentList, setSubDepartmentList] = useState([]);

    // Filter State
    const [centerFilter, setCenterFilter] = useState("all");
    const [deptFilter, setDeptFilter] = useState("all");
    const [subDeptFilter, setSubDeptFilter] = useState("all");
    const [activeStatusFilter, setActiveStatusFilter] = useState("Pending");

    useEffect(() => {
        const role = ls.get("role") || "admin";
        setLoggedInRole(role);
        getCenterList();
        getDepartmentList();
    }, []);

    // ... (keep center/dept fetching same)

    // ── Master Data Fetching ──
    const getCenterList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
            .then(res => setCenterList(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Error fetching centers:", err));
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

    // ── Search Logic (Autocomplete) ──
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery.length > 1) {
                handleAutocompleteSearch(searchQuery);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const handleAutocompleteSearch = async (text) => {
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
            }
        } catch (error) {
            console.error("Autocomplete search error:", error);
        } finally {
            setLoadingSearch(false);
        }
    };

    const selectSuggestion = (asset) => {
        setSearchQuery(asset.assetID);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleDeptChange = (e) => {
        const value = e.target.value;
        setDeptFilter(value);
        setSubDeptFilter("all");
        if (value !== "all") {
            getSubDepartmentList(value);
        } else {
            setSubDepartmentList([]);
        }
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        const tableHeading = {
            id: "Asset Id",
            asset: "Asset Name",
            recipient: "Recipient",
            source: "Department",
            target: "Center",
            priority: "Priority"
        };
        const worksheetData = [Object.values(tableHeading)];

        filteredRequests.forEach((row) => {
            const rowData = Object.keys(tableHeading).map((key) => row[key]);
            worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Approvals");
        XLSX.writeFile(workbook, "Allocation_Approvals_List.xlsx");
    };

    const [requests, setRequests] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [centerFilter, deptFilter, subDeptFilter]);

    const fetchRequests = async () => {
        setLoadingData(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-allocation/get`);
            if (response.data) {
                const mappedData = response.data.map(item => {
                    const empName = item.employee && item.employee.length > 0 ? item.employee[0].name : "-";
                    const empEmail = item.employee && item.employee.length > 0 ? item.employee[0].email : "-";
                    const empMobile = item.employee && item.employee.length > 0 ? item.employee[0].mobile : "-";

                    return {
                        ...item,
                        employeeName: empName,
                        employeeEmail: empEmail,
                        employeeMobile: empMobile,
                        employeeDetails: `<b>${empName}</b><br/><span style="font-size: 10px; color: #666;">${empEmail}</span><br/><span style="font-size: 10px; color: #666;">${empMobile}</span>`,
                        departmentName: item.department,
                        centerName: item.center,
                        status: item.allocationApprovalStatus === "PENDING" ? "Pending" :
                            item.allocationApprovalStatus === "APPROVED" ? "Active" :
                                item.allocationApprovalStatus === "REJECTED" ? "Rejected" : "Closed"
                    };
                });
                setRequests(mappedData.filter(r => r.allocationType === "ALLOCATE" && r.allocationApprovalStatus !== "CLOSED"));
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleAction = async (status, remarks) => {
        if (!selectedRequest) return;
        setLoadingSearch(true);
        const endpoint = (status === "Active" || status === "APPROVED") ? "approve" : "reject";
        const backendStatus = (status === "Active" || status === "APPROVED") ? "APPROVED" : "REJECTED";
        try {
            const userDetails = ls.get("userDetails", { decrypt: true }) || {};
            const user_id = userDetails.user_id || userDetails._id;

            const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-allocation/patch/${endpoint}/${selectedRequest._id}`, {
                remarks,
                status: backendStatus,
                approvedBy: user_id,
                type: "allocation"
            });
            if (res.data.success) {
                Swal.fire("Success!", `Asset allocation ${status === "Active" ? "Approved" : "Rejected"} successfully.`, "success");
                setSelectedRequest(null);
                fetchRequests();
            }
        } catch (error) {
            console.error("Action error:", error);
            Swal.fire("Error!", error.response?.data?.message || "Something went wrong.", "error");
        } finally {
            setLoadingSearch(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = searchQuery.length > 0
            ? (req.assetID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (req.employeeName && req.employeeName.toLowerCase().includes(searchQuery.toLowerCase())))
            : true;
        const matchesStatus = activeStatusFilter === "all" || getStatusPlain(req.status) === activeStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const updateInlineStatus = async (reqId, newStatus) => {
        try {
            const endpoint = newStatus === "Active" ? "approve" : (newStatus === "Rejected" ? "reject" : "status");
            const backendStatus = newStatus === "Active" ? "APPROVED" : (newStatus === "Rejected" ? "REJECTED" : "PENDING");

            const userDetails = ls.get("userDetails", { decrypt: true }) || {};
            const user_id = userDetails.user_id || userDetails._id;

            const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-allocation/patch/${endpoint}/${reqId}`, {
                status: backendStatus,
                approvedBy: user_id,
                type: "allocation"
            });
            if (res.data.success) {
                setRequests(prev => prev.map(r => r._id === reqId ? { ...r, status: newStatus } : r));
                if (selectedRequest?._id === reqId) {
                    setSelectedRequest(prev => ({ ...prev, status: newStatus }));
                }
                setTimeout(() => fetchRequests(), 1000);
            }
        } catch (error) {
            console.error("Inline status update error:", error);
            Swal.fire("Error!", "Failed to update status.", "error");
        }
    };

    useEffect(() => {
        // No auto-selection on request change
    }, [filteredRequests]);

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md bg-white">
                {/* ── Page Header ── */}
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300 flex justify-between">
                        <div className="flex flex-col px-10 py-5">
                            <h1 className="heading h-auto content-center p-0">Allocation Approval</h1>
                        </div>
                        <div className="flex gap-3 my-5 me-10">
                            <Tooltip content="Asset List" placement="bottom" className="bg-green" arrow={false}>
                                <CiViewList
                                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                    onClick={() => router.push(`/${loggedInRole}/asset-management`)}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-8">
                    <p className="text-[13px] text-gray-500 mb-6">Review and approve physical asset transfers between departments.</p>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* ── Main Content (Stats + Table) ── */}
                        <div className="xl:col-span-12 space-y-6">

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <MetricCard
                                    title="Total Requests"
                                    value={requests.length}
                                    icon={MdOutlineMoveToInbox}
                                    iconColor="text-green"
                                    iconBg="bg-green/10"
                                    onClick={() => setActiveStatusFilter("all")}
                                    isActive={activeStatusFilter === "all"}
                                    tooltip="View Total Requests"
                                />
                                <MetricCard
                                    title="Pending"
                                    value={requests.filter(r => getStatusPlain(r.status) === 'Pending').length}
                                    icon={MdAccessTime}
                                    iconColor="text-green"
                                    iconBg="bg-green/10"
                                    onClick={() => setActiveStatusFilter("Pending")}
                                    isActive={activeStatusFilter === "Pending"}
                                    tooltip="View Pending Requests"
                                />
                                <MetricCard
                                    title="Active"
                                    value={requests.filter(r => getStatusPlain(r.status) === 'Active').length}
                                    icon={MdTrendingUp}
                                    iconColor="text-green"
                                    iconBg="bg-green/10"
                                    onClick={() => setActiveStatusFilter("Active")}
                                    isActive={activeStatusFilter === "Active"}
                                    tooltip="View Active Requests"
                                />
                                <MetricCard
                                    title="Rejected"
                                    value={requests.filter(r => getStatusPlain(r.status) === 'Rejected').length}
                                    icon={MdClose}
                                    iconColor="text-green"
                                    iconBg="bg-green/10"
                                    onClick={() => setActiveStatusFilter("Rejected")}
                                    isActive={activeStatusFilter === "Rejected"}
                                    tooltip="View Rejected Requests"
                                />
                            </div>

                            {/* Filters Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/10 p-5 rounded-xl border border-gray-100 shadow-sm">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Center</label>
                                    <select
                                        className="stdSelectField w-full"
                                        value={centerFilter}
                                        onChange={(e) => setCenterFilter(e.target.value)}
                                    >
                                        <option value="all">All Centers</option>
                                        {centerList.map(c => (
                                            <option key={c._id} value={c.centerName}>{c.centerName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Department</label>
                                    <select
                                        className="stdSelectField w-full"
                                        value={deptFilter}
                                        onChange={handleDeptChange}
                                    >
                                        <option value="all">All Departments</option>
                                        {departmentList.map(d => (
                                            <option key={d._id} value={d._id}>{d.fieldValue}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Sub-Department</label>
                                    <select
                                        className="stdSelectField w-full"
                                        value={subDeptFilter}
                                        onChange={(e) => setSubDeptFilter(e.target.value)}
                                        disabled={deptFilter === "all"}
                                    >
                                        <option value="all">All Sub-Departments</option>
                                        {subDepartmentList.map(s => (
                                            <option key={s._id} value={s._id}>{s.inputValue}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Table Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
                                <div className="relative flex-1 min-w-[300px]">
                                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                                    <input
                                        type="text"
                                        placeholder="Search by ID, Asset or Recipient..."
                                        className="stdInputField py-2 pl-12 pr-4 w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {suggestions.map((asset) => (
                                                <div
                                                    key={asset._id}
                                                    className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center transition-colors"
                                                    onClick={() => selectSuggestion(asset)}
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
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={exportToExcel}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                                    >
                                        <MdFileDownload /> Export List
                                    </button>
                                </div>
                            </div>

                            {/* Request Table */}
                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                <div className="max-h-[500px] overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100 sticky top-0 bg-white z-10">
                                            <tr>
                                                <th className="px-6 py-4">Asset Name</th>
                                                <th className="px-6 py-4">Recipient</th>
                                                <th className="px-6 py-4">Department</th>
                                                <th className="px-6 py-4">Center</th>
                                                <th className="px-6 py-4 text-center">Status Toggle</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[13px] divide-y divide-gray-50">
                                            {filteredRequests.map((req) => (
                                                <tr
                                                    key={req._id}
                                                    className="hover:bg-blue-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                                                <MdOutlineTransferWithinAStation />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{req.assetName}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div
                                                            className="text-gray-700"
                                                            dangerouslySetInnerHTML={{ __html: req.employeeDetails }}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 font-medium">{req.departmentName}</td>
                                                    <td className="px-6 py-4 text-gray-600 font-medium">{req.centerName}</td>
                                                    <td className="px-6 py-4 flex justify-center mt-2">
                                                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full w-fit">
                                                            {["Pending", "Active", "Rejected"].map((s) => (
                                                                <button
                                                                    key={s}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateInlineStatus(req._id, s);
                                                                    }}
                                                                    className={`w-16 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all ${getStatusPlain(req.status) === s ? (s === "Pending" ? "bg-yellow-400 text-white" : s === "Active" ? "bg-green-500 text-white" : "bg-red-500 text-white") : "text-gray-400 hover:text-gray-600"}`}
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300">
                                                        <MdChevronRight className="text-2xl" />
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredRequests.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400 italic">
                                                        No requests found matching the current filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 text-[11px] font-bold text-gray-400 text-center uppercase tracking-widest">
                                    {filteredRequests.length} requests displayed
                                </div>
                            </div>

                            {/* Bottom Context Blocks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                                        <MdDoneAll size={20} />
                                        <h3 className="text-xs font-bold uppercase tracking-widest">Approval Protocol</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {[
                                            "Verify destination center capacity for the asset.",
                                            "Ensure recipient employee has relevant authorizations.",
                                            "A gate pass will be automatically generated upon approval."
                                        ].map((text, i) => (
                                            <li key={i} className="flex gap-2 text-[12px] text-blue-800">
                                                <span className="text-blue-400">•</span> {text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
                                    <div className="flex items-center gap-2 text-gray-400 mb-4 self-start">
                                        <MdHistory size={20} />
                                        <h3 className="text-xs font-bold uppercase tracking-widest">Audit History</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                        <MdAssignmentTurnedIn className="text-gray-200 text-2xl" />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium max-w-[150px]">Select a request to view its previous movement history.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default AllocationApproval;
