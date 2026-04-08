"use client";

import React from "react";
import axios from "axios";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { GrMapLocation } from "react-icons/gr";
import { LiaCubesSolid } from "react-icons/lia";
import { MdAccessTime, MdOutlineHouse } from "react-icons/md";
import { PiUsersThreeBold } from "react-icons/pi";
import { GoProjectRoadmap } from "react-icons/go";
import { MdPeopleOutline } from "react-icons/md";
import { MdCurrencyRupee } from "react-icons/md";
import { PiUsersFourBold } from "react-icons/pi";
import { FaSpinner } from "react-icons/fa6";
import ComparisonChart1 from "@/widgets/dashboardManagement/ComparisonChart1";
import ComparisonChart2 from "@/widgets/dashboardManagement/ComparisonChart2";
import GenericTable from "@/widgets/GenericTable/DashboardTable";

import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
import { BsClipboard2Data } from "react-icons/bs";

const Dashboard = (props) => {
  const pathname = usePathname();
  const router = useRouter();
  // const userDetails = ls.get('userDetails', {decrypt: true});

  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setUserDetails(details);
  }, []);
  const [loggedInRole, setLoggedInRole] = useState("");
  const [centerName, setCenterName] = useState("");
  const [center_id, setCenter_id] = useState("");
  const [year, setYear] = useState("");
  const [YearList, setYearList] = useState([]);
  const [dashboardData, setDashboardData] = useState({});

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dataType, setDataType] = useState("cumulative");

  const [centersCount, setCentersCount] = useState(0);
  const [totalDistrict, setTotalDistrict] = useState(0);
  const [totalBlock, setTotalBlock] = useState(0);
  const [totalVillage, setTotalVillage] = useState(0);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [totalFamilies, setTotalFamilies] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalEmp, setTotalEmp] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(true);
  const [loading4, setLoading4] = useState(false);
  const [loading5, setLoading5] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRecs, setTotalRecs] = useState("-");
  const [centerwisePlanvsUtil, setCenterwisePlanvsUtil] = useState({});
  const [centerwiseApprovalvsUtil, setCenterwiseApprovalvsUtil] = useState([]);

  const [filterData_1, setFilterData_1] = useState([]);
  const [tableData_1, setTableData_1] = useState([]);

  const tableHeading = {
    centerName: "Center",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    approvalNo: "Approval Number",
    approvalUnit: "Unit",
    approvalQuantity: "Quantity",
    totalApprovalAmount: "Total Approval Amount",
    approvalLHWRF: "LHWRF",
    approvalCC: "Community Contribution",
    approvalExtGrant: "External Grant",
    approvalConvergence: "Convergence",
    approvalNoOfHouseholds: "Impacted Households",
    approvalNoOfBeneficiaries: "Reach (Beneficiaries)",
    totalUtilisedQuantity: "Quantity",
    totalUtilisedAmount: "Total Utilized Cost",
    totalUtilisedLHWRF: "LHWRF",
    totalUtilisedCC: "Community Contribution",
    totalUtilisedExtGrant: "External Grant",
    totalConvergence: "Convergence",
    totalNoOfHouseholds: "Impacted Households",
    totalNoOfBeneficiaries: "Reach (Beneficiaries)",
    percentageUtilizedAgainstApproval: "Percentage Utilized",
    balanceAmount: "Balance Cost",
  };
  const tableObjects = {
    tableName: "",
    getListMethod: "post",
    center_ID: "all",
    apiURL: "/api/dashboard",
    searchApply: false,
    downloadApply: false,
    paginationApply: false,
    NoSrNumber: true,
  };
  const tableHeading_1 = {
    centerName: "Center",
    program: "Program",
    project: "Project",
    activityName: "Activity",
    subactivityName: "Subactivity",
    plannedUnit: "Unit",
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

    // const currentYear = getCurrentYear();
    // getFinancialYears().map((financialYear, index) => {
    //   if (financialYear.includes(currentYear)) {
    //     setYear(financialYear);
    //   }
    // });
  }, []);

  useEffect(() => {
    const currentFinancialYear = getCurrentFinancialYear();
    setYear(currentFinancialYear);
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
  // useEffect(() => {
  //   getPlanVsUtilizationData();
  //   getApprovalVsUtilizationData();
  // }, [center_id, year, pageNumber, recsPerPage, runCount]);

  useEffect(() => {
    if (center_id && year) {
      getPlanVsUtilizationData();
      getApprovalVsUtilizationData();
      getCenterwiseApprovalVsUtilizationData();
      getCenterwisePlanVsUtilizationData();
    }
  }, [center_id, year]);

  useEffect(() => {
    getDashboardData();
  }, [center_id, year, dataType]);

  const getPlanVsUtilizationData = async () => {
    var formValues = {
      searchText: "-",
      recsPerPage: 2,
      pageNumber: pageNumber,
      center_ID: center_id,
      program_id: "all",
      project_id: "all",
      activityName_id: "all",
      subactivityName_id: "all",
      year: year,
      fromDate: fromDate,
      toDate: toDate,
    };
    setFilterData_1(formValues);
    try {
      const response = await axios.post(
        "/api/reports/post/plan-vs-utilization-report",
        // "/api/dashboard/post/dashboard-plan-vs-utilization-report",
        formValues
      );
      console.log("response getPlanVsUtilizationData", response);
      if (response.data.success) {
        setTotalRecs(response.data.totalRecs);
        setTableData_1(
          response.data.tableData.length > 0 ? response.data.tableData : []
        );
      } else {
        console.log(response.data.errorMsg);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading3(false);
    }
  };
  const getApprovalVsUtilizationData = async () => {
    var formValues = {
      searchText: "-",
      recsPerPage: 2,
      pageNumber: pageNumber,
      center_ID: center_id,
      program_id: "all",
      project_id: "all",
      activityName_id: "all",
      subactivityName_id: "all",
      year: year,
      fromDate: fromDate,
      toDate: toDate,
    };
    setFilterData(formValues);
    try {
      const response = await axios.post(
        "/api/reports/post/approval-vs-utilization-report",
        formValues
      );
      //   const response = await axios.post(
      //     "/api/dashboard/post/dashboard-approval-vs-utilization-report",
      //     formValues
      //   );
      console.log("response getApprovalVsUtilizationData.", response);
      if (response.data.success) {
        setTotalRecs(response.data.totalRecs);
        setTableData(
          response.data.tableData.length > 0 ? response.data.tableData : []
        );
      } else {
        console.log(response.data.errorMsg);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading3(false);
    }
  };
  const getCenterwisePlanVsUtilizationData = async () => {
    var formValues = {
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
      center_ID: "all",
      year: year,
      removePagination: false,
      fromDate: fromDate,
      toDate: toDate,
    };
    setFilterData_1(formValues);
    try {
      const response = await axios.post(
        "/api/dashboard/post/centerwise-plan-vs-utilization-report",
        formValues
      );
      // console.log("response.data getCenterwisePlanVsUtilizationData", response);
      if (response.data.success) {
        var centerwisePlanvsUtil = response.data.tableData;
        const centerArray = [];
        const planAmountArray = [];
        const utilisationAmountArray = [];
        const utilisationLabelArray = [];

        centerwisePlanvsUtil.forEach((entry) => {
          centerArray.push(entry.centerName);

          // Store raw planned % if needed
          planAmountArray.push({
            y: Number(entry.plannedPercentage.toFixed(2)),
            plannedAmount: `₹${entry.plannedAmount}`,
          });
          utilisationAmountArray.push(entry.utilizedPercentage.toFixed(2));

          // Store utilized % and metadata for tooltip
          utilisationLabelArray.push({
            y: Number(entry.utilizedPercentage.toFixed(2)),
            plannedAmount: Number(entry.plannedAmount),
            utilizedAmount: Number(entry.totalUtilisedAmount),
          });
        });

        var centerwisePlanvsUtilData = {};
        centerwisePlanvsUtilData.centerArray = centerArray;
        centerwisePlanvsUtilData.planAmountArray = planAmountArray;
        centerwisePlanvsUtilData.utilisationAmountArray =
          utilisationAmountArray;
        centerwisePlanvsUtilData.utilisationLabelArray = utilisationLabelArray;
        setCenterwisePlanvsUtil(centerwisePlanvsUtilData);
        // console.log("centerwisePlanvsUtilData", centerwisePlanvsUtilData);
        console.log("centerwisePlanvsUtilData", centerwisePlanvsUtil);
      } else {
        // console.log(response.data.errorMsg);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading3(false);
    }
  };
  const getCenterwiseApprovalVsUtilizationData = async () => {
    var formValues = {
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
      center_ID: "all",
      year: year,
      removePagination: false,
      fromDate: fromDate,
      toDate: toDate,
    };
    setFilterData(formValues);
    try {
      const response = await axios.post(
        "/api/dashboard/post/centerwise-approval-vs-utilization-report",
        formValues
      );
      // console.log("response.getCenterwiseApprovalVsUtilizationData", response);
      if (response.data.success) {
        var centerwiseApprovalvsUtil = response.data.tableData;
        const centerArray = [];
        const approvalAmountArray = [];
        const utilisationAmountArray = [];
        const utilisationLabelArray = [];

        // console.log("centerwiseApprovalvsUtil====1====",centerwiseApprovalvsUtil)
        // Populate the arrays
        centerwiseApprovalvsUtil.forEach((item) => {
          // console.log("item=====2===",item)
          centerArray.push(item.centerName);
          // approvalAmountArray.push(item.totalApprovalAmount);
          approvalAmountArray.push(item.approvedPercentage.toFixed(2));
          // utilisationAmountArray.push(item.totalUtilisedAmount);
          utilisationAmountArray.push(item.utilizedPercentage.toFixed(2));

          utilisationLabelArray.push({
            y: Number(item.utilizedPercentage.toFixed(2)),
            approvalAmount: Number(item.totalApprovalAmount),
            utilizedAmount: Number(item.totalUtilisedAmount),
          });
        });
        console.log(
          "centerwiseApprovalvsUtil=====2===",
          centerwiseApprovalvsUtil
        );

        var centerwiseApprovalvsUtilData = {};
        centerwiseApprovalvsUtilData.centerArray = centerArray;
        centerwiseApprovalvsUtilData.approvalAmountArray = approvalAmountArray;
        centerwiseApprovalvsUtilData.utilisationAmountArray =
          utilisationAmountArray;
        centerwiseApprovalvsUtilData.utilisationLabelArray =
          utilisationLabelArray;
        setCenterwiseApprovalvsUtil(centerwiseApprovalvsUtilData);

        // console.log("centerwiseApprovalvsUtilData========",centerwiseApprovalvsUtilData)
      } else {
        console.log(response.data.errorMsg);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading3(false);
    }
  };

  const getDashboardData = () => {
    if (center_id && year) {
      axios
        .get(
          "/api/dashboard/get/dashboardData/" +
            center_id +
            "/" +
            year +
            "/" +
            dataType
        )
        .then((res) => {
          console.log("Response dashboard", res.data);
          setDashboardData(res.data);
        })
        .catch((err) => {
          console.log(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    // getMobileDashboardData();
  }, [center_id]);

  const getMobileDashboardData = () => {
    axios
      .get("/api/dashboard/get/mobile-dashboard-data/" + center_id)
      .then((response) => {
        console.log("mobile dashboard response", response);
      });
  };

  // console.log(dashboardData);

  // useEffect(() => {
  //   if (dashboardData !== null) {
  //     setLoading(false);
  //   }
  // }, []);

  const getCurrentFinancialYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const isBeforeApril = today < new Date(currentYear, 3, 1); // Before April 1st
    const startYear = isBeforeApril ? currentYear - 1 : currentYear;
    const endYear = startYear + 1;
    return `${startYear}-${endYear.toString().slice(-2)}`;
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
    <section className="section">
      <div className="box border-2 -md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Dashboard</h1>
          </div>
          <div className="px-10 py-6">
            <div className="bg-white text-secondary">
              <div className="grid grid-cols-1 w-full lg:grid-cols-5 gap-3 lg:gap-6">
                <div className="justify-center h-20  content-center   shadow-[rgba(0,_0,_0,_0.24)_2px_2px_8px] bg-white">
                  <div className="grid w-full grid-cols-1 font-normal text-black">
                    <div className="flex">
                      <div className="w-2/5 h-auto  flex justify-center items-center">
                        <div className="bg-[#4090FF]  h-20 w-full flex justify-center items-center">
                          <HiOutlineBuildingOffice2
                            size={40}
                            className="text-white"
                          />
                        </div>
                      </div>
                      <div className="text-[13px] mx-auto my-auto">
                        <div>
                          <span className="flex font-semibold pb-2">
                            {loggedInRole === "admin" ||
                            loggedInRole === "executive"
                              ? "Centers"
                              : "CenterName"}
                          </span>
                        </div>
                        <div className="font-bold text-center text-[20px] text-black">
                          {loggedInRole === "admin" ||
                          loggedInRole === "executive" ? (
                            dashboardData && dashboardData.totalCenters ? (
                              dashboardData.totalCenters
                            ) : loading ? (
                              <FaSpinner className="animate-spin inline-flex mx-2 text-green" />
                            ) : (
                              0
                            )
                          ) : null}
                          {loggedInRole === "center" ? (
                            userDetails?.centerName ? (
                              userDetails?.centerName
                            ) : loading ? (
                              <FaSpinner className="animate-spin inline-flex mx-2 text-green" />
                            ) : (
                              "-NA-"
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="justify-center h-20  content-center   shadow-[rgba(0,_0,_0,_0.24)_2px_2px_8px] bg-white">
                  <div className="grid w-full grid-cols-1 font-normal text-black">
                    <div className="flex">
                      <div className="w-2/5 h-auto  flex justify-center items-center">
                        <div className="bg-[#2ECFAD]  h-20 w-full flex justify-center items-center">
                          <GrMapLocation size={40} className="text-white" />
                        </div>
                      </div>
                      <div className="text-[13px] mx-auto my-auto">
                        <div>
                          <span className="flex font-semibold pb-2">
                            Districts
                          </span>
                        </div>
                        <div className="font-bold text-center text-[20px]">
                          {dashboardData && dashboardData.totalDistricts ? (
                            dashboardData.totalDistricts
                          ) : loading ? (
                            <FaSpinner className="animate-spin inline-flex mx-2 text-green" />
                          ) : (
                            0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="justify-center h-20  content-center   shadow-[rgba(0,_0,_0,_0.24)_2px_2px_8px] bg-white">
                  <div className="grid w-full grid-cols-1 font-normal text-black">
                    <div className="flex">
                      <div className="w-2/5 h-auto  flex justify-center items-center">
                        <div className="bg-[#FF5370]  h-20 w-full flex justify-center items-center">
                          <LiaCubesSolid size={40} className="text-white" />
                        </div>
                      </div>
                      <div className="text-[13px] mx-auto my-auto">
                        <div>
                          <span className="flex font-semibold pb-2">
                            Blocks
                          </span>
                        </div>
                        <div className="font-bold text-center text-[20px]">
                          {dashboardData && dashboardData.totalBlocks ? (
                            dashboardData.totalBlocks
                          ) : loading ? (
                            <FaSpinner className="animate-spin inline-flex mx-2 text-green" />
                          ) : (
                            0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="justify-center h-20  content-center   shadow-[rgba(0,_0,_0,_0.24)_2px_2px_8px] bg-white">
                  <div className="grid w-full grid-cols-1 font-normal text-black">
                    <div className="flex">
                      <div className="w-2/5 h-auto  flex justify-center items-center">
                        <div className="bg-[#FF9D4F]  h-20 w-full flex justify-center items-center">
                          <MdOutlineHouse size={40} className="text-white" />
                        </div>
                      </div>
                      <div className="text-[13px] mx-auto my-auto">
                        <div>
                          <span className="flex font-semibold pb-2">
                            Villages
                          </span>
                        </div>
                        <div className="font-bold text-center text-[20px]">
                          {dashboardData && dashboardData.totalVillages ? (
                            dashboardData.totalVillages
                          ) : loading ? (
                            <FaSpinner className="animate-spin inline-flex mx-2 text-green" />
                          ) : (
                            0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="justify-center h-20  content-center   shadow-[rgba(0,_0,_0,_0.24)_2px_2px_8px] bg-white">
                  <div className="grid w-full grid-cols-1 font-normal text-black">
                    <div className="flex">
                      <div className="w-2/5 h-auto  flex justify-center items-center">
                        <div className="bg-[#5da5da]  h-20 w-full flex justify-center items-center">
                          <PiUsersFourBold size={40} className="text-white" />
                        </div>
                      </div>
                      <div className="text-[13px] mx-auto my-auto">
                        <div>
                          <span className="flex font-semibold pb-2 leading-4">
                            Total <br /> Employees
                          </span>
                        </div>
                        <div className="font-bold text-center text-[20px]">
                          {dashboardData && dashboardData.totalEmpSum ? (
                            dashboardData.totalEmpSum
                          ) : loading ? (
                            <FaSpinner className="animate-spin inline-flex mx-2  text-green" />
                          ) : (
                            0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="text-[16px] font-bold flex mt-5 justify-center gap-1">
                <div className="h-2 w-2 bg-Green rounded-full my-2"></div>
                Current Year Data{" "}
                <div className="h-2 w-2 bg-Green rounded-full my-2"></div>
              </div> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full mt-10 gap-4 lg:gap-6">
                {/* Reusable Card Component */}
                <div className="flex h-24 bg-white shadow-[rgba(0,_0,_0,_0.24)_2px_2px_8px]">
                  <div className="w-2/5 flex justify-center items-center bg-[#f15854]">
                    <BsClipboard2Data size={36} className="text-white" />
                  </div>
                  <div className="w-3/5 flex flex-col justify-center px-3 text-[13px]">
                    <span className="font-semibold mb-1">Select Duration</span>
                    <select
                      name="dataType"
                      id="dataType"
                      className={`stdSelectField font-normal pl-2 py-1.5 w-full rounded-md border border-gray-300 text-sm ${
                        dataType ? "text-black" : "text-gray-400"
                      }`}
                      value={dataType}
                      onChange={(e) => setDataType(e.target.value)}
                    >
                      <option value="" disabled>
                        Select Duration
                      </option>
                      <option value="cumulative">Cumulative</option>
                      <option value="priorToFinancialYear">
                        Prior to {year}
                      </option>
                      <option value="current">Current ({year})</option>
                    </select>
                  </div>
                </div>

                {/* Beneficiaries Card */}
                <div className="flex h-24 bg-white shadow-[rgba(0,_0,_0,_0.24)_2px_2px_8px]">
                  <div className="w-2/5 flex justify-center items-center bg-[#f15854]">
                    <PiUsersThreeBold size={36} className="text-white" />
                  </div>
                  <div className="w-3/5 flex flex-col justify-center px-3 text-[13px]">
                    <span className="font-semibold mb-1">Reach (Beneficiaries)</span>
                    <div className="font-bold text-[20px] text-center">
                      {dashboardData?.totalBeneficiaries ??
                        (loading ? (
                          <FaSpinner className="animate-spin text-green" />
                        ) : (
                          0
                        ))}
                    </div>
                  </div>
                </div>

                {/* Families Card */}
                <div className="flex h-24 bg-white shadow-[rgba(0,_0,_0,_0.24)_2px_2px_8px]">
                  <div className="w-2/5 flex justify-center items-center bg-[#60bd68]">
                    <MdPeopleOutline size={36} className="text-white" />
                  </div>
                  <div className="w-3/5 flex flex-col justify-center px-3 text-[13px]">
                    <span className="font-semibold mb-1">Impacted Households</span>
                    <div className="font-bold text-[20px] text-center">
                      {dashboardData?.totalFamilies ??
                        (loading ? (
                          <FaSpinner className="animate-spin text-green" />
                        ) : (
                          0
                        ))}
                    </div>
                  </div>
                </div>

                {/* Financial Utilization Card */}
                <div className="flex h-24 bg-white shadow-[rgba(0,_0,_0,_0.24)_2px_2px_8px]">
                  <div className="w-2/5 flex justify-center items-center bg-[#b276b2]">
                    <MdCurrencyRupee size={36} className="text-white" />
                  </div>
                  <div className="w-3/5 flex flex-col justify-center px-3 text-[13px]">
                    <span className="font-semibold mb-1 leading-4">
                      Financial <br className="sm:hidden" /> Utilization
                    </span>
                    <div className="font-bold text-[20px] text-center">
                      {dashboardData?.totalCost ??
                        (loading ? (
                          <FaSpinner className="animate-spin text-green" />
                        ) : (
                          0
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 w-full gap-3 lg:gap-6 mt-10">
                <div className="justify-center h-auto content-center shadow-[rgba(0,0,0,0.24)_2px_2px_8px] bg-white">
                  <div className="grid w-full grid-cols-1 text-center font-normal text-black px-4 py-2">
                    <h4 className="text-[13px] my-auto font-extrabold text-center mb-5 h-auto content-center">
                      Plan vs Utilization Report (
                      {loading ? (
                        <FaSpinner className="animate-spin inline-flex mx-2 text-green" />
                      ) : (
                        year
                      )}
                      )
                    </h4>

                    <ComparisonChart1
                      planData={centerwisePlanvsUtil.planAmountArray}
                      utilizationData={
                        centerwisePlanvsUtil.utilisationAmountArray
                      }
                      utilizationLabels={
                        centerwisePlanvsUtil.utilisationLabelArray
                      }
                      labels={centerwisePlanvsUtil.centerArray}
                    />
                  </div>
                </div>

                <div className="justify-center h-auto content-center shadow-[rgba(0,0,0,0.24)_2px_2px_8px] bg-white">
                  <div className="grid w-full grid-cols-1 text-center font-normal text-black px-4 py-2">
                    <h4 className="text-[13px] my-auto font-extrabold text-center h-auto content-center">
                      Approval Vs Utilization Report (
                      {loading ? (
                        <FaSpinner className="animate-spin inline-flex mx-2 text-green" />
                      ) : (
                        year
                      )}
                      )
                    </h4>
                    <ComparisonChart2
                      approvalData={
                        centerwiseApprovalvsUtil.approvalAmountArray
                      }
                      utilizationData={
                        centerwiseApprovalvsUtil.utilisationAmountArray
                      }
                      utilizationLabels={
                        centerwiseApprovalvsUtil.utilisationLabelArray
                      }
                      labels={centerwiseApprovalvsUtil.centerArray}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Dashboard;
