"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import { FaSpinner, FaPlus, FaSearch } from "react-icons/fa";
import { MdCallMade, MdCallReceived, MdHistory, MdWatchLater, MdDescription, MdFilterList, MdExpandMore } from "react-icons/md";
import {
    HiTicket,
    HiClock,
    HiXCircle,
    HiArrowPath
} from "react-icons/hi2";
import { BsPlusSquare } from "react-icons/bs";
import { Tooltip } from "flowbite-react";

import GenericTable from "@/widgets/GenericTable/FilterTable";

const getStatusColor = (colorClass) => {
    const colors = {
        'bg-aqua': '#00c0ef',
        'bg-green': '#00a65a',
        'bg-red': '#dd4b39',
        'bg-yellow': '#f39c12'
    };
    return colors[colorClass] || colors['bg-aqua'];
};

const StatusCard = ({ label, value, icon: Icon, colorClass, onClick, isActive }) => (
    <div
        onClick={onClick}
        className={`flex bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-none md:rounded-sm overflow-hidden h-24 border border-gray-200 cursor-pointer group ${isActive ? 'ring-2 ring-[#3c8dbc] ring-inset' : ''}`}
    >
        <div
            style={{ backgroundColor: getStatusColor(colorClass) }}
            className="w-16 md:w-20 flex items-center justify-center text-white shrink-0 transition-transform duration-500 group-hover:scale-110"
        >
            <Icon size={32} className="text-white opacity-90" />
        </div>
        <div className="flex flex-col justify-center px-3 py-2 flex-grow overflow-hidden relative">
            <span className="text-gray-500 text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-1 line-clamp-2 leading-snug whitespace-normal break-normal">
                {label}
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-800 leading-none">
                {value}
            </h3>
            {isActive && (
                <div className="absolute top-2 right-2">
                    <div className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3c8dbc] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3c8dbc]"></span>
                    </div>
                </div>
            )}
        </div>
    </div>
);


const GatePassManagement = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [loggedInRole, setLoggedInRole] = useState("");
    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }));

    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState([]);
    const [recsPerPage, setRecsPerPage] = useState(10);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalRecs, setTotalRecs] = useState(0);
    const [numOfPages, setNumOfPages] = useState([1]);
    const [searchText, setSearchText] = useState("-");
    const [search, setSearch] = useState("");
    const [runCount, setRunCount] = useState(0);

    const [center_id, setCenter_id] = useState("all");
    const [activeStatusFilter, setActiveStatusFilter] = useState("all");
    const [counts, setCounts] = useState({
        activePasses: 0,
        pendingApprovals: 0,
        returnedToday: 0,
        rejectedPasses: 0
    });
    const [showFilters, setShowFilters] = useState(false);

    const tableHeading = {
        passNo: "Pass No.",
        assetDescription: "Asset Description",
        purpose: "Purpose",
        dates: "Dates (OUT / EXP)",
        status: "Status"
    };

    const excelHeading = {
        passNo: "Pass No.",
        "assets.0.assetName": "Asset Name",
        "assets.0.assetID": "Asset ID",
        remarks: "Purpose/Remarks",
        "bearerDetails.validFrom": "Valid From",
        "bearerDetails.validTo": "Valid To",
        status: "Status"
    };

    const tableObjects = {
        apiURL: "/api/gate-pass",
        searchApply: true,
        downloadApply: true,
        formURL: `/${loggedInRole}/management/add-gate-pass`,
    };

    useEffect(() => {
        if (pathname.includes("admin")) {
            setLoggedInRole("admin");
        } else if (pathname.includes("center")) {
            setLoggedInRole("center");
            setCenter_id(userDetails?.center_id || "all");
        } else if (pathname.includes("asset")) {
            setLoggedInRole("asset");
            setCenter_id("all");
        } else if (pathname.includes("account")) {
            setLoggedInRole("account");
            setCenter_id("all");
        } else {
            setLoggedInRole("executive");
        }
    }, [pathname, userDetails]);

    const getMetrics = async () => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gate-pass/get/metrics`, {
                center_id: center_id
            });
            if (res.data.success) {
                setCounts(res.data.metrics);
            }
        } catch (error) {
            console.error("Error fetching metrics:", error);
        }
    };

    const getData = async () => {
        setLoading(true);
        try {
            const formValues = {
                center_id: center_id,
                status: activeStatusFilter,
                searchText: searchText,
                pageNumber: pageNumber,
                recsPerPage: recsPerPage
            };
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gate-pass/get/list`, formValues);
            if (res.data.success) {
                const transformed = res.data.tableData.map(pass => ({
                    _id: pass._id,
                    passNo: `
                        <a 
                            href="/${loggedInRole || pathname.split("/")[1]}/management/${(pass.status === "Pending" && !(userDetails?.roles?.includes("fa-accounts"))) ? "add-gate-pass?editId=" : "print-gate-pass/"}${pass._id}"
                            class="font-black text-green-600 hover:text-blue-800 cursor-pointer transition-all hover:underline"
                        >
                            ${pass.passNo}
                        </a>
                    `,
                    assetDescription: `
                        <div class="flex flex-col">
                            <span class="font-bold text-gray-700">${pass.assets?.[0]?.assetName || "Multi Assets"}</span>
                            <span class="text-[10px] text-gray-400 font-medium tracking-tight">ID: ${pass.assets?.[0]?.assetID || "VARIOUS"}</span>
                        </div>
                    `,
                    purpose: `<span class="italic text-gray-600">"${pass.remarks || 'General Movement'}"</span>`,
                    dates: `
                        <div class="flex flex-col text-[11px]">
                            <span class="text-gray-500 uppercase font-black tracking-tighter">OUT: ${moment(pass.bearerDetails?.validFrom).format("DD-MMM-YY")}</span>
                            <span class="text-red-500 uppercase font-black tracking-tighter">EXP: ${moment(pass.bearerDetails?.validTo).format("DD-MMM-YY")}</span>
                        </div>
                    `,
                    status: (() => {
                        let statusColor = "";
                        switch (pass.status) {
                            case "Pending":
                                statusColor = "bg-amber-500 text-white border-amber-600";
                                break;
                            case "Approved":
                            case "Active":
                                statusColor = "bg-green-600 text-white border-green-700";
                                break;
                            case "Returned":
                                statusColor = "bg-green-600 text-white border-green-700";
                                break;
                            case "Rejected":
                            case "Cancelled":
                                statusColor = "bg-red-600 text-white border-red-700";
                                break;
                            default:
                                statusColor = "bg-slate-500 text-white border-slate-600";
                        }
                        return `<span class="inline-block text-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-tight border shadow-sm ${statusColor} min-w-[70px] leading-tight">${pass.status}</span>`;
                    })()
                }));
                setTableData(transformed);
                setTotalRecs(res.data.totalRecs);
            }
        } catch (error) {
            console.error("Error fetching gate pass data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMetrics();
        getData();
    }, [center_id, activeStatusFilter, pageNumber, recsPerPage, searchText]);

    return (
        <section className="section admin-box box-primary">
            <div className="hr-card hr-fade-in">
                <div className="mb-6">
                    <div className="pb-1 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Operations Management</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Gate Pass <span className="text-[#3c8dbc] font-black">Control</span>
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-4 me-10 md:pt-0 mb-1">
                            {!(userDetails?.roles?.includes("fa-accounts")) && (
                                <Tooltip
                                    content="Issue New Gate Pass"
                                    placement="bottom"
                                    className="bg-green"
                                    arrow={false}
                                >
                                    <BsPlusSquare
                                        className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                        onClick={() => router.push(`${pathname.split('/management')[0]}/management/add-gate-pass`)}
                                    />
                                </Tooltip>
                            )}
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2">
                        Comprehensive tracking and authorization of asset movements across enterprise boundaries.
                    </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatusCard
                        label="Active Passes"
                        value={counts.activePasses}
                        icon={HiTicket}
                        colorClass="bg-yellow"
                        onClick={() => {
                            setActiveStatusFilter("all");
                            setPageNumber(1);
                        }}
                        isActive={activeStatusFilter === "all"}
                    />
                    <StatusCard
                        label="Pending Approvals"
                        value={counts.pendingApprovals}
                        icon={HiClock}
                        colorClass="bg-aqua"
                        onClick={() => {
                            setActiveStatusFilter("Pending");
                            setPageNumber(1);
                        }}
                        isActive={activeStatusFilter === "Pending"}
                    />
                    <StatusCard
                        label="Rejected Passes"
                        value={counts.rejectedPasses}
                        icon={HiXCircle}
                        colorClass="bg-red"
                        onClick={() => {
                            setActiveStatusFilter("Rejected");
                            setPageNumber(1);
                        }}
                        isActive={activeStatusFilter === "Rejected"}
                    />
                    <StatusCard
                        label="Returned Today"
                        value={counts.returnedToday}
                        icon={HiArrowPath}
                        colorClass="bg-green"
                        onClick={() => {
                            setActiveStatusFilter("Returned");
                            setPageNumber(1);
                        }}
                        isActive={activeStatusFilter === "Returned"}
                    />
                </div>


                <div className="bg-white">
                    <div
                        className="flex items-center gap-4 mb-2 cursor-pointer group select-none"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="flex items-center gap-2 text-slate-800 hover:text-green-600 transition-colors">
                            <MdFilterList className={`text-xl ${showFilters ? 'text-green-600' : 'text-slate-600'}`} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Show Filters</span>
                        </div>
                        <div className={`flex-1 h-[1px] ${showFilters ? 'bg-green-600/20' : 'bg-slate-100'} group-hover:bg-green-600/30 transition-colors`}></div>
                        <MdExpandMore className={`text-xl transition-all duration-300 ${showFilters ? 'rotate-180 text-green-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    </div>

                    <div
                        className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100 mb-8 translate-y-0' : 'max-h-0 opacity-0 mb-0 -translate-y-4'
                            }`}
                    >
                        <div className="mb-0 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 pt-2 items-end">
                            {/* <div className="lg:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Search Gate Passes
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="stdSelectField w-full"
                                        placeholder="Search by Pass No, Asset Name, Asset ID..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setSearchText(e.target.value || "-");
                                            setPageNumber(1);
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                        <FaSearch size={14} />
                                    </div>
                                </div>
                            </div> */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Status Filter
                                </label>
                                <div className="relative">
                                    <select
                                        className="stdSelectField w-full"
                                        value={activeStatusFilter}
                                        onChange={(e) => {
                                            setActiveStatusFilter(e.target.value);
                                            setPageNumber(1);
                                        }}
                                    >
                                        <option value="all">All Passes</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Returned">Returned</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-0 table-professional">
                        <GenericTable
                            tableObjects={tableObjects}
                            tableHeading={tableHeading}
                            excelHeading={excelHeading}
                            runCount={runCount}
                            setRunCount={setRunCount}
                            recsPerPage={recsPerPage}
                            setRecsPerPage={setRecsPerPage}
                            getData={getData}
                            filterData={{
                                center_id: center_id,
                                status: activeStatusFilter,
                                searchText: searchText,
                            }}
                            tableData={tableData}
                            setTableData={setTableData}
                            numOfPages={numOfPages}
                            setNumOfPages={setNumOfPages}
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            searchText={searchText}
                            setSearchText={setSearchText}
                            totalRecs={totalRecs}
                            setTotalRecs={setTotalRecs}
                            search={search}
                            setSearch={setSearch}
                            loading={loading}
                        />
                    </div>

                    <style jsx global>{`
                        .stdSelectField {
                            height: 40px;
                            border: 1px solid #e2e8f0;
                            background: white;
                            border-radius: 12px;
                            width: 100%;
                            padding: 0 16px;
                            font-size: 12px;
                            font-weight: 600;
                            outline: none;
                            transition: all 0.2s;
                        }
                        .stdSelectField:focus {
                            border-color: #10b981;
                            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.05);
                        }
                        .table-professional .GenericTable section {
                            padding-top: 0 !important;
                            margin-top: 0 !important;
                        }
                        .table-professional .GenericTable h1 {
                            display: none !important;
                        }
                        .table-professional .GenericTable table thead tr th {
                            background-color: #f8fafc !important;
                            color: #64748b !important;
                            font-size: 10px !important;
                            font-weight: 800 !important;
                            text-transform: uppercase !important;
                            letter-spacing: 0.1em !important;
                            padding: 16px 24px !important;
                        }
                        .table-professional .GenericTable table tbody tr td {
                            padding: 16px 24px !important;
                            font-size: 13px !important;
                            color: #334155 !important;
                        }
                    `}</style>
                </div>
            </div>
        </section>
    );
};

export default GatePassManagement;
