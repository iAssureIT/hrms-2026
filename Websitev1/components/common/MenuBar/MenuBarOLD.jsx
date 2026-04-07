"use client";
import React from "react";
import { useState, useEffect } from "react";

function App(props) {
  const [isOpen, setIsOpen] = useState(false);

  const [isOpen1, setIsOpen1] = useState(false);
  const [menuItems, setmenuItems] = useState([]);
  useEffect(() => {
    setmenuItems(props.menuItemsList);
  }, []);
  // const menuItems = [
  //    { label: 'HOME', link: '/' },
  //    { label: 'ABOUT', link: '/about-us' },
  //    { label: 'BLOGS', link: '/blogs' },
  //    { label: 'TESTIMONIALS', link: '/testimonials' },
  //    { label: 'CONTACT', link: '/contact-us' },
  // ];
  return (
    <div className="bg-white">
      <nav className="flex items-center h-24 justify-between flex-wrap px-6 md:px-24 py-6 bg-white">
        <div className="flex items-center  flex-shrink-0 text-white mr-6 ">
          <a href="/">
            <img
              src={"/images/Logo.jpg"}
              className="h-16 w-60 xl:w-80"
              alt="Logo"
            />
          </a>
        </div>
        <div className="block  lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center px-3 py-2 rounded text-black-500 hover:text-black-400"
          >
            <svg
              className={`fill-current h-3 w-3 ${isOpen ? "hidden" : "block"}`}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
            <svg
              className={`fill-current h-3 w-3 ${isOpen ? "block" : "hidden"}`}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
            </svg>
          </button>
        </div>
        <div
          className={`w-full block flex-grow lg:flex lg:items-right float-right
                        lg:w-auto ${isOpen ? "block" : "hidden"}`}
        >
          <div className="text-sm lg:flex-grow">
            <ul
              id="navBar"
              className=" text-xs xxl:text-lg font-semibold flex flex-col p-4 md:p-0 mt-4 border float-right border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700"
            >
              {menuItems.map((data, index) => {
                return (
                  <li key={index}>
                    <a
                      href={data.link}
                      className="  menuText"
                      aria-current="page"
                    >
                      {data.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            {/* <div className="inline-flex items-center bg-amber-500 border-0  px-4 text-white">
            Click Me
          </div> */}
          </div>
        </div>
      </nav>
    </div>
  );
}
export default App;
