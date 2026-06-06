"use client";
import { useParams } from "next/navigation";
import FilterTable from "@/widgets/GenericTable/FilterTableWithCheckBox";
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    CircleAlert,
    CircleCheck,
    Clock3,
    Download,
    Filter,
    RotateCcw,
    Save,
    ShieldAlert,
    Users,
    Wallet,
} from "lucide-react";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function SummaryCard({
  title,
  value,
  icon,
  change,
  positive,
  bg = "bg-white",
}) {

  return (
    <div
      className={`${bg} border border-gray-200 rounded-2xl p-5`}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
          {icon}
        </div>

        <div
          className={`text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${positive
            ? "bg-green-50 text-green-600"
            : "bg-red-50 text-red-500"
            }`}
        >
          {positive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}

          {change}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
          {title}
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-2">
          {value}
        </h2>
      </div>
    </div>
  );
}

function StatusBadge({ text }) {
  let style =
    "bg-gray-100 text-gray-700";

  if (text === "Verified") {
    style =
      "bg-green-100 text-green-700";
  }

  if (text === "Pending Review") {
    style =
      "bg-yellow-100 text-yellow-700";
  }

  if (text === "Flagged") {
    style =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${style}`}
    >
      {text}
    </span>
  );
}

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

const getMonthName = (monthNumber) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[monthNumber - 1] || "";
};

const tableHeading = {
  employeeName: "Employee",
  grssSalary: "Gross Salary",
  monthDays: "Days in Month",
  workingDays: "Total Working Days",
  weeklyOff: "Weekly Off",
  publicHolidays: "Public Holidays",
  presentDays: "Total Present Days",
  absentDays: "Total Absent Days",
  paidLeaves: "Paid Leaves",
  unPaidLeaves: "Unpaid Leaves",
  netPaidDays: "Net Paid Days",
  netPay: "Net Pay",
  eligibility: "Eligibility",
  status:"Status",
  action:"Action",
  remark:"Remark"
};

const tableObjects = {
  titleMsg: "Payroll Employee Selection",
  tableName: "Employee List",
};

export default function EmployeePreview() {

    const { batchId } = useParams();
    const [employeeDataCount, setEmployeeDataCount] = useState("");
    const [grandTotals, setGrandTotals] = useState("");
    const [tableData, setTableData] = useState([]);
    const [recsPerPage, setRecsPerPage] = useState(10);
    const [numOfPages, setNumOfPages] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [totalRecs, setTotalRecs] = useState(0);
    const [runCount, setRunCount] = useState(0);
    const [payrollEmployeeData, setPayrollEmployeeData] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [holidayCount, setHolidayCount] = useState(0);
    const [summaryData, setSummaryData] = useState({});

    // Total Month & Working days
    const [monthDetails, setMonthDetails] =
      useState({
        totalDays: 0,
        monthWorkingDays: 0,
      });

    const getMonthDetails = (
      monthName
    ) => {
      const monthIndex = new Date(
        `${monthName} 1`
      ).getMonth();

      // Total Days
      const totalDays = new Date(
        2026,
        monthIndex + 1,
        0
      ).getDate();

      // Working Days
      let monthWorkingDays = 0;
      let monthWeeklyOff = 8;

      for (
        let day = 1;
        day <= totalDays;
        day++
      ) {
        const date = new Date(
          2026,
          monthIndex,
          day
        );
        const weekDay =
          date.getDay();

        if (
          weekDay !== 0 &&
          weekDay !== 6
        ) {
          monthWorkingDays++;
        }
      }
      const details = {
        totalDays,
        monthWorkingDays,
        monthWeeklyOff
      };

      setMonthDetails(details);

      return details;

    };

    useEffect(() => {

        // --------- Get Payroll Summary Data
        axios
        .get(`/api/payroll-management/summaryData/${batchId}`)
        .then((res) => {
          const summaryDatas = res.data.data; 
          setSummaryData(res.data.data);
          fetchHolidayCount(summaryDatas.payrollYear, summaryDatas.payrollMonth);
          console.log('Summary ',summaryDatas);
        })
        .catch((err) => {
          console.error(err);
        });

        const mdetails = getMonthDetails(summaryData.payrollMonth);
        

        // ----------- Get public holidys count

        const fetchHolidayCount = async (yrr,mnn) => {
          try {
            const res = await axios.get(
              "/api/payroll-management/holidaysCount",
              {
                params: {
                  year: yrr,
                  month: mnn,
                },
              }
            );
            
            setHolidayCount(res.data.holidayCount);

            setTableData((prev) =>
              prev.map((emp) => ({
                ...emp,
                publicHolidays: res.data.holidayCount,
              }))
            ); 

          } catch (error) {
            console.error(error);
          }
        };


        // --------- Get Selected Employee data for Payroll
        
        const fetchEmployees = async () => {
          try {
            const res = await axios.get(
              `/api/payroll-management/employeeDetails/${batchId}`
            );
            const formattedData = res.data.data.map((emp) => ({
              ...emp,
              employeeName: emp.employeeFullName,
              previewEmpID: emp.employeeID,
              monthDays: emp.attendanceSummary.totalCalendarDays, 
              weeklyOff: emp.attendanceSummary.totalWeeklyOffs,
              presentDays: emp.attendanceSummary.totalPresentDays,
              workingDays: emp.attendanceSummary.totalWorkingDays,
              absentDays: emp.attendanceSummary.totalAbsentDays,
              netPaidDays: 0,
              grssSalary: "₹" + (emp.gross || 0).toLocaleString(),
              variablePay: 0,
              overTime: emp.attendanceSummary?.overtimeHours || 0,
              deduction: "₹" + (emp.deductions || 0).toLocaleString(),
              netPay: "₹" + (emp.netSalary || 0).toLocaleString(),
              eligibility: emp.payrollEligibility,
            }));

            setPayrollEmployeeData(res.data.data);
            setGrandTotals(res.data.summary);
            setTableData(formattedData);
            setTotalRecs(formattedData.length);

            setAttenEmpIds(
              res.data.data.map((emp) => emp.employeeID)
            );
          } catch (err) {
            console.error(err);
          }
        };
        if (batchId) {
          fetchEmployees();
        }
    }, [batchId]);


    useEffect(() => {
      getEmployeeCount();
    }, [])

    const getEmployeeCount = () => {
      const response = axios.get("/api/employees/get").then((res) => {
        setEmployeeDataCount(res.data.length);
      }).catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Error fetching employee count",
          text: err.message,
        });
      });
    }


  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Steps */}
          <div className="flex items-center gap-4">
            {[
              "Employee Selection",
              "Payroll Preview",
              "Approval Workflow",
              "Execution",
            ].map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${index === 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`text-sm font-medium ${index === 1
                      ? "text-gray-900"
                      : "text-gray-500"
                      }`}
                  >
                    {step}
                  </span>
                </div>

                {index !== 3 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="p-8">
        {/* Cycle + Stats */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Card */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
            {/* Top */}
            <div className="flex items-start justify-between">
              {/* Left */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {getMonthName(summaryData.payrollMonth)} {summaryData.payrollYear}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(summaryData.payrollStartDate)} - {formatDate(summaryData.payrollEndDate)}
                  </p>
                </div>
              </div>

              {/* Batch ID */}
              <div className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-600">
                ID: {summaryData.payrollBatchNo}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  Location
                </p>

                <h3 className="text-sm font-semibold mt-2">
                  {summaryData.locations}
                </h3>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  Business Unit
                </p>

                <h3 className="text-sm font-semibold mt-2">
                  {summaryData.businessUnits}
                </h3>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  Department
                </p>

                <h3 className="text-sm font-semibold mt-2">
                  {summaryData.departments}
                </h3>
              </div>
            </div>

            {/* Employee Count Cards */}
            <div className="grid grid-cols-3 gap-5 mt-8">
              {/* Total Employees */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-blue-600">
                      Total Employees in Company
                    </p>

                    <h2 className="text-4xl font-bold text-gray-900 mt-4">
                      {employeeDataCount ? employeeDataCount : "2,450"}
                    </h2>

                    <p className="text-xs text-gray-500 mt-3">
                      Organization employee count
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Filter Employees */}
              <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-green-600">
                      Employees as per Filters Applied
                    </p>

                    <h2 className="text-4xl font-bold text-gray-900 mt-4">
                      0
                    </h2>

                    <p className="text-xs text-gray-500 mt-3">
                      Matching payroll filters
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-green-600 shadow-sm">
                    <Filter className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Selected Employees */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-purple-600">
                      Total Selected Employees
                    </p>

                    <h2 className="text-4xl font-bold text-gray-900 mt-4">
                      {summaryData.totalEmployees ? summaryData.totalEmployees : "245"}
                    </h2>

                    <p className="text-xs text-gray-500 mt-3">
                      Included in payroll run
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                    <CircleCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Stats */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Calendar Statistics
            </h3>

            <div className="space-y-5 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Total Calendar Days
                </span>

                <span className="font-bold">
                  {monthDetails.totalDays} Days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Standard Working Days
                </span>

                <span className="font-bold">
                  {monthDetails.monthWorkingDays} Days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Public Holidays
                </span>

                <span className="font-bold">
                  01 Day
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-green-600 font-medium">
              <CircleCheck className="w-4 h-4" />
              All calculations based on India
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-700">
              Financial Summary
            </h2>

            <ChevronRight className="w-4 h-4 text-blue-600" />
          </div>

          <div className="grid grid-cols-4 gap-5">
            <SummaryCard
              title="Total Gross Salary"
              value={`₹${grandTotals.totalGross?.toLocaleString()}`}
              icon={<Wallet className="w-5 h-5" />}
              change="+4.2%"
              positive={false}
              valueClassName="text-base text-sm"
            />
            <SummaryCard
              title="Total Deductions"
              value={`₹${grandTotals.totalDeductions?.toLocaleString()}`}
              icon={<ArrowDownRight className="w-5 h-5" />}
              change="-1.5%"
              positive
            />
            <SummaryCard
              title="Total Net Payable"
              value={`₹${grandTotals.totalNet?.toLocaleString()}`}
              icon={<ArrowUpRight className="w-5 h-5" />}
              change="+5.8%"
              positive
              bg="bg-blue-50"
            />
            <SummaryCard
              title="Overtime Liability"
              value="₹0"
              icon={<Clock3 className="w-5 h-5" />}
              change="+12%"
              positive={false}
              bg="bg-orange-50"
            />
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-3 gap-5 mt-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                <ShieldAlert className="w-5 h-5" />
              </div>

              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mt-6">
                Compliance Liability
              </p>

              <h2 className="text-2xl font-bold mt-2">
                ₹0
              </h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                <Users className="w-5 h-5" />
              </div>

              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mt-6">
                Employer Contribution
              </p>

              <h2 className="text-2xl font-bold mt-2">
                ₹{grandTotals.employerContri?.toLocaleString()}
              </h2>
            </div>

            <div className="bg-green-100 border border-green-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-700">
                <CircleCheck className="w-5 h-5" />
              </div>

              <p className="text-[11px] uppercase tracking-wide text-green-700 font-semibold mt-6">
                Total Selected Employees
              </p>

              <h2 className="text-2xl font-bold mt-2 text-gray-900">
                0
              </h2>
            </div>
          </div>
        </div>

        {/* Validation Checks */}
        {/* <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-8">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Critical Validation Checks
            </h3>

            <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
              5 Issues Found
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              "Negative Net Salary detected for EMP-084",
              "Missing Attendance data for 12 employees",
              "Compliance Warning: Overtime Threshold",
              "Pending Salary Structure Approval",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border border-red-100 bg-red-50 rounded-xl px-4 py-3 text-sm text-red-600"
              >
                <CircleAlert className="w-4 h-4" />
                {item}
              </div>
            ))}
          </div>
        </div> */}

        {/* Employee Table */}
        <div className="bg-white border border-gray-200 rounded-2xl mt-8 overflow-hidden p-10">
          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Employee Payroll Preview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                
              </p>
            </div>

            <div className="flex items-center gap-3">
            </div>
          </div>

          {/* NEW Table  */}

          <FilterTable
            tableHeading={tableHeading}
            tableObjects={tableObjects}
            getData={() => { }}
            tableData={tableData}
            setTableData={setTableData}
            recsPerPage={recsPerPage}
            setRecsPerPage={setRecsPerPage}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            searchText={searchText}
            setSearchText={setSearchText}
            totalRecs={totalRecs}
            setTotalRecs={setTotalRecs}
            numOfPages={numOfPages}
            setNumOfPages={setNumOfPages}
            runCount={runCount}
            setRunCount={setRunCount}
            filterData={{}}
            loading={false}
            checkboxSelection={false}
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-5 bg-white">
            <button className="text-sm text-gray-500 font-medium">
              ← Previous Step
            </button>

            <div className="flex items-center gap-4">
              <button className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow">
                Submit Payroll For Approval
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}