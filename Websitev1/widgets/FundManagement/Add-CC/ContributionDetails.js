// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";
// import moment from "moment";
// import html2pdf from "html2pdf.js";
// import validator from "validator";

// import { FaIndianRupeeSign } from "react-icons/fa6";
// import { MdOutlineEdit } from "react-icons/md";
// import { CiViewList } from "react-icons/ci";
// import Swal from "sweetalert2";
// import { Tooltip } from "flowbite-react";
// import {
//   FaFileDownload,
//   FaFileUpload,
//   FaRegFileAlt,
//   FaSpinner,
// } from "react-icons/fa";

// import { usePathname } from "next/navigation";
// import ls from "localstorage-slim";
// import GenericTable from "@/widgets/GenericTable/FilterTable";

// const ContributionDetails = () => {
//   const pathname = usePathname();
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true })
//   );
//   const [runCount, setRunCount] = useState(0);

//   // console.log("userDetails  =>", userDetails);

//   // const [initialStatus, setInitialStatus] = useState("");
//   const [user_id, setUser_id] = useState("");
//   const [center_id, setCenter_id] = useState("all");
//   const [update, setUpdate] = useState(false);
//   const [ccData, setCCData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [loading2, setLoading2] = useState(true);
//   const [loading3, setLoading3] = useState(false);
//   const [loading4, setLoading4] = useState(false);
//   const [loading5, setLoading5] = useState(false);
//   const [remarks, setRemarks] = useState("");

//   const [error, setError] = useState({});

//   const [filterData, setFilterData] = useState([]);

//   const [tableData, setTableData] = useState([]);
//   const [recsPerPage, setRecsPerPage] = useState(10);
//   const [numOfPages, setNumOfPages] = useState([1]);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [searchText, setSearchText] = useState("-");
//   const [totalRecs, setTotalRecs] = useState("-");
//   const [search, setSearch] = useState("");
//   const [pdfMode, setPdfMode] = useState(false);

//   const params = useParams();
//   const router = useRouter();
//   const contentRef = useRef();

//   useEffect(() => {
//     if (pathname.includes("admin")) {
//       setLoggedInRole("admin");
//       setCenter_id("all");
//     } else if (pathname.includes("center")) {
//       setLoggedInRole("center");
//       setCenter_id(userDetails.center_id);
//     } else {
//       setLoggedInRole("executive");
//       setCenter_id("all");
//       // console.log("userDetails.roles", userDetails.roles);

//       if (userDetails.roles.includes("senior-manager")) {
//         // const allCenter_idsBYSM = getCenterDetailsBySM(userDetails?.user_id)
//         // seniorManagerDetails.email
//       }
//     }
//   }, []);

//   useEffect(() => {
//     getCCData();
//   }, []);

//   // const getCenterDetailsBySM = (user_id) => {
//   //   axios
//   //   .get("/api/centers/get/centersBySM/" + user_id)
//   //   .then((response) => {
//   //     console.log("response", response.data);
//   //     return response.data.profile.seniorManagerDetails
//   //   })
//   //   .catch((error) => {
//   //     console.log(error);
//   //   })
//   // }

//   const tableHeading = {
//     contributorName: "Contributor Name",
//     village: "Village",
//     aadhaarNo: "Aadhaar No",
//     amountDeposited: "Amount Deposited",
//   };
//   const tableObjects = {
//     tableName: "Contributors List",
//     getListMethod: "post",
//     center_ID: "all",
//     apiURL: "/api/fund-receipts",
//     searchApply: true,
//     downloadApply: true,
//     titleMsg: "Contributors List",
//   };

//   const getCCData = () => {
//     axios
//       .get("/api/fund-receipts/get/one/" + params._id)
//       .then((response) => {
//         var ccData = response.data[0];
//         setCCData(ccData);

//         if (userDetails) {
//           const user_id = userDetails?.user_id;
//           const parseAuthName =
//             userDetails.firstName + " " + userDetails.lastName;
//           const parseAuthRole = userDetails.roles;

//           setUser_id(user_id);
//         }
//       })
//       .catch((error) => {
//         console.log("Error Message => ", error);
//         //   Swal.fire("Oops", "Something Went Wrong", "error");
//       })
//       .finally(() => {
//         setLoading2(false);
//       });
//   };

//   const getData = async () => {
//     if (center_id !== "") {
//       var formValues = {
//         fundType: "Community Contribution",
//         _id: params._id,
//         searchText: searchText,
//         recsPerPage: recsPerPage,
//         pageNumber: pageNumber,
//         center_ID: center_id,
//       };
//       setFilterData(formValues);
//       try {
//         const response = await axios.post(
//           "/api/fund-receipts/post/contributors-list",
//           formValues
//         );

//         if (response.data.success) {
//           setTotalRecs(response.data.totalRecs);
//           setTableData(response.data.tableData);
//         } else {
//           // if (response.data.success === false) {
//           Swal.fire(" ", response.data.errorMsg);
//           // }
//         }
//       } catch (error) {
//         console.error("Error fetching filtered data:", error);
//       } finally {
//         // if (center_id === null) {
//         setLoading3(false);
//         // }
//       }
//     }
//   };

//   useEffect(() => {
//     // if (center_id !== null) {
//     getData();
//     // }
//   }, [searchText, center_id, pageNumber, recsPerPage, runCount]);

//   // Function to check if all previous levels are approved

//   const hideElements = () => {
//     const elementsToHide = document.querySelectorAll(".hide-in-pdf");
//     const elementsToAdjust = document.querySelectorAll(".adjust-in-pdf");
//     elementsToHide.forEach((element) => {
//       element.style.display = "none";
//     });
//     elementsToAdjust.forEach((element) => {
//       element.style.marginTop = "10px";
//       element.style.marginBottom = "10px";
//     });
//     setPdfMode(true);
//   };

//   // Function to show elements again after PDF generation
//   const showElements = () => {
//     const elementsToHide = document.querySelectorAll(".hide-in-pdf");
//     elementsToHide.forEach((element) => {
//       element.style.display = "";
//     });
//     setPdfMode(false);
//   };

//   const downloadPDF = () => {
//     let element = document.getElementById("pdf-content");

//     hideElements();

//     const options = {
//       margin: 1,
//       filename: "contribution-details.pdf",
//       image: { type: "jpeg", quality: 1 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
//     };

//     html2pdf()
//       .from(element)
//       .set(options)
//       .save()
//       .then(() => {
//         showElements();
//       });

//     setLoading4(false);
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

//   return (
//     <section className="section">
//       <div className="box border-2 rounded-md shadow-md" id="pdf-content">
//         <div className="uppercase text-xl font-semibold">
//           <div className="border-b-2 border-gray-300 flex justify-between">
//             <h1 className="heading">Community Contribution Details</h1>
//             <div className="flex gap-3 my-5 me-10 hide-in-pdf">
//               <Tooltip
//                 content="Download as PDF"
//                 placement="bottom"
//                 className="bg-green"
//                 arrow={false}
//               >
//                 {loading4 ? (
//                   <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                 ) : (
//                   <FaFileDownload
//                     className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                     onClick={() => {
//                       setLoading4(true);
//                       downloadPDF();
//                     }}
//                   />
//                 )}
//               </Tooltip>
//               {loggedInRole === "admin" || loggedInRole === "center" ? (
//                 <Tooltip
//                   content="Edit"
//                   placement="bottom"
//                   className="bg-green"
//                   arrow={false}
//                 >
//                   {loading3 ? (
//                     <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                   ) : (
//                     <MdOutlineEdit
//                       className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                       // onClick={() => {
//                       //   setLoading3(true);
//                       //   router.push(
//                       //     `/${loggedInRole}/fund-management/add-cc/${params._id}`
//                       //   );
//                       // }}                        
//                       onClick={() => {
//                         window.open(
//                           `/${loggedInRole}/fund-management/add-cc/${params._id}`,
//                           '_self'
//                           // "noopener,noreferrer"
//                         );
//                       }}
//                     />
//                   )}
//                 </Tooltip>
//               ) : null}
//               {/* <Tooltip
//                 content="Contributors Bulk Upload"
//                 placement="bottom"
//                 className="bg-green"
//                 arrow={false}
//               >
//                 {loading5 ? (
//                   <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                 ) : (
//                   <FaFileUpload
//                     className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                     onClick={() => {
//                       setLoading5(true);
//                       router.push(
//                         "/" +
//                           loggedInRole +
//                           "/fund-management/add-cc/contributors-bulk-upload/" +
//                           params._id
//                       );
//                     }}
//                   />
//                 )}
//               </Tooltip> */}
//               <Tooltip
//                 content="Approval List"
//                 placement="bottom"
//                 className="bg-green"
//                 arrow={false}
//               >
//                 {loading ? (
//                   <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                 ) : (
//                   <CiViewList
//                     className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                     // onClick={() => {
//                     //   setLoading(true);
//                     //   router.push(
//                     //     "/" + loggedInRole + "/fund-management/cc-list"
//                     //   );
//                     // }}
//                     onClick={() => {
//                       window.open(
//                         "/" + loggedInRole + "/fund-management/cc-list",
//                         '_self'
//                         // "noopener,noreferrer"
//                       );
//                     }}
//                   />
//                 )}
//               </Tooltip>
//             </div>
//           </div>
//         </div>
//         <div className="px-10 py-6">
//           <div className="bg-white text-secondary">
//             <div className="me-2 rounded-md">
//               <div className="mt-5 mb-5 w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 adjust-in-pdf">
//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="centerName" className="inputLabel">
//                     Center Name
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.centerName ? (
//                       ccData?.centerName
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="centerName" className="inputLabel">
//                     Approval Number
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.approvalNo ? (
//                       ccData?.approvalNo
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 lg:me-4">
//                   <label
//                     htmlFor="approvalSubmissionDate"
//                     className="inputLabel"
//                   >
//                     Payment Type
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.paymentType ? (
//                       ccData?.paymentType
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-5 mb-5 w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="program" className="inputLabel">
//                     Program
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.program ? (
//                       ccData?.program
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="project" className="inputLabel">
//                     Project
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.project ? (
//                       ccData?.project
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="activityName" className="inputLabel">
//                     Activity
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.activityName ? (
//                       ccData?.activityName
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="subactivityName" className="inputLabel">
//                     Subactivity
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.subactivityName ? (
//                       ccData?.subactivityName
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 mt-5 flex w-full gap-2 lg:me-4 adjust-in-pdf">
//                   <div>
//                     <label htmlFor="quantity" className="inputLabel">
//                       Voucher Receipt No.
//                     </label>
//                     <div className="relative mt-2 font-normal text-[15px]">
//                       {ccData?.fundReceiptNumber ? (
//                         ccData?.fundReceiptNumber
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex-1 mt-5 lg:me-4">
//                   <label htmlFor="unitCost" className="inputLabel">
//                     Amount Received Date
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.amountReceivedDate ? (
//                       moment(ccData?.amountReceivedDate).format("DD-MM-YYYY")
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5 lg:me-4">
//                   <label htmlFor="noOfHouseholds" className="inputLabel">
//                     Amount Received
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.amountReceived ? (
//                       formatToINR(ccData?.amountReceived)
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       0
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5 lg:me-4">
//                   <label htmlFor="noOfBeneficiaries" className="inputLabel">
//                     Deposit Slip No.
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.depositSlipNumber ? (
//                       ccData?.depositSlipNumber
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 mt-5  lg:me-4 w-1/2 adjust-in-pdf">
//                   <label htmlFor="totalCost" className="inputLabel">
//                     UTR/Transaction No.
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.utrTransactionNumber ? (
//                       ccData?.utrTransactionNumber
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5  lg:me-4">
//                   <label htmlFor="grant" className="inputLabel">
//                     LHWRF Bank Name
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.lhwrfBankName ? (
//                       ccData?.lhwrfBankName
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5  lg:me-4">
//                   <label htmlFor="CC" className="inputLabel">
//                     LHWRF Branch Name
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.lhwrfBranchName ? (
//                       ccData?.lhwrfBranchName
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5  lg:me-4">
//                   <label htmlFor="LHWRF" className="inputLabel">
//                     LHWRF Account No.
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.lhwrfAccountNumber ? (
//                       ccData?.lhwrfAccountNumber
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5  lg:me-4">
//                   <label htmlFor="LHWRF" className="inputLabel">
//                     Total Contributors
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {ccData?.totalContributors ? (
//                       ccData?.totalContributors
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       0
//                     )}
//                   </div>
//                 </div>
//               </div>
//               {/* <h2 className="heading px-0 py-0">Contributors List</h2> */}
//               <GenericTable
//                 tableObjects={tableObjects ? tableObjects : {}}
//                 tableHeading={tableHeading}
//                 setRunCount={setRunCount}
//                 runCount={runCount}
//                 recsPerPage={recsPerPage}
//                 setRecsPerPage={setRecsPerPage}
//                 filterData={filterData}
//                 getData={getData}
//                 tableData={tableData}
//                 setTableData={setTableData}
//                 numOfPages={numOfPages}
//                 setNumOfPages={setNumOfPages}
//                 pageNumber={pageNumber}
//                 setPageNumber={setPageNumber}
//                 searchText={searchText}
//                 setSearchText={setSearchText}
//                 totalRecs={totalRecs}
//                 setTotalRecs={setTotalRecs}
//                 search={search}
//                 setSearch={setSearch}
//                 loading={loading3}
//                 pdfMode={pdfMode}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ContributionDetails;










//Nehas code
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import moment from "moment";
import html2pdf from "html2pdf.js";
import validator from "validator";

import { FaIndianRupeeSign } from "react-icons/fa6";
import { MdOutlineEdit } from "react-icons/md";
import { CiViewList } from "react-icons/ci";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import {
  FaFileDownload,
  FaFileUpload,
  FaRegFileAlt,
  FaSpinner,
} from "react-icons/fa";

import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
import GenericTable from "@/widgets/GenericTable/FilterTable";

const ContributionDetails = () => {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  const [runCount, setRunCount] = useState(0);

  // console.log("userDetails  =>", userDetails);

  // const [initialStatus, setInitialStatus] = useState("");
  const [user_id, setUser_id] = useState("");
  const [center_id, setCenter_id] = useState("all");
  const [update, setUpdate] = useState(false);
  const [ccData, setCCData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);
  const [loading5, setLoading5] = useState(false);
  const [remarks, setRemarks] = useState("");

  const [error, setError] = useState({});

  const [filterData, setFilterData] = useState([]);

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [pdfMode, setPdfMode] = useState(false);

  const params = useParams();
  const router = useRouter();
  const contentRef = useRef();

  useEffect(() => {
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
      setCenter_id("all");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
      setCenter_id(userDetails.center_id);
    } else {
      setLoggedInRole("executive");
      setCenter_id("all");
      // console.log("userDetails.roles", userDetails.roles);

      if (userDetails.roles.includes("senior-manager")) {
        // const allCenter_idsBYSM = getCenterDetailsBySM(userDetails?.user_id)
        // seniorManagerDetails.email
      }
    }
  }, []);

  useEffect(() => {
    getCCData();
  }, []);

  // const getCenterDetailsBySM = (user_id) => {
  //   axios
  //   .get("/api/centers/get/centersBySM/" + user_id)
  //   .then((response) => {
  //     console.log("response", response.data);
  //     return response.data.profile.seniorManagerDetails
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   })
  // }

  const tableHeading = {
    contributorName: "Contributor Name",
    village: "Village",
    aadhaarNo: "Aadhaar No",
    amountDeposited: "Amount Deposited",
  };
  const tableObjects = {
    tableName: "Contributors List",
    getListMethod: "post",
    center_ID: "all",
    apiURL: "/api/fund-receipts",
    searchApply: true,
    downloadApply: true,
    titleMsg: "Contributors List",
  };

  const getCCData = () => {
    axios
      .get("/api/fund-receipts/get/one/" + params._id)
      .then((response) => {
        var ccData = response.data[0];
        setCCData(ccData);

        if (userDetails) {
          const user_id = userDetails?.user_id;
          const parseAuthName =
            userDetails.firstName + " " + userDetails.lastName;
          const parseAuthRole = userDetails.roles;

          setUser_id(user_id);
        }
      })
      .catch((error) => {
        console.log("Error Message => ", error);
        //   Swal.fire("Oops", "Something Went Wrong", "error");
      })
      .finally(() => {
        setLoading2(false);
      });
  };

  const getData = async () => {
    if (center_id !== "") {
      var formValues = {
        fundType: "Community Contribution",
        _id: params._id,
        searchText: searchText,
        recsPerPage: recsPerPage,
        pageNumber: pageNumber,
        center_ID: center_id,
      };
      setFilterData(formValues);
      try {
        const response = await axios.post(
          "/api/fund-receipts/post/contributors-list",
          formValues
        );

        if (response.data.success) {
          setTotalRecs(response.data.totalRecs);
          setTableData(response.data.tableData);
        } else {
          // if (response.data.success === false) {
          Swal.fire(" ", response.data.errorMsg);
          // }
        }
      } catch (error) {
        console.error("Error fetching filtered data:", error);
      } finally {
        // if (center_id === null) {
        setLoading3(false);
        // }
      }
    }
  };

  useEffect(() => {
    // if (center_id !== null) {
    getData();
    // }
  }, [searchText, center_id, pageNumber, recsPerPage, runCount]);

  // Function to check if all previous levels are approved

  const hideElements = () => {
    const elementsToHide = document.querySelectorAll(".hide-in-pdf");
    const elementsToAdjust = document.querySelectorAll(".adjust-in-pdf");
    elementsToHide.forEach((element) => {
      element.style.display = "none";
    });
    elementsToAdjust.forEach((element) => {
      element.style.marginTop = "10px";
      element.style.marginBottom = "10px";
    });
    setPdfMode(true);
  };

  // Function to show elements again after PDF generation
  const showElements = () => {
    const elementsToHide = document.querySelectorAll(".hide-in-pdf");
    elementsToHide.forEach((element) => {
      element.style.display = "";
    });
    setPdfMode(false);
  };

  const downloadPDF = () => {
    let element = document.getElementById("pdf-content");

    hideElements();

    const options = {
      margin: 1,
      filename: "contribution-details.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(options)
      .save()
      .then(() => {
        showElements();
      });

    setLoading4(false);
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

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md" id="pdf-content">
        <div className="uppercase text-xl font-semibold">
         <div className="border-b-2 border-gray-300 flex flex-col-reverse md:flex-row justify-between items-start md:items-center py-2">

            <h1 className="heading px-4 md:pl-10">Community Contribution Details</h1>


            <div className="flex gap-3 my-2 md:my-5 px-4 md:px-0 md:me-10 hide-in-pdf w-full md:w-auto justify-end">

              <Tooltip
                content="Download as PDF"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading4 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <FaFileDownload
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      setLoading4(true);
                      downloadPDF();
                    }}
                  />
                )}
              </Tooltip>
              {loggedInRole === "admin" || loggedInRole === "center" ? (
                <Tooltip
                  content="Edit"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  {loading3 ? (
                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                  ) : (
                    <MdOutlineEdit
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      // onClick={() => {  
                      //   setLoading3(true);
                      //   router.push(
                      //     `/${loggedInRole}/fund-management/add-cc/${params._id}`
                      //   );
                      // }}                        
                      onClick={() => {
                        window.open(
                          `/${loggedInRole}/fund-management/add-cc/${params._id}`,
                          '_self'
                          // "noopener,noreferrer"
                        );
                      }}
                    />
                  )}
                </Tooltip>
              ) : null}
              {/* <Tooltip
                content="Contributors Bulk Upload"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading5 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <FaFileUpload
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      setLoading5(true);
                      router.push(
                        "/" +
                          loggedInRole +
                          "/fund-management/add-cc/contributors-bulk-upload/" +
                          params._id
                      );
                    }}
                  />
                )}
              </Tooltip> */}
              <Tooltip
                content="Approval List"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <CiViewList
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    // onClick={() => {
                    //   setLoading(true);
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
        <div className="px-10 py-6">
          <div className="bg-white text-secondary">
            <div className="me-2 rounded-md">
              <div className="mt-5 mb-5 w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 adjust-in-pdf">
                <div className="flex-1 lg:me-4">
                  <label htmlFor="centerName" className="inputLabel">
                    Center Name
                  </label>
                  <div className="relative mt-2 font-bold  text-[15px]">
                    {ccData?.centerName ? (
                      ccData?.centerName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="centerName" className="inputLabel">
                    Approval Number
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.approvalNo ? (
                      ccData?.approvalNo
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label
                    htmlFor="approvalSubmissionDate"
                    className="inputLabel"
                  >
                    Payment Type
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.paymentType ? (
                      ccData?.paymentType
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 mb-5 w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
                <div className="flex-1 lg:me-4">
                  <label htmlFor="program" className="inputLabel">
                    Program
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.program ? (
                      ccData?.program
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>

                <div className="flex-1 lg:me-4">
                  <label htmlFor="project" className="inputLabel">
                    Project
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.project ? (
                      ccData?.project
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="activityName" className="inputLabel">
                    Activity
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.activityName ? (
                      ccData?.activityName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>

                <div className="flex-1 lg:me-4">
                  <label htmlFor="subactivityName" className="inputLabel">
                    Subactivity
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.subactivityName ? (
                      ccData?.subactivityName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>

                <div className="flex-1 mt-5 flex w-full gap-2 lg:me-4 adjust-in-pdf">
                  <div>
                    <label htmlFor="quantity" className="inputLabel">
                      Voucher Receipt No.
                    </label>
                    <div className="relative mt-2 font-bold text-[15px]">
                      {ccData?.fundReceiptNumber ? (
                        ccData?.fundReceiptNumber
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 mt-5 lg:me-4">
                  <label htmlFor="unitCost" className="inputLabel">
                    Amount Received Date
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.amountReceivedDate ? (
                      moment(ccData?.amountReceivedDate).format("DD-MM-YYYY")
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5 lg:me-4">
                  <label htmlFor="noOfHouseholds" className="inputLabel">
                    Amount Received
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.amountReceived ? (
                      formatToINR(ccData?.amountReceived)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5 lg:me-4">
                  <label htmlFor="noOfBeneficiaries" className="inputLabel">
                    Deposit Slip No.
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.depositSlipNumber ? (
                      ccData?.depositSlipNumber
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>

                <div className="flex-1 mt-5  lg:me-4 w-1/2 adjust-in-pdf">
                  <label htmlFor="totalCost" className="inputLabel">
                    UTR/Transaction No.
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.utrTransactionNumber ? (
                      ccData?.utrTransactionNumber
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="grant" className="inputLabel">
                    LHWRF Bank Name
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.lhwrfBankName ? (
                      ccData?.lhwrfBankName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="CC" className="inputLabel">
                    LHWRF Branch Name
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.lhwrfBranchName ? (
                      ccData?.lhwrfBranchName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    LHWRF Account No.
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.lhwrfAccountNumber ? (
                      ccData?.lhwrfAccountNumber
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    Total Contributors
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {ccData?.totalContributors ? (
                      ccData?.totalContributors
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
              </div>
              {/* <h2 className="heading px-0 py-0">Contributors List</h2> */}
              <GenericTable
                tableObjects={tableObjects ? tableObjects : {}}
                tableHeading={tableHeading}
                setRunCount={setRunCount}
                runCount={runCount}
                recsPerPage={recsPerPage}
                setRecsPerPage={setRecsPerPage}
                filterData={filterData}
                getData={getData}
                tableData={tableData}
                setTableData={setTableData}
                numOfPages={numOfPages}
                setNumOfPages={setNumOfPages}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                searchText={searchText}
                setSearchText={setSearchText}
                totalRecs={totalRecs}
                setTotalRecs={setTotalRecs}
                search={search}
                setSearch={setSearch}
                loading={loading3}
                pdfMode={pdfMode}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributionDetails;
