"use client";
import React, { useState, useEffect } from "react";
import swal from "sweetalert2";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import { Tooltip } from "flowbite-react";
import { defaultAxios } from "@/axiosInstances";

function AddRole() {
  const [roleList, setRoleList] = useState([]);
  const [update, setUpdate] = useState(false);
  const [role, setRole] = useState("");
  const [role_id, setRoleId] = useState("");
  const [user_id, setUser_id] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const user = JSON.parse(userDetails);
      setUser_id(user?.user_id);
    }
    getRoleList();
  }, []);

  const getRoleList = () => {
    setLoading(true);
    defaultAxios
      .post("/api/roles/get/list")
      .then((response) => {
        setRoleList(response.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log("err", err);
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role || role.trim() === "") {
      setErrorMessage("Role name is required");
      return;
    }

    if (update) {
      const formValues = {
        fieldValue: role.toString().toLowerCase(),
        fieldID: role_id,
        updatedBy: user_id,
      };
      defaultAxios
        .patch("/api/roles/patch", formValues)
        .then((response) => {
          if (response.data.updated) {
            swal.fire(" ", "Role Updated Successfully.");
            setUpdate(false);
            setRoleId("");
            setRole("");
            getRoleList();
          } else if (response.data.duplicated || response.data.message?.includes("already exists")) {
            swal.fire(" ", "Role already exists!");
          } else {
            swal.fire(" ", "Role is not modified.");
          }
        })
        .catch((error) => {
          console.log("error", error);
          swal.fire(" ", "Error updating role.");
        });
    } else {
      const formValues = {
        fieldValue: role.toString().toLowerCase(),
        user_ID: user_id,
      };
      defaultAxios
        .post("/api/roles/post", formValues)
        .then((response) => {
          if (response.data.created) {
            swal.fire(" ", "Role Added Successfully.");
            setRole("");
            getRoleList();
          } else if (response.data.duplicated || response.data.message?.includes("already exists")) {
            swal.fire(" ", "Role Already Exists.");
          } else {
            swal.fire(" ", "Something went wrong.");
          }
        })
        .catch((error) => {
          console.log("error", error);
          swal.fire(" ", "Error adding role.");
        });
    }
  };

  const handleEdit = (item) => {
    setUpdate(true);
    setRole(item.role);
    setRoleId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    swal
      .fire({
        title: " ",
        text: `Are you sure you want to delete this Role?`,
        showCancelButton: true,
        cancelButtonText: "No, Don't Delete!",
        cancelButtonColor: "#3c8dbc",
        confirmButtonText: "Yes, delete it!",
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          confirmButton: "delete-btn",
        },
      })
      .then((result) => {
        if (result.isConfirmed) {
          defaultAxios
            .delete("/api/roles/delete/" + id)
            .then((response) => {
              if (response.data.deleted) {
                swal.fire(" ", "Role Deleted Successfully.");
                getRoleList();
              } else {
                swal.fire(" ", "Role could not be deleted.");
              }
            })
            .catch((error) => {
              console.log("Error Message from delete => ", error);
              swal.fire(" ", "Something Went Wrong <br/>" + error.message);
            });
        }
      });
  };

  return (
    <section className="hr-section w-full">
      <div className="admin-box box-primary hr-fade-in">
        {/* Box Header */}
        <div className="admin-box-header with-border !px-6">
          <div className="flex flex-col py-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-1">
              <span className="text-[#3c8dbc]">Security & Role Management</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Role <span className="text-[#3c8dbc] font-black">Management</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl text-xs leading-relaxed mt-1">
              Define organizational roles and hierarchical access levels to ensure secure and granular control over system modules and user permissions.
            </p>
          </div>
        </div>

        {/* Box Body */}
        <div className="admin-box-body p-6">
          <div className="max-w-5xl">
            {/* Form Section */}
            <div className="mb-10">
              <div className="mb-4">
                <h3 className="admin-box-title !text-sm">Add New Role</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="admin-form-group mb-0">
                    <label className="admin-label">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Enter Role name"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                        setErrorMessage("");
                      }}
                      required
                    />
                    {errorMessage && (
                      <p className="text-red-500 font-normal text-[12px] mt-1">
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="submit"
                      className="admin-btn-primary"
                    >
                      {update ? "Update Changes" : "Save Record"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* List Section */}
            <div className="border-t border-gray-100 pt-10">
              <div className="mb-6">
                <h3 className="admin-box-title !text-sm">Existing Role List</h3>
              </div>

              <div className="relative text-left w-full">
                {roleList && roleList.length > 0 ? (
                  <div className="table-responsive overflow-x-auto">
                    <table className="admin-table">
                      <thead className="admin-table-thead">
                        <tr>
                          <th className="admin-table-th w-24 text-center">SR. No.</th>
                          <th className="admin-table-th">Role Name</th>
                          <th className="admin-table-th w-32 text-center">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roleList.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="admin-table-td font-bold text-center">
                              {index + 1}
                            </td>
                            <td className="admin-table-td capitalize font-semibold">
                              {item.role}
                            </td>
                            <td className="admin-table-td">
                              <div className="flex gap-2 justify-center">
                                <Tooltip content="Edit Role" placement="top" className="bg-[#3c8dbc]" arrow={false}>
                                  <button
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <MdOutlineEdit size={18} />
                                  </button>
                                </Tooltip>
                                <Tooltip content="Delete Role" placement="top" className="bg-red-500" arrow={false}>
                                  <button
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    onClick={() => handleDelete(item._id)}
                                  >
                                    <RiDeleteBin6Line size={18} />
                                  </button>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : loading ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <FaSpinner className="animate-spin text-3xl text-[#3c8dbc] mb-4" />
                    <p className="text-gray-400 font-bold italic uppercase tracking-widest text-[10px]">Loading roles...</p>
                  </div>
                ) : (
                  <div className="w-full text-center py-8 text-gray-400 font-bold italic bg-gray-50 border border-dashed border-gray-200">
                    No roles discovered yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AddRole;
