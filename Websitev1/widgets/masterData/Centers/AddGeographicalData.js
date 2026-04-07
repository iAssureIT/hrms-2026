"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "@/widgets/BulkUpload/BulkUpload_Geographical_Data.js";
import axios from "axios";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { FaWpforms, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { BsPlusSquare } from "react-icons/bs";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";

const Page = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  // console.log("userDetails  =>", userDetails);
  const [center_id, setCenter_id] = useState("all");

  const [tableData, setTableData] = useState([]);
  const [shown, setShown] = useState(true);
  const [fileDetailUrl, setFileDetailUrl] = useState(
    "/api/centers/get/filedetails/"
  );
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const [goodRecordsHeading, setGoodRecordsHeading] = useState({
    centerName: "Center Name",
    state: "State",
    district: "District",
    block: "Block",
    village: "Village",
  });

  const [failedtableHeading, setFailedtableHeading] = useState({
    centerName: "Center Name",
    state: "State",
    district: "District",
    block: "Block",
    village: "Village",
    failedRemark: "Failed Data Remark",
  });
  const [tableObjects, setTableObjects] = useState({
    deleteMethod: "delete",
    apiLink: "/api/centers",
    downloadApply: true,
    paginationApply: false,
    searchApply: false,
  });
  // "editId"              : props.match.params ? props.match.params.stateID : '',
  const [fileDetails, setFileDetails] = useState();
  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedRecordsCount, setFailedRecordsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  useEffect(() => {
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
      setCenter_id("all");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
      setCenter_id(userDetails.center_id);
    }
  }, []);

  const getFileDetails = (fileName) => {
    axios
      .get(fileDetailUrl + fileName)
      .then((response) => {
        console.log("response",response)
        if (response) {
          setFileDetails(response.data);
          setGoodDataCount(response.data.goodrecords.length);
          setFailedRecordsCount(response.data.failedRecords[0].length);

          var tableData = response.data.goodrecords.map((a, i) => {
            return {
              centerName: a?.centerName,
              village: a?.village,
              block: a?.block,
              district: a?.district,
              state: a?.state,
            };
          });
          var failedRecordsTable = response.data.failedRecords[0].map((a, i) => {
            return {
              centerName: a?.centerName,
              village: a?.village,
              block: a?.block,
              district: a?.district,
              state: a?.state,
              failedRemark: a?.failedRemark,
            };
          });
          setFailedRecordsTable(failedRecordsTable);
          setGoodRecordsTable(tableData);
        }
      })
      .catch((error) => {
        
      });
  };


  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Geographical Data Bulk Upload</h1>
            <div className="flex gap-3 my-6 me-10">
              <Tooltip
                content="Centers List"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading2 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <CiViewList
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      // setLoading2(true);
                      window.open(
                        "/" +loggedInRole +"/master-data/center-details/center-details-list",
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
              "/api/centers/geographical-data-bulkUpload"
            }
            fileurl="https://test-lupin.s3.amazonaws.com/geographical-data-bulk-upload.xlsx"
            data={[]}
            tableObjects={tableObjects}
            goodRecordsHeading={goodRecordsHeading}
            failedtableHeading={failedtableHeading}
          />
        </div>
      </div>
    </section>
  );
};

export default Page;
