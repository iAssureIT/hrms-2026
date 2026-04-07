import React, { useRef, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import { FaBars } from "react-icons/fa";

const Navbar = ({ navbarData, profileMenus, onItemClick, open, setOpen }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState();
  const [isClick, setIsClick] = useState(false);
  const menuRef = useRef();
  const imgRef = useRef();
  const pathname = usePathname();

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
    const userDetails = localStorage.getItem("userDetails");

    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      setUserData(userDetailsParse);
    }

    let userExists = pathname.includes("/user/");

    if (userExists && !userDetails) {
      Swal.fire("Please login first!", "", "warning");
      window.location.href = "/auth/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userDetails");
    window.location.href = "/auth/login";
  };

  return (
    <section className="bg-green text-black h-[52px]">
      <div className="flex h-full justify-between">
        <div className="">
          <FaBars
            className={`text-white text-lg font-semibold cursor-pointer fixed mt-5 ms-5 z-50`}
            onClick={() => setOpen((prevOpen) => !prevOpen)}
          />
        </div>

        <div className="relative h-full">
          <div className="flex h-full">
            <ul className="flex h-full">
              {navbarData.slice(0, 2).map((menu, index) => (
                <li
                  key={index}
                  className={`mt-1 lg:mt-0 cursor-pointer flex-shrink-0 hidden lg:inline-flex pt-4 hover:bg-gray-600 ${
                    !open && "inline-flex"
                  }`}
                >
                  {menu.title}
                </li>
              ))}
              <li
                className=" cursor-pointer flex-shrink-0 inline-flex h-full hover:bg-gray-600 pt-4"
                onClick={handleProfileClick}
              >
                <Image
                  ref={imgRef}
                  src={navbarData[0].image}
                  alt="profile Image"
                  className="bg-white h-8 w-8 -mt-1 rounded-full cursor-pointer inline-flex"
                />
                <div className="text-sm font-semibold ps-1 ms-1 mt-1 pe-2">
                  {userData?.firstName ? userData?.firstName : "Username"}{" "}
                  {userData?.lastName ? userData?.lastName : ""}
                </div>
              </li>
            </ul>
          </div>
          {profileOpen && (
            <span
              ref={menuRef}
              className="bg-white text-black shadow-lg w-full absolute left-0 lg:left-0 top-12 mt-1.5"
            >
              <ul>
                {/* Render profile image */}
                <li className="flex pt-1 cursor-pointer justify-center bg-gray-700 lg:pb-1">
                  <span className=" mt-1 text-gray-700 rounded-full">
                    <Image
                      src={profileMenus[0].image}
                      alt="Profile"
                      className="rounded-full h-12 w-12  lg:mt-2"
                    />
                  </span>
                </li>

                {/* Render name */}
                <li className="flex pb-1 text-md font-semibold justify-center bg-gray-700 ">
                  <span className="text-white">
                    {userData?.firstName ? userData?.firstName : "Username"}{" "}
                    {userData?.lastName ? userData?.lastName : ""}
                  </span>
                </li>

                {profileMenus.slice(1).map((menu, index) => (
                  <li
                    onClick={handleLogout}
                    className="flex p-1 text-md cursor-pointer justify-center rounded hover:bg-gray-200 bg-gray-100"
                  >
                    <span className="mt-1 text-red-400">{menu.icon}</span>
                    <span className="text-red-400">{menu.title}</span>
                  </li>
                ))}
              </ul>
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default Navbar;

// import React, { useRef, useState, useCallback, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import Swal from "sweetalert2";
// import Image from "next/image";

// const HeaderView = ({ navbarData, profileMenus }) => {
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [userData, setUserData] = useState();
//   const [isClick, setIsClick] = useState(false);
//   const menuRef = useRef();
//   const imgRef = useRef();
//   const pathname = usePathname();

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
//     const userDetails = localStorage.getItem("userDetails");
//     console.log("userdetails =>", userDetails);
//     if (userDetails) {
//       const userDetailsParse = JSON.parse(userDetails);
//       setUserData(userDetailsParse);
//       console.log("userDetailsParse =>", userDetailsParse);
//       console.log("user First name =>", userDetailsParse.firstName);
//     }
//     console.log("pathname =>", pathname);

//     let userExists = pathname.includes("/user/");
//     console.log(
//       "userExists",
//       userExists,
//       "userDetails",
//       !userDetails,
//       "userData",
//       userData
//     );
//     if (userExists && !userDetails) {
//       Swal.fire("Please login first!", "", "warning");
//       window.location.href = "/auth/login";
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("userDetails");
//     window.location.href = "/auth/login";
//   };

//   return (
//     <section className="bg-green text-white h-[52px]">
//       <div className="flex  h-full">
//         <div className="w-6/12 lg:w-4/5"></div>

//         <div className="w-6/12 lg:w-1/5  relative flex justify-between h-full">
//           <div className="flex h-full ">
//             <ul className="flex h-full">
//               {navbarData.slice(0, 2).map((menu, index) => (
//                 <li
//                   key={index}
//                   className="px-1 flex-shrink-0 inline-flex pt-4 text-xl"
//                 >

//                 </li>
//               ))}
//               <li
//                 className="px-1 lg:px-1  flex-shrink-0 inline-flex h-full  pt-4"
//                 onClick={handleProfileClick}
//               >
//                 <Image
//                   ref={imgRef}
//                   src={navbarData[2].image}
//                   alt="profile Image"
//                   className="bg-black h-8 w-8 -mt-1 rounded-full cursor-pointer inline-flex"
//                 />
//                 <div className="text-sm ps-1 ms-1 mt-1 cursor-pointer">
//                   {userData?.firstName ? userData?.firstName : "Username"}{" "}
//                   {userData?.lastName ? userData?.lastName : "lastname"}
//                 </div>
//               </li>
//             </ul>
//           </div>
//           {profileOpen && (
//             <span
//               ref={menuRef}
//               className="bg-white text-black w-44 lg:w-52 shadow-lg absolute left-0 lg:left-2 top-12 lg:top-13"
//             >
//               <ul>
//                 <li className="flex pt-1 cursor-pointer px-4 justify-center lg:px-1 bg-gray-700 lg:pb-1">
//                   <span className="mr-2 lg:mr-3 mt-1 text-gray-700 rounded-full">
//                     <Image
//                       src={profileMenus[0].image}
//                       alt="Profile"
//                       className="rounded-full h-12 w-12  lg:mt-2"
//                     />
//                   </span>
//                 </li>

//                 <li className="flex pb-1 text-md font-semibold px-4 justify-center lg:px-1 bg-gray-700 ">
//                   <span className="mr-2 lg:mr-3 text-white">
// {userData?.firstName ? userData?.firstName : "Username"}{" "}
// {userData?.lastName ? userData?.lastName : "lastname"}
//                   </span>
//                 </li>
//                 <li className="flex pb-1 lg:text-sm md:text-sm text-xs font-semibold px-4 justify-center lg:px-1 bg-gray-700 ">
//                   <div className="mr-2  text-white">
//                     {userData?.email ? userData?.email : "email"}
//                   </div>
//                 </li>
//                 {profileMenus.slice(3).map((menu, index) => (
//                   <li
//                     onClick={handleLogout}
//                     className="flex p-1 text-md cursor-pointer rounded hover:bg-gray-200 ps-1 lg:ps-2 bg-gray-100"
//                   >
//                     <span className="mr-2 ms-2 lg:mr-2 mt-1 text-red-800">
//                       {menu.icon}
//                     </span>
//                     <span className="text-red-800">{menu.title}</span>
//                   </li>
//                 ))}
//               </ul>
//             </span>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeaderView;
