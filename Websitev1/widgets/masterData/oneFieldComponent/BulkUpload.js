"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "@/widgets/BulkUpload/BulkUpload.js";
import axios from "axios";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { FaWpforms } from "react-icons/fa";
import { useRouter } from "next/navigation";

const Page = (props) => {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [shown, setShown] = useState(true);
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const [fileDetails, setFileDetails] = useState("");
  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedRecordsCount, setFailedRecordsCount] = useState(0);
  const tableObjects = {
    tableName: props.fieldLabel + " master",
  };

  const getFileDetails = (fileName) => {
    axios
      .get(props?.fileDetailUrl + fileName)
      .then((response) => {
        if (response) {
          setFileDetails(response.data);
          setGoodDataCount(response.data.goodrecords.length);
          setFailedRecordsCount(response.data.failedRecords.length);

          var tableData = response.data.goodrecords.map((a, i) => {
            return {
              fieldValue: a?.fieldValue,
            };
          });
          var failedRecordsTable = response.data.failedRecords.map((a, i) => {
            return {
              fieldValue:
                props.fieldLabel === "Programs"
                  ? a.program
                  : "" || props.fieldLabel === "Projects"
                  ? a.project
                  : "" || props.fieldLabel === "Activity"
                  ? a.activity
                  : "",
              failedRemark: a?.failedRemark,
            };
          });

          setFailedRecordsTable(failedRecordsTable);
          setGoodRecordsTable(tableData);
        }
      })
      .catch((error) => {
        console.error("Error fetching file details:", error);
      });
  };

  const lowercaseLabel = props.fieldLabel?.toLowerCase();

  return (
    <section className="">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">{props.fieldLabel} Bulk Upload</h1>
          </div>
        </div>

        <div className="">
          <BulkUpload
            url={
              process.env.NEXT_PUBLIC_BASE_URL +
              "/api/" +
              lowercaseLabel +
              "/bulkUpload"
            }
            fileurl={`https://test-lupin.s3.amazonaws.com/${lowercaseLabel}-bulk-upload.xlsx`}
            data={[]}
            getFileDetails={getFileDetails}
            fileDetails={fileDetails}
            goodRecordsHeading={props.goodRecordsHeading}
            failedtableHeading={props.failedtableHeading}
            failedRecordsTable={failedRecordsTable}
            failedRecordsCount={failedRecordsCount}
            goodRecordsTable={goodRecordsTable}
            goodDataCount={goodDataCount}
            tableObjects={tableObjects}
          />
        </div>
      </div>
    </section>
  );
};

export default Page;
