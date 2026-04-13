"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdOutlineEdit, MdWidgets } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";

const AssetInspectionChecklist = () => {
    const [items, setItems] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [subCategoryList, setSubCategoryList] = useState([]);

    const [categoryId, setCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");
    const [checklistItemText, setChecklistItemText] = useState("");
    const [checklistArray, setChecklistArray] = useState([]);

    const [editingItem, setEditingItem] = useState(null);
    const [error, setError] = useState("");
    const [checkReload, setCheckReload] = useState(0);

    const [user_id, setUser_id] = useState("");

    useEffect(() => {
        const userDetails = localStorage.getItem("userDetails");
        if (userDetails) {
            const userDetailsParse = JSON.parse(userDetails);
            setUser_id(userDetailsParse.user_id);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        fetchItems();
    }, [checkReload]);

    const fetchCategories = () => {
        axios.get(`/api/asset-category/get`)
            .then((res) => setCategoryList(Array.isArray(res.data) ? res.data : []))
            .catch(() => setCategoryList([]));
    };

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setCategoryId(val);
        setSubCategoryId("");
        if (val) {
            axios.get(`/api/asset-master-subcategory/get`)
                .then((res) => {
                    const data = Array.isArray(res.data) ? res.data : [];
                    setSubCategoryList(data.filter(item => item.dropdown_id?.toString() === val.toString()));
                })
                .catch(() => setSubCategoryList([]));
        } else {
            setSubCategoryList([]);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await axios.get(`/api/asset-inspection-checklist/get`);
            setItems(response?.data || []);
        } catch (err) {
            setError("Error fetching checklists");
        }
    };

    const handleAddChecklistItem = () => {
        if (checklistItemText.trim() === "") return;
        setChecklistArray([...checklistArray, checklistItemText.trim()]);
        setChecklistItemText("");
    };

    const removeChecklistItem = (index) => {
        const newArr = checklistArray.filter((_, i) => i !== index);
        setChecklistArray(newArr);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!categoryId || !subCategoryId || checklistArray.length === 0) {
            Swal.fire("Warning", "Category, Sub-Category, and at least one checklist item are required.");
            return;
        }

        const payload = {
            category_id: categoryId,
            subCategory_id: subCategoryId,
            checklist: checklistArray,
            user_id,
        };

        try {
            if (editingItem) {
                axios.patch(`/api/asset-inspection-checklist/update/${editingItem._id}`, payload)
                    .then((response) => {
                        Swal.fire("Success", "Checklist updated successfully.");
                        setCheckReload(c => c + 1);
                        resetForm();
                    }).catch((err) => {
                        Swal.fire("Error", err.response?.data?.message || "Error updating checklist");
                    });
            } else {
                axios.post(`/api/asset-inspection-checklist/post`, payload)
                    .then((response) => {
                        Swal.fire("Success", "Checklist added successfully.");
                        setCheckReload(c => c + 1);
                        resetForm();
                    }).catch((err) => {
                        Swal.fire("Error", err.response?.data?.message || "Error saving checklist");
                    });
            }
        } catch (err) {
            setError("Error saving item");
        }
    };

    const resetForm = () => {
        setCategoryId("");
        setSubCategoryId("");
        setSubCategoryList([]);
        setChecklistArray([]);
        setChecklistItemText("");
        setEditingItem(null);
    }

    const handleEdit = (item) => {
        setEditingItem(item);
        setCategoryId(item.category_id?._id || "");

        // Fetch subcategories for this category so dropdown works
        if (item.category_id?._id) {
            axios.get(`/api/asset-master-subcategory/get`)
                .then((res) => {
                    const data = Array.isArray(res.data) ? res.data : [];
                    setSubCategoryList(data.filter(sub => sub.dropdown_id?.toString() === item.category_id._id.toString()));
                    setSubCategoryId(item.subCategory_id?._id || "");
                })
                .catch(() => setSubCategoryList([]));
        }

        setChecklistArray(item.checklist || []);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete Checklist',
            text: "Are you sure you want to delete this checklist?",
            showCancelButton: true,
            cancelButtonText: "No, cancel",
            confirmButtonText: "Yes, delete it",
            reverseButtons: true,
            confirmButtonColor: "#10B981",
            cancelButtonColor: "#dc1414ff"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/api/asset-inspection-checklist/delete/${id}`)
                    .then(() => {
                        Swal.fire("Success", "Checklist deleted successfully.");
                        setCheckReload(c => c + 1);
                    })
                    .catch(() => {
                        Swal.fire("Error", "Something went wrong while deleting");
                    });
            }
        });
    };

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md bg-white">
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300 p-5">
                        <h1 className="heading">Asset Inspection Checklist Master</h1>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="w-full lg:w-11/12 mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Category */}
                            <div>
                                <label className="inputLabel mb-2 block">
                                    Asset Category <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="pr-2 border-r text-gray-500"><MdWidgets /></span>
                                    </div>
                                    <select
                                        value={categoryId}
                                        onChange={handleCategoryChange}
                                        className={`stdSelectField w-full pl-12 ${categoryId ? "selectOption" : "text-gray-400"}`}
                                    >
                                        <option value="" disabled>-- Select Category --</option>
                                        {categoryList.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.fieldValue}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Sub-Category */}
                            <div>
                                <label className="inputLabel mb-2 block">
                                    Asset Sub-Category <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="pr-2 border-r text-gray-500"><MdWidgets /></span>
                                    </div>
                                    <select
                                        value={subCategoryId}
                                        onChange={(e) => setSubCategoryId(e.target.value)}
                                        className={`stdSelectField w-full pl-12 ${subCategoryId ? "selectOption" : "text-gray-400"}`}
                                        disabled={!categoryId}
                                    >
                                        <option value="" disabled>-- Select Sub-Category --</option>
                                        {subCategoryList.map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.inputValue}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Checklist Array Builder */}
                        <div className="mb-8 border border-gray-200 rounded-lg p-5 bg-gray-50">
                            <h3 className="text-sm font-semibold mb-4 text-gray-700">Define Checklist Items</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="stdInputField w-full"
                                        placeholder="Enter checklist item (e.g. Physical Damage)"
                                        value={checklistItemText}
                                        onChange={(e) => setChecklistItemText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddChecklistItem();
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddChecklistItem}
                                    className="formButtons"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Render Map */}
                            {checklistArray.length > 0 && (
                                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {checklistArray.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-md shadow-sm">
                                            <span className="text-[13px] text-gray-700">{item}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeChecklistItem(idx)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <RiDeleteBin6Line size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-6">
                            {editingItem && (
                                <button type="button" onClick={resetForm} className="formButtons bg-gray-400 hover:bg-gray-500 mr-4">Cancel</button>
                            )}
                            <button type="submit" className="formButtons min-w-[150px]">
                                {editingItem ? "Update Master" : "Submit Master"}
                            </button>
                        </div>
                    </form>

                    {/* Table */}
                    <div className="mt-12 overflow-x-auto border-3 mb-10 mx-auto lg:w-11/12 rounded-md">
                        {items && items.length > 0 ? (
                            <table className="w-full border-separate border-spacing-y-2 text-sm text-left rtl:text-right">
                                <thead className="text-xs uppercase bg-gray-100 border border-gray-200 rounded-sm">
                                    <tr>
                                        <th className="px-6 py-4 border border-gray-200">SR. No.</th>
                                        <th className="px-6 py-4 border border-gray-200">Category</th>
                                        <th className="px-6 py-4 border border-gray-200">Sub-Category</th>
                                        <th className="px-6 py-4 border border-gray-200">Total Items</th>
                                        <th className="px-6 py-4 border border-gray-200 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((data, index) => (
                                        <tr key={data._id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 border border-gray-200">{index + 1}</td>
                                            <td className="px-6 py-4 border border-gray-200 font-medium text-gray-900">
                                                {data.category_id?.fieldValue || "-"}
                                            </td>
                                            <td className="px-6 py-4 border border-gray-200">
                                                {data.subCategory_id?.inputValue || "-"}
                                            </td>
                                            <td className="px-6 py-4 border border-gray-200">
                                                <div className="flex flex-wrap gap-1">
                                                    {data.checklist && data.checklist.length > 0 ? (
                                                        data.checklist.map((item, idx) => (
                                                            <span key={idx} className="bg-green-100 text-black-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                                {item}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border border-gray-200">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button onClick={() => handleEdit(data)}>
                                                        <MdOutlineEdit className="text-gray-500 hover:text-green-600 cursor-pointer" size={20} />
                                                    </button>
                                                    <button onClick={() => handleDelete(data._id)}>
                                                        <RiDeleteBin6Line className="text-red-500 hover:text-red-700 cursor-pointer" size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="w-full text-center py-6 bg-gray-50 border border-gray-200 rounded-md text-gray-500">
                                No checklists found. Give it a start!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AssetInspectionChecklist;
