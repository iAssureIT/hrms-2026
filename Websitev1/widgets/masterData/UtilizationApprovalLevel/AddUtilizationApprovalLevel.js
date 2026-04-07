"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import validator from "validator";
import { MdClose } from "react-icons/md";
import { Modal, Tooltip } from "flowbite-react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { CiViewList } from "react-icons/ci";
import { FaSpinner } from "react-icons/fa";

const authorityNameList = [
  "center-incharge",
  "senior-manager",
  "head-livelihood",
  "head-csr",
];

const AddApprovalLevel = () => {
  const [approverLevel, setApproverLevel] = useState("");
  const [maxCost, setMaxCost] = useState("");
  const [plainMaxCost, setPlainMaxCost] = useState("");
  const [approverAuthRole, setApproverAuthRole] = useState("");
  const [user_id, setUser_id] = useState("");
  const [approverList, setApproverList] = useState([]);
  const [authourityList, setAuthourityList] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const params = useParams();

  const button = params._id ? "Update" : "Submit";

  const router = useRouter();
  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      const parseUser_id = userDetailsParse.user_id;
      setUser_id(parseUser_id);
    }
  }, []);
  useEffect(() => {
    if (params._id) {
      axios
        .get("/api/utilizationApprovalLevel/get/one/" + params._id)
        .then((program) => {
          setApproverLevel(program.data[0].approverLevel);
          setMaxCost(formatNumberWithCommas(program.data[0].maxCost));
          setPlainMaxCost(program.data[0].maxCost);
          setApproverAuthRole(program.data[0].approverAuthRole);
        })
        .catch((error) => {
          console.log("Error Message => ", error);

          Swal.fire(" ", "Something went wrong! <br/>" + error.message);
        });
    }
  }, [params._id]);

  useEffect(() => {
    getAuthourityData();
  }, []);

  const getAuthourityData = () => {
    axios
      .get("/api/users/get/list/admin")
      .then((response) => {
        const AuthourityList = response.data;

        if (Array.isArray(AuthourityList)) {
          setAuthourityList(AuthourityList);
        } else {
          console.error(
            "Expected data to be an array but got:",
            AuthourityList
          );
          setAuthourityList([]);
        }
      })
      .catch((error) => {
        console.log("Error while getting Utilization Approval List => ", error);
      });
  };

  const validation = () => {
    const errorMsg = {};
    let inputIsValid = true;
    if (validator.isEmpty(approverLevel, [{ ignore_whitespace: true }])) {
      inputIsValid = false;
      errorMsg.approverLevelError = "This field is required.";
    }

    if (validator.isEmpty(plainMaxCost.toString())) {
      inputIsValid = false;
      errorMsg.maxCostError = "This field is required.";
    } else if (!validator.isNumeric(plainMaxCost.toString())) {
      inputIsValid = false;
      errorMsg.maxCostError = "Only numeric data allowed";
    }

    if (validator.isEmpty(approverAuthRole, [{ ignore_whitespace: true }])) {
      inputIsValid = false;
      errorMsg.approverAuthRoleError = "This field is required.";
    }

    setError(errorMsg);
    return inputIsValid;
  };

  const handleSumbit = (e) => {
    e.preventDefault();

    if (validation()) {
      let formValues = {
        approverLevel,
        maxCost: plainMaxCost,
        approverAuthRole,
        user_id,
      };

      if (params._id) {
        formValues.ID = params._id;
        axios
          .put("/api/utilizationApprovalLevel/put/update", formValues)
          .then((updatedProduct) => {
            if (updatedProduct.data) {
              setRunCount((count) => count + 1);
              if (updatedProduct.data.data.modifiedCount > 0) {
                Swal.fire(" ", "Utilization Approval level details updated successfully!!");

                getAuthourityData();
                setLoading2(true);
                router.push(
                  "/admin/master-data/utilization-approval-level/utilization-approval-level-list"
                );
              } else {
                Swal.fire(
                  " ",
                  "Utilization Approval level details was not changed hence no update!!"
                );
              }
            }
          })
          .catch((error) => {
            console.log("API Error => ", error);
            Swal.fire(" ", "Something went wrong! <br/>" + error.message);
          });
      } else {
        axios
          .post("/api/utilizationApprovalLevel/post", formValues)
          .then((response) => {
            setRunCount((count) => count + 1);

            if (response.data.message === "Data already exists") {
              Swal.fire(" ", "Data already exists");
            } else {
              let ID = response.data.insertedLevel._id;

              Swal.fire(" ", "Utilization Approval level details submitted successfully!!");
              // setApprovalSuccessModal(true);
              setLoading2(true);
              router.push(
                "/admin/master-data/utilization-approval-level/utilization-approval-level-list"
              );
              getAuthourityData();
              setApproverLevel("");
              setMaxCost("");
              setApproverAuthRole("");
            }
            if (error.mesage) {
              Swal.fire(" ", "Something went wrong! <br/>" + error.message);
            }
          })
          .catch((error) => {
            Swal.fire(" ", "Something went wrong! <br/>" + error.message);
          });
      }
    }
  };

  const formatNumberWithCommas = (number) => {
    const x = number.toString().split(".");
    const y = x[0];
    let lastThree = y.substring(y.length - 3);
    const otherNumbers = y.substring(0, y.length - 3);
    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }
    const formattedNumber =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return x.length > 1 ? formattedNumber + "." + x[1] : formattedNumber;
  };

  const handleMaxCostChange = (e) => {
    let value = e.target.value.trim().replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      setPlainMaxCost(value); // Update plain numeric value
      setMaxCost(formatNumberWithCommas(value)); // Update displayed value
      setError((prevState) => ({
        ...prevState,
        maxCostError: "",
      }));
    }
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md min-h-screen">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Utilization Approval Level</h1>
            <div className="flex gap-3 my-6 me-10">
              <Tooltip
                content="Approval Level List"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <CiViewList
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      // setLoading(true);
                      window.open(
                        "/admin/master-data/utilization-approval-level/utilization-approval-level-list",
                        '_self'
                        // "noopener,noreferrer"
                      );
                    }}
                  />
                )}
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="px-10 py-6">
          <div className="bg-white text-secondary">
            <div className="rounded-md">
              <div className="mt-5 mb-5 flex lg:flex-row md:flex-row flex-col">
                <div className="flex-1 md:me-4 my-2 lg:my-0">
                  <label
                    htmlFor="approverLevel"
                    // className="block text-sm font-medium leading-6 text-gray-900"
                    className="inputLabel"
                  >
                    Approver Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <IoPersonCircleOutline className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="approverLevel"
                      id="approverLevel"
                      className={
                        error.approverLevelError
                          ? "stdInputField"
                          : "stdInputField"
                        // ? "block rounded-md border-0 py-2 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        // : "block rounded-md border-0 py-2 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      }
                      placeholder="e.g. Level-1"
                      value={approverLevel}
                      onChange={(e) => {
                        setApproverLevel(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          approverLevelError: "",
                        }));
                      }}
                    />
                  </div>
                  <div
                    className="text-red-500 ps-10"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.approverLevelError}
                  </div>
                </div>
                
                <div className="flex-1 md:me-4 my-2 lg:my-0">
                  <label htmlFor="maxCost" className="inputLabel">
                    Approval Limit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <FaIndianRupeeSign className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="maxCost"
                      id="maxCost"
                      className={
                        error.maxCostError ? "stdInputField" : "stdInputField"
                      }
                      placeholder="Max Cost of Approval"
                      value={maxCost}
                      onChange={handleMaxCostChange}
                    />
                  </div>
                  <div
                    className="text-red-500 ps-10"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.maxCostError}
                  </div>
                </div>
                <div className="flex-1 my-2 lg:my-0">
                  <label
                    htmlFor="approverAuthRole"
                    // className="block text-sm font-medium leading-6 text-gray-900"
                    className="inputLabel"
                  >
                    Designation of Authority{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <IoPersonCircleOutline className="icon" />
                      </span>
                    </div>

                    <select
                      name="approverAuthRole"
                      id="approverAuthRole"
                      className={`${
                        error.approverAuthRoleError
                          ? "stdSelectField"
                          : "stdSelectField"
                      } ${
                        approverAuthRole
                          ? "selectOption"
                          : "font-normal text-gray-400"
                      }
                    `}
                      value={approverAuthRole}
                      onChange={(e) => {
                        setApproverAuthRole(e.target.value);

                        setError((prevState) => ({
                          ...prevState,
                          approverAuthRoleError: "",
                        }));
                      }}
                    >
                      <option value="" disabled>
                        -- Select Designation of Authority --
                      </option>
                      {authorityNameList?.map((authority, i) => (
                        <option
                          className="text-black"
                          key={i}
                          value={authority}
                        >
                          {authority}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="text-red-500 ps-10"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.approverAuthRoleError}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <button
                type="submit"
                onClick={handleSumbit}
                className="formButtons"
              >
                {loading2 && params._id ? (
                  <span>
                    Update
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                  </span>
                ) : loading ? (
                  <span>
                    Submit
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                  </span>
                ) : (
                  button
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddApprovalLevel;
