// "use client";
// import React, { useEffect, useState } from "react";
// import { usePathname } from "next/navigation";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// // import { Inter } from "next/font/google";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import Footer from "@/components/PreLoginLayout/Footer2";
// import MenuBar from "@/components/PreLoginLayout/MenuBar2";
// import "./globals.css";
// import Swal from "sweetalert2";

// axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
// // console.log("NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL)
// axios.defaults.headers.post["Content-Type"] = "application/json";
// var currentYear = new Date().getFullYear();

// const metadata = {
//   title: "MIS for Lupin Foundation CSR",
//   description: "",
// };

// const content_Menubar = {
//   logo: "/images/specific/logo.webp",
//   smallLogo: "/images/specific/logo-2.webp",
//   navCss: "m-3 grid  2xl:m-10 flex-wrap md:flex   py-0 ",
//   // "m-3 grid  2xl:m-10 flex-wrap md:flex  items-center md:gap-x-5 lg:gap-auto justify-between  md:justify-start lg:justify-between  py-0 ",
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

// const content_Footer = {
//   bgImgCss:
//     "flex fixed bottom-0 w-full flex-wrap items-center md:justify-between justify-center h-20",
//   // "relative fixed bottom-0 block shadow-lg  bg-no-repeat  max-w-full   bg-center  lg:bg-[image:var(--largeImage-url)]  bg-[image:var(--smallImage-url)] bg-[length:100%_100%] md:bg-[length:100%_100%]",
//   bgImage: "/images/specific/Footer/Footer-2.webp",
//   smallBGImage: "/images/specific/Footer/Footer-2.webp",
//   copyrightText:
//     '<span class="w-full text-black font-normal">Copyright © ' +
//     currentYear +
//     ', <span class="text-black font-bold hover:text-ftLink "><a href="/"  target="_blank" >Lupin Foundation</a></span> All Rights Reserved</span>',
//   PrivacyPageURL: "/privacy-policy",
//   footerText:
//     '<span class="text-black mr-1 mb-3">Designed & Developed By</span> <span class="text-black font-bold left hover:text-ftLink "> <a href="https://iassureit.com/" target="_blank"> iAssure International Technologies Pvt. Ltd.</a></span>',
// };
// export default function RootLayout({ children }) {
//   const pathname = usePathname();
//   const authLayoutUrls = pathname.includes("/auth/");
//   const [user_id, setUser_id] = useState();

//   const router = useRouter();

//   useEffect(() => {
//     const userDetails = localStorage.getItem("userDetails");
//     if (userDetails) {
//       const userDetailsParse = JSON.parse(userDetails);
//       const parseUser_id = userDetailsParse.user_id;
//       setUser_id(parseUser_id);
//     }

//     let userExists = pathname.includes(
//       "/" + "admin" || "executive" || "center" + "/"
//     );
//     // console.log(userExists && !userDetails);
//     if (userExists && !userDetails) {
//       // console.log(userExists && !userDetails);
//       Swal.fire(" ", "Please login first!").then(() => {
//         router.push("/auth/login");
//       });
//     }
//   }, []);
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const toggleVisibility = () => {
//       if (window.pageYOffset > 300) {
//         setIsVisible(true);
//       } else {
//         setIsVisible(false);
//       }
//     };

//     window.addEventListener("scroll", toggleVisibility);

//     return () => window.removeEventListener("scroll", toggleVisibility);
//   }, []);

//   // Scroll smoothly to the top of the page
//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: "smooth", // Smooth scrolling behavior
//     });
//   };
//   return (
//     <html lang="en" suppressHydrationWarning={true}>
//       <head>
//         <title>{metadata.title}</title>
//         {/* <link rel="icon" href="/favicon.ico" sizes="any"></link> */}
//         <link
//           rel="icon"
//           href="/images/specific/Lupin_Fevicon.webp"
//           sizes="any"
//         ></link>

//         {/*<link
//           href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,500;1,600;1,700;1,800;1,900&family=Open+Sans:ital,wght@0,500;0,700;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
//           rel="stylesheet"
//         ></link>*/}
//         <meta name="viewport" content="width=device-width" charSet="UTF-8" />
//         <script defer src="https://cdn.tailwindcss.com" async></script>
//         {/* <script
//           src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyB6q5dTwP8s_puK-X-rF7TeIbZXm5QSJjg&libraries=places`}
//           async
//           defer
//         ></script> */}
//       </head>
//       <body className={" bg-white font-MontSerrat overflow-x-hidden"}>
//         <div className="bg-white">
//           {/* <noscript>
//             <iframe
//               src={
//                 "https://www.googletagmanager.com/ns.html?id=" +
//                 process.env.REACT_APP_GOOGLE_TAG_MANAGER
//               }
//               height="0"
//               width="0"
//               style={{ display: "none", visibility: "hidden" }}
//             ></iframe>
//           </noscript> */}

//           {/* {children} */}
//           {pathname !== "/" ? (
//             children
//           ) : (
//             <div className="bg-white">
//               <MenuBar inputData={content_Menubar} />
//               {children}
//               <Footer inputData={content_Footer} />
//             </div>
//           )}
//           {/* <div
//             onClick={scrollToTop}
//             className={` fixed bottom-5 right-5 rounded-full hover:scale-110 px-2 py-1 h-8 w-8 text-white bg-green shadow-[0_3px_10px_rgb(0,0,0,0.2)]  cursor-pointer  scroll-to-top ${
//               isVisible ? "show" : "hide"
//             }`}
//           >
//             <i className="fa-solid fa-angles-up"></i>
//           </div> */}
//         </div>
//       </body>
//     </html>
//   );
// }

//Neha code
"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import axios from "axios";
// import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Footer from "@/components/PreLoginLayout/Footer2";
import MenuBar from "@/components/PreLoginLayout/MenuBar2";
import "./globals.css";
import Swal from "sweetalert2";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
// console.log("NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL)
axios.defaults.headers.post["Content-Type"] = "application/json";
var currentYear = new Date().getFullYear();

const metadata = {
  title: "HRMS 2026",
  description: "Human Resource Management System",
};

const content_Menubar = {
  logo: "",
  smallLogo: "/images/specific/logo-2.webp",
  navCss:
    "m-2 sm:m-3 flex flex-wrap items-center justify-center md:justify-between py-2 ",
  // "m-3 grid  2xl:m-10 flex-wrap md:flex  items-center md:gap-x-5 lg:gap-auto justify-between  md:justify-start lg:justify-between  py-0 ",
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

const content_Footer = {
  bgImgCss:
    "flex w-full flex-wrap items-center md:justify-between justify-center h-20 mt-0",
  // "relative fixed bottom-0 block shadow-lg  bg-no-repeat  max-w-full   bg-center  lg:bg-[image:var(--largeImage-url)]  bg-[image:var(--smallImage-url)] bg-[length:100%_100%] md:bg-[length:100%_100%]",
  bgImage: "/images/specific/Footer/Footer-2.webp",
  smallBGImage: "/images/specific/Footer/Footer-2.webp",
  copyrightText:
    '<span class="text-black font-normal">Copyright © ' +
    currentYear +
    ', <span class="text-blue-600 font-bold underline hover:text-blue-800"><a href="/"  target="_blank" >HRMS 2026</a></span> All Rights Reserved</span>',
  PrivacyPageURL: "/privacy-policy",
  footerText:
    '<span class="text-black mr-1">Designed & Developed By</span> <span class="text-blue-600 font-bold underline hover:text-blue-800"> <a href="https://iassureit.com/" target="_blank"> iAssure International Technologies Pvt. Ltd.</a></span>',
};
export default function RootLayout({ children }) {
  const pathname = usePathname();
  const authLayoutUrls = pathname.includes("/auth/");
  const [user_id, setUser_id] = useState();

  const router = useRouter();

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      const parseUser_id = userDetailsParse.user_id;
      setUser_id(parseUser_id);
    }

    let userExists = pathname.includes(
      "/" + "admin" || "executive" || "center" + "/",
    );
    // console.log(userExists && !userDetails);
    if (userExists && !userDetails) {
      // console.log(userExists && !userDetails);
      Swal.fire(" ", "Please login first!").then(() => {
        router.push("/auth/login");
      });
    }
  }, []);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll smoothly to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling behavior
    });
  };
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <title>{metadata.title}</title>
        {/* <link rel="icon" href="/favicon.ico" sizes="any"></link> */}
        <link
          rel="icon"
          href="/images/specific/Lupin_Fevicon.webp"
          sizes="any"
        ></link>

        {/*<link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,500;1,600;1,700;1,800;1,900&family=Open+Sans:ital,wght@0,500;0,700;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        ></link>*/}
        <meta name="viewport" content="width=device-width" charSet="UTF-8" />
        <script defer src="https://cdn.tailwindcss.com" async></script>
        {/* <script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyB6q5dTwP8s_puK-X-rF7TeIbZXm5QSJjg&libraries=places`}
          async
          defer
        ></script> */}
      </head>
      <body
        className={
          " bg-white font-MontSerrat overflow-x-hidden min-h-screen flex flex-col"
        }
      >
        <div className="bg-white flex-1 flex flex-col">
          {/* <noscript>
            <iframe
              src={
                "https://www.googletagmanager.com/ns.html?id=" +
                process.env.REACT_APP_GOOGLE_TAG_MANAGER
              }
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript> */}

          {/* {children} */}
          {pathname !== "/" ? (
            children
          ) : (
            <div className="bg-white flex-1 flex flex-col">
              <MenuBar inputData={content_Menubar} />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer inputData={content_Footer} />
            </div>
          )}
          {/* <div
            onClick={scrollToTop}
            className={` fixed bottom-5 right-5 rounded-full hover:scale-110 px-2 py-1 h-8 w-8 text-white bg-green shadow-[0_3px_10px_rgb(0,0,0,0.2)]  cursor-pointer  scroll-to-top ${
              isVisible ? "show" : "hide"
            }`}
          >
            <i className="fa-solid fa-angles-up"></i>
          </div> */}
        </div>
      </body>
    </html>
  );
}
