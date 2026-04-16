// Akshay's Layout

"use client";
import React, { useEffect, useState } from "react";
import { idContext } from "@/context/IdContext";
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
  FaTools,
  FaClipboardCheck,
  FaChartLine,
  FaIdCard,
  FaTrashAlt,
  FaUserTie,
  FaListUl,
  FaCalendarCheck,
  FaFileImport,
  FaMoneyCheckAlt,
  FaChartPie,
  FaHeadset,
} from "react-icons/fa";
import { IoMdDocument, IoMdSettings } from "react-icons/io";
import { AiOutlineProduct } from "react-icons/ai";
import { CiMail } from "react-icons/ci";
import { GrMoney } from "react-icons/gr";
import { RiExchangeFundsFill } from "react-icons/ri";
import { TbReport } from "react-icons/tb";
// import { idContext } from "@/app/admin/layout";

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

  const roles = userDetails?.role || userDetails?.roles || [];
  const roleArray = Array.isArray(roles)
    ? roles.map((r) => r.toString().toLowerCase())
    : [roles.toString().toLowerCase()];

  const isAssetRole = roleArray.some(
    (r) =>
      r === "admin" ||
      r === "asset-admin" ||
      r === "asset-manager" ||
      r === "asset-incharge" ||
      r === "account-admin" ||
      r === "account-manager" ||
      r === "account-incharge" ||
      r === "fa-accounts",
  );

  let sidebarData = [];

  if (roleArray.includes("admin")) {
    sidebarData = [
      ...sidebarData,
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
        title: "Leave Management",
        icon: <FaCalendarCheck />,
        link: "/admin/leaves",
      },
      {
        title: "Holidays",
        icon: <FaRegCalendarAlt />,
        link: "/admin/holidays",
      },
      {
        title: "Helpdesk",
        icon: <FaHeadset />,
        link: "/admin/helpdesk",
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
        title: "Reports Hub",
        icon: <FaChartPie />,
        link: "/admin/reports-hub",
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

    ];
  } else if (isAssetRole) {
    sidebarData = [
      ...sidebarData,
      {
        title: "Asset Management",
        submenu: true,
        icon: <BsBoxes />,
        submenuItems: [
          ...(roleArray.includes("fa-accounts")
            ? [
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
                title: "Asset Audit",
                link: "/admin/asset-management/asset-audit",
              },
            ]
            : [
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
                title: "Asset Audit",
                link: "/admin/asset-management/asset-audit",
              },
              {
                icon: <FaRegCircle />,
                title: "Asset Disposal",
                link: "/admin/asset-management/asset-disposal",
              },
            ]),
        ],
      },
      ...(roleArray.includes("asset-admin")
        ? [
          {
            title: "Master Data",
            submenu: true,
            icon: <BsClipboardDataFill />,
            submenuItems: [
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
              {
                icon: <FaRegCircle />,
                title: "Employee Master",
                link: "/admin/asset-management/employee-master",
              },
              {
                icon: <FaRegCircle />,
                title: "Vendor Master",
                link: "/admin/master-data/vendor-master/vendor-list",
              },
            ],
          },
        ]
        : []),
    ];
  }

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
        <div
          className={`z-20 sticky
                ${open
              ? "shadow-[5px_5px_4px_0px_rgba(245,245,245,0.7)] w-[60%] lg:w-[18%]"
              : "shadow-[5px_5px_4px_0px_rgba(245,245,245,0.7)] w-[0%] lg:w-[5%]"
            } duration-300 h-[calc(100vh-52px)] overflow-y-auto custom-sidebar-scrollbar`}
        >
          <Sidebar
            sidebarData={sidebarData}
            onItemClick={handleSidebarItemClick}
            open={open}
            setOpen={setOpen}
          />
        </div>
        <div
          className={` 
              ${open
              ? "w-[40%] lg:w-[82%] overflow-x-hidden"
              : " w-[100%] lg:w-[95%]"
            } duration-300`}
        >
          {/* <idContext.Provider value={{ approvalId, setApprovalId }}> */}
          {children}
          {/* </idContext.Provider> */}
        </div>
      </div>
    </div>
    //   {/* </body>
    // </html> */}
  );
}