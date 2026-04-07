// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faBars,
//   faGlobe,
//   faUserShield,
//   faUser,
//   faBell,
//   faSignOut,
// } from "@fortawesome/free-solid-svg-icons";
// import { useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import axios from "axios";
// import "react-tooltip/dist/react-tooltip.css";
// import { Modal } from "flowbite-react";
// import { MdClose } from "react-icons/md";
// import { Tooltip } from "react-tooltip";
// import Link from "next/link";
// import Swal from "sweetalert2";
// import ls from "localstorage-slim";

// const HeaderView = ({ handleCallback }) => {
//   const pathname = usePathname();
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true })
//   );
//   const [user, setUser] = useState();
//   const [user_id, setUser_id] = useState();
//   const [open, setOpen] = useState(false);
//   const [logoutModal, setLogoutModal] = useState(false);
//   const [userData, setUserData] = useState("");

//   useEffect(() => {
//     if (pathname.includes("admin")) {
//       setLoggedInRole("admin");
//     } else if (pathname.includes("center")) {
//       setLoggedInRole("center");
//     } else {
//       setLoggedInRole("executive");
//     }

//     if (userDetails) {
//       setUser_id(userDetails?.user_id);
//       setUserData(userDetails);
//     }
//     // console.log("userData", userData);

//     let userExists =
//       pathname.includes("admin") ||
//       pathname.includes("center") ||
//       pathname.includes("executive");

//     if (userExists && !userDetails) {
//       Swal.fire(" ", " Please login first!");
//       window.location.href = "/auth/login";
//     }
//   }, []);

//   // useEffect(() => {
//   //   var user = ls.get("userDetails", { decrypt: true });
//   //   setUser(user);
//   //   console.log("user => ", user);
//   // }, [1]);

//   const logOut = () => {
//     var formValues = {
//       user_id: userData.user_id,
//       token: userData.token,
//     };
//     // console.log("signOut formValues = ",formValues);

//     axios
//       .post("/api/auth/post/logout", formValues)
//       .then((logoutResp) => {
//         if (logoutResp.data.data.modifiedCount === 1) {
//           ls.remove("userDetails");
//           Swal.fire({
//             title: "",
//             text: "You have been logged out Successfully!",
//           });
//           window.location.href = "/";
//           window.location.assign("/");
//         }
//       })
//       .catch((error) => {
//         Swal.fire({
//           title: " ",
//           text: "Some Problem Occured During Logout. Please contact System Admin!",
//         });
//       });
//   };

//   const handleDrawer = (open) => {
//     setOpen(open);
//     handleCallback(open);
//   };

//   return (
//     <div className="bg-green p-2 flex items-center w-full border-b-2">
//       <FontAwesomeIcon
//         className="w-5 h-5 ms-6 rounded cursor-pointer justify-end mr-8 p-2 text-white border border-white transition-all duration-500"
//         icon={faBars}
//         color="#fff"
//         onClick={() => handleDrawer(!open)}
//       />

//       <div className="ml-auto pr-2">
//         {/* <FontAwesomeIcon  className='w-6 h-6 cursor-pointer justify-end mr-8 p-2'  icon={faBell} color='#fff' onClick={()=>setOpen(!open)}/>  */}
//         <FontAwesomeIcon
//           className="w-5 h-5 cursor-pointer rounded justify-end border p-2"
//           id="clickable"
//           data-tooltip-place="top"
//           icon={faUser}
//           color="#fff"
//           onClick={() => setOpen(!open)}
//         />
//       </div>
//       <hr />
//       <Tooltip
//         anchorSelect="#clickable"
//         place="bottom"
//         effect="solid"
//         className="tooltip "
//         style={{ zIndex: 99 }}
//         clickable
//       >
//         <div className="flex items-center">
//           {/* User image and details */}
//           <div className="rounded-full mr-4">
//             {/* <img src={userData.img} alt="User Profile" className="w-12 h-12" /> */}
//             <FontAwesomeIcon
//               className="w-10 h-10 cursor-pointers rounded-full bg-green justify-end border  p-2"
//               data-tip
//               data-for="userTooltip"
//               icon={faUser}
//               color="#fff"
//               onClick={() => setOpen(!open)}
//             />
//           </div>
//           <div>
//             <div className="font-bold">
//               {userData?.firstName + " " + userData?.lastName}
//             </div>
//             <div>{userData?.email}</div>
//           </div>
//         </div>
//         {/* Buttons */}
//         <div className="mt-4 flex justify-between">
//           {/* <div className="mt-4 flex"> */}
//           {/* My Profile button */}
//           {/* <img src="profile-icon.png" alt="My Profile" className="w-4 h-4 mr-2" /> */}
//           {/* 
//             <Link href='/profile'><button className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-full mr-2" >
//               <FontAwesomeIcon  className="object-cover md:rounded-none md:rounded-s-lg" height={50} width={50} icon={faUser} color='#fff' onClick={()=>setOpen(!open)}/> 
//                 My Profile
//               </button>
//             </Link> */}

//           {/* Sign Out button */}
//           {/* <button className="flex items-center float-end bg-red-500 text-white py-2 px-4 rounded-full" onClick={()=>logOut()}> */}
//           <button
//             className="items-center mr-2 float-end bg-green hover:bg-Green lg:hover:bg-Green text-white py-2 px-4 rounded-full"
//             onClick={
//               () =>
//                 (window.location.href =
//                   "/" +
//                   loggedInRole +
//                   "/user-management/create-user/" +
//                   user_id)
//               // window.location.assign("/user/user-management/create-user/"+user_id)
//             }
//           >
//             My Profile
//           </button>
//           <button
//             className="items-center float-end bg-green hover:bg-Green lg:hover:bg-Green
//              text-white py-2 px-4 rounded-full"
//             onClick={() => logOut()}
//           >
//             <FontAwesomeIcon
//               className="object-cover md:rounded-none md:rounded-s-lg"
//               height={50}
//               width={50}
//               icon={faSignOut}
//               color="#fff"
//             />
//             Sign Out
//           </button>
//         </div>
//       </Tooltip>

//       <Modal
//         show={logoutModal}
//         size="md"
//         closable={true}
//         dismissible
//         onClose={() => {
//           setLogoutModal(false);
//           window.location.href = "/";
//           window.location.assign("/");
//         }}
//         popup
//       >
//         <Modal.Header className="modalHeader justify-end">
//           <div
//             className="modalCloseButton"
//             onClick={() => {
//               setLogoutModal(false);
//               window.location.href = "/";
//               window.location.assign("/");
//             }}
//           >
//             <MdClose className="icon text-white font-medium" />
//           </div>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="modalBody">
//             <h3 className="modalText">
//               You have been logged out Successfully!
//             </h3>
//             <div className="flex justify-center gap-4">
//               <button
//                 className="modalSuccessBtn"
//                 onClick={() => {
//                   setLogoutModal(false);
//                   window.location.href = "/";
//                   window.location.assign("/");
//                 }}
//               >
//                 Ok
//               </button>
//             </div>
//           </div>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default HeaderView;



//Nehas code
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faGlobe,
  faUserShield,
  faUser,
  faBell,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import "react-tooltip/dist/react-tooltip.css";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import Swal from "sweetalert2";
import ls from "localstorage-slim";

const HeaderView = ({ handleCallback }) => {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  const [user, setUser] = useState();
  const [user_id, setUser_id] = useState();
  const [open, setOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [userData, setUserData] = useState("");

  useEffect(() => {
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
    } else {
      setLoggedInRole("executive");
    }

    if (userDetails) {
      setUser_id(userDetails?.user_id);
      setUserData(userDetails);
    }
    // console.log("userData", userData);

    let userExists =
      pathname.includes("admin") ||
      pathname.includes("center") ||
      pathname.includes("executive");

    if (userExists && !userDetails) {
      Swal.fire(" ", " Please login first!");
      window.location.href = "/auth/login";
    }
  }, []);

  // useEffect(() => {
  //   var user = ls.get("userDetails", { decrypt: true });
  //   setUser(user);
  //   console.log("user => ", user);
  // }, [1]);

  const logOut = () => {
    var formValues = {
      user_id: userData.user_id,
      token: userData.token,
    };
    // console.log("signOut formValues = ",formValues);

    axios
      .post("/api/auth/post/logout", formValues)
      .then((logoutResp) => {
        if (logoutResp.data.data.modifiedCount === 1) {
          ls.remove("userDetails");
          Swal.fire({
            title: "",
            text: "You have been logged out Successfully!",
          });
          window.location.href = "/";
          window.location.assign("/");
        }
      })
      .catch((error) => {
        Swal.fire({
          title: " ",
          text: "Some Problem Occured During Logout. Please contact System Admin!",
        });
      });
  };

  const handleDrawer = (open) => {
    setOpen(open);
    handleCallback(open);
  };

  return (
    <div className="bg-green px-3 py-1 flex items-center w-full border-b-2">
      <FontAwesomeIcon
  className="ms-6 mr-8 text-white border border-white p-2 flex items-center justify-center"
  icon={faBars}
  onClick={() => handleDrawer(!open)}
/>

      <div className="ml-auto pr-2">
        {/* <FontAwesomeIcon  className='w-6 h-6 cursor-pointer justify-end mr-8 p-2'  icon={faBell} color='#fff' onClick={()=>setOpen(!open)}/>  */}
        <FontAwesomeIcon
          className="w-5 h-5 cursor-pointer rounded justify-end border p-2"
          id="clickable"
          data-tooltip-place="top"
          icon={faUser}
          color="#fff"
          onClick={() => setOpen(!open)}
        />
      </div>
      <hr />
      <Tooltip
        anchorSelect="#clickable"
        place="bottom"
        effect="solid"
        className="tooltip "
        style={{ zIndex: 99 }}
        clickable
      >
        <div className="flex items-center">
          {/* User image and details */}
          <div className="rounded-full mr-4">
            {/* <img src={userData.img} alt="User Profile" className="w-12 h-12" /> */}
            <FontAwesomeIcon
              className="w-10 h-10 cursor-pointers rounded-full bg-green justify-end border  p-2"
              data-tip
              data-for="userTooltip"
              icon={faUser}
              color="#fff"
              onClick={() => setOpen(!open)}
            />
          </div>
          <div>
            <div className="font-bold">
              {userData?.firstName + " " + userData?.lastName}
            </div>
            <div>{userData?.email}</div>
          </div>
        </div>
        {/* Buttons */}
        <div className="mt-4 flex justify-between">
          {/* <div className="mt-4 flex"> */}
          {/* My Profile button */}
          {/* <img src="profile-icon.png" alt="My Profile" className="w-4 h-4 mr-2" /> */}
          {/* 
            <Link href='/profile'><button className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-full mr-2" >
              <FontAwesomeIcon  className="object-cover md:rounded-none md:rounded-s-lg" height={50} width={50} icon={faUser} color='#fff' onClick={()=>setOpen(!open)}/> 
                My Profile
              </button>
            </Link> */}

          {/* Sign Out button */}
          {/* <button className="flex items-center float-end bg-red-500 text-white py-2 px-4 rounded-full" onClick={()=>logOut()}> */}
          <button
            className="items-center mr-2 float-end bg-green hover:bg-Green lg:hover:bg-Green text-white py-2 px-4 rounded-full"
            onClick={
              () =>
                (window.location.href =
                  "/" +
                  loggedInRole +
                  "/user-management/create-user/" +
                  user_id)
              // window.location.assign("/user/user-management/create-user/"+user_id)
            }
          >
            My Profile
          </button>
          <button
            className="items-center float-end bg-green hover:bg-Green lg:hover:bg-Green
             text-white py-2 px-4 rounded-full"
            onClick={() => logOut()}
          >
            <FontAwesomeIcon
              className="object-cover md:rounded-none md:rounded-s-lg"
              height={50}
              width={50}
              icon={faSignOut}
              color="#fff"
            />
            Sign Out
          </button>
        </div>
      </Tooltip>

      <Modal
        show={logoutModal}
        size="md"
        closable={true}
        dismissible
        onClose={() => {
          setLogoutModal(false);
          window.location.href = "/";
          window.location.assign("/");
        }}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => {
              setLogoutModal(false);
              window.location.href = "/";
              window.location.assign("/");
            }}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">
              You have been logged out Successfully!
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => {
                  setLogoutModal(false);
                  window.location.href = "/";
                  window.location.assign("/");
                }}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HeaderView;
