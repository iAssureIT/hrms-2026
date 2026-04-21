"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter, usePathname } from "next/navigation";
import { Tooltip } from "flowbite-react";
import {
  MdOutlineMoveToInbox,
  MdAccessTime,
  MdTrendingUp,
  MdClose,
  MdSearch,
  MdFileDownload,
  MdChevronRight,
  MdDoneAll,
  MdHistory,
  MdAssignmentTurnedIn,
  MdOutlineFactCheck,
  MdFilterList,
  MdExpandMore,
} from "react-icons/md";
import { CiViewList } from "react-icons/ci";
import { FaFileUpload, FaUserCircle, FaSpinner, FaListUl, FaUserPlus } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import {
  HiSquares2X2,
  HiUserGroup,
  HiShieldCheck,
  HiClock
} from "react-icons/hi2";
import ls from "localstorage-slim";

import GenericTable from "@/widgets/GenericTable/FilterTable";

const MetricCard = ({
  title,
  value,
  icon: Icon,
  onClick,
  isActive,
  gradient,
  secondaryColor,
  activeGradient,
  activeTextColor,
  activeIndicator,
  tooltip,
}) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer group h-[120px] p-[1.5px]
            ${isActive
        ? `${activeGradient} shadow-xl scale-[1.02]`
        : "bg-gradient-to-br from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 hover:scale-[1.02] shadow-sm active:scale-95"
      }`}
  >
    <div className={`w-full h-full rounded-[22px] p-5 relative overflow-hidden transition-colors duration-500 ${isActive ? "bg-white/95" : "bg-white"}`}>
      {/* Subtle Background Icon */}
      <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 transform group-hover:scale-110 group-hover:-rotate-12 ${secondaryColor}`}>
        <Icon size={140} />
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-4">
          <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] block transition-colors duration-300 ${isActive ? activeTextColor : "text-slate-400"}`}>
            {title}
          </span>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter items-baseline flex gap-1">
            {value}
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{value > 1 ? "Units" : "Unit"}</span>
          </h3>
        </div>
        <div className={`p-3.5 rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${gradient} text-white`}>
          <Icon size={24} />
        </div>
      </div>

      {/* Active Indicator Pulse */}
      {isActive && (
        <div className="absolute top-3 right-3 flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeIndicator} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${activeIndicator} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}></span>
        </div>
      )}
    </div>
  </div>
);


const AllocationApproval = () => {
  const router = useRouter();
  const [loggedInRole, setLoggedInRole] = useState("admin");
  const [mounted, setMounted] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [userDetails] = useState(ls.get("userDetails", { decrypt: true }) || {});
  const user_id = userDetails?.user_id || userDetails?.userId || userDetails?._id;
  const [showFilters, setShowFilters] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [runCount, setRunCount] = useState(0);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const tableHeading = {
    actions: "Action",
    assetName: "Asset Name",
    employeeDetails: "Recipient",
    departmentName: "Department",
    centerName: "Center",
    status: "Status",
  };

  const tableObjects = {
    tableName: "",
    deleteMethod: "delete",
    getListMethod: "get",
    apiURL: "/api/asset-allocation",
    editURL: "/management/asset-submission/",
    viewURL: "/management/asset-view/",
    downloadApply: true,
    searchApply: true,
    formURL: "/management/asset-submission",
    formText: "Allocation Approval",
    titleMsg: "Asset Allocation List",
  };

  const excelHeading = {
    allocationNo: "Allocation No.",
    "assets.0.assetName": "Asset Name",
    "assets.0.assetID": "Asset ID",
    "employee.name": "Employee Name",
    "requestedBy.name": "Requested By",
    status: "Status"
  };

  // Master Data State
  const [centerList, setCenterList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [subDepartmentList, setSubDepartmentList] = useState([]);

  // Filter State
  const [centerIdFilter, setCenterIdFilter] = useState("all");
  const [centerFilter, setCenterFilter] = useState("all");
  const [subLocationList, setSubLocationList] = useState([]);
  const [subLocationFilter, setSubLocationFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [subDeptFilter, setSubDeptFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
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
    getCenterList(isAssetIncharge && !isAssetAdmin);
    getDepartmentList();
  }, [pathname, userDetails]);

  // ... (keep center/dept fetching same)

  // ── Master Data Fetching ──
  const getCenterList = (autoSelect = false) => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setCenterList(data);
        if (autoSelect && userDetails?.center_id) {
          const userCenter = data.find(c => c._id === userDetails.center_id);
          if (userCenter) {
            setCenterIdFilter(`${userCenter._id}|${userCenter.centerName}`);
            setCenterFilter(userCenter.centerName);
          }
        }
      })
      .catch((err) => console.error("Error fetching centers:", err));
  };

  const getDepartmentList = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
      .then((res) => setDepartmentList(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Error fetching departments:", err));
  };

  const getSubLocationList = (center_id) => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/location-subcategory/get`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setSubLocationList(
          data.filter((item) => item.dropdown_id === center_id),
        );
      })
      .catch((err) => console.error("Error fetching sub-locations:", err));
  };

  const getSubDepartmentList = (dept_id) => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subdepartment-master/get`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setSubDepartmentList(
          data.filter((item) => item.dropdown_id === dept_id),
        );
      })
      .catch((err) => console.error("Error fetching sub-departments:", err));
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
        dropdown_id: "all",
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management/post/list`,
        formValues,
      );
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

  const handleCenterChange = (e) => {
    const value = e.target.value;
    if (value === "all") {
      setCenterIdFilter("all");
      setCenterFilter("all");
      setSubLocationFilter("all");
      setSubLocationList([]);
    } else {
      const [id, name] = value.split("|");
      setCenterIdFilter(value);
      setCenterFilter(name);
      setSubLocationFilter("all");
      getSubLocationList(id);
    }
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
      priority: "Priority",
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
  }, [centerFilter, subLocationFilter, deptFilter, subDeptFilter, activeStatusFilter, searchQuery, searchText, runCount, pageNumber, recsPerPage]);

  const fetchRequests = async () => {
    setLoadingData(true);
    try {
      const selectedCenterId = centerIdFilter !== "all" ? centerIdFilter.split("|")[0] : "all";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-transactions/get?center_id=${selectedCenterId}`,
      );
      if (response.data && response.data.data) {
        const mappedData = response.data.data
          .map((item) => {
            const empName = item.employee?.name || "-";
            const empEmail = item.employee?.email || "-";
            const empMobile = item.employee?.mobile || "-";

            let displayStatus = "";
            let statusColor = "";
            switch (item.transactionStatus) {
              case "REQUESTED":
              case "APPROVAL_PENDING":
                displayStatus = "Asset Allocation Pending";
                statusColor = "text-amber-500 bg-transparent border-amber-500";
                break;
              case "APPROVED":
              case "COMPLETED":
                displayStatus = "Active";
                statusColor = "text-green-600 bg-transparent border-green-500";
                break;
              case "REJECTED":
                displayStatus = "Rejected";
                statusColor = "text-red-500 bg-transparent border-red-500";
                break;
              default:
                displayStatus = item.transactionStatus || "-";
                statusColor = "text-gray-600 bg-transparent border-gray-400";
            }

            return {
              ...item,
              employeeName: empName,
              employeeDetails: `<b>${empName}</b><br/><span style="font-size: 10px; color: #666;">${empEmail}</span><br/><span style="font-size: 10px; color: #666;">${empMobile}</span>`,
              departmentName: item.department?.name || "-",
              centerName: item.center?.name || "-",
              status: `<span class="inline-block w-[160px] text-center px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border shadow-sm leading-tight ${statusColor}">${displayStatus}</span>`,
              id: item._id,
              actions: item,
            };
          })
          .filter(
            (r, index, self) => {
              if (r.transactionType !== "ALLOCATION") return false;

              // If it's PENDING or REJECTED, always show (as long as it's an ALLOCATION)
              if (["REQUESTED", "APPROVAL_PENDING", "REJECTED"].includes(r.transactionStatus)) return true;

              // If it's COMPLETED, check if it's the LATEST allocation/deallocation transaction for this asset
              const newerTransactions = response.data.data.filter(t =>
                t.asset_id === r.asset_id &&
                new Date(t.createdAt) > new Date(r.createdAt) &&
                ["ALLOCATION", "DEALLOCATION"].includes(t.transactionType) &&
                t.transactionStatus === "COMPLETED"
              );

              // If there's a newer COMPLETED allocation or deallocation, hide this historical one
              return newerTransactions.length === 0;
            }
          );

        setRequests(mappedData);
        setCounts({
          total: mappedData.length,
          pending: mappedData.filter((r) => ["REQUESTED", "APPROVAL_PENDING"].includes(r.transactionStatus)).length,
          approved: mappedData.filter((r) => r.transactionStatus === "COMPLETED").length,
          rejected: mappedData.filter((r) => r.transactionStatus === "REJECTED").length,
        });

        const filtered = mappedData.filter((req) => {
          const matchesSearch =
            searchText === "-" ||
            req.assetID?.toLowerCase().includes(searchText.toLowerCase()) ||
            req.assetName?.toLowerCase().includes(searchText.toLowerCase()) ||
            req.employeeName?.toLowerCase().includes(searchText.toLowerCase());
          const matchesStatus =
            activeStatusFilter === "all" ||
            (activeStatusFilter === "PENDING" && ["REQUESTED", "APPROVAL_PENDING"].includes(req.transactionStatus)) ||
            (activeStatusFilter === "APPROVED" && req.transactionStatus === "COMPLETED") ||
            (activeStatusFilter === "REJECTED" && req.transactionStatus === "REJECTED");
          const matchesCenter =
            centerFilter === "all" || req.centerName === centerFilter;
          const selectedDept = departmentList.find((d) => d._id === deptFilter);
          const matchesDept =
            deptFilter === "all" ||
            req.departmentName === selectedDept?.fieldValue;
          return matchesSearch && matchesStatus && matchesCenter && matchesDept;
        });

        setTableData(filtered);
        setTotalRecs(filtered.length);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // handleAction removed as per user request

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      searchQuery.length > 0
        ? req.assetID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.employeeName &&
          req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
    const matchesStatus =
      activeStatusFilter === "all" ||
      (activeStatusFilter === "PENDING" && ["REQUESTED", "APPROVAL_PENDING"].includes(req.transactionStatus)) ||
      (activeStatusFilter === "APPROVED" && req.transactionStatus === "COMPLETED") ||
      (activeStatusFilter === "REJECTED" && req.transactionStatus === "REJECTED");
    const matchesCenter =
      centerFilter === "all" || req.centerName === centerFilter;
    // Sub-location filter (matching by name since API returns name)
    const selectedSubLoc = subLocationList.find(
      (s) => s._id === subLocationFilter,
    );
    const matchesSubLocation =
      subLocationFilter === "all" ||
      req.subLocationName === selectedSubLoc?.inputValue;

    const selectedDept = departmentList.find((d) => d._id === deptFilter);
    const matchesDept =
      deptFilter === "all" || req.departmentName === selectedDept?.fieldValue;

    const selectedSubDept = subDepartmentList.find(
      (s) => s._id === subDeptFilter,
    );
    const matchesSubDept =
      subDeptFilter === "all" ||
      req.subDepartmentName === selectedSubDept?.inputValue;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCenter &&
      matchesSubLocation &&
      matchesDept &&
      matchesSubDept
    );
  });

  const updateInlineStatus = async (reqId, newStatus) => {
    try {
      const endpoint =
        newStatus === "Active"
          ? "approve"
          : newStatus === "Rejected"
            ? "reject"
            : "status";
      const backendStatus =
        newStatus === "Active"
          ? "APPROVED"
          : newStatus === "Rejected"
            ? "REJECTED"
            : "PENDING";

      const roles = userDetails?.roles || [];
      const isIncharge = roles.includes("account-incharge") || roles.includes("center-incharge");
      const isAuthorized = roles.includes("admin") || roles.includes("account-admin") || roles.includes("account-manager") || roles.includes("asset-manager") || roles.includes("asset-admin");
      const isFaAccounts = roles.includes("fa-accounts");

      if ((isIncharge && !isAuthorized) || isFaAccounts) {
        Swal.fire("Access Denied", "You do not have permission to perform approvals.", "error");
        return;
      }

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-transactions/patch/status/${reqId}`,
        {
          status: backendStatus,
          user_id: user_id,
          userName: userDetails?.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails?.fullName || userDetails?.name || "System")
        },
      );
      if (res.data.success) {
        setRequests((prev) =>
          prev.map((r) => (r._id === reqId ? { ...r, status: newStatus } : r)),
        );
        if (selectedRequest?._id === reqId) {
          setSelectedRequest((prev) => ({ ...prev, status: newStatus }));
        }
        setTimeout(() => fetchRequests(), 1000);
      }
    } catch (error) {
      console.error("Inline status update error:", error);
      Swal.fire("Error!", "Failed to update status.", "error");
    }
  };

  if (!mounted) return null;

  return (
    <section className="section p-6 md:p-10 bg-white min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Asset Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Allocation <span className="text-[#3c8dbc] font-black">Approval List</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 me-10 pt-4 md:pt-0 mb-1">
              <Tooltip
                content="Asset List"
                placement="bottom"
                className="bg-[#3c8dbc]"
                arrow={false}
              >
                <CiViewList
                  className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px]"
                  onClick={() =>
                    router.push(`/${loggedInRole}/management`)
                  }
                />
              </Tooltip>
              {!(userDetails?.roles?.includes("fa-accounts")) && (
                <>
                  <Tooltip
                    content="Allocate Asset"
                    placement="bottom"
                    className="bg-[#3c8dbc]"
                    arrow={false}
                  >
                    <FaUserPlus
                      className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px]"
                      onClick={() => {
                        router.push(
                          `/${loggedInRole}/management/asset-allocation`,
                        );
                      }}
                    />
                  </Tooltip>
                  <Tooltip
                    content="Bulk Upload"
                    placement="bottom"
                    className="bg-[#3c8dbc]"
                    arrow={false}
                  >
                    <FaFileUpload
                      className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px]"
                      onClick={() => {
                        router.push(
                          `/${loggedInRole}/management/bulk-upload`,
                        );
                      }}
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
                      onClick={() => {
                        router.push(
                          `/${loggedInRole}/management/asset-submission`,
                        );
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2">
            Review and approve physical asset transfers between departments.
          </p>
        </div>

        <div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* ── Main Content (Stats + Table) ── */}
            <div className="xl:col-span-12 space-y-6">
              {/* Stats Cards */}
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
                <MetricCard
                  title="Total Requests"
                  value={counts.total}
                  icon={HiSquares2X2}
                  secondaryColor="text-amber-600"
                  gradient="bg-gradient-to-br from-amber-400 to-amber-600"
                  activeGradient="bg-gradient-to-br from-amber-400 to-amber-600"
                  activeTextColor="text-amber-600"
                  activeIndicator="bg-amber-500"
                  onClick={() => setActiveStatusFilter("all")}
                  isActive={activeStatusFilter === "all"}
                  tooltip="View Total Requests"
                />
                <MetricCard
                  title="Pending"
                  value={counts.pending}
                  icon={HiClock}
                  secondaryColor="text-cyan-600"
                  gradient="bg-gradient-to-br from-cyan-500 to-cyan-700"
                  activeGradient="bg-gradient-to-br from-cyan-400 to-cyan-600"
                  activeTextColor="text-cyan-600"
                  activeIndicator="bg-cyan-500"
                  onClick={() => setActiveStatusFilter("PENDING")}
                  isActive={activeStatusFilter === "PENDING"}
                  tooltip="View Pending Requests"
                />
                <MetricCard
                  title="Allocated"
                  value={counts.approved}
                  icon={HiUserGroup}
                  secondaryColor="text-teal-600"
                  gradient="bg-gradient-to-br from-teal-500 to-teal-700"
                  activeGradient="bg-gradient-to-br from-teal-400 to-teal-600"
                  activeTextColor="text-teal-600"
                  activeIndicator="bg-teal-500"
                  onClick={() => setActiveStatusFilter("APPROVED")}
                  isActive={activeStatusFilter === "APPROVED"}
                  tooltip="View Active Requests"
                />
                <MetricCard
                  title="Rejected"
                  value={counts.rejected}
                  icon={HiShieldCheck}
                  secondaryColor="text-rose-600"
                  gradient="bg-gradient-to-br from-rose-400 to-rose-600"
                  activeGradient="bg-gradient-to-br from-rose-400 to-rose-600"
                  activeTextColor="text-rose-600"
                  activeIndicator="bg-rose-500"
                  onClick={() => setActiveStatusFilter("REJECTED")}
                  isActive={activeStatusFilter === "REJECTED"}
                  tooltip="View Rejected Requests"
                />
              </div>


              <div
                className="flex items-center gap-4 mb-2 cursor-pointer group select-none"
                onClick={() => setShowFilters(!showFilters)}
              >
                <div className="flex items-center gap-2 text-slate-800 hover:text-[#3c8dbc] transition-colors">
                  <MdFilterList className={`text-xl ${showFilters ? 'text-[#3c8dbc]' : 'text-slate-600'}`} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Show Filters</span>
                </div>
                <div className={`flex-1 h-[1px] ${showFilters ? 'bg-[#3c8dbc]/20' : 'bg-slate-100'} group-hover:bg-[#3c8dbc]/30 transition-colors`}></div>
                <MdExpandMore className={`text-xl transition-all duration-300 ${showFilters ? 'rotate-180 text-[#3c8dbc]' : 'text-slate-400 group-hover:text-slate-600'}`} />
              </div>

              <div
                className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100 mb-8 translate-y-0' : 'max-h-0 opacity-0 mb-0 -translate-y-4'
                  }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50/10 p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <label className="inputLabel">
                      Center
                    </label>
                    <div className="relative mt-2">
                      <select
                        className="stdSelectField w-full"
                        value={centerIdFilter}
                        onChange={handleCenterChange}
                        disabled={
                          (userDetails?.roles?.includes("asset-incharge") &&
                            !userDetails?.roles?.includes("admin") &&
                            !userDetails?.roles?.includes("asset-admin"))
                        }
                      >
                        <option value="all">All</option>
                        {centerList.map((c) => (
                          <option key={c._id} value={`${c._id}|${c.centerName}`}>
                            {c.centerName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="inputLabel">
                      Sub-Location
                    </label>
                    <div className="relative mt-2">
                      <select
                        className="stdSelectField w-full"
                        value={subLocationFilter}
                        onChange={(e) => setSubLocationFilter(e.target.value)}
                        disabled={centerFilter === "all"}
                      >
                        <option value="all">All</option>
                        {subLocationList.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.inputValue}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="inputLabel">
                      Department
                    </label>
                    <div className="relative mt-2">
                      <select
                        className="stdSelectField w-full"
                        value={deptFilter}
                        onChange={handleDeptChange}
                      >
                        <option value="all">All</option>
                        {departmentList.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.fieldValue}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="inputLabel">
                      Sub-Department
                    </label>
                    <div className="relative mt-2">
                      <select
                        className="stdSelectField w-full"
                        value={subDeptFilter}
                        onChange={(e) => setSubDeptFilter(e.target.value)}
                        disabled={deptFilter === "all"}
                      >
                        <option value="all">All</option>
                        {subDepartmentList.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.inputValue}
                          </option>
                        ))}
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
                  setRunCount={setRunCount}
                  runCount={runCount}
                  recsPerPage={recsPerPage}
                  setRecsPerPage={setRecsPerPage}
                  filterData={{
                    center_id: centerFilter,
                    subLocation_id: subLocationFilter,
                    department_id: deptFilter,
                    subDepartment_id: subDeptFilter,
                    status: activeStatusFilter,
                    searchText: searchText
                  }}
                  getData={fetchRequests}
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
                  loading={loadingData}
                />
              </div>

              {/* Bottom Context Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* <div className="bg-green-50/50 border border-green-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-green-600 mb-3">
                    <MdDoneAll size={20} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">
                      Approval Protocol
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Verify destination center capacity for the asset.",
                      "Ensure recipient employee has relevant authorizations.",
                      "A gate pass will be automatically generated upon approval.",
                    ].map((text, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-[12px] text-blue-800"
                      >
                        <span className="text-blue-400">•</span> {text}
                      </li>
                    ))}
                  </ul>
                </div> */}
                {/* <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-2 text-gray-400 mb-4 self-start">
                    <MdHistory size={20} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">
                      Audit History
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <MdAssignmentTurnedIn className="text-gray-200 text-2xl" />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium max-w-[150px]">
                    Select a request to view its previous movement history.
                  </p>
                </div> */}
              </div>
            </div>
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
      `}</style>
    </section>
  );
};

export default AllocationApproval;
