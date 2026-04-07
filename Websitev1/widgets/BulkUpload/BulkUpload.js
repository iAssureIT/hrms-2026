import React, { Component, useRef } from "react";
import * as XLSX from "xlsx";
import { useState, useEffect } from "react";

import axios from "axios";
import swal from "sweetalert2";
import ProgressBar from "./ProgressBar.js";
// import GenericTable from "@/widgets/GenericTable/FilterTable.js";
import GenericTable from "@/widgets/BulkUpload/GenericTable/Table";
import "./BulkUpload.css";
import { Tooltip } from "flowbite-react";
import { IoCloseCircleSharp } from "react-icons/io5";

const BulkUpload = (props) => {
  // console.log("props",props)
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

  const bulkUpload = () => {
    var totalrows = inputFileData.length;

    // var factor = totalrows > 200 ? 100 : totalrows > 20 ? 1 : 1;
    var factor = totalrows > 200 ? 100 : totalrows;

    var initialLmt = 0;
    var endLmt = initialLmt + factor;
    var chunkData = [];
    var excelChunkData = [];

    const startProcess = async (data) => {
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
                var percentage = Math.round((endLmt * 100) / totalrows);
                var uploadFinishMessage = "";
                if (percentage > 99) {
                  props.getFileDetails(fileName);
                  percentage = 100;
                  uploadFinishMessage = "Congrats, Uploaded Completed!";
                  // $(".filedetailsDiv").show();
                }
                setPercentage(percentage);
                setUploadFinishMessage(uploadFinishMessage);
                // setState({
                //   percentage          : percentage,
                //   uploadFinishMessage : uploadFinishMessage
                // },()=>{console.log('percentage => ',state.percentage)})
                chunkData = [];
                initialLmt += factor;
                endLmt = initialLmt + factor;
              }
            })
            .catch((error) => {
              console.log("error", error);
             
            });
        }
      }
    };
    startProcess(props.data);
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
      {props.fileDetails ? (
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
                id={"success" + props.goodDataCount}
                className="tab-pane fade"
              >
                <h5>
                  Total {props?.fileDetails?.goodrecords?.length} good{" "}
                  {props?.fileDetails?.totalRecords > 1 ? "records" : "record"}{" "}
                  found from file.
                </h5>
                <GenericTable
                  downloadTableName="good-data"
                  tableObjects={props.tableObjects}
                  tableHeading={props.goodRecordsHeading}
                  tableData={props.goodRecordsTable}
                />
              </div>
            ) : (
              <div
                id={"failure" + props.failedRecordsCount}
                className="tab-pane fade in"
              >
                {/* <div id={"failure"+props.failedRecordsCount} className="tab-pane fade in active"> */}
                <h5>
                  Out of {inputFileData.length}{" "}
                  {inputFileData.length > 1 ? "records" : "record"}, &nbsp;
                  {props?.fileDetails?.failedRecords?.length} bad{" "}
                  {props?.fileDetails?.failedRecords?.length > 1
                    ? "records were "
                    : "record was "}
                  found.
                </h5>
                <div>
                  <GenericTable
                    downloadTableName="failed-data"
                    tableObjects={props.tableObjects}
                    tableHeading={props.failedtableHeading}
                    tableData={props.failedRecordsTable}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
};
export default BulkUpload;
