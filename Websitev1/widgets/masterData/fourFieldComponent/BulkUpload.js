"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "@/widgets/BulkUpload/BulkUpload";
import axios from "axios";
import Swal from "sweetalert2";
import { CiViewList } from "react-icons/ci";
import { FaWpforms, FaSpinner, FaPlusSquare, FaPlus } from "react-icons/fa";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";
import { BsPlusSquare } from "react-icons/bs";

const Page = () => {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [shown, setShown] = useState(true);
  const [fileDetailUrl, setFileDetailUrl] = useState(
    "/api/subactivity-mapping/get/filedetails/"
  );
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const goodRecordsHeading = {
    field1Value: "program",
    field2Value: "project",
    field3Value: "activity",
    inputValue: "subactivity",
  };
  const failedtableHeading = {
    program: "program",
    project: "project",
    activityName: "activity",
    subactivityName: "subactivity",
    failedRemark: "Failed Data Remark",
  };
  const [tableHeading, setTableHeading] = useState({
    field1Value: "program",
    field2Value: "project",
    field3Value: "activity",
    inputValue: "subactivity",
    actions: "Action",
  });
  const [downloadtableHeading, setDownloadtableHeading] = useState({
    field1Value: "program",
    field2Value: "project",
    field3Value: "activity",
    inputValue: "subactivity",
  });
  const [tableObjects, setTableObjects] = useState({
    deleteMethod: "delete",
    apiLink: "/api/subactivity-mapping",
    downloadApply: true,
    paginationApply: false,
    searchApply: false,
  });
  // "editId"              : props.match.params ? props.match.params.stateID : '',
  const [fileDetails, setFileDetails] = useState();
  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedRecordsCount, setFailedRecordsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const uploadedData = (data) => {
    // getData();
  };

  const getFileDetails = (fileName) => {
    // /get/filedetails/:center_id/:fileName  centerid is not added yet
    axios
      .get(fileDetailUrl + fileName)
      .then((response) => {
        if (response) {
          setFileDetails(response.data);
          setGoodDataCount(response.data.goodrecords.length);
          setFailedRecordsCount(response.data.totalRecords);

          var tableData = response.data.goodrecords.map((a, i) => {
            return {
              field1Value: a?.field1Value,
              field2Value: a?.field2Value,
              field3Value: a?.field3Value,
              inputValue: a?.inputValue,
            };
          });
          var failedRecordsTable = response.data.failedRecords.map((a, i) => {
            return {
              program: a?.program,
              project: a?.project,
              activityName: a?.activityName,
              subactivityName: a?.activityName,
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

  // console.log("failedRecordsTable", failedRecordsTable);
  // console.log("goodRecordsTable", goodRecordsTable);

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Subactivity Bulk Upload</h1>
            <div className="flex gap-3 my-5 me-10">
              <Tooltip
                content="Add Subactivity"
                className="bg-[#3c8dbc]"
                placement="bottom"
                arrow={false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-center text-[#3c8dbc] inline-flex mx-2" />
                ) : (
                  <BsPlusSquare
                    className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] hover:border-[#367fa9] rounded text-[30px]"
                    onClick={() => {
                      window.open(
                        "/admin/master-data/program-project-activity-subactivity",
                        '_self'
                        // "noopener,noreferrer"
                      );
                    }}
                  />
                )}
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="">
          <BulkUpload
            url={
              process.env.NEXT_PUBLIC_BASE_URL +
              "/api/subactivity-mapping/bulkUpload"
            }
            fileurl="https://test-lupin.s3.amazonaws.com/subactivity-bulk-upload.xlsx"
            data={[]}
            uploadedData={uploadedData}
            // getData={getData}
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

export default Page;
