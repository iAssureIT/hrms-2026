"use client";
import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { IoCheckmarkSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { defaultAxios,kylasAxios } from "@/axiosInstances";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Tooltip } from "flowbite-react";
import Swal from "sweetalert2";
import { getRolePermission } from '@/utils/rolePermission.js';

function AccessProfile() {
    const [rolesData, setRolesData] = useState([]); // To store all roles
    const [loading, setLoading] = useState(true);
    const [permission, setPermission] = useState({ hasAccess: false, subModules: [] });
    const router = useRouter();

    // Function to fetch multiple roles data
    const fetchRolesData = () => {
        setLoading(true);
        defaultAxios
            .get(`/api/access/roles`) // Assuming the API provides all roles at once
            .then((response) => {
                setRolesData(response.data || []); // Set the entire list of roles
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                Swal.fire({
                    text: "Something went wrong while getting access list!",
                    confirmButtonColor: "#42bcf5",
                    customClass: { popup: "custom-swal-border" },
                });
            });
    };

    useEffect(() => {
        fetchRolesData();
        const result = getRolePermission('/admin/access-management');
        
        setPermission(result);
    }, []);

    const handleEdit = (id) => {
        router.push(`/admin/access-management/access-allocation/${id}`);
    };

    const handleDelete = (id) => {
        Swal.fire({
            text: "Do you want to delete this role's access?",
            showCancelButton: true,
            cancelButtonText: " No ",
            confirmButtonColor: "#ed3343",
            cancelButtonColor: "#42bcf5",
            confirmButtonText: " Confirm ",
            reverseButtons: true,
            focusCancel: true,
            customClass: {
                popup: 'custom-swal-border',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                defaultAxios.delete(`/api/access/delete/${id}`).then(() => {
                    Swal.fire({
                        text: "Role access has been deleted.",
                        confirmButtonColor: "#42bcf5",
                        customClass: { popup: 'custom-swal-border' },
                    });
                    fetchRolesData(); // Refetch roles after deletion
                });
            }
        });
    };

    const getIcon = (isChecked) => {
        return isChecked ? (
            <IoCheckmarkSharp className="text-green text-center text-2xl" />
        ) : (
            <RxCross2 className="text-red-600 text-center text-xl" />
        );
    };

    return (
        <section className="bg-white section text-black">
            <div className="box border-2 rounded-md shadow-md min-h-screen">
                <div className="text-xl font-semibold">
                    <div className="shadow flex justify-between">
                        <h1 className="heading">Access Management</h1>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center pt-32">
                        <FaSpinner className="animate-spin mx-2 text-2xl text-black text-center" />
                    </div>
                ) : rolesData && rolesData.length > 0 ? (
                    <div className="p-3">
                        {rolesData.map((roleData, roleIndex) => (
                            <div key={roleIndex} className="mb-8">
                                {/* Role Header */}
                                <div className="flex justify-between">
                                    <div className="ps-28 pt-10 pb-5">
                                        <div>
                                            <label className="inputLabel">Role</label>
                                            <div className="mt-2">
                                                <div className="font-medium text-lg">{roleData.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pe-28 pt-10">
                                        <div className="flex gap-5">
                                            <span className="flex gap-5">
                                                {
                                                    permission?.subModules?.edit
                                                        ?
                                                        <span>
                                                            <Tooltip content="Edit" placement="bottom" className="bg-mediumBlue" arrow={false}>
                                                                <MdOutlineEdit
                                                                    className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-700 hover:text-gray-700"
                                                                    size={"1.8rem"}
                                                                    onClick={() => handleEdit(roleData._id)}
                                                                />
                                                            </Tooltip>
                                                        </span>
                                                        : null}
                                                {
                                                    permission?.subModules?.delete
                                                        ?
                                                        <span>
                                                            <Tooltip content="Delete" placement="bottom" className="bg-darkRed" arrow={false}>
                                                                <RiDeleteBin6Line
                                                                    className="border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-700 hover:text-red-700"
                                                                    size={"1.8rem"}
                                                                    onClick={() => handleDelete(roleData._id)}
                                                                />
                                                            </Tooltip>
                                                        </span>
                                                        : null}
                                            </span>


                                        </div>
                                    </div>
                                </div>

                                {/* Role Permissions Table */}
                                <div className="overflow-x-auto lg:mx-28 md:mx-28 mx-1">
                                    <table className="border-separate border-spacing-y-2 w-full">
                                        <thead className="text-center font-normal bg-white">
                                            <tr>
                                                <th className="border-t border-b border-gray-300 text-sm py-5 ps-2 text-left border-l rounded-tl-md rounded-bl-md">
                                                    Module
                                                </th>
                                                <th className="border-t border-b border-gray-300 text-sm py-5">All</th>
                                                <th className="border-t border-b border-gray-300 text-sm py-5">Create</th>
                                                <th className="border-t border-b border-gray-300 text-sm py-5">View</th>
                                                <th className="border-t border-b border-gray-300 text-sm py-5">List</th>
                                                <th className="border-t border-b border-gray-300 text-sm py-5">Edit</th>
                                                <th className="border-t border-b border-gray-300 text-sm py-5 border-r rounded-tr-md rounded-br-md">
                                                    Delete
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-left font-normal">
                                            {roleData.permissions && roleData.permissions.length > 0 ? (
                                                roleData.permissions.map((permission, index) => (
                                                    <tr key={permission._id.$oid} className="text-center">
                                                        <td
                                                            className={`min-w-3 ps-2 whitespace-nowrap text-sm font-medium text-left py-3 border-r-0 rounded-tl-md rounded-bl-md text-black ${index % 2 === 0
                                                                ? "bg-gray-100"
                                                                : "bg-white"
                                                                }`}
                                                        >
                                                            {permission.moduleName}
                                                        </td>
                                                        {["all", "create", "view", "list", "edit", "delete"].map(
                                                            (accessType, idx) => (
                                                                <td
                                                                    key={idx}
                                                                    className={`p-3 py-5   border-l-0 text-black ${idx === 0
                                                                        ? "border-l-0 border-r-0"
                                                                        : idx === 5
                                                                            ? "border-r rounded-tr-md rounded-br-md"
                                                                            : "border-r-0"
                                                                        } ${index % 2 === 0
                                                                            ? "border bg-gray-100"
                                                                            : "border bg-white"
                                                                        } flex-1`}
                                                                >
                                                                    <div className="flex justify-center">
                                                                        {getIcon(permission[accessType])}
                                                                    </div>
                                                                </td>
                                                            )
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className="text-center">
                                                    <td colSpan={7}>Data not found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center pt-32">
                        <p className="text-black text-xl">Roles not found</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AccessProfile;
