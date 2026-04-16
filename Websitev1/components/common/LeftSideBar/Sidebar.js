import React, { useEffect, useState } from "react";
import { BsAwardFill, BsChevronRight } from "react-icons/bs";
import ls from "localstorage-slim";

const Sidebar = ({ sidebarData, onItemClick, open, setOpen }) => {
  const [submenuOpenIndex, setSubmenuOpenIndex] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setUserDetails(details);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  useEffect(() => {
    const storedActiveIndex = localStorage.getItem("activeIndex");
    if (storedActiveIndex !== null) {
      setActiveIndex(parseInt(storedActiveIndex));
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setSubmenuOpenIndex(-1);
    }
  }, [open]);

  const toggleSubmenu = (index) => {
    if (open && submenuOpenIndex === index) {
      setSubmenuOpenIndex(-1);
    } else if (open) {
      setSubmenuOpenIndex(index);
    }
  };

  const handleItemClick = (link, index) => {
    if (window.innerWidth < 768) {
      setOpen(false);
      setSubmenuOpenIndex(-1);
    }
    onItemClick(link);
    setActiveIndex(index);
    localStorage.setItem("activeIndex", index.toString());
  };

  return (
    <div
      className={`bg-[#222d32] admin-sidebar duration-300 h-full w-full`}
    >
      {/* User Panel */}
      {open && (
        <div className="p-4 flex items-center gap-3 border-b border-[#1a2226]/50 mb-2">
          <div className="relative">
            <div className="w-[45px] h-[45px] rounded-full border border-gray-600 bg-[#374850] flex items-center justify-center overflow-hidden">
                <span className="text-white text-lg font-bold">
                    {userDetails?.firstName?.charAt(0) || "U"}
                </span>
            </div>
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-bold truncate">
              {userDetails?.firstName || "User"} {userDetails?.lastName || ""}
            </p>
            <p className="text-[#b8c7ce] text-[10px] flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
            </p>
          </div>
        </div>
      )}

      <div>
        <ul className="pt-0 list-none px-0">
          {open && (
            <li className="px-4 py-2 text-[10px] font-bold text-[#4b646f] uppercase bg-[#1a2226]">
              Main Navigation
            </li>
          )}
          {sidebarData.map((menu, index) => (
            <div key={index}>
              <li
                className={`flex items-center group cursor-pointer transition-all relative duration-200 border-l-4 ${activeIndex === index
                    ? "bg-[#1e282c] border-[#3c8dbc] text-white"
                    : "bg-transparent border-transparent text-[#b8c7ce] hover:bg-[#1e282c] hover:text-white"
                  } ${!open ? "justify-center h-12" : "px-4 py-3"}`}
                onClick={() => {
                  if (!menu.submenu) {
                    handleItemClick(menu.link, index);
                  } else {
                    toggleSubmenu(index);
                  }
                }}
              >
                <span className={`text-lg ${!open ? "text-center" : "mr-3"}`}>
                  {menu.icon ? menu.icon : <BsAwardFill />}
                </span>

                {open && (
                  <>
                    <span className="text-sm font-semibold flex-grow">
                      {menu.title}
                    </span>
                    {menu.submenu && (
                      <BsChevronRight
                        className={`text-xs transition-transform duration-200 ${submenuOpenIndex === index ? "rotate-90" : ""
                          }`}
                      />
                    )}
                  </>
                )}

                {/* Tooltip for closed state */}
                {!open && (
                  <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-[#222d32] border border-[#1a2226] text-white text-xs invisible group-hover:visible whitespace-nowrap z-[100] rounded shadow-lg">
                    {menu.title}
                  </div>
                )}
              </li>

              {menu.submenu && submenuOpenIndex === index && open && (
                <ul className="bg-[#2c3b41] py-1 list-none px-0">
                  {menu.submenuItems.map((submenuItem, subIndex) => (
                    <li
                      key={subIndex}
                      className="text-sm text-[#8aa4af] hover:text-white hover:bg-[#2c3b41] flex items-center gap-2 cursor-pointer py-2 px-6 transition-colors"
                      onClick={() => handleItemClick(submenuItem.link, index)}
                    >
                      <span className="text-[10px]">
                        {submenuItem.icon || "○"}
                      </span>
                      <span className="text-xs">{submenuItem.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
