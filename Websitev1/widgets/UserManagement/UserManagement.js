//github code
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import moment from "moment";
import GenericTable from "@/widgets/UserManagement/FilterTable_UM.js";
import dynamic from "next/dynamic";

function UserManagement() {
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

  return (
    <section className="section w-full">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300">
            <h1 className="heading">USER MANAGEMENT</h1>
          </div>
        </div>
        <div className="px-10 pb-6">
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
