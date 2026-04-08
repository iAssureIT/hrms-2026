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
            Swal.fire(" ", `${twoFieldLable} added successfully.`);
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
              title: " ",
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
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300">
            <h1 className="heading">{oneField.fieldlabel} & {twoField.fieldlabel} Details</h1>
          </div>
        </div>

        <div className="h-fit p-5 pb-10">
          <div className=" rounded-sm  w-full h-fit pb-4">
            <div className="   w-11/12 mx-auto   p-5 sm:px-1 sm:p-1 pb-10 mt-10 mb-5 rounded-md">
              <form
                onSubmit={handleSubmit}
                className="bg-red lg:p-10 w-full lg:w-11/12 sm:px-2 pb-4  lg:mx-11 mx-0 "
              >
                {/* <div className="flex flex-col lg:flex-row gap-5 w-full">

                  <div className="xl:w-1/2 lg:w-1/2 sm:w-full my-2 lg:my-0 mt-3">
                    <label
                      htmlFor="website-admin"
                      className="inputLabel flex mb-0"
                    // className="mb-2 w-full flex text-sm font-normal text-gray-900 dark:text-white"
                    >
                      {oneField.fieldlabel}
                      <span className="text-red-600 ms-1">*</span>
                      <IoMdAdd
                        className="bg-[#4285F4] ms-1 text-white cursor-pointer "
                        size={"1.2rem"}
                        onClick={() => setOpenModal(true)}
                      />
                    </label>
                    <div className="">
                      <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                            <MdWidgets className="icon" />
                          </span>
                        </div>
                        <select
                          value={dropdownValue}
                          onChange={(e) => {
                            setDropdownValue(e.target.value);
                            if (errorMessage) {
                              setErrorMessage("");
                            }
                          }}
                          className={`stdSelectField ${dropdownValue
                            ? "selectOption"
                            : "text-gray-400 font-normal"
                            }`}
                        // className="rounded-none outline-none rounded-e-lg bg-gray-50 border text-gray-900  block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  "
                        >
                          <option
                            defaultValue=""
                            disabled
                            selected
                            className="text-grayThree"
                          >
                            -- Select a value --
                          </option>
                          {Array.isArray(dropdownData) &&
                            dropdownData.map((option, index) => (
                              <option
                                key={option._id}
                                value={option.fieldValue + "|" + option._id}
                                className="text-black"
                              >
                                {option.fieldValue}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    {errorMessage && (
                      <p style={{ color: "red" }}>{errorMessage}</p>
                    )}
                  </div>

                  <div className="xl:w-1/2 lg:w-1/2 sm:w-full my-2 lg:my-0">
                    <label
                      defaultValue="website-admin"
                      // className="block mb-2 text-sm font-normal text-gray-900 dark:text-white"
                      className="inputLabel mt-2"
                    >
                      {twoField.fieldlabel}
                      <span className="text-red-600 ms-1">*</span>
                    </label>
                    <div className="flex">
                      <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                            <MdWidgets className="icon" />
                          </span>
                        </div>
                        <input
                          type="text"
                          id="minStock"
                          className="stdInputField"
                          placeholder={`Enter ${twoField.fieldlabel}`}

                          // className="text-gray-900 rounded-e-md focus:shadow-md block flex-1 min-w-0 w-full text-sm border-gray-300 p-2 outline-none"
                          value={inputValue}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            if (errorMessage) {
                              setErrorMessage(""); // Clear error message when user starts typing
                            }
                          }}
                        />
                      </div>
                    </div>
                    {errorMessage && (
                      <p style={{ color: "red" }}>{errorMessage}</p>
                    )}
                  </div>
                </div> */}
                <div className="flex flex-col lg:flex-row gap-6 w-full">

                  {/* First Field */}
                  <div className="w-full lg:w-1/2">
                    <label className="inputLabel flex items-center mb-1">
                      {oneField.fieldlabel}
                      <span className="text-red-600 ms-1">*</span>
                      {
                        showAddButton && (
                          <IoMdAdd
                            className="bg-green hover:bg-Green ms-1 text-white cursor-pointer"
                            size={"1.2rem"}
                            onClick={() => setOpenModal(true)}
                          />
                        )
                      }
                    </label>

                    <div className="relative mt-3">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="pr-2 border-r">
                          <MdWidgets className="icon" />
                        </span>
                      </div>

                      <select
                        value={dropdownValue}
                        onChange={(e) => {
                          setDropdownValue(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        className={`stdSelectField w-full pl-12 ${dropdownValue ? "selectOption" : "text-gray-400"
                          }`}
                      >
                        <option value="" disabled>
                          -- Select a value --
                        </option>

                        {Array.isArray(dropdownData) &&
                          dropdownData.map((option) => (
                            <option
                              key={option._id}
                              value={(option.fieldValue || option.centerName) + "|" + option._id}
                              className="text-black"
                            >
                              {option.fieldValue || option.centerName}
                            </option>
                          ))}
                      </select>
                    </div>

                    {errorMessage && (
                      <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                    )}
                  </div>


                  {/* Second Field */}
                  <div className="w-full lg:w-1/2">
                    <label className="inputLabel mb-1">
                      {twoField.fieldlabel}
                      <span className="text-red-600 ms-1">*</span>
                    </label>

                    <div className="relative mt-2">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="pr-2 border-r">
                          <MdWidgets className="icon" />
                        </span>
                      </div>

                      <input
                        type="text"
                        className="stdInputField w-full pl-12"
                        placeholder={`Enter ${twoField.fieldlabel}`}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                      />
                    </div>

                    {errorMessage && (
                      <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                    )}
                  </div>

                </div>


                <div className="mb-10 flex justify-end  mt-10 -me-3 w-full">
                  <button
                    type="submit"
                    className="formButtons"
                  // className="text-white bg-gradient-to-r bg-[#4285F4]  hover:bg-blue-700 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg   inline-flex items-center  font-medium rounded-sm text-sm px-5 h-8 text-center me-4 mb-2"
                  >
                    {editingItem ? "Update" : "Submit"}
                  </button>
                </div>
              </form>
              <div className="relative overflow-x-auto mt-2 lg:w-11/12 mx-auto  border-3 mb-10 rounderd-md ">
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
                                <tr className="flex gap-3">
                                  <td>
                                    <MdOutlineEdit
                                      className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                      size={"1.3rem"}
                                      onClick={(e) => {
                                        handleEdit(data);
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <RiDeleteBin6Line
                                      className="  border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                      size={"1.3rem"}
                                      onClick={(e) => {
                                        handleDelete(data._id);
                                      }}
                                    />
                                  </td>
                                </tr>
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
                    // oneField={oneField}
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
      </div>
    </section>
  );
};

export default TwoFieldComponent;
