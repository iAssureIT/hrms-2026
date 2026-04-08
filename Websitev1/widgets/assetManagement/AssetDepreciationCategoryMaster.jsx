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
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 p-4">
            <h1 className="heading">Asset Category & Depreciation Details</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="lg:p-10 w-full lg:w-11/12 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Name */}
              <div>
                <label className="inputLabel mb-1">Asset Category <span className="text-red-600">*</span></label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="pr-2 border-r"><MdWidgets className="icon" /></span>
                  </div>
                  <input
                    type="text"
                    className="stdInputField w-full pl-12"
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
                <label className="inputLabel mb-1">Category Short Name <span className="text-red-600">*</span></label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="pr-2 border-r"><MdWidgets className="icon" /></span>
                  </div>
                  <input
                    type="text"
                    className="stdInputField w-full pl-12"
                    placeholder="Enter Category Short Name"
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
                <label className="inputLabel mb-1">Depreciation Rate (%) <span className="text-red-600">*</span></label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="pr-2 border-r"><MdWidgets className="icon" /></span>
                  </div>
                  <input
                    type="number"
                    className="stdInputField w-full pl-12"
                    placeholder="Enter Depreciation Rate"
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
              <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}

            <div className="mb-10 flex justify-end  mt-10 -me-3 w-full">
              <button type="submit" className="formButtons">
                {editingItem ? "Update" : "Submit"}
              </button>
            </div>
          </form>

          {/* Table */}
          <div className="relative overflow-x-auto mt-2 lg:w-11/12 mx-auto  border-3 mb-10 rounderd-md ">
            {items.length > 0 ? (
              <table className="w-full border-separate border-spacing-y-2 gap-2 text-sm text-left rtl:text-right">
                <thead className="text-xs space-y-6 border-spacing-5 font-normal uppercase  mb-2 border border-gray-200 rounded-sm p-2">
                  <tr className="mb-3  border-spacing-5 font-bold">
                    <th
                      scope="col"
                      className="px-6 py-4 border border-grayTwo border-r-0"
                    >
                      SR. No.
                    </th>
                    <td
                      scope="col"
                      className="px-6 py-4 border border-grayTwo border-r-0 border-l-0"
                    >
                      Asset Category
                    </td>
                    <td
                      scope="col"
                      className="px-6 py-4 border border-grayTwo border-r-0 border-l-0"
                    >
                      Category Short Name
                    </td>
                    <td
                      scope="col"
                      className="px-6 py-4 border border-grayTwo border-r-0 border-l-0"
                    >
                      Depreciation Rate (%)
                    </td>
                    <td
                      scope="col"
                      className="px-6 py-4 border border-grayTwo border-l-0"
                    >
                      ACTION
                    </td>
                  </tr>
                </thead>

                <tbody className="border-spacing-5 mt-2 border py-5 p-5 border-gray-200 bg-gray-50 rounded-sm">
                  {items.map((data, index) => (
                    <tr
                      key={data._id}
                      className="p-3 row space-x-3 border-spacing-5 font-normal odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 border border-grayTwo border-r-0 font-normal text-black whitespace-nowrap"
                      >
                        {index + 1}
                      </th>
                      <td className="px-6 py-4 border border-grayTwo border-r-0 border-l-0">
                        {data.dropdownvalue}
                      </td>
                      <td className="px-6 py-4 border border-grayTwo border-r-0 border-l-0">
                        {data.categoryShortName ? data.categoryShortName : "-"}
                      </td>
                      <td className="px-6 py-4 border border-grayTwo border-r-0 border-l-0">
                        {data.inputValue}
                      </td>
                      <td className="px-6 py-4 border border-grayTwo border-l-0">
                        <tr className="flex gap-3">
                          <td>
                            <MdOutlineEdit
                              className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                              size={"1.3rem"}
                              onClick={() => handleEdit(data)}
                            />
                          </td>
                          <td>
                            <RiDeleteBin6Line
                              className="  border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                              size={"1.3rem"}
                              onClick={() => handleDelete(data._id, data.dropdown_id)}
                            />
                          </td>
                        </tr>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="w-full text-center py-4 bg-gray-100 border border-gray-200">
                Data not found
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default AssetDepreciationCategoryMaster;
