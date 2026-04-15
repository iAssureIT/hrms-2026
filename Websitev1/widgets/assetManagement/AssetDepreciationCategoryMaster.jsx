"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdOutlineEdit, MdWidgets } from "react-icons/md";
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

const AssetDepreciationCategoryMaster = () => {
  const [items, setItems] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryShortName, setCategoryShortName] = useState("");
  const [depreciationRate, setDepreciationRate] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [user_id, setUser_id] = useState("");

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      setUser_id(userDetailsParse.user_id);
    }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("/api/asset-depreciation-master/get");
      setItems(response?.data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim() || !categoryShortName.trim() || !depreciationRate) {
      setErrorMessage("All fields are required");
      return;
    }

    try {
      // 1. Create or Update Asset Category
      let categoryId = editingItem?.dropdown_id;

      if (!editingItem) {
        // Create Category
        try {
          const catRes = await axios.post("/api/asset-category/post", {
            fieldValue: categoryName,
            shortName: categoryShortName,
            user_id
          });
          categoryId = catRes.data._id;
        } catch (err) {
          if (err.response?.status === 409) {
            const allCats = await axios.get("/api/asset-category/get");
            const existingCat = allCats.data.find(c => c.fieldValue === categoryName);
            if (existingCat) {
              categoryId = existingCat._id;
              await axios.put(`/api/asset-category/put/${categoryId}`, {
                fieldValue: categoryName,
                shortName: categoryShortName,
                user_id
              });
            }
          } else {
            throw err;
          }
        }
      } else {
        // Update Category
        await axios.put(`/api/asset-category/put/${categoryId}`, {
          fieldValue: categoryName,
          shortName: categoryShortName,
          user_id
        });
      }

      // 2. Create or Update Depreciation Master
      const depData = {
        dropdownvalue: categoryName,
        categoryShortName: categoryShortName,
        dropdown_id: categoryId,
        inputValue: depreciationRate,
        dropdownLabel: "asset category",
        inputLabel: "depreciation rate (%)",
        user_id
      };

      if (editingItem) {
        await axios.put(`/api/asset-depreciation-master/put/${editingItem._id}`, depData);
        Swal.fire("Success", "Depreciation details updated successfully", "success");
      } else {
        await axios.post("/api/asset-depreciation-master/post", depData);
        Swal.fire("Success", "Asset Category and Depreciation details added successfully", "success");
      }

      resetForm();
      fetchItems();
    } catch (err) {
      console.error("Submission Error:", err);
      const msg = err.response?.data?.message || "Error saving data";
      Swal.fire("Error", msg, "error");
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryShortName("");
    setDepreciationRate("");
    setEditingItem(null);
    setErrorMessage("");
  };

  const handleEdit = async (item) => {
    setEditingItem(item);
    setCategoryName(item.dropdownvalue);
    setDepreciationRate(item.inputValue);

    // Fetch Category Short Name
    try {
      const catRes = await axios.get("/api/asset-category/get");
      const category = catRes.data.find(c => c._id === item.dropdown_id);
      if (category) {
        setCategoryShortName(category.shortName || "");
      }
    } catch (err) {
      console.error("Error fetching category details:", err);
    }
  };

  const handleDelete = (id, categoryId) => {
    Swal.fire({
      title: " ",
      text: "Are you sure you want to delete this details?",
      showCancelButton: true,
      cancelButtonText: "No, don't delete!",
      cancelButtonColor: "#50c878",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        confirmButton: "delete-btn",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/asset-depreciation-master/delete/${id}`);
          if (categoryId) {
            await axios.delete(`/api/asset-category/delete/${categoryId}`);
          }
          Swal.fire({
            title: " ",
            text: `Details have been deleted.`,
          });
          fetchItems();
        } catch (err) {
          Swal.fire(" ", "Something Went Wrong");
        }
      }
    });
  };


  return (
    <section className="hr-section">
      <div className="hr-card hr-fade-in border-0 rounded-md !p-0">
        <div className="border-b border-slate-100 py-4 px-8 mb-4 flex items-center justify-between">
            <h1 className="hr-heading">Depreciation Management</h1>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col">
            <div className="space-y-8 pb-10">
              <form
                onSubmit={handleSubmit}
                className="hr-card !p-8 bg-white border border-gray-200 rounded-lg shadow-md mt-2"
              >
                <SectionHeader 
                  title="Asset Depreciation Parameters" 
                  subtitle="Configure depreciation rates for specific asset categories." 
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                  {/* Category Name */}
                  <div>
                    <label className="hr-label">
                      Asset Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <IconWrapper icon={MdWidgets} />
                      <input
                        type="text"
                        className="hr-input"
                        placeholder="Enter Asset Category"
                        value={categoryName}
                        onChange={(e) => {
                          setCategoryName(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                      />
                    </div>
                  </div>

                  {/* Category Short Name */}
                  <div>
                    <label className="hr-label">
                      Category Short Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <IconWrapper icon={MdWidgets} />
                      <input
                        type="text"
                        className="hr-input"
                        placeholder="Enter Short Name"
                        value={categoryShortName}
                        onChange={(e) => {
                          setCategoryShortName(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                      />
                    </div>
                  </div>

                  {/* Depreciation Rate */}
                  <div>
                    <label className="hr-label">
                      Depreciation Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <IconWrapper icon={MdWidgets} />
                      <input
                        type="number"
                        className="hr-input"
                        placeholder="Enter Rate (%)"
                        value={depreciationRate}
                        onChange={(e) => {
                          setDepreciationRate(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                      />
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-red-500 text-xs mt-3 font-medium">{errorMessage}</p>
                )}

                <div className="mt-10 flex justify-end">
                  <button
                    type="submit"
                    className="hr-btn-primary min-w-[140px]"
                  >
                    {editingItem ? "Update Changes" : "Save Record"}
                  </button>
                </div>
              </form>

                            <div className="mt-12">
                                <SectionHeader title="Category List" subtitle="Overview of categories and their depreciation settings." />

                                <div className="overflow-x-auto border border-slate-100 rounded-lg shadow-sm">
                                    <table className="w-full border-collapse text-sm text-left">
                                        <thead className="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">SR. No.</th>
                                                <th className="px-6 py-4 font-bold">Asset Category</th>
                                                <th className="px-6 py-4 font-bold">Short Name</th>
                                                <th className="px-6 py-4 font-bold">Depreciation Rate</th>
                                                <th className="px-6 py-4 font-bold text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {items.length > 0 ? (
                                                items.map((data, index) => (
                                                    <tr key={data._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                                                        <td className="px-6 py-4 font-medium text-slate-900">{data.dropdownvalue}</td>
                                                        <td className="px-6 py-4 text-slate-600">{data.categoryShortName || "-"}</td>
                                                        <td className="px-6 py-4 text-slate-600">{data.inputValue}%</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <button onClick={() => handleEdit(data)} className="p-1.5 text-slate-400 hover:text-[#4285F4] transition-colors">
                                                                    <MdOutlineEdit size={18} />
                                                                </button>
                                                                <button onClick={() => handleDelete(data._id, data.dropdown_id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                                    <RiDeleteBin6Line size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">No depreciation records found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AssetDepreciationCategoryMaster;
