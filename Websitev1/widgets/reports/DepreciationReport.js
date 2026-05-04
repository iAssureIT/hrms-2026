"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import { FaSpinner } from "react-icons/fa";
import { MdCurrencyRupee, MdTrendingDown, MdAccountBalance, MdPieChart, MdInfo, MdTimeline, MdFilterList, MdDescription, MdDateRange } from "react-icons/md";
import {
    HiBanknotes,
    HiArrowTrendingDown,
    HiCurrencyRupee,
    HiChartBar
} from "react-icons/hi2";
import { Tooltip } from "flowbite-react";
import { MdExpandMore } from "react-icons/md";

import GenericTable from "@/widgets/GenericTable/FilterTable";

const DepreciationReport = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }));
    const [loggedInRole, setLoggedInRole] = useState("");
    const tableRef = useRef(null);

    // Filters
    const [center_id, setCenter_id] = useState("all");
    const [category_id, setCategory_id] = useState("all");

    // Master Data
    const [centerList, setCenterList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);

    // Report Data
    const [metrics, setMetrics] = useState({
        totalOriginalCost: 0,
        totalAccDepr: 0,
        totalCurrentValue: 0,
        totalCurrentPeriodDepr: 0,
        deprRate: 0
    });
    const [tableData, setTableData] = useState([]);
    const [recsPerPage, setRecsPerPage] = useState(10);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalRecs, setTotalRecs] = useState(0);
    const [numOfPages, setNumOfPages] = useState([1]);
    const [searchText, setSearchText] = useState("-");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [runCount, setRunCount] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    const tableHeading = {
        assetIDLink: "Asset ID",
        assetName: "Asset Name",
        category: "Category",
        originalCost: "Original Cost (₹)",
        annualDepr: "Annual Depreciation (₹)",
        accDepr: "Accumulated Depreciation (₹)",
        netBookValue: "Current Value (₹)"
    };

    const excelHeading = {
        assetID: "Asset ID",
        assetName: "Asset Name",
        category: "Category",
        originalCost: "Original Cost",
        annualDepr: "Annual Depr",
        accDepr: "Acc. Depr",
        netBookValue: "Current Value"
    };

    const tableObjects = {
        getListMethod: "post",
        apiURL: "/api/reports/get/depreciation-report",
        titleMsg: "DepreciationReport",
        searchApply: true,
        downloadApply: true,
        tableType: "report"
    };

    useEffect(() => {
        if (pathname.includes("admin")) {
            setLoggedInRole("admin");
            setCenter_id("all");
        } else if (pathname.includes("center")) {
            setLoggedInRole("center");
            setCenter_id(userDetails?.center_id);
        } else {
            setLoggedInRole("executive");
            setCenter_id("all");
        }

        fetchCenters();
        fetchCategories();
    }, []);

    const fetchCenters = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`);
            setCenterList(res.data || []);
        } catch (err) {
            console.error("Error fetching centers:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-category/get`);
            setCategoryList(res.data || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const getData = async () => {
        setLoading(true);
        try {
            const formValues = {
                center_ID: center_id,
                category_id: category_id,
                pageNumber: pageNumber,
                recsPerPage: recsPerPage,
                searchText: searchText
            };
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reports/get/depreciation-report`, formValues);
            if (response.data.success) {
                const transformed = response.data.tableData.map(item => {
                    if (item.assetID === "TOTALS") return item;
                    // Using HTML string because GenericTable uses dangerouslySetInnerHTML
                    return {
                        ...item,
                        assetIDLink: `<span class="asset-id-link text-[#3c8dbc] font-bold cursor-pointer hover:underline" data-id="${item._id}">${item.assetID}</span>`
                    };
                });
                setTableData(transformed);
                setTotalRecs(response.data.totalRecs);
                setMetrics(response.data.metrics);
            }
        } catch (error) {
            console.error("Error fetching depreciation report data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Event Delegation for Asset ID clicks
    useEffect(() => {
        const handleTableClick = (e) => {
            const target = e.target.closest(".asset-id-link");
            if (target) {
                const assetId = target.getAttribute("data-id");
                if (assetId) {
                    handleShowDetail(assetId);
                }
            }
        };

        const tableElem = tableRef.current;
        if (tableElem) {
            tableElem.addEventListener("click", handleTableClick);
        }
        return () => {
            if (tableElem) {
                tableElem.removeEventListener("click", handleTableClick);
            }
        };
    }, [tableData]);

    const handleShowDetail = (assetId) => {
        router.push(`${pathname}/view-asset/${assetId}`);
    };

    useEffect(() => {
        getData();
    }, [center_id, category_id, pageNumber, recsPerPage, searchText]);

    const formatToINR = (num) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

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
    className={`flex bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-none md:rounded-sm overflow-hidden h-24 border border-gray-200 ${onClick ? 'cursor-pointer group' : 'cursor-default'} ${isActive ? 'ring-2 ring-[#3c8dbc] ring-inset' : ''}`}
  >
    <div
      style={{ backgroundColor: getStatusColor(colorClass) }}
      className={`w-16 md:w-20 flex items-center justify-center text-white shrink-0 transition-transform duration-500 ${onClick ? 'group-hover:scale-110' : ''}`}
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


    return (
        <section className="section admin-box box-primary">
            <div className="hr-card hr-fade-in">
                <div className="mb-6">
                    <div className="pb-1 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Governance & Finance</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Asset Depreciation <span className="text-[#3c8dbc] font-black">Report</span>
                            </h1>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2">
                        Written Down Value (WDV) method analysis with day-wise precision for real-time asset valuation.
                    </p>
                </div>

                {/* --- METRICS --- */}
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
                    <StatusCard
                        label="Total Gross Block"
                        value={loading ? "..." : formatToINR(metrics.totalOriginalCost)}
                        icon={HiBanknotes}
                        colorClass="bg-yellow"
                        isActive={false}
                    />
                    <StatusCard
                        label="Accumulated Depr"
                        value={loading ? "..." : formatToINR(metrics.totalAccDepr)}
                        icon={HiArrowTrendingDown}
                        colorClass="bg-aqua"
                        isActive={false}
                    />
                    <StatusCard
                        label="Net Book Value (NBV)"
                        value={loading ? "..." : formatToINR(metrics.totalCurrentValue)}
                        icon={HiCurrencyRupee}
                        colorClass="bg-red"
                        isActive={false}
                    />
                    <StatusCard
                        label="Current Period Charge"
                        value={loading ? "..." : formatToINR(metrics.totalCurrentPeriodDepr)}
                        icon={HiChartBar}
                        colorClass="bg-aqua"
                        isActive={false}
                    />
                </div>


                {/* --- UNIFIED REGISTRY & FILTERS --- */}
                <div className="bg-white">
                    <div
                        className="flex items-center gap-4 mb-2 cursor-pointer group select-none"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {/* Collapsible Filters Header */}
                        <div className="flex items-center gap-2 text-slate-800 hover:text-[#3c8dbc] transition-colors">
                            <MdFilterList className={`text-xl ${showFilters ? 'text-[#3c8dbc]' : 'text-slate-600'}`} />
                            <span className="text-[11px] font-bold uppercase tracking-widest"> Show Filters</span>
                        </div>
                        <div className={`flex-1 h-[1px] ${showFilters ? 'bg-[#3c8dbc]/20' : 'bg-slate-100'} group-hover:bg-[#3c8dbc]/30 transition-colors`}></div>
                        <MdExpandMore className={`text-xl transition-all duration-300 ${showFilters ? 'rotate-180 text-[#3c8dbc]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    </div>

                    <div
                        className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100 mb-8 translate-y-0' : 'max-h-0 opacity-0 mb-0 -translate-y-4'
                            }`}
                    >
                        <div className="mb-0 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-2 gap-4 pt-2">
                            {(loggedInRole === "admin" || loggedInRole === "executive") && (
                                <div>
                                    <label className="inputLabel">Center</label>
                                    <div className="relative mt-2">
                                        <select
                                            className="stdSelectField w-full"
                                            value={center_id}
                                            onChange={(e) => { setCenter_id(e.target.value); setPageNumber(1); }}
                                        >
                                            <option value="all">Consolidated (All)</option>
                                            {centerList.map(c => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="inputLabel">Asset Category</label>
                                <div className="relative mt-2">
                                    <select
                                        className="stdSelectField w-full"
                                        value={category_id}
                                        onChange={(e) => { setCategory_id(e.target.value); setPageNumber(1); }}
                                    >
                                        <option value="all">All Enterprise Assets</option>
                                        {categoryList.map(cat => <option key={cat._id} value={cat._id}>{cat.fieldValue}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* <div className="flex items-end pb-1">
                            <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 whitespace-nowrap">
                                Showing Page {pageNumber} of {numOfPages.length}
                            </span>
                        </div> */}
                        </div>
                    </div>

                    <div className="p-0 table-professional" ref={tableRef}>
                        <GenericTable
                            tableObjects={tableObjects}
                            tableHeading={tableHeading}
                            excelHeading={excelHeading}
                            runCount={runCount}
                            setRunCount={setRunCount}
                            recsPerPage={recsPerPage}
                            setRecsPerPage={setRecsPerPage}
                            filterData={{
                                center_ID: center_id,
                                category_id: category_id,
                                searchText: searchText
                            }}
                            getData={getData}
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
                </div>

                {/* --- CALCULATION LOGIC FOOTER --- */}
                <div className="mt-8 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-[#3c8dbc]">
                            <MdInfo size={24} />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest mb-2">Statutory Calculation Statement</h4>
                            <p className="text-slate-500 text-[11px] leading-relaxed max-w-4xl font-medium">
                                <b>WDV Method Accuracy:</b>Written-down value (WDV) is the net book value of an asset after accounting for accumulated depreciation, calculated as Original Cost minus Accumulated Depreciation.
                                Asset valuation is calculated using the reducing balance method based on category-specific rates defined in the Master Data.
                                To ensure daily precision, we apply a daily pro-rata depreciation charge for the current year:
                                <span className="text-slate-800 font-bold mx-1">(Opening NBV × Category Rate) / 365 × Days Elapsed</span>.
                                Reporting is generated in real-time as of {moment().format('DD MMMM YYYY')}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            <style jsx global>{`
                .table-professional .GenericTable .table-container {
                    border: none !important;
                    margin: 0 !important;
                    overflow-x: auto !important;
                }
                .table-professional .GenericTable table thead tr th:first-child,
                .table-professional .GenericTable table tbody tr td:first-child {
                    text-align: center !important;
                    width: 60px !important;
                }
                
                /* Column Alignments */
                .table-professional .GenericTable table thead th,
                .table-professional .GenericTable table tbody td {
                    padding: 16px 24px !important;
                    white-space: nowrap !important;
                }

                /* Asset ID, Name, Category -> Left */
                .table-professional .GenericTable table thead th:nth-child(2),
                .table-professional .GenericTable table tbody td:nth-child(2),
                .table-professional .GenericTable table thead th:nth-child(3),
                .table-professional .GenericTable table tbody td:nth-child(3),
                .table-professional .GenericTable table thead th:nth-child(4),
                .table-professional .GenericTable table tbody td:nth-child(4) {
                    text-align: left !important;
                }

                /* Numerical Columns -> Right */
                .table-professional .GenericTable table thead th:nth-child(5),
                .table-professional .GenericTable table tbody td:nth-child(5),
                .table-professional .GenericTable table thead th:nth-child(6),
                .table-professional .GenericTable table tbody td:nth-child(6),
                .table-professional .GenericTable table thead th:nth-child(7),
                .table-professional .GenericTable table tbody td:nth-child(7),
                .table-professional .GenericTable table thead th:nth-child(8),
                .table-professional .GenericTable table tbody td:nth-child(8) {
                    text-align: right !important;
                }

                .table-professional .GenericTable table thead th {
                    background-color: #f8fafc !important;
                    color: #64748b !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    border-bottom: 2px solid #f1f5f9 !important;
                }
                .table-professional .GenericTable table tbody td {
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    color: #334155 !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }
                .table-professional .GenericTable table tbody tr:last-child {
                    background-color: #f8fafc !important;
                    font-weight: 800 !important;
                }
                .table-professional .GenericTable .pagination-container {
                    padding: 16px 24px !important;
                    border-top: 1px solid #f1f5f9 !important;
                    background: white !important;
                }
                .table-professional .GenericTable section {
                    padding-top: 0 !important;
                    margin-top: 0 !important;
                }
                .table-professional .GenericTable h1 {
                    display: none !important;
                }
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
                    border-color: #3c8dbc;
                    box-shadow: 0 0 0 4px rgba(60, 141, 188, 0.05);
                }
                .inputLabel {
                    font-size: 10px;
                    font-weight: 800;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 8px;
                    display: block;
                }
            `}</style>
        </section>
    );
};

export default DepreciationReport;
