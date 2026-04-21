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
        if (response && response.data) {
          console.log("response", response);

          const goodrecords = response.data.goodrecords || [];
          const failedRecords = response.data.failedRecords || [];

          setFileDetails(response.data);
          setGoodDataCount(goodrecords.length);
          setFailedRecordsCount(failedRecords.length);

          var tableData = goodrecords.map((a) => ({
            fieldValue: a?.fieldValue,
          }));

          var failedRecordsTable = failedRecords.map((a) => ({
            fieldValue: a?.fieldValue,
            failedRemark: a?.failedRemark,
          }));

          setFailedRecordsTable(failedRecordsTable);
          setGoodRecordsTable(tableData);
        }
      })
      .catch((error) => {
        console.error("Error fetching file details:", error);
      });
  };


  console.log("goodRecordsTable", goodRecordsTable);

  const lowercaseLabel = props.fieldLabel?.toLowerCase();

  console.log("fileDetails", fileDetails)

  return (
    <div className="admin-box box-primary">
      <div className="p-6">
        <BulkUpload
          url={
            process.env.NEXT_PUBLIC_BASE_URL +
            "/api/" +
            lowercaseLabel +
            "/bulkUpload"
          }
          fileurl={`https://prod-lupinmis.s3.amazonaws.com/${lowercaseLabel}-bulk-upload.xlsx`}
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
  );
};

export default Page;
