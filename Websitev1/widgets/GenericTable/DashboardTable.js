"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "animate.css";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdClose } from "react-icons/md";
import { Modal, Tooltip } from "flowbite-react";
import { IoMdAdd } from "react-icons/io";
import validator from "validator";
import {
  faEye,
  faPenToSquare,
  faTrashCan,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FaUserGraduate, FaCalendarCheck } from "react-icons/fa";
import { SlBookOpen } from "react-icons/sl";
import { IoLocationSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { idContext } from "@/app/admin/layout";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaFileDownload } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaPlus, FaSpinner } from "react-icons/fa6";

import * as XLSX from "xlsx";

const GenericTable = ({
  tableObjects,
  tableHeading,
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
  // console.log("search", search);
  const [deleteId, setDeleteId] = useState("");
  let [sort, setSort] = useState(true);

  // const [loading, setLoading] = useState(true);

  const [checkDelete, setCheckDelete] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);
  const [deleteFailModal, setDeleteFailModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const startSerialNumber = (pageNumber - 1) * recsPerPage + 1;

  // const { setApprovalId } = useContext(idContext);

  // console.log("propssss",props)
  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getData();
  }, [pageNumber, recsPerPage, runCount]);

  useEffect(() => {
    pagesLogic();
  }, [recsPerPage, totalRecs, runCount]);

  const pagesLogic = () => {
    let totalPages = Math.ceil(totalRecs / recsPerPage);
    let pageArr = [];
    for (let i = 0; i < totalPages; i++) {
      pageArr[i] = i + 1;
    }
    setNumOfPages(pageArr);
  };

  useEffect(() => {
    getData();
  }, [recsPerPage, runCount]);

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

      window.location.href = tableObjects?.buttonURL + uid;
    }
    if (action === "edit") {
      // router.push(tableObjects?.editURL + uid)
      window.location.href = tableObjects?.editURL + uid;
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
        cancelButtonColor: "#50c878",
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
    // Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetData = [Object.values(tableHeading)];
    const formvalues = { ...filterData, removePagination: true };
    // console.log("formvalues",formvalues)
    axios({
      method: tableObjects?.getListMethod,
      url: `${tableObjects?.apiURL}/post/list`,
      data: formvalues,
    })
      .then((response) => {
        // console.log("response", response);
        var downloadData = response.data.tableData;

        // Add data to the worksheet
        downloadData.forEach((row) => {
          const rowData = Object.keys(tableHeading).map((key) => row[key]);
          worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Generate Excel file and download
        XLSX.writeFile(workbook, tableObjects?.titleMsg + ".xlsx");
      })
      .catch((error) => {
        console.log("Error Message from userslist delete redirect  => ", error);
        Swal.fire(" ", "Error Message from userslist delete redirect  =>");
        // setErrorModal(true);
      });
  };

  useEffect(() => {
    if (tableData.length > 0 || tableData.length === 0) {
      // setLoading(false);
    }
  }, []);

  const amountArr = [
    "totalApprovalAmount",
    "approvalLHWRF",
    "approvalCC",
    "approvalExtGrant",
    "totalUtilisedAmount",
    "totalUtilisedLHWRF",
    "totalUtilisedCC",
    "totalUtilisedExtGrant",
    "balanceAmount",
    "plannedExtGrant",
    "totalUtilisedExtGrant",
    "approvalConvergence",
    "totalConvergence",
    "plannedConvergence",
    "totalUtilisedConvergence",
    "plannedCC",
    "totalUtilisedCC",
    "plannedLHWRF",
    "totalUtilisedLHWRF",
    "plannedAmount",
    "plannedLHWRF",
    "plannedCC",
    "plannedExtGrant",
    "totalUtilisedAmount",
    "totalUtilisedLHWRF",
    "totalUtilisedCC",
    "totalUtilisedExtGrant",
    "fundReceiptExtGrant",
    "utilisedExtGrant",
    "fundReceiptCC",
    "utilisedCC",
    "utilisedLHWRF",
  ];

  const numberArr = [
    "plannedQuantity",
    "totalUtilisedQuantity",
    "approvalNoOfHouseholds",
    "approvalNoOfBeneficiaries",
    "totalNoOfHouseholds",
    "totalNoOfBeneficiaries",
    "plannedNoOfHouseholds",
    "plannedNoOfBeneficiaries",
    "totalNoOfHouseholds",
    "totalNoOfBeneficiaries",
  ];

  const percentArr = [
    "percentageUtilizedAgainstApproval",
    "percentageUtilizedAgainstPlan",
  ];

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
    }).format(num);
  };

  const formatNumberToCommas = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const formatNumberToPercent = (num) => {
    return num + " %";
  };

  return (
    <section className=" w-full">
      <h1 className="text-xl pb-2 font-semibold  mb-2">
        {tableObjects?.tableName}
      </h1>

      <div className="">
        <div className="flex lg:flex-row md:flex-col flex-col mt-2 justify-between w-full">
          {tableObjects?.paginationApply ? (
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
                  <select
                    // className="w-full border mt-2 text-sm"
                    // className="stdSelectField py-1.5"
                    className={`${
                      recsPerPage
                        ? "stdSelectField pl-3 w-3/4"
                        : "stdSelectField pl-3 w-3/4"
                    } ${recsPerPage ? "selectOption" : "font-normal"}
                `}
                    onChange={(event) => {
                      setRecsPerPage(event.target.value);
                    }}
                  >
                    <option value={10} className="font-normal">
                      10
                    </option>
                    <option value={20} className="font-normal">
                      20
                    </option>
                    <option value={50} className="font-normal">
                      50
                    </option>
                    <option value={100} className="font-normal">
                      100
                    </option>
                  </select>
                </div>
              </div>
            </div>
          ) : null}
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

        <div className="table-responsive relative overflow-hidden hover:overflow-auto w-full mt-3">
          {/* <table className="table-auto text-sm text-left rtl:text-right  dark: w-full"> */}
          <table className="table-auto leading-5 text-[12px] bottom  border-separate border-spacing-y-2 w-full dark:w-full">
            <thead className="uppercase bg-white dark:bg-white">
              <tr className="text-left border border-grayTwo  border-x-1">
                {tableObjects.NoSrNumber ? null : (
                  <th className="text-center px-4 py-3 border border-grayTwo border-r-0">
                    Sr. No
                  </th>
                )}
                {tableHeading ? (
                  Object.entries(tableHeading).map(([key, value], i) => {
                    if (key === "actions") {
                      return (
                        <th
                          key={i}
                          className="px-4 py-3 border border-grayTwo border-l-0"
                          id="ActionContent"
                        >
                          {value}
                        </th>
                      );
                    } else {
                      return (
                        <th
                          key={i}
                          className={`${
                            i === Object.entries(tableHeading).length - 1
                              ? "border-l-0 border-r-1"
                              : i === 0
                              ? "border-l-1 border-r-0"
                              : "border-l-0 border-r-0"
                          }  px-4 py-3 border border-grayTwo `}
                        >
                          <span className="w-[50px] text-wrap">{value} </span>
                          {/*<span
                              onClick={sortData}
                              id={key}
                              className="fa cursor-pointer fa-sort tableSort"
                            ></span>*/}
                        </th>
                      );
                    }
                  })
                ) : (
                  <th className=""></th>
                )}
              </tr>
            </thead>
            <tbody className="border border-grayTwo">
              {tableData && tableData.length > 0 ? (
                tableData.map((value, i) => {
                  const serialNumber = startSerialNumber + i;
                  return (
                    <tr
                      key={i}
                      className="odd: bg-grayOne  even:bg-white border border-grayTwo text-neutral-950 font-medium"
                    >
                      {tableObjects.NoSrNumber ? null : (
                        <td className="text-center px-4 py-2 font-normal border border-grayTwo border-r-0">
                          {serialNumber}
                        </td>
                      )}
                      {Object.entries(value).map(([key, value1], i) => {
                        let valueStr = value1 != null ? value1.toString() : "";

                        if (!isNaN(valueStr) && valueStr?.trim() !== "") {
                          textAlign = "text-right";

                          if (amountArr.includes(key)) {
                            value1 = formatToINR(valueStr);
                          }
                          if (numberArr.includes(key)) {
                            value1 = formatNumberToCommas(valueStr);
                          }
                          if (percentArr.includes(key)) {
                            value1 = formatNumberToPercent(valueStr);
                          }
                        } else if (/^[A-Za-z]+$/.test(valueStr)) {
                          // Check if the value is alphabetic using regex
                          textAlign = "text-left";
                          // } else if (valueStr?.includes(",")) {
                          //   var textAlign = "text-right";
                        } else {
                          var textAlign = "text-left";
                        }
                        if (value1 === "Pending" || value1 === "pending") {
                          var statusColor =
                            "border bg-yellow-500 text-xs rounded-lg text-center py-0.5 px-1 text-white";
                        }
                        if (value1 === "approved" || value1 === "Approved") {
                          var statusColor =
                            "border bg-green rounded-lg text-xs text text-center py-0.5 px-1 text-white";
                        }
                        if (value1 === "rejected" || value1 === "Rejected") {
                          var statusColor =
                            "border bg-red-500 rounded-lg text-xs text-center py-0.5 px-1 text-white";
                        }
                        var found = Object.keys(tableHeading).filter((k) => {
                          return k === key;
                        });

                        // {console.log(i," | key = ",key, " | value = ",value1)}

                        if (found.length > 0) {
                          if (key !== "id") {
                            return (
                              <td
                                className={`${
                                  i === Object.entries(value).length - 1
                                    ? "border-l-0 border-r-1"
                                    : i === 0
                                    ? "border-l-1 border-r-0"
                                    : "border-l-0 border-r-0"
                                } px-4 py-3 border border-grayTwo `}
                                key={i}
                              >
                                <div
                                  className={
                                    "w-[50px] text-wrap font-normal  " +
                                      textAlign +
                                      statusColor +
                                      key ===
                                      "balanceAmount" && "text-nowrap"
                                  }
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
                      {tableHeading && tableHeading.actions ? (
                        <td className="border border-grayTwo  border-l-0">
                          <div className="flex mx-3  gap-1 items-center">
                            {tableObjects.formURL === "Add Center Incharge" && (
                              <Tooltip
                                content="Add Center Incharge"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                              >
                                <FaPlus
                                  className="border me-2 border-gray-500 text-gray-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                  size={"1.3rem"}
                                  onClick={() =>
                                    router.push(
                                      "/admin/master-data/center-details/add-center-incharge/" +
                                        value._id
                                    )
                                  }
                                />
                              </Tooltip>
                            )}
                            <Tooltip
                              content="View Profile"
                              placement="bottom"
                              className="bg-green"
                              arrow={false}
                            >
                              {tableObjects.formText === "Approval Form" ||
                              tableObjects.formText === "Add Center Details" ? (
                                <FaEye
                                  className="border me-2 border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                  size={"1.3rem"}
                                  onClick={() => {
                                    if (
                                      tableObjects.formText === "Approval Form"
                                    ) {
                                      router.push(
                                        "/admin/approval-management/approval-details/" +
                                          value._id
                                      );
                                    } else if (
                                      tableObjects.formText ===
                                      "Add Center Details"
                                    ) {
                                      router.push(
                                        "/admin/master-data/center-details/center-profile/" +
                                          value._id
                                      );
                                    }
                                  }}
                                />
                              ) : (
                                ""
                              )}
                            </Tooltip>
                            <Tooltip
                              content="Edit"
                              placement="bottom"
                              className="bg-green"
                              arrow={false}
                            >
                              <MdOutlineEdit
                                className="border  border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                size={"1.3rem"}
                                onClick={() => redirect("edit", value._id)}
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
                            &nbsp;
                            {tableObjects?.showButton &&
                            value.finalStatus === "approved" ? (
                              <button
                                className={`formButtons ${
                                  tableHeading.finalStatus !== "approved" &&
                                  tableObjects.buttonText !== "Approval Form"
                                    ? "hidden"
                                    : "block"
                                } text-[10px] flex justify-center items-center leading-3 rounded-none`}
                                onClick={() => {
                                  redirect("redirect", value._id);
                                }}
                              >
                                {tableObjects?.buttonText}
                              </button>
                            ) : (
                              ""
                            )}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              ) : loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-Green text-3xl">
                    <FaSpinner className="animate-spin inline-flex mx-2" />
                  </td>
                </tr>
              ) : (
                <tr className="">
                  <td colSpan={5} className="text-center">
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

          {tableObjects.paginationApply ? (
            <div className="flex justify-center mt-8">
              <nav aria-label="Page navigation flex">
                {numOfPages.length > 1 && totalRecs > recsPerPage ? (
                  <ul className="pagination mx-auto ps-5 flex">
                    {pageNumber !== 1 ? (
                      <li
                        className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
                        onClick={() => setPageNumber(--pageNumber)}
                      >
                        <a className="page-link ">
                          &nbsp; <FontAwesomeIcon icon={faAngleLeft} />
                        </a>
                      </li>
                    ) : null}
                    {numOfPages.map((item, i) => {
                      return (
                        <li
                          key={i}
                          className={
                            "page-item hover px-3 border border-gray-400 cursor-pointer text-center border-e-0 font-semibold " +
                            (pageNumber === item ? " active" : "")
                          }
                          onClick={() => {
                            setPageNumber(item);
                          }}
                        >
                          <a className="page-link">{item}</a>
                        </li>
                      );
                    })}
                    {pageNumber !== numOfPages.length ? (
                      <li
                        className="page-item hover px-3 border border-gray-400 cursor-pointer"
                        onClick={() => {
                          setPageNumber(++pageNumber);
                        }}
                      >
                        <a className="page-link ">
                          <FontAwesomeIcon icon={faAngleRight} />
                        </a>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default GenericTable;
