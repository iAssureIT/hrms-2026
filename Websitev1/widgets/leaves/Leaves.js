"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaFilter, FaCheck, FaTimes } from "react-icons/fa";
import ApplyLeaveModal from "@/components/admin/leaves/ApplyLeaveModal";
import moment from "moment";

const Leaves = () => {
  const [activeTab, setActiveTab] = useState("Pending Requests");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
    fetchLedger();
  }, []);

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
      await axios.patch(`/api/leave-applications/update-status/${id}`, { status });
      fetchLeaves();
      fetchLedger();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (activeTab === "Pending Requests") return leave.status === "PENDING";
    if (activeTab === "Leave Ledger") return true; // Show all for ledger view
    return true; // All Records
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-500 text-sm">Review applications, manage leave balances, and log offline requests.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
        >
          <FaPlus size={14} /> Apply Leave
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-4">
          {["Pending Requests", "Leave Ledger", "All Records"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-green-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {tab === "Pending Requests" && leaves.filter(l => l.status === "PENDING").length > 0 && (
                <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                  {leaves.filter(l => l.status === "PENDING").length}
                </span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search employee..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 px-3 py-2 border border-gray-200 rounded-lg hover:bg-white transition-all shadow-sm">
            <FaFilter className="text-gray-400" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Details</th>
                <th className="px-6 py-4">{activeTab === "Leave Ledger" ? "Action & Balance" : "Reason"}</th>
                <th className="px-6 py-4">{activeTab === "Leave Ledger" ? "Ref" : "Applied On"}</th>
                {activeTab !== "Leave Ledger" && <th className="px-6 py-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : (activeTab === "Leave Ledger" ? ledger : filteredLeaves).length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No records found</td>
                </tr>
              ) : activeTab === "Leave Ledger" ? (
                ledger.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold overflow-hidden text-xs">
                          {item.employeeId?.employeeName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{item.employeeId?.employeeName || "Unknown"}</div>
                          <div className="text-[10px] text-gray-500 font-mono uppercase">{item.employeeId?.employeeID || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-bold uppercase text-green-600 mb-1">
                        {item.leaveTypeId?.leaveTypeName || "Leave"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Transaction: {moment(item.createdAt).format("MMM DD, YYYY")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-bold ${item.days > 0 ? "text-green-600" : "text-red-500"}`}>
                        {item.days > 0 ? "+" : ""}{item.days} Days ({item.transactionType})
                      </div>
                      <div className="text-xs text-gray-400">Bal After: {item.balanceAfter}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{item.remarks}</div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold overflow-hidden">
                          {leave.employeeId?.employeeName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{leave.employeeId?.employeeName || "Unknown"}</div>
                          <div className="text-xs text-gray-500">{leave.employeeId?.employeeID || "N/A"} • {leave.employeeId?.employeeDesignation || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1 bg-red-100 text-red-600">
                        {leave.leaveTypeId?.leaveTypeName || "Leave"}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {moment(leave.fromDate).format("MMM DD, YYYY")} - {moment(leave.toDate).format("MMM DD, YYYY")}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {leave.totalDays} Days
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">{leave.reason}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">{moment(leave.createdAt).format("MMM DD, YYYY")}</div>
                      <div className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        leave.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        leave.status === "APPROVED" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {leave.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(leave._id, "APPROVED")}
                            className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all"
                            title="Approve"
                          >
                            <FaCheck size={12} />
                          </button>
                          <button
                            onClick={() => updateStatus(leave._id, "REJECTED")}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"
                            title="Reject"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">No actions</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            fetchLeaves();
          }}
        />
      )}
    </div>
  );
};

export default Leaves;
