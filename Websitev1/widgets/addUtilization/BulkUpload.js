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
import moment from "moment";

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
    "/api/utilization-details/get/filedetails/"
  );
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const [goodRecordsHeading, setGoodRecordsHeading] = useState({
    centerName: "Center Name",
    approvalDate: "Approval Date",
    approvalNo: "Approval Number",
    voucherDate: "Voucher Date",
    voucherNumber: "Voucher Number",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    unit: "Unit of Measurement",
    unitCost: "Unit Cost",
    quantity: "Quantity",
    totalCost: "Total Cost",
    LHWRF: "LHWRF",
    grant: "External Grant",
    CC: "Community Contribution",
    convergence: "Convergence",
    noOfHouseholds: "Impacted Households",
    noOfBeneficiaries: "Reach (Beneficiaries)",
    activityStatus: "Status",
    convergenceNote: "Convergence Note",
  });

  const [failedtableHeading, setFailedtableHeading] = useState({
    centerName: "Center Name",
    approvalDate: "Approval Date",
    approvalNo: "Approval Number",
    voucherDate: "Voucher Date",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    unit: "Unit of Measurement",
    unitCost: "Unit Cost",
    quantity: "Quantity",
    totalCost: "Total Cost",
    LHWRF: "LHWRF",
    grant: "External Grant",
    CC: "Community Contribution",
    convergence: "Convergence",
    noOfHouseholds: "Impacted Households",
    noOfBeneficiaries: "Reach (Beneficiaries)",
    activityStatus: "Status",
    convergenceNote: "Convergence Note",
    failedRemark: "Failed Data Remark",
  });
  const [tableObjects, setTableObjects] = useState({
    deleteMethod: "delete",
    apiLink: "/api/utilization-details",
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
      .post("/api/utilization-details/post/list")
      .then((response) => {
        var tableData = response.data.map((a, i) => {
          return {
            centerName: a.centerName,
            approvalDate: moment(a?.approvalDate).format("YYYY-MM-DD"),
            approvalNo: a.approvalNo,
            voucherDate: moment(a.voucherDate).format("YYYY-MM-DD"),
            voucherNumber: a.voucherNumber,
            program: a.program,
            project: a.project,
            activityName: a.activityName,
            subactivityName: a.subactivityName,
            unit: a.unit,
            unitCost: a.unitCost,
            quantity: a.quantity,
            totalCost: a.totalCost,
            LHWRF: a.LHWRF,
            grant: a.grant,
            CC: a.CC,
            convergence: a.convergence,
            noOfHouseholds: a.noOfHouseholds,
            noOfBeneficiaries: a.noOfBeneficiaries,
            activityStatus: a.activityStatus,
            convergenceNote: a.convergenceNote,
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
              approvalDate: moment(a?.approvalDate).format("YYYY-MM-DD"),
              approvalNo: a?.approvalNo,
              voucherDate: moment(a?.voucherDate).format("YYYY-MM-DD"),
              voucherNumber: a?.voucherNumber,
              program: a?.program,
              project: a?.project,
              activityName: a?.activityName,
              subactivityName: a?.subactivityName,
              unit: a?.unit,
              unitCost: a?.unitCost,
              quantity: a?.quantity,
              totalCost: a?.totalCost,
              LHWRF: a?.sourceofFund.LHWRF,
              grant: a?.sourceofFund.grant,
              CC: a?.sourceofFund.CC,
              convergence: a?.convergence,
              noOfHouseholds: a?.noOfHouseholds,
              noOfBeneficiaries: a?.noOfBeneficiaries,
              activityStatus: a?.activityStatus,
              convergenceNote: a?.convergenceNote,
            };
          });

          var failedRecordsTable = response.data.failedRecords.map((a, i) => {
            return {
              centerName: a?.centerName,
              approvalDate: moment(a?.approvalDate).format("YYYY-MM-DD"),
              approvalNo: a?.approvalNo,
              voucherDate: moment(a?.voucherDate).format("YYYY-MM-DD"),
              voucherNumber: a?.voucherNumber,
              program: a?.program,
              project: a?.project,
              activityName: a?.activityName,
              subactivityName: a?.subactivityName,
              unit: a?.unit,
              unitCost: a?.unitCost,
              quantity: a?.quantity,
              totalCost: a?.totalCost,
              LHWRF: a?.LHWRF,
              grant: a?.externalGrant,
              CC: a?.CC,
              convergence: a?.convergence,
              noOfHouseholds: a?.noOfHouseholds,
              noOfBeneficiaries: a?.noOfBeneficiaries,
              activityStatus: a?.activityStatus,
              convergenceNote: a?.convergenceNote,
              failedRemark: a?.failedRemark,
            };
          });
          setFailedRecordsTable(failedRecordsTable);
          setGoodRecordsTable(tableData);
        }
      })
      .catch((error) => {
        console.log("Error fetching file details:", error);
      });
  };

  // console.log("failedRecordsTable", failedRecordsTable);
  // console.log("goodRecordsTable", goodRecordsTable);

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Utilization Bulk Upload</h1>
            <div className="flex gap-3 my-6 me-10">
              {/* <Tooltip
                content="Add Utilization"
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
                      setLoading(true);
                      router.push(
                        "/" +
                          loggedInRole +
                          "/utilization-management/utilization-submission"
                      );
                    }}
                  />
                )}
              </Tooltip> */}
              <Tooltip
                content="Utilization List"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading2 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <CiViewList
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    // onClick={() => {
                    //   setLoading2(true);
                    //   router.push(
                    //     "/" +
                    //       loggedInRole +
                    //       "/utilization-management/utilization-list"
                    //   );
                    // }}
                    onClick={() => {
                      // setLoading2(true);
                      window.open(
                        `/${loggedInRole}/utilization-management/utilization-list`,
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
              "/api/utilization-details/bulkUpload"
            }
            fileurl="https://test-lupin.s3.amazonaws.com/utilization-details-bulk-upload_updated_3.xlsx"
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
