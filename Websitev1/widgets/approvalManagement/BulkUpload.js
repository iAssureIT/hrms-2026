"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "@/widgets/BulkUpload/BulkUpload_Lupin";
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
    "/api/approval-details/get/filedetails/"
  );
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const [goodRecordsHeading, setGoodRecordsHeading] = useState({
    centerName: "Center Name",
    approvalSubmissionDate: "Approval Date",
    approvalNo: "Approval Number",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    quantity: "Quantity",
    unit: "Unit",
    unitCost: "Unit Cost",
    noOfHouseholds: "Impacted Households",
    noOfBeneficiaries: "Reach (Beneficiaries)",
    totalCost: "Total Cost",
    grant: "External Grant",
    CC: "Community Contribution",
    LHWRF: "LHWRF",
    convergence: "Convergence",
  });

  const [failedtableHeading, setFailedtableHeading] = useState({
    centerName: "Center Name",
    approvalSubmissionDate: "Approval Date",
    // approvalNo: "Approval Number",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    quantity: "Quantity",
    unit: "Unit",
    unitCost: "Unit Cost",
    noOfHouseholds: "Impacted Households",
    noOfBeneficiaries: "Reach (Beneficiaries)",
    totalCost: "Total Cost",
    grant: "External Grant",
    CC: "Community Contribution",
    LHWRF: "LHWRF",
    convergence: "Convergence",
    failedRemark: "Failed Data Remark",
  });
  const [tableObjects, setTableObjects] = useState({
    deleteMethod: "delete",
    apiLink: "/api/approval-details",
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

  const uploadedData = (data) => {
    getData();
  };

  const getData = () => {
    axios
      .post("/api/approval-details/post/list")
      .then((response) => {
        var tableData = response.data.map((a, i) => {
          return {
            centerName: a.centerName,
            approvalSubmissionDate: a.approvalSubmissionDate,
            approvalNo: a.approvalNo,
            program: a.program,
            project: a.project,
            activityName: a.activityName,
            subactivityName: a.subactivityName,
            quantity: a.quantity,
            unit: a.unit,
            unitCost: a.unitCost,
            noOfHouseholds: a.noOfHouseholds,
            noOfBeneficiaries: a.noOfBeneficiaries,
            totalCost: a.totalCost,
            grant: a.grant,
            CC: a.CC,
            LHWRF: a.LHWRF,
            convergence: a.convergence,
            status: a.status,
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
              centerName: a?.centerName,
              approvalSubmissionDate: a?.approvalSubmissionDate,
              approvalNo: a?.approvalNo,
              program: a?.program,
              project: a?.project,
              activityName: a?.activityName,
              subactivityName: a?.subactivityName,
              quantity: a?.quantity,
              unit: a?.unit,
              unitCost: a?.unitCost,
              noOfHouseholds: a?.noOfHouseholds,
              noOfBeneficiaries: a?.noOfBeneficiaries,
              totalCost: a?.totalCost,
              grant: a?.sourceofFund.grant,
              CC: a?.sourceofFund.CC,
              LHWRF: a?.sourceofFund.LHWRF,
              convergence: a?.convergence,
            };
          });

          var failedRecordsTable = response.data.failedRecords.map((a, i) => {
            return {
              centerName: a?.centerName,
              approvalSubmissionDate: a?.approvalSubmissionDate,
              // approvalNo: a?.approvalNo,
              program: a?.program,
              project: a?.project,
              activityName: a?.activityName,
              subactivityName: a?.subactivityName,
              quantity: a?.quantity,
              unit: a?.unit,
              unitCost: a?.unitCost,
              noOfHouseholds: a?.noOfHouseholds,
              noOfBeneficiaries: a?.noOfBeneficiaries,
              totalCost: a?.totalCost,
              grant: a?.externalGrant,
              CC: a?.CC,
              LHWRF: a?.LHWRF,
              convergence: a?.convergence,
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
            <h1 className="heading">Approval Management Bulk Upload</h1>
            <div className="flex gap-3 my-6 me-10">
              {/* <Tooltip
                content="Add Approval Form"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <BsPlusSquare
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      window.open(
                        `/${loggedInRole}/approval-management/approval-submission`,
                        '_self'
                        // "noopener,noreferrer"
                      );
                    }}
                  />
                )}
              </Tooltip> */}
              <Tooltip
                content="Approval List"
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
                      window.open(
                        `/${loggedInRole}/approval-management/approval-list`,
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
              "/api/approval-details/bulkUpload"
            }
            fileurl="https://test-lupin.s3.amazonaws.com/approval-bulk-upload (14).xlsx"
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
