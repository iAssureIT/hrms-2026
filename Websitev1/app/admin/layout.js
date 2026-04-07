// Akshay's Layout

// "use client";
// import React, { useEffect, useState } from "react";
// import { Inter } from "next/font/google";
// import axios from "axios";
// import Image from "next/image";
// import Sidebar from "@/components/common/LeftSideBar/Sidebar";
// import Navbar from "@/components/common/HeaderView/Navbar";
// import Logo from "@/components/common/logo/logo";
// import { useRouter } from "next/navigation";
// import profileimg from "../../public/images/specific/user5.jpeg";
// import logoimgfull from "../../public/images/specific/logo.webp";
// import logoimgsm from "../../public/images/specific/logo-2.webp";

// const inter = Inter({ subsets: ["latin"] });
// import {
//   BsBank,
//   BsBoxes,
//   BsClipboardDataFill,
//   BsJournalCheck,
// } from "react-icons/bs";
// import { MdLogout, MdOutlineWarehouse } from "react-icons/md";
// import {
//   FaBell,
//   FaUser,
//   FaRegBell,
//   FaRegCircle,
//   FaRegCalendarAlt,
//   FaList,
// } from "react-icons/fa";
// import { IoMdDocument, IoMdSettings } from "react-icons/io";
// import { AiOutlineProduct } from "react-icons/ai";
// import { CiMail } from "react-icons/ci";
// import { GrMoney } from "react-icons/gr";
// import { RiExchangeFundsFill } from "react-icons/ri";
// import { TbReport } from "react-icons/tb";

// // User Management specific

// axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
// axios.defaults.headers.post["Content-Type"] = "application/json";

// const metadata = {
//   title: "LupinMIS",
//   description: " ",
// };

// export default function RootLayout({ children }) {
//   const router = useRouter();
//   const [open, setOpen] = useState(true);

//   const sidebarData = [
//     { logoimgfull: logoimgfull },
//     { logoimgsm: logoimgsm },
//     { title: "Dashboard", link: "/admin/dashboard" },
//     {
//       title: "Master-Data",
//       submenu: true,
//       icon: <BsClipboardDataFill />,
//       submenuItems: [
//         {
//           icon: <FaRegCircle />,
//           title: "Center Details",
//           link: "/admin/master-data/center-details/center-details-list",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Bank Details",
//           link: "/admin/master-data/bank-details/bank-details-list",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Unit of Measurement",
//           link: "/admin/master-data/unit",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Program-Project-Activity",
//           link: "/admin/master-data/program-project-activity-subactivity",
//         },
//         // {
//         //   icon: <FaRegCircle />,
//         //   title: "Programs",
//         //   link: "/admin/master-data/program",
//         // },
//         // {
//         //   icon: <FaRegCircle />,
//         //   title: "Projects",
//         //   link: "/admin/master-data/project",
//         // },
//         {
//           icon: <FaRegCircle />,
//           title: "Activity Approval Level",
//           link: "/admin/master-data/approval-level-management/approval-level-list",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Utilization Approval Level",
//           link: "/admin/master-data/utilization-approval-level/utilization-approval-level-list",
//         },
//       ],
//     },
//     {
//       title: "Annual Plan",
//       icon: <FaRegCalendarAlt />,
//       link: "/admin/annual-plan-management/annual-list",
//     },
//     {
//       title: "Approval Management",
//       icon: <BsJournalCheck />,
//       link: "/admin/approval-management/approval-list",
//     },
//     {
//       title: "Utilization Management",
//       icon: <RiExchangeFundsFill />,
//       link: "/admin/utilization-management/utilization-list",
//     },
//     {
//       title: "Fund Management",
//       submenu: true,
//       icon: <GrMoney />,
//       submenuItems: [
//         {
//           icon: <FaRegCircle />,
//           title: "External Grant",
//           link: "/admin/fund-management/external-grant-list",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Community Contribution",
//           link: "/admin/fund-management/cc-list",
//         },
//       ],
//     },
//     {
//       title: "User Management",
//       icon: <FaUser />,
//       link: "/admin/user-management",
//     },
//     {
//       title: "Notification Management",
//       submenu: true,
//       icon: <FaBell />,
//       submenuItems: [
//         {
//           icon: <FaRegCircle />,
//           title: "Create New Template",
//           link: "/admin/notification-management/create-new-template",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Email Template",
//           link: "/admin/notification-management/email-template",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "SMS Template",
//           link: "/admin/notification-management/sms-template",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "IN-APP Template",
//           link: "/admin/notification-management/in-app-template",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Whatsapp Template",
//           link: "/admin/notification-management/whatsapp-template",
//         },
//       ],
//     },

//     {
//       title: "Reports",
//       submenu: true,
//       icon: <TbReport size={20} />,
//       submenuItems: [
//         {
//           icon: <FaRegCircle />,
//           title: "Approval vs Utilization",
//           link: "/admin/reports/approval-vs-utilization",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Plan vs Utilization",
//           link: "/admin/reports/plan-vs-utilization",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Fund Status",
//           link: "/admin/reports/fund-status",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Grant Report",
//           link: "/admin/reports/grant-report",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Contribution Report",
//           link: "/admin/reports/contribution-report",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Convergence Report",
//           link: "/admin/reports/convergence-report",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Plantation",
//           link: "/admin/reports/plantation",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "WRD",
//           link: "/admin/reports/wrd",
//         },
//       ],
//     },
//     {
//       title: "User Manual",
//       icon: <IoMdDocument />,
//       link: "/files/User_Manual_Lupin_Admin.pdf",
//     },
//   ];

//   const handleSidebarItemClick = (link) => {
//     if (link) {
//       // window.open(link, '_blank', 'noopener,noreferrer');
//       router.push(link);
//     }
//   };

//   const navbarData = [
//     // { title: <CiMail /> },
//     // { title: <FaRegBell /> },
//     { image: profileimg },
//   ];

//   const profileMenus = [
//     { image: profileimg },
//     { title: "My Profile", icon: <BsBoxes /> },
//     { title: "Sign Out", icon: <IoMdSettings /> },
//     // { title: "Web App", icon: <MdLogout />, link: "/web-app" },
//     // { title: "E-commerce", icon: <MdLogout />, link: "/e-commerce" },
//   ];
//   return (
//     // <html lang="en">
//     // <head>
//     //   <title>{metadata.title}</title>
//     // </head>

//     // <body>
//     <div>
//       <div className={`block lg:flex sticky top-0 z-50`}>
//         <div
//           className={`sticky top-0 z-10 
//             ${
//               open ? "w-[100%] lg:w-[18%]" : " w-[100%] lg:w-[5%]"
//             } duration-300 `}
//         >
//           <Logo sidebarData={sidebarData} open={open} setOpen={setOpen} />
//         </div>
//         <div
//           className={`sticky top-0 left-0 z-50
//               ${
//                 open ? "w-[100%] lg:w-[82%]" : " w-[100%] lg:w-[95%]"
//               } duration-300`}
//         >
//           <Navbar
//             navbarData={navbarData}
//             profileMenus={profileMenus}
//             onItemClick={handleSidebarItemClick}
//             open={open}
//             setOpen={setOpen}
//           />
//         </div>
//       </div>

//       <div className={`flex`}>
//         <div
//           className={`z-20 sticky
//                 ${
//                   open
//                     ? "shadow-[5px_5px_4px_0px_rgba(245,245,245,0.7)] w-[60%] lg:w-[18%]"
//                     : "shadow-[5px_5px_4px_0px_rgba(245,245,245,0.7)] w-[0%] lg:w-[5%]"
//                 } duration-300`}
//         >
//           <Sidebar
//             sidebarData={sidebarData}
//             onItemClick={handleSidebarItemClick}
//             open={open}
//             setOpen={setOpen}
//           />
//         </div>
//         <div
//           className={` 
//               ${
//                 open
//                   ? "w-[40%] lg:w-[82%] overflow-x-hidden"
//                   : " w-[100%] lg:w-[95%]"
//               } duration-300`}
//         >
//           {children}
//         </div>
//       </div>
//     </div>
//     //   {/* </body>
//     // </html> */}
//   );
// }










// changes by Neha 
"use client";
import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import axios from "axios";
import Image from "next/image";
import Sidebar from "@/components/common/LeftSideBar/Sidebar";
import Navbar from "@/components/common/HeaderView/Navbar";
import Logo from "@/components/common/logo/logo";
import { useRouter } from "next/navigation";
import profileimg from "../../public/images/specific/user5.jpeg";
import logoimgfull from "../../public/images/specific/logo.webp";
import logoimgsm from "../../public/images/specific/logo-2.webp";

const inter = Inter({ subsets: ["latin"] });
import {
  BsBank,
  BsBoxes,
  BsClipboardDataFill,
  BsJournalCheck,
} from "react-icons/bs";
import { MdLogout, MdOutlineWarehouse } from "react-icons/md";
import {
  FaBell,
  FaUser,
  FaRegBell,
  FaRegCircle,
  FaRegCalendarAlt,
  FaList,
} from "react-icons/fa";
import { IoMdDocument, IoMdSettings } from "react-icons/io";
import { AiOutlineProduct } from "react-icons/ai";
import { CiMail } from "react-icons/ci";
import { GrMoney } from "react-icons/gr";
import { RiExchangeFundsFill } from "react-icons/ri";
import { TbReport } from "react-icons/tb";

// User Management specific

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

const metadata = {
  title: "LupinMIS",
  description: " ",
};

export default function RootLayout({ children }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const sidebarData = [
    { logoimgfull: logoimgfull },
    { logoimgsm: logoimgsm },
    { title: "Dashboard", link: "/admin/dashboard" },
    {
      title: "Master-Data",
      submenu: true,
      icon: <BsClipboardDataFill />,
      submenuItems: [
        {
          icon: <FaRegCircle />,
          title: "Asset Category",
          link: "/admin/master-data/asset-category",
        },
        {
          icon: <FaRegCircle />,
          title: "Asset Subcategory",
          link: "/admin/master-data/asset-subcategory",
        },
        {
          icon: <FaRegCircle />,
          title: "Location & Sub-Location",
          link: "/admin/master-data/location-subcategory",
        },
        {
          icon: <FaRegCircle />,
          title: "Department & Sub-Department",
          link: "/admin/master-data/department",
        },
        {
          icon: <FaRegCircle />,
          title: "Center Details",
          link: "/admin/master-data/center-details/center-details-list",
        },
        {
          icon: <FaRegCircle />,
          title: "Bank Details",
          link: "/admin/master-data/bank-details/bank-details-list",
        },
        {
          icon: <FaRegCircle />,
          title: "Unit of Measurement",
          link: "/admin/master-data/unit",
        },
        {
          icon: <FaRegCircle />,
          title: "Program-Project-Activity",
          link: "/admin/master-data/program-project-activity-subactivity",
        },
        // {
        //   icon: <FaRegCircle />,
        //   title: "Programs",
        //   link: "/admin/master-data/program",
        // },
        // {
        //   icon: <FaRegCircle />,
        //   title: "Projects",
        //   link: "/admin/master-data/project",
        // },
        {
          icon: <FaRegCircle />,
          title: "Activity Approval Level",
          link: "/admin/master-data/approval-level-management/approval-level-list",
        },
        {
          icon: <FaRegCircle />,
          title: "Utilization Approval Level",
          link: "/admin/master-data/utilization-approval-level/utilization-approval-level-list",
        },
        {
          icon: <FaRegCircle />,
          title: "Account Header Master",
          link: "/admin/master-data/account-header-master",
        },
        {
          icon: <FaRegCircle />,
          title: "TDS Master",
          link: "/admin/master-data/tds-master",
        },
        {
          icon: <FaRegCircle />,
          title: "Vendor Master",
          link: "/admin/master-data/vendor-master/add-vendor",
        },
      ],
    },
    {
      title: "Annual Plan",
      icon: <FaRegCalendarAlt />,
      link: "/admin/annual-plan-management/annual-list",
    },
    {
      title: "Asset Management",
      icon: <BsBoxes />,
      link: "/admin/asset-management",
    },
    {
      title: "Approval Management",
      icon: <BsJournalCheck />,
      link: "/admin/approval-management/approval-list",
    },
    {
      title: "Utilization Management",
      icon: <RiExchangeFundsFill />,
      link: "/admin/utilization-management/utilization-list",
    },
    {
      title: "Fund Management",
      submenu: true,
      icon: <GrMoney />,
      submenuItems: [
        {
          icon: <FaRegCircle />,
          title: "External Grant",
          link: "/admin/fund-management/external-grant-list",
        },
        {
          icon: <FaRegCircle />,
          title: "Community Contribution",
          link: "/admin/fund-management/cc-list",
        },
      ],
    },
    {
      title: "User Management",
      icon: <FaUser />,
      link: "/admin/user-management",
    },
    {
      title: "Notification Management",
      submenu: true,
      icon: <FaBell />,
      submenuItems: [
        {
          icon: <FaRegCircle />,
          title: "Create New Template",
          link: "/admin/notification-management/create-new-template",
        },
        {
          icon: <FaRegCircle />,
          title: "Email Template",
          link: "/admin/notification-management/email-template",
        },
        {
          icon: <FaRegCircle />,
          title: "SMS Template",
          link: "/admin/notification-management/sms-template",
        },
        {
          icon: <FaRegCircle />,
          title: "IN-APP Template",
          link: "/admin/notification-management/in-app-template",
        },
        {
          icon: <FaRegCircle />,
          title: "Whatsapp Template",
          link: "/admin/notification-management/whatsapp-template",
        },
      ],
    },

    {
      title: "Reports",
      submenu: true,
      icon: <TbReport size={20} />,
      submenuItems: [
        {
          icon: <FaRegCircle />,
          title: "Approval vs Utilization",
          link: "/admin/reports/approval-vs-utilization",
        },
        {
          icon: <FaRegCircle />,
          title: "Plan vs Utilization",
          link: "/admin/reports/plan-vs-utilization",
        },
        {
          icon: <FaRegCircle />,
          title: "Fund Status",
          link: "/admin/reports/fund-status",
        },
        {
          icon: <FaRegCircle />,
          title: "Grant Report",
          link: "/admin/reports/grant-report",
        },
        {
          icon: <FaRegCircle />,
          title: "Contribution Report",
          link: "/admin/reports/contribution-report",
        },
        {
          icon: <FaRegCircle />,
          title: "Convergence Report",
          link: "/admin/reports/convergence-report",
        },
        {
          icon: <FaRegCircle />,
          title: "Plantation",
          link: "/admin/reports/plantation",
        },
        {
          icon: <FaRegCircle />,
          title: "WRD",
          link: "/admin/reports/wrd",
        },
      ],
    },
    {
      title: "User Manual",
      icon: <IoMdDocument />,
      link: "/files/User_Manual_Lupin_Admin.pdf",
    },
  ];

  const handleSidebarItemClick = (link) => {
    if (link) {
      // window.open(link, '_blank', 'noopener,noreferrer');
      router.push(link);
    }
  };

  const navbarData = [
    // { title: <CiMail /> },
    // { title: <FaRegBell /> },
    { image: profileimg },
  ];

  const profileMenus = [
    { image: profileimg },
    { title: "My Profile", icon: <BsBoxes /> },
    { title: "Sign Out", icon: <IoMdSettings /> },
    // { title: "Web App", icon: <MdLogout />, link: "/web-app" },
    // { title: "E-commerce", icon: <MdLogout />, link: "/e-commerce" },
  ];
  return (
    // <html lang="en">
    // <head>
    //   <title>{metadata.title}</title>
    // </head>

    // <body>
    <div>
      <div className={`block lg:flex sticky top-0 z-50`}>
        <div
          className={`sticky top-0 z-10 
            ${open ? "w-[100%] lg:w-[18%]" : " w-[100%] lg:w-[5%]"
            } duration-300 `}
        >
          <Logo sidebarData={sidebarData} open={open} setOpen={setOpen} />
        </div>
        <div
          className={`sticky top-0 left-0 z-50
              ${open ? "w-[100%] lg:w-[82%]" : " w-[100%] lg:w-[95%]"
            } duration-300`}
        >
          <Navbar
            navbarData={navbarData}
            profileMenus={profileMenus}
            onItemClick={handleSidebarItemClick}
            open={open}
            setOpen={setOpen}
          />
        </div>
      </div>

      <div className={`flex`}>
        {/* Backdrop for Mobile */}
        {open && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <div
          className={`z-40 ${open ? "fixed lg:sticky w-[75%] shadow-2xl" : "w-0 lg:w-[5%]"} 
            ${open ? "lg:w-[18%] lg:shadow-[5px_5px_4px_0px_rgba(245,245,245,0.7)]" : ""
            } duration-300 bg-white h-full lg:h-auto`}
        >
          <Sidebar
            sidebarData={sidebarData}
            onItemClick={handleSidebarItemClick}
            open={open}
            setOpen={setOpen}
          />
        </div>

        <div
          className={`w-full 
            ${open
              ? "lg:w-[82%] overflow-x-hidden"
              : "lg:w-[95%]"
            } duration-300`}
        >
          {children}
        </div>
      </div>
    </div>
    //   {/* </body>
    // </html> */}
  );
}

