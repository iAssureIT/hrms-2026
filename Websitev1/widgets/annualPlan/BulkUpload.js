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
    "/api/annual-plans/get/filedetails/"
  );
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const goodRecordsHeading = {
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
  };
  const failedtableHeading = {
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
    externalGrant: "External Grant",
    CC: "Community Contribution",
    convergence: "Convergence",
    failedRemark: "Failed Data Remark",
  };
  const tableObjects = {
    deleteMethod: "delete",
    apiLink: "/api/annual-plans",
    downloadApply: true,
    paginationApply: false,
    searchApply: false,
  };
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
      .post("/api/annual-plans/post/list")
      .then((response) => {
        // console.log("response", response);
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
      })
      .catch((error) => {});
  };

  const getFileDetails = (fileName) => {
    // /get/filedetails/:center_id/:fileName  centerid is not added yet
    axios
      .get(fileDetailUrl + fileName)
      .then((response) => {
        // console.log("response goodrecords====================", fileDetailUrl + fileName, response.data.goodrecords);
        // console.log("response failedRecords====================", fileDetailUrl + fileName, response.data.failedRecords);
        if (response) {
          setFileDetails(response.data);
          setGoodDataCount(response.data.goodrecords.length);
          setFailedRecordsCount(response.data.failedRecords.length);
          var tableData = response?.data?.goodrecords?.map((a, i) => {
            return {
              centerName: a?.centerName ? a?.centerName : "-NA-",
              year: a?.year ? a?.year : "-NA-",
              quarter: a?.quarter ? a?.quarter : "-NA-",
              program: a?.program ? a?.program : "-NA-",
              project: a?.project ? a?.project : "-NA-",
              activityName: a?.activityName ? a?.activityName : "-NA-",
              subactivityName: a?.subactivityName ? a?.subactivityName : "-NA-",
              unit: a?.unit ? a?.unit : "-NA-",
              unitCost: a?.unitCost ? a?.unitCost : "-NA-",
              quantity: a?.quantity ? a?.quantity : "-NA-",
              noOfHouseholds: a?.noOfHouseholds ? a?.noOfHouseholds : "-NA-",
              noOfBeneficiaries: a?.noOfBeneficiaries
                ? a?.noOfBeneficiaries
                : "-NA-",
              totalCost: a?.totalCost ? a?.totalCost : "-NA-",
              LHWRF: a?.sourceofFund.LHWRF ? a?.sourceofFund.LHWRF : "-NA-",
              grant: a?.sourceofFund.grant ? a?.sourceofFund.grant : "-NA-",
              CC: a?.sourceofFund.CC ? a?.sourceofFund.CC : "-NA-",
              convergence: a?.convergence ? a?.convergence : "-NA-",
            };
          });
          var failedRecordsTable = response?.data?.failedRecords?.map(
            (a, i) => {
              return {
                centerName: a?.centerName ? a?.centerName : "-NA-",
                year: a?.year ? a?.year : "-NA-",
                quarter: a?.quarter ? a?.quarter : "-NA-",
                program: a?.program ? a?.program : "-NA-",
                project: a?.project ? a?.project : "-NA-",
                activityName: a?.activityName ? a?.activityName : "-NA-",
                subactivityName: a?.subactivityName
                  ? a?.subactivityName
                  : "-NA-",
                unit: a?.unit ? a?.unit : "-NA-",
                unitCost: a?.unitCost ? a?.unitCost : "-NA-",
                quantity: a?.quantity ? a?.quantity : "-NA-",
                noOfHouseholds: a?.noOfHouseholds ? a?.noOfHouseholds : "-NA-",
                noOfBeneficiaries: a?.noOfBeneficiaries
                  ? a?.noOfBeneficiaries
                  : "-NA-",
                totalCost: a?.totalCost ? a?.totalCost : "-NA-",
                LHWRF: a?.LHWRF ? a?.LHWRF : "-NA-",
                externalGrant: a?.externalGrant ? a?.externalGrant : "-NA-",
                CC: a?.CC ? a?.CC : "-NA-",
                convergence: a?.convergence ? a?.convergence : "-NA-",
                failedRemark: a?.failedRemark ? a?.failedRemark : "-NA-",
              };
            }
          );
          setFailedRecordsTable(failedRecordsTable);
          setGoodRecordsTable(tableData);

          // console.log("tableData", tableData);
          // console.log("failedRecordsTable", failedRecordsTable);
        }
      })
      .catch((error) => {});
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Annual Plan Bulk Upload</h1>
            <div className="flex gap-3 my-6 me-10">
              <Tooltip
                content="Add Annual Plan"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <BsPlusSquare
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    // onClick={() => {
                    //   setLoading(true);
                    //   router.push(
                    //     "/" +
                    //       loggedInRole +
                    //       "/annual-plan-management/annual-submission"
                    //   );
                    // }}
                    onClick={() => {
                      window.open(
                        `/${loggedInRole}/annual-plan-management/annual-submission`,
                        '_self'
                        // "noopener,noreferrer"
                      );
                    }}

                  />
                )}
              </Tooltip>
              <Tooltip
                content="Annual Plan List"
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
                    //       "/annual-plan-management/annual-list"
                    //   );
                    // }}
                    onClick={() => {
                      window.open(
                        `/${loggedInRole}/annual-plan-management/annual-list`,
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
              process.env.NEXT_PUBLIC_BASE_URL + "/api/annual-plans/bulkUpload"
            }
            fileurl="https://test-lupin.s3.amazonaws.com/annual-plan-bulk-upload-1.xlsx"
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
