import React from "react";
import moment from "moment";

const HolidayList = ({ holidays, loading }) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-50 shadow-sm overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <div className="p-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-50 text-green-600 rounded-2xl shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Upcoming Holidays</h2>
        </div>
        <span className="text-[10px] font-bold text-slate-400 capitalize bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">Real-time</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-[11px] uppercase tracking-widest font-black opacity-50">Synchronizing...</div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-[11px] uppercase tracking-widest font-black opacity-50">No Data Available</div>
        ) : (
          holidays.map((h, i) => (
            <div key={i} className="group p-5 rounded-2xl border-2 border-transparent hover:border-slate-50 hover:bg-slate-50/50 transition-all flex items-center justify-between cursor-default">
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 font-black group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all duration-300">
                  <span className="text-[9px] leading-none mb-1 uppercase tracking-tighter opacity-70 group-hover:opacity-100">{moment(h.date).format("MMM")}</span>
                  <span className="text-xl leading-none tracking-tighter">{moment(h.date).format("DD")}</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight group-hover:text-green-700 transition-colors">{h.holidayName}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {h.locations?.map((loc, idx) => (
                      <span key={idx} className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${
                        loc === "Global" ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {loc}
                      </span>
                    ))}
                    {h.type === "Optional" && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">Optional</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-l-2 border-slate-50 pl-4 h-8 flex items-center">{moment(h.date).format("ddd")}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HolidayList;
