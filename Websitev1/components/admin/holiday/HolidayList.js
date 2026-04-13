import React from "react";
import moment from "moment";

const HolidayList = ({ holidays, loading }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex items-center gap-2">
        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">Upcoming Holidays</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm italic font-medium">Loading upcoming holidays...</div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm italic font-medium">No upcoming holidays found</div>
        ) : (
          holidays.map((h, i) => (
            <div key={i} className="group p-4 rounded-xl border border-transparent hover:border-green-100 hover:bg-green-50/30 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 text-gray-800 font-black group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all">
                  <span className="text-[10px] leading-none mb-0.5 uppercase">{moment(h.date).format("MMM")}</span>
                  <span className="text-lg leading-none">{moment(h.date).format("DD")}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{h.holidayName}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {h.locations?.map((loc, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${
                        loc === "Global" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {loc}
                      </span>
                    ))}
                    {h.type === "Optional" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-purple-100 text-purple-700">Optional</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">{moment(h.date).format("ddd")}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HolidayList;
