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
    <section className="hr-section">
      <div className="hr-card hr-fade-in border-0 rounded-md !p-0">
        <div className="border-b border-slate-100 py-4 px-8 mb-4 flex items-center justify-between">
            <h1 className="hr-heading">Bank Management</h1>
            <div className="flex gap-3">
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
                    className="cursor-pointer text-[#4285F4] border border-blue-200 p-1 rounded-md text-[32px] hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      window.open(
                        "/admin/master-data/bank-details/bank-details-list",
                        '_self'
                      );
                    }}
                  />
                )}
              </Tooltip>
            </div>
          </div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col">
            <div className="space-y-8 pb-10">
              <form
                onSubmit={handleSubmit}
                className="hr-card !p-8 bg-white border border-gray-200 rounded-lg shadow-md mt-2"
              >
                <SectionHeader 
                  title="Bank & Account Information" 
                  subtitle="Primary identification and branch details for the bank account." 
                />

                <div className="grid lg:grid-cols-2 gap-8 w-full mt-6">
                  {/* Account Holder Name */}
                  <div className="lg:col-span-2">
                    <label className="hr-label">
                      Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <IconWrapper icon={IoPersonCircleOutline} />
                      <input
                        type="text"
                        className="hr-input"
                        placeholder="Name of Account Holder"
                        value={accountHolderName}
                        onChange={(e) => {
                          setAccountHolderName(e.target.value);
                          setError((prevState) => ({ ...prevState, accountHolderNameError: "" }));
                        }}
                      />
                    </div>
                    {error.accountHolderNameError && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{error.accountHolderNameError}</p>
                    )}
                  </div>

                  {/* Bank Name */}
                  <div className="w-full">
                    <label className="hr-label">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <IconWrapper icon={CiBank} />
                      <input
                        type="text"
                        className="hr-input"
                        placeholder="Enter Bank Name"
                        value={bankName}
                        onChange={(e) => {
                          setBankName(e.target.value.trim());
                          setError((prevState) => ({ ...prevState, bankNameError: "" }));
                        }}
                      />
                    </div>
                    {error.bankNameError && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{error.bankNameError}</p>
                    )}
                  </div>

                  {/* Branch */}
                  <div className="w-full">
                    <label className="hr-label">
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <IconWrapper icon={CiBank} />
                      <input
                        type="text"
                        className="hr-input"
                        placeholder="Enter Branch Name"
                        value={branchName}
                        onChange={(e) => {
                          setBranchName(e.target.value.trim());
                          setError((prevState) => ({ ...prevState, branchNameError: "" }));
                        }}
                      />
                    </div>
                    {error.branchNameError && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{error.branchNameError}</p>
                    )}
                  </div>

                  {/* IFSC Code */}
                  <div className="w-full">
                    <label className="hr-label">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <IconWrapper icon={CiBank} />
                      <input
                        type="text"
                        className="hr-input"
                        maxLength={11}
                        placeholder="e.g. PQRS0473456"
                        value={ifscCode}
                        onChange={(e) => {
                          setIfscCode(e.target.value.trim());
                          setError((prevState) => ({ ...prevState, ifscCodeError: "" }));
                        }}
                      />
                    </div>
                    {error.ifscCodeError && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{error.ifscCodeError}</p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div className="w-full">
                    <label className="hr-label">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <IconWrapper icon={CiBank} />
                      <input
                        type="text"
                        className="hr-input"
                        minLength={8}
                        maxLength={18}
                        placeholder="Enter Account Number"
                        value={bankAccountNumber}
                        onChange={(e) => {
                          setBankAccountNumber(e.target.value.trim());
                          setError((prevState) => ({ ...prevState, bankAccountNumberError: "" }));
                        }}
                      />
                    </div>
                    {error.bankAccountNumberError && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{error.bankAccountNumberError}</p>
                    )}
                  </div>

                  {/* Project Remark */}
                  <div className="lg:col-span-2">
                    <label className="hr-label">Project Remark</label>
                    <div className="relative group">
                      <IconWrapper icon={IoPersonCircleOutline} />
                      <input
                        type="text"
                        className="hr-input"
                        placeholder="Enter Project Remark"
                        value={projectRemark}
                        onChange={(e) => setProjectRemark(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <button
                    type="submit"
                    className="hr-btn-primary min-w-[140px]"
                  >
                    {loading2 ? (
                      <span className="flex items-center gap-2 text-white">
                        Processing <FaSpinner className="animate-spin" />
                      </span>
                    ) : (
                      params._id ? "Update Changes" : "Save Record"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BankDetails;
