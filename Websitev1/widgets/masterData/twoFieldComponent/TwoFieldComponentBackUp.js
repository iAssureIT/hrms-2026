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
  const [twoFieldSuccessModal, setTwoFieldSuccessModal] = useState(false)
  const [twoFieldErrorModal, setTwoFieldErrorModal] = useState(false)

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);
  const [deleteFailModal, setDeleteFailModal] = useState(false);
  const [oneFieldErrorModal, setOneFieldErrorModal] = useState(false)
 
  useEffect(() => {
    fetchItems();
  }, [checkRelode]);

  const ddvalue = updateDropdownValue.ddvalue;
  useEffect(() => {
    axios
      .patch(twoField.editDdListAPI + "/" + updateDropdownValue.ddid, [ddvalue])
      .then((responce) => {})
      .catch((err) => {});

    fetchItems();
  }, [updateDropdownValue]);

  useEffect(() => {
    const getList = async () => {
      try {
        if (!oneField.oneFieldLable) {
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
      setItems(response.data);
    } catch (err) {
      setError("Error fetching items");
    }
  };
  // console.log("dropdownData", dropdownData);
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
    };

    try {
      if (editingItem) {
        axios.put(twoField.editAPI + "/" + editingItem._id, item);
        setCheckRelode((count) => count + 1);
        setTwoFieldSuccessModal(true)
        // Swal.fire({
        //   title: "Do you want to save the changes?",

        //   showCancelButton: true,
        //   confirmButtonText: "Save",
        //   denyButtonText: `Don't save`,
        // }).then((result) => {
        //   if (result.isConfirmed) {
        //     axios.put(twoField.editAPI + "/" + editingItem._id, item);
        //     setCheckRelode((count) => count + 1);
        //     // setEditingItem(null);
        //     // Swal.fire("Data Updated Sucessfully!", "", "success");
        //     setTwoFieldSuccessModal(true)
        //   } else if (result.isDenied) {
        //     Swal.fire("Changes are not saved", "", "info");
        //     // setTwoFieldSuccessModal(true)
        //   }

          fetchItems();
        }
      else {
        axios.post(twoField.insertAPI, item);
        setCheckRelode((count) => count + 1);
        // Swal.fire({
        //   position: "center",
        //   icon: "success",
        //   title: twoFieldLable + " added Sucessfully.",
        //   showConfirmButton: false,
        //   timer: 1500,
        // });
        setTwoFieldSuccessModal(true)
      }
      setDropdownValue("");
      setInputValue("");
      fetchItems();
    } catch (err) {
      setError("Error saving item");
    }
  };

  const handleEdit = (item) => {
    // console.log("item ==>", item);
    setEditingItem(item);
    setDropdownValue(item.dropdownvalue + "|" + item.dropdown_id);
    setInputValue(item.inputValue);
  };

  const handleDelete =  (id) => {
    var id = id ? id : deleteUserId;
    // console.log("`${oneField.deleteAPI}/${id}`",`${oneField.deleteAPI}/${id}`)
    try {
       axios
        .delete(`${twoField.deleteAPI}/${id}`)
        .then((responce) => {
          setCheckRelode((count) => count + 1)
          fetchItems();
        })
        .catch((err) => {
          // Swal.fire("Somthing went wrong", "", "error");
          console.log(err)
        });
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
    } 
    catch (error) {
      // Swal.fire("Somthing Went Wrong", "", "info");
      setOneFieldErrorModal(true)
      }
    
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

  // console.log("dropdown", dropdownData);
  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300">
            <h1 className="heading">Activity & Subactivity</h1>
          </div>
        </div>

        <div className="h-fit p-5 pb-10">
          <div className=" rounded-sm  w-full h-fit pb-4">
            <div className="   w-11/12 mx-auto   p-5 sm:px-1 sm:p-1 pb-10 mt-10 mb-5 rounded-md">
              <form
                onSubmit={handleSubmit}
                className="bg-red lg:p-10 w-full lg:w-11/12 sm:px-2 pb-4  lg:mx-11 mx-0 "
              >
                <div className="lg:flex xl:flex sm:block gap-5 sm:w-full">
                  <div className="xl:w-1/2 lg:w-1/2 sm:w-full">
                    <label
                      for="website-admin"
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
                          className={`stdSelectField ${dropdownValue ? "selectOption" : "text-gray-400 font-normal"}`}
                          // className="rounded-none outline-none rounded-e-lg bg-gray-50 border text-gray-900  block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  "
                        >
                          <option value="" disabled selected className="text-grayThree">
                            Select a value
                          </option>
                          {dropdownData.map((option) => (
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

                  <div className="xl:w-1/2 lg:w-1/2 sm:w-full">
                    <label
                      for="website-admin"
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
                          placeholder="Enter Subactivity"
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
                </div>

                <div className="mb-10 flex justify-end  mt-10 -me-3">
                  <button
                    type="submit"
                    className="formButtons"
                    // className="text-white bg-gradient-to-r bg-[#4285F4]  hover:bg-blue-700 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg   inline-flex items-center  font-medium rounded-sm text-sm px-5 h-8 text-center me-4 mb-2"
                  >
                    {editingItem ? "Update" : "Submit"}
                  </button>
                </div>
              </form>
              <div className="relative overflow-x-auto mt-2 lg:w-11/12 mx-auto bg-green-200 border-3 mb-10 rounderd-md ">
                {items && items.length > 0 ? (
                  <table className="w-full gap-2 text-sm text-left rtl:text-right text-gray-51 bg-green-200">
                    <thead className="text-xs space-y-6 border-spacing-5 font-normal uppercase bg-gray-300 mb-2 border border-gray-200 rounded-sm p-2">
                      <tr className="mb-3  border-spacing-5 font-bold">
                        <th scope="col" className="px-6 py-4">
                          SR. No.
                        </th>
                        <td scope="col" className="px-6 py-4">
                          {oneField.fieldlabel}
                        </td>
                        {oneField.showImg === true && (
                          <td scope="col" className="px-6 py-4">
                            Icon
                          </td>
                        )}
                        <td scope="col" className="px-6 py-4">
                          {twoField.fieldlabel}
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
                        const Img = dropdownData.find(
                          (img) => img.fieldValue === data.dropdownValue
                        );

                        return (
                          <tr
                            key={index}
                            className="p-3 row space-x-3 border-spacing-5 font-normal odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                          >
                            <th
                              scope="row"
                              className="px-6 py-4 font-normal text-black whitespace-nowrap"
                            >
                              {++index}
                            </th>
                            <td className="px-6 py-4">{data.dropdownvalue}</td>

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
                              <td className="px-6 py-4">$$</td>
                            )}
                            <td className="px-6 py-4 ">
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
                                      setDeleteModal(true)
                                      setDeleteUserId(data._id);
                                    }}
                                    // handleDelete(data._id);
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
                                    show={deleteModal}
                                    size="md"
                                    onClose={() => setDeleteModal(false)}
                                    popup
                                  >
                                    <Modal.Header className="modalHeader justify-end">
                                      <div
                                        className="modalCloseButton"
                                        onClick={() => setDeleteModal(false)}
                                      >
                                        <MdClose className="icon text-white font-medium" />
                                      </div>
                                    </Modal.Header>
                                    <Modal.Body>
                                      <div className="modalBody">
                                        <h3 className="modalText">
                                          Are you sure you want to delete this data
                                        </h3>
                                        <div className="flex justify-center gap-4">
                                          <button
                                            className="modalFailBtn"
                                            onClick={() => {
                                              setDeleteModal(false);
                                              setDeleteFailModal(true);
                                            }}
                                          >
                                            No
                                          </button>
                                          <button
                                            className="modalSuccessBtn"
                                            onClick={() => {
                                              // console.log(deleteUserId)
                                              handleDelete(deleteUserId);
                                              setDeleteModal(false);
                                              setDeleteSuccessModal(true);
                                            }}
                                          >
                                            Confirm
                                          </button>
                                        </div>
                                      </div>
                                    </Modal.Body>
                                  </Modal>

            <Modal
                show={deleteSuccessModal}
                size="md"
                onClose={() => setDeleteSuccessModal(false)}
                popup
              >
                <Modal.Header className="modalHeader justify-end">
                  <div
                    className="modalCloseButton"
                    onClick={() => setDeleteSuccessModal(false)}
                  >
                    <MdClose className="icon text-white font-medium" />
                  </div>
                </Modal.Header>
                <Modal.Body>
                  <div className="modalBody">
                    {/* {Swal.fire({ icon: "success" })} */}
                    <h3 className="modalText">
                      Data Deleted Successfully
                    </h3>
                    <div className="flex justify-center gap-4">
                      <button
                        className="modalSuccessBtn"
                        onClick={() => setDeleteSuccessModal(false)}
                      >
                        Ok
                      </button>
                    </div>
                  </div>
                </Modal.Body>
              </Modal>
              <Modal
                show={deleteFailModal}
                size="md"
                onClose={() => setDeleteFailModal(false)}
                popup
              >
                <Modal.Header className="modalHeader justify-end">
                  <div
                    className="modalCloseButton"
                    onClick={() => setDeleteFailModal(false)}
                  >
                    <MdClose className="icon text-white font-medium" />
                  </div>
                </Modal.Header>
                <Modal.Body>
                  <div className="modalBody">
                    {/* {Swal.fire({ icon: "success" })} */}
                    <h3 className="modalText">Data is safe</h3>
                    <div className="flex justify-center gap-4">
                      <button
                        className="modalSuccessBtn"
                        onClick={() => setDeleteFailModal(false)}
                      >
                        Ok
                      </button>
                    </div>
                  </div>
                </Modal.Body>
              </Modal>

            <Modal
              show={openModal}
              size="6xl"
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
                      <IoMdClose
                        className=" text-black font-bold hover:bg-red-400 hover:text-white"
                        size={"1.5rem"}
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

            <Modal
                show={twoFieldSuccessModal}
                size="md"
                onClose={() => {setTwoFieldSuccessModal(false); setEditingItem(null)}}
                popup
              >
                <Modal.Header className="modalHeader justify-end">
                  <div
                    className="modalCloseButton"
                    onClick={() => {setTwoFieldSuccessModal(false); setEditingItem(null)}}
                  >
                    <MdClose className="icon text-white font-medium" />
                  </div>
                </Modal.Header>
                <Modal.Body>
                  <div className="modalBody">
                    <h3 className="modalText">
                      {/* {console.log(editingItem)} */}
                      {`
                      ${oneField.fieldlabel} 
                      ${editingItem ? "Updated" : "Added"} Successfully`}
                    </h3>
                    <div className="flex justify-center gap-4">
                      <button
                        className="modalSuccessBtn"
                        onClick={() => {setTwoFieldSuccessModal(false); setEditingItem(null)}}
                      >
                        Ok
                      </button>
                    </div>
                  </div>
                </Modal.Body>
              </Modal>

              <Modal
                show={twoFieldErrorModal}
                size="md"
                onClose={() => setTwoFieldErrorModal(false)}
                popup
              >
                <Modal.Header className="modalHeader justify-end">
                  <div
                    className="modalCloseButton"
                    onClick={() => setTwoFieldErrorModal(false)}
                  >
                    <MdClose className="icon text-white font-medium" />
                  </div>
                </Modal.Header>
                <Modal.Body>
                  <div className="modalBody">
                    <h3 className="modalText">Oops!</h3>
                    <h3 className="modalText">Something went wrong!</h3>
                    <div className="flex justify-center gap-4">
                      <button
                        className="modalSuccessBtn"
                        onClick={() => setTwoFieldErrorModal(false)}
                      >
                        Ok
                      </button>
                    </div>
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