"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaSearch, FaFileImport, FaCog } from "react-icons/fa";
import HolidayCalendar from "@/components/admin/holiday/HolidayCalendar";
import HolidayList from "@/components/admin/holiday/HolidayList";
import AddHolidayModal from "@/components/admin/holiday/AddHolidayModal";
import BulkUploadModal from "@/components/admin/holiday/BulkUploadModal";
import moment from "moment";

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
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
    <div className="min-h-screen bg-[#f8fafc] p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Holiday Management
          </h1>

          <p className="text-sm font-bold text-gray-400 mt-1">
            Configure organizational holidays and location-based calendars.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch
              className="absolute left-4 top-3.5 text-gray-300"
              size={14}
            />
            <input
              type="text"
              placeholder="Search holidays..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all font-medium text-gray-700 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowBulkModal(true)}
            className="p-3.5 bg-white text-gray-500 rounded-2xl border border-gray-100 hover:text-green-600 hover:border-green-100 transition-all shadow-sm active:scale-95"
            title="Bulk Import"
          >
            <FaFileImport size={16} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-green-500/20 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]"
          >
            <FaPlus size={12} /> Add Holiday
          </button>
        </div>
      </div>

      {/* Location Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {locations.map((loc) => (
          <button
            key={loc}
            onClick={() => setSelectedLocation(loc)}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${
              selectedLocation === loc
                ? "bg-gray-800 text-white border-gray-800 shadow-gray-800/20"
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

      {showAddModal && (
        <AddHolidayModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchHolidays();
          }}
        />
      )}

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
  );
};

export default Holidays;
