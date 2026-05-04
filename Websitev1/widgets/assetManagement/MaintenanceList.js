"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Tooltip } from "flowbite-react";
import GenericTable from "@/widgets/GenericTable/FilterTable";
import {
  FaFileUpload,
  FaSpinner,
  FaTools,
  FaListUl,
  FaPlusSquare,
  FaSearch
} from "react-icons/fa";
import {
  BsPlusSquare,
  BsHandThumbsUp,
  BsTools,
  BsAwardFill,
} from "react-icons/bs";
import { CiViewList } from "react-icons/ci";
import { usePathname } from "next/navigation";
import moment from "moment";
import dynamic from "next/dynamic";
import { MdOutlineFactCheck } from "react-icons/md";
const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default || mod),
  {
    ssr: false,
    loading: () => <div className="h-10 w-full animate-pulse bg-slate-50 rounded-xl border border-slate-100" />
  }
);
import "react-datepicker/dist/react-datepicker.css";
import {
  MdCalendarToday,
  MdAttachMoney,
  MdAssignmentTurnedIn,
  MdOutlineDescription,
  MdFilterList,
  MdExpandMore,
} from "react-icons/md";
import {
  HiWrenchScrewdriver,
  HiClock,
  HiCheckBadge,
  HiCurrencyRupee
} from "react-icons/hi2";
import { FiDollarSign } from "react-icons/fi";
import { AiOutlineFileText } from "react-icons/ai";
import ls from "localstorage-slim";

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
    className={`flex bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-none md:rounded-sm overflow-hidden h-24 border border-gray-200 cursor-pointer group ${isActive ? 'ring-2 ring-[#00a65a] ring-inset' : ''}`}
  >
    <div
      style={{ backgroundColor: getStatusColor(colorClass) }}
      className="w-20 md:w-24 flex items-center justify-center text-white shrink-0 transition-transform duration-500 group-hover:scale-110"
    >
      <Icon size={36} className="text-white opacity-90" />
    </div>
    <div className="flex flex-col justify-center px-4 py-2 flex-grow overflow-hidden relative">
      <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1 line-clamp-2 leading-snug whitespace-normal break-words">
        {label}
      </span>
      <h3 className="text-2xl font-extrabold text-gray-800 leading-none">
        {value}
      </h3>
      {isActive && (
        <div className="absolute top-2 right-2">
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00a65a] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00a65a]"></span>
          </div>
        </div>
      )}
    </div>
  </div>
);


function MaintenanceList() {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true }),
  );

  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState(0);
  const [search, setSearch] = useState("");
  const [runCount, setRunCount] = useState(0);

  const [center_id, setCenter_id] = useState("all");
  const [department_id, setDepartment_id] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("all");
  const [toDate, setToDate] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [counts, setCounts] = useState({
    activeMaintenance: 0,
    awaitingApproval: 0,
    totalCostMTD: 0,
    amcCompliance: 0,
  });

  const router = useRouter();

  const tableHeading = {
    actions: "Actions",
    maintenanceID: "Maint. ID",
    assetDetails: "Asset ID / Name",
    issueType: "Issue Description",
    reportedDateFormatted: "Reported Date",
    isAMCFormatted: "AMC Covered",
    status: "Status",
    totalCostFormatted: "Cost",
  };

  const excelHeading = {
    maintenanceID: "Maintenance ID",
    assetID: "Asset ID",
    assetName: "Asset Name",
    "issue.description": "Issue Description",
    "issue.reportedDate": "Reported Date",
    "issue.isAMC": "AMC Covered",
    status: "Status",
    "costs.totalAmount": "Total Cost",
  };

  const tableObjects = React.useMemo(
    () => ({
      // tableName: "assetMaintenance",
      deleteMethod: "delete",
      getListMethod: "post",
      apiURL: "/api/asset-maintenance",
      editURL: "/asset-management/add-maintenance/",
      viewURL: "/asset-management/maintenance-view/",
      downloadApply: true,
      searchApply: true,
      formURL: "/asset-management/add-maintenance",
      formText: "Add Maintenance",
      titleMsg: "Maintenance Management",
    }),
    [],
  );

  useEffect(() => {
    const roles = userDetails?.roles || [];
    const isAssetIncharge = roles.includes("asset-incharge");
    const isAssetAdmin = roles.includes("admin") || roles.includes("asset-admin");

    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
      setCenter_id(userDetails?.center_id || "all");
    } else if (pathname.includes("asset")) {
      setLoggedInRole("asset");
      if (isAssetIncharge && !isAssetAdmin) {
        setCenter_id(userDetails?.center_id || "all");
      }
    } else if (pathname.includes("account")) {
      setLoggedInRole("account");
    } else {
      setLoggedInRole("executive");
    }
  }, [pathname, userDetails]);

  const getData = async () => {
    try {
      setLoading(true);
      const formValues = {
        searchText: searchText,
        pageNumber: pageNumber,
        recsPerPage: recsPerPage,
        center_ID: center_id,
        department_ID: department_id,
        status: activeStatusFilter,
        fromDate: fromDate,
        toDate: toDate,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance/post/list`,
        formValues,
      );

      if (response.data && response.data.tableData) {
        const transformedData = response.data.tableData.map((item) => {
          let statusColor = "";
          switch (item.status) {
            case "COMPLETED":
              statusColor = "bg-green-600 text-white border-green-700";
              break;
            case "IN_PROGRESS":
              statusColor = "bg-green-600 text-white border-green-700";
              break;
            case "SCHEDULED":
              statusColor = "bg-cyan-600 text-white border-cyan-700";
              break;
            case "AWAITING_APPROVAL":
              statusColor = "bg-amber-500 text-white border-amber-600";
              break;
            case "UNDER_OBSERVATION":
              statusColor = "bg-slate-500 text-white border-slate-600";
              break;
            case "REJECTED":
              statusColor = "bg-red-600 text-white border-red-700";
              break;
            default:
              statusColor = "bg-gray-500 text-white border-gray-600";
          }

          return {
            ...item,
            maintenanceID: `${item.maintenanceID}`,
            assetDetails: `<b>${item.assetID || "-NA-"}</b><br/><span style="font-size: 11px; color: #666;">${item.assetName || "-NA-"}</span>`,
            issueType: item.issue?.description || "-NA-",
            reportedDateFormatted: item.issue?.reportedDate
              ? moment(item.issue.reportedDate).format("DD MMM, yyyy")
              : "-NA-",
            isAMCFormatted: item.issue?.isAMC ? "Yes" : "No",
            totalCostFormatted: `₹ ${item.costs?.totalAmount?.toLocaleString() || 0}`,
            status: `<span class="inline-block text-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-tight border shadow-sm ${statusColor} min-w-[70px] leading-tight">${item.status?.replace(/_/g, " ")}</span>`,
          };
        });

        if (response.data.totalCost !== undefined && transformedData.length > 0) {
          transformedData.push({
            maintenanceID: "Total",
            assetDetails: "",
            issueType: "",
            reportedDateFormatted: "",
            isAMCFormatted: "",
            status: "",
            totalCostFormatted: `<b>₹ ${response.data.totalCost?.toLocaleString() || 0}</b>`,
            centerName: "Total", // To hide serial number and actions in GenericTable
          });
        }

        setTableData(transformedData);
        setTotalRecs(response.data.totalRecs);
      } else {
        setTableData([]);
        setTotalRecs(0);
      }
    } catch (error) {
      console.error("Error fetching maintenance data:", error);
      setTableData([]);
      setTotalRecs(0);
    } finally {
      setLoading(false);
    }
  };

  const getCounts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance/get/dashboard/counts`,
      );
      if (res.data && res.data.success) {
        setCounts(res.data);
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    getData();
    getCounts();
  }, [
    center_id,
    department_id,
    activeStatusFilter,
    fromDate,
    toDate,
    pageNumber,
    recsPerPage,
    runCount,
    searchText,
  ]);

  return (
    <section className="section admin-box box-primary">
      <div className="hr-card hr-fade-in">
        <div className="mb-6">
          <div className="pb-1 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Asset Operations</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Maintenance{" "}
                <span className="text-[#3c8dbc] font-black">Management</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 me-10 md:pt-0 mb-1">

              {!(userDetails?.roles?.includes("fa-accounts")) && (
                <Tooltip
                  content="Add Maintenance"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  <BsPlusSquare
                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      router.push(`/${loggedInRole}/asset-management/add-maintenance`);
                    }}
                  />
                </Tooltip>
              )}
              {(userDetails?.roles?.includes("account-manager") ||
                userDetails?.roles?.includes("account-admin") ||
                userDetails?.roles?.includes("asset-manager") ||
                userDetails?.roles?.includes("asset-admin") ||
                userDetails?.roles?.includes("admin")) && (
                  <Tooltip
                    content="Maintenance Approval"
                    placement="bottom"
                    className="bg-green"
                    arrow={false}
                  >
                    <MdOutlineFactCheck
                      className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                      onClick={() => {
                        router.push(
                          `/${loggedInRole}/asset-management/maintenance-approval`,
                        );
                      }}
                    />
                  </Tooltip>
                )}
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2">
            Track and manage asset maintenance records, schedules, and
            compliance diagnostics across the organization.
          </p>
        </div>
        <div className="px-0 py-2">
          {/* Dashboard Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatusCard
              label="Active Maintenance"
              value={counts.activeMaintenance}
              icon={HiWrenchScrewdriver}
              colorClass="bg-yellow"
              onClick={() => {
                setActiveStatusFilter("IN_PROGRESS");
                setPageNumber(1);
              }}
              isActive={activeStatusFilter === "IN_PROGRESS"}
            />
            <StatusCard
              label="Awaiting Approval"
              value={counts.awaitingApproval}
              icon={HiClock}
              colorClass="bg-aqua"
              onClick={() => {
                setActiveStatusFilter("AWAITING_APPROVAL");
                setPageNumber(1);
              }}
              isActive={activeStatusFilter === "AWAITING_APPROVAL"}
            />
            <StatusCard
              label="Total Cost (MTD)"
              value={`₹ ${counts.totalCostMTD?.toLocaleString() || 0}`}
              icon={HiCurrencyRupee}
              colorClass="bg-red"
              isActive={false}
            />
            <StatusCard
              label="AMC Compliance"
              value={`${counts.amcCompliance}%`}
              icon={HiCheckBadge}
              colorClass="bg-aqua"
              isActive={false}
            />
          </div>


          {/* Filters Section */}
          <div
            className="flex items-center gap-4 mb-2 cursor-pointer group select-none"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-2 text-slate-800 hover:text-green-600 transition-colors">
              <MdFilterList className={`text-xl ${showFilters ? 'text-green-600' : 'text-slate-600'}`} />
              <span className="text-[11px] font-bold uppercase tracking-widest"> Show Filters</span>
            </div>
            <div className={`flex-1 h-[1px] ${showFilters ? 'bg-green-600/20' : 'bg-slate-100'} group-hover:bg-green-600/30 transition-colors`}></div>
            <MdExpandMore className={`text-xl transition-all duration-300 ${showFilters ? 'rotate-180 text-green-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
          </div>

          <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100 mb-8 translate-y-0' : 'max-h-0 opacity-0 mb-0 -translate-y-4'
              }`}
          >
            <div className="mb-0 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 pt-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status</label>
                <div className="relative mt-2">
                  <select
                    className="stdSelectField w-full"
                    value={activeStatusFilter}
                    onChange={(e) => {
                      setActiveStatusFilter(e.target.value);
                      setPageNumber(1);
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="AWAITING_APPROVAL">Awaiting Approval</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="UNDER_OBSERVATION">Under Observation</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Reported From Date</label>
                <div className="relative mt-2 rounded-md shadow-sm date-picker-container">
                  <DatePicker
                    selected={
                      fromDate && fromDate !== "all" ? new Date(fromDate) : null
                    }
                    onChange={(date) => {
                      setFromDate(moment(date).format("YYYY-MM-DD"));
                      setPageNumber(1);
                    }}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="From Date"
                    className="stdSelectField pl-3 pr-10 w-full"
                    wrapperClassName="w-full"
                    portalId="datepicker-portal"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <MdCalendarToday className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Reported To Date</label>
                <div className="relative mt-2 rounded-md shadow-sm date-picker-container">
                  <DatePicker
                    selected={
                      toDate && toDate !== "all" ? new Date(toDate) : null
                    }
                    onChange={(date) => {
                      setToDate(moment(date).format("YYYY-MM-DD"));
                      setPageNumber(1);
                    }}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="To Date"
                    className="stdSelectField pl-3 pr-10 w-full"
                    wrapperClassName="w-full"
                    portalId="datepicker-portal"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <MdCalendarToday className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              {/* <div className="flex items-end pb-1">
              <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 whitespace-nowrap">
                Showing Page {pageNumber} of {numOfPages.length}
              </span>
            </div> */}
            </div>
          </div>

          <GenericTable
            tableObjects={tableObjects}
            tableHeading={tableHeading}
            excelHeading={excelHeading}
            setRunCount={setRunCount}
            runCount={runCount}
            recsPerPage={recsPerPage}
            setRecsPerPage={setRecsPerPage}
            getData={getData}
            filterData={{
              searchText: searchText,
              center_ID: center_id,
              department_ID: department_id,
              status: activeStatusFilter,
              fromDate: fromDate,
              toDate: toDate,
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
            border-color: #10b981;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.05);
          }
          .date-picker-container .react-datepicker-wrapper {
            width: 100%;
          }
          .GenericTable table tbody tr:last-child {
            background-color: #f8fafc !important;
            font-weight: 800 !important;
          }
          .GenericTable table tbody tr:last-child td {
            border-top: 2px solid #e2e8f0 !important;
            color: #1e293b !important;
          }
        `}</style>
      </div>
    </section>
  );
}

export default MaintenanceList;
