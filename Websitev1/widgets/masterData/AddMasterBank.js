"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Modal, Tooltip } from "flowbite-react";
import { MdClose } from "react-icons/md";
import { useParams } from "next/navigation";
import validator from "validator";

import { useRouter } from "next/navigation";

import "animate.css";

import { IoPersonCircleOutline } from "react-icons/io5";
import { CiBank, CiViewList } from "react-icons/ci";
import { FaSpinner } from "react-icons/fa";

const BankDetails = () => {
  const [accountHolderName, setAccountHolderName] = useState("");

  const [bankName, setBankName] = useState("");

  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [user_id, setUser_id] = useState("");

  const [branchName, setBranchName] = useState("");

  const [ifscCode, setIfscCode] = useState("");
  const [projectRemark, setProjectRemark] = useState("");

  const [runCount, setRunCount] = useState(0);

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const router = useRouter();
  const params = useParams();

  const button = params._id ? "Update" : "Submit";

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
        .get("/api/bank-details/get/one/" + params._id)
        .then((program) => {
          setAccountHolderName(program.data[0].accountHolderName);

          setBankName(program.data[0].bankName);

          setBranchName(program.data[0].branchName);
          setIfscCode(program.data[0].ifscCode);

          setBankAccountNumber(program.data[0].bankAccountNumber);
          setProjectRemark(program.data[0].projectRemark);
        })
        .catch((error) => {
          console.log("Error Message => ", error);
          Swal.fire(" ", "Something went wrong! <br/>" + error.message);
        });
    }
  }, [params._id]);

  // validation for form values
  const validation = () => {
    const errorMsg = {};
    let inputIsValid = true;
    if (validator.isEmpty(accountHolderName)) {
      inputIsValid = false;
      errorMsg.accountHolderNameError = "This Field is required.";
      setError(errorMsg);
    } else if (!validator.isAlpha(accountHolderName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.accountHolderNameError = "Only Characters allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(bankName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.bankNameError = "This Field is required.";
      setError(errorMsg);
    } else if (!validator.isAlpha(bankName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.bankNameError = "Only Characters allowed";
      setError(errorMsg);
    }

    if (validator.isEmpty(branchName)) {
      inputIsValid = false;
      errorMsg.branchNameError = "This Field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(ifscCode)) {
      inputIsValid = false;
      errorMsg.ifscCodeError = "This Field is required.";
      setError(errorMsg);
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      inputIsValid = false;
      errorMsg.ifscCodeError = "Invalid IFSC Code";
      setError(errorMsg);
    }

    if (validator.isEmpty(bankAccountNumber.toString())) {
      inputIsValid = false;
      errorMsg.bankAccountNumberError = "This Field is required.";
      setError(errorMsg);
    } else if (!validator.isNumeric(bankAccountNumber.toString())) {
      inputIsValid = false;
      errorMsg.bankAccountNumberError = "Only Numeric values allowed";
      setError(errorMsg);
    }
    console.log("errorMsg", errorMsg);
    return inputIsValid;
  };

  // function for handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validation()) {
      let formValues = {
        accountHolderName: accountHolderName,

        bankName: bankName,

        bankAccountNumber: bankAccountNumber,

        branchName: branchName,
        ifscCode: ifscCode,
        projectRemark: projectRemark,
        user_id,
      };

      if (params._id) {
        //==== This is Update case ====

        formValues.ID = params._id;
        axios
          .patch("/api/bank-details/patch/update", formValues)
          .then((updatedProduct) => {
            setRunCount((count) => count + 1);

            if (updatedProduct.data) {
              if (updatedProduct.data.data.modifiedCount > 0) {
                Swal.fire(" ", "Bank details updated successfully!!");
                setLoading2(true);
                router.push(
                  "/admin/master-data/bank-details/bank-details-list"
                );
              } else {
                Swal.fire(
                  " ",
                  "Bank details was not changed hence no update!!"
                );
              }
            }
          })
          .catch((error) => {
            console.log("API Error => ", error);
            Swal.fire(" ", "Something went wrong! <br/>" + error.message);
          });
      } else {
        // api for posting the data
        axios
          .post("api/bank-details/post", formValues)
          .then((response) => {
            setRunCount((count) => count + 1);

            if (response.data.message === "Bank and branch already exists") {
              // Show Swal popup
              Swal.fire(" ", "Bank and branch already exists");
            } else {
              setAccountHolderName("");
              setBankName("");
              setBranchName("");
              setIfscCode("");
              setBankAccountNumber("");
              setProjectRemark("");
              Swal.fire(" ", "Bank details submitted successfully!!");
              setLoading2(true);
              // router.push("/admin/master-data/bank-details/bank-details-list");
              window.open("/admin/master-data/bank-details/bank-details-list", '_blank', 'noopener,noreferrer');
            }
          })
          .catch((error) => {
            Swal.fire(" ", "Something went wrong! <br/>" + error.message);
          });
      }
    }
  };

  return (
    <section className="section ">
      <div className="box border-2 rounded-md shadow-md min-h-screen">
        <div className="uppercase  text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Bank Details</h1>
            <div className="flex gap-3 my-6 me-10">
              <Tooltip
                content="Bank Details List"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <CiViewList
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    // onClick={() => {
                    //   setLoading(true);
                    //   router.push(
                    //     "/admin/master-data/bank-details/bank-details-list"
                    //   );
                    // }}
                    onClick={() => {
                      window.open(
                        "/admin/master-data/bank-details/bank-details-list",
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
            <div>
              <div className="me-2 rounded-md w-full">
                <div className="flex-1 my-2 lg:my-0">
                  <label
                    htmlFor="productId"
                    // className="block text-sm font-medium leading-6 text-gray-900"
                    className="inputLabel"
                  >
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <IoPersonCircleOutline className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="productId"
                      id="productId"
                      value={accountHolderName}
                      className={
                        error.accountHolderNameError
                          ? "stdInputField"
                          : "stdInputField"
                        // ? "block rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        // : "block rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      }
                      placeholder="Name of Account Holder"
                      onChange={(e) => {
                        setAccountHolderName(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          accountHolderNameError: "",
                        }));
                      }}
                    />
                  </div>
                  <div
                    className="text-red-500 "
                    style={{
                      fontSize: "12px",
                      fontWeight: "normal",
                    }}
                  >
                    {error.accountHolderNameError}
                  </div>
                </div>
                <div className="flex lg:flex-row md:flex-col flex-col mt-2 lg:mt-4">
                  <div className="flex-1 me-2 my-2 lg:my-0">
                    <label
                      htmlFor="productId"
                      // className="block text-sm font-medium leading-6 text-gray-900"
                      className="inputLabel"
                    >
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          {/* <HiBuildingOffice2 size={20} /> */}
                          <CiBank className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="productId"
                        id="productId"
                        value={bankName}
                        className={
                          error.bankNameError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Bank Name"
                        onChange={(e) => {
                          setBankName(e.target.value.trim());
                          setError((prevState) => ({
                            ...prevState,
                            bankNameError: "",
                          }));
                        }}
                        // value={bankName_id ? `${bankName_id}|${bankName}` : ""}
                        // value={centerName}
                        // onChange={(e) => {
                        //   const [bankName_id, bankName] =
                        //     e.target.value.split("|");
                        //   setBankName(bankName);
                        //   setBankName_id(bankName_id);
                        //   setError((prevState) => ({
                        //     ...prevState,
                        //     bankNameError: "",
                        //   }));
                        // }}
                      />
                    </div>
                    <div
                      className="text-red-500 "
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.bankNameError}
                    </div>
                  </div>
                  <div className="flex-1 me-2 my-2 lg:my-0">
                    <label
                      htmlFor="productId"
                      // className="block text-sm font-medium leading-6 text-gray-900"
                      className="inputLabel"
                    >
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          {/* <HiBuildingOffice2 size={20} /> */}
                          <CiBank className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="productId"
                        value={branchName}
                        id="productId"
                        className={
                          error.branchNameError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Branch Name"
                        onChange={(e) => {
                          setBranchName(e.target.value.trim());
                          setError((prevState) => ({
                            ...prevState,
                            branchNameError: "",
                          }));
                        }}
                        // value={
                        //   branchName_id ? `${branchName_id}|${branchName}` : ""
                        // }
                        // value={centerName}
                        // onChange={(e) => {
                        //   const [branchName_id, branchName] =
                        //     e.target.value.split("|");
                        //   setBranchName(branchName);
                        //   setBranchName_id(branchName_id);
                        //   setError((prevState) => ({
                        //     ...prevState,
                        //     branchNameError: "",
                        //   }));
                        // }}
                      />
                    </div>
                    <div
                      className="text-red-500 "
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.branchNameError}
                    </div>
                  </div>
                  <div className="flex-1 me-2 my-2 lg:my-0">
                    <label htmlFor="productId" className="inputLabel">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <CiBank className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="productId"
                        id="productId"
                        maxLength={11}
                        value={ifscCode}
                        className={
                          error.ifscCodeError
                            ? "stdInputField"
                            : "stdInputField"
                        }
                        placeholder="e.g.PQRS0473456"
                        onChange={(e) => {
                          setIfscCode(e.target.value.trim());
                          setError((prevState) => ({
                            ...prevState,
                            ifscCodeError: "",
                          }));
                        }}
                      />
                    </div>
                    <div
                      className="text-red-500 "
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error?.ifscCodeError}
                    </div>
                  </div>
                  <div className="flex-1 my-2 lg:my-0">
                    <label
                      htmlFor="productId"
                      // className="block text-sm font-medium leading-6 text-gray-900"
                      className="inputLabel"
                    >
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          {/* <HiBuildingOffice2 size={20} /> */}
                          <CiBank className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="productId"
                        id="productId"
                        minLength={8}
                        maxLength={18}
                        value={bankAccountNumber}
                        className={
                          error.bankAccountNumberError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Account Number"
                        onChange={(e) => {
                          setBankAccountNumber(e.target.value.trim());
                          setError((prevState) => ({
                            ...prevState,
                            bankAccountNumberError: "",
                          }));
                        }}
                        // value={
                        //   bankAccountNumber_id
                        //     ? `${bankAccountNumber_id}|${bankAccountNumber}`
                        //     : ""
                        // }
                        // value={centerName}
                        // onChange={(e) => {
                        //   const [bankAccountNumber_id, bankAccountNumber] =
                        //     e.target.value.split("|");
                        //   setBankAccountNumber(bankAccountNumber);
                        //   setBankAccountNumber_id(bankAccountNumber_id);
                        //   setError((prevState) => ({
                        //     ...prevState,
                        //     bankAccountNumberError: "",
                        //   }));
                        // }}
                      />
                    </div>
                    <div
                      className="text-red-500 "
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.bankAccountNumberError}
                    </div>
                  </div>
                </div>
                <div className="flex-1 my-2 lg:my-4">
                  <label
                    htmlFor="productId"
                    // className="block text-sm font-medium leading-6 text-gray-900"
                    className="inputLabel"
                  >
                    Project Remark
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <IoPersonCircleOutline className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="productId"
                      id="productId"
                      value={projectRemark}
                      className="stdInputField"
                      placeholder="Project Remark"
                      onChange={(e) => {
                        setProjectRemark(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              <div className="flex justify-end mb-6 mt-6">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="formButtons"
                  // className="text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-6 lg:py-2 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-blue-800 dark:text-white"
                  style={{ transition: "background-color 0.3s" }} // Adding transition for smoother theme change
                >
                  {loading2 && params._id ? (
                    <span>
                      Update
                      <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                    </span>
                  ) : loading2 ? (
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

            <div className=" border-b-1 border-gray-300 "></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BankDetails;
