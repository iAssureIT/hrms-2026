"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import moment from "moment";
import Image from "next/image";
import dynamic from "next/dynamic";
import rejectedStamp from "@/public/images/specific/rejected-stamp.png";
import approvedStamp from "@/public/images/specific/approved-stamp.png";
import pendingStamp from "@/public/images/specific/pending-stamp.png";
import validator from "validator";

import { FaIndianRupeeSign } from "react-icons/fa6";
import { MdOutlineEdit } from "react-icons/md";
import { CiViewList } from "react-icons/ci";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { FaFileDownload, FaRegFileAlt, FaSpinner } from "react-icons/fa";

import { usePathname } from "next/navigation";
import ls from "localstorage-slim";

const ApprovalDetails = () => {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  // console.log("userDetails  =>", userDetails);

  const [status, setStatus] = useState("");
  // const [initialStatus, setInitialStatus] = useState("");
  const [stamp, setStamp] = useState("");
  const [user_id, setUser_id] = useState("");
  const [center_id, setCenter_id] = useState("all");
  const [update, setUpdate] = useState(false);
  const [approvalAuthName, setApprovalAuthName] = useState("");
  const [approvalAuthRole, setApprovalAuthRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [approvalAttachments, setApprovalAttachments] = useState([]);
  const [approvalAuthoritiesUpdated, setApprovalAuthoritiesUpdated] =
    useState(false);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [approverLevelList, setApproverLevelList] = useState([]);
  const [approverIndex, setApproverIndex] = useState("");
  const [rejectedIndex, setRejectedIndex] = useState("");
  const [approvalAuthorities, setApprovalAuthorities] = useState({});
  const [approvalLevel, setApprovalLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState({});

  const params = useParams();
  const router = useRouter();
  const contentRef = useRef();

  useEffect(() => {
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
      setCenter_id("all");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
      setCenter_id(userDetails.center_id);
    } else {
      setLoggedInRole("executive");
      setCenter_id("all");
      // console.log("userDetails.roles", userDetails.roles);

      if (userDetails.roles.includes("senior-manager")) {
        // const allCenter_idsBYSM = getCenterDetailsBySM(userDetails?.user_id)
        // seniorManagerDetails.email
      }
    }
  }, []);

  useEffect(() => {
    getApprovalData();
  }, [status, approvalAuthoritiesUpdated]);

  const getApprovalData = () => {
    axios
      .get("/api/utilization-approval-details/get/one/" + params._id)
      .then((response) => {
        var approvalData = response.data[0];
        console.log("response", response);
        if (approvalData?.approvalAuthourities) {
          setApprovalAuthoritiesUpdated(true);
        }
        setApprovalData(approvalData);
        const combinedAttachmentData = approvalData?.documentName?.map(
          (name, index) => {
            return {
              name: name,
              url: approvalData?.documentUrl[index],
            };
          }
        );
        setApprovalAttachments(combinedAttachmentData);

        if (userDetails) {
          const user_id = userDetails?.user_id;
          const parseAuthName =
            userDetails.firstName + " " + userDetails.lastName;
          const parseAuthRole = userDetails.roles;
          // console.log("parseAuthRole",parseAuthRole)
          setUser_id(user_id);
          setApprovalAuthName(parseAuthName);
          setRoles(parseAuthRole);
          console.log(
            "approvalData?.approvalAuthourities-------------------------------------",
            approvalData?.approvalAuthourities
          );
          console.log(
            "approvalAuthName-------------------------------------",
            approvalAuthName
          );

          const getAuthRole = (roles) => {
            const authority = approvalData?.approvalAuthourities?.find(
              (authority) => {
                return roles.includes(authority.approvalAuthRole);
              }
            );
            return authority ? authority.approvalAuthRole : null;
          };
          const authRole = getAuthRole(parseAuthRole);
          // console.log("authRole-------------------------------------",authRole)
          setApprovalAuthRole(authRole);
          // console.log("approvalAuthRole-------------------------------------",approvalAuthRole)
        }
      })
      .catch((error) => {
        console.log("Error Message => ", error);
        //   Swal.fire("Oops", "Something Went Wrong", "error");
      })
      .finally(() => {
        setLoading2(false);
      });
  };

  const validation = (st) => {
    let inputIsValid = true;
    let errorMsg = {};
    // console.log("2 status => ", st);

    if (st === "rejected" && validator.isEmpty(remarks)) {
      // console.log("3 status => ", st);
      inputIsValid = false;
      errorMsg.remarksError = "This field is required.";
      setError(errorMsg);
    }
    return inputIsValid;
  };

  const handleSubmit = (st) => {
    // event.preventDefault();

    let formValues = {
      approvalAuthRole: approvalAuthRole,
      approvalAuthName: approvalAuthName,
      status: st,
      remark: remarks,
      updatedBy: user_id,
    };

    if (params._id && validation(st)) {
      formValues.ID = params._id;
      axios
        .patch("/api/utilization-approval-details/patch/status", formValues)
        .then((response) => {
          console.log("5 status => ", st);
          if (st === "approved") {
            Swal.fire(
              "Approved!",
              "This 'Approval Request' is Approved by you and Notification is sent to respective authourity!"
            );
          } else {
            Swal.fire(
              "Rejected!",
              "This 'Approval Request' is Rejected by you and Notification is sent to respective authourity!"
            );
          }
          setRemarks("");
          getApprovalData();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  console.log("role", loggedInRole);

  const isUserAuthourised = (approvalAuthName, approvalAuthRole) => {
    let authorizedIndex = -1; // Default value if no match is found
    approvalData?.approvalAuthourities?.some((authority, index) => {
      console.log( "isUserAuthourised===========================",authority.approvalAuthName , approvalAuthName , approvalAuthRole ,  authority.approvalAuthRole);
      console.log( "isUserAuthourised===========================",authority.approvalAuthName === approvalAuthName , approvalAuthRole === authority.approvalAuthRole);
      if (
        authority.approvalAuthName === approvalAuthName &&
        approvalAuthRole === authority.approvalAuthRole
      ) {
        authorizedIndex = index; // Capture the index of the matching authority
        console.log(
          "Authorized at index:",
          index,
          "with level:",
          authority.approvalLevel
        );
        return true; // Stop iteration when a match is found
      }
      return false;
    });

    if (authorizedIndex !== -1) {
      //   authorizedIndex,
      //   approvalData.approvalAuthourities[authorizedIndex].approvalLevel

      if (authorizedIndex === 0) {
        if (
          approvalData.approvalAuthourities[authorizedIndex + 1]?.status !==
            "approved" &&
          approvalData.approvalAuthourities[authorizedIndex + 1]?.status !==
            "rejected"
        ) {
          return {
            showActionButtons: true,
          };
        } else {
          return true;
        }
      } else if (
        approvalData.approvalAuthourities[authorizedIndex - 1]?.status ===
        "approved"
      ) {
        if (
          approvalData.approvalAuthourities[authorizedIndex + 1]?.status !==
            "approved" &&
          approvalData.approvalAuthourities[authorizedIndex + 1]?.status !==
            "rejected"
        ) {
          return {
            showActionButtons: true,
          };
        } else {
          return true;
        }
      } else {
        return false; // If any previous level is not approved, return false
      }
    } else {
      return false; // If any previous level is not approved, return false
    }
  };
  // Function to check if all previous levels are approved
  function arePreviousLevelsApproved(currentIndex, approvalAuthourities) {
    // for (let i = 0; i < currentIndex; i++) {
    //     if (approvalAuthourities[i].status !== "approved") {
    //         return false; // If any previous level is not approved, return false
    //     }
    // }
    // return true; // All previous levels are approved
  }

  const hideElements = () => {
    const elementsToHide = document.querySelectorAll(".hide-in-pdf");
    const elementsToAdjust = document.querySelectorAll(".adjust-in-pdf");
    elementsToHide.forEach((element) => {
      element.style.display = "none";
    });
    elementsToAdjust.forEach((element) => {
      element.style.marginTop = "10px";
      element.style.marginBottom = "10px";
    });
  };

  // Function to show elements again after PDF generation
  const showElements = () => {
    const elementsToHide = document.querySelectorAll(".hide-in-pdf");
    elementsToHide.forEach((element) => {
      element.style.display = "";
    });
  };

  const downloadPDF = async () => {
    let element = document.getElementById("pdf-content");

    hideElements();

    const options = {
      margin: 1,
      filename: "approval-details.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
    };

    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
      .from(element)
      .set(options)
      .save()
      .then(() => {
        showElements();
      });
  };

  const formatToINR = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(num)
      .replace(/^(\D+)/, "$1 ");
  };

  const formatNumberToCommas = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md" id="pdf-content">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Utilization Approval Details</h1>

            <div className="flex gap-3 my-5 me-10 hide-in-pdf">
              <Tooltip
                content="Download as PDF"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading3 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <FaFileDownload
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={downloadPDF}
                  />
                )}
              </Tooltip>
              {loggedInRole === "admin" || loggedInRole === "center" ? (
                <Tooltip
                  content="Edit"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  {loading3 ? (
                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                  ) : (
                    <MdOutlineEdit
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      onClick={() => {
                        // setLoading3(true);
                        window.open(
                          `/${loggedInRole}/master-data/utilization-approval-level/utilization-approval-level-submission/${params._id}`,
                          '_self'
                          // "noopener,noreferrer"
                        );
                        setUpdate(true);
                      }}
                    />
                  )}
                </Tooltip>
              ) : null}
              <Tooltip
                content="Approval List"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <CiViewList
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      window.open(
                        "/" +loggedInRole +"/master-data/utilization-approval-level/utilization-approval-level-list",
                          '_self'
                          // "noopener,noreferrer"
                        );
                    }}
                  />
                )}
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="px-10 py-6">
          <div className="bg-white text-secondary">
            <div className="me-2 rounded-md">
              <div className="mt-5 mb-5 w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 adjust-in-pdf">
                <div className="flex-1 lg:me-4">
                  <label htmlFor="approverLevel" className="inputLabel">
                    Approval Level
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {approvalData?.approverLevel ? (
                      approvalData?.approverLevel
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="centerName" className="inputLabel">
                    Approval Limit
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {approvalData?.approvalLimit ? (
                      approvalData?.approvalLimit
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label
                    htmlFor="approverAuthorityName"
                    className="inputLabel"
                  >
                    Approver Authority Name
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {approvalData?.approverAuthorityName ? (
                      moment(approvalData?.approverAuthorityName).format(
                        "DD-MM-YYYY"
                      )
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                {approvalData?.finalStatus === "approved" ? (
                  <div className="flex-1 lg:me-4">
                    <label
                      htmlFor="approverAuthorityName"
                      className="inputLabel"
                    >
                      Approval Date
                    </label>

                    <div className="relative mt-2 font-normal text-[15px]">
                      {approvalData?.approvalDate ? (
                        moment(approvalData?.approvalDate).format("DD-MM-YYYY")
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            

              <div className="mt-5 mb-6 flex lg:flex-row md:flex-row flex-col hide-in-pdf">
                <div className="flex-1 lg:me-4 w-1/2">
                  <label htmlFor="totalCost" className="inputLabel">
                    Attachments
                  </label>
                  <div
                    className={`relative font-normal ${
                      approvalAttachments?.length > 4
                        ? "grid grid-cols-4"
                        : "flex"
                    } gap-4 text-[15px]`}
                  >
                    {approvalAttachments && approvalAttachments?.length > 0 ? (
                      approvalAttachments?.map((document, index) => {
                        const imageExt =
                          "jpg" ||
                          "jpeg" ||
                          "png" ||
                          "webp" ||
                          "gif" ||
                          "psd" ||
                          "tiff" ||
                          "jfif";

                        let previewDiv = "";

                        if (
                          document?.name.split(".").pop() === "png" ||
                          document?.name.split(".").pop() === "jpg" ||
                          document?.name.split(".").pop() === "jpeg" ||
                          document?.name.split(".").pop() === "jfif" ||
                          document?.name.split(".").pop() === "webp" ||
                          document?.name.split(".").pop() === "psd" ||
                          document?.name.split(".").pop() === "tiff" ||
                          document?.name.split(".").pop() === "jfif" ||
                          document?.name.split(".").pop() === "gif"
                        ) {
                          previewDiv = (
                            <img
                              src={document?.url}
                              className="text-2xl h-14 w-14 content-center z-[1]"
                            />
                          );
                        } else if (
                          document?.name.split(".").pop() === "xls" ||
                          document?.name.split(".").pop() === "xlsx"
                        ) {
                          previewDiv = (
                            <img
                              src="/images/generic/Excel-download-icon.png"
                              className="text-2xl h-14 w-14 content-center"
                            />
                          );
                        } else if (document?.name.split(".").pop() === "pdf") {
                          previewDiv = (
                            <img
                              src="/images/generic/pdf-file-icon.png"
                              className="text-2xl h-10 w-10 content-center"
                            />
                          );
                        } else {
                          previewDiv = (
                            <FaRegFileAlt className="text-xs text-green content-center z-[1]" />
                          );
                        }

                        return (
                          <div
                            className={`flex col-span-1 gap-3 ${
                              document.name !== "" ||
                              approvalAttachments?.length > 0
                                ? "mt-2"
                                : "mt-0"
                            }`}
                          >
                            {document?.name !== "" && document?.name !== "" ? (
                              <div>{++index}.</div>
                            ) : (
                              ""
                            )}
                            {document?.name !== "" && document?.url !== "" ? (
                              <Tooltip
                                content="Download file"
                                className="bg-green"
                                placement="bottom"
                                arrow={false}
                              >
                                <div className="text-center w-full border border-dashed border-gray-400 px-1.5 py-2 rounded-md relative">
                                  <div className="flex justify-center">
                                    <a
                                      target="_blank" href={
                                        document?.url !== "" && document?.url
                                      }
                                      className="hover:scale-110 min-h-14 content-center"
                                      download
                                    >
                                      {previewDiv}
                                    </a>
                                  </div>
                                  <div className="flex gap-2">
                                    <a
                                      target="_blank" href={
                                        document?.url !== "" && document?.url
                                      }
                                      className="hover:underline underline hover:font-medium"
                                      download
                                    >
                                      {document?.name !== "" && document?.name}
                                    </a>
                                  </div>
                                </div>
                              </Tooltip>
                            ) : (
                              "No data found"
                            )}
                          </div>
                        );
                      })
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      <div className="relative mt-2 font-medium">
                        No data found
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
};

export default ApprovalDetails;
