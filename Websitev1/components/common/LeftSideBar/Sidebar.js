// import React, { useEffect, useState } from "react";
// import { BsAwardFill, BsChevronRight } from "react-icons/bs";

// const Sidebar = ({ sidebarData, onItemClick, open, setOpen }) => {
//   const [submenuOpenIndex, setSubmenuOpenIndex] = useState(-1);
//   const [activeIndex, setActiveIndex] = useState(0);

//   // console.log("sidebarData", sidebarData);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 768) {
//         setOpen(false);
//       } else {
//         setOpen(true);
//       }
//     };

//     handleResize();

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [setOpen]);

//   useEffect(() => {
//     const storedActiveIndex = localStorage.getItem("activeIndex");
//     if (storedActiveIndex !== null) {
//       setActiveIndex(parseInt(storedActiveIndex));
//     }
//   }, []);

//   useEffect(() => {
//     if (!open) {
//       setSubmenuOpenIndex(-1);
//     }
//   }, [open]);

//   const toggleSubmenu = (index) => {
//     if (open && submenuOpenIndex === index) {
//       setSubmenuOpenIndex(-1);
//     } else if (open) {
//       setSubmenuOpenIndex(index);
//     }
//   };

//   const handleItemClick = (link, index) => {
//     if (window.innerWidth < 768) {
//       setOpen(false);
//       setSubmenuOpenIndex(-1);
//     }
//     onItemClick(link);
//     setActiveIndex(index);
//     localStorage.setItem("activeIndex", index.toString());
//   };

//   return (
//     <div
//       className={`bg-white overflow-auto text-white duration-300 sticky top-[104px] lg:top-[52px] h-screen-minus-52px ${
//         !open && "sticky top-[104px] lg:top-[52px] h-screen-minus-52px"
//       }`}
//     >
//       <div>
//         <ul className={`pt-0 ${!open && "px-0"}`}>
//           {sidebarData.slice(2).map((menu, index) => (
//             <div key={index}>
//               <li
//                 className={`text-sm flex gap-x-3 p-2 group cursor-pointer px-0 lg:px-1 hover:bg-lightgreen text-black mt-0 hover:text-Green h-auto ${
//                   !open &&
//                   "hover:bg-lightgreen py-0 lg:h-10 px-0 rounded-none w-full"
//                 } ${menu.spacing ? "mt-9" : "mt-0"} ${
//                   activeIndex === index
//                     ? "bg-lightgreen text-green border-r-4 border-Green"
//                     : ""
//                 }`}
//                 onClick={() => {
//                   if (!menu.submenu) {
//                     handleItemClick(menu.link, index);
//                   } else {
//                     toggleSubmenu(index);
//                   }
//                 }}
//               >
//                 <span
//                   className={`block float-left text-lg pt-0 lg:pt-1 ps-3 text-center justify-center content-center align-middle ${
//                     !open && "ps-5 hidden lg:block items-center justify-center "
//                   }`}
//                 >
//                   {menu.icon ? menu.icon : <BsAwardFill />}
//                 </span>

//                 <span
//                   className={`text-sm font-semibold flex-1 duration-200 pt-1 justify-center ${
//                     !open && "hidden pt-2"
//                   }`}
//                 >
//                   {menu.title}{" "}
//                 </span>

//                 <div
//                   onClick={() => handleItemClick(menu.link, index)}
//                   className={`text-md flex-1 duration-200 hidden bg-lightgreen  ms-0 lg:ms-3  ${
//                     !open &&
//                     "group-hover:hidden lg:group-hover:block rounded-tr-md text-white-600 ms-0"
//                   }`}
//                 >
//                   <div className="w-56 ms-0 border border-t-0 rounded-t-lg">
//                     <div className="px-3 pt-3 pb-2 font-semibold">
//                       {menu.title}
//                     </div>
//                     {menu.submenuItems &&
//                       menu.submenuItems.map((item, subIndex) => (
//                         <div
//                           key={subIndex}
//                           className="bg-white text-black hover:text-Green"
//                           onClick={() => handleItemClick(item.link, index)}
//                         >
//                           <div className="flex px-3 py-1 text-sm hover:bg-lightgreen">
//                             <div className="text-xs me-2 pt-1">{item.icon}</div>
//                             {item.title}
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 </div>

//                 {menu.submenu && open && (
//                   <div className=" justify-center align-middle content-center">
//                     <BsChevronRight
//                       className={`text-xs justify-center align-middle content-center mr-1 mt-1.5 ${
//                         submenuOpenIndex === index ? "rotate-90" : ""
//                       }`}
//                     />
//                   </div>
//                 )}
//               </li>

//               {menu.submenu && submenuOpenIndex === index && (
//                 <ul className={`pt-0 ${!open && "px-0"}`}>
//                   {menu.submenuItems.map((submenuItem, subIndex) => (
//                     <li
//                       key={subIndex}
//                       className={`text-sm text-black hover:text-Green hover:font-semibold hover:bg-lightgreen flex items-center group gap-x-1 lg:gap-x-4 cursor-pointer p-2 bg-white py-1 ps-1 lg:ps-3 ${
//                         !open &&
//                         "hover:bg-white py-0 px-0 rounded-none hover:font-semibold"
//                       }`}
//                     >
//                       <span
//                         onClick={() => handleItemClick(submenuItem.link, index)}
//                         className="w-full"
//                       >
//                         <div className="flex py-0.5 lg:py-0">
//                           <span className={`block me-2 text-xs ms-9 pt-1`}>
//                             {submenuItem.icon}
//                           </span>
//                           {submenuItem.title}
//                         </div>
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;













//changes by Neha
import React, { useEffect, useState } from "react";
import { BsAwardFill, BsChevronRight } from "react-icons/bs";
import Image from "next/image";
import ls from "localstorage-slim";
import { FaUsers } from "react-icons/fa";

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
      className={`bg-[#222d32] admin-sidebar duration-300 sticky top-[52px] h-[calc(100vh-52px)] w-full`}
    >
      {/* User Panel */}
      {open && (
        <div className="p-4 flex items-center gap-3 border-b border-[#1a2226]/50 mb-2">
          <div className="relative">
            <div className="w-[45px] h-[45px] rounded-full border border-gray-600 bg-[#374850] flex items-center justify-center overflow-hidden">
              {/* Profile icon removed as per user request to keep only status dot */}
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
        <ul className="pt-0 list-none">
          {open && (
            <li className="px-4 py-2 text-[10px] font-bold text-[#4b646f] uppercase bg-[#1a2226]">
              Main Navigation
            </li>
          )}
          {sidebarData.map((menu, index) => (
            <div key={index}>
              <li
                className={`flex items-center group cursor-pointer transition-all relative transition-colors duration-200 border-l-4 ${activeIndex === index
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
                <ul className="bg-[#2c3b41] py-1 list-none">
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
