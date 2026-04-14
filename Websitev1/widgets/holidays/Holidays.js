"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaSearch, FaFileImport, FaCog } from "react-icons/fa";
import HolidayCalendar from "@/components/admin/holiday/HolidayCalendar";
import HolidayList from "@/components/admin/holiday/HolidayList";
import moment from "moment";
import { useRouter } from "next/navigation";

const Holidays = () => {
  const router = useRouter();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [currentYear, setCurrentYear] = useState(moment().year());

  const locations = ["All", "Global", "New York", "London", "Bangalore"];

  useEffect(() => {
    fetchHolidays();
  }, [selectedLocation, currentYear]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/holidays/list", {
        params: { location: selectedLocation, year: currentYear },
      });
      if (res.data.success) {
        setHolidays(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHolidays = holidays.filter((h) =>
    h.holidayName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const upcomingHolidays = filteredHolidays.filter((h) =>
    moment(h.date).isAfter(moment().subtract(1, "day")),
  );

  return (
    <div className="section p-6 md:p-10 bg-white min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-green-600">Holiday Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Organizational <span className="text-green-600 font-black">Calendar</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0 mb-1">
              <div className="relative w-64 group">
                <FaSearch
                  className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-green-500 transition-colors"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search holidays..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all font-bold text-slate-700 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowBulkModal(true)}
                className="p-3.5 bg-white text-slate-400 rounded-2xl border border-slate-100 hover:text-green-600 hover:border-green-100 hover:bg-green-50 transition-all shadow-sm active:scale-95"
                title="Bulk Import"
              >
                <FaFileImport size={16} />
              </button>
              <button
                onClick={() => router.push("/admin/holidays/add")}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-green-500/20 transition-all active:scale-95 font-black uppercase tracking-[0.2em] text-[10px]"
              >
                <FaPlus size={12} /> Add Holiday
              </button>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-[11px] leading-relaxed mt-3 pl-1">
            Configure organizational holidays, location-based calendars, and regional time-off policies with real-time tracking and planning.
          </p>
        </div>

      {/* Location Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {locations.map((loc) => (
          <button
            key={loc}
            onClick={() => setSelectedLocation(loc)}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${
              selectedLocation === loc
                ? "bg-green-600 text-white border-green-600 shadow-green-500/20"
                : "bg-white text-gray-500 border-transparent hover:border-gray-200"
            }`}
          >
            {loc === "All"
              ? "📍 All Locations"
              : loc === "Global"
                ? "🌍 Global"
                : `🏙️ ${loc}`}
          </button>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* Left Sidebar - Upcoming Holidays */}
        <div className="xl:col-span-4 h-[700px]">
          <HolidayList holidays={upcomingHolidays} loading={loading} />
        </div>

        {/* Center/Right - Calendar View */}
        <div className="xl:col-span-8 h-[700px]">
          <HolidayCalendar holidays={filteredHolidays} />
        </div>
      </div>

      {showBulkModal && (
        <BulkUploadModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false);
            fetchHolidays();
          }}
        />
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  </div>
);
};

export default Holidays;
