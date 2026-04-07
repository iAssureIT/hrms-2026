"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { MdClose } from "react-icons/md";
import { Button, Modal } from "flowbite-react";
import {
  Card,
  Typography,
  Tooltip,
  IconButton,
  Checkbox,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, KeyIcon } from "@heroicons/react/24/solid";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import Swal from "sweetalert2";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { SlBookOpen } from "react-icons/sl";
import { FaSearch } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

import {
  faEye,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import validator from "validator";

export default function UserManagement() {
  const AddRole = dynamic(() => import("@/widgets/UserManagement/AddRole"), {
    ssr: false,
  });
  const AddEmployee = dynamic(
    () => import("@/widgets/UserManagement/CreateUser"),
    { ssr: false }
  );
  const DeletedUsers = dynamic(
    () => import("@/widgets/UserManagement/DeletedUsers"),
    { ssr: false }
  );
  const InactiveUsers = dynamic(
    () => import("@/widgets/UserManagement/InactiveUsers"),
    { ssr: false }
  );

  const pathname = usePathname();
  // console.log("pathname",pathname);
  const [open, setOpen] = useState(true);
  const [userList, setUserList] = useState([]);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [inactiveUserModal, setInactiveUserModal] = useState(false);
  // const [newPassword,setNewPassword]= useState(false);
  // const [confirmPassword, setConfirmPassword ] = useState(false);

  const [openUserModal, setOpenUserModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [userWarningModal, setUserWarningModal] = useState(false);
  const [userDeleteSuccessModal, setUserDeleteSuccessModal] = useState(false);
  const [userDeleteFailModal, setUserDeleteFailModal] = useState(false);
  const [userStatusUpdateModal, setUserStatusUpdateModal] = useState(false);
  const [userStatusNotUpdateModal, setUserStatusNotUpdateModal] =
    useState(false);
  const [userStatusModifyModal, setUserStatusModifyModal] = useState(false);
  const [roleUpdateModal, setRoleUpdateModal] = useState(false);
  const [pwdResetSuccessModal, setPwdResetSuccessModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState("");
  const [deleteUserModal, setDeleteUserModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState("");
  const [loginDetailsModal, setLoginDetailsModal] = useState(false);
  const [loginDetailsUserId, setLoginDetailsUserId] = useState("");

  const [editUserId, setEditUserId] = useState("");
  const [edit, setEdit] = useState(false);
  const [checked, setMultiChecked] = useState(false);
  const [action, setAction] = useState("");
  const [roleaction, setRoleAction] = useState("-");
  const [statusaction, setStatusaction] = useState("-");
  const [user_ids, setUserIds] = useState([]);
  const [user_id, setUser_id] = useState("");
  const [roleList, setRoleList] = useState([]);
  let [sort, setSort] = useState(true);

  const LOG_TABLE_HEAD = [
    "Login DateTime",
    "LogOut DateTime",
    "Total Login Hrs",
  ];
  const TABLE_HEAD = [
    <Checkbox
      key="checkbox"
      color="blue"
      checked={checked}
      onClick={(e) => selectAllUsers(e)}
    />,
    "User Profile",
    "Role",
    "Location",
    "Status",
    "Registered On",
    "Last Login",
    "Actions",
  ];
  const [isClient, setIsClient] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const stdSelectField =
    "block bg-white text-black font-normal placeholder-grayThree placeholder-font-normal  rounded-md border-0 py-2.5 pl-12 w-full ring-1 ring-inset ring-gray-300  focus:ring-2 focus:ring-inset focus:ring-green text-sm lg:text-sm ";
  let [recsPerPage, setRecsPerPage] = useState(10);
  let [numOfPages, setNumOfPages] = useState([1]);
  let [pageNumber, setPageNumber] = useState(1);

  let [searchText, setSearchText] = useState("-");
  let [totalRecs, setTotalRecs] = useState("-");
  let [search, setSearch] = useState("");
  const startSerialNumber = (pageNumber - 1) * recsPerPage + 1;

  // for reset password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setErrorMsg] = useState({});

  const [userRunCount, setUserRunCount] = useState(0);
  const [logDetails, setlogDetails] = useState([]);
  const [userMail, setuserMail] = useState("");
  const [fullName, setfullName] = useState("");

  const showUserDetails = (id) => {
    var id = id;
    console.log("id", id);
    axios
      .get("/api/users/get/user_logdetails/" + id)
      .then((res) => {
        console.log("res", res);
        setuserMail(res?.data?.data.profile.email);
        setfullName(res?.data?.data.profile.fullName);
        setlogDetails(res?.data?.logDetails);
      })
      .catch((error) => {});
  };
  useEffect(() => {
    setIsClient(true);

    var user = JSON.parse(localStorage.getItem("userDetails"));
    setUser_id(user?.user_id);
    getUserList();
    getRoleList();
  }, []);

  const editUser = (_id) => {
    setEdit(true);
    setEditUserId(_id);
    // setOpenUserModal(true);
    window.location.href = "/admin/user-management/create-user/" + _id;
  };

  const deleteUser = () => {
    setDeleteModal();
    // console.log("deleteUserId",deleteUserId);
    var formValues = {
      user_id_tobedeleted: deleteUserId,
    };
    axios
      .patch("/api/users/patch/deletestatus", formValues)
      .then((response) => {
        //  console.log("response department",response);
        // Swal.fire({
        //   text: "User Deleted Successfully.",
        // });
        setUserDeleteSuccessModal(true);
        getUserList();
      })
      .catch((err) => console.log("err", err));
  };

  function addUserIds(event, _id) {
    // console.log("e",event.target.checked)
    let userIds = [...user_ids];
    if (event.target.checked) {
      userIds = [...userIds, _id];
    } else {
      const index = userIds.indexOf(_id);
      if (index > -1) {
        // only splice array when item is found
        userIds.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
    setUserIds(userIds);
  }

  const selectAllUsers = (event) => {
    setMultiChecked(!checked);
    if (event.target.checked) {
      let userIds = userList.map((a) => a._id);
      setUserIds(userIds);
    } else {
      setUserIds([]);
    }
  };

  const getRoleList = () => {
    axios
      .post("/api/roles/get/list")
      .then((response) => {
        //  console.log("response role",response);
        var roleList = [];
        for (let index = 0; index < response.data.length; index++) {
          let roleData = {
            role_id: response.data[index]._id,
            role: response.data[index].role,
          };
          roleList.push(roleData);
        }
        setRoleList(roleList);
        //  console.log("roleList",roleList);
      })
      .catch((err) => console.log("err", err));
  };

  useEffect(() => {
    getUserList();
  }, [pageNumber, recsPerPage, runCount]);

  useEffect(() => {
    pagesLogic();
  }, [recsPerPage, totalRecs]);

  const pagesLogic = () => {
    // console.log("totalRecs / recsPerPage",totalRecs , recsPerPage)
    let totalPages = Math.ceil(totalRecs / recsPerPage);
    let pageArr = [];
    for (let i = 0; i < totalPages; i++) {
      pageArr[i] = i + 1;
    }
    setNumOfPages(pageArr);
  };

  useEffect(() => {
    getUserList();
  }, [recsPerPage, runCount]);

  const getUserList = () => {
    if (searchText === "") {
      searchText = "-";
    }

    var formValues = {
      companyID: 1,
    };
    axios({
      method: "post",
      url: `/api/users/post/list/${recsPerPage}/${pageNumber}`,
      data: formValues,
    })
      .then((response) => {
        console.log("response.data", response.data);
        setTotalRecs(response.data.totalRecs);

        var userList = [];
        var usersData = response?.data?.tableData;
        for (var index = 0; index < usersData.length; index++) {
          let userData = {
            _id: usersData[index]._id,
            name:
              usersData[index]?.firstname + " " + usersData[index]?.lastname,
            email: usersData[index].email,
            mobile: usersData[index].mobNumber,
            role: usersData[index].role,
            centerName: usersData[index]?.centerName
              ? usersData[index]?.centerName
              : "-- NA --",
            status: usersData[index].status,

            createdAt: usersData[index].createdAt,
            lastloggedin: usersData[index].lastLogin,
            // createdAt:
            //   moment(usersData[index].createdAt).format("Do MMMM YYYY  h:mm"),
            //   // moment().format("dddd, MMMM Do YYYY, h:mm:ss a"); // "Sunday, February 14th 2010, 3:25:50 pm"

            // lastloggedin: usersData[index].lastLogin
            //   ? moment(usersData[index].lastLogin)?.format(
            //       "ddd, MMM DD, YY HH:mm"
            //     )+
            //     " (" +
            //     moment(usersData[index].lastLogin).fromNow(true) +
            //     ")"
            //   : null,
          };
          userList.push(userData);
        }
        setUserList(userList);
      })
      .catch((error) => {
        console.log("Error while getting Users List => ", error);
        // Swal.fire(
        //   "Oops!",
        //   "Something went wrong! <br/>" + error.message,
        //   "error"
        // );
      });
  };

  const performAction = (e) => {
    // console.log("e=>",e);
    var action = e.split("-")[0];
    if (user_ids.length > 0) {
      if (action === "status") {
        const formValues = {
          userID: user_ids,
          status: e.split("-")[1],
          username: user_id,
        };
        // console.log("formValues",formValues);
        axios
          .patch("/api/users/patch/status", formValues)
          .then((res) => {
            console.log("res", res.data.data);
            if (res.data === "USER_STATUS_UPDATED") {
              // Swal.fire("Status updated successfully");
              setUserStatusUpdateModal(true);
            } else if (res.data === "USER_STATUS_NOT_UPDATED") {
              // Swal.fire("Status is not updated.");
              setUserStatusNotUpdateModal(true);
            } else {
              // Swal.fire("Status is not modified.");
              setUserStatusModifyModal(true);
            }
            getUserList();
            setStatusaction("-");
            setRoleAction("-");
            setMultiChecked(false);
            setUserIds([]);
          })
          .catch((err) => {
            console.log("err", err);
          });
      } else {
        const formValues = {
          userID: user_ids,
          // status :e,
          username: user_id,
          role: e.split("-")[1],
          action: action,
        };
        axios
          .patch("/api/users/patch/roles", formValues)
          .then((res) => {
            console.log("res", res);
            // setRoleUpdateModal(true);

            if (res.data === "USER_ROLE_UPDATED") {
              Swal.fire("Role updated successfully");
            } else if (res.data === "USER_ROLE_NOT_UPDATED") {
              Swal.fire("Role is not updated.");
            } else {
              Swal.fire("Role is not modified.");
            }
            getUserList();
            setStatusaction("-");
            setRoleAction("-");
            setMultiChecked(false);
            setUserIds([]);
          })
          .catch((err) => {
            console.log("err", err);
          });
      }
    } else {
      // Swal.fire("Please select atleast one user");
      setUserWarningModal(true);
    }
  };
  const getListByRole = (role) => {
    setStatusaction("-");
    setRoleAction(role);
    if (role === "all") {
      getUserList();
    } else {
      const formValues = {
        companyID: 1,
        recsPerPage: recsPerPage,
        pageNumber: pageNumber,
        // startRange:0,
        // limitRange:50
      };
      axios
        .post("/api/users/get/list/role/" + role, formValues)
        .then((response) => {
          // console.log("getListByRole response",response)
          setTotalRecs(response.data.totalRecs);

          var userList = [];
          var usersData = response?.data?.tableData;
          for (var index = 0; index < usersData.length; index++) {
            let userData = {
              _id: usersData[index]._id,
              name:
                usersData[index]?.firstname + " " + usersData[index]?.lastname,
              email: usersData[index].email,
              mobile: usersData[index].mobNumber,
              role: usersData[index].role,
              centerName: usersData[index]?.centerName
                ? usersData[index]?.centerName
                : "-- NA --",
              status: usersData[index].status,
              createdAt: usersData[index].createdAt,
              lastloggedin: usersData[index].lastLogin,
              // createdAt:
              //   moment(usersData[index].createdAt).format("DD-MM-YYYY") +
              //   " (" +
              //   moment(usersData[index].createdAt).fromNow(true) +
              //   ")",
              // lastloggedin: usersData[index].lastLogin
              //   ? moment(usersData[index].lastLogin)?.format(
              //       "ddd, MMM DD, YY HH:mm"
              //     )
              //   : null,
            };
            userList.push(userData);
          }
          setUserList(userList);

          // console.log("userList",userList);
          setMultiChecked(false);
          setUserIds([]);
        })
        .catch((err) => {
          console.log("err", err);
        });
    }
  };
  const getListByStatusRole = (status, role) => {
    setStatusaction(status);
    setRoleAction(role);
    console.log("getListBystatusRole ", status, role);

    // if(status==="all" || ){
    //   getUserList();
    // }else{
    const formValues = {
      companyID: 1,
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
      // startRange:0,
      // limitRange:50
    };

    // axios.post('/api/users/get/list/status/'+status,formValues)
    axios
      .post(
        "/api/users/post/list/statusrole/" + role + "/" + status,
        formValues
      )
      .then((response) => {
        console.log("getListBystatusRole response", response);
        setTotalRecs(response.data.totalRecs);

        var userList = [];
        var usersData = response?.data?.tableData;
        for (var index = 0; index < usersData.length; index++) {
          let userData = {
            _id: usersData[index]._id,
            name:
              usersData[index]?.firstname + " " + usersData[index]?.lastname,
            email: usersData[index].email,
            mobile: usersData[index].mobNumber,
            role: usersData[index].role,
            centerName: usersData[index]?.centerName
              ? usersData[index]?.centerName
              : "-- NA --",
            status: usersData[index].status,
            createdAt: usersData[index].createdAt,
            lastloggedin: usersData[index].lastLogin,
            // createdAt:
            //   moment(usersData[index].createdAt).format("DD-MM-YYYY") +
            //   " (" +
            //   moment(usersData[index].createdAt).fromNow(true) +
            //   ")",
            // lastloggedin: usersData[index].lastLogin
            //   ? moment(usersData[index].lastLogin)?.format(
            //       "ddd, MMM DD, YY HH:mm"
            //     )
            //   : null,
          };
          userList.push(userData);
        }
        setUserList(userList);
        // console.log("userList",userList);
        setMultiChecked(false);
        setUserIds([]);
      })
      .catch((err) => {
        console.log("err", err);
      });
    // }
  };
  const searchUser = (e) => {
    const formValues = {
      searchText: e,
      startRange: 0,
      limitRange: 100,
    };
    console.log("formValues", formValues);
    axios
      .post("/api/users/get/searchlist", formValues)
      .then((response) => {
        var userList = [];
        var usersData = response?.data;

        for (var index = 0; index < usersData.length; index++) {
          let userData = {
            _id: usersData[index]._id,
            name: usersData[index].fullName,
            email: usersData[index].email,
            mobile: usersData[index].mobNumber,
            role: usersData[index].role,
            centerName: usersData[index]?.centerName
              ? usersData[index]?.centerName
              : "-- NA --",
            status: usersData[index].status,
            createdAt: usersData[index].createdAt,
            lastloggedin: usersData[index].lastLogin,
            // createdAt:
            //   moment(usersData[index].createdAt).format("Do MMMM YYYY  h:mm"),
            //   // moment().format("dddd, MMMM Do YYYY, h:mm:ss a"); // "Sunday, February 14th 2010, 3:25:50 pm"

            // lastloggedin: usersData[index].lastLogin
            //   ? moment(usersData[index].lastLogin)?.format(
            //       "ddd, MMM DD, YY HH:mm"
            //     )+
            //     " (" +
            //     moment(usersData[index].lastLogin).fromNow(true) +
            //     ")"
            //   : null,
          };
          userList.push(userData);
        }
        setUserList(userList);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };
  const showProfile = (_id) => {
    window.location.href = "/admin/user-management/profile/" + _id;
  };

  const handleReset = (event) => {
    event.preventDefault();
    if (validation()) {
      var formValues = {
        pwd: confirmPassword,
      };
      console.log(
        "newPassword",
        newPassword,
        "confirmPassword",
        confirmPassword,
        resetUserId
      );
      var id = resetUserId;
      axios
        .patch(
          "/api/users/patch/change_password_withoutotp/id/" + id,
          formValues
        )
        .then((res) => {
          axios
            .get("/api/users/get/" + id)
            .then((response) => {
              if (res.data === "PASSWORD_RESET") {
                // Swal.fire({
                //   title: " ",
                //   text:
                //     response.data.profile.firstname +
                //     "'s" +
                //     " password has been changed successfully!",
                // });
                setPwdResetSuccessModal(true);
              } else if (res.data === "PASSWORD_NOT_RESET") {
                Swal.fire({
                  title: " ",
                  text:
                    response.data.profile.firstname +
                    "'s" +
                    " password has not been modified!",
                });
              }
              setResetModal();
            })
            .catch((error) => {});
        })
        .catch((error) => {});
    }
  };
  const validation = () => {
    const errorMsg = {};
    let inputIsValid = true;

    if (validator.isEmpty(newPassword)) {
      inputIsValid = false;
      errorMsg.newPasswordError = "This field is required.";
    } else if (!validatePassword(newPassword)) {
      inputIsValid = false;
      errorMsg.newPasswordError =
        "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number.";
    }
    if (validator.isEmpty(confirmPassword)) {
      inputIsValid = false;
      errorMsg.confirmPasswordError = "This field is required.";
    } else if (newPassword !== confirmPassword) {
      inputIsValid = false;
      errorMsg.confirmPasswordError = "Passwords do not match.";
    }

    setErrorMsg(errorMsg);
    return inputIsValid;
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return (
      password.length >= minLength && hasUppercase && hasLowercase && hasNumber
    );
  };

  const sortNumber = (key, userList) => {
    const reA = /[^a-zA-Z]/g;
    const reN = /[^0-9]/g;

    const sortedData = userList?.sort((a, b) => {
      let nameA = "";
      let nameB = "";
      let aN = 0;
      let bN = 0;

      // Extract values for the given key
      for (const [key1, value1] of Object.entries(a)) {
        if (key === key1) {
          nameA = value1.replace(reA, "");
          aN = parseInt(value1.replace(reN, ""), 10);
        }
      }

      for (const [key2, value2] of Object.entries(b)) {
        if (key === key2) {
          nameB = value2.replace(reA, "");
          bN = parseInt(value2.replace(reN, ""), 10);
        }
      }

      // Compare the values
      if (sort) {
        if (nameA === nameB) {
          return aN - bN;
        } else {
          return nameA.localeCompare(nameB);
        }
      } else {
        if (nameA === nameB) {
          return bN - aN;
        } else {
          return nameB.localeCompare(nameA);
        }
      }
    });

    setSort(!sort);
    setUserList(sortedData);
  };
  const sortString = (key, userList) => {
    const sortedData = userList?.sort((a, b) => {
      let nameA = "";
      let nameB = "";

      Object.entries(a).forEach(([key1, value1]) => {
        if (key === key1) {
          nameA = typeof value1 === "string" ? value1.toUpperCase() : value1;
        }
      });

      Object.entries(b).forEach(([key2, value2]) => {
        if (key === key2) {
          nameB = typeof value2 === "string" ? value2.toUpperCase() : value2;
        }
      });

      if (sort) {
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      } else {
        if (nameA > nameB) return -1;
        if (nameA < nameB) return 1;
        return 0;
      }
    });

    setSort(!sort);
    setUserList(sortedData);
  };
  const sortData = (event) => {
    event.preventDefault();
    var key = event.target.getAttribute("id");
    console.log("key",key)
    if (key === "number") {
      sortNumber(key, userList);
      console.log("sortNumber",sortNumber)
    } else {
      sortString(key, userList);
      console.log("sortString",sortString)
    }
  };
  return (
    <section className="section w-full">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300">
            <h1 className="heading">USER MANAGEMENT</h1>
          </div>
        </div>
        <div className="px-10 py-6">
          <div className="flex justify-end">
            {/* <Button className="bg-red-500" 
                    onClick={() => 
                      window.location.href = "/admin/user-management/inactive-users"
                    }
                  >Inactive Users</Button> */}

            {/* <button
              className="formButtons bg-red-500 hover:bg-red-700 px-5"
              onClick={() => setDeleteUserModal(true)}
            >
              Deleted Users
            </button> */}
          </div>

          <div className="block md:flex lg:flex justify-between gap-4 mt-4">
            <div>
              <button
                className="bg-green formButtons me-0 lg:me-4"
                onClick={
                  () => (window.location.href = "/admin/role-management")
                  // setOpenRoleModal(true)
                }
              >
                Add Role
              </button>
              {/* <Button className="bg-green" onClick={() => {setOpenUserModal(true);setEdit(false)}}>Add User</Button> */}
              <button
                className="bg-green formButtons"
                onClick={() => {
                  // setOpenUserModal(true);
                  window.location.href = "/admin/user-management/create-user";
                  setEdit(false);
                }}
              >
                Add User
              </button>
            </div>
            <div className="">
              <button
                className="formButtons bg-red-500 hover:bg-red-700 px-5"
                onClick={() => setDeleteUserModal(true)}
              >
                Deleted Users
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6 mb-14 flex justify-between">
            <div>
              <select
                id="action"
                value={action}
                onChange={(e) => performAction(e.target.value)}
                // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                className={stdSelectField}
              >
                <option value="" disabled>
                  -- Select Action --
                </option>
                <optgroup label="Active / Inactive">
                  <option value="status-inactive">
                    Inactivate selected User
                  </option>
                  <option value="status-active">Activate selected User</option>
                </optgroup>
                <optgroup label="Add Roles">
                  {roleList.map((item, index) => {
                    return (
                      <option key={index} value={"add-" + item.role}>
                        Add {item.role} Role to selected
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Remove Roles">
                  {roleList.map((item, index) => {
                    return (
                      <option key={index} value={"remove-" + item.role}>
                        Remove {item.role} Role from selected
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>
            <div>
              <select
                id="statusaction"
                value={statusaction}
                onChange={(e) =>
                  getListByStatusRole(e.target.value, roleaction)
                }
                // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                className={stdSelectField}
              >
                <option value="-" disabled>
                  -- Select Status --
                </option>
                <option value="all">Show all</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>

            <div>
              <select
                id="roleaction"
                value={roleaction}
                onChange={(e) =>
                  getListByStatusRole(statusaction, e.target.value)
                }
                // <select id="roleaction" value={roleaction} onChange={(e)=>getListByRole(e.target.value)}
                // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                className={stdSelectField}
              >
                <option value="-" disabled>
                  -- Select Role --
                </option>
                <option value="all">Show all</option>
                {roleList.map((item, index) => {
                  return (
                    <option key={index} value={item.role}>
                      {item.role}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 flex justify-between">
            <div className="w-1/2">
              <div className="text-sm">
                <label htmlFor="recsPerPage" className="inputLabel">
                  Records per Page
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <SlBookOpen size={20} />
                    </span>
                  </div>
                  <select
                    className={stdSelectField}
                    onChange={(event) => {
                      setRecsPerPage(event.target.value);
                    }}
                  >
                    <option value={10}>10 Records</option>
                    <option value={20}>20 Records</option>
                    <option value={50}>50 Records</option>
                    <option value={100}>100 Records</option>
                  </select>
                </div>
              </div>
            </div>

            <div className=""></div>
            <div className="text-sm">
              <label htmlFor="recsPerPage" className="inputLabel">
                Search
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                <form className="">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <FaSearch size={20} />
                    </span>
                  </div>
                  <input
                    type="search"
                    id="default-search"
                    onChange={(e) => searchUser(e.target.value)}
                    className={stdSelectField}
                    placeholder="Search By Name, Email, and Mobile Number..."
                    required
                  />
                </form>
              </div>
            </div>
          </div>
          {/* {isClient ? ( */}

          <div className="table-responsive relative overflow-hidden hover:overflow-auto mt-2 w-full">
          <table className="table-auto text-sm bottom border border-1 border-grayZero w-full dark:w-full">

          {/* <div className="h-full w-full overflow-scroll mt-6">
            <table className="w-full table-auto text-left"> */}

              {/* <table className="w-full min-w-max table-auto text-left"> */}
              <thead>
                <tr>
                  {TABLE_HEAD.map((head, index) => (
                    <th
                      key={head}
                      className="border-b text-white border-blue-gray-100 bg-green py-2 px-4"
                    >
                      <div
                        variant="small"
                        color="blue-gray"
                        className="font-bold leading-none text-white text-left"
                      >
                        {/* {head} */}
                        {head === "Actions" ? (
                          head
                        ) : (
                          <>
                            {head}{" "}
                            <span
                              onClick={sortData}
                              id={index}
                              className="fa cursor-pointer fa-sort"
                            ></span>
                          </>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userList && userList.length > 0 ? (
                  userList.map(
                    (
                      {
                        _id,
                        name,
                        email,
                        mobile,
                        status,
                        centerName,
                        role,
                        createdAt,
                        lastloggedin,
                      },
                      index
                    ) => {
                      const isLast = index === userList.length - 1;
                      const classes = 
                      // isLast
                      //   ? "p-4"
                      //   : 
                        "py-4 px-2 border-b border-blue-gray-50 text-blue-gray-50";

                      return (
                        <tr key={index}>
                          <td className={classes}>
                            {/* <div
                              variant="small"
                              color="blue-gray" */}
                              <div
                              className="font-normal"
                            >
                              <Checkbox
                                color="blue"
                                checked={
                                  user_ids?.indexOf(_id) > -1 ? true : false
                                }
                                onClick={(e) => addUserIds(e, _id)}
                              />
                            </div>
                          </td>
                          <td className={classes}>
                            <div
                              variant="small"
                              color="blue-gray"
                              className="font-normal text-nowrap"
                            >
                              {name && <><span>{name}</span><br /></>}
                              {email && <><span>{email}</span><br /></>}
                              {mobile && <><span>+91 {mobile}</span></>}
                              
                            </div>
                          </td>
                          <td className={classes}>
                            <div
                              variant="small"
                              color="blue-gray"
                              className="font-normal text-wrap"
                            >
                              {/* {
                                    role.map((a)=>{
                                      return a+", "
                                    }
                                  )} */}
                              {role?.join(", ").replace(/, ([^,]*)$/, ", $1")}
                            </div>
                          </td>
                          <td className={classes}>
                            <div
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {centerName ? centerName : "-"}
                            </div>
                          </td>
                          <td className={classes}>
                            <div
                              variant="small"
                              color="blue-gray"
                              className={
                                status === "active"
                                  ? "bg-green-400 font-normal flex justify-center text-white p-1 rounded"
                                  : "bg-red-400 text-white font-normal flex justify-center p-1 rounded"
                              }
                            >
                              {status}
                            </div>
                          </td>
                          <td className={classes}>
                            <div
                              variant="small"
                              color="blue-gray"
                              className="font-normal text-nowrap"
                            >
                           {moment(createdAt).format('Do MMMM YYYY')},
                           @ {moment(createdAt).format('HH:mm')}
                            </div>
                          </td>
                          <td className={classes}>
                            <div
                              variant="small"
                              color="blue-gray"
                              className="font-normal "
                            >
                              {lastloggedin ? (
                                <>
                                    {`(${moment(lastloggedin).fromNow(true)}) `}
                                  {moment(lastloggedin).format('Do MMMM YYYY')}, @ {moment(lastloggedin).format('HH:mm')}
                                </>
                              ) : (
                                'Not logged in yet'
                              )}
                              {/* {lastloggedin ? (
                                  <Tooltip content="User Login Details">
                                    <span
                                      className="w-full capitalise text-blue-500 hover:underline"
                                      onClick={() => {
                                        setLoginDetailsModal(true);
                                        showUserDetails(_id);
                                      }}
                                    >
                                      User Login Details
                                    </span>
                                  </Tooltip>
                                ) : null} */}
                            </div>
                          </td>
                          <td className={classes + " text-nowrap"}>
                            <Tooltip content="Edit">
                              <IconButton
                                variant="text"
                                onClick={() => {
                                  editUser(_id);
                                }}
                              >
                                <MdOutlineEdit
                                  className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                  size={"1.3rem"}
                                  // onClick={() => redirect("edit", value._id)}
                                />
                              </IconButton>
                            </Tooltip>

                            {/* <Tooltip content="Show" >
                                <IconButton variant="text" onClick={()=>{showProfile(_id)}}>
                                  <FontAwesomeIcon  className='pt-1 h-4 w-4  cursor-pointer text-blue-500'  icon={faEye} color='#000' /> 
                                </IconButton>
                              </Tooltip> */}
                            <Tooltip content="Delete">
                              <IconButton
                                variant="text"
                                onClick={() => {
                                  setDeleteModal(true);
                                  setDeleteUserId(_id);
                                }}
                              >
                                <RiDeleteBin6Line
                                  className="border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                  size={"1.3rem"}
                                  // onClick={() => {
                                  //   redirect("delete", value._id);
                                  //   setDeleteId(value._id);
                                  // }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Reset Password">
                              <IconButton
                                variant="text"
                                onClick={() => {
                                  setResetModal(true);
                                  setResetUserId(_id);
                                }}
                              >
                                <KeyIcon className="h-4 w-4  cursor-pointer text-gray-700  " />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr className="">
                    <td
                      colSpan={8}
                      className="text-center text-sm font-normal p-2"
                    >
                      No Record Found!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-center mt-8 mb-5">
              <nav aria-label="Page navigation flex">
                {console.log("numOfPages",numOfPages,recsPerPage > userList.length,recsPerPage, userList.length)}
                {
                  numOfPages.length> 1 && totalRecs > recsPerPage
                  ?

                    <ul className="pagination mx-auto ps-5 flex bg-white">
                      {pageNumber !== 1 ? (
                        <li
                          className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
                          onClick={() => setPageNumber(--pageNumber)}
                        >
                          <a className="page-link ">
                            &nbsp; <FontAwesomeIcon icon={faAngleLeft} />
                          </a>
                        </li>
                      ) : null}

                      {numOfPages.map((item, i) => {
                        return (
                          <li
                            key={i}
                            className={
                              "page-item hover px-3 border border-gray-400 cursor-pointer text-center border-e-0 font-semibold " +
                              (pageNumber === item ? " active" : "")
                            }
                            onClick={() => {
                              setPageNumber(item);
                            }}
                          >
                            <a className="page-link">{item}</a>
                          </li>
                        );
                      })}
                      {/* {console.log("totalRecs", totalRecs)} */}
                      {totalRecs > 0 || totalRecs === "-" ? (
                        pageNumber !== numOfPages.length ? (
                          <li
                            className="page-item hover px-3 border border-gray-400 cursor-pointer"
                            onClick={() => {
                              setPageNumber(++pageNumber);
                            }}
                          >
                            <a className="page-link ">
                              <FontAwesomeIcon icon={faAngleRight} />
                            </a>
                          </li>
                        ) : null
                      ) : null}
                    </ul>
                  :null
                }
              </nav>
            </div>
          </div>
          {/* ) : null} */}
        </div>
      </div>

      <Modal show={openRoleModal} onClose={() => setOpenRoleModal(false)}>
        <Modal.Header>Add Role</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <AddRole />
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={inactiveUserModal}
        size="7xl"
        onClose={() => setInactiveUserModal(false)}
      >
        <Modal.Header>Inactive Users</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <InactiveUsers getUserList={getUserList} />
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={deleteUserModal}
        size="7xl"
        onClose={() => setDeleteUserModal(false)}
      >
        <Modal.Header>Deleted Users</Modal.Header>
        <Modal.Body>
          <div className="space-y-6 space-x-6">
            <DeletedUsers getUserList={getUserList} />
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={openUserModal} onClose={() => setOpenUserModal(false)}>
        <Modal.Header>{edit ? "Edit" : "Add"} Employee</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <AddEmployee
              getUserList={getUserList}
              edit={edit}
              editUserId={editUserId}
            />
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={deleteModal}
        size="md"
        onClose={() => setDeleteModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setDeleteModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">
              Are you sure you want to delete this user?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalFailBtn"
                onClick={() => {
                  setDeleteModal(false);
                  setUserDeleteFailModal(true);
                }}
              >
                No
              </button>
              <button className="modalSuccessBtn" onClick={() => deleteUser()}>
                Confirm
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={userDeleteSuccessModal}
        size="md"
        onClose={() => setUserDeleteSuccessModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setUserDeleteSuccessModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            {/* {Swal.fire({ icon: "success" })} */}
            <h3 className="modalText">User Deleted Successfully</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setUserDeleteSuccessModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={userDeleteFailModal}
        size="md"
        onClose={() => setUserDeleteFailModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setUserDeleteFailModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            {/* {Swal.fire({ icon: "success" })} */}
            <h3 className="modalText">User details are safe</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setUserDeleteFailModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={resetModal}
        size="md"
        onClose={() => setResetModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setResetModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleReset} className="modalBody text-left">
            <h2 className="modalText">Reset Password</h2>
            <div className="mb-4 relative">
              <label htmlFor="newPassword" className="inputLabel">
                New Password
                <span className="text-red-400 ms-1">*</span>
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                className="stdInputField py-2 pl-4"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className="absolute top-[-7px] inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <span
                  className={
                    showNewPassword
                      ? "fa fa-eye-slash toggleEye text-gray-400 right-5 top-10"
                      : "fa fa-eye toggleEye text-gray-400 right-5 top-10"
                  }
                ></span>
              </span>
              <div
                className="text-red-700 "
                style={{ fontSize: "12px", fontWeight: "normal" }}
              >
                {error.newPasswordError}
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="confirmPassword" className="inputLabel">
                Confirm Password
                <span className="text-red-400 ms-1">*</span>
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="stdInputField py-2 pl-4"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="absolute top-[-7px] inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span
                  className={
                    showConfirmPassword
                      ? "fa fa-eye-slash toggleEye text-gray-400 right-5 top-10"
                      : "fa fa-eye toggleEye text-gray-400 right-5 top-10"
                  }
                ></span>
              </span>
              <div
                className="text-red-700 "
                style={{ fontSize: "12px", fontWeight: "normal" }}
              >
                {error.confirmPasswordError}
              </div>
            </div>
            <button
              type="submit"
              className="w-full modalSuccessBtn"
              data-email={resetUserId}
            >
              Reset Password
            </button>
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        show={userWarningModal}
        size="md"
        onClose={() => setUserWarningModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setUserWarningModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">Please Select at least One User</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setUserWarningModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={userStatusModifyModal}
        size="md"
        onClose={() => setUserStatusModifyModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setUserStatusModifyModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">User not modified</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setUserStatusModifyModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={userStatusUpdateModal}
        size="md"
        onClose={() => setUserStatusUpdateModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setUserStatusUpdateModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">Status updated successfully</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setUserStatusUpdateModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={userStatusNotUpdateModal}
        size="md"
        onClose={() => setUserStatusNotUpdateModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setUserStatusNotUpdateModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">User status not updated</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setUserStatusNotUpdateModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={roleUpdateModal}
        size="md"
        onClose={() => setRoleUpdateModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setRoleUpdateModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">Role updated successfully</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setRoleUpdateModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={pwdResetSuccessModal}
        size="md"
        onClose={() => setPwdResetSuccessModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setPwdResetSuccessModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">
              Password has been changed successfully
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setPwdResetSuccessModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={roleUpdateModal}
        size="md"
        onClose={() => setRoleUpdateModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setRoleUpdateModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">Role updated successfully</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setRoleUpdateModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={loginDetailsModal}
        size="md"
        onClose={() => setLoginDetailsModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <table className="table-auto">
            <thead>
              <tr>
                {LOG_TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-b border-blue-gray-100 bg-green"
                  >
                    <div
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none text-white"
                    >
                      {head}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logDetails && logDetails.length > 0 ? (
                logDetails.map((log, index) => {
                  console.log("log", log);
                  var date1 = log?.loginTimeStamp ? log?.loginTimeStamp : "-";
                  var date2 = log?.logoutTimeStamp ? log?.logoutTimeStamp : "-";
                  let diffInMilliSeconds =
                    Math.abs(new Date(date1) - new Date(date2)) / 1000;
                  const days = Math.floor(diffInMilliSeconds / 86400);
                  diffInMilliSeconds -= days * 86400;
                  const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
                  diffInMilliSeconds -= hours * 3600;
                  const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
                  diffInMilliSeconds -= minutes * 60;
                  let difference = "";
                  if (days > 0) {
                    difference +=
                      days === 1 ? `${days} day, ` : `${days} days, `;
                  }
                  difference +=
                    hours === 0 || hours === 1
                      ? `${hours} hour, `
                      : `${hours} hours, `;
                  difference +=
                    minutes === 0 || hours === 1
                      ? `${minutes} minutes`
                      : `${minutes} minutes`;
                  console.log("difference", difference);
                  const classes =
                    "p-4 border-b border-blue-gray-50 text-blue-gray-50";
                  return (
                    <tr key={index}>
                      <td className={classes}>
                        {log.loginTimeStamp
                          ? moment(log.loginTimeStamp).format("DD-MMM-YY LT")
                          : "-"}
                      </td>
                      <td className={classes}>
                        {log.logoutTimeStamp
                          ? moment(log.logoutTimeStamp).format("DD-MMM-YY LT")
                          : "-"}
                      </td>
                      <td className={classes}>
                        {difference > 0 ? difference : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="">
                  <td colSpan={3} className="text-center text-sm font-normal ">
                    No Record Found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Modal.Body>
      </Modal>
    </section>
  );
}

//  UserManagement;