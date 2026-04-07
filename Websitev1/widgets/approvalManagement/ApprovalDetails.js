// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";
// import moment from "moment";
// import Image from "next/image";
// import dynamic from "next/dynamic";
// // const html2pdf = dynamic(() => Promise.resolve(require("html2pdf")), {
// //   ssr: false,
// // });
// // import html2pdf from "html2pdf.js";
// import rejectedStamp from "@/public/images/specific/rejected-stamp.png";
// import approvedStamp from "@/public/images/specific/approved-stamp.png";
// import pendingStamp from "@/public/images/specific/pending-stamp.png";
// import validator from "validator";

// import { FaIndianRupeeSign } from "react-icons/fa6";
// import { MdOutlineEdit } from "react-icons/md";
// import { CiViewList } from "react-icons/ci";
// import Swal from "sweetalert2";
// import { Tooltip } from "flowbite-react";
// import { FaFileDownload, FaRegFileAlt, FaSpinner } from "react-icons/fa";

// import { usePathname } from "next/navigation";
// import ls from "localstorage-slim";

// const ApprovalDetails = () => {
//   const pathname = usePathname();
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true })
//   );
//   // console.log("userDetails  =>", userDetails);

//   const [status, setStatus] = useState("");
//   // const [initialStatus, setInitialStatus] = useState("");
//   const [stamp, setStamp] = useState("");
//   const [user_id, setUser_id] = useState("");
//   const [center_id, setCenter_id] = useState("all");
//   const [update, setUpdate] = useState(false);
//   const [approvalAuthName, setApprovalAuthName] = useState("");
//   const [approvalAuthRole, setApprovalAuthRole] = useState("");
//   const [matchedRoles, setMatchedRoles] = useState([]);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [roles, setRoles] = useState([]);
//   const [approvalData, setApprovalData] = useState([]);
//   const [approvalAttachments, setApprovalAttachments] = useState([]);
//   const [approvalAuthoritiesUpdated, setApprovalAuthoritiesUpdated] =
//     useState(false);
//   const [approved, setApproved] = useState(false);
//   const [rejected, setRejected] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loading2, setLoading2] = useState(true);
//   const [loading3, setLoading3] = useState(false);
//   const [loading4, setLoading4] = useState(false);
//   const [remarks, setRemarks] = useState("");
//   const [error, setError] = useState({});

//   const params = useParams();
//   const router = useRouter();

//   useEffect(() => {
//     if (pathname.includes("admin")) {
//       setLoggedInRole("admin");
//       setCenter_id("all");
//     } else if (pathname.includes("center")) {
//       setLoggedInRole("center");
//       setCenter_id(userDetails.center_id);
//     } else {
//       setLoggedInRole("executive");
//       setCenter_id("all");
//       // console.log("userDetails.roles", userDetails.roles);
//     }
//   }, []);

//   useEffect(() => {
//     getApprovalData();
//   }, [status, approvalAuthoritiesUpdated]);
//   const getApprovalData = () => {
//     axios
//       .get("/api/approval-details/get/one/" + params._id)
//       .then((response) => {
//         var approvalData = response.data[0];
//         // console.log("response", response);
//         if (approvalData?.approvalAuthourities) {
//           setApprovalAuthoritiesUpdated(true);
//         }
//         setApprovalData(approvalData);
//         const combinedAttachmentData = approvalData?.documentName?.map(
//           (name, index) => {
//             return {
//               name: name,
//               url: approvalData?.documentUrl[index],
//             };
//           }
//         );
//         setApprovalAttachments(combinedAttachmentData);

//         if (userDetails) {
//           const user_id = userDetails?.user_id;
//           const parseAuthName =
//             userDetails.firstName + " " + userDetails.lastName;
//           const parseAuthRole = userDetails.roles;
//           // console.log("parseAuthRole---------------------------------",parseAuthRole)
//           setUser_id(user_id);
//           setApprovalAuthName(parseAuthName);
//           setRoles(parseAuthRole);
//           // console.log(
//           //   "approvalData?.approvalAuthourities-------------------------------------",
//           //   approvalData?.approvalAuthourities
//           // );
//           // console.log(
//           //   "approvalAuthName-------------------------------------",
//           //   approvalAuthName
//           // );
//           const authRole = getAuthRole(parseAuthRole);
//           // console.log("authRole-------------------------------------",authRole)
//           setMatchedRoles(authRole);
//           if (matchedRoles.length === 1) {
//             setSelectedRole(matchedRoles[0]);
//             setApprovalAuthRole(matchedRoles[0]);
//           }
//           // console.log("approvalAuthRole-------------------------------------",approvalAuthRole)
//         }
//       })
//       .catch((error) => {
//         console.log("Error Message => ", error);
//         //   Swal.fire("Oops", "Something Went Wrong", "error");
//       })
//       .finally(() => {
//         setLoading2(false);
//       });
//   };

//   const getAuthRole = (roles) => {
//     const authorities =
//       approvalData?.approvalAuthourities
//         ?.filter((auth) => auth.approvalAuthName === approvalAuthName)
//         .map((auth) => auth.approvalAuthRole) || [];
//     console.log("authorities", authorities);
//     return roles.filter((role) => authorities.includes(role)); // Returns all matching roles
//   };

//   useEffect(() => {
//     if (approvalData?.approvalAuthourities) {
//       // Auto-select the first role if only one match is found
//       if (matchedRoles.length === 1) {
//         setSelectedRole(matchedRoles[0]);
//         setApprovalAuthRole(matchedRoles[0]);
//       }
//     }
//   }, [roles, approvalData]);

//   const validation = (st) => {
//     let inputIsValid = true;
//     let errorMsg = {};
//     // console.log("2 status => ", st);

//     if (st === "rejected" && validator.isEmpty(remarks)) {
//       // console.log("3 status => ", st);
//       inputIsValid = false;
//       errorMsg.remarksError = "This field is required.";
//       setError(errorMsg);
//     }
//     return inputIsValid;
//   };

//   const handleSubmit = (st) => {
//     if (approvalAuthRole) {
//       const authorities = approvalData?.approvalAuthourities || [];
//       const currentIndex = authorities.findIndex(
//         (auth) => auth.approvalAuthRole === approvalAuthRole
//       );

//       const nextLevelStatus = authorities?.[currentIndex + 1]?.status;
//       const prevLevelStatus = authorities?.[currentIndex - 1]?.status;

//       // 1. Prevent updating if next level is already approved/rejectedrejected
//       if (nextLevelStatus === "approved" || nextLevelStatus === "rejected") {
//         Swal.fire(
//           "Not Allowed",
//           "This level cannot be updated because the next level is already approved.",
//           "warning"
//         );
//         return;
//       }

//       // 2. Prevent approving/rejecting if previous level is rejected
//       if (currentIndex > 0 && prevLevelStatus === "rejected") {
//         Swal.fire(
//           "Action Blocked",
//           "Previous level is rejected. You cannot approve or reject this level.",
//           "error"
//         );
//         return;
//       }

//       // 3. Prevent action if previous level is still pending
//       if (currentIndex > 0 && prevLevelStatus === "pending") {
//         Swal.fire(
//           "Hold On!",
//           "Previous level is still pending. You cannot take action at this level yet.",
//           "info"
//         );
//         return;
//       }

//       let formValues = {
//         approvalAuthRole: approvalAuthRole,
//         approvalAuthName: approvalAuthName,
//         status: st,
//         remark: remarks,
//         updatedBy: user_id,
//       };

//       if (params._id && validation(st)) {
//         formValues.ID = params._id;
//         axios
//           .patch("/api/approval-details/patch/status", formValues)
//           .then((response) => {
//             console.log("5 response status => ", st, response);
//             if (st === "approved") {
//               Swal.fire(
//                 "Approved!",
//                 "This 'Approval Request' is Approved by you and Notification is sent to respective authourity!"
//               );
//             } else {
//               Swal.fire(
//                 "Rejected!",
//                 "This 'Approval Request' is Rejected by you and Notification is sent to respective authourity!"
//               );
//             }
//             setRemarks("");
//             getApprovalData();
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//       }
//     } else {
//       Swal.fire(
//         "Action Blocked",
//         "Please select your role to proceed.",
//         "error"
//       );
//       return;
//     }
//   };

//   const isUserAuthourised1 = (approvalAuthName, approvalAuthRole) => {
//     console.log(
//       "approvalAuthName, approvalAuthRole",
//       approvalAuthName,
//       approvalAuthRole
//     );
//     let authorizedIndexes = []; // Store all indexes where the user is authorized

//     approvalData?.approvalAuthourities?.forEach((authority, index) => {
//       if (
//         authority.approvalAuthName === approvalAuthName &&
//         matchedRoles.includes(authority.approvalAuthRole) // Check if any role matches
//       ) {
//         authorizedIndexes.push(index); // Capture all indexes where user has authority
//       }
//     });
//     console.log("authorizedIndexes", authorizedIndexes);
//     if (authorizedIndexes.length > 0) {
//       let showActionButtons = false;

//       for (let i = 0; i < authorizedIndexes.length; i++) {
//         let authorizedIndex = authorizedIndexes[i];

//         if (
//           authorizedIndex === 0 ||
//           approvalData.approvalAuthourities[authorizedIndex - 1]?.status ===
//             "approved"
//         ) {
//           if (
//             approvalData.approvalAuthourities[authorizedIndex + 1]?.status !==
//               "approved" &&
//             approvalData.approvalAuthourities[authorizedIndex + 1]?.status !==
//               "rejected"
//           ) {
//             showActionButtons = true; // Allow approval for next level
//           }
//         }
//       }

//       return showActionButtons ? { showActionButtons: true } : true;
//     }
//     return false;
//   };

//   const isUserAuthourised = (approvalAuthName, approvalAuthRole) => {
//     console.log(
//       "approvalAuthName, approvalAuthRole",
//       approvalAuthName,
//       approvalAuthRole
//     );

//     // Collect indexes where the user is authorized.
//     let authorizedIndexes = [];
//     approvalData?.approvalAuthourities?.forEach((authority, index) => {
//       if (
//         authority.approvalAuthName === approvalAuthName &&
//         matchedRoles.includes(authority.approvalAuthRole)
//       ) {
//         authorizedIndexes.push(index);
//       }
//     });
//     // console.log("authorizedIndexes", authorizedIndexes);

//     if (authorizedIndexes.length > 0) {
//       let showActionButtons = false;
//       const authorities = approvalData.approvalAuthourities;

//       for (let i = 0; i < authorizedIndexes.length; i++) {
//         const authorizedIndex = authorizedIndexes[i];
//         const currentStatus = authorities[authorizedIndex]?.status;
//         const prevStatus = authorities[authorizedIndex - 1]?.status;
//         const nextStatus = authorities[authorizedIndex + 1]?.status;

//         // --- CASE 1: First level ---
//         if (authorizedIndex === 0) {
//           // If all are pending, the first level should show buttons.
//           if (currentStatus === "pending") {
//             showActionButtons = true;
//             console.log("showActionButtons 1", showActionButtons);
//             break;
//           }
//         } else {
//           // --- CASE 2: Subsequent levels (index > 0) ---
//           // If current is pending, previous must be approved.
//           if (currentStatus === "pending") {
//             if (prevStatus === "pending") {
//               console.log("prevStatus 6", prevStatus);
//               showActionButtons = false;
//               console.log("showActionButtons 6", showActionButtons);
//               continue;
//             } else if (prevStatus === "approved" || prevStatus === "rejected") {
//               showActionButtons = true;
//               console.log("showActionButtons 2", showActionButtons);
//               break;
//             } else if (nextStatus !== "approved" && nextStatus !== "rejected") {
//               showActionButtons = true;
//               console.log("showActionButtons 2", showActionButtons);
//               break;
//             } else if (
//               authorizedIndexes.length === 0 &&
//               prevStatus === "pending"
//             ) {
//               showActionButtons = false;
//               console.log("showActionButtons 4", showActionButtons);
//               break;
//             } else if (
//               currentStatus === "pending" &&
//               prevStatus === "pending"
//             ) {
//               showActionButtons = false;
//               console.log("showActionButtons 5", showActionButtons);
//               break;
//             }
//           }
//         }

//         // --- CASE 3: For a level that is already approved/rejected ---
//         // Allow action if the next level is still pending.
//         if (
//           (currentStatus === "approved" || currentStatus === "rejected") &&
//           nextStatus === "pending"
//         ) {
//           showActionButtons = true;
//           console.log("showActionButtons 3", showActionButtons);
//           break;
//         }
//       }
//       // Return our result based on whether any authorized index qualifies.
//       return showActionButtons ? { showActionButtons: true } : true;
//       console.log("showActionButtons 5", showActionButtons);
//     }

//     return false;
//   };

//   const hideElements = () => {
//     const elementsToHide = document.querySelectorAll(".hide-in-pdf");
//     const elementsToShow = document.querySelectorAll(".show-in-pdf");
//     const elementsToAdjust = document.querySelectorAll(".adjust-in-pdf");
//     const elementsInAuthorities = document.querySelectorAll(
//       ".adjust-authorities"
//     );
//     const elementsAuthoritiesHeadings = document.querySelectorAll(
//       ".adjust-authorities-heading"
//     );
//     elementsToHide.forEach((element) => {
//       element.style.display = "none";
//     });

//     elementsToShow.forEach((element) => {
//       element.style.display = "block";
//     });

//     elementsToAdjust.forEach((element) => {
//       element.style.display = "block";
//       element.style.marginTop = "10px";
//       element.style.marginBottom = "10px";
//       element.style.width = "100%";
//     });
//     elementsInAuthorities.forEach((element) => {
//       element.style.display = "block";
//       element.style.width = "100%";
//       element.style.marginTop = "30px";
//     });

//     elementsAuthoritiesHeadings.forEach((element) => {
//       element.style.display = "block";
//       element.style.width = "100%";
//       element.style.marginTop =
//         approvalData?.remarks?.length > 300 ? "80px" : "250px";
//     });
//   };

//   // Function to show elements again after PDF generation
//   const showElements = () => {
//     const elementsToHide = document.querySelectorAll(".hide-in-pdf");
//     const elementsToShow = document.querySelectorAll(".show-in-pdf");

//     const elementsToAdjust = document.querySelectorAll(".adjust-in-pdf");
//     const elementsInAuthorities = document.querySelectorAll(
//       ".adjust-authorities"
//     );
//     const elementsAuthoritiesHeadings = document.querySelectorAll(
//       ".adjust-authorities-heading"
//     );
//     elementsToHide.forEach((element) => {
//       element.style.display = "";
//     });

//     elementsToShow.forEach((element) => {
//       element.style.display = "none";
//     });

//     elementsToAdjust.forEach((el) => {
//       el.style.display = "";
//       el.style.marginTop = "";
//       el.style.marginBottom = "";
//       el.style.width = "";
//     });

//     elementsInAuthorities.forEach((element) => {
//       element.style.display = "";
//       element.style.width = "";
//       element.style.marginTop = "";
//     });

//     elementsAuthoritiesHeadings.forEach((element) => {
//       element.style.display = "";
//       element.style.width = "";
//       element.style.marginTop = "";
//     });
//   };

//   const downloadPDF = async () => {
//     let element = document.getElementById("pdf-content");

//     hideElements();

//     const options = {
//       filename: "Activity Approval Report.pdf",
//       image: { type: "jpeg", quality: 1 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
//     };

//     const html2pdf = (await import("html2pdf.js")).default;

//     html2pdf()
//       .from(element)
//       .set(options)
//       .save()
//       .then(() => {
//         showElements();
//       });
//   };

//   const formatToINR = (num) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     })
//       .format(num)
//       .replace(/^(\D+)/, "$1 ");
//   };

//   const formatNumberToCommas = (num) => {
//     return new Intl.NumberFormat("en-IN").format(num);
//   };

//   return (
//     <section className="section">
//       <div className="box border-2 rounded-md shadow-md" id="pdf-content">
//         <div className="uppercase text-xl font-semibold">
//           <div className="border-b-2 border-gray-300 flex justify-between">
//             <h1 className="heading">Activity Approval Report</h1>

//             <div className="flex gap-3 my-5 me-10 hide-in-pdf">
//               <Tooltip
//                 content="Download as PDF"
//                 placement="bottom"
//                 className="bg-green"
//                 arrow={false}
//               >
//                 {loading3 ? (
//                   <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                 ) : (
//                   <FaFileDownload
//                     className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                     onClick={downloadPDF}
//                   />
//                 )}
//               </Tooltip>
//               {loggedInRole === "admin" || loggedInRole === "center" ? (
//                 <Tooltip
//                   content="Edit"
//                   placement="bottom"
//                   className="bg-green"
//                   arrow={false}
//                 >
//                   {loading4 ? (
//                     <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                   ) : (
//                     <MdOutlineEdit
//                       className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                       // onClick={() => {
//                       //   setLoading4(true);
//                       //   router.push(
//                       //     `/${loggedInRole}/approval-management/approval-submission/${params._id}`
//                       //   );
//                       //   setUpdate(true);
//                       // }}
//                       onClick={() => {
//                         window.open(
//                           `/${loggedInRole}/approval-management/approval-submission/${params._id}`,
//                           '_self'
//                           // "noopener,noreferrer"
//                         );
//                         setUpdate(true);
//                       }}
//                     />
//                   )}
//                 </Tooltip>
//               ) : null}
//               <Tooltip
//                 content="Approval List"
//                 placement="bottom"
//                 className="bg-green"
//                 arrow={false}
//               >
//                 {loading ? (
//                   <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                 ) : (
//                   <CiViewList
//                     className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                     // onClick={() => {
//                     //   setLoading(true);
//                     //   router.push(
//                     //     "/" +
//                     //       loggedInRole +
//                     //       "/approval-management/approval-list"
//                     //   );
//                     // }}
//                     onClick={() => {
//                       window.open(
//                         `/${loggedInRole}/approval-management/approval-list`,
//                         '_self'
//                         // "noopener,noreferrer"
//                       );
//                     }}
//                   />
//                 )}
//               </Tooltip>
//             </div>
//           </div>
//         </div>
//         <div className="px-10 py-6">
//           <div className="bg-white text-secondary">
//             <div className="me-2 rounded-md">
//               <div className="mt-5 mb-5 w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="centerName" className="inputLabel">
//                     Center Name
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.centerName ? (
//                       approvalData?.centerName
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="centerName" className="inputLabel">
//                     Approval Number
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.approvalNo ? (
//                       approvalData?.approvalNo
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 lg:me-4">
//                   <label
//                     htmlFor="approvalSubmissionDate"
//                     className="inputLabel"
//                   >
//                     Submission Date
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.approvalSubmissionDate ? (
//                       moment(approvalData?.approvalSubmissionDate).format(
//                         "DD-MM-YYYY"
//                       )
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 {approvalData?.finalStatus === "approved" ? (
//                   <div className="flex-1 lg:me-4">
//                     <label
//                       htmlFor="approvalSubmissionDate"
//                       className="inputLabel"
//                     >
//                       Approval Date
//                     </label>

//                     <div className="relative mt-2 font-normal text-[15px]">
//                       {approvalData?.approvalDate ? (
//                         moment(approvalData?.approvalDate).format("DD-MM-YYYY")
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </div>
//                   </div>
//                 ) : null}
//               </div>
//               <div className="mt-5 mb-5 w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="program" className="inputLabel">
//                     Program
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.program ? (
//                       approvalData?.program
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="project" className="inputLabel">
//                     Project
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.project ? (
//                       approvalData?.project
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="activityName" className="inputLabel">
//                     Activity
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.activityName ? (
//                       approvalData?.activityName
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 lg:me-4">
//                   <label htmlFor="subactivityName" className="inputLabel">
//                     Subactivity
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.subactivityName ? (
//                       approvalData?.subactivityName
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 mt-5 flex w-full gap-2 lg:me-4">
//                   <div>
//                     <label htmlFor="quantity" className="inputLabel">
//                       Quantity
//                     </label>
//                     <div className="relative mt-2 font-normal text-[15px]">
//                       {approvalData?.quantity ? (
//                         formatNumberToCommas(approvalData?.quantity)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex-1 mt-5 flex w-full gap-2 lg:me-4">
//                   <div>
//                     <label htmlFor="quantity" className="inputLabel">
//                       Unit
//                     </label>
//                     <div className="relative mt-2 font-normal text-[15px]">
//                       {approvalData?.unit ? (
//                         approvalData?.unit
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex-1 mt-5 lg:me-4">
//                   <label htmlFor="unitCost" className="inputLabel">
//                     Unit Cost
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.unitCost ? (
//                       formatToINR(approvalData?.unitCost)
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       0
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5 lg:me-4">
//                   <label htmlFor="noOfHouseholds" className="inputLabel">
//                     Impacted Households
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.noOfHouseholds ? (
//                       formatNumberToCommas(approvalData?.noOfHouseholds)
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       0
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5 lg:me-4">
//                   <label htmlFor="noOfBeneficiaries" className="inputLabel">
//                     Reach (Beneficiaries)
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.noOfBeneficiaries ? (
//                       formatNumberToCommas(approvalData?.noOfBeneficiaries)
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       0
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 mt-5  lg:me-4 w-1/2">
//                   <label htmlFor="totalCost" className="inputLabel">
//                     Total Cost
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.totalCost ? (
//                       formatToINR(approvalData?.totalCost)
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       0
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5  lg:me-4">
//                   <label htmlFor="grant" className="inputLabel">
//                     External Grant
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.sourceofFund?.grant ? (
//                       formatToINR(approvalData?.sourceofFund?.grant)
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       0
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5  lg:me-4">
//                   <label htmlFor="CC" className="inputLabel">
//                     CC
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.sourceofFund?.CC ? (
//                       formatToINR(approvalData?.sourceofFund?.CC)
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       0
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1 mt-5  lg:me-4">
//                   <label htmlFor="LHWRF" className="inputLabel">
//                     LHWRF
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.sourceofFund?.LHWRF ? (
//                       formatToINR(approvalData?.sourceofFund?.LHWRF)
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       0
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 col-span-3 mt-5  lg:me-4">
//                   <label htmlFor="Convergence" className="inputLabel">
//                     Convergence
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.convergence ? (
//                       approvalData?.convergence
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex-1 col-span-4 mt-5  lg:me-4">
//                   <label htmlFor="LHWRF" className="inputLabel">
//                     Remarks
//                   </label>
//                   <div className="relative mt-2 font-normal text-[15px]">
//                     {approvalData?.remarks ? (
//                       approvalData?.remarks
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       "NA"
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {approvalData?.approvalAuthourities?.length > 0 ? (
//                 <table className="w-full mt-10 mb-10 table-fixed border-collapse hidden show-in-pdf text-sm">
//                   <thead className="font-bold text-leftBlack">
//                     <tr className="border border-leftBlack">
//                       {approvalData?.approvalAuthourities?.map((_, i) => (
//                         <th
//                           key={i}
//                           className="p-2 border border-leftBlack text-center"
//                           style={{ width: "25%" }}
//                         >
//                           Approval Authorities (Level {i + 1})
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="font-medium text-center text-leftBlack">
//                     <tr className="border border-leftBlack">
//                       {approvalData?.approvalAuthourities?.map(
//                         (authority, i) => (
//                           <td
//                             key={i}
//                             className="p-2 border border-leftBlack align-top"
//                             style={{ width: "25%" }}
//                           >
//                             <div className="flex flex-col items-center justify-center">
//                               {/* <Image
//                                                 src={
//                                                   authority.status === "approved"
//                                                     ? approvedStamp
//                                                     : authority.status === "rejected"
//                                                     ? rejectedStamp
//                                                     : pendingStamp
//                                                 }
//                                                 alt={authority.status}
//                                                 className="w-full max-w-[100px] h-auto object-contain mx-auto"
//                                               /> */}
//                               <div
//                                 className={`my-6 text-2xl font-bold capitalize ${
//                                   authority?.status === "approved"
//                                     ? "text-Green"
//                                     : authority?.status === "rejected"
//                                     ? "text-red-700"
//                                     : "text-blue-500"
//                                 }`}
//                               >
//                                 {authority?.status}
//                               </div>
//                               <div className="mt-1 text-gray-600 text-xs">
//                                 {moment(authority?.updatedAt).format(
//                                   "DD/MM/yyyy"
//                                 )}
//                                 <br />
//                                 {moment(authority.updatedAt).format("hh:mm a")}
//                               </div>
//                               <div className="mt-3 text-xs text-center">
//                                 <b>{authority?.approvalAuthName}</b> <br />
//                                 <div className="font-semibold">
//                                   {authority?.approvalAuthRole}
//                                 </div>
//                                 <div className="font-semibold">
//                                   {authority?.approvalAuthEmail}
//                                 </div>
//                                 <div className="font-semibold">
//                                   {authority?.approvalAuthMobile}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                         )
//                       )}
//                     </tr>
//                   </tbody>
//                 </table>
//               ) : null}

//               <div className="mt-5 mb-6 flex lg:flex-row md:flex-row flex-col hide-in-pdf">
//                 <div className="flex-1 lg:me-4 w-1/2">
//                   <label htmlFor="totalCost" className="inputLabel">
//                     Attachments
//                   </label>
//                   <div
//                     className={`relative font-normal ${
//                       approvalAttachments?.length > 4
//                         ? "grid grid-cols-4"
//                         : "flex"
//                     } gap-4 text-[15px]`}
//                   >
//                     {approvalAttachments && approvalAttachments?.length > 0 ? (
//                       approvalAttachments?.map((document, index) => {
//                         const imageExt =
//                           "jpg" ||
//                           "jpeg" ||
//                           "png" ||
//                           "webp" ||
//                           "gif" ||
//                           "psd" ||
//                           "tiff" ||
//                           "jfif";

//                         let previewDiv = "";

//                         if (
//                           document?.name.split(".").pop() === "png" ||
//                           document?.name.split(".").pop() === "jpg" ||
//                           document?.name.split(".").pop() === "jpeg" ||
//                           document?.name.split(".").pop() === "jfif" ||
//                           document?.name.split(".").pop() === "webp" ||
//                           document?.name.split(".").pop() === "psd" ||
//                           document?.name.split(".").pop() === "tiff" ||
//                           document?.name.split(".").pop() === "jfif" ||
//                           document?.name.split(".").pop() === "gif"
//                         ) {
//                           previewDiv = (
//                             <img
//                               src={document?.url}
//                               className="text-2xl h-14 w-14 content-center z-[1]"
//                             />
//                           );
//                         } else if (
//                           document?.name.split(".").pop() === "xls" ||
//                           document?.name.split(".").pop() === "xlsx"
//                         ) {
//                           previewDiv = (
//                             <img
//                               src="/images/generic/Excel-download-icon.png"
//                               className="text-2xl h-14 w-14 content-center"
//                             />
//                           );
//                         } else if (document?.name.split(".").pop() === "pdf") {
//                           previewDiv = (
//                             <img
//                               src="/images/generic/pdf-file-icon.png"
//                               className="text-2xl h-10 w-10 content-center"
//                             />
//                           );
//                         } else {
//                           previewDiv = (
//                             <FaRegFileAlt className="text-xs text-green content-center z-[1]" />
//                           );
//                         }

//                         return (
//                           <div
//                             className={`flex col-span-1 gap-3 ${
//                               document.name !== "" ||
//                               approvalAttachments?.length > 0
//                                 ? "mt-2"
//                                 : "mt-0"
//                             }`}
//                           >
//                             {document?.name !== "" && document?.name !== "" ? (
//                               <div>{++index}.</div>
//                             ) : (
//                               ""
//                             )}
//                             {document?.name !== "" && document?.url !== "" ? (
//                               <Tooltip
//                                 content="Download file"
//                                 className="bg-green"
//                                 placement="bottom"
//                                 arrow={false}
//                               >
//                                 <div className="text-center w-full border border-dashed border-gray-400 px-1.5 py-2 rounded-md relative">
//                                   <div className="flex justify-center">
//                                     <a
//                                       target="_blank" href={
//                                         document?.url !== "" && document?.url
//                                       }
//                                       className="hover:scale-110 min-h-14 content-center"
//                                       download
//                                     >
//                                       {previewDiv}
//                                     </a>
//                                   </div>
//                                   <div className="flex gap-2">
//                                     <a
//                                       target="_blank" href={
//                                         document?.url !== "" && document?.url
//                                       }
//                                       className="hover:underline underline hover:font-medium"
//                                       download
//                                     >
//                                       {document?.name !== "" && document?.name}
//                                     </a>
//                                   </div>
//                                 </div>
//                               </Tooltip>
//                             ) : (
//                               "No data found"
//                             )}
//                           </div>
//                         );
//                       })
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       <div className="relative mt-2 font-medium">
//                         No data found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {console.log(
//             "isUserAuthourised(approvalAuthName, approvalAuthRole)",
//             isUserAuthourised(approvalAuthName, approvalAuthRole),
//             approvalAuthName,
//             approvalAuthRole
//           )}
//           {isUserAuthourised(approvalAuthName, approvalAuthRole) ||
//           loggedInRole === "admin" ? (
//             <div className="border-t-2 hide-in-pdf">
//               <h3 className="subHeading font-bold mt-4">
//                 Approval Authorities
//               </h3>

//               <div className="flex gap-10 justify-between mt-5 mb-6 w-full adjust-authorities">
//                 <div className="w-1/2 adjust-in-pdf">
//                   <table className="table-auto border-separate border-spacing-y-4">
//                     <thead></thead>
//                     <tbody>
//                       {approvalData?.approvalAuthourities?.map(
//                         (item, index) => {
//                           // Check if user is authorized and previous levels are approved
//                           return (
//                             <>
//                               <tr
//                                 key={index}
//                                 className={
//                                   "py-6 " +
//                                   (item.approvalAuthName === approvalAuthName &&
//                                   approvalAuthRole === item.approvalAuthRole
//                                     ? "border-2 bg-lightBlue text-Green"
//                                     : "")
//                                 }
//                               >
//                                 <td
//                                   className={
//                                     "pb-6 pe-4 inputLabel font-semibold " +
//                                     (item.approvalAuthName ===
//                                       approvalAuthName &&
//                                     approvalAuthRole === item.approvalAuthRole
//                                       ? "text-Green"
//                                       : "")
//                                   }
//                                 >
//                                   {item.approvalLevel}
//                                 </td>
//                                 <td
//                                   className={
//                                     "ps-2 pe-4 " +
//                                     (item.approvalAuthName ===
//                                       approvalAuthName &&
//                                     approvalAuthRole === item.approvalAuthRole
//                                       ? "text-Green"
//                                       : "")
//                                   }
//                                 >
//                                   <b>{item.approvalAuthName}</b> <br />
//                                   <div className="inputLabel font-semibold">
//                                     {item.approvalAuthRole}
//                                   </div>
//                                   <div className="inputLabel font-semibold">
//                                     {item.approvalAuthEmail}
//                                   </div>
//                                   <div className="inputLabel font-semibold">
//                                     {item.approvalAuthMobile}
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <Image
//                                     src={
//                                       item.status === "approved"
//                                         ? approvedStamp
//                                         : item.status === "rejected"
//                                         ? rejectedStamp
//                                         : pendingStamp
//                                     }
//                                     className="w-20"
//                                     alt={item.status}
//                                   />
//                                   <div className="mt-1 text-gray-600 text-xs">
//                                     {moment(item.updatedAt).format(
//                                       "DD/MM/yyyy"
//                                     )}
//                                     <br />
//                                     {moment(item.updatedAt).format("hh:mm a")}
//                                   </div>
//                                 </td>
//                               </tr>
//                               {item.remark && (
//                                 <tr className="py-6">
//                                   <td
//                                     colSpan={3}
//                                     className="text-center text-red-500 text-sm"
//                                   >
//                                     {item.remark}
//                                   </td>
//                                 </tr>
//                               )}
//                             </>
//                           );
//                         }
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//                 {console.log(
//                   "isUserAuthourised(approvalAuthName, approvalAuthRole)?.showActionButtons",
//                   isUserAuthourised(approvalAuthName, approvalAuthRole)
//                     ?.showActionButtons
//                 )}
//                 {isUserAuthourised(approvalAuthName, approvalAuthRole)
//                   ?.showActionButtons && loggedInRole !== "admin" ? (
//                   <div className="w-1/2 justify-center hide-in-pdf">
//                     <div>
//                       {matchedRoles.length > 1 ? (
//                         <div className="mx-auto">
//                           <label className="py-2 flex justify-center">
//                             Select Role:
//                           </label>
//                           <div className="flex justify-center">
//                             <select
//                               name="approvalAuthRole"
//                               id="approvalAuthRole"
//                               className={`
//                               ${
//                                 approvalAuthRole
//                                   ? "text-black stdSelectField w-1/2"
//                                   : "text-gray-400 w-1/2 stdSelectField"
//                               }
//                               `}
//                               value={selectedRole}
//                               onChange={(e) => {
//                                 setSelectedRole(e.target.value);
//                                 setApprovalAuthRole(e.target.value);
//                               }}
//                             >
//                               <option className="text-gray-400" value="">
//                                 Select
//                               </option>
//                               {matchedRoles.map((role, index) => (
//                                 <option
//                                   key={index}
//                                   value={role}
//                                   className="text-black"
//                                 >
//                                   {role}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>
//                       ) : matchedRoles.length === 1 ? (
//                         <p className="text-center mx-auto">
//                           Approve This Activity as{" "}
//                           <strong>{matchedRoles[0]}</strong>
//                         </p>
//                       ) : null}
//                     </div>

//                     <div className="flex justify-center gap-6">
//                       <button
//                         className="formButtons w-2/5"
//                         onClick={(e) => {
//                           handleSubmit("approved");
//                         }}
//                       >
//                         Approve
//                       </button>
//                       <button
//                         className="formButtons w-2/5 bg-red-500 hover:bg-red-700"
//                         onClick={(e) => {
//                           handleSubmit("rejected");
//                         }}
//                       >
//                         Reject
//                       </button>
//                     </div>
//                     <div>
//                       <div className="inputLabel">
//                         Remarks{" "}
//                         {rejected && <span className="text-red-500">*</span>}
//                       </div>

//                       <textarea
//                         className="ps-2 w-full font-normal"
//                         rows={3}
//                         cols={53}
//                         value={remarks}
//                         onChange={(e) => {
//                           setRemarks(e.target.value);
//                           setError((prevState) => ({
//                             ...prevState,
//                             remarksError: "",
//                           }));
//                         }}
//                       ></textarea>

//                       <div
//                         className="text-red-700 "
//                         style={{ fontSize: "12px", fontWeight: "normal" }}
//                       >
//                         {error.remarksError}
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   " "
//                 )}
//               </div>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ApprovalDetails;

















// changes by Neha
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
  const [matchedRoles, setMatchedRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [approvalAttachments, setApprovalAttachments] = useState([]);
  const [approvalAuthoritiesUpdated, setApprovalAuthoritiesUpdated] =
    useState(false);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState({});

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
    getApprovalData();
  }, [status, approvalAuthoritiesUpdated]);
  const getApprovalData = () => {
    axios
      .get("/api/approval-details/get/one/" + params._id)
      .then((response) => {
        var approvalData = response.data[0];
        // console.log("response", response);
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
          // console.log("parseAuthRole---------------------------------",parseAuthRole)
          setUser_id(user_id);
          setApprovalAuthName(parseAuthName);
          setRoles(parseAuthRole);
          // console.log(
          //   "approvalData?.approvalAuthourities-------------------------------------",
          //   approvalData?.approvalAuthourities
          // );
          // console.log(
          //   "approvalAuthName-------------------------------------",
          //   approvalAuthName
          // );
          const authRole = getAuthRole(parseAuthRole);
          // console.log("authRole-------------------------------------",authRole)
          setMatchedRoles(authRole);
          if (matchedRoles.length === 1) {
            setSelectedRole(matchedRoles[0]);
            setApprovalAuthRole(matchedRoles[0]);
          }
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

  const getAuthRole = (roles) => {
    const authorities =
      approvalData?.approvalAuthourities
        ?.filter((auth) => auth.approvalAuthName === approvalAuthName)
        .map((auth) => auth.approvalAuthRole) || [];
    console.log("authorities", authorities);
    return roles.filter((role) => authorities.includes(role)); // Returns all matching roles
  };

  useEffect(() => {
    if (approvalData?.approvalAuthourities) {
      // Auto-select the first role if only one match is found
      if (matchedRoles.length === 1) {
        setSelectedRole(matchedRoles[0]);
        setApprovalAuthRole(matchedRoles[0]);
      }
    }
  }, [roles, approvalData]);

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
    if (approvalAuthRole) {
      const authorities = approvalData?.approvalAuthourities || [];
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
          .patch("/api/approval-details/patch/status", formValues)
          .then((response) => {
            console.log("5 response status => ", st, response);
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
    } else {
      Swal.fire(
        "Action Blocked",
        "Please select your role to proceed.",
        "error"
      );
      return;
    }
  };

  const isUserAuthourised1 = (approvalAuthName, approvalAuthRole) => {
    console.log(
      "approvalAuthName, approvalAuthRole",
      approvalAuthName,
      approvalAuthRole
    );
    let authorizedIndexes = []; // Store all indexes where the user is authorized

    approvalData?.approvalAuthourities?.forEach((authority, index) => {
      if (
        authority.approvalAuthName === approvalAuthName &&
        matchedRoles.includes(authority.approvalAuthRole) // Check if any role matches
      ) {
        authorizedIndexes.push(index); // Capture all indexes where user has authority
      }
    });
    console.log("authorizedIndexes", authorizedIndexes);
    if (authorizedIndexes.length > 0) {
      let showActionButtons = false;

      for (let i = 0; i < authorizedIndexes.length; i++) {
        let authorizedIndex = authorizedIndexes[i];

        if (
          authorizedIndex === 0 ||
          approvalData.approvalAuthourities[authorizedIndex - 1]?.status ===
            "approved"
        ) {
          if (
            approvalData.approvalAuthourities[authorizedIndex + 1]?.status !==
              "approved" &&
            approvalData.approvalAuthourities[authorizedIndex + 1]?.status !==
              "rejected"
          ) {
            showActionButtons = true; // Allow approval for next level
          }
        }
      }

      return showActionButtons ? { showActionButtons: true } : true;
    } 
    return false;
  };

  const isUserAuthourised = (approvalAuthName, approvalAuthRole) => {
    console.log(
      "approvalAuthName, approvalAuthRole",
      approvalAuthName,
      approvalAuthRole
    );

    // Collect indexes where the user is authorized.
    let authorizedIndexes = [];
    approvalData?.approvalAuthourities?.forEach((authority, index) => {
      if (
        authority.approvalAuthName === approvalAuthName &&
        matchedRoles.includes(authority.approvalAuthRole)
      ) {
        authorizedIndexes.push(index);
      }
    });
    // console.log("authorizedIndexes", authorizedIndexes);

    if (authorizedIndexes.length > 0) {
      let showActionButtons = false;
      const authorities = approvalData.approvalAuthourities;

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
      console.log("showActionButtons 5", showActionButtons);
    }

    return false;
  };

  const hideElements = () => {
    const elementsToHide = document.querySelectorAll(".hide-in-pdf");
    const elementsToShow = document.querySelectorAll(".show-in-pdf");
    const elementsToAdjust = document.querySelectorAll(".adjust-in-pdf");
    const elementsInAuthorities = document.querySelectorAll(
      ".adjust-authorities"
    );
    const elementsAuthoritiesHeadings = document.querySelectorAll(
      ".adjust-authorities-heading"
    );
    elementsToHide.forEach((element) => {
      element.style.display = "none";
    });

    elementsToShow.forEach((element) => {
      element.style.display = "block";
    });

    elementsToAdjust.forEach((element) => {
      element.style.display = "block";
      element.style.marginTop = "10px";
      element.style.marginBottom = "10px";
      element.style.width = "100%";
    });
    elementsInAuthorities.forEach((element) => {
      element.style.display = "block";
      element.style.width = "100%";
      element.style.marginTop = "30px";
    });

    elementsAuthoritiesHeadings.forEach((element) => {
      element.style.display = "block";
      element.style.width = "100%";
      element.style.marginTop =
        approvalData?.remarks?.length > 300 ? "80px" : "250px";
    });
  };

  // Function to show elements again after PDF generation
  const showElements = () => {
    const elementsToHide = document.querySelectorAll(".hide-in-pdf");
    const elementsToShow = document.querySelectorAll(".show-in-pdf");

    const elementsToAdjust = document.querySelectorAll(".adjust-in-pdf");
    const elementsInAuthorities = document.querySelectorAll(
      ".adjust-authorities"
    );
    const elementsAuthoritiesHeadings = document.querySelectorAll(
      ".adjust-authorities-heading"
    );
    elementsToHide.forEach((element) => {
      element.style.display = "";
    });

    elementsToShow.forEach((element) => {
      element.style.display = "none";
    });

    elementsToAdjust.forEach((el) => {
      el.style.display = "";
      el.style.marginTop = "";
      el.style.marginBottom = "";
      el.style.width = "";
    });

    elementsInAuthorities.forEach((element) => {
      element.style.display = "";
      element.style.width = "";
      element.style.marginTop = "";
    });

    elementsAuthoritiesHeadings.forEach((element) => {
      element.style.display = "";
      element.style.width = "";
      element.style.marginTop = "";
    });
  };

  const downloadPDF = async () => {
    let element = document.getElementById("pdf-content");

    hideElements();

    const options = {
      filename: "Activity Approval Report.pdf",
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
            <h1 className="heading">Activity Approval Report</h1>

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
                  {loading4 ? (
                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                  ) : (
                    <MdOutlineEdit
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      // onClick={() => {
                      //   setLoading4(true);
                      //   router.push(
                      //     `/${loggedInRole}/approval-management/approval-submission/${params._id}`
                      //   );
                      //   setUpdate(true);
                      // }}
                      onClick={() => {
                        window.open(
                          `/${loggedInRole}/approval-management/approval-submission/${params._id}`,
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
                    // onClick={() => {
                    //   setLoading(true);
                    //   router.push(
                    //     "/" +
                    //       loggedInRole +
                    //       "/approval-management/approval-list"
                    //   );
                    // }}
                    onClick={() => {
                      window.open(
                        `/${loggedInRole}/approval-management/approval-list`,
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
        <div className="px-4 lg:px-10 py-6">
          <div className="bg-white text-secondary">
            <div className="me-2 rounded-md">
              <div className="mt-5 mb-5 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex-1 lg:me-4">
                  <label htmlFor="centerName" className="inputLabel">
                    Center Name
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.centerName ? (
                      approvalData?.centerName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="centerName" className="inputLabel">
                    Approval Number
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.approvalNo ? (
                      approvalData?.approvalNo
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
                    Submission Date
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.approvalSubmissionDate ? (
                      moment(approvalData?.approvalSubmissionDate).format(
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
                      htmlFor="approvalSubmissionDate"
                      className="inputLabel"
                    >
                      Approval Date
                    </label>

                    <div className="relative mt-2 font-bold text-[15px]">
                      {approvalData?.approvalDate ? (
                        moment(approvalData?.approvalDate).format("DD-MM-YYYY")
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </div>
                  </div>
                ) : <div className="hidden lg:block"></div>}
                
                <div className="flex-1 lg:me-4">
                  <label htmlFor="program" className="inputLabel">
                    Program
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.program ? (
                      approvalData?.program
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
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.project ? (
                      approvalData?.project
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
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.activityName ? (
                      approvalData?.activityName
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
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.subactivityName ? (
                      approvalData?.subactivityName
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>

                <div className="flex-1 flex w-full gap-2 lg:me-4">
                  <div>
                    <label htmlFor="quantity" className="inputLabel">
                      Quantity
                    </label>
                    <div className="relative mt-2 font-bold text-[15px]">
                      {approvalData?.quantity ? (
                        formatNumberToCommas(approvalData?.quantity)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex w-full gap-2 lg:me-4">
                  <div>
                    <label htmlFor="quantity" className="inputLabel">
                      Unit
                    </label>
                    <div className="relative mt-2 font-bold text-[15px]">
                      {approvalData?.unit ? (
                        approvalData?.unit
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 lg:me-4">
                  <label htmlFor="unitCost" className="inputLabel">
                    Unit Cost
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.unitCost ? (
                      formatToINR(approvalData?.unitCost)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="noOfHouseholds" className="inputLabel">
                    Impacted Households
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.noOfHouseholds ? (
                      formatNumberToCommas(approvalData?.noOfHouseholds)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="noOfBeneficiaries" className="inputLabel">
                    Reach (Beneficiaries)
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.noOfBeneficiaries ? (
                      formatNumberToCommas(approvalData?.noOfBeneficiaries)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>

                <div className="flex-1 lg:me-4">
                  <label htmlFor="totalCost" className="inputLabel">
                    Total Cost
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.totalCost ? (
                      formatToINR(approvalData?.totalCost)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="grant" className="inputLabel">
                    External Grant
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.sourceofFund?.grant ? (
                      formatToINR(approvalData?.sourceofFund?.grant)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="CC" className="inputLabel">
                    CC
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.sourceofFund?.CC ? (
                      formatToINR(approvalData?.sourceofFund?.CC)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    LHWRF
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.sourceofFund?.LHWRF ? (
                      formatToINR(approvalData?.sourceofFund?.LHWRF)
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      0
                    )}
                  </div>
                </div>

                <div className="flex-1 col-span-full md:col-span-2 lg:col-span-3 lg:me-4">
                  <label htmlFor="Convergence" className="inputLabel">
                    Convergence
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.convergence ? (
                      approvalData?.convergence
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>

                <div className="flex-1 col-span-full lg:me-4">
                  <label htmlFor="LHWRF" className="inputLabel">
                    Remarks
                  </label>
                  <div className="relative mt-2 font-bold text-[15px]">
                    {approvalData?.remarks ? (
                      approvalData?.remarks
                    ) : loading2 ? (
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    ) : (
                      "NA"
                    )}
                  </div>
                </div>
              </div>

              {approvalData?.approvalAuthourities?.length > 0 ? (
                <table className="w-full mt-10 mb-10 table-fixed border-collapse hidden show-in-pdf text-sm">
                  <thead className="font-bold text-leftBlack">
                    <tr className="border border-leftBlack">
                      {approvalData?.approvalAuthourities?.map((_, i) => (
                        <th
                          key={i}
                          className="p-2 border border-leftBlack text-center"
                          style={{ width: "25%" }}
                        >
                          Approval Authorities (Level {i + 1})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-medium text-center text-leftBlack">
                    <tr className="border border-leftBlack">
                      {approvalData?.approvalAuthourities?.map(
                        (authority, i) => (
                          <td
                            key={i}
                            className="p-2 border border-leftBlack align-top"
                            style={{ width: "25%" }}
                          >
                            <div className="flex flex-col items-center justify-center">
                              {/* <Image
                                                src={
                                                  authority.status === "approved"
                                                    ? approvedStamp
                                                    : authority.status === "rejected"
                                                    ? rejectedStamp
                                                    : pendingStamp
                                                }
                                                alt={authority.status}
                                                className="w-full max-w-[100px] h-auto object-contain mx-auto"
                                              /> */}
                              <div
                                className={`my-6 text-2xl font-bold capitalize ${
                                  authority?.status === "approved"
                                    ? "text-Green"
                                    : authority?.status === "rejected"
                                    ? "text-red-700"
                                    : "text-blue-500"
                                }`}
                              >
                                {authority?.status}
                              </div>
                              <div className="mt-1 text-gray-600 text-xs">
                                {moment(authority?.updatedAt).format(
                                  "DD/MM/yyyy"
                                )}
                                <br />
                                {moment(authority.updatedAt).format("hh:mm a")}
                              </div>
                              <div className="mt-3 text-xs text-center">
                                <b>{authority?.approvalAuthName}</b> <br />
                                <div className="font-semibold">
                                  {authority?.approvalAuthRole}
                                </div>
                                <div className="font-semibold">
                                  {authority?.approvalAuthEmail}
                                </div>
                                <div className="font-semibold">
                                  {authority?.approvalAuthMobile}
                                </div>
                              </div>
                            </div>
                          </td>
                        )
                      )}
                    </tr>
                  </tbody>
                </table>
              ) : null}

              <div className="mt-5 mb-6 flex lg:flex-row md:flex-row flex-col hide-in-pdf">
                <div className="flex-1 lg:me-4 w-1/2">
                  <label htmlFor="totalCost" className="inputLabel">
                    Attachments
                  </label>
                  <div
                    className={`relative font-bold ${
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
                      <div className="relative mt-2 font-bold">
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
            isUserAuthourised(approvalAuthName, approvalAuthRole),
            approvalAuthName,
            approvalAuthRole
          )}
          {isUserAuthourised(approvalAuthName, approvalAuthRole) ||
          loggedInRole === "admin" ? (
            <div className="border-t-2 hide-in-pdf">
              <h3 className="subHeading font-bold mt-4">
                Approval Authorities
              </h3>

              <div className="flex flex-col lg:flex-row gap-10 justify-between mt-5 mb-6 w-full adjust-authorities">
                <div className="w-full lg:w-1/2 px-2 lg:px-6 py-2 lg:py-6 adjust-in-pdf">
                  <div className="flex flex-col gap-4">
                    {approvalData?.approvalAuthourities?.map((item, index) => {
                      const isMatched = item.approvalAuthName === approvalAuthName && approvalAuthRole === item.approvalAuthRole;
                      return (
                        <div key={index} className="flex flex-col gap-2">
                          <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-6 rounded-md lg:rounded-lg border ${isMatched ? "border-Green bg-lightBlue shadow-sm" : "border-gray-200"}`}>
                            <div className="flex items-center gap-4">
                              <div className={`text-sm font-bold min-w-[80px] ${isMatched ? "text-Green" : "text-gray-500"}`}>
                                {item.approvalLevel}
                              </div>
                              <div>
                                <div className={`font-bold ${isMatched ? "text-Green" : "text-gray-800"}`}>
                                  {item.approvalAuthName}
                                </div>
                                <div className="text-xs text-gray-500 font-semibold">{item.approvalAuthRole}</div>
                                <div className="text-xs text-gray-500 font-semibold break-all">{item.approvalAuthEmail}</div>

                                <div className="text-xs text-gray-500 font-semibold">{item.approvalAuthMobile}</div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center min-w-[70px] sm:min-w-[100px]">
                              <Image
                                src={
                                  item.status === "approved"
                                    ? approvedStamp
                                    : item.status === "rejected"
                                    ? rejectedStamp
                                    : pendingStamp
                                }
                                className="w-12 sm:w-16 h-auto"
                                alt={item.status}
                              />
                              <div className="mt-1 text-[10px] text-gray-500 text-center leading-tight">
                                {moment(item.updatedAt).format("DD/MM/yyyy")}<br />
                                {moment(item.updatedAt).format("hh:mm a")}
                              </div>
                            </div>
                          </div>
                          {item.remark && (
                            <div className="px-4 py-2 text-center text-red-500 text-xs italic bg-red-50 rounded-md border border-red-100 mx-4">
                              {item.remark}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {console.log(
                  "isUserAuthourised(approvalAuthName, approvalAuthRole)?.showActionButtons",
                  isUserAuthourised(approvalAuthName, approvalAuthRole)
                    ?.showActionButtons
                )}
                {isUserAuthourised(approvalAuthName, approvalAuthRole)
                  ?.showActionButtons && loggedInRole !== "admin" ? (
                  <div className="w-full lg:w-1/2 border border-gray-200 rounded-lg p-5 md:p-8 shadow-sm hide-in-pdf h-fit">

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
                                  ? "text-black stdSelectField w-full md:w-1/2"
                                  : "text-gray-400 w-full md:w-1/2 stdSelectField"
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
                                <option
                                  key={index}
                                  value={role}
                                  className="text-black"
                                >
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

                    <div className="flex justify-center gap-6 mt-4">
                      <button
                        className="formButtons w-1/2 md:w-2/5"
                        onClick={(e) => {
                          handleSubmit("approved");
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="formButtons w-1/2 md:w-2/5 bg-red-500 hover:bg-red-700"
                        onClick={(e) => {
                          handleSubmit("rejected");
                        }}
                      >
                        Reject
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="inputLabel">
                        Remarks{" "}
                        {rejected && <span className="text-red-500">*</span>}
                      </div>

                      <textarea
                        className="ps-2 w-full font-normal border border-gray-300 rounded-md p-2"
                        rows={3}
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