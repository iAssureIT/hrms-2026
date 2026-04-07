// "use client";

// import React, { useRef, useState, useCallback, useEffect } from "react";
// import axios from "axios";
// import { usePathname } from "next/navigation";
// import Swal from "sweetalert2";
// import Image from "next/image";
// import { FaBars } from "react-icons/fa";
// import ls from "localstorage-slim";

// const Navbar = ({ navbarData, profileMenus, onItemClick, setOpen }) => {
//   const pathname = usePathname();
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [selectedRole, setSelectedRole] = useState("");
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true })
//   );
//   const [availableRoles, setAvailableRoles] = useState([]);
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [userData, setUserData] = useState();
//   const [isClick, setIsClick] = useState(false);
//   const [user_id, setUser_id] = useState();
//   const menuRef = useRef();
//   const imgRef = useRef();

//   const toggleNavbar = useCallback(() => {
//     setIsClick(!isClick);
//   }, [isClick]);

//   const handleProfileClick = useCallback(
//     (e) => {
//       e.stopPropagation();
//       setProfileOpen(!profileOpen);
//     },
//     [profileOpen]
//   );

//   const handleClickOutside = useCallback((e) => {
//     if (e.target !== menuRef.current && e.target !== imgRef.current) {
//       setProfileOpen(false);
//     }
//   }, []);

//   useEffect(() => {
//     window.addEventListener("click", handleClickOutside);
//     return () => {
//       window.removeEventListener("click", handleClickOutside);
//     };
//   }, [handleClickOutside]);
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
//     // console.log("pathname", pathname);
//   }, [pathname]);

//   useEffect(() => {
//     if (userDetails) {
//       setUser_id(userDetails?.user_id);
//       setUserData(userDetails);
//     }
//     let userExists = pathname.includes("/" + loggedInRole + "/");

//     // console.log(userDetails, availableRoles);
//     if (userDetails && !userDetails) {
//       // console.log(userExists && !userDetails);
//       Swal.fire(" ", " Please login first!");
//       window.location.href = "/auth/login";
//     }
//     if (userDetails?.roles?.length > 0 && loggedInRole) {
//       let mappedRole = null;

//       if (loggedInRole === "executive") {
//         // Match with one of the userDetails.roles
//         const execRoles = [
//           "head-csr",
//           "head-livelihood",
//           "senior-manager",
//           "ho-person",
//         ];
//         const matchedRole = userDetails.roles.find((r) =>
//           execRoles.includes(r)
//         );

//         mappedRole = matchedRole; // fallback
//       } else {
//         const roleMap = {
//           admin: "admin",
//           center: "center-incharge",
//           account: "account-person",
//         };
//         mappedRole = roleMap[loggedInRole] || loggedInRole;
//       }

//       setSelectedRole(mappedRole);

//       const otherRoles = userDetails.roles.filter(
//         (role) => role !== mappedRole
//       );
//       setAvailableRoles(otherRoles);
//     }
//   }, [userDetails, loggedInRole]);

//   const handleRoleSwitch = (role) => {
//     // console.log("role in handleswitch", role);
//     setSelectedRole(role);

//     switch (role) {
//       case "admin":
//         window.location.replace("/admin/dashboard");
//         break;
//       case "center-incharge":
//         window.location.replace("/center/dashboard");
//         break;
//       case "account-person":
//         window.location.replace(
//           "/account/utilization-management/utilization-list"
//         );
//         break;
//       case "senior-manager":
//         window.location.replace("/executive/dashboard");
//         break;
//       case "head-csr":
//         window.location.replace("/executive/dashboard");
//         break;
//       case "head-livelihood":
//         window.location.replace("/executive/dashboard");
//         break;
//       case "ho-person":
//         window.location.replace("/executive/dashboard");
//         break;
//       default:
//         window.location.replace("/dashboard"); // fallback if needed
//     }
//   };

//   // New Logout and handle profile
//   const handleLogout = () => {
//     var formValues = {
//       user_id: userData.user_id,
//       token: userData.token,
//     };

//     axios
//       .post("/api/auth/post/logout", formValues)
//       .then((logoutResp) => {
//         var token = ls.remove("userDetails");
//         ls.remove("loggedIn");
//         Swal.fire({
//           title: " ",
//           text: "You have been logged out Successfully!",
//           // icon: "success",
//           showCancelButton: false,
//           allowOutsideClick: false,
//           allowEscapeKey: false,
//           confirmButtonText: "Ok!",
//         });

//         if (token === "undefined") {
//         }
//         ls.remove("userDetails");
//         ls.remove("activeIndex");
//         window.location.href = "/auth/login";
//       })
//       .catch((error) => {
//         ls.remove("userDetails");
//         ls.remove("activeIndex");
//         Swal.fire({
//           title: " ",
//           text: "You have been logged out Successfully!",
//           showCancelButton: false,
//           allowOutsideClick: false,
//           allowEscapeKey: false,
//           confirmButtonText: "Ok!",
//         });
//         if (token === "undefined") {
//         }
//         window.location.href = "/auth/login";
//       });
//   };

//   const handleProfile = () => {
//     window.location.href =
//       "/" + loggedInRole + "/user-management/user-profile/" + user_id;
//   };
//   // console.log("userData =>", userData);
//   // console.log("userData.mobile =>", userData.mobile);

//   return (
//     <section className="bg-green text-white h-[52px] z-50">
//       <div className="flex h-full justify-between z-50">
//         <div
//           className="border-2 cursor-pointer m-3 border-white rounded hover:border-gray-50"
//           onClick={() => setOpen((prevOpen) => !prevOpen)}
//         >
//           <FaBars className={`text-white mt-1 mx-1 text-lg font-semibold  `} />
//         </div>
//         {/* {console.log("availableRoles", availableRoles)}
//         {console.log("availableRoles", availableRoles.length)} */}
//         {availableRoles.length > 0 && (
//           <div className="flex items-center gap-2 bg-green-600 p-2 m-1 rounded-md">
//             <span className="text-white font-semibold">Switch Role:</span>
//             {[selectedRole, ...availableRoles].map((role) => {
//               const isActive = selectedRole === role;
//               // console.log("selectedRole", selectedRole);
//               // console.log("role", role);
//               // console.log("isActive", isActive);

//               // Format display
//               const displayRole =
//                 role === "head-csr"
//                   ? "Head CSR"
//                   : role
//                       ?.split("-")
//                       .map(
//                         (word) => word.charAt(0).toUpperCase() + word.slice(1)
//                       )
//                       .join(" ");
//               // console.log("displayRole", displayRole);

//               return (
//                 <button
//                   key={role}
//                   onClick={() => handleRoleSwitch(role)}
//                   className={`capitalize px-4 py-1 rounded-full text-sm font-medium transition duration-200 ${
//                     isActive
//                       ? "bg-white text-green-700 shadow-md cursor-default"
//                       : "bg-green-500 text-white hover:bg-green-400"
//                   }`}
//                   disabled={isActive}
//                 >
//                   {displayRole}
//                 </button>
//               );
//             })}
//           </div>
//         )}

//         <div className="relative h-full ">
//           <div className="flex h-full ">
//             <ul className="flex h-full">
//               {/* {navbarData.slice(0, 2).map((menu, index) => (
//                 <li
//                   key={index}
//                   className={`px-2 lg:px-2.5 cursor-pointer flex-shrink-0 pt-5`}
//                 >
//                   {menu.title}
//                 </li>
//               ))} */}
//               <li
//                 className="cursor-pointer flex-shrink-0 inline-flex h-full hover:bg-Green px-1 pt-3.5 lg:px-2"
//                 onClick={handleProfileClick}
//               >
//                 <Image
//                   ref={imgRef}
//                   src={navbarData[0].image}
//                   alt="profile Image"
//                   className="bg-white h-8 w-8 -mt-1 rounded-full cursor-pointer inline-flex"
//                 />
//                 <div className="text-sm  ps-1 ms-1 pe-2">
//                   {userData?.firstName ? userData?.firstName : "Username"}&nbsp;
//                   {userData?.lastName ? userData?.lastName : ""}
//                 </div>
//               </li>
//             </ul>
//           </div>
//           {profileOpen && (
//             <div
//               ref={menuRef}
//               className="text-black shadow-md absolute right-2 lg:right-2 top-13 mt-1.5 userprofile w-60 lg:w-72"
//             >
//               <ul>
//                 <div className="flex bg-green py-6">
//                   <li className="flex cursor-pointer justify-center">
//                     <span className="rounded-full">
//                       <Image
//                         src={profileMenus[0].image}
//                         alt="Profile"
//                         className="rounded-full h-12 w-12 m-1"
//                       />
//                     </span>
//                   </li>
//                   <li className="px-4 pb-1 text-sm font-semibold text-white mx-auto justify-center content-center align-middle m-3">
//                     <div className="flex mx-auto justify-center content-center align-middle">
//                       {userData?.firstName ? userData?.firstName : "Username"}
//                       &nbsp;
//                       {userData?.lastName ? userData?.lastName : ""}
//                     </div>
//                     <div className="text-xs mx-auto justify-start content-start align-start">
//                       {userData?.email ? userData?.email : "email"}
//                     </div>
//                     <div className="text-xs mx-auto justify-start content-start align-start">
//                       {userDetails?.roles?.length > 0 && (
//                         <p>
//                           Role{userDetails.roles.length > 1 ? "s" : ""}:{" "}
//                           {userDetails.roles
//                             .map((role) =>
//                               role === "head-csr"
//                                 ? "Head CSR"
//                                 : role
//                                     .split("-")
//                                     .map(
//                                       (word) =>
//                                         word.charAt(0).toUpperCase() +
//                                         word.slice(1)
//                                     )
//                                     .join(" ")
//                             )
//                             .join(", ")}
//                         </p>
//                       )}
//                     </div>

//                     <div className="text-xs mx-auto justify-center content-center align-middle">
//                       {/* {userData?.mobile ? userData?.mobile : "Mo.No"} */}
//                     </div>
//                   </li>
//                 </div>

//                 <div className="flex bg-gray-200">
//                   {profileMenus.slice(1, 2).map((menu, index) => (
//                     <li
//                       onClick={() => setProfileOpen(false)}
//                       key={index}
//                       className="cursor-pointer hover:bg-Green bg-white text-gray-700 hover:text-white w-full my-2 mx-4 rounded-sm flex items-center justify-center"
//                     >
//                       <span
//                         className="text-xs font-semibold  py-2"
//                         onClick={handleProfile}
//                       >
//                         {menu.title}
//                       </span>
//                     </li>
//                   ))}

//                   {profileMenus.slice(2, 3).map((menu, index) => (
//                     <li
//                       onClick={handleLogout}
//                       key={index}
//                       className="cursor-pointer text-white bg-green hover:bg-Green w-full mx-4 my-2 rounded-sm flex items-center justify-center"
//                     >
//                       <span
//                         className="text-xs font-semibold  py-2"
//                         onClick={() => onItemClick(menu.link)}
//                       >
//                         {menu.title}
//                       </span>
//                     </li>
//                   ))}
//                 </div>
//                 <div className="flex bg-gray-300">
//                   {profileMenus.slice(3, 4).map((menu, index) => (
//                     <li
//                       onClick={() => setProfileOpen(false)}
//                       key={index}
//                       className="cursor-pointer hover:bg-gray-50 bg-white text-gray-700 hover:text-black w-full mx-4 my-2 rounded-sm flex items-center justify-center"
//                     >
//                       <span
//                         className="text-xs font-semibold  py-2"
//                         onClick={() => onItemClick(menu.link)}
//                       >
//                         {menu.title}
//                       </span>
//                     </li>
//                   ))}

//                   {profileMenus.slice(4, 5).map((menu, index) => (
//                     <li
//                       key={index}
//                       className="cursor-pointer text-white bg-green hover:bg-green w-full my-2 mx-4 rounded-sm flex items-center justify-center"
//                     >
//                       <span
//                         className="text-xs font-semibold py-2"
//                         onClick={() => onItemClick(menu.link)}
//                       >
//                         {menu.title}
//                       </span>
//                     </li>
//                   ))}
//                 </div>
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Navbar;
















//Nehas changes
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import { FaBars } from "react-icons/fa";
import ls from "localstorage-slim";

const Navbar = ({ navbarData, profileMenus, onItemClick, setOpen }) => {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  const [availableRoles, setAvailableRoles] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState();
  const [isClick, setIsClick] = useState(false);
  const [user_id, setUser_id] = useState();
  const menuRef = useRef();
  const imgRef = useRef();

  const toggleNavbar = useCallback(() => {
    setIsClick(!isClick);
  }, [isClick]);

  const handleProfileClick = useCallback(
    (e) => {
      e.stopPropagation();
      setProfileOpen(!profileOpen);
    },
    [profileOpen]
  );

  const handleClickOutside = useCallback((e) => {
    if (e.target !== menuRef.current && e.target !== imgRef.current) {
      setProfileOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);
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
    // console.log("pathname", pathname);
  }, [pathname]);

  useEffect(() => {
    if (userDetails) {
      setUser_id(userDetails?.user_id);
      setUserData(userDetails);
    }
    let userExists = pathname.includes("/" + loggedInRole + "/");

    // console.log(userDetails, availableRoles);
    if (userDetails && !userDetails) {
      // console.log(userExists && !userDetails);
      Swal.fire(" ", " Please login first!");
      window.location.href = "/auth/login";
    }
    if (userDetails?.roles?.length > 0 && loggedInRole) {
      let mappedRole = null;

      if (loggedInRole === "executive") {
        // Match with one of the userDetails.roles
        const execRoles = [
          "head-csr",
          "head-livelihood",
          "senior-manager",
          "ho-person",
        ];
        const matchedRole = userDetails.roles.find((r) =>
          execRoles.includes(r)
        );

        mappedRole = matchedRole; // fallback
      } else {
        const roleMap = {
          admin: "admin",
          center: "center-incharge",
          account: "account-person",
        };
        mappedRole = roleMap[loggedInRole] || loggedInRole;
      }

      setSelectedRole(mappedRole);

      const otherRoles = userDetails.roles.filter(
        (role) => role !== mappedRole
      );
      setAvailableRoles(otherRoles);
    }
  }, [userDetails, loggedInRole]);

  const handleRoleSwitch = (role) => {
    // console.log("role in handleswitch", role);
    setSelectedRole(role);

    switch (role) {
      case "admin":
        window.location.replace("/admin/dashboard");
        break;
      case "center-incharge":
        window.location.replace("/center/dashboard");
        break;
      case "account-person":
        window.location.replace(
          "/account/utilization-management/utilization-list"
        );
        break;
      case "senior-manager":
        window.location.replace("/executive/dashboard");
        break;
      case "head-csr":
        window.location.replace("/executive/dashboard");
        break;
      case "head-livelihood":
        window.location.replace("/executive/dashboard");
        break;
      case "ho-person":
        window.location.replace("/executive/dashboard");
        break;
      default:
        window.location.replace("/dashboard"); // fallback if needed
    }
  };

  // New Logout and handle profile
  const handleLogout = () => {
    var formValues = {
      user_id: userData.user_id,
      token: userData.token,
    };

    axios
      .post("/api/auth/post/logout", formValues)
      .then((logoutResp) => {
        var token = ls.remove("userDetails");
        ls.remove("loggedIn");
        Swal.fire({
          title: " ",
          text: "You have been logged out Successfully!",
          // icon: "success",
          showCancelButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonText: "Ok!",
        });

        if (token === "undefined") {
        }
        ls.remove("userDetails");
        ls.remove("activeIndex");
        window.location.href = "/auth/login";
      })
      .catch((error) => {
        ls.remove("userDetails");
        ls.remove("activeIndex");
        Swal.fire({
          title: " ",
          text: "You have been logged out Successfully!",
          showCancelButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonText: "Ok!",
        });
        if (token === "undefined") {
        }
        window.location.href = "/auth/login";
      });
  };

  const handleProfile = () => {
    window.location.href =
      "/" + loggedInRole + "/user-management/user-profile/" + user_id;
  };
  // console.log("userData =>", userData);
  // console.log("userData.mobile =>", userData.mobile);

  return (
    <section className="bg-green text-white min-h-[52px] h-auto py-1 lg:py-0 z-50">
      <div className="flex h-full justify-between items-center z-50 px-2">
        <div
          className="border-2 cursor-pointer m-1 md:m-3 border-white rounded hover:border-gray-50"
          onClick={() => setOpen((prevOpen) => !prevOpen)}
        >
          <FaBars className={`text-white my-1 mx-1 text-lg font-semibold  `} />
        </div>
        {/* {console.log("availableRoles", availableRoles)}
        {console.log("availableRoles", availableRoles.length)} */}
        {availableRoles.length > 0 && (
          <div className="flex items-center gap-1 md:gap-2 bg-green-600 p-1 md:p-2 m-1 rounded-md">
            <span className="text-white font-semibold hidden md:inline">Switch Role:</span>

            {[selectedRole, ...availableRoles].map((role) => {
              const isActive = selectedRole === role;
              // console.log("selectedRole", selectedRole);
              // console.log("role", role);
              // console.log("isActive", isActive);

              // Format display
              const displayRole =
                role === "head-csr"
                  ? "Head CSR"
                  : role
                      ?.split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ");
              // console.log("displayRole", displayRole);

              return (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`capitalize px-2  md:px-4 py-1 rounded-full text-xs md:text-sm font-medium transition duration-200 ${
                    isActive
                      ? "bg-white text-green-700 shadow-md cursor-default"
                      : "bg-green-500 text-white hover:bg-green-400"
                  }`}
                  disabled={isActive}
                >
                  {displayRole}
                </button>
              );
            })}
          </div>
        )}

        <div className="relative h-full ">
          <div className="flex h-full ">
            <ul className="flex h-full">
              {/* {navbarData.slice(0, 2).map((menu, index) => (
                <li
                  key={index}
                  className={`px-2 lg:px-2.5 cursor-pointer flex-shrink-0 pt-5`}
                >
                  {menu.title}
                </li>
              ))} */}
              <li
                className="cursor-pointer flex-shrink-0 inline-flex h-full hover:bg-Green px-1 pt-3.5 lg:px-2"
                onClick={handleProfileClick}
              >
                <Image
                  ref={imgRef}
                  src={navbarData[0].image}
                  alt="profile Image"
                  className="bg-white h-8 w-8 -mt-1 rounded-full cursor-pointer inline-flex"
                />
                <div className="text-sm ps-1 ms-1 pe-2 hidden sm:block">
  {userData?.firstName ? userData?.firstName : "Username"}&nbsp;
  {userData?.lastName ? userData?.lastName : ""}
</div>

              </li>
            </ul>
          </div>
          {profileOpen && (
            <div
              ref={menuRef}
              className="text-black shadow-md absolute right-2 lg:right-2 top-13 mt-1.5 userprofile w-60 lg:w-72"
            >
              <ul>
                <div className="flex bg-green py-6">
                  <li className="flex cursor-pointer justify-center">
                    <span className="rounded-full">
                      <Image
                        src={profileMenus[0].image}
                        alt="Profile"
                        className="rounded-full h-12 w-12 m-1"
                      />
                    </span>
                  </li>
                  <li className="px-4 pb-1 text-sm font-semibold text-white mx-auto justify-center content-center align-middle m-3">
                    <div className="flex mx-auto justify-center content-center align-middle">
                      {userData?.firstName ? userData?.firstName : "Username"}
                      &nbsp;
                      {userData?.lastName ? userData?.lastName : ""}
                    </div>
                    <div className="text-xs mx-auto justify-start content-start align-start">
                      {userData?.email ? userData?.email : "email"}
                    </div>
                    <div className="text-xs mx-auto justify-start content-start align-start">
                      {userDetails?.roles?.length > 0 && (
                        <p>
                          Role{userDetails.roles.length > 1 ? "s" : ""}:{" "}
                          {userDetails.roles
                            .map((role) =>
                              role === "head-csr"
                                ? "Head CSR"
                                : role
                                    .split("-")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")
                            )
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="text-xs mx-auto justify-center content-center align-middle">
                      {/* {userData?.mobile ? userData?.mobile : "Mo.No"} */}
                    </div>
                  </li>
                </div>

                <div className="flex bg-gray-200">
                  {profileMenus.slice(1, 2).map((menu, index) => (
                    <li
                      onClick={() => setProfileOpen(false)}
                      key={index}
                      className="cursor-pointer hover:bg-Green bg-white text-gray-700 hover:text-white w-full my-2 mx-4 rounded-sm flex items-center justify-center"
                    >
                      <span
                        className="text-xs font-semibold  py-2"
                        onClick={handleProfile}
                      >
                        {menu.title}
                      </span>
                    </li>
                  ))}

                  {profileMenus.slice(2, 3).map((menu, index) => (
                    <li
                      onClick={handleLogout}
                      key={index}
                      className="cursor-pointer text-white bg-green hover:bg-Green w-full mx-4 my-2 rounded-sm flex items-center justify-center"
                    >
                      <span
                        className="text-xs font-semibold  py-2"
                        onClick={() => onItemClick(menu.link)}
                      >
                        {menu.title}
                      </span>
                    </li>
                  ))}
                </div>
                <div className="flex bg-gray-300">
                  {profileMenus.slice(3, 4).map((menu, index) => (
                    <li
                      onClick={() => setProfileOpen(false)}
                      key={index}
                      className="cursor-pointer hover:bg-gray-50 bg-white text-gray-700 hover:text-black w-full mx-4 my-2 rounded-sm flex items-center justify-center"
                    >
                      <span
                        className="text-xs font-semibold  py-2"
                        onClick={() => onItemClick(menu.link)}
                      >
                        {menu.title}
                      </span>
                    </li>
                  ))}

                  {profileMenus.slice(4, 5).map((menu, index) => (
                    <li
                      key={index}
                      className="cursor-pointer text-white bg-green hover:bg-green w-full my-2 mx-4 rounded-sm flex items-center justify-center"
                    >
                      <span
                        className="text-xs font-semibold py-2"
                        onClick={() => onItemClick(menu.link)}
                      >
                        {menu.title}
                      </span>
                    </li>
                  ))}
                </div>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Navbar;
