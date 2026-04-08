// "use client";
// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import "animate.css";
// import { useRouter } from "next/navigation";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Tooltip } from "flowbite-react";
// import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
// import { FaUserGraduate, FaCalendarCheck } from "react-icons/fa";
// import { SlBookOpen } from "react-icons/sl";
// import { IoLocationSharp } from "react-icons/io5";
// import { FaSearch } from "react-icons/fa";
// import { idContext } from "@/app/admin/layout";
// import { MdOutlineEdit } from "react-icons/md";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import { FaFileDownload } from "react-icons/fa";
// import { FaEye } from "react-icons/fa";
// import { FaPlus, FaSpinner } from "react-icons/fa6";

// import * as XLSX from "xlsx";

// const GenericReport = ({
//   tableObjects,
//   twoLevelHeader,
//   tableHeading,
//   setRunCount,
//   runCount,
//   recsPerPage,
//   setRecsPerPage,
//   filterData,
//   getData,
//   tableData,
//   setTableData,
//   numOfPages,
//   setNumOfPages,
//   pageNumber,
//   setPageNumber,
//   searchText,
//   setSearchText,
//   totalRecs,
//   setTotalRecs,
//   search,
//   setSearch,
//   loading,
// }) => {
//   // console.log("runCount", runCount);
//   // console.log("recsPerPage", recsPerPage);
//   // console.log("filterData", filterData);
//   // console.log("tableData", tableData);
//   // console.log("numOfPages", numOfPages);
//   // console.log("pageNumber", pageNumber);
//   // console.log("searchText", searchText);
//   // console.log("totalRecs", totalRecs);

//   let router = useRouter();
//   // console.log("search", search);
//   const [deleteId, setDeleteId] = useState("");
//   let [sort, setSort] = useState(true);

//   // const [loading, setLoading] = useState(true);

//   const [checkDelete, setCheckDelete] = useState(false);
//   const [deleteModal, setDeleteModal] = useState(false);
//   const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);
//   const [deleteFailModal, setDeleteFailModal] = useState(false);
//   const [errorModal, setErrorModal] = useState(false);
//   const startSerialNumber = (pageNumber - 1) * recsPerPage + 1;

//   // const { setApprovalId } = useContext(idContext);

//   // console.log("propssss",props)

//   useEffect(() => {
//     getData();
//   }, [pageNumber, recsPerPage, runCount]);

//   useEffect(() => {
//     if (totalRecs > 0) {
//       const totalPages = Math.ceil(totalRecs / recsPerPage);

//       if (totalPages <= 5) {
//         const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//         setNumOfPages(pages);
//       } else {
//         let pages = [];

//         if (pageNumber <= 3) {
//           pages = [1, 2, 3, "...", totalPages];
//         } else if (pageNumber >= totalPages - 2) {
//           pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
//         } else {
//           pages = [
//             1,
//             "...",
//             pageNumber - 1,
//             pageNumber,
//             pageNumber + 1,
//             "...",
//             totalPages,
//           ];
//         }
//         console.log("numOfPages before", numOfPages);
//         setNumOfPages([...new Set(pages)]);
//       }
//     }
//   }, [totalRecs, recsPerPage, pageNumber]);

//   // useEffect(() => {
//   //   pagesLogic();
//   // }, [recsPerPage, totalRecs, runCount]);

//   // const pagesLogic = () => {
//   //   let totalPages = Math.ceil(totalRecs / recsPerPage);
//   //   let pageArr = [];
//   //   for (let i = 0; i < totalPages; i++) {
//   //     pageArr[i] = i + 1;
//   //   }
//   //   setNumOfPages(pageArr);
//   // };

//   useEffect(() => {
//     getData();
//   }, [recsPerPage, runCount]);

//   const deleteData = () => {
//     var uid = deleteId;
//     axios({
//       method: tableObjects?.deleteMethod,
//       url: `${tableObjects?.apiURL}/delete/${uid}`,
//     })
//       .then((deletedUser) => {
//         getData();
//         // setDeleteSuccessModal(true);
//       })
//       .catch((error) => {
//         console.log("Error Message from userslist delete redirect  => ", error);
//         // setErrorModal(true);
//       });
//   };

//   const redirect = (action, uid) => {
//     if (action === "redirect") {
//       // setApprovalId(uid);

//       window.location.href = tableObjects?.buttonURL + uid;
//     }
//     if (action === "edit") {
//       // router.push(tableObjects?.editURL + uid)
//       window.location.href = tableObjects?.editURL + uid;
//     }
//     if (action === "delete") {
//       // setDeleteModal(true);

//       Swal.fire({
//         title: " ",
//         text: `Are you sure you want to delete this ${tableObjects?.titleMsg}?`,
//         // icon: "warning",
//         showCancelButton: true,
//         cancelButtonText: "No, Don't Delete!",
//         // confirmButtonColor: "#3085d6",
//         cancelButtonColor: "#50c878",
//         confirmButtonText: "Yes, delete it!",
//         reverseButtons: true,
//         focusCancel: true,
//         customClass: {
//           confirmButton: "delete-btn",
//         },
//       }).then((result) => {
//         if (result.isConfirmed) {
//           axios({
//             method: tableObjects?.deleteMethod,
//             url: `${tableObjects?.apiURL}/delete/${uid}`,
//           })
//             .then((deletedUser) => {
//               getData();
//               Swal.fire({
//                 title: " ",
//                 text: `${tableObjects?.titleMsg} have been deleted.`,
//               });
//             })
//             .catch((error) => {
//               console.log(
//                 "Error Message from userslist delete redirect  => ",
//                 error
//               );
//               Swal.fire(" ", "Something Went Wrong <br/>" + error.message);
//             });
//         }
//       });
//     }
//   };
//   const sortNumber = (key, tableData) => {
//     const reA = /[^a-zA-Z]/g;
//     const reN = /[^0-9]/g;

//     const sortedData = tableData?.sort((a, b) => {
//       let nameA = "";
//       let nameB = "";
//       let aN = 0;
//       let bN = 0;

//       // Extract values for the given key
//       for (const [key1, value1] of Object.entries(a)) {
//         if (key === key1) {
//           nameA = value1.replace(reA, "");
//           aN = parseInt(value1.replace(reN, ""), 10);
//         }
//       }

//       for (const [key2, value2] of Object.entries(b)) {
//         if (key === key2) {
//           nameB = value2.replace(reA, "");
//           bN = parseInt(value2.replace(reN, ""), 10);
//         }
//       }

//       // Compare the values
//       if (sort) {
//         if (nameA === nameB) {
//           return aN - bN;
//         } else {
//           return nameA.localeCompare(nameB);
//         }
//       } else {
//         if (nameA === nameB) {
//           return bN - aN;
//         } else {
//           return nameB.localeCompare(nameA);
//         }
//       }
//     });

//     setSort(!sort);
//     setTableData(sortedData);
//   };
//   const sortString = (key, tableData) => {
//     const sortedData = tableData?.sort((a, b) => {
//       let nameA = "";
//       let nameB = "";

//       Object.entries(a).forEach(([key1, value1]) => {
//         if (key === key1) {
//           nameA = typeof value1 === "string" ? value1.toUpperCase() : value1;
//         }
//       });

//       Object.entries(b).forEach(([key2, value2]) => {
//         if (key === key2) {
//           nameB = typeof value2 === "string" ? value2.toUpperCase() : value2;
//         }
//       });

//       if (sort) {
//         if (nameA < nameB) return -1;
//         if (nameA > nameB) return 1;
//         return 0;
//       } else {
//         if (nameA > nameB) return -1;
//         if (nameA < nameB) return 1;
//         return 0;
//       }
//     });

//     setSort(!sort);
//     setTableData(sortedData);
//   };
//   const sortData = (event) => {
//     event.preventDefault();
//     var key = event.target.getAttribute("id");
//     // console.log("key", key);
//     if (key === "number") {
//       sortNumber(key, tableData);
//       // console.log("sortNumber", sortNumber);
//     } else {
//       sortString(key, tableData);
//       // console.log("sortString", sortString);
//     }
//   };

//   const exportToExcel = () => {
//     const workbook = XLSX.utils.book_new();
//     const worksheetData = [Object.values(tableHeading)];
//     const formvalues = { ...filterData, removePagination: true };
//     // console.log(
//     //   "tableObjects?.getListMethod,",
//     //   tableObjects?.getListMethod,
//     //   tableObjects?.apiURL
//     // );

//     axios({
//       method: tableObjects?.getListMethod,
//       url: `${tableObjects?.apiURL}`,
//       data: formvalues,
//     })
//       .then((response) => {
//         console.log("response?.data?.tableData", response?.data?.tableData.length);
//         const downloadData = response?.data?.tableData || [];

//         downloadData.forEach((row) => {
//           const contributorNames = (row.contributorName || "")
//             .toString()
//             .split("<br>");
//           const villages = (row.village || "").toString().split("<br>");
//           const aadhaarNos = (row.aadhaarNo || "").toString().split("<br>");
//           const amountsDeposited = (row.amountDeposited || "")
//             .toString()
//             .split("<br>");

//           const maxContributors = contributorNames.length;

//           for (let i = 0; i < maxContributors; i++) {
//             const rowData = [];

//             Object.keys(tableHeading).forEach((key) => {
//               if (
//                 [
//                   "contributorName",
//                   "village",
//                   "aadhaarNo",
//                   "amountDeposited",
//                 ].includes(key)
//               ) {
//                 if (key === "contributorName")
//                   rowData.push(contributorNames[i] || "--NA--");
//                 else if (key === "village")
//                   rowData.push(villages[i] || "--NA--");
//                 else if (key === "aadhaarNo")
//                   rowData.push(aadhaarNos[i] || "--NA--");
//                 else if (key === "amountDeposited")
//                   rowData.push(amountsDeposited[i] || 0);
//               } else {
//                 rowData.push(i === 0 ? row[key] : "");
//               }
//             });

//             worksheetData.push(rowData);
//           }
//         });

//         const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
//         XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
//         XLSX.writeFile(workbook, tableObjects?.titleMsg + ".xlsx");
//       })
//       .catch((error) => {
//         console.log("Error Message => ", error);
//         Swal.fire(" ", "Something went wrong");
//       });
//   };

//   // useEffect(() => {
//   //   if (tableData.length > 0 || tableData.length === 0) {
//   //     setLoading(false);
//   //   }
//   // }, []);

//   const amountArr = [
//     "totalApprovalAmount",
//     "approvalLHWRF",
//     "approvalCC",
//     "approvalExtGrant",
//     "totalUtilisedAmount",
//     "totalUtilisedLHWRF",
//     "totalUtilisedCC",
//     "totalUtilisedExtGrant",
//     "balanceAmount",
//     "plannedExtGrant",
//     "totalUtilisedExtGrant",
//     "approvalConvergence",
//     "totalConvergence",
//     "plannedConvergence",
//     "totalUtilisedConvergence",
//     "plannedCC",
//     "totalUtilisedUnitCost",
//     "totalUtilisedCC",
//     "plannedLHWRF",
//     "totalUtilisedLHWRF",
//     "plannedAmount",
//     "plannedLHWRF",
//     "plannedCC",
//     "plannedExtGrant",
//     "totalUtilisedAmount",
//     "totalUtilisedLHWRF",
//     "totalUtilisedCC",
//     "totalUtilisedExtGrant",
//     "fundReceiptExtGrant",
//     "utilisedExtGrant",
//     "fundReceiptCC",
//     "utilisedCC",
//     "utilisedLHWRF",
//     "amountReceived",
//     "amountDeposited",
//   ];

//   const numberArr = [
//     "plannedQuantity",
//     "totalUtilisedQuantity",
//     "approvalNoOfHouseholds",
//     "approvalNoOfBeneficiaries",
//     "totalNoOfHouseholds",
//     "totalNoOfBeneficiaries",
//     "plannedNoOfHouseholds",
//     "plannedNoOfBeneficiaries",
//     "totalNoOfHouseholds",
//     "totalNoOfBeneficiaries",
//   ];

//   const percentArr = [
//     "percentageUtilizedAgainstApproval",
//     "percentageUtilizedAgainstPlan",
//   ];

//   const handlePageClick = (page) => {
//     if (page === "...") return;
//     setPageNumber(page);
//   };

//   const formatToINR = (num) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     })
//       .format(num)
//       .replace(/^(\D+)/, "$1 ");
//   };

//   const formatNumberToCommas = (num) => {
//     return new Intl.NumberFormat("en-IN").format(num);
//   };

//   const formatNumberToPercent = (num) => {
//     return num + " %";
//   };

//   return (
//     <section className="mt-5 pt-5 w-full">

//     <div className={("container mx-auto transition-all duration-300 ")}>
//       <style jsx>{`
//         .resizing {
//           cursor: col-resize !important;
//         }
//         .resizing th {
//           background-color: rgba(59, 130, 246, 0.1);
//         }
//         .table-container {
//           max-height: 500px; /* Adjust as needed */
//           overflow-y: auto;
//           position: relative;
//         }
//         thead {
//           position: sticky;
//           top: 0;
//           z-index: 10;
//         }
//         thead.header2 {
//           top: ${twoLevelHeader && twoLevelHeader.length > 0 ? '48px' : '-4px'};
//           z-index: 9;
//         }
//         table {
//           width: 100%;
//           table-layout: auto;
//         }
//         th, td {
//           box-sizing: border-box;
//         }
//       `}</style>

//       <h1 className="text-xl pb-2 font-semibold  mb-2">
//         {tableObjects?.tableName}
//       </h1>

//       <div className="">
//         <div className="flex lg:flex-row md:flex-col flex-col mt-2 justify-between w-full">
//           <div className="text-sm">
//             <div className="">
//               <label
//                 htmlFor="recsPerPage"
//                 // className="mb-4 font-semibold"
//                 className="inputLabel"
//               >
//                 Records per Page
//               </label>
//               <div className="relative mt-2 rounded-md text-gray-500 w-full">
//                 <select
//                   // className="w-full border mt-2 text-sm"
//                   // className="stdSelectField py-1.5"
//                   className={`${
//                     recsPerPage
//                       ? "stdSelectField pl-3 w-3/4"
//                       : "stdSelectField pl-3 w-3/4"
//                   } ${recsPerPage ? "selectOption" : "font-normal"}
//               `}
//                   onChange={(event) => {
//                     setRecsPerPage(event.target.value);
//                     setPageNumber(1)
//                   }}
//                 >
//                   <option value={10} className="font-normal">
//                     10
//                   </option>
//                   <option value={50} className="font-normal">
//                     50
//                   </option>
//                   <option value={100} className="font-normal">
//                     100
//                   </option>
//                   <option value={500} className="font-normal">
//                     500
//                   </option>
//                   <option value={1000} className="font-normal">
//                     1000
//                   </option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="flex  text-sm lg:-mt-1 mt-5 pl-5 w-1/2 justify-between">
//             {tableObjects?.searchApply ? (
//               <div className="w-full">
//                 <label
//                   htmlFor="search"
//                   //  className="mb-4 font-semibold"
//                   className="inputLabel"
//                 >
//                   Search
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="pr-2 border-r-2">
//                       <FaSearch className="icon" />
//                     </span>
//                   </div>
//                   <input
//                     type="text"
//                     // className="w-full border mt-2 text-sm ps-1 pb-1"
//                     className="stdInputField"
//                     placeholder="Search"
//                     name="search"
//                     onChange={(event) => {
//                       // console.log("event.target.value => ", event.target.value);
//                       setSearchText(event.target.value);
//                     }}
//                   />
//                 </div>
//               </div>
//             ) : null}
//             <div className="mt-7 ml-4">
//               <Tooltip
//                 content="Download as Excel"
//                 placement="top"
//                 className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
//                 arrow={false}
//               >
//                 <FaFileDownload
//                   onClick={exportToExcel}
//                   size={"2rem"}
//                   className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                 />
//               </Tooltip>
//             </div>
//           </div>
//         </div>

//         <div className="table-responsive table-container relative overflow-hidden hover:overflow-auto w-full mt-3">
//           <table className="min-w-full table-fixed border-collapse text-base bottom  border-separate  w-full dark:w-full leading-tight">
//           {/* <table className="table-auto text-base bottom  border-separate border-spacing-y-2 w-full dark:w-full"> */}
//             <thead className="text-[13px] uppercase text-wrap bg-white dark:bg-white">
//               <tr className="">
//                 {twoLevelHeader.apply === true
//                   ? twoLevelHeader.firstHeaderData.map((data, index) => {
//                       // console.log('dataIIIIIIIIIIIIIIIIIII',data,index);

//                       var lastIndex = twoLevelHeader.firstHeaderData.length;
//                       return (
//                         <th
//                           key={index}
//                           colSpan={data.mergedColoums}
//                           className={`px-4 py-1 text-[13px] border  ${
//                             index !== lastIndex - 1 && index !== 0
//                               ? "border-l-0"
//                               : index === lastIndex - 1
//                               ? "border-l-0"
//                               : ""
//                           } border-grayTwo`}
//                         >
//                           {data.heading}
//                         </th>
//                       );
//                     })
//                   : null}
//               </tr>
//               <tr className="text-left">
//                 <th className="text-center text-[13px] px-4 py-1 border border-grayTwo">
//                   Sr. No
//                 </th>
//                 {tableHeading ? (
//                   Object.entries(tableHeading).map(([key, value], i) => {
//                     return (
//                       <th
//                         key={i}
//                         className={`px-4 py-1 border text-[13px] border-grayTwo border-l-0 ${
//                           i !== Object.entries(tableHeading).length - 1
//                             ? ""
//                             : // ? "border-r-0"
//                               ""
//                         }`}
//                         id="ActionContent"
//                       >
//                         {value}
//                       </th>
//                     );
//                   })
//                 ) : (
//                   <th className=""></th>
//                 )}
//               </tr>
//             </thead>
//             <tbody className="border border-grayTwo text-wrap text-[13px]">
//               {tableData && tableData.length > 0 ? (
//                 tableData.map((value, i) => {
//                   const serialNumber = startSerialNumber + i;
//                   return (
//                     <tr
//                       key={i}
//                       className="odd:bg-grayOne  even:bg-white border border-grayTwo text-[#000] font-medium"
//                     >
//                       <td className="text-center px-4 py-1 font-normal border border-grayTwo">
//                         {serialNumber}
//                       </td>
//                       {Object.entries(value).map(([key, value1], i) => {
//                         let valueStr = value1 != null ? value1.toString() : "";

//                         if (!isNaN(valueStr) && valueStr?.trim() !== "") {
//                           textAlign = "text-right";

//                           if (amountArr.includes(key)) {
//                             value1 = formatToINR(valueStr);
//                           }
//                           if (numberArr.includes(key)) {
//                             value1 = formatNumberToCommas(valueStr);
//                           }
//                           if (percentArr.includes(key)) {
//                             value1 = formatNumberToPercent(valueStr);
//                           }
//                         } else if (/^[A-Za-z]+$/.test(valueStr)) {
//                           // Check if the value is alphabetic using regex
//                           textAlign = "text-left";
//                           // } else if (valueStr?.includes(",")) {
//                           //   var textAlign = "text-right";
//                         } else {
//                           var textAlign = "text-left";
//                         }

//                         if (key === "remarks" || key === "convergenceNote") {
//                           var heightOfPara = `h-24 max-h-24 block ${
//                             valueStr.length < 40
//                               ? "overflow-y-hidden"
//                               : "overflow-y-scroll"
//                           }  overflow-x-hidden whitespace-pre-wrap break-all w-80 pe-2`;
//                           var remarksStyle = {
//                             display: "block",
//                             whiteSpace: "pre-wrap",
//                             wordBreak: "break-word",
//                           };
//                         }

//                         if (value1 === "Pending" || value1 === "pending") {
//                           var statusColor =
//                             "border bg-yellow-500 text-xs rounded-lg text-center py-0.5 px-1 text-white";
//                         }
//                         if (value1 === "approved" || value1 === "Approved") {
//                           var statusColor =
//                             "border bg-green rounded-lg text-xs text text-center py-0.5 px-1 text-white";
//                         }
//                         if (value1 === "rejected" || value1 === "Rejected") {
//                           var statusColor =
//                             "border bg-red-500 rounded-lg text-xs text-center py-0.5 px-1 text-white";
//                         }

//                         let textWrap = "";
//                         if (
//                           key === "contributorName" ||
//                           key === "village" ||
//                           key === "aadhaarNo" ||
//                           key === "amountDeposited"
//                         ) {
//                           textWrap = "text-nowrap max-w-fit";
//                         }

//                         var found = Object.keys(tableHeading).filter((k) => {
//                           return k === key;
//                         });

//                         // {console.log(i," | key = ",key, " | value = ",value1)}

//                         if (found.length > 0) {
//                           if (key !== "id") {
//                             return (
//                               <td
//                                 className={`px-4 py-1 border border-grayTwo border-l-0 ${
//                                   amountArr.includes(key)
//                                     ? "text-right text-nowrap whitespace-nowrap"
//                                     : ""
//                                 } ${
//                                   i === Object.entries(value).length - 1
//                                     ? "border-r-1"
//                                     : ""
//                                 } text-black`}
//                                 key={i}
//                               >
//                                 <div
//                                   className={
//                                     "font-normal  " +
//                                     textAlign +
//                                     " " +
//                                     (statusColor ? statusColor : "") +
//                                     textWrap +
//                                     heightOfPara
//                                   }
//                                   style={remarksStyle ? remarksStyle : {}}
//                                   dangerouslySetInnerHTML={{
//                                     __html: value1,
//                                     // __html: valueStr,
//                                   }}
//                                 ></div>
//                               </td>
//                             );
//                           }
//                         }
//                       })}
//                     </tr>
//                   );
//                 })
//               ) : loading ? (
//                 <tr>
//                   <td colSpan={10} className="text-center text-green text-lg">
//                     <FaSpinner className="animate-spin inline-flex mx-2" />
//                   </td>
//                 </tr>
//               ) : (
//                 <tr className="">
//                   <td
//                     colSpan={
//                       tableHeading ? Object.keys(tableHeading).length + 1 : 1
//                     }
//                     className="text-center"
//                   >
//                     No Record Found!
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           {/* {console.log("tableObjects.noPagination",tableObjects.noPagination)}
//           {console.log("numOfPages:", numOfPages)}
//                 {console.log("totalRecs:",
//                   totalRecs,
//                   "recsPerPage:",
//                   recsPerPage,"pageNumber",pageNumber)} */}
//           {tableObjects.noPagination ? null : (
//             <div className="flex justify-center my-5">
//               <nav aria-label="Page navigation flex">
//                 {/* {console.log("numOfPages:", numOfPages)}
//                 {console.log(
//                   "totalRecs:",
//                   totalRecs,
//                   "recsPerPage:",
//                   recsPerPage
//                 )} */}
//                 {numOfPages.length > 1 && totalRecs > recsPerPage ? (
//                   <ul className="pagination mx-auto ps-5 flex">
//                     {pageNumber !== 1 ? (
//                       <li
//                         className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
//                         onClick={() => setPageNumber(--pageNumber)}
//                       >
//                         <a className="page-link ">
//                           &nbsp; <FontAwesomeIcon icon={faAngleLeft} />
//                         </a>
//                       </li>
//                     ) : null}
//                     {numOfPages.map((item, i) => {
//                       return (
//                         <li
//                           key={i}
//                           className={
//                             "page-item hover px-3 border border-gray-400 cursor-pointer text-center border-e-0 font-semibold " +
//                             (pageNumber === item ? " active" : "")
//                           }
//                           onClick={() => {
//                             handlePageClick(item);
//                           }}
//                         >
//                           <a className="page-link">{item}</a>
//                         </li>
//                       );
//                     })}
//                     {pageNumber !== numOfPages.length ? (
//                       <li
//                         className="page-item hover px-3 border border-gray-400 cursor-pointer"
//                         onClick={() => {
//                           setPageNumber(++pageNumber);
//                         }}
//                       >
//                         <a className="page-link ">
//                           <FontAwesomeIcon icon={faAngleRight} />
//                         </a>
//                       </li>
//                     ) : null}
//                   </ul>
//                 ) : null}
//               </nav>
//             </div>
//           )}
//         </div>
//       </div>
//       </div>
//     </section>
//   );
// };

// export default GenericReport;

//Nehas code
"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "animate.css";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "flowbite-react";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
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

const GenericReport = ({
  tableObjects,
  twoLevelHeader,
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
  const [recsDropdownOpen, setRecsDropdownOpen] = useState(false);
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
  }, [pageNumber, recsPerPage, runCount]);

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
  // };

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
        // confirmButtonColor: "#3085d6",
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
                error,
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
    const worksheetData = [Object.values(tableHeading)];
    const formvalues = { ...filterData, removePagination: true };
    // console.log(
    //   "tableObjects?.getListMethod,",
    //   tableObjects?.getListMethod,
    //   tableObjects?.apiURL
    // );

    axios({
      method: tableObjects?.getListMethod,
      url: `${tableObjects?.apiURL}`,
      data: formvalues,
    })
      .then((response) => {
        console.log(
          "response?.data?.tableData",
          response?.data?.tableData.length,
        );
        const downloadData = response?.data?.tableData || [];

        downloadData.forEach((row) => {
          const contributorNames = (row.contributorName || "")
            .toString()
            .split("<br>");
          const villages = (row.village || "").toString().split("<br>");
          const aadhaarNos = (row.aadhaarNo || "").toString().split("<br>");
          const amountsDeposited = (row.amountDeposited || "")
            .toString()
            .split("<br>");

          const maxContributors = contributorNames.length;

          for (let i = 0; i < maxContributors; i++) {
            const rowData = [];

            Object.keys(tableHeading).forEach((key) => {
              if (
                [
                  "contributorName",
                  "village",
                  "aadhaarNo",
                  "amountDeposited",
                ].includes(key)
              ) {
                if (key === "contributorName")
                  rowData.push(contributorNames[i] || "--NA--");
                else if (key === "village")
                  rowData.push(villages[i] || "--NA--");
                else if (key === "aadhaarNo")
                  rowData.push(aadhaarNos[i] || "--NA--");
                else if (key === "amountDeposited")
                  rowData.push(amountsDeposited[i] || 0);
              } else {
                rowData.push(i === 0 ? row[key] : "");
              }
            });

            worksheetData.push(rowData);
          }
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, tableObjects?.titleMsg + ".xlsx");
      })
      .catch((error) => {
        console.log("Error Message => ", error);
        Swal.fire(" ", "Something went wrong");
      });
  };

  // useEffect(() => {
  //   if (tableData.length > 0 || tableData.length === 0) {
  //     setLoading(false);
  //   }
  // }, []);

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
    "totalUtilisedUnitCost",
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
    "amountReceived",
    "amountDeposited",
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

  const handlePageClick = (page) => {
    if (page === "...") return;
    setPageNumber(page);
  };

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

  const formatNumberToPercent = (num) => {
    return num + " %";
  };

  return (
    <section className="mt-5 pt-5 w-full">
      <div className={"container mx-auto transition-all duration-300 "}>
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
            top: ${twoLevelHeader && twoLevelHeader.length > 0
              ? "48px"
              : "-4px"};
            z-index: 9;
          }
          table {
            width: 100%;
            table-layout: auto;
          }
          th,
          td {
            box-sizing: border-box;
          }
        `}</style>

        <h1 className="text-xl pb-2 font-semibold  mb-2">
          {tableObjects?.tableName}
        </h1>

        <div className="">
          <div className="flex lg:flex-row md:flex-col flex-col mt-2 justify-between w-full">
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
                    className={`${
                      recsPerPage
                        ? "stdSelectField pl-3 w-3/4 flex justify-between items-center"
                        : "stdSelectField pl-3 w-3/4 flex justify-between items-center"
                    } ${recsPerPage ? "selectOption" : "font-normal"}
                `}
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

            <div className="flex flex-row items-end text-sm mt-5 md:mt-0 w-full md:w-1/2 gap-2">
              {tableObjects?.searchApply ? (
                <div className="flex-1">
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
                      className="stdInputField w-full"
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
              <div className="mt-0">
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
            </div>
          </div>

          <div className="table-responsive table-container relative overflow-hidden hover:overflow-auto w-full mt-3">
            <table className="min-w-full table-fixed border-collapse text-base bottom  border-separate  w-full dark:w-full leading-tight">
              {/* <table className="table-auto text-base bottom  border-separate border-spacing-y-2 w-full dark:w-full"> */}
              <thead className="text-[13px] uppercase text-wrap bg-white dark:bg-white">
                <tr className="">
                  {twoLevelHeader.apply === true
                    ? twoLevelHeader.firstHeaderData.map((data, index) => {
                        // console.log('dataIIIIIIIIIIIIIIIIIII',data,index);

                        var lastIndex = twoLevelHeader.firstHeaderData.length;
                        return (
                          <th
                            key={index}
                            colSpan={data.mergedColoums}
                            className={`px-4 py-1 text-[13px] border  ${
                              index !== lastIndex - 1 && index !== 0
                                ? "border-l-0"
                                : index === lastIndex - 1
                                  ? "border-l-0"
                                  : ""
                            } border-grayTwo`}
                          >
                            {data.heading}
                          </th>
                        );
                      })
                    : null}
                </tr>
                <tr className="text-left">
                  <th className="text-center text-[13px] px-4 py-1 border border-grayTwo">
                    Sr. No
                  </th>
                  {tableHeading ? (
                    Object.entries(tableHeading).map(([key, value], i) => {
                      return (
                        <th
                          key={i}
                          className={`px-4 py-1 border text-[13px] border-grayTwo border-l-0 ${
                            i !== Object.entries(tableHeading).length - 1
                              ? ""
                              : // ? "border-r-0"
                                ""
                          }`}
                          id="ActionContent"
                        >
                          {value}
                        </th>
                      );
                    })
                  ) : (
                    <th className=""></th>
                  )}
                </tr>
              </thead>
              <tbody className="border border-grayTwo text-wrap text-[13px]">
                {tableData && tableData.length > 0 ? (
                  tableData.map((value, i) => {
                    const serialNumber = startSerialNumber + i;
                    return (
                      <tr
                        key={i}
                        className="odd:bg-grayOne  even:bg-white border border-grayTwo text-[#000] font-medium"
                      >
                        <td className="text-center px-4 py-1 font-normal border border-grayTwo">
                          {serialNumber}
                        </td>
                        {Object.entries(value).map(([key, value1], i) => {
                          let valueStr =
                            value1 != null ? value1.toString() : "";

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

                          if (key === "remarks" || key === "convergenceNote") {
                            var heightOfPara = `h-24 max-h-24 block ${
                              valueStr.length < 40
                                ? "overflow-y-hidden"
                                : "overflow-y-scroll"
                            }  overflow-x-hidden whitespace-pre-wrap break-all w-80 pe-2`;
                            var remarksStyle = {
                              display: "block",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            };
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

                          let textWrap = "";
                          if (
                            key === "contributorName" ||
                            key === "village" ||
                            key === "aadhaarNo" ||
                            key === "amountDeposited"
                          ) {
                            textWrap = "text-nowrap max-w-fit";
                          }

                          var found = Object.keys(tableHeading).filter((k) => {
                            return k === key;
                          });

                          // {console.log(i," | key = ",key, " | value = ",value1)}

                          if (found.length > 0) {
                            if (key !== "id") {
                              return (
                                <td
                                  className={`px-4 py-1 border border-grayTwo border-l-0 ${
                                    amountArr.includes(key)
                                      ? "text-right text-nowrap whitespace-nowrap"
                                      : ""
                                  } ${
                                    i === Object.entries(value).length - 1
                                      ? "border-r-1"
                                      : ""
                                  } text-black`}
                                  key={i}
                                >
                                  <div
                                    className={
                                      "font-normal  " +
                                      textAlign +
                                      " " +
                                      (statusColor ? statusColor : "") +
                                      textWrap +
                                      heightOfPara
                                    }
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
                    <td colSpan={10} className="text-center text-green text-lg">
                      <FaSpinner className="animate-spin inline-flex mx-2" />
                    </td>
                  </tr>
                ) : (
                  <tr className="">
                    <td
                      colSpan={
                        tableHeading ? Object.keys(tableHeading).length + 1 : 1
                      }
                      className="text-center"
                    >
                      No Record Found!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* {console.log("tableObjects.noPagination",tableObjects.noPagination)}
          {console.log("numOfPages:", numOfPages)}
                {console.log("totalRecs:",
                  totalRecs,
                  "recsPerPage:",
                  recsPerPage,"pageNumber",pageNumber)} */}
            {tableObjects.noPagination ? null : (
              <div className="flex justify-center my-5">
                <nav aria-label="Page navigation flex">
                  {/* {console.log("numOfPages:", numOfPages)}
                {console.log(
                  "totalRecs:",
                  totalRecs,
                  "recsPerPage:",
                  recsPerPage
                )} */}
                  {numOfPages.length > 1 && totalRecs > recsPerPage ? (
                    <ul className="pagination mx-auto flex flex-nowrap justify-center ps-0 overflow-x-auto no-scrollbar whitespace-nowrap mb-4 gap-1 md:gap-px">
                      {pageNumber !== 1 ? (
                        <li
                          className="page-item hover border border-gray-400 cursor-pointer text-center flex items-center justify-center min-w-[32px] md:min-w-[40px] h-8 md:h-10 px-1 md:px-2"
                          onClick={() => setPageNumber(pageNumber - 1)}
                        >
                          <a className="page-link ">
                            <FontAwesomeIcon icon={faAngleLeft} />
                          </a>
                        </li>
                      ) : null}
                      {numOfPages.map((item, i) => {
                        return (
                          <li
                            key={i}
                            className={
                              "page-item hover border border-gray-400 cursor-pointer text-center font-semibold flex items-center justify-center min-w-[32px] md:min-w-[40px] h-8 md:h-10 px-1 md:px-2 " +
                              (pageNumber === item
                                ? " active bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700")
                            }
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
                          className="page-item hover border border-gray-400 cursor-pointer flex items-center justify-center min-w-[32px] md:min-w-[40px] h-8 md:h-10 px-1 md:px-2"
                          onClick={() => {
                            setPageNumber(pageNumber + 1);
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenericReport;
