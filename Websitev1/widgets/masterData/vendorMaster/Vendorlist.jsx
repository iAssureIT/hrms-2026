"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaSearch, FaSpinner } from "react-icons/fa";
import { MdOutlineAddBusiness } from "react-icons/md";
import { Modal, Tooltip } from "flowbite-react";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function VendorList() {
    const router = useRouter();

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // ================= FETCH DATA =================
    const fetchVendors = async () => {
        try {
            setLoading(true);

            const response = await axios.post("/api/vendor-master/post",
                { page, limit, search }
            );

            setVendors(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, [page, limit, search]);

    // ================= EDIT =================
    const handleEdit = (id) => {
        router.push(`/admin/master-data/vendor-master/add-vendor/${id}`);
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626", // red for delete
            cancelButtonColor: "#6b7280", // gray
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return; // user canceled

        try {
            await axios.delete(`/api/vendor-master/delete/${id}`);

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Vendor has been deleted.",
                confirmButtonColor: "#059669",
            });

            fetchVendors(); // refresh list after delete
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error?.response?.data?.message ||
                    "Something went wrong. Please try again.",
                confirmButtonColor: "#dc2626",
            });
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setPage(1);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white shadow rounded-xl p-6">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold">
                        Vendors List
                    </h1>

                    <button
                        title="Add Vendor"  // ✅ Tooltip text
                        className="flex items-center gap-2 text-white hover:bg-green-100 px-4 py-2 rounded-md border"
                        onClick={() =>
                            router.push("/admin/master-data/vendor-master/add-vendor")
                        }
                    >
                        <MdOutlineAddBusiness className="w-5 h-5 text-green-400" />
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Records per page:</span>
                        <select
                            value={limit}
                            onChange={handleLimitChange}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-600"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search vendor..."
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-green-600"
                    />
                </div>

                {/* <div className="space-y-4">
                    {vendors?.map((vendor) => (
                        <div
                            key={vendor._id}
                            className="border rounded-lg shadow-sm p-5 bg-white hover:shadow-md transition"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                                <div>
                                    <h3 className="text-sm font-semibold text-green-600 mb-2">
                                        Vendor Info
                                    </h3>
                                    <p className="font-medium">
                                        {vendor.vendorInfo?.nameOfCompany}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Code: {vendor.vendorCode}
                                    </p>
                                    <p className="text-xs">
                                        {vendor.vendorInfo?.mobileNumber}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-green-600 mb-2">
                                        Bank
                                    </h3>
                                    <p className="text-xs">
                                        {vendor.bankDetails?.bankName}
                                    </p>
                                    <p className="text-xs">
                                        {vendor.bankDetails?.accountNumber}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-green-600 mb-2">
                                        Address
                                    </h3>
                                    <p className="text-xs">
                                        {vendor.addressDetails?.city}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-green-600 mb-2">
                                        Status
                                    </h3>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${vendor.vendorStatus === "Active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {vendor.vendorStatus}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-green-600 mb-2">
                                        Actions
                                    </h3>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(vendor._id)}
                                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(vendor._id)}
                                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div> */}

                <table className="w-full overflow-x-auto border-separate border-spacing-y-2 text-sm text-center ps-3 rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-[13px] text-gray-700 uppercase px-10 dark:text-gray-400 border border-grayTwo">
                        <tr className="font-bold text-gray-900 whitespace-nowrap dark:text-white py-4">
                            <th scope="col" className="px-6 py-4 border border-grayTwo border-r-0 border-r-0">SR. NO.</th>
                            <th scope="col" className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">VENDOR INFO</th>
                            <th scope="col" className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">BANK</th>
                            <th scope="col" className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">ADDRESS</th>
                            <th scope="col" className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">STATUS</th>
                            <th scope="col" className="px-6 py-4 border border-grayTwo border-l-0">ACTIONS</th>
                        </tr>
                    </thead>

                    <tbody className="border border-grayTwo">
                        {loading ? (
                            <tr className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo text-gray-900 font-normal">
                                <td colSpan={6} className="text-center text-Green text-3xl">
                                    <FaSpinner className="animate-spin inline-flex mx-2" />
                                </td>
                            </tr>
                        ) : vendors.length === 0 ? (
                            <tr className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo text-gray-900 font-normal">
                                <td colSpan={6} className="text-center">No Vendors Found!</td>
                            </tr>
                        ) : (
                            vendors.map((vendor, index) => {
                                const serialNumber = (page - 1) * limit + index + 1;
                                return (
                                    <tr
                                        key={vendor._id}
                                        className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo text-gray-900 font-normal"
                                    >
                                        <th scope="row" className="px-6 py-4 font-normal border border-grayTwo border-r-0">
                                            {serialNumber}
                                        </th>

                                        {/* Vendor Info */}
                                        <td className="px-6 py-4 border border-grayTwo border-l-0 text-left border-r-0">
                                            <p className="font-medium">{vendor.vendorInfo?.nameOfCompany}</p>
                                            <p className="text-xs text-gray-500">Code: {vendor.vendorCode}</p>
                                            <p className="text-xs">{vendor.vendorInfo?.mobileNumber}</p>
                                        </td>

                                        {/* Bank */}
                                        <td className="px-6 py-4 border border-grayTwo border-l-0 text-left border-r-0">
                                            <p className="text-xs">{vendor.bankDetails?.bankName}</p>
                                            <p className="text-xs">{vendor.bankDetails?.accountNumber}</p>
                                        </td>

                                        {/* Address */}
                                        <td className="px-6 py-4 border border-grayTwo border-l-0 text-left border-r-0">
                                            <p className="text-xs">{vendor.addressDetails?.city}</p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${vendor.vendorStatus === "Active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {vendor.vendorStatus}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 border border-grayTwo border-l-0">
                                            <div className="flex justify-center gap-2">
                                                <Tooltip content="Edit" placement="bottom" className="bg-green" arrow={false}>
                                                    <MdOutlineEdit
                                                        className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                                        size="1.3rem"
                                                        onClick={() => handleEdit(vendor._id)}
                                                    />
                                                </Tooltip>
                                                <Tooltip content="Delete" placement="bottom" className="bg-red-500" arrow={false}>
                                                    <RiDeleteBin6Line
                                                        className="border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                                        size="1.3rem"
                                                        onClick={() => handleDelete(vendor._id)}
                                                    />
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* ===== PAGINATION ===== */}
                <div className="flex justify-between items-center mt-4 text-sm">
                    <div className="text-gray-600">
                        Showing {(page - 1) * limit + 1} to{" "}
                        {Math.min(page * limit, total)} of {total} entries
                    </div>

                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                        >
                            Prev
                        </button>

                        <span className="px-3 py-1 bg-green-600 text-white rounded">
                            {page}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                        >
                            Next
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}