"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import {
  FaUserTie,
  FaFileUpload,
  FaListUl,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import ls from "localstorage-slim";
import FilterTable from "@/widgets/GenericTable/FilterTable";

const EmployeeMaster = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("admin");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true }),
  );

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
    tableName: "Employee List",
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
        formValues,
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
    <section className="section">
      <div className="box border-2 rounded-md shadow-md bg-white">
        {/* Header Section */}
        <div className="uppercase text-xl font-semibold border-b-2 border-gray-300 flex justify-between px-10">
          <div className="flex items-center gap-3 py-5">
            {/* <FaUsers className="text-green-600" size={24} /> */}
            <h1 className="text-2xl text-gray-900 tracking-tight">
              Employee Master
            </h1>
          </div>
          <div className="flex gap-3 my-5 items-center">
            <Tooltip
              content="Add Employee"
              placement="bottom"
              className="bg-green"
              arrow={false}
            >
              <FaUserPlus
                className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                onClick={() => {
                  router.push(`/${loggedInRole}/asset-management/add-employee`);
                }}
              />
            </Tooltip>
            <Tooltip
              content="Bulk Upload"
              placement="bottom"
              className="bg-green"
              arrow={false}
            >
              <FaFileUpload
                className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                onClick={() => {
                  router.push(
                    `/${loggedInRole}/asset-management/employee-bulk-upload`,
                  );
                }}
              />
            </Tooltip>
            <Tooltip
              content="Asset Registry"
              placement="bottom"
              className="bg-green"
              arrow={false}
            >
              <CiViewList
                className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[1.5rem]"
                onClick={() => {
                  router.push(`/${loggedInRole}/asset-management`);
                }}
              />
            </Tooltip>
          </div>
        </div>

        <div className="px-10 pb-10">
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
