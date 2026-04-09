"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import moment from "moment";
import {
  Card,
  Typography,
  Tooltip,
  IconButton,
} from "@material-tailwind/react";
// import StatBox from '../../components/StatBox/StatBox';
import axios from "axios";
import swal from "sweetalert2";
// import { PencilIcon, TrashIcon, Icon } from "@heroicons/react/24/solid";
import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const TABLE_HEAD = [
  " SR No.",
  "Name",
  "Email",
  "Mobile Number",
  "Role",
  "Registered On",
  "Inactivated On",
  "Action",
];

function InactiveUsers(props) {
  const [userList, setUserList] = useState([]);
  const [userId, setUserId] = useState("");
  const [activeUserModal, setActiveUsersModal] = useState(false);
  useEffect(() => {
    getInactiveUserList();
  }, []);
  const getInactiveUserList = () => {
    const formValues = {
      companyID: 1,
      startRange: 0,
      limitRange: 50,
    };
    axios
      .post("/api/users/get/list/status/inactive", formValues)
      .then((response) => {
        console.log("response", response);
        var userList = [];
        for (let index = 0; index < response.data.length; index++) {
          let userData = {
            _id: response.data[index]._id,
            name: response.data[index].fullName,
            email: response.data[index].email,
            mobile: response.data[index].mobNumber,
            role: response.data[index].role,
            createdAt:
              response.data[index].createdAt != "-"
                ? moment(response.data[index].createdAt).format("llll")
                : "-",
            statusupdatedAt:
              response.data[index].statusupdatedAt != "-"
                ? moment(response.data[index].statusupdatedAt).format("llll")
                : "-",
            lastloggedin: response.data[index].lastLogin,
          };
          userList.push(userData);
        }
        setUserList(userList);
        console.log("userList", userList);
      })
      .catch((err) => console.log("err", err));
  };

  const activeUser = (id) => {
    setActiveUsersModal(false);
    const formValues = {
      userID: [id],
      status: "active",
      username: "",
    };
    // console.log("formValues",formValues);
    axios
      .patch("/api/users/patch/status", formValues)
      .then((res) => {
        // console.log("res",res)
        swal.fire(" ", "User activated Successfully.");
        getInactiveUserList();
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const handleDownload = () => {
    // Implement logic to generate and download the file
    // For example, you can generate a CSV file containing the user list
    // You can use libraries like 'json2csv' to convert JSON to CSV format

    // For demonstration purposes, let's assume you have userList available
    const csvContent =
      "data:text/csv;charset=utf-8," +
      userList.map((user) => Object.values(user).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_list.csv");
    document.body.appendChild(link);
    link.click();
  };
  return (
    <section className="w-full  ">
      <div className="p-7 text-xl font-semibold">
        <div className="flex justify-between border-b ">
          <h1 className="uppercase">Inactive Users</h1>
        </div>
        <div className="flex justify-end m-4">
          <FontAwesomeIcon
            icon={faDownload}
            className="text-green-500 cursor-pointer"
            onClick={handleDownload}
          />
        </div>
        <Card className="h-full w-full overflow-scroll">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="text-center border-b border-blue-gray-100 bg-blue-gray-50 p-4 bg-site"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none  text-white"
                    >
                      {head}
                    </Typography>
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
                      role,
                      createdAt,
                      statusupdatedAt,
                    },
                    index
                  ) => {
                    const isLast = index === userList.length - 1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-blue-gray-50";
                    console.log("userList1", userList);
                    return (
                      <tr key={index}>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal text-center"
                          >
                            {index + 1}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {name}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {email}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {mobile}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {role}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {createdAt}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {statusupdatedAt}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <div className="flex gap-6 justify-center">
                            <Button
                              className="bg-site"
                              onClick={() => {
                                // setActiveUsersModal(true);
                                // setUserId(_id);
                                activeUser(_id);
                              }}
                            >
                              Active User
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td colSpan={6}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal text-center p-2"
                    >
                      NO INACTIVE USERS FOUND
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
        <Modal
          show={activeUserModal}
          size="md"
          onClose={() => setActiveUsersModal(false)}
          popup
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to active this user?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="failure" onClick={() => activeUser(userId)}>
                  {"Yes, I'm sure"}
                </Button>
                <Button color="gray" onClick={() => setActiveUsersModal(false)}>
                  No, cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </section>
  );
}

export default InactiveUsers;
