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
    axios
      .patch(twoField.editDdListAPI + "/" + updateDropdownValue.ddid, [ddvalue])
      .then((responce) => { })
      .catch((err) => { });

    fetchItems();
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
    // console.log("item ==>", item);
    setEditingItem(item);
    setDropdownValue(item.dropdownvalue + "|" + item.dropdown_id);
    setInputValue(item.inputValue);
  };

  const handleDelete = (id) => {
    setCheckRelode((count) => count + 1);
    // setRunCount((count) => count + 1);
    Swal.fire({
      title: ` `,
      text: `Are you sure you want to delete this ${twoField?.fieldlabel}?`,

      showCancelButton: true,
      cancelButtonText: "No, don't delete!",
      cancelButtonColor: "#50c878",
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
            console.log("deletedUser", deletedUser);

            Swal.fire({
              title: "Success",
              text: `${twoField?.fieldlabel} have been deleted.`,
            });
            // setRunCount((count) => count + 1);
            setCheckRelode((count) => count + 1);
          })
          .catch((error) => {
            console.log("Error Message from list delete redirect  => ", error);
            Swal.fire(" ", "Something Went Wrong <br/>" + errorMessage);
          });
      }
      // else {
      //   Swal.fire({
      //     title: " ",
      //     text: `Subactivity is Safe.`,

      //   });
      // }
    });

    // axios.delete(`${oneField.deleteAPI}/${id}`)
    //   .then((responce) => {
    //     setRunCount((count) => count + 1)
    //   }).catch((err) => {

    //     console.log(err)

    //   })
    //         });;
    //   Swal.fire({
    //     title: `Are you sure you want to delete ${oneField.fieldlabel}?
    //     Once deleted, you won't be able to retrieve the data.
    //      ?`,
    //     showCancelButton: true,
    //     confirmButtonText: "Yes",
    //     denyButtonText: `No`,
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       axios
    //         .delete(`${oneField.deleteAPI}/${id}`)
    //         .then((responce) => {
    //           setCheckRelode((count) => count + 1);
    //           Swal.fire({
    //             position: "center",
    //             icon: "success",
    //             title: `Deleted! Your ${oneField.fieldlabel} has been Deleted`,
    //             showConfirmButton: false,
    //             timer: 1000,
    //           });
    //         })
    //         .catch((err) => {
    //           // Swal.fire("Somthing went wrong", "", "error");
    //           setOneFieldErrorModal(true)
    //         });
    //     } else if (result.isDenied) {
    //       Swal.fire("Alright! Your Field is secure", "", "info");
    //     }
    //   });

    // try {
    //   Swal.fire({
    //     title: "Do you want to delete?",
    //     showCancelButton: true,
    //     confirmButtonText: "Yes",
    //     denyButtonText: `No`,
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       axios.delete(twoField.deleteAPI + "/" + id);
    //       setCheckRelode((count) => count + 1);
    //       Swal.fire({
    //         position: "center",
    //         icon: "success",
    //         title: `Sucessfully deleted ${twoField.fieldlabel}`,
    //         showConfirmButton: false,
    //         timer: 1000,
    //       });
    //       fetchItems();
    //     } else if (result.isDenied) {
    //       Swal.fire("No changes", "", "info");
    //     }
    //   });
    // } catch (err) {
    //   setError("Error deleting item");
    // }
  };

  return (
    <section className="hr-section">
      <div className="hr-card hr-fade-in border-0">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-8">
            <h1 className="hr-heading">{oneField.fieldlabel} & {twoField.fieldlabel} Details</h1>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col pt-4">
            <div className="space-y-8 pb-10">
              <form
                onSubmit={handleSubmit}
                className="hr-card bg-slate-50/50 border-slate-100 shadow-none p-8 lg:p-10"
              >
                <div className="flex flex-col lg:flex-row gap-8 w-full">
                  {/* First Field */}
                  <div className="w-full lg:w-1/2">
                    <label className="hr-label flex items-center">
                      {oneField.fieldlabel}
                      <span className="text-red-500 ms-1">*</span>
                      {
                        showAddButton && (
                          <button 
                            type="button"
                            className="ms-3 p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm"
                            onClick={() => setOpenModal(true)}
                            title={`Add New ${oneField.fieldlabel}`}
                          >
                            <IoMdAdd size={14} />
                          </button>
                        )
                      }
                    </label>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-green-500 transition-colors">
                          <MdWidgets className="text-lg" />
                      </div>

                      <select
                        value={dropdownValue}
                        onChange={(e) => {
                          setDropdownValue(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        className="hr-select !pl-12 !py-3"
                      >
                        <option value="" disabled>
                          -- Select {oneField.fieldlabel} --
                        </option>

                        {Array.isArray(dropdownData) &&
                          dropdownData.map((option) => (
                            <option
                              key={option._id}
                              value={(option.fieldValue || option.centerName) + "|" + option._id}
                              className="text-slate-800"
                            >
                              {option.fieldValue || option.centerName}
                            </option>
                          ))}
                      </select>
                    </div>

                    {errorMessage && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{errorMessage}</p>
                    )}
                  </div>


                  {/* Second Field */}
                  <div className="w-full lg:w-1/2">
                    <label className="hr-label">
                      {twoField.fieldlabel}
                      <span className="text-red-500 ms-1">*</span>
                    </label>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-green-500 transition-colors">
                          <MdWidgets className="text-lg" />
                      </div>

                      <input
                        type="text"
                        className="hr-input !pl-12 !py-3"
                        placeholder={`Enter ${twoField.fieldlabel}`}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                      />
                    </div>

                    {errorMessage && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{errorMessage}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-10">
                  <button
                    type="submit"
                    className="hr-btn-primary"
                  >
                    {editingItem ? "Update Changes" : "Save Record"}
                  </button>
                </div>
              </form>
              
              <div className="border-t border-slate-100 pt-8 mt-10">
                <h2 className="hr-subheading text-center mb-6 uppercase tracking-wider">
                  Existing {twoField.fieldlabel} List
                </h2>
              </div>
                {items && items.length > 0 ? (
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
                          {oneField.fieldlabel}
                        </td>
                        {oneField.showImg === true && (
                          <td
                            scope="col"
                            className="px-6 py-4 border border-grayTwo border-r-0 border-l-0"
                          >
                            Icon
                          </td>
                        )}
                        <td
                          scope="col"
                          className="px-6 py-4 border border-grayTwo border-r-0 border-l-0"
                        >
                          {twoField.fieldlabel}
                        </td>
                        {twoField.showImg === true && (
                          <td
                            scope="col"
                            className="px-6 py-4 border border-grayTwo border-l-0"
                          >
                            Icon
                          </td>
                        )}
                        <td
                          scope="col"
                          className="px-6 py-4 border border-grayTwo border-l-0"
                        >
                          ACTION
                        </td>
                      </tr>
                    </thead>

                    <tbody className="border-spacing-5 mt-2 border py-5 p-5 border-gray-200 bg-gray-50 rounded-sm">
                      {Array.isArray(items) &&
                        items.map((data, index) => {
                          const Img = dropdownData.find(
                            (img) => img.fieldValue === data.dropdownValue
                          );

                          return (
                            <tr
                              key={index}
                              className="p-3 row space-x-3 border-spacing-5 font-normal odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                            >
                              <th
                                scope="row"
                                className="px-6 py-4 border border-grayTwo border-r-0 font-normal text-black whitespace-nowrap"
                              >
                                {++index}
                              </th>
                              <td className="px-6 py-4 border border-grayTwo border-r-0 border-l-0">
                                {data.dropdownvalue}
                              </td>

                              {oneField.showImg === true && (
                                <td className="px-6 py-4">
                                  <img
                                    src={Img}
                                    alt="icon img"
                                    className="h-10  hover:scale-150 cursor-pointer"
                                  />
                                </td>
                              )}
                              <td className="px-6 py-4 border border-grayTwo border-r-0 border-l-0">
                                {data.inputValue}
                              </td>
                              {twoField.showImg === true && (
                                <td className="px-6 py-4 border border-grayTwo border-r-0 border-l-0">
                                  $$
                                </td>
                              )}
                              <td className="px-6 py-4  border border-grayTwo border-l-0">
                                <div className="flex gap-3">
                                  <div>
                                    <MdOutlineEdit
                                      className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                      size={"1.3rem"}
                                      onClick={(e) => {
                                        handleEdit(data);
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <RiDeleteBin6Line
                                      className="  border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                      size={"1.3rem"}
                                      onClick={(e) => {
                                        handleDelete(data._id);
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                ) : (
                  <div className="w-full text-center py-4 bg-gray-100 border border-gray-200">
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
                      <IoMdClose
                        className=" "
                      // size={"1.5rem"}
                      />
                    </button>
                  </div>
                  <OneFieldComponent
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    fieldLabel={oneFieldLable}
                    apiPath={oneField.apiPath} // Pass apiPath to OneFieldComponent
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
        </div>
    </section>
  );
};

export default TwoFieldComponent;
