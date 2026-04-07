"use client";
import { Button } from "@material-tailwind/react";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { useEffect } from "react";

function ViewTemplates() {
  const [openTab, setOpenTab] = React.useState(1);
  const [openTemplateTypeTab, setOpenTemplateTypeTab] = React.useState(1);
  const [templateList, setTemplateList] = useState([]);
  useEffect(() => {
    getTemplates("EMAIL");
  }, []);

  const getTemplates = (templateType) => {
    axios
      .get("/api/masternotifications/get/listByType/" + templateType)
      .then((res) => {
        setTemplateList(res.data);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  // const templateList = [
  //   {
  //     'title' : 'User Activated',
  //     'event' : '<p>New user [userName] has been registred on [date]. Please activate the user from futher process.</p>'
  //   },
  //   {
  //     'title' : 'Admin New Registration',
  //     'event' :'<p>New user [userName] has been registred on [date]. Please activate the user from futher process.</p>'
  //   },
  //   {
  //     'title' : 'User New Registration',
  //     'event' : '<p>New user [userName] has been registred on [date]. Please activate the user from futher process.</p>'
  //   },
  //   {
  //     'title' : 'Offer Added',
  //     'event' :'<p>New user [userName] has been registred on [date]. Please activate the user from futher process.</p>'
  //   },
  // ]

  const templateTypeList = [
    {
      title: "EMAIL",
    },
    {
      title: "SMS",
    },
    {
      title: "INAPP NOTIFICATION",
    },
  ];

  return (
    <div className="w-full  ">
      <div className="p-7 text-xl font-semibold">
        <div className="grid  grid-cols bg-grey-200 mb-8 border-2 h-full p-4">
          <div className="flex justify-between mt-8 border-b-2 p-4">
            <h1>Notification Management</h1>
            <Button className="bg-site" onClick={() => {}}>
              <Link href="/admin/notification-management/create-new-template">
                Add Template
              </Link>
            </Button>
          </div>
          <ul
            className="  mb-0 list-none grid  grid-cols-3  pt-3 pb-4"
            role="tablist"
          >
            {templateTypeList &&
              templateTypeList.length > 0 &&
              templateTypeList.map((item, i) => {
                return (
                  <li className="">
                    <a
                      className={
                        "text-xs font-bold uppercase px-5 py-3  flex justify-center shadow-lg rounded  leading-normal " +
                        (openTemplateTypeTab === i + 1
                          ? "text-white bg-site"
                          : "text-site bg-white")
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTemplateTypeTab(i + 1);
                        getTemplates(item.title);
                      }}
                      data-toggle="tab"
                      href={"#link" + (i + 1)}
                      role="tablist"
                    >
                      {item.title}
                    </a>
                  </li>
                );
              })}
          </ul>
          <div className="w-full grid  grid-cols-5 gap-3 p-4">
            <ul
              className=" mb-0 list-none  border flex-wrap pt-3 pb-4 flex-row"
              role="tablist"
            >
              {templateList &&
                templateList.length > 0 &&
                templateList.map((item, i) => {
                  return (
                    <li className="">
                      <a
                        className={
                          "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                          (openTab === i + 1
                            ? "text-white bg-site"
                            : "text-site bg-white")
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenTab(i + 1);
                        }}
                        data-toggle="tab"
                        href={"#link" + (i + 1)}
                        role="tablist"
                      >
                        {item.templateName}
                      </a>
                    </li>
                  );
                })}
            </ul>
            <div className="h-screen border relative flex flex-col col-span-4 min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
              <div className="px-4 py-5 flex-auto">
                <div className="tab-content tab-space">
                  {templateList &&
                    templateList.length > 0 &&
                    templateList.map((item, i) => {
                      return (
                        <div
                          className={openTab === i + 1 ? "block" : "hidden"}
                          id={"link" + (i + 1)}
                        >
                          {item?.event}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewTemplates;
