import React, { useState } from "react";
import moment from "moment";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const HolidayCalendar = ({ holidays }) => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [view, setView] = useState("month");

  const prev = () => {
    if (view === "month")
      setCurrentDate(moment(currentDate).subtract(1, "month"));
    else setCurrentDate(moment(currentDate).subtract(1, "year"));
  };
  const next = () => {
    if (view === "month") setCurrentDate(moment(currentDate).add(1, "month"));
    else setCurrentDate(moment(currentDate).add(1, "year"));
  };
  const resetToToday = () => setCurrentDate(moment());

  const renderMonthView = () => {
    const daysInMonth = currentDate.daysInMonth();
    const firstDayOfMonth = moment(currentDate).startOf("month").day();
    const days = [];

    // Build blank slots for previous month's trailing days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`blank-${i}`}
          className="h-32 bg-gray-50/50 border border-gray-100/50"
        />,
      );
    }

    // Build current month's days
    for (let d = 1; d <= daysInMonth; d++) {
      const fullDate = moment(currentDate).date(d).startOf("day");
      const isToday = fullDate.isSame(moment(), "day");
      const dateHolidays = holidays.filter((h) =>
        moment(h.date).isSame(fullDate, "day"),
      );

      days.push(
        <div
          key={d}
          className={`h-32 border border-gray-100 p-2 transition-all relative group ${isToday ? "bg-yellow-50/50" : "bg-white"}`}
        >
          <div className="flex justify-between items-start">
            <span
              className={`text-sm font-bold tabular-nums ${
                isToday
                  ? "text-[#3c8dbc]"
                  : "text-gray-400 group-hover:text-gray-800"
              }`}
            >
              {d}
            </span>
          </div>

          <div className="mt-2 space-y-1 overflow-hidden h-20">
            {dateHolidays.map((h, i) => (
              <div
                key={i}
                className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase leading-tight tracking-tight border shadow-sm ${
                  h.locations.some((loc) => loc.toLowerCase() === "global")
                    ? "bg-[#00a65a] text-white border-[#008d4c]"
                    : h.locations.some((loc) => loc.toLowerCase() === "us")
                      ? "bg-[#dd4b39] text-white border-[#d73925]"
                      : h.locations.some((loc) => loc.toLowerCase() === "india")
                        ? "bg-[#f39c12] text-white border-[#e08e0b]"
                        : "bg-[#00c0ef] text-white border-[#00acd6]"
                }`}
              >
                {h.holidayName}
              </div>
            ))}
          </div>
        </div>,
      );
    }

    return (
      <div className="p-4 flex-1">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-xs font-bold text-gray-600 py-2 text-center uppercase border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-t border-gray-100">
          {days}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    return (
      <div className="grid grid-cols-3 gap-6 h-full overflow-y-auto p-6 custom-scrollbar bg-gray-50/30">
        {moment.months().map((month, index) => {
          const monthDate = moment(currentDate).month(index);
          const daysInMonth = monthDate.daysInMonth();
          const firstDay = monthDate.startOf("month").day();

          return (
            <div
              key={month}
              className="border border-gray-100 p-3 rounded-sm bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="text-[11px] font-black text-gray-800 uppercase mb-3 border-b border-gray-100 pb-1 flex justify-between items-center">
                <span>{month}</span>
                <span className="text-[9px] text-gray-400 font-normal">
                  {currentDate.year()}
                </span>
              </h4>
              <div className="grid grid-cols-7 gap-px bg-transparent text-[8px]">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={`${d}-${i}`}>{d}</div>
                ))}
                {Array(firstDay)
                  .fill(null)
                  .map((_, i) => (
                    <div key={`b-${i}`} className="bg-transparent" />
                  ))}
                {Array.from({ length: daysInMonth }).map((_, d) => {
                  const dayNum = d + 1;
                  const dayDate = moment(monthDate).date(dayNum).startOf("day");
                  const dateHolidays = holidays.filter((h) =>
                    moment(h.date).isSame(dayDate, "day"),
                  );
                  const hasHoliday = dateHolidays.length > 0;

                  // Color priority same as list/month view
                  const holidayColor = hasHoliday
                    ? dateHolidays.some((h) =>
                        h.locations.some(
                          (loc) => loc.toLowerCase() === "global",
                        ),
                      )
                      ? "bg-[#00a65a]"
                      : dateHolidays.some((h) =>
                            h.locations.some(
                              (loc) => loc.toLowerCase() === "us",
                            ),
                          )
                        ? "bg-[#dd4b39]"
                        : dateHolidays.some((h) =>
                              h.locations.some(
                                (loc) => loc.toLowerCase() === "india",
                              ),
                            )
                          ? "bg-[#f39c12]"
                          : "bg-[#00c0ef]"
                    : "bg-transparent";

                  return (
                    <div
                      key={d}
                      className="relative group flex items-center justify-center py-1"
                    >
                      <div
                        className={`w-5 h-5 flex items-center justify-center rounded-sm transition-all text-[9px] ${
                          hasHoliday
                            ? `${holidayColor} text-white font-black shadow-sm`
                            : "text-gray-500 hover:bg-gray-100"
                        } ${dayDate.isSame(moment(), "day") && !hasHoliday ? "border border-[#3c8dbc] text-[#3c8dbc]" : ""}`}
                      >
                        {dayNum}
                      </div>
                      {hasHoliday && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 w-max max-w-[150px]">
                          <div className="bg-gray-800 text-white text-[9px] py-1 px-2 rounded shadow-lg">
                            {dateHolidays.map((h) => h.holidayName).join(", ")}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={prev}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 rounded-sm transition-all active:scale-90"
          >
            <FaChevronLeft size={10} />
          </button>
          <button
            onClick={next}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 rounded-sm transition-all active:scale-90"
          >
            <FaChevronRight size={10} />
          </button>
          <button
            onClick={resetToToday}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 rounded-sm text-xs ml-2 font-bold uppercase tracking-tighter"
          >
            Today
          </button>
        </div>

        <h2 className="text-lg font-extrabold text-gray-800 tracking-tight">
          {view === "month"
            ? currentDate.format("MMMM YYYY")
            : currentDate.format("YYYY")}
        </h2>

        <div className="flex bg-gray-100 p-0.5 rounded-sm border border-gray-200">
          <button
            onClick={() => setView("month")}
            className={`px-4 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all ${
              view === "month"
                ? "bg-[#3c8dbc] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Month
          </button>

          <button
            onClick={() => setView("year")}
            className={`px-4 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all ${
              view === "year"
                ? "bg-[#3c8dbc] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "month" ? renderMonthView() : renderYearView()}
      </div>
    </div>
  );
};

export default HolidayCalendar;
