// Akshay's Layout

"use client";
import React, { useEffect, useState } from "react";
import { idContext } from "@/context/IdContext";
import { Inter } from "next/font/google";
import axios from "axios";
import Image from "next/image";
import Sidebar from "@/components/common/LeftSideBar/Sidebar";
import Navbar from "@/components/common/HeaderView/Navbar";
import Logo from "@/components/common/logo/logo";
import { useRouter } from "next/navigation";
import profileimg from "../../public/images/generic/userimage.jpg";
import logoimgfull from "../../public/images/specific/logo.webp";
import logoimgsm from "../../public/images/specific/logo-2.webp";
import ls from "localstorage-slim";

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
} from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { AiOutlineProduct } from "react-icons/ai";
import { CiMail } from "react-icons/ci";
import { GrMoney } from "react-icons/gr";
import { RiExchangeFundsFill } from "react-icons/ri";
import { TbReport } from "react-icons/ri";
// import { idContext } from "@/app/admin/layout";

// User Management specific

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

const metadata = {
  title: "LupinMIS",
  description: " ",
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
      r === "asset-admin" ||
      r === "asset-manager" ||
      r === "asset-incharge" ||
      r === "account-admin" ||
      r === "account-manager" ||
      r === "account-incharge" ||
      r === "fa-accounts",
  );

  const sidebarData = [
    { logoimgfull: logoimgfull },
    { logoimgsm: logoimgsm },
    ...(isAssetRole
      ? [
          // {
          //   title: "Master-Data",
          //   submenu: true,
          //   icon: <BsClipboardDataFill />,
          //   submenuItems: [
          //     {
          //       icon: <FaRegCircle />,
          //       title: "Location",
          //       link: "/asset/master-data/sublocation",
          //     },
          //     {
          //       icon: <FaRegCircle />,
          //       title: "Asset Category",
          //       link: "/asset/master-data/asset-category-subcategory",
          //     },
          //     {
          //       icon: <FaRegCircle />,
          //       title: "Asset Inspection Checklist",
          //       link: "/asset/master-data/asset-inspection-checklist",
          //     },
          //     {
          //       icon: <FaRegCircle />,
          //       title: "Asset Depreciation",
          //       link: "/asset/master-data/asset-depreciation",
          //     },

          //     {
          //       icon: <FaRegCircle />,
          //       title: "Department",
          //       link: "/asset/master-data/department-subdepartment",
          //     },
          //   ],
          // },

          ...(roleArray.includes("fa-accounts")
            ? [
                {
                  title: "Asset Inventory",
                  icon: <BsBoxes />,
                  link: "/asset/management",
                },
                // {
                //   title: "Allocation Approval",
                //   icon: <FaListUl />,
                //   link: "/asset/management/allocation-approval-list",
                // },
                {
                  title: "Asset Maintenance",
                  icon: <FaTools />,
                  link: "/asset/management/maintenance-list",
                },
                {
                  title: "Asset Depreciation",
                  icon: <FaChartLine />,
                  link: "/asset/management/depreciation",
                },
                {
                  title: "Gate Pass Control",
                  icon: <FaIdCard />,
                  link: "/asset/management/gate-pass-management",
                },
                {
                  title: "Asset Audit",
                  icon: <FaClipboardCheck />,
                  link: "/asset/management/asset-audit",
                },
              ]
            : [
                {
                  title: "Asset Inventory",
                  icon: <BsBoxes />,
                  link: "/asset/management",
                },

                {
                  title: "Asset Maintenance",
                  icon: <FaTools />,
                  link: "/asset/management/maintenance-list",
                },

                {
                  title: "Asset Depreciation",
                  icon: <FaChartLine />,
                  link: "/asset/management/depreciation",
                },
                {
                  title: "Gate Pass Control",
                  icon: <FaIdCard />,
                  link: "/asset/management/gate-pass-management",
                },
                {
                  title: "Asset Audit",
                  icon: <FaClipboardCheck />,
                  link: "/asset/management/asset-audit",
                },
                {
                  title: "Asset Disposal",
                  icon: <FaTrashAlt />,
                  link: "/asset/management/asset-disposal",
                },
              ]),
          ...(roleArray.includes("asset-admin")
            ? [
                {
                  title: "Master-Data",
                  submenu: true,
                  icon: <BsClipboardDataFill />,
                  submenuItems: [
                    {
                      icon: <FaRegCircle />,
                      title: "Location",
                      link: "/asset/master-data/sublocation",
                    },
                    {
                      icon: <FaRegCircle />,
                      title: "Department",
                      link: "/asset/master-data/department-subdepartment",
                    },
                    {
                      icon: <FaRegCircle />,
                      title: "Asset Category & Depreciation",
                      link: "/asset/master-data/asset-depreciation",
                    },
                    {
                      icon: <FaRegCircle />,
                      title: "Asset Sub-Category",
                      link: "/asset/master-data/asset-category-subcategory",
                    },
                    {
                      icon: <FaRegCircle />,
                      title: "Asset Inspection Checklist",
                      link: "/asset/master-data/asset-inspection-checklist",
                    },
                  ],
                },
                {
                  title: "Vendor Management",
                  icon: <FaUserTie />,
                  link: "/asset/master-data/vendor-master/vendor-list",
                },
                {
                  title: "Employee Master",
                  icon: <FaUser />,
                  link: "/asset/management/employee-master",
                },
              ]
            : []),
        ]
      : []),
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
            ${
              open ? "w-[100%] lg:w-[18%]" : " w-[100%] lg:w-[5%]"
            } duration-300 `}
        >
          <Logo sidebarData={sidebarData} open={open} setOpen={setOpen} />
        </div>
        <div
          className={`sticky top-0 left-0 z-50
              ${
                open ? "w-[100%] lg:w-[82%]" : " w-[100%] lg:w-[95%]"
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
                ${
                  open
                    ? "shadow-[5px_5px_4px_0px_rgba(245,245,245,0.7)] w-[60%] lg:w-[18%]"
                    : "shadow-[5px_5px_4px_0px_rgba(245,245,245,0.7)] w-[0%] lg:w-[5%]"
                } duration-300`}
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
              ${
                open
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
