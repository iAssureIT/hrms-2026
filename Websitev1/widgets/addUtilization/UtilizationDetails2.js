"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import moment from "moment";
import Image from "next/image";
import dynamic from "next/dynamic";
// const html2pdf = dynamic(() => Promise.resolve(require("html2pdf")), {
//   ssr: false,
// });
// import html2pdf from "html2pdf.js";
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
  const [utilizationData, setUtilizationData] = useState([]);
  const [utilizationAttachments, setUtilizationAttachments] = useState([]);
  const [approvalAuthoritiesUpdated, setApprovalAuthoritiesUpdated] =
    useState(false);

  const [matchedRoles, setMatchedRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState({});
  const [pdfMode, setPDFMode] = useState(false);

  const params = useParams();
  const router = useRouter();

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
    }
  }, []);

  useEffect(() => {
    getUtilizationData();
  }, [status, approvalAuthoritiesUpdated]);

  const getUtilizationData = () => {
    axios
      .get("/api/utilization-details/get/one/" + params._id)
      .then((response) => {
        var utilizationData = response.data[0];
        console.log("response", response);
        if (utilizationData?.approvalAuthourities) {
          setApprovalAuthoritiesUpdated(true);
        }
        setUtilizationData(utilizationData);

        const combinedAttachmentData = [
          {
            type: "voucher",
            documentUrl: utilizationData?.voucherDocumentUrl,
            documentName: utilizationData?.voucherDocumentName,
          },
          {
            type: "convergence",
            documentUrl: utilizationData?.convergenceDocumentUrl,
            documentName: utilizationData?.S3ConvergenceDocumentName,
          },
        ];

        // const combinedAttachmentData = {
        //   vouchername: name,
        //   voucher: utilizationData?.documentUrl[index],
        // };

        setUtilizationAttachments(combinedAttachmentData);

        if (userDetails) {
          const user_id = userDetails?.user_id;
          const parseAuthName =
            userDetails.firstName + " " + userDetails.lastName;
          const parseAuthRole = userDetails.roles;
          // console.log("parseAuthRole",parseAuthRole)
          setUser_id(user_id);
          setApprovalAuthName(parseAuthName);
          setRoles(parseAuthRole);
          const authRole = getAuthRole(parseAuthRole);
          // console.log("authRole-------------------------------------",authRole)
          setMatchedRoles(authRole);
          if (matchedRoles.length === 1) {
            setSelectedRole(matchedRoles[0]);
            setApprovalAuthRole(matchedRoles[0]);
          }
          console.log(
            "matchedRoles-------------------------------------",
            matchedRoles
          );
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

  const getAuthRole = (roles) => {
    const authorities =
      utilizationData?.approvalAuthourities
        ?.filter((auth) => auth.approvalAuthName === approvalAuthName)
        .map((auth) => auth.approvalAuthRole) || [];
    console.log("authorities", authorities);
    return roles.filter((role) => authorities.includes(role)); // Returns all matching roles
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

    if (approvalAuthRole) {
      const authorities = utilizationData?.approvalAuthourities || [];
      const currentIndex = authorities.findIndex(
        (auth) => auth.approvalAuthRole === approvalAuthRole
      );

      const nextLevelStatus = authorities?.[currentIndex + 1]?.status;
      const prevLevelStatus = authorities?.[currentIndex - 1]?.status;

      // 1. Prevent updating if next level is already approved/rejectedrejected
      if (nextLevelStatus === "approved" || nextLevelStatus === "rejected") {
        Swal.fire(
          "Not Allowed",
          "This level cannot be updated because the next level is already approved.",
          "warning"
        );
        return;
      }

      // 2. Prevent approving/rejecting if previous level is rejected
      if (currentIndex > 0 && prevLevelStatus === "rejected") {
        Swal.fire(
          "Action Blocked",
          "Previous level is rejected. You cannot approve or reject this level.",
          "error"
        );
        return;
      }

      // 3. Prevent action if previous level is still pending
      if (currentIndex > 0 && prevLevelStatus === "pending") {
        Swal.fire(
          "Hold On!",
          "Previous level is still pending. You cannot take action at this level yet.",
          "info"
        );
        return;
      }
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
          .patch("/api/utilization-details/patch/status", formValues)
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
            getUtilizationData();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } else {
      Swal.fire(
        "Action Blocked",
        "Please select your role to proceed.",
        "error"
      );
      return;
    }
  };

  const isUserAuthourised = (approvalAuthName, approvalAuthRole) => {
    // console.log("approvalAuthName, approvalAuthRole", approvalAuthName, approvalAuthRole);

    // Collect indexes where the user is authorized.
    let authorizedIndexes = [];
    utilizationData?.approvalAuthourities?.forEach((authority, index) => {
      if (
        authority.approvalAuthName === approvalAuthName &&
        matchedRoles.includes(authority.approvalAuthRole)
      ) {
        authorizedIndexes.push(index);
      }
    });
    console.log("authorizedIndexes", authorizedIndexes);

    if (authorizedIndexes.length > 0) {
      let showActionButtons = false;
      const authorities = utilizationData.approvalAuthourities;

      for (let i = 0; i < authorizedIndexes.length; i++) {
        const authorizedIndex = authorizedIndexes[i];
        const currentStatus = authorities[authorizedIndex]?.status;
        const prevStatus = authorities[authorizedIndex - 1]?.status;
        const nextStatus = authorities[authorizedIndex + 1]?.status;

        // --- CASE 1: First level ---
        if (authorizedIndex === 0) {
          // If all are pending, the first level should show buttons.
          if (currentStatus === "pending") {
            showActionButtons = true;
            console.log("showActionButtons 1", showActionButtons);
            break;
          }
        } else {
          // --- CASE 2: Subsequent levels (index > 0) ---
          // If current is pending, previous must be approved.
          if (currentStatus === "pending") {
            if (prevStatus === "pending") {
              console.log("prevStatus 6", prevStatus);
              showActionButtons = false;
              console.log("showActionButtons 6", showActionButtons);
              continue;
            } else if (prevStatus === "approved" || prevStatus === "rejected") {
              showActionButtons = true;
              console.log("showActionButtons 2", showActionButtons);
              break;
            } else if (nextStatus !== "approved" && nextStatus !== "rejected") {
              showActionButtons = true;
              console.log("showActionButtons 2", showActionButtons);
              break;
            } else if (
              authorizedIndexes.length === 0 &&
              prevStatus === "pending"
            ) {
              showActionButtons = false;
              console.log("showActionButtons 4", showActionButtons);
              break;
            } else if (
              currentStatus === "pending" &&
              prevStatus === "pending"
            ) {
              showActionButtons = false;
              console.log("showActionButtons 5", showActionButtons);
              break;
            }
          }
        }

        // --- CASE 3: For a level that is already approved/rejected ---
        // Allow action if the next level is still pending.
        if (
          (currentStatus === "approved" || currentStatus === "rejected") &&
          nextStatus === "pending"
        ) {
          showActionButtons = true;
          console.log("showActionButtons 3", showActionButtons);
          break;
        }
      }
      // Return our result based on whether any authorized index qualifies.
      return showActionButtons ? { showActionButtons: true } : true;
    }

    return false;
  };

  const isUserAuthourised1 = (approvalAuthName, approvalAuthRole) => {
    let authorizedIndex = -1; // Default value if no match is found
    utilizationData?.approvalAuthourities?.some((authority, index) => {
      // console.log(
      //   "isUserAuthourised===========================",
      //   authority.approvalAuthName,
      //   approvalAuthName,
      //   approvalAuthRole,
      //   authority.approvalAuthRole
      // );
      // console.log(
      //   "isUserAuthourised===========================",
      //   authority.approvalAuthName === approvalAuthName,
      //   approvalAuthRole === authority.approvalAuthRole
      // );
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
      //   utilizationData.approvalAuthourities[authorizedIndex].approvalLevel

      if (authorizedIndex === 0) {
        if (
          utilizationData.approvalAuthourities[authorizedIndex + 1]?.status !==
            "approved" &&
          utilizationData.approvalAuthourities[authorizedIndex + 1]?.status !==
            "rejected"
        ) {
          return {
            showActionButtons: true,
          };
        } else {
          return true;
        }
      } else if (
        utilizationData.approvalAuthourities[authorizedIndex - 1]?.status ===
        "approved"
      ) {
        if (
          utilizationData.approvalAuthourities[authorizedIndex + 1]?.status !==
            "approved" &&
          utilizationData.approvalAuthourities[authorizedIndex + 1]?.status !==
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
  const hideElements = () => {
    const elementsToHide = document.querySelectorAll(".hide-in-pdf");
    const elementsToAdjust = document.querySelectorAll(".adjust-in-pdf");
    const elementsInAuthorities = document.querySelectorAll(
      ".adjust-authorities"
    );
    elementsToHide.forEach((element) => {
      element.style.display = "none";
    });
    elementsToAdjust.forEach((element) => {
      element.style.marginTop = "10px";
      element.style.marginBottom = "10px";
    });
    elementsInAuthorities.forEach((element) => {
      element.style.display = "block";
      element.style.width = "100%";
      element.style.marginTop = "50px";
    });
  };

  // Function to show elements again after PDF generation
  const showElements = () => {
    const elementsToHide = document.querySelectorAll(".hide-in-pdf");
    elementsToHide.forEach((element) => {
      element.style.display = "";
    });
    elementsInAuthorities.forEach((element) => {
      element.style.display = "flex";
      element.style.width = "50%";
      element.style.marginTop = "";
    });
  };

  const downloadPDF = async () => {
    let element = document.getElementById("pdf-content");

    hideElements();

    const options = {
      margin: 1,
      filename: "Utilization-details.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
    };

    const html2pdf = (await import("html2pdf.js")).default;

    if (pdfMode) {
      html2pdf()
        .from(element)
        .set(options)
        .save()
        .then(() => {
          showElements();
        });
    }
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

  console.log("pdfmOde", pdfMode);

  const formatNumberToCommas = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "psd",
    "tiff",
    "jfif",
  ];
  const excelExtensions = ["xls", "xlsx"];

  const renderDocumentList = (type) => {
    return utilizationAttachments
      .filter((doc) => doc.type === type && doc.documentName && doc.documentUrl)
      .map((document, index) => {
        const fileExt = document?.documentName?.split(".").pop()?.toLowerCase();
        let previewDiv;

        if (imageExtensions.includes(fileExt)) {
          previewDiv = (
            <img src={document?.documentUrl} className="h-14 w-14" />
          );
        } else if (excelExtensions.includes(fileExt)) {
          previewDiv = (
            <img
              src="/images/generic/Excel-download-icon.png"
              className="h-14 w-14"
            />
          );
        } else if (fileExt === "pdf") {
          previewDiv = (
            <img
              src="/images/generic/pdf-file-icon.png"
              className="h-10 w-10"
            />
          );
        } else {
          previewDiv = <FaRegFileAlt className="text-xs text-green" />;
        }

        return (
          <div key={index} className="flex gap-3 mt-2">
            <Tooltip
              content="Download file"
              className="bg-green"
              placement="bottom"
              arrow={false}
            >
              <div className="text-center border border-dashed border-gray-400 px-1.5 py-2 rounded-md relative">
                <div className="flex justify-center">
                  <a
                    target="_blank" href={document?.documentUrl}
                    className="hover:scale-110 min-h-14"
                    download
                  >
                    {previewDiv}
                  </a>
                </div>
                <div className="flex gap-2">
                  <a
                    target="_blank" href={document?.documentUrl}
                    className="hover:underline font-medium"
                    download
                  >
                    {document?.documentName}
                  </a>
                </div>
              </div>
            </Tooltip>
          </div>
        );
      });
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md" id="pdf-content">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Utilization Details</h1>

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
                    onClick={() => {
                      downloadPDF();
                      setPDFMode(true);
                    }}
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
                      // onClick={() => {
                      //   setLoading3(true);
                      //   router.push(
                      //     `/${loggedInRole}/utilization-management/utilization-submission/${params._id}`
                      //   );
                      //   setUpdate(true);
                      // }}
                      onClick={() => {
                        // setLoading3(true);
                        window.open(
                          `/${loggedInRole}/utilization-management/utilization-submission/${params._id}`,
                          '_self'
                          // "noopener,noreferrer"
                        );
                        // If `setUpdate(true)` is for current tab state tracking, keep it:
                        setUpdate(true);
                      }}

                    />
                  )}
                </Tooltip>
              ) : null}
              <Tooltip
                content="Utilization List"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <CiViewList
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    // onClick={() => {
                    //   setLoading(true);
                    //   router.push(
                    //     "/" +
                    //       loggedInRole +
                    //       "/utilization-management/utilization-list"
                    //   );
                    // }}
                    onClick={() => {
                      window.open(
                        "/" +
                          loggedInRole +
                          "/utilization-management/utilization-list",
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
                  <label htmlFor="centerName" className="inputLabel">
                    Center Name
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.centerName ? (
                      utilizationData?.centerName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                {utilizationData?.finalStatus === "approved" ? (
                  <div className="flex-1 lg:me-4">
                    <label
                      htmlFor="approvalSubmissionDate"
                      className="inputLabel"
                    >
                      Approval Date
                    </label>

                    <div className="relative mt-2 font-normal text-[15px]">
                      {utilizationData?.approvalDate ? (
                        moment(utilizationData?.approvalDate).format(
                          "DD-MM-YYYY"
                        )
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="mt-5 mb-5 w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
                <div className="flex-1 lg:me-4">
                  <label htmlFor="centerName" className="inputLabel">
                    Approval Number
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.approvalNo ? (
                      utilizationData?.approvalNo
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label
                    htmlFor="approvalSubmissionDate"
                    className="inputLabel"
                  >
                    Approval Date
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.approvalDate ? (
                      moment(utilizationData?.approvalDate).format("DD-MM-YYYY")
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="centerName" className="inputLabel">
                    Voucher Number
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.voucherNumber ? (
                      utilizationData?.voucherNumber
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label
                    htmlFor="approvalSubmissionDate"
                    className="inputLabel"
                  >
                    Voucher Date
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.voucherDate ? (
                      moment(utilizationData?.voucherDate).format("DD-MM-YYYY")
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 mb-5 w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
                <div className="flex-1 lg:me-4">
                  <label htmlFor="program" className="inputLabel">
                    Program
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.program ? (
                      utilizationData?.program
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>

                <div className="flex-1 lg:me-4">
                  <label htmlFor="project" className="inputLabel">
                    Project
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.project ? (
                      utilizationData?.project
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="activityName" className="inputLabel">
                    Activity
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.activityName ? (
                      utilizationData?.activityName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>

                <div className="flex-1 lg:me-4">
                  <label htmlFor="subactivityName" className="inputLabel">
                    Subactivity
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.subactivityName ? (
                      utilizationData?.subactivityName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>

                <div className="flex-1 mt-5 flex w-full gap-2 lg:me-4 adjust-in-pdf">
                  <div>
                    <label htmlFor="quantity" className="inputLabel">
                      Quantity
                    </label>
                    <div className="relative mt-2 font-normal text-[15px]">
                      {utilizationData?.quantity ? (
                        formatNumberToCommas(utilizationData?.quantity)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 mt-5 flex w-full gap-2 lg:me-4 adjust-in-pdf">
                  <div>
                    <label htmlFor="quantity" className="inputLabel">
                      Unit
                    </label>
                    <div className="relative mt-2 font-normal text-[15px]">
                      {utilizationData?.unit ? (
                        utilizationData?.unit
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 mt-5 lg:me-4">
                  <label htmlFor="unitCost" className="inputLabel">
                    Unit Cost
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.unitCost ? (
                      formatToINR(utilizationData?.unitCost)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5 lg:me-4">
                  <label htmlFor="noOfHouseholds" className="inputLabel">
                    Impacted Households
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.noOfHouseholds ? (
                      formatNumberToCommas(utilizationData?.noOfHouseholds)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5 lg:me-4">
                  <label htmlFor="noOfBeneficiaries" className="inputLabel">
                    Reach (Beneficiaries)
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.noOfBeneficiaries ? (
                      formatNumberToCommas(utilizationData?.noOfBeneficiaries)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>

                <div className="flex-1 mt-5  lg:me-4 w-1/2 adjust-in-pdf">
                  <label htmlFor="totalCost" className="inputLabel">
                    Total Cost
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.totalCost ? (
                      formatToINR(utilizationData?.totalCost)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="grant" className="inputLabel">
                    External Grant
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.sourceofFund?.grant ? (
                      formatToINR(utilizationData?.sourceofFund?.grant)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="CC" className="inputLabel">
                    CC
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.sourceofFund?.CC ? (
                      formatToINR(utilizationData?.sourceofFund?.CC)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    LHWRF
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.sourceofFund?.LHWRF ? (
                      formatToINR(utilizationData?.sourceofFund?.LHWRF)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    Status
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.status ? (
                      utilizationData?.status
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    Convergence
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.convergence ? (
                      formatToINR(utilizationData?.convergence)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    Convergence Agency
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.convergenceAgencyName ? (
                      utilizationData?.convergenceAgencyName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    Convergence Document
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.convergenceDocumentName ? (
                      utilizationData?.convergenceDocumentName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-5  lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    Remarks
                  </label>
                  <div className="relative mt-2 font-normal text-[15px]">
                    {utilizationData?.convergenceNote ? (
                      utilizationData?.convergenceNote
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 mb-6 flex lg:flex-row md:flex-row flex-col hide-in-pdf">
                <div className="flex-1 lg:me-4 w-1/2">
                  <label htmlFor="totalCost" className="inputLabel">
                    Voucher Attachment
                  </label>
                  <div
                    className={`relative font-normal ${
                      utilizationAttachments?.length > 4
                        ? "grid grid-cols-4"
                        : "flex"
                    } gap-4 text-[15px]`}
                  >
                    {renderDocumentList("voucher").length > 0 ? (
                      renderDocumentList("voucher")
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      <div className="relative mt-2 font-medium">
                        No data found
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4 w-1/2">
                  <label htmlFor="totalCost" className="inputLabel">
                    Convergence Attachment
                  </label>
                  <div
                    className={`relative font-normal flex gap-4 text-[15px]`}
                  >
                    {renderDocumentList("convergence").length > 0 ? (
                      renderDocumentList("convergence")
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

          {console.log(
            "isUserAuthourised(approvalAuthName, approvalAuthRole)",
            approvalAuthName,
            approvalAuthRole,
            "----",
            isUserAuthourised(approvalAuthName, approvalAuthRole)
          )}
          {isUserAuthourised(approvalAuthName, approvalAuthRole) ||
          loggedInRole === "admin" ? (
            <div className="border-t-2">
              <h3 className="subHeading font-bold mt-4">
                Approval Authorities
              </h3>

              <div
                className={`flex gap-10 justify-between mt-5 mb-6 w-full adjust-authorities`}
              >
                <div className="w-1/2 adjust-authorities">
                  <table className="table-auto border-separate border-spacing-y-4">
                    <thead></thead>
                    <tbody>
                      {utilizationData?.approvalAuthourities?.map(
                        (item, index) => {
                          // Check if user is authorized and previous levels are approved
                          return (
                            <>
                              <tr
                                key={index}
                                className={
                                  "py-6 " +
                                  (item.approvalAuthName === approvalAuthName &&
                                  approvalAuthRole === item.approvalAuthRole
                                    ? "border border-2 bg-lightBlue text-Green"
                                    : "")
                                }
                              >
                                <td
                                  className={
                                    "pb-6 pe-4 inputLabel font-semibold " +
                                    (item.approvalAuthName ===
                                      approvalAuthName &&
                                    approvalAuthRole === item.approvalAuthRole
                                      ? "text-Green"
                                      : "")
                                  }
                                >
                                  {item.approvalLevel}
                                </td>
                                <td
                                  className={
                                    "ps-2 pe-4 " +
                                    (item.approvalAuthName ===
                                      approvalAuthName &&
                                    approvalAuthRole === item.approvalAuthRole
                                      ? "text-Green"
                                      : "")
                                  }
                                >
                                  <b>{item.approvalAuthName}</b> <br />
                                  <div className="inputLabel font-semibold">
                                    {item.approvalAuthRole}
                                  </div>
                                  <div className="inputLabel font-semibold">
                                    {item.approvalAuthEmail}
                                  </div>
                                  <div className="inputLabel font-semibold">
                                    {item.approvalAuthMobile}
                                  </div>
                                </td>
                                <td>
                                  <Image
                                    src={
                                      item.status === "approved"
                                        ? approvedStamp
                                        : item.status === "rejected"
                                        ? rejectedStamp
                                        : pendingStamp
                                    }
                                    className="w-20"
                                    alt={item.status}
                                  />
                                  <div className="mt-1 text-gray-600 text-xs">
                                    {moment(item.updatedAt).format(
                                      "DD/MM/yyyy"
                                    )}
                                    <br />
                                    {moment(item.updatedAt).format("hh:mm a")}
                                  </div>
                                </td>
                              </tr>
                              {item.remark && (
                                <tr className="py-6">
                                  <td
                                    colSpan={3}
                                    className="text-center text-red-500 text-sm"
                                  >
                                    {item.remark}
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
                {console.log(
                  "isUserAuthourised(approvalAuthName, approvalAuthRole)?.showActionButtons",
                  isUserAuthourised(approvalAuthName, approvalAuthRole)
                    ?.showActionButtons
                )}
                {isUserAuthourised(approvalAuthName, approvalAuthRole)
                  ?.showActionButtons && loggedInRole !== "admin" ? (
                  <div className="w-1/2 justify-center hide-in-pdf">
                    <div>
                      {matchedRoles.length > 1 ? (
                        <div className="mx-auto">
                          <label className="py-2 flex justify-center">
                            Select Role:
                          </label>
                          <div className="flex justify-center">
                            <select
                              name="approvalAuthRole"
                              id="approvalAuthRole"
                              className={`
                              ${
                                approvalAuthRole
                                  ? "text-black stdSelectField w-1/2"
                                  : "text-gray-400 w-1/2 stdSelectField"
                              }
                              `}
                              value={selectedRole}
                              onChange={(e) => {
                                setSelectedRole(e.target.value);
                                setApprovalAuthRole(e.target.value);
                              }}
                            >
                              <option className="text-gray-400" value="">
                                Select
                              </option>
                              {matchedRoles.map((role, index) => (
                                <option key={index} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : matchedRoles.length === 1 ? (
                        <p className="text-center mx-auto">
                          Approve This Activity as{" "}
                          <strong>{matchedRoles[0]}</strong>
                        </p>
                      ) : null}
                    </div>

                    <div className="flex justify-center gap-6">
                      <button
                        className="formButtons w-2/5"
                        onClick={(e) => {
                          handleSubmit("approved");
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="formButtons w-2/5 bg-red-500 hover:bg-red-700"
                        onClick={(e) => {
                          handleSubmit("rejected");
                        }}
                      >
                        Reject
                      </button>
                    </div>
                    <div>
                      <div className="inputLabel">
                        Remarks{" "}
                        {rejected && <span className="text-red-500">*</span>}
                      </div>

                      <textarea
                        className="ps-2 w-full font-normal"
                        rows={3}
                        cols={53}
                        value={remarks}
                        onChange={(e) => {
                          setRemarks(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            remarksError: "",
                          }));
                        }}
                      ></textarea>

                      <div
                        className="text-red-700 "
                        style={{ fontSize: "12px", fontWeight: "normal" }}
                      >
                        {error.remarksError}
                      </div>
                    </div>
                  </div>
                ) : (
                  " "
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default ApprovalDetails;
