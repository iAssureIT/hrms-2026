"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "animate.css";
import { FaAngleLeft } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdClose } from "react-icons/md";
import { Modal, Tooltip } from "flowbite-react";
import { IoMdAdd } from "react-icons/io";
import validator, { toDate } from "validator";
import moment from "moment";
import {
  faEye,
  faPenToSquare,
  faTrashCan,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FaUserGraduate, FaCalendarCheck, FaFileUpload } from "react-icons/fa";
import { SlBookOpen } from "react-icons/sl";
import { IoLocationSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { idContext } from "@/app/admin/layout";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaFileDownload } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaPlus, FaSpinner } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
// import BulkUpload from "../BulkUpload/BulkUpload_Lupin";

import * as XLSX from "xlsx";

const GenericTable = ({
  tableObjects,
  tableHeading,
  excelHeading,
  setRunCount,
  runCount,
  recsPerPage,
  setRecsPerPage,
  filterData,
  getData,
  tableData,
  setTableData,
  numOfPages,
  setNumOfPages,
  pageNumber,
  setPageNumber,
  searchText,
  setSearchText,
  totalRecs,
  setTotalRecs,
  search,
  setSearch,
  loading,
  pdfMode,
}) => {
  // console.log("runCount", runCount);
  // console.log("recsPerPage", recsPerPage);
  // console.log("filterData", filterData);
  // console.log("tableData", tableData);
  // console.log("numOfPages", numOfPages);
  // console.log("pageNumber", pageNumber);
  // console.log("searchText", searchText);
  // console.log("totalRecs", totalRecs);

  let router = useRouter();
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");

  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  // console.log("userDetails  =>", userDetails);

  // console.log("search", search);
  const [deleteId, setDeleteId] = useState("");
  let [sort, setSort] = useState(true);

  // const [loading, setLoading] = useState(true);

  const [checkDelete, setCheckDelete] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);
  const [deleteFailModal, setDeleteFailModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [recsDropdownOpen, setRecsDropdownOpen] = useState(false);
  const startSerialNumber = (pageNumber - 1) * recsPerPage + 1;

  const [showContributorsBulkUploadModal, setShowContributorsBulkUploadModal] =
    useState(false);
  const [cc_id, setCC_id] = useState("");

  // const { setApprovalId } = useContext(idContext);

  // console.log("propssss",props)
  useEffect(() => {
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
    } else if (pathname.includes("asset")) {
      setLoggedInRole("asset");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
    } else if (pathname.includes("account")) {
      setLoggedInRole("account");
    } else {
      setLoggedInRole("executive");
    }
    getData();
  }, []);

  useEffect(() => {
    getData();
  }, [pageNumber, recsPerPage, runCount]);

  // useEffect(() => {
  //   pagesLogic();
  // }, [recsPerPage, totalRecs, runCount]);

  // const pagesLogic = () => {
  //   let totalPages = Math.ceil(totalRecs / recsPerPage);
  //   let pageArr = [];
  //   for (let i = 0; i < totalPages; i++) {
  //     pageArr[i] = i + 1;
  //   }
  //   setNumOfPages(pageArr);
  // }

  useEffect(() => {
    if (totalRecs > 0) {
      const totalPages = Math.ceil(totalRecs / recsPerPage);

      if (totalPages <= 5) {
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        setNumOfPages(pages);
      } else {
        let pages = [];

        if (pageNumber <= 3) {
          pages = [1, 2, 3, "...", totalPages];
        } else if (pageNumber >= totalPages - 2) {
          pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
        } else {
          pages = [
            1,
            "...",
            pageNumber - 1,
            pageNumber,
            pageNumber + 1,
            "...",
            totalPages,
          ];
        }
        console.log("numOfPages before", numOfPages);
        setNumOfPages([...new Set(pages)]);
      }
    }
  }, [totalRecs, recsPerPage, pageNumber]);

  useEffect(() => {
    getData();
  }, [recsPerPage, runCount]);

  const getCurrentFinancialYearRange = () => {
    const today = new Date();

    const financialYearStart = new Date(today);
    financialYearStart.setMonth(3);
    financialYearStart.setDate(1);

    const financialYearEnd = new Date(financialYearStart);
    financialYearEnd.setFullYear(financialYearEnd.getFullYear() + 1);
    financialYearEnd.setMonth(3);
    financialYearEnd.setDate(0);

    return {
      startDate: moment(financialYearStart).format("DD-MM-YYYY"),
      endDate: moment(financialYearEnd).format("DD-MM-YYYY"),
    };
  };

  const deleteData = () => {
    var uid = deleteId;
    axios({
      method: tableObjects?.deleteMethod,
      url: `${tableObjects?.apiURL}/delete/${uid}`,
    })
      .then((deletedUser) => {
        getData();
        // setDeleteSuccessModal(true);
      })
      .catch((error) => {
        console.log("Error Message from userslist delete redirect  => ", error);
        // setErrorModal(true);
      });
  };

  const redirect = (action, uid) => {
    if (action === "redirect") {
      // setApprovalId(uid);
      window.open(
        "/" + loggedInRole + tableObjects?.buttonURL + uid,
        '_self'
        // "noopener,noreferrer"
      );
      // window.location.href = "/" + loggedInRole + tableObjects?.buttonURL + uid;
    }
    if (action === "edit") {
      // router.push(tableObjects?.editURL + uid)
      window.location.href = "/" + loggedInRole + tableObjects?.editURL + uid;
    }
    if (action === "delete") {
      // setDeleteModal(true);

      Swal.fire({
        title: " ",
        text: `Are you sure you want to delete this ${tableObjects?.titleMsg}?`,
        // icon: "warning",
        showCancelButton: true,
        cancelButtonText: "No, Don't Delete!",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3c8dbc",
        confirmButtonText: "Yes, delete it!",
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          confirmButton: "delete-btn",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          axios({
            method: tableObjects?.deleteMethod,
            url: `${tableObjects?.apiURL}/delete/${uid}`,
          })
            .then((deletedUser) => {
              getData();
              Swal.fire({
                title: " ",
                text: `${tableObjects?.titleMsg} have been deleted.`,
              });
            })
            .catch((error) => {
              console.log(
                "Error Message from userslist delete redirect  => ",
                error
              );
              Swal.fire(" ", "Something Went Wrong <br/>" + error.message);
            });
        }
      });
    }
  };

  const sortNumber = (key, tableData) => {
    const reA = /[^a-zA-Z]/g;
    const reN = /[^0-9]/g;

    const sortedData = tableData?.sort((a, b) => {
      let nameA = "";
      let nameB = "";
      let aN = 0;
      let bN = 0;

      // Extract values for the given key
      for (const [key1, value1] of Object.entries(a)) {
        if (key === key1) {
          nameA = value1.replace(reA, "");
          aN = parseInt(value1.replace(reN, ""), 10);
        }
      }

      for (const [key2, value2] of Object.entries(b)) {
        if (key === key2) {
          nameB = value2.replace(reA, "");
          bN = parseInt(value2.replace(reN, ""), 10);
        }
      }

      // Compare the values
      if (sort) {
        if (nameA === nameB) {
          return aN - bN;
        } else {
          return nameA.localeCompare(nameB);
        }
      } else {
        if (nameA === nameB) {
          return bN - aN;
        } else {
          return nameB.localeCompare(nameA);
        }
      }
    });

    setSort(!sort);
    setTableData(sortedData);
  };

  const sortString = (key, tableData) => {
    const sortedData = tableData?.sort((a, b) => {
      let nameA = "";
      let nameB = "";

      Object.entries(a).forEach(([key1, value1]) => {
        if (key === key1) {
          nameA = typeof value1 === "string" ? value1.toUpperCase() : value1;
        }
      });

      Object.entries(b).forEach(([key2, value2]) => {
        if (key === key2) {
          nameB = typeof value2 === "string" ? value2.toUpperCase() : value2;
        }
      });

      if (sort) {
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      } else {
        if (nameA > nameB) return -1;
        if (nameA < nameB) return 1;
        return 0;
      }
    });

    setSort(!sort);
    setTableData(sortedData);
  };

  const sortData = (event) => {
    event.preventDefault();
    var key = event.target.getAttribute("id");
    // console.log("key", key);
    if (key === "number") {
      sortNumber(key, tableData);
      // console.log("sortNumber", sortNumber);
    } else {
      sortString(key, tableData);
      // console.log("sortString", sortString);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [Object.values(excelHeading)];
    const formvalues = { ...filterData, removePagination: true };
    axios({
      method: tableObjects?.getListMethod,
      url: tableObjects.titleMsg === "Contributors List"
        ? `${tableObjects?.apiURL}/post/contributors-list`
        : `${tableObjects?.apiURL}/post/list`,
      data: formvalues,
    })
      .then((response) => {

        var downloadData = response.data.tableData;

        // Add data to the worksheet
        downloadData.forEach((row) => {
          const rowData = Object.keys(excelHeading).map((key) => {
            let value = "";

            if (key.includes(".")) {
              value = key.split(".").reduce((obj, k) => {
                return obj && obj[k] !== undefined ? obj[k] : "";
              }, row);
            } else {
              value = row[key];
            }
            return value ?? "";
          });
          worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        XLSX.writeFile(workbook, tableObjects?.titleMsg + ".xlsx");
      })
      .catch((error) => {
        console.log("Error   => ", error);
        Swal.fire(" ", "Error ", "Something went wrong");
      });
  };

  useEffect(() => {
    if (tableData.length > 0 || tableData.length === 0) {
    }
  }, []);

  const handlePageClick = (page) => {
    if (page === "...") return;
    setPageNumber(page);
  };

  const amountArr = [
    "totalCost",
    "totalUtilizedCost",
    "CC",
    "amountReceived",
    "grant",
    "LHWRF",
    "unitCost",
    "convergence",
    "maxCost",
  ];

  const numberArr = ["noOfHouseholds", "quantity", "noOfBeneficiaries"];

  // const formatToINR = (num) => {
  //   // Convert the number to a string and split at the decimal point
  //   let [integerPart, decimalPart] = num.toString().split(".");

  //   // Use a regex to format the integer part as per Indian numbering system
  //   integerPart = integerPart
  //     .replace(/\B(?=(\d{2})+(?!\d))/g, ",")
  //     .replace(/^(\d+?)(?=(\d{3})+(?!\d))/g, "$1,");

  //   // Return the formatted integer part along with the decimal part if it exists
  //   return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  // };

  const formatToINR = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(num)
      .replace(/^(\D+)/, "$1 ");
  };

  const formatNumberToCommas = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  return (
    <section
      className={
        "pt-5 w-full" + tableObjects.tableName === "Contributors List"
          ? "mt-2"
          : "mt-5"
      }
    >
      <div className={("container mx-auto transition-all duration-300 ")}>
        <style jsx>{`
          .resizing {
            cursor: col-resize !important;
          }
          .resizing th {
            background-color: rgba(59, 130, 246, 0.1);
          }
          .table-container {
            max-height: 500px; /* Adjust as needed */
            overflow-y: auto;
            position: relative;
          }
          thead {
            position: sticky;
            top: 0;
            z-index: 10;
          }
          thead.header2 {
            top: '-4px';
            z-index: 9;
          }
          table {
            width: 100%;
            table-layout: auto;
          }
          th, td {
            box-sizing: border-box;
          }
        `}</style>

        <div className="">
          <div className="flex lg:flex-row md:flex-col flex-col mt-2 justify-between w-full hide-in-pdf">
            <div className="text-sm">
              <div className="">
                <label
                  htmlFor="recsPerPage"
                  // className="mb-4 font-semibold"
                  className="inputLabel"
                >
                  Records per Page
                </label>
                <div className="relative mt-2 rounded-md text-gray-500 w-full">
                  <button
                    type="button"
                    onClick={() => setRecsDropdownOpen(!recsDropdownOpen)}
                    className="stdSelectField text-left w-3/4 pl-3 flex justify-between items-center"
                  >
                    {recsPerPage}
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {recsDropdownOpen && (
                    <div className="absolute z-50 w-3/4 bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      {[10, 50, 100, 500, 1000].map((val) => (
                        <div
                          key={val}
                          onClick={() => {
                            setRecsPerPage(val);
                            setPageNumber(1);
                            setRecsDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="flex text-sm lg:-mt-1 mt-5">
              {tableObjects?.searchApply ? (
                <div className="">
                  <label
                    htmlFor="search"
                    //  className="mb-4 font-semibold"
                    className="inputLabel"
                  >
                    Search
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="pr-2 border-r-2">
                        <FaSearch className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      // className="w-full border mt-2 text-sm ps-1 pb-1"
                      className="stdInputField"
                      placeholder="Search"
                      name="search"
                      onChange={(event) => {
                        // console.log("event.target.value => ", event.target.value);
                        setSearchText(event.target.value);
                      }}
                    />
                  </div>
                </div>
              ) : null}
              {tableObjects.downloadApply ? (
                <div className="mt-7 ml-4">
                  <Tooltip
                    content="Download as Excel"
                    placement="top"
                    className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
                    arrow={false}
                  >
                    <FaFileDownload
                      onClick={exportToExcel}
                      size={"2rem"}
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    />
                  </Tooltip>
                </div>
              ) : null}
            </div>
          </div>

          {/* <div className={`table-responsive relative overflow-hidden hover:overflow-auto w-full mt-3 `}>
            <table  className={`table-auto text-base bottom border-separate border-spacing-y-2 w-full dark:w-full`}> */}
          <div className="relative w-full mt-3">
            <div className="table-responsive table-container overflow-x-auto">
              <table className="min-w-full table-fixed border-collapse text-base bottom  border-separate border-spacing-y-1 w-full dark:w-full leading-tight">

                <thead
                  className={`${pdfMode ? "text-xs" : "text-[13px]"} uppercase ${pdfMode ? "text-wrap" : "text-wrap"
                    } bg-white dark:bg-white`}
                >
                  <tr className="text-left">
                    <th className="text-center px-4 py-2 border border-grayTwo border-r-0">
                      Sr. No
                    </th>
                    {tableHeading ? (
                      Object.entries(tableHeading).map(([key, value], i) => {
                        if (key === "actions") {
                          return (
                            <th
                              key={i}
                              className="px-4 py-2 border border-grayTwo border-l-0 border-r-0"
                              id="ActionContent"
                            >
                              {value}
                            </th>
                          );
                        } else {
                          return (
                            <th
                              key={i}
                              className={`px-2 py-2 border border-grayTwo border-l-0 break-words max-w-xs ${key !== "actions" &&
                                i === Object.entries(tableHeading).length - 1
                                ? "border-r-1"
                                : "border-r-0"
                                }`}
                            >
                              {value}{" "}
                              <span
                                onClick={sortData}
                                id={key}
                                className="fa cursor-pointer fa-sort tableSort hide-in-pdf"
                              ></span>
                            </th>
                          );
                        }
                      })
                    ) : (
                      <th className=""></th>
                    )}
                  </tr>
                </thead>
                <tbody
                  className={`border border-grayTwo ${pdfMode ? "text-wrap text-xs" : "text-wrap text-[13px]"
                    } `}
                >
                  {tableData && tableData.length > 0 ? (
                    tableData.map((value, i) => {
                      // console.log("value",value)
                      console.log(
                        "value.utilizationStatus 1",
                        value.utilizationStatus
                      );
                      const serialNumber = startSerialNumber + i;
                      return (
                        <tr
                          key={i}
                          className="odd:bg-grayOne text-[13px] even:bg-white border border-grayTwo  text-[#000] font-normal"
                        >
                          <td className="text-center px-4 py-2 font-normal border border-grayTwo border-r-0">
                            {serialNumber}
                          </td>
                          {tableHeading && tableHeading.actions ? (
                            <td className="border border-grayTwo  border-l-0 border-r-0">
                              {value.centerName !== "Total" ? (
                                <div className="flex flex-wrap md:flex-nowrap mx-3 gap-2 items-center">
                                  {loggedInRole === "admin" &&
                                    tableObjects.formURL ===
                                    "Add Center Incharge" && (
                                      <Tooltip
                                        content="Add Center Incharge"
                                        placement="bottom"
                                        className="bg-green"
                                        arrow={false}
                                      >
                                        <FaPlus
                                          className="border me-2 border-gray-500 text-gray-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                          size={"1.3rem"}

                                          onClick={() => {
                                            window.open(
                                              "/" +
                                              loggedInRole +
                                              "/master-data/center-details/add-center-incharge/" +
                                              value._id,
                                              // "_blank"
                                            );
                                          }}
                                        />
                                      </Tooltip>
                                    )}
                                  <Tooltip
                                    content="View"
                                    placement="bottom"
                                    className="bg-green"
                                    arrow={false}
                                  >
                                    {/* {console.log("formText", tableObjects.formText)} */}
                                    {tableObjects.formText === "Approval Form" ||
                                      tableObjects.formText === "Utilization Form" ||
                                      tableObjects.formText === "Vendor Form" ||
                                      tableObjects.formText ===
                                      "Add Center Details" ? (
                                      <FaEye
                                        className="border me-2 border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                        size={"1.3rem"}
                                        onClick={() => {
                                          let url = "";
                                          if (
                                            tableObjects.formText ===
                                            "Approval Form"
                                          ) {
                                            url =
                                              "/" +
                                              loggedInRole +
                                              "/approval-management/approval-details/" +
                                              value._id;
                                          } else if (
                                            tableObjects.formText ===
                                            "Utilization Form"
                                          ) {
                                            url =
                                              "/" +
                                              loggedInRole +
                                              "/utilization-management/utilization-details/" +
                                              value._id;
                                          } else if (
                                            tableObjects.formText ===
                                            "Vendor Form"
                                          ) {
                                            url =
                                              "/" +
                                              loggedInRole +
                                              "/master-data/vendor-master/vendor-details/" +
                                              value._id;
                                          } else if (
                                            tableObjects.formText ===
                                            "Add Center Details"
                                          ) {
                                            url =
                                              "/" +
                                              loggedInRole +
                                              "/master-data/center-details/center-profile/" +
                                              value._id;
                                          }

                                          if (url) {
                                            window.open(
                                              url,
                                              '_self'
                                              // "noopener,noreferrer"
                                            ); // Opens in new tab
                                          }
                                        }}
                                      />
                                    ) : (
                                      ""
                                    )}
                                  </Tooltip>
                                  {tableObjects.formText === "Add CC Form" && (
                                    <Tooltip
                                      content="Contribution Details"
                                      placement="bottom"
                                      className="bg-green"
                                      arrow={false}
                                    >
                                      <FaEye
                                        className="border me-2 border-gray-500 text-gray-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                        size={"1.3rem"}

                                        onClick={() => {
                                          const url = `/${loggedInRole}/fund-management/contribution-details/${value._id}`;
                                          window.open(
                                            url,
                                            '_self'

                                          );
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                  {loggedInRole === "admin" ||
                                    loggedInRole === "center" ? (
                                    <>
                                      <Tooltip
                                        content="Edit"
                                        placement="bottom"
                                        className="bg-green"
                                        arrow={false}
                                      >
                                        <MdOutlineEdit
                                          className="border  border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                          size={"1.3rem"}
                                          onClick={() =>
                                            redirect("edit", value._id)
                                          }
                                        />
                                      </Tooltip>
                                      &nbsp;
                                      <Tooltip
                                        content="Delete"
                                        placement="bottom"
                                        className="bg-red-500"
                                        arrow={false}
                                      >
                                        <RiDeleteBin6Line
                                          className="border border-red-500 text-red-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                          size={"1.3rem"}
                                          onClick={() => {
                                            redirect("delete", value._id);
                                            setDeleteId(value._id);
                                          }}
                                        />
                                      </Tooltip>
                                    </>
                                  ) : null}
                                  &nbsp;
                                  {/* {console.log("pathname", pathname,tableObjects?.buttonText,(pathname ==="/" + loggedInRole +"/annual-plan-management/annual-list" &&  loggedInRole !== "executive" ))} */}
                                  {pathname ===
                                    "/" +
                                    loggedInRole +
                                    "/annual-plan-management/annual-list" &&
                                    loggedInRole !== "executive" ? (
                                    <button
                                      className={`formButtons text-[10px] flex justify-center items-center leading-3 rounded-none`}
                                      onClick={() => {
                                        redirect("redirect", value._id);
                                      }}
                                    >
                                      {tableObjects?.buttonText}
                                    </button>
                                  ) : null}
                                  {pathname ===
                                    "/" +
                                    loggedInRole +
                                    "/approval-management/approval-list" &&
                                    value.finalStatus === "approved" &&
                                    loggedInRole !== "executive" &&
                                    value.hideUtilizationButton === false ? (
                                    <div>
                                      <button
                                        className={`formButtons ${value.finalStatus === "approved"
                                          && value.utilizationStatus !== "Completed"
                                          ? "block"
                                          : "hidden"
                                          }  text-[10px] flex justify-center items-center leading-3 rounded-none`}
                                        onClick={() => {
                                          redirect("redirect", value._id);
                                        }}
                                      >
                                        {tableObjects?.buttonText}
                                      </button>
                                      {console.log(
                                        "value.utilizationStatus",
                                        value.utilizationStatus
                                      )}
                                      {value.utilizationStatus ? (
                                        <div
                                          className={`font-normal text-wrap border bg-green rounded-lg text-xs text-center py-0.5 w-24 p-2 text-white ${value.utilizationStatus == "Completed"
                                            ? "block"
                                            : "hidden"
                                            } text-[10px] flex justify-center items-center leading-3`}
                                        >
                                          Activity Completed
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              ) : null}
                            </td>
                          ) : null}
                          {Object.entries(value).map(([key, value1], i) => {
                            let valueStr = value1 != null ? value1.toString() : "";

                            if (!isNaN(valueStr) && valueStr?.trim() !== "") {
                              textAlign = "text-right text-nowrap ";

                              if (amountArr.includes(key)) {
                                value1 = formatToINR(valueStr);
                              }
                              if (numberArr.includes(key)) {
                                value1 = formatNumberToCommas(valueStr);
                              }
                            } else if (/^[A-Za-z]+$/.test(valueStr)) {
                              // Check if the value is alphabetic using regex
                              // var textAlign = "text-left text-nowrap ";
                              var textAlign = "text-left ";
                              // } else if (valueStr?.includes(",")) {
                              //   var textAlign = "text-right";
                            } else {
                              // var textAlign = "text-left text-nowrap ";
                              var textAlign = "text-left";
                            }

                            if (key === "remarks" || key === "convergenceNote") {
                              var heightOfPara = `h-24 max-h-24 block ${valueStr.length < 40
                                ? "overflow-y-hidden"
                                : "overflow-y-scroll"
                                }  overflow-x-hidden whitespace-pre-wrap break-all w-80 pe-2`;
                              var remarksStyle = {
                                display: "block",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                              };
                            }
                            if (value1 === "approved" || value1 === "Approved") {
                              var statusColor =
                                "border bg-green rounded-lg text-xs text-center py-0.5 w-24 px-1 text-white";
                            }
                            if (value1 === "rejected" || value1 === "Rejected") {
                              var statusColor =
                                "border bg-red-500 rounded-lg text-xs text-center py-0.5 w-24 px-1 text-white";
                            }
                            if (
                              value1 === "payment-released" ||
                              value1 === "payment-released"
                            ) {
                              var statusColor =
                                "border bg-green rounded-lg text-xs text-center w-40 py-0.5 px-1 text-white";
                            }
                            if (value1 === "Pending" || value1 === "pending") {
                              var statusColor =
                                "border bg-yellow-500 text-xs rounded-lg text-center py-0.5 w-24 px-1 text-white";
                            }
                            if (
                              typeof value1 === "string" &&
                              value1.toLowerCase().includes("pending")
                            ) {
                              var statusColor =
                                "border bg-yellow-500 text-xs rounded-lg text-center py-0.5 w-40 px-1 text-white";
                            }

                            let textWrap = "";
                            if (
                              key === "program" ||
                              key === "project" ||
                              key === "activityName" ||
                              key === "subactivityName"
                            ) {
                              textWrap =
                                "whitespace-normal break-words max-w-xs overflow-hidden";
                            }

                            var found = Object.keys(tableHeading).filter((k) => {
                              return k === key;
                            });

                            // {console.log(i," | key = ",key, " | value = ",value1)}

                            if (found.length > 0) {
                              if (key !== "id") {
                                return (
                                  <td
                                    className={`px-2 py-2 border border-grayTwo text-wrap border-l-0 whitespace-normal break-words max-w-xs overflow-hidden ${amountArr.includes(key)
                                      ? "text-right text-nowrap whitespace-nowrap"
                                      : ""
                                      } ${i === Object.entries(value).length - 1
                                        ? "border-r-1"
                                        : "border-r-0"
                                      } text-black`}
                                    key={i}
                                  >
                                    <div
                                      className={`font-normal text-wrap  ${textAlign} ${statusColor} ${heightOfPara} ${textWrap}`}
                                      style={remarksStyle ? remarksStyle : {}}
                                      dangerouslySetInnerHTML={{
                                        __html: value1,
                                        // __html: valueStr,
                                      }}
                                    ></div>
                                  </td>
                                );
                              }
                            }
                          })}
                        </tr>
                      );
                    })
                  ) : loading ? (
                    <tr>
                      <td colSpan={8} className="text-center text-Green text-3xl">
                        <FaSpinner className="animate-spin inline-flex mx-2" />
                      </td>
                    </tr>
                  ) : (
                    <tr className="">
                      <td colSpan={9} className="text-center">
                        No Record Found!
                      </td>
                    </tr>
                  )}
                  {/* {!tableData && tableData.length === 0 && (
                  <tr className="">
                    <td colSpan={9} className="text-center">
                      No Record Found!
                    </td>
                  </tr>
                )} */}
                </tbody>
              </table>
            </div>
            {/* {console.log("tableObjects.noPagination",tableObjects.noPagination)} */}
            {tableObjects.noPagination ? null : (
              <div className="flex justify-center my-5">
                <nav aria-label="Page navigation flex">
                  {/* {console.log("numOfPages:", numOfPages)}
                  {console.log("totalRecs:",
                    totalRecs,
                    "recsPerPage:",
                    recsPerPage,"pageNumber",pageNumber)} */}


                  {numOfPages.length > 1 && totalRecs > recsPerPage ? (
                    <ul className="pagination mx-auto ps-5 flex">
                      {pageNumber !== 1 ? (
                        <li
                          // className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
                          className="page-item hover px-3 py-1.5 border border-gray-400 cursor-pointer text-center border-e-0 flex items-center justify-center min-w-[40px] h-[40px]"

                          onClick={() => setPageNumber(--pageNumber)}
                        >
                          <span className="page-link ">
                            <span className="inline-flex items-center">
                              <FaAngleLeft />
                            </span>
                          </span>
                        </li>
                      ) : null}
                      {numOfPages.map((item, i) => {
                        return (
                          <li
                            key={i}
                            // className={
                            //   "page-item hover px-3 border border-gray-400 cursor-pointer text-center border-e-0 font-semibold " +
                            //   (pageNumber === item ? " active" : "")
                            // }
                            className={"page-item hover px-3 py-1.5 border border-gray-400 cursor-pointer text-center border-e-0 font-semibold flex items-center justify-center min-w-[40px] h-[40px] " + (pageNumber === item ? " active" : "")}

                            onClick={() => {
                              handlePageClick(item);
                            }}
                          >
                            <a className="page-link">{item}</a>
                          </li>
                        );
                      })}
                      {pageNumber !== numOfPages.length ? (
                        <li
                          // className="page-item hover px-3 border border-gray-400 cursor-pointer"
                          className="page-item hover px-3 py-1.5 border border-gray-400 cursor-pointer flex items-center justify-center min-w-[40px] h-[40px]"

                          onClick={() => {
                            setPageNumber(++pageNumber);
                          }}
                        >
                          <span className="page-link ">
                            <FaAngleRight />
                          </span>
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenericTable;
