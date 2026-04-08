// Nehas code
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
import dynamic from "next/dynamic";
import { MdOutlineDateRange } from "react-icons/md";
const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default),
  { ssr: false },
);
import "react-datepicker/dist/react-datepicker.css";

function ConvergenceReport() {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true }),
  );
  // console.log("userDetails  =>", userDetails);

  const [centerName, setCenterName] = useState("");
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

  const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [subactivityDropdownOpen, setSubactivityDropdownOpen] = useState(false);

  const closeAllDropdowns = () => {
    setCenterDropdownOpen(false);
    setProgramDropdownOpen(false);
    setProjectDropdownOpen(false);
    setActivityDropdownOpen(false);
    setSubactivityDropdownOpen(false);
  };

  const toggleDropdown = (e, setter, state) => {
    if (e && e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
    setCenterDropdownOpen(false);
    setProgramDropdownOpen(false);
    setProjectDropdownOpen(false);
    setActivityDropdownOpen(false);
    setSubactivityDropdownOpen(false);
    setter(!state);
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      closeAllDropdowns();
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  const [centerNameList, setCenterNameList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [ActivityNameList, setActivityNameList] = useState([]);
  const [SubActivityNameList, setSubActivityNameList] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [filterData, setFilterData] = useState([]);

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
        heading: "Physical Progress",
        mergedColoums: 3,
        hide: false,
      },
      {
        heading: "Convergence Details",
        mergedColoums: 2,
        hide: false,
      },
      {
        heading: "-",
        mergedColoums: 4,
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
    utilizationUnit: "Unit",
    totalUtilisedUnitCost: "Unit Cost",
    totalUtilisedQuantity: "Quantity",
    totalConvergence: "Convergence Amount (Rs.)",
    convergenceAgencyName: "Convergence Agency Name",
    totalNoOfHouseholds: "Impacted Households",
    totalNoOfBeneficiaries: "Reach (Beneficiaries)",
    convergenceNote: "Remarks",
    convergenceDocumentName: "Supporting Docs",
  };
  const tableObjects = {
    tableName: "",
    getListMethod: "post",
    center_ID: "all",
    apiURL: "/api/reports/post/convergence-report",
    titleMsg: "ConvergenceReport",
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
      fromDate: fromDate,
      toDate: toDate,
    };
    setFilterData(formValues);
    try {
      const response = await axios.post(
        "/api/reports/post/convergence-report",
        formValues,
      );
      if (response.data.success) {
        console.log("response.data", response);
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
      setCenterName("all");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
      setCenter_id(userDetails.center_id);
      setCenterName(userDetails.centerName || "");
    } else {
      setLoggedInRole("executive");
      setCenter_id("all");
      setCenterName("all");
    }

    const { startDate, endDate } = getCurrentFinancialYearRange();
    // console.log("startDate",startDate);
    // console.log("endDate",endDate);
    setFromDate(startDate);
    setToDate(endDate);

    getCenterNameList();
    getProgramList();
    getProjectList("all");
    getActivityNameList("all", "all");
    getSubActivities("all", "all", "all");
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
    if (program_id !== "" && program_id !== "all") {
      getProjectList(program_id);
    }
  }, [program_id]);

  useEffect(() => {
    if (
      program_id !== "" &&
      program_id !== "all" &&
      project_id !== "" &&
      project_id !== "all"
    ) {
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
            }),
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
            }),
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
          "/api/subactivity-mapping/get/list/" + program_id + "/" + project_id,
        )
        // .get("/api/activity/get")
        .then((response) => {
          const ActivityNameList = response.data;

          if (Array.isArray(ActivityNameList)) {
            setActivityNameList(
              ActivityNameList.sort((a, b) => {
                return a.field3Value.localeCompare(b.field3Value);
              }),
            );
          } else {
            console.error(
              "Expected data to be an array but got:",
              ActivityNameList,
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
            CenterNameList,
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
          activityName_id,
      );
      // .get("/api/subactivity/get/" + id);

      setSubActivityNameList(
        response.data.sort((a, b) => {
          return a.inputValue.localeCompare(b.inputValue);
        }),
      );
    } catch (error) {
      console.error("Error fetching subactivities:", error);
    }
  };

  const handleActivityClick = async (id, name) => {
    setActivityName(name);
    setActivityName_id(id);
    setActivityDropdownOpen(false);
    // Fetch subactivities for the selected activity
    await getSubActivities(program_id, project_id, id);
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

  return (
    <section className="section !p-0 md:!p-6 !shadow-none md:!shadow">
      {" "}
      <div className="border-none sm:border md:border-2 border-gray-100 !rounded-none md:!rounded-md !shadow-none md:!shadow-md">
        {" "}
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading h-auto content-center">
              Convergence Report
            </h1>
          </div>
        </div>
        <div className="px-4 md:px-10">
          {" "}
          <div className="mt-4 mb-0 lg:mb-5 w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-2 gap-2">
            {loggedInRole === "admin" || loggedInRole === "executive" ? (
              <div className="">
                <label htmlFor="centerName" className="inputLabel">
                  Center
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <button
                    type="button"
                    onClick={(e) =>
                      toggleDropdown(
                        e,
                        setCenterDropdownOpen,
                        centerDropdownOpen,
                      )
                    }
                    className="stdSelectField  pl-3 text-left flex justify-between items-center"
                  >
                    {centerName === "all"
                      ? "All"
                      : centerName || "-- Select Center --"}
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
                  {centerDropdownOpen && (
                    <div className="absolute z-40 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setCenterName("-- Select Center --");
                          setCenter_id("all");
                          setCenterDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      >
                        -- Select Center --
                      </div>
                      <div
                        onClick={() => {
                          setCenterName("all");
                          setCenter_id("all");
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
                  onClick={(e) =>
                    toggleDropdown(
                      e,
                      setProgramDropdownOpen,
                      programDropdownOpen,
                    )
                  }
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {program === "all"
                    ? "All"
                    : program || "-- Select Program --"}
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
                {programDropdownOpen && (
                  <div className="absolute z-40 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setProgram("-- Select Program --");
                        setProgram_id("all");
                        setProgramDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      -- Select Program --
                    </div>
                    <div
                      onClick={() => {
                        setProgram("all");
                        setProgram_id("all");
                        setProgramDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      All
                    </div>
                    {programList?.map((program, i) => {
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setProgram(program.fieldValue);
                            setProgram_id(program._id);
                            setProgramDropdownOpen(false);
                            getProjectList(program._id);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                          {program.fieldValue}
                        </div>
                      );
                    })}
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
                  onClick={(e) =>
                    toggleDropdown(
                      e,
                      setProjectDropdownOpen,
                      projectDropdownOpen,
                    )
                  }
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {project === "all"
                    ? "All"
                    : project || "-- Select Project --"}
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
                {projectDropdownOpen && (
                  <div className="absolute z-40 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setProject("-- Select Project --");
                        setProject_id("all");
                        setProjectDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      -- Select Project --
                    </div>
                    <div
                      onClick={() => {
                        setProject("all");
                        setProject_id("all");
                        setProjectDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      All
                    </div>
                    {projectList?.map((project, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setProject(project.field2Value);
                          setProject_id(project.field2_id);
                          setProjectDropdownOpen(false);
                          getActivityNameList(program_id, project.field2_id);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      >
                        {project.field2Value}
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
                  onClick={(e) =>
                    toggleDropdown(
                      e,
                      setActivityDropdownOpen,
                      activityDropdownOpen,
                    )
                  }
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {activityName === "all"
                    ? "All"
                    : activityName || "-- Select Activity --"}
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
                {activityDropdownOpen && (
                  <div className="absolute z-40 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setActivityName("-- Select Activity --");
                        setActivityName_id("all");
                        setActivityDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      -- Select Activity --
                    </div>
                    <div
                      onClick={() => {
                        setActivityName("all");
                        setActivityName_id("all");
                        setActivityDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                    >
                      All
                    </div>
                    {ActivityNameList?.map((activity, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          handleActivityClick(
                            activity.field3_id,
                            activity.field3Value,
                          )
                        }
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
                  onClick={(e) =>
                    toggleDropdown(
                      e,
                      setSubactivityDropdownOpen,
                      subactivityDropdownOpen,
                    )
                  }
                  className="stdSelectField pl-3 text-left flex justify-between items-center"
                >
                  {subactivityName === "all"
                    ? "All"
                    : subactivityName || "-- Select Subactivity --"}
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
                {subactivityDropdownOpen && (
                  <div className="absolute z-40 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
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
                    {SubActivityNameList?.map((subactivity, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSubActivityName(subactivity.inputValue);
                          setSubActivityName_id(subactivity._id);
                          setSubactivityDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                      >
                        {subactivity.inputValue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="">
              <label htmlFor="fromDate" className="inputLabel">
                From Date
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                    <MdOutlineDateRange className="icon" />
                  </span>
                </div>
                <input
                  type="date"
                  name="fromDate"
                  id="fromDate"
                  className={`stdDateField ${
                    fromDate && fromDate !== "all"
                      ? "text-black"
                      : "text-gray-400"
                  }`}
                  value={fromDate && fromDate !== "all" ? fromDate : ""}
                  onChange={(e) => {
                    setFromDate(e.target.value || "all");
                  }}
                />
              </div>
            </div>

            <div className="">
              <label htmlFor="toDate" className="inputLabel">
                To Date
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                    <MdOutlineDateRange className="icon" />
                  </span>
                </div>
                <input
                  type="date"
                  name="toDate"
                  id="toDate"
                  className={`stdDateField ${
                    toDate && toDate !== "all" ? "text-black" : "text-gray-400"
                  }`}
                  value={toDate && toDate !== "all" ? toDate : ""}
                  onChange={(e) => {
                    setToDate(e.target.value || "all");
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

export default ConvergenceReport;
