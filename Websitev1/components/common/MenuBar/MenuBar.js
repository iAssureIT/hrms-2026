"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Axios from "axios";
import Swal from "sweetalert2";

function MenuBar(props) {
  const [isOpen, setIsOpen] = useState(false);

  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [menuItems, setmenuItems] = useState([]);
  const [menuItemsAfterLogin, setmenuItemsAfterLogin] = useState([]);
  const [userData, setUserData] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setmenuItems(props.menuItemsList);
    setmenuItemsAfterLogin(props.menuItemsAfterLoginList);
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      const parseUser_id = userDetailsParse.user_id;
      setUserData(userDetailsParse);
    }
    // console.log("pathname",pathname);

    let userExists = pathname.includes("/user/");
    // console.log("userExists",userExists,"userDetails",!userDetails,"userData",userData);
    if (userExists && !userDetails) {
      Swal.fire("Please login first!", "", "warning");
      window.location.href = "/auth/login";
    }
  }, []);
  const loginPage = () => {
    window.location.href = "/auth/login";
  };

  // console.log("userData", userData);

  const signOut = (event) => {
    event.preventDefault();
    var formValues = {
      user_id: userData.user_id,
      token: userData.token,
    };
    // console.log("signOut formValues = ",formValues);

    Axios.post("/api/auth/post/logout", formValues)
      .then((logoutResp) => {
        // console.log("logoutResp => ", logoutResp.data.data.modifiedCount);
        if (logoutResp.data.data.modifiedCount === 1) {
          var token = localStorage.removeItem("userDetails");
          Swal.fire({
            title: "Thank You.",
            text: "You have been logged out Successfully!",
            icon: "success",
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonColor: "#0d2342",
            confirmButtonText: "Ok!",
          });

          if (token === "undefined") {
            // this.setState({ loggedIn: false })
          }
          window.location.href = "/";
          window.location.assign("/");
        }
      })
      .catch((error) => {
        var token = localStorage.removeItem("userDetails");
        Swal.fire({
          title: "Thank You.",
          text: "You have been logged out Successfully!",
          icon: "success",
          showCancelButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonColor: "#0d2342",
          confirmButtonText: "Ok!",
        });
        if (token === "undefined") {
          // this.setState({ loggedIn: false })
        }
        window.location.href = "/";
        window.location.assign("/");
      });
  };
  return (
    <div className="bg-white">
      <nav className="flex h-24 justify-between flex-wrap px-6 md:px-6 py-6 bg-white">
        <div className="items-center h-18 flex-shrink-0 text-white ">
          <a href="/">
            <img
              src={"/images/specific/Logo.jpg"}
              className="h-12 w-60 xl:w-60 xs:w-48 pl-4"
              alt="Logo"
            />
          </a>
        </div>
        <div className="block   lg:hidden">
          {userData ? (
            <div className=" flex flex-wrap items-center">
              <button
                onClick={() => setIsOpen2(!isOpen2)}
                type="button"
                className="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                id="user-menu-button"
                aria-expanded="false"
                data-dropdown-toggle="user-dropdown"
                data-dropdown-placement="bottom"
              >
                {/* <span className="sr-only">Open user menu</span> */}
                <img
                  className="w-8 h-8 rounded-full"
                  src="/images/specific/profile_1.jpeg"
                  alt="user photo"
                />
              </button>

              <div
                className={`${
                  isOpen2 ? "block" : "hidden"
                } z-50 absolute  top-32 right-4 `}
                id="user-dropdown"
              >
                <div
                  className="w-0 h-0 mx-auto
                   border-l-[10px] border-l-transparent
                   border-b-[10px] border-b-white-500
                   border-r-[10px] border-r-transparent
 
                   shadow-2xl shadow-black-500/50"
                ></div>

                <div className="w-60 xs:w-48 p-4 text-base list-none bg-white divide-y divide-gray-100 shadow-2xl shadow-black-500/50 border border-gray-200 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600">
                  <div className="flex container">
                    <div className=" mx-auto flex-wrap flex p-2 ">
                      <img
                        className="w-12 h-8 rounded-full mx-auto"
                        src="/images/specific/profile_1.jpeg"
                        alt="user photo"
                      />
                    </div>
                    <div className=" px-1 py-3  flex-wrap flex overflow-hidden ellipsis">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {userData.firstName}&nbsp;{userData.lastName}
                      </div>

                      <div className="text-sm  text-gray-500 truncate dark:text-gray-400">
                        {userData.email}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <a
                      className="block  py-2 text-sm text-gray-900  dark:hover:bg-blue-600 dark:text-gray-200 dark:hover:text-white"
                      href="/user/dashboard"
                    >
                      Dashboard
                    </a>
                  </div>

                  <ul className="py-2" aria-labelledby="user-menu-button">
                    <li>
                      <button
                        className="block mx-auto px-4 py-2 text-sm text-gray-300  bg-blue-900 hover:text-gray-100 hover:bg-blue-600 dark:hover:bg-blue-600 dark:text-gray-200 dark:hover:text-white"
                        onClick={signOut}
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="items-center m-2">
              <button
                onClick={loginPage}
                className="text-blue hover:hover:text-blue-800  "
              >
                <i className="fa-solid fa-right-to-bracket"></i>
              </button>
            </div>
          )}
        </div>

        <div className="block  lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center px-3 py-2 rounded text-black-500 hover:text-black-400"
          >
            <svg
              className={`fill-current h-3 w-3 ${isOpen ? "hidden" : "block"}`}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
            <svg
              className={`fill-current h-3 w-3 ${isOpen ? "block" : "hidden"}`}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
            </svg>
          </button>
        </div>
        <div
          className={`w-full block h-8 py-4 flex-wrap lg:flex lg:items-right float-right
                        lg:w-auto ${isOpen ? "block" : "hidden"}`}
        >
          <div className="text-sm lg:flex lg:flex-wrap h-8">
            {userData ? (
              <ul
                id="navBar"
                className=" text-xs xxl:text-lg font-semibold flex flex-col p-4 md:p-0 mt-4 border float-right border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700"
              >
                {menuItemsAfterLogin.map((data, index) => {
                  return (
                    <li key={index}>
                      <a
                        href={data.link}
                        className="menuText"
                        aria-current="page"
                      >
                        {data.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul
                id="navBar"
                className=" text-xs xxl:text-lg font-semibold flex flex-col p-4 md:p-0 mt-4 border float-right border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700"
              >
                {menuItems.map((data, index) => {
                  return (
                    <li key={index}>
                      <a
                        href={data.link}
                        className="menuText"
                        aria-current="page"
                      >
                        {data.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        {userData ? (
          <div className="hidden  lg:block flex flex-wrap items-center md:order-2 px-8">
            <div
              title={userData.firstName + " " + userData.lastName}
              className="flex container cursor-pointer"
              onClick={() => setIsOpen1(!isOpen1)}
            >
              <button
                type="button"
                className="flex flex-wrap m-2 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                id="user-menu-button"
                aria-expanded="false"
                data-dropdown-toggle="user-dropdown"
                data-dropdown-placement="bottom"
              >
                {/* <span className="sr-only">Open user menu</span> */}
                <img
                  className="w-8 h-8 rounded-full"
                  src="/images/specific/profile_1.jpeg"
                  alt="user photo"
                />
              </button>
              <div className="flex flex-wrap m-2">
                {" "}
                {userData.firstName}&nbsp;{userData.lastName}
              </div>
              <div className="flex flex-wrap">
                {isOpen1 ? (
                  <i className="fa-solid fa-caret-up mt-3"></i>
                ) : (
                  <i className="fa-solid fa-caret-down mt-3"></i>
                )}
              </div>
            </div>

            <div
              className={`${
                isOpen1 ? "block" : "hidden"
              } z-50 absolute  top-32 right-4 `}
              id="user-dropdown"
            >
              <div
                className="w-0 h-0 mx-auto
                  border-l-[20px] border-l-transparent
                  border-b-[20px] border-b-white-500
                  border-r-[20px] border-r-transparent

                  shadow-2xl shadow-black-500/50"
              ></div>

              <div className="w-60 p-4 text-base list-none bg-white divide-y divide-gray-100 shadow-2xl shadow-black-500/50 border border-gray-200 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600">
                <div className="flex container">
                  <div className=" mx-auto flex-wrap flex p-2 ">
                    <img
                      className="w-12 h-8 rounded-full mx-auto"
                      src="/images/specific/profile_1.jpeg"
                      alt="user photo"
                    />
                  </div>
                  <div className=" px-1 py-3  flex-wrap flex overflow-hidden ellipsis">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {userData.firstName}&nbsp;{userData.lastName}
                    </div>

                    <div className="text-sm  text-gray-500 truncate dark:text-gray-400">
                      {userData.email}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <a
                    className="block  py-2 text-sm text-gray-900  dark:hover:bg-blue-600 dark:text-gray-200 dark:hover:text-white"
                    href="/user/dashboard"
                  >
                    Dashboard
                  </a>
                </div>

                <ul className="py-2" aria-labelledby="user-menu-button">
                  <li>
                    <button
                      className="block rounded-lg mx-auto px-2 py-1 text-medium text-gray-300  bg-blue-900 hover:text-gray-100 hover:bg-blue-600 dark:hover:bg-blue-600 dark:text-gray-200 dark:hover:text-white"
                      onClick={signOut}
                    >
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:block flex flex-wrap items-center md:order-2 m-2">
            <button
              onClick={loginPage}
              className=" hover:bg-skyBlue text-white bg-lightBlue hover:bg-blue-800  focus:ring-4 focus:ring-blue-300 font-sm rounded text-smpx-5 py-2 px-5 dark:bg-blue-600 float-right dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              LOGIN
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
export default MenuBar;
