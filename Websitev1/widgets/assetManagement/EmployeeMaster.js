"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { FaUserTie, FaFileUpload, FaListUl, FaUserPlus, FaUsers } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import ls from "localstorage-slim";
import FilterTable from "@/widgets/GenericTable/FilterTable";

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
    actions: "Actions",
    employeeID: "Employee ID",
    employeeName: "Employee Name",
    employeeEmail: "Email",
    employeeMobile: "Mobile",
    employeeDesignation: "Designation",
    centerName: "Center",
    subLocationName: "Sub-Location",
    departmentName: "Department",
    subDepartmentName: "Sub-Department",
  };

  const excelHeading = {
    employeeID: "Employee ID",
    employeeName: "Full Name",
    employeeEmail: "Email",
    employeeMobile: "Mobile",
    employeeDesignation: "Designation",
    centerName: "Center",
    subLocationName: "Sub-Location",
    departmentName: "Department",
    subDepartmentName: "Sub-Department",
  };

  const tableObjects = {

    apiURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/employees`,
    getListMethod: "post",
    deleteMethod: "delete",
    editURL: `/asset-management/add-employee?id=`,
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

  useEffect(() => {
    getData();
  }, [pageNumber, recsPerPage, runCount, searchText]);

  return (
    <section className="section p-6 md:p-10 bg-white min-h-screen border-t-[3px] border-[#3c8dbc] shadow-md">
      <div className="max-w-[1440px] mx-auto">
        {/* Theme-aligned Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Human Resources</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Employee <span className="text-[#3c8dbc] font-black">Master</span>
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
      </div>
    </section>
  );
};

export default EmployeeMaster;
