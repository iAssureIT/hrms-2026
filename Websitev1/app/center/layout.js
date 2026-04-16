// Akshay's Layout

"use client";
import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import axios from "axios";
import Image from "next/image";
import Sidebar from "@/components/common/LeftSideBar/Sidebar";
import Navbar from "@/components/common/HeaderView/Navbar";
import ls from "localstorage-slim";
import Logo from "@/components/common/logo/logo";
import { useRouter } from "next/navigation";
import profileimg from "../../public/images/generic/userimage.jpg";
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
  FaBuilding,
  FaTools,
  FaCalendarCheck,
  FaHeadset,
} from "react-icons/fa";
import { IoMdDocument, IoMdSettings } from "react-icons/io";
import { AiOutlineProduct } from "react-icons/ai";
import { CiMail } from "react-icons/ci";
import { GrMoney } from "react-icons/gr";
import { RiExchangeFundsFill } from "react-icons/ri";
import { TbReport } from "react-icons/tb";
import { idContext } from "@/context/IdContext";

// User Management specific

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

const metadata = {
  title: "HRMS 2026",
  description: "Human Resource Management System",
};

export default function RootLayout({ children }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [approvalId, setApprovalId] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setUserDetails(details);
  }, []);

  const sidebarData = [
    { title: "Dashboard", link: "/center/dashboard" },
    {
      title: "Master-Data",
      submenu: true,
      icon: <BsClipboardDataFill />,
      submenuItems: [
        // {
        //   icon: <FaRegCircle />,
        //   title: "Employee Master",
        //   link: "/center/asset-management/employee-master",
        // },
      ],
    },
    {
      title: "Annual Plan",
      icon: <FaRegCalendarAlt />,
      link: "/center/annual-plan-management/annual-list",
    },
    // {
    //   title: "Asset Management",
    //   submenu: true,
    //   icon: <BsBoxes />,
    //   submenuItems: [
    //     {
    //       icon: <FaRegCircle />,
    //       title: "Asset Management",
    //       link: "/center/asset-management",
    //     },
    //     {
    //       icon: <FaRegCircle />,
    //       title: "Asset Maintenance",
    //       link: "/center/asset-management/maintenance-list",
    //     },
    //     {
    //       icon: <FaRegCircle />,
    //       title: "Asset Audit",
    //       link: "/center/asset-management/asset-audit",
    //     },
    //     // {
    //     //   icon: <FaRegCircle />,
    //     //   title: "Asset Financials",
    //     //   link: "/center/reports/asset-financials",
    //     // },
    //     {
    //       icon: <FaRegCircle />,
    //       title: "Asset Depreciation",
    //       link: "/center/reports/depreciation",
    //     },
    //     {
    //       icon: <FaRegCircle />,
    //       title: "Gate Pass Management",
    //       link: "/center/asset-management/gate-pass-management",
    //     },
    //     {
    //       icon: <FaRegCircle />,
    //       title: "Asset Disposal",
    //       link: "/center/asset-management/asset-disposal",
    //     },
    //   ],
    // },
    {
      title: "Approval Management",
      icon: <BsJournalCheck />,
      link: "/center/approval-management/approval-list",
    },
    {
      title: "Utilization Management",
      icon: <RiExchangeFundsFill />,
      link: "/center/utilization-management/utilization-list",
    },
    {
      title: "Fund Management",
      submenu: true,
      icon: <GrMoney />,
      submenuItems: [
        {
          icon: <FaRegCircle />,
          title: "External Grant",
          link: "/center/fund-management/external-grant-list",
        },
        {
          icon: <FaRegCircle />,
          title: "Community Contribution",
          link: "/center/fund-management/cc-list",
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
          link: "/center/reports/approval-vs-utilization",
        },
        {
          icon: <FaRegCircle />,
          title: "Plan vs Utilization",
          link: "/center/reports/plan-vs-utilization",
        },
        {
          icon: <FaRegCircle />,
          title: "Fund Status",
          link: "/center/reports/fund-status",
        },
        {
          icon: <FaRegCircle />,
          title: "Grant Report",
          link: "/center/reports/grant-report",
        },
        {
          icon: <FaRegCircle />,
          title: "Contribution Report",
          link: "/center/reports/contribution-report",
        },
        {
          icon: <FaRegCircle />,
          title: "Convergence Report",
          link: "/center/reports/convergence-report",
        },
        {
          icon: <FaRegCircle />,
          title: "Plantation",
          link: "/center/reports/plantation",
        },
        {
          icon: <FaRegCircle />,
          title: "WRD",
          link: "/center/reports/wrd",
        },
      ],
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
      title: "Center Profile",
      icon: <FaBuilding />,
      link: `/center/center-profile/${userDetails?.center_id}`,
    },
    {
      title: "HRMS User Manual",
      icon: <IoMdDocument />,
      link: "/files/User Manual_Lupin_Center.pdf",
    },
  ];

  const handleSidebarItemClick = (link) => {
    if (link) {
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
          <Logo open={open} />
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
            } duration-300 bg-white h-[calc(100vh-52px)] overflow-y-auto custom-sidebar-scrollbar`}
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
              : " lg:w-[95%]"
            } duration-300`}
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
