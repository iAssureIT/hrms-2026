"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdOutlineEdit, MdWidgets } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

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
      let categoryId = editingItem?.dropdown_id;

      if (!editingItem) {
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
        await axios.put(`/api/asset-category/put/${categoryId}`, {
          fieldValue: categoryName,
          shortName: categoryShortName,
          user_id
        });
      }

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
      cancelButtonText: "No",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
      focusCancel: true,
      customClass: { confirmButton: "delete-btn" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/asset-depreciation-master/delete/${id}`);
          if (categoryId) {
            await axios.delete(`/api/asset-category/delete/${categoryId}`);
          }
          Swal.fire("Success", "Details have been deleted.");
          fetchItems();
        } catch (err) {
          Swal.fire("Error", "Something Went Wrong");
        }
      }
    });
  };

  return (
    <section className="section admin-box box-primary">
      <div className="hr-card hr-fade-in">
        {/* --- Page Header --- */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Asset Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Asset Depreciation <span className="text-[#3c8dbc] font-black">Master</span>
              </h1>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Configure depreciation rates for different asset categories to ensure accurate financial reporting and valuation.
          </p>
        </div>

        <div className="px-6 py-4">

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="admin-form-group">
                <label className="admin-label">
                  Asset Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Enter Asset Category"
                  value={categoryName}
                  required
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">
                  Category Short Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Enter Short Name"
                  value={categoryShortName}
                  required
                  onChange={(e) => {
                    setCategoryShortName(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">
                  Depreciation Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="admin-input"
                  placeholder="Enter Rate (%)"
                  value={depreciationRate}
                  required
                  onChange={(e) => {
                    setDepreciationRate(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
            )}

            <div className="mt-6 flex justify-start">
              <button type="submit" className="admin-btn-primary min-w-[140px]">
                {editingItem ? "Update Changes" : "Save Record"}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h3 className="admin-box-title uppercase mb-6">Category List</h3>

            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead className="admin-table-thead">
                  <tr>
                    <th className="admin-table-th w-20 text-center">SR. No.</th>
                    <th className="admin-table-th text-center w-32">Action</th>
                    <th className="admin-table-th">Asset Category</th>
                    <th className="admin-table-th">Short Name</th>
                    <th className="admin-table-th">Depreciation Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((data, index) => (
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
                              onClick={() => handleDelete(data._id, data.dropdown_id)}
                            >
                              <RiDeleteBin6Line size={18} />
                            </button>
                          </div>
                        </td>
                        <td className="admin-table-td">{data.dropdownvalue}</td>
                        <td className="admin-table-td">{data.categoryShortName || "-"}</td>
                        <td className="admin-table-td">{data.inputValue}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="admin-table-td text-center py-10 text-gray-400 font-bold italic">
                        No depreciation records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssetDepreciationCategoryMaster;
