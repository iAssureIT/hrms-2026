import React, { useState, useEffect, useRef } from "react";

function MenuBar2(props) {
  return (
    <>
      <div id={"Menubar"} className="relative z-10 w-full p-2 bg-white">
        <nav className="navBar1 bg-transparent border-gray-200  ">
          <div
            className={
              props?.inputData?.navCss
                ? props?.inputData?.navCss
                : "max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"
            }
          >
            <a className={props?.inputData?.classForLogoLink} href="/">
              <img
                id="navLogo"
                src={props.inputData.logo}
                className={props.inputData?.classForLogo + " lazyload"}
                alt="Logo"
              />
            </a>

            <div className="w-full lg:w-auto text-center lg:text-right mt-4 lg:mt-0 lg:ml-auto flex-1">
              <h1 className="heading text-xl md:text-3xl font-extrabold text-gray-800">
                HRMS 2026 Management Suite
              </h1>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
export default MenuBar2;
