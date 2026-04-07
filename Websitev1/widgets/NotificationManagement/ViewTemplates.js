"use client";
import { Button } from "@material-tailwind/react";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { Modal, Tooltip } from "flowbite-react";
import { FaSpinner } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useRouter } from "next/navigation";

function ViewTemplates(props) {
  const eventsArray = [
    { event: "Approval Management - Create Approval", count: 0 },
    { event: "Approval Management - Approval Status Approved", count: 0 },
    { event: "Approval Management - Approval Status Rejected", count: 0 },
    { event: "Approval Management - Inform Authourity - Approval Action", count: 0 }, //Inform Authourity
    { event: "Approval Management - Inform Applicant - Approval Action", count: 0 },

    { event: "Approval Management - Inform Applicant - Approval Activity All Level Approved", count: 0 },
    { event: "Approval Management - Inform Applicant - Approval Activity All Level Rejected", count: 0 },
    { event: "Approval Management - Inform Authourities - Approval Activity All Level Approved", count: 0 },
    { event: "Approval Management - Inform Authourities - Approval Activity All Level Rejected", count: 0 },

    { event: "Utilization Management - Create Utilization Approval", count: 0 },
    { event: "Utilization Management - Inform Applicant - Utilization All Level Approved", count: 0 },
    { event: "Utilization Management - Inform Applicant - Utilization All Level Rejected", count: 0 },

    { event: "Utilization Management - Inform Authourities - Utilization All Level Rejected", count: 0 },
    { event: "Utilization Management - Inform Authourities - Utilization All Level Approved", count: 0 },
    
    { event: "Utilization Management - Utilization Approval Status Approved", count: 0 },
    { event: "Utilization Management - Utilization Approval Status Rejected", count: 0 },

    { event: "Utilization Management - Inform Authourity for Utilization Approval", count: 0 },
    { event: "Utilization Management - Inform Applicant - Utilization Approval Action", count: 0 },

    { event: "Utilization Management - Inform Finance Manager - Utilization All Level Approved", count: 0 },
    { event: "Utilization Management - Inform Account Person - Utilization All Level Approved", count: 0 },

    { event: "User Management - Create User", count: 0 },
    { event: "User Management - Edit User", count: 0 },
    { event: "User Management - User Activated", count: 0 },
    { event: "User Management - User Inactivated", count: 0 },
    
    { event: "System Security - Forgot Password OTP", count: 0 },
    { event: "System Security - Reset Password Successful", count: 0 },
  ].sort((a, b) => {
    return a.event.localeCompare(b.event);
  });
  
  const [eventList, setEventList] = useState(eventsArray);
  const [openTab, setOpenTab] = React.useState(1);
  const [openTemplateTypeTab, setOpenTemplateTypeTab] = React.useState(1);
  const [templateList, setTemplateList] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);
  const [deleteFailModal, setDeleteFailModal] = useState(false);
  const [cloneId, setCloneId] = useState("");
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState("all");

  const router = useRouter();

  useEffect(() => {
    getTemplates(props.templateType,event);
  }, [event]);

  const getTemplates = (templateType,event) => {
    axios
      .get("/api/masternotifications/get/listByType/" + templateType + "/" + event
        )
      .then((res) => {
        // console.log("res",res)
        setTemplateList(res.data);
        if (res.data.length > 0) {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const editTemplate = (id) => {
    window.location.href =
      "/admin/notification-management/create-new-template/" + id;
  };

  const cloneTemplate = (id) => {
    // Store the id in sessionStorage
    sessionStorage.setItem("templateCloneId", id);
    if (id) {
      window.location.href =
        "/admin/notification-management/create-new-template";
    }
  };
  const deleteTemplate = (id) => {
    // axios
    //   .delete("/api/masternotifications/delete/" + id)
    //   .then((res) => {
    //     Swal.fire(" ", "Template has been deleted.");
    //     window.location.reload();
    //   })
    //   .catch((error) => {
    //     console.log("Getting error", error);
    //   });

    Swal.fire({
      title: " ",
      text: `Are you sure you want to delete this ${props.templateType.toLowerCase()} template?`,
      showCancelButton: true,
      cancelButtonText: "No, Don't Delete",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#50c878",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        confirmButton: "delete-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete("/api/masternotifications/delete/" + id)
          .then((res) => {
            Swal.fire(" ", `${props.templateType} template has been deleted.`);
            window.location.reload();
          })
          .catch((error) => {
            console.log("Getting error", error);
          });
      }
    });
  };

  useEffect(() => {
    if (templateList.length === 0) {
      setLoading(false);
    }
  }, []);

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300">
            <h1 className="heading">Notification Management</h1>
          </div>
        </div>
        <div className="px-10 py-6">
          <div className="grid  grid-cols bg-grey-200 mb-8 h-full lg:px-4">
            <div className="flex justify-between border-b lg:px-4 py-4">
              <h2 className="subHeading font-semibold -mt-4">
                {props.mainTitle}
              </h2>
              <Button
                className="bg-site -mt-6"
                onClick={() => {
                  sessionStorage.removeItem("templateCloneId");
                  window.open(
                    "/admin/notification-management/create-new-template",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                <Link target="_blank" href="/admin/notification-management/create-new-template">
                  {loading ? (
                    <span>
                      Add Template
                      <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                    </span>
                  ) : (
                    "Add Template"
                  )}
                </Link>
              </Button>
            </div>
            
            <div className="grid  gap-6 mb-6 md:grid-cols-4 lg:grid-cols-4 mt-4 w-full">
              <div className="col-start-2 col-span-2">
                <label
                  htmlFor="event"
                  // className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  className="inputLabel"
                >
                  Event<i className="text-red-500"> *</i>
                </label>
                <select
                  id="event"
                  value={event}
                  onChange={(e) => {
                    // console.log("e.target.value",e.target.value)
                    setEvent(e.target.value);
                  }}
                  // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  // className="stdSelectField py-1"
                  className={` stdSelectField py-1 pl-3
                  ${event ? "selectOption" : "font-normal text-gray-400"}
                  `}
                >
                  <option disabled value="">
                    -- Select Event --
                  </option>
                  <option value="all">All</option>
                  {eventList?.map((item, index) => {
                    return (
                      // <option key={index} value={item}>{item}</option>(
                      <option
                        key={index}
                        value={item.event}
                        className="text-black"
                      >
                        {item.event }
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <h3 className="text-md lg:px-4 pt-4 font-semibold">
              Templates Library
            </h3>

            <div className="w-full grid grid-cols-4 gap-3 lg:grid-cols-4 px-0 lg:px-4 py-4">
              <div className="h-[400px] overflow-y-auto">
                <ul
                  className="mb-0 list-none flex flex-wrap w-full" 
                  role="tablist"
                >
                  {templateList && templateList.length > 0 ? (
                    templateList.map((item, i) => {
                      return (
                        <li key={i} 
                          className={
                            "text-xs font-semibold border rounded-sm uppercase w-full overflow-hidden p-5 shadow-lg block leading-normal " +
                            (openTab === i + 1
                              ? "text-white bg-site"
                              : "text-site bg-white")
                          }
                        >
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              setOpenTab(i + 1);
                            }}
                            data-toggle="tab"
                            href={"#link" + (i + 1)}
                            role="tablist"
                          >
                            {item.role} - {item.templateName}
                          </a>
                        </li>
                      );
                    })
                  ) : loading ? (
                    <li className="text-center text-lg">
                      <FaSpinner className="animate-spin text-center my-5 text-Green inline-flex mx-2" />
                    </li>
                  ) : (
                    "No Templates Found"
                  )}
                </ul>
              </div>

              {/* <div className="h-screen border relative flex flex-col col-span-4 min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                <div className="px-4 py-5 flex-auto">
                  <div className="tab-content tab-space">
                    {templateList &&
                      templateList.length > 0 &&
                      templateList.map((item, i) => {
                        // console.log("item",item);
                        return (
                          <div
                            key={i}
                            className={openTab === i + 1 ? "block" : "hidden"}
                            id={"link" + (i + 1)}
                          >
                            <div className="p-10 text-sm">
                              <div className="float-right w-full h-10 text-lg">
                                <button
                                  onClick={() => {
                                    // deleteTemplate(item._id);
                                    setDeleteId(item._id);
                                    setDeleteModal(true);
                                  }}
                                  className="float-right"
                                >
                                  <i className="px-2 text-red-600 hover:text-red-900 cursor-pointer fa-solid fa-trash"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    editTemplate(item._id);
                                  }}
                                  className="float-right"
                                >
                                  <i className="mx-4 text-blue-500 hover:text-blue-900 cursor-pointer fa-solid fa-pencil "></i>
                                </button>
                                <button
                                  onClick={() => {
                                    cloneTemplate(item._id);
                                  }}
                                  className="float-right"
                                >
                                  <i className="mr-2 text-blue-500 hover:text-blue-900 cursor-pointer fa fa-clone "></i>
                                </button>
                              </div>
                              {props.templateType === "EMAIL" && (
                                <h2 className="font-semibold">
                                  Subject :{" "}
                                  <span className="font-normal">
                                    {item?.subject}
                                  </span>
                                </h2>
                              )}
                              <br />
                              <h3 className="font-semibold">Message : </h3>
                              <br />
                              <p
                                className="font-normal"
                                dangerouslySetInnerHTML={{
                                  __html: item?.content,
                                }}
                              ></p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div> */}

              <div className="min-h-fit border relative flex flex-col col-span-3 lg:col-span-3 min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                <div className="px-4 py-5 flex-auto">
                  <div className="tab-content tab-space">
                    {templateList && templateList.length > 0 ? (
                      templateList.map((item, i) => {
                        // console.log("item",item);
                        return (
                          <div
                            key={i}
                            className={openTab === i + 1 ? "block" : "hidden"}
                            id={"link" + (i + 1)}
                          >
                            <div className="p-5 lg:p-10 text-sm">
                              <div className="float-right w-full h-10 text-lg">
                                <button
                                  onClick={() => {
                                    deleteTemplate(item._id);
                                  }}
                                  className="float-right"
                                >
                                  <Tooltip
                                    content="Delete"
                                    placement="bottom"
                                    className="bg-red-500"
                                    arrow={false}
                                  >
                                    <i className="px-2 text-red-600 hover:text-red-900 cursor-pointer fa-solid fa-trash"></i>
                                  </Tooltip>
                                </button>
                                <button
                                  onClick={() => {
                                    editTemplate(item._id);
                                  }}
                                  className="float-right"
                                >
                                  <Tooltip
                                    content="Edit"
                                    placement="bottom"
                                    className="bg-green"
                                    arrow={false}
                                  >
                                    <i className="mx-4 text-blue-500 hover:text-blue-900 cursor-pointer fa-solid fa-pencil "></i>
                                  </Tooltip>
                                </button>

                                <button
                                  onClick={() => {
                                    cloneTemplate(item._id);
                                  }}
                                  className="float-right"
                                >
                                  <Tooltip
                                    content="Clone"
                                    placement="bottom"
                                    className="bg-green"
                                    arrow={false}
                                  >
                                    <i className="mr-2 text-blue-500 hover:text-blue-900 cursor-pointer fa fa-clone "></i>
                                  </Tooltip>
                                </button>
                              </div>
                              {props.templateType === "EMAIL" && (
                                <h2 className="font-semibold">
                                  Subject :{" "}
                                  <span className="font-normal">
                                    {item?.subject}
                                  </span>
                                </h2>
                              )}
                              <br />
                              <h3 className="font-semibold">Message : </h3>
                              <br />
                              <p
                                className="font-normal"
                                dangerouslySetInnerHTML={{
                                  __html: item?.content,
                                }}
                              ></p>
                            </div>
                          </div>
                        );
                      })
                    ) : loading ? (
                      <div className="text-center mt-4 text-lg">
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      </div>
                    ) : (
                      <div className="text-center text-black font-normal mt-4">
                        No template added
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ViewTemplates;
