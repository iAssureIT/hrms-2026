"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { FaUserTie, FaFileUpload, FaListUl, FaUserPlus, FaUsers, FaBuilding, FaVenusMars, FaSpinner } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import ls from "localstorage-slim";
import FilterTable from "@/widgets/GenericTable/FilterTable";

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
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3c8dbc] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3c8dbc]"></span>
          </div>
        </div>
      )}
    </div>
  </div>
);

const EmployeeMaster = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("admin");
  const [userDetails, setUserDetails] = useState(ls.get("userDetails", { decrypt: true }));

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState({});
  const [activeStatusFilter, setActiveStatusFilter] = useState(null);
  const [counts, setCounts] = useState({
    totalWorkforce: 0,
    activeEmployees: 0,
    totalDepartments: 0,
    genderRatio: { Male: 0, Female: 0, Other: 0 }
  });

  useEffect(() => {
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
  }, [pathname]);

  const tableHeading = {
    employeeName: "Employee",
    employeeID: "Employee ID",
    gender: "Gender",
    employeeEmail: "Email",
    employeeMobile: "Mobile",
    departmentName: "Department",
    employeeDesignation: "Designation",
    employmentType: "Emp Type",
    systemRole: "Access Role",
    doj: "Joining Date",
    actions: "Actions",
  };

  const excelHeading = {
    employeeName: "Full Name",
    employeeID: "Employee ID",
    gender: "Gender",
    employeeEmail: "Email",
    employeeMobile: "Mobile",
    departmentName: "Department",
    employeeDesignation: "Designation",
    employmentType: "Employment Type",
    systemRole: "System Role",
    dateOfJoining: "Joining Date",
  };

  const tableObjects = {

    apiURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/employees`,
    getListMethod: "post",
    deleteMethod: "delete",
    editURL: `/asset-management/add-employee?id=`,
    viewURL: `/asset-management/employee-profile-view?id=`,
    searchApply: true,
    downloadApply: true,
    titleMsg: "Employee List",
  };

  const getData = async () => {
    setLoading(true);
    const formValues = {
      searchText: searchText,
      pageNumber: pageNumber,
      recsPerPage: recsPerPage,
      status: activeStatusFilter,
    };
    setFilterData(formValues);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/list/${recsPerPage}/${pageNumber}`,
        formValues
      );
      if (response.data) {
        setTableData(response.data.tableData || []);
        setTotalRecs(response.data.totalRecs || 0);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/get/metrics`);
      if (response.data) {
        setCounts(response.data);
      }
    } catch (error) {
      console.error("Error fetching employee metrics:", error);
    }
  };

  useEffect(() => {
    getMetrics();
    getData();
  }, [pageNumber, recsPerPage, runCount, searchText, activeStatusFilter]);

  return (
    <section className="section admin-box box-primary">
        {/* Theme-aligned Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Human Resources</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Employee <span className="text-[#3c8dbc] font-black">Management</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
              <Tooltip content="Add Employee" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>

                <BsPlusSquare
                  className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                  onClick={() => router.push(`/${loggedInRole}/asset-management/add-employee`)}
                />
              </Tooltip>
              <Tooltip content="Bulk Upload" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                <FaFileUpload
                  className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                  onClick={() => {
                    router.push(`/${loggedInRole}/asset-management/employee-bulk-upload`);
                  }}
                />
              </Tooltip>

            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Maintain accurate personnel records, manage designations, and track organizational hierarchies for seamless resource allocation.
          </p>
        </div>

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatusCard
            label="Total Workforce"
            value={counts.totalWorkforce}
            icon={FaUsers}
            colorClass="bg-aqua"
            onClick={() => {
              setActiveStatusFilter(null);
              setPageNumber(1);
            }}
            isActive={activeStatusFilter === null}
          />
          <StatusCard
            label="Active Employees"
            value={counts.activeEmployees}
            icon={FaUserTie}
            colorClass="bg-green"
            onClick={() => {
              setActiveStatusFilter("Active");
              setPageNumber(1);
            }}
            isActive={activeStatusFilter === "Active"}
          />
          <StatusCard
            label="Total Departments"
            value={counts.totalDepartments}
            icon={FaBuilding}
            colorClass="bg-yellow"
            isActive={false}
          />
          <StatusCard
            label="Female Employee"
            value={`${counts.genderRatio?.Female || 0} `}
            icon={FaVenusMars}
            colorClass="bg-red"
            isActive={false}
          />
        </div>

        <div className="bg-white">
          <FilterTable
            tableHeading={tableHeading}
            excelHeading={excelHeading}
            tableObjects={tableObjects}
            getData={getData}
            tableData={tableData}
            setTableData={setTableData}
            recsPerPage={recsPerPage}
            setRecsPerPage={setRecsPerPage}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            searchText={searchText}
            setSearchText={setSearchText}
            totalRecs={totalRecs}
            setTotalRecs={setTotalRecs}
            numOfPages={numOfPages}
            setNumOfPages={setNumOfPages}
            runCount={runCount}
            setRunCount={setRunCount}
            filterData={filterData}
            loading={loading}
          />
        </div>
    </section>
  );
};

export default EmployeeMaster;
