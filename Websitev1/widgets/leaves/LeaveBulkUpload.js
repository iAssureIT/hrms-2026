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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/leave-balance/filedetails/${fileName}`
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
      <div className="box border-2 rounded-md shadow-md bg-white">
        {/* Header */}
        <div className="uppercase text-xl font-semibold border-b-2 border-gray-300 flex justify-between px-10">
          <div className="flex items-center gap-3 py-5">
            <h1 className="text-2xl text-gray-900 tracking-tight">
              Leave Balance Bulk Upload
            </h1>
          </div>
          <div className="flex gap-3 my-5 items-center">
            <Tooltip
              content="Leave Management"
              placement="bottom"
              className="bg-green"
              arrow={false}
            >
              <FaListUl
                className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                onClick={() => {
                  router.push(`/${loggedInRole}/leaves`);
                }}
              />
            </Tooltip>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-10 pt-6 pb-2">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-[11px] text-amber-800 font-medium space-y-1">
            <p className="font-black uppercase tracking-widest text-[10px] text-amber-600 mb-2">
              Template Column Reference
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Employee ID</strong> — must match exactly as stored in
                Employee Master (e.g. EMP001)
              </li>
              <li>
                <strong>Leave Type Code</strong> — use the leave code from Leave
                Types master (e.g. CL, SL, AL)
              </li>
              <li>
                <strong>Year</strong> — 4-digit year (e.g. 2026)
              </li>
              <li>
                <strong>Opening Balance</strong> — number of leave days to
                credit
              </li>
              <li>
                <strong>Earned Days</strong> — optional, defaults to 0
              </li>
            </ul>
          </div>
        </div>

        {/* Bulk Upload Component */}
        <div className="p-5">
          <BulkUpload
            url={
              process.env.NEXT_PUBLIC_BASE_URL + "/api/leave-balance/bulk-upload"
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
