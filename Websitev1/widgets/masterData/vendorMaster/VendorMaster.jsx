// "use client";

// import { useState, useEffect } from "react";
// import validator from "validator";
// import Swal from "sweetalert2";
// import axios from "axios";
// import { useParams, useRouter } from "next/navigation";
// import { FaList } from "react-icons/fa";
// import { FiUploadCloud } from "react-icons/fi";
// import BulkUpload from "./BulkUpload.js";
// // import GenericTable from "@/widgets/GenericTable/FilterTable";
// import { Tooltip } from "flowbite-react";
// import { BsPlusSquare } from "react-icons/bs";
// import { FaSpinner, FaFileUpload } from "react-icons/fa";
// import {
//     MdBusiness,
//     MdCategory,
//     MdLayers,
//     MdFingerprint,
//     MdConfirmationNumber,
//     MdLocationCity,
//     MdPerson,
//     MdWork,
//     MdPhone,
//     MdEmail,
//     MdAccountBalance,
//     MdNumbers,
//     MdQrCode,
//     MdHome,
//     MdLocationOn,
//     MdPublic,
//     MdLocalPostOffice,
// } from "react-icons/md";
// import { CiBank, CiViewList } from "react-icons/ci";
// const initialState = {
//     vendorStatus: "Active",
//     vendorInfo: {
//         nameOfCompany: "",
//         vendorCategory: "",
//         vendorType: "",
//         panNumber: "",
//         gstin: "",
//         tdsApplicable: false,
//         lupinFoundationCenterName: "",
//         primaryContactPersonName: "",
//         designation: "",
//         mobileNumber: "",
//         officialEmailId: "",
//     },
//     bankDetails: {
//         bankName: "",
//         branchName: "",
//         accountHolderName: "",
//         accountNumber: "",
//         ifscCode: "",
//         accountType: "",
//     },
//     addressDetails: {
//         addressLine1: "",
//         city: "",
//         district: "",
//         state: "",
//         country: "",
//         pinCode: "",
//     },
// };

// export default function VendorFormPage() {
//     const params = useParams();
//     const router = useRouter();

//     const pid = params?.id;

//     const [formData, setFormData] = useState(initialState);
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [isBulkUpload, setIsBulkUpload] = useState(true); // default false, will also ensure false if pid is set
//     const [dropdownOptions, setDropdownOptions] = useState({
//         vendorCategories: [],
//         vendorTypes: [],
//         centers: [],
//     });

//     const bankAccountTypes = [
//         { label: "Saving Account", value: "Saving Account" },
//         { label: "Current Account", value: "Current Account" },
//         { label: "Salary Account", value: "Salary Account" },
//         { label: "Fixed Deposit Account", value: "Fixed Deposit Account" },
//         { label: "Recurring Deposit Account", value: "Recurring Deposit Account" },
//         { label: "NRI Account", value: "NRI Account" },
//         { label: "Joint Account", value: "Joint Account" },
//         { label: "Business Account", value: "Business Account" }
//     ];

//     // When pid is available, force isBulkUpload to false
//     useEffect(() => {
//         if (pid) {
//             setIsBulkUpload(true);
//         }
//     }, [pid]);

//     // Fetch dropdown options (Vendor Category, Vendor Type, Center Name)
//     useEffect(() => {
//         const fetchDropdownOptions = async () => {
//             try {
//                 const res = await axios.get("/api/vendor-master/dropdown-options");
//                 const data = res?.data?.data || {};

//                 setDropdownOptions({
//                     vendorCategories: data.vendorCategories || [],
//                     vendorTypes: data.vendorTypes || [],
//                     centers: data.centers || [],
//                 });
//             } catch (error) {
//                 console.error("Error fetching vendor dropdown options:", error);
//             }
//         };

//         fetchDropdownOptions();
//     }, []);

//     const stdInputFieldClass = "stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";
//     /* ================= HANDLE CHANGE ================= */

//     const handleChange = (section, field, value) => {
//         setFormData((prev) => ({
//             ...prev,
//             [section]: {
//                 ...prev[section],
//                 [field]: value,
//             },
//         }));
//     };

//     useEffect(() => {
//         if (!pid) return;   // Only run in edit mode

//         const fetchVendorData = async () => {
//             try {
//                 setLoading(true);

//                 const response = await axios.get(
//                     `/api/vendor-master/get/${pid}`
//                 );

//                 const vendor = response.data?.data;

//                 if (vendor) {
//                     setFormData({
//                         vendorStatus: vendor.vendorStatus || "Active",

//                         vendorInfo: {
//                             ...initialState.vendorInfo,
//                             ...vendor.vendorInfo,
//                         },

//                         bankDetails: {
//                             ...initialState.bankDetails,
//                             ...vendor.bankDetails,
//                         },

//                         addressDetails: {
//                             ...initialState.addressDetails,
//                             ...vendor.addressDetails,
//                         },
//                     });
//                 }

//             } catch (error) {
//                 console.error("Fetch Vendor Error:", error);

//                 Swal.fire({
//                     icon: "error",
//                     title: "Error",
//                     text: "Failed to load vendor data.",
//                 });
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchVendorData();

//     }, [pid]);

//     /* ================= VALIDATION ================= */

//     const validateForm = () => {
//         const newErrors = {};
//         const { vendorInfo, bankDetails, addressDetails } = formData;

//         /* ================= VENDOR INFO ================= */

//         // Company Name
//         if (!vendorInfo.nameOfCompany?.trim()) {
//             newErrors.nameOfCompany = "Company Name is required";
//         }

//         // Vendor Category
//         if (!vendorInfo.vendorCategory?.trim()) {
//             newErrors.vendorCategory = "Vendor Category is required";
//         }

//         // Vendor Type
//         if (!vendorInfo.vendorType?.trim()) {
//             newErrors.vendorType = "Vendor Type is required";
//         }

//         // PAN Number
//         if (!vendorInfo.panNumber?.trim()) {
//             newErrors.panNumber = "PAN Number is required";
//         } else if (
//             !validator.matches(
//                 vendorInfo.panNumber,
//                 /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
//             )
//         ) {
//             newErrors.panNumber = "Invalid PAN format";
//         }

//         // GSTIN
//         if (!vendorInfo.gstin?.trim()) {
//             newErrors.gstin = "GSTIN is required";
//         } else if (
//             !validator.matches(
//                 vendorInfo.gstin,
//                 /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
//             )
//         ) {
//             newErrors.gstin = "Invalid GSTIN format";
//         }

//         // Lupin Foundation Center Name
//         if (!vendorInfo.lupinFoundationCenterName?.trim()) {
//             newErrors.lupinFoundationCenterName =
//                 "Center Name is required";
//         }

//         // Primary Contact Person
//         if (!vendorInfo.primaryContactPersonName?.trim()) {
//             newErrors.primaryContactPersonName =
//                 "Primary Contact Person is required";
//         }

//         // Designation
//         if (!vendorInfo.designation?.trim()) {
//             newErrors.designation = "Designation is required";
//         }

//         // Mobile Number
//         if (!vendorInfo.mobileNumber?.trim()) {
//             newErrors.mobileNumber = "Mobile Number is required";
//         } else if (!validator.isMobilePhone(vendorInfo.mobileNumber, "en-IN")) {
//             newErrors.mobileNumber = "Invalid Mobile Number";
//         }

//         // Official Email
//         if (!vendorInfo.officialEmailId?.trim()) {
//             newErrors.officialEmailId = "Official Email is required";
//         } else if (!validator.isEmail(vendorInfo.officialEmailId)) {
//             newErrors.officialEmailId = "Invalid Email Address";
//         }

//         /* ================= BANK DETAILS ================= */

//         if (!bankDetails.bankName?.trim()) {
//             newErrors.bankName = "Bank Name is required";
//         }

//         if (!bankDetails.branchName?.trim()) {
//             newErrors.branchName = "Branch Name is required";
//         }

//         if (!bankDetails.accountHolderName?.trim()) {
//             newErrors.accountHolderName = "Account Holder Name is required";
//         }

//         // Account Number
//         if (!bankDetails.accountNumber?.trim()) {
//             newErrors.accountNumber = "Account Number is required";
//         } else if (!validator.isNumeric(bankDetails.accountNumber)) {
//             newErrors.accountNumber = "Account Number must be numeric";
//         }

//         // IFSC Code
//         if (!bankDetails.ifscCode?.trim()) {
//             newErrors.ifscCode = "IFSC Code is required";
//         } else if (
//             !validator.matches(
//                 bankDetails.ifscCode,
//                 /^[A-Z]{4}0[A-Z0-9]{6}$/
//             )
//         ) {
//             newErrors.ifscCode = "Invalid IFSC Code";
//         }

//         if (!bankDetails.accountType?.trim()) {
//             newErrors.accountType = "Account Type is required";
//         }

//         /* ================= ADDRESS DETAILS ================= */

//         if (!addressDetails.addressLine1?.trim()) {
//             newErrors.addressLine1 = "Address Line 1 is required";
//         }

//         if (!addressDetails.city?.trim()) {
//             newErrors.city = "City is required";
//         }

//         if (!addressDetails.district?.trim()) {
//             newErrors.district = "District is required";
//         }

//         if (!addressDetails.state?.trim()) {
//             newErrors.state = "State is required";
//         }

//         if (!addressDetails.country?.trim()) {
//             newErrors.country = "Country is required";
//         }

//         if (!addressDetails.pinCode?.trim()) {
//             newErrors.pinCode = "PIN Code is required";
//         } else if (
//             !validator.isLength(addressDetails.pinCode, { min: 6, max: 6 }) ||
//             !validator.isNumeric(addressDetails.pinCode)
//         ) {
//             newErrors.pinCode = "PIN Code must be 6 digits";
//         }

//         /* ================= FINAL ================= */

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };



//     /* ================= SUBMIT ================= */

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const isValid = validateForm();
//         if (!isValid) return; // Stop if form invalid

//         try {
//             setLoading(true);
//             let response;
//             if (pid) {
//                 // ===== UPDATE =====
//                 response = await axios.put(`/api/vendor-master/update/${pid}`, formData);

//                 if (response.status === 200 || response.status === 201) {
//                     await Swal.fire({
//                         icon: "success",
//                         title: "Updated!",
//                         text: "Vendor updated successfully.",
//                         confirmButtonColor: "#059669",
//                     });
//                 }
//             } else {
//                 // ===== CREATE =====
//                 response = await axios.post("/api/vendor-master/create", formData);

//                 if (response.status === 200 || response.status === 201) {
//                     await Swal.fire({
//                         icon: "success",
//                         title: "Created!",
//                         text: "Vendor created successfully.",
//                         confirmButtonColor: "#059669",
//                     });

//                     // Reset form after success
//                     setFormData(initialState);
//                     setErrors({});
//                 }
//             }

//             // Redirect to list page after create/update
//             router.push("/admin/master-data/vendor-master/vendor-list");

//         } catch (error) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Submission Failed",
//                 text: error?.response?.data?.message || "Something went wrong. Please try again.",
//                 confirmButtonColor: "#dc2626",
//             });
//         } finally {
//             setLoading(false);
//         }
//     };


//     return (
//         <section className="section">
//             <div className="box border-2 rounded-md shadow-md">
//                 <div className="uppercase text-xl font-semibold">
//                     <div className="border-b-2 border-gray-300 flex items-center justify-between">

//                         <h1 className="heading">
//                             Vendor Registration
//                         </h1>

//                         <div className="flex items-center gap-4 lg:me-10">
//                             <Tooltip
//                                 content={!isBulkUpload ? "Add Vendor" : "Bulk Upload"}
//                                 placement="bottom"
//                                 arrow={false}
//                                 className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
//                             >
//                                 <div onClick={() => setIsBulkUpload(prev => !prev)}>
//                                     {!isBulkUpload ? (
//                                         <BsPlusSquare className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]" />
//                                     ) : (
//                                         <FaFileUpload className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]" />
//                                     )}
//                                 </div>
//                             </Tooltip>

//                             <Tooltip
//                                 content="Vendor List"
//                                 placement="bottom"
//                                 className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
//                                 arrow={false}
//                             >
//                                 <CiViewList className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]" onClick={() => { router.push("/admin/master-data/vendor-master/vendor-list") }} />
//                             </Tooltip>
//                         </div>

//                     </div>
//                 </div>



//                 {
//                     isBulkUpload ?

//                         <form onSubmit={handleSubmit} className="space-y-12">

//                             {/* ================= VENDOR INFO ================= */}
//                             <div className="p-6 py-4  m-4">
//                                 <h2 className="text-lg font-semibold mb-6">Vendor Information</h2>


//                                 <div className="grid md:grid-cols-3 gap-6">

//                                     {/* Company Name */}
//                                     <div>
//                                         <label className="text-sm font-normal">Company Name</label>
//                                         <span className="text-red-500 ml-1">*</span>


//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdBusiness className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 value={formData.vendorInfo.nameOfCompany}
//                                                 onChange={(e) =>
//                                                     handleChange("vendorInfo", "nameOfCompany", e.target.value)
//                                                 }
//                                                 placeholder="Enter Company Name"
//                                                 className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.nameOfCompany ? "border-red-500" : ""}`}
//                                             />
//                                         </div>
//                                         {errors.nameOfCompany && (
//                                             <p className="error">{errors.nameOfCompany}</p>
//                                         )}
//                                     </div>

//                                     {/* Vendor Category */}
//                                     {/* <div>
//                                         <label className="text-sm font-normal">Vendor Category</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdCategory className="icon" />
//                                                 </span>
//                                             </div>
//                                             <select
//                                                 value={formData.vendorInfo.vendorCategory}
//                                                 onChange={(e) =>
//                                                     handleChange("vendorInfo", "vendorCategory", e.target.value)
//                                                 }
//                                                 className={`${stdInputFieldClass} ${errors.vendorCategory ? "border-red-500 " : ""}`}
//                                             >
//                                                 <option value="">Select Vendor Category</option>
//                                                 {dropdownOptions.vendorCategories.map((cat) => (
//                                                     <option key={cat} value={cat}>
//                                                         {cat}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                         {errors.vendorCategory && (
//                                             <p className="error">{errors.vendorCategory}</p>
//                                         )}
//                                     </div> */}

//                                     {/* Vendor Type */}
//                                     {/* <div>
//                                         <label className="text-sm font-normal">Vendor Type</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdLayers className="icon" />
//                                                 </span>
//                                             </div>
//                                             <select
//                                                 value={formData.vendorInfo.vendorType}
//                                                 onChange={(e) =>
//                                                     handleChange("vendorInfo", "vendorType", e.target.value)
//                                                 }
//                                                 className={`${stdInputFieldClass} ${errors.vendorType ? "border-red-500" : ""}`}
//                                             >
//                                                 <option value="">Select Vendor Type</option>
//                                                 {dropdownOptions.vendorTypes.map((type) => (
//                                                     <option key={type} value={type}>
//                                                         {type}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                         {errors.vendorType && (
//                                             <p className="error">{errors.vendorType}</p>
//                                         )}
//                                     </div> */}

//                                     {/* Vendor Category */}
//                                     <div>
//                                         <label className="text-sm font-normal">
//                                             Vendor Category
//                                         </label>
//                                         <span className="text-red-500 ml-1">*</span>

//                                         <div className="relative border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdCategory className="icon" />
//                                                 </span>
//                                             </div>

//                                             <input
//                                                 value={formData.vendorInfo.vendorCategory}
//                                                 onChange={(e) =>
//                                                     handleChange("vendorInfo", "vendorCategory", e.target.value)
//                                                 }
//                                                 placeholder="Enter Vendor Category"
//                                                 className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.vendorCategory ? "border-red-500" : ""
//                                                     }`}
//                                             />
//                                         </div>

//                                         {errors.vendorCategory && (
//                                             <p className="error">{errors.vendorCategory}</p>
//                                         )}
//                                     </div>

//                                     {/* Vendor Type */}
//                                     <div>
//                                         <label className="text-sm font-normal">
//                                             Vendor Type
//                                         </label>
//                                         <span className="text-red-500 ml-1">*</span>

//                                         <div className="relative border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdLayers className="icon" />
//                                                 </span>
//                                             </div>

//                                             <input
//                                                 value={formData.vendorInfo.vendorType}
//                                                 onChange={(e) =>
//                                                     handleChange("vendorInfo", "vendorType", e.target.value)
//                                                 }
//                                                 placeholder="Enter Vendor Type"
//                                                 className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.vendorType ? "border-red-500" : ""
//                                                     }`}
//                                             />
//                                         </div>

//                                         {errors.vendorType && (
//                                             <p className="error">{errors.vendorType}</p>
//                                         )}
//                                     </div>

//                                     {/* PAN Number */}
//                                     <div>
//                                         <label className="text-sm font-normal">PAN Number</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdFingerprint className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 maxLength={10}
//                                                 value={formData.vendorInfo.panNumber}
//                                                 onChange={(e) =>
//                                                     handleChange(
//                                                         "vendorInfo",
//                                                         "panNumber",
//                                                         e.target.value.toUpperCase()
//                                                     )
//                                                 }
//                                                 placeholder="Enter PAN Number"
//                                                 className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.panNumber ? "border-red-500" : ""}`}
//                                             />
//                                         </div>
//                                         {errors.panNumber && (
//                                             <p className="error">{errors.panNumber}</p>
//                                         )}
//                                     </div>

//                                     {/* GSTIN */}
//                                     <div>
//                                         <label className="text-sm font-normal">GSTIN</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdConfirmationNumber className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 maxLength={15}
//                                                 value={formData.vendorInfo.gstin}
//                                                 onChange={(e) =>
//                                                     handleChange(
//                                                         "vendorInfo",
//                                                         "gstin",
//                                                         e.target.value.toUpperCase()
//                                                     )
//                                                 }
//                                                 placeholder="Enter GSTIN"
//                                                 className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.gstin ? "border-red-500" : ""}`}
//                                             />
//                                         </div>
//                                         {errors.gstin && (
//                                             <p className="error">{errors.gstin}</p>
//                                         )}
//                                     </div>

//                                     {/* Center Name */}
//                                     <div>
//                                         <label className="text-sm font-normal">
//                                             Center Name
//                                         </label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdLocationCity className="icon" />
//                                                 </span>
//                                             </div>
//                                             <select
//                                                 value={formData.vendorInfo.lupinFoundationCenterName}
//                                                 onChange={(e) =>
//                                                     handleChange(
//                                                         "vendorInfo",
//                                                         "lupinFoundationCenterName",
//                                                         e.target.value
//                                                     )
//                                                 }
//                                                 className={`${stdInputFieldClass} ${errors.lupinFoundationCenterName ? "border-red-500" : ""
//                                                     }`}
//                                             >
//                                                 <option value="">Select Center Name</option>
//                                                 {dropdownOptions.centers.map((center) => (
//                                                     <option key={center._id} value={center.centerName}>
//                                                         {center.centerName}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                         {errors.lupinFoundationCenterName && (
//                                             <p className="error">
//                                                 {errors.lupinFoundationCenterName}
//                                             </p>
//                                         )}
//                                     </div>




//                                 </div>


//                             </div>

//                             <div className="p-6  py-4 m-4">
//                                 <h2 className="text-lg font-semibold mb-6">Contact Person Details</h2>
//                                 {/* Primary Contact Person */}

//                                 <div className="grid md:grid-cols-3 gap-6">

//                                     <div>
//                                         <label className="text-sm font-normal">
//                                             Primary Contact Person
//                                         </label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdPerson className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 value={formData.vendorInfo.primaryContactPersonName}
//                                                 onChange={(e) =>
//                                                     handleChange(
//                                                         "vendorInfo",
//                                                         "primaryContactPersonName",
//                                                         e.target.value
//                                                     )
//                                                 }
//                                                 placeholder="Enter Primary Contact Person Name"
//                                                 className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.primaryContactPersonName ? "border-red-500" : ""
//                                                     }`}
//                                             />
//                                         </div>
//                                         {errors.primaryContactPersonName && (
//                                             <p className="error">
//                                                 {errors.primaryContactPersonName}
//                                             </p>
//                                         )}
//                                     </div>

//                                     {/* Designation */}
//                                     <div>
//                                         <label className="text-sm font-normal">Designation</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdWork className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 value={formData.vendorInfo.designation}
//                                                 onChange={(e) =>
//                                                     handleChange("vendorInfo", "designation", e.target.value)
//                                                 }
//                                                 placeholder="Enter Designation"
//                                                 className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.designation ? "border-red-500" : ""
//                                                     }`}
//                                             />
//                                         </div>
//                                         {errors.designation && (
//                                             <p className="error">{errors.designation}</p>
//                                         )}
//                                     </div>

//                                     {/* Mobile Number */}
//                                     <div>
//                                         <label className="text-sm font-normal">Mobile Number</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdPhone className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 maxLength={10}
//                                                 value={formData.vendorInfo.mobileNumber}
//                                                 onChange={(e) =>
//                                                     handleChange("vendorInfo", "mobileNumber", e.target.value)
//                                                 }
//                                                 placeholder="Enter Mobile Number"
//                                                 className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.mobileNumber ? "border-red-500" : ""}`}
//                                             />

//                                         </div>
//                                         {errors.mobileNumber && (
//                                             <p className="error">{errors.mobileNumber}</p>
//                                         )}
//                                     </div>

//                                     {/* Official Email */}
//                                     <div>
//                                         <label className="text-sm font-normal">Official Email</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdEmail className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="email"
//                                                 value={formData.vendorInfo.officialEmailId}
//                                                 onChange={(e) =>
//                                                     handleChange(
//                                                         "vendorInfo",
//                                                         "officialEmailId",
//                                                         e.target.value
//                                                     )
//                                                 }
//                                                 placeholder="Enter Official Email"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.officialEmailId ? "border-red-500" : ""}`}
//                                             />

//                                         </div>
//                                         {errors.officialEmailId && (
//                                             <p className="error">
//                                                 {errors.officialEmailId}
//                                             </p>
//                                         )}
//                                     </div>

//                                     {/* TDS Applicable */}
//                                     <div className="flex items-center gap-2 mt-6">
//                                         <input
//                                             type="checkbox"
//                                             checked={formData.vendorInfo.tdsApplicable}
//                                             onChange={(e) =>
//                                                 handleChange(
//                                                     "vendorInfo",
//                                                     "tdsApplicable",
//                                                     e.target.checked
//                                                 )
//                                             }
//                                         />
//                                         <label className="text-sm font-normal">
//                                             TDS Applicable
//                                         </label><span className="text-red-500 ml-1">*</span>
//                                     </div>
//                                 </div>

//                             </div>

//                             {/* ================= BANK ================= */}
//                             <div className="p-6  py-4 m-4">
//                                 <h2 className="text-lg font-semibold mb-6">Bank Details</h2>

//                                 <div className="grid md:grid-cols-3 gap-6">

//                                     {/* Bank Name */}
//                                     <div>
//                                         <label className="text-sm font-normal">Bank Name</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <CiBank className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 value={formData.bankDetails.bankName}
//                                                 onChange={(e) =>
//                                                     handleChange("bankDetails", "bankName", e.target.value)
//                                                 }
//                                                 placeholder="Enter Bank Name"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.bankName ? "border-red-500" : ""}`}
//                                             />

//                                         </div>
//                                         {errors.bankName && (
//                                             <p className="error">{errors.bankName}</p>
//                                         )}
//                                     </div>

//                                     {/* Branch Name */}
//                                     <div>
//                                         <label className="text-sm font-normal">Branch Name</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <CiBank className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 value={formData.bankDetails.branchName}
//                                                 onChange={(e) =>
//                                                     handleChange("bankDetails", "branchName", e.target.value)
//                                                 }
//                                                 placeholder="Enter Branch Name"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.branchName ? "border-red-500" : ""}`}
//                                             />

//                                         </div>
//                                         {errors.branchName && (
//                                             <p className="error">{errors.branchName}</p>
//                                         )}
//                                     </div>

//                                     {/* Account Holder Name */}
//                                     <div>
//                                         <label className="text-sm font-normal">Account Holder Name</label><span className="text-red-500 ml-1">*</span>

//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdPerson className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 value={formData.bankDetails.accountHolderName}
//                                                 onChange={(e) =>
//                                                     handleChange("bankDetails", "accountHolderName", e.target.value)
//                                                 }
//                                                 placeholder="Enter Account Holder Name"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.accountHolderName ? "border-red-500" : ""}`}
//                                             />

//                                         </div>
//                                         {errors.accountHolderName && (
//                                             <p className="error">{errors.accountHolderName}</p>
//                                         )}
//                                     </div>

//                                     {/* Account Number */}
//                                     <div>
//                                         <label className="text-sm font-normal">Account Number</label><span className="text-red-500 ml-1">*</span>


//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdNumbers className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="number"
//                                                 value={formData.bankDetails.accountNumber}
//                                                 onChange={(e) =>
//                                                     handleChange("bankDetails", "accountNumber", e.target.value)
//                                                 }
//                                                 placeholder="Enter Account Number"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.accountNumber ? "border-red-500" : ""}`}
//                                             />

//                                         </div>

//                                         {errors.accountNumber && (
//                                             <p className="error">{errors.accountNumber}</p>
//                                         )}
//                                     </div>

//                                     {/* IFSC Code */}
//                                     <div>
//                                         <label className="text-sm font-normal">IFSC Code</label><span className="text-red-500 ml-1">*</span>
//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdQrCode className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 value={formData.bankDetails.ifscCode}
//                                                 onChange={(e) =>
//                                                     handleChange("bankDetails", "ifscCode", e.target.value)
//                                                 }
//                                                 placeholder="Enter IFSC Code"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.ifscCode ? "border-red-500" : ""}`}
//                                             />

//                                         </div>
//                                         {errors.ifscCode && (
//                                             <p className="error">{errors.ifscCode}</p>
//                                         )}
//                                     </div>

//                                     {/* Account Type */}
//                                     <div>
//                                         <label className="text-sm font-normal">Account Type</label><span className="text-red-500 ml-1">*</span>
//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdAccountBalance className="icon" />
//                                                 </span>
//                                             </div>

//                                             <select
//                                                 value={formData.bankDetails.accountType}
//                                                 onChange={(e) =>
//                                                     handleChange("bankDetails", "accountType", e.target.value)
//                                                 }
//                                                 className={`${stdInputFieldClass} ${errors.accountType ? "border-red-500" : ""
//                                                     }`}
//                                             >
//                                                 <option value="">Select Center Name</option>
//                                                 {bankAccountTypes.map((type, i) => (
//                                                     <option key={i} value={type.value}>
//                                                         {type.label}
//                                                     </option>
//                                                 ))}
//                                             </select>



//                                         </div>
//                                         {errors.accountType && (
//                                             <p className="error">{errors.accountType}</p>
//                                         )}
//                                     </div>

//                                 </div>

//                             </div>

//                             {/* ================= BANK ================= */}
//                             <div className="p-6 py-4 m-4">
//                                 <h2 className="text-lg font-semibold mb-6">Address Details</h2>

//                                 <div className="grid md:grid-cols-3 gap-6">

//                                     {/* Address Line 1 */}
//                                     <div>
//                                         <label className="text-sm font-normal">Address Line 1</label><span className="text-red-500 ml-1">*</span>
//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdHome className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 value={formData.addressDetails.addressLine1}
//                                                 onChange={(e) =>
//                                                     handleChange("addressDetails", "addressLine1", e.target.value)
//                                                 }
//                                                 placeholder="Enter Address Line 1"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.addressLine1 ? "border-red-500" : ""}`}
//                                             />
//                                         </div>
//                                         {errors.addressLine1 && (
//                                             <p className="error">{errors.addressLine1}</p>
//                                         )}
//                                     </div>

//                                     {/* City */}
//                                     <div>
//                                         <label className="text-sm font-normal">City</label><span className="text-red-500 ml-1">*</span>
//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdLocationCity className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 value={formData.addressDetails.city}
//                                                 onChange={(e) =>
//                                                     handleChange("addressDetails", "city", e.target.value)
//                                                 }
//                                                 placeholder="Enter City"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.city ? "border-red-500" : ""}`}
//                                             />
//                                         </div>
//                                         {errors.city && (
//                                             <p className="error">{errors.city}</p>
//                                         )}
//                                     </div>

//                                     {/* District */}
//                                     <div>
//                                         <label className="text-sm font-normal">District</label><span className="text-red-500 ml-1">*</span>
//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdLocationOn className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 value={formData.addressDetails.district}
//                                                 onChange={(e) =>
//                                                     handleChange("addressDetails", "district", e.target.value)
//                                                 }
//                                                 placeholder="Enter District"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.district ? "border-red-500" : ""}`}
//                                             />
//                                         </div>
//                                         {errors.district && (
//                                             <p className="error">{errors.district}</p>
//                                         )}
//                                     </div>

//                                     {/* State */}
//                                     <div>
//                                         <label className="text-sm font-normal">State</label><span className="text-red-500 ml-1">*</span>
//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdLocationOn className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 value={formData.addressDetails.state}
//                                                 onChange={(e) =>
//                                                     handleChange("addressDetails", "state", e.target.value)
//                                                 }
//                                                 placeholder="Enter State"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.state ? "border-red-500" : ""}`}
//                                             />
//                                         </div>
//                                         {errors.state && (
//                                             <p className="error">{errors.state}</p>
//                                         )}
//                                     </div>

//                                     {/* Country */}
//                                     <div>
//                                         <label className="text-sm font-normal">Country</label><span className="text-red-500 ml-1">*</span>
//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdPublic className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 value={formData.addressDetails.country}
//                                                 onChange={(e) =>
//                                                     handleChange("addressDetails", "country", e.target.value)
//                                                 }
//                                                 placeholder="Enter Country"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.country ? "border-red-500" : ""}`}
//                                             />
//                                         </div>
//                                         {errors.country && (
//                                             <p className="error">{errors.country}</p>
//                                         )}
//                                     </div>

//                                     {/* PIN Code */}
//                                     <div>
//                                         <label className="text-sm font-normal">PIN Code</label><span className="text-red-500 ml-1">*</span>
//                                         <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                                 <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                                                     <MdLocalPostOffice className="icon" />
//                                                 </span>
//                                             </div>
//                                             <input
//                                                 type="number"
//                                                 maxLength={6}
//                                                 value={formData.addressDetails.pinCode}
//                                                 onChange={(e) =>
//                                                     handleChange("addressDetails", "pinCode", e.target.value)
//                                                 }
//                                                 placeholder="Enter PIN Code"
//                                                 className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.pinCode ? "border-red-500" : ""}`}
//                                             />
//                                         </div>
//                                         {errors.pinCode && (
//                                             <p className="error">{errors.pinCode}</p>
//                                         )}
//                                     </div>

//                                 </div>



//                             </div>

//                             {/* ================= SUBMIT ================= */}
//                             <div className="flex p-6 py-4 m-4 justify-end">
//                                 <button
//                                     type="submit"
//                                     className="formButtons"
//                                 >
//                                     {loading ? "Saving..." : pid ? "Update" : "Submit"}
//                                 </button>
//                             </div>

//                         </form>
//                         :
//                         <div className="p-4">
//                             <BulkUpload />
//                         </div>
//                 }



//             </div>

//             {/* Small utility styles */}
//             <style jsx>{`
//                 .input {
//                 width: 100%;
//                 margin-top: 6px;
//                 padding: 6px 10px;
//                 border: 1px solid #d1d5db;
//                 border-radius: 6px;
//                 height: 32px;
//                 outline: none;
//                 }
//                 .error {
//                 color: #ef4444;
//                 font-size: 12px;
//                 margin-top: 4px;
//                 }
//             `}</style>

//         </section>
//     );
// }





"use client";

import { useState, useEffect, useRef } from "react";
import validator from "validator";
import Swal from "sweetalert2";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { FaList } from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";
import BulkUpload from "./BulkUpload.js";
// import GenericTable from "@/widgets/GenericTable/FilterTable";
import { Tooltip } from "flowbite-react";
import { BsPlusSquare } from "react-icons/bs";
import { FaSpinner, FaFileUpload } from "react-icons/fa";
import {
    MdBusiness,
    MdCategory,
    MdLayers,
    MdFingerprint,
    MdConfirmationNumber,
    MdLocationCity,
    MdPerson,
    MdWork,
    MdPhone,
    MdEmail,
    MdAccountBalance,
    MdNumbers,
    MdQrCode,
    MdHome,
    MdLocationOn,
    MdPublic,
    MdLocalPostOffice,
} from "react-icons/md";
import S3FileUpload from "react-s3";
import { Buffer } from "buffer";
import { MdFileUpload, MdPictureAsPdf, MdImage, MdClose } from "react-icons/md";
import { CiBank, CiViewList } from "react-icons/ci";
import { Data } from "@react-google-maps/api";

if (typeof window !== "undefined") {
    window.Buffer = window.Buffer || Buffer;
}



const initialState = {
    vendorStatus: "Active",
    vendorInfo: {
        nameOfCompany: "",
        vendorCategory: "",
        vendorCategory_id: "",
        vendorSubCategory: "",
        vendorSubCategory_id: "",
        panNumber: "",
        gstin: "",
        tdsApplicable: false,
        lupinFoundationCenterName: "",
        primaryContactPersonName: "",
        designation: "",
        mobileNumber: "",
        officialEmailId: "",
    },
    bankDetails: {
        bankName: "",
        branchName: "",
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "",
    },
    addressDetails: {
        addressLine1: "",
        city: "",
        district: "",
        state: "",
        country: "",
        pinCode: "",
    },
};

export default function VendorFormPage() {
    const params = useParams();
    const router = useRouter();

    const pid = params?.id;

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isBulkUpload, setIsBulkUpload] = useState(true); // default false, will also ensure false if pid is set
    const [dropdownOptions, setDropdownOptions] = useState({
        vendorCategories: [],
        vendorSubCategories: [],
        centers: [],
    });
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);

    const bankAccountTypes = [
        { label: "Saving Account", value: "Saving Account" },
        { label: "Current Account", value: "Current Account" },
        { label: "Salary Account", value: "Salary Account" },
        { label: "Fixed Deposit Account", value: "Fixed Deposit Account" },
        { label: "Recurring Deposit Account", value: "Recurring Deposit Account" },
        { label: "NRI Account", value: "NRI Account" },
        { label: "Joint Account", value: "Joint Account" },
        { label: "Business Account", value: "Business Account" }
    ];

    const fileInputRef = useRef(null);

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const s3Config = {
        bucketName: process.env.NEXT_PUBLIC_BUCKET_NAME,
        region: process.env.NEXT_PUBLIC_REGION,
        accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_SECRET_KEY,
    };

    // IMAGE AND FILE UPLOAD HANDLERS
    const s3upload = (file) => {
        return new Promise((resolve, reject) => {
            S3FileUpload.uploadFile(file, s3Config)
                .then((data) => resolve(data.location))
                .catch((error) => reject(error));
        });
    };

    const processFiles = async (files) => {

        const maxSize = 10 * 1024 * 1024;

        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
            // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            // "application/vnd.ms-excel",
        ];

        for (let i = 0; i < files.length; i++) {

            const file = files[i];

            if (!allowedTypes.includes(file.type)) {
                Swal.fire("", `File type not supported: ${file.name}`);
                continue;
            }

            if (file.size > maxSize) {
                Swal.fire("", `File too large: ${file.name}`);
                continue;
            }

            try {

                const s3url = await s3upload(file);
                // console.log("s3 url-->", s3url);


                setUploadedFiles((prev) => [
                    ...prev,
                    {
                        fileName: file.name,
                        fileData: s3url,
                        fileType: file.type,
                        fileSize: file.size,
                    },
                ]);

            } catch (error) {
                Swal.fire("", `Failed to upload ${file.name}`);
            }
        }
    };

    const handleFileSelect = (e) => {
        processFiles(e.target.files);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        processFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const removeFile = (index) => {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    // When pid is available, force isBulkUpload to false
    useEffect(() => {
        if (pid) {
            setIsBulkUpload(true);
        }
    }, [pid]);

    // Fetch dropdown options (Vendor Category, Vendor Type, Center Name)
    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                const res = await axios.get("/api/vendor-master/dropdown-options");
                const data = res?.data?.data || {};
                console.log("dropdown options -->", res);

                setDropdownOptions({
                    vendorCategories: data.vendorCategories || [],
                    vendorSubCategories: data.vendorSubCategories || [],
                    centers: data.centers || [],
                });
            } catch (error) {
                console.error("Error fetching vendor dropdown options:", error);
            }
        };

        fetchDropdownOptions();
    }, []);

    const stdInputFieldClass = "stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";

    /* ================= HANDLE Catgory Change ================= */
    const handleCategoryChange = async (categoryId) => {

        if (!categoryId) return;

        const selectedCategory = dropdownOptions.vendorCategories.find(
            (cat) => cat._id === categoryId
        );

        try {

            const res = await axios.get(
                `/api/vendor-master/subcategory/${categoryId}`
            );

            setFilteredSubCategories(res?.data?.data || []);

            setFormData((prev) => ({
                ...prev,
                vendorInfo: {
                    ...prev.vendorInfo,
                    vendorCategory_id: categoryId,
                    vendorCategory: selectedCategory?.name || "",
                    vendorSubCategory_id: "",
                    vendorSubCategory: ""
                }
            }));

        } catch (error) {
            console.error("Subcategory fetch error:", error);
        }
    };

    const handleSubCategoryChange = (subCategoryId) => {

        const selectedSub = filteredSubCategories.find(
            (sub) => sub._id === subCategoryId
        );

        setFormData((prev) => ({
            ...prev,
            vendorInfo: {
                ...prev.vendorInfo,
                vendorSubCategory_id: subCategoryId,
                vendorSubCategory: selectedSub?.name || ""
            }
        }));
    };

    /* ================= HANDLE CHANGE ================= */

    const handleChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    useEffect(() => {
        if (!pid) return;   // Only run in edit mode

        const fetchVendorData = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    `/api/vendor-master/get/${pid}`
                );

                const vendor = response.data?.data;
                console.log("fetched vendor data -->", response);

                if (vendor) {
                    setFormData({
                        vendorStatus: vendor.vendorStatus || "Active",

                        vendorInfo: {
                            ...initialState.vendorInfo,
                            ...vendor.vendorInfo,
                        },

                        bankDetails: {
                            ...initialState.bankDetails,
                            ...vendor.bankDetails,
                        },

                        addressDetails: {
                            ...initialState.addressDetails,
                            ...vendor.addressDetails,
                        },
                    });

                    //Load SubCategories for existing category
                    if (vendor.vendorInfo?.vendorCategory_id) {
                        const subRes = await axios.get(
                            `/api/vendor-master/subcategory/${vendor.vendorInfo.vendorCategory_id}`
                        );

                        setFilteredSubCategories(subRes?.data?.data || []);
                    }

                    // 🔽 Load existing uploaded docs
                    if (vendor.docs && vendor.docs.length > 0) {
                        const files = vendor.docs.map((url) => {
                            const name = url.split("/").pop();

                            return {
                                fileName: name,
                                fileData: url,
                                fileType: name.endsWith(".pdf")
                                    ? "application/pdf"
                                    : "image/jpeg",
                                fileSize: 0,
                            };
                        });

                        setUploadedFiles(files);
                    }
                }

            } catch (error) {
                console.error("Fetch Vendor Error:", error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to load vendor data.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchVendorData();

    }, [pid]);

    /* ================= VALIDATION ================= */

    const validateForm = () => {
        const newErrors = {};
        const { vendorInfo, bankDetails, addressDetails } = formData;

        /* ================= VENDOR INFO ================= */

        // Company Name
        if (!vendorInfo.nameOfCompany?.trim()) {
            newErrors.nameOfCompany = "Company Name is required";
        }

        // Vendor Category
        // if (!vendorInfo.vendorCategory?.trim()) {
        //     newErrors.vendorCategory = "Vendor Category is required";
        // }

        // Vendor Type
        // if (!vendorInfo.vendorSubCategory?.trim()) {
        //     newErrors.vendorSubCategory = "Vendor Type is required";
        // }

        // PAN Number
        if (!vendorInfo.panNumber?.trim()) {
            newErrors.panNumber = "PAN Number is required";
        } else if (
            !validator.matches(
                vendorInfo.panNumber,
                /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
            )
        ) {
            newErrors.panNumber = "Invalid PAN format";
        }

        // GSTIN
        // if (!vendorInfo.gstin?.trim()) {
        //     newErrors.gstin = "GSTIN is required";
        // } else if (
        //     !validator.matches(
        //         vendorInfo.gstin,
        //         /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
        //     )
        // ) {
        //     newErrors.gstin = "Invalid GSTIN format";
        // }
        if (vendorInfo.gstin?.trim()) {
            if (
                !validator.matches(
                    vendorInfo.gstin,
                    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
                )
            ) {
                newErrors.gstin = "Invalid GSTIN format";
            }
        }

        // Lupin Foundation Center Name
        // if (!vendorInfo.lupinFoundationCenterName?.trim()) {
        //     newErrors.lupinFoundationCenterName =
        //         "Center Name is required";
        // }

        // Primary Contact Person
        if (!vendorInfo.primaryContactPersonName?.trim()) {
            newErrors.primaryContactPersonName =
                "Primary Contact Person is required";
        }

        // Designation
        if (!vendorInfo.designation?.trim()) {
            newErrors.designation = "Designation is required";
        }

        // Mobile Number
        if (!vendorInfo.mobileNumber?.trim()) {
            newErrors.mobileNumber = "Mobile Number is required";
        } else if (!validator.isMobilePhone(vendorInfo.mobileNumber, "en-IN")) {
            newErrors.mobileNumber = "Invalid Mobile Number";
        }

        // Official Email
        if (!vendorInfo.officialEmailId?.trim()) {
            newErrors.officialEmailId = "Official Email is required";
        } else if (!validator.isEmail(vendorInfo.officialEmailId)) {
            newErrors.officialEmailId = "Invalid Email Address";
        }

        /* ================= BANK DETAILS ================= */

        if (!bankDetails.bankName?.trim()) {
            newErrors.bankName = "Bank Name is required";
        }

        if (!bankDetails.branchName?.trim()) {
            newErrors.branchName = "Branch Name is required";
        }

        if (!bankDetails.accountHolderName?.trim()) {
            newErrors.accountHolderName = "Account Holder Name is required";
        }

        // Account Number
        if (!bankDetails.accountNumber?.trim()) {
            newErrors.accountNumber = "Account Number is required";
        } else if (!validator.isNumeric(bankDetails.accountNumber)) {
            newErrors.accountNumber = "Account Number must be numeric";
        }

        // IFSC Code
        if (!bankDetails.ifscCode?.trim()) {
            newErrors.ifscCode = "IFSC Code is required";
        } else if (
            !validator.matches(
                bankDetails.ifscCode,
                /^[A-Z]{4}0[A-Z0-9]{6}$/
            )
        ) {
            newErrors.ifscCode = "Invalid IFSC Code";
        }

        if (!bankDetails.accountType?.trim()) {
            newErrors.accountType = "Account Type is required";
        }

        /* ================= ADDRESS DETAILS ================= */

        if (!addressDetails.addressLine1?.trim()) {
            newErrors.addressLine1 = "Address Line 1 is required";
        }

        if (!addressDetails.city?.trim()) {
            newErrors.city = "City is required";
        }

        if (!addressDetails.district?.trim()) {
            newErrors.district = "District is required";
        }

        if (!addressDetails.state?.trim()) {
            newErrors.state = "State is required";
        }

        if (!addressDetails.country?.trim()) {
            newErrors.country = "Country is required";
        }

        if (!addressDetails.pinCode?.trim()) {
            newErrors.pinCode = "PIN Code is required";
        } else if (
            !validator.isLength(addressDetails.pinCode, { min: 6, max: 6 }) ||
            !validator.isNumeric(addressDetails.pinCode)
        ) {
            newErrors.pinCode = "PIN Code must be 6 digits";
        }

        /* ================= FINAL ================= */

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    /* ================= SUBMIT ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("formdata --> ", formData);

        const isValid = validateForm();
        if (!isValid) return; // Stop if form invalid
        const payload = {
            ...formData,
            docs: uploadedFiles.map((f) => f.fileData),
        };
        console.log("payload --->", payload);

        try {
            setLoading(true);
            let response;
            if (pid) {
                // ===== UPDATE =====
                response = await axios.put(`/api/vendor-master/update/${pid}`, payload);

                if (response.status === 200 || response.status === 201) {
                    await Swal.fire({
                        icon: "success",
                        title: "Updated!",
                        text: "Vendor updated successfully.",
                        confirmButtonColor: "#059669",
                    });
                }
            } else {
                // ===== CREATE =====
                response = await axios.post("/api/vendor-master/create", payload);

                if (response.status === 200 || response.status === 201) {
                    await Swal.fire({
                        icon: "success",
                        title: "Created!",
                        text: "Vendor created successfully.",
                        confirmButtonColor: "#059669",
                    });

                    // Reset form after success
                    setFormData(initialState);
                    setErrors({});
                }
            }

            // Redirect to list page after create/update
            const basePath = window.location.pathname.includes("admin") ? "/admin" : "/asset";
            router.push(`${basePath}/master-data/vendor-master/vendor-list`);

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: error?.response?.data?.message || "Something went wrong. Please try again.",
                confirmButtonColor: "#dc2626",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md">
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300 flex items-center justify-between">

                        <h1 className="heading">
                            Vendor Registration
                        </h1>

                        <div className="flex items-center gap-4 lg:me-10">
                            <Tooltip
                                content="Bulk Upload"
                                placement="bottom"
                                arrow={false}
                                className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
                            >
                                <div>

                                    <FaFileUpload className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]"
                                        onClick={() => {
                                            const basePath = window.location.pathname.includes("admin") ? "/admin" : "/asset";
                                            router.push(`${basePath}/master-data/vendor-master/bulk-upload`);
                                        }}
                                    />
                                </div>
                            </Tooltip>

                            <Tooltip
                                content="Vendor List"
                                placement="bottom"
                                className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
                                arrow={false}
                            >
                                <CiViewList className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]" onClick={() => {
                                    const basePath = window.location.pathname.includes("admin") ? "/admin" : "/asset";
                                    router.push(`${basePath}/master-data/vendor-master/vendor-list`)
                                }} />
                            </Tooltip>
                        </div>

                    </div>
                </div>

                <form onSubmit={handleSubmit} className="">

                    {/* ================= VENDOR INFO ================= */}
                    <div className="p-6  py-4 mx-4 mb-4">
                        <h2 className="text-lg font-semibold mb-3">Vendor Information</h2>


                        <div className="grid md:grid-cols-3 gap-6">

                            {/* Vendor Name */}
                            <div>
                                <label className="text-sm font-normal">Vendor Name</label>
                                <span className="text-red-500 ml-1">*</span>


                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdBusiness className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        value={formData.vendorInfo.nameOfCompany}
                                        onChange={(e) =>
                                            handleChange("vendorInfo", "nameOfCompany", e.target.value)
                                        }
                                        placeholder="Enter Vendor Name"
                                        className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.nameOfCompany ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.nameOfCompany && (
                                    <p className="error">{errors.nameOfCompany}</p>
                                )}
                            </div>

                            {/* Vendor Category */}
                            {/* <div>
                                        <label className="text-sm font-normal">Vendor Category</label><span className="text-red-500 ml-1">*</span>

                                        <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                                    <MdCategory className="icon" />
                                                </span>
                                            </div>
                                            <select
                                                value={formData.vendorInfo.vendorCategory}
                                                onChange={(e) =>
                                                    handleChange("vendorInfo", "vendorCategory", e.target.value)
                                                }
                                                className={`${stdInputFieldClass} ${errors.vendorCategory ? "border-red-500 " : ""}`}
                                            >
                                                <option value="">Select Vendor Category</option>
                                                {dropdownOptions.vendorCategories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.vendorCategory && (
                                            <p className="error">{errors.vendorCategory}</p>
                                        )}
                                    </div> */}

                            {/* Vendor Type */}
                            {/* <div>
                                        <label className="text-sm font-normal">Vendor Type</label><span className="text-red-500 ml-1">*</span>

                                        <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                                    <MdLayers className="icon" />
                                                </span>
                                            </div>
                                            <select
                                                value={formData.vendorInfo.vendorType}
                                                onChange={(e) =>
                                                    handleChange("vendorInfo", "vendorType", e.target.value)
                                                }
                                                className={`${stdInputFieldClass} ${errors.vendorType ? "border-red-500" : ""}`}
                                            >
                                                <option value="">Select Vendor Type</option>
                                                {dropdownOptions.vendorTypes.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.vendorType && (
                                            <p className="error">{errors.vendorType}</p>
                                        )}
                                    </div> */}

                            {/* Vendor Category */}
                            <div>
                                <label className="text-sm font-normal">
                                    Vendor Category
                                </label>
                                {/* <span className="text-red-500 ml-1">*</span> */}

                                <div className="relative border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdCategory className="icon" />
                                        </span>
                                    </div>

                                    <select
                                        value={formData.vendorInfo.vendorCategory_id || ""}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className={`stdSelectField py-1.5 ${errors.vendorCategory ? "border-red-500" : ""
                                            }`}
                                    >
                                        <option value="">Select Vendor Category</option>

                                        {dropdownOptions.vendorCategories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {errors.vendorCategory && (
                                    <p className="error">{errors.vendorCategory}</p>
                                )}
                            </div>

                            {/* Vendor Subcategory */}
                            <div>
                                <label className="text-sm font-normal">
                                    Vendor SubCategory
                                </label>
                                {/* <span className="text-red-500 ml-1">*</span> */}

                                <div className="relative border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdLayers className="icon" />
                                        </span>
                                    </div>

                                    <select
                                        value={formData.vendorInfo.vendorSubCategory_id || ""}
                                        // onChange={(e) =>
                                        //     handleChange(
                                        //         "vendorInfo",
                                        //         "vendorSubCategory",
                                        //         e.target.value
                                        //     )
                                        // }
                                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                                        className={`stdSelectField py-1.5 ${errors.vendorSubCategory ? "border-red-500" : ""
                                            }`}
                                    >
                                        <option value="">Select Vendor SubCategory</option>

                                        {filteredSubCategories.map((sub) => (
                                            <option key={sub._id} value={sub._id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {errors.vendorSubCategory && (
                                    <p className="error">{errors.vendorSubCategory}</p>
                                )}
                            </div>

                            {/* PAN Number */}
                            <div>
                                <label className="text-sm font-normal">PAN Number</label><span className="text-red-500 ml-1">*</span>

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdFingerprint className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        maxLength={10}
                                        value={formData.vendorInfo.panNumber}
                                        onChange={(e) =>
                                            handleChange(
                                                "vendorInfo",
                                                "panNumber",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="Enter PAN Number"
                                        className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.panNumber ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.panNumber && (
                                    <p className="error">{errors.panNumber}</p>
                                )}
                            </div>

                            {/* GSTIN */}
                            <div>
                                <label className="text-sm font-normal">GSTIN</label>

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdConfirmationNumber className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        maxLength={15}
                                        value={formData.vendorInfo.gstin}
                                        onChange={(e) =>
                                            handleChange(
                                                "vendorInfo",
                                                "gstin",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="Enter GSTIN"
                                        className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.gstin ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.gstin && (
                                    <p className="error">{errors.gstin}</p>
                                )}
                            </div>

                            {/* Center Name */}
                            <div>
                                <label className="text-sm font-normal">
                                    Center Name
                                </label>
                                {/* <span className="text-red-500 ml-1">*</span> */}

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdLocationCity className="icon" />
                                        </span>
                                    </div>
                                    <select
                                        value={formData.vendorInfo.lupinFoundationCenterName}
                                        onChange={(e) =>
                                            handleChange(
                                                "vendorInfo",
                                                "lupinFoundationCenterName",
                                                e.target.value
                                            )
                                        }
                                        disabled={!!pid}   // 👈 makes it uneditable if pid exists
                                        className={`${stdInputFieldClass} 
        ${errors.lupinFoundationCenterName ? "border-red-500" : ""} 
        ${pid ? "bg-gray-100 cursor-not-allowed" : ""}
    `}
                                    >
                                        <option value="">Select Center Name</option>
                                        {dropdownOptions.centers.map((center) => (
                                            <option key={center._id} value={center.centerName}>
                                                {center.centerName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.lupinFoundationCenterName && (
                                    <p className="error">
                                        {errors.lupinFoundationCenterName}
                                    </p>
                                )}
                            </div>

                            {/* TDS Applicable */}
                            <div className="flex items-center gap-2 ">
                                <input
                                    type="checkbox"
                                    checked={formData.vendorInfo.tdsApplicable}
                                    onChange={(e) =>
                                        handleChange(
                                            "vendorInfo",
                                            "tdsApplicable",
                                            e.target.checked
                                        )
                                    }
                                />
                                <label className="text-sm font-normal">
                                    TDS Applicable
                                </label><span className="text-red-500 ml-1">*</span>
                            </div>


                        </div>


                    </div>

                    <div className="border-b-2 mx-6"></div>

                    {/* ================= CONTACT PERSON DETAILS ================= */}
                    <div className="p-6  py-4 mx-4 mb-4">
                        <h2 className="text-lg font-semibold mb-3">Contact Person Details</h2>
                        {/* Primary Contact Person */}

                        <div className="grid md:grid-cols-3 gap-6">

                            <div>
                                <label className="text-sm font-normal">
                                    Primary Contact Person
                                </label><span className="text-red-500 ml-1">*</span>

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdPerson className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        value={formData.vendorInfo.primaryContactPersonName}
                                        onChange={(e) =>
                                            handleChange(
                                                "vendorInfo",
                                                "primaryContactPersonName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter Person Name"
                                        className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.primaryContactPersonName ? "border-red-500" : ""
                                            }`}
                                    />
                                </div>
                                {errors.primaryContactPersonName && (
                                    <p className="error">
                                        {errors.primaryContactPersonName}
                                    </p>
                                )}
                            </div>

                            {/* Designation */}
                            <div>
                                <label className="text-sm font-normal">Designation</label><span className="text-red-500 ml-1">*</span>

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdWork className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        value={formData.vendorInfo.designation}
                                        onChange={(e) =>
                                            handleChange("vendorInfo", "designation", e.target.value)
                                        }
                                        placeholder="Enter Designation"
                                        className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.designation ? "border-red-500" : ""
                                            }`}
                                    />
                                </div>
                                {errors.designation && (
                                    <p className="error">{errors.designation}</p>
                                )}
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label className="text-sm font-normal">Mobile Number</label><span className="text-red-500 ml-1">*</span>

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdPhone className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        maxLength={10}
                                        value={formData.vendorInfo.mobileNumber}
                                        onChange={(e) =>
                                            handleChange("vendorInfo", "mobileNumber", e.target.value)
                                        }
                                        placeholder="Enter Mobile Number"
                                        className={`stdInputField py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.mobileNumber ? "border-red-500" : ""}`}
                                    />

                                </div>
                                {errors.mobileNumber && (
                                    <p className="error">{errors.mobileNumber}</p>
                                )}
                            </div>

                            {/* Official Email */}
                            <div>
                                <label className="text-sm font-normal">Official Email</label><span className="text-red-500 ml-1">*</span>

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdEmail className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.vendorInfo.officialEmailId}
                                        onChange={(e) =>
                                            handleChange(
                                                "vendorInfo",
                                                "officialEmailId",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter Official Email"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.officialEmailId ? "border-red-500" : ""}`}
                                    />

                                </div>
                                {errors.officialEmailId && (
                                    <p className="error">
                                        {errors.officialEmailId}
                                    </p>
                                )}
                            </div>

                        </div>

                    </div>

                    <div className="border-b-2 mx-6"></div>

                    {/* ================= BANK ================= */}
                    <div className="p-6  py-4 mx-4 mb-4">
                        <h2 className="text-lg font-semibold mb-3">Bank Details</h2>

                        <div className="grid md:grid-cols-3 gap-6">

                            {/* Bank Name */}
                            <div>
                                <label className="text-sm font-normal">Bank Name</label><span className="text-red-500 ml-1">*</span>

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <CiBank className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.bankDetails.bankName}
                                        onChange={(e) =>
                                            handleChange("bankDetails", "bankName", e.target.value)
                                        }
                                        placeholder="Enter Bank Name"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.bankName ? "border-red-500" : ""}`}
                                    />

                                </div>
                                {errors.bankName && (
                                    <p className="error">{errors.bankName}</p>
                                )}
                            </div>

                            {/* Branch Name */}
                            <div>
                                <label className="text-sm font-normal">Branch Name</label><span className="text-red-500 ml-1">*</span>

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <CiBank className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.bankDetails.branchName}
                                        onChange={(e) =>
                                            handleChange("bankDetails", "branchName", e.target.value)
                                        }
                                        placeholder="Enter Branch Name"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.branchName ? "border-red-500" : ""}`}
                                    />

                                </div>
                                {errors.branchName && (
                                    <p className="error">{errors.branchName}</p>
                                )}
                            </div>

                            {/* Account Holder Name */}
                            <div>
                                <label className="text-sm font-normal">Account Holder Name</label><span className="text-red-500 ml-1">*</span>

                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdPerson className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.bankDetails.accountHolderName}
                                        onChange={(e) =>
                                            handleChange("bankDetails", "accountHolderName", e.target.value)
                                        }
                                        placeholder="Enter Account Holder Name"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.accountHolderName ? "border-red-500" : ""}`}
                                    />

                                </div>
                                {errors.accountHolderName && (
                                    <p className="error">{errors.accountHolderName}</p>
                                )}
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="text-sm font-normal">Account Number</label><span className="text-red-500 ml-1">*</span>


                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdNumbers className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.bankDetails.accountNumber}
                                        onChange={(e) =>
                                            handleChange("bankDetails", "accountNumber", e.target.value)
                                        }
                                        placeholder="Enter Account Number"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.accountNumber ? "border-red-500" : ""}`}
                                    />

                                </div>

                                {errors.accountNumber && (
                                    <p className="error">{errors.accountNumber}</p>
                                )}
                            </div>

                            {/* IFSC Code */}
                            <div>
                                <label className="text-sm font-normal">IFSC Code</label><span className="text-red-500 ml-1">*</span>
                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdQrCode className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.bankDetails.ifscCode}
                                        onChange={(e) =>
                                            handleChange("bankDetails", "ifscCode", e.target.value)
                                        }
                                        placeholder="Enter IFSC Code"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.ifscCode ? "border-red-500" : ""}`}
                                    />

                                </div>
                                {errors.ifscCode && (
                                    <p className="error">{errors.ifscCode}</p>
                                )}
                            </div>

                            {/* Account Type */}
                            <div>
                                <label className="text-sm font-normal">Account Type</label><span className="text-red-500 ml-1">*</span>
                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdAccountBalance className="icon" />
                                        </span>
                                    </div>

                                    <select
                                        value={formData.bankDetails.accountType}
                                        onChange={(e) =>
                                            handleChange("bankDetails", "accountType", e.target.value)
                                        }
                                        className={`${stdInputFieldClass} ${errors.accountType ? "border-red-500" : ""
                                            }`}
                                    >
                                        <option value="">Select Center Name</option>
                                        {bankAccountTypes.map((type, i) => (
                                            <option key={i} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.accountType && (
                                    <p className="error">{errors.accountType}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-b-2 mx-6"></div>

                    {/* ================= ADDRES DETAILS ================= */}
                    <div className="p-6  py-4 mx-4 mb-4">
                        <h2 className="text-lg font-semibold mb-3">Address Details</h2>

                        <div className="grid md:grid-cols-3 gap-6">

                            {/* Address Line 1 */}
                            <div>
                                <label className="text-sm font-normal">Address Line 1</label><span className="text-red-500 ml-1">*</span>
                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdHome className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.addressDetails.addressLine1}
                                        onChange={(e) =>
                                            handleChange("addressDetails", "addressLine1", e.target.value)
                                        }
                                        placeholder="Enter Address Line 1"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.addressLine1 ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.addressLine1 && (
                                    <p className="error">{errors.addressLine1}</p>
                                )}
                            </div>

                            {/* City */}
                            <div>
                                <label className="text-sm font-normal">City</label><span className="text-red-500 ml-1">*</span>
                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdLocationCity className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.addressDetails.city}
                                        onChange={(e) =>
                                            handleChange("addressDetails", "city", e.target.value)
                                        }
                                        placeholder="Enter City"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.city ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.city && (
                                    <p className="error">{errors.city}</p>
                                )}
                            </div>

                            {/* District */}
                            <div>
                                <label className="text-sm font-normal">District</label><span className="text-red-500 ml-1">*</span>
                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdLocationOn className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.addressDetails.district}
                                        onChange={(e) =>
                                            handleChange("addressDetails", "district", e.target.value)
                                        }
                                        placeholder="Enter District"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.district ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.district && (
                                    <p className="error">{errors.district}</p>
                                )}
                            </div>

                            {/* State */}
                            <div>
                                <label className="text-sm font-normal">State</label><span className="text-red-500 ml-1">*</span>
                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdLocationOn className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.addressDetails.state}
                                        onChange={(e) =>
                                            handleChange("addressDetails", "state", e.target.value)
                                        }
                                        placeholder="Enter State"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.state ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.state && (
                                    <p className="error">{errors.state}</p>
                                )}
                            </div>

                            {/* Country */}
                            <div>
                                <label className="text-sm font-normal">Country</label><span className="text-red-500 ml-1">*</span>
                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdPublic className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.addressDetails.country}
                                        onChange={(e) =>
                                            handleChange("addressDetails", "country", e.target.value)
                                        }
                                        placeholder="Enter Country"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.country ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.country && (
                                    <p className="error">{errors.country}</p>
                                )}
                            </div>

                            {/* PIN Code */}
                            <div>
                                <label className="text-sm font-normal">PIN Code</label><span className="text-red-500 ml-1">*</span>
                                <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                            <MdLocalPostOffice className="icon" />
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        maxLength={6}
                                        value={formData.addressDetails.pinCode}
                                        onChange={(e) =>
                                            handleChange("addressDetails", "pinCode", e.target.value)
                                        }
                                        placeholder="Enter PIN Code"
                                        className={`stdInputField py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.pinCode ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.pinCode && (
                                    <p className="error">{errors.pinCode}</p>
                                )}
                            </div>

                        </div>



                    </div>

                    <div className="border-b-2 mx-6"></div>

                    {/* file upload section */}
                    <div className="p-6 py-4 mx-4">
                        <div className="border border-gray-200 rounded-lg p-5 mt-5 shadow-md">

                            <h3 className="text-[15px] font-bold text-black uppercase tracking-tight">
                                Document Upload
                            </h3>

                            <p className="text-[11px] font-normal text-gray-500 mb-4">
                                Upload vendor documents.
                            </p>

                            <div className="flex flex-col lg:flex-row gap-5">

                                <div
                                    className={`flex-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all
      ${isDragOver ? "border-green bg-green/5" : "border-gray-300 bg-gray-50 hover:border-green hover:bg-green/5"}`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                >

                                    <MdFileUpload className="text-4xl mb-2 text-gray-400" />

                                    <p className="text-[13px] font-semibold text-gray-600 text-center">
                                        Drop documents here to upload
                                    </p>

                                    <p className="text-[11px] text-gray-400 mt-1 text-center">
                                        Supports PDF, PNG, JPG (Max 10MB per file)
                                    </p>

                                    <button
                                        type="button"
                                        className="mt-4 px-4 py-1.5 border border-gray-300 rounded text-[12px] font-medium text-gray-600 bg-white hover:bg-gray-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                    >
                                        Select Files from Computer
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        // accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                {uploadedFiles.length > 0 && (

                                    <div className="flex-1 flex flex-col gap-2">

                                        {uploadedFiles.map((file, index) => (

                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm"
                                            >

                                                <div className="flex items-center gap-2">

                                                    {file.fileType === "application/pdf" ? (
                                                        <MdPictureAsPdf className="text-red-500 text-lg" />
                                                    ) : (
                                                        <MdImage className="text-blue-500 text-lg" />
                                                    )}

                                                    <div>
                                                        <p className="text-[12px] font-semibold text-gray-700">
                                                            {file.fileName}
                                                        </p>

                                                        <p className="text-[10px] text-gray-400">
                                                            {file.fileSize > 0 && (
                                                                <p className="text-[10px] text-gray-400">
                                                                    {formatFileSize(file.fileSize)}
                                                                </p>
                                                            )}
                                                        </p>
                                                    </div>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <MdClose />
                                                </button>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                        </div>
                    </div>

                    {/* ================= SUBMIT ================= */}
                    <div className="flex p-6 py-4 mx-4 my-2 justify-end">
                        <button
                            type="submit"
                            className="formButtons"
                        >
                            {loading ? "Saving..." : pid ? "Update" : "Submit"}
                        </button>
                    </div>

                </form>

            </div>

            {/* Small utility styles */}
            <style jsx>{`
                .input {
                width: 100%;
                margin-top: 6px;
                padding: 6px 10px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                height: 32px;
                outline: none;
                }
                .error {
                color: #ef4444;
                font-size: 12px;
                margin-top: 4px;
                }
            `}</style>

        </section>
    );
}
