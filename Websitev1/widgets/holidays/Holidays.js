"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tooltip } from "flowbite-react";
import { FaPlus, FaSearch, FaFileUpload, FaHome } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";
import {
  HiMapPin,
  HiGlobeAlt,
  HiBuildingOffice2,
} from "react-icons/hi2";
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
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [locations, setLocations] = useState(["All", "Global"]);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [selectedLocation, currentYear]);

  const fetchLocations = async () => {
    try {
      const res = await axios.get("/api/centers/list");
      if (res.data) {
        setLocations(["All", "Global", ...res.data.map((c) => c.centerName)]);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

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
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* AdminLTE style Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-normal text-gray-800 tracking-tight">
              Calendar
            </h1>
            <span className="text-sm font-light text-gray-500">
              Control panel
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-normal text-gray-700 mt-4 md:mt-0">
            <FaHome className="text-gray-400" />
            <span>Home</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-400">Calendar</span>
          </div>
        </div>

        {/* Action Buttons Box */}
        <div className="bg-white border-t-[3px] border-[#d2d6de] shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Holiday Management</h3>
              <p className="text-[10px] text-gray-400 mt-1">Configure organizational calendars and regional policies</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/admin/holidays/add")}
                className="bg-[#3c8dbc] border border-[#367fa9] text-white px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-[#367fa9] shadow-sm flex items-center gap-2"
              >
                <FaPlus size={10} /> Add Holiday
              </button>
              <button
                onClick={() => router.push("/admin/holidays/bulk-upload")}
                className="bg-[#00a65a] border border-[#008d4c] text-white px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-[#008d4c] shadow-sm flex items-center gap-2"
              >
                <FaFileUpload size={10} /> Bulk Upload
              </button>
              <button
                onClick={() => router.push("/admin/holidays")}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-gray-50 shadow-sm flex items-center gap-2"
              >
                <CiViewList size={14} /> Registry
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50/50">
            <div className="relative w-full md:w-72 group">
              <FaSearch
                className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-[#3c8dbc] transition-colors"
                size={12}
              />
              <input
                type="text"
                placeholder="Search holidays..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-sm text-xs focus:outline-none focus:ring-0 focus:border-[#3c8dbc] transition-all text-gray-700 shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

      {/* Location Filters Box */}
      <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm mb-6">
        <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <HiMapPin size={14} className="text-[#00a65a]" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-tight">Filter by Location</h3>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-all whitespace-nowrap border ${
                selectedLocation === loc
                  ? "bg-[#00a65a] text-white border-[#008d4c]"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {loc === "All" ? <HiMapPin size={12} /> : loc === "Global" ? <HiGlobeAlt size={12} /> : <HiBuildingOffice2 size={12} />}
              {loc === "All" ? "All Locations" : loc}
            </button>
          ))}
        </div>
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
