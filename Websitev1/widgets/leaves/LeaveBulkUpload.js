"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "@/widgets/assetManagement/BulkUpload_Employee";
import axios from "axios";
import { Tooltip } from "flowbite-react";
import { FaListUl } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import * as XLSX from "xlsx";

const LeaveBulkUpload = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("admin");

  useEffect(() => {
    if (pathname?.includes("admin")) {
      setLoggedInRole("admin");
    } else if (pathname?.includes("center")) {
      setLoggedInRole("center");
    } else if (pathname?.includes("asset")) {
      setLoggedInRole("asset");
    } else if (pathname?.includes("account")) {
      setLoggedInRole("account");
    }
  }, [pathname]);

  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);

  const [goodRecordsHeading] = useState({
    employeeName: "Employee Name",
    employeeID: "Employee ID",
    leaveTypeName: "Leave Type",
    leaveTypeCode: "Leave Code",
    year: "Year",
    openingBalance: "Opening Balance",
    earnedDays: "Earned Days",
  });

  const [failedtableHeading] = useState({
    employeeName: "Employee Name",
    employeeID: "Employee ID",
    leaveTypeName: "Leave Type",
    leaveTypeCode: "Leave Code",
    year: "Year",
    openingBalance: "Opening Balance",
    failedRemark: "Failed Data Remark",
  });

  const [tableObjects] = useState({
    deleteMethod: "delete",
    apiLink: "/api/leave-balance",
    downloadApply: true,
    paginationApply: false,
    searchApply: false,
  });

  const [fileDetails, setFileDetails] = useState();
  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedRecordsCount, setFailedRecordsCount] = useState(0);

  const uploadedData = () => {
    // Post-upload hook — can be used to refresh a list if needed
  };

  const getData = () => {
    // Refresh hook for the main leave management list
  };

  const getFileDetails = (fileName) => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/leave-balance/filedetails/${fileName}`,
      )
      .then((response) => {
        if (response.data) {
          setFileDetails(response.data);
          setGoodDataCount(response.data.goodrecords.length);
          setFailedRecordsCount(response.data.failedRecords.length);

          const gRecords = response.data.goodrecords.map((a) => ({
            employeeName: a.employeeName || "-NA-",
            employeeID: a.employeeID || "-NA-",
            leaveTypeName: a.leaveTypeName || "-NA-",
            leaveTypeCode: a.leaveTypeCode || "-NA-",
            year: a.year || "-NA-",
            openingBalance: a.openingBalance ?? "-NA-",
            earnedDays: a.earnedDays ?? 0,
          }));

          const fRecords = response.data.failedRecords.map((a) => ({
            employeeName: a.employeeName || "-NA-",
            employeeID: a.employeeID || "-NA-",
            leaveTypeName: a.leaveTypeName || "-NA-",
            leaveTypeCode: a.leaveTypeCode || "-NA-",
            year: a.year || "-NA-",
            openingBalance: a.openingBalance ?? "-NA-",
            failedRemark: a.failedRemark || "-NA-",
          }));

          setGoodRecordsTable(gRecords);
          setFailedRecordsTable(fRecords);
        }
      })
      .catch((error) => {
        console.error("Error fetching leave balance file details:", error);
      });
  };

  const downloadTemplate = (e) => {
    e.preventDefault();
    const templateData = [
      [
        "Employee ID",
        "Leave Type Code",
        "Year",
        "Opening Balance",
        "Earned Days",
      ],
      ["EMP001", "CL", "2026", "12", "0"],
      ["EMP002", "SL", "2026", "6", "0"],
      ["EMP003", "AL", "2026", "18", "0"],
    ];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths for readability
    worksheet["!cols"] = [
      { wch: 14 },
      { wch: 16 },
      { wch: 8 },
      { wch: 18 },
      { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Balance Template");
    XLSX.writeFile(workbook, "Leave-Balance-Bulk-Upload-Template.xlsx");
  };

  return (
    <section className="section">
      <main className=" min-h-screen">
        <div className="mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-normal text-gray-800 tracking-tight">
                Bulk Upload
              </h1>
              <span className="text-sm font-light text-gray-500">
                Leave Balance Import
              </span>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => router.push(`/${loggedInRole}/leaves`)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-gray-50 shadow-sm flex items-center gap-2"
              >
                <FaListUl size={12} /> Back to List
              </button>
            </div>
          </div>

          {/* Bulk Upload Box */}
          <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm flex flex-col mb-10 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-white">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                Import Records
              </h3>
            </div>

            <div className="p-6">
              <BulkUpload
                url={
                  process.env.NEXT_PUBLIC_BASE_URL +
                  "/api/leave-balance/bulk-upload"
                }
                fileurl=""
                downloadTemplate={downloadTemplate}
                data={[]}
                uploadedData={uploadedData}
                getData={getData}
                getFileDetails={getFileDetails}
                fileDetails={fileDetails}
                tableObjects={tableObjects}
                goodRecordsHeading={goodRecordsHeading}
                failedtableHeading={failedtableHeading}
                failedRecordsTable={failedRecordsTable}
                failedRecordsCount={failedRecordsCount}
                goodRecordsTable={goodRecordsTable}
                goodDataCount={goodDataCount}
              />
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default LeaveBulkUpload;
