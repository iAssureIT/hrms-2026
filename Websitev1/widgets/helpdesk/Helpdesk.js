"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
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
    <section className="section">
      <main className="flex flex-col h-full bg-[#f4f6f9] overflow-hidden">
        {/* Top Header Section */}
        {/* Top Header Section - Matches Dashboard Breadcrumbs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-normal text-gray-800 tracking-tight">
              Helpdesk
            </h1>
            <span className="text-sm font-light text-gray-500">
              Support tickets
            </span>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {/* <button className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-gray-50 shadow-sm flex items-center gap-2">
            <FaSearch /> Help Center
          </button> */}
            <button
              onClick={() => router.push("/admin/helpdesk/add")}
              className="bg-[#3c8dbc] border border-[#367fa9] text-white px-6 py-1.5 rounded-sm font-normal text-xs hover:bg-[#367fa9] shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <FaPlus size={10} /> Create Ticket
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Sidebar - Ticket List Box */}
          <div
            className={`flex flex-col bg-white border-t-[3px] border-[#3c8dbc] shadow-sm transition-all duration-300 ${
              isMobile && selectedTicket
                ? "absolute -translate-x-full"
                : "relative w-full lg:w-[400px]"
            }`}
          >
            <div className="p-4 border-b border-gray-100 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tickets, employees..."
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-sm text-sm font-normal text-gray-700 focus:outline-none focus:border-[#3c8dbc] transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={12}
                />
              </div>

              <div className="flex items-center gap-1">
                {["All", "Open", "Resolved"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-sm text-[11px] font-bold uppercase transition-all ${
                      activeFilter === filter
                        ? "bg-[#3c8dbc] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Loading tickets...
                  </p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-sm font-bold text-slate-400 italic">
                    No tickets found
                  </p>
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 border-b border-gray-100 transition-all cursor-pointer group flex items-start gap-4 ${
                      selectedTicket?._id === t._id
                        ? "bg-[#f5f5f5]"
                        : "bg-white hover:bg-[#f9f9f9]"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border ${
                        selectedTicket?._id === t._id
                          ? "bg-[#3c8dbc] text-white border-[#3c8dbc]"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {t.employeeId?.employeeName?.charAt(0) || "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-bold text-gray-800 truncate">
                          {t.employeeId?.employeeName}
                        </h4>
                        <span className="text-[10px] font-normal text-gray-400 whitespace-nowrap ml-2">
                          {moment(t.createdAt).fromNow()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-normal text-gray-500 mb-1">
                        <span className="font-bold text-[#3c8dbc]">
                          {t.ticketID}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>{t.category}</span>
                      </div>

                      <p className="text-[11px] text-gray-600 line-clamp-1 mb-2">
                        {t.subject}
                      </p>

                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight text-white ${
                          t.status === "Open"
                            ? "bg-[#00a65a]"
                            : t.status === "In Progress"
                              ? "bg-[#f39c12]"
                              : "bg-gray-400"
                        }`}
                      >
                        {t.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Content - Thread / Details */}
          <div
            className={`flex-1 transition-all duration-300 ${
              isMobile && !selectedTicket ? "hidden" : "flex"
            }`}
          >
            <TicketChat
              ticket={selectedTicket}
              onRefresh={fetchTickets}
              onBack={isMobile ? () => setSelectedTicket(null) : undefined}
            />
          </div>

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
    </section>
  );
};

export default Helpdesk;
