"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdClose } from "react-icons/md";
import { Modal } from "flowbite-react";
import validator from "validator";
import "animate.css";

import moment from "moment";
import {
  faEye,
  faPenToSquare,
  faTrashCan,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FaUserGraduate, FaCalendarCheck } from "react-icons/fa";
import { SlBookOpen } from "react-icons/sl";
import { IoLocationSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Tooltip } from "flowbite-react";
import { FaKey } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import { FaFileDownload } from "react-icons/fa";
import * as XLSX from "xlsx";

import {
  Card,
  Typography,
  IconButton,
  Checkbox,
} from "@material-tailwind/react";
import dynamic from "next/dynamic";

const GenericTable = ({
  tableObjects,
  tableHeading,
  setRunCount,
  runCount,
  recsPerPage,
  setRecsPerPage,
  filterData,
  getData,
  tableData,
  setTableData,
  numOfPages,
  setNumOfPages,
  pageNumber,
  setPageNumber,
  searchText,
  setSearchText,
  totalRecs,
  setTotalRecs,
  search,
  setSearch,
  action,
  setAction,
  roleaction,
  setRoleAction,
  statusaction,
  setStatusaction,
  user_ids,
  setUserIds,
  user_id,
  setUser_id,
  loading,
}) => {
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

  let router = useRouter();
  // console.log("search",search)
  const [deleteId, setDeleteId] = useState("");
  let [sort, setSort] = useState(true);

  const LOG_TABLE_HEAD = [
    "Login DateTime",
    "LogOut DateTime",
    "Total Login Hrs",
  ];
  const stdSelectField =
    "block bg-white text-black font-normal placeholder-grayThree placeholder-font-normal  rounded-md border-0 py-2.5 pl-3 w-full ring-1 ring-inset ring-gray-300  focus:ring-2 focus:ring-inset focus:ring-green text-sm lg:text-sm mt-1";

  const [checkDelete, setCheckDelete] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);
  const [deleteFailModal, setDeleteFailModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const startSerialNumber = (pageNumber - 1) * recsPerPage + 1;

  const [checked, setMultiChecked] = useState(false);
  const [roleList, setRoleList] = useState([]);

  // const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);

  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [inactiveUserModal, setInactiveUserModal] = useState(false);
  // const [newPassword,setNewPassword]= useState(false);
  // const [confirmPassword, setConfirmPassword ] = useState(false);

  const [openUserModal, setOpenUserModal] = useState(false);
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
  const [edit, setEdit] = useState(false);
  const [editUserId, setEditUserId] = useState("");

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

  // console.log("propssss",props)

  useEffect(() => {
    getData();
  }, [pageNumber, recsPerPage, searchText, statusaction, roleaction]);

  const showUserDetails = (id) => {
    var id = id;
    // console.log("id", id);
    axios
      .get("/api/users/get/user_logdetails/" + id)
      .then((res) => {
        // console.log("res", res);
        setuserMail(res?.data?.data.profile.email);
        setfullName(res?.data?.data.profile.fullName);
        setlogDetails(res?.data?.logDetails);
      })
      .catch((error) => { });
  };
  useEffect(() => {
    var user = JSON.parse(localStorage.getItem("userDetails"));
    setUser_id(user?.user_id);
    getRoleList();
  }, []);

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
      let userIds = tableData.map((a) => a._id);
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
        setRoleList(
          roleList.sort((a, b) => {
            return a.role.localeCompare(b.role);
          })
        );
        //  console.log("roleList",roleList);
      })
      .catch((err) => console.log("err", err));
  };

  const performAction = (e) => {
    // console.log("e=>",e);
    var action = e.split("_")[0];
    if (user_ids.length > 0) {
      if (action === "status") {
        const status = e.split("_")[1];

        Swal.fire({
          title: " ",
          text: `Are you sure you want to ${status} selected Users?`,
          // icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          // confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Confirm!",
          reverseButtons: true,
          focusCancel: true,
        }).then((result) => {
          if (result.isConfirmed) {
            const formValues = {
              userID: user_ids,
              status: e.split("_")[1],
              username: user_id,
            };
            // console.log("formValues",formValues);
            axios
              .patch("/api/users/patch/status", formValues)
              .then((res) => {
                // console.log("res", res.data.data);
                if (res.data === "USER_STATUS_UPDATED") {
                  Swal.fire(" ", "Status updated successfully");
                } else if (res.data === "USER_STATUS_NOT_UPDATED") {
                  Swal.fire(" ", "Status is not updated.");
                } else {
                  Swal.fire(" ", "Status is not modified.");
                }
                getData();
                setStatusaction("-");
                setRoleAction("-");
                setMultiChecked(false);
                setUserIds([]);
              })
              .catch((err) => {
                console.log("err", err);
              });
          }
        });
      } else {
        const formValues = {
          userID: user_ids,
          // status :e,
          username: user_id,
          role: e.split("_")[1],
          action: action,
        };

        axios
          .patch("/api/users/patch/roles", formValues)
          .then((res) => {
            // console.log("res", res);
            // setRoleUpdateModal(true);

            if (res.data === "USER_ROLE_UPDATED") {
              Swal.fire(" ", "Role updated successfully");
            } else if (res.data === "USER_ROLE_NOT_UPDATED") {
              Swal.fire(" ", "Role is not updated.");
            } else {
              Swal.fire(" ", "Role already exists.");
            }
            getData();
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
      Swal.fire(" ", "Please select atleast one user");
      // setUserWarningModal(true);
    }
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
      // console.log(
      //   "newPassword",
      //   newPassword,
      //   "confirmPassword",
      //   confirmPassword,
      //   resetUserId
      // );
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
                Swal.fire({
                  title: " ",
                  text:
                    response.data.profile.firstname +
                    "'s" +
                    " password has been changed successfully!",
                });
                setResetModal(false);
              } else if (res.data === "PASSWORD_NOT_RESET") {
                Swal.fire({
                  title: " ",
                  text:
                    response.data.profile.firstname +
                    "'s" +
                    " password has not been modified!",
                });
              }
            })
            .catch((error) => { });
        })
        .catch((error) => { });
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

  const editUser = (_id) => {
    setEdit(true);
    setEditUserId(_id);
    // setOpenUserModal(true);
    window.location.href = "/admin/user-management/create-user/" + _id;
  };

  const deleteUser = () => {
    setDeleteModal();
    console.log("deleteUserId", deleteUserId);
    var formValues = {
      user_id_tobedeleted: deleteUserId,
    };
    axios
      .patch("/api/users/patch/deletestatus", formValues)
      .then((response) => {
        //  console.log("response department",response);
        Swal.fire({
          title: " ",
          text: "User Deleted Successfully.",
        });
        // setUserDeleteSuccessModal(true);
        getData();
      })
      .catch((err) => console.log("err", err));
  };

  // useEffect(() => {
  //   pagesLogic();
  // }, [recsPerPage, totalRecs, runCount]);

  // const pagesLogic = () => {
  //   let totalPages = Math.ceil(totalRecs / recsPerPage);
  //   let pageArr = [];
  //   for (let i = 0; i < totalPages; i++) {
  //     pageArr[i] = i + 1;
  //   }
  //   setNumOfPages(pageArr);
  // };

  useEffect(() => {
    if (totalRecs > 0) {
      const totalPages = Math.ceil(totalRecs / recsPerPage);

      if (totalPages <= 5) {
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        setNumOfPages(pages);
      } else {
        let pages = [];

        if (pageNumber <= 3) {
          pages = [1, 2, 3, "...", totalPages];
        } else if (pageNumber >= totalPages - 2) {
          pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
        } else {
          pages = [
            1,
            "...",
            pageNumber - 1,
            pageNumber,
            pageNumber + 1,
            "...",
            totalPages,
          ];
        }

        setNumOfPages([...new Set(pages)]);
      }
    }
  }, [totalRecs, recsPerPage, pageNumber]);

  // const deleteData = () => {
  //   // var uid = deleteId;
  //   axios({
  //     method: tableObjects?.deleteMethod,
  //     url: `${tableObjects?.apiURL}/delete/${uid}`,
  //   })
  //     .then((deletedUser) => {
  //       console.log("deletedUser", deletedUser);
  //       getData();
  //       // setDeleteSuccessModal(true);
  //     })
  //     .catch((error) => {
  //       console.log("Error Message from userslist delete redirect  => ", error);
  //       // setErrorModal(true);
  //     });
  // };

  const redirect = (action, uid) => {
    if (action === "redirect") {
      // setApprovalId(uid);
      // localStorage.setItem("approval_id", uid);
      // router.push(tableObjects?.buttonURL+uid);
      window.location.href = tableObjects?.buttonURL + uid;
    }
    if (action === "edit") {
      // router.push(tableObjects?.editURL + uid)
      window.location.href = tableObjects?.editURL + uid;
    }
    if (action === "delete") {
      // setDeleteModal(true);

      var formValues = {
        user_id_tobedeleted: uid,
      };

      Swal.fire({
        title: " ",
        text: `Are you sure you want to delete this ${tableObjects?.titleMsg} ?`,
        showCancelButton: true,
        cancelButtonText: "No, Don't Delete!",
        cancelButtonColor: "#50c878",
        confirmButtonText: "Yes, delete it!",
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          confirmButton: "delete-btn",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // axios({
          //   method: tableObjects?.deleteMethod,
          //   // url: `${tableObjects?.apiURL}/delete/${uid}`,
          //   "/api/users/patch/deletestatus/" + uid,
          // })
          axios
            .patch("/api/users/patch/deletestatus/", formValues)
            .then((deletedUser) => {
              Swal.fire({
                title: " ",
                text: `${tableObjects?.titleMsg} have been deleted.`,
              });
              getData();
            })
            .catch((error) => {
              console.log(
                "Error Message from userslist delete redirect  => ",
                error
              );
              Swal.fire(" ", "Something Went Wrong <br/>" + error.message);
            });
        }
      });
    }
  };
  const sortNumber = (key, tableData) => {
    const reA = /[^a-zA-Z]/g;
    const reN = /[^0-9]/g;

    const sortedData = tableData?.sort((a, b) => {
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
    setTableData(sortedData);
  };
  const sortString = (key, tableData) => {
    const sortedData = tableData?.sort((a, b) => {
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
    setTableData(sortedData);
  };
  const sortData = (event) => {
    event.preventDefault();
    var key = event.target.getAttribute("id");
    // console.log("key",key)
    if (key === "number") {
      sortNumber(key, tableData);
      // console.log("sortNumber",sortNumber)
    } else {
      sortString(key, tableData);
      // console.log("sortString",sortString)
    }
  };

  const handlePageClick = (page) => {
    if (page === "...") return;
    setPageNumber(page);
  };

  const exportToExcel = () => {
    // Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetData = [Object.values(tableHeading)];
    const formvalues = { ...filterData, removePagination: true };

    axios({
      method: tableObjects?.getListMethod,
      url: `${tableObjects?.apiURL}/post/list`,
      data: formvalues,
    })
      .then((response) => {
        var userList = [];
        var usersData = response?.data?.tableData;
        for (var index = 0; index < usersData?.length; index++) {
          // Create user data without HTML tags
          let userData = {
            _id: usersData[index]._id,
            userProfile: `${usersData[index]?.firstname || ""} ${usersData[index]?.lastname || ""
              }\n${usersData[index].email || ""}\n+91 ${usersData[index]?.mobNumber || ""
              }`,
            role: usersData[index].role?.join(", ") || "",
            createdAt: moment(usersData[index].createdAt).format(
              "Do MMMM YYYY, HH:mm"
            ),
            lastloggedin: usersData[index].lastLogin
              ? `${moment(usersData[index].lastLogin).fromNow(true)}\n${moment(
                usersData[index].lastLogin
              ).format("Do MMMM YYYY, HH:mm")}`
              : "Not logged in yet",
            status:
              usersData[index].status === "active" ? "Active" : "Inactive",
          };
          userList.push(userData);
        }

        var downloadData = userList;
        // console.log("downloadData", downloadData);

        // Add data to the worksheet
        downloadData.forEach((row) => {
          const rowData = Object.keys(tableHeading).map((key) => row[key]);
          worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Generate Excel file and download
        XLSX.writeFile(workbook, tableObjects?.titleMsg + ".xlsx");
      })
      .catch((error) => {
        console.log("Error Message from userslist delete redirect  => ", error);
        // Swal.fire(" ", "Error Message from userslist delete redirect  =>");
        // setErrorModal(true);
      });
  };

  return (
    <section className="w-full">
      <h1 className="text-xl pb-2 font-semibold  mb-2">
        {tableObjects?.tableName}
      </h1>

      <div className="">
        <div className="block md:flex lg:flex justify-between gap-4 mt-4">
          <div>
            {/* <button
              className="bg-green formButtons me-0 lg:me-4"
              onClick={
                () => {
                  window.location.href = "/admin/role-management";
                  setLoading3(true);
                }
                // setOpenRoleModal(true)
              }
            >
              {loading3 ? (
                <span>
                  Add Role
                  <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                </span>
              ) : (
                "Add Role"
              )}
            </button> */}
            {/* <Button className="bg-green" onClick={() => {setOpenUserModal(true);setEdit(false)}}>Add User</Button> */}
            <button
              className="bg-green formButtons"
              onClick={() => {
                // setOpenUserModal(true);
                // setLoading2(true);
                window.open(
                  "/admin/user-management/create-user",
                  "_blank",
                  "noopener,noreferrer"
                );
                setEdit(false);
              }}
            >
              {loading2 ? (
                <span>
                  Add User
                  <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                </span>
              ) : (
                "Add User"
              )}
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
        <div className="mt-3 mb-3 w-full lg:w-1/3">
          <div className="lg:me-4">
            <label className="inputLabel font-semibold">
              Select action to perform :
            </label>
            <select
              id="action"
              value={action}
              onChange={(e) => performAction(e.target.value)}
              // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
              className="stdSelectField pl-3"
            >
              <option value="" disabled>
                -- Select Action --
              </option>
              <optgroup label="Active / Inactive">
                <option value="status_inactive">
                  Inactivate selected User
                </option>
                <option value="status_active">Activate selected User</option>
              </optgroup>
              <optgroup label="Add Roles">
                {roleList.map((item, index) => {
                  return (
                    <option key={index} value={"add_" + item.role}>
                      Add {item.role} Role to selected
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Remove Roles">
                {roleList.map((item, index) => {
                  return (
                    <option key={index} value={"remove_" + item.role}>
                      Remove {item.role} Role from selected
                    </option>
                  );
                })}
              </optgroup>
            </select>
          </div>
        </div>
        <label className="inputLabel font-semibold">Filters :</label>
        <div className="grid gap-3 lg:gap-6 md:grid-cols-2 lg:grid-cols-3 mt-1 mb-5">
          <div>
            <label htmlFor="statusaction" className="inputLabel  font-semibold">
              Select Status :
            </label>
            <select
              id="statusaction"
              value={statusaction}
              onChange={
                (e) => setStatusaction(e.target.value)
                // getListByStatusRole(e.target.value, roleaction)
              }
              // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
              className="stdSelectField pl-3"
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
            <label htmlFor="roleaction" className="inputLabel  font-semibold">
              Select Role :
            </label>
            <select
              id="roleaction"
              value={roleaction}
              onChange={
                (e) => setRoleAction(e.target.value)
                // getListByStatusRole(statusaction, e.target.value)
              }
              // <select id="roleaction" value={roleaction} onChange={(e)=>getListByRole(e.target.value)}
              // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
              className="stdSelectField pl-3"
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

        <div className="flex lg:flex-row md:flex-col flex-col mt-2 justify-between w-full">
          <div className="basis-1/3  text-sm">
            <div className="w-1/2 text-nowrap">
              <label
                htmlFor="recsPerPage"
                // className="mb-4 font-semibold"
                className="inputLabel"
              >
                Records per Page
              </label>
              <div className="relative mt-2 rounded-md text-gray-500 w-full">
                <select
                  // className="w-full border mt-2 text-sm"
                  // className="stdSelectField py-1.5"
                  className={`${recsPerPage
                      ? "stdSelectField pl-3 w-3/4"
                      : "stdSelectField pl-3 w-3/4"
                    } ${recsPerPage ? "selectOption" : "font-normal"}
              `}
                  onChange={(event) => {
                    setRecsPerPage(event.target.value);
                  }}
                >
                  <option value={10} className="font-normal">
                    10
                  </option>
                  <option value={50} className="font-normal">
                    50
                  </option>
                  <option value={100} className="font-normal">
                    100
                  </option>
                  <option value={500} className="font-normal">
                    500
                  </option>
                  <option value={1000} className="font-normal">
                    1000
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex text-sm lg:-mt-1 mt-5 justify-end w-full items-center">
            {tableObjects?.searchApply ? (
              <div className="basis-1/3 text-sm lg:-mt-1 mt-5">
                <label
                  htmlFor="search"
                  //  className="mb-4 font-semibold"
                  className="inputLabel"
                >
                  Search
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="pr-2 border-r-2">
                      <FaSearch className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    // className="w-full border mt-2 text-sm ps-1 pb-1"
                    className="stdInputField"
                    placeholder="Search"
                    name="search"
                    onChange={(event) => {
                      setSearchText(event.target.value);
                    }}
                  />
                </div>
              </div>
            ) : null}
            {tableObjects.downloadApply ? (
              <div className="mt-7 ml-4">
                <Tooltip
                  content="Download as Excel"
                  placement="top"
                  className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
                  arrow={false}
                >
                  <FaFileDownload
                    onClick={exportToExcel}
                    size={"2rem"}
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                  />
                </Tooltip>
              </div>
            ) : null}
          </div>
        </div>

        <div className="table-responsive relative overflow-hidden hover:overflow-auto w-full mt-3">
          {/* <table className="table-auto text-sm text-left rtl:text-right  dark: w-full"> */}
          <table className="table-auto text-base bottom  border-separate border-spacing-y-2 w-full dark:w-full">
            <thead className="text-[13px] uppercase text-nowrap bg-white dark:bg-white">
              <tr className="text-left">
                <th className="px-4 py-3 border border-grayTwo border-r-0">
                  {" "}
                  Sr. No
                </th>
                <th className="px-4 py-2 border border-grayTwo border-l-0 border-r-0">
                  <Checkbox
                    key="checkbox"
                    color="blue"
                    checked={checked}
                    onClick={(e) => selectAllUsers(e)}
                  />
                </th>
                {tableHeading ? (
                  Object.entries(tableHeading).map(([key, value], i) => {
                    if (key === "actions") {
                      return (
                        <th
                          key={i}
                          className="py-3 border border-grayTwo border-l-0 border-r-0"
                          id="ActionContent"
                        >
                          {value}
                        </th>
                      );
                    } else {
                      return (
                        <th
                          key={i}
                          className="px-4 py-3 border border-grayTwo border-l-0 border-r-0"
                        >
                          {value}{" "}
                          <span
                            onClick={sortData}
                            id={key}
                            className="fa cursor-pointer fa-sort tableSort"
                          ></span>
                        </th>
                      );
                    }
                  })
                ) : (
                  <th className=""></th>
                )}
              </tr>
            </thead>
            <tbody className="border border-grayTwo text-nowrap w-fit text-[13px]">
              {
                tableData && tableData.length > 0 ? (
                  tableData.map((value, i) => {
                    const serialNumber = startSerialNumber + i;
                    return (
                      <tr
                        key={i}
                        className="odd:bg-grayOne  even:bg-white  border border-grayTwo  text-gray-900 font-normal"
                      >
                        <td className="border-r-0 px-4 py-2 border border-grayTwo text-center">
                          {serialNumber}
                        </td>
                        <td className="px-4 py-2 border border-grayTwo border-l-0 border-r-0">
                          <Checkbox
                            checked={
                              user_ids?.indexOf(value._id) > -1 ? true : false
                            }
                            onClick={(e) => addUserIds(e, value._id)}
                          />
                        </td>
                        {tableHeading && tableHeading.actions ? (
                          <td className="border border-grayTwo border-l-0 border-r-0">
                            <div className="flex gap-1 items-center justify-between">
                              <Tooltip
                                content="Edit"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                              >
                                <MdOutlineEdit
                                  className="border  border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                  size={"1.3rem"}
                                  onClick={() => redirect("edit", value._id)}
                                />
                              </Tooltip>
                              &nbsp;
                              <Tooltip
                                content="Delete"
                                placement="bottom"
                                className="bg-red-500"
                                arrow={false}
                              >
                                <RiDeleteBin6Line
                                  className="border  border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                  size={"1.3rem"}
                                  onClick={() => {
                                    redirect("delete", value._id);
                                    // setDeleteId(value._id);

                                    // setDeleteModal(true);
                                    // setDeleteUserId(value._id);
                                  }}
                                />
                              </Tooltip>
                              &nbsp;
                              <Tooltip
                                content="Reset Password"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                              >
                                <FaKey
                                  className="border  border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                  size={"1.3rem"}
                                  onClick={() => {
                                    setResetModal(true);
                                    setResetUserId(value._id);
                                  }}
                                />
                              </Tooltip>
                              &nbsp;
                              {tableObjects?.showButton ? (
                                <button
                                  className="formButtons px-2  flex justify-center items-center text-xs h-6"
                                  onClick={() => {
                                    redirect("redirect", value._id);
                                  }}
                                >
                                  {tableObjects?.buttonText}
                                </button>
                              ) : (
                                ""
                              )}
                            </div>
                          </td>
                        ) : null}
                        {Object.entries(value).map(([key, value1], i) => {
                          // if (validator?.isNumeric(value1?.toString())) {
                          //   var textAlign = "text-right";
                          // } else if (validator?.isAlpha(value1?.toString())) {
                          //   var textAlign = "text-left";
                          // }
                          const valueStr =
                            value1 != null ? value1.toString() : "";

                          // if (/^[A-Za-z]+$/.test(valueStr)) {
                          //   var numbers = /^[0-9]+$/;
                          //   if(valueStr.includes(',')){
                          //     var textAlign = 'text-right';
                          //   }else if(valueStr.includes('%') && ( valueStr.match(numbers)) || valueStr.includes('0')){
                          //     var textAlign = 'text-right';
                          //   }else if(valueStr.match(numbers)){
                          //     var textAlign = 'text-right';
                          //   }else{
                          //     var regex = new RegExp(/(<([^>]+)>)/ig);
                          //     var value2 = valueStr ? valueStr.replace(regex,'') : '';
                          //     var aN = value2.replace(reA, "");
                          //     if (/^[A-Za-z]+$/.test(aN)) {
                          //     if(aN && $.type( aN ) === 'string'){
                          //       var textAlign = 'text-left noWrapText ');
                          //     }else{
                          //       var bN = valueStr ? parseInt(valueStr.replace(reN, ""), 10) : '';
                          //       if(bN){
                          //         var textAlign = 'text-right ';
                          //       }else{
                          //         var textAlign = 'text-left noWrapText ' );
                          //       }
                          //     }
                          //   }
                          // }else{
                          //   var textAlign = 'text-right';
                          // }
                          if (!isNaN(valueStr) && valueStr?.trim() !== "") {
                            textAlign = "text-right";
                          } else if (/^[A-Za-z]+$/.test(valueStr)) {
                            // Check if the value is alphabetic using regex
                            textAlign = "text-left";
                            // } else if (valueStr?.includes(",")) {
                            //   var textAlign = "text-right";
                          } else {
                            var textAlign = "text-left";
                          }
                          var found = Object.keys(tableHeading).filter((k) => {
                            return k === key;
                          });

                          // {console.log(i," | key = ",key, " | value = ",value1)}

                          if (found.length > 0) {
                            if (key !== "id") {
                              return (
                                <td
                                  className="px-4 py-2 border border-grayTwo border-l-0 border-r-0"
                                  key={i}
                                >
                                  <div
                                    className={"font-normal  " + textAlign}
                                    dangerouslySetInnerHTML={{
                                      __html: value1,
                                    }}
                                  ></div>
                                </td>
                              );
                            }
                          }
                        })}
                      </tr>
                    );
                  })
                ) : loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center text-Green text-3xl"
                    >
                      <FaSpinner className="animate-spin inline-flex mx-2" />
                    </td>
                  </tr>
                ) : (
                  <tr className="">
                    <td colSpan={6} className="text-center">
                      No Record Found!
                    </td>
                  </tr>
                )

                // ) : (
                //   <tr>
                //     <td colSpan="11">
                //       <h2 className="text-center text-danger py-5  font-semibold ">Data Not Found!</h2>
                //     </td>
                //   </tr>
                // )
              }
            </tbody>
          </table>
          <div className="flex justify-center mt-8">
            <nav aria-label="Page navigation flex">
              {numOfPages.length > 1 && totalRecs > recsPerPage ? (
                <ul className="pagination mx-auto ps-5 flex">
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
                          handlePageClick(item);
                        }}
                      >
                        <a className="page-link">{item}</a>
                      </li>
                    );
                  })}
                  {pageNumber !== numOfPages.length ? (
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
                  ) : null}
                </ul>
              ) : null}
            </nav>
          </div>

          <Modal
            show={deleteSuccessModal}
            size="md"
            onClose={() => setDeleteSuccessModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setDeleteSuccessModal(false)}
              >
                {/* <MdClose className="icon text-white font-medium" /> */}
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                {/* {Swal.fire({ icon: "success" })} */}
                <h3 className="modalText">
                  {tableObjects?.titleMsg} Deleted Successfully
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => setDeleteSuccessModal(false)}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          {/* <Modal
            show={deleteFailModal}
            size="md"
            onClose={() => setDeleteFailModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setDeleteFailModal(false)}
              > */}
          {/* <MdClose className="icon text-white font-medium" /> */}
          {/* </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody"> */}
          {/* {Swal.fire({ icon: "success" })} */}
          {/* <h3 className="modalText">
                  {tableObjects?.deleteMsg} are safe
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => setDeleteFailModal(false)}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal> */}

          <Modal
            show={errorModal}
            size="md"
            onClose={() => setErrorModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setErrorModal(false)}
              >
                {/* <MdClose className="icon text-white font-medium" /> */}
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                {/* {Swal.fire({ icon: "success" })} */}
                <h3 className="modalText">Oops!</h3>
                <p>Something went wrong</p>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => setErrorModal(false)}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

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
                <InactiveUsers getUserList={getData} />
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
                <DeletedUsers getUserList={getData} />
              </div>
            </Modal.Body>
          </Modal>
          <Modal show={openUserModal} onClose={() => setOpenUserModal(false)}>
            <Modal.Header>{edit ? "Edit" : "Add"} Employee</Modal.Header>
            <Modal.Body>
              <div className="space-y-6">
                <AddEmployee
                  getUserList={getData}
                  edit={edit}
                  editUserId={editUserId}
                />
              </div>
            </Modal.Body>
          </Modal>

          {/* <Modal
            show={deleteModal}
            size="md"
            onClose={() => setDeleteModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setDeleteModal(false)}
              > */}
          {/* <MdClose className="icon text-white font-medium" /> */}
          {/* </div>
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
                  <button
                    className="modalSuccessBtn"
                    onClick={() => deleteUser()}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal> */}

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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
                          ? "fa fa-eye toggleEye text-gray-400 right-5 top-10"
                          : "fa fa-eye-slash toggleEye text-gray-400 right-5 top-10"
                      }
                    ></span>
                  </span>
                  <div
                    className="text-red-500 "
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
                          ? "fa fa-eye toggleEye text-gray-400 right-5 top-10"
                          : "fa fa-eye-slash toggleEye text-gray-400 right-5 top-10"
                      }
                    ></span>
                  </span>
                  <div
                    className="text-red-500 "
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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
                      var date1 = log?.loginTimeStamp
                        ? log?.loginTimeStamp
                        : "-";
                      var date2 = log?.logoutTimeStamp
                        ? log?.logoutTimeStamp
                        : "-";
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

                      const classes =
                        "p-4 border-b border-blue-gray-50 text-blue-gray-50";
                      return (
                        <tr key={index}>
                          <td className={classes}>
                            {log.loginTimeStamp
                              ? moment(log.loginTimeStamp).format(
                                "DD-MMM-YY LT"
                              )
                              : "-"}
                          </td>
                          <td className={classes}>
                            {log.logoutTimeStamp
                              ? moment(log.logoutTimeStamp).format(
                                "DD-MMM-YY LT"
                              )
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
                      <td
                        colSpan={3}
                        className="text-center text-sm font-normal "
                      >
                        No Record Found!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </section>
  );
};

export default GenericTable;
