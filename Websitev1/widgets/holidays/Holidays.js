"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tooltip } from "flowbite-react";
import { FaPlus, FaFileUpload, FaHome } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import { CiViewList } from "react-icons/ci";
import { HiMapPin, HiGlobeAlt, HiBuildingOffice2 } from "react-icons/hi2";
import HolidayCalendar from "@/components/admin/holiday/HolidayCalendar";
import HolidayList from "@/components/admin/holiday/HolidayList";
import moment from "moment";
import { useRouter } from "next/navigation";

const Holidays = () => {
  const router = useRouter();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [locations, setLocations] = useState(["All"]);

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
        setLocations(["All", ...res.data.map((c) => c.centerName)]);
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

  const filteredHolidays = holidays;

  const upcomingHolidays = filteredHolidays.filter((h) =>
    moment(h.date).isAfter(moment().subtract(1, "day")),
  );

  return (
    <section className="section p-6 md:p-10 bg-white min-h-screen border-t-[3px] border-[#3c8dbc]">
      <div className="max-w-[1440px] mx-auto">
        {/* Theme-aligned Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Holiday Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Holiday{" "}
                <span className="text-[#3c8dbc] font-black">Management</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
              <Tooltip
                content="Add Holiday"
                placement="bottom"
                className="bg-[#3c8dbc]"
                arrow={false}
              >
                <BsPlusSquare
                  className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                  onClick={() => router.push("/admin/holidays/add")}
                />
              </Tooltip>
              <Tooltip
                content="Bulk Upload"
                placement="bottom"
                className="bg-[#3c8dbc]"
                arrow={false}
              >
                <FaFileUpload
                  className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                  onClick={() => router.push("/admin/holidays/bulk-upload")}
                />
              </Tooltip>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Configure organizational calendars, regional policies, and public
            holiday schedules across all business centers.
          </p>
        </div>

        <div className="bg-white">
          <div className="p-4 bg-gray-50/50 hidden">
            {/* Original search area removed in previous step, kept hidden placeholder for layout if needed */}
          </div>

          {/* Outer Border Box wrapper for main content */}
          <div className="bg-white  shadow-sm mb-6 rounded-sm">
            {/* Location Filters Box */}
            <div className="bg-transparent mb-0">
              <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                <HiMapPin size={14} className="text-[#00a65a]" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-tight">
                  Filter by Location
                </h3>
              </div>
              <div className="p-4">
                <div className="relative inline-block w-full md:w-72 group">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-[11px] font-bold uppercase transition-all focus:outline-none focus:border-[#00a65a] focus:ring-0 cursor-pointer text-gray-700 hover:bg-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc} className="font-sans">
                        {loc === "All" ? "All Locations" : loc}
                      </option>
                    ))}
                  </select>
                </div>
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
      </div>
    </section>
  );
};

export default Holidays;
