import React from "react";

const Logo = ({ open }) => {
  return (
    <div className={`bg-white hover:bg-gray-50 flex items-center justify-start sticky top-0 h-[64px] transition-all duration-300 border-b border-gray-100`}>
      {open ? (
        <div className="flex items-center px-4 w-full cursor-pointer group">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
             <span className="text-white font-black text-xl italic tracking-tighter">H</span>
          </div>
          <div className="ml-3 flex flex-col">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              HRMS<span className="text-green-600">.</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              Management Suite
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md transform hover:scale-110 transition-transform duration-300">
             <span className="text-white font-black text-xl italic tracking-tighter">H</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
