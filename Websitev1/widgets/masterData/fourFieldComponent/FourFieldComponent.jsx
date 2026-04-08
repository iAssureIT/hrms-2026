"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdClose, MdDelete, MdOutlineEdit } from "react-icons/md";
import { FaEdit, FaFileUpload, FaUpload } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdWidgets } from "react-icons/md";
import validator from "validator";
import { Modal } from "flowbite-react";
import OneFieldComponent from "@/widgets/masterData/oneFieldComponent/OneFieldComponent.jsx";
import { IoMdClose } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import GenericTable from "@/widgets/GenericTable/FilterTable";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FaWpforms, FaSpinner } from "react-icons/fa";
import { Tooltip } from "flowbite-react";

const FourFieldComponent = ({
  field1,
  field2,
  field3,
  field4,
  tableHeading,
  tableObjects,
}) => {
  // -----------for table start-------------------
  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);

  // -----------for table end-------------------
  const params = useParams();
  const router = useRouter();

  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [openModal3, setOpenModal3] = useState(false);

  const [field1Data, setField1Data] = useState([]);
  const [field2Data, setField2Data] = useState([]);
  const [field3Data, setField3Data] = useState([]);

  const [field1Value, setField1Value] = useState("");
  const [field2Value, setField2Value] = useState("");
  const [field3Value, setField3Value] = useState("");

  const [updateField1Value, setUpdateField1Value] = useState({
    ddvalue: "",
    ddid: "",
  });
  const [updateField2Value, setUpdateField2Value] = useState({
    ddvalue: "",
    ddid: "",
  });
  const [updateField3Value, setUpdateField3Value] = useState({
    ddvalue: "",
    ddid: "",
  });

  const [inputValue, setInputValue] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState("");
  const [checkReload, setCheckReload] = useState(0);
  const [items, setItems] = useState([]);

  const [error, setError] = useState("");
  const [errorMessage1, setErrorMessage1] = useState("");
  const [errorMessage2, setErrorMessage2] = useState("");
  const [errorMessage3, setErrorMessage3] = useState("");
  const [errorMessage4, setErrorMessage4] = useState("");

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
    getList1();
    getList2();
    getList3();
    getData();
  }, [field1, field2, field3, field4, checkReload]);

  const getList1 = async () => {
    // console.log("field1.fieldLabel => ", field1.fieldLabel);

    try {
      if (field1.fieldLabel) {
        const response = await axios.get(field1.getListAPI);
        // console.log("setField1Data response.data => ", response.data);
        setField1Data(
          response.data.sort((a, b) => {
            return a.fieldValue.localeCompare(b.fieldValue);
          })
        );
      } else {
        setField1Data([]);
      }
    } catch (err) {
      setError("Error fetching items");
    }
  };

  const getList2 = async () => {
    try {
      if (field2.fieldLabel) {
        const response = await axios.get(field2.getListAPI);
        // console.log(response.data);
        setField2Data(
          response.data.sort((a, b) => {
            return a.fieldValue.localeCompare(b.fieldValue);
          })
        );

        // setRoleList(roleList);
      } else {
        setField2Data([]);
      }
    } catch (err) {
      setError("Error fetching items");
    }
  };

  const getList3 = async () => {
    try {
      if (field3.fieldLabel) {
        const response = await axios.get(field3.getListAPI);
        setField3Data(
          response.data.sort((a, b) => {
            return a.fieldValue.localeCompare(b.fieldValue);
          })
        );
      } else {
        setField3Data([]);
      }
    } catch (err) {
      setError("Error fetching items");
    }
  };
  useEffect(() => {
    if (params._id) {
      axios
        .get(field4.editAPI + params._id)
        .then((response) => {
          // console.log(
          //   "response.data.inputValue=================",
          //   response.data.inputValue
          // );
          setField1Value(
            response.data.field1Value + "|" + response.data.field1_id
          );
          setField2Value(
            response.data.field2Value + "|" + response.data.field2_id
          );
          setField3Value(
            response.data.field3Value + "|" + response.data.field3_id
          );
          setInputValue(response.data.inputValue);
        })
        .catch((error) => {
          console.log("Error Message => ", error);
          // Swal.fire("Oops", "Something Went Wrong", "error");
        });
    }
  }, [params._id]);

  const getData = async () => {
    var formValues = {
      searchText: searchText,
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
    };
    setFilterData(formValues);
    try {
      const response = await axios.post(field4.getListAPI, formValues);
      if (response.data.success) {
        setTotalRecs(response.data.totalRecs);
        setTableData(response.data.tableData);
      } else {
        Swal.fire(" ", response.data.errorMsg);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [pageNumber, recsPerPage, runCount, searchText, checkReload]);
  const validation = () => {
    const errorMsg = {};
    let inputIsValid = true;

    // if (!field1Value) {
    //   setErrorMessage1("This field is required ");
    //   return;
    // }

    if (validator.isEmpty(field1Value)) {
      inputIsValid = false;
      setErrorMessage1("This field is required ");
    }

    // if (!field2Value) {
    //   setErrorMessage2("This field is required ");
    //   return;
    // }

    if (validator.isEmpty(field2Value)) {
      inputIsValid = false;
      setErrorMessage2("This field is required ");
    }

    // if (!field3Value) {
    //   setErrorMessage3("This field is required ");
    //   return;
    // }

    if (validator.isEmpty(field3Value)) {
      inputIsValid = false;
      setErrorMessage3("This field is required ");
    }

    // if (inputValue.trim() === "") {
    //   setErrorMessage4("This field is required ");
    //   return;
    // }
    if (validator.isEmpty(inputValue)) {
      inputIsValid = false;
      setErrorMessage4("This field is required ");
    } else if (validator.isNumeric(inputValue.replace(/\s/g, ""))) {
      inputIsValid = false;
      setErrorMessage4("Only Characters allowed");
    }

    // if (validator.isEmpty(inputValue)) {
    //   inputIsValid = false;
    //   setErrorMessage4("This field is required ");
    // } else if (!validator.isAlpha(inputValue.replace(/\s/g, ""))) {
    //   inputIsValid = false;
    //   setErrorMessage4("Only Alpha numeric values allowed");
    // }

    return inputIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!field1Value) {
    //   setErrorMessage1("This field is required ");
    //   return;
    // }
    // if (!field2Value) {
    //   setErrorMessage2("This field is required ");
    //   return;
    // }
    // if (!field3Value) {
    //   setErrorMessage3("This field is required ");
    //   return;
    // }
    // if (inputValue.trim() === "") {
    //   setErrorMessage4("This field is required ");
    //   return;
    // }
    if (validation()) {
      var field1_id = field1Value.split("|")[1];
      var field1value = field1Value.split("|")[0];

      var field2_id = field2Value.split("|")[1];
      var field2value = field2Value.split("|")[0];

      var field3_id = field3Value.split("|")[1];
      var field3value = field3Value.split("|")[0];

      const item = {
        field1Value: field1value,
        field1_id,
        field2Value: field2value,
        field2_id,
        field3Value: field3value,
        field3_id,
        inputValue,
        field1Label: field1.fieldLabel.toLowerCase(),
        field2Label: field2.fieldLabel.toLowerCase(),
        field3Label: field3.fieldLabel.toLowerCase(),
        inputLabel: field4.fieldLabel.toLowerCase(),
        user_id,
      };

      try {
        if (params._id) {
          axios
            .put(field4.updateAPI + "/" + params._id, item)
            .then((response) => {
              // console.log(response.data);
              if (response.data.data.modifiedCount > 0) {
                Swal.fire(" ", "Data updated successfully");
                router.push(
                  "/admin/master-data/program-project-activity-subactivity"
                );
                setField1Value("");
                setField2Value("");
                setField3Value("");
                setInputValue("");

                // getData();
              } else {
                Swal.fire(" ", "Data has not been updated");
              }
            });
        } else {
          axios.post(field4.insertAPI, item)
            .then((response) => {
              setField1Value("");
              setField2Value("");
              setField3Value("");
              setInputValue("");
              // console.log("response --> ", response);
              if (response.data.success) {
                Swal.fire(" ", "Data submitted successfully");
              } else {
                Swal.fire(" ", response.data.message);
              }
              
              setRunCount((count) => count + 1);
              setCheckReload((count) => count + 1);
              getData();
            })
            .catch((err) => {
              const errorMessage = err?.response?.data?.message || "Something went wrong!";
              Swal.fire(" ", errorMessage);
            });
        }
      } catch (err) {
        Swal.fire(" ", "An unexpected error occurred.");
      }
    }
  };

  const handleEdit = (item) => {
    // console.log("item ==>", item);
    setEditingItem(item);
    setDropdownValue(item.dropdownvalue + "|" + item.dropdown_id);
    setInputValue(item.inputValue);
  };

  const handleDelete = (id) => {
    var id = id ? id : deleteItemId;
    // console.log("`${field1.deleteAPI}/${id}`",`${field1.deleteAPI}/${id}`)
    axios
      .delete(`${field2.deleteAPI}/${id}`)
      .then((responce) => {
        setCheckReload((count) => count + 1);
        getData();
      })
      .catch((err) => {
        // Swal.fire("Somthing went wrong", "", "error");
        console.log(err);
      });
    axios
      .delete(`${field1.deleteAPI}/${id}`)
      .then((responce) => {
        setRunCount((count) => count + 1);
      })
      .catch((err) => {
        Swal.fire(" ", "Somthing went wrong" + err);
        console.log(err);
        // setfield1ErrorModal(true)
      });
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">
              Program-Project-Activity & Subactivity Details
            </h1>
            <div className="flex gap-3 my-5 me-10">
              <Tooltip
                content="Bulk Upload"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading2 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <FaFileUpload
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      window.open(
                        "/admin/master-data/program-project-activity-subactivity/bulk-upload",
                        '_self'
                        // "noopener,noreferrer"
                      );
                      // setLoading2(true);
                    }}
                  />
                )}
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="h-fit px-0 lg:px-5 py-5 pb-10">
          <div className=" rounded-sm  w-full h-fit pb-4">
            <div className="w-11/12 mx-auto   p-5 sm:px-1 sm:p-1 pb-10 mb-5 rounded-md">
              <form
                onSubmit={handleSubmit}
                className="bg-red lg:p-10 w-full lg:w-11/12 sm:px-2 pb-4  lg:mx-11 mx-0 "
              >
                <div className="mb-0 lg:mb-10 lg:flex xl:flex sm:block gap-5 sm:w-full">
                  <div className="xl:w-1/2 lg:w-1/2 sm:w-full my-2 lg:my-0">
                    <label for="programs" className="inputLabel flex mb-0">
                      {field1.fieldLabel}
                      <span className="text-red-500 ms-1">*</span>
                      <IoMdAdd
                        className="bg-green hover:bg-Green ms-1 text-white cursor-pointer "
                        size={"1.2rem"}
                        onClick={() => setOpenModal1(true)}
                      />
                    </label>
                    <div className="mt-2 lg:mt-0">
                      <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                            <MdWidgets className="icon" />
                          </span>
                        </div>
                        <select
                          value={field1Value}
                          onChange={(e) => {
                            setField1Value(e.target.value);
                            if (errorMessage1) {
                              setErrorMessage1("");
                            }
                          }}
                          name="programs"
                          className={`stdSelectField ${field1Value
                            ? "selectOption"
                            : "text-gray-400 font-normal"
                            }`}
                        // className="rounded-none outline-none rounded-e-lg bg-gray-50 border text-gray-900  block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  "
                        >
                          <option value="" disabled className="text-grayThree">
                            -- Select Program --
                          </option>
                          {field1Data.map((option) => (
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
                    {errorMessage1 && (
                      <p
                        style={{ color: "red", fontSize: "12px" }}
                        className="font-normal "
                      >
                        {errorMessage1}
                      </p>
                    )}
                  </div>

                  <div className="xl:w-1/2 lg:w-1/2 sm:w-full mt-4 lg:mt-0 lg:my-0">
                    <label for="projects" className="inputLabel flex mb-0">
                      {field2.fieldLabel}
                      <span className="text-red-500 ms-1">*</span>
                      <IoMdAdd
                        className="bg-green hover:bg-Green ms-1 text-white cursor-pointer "
                        size={"1.2rem"}
                        onClick={() => setOpenModal2(true)}
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
                          value={field2Value}
                          onChange={(e) => {
                            setField2Value(e.target.value);
                            if (errorMessage2) {
                              setErrorMessage2("");
                            }
                          }}
                          className={`stdSelectField ${field2Value
                            ? "selectOption"
                            : "text-gray-400 font-normal"
                            }`}
                        >
                          <option value="" disabled className="text-grayThree">
                            -- Select Project --
                          </option>
                          {field2Data.map((option) => (
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
                    {errorMessage2 && (
                      <p
                        style={{ color: "red", fontSize: "12px" }}
                        className="font-normal "
                      >
                        {errorMessage2}
                      </p>
                    )}
                  </div>
                </div>

                <div className="lg:flex xl:flex sm:block gap-5 mt-4 lg:mt-0 sm:w-full">
                  <div className="xl:w-1/2 lg:w-1/2 sm:w-full">
                    <label for="activity" className="inputLabel flex mb-0">
                      {field3.fieldLabel}
                      <span className="text-red-500 ms-1">*</span>
                      <IoMdAdd
                        className="bg-green hover:bg-Green ms-1 text-white cursor-pointer "
                        size={"1.2rem"}
                        onClick={() => setOpenModal3(true)}
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
                          value={field3Value}
                          onChange={(e) => {
                            setField3Value(e.target.value);
                            if (errorMessage3) {
                              setErrorMessage3("");
                            }
                          }}
                          name="activity"
                          className={`stdSelectField ${field3Value
                            ? "selectOption"
                            : "text-gray-400 font-normal"
                            }`}
                        // className="rounded-none outline-none rounded-e-lg bg-gray-50 border text-gray-900  block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  "
                        >
                          <option value="" disabled className="text-grayThree">
                            -- Select Activity --
                          </option>
                          {field3Data.map((option) => (
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
                    {errorMessage3 && (
                      <p
                        style={{ color: "red", fontSize: "12px" }}
                        className="font-normal "
                      >
                        {errorMessage3}
                      </p>
                    )}
                  </div>

                  <div className="xl:w-1/2 lg:w-1/2 sm:w-full mt-4 lg:mt-0 lg:my-0">
                    <label htmlFor="subactivity" className="inputLabel mt-2">
                      {field4.fieldLabel}
                      <span className="text-red-500 ms-1">*</span>
                    </label>
                    <div className="flex">
                      <div className="relative mt-1 border border-gray-300 rounded-md shadow-sm w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                            <MdWidgets className="icon" />
                          </span>
                        </div>
                        <input
                          type="text"
                          id="minStock"
                          // className="stdInputField"
                          className={`stdInputField ${inputValue
                            ? "selectOption"
                            : "text-gray-400 font-normal"
                            }`}
                          placeholder="Enter Subactivity"
                          // className="text-gray-900 rounded-e-md focus:shadow-md block flex-1 min-w-0 w-full text-sm border-gray-300 p-2 outline-none"
                          value={inputValue}
                          name="subactivity"
                          onChange={(e) => {
                            setInputValue(e.target.value.trim());
                            if (errorMessage4) {
                              setErrorMessage4(""); // Clear error message when user starts typing
                            }
                          }}
                        />
                      </div>
                    </div>
                    {errorMessage4 && (
                      <p
                        style={{ color: "red", fontSize: "12px" }}
                        className="font-normal "
                      >
                        {errorMessage4}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-6 lg:mt-10 -me-3 w-full">
                  <button type="submit" className="formButtons">
                    {params._id ? "Update" : "Submit"}
                  </button>
                </div>
              </form>

              <GenericTable
                tableObjects={tableObjects ? tableObjects : {}}
                tableHeading={tableHeading}
                setRunCount={setRunCount}
                runCount={runCount}
                recsPerPage={recsPerPage}
                setRecsPerPage={setRecsPerPage}
                filterData={filterData}
                getData={getData}
                tableData={tableData}
                setTableData={setTableData}
                numOfPages={numOfPages}
                setNumOfPages={setNumOfPages}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                searchText={searchText}
                setSearchText={setSearchText}
                totalRecs={totalRecs}
                setTotalRecs={setTotalRecs}
                search={search}
                setSearch={setSearch}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        show={openModal1}
        size="5xl"
        onClose={() => setOpenModal1(false)}
        className="lg:px-44 px-1 bg-[#1111114f] pt-10 dark:bg-white"
      >
        <Modal.Body>
          <div className="mx-auto">
            <div className="flex justify-end relative mb-4">
              <button
                className="bg-red-400 hover:bg-red-800 text-white font-bold py-1 px-1 border-red-700 rounded-sm"
                onClick={() => setOpenModal1(false)}
              >
                <IoMdClose
                  className=""
                // size={"1.5rem"}
                />
              </button>
            </div>
            <OneFieldComponent
              openModal={openModal1}
              setOpenModal={setOpenModal1}
              fieldLabel={field1.fieldLabel}
              updateDropdownValue={updateField1Value}
              setUpdateDropdownValue={setUpdateField1Value}
              checkReload={checkReload}
              setCheckReload={setCheckReload}
              className="-pt-20"
              goodRecordsHeading={field1.goodRecordsHeading}
              failedtableHeading={field1.failedtableHeading}
              fileDetailUrl={field1.fileDetailUrl}
              fileurl={field1.fileurl}
            />
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={openModal2}
        size="5xl"
        onClose={() => setOpenModal2(false)}
        className="lg:px-44 px-1 bg-[#1111114f] pt-10"
      >
        <Modal.Body>
          <div className="mx-auto">
            <div className="flex justify-end relative mb-4">
              <button
                className="bg-red-400 hover:bg-red-800 text-white font-bold py-1 px-1 border-red-700 rounded-sm"
                onClick={() => setOpenModal2(false)}
              >
                <IoMdClose
                // className=" text-white bg-red-500 font-bold rounded-full  hover:bg-red-600 hover:text-white"
                // size={"1.5rem"}
                />
              </button>
            </div>
            <OneFieldComponent
              openModal={openModal2}
              setOpenModal={setOpenModal2}
              fieldLabel={field2.fieldLabel}
              updateDropdownValue={updateField2Value}
              setUpdateDropdownValue={setUpdateField2Value}
              checkReload={checkReload}
              setCheckReload={setCheckReload}
              className="-pt-20"
              goodRecordsHeading={field2.goodRecordsHeading}
              failedtableHeading={field2.failedtableHeading}
              fileDetailUrl={field2.fileDetailUrl}
              fileurl={field2.fileurl}
            />
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={openModal3}
        size="5xl"
        onClose={() => setOpenModal3(false)}
        className="lg:px-44 px-1 bg-[#1111114f] pt-10"
      >
        <Modal.Body>
          <div className="mx-auto">
            <div className="flex justify-end relative mb-4">
              <button
                className="bg-red-400 hover:bg-red-800 text-white font-bold py-1 px-1 border-red-700 rounded-sm"
                onClick={() => setOpenModal3(false)}
              >
                <IoMdClose
                // className=" text-white bg-red-500 font-bold rounded-full  hover:bg-red-600 hover:text-white"
                // size={"1.5rem"}
                />
              </button>
            </div>
            <OneFieldComponent
              openModal={openModal3}
              setOpenModal={setOpenModal3}
              fieldLabel={field3.fieldLabel}
              updateDropdownValue={updateField3Value}
              setUpdateDropdownValue={setUpdateField3Value}
              checkReload={checkReload}
              setCheckReload={setCheckReload}
              className="-pt-20"
              goodRecordsHeading={field3.goodRecordsHeading}
              failedtableHeading={field3.failedtableHeading}
              fileDetailUrl={field3.fileDetailUrl}
              fileurl={field3.fileurl}
              loading={loading}
            />
          </div>
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default FourFieldComponent;
