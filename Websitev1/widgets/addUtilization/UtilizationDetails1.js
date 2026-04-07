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
// import logoimgfull from "../../public/images/specific/logo.webp";

// import validator from "validator";

// import { FaIndianRupeeSign } from "react-icons/fa6";
// import { MdOutlineDateRange, MdOutlineEdit } from "react-icons/md";
// import { CiViewList } from "react-icons/ci";
// import Swal from "sweetalert2";
// import { Tooltip } from "flowbite-react";
// import { FaFileDownload, FaRegFileAlt, FaSpinner } from "react-icons/fa";

// import { usePathname } from "next/navigation";
// import ls from "localstorage-slim";
// import { ImListNumbered } from "react-icons/im";
// import { LiaRupeeSignSolid } from "react-icons/lia";

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
//   const [unAuthorizedApprovers, setUnAuthorizedApprovers] = useState([
//     "admin",
//     "ho-person",
//     "account-person",
//   ]);
//   const [pdfMode, setPDFMode] = useState(false);
//   const [approvalAuthName, setApprovalAuthName] = useState("");
//   const [approvalAuthRole, setApprovalAuthRole] = useState("");
//   const [financeAuthName, setFinanceAuthName] = useState("");
//   const [financeAuthRole, setFinanceAuthRole] = useState("");
//   const [financeAuthEmail, setFinanceAuthEmail] = useState("");
//   const [financeAuthMobile, setFinanceAuthMobile] = useState("");
//   const [accountPersonName, setAccountPersonName] = useState("");
//   const [accountPersonEmail, setAccountPersonEmail] = useState("");
//   const [accountPersonMobile, setAccountPersonMobile] = useState("");
//   const [UTRNumber, setUTRNumber] = useState("");
//   const [paymentDate, setPaymentDate] = useState("");
//   const [paymentStatus, setPaymentStatus] = useState("pending");
//   const [roles, setRoles] = useState([]);
//   const [utilizationData, setUtilizationData] = useState([]);
//   const [utilizationAttachments, setUtilizationAttachments] = useState([]);
//   const [approvalAuthoritiesUpdated, setApprovalAuthoritiesUpdated] =
//     useState(false);
//   const [financeAuthoritiesUpdated, setFinanceAuthoritiesUpdated] =
//     useState(false);
//   const [approved, setApproved] = useState(false);
//   const [rejected, setRejected] = useState(false);
//   const [approverLevelList, setApproverLevelList] = useState([]);
//   const [approverIndex, setApproverIndex] = useState("");
//   const [rejectedIndex, setRejectedIndex] = useState("");
//   const [approvalAuthorities, setApprovalAuthorities] = useState({});
//   const [approvalLevel, setApprovalLevel] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [loading2, setLoading2] = useState(true);
//   const [loading3, setLoading3] = useState(false);
//   const [loading4, setLoading4] = useState(false);
//   const [remarks, setRemarks] = useState("");
//   const [error, setError] = useState({});
//   const [matchedRoles, setMatchedRoles] = useState([]);
//   const [selectedRole, setSelectedRole] = useState("");

//   const params = useParams();
//   const router = useRouter();
//   const contentRef = useRef();

//   useEffect(() => {
//     if (pathname.includes("admin")) {
//       setLoggedInRole("admin");
//       setCenter_id("all");
//     } else if (pathname.includes("center")) {
//       setLoggedInRole("center");
//       setCenter_id(userDetails.center_id);
//     } else if (pathname.includes("account")) {
//       setLoggedInRole("account");
//       setCenter_id("all");
//     } else {
//       setLoggedInRole("executive");
//       setCenter_id("all");
//       // console.log("userDetails.roles", userDetails.roles);

//       if (userDetails.roles.includes("senior-manager")) {
//         // const allCenter_idsBYSM = getCenterDetailsBySM(userDetails?.user_id)
//         // seniorManagerDetails.email
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (utilizationData?.approvalAuthourities) {
//       // Auto-select the first role if only one match is found
//       if (matchedRoles.length === 1) {
//         setSelectedRole(matchedRoles[0]);
//         setApprovalAuthRole(matchedRoles[0]);
//       }
//     }
//   }, [roles, utilizationData]);

//   useEffect(() => {
//     getUtilizationData();
//   }, [status, approvalAuthoritiesUpdated, financeAuthoritiesUpdated]);

//   // console.log("pdfmode", pdfMode);

//   const getUtilizationData = () => {
//     axios
//       .get("/api/utilization-details/get/one/" + params._id)
//       .then((response) => {
//         var utilizationData = response.data[0];
//         // console.log("response", response);
//         if (utilizationData?.approvalAuthourities) {
//           setApprovalAuthoritiesUpdated(true);
//         }
//         setUtilizationData(utilizationData);
//         // const combinedAttachmentData = utilizationData?.documentName?.map(
//         //   (name, index) => {
//         //     return {
//         //       name: name,
//         //       url: utilizationData?.documentUrl[index],
//         //     };
//         //   }
//         // );

//         // console.log(
//         //   "response?.data[0]?.paymentDetails?.UTRNumber",
//         //   response?.data[0]?.paymentDetails?.UTRNumber
//         // );

//         // console.log(
//         //   "response?.data[0]?.paymentDetails?.paymentDate",
//         //   response?.data[0]?.paymentDetails?.paymentDate
//         // );

//         setUTRNumber(response?.data[0]?.paymentDetails?.UTRNumber);
//         setPaymentDate(response?.data[0]?.paymentDetails?.paymentDate);

//         const combinedAttachmentData = [
//           {
//             type: "voucher",
//             documentUrl: utilizationData?.voucherDocumentUrl,
//             documentName: utilizationData?.voucherDocumentName,
//           },
//           {
//             type: "convergence",
//             documentUrl: utilizationData?.convergenceDocumentUrl,
//             documentName: utilizationData?.S3ConvergenceDocumentName,
//           },
//         ];

//         // const combinedAttachmentData = {
//         //   vouchername: name,
//         //   voucher: utilizationData?.documentUrl[index],
//         // };

//         setUtilizationAttachments(combinedAttachmentData);

//         if (userDetails) {
//           const user_id = userDetails?.user_id;
//           const parseAuthName =
//             userDetails.firstName + " " + userDetails.lastName;
//           const parseAuthRole = userDetails.roles;
//           const parseAuthEmail = userDetails.email;
//           const parseAuthMobile = userDetails.mobile;
//           // console.log("parseAuthRole",parseAuthRole)

//           setUser_id(user_id);
//           setApprovalAuthName(parseAuthName);
//           setRoles(parseAuthRole);
//           // console.log(
//           //   "utilizationData?.approvalAuthourities-------------------------------------",
//           //   utilizationData?.approvalAuthourities
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
//           // console.log(
//           //   "approvalAuthRole-------------------------------------",
//           //   approvalAuthRole
//           // );

//           if (userDetails.roles.includes("ho-person")) {
//             setFinanceAuthName(parseAuthName);
//             setFinanceAuthRole(userDetails.roles);
//             setFinanceAuthEmail(userDetails.email);
//             setFinanceAuthMobile(userDetails.mobile);
//           } else if (userDetails.roles.includes("account-person")) {
//             setFinanceAuthRole(userDetails.roles);
//           }
//           // console.log("authRole-------------------------------------",authRole)
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
//       utilizationData?.approvalAuthourities
//         ?.filter((auth) => auth.approvalAuthName === approvalAuthName)
//         .map((auth) => auth.approvalAuthRole) || [];
//     // console.log("authorities", authorities);
//     return roles.filter((role) => authorities.includes(role)); // Returns all matching roles
//   };

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
//     // event.preventDefault();

//     if (approvalAuthRole) {
//       const authorities = utilizationData?.approvalAuthourities || [];
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
//           .patch("/api/utilization-details/patch/status", formValues)
//           .then((response) => {
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
//             getUtilizationData();
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

//   const paymentValidation = () => {
//     let inputIsValid = true;
//     let errorMsg = {};
//     // console.log("2 status => ", st);

//     if (validator.isEmpty(UTRNumber)) {
//       // console.log("3 status => ", st);
//       inputIsValid = false;
//       errorMsg.UTRNumberError = "This field is required.";
//       setError(errorMsg);
//     }

//     if (validator.isEmpty(paymentDate)) {
//       // console.log("3 status => ", st);
//       inputIsValid = false;
//       errorMsg.paymentDateError = "This field is required.";
//       setError(errorMsg);
//     }

//     if (validator.isEmpty(paymentStatus)) {
//       // console.log("3 status => ", st);
//       inputIsValid = false;
//       errorMsg.paymentStatusError = "This field is required.";
//       setError(errorMsg);
//     }

//     return inputIsValid;
//   };

//   const handlePaymentDetailsSubmit = (e) => {
//     e.preventDefault();

//     let formValues = {
//       UTRNumber: UTRNumber,
//       paymentDate: paymentDate,
//       updatedByName: accountPersonName ? accountPersonName : financeAuthName,
//       updatedByRole: financeAuthRole[0],
//       updatedBy: user_id,
//     };

//     if (paymentValidation()) {
//       formValues.ID = params._id;
//       axios
//         .patch("/api/utilization-details/patch/payment-status", formValues)
//         .then((response) => {
//           // console.log("response", response);
//           if (response.data.success) {
//             Swal.fire("", "Payment Status Updated Successfully").then(() => {
//               router.push(
//                 `/${loggedInRole}/utilization-management/utilization-list`
//               );
//               setUTRNumber("");
//               setPaymentDate("");
//             });
//           } else {
//             Swal.fire("", response.data.message);
//           }

//           getUtilizationData();
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   };

//   const isUserAuthourised = (approvalAuthName, approvalAuthRole) => {
//     // console.log(
//     //   "approvalAuthName, approvalAuthRole",
//     //   approvalAuthName,
//     //   approvalAuthRole
//     // );

//     // Collect indexes where the user is authorized.
//     let authorizedIndexes = [];
//     utilizationData?.approvalAuthourities?.forEach((authority, index) => {
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
//       const authorities = utilizationData.approvalAuthourities;

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
//             // console.log("showActionButtons 1", showActionButtons);
//             break;
//           }
//         } else {
//           // --- CASE 2: Subsequent levels (index > 0) ---
//           // If current is pending, previous must be approved.
//           if (currentStatus === "pending") {
//             if (prevStatus === "pending") {
//               // console.log("prevStatus 6", prevStatus);
//               showActionButtons = false;
//               // console.log("showActionButtons 6", showActionButtons);
//               continue;
//             } else if (prevStatus === "approved" || prevStatus === "rejected") {
//               showActionButtons = true;
//               // console.log("showActionButtons 2", showActionButtons);
//               break;
//             } else if (nextStatus !== "approved" && nextStatus !== "rejected") {
//               showActionButtons = true;
//               // console.log("showActionButtons 2", showActionButtons);
//               break;
//             } else if (
//               authorizedIndexes.length === 0 &&
//               prevStatus === "pending"
//             ) {
//               showActionButtons = false;
//               // console.log("showActionButtons 4", showActionButtons);
//               break;
//             } else if (
//               currentStatus === "pending" &&
//               prevStatus === "pending"
//             ) {
//               showActionButtons = false;
//               // console.log("showActionButtons 5", showActionButtons);
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
//           // console.log("showActionButtons 3", showActionButtons);
//           break;
//         }
//       }
//       // Return our result based on whether any authorized index qualifies.
//       return showActionButtons ? { showActionButtons: true } : true;
//     }

//     return false;
//   };

//   const isUserAuthourised1 = (approvalAuthName, approvalAuthRole) => {
//     let authorizedIndex = -1; // Default value if no match is found
//     utilizationData?.approvalAuthourities?.some((authority, index) => {
//       // console.log(
//       //   "isUserAuthourised===========================",
//       //   authority.approvalAuthName,
//       //   approvalAuthName,
//       //   approvalAuthRole,
//       //   authority.approvalAuthRole
//       // );
//       // console.log(
//       //   "isUserAuthourised===========================",
//       //   authority.approvalAuthName === approvalAuthName,
//       //   approvalAuthRole === authority.approvalAuthRole
//       // );
//       if (
//         authority.approvalAuthName === approvalAuthName &&
//         approvalAuthRole === authority.approvalAuthRole
//       ) {
//         authorizedIndex = index; // Capture the index of the matching authority
//         // console.log(
//         //   "Authorized at index:",
//         //   index,
//         //   "with level:",
//         //   authority.approvalLevel
//         // );
//         return true; // Stop iteration when a match is found
//       }
//       return false;
//     });

//     if (authorizedIndex !== -1) {
//       //   authorizedIndex,
//       //   utilizationData.approvalAuthourities[authorizedIndex].approvalLevel

//       if (authorizedIndex === 0) {
//         if (
//           utilizationData.approvalAuthourities[authorizedIndex + 1]?.status !==
//             "approved" &&
//           utilizationData.approvalAuthourities[authorizedIndex + 1]?.status !==
//             "rejected"
//         ) {
//           return {
//             showActionButtons: true,
//           };
//         } else {
//           return true;
//         }
//       } else if (
//         utilizationData.approvalAuthourities[authorizedIndex - 1]?.status ===
//         "approved"
//       ) {
//         if (
//           utilizationData.approvalAuthourities[authorizedIndex + 1]?.status !==
//             "approved" &&
//           utilizationData.approvalAuthourities[authorizedIndex + 1]?.status !==
//             "rejected"
//         ) {
//           return {
//             showActionButtons: true,
//           };
//         } else {
//           return true;
//         }
//       } else {
//         return false; // If any previous level is not approved, return false
//       }
//     } else {
//       return false; // If any previous level is not approved, return false
//     }
//   };

//   useEffect(() => {
//     if (user_id && utilizationData?.center_id) {
//       isAccountPersonAuthorized();
//     }
//   }, [user_id, utilizationData?.center_id]);

//   const isAccountPersonAuthorized = async () => {
//     // console.log("utilizationData?.center_id", utilizationData?.center_id);
//     // console.log("user_id", user_id);
//     if (!utilizationData?.center_id || !user_id) return;

//     try {
//       const response = await axios.post(
//         "/api/utilization-details/get/account-person",
//         {
//           center_id: utilizationData?.center_id,
//           // user_id: user_id,
//         }
//       );

//       // console.log("response account person", response);

//       const { financeAuth } = response.data;
//       setAccountPersonName(financeAuth?.financeAuthName || "");
//       setAccountPersonEmail(financeAuth?.financeAuthEmail || "");
//       setAccountPersonMobile(financeAuth?.financeAuthMobile || "");
//     } catch (error) {
//       console.error("Account Person not Assigned", error);
//       setAccountPersonName(""); // This will ensure blank space if unauthorized
//     }
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
//       element.style.marginTop = "50px";
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
//       margin: 0,
//       filename: "utilization-approval-details.pdf",
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

//   const imageExtensions = [
//     "jpg",
//     "jpeg",
//     "png",
//     "webp",
//     "gif",
//     "psd",
//     "tiff",
//     "jfif",
//   ];
//   const excelExtensions = ["xls", "xlsx"];

//   const renderDocumentList = (type) => {
//     return utilizationAttachments
//       .filter((doc) => doc.type === type && doc.documentName && doc.documentUrl)
//       .map((document, index) => {
//         const fileExt = document?.documentName?.split(".").pop()?.toLowerCase();
//         let previewDiv;

//         if (imageExtensions.includes(fileExt)) {
//           previewDiv = (
//             <img src={document?.documentUrl} className="h-14 w-14" />
//           );
//         } else if (excelExtensions.includes(fileExt)) {
//           previewDiv = (
//             <img
//               src="/images/generic/Excel-download-icon.png"
//               className="h-14 w-14"
//             />
//           );
//         } else if (fileExt === "pdf") {
//           previewDiv = (
//             <img
//               src="/images/generic/pdf-file-icon.png"
//               className="h-10 w-10"
//             />
//           );
//         } else {
//           previewDiv = <FaRegFileAlt className="text-xs text-green" />;
//         }

//         return (
//           <div key={index} className="flex gap-3 mt-2">
//             <Tooltip
//               content="Download file"
//               className="bg-green"
//               placement="bottom"
//               arrow={false}
//             >
//               <div className="text-center border border-dashed border-gray-400 px-1.5 py-2 rounded-md relative">
//                 <div className="flex justify-center">
//                   <a
//                     target="_blank" href={document?.documentUrl}
//                     className="hover:scale-110 min-h-14"
//                     download
//                   >
//                     {previewDiv}
//                   </a>
//                 </div>
//                 <div className="flex gap-2">
//                   <a
//                     target="_blank" href={document?.documentUrl}
//                     className="hover:underline font-medium"
//                     download
//                   >
//                     {document?.documentName}
//                   </a>
//                 </div>
//               </div>
//             </Tooltip>
//           </div>
//         );
//       });
//   };

//   return (
//     <section className="section">
//       <div className="box border-2 rounded-md shadow-md" id="pdf-content">
//         <div className="uppercase text-xl font-semibold">
//           <div className="flex justify-end items-center">
//             {/* <h1 className="heading text-center capitalize text-nowrap text-2xl">
//               Lupin Human Welfare & Research Foundation
//             </h1>
//             <Image
//               src={logoimgfull}
//               alt="Full Logo Image"
//               className={`w-full max-w-[120px] h-auto object-contain mx-auto`}
//             /> */}

//             <div className="flex gap-3 my-5 me-10 hide-in-pdf">
//               <Tooltip
//                 content="Download as PDF"
//                 placement="bottom"
//                 className="bg-green"
//                 arrow={false}
//               >
//                 {loading4 ? (
//                   <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                 ) : (
//                   <FaFileDownload
//                     className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                     onClick={() => {
//                       downloadPDF();
//                     }}
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
//                   {loading3 ? (
//                     <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                   ) : (
//                     <MdOutlineEdit
//                       className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                       // onClick={() => {
//                       //   setLoading3(true);
//                       //   router.push(
//                       //     `/${loggedInRole}/utilization-management/utilization-submission/${params._id}`
//                       //   );
//                       //   setUpdate(true);
//                       // }}
//                       onClick={() => {
//                         // setLoading3(true);
//                         window.open(
//                           `/${loggedInRole}/utilization-management/utilization-submission/${params._id}`,
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
//                 content="Utilization List"
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
//                     //       "/utilization-management/utilization-list"
//                     //   );
//                     // }}
//                     onClick={() => {
//                       window.open(
//                         `/${loggedInRole}/utilization-management/utilization-list`,
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
//         <div className="border-b-2 border-gray-300 flex justify-between items-center">
//             <h2 className="heading text-center capitalize text-nowrap text-2xl">
//               Lupin Human Welfare & Research Foundation
//             </h2>
//             {/* <Image
//               src={logoimgfull}
//               alt="Full Logo Image"
//               className={`w-full max-w-[120px] h-auto object-contain mx-auto`}
//             /> */}
          
//             <img
//               id="pdf-logo"
//               src="/images/specific/logo.webp"
//               alt="Full Logo"
//               className={`w-full max-w-[120px] h-auto object-contain mx-auto`}
//             />


//         </div>

//         <div className="px-10 py-6">
//           <div className="bg-white text-secondary">
//             <div className="">
//               <div className="flex-1 flex justify-center">
//                 {/* <div className="relative font-bold p-2 text-leftBlack underline underline-offset-8 text-xl"> */}
//                 <div className="relative font-bold p-2 text-leftBlack text-xl">
//                   Utilization (Expenditure) Statement
//                 </div>
//               </div>
//               <div className="flex-1 flex justify-end mt-3">
//                 <label htmlFor="centerName" className="inputLabel font-bold">
//                   Center Name -&nbsp;
//                 </label>
//                 <div className="relative text-base font-bold text-leftBlack">
//                   {utilizationData?.centerName ? (
//                     utilizationData?.centerName
//                   ) : loading2 ? (
//                     <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                   ) : (
//                     "NA"
//                   )}
//                 </div>
//               </div>

//               <table className="w-full mt-5 table-auto border-collapse">
//                 <thead className="text-[15px] font-bold text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <th className="p-2 border border-leftBlack">
//                       Approval Number
//                     </th>
//                     <th className="p-2 border border-leftBlack">
//                       Approval Date
//                     </th>
//                     <th className="p-2 border border-leftBlack">
//                       Voucher Number
//                     </th>
//                     <th className="p-2 border border-leftBlack">
//                       Voucher Date
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-[15px] font-medium text-center text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.approvalNo ? (
//                         utilizationData?.approvalNo
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.approvalDate ? (
//                         moment(utilizationData?.approvalDate).format(
//                           "DD-MM-YYYY"
//                         )
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>

//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.voucherNumber ? (
//                         utilizationData?.voucherNumber
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.voucherDate ? (
//                         moment(utilizationData?.voucherDate).format(
//                           "DD-MM-YYYY"
//                         )
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>

//               <table className="w-full mt-5 table-auto border-collapse">
//                 <thead className="text-[15px] font-bold text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <th className="p-2 border border-leftBlack">Program</th>
//                     <th className="p-2 border border-leftBlack">Project</th>
//                     <th className="p-2 border border-leftBlack">Activity</th>
//                     <th className="p-2 border border-leftBlack">
//                       Sub-activity
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-[15px] font-medium text-center text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.program ? (
//                         utilizationData?.program
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.project ? (
//                         utilizationData?.project
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>

//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.activityName ? (
//                         utilizationData?.activityName
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.subactivityName ? (
//                         utilizationData?.subactivityName
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>

//               <table className="w-full mt-5 table-auto border-collapse">
//                 <thead className="text-[15px] font-bold text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <th className="p-2 border border-leftBlack">Quantity</th>
//                     <th className="p-2 border border-leftBlack">Unit</th>
//                     <th className="p-2 border border-leftBlack">Unit Cost</th>
//                     <th className="p-2 border border-leftBlack">
//                       Impacted Households
//                     </th>
//                     <th className="p-2 border border-leftBlack">
//                       Reach (Beneficiaries)
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-[15px] font-medium text-center text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.quantity ? (
//                         formatNumberToCommas(utilizationData?.quantity)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.unit ? (
//                         utilizationData?.unit
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>

//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.unitCost ? (
//                         formatToINR(utilizationData?.unitCost)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.noOfHouseholds ? (
//                         formatNumberToCommas(utilizationData?.noOfHouseholds)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.noOfBeneficiaries ? (
//                         formatNumberToCommas(utilizationData?.noOfBeneficiaries)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>

//               <table className="w-full mt-5 table-auto border-collapse">
//                 <thead className="text-[15px] font-bold text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <th className="p-2 border border-leftBlack">Total Cost</th>
//                     <th className="p-2 border border-leftBlack">
//                       External Grant
//                     </th>
//                     <th className="p-2 border border-leftBlack">CC</th>
//                     <th className="p-2 border border-leftBlack">LHWRF</th>
//                     <th className="p-2 border border-leftBlack">Convergence</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-[15px] font-medium text-center text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.totalCost ? (
//                         formatToINR(utilizationData?.totalCost)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.sourceofFund?.grant ? (
//                         formatToINR(utilizationData?.sourceofFund?.grant)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.sourceofFund?.CC ? (
//                         formatToINR(utilizationData?.sourceofFund?.CC)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>

//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.sourceofFund?.LHWRF ? (
//                         formatToINR(utilizationData?.sourceofFund?.LHWRF)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.convergence ? (
//                         formatToINR(utilizationData?.convergence)
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>

//               <table className="w-full mt-5 table-auto border-collapse">
//                 <thead className="text-[15px] font-bold text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <th className="p-2 border border-leftBlack">
//                       Convergence Agency Name
//                     </th>
//                     <th className="p-2 border border-leftBlack">
//                       Convergence Document
//                     </th>
//                     <th className="p-2 border border-leftBlack">Status</th>
//                     <th className="p-2 border border-leftBlack">Remarks</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-[15px] font-medium text-center text-leftBlack">
//                   <tr className="border border-leftBlack">
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.convergenceAgencyName ? (
//                         utilizationData?.convergenceAgencyName
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.convergenceDocumentName ? (
//                         utilizationData?.convergenceDocumentName
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         0
//                       )}
//                     </td>
//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.activityStatus ? (
//                         utilizationData?.activityStatus
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>

//                     <td className="p-2 border border-leftBlack">
//                       {utilizationData?.convergenceNote ? (
//                         utilizationData?.convergenceNote
//                       ) : loading2 ? (
//                         <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                       ) : (
//                         "NA"
//                       )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>

//               {utilizationData?.approvalAuthourities?.length > 0 ? (
//                 <table className="w-full mt-10 mb-10 table-fixed border-collapse hidden show-in-pdf text-sm">
//                   <thead className="font-bold text-leftBlack">
//                     <tr className="border border-leftBlack">
//                       {utilizationData.approvalAuthourities.map((_, i) => (
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
//                       {utilizationData.approvalAuthourities.map(
//                         (authority, i) => (
//                           <td
//                             key={i}
//                             className="p-2 border border-leftBlack align-top"
//                             style={{ width: "25%" }}
//                           >
//                             <div className="flex flex-col items-center justify-center">
//                               {/* <Image
//                                   src={
//                                     authority.status === "approved"
//                                       ? approvedStamp
//                                       : authority.status === "rejected"
//                                       ? rejectedStamp
//                                       : pendingStamp
//                                   }
//                                   alt={authority.status}
//                                   className="w-full max-w-[100px] h-auto object-contain mx-auto"
//                                 /> */}
//                               <div
//                                 className={`mb-2 text-2xl font-bold capitalize ${
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
//                                 {moment(authority.updatedAt).format(
//                                   "DD/MM/yyyy"
//                                 )}
//                                 <br />
//                                 {moment(authority.updatedAt).format("hh:mm a")}
//                               </div>
//                               <div className="mt-3 text-xs text-center">
//                                 <b>{authority.approvalAuthName}</b> <br />
//                                 <div className="font-semibold">
//                                   {authority.approvalAuthRole}
//                                 </div>
//                                 <div className="font-semibold">
//                                   {authority.approvalAuthEmail}
//                                 </div>
//                                 <div className="font-semibold">
//                                   {authority.approvalAuthMobile}
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

//               {accountPersonEmail === userDetails?.email ||
//               userDetails?.roles[0] === "ho-person" ? (
//                 <table className="w-full mt-20 mb-5 table-auto border-collapse hidden show-in-pdf">
//                   <thead className="text-[15px] font-bold text-leftBlack">
//                     <tr className="border border-leftBlack">
//                       <th className="p-2 border border-leftBlack">
//                         Financial Authority
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="text-[15px] font-medium text-center text-leftBlack">
//                     <tr className="border border-leftBlack">
//                       <td className="p-2 border border-leftBlack">
//                         <>
//                           {userDetails?.roles[0] === "account-person" &&
//                           accountPersonName ? (
//                             <div className="py-6 border bg-lightBlue">
//                               <div className="ps-2 pe-4">
//                                 <b>{accountPersonName}</b> <br />
//                                 <div className="inputLabel font-semibold">
//                                   {financeAuthRole}
//                                 </div>
//                                 <div className="inputLabel font-semibold">
//                                   {accountPersonEmail}
//                                 </div>
//                                 <div className="inputLabel font-semibold">
//                                   {accountPersonMobile}
//                                 </div>
//                               </div>
//                             </div>
//                           ) : userDetails.roles[0] === "ho-person" ? (
//                             <div className="py-6 bg-lightBlue">
//                               <td className="ps-2 pe-4">
//                                 <b>{financeAuthName}</b> <br />
//                                 <div className="inputLabel font-semibold">
//                                   {financeAuthRole}
//                                 </div>
//                                 <div className="inputLabel font-semibold">
//                                   {financeAuthEmail}
//                                 </div>
//                                 <div className="inputLabel font-semibold">
//                                   {financeAuthMobile}
//                                 </div>
//                               </td>
//                             </div>
//                           ) : (
//                             ""
//                           )}
//                           {userDetails?.roles[0] === "ho-person" ||
//                           loggedInRole === "account" ? (
//                             <div className="">
//                               {utilizationData?.paymentDetails
//                                 ?.paymentStatus === "payment-released" &&
//                               utilizationData?.paymentDetails?.UTRNumber &&
//                               utilizationData?.paymentDetails?.paymentDate ? (
//                                 <div className="">
//                                   <div
//                                     colSpan={3}
//                                     className="text-left capitalize rounded-xl text-black text-sm"
//                                   >
//                                     <div className="p-2 font-bold">
//                                       <span>
//                                         {" "}
//                                         UTR Number :-&nbsp;
//                                         <span className="font-medium">
//                                           {
//                                             utilizationData?.paymentDetails
//                                               ?.UTRNumber
//                                           }
//                                         </span>
//                                       </span>
//                                     </div>
//                                     <div className="p-2 font-bold">
//                                       <span>
//                                         Payment Date :-&nbsp;
//                                         <span className="font-medium">
//                                           {
//                                             utilizationData?.paymentDetails
//                                               ?.paymentDate
//                                           }
//                                         </span>
//                                       </span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ) : (
//                                 ""
//                               )}
//                               {utilizationData?.paymentDetails
//                                 ?.paymentStatus === "payment-released" &&
//                               utilizationData?.paymentDetails?.updatedByRole ? (
//                                 <tr className="">
//                                   <td
//                                     colSpan={3}
//                                     className="text-center p-2 capitalize rounded-xl font-bold text-nowrap text-Green text-sm"
//                                   >
//                                     <span className="">
//                                       {
//                                         utilizationData?.paymentDetails
//                                           ?.paymentStatus
//                                       }
//                                       &nbsp;By&nbsp;
//                                       {
//                                         utilizationData?.paymentDetails
//                                           ?.updatedByRole
//                                       }
//                                     </span>
//                                   </td>
//                                 </tr>
//                               ) : (
//                                 ""
//                               )}
//                             </div>
//                           ) : (
//                             ""
//                           )}
//                         </>
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               ) : (
//                 ""
//               )}

//               <div className="mt-5 mb-6 flex lg:flex-row md:flex-row flex-col hide-in-pdf">
//                 <div className="flex-1 lg:me-4 w-1/2">
//                   <label htmlFor="totalCost" className="inputLabel">
//                     Voucher Attachment
//                   </label>
//                   <div
//                     className={`relative font-normal ${
//                       utilizationAttachments?.length > 4
//                         ? "grid grid-cols-4"
//                         : "flex"
//                     } gap-4 text-[15px]`}
//                   >
//                     {renderDocumentList("voucher").length > 0 ? (
//                       renderDocumentList("voucher")
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       <div className="relative mt-2 font-medium">
//                         No data found
//                       </div>
//                     )}
//                     {/* {utilizationAttachments &&
//                                  utilizationAttachments?.length > 0 ? (
//                                    utilizationAttachments?.map((document, index) => {
//                                      const imageExt =
//                                        "jpg" ||
//                                        "jpeg" ||
//                                        "png" ||
//                                        "webp" ||
//                                        "gif" ||
//                                        "psd" ||
//                                        "tiff" ||
//                                        "jfif";
             
//                                      let previewDiv = "";
             
//                                      if (
//                                        document?.name.split(".").pop() === "png" ||
//                                        document?.name.split(".").pop() === "jpg" ||
//                                        document?.name.split(".").pop() === "jpeg" ||
//                                        document?.name.split(".").pop() === "jfif" ||
//                                        document?.name.split(".").pop() === "webp" ||
//                                        document?.name.split(".").pop() === "psd" ||
//                                        document?.name.split(".").pop() === "tiff" ||
//                                        document?.name.split(".").pop() === "jfif" ||
//                                        document?.name.split(".").pop() === "gif"
//                                      ) {
//                                        previewDiv = (
//                                          <img
//                                            src={document?.url}
//                                            className="text-2xl h-14 w-14 content-center z-[1]"
//                                          />
//                                        );
//                                      } else if (
//                                        document?.name.split(".").pop() === "xls" ||
//                                        document?.name.split(".").pop() === "xlsx"
//                                      ) {
//                                        previewDiv = (
//                                          <img
//                                            src="/images/generic/Excel-download-icon.png"
//                                            className="text-2xl h-14 w-14 content-center"
//                                          />
//                                        );
//                                      } else if (document?.name.split(".").pop() === "pdf") {
//                                        previewDiv = (
//                                          <img
//                                            src="/images/generic/pdf-file-icon.png"
//                                            className="text-2xl h-10 w-10 content-center"
//                                          />
//                                        );
//                                      } else {
//                                        previewDiv = (
//                                          <FaRegFileAlt className="text-xs text-green content-center z-[1]" />
//                                        );
//                                      }
             
//                                      return (
//                                        <div
//                                          className={`flex col-span-1 gap-3 ${
//                                            document.name !== "" ||
//                                            utilizationAttachments?.length > 0
//                                              ? "mt-2"
//                                              : "mt-0"
//                                          }`}
//                                        >
//                                          {document?.name !== "" && document?.name !== "" ? (
//                                            <div>{++index}.</div>
//                                          ) : (
//                                            ""
//                                          )}
//                                          {document?.name !== "" && document?.url !== "" ? (
//                                            <Tooltip
//                                              content="Download file"
//                                              className="bg-green"
//                                              placement="bottom"
//                                              arrow={false}
//                                            >
//                                              <div className="text-center w-full border border-dashed border-gray-400 px-1.5 py-2 rounded-md relative">
//                                                <div className="flex justify-center">
//                                                  <a
//                                                    target="_blank" href={
//                                                      document?.url !== "" && document?.url
//                                                    }
//                                                    className="hover:scale-110 min-h-14 content-center"
//                                                    download
//                                                  >
//                                                    {previewDiv}
//                                                  </a>
//                                                </div>
//                                                <div className="flex gap-2">
//                                                  <a
//                                                    target="_blank" href={
//                                                      document?.url !== "" && document?.url
//                                                    }
//                                                    className="hover:underline underline hover:font-medium"
//                                                    download
//                                                  >
//                                                    {document?.name !== "" && document?.name}
//                                                  </a>
//                                                </div>
//                                              </div>
//                                            </Tooltip>
//                                          ) : (
//                                            "No data found"
//                                          )}
//                                        </div>
//                                      );
//                                    })
//                                  ) : loading2 ? (
//                                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                                  ) : (
//                                    <div className="relative mt-2 font-medium">
//                                      No data found
//                                    </div>
//                                  )} */}
//                   </div>
//                 </div>
//                 <div className="flex-1 lg:me-4 w-1/2">
//                   <label htmlFor="totalCost" className="inputLabel">
//                     Convergence Attachment
//                   </label>
//                   <div
//                     className={
//                       `relative font-normal flex
//                                    gap-4 text-[15px]`
//                       //   ${
//                       //   utilizationAttachments?.length > 4
//                       //     ? "grid grid-cols-4"
//                       //     : "flex"
//                       // }
//                     }
//                   >
//                     {renderDocumentList("convergence").length > 0 ? (
//                       renderDocumentList("convergence")
//                     ) : loading2 ? (
//                       <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                     ) : (
//                       <div className="relative mt-2 font-medium">
//                         No data found
//                       </div>
//                     )}
//                     {/* {utilizationAttachments &&
//                                  utilizationAttachments?.length > 0 ? (
//                                    utilizationAttachments?.map((document, index) => {
//                                      const imageExt =
//                                        "jpg" ||
//                                        "jpeg" ||
//                                        "png" ||
//                                        "webp" ||
//                                        "gif" ||
//                                        "psd" ||
//                                        "tiff" ||
//                                        "jfif";
             
//                                      let previewDiv = "";
             
//                                      if (
//                                        document?.name.split(".").pop() === "png" ||
//                                        document?.name.split(".").pop() === "jpg" ||
//                                        document?.name.split(".").pop() === "jpeg" ||
//                                        document?.name.split(".").pop() === "jfif" ||
//                                        document?.name.split(".").pop() === "webp" ||
//                                        document?.name.split(".").pop() === "psd" ||
//                                        document?.name.split(".").pop() === "tiff" ||
//                                        document?.name.split(".").pop() === "jfif" ||
//                                        document?.name.split(".").pop() === "gif"
//                                      ) {
//                                        previewDiv = (
//                                          <img
//                                            src={document?.url}
//                                            className="text-2xl h-14 w-14 content-center z-[1]"
//                                          />
//                                        );
//                                      } else if (
//                                        document?.name.split(".").pop() === "xls" ||
//                                        document?.name.split(".").pop() === "xlsx"
//                                      ) {
//                                        previewDiv = (
//                                          <img
//                                            src="/images/generic/Excel-download-icon.png"
//                                            className="text-2xl h-14 w-14 content-center"
//                                          />
//                                        );
//                                      } else if (document?.name.split(".").pop() === "pdf") {
//                                        previewDiv = (
//                                          <img
//                                            src="/images/generic/pdf-file-icon.png"
//                                            className="text-2xl h-10 w-10 content-center"
//                                          />
//                                        );
//                                      } else {
//                                        previewDiv = (
//                                          <FaRegFileAlt className="text-xs text-green content-center z-[1]" />
//                                        );
//                                      }
             
//                                      return (
//                                        <div
//                                          className={`flex col-span-1 gap-3 ${
//                                            document.name !== "" ||
//                                            utilizationAttachments?.length > 0
//                                              ? "mt-2"
//                                              : "mt-0"
//                                          }`}
//                                        >
//                                          {document?.name !== "" && document?.name !== "" ? (
//                                            <div>{++index}.</div>
//                                          ) : (
//                                            ""
//                                          )}
//                                          {document?.name !== "" && document?.url !== "" ? (
//                                            <Tooltip
//                                              content="Download file"
//                                              className="bg-green"
//                                              placement="bottom"
//                                              arrow={false}
//                                            >
//                                              <div className="text-center w-full border border-dashed border-gray-400 px-1.5 py-2 rounded-md relative">
//                                                <div className="flex justify-center">
//                                                  <a
//                                                    target="_blank" href={
//                                                      document?.url !== "" && document?.url
//                                                    }
//                                                    className="hover:scale-110 min-h-14 content-center"
//                                                    download
//                                                  >
//                                                    {previewDiv}
//                                                  </a>
//                                                </div>
//                                                <div className="flex gap-2">
//                                                  <a
//                                                    target="_blank" href={
//                                                      document?.url !== "" && document?.url
//                                                    }
//                                                    className="hover:underline underline hover:font-medium"
//                                                    download
//                                                  >
//                                                    {document?.name !== "" && document?.name}
//                                                  </a>
//                                                </div>
//                                              </div>
//                                            </Tooltip>
//                                          ) : (
//                                            "No data found"
//                                          )}
//                                        </div>
//                                      );
//                                    })
//                                  ) : loading2 ? (
//                                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
//                                  ) : (
//                                    <div className="relative mt-2 font-medium">
//                                      No data found
//                                    </div>
//                                  )} */}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* {console.log("isUserAuthourised(approvalAuthName, approvalAuthRole)",approvalAuthName,approvalAuthRole,isUserAuthourised(approvalAuthName, approvalAuthRole))} */}
//           {isUserAuthourised(approvalAuthName, approvalAuthRole) ||
//           unAuthorizedApprovers.includes(userDetails?.roles[0]) ? (
//             <div className="border-t-2">
//               <h3 className="subHeading font-bold mt-4 hide-in-pdf">
//                 Approval Authorities
//               </h3>

//               <div className="flex gap-10 justify-between mt-5 mb-6 w-full adjust-authorities">
//                 <div className="w-1/2 hide-in-pdf">
//                   <table className="table-auto border-separate border-spacing-y-4">
//                     <thead></thead>
//                     <tbody>
//                       {utilizationData?.approvalAuthourities?.map(
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
//                                     ? "border border-2 bg-lightBlue text-Green"
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

//                 {/* {console.log("userDetails.role", userDetails?.roles[0])}
//                 {console.log("loggedInRole", loggedInRole)} */}
//                 {isUserAuthourised(approvalAuthName, approvalAuthRole)
//                   ?.showActionButtons &&
//                 !unAuthorizedApprovers.includes(financeAuthRole[0]) ? (
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
//                             ${
//                               approvalAuthRole
//                                 ? "text-black stdSelectField w-1/2"
//                                 : "text-black w-1/2 stdSelectField"
//                             }
//                             `}
//                               value={selectedRole}
//                               onChange={(e) => {
//                                 setSelectedRole(e.target.value);
//                                 setApprovalAuthRole(e.target.value);
//                               }}
//                             >
//                               <option className="text-black" value="">
//                                 Select
//                               </option>
//                               {matchedRoles.map((role, index) => (
//                                 <option key={index} value={role}>
//                                   {role}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>
//                       ) : matchedRoles.length === 1 && approvalAuthRole ? (
//                         <p className="text-center mx-auto">
//                           Approve This Activity as{" "}
//                           <strong>{approvalAuthRole}</strong>
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
//                   ""
//                 )}

//                 {accountPersonEmail === userDetails?.email ||
//                 userDetails?.roles[0] === "ho-person" ? (
//                   <div className="w-1/2 -mt-10 hide-in-pdf">
//                     <h3 className="subHeading font-bold -mt-2 adjust-authorities-heading">
//                       Financial Authority
//                     </h3>

//                     <div className="adjust-financial-authorities">
//                       <table className="table-auto border-separate border-spacing-y-4 mt-6 adjust-financial-authorities-width">
//                         <thead></thead>
//                         <tbody>
//                           {/* {utilizationData?.financeAuthorities?.map( */}
//                           {/* (item, index) => { */}
//                           {/* // Check if user is authorized and previous levels are
//                       approved return ( */}
//                           <>
//                             {userDetails?.roles[0] === "account-person" &&
//                             accountPersonName ? (
//                               <tr className="py-6 border border-2 bg-lightBlue text-Green">
//                                 <td className="ps-2 pe-4 text-Green">
//                                   <b>{accountPersonName}</b> <br />
//                                   <div className="inputLabel font-semibold">
//                                     {financeAuthRole}
//                                   </div>
//                                   <div className="inputLabel font-semibold">
//                                     {accountPersonEmail}
//                                   </div>
//                                   <div className="inputLabel font-semibold">
//                                     {accountPersonMobile}
//                                   </div>
//                                 </td>
//                               </tr>
//                             ) : userDetails.roles[0] === "ho-person" ? (
//                               <tr className="py-6 border border-2 bg-lightBlue text-Green">
//                                 <td className="ps-2 pe-4 text-Green">
//                                   <b>{financeAuthName}</b> <br />
//                                   <div className="inputLabel font-semibold">
//                                     {financeAuthRole}
//                                   </div>
//                                   <div className="inputLabel font-semibold">
//                                     {financeAuthEmail}
//                                   </div>
//                                   <div className="inputLabel font-semibold">
//                                     {financeAuthMobile}
//                                   </div>
//                                 </td>
//                               </tr>
//                             ) : (
//                               ""
//                             )}
//                           </>
//                           {/* ); } // )} */}
//                         </tbody>
//                       </table>

//                       {userDetails?.roles[0] === "ho-person" ||
//                       loggedInRole === "account" ? (
//                         <div className="w-2/3 adjust-financial-authorities-width">
//                           <div className="w-full mt-4 lg:mt-0 hide-in-pdf">
//                             <label htmlFor="UTRNumber" className="inputLabel">
//                               UTR Number
//                             </label>
//                             <div className="relative mt-2 rounded-md shadow-sm">
//                               <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                   <ImListNumbered className="icon" />
//                                 </span>
//                               </div>
//                               <input
//                                 type="text"
//                                 name="UTRNumber"
//                                 id="UTRNumber"
//                                 className={
//                                   error.UTRNumberError
//                                     ? "stdInputField"
//                                     : "stdInputField"
//                                 }
//                                 placeholder="Enter UTR Number"
//                                 value={UTRNumber}
//                                 onChange={(e) => {
//                                   setUTRNumber(e.target.value);
//                                   setError((prevState) => ({
//                                     ...prevState,
//                                     UTRNumberError: "",
//                                   }));
//                                 }}
//                               />
//                               <div className="absolute inset-y-0 right-0 flex items-center"></div>
//                             </div>
//                             <div
//                               className="text-red-500"
//                               style={{ fontSize: "12px", fontWeight: "normal" }}
//                             >
//                               {/* {error.quantityError} */}
//                               {error.UTRNumberError && (
//                                 <span>{error.UTRNumberError}</span>
//                               )}
//                             </div>
//                           </div>
//                           <div className="w-full mt-4 hide-in-pdf ">
//                             <label htmlFor="paymentDate" className="inputLabel">
//                               Payment Date
//                             </label>
//                             <div className="relative mt-2 rounded-md shadow-sm">
//                               <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                   <MdOutlineDateRange className="icon" />
//                                 </span>
//                               </div>
//                               <input
//                                 type="date"
//                                 name="paymentDate"
//                                 id="paymentDate"
//                                 max={moment().format("YYYY-MM-DD")}
//                                 className={`
//                                   ${
//                                     error.paymentDateError
//                                       ? "stdSelectField"
//                                       : "stdSelectField"
//                                   }
//                                   ${
//                                     paymentDate ? "text-black" : "text-gray-400"
//                                   }
//                                 `}
//                                 value={paymentDate}
//                                 onChange={(e) => {
//                                   setPaymentDate(e.target.value);
//                                   setError((prevState) => ({
//                                     ...prevState,
//                                     paymentDateError: "",
//                                   }));
//                                 }}
//                               />
//                             </div>
//                             <div
//                               className="text-red-500"
//                               style={{ fontSize: "12px", fontWeight: "normal" }}
//                             >
//                               {error.paymentDateError}
//                             </div>
//                           </div>

//                           <div className="flex justify-end mb-6 mt-2 hide-in-pdf">
//                             <button
//                               type="submit"
//                               onClick={handlePaymentDetailsSubmit}
//                               disabled={
//                                 utilizationData?.paymentDetails
//                                   ?.paymentStatus === "payment-released"
//                               }
//                               className="formButtons disabled:bg-gray-400 disabled:cursor-not-allowed"
//                               style={{ transition: "background-color 0.3s" }}
//                             >
//                               {loading3 ? (
//                                 <span>
//                                   Submit
//                                   <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
//                                 </span>
//                               ) : (
//                                 <span>Submit</span>
//                               )}
//                             </button>
//                           </div>
//                           {utilizationData?.paymentDetails?.paymentStatus ===
//                             "payment-released" &&
//                           utilizationData?.paymentDetails?.UTRNumber &&
//                           utilizationData?.paymentDetails?.paymentDate ? (
//                             <tr className="py-6">
//                               <td
//                                 colSpan={3}
//                                 className="text-left capitalize rounded-xl text-black text-sm"
//                               >
//                                 <div className="p-2">
//                                   <span>
//                                     {" "}
//                                     UTR Number :-&nbsp;
//                                     <span className="font-medium">
//                                       {
//                                         utilizationData?.paymentDetails
//                                           ?.UTRNumber
//                                       }
//                                     </span>
//                                   </span>
//                                 </div>
//                                 <div className="p-2">
//                                   <span>
//                                     Payment Date :-&nbsp;
//                                     <span className="font-medium">
//                                       {
//                                         utilizationData?.paymentDetails
//                                           ?.paymentDate
//                                       }
//                                     </span>
//                                   </span>
//                                 </div>
//                               </td>
//                             </tr>
//                           ) : (
//                             ""
//                           )}
//                           {utilizationData?.paymentDetails?.paymentStatus ===
//                             "payment-released" &&
//                           utilizationData?.paymentDetails?.updatedByRole ? (
//                             <tr className="py-6">
//                               <td
//                                 colSpan={3}
//                                 className="text-center p-2 capitalize rounded-xl bg-green text-white text-sm"
//                               >
//                                 <span className="">
//                                   {
//                                     utilizationData?.paymentDetails
//                                       ?.paymentStatus
//                                   }
//                                   &nbsp;By&nbsp;
//                                   {
//                                     utilizationData?.paymentDetails
//                                       ?.updatedByRole
//                                   }
//                                 </span>
//                               </td>
//                             </tr>
//                           ) : (
//                             ""
//                           )}
//                         </div>
//                       ) : (
//                         ""
//                       )}
//                     </div>
//                   </div>
//                 ) : (
//                   ""
//                 )}
//               </div>
//             </div>
//           ) : null}

//           {/* {authorizedAccountPerson ||
//           userDetails?.roles[0] === "ho-person" ? (
       
//           ) : (
//             ""
//           )} */}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ApprovalDetails;













//Nehas code
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
import logoimgfull from "../../public/images/specific/logo.webp";

import validator from "validator";

import { FaIndianRupeeSign } from "react-icons/fa6";
import { MdOutlineDateRange, MdOutlineEdit } from "react-icons/md";
import { CiViewList } from "react-icons/ci";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import { FaFileDownload, FaRegFileAlt, FaSpinner } from "react-icons/fa";

import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
import { ImListNumbered } from "react-icons/im";
import { LiaRupeeSignSolid } from "react-icons/lia";

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
  const [unAuthorizedApprovers, setUnAuthorizedApprovers] = useState([
    "admin",
    "ho-person",
    "account-person",
  ]);
  const [pdfMode, setPDFMode] = useState(false);
  const [approvalAuthName, setApprovalAuthName] = useState("");
  const [approvalAuthRole, setApprovalAuthRole] = useState("");
  const [financeAuthName, setFinanceAuthName] = useState("");
  const [financeAuthRole, setFinanceAuthRole] = useState("");
  const [financeAuthEmail, setFinanceAuthEmail] = useState("");
  const [financeAuthMobile, setFinanceAuthMobile] = useState("");
  const [accountPersonName, setAccountPersonName] = useState("");
  const [accountPersonEmail, setAccountPersonEmail] = useState("");
  const [accountPersonMobile, setAccountPersonMobile] = useState("");
  const [UTRNumber, setUTRNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [roles, setRoles] = useState([]);
  const [utilizationData, setUtilizationData] = useState([]);
  const [utilizationAttachments, setUtilizationAttachments] = useState([]);
  const [approvalAuthoritiesUpdated, setApprovalAuthoritiesUpdated] =
    useState(false);
  const [financeAuthoritiesUpdated, setFinanceAuthoritiesUpdated] =
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
  const [loading4, setLoading4] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState({});
  const [matchedRoles, setMatchedRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

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
    } else if (pathname.includes("account")) {
      setLoggedInRole("account");
      setCenter_id("all");
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
    if (utilizationData?.approvalAuthourities) {
      // Auto-select the first role if only one match is found
      if (matchedRoles.length === 1) {
        setSelectedRole(matchedRoles[0]);
        setApprovalAuthRole(matchedRoles[0]);
      }
    }
  }, [roles, utilizationData]);

  useEffect(() => {
    getUtilizationData();
  }, [status, approvalAuthoritiesUpdated, financeAuthoritiesUpdated]);

  // console.log("pdfmode", pdfMode);

  const getUtilizationData = () => {
    axios
      .get("/api/utilization-details/get/one/" + params._id)
      .then((response) => {
        var utilizationData = response.data[0];
        // console.log("response", response);
        if (utilizationData?.approvalAuthourities) {
          setApprovalAuthoritiesUpdated(true);
        }
        setUtilizationData(utilizationData);
        // const combinedAttachmentData = utilizationData?.documentName?.map(
        //   (name, index) => {
        //     return {
        //       name: name,
        //       url: utilizationData?.documentUrl[index],
        //     };
        //   }
        // );

        // console.log(
        //   "response?.data[0]?.paymentDetails?.UTRNumber",
        //   response?.data[0]?.paymentDetails?.UTRNumber
        // );

        // console.log(
        //   "response?.data[0]?.paymentDetails?.paymentDate",
        //   response?.data[0]?.paymentDetails?.paymentDate
        // );

        setUTRNumber(response?.data[0]?.paymentDetails?.UTRNumber);
        setPaymentDate(response?.data[0]?.paymentDetails?.paymentDate);

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
          const parseAuthEmail = userDetails.email;
          const parseAuthMobile = userDetails.mobile;
          // console.log("parseAuthRole",parseAuthRole)

          setUser_id(user_id);
          setApprovalAuthName(parseAuthName);
          setRoles(parseAuthRole);
          // console.log(
          //   "utilizationData?.approvalAuthourities-------------------------------------",
          //   utilizationData?.approvalAuthourities
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
          // console.log(
          //   "approvalAuthRole-------------------------------------",
          //   approvalAuthRole
          // );

          if (userDetails.roles.includes("ho-person")) {
            setFinanceAuthName(parseAuthName);
            setFinanceAuthRole(userDetails.roles);
            setFinanceAuthEmail(userDetails.email);
            setFinanceAuthMobile(userDetails.mobile);
          } else if (userDetails.roles.includes("account-person")) {
            setFinanceAuthRole(userDetails.roles);
          }
          // console.log("authRole-------------------------------------",authRole)
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
      utilizationData?.approvalAuthourities
        ?.filter((auth) => auth.approvalAuthName === approvalAuthName)
        .map((auth) => auth.approvalAuthRole) || [];
    // console.log("authorities", authorities);
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

  const paymentValidation = () => {
    let inputIsValid = true;
    let errorMsg = {};
    // console.log("2 status => ", st);

    if (validator.isEmpty(UTRNumber)) {
      // console.log("3 status => ", st);
      inputIsValid = false;
      errorMsg.UTRNumberError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(paymentDate)) {
      // console.log("3 status => ", st);
      inputIsValid = false;
      errorMsg.paymentDateError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(paymentStatus)) {
      // console.log("3 status => ", st);
      inputIsValid = false;
      errorMsg.paymentStatusError = "This field is required.";
      setError(errorMsg);
    }

    return inputIsValid;
  };

  const handlePaymentDetailsSubmit = (e) => {
    e.preventDefault();

    let formValues = {
      UTRNumber: UTRNumber,
      paymentDate: paymentDate,
      updatedByName: accountPersonName ? accountPersonName : financeAuthName,
      updatedByRole: financeAuthRole[0],
      updatedBy: user_id,
    };

    if (paymentValidation()) {
      formValues.ID = params._id;
      axios
        .patch("/api/utilization-details/patch/payment-status", formValues)
        .then((response) => {
          // console.log("response", response);
          if (response.data.success) {
            Swal.fire("", "Payment Status Updated Successfully").then(() => {
              router.push(
                `/${loggedInRole}/utilization-management/utilization-list`
              );
              setUTRNumber("");
              setPaymentDate("");
            });
          } else {
            Swal.fire("", response.data.message);
          }

          getUtilizationData();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const isUserAuthourised = (approvalAuthName, approvalAuthRole) => {
    // console.log(
    //   "approvalAuthName, approvalAuthRole",
    //   approvalAuthName,
    //   approvalAuthRole
    // );

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
    // console.log("authorizedIndexes", authorizedIndexes);

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
            // console.log("showActionButtons 1", showActionButtons);
            break;
          }
        } else {
          // --- CASE 2: Subsequent levels (index > 0) ---
          // If current is pending, previous must be approved.
          if (currentStatus === "pending") {
            if (prevStatus === "pending") {
              // console.log("prevStatus 6", prevStatus);
              showActionButtons = false;
              // console.log("showActionButtons 6", showActionButtons);
              continue;
            } else if (prevStatus === "approved" || prevStatus === "rejected") {
              showActionButtons = true;
              // console.log("showActionButtons 2", showActionButtons);
              break;
            } else if (nextStatus !== "approved" && nextStatus !== "rejected") {
              showActionButtons = true;
              // console.log("showActionButtons 2", showActionButtons);
              break;
            } else if (
              authorizedIndexes.length === 0 &&
              prevStatus === "pending"
            ) {
              showActionButtons = false;
              // console.log("showActionButtons 4", showActionButtons);
              break;
            } else if (
              currentStatus === "pending" &&
              prevStatus === "pending"
            ) {
              showActionButtons = false;
              // console.log("showActionButtons 5", showActionButtons);
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
          // console.log("showActionButtons 3", showActionButtons);
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
        // console.log(
        //   "Authorized at index:",
        //   index,
        //   "with level:",
        //   authority.approvalLevel
        // );
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

  useEffect(() => {
    if (user_id && utilizationData?.center_id) {
      isAccountPersonAuthorized();
    }
  }, [user_id, utilizationData?.center_id]);

  const isAccountPersonAuthorized = async () => {
    // console.log("utilizationData?.center_id", utilizationData?.center_id);
    // console.log("user_id", user_id);
    if (!utilizationData?.center_id || !user_id) return;

    try {
      const response = await axios.post(
        "/api/utilization-details/get/account-person",
        {
          center_id: utilizationData?.center_id,
          // user_id: user_id,
        }
      );

      // console.log("response account person", response);

      const { financeAuth } = response.data;
      setAccountPersonName(financeAuth?.financeAuthName || "");
      setAccountPersonEmail(financeAuth?.financeAuthEmail || "");
      setAccountPersonMobile(financeAuth?.financeAuthMobile || "");
    } catch (error) {
      console.error("Account Person not Assigned", error);
      setAccountPersonName(""); // This will ensure blank space if unauthorized
    }
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
      element.style.marginTop = "50px";
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
      margin: 0,
      filename: "utilization-approval-details.pdf",
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
          <div className="flex justify-end items-center">
            {/* <h1 className="heading text-center capitalize text-nowrap text-2xl">
              Lupin Human Welfare & Research Foundation
            </h1>
            <Image
              src={logoimgfull}
              alt="Full Logo Image"
              className={`w-full max-w-[120px] h-auto object-contain mx-auto`}
            /> */}

            <div className="flex gap-3 my-5 px-2 justify-end md:me-10 hide-in-pdf">


              <Tooltip
                content="Download as PDF"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading4 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <FaFileDownload
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      downloadPDF();
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
                        `/${loggedInRole}/utilization-management/utilization-list`,
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
        <div className="border-b-2 border-gray-300 flex flex-row justify-between items-center py-4 px-2 gap-4"
>

<h2 className="heading capitalize text-xl md:text-2xl pl-2 md:whitespace-nowrap">


              Lupin Human Welfare & Research Foundation
            </h2>
            {/* <Image
              src={logoimgfull}
              alt="Full Logo Image"
              className={`w-full max-w-[120px] h-auto object-contain mx-auto`}
            /> */}
          
            <img
              id="pdf-logo"
              src="/images/specific/logo.webp"
              alt="Full Logo"
              className="max-w-[120px] h-auto object-contain ml-auto mr-2"


            />


        </div>
  
        <div className="px-4 md:px-10 py-6">
          <div className="bg-white text-secondary">
            <div className="">
              <div className="flex-1 flex justify-center">
                {/* <div className="relative font-bold p-2 text-leftBlack underline underline-offset-8 text-xl"> */}
                <div className="relative font-bold p-2 text-leftBlack text-lg md:text-xl text-center">

                  Utilization (Expenditure) Statement
                </div>
              </div>
              <div className="flex-1 flex justify-end mt-3">
                <label htmlFor="centerName" className="inputLabel font-bold">
                  Center Name -&nbsp;
                </label>
                <div className="relative text-base font-bold text-leftBlack">
                  {utilizationData?.centerName ? (
                    utilizationData?.centerName
                  ) : loading2 ? (
                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                  ) : (
                    "NA"
                  )}
                </div>
              </div>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full mt-5 table-auto border-collapse min-w-[600px]">
                <thead className="text-[15px] font-bold text-leftBlack">
                  <tr className="border border-leftBlack">
                    <th className="p-2 border border-leftBlack">
                      Approval Number
                    </th>
                    <th className="p-2 border border-leftBlack">
                      Approval Date
                    </th>
                    <th className="p-2 border border-leftBlack">
                      Voucher Number
                    </th>
                    <th className="p-2 border border-leftBlack">
                      Voucher Date
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[15px] font-medium text-center text-leftBlack">
                  <tr className="border border-leftBlack">
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.approvalNo ? (
                        utilizationData?.approvalNo
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.approvalDate ? (
                        moment(utilizationData?.approvalDate).format(
                          "DD-MM-YYYY"
                        )
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>

                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.voucherNumber ? (
                        utilizationData?.voucherNumber
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.voucherDate ? (
                        moment(utilizationData?.voucherDate).format(
                          "DD-MM-YYYY"
                        )
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
                  </div>
              
                      <div className="w-full overflow-x-auto">
                        <table className="w-full mt-5 table-auto border-collapse min-w-[600px]">
                <thead className="text-[15px] font-bold text-leftBlack">
                  <tr className="border border-leftBlack">
                    <th className="p-2 border border-leftBlack">Program</th>
                    <th className="p-2 border border-leftBlack">Project</th>
                    <th className="p-2 border border-leftBlack">Activity</th>
                    <th className="p-2 border border-leftBlack">
                      Sub-activity
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[15px] font-medium text-center text-leftBlack">
                  <tr className="border border-leftBlack">
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.program ? (
                        utilizationData?.program
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.project ? (
                        utilizationData?.project
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>

                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.activityName ? (
                        utilizationData?.activityName
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.subactivityName ? (
                        utilizationData?.subactivityName
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
              
                      <div className="w-full overflow-x-auto">
                         <table className="w-full mt-5 table-auto border-collapse min-w-[600px]">
                <thead className="text-[15px] font-bold text-leftBlack">
                  <tr className="border border-leftBlack">
                    <th className="p-2 border border-leftBlack">Quantity</th>
                    <th className="p-2 border border-leftBlack">Unit</th>
                    <th className="p-2 border border-leftBlack">Unit Cost</th>
                    <th className="p-2 border border-leftBlack">
                      Impacted Households
                    </th>
                    <th className="p-2 border border-leftBlack">
                      Reach (Beneficiaries)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[15px] font-medium text-center text-leftBlack">
                  <tr className="border border-leftBlack">
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.quantity ? (
                        formatNumberToCommas(utilizationData?.quantity)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.unit ? (
                        utilizationData?.unit
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>

                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.unitCost ? (
                        formatToINR(utilizationData?.unitCost)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.noOfHouseholds ? (
                        formatNumberToCommas(utilizationData?.noOfHouseholds)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.noOfBeneficiaries ? (
                        formatNumberToCommas(utilizationData?.noOfBeneficiaries)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
             
                      <div className="w-full overflow-x-auto"> <table className="w-full mt-5 table-auto border-collapse min-w-[600px]">
                <thead className="text-[15px] font-bold text-leftBlack">
                  <tr className="border border-leftBlack">
                    <th className="p-2 border border-leftBlack">Total Cost</th>
                    <th className="p-2 border border-leftBlack">
                      External Grant
                    </th>
                    <th className="p-2 border border-leftBlack">CC</th>
                    <th className="p-2 border border-leftBlack">LHWRF</th>
                    <th className="p-2 border border-leftBlack">Convergence</th>
                  </tr>
                </thead>
                <tbody className="text-[15px] font-medium text-center text-leftBlack">
                  <tr className="border border-leftBlack">
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.totalCost ? (
                        formatToINR(utilizationData?.totalCost)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.sourceofFund?.grant ? (
                        formatToINR(utilizationData?.sourceofFund?.grant)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.sourceofFund?.CC ? (
                        formatToINR(utilizationData?.sourceofFund?.CC)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>

                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.sourceofFund?.LHWRF ? (
                        formatToINR(utilizationData?.sourceofFund?.LHWRF)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.convergence ? (
                        formatToINR(utilizationData?.convergence)
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                  </tr>
                </tbody>
              </table></div>
              
                      <div className="w-full overflow-x-auto">
                        <table className="w-full mt-5 table-auto border-collapse min-w-[600px]">
                <thead className="text-[15px] font-bold text-leftBlack">
                  <tr className="border border-leftBlack">
                    <th className="p-2 border border-leftBlack">
                      Convergence Agency Name
                    </th>
                    <th className="p-2 border border-leftBlack">
                      Convergence Document
                    </th>
                    <th className="p-2 border border-leftBlack">Status</th>
                    <th className="p-2 border border-leftBlack">Remarks</th>
                  </tr>
                </thead>
                <tbody className="text-[15px] font-medium text-center text-leftBlack">
                  <tr className="border border-leftBlack">
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.convergenceAgencyName ? (
                        utilizationData?.convergenceAgencyName
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.convergenceDocumentName ? (
                        utilizationData?.convergenceDocumentName
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        0
                      )}
                    </td>
                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.activityStatus ? (
                        utilizationData?.activityStatus
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>

                    <td className="p-2 border border-leftBlack">
                      {utilizationData?.convergenceNote ? (
                        utilizationData?.convergenceNote
                      ) : loading2 ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
              

              {utilizationData?.approvalAuthourities?.length > 0 ? (
                <table className="w-full mt-10 mb-10 table-fixed border-collapse hidden show-in-pdf text-sm">
                  <thead className="font-bold text-leftBlack">
                    <tr className="border border-leftBlack">
                      {utilizationData.approvalAuthourities.map((_, i) => (
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
                      {utilizationData.approvalAuthourities.map(
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
                                className={`mb-2 text-2xl font-bold capitalize ${
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
                                {moment(authority.updatedAt).format(
                                  "DD/MM/yyyy"
                                )}
                                <br />
                                {moment(authority.updatedAt).format("hh:mm a")}
                              </div>
                              <div className="mt-3 text-xs text-center">
                                <b>{authority.approvalAuthName}</b> <br />
                                <div className="font-semibold">
                                  {authority.approvalAuthRole}
                                </div>
                                <div className="font-semibold">
                                  {authority.approvalAuthEmail}
                                </div>
                                <div className="font-semibold">
                                  {authority.approvalAuthMobile}
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

              {accountPersonEmail === userDetails?.email ||
              userDetails?.roles[0] === "ho-person" ? (
                <table className="w-full mt-20 mb-5 table-auto border-collapse hidden show-in-pdf">
                  <thead className="text-[15px] font-bold text-leftBlack">
                    <tr className="border border-leftBlack">
                      <th className="p-2 border border-leftBlack">
                        Financial Authority
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[15px] font-medium text-center text-leftBlack">
                    <tr className="border border-leftBlack">
                      <td className="p-2 border border-leftBlack">
                        <>
                          {userDetails?.roles[0] === "account-person" &&
                          accountPersonName ? (
                            <div className="py-6 border bg-lightBlue">
                              <div className="ps-2 pe-4">
                                <b>{accountPersonName}</b> <br />
                                <div className="inputLabel font-semibold">
                                  {financeAuthRole}
                                </div>
                                <div className="inputLabel font-semibold">
                                  {accountPersonEmail}
                                </div>
                                <div className="inputLabel font-semibold">
                                  {accountPersonMobile}
                                </div>
                              </div>
                            </div>
                          ) : userDetails.roles[0] === "ho-person" ? (
                            <div className="py-6 bg-lightBlue">
                              <td className="ps-2 pe-4">
                                <b>{financeAuthName}</b> <br />
                                <div className="inputLabel font-semibold">
                                  {financeAuthRole}
                                </div>
                                <div className="inputLabel font-semibold">
                                  {financeAuthEmail}
                                </div>
                                <div className="inputLabel font-semibold">
                                  {financeAuthMobile}
                                </div>
                              </td>
                            </div>
                          ) : (
                            ""
                          )}
                          {userDetails?.roles[0] === "ho-person" ||
                          loggedInRole === "account" ? (
                            <div className="">
                              {utilizationData?.paymentDetails
                                ?.paymentStatus === "payment-released" &&
                              utilizationData?.paymentDetails?.UTRNumber &&
                              utilizationData?.paymentDetails?.paymentDate ? (
                                <div className="">
                                  <div
                                    colSpan={3}
                                    className="text-left capitalize rounded-xl text-black text-sm"
                                  >
                                    <div className="p-2 font-bold">
                                      <span>
                                        {" "}
                                        UTR Number :-&nbsp;
                                        <span className="font-medium">
                                          {
                                            utilizationData?.paymentDetails
                                              ?.UTRNumber
                                          }
                                        </span>
                                      </span>
                                    </div>
                                    <div className="p-2 font-bold">
                                      <span>
                                        Payment Date :-&nbsp;
                                        <span className="font-medium">
                                          {
                                            utilizationData?.paymentDetails
                                              ?.paymentDate
                                          }
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                              {utilizationData?.paymentDetails
                                ?.paymentStatus === "payment-released" &&
                              utilizationData?.paymentDetails?.updatedByRole ? (
                                <tr className="">
                                  <td
                                    colSpan={3}
                                    className="text-center p-2 capitalize rounded-xl font-bold text-nowrap text-Green text-sm"
                                  >
                                    <span className="">
                                      {
                                        utilizationData?.paymentDetails
                                          ?.paymentStatus
                                      }
                                      &nbsp;By&nbsp;
                                      {
                                        utilizationData?.paymentDetails
                                          ?.updatedByRole
                                      }
                                    </span>
                                  </td>
                                </tr>
                              ) : (
                                ""
                              )}
                            </div>
                          ) : (
                            ""
                          )}
                        </>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                ""
              )}

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
                    {/* {utilizationAttachments &&
                                 utilizationAttachments?.length > 0 ? (
                                   utilizationAttachments?.map((document, index) => {
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
                                           utilizationAttachments?.length > 0
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
                                 )} */}
                  </div>
                </div>
                <div className="flex-1 lg:me-4 w-1/2">
                  <label htmlFor="totalCost" className="inputLabel">
                    Convergence Attachment
                  </label>
                  <div
                    className={
                      `relative font-normal flex
                                   gap-4 text-[15px]`
                      //   ${
                      //   utilizationAttachments?.length > 4
                      //     ? "grid grid-cols-4"
                      //     : "flex"
                      // }
                    }
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
                    {/* {utilizationAttachments &&
                                 utilizationAttachments?.length > 0 ? (
                                   utilizationAttachments?.map((document, index) => {
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
                                           utilizationAttachments?.length > 0
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
                                 )} */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* {console.log("isUserAuthourised(approvalAuthName, approvalAuthRole)",approvalAuthName,approvalAuthRole,isUserAuthourised(approvalAuthName, approvalAuthRole))} */}
          {isUserAuthourised(approvalAuthName, approvalAuthRole) ||
          unAuthorizedApprovers.includes(userDetails?.roles[0]) ? (
            <div className="border-t-2">
              <h3 className="subHeading font-bold mt-4 hide-in-pdf">
                Approval Authorities
              </h3>

              <div className="flex flex-col md:flex-row gap-10 justify-between mt-5 mb-6 w-full adjust-authorities">

                <div className="w-full md:w-1/2 hide-in-pdf">
                  <table className="w-full table-auto border-separate border-spacing-y-4">
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
  "py-2 sm:py-6 flex flex-col sm:table-row items-center sm:items-start text-center sm:text-left " +
  (item.approvalAuthName === approvalAuthName &&
  approvalAuthRole === item.approvalAuthRole
    ? "border border-2 bg-lightBlue text-Green"
    : "")
}
                              >
                                <td
                                 className={
                                  "pb-2 sm:pb-6 pe-0 sm:pe-4 inputLabel font-semibold w-full sm:w-auto order-1 sm:order-none text-center sm:text-left" +

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
                                  "ps-2 sm:ps-2 pe-2 sm:pe-4 w-full sm:w-auto order-2 sm:order-none py-2 sm:py-0 " +

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
                                <td className="w-full sm:w-auto flex justify-center sm:block order-3 sm:order-none py-3 sm:py-0">

                                  <Image
                                    src={
                                      item.status === "approved"
                                        ? approvedStamp
                                        : item.status === "rejected"
                                        ? rejectedStamp
                                        : pendingStamp
                                    }
                                    className="w-12 sm:w-16 md:w-20"

                                    alt={item.status}
                                  />
                                  <div className="mt-2 sm:mt-1 text-gray-600 text-xs text-center sm:text-left">

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

                {/* {console.log("userDetails.role", userDetails?.roles[0])}
                {console.log("loggedInRole", loggedInRole)} */}
                {isUserAuthourised(approvalAuthName, approvalAuthRole)
                  ?.showActionButtons &&
                !unAuthorizedApprovers.includes(financeAuthRole[0]) ? (
                  <div className="w-full md:w-1/2 justify-center hide-in-pdf">
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
                                : "text-black w-1/2 stdSelectField"
                            }
                            `}
                              value={selectedRole}
                              onChange={(e) => {
                                setSelectedRole(e.target.value);
                                setApprovalAuthRole(e.target.value);
                              }}
                            >
                              <option className="text-black" value="">
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
                      ) : matchedRoles.length === 1 && approvalAuthRole ? (
                        <p className="text-center mx-auto">
                          Approve This Activity as{" "}
                          <strong>{approvalAuthRole}</strong>
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
                  ""
                )}

                {accountPersonEmail === userDetails?.email ||
                userDetails?.roles[0] === "ho-person" ? (
                  <div className="w-full md:w-1/2-mt-10 hide-in-pdf">
                    <h3 className="subHeading font-bold -mt-2 adjust-authorities-heading">
                      Financial Authority
                    </h3>

                    <div className="adjust-financial-authorities">
                      <table className="table-auto border-separate border-spacing-y-4 mt-6 adjust-financial-authorities-width">
                        <thead></thead>
                        <tbody>
                          {/* {utilizationData?.financeAuthorities?.map( */}
                          {/* (item, index) => { */}
                          {/* // Check if user is authorized and previous levels are
                      approved return ( */}
                          <>
                            {userDetails?.roles[0] === "account-person" &&
                            accountPersonName ? (
                              <tr className="py-6 border border-2 bg-lightBlue text-Green">
                                <td className="ps-2 pe-4 text-Green">
                                  <b>{accountPersonName}</b> <br />
                                  <div className="inputLabel font-semibold">
                                    {financeAuthRole}
                                  </div>
                                  <div className="inputLabel font-semibold">
                                    {accountPersonEmail}
                                  </div>
                                  <div className="inputLabel font-semibold">
                                    {accountPersonMobile}
                                  </div>
                                </td>
                              </tr>
                            ) : userDetails.roles[0] === "ho-person" ? (
                              <tr className="py-6 border border-2 bg-lightBlue text-Green">
                                <td className="ps-2 pe-4 text-Green">
                                  <b>{financeAuthName}</b> <br />
                                  <div className="inputLabel font-semibold">
                                    {financeAuthRole}
                                  </div>
                                  <div className="inputLabel font-semibold">
                                    {financeAuthEmail}
                                  </div>
                                  <div className="inputLabel font-semibold">
                                    {financeAuthMobile}
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              ""
                            )}
                          </>
                          {/* ); } // )} */}
                        </tbody>
                      </table>

                      {userDetails?.roles[0] === "ho-person" ||
                      loggedInRole === "account" ? (
                        <div className="w-2/3 adjust-financial-authorities-width">
                          <div className="w-full mt-4 lg:mt-0 hide-in-pdf">
                            <label htmlFor="UTRNumber" className="inputLabel">
                              UTR Number
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                  <ImListNumbered className="icon" />
                                </span>
                              </div>
                              <input
                                type="text"
                                name="UTRNumber"
                                id="UTRNumber"
                                className={
                                  error.UTRNumberError
                                    ? "stdInputField"
                                    : "stdInputField"
                                }
                                placeholder="Enter UTR Number"
                                value={UTRNumber}
                                onChange={(e) => {
                                  setUTRNumber(e.target.value);
                                  setError((prevState) => ({
                                    ...prevState,
                                    UTRNumberError: "",
                                  }));
                                }}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center"></div>
                            </div>
                            <div
                              className="text-red-500"
                              style={{ fontSize: "12px", fontWeight: "normal" }}
                            >
                              {/* {error.quantityError} */}
                              {error.UTRNumberError && (
                                <span>{error.UTRNumberError}</span>
                              )}
                            </div>
                          </div>
                          <div className="w-full mt-4 hide-in-pdf ">
                            <label htmlFor="paymentDate" className="inputLabel">
                              Payment Date
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                  <MdOutlineDateRange className="icon" />
                                </span>
                              </div>
                              <input
                                type="date"
                                name="paymentDate"
                                id="paymentDate"
                                max={moment().format("YYYY-MM-DD")}
                                className={`
                                  ${
                                    error.paymentDateError
                                      ? "stdSelectField"
                                      : "stdSelectField"
                                  }
                                  ${
                                    paymentDate ? "text-black" : "text-gray-400"
                                  }
                                `}
                                value={paymentDate}
                                onChange={(e) => {
                                  setPaymentDate(e.target.value);
                                  setError((prevState) => ({
                                    ...prevState,
                                    paymentDateError: "",
                                  }));
                                }}
                              />
                            </div>
                            <div
                              className="text-red-500"
                              style={{ fontSize: "12px", fontWeight: "normal" }}
                            >
                              {error.paymentDateError}
                            </div>
                          </div>

                          <div className="flex justify-end mb-6 mt-2 hide-in-pdf">
                            <button
                              type="submit"
                              onClick={handlePaymentDetailsSubmit}
                              disabled={
                                utilizationData?.paymentDetails
                                  ?.paymentStatus === "payment-released"
                              }
                              className="formButtons disabled:bg-gray-400 disabled:cursor-not-allowed"
                              style={{ transition: "background-color 0.3s" }}
                            >
                              {loading3 ? (
                                <span>
                                  Submit
                                  <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                                </span>
                              ) : (
                                <span>Submit</span>
                              )}
                            </button>
                          </div>
                          {utilizationData?.paymentDetails?.paymentStatus ===
                            "payment-released" &&
                          utilizationData?.paymentDetails?.UTRNumber &&
                          utilizationData?.paymentDetails?.paymentDate ? (
                            <tr className="py-6">
                              <td
                                colSpan={3}
                                className="text-left capitalize rounded-xl text-black text-sm"
                              >
                                <div className="p-2">
                                  <span>
                                    {" "}
                                    UTR Number :-&nbsp;
                                    <span className="font-medium">
                                      {
                                        utilizationData?.paymentDetails
                                          ?.UTRNumber
                                      }
                                    </span>
                                  </span>
                                </div>
                                <div className="p-2">
                                  <span>
                                    Payment Date :-&nbsp;
                                    <span className="font-medium">
                                      {
                                        utilizationData?.paymentDetails
                                          ?.paymentDate
                                      }
                                    </span>
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            ""
                          )}
                          {utilizationData?.paymentDetails?.paymentStatus ===
                            "payment-released" &&
                          utilizationData?.paymentDetails?.updatedByRole ? (
                            <tr className="py-6">
                              <td
                                colSpan={3}
                                className="text-center p-2 capitalize rounded-xl bg-green text-white text-sm"
                              >
                                <span className="">
                                  {
                                    utilizationData?.paymentDetails
                                      ?.paymentStatus
                                  }
                                  &nbsp;By&nbsp;
                                  {
                                    utilizationData?.paymentDetails
                                      ?.updatedByRole
                                  }
                                </span>
                              </td>
                            </tr>
                          ) : (
                            ""
                          )}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ) : null}

          {/* {authorizedAccountPerson ||
          userDetails?.roles[0] === "ho-person" ? (
       
          ) : (
            ""
          )} */}
        </div>
      </div>
    </section>
  );
};

export default ApprovalDetails;