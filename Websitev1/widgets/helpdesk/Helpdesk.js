"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaSearch } from "react-icons/fa";
import CreateTicketModal from "@/components/admin/helpdesk/CreateTicketModal";
import TicketChat from "@/components/admin/helpdesk/TicketChat";
import moment from "moment";
import ls from "localstorage-slim";
import {
  MdChat,
  MdAssignment,
  MdPendingActions,
  MdCheckCircle,
} from "react-icons/md";
import {
  HiChatBubbleLeftRight,
  HiDocumentText,
  HiClock,
  HiCheckCircle,
} from "react-icons/hi2";

// MetricCard removed to match Screenshot 2 design

const Helpdesk = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setCurrentUser(details);
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
    "In Progress": tickets.filter((t) => t.status === "In Progress").length,
    Resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || t.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Top Header Section */}
      <div className="px-6 py-8 md:px-10 border-b border-slate-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Helpdesk</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage and resolve employee inquiries regarding payroll, attendance, and leaves.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 active:scale-95"
          >
            <FaPlus size={14} /> Create Ticket
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Ticket List */}
        <div
          className={`flex flex-col bg-white border-r border-slate-100 z-20 transition-all duration-300 ${
            isMobile && selectedTicket ? "absolute -translate-x-full" : "relative w-full lg:w-[420px]"
          }`}
        >
          <div className="p-6 md:p-8 space-y-6">
            <div className="relative group">
              <FaSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="Search tickets, employees..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/40 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              {["All", "Open", "Resolved"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeFilter === filter
                      ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-sm font-bold text-slate-400 italic">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4 ${
                    selectedTicket?._id === t._id
                      ? "bg-green-50/50 border-green-300/50 ring-1 ring-green-300/20"
                      : "bg-white border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold border-2 ${
                    selectedTicket?._id === t._id ? "bg-green-600 text-white border-green-500" : "bg-slate-100 text-slate-500 border-white"
                  }`}>
                    {t.employeeId?.employeeName?.charAt(0) || "U"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-green-700 transition-colors">
                        {t.employeeId?.employeeName}
                      </h4>
                      <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                        {moment(t.createdAt).fromNow()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mb-2">
                      <span className="uppercase">{t.ticketID}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{t.category}</span>
                    </div>

                    <p className="text-xs font-medium text-slate-600 line-clamp-1 mb-3">
                      {t.subject}
                    </p>

                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                      t.status === "Open"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : t.status === "In Progress"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${t.status === "Open" ? "bg-green-600 animate-pulse" : "bg-current opacity-40"}`}></div>
                      {t.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content - Thread / Details */}
        <div className={`flex-1 transition-all duration-300 ${
          isMobile && !selectedTicket ? "hidden" : "flex"
        }`}>
          <TicketChat 
            ticket={selectedTicket} 
            onRefresh={fetchTickets} 
            onBack={isMobile ? () => setSelectedTicket(null) : undefined}
          />
        </div>

        {showCreateModal && (
          <CreateTicketModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchTickets();
            }}
          />
        )}

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 20px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
        `}</style>
      </div>
    </main>
  );
};

export default Helpdesk;
