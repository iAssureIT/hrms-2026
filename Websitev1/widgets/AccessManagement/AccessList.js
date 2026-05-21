"use client";
import React, { useEffect, useState } from 'react';
import { defaultAxios } from "@/axiosInstances";
import { useRouter } from 'next/navigation';
import Swal from "sweetalert2";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Tooltip } from "flowbite-react";
import { FaSpinner } from 'react-icons/fa';
import { RxCross2 } from "react-icons/rx";
import { IoCheckmarkSharp } from 'react-icons/io5';
import { FiPlusCircle } from 'react-icons/fi';

function AccessList() {

  const [arrRoles, setArrRoles] = useState([]);
  const [roleWiseData, setRoleWiseData] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getList();
  }, []);

  const getList = () => {
    setLoading(true);
    defaultAxios.get("/api/access/get/list")
      .then(access => {
        setArrRoles(access.data.allRoles || []);
        setRoleWiseData(access.data.roleWisePermissions || []);
        setLoading(false);
      })
      .catch((error) => {
        console.log("error", error);
        setLoading(false);
        Swal.fire({ text: "Something went wrong while getting access list!", confirmButtonColor: "#3c8dbc" });
      });
  };

  const handleEdit = (id) => {
    router.push(`/admin/access-management/access-allocation/${id}`);
  };

  const handleDelete = (id) => {
    Swal.fire({
      text: "Do you want to delete this role's access?",
      showCancelButton: true,
      cancelButtonText: "No, Cancel",
      confirmButtonColor: "#ed3343",
      cancelButtonColor: "#3c8dbc",
      confirmButtonText: "Yes, Delete",
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        defaultAxios.delete(`/api/access/delete/${id}`).then(() => {
          Swal.fire({ text: "Role access has been deleted.", confirmButtonColor: "#3c8dbc" });
          getList();
        });
      }
    }).catch(error => {
      console.log("error", error);
    });
  };

  return (
    <section className="hr-section w-full">
      <div className="admin-box box-primary hr-fade-in">

        {/* Box Header */}
        <div className="admin-box-header with-border !px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 w-full">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-1">
                <span className="text-[#3c8dbc]">Security & Role Management</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Access <span className="text-[#3c8dbc] font-black">List</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-2xl text-xs leading-relaxed mt-1">
                Overview of all role-based access configurations across system modules.
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/access-management/access-allocation")}
              className="admin-btn-primary flex items-center gap-2 mt-4 md:mt-0"
            >
              <FiPlusCircle size={15} />
              <span>Add Access</span>
            </button>
          </div>
        </div>

        {/* Box Body */}
        <div className="admin-box-body p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner className="animate-spin text-3xl text-[#3c8dbc] mb-4" />
              <p className="text-gray-400 font-bold italic uppercase tracking-widest text-[10px]">Loading access data...</p>
            </div>
          ) : arrRoles && arrRoles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead className="admin-table-thead">
                  <tr>
                    <th className="admin-table-th text-left w-48">Module / Permission</th>
                    {arrRoles.map((role, index) => (
                      <th key={index} className="admin-table-th text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="capitalize">{role.name}</span>
                          <div className="flex gap-1.5">
                            <Tooltip content="Edit Access" placement="top" className="bg-[#3c8dbc]" arrow={false}>
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                onClick={() => handleEdit(role.id)}
                              >
                                <MdOutlineEdit size={15} />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete Access" placement="top" className="bg-red-500" arrow={false}>
                              <button
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                onClick={() => handleDelete(role.id)}
                              >
                                <RiDeleteBin6Line size={15} />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roleWiseData.length > 0 && roleWiseData.map((roleData, index) => (
                    <React.Fragment key={index}>
                      {/* Module name row */}
                      <tr>
                        <td
                          colSpan={arrRoles.length + 1}
                          className="admin-table-td !bg-slate-50 !py-2"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#3c8dbc]">
                            {roleData.moduleName}
                          </span>
                        </td>
                      </tr>
                      {/* Permission rows */}
                      {roleData.permissions.map((perm, permIndex) => (
                        <tr key={permIndex} className="hover:bg-gray-50 transition-colors">
                          <td className="admin-table-td font-medium capitalize text-slate-600 pl-6 !py-2">
                            {perm.permission}
                          </td>
                          {Object.keys(perm).map((key, idx) =>
                            key !== 'permission' && (
                              <td key={idx} className="admin-table-td text-center !py-2">
                                {perm[key]
                                  ? <IoCheckmarkSharp className="text-green-500 text-lg mx-auto" />
                                  : <RxCross2 className="text-red-400 text-base mx-auto" />
                                }
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold italic uppercase tracking-widest text-[10px]">No access records found</p>
              <button
                onClick={() => router.push("/admin/access-management/access-allocation")}
                className="admin-btn-primary flex items-center gap-2 mt-4"
              >
                <FiPlusCircle size={15} />
                <span>Add First Access Record</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AccessList;
