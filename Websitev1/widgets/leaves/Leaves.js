"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaFilter,
  FaCheck,
  FaTimes,
  FaFileUpload,
} from "react-icons/fa";
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
                Control panel
              </span>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() =>
                  router.push(`/${loggedInRole}/leaves/bulk-upload`)
                }
                className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-gray-50 shadow-sm flex items-center gap-2"
              >
                <FaFileUpload size={12} /> Bulk Upload
              </button>
              <button
                onClick={() => router.push(`/${loggedInRole}/leaves/apply`)}
                className="bg-[#00a65a] border border-[#008d4c] text-white px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-[#008d4c] shadow-sm flex items-center gap-2"
              >
                <FaPlus size={12} /> Apply Leave
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
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight opacity-50">
                  {activeTab}
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
                      <div className="flex items-center justify-between">
                        Employee
                        <MdFilterList className="text-gray-300" />
                      </div>
                    </th>
                    <th className="px-5 py-3 text-[12px] font-bold text-gray-700 border-b border-gray-200 border-r border-gray-100 last:border-r-0">
                      <div className="flex items-center justify-between">
                        Leave Details
                        <MdFilterList className="text-gray-300" />
                      </div>
                    </th>
                    <th className="px-5 py-3 text-[12px] font-bold text-gray-700 border-b border-gray-200 border-r border-gray-100 last:border-r-0">
                      <div className="flex items-center justify-between">
                        {activeTab === "Leave Ledger"
                          ? "Action & Balance"
                          : "Statement of Reason"}
                        <MdFilterList className="text-gray-300" />
                      </div>
                    </th>
                    <th className="px-5 py-3 text-[12px] font-bold text-gray-700 border-b border-gray-200 border-r border-gray-100 last:border-r-0">
                      <div className="flex items-center justify-between">
                        {activeTab === "Leave Ledger"
                          ? "Ref"
                          : "Submission Datetime"}
                        <MdFilterList className="text-gray-300" />
                      </div>
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
                        No data available in table
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
                            <div className="text-[10px] text-gray-400 uppercase">
                              {item.employeeId?.employeeID || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div className="text-[11px] font-bold text-[#00a65a]">
                            {item.leaveTypeId?.leaveTypeName || "Leave"}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {moment(item.createdAt).format("DD MMM YYYY")}
                          </div>
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100 text-xs">
                          <span
                            className={
                              item.days > 0
                                ? "text-[#00a65a] font-bold"
                                : "text-[#dd4b39] font-bold"
                            }
                          >
                            {item.days > 0 ? "+" : ""}
                            {item.days} ({item.transactionType})
                          </span>
                          <div className="text-[10px] text-gray-400 mt-1">
                            Bal After: {item.balanceAfter}
                          </div>
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div className="text-xs text-gray-500 italic max-w-[200px] truncate">
                            {item.remarks}
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
                          <div className="text-[11px] text-gray-800 font-bold">
                            {moment(leave.fromDate).format("DD MMM YYYY")} -{" "}
                            {moment(leave.toDate).format("DD MMM YYYY")}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1 uppercase">
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
                                className="bg-[#00a65a] text-white px-2 py-1 rounded-sm text-[10px] hover:bg-[#008d4c]"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(leave._id, "REJECTED")
                                }
                                className="bg-[#dd4b39] text-white px-2 py-1 rounded-sm text-[10px] hover:bg-[#d73925]"
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

            {/* Footer / Pagination Area */}
            <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-xs text-gray-700">
                Showing 1 to{" "}
                {
                  (activeTab === "Leave Ledger" ? ledger : filteredLeaves)
                    .length
                }{" "}
                of{" "}
                {
                  (activeTab === "Leave Ledger" ? ledger : filteredLeaves)
                    .length
                }{" "}
                entries
              </div>
              <div className="flex border border-gray-300 rounded-sm overflow-hidden">
                <button className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 border-r border-gray-300">
                  Previous
                </button>
                <button className="px-3 py-1.5 text-xs bg-[#3c8dbc] text-white border-r border-gray-300">
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
    </section>
  );
};

export default Leaves;
