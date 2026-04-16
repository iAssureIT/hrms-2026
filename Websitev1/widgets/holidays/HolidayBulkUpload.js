"use client";

import React, { useState } from "react";
import BulkUpload from "@/widgets/assetManagement/BulkUpload_Employee";
import axios from "axios";
import { Tooltip } from "flowbite-react";
import { FaListUl } from "react-icons/fa";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const HolidayBulkUpload = () => {
  const router = useRouter();

  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);

  const [goodRecordsHeading] = useState({
    holidayName: "Holiday Name",
    date: "Date",
    location: "Location",
    type: "Type",
  });

  const [failedtableHeading] = useState({
    holidayName: "Holiday Name",
    date: "Date",
    location: "Location",
    type: "Type",
    failedRemark: "Failed Data Remark",
  });

  const [tableObjects] = useState({
    deleteMethod: "delete",
    apiLink: "/api/holidays",
    downloadApply: true,
    paginationApply: false,
    searchApply: false,
  });

  const [fileDetails, setFileDetails] = useState();
  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedRecordsCount, setFailedRecordsCount] = useState(0);

  const uploadedData = () => {
    // Post-upload hook — can be used to refresh list if needed
  };

  const getData = () => {
    // Refresh hook for the main holidays list
  };

  const getFileDetails = (fileName) => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/holidays/filedetails/${fileName}`
      )
      .then((response) => {
        if (response.data) {
          setFileDetails(response.data);
          setGoodDataCount(response.data.goodrecords.length);
          setFailedRecordsCount(response.data.failedRecords.length);

          const gRecords = response.data.goodrecords.map((a) => ({
            holidayName: a.holidayName || "-NA-",
            date: a.date || "-NA-",
            location: a.location || "-NA-",
            type: a.type || "-NA-",
          }));

          const fRecords = response.data.failedRecords.map((a) => ({
            holidayName: a.holidayName || "-NA-",
            date: a.date || "-NA-",
            location: a.location || "-NA-",
            type: a.type || "-NA-",
            failedRemark: a.failedRemark || "-NA-",
          }));

          setGoodRecordsTable(gRecords);
          setFailedRecordsTable(fRecords);
        }
      })
      .catch((error) => {
        console.error("Error fetching holiday file details:", error);
      });
  };

  const downloadTemplate = (e) => {
    e.preventDefault();
    const templateData = [
      ["Holiday Name", "Date", "Location", "Type"],
      ["New Year Day",    "01/01/2026", "Global",    "Mandatory"],
      ["Holi",           "14/03/2026", "Bangalore", "Mandatory"],
      ["Good Friday",    "03/04/2026", "Global",    "Optional"],
      ["Independence Day","15/08/2026", "Global",    "Mandatory"],
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths for readability
    worksheet["!cols"] = [
      { wch: 22 },
      { wch: 14 },
      { wch: 22 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Holiday Template");
    XLSX.writeFile(workbook, "Holiday-Bulk-Upload-Template.xlsx");
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md bg-white">
        {/* Header */}
        <div className="uppercase text-xl font-semibold border-b-2 border-gray-300 flex justify-between px-10">
          <div className="flex items-center gap-3 py-5">
            <h1 className="text-2xl text-gray-900 tracking-tight">
              Holiday Bulk Upload
            </h1>
          </div>
          <div className="flex gap-3 my-5 items-center">
            <Tooltip
              content="Holiday Management"
              placement="bottom"
              className="bg-green"
              arrow={false}
            >
              <FaListUl
                className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                onClick={() => router.push("/admin/holidays")}
              />
            </Tooltip>
          </div>
        </div>


        {/* Bulk Upload Component */}
        <div className="p-5">
          <BulkUpload
            url={
              process.env.NEXT_PUBLIC_BASE_URL + "/api/holidays/bulk-upload"
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

export default HolidayBulkUpload;
