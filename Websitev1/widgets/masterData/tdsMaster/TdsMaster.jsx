"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSearch, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import { Modal, Tooltip } from "flowbite-react";
import { MdOutlineEdit } from "react-icons/md";
import { MdWidgets } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaFileDownload } from "react-icons/fa";
import * as XLSX from "xlsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
            const res = await axios.post(`/api/tdsmaster/get`, {
                page,
                limit,
                search,
                removePagination: false,
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
                const res = await axios.put(`/api/tdsmaster/put/${editingId}`, formData);

                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: res.data.message || "Record updated successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                });

            } else {
                const res = await axios.post(`/api/tdsmaster/post/`, formData);

                Swal.fire({
                    icon: "success",
                    title: "Created!",
                    text: res.data.message || "Record created successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }

            setFormData({ sectionCode: "", sectionName: "", tdsRate: "" });
            setEditingId(null);
            fetchSections();

        } catch (error) {

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Something went wrong. Please try again.";

            Swal.fire({
                icon: "error",
                title: "Error!",
                text: message,
            });
        }
    };


    const handleEdit = (item) => {
        setFormData(item);
        setEditingId(item._id);

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

    const exportToExcel = async () => {
        try {
            const res = await axios.post("/api/tdsmaster/get", {
                page: 1,
                limit: 1,
                search: "",
                removePagination: true,
            });

            if (!res?.data?.success) {
                throw new Error("Failed to fetch data");
            }

            const data = res.data.data;

            if (!data || data.length === 0) {
                Swal.fire({
                    icon: "warning",
                    title: "No Data",
                    text: "No data available to export",
                });
                return;
            }

            const formattedData = data.map((item, index) => ({
                "SR NO": index + 1,
                "Section Code": item.sectionCode || "",
                "Section Name": item.sectionName || "",
                "TDS Rate (%)": item.tdsRate || "",
            }));

            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "TDS Master");

            XLSX.writeFile(workbook, "TDS_Master.xlsx");

            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Excel downloaded successfully!",
                timer: 1500,
                showConfirmButton: false,
            });

        } catch (error) {
            console.error("Excel Export Error:", error);

            Swal.fire({
                icon: "error",
                title: "Export Failed",
                text: error?.response?.data?.message || "Something went wrong while exporting Excel",
            });
        }
    };



    return (
        <section className="section ">
            <div className="box border-2 rounded-md shadow-md bg-white" >
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300">
                        <h1 className="heading">ADD TDS MASTER</h1>
                    </div>
                </div>

                <div className="h-fit p-5 pb-10">
                    <div className="rounded-sm  w-full h-fit pb-4">
                        <div className="   w-11/12 mx-auto   p-5 sm:px-1 sm:p-1 pb-10 mt-10 mb-5 rounded-md">
                            <form
                                onSubmit={handleSubmit}
                                className="bg-red lg:p-10 w-full lg:w-11/12 sm:px-2 pb-4  lg:mx-11 mx-0 "
                            >

                                {/* Input Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* Section Code */}
                                    <div>
                                        <label className="inputLabel">
                                            Section Code <span className="text-red-500">*</span>
                                        </label>


                                        <div className="flex mt-2 justify-center">
                                            <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                                        <MdWidgets className="icon" />
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="sectionCode"
                                                    className="stdInputField"
                                                    placeholder="Enter Section Code"
                                                    required
                                                    value={formData.sectionCode}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Name */}
                                    <div>
                                        <label className="inputLabel">
                                            Name of Section <span className="text-red-500">*</span>
                                        </label>
                                        {/* <input
                                        type="text"
                                        name="sectionName"
                                        value={formData.sectionName}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                        placeholder="Enter Section Name"
                                        required
                                    /> */}
                                        <div className="flex mt-2 justify-center">
                                            <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                                        <MdWidgets className="icon" />
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="sectionName"
                                                    className="stdInputField"
                                                    placeholder="Enter Section Name"
                                                    required
                                                    value={formData.sectionName}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* TDS Rate */}
                                    <div>
                                        <label className="inputLabel">
                                            TDS Rate (%) <span className="text-red-500">*</span>
                                        </label>
                                        {/* <input
                                        type="number"
                                        name="tdsRate"
                                        value={formData.tdsRate}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                                        placeholder="Enter TDS Rate"
                                        required
                                    /> */}

                                        <div className="flex mt-2 justify-center">
                                            <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                                                        <MdWidgets className="icon" />
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="tdsRate"
                                                    className="stdInputField"
                                                    placeholder="Enter TDS Rate"
                                                    required
                                                    value={formData.tdsRate}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Button Row */}
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        className="formButtons"
                                    // className="bg-green-500 text-white px-8 py-2 rounded hover:bg-green-600 transition"
                                    >
                                        Submit
                                    </button>
                                </div>

                            </form>



                            <div className=" p-6 ">

                                {/* Top Controls */}
                                <div className="flex justify-between items-center mb-4">

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

                                    <div className="flex items-end gap-4">
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

                                        <Tooltip
                                            content="Download as Excel"
                                            placement="top"
                                            className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
                                            arrow={false}
                                        >
                                            <FaFileDownload
                                                onClick={exportToExcel}
                                                size={"2rem"}
                                                className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                            />
                                        </Tooltip>
                                    </div>

                                </div>

                                <table className="w-full overflow-x-auto border-separate border-spacing-y-2 text-sm text-center ps-3 rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-[13px] text-gray-700 uppercase px-10 dark:text-gray-400 border border-grayTwo">
                                        <tr className="font-bold text-gray-900 whitespace-nowrap dark:text-white py-4">
                                            <th scope="col" className="px-6 py-2 border border-grayTwo border-r-0">SR. NO.</th>
                                            <th scope="col" className="px-6 py-2 border border-grayTwo border-l-0 border-r-0">ACTION</th>
                                            <th scope="col" className="px-6 py-2 border border-grayTwo border-l-0 border-r-0">SECTION CODE</th>
                                            <th scope="col" className="px-6 py-2 border border-grayTwo border-l-0 border-r-0">SECTION NAME</th>
                                            <th scope="col" className="px-6 py-2 border border-grayTwo border-l-0 ">TDS RATE</th>
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
                                                        <th scope="row" className="px-6 py-2 font-normal border border-grayTwo border-r-0">
                                                            {serialNumber}
                                                        </th>
                                                        <td className="px-6 py-2 border border-grayTwo border-l-0 border-r-0">
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
                                                        <td className="px-6 py-2 border border-grayTwo border-l-0 border-r-0">{item.sectionCode}</td>
                                                        <td className="px-6 py-2 border border-grayTwo border-l-0 border-r-0">{item.sectionName}</td>
                                                        <td className="px-6 py-2 border border-grayTwo border-l-0 ">{item.tdsRate}%</td>

                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>


                                {/* Pagination (Only if Data Exists) */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <div className="flex border border-gray-400">

                                            {/* Left Arrow */}
                                            {page > 1 && (
                                                <button
                                                    onClick={() => setPage(page - 1)}
                                                    className="w-10 h-10 flex items-center justify-center border-r border-gray-400 bg-gray-100 hover:bg-gray-200"
                                                >
                                                    <FaChevronLeft size={12} />
                                                </button>
                                            )}

                                            {/* First Page */}
                                            <button
                                                onClick={() => setPage(1)}
                                                className={`w-10 h-10 flex items-center justify-center border-r border-gray-400 text-sm
          ${page === 1
                                                        ? "bg-blue-400 text-red-500 font-semibold"
                                                        : "bg-gray-100 hover:bg-gray-200"
                                                    }`}
                                            >
                                                1
                                            </button>

                                            {/* Left Dots */}
                                            {page > 3 && (
                                                <div className="w-10 h-10 flex items-center justify-center border-r border-gray-400 bg-gray-100 text-sm">
                                                    ...
                                                </div>
                                            )}

                                            {/* Middle Pages */}
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;

                                                if (
                                                    pageNumber !== 1 &&
                                                    pageNumber !== totalPages &&
                                                    pageNumber >= page - 1 &&
                                                    pageNumber <= page + 1
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => setPage(pageNumber)}
                                                            className={`w-10 h-10 flex items-center justify-center border-r border-gray-400 text-sm
                ${page === pageNumber
                                                                    ? "bg-blue-400 text-red-500 font-semibold"
                                                                    : "bg-gray-100 hover:bg-gray-200"
                                                                }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                }

                                                return null;
                                            })}

                                            {/* Right Dots */}
                                            {page < totalPages - 2 && (
                                                <div className="w-10 h-10 flex items-center justify-center border-r border-gray-400 bg-gray-100 text-sm">
                                                    ...
                                                </div>
                                            )}

                                            {/* Last Page */}
                                            {totalPages > 1 && (
                                                <button
                                                    onClick={() => setPage(totalPages)}
                                                    className={`w-10 h-10 flex items-center justify-center border-r border-gray-400 text-sm
            ${page === totalPages
                                                            ? "bg-blue-400 text-red-500 font-semibold"
                                                            : "bg-gray-100 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {totalPages}
                                                </button>
                                            )}

                                            {/* Right Arrow */}
                                            {page < totalPages && (
                                                <button
                                                    onClick={() => setPage(page + 1)}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                                                >
                                                    <FaChevronRight size={12} />
                                                </button>
                                            )}
                                        </div>
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


// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import GenericTable from "@/widgets/masterData/tdsMaster/FilterTable";
// import { MdWidgets } from "react-icons/md";

// export default function TdsMaster() {

//     /* ================= FORM STATE ================= */

//     const [formData, setFormData] = useState({
//         sectionCode: "",
//         sectionName: "",
//         tdsRate: "",
//     });

//     const [editingId, setEditingId] = useState(null);

//     /* ================= TABLE STATE ================= */

//     const [tableData, setTableData] = useState([]);
//     const [recsPerPage, setRecsPerPage] = useState(10);
//     const [numOfPages, setNumOfPages] = useState([1]);
//     const [pageNumber, setPageNumber] = useState(1);
//     const [searchText, setSearchText] = useState("-");
//     const [totalRecs, setTotalRecs] = useState("-");
//     const [runCount, setRunCount] = useState(0);
//     const [loading, setLoading] = useState(true);

//     /* ================= TABLE CONFIG ================= */

//     const tableHeading = {
//         actions: "Actions",
//         sectionCode: "Section Code",
//         sectionName: "Section Name",
//         tdsRate: "TDS Rate (%)",
//     };
//     const excelHeading = {
//         sectionCode: "Section Code",
//         sectionName: "Section Name",
//         tdsRate: "TDS Rate (%)",
//     };

//     const tableObjects = {
//         deleteMethod: "delete",
//         getListMethod: "post",
//         apiURL: "/api/tdsmaster",
//         editURL: "",
//         downloadApply: true,
//         searchApply: true,
//         showButton: false,
//         titleMsg: "TDS Master List",
//     };

//     /* ================= FETCH DATA ================= */

//     const getData = async () => {
//         const formValues = {
//             searchText,
//             recsPerPage,
//             pageNumber,
//             removePagination: false,
//         };

//         try {
//             const response = await axios.post(
//                 "/api/tdsmaster/post/list",
//                 formValues
//             );

//             console.log("response", response)

//             if (response.data.success) {
//                 setTableData(response.data.tableData);
//                 setTotalRecs(response.data.totalRecs);
//             } else {
//                 Swal.fire("Error", response.data.message, "error");
//             }
//         } catch (error) {
//             console.log("Error fetching TDS data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         getData();
//     }, [pageNumber, recsPerPage, searchText, runCount]);

//     /* ================= FORM HANDLERS ================= */

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             if (editingId) {
//                 await axios.put(`/api/tdsmaster/put/${editingId}`, formData);

//                 Swal.fire({
//                     icon: "success",
//                     title: "Updated!",
//                     text: "Record updated successfully.",
//                     timer: 2000,
//                     showConfirmButton: false,
//                 });
//             } else {
//                 await axios.post(`/api/tdsmaster/post`, formData);

//                 Swal.fire({
//                     icon: "success",
//                     title: "Created!",
//                     text: "Record created successfully.",
//                     timer: 2000,
//                     showConfirmButton: false,
//                 });
//             }

//             setFormData({
//                 sectionCode: "",
//                 sectionName: "",
//                 tdsRate: "",
//             });

//             setEditingId(null);
//             setRunCount(runCount + 1); // refresh table

//         } catch (error) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Error!",
//                 text: "Something went wrong. Please try again.",
//             });
//         }
//     };

//     /* ================= EDIT HANDLER ================= */

//     const handleEditInline = (item) => {
//         setFormData(item);
//         setEditingId(item._id);

//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     /* ================= UI ================= */

//     return (
//         <div className="p-4 bg-gray-50 min-h-screen">
//             <div className="box border-2 rounded-md shadow-md bg-white">

//                 {/* ================= FORM SECTION ================= */}

//                 <div className="border-b">
//                     <h1 className="text-2xl font-semibold py-4 ps-6">
//                         {editingId ? "UPDATE TDS MASTER" : "ADD TDS MASTER"}
//                     </h1>
//                 </div>

//                 <div className="p-6">
//                     <form onSubmit={handleSubmit}>

//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//                             {/* Section Code */}
//                             <div>
//                                 <label className="inputLabel">
//                                     Section Code <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="relative border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                     <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                         <span className="text-gray-500 pr-2 border-r-2">
//                                             <MdWidgets />
//                                         </span>
//                                     </div>
//                                     <input
//                                         type="text"
//                                         name="sectionCode"
//                                         className="stdInputField"
//                                         placeholder="Enter Section Code"
//                                         required
//                                         value={formData.sectionCode}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>

//                             {/* Section Name */}
//                             <div>
//                                 <label className="inputLabel">
//                                     Name of Section <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="relative border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                     <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                         <span className="text-gray-500 pr-2 border-r-2">
//                                             <MdWidgets />
//                                         </span>
//                                     </div>
//                                     <input
//                                         type="text"
//                                         name="sectionName"
//                                         className="stdInputField"
//                                         placeholder="Enter Section Name"
//                                         required
//                                         value={formData.sectionName}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>

//                             {/* TDS Rate */}
//                             <div>
//                                 <label className="inputLabel">
//                                     TDS Rate (%) <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="relative border border-gray-300 mt-2 rounded-md shadow-sm w-full">
//                                     <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                                         <span className="text-gray-500 pr-2 border-r-2">
//                                             <MdWidgets />
//                                         </span>
//                                     </div>
//                                     <input
//                                         type="number"
//                                         name="tdsRate"
//                                         className="stdInputField"
//                                         placeholder="Enter TDS Rate"
//                                         required
//                                         value={formData.tdsRate}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>

//                         </div>

//                         <div className="mt-6 flex justify-end">
//                             <button type="submit" className="formButtons">
//                                 {editingId ? "Update" : "Submit"}
//                             </button>
//                         </div>

//                     </form>
//                 </div>

//                 {/* ================= TABLE SECTION ================= */}

//                 <div className="p-6">
//                     <GenericTable
//                         tableObjects={tableObjects}
//                         tableHeading={tableHeading}
//                         setRunCount={setRunCount}
//                         runCount={runCount}
//                         recsPerPage={recsPerPage}
//                         setRecsPerPage={setRecsPerPage}
//                         filterData={{}}
//                         excelHeading={excelHeading}
//                         getData={getData}
//                         tableData={tableData}
//                         setTableData={setTableData}
//                         numOfPages={numOfPages}
//                         setNumOfPages={setNumOfPages}
//                         pageNumber={pageNumber}
//                         setPageNumber={setPageNumber}
//                         searchText={searchText}
//                         setSearchText={setSearchText}
//                         totalRecs={totalRecs}
//                         setTotalRecs={setTotalRecs}
//                         loading={loading}
//                     />
//                 </div>

//             </div>
//         </div>
//     );
// }
