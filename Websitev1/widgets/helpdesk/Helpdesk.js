"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaSearch } from "react-icons/fa";
import CreateTicketModal from "@/components/admin/helpdesk/CreateTicketModal";
import TicketChat from "@/components/admin/helpdesk/TicketChat";
import moment from "moment";
import ls from "localstorage-slim";

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

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.ticketID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || t.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
      {/* Left Sidebar - Ticket List */}
      <div className="w-[400px] flex flex-col bg-white border-r border-gray-100 shadow-[2px_0_8px_rgba(0,0,0,0.02)] z-20">
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight">Helpdesk</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 opacity-70">Manage and resolve inquiries</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
              title="Create Ticket"
            >
              <FaPlus size={16} />
            </button>
          </div>

          <div className="relative mb-5 group">
            <FaSearch className="absolute left-3.5 top-3.5 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search tickets, employees..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {["All", "Open", "In Progress", "Resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all ${
                  activeFilter === f
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-gray-400 font-medium text-sm italic">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-medium text-sm italic">No tickets found</div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTicket(t)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${
                  selectedTicket?._id === t._id
                    ? "bg-blue-50/50 border-blue-200 shadow-sm"
                    : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold shadow-inner overflow-hidden border border-white">
                      {t.employeeId?.employeeName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800 line-clamp-1">{t.employeeId?.employeeName}</div>
                      <div className="text-[10px] text-gray-400 font-mono font-bold">{t.ticketID}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold tabular-nums">{moment(t.createdAt).fromNow(true)} ago</div>
                </div>

                <h4 className="text-sm font-bold text-gray-700 mb-2 line-clamp-1">{t.subject}</h4>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    t.status === "Open" ? "bg-green-100 text-green-700" :
                    t.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                    t.status === "Resolved" ? "bg-gray-100 text-gray-500" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded italic border border-gray-100">{t.category}</span>
                </div>

                {t.priority === "Urgent" && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
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
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default Helpdesk;
