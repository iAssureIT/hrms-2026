"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import moment from "moment";
import GenericTable from "@/widgets/GenericTable/FilterTable";

function AnnualPlanList() {
  const [centerName, setCenterName] = useState("all");
  const [center_id, setCenter_id] = useState("all");
  const [year, setYear] = useState("all");
  const [quarter, setQuarter] = useState("all");
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
  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");

  const router = useRouter();

  const tableHeading = {
    centerName: "Center Name",
    quarter: "Quarter",
    year: "Year",
    program: "Program",
    project: "Project",
    activityName: "Activity Name",
    subactivityName: "Subactivity Name",
    unit: "Unit",
    quantity: "Quantity",
    unitCost: "Unit Cost",
    noOfHouseholds: "Impacted Households",
    noOfBeneficiaries: "Reach (Beneficiaries)",
    totalCost: "Total Cost",
    grant: "External Grant",
    CC: "CC",
    LHWRF: "LHWRF",
    convergence: "Convergence",
    actions: "Actions",
  };
  const tableObjects = {
    tableName: "",
    deleteMethod: "delete",
    getListMethod: "post",
    center_ID: "all",
    apiURL: "/api/annual-plans",
    editURL: "/annual-plan-management/annual-submission/",
    downloadApply: true,
    searchApply: true,
    showButton: true,
    buttonText: "Approval",
    buttonURL: "/admin/approval-management/approval-submission/aid_",
    formURL: "/admin/annual-plan-management/annual-submission",
    formText: "Add Plan",
    titleMsg: "Annual Plan Details",
  };

  // Add a new function to fetch filtered data
  const getData = async () => {
    var formValues = {
      searchText: searchText,
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
      center_ID: center_id,
      year: year,
      quarter: quarter,
      program_id: program_id,
      project_id: project_id,
      activityName_id: activityName_id,
      subactivityName_id: subactivityName_id,
    };
    setFilterData(formValues);
    console.log("formValues", formValues);
    console.log("searchText", searchText);
    try {
      const response = await axios.post(
        "/api/annual-plans/post/list",
        formValues
      );
      if (response.data.success) {
        console.log("response.data", response);
        setTotalRecs(response.data.totalRecs);
        setTableData(response.data.tableData);
      } else {
        Swal.fire("Error", response.data.errorMsg, "error");
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, [
    center_id,
    year,
    quarter,
    program_id,
    project_id,
    activityName_id,
    subactivityName_id,
    pageNumber,
    recsPerPage,
    runCount,
    searchText,
  ]);

  useEffect(() => {
    getCenterNameList();
    getProgramList();
    getProjectList();
    getActivityNameList();
  }, []);

  const getProgramList = () => {
    axios
      .get("/api/programs/get")
      .then((response) => {
        const ProgramList = response.data;

        if (Array.isArray(ProgramList)) {
          console.log("Setting ProgramList:", ProgramList);
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

  const getProjectList = () => {
    axios
      .get("/api/projects/get")
      .then((response) => {
        console.log("REsponsedata", response.data);
        const ProjectList = response.data;

        if (Array.isArray(ProjectList)) {
          console.log("Setting ProjectList:", ProjectList);
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

  const getActivityNameList = () => {
    axios
      .get("/api/activity/get")
      .then((response) => {
        const ActivityNameList = response.data;

        if (Array.isArray(ActivityNameList)) {
          console.log("Setting ActivityNameList:", ActivityNameList);
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
  };

  const getCenterNameList = () => {
    axios
      .get("/api/centers/list")
      .then((response) => {
        const CenterNameList = response.data;

        if (Array.isArray(CenterNameList)) {
          console.log("Setting CenterNameList:", CenterNameList);
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

  const fetchSubActivities = async (id) => {
    console.log("fetchSubActivity id", id);
    console.log("fetchSubActivity called");
    try {
      const response = await axios.get("/api/subactivity/get/" + id);
      console.log("response.data", response.data);
      console.log("response.data type", typeof response.data);
      setSubActivityNameList(response.data.subactivities);
    } catch (error) {
      console.error("Error fetching subactivities:", error);
    }
  };

  const handleActivityChange = async (e) => {
    const [activityName_id, activityName] = e.target.value.split("|");
    setActivityName(activityName);
    setActivityName_id(activityName_id);

    // Fetch subactivities for the selected activity
    await fetchSubActivities(activityName_id);
  };

  const getFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 2; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }
    return years;
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 lg:flex lg:justify-between">
            <h1 className="heading h-auto content-center">Annual Plan List</h1>
            <div className="my-2 px-5 lg:px-0 lg:me-10">
              <button
                className="formButtons"
                onClick={() => {
                  window.open(
                    "/admin/annual-plan-management/annual-submission",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}

              >
                {tableObjects.formText}
              </button>
            </div>
          </div>
        </div>
        <div className="px-10 py-6">
          <div className="mt-5 mb-5 flex lg:flex-row md:flex-col flex-col">
            <div className="flex-1 lg:me-4">
              <label htmlFor="centerName" className="inputLabel">
                Center
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="centerName"
                  id="centerName"
                  className="stdSelectField pl-3"
                  value={center_id ? `${center_id}|${centerName}` : ""}
                  onChange={(e) => {
                    const [center_id, centerName] = e.target.value.split("|");
                    setCenterName(centerName);
                    setCenter_id(center_id);
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
            <div className="flex-1 lg:me-4">
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
                    console.log(program_id);
                    setProgram(program);
                    setProgram_id(program_id);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Program --
                  </option>
                  <option value="all">All</option>
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
            <div className="flex-1 lg:me-4">
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
                    console.log(project);
                    setProject(project);
                    setProject_id(project_id);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Project --
                  </option>
                  <option value="all">All</option>
                  {projectList?.map((project, i) => (
                    <option
                      className="text-black"
                      key={i}
                      value={`${project._id}|${project.fieldValue}`}
                    >
                      {project.fieldValue}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 lg:me-2">
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
                  <option value="all">All</option>
                  {ActivityNameList?.map((activity, i) => (
                    <option
                      className="text-black"
                      key={i}
                      value={`${activity._id}|${activity.fieldValue}`}
                    >
                      {activity.fieldValue}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 lg:ms-2 lg:me-2">
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
                    console.log(subactivityName_id);
                    setSubActivityName(subactivityName);
                    setSubActivityName_id(subactivityName_id);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Subactivity --
                  </option>
                  <option value="all">All</option>
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
            <div className="flex-1 lg:me-2 lg:ms-2">
              <label htmlFor="centerName" className="inputLabel">
                Year
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="centerName"
                  id="centerName"
                  className="stdSelectField pl-3"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Year --
                  </option>
                  <option value="all">All</option>
                  {getFinancialYears().map((financialYear) => (
                    <option
                      key={financialYear}
                      value={financialYear}
                      className="text-black"
                    >
                      {financialYear}
                    </option>
                  ))}
                  {/* <option value="2024-25" className="text-black">
                    2024-25
                  </option>
                  <option value="2023-24" className="text-black">
                    2023-24
                  </option>
                  <option value="2022-23" className="text-black">
                    2022-23
                  </option>
                  <option value="2021-22" className="text-black">
                    2021-22
                  </option>
                  <option value="2020-21" className="text-black">
                    2020-21
                  </option> */}
                </select>
              </div>
            </div>
            <div className="flex-1 lg:me-2 lg:ms-2">
              <label htmlFor="centerName" className="inputLabel">
                Quarter
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="centerName"
                  id="centerName"
                  className="stdSelectField pl-3"
                  value={quarter}
                  onChange={(e) => {
                    setQuarter(e.target.value);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Quarter --
                  </option>

                  <option value="all" selected className="text-black">
                    All
                  </option>
                  <option value="Q1" className="text-black">
                    Q1
                  </option>
                  <option value="Q2" className="text-black">
                    Q2
                  </option>
                  <option value="Q3" className="text-black">
                    Q3
                  </option>
                  <option value="Q4" className="text-black">
                    Q4
                  </option>
                </select>
              </div>
            </div>
          </div>
          {/* <div className="mt-5 mb-5 flex lg:flex-row md:flex-col flex-col">
            <div className="lg:w-1/4">
              <div className="flex-1 lg:me-2">
                <label htmlFor="subActivity" className="inputLabel">
                  Subactivity
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <select
                    name="subActivity"
                    id="subActivity"
                    className="stdSelectField"
                    value={
                      subactivityName_id
                        ? `${subactivityName_id}|${subactivityName}`
                        : ""
                    }
                    onChange={(e) => {
                      const [subactivityName_id, subactivityName] =
                        e.target.value.split("|");
                      console.log(subactivityName_id);
                      setSubActivityName(subactivityName);
                      setSubActivityName_id(subactivityName_id);
                    }}
                  >
                    <option value="" disabled className="text-gray-400">
                      -- Select Subactivity --
                    </option>
                    <option value="all">All</option>
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
            </div>
            <div className="lg:w-1/4">
              <div className="flex-1 lg:me-2 lg:ms-2">
                <label htmlFor="centerName" className="inputLabel">
                  Year
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <select
                    name="centerName"
                    id="centerName"
                    className="stdSelectField"
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                    }}
                  >
                    <option value="" disabled className="text-gray-400">
                      -- Select Year --
                    </option>
                    <option value="all">All</option>
                    {getFinancialYears().map((financialYear) => (
                      <option
                        key={financialYear}
                        value={financialYear}
                        className="text-black"
                      >
                        {financialYear}
                      </option>
                    ))} */}
          {/* <option value="2024-25" className="text-black">
                    2024-25
                  </option>
                  <option value="2023-24" className="text-black">
                    2023-24
                  </option>
                  <option value="2022-23" className="text-black">
                    2022-23
                  </option>
                  <option value="2021-22" className="text-black">
                    2021-22
                  </option>
                  <option value="2020-21" className="text-black">
                    2020-21
                  </option> */}
          {/* </select>
                </div>
              </div>
            </div>
            <div className="lg:w-1/4">
              <div className="flex-1 lg:me-2 lg:ms-2">
                <label htmlFor="centerName" className="inputLabel">
                  Quarter
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <select
                    name="centerName"
                    id="centerName"
                    className="stdSelectField"
                    value={quarter}
                    onChange={(e) => {
                      setQuarter(e.target.value);
                    }}
                  >
                    <option value="" disabled className="text-gray-400">
                      -- Select Quarter --
                    </option>

                    <option value="all" selected className="text-black">
                      All
                    </option>
                    <option value="Q1" className="text-black">
                      Q1
                    </option>
                    <option value="Q2" className="text-black">
                      Q2
                    </option>
                    <option value="Q3" className="text-black">
                      Q3
                    </option>
                    <option value="Q4" className="text-black">
                      Q4
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div> */}

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
          />
        </div>
      </div>
    </section>
  );
}

export default AnnualPlanList;
