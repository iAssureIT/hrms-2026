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
      <div key={d} className={`h-32 border border-blue-50/50 p-2 transition-all relative group hover:bg-blue-50/10 ${isToday ? "bg-blue-50/20" : "bg-white"}`}>
        <div className="flex justify-between items-start">
          <span className={`text-sm font-black tabular-nums transition-colors ${
            isToday ? "bg-blue-600 text-white w-7 h-7 rounded-lg flex items-center justify-center -mt-1 -ml-1 shadow-md shadow-blue-500/20" : "text-gray-400 group-hover:text-gray-800"
          }`}>
            {d}
          </span>
        </div>

        <div className="mt-2 space-y-1 overflow-hidden h-20">
          {dateHolidays.map((h, i) => (
            <div key={i} className={`px-2 py-1 rounded-md text-[9px] font-black uppercase leading-tight tracking-tight shadow-sm border border-transparent ${
              h.locations.includes("Global") ? "bg-blue-600 text-white" : 
              h.locations.includes("US") ? "bg-red-500 text-white" :
              h.locations.includes("India") ? "bg-orange-500 text-white" :
              "bg-gray-100 text-gray-700"
            }`}>
              {h.holidayName}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-800 tracking-tight">{monthName}</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-gray-800 transition-colors"><FaChevronLeft size={14} /></button>
            <button onClick={resetToToday} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-800 transition-colors">Today</button>
            <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-gray-800 transition-colors"><FaChevronRight size={14} /></button>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 capitalize">
               <div className="w-2 h-2 rounded-full bg-blue-600"></div>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global</span>
             </div>
             <div className="flex items-center gap-1.5 capitalize">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">US</span>
             </div>
             <div className="flex items-center gap-1.5 capitalize">
               <div className="w-2 h-2 rounded-full bg-orange-500"></div>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">India</span>
             </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-t border-l border-gray-50 rounded-lg overflow-hidden">
          {days}
        </div>
      </div>
    </div>
  );
};

export default HolidayCalendar;
