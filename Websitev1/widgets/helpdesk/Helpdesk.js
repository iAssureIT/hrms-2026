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

const MetricCard = ({
  title,
  value,
  icon: Icon,
  onClick,
  isActive,
  gradient,
  secondaryColor,
  activeGradient,
  activeTextColor,
  activeIndicator,
}) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer group h-[120px] p-[1.5px]
            ${
              isActive
                ? `${activeGradient} shadow-xl scale-[1.02]`
                : "bg-gradient-to-br from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 hover:scale-[1.02] shadow-sm active:scale-95"
            }`}
  >
    <div
      className={`w-full h-full rounded-[22px] p-5 relative overflow-hidden transition-colors duration-500 ${isActive ? "bg-white/95" : "bg-white"}`}
    >
      {/* Subtle Background Icon */}
      <div
        className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 transform group-hover:scale-110 group-hover:-rotate-12 ${secondaryColor}`}
      >
        <Icon size={140} />
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-4">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-[0.2em] block transition-colors duration-300 ${isActive ? activeTextColor : "text-slate-400"}`}
          >
            {title}
          </span>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter items-baseline flex gap-1">
            {value}
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {value > 1 ? "Tickets" : "Ticket"}
            </span>
          </h3>
        </div>
        <div
          className={`p-3.5 rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${gradient} text-white`}
        >
          <Icon size={24} />
        </div>
      </div>

      {/* Active Indicator Pulse */}
      {isActive && (
        <div className="absolute top-3 right-3 flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeIndicator} opacity-75`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${activeIndicator} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
          ></span>
        </div>
      )}
    </div>
  </div>
);

const Helpdesk = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setCurrentUser(details);
    fetchTickets();
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
    <main className="flex flex-col h-[calc(100vh-64px)] bg-slate-50/30 overflow-hidden">
      {/* Top Metric Cards Section */}
      <div className="px-8 pt-8 pb-4">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-8 mb-2">
          <MetricCard
            title="Total Tickets"
            value={counts.All}
            icon={HiChatBubbleLeftRight}
            secondaryColor="text-amber-600"
            gradient="bg-gradient-to-br from-amber-400 to-amber-600"
            activeGradient="bg-gradient-to-br from-amber-400 to-amber-600"
            activeTextColor="text-amber-600"
            activeIndicator="bg-amber-500"
            isActive={activeFilter === "All"}
            onClick={() => setActiveFilter("All")}
          />
          <MetricCard
            title="Open"
            value={counts.Open}
            icon={HiDocumentText}
            secondaryColor="text-teal-600"
            gradient="bg-gradient-to-br from-teal-500 to-teal-700"
            activeGradient="bg-gradient-to-br from-teal-400 to-teal-600"
            activeTextColor="text-teal-600"
            activeIndicator="bg-teal-500"
            isActive={activeFilter === "Open"}
            onClick={() => setActiveFilter("Open")}
          />
          <MetricCard
            title="In Progress"
            value={counts["In Progress"]}
            icon={HiClock}
            secondaryColor="text-rose-600"
            gradient="bg-gradient-to-br from-rose-400 to-rose-600"
            activeGradient="bg-gradient-to-br from-rose-400 to-rose-600"
            activeTextColor="text-rose-600"
            activeIndicator="bg-rose-500"
            isActive={activeFilter === "In Progress"}
            onClick={() => setActiveFilter("In Progress")}
          />
          <MetricCard
            title="Resolved"
            value={counts.Resolved}
            icon={HiCheckCircle}
            secondaryColor="text-cyan-600"
            gradient="bg-gradient-to-br from-cyan-500 to-cyan-700"
            activeGradient="bg-gradient-to-br from-cyan-400 to-cyan-600"
            activeTextColor="text-cyan-600"
            activeIndicator="bg-cyan-500"
            isActive={activeFilter === "Resolved"}
            onClick={() => setActiveFilter("Resolved")}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Ticket List */}
        <div className="w-[400px] flex flex-col bg-white border-r border-slate-100 shadow-[2px_0_12px_rgba(0,0,0,0.03)] z-20 relative">
          <div className="p-10 pb-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">
                  <span className="w-5 h-[2px] bg-green-600"></span> Management
                  Suite
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  Help<span className="text-green-600">desk</span>
                </h1>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-2xl shadow-xl shadow-green-500/30 transition-all active:scale-95 border-2 border-green-500"
                title="Create Ticket"
              >
                <FaPlus size={16} />
              </button>
            </div>

            <div className="relative mb-0 group">
              <FaSearch
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="Search ticket subjects, IDs..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-8 focus:ring-green-500/5 focus:border-green-500/20 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="text-center py-24 text-slate-300 font-black text-[10px] uppercase tracking-widest italic animate-pulse">
                Synchronizing conversation...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-24 text-slate-300 font-black text-[10px] uppercase tracking-widest italic">
                No tickets found
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-6 rounded-[2.2rem] border-2 transition-all cursor-pointer relative group ${
                    selectedTicket?._id === t._id
                      ? "bg-green-50/40 border-green-200/50 shadow-sm"
                      : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-green-600 font-black border-2 border-slate-100 shadow-sm group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all duration-300">
                        {t.employeeId?.employeeName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-green-700 transition-colors">
                          {t.employeeId?.employeeName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight mt-0.5">
                          {t.ticketID}
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-300 font-black uppercase tracking-widest tabular-nums">
                      {moment(t.createdAt).fromNow(true)} ago
                    </div>
                  </div>

                  <h4 className="text-[13px] font-black text-slate-700 mb-4 line-clamp-1 italic tracking-tight italic opacity-90 group-hover:opacity-100 group-hover:text-slate-900 transition-all">
                    "{t.subject}"
                  </h4>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm ${
                        t.status === "Open"
                          ? "bg-green-600 text-white border-green-700 shadow-green-600/20"
                          : t.status === "In Progress"
                            ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20"
                            : "bg-white text-slate-400 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${t.status === "Open" ? "bg-white animate-pulse" : "bg-white/40"}`}
                      ></span>
                      {t.status}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      {t.category}
                    </span>
                  </div>

                  {t.priority === "Urgent" && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content - Thread / Details */}
        <TicketChat ticket={selectedTicket} onRefresh={fetchTickets} />

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
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #f1f5f9;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #e2e8f0;
          }
        `}</style>
      </div>
    </main>
  );
};

export default Helpdesk;
