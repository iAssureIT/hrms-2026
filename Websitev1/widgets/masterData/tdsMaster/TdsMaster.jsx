"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSearch, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import { Modal, Tooltip } from "flowbite-react";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";


export default function TdsMaster() {

    const [formData, setFormData] = useState({
        sectionCode: "",
        sectionName: "",
        tdsRate: "",
    });

    const [sections, setSections] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);

    // Fetch Data
    const fetchSections = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/tdsmaster/get/`, {
                params: { page, limit, search }
            });

            setSections(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, [page, limit, search]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await axios.put(`/api/tdsmaster/put/${editingId}`, formData);

                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Record updated successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                await axios.post(`/api/tdsmaster/post/`, formData);

                Swal.fire({
                    icon: "success",
                    title: "Created!",
                    text: "Record created successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }

            setFormData({ sectionCode: "", sectionName: "", tdsRate: "" });
            setEditingId(null);
            fetchSections();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Something went wrong. Please try again.",
            });
        }
    };


    const handleEdit = (item) => {
        setFormData(item);
        setEditingId(item._id);

        Swal.fire({
            icon: "info",
            title: "Edit Mode",
            text: "You are now editing this record.",
            timer: 1500,
            showConfirmButton: false,
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/tdsmaster/delete/${id}`);

                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Record deleted successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                });

                fetchSections();
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: "Failed to delete the record.",
                });
            }
        }
    };


    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-semibold mb-6">
                ADD TDS MASTER
            </h1>

            <div className="bg-white rounded">
                <div className=" p-6 ">
                    <form onSubmit={handleSubmit}>

                        {/* Input Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Section Code */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Section Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="sectionCode"
                                    value={formData.sectionCode}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                    placeholder="Enter Section Code"
                                    required
                                />
                            </div>

                            {/* Section Name */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Name of Section <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="sectionName"
                                    value={formData.sectionName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                    placeholder="Enter Section Name"
                                    required
                                />
                            </div>

                            {/* TDS Rate */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    TDS Rate (%) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="tdsRate"
                                    value={formData.tdsRate}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                    placeholder="Enter TDS Rate"
                                    required
                                />
                            </div>

                        </div>

                        {/* Button Row */}
                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="bg-green-500 text-white px-8 py-2 rounded hover:bg-green-600 transition"
                            >
                                Submit
                            </button>
                        </div>

                    </form>
                </div>


                <div className=" p-6 ">

                    {/* Top Controls */}
                    <div className="flex justify-between items-center mb-4">

                        {/* Records Per Page */}
                        <div className="space-x-2">
                            <label className="text-sm font-medium ms-2">
                                Records Per Page:
                            </label>
                            <div>
                                <select
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="border px-2 py-1 text-sm rounded focus:outline-none"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>

                        </div>

                        {/* Search */}
                        <div className="items-center gap-2">
                            <label className="text-sm font-medium text-gray-600">
                                Search
                            </label>

                            <div className="flex items-center bg-white border border-gray-300 rounded-md px-2 h-8 w-48 focus-within:border-blue-500 transition-all">
                                <FaSearch className="text-gray-400 text-xs mr-2" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setPage(1);
                                        setSearch(e.target.value);
                                    }}
                                    placeholder="Search..."
                                    className="text-sm w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none shadow-none"
                                />

                            </div>
                        </div>


                    </div>


                    {/* Table */}
                    {/* <table className="w-full border text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border p-2">SR.NO</th>
                                <th className="border p-2">Code</th>
                                <th className="border p-2">Name</th>
                                <th className="border p-2">TDS</th>
                                <th className="border p-2">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-4">
                                        Loading...
                                    </td>
                                </tr>
                            ) : sections.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-4">
                                        No Data Found
                                    </td>
                                </tr>
                            ) : (
                                sections.map((item, index) => (
                                    <tr key={item._id} className="text-center">
                                        <td className="border p-2">
                                            {(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="border p-2">{item.sectionCode}</td>
                                        <td className="border p-2">{item.sectionName}</td>
                                        <td className="border p-2">{item.tdsRate}%</td>
                                        <td className="border p-2 text-center">
                                            <div className="flex justify-center items-center space-x-3">

                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    <FaTrash />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table> */}
                    <table className="w-full overflow-x-auto border-separate border-spacing-y-2 text-sm text-center ps-3 rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-[13px] text-gray-700 uppercase px-10 dark:text-gray-400 border border-grayTwo">
                            <tr className="font-bold text-gray-900 whitespace-nowrap dark:text-white py-4">
                                <th scope="col" className="px-6 py-4 border border-grayTwo border-r-0">SR. NO.</th>
                                <th scope="col" className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">SECTION CODE</th>
                                <th scope="col" className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">SECTION NAME</th>
                                <th scope="col" className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">TDS RATE</th>
                                <th scope="col" className="px-6 py-4 border border-grayTwo border-l-0">ACTION</th>
                            </tr>
                        </thead>

                        <tbody className="border border-grayTwo">
                            {loading ? (
                                <tr className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo text-gray-900 font-normal">
                                    <td colSpan={5} className="text-center text-Green text-3xl">
                                        <FaSpinner className="animate-spin inline-flex mx-2" />
                                    </td>
                                </tr>
                            ) : sections.length === 0 ? (
                                <tr className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo text-gray-900 font-normal">
                                    <td colSpan={5} className="text-center">No Data Found!</td>
                                </tr>
                            ) : (
                                sections.map((item, index) => {
                                    const serialNumber = (page - 1) * limit + index + 1;
                                    return (
                                        <tr
                                            key={item._id}
                                            className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo text-gray-900 font-normal"
                                        >
                                            <th scope="row" className="px-6 py-4 font-normal border border-grayTwo border-r-0">
                                                {serialNumber}
                                            </th>
                                            <td className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">{item.sectionCode}</td>
                                            <td className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">{item.sectionName}</td>
                                            <td className="px-6 py-4 border border-grayTwo border-l-0 border-r-0">{item.tdsRate}%</td>
                                            <td className="px-6 py-4 border border-grayTwo border-l-0 ">
                                                <div className="flex gap-3 justify-center">
                                                    <Tooltip content="Edit" placement="bottom" className="bg-green" arrow={false}>
                                                        <MdOutlineEdit
                                                            className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                                            size="1.3rem"
                                                            onClick={() => handleEdit(item)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip content="Delete" placement="bottom" className="bg-red-500" arrow={false}>
                                                        <RiDeleteBin6Line
                                                            className="border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                                            size="1.3rem"
                                                            onClick={() => handleDelete(item._id)}
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


                    {/* Pagination (Only if Data Exists) */}
                    {!loading && sections.length > 0 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-3 py-1 border rounded text-sm ${page === i + 1
                                        ? "bg-green-500 text-white"
                                        : "bg-white"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
