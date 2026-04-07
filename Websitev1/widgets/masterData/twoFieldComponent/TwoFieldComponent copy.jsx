"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";
import { IoMdAdd } from "react-icons/io";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Button, Modal } from "flowbite-react";
import OneFieldComponents from "@/components/oneFieldComponent/OneFieldComponent";
import { IoMdClose } from "react-icons/io";

const TwoFieldComponent = ({ oneField, oneFieldLable, twoField }) => {
  const [openModal, setOpenModal] = useState(false);
  const [imageUrlfield1, setImageUrlfield1] = useState("");
  const [items, setItems] = useState([]);
  const [dropdownValue, setDropdownValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");
  const [dropdownData, setDropDownData] = useState([]);
  const [checkRelode, setCheckRelode] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const getList = async () => {
      try {
        if (oneField.fieldlabel === "Department") {
          const response = await axios.get(oneField.getListAPI);
          setDropDownData(response.data);
        } else if (oneField.fieldlabel === "Role") {
          const response = await axios.get(oneField.getListAPI);
          setDropDownData(response.data);
        } else if (oneField.fieldlabel === "Degree") {
          const response = await axios.get(oneField.getListAPI);
          setDropDownData(response.data);
        } else if (oneField.fieldlabel === "Category") {
          const response = await axios.get(oneField.getListAPI);
          setDropDownData(response.data);
        } else {
          setDropDownData([null]);
        }
      } catch (err) {
        console.log(err);
        setError("Error fetching items");
      }
    };
    getList();
    // console.log("items", items);
  }, [twoField, oneField, checkRelode]);

  // console.log("dropdownData", dropdownData);
  // console.log("imageUrlfield1", imageUrlfield1);
  const fetchItems = async () => {
    try {
      const response = await axios.get(twoField.getListAPI);
      setItems(response.data);
    } catch (err) {
      setError("Error fetching items");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!dropdownValue || inputValue.trim() === '') {
      setErrorMessage('Input field must not be empty');
      return; 
    }

    const item = { dropdownValue, inputValue };

    try {
      if (editingItem) {
        Swal.fire({
          title: "Do you want to save the changes?",
          
          showCancelButton: true,
          confirmButtonText: "Save",
          denyButtonText: `Don't save`,
        }).then((result) => {
          if (result.isConfirmed) {
            axios.put(twoField.editAPI +'/'+ editingItem._id, item);
            setEditingItem(null);
            Swal.fire("Saved!", "", "success");
          } else if (result.isDenied) {
            Swal.fire("Changes are not saved", "", "info");
          }

          fetchItems();
        });
      } else {
        axios.post(twoField.insertAPI, item);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Sucessfully added category and sub_category ",
          showConfirmButton: false,
          timer: 1500,
        });
      }
      setDropdownValue("");
      setInputValue("");
      fetchItems();
    } catch (err) {
      setError("Error saving item");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDropdownValue(item.dropdownValue);
    setInputValue(item.inputValue);
  };

  const handleDelete = async (id) => {
    try {
      Swal.fire({
        title: "Do you want to delete?",
        showCancelButton: true,
        confirmButtonText: "Yes",
        denyButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          axios.delete(twoField.deleteAPI + '/' + id);
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Sucessfully Updated category and sub_category ",
            showConfirmButton: false,
            timer: 1000,
          });
          fetchItems();
        } else if (result.isDenied) {
          Swal.fire("No changes", "", "info");
        }
      });
    } catch (err) {
      setError("Error deleting item");
    }
  };

  return (
    <div className="h-screen p-5 pb-10">
      <div className="  border-2 border-gray-50  rounded-sm  w-full h-fit pb-4">
        <div className="border-b-2 border-gray-50  ">
          <h2 className="font-semibold text-sm py-4 ps-6 text-gray-51">
            Category & Sub - Category Management
          </h2>
        </div>

        <div className="border-gray-100   w-11/12 border mx-auto   p-5 sm:px-1 sm:p-1 pb-10 mt-10 mb-5 rounded-md">
          <form
            onSubmit={handleSubmit}
            className="bg-red lg:p-10 w-full lg:w-11/12 sm:px-2 pb-4  lg:mx-11 mx-0 "
          >
            <div className="lg:flex xl:flex sm:block gap-5 sm:w-full">
              <div className="xl:w-1/2 lg:w-1/2 sm:w-full ">
                <label
                  for="website-admin"
                  className="mb-2 flex text-sm font-medium text-gray-900 dark:text-white"
                >
                  {oneField.fieldlabel}
                  <span className="text-red-400">*</span>
                  <IoMdAdd
                    className="bg-[#4285F4] ms-1 text-white cursor-pointer "
                    size={"1.2rem"}
                    onClick={() => setOpenModal(true)}
                  />
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                    </svg>
                  </span>
                  <select
                    value={dropdownValue}
                    onChange={(e) => {
                      setDropdownValue(e.target.value)
                      if (errorMessage) {
                        setErrorMessage(''); // Clear error message when user starts typing
                      }
                    }}
                    className="rounded-none outline-none rounded-e-lg bg-gray-50 border text-gray-900  block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  "
                    
                  >
                    <option value="" className="text-black">
                      Select a value
                    </option>
                    {dropdownData.map((option) => (
                      <option
                        key={option._id}
                        value={option.fieldValue}
                        className="text-black"
                      >
                        {option.fieldValue}
                      </option>
                    ))}
                  </select>
                </div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
              </div>

              <div className="xl:w-1/2 lg:w-1/2 sm:w-full">
                <label
                  for="website-admin"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {twoField.fieldlabel}
                  <span className="text-red-400">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value)
                      if (errorMessage) {
                        setErrorMessage(''); // Clear error message when user starts typing
                      }
                    }}
                    
                    placeholder="Enter..."
                    id="website-admin"
                    className="rounded-none rounded-e-lg outline-none bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
              </div>
            </div>

            <div className="mb-10 flex justify-end  mt-10 -me-3">
              <button
                type="submit"
                className="text-white bg-gradient-to-r bg-[#4285F4]  hover:bg-[#4285e4] focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg   inline-flex items-center  font-medium rounded-sm text-sm px-5 h-8 text-center me-4 mb-2"
              >
                {editingItem ? "Update" : "Create"}
                <MdOutlineKeyboardDoubleArrowRight
                  size={"1.5rem"}
                  className="ms-1"
                />
              </button>
            </div>
          </form>
          <div className="relative overflow-x-auto mt-2 lg:w-11/12 mx-auto bg-green-200 border-3 mb-10 rounderd-md ">
            {items && items.length > 0 ? (
              <table className="w-full gap-2 text-sm text-left rtl:text-right text-gray-51 bg-green-200">
                <thead className="text-xs space-y-6 border-spacing-5 font-semibold uppercase bg-gray-300 mb-2 border border-gray-200 rounded-sm p-2">
                  <tr className="mb-3  border-spacing-5">
                    <th scope="col" className="px-6 py-4">
                      SR. No.
                    </th>
                    <td scope="col" className="px-6 py-4">
                      CATEGORY
                    </td>
                    {oneField.showImg === true && (
                      <td scope="col" className="px-6 py-4">
                        Icon
                      </td>
                    )}
                    <td scope="col" className="px-6 py-4">
                      SUB-CATEGORY
                    </td>
                    {twoField.showImg === true && (
                      <td scope="col" className="px-6 py-4">
                        Icon
                      </td>
                    )}
                    <td scope="col" className="px-6 py-4">
                      ACTION
                    </td>
                  </tr>
                </thead>

                <tbody className="border-spacing-5 mt-2 border py-5 p-5 border-gray-200 bg-gray-50 rounded-sm">
                  {items.map((data, index) => {
                    const Img = dropdownData.find(img => img.fieldValue === data.dropdownValue);
                    console.log('img',Img);
                    return(
                      <tr
                      key={index}
                      className="p-3 row space-x-3 border-spacing-5 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                      >
                        {++index}
                      </th>
                      <td className="px-6 py-4">{data.dropdownValue}</td>

                      {oneField.showImg === true && (
                        <td className="px-6 py-4">
                          <img
                            src={Img}
                            alt="icon img"
                            className="h-10  hover:scale-150 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">{data.inputValue}</td>
                      {twoField.showImg === true && (
                        <td className="px-6 py-4">
                          $$
                        </td>
                      )}
                      <td className="px-6 py-4 ">
                        <tr className="flex gap-3">
                          <td>
                            <MdOutlineEdit
                              className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm"
                              size={"1.3rem"}
                              onClick={(e) => {
                                handleEdit(data);
                              }}
                            />
                          </td>
                          <td>
                            <RiDeleteBin6Line
                              className="border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm"
                              size={"1.3rem"}
                              onClick={(e) => {
                                handleDelete(data._id);
                              }}
                            />
                          </td>
                        </tr>
                      </td>
                    </tr>
                  )  
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
          onClose={() => setOpenModal(false)}
          className="lg:px-44 px-1 bg-[#1111114f] pt-10 "
        >
          <Modal.Body>
            <div className="space-y-6 mx-auto">
              <div className="flex justify-end relative top-10 me-10">
                <button
                  className="border-none outline-none"
                  onClick={() => setOpenModal(false)}
                >
                  <IoMdClose className=" text-black font-bold hover:bg-red-400 hover:text-white" size={"1.5rem"} />
                </button>
              </div>
              <OneFieldComponents
                openModal={openModal}
                setOpenModal={setOpenModal}
                fieldLabel={oneFieldLable} 
                // oneField={oneField}
                checkRelode={checkRelode}
                setCheckRelode={setCheckRelode}
                className="-pt-20"
              />
             
            </div>
          </Modal.Body>
        </Modal>

      </div>
    </div>
  );
};

export default TwoFieldComponent;
