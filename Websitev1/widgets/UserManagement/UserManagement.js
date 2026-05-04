//github code
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import moment from "moment";
import GenericTable from "@/widgets/UserManagement/FilterTable_UM.js";
import { BsPlusSquare } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdFilterList, MdExpandMore } from "react-icons/md";
import { Tooltip, Modal } from "flowbite-react";
import ls from "localstorage-slim";
import dynamic from "next/dynamic";

const DeletedUsers = dynamic(() => import("@/widgets/UserManagement/DeletedUsers"), { ssr: false });

function UserManagement() {
  const router = useRouter();
  const stdSelectField =
    "block bg-white text-black font-normal placeholder-grayThree placeholder-font-normal  rounded-md border-0 py-2.5 pl-12 w-full ring-1 ring-inset ring-gray-300  focus:ring-2 focus:ring-inset focus:ring-green text-sm lg:text-sm ";

  const [action, setAction] = useState("");
  const [roleaction, setRoleAction] = useState("-");
  const [statusaction, setStatusaction] = useState("-");
  const [user_ids, setUserIds] = useState([]);
  const [user_id, setUser_id] = useState("");
  const [deleteUserModal, setDeleteUserModal] = useState(false);

  const [runCount, setRunCount] = useState(0);
  const [centerName, setCenterName] = useState("all");
  const [center_id, setCenter_id] = useState("all");

  const [filterData, setFilterData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [roleList, setRoleList] = useState([]);

  const tableHeading = {
    actions: "Actions",
    userProfile: "User Profile",
    role: "Role",
    centerName: "Location",
    status: "Status",
    createdAt: "Registered On",
    lastloggedin: "Last Login",
  };
  const tableObjects = {
    tableName: "",
    deleteMethod: "delete",
    getListMethod: "post",
    center_ID: "all",
    apiURL: "/api/users",
    editURL: "/admin/user-management/create-user/",
    searchApply: true,
    downloadApply: true,
    formURL: "",
    formText: "",
    titleMsg: "User",
  };

  useEffect(() => {
    getData();
  }, [pageNumber, recsPerPage, searchText, statusaction, roleaction]);

  useEffect(() => {
    const user = ls.get("userDetails", { decrypt: true });
    setUser_id(user?.user_id);
    getRoleList();
  }, []);

  const getRoleList = () => {
    axios
      .post("/api/roles/get/list")
      .then((response) => {
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
      })
      .catch((err) => console.log("err", err));
  };

  const performAction = (e) => {
    var action = e.split("_")[0];
    if (user_ids.length > 0) {
      if (action === "status") {
        const status = e.split("_")[1];

        Swal.fire({
          title: " ",
          text: `Are you sure you want to ${status} selected Users?`,
          showCancelButton: true,
          cancelButtonText: "Cancel",
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
            axios
              .patch("/api/users/patch/status", formValues)
              .then((res) => {
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
          username: user_id,
          role: e.split("_")[1],
          action: action,
        };

        axios
          .patch("/api/users/patch/roles", formValues)
          .then((res) => {
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
            setUserIds([]);
          })
          .catch((err) => {
            console.log("err", err);
          });
      }
    } else {
      Swal.fire(" ", "Please select atleast one user");
    }
  };

  const getData = () => {
    var formValues = {
      companyID: 1,
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
      searchText: searchText ? searchText : "-",
      status: statusaction ? statusaction : "-",
      role: roleaction ? roleaction : "-",
    };
    setFilterData(formValues);
    axios({
      method: "post",
      url: "/api/users/post/list",
      data: formValues,
    })
      .then((response) => {
        // console.log("response.data===========", response);
        setTotalRecs(response.data.totalRecs);

        var userList = [];
        var usersData = response?.data?.tableData;
        for (var index = 0; index < usersData?.length; index++) {
          var name =
            usersData[index]?.firstname + " " + usersData[index]?.lastname;
          var email = usersData[index].email;
          var mobile = usersData[index].mobNumber;
          let userData = {
            _id: usersData[index]._id,
            userProfile:
              usersData[index]?.firstname &&
              usersData[index]?.firstname +
              " " +
              usersData[index]?.lastname +
              "<br />" +
              usersData[index].email +
              " <br />" +
              "+91 " +
              usersData[index].mobNumber,
            role:
              "<div class='text-left'>" +
              usersData[index].role?.join(", ").replace(/, ([^,]*)$/, ", $1") +
              "</div>",
            centerName: usersData[index]?.centerName
              ? usersData[index]?.centerName
              : "-- NA --",
            status:
              usersData[index].status === "active"
                ? '<span class="bg-successGreen font-normal flex justify-center text-white rounded-lg">' +
                usersData[index].status +
                "</span>"
                : '<span class="bg-red-400 text-white font-normal flex justify-center rounded-lg">' +
                usersData[index].status +
                "</span>",
            createdAt:
              moment(usersData[index].createdAt).format("Do MMMM YYYY") +
              ", " +
              "@" +
              moment(usersData[index].createdAt).format("HH:mm"),
            lastloggedin: usersData[index].lastLogin
              ? "<div class='text-left'>" +
              moment(usersData[index].lastLogin).fromNow(true) +
              "<br/>" +
              moment(usersData[index].lastLogin).format("Do MMMM YYYY") +
              ", " +
              "@" +
              moment(usersData[index].lastLogin).format("HH:mm") +
              "</div>"
              : "Not logged in yet",
          };
          userList.push(userData);
        }
        setTotalRecs(response.data.totalRecs);
        setTableData(userList);
      })
      .catch((error) => {
        console.log("Error while getting Users List => ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const bulkDelete = () => {
    if (user_ids.length > 0) {
      Swal.fire({
        title: " ",
        text: `Are you sure you want to delete selected users?`,
        showCancelButton: true,
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const formValues = {
            user_id_tobedeleted: user_ids,
          };
          axios
            .patch("/api/users/patch/deletestatus", formValues)
            .then((response) => {
              Swal.fire(" ", "Users deleted successfully.");
              setUserIds([]);
              getData();
            })
            .catch((err) => console.log("err", err));
        }
      });
    } else {
      Swal.fire(" ", "Please select at least one user to delete.");
    }
  };

  return (
    <section className="section admin-box box-primary">
      <div className="hr-card hr-fade-in">
        {/* Theme-aligned Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Security Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                User <span className="text-[#3c8dbc] font-black">Management</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
              <Tooltip content="Add New User" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                <BsPlusSquare
                  className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                  onClick={() => router.push("/admin/user-management/create-user")}
                />
              </Tooltip>
              <Tooltip content="Deleted Users List" placement="bottom" className="bg-red-500" arrow={false}>
                <RiDeleteBin6Line
                  className="cursor-pointer text-red-500 hover:text-red-700 border border-red-500 p-1 hover:border-red-700 rounded text-[30px] transition-all active:scale-95 shadow-sm"
                  onClick={() => setDeleteUserModal(true)}
                />
              </Tooltip>

            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Manage administrative access, role assignments, and account security for all organizational team members.
          </p>
        </div>

        <div className="bg-white">
          <div
            className="flex items-center gap-4 mb-2 cursor-pointer group select-none"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-2 text-slate-800 hover:text-[#3c8dbc] transition-colors">
              <MdFilterList className={`text-xl ${showFilters ? 'text-[#3c8dbc]' : 'text-slate-600'}`} />
              <span className="text-[11px] font-bold uppercase tracking-widest"> Show Filters</span>
            </div>
            <div className={`flex-1 h-[1px] ${showFilters ? 'bg-[#3c8dbc]/20' : 'bg-slate-100'} group-hover:bg-[#3c8dbc]/30 transition-colors`}></div>
            <MdExpandMore className={`text-xl transition-all duration-300 ${showFilters ? 'rotate-180 text-[#3c8dbc]' : 'text-slate-400 group-hover:text-slate-600'}`} />
          </div>

          <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100 mb-8 translate-y-0' : 'max-h-0 opacity-0 mb-0 -translate-y-4'
              }`}
          >
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 items-end pt-2 mb-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Select action to perform
                </label>
                <select
                  id="action"
                  value={action}
                  onChange={(e) => performAction(e.target.value)}
                  className="stdSelectField w-full"
                >
                  <option value="" disabled>-- Select Action --</option>
                  <optgroup label="Active / Inactive">
                    <option value="status_inactive">Inactivate selected User</option>
                    <option value="status_active">Activate selected User</option>
                  </optgroup>
                  <optgroup label="Add Roles">
                    {roleList.map((item, index) => (
                      <option key={index} value={"add_" + item.role}>Add {item.role} Role to selected</option>
                    ))}
                  </optgroup>
                  <optgroup label="Remove Roles">
                    {roleList.map((item, index) => (
                      <option key={index} value={"remove_" + item.role}>Remove {item.role} Role from selected</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Select Status
                </label>
                <select
                  id="statusaction"
                  value={statusaction}
                  onChange={(e) => {
                    setStatusaction(e.target.value);
                    setPageNumber(1);
                  }}
                  className="stdSelectField w-full"
                >
                  <option value="-" disabled>-- Select Status --</option>
                  <option value="all">Show all</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  Select Role
                </label>
                <select
                  id="roleaction"
                  value={roleaction}
                  onChange={(e) => {
                    setRoleAction(e.target.value);
                    setPageNumber(1);
                  }}
                  className="stdSelectField w-full"
                >
                  <option value="-" disabled>-- Select Role --</option>
                  <option value="all">Show all</option>
                  {roleList.map((item, index) => (
                    <option key={index} value={item.role}>{item.role}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white">
          <GenericTable
            tableObjects={tableObjects ? tableObjects : {}}
            tableHeading={tableHeading}
            setRunCount={setRunCount}
            runCount={runCount}
            recsPerPage={recsPerPage}
            setRecsPerPage={setRecsPerPage}
            filterData={filterData}
            getData={getData}
            tableData={tableData}
            setTableData={setTableData}
            numOfPages={numOfPages}
            setNumOfPages={setNumOfPages}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            searchText={searchText}
            setSearchText={setSearchText}
            totalRecs={totalRecs}
            setTotalRecs={setTotalRecs}
            search={search}
            setSearch={setSearch}
            action={action}
            setAction={setAction}
            roleaction={roleaction}
            setRoleAction={setRoleAction}
            statusaction={statusaction}
            setStatusaction={setStatusaction}
            user_ids={user_ids}
            setUserIds={setUserIds}
            user_id={user_id}
            setUser_id={setUser_id}
            loading={loading}
          />
        </div>
      </div>

      {/* Deleted Users Modal */}
      <Modal
        show={deleteUserModal}
        size="7xl"
        onClose={() => setDeleteUserModal(false)}
        className="bg-slate-900/50 backdrop-blur-sm"
      >
        <Modal.Header className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <RiDeleteBin6Line className="text-orange-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Deleted Users List</h3>
              <p className="text-xs text-slate-500 font-medium">Restore users or permanently remove them from the system.</p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-6">
            <DeletedUsers getUserList={getData} />
          </div>
        </Modal.Body>
      </Modal>
    </section>
  );
}

export default UserManagement;
