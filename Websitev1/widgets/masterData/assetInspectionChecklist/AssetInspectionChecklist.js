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
                    .then(() => {
                        Swal.fire("Success", "Checklist updated successfully.");
                        setCheckReload(c => c + 1);
                        resetForm();
                    }).catch((err) => {
                        Swal.fire("Error", err.response?.data?.message || "Error updating checklist");
                    });
            } else {
                axios.post(`/api/asset-inspection-checklist/post`, payload)
                    .then(() => {
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
            cancelButtonText: "No",
            confirmButtonText: "Yes, delete it",
            reverseButtons: true,
            customClass: { confirmButton: "delete-btn" },
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
        <div className="p-4">
            <div className="admin-box box-primary">
                <div className="admin-box-header border-b border-gray-100 mb-6">
                    <h3 className="admin-box-title">Asset Inspection Checklist Master</h3>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="admin-form-group">
                                <label className="admin-label">
                                    Asset Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={handleCategoryChange}
                                    className="admin-select"
                                    required
                                >
                                    <option value="" disabled>-- Select Category --</option>
                                    {categoryList.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.fieldValue}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">
                                    Asset Sub-Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={subCategoryId}
                                    onChange={(e) => setSubCategoryId(e.target.value)}
                                    className="admin-select"
                                    disabled={!categoryId}
                                    required
                                >
                                    <option value="" disabled>-- Select Sub-Category --</option>
                                    {subCategoryList.map(sub => (
                                        <option key={sub._id} value={sub._id}>{sub.inputValue}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-gray-50 border border-dashed border-[#d2d6de] rounded">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Define Checklist Items</h4>
                            <div className="flex flex-col lg:flex-row items-end gap-4">
                                <div className="flex-1 w-full">
                                    <label className="admin-label">Checklist Item Name</label>
                                    <input
                                        type="text"
                                        className="admin-input"
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
                                    className="admin-btn-primary h-[43px]"
                                >
                                    Add Item
                                </button>
                            </div>

                            {checklistArray.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {checklistArray.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm">
                                            <span className="text-xs font-semibold text-gray-700">{item}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeChecklistItem(idx)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <RiDeleteBin6Line size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-start">
                            {editingItem && (
                                <button type="button" onClick={resetForm} className="admin-btn-primary !bg-gray-500 mr-4">Cancel Edit</button>
                            )}
                            <button type="submit" className="admin-btn-primary min-w-[200px]">
                                {editingItem ? "Update Changes" : "Save Checklist Master"}
                            </button>
                        </div>
                    </form>

                    <div className="border-t border-gray-100 pt-8 mt-12">
                        <h3 className="admin-box-title uppercase mb-6">Existing Checklists</h3>

                        {items && items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="admin-table">
                                    <thead className="admin-table-thead">
                                        <tr>
                                            <th className="admin-table-th w-20 text-center">SR. No.</th>
                                            <th className="admin-table-th text-center w-32">Action</th>
                                            <th className="admin-table-th">Category</th>
                                            <th className="admin-table-th">Sub-Category</th>
                                            <th className="admin-table-th">Checklist Items</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((data, index) => (
                                            <tr key={data._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="admin-table-td text-center font-bold">{index + 1}</td>
                                                <td className="admin-table-td">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            title="Edit"
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            onClick={() => handleEdit(data)}
                                                        >
                                                            <MdOutlineEdit size={18} />
                                                        </button>
                                                        <button
                                                            title="Delete"
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            onClick={() => handleDelete(data._id)}
                                                        >
                                                            <RiDeleteBin6Line size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="admin-table-td font-bold text-gray-900">
                                                    {data.category_id?.fieldValue || "-"}
                                                </td>
                                                <td className="admin-table-td">
                                                    {data.subCategory_id?.inputValue || "-"}
                                                </td>
                                                <td className="admin-table-td">
                                                    <div className="flex flex-wrap gap-1">
                                                        {data.checklist?.map((item, idx) => (
                                                            <span key={idx} className="bg-blue-50 text-[#3c8dbc] text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                                                                {item}
                                                            </span>
                                                        )) || <span className="text-gray-400 font-bold italic">-</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="w-full text-center py-10 text-gray-400 font-bold italic bg-gray-50 border border-dashed border-gray-200">
                                No record found!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetInspectionChecklist;
