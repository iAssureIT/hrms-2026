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
    "/api/annual-plans/get/filedetails/"
  );
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const [goodRecordsHeading, setGoodRecordsHeading] = useState({
    centerName: "Center Name",
    year: "Financial Year",
    quarter: "Quarter",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    unit: "Unit of Measurement",
    unitCost: "Unit Cost",
    quantity: "Quantity",
    noOfHouseholds: "Impacted Households",
    noOfBeneficiaries: "Reach (Beneficiaries)",
    totalCost: "Total Cost",
    LHWRF: "LHWRF",
    grant: "External Grant",
    CC: "Community Contribution",
    convergence: "Convergence",
  });

  const [failedtableHeading, setFailedtableHeading] = useState({
    centerName: "Center Name",
    year: "Financial Year",
    quarter: "Quarter",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    unit: "Unit of Measurement",
    unitCost: "Unit Cost",
    quantity: "Quantity",
    noOfHouseholds: "Impacted Households",
    noOfBeneficiaries: "Reach (Beneficiaries)",
    totalCost: "Total Cost",
    LHWRF: "LHWRF",
    grant: "External Grant",
    CC: "Community Contribution",
    convergence: "Convergence",
    failedRemark: "Failed Data Remark",
  });
  const [tableObjects, setTableObjects] = useState({
    deleteMethod: "delete",
    apiLink: "/api/annual-plans",
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
      .post("/api/annual-plans/post/list")
      .then((response) => {
        var tableData = response.data.map((a, i) => {
          return {
            centerName: a.centerName,
            year: a.year,
            quarter: a.quarter,
            program: a.program,
            project: a.project,
            activityName: a.activityName,
            subactivityName: a.subactivityName,
            unit: a.unit,
            unitCost: a.unitCost,
            quantity: a.quantity,
            noOfHouseholds: a.noOfHouseholds,
            noOfBeneficiaries: a.noOfBeneficiaries,
            totalCost: a.totalCost,
            LHWRF: a.LHWRF,
            grant: a.grant,
            CC: a.CC,
            convergence: a.convergence,
          };
        });
        setTableData(tableData);
        //   this.setState({
        //     tableData : tableData,
        //     downloadData : tableData,
        //   });
      })
      .catch((error) => {
        if (error.message === "Request failed with status code 401") {
          var userDetails = localStorage.removeItem("userDetails");
          localStorage.clear();
          Swal.fire({
            title: "Your Session is expired.",
            text: "You need to login again. Click OK to go to Login Page",
            // confirmButtonColor: "#f00",
            // icon:"error"
          }).then((okay) => {
            if (okay) {
              window.location.href = "/login";
            }
          });
        }
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
              centerName: a?.centerName,
              year: a?.year,
              quarter: a?.quarter,
              program: a?.program,
              project: a?.project,
              activityName: a?.activityName,
              subactivityName: a?.subactivityName,
              unit: a?.unit,
              unitCost: a?.unitCost,
              quantity: a?.quantity,
              noOfHouseholds: a?.noOfHouseholds,
              noOfBeneficiaries: a?.noOfBeneficiaries,
              totalCost: a?.totalCost,
              LHWRF: a?.LHWRF,
              grant: a?.grant,
              CC: a?.CC,
              convergence: a?.convergence,
            };
          });

          var failedRecordsTable = response.data.failedRecords.map((a, i) => {
            return {
              centerName: a[0]?.centerName,
              year: a[0]?.year,
              quarter: a[0]?.quarter,
              program: a[0]?.program,
              project: a[0]?.project,
              activityName: a[0]?.activityName,
              subactivityName: a[0]?.subactivityName,
              unit: a[0]?.unit,
              unitCost: a[0]?.unitCost,
              quantity: a[0]?.quantity,
              noOfHouseholds: a[0]?.noOfHouseholds,
              noOfBeneficiaries: a[0]?.noOfBeneficiaries,
              totalCost: a[0]?.totalCost,
              LHWRF: a[0]?.LHWRF,
              grant: a[0]?.grant,
              CC: a[0]?.CC,
              convergence: a[0]?.convergence,
              failedRemark: a[0]?.failedRemark,
            };
          });
          setFailedRecordsTable(failedRecordsTable);
          setGoodRecordsTable(tableData);
        }
      })
      .catch((error) => {
        if (error.message === "Request failed with status code 401") {
          // var userDetails = localStorage.removeItem("userDetails");
          // localStorage.clear();
          // Swal.fire({
          //   title: "Your Session is expired.",
          //   text: "You need to login again. Click OK to go to Login Page",
          //   // confirmButtonColor: "#f00",
          //   // icon:"error"
          // }).then((okay) => {
          //   if (okay) {
          //     window.location.href = "/login";
          //   }
          // });
        }
      });
  };

  // console.log("failedRecordsTable", failedRecordsTable);
  // console.log("goodRecordsTable", goodRecordsTable);

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Annual Plan Bulk Upload</h1>
            <div className="flex gap-3 my-6 me-10">
              <Tooltip content="Add Annual Plan" placement="bottom">
                <FaWpforms
                  className="icon hover:text-gray-800 border border-gray-400 p-0.5 hover:border-gray-700 rounded text-[30px]"
                  onClick={() => {
                    window.open(
                      "/admin/annual-plan-management/annual-submission",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                />
              </Tooltip>
              <Tooltip content="Annual Plan List" placement="bottom">
                <CiViewList
                  className="icon hover:text-gray-800 border border-gray-400 p-0.5 hover:border-gray-700 rounded text-[30px]"
                  onClick={() => {
                    window.open(
                      "/admin/annual-plan-management/annual-list",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="">
          <BulkUpload
            url={
              process.env.NEXT_PUBLIC_BASE_URL + "/api/annual-plans/bulkUpload"
            }
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
