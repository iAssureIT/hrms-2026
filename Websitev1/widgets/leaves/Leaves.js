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
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fetchLeaves();
    fetchLedger();
  }, [pathname]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchSummary(selectedEmployee);
    } else {
      setSummary(null);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/employees/get");
      if (Array.isArray(res.data)) setEmployees(res.data);
      else if (res.data?.data) setEmployees(res.data.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
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

  const fetchLedger = async () => {
    try {
      const url = selectedEmployee 
        ? `/api/leave-ledger/employee/${selectedEmployee}`
        : "/api/leave-ledger";
      const res = await axios.get(url);
      if (res.data.success) {
        setLedger(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ledger:", err);
    }
  };

  const fetchSummary = async (empId) => {
    try {
      const res = await axios.get(`/api/leave-balance/summary/${empId}`);
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

          {/* Leave Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 border-l-4 border-[#00a65a] shadow-sm rounded-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Earned Leaves (EL)</span>
                <FaHistory className="text-[#00a65a] opacity-30" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-gray-800">{summary?.earnedLeave?.balance || 0}</div>
                <div className="text-[10px] text-gray-400">Available</div>
              </div>
              <div className="mt-2 text-[10px] flex gap-3">
                <span className="text-gray-500">Earned: <b className="text-gray-700">{summary?.earnedLeave?.earned || 0}</b></span>
                <span className="text-gray-500">Used: <b className="text-gray-700">{summary?.earnedLeave?.used || 0}</b></span>
              </div>
            </div>

            <div className="bg-white p-4 border-l-4 border-[#3c8dbc] shadow-sm rounded-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comp Offs (CO)</span>
                <FaCalendarCheck className="text-[#3c8dbc] opacity-30" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-gray-800">{summary?.compOff?.balance || 0}</div>
                <div className="text-[10px] text-gray-400">Available</div>
              </div>
              <div className="mt-2 text-[10px] flex gap-3">
                <span className="text-gray-500">Earned: <b className="text-gray-700">{summary?.compOff?.earned || 0}</b></span>
                <span className="text-gray-500">Used: <b className="text-gray-700">{summary?.compOff?.used || 0}</b></span>
              </div>
            </div>

            <div className="bg-white p-4 border-l-4 border-[#f39c12] shadow-sm rounded-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total balance</span>
                <FaClock className="text-[#f39c12] opacity-30" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-gray-800">{summary?.totalBalance || 0}</div>
                <div className="text-[10px] text-gray-400">Days</div>
              </div>
              <div className="mt-2 text-[10px] text-gray-400 italic">Across all categories</div>
            </div>

            <div className="bg-white p-4 border-t-2 border-gray-100 shadow-sm rounded-sm flex flex-col justify-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-2">Filter by Employee</label>
              <div className="relative">
                <FaUser className="absolute left-2 top-2.5 text-gray-300 text-[10px]" />
                <select 
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded text-[11px] font-bold text-gray-600 focus:outline-none focus:border-[#3c8dbc] bg-gray-50"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                  ))}
                </select>
              </div>
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
                />
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse border-b border-gray-200">
                <thead className="bg-[#f9f9f9]">
                  <tr>
                    <th className="px-5 py-3 text-[12px] font-bold text-gray-700 border-b border-gray-200 border-r border-gray-100 last:border-r-0">
                      Employee
                    </th>
                    <th className="px-5 py-3 text-[12px] font-bold text-gray-700 border-b border-gray-200 border-r border-gray-100 last:border-r-0">
                      Leave Details
                    </th>
                    <th className="px-5 py-3 text-[12px] font-bold text-gray-700 border-b border-gray-200 border-r border-gray-100 last:border-r-0">
                      {activeTab === "Leave Ledger"
                        ? "Transaction"
                        : "Reason"}
                    </th>
                    <th className="px-5 py-3 text-[12px] font-bold text-gray-700 border-b border-gray-200 border-r border-gray-100 last:border-r-0">
                      {activeTab === "Leave Ledger"
                        ? "Balance Info"
                        : "Submission"}
                    </th>
                    {activeTab !== "Leave Ledger" && (
                      <th className="px-5 py-3 text-[12px] font-bold text-gray-700 border-b border-gray-200">
                        Actions
                      </th>
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
                  ) : (activeTab === "Leave Ledger" ? ledger : filteredLeaves)
                      .length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-20 text-center text-gray-400 text-xs italic"
                      >
                        No records found {selectedEmployee ? "for this employee" : ""}
                      </td>
                    </tr>
                  ) : activeTab === "Leave Ledger" ? (
                    ledger.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-[#f5f5f5] transition-colors border-b border-gray-100"
                      >
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div>
                            <div className="text-xs font-bold text-gray-700">
                              {item.employeeId?.employeeName || "Unknown"}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {item.employeeId?.employeeID || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div className="text-[11px] font-bold text-gray-700">
                            {item.leaveTypeId?.leaveTypeName || "Leave"}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {moment(item.transactionDate).format("DD MMM YYYY")}
                          </div>
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100 text-xs">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`font-bold inline-block px-1.5 py-0.5 rounded-sm text-[10px] w-fit ${
                                item.days > 0
                                  ? "bg-green-50 text-[#00a65a] border border-green-100"
                                  : "bg-red-50 text-[#dd4b39] border border-red-100"
                              }`}
                            >
                              {item.days > 0 ? "+" : ""}
                              {item.days} ({item.transactionType})
                            </span>
                            <div className="text-[10px] text-gray-500 italic truncate max-w-[200px]">
                              {item.remarks}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div className="text-xs font-bold text-[#3c8dbc]">
                            {item.balanceAfter} <span className="text-[9px] text-gray-400 font-normal">Available</span>
                          </div>
                          <div className="text-[9px] text-gray-300 uppercase font-bold mt-1">
                            Ref: {item.referenceType}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredLeaves.map((leave) => (
                      <tr
                        key={leave._id}
                        className="hover:bg-[#f5f5f5] transition-colors border-b border-gray-100"
                      >
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div className="text-xs font-bold text-gray-700">
                            {leave.employeeId?.employeeName || "Unknown"}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {leave.employeeId?.employeeID || "N/A"}
                          </div>
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div className="text-xs font-bold text-gray-600 mb-1">
                            {leave.leaveTypeId?.leaveTypeName || "Leave"}
                          </div>
                          <div className="text-[11px] text-gray-800 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit">
                            {moment(leave.fromDate).format("DD MMM")} - {moment(leave.toDate).format("DD MMM YYYY")}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                            {leave.totalDays} Days
                          </div>
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div className="text-xs text-gray-500 italic line-clamp-2 max-w-[250px]">
                            "{leave.reason}"
                          </div>
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div className="text-[11px] text-gray-400 mb-2">
                            {moment(leave.createdAt).format("DD MMM YYYY")}
                          </div>
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
                        <td className="px-5 py-3">
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
                            <span className="text-[10px] font-bold text-gray-300 uppercase italic">
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
