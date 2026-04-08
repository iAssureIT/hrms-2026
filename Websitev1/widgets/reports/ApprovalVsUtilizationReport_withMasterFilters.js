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

function AppVsUtilizationReport() {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true }),
  );
  // console.log("userDetails  =>", userDetails);

  const [centerName, setCenterName] = useState("all");
  const [center_id, setCenter_id] = useState("all");
  const [fromDate, setFromDate] = useState("all");
  const [toDate, setToDate] = useState("all");
  const [program_id, setProgram_id] = useState("");
  const [program, setProgram] = useState("");
  const [project_id, setProject_id] = useState("");
  const [project, setProject] = useState("");
  const [activityName_id, setActivityName_id] = useState("");
  const [activityName, setActivityName] = useState("");
  const [subactivityName_id, setSubActivityName_id] = useState("");
  const [subactivityName, setSubActivityName] = useState("");
  const [centerNameList, setCenterNameList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [ActivityNameList, setActivityNameList] = useState([]);
  const [SubActivityNameList, setSubActivityNameList] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);

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
        heading: "Center",
        mergedColoums: 3,
        hide: true,
      },
      {
        heading: "Approval wise Sanction Cost",
        mergedColoums: 5,
        hide: false,
      },
      {
        heading: "Utilization",
        mergedColoums: 4,
        hide: false,
      },
      {
        heading: "-",
        mergedColoums: 1,
        hide: true,
      },
    ],
  };

  const getCurrentDate = () => {
    return moment().format("YYYY-MM-DD");
  };

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

    // console.log(moment());
    const currentDate = getCurrentDate();
    setFromDate(currentDate);
    setToDate(currentDate);
  }, []);

  const tableHeading = {
    centerName: "Center",
    approvalNo: "Approval Number",
    totalApprovalAmount: "Total Approval Amount",
    approvalLHWRF: "Approval LHWRF",
    approvalCC: "Approval Community Contribution",
    approvalExtGrant: "Approval External Grant",
    utilApprovalNo: "Approval No",
    totalUtilisedAmount: "Total",
    totalUtilisedLHWRF: "LHWRF",
    totalUtilisedCC: "Community Contribution",
    totalUtilisedExtGrant: "External Grant",
    balanceAmount: "Balance",
  };
  const tableObjects = {
    tableName: "",
    getListMethod: "post",
    center_ID: "all",
    apiURL: "/api/reports",
    searchApply: true,
    downloadApply: true,
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
      fromDate: fromDate,
      toDate: toDate,
    };
    setFilterData(formValues);
    try {
      const response = await axios.post(
        "/api/reports/post/approval-vs-utilization-report",
        formValues,
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
    fromDate,
    toDate,
    pageNumber,
    recsPerPage,
    runCount,
    searchText,
  ]);

  useEffect(() => {
    getCenterNameList();
    getProgramList();
    getActivityNameList();
  }, []);

  useEffect(() => {
    if (program_id) {
      getProjectList(program_id);
    }
  }, [program_id]);

  useEffect(() => {
    if (program_id && project_id) {
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
          // console.log("Setting ProjectList:", ProjectList);
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
            // console.log("Setting ActivityNameList:", ActivityNameList);
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
          // console.log("Setting CenterNameList:", CenterNameList);
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
  const handleActivityChange = async (e) => {
    const [activityName_id, activityName] = e.target.value.split("|");
    setActivityName(activityName);
    setActivityName_id(activityName_id);
    setSubActivityName_id("");
    // Fetch subactivities for the selected activity
    await getSubActivities(program_id, project_id, activityName_id);
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading h-auto content-center">
              Approval vs Utilization Report
            </h1>
          </div>
        </div>

        <div className="px-10">
          <div className="mt-4 mb-0 lg:mb-5 w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-2 gap-4">
            {loggedInRole === "admin" || loggedInRole === "executive" ? (
              <div className="">
                <label htmlFor="centerName" className="inputLabel">
                  Center
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <select
                    name="centerName"
                    id="centerName"
                    className="stdSelectField  pl-3"
                    value={center_id ? `${center_id}|${centerName}` : ""}
                    onChange={(e) => {
                      const [center_id, centerName] = e.target.value.split("|");
                      setCenterName(centerName);
                      setCenter_id(center_id);
                      setProgram("");
                      setProgram_id("");
                      setProject_id("");
                      setActivityName_id("");
                      setSubActivityName_id("");
                    }}
                  >
                    <option value="" disabled className="text-gray-400">
                      -- Select Center --
                    </option>
                    <option value="all">All</option>
                    {centerNameList?.map((center, i) => (
                      <option
                        className="text-black"
                        key={i}
                        value={`${center._id}|${center.centerName}`}
                      >
                        {center.centerName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}
            <div className="">
              <label htmlFor="program" className="inputLabel">
                Program
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="program"
                  id="program"
                  className="stdSelectField pl-3"
                  value={program_id ? `${program_id}|${program}` : ""}
                  onChange={(e) => {
                    const [program_id, program] = e.target.value.split("|");

                    setProgram(program);
                    setProgram_id(program_id);
                    setProject_id("");
                    setActivityName_id("");
                    setSubActivityName_id("");
                    getProjectList(program_id);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Program --
                  </option>
                  {/* <option value="all">All</option> */}
                  {programList?.map((program, i) => {
                    return (
                      <option
                        className="text-black"
                        key={i}
                        value={`${program._id}|${program.fieldValue}`}
                      >
                        {program.fieldValue}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="">
              <label htmlFor="project" className="inputLabel">
                Project
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="project"
                  id="project"
                  className="stdSelectField pl-3"
                  value={project_id ? `${project_id}|${project}` : ""}
                  onChange={(e) => {
                    const [project_id, project] = e.target.value.split("|");

                    setProject(project);
                    setProject_id(project_id);
                    setActivityName_id("");
                    setSubActivityName_id("");
                    getActivityNameList(program_id, project_id);
                  }}
                >
                  <option value="" selected disabled className="text-gray-400">
                    -- Select Project --
                  </option>
                  {/* <option value="all">All</option> */}
                  {projectList?.map((project, i) => (
                    <option
                      className="text-black"
                      key={i}
                      value={`${project.field2_id}|${project.field2Value}`}
                    >
                      {project.field2Value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="">
              <label htmlFor="activity" className="inputLabel">
                Activity
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="activity"
                  id="activity"
                  className="stdSelectField pl-3"
                  value={
                    activityName_id ? `${activityName_id}|${activityName}` : ""
                  }
                  onChange={handleActivityChange}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Activity --
                  </option>
                  {/* <option value="all">All</option> */}
                  {ActivityNameList?.map((activity, i) => (
                    <option
                      className="text-black"
                      key={i}
                      value={`${activity.field3_id}|${activity.field3Value}`}
                    >
                      {activity.field3Value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="">
              <label htmlFor="subActivity" className="inputLabel">
                Subactivity
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="subActivity"
                  id="subActivity"
                  className="stdSelectField pl-3"
                  value={
                    subactivityName_id
                      ? `${subactivityName_id}|${subactivityName}`
                      : ""
                  }
                  onChange={(e) => {
                    const [subactivityName_id, subactivityName] =
                      e.target.value.split("|");

                    setSubActivityName(subactivityName);
                    setSubActivityName_id(subactivityName_id);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Subactivity --
                  </option>
                  {/* <option value="all">All</option> */}
                  {SubActivityNameList?.map((subactivity, i) => (
                    <option
                      className="text-black"
                      key={i}
                      value={`${subactivity._id}|${subactivity.inputValue}`}
                    >
                      {subactivity.inputValue}
                    </option>
                  ))}
                </select>
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
                  className="stdInputField  pl-3"
                  // // max={moment().format("YYYY-MM-DD")}
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
                  className="stdInputField  pl-3"
                  // // max={moment().format("YYYY-MM-DD")}
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

export default AppVsUtilizationReport;
