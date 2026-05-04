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
    employeeID: "Employee ID",
    employeeName: "Employee Name",
    leaveTypeCode: "Leave Type Code",
    leaveTypeName: "Leave Type",
    year: "Year",
    openingBalance: "Opening Balance",
    earnedDays: "Earned Days",
  });

  const [failedtableHeading] = useState({
    employeeID: "Employee ID",
    employeeName: "Employee Name",
    leaveTypeCode: "Leave Type Code",
    leaveTypeName: "Leave Type",
    year: "Year",
    openingBalance: "Opening Balance",
    earnedDays: "Earned Days",
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
            employeeID: a.employeeID || "-NA-",
            employeeName: a.employeeName || "-NA-",
            leaveTypeCode: a.leaveTypeCode || "-NA-",
            leaveTypeName: a.leaveTypeName || "-NA-",
            year: a.year || "-NA-",
            openingBalance: (a.openingBalance && a.openingBalance !== "-") ? a.openingBalance : 0,
            earnedDays: (a.earnedDays && a.earnedDays !== "-") ? a.earnedDays : 0,
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
      ["EMP-001", "CL", "2026", "12", "0"],
      ["EMP-002", "SL", "2026", "6", "0"],
      ["EMP-100", "EL", "2026", "18", "0"],
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
    <section className="section p-6 md:p-10 bg-white min-h-screen border-t-[3px] border-[#3c8dbc] shadow-md">
      <div className="max-w-[1440px] mx-auto">
        {/* Theme-aligned Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Bulk <span className="text-[#3c8dbc] font-black">Upload</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
              <button
                onClick={() => router.push(`/${loggedInRole}/leaves`)}
                className="admin-btn-primary flex items-center gap-2 !px-4 !py-1.5"
              >
                <FaListUl size={12} /> Back to Dashboard
              </button>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Import leave balances and historical records in bulk using Excel templates. Ensure Employee IDs match the master records.
          </p>
        </div>

        {/* Bulk Upload Box */}


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
    </section>
  );
};

export default LeaveBulkUpload;
