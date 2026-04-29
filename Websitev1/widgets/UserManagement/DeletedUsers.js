"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faUser } from "@fortawesome/free-solid-svg-icons";
import { MdClose } from "react-icons/md";
import { useState, useEffect } from "react";
import {
  Tooltip,
  IconButton,
} from "@material-tailwind/react";
// import StatBox from '../../components/StatBox/StatBox';
import axios from "axios";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
// import { PencilIcon, TrashIcon, Icon } from "@heroicons/react/24/solid";
import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const TABLE_HEAD = [
  "Name",
  "Email",
  "Mobile Number",
  "Role",
  // "Status",
  "Action",
];

function DeletedUsers(props) {
  const [userList, setUserList] = useState([]);
  const [userId, setUserId] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);
  const [deleteFailModal, setDeleteFailModal] = useState(false);

  const [restoreModal, setRestoreModal] = useState(false);
  const [restoreSuccessModal, setRestoreSuccessModal] = useState(false);
  const [restoreFailModal, setRestoreFailModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getDeletedUserList();
  }, []);

  const getDeletedUserList = () => {
    var formValues = {
      companyID: 1,
    };
    axios
      .post("/api/users/post/deleteduser/list", formValues)
      .then((response) => {
        var userList = [];
        for (let index = 0; index < response.data.length; index++) {
          let userData = {
            _id: response.data[index]._id,
            firstname: response.data[index].firstname,
            lastname: response.data[index].lastname,
            email: response.data[index].email,
            mobile: response.data[index].mobNumber,
            role:
              "<div class='text-left'>" +
              response.data[index].role
                ?.join(", ")
                .replace(/, ([^,]*)$/, ", $1") +
              "</div>",
            // role: response.data[index].role,
            status: response.data[index].status,
            lastloggedin: response.data[index].lastLogin,
          };
          userList.push(userData);
        }
        setUserList(userList);
      })
      .catch((err) => console.log("err", err));
  };

  const deleteUser = (id) => {
    // setDeleteModal(false);

    Swal.fire({
      title: " ",
      text: "Are you sure you want to delete this User permananetly?",
      // icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No, Don't Delete!",
      // confirmButtonColor: "#3085d6",
      cancelButtonColor: "#3c8dbc",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        confirmButton: "delete-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete("/api/users/delete/" + id)
          .then((deletedUser) => {
            console.log("deletedUser", deletedUser);
            props.getUserList();
            Swal.fire({
              title: " ",
              text: "User has been permanently deleted.",
            });
          })
          .catch((error) => {
            console.log(
              "Error Message from deleted userslist delete redirect  => ",
              error
            );
            Swal.fire(" ", "Something Went Wrong <br/>" + error.message);
          });
      }
    });
  };

  const restoreUser = (id) => {
    // setRestoreModal(false);

    Swal.fire({
      title: " ",
      text: "Are you sure you want to restore this User?",
      // icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No, don't restore!",
      // confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, restore it!",
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch("/api/users/patch/restorestatus", {
            user_id_toberecover: id,
          })
          .then((deletedUser) => {
            props.getUserList();
            Swal.fire({
              title: " ",
              text: "User has been restored successfully.",
            });
          })
          .catch((error) => {
            console.log(
              "Error Message from deleted userslist delete redirect  => ",
              error
            );
            Swal.fire(" ", "Something Went Wrong <br/>" + error.message);
          });
      }
    });
  };

  return (
    <div className="w-full  ">
      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-b border-slate-200 p-4 text-left"
                >
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    {head}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {userList && userList.length > 0 ? (
              userList.map(
                (
                  { _id, firstname, lastname, email, mobile, role, status },
                  index
                ) => {
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 border-b border-slate-50">
                        <span className="text-sm font-bold text-slate-800">{firstname} {lastname}</span>
                      </td>
                      <td className="p-4 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-600">{email}</span>
                      </td>
                      <td className="p-4 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-600">{mobile}</span>
                      </td>
                      <td className="p-4 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-700" dangerouslySetInnerHTML={{ __html: role }} />
                      </td>
                      {/* <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className={
                            status === "active"
                              ? "bg-green-400 font-normal flex justify-center text-white p-1 rounded"
                              : "bg-red-400 text-white font-normal flex justify-center p-1 rounded"
                          }
                        >
                          {status}
                        </Typography>
                      </td> */}
                      <td className="p-4 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                          <button
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded text-xs font-bold transition-all active:scale-95 shadow-sm"
                            onClick={() => restoreUser(_id)}
                          >
                            Restore User
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs font-bold transition-all active:scale-95 shadow-sm"
                            onClick={() => deleteUser(_id)}
                          >
                            Delete Permanently
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td colSpan={6}>
                    <span className="text-sm font-medium text-slate-400 block text-center py-8 uppercase tracking-widest">NO DELETED USERS FOUND</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* <Modal
        show={deleteModal}
        size="md"
        onClose={() => setDeleteModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete permananetly this user?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteUser()}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal> */}

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
              Are you sure you want to permanently delete this User?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalFailBtn"
                onClick={() => {
                  setDeleteModal(false);
                  setDeleteFailModal(true);
                }}
              >
                No
              </button>
              <button
                className="modalSuccessBtn"
                onClick={() => {
                  deleteUser();
                  setDeleteModal(false);
                  setDeleteSuccessModal(true);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

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
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody"> */}
      {/* {Swal.fire({ icon: "success" })} */}
      {/* <h3 className="modalText">User details are safe</h3>
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
        show={restoreModal}
        size="md"
        dismissible
        onClose={() => setRestoreModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setRestoreModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">
              Are you sure you want to restore this User?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalFailBtn"
                onClick={() => {
                  setRestoreModal(false);
                  setRestoreFailModal(true);
                }}
              >
                No
              </button>
              <button
                className="modalSuccessBtn"
                onClick={() => {
                  restoreUser();
                  setRestoreModal(false);
                  setRestoreSuccessModal(true);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={restoreSuccessModal}
        size="md"
        onClose={() => {
          setRestoreSuccessModal(false);
          getDeletedUserList();
          props.getUserList();
        }}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => {
              setRestoreSuccessModal(false);
              getDeletedUserList();
              props.getUserList();
            }}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            {/* {Swal.fire({ icon: "success" })} */}
            <h3 className="modalText">User Restored Successfully</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => {
                  setRestoreSuccessModal(false);
                  getDeletedUserList();
                  props.getUserList();
                }}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={restoreFailModal}
        size="md"
        onClose={() => setRestoreFailModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setRestoreFailModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            {/* {Swal.fire({ icon: "success" })} */}
            <h3 className="modalText">User is not restored</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setRestoreFailModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default DeletedUsers;
