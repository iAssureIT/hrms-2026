import React, { useEffect, useState } from "react";
import { BsAwardFill, BsChevronRight } from "react-icons/bs";

const Sidebar = ({ sidebarData, onItemClick, open, setOpen }) => {
  const [submenuOpenIndex, setSubmenuOpenIndex] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(0);

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
      className={`bg-site text-white duration-300 sticky top-[104px] lg:top-[52px] h-screen-minus-52px ${
        !open && "sticky top-[104px] lg:top-[52px] h-screen-minus-52px"
      }`}
    >
      <div>
        <ul className={`pt-0 ${!open && "px-0"}`}>
          {sidebarData.slice(2).map((menu, index) => (
            <div key={index}>
              <li
                className={`text-sm flex gap-x-3 p-2 group cursor-pointer px-0 lg:px-1 hover:bg-dark text-white mt-0 hover:text-white h-auto ${
                  !open && "hover:bg-dark py-0 px-0 rounded-none w-full lg:h-10"
                } ${menu.spacing ? "mt-9" : "mt-0"} ${
                  activeIndex === index ? "bg-dark" : ""
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
                    !open &&
                    "ps-5 pt-0 hidden lg:block items-center justify-center "
                  }`}
                >
                  {menu.icon ? menu.icon : <BsAwardFill />}
                </span>

                <span
                  className={`text-md font-semibold flex-1 duration-200 pt-1 justify-center ${
                    !open && "hidden pt-2"
                  }`}
                >
                  {menu.title}
                </span>

                <div
                  onClick={() => handleItemClick(menu.link, index)}
                  className={`text-md flex-1 duration-200 hidden bg-dark  ms-0 lg:ms-2 text-md  ${
                    !open &&
                    "group-hover:hidden lg:group-hover:block rounded-tr-md text-white-600 ms-0"
                  }`}
                >
                  <div className="w-60 ms-1">
                    <div className="px-3 pt-3 pb-2 text-md font-semibold">
                      {menu.title}
                    </div>
                    {menu.submenuItems &&
                      menu.submenuItems.map((item, subIndex) => (
                        <div
                          key={subIndex}
                          className="bg-dark"
                          onClick={() => handleItemClick(item.link, index)}
                        >
                          <div className="flex px-3 text-md hover:bg-dark">
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
                      className={`text-md justify-center align-middle content-center mr-1 ${
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
                      className={`text-sm text-white hover:text-white hover:bg-dark flex items-center group gap-x-1 lg:gap-x-4 cursor-pointer p-2 bg-site py-0.5 ps-1 lg:ps-2 ${
                        !open && "hover:bg-dark py-0 px-0 rounded-none"
                      }`}
                    >
                      <span
                        onClick={() => handleItemClick(submenuItem.link, index)}
                        className="w-full"
                      >
                        <div className="flex py-0.5 lg:py-0.5">
                          <span className={`block me-2 text-md ms-10 pt-1`}>
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
