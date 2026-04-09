"use client";

import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import swal from "sweetalert2";
import { IoCloseCircleSharp } from "react-icons/io5";
import GenericTable from "./FilterTable";
import ProgressBar from "@/widgets/BulkUpload/ProgressBar";
import { Tooltip } from "flowbite-react";
import { BsPlusSquare } from "react-icons/bs";
import { CiViewList } from "react-icons/ci";
import { useRouter } from "next/navigation";

const VendorBulkUploadPage = () => {
  /* =========================================================
     STATES
  ========================================================= */

  const [user_id, setUser_id] = useState();
  const [inputFileData, setInputFileData] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [fileName, setFileName] = useState("");
  const [uploadFinishMessage, setUploadFinishMessage] = useState("");

  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const [duplicateRecordsTable, setDuplicateRecordsTable] = useState([]);

  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedRecordsCount, setFailedRecordsCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);

  const [activeTab, setActiveTab] = useState("success");

  const fileInput = useRef(null);

  const [vendors, setVendors] = useState([]);
  const [totalRecs, setTotalRecs] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const getData = async (page = pageNumber, limit = recsPerPage) => {
    try {
      setLoading(true);

      // const response = await fetch("/api/getVendors", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     page,
      //     limit,
      //     search,
      //   }),
      // });

      // const result = await response.json();

      // if (result.success) {
      //   setVendors(result.data);
      //   setTotalRecs(result.total);
      //   setPageNumber(result.currentPage);
      //   setRecsPerPage(result.limit);
      // }

    } catch (error) {
      console.error("GET DATA ERROR:", error);
    } finally {
      setLoading(false);
    }
  };



  /* =========================================================
     TABLE HEADINGS
  ========================================================= */

  const goodRecordsHeading = {
    vendorCode: "Vendor Code",
    nameOfCompany: "Company Name",
    vendorCategory: "Vendor Category",
    vendorType: "Vendor SubCategory",
    lupinFoundationCenterName: "Center Name",
    panNumber: "PAN Number",
    gstin: "GSTIN",
    primaryContactPersonName: "Contact Person",
    mobileNumber: "Mobile Number",
    officialEmailId: "Official Email",
    bankName: "Bank Name",
    branchName: "Branch Name",
    accountNumber: "Account Number",
    ifscCode: "IFSC Code",
    city: "City",
    state: "State",
    pinCode: "Pin Code",
  };

  const failedtableHeading = {
    vendorName: "Company Name",
    vendorCategory: "Vendor Category",
    vendorSubCategory: "Vendor SubCategory", // ✅ FIXED
    centerName: "Center Name",
    panNumber: "PAN Number",
    gstin: "GSTIN",
    primaryContactPersonName: "Contact Person",
    mobileNumber: "Mobile Number",
    officialEmailId: "Official Email",
    bankName: "Bank Name",
    branchName: "Branch Name",
    accountNumber: "Account Number",
    ifscCode: "IFSC Code",
    city: "City",
    state: "State",
    pinCode: "Pin Code",
    failedRemark: "Failed Remark",
  };

  const tableObjects = {
    tableName: "Vendor Master",
    noPagination: true,
  }


  /* =========================================================
     GET USER ID
  ========================================================= */

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const parsed = JSON.parse(userDetails);
      setUser_id(parsed.user_id);
    }
  }, []);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      swal.fire("Invalid file format");
      return;
    }

    setFileName(file.name);
    handleFile(file);
  };

  const handleFile = (file) => {
    const reader = new FileReader();

    reader.onload = ({ target: { result } }) => {
      const wb = XLSX.read(result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      let documentObj = [];

      for (let i = 1; i < data.length; i++) {
        let record = {};
        data[0].forEach((header, index) => {
          record[header] = data[i][index] || "-";
        });
        documentObj.push(record);
      }

      setInputFileData(documentObj);
    };

    reader.readAsBinaryString(file);
  };

  const deleteFile = () => {
    setFileName("");
    setInputFileData([]);
    setPercentage(0);
    setUploadFinishMessage("");
  };

  /* =========================================================
     BULK UPLOAD API
  ========================================================= */

  // const bulkUpload = async () => {

  //   if (!inputFileData.length) return;

  //   try {
  //     const response = await axios.post(
  //       "/api/vendor-master/bulk-upload",
  //       {
  //         data: inputFileData,
  //         fileName,
  //         createdBy: user_id,
  //         totalRecords: inputFileData.length,
  //       }
  //     );

  //     const data = response.data;

  //     if (data.completed) {
  //       setPercentage(100);
  //       setUploadFinishMessage("Upload Completed Successfully!");

  //       /* ===============================
  //          COUNTS
  //       =============================== */

  //       setGoodDataCount(data.validRecords || 0);
  //       setFailedRecordsCount(data.invalidRecords || 0);
  //       setDuplicateCount(data.duplicates || 0);

  //       /* ===============================
  //          SUCCESS DATA
  //       =============================== */

  //       const goodTableData = (data.validData || []).map((a) => ({
  //         vendorCode: a.vendorCode,
  //         vendorStatus: a.vendorStatus,
  //         nameOfCompany: a.vendorInfo?.nameOfCompany,
  //         vendorCategory: a.vendorInfo?.vendorCategory,
  //         vendorType: a.vendorInfo?.vendorType,
  //         lupinFoundationCenterName: a.vendorInfo?.lupinFoundationCenterName,
  //         panNumber: a.vendorInfo?.panNumber,
  //         gstin: a.vendorInfo?.gstin,
  //         primaryContactPersonName:
  //           a.vendorInfo?.primaryContactPersonName,
  //         mobileNumber: a.vendorInfo?.mobileNumber,
  //         officialEmailId: a.vendorInfo?.officialEmailId,
  //         bankName: a.bankDetails?.bankName,
  //         branchName: a.bankDetails?.branchName,
  //         accountNumber: a.bankDetails?.accountNumber,
  //         ifscCode: a.bankDetails?.ifscCode,
  //         city: a.addressDetails?.city,
  //         state: a.addressDetails?.state,
  //         pinCode: a.addressDetails?.pinCode,
  //       }));

  //       setGoodRecordsTable(goodTableData);

  //       /* ===============================
  //          FAILED DATA
  //       =============================== */

  //       const failedTableData = (data.failedRecords || []).map((a) => ({
  //         vendorCode: a.vendorCode,
  //         nameOfCompany: a.vendorInfo?.nameOfCompany,
  //         failedRemark: a.failedRemark,
  //       }));

  //       setFailedRecordsTable(failedTableData);

  //       /* ===============================
  //          DUPLICATE DATA (if backend sends)
  //       =============================== */

  //       const duplicateTableData = (data.duplicateData || []).map((a) => ({
  //         vendorCode: a.vendorCode,
  //         nameOfCompany: a.vendorInfo?.nameOfCompany,
  //       }));

  //       setDuplicateRecordsTable(duplicateTableData);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     swal.fire("Something went wrong!");
  //   }

  // };

  const bulkUpload = async () => {
    if (!inputFileData.length) return;

    try {
      const response = await axios.post(
        "/api/vendor-master/bulk-upload",
        {
          data: inputFileData,
          fileName,
          createdBy: user_id,
          totalRecords: inputFileData.length,
        }
      );

      const data = response.data;

      if (data.completed) {
        setPercentage(100);
        setUploadFinishMessage("Upload Completed Successfully!");

        /* ===============================
           COUNTS
        =============================== */
        setGoodDataCount(data.validRecords || 0);
        setFailedRecordsCount(data.invalidRecords || 0);
        setDuplicateCount(data.duplicates || 0);

        swal.fire({
          icon: "success",
          title: "Upload Completed",
          text: `Total: ${inputFileData.length} | Success: ${data.validRecords || 0} | Failed: ${data.invalidRecords || 0}`,
          confirmButtonText: "OK",
        });

        /* ===============================
           SUCCESS DATA
        =============================== */

        const goodTableData = (data.validData || []).map((a) => ({
          vendorCode: a.vendorID, // ✅ FIXED
          nameOfCompany: a.vendorInfo?.nameOfCompany,
          vendorCategory: a.vendorInfo?.vendorCategory,
          vendorType: a.vendorInfo?.vendorSubCategory,
          lupinFoundationCenterName:
            a.vendorInfo?.lupinFoundationCenterName,
          panNumber: a.vendorInfo?.panNumber,
          gstin: a.vendorInfo?.gstin,
          primaryContactPersonName:
            a.vendorInfo?.primaryContactPersonName,
          mobileNumber: a.vendorInfo?.mobileNumber,
          officialEmailId: a.vendorInfo?.officialEmailId,
          bankName: a.bankDetails?.bankName,
          branchName: a.bankDetails?.branchName,
          accountNumber: a.bankDetails?.accountNumber,
          ifscCode: a.bankDetails?.ifscCode,
          city: a.addressDetails?.city,
          state: a.addressDetails?.state,
          pinCode: a.addressDetails?.pinCode,
        }));

        setGoodRecordsTable(goodTableData);

        /* ===============================
           FAILED DATA
        =============================== */
        const failedArray = Array.isArray(
          data.failedRecords?.FailedRecords
        )
          ? data.failedRecords.FailedRecords
          : [];

        const failedTableData = failedArray.map((a) => ({

          vendorName: a.vendorName || "--",
          vendorCategory: a.vendorCategory || "--",
          vendorSubCategory: a.vendorSubCategory || "--",

          centerName:
            a.centerName || "--",

          panNumber: a.panNumber || "--",
          gstin: a.gstin || "--",

          primaryContactPersonName:
            a.primaryContactPersonName || "--",

          mobileNumber: a.mobileNumber || "--",
          officialEmailId: a.officialEmailId || "--",

          bankName: a.bankName || "--",
          branchName: a.branchName || "--",
          accountHolderName: a.accountHolderName || "--",
          accountNumber: a.accountNumber || "--",
          ifscCode: a.ifscCode || "--",
          accountType: a.accountType || "--",

          addressLine1: a.addressLine1 || "--",
          city: a.city || "--",
          district: a.district || "--",
          state: a.state || "--",
          country: a.country || "--",
          pinCode: a.pinCode || "--",

          failedRemark: a.failedRemark || "--",
        }));

        setFailedRecordsTable(failedTableData);

        /* ===============================
           DUPLICATE DATA
        =============================== */
        const duplicateArray = Array.isArray(data.duplicateData)
          ? data.duplicateData
          : [];

        const duplicateTableData = duplicateArray.map((a) => ({
          vendorCode: a.vendorID || "--",
          nameOfCompany:
            a.nameOfCompany || a.vendorInfo?.nameOfCompany || "--",
        }));

        setDuplicateRecordsTable(duplicateTableData);
      }
    } catch (err) {
      console.log("Upload Error:", err);

      swal.fire({
        icon: "error",
        title: "Something went wrong!",
        text:
          err?.response?.data?.message ||
          err.message ||
          "Unknown error occurred",
      });
    }
  };
  /* =========================================================
     UI
  ========================================================= */

  const SheetJSFT = ["xlsx", "xls", "csv"];

  return (
    <section className="section !shadow-none">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex items-center justify-between">
            <h1 className="heading"> Vendor Master Bulk Upload </h1>

            <div className="flex items-center gap-4 lg:me-10">
              <Tooltip
                content="Add New Vendor"
                placement="bottom"
                arrow={false}
                className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
              >
                <div>

                  <BsPlusSquare className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]"
                    onClick={() => {
                      const basePath = window.location.pathname.includes("admin") ? "/admin" : "/asset";
                      router.push(`${basePath}/master-data/vendor-master/add-vendor`);
                    }}
                  />
                </div>
              </Tooltip>

              <Tooltip
                content="Vendor List"
                placement="bottom"
                className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
                arrow={false}
              >
                <CiViewList className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]" onClick={() => {
                  const basePath = window.location.pathname.includes("admin") ? "/admin" : "/asset";
                  router.push(`${basePath}/master-data/vendor-master/vendor-list`)
                }} />
              </Tooltip>
            </div>

          </div>
        </div>

        {/* Upload Section */}
        <div className="m-5 grid">
          <div className="flex justify-between mx-4">
            <div className="">
              <div className=" bulkEmployeeImg">
                <a
                  target="_blank" href={'https://prod-lupinmis.s3.amazonaws.com/Vendor_bulkupload_template.xlsx'}
                  title="Click to download template"
                  download
                >
                  <img src="/images/generic/Excel-download-icon.png" />
                </a>
              </div>
              <div className="bulkEmployeeVerif mx-4">
                <ul className="bodyText text-grayTwo font-normal">
                  <li>
                    Please use attached file format for bulkupload into system.
                  </li>
                  <li>Please do not change the Heading of following file.</li>
                  <li>File format must be .xlsx or .xls.</li>
                  <li>The Date format should be DD/MM/YYYY</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-100 mt-4 p-4 grid justify-items-center">
              <h5 className="subHeading">Upload Progress</h5>
              {/* <div style={{ width: 150, height: 150,marginTop:'10px' }}>
            <CircularProgressbar value={percentage} text={`${percentage}%`} />
            </div> */}
              {/* <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-600 h-4 rounded-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div> */}
              <div style={{ width: "100%", marginTop: "10px" }}>
                <ProgressBar percentage={percentage} />
              </div>
              <div className="uploadMsg">{uploadFinishMessage}</div>
            </div>
          </div>
          {/* <div className=" bulkuploadFileouter"> */}
          <div className="h-auto">
            <div className="w-full">
              <div className="my-3 w-full">
                <div
                  className={`flex items-center border border-dashed p-4 rounded-md border-[#c5c5c5]`}
                >
                  <Tooltip
                    content="Upload file"
                    placement="bottom"
                    className="bg-green"
                    arrow={false}
                  >
                    <label
                      class="flex mt-1 cursor-pointer appearance-none rounded-md text-sm transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-75 w-16 "
                      tabindex="0"
                    >
                      <span
                        htmlFor="photo-dropbox"
                        class="flex items-center space-x-2"
                      >
                        <div className="p-3 bg-green rounded-md hover:bg-Green">
                          <svg
                            class="h-8 w-8 stroke-white text-white"
                            viewBox="0 0 256 256"
                          >
                            <path
                              d="M96,208H72A56,56,0,0,1,72,96a57.5,57.5,0,0,1,13.9,1.7"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="24"
                            ></path>
                            <path
                              d="M80,128a80,80,0,1,1,144,48"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="24"
                            ></path>
                            <polyline
                              points="118.1 161.9 152 128 185.9 161.9"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="24"
                            ></polyline>
                            <line
                              x1="152"
                              y1="208"
                              x2="152"
                              y2="128"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="24"
                            ></line>
                          </svg>
                        </div>
                      </span>
                      <input
                        ref={fileInput}
                        type="file"
                        id="photo-dropbox"
                        // className="stdInputField NOpadding"
                        class="sr-only"
                        // accept={SheetJSFT}
                        onChange={(e) => handleChange(e)}
                      />
                    </label>
                  </Tooltip>

                  <div class="font-normal text-gray-600 text-md ps-3 flex items-center w-full">
                    {fileName ? (
                      <div className="text-center min-w-24 border border-gray-400 px-3 py-2 rounded-md relative">
                        <div className="w-full flex justify-end">
                          <Tooltip
                            content="Remove"
                            className="bg-red-500"
                            arrow={false}
                            placement="top"
                          >
                            <IoCloseCircleSharp
                              onClick={deleteFile}
                              className="hover:text-red-600 cursor-pointer  text-red-500 bg-white text-[18px] z-[2]"
                            />
                          </Tooltip>
                        </div>
                        <div className="flex justify-center relative">
                          <img
                            src="/images/generic/excel-file-icon.png"
                            className="text-2xl h-8 w-8 content-center z-[1]"
                          />
                        </div>
                        <div className="w-full text-center text-nowrap flex pt-1 text-sm font-medium">
                          {fileName}
                        </div>
                      </div>
                    ) : (
                      "Select file for upload"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* </div> */}
          {inputFileData.length > 0 ? (
            <div className="flex justify-end" style={{ marginTop: "2%" }}>
              <button
                className="formButtons cursor-pointer"
                onClick={() => bulkUpload()}
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="flex justify-end" style={{ marginTop: "2%" }}>
              <button className="formButtons cursor-pointer" disabled>
                Submit
              </button>
            </div>
          )}
        </div>

        {/* RESULT TABS */}
        <div className="m-5">
          {(goodDataCount > 0 ||
            failedRecordsCount > 0 ||
            duplicateCount > 0) && (

              <>
                <div className="flex gap-8 border-b pb-2 mb-6 px-4">

                  <button
                    onClick={() => setActiveTab("success")}
                    className={activeTab === "success"
                      ? "border-b-2 border-green-600 text-green-600"
                      : ""}
                  >
                    Success ({goodDataCount})
                  </button>

                  <button
                    onClick={() => setActiveTab("failure")}
                    className={activeTab === "failure"
                      ? "border-b-2 border-red-600 text-red-600"
                      : ""}
                  >
                    Failure ({failedRecordsCount})
                  </button>

                  {/* <button
                    onClick={() => setActiveTab("duplicate")}
                    className={activeTab === "duplicate"
                      ? "border-b-2 border-yellow-600 text-yellow-600"
                      : ""}
                  >
                    Duplicates ({duplicateCount})
                  </button> */}

                </div>

                <div className="px-4">
                  {activeTab === "success" && (
                    <GenericTable
                      downloadTableName="success-data"
                      tableObjects={tableObjects}
                      tableHeading={goodRecordsHeading}
                      tableData={goodRecordsTable || []}
                      totalRecs={totalRecs}
                      pageNumber={pageNumber}
                      setPageNumber={setPageNumber}
                      recsPerPage={recsPerPage}
                      setRecsPerPage={setRecsPerPage}
                      getData={getData}
                    />
                  )}

                  {activeTab === "failure" && (
                    <GenericTable
                      downloadTableName="failed-data"
                      tableObjects={tableObjects}
                      tableHeading={failedtableHeading}
                      tableData={failedRecordsTable || []}
                      totalRecs={totalRecs}
                      pageNumber={pageNumber}
                      setPageNumber={setPageNumber}
                      recsPerPage={recsPerPage}
                      setRecsPerPage={setRecsPerPage}
                      getData={getData}
                    />
                  )}

                  {/* {activeTab === "duplicate" && (
                    <GenericTable
                      downloadTableName="duplicate-data"
                      tableObjects={tableObjects}
                      tableHeading={{
                        vendorCode: "Vendor Code",
                        nameOfCompany: "Company Name",
                      }}
                      tableData={duplicateRecordsTable || []}
                      totalRecs={totalRecs}
                      pageNumber={pageNumber}
                      setPageNumber={setPageNumber}
                      recsPerPage={recsPerPage}
                      setRecsPerPage={setRecsPerPage}
                      getData={getData}
                    />
                  )} */}
                </div>

              </>
            )}
        </div>
      </div>
    </section>
  );
};

export default VendorBulkUploadPage;
