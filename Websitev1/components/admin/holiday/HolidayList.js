import React from "react";
import moment from "moment";

const HolidayList = ({ holidays, loading }) => {
  return (
    <div className="bg-white rounded-sm border-t-[3px] border-[#00a65a] shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Draggable Events</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-gray-50/30">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xs uppercase font-bold opacity-50">
            Loading...
          </div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xs uppercase font-bold opacity-50">
            No Data
          </div>
        ) : (
          holidays.map((h, i) => (
            <div
              key={i}
              className={`p-2 rounded-none border border-transparent shadow-sm text-xs font-bold text-white cursor-move transition-all ${
                h.locations.some((loc) => loc.toLowerCase() === "global")
                  ? "bg-[#00a65a] hover:bg-[#008d4c]"
                  : h.locations.some((loc) => loc.toLowerCase() === "us")
                    ? "bg-[#dd4b39] hover:bg-[#d73925]"
                    : h.locations.some((loc) => loc.toLowerCase() === "india")
                      ? "bg-[#f39c12] hover:bg-[#e08e0b]"
                      : "bg-[#00c0ef] hover:bg-[#00acd6]"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{h.holidayName}</span>
                <span className="text-[10px] opacity-80">
                  {moment(h.date).format("MMM DD")}
                </span>
              </div>
            </div>
          ))
        )}

        <div className="flex items-center gap-2 p-2 mt-4 cursor-default">
          <input
            type="checkbox"
            id="remove_after_drop"
            className="w-3 h-3 rounded-none text-[#3c8dbc] focus:ring-0"
          />
          <label
            htmlFor="remove_after_drop"
            className="text-[10px] text-gray-600 font-normal"
          >
            remove after drop
          </label>
        </div>
      </div>
    </div>
  );
};

export default HolidayList;
