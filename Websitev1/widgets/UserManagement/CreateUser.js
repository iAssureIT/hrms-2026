// "use client";
// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import validator from "validator";
// import { Modal } from "flowbite-react";
// import { MdClose } from "react-icons/md";

// import Swal from "sweetalert2";

// import { useParams } from "next/navigation";

// import { IoPersonOutline } from "react-icons/io5";
// import { GoProjectRoadmap } from "react-icons/go";
// import { CiMobile3 } from "react-icons/ci";
// import { PiBuildingOffice } from "react-icons/pi";
// import { usePathname } from "next/navigation";
// import ls from "localstorage-slim";
// import { HiOutlineMail } from "react-icons/hi";
// import { useRouter } from "next/navigation";
// import { FaSpinner } from "react-icons/fa";

// const CreateUserForm = (props) => {
//   const params = useParams();
//   const router = useRouter();
//   const dropdownRef = useRef(null);
//   const [editRoles, setEditRoles] = useState([]);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   const [editUser, setEditUser] = useState(params?._id ? true : false);
//   const [user, setUser] = useState();
//   const [roleList, setRoleList] = useState([]);
//   const [centerNameList, setCenterNameList] = useState([]);
//   const [error, setError] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState([]);
//   const [centerName, setCenterName] = useState("");
//   const [center_id, setCenter_id] = useState("");
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [user_id, setUser_id] = useState();
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true }),
//   );
//   const [userData, setUserData] = useState();
//   const [isClick, setIsClick] = useState(false);
//   const pathname = usePathname();
//   const [errors, setErrors] = useState({
//     firstName: "",
//     lastName: "",
//     mobile: "",
//     email: "",
//     role: "",
//     centerName: "",
//     center_id: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const button = editUser ? "Update" : "Submit";

//   useEffect(() => {
//     if (pathname.includes("admin")) {
//       setLoggedInRole("admin");
//     } else if (pathname.includes("center")) {
//       setLoggedInRole("center");
//     } else if (pathname.includes("account")) {
//       setLoggedInRole("account");
//     } else {
//       setLoggedInRole("executive");
//     }

//     if (userDetails) {
//       setUser_id(userDetails.user_id);
//       setUserData(userDetails);
//     }
//     // console.log("pathname", pathname);
//     if (params?._id) {
//       getOneUser(params?._id);
//     }
//     let userExists = pathname.includes("/" + loggedInRole + "/");

//     // console.log(userExists && !userDetails);
//     if (userExists && !userDetails) {
//       // console.log(userExists && !userDetails);
//       Swal.fire(" ", " Please login first!");
//       window.location.href = "/auth/login";
//     }
//   }, []);

//   // useEffect(() => {
//   //   var user = JSON.parse(localStorage.getItem("userDetails"));
//   //   setUser(user);
//   //   getRoleList();
//   //   if (params?._id) {
//   //     getOneUser(params?._id);
//   //   }
//   //   getCenterNameList();
//   // }, []);

//   useEffect(() => {
//     getCenterNameList();
//     getRoleList();
//   }, []);

//   const getCenterNameList = () => {
//     axios
//       .get("/api/centers/list")
//       .then((response) => {
//         const CenterNameList = response.data;

//         if (Array.isArray(CenterNameList)) {
//           setCenterNameList(
//             CenterNameList.sort((a, b) => {
//               return a.centerName.localeCompare(b.centerName);
//             }),
//           );
//         } else {
//           console.error(
//             "Expected data to be an array but got:",
//             CenterNameList,
//           );
//           setCenterNameList([]);
//         }
//       })
//       .catch((error) => {
//         console.log("Error while getting CenterName List => ", error);
//       });
//   };

//   const getOneUser = (user_id) => {
//     axios
//       .get("/api/users/get/" + user_id)
//       .then((res) => {
//         var roleNew = res.data.roles;
//         //  setEditRoles(res.data.roles)
//         const profile = res.data?.profile || {};

//         setFirstName(res.data?.profile?.firstname);
//         setLastName(res.data?.profile?.lastname);
//         setMobile(res.data?.profile?.mobile);
//         setEmail(res.data?.profile?.email);
//         setSelectedRoles(roleNew);

//         setCenterName(res.data?.profile?.centerName);
//         setCenter_id(res.data?.profile?.center_id);
//       })
//       .catch((err) => {
//         console.log("Error fetching user:", err);
//       });
//   };

//   const handleDropdownToggle = () => {
//     setDropdownOpen(!dropdownOpen);
//   };
//   const handleRoleChange = (role) => {
//     setSelectedRoles((prevSelectedRoles) =>
//       prevSelectedRoles.includes(role)
//         ? prevSelectedRoles.filter((r) => r !== role)
//         : [...prevSelectedRoles, role],
//     );
//   };
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const getRoleList = () => {
//     axios
//       .post("/api/roles/get/list")
//       .then((response) => {
//         let roleList = response.data;

//         console.log("rol list", roleList);

//         setRoleList(
//           roleList.sort((a, b) => {
//             return a.role.localeCompare(b.role);
//           }),
//         );
//       })
//       .catch((err) => console.log("err", err));
//   };

//   const validateForm = () => {
//     let errors = {};
//     let formIsValid = true;

//     if (!firstName) {
//       errors["firstName"] = "This field is mandatory.";
//       formIsValid = false;
//     } else if (!/^[A-Za-z ]{1,15}$/.test(firstName)) {
//       errors["firstName"] =
//         "Special characters not allowed. Max size is 15 characters.";
//       formIsValid = false;
//     }
//     if (!lastName) {
//       errors["lastName"] = "This field is mandatory.";
//       formIsValid = false;
//     } else if (!/^[A-Za-z ]{1,15}$/.test(lastName)) {
//       errors["lastName"] =
//         "Special characters not allowed. Max size is 15 characters.";
//       formIsValid = false;
//     }
//     if (selectedRoles.length === 0 || roleList.length === 0) {
//       errors["role"] = "This field is mandatory.";
//       formIsValid = false;
//     }

//     if (
//       selectedRoles.includes("center-incharge") &&
//       !centerName &&
//       !center_id
//     ) {
//       errors["location"] = "This field is mandatory.";
//       formIsValid = false;
//     }

//     if (!mobile) {
//       errors["mobile"] = "This field is mandatory.";
//       formIsValid = false;
//     } else if (!validator.isNumeric(mobile)) {
//       errors["mobile"] = "Only numerics allowed.";
//       formIsValid = false;
//     } else if (mobile.trim() !== "") {
//       if (!/^\d{10}$/.test(mobile)) {
//         errors["mobile"] = "Please enter a valid 10-digit mobile number";
//         formIsValid = false;
//       }
//     }

//     if (!email) {
//       errors["email"] = "This field is mandatory.";
//       formIsValid = false;
//     } else if (!validator.isEmail(email)) {
//       errors["email"] = "Invalid Email.";
//       formIsValid = false;
//     }

//     setErrors(errors);
//     return formIsValid;
//     console.log("errors", errors);
//   };
//   const rolemap =
//     Array.isArray(role) &&
//     role.map((r) => {
//       r !== "admin";
//       return r;
//     });

//   // const checkRole = params._id && rolemap ;
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (validateForm()) {
//       const formValues = {
//         firstName: firstName,
//         lastName: lastName,
//         mobile: mobile,
//         email: email,
//         role: selectedRoles,
//         centerName: centerName,
//         center_id: center_id,
//         username: "EMAIL",
//         userName: email,
//         status: "active",
//         companyID: 1,
//         password: "Welcome@123",
//         createdBy: user?.user_id,
//       };

//       if (
//         selectedRoles.includes("admin")
//         // selectedRoles.includes("head-csr") ||
//         // selectedRoles.includes("senior-manager") ||
//         // selectedRoles.includes("head-livelihood")
//       ) {
//         delete formValues.centerName;
//         delete formValues.center_id;
//       } else {
//         formValues.centerName = centerName;
//         formValues.center_id = center_id;
//       }

//       if (editUser) {
//         axios
//           .patch("/api/users/patch/user/" + params?._id, formValues)
//           .then((res) => {
//             // console.log("res", res);
//             Swal.fire(" ", "User updated successfully");
//             setLoading(true);
//             {
//               loggedInRole === "admin"
//                 ? (window.location.href = "/admin/user-management")
//                 : loggedInRole === "account"
//                   ? (window.location.href =
//                       "/" +
//                       loggedInRole +
//                       "/utilization-management/utilization-list")
//                   : (window.location.href = "/" + loggedInRole + "/dashboard");
//             }
//           })
//           .catch((err) => {
//             console.error("Error updating user:", err);
//             Swal.fire(" ", "Error updating user:");
//           });
//       } else {
//         axios
//           .post("/api/users/post/user", formValues)
//           .then((res) => {
//             if (res.data.success) {
//               setLoading(true);
//               Swal.fire(" ", "User added successfully").then(() => {
//                 router.push("/admin/user-management");
//               });
//             } else {
//               Swal.fire(" ", res.data.message);
//             }
//           })
//           .catch((err) => {
//             console.error("Error creating user:", err);
//             Swal.fire(" ", "Error creating user:");
//           });
//       }
//     }
//   };

//   return (
//     <section className="section">
//       <div className="box border-2 rounded-md shadow-md h-auto">
//         <div className="uppercase text-xl font-semibold">
//           <div className="border-b-2 border-gray-300">
//             <h1 className="heading">{editUser ? "Update " : "Create "}User</h1>
//           </div>
//         </div>
//         <div className="flex">
//           <form
//             className="mx-10 lg:mx-auto w-full lg:w-3/4 mt-8"
//             onSubmit={handleSubmit}
//           >
//             <div className="grid gap-4 mb-2 md:grid-cols-2 lg:grid-cols-2 max-w-5xl">
//               {/* <div className="mb-4">
//                 <label htmlFor="role" className="inputLabel">
//                   Role <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <GoProjectRoadmap className="icon" />
//                     </span>
//                   </div>

//                   <select
//                     className={`${errors.role && " "} stdSelectField py-1
//   ${role ? "selectOption" : "font-normal text-gray-400"}`}
//                     id="role"
//                     name="role"
//                     disabled={user?.user_id == params?._id}
//                     value={role}
//                     onChange={(e) => {
//                       setRole(e.target.value);
//                     }}
//                     placeholder="Role"
//                   >
//                     <option value="" disabled className="text-gray-400">
//                       -- Select Role --
//                     </option>
//                     {roleList &&
//                       roleList.map((item, index) => {
//                         return (
//                           <option
//                             key={index}
//                             value={item.role}
//                             className="text-black"
//                           >
//                             {item.role}
//                           </option>
//                         );
//                       })}
//                   </select>
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.role}
//                 </div>
//               </div>{console.log("role =>", role[0])} */}
//               {loggedInRole === "admin" && (
//                 <div
//                   className="col-span-full sm:col-span-1 relative "
//                   ref={dropdownRef}
//                 >
//                   <label htmlFor="role" className="inputLabel py-1">
//                     Role<i className="text-red-500"> *</i>
//                   </label>
//                   <div className="relative mt-2 rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                       <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                         <IoPersonOutline className="icon" />
//                       </span>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={handleDropdownToggle}
//                       className={` stdSelectField font-normal text-left
//                                     ${
//                                       role
//                                         ? "selectOption"
//                                         : "font-normal text-[#333]"
//                                     }
//                         `}
//                     >
//                       <span className="text-[#999]">
//                         {selectedRoles.length > 0 ? (
//                           <span className="text-[#333] pr-3">
//                             {" "}
//                             {selectedRoles.join(", ")}{" "}
//                           </span>
//                         ) : (
//                           <span className="text-[#999]">-- Select Role --</span>
//                         )}
//                       </span>

//                       <svg
//                         className="w-5 h-5 ml-2 mr-1 float-right"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </button>
//                     {dropdownOpen && (
//                       <div className="origin-top-right absolute right-0  w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
//                         <div className=" max-h-60 overflow-y-auto">
//                           {roleList.map((item, index) => (
//                             <label
//                               key={index}
//                               className="flex items-center px-4 py-2 text-sm text-[#333] font-normal hover:bg-gray-100 cursor-pointer"
//                             >
//                               <input
//                                 type="checkbox"
//                                 value={item.role}
//                                 checked={selectedRoles.includes(item.role)}
//                                 onChange={() => handleRoleChange(item.role)}
//                                 className="h-4 w-4 text-headerBtn border-gray-300 rounded focus:ring-[#00ACDB]"
//                               />

//                               <span className="ml-2 text-[#333]">
//                                 {item.role}
//                               </span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   <div
//                     className="text-red-500"
//                     style={{ fontSize: "12px", fontWeight: "normal" }}
//                   >
//                     {errors?.role}
//                   </div>
//                 </div>
//               )}
//               {/* {!selectedRoles.includes("admin") ? ( */}
//               <div className="mb-4">
//                 <label className="inputLabel" htmlFor="centerName">
//                   Center{" "}
//                   {selectedRoles.includes("center-incharge") ? (
//                     <i className="text-red-500"> *</i>
//                   ) : (
//                     ""
//                   )}
//                 </label>
//                 <div className="relative rounded-md mt-2 shadow-sm text-gray-500">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <PiBuildingOffice className="icon" />
//                     </span>
//                   </div>
//                   <select
//                     className={`${errors.centerName && " "} stdSelectField

//                   ${centerName ? "selectOption" : "font-normal text-gray-400"}
//                  `}
//                     name="centerName"
//                     id="centerName"
//                     disabled={
//                       user?.user_id == params?._id && loggedInRole !== "admin"
//                     }
//                     value={center_id ? `${center_id}|${centerName}` : ""}
//                     onChange={(e) => {
//                       const [selectedCenter_id, selectedCenterName] =
//                         e.target.value.split("|");
//                       setCenterName(selectedCenterName);

//                       setCenter_id(selectedCenter_id);

//                       setError((prevState) => ({
//                         ...prevState,
//                         centerNameError: "",
//                       }));
//                     }}
//                   >
//                     <option value="" disabled className="text-gray-400">
//                       -- Select Location --
//                     </option>
//                     {centerNameList?.map((center, i) => (
//                       <option
//                         className="text-black"
//                         key={i}
//                         value={`${center._id}|${center.centerName}`}
//                       >
//                         {center.centerName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.location}
//                 </div>
//               </div>
//               {/* ) : (
//                 ""
//               )} */}
//               <div className="mb-4">
//                 <label htmlFor="first-name" className="inputLabel">
//                   First Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <IoPersonOutline className="icon" />
//                     </span>
//                   </div>
//                   <input
//                     type="text"
//                     name="firstName"
//                     id="firstName"
//                     value={firstName}
//                     className={
//                       errors.firstName ? "stdInputField" : "stdInputField"
//                     }
//                     placeholder="First Name"
//                     onChange={(e) => {
//                       setFirstName(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.firstName}
//                 </div>
//               </div>
//               <div className="mb-4">
//                 <label htmlFor="last-name" className="inputLabel">
//                   Last Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <IoPersonOutline className="icon" />
//                     </span>
//                   </div>
//                   <input
//                     type="text"
//                     name="lastName"
//                     id="lastName"
//                     value={lastName}
//                     className={
//                       errors.lastName ? "stdInputField" : "stdInputField"
//                     }
//                     placeholder="Last Name"
//                     onChange={(e) => {
//                       setLastName(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.lastName}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label htmlFor="mobile" className="inputLabel">
//                   Mobile No <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <CiMobile3 className="icon" />
//                     </span>
//                   </div>
//                   <input
//                     type="text"
//                     name="mobile"
//                     id="mobile"
//                     maxLength={10}
//                     value={mobile}
//                     className={
//                       errors.mobile ? "stdInputField" : "stdInputField"
//                     }
//                     placeholder="Mobile No"
//                     onChange={(e) => {
//                       setMobile(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.mobile}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label htmlFor="email" className="inputLabel">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <HiOutlineMail className="icon" />
//                     </span>
//                   </div>
//                   <input
//                     type="text"
//                     name="email"
//                     id="email"
//                     value={email}
//                     className={errors.email ? "stdInputField" : "stdInputField"}
//                     placeholder="Email ID"
//                     onChange={(e) => {
//                       setEmail(e.target.value.trim());
//                     }}
//                   />
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.email}
//                 </div>
//               </div>
//             </div>
//             <div className="flex w-full justify-end mb-4 lg:mt-4">
//               <button
//                 type="submit"
//                 className="formButtons hover:bg-Green lg:hover:bg-Green"
//               >
//                 {loading && editUser ? (
//                   <span>
//                     Update
//                     <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
//                   </span>
//                 ) : loading ? (
//                   <span>
//                     Submit
//                     <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
//                   </span>
//                 ) : (
//                   button
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CreateUserForm;

//Nehas code
// "use client";
// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import validator from "validator";
// import { Modal } from "flowbite-react";
// import { MdClose } from "react-icons/md";

// import Swal from "sweetalert2";

// import { useParams } from "next/navigation";

// import { IoPersonOutline } from "react-icons/io5";
// import { GoProjectRoadmap } from "react-icons/go";
// import { CiMobile3 } from "react-icons/ci";
// import { PiBuildingOffice } from "react-icons/pi";
// import { usePathname } from "next/navigation";
// import ls from "localstorage-slim";
// import { HiOutlineMail } from "react-icons/hi";
// import { useRouter } from "next/navigation";
// import { FaSpinner } from "react-icons/fa";

// const CreateUserForm = (props) => {
//   const params = useParams();
//   const router = useRouter();
//   const dropdownRef = useRef(null);
//   const [editRoles, setEditRoles] = useState([]);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   const [editUser, setEditUser] = useState(params?._id ? true : false);
//   const [user, setUser] = useState();
//   const [roleList, setRoleList] = useState([]);
//   const [centerNameList, setCenterNameList] = useState([]);
//   const [error, setError] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState([]);
//   const [centerName, setCenterName] = useState("");
//   const [center_id, setCenter_id] = useState("");
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [user_id, setUser_id] = useState();
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true }),
//   );
//   const [userData, setUserData] = useState();
//   const [isClick, setIsClick] = useState(false);
//   const pathname = usePathname();
//   const [errors, setErrors] = useState({
//     firstName: "",
//     lastName: "",
//     mobile: "",
//     email: "",
//     role: "",
//     centerName: "",
//     center_id: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const button = editUser ? "Update" : "Submit";

//   useEffect(() => {
//     if (pathname.includes("admin")) {
//       setLoggedInRole("admin");
//     } else if (pathname.includes("center")) {
//       setLoggedInRole("center");
//     } else if (pathname.includes("account")) {
//       setLoggedInRole("account");
//     } else {
//       setLoggedInRole("executive");
//     }

//     if (userDetails) {
//       setUser_id(userDetails.user_id);
//       setUserData(userDetails);
//     }
//     // console.log("pathname", pathname);
//     if (params?._id) {
//       getOneUser(params?._id);
//     }
//     let userExists = pathname.includes("/" + loggedInRole + "/");

//     // console.log(userExists && !userDetails);
//     if (userExists && !userDetails) {
//       // console.log(userExists && !userDetails);
//       Swal.fire(" ", " Please login first!");
//       window.location.href = "/auth/login";
//     }
//   }, []);

//   // useEffect(() => {
//   //   var user = JSON.parse(localStorage.getItem("userDetails"));
//   //   setUser(user);
//   //   getRoleList();
//   //   if (params?._id) {
//   //     getOneUser(params?._id);
//   //   }
//   //   getCenterNameList();
//   // }, []);

//   useEffect(() => {
//     getCenterNameList();
//     getRoleList();
//   }, []);

//   const getCenterNameList = () => {
//     axios
//       .get("/api/centers/list")
//       .then((response) => {
//         const CenterNameList = response.data;

//         if (Array.isArray(CenterNameList)) {
//           setCenterNameList(
//             CenterNameList.sort((a, b) => {
//               return a.centerName.localeCompare(b.centerName);
//             }),
//           );
//         } else {
//           console.error(
//             "Expected data to be an array but got:",
//             CenterNameList,
//           );
//           setCenterNameList([]);
//         }
//       })
//       .catch((error) => {
//         console.log("Error while getting CenterName List => ", error);
//       });
//   };

//   const getOneUser = (user_id) => {
//     axios
//       .get("/api/users/get/" + user_id)
//       .then((res) => {
//         var roleNew = res.data.roles;
//         //  setEditRoles(res.data.roles)
//         const profile = res.data?.profile || {};

//         setFirstName(res.data?.profile?.firstname);
//         setLastName(res.data?.profile?.lastname);
//         setMobile(res.data?.profile?.mobile);
//         setEmail(res.data?.profile?.email);
//         setSelectedRoles(roleNew);

//         setCenterName(res.data?.profile?.centerName);
//         setCenter_id(res.data?.profile?.center_id);
//       })
//       .catch((err) => {
//         console.log("Error fetching user:", err);
//       });
//   };

//   const handleDropdownToggle = () => {
//     setDropdownOpen(!dropdownOpen);
//   };
//   const handleRoleChange = (role) => {
//     setSelectedRoles((prevSelectedRoles) =>
//       prevSelectedRoles.includes(role)
//         ? prevSelectedRoles.filter((r) => r !== role)
//         : [...prevSelectedRoles, role],
//     );
//   };
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const getRoleList = () => {
//     axios
//       .post("/api/roles/get/list")
//       .then((response) => {
//         let roleList = response.data;

//         console.log("rol list", roleList);

//         setRoleList(
//           roleList.sort((a, b) => {
//             return a.role.localeCompare(b.role);
//           }),
//         );
//       })
//       .catch((err) => console.log("err", err));
//   };

//   const validateForm = () => {
//     let errors = {};
//     let formIsValid = true;

//     if (!firstName) {
//       errors["firstName"] = "This field is mandatory.";
//       formIsValid = false;
//     } else if (!/^[A-Za-z ]{1,15}$/.test(firstName)) {
//       errors["firstName"] =
//         "Special characters not allowed. Max size is 15 characters.";
//       formIsValid = false;
//     }
//     if (!lastName) {
//       errors["lastName"] = "This field is mandatory.";
//       formIsValid = false;
//     } else if (!/^[A-Za-z ]{1,15}$/.test(lastName)) {
//       errors["lastName"] =
//         "Special characters not allowed. Max size is 15 characters.";
//       formIsValid = false;
//     }
//     if (selectedRoles.length === 0 || roleList.length === 0) {
//       errors["role"] = "This field is mandatory.";
//       formIsValid = false;
//     }

//     if (
//       selectedRoles.includes("center-incharge") &&
//       !centerName &&
//       !center_id
//     ) {
//       errors["location"] = "This field is mandatory.";
//       formIsValid = false;
//     }

//     if (!mobile) {
//       errors["mobile"] = "This field is mandatory.";
//       formIsValid = false;
//     } else if (!validator.isNumeric(mobile)) {
//       errors["mobile"] = "Only numerics allowed.";
//       formIsValid = false;
//     } else if (mobile.trim() !== "") {
//       if (!/^\d{10}$/.test(mobile)) {
//         errors["mobile"] = "Please enter a valid 10-digit mobile number";
//         formIsValid = false;
//       }
//     }

//     if (!email) {
//       errors["email"] = "This field is mandatory.";
//       formIsValid = false;
//     } else if (!validator.isEmail(email)) {
//       errors["email"] = "Invalid Email.";
//       formIsValid = false;
//     }

//     setErrors(errors);
//     return formIsValid;
//     console.log("errors", errors);
//   };
//   const rolemap =
//     Array.isArray(role) &&
//     role.map((r) => {
//       r !== "admin";
//       return r;
//     });

//   // const checkRole = params._id && rolemap ;
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (validateForm()) {
//       const formValues = {
//         firstName: firstName,
//         lastName: lastName,
//         mobile: mobile,
//         email: email,
//         role: selectedRoles,
//         centerName: centerName,
//         center_id: center_id,
//         username: "EMAIL",
//         userName: email,
//         status: "active",
//         companyID: 1,
//         password: "Welcome@123",
//         createdBy: user?.user_id,
//       };

//       if (
//         selectedRoles.includes("admin")
//         // selectedRoles.includes("head-csr") ||
//         // selectedRoles.includes("senior-manager") ||
//         // selectedRoles.includes("head-livelihood")
//       ) {
//         delete formValues.centerName;
//         delete formValues.center_id;
//       } else {
//         formValues.centerName = centerName;
//         formValues.center_id = center_id;
//       }

//       if (editUser) {
//         axios
//           .patch("/api/users/patch/user/" + params?._id, formValues)
//           .then((res) => {
//             // console.log("res", res);
//             Swal.fire(" ", "User updated successfully");
//             setLoading(true);
//             {
//               loggedInRole === "admin"
//                 ? (window.location.href = "/admin/user-management")
//                 : loggedInRole === "account"
//                   ? (window.location.href =
//                       "/" +
//                       loggedInRole +
//                       "/utilization-management/utilization-list")
//                   : (window.location.href = "/" + loggedInRole + "/dashboard");
//             }
//           })
//           .catch((err) => {
//             console.error("Error updating user:", err);
//             Swal.fire(" ", "Error updating user:");
//           });
//       } else {
//         axios
//           .post("/api/users/post/user", formValues)
//           .then((res) => {
//             if (res.data.success) {
//               setLoading(true);
//               Swal.fire(" ", "User added successfully").then(() => {
//                 router.push("/admin/user-management");
//               });
//             } else {
//               Swal.fire(" ", res.data.message);
//             }
//           })
//           .catch((err) => {
//             console.error("Error creating user:", err);
//             Swal.fire(" ", "Error creating user:");
//           });
//       }
//     }
//   };

//   return (
//     <section className="section">
//       <div className="box border-2 rounded-md shadow-md h-auto">
//         <div className="uppercase text-xl font-semibold">
//           <div className="border-b-2 border-gray-300">
//             <h1 className="heading">{editUser ? "Update " : "Create "}User</h1>
//           </div>
//         </div>
//         <div className="flex">
//           <form
//             className="mx-10 lg:mx-auto w-full lg:w-3/4 mt-8"
//             onSubmit={handleSubmit}
//           >
//             <div className="grid gap-4 mb-2 md:grid-cols-2 lg:grid-cols-2 max-w-5xl">
//               {/* <div className="mb-4">
//                 <label htmlFor="role" className="inputLabel">
//                   Role <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <GoProjectRoadmap className="icon" />
//                     </span>
//                   </div>

//                   <select
//                     className={`${errors.role && " "} stdSelectField py-1
//   ${role ? "selectOption" : "font-normal text-gray-400"}`}
//                     id="role"
//                     name="role"
//                     disabled={user?.user_id == params?._id}
//                     value={role}
//                     onChange={(e) => {
//                       setRole(e.target.value);
//                     }}
//                     placeholder="Role"
//                   >
//                     <option value="" disabled className="text-gray-400">
//                       -- Select Role --
//                     </option>
//                     {roleList &&
//                       roleList.map((item, index) => {
//                         return (
//                           <option
//                             key={index}
//                             value={item.role}
//                             className="text-black"
//                           >
//                             {item.role}
//                           </option>
//                         );
//                       })}
//                   </select>
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.role}
//                 </div>
//               </div>{console.log("role =>", role[0])} */}
//               {loggedInRole === "admin" && (
//                 <div
//                   className="col-span-full sm:col-span-1 relative "
//                   ref={dropdownRef}
//                 >
//                   <label htmlFor="role" className="inputLabel py-1">
//                     Role<i className="text-red-500"> *</i>
//                   </label>
//                   <div className="relative mt-2 rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                       <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                         <IoPersonOutline className="icon" />
//                       </span>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={handleDropdownToggle}
//                       className={` stdSelectField font-normal text-left
//                                     ${
//                                       role
//                                         ? "selectOption"
//                                         : "font-normal text-[#333]"
//                                     }
//                         `}
//                     >
//                       <span className="text-[#999]">
//                         {selectedRoles.length > 0 ? (
//                           <span className="text-[#333] pr-3">
//                             {" "}
//                             {selectedRoles.join(", ")}{" "}
//                           </span>
//                         ) : (
//                           <span className="text-[#999]">-- Select Role --</span>
//                         )}
//                       </span>

//                       <svg
//                         className="w-5 h-5 ml-2 mr-1 float-right"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </button>
//                     {dropdownOpen && (
//                       <div className="origin-top-right absolute right-0  w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
//                         <div className=" max-h-60 overflow-y-auto">
//                           {roleList.map((item, index) => (
//                             <label
//                               key={index}
//                               className="flex items-center px-4 py-2 text-sm text-[#333] font-normal hover:bg-gray-100 cursor-pointer"
//                             >
//                               <input
//                                 type="checkbox"
//                                 value={item.role}
//                                 checked={selectedRoles.includes(item.role)}
//                                 onChange={() => handleRoleChange(item.role)}
//                                 className="h-4 w-4 text-headerBtn border-gray-300 rounded focus:ring-[#00ACDB]"
//                               />

//                               <span className="ml-2 text-[#333]">
//                                 {item.role}
//                               </span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   <div
//                     className="text-red-500"
//                     style={{ fontSize: "12px", fontWeight: "normal" }}
//                   >
//                     {errors?.role}
//                   </div>
//                 </div>
//               )}
//               {/* {!selectedRoles.includes("admin") ? ( */}
//               <div className="mb-4">
//                 <label className="inputLabel" htmlFor="centerName">
//                   Center{" "}
//                   {selectedRoles.includes("center-incharge") ? (
//                     <i className="text-red-500"> *</i>
//                   ) : (
//                     ""
//                   )}
//                 </label>
//                 <div className="relative rounded-md mt-2 shadow-sm text-gray-500">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <PiBuildingOffice className="icon" />
//                     </span>
//                   </div>
//                   <select
//                     className={`${errors.centerName && " "} stdSelectField

//                   ${centerName ? "selectOption" : "font-normal text-gray-400"}
//                  `}
//                     name="centerName"
//                     id="centerName"
//                     disabled={
//                       user?.user_id == params?._id && loggedInRole !== "admin"
//                     }
//                     value={center_id ? `${center_id}|${centerName}` : ""}
//                     onChange={(e) => {
//                       const [selectedCenter_id, selectedCenterName] =
//                         e.target.value.split("|");
//                       setCenterName(selectedCenterName);

//                       setCenter_id(selectedCenter_id);

//                       setError((prevState) => ({
//                         ...prevState,
//                         centerNameError: "",
//                       }));
//                     }}
//                   >
//                     <option value="" disabled className="text-gray-400">
//                       -- Select Location --
//                     </option>
//                     {centerNameList?.map((center, i) => (
//                       <option
//                         className="text-black"
//                         key={i}
//                         value={`${center._id}|${center.centerName}`}
//                       >
//                         {center.centerName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.location}
//                 </div>
//               </div>
//               {/* ) : (
//                 ""
//               )} */}
//               <div className="mb-4">
//                 <label htmlFor="first-name" className="inputLabel">
//                   First Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <IoPersonOutline className="icon" />
//                     </span>
//                   </div>
//                   <input
//                     type="text"
//                     name="firstName"
//                     id="firstName"
//                     value={firstName}
//                     className={
//                       errors.firstName ? "stdInputField" : "stdInputField"
//                     }
//                     placeholder="First Name"
//                     onChange={(e) => {
//                       setFirstName(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.firstName}
//                 </div>
//               </div>
//               <div className="mb-4">
//                 <label htmlFor="last-name" className="inputLabel">
//                   Last Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <IoPersonOutline className="icon" />
//                     </span>
//                   </div>
//                   <input
//                     type="text"
//                     name="lastName"
//                     id="lastName"
//                     value={lastName}
//                     className={
//                       errors.lastName ? "stdInputField" : "stdInputField"
//                     }
//                     placeholder="Last Name"
//                     onChange={(e) => {
//                       setLastName(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.lastName}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label htmlFor="mobile" className="inputLabel">
//                   Mobile No <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <CiMobile3 className="icon" />
//                     </span>
//                   </div>
//                   <input
//                     type="text"
//                     name="mobile"
//                     id="mobile"
//                     maxLength={10}
//                     value={mobile}
//                     className={
//                       errors.mobile ? "stdInputField" : "stdInputField"
//                     }
//                     placeholder="Mobile No"
//                     onChange={(e) => {
//                       setMobile(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.mobile}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label htmlFor="email" className="inputLabel">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                     <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
//                       <HiOutlineMail className="icon" />
//                     </span>
//                   </div>
//                   <input
//                     type="text"
//                     name="email"
//                     id="email"
//                     value={email}
//                     className={errors.email ? "stdInputField" : "stdInputField"}
//                     placeholder="Email ID"
//                     onChange={(e) => {
//                       setEmail(e.target.value.trim());
//                     }}
//                   />
//                 </div>
//                 <div
//                   className="text-red-500"
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "normal",
//                   }}
//                 >
//                   {errors.email}
//                 </div>
//               </div>
//             </div>
//             <div className="flex w-full justify-end mb-4 lg:mt-4">
//               <button
//                 type="submit"
//                 className="formButtons hover:bg-Green lg:hover:bg-Green"
//               >
//                 {loading && editUser ? (
//                   <span>
//                     Update
//                     <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
//                   </span>
//                 ) : loading ? (
//                   <span>
//                     Submit
//                     <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
//                   </span>
//                 ) : (
//                   button
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CreateUserForm;

//github code
"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import validator from "validator";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";

import Swal from "sweetalert2";

import { useParams } from "next/navigation";

import { IoPersonOutline } from "react-icons/io5";
import { GoProjectRoadmap } from "react-icons/go";
import { CiMobile3 } from "react-icons/ci";
import { PiBuildingOffice } from "react-icons/pi";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
import { HiOutlineMail } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

const CreateUserForm = (props) => {
  const params = useParams();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [editRoles, setEditRoles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [editUser, setEditUser] = useState(params?._id ? true : false);
  const [user, setUser] = useState();
  const [roleList, setRoleList] = useState([]);
  const [centerNameList, setCenterNameList] = useState([]);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState([]);
  const [centerName, setCenterName] = useState("");
  const [center_id, setCenter_id] = useState("");
  const [loggedInRole, setLoggedInRole] = useState("");
  const [user_id, setUser_id] = useState();
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true }),
  );
  const [userData, setUserData] = useState();
  const [isClick, setIsClick] = useState(false);
  const pathname = usePathname();
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    role: "",
    centerName: "",
    center_id: "",
  });
  const [loading, setLoading] = useState(false);

  const button = editUser ? "Update" : "Submit";

  useEffect(() => {
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
    } else if (pathname.includes("account")) {
      setLoggedInRole("account");
    } else {
      setLoggedInRole("executive");
    }

    if (userDetails) {
      setUser_id(userDetails.user_id);
      setUserData(userDetails);
    }
    // console.log("pathname", pathname);
    if (params?._id) {
      getOneUser(params?._id);
    }
    let userExists = pathname.includes("/" + loggedInRole + "/");

    // console.log(userExists && !userDetails);
    if (userExists && !userDetails) {
      // console.log(userExists && !userDetails);
      Swal.fire(" ", " Please login first!");
      window.location.href = "/auth/login";
    }
  }, []);

  // useEffect(() => {
  //   var user = JSON.parse(localStorage.getItem("userDetails"));
  //   setUser(user);
  //   getRoleList();
  //   if (params?._id) {
  //     getOneUser(params?._id);
  //   }
  //   getCenterNameList();
  // }, []);

  useEffect(() => {
    getCenterNameList();
    getRoleList();
  }, []);

  const getCenterNameList = () => {
    axios
      .get("/api/centers/list")
      .then((response) => {
        const CenterNameList = response.data;

        if (Array.isArray(CenterNameList)) {
          setCenterNameList(
            CenterNameList.sort((a, b) => {
              return a.centerName.localeCompare(b.centerName);
            }),
          );
        } else {
          console.error(
            "Expected data to be an array but got:",
            CenterNameList,
          );
          setCenterNameList([]);
        }
      })
      .catch((error) => {
        console.log("Error while getting CenterName List => ", error);
      });
  };

  const getOneUser = (user_id) => {
    axios
      .get("/api/users/get/" + user_id)
      .then((res) => {
        var roleNew = res.data.roles;
        // console.log("roleNew --->", res.data?.profile);

        //  setEditRoles(res.data.roles)
        const profile = res.data?.profile || {};

        setFirstName(res.data?.profile?.firstname);
        setLastName(res.data?.profile?.lastname);
        setMobile(res.data?.profile?.mobile);
        setEmail(res.data?.profile?.email);
        setSelectedRoles(roleNew);

        setCenterName(res.data?.profile?.centerName);
        setCenter_id(res.data?.profile?.center_id);
      })
      .catch((err) => {
        console.log("Error fetching user:", err);
      });
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const handleRoleChange = (role) => {
    setSelectedRoles((prevSelectedRoles) =>
      prevSelectedRoles.includes(role)
        ? prevSelectedRoles.filter((r) => r !== role)
        : [...prevSelectedRoles, role],
    );
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getRoleList = () => {
    axios
      .post("/api/roles/get/list")
      .then((response) => {
        let roleList = response.data;

        console.log("rol list", roleList);

        setRoleList(
          roleList.sort((a, b) => {
            return a.role.localeCompare(b.role);
          }),
        );
      })
      .catch((err) => console.log("err", err));
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    if (!firstName) {
      errors["firstName"] = "This field is mandatory.";
      formIsValid = false;
    } else if (!/^[A-Za-z ]{1,15}$/.test(firstName)) {
      errors["firstName"] =
        "Special characters not allowed. Max size is 15 characters.";
      formIsValid = false;
    }
    if (!lastName) {
      errors["lastName"] = "This field is mandatory.";
      formIsValid = false;
    } else if (!/^[A-Za-z ]{1,15}$/.test(lastName)) {
      errors["lastName"] =
        "Special characters not allowed. Max size is 15 characters.";
      formIsValid = false;
    }
    if (selectedRoles.length === 0 || roleList.length === 0) {
      errors["role"] = "This field is mandatory.";
      formIsValid = false;
    }

    if (
      (selectedRoles.includes("center-incharge") ||
        selectedRoles.includes("asset-incharge")) &&
      !centerName &&
      !center_id
    ) {
      errors["location"] = "This field is mandatory.";
      formIsValid = false;
    }

    if (!mobile) {
      errors["mobile"] = "This field is mandatory.";
      formIsValid = false;
    } else if (!validator.isNumeric(mobile)) {
      errors["mobile"] = "Only numerics allowed.";
      formIsValid = false;
    } else if (mobile.trim() !== "") {
      if (!/^\d{10}$/.test(mobile)) {
        errors["mobile"] = "Please enter a valid 10-digit mobile number";
        formIsValid = false;
      }
    }

    if (!email) {
      errors["email"] = "This field is mandatory.";
      formIsValid = false;
    } else if (!validator.isEmail(email)) {
      errors["email"] = "Invalid Email.";
      formIsValid = false;
    }

    setErrors(errors);
    return formIsValid;
    console.log("errors", errors);
  };
  const rolemap =
    Array.isArray(role) &&
    role.map((r) => {
      r !== "admin";
      return r;
    });

  // const checkRole = params._id && rolemap ;
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formValues = {
        firstName: firstName,
        lastName: lastName,
        mobile: mobile,
        email: email,
        role: selectedRoles,
        centerName: centerName,
        center_id: center_id,
        username: "EMAIL",
        userName: email,
        status: "active",
        companyID: 1,
        password: "Welcome@123",
        createdBy: user?.user_id,
      };

      if (
        selectedRoles.includes("admin")
        // selectedRoles.includes("head-csr") ||
        // selectedRoles.includes("senior-manager") ||
        // selectedRoles.includes("head-livelihood")
      ) {
        delete formValues.centerName;
        delete formValues.center_id;
      } else {
        formValues.centerName = centerName;
        formValues.center_id = center_id;
      }

      if (editUser) {
        axios
          .patch("/api/users/patch/user/" + params?._id, formValues)
          .then((res) => {
            // console.log("res", res);
            Swal.fire(" ", "User updated successfully");
            setLoading(true);
            {
              loggedInRole === "admin"
                ? (window.location.href = "/admin/user-management")
                : loggedInRole === "account"
                  ? (window.location.href =
                    "/" +
                    loggedInRole +
                    "/utilization-management/utilization-list")
                  : (window.location.href = "/" + loggedInRole + "/dashboard");
            }
          })
          .catch((err) => {
            console.error("Error updating user:", err);
            Swal.fire(" ", "Error updating user:");
          });
      } else {
        axios
          .post("/api/users/post/user", formValues)
          .then((res) => {
            if (res.data.success) {
              setLoading(true);
              Swal.fire(" ", "User added successfully").then(() => {
                router.push("/admin/user-management");
              });
            } else {
              Swal.fire(" ", res.data.message);
            }
          })
          .catch((err) => {
            console.error("Error creating user:", err);
            Swal.fire(" ", "Error creating user:");
          });
      }
    }
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md h-auto">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300">
            <h1 className="heading">{editUser ? "Update " : "Create "}User</h1>
          </div>
        </div>
        <div className="flex">
          <form
            className="mx-10 lg:mx-auto w-full lg:w-3/4 mt-8"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 mb-2 md:grid-cols-2 lg:grid-cols-2 max-w-5xl">
              {/* <div className="mb-4">
                <label htmlFor="role" className="inputLabel">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <GoProjectRoadmap className="icon" />
                    </span>
                  </div>

                  <select
                    className={`${errors.role && " "} stdSelectField py-1 
  ${role ? "selectOption" : "font-normal text-gray-400"}`}
                    id="role"
                    name="role"
                    disabled={user?.user_id == params?._id}
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                    }}
                    placeholder="Role"
                  >
                    <option value="" disabled className="text-gray-400">
                      -- Select Role --
                    </option>
                    {roleList &&
                      roleList.map((item, index) => {
                        return (
                          <option
                            key={index}
                            value={item.role}
                            className="text-black"
                          >
                            {item.role}
                          </option>
                        );
                      })}
                  </select>
                </div>
                <div
                  className="text-red-500"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {errors.role}
                </div>
              </div>{console.log("role =>", role[0])} */}
              {loggedInRole === "admin" && (
                <div
                  className="col-span-full sm:col-span-1 relative "
                  ref={dropdownRef}
                >
                  <label htmlFor="role" className="inputLabel py-1">
                    Role<i className="text-red-500"> *</i>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <IoPersonOutline className="icon" />
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDropdownToggle}
                      className={` stdSelectField font-normal text-left
                                    ${role
                          ? "selectOption"
                          : "font-normal text-[#333]"
                        }
                        `}
                    >
                      <span className="text-[#999]">
                        {selectedRoles.length > 0 ? (
                          <span className="text-[#333] pr-3">
                            {" "}
                            {selectedRoles.join(", ")}{" "}
                          </span>
                        ) : (
                          <span className="text-[#999]">-- Select Role --</span>
                        )}
                      </span>

                      <svg
                        className="w-5 h-5 ml-2 mr-1 float-right"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {dropdownOpen && (
                      <div className="origin-top-right absolute right-0  w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className=" max-h-60 overflow-y-auto">
                          {roleList.map((item, index) => (
                            <label
                              key={index}
                              className="flex items-center px-4 py-2 text-sm text-[#333] font-normal hover:bg-gray-100 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={item.role}
                                checked={selectedRoles.includes(item.role)}
                                onChange={() => handleRoleChange(item.role)}
                                className="h-4 w-4 text-headerBtn border-gray-300 rounded focus:ring-[#00ACDB]"
                              />

                              <span className="ml-2 text-[#333]">
                                {item.role}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {errors?.role}
                  </div>
                </div>
              )}

              {loggedInRole === "account" || loggedInRole === "executive" && (
                <div className="col-span-full sm:col-span-1 relative ">
                  <label htmlFor="role" className="inputLabel py-1">
                    Role
                  </label>
                  <div>
                    <span className="text-[#333] pr-3">{" "}{selectedRoles.join(", ")}{" "}</span>
                  </div>
                </div>
              )}

              {/* {!selectedRoles.includes("admin") ? ( */}
              <div className="mb-4">
                <label className="inputLabel" htmlFor="centerName">
                  Center{" "}
                  {selectedRoles.includes("center-incharge") ||
                  selectedRoles.includes("asset-incharge") ? (
                    <i className="text-red-500"> *</i>
                  ) : (
                    ""
                  )}
                </label>
                <div className="relative rounded-md mt-2 shadow-sm text-gray-500">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <PiBuildingOffice className="icon" />
                    </span>
                  </div>
                  <select
                    className={`${errors.centerName && " "} stdSelectField

                  ${centerName ? "selectOption" : "font-normal text-gray-400"}
                 `}
                    name="centerName"
                    id="centerName"
                    disabled={
                      user?.user_id == params?._id && loggedInRole !== "admin"
                    }
                    value={center_id ? `${center_id}|${centerName}` : ""}
                    onChange={(e) => {
                      const [selectedCenter_id, selectedCenterName] =
                        e.target.value.split("|");
                      setCenterName(selectedCenterName);

                      setCenter_id(selectedCenter_id);

                      setError((prevState) => ({
                        ...prevState,
                        centerNameError: "",
                      }));
                    }}
                  >
                    <option value="" disabled className="text-gray-400">
                      -- Select Location --
                    </option>
                    {centerNameList?.map((center, i) => (
                      <option
                        className="text-black"
                        key={i}
                        value={`${center._id}|${center.centerName}`}
                      >
                        {center.centerName}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className="text-red-500"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {errors.location}
                </div>
              </div>
              {/* ) : (
                ""
              )} */}
              <div className="mb-4">
                <label htmlFor="first-name" className="inputLabel">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <IoPersonOutline className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={firstName}
                    className={
                      errors.firstName ? "stdInputField" : "stdInputField"
                    }
                    placeholder="First Name"
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                  />
                </div>
                <div
                  className="text-red-500"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {errors.firstName}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="last-name" className="inputLabel">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <IoPersonOutline className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={lastName}
                    className={
                      errors.lastName ? "stdInputField" : "stdInputField"
                    }
                    placeholder="Last Name"
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                  />
                </div>
                <div
                  className="text-red-500"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {errors.lastName}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="mobile" className="inputLabel">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <CiMobile3 className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="mobile"
                    id="mobile"
                    maxLength={10}
                    value={mobile}
                    className={
                      errors.mobile ? "stdInputField" : "stdInputField"
                    }
                    placeholder="Mobile No"
                    onChange={(e) => {
                      setMobile(e.target.value);
                    }}
                  />
                </div>
                <div
                  className="text-red-500"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {errors.mobile}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="inputLabel">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <HiOutlineMail className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    value={email}
                    className={errors.email ? "stdInputField" : "stdInputField"}
                    placeholder="Email ID"
                    onChange={(e) => {
                      setEmail(e.target.value.trim());
                    }}
                  />
                </div>
                <div
                  className="text-red-500"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {errors.email}
                </div>
              </div>
            </div>
            <div className="flex w-full justify-end mb-4 lg:mt-4">
              <button
                type="submit"
                className="formButtons hover:bg-Green lg:hover:bg-Green"
              >
                {loading && editUser ? (
                  <span>
                    Update
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                  </span>
                ) : loading ? (
                  <span>
                    Submit
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                  </span>
                ) : (
                  button
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateUserForm;
