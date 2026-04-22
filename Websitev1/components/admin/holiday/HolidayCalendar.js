import React, { useState } from "react";
import moment from "moment";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const HolidayCalendar = ({ holidays }) => {
  const [currentDate, setCurrentDate] = useState(moment());

  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = moment(currentDate).startOf("month").day();
  const monthName = currentDate.format("MMMM YYYY");

  const prevMonth = () => setCurrentDate(moment(currentDate).subtract(1, "month"));
  const nextMonth = () => setCurrentDate(moment(currentDate).add(1, "month"));
  const resetToToday = () => setCurrentDate(moment());

  const days = [];
  // Build blank slots for previous month's trailing days
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`blank-${i}`} className="h-32 bg-gray-50/50 border border-gray-100/50" />);
  }

  // Build current month's days
  for (let d = 1; d <= daysInMonth; d++) {
    const fullDate = moment(currentDate).date(d).startOf("day");
    const isToday = fullDate.isSame(moment(), "day");
    
    // Find holidays for this date
    const dateHolidays = holidays.filter(h => moment(h.date).isSame(fullDate, "day"));

    days.push(
      <div key={d} className={`h-32 border border-gray-100 p-2 transition-all relative group ${isToday ? "bg-yellow-50/50" : "bg-white"}`}>
        <div className="flex justify-between items-start">
          <span className={`text-sm font-bold tabular-nums ${
            isToday ? "text-[#3c8dbc]" : "text-gray-400 group-hover:text-gray-800"
          }`}>
            {d}
          </span>
        </div>

        <div className="mt-2 space-y-1 overflow-hidden h-20">
          {dateHolidays.map((h, i) => (
            <div key={i} className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase leading-tight tracking-tight border shadow-sm ${
              h.locations.some(loc => loc.toLowerCase() === "global") ? "bg-[#00a65a] text-white border-[#008d4c]" : 
              h.locations.some(loc => loc.toLowerCase() === "us") ? "bg-[#dd4b39] text-white border-[#d73925]" :
              h.locations.some(loc => loc.toLowerCase() === "india") ? "bg-[#f39c12] text-white border-[#e08e0b]" :
              "bg-[#00c0ef] text-white border-[#00acd6]"
            }`}>
              {h.holidayName}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 rounded-sm">
            <FaChevronLeft size={10} />
          </button>
          <button onClick={nextMonth} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 rounded-sm">
            <FaChevronRight size={10} />
          </button>
          <button onClick={resetToToday} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 rounded-sm text-xs ml-2">
            Today
          </button>
        </div>
        
        <h2 className="text-lg font-bold text-gray-800">{currentDate.format("MMMM YYYY")}</h2>

        <div className="flex gap-1">
          <button className="px-3 py-1 bg-[#3c8dbc] text-white border border-[#367fa9] rounded-sm text-xs">month</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-300 rounded-sm text-xs hover:bg-gray-200">week</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-300 rounded-sm text-xs hover:bg-gray-200">day</button>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-xs font-bold text-gray-600 py-2 text-center uppercase border-r border-gray-200 last:border-r-0">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-t border-gray-100">
          {days}
        </div>
      </div>
    </div>
  );
};

export default HolidayCalendar;
