"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaFilter, FaCheck, FaTimes, FaFileUpload } from "react-icons/fa";
import { MdHistory, MdFilterList } from "react-icons/md";
import moment from "moment";
import { useRouter, usePathname } from "next/navigation";

const Leaves = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = React.useState("admin");
  const [activeTab, setActiveTab] = useState("Pending Requests");
  const [leaves, setLeaves] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname?.includes("admin")) setLoggedInRole("admin");
    else if (pathname?.includes("center")) setLoggedInRole("center");
    fetchLeaves();
    fetchLedger();
  }, [pathname]);

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
      const res = await axios.get("/api/leave-ledger");
      if (res.data.success) {
        setLedger(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ledger:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/leave-applications/${id}`, { status });
      fetchLeaves();
      fetchLedger();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (activeTab === "Pending Requests") return leave.status === "PENDING";
    if (activeTab === "Approved") return leave.status === "APPROVED";
    if (activeTab === "Rejected") return leave.status === "REJECTED";
    if (activeTab === "Leave Ledger") return true; // Show all for ledger view
    return true; // All Records
  });

  return (
    <main className="section p-6 md:p-10 bg-white min-h-screen">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-green-600">Administrative Suite</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Leave <span className="text-green-600 font-black">Management</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3 mt-6 md:mt-0 mb-1">
              <button
                onClick={() => router.push(`/${loggedInRole}/leaves/bulk-upload`)}
                className="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-100 hover:border-slate-200 px-6 py-3.5 rounded-2xl shadow-sm transition-all active:scale-95 font-black uppercase tracking-[0.2em] text-[10px]"
              >
                <FaFileUpload size={12} /> Bulk Upload
              </button>
              <button
                onClick={() => router.push(`/${loggedInRole}/leaves/apply`)}
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-2xl shadow-xl shadow-green-500/20 transition-all active:scale-95 font-black uppercase tracking-[0.2em] text-[10px]"
              >
                <FaPlus size={12} /> Apply Leave
              </button>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-[11px] leading-relaxed mt-3 pl-1">
            Oversee employee applications, monitor leave balances, and manage organizational time-off policies with real-time approvals.
          </p>
        </header>

        <div className="bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm overflow-hidden flex flex-col">
          {/* Navigation Tabs */}
          <div className="flex bg-slate-50/50 border-b border-slate-100 px-6 pt-2">
            {["Pending Requests", "Approved", "Rejected", "Leave Ledger", "All Records"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                  activeTab === tab ? "text-green-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
                {tab === "Pending Requests" && leaves.filter(l => l.status === "PENDING").length > 0 && (
                  <span className="ml-3 bg-green-600 text-white px-2 py-0.5 rounded-lg text-[9px] shadow-lg shadow-green-500/20 animate-pulse">
                    {leaves.filter(l => l.status === "PENDING").length}
                  </span>
                )}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-green-600 rounded-t-full shadow-[0_-4px_8px_rgba(22,163,74,0.3)]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
            <div className="relative w-full md:w-80 group">
              <FaFilter className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-green-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search by employee name..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all outline-none"
              />
            </div>
            
            <div className="flex items-center gap-3">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                 Syncing: Active
               </span>
            </div>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Leave Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">{activeTab === "Leave Ledger" ? "Action & Balance" : "Statement of Reason"}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">{activeTab === "Leave Ledger" ? "Ref" : "Submission Datetime"}</th>
                {activeTab !== "Leave Ledger" && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Operational Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-400 text-[11px] font-black uppercase tracking-widest opacity-50">Synchronizing records...</td>
                </tr>
              ) : (activeTab === "Leave Ledger" ? ledger : filteredLeaves).length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-400 text-[11px] font-black uppercase tracking-widest opacity-50">No Data Available</td>
                </tr>
              ) : activeTab === "Leave Ledger" ? (
                ledger.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold text-[11px] tracking-tighter border-2 border-slate-50 shadow-sm group-hover:bg-white group-hover:border-slate-100 transition-all">
                          {item.employeeId?.employeeName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-green-700 transition-colors">{item.employeeId?.employeeName || "Unknown"}</div>
                          <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{item.employeeId?.employeeID || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[9px] font-black uppercase tracking-[0.1em] text-green-600 mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        {item.leaveTypeId?.leaveTypeName || "Leave"}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                        <span className="opacity-50 tracking-tighter uppercase text-[8px] font-black">Transaction:</span>
                        {moment(item.createdAt).format("DD MMM YYYY")}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`text-xs font-black tracking-tight ${item.days > 0 ? "text-green-600" : "text-rose-600"}`}>
                        {item.days > 0 ? "+" : ""}{item.days} Days ({item.transactionType})
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1">Bal After: <span className="text-slate-800">{item.balanceAfter}</span></div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[11px] font-medium text-slate-500 italic max-w-[180px] truncate group-hover:text-slate-700 transition-colors">{item.remarks}</div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-green-600 font-black border-2 border-slate-100 shadow-sm group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all duration-300">
                          {leave.employeeId?.employeeName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-green-700 transition-colors">{leave.employeeId?.employeeName || "Unknown"}</div>
                          <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                            {leave.employeeId?.employeeID || "N/A"} <span className="mx-1 text-slate-200">•</span> {leave.employeeId?.employeeDesignation || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="mb-2">
                         <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                           leave.leaveTypeId?.leaveTypeName === "Sick Leave" ? "bg-rose-50 text-rose-600 border-rose-100" :
                           leave.leaveTypeId?.leaveTypeName === "Annual Leave" ? "bg-teal-50 text-teal-600 border-teal-100" :
                           "bg-indigo-50 text-indigo-600 border-indigo-100"
                         }`}>
                          {leave.leaveTypeId?.leaveTypeName || "Leave"}
                        </span>
                      </div>
                      <div className="text-[11px] font-black text-slate-800 tracking-tight">
                        {moment(leave.fromDate).format("DD MMM YYYY")} - {moment(leave.toDate).format("DD MMM YYYY")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1.5 uppercase tracking-widest">
                        <span className="p-1 bg-slate-50 rounded-md border border-slate-100"><MdHistory size={10} className="text-slate-400" /></span>
                        {leave.totalDays} Computed Days
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2 max-w-[240px] italic group-hover:text-slate-800 transition-colors tracking-tight">
                        "{leave.reason}"
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2.5">
                        {moment(leave.createdAt).format("DD MMM YYYY")}
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm ${
                        leave.status === "PENDING" ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20" :
                        leave.status === "APPROVED" ? "bg-green-600 text-white border-green-700 shadow-green-600/20" :
                        "bg-red-600 text-white border-red-700 shadow-red-600/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${leave.status === "PENDING" ? "bg-white animate-pulse" : "bg-white/40"}`}></span>
                        {leave.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {leave.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(leave._id, "APPROVED")}
                            className="w-10 h-10 rounded-2xl bg-white text-green-600 border-2 border-slate-100 hover:bg-green-600 hover:text-white hover:border-green-600 flex items-center justify-center transition-all shadow-sm active:scale-90"
                            title="Authorize Request"
                          >
                            <FaCheck size={12} />
                          </button>
                          <button
                            onClick={() => updateStatus(leave._id, "REJECTED")}
                            className="w-10 h-10 rounded-2xl bg-white text-rose-500 border-2 border-slate-100 hover:bg-rose-600 hover:text-white hover:border-rose-600 flex items-center justify-center transition-all shadow-sm active:scale-90"
                            title="Deny Request"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic bg-slate-50/50 px-4 py-2 rounded-xl border border-slate-100/50 inline-block">Finalized</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
);
};

export default Leaves;
