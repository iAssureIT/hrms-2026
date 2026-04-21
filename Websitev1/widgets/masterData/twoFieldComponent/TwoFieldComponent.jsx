"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdClose, MdDelete, MdOutlineEdit } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdWidgets } from "react-icons/md";
import { Modal } from "flowbite-react";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent.jsx";
import { IoMdClose } from "react-icons/io";
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

const TwoFieldComponent = ({
  oneField,
  oneFieldLable,
  twoFieldLable,
  twoField,
  showAddButton,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [items, setItems] = useState([]);
  const [dropdownValue, setDropdownValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");
  const [dropdownData, setDropDownData] = useState([]);
  const [checkRelode, setCheckRelode] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [deleteUserId, setDeleteUserId] = useState("");
  const [updateDropdownValue, setUpdateDropdownValue] = useState({
    ddvalue: "",
    ddid: "",
  });

  const [user_id, setUser_id] = useState("");

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      const parseUser_id = userDetailsParse.user_id;
      setUser_id(parseUser_id);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [checkRelode]);

  const ddvalue = updateDropdownValue.ddvalue;
  useEffect(() => {
    if (updateDropdownValue.ddid) {
      axios
        .patch(twoField.editDdListAPI + "/" + updateDropdownValue.ddid, [ddvalue])
        .then((responce) => { })
        .catch((err) => { });

      fetchItems();
    }
  }, [updateDropdownValue]);

  useEffect(() => {
    const getList = async () => {
      try {
        if (oneField.getListAPI) {
          const response = await axios.get(oneField.getListAPI);
          setDropDownData(response.data);
        } else {
          setDropDownData([]);
        }
      } catch (err) {
        setError("Error fetching items");
      }
    };
    getList();
    fetchItems();
  }, [twoField, oneField, checkRelode]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(twoField.getListAPI);
      setItems(response?.data);
    } catch (err) {
      setError("Error fetching items");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dropdownValue || inputValue.trim() === "") {
      setErrorMessage("This field is required ");
      return;
    }

    var dropdown_id = dropdownValue.split("|")[1];
    var dropdownvalue = dropdownValue.split("|")[0];

    const item = {
      dropdownvalue,
      dropdown_id,
      inputValue,
      dropdownLabel: oneFieldLable.toLowerCase(),
      inputLabel: twoFieldLable.toLowerCase(),
      user_id,
    };

    try {
      if (editingItem) {
        axios
          .put(twoField.editAPI + "/" + editingItem._id, item)
          .then((response) => {
            console.log("updated product => ", response.data);
            setCheckRelode((count) => count + 1);
            if (response.data) {
              Swal.fire(" ", response.data.message || "Data updated successfully.");

              if (response.data.success) {
                setDropdownValue("");
                setInputValue("");
                fetchItems();
                setEditingItem(null);
              }
            }
          })
          .catch((err) => {
            const errorMessage = err?.response?.data?.message || "Error updating item";
            Swal.fire(" ", errorMessage);
          });
      } else {
        axios.post(twoField.insertAPI, item)
          .then((response) => {
            setCheckRelode((count) => count + 1);
            Swal.fire("Success", `${twoFieldLable} added successfully.`);
            setDropdownValue("");
            setInputValue("");
            fetchItems();
          })
          .catch((err) => {
            const errorMessage = err?.response?.data?.message || "Error adding item";
            Swal.fire(" ", errorMessage);
          });
      }
    } catch (err) {
      Swal.fire(" ", "An unexpected error occurred.");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDropdownValue(item.dropdownvalue + "|" + item.dropdown_id);
    setInputValue(item.inputValue);
  };

  const handleDelete = (id) => {
    setCheckRelode((count) => count + 1);
    Swal.fire({
      title: ` `,
      text: `Are you sure you want to delete this ${twoField?.fieldlabel}?`,

      showCancelButton: true,
      cancelButtonText: "No, don't delete!",
      cancelButtonColor: "#3c8dbc",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        confirmButton: "delete-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${twoField.deleteAPI}/${id}`)
          .then((deletedUser) => {
            Swal.fire({
              title: "Success",
              text: `${twoField?.fieldlabel} have been deleted.`,
            });
            setCheckRelode((count) => count + 1);
          })
          .catch((error) => {
            console.log("Error Message from list delete redirect  => ", error);
            Swal.fire(" ", "Something Went Wrong <br/>" + errorMessage);
          });
      }
    });
  };

  return (
    <div className="p-4">
      <h3 className="admin-heading mb-4 px-2">
        {oneField.fieldlabel} & {twoField.fieldlabel} Management
      </h3>

      <div className="admin-box box-primary">
          <div className="admin-box-header border-b border-gray-100">
              <h3 className="admin-box-title">Add New {twoField.fieldlabel}</h3>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid lg:grid-cols-2 gap-6 w-full">
                {/* First Field */}
                <div className="admin-form-group">
                  <label className="admin-label">
                    {oneField.fieldlabel}
                    <span className="text-red-500 ms-1">*</span>
                    {
                      showAddButton && (
                        <button 
                          type="button"
                          className="ms-2 text-[#4285F4] hover:text-blue-700 transition-colors"
                          onClick={() => setOpenModal(true)}
                          title={`Add New ${oneField.fieldlabel}`}
                        >
                          <IoMdAdd size={16} />
                        </button>
                      )
                    }
                  </label>

                  <select
                    value={dropdownValue}
                    onChange={(event) => {
                      setDropdownValue(event.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    className="admin-select"
                  >
                    <option value="" disabled>
                      -- Select {oneField.fieldlabel} --
                    </option>

                    {Array.isArray(dropdownData) &&
                      dropdownData.map((option) => (
                        <option
                          key={option._id}
                          value={(option.fieldValue || option.centerName) + "|" + option._id}
                        >
                          {option.fieldValue || option.centerName}
                        </option>
                      ))}
                  </select>

                  {errorMessage && (
                    <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
                  )}
                </div>

                {/* Second Field */}
                <div className="admin-form-group">
                  <label className="admin-label">
                    {twoField.fieldlabel}
                    <span className="text-red-500 ms-1">*</span>
                  </label>

                  <input
                    type="text"
                    className="admin-input"
                    placeholder={`Enter ${twoField.fieldlabel}`}
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                  />

                  {errorMessage && (
                    <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-start mt-4">
                <button
                  type="submit"
                  className="admin-btn-primary"
                >
                  {editingItem ? "Update Changes" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
      </div>

      <div className="admin-box box-primary mt-6">
        <div className="admin-box-header border-b border-gray-100">
          <h3 className="admin-box-title">Existing {twoField.fieldlabel} List</h3>
        </div>
        
        <div className="p-6 overflow-x-auto">
          {items && items.length > 0 ? (
            <table className="admin-table">
              <thead className="admin-table-thead">
                <tr>
                  <th className="admin-table-th w-20">SR. No.</th>
                  <th className="admin-table-th">{oneField.fieldlabel}</th>
                  {oneField.showImg === true && <th className="admin-table-th">Icon</th>}
                  <th className="admin-table-th">{twoField.fieldlabel}</th>
                  {twoField.showImg === true && <th className="admin-table-th">Icon</th>}
                  <th className="admin-table-th w-32 text-center">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(items) &&
                  items.map((data, index) => {
                    const Img = dropdownData.find(
                      (img) => img.fieldValue === data.dropdownValue
                    );

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="admin-table-td font-bold text-center">
                          {index + 1}
                        </td>
                        <td className="admin-table-td">
                          {data.dropdownvalue}
                        </td>

                        {oneField.showImg === true && (
                          <td className="admin-table-td text-center">
                            <img
                              src={Img}
                              alt="icon img"
                              className="h-8 inline-block"
                            />
                          </td>
                        )}
                        <td className="admin-table-td">
                          {data.inputValue}
                        </td>
                        {twoField.showImg === true && (
                          <td className="admin-table-td text-center">
                            $$
                          </td>
                        )}
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
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <div className="w-full text-center py-8 text-gray-400 font-bold italic bg-gray-50 border border-dashed border-gray-200">
              Data not found
            </div>
          )}
        </div>
      </div>

      <Modal
        show={openModal}
        size="6xl"
        onClose={() => {
          setOpenModal(false)
          setCheckRelode((count) => count + 1)
        }}
        className="lg:px-44 px-1 bg-[#1111114f] pt-10 "
      >
        <Modal.Body>
          <div className="mx-auto">
            <div className="flex justify-end relative mb-4">
              <button
                className="bg-red-400 hover:bg-red-800 text-white font-bold py-1 px-1 border-red-700 rounded-sm"
                onClick={() => {
                  setOpenModal(false)
                  setCheckRelode((count) => count + 1)
                }}
              >
                <IoMdClose />
              </button>
            </div>
            <OneFieldComponent
              openModal={openModal}
              setOpenModal={setOpenModal}
              fieldLabel={oneFieldLable}
              apiPath={oneField.apiPath}
              updateDropdownValue={updateDropdownValue}
              setUpdateDropdownValue={setUpdateDropdownValue}
              checkRelode={checkRelode}
              setCheckRelode={setCheckRelode}
              className="-pt-20"
            />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TwoFieldComponent;
