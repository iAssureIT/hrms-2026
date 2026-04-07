"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "@/widgets/BulkUpload/BulkUpload";
import axios from "axios";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { FaWpforms, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { BsPlusSquare } from "react-icons/bs";
import { usePathname, useParams } from "next/navigation";
import ls from "localstorage-slim";

const ContributorsBulkUpload = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  const [center_id, setCenter_id] = useState("all");

  const [contributorData, setContributorData] = useState([]);
  const [fileDetailUrl, setFileDetailUrl] = useState(
    "/api/fund-receipts/get/community-contributors/filedetails/"
  );
  const [goodrecords, setGoodrecords] = useState([]);
  const [failedRecords, setFailedRecords] = useState([]);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);

  // Adjusting contributor table headings for good and failed records
  const goodrecordsHeading = {
    contributorName: "Contributor Name",
    village: "Village",
    aadhaarNo: "Aadhaar No",
    amountDeposited: "Amount Deposited",
  };

  const failedRecordsHeading = {
    contributorName: "Contributor Name",
    village: "Village",
    aadhaarNo: "Aadhaar No",
    amountDeposited: "Amount Deposited",
    failedRemark: "Failed Data Remark",
  };

  const tableObjects = {
    deleteMethod: "delete",
    apiLink: "/api/fund-receipts",
    downloadApply: true,
    paginationApply: false,
    searchApply: false,
  };

  const [fileDetails, setFileDetails] = useState();
  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedDataCount, setFailedDataCount] = useState(0);

  const uploadedData = (data) => {
    // Fetch updated contributor data after successful bulk upload
  };

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
        if (response) {
          setFileDetails(response.data);
          setGoodDataCount(response.data.goodrecords.length);
          setFailedDataCount(response.data.failedRecords.length);

          const goodRecordsTable = response.data.goodrecords.map((a) => ({
            contributorName: a.contributorData.contributorName,
            village: a.contributorData.village,
            aadhaarNo: a.contributorData.aadhaarNo,
            amountDeposited: a.contributorData.amountDeposited,
          }));

          const failedRecordsTable = response.data.failedRecords.map((a) => ({
            contributorName: a.contributorName,
            village: a.village,
            aadhaarNo: a.aadhaarNo,
            amountDeposited: a.amountDeposited,
            failedRemark: a.failedRemark,
          }));

          setGoodrecords(goodRecordsTable);
          setFailedRecords(failedRecordsTable);
        }
      })
      .catch((error) => {
        if (error.message === "Request failed with status code 401") {
          // Handle expired session error here if needed
        }
      });
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Contributors Bulk Upload</h1>
            <div className="flex gap-3 my-6 me-10">
              <Tooltip
                content="Add Community Contribution"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading3 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <BsPlusSquare
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    // onClick={() => {
                    //   setLoading3(true);
                    //   router.push(
                    //     "/" + loggedInRole + "/fund-management/add-cc"
                    //   );
                    // }}
                    onClick={() => {
                      window.open(
                        "/" + loggedInRole + "/fund-management/add-cc",
                        '_self'
                        // "noopener,noreferrer"
                      );
                    }}
                  />
                )}
              </Tooltip>
              <Tooltip
                content="Community Contribution List"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading4 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <CiViewList
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    // onClick={() => {
                    //   setLoading4(true);
                    //   router.push(
                    //     "/" + loggedInRole + "/fund-management/cc-list"
                    //   );
                    // }}                    
                    onClick={() => {
                      window.open(
                        "/" + loggedInRole + "/fund-management/cc-list",
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
              "/api/fund-receipts/community-contribution/contributors-bulkUpload"
            }
            fileurl="https://test-lupin.s3.amazonaws.com/community-contributors-bulk-upload.xlsx"
            // "https://test-lupin.s3.amazonaws.com/contributors-bulk-upload.xlsx"
            data={{ _id: params._id }}
            uploadedData={uploadedData}
            getFileDetails={getFileDetails} // Fetch details for Contributor Data
            fileDetails={fileDetails}
            tableObjects={tableObjects}
            goodRecordsHeading={goodrecordsHeading}
            failedtableHeading={failedRecordsHeading}
            failedRecordsTable={failedRecords}
            failedRecordsCount={failedDataCount}
            goodRecordsTable={goodrecords}
            goodDataCount={goodDataCount}
          />
        </div>
      </div>
    </section>
  );
};

export default ContributorsBulkUpload;
