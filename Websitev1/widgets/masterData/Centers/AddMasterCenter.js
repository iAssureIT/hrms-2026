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

const districtList = ["Pune", "Nashik", "Mumbai"];
const stateList = ["Maharashtra", "Karnataka", "Goa"];

const CenterManagement = (props) => {
  const [centerName, setCenterName] = useState("");
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
                router.push("/admin/master-data/center-details/center-details-list");
              } else if (loggedInRole === "center" && params?._id) {
                router.push(`/center/center-profile/${params._id}`);
              }
            } else {
              Swal.fire(
                " ",
                "Center details was not changed hence no update!!"
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
            if (response.data.message !== "Center already exists") {
              Swal.fire(" ", "Center details submitted successfully!!");

              // Reset form values after successful submission
              setCenterName("");
              setAddressLine("");
              setDistrict("");
              setState("");
              setPincode("");
              setOnRoll("");
              setThirdParty("");
              setTotalEmp("");

              setLoading2(true);

              router.push(
                "/admin/master-data/center-details/center-details-list"
              );
            } else {
              Swal.fire(
                " ",
                response.data.message + "! Please enter another center"
              );
            }
          })
          .catch((error) => {
            console.log("post API Error => ", error);
          });
      }
    }
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Center Details</h1>
            <div className="flex gap-3 my-6 me-10">
            {loggedInRole === "admin" ? 
              <Tooltip
                content="Center Details List"
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
                        "/admin/master-data/center-details/center-details-list",
                        '_self'
                        // "noopener,noreferrer"
                      );
                    }}
                  />
                )}
              </Tooltip>
                : null
              }
            </div>
          </div>
        </div>
        <div className="px-10 py-6">
          <div className="bg-white text-secondary ">
            <div>
              <div className="rounded-md">
                <div className="mt-5">
                  <div className="flex-1 my-2">
                    <label htmlFor="center-name" className="inputLabel">
                      Center Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <HiBuildingOffice2 className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="productId"
                        id="productId"
                        value={centerName}
                        className={
                          error.centerNameError
                            ? "stdInputField"
                            : "stdInputField"
                        }
                        placeholder="Enter Center Name"
                        onChange={(e) => {
                          setCenterName(e.target.value.trim());
                          setError((prevState) => ({
                            ...prevState,
                            centerNameError: "",
                          }));
                        }}
                      />
                    </div>
                    <div
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.centerNameError}
                    </div>
                  </div>
                  <div className="flex-1 mt-4 my-2">
                    <label htmlFor="productId" className="inputLabel">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <IoLocationOutline className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="productId"
                        id="productId"
                        value={addressLine}
                        className={
                          error.centerInchargeNameError
                            ? "stdInputField"
                            : "stdInputField"
                        }
                        placeholder="Enter Address"
                        onChange={(e) => {
                          setAddressLine(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            addressLineError: "",
                          }));
                        }}
                      />
                    </div>
                    <div
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.addressLineError}
                    </div>
                  </div>
                  <div className="flex lg:flex-row md:flex-row flex-col lg:mt-4 lg:my-2">
                    <div className="flex-1 me-2 mt-4 lg:mt-0">
                      <label htmlFor="productId" className="inputLabel">
                        District <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                            <IoLocationOutline className="icon" />
                          </span>
                        </div>
                        {/* <select
                          name="activityName"
                          id="activityName"
                          className={
                            `${
                            error.districtError
                              ? "stdSelectField"
                              : "stdSelectField"
                          } ${
                              district
                                ? "selectOption"
                                : "font-normal text-gray-400"
                            }`
                            
                          }
                          value={district}
                          onChange={(e) => {
                            setDistrict(e.target.value);
                            setError((prevState) => ({
                              ...prevState,
                              districtError: "",
                            }));
                          }}
                        >
                          <option
                            value=""
                            disabled
                            selected
                            className="disabledOption"
                          >
                            Select District
                          </option>
                          {districtList.map((district, index) => (
                            <option
                              className="selectOption"
                              key={index}
                              value={district}
                            >
                              {district}
                            </option>
                          ))}
                        </select> */}
                        <input
                          type="text"
                          name="productId"
                          id="productId"
                          value={district}
                          className={
                            error.districtError
                              ? "stdInputField"
                              : "stdInputField"
                          }
                          placeholder="Enter District"
                          onChange={(e) => {
                            setDistrict(e.target.value);
                            setError((prevState) => ({
                              ...prevState,
                              districtError: "",
                            }));
                          }}
                        />
                      </div>
                      <div
                        className="text-red-500"
                        style={{
                          fontSize: "12px",
                          fontWeight: "normal",
                        }}
                      >
                        {error.districtError}
                      </div>
                    </div>
                    <div className="flex-1 me-2 mt-4 lg:mt-0">
                      <label htmlFor="productId" className="inputLabel">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                            <IoLocationOutline className="icon" />
                          </span>
                        </div>
                        {/* <select
                          name="activityName"
                          id="activityName"
                          className={
                            `
                         ${
                           error.stateError
                             ? "stdSelectField"
                             : "stdSelectField"
                         } ${
                            state ? "selectOption" : "font-normal text-gray-400"
                          }
                        `}
                          

                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            setError((prevState) => ({
                              ...prevState,
                              stateError: "",
                            }));
                          }}
                        >
                          <option
                            className="text-gray-500"
                            selected
                            disabled
                            value=""
                          >
                            Select State
                          </option>
                          {stateList.map((state, index) => (
                            <option className="selectOption" value={state}>
                              {state}
                            </option>
                          ))}
                        </select> */}
                        <input
                          type="text"
                          name="productId"
                          id="productId"
                          value={state}
                          className={
                            error.stateError ? "stdInputField" : "stdInputField"
                          }
                          placeholder="Enter State"
                          onChange={(e) => {
                            setState(e.target.value);
                            setError((prevState) => ({
                              ...prevState,
                              stateError: "",
                            }));
                          }}
                        />
                      </div>
                      <div
                        className="text-red-500"
                        style={{
                          fontSize: "12px",
                          fontWeight: "normal",
                        }}
                      >
                        {error.stateError}
                      </div>
                    </div>
                    <div className="flex-1 mt-4 lg:mt-0">
                      <label htmlFor="productId" className="inputLabel">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2 rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                            <Md123 className="icon" />
                          </span>
                        </div>
                        <input
                          type="text"
                          name="productId"
                          id="productId"
                          maxLength={6}
                          value={pincode}
                          className={
                            error.pincodeError
                              ? "stdInputField"
                              : "stdInputField"
                          }
                          placeholder="Enter Pincode"
                          onChange={(e) => {
                            setPincode(e.target.value);
                            setError((prevState) => ({
                              ...prevState,
                              pincodeError: "",
                            }));
                          }}
                        />
                      </div>
                      <div
                        className="text-red-500"
                        style={{
                          fontSize: "12px",
                          fontWeight: "normal",
                        }}
                      >
                        {error.pincodeError}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex lg:flex-row md:flex-row flex-col lg:mt-4 lg:my-2">
              <div className="flex-1 me-2 mt-4 lg:mt-0">
                <label htmlFor="onRoll" className="inputLabel">
                  On-Roll Staff <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <Md123 className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="onRoll"
                    id="onRoll"
                    value={onRoll}
                    className={
                      error.onRollError ? "stdInputField" : "stdInputField"
                    }
                    placeholder="Enter On Roll Emp"
                    onChange={(e) => {
                      setOnRoll(e.target.value);
                      setError((prevState) => ({
                        ...prevState,
                        onRollError: "",
                      }));
                    }}
                  />
                </div>
                <div
                  className="text-red-500"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {error.onRollError}
                </div>
              </div>
              <div className="flex-1 me-2 mt-4 lg:mt-0">
                <label htmlFor="thirdParty" className="inputLabel">
                  Third Party Staff <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <Md123 className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="thirdParty"
                    id="thirdParty"
                    value={thirdParty}
                    className={
                      error.thirdPartyError ? "stdInputField" : "stdInputField"
                    }
                    placeholder="Enter Third Party Emp"
                    onChange={(e) => {
                      setThirdParty(e.target.value);
                      setError((prevState) => ({
                        ...prevState,
                        thirdPartyError: "",
                      }));
                    }}
                  />
                </div>
                <div
                  className="text-red-500"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {error.thirdPartyError}
                </div>
              </div>
              <div className="flex-1 mt-4 lg:mt-0">
                <label htmlFor="totalEmp" className="inputLabel">
                  Total Staff
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <Md123 className="icon" />
                    </span>
                  </div>
                  <input
                    disabled
                    type="text"
                    name="totalEmp"
                    id="totalEmp"
                    value={totalEmp}
                    className={
                      error.totalEmpError ? "stdInputField" : "stdInputField"
                    }
                    onChange={(e) => {
                      setTotalEmp(e.target.value);
                      setError((prevState) => ({
                        ...prevState,
                        totalEmpError: "",
                      }));
                    }}
                  />
                </div>
                <div
                  className="text-red-500"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {error.totalEmpError}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="formButtons mt-5"
                onClick={handleSubmit}
              >
                {params._id && loading2 ? (
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

export default CenterManagement;
