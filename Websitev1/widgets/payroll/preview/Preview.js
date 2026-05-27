"use client";

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

const payrollData = [
  {
    id: 1,
    emp: "Alexander Pierce",
    code: "EMP-001",
    dept: "Technology",
    location: "San Francisco",
    paidDays: "22/31",
    gross: "₹10,650.00",
    variable: "₹0.00",
    overtime: "₹0.00",
    deduction: "₹2,654.00",
    net: "₹7,996.00",
    status: "Verified",
  },
  {
    id: 2,
    emp: "Sarah Jenkins",
    code: "EMP-002",
    dept: "Design",
    location: "Austin",
    paidDays: "18/31",
    gross: "₹8,200.00",
    variable: "₹0.00",
    overtime: "₹0.00",
    deduction: "₹1,840.00",
    net: "₹6,360.00",
    status: "Pending Review",
  },
  {
    id: 3,
    emp: "Michael Chen",
    code: "EMP-003",
    dept: "Finance",
    location: "New York",
    paidDays: "23/31",
    gross: "₹12,100.00",
    variable: "₹0.00",
    overtime: "₹0.00",
    deduction: "₹3,120.00",
    net: "₹8,980.00",
    status: "Verified",
  },
  {
    id: 4,
    emp: "Elena Rodriguez",
    code: "EMP-004",
    dept: "Marketing",
    location: "Miami",
    paidDays: "20/31",
    gross: "₹15,400.00",
    variable: "₹0.00",
    overtime: "₹0.00",
    deduction: "₹4,520.00",
    net: "₹10,880.00",
    status: "Flagged",
  },
  {
    id: 5,
    emp: "David Smith",
    code: "EMP-005",
    dept: "HR",
    location: "San Francisco",
    paidDays: "21/31",
    gross: "₹7,500.00",
    variable: "₹0.00",
    overtime: "₹0.00",
    deduction: "₹1,620.00",
    net: "₹5,880.00",
    status: "Verified",
  },
];

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

        <h2 className="text-4xl font-bold text-gray-900 mt-2">
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
      className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}
    >
      {text}
    </span>
  );
}

export default function PayrollPreview() {

  const [employeeDataCount, setEmployeeDataCount] = useState("");


  useEffect(() => {
    getEmployeeCount();
  }, [])

  const getEmployeeCount = () => {
    const response = axios.get("/api/employees/get").then((res) => {
      console.log("Employee Count:", res.data.length);
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

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save View
            </button>

            <button className="h-11 px-5 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            <button className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 shadow">
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
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
                    July 2024 Cycle
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    July 01 - July 31, 2024
                  </p>
                </div>
              </div>

              {/* Batch ID */}
              <div className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-600">
                ID: PAY-2024-07-0042
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  Company
                </p>

                <h3 className="text-sm font-semibold mt-2">
                  Global Tech Solutions Inc.
                </h3>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  Business Unit
                </p>

                <h3 className="text-sm font-semibold mt-2">
                  Main Headquarters - USA
                </h3>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  Generated On
                </p>

                <h3 className="text-sm font-semibold mt-2">
                  2024-08-02 09:45:12 AM
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
                      1,240
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
                      1,180
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
                  31 Days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Standard Working Days
                </span>

                <span className="font-bold">
                  22 Days
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
              All calculations based on US-CAL-2024
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
              value="₹428,650"
              icon={<Wallet className="w-5 h-5" />}
              change="+4.2%"
              positive={false}
            />

            <SummaryCard
              title="Total Deductions"
              value="₹84,210"
              icon={<ArrowDownRight className="w-5 h-5" />}
              change="-1.5%"
              positive
            />

            <SummaryCard
              title="Total Net Payable"
              value="₹344,439"
              icon={<ArrowUpRight className="w-5 h-5" />}
              change="+5.8%"
              positive
              bg="bg-blue-50"
            />

            <SummaryCard
              title="Overtime Liability"
              value="₹12,450"
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

              <h2 className="text-4xl font-bold mt-2">
                ₹31,200
              </h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                <Users className="w-5 h-5" />
              </div>

              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mt-6">
                Employer Contribution
              </p>

              <h2 className="text-4xl font-bold mt-2">
                ₹58,400
              </h2>
            </div>

            <div className="bg-green-100 border border-green-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-700">
                <CircleCheck className="w-5 h-5" />
              </div>

              <p className="text-[11px] uppercase tracking-wide text-green-700 font-semibold mt-6">
                Total Selected Employees
              </p>

              <h2 className="text-4xl font-bold mt-2 text-gray-900">
                245 / 250
              </h2>
            </div>
          </div>
        </div>

        {/* Validation Checks */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-8">
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
        </div>

        {/* Employee Table */}
        <div className="bg-white border border-gray-200 rounded-2xl mt-8 overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Employee Payroll Preview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Showing 245 calculated entries
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium">
                Filter Columns
              </button>

              <button className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div>
            {/* Head */}
            <div className="grid grid-cols-10 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wide font-semibold text-gray-500">
              <div>#</div>
              <div className="col-span-2">
                Employee Information
              </div>
              <div>Net Paid Days</div>
              <div>Gross Salary</div>
              <div>Variable Pay</div>
              <div>Overtime Amt</div>
              <div>Deductions</div>
              <div>Net Payable</div>
              <div>Eligibility</div>
            </div>

            {/* Rows */}
            {payrollData.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-10 gap-4 px-6 py-5 border-b border-gray-100 items-center hover:bg-gray-50"
              >
                <div className="text-sm font-medium">
                  {row.id}
                </div>

                {/* Employee */}
                <div className="col-span-2 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {row.emp}
                    </h3>

                    <p className="text-xs text-blue-600 mt-1">
                      {row.code}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {row.dept} • {row.location}
                    </p>
                  </div>
                </div>

                <div className="text-sm font-semibold">
                  {row.paidDays}
                </div>

                <div className="text-sm">
                  {row.gross}
                </div>

                <div className="text-sm">
                  {row.variable}
                </div>

                <div className="text-sm">
                  {row.overtime}
                </div>

                <div className="text-sm text-red-500 font-semibold">
                  {row.deduction}
                </div>

                <div className="text-sm text-blue-600 font-bold">
                  {row.net}
                </div>

                <div>
                  <StatusBadge text={row.status} />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-5 bg-white">
            <button className="text-sm text-gray-500 font-medium">
              ← Previous Step
            </button>

            <div className="flex items-center gap-4">
              <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium">
                Save Draft
              </button>

              <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Preview (PDF)
              </button>

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