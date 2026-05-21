"use client";
import React, { useEffect, useState } from 'react';
import { defaultAxios } from "@/axiosInstances";
import { useRouter } from 'next/navigation';
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import { FaUserShield } from "react-icons/fa";
import validator from 'validator';
import { FaSpinner } from 'react-icons/fa';
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { IoCheckmarkSharp } from "react-icons/io5";

function AccessManager() {

  const moduleList = JSON.parse(process.env.ACCESS_MANAGEMENT_ARRAY || '[]');
  const [selectedRole, setSelectedRole] = useState("");
  const [roleApi, setRoleApi] = useState([]);
  const [moduleAccessArr, setModuleAccessArr] = useState([]);
  const [error, setError] = useState({});
  const [user_id, setUser_id] = useState("");
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userDetailsStr = localStorage.getItem("userDetails");
    if (userDetailsStr) {
      const user = JSON.parse(userDetailsStr);
      setUser_id(user?.user_id);
    }
  }, []);

  const handleCBChange = (event) => {
    const cbid = event.target.id;
    const [moduleName, permission] = cbid.split("-");
    const updatedModuleAccessArr = [...moduleAccessArr];
    const moduleIndex = updatedModuleAccessArr.findIndex(x => x.moduleName === moduleName);
    if (moduleIndex === -1) return;
    const modulePermissions = updatedModuleAccessArr[moduleIndex];
    modulePermissions[permission] = event.target.checked;
    if (permission === 'all') {
      modulePermissions.create = modulePermissions.view = modulePermissions.list =
        modulePermissions.edit = modulePermissions.delete = event.target.checked;
    } else {
      if (!event.target.checked && modulePermissions.all) {
        modulePermissions.all = false;
      } else if (modulePermissions.create && modulePermissions.view && modulePermissions.list &&
        modulePermissions.edit && modulePermissions.delete) {
        modulePermissions.all = true;
      }
    }
    setModuleAccessArr(updatedModuleAccessArr);
  };

  useEffect(() => {
    if (moduleList.length > 0) {
      defaultAxios.post("/api/roles/get/list")
        .then(role => {
          setRoleApi(role.data || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          Swal.fire({ text: "Something went wrong while getting role list!", confirmButtonColor: "#3c8dbc" });
        });

      const initialModuleAccessArr = moduleList.map(moduleName => ({
        moduleName,
        all: false,
        create: false,
        view: false,
        list: false,
        edit: false,
        delete: false
      }));
      setModuleAccessArr(initialModuleAccessArr);

      if (params?._id) {
        defaultAxios.get("/api/access/role/" + params?._id)
          .then(res => {
            setSelectedRole(res.data.role);
            const updatedModuleAccessArr = initialModuleAccessArr?.map(module => {
              const fetchedPermissions = res.data.permissions.find(p => p.moduleName === module.moduleName);
              if (fetchedPermissions) {
                return {
                  ...module,
                  all: fetchedPermissions.all || module.all,
                  create: fetchedPermissions.create || module.create,
                  view: fetchedPermissions.view || module.view,
                  list: fetchedPermissions.list || module.list,
                  edit: fetchedPermissions.edit || module.edit,
                  delete: fetchedPermissions.delete || module.delete
                };
              }
              return module;
            });
            setModuleAccessArr(updatedModuleAccessArr);
          })
          .catch(() => {
            Swal.fire({ text: "Something went wrong while getting selected role!", confirmButtonColor: "#3c8dbc" });
          });
      }
    }
  }, []);

  const validation = () => {
    let validate = true;
    let errorMsg = {};
    if (validator.isEmpty(selectedRole) || selectedRole === "Select Role") {
      validate = false;
      errorMsg.selectedRole = "This field is mandatory";
      setError(errorMsg);
    }
    return validate;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validation()) {
      let formValues = {
        id: params?._id ? params?._id : "",
        role: selectedRole,
        modulePermissions: moduleAccessArr,
        user_id: user_id,
      };
      if (params && params?._id) {
        defaultAxios.patch("/api/access/update", formValues)
          .then((accessRes) => {
            const resetModulePermissions = moduleAccessArr?.map(module => ({
              ...module, all: false, create: false, view: false, list: false, edit: false, delete: false,
            }));
            setSelectedRole(""); setModuleAccessArr(resetModulePermissions); setError({});
            if (accessRes.data.success) {
              Swal.fire({ text: "Access updated successfully.", confirmButtonColor: "#3c8dbc" });
              router.push("/admin/access-management/access-list");
            } else if (accessRes.data.duplicated) {
              Swal.fire({ text: accessRes.data.message, confirmButtonColor: "#3c8dbc" });
            } else {
              Swal.fire({ text: "No Changes Found!! Hence Not Updated.", confirmButtonColor: "#3c8dbc" });
            }
          }).catch(() => {
            Swal.fire({ text: "Something went wrong during Access Form update", confirmButtonColor: "#3c8dbc" });
          });
      } else {
        defaultAxios.post("/api/access/post", formValues)
          .then((accessRes) => {
            const resetModulePermissions = moduleAccessArr.map(module => ({
              ...module, all: false, create: false, view: false, list: false, edit: false, delete: false,
            }));
            setSelectedRole(""); setModuleAccessArr(resetModulePermissions); setError({});
            if (accessRes.data.success) {
              Swal.fire({ text: "Access added successfully.", confirmButtonColor: "#3c8dbc" });
              router.push("/admin/access-management/access-list");
            } else if (accessRes.data.duplicated) {
              Swal.fire({ text: accessRes.data.message, confirmButtonColor: "#3c8dbc" });
            }
          }).catch(() => {
            Swal.fire({ text: "Something went wrong during Access Form Submission", confirmButtonColor: "#3c8dbc" });
          });
      }
    }
  };

  const PERMISSIONS = ["all", "create", "view", "list", "edit", "delete"];

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
              Access <span className="text-[#3c8dbc] font-black">Allocation</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl text-xs leading-relaxed mt-1">
              {params?._id
                ? "Update module-level permissions for the selected role."
                : "Assign module-level permissions to roles to control user access across the system."}
            </p>
          </div>
        </div>

        {/* Box Body */}
        <div className="admin-box-body p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner className="animate-spin text-3xl text-[#3c8dbc] mb-4" />
              <p className="text-gray-400 font-bold italic uppercase tracking-widest text-[10px]">Loading data...</p>
            </div>
          ) : (
            <>
              {/* Role Selector */}
              <div className="mb-8">
                <h3 className="admin-box-title !text-sm mb-4">Select Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="admin-form-group mb-0">
                    <label className="admin-label">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                        <FaUserShield size={14} />
                      </span>
                      <select
                        id="role"
                        className="admin-input !pl-9"
                        disabled={params?._id ? true : false}
                        onChange={(e) => { setSelectedRole(e.target.value); setError({}); }}
                        value={selectedRole}
                      >
                        <option value="" disabled>Select Role</option>
                        {roleApi && roleApi.length > 0
                          ? roleApi.map((roleapi, index) => (
                            <option key={index} value={roleapi.role}>{roleapi.role}</option>
                          ))
                          : <option disabled>No roles found</option>
                        }
                      </select>
                    </div>
                    {error.selectedRole && (
                      <p className="text-red-500 font-normal text-[12px] mt-1">{error.selectedRole}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions Table */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="admin-box-title !text-sm mb-6">Module Permissions</h3>
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead className="admin-table-thead">
                      <tr>
                        <th className="admin-table-th text-left">Module</th>
                        {PERMISSIONS.map(perm => (
                          <th key={perm} className="admin-table-th text-center capitalize">{perm}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {moduleList && moduleList.length > 0 ? (
                        moduleList.map((accessName, index) => {
                          const moduleAccessObj = moduleAccessArr.find(x => x.moduleName === accessName);
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="admin-table-td font-semibold capitalize">
                                {accessName}
                              </td>
                              {PERMISSIONS.map(perm => (
                                <td key={perm} className="admin-table-td text-center">
                                  <input
                                    type="checkbox"
                                    id={`${accessName}-${perm}`}
                                    className="h-4 w-4 rounded border-gray-300 text-[#3c8dbc] cursor-pointer accent-[#3c8dbc]"
                                    checked={moduleAccessObj?.[perm] || false}
                                    onChange={(event) => handleCBChange(event)}
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="admin-table-td text-center text-gray-400 italic py-8">
                            No modules configured
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-8 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  onClick={(event) => handleSubmit(event)}
                  className="admin-btn-primary flex items-center gap-2"
                >
                  <span>{params._id ? "Update Changes" : "Save Record"}</span>
                  <MdKeyboardDoubleArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default AccessManager;