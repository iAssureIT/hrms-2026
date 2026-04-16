import React from "react";

const Logo = ({ open }) => {
  return (
    <div className={`flex items-center justify-center h-[52px] transition-all duration-300 border-b border-[#367fa9] bg-[#367fa9]`}>
      {open ? (
        <div className="flex items-center justify-center w-full px-4 text-white">
          <span className="text-xl font-bold tracking-tight">
            <b>HRMS</b>
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full text-white">
          <span className="text-xl font-bold"><b>H</b></span>
        </div>
      )}
    </div>
  );
};

export default Logo;
