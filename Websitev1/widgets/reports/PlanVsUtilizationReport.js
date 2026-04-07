// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { useRouter } from "next/navigation";
// import moment from "moment";
// import { FaFileUpload, FaWpforms } from "react-icons/fa";
// // import GenericReport from "@/widgets/GenericTable/FilterTable.js";
// import GenericReport from "./ReportTable";

// import { usePathname } from "next/navigation";
// import ls from "localstorage-slim";

// function PlanVsUtilizationReport() {
//   const pathname = usePathname();
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true })
//   );
//   // console.log("userDetails  =>", userDetails);

//   const [centerName, setCenterName] = useState("all");
//   const [center_id, setCenter_id] = useState("");
//   const [fromDate, setFromDate] = useState("all");
//   const [toDate, setToDate] = useState("all");
//   const [year, setYear] = useState("all");
//   const [program_id, setProgram_id] = useState("all");
//   const [program, setProgram] = useState("all");
//   const [project_id, setProject_id] = useState("all");
//   const [project, setProject] = useState("all");
//   const [activityName_id, setActivityName_id] = useState("all");
//   const [activityName, setActivityName] = useState("all");
//   const [subactivityName_id, setSubActivityName_id] = useState("all");
//   const [subactivityName, setSubActivityName] = useState("all");
//   const [centerNameList, setCenterNameList] = useState([]);
//   const [programList, setProgramList] = useState([]);
//   const [projectList, setProjectList] = useState([]);
//   const [ActivityNameList, setActivityNameList] = useState([]);
//   const [SubActivityNameList, setSubActivityNameList] = useState([]);
//   const [runCount, setRunCount] = useState(0);
//   const [filterData, setFilterData] = useState([]);
//   const [quarter, setQuarter] = useState("all");

//   const [tableData, setTableData] = useState([]);
//   const [recsPerPage, setRecsPerPage] = useState(10);
//   const [numOfPages, setNumOfPages] = useState([1]);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [searchText, setSearchText] = useState("-");
//   const [totalRecs, setTotalRecs] = useState("-");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const twoLevelHeader = {
//     apply: true,
//     firstHeaderData: [
//       {
//         heading: "Master Details",
//         mergedColoums: 6,
//         hide: true,
//       },
//       {
//         heading: "Plan Financial and Physical Details",
//         mergedColoums: 10,
//         hide: false,
//       },
//       {
//         heading: "Utilization Financial and Physical Details",
//         mergedColoums: 8,
//         hide: false,
//       },
//       {
//         heading: "-",
//         mergedColoums: 2,
//         hide: true,
//       },
//     ],
//   };

//   const tableHeading = {
//     centerName: "Center",
//     program: "Program",
//     project: "Project",
//     activityName: "Activity",
//     subactivityName: "Subactivity",
//     plannedUnit: "Unit",
//     quarter: "Quarter",
//     plannedQuantity: "Quantity",
//     plannedAmount: "Planned Amount",
//     plannedLHWRF: "LHWRF",
//     plannedCC: "CC",
//     plannedExtGrant: "Ext Grant",
//     plannedConvergence: "Convergence",
//     plannedNoOfHouseholds: "Impacted Households",
//     plannedNoOfBeneficiaries: "Reach (Beneficiaries)",
//     totalUtilisedQuantity: "Quantity",
//     totalUtilisedAmount: "Total Utilized Amount",
//     totalUtilisedLHWRF: "LHWRF",
//     totalUtilisedCC: "Community Contribution",
//     totalUtilisedExtGrant: "External Grant",
//     totalUtilisedConvergence: "Convergence",
//     totalNoOfHouseholds: "Impacted Households",
//     totalNoOfBeneficiaries: "Reach (Beneficiaries)",
//     percentageUtilizedAgainstPlan: "Percentage Utilized",
//     balanceAmount: "Balance Cost",
//   };
//   const tableObjects = {
//     tableName: "",
//     getListMethod: "post",
//     center_ID: "all",
//     apiURL: "/api/reports/post/plan-vs-utilization-report",
//     titleMsg: "PlanVsUtilizationReport",
//     searchApply: true,
//     downloadApply: true,
//     tableType: "report",
//   };

//   // Add a new function to fetch filtered data
//   const getData = async () => {
//     var formValues = {
//       searchText: searchText,
//       recsPerPage: recsPerPage,
//       pageNumber: pageNumber,
//       center_ID: center_id,
//       program_id: program_id,
//       project_id: project_id,
//       activityName_id: activityName_id,
//       subactivityName_id: subactivityName_id,
//       year: year,
//       quarter: quarter,
//       fromDate: fromDate,
//       toDate: toDate,
//     };
//     setFilterData(formValues);
//     try {
//       const response = await axios.post(
//         "/api/reports/post/plan-vs-utilization-report",
//         formValues
//       );
//       if (response.data.success) {
//         // console.log("response.data", response);
//         setTotalRecs(response.data.totalRecs);
//         setTableData(response.data.tableData);
//       } else {
//         console.log(response.data.errorMsg);
//       }
//     } catch (error) {
//       console.error("Error fetching filtered data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, [
//     center_id,
//     program_id,
//     project_id,
//     activityName_id,
//     subactivityName_id,
//     year,
//     quarter,
//     pageNumber,
//     recsPerPage,
//     runCount,
//     searchText,
//     fromDate,
//     toDate,
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

//     const { startDate, endDate } = getCurrentFinancialYearRange();
//     // console.log("startDate",startDate);
//     // console.log("endDate",endDate);
//     setFromDate(startDate);
//     setToDate(endDate);

//     getCenterNameList();
//     getProgramList();
//     getActivityNameList();
//   }, []);

//   useEffect(() => {
//     const currentFinancialYear = getCurrentFinancialYear();
//     setYear(currentFinancialYear);
//   }, []);

//   const getCurrentFinancialYear = () => {
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const isBeforeApril = today < new Date(currentYear, 3, 1); // Before April 1st
//     const startYear = isBeforeApril ? currentYear - 1 : currentYear;
//     const endYear = startYear + 1;
//     return `${startYear}-${endYear.toString().slice(-2)}`;
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
//     // console.log("getProjectList program_id => ", program_id);
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
//           setCenterNameList(CenterNameList);
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
//           response.data.sort((a, b) => {
//             return a.inputValue.localeCompare(b.inputValue);
//           })
//         );
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

//   const getFinancialYears = () => {
//     const today = new Date();
//     const currentYear = today.getFullYear();

//     // Check if today is before April 1st
//     const isBeforeApril = today < new Date(currentYear, 3, 1); // April is month 3 (zero-indexed)

//     const baseYear = isBeforeApril ? currentYear - 1 : currentYear;

//     const years = [];
//     for (let i = -2; i <= 2; i++) {
//       const startYear = baseYear + i;
//       const endYear = startYear + 1;
//       years.push(`${startYear}-${endYear.toString().slice(-2)}`);
//     }

//     return years;
//   };
//   const handleYearChange = (selectedYear) => {
//     setYear(selectedYear);

//     // If a quarter is already selected, recompute based on the new year
//     if (selectedYear !== "all") {
//       if (quarter && quarter !== "all") {
//         const { quarters } = getFinancialYearDates(selectedYear);
//         const selectedQuarter = quarter;
//         let selectedDates = null;

//         if (selectedQuarter === "Q1") selectedDates = quarters[0];
//         else if (selectedQuarter === "Q2") selectedDates = quarters[1];
//         else if (selectedQuarter === "Q3") selectedDates = quarters[2];
//         else if (selectedQuarter === "Q4") selectedDates = quarters[3];

//         if (selectedDates) {
//           setFromDate(selectedDates.start);
//           setToDate(selectedDates.end);
//         }
//       } else {
//         const { startDate, endDate } = getFinancialYearDates(selectedYear);
//         setFromDate(startDate);
//         setToDate(endDate);
//       }
//     } else {
//       setFromDate(""); // reset
//       setToDate("");
//     }
//   };

//   const handleQuarterChange = (selectedQuarter) => {
//     setQuarter(selectedQuarter);

//     if (year && year !== "all") {
//       if (selectedQuarter !== "all") {
//         const { quarters } = getFinancialYearDates(year);

//         let selectedDates = null;
//         if (selectedQuarter === "Q1") selectedDates = quarters[0];
//         else if (selectedQuarter === "Q2") selectedDates = quarters[1];
//         else if (selectedQuarter === "Q3") selectedDates = quarters[2];
//         else if (selectedQuarter === "Q4") selectedDates = quarters[3];

//         if (selectedDates) {
//           setFromDate(selectedDates.start);
//           setToDate(selectedDates.end);
//         }
//       } else {
//         const { startDate, endDate } = getFinancialYearDates(year);
//         setFromDate(startDate);
//         setToDate(endDate);
//       }
//     }
//   };

//   function getFinancialYearDates(financialYear) {
//     const [startYear, endYearSuffix] = financialYear.split("-").map(Number);
//     const startDate = new Date(`${startYear}-04-01`);
//     const endDate = new Date(`${startYear + 1}-03-31`);

//     const quarters = [
//       {
//         start: new Date(`${startYear}-04-01`),
//         end: new Date(`${startYear}-06-30`),
//       },
//       {
//         start: new Date(`${startYear}-07-01`),
//         end: new Date(`${startYear}-09-30`),
//       },
//       {
//         start: new Date(`${startYear}-10-01`),
//         end: new Date(`${startYear}-12-31`),
//       },
//       {
//         start: new Date(`${startYear + 1}-01-01`),
//         end: new Date(`${startYear + 1}-03-31`),
//       },
//     ];

//     const formatToYYYYDDMM = (date) => {
//       const year = date.getFullYear();
//       const day = String(date.getDate()).padStart(2, "0");
//       const month = String(date.getMonth() + 1).padStart(2, "0");
//       return `${year}-${month}-${day}`;

//     };

//     return {
//       startDate: formatToYYYYDDMM(startDate),
//       endDate: formatToYYYYDDMM(endDate),
//       quarters: quarters.map((q) => ({
//         start: formatToYYYYDDMM(q.start),
//         end: formatToYYYYDDMM(q.end),
//       })),
//     };
//   }

//   return (
//     <section className="section">
//       <div className="box border-2 rounded-md shadow-md">
//         <div className="uppercase text-xl font-semibold">
//           <div className="border-b-2 border-gray-300 flex justify-between">
//             <h1 className="heading h-auto content-center">
//               Plan vs Utilization Report
//             </h1>
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
//               <label htmlFor="year" className="inputLabel">
//                 Year
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                 <select
//                   name="year"
//                   id="year"
//                   className="stdSelectField pl-3"
//                   value={year}
//                   onChange={(e) => handleYearChange(e.target.value)}
//                   // onChange={(e) => {
//                   //   setYear(e.target.value);
//                   // }}
//               >
//                   <option value="" disabled className="text-gray-400">
//                     -- Select Year --
//                   </option>
//                   <option value="all">All</option>
//                   {getFinancialYears().map((financialYear) => (
//                     <option
//                       key={financialYear}
//                       value={financialYear}
//                       className="text-black"
//                     >
//                       {financialYear}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="quarter" className="inputLabel">
//                 Plan Quarter
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                 <select
//                   name="quarter"
//                   id="quarter"
//                   className="stdSelectField pl-3"
//                   value={quarter}
//                   // onChange={(e) => {
//                   //   setQuarter(e.target.value);
//                   // }}
//                   onChange={(e) => handleQuarterChange(e.target.value)}
//                 >
//                   <option value="" disabled className="text-gray-400">
//                     -- Select Quarter --
//                   </option>

//                   <option value="all" className="text-black">
//                     All
//                   </option>
//                   <option value="Q1" className="text-black">
//                     Q1
//                   </option>
//                   <option value="Q2" className="text-black">
//                     Q2
//                   </option>
//                   <option value="Q3" className="text-black">
//                     Q3
//                   </option>
//                   <option value="Q4" className="text-black">
//                     Q4
//                   </option>
//                 </select>
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="fromDate" className="inputLabel">
//                 Utilization From Date
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm">
//                 <input
//                   type="date"
//                   name="fromDate"
//                   id="fromDate"
//                   className="stdInputField  pl-3"
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
//                 Utilization To Date
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm">
//                 <input
//                   type="date"
//                   name="toDate"
//                   id="toDate"
//                   className="stdInputField  pl-3"
//                   // max={moment().format("YYYY-MM-DD")}
//                   value={toDate}
//                   onChange={(e) => {
//                     setToDate(e.target.value);
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           <GenericReport
//             tableObjects={tableObjects ? tableObjects : {}}
//             twoLevelHeader={twoLevelHeader}
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
//             loading={loading}
//           />
//         </div>
//       </div>
//     </section>
//   );
// }

// export default PlanVsUtilizationReport;



//Nehas code
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import moment from "moment";
import { FaFileUpload, FaWpforms } from "react-icons/fa";
// import GenericReport from "@/widgets/GenericTable/FilterTable.js";
import GenericReport from "./ReportTable";

import { usePathname } from "next/navigation";
import ls from "localstorage-slim";

function PlanVsUtilizationReport() {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  // console.log("userDetails  =>", userDetails);

  const [centerName, setCenterName] = useState("all");
  const [center_id, setCenter_id] = useState("");
  const [fromDate, setFromDate] = useState("all");
  const [toDate, setToDate] = useState("all");
  const [year, setYear] = useState("all");
  const [program_id, setProgram_id] = useState("all");
  const [program, setProgram] = useState("all");
  const [project_id, setProject_id] = useState("all");
  const [project, setProject] = useState("all");
  const [activityName_id, setActivityName_id] = useState("all");
  const [activityName, setActivityName] = useState("all");
  const [subactivityName_id, setSubActivityName_id] = useState("all");
  const [subactivityName, setSubActivityName] = useState("all");
  const [centerNameList, setCenterNameList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [ActivityNameList, setActivityNameList] = useState([]);
  const [SubActivityNameList, setSubActivityNameList] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [filterData, setFilterData] = useState([]);
  const [quarter, setQuarter] = useState("all");

  const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [subactivityDropdownOpen, setSubactivityDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [quarterDropdownOpen, setQuarterDropdownOpen] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const twoLevelHeader = {
    apply: true,
    firstHeaderData: [
      {
        heading: "Master Details",
        mergedColoums: 6,
        hide: true,
      },
      {
        heading: "Plan Financial and Physical Details",
        mergedColoums: 10,
        hide: false,
      },
      {
        heading: "Utilization Financial and Physical Details",
        mergedColoums: 8,
        hide: false,
      },
      {
        heading: "-",
        mergedColoums: 2,
        hide: true,
      },
    ],
  };

  const tableHeading = {
    centerName: "Center",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    plannedUnit: "Unit",
    quarter: "Quarter",
    plannedQuantity: "Quantity",
    plannedAmount: "Planned Amount",
    plannedLHWRF: "LHWRF",
    plannedCC: "CC",
    plannedExtGrant: "Ext Grant",
    plannedConvergence: "Convergence",
    plannedNoOfHouseholds: "Impacted Households",
    plannedNoOfBeneficiaries: "Reach (Beneficiaries)",
    totalUtilisedQuantity: "Quantity",
    totalUtilisedAmount: "Total Utilized Amount",
    totalUtilisedLHWRF: "LHWRF",
    totalUtilisedCC: "Community Contribution",
    totalUtilisedExtGrant: "External Grant",
    totalUtilisedConvergence: "Convergence",
    totalNoOfHouseholds: "Impacted Households",
    totalNoOfBeneficiaries: "Reach (Beneficiaries)",
    percentageUtilizedAgainstPlan: "Percentage Utilized",
    balanceAmount: "Balance Cost",
  };
  const tableObjects = {
    tableName: "",
    getListMethod: "post",
    center_ID: "all",
    apiURL: "/api/reports/post/plan-vs-utilization-report",
    titleMsg: "PlanVsUtilizationReport",
    searchApply: true,
    downloadApply: true,
    tableType: "report",
  };

  // Add a new function to fetch filtered data
  const getData = async () => {
    var formValues = {
      searchText: searchText,
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
      center_ID: center_id,
      program_id: program_id,
      project_id: project_id,
      activityName_id: activityName_id,
      subactivityName_id: subactivityName_id,
      year: year,
      quarter: quarter,
      fromDate: fromDate,
      toDate: toDate,
    };
    setFilterData(formValues);
    try {
      const response = await axios.post(
        "/api/reports/post/plan-vs-utilization-report",
        formValues
      );
      if (response.data.success) {
        // console.log("response.data", response);
        setTotalRecs(response.data.totalRecs);
        setTableData(response.data.tableData);
      } else {
        console.log(response.data.errorMsg);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [
    center_id,
    program_id,
    project_id,
    activityName_id,
    subactivityName_id,
    year,
    quarter,
    pageNumber,
    recsPerPage,
    runCount,
    searchText,
    fromDate,
    toDate,
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

    const { startDate, endDate } = getCurrentFinancialYearRange();
    // console.log("startDate",startDate);
    // console.log("endDate",endDate);
    setFromDate(startDate);
    setToDate(endDate);

    getCenterNameList();
    getProgramList();
    getActivityNameList();
  }, []);

  useEffect(() => {
    const currentFinancialYear = getCurrentFinancialYear();
    setYear(currentFinancialYear);
  }, []);

  const getCurrentFinancialYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const isBeforeApril = today < new Date(currentYear, 3, 1); // Before April 1st
    const startYear = isBeforeApril ? currentYear - 1 : currentYear;
    const endYear = startYear + 1;
    return `${startYear}-${endYear.toString().slice(-2)}`;
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
    // console.log("getProjectList program_id => ", program_id);
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
          setCenterNameList(CenterNameList);
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

  const handleActivityClick = async (activity_id, activity_name) => {
    setActivityName(activity_name);
    setActivityName_id(activity_id);
    setSubActivityName_id("all");
    setSubActivityName("all");
    // Fetch subactivities for the selected activity
    await getSubActivities(program_id, project_id, activity_id);
    setActivityDropdownOpen(false);
  };

  const getFinancialYears = () => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Check if today is before April 1st
    const isBeforeApril = today < new Date(currentYear, 3, 1); // April is month 3 (zero-indexed)

    const baseYear = isBeforeApril ? currentYear - 1 : currentYear;

    const years = [];
    for (let i = -2; i <= 2; i++) {
      const startYear = baseYear + i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }

    return years;
  };
  const handleYearChange = (selectedYear) => {
    setYear(selectedYear);
    setYearDropdownOpen(false);

    // If a quarter is already selected, recompute based on the new year
    if (selectedYear !== "all") {
      if (quarter && quarter !== "all") {
        const { quarters } = getFinancialYearDates(selectedYear);
        const selectedQuarter = quarter;
        let selectedDates = null;

        if (selectedQuarter === "Q1") selectedDates = quarters[0];
        else if (selectedQuarter === "Q2") selectedDates = quarters[1];
        else if (selectedQuarter === "Q3") selectedDates = quarters[2];
        else if (selectedQuarter === "Q4") selectedDates = quarters[3];

        if (selectedDates) {
          setFromDate(selectedDates.start);
          setToDate(selectedDates.end);
        }
      } else {
        const { startDate, endDate } = getFinancialYearDates(selectedYear);
        setFromDate(startDate);
        setToDate(endDate);
      }
    } else {
      setFromDate(""); // reset
      setToDate("");
    }
  };

  const handleQuarterChange = (selectedQuarter) => {
    setQuarter(selectedQuarter);
    setQuarterDropdownOpen(false);

    if (year && year !== "all") {
      if (selectedQuarter !== "all") {
        const { quarters } = getFinancialYearDates(year);

        let selectedDates = null;
        if (selectedQuarter === "Q1") selectedDates = quarters[0];
        else if (selectedQuarter === "Q2") selectedDates = quarters[1];
        else if (selectedQuarter === "Q3") selectedDates = quarters[2];
        else if (selectedQuarter === "Q4") selectedDates = quarters[3];

        if (selectedDates) {
          setFromDate(selectedDates.start);
          setToDate(selectedDates.end);
        }
      } else {
        const { startDate, endDate } = getFinancialYearDates(year);
        setFromDate(startDate);
        setToDate(endDate);
      }
    }
  };

  function getFinancialYearDates(financialYear) {
    const [startYear, endYearSuffix] = financialYear.split("-").map(Number);
    const startDate = new Date(`${startYear}-04-01`);
    const endDate = new Date(`${startYear + 1}-03-31`);

    const quarters = [
      {
        start: new Date(`${startYear}-04-01`),
        end: new Date(`${startYear}-06-30`),
      },
      {
        start: new Date(`${startYear}-07-01`),
        end: new Date(`${startYear}-09-30`),
      },
      {
        start: new Date(`${startYear}-10-01`),
        end: new Date(`${startYear}-12-31`),
      },
      {
        start: new Date(`${startYear + 1}-01-01`),
        end: new Date(`${startYear + 1}-03-31`),
      },
    ];

    const formatToYYYYDDMM = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatToYYYYDDMM(startDate),
      endDate: formatToYYYYDDMM(endDate),
      quarters: quarters.map((q) => ({
        start: formatToYYYYDDMM(q.start),
        end: formatToYYYYDDMM(q.end),
      })),
    };
  }

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading h-auto content-center">
              Plan vs Utilization Report
            </h1>
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
                  <button
                    type="button"
                    onClick={() => setCenterDropdownOpen(!centerDropdownOpen)}
                    className="stdSelectField pl-3 text-left flex justify-between items-center"
                  >
                    {centerName === "all" ? "All" : centerName || "-- Select Center --"}
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {centerDropdownOpen && (
                    <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setCenterName("");
                          setCenter_id("");
                          setProgram("all");
                          setProgram_id("all");
                          setProject_id("all");
                          setActivityName_id("all");
                          setSubActivityName_id("all");
                          setCenterDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                      >
                        -- Select Center --
                      </div>
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
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
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
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                          {center.centerName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            <div className="">
              <label htmlFor="program" className="inputLabel">
                Program
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => setProgramDropdownOpen(!programDropdownOpen)}
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {program === "all" ? "All" : program || "-- Select Program --"}
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {programDropdownOpen && (
                  <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setProgram("");
                        setProgram_id("");
                        setProject_id("all");
                        setActivityName_id("all");
                        setSubActivityName_id("all");
                        setProgramDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                    >
                      -- Select Program --
                    </div>
                    <div
                      onClick={() => {
                        setProgram("all");
                        setProgram_id("all");
                        setProject_id("all");
                        setActivityName_id("all");
                        setSubActivityName_id("all");
                        setProgramDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      All
                    </div>
                    {programList?.map((p, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setProgram(p.fieldValue);
                          setProgram_id(p._id);
                          setProject_id("all");
                          setActivityName_id("all");
                          setSubActivityName_id("all");
                          getProjectList(p._id);
                          setProgramDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      >
                        {p.fieldValue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="">
              <label htmlFor="project" className="inputLabel">
                Project
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {project === "all" ? "All" : project || "-- Select Project --"}
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {projectDropdownOpen && (
                  <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setProject("");
                        setProject_id("");
                        setActivityName_id("all");
                        setSubActivityName_id("all");
                        setProjectDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                    >
                      -- Select Project --
                    </div>
                    <div
                      onClick={() => {
                        setProject("all");
                        setProject_id("all");
                        setActivityName_id("all");
                        setSubActivityName_id("all");
                        setProjectDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      All
                    </div>
                    {projectList?.map((p, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setProject(p.field2Value);
                          setProject_id(p.field2_id);
                          setActivityName_id("all");
                          setSubActivityName_id("all");
                          getActivityNameList(program_id, p.field2_id);
                          setProjectDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      >
                        {p.field2Value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="">
              <label htmlFor="activity" className="inputLabel">
                Activity
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => setActivityDropdownOpen(!activityDropdownOpen)}
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {activityName === "all" ? "All" : activityName || "-- Select Activity --"}
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {activityDropdownOpen && (
                  <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setActivityName("");
                        setActivityName_id("");
                        setSubActivityName_id("all");
                        setSubActivityName("all");
                        setActivityDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                    >
                      -- Select Activity --
                    </div>
                    <div
                      onClick={() => {
                        setActivityName("all");
                        setActivityName_id("all");
                        setSubActivityName_id("all");
                        setSubActivityName("all");
                        setActivityDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      All
                    </div>
                    {ActivityNameList?.map((activity, i) => (
                      <div
                        key={i}
                        onClick={() => handleActivityClick(activity.field3_id, activity.field3Value)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      >
                        {activity.field3Value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="">
              <label htmlFor="subActivity" className="inputLabel">
                Subactivity
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => setSubactivityDropdownOpen(!subactivityDropdownOpen)}
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {subactivityName === "all" ? "All" : subactivityName || "-- Select Subactivity --"}
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {subactivityDropdownOpen && (
                  <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setSubActivityName("");
                        setSubActivityName_id("");
                        setSubactivityDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                    >
                      -- Select Subactivity --
                    </div>
                    <div
                      onClick={() => {
                        setSubActivityName("all");
                        setSubActivityName_id("all");
                        setSubactivityDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      All
                    </div>
                    {SubActivityNameList?.map((sub, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSubActivityName(sub.inputValue);
                          setSubActivityName_id(sub._id);
                          setSubactivityDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      >
                        {sub.inputValue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="">
              <label htmlFor="year" className="inputLabel">
                Year
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {year === "all" ? "All" : year || "-- Select Year --"}
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {yearDropdownOpen && (
                  <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => handleYearChange("")}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                    >
                      -- Select Year --
                    </div>
                    <div
                      onClick={() => handleYearChange("all")}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      All
                    </div>
                    {getFinancialYears().map((fy) => (
                      <div
                        key={fy}
                        onClick={() => handleYearChange(fy)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      >
                        {fy}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="">
              <label htmlFor="quarter" className="inputLabel">
                Plan Quarter
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => setQuarterDropdownOpen(!quarterDropdownOpen)}
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {quarter === "all" ? "All" : quarter || "-- Select Quarter --"}
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {quarterDropdownOpen && (
                  <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => handleQuarterChange("")}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                    >
                      -- Select Quarter --
                    </div>
                    <div
                      onClick={() => handleQuarterChange("all")}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      All
                    </div>
                    {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                      <div
                        key={q}
                        onClick={() => handleQuarterChange(q)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      >
                        {q}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="">
              <label htmlFor="fromDate" className="inputLabel">
                Utilization From Date
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  type="date"
                  name="fromDate"
                  id="fromDate"
                  className="stdInputField  pl-3"
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
                Utilization To Date
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  type="date"
                  name="toDate"
                  id="toDate"
                  className="stdInputField  pl-3"
                  // max={moment().format("YYYY-MM-DD")}
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          <GenericReport
            tableObjects={tableObjects ? tableObjects : {}}
            twoLevelHeader={twoLevelHeader}
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
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
}

export default PlanVsUtilizationReport;

