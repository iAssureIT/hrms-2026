"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Modal, Tooltip } from "flowbite-react";
import { MdClose } from "react-icons/md";
import validator from "validator";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";
import "animate.css";

import { IoLocationOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineEmail } from "react-icons/md";
import { IoPersonCircleOutline } from "react-icons/io5";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { FaMobileAlt } from "react-icons/fa";
import { Md123 } from "react-icons/md";
import GenericTable from "@/widgets/GenericTable/FilterTable";
import { CiViewList } from "react-icons/ci";
import { FaSpinner } from "react-icons/fa";

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

const CenterManagement = (props) => {
  const [centerName, setCenterName] = useState("");
  const [assetManagementCenterCode, setAssetManagementCenterCode] =
    useState("");
  const [addressLine, setAddressLine] = useState("");

  const [loggedInRole, setLoggedInRole] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [onRoll, setOnRoll] = useState("");
  const [thirdParty, setThirdParty] = useState("");
  const [totalEmp, setTotalEmp] = useState("");
  const [CenterInchargeList, setCenterInchargeList] = useState([]);
  const [SeniorManagerList, setSeniorManagerList] = useState([]);
  const [user_id, setUser_id] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const [error, setError] = useState({});
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const button = params._id ? "Update" : "Submit";

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      const parseUser_id = userDetailsParse.user_id;
      setUser_id(parseUser_id);
    }

    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
    } else {
      setLoggedInRole("executive");
    }
  }, []);
  useEffect(() => {
    const onRollNumber = parseInt(onRoll, 10) || 0;
    const thirdPartyNumber = parseInt(thirdParty, 10) || 0;
    setTotalEmp(onRollNumber + thirdPartyNumber);
  }, [onRoll, thirdParty]);

  useEffect(() => {
    if (params._id) {
      axios
        .get("/api/centers/get/one/" + props.center_id)
        .then((centerData) => {
          setCenterName(centerData.data[0].centerName);
          setAddressLine(centerData.data[0].address.addressLine);

          setDistrict(centerData.data[0].address.district);
          setState(centerData.data[0].address.state);
          setPincode(centerData.data[0].address.pincode);
          setAssetManagementCenterCode(
            centerData.data[0].assetManagementCenterCode,
          );

          setOnRoll(centerData.data[0].onRoll);
          setThirdParty(centerData.data[0].thirdParty);
          setTotalEmp(centerData.data[0].totalEmp);
        });
    }
  }, []);

  useEffect(() => {
    getCentersData();
  }, []);

  const getCentersData = () => {
    axios
      .get("/api/centers/list")
      .then((centerData) => {})
      .catch((error) => {
        console.log("Error while getting approver List => ", error);

        Swal.fire(" ", "Something went wrong! <br/>" + error.message);
      });
  };

  // validation for form values
  const validation = () => {
    const errorMsg = {};
    let inputIsValid = true;
    if (validator.isEmpty(centerName, [{ ignore_whitespace: true }])) {
      inputIsValid = false;
      errorMsg.centerNameError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isAlpha(centerName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.centerNameError = "Only alphabets allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(addressLine.replace(/\s/g))) {
      inputIsValid = false;
      errorMsg.addressLineError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(district.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.districtError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isAlpha(district.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.districtError = "Only alphabets allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(state.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.stateError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isAlpha(state.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.stateError = "Only alphabets allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(pincode)) {
      inputIsValid = false;
      errorMsg.pincodeError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isNumeric(pincode)) {
      inputIsValid = false;
      errorMsg.pincodeError = "Only numerics allowed.";
      setError(errorMsg);
    } else if (!validator.isPostalCode(pincode, ["IN"])) {
      inputIsValid = false;
      errorMsg.pincodeError = "Invalid input.";
      setError(errorMsg);
    }

    if (validator.isEmpty(onRoll.toString())) {
      inputIsValid = false;
      errorMsg.onRollError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isNumeric(onRoll.toString())) {
      inputIsValid = false;
      errorMsg.onRollError = "Only numerics allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(thirdParty.toString())) {
      inputIsValid = false;
      errorMsg.thirdPartyError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isNumeric(thirdParty.toString())) {
      inputIsValid = false;
      errorMsg.thirdPartyError = "Only numerics allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(totalEmp.toString())) {
      inputIsValid = false;
      errorMsg.totalEmpError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isNumeric(totalEmp.toString())) {
      inputIsValid = false;
      errorMsg.totalEmpError = "Only numerics allowed.";
      setError(errorMsg);
    }

    return inputIsValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validation()) {
      let formValues = {
        centerName: centerName,
        addressLine: addressLine,
        district: district,
        state: state,
        pincode: pincode,
        onRoll: onRoll,
        thirdParty: thirdParty,
        totalEmp: totalEmp,
        assetManagementCenterCode: assetManagementCenterCode,
        user_id,
      };

      if (params._id) {
        formValues.center_ID = params._id;
        axios
          .patch("/api/centers/patch/update", formValues)
          .then((updatedProduct) => {
            setRunCount((count) => count + 1);
            if (updatedProduct.data.success) {
              Swal.fire(" ", "Center details updated successfully!!");
              setLoading2(true);
              if (loggedInRole === "admin") {
                router.push(
                  "/admin/master-data/center-details/center-details-list",
                );
              } else if (loggedInRole === "center" && params?._id) {
                router.push(`/center/center-profile/${params._id}`);
              }
            } else {
              Swal.fire(
                " ",
                "Center details was not changed hence no update!!",
              );
            }
          })
          .catch((error) => {
            console.log("API Error => ", error);
            Swal.fire(" ", "Something went wrong! <br/>" + error.message);
          });
      } else {
        axios
          .post("api/centers/post", formValues)
          .then((response) => {
            setRunCount((count) => count + 1);
            Swal.fire(" ", "Center details submitted successfully!!");

            // Reset form values after successful submission
            setCenterName("");
            setAddressLine("");
            setDistrict("");
            setState("");
            setPincode("");
            setAssetManagementCenterCode("");
            setOnRoll("");
            setThirdParty("");
            setTotalEmp("");

            setLoading2(true);

            router.push(
              "/admin/master-data/center-details/center-details-list",
            );
          })
          .catch((error) => {
            console.log("post API Error => ", error);
            const errorMessage =
              error?.response?.data?.message || "Something went wrong!";
            Swal.fire(" ", errorMessage);
          });
      }
    }
  };

  return (
    <section className="section p-6 md:p-10 bg-white min-h-screen border-t-[3px] border-[#3c8dbc] shadow-md">
      <div className="max-w-[1440px] mx-auto">
        {/* Theme-aligned Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Master Data Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Center <span className="text-[#3c8dbc] font-black">Management</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
              {loggedInRole === "admin" ? (
                <Tooltip
                  content="Center Details List"
                  placement="bottom"
                  className="bg-[#3c8dbc]"
                  arrow={false}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin text-center text-[#3c8dbc] inline-flex mx-2" />
                  ) : (
                    <CiViewList
                      className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                      onClick={() => {
                        router.push(
                          "/admin/master-data/center-details/center-details-list",
                        );
                      }}
                    />
                  )}
                </Tooltip>
              ) : null}
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Configure and maintain organizational center details, location mapping, and workforce distribution statistics.
          </p>
        </div>

        <div className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-10 mt-6">
            <div className="hr-card !p-8 bg-white border border-gray-200 rounded-lg shadow-md mt-2">
              <SectionHeader
                title="Center Details"
                subtitle="Primary identification and location information for the center."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {/* Center Name */}
                <div className="lg:col-span-2">
                  <label className="hr-label">
                    Center Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    placeholder="Enter Center Name"
                    value={centerName}
                    onChange={(e) => {
                      setCenterName(e.target.value);
                      setError((prev) => ({ ...prev, centerNameError: "" }));
                    }}
                  />
                  {error.centerNameError && (
                    <p className="error">{error.centerNameError}</p>
                  )}
                </div>

                {/* Center Code */}
                <div>
                  <label className="hr-label">Asset Mgmt. Code</label>
                  <input
                    type="text"
                    className="hr-input"
                    placeholder="Enter Code"
                    value={assetManagementCenterCode}
                    onChange={(e) =>
                      setAssetManagementCenterCode(e.target.value)
                    }
                  />
                </div>

                {/* Address */}
                <div className="lg:col-span-3">
                  <label className="hr-label">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    placeholder="Enter full physical address"
                    value={addressLine}
                    onChange={(e) => {
                      setAddressLine(e.target.value);
                      setError((prev) => ({ ...prev, addressLineError: "" }));
                    }}
                  />
                  {error.addressLineError && (
                    <p className="error">{error.addressLineError}</p>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="hr-label">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    placeholder="Enter District"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setError((prev) => ({ ...prev, districtError: "" }));
                    }}
                  />
                  {error.districtError && (
                    <p className="error">{error.districtError}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="hr-label">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    placeholder="Enter State"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setError((prev) => ({ ...prev, stateError: "" }));
                    }}
                  />
                  {error.stateError && (
                    <p className="error">{error.stateError}</p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="hr-label">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    className="hr-input"
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      setError((prev) => ({ ...prev, pincodeError: "" }));
                    }}
                  />
                  {error.pincodeError && (
                    <p className="error">{error.pincodeError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="hr-card !p-8 bg-white border border-gray-200 rounded-lg shadow-md mt-10">
              <SectionHeader
                title="Staff Statistics"
                subtitle="Breakdown of center workforce by employment type."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                <div>
                  <label className="hr-label">
                    On-Roll Staff <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    placeholder="0"
                    value={onRoll}
                    onChange={(e) => {
                      setOnRoll(e.target.value);
                      setError((prev) => ({ ...prev, onRollError: "" }));
                    }}
                  />
                  {error.onRollError && (
                    <p className="error">{error.onRollError}</p>
                  )}
                </div>

                <div>
                  <label className="hr-label">
                    Third Party Staff <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="hr-input"
                    placeholder="0"
                    value={thirdParty}
                    onChange={(e) => {
                      setThirdParty(e.target.value);
                      setError((prev) => ({ ...prev, thirdPartyError: "" }));
                    }}
                  />
                  {error.thirdPartyError && (
                    <p className="error">{error.thirdPartyError}</p>
                  )}
                </div>

                <div>
                  <label className="hr-label">Total Staff</label>
                  <input
                    disabled
                    type="text"
                    className="hr-input bg-gray-50 border-gray-200 text-gray-400 font-bold"
                    value={totalEmp}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="hr-btn-primary min-w-[200px]"
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

      <style jsx>{`
        .hr-label {
          display: block;
          font-weight: 700;
          font-size: 16px;
          color: #333;
          margin-bottom: 8px;
        }
        .hr-input {
          display: block;
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
          transition: all 0.2s ease;
          outline: none;
          background-color: #fff;
          color: #1f2937;
        }
        .hr-input:focus {
          border-color: #3c8dbc;
          box-shadow: 0 0 0 3px rgba(60, 141, 188, 0.1);
        }
        .hr-input::placeholder {
          color: #9ca3af;
          font-weight: 600;
        }
        .hr-input:disabled {
          background-color: #f9fafb;
          border-color: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }
        .error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default CenterManagement;
