"use client";
import React from "react";
import classNames from "classnames";
import { useState } from "react";
import { Router } from "react-router-dom";

// const menuItems
export default function Sidebar() {
  const [toggleCollapse, setToggleCollapse] = useState(false);
  const [isCollapsible, setisCollapsible] = useState(false);
  // const activeMenu = useMemo(()=>menuItems.find(menu=> menu.link ===Router.pathname),[router.pathname] )
  const wrapperClasses = classNames(
    "h-screen px-4 pt-8 pb-4 bg-light flex justify-between flex-col border border-dashed ",
    {
      ["w-80"]: !toggleCollapse,
      ["w-30"]: toggleCollapse,
    }
  );
  const collapseIconClasses = classNames(
    "p-4 rounded bg-light-lighter absolute right-10 top-",
    {
      "rotate-90": toggleCollapse,
    }
  );
  // const navItemClasses=(menu)=>{
  //     return classNames('flex item-center cursor-pointer hover:bg-light rounded overflow-hidden whitespace-nowrap',
  //     {
  //         // ["bg-light-lighter"]:activeMenu.id ===menu.id,
  //     })
  // }
  return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between relative">
          {isCollapsible && (
            <button
              className={collapseIconClasses}
              onClick={handleSidebarToggle}
            >
              <i className="fa-solid fa-angles-up"></i>
            </button>
          )}
          <div className="flex items-center pl-1 gap-4 w-44">
            <div>
              <img src="/images/Logo.jpg"  alt="logo" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start mt-24">
          <div className="sidebarLink">
            <a href="/user/company-details">Company Profile</a>{" "}
          </div>
          <div className="sidebarLink">
            <a href="/user/testimonials/my-given-testimonials">Testimonials</a>
          </div>
          <div className="sidebarLink">Blogs</div>
          <div className="sidebarLink">Thank You Notes</div>
        </div>
      </div>
  );
}
