"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Tooltip } from "flowbite-react";
import GenericTable from "@/widgets/GenericTable/FilterTable";
import { FaFileUpload, FaSpinner, FaUserPlus, FaListUl } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import { CiViewList } from "react-icons/ci";
import { usePathname } from "next/navigation";
import moment from "moment";
import dynamic from "next/dynamic";
const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default || mod),
  {
    ssr: false,
    loading: () => <div className="h-10 w-full animate-pulse bg-slate-50 rounded-xl border border-slate-100" />
  }
);
import "react-datepicker/dist/react-datepicker.css";
import {
  MdLayers,
  MdCheckCircle,
  MdCalendarToday,
  MdLocationOn,
  MdOutlineMoveToInbox,
  MdTrendingUp,
  MdAccessTime,
  MdOutlineInventory2,
  MdFormatListBulleted,
  MdAssignmentInd,
  MdInventory,
  MdHistory,
  MdFilterList,
  MdExpandMore,
} from "react-icons/md";
import {
  HiSquares2X2,
  HiUserGroup,
  HiShieldCheck,
  HiClock
} from "react-icons/hi2";
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


function AssetList() {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setUserDetails(details);
  }, []);

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(true);

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [runCount, setRunCount] = useState(0);
  const [center_id, setCenter_id] = useState(() => {
    const roles = userDetails?.roles || [];
    const isAssetIncharge = roles.includes("asset-incharge");
    const isAssetAdmin = (roles.includes("admin") || roles.includes("asset-admin"));
    return (isAssetIncharge && !isAssetAdmin) ? (userDetails?.center_id || "all") : "all";
  });
  const [centerName, setCenterName] = useState(() => {
    const roles = userDetails?.roles || [];
    const isAssetIncharge = roles.includes("asset-incharge");
    const isAssetAdmin = (roles.includes("admin") || roles.includes("asset-admin"));
    return (isAssetIncharge && !isAssetAdmin) ? (userDetails?.centerName || "all") : "all";
  });
  const [category_id, setCategory_id] = useState("all");
  const [centerNameList, setCenterNameList] = useState([]);
  const [assetCategoryList, setAssetCategoryList] = useState([]);
  const [department_id, setDepartment_id] = useState("all");
  const [subdepartment_id, setSubdepartment_id] = useState("all");
  const [departmentList, setDepartmentList] = useState([]);
  const [subDepartmentList, setSubDepartmentList] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    allocated: 0,
    available: 0,
    pending: 0,
    rejected: 0,
  });
  const [activeStatusFilter, setActiveStatusFilter] = useState(null);
  const [fromDate, setFromDate] = useState("all");
  const [toDate, setToDate] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();

  const tableHeading = {
    actions: "Actions",
    assetID: "Asset ID",
    assetName: "Asset Name",
    status: "Status",
    categorySubcategory: "Category",
    vendor: "Vendor",
    purchaseCost: "Cost",
    employeeDetails: "Employee Details",
    centerSublocation: "Location",
    deptSubdept: "Department",
  };

  const excelHeading = {
    assetID: "Asset ID",
    assetName: "Asset Name",
    assetStatus: "Status",
    category: "Category",
    subCategory: "Sub-Category",
    "currentAllocation.center.name": "Center",
    "currentAllocation.subLocation.name": "Sub-Location",
    "currentAllocation.department.name": "Department",
    "currentAllocation.subDepartment.name": "Sub-Department",
    brand: "Brand",
    model: "Model",
    serialNumber: "Serial No",
    purchaseDate: "Purchase Date",
    purchaseCost: "Purchase Cost",
    "vendor.name": "Vendor",
  };

  const tableObjects = {
    tableName: "",
    deleteMethod: "delete",
    getListMethod: "post",
    apiURL: "/api/asset-management-new",
    editURL: "/asset-management/asset-submission/",
    viewURL: "/asset-management/asset-view/",
    downloadApply: true,
    searchApply: true,
    formURL: "/asset-management/asset-submission",
    formText: "Add Asset",
    titleMsg: "Asset Registry",
  };

  useEffect(() => {
    const roles = userDetails?.roles || [];
    const isAssetIncharge = roles.includes("asset-incharge");
    const isAssetAdmin = roles.includes("admin") || roles.includes("asset-admin");
    const isFaAccounts = roles.includes("fa-accounts");

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
    getCenterList();
    getCategoryList();
    getDepartmentList();
  }, [pathname, userDetails]);

  const getCenterList = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
      .then((res) => setCenterNameList(res.data))
      .catch((err) => console.error(err));
  };

  const getCategoryList = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-category/get`)
      .then((res) => setAssetCategoryList(res.data))
      .catch((err) => console.error(err));
  };

  const getData = async () => {
    try {
      setLoading3(true);
      const formValues = {
        searchText: searchText,
        pageNumber: pageNumber,
        recsPerPage: recsPerPage,
        center_ID: center_id,
        department_ID: department_id,
        subdepartment_ID: subdepartment_id,
        category_id: category_id,
        assetStatus: activeStatusFilter || "all",
        fromDate: fromDate,
        toDate: toDate,
      };
      setFilterData(formValues);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/post/list`,
        formValues,
      );
      if (response.data && response.data.tableData) {
        const transformedData = response.data.tableData.map((item) => {
          let displayStatus = "";
          let statusColor = "";

          switch (item.assetStatus) {
            case "ASSET_APPROVAL_PENDING":
              displayStatus = "Asset Approval Pending";
              statusColor = "bg-amber-500 text-white border-amber-600";
              break;
            case "ASSET_APPROVAL_REJECTED":
            case "INACTIVE":
              displayStatus = "Inactive";
              statusColor = "bg-red-600 text-white border-red-700";
              break;
            case "ACTIVE":
              displayStatus = "Active";
              statusColor = "bg-green-600 text-white border-green-700";
              break;
            case "ALLOCATION_PENDING":
            case "ALLOCATION_APPROVAL_PENDING":
              displayStatus = "Allocation Approval Pending";
              statusColor = "bg-amber-500 text-white border-amber-600";
              break;
            case "ALLOCATED":
              displayStatus = "Allocated";
              statusColor = "bg-green-600 text-white border-green-700";
              break;
            case "ALLOCATION_APPROVAL_REJECTED":
              displayStatus = "Allocation Approval Rejected";
              statusColor = "bg-red-600 text-white border-red-700";
              break;
            case "MAINTENANCE":
              displayStatus = "Maintenance";
              statusColor = "bg-amber-600 text-white border-amber-700";
              break;
            case "DISPOSED":
              displayStatus = "Disposed";
              statusColor = "bg-slate-700 text-white border-slate-800";
              break;
            default:
              displayStatus = item.assetStatus || "NA";
              statusColor = "bg-slate-500 text-white border-slate-600";
          }

          const formatNA = (val) => {
            if (!val || val === "NA" || val === "-" || val.toString().trim() === "" || val === " - ") return "-NA-";
            return val;
          };

          return {
            ...item,
            status: `<span class="inline-block text-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-tight border shadow-sm ${statusColor} min-w-[70px] leading-tight">${displayStatus}</span>`,
            centerSublocation: `<b>${formatNA(item.currentAllocation?.center?.name)}</b><br/><span style="font-size: 11px; color: #666;">${formatNA(item.currentAllocation?.subLocation?.name)}</span>`,
            deptSubdept: `<b>${formatNA(item.currentAllocation?.department?.name)}</b><br/><span style="font-size: 11px; color: #666;">${formatNA(item.currentAllocation?.subDepartment?.name)}</span>`,
            categorySubcategory: `<b>${formatNA(item.category)}</b><br/><span style="font-size: 11px; color: #666;">${formatNA(item.subCategory)}</span>`,
            employeeDetails: item.currentAllocation?.employee?.name
              ? `<b>${item.currentAllocation.employee.name}</b><br/><span style="font-size: 11px; color: #666;">${formatNA(item.currentAllocation.employee.email)}</span>`
              : "-NA-",
            vendor: formatNA(item.vendor?.name),
            purchaseCost: item.purchaseCost ? `₹${item.purchaseCost}` : "-NA-",
          };
        });

        if (response.data.totalCost !== undefined && transformedData.length > 0) {
          transformedData.push({
            assetID: "Total",
            assetName: "",
            status: "",
            categorySubcategory: "",
            vendor: "",
            purchaseCost: `<b>₹${response.data.totalCost?.toLocaleString() || 0}</b>`,
            employeeDetails: "",
            centerSublocation: "",
            deptSubdept: "",
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
      console.error("Error fetching asset data:", error);
      setTableData([]);
      setTotalRecs(0);
    } finally {
      setLoading3(false);
    }
  };

  useEffect(() => {
    getData();
    getCounts();
  }, [
    center_id,
    department_id,
    subdepartment_id,
    category_id,
    activeStatusFilter,
    fromDate,
    toDate,
    pageNumber,
    recsPerPage,
    runCount,
    searchText,
  ]);

  const getCounts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/get/dashboard/counts?center_ID=${center_id}`,
      );
      if (res.data && res.data.success) {
        setCounts(res.data);
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    if (department_id && department_id !== "all") {
      getSubDepartmentList(department_id);
    } else {
      setSubDepartmentList([]);
      setSubdepartment_id("all");
    }
  }, [department_id]);

  const getDepartmentList = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
      .then((res) => {
        setDepartmentList(res.data);
      })
      .catch((err) => console.error(err));
  };

  const getSubDepartmentList = (dept_id) => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subdepartment-master/get`)
      .then((res) => {
        const filtered = res.data.filter(
          (item) => item.dropdown_id === dept_id,
        );
        setSubDepartmentList(filtered);
      })
      .catch((err) => console.error(err));
  };

  return (
    <section className="section admin-box box-primary">
      <div className="hr-card hr-fade-in">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Asset Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Asset <span className="text-[#3c8dbc] font-black">Inventory</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 me-10 pt-4 md:pt-0 mb-1">
              {!(userDetails?.roles?.includes("fa-accounts")) && (
                <Tooltip
                  content="Allocate Asset"
                  placement="bottom"
                  className="bg-[#3c8dbc]"
                  arrow={false}
                >
                    <FaUserPlus
                      className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px]"
                      onClick={() =>
                        router.push(`/${loggedInRole}/asset-management/asset-allocation`)
                      }
                    />
                  </Tooltip>
                )}
                {/* Allocation Approval List */}
                <Tooltip
                  content="Allocation Approval List"
                  placement="bottom"
                  className="bg-[#3c8dbc]"
                  arrow={false}
                >
                  <FaListUl
                    className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px]"
                    onClick={() =>
                      router.push(
                        `/${loggedInRole}/asset-management/allocation-approval-list`,
                      )
                    }
                  />
                </Tooltip>
                {!(userDetails?.roles?.includes("fa-accounts")) && (
                  <>
                    <Tooltip
                      content="Bulk Upload"
                      placement="bottom"
                      className="bg-[#3c8dbc]"
                      arrow={false}
                    >
                      <FaFileUpload
                        className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px]"
                        onClick={() =>
                          router.push(`/${loggedInRole}/asset-management/bulk-upload`)
                        }
                      />
                    </Tooltip>
                    <Tooltip
                      content="Add Asset"
                      placement="bottom"
                      className="bg-[#3c8dbc]"
                      arrow={false}
                    >
                      <BsPlusSquare
                        className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px]"
                        onClick={() =>
                          router.push(`/${loggedInRole}/asset-management/asset-submission`)
                        }
                      />
                    </Tooltip>
                </>
              )}
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2">
            Comprehensive oversight and management of enterprise assets with
            real-time tracking, allocation status, and lifecycle monitoring.
          </p>
          <div className="px-0 py-2">
            {/* Dashboard Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatusCard
                label="Total Assets"
                value={counts.total}
                icon={HiSquares2X2}
                colorClass="bg-aqua"
                onClick={() => {
                  setActiveStatusFilter("all");
                  setPageNumber(1);
                }}
                isActive={activeStatusFilter === "all"}
              />
              <StatusCard
                label="Allocated"
                value={counts.allocated}
                icon={HiUserGroup}
                colorClass="bg-green"
                onClick={() => {
                  setActiveStatusFilter("ALLOCATED");
                  setPageNumber(1);
                }}
                isActive={activeStatusFilter === "ALLOCATED"}
              />
              <StatusCard
                label="Available"
                value={counts.available}
                icon={HiShieldCheck}
                colorClass="bg-aqua"
                onClick={() => {
                  setActiveStatusFilter("ACTIVE");
                  setPageNumber(1);
                }}
                isActive={activeStatusFilter === "ACTIVE"}
              />
              <StatusCard
                label="Pending"
                value={counts.pending}
                icon={HiClock}
                colorClass="bg-yellow"
                onClick={() => {
                  setActiveStatusFilter("ASSET_APPROVAL_PENDING");
                  setPageNumber(1);
                }}
                isActive={activeStatusFilter === "ASSET_APPROVAL_PENDING"}
              />
            </div>
          </div>

          {/* --- FILTERS & TABLE --- */}
          <div className="bg-white">
            <div
              className="flex items-center gap-4 mb-2 cursor-pointer group select-none"
              onClick={() => setShowFilters(!showFilters)}
            >
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
              <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 items-end pt-2">
                {loggedInRole !== "center" &&
                  !(
                    userDetails?.roles?.includes("asset-incharge") &&
                    !userDetails?.roles?.includes("admin") &&
                    !userDetails?.roles?.includes("asset-admin")
                  ) && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                        Center
                      </label>
                      <div className="relative">
                        <select
                          className="stdSelectField w-full"
                          value={center_id ? `${center_id}|${centerName}` : "all"}
                          onChange={(e) => {
                            setPageNumber(1);
                            if (e.target.value === "all") {
                              setCenter_id("all");
                              setCenterName("all");
                            } else {
                              const [id, name] = e.target.value.split("|");
                              setCenter_id(id);
                              setCenterName(name);
                            }
                          }}
                        >
                          <option value="all">All</option>
                          {centerNameList.map((c) => (
                            <option key={c._id} value={`${c._id}|${c.centerName}`}>
                              {c.centerName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Asset Category
                  </label>
                  <div className="relative">
                    <select
                      className="stdSelectField w-full"
                      value={category_id}
                      onChange={(e) => {
                        setCategory_id(e.target.value);
                        setPageNumber(1);
                      }}
                    >
                      <option value="all">All</option>
                      {Array.isArray(assetCategoryList) &&
                        assetCategoryList.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.fieldValue}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      className="stdSelectField w-full"
                      value={department_id}
                      onChange={(e) => {
                        setDepartment_id(e.target.value);
                        setPageNumber(1);
                      }}
                    >
                      <option value="all">All</option>
                      {departmentList.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.fieldValue}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Sub-Department
                  </label>
                  <div className="relative">
                    <select
                      className="stdSelectField w-full"
                      value={subdepartment_id}
                      onChange={(e) => {
                        setSubdepartment_id(e.target.value);
                        setPageNumber(1);
                      }}
                      disabled={department_id === "all"}
                    >
                      <option value="all">All</option>
                      {subDepartmentList.map((sd) => (
                        <option key={sd._id} value={sd._id}>
                          {sd.inputValue}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Status
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
                      <option value="all">All</option>
                      <option value="PENDING_ALL">All Pending Approval</option>
                      <option value="ASSET_APPROVAL_PENDING">
                        Asset Approval Pending
                      </option>
                      <option value="ACTIVE">Active</option>
                      <option value="ALLOCATION_APPROVAL_PENDING">
                        Allocation Approval Pending
                      </option>
                      <option value="ALLOCATED">Allocated</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="DISPOSED">Disposed</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    From Date
                  </label>
                  <div className="relative date-picker-container">
                    <DatePicker
                      selected={
                        fromDate && fromDate !== "all" ? new Date(fromDate) : null
                      }
                      onChange={(date) => {
                        setFromDate(moment(date).format("YYYY-MM-DD"));
                        setPageNumber(1);
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="From"
                      className="stdSelectField w-full"
                      wrapperClassName="w-full"
                      onFocus={(e) => e.target.blur()}
                      onKeyDown={(e) => e.preventDefault()}
                      inputMode="none"
                      portalId="datepicker-portal"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <MdCalendarToday className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    To Date
                  </label>
                  <div className="relative date-picker-container">
                    <DatePicker
                      selected={
                        toDate && toDate !== "all" ? new Date(toDate) : null
                      }
                      onChange={(date) => {
                        setToDate(moment(date).format("YYYY-MM-DD"));
                        setPageNumber(1);
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="To"
                      className="stdSelectField w-full"
                      wrapperClassName="w-full"
                      onFocus={(e) => e.target.blur()}
                      onKeyDown={(e) => e.preventDefault()}
                      inputMode="none"
                      portalId="datepicker-portal"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <MdCalendarToday className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* <div className="flex items-center pb-1 gap-3">
              <span className="text-[10px] font-bold text-slate-400 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 whitespace-nowrap">
                Showing Page {pageNumber} of {numOfPages.length}
              </span>
            </div> */}
              </div>
            </div>

            <div className="p-0 table-professional">
              <GenericTable
                tableObjects={tableObjects}
                tableHeading={tableHeading}
                excelHeading={excelHeading}
                setRunCount={setRunCount}
                runCount={runCount}
                recsPerPage={recsPerPage}
                setRecsPerPage={setRecsPerPage}
                getData={getData}
                filterData={filterData}
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
                loading={loading3}
              />
            </div>
          </div>
        </div>

        <style jsx global>{`
        .table-professional .GenericTable section {
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
        .table-professional .GenericTable h1 {
          display: none !important;
        }
        .table-professional .GenericTable .table-container {
          border: none !important;
          margin: 0 !important;
          overflow-x: auto !important;
          box-shadow: none !important;
        }
        .table-professional .GenericTable table thead tr th:first-child,
        .table-professional .GenericTable table tbody tr td:first-child {
          text-align: center !important;
          width: 60px !important;
        }

        .table-professional .GenericTable table thead th,
        .table-professional .GenericTable table tbody td {
          padding: 16px 20px !important;
          white-space: nowrap !important;
        }

        .table-professional .GenericTable table thead th {
          background-color: #f8fafc !important;
          color: #64748b !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          border-bottom: 2px solid #f1f5f9 !important;
          text-transform: uppercase !important;
          tracking-widest: 0.1em !important;
        }
        .table-professional .GenericTable table tbody td {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #334155 !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .table-professional .GenericTable table tbody tr:hover {
          background-color: #f8fafc !important;
        }
        .table-professional .GenericTable .pagination-container {
          padding: 16px 24px !important;
          border-top: 1px solid #f1f5f9 !important;
          background: white !important;
        }
        .stdSelectField {
          height: 42px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 12px;
          width: 100%;
          padding: 0 16px;
          font-size: 12px;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='Wait, this is an icon'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }
        .stdSelectField:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.05);
        }
        /* Style standard buttons if needed */
        .table-professional .GenericTable table tbody tr:last-child {
          background-color: #f8fafc !important;
          font-weight: 800 !important;
        }
        .table-professional .GenericTable table tbody tr:last-child td {
          border-top: 2px solid #e2e8f0 !important;
          color: #1e293b !important;
        }
      `}</style>
      </div>
    </section>
  );
}

export default AssetList;

