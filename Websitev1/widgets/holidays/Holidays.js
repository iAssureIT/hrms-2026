"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tooltip } from "flowbite-react";
import { FaPlus, FaSearch, FaFileUpload } from "react-icons/fa";
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
    <div className="section p-6 md:p-10 bg-white min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <div className="box border-2 rounded-md shadow-md bg-white mb-8">
          <div className="uppercase text-xl font-semibold border-b-2 border-gray-300 flex justify-between px-10">
            <div className="flex items-center gap-3 py-5">
              <h1 className="text-2xl text-gray-900 tracking-tight">
                Holiday Master
              </h1>
            </div>
            <div className="flex gap-3 my-5 items-center">
              <Tooltip
                content="Add Holiday"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                <FaPlus
                  className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                  onClick={() => {
                    router.push("/admin/holidays/add");
                  }}
                />
              </Tooltip>
              <Tooltip
                content="Bulk Upload"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                <FaFileUpload
                  className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                  onClick={() => {
                    router.push("/admin/holidays/bulk-upload");
                  }}
                />
              </Tooltip>
              <Tooltip
                content="Holiday Registry"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                <CiViewList
                  className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[1.5rem]"
                  onClick={() => {
                    router.push("/admin/holidays");
                  }}
                />
              </Tooltip>
            </div>
          </div>

          <div className="px-10 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 font-medium max-w-xl text-[11px] leading-relaxed">
                Configure organizational holidays, location-based calendars, and
                regional time-off policies with real-time tracking and planning.
              </p>
              <div className="relative w-72 group">
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
            </div>
          </div>
        </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {locations.map((loc) => {
          const icon =
            loc === "All" ? (
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                selectedLocation === loc
                  ? "bg-white/20 text-white"
                  : "bg-green-100 text-green-600"
              }`}>
                <HiMapPin size={14} />
              </span>
            ) : loc === "Global" ? (
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                selectedLocation === loc
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}>
                <HiGlobeAlt size={14} />
              </span>
            ) : (
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                selectedLocation === loc
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}>
                <HiBuildingOffice2 size={14} />
              </span>
            );

          return (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${
                selectedLocation === loc
                  ? "bg-green-600 text-white border-green-600 shadow-green-500/20"
                  : "bg-white text-gray-500 border-transparent hover:border-gray-200"
              }`}
            >
              {icon}
              {loc === "All" ? "All Locations" : loc}
            </button>
          );
        })}
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
