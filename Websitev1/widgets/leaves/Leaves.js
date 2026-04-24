"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaFilter,
  FaCheck,
  FaTimes,
  FaFileUpload,
  FaCalendarCheck,
  FaHistory,
  FaClock,
  FaUser,
} from "react-icons/fa";
import { MdHistory, MdFilterList } from "react-icons/md";
import moment from "moment";
import { useRouter, usePathname } from "next/navigation";
import ls from "localstorage-slim";

const Leaves = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = React.useState("admin");
  const [activeTab, setActiveTab] = useState("Pending Requests");
  const [leaves, setLeaves] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(moment().format("MM"));
  const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableSearch, setTableSearch] = useState("");
  const [showCompOffModal, setShowCompOffModal] = useState(false);
  const [compOffData, setCompOffData] = useState({
    employeeId: "",
    dateWorked: moment().format("YYYY-MM-DD"),
    days: 1.0,
    reason: "",
  });

  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    if (pathname?.includes("admin")) setLoggedInRole("admin");
    else if (pathname?.includes("center")) setLoggedInRole("center");
    
    fetchEmployees();
    fetchLeaveTypes();
    fetchLeaves();
  }, [pathname]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchSummary(selectedEmployee);
    } else {
      setSummary(null);
    }
  }, [selectedEmployee, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchLedger();
    fetchMonthlyReport();
  }, [selectedEmployee, selectedMonth, selectedYear, selectedLeaveType]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/employees/get");
      if (Array.isArray(res.data)) setEmployees(res.data);
      else if (res.data?.data) setEmployees(res.data.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get("/api/leave-types");
      if (res.data.success) setLeaveTypes(res.data.data);
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/leave-applications");
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    try {
      const params = {
        month: selectedMonth,
        year: selectedYear,
      };
      const res = await axios.get("/api/leave-balance/monthly-report", { params });
      if (res.data.success) {
        setMonthlyReport(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching monthly report:", err);
    }
  };

  const fetchLedger = async () => {
    try {
      let url = selectedEmployee 
        ? `/api/leave-ledger/employee/${selectedEmployee}`
        : "/api/leave-ledger";
      
      const params = {
        month: selectedMonth,
        year: selectedYear,
        leaveTypeId: selectedLeaveType
      };

      const res = await axios.get(url, { params });
      if (res.data.success) {
        setLedger(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ledger:", err);
    }
  };

  const fetchSummary = async (empId) => {
    try {
      const params = {
        month: selectedMonth,
        year: selectedYear
      };
      const res = await axios.get(`/api/leave-balance/summary/${empId}`, { params });
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const details = ls.get("userDetails", { decrypt: true });
      await axios.patch(`/api/leave-applications/${id}`, { 
        status,
        approvedBy: details?._id 
      });
      fetchLeaves();
      fetchLedger();
      if (selectedEmployee) fetchSummary(selectedEmployee);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleCompOffSubmit = async (e) => {
    e.preventDefault();
    try {
      const details = ls.get("userDetails", { decrypt: true });
      const res = await axios.post("/api/leave-ledger/add-compoff", {
        ...compOffData,
        approvedBy: details?._id,
      });
      if (res.data.success) {
        setShowCompOffModal(false);
        fetchLedger();
        if (compOffData.employeeId) fetchSummary(compOffData.employeeId);
        setCompOffData({
          employeeId: "",
          dateWorked: moment().format("YYYY-MM-DD"),
          days: 1.0,
          reason: "",
        });
      }
    } catch (err) {
      alert("Error adding Comp Off: " + (err.response?.data?.message || err.message));
    }
  };

  const triggerManualAccrual = async () => {
    try {
      console.log("Triggering manual accrual...");
      const res = await axios.post("/api/leave-ledger/accrue-monthly");
      console.log("Accrual Response:", res.data);
      alert(res.data.message || "Manual accrual completed successfully.");
      fetchLedger();
      if (selectedEmployee) fetchSummary(selectedEmployee);
    } catch (err) {
      console.error("Accrual Error:", err);
      alert("Accrual Error: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (selectedEmployee && leave.employeeId?._id !== selectedEmployee) return false;
    if (selectedLeaveType !== "all" && leave.leaveTypeId?._id !== selectedLeaveType) return false;
    
    if (activeTab === "Pending Requests") return leave.status === "PENDING";
    if (activeTab === "Approved") return leave.status === "APPROVED";
    if (activeTab === "Rejected") return leave.status === "REJECTED";
    return true; 
  });

  return (
    <section className="section">
      <main className="p-4 min-h-screen">
        <div className="mx-auto">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-normal text-gray-800 tracking-tight">
                Leave Management
              </h1>
              <span className="text-sm font-light text-gray-500">
                Dashboard & Ledger
              </span>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={triggerManualAccrual}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-gray-50 shadow-sm flex items-center gap-2"
                title="Run monthly EL credit manually"
              >
                <FaClock size={12} /> Run Accrual
              </button>
              <button
                onClick={() => setShowCompOffModal(true)}
                className="bg-[#3c8dbc] border border-[#367fa9] text-white px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-[#367fa9] shadow-sm flex items-center gap-2"
              >
                <FaCalendarCheck size={12} /> Credit Comp Off
              </button>
              <button
                onClick={() => router.push(`/${loggedInRole}/leaves/apply`)}
                className="bg-[#00a65a] border border-[#008d4c] text-white px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-[#008d4c] shadow-sm flex items-center gap-2"
              >
                <FaPlus size={12} /> Apply Leave
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-3 border border-gray-100 shadow-sm rounded-sm mb-6 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Filter Employee</label>
              <select 
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-[11px] font-bold text-gray-600 focus:outline-none focus:border-[#3c8dbc] bg-gray-50 shadow-sm"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.employeeName} ({emp.employeeID})</option>
                ))}
              </select>
            </div>
            
            <div className="w-40">
              <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Month / Year</label>
              <input 
                type="month"
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-[11px] font-bold text-gray-600 focus:outline-none focus:border-[#3c8dbc] bg-gray-50 shadow-sm"
                value={`${selectedYear}-${selectedMonth}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split("-");
                  setSelectedYear(y);
                  setSelectedMonth(m);
                }}
              />
            </div>

            <div className="w-32">
              <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Leave Type</label>
              <select 
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-[11px] font-bold text-gray-600 focus:outline-none focus:border-[#3c8dbc] bg-gray-50 uppercase shadow-sm"
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
              >
                <option value="all">All</option>
                {leaveTypes.filter(t => ["EL", "CO"].includes(t.leaveCode)).map(t => (
                  <option key={t._id} value={t._id}>{t.leaveCode}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setSelectedEmployee("");
                  setSelectedMonth(moment().format("MM"));
                  setSelectedYear(moment().format("YYYY"));
                  setSelectedLeaveType("all");
                }}
                className="px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-tight"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Main Box */}
          <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm flex flex-col mb-10">
            {/* Box Header with Tabs */}
            <div className="border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-white px-2">
              <div className="flex overflow-x-auto no-scrollbar">
                {[
                  "Pending Requests",
                  "Approved",
                  "Rejected",
                  "Employee Balances",
                  "Leave Ledger",
                  "All Records",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-[12px] font-bold transition-all relative whitespace-nowrap border-r border-gray-100 ${
                      activeTab === tab
                        ? "bg-white text-gray-800 border-t-2 border-t-[#00a65a] -mt-[2px]"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {tab}
                    {tab === "Pending Requests" &&
                      leaves.filter((l) => l.status === "PENDING").length >
                        0 && (
                        <span className="ml-2 bg-[#00a65a] text-white px-1.5 py-0.5 rounded-full text-[9px]">
                          {leaves.filter((l) => l.status === "PENDING").length}
                        </span>
                      )}
                  </button>
                ))}
              </div>
              <div className="p-3 hidden md:block">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Current View: {activeTab}
                </h3>
              </div>
            </div>

            {/* DataTable Controls */}
            <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                Show
                <select className="border border-gray-300 rounded-sm px-1 py-1 focus:outline-none bg-white">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                entries
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                Search:
                <input
                  type="text"
                  placeholder="Filter results..."
                  className="border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:border-[#3c8dbc]"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse border-b border-gray-200">
                <thead className="bg-[#f9f9f9]">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider">Employee</th>
                    {activeTab === "Employee Balances" ? (
                      <>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider text-center">EL Balance</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider text-center">CO Balance</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider text-center">Total Balance</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider text-center text-red-600">LOP</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider text-center">Used (Month)</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider">Action</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider">Transaction</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider text-center">Days</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider text-center">Balance</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider">Source</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider">Remarks</th>
                        {activeTab !== "Leave Ledger" && (
                          <th className="px-4 py-3 text-[11px] font-bold text-gray-700 border-b border-gray-200 uppercase tracking-wider">Actions</th>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-20 text-center text-gray-400 text-xs italic"
                      >
                        Loading records...
                      </td>
                    </tr>
                  ) : (() => {
                      let data = activeTab === "Leave Ledger" ? ledger : filteredLeaves;
                      if (activeTab === "Employee Balances") data = monthlyReport;
                      
                      const search = tableSearch.toLowerCase();
                      if (search) {
                        data = data.filter(item => {
                          const empName = (item.employeeName || item.employeeId?.employeeName || "").toLowerCase();
                          const empId = (item.employeeID || item.employeeId?.employeeID || "").toLowerCase();
                          const remarks = (item.remarks || item.reason || "").toLowerCase();
                          const code = (item.leaveTypeId?.leaveCode || "").toLowerCase();
                          return empName.includes(search) || empId.includes(search) || remarks.includes(search) || code.includes(search);
                        });
                      }

                      return data;
                    })().length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-20 text-center text-gray-400 text-xs italic"
                      >
                        No records found {selectedEmployee ? "for this employee" : ""} {tableSearch ? `matching "${tableSearch}"` : ""}
                      </td>
                    </tr>
                  ) : activeTab === "Employee Balances" ? (
                    monthlyReport
                      .filter(r => !selectedEmployee || r._id === selectedEmployee)
                      .filter(r => {
                        if (!tableSearch) return true;
                        const search = tableSearch.toLowerCase();
                        return r.employeeName.toLowerCase().includes(search) || r.employeeID.toLowerCase().includes(search);
                      })
                      .map((row) => (
                      <tr key={row._id} className="hover:bg-[#f5f5f5] transition-colors border-b border-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-[11px] font-bold text-gray-700">{row.employeeName}</div>
                          <div className="text-[9px] text-gray-400">{row.employeeID}</div>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-bold text-center">{row.elBalance}</td>
                        <td className="px-4 py-3 text-[11px] font-bold text-center">{row.coBalance}</td>
                        <td className="px-4 py-3 text-center">
                           <span className={`text-[11px] font-bold ${row.totalBalance < 0 ? "text-red-500" : "text-gray-800"}`}>
                             {row.totalBalance}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                           <span className={`text-[11px] font-bold ${row.lop > 0 ? "text-red-600 bg-red-50 px-2 py-0.5 rounded" : "text-gray-300 italic"}`}>
                             {row.lop > 0 ? row.lop : "0"}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                           <span className="text-[11px] font-bold text-[#dd4b39]">
                             {row.usedInMonth > 0 ? `-${row.usedInMonth}` : "0"}
                           </span>
                        </td>
                        <td className="px-4 py-3">
                           <button 
                             onClick={() => router.push(`/admin/leaves/ledger/${row._id}?month=${selectedMonth}&year=${selectedYear}`)}
                             className="bg-[#3c8dbc] text-white px-3 py-1 rounded-sm text-[10px] font-bold hover:bg-[#367fa9] shadow-sm"
                           >
                             View
                           </button>
                        </td>
                      </tr>
                    ))
                  ) : activeTab === "Leave Ledger" ? (
                    ledger.filter(item => {
                        if (!tableSearch) return true;
                        const search = tableSearch.toLowerCase();
                        return (item.employeeId?.employeeName || "").toLowerCase().includes(search) || 
                               (item.employeeId?.employeeID || "").toLowerCase().includes(search) ||
                               (item.remarks || "").toLowerCase().includes(search) ||
                               (item.leaveTypeId?.leaveCode || "").toLowerCase().includes(search);
                      }).map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-[#f5f5f5] transition-colors border-b border-gray-50"
                      >
                        <td className="px-4 py-3">
                          <div className="text-[11px] font-bold text-gray-700">
                            {item.employeeId?.employeeName || "Unknown"}
                          </div>
                          <div className="text-[9px] text-gray-400">
                            {item.employeeId?.employeeID || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold text-[#3c8dbc] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {item.leaveTypeId?.leaveCode || "Leave"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-gray-600">
                          {moment(item.transactionDate).format("DD MMM YYYY")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              item.days > 0
                                ? "bg-green-100 text-[#00a65a]"
                                : "bg-red-100 text-[#dd4b39]"
                            }`}
                          >
                            {item.days > 0 ? "Earned" : "Used"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-[11px] font-bold">
                          <span className={item.days > 0 ? "text-[#00a65a]" : "text-[#dd4b39]"}>
                            {item.days > 0 ? "+" : ""}{item.days}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-[11px] font-bold text-gray-800 bg-gray-50 rounded px-2 py-1 inline-block border border-gray-100">
                            {item.balanceAfter}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                            {item.referenceType || "System"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-gray-500 italic truncate max-w-[150px]" title={item.remarks}>
                          {item.remarks}
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredLeaves.filter(item => {
                        if (!tableSearch) return true;
                        const search = tableSearch.toLowerCase();
                        return (item.employeeId?.employeeName || "").toLowerCase().includes(search) || 
                               (item.employeeId?.employeeID || "").toLowerCase().includes(search) ||
                               (item.reason || "").toLowerCase().includes(search) ||
                               (item.leaveTypeId?.leaveCode || "").toLowerCase().includes(search);
                      }).map((leave) => (
                      <tr
                        key={leave._id}
                        className="hover:bg-[#f5f5f5] transition-colors border-b border-gray-50"
                      >
                        <td className="px-4 py-3">
                          <div className="text-[11px] font-bold text-gray-700">
                            {leave.employeeId?.employeeName || "Unknown"}
                          </div>
                          <div className="text-[9px] text-gray-400">
                            {leave.employeeId?.employeeID || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            {leave.leaveTypeId?.leaveCode || "Leave"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-gray-600">
                          {moment(leave.fromDate).format("DD MMM")} - {moment(leave.toDate).format("DD MMM YYYY")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                             className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight text-white ${
                              leave.status === "APPROVED"
                                ? "bg-[#00a65a]"
                                : leave.status === "REJECTED"
                                  ? "bg-[#dd4b39]"
                                  : "bg-[#f39c12]"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-[11px] font-bold text-gray-700">
                          {leave.totalDays}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[11px] font-bold text-gray-700">
                            {(() => {
                              const empBal = monthlyReport.find(r => r._id === leave.employeeId?._id);
                              const code = leave.leaveTypeId?.leaveCode;
                              if (code === "EL") return empBal?.elBalance ?? 0;
                              if (code === "CO") return empBal?.coBalance ?? 0;
                              return empBal?.totalBalance ?? 0;
                            })()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-50 px-1.5 py-0.5 rounded">
                            Application
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-gray-500 italic truncate max-w-[150px]" title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td className="px-4 py-3">
                          {leave.status === "PENDING" ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  updateStatus(leave._id, "APPROVED")
                                }
                                className="bg-[#00a65a] text-white px-2 py-1.5 rounded-sm text-[10px] hover:shadow-md transition-all"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(leave._id, "REJECTED")
                                }
                                className="bg-[#dd4b39] text-white px-2 py-1.5 rounded-sm text-[10px] hover:shadow-md transition-all"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold text-gray-300 uppercase italic">
                              Finalized
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Area */}
            <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-50">
              <div className="text-xs text-gray-500">
                Found {(activeTab === "Leave Ledger" ? ledger : filteredLeaves).length} records
              </div>
              <div className="flex border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                <button className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 border-r border-gray-200">
                  Previous
                </button>
                <button className="px-3 py-1.5 text-xs bg-[#3c8dbc] text-white border-r border-gray-200">
                  1
                </button>
                <button className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Comp Off Modal */}
      {showCompOffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md border-t-[3px] border-[#3c8dbc]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Credit Comp Off</h3>
              <button onClick={() => setShowCompOffModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCompOffSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Employee</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#3c8dbc] bg-white"
                  value={compOffData.employeeId}
                  onChange={(e) => setCompOffData({...compOffData, employeeId: e.target.value})}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.employeeName} ({emp.employeeID})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Date Worked</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#3c8dbc]"
                    value={compOffData.dateWorked}
                    onChange={(e) => setCompOffData({...compOffData, dateWorked: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Days to Credit</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#3c8dbc] bg-white"
                    value={compOffData.days}
                    onChange={(e) => setCompOffData({...compOffData, days: e.target.value})}
                  >
                    <option value={1.0}>1.0 Full Day</option>
                    <option value={0.5}>0.5 Half Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Reason / Note</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#3c8dbc] min-h-[80px] resize-none"
                  placeholder="e.g. Worked on Sunday for monthly closing"
                  value={compOffData.reason}
                  onChange={(e) => setCompOffData({...compOffData, reason: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCompOffModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-[#3c8dbc] text-white rounded text-xs font-bold hover:bg-[#367fa9] shadow-sm"
                >
                  Submit Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Leaves;
