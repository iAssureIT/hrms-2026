import React, { Component, useRef } from "react";
import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import { Tooltip } from "flowbite-react";

import axios from "axios";
import swal from "sweetalert2";
import ProgressBar from "./ProgressBar.js";
// import GenericTable from "@/widgets/GenericTable/FilterTable.js";
import GenericTable from "@/widgets/BulkUpload/GenericTable/Table";
import "./BulkUpload.css";
import { IoCloseCircleSharp } from "react-icons/io5";
import { FaRegFileAlt } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa6";

const BulkUpload = (props) => {
  const [user_id, setUser_id] = useState();
  const [inputFileData, setInputFileData] = useState([]);
  const [startRange, setStartRange] = useState(0);
  const [limitRange, setLimitRange] = useState(1000);
  const [percentage, setPercentage] = useState(0);
  const [fileName, setFileName] = useState();
  const [uploadFinishMessage, setUploadFinishMessage] = useState();
  const fileInput = useRef(null);
  const tableRef = useRef(null);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(false);
  const [processCompleted, setProcessCompleted] = useState(false);
  
  const [goodRecordsTable, setGoodRecordsTable] = useState([]);
  const [failedRecordsTable, setFailedRecordsTable] = useState([]);
  const [goodDataCount, setGoodDataCount] = useState(0);
  const [failedRecordsCount, setFailedRecordsCount] = useState(0);
  const [totalRecords,setTotalRecords] = useState(0);
  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      const parseUser_id = userDetailsParse.user_id;
      setUser_id(parseUser_id);
    }
  }, []);
  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      var fileName = files[0].name;
      var ext = fileName.split(".").pop();
      if (ext === "csv" || ext === "xlsx" || ext === "xls") {
        handleFile(files[0]);
      } else {
        // fileInput.value = '';
        new swal({
          title: " ",
          text: "Invalid file format.",
        });
      }
    }
  };

  const handleFile = (file) => {
    // $('.fullpageloader').show();
    // setState({fileName: file.name})
    setFileName(file.name);
    // console.log("fileInput",fileInput.value);
    const reader = new FileReader();
    // const rABS = !!reader.readAsBinaryString;
    const rABS = !!reader.readAsBinaryString;
    reader.onload = ({ target: { result } }) => {
      // console.log("result",result);
      const wb = XLSX.read(result, { type: "binary" });
      // console.log("wb",wb);
      const wsname = wb.SheetNames[0];
      // console.log("wsname",wsname);
      const ws = wb.Sheets[wsname];
      // console.log("ws",ws);
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // console.log("data",data);
      var documentObj = [];
      let count = 0;
      for (var j = 1; j <= data.length; j++) {
        var record = data[j];
        var attributeArray = [];
        let header = data[0];
        // console.log('record',record)
        if (record !== undefined && record.length > 0) {
          var k;
          // loop on header columns
          for (k in header) {
            if (!documentObj.hasOwnProperty(count)) {
              if (record[k] === undefined) {
                documentObj.push({ [header[k]]: "-" });
              } else {
                documentObj.push({ [header[k]]: record[k] });
              }
            } else {
              if (record[k] === undefined) {
                documentObj[count][header[k]] = "-";
              } else {
                documentObj[count][header[k]] = record[k];
              }
              // documentObj[count]['filename'] = file.name;
              //documentObj[count]['vendor_ID'] = props.requiredData.vendor;
            }
          }
          count++;
        }
      }
      // console.log("documentObj",documentObj);
      setInputFileData(documentObj);
      // setState({ inputFileData:documentObj });
    };

    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  };

  const deleteFile = () => {
    setFileName("");
  };

  const bulkUpload = async () => {
    var invalidData = [];
    var centerFirstName = inputFileData[0]?.centerName?.trim();
    // inputFileData.forEach(function (item) {
    //   if (centerFirstName !== item?.centerName.trim()) {
    //     var remark = "All Center Names should be the same.";
    //     var invalidObject = { ...item, failedRemark: remark };
    //     invalidData.push(invalidObject);
    //   }
    // });

    // if (invalidData.length > 0) {
    //   new swal({
    //     title: "All Center Names should be the same.",
    //     text: "Please verify Data!",
    //   });
    // } else {
    var centerDetails = await axios.get(
      "/api/centers/get/name/" + centerFirstName
    );

    if (!centerDetails.data) {
      new swal({
        title: "This Center is not available in Centers Data.",
        text: "Please verify Data!",
      });
    } else {
      var totalrows = inputFileData.length;
      setTotalRecords(totalrows)

      var factor = totalrows > 2000 ? 1000 : totalrows;
      // > 20
      // ? 10
      // : 1;

      var initialLmt = 0;
      var endLmt = initialLmt + factor;
      var chunkData = [];
      var excelChunkData = [];

      const startProcess = async (data) => {
        setLoading(true);
        for (var i = initialLmt; i < endLmt; i++) {
          if (inputFileData[i]) {
            chunkData.push(inputFileData[i]);
          }
          if (i === endLmt - 1 && i !== totalrows && chunkData.length > 0) {
            var formValues = {
              data: chunkData,
              reqdata: props.data,
              fileName: fileName,
              createdBy: user_id,
              totalRecords: totalrows,
              updateBadData: i > factor ? false : true,
            };
            await axios({
              method: "post",
              url: props.url,
              data: formValues,
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((response) => {
                if (response.data.completed) {
                  setProcessCompleted(true)
                  console.log("response",response)
                  console.log("percentage",percentage)
                  var percentage = Math.round((endLmt * 100) / totalrows);
                  var uploadFinishMessage = "";
                  if (percentage > 99) {
                    percentage = 100;
                    uploadFinishMessage = "Congrats, Uploaded Completed!";
                    // $(".filedetailsDiv").show();
                  } 
                  var goodrecordsTable = response.data.goodRecords.map((a, i) => {
                    return {
                      centerName: a?.centerName,
                      state: a?.state,
                      district: a?.district,
                      block: a?.block,
                      village: a?.village,
                    };
                  });
                  var failedRecordsTable = response.data.failedRecords.map((a, i) => {
                    return {
                      centerName: a?.centerName,
                      state: a?.state,
                      district: a?.district,
                      block: a?.block,
                      village: a?.village,
                      failedRemark: a?.failedRemark,
                    };
                  });
                  setPercentage(percentage);
                  setUploadFinishMessage(uploadFinishMessage);
                  setGoodRecordsTable(goodrecordsTable)
                  setFailedRecordsTable(failedRecordsTable)
                  setGoodDataCount(response.data.goodRecords.length)
                  setFailedRecordsCount(response.data.failedRecords.length)
                  chunkData = [];
                  initialLmt += factor;
                  endLmt = initialLmt + factor;
                  setLoading(false);
                }
              })
              .catch((error) => {
                setLoading(false);
                setProcessCompleted(false);
                console.log("error", error);
                new swal({
                  title: "Something unexpected happened!",
                  text: "Please try again one more time, or contact System Admin to resolve issue!",
                });
              });
          }
        }
      };
      startProcess(props.data);
    }
    // }
  };
  const SheetJSFT = ["xlsx", "xls", "csv"];
  return (
    <section className="section">
      <div className="m-4 grid">
        <div className="flex justify-between">
          <div className="">
            <h4 className="subHeading">Bulk Upload</h4>
            <div className=" bulkEmployeeImg">
              <a
                target="_blank" href={props.fileurl}
                title="Click to download template"
                download
              >
                <img src="/images/generic/Excel-download-icon.png" />
              </a>
            </div>
            <div className="bulkEmployeeVerif mx-4">
              <ul className="bodyText text-grayTwo font-normal">
                <li>
                  Please use attached File Template format for bulkupload into
                  system.
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
                className="bg-blue-600 h-4 rounded-full"
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
                      for="photo-dropbox"
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
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            strokeWidth="24"
                          ></path>
                          <path
                            d="M80,128a80,80,0,1,1,144,48"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            strokeWidth="24"
                          ></path>
                          <polyline
                            points="118.1 161.9 152 128 185.9 161.9"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            strokeWidth="24"
                          ></polyline>
                          <line
                            x1="152"
                            y1="208"
                            x2="152"
                            y2="128"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
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
                      accept={SheetJSFT}
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
        {
        console.log("loading",loading)}
        {inputFileData.length > 0 ? 
         loading ? 
          <div className="flex justify-end" style={{ marginTop: "2%" }}>
            <button className="formButtons cursor-pointer" disabled>
              <span>
                Submit
                <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
              </span>
            </button>
          </div>
          :
          <div className="flex justify-end" style={{ marginTop: "2%" }}>
            <button
              className="formButtons cursor-pointer"
              onClick={() => bulkUpload()}
            >
              Submit
            </button>
          </div>
        : (
          <div className="flex justify-end" style={{ marginTop: "2%" }}>
            <button className="formButtons cursor-pointer" disabled>
              Submit
            </button>
          </div>
        )}
      </div>
      {processCompleted ? (
        <div>
          <div className="flex mb-4 capitalise">
            <button
              className={`px-6 py-2 hover:bg-gray-200 ${
                activeTab === "active"
                  ? "text-green bg-white border-green border-b-2"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Success
            </button>
            <button
              className={`px-6 py-2 hover:bg-gray-200 ${
                activeTab === "failure"
                  ? "text-green bg-white border-green border-b-2"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveTab("failure")}
            >
              Failure
            </button>
          </div>
          <div>
            {activeTab === "active" ? (
              <div
                id={"success" + goodDataCount}
                className="tab-pane fade"
              >
                <h5>
                  Total {goodDataCount} good{" "}
                  {totalRecords > 1 ? "records" : "record"}{" "}
                  found from file.
                </h5>
                <GenericTable
                  downloadTableName="good-data"
                  tableObjects={props.tableObjects}
                  tableHeading={props.goodRecordsHeading}
                  tableData={goodRecordsTable}
                />
              </div>
            ) : (
              <div
                id={"failure" + failedRecordsCount}
                className="tab-pane fade in"
              >
                {/* <div id={"failure"+failedRecordsCount} className="tab-pane fade in active"> */}
                <h5>
                  Out of {inputFileData.length}{" "}
                  {inputFileData.length > 1 ? "records" : "record"}, &nbsp;
                  {failedRecordsCount} bad{" "}
                  {failedRecordsCount > 1
                    ? "records were "
                    : "record was "}
                  found.
                </h5>
                <div>
                  <GenericTable
                    downloadTableName="failed-data"
                    tableObjects={props.tableObjects}
                    tableHeading={props.failedtableHeading}
                    tableData={failedRecordsTable}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : loading ? (
        <FaSpinner className="animate-spin inline-flex mx-2 text-green" />
      ) : null}
    </section>
  );
};
export default BulkUpload;
