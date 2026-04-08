// "use client";
// import React, { useEffect, useState } from "react";
// import { usePathname } from "next/navigation";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import Footer from "@/components/PreLoginLayout/Footer2";
// import MenuBar from "@/components/PreLoginLayout/MenuBar2";

// var currentYear = new Date().getFullYear();

// const content_Menubar = {
//   logo: "/images/specific/logo.webp",
//   smallLogo: "/images/specific/logo-2.webp",
//   navCss: "m-3 grid  2xl:m-10 flex-wrap md:flex   py-0 ",
//   // "m-3 2xl:m-10 flex flex-wrap items-center md:gap-x-5 lg:gap-auto justify-between  md:justify-start lg:justify-between  py-0 ",
//   classForLogoLink: "sm:w-1/4",
//   classForLogo: "h-full w-1/3 md:w-full lg:w-1/3 xl:w-1/2 ",
//   showLoginbutton: false,
//   bgImageCss: "w-full 2xl:w-4/5 xxl:!w-auto h-auto object-cover ",
//   bigImageAlt: "BigImage",
//   gridCss:
//     "grid grid-cols-1  lg:grid-cols-3   xl:grid-cols-3 2xl:grid-cols-3 xxl:!grid-cols-2 gap-10",
//   repeatedBlkCss: " shadow-none flex flex-start py-2 text-sm md:py-2 ",
//   imgCss:
//     "flex-none shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] h-auto hidden lg:block ml-10 my-auto rounded mr-3 md:mr-10 object-cover",
//   titleCss: "font-semibold text-sm sm:text-md mb-2 hover:text-gray-500  ",
//   desCss: "text-gray-700 text-xs sm:text-base overflow-hidden",
//   linkCss: "float-right px-4 text-skyBlue",
// };

// const content_Footer2 = {
//   bgImgCss:
//     "flex w-full flex-wrap items-center md:justify-between justify-center h-20 mt-0",
//   // "relative fixed bottom-0 block shadow-lg  bg-no-repeat  max-w-full   bg-center  lg:bg-[image:var(--largeImage-url)]  bg-[image:var(--smallImage-url)] bg-[length:100%_100%] md:bg-[length:100%_100%]",
//   bgImage: "/images/specific/Footer/Footer-2.webp",
//   smallBGImage: "/images/specific/Footer/Footer-2.webp",
//   copyrightText:
//     '<span class="w-full text-black font-normal">Copyright © ' +
//     currentYear +
//     ', <span class="text-blue-600 font-bold underline hover:text-ftLink "><a href="/"  target="_blank" >Lupin Foundation</a></span> All Rights Reserved</span>',
//   PrivacyPageURL: "/privacy-policy",
//   footerText:
//     '<span class="text-black mr-1 mb-3">Designed & Developed By</span> <span class="text-blue-600 font-bold underline left hover:text-ftLink "> <a href="https://iassureit.com/" target="_blank"> iAssure International Technologies Pvt. Ltd.</a></span>',
// };
// export default function RootLayout({ children }) {
//   return (
//     <div className="bg-white min-h-screen flex flex-col">
//       <MenuBar inputData={content_Menubar} />
//       <main className="flex-1 flex flex-col">{children}</main>
//       <Footer inputData={content_Footer2} />
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Footer from "@/components/PreLoginLayout/Footer2";
import MenuBar from "@/components/PreLoginLayout/MenuBar2";

var currentYear = new Date().getFullYear();

const content_Menubar = {
  logo: "/images/specific/logo.webp",
  smallLogo: "/images/specific/logo-2.webp",
  navCss: "grid  2xl:m-10 flex-wrap md:flex   py-0 ",
  // "m-3 2xl:m-10 flex flex-wrap items-center md:gap-x-5 lg:gap-auto justify-between  md:justify-start lg:justify-between  py-0 ",
  classForLogoLink: "sm:w-1/4",
  classForLogo: "h-full w-1/3 md:w-full lg:w-1/3 xl:w-1/2 ",
  showLoginbutton: false,
  bgImageCss: "w-full 2xl:w-4/5 xxl:!w-auto h-auto object-cover ",
  bigImageAlt: "BigImage",
  gridCss:
    "grid grid-cols-1  lg:grid-cols-3   xl:grid-cols-3 2xl:grid-cols-3 xxl:!grid-cols-2 gap-10",
  repeatedBlkCss: " shadow-none flex flex-start py-2 text-sm md:py-2 ",
  imgCss:
    "flex-none shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] h-auto hidden lg:block ml-10 my-auto rounded mr-3 md:mr-10 object-cover",
  titleCss: "font-semibold text-sm sm:text-md mb-2 hover:text-gray-500  ",
  desCss: "text-gray-700 text-xs sm:text-base overflow-hidden",
  linkCss: "float-right px-4 text-skyBlue",
};

const content_Footer2 = {
  bgImgCss:
    "flex fixed bottom-0 w-full flex-wrap items-center md:justify-between justify-center h-20",
  bgImage: "/images/specific/Footer/Footer-2.webp",
  smallBGImage: "/images/specific/Footer/Footer-2.webp",
  copyrightText:
    '<span class="w-full text-black font-normal">Copyright © ' +
    currentYear +
    ', <span class="text-black font-bold hover:text-blue-600 hover:underline"><a href="/"  target="_blank" >Lupin Foundation</a></span> All Rights Reserved</span>',
  PrivacyPageURL: "/privacy-policy",
  footerText:
    '<span class="text-black mr-1 mb-3">Designed & Developed By</span> <span class="text-black font-bold hover:text-blue-600 hover:underline"> <a href="https://iassureit.com/" target="_blank"> iAssure International Technologies Pvt. Ltd.</a></span>',
};
export default function RootLayout({ children }) {
  return (
    <div className="fixed inset-0 h-[100dvh] overflow-hidden bg-white">
      <MenuBar inputData={content_Menubar} />
      {children}
      <Footer inputData={content_Footer2} />
    </div>
  );
}
