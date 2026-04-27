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
import { Tooltip } from "flowbite-react";
import dynamic from "next/dynamic";

function UserManagement() {
  const router = useRouter();
  const stdSelectField =
    "block bg-white text-black font-normal placeholder-grayThree placeholder-font-normal  rounded-md border-0 py-2.5 pl-12 w-full ring-1 ring-inset ring-gray-300  focus:ring-2 focus:ring-inset focus:ring-green text-sm lg:text-sm ";

  const [action, setAction] = useState("");
  const [roleaction, setRoleAction] = useState("-");
  const [statusaction, setStatusaction] = useState("-");
  const [user_ids, setUserIds] = useState([]);
  const [user_id, setUser_id] = useState("");

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
    <section className="section p-6 md:p-10 bg-white min-h-screen border-t-[3px] border-[#3c8dbc] shadow-md">
      <div className="max-w-[1440px] mx-auto">
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
              <Tooltip content="Delete Selected" placement="bottom" className="bg-red-500" arrow={false}>
                <RiDeleteBin6Line
                  className="cursor-pointer text-red-500 hover:text-red-700 border border-red-500 p-1 hover:border-red-700 rounded text-[30px] transition-all active:scale-95 shadow-sm"
                  onClick={bulkDelete}
                />
              </Tooltip>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Manage administrative access, role assignments, and account security for all organizational team members.
          </p>
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
    </section>
  );
}

export default UserManagement;
