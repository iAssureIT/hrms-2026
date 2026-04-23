import React from "react";
import moment from "moment";

import { FaTrash } from "react-icons/fa";

const HolidayList = ({ holidays, loading, onDelete }) => {
  return (
    <div className="bg-white rounded-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
          Upcoming Holidays
        </h3>
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
              className={`p-2 rounded-none border border-transparent shadow-sm text-xs font-bold text-white cursor-move transition-all group/item ${
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
                <div className="flex flex-col">
                  <span>{h.holidayName}</span>
                  <span className="text-[10px] opacity-80">
                    {moment(h.date).format("MMM DD")}
                  </span>
                </div>
                <button
                  onClick={() => onDelete && onDelete(h._id)}
                  className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-black/10 rounded-sm transition-all"
                  title="Delete Holiday"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HolidayList;
