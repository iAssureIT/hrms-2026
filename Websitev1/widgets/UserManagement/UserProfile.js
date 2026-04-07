// "use client";
// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import validator from "validator";
// import { usePathname } from "next/navigation";
// import { Tooltip } from "flowbite-react";
// import { FaRegListAlt } from "react-icons/fa";
// import { CiViewList } from "react-icons/ci";
// import { MdOutlineEdit } from "react-icons/md";
// import Swal from "sweetalert2";
// import ls from "localstorage-slim";

// import { useParams } from "next/navigation";
// import { useRouter } from "next/navigation";
// import { FaSpinner } from "react-icons/fa";

// const UserProfile = (props) => {
//   const params = useParams();
//   const router = useRouter();
//   const dropdownRef = useRef(null);
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true })
//   );
//   const [userData, setUserData] = useState();
//   const [isClick, setIsClick] = useState(false);
//   const pathname = usePathname();
//   const menuRef = useRef();
//   const imgRef = useRef();
//   //   const [editRoles, setEditRoles] = useState([]);
//   //   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   //   const [editUser, setEditUser] = useState(params?._id ? true : false);
//   const [user, setUser] = useState();
//   //   const [roleList, setRoleList] = useState([]);

//   //   const [error, setError] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [email, setEmail] = useState("");
//   const [location, setLocation] = useState("");
//   const [user_id, setUser_id] = useState();
//   //   const [role, setRole] = useState([]);

//   //   const [errors, setErrors] = useState({
//   //     firstName: "",
//   //     lastName: "",
//   //     mobile: "",
//   //     email: "",
//   //     role: "",
//   //     location: "",
//   //     center_id: "",
//   //   });
//   const [loading, setLoading] = useState(true);
//   const [loading2, setLoading2] = useState(false);

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
//       setUser_id(userDetails?.user_id);
//       setUserData(userDetails);
//     }
//     // console.log("pathname", pathname);
//     getOneUser(params?._id);
//     let userExists = pathname.includes("/" + loggedInRole + "/");

//     // console.log(userExists && !userDetails);
//     if (userExists && !userDetails) {
//       // console.log(userExists && !userDetails);
//       Swal.fire(" ", " Please login first!");
//       window.location.href = "/auth/login";
//     }
//   }, []);
//   //   useEffect(() => {
//   //     var user = JSON.parse(localStorage.getItem("userDetails"));
//   //     setUser(user);

//   //     if (params?._id) {
//   //       getOneUser(params?._id);
//   //     }

//   //   }, []);

//   const getOneUser = (user_id) => {
//     axios
//       .get("/api/users/get/" + user_id)
//       .then((res) => {
//         var roleNew = res.data.roles;

//         const profile = res.data?.profile || {};

//         setFirstName(res.data?.profile?.firstname);
//         setLastName(res.data?.profile?.lastname);
//         setMobile(res.data?.profile?.mobile);
//         setEmail(res.data?.profile?.email);
//         setSelectedRoles(roleNew);
//         setLocation(res.data?.profile?.centerName);

//         setLoading(false);
//       })
//       .catch((err) => {
//         console.log("Error fetching user:", err);
//       });
//   };

//   return (
//     <section className="pt-16 flex justify-center">
//       <div className="box border-2 rounded-md shadow-md  w-3/5">
//         <div className="uppercase text-xl font-semibold">
//           {/* <div className="flex justify-between border-b-2 border-gray-300 rounded-tl rounded-tr" style={{ background: 'linear-gradient(to right,#00ACDB ,#E3F4FC)' }}>
//             <h1 className="heading">User Profile</h1>
//             <Tooltip content="User List" className="custom-tooltip">
//                   <div className="">
//                   <FaRegListAlt 
//                   className="text-2xl text-gray-500 hover:cursor-pointer hover:text-headerBtn"
//                   onClick={() => {router.push("/user/user-management")}}
//                   />
//                   </div>
//                 </Tooltip>
//           </div> */}
//           <div className="uppercase text-xl font-semibold">
//             <div className="border-b-2 border-gray-300 flex bg-green justify-between rounded-tl rounded-tr">
//               <h1 className="heading text-white">User Profile</h1>
//               <div className="gap-3 my-5 me-10">
//                 <Tooltip
//                   content="Edit User"
//                   placement="bottom"
//                   className="bg-green mt-5"
//                   arrow={false}
//                 >
//                   {loading2 ? (
//                     <FaSpinner className="animate-spin text-center text-white  inline-flex mx-2" />
//                   ) : (
//                     <MdOutlineEdit
//                       className="cursor-pointer text-gray-200 hover:text-white border border-gray-200 p-0.5 hover:border-white rounded text-[30px]"
//                       // onClick={() => {
//                       //   setLoading2(true);
//                       //   router.push(
//                       //     "/" +
//                       //       loggedInRole +
//                       //       "/user-management/profile/" +
//                       //       params._id
//                       //   );
//                       // }}
//                       onClick={() => {
//                         window.open(
//                           `/${loggedInRole}/user-management/profile/${params._id}`,
//                           '_self'
//                           // "noopener,noreferrer"
//                         );
//                       }}

//                     />
//                   )}
//                 </Tooltip>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="flex">
//           <form className="mx-10 lg:mx-auto w-full lg:w-3/4 mt-8">
//             <div className="grid gap-4 mb-2 md:grid-cols-1 lg:grid-cols-1 max-w-5xl">
//               <div className="mb-4">
//                 <div className="text-center heading">
//                   {loading ? (
//                     <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
//                   ) : firstName && lastName ? (
//                     `${firstName} ${lastName}`
//                   ) : (
//                     "N.A."
//                   )}
//                 </div>
//                 <div className="border-b-2"></div>
//               </div>
//             </div>
//             <div className="grid gap-4 mt-5 mb-2 md:grid-cols-2 lg:grid-cols-2 max-w-5xl">
//               <div className="mb-4 text-center">
//                 <label htmlFor="email" className="inputLabel">
//                   Email
//                 </label>
//                 <div>
//                   {loading ? (
//                     <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
//                   ) : email ? (
//                     email
//                   ) : (
//                     "N.A."
//                   )}
//                 </div>
//               </div>
//               <div className="mb-4 text-center">
//                 <label htmlFor="mobile" className="inputLabel">
//                   Mobile No
//                 </label>
//                 <div>
//                   {loading ? (
//                     <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
//                   ) : mobile ? (
//                     mobile
//                   ) : (
//                     "N.A."
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="grid gap-4 mt-10 mb-2 md:grid-cols-2 lg:grid-cols-2 max-w-5xl">
//               <div className="mb-4 text-center">
//                 <label htmlFor="mobile" className="inputLabel">
//                   Location
//                 </label>
//                 <div>
//                   {loading ? (
//                     <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
//                   ) : location ? (
//                     location
//                   ) : (
//                     "N.A."
//                   )}
//                 </div>
//               </div>
//               <div className="mb-4 text-center">
//                 <label htmlFor="role" className="inputLabel py-1">
//                   Role
//                 </label>
//                 <div>
//                   {loading ? (
//                     <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
//                   ) : selectedRoles ? (
//                     selectedRoles.join(", ")
//                   ) : (
//                     "N.A."
//                   )}
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default UserProfile;








//Nehas code
"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import validator from "validator";
import { usePathname } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { FaRegListAlt } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";
import { MdOutlineEdit } from "react-icons/md";
import Swal from "sweetalert2";
import ls from "localstorage-slim";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

const UserProfile = (props) => {
  const params = useParams();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  const [userData, setUserData] = useState();
  const [isClick, setIsClick] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef();
  const imgRef = useRef();
  //   const [editRoles, setEditRoles] = useState([]);
  //   const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  //   const [editUser, setEditUser] = useState(params?._id ? true : false);
  const [user, setUser] = useState();
  //   const [roleList, setRoleList] = useState([]);

  //   const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [user_id, setUser_id] = useState();
  //   const [role, setRole] = useState([]);

  //   const [errors, setErrors] = useState({
  //     firstName: "",
  //     lastName: "",
  //     mobile: "",
  //     email: "",
  //     role: "",
  //     location: "",
  //     center_id: "",
  //   });
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);

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
      setUser_id(userDetails?.user_id);
      setUserData(userDetails);
    }
    // console.log("pathname", pathname);
    getOneUser(params?._id);
    let userExists = pathname.includes("/" + loggedInRole + "/");

    // console.log(userExists && !userDetails);
    if (userExists && !userDetails) {
      // console.log(userExists && !userDetails);
      Swal.fire(" ", " Please login first!");
      window.location.href = "/auth/login";
    }
  }, []);
  //   useEffect(() => {
  //     var user = JSON.parse(localStorage.getItem("userDetails"));
  //     setUser(user);

  //     if (params?._id) {
  //       getOneUser(params?._id);
  //     }

  //   }, []);

  const getOneUser = (user_id) => {
    axios
      .get("/api/users/get/" + user_id)
      .then((res) => {
        var roleNew = res.data.roles;

        const profile = res.data?.profile || {};

        setFirstName(res.data?.profile?.firstname);
        setLastName(res.data?.profile?.lastname);
        setMobile(res.data?.profile?.mobile);
        setEmail(res.data?.profile?.email);
        setSelectedRoles(roleNew);
        setLocation(res.data?.profile?.centerName);

        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching user:", err);
      });
  };

  return (
    <section className="md:pt-16 flex justify-center">

      <div className="box border-2 rounded-md shadow-md w-full md:w-3/5">

        <div className="uppercase text-xl font-semibold">
          {/* <div className="flex justify-between border-b-2 border-gray-300 rounded-tl rounded-tr" style={{ background: 'linear-gradient(to right,#00ACDB ,#E3F4FC)' }}>
            <h1 className="heading">User Profile</h1>
            <Tooltip content="User List" className="custom-tooltip">
                  <div className="">
                  <FaRegListAlt 
                  className="text-2xl text-gray-500 hover:cursor-pointer hover:text-headerBtn"
                  onClick={() => {router.push("/user/user-management")}}
                  />
                  </div>
                </Tooltip>
          </div> */}
          <div className="uppercase text-xl font-semibold">
            <div className="border-b-2 border-gray-300 flex bg-green justify-between rounded-tl rounded-tr">
              <h1 className="heading text-white">User Profile</h1>
              <div className="gap-3 my-5 me-10">
                <Tooltip
                  content="Edit User"
                  placement="bottom"
                  className="bg-green mt-5"
                  arrow={false}
                >
                  {loading2 ? (
                    <FaSpinner className="animate-spin text-center text-white  inline-flex mx-2" />
                  ) : (
                    <MdOutlineEdit
                      className="cursor-pointer text-gray-200 hover:text-white border border-gray-200 p-0.5 hover:border-white rounded text-[30px]"
                      // onClick={() => {
                      //   setLoading2(true);
                      //   router.push(
                      //     "/" +
                      //       loggedInRole +
                      //       "/user-management/profile/" +
                      //       params._id
                      //   );
                      // }}
                      onClick={() => {
                        window.open(
                          `/${loggedInRole}/user-management/profile/${params._id}`,
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
        </div>
        <div className="flex">
          <form className="mx-10 lg:mx-auto w-full lg:w-3/4 mt-8">

            <div className="grid gap-4 mb-2 md:grid-cols-1 lg:grid-cols-1 max-w-5xl">
              <div className="mb-4">
                <div className="text-center heading">
                  {loading ? (
                    <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                  ) : firstName && lastName ? (
                    `${firstName} ${lastName}`
                  ) : (
                    "N.A."
                  )}
                </div>
                <div className="border-b-2"></div>
              </div>
            </div>
            <div className="grid gap-2 sm:gap-4 mt-5 mb-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-5xl">

              <div className="mb-4 text-center">


                <label htmlFor="email" className="inputLabel text-center sm:text-center mb-1 sm:mb-2">

                  Email
                </label>
                <div>
                  {loading ? (
                    <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                  ) : email ? (
                    email
                  ) : (
                    "N.A."
                  )}
                </div>
              </div>
              <div className="mb-4 text-center">

                <label htmlFor="mobile" className="inputLabel mb-2">

                  Mobile No
                </label>
                <div>
                  {loading ? (
                    <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                  ) : mobile ? (
                    mobile
                  ) : (
                    "N.A."
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:gap-4 mt-10 mb-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-5xl">

              <div className="mb-4 text-center">


                <label htmlFor="mobile" className="inputLabel mb-2">
                  Location
                </label>
                <div>
                  {loading ? (
                    <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                  ) : location ? (
                    location
                  ) : (
                    "N.A."
                  )}
                </div>
              </div>
            <div className="mb-4 text-center">


                <label htmlFor="role" className="inputLabel mb-2">
                  Role
                </label>
                <div>
                  {loading ? (
                    <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                  ) : selectedRoles ? (
                    selectedRoles.join(", ")
                  ) : (
                    "N.A."
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
