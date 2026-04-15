"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdOutlineEdit, MdWidgets } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";

// === Asset Management Style Helpers ===
const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-5 border-b border-gray-100 pb-2">
        <h3 className="hr-subheading">{title}</h3>
        <p className="hr-section-subtitle">{subtitle}</p>
    </div>
);

const IconWrapper = ({ icon: Icon }) => (
    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
            <Icon className="icon" />
        </span>
    </div>
);

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
        <section className="hr-section">
            <div className="hr-card hr-fade-in border-0 rounded-md !p-0">
                <div className="border-b border-slate-100 py-4 px-8 mb-4 flex items-center justify-between">
                    <h1 className="hr-heading">Asset Inspection Management</h1>
                </div>

                <div className="px-8 pb-8">
                    <div className="flex flex-col">
                        <div className="space-y-8 pb-10">
                            <form
                                onSubmit={handleSubmit}
                                className="hr-card !p-8 bg-white border border-gray-200 rounded-lg shadow-md mt-2"
                            >
                                <SectionHeader 
                                    title="Asset Verification Details" 
                                    subtitle="Select category and define the items to be checked during inspection." 
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                    {/* Category */}
                                    <div>
                                        <label className="hr-label">
                                            Asset Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <IconWrapper icon={MdWidgets} />
                                            <select
                                                value={categoryId}
                                                onChange={handleCategoryChange}
                                                className="hr-select"
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
                                        <label className="hr-label">
                                            Asset Sub-Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <IconWrapper icon={MdWidgets} />
                                            <select
                                                value={subCategoryId}
                                                onChange={(e) => setSubCategoryId(e.target.value)}
                                                className="hr-select"
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

                                {/* Checklist Builder */}
                                <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-slate-50/50">
                                    <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-4">Define Checklist Items</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 relative">
                                            <IconWrapper icon={MdWidgets} />
                                            <input
                                                type="text"
                                                className="hr-input"
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
                                            className="hr-btn-primary min-w-[100px]"
                                        >
                                            Add Item
                                        </button>
                                    </div>

                                    {/* Item Badges */}
                                    {checklistArray.length > 0 && (
                                        <div className="mt-6 flex flex-wrap gap-3">
                                            {checklistArray.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm animate__animated animate__fadeIn">
                                                    <span className="text-[12px] font-medium text-slate-700">{item}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChecklistItem(idx)}
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <RiDeleteBin6Line size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-10">
                                    {editingItem && (
                                        <button type="button" onClick={resetForm} className="hr-btn-secondary mr-4">Cancel Edit</button>
                                    )}
                                    <button type="submit" className="hr-btn-primary min-w-[180px]">
                                        {editingItem ? "Update Master" : "Save Checklist Master"}
                                    </button>
                                </div>
                            </form>

                <div className="mt-12">
                    <SectionHeader title="Existing Checklists" subtitle="List of all defined inspection frameworks by category." />

                    {items && items.length > 0 ? (
                        <div className="overflow-x-auto border border-slate-100 rounded-lg shadow-sm">
                            <table className="w-full border-collapse text-sm text-left">
                                        <thead className="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">SR. No.</th>
                                                <th className="px-6 py-4 font-bold">Category</th>
                                                <th className="px-6 py-4 font-bold">Sub-Category</th>
                                                <th className="px-6 py-4 font-bold">Checklist Items</th>
                                                <th className="px-6 py-4 font-bold text-center">Action</th>
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
                            </div>
                        ) : (
                            <div className="w-full text-center py-6 bg-gray-50 border border-gray-200 rounded-md text-gray-500">
                                No checklists found. Give it a start!
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);
};

export default AssetInspectionChecklist;
