import React, { useState } from "react";

const LeftSideBar = () => {
  const accordionItems = [
    { id: 1, label: "Dashboard" },
    // {
    //   id: 2, label: "Product catalog", submenu: [{ subLabel: "Add New Product", url: "/user/product-upload/product-upload" },
    //   { subLabel: "Product List", url: "/user/product-list" }]
    // },
    // {
    //   id: 3, label: "News and Articles", submenu: [{ subLabel: "Add New News", url: "/user/news/create-new-news" },
    //   { subLabel: "News List", url: "/user/news/my-news" }]
    // },    
    {
      id: 4, label: "Photo gallery ", submenu: [
        { subLabel: "Add New Photo", url: "/user/add-new-photo" },
        // { subLabel: "Gallery", url: "/user/photo-gallery" }
      ]
    },
  ];

  const [openItems, setOpenItems] = useState([]);

  const handleAccordionToggle = (itemId) => {
    setOpenItems((prevOpenItems) =>
      prevOpenItems.includes(itemId)
        ? prevOpenItems.filter((id) => id !== itemId)
        : [...prevOpenItems, itemId]
    );
  };

  return (
    <div className={"h-full w-full  pb-4 overflow-y-auto "} id="drawer">
      <ul className="w-64 font-medium text-sm">
        {accordionItems.map((item) => (
          <li key={item.id}>
            <button
              className={`w-full flex container text-leftWhite transition duration-75 ${openItems.includes(item.id)
                ? "bg-leftBlue dark:text-gray-400 group-hover:text-leftWhite dark:group-hover:text-leftWhite"
                : "bg-leftGray dark:text-gray-400 group-hover:text-leftWhite dark:group-hover:text-leftWhite"
                } border-y border-leftLightGray px-2 py-4 text-leftWhite dark:text-white hover:bg-leftBlue dark:hover:bg-leftBlue`}
              onClick={() => handleAccordionToggle(item.id)}
            >
              <i className="w-4 fa-solid fa-file text-xl text-left float-left "></i>
              <span className="w-48 pl-4 text-left float-left">{item.label}</span>
              <span className="w-4 text-sm font-semibold float-right">
                {openItems.includes(item.id) ? " - " : " + "}
              </span>
            </button>
            {openItems.includes(item.id) && item.submenu && (
              <ul className="bg-leftBlack text-xs">
                {item.submenu.map((subItem, index) => (
                  <li key={index}>
                    <a
                      href={subItem.url}
                      className="flex items-center bg-leftBlack p-2 pl-5 text-leftWhite dark:text-white hover:bg-leftBlue dark:hover:bg-leftBlue group"
                    >
                      <span className="flex-1 ml-5 whitespace-nowrap">{subItem.subLabel}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftSideBar;
