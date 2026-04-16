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
// "use client";
// import React, { useEffect, useState } from "react";
// import { idContext } from "@/context/IdContext";
// import { Inter } from "next/font/google";
// import axios from "axios";
// import Image from "next/image";
// import Sidebar from "@/components/common/LeftSideBar/Sidebar";
// import ls from "localstorage-slim";

// const inter = Inter({ subsets: ["latin"] });
// import Logo from "@/components/common/logo/logo";
// import Navbar from "@/components/common/HeaderView/Navbar";
// import { useRouter } from "next/navigation";
// import profileimg from "../../public/images/specific/user5.jpeg";
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
//   FaTools,
//   FaClipboardCheck,
//   FaChartLine,
//   FaIdCard,
//   FaTrashAlt,
//   FaCalendarCheck,
//   FaFileImport,
//   FaMoneyCheckAlt,
//   FaChartPie,
// } from "react-icons/fa";
// import { IoMdDocument, IoMdSettings } from "react-icons/io";
// import { AiOutlineProduct } from "react-icons/ai";
// import { CiMail } from "react-icons/ci";
// import { GrMoney } from "react-icons/gr";
// import { RiExchangeFundsFill } from "react-icons/ri";
// import { TbReport } from "react-icons/tb";
// import { MdOutlinePlaylistAddCheck } from "react-icons/md";

// // User Management specific

// axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
// axios.defaults.headers.post["Content-Type"] = "application/json";

// const metadata = {
//   title: "HRMS 2026",
//   description: "Human Resource Management System",
// };

// export default function RootLayout({ children }) {
//   const router = useRouter();
//   const [open, setOpen] = useState(false);
//   const [userDetails, setUserDetails] = useState(null);
//   const [approvalId, setApprovalId] = useState("");

//   useEffect(() => {
//     const details = ls.get("userDetails", { decrypt: true });
//     setUserDetails(details);
//   }, []);

//   const roles = userDetails?.role || userDetails?.roles || [];
//   const roleArray = Array.isArray(roles)
//     ? roles.map((r) => r.toString().toLowerCase())
//     : [roles.toString().toLowerCase()];

//   const isAssetRole = roleArray.some(
//     (r) =>
//       r === "admin" ||
//       r === "account-admin" ||
//       r === "account-manager" ||
//       r === "account-incharge",
//   );

//   const sidebarData = [
//     { title: "Dashboard", link: "/admin/dashboard" },

//     {
//       title: "Asset Management",
//       submenu: true,
//       icon: <BsBoxes />,
//       link: "/admin/asset-management",
//     },
//     {
//       title: "Asset Maintenance",
//       icon: <FaTools />,
//       link: "/admin/asset-management/maintenance-list",
//     },
//     {
//       title: "Asset Audit",
//       icon: <FaClipboardCheck />,
//       link: "/admin/asset-management/asset-audit",
//     },
//     {
//       title: "Asset Depreciation",
//       icon: <FaChartLine />,
//       link: "/admin/asset-management/depreciation",
//     },
//     {
//       title: "Gate Pass Management",
//       icon: <FaIdCard />,
//       link: "/admin/asset-management/gate-pass-management",
//     },
//     {
//       title: "Asset Disposal",
//       icon: <FaTrashAlt />,
//       link: "/admin/asset-management/asset-disposal",
//     },
//     {
//       title: "Employee Master",
//       icon: <FaUser />,
//       link: "/admin/asset-management/employee-master",
//     },
//     {
//       title: "Leaves",
//       icon: <FaRegCalendarAlt />,
//       link: "/admin/leaves",
//     },
//     {
//       title: "Helpdesk",
//       icon: <FaTools />,
//       link: "/admin/helpdesk",
//     },
//     {
//       title: "Vendor Master",
//       icon: <BsBank />,
//       link: "/admin/master-data/vendor-master/vendor-list",
//     },
//     {
//       title: "Master-Data",
//       submenu: true,
//       icon: <BsClipboardDataFill />,
//       submenuItems: [
//         {
//           icon: <FaRegCircle />,
//           title: "Asset Registry",
//           link: "/admin/asset-management",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Asset Maintenance",
//           link: "/admin/asset-management/maintenance-list",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Asset Audit",
//           link: "/admin/asset-management/asset-audit",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Asset Depreciation",
//           link: "/admin/asset-management/depreciation",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Gate Pass Management",
//           link: "/admin/asset-management/gate-pass-management",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Asset Disposal",
//           link: "/admin/asset-management/asset-disposal",
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
//       title: "Attendance Matrix",
//       icon: <FaCalendarCheck />,
//       link: "/admin/attendance-management/matrix",
//     },
//     // {
//     //   title: "Attendance Data Entry",
//     //   icon: <FaFileImport />,
//     //   link: "/admin/attendance-management/data-entry",
//     // },
//     {
//       title: "Payroll Management",
//       icon: <FaMoneyCheckAlt />,
//       link: "/admin/payroll-management",
//     },
//     {
//       title: "Master Data",
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
//           title: "Location Master",
//           link: "/admin/master-data/sublocation",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Asset Category Master",
//           link: "/admin/master-data/asset-category-subcategory",
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
//           title: "Asset Inspection Checklist Master",
//           link: "/admin/master-data/asset-inspection-checklist",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Asset Depreciation Master",
//           link: "/admin/master-data/asset-depreciation",
//         },
//         {
//           icon: <FaRegCircle />,
//           title: "Department Master",
//           link: "/admin/master-data/department-subdepartment",
//         },
//       ],
//     },
//     {
//       title: "Employee Master",
//       icon: <FaUser />,
//       link: "/admin/asset-management/employee-master",
//     },
//     {
//       title: "Vendor Master",
//       icon: <BsBank />,
//       link: "/admin/master-data/vendor-master/vendor-list",
//     },
//     {
//       title: "Reports Hub",
//       icon: <FaChartPie />,
//       link: "/admin/reports-hub",
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
//           <Logo open={open} />
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
//         {/* Backdrop for Mobile */}
//         {open && (
//           <div
//             className="fixed inset-0 bg-black/50 z-30 lg:hidden"
//             onClick={() => setOpen(false)}
//           />
//         )}

//         <div
//           className={`z-40 ${open ? "fixed lg:sticky w-[75%] shadow-2xl" : "w-0 lg:w-[5%]"}
//             ${
//               open
//                 ? "lg:w-[18%] lg:shadow-[5px_5px_4px_0px_rgba(245,245,245,0.7)]"
//                 : ""
//             } duration-300 bg-white h-full lg:h-auto`}
//         >
//           <Sidebar
//             sidebarData={sidebarData}
//             onItemClick={handleSidebarItemClick}
//             open={open}
//             setOpen={setOpen}
//           />
//         </div>

//         <div
//           className={`w-full
//             ${
//               open ? "lg:w-[82%] overflow-x-hidden" : "lg:w-[95%]"
//             } duration-300`}
//         >
//           <idContext.Provider value={{ approvalId, setApprovalId }}>
//             {children}
//           </idContext.Provider>
//         </div>
//       </div>
//     </div>
//     //   {/* </body>
//     // </html> */}
//   );
// }

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
import { idContext } from "@/context/IdContext";
import { Inter } from "next/font/google";
import axios from "axios";
import Image from "next/image";
import Sidebar from "@/components/common/LeftSideBar/Sidebar";
import ls from "localstorage-slim";

const inter = Inter({ subsets: ["latin"] });
import Logo from "@/components/common/logo/logo";
import Navbar from "@/components/common/HeaderView/Navbar";
import { useRouter } from "next/navigation";
import profileimg from "../../public/images/specific/user5.jpeg";
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
  FaTools,
  FaClipboardCheck,
  FaChartLine,
  FaIdCard,
  FaTrashAlt,
  FaCalendarCheck,
  FaFileImport,
  FaMoneyCheckAlt,
  FaChartPie,
  FaHeadset,
  FaUserTie,
} from "react-icons/fa";
import { IoMdDocument, IoMdSettings } from "react-icons/io";
import { AiOutlineProduct } from "react-icons/ai";
import { CiMail } from "react-icons/ci";
import { GrMoney } from "react-icons/gr";
import { RiExchangeFundsFill } from "react-icons/ri";
import { TbReport } from "react-icons/tb";
import { MdOutlinePlaylistAddCheck } from "react-icons/md";

// User Management specific

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

const metadata = {
  title: "HRMS 2026",
  description: "Human Resource Management System",
};

export default function RootLayout({ children }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [approvalId, setApprovalId] = useState("");

  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setUserDetails(details);
  }, []);

  const roles = userDetails?.role || userDetails?.roles || [];
  const roleArray = Array.isArray(roles)
    ? roles.map((r) => r.toString().toLowerCase())
    : [roles.toString().toLowerCase()];

  const isAssetRole = roleArray.some(
    (r) =>
      r === "admin" ||
      r === "account-admin" ||
      r === "account-manager" ||
      r === "account-incharge",
  );

  const sidebarData = [
    { title: "Dashboard", link: "/admin/dashboard" },

    {
      title: "Asset Management",
      submenu: true,
      icon: <BsBoxes />,
      submenuItems: [
        {
          icon: <FaRegCircle />,
          title: "Asset Registry",
          link: "/admin/asset-management",
        },
        {
          icon: <FaRegCircle />,
          title: "Asset Maintenance",
          link: "/admin/asset-management/maintenance-list",
        },
        {
          icon: <FaRegCircle />,
          title: "Asset Audit",
          link: "/admin/asset-management/asset-audit",
        },
        {
          icon: <FaRegCircle />,
          title: "Asset Depreciation",
          link: "/admin/asset-management/depreciation",
        },
        {
          icon: <FaRegCircle />,
          title: "Gate Pass Management",
          link: "/admin/asset-management/gate-pass-management",
        },
        {
          icon: <FaRegCircle />,
          title: "Asset Disposal",
          link: "/admin/asset-management/asset-disposal",
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
      title: "Attendance Matrix",
      icon: <FaCalendarCheck />,
      link: "/admin/attendance-management/matrix",
    },
    {
      title: "Payroll Management",
      icon: <FaMoneyCheckAlt />,
      link: "/admin/payroll-management",
    },
    {
      title: "Holidays",
      icon: <FaRegCalendarAlt />,
      link: "/admin/holidays",
    },
    {
      title: "Leave Management",
      icon: <FaCalendarCheck />,
      link: "/admin/leaves",
    },
    {
      title: "Helpdesk",
      icon: <FaHeadset />,
      link: "/admin/helpdesk",
    },
    {
      title: "Master Data",
      submenu: true,
      icon: <BsClipboardDataFill />,
      submenuItems: [
        {
          icon: <FaRegCircle />,
          title: "Center Details",
          link: "/admin/master-data/center-details/center-details-list",
        },
        {
          icon: <FaRegCircle />,
          title: "Location Master",
          link: "/admin/master-data/sublocation",
        },
        {
          icon: <FaRegCircle />,
          title: "Asset Category Master",
          link: "/admin/master-data/asset-category-subcategory",
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
          title: "Asset Inspection Checklist Master",
          link: "/admin/master-data/asset-inspection-checklist",
        },
        {
          icon: <FaRegCircle />,
          title: "Asset Depreciation Master",
          link: "/admin/master-data/asset-depreciation",
        },
        {
          icon: <FaRegCircle />,
          title: "Department Master",
          link: "/admin/master-data/department-subdepartment",
        },

      ],
    },
    {
      icon: <FaUser />,
      title: "Employee Master",
      link: "/admin/asset-management/employee-master",
    },
    {
      icon: <FaUserTie />,
      title: "Vendor Master",
      link: "/admin/master-data/vendor-master/vendor-list",
    },
    {
      title: "Settings",
      icon: <IoMdSettings />,
      link: "/admin/settings",
    },
    {
      title: "Reports Hub",
      icon: <FaChartPie />,
      link: "/admin/reports-hub",
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
          className={`sticky top-0 z-10 transition-all duration-300 
            ${open ? "w-[100%] lg:w-[230px]" : " w-[100%] lg:w-[50px]"} 
            `}
        >
          <Logo open={open} />
        </div>
        <div
          className={`sticky top-0 left-0 z-50 flex-grow transition-all duration-300`}
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

        {/* Sidebar Container - Displaces content on desktop */}
        <div
          className={`z-40 transition-all duration-300 relative ${open ? "w-[75%] lg:w-[230px]" : "w-0 lg:w-[50px]"} 
            bg-[#222d32] h-[calc(100vh-52px)] overflow-y-auto`}
        >
          <Sidebar
            sidebarData={sidebarData}
            onItemClick={handleSidebarItemClick}
            open={open}
            setOpen={setOpen}
          />
        </div>

        {/* Main Content Area */}
        <div
          className={`flex-grow h-[calc(100vh-52px)] overflow-y-auto admin-content-area p-4 bg-[#f4f6f9]`}
        >
          <idContext.Provider value={{ approvalId, setApprovalId }}>
            {children}
          </idContext.Provider>
        </div>
      </div>
    </div>
    //   {/* </body>
    // </html> */}
  );
}