"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaBook,
  FaChevronRight,
  FaEllipsisH,
  FaPlus,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import TicketChat from "@/components/admin/helpdesk/TicketChat";
import moment from "moment";
import ls from "localstorage-slim";

const Helpdesk = () => {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchTickets();
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/tickets/list");
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    All: tickets.length,
    Open: tickets.filter((t) => t.status === "Open").length,
    Resolved: tickets.filter(
      (t) => t.status === "Resolved" || t.status === "Closed",
    ).length,
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employeeId?.employeeName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "Open"
        ? t.status === "Open"
        : activeTab === "Resolved"
          ? t.status === "Resolved" || t.status === "Closed"
          : true;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-sky-50 text-[#3c8dbc] border-sky-100";
      case "In Progress":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "Resolved":
      case "Closed":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <section className="section admin-box box-primary">
      <div className="hr-card flex flex-col h-[calc(100vh-120px)] animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Helpdesk <span className="text-[#3c8dbc]">Management</span>
          </h1>
          <p className="text-slate-400 text-[13px] mt-0.5">
            Manage and resolve employee inquiries regarding payroll, attendance,
            and leaves.
          </p>
        </div>
        <div className="relative group">
          <button
            onClick={() => router.push("/admin/helpdesk/add")}
            className="w-10 h-10 flex items-center justify-center bg-[#3c8dbc] text-white rounded-lg shadow-sm hover:bg-[#367fa9] transition-all active:scale-95 group"
          >
            <FaPlus size={14} />
          </button>
          {/* Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Create Ticket
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
          </div>
        </div>
      </div>

      <main className="flex flex-1 gap-5 overflow-hidden">
        {/* Left Ticket List Panel (25%) */}
        <div
          className={`w-full lg:w-[28%] bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col transition-all duration-300 ${
            isMobile && selectedTicket ? "hidden" : "flex"
          }`}
        >
          <div className="p-4 flex flex-col h-full gap-4">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                size={12}
              />
              <input
                type="text"
                placeholder="Search tickets, employees..."
                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 focus:border-[#3c8dbc] focus:bg-white rounded-lg text-[11px] text-slate-600 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1">
              {["All", "Open", "Resolved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all ${
                    activeTab === tab
                      ? "bg-[#3c8dbc] text-white"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Ticket List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-1 pr-1 space-y-3 pb-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-6 h-6 border-2 border-[#3c8dbc] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Loading...
                  </span>
                </div>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 group relative border ${
                      selectedTicket?._id === t._id
                        ? "bg-sky-50/40 border-[#3c8dbc]"
                        : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold shadow-sm ${
                          selectedTicket?._id === t._id
                            ? "bg-[#3c8dbc] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t.employeeId?.employeeName?.charAt(0) || "E"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="text-[12px] font-bold text-slate-700 truncate">
                            {t.employeeId?.employeeName}
                          </span>
                          <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap ml-2">
                            {moment(t.createdAt).fromNow()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] font-bold text-slate-400">
                            TKT-{t.ticketID?.split("-")[1] || t.ticketID}
                          </span>
                          <span className="text-[9px] font-medium text-slate-400 truncate tracking-tight">
                            {t.category}
                          </span>
                        </div>
                        <h3 className="text-[12px] font-medium text-slate-600 mb-2 truncate leading-tight">
                          {t.subject}
                        </h3>
                        <div
                          className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${getStatusBadge(t.status)}`}
                        >
                          {t.status}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-20 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200">
                    <FaBook size={16} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-300">
                    No tickets found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Ticket Conversation Panel (75%) */}
        <div
          className={`flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 ${
            isMobile && !selectedTicket ? "hidden" : "flex"
          }`}
        >
          {selectedTicket ? (
            <TicketChat
              ticket={selectedTicket}
              onRefresh={fetchTickets}
              onBack={() => setSelectedTicket(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/5">
              <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl mb-4 flex items-center justify-center shadow-sm">
                <FaBook size={24} className="text-slate-100" />
              </div>
              <h3 className="text-slate-700 font-bold text-base mb-1">
                Support Center
              </h3>
              <p className="text-slate-400 text-[11px] font-medium">
                Select a ticket from the list to view details
              </p>
            </div>
          )}
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </main>
      </div>
    </section>
  );
};

export default Helpdesk;
