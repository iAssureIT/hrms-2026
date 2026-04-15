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

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-5 border-b border-gray-100 pb-2">
    <h3 className="hr-subheading">{title}</h3>
    <p className="hr-section-subtitle text-xs text-gray-400 mt-1">{subtitle}</p>
  </div>
);

const IconWrapper = ({ icon: Icon }) => (
  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
      <Icon className="icon" />
    </span>
  </div>
);

const AddUtilizationApprovalLevel = () => {
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
              Swal.fire(" ", "Utilization Approval level details submitted successfully!!");
              setLoading2(true);
              router.push(
                "/admin/master-data/utilization-approval-level/utilization-approval-level-list"
              );
              getAuthourityData();
              setApproverLevel("");
              setMaxCost("");
              setPlainMaxCost("");
              setApproverAuthRole("");
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
    <section className="hr-section">
      <div className="hr-card hr-fade-in border-0 rounded-md !p-0">
        <div className="border-b border-slate-100 py-4 px-8 mb-4 flex items-center justify-between">
          <h1 className="hr-heading">Utilization Approval Level</h1>
          <div className="flex gap-3 me-10">
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
                  className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]"
                  onClick={() => {
                    router.push("/admin/master-data/utilization-approval-level/utilization-approval-level-list");
                  }}
                />
              )}
            </Tooltip>
          </div>
        </div>

        <div className="px-8 pb-8">
          <form className="space-y-10 mt-6 overflow-visible">
            <div className="hr-card !p-8 bg-white border border-gray-200 rounded-lg shadow-md mt-2">
              <SectionHeader 
                title="Level Configuration" 
                subtitle="Define threshold and authority roles for utilization approval workflow." 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {/* Approver Level */}
                <div>
                  <label className="hr-label">
                    Approver Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <IconWrapper icon={IoPersonCircleOutline} />
                    <input
                      type="text"
                      className="hr-input"
                      placeholder="e.g. Level-1"
                      value={approverLevel}
                      onChange={(e) => {
                        setApproverLevel(e.target.value);
                        setError((prev) => ({ ...prev, approverLevelError: "" }));
                      }}
                    />
                  </div>
                  {error.approverLevelError && (
                    <p className="text-red-500 text-xs mt-1">{error.approverLevelError}</p>
                  )}
                </div>

                {/* Approval Limit */}
                <div>
                  <label className="hr-label">
                    Approval Limit (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <IconWrapper icon={FaIndianRupeeSign} />
                    <input
                      type="text"
                      className="hr-input"
                      placeholder="Max Cost of Approval"
                      value={maxCost}
                      onChange={handleMaxCostChange}
                    />
                  </div>
                  {error.maxCostError && (
                    <p className="text-red-500 text-xs mt-1">{error.maxCostError}</p>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label className="hr-label">
                    Designation of Authority <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <IconWrapper icon={IoPersonCircleOutline} />
                    <select
                      className="hr-select"
                      value={approverAuthRole}
                      onChange={(e) => {
                        setApproverAuthRole(e.target.value);
                        setError((prev) => ({ ...prev, approverAuthRoleError: "" }));
                      }}
                    >
                      <option value="" disabled>-- Select Designation --</option>
                      {authorityNameList?.map((authority, i) => (
                        <option key={i} value={authority}>{authority}</option>
                      ))}
                    </select>
                  </div>
                  {error.approverAuthRoleError && (
                    <p className="text-red-500 text-xs mt-1">{error.approverAuthRoleError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="hr-btn-primary min-w-[200px]"
                onClick={handleSumbit}
                disabled={loading || loading2}
              >
                {loading || loading2 ? (
                  <span className="flex items-center justify-center">
                    Processing
                    <FaSpinner className="animate-spin ml-2" />
                  </span>
                ) : (
                  button
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddUtilizationApprovalLevel;
