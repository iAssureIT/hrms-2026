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
    "/api/fund-receipts/get/filedetails/Community Contribution/"
  );
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const [goodRecordsHeading, setGoodRecordsHeading] = useState({
    centerName: "Center Name",
    fundType: "Fund Type",
    approvalNo: "Approval Number",
    paymentType: "Payment Type",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    fundReceiptNumber: "Voucher Receipt Number",
    amountReceivedDate: "Amount Received Date",
    amountReceived: "Amount Received",
    depositSlipNumber: "Deposit Slip Number",
    utrTransactionNumber: "UTR/Transaction Number",
    lhwrfBankName: "LHWRF Bank Name",
    lhwrfBranchName: "Branch Name",
    lhwrfAccountNumber: "Account Number",
  });

  const [failedtableHeading, setFailedtableHeading] = useState({
    centerName: "Center Name",
    approvalNo: "Approval Number",
    paymentType: "Payment Type",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    amountReceivedDate: "Amount Received Date",
    amountReceived: "Amount Received",
    depositSlipNumber: "Deposit Slip Number",
    utrTransactionNumber: "UTR/Transaction Number",
    lhwrfBankName: "LHWRF Bank Name",
    lhwrfBranchName: "Branch Name",
    lhwrfAccountNumber: "Account Number",
    failedRemark: "Failed Data Remark",
  });
  const [tableObjects, setTableObjects] = useState({
    deleteMethod: "delete",
    apiLink: "/api/fund-receipts",
    downloadApply: true,
    paginationApply: false,
    searchApply: false,
  });
  const [fileDetails, setFileDetails] = useState();
  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedRecordsCount, setFailedRecordsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);

  const uploadedData = (data) => {
    getData();
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

  const getData = () => {
    axios
      .post("/api/fund-receipts/post/list")
      .then((response) => {
        // console.log("response", response);
        var tableData = response.data.map((a, i) => {
          return {
            approvalNo: a.approvalNo,
            paymentType: a.paymentType,
            centerName: a.centerName,
            program: a.program,
            project: a.project,
            activityName: a.activityName,
            subactivityName: a.subactivityName,
            fundReceiptNumber: a.fundReceiptNumber,
            amountReceivedDate: a.amountReceivedDate,
            amountReceived: a.amountReceived,
            depositSlipNumber: a.depositSlipNumber,
            utrTransactionNumber: a.utrTransactionNumber,
            lhwrfBankName: a.lhwrfBankName,
            lhwrfBranchName: a.lhwrfBranchName,
            lhwrfAccountNumber: a.lhwrfAccountNumber,
            totalContributors: a.totalContributors,
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
          setFailedRecordsCount(response.data.failedRecords.length);
          var tableData = response.data.goodrecords.map((a, i) => {
            return {
              centerName: a?.centerName,
              fundType: a.fundType,
              approvalNo: a.approvalNo,
              paymentType: a.paymentType,
              program: a?.program,
              project: a?.project,
              activityName: a?.activityName,
              subactivityName: a?.subactivityName,
              fundReceiptNumber: a.fundReceiptNumber,
              amountReceivedDate: a.amountReceivedDate,
              amountReceived: a.amountReceived,
              depositSlipNumber: a.depositSlipNumber,
              utrTransactionNumber: a.utrTransactionNumber,
              lhwrfBankName: a.lhwrfBankName,
              lhwrfBranchName: a.lhwrfBranchName,
              lhwrfAccountNumber: a.lhwrfAccountNumber,
            };
          });

          var failedRecordsTable = response.data.failedRecords.map((a, i) => {
            return {
              centerName: a?.centerName,
              fundType: a.fundType,
              approvalNo: a.approvalNo,
              paymentType: a.paymentType,
              program: a?.program,
              project: a?.project,
              activityName: a?.activityName,
              subactivityName: a?.subactivityName,
              fundReceiptNumber: a?.fundReceiptNumber,
              amountReceivedDate: a?.amountReceivedDate,
              amountReceived: a?.amountReceived,
              depositSlipNumber: a?.depositSlipNumber,
              utrTransactionNumber: a?.utrTransactionNumber,
              lhwrfBankName: a?.lhwrfBankName,
              lhwrfBranchName: a?.lhwrfBranchName,
              lhwrfAccountNumber: a?.lhwrfAccountNumber,
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

  // console.log("failedRecordsTable", failedRecordsTable);
  // console.log("goodRecordsTable", goodRecordsTable);

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Community Contribution Fund Bulk Upload</h1>
            <div className="flex gap-3 my-6 me-10">
              <Tooltip
                content="Add Community Contribution"
                placement="bottom"
                className="bg-green"
                arrow={false}
                s
              >
                {loading3 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <BsPlusSquare
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      setLoading3(true);
                      router.push(
                        "/" + loggedInRole + "/fund-management/add-cc"
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
                    onClick={() => {
                      setLoading4(true);
                      router.push(
                        "/" + loggedInRole + "/fund-management/cc-list"
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
              "/api/fund-receipts/community-contribution/bulkUpload"
            }
            fileurl="https://test-lupin.s3.amazonaws.com/community-contribution-bulk-upload.xlsx"
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
