"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShieldAlert,
  Bell,
  Users,
  Clock3,
  Wallet,
  Landmark,
  BadgeAlert,
  AlertTriangle,
  CircleDollarSign,
  FileWarning,
  Building2,
  ChevronDown,
  Play,
  RotateCcw,
  FileText,
  Download,
  MoreVertical,
  Settings,
  LifeBuoy,
  Briefcase,
  Globe,
  Banknote,
  ClipboardList,
  UserRound,
} from "lucide-react";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";




export default function Dashboard() {

  const router = useRouter();
  const [summaryData, setSummaryData] = useState([]);  
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    location: "",
    department: "",
    designation: "",
  });

  useEffect(() => {
    fetchPayrollSummary();
    console.log('filters ', filters);
  },[filters]);  

  const fetchPayrollSummary = async () => {
    try {
      const res = await axios.get(
        "/api/payroll-management/summaryAllData",
        {
          params: filters,
        }
      );

      console.log(res.data);
      setSummaryData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="min-h-screen bg-[#F7F7FA] flex text-[#1B1B1D]">
      {/* MAIN */}
      <main className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="h-[78px] border-b border-[#E8E8EE] bg-white px-8 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight leading-none">
              Executive Payroll Dashboard
            </h2>

            <p className="text-[13px] text-gray-500 mt-1">
              Monitoring Cycle: June 2026 (Active)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-[260px] h-[48px] rounded-xl border border-[#ccc] bg-[#FAFAFC] px-4 flex items-center gap-3">
              <Search className="w-4 h-4 text-gray-400" />

              <input
                placeholder="Search records or batches..."
                className="bg-transparent outline-none w-full text-[14px]"
              />
            </div>

            {/* <TopButton icon={FileText} label="Audit Logs" />
            <TopButton icon={UserRound} label="Approvals" /> */}

            <button
              onClick={() =>
                router.push(
                  "/admin/payrollManagementNew/employee-selection"
                )
              }
              className="h-[48px] px-6 rounded-xl bg-[#6F56FF] text-white flex items-center gap-2 font-medium shadow-md"
            >
              <Play className="w-4 h-4" />
              Execute Payroll
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-8">
          {/* FILTERS */}
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <div className="flex flex-wrap items-center gap-4">

        {/* Year */}
        <select
          value={filters.year}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              year: e.target.value,
            }))
          }
        className="h-12 min-w-[150px] rounded-lg border border-gray-200 bg-white px-5 text-sm outline-none">
          <option value="">Select Year</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>

        {/* Month */}
        <select 
          value={filters.month}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              month: e.target.value,
            }))
          }
          className="h-12 min-w-[150px] rounded-lg border border-gray-200 bg-white px-5 text-sm outline-none">
          <option value="">Select Month</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        {/* Location */}
        <select 
          value={filters.location}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              location: e.target.value,
            }))
          }        
          className="h-12 min-w-[160px] rounded-lg border border-gray-200 bg-white px-5 text-sm outline-none">
          <option value="">All Locations</option>
          <option>Pune</option>
          <option>Mumbai</option>
          <option>Bangalore</option>
          <option>Delhi</option>
        </select>

        {/* Department */}
          <select
            value={filters.department}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                department: e.target.value,
              }))
            }
            className="h-12 min-w-[200px] rounded-lg border border-gray-200 bg-white px-5 text-sm outline-none"
          >
          <option value="">All Departments</option>
          <option>HR</option>
          <option>Finance</option>
          <option>IT</option>
          <option>Operations</option>
        </select>

        {/* Designation */}
            <select
              value={filters.designation}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  designation: e.target.value,
                }))
              }
            className="h-12 min-w-[200px] rounded-lg border border-gray-200 bg-white px-5 text-sm outline-none"
            >          
          <option value="">All Designations</option>
          <option>Manager</option>
          <option>Team Lead</option>
          <option>Developer</option>
          <option>Executive</option>
        </select>

        {/* Apply */}
        <button onClick={fetchPayrollSummary} className="h-12 px-8 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
          Apply
        </button>

        {/* Reset */}
        <button className="h-12 w-12 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>


          {/* TABLE SECTION */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <SectionTitle title="Payroll Execution Summary" />

              <div className="flex gap-3">
                <SmallBtn
                  icon={Download}
                  label="Bank File"
                />

                <SmallBtn
                  icon={RotateCcw}
                  label="Reprocess"
                />

                <SmallBtn
                  icon={FileText}
                  label="Summary Report"
                />
              </div>
            </div>

            <div className="bg-white border border-[#ECECF2] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#FAFAFC] border-b border-[#ECECF2]">
                  <tr className="text-left text-[12px] uppercase tracking-wide text-gray-400">
                    <th className="px-5 py-4">
                      Batch ID
                    </th>

                    <th className="px-5 py-4">
                      Month / Cycle
                    </th>

                    <th className="px-5 py-4">
                      Entity & Location
                    </th>

                    <th className="px-5 py-4">
                      Emp Count
                    </th>

                    <th className="px-5 py-4">
                      Gross Total
                    </th>

                    <th className="px-5 py-4">
                      Net Total
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Personnel (M/C)
                    </th>

                    <th className="px-5 py-4">
                      Exec. Date
                    </th>

                    <th className="px-5 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {summaryData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#F0F0F4] hover:bg-[#FAFAFC]"
                    >
                      <td className="px-5 py-5">
                        <div className="text-[#6D58FF] font-semibold text-[13px] leading-5">
                          {row.payrollBatchNo}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="font-semibold">
                          {row.month}
                        </div>

                        <div className="text-[12px] text-gray-500">
                          Monthly
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="font-semibold">
                          Pune
                        </div>

                        <div className="text-[12px] text-gray-500">
                          {row.department}
                        </div>
                      </td>

                      <td className="px-5 py-5 font-semibold">
                        {row.totalEmployees}
                      </td>

                      <td className="px-5 py-5 font-semibold">
                        ₹{row.totalEmployees * 100000}
                      </td>

                      <td className="px-5 py-5 font-semibold">
                        ₹{row.totalEmployees * 90000}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] font-medium ${row.statusColor}`}
                        >
                          {row.payrollStatus}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-[12px] text-gray-600 leading-5">
                        <div>{row.manager}</div>
                        <div>{row.checker}</div>
                      </td>

                      <td className="px-5 py-5 text-[12px] text-gray-600 leading-5">
                        <div>{row.payrollMonth} / {row.payrollYear}</div>
                      </td>

                      <td className="px-5 py-5">
                        {/* <MoreVertical className="w-4 h-4 text-gray-500" /> */}
                        <SmallBtn
                          icon={RotateCcw}
                          label="Process"
                          onClick={() => {
                            router.push(`/admin/payrollManagementNew/preview/${row._id}`)}
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between text-[12px] text-gray-500 mt-8">
            <div className="flex gap-6">
              <span>
                © 2026 iAssureIt Financial Systems
              </span>

              <span>Data Privacy Policy</span>

              <span>System Health: Normal</span>
            </div>

            <div className="flex gap-6">
              <span>● Server Sync: Live</span>

              <span>Last Updated: 2 mins ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* COMPONENTS */

function SidebarItem({
  icon: Icon,
  label,
  active,
}) {
  return (
    <button
      className={`w-full h-[52px] rounded-xl flex items-center gap-3 px-4 text-[15px] transition ${
        active
          ? "bg-[#EEE9FF] text-[#6D58FF] font-semibold"
          : "hover:bg-gray-100 text-gray-600"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function TopButton({ icon: Icon, label }) {
  return (
    <button className="h-[48px] px-5 rounded-xl border border-[#E5E7EB] bg-white flex items-center gap-2 font-medium">
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function FilterBox({ label }) {
  return (
    <button className="h-[50px] min-w-[160px] px-5 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-between text-[14px]">
      {label}

      <ChevronDown className="w-4 h-4 text-gray-500" />
    </button>
  );
}

function SectionTitle({ title, badge }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h3 className="text-[30px] font-semibold tracking-tight">
        {title}
      </h3>

      {badge && (
        <span className="px-2 py-1 rounded-full bg-[#F0F0F5] text-[11px] font-semibold">
          {badge}
        </span>
      )}

      <div className="flex-1 h-px bg-[#ECECF2]" />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-[#ECECF2] rounded-2xl p-5">
      <h4 className="font-semibold text-[18px]">
        {title}
      </h4>

      {children}
    </div>
  );
}

function SmallBtn({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-[42px] px-4 rounded-xl border border-[#E5E7EB] bg-white flex items-center gap-2 text-[14px] font-medium"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}