




import React, { useEffect, useState } from "react";
import { BsAwardFill, BsChevronRight } from "react-icons/bs";
import Image from "next/image";

const Sidebar = ({ sidebarData, onItemClick, open, setOpen }) => {
  const [submenuOpenIndex, setSubmenuOpenIndex] = useState(-1);

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

  const handleItemClick = (link) => {
    if (open && window.innerWidth < 768) {
      setOpen(false);
    }
    onItemClick(link);
  };

  return (
    <div
      className={` text-black duration-300 sticky top-0 h-screen lg:h-screen ${
        !open && "h-screen"
      }`}
    >
      <div className="">
        <div className={`bg-white hover:bg-gray-100`}>
          {open ? (
            <div className="h-[51px]">
              <Image
                src={sidebarData[0].logoimgfull}
                alt="Full Logo Image"
                className={`h-12 w-28 ms-14 ${!open && "ps-1"}`}
              />
            </div>
          ) : (
            <div className="h-[51px]">
              <Image
                src={sidebarData[1].logoimgsm}
                alt="Logo"
                className={`h-12 w-12 ms-2 ${!open && ""}`}
              />
            </div>
          )}
        </div>

        <ul className={`pt-0 ${!open && "px-0"}`}>
          {sidebarData.slice(2).map((menu, index) => (
            <>
              <li
                key={index}
                className={`text-sm flex gap-x-3 p-2 group cursor-pointer px-1 hover:bg-gray-600 rounded-md text-gray-200 mt-0 hover:text-white h-auto lg:h-10 ${
                  !open && "hover:bg-gray-800 py-0 px-0 rounded-none w-full"
                } ${menu.spacing ? "mt-9" : "mt-0"}`}
                onClick={() => toggleSubmenu(index)}
              >
                <span
                  onClick={() => handleItemClick(menu.link)}
                  className={`block float-left text-lg pt-1 ps-3 align-middle content-center ${
                    !open && "ps-5 pt-1 hidden lg:block"
                  }`}
                >
                  {menu.icon ? menu.icon : <BsAwardFill />}
                </span>

                <span
                  onClick={() => {
                    handleItemClick(menu.link);
                    toggleSubmenu(index);
                  }}
                  className={`text-sm font-semibold flex-1 duration-200 pt-1 ${
                    !open && "hidden pt-2"
                  }`}
                >
                  {menu.title}
                </span>

                <div
                  onClick={() => handleItemClick(menu.link)}
                  className={`text-md flex-1 duration-200 hidden bg-gray-800  ms-0 lg:ms-2 text-md  ${
                    !open &&
                    "group-hover:hidden lg:group-hover:block rounded-tr-md text-white-600 ms-0"
                  }`}
                >
                  <div className="w-60">
                    <div className="px-3 pt-3 pb-2">{menu.title}</div>
                    {menu.submenuItems &&
                      menu.submenuItems.map((item, index) => (
                        <div
                          key={index}
                          className="bg-gray-700"
                          onClick={() => handleItemClick(item.link)}
                        >
                          <div className="flex px-3 text-sm hover:bg-gray-600">
                            <div className="text-xs me-2 pt-1">{item.icon}</div>
                            {item.title}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {menu.submenu && open && (
                  <BsChevronRight
                    className={`text-xs ms-0 mt-2 lg:-ms-4 mr-2 align-middle content-center ${
                      submenuOpenIndex === index ? "rotate-90" : ""
                    }`}
                  />
                )}
              </li>

              {menu.submenu && submenuOpenIndex === index && (
                <ul className={`pt-0 ${!open && "px-0"}`}>
                  {menu.submenuItems.map((submenuItem, index) => (
                    <li
                      key={index}
                      className={`text-sm flex items-center group gap-x-1 lg:gap-x-4 cursor-pointer p-2 hover:bg-gray-600 py-0 ps-1 lg:ps-10 rounded-md ${
                        !open && "hover:bg-gray-800 py-0 px-0 rounded-none"
                      }`}
                    >
                      <span
                        onClick={() => handleItemClick(submenuItem.link)}
                        className="w-full"
                      >
                        <div className="flex">
                          <span className={`block me-2 text-xs pt-1`}>
                            {submenuItem.icon}
                          </span>
                          {submenuItem.title}
                        </div>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;






// import React, { useEffect, useState } from "react";
// import { BsAwardFill, BsChevronRight } from "react-icons/bs";
// import { FaBars } from "react-icons/fa";
// import Image from "next/image";
// import { useRouter } from "next/navigation";

// const LeftSideBar = ({ sidebarData, onItemClick }) => {
//   const [open, setOpen] = useState(true);
//   const [submenuOpenIndex, setSubmenuOpenIndex] = useState(-1);

//   const router = useRouter();


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
//   }, []);

//   useEffect(() => {
//     if (!open) {
//       setSubmenuOpenIndex(-1);
//     }
//   }, [open]);

//   const toggleSubmenu = (index) => {
//     if (open) {
//       if (submenuOpenIndex === index) {
//         setSubmenuOpenIndex(-1);
//       } else {
//         setSubmenuOpenIndex(index);
//       }
//     }
//   };


//   return (
//     <div
//       className={`bg-white text-white shadow-[0px_3px_5px_3px_rgba(0,0,0,0.3)] ${
//         open ? "w-60 lg:w-64" : "w-0 lg:w-16"
//       } duration-300 relative h-screen`}
//     >
//       <div className="">
//         <FaBars
//           className={`text-white text-lg font-semibold absolute -right-10 top-4 cursor-pointer ${!open}`}
//           onClick={() => setOpen(!open)}
//         />

//         <div className="bg-white">
//           {open ? (
//             <div className="h-[51px]">
//               <Image
//                 src={sidebarData[0].logoimgfull}
//                 alt="Full Logo Image"
//                 className={`h-12 w-28 ms-14 ${!open && "ps-1"}`}
//               />
//             </div>
//           ) : (
//             <div className="h-[51px]">
//               <Image
//                 src={sidebarData[1].logoimgsm}
//                 alt="Logo"
//                 className={`h-12 w-12 ms-2 ${!open && ""}`}
//               />
//             </div>
//           )}
//         </div>

//         <ul className={`pt-0 ${!open && "px-0"}`}>
//           {sidebarData.slice(2).map((menu, index) => (
//             <>
//               <li
//                 key={index}
//                 className={`text-sm flex gap-x-3 p-2 group cursor-pointer px-1 hover:bg-tableRowListback hover:text-headerBtn
//                    hover:border-r-4 hover:border-headerBtn  text-[#333]  h-12 
//                  ${
//                    !open && "hover:bg-tableRowListback py-0 px-0 rounded-none w-full"
//                  } ${menu.spacing ? "mt-9" : "mt-0"}`}
//                 onClick={() => {toggleSubmenu(index)}}
//               >
//                 <span
//                   onClick={() => onItemClick(menu.link)}
//                   className={`block float-left text-xl pt-1 ps-3 ${
//                     !open && "ps-5 pt-4 hidden lg:block"
//                   } `}
//                 >
//                   {menu.icon ? menu.icon : <BsAwardFill />}
//                 </span>

//                 <span
//                   onClick={() => onItemClick(menu.link)}
//                   className={`text-md font-semibold  flex-1  duration-200 pt-1  ${
//                     !open && "hidden pt-2"
//                   }`}
//                 >
//                   {menu.title}
//                 </span>

//                 <div
//                   onClick={() => onItemClick(menu.link)}
//                   className={`text-md flex-1 duration-200 hidden bg-white text-[#333] ms-2 text-md  ${
//                     !open && "group-hover:block rounded-tr-md text-white-600"
//                   }`}
//                 >
//                   <div className="w-52">
//                     <div className="px-3 pt-3 pb-4 ">{menu.title}</div>
//                     {menu.submenuItems &&
//                       menu.submenuItems.map((item, tooltipindex) => {
//                         return (
//                           <div
//                             key={tooltipindex}
//                             className="bg-white rounded-br-md"
//                             onClick={() => onItemClick(item.link)}
//                           >
//                             <div className="flex px-3 py-1 text-sm hover:bg-tableRowListback">
//                               <div className="text-xs me-2 pt-1">
//                                 {item.icon}
//                               </div>
//                               {item.title}
//                             </div>
//                           </div>
//                         );
//                       })}
//                   </div>
//                 </div>
                
//                 {menu.submenu && open && (
//                   <BsChevronRight
//                     className={`text-xs ms-0 mt-2 lg:-ms-4 ${
//                       submenuOpenIndex === index ? "rotate-90" : ""
//                     }`}
//                   />
//                 )}
//               </li>

//               {menu.submenu && submenuOpenIndex === index && (
//                 <ul className={`pt-0 ${!open && "px-0"}`}>
//                   {menu.submenuItems.map((submenuItem, submenuindex) => (
//                     <li
//                       key={submenuindex}
//                       className={`text-sm text-[#333] flex items-center group gap-x-1 lg:gap-x-4 cursor-pointer p-2 hover:bg-tableRowListback py-0 ps-1 lg:ps-10 hover:border-r-2 hover:border-headerBtn mt-2"
//                       ${!open && "hover:bg-gray-800 py-0 px-0 rounded-none"}
//                       `}
//                     >
//                       <span
//                         onClick={() => onItemClick(submenuItem.link)}
//                         className="w-full"
//                       >
//                         <div className="flex py-1">
//                           <span className={`block me-2 text-xs ms-2 pt-1 `}>
//                             {submenuItem.icon}
//                           </span>
//                           {submenuItem.title}
//                         </div>
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default LeftSideBar;
