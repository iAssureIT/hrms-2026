// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { Tooltip } from "flowbite-react";
// import { useRouter } from "next/navigation";
// import moment from "moment";
// import GenericTable from "@/widgets/GenericTable/FilterTable";

// import { FaWpforms, FaFileUpload, FaSpinner } from "react-icons/fa";
// import { BsPlusSquare } from "react-icons/bs";
// import { usePathname } from "next/navigation";
// import ls from "localstorage-slim";

// function ExternalGrantList() {
//   const pathname = usePathname();
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true })
//   );

//   const [centerName, setCenterName] = useState("all");
//   const [center_id, setCenter_id] = useState("");
//   const [program_id, setProgram_id] = useState("all");
//   const [program, setProgram] = useState("all");
//   const [project_id, setProject_id] = useState("all");
//   const [project, setProject] = useState("all");
//   const [activityName_id, setActivityName_id] = useState("all");
//   const [activityName, setActivityName] = useState("all");
//   const [subactivityName_id, setSubActivityName_id] = useState("all");
//   const [subactivityName, setSubActivityName] = useState("all");
//   const [fundingAgencyName, setFundingAgencyName] = useState("all");
//   const [fromDate, setFromDate] = useState("all");
//   const [toDate, setToDate] = useState("all");
//   const [centerNameList, setCenterNameList] = useState([]);
//   const [programList, setProgramList] = useState([]);
//   const [projectList, setProjectList] = useState([]);
//   const [ActivityNameList, setActivityNameList] = useState([]);
//   const [SubActivityNameList, setSubActivityNameList] = useState([]);
//   const [fundingAgencyList, setFundingAgencyList] = useState([]);
//   const [filterData, setFilterData] = useState([]);
//   const [runCount, setRunCount] = useState(0);

//   const [tableData, setTableData] = useState([]);
//   const [recsPerPage, setRecsPerPage] = useState(10);
//   const [numOfPages, setNumOfPages] = useState([1]);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [searchText, setSearchText] = useState("-");
//   const [totalRecs, setTotalRecs] = useState("-");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [loading2, setLoading2] = useState(false);
//   const [loading3, setLoading3] = useState(true);

//   const router = useRouter();

//   const tableHeading = {
//     actions: "Actions",
//     centerName: "Center Name",
//     program: "Program",
//     project: "Project",
//     activityName: "Activity Name",
//     subactivityName: "Subactivity Name",
//     fundingAgencyName: "Funding Agency Name",
//     fundReceiptNumber: "Voucher Receipt No.",
//     amountReceivedDate: "Amount Received Date",
//     amountReceived: "Amount Received",
//     utrTransactionNumber: "UTR/Transaction No.",
//     lhwrfBankName: "LHWRF Bank Name",
//     lhwrfBranchName: "Branch Name",
//     lhwrfAccountNumber: "Account No.",
//   };
//   const tableObjects = {
//     tableName: "",
//     deleteMethod: "delete",
//     getListMethod: "post",
//     center_ID: "all",
//     apiURL: "/api/fund-receipts",
//     editURL: "/fund-management/add-external-grant/",
//     searchApply: true,
//     downloadApply: true,
//     // buttonText: "External Grant",
//     // showButton: true,
//     buttonURL: "/fund-management/add-external-grant",
//     formURL: "/fund-management/add-external-grant",
//     formText: "Add External Grant",
//     titleMsg: "External Grant Details",
//   };

//   // Add a new function to fetch filtered data
//   const getData = async () => {
//     if (center_id !== "") {
//       var formValues = {
//         fundType: "External Grant",
//         searchText: searchText,
//         recsPerPage: recsPerPage,
//         pageNumber: pageNumber,
//         center_ID: center_id,
//         program_id: program_id,
//         project_id: project_id,
//         activityName_id: activityName_id,
//         subactivityName_id: subactivityName_id,
//         fundingAgencyName: fundingAgencyName,
//         fromDate: fromDate,
//         toDate: toDate,
//       };
//       setFilterData(formValues);
//       try {
//         const response = await axios.post(
//           "/api/fund-receipts/post/list",
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
//         setLoading3(false);
//       }
//     }
//   };

//   useEffect(() => {
//     // if (center_id !== null) {
//     getData();
//     // }
//   }, [
//     searchText,
//     center_id,
//     program_id,
//     project_id,
//     activityName_id,
//     subactivityName_id,
//     fundingAgencyName,
//     fromDate,
//     toDate,
//     pageNumber,
//     recsPerPage,
//     runCount,
//   ]);

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
//     }
//   }, []);

//   useEffect(() => {
//     getCenterNameList();
//     getProgramList();
//     getActivityNameList();
//     getFundingAgencyList();

//     const { startDate, endDate } = getCurrentFinancialYearRange();
//     // console.log("startDate",startDate);
//     // console.log("endDate",endDate);
//     setFromDate(startDate);
//     setToDate(endDate);
//   }, []);

//   const getCurrentFinancialYearRange = () => {
//     const today = new Date();

//     let financialYearStart = new Date(today.getFullYear(), 3, 1); // April 1st of the current year
//     let financialYearEnd = new Date(today.getFullYear() + 1, 2, 31); // March 31st of the next year

//     // If today is before April 1st, adjust the financial year range to the previous year
//     if (today < financialYearStart) {
//       financialYearStart = new Date(today.getFullYear() - 1, 3, 1); // April 1st of the previous year
//       financialYearEnd = new Date(today.getFullYear(), 2, 31); // March 31st of the current year
//     }

//     return {
//       startDate: moment(financialYearStart).format("YYYY-MM-DD"),
//       endDate: moment(financialYearEnd).format("YYYY-MM-DD"),
//     };
//   };

//   useEffect(() => {
//     if (program_id !== "all") {
//       getProjectList(program_id);
//     }
//   }, [program_id]);

//   useEffect(() => {
//     if (program_id !== "all" && project_id !== "all") {
//       getActivityNameList(program_id, project_id);
//     }
//   }, [program_id, project_id]);

//   const getProgramList = () => {
//     axios
//       .get("/api/programs/get")
//       .then((response) => {
//         const ProgramList = response.data;

//         if (Array.isArray(ProgramList)) {
//           // console.log("Setting ProgramList:", ProgramList);
//           setProgramList(
//             ProgramList.sort((a, b) => {
//               return a.fieldValue.localeCompare(b.fieldValue);
//             })
//           );
//         } else {
//           console.error("Expected data to be an array but got:", ProgramList);
//           setProgramList([]);
//         }
//       })
//       .catch((error) => {
//         console.log("Error while gettProgramList List => ", error);
//       });
//   };
//   const getProjectList = (program_id) => {
//     axios
//       .get("/api/subactivity-mapping/get/list/" + program_id)
//       .then((response) => {
//         // console.log("Responsedata getProjectList", response);
//         const ProjectList = response.data;

//         if (Array.isArray(ProjectList)) {
//           setProjectList(
//             ProjectList.sort((a, b) => {
//               return a.field2Value.localeCompare(b.field2Value);
//             })
//           );
//         } else {
//           console.error("Expected data to be an array but got:", ProjectList);
//           setProjectList([]);
//         }
//       })
//       .catch((error) => {
//         console.log("Error while gettProjectList List => ", error);
//       });
//   };

//   const getActivityNameList = (program_id, project_id) => {
//     if (program_id && project_id) {
//       axios
//         .get(
//           "/api/subactivity-mapping/get/list/" + program_id + "/" + project_id
//         )
//         // .get("/api/activity/get")
//         .then((response) => {
//           const ActivityNameList = response.data;

//           if (Array.isArray(ActivityNameList)) {
//             // console.log("Setting ActivityNameList:", ActivityNameList);
//             setActivityNameList(
//               ActivityNameList.sort((a, b) => {
//                 return a.field3Value.localeCompare(b.field3Value);
//               })
//             );
//           } else {
//             console.error(
//               "Expected data to be an array but got:",
//               ActivityNameList
//             );
//             setActivityNameList([]);
//           }
//         })
//         .catch((error) => {
//           console.log("Error while gettActivityNameList List => ", error);
//         });
//     }
//   };
//   const getCenterNameList = () => {
//     axios
//       .get("/api/centers/list")
//       .then((response) => {
//         const CenterNameList = response.data;

//         if (Array.isArray(CenterNameList)) {
//           // console.log("Setting CenterNameList:", CenterNameList);
//           setCenterNameList(
//             CenterNameList.sort((a, b) => {
//               return a.centerName.localeCompare(b.centerName);
//             })
//           );
//         } else {
//           console.error(
//             "Expected data to be an array but got:",
//             CenterNameList
//           );
//           setCenterNameList([]);
//         }
//       })
//       .catch((error) => {
//         console.log("Error while getting CenterName List => ", error);
//       });
//   };
//   const getSubActivities = async (program_id, project_id, activityName_id) => {
//     try {
//       const response = await axios.get(
//         "/api/subactivity-mapping/get/list/" +
//           program_id +
//           "/" +
//           project_id +
//           "/" +
//           activityName_id
//       );
//       // .get("/api/subactivity/get/" + id);

//       setSubActivityNameList(
//         response.data.sort((a, b) => {
//           return a.inputValue.localeCompare(b.inputValue);
//         })
//       );
//     } catch (error) {
//       console.error("Error fetching subactivities:", error);
//     }
//   };
//   const handleActivityChange = async (e) => {
//     const [activityName_id, activityName] = e.target.value.split("|");
//     setActivityName(activityName);
//     setActivityName_id(activityName_id);
//     setSubActivityName_id("all");
//     // Fetch subactivities for the selected activity
//     await getSubActivities(program_id, project_id, activityName_id);
//   };

//   const getFundingAgencyList = () => {
//     axios
//       .get("/api/fund-receipts/get/list")
//       .then((response) => {
//         // console.log("REsponsedata", response.data);
//         const fundingAgencyList = response.data;

//         if (Array.isArray(fundingAgencyList)) {
//           // console.log("Setting fundingAgencyList:", fundingAgencyList);
//           setFundingAgencyList(fundingAgencyList);
//         } else {
//           console.error(
//             "Expected data to be an array but got:",
//             fundingAgencyList
//           );
//           setFundingAgencyList([]);
//         }
//       })
//       .catch((error) => {
//         console.log("Error while getfundingAgencyList => ", error);
//       });
//   };

//   return (
//     <section className="section">
//       <div className="box border-2 rounded-md shadow-md">
//         <div className="uppercase text-xl font-semibold">
//           <div className="border-b-2 border-gray-300 flex justify-between">
//             <h1 className="heading h-auto content-center">
//               External Grant List
//             </h1>

//             {loggedInRole === "admin" || loggedInRole === "center" ? (
//               <div className="flex gap-3 my-6 me-10">
//                 <Tooltip
//                   content="Bulk Upload"
//                   placement="bottom"
//                   className="bg-green"
//                   arrow={false}
//                 >
//                   {loading ? (
//                     <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                   ) : (
//                     <FaFileUpload
//                       className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                       onClick={() => {
//                         // setLoading(true);
//                         window.open(
//                           "/" +loggedInRole +"/fund-management/add-external-grant/bulk-upload",
//                           '_self'
//                           // "noopener,noreferrer"
//                         );
//                       }}
//                     />
//                   )}
//                 </Tooltip>
//                 <Tooltip
//                   content="Add External Grant"
//                   placement="bottom"
//                   className="bg-green"
//                   arrow={false}
//                 >
//                   {loading2 ? (
//                     <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                   ) : (
//                     <BsPlusSquare
//                       className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                       onClick={() => {
//                         // setLoading2(true);
//                         window.open(
//                           "/" +loggedInRole +"/fund-management/add-external-grant",
//                           '_self'
//                           // "noopener,noreferrer"
//                         );
//                       }}
//                     />
//                   )}
//                 </Tooltip>
//               </div>
//             ) : null}
//           </div>
//         </div>
//         <div className="px-10">
//           <div className="mt-4 mb-0 lg:mb-5 w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
//             {loggedInRole === "admin" || loggedInRole === "executive" ? (
//               <div className="">
//                 <label htmlFor="centerName" className="inputLabel">
//                   Center
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                   <select
//                     name="centerName"
//                     id="centerName"
//                     className="stdSelectField  pl-3"
//                     value={center_id ? `${center_id}|${centerName}` : ""}
//                     onChange={(e) => {
//                       const [center_id, centerName] = e.target.value.split("|");
//                       setCenterName(centerName);
//                       setCenter_id(center_id);
//                       setProgram("all");
//                       setProgram_id("all");
//                       setProject_id("all");
//                       setActivityName_id("all");
//                       setSubActivityName_id("all");
//                     }}
//                   >
//                     <option value="" disabled className="text-gray-400">
//                       -- Select Center --
//                     </option>
//                     <option value="all">All</option>
//                     {centerNameList?.map((center, i) => (
//                       <option
//                         className="text-black"
//                         key={i}
//                         value={`${center._id}|${center.centerName}`}
//                       >
//                         {center.centerName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             ) : null}
//             <div className="">
//               <label htmlFor="program" className="inputLabel">
//                 Program
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                 <select
//                   name="program"
//                   id="program"
//                   className="stdSelectField pl-3"
//                   value={program_id ? `${program_id}|${program}` : ""}
//                   onChange={(e) => {
//                     const [program_id, program] = e.target.value.split("|");

//                     setProgram(program);
//                     setProgram_id(program_id);
//                     setProject_id("all");
//                     setActivityName_id("all");
//                     setSubActivityName_id("all");
//                     getProjectList(program_id);
//                   }}
//                 >
//                   <option value="" disabled className="text-gray-400">
//                     -- Select Program --
//                   </option>
//                   <option value="all">All</option>
//                   {programList?.map((program, i) => {
//                     return (
//                       <option
//                         className="text-black"
//                         key={i}
//                         value={`${program._id}|${program.fieldValue}`}
//                       >
//                         {program.fieldValue}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="project" className="inputLabel">
//                 Project
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                 <select
//                   name="project"
//                   id="project"
//                   className="stdSelectField pl-3"
//                   value={project_id ? `${project_id}|${project}` : ""}
//                   onChange={(e) => {
//                     const [project_id, project] = e.target.value.split("|");

//                     setProject(project);
//                     setProject_id(project_id);
//                     setActivityName_id("all");
//                     setSubActivityName_id("all");
//                     getActivityNameList(program_id, project_id);
//                   }}
//                 >
//                   <option value="" selected disabled className="text-gray-400">
//                     -- Select Project --
//                   </option>
//                   <option value="all">All</option>
//                   {projectList?.map((project, i) => (
//                     <option
//                       className="text-black"
//                       key={i}
//                       value={`${project.field2_id}|${project.field2Value}`}
//                     >
//                       {project.field2Value}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="activity" className="inputLabel">
//                 Activity
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                 <select
//                   name="activity"
//                   id="activity"
//                   className="stdSelectField pl-3"
//                   value={
//                     activityName_id ? `${activityName_id}|${activityName}` : ""
//                   }
//                   onChange={handleActivityChange}
//                 >
//                   <option value="" disabled className="text-gray-400">
//                     -- Select Activity --
//                   </option>
//                   <option value="all">All</option>
//                   {ActivityNameList?.map((activity, i) => (
//                     <option
//                       className="text-black"
//                       key={i}
//                       value={`${activity.field3_id}|${activity.field3Value}`}
//                     >
//                       {activity.field3Value}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="subActivity" className="inputLabel">
//                 Subactivity
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                 <select
//                   name="subActivity"
//                   id="subActivity"
//                   className="stdSelectField pl-3"
//                   value={
//                     subactivityName_id
//                       ? `${subactivityName_id}|${subactivityName}`
//                       : ""
//                   }
//                   onChange={(e) => {
//                     const [subactivityName_id, subactivityName] =
//                       e.target.value.split("|");

//                     setSubActivityName(subactivityName);
//                     setSubActivityName_id(subactivityName_id);
//                   }}
//                 >
//                   <option value="" disabled className="text-gray-400">
//                     -- Select Subactivity --
//                   </option>
//                   <option value="all">All</option>
//                   {SubActivityNameList?.map((subactivity, i) => (
//                     <option
//                       className="text-black"
//                       key={i}
//                       value={`${subactivity._id}|${subactivity.inputValue}`}
//                     >
//                       {subactivity.inputValue}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="fundingAgencyName" className="inputLabel">
//                 Funding Agency
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm">
//                 <select
//                   name="fundingAgencyName"
//                   id="fundingAgencyName"
//                   value={fundingAgencyName}
//                   className="stdSelectField pl-3"
//                   placeholder="Enter Funding Agency Name"
//                   onChange={(e) => {
//                     setFundingAgencyName(e.target.value);
//                   }}
//                 >
//                   <option value="" disabled className="text-gray-400">
//                     -- Select Funding Agency --
//                   </option>
//                   <option value="all">All</option>
//                   {fundingAgencyList?.map((fundingAgency, i) => (
//                     <option
//                       className="text-black"
//                       key={i}
//                       value={`${fundingAgency._id}|${fundingAgency.fundingAgencyName}`}
//                     >
//                       {fundingAgency.fundingAgencyName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="fromDate" className="inputLabel">
//                 From Date
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm">
//                 <input
//                   type="date"
//                   name="fromDate"
//                   id="fromDate"
//                   className="stdInputField pl-3"
//                   // max={moment().format("YYYY-MM-DD")}
//                   value={fromDate}
//                   onChange={(e) => {
//                     setFromDate(e.target.value);
//                   }}
//                 />
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="toDate" className="inputLabel">
//                 To Date
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm">
//                 <input
//                   type="date"
//                   name="toDate"
//                   id="toDate"
//                   className="stdInputField pl-3"
//                   // max={moment().format("YYYY-MM-DD")}
//                   value={toDate}
//                   onChange={(e) => {
//                     setToDate(e.target.value);
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           <GenericTable
//             tableObjects={tableObjects ? tableObjects : {}}
//             tableHeading={tableHeading}
//             setRunCount={setRunCount}
//             runCount={runCount}
//             recsPerPage={recsPerPage}
//             setRecsPerPage={setRecsPerPage}
//             filterData={filterData}
//             getData={getData}
//             tableData={tableData}
//             setTableData={setTableData}
//             numOfPages={numOfPages}
//             setNumOfPages={setNumOfPages}
//             pageNumber={pageNumber}
//             setPageNumber={setPageNumber}
//             searchText={searchText}
//             setSearchText={setSearchText}
//             totalRecs={totalRecs}
//             setTotalRecs={setTotalRecs}
//             search={search}
//             setSearch={setSearch}
//             loading={loading3}
//           />
//         </div>
//       </div>
//     </section>
//   );
// }

// export default ExternalGrantList;





//Nehas code
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";
import moment from "moment";
import GenericTable from "@/widgets/GenericTable/FilterTable";

import { FaWpforms, FaFileUpload, FaSpinner } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";

function ExternalGrantList() {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );

  const [centerName, setCenterName] = useState("all");
  const [center_id, setCenter_id] = useState("");
  const [program_id, setProgram_id] = useState("all");
  const [program, setProgram] = useState("all");
  const [project_id, setProject_id] = useState("all");
  const [project, setProject] = useState("all");
  const [activityName_id, setActivityName_id] = useState("all");
  const [activityName, setActivityName] = useState("all");
  const [subactivityName_id, setSubActivityName_id] = useState("all");
  const [subactivityName, setSubActivityName] = useState("all");
  const [fundingAgencyName, setFundingAgencyName] = useState("all");
  const [fromDate, setFromDate] = useState("all");
  const [toDate, setToDate] = useState("all");
  const [centerNameList, setCenterNameList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [ActivityNameList, setActivityNameList] = useState([]);
  const [SubActivityNameList, setSubActivityNameList] = useState([]);
  const [fundingAgencyList, setFundingAgencyList] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(true);

  // Dropdown open/close states
  const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [subActivityDropdownOpen, setSubActivityDropdownOpen] = useState(false);
  const [fundingAgencyDropdownOpen, setFundingAgencyDropdownOpen] = useState(false);

  const router = useRouter();

  const tableHeading = {
    actions: "Actions",
    centerName: "Center Name",
    program: "Program",
    project: "Project",
    activityName: "Activity Name",
    subactivityName: "Subactivity Name",
    fundingAgencyName: "Funding Agency Name",
    fundReceiptNumber: "Voucher Receipt No.",
    amountReceivedDate: "Amount Received Date",
    amountReceived: "Amount Received",
    utrTransactionNumber: "UTR/Transaction No.",
    lhwrfBankName: "LHWRF Bank Name",
    lhwrfBranchName: "Branch Name",
    lhwrfAccountNumber: "Account No.",
  };
  const tableObjects = {
    tableName: "",
    deleteMethod: "delete",
    getListMethod: "post",
    center_ID: "all",
    apiURL: "/api/fund-receipts",
    editURL: "/fund-management/add-external-grant/",
    searchApply: true,
    downloadApply: true,
    // buttonText: "External Grant",
    // showButton: true,
    buttonURL: "/fund-management/add-external-grant",
    formURL: "/fund-management/add-external-grant",
    formText: "Add External Grant",
    titleMsg: "External Grant Details",
  };

  // Add a new function to fetch filtered data
  const getData = async () => {
    if (center_id !== "") {
      var formValues = {
        fundType: "External Grant",
        searchText: searchText,
        recsPerPage: recsPerPage,
        pageNumber: pageNumber,
        center_ID: center_id,
        program_id: program_id,
        project_id: project_id,
        activityName_id: activityName_id,
        subactivityName_id: subactivityName_id,
        fundingAgencyName: fundingAgencyName,
        fromDate: fromDate,
        toDate: toDate,
      };
      setFilterData(formValues);
      try {
        const response = await axios.post(
          "/api/fund-receipts/post/list",
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
        setLoading3(false);
      }
    }
  };

  useEffect(() => {
    // if (center_id !== null) {
    getData();
    // }
  }, [
    searchText,
    center_id,
    program_id,
    project_id,
    activityName_id,
    subactivityName_id,
    fundingAgencyName,
    fromDate,
    toDate,
    pageNumber,
    recsPerPage,
    runCount,
  ]);

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
    }
  }, []);

  useEffect(() => {
    getCenterNameList();
    getProgramList();
    getActivityNameList();
    getFundingAgencyList();

    const { startDate, endDate } = getCurrentFinancialYearRange();
    // console.log("startDate",startDate);
    // console.log("endDate",endDate);
    setFromDate(startDate);
    setToDate(endDate);
  }, []);

  const getCurrentFinancialYearRange = () => {
    const today = new Date();

    let financialYearStart = new Date(today.getFullYear(), 3, 1); // April 1st of the current year
    let financialYearEnd = new Date(today.getFullYear() + 1, 2, 31); // March 31st of the next year

    // If today is before April 1st, adjust the financial year range to the previous year
    if (today < financialYearStart) {
      financialYearStart = new Date(today.getFullYear() - 1, 3, 1); // April 1st of the previous year
      financialYearEnd = new Date(today.getFullYear(), 2, 31); // March 31st of the current year
    }

    return {
      startDate: moment(financialYearStart).format("YYYY-MM-DD"),
      endDate: moment(financialYearEnd).format("YYYY-MM-DD"),
    };
  };

  useEffect(() => {
    if (program_id !== "all") {
      getProjectList(program_id);
    }
  }, [program_id]);

  useEffect(() => {
    if (program_id !== "all" && project_id !== "all") {
      getActivityNameList(program_id, project_id);
    }
  }, [program_id, project_id]);

  const getProgramList = () => {
    axios
      .get("/api/programs/get")
      .then((response) => {
        const ProgramList = response.data;

        if (Array.isArray(ProgramList)) {
          // console.log("Setting ProgramList:", ProgramList);
          setProgramList(
            ProgramList.sort((a, b) => {
              return a.fieldValue.localeCompare(b.fieldValue);
            })
          );
        } else {
          console.error("Expected data to be an array but got:", ProgramList);
          setProgramList([]);
        }
      })
      .catch((error) => {
        console.log("Error while gettProgramList List => ", error);
      });
  };
  const getProjectList = (program_id) => {
    axios
      .get("/api/subactivity-mapping/get/list/" + program_id)
      .then((response) => {
        // console.log("Responsedata getProjectList", response);
        const ProjectList = response.data;

        if (Array.isArray(ProjectList)) {
          setProjectList(
            ProjectList.sort((a, b) => {
              return a.field2Value.localeCompare(b.field2Value);
            })
          );
        } else {
          console.error("Expected data to be an array but got:", ProjectList);
          setProjectList([]);
        }
      })
      .catch((error) => {
        console.log("Error while gettProjectList List => ", error);
      });
  };

  const getActivityNameList = (program_id, project_id) => {
    if (program_id && project_id) {
      axios
        .get(
          "/api/subactivity-mapping/get/list/" + program_id + "/" + project_id
        )
        // .get("/api/activity/get")
        .then((response) => {
          const ActivityNameList = response.data;

          if (Array.isArray(ActivityNameList)) {
            // console.log("Setting ActivityNameList:", ActivityNameList);
            setActivityNameList(
              ActivityNameList.sort((a, b) => {
                return a.field3Value.localeCompare(b.field3Value);
              })
            );
          } else {
            console.error(
              "Expected data to be an array but got:",
              ActivityNameList
            );
            setActivityNameList([]);
          }
        })
        .catch((error) => {
          console.log("Error while gettActivityNameList List => ", error);
        });
    }
  };
  const getCenterNameList = () => {
    axios
      .get("/api/centers/list")
      .then((response) => {
        const CenterNameList = response.data;

        if (Array.isArray(CenterNameList)) {
          // console.log("Setting CenterNameList:", CenterNameList);
          setCenterNameList(
            CenterNameList.sort((a, b) => {
              return a.centerName.localeCompare(b.centerName);
            })
          );
        } else {
          console.error(
            "Expected data to be an array but got:",
            CenterNameList
          );
          setCenterNameList([]);
        }
      })
      .catch((error) => {
        console.log("Error while getting CenterName List => ", error);
      });
  };
  const getSubActivities = async (program_id, project_id, activityName_id) => {
    try {
      const response = await axios.get(
        "/api/subactivity-mapping/get/list/" +
        program_id +
        "/" +
        project_id +
        "/" +
        activityName_id
      );
      // .get("/api/subactivity/get/" + id);

      setSubActivityNameList(
        response.data.sort((a, b) => {
          return a.inputValue.localeCompare(b.inputValue);
        })
      );
    } catch (error) {
      console.error("Error fetching subactivities:", error);
    }
  };
  const handleActivityChange = async (e) => {
    const [activityName_id, activityName] = e.target.value.split("|");
    setActivityName(activityName);
    setActivityName_id(activityName_id);
    setSubActivityName_id("all");
    // Fetch subactivities for the selected activity
    await getSubActivities(program_id, project_id, activityName_id);
  };

  const getFundingAgencyList = () => {
    axios
      .get("/api/fund-receipts/get/list")
      .then((response) => {
        // console.log("REsponsedata", response.data);
        const fundingAgencyList = response.data;

        if (Array.isArray(fundingAgencyList)) {
          // console.log("Setting fundingAgencyList:", fundingAgencyList);
          setFundingAgencyList(fundingAgencyList);
        } else {
          console.error(
            "Expected data to be an array but got:",
            fundingAgencyList
          );
          setFundingAgencyList([]);
        }
      })
      .catch((error) => {
        console.log("Error while getfundingAgencyList => ", error);
      });
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading h-auto content-center">
              External Grant List
            </h1>

            {loggedInRole === "admin" || loggedInRole === "center" ? (
              <div className="flex gap-3 my-6 me-10">
                <Tooltip
                  content="Bulk Upload"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                  ) : (
                    <FaFileUpload
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      onClick={() => {
                        // setLoading(true);
                        window.open(
                          "/" + loggedInRole + "/fund-management/add-external-grant/bulk-upload",
                          '_self'
                          // "noopener,noreferrer"
                        );
                      }}
                    />
                  )}
                </Tooltip>
                <Tooltip
                  content="Add External Grant"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  {loading2 ? (
                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                  ) : (
                    <BsPlusSquare
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      onClick={() => {
                        // setLoading2(true);
                        window.open(
                          "/" + loggedInRole + "/fund-management/add-external-grant",
                          '_self'
                          // "noopener,noreferrer"
                        );
                      }}
                    />
                  )}
                </Tooltip>
              </div>
            ) : null}
          </div>
        </div>
        <div className="px-10">
          <div className="mt-4 mb-0 lg:mb-5 w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
            {loggedInRole === "admin" || loggedInRole === "executive" ? (
              <div className="">
                <label htmlFor="centerName" className="inputLabel">
                  Center
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <div className="relative mt-2" >
                    <button
                      type="button"
                      onClick={() => setCenterDropdownOpen(!centerDropdownOpen)}
                      className="stdSelectField text-left w-full pl-3"
                    >
                      {center_id && center_id !== ""
                        ? centerName === "all"
                          ? "All"
                          : centerName
                        : "-- Select Center --"}

                      <svg
                        className="w-4 h-4 float-right mt-1"
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

                    {centerDropdownOpen && (
                      <div className="absolute z-20 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                        <div
                          onClick={() => {
                            setCenterName("all");
                            setCenter_id("all");
                            setProgram("all");
                            setProgram_id("all");
                            setProject_id("all");
                            setActivityName_id("all");
                            setSubActivityName_id("all");
                            setCenterDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          All
                        </div>

                        {centerNameList?.map((center, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setCenterName(center.centerName);
                              setCenter_id(center._id);
                              setProgram("all");
                              setProgram_id("all");
                              setProject_id("all");
                              setActivityName_id("all");
                              setSubActivityName_id("all");
                              setCenterDropdownOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {center.centerName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="">
              <label htmlFor="program" className="inputLabel">
                Program
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setProgramDropdownOpen(!programDropdownOpen)}
                    className="stdSelectField text-left w-full pl-3"
                  >
                    {program_id === "all"
                      ? "All"
                      : program_id !== ""
                        ? program
                        : "-- Select Program --"}

                    <svg
                      className="w-4 h-4 float-right mt-1"
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

                  {programDropdownOpen && (
                    <div className="absolute z-20 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setProgram("all");
                          setProgram_id("all");
                          setProject_id("all");
                          setActivityName_id("all");
                          setSubActivityName_id("all");
                          setProgramDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        All
                      </div>

                      {programList?.map((prog, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setProgram(prog.fieldValue);
                            setProgram_id(prog._id);
                            setProject_id("all");
                            setActivityName_id("all");
                            setSubActivityName_id("all");
                            getProjectList(prog._id);
                            setProgramDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {prog.fieldValue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="">
              <label htmlFor="project" className="inputLabel">
                Project
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                    className="stdSelectField text-left w-full pl-3"
                  >
                    {project_id === "all"
                      ? "All"
                      : project_id !== ""
                        ? project
                        : "-- Select Project --"}

                    <svg
                      className="w-4 h-4 float-right mt-1"
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

                  {projectDropdownOpen && (
                    <div className="absolute z-20 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setProject("all");
                          setProject_id("all");
                          setActivityName_id("all");
                          setSubActivityName_id("all");
                          setProjectDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        All
                      </div>

                      {projectList?.map((proj, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setProject(proj.field2Value);
                            setProject_id(proj.field2_id);
                            setActivityName_id("all");
                            setSubActivityName_id("all");
                            getActivityNameList(program_id, proj.field2_id);
                            setProjectDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {proj.field2Value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="">
              <label htmlFor="activity" className="inputLabel">
                Activity
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setActivityDropdownOpen(!activityDropdownOpen)}
                    className="stdSelectField text-left w-full pl-3"
                  >
                    {activityName_id === "all"
                      ? "All"
                      : activityName_id !== ""
                        ? activityName
                        : "-- Select Activity --"}

                    <svg
                      className="w-4 h-4 float-right mt-1"
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

                  {activityDropdownOpen && (
                    <div className="absolute z-20 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setActivityName("all");
                          setActivityName_id("all");
                          setSubActivityName_id("all");
                          setActivityDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        All
                      </div>

                      {ActivityNameList?.map((act, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            const event = { target: { value: `${act.field3_id}|${act.field3Value}` } };
                            handleActivityChange(event);
                            setActivityDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {act.field3Value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="">
              <label htmlFor="subActivity" className="inputLabel">
                Subactivity
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setSubActivityDropdownOpen(!subActivityDropdownOpen)}
                    className="stdSelectField text-left w-full pl-3"
                  >
                    {subactivityName_id === "all"
                      ? "All"
                      : subactivityName_id !== ""
                        ? subactivityName
                        : "-- Select Subactivity --"}

                    <svg
                      className="w-4 h-4 float-right mt-1"
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

                  {subActivityDropdownOpen && (
                    <div className="absolute z-20 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setSubActivityName("all");
                          setSubActivityName_id("all");
                          setSubActivityDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        All
                      </div>

                      {SubActivityNameList?.map((sub, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setSubActivityName(sub.inputValue);
                            setSubActivityName_id(sub._id);
                            setSubActivityDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {sub.inputValue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="">
              <label htmlFor="fundingAgencyName" className="inputLabel">
                Funding Agency
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setFundingAgencyDropdownOpen(!fundingAgencyDropdownOpen)}
                    className="stdSelectField text-left w-full pl-3"
                  >
                    {fundingAgencyName === "all"
                      ? "All"
                      : fundingAgencyName !== ""
                        ? fundingAgencyName.includes("|") ? fundingAgencyName.split("|")[1] : fundingAgencyName
                        : "-- Select Funding Agency --"}

                    <svg
                      className="w-4 h-4 float-right mt-1"
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

                  {fundingAgencyDropdownOpen && (
                    <div className="absolute z-20 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setFundingAgencyName("all");
                          setFundingAgencyDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        All
                      </div>

                      {fundingAgencyList?.map((agency, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setFundingAgencyName(`${agency._id}|${agency.fundingAgencyName}`);
                            setFundingAgencyDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {agency.fundingAgencyName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="">
              <label htmlFor="fromDate" className="inputLabel">
                From Date
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  type="date"
                  name="fromDate"
                  id="fromDate"
                  className="stdInputField pl-3"
                  // max={moment().format("YYYY-MM-DD")}
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="">
              <label htmlFor="toDate" className="inputLabel">
                To Date
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  type="date"
                  name="toDate"
                  id="toDate"
                  className="stdInputField pl-3"
                  // max={moment().format("YYYY-MM-DD")}
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

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
          />
        </div>
      </div>
    </section>
  );
}

export default ExternalGrantList;

