import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faGlobe,
  faUserShield,
  faUser,
  faAngleLeft,
  faAngleRight,
  faBuilding,
  faUserTie,
  faUsers,
  faDashboard,
  faBlog,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";

import Link from "next/link";
import Axios from "axios";

import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const LeftSideBar = ({ handleCallback, openSidebar }) => {
  const [open, setOpen] = useState(false);
  const [openlist, setOpenList] = React.useState(0);
  const [companyId, setCompanyId] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [isClient, setIsClient] = useState(false);
  const handleOpen = (value) => {
    setOpenList(openlist === value ? 0 : value);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    setOpen(openSidebar);
    const userDetails = localStorage.getItem("userDetails");

    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      // console.log(userDetailsParse.user_id);
      const parseUser_id = userDetailsParse.user_id;

      setCreatedBy(parseUser_id);
    }
  }, [openSidebar, createdBy]);

  const Menus = [
    { title: "Dashboard", src: faGlobe, link: "/user/dashboard" },
    {
      title: "Master Data",
      src: faUser,
      link: "",
      submenu: [
        {
          title: "Center Details",
          link: "/user/master-data/center-details/center-details-list",
        },
        {
          title: "Bank Details",
          link: "/user/master-data/bank-details/bank-details-list",
        },
        { title: "Unit of Measurement", link: "/user/master-data/unit" },
        {
          title: "Programs-Project-Activity",
          link: "/user/master-data/program-project-activity-subactivity",
        },
        {
          title: "Programs",
          link: "/user/master-data/program",
        },
        {
          title: "Projects",
          link: "/user/master-data/project",
        },
        {
          title: "Activity & Subactivity Details",
          link: "/user/master-data/activity-subactivity",
        },
        {
          title: "Activity Approval Level",
          link: "/user/master-data/approval-level-management/approval-level-list",
        },
        {
          title: "Utilization Approval Level",
          link: "/user/master-data/approval-level-management/approval-level-list",
        },
      ],
    },
    {
      title: "Annual Plan",
      src: faGlobe,
      link: "/user/annual-plan-management/annual-list",
    },
    {
      title: "Fund Management",
      src: faUser,
      link: "",
      submenu: [
        {
          title: "External Grant",
          link: "/user/fund-management/external-grant-list",
        },
        {
          title: "Community Contribution",
          link: "/user/fund-management/cc-list",
        },
      ],
    },
    {
      title: "Utilization Management",
      src: faGlobe,
      link: "/user/utilization-management/utilization-list",
    },
    {
      title: "Approval Management",
      src: faGlobe,
      link: "/user/approval-management/approval-list",
    },
    { title: "User Management", src: faUsers, link: "/user/user-management" },
    {
      title: "Notification Management",
      src: faBuilding,
      link: "",
      submenu: [
        {
          title: "Create New Template",
          link: "/user/notification-management/create-new-template",
        },
        {
          title: "Email Template",
          link: "/user/notification-management/email-template",
        },
        {
          title: "SMS Template",
          link: "/user/notification-management/sms-template",
        },
        {
          title: "IN-APP Template",
          link: "/user/notification-management/in-app-template",
        },
        {
          title: "Whatsapp Template",
          link: "/user/notification-management/whatsapp-template",
        },
      ],
    },
  ];

  const handleDrawer = (open) => {
    setOpen(open);
    handleCallback(open);
  };

  return (
    <div className="w-full h-screen relative duration-500">
      {open ? (
        <a href="/">
          <div className="flex-none bg-white flex items-center">
            <div className="flex items-center content-center mx-auto py-4">
              <span className="text-2xl font-black text-slate-800 italic">HRMS</span>
            </div>
          </div>
        </a>
      ) : (
        <a href="/">
          <div className="h-8 w-8 mx-auto mt-4 flex items-center justify-center">
            <span className="text-green-600 font-bold text-xl">H</span>
          </div>
        </a>
      )}
      {isClient ? (
        <List className="bg-white min-w-[0px] h-full ">
          {Menus &&
            Menus.length > 0 &&
            Menus.map((menu, index) => {
              return (
                <Accordion
                  key={index}
                  open={openlist === index + 1}
                  icon={
                    menu?.submenu &&
                    menu?.submenu && (
                      <ChevronDownIcon
                        strokeWidth={2.5}
                        className={
                          !open
                            ? "hidden"
                            : `h-4 w-4 transition-transform text-green ${
                                openlist === index + 1 ? "rotate-180" : ""
                              }`
                        }
                      />
                    )
                  }
                >
                  {menu.link !== "" ? (
                    <a href={menu.link}>
                      <ListItem
                        className="p-0"
                        selected={openlist === index + 1}
                      >
                        <AccordionHeader
                          onClick={() => handleOpen(index + 1)}
                          className="border-b-0 p-3 "
                        >
                          <ListItemPrefix>
                            <FontAwesomeIcon
                              className=" cursor-pointer -right-3 top-9 w-5 h-5 text-green"
                              icon={menu.src}
                              color="#000"
                            />
                          </ListItemPrefix>
                          <Typography
                            color="blue-gray"
                            className="mr-auto font-normal"
                          >
                            <span
                              className={
                                !open
                                  ? "hidden"
                                  : "origin-left text-md duration-200 text-black"
                              }
                            >
                              {menu.title}
                            </span>
                          </Typography>
                        </AccordionHeader>
                      </ListItem>
                    </a>
                  ) : (
                    <Link href={menu.link}>
                      <ListItem
                        className="p-0"
                        selected={openlist === index + 1}
                      >
                        <AccordionHeader
                          onClick={() => handleOpen(index + 1)}
                          className="border-b-0 p-3"
                        >
                          <ListItemPrefix>
                            <FontAwesomeIcon
                              className="cursor-pointer -right-3 top-9 w-5 h-5 text-green"
                              icon={menu.src}
                              color="#000"
                            />
                          </ListItemPrefix>
                          <Typography
                            color="blue-gray"
                            className="mr-auto font-normal"
                          >
                            <span
                              className={
                                !open
                                  ? "hidden"
                                  : "origin-left text-md duration-200 text-black"
                              }
                            >
                              {menu.title}
                            </span>
                          </Typography>
                        </AccordionHeader>
                      </ListItem>
                    </Link>
                  )}

                  <AccordionBody className={!open ? "hidden" : "py-1"}>
                    {menu?.submenu &&
                      menu?.submenu.length > 0 &&
                      menu.submenu.map((submenu, sub_index) => {
                        return (
                          <List key={sub_index} className="p-0">
                            <a href={submenu.link}>
                              <ListItem className="text-black">
                                <ListItemPrefix>
                                  <ChevronRightIcon
                                    strokeWidth={3}
                                    className="h-3 w-5 text-green"
                                  />
                                </ListItemPrefix>
                                {submenu.title}
                              </ListItem>
                            </a>
                          </List>
                        );
                      })}
                  </AccordionBody>
                </Accordion>
              );
            })}
        </List>
      ) : null}
    </div>
  );
};
export default LeftSideBar;
