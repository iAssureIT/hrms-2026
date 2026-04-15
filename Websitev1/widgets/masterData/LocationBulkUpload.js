"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "@/widgets/BulkUpload/BulkUpload";
import axios from "axios";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { FaWpforms } from "react-icons/fa";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [shown, setShown] = useState(true);
  const [fileDetailUrl, setFileDetailUrl] = useState(
    "/api/centers/get/filedetails/"
  );
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const [goodRecordsHeading, setGoodRecordsHeading] = useState({
    village: "Village",
    block: "Block",
    district: "District",
    state: "state",
    pincode: "Project",
  });

  const [failedtableHeading, setFailedtableHeading] = useState({
    village: "Village",
    block: "Block",
    district: "District",
    state: "state",
    pincode: "Project",
    failedRemark: "Failed Data Remark",
  });
  const [tableObjects, setTableObjects] = useState({
    deleteMethod: "delete",
    apiLink: "//api/centers",
    downloadApply: true,
    paginationApply: false,
    searchApply: false,
  });
  // "editId"              : props.match.params ? props.match.params.stateID : '',
  const [fileDetails, setFileDetails] = useState();
  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedRecordsCount, setFailedRecordsCount] = useState(0);

  const uploadedData = (data) => {
    getData();
  };

  const getData = () => {
    axios
      .post("/api/centers/post/list")
      .then((response) => {
        var tableData = response.data.map((a, i) => {
          return {
            village: a.village,
            block: a.block,
            district: a.district,
            state: a.state,
            pincode: a.pincode,
          };
        });
        setTableData(tableData);
        //   this.setState({
        //     tableData : tableData,
        //     downloadData : tableData,
        //   });
      })
      .catch((error) => {
       
      });
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
              village: a?.village,
              block: a?.block,
              district: a?.district,
              state: a?.state,
              pincode: a?.pincode,
            };
          });

          var failedRecordsTable = response.data.failedRecords.map((a, i) => {
            return {
              village: a[0]?.village,
              block: a[0]?.block,
              district: a[0]?.district,
              state: a[0]?.state,
              pincode: a[0]?.pincode,
              failedRemark: a[0]?.failedRemark,
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
    <section className="hr-section">
      <div className="hr-card hr-fade-in border-0 rounded-md !p-0">
        <div className="border-b border-slate-100 py-4 px-8 mb-4 flex items-center justify-between">
          <h1 className="hr-heading">Location Master Bulk Upload</h1>
          <div className="flex gap-3 me-10">
            <Tooltip content="Add Center Details" placement="bottom" arrow={false}>
              <FaWpforms
                className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]"
                onClick={() => {
                  router.push("/admin/master-data/center-details/center-details-submission");
                }}
              />
            </Tooltip>
            <Tooltip content="Center Details List" placement="bottom" arrow={false}>
              <CiViewList
                className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]"
                onClick={() => {
                  router.push("/admin/master-data/center-details/center-details-list");
                }}
              />
            </Tooltip>
          </div>
        </div>
        <div className="px-8 pb-8">
          <BulkUpload
            url={process.env.NEXT_PUBLIC_BASE_URL + "/api/centers/bulkUpload"}
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

export default Page;
