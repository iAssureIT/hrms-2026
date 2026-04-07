"use client";
import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Tooltip,
  IconButton,
} from "@material-tailwind/react";
import axios from "axios";
import { useForm } from "react-hook-form";
import swal from "sweetalert2";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiFillProject } from "react-icons/ai";
import { FaEdit, FaSpinner } from "react-icons/fa";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";

const TABLE_HEAD = ["Role", "Action"];
const oneFieldButton =
  "text-white bg-gradient-to-r bg-[#4285F4] placeholder-font-normal hover:bg-[#4879be] focus:outline-none focus:ring-green dark:focus:ring-green shadow-lg inline-flex items-center font-normal rounded-sm text-sm px-5 h-8 text-center mb-2";
const oneFieldInput =
  "text-black rounded-e-md focus:shadow-md block flex-1 min-w-0 w-full text-sm border-gray-300 p-2 outline-none";

function AddRole() {
  const [open, setOpen] = useState(true);
  const [roleList, setRoleList] = useState([]);
  const [update, setUpdate] = useState(false);
  const [role, setRole] = useState("");
  const [role_id, setRoleId] = useState("");
  const [user_id, setUser_id] = useState("");
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    var user = JSON.parse(localStorage.getItem("userDetails"));
    setUser_id(user?.user_id);
    getRoleList();
  }, [1]);

  const onSubmit = (data) => {
    if (update) {
      var formValues = {
        fieldValue: data.role.toString().toLowerCase(),
        fieldID: role_id,
        updatedBy: user_id,
      };
      axios
        .patch("/api/roles/patch", formValues)
        .then((response) => {
          if (response.data.updated) {
            swal.fire(" ", "Role Updated Successfully.");
          } else if (!response.data.updated) {
            swal.fire(" ", "Role is not modified.");
          } else if (response.data.duplicated) {
            swal.fire(" ", "Role already exists!");
          } else {
            swal.fire(" ", "Role is not modified.");
          }
          setUpdate(false);
          setRoleId("");
          getRoleList();
          setRole("");
        })
        .catch((error) => {
          console.log("error", error);
        });
    } else {
      var formValues = {
        fieldValue: data.role.toString().toLowerCase(),
        user_id: user_id,
      };
      axios
        .post("/api/roles/post", formValues)
        .then((response) => {
          if (response.data.created) {
            swal.fire(" ", "Role Added Successfully.");
          } else {
            swal.fire(" ", "Role Already Exists.");
          }
          getRoleList();
          setRole("");
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  };

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
        setRoleList(roleList);
        if (response.data.length > 0) {
          setLoading(false);
        }
      })
      .catch((err) => console.log("err", err));
  };

  const editUser = (data) => {
    setUpdate(true);
    setRole(data.role);
    setRoleId(data.role_id);
  };

  const deleteRole = (data) => {
    // console.log("role", data);

    swal
      .fire({
        title: " ",
        text: `Are you sure you want to delete this Role?`,
        showCancelButton: true,
        cancelButtonText: "No, Don't Delete!",
        cancelButtonColor: "#50c878",
        confirmButtonText: "Yes, delete it!",
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          confirmButton: "delete-btn",
        },
      })
      .then((result) => {
        if (result.isConfirmed) {
          axios
            .delete("/api/roles/delete/" + data.role_id)
            .then((deletedUser) => {
              swal.fire(" ", "Role Deleted Successfully.");
              getRoleList();
            })
            .catch((error) => {
              console.log(
                "Error Message from userslist delete redirect  => ",
                error
              );
              swal.fire(" ", "Something Went Wrong <br/>" + error.message);
            });
        }
      });
  };

  return (
    <section className="w-full">
      <div className=" flex flex-col shadow-none z-50 mx-auto pt-20">
        <div className="space-y-6 pb-10 ">
          <form className="" onSubmit={handleSubmit(onSubmit)}>
            <div className="mx-auto w-full">
              {/* <div className="inline-flex text-center">
                <h2 className="inputLabel">
                  Role
                  <span className="text-red-400 ms-1">*</span>
                </h2>
              </div> */}

              <div className="">
                {/* <span className="inline-flex items-center px-3 text-sm text-gray-900  border rounded-e-0 border-gray-300 border-e-0 rounded-s-md">
                 
                  <AiFillProject className="icon"/>
                </span>
                <div className="flex border border-gray-300 w-full rounded-e-md">
                  <input
                    type="text"
                    id="role"
                    {...register("role", { required: true })}
                    value={role}
                    className="stdInputField"
                    // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Add Role..."
                    required
                    onChange={(e) => setRole(e.value)}
                  />
                </div> */}
                <label htmlFor="center-name" className="inputLabel mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-gray-300 rounded-md shadow-sm w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <AiFillProject className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    id="role"
                    {...register("role", { required: true })}
                    value={role}
                    className="block rounded-md border-0 py-1.5 w-full pl-12 font-normal
                  text-gray-900 ring-1 ring-inset ring-grayTwo text-[16px] placeholder:text-[16px]
                  placeholder:text-grayThree placeholder-font-normal focus:ring-2 focus:ring-inset focus:ring-green"
                    // className="stdInputField"
                    placeholder="Add Role..."
                    required
                    onChange={(e) => setRole(e.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="formButtons"
                  // className="text-white bg-site hover:bg-site focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-10 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {update ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          </form>
          {/* <Card className="h-full  w-full"> */}
          <div className="relative overflow-x-auto mt-2  mx-auto  border-3 mb-10 rounderd-md ">
            <table className="w-full border-separate border-spacing-y-2 text-sm  rtl:text-right  text-gray-500 dark:text-gray-400w-full min-w-max table-auto text-left">
              <thead className="text-xs text-gray-700  uppercase  px-10 dark:text-gray-400  border border-grayTwo">
                <tr className="font-bold text-gray-900 whitespace-nowrap dark:text-white py-4">
                  {/* {TABLE_HEAD.map((head) => ( */}
                  <th
                    // key={head}
                    className="ps-32 py-6 border border-grayTwo border-r-0 font-semibold"
                  >
                    Role
                  </th>
                  <th className="ps-36 py-6 border border-grayTwo border-l-0 font-semibold">
                    Action
                  </th>

                  {/* ))} */}
                </tr>
              </thead>
              <tbody>
                {roleList && roleList.length > 0 ? (
                  roleList.map(({ role, role_id }, index) => {
                    const isLast = index === roleList.length - 1;
                    const classes = isLast
                      ? "p-4 text-center"
                      : "p-4 border-b border-blue-gray-50 text-center";
                    return (
                      <tr
                        key={role}
                        className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo  text-gray-900 font-normal"
                      >
                        <td className="ps-24 py-4 font-normal border border-grayTwo border-r-0">
                          {role}
                        </td>
                        <td className="ps-32 py-4 border border-grayTwo border-l-0">
                          <Tooltip content="Edit User">
                            <IconButton
                              variant="text"
                              onClick={() => editUser(roleList[index])}
                            >
                              <MdOutlineEdit
                                className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                size={"1.3rem"}
                                onClick={() => editUser(roleList[index])}
                              />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Delete User">
                            <IconButton
                              variant="text"
                              onClick={() => {
                                // deleteRole(roleList[index]);
                                deleteRole(roleList[index]);
                              }}
                            >
                              <RiDeleteBin6Line
                                className="border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                size={"1.3rem"}
                                onClick={() => {
                                  // redirect("delete", value._id);
                                  // setRoleDeleteModal(true);
                                  deleteRole(roleList[index]);
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })
                ) : loading ? (
                  <tr>
                    <td colSpan={2} className="text-center text-lg">
                      <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="text-black uppercase">No Data Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* </Card> */}
        </div>
      </div>
    </section>
  );
}

export default AddRole;
