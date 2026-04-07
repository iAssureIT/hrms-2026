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

const Sidebar = ({ sidebarData, onItemClick, open, setOpen }) => {
  const [submenuOpenIndex, setSubmenuOpenIndex] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(0);

  // console.log("sidebarData", sidebarData);

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
      className={`bg-white overflow-auto text-white duration-300 sticky top-[104px] lg:top-[52px] h-screen-minus-52px ${
        !open && "sticky top-[104px] lg:top-[52px] h-screen-minus-52px"
      }`}
    >
      <div>
        <ul className={`pt-0 ${!open && "px-0"}`}>
          {sidebarData.slice(2).map((menu, index) => (
            <div key={index}>
              <li
                className={`text-sm flex gap-x-3 p-2 group cursor-pointer px-0 lg:px-1 hover:bg-lightgreen text-black mt-0 hover:text-Green h-auto ${
                  !open &&
                  "hover:bg-lightgreen py-0 lg:h-10 px-0 rounded-none w-full"
                } ${menu.spacing ? "mt-9" : "mt-0"} ${
                  activeIndex === index
                    ? "bg-lightgreen text-green border-r-4 border-Green"
                    : ""
                }`}
                onClick={() => {
                  if (!menu.submenu) {
                    handleItemClick(menu.link, index);
                  } else {
                    toggleSubmenu(index);
                  }
                }}
              >
                <span
                  className={`block float-left text-lg pt-0 lg:pt-1 ps-3 text-center justify-center content-center align-middle ${
                    !open && "ps-5 hidden lg:block items-center justify-center "
                  }`}
                >
                  {menu.icon ? menu.icon : <BsAwardFill />}
                </span>

                <span
                  className={`text-sm font-semibold flex-1 duration-200 pt-1 justify-center ${
                    !open && "hidden pt-2"
                  }`}
                >
                  {menu.title}{" "}
                </span>

                <div
                  onClick={() => handleItemClick(menu.link, index)}
                  className={`text-md flex-1 duration-200 hidden bg-lightgreen  ms-0 lg:ms-3  ${
                    !open &&
                    "group-hover:hidden lg:group-hover:block rounded-tr-md text-white-600 ms-0"
                  }`}
                >
                  <div className="w-56 ms-0 border border-t-0 rounded-t-lg">
                    <div className="px-3 pt-3 pb-2 font-semibold">
                      {menu.title}
                    </div>
                    {menu.submenuItems &&
                      menu.submenuItems.map((item, subIndex) => (
                        <div
                          key={subIndex}
                          className="bg-white text-black hover:text-Green"
                          onClick={() => handleItemClick(item.link, index)}
                        >
                          <div className="flex px-3 py-1 text-sm hover:bg-lightgreen">
                            <div className="text-xs me-2 pt-1">{item.icon}</div>
                            {item.title}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {menu.submenu && open && (
                  <div className=" justify-center align-middle content-center">
                    <BsChevronRight
                      className={`text-xs justify-center align-middle content-center mr-1 mt-1.5 ${
                        submenuOpenIndex === index ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                )}
              </li>

              {menu.submenu && submenuOpenIndex === index && (
                <ul className={`pt-0 ${!open && "px-0"}`}>
                  {menu.submenuItems.map((submenuItem, subIndex) => (
                    <li
                      key={subIndex}
                      className={`text-sm text-black hover:text-Green hover:font-semibold hover:bg-lightgreen flex items-center group gap-x-1 lg:gap-x-4 cursor-pointer p-2 bg-white py-1 ps-1 lg:ps-3 ${
                        !open &&
                        "hover:bg-white py-0 px-0 rounded-none hover:font-semibold"
                      }`}
                    >
                      <span
                        onClick={() => handleItemClick(submenuItem.link, index)}
                        className="w-full"
                      >
                        <div className="flex py-0.5 lg:py-0">
                          <span className={`block me-2 text-xs ms-9 pt-1`}>
                            {submenuItem.icon}
                          </span>
                          {submenuItem.title}
                        </div>
                      </span>
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
