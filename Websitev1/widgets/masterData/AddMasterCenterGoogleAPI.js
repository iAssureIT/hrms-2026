"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Modal, Tooltip } from "flowbite-react";
import { MdClose } from "react-icons/md";
import validator from "validator";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import AddressAutocomplete from "./AddressAutocomplete";

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

const districtList = ["Pune", "Nashik", "Mumbai"];
const stateList = ["Maharashtra", "Karnataka", "Goa"];

const CenterManagement = (props) => {
  const [centerName, setCenterName] = useState("");
  const [addressLine, setAddressLine] = useState("");

  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [centerInchargeName, setCenterInchargeName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [seniorManager, setSeniorManager] = useState("");
  const [seniorManagerMobile, setSeniorManagerMobile] = useState("");
  const [seniorManagerEmail, setSeniorManagerEmail] = useState("");
  const [onRoll, setOnRoll] = useState("");
  const [thirdParty, setThirdParty] = useState("");
  const [totalEmp, setTotalEmp] = useState("");
  const [SeniorManagerList, setSeniorManagerList] = useState([]);
  const [user_id, setUser_id] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);

  // const [tableData, setTableData] = useState([]);
  // const [recsPerPage, setRecsPerPage] = useState(10);
  // const [numOfPages, setNumOfPages] = useState([1]);
  // const [pageNumber, setPageNumber] = useState(1);
  // const [searchText, setSearchText] = useState("-");
  // const [totalRecs, setTotalRecs] = useState("-");
  // const [search, setSearch] = useState("");

  const [error, setError] = useState({});

  const [centerCreateModal, setCenterCreateModal] = useState(false);
  const [centerUpdateModal, setCenterUpdateModal] = useState(false);
  const [centerModifyModal, setCenterModifyModal] = useState(false);
  const [centerExistModal, setCenterExistModal] = useState(false);
  const [centerErrorModal, setCenterErrorModal] = useState(false);

  const router = useRouter();

  const params = useParams();
  const handleAddressSelect = (address, latLng) => {
    console.log("Selected Address:", address);
    console.log("Latitude and Longitude:", latLng);
  };
  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      const parseUser_id = userDetailsParse.user_id;
      setUser_id(parseUser_id);
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
          // console.log("Center Data id", centerData.data[0]._id);
          // console.log("Center Data", centerData.data);
          setCenterName(centerData.data[0].centerName);
          setAddressLine(centerData.data[0].address.addressLine);

          setDistrict(centerData.data[0].address.district);
          setState(centerData.data[0].address.state);
          setPincode(centerData.data[0].address.pincode);
          setCenterInchargeName(
            centerData.data[0].centerInchargeDetails.centerInchargeName
          );
          setMobileNumber(
            centerData.data[0].centerInchargeDetails.mobileNumber
          );
          setEmail(centerData.data[0].centerInchargeDetails.email);
          console.log(centerData.data[0].centerInchargeDetails);
          setSeniorManager(centerData.data[0].seniorManager);
          setSeniorManagerMobile(centerData.data[0].seniorManagerMobile);
          setSeniorManagerEmail(centerData.data[0].seniorManagerEmail);

          setOnRoll(centerData.data[0].onRoll);
          setThirdParty(centerData.data[0].thirdParty);
          setTotalEmp(centerData.data[0].totalEmp);
        });
    }
  }, []);

  useEffect(() => {
    getCentersData();
    getSeniorManagerList();
  }, []);

  const getCentersData = () => {
    axios
      .get("/api/centers/list")
      .then((centerData) => {
        console.log("Center Data", centerData);
      })
      .catch((error) => {
        console.log("Error while getting approver List => ", error);
        // Swal.fire(
        //   "Oops!",
        //   "Something went wrong! <br/>" + error.message,
        //   "error"
        // );
        setCenterErrorModal(true);
      });
  };

  useEffect(() => {
    getSeniorManagerList();
  }, []);

  const getSeniorManagerList = () => {
    axios
      .post("/api/users/get/list/user")
      .then((response) => {
        const SeniorManagerList = response.data;
        setSeniorManagerList(SeniorManagerList);
      })
      .catch((error) => {
        console.log("Error while getting SeniorManagerList => ", error);
      });
  };

  const handleSeniorManagerChange = (e) => {
    const selectedManager = SeniorManagerList.find(
      (manager) => manager.name === e.target.value
    );
    if (selectedManager) {
      setSeniorManager(e.target.value);
      setSeniorManagerMobile(selectedManager.mobile);
      setSeniorManagerEmail(selectedManager.email);
      setError((prevState) => ({
        ...prevState,
        seniorManagerError: "",
      }));
    }
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

    if (validator.isEmpty(district)) {
      inputIsValid = false;
      errorMsg.districtError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(state)) {
      inputIsValid = false;
      errorMsg.stateError = "This field is required.";
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

    if (validator.isEmpty(centerInchargeName)) {
      inputIsValid = false;
      errorMsg.centerInchargeNameError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isAlpha(centerInchargeName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.centerInchargeNameError = "Only alphabets allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(mobileNumber)) {
      inputIsValid = false;
      errorMsg.mobileNumberError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isNumeric(mobileNumber)) {
      inputIsValid = false;
      errorMsg.mobileNumberError = "Only numerics allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(email)) {
      inputIsValid = false;
      errorMsg.emailError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isEmail(email)) {
      inputIsValid = false;
      errorMsg.emailError = "Invalid input.";
      setError(errorMsg);
    }

    if (validator.isEmpty(seniorManager)) {
      inputIsValid = false;
      errorMsg.seniorManagerError = "This field is required.";
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
        centerInchargeName: centerInchargeName,
        mobileNumber: mobileNumber,
        seniorManager: seniorManager,
        seniorManagerMobile: seniorManagerMobile,
        seniorManagerEmail: seniorManagerEmail,
        email: email,
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
              // Swal.fire(
              //   "Congratulations!",
              //   "Your Center Details Updated Successfully!!",
              //   "success"
              // );
              setCenterUpdateModal(true);

              // router.push("/admin/master-data/center-management");
            } else {
              // Swal.fire(
              //   "Warning!",
              //   "Your Center Details was not changed hence no update!!",
              //   "warning"
              // );
              setCenterModifyModal(true);
            }
          })
          .catch((error) => {
            console.log("API Error => ", error);
            // Swal.fire("Oops!", "Something Went Wrong!!", "error");
            setCenterErrorModal(true);
          });
      } else {
        axios
          .post("api/centers/post", formValues)

          .then((response) => {
            setRunCount((count) => count + 1);
            if (response.data.message !== "Center already exists") {
              // Swal.fire({
              //   title: "Congratulations!",
              //   text: "Center Details Submitted Successfully!!",
              //   icon: "success",
              //   showConfirmButton: false,
              //   timer: 1500,
              // });
              setCenterCreateModal(true);
              console.log("response after post", response);
              // Reset form values after successful submission
              setCenterName("");
              setAddressLine("");
              setDistrict("");
              setState("");
              setPincode("");
              setCenterInchargeName("");
              setMobileNumber("");
              setEmail("");
              setSeniorManager("");
              setSeniorManagerMobile("");
              setSeniorManagerEmail("");
              setOnRoll("");
              setThirdParty("");
              setTotalEmp("");

              // Uncomment these lines if needed
              // getData();
              // router.push("/admin/master-data/center-management");
            } else {
              // Swal.fire(
              //   "Oops",
              //   response.data.message + "! Please enter another Center",
              //   "error"
              // );
              setCenterExistModal(true);
            }
          })
          .catch((error) => {
            console.log("post API Error => ", error);
            // Swal.fire("Oops!", "Something Went Wrong!!", "error");
            setCenterErrorModal;
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
              <Tooltip content="Center Details List" placement="bottom">
                <CiViewList
                  className="icon hover:text-gray-800 border border-gray-400 p-0.5 hover:border-gray-700 rounded text-[30px]"
                  onClick={() => {
                    // router.push(
                    //   "/admin/master-data/center-details/center-details-list"
                    // );
                    window.open(
                      "/admin/master-data/center-details/center-details-list",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="px-10 py-6">
          <div className="bg-white text-secondary ">
            <div>
              <div className="rounded-md">
                <div className="mt-5">
                  <div className="flex-1 my-2">
                    <label
                      htmlFor="center-name"
                      // inputLabel
                      // className="block text-sm font-medium leading-6 text-gray-900"
                      className="inputLabel"
                    >
                      Center Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        {/* icon */}
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          {/* <span className="icon"> */}
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
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter Center Name"
                        onChange={(e) => {
                          setCenterName(e.target.value);
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
                      <AddressAutocomplete
                        onAddressSelect={handleAddressSelect}
                      />
                    </div>
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.addressLineError}
                    </div>
                  </div>
                  <div className="flex lg:flex-row md:flex-row flex-col mt-4 my-2">
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
                      <label
                        htmlFor="productId"
                        // className="block text-sm font-medium leading-6 text-gray-900"
                        className="inputLabel"
                      >
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
                      <label
                        htmlFor="productId"
                        // className="block text-sm font-medium leading-6 text-gray-900"
                        className="inputLabel"
                      >
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

            <div className="flex lg:flex-row md:flex-row flex-col mt-4 my-2">
              <div className="flex-1 me-2 mt-4 lg:mt-0">
                <label
                  htmlFor="onRoll"
                  // className="block text-sm font-medium leading-6 text-gray-900"
                  className="inputLabel"
                >
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
                <label
                  htmlFor="thirdParty"
                  // className="block text-sm font-medium leading-6 text-gray-900"
                  className="inputLabel"
                >
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
                <label
                  htmlFor="totalEmp"
                  // className="block text-sm font-medium leading-6 text-gray-900"
                  className="inputLabel"
                >
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

            <div className="flex my-5 mt-10">
              <div className="subHeading">Center Incharge Details</div>
            </div>

            <div className="md:flex lg:flex justify-between my-2">
              <div className="flex-1 me-3">
                <label
                  htmlFor="productId"
                  // className="block text-sm font-medium leading-6 text-gray-900"
                  className="inputLabel"
                >
                  Name <span className="text-red-500">*</span>
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
                    // value={props.center_id ? centerInchargeDetails.centerInchargeName : obj.centerInchargeName}
                    value={centerInchargeName}
                    className="stdInputField"
                    // className="block h-9  rounded-md border-0 py-1.5 pl-12 w-full    text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Enter Center Incharge Name"
                    onChange={(e) => {
                      setCenterInchargeName(e.target.value);
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
                  {error.centerInchargeNameError}
                </div>
              </div>
              <div className="flex-1 me-3 mt-4 lg:mt-0">
                <label
                  htmlFor="productId"
                  // className="block text-sm font-medium leading-6 text-gray-900"
                  className="inputLabel"
                >
                  Mobile <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <FaMobileAlt className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="productId"
                    maxLength={10}
                    id="productId"
                    // value={props.center_id ? centerInchargeDetails.mobileNumber : obj.mobileNumber}
                    value={mobileNumber}
                    className="stdInputField"
                    // className="block h-9  rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Enter Mobile Number"
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      setError((prevState) => ({
                        ...prevState,
                        mobileNumberError: "",
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
                  {error.mobileNumberError}
                </div>
              </div>
              <div className="flex-1 mt-4 lg:mt-0">
                <label
                  htmlFor="productId"
                  // className="block text-sm font-medium leading-6 text-gray-900"
                  className="inputLabel"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <MdOutlineEmail className="icon" />
                    </span>
                  </div>
                  <input
                    type="email"
                    name="productId"
                    id="productId"
                    // value={props.center_id ? centerInchargeDetails.email: obj.email}
                    value={email}
                    className="stdInputField"
                    // className="block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Enter Email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError((prevState) => ({
                        ...prevState,
                        emailError: "",
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
                  {error.emailError}
                </div>
              </div>
            </div>

            <div className="flex my-5 mt-10">
              <div className="subHeading">Senior Manager Details</div>
            </div>

            <div className="md:flex lg:flex justify-between my-2">
              <div className="flex-1 me-3">
                <label htmlFor="seniorManager" className="inputLabel">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <IoPersonCircleOutline className="icon" />
                    </span>
                  </div>
                  <select
                    name="seniorManager"
                    id="seniorManager"
                    className={`stdSelectField ${
                      seniorManager
                        ? "text-black "
                        : "text-gray-400 font-normal"
                    }`}
                    value={seniorManager}
                    onChange={handleSeniorManagerChange}
                  >
                    <option value="" disabled className="text-gray-400">
                      -- Select Senior Manager --
                    </option>
                    {SeniorManagerList.map((data, i) => (
                      <option className="text-black" key={i} value={data.name}>
                        {data.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className="text-red-500"
                  style={{ fontSize: "12px", fontWeight: "normal" }}
                >
                  {error.seniorManagerError}
                </div>
              </div>
              <div className="flex-1 me-3 mt-4 lg:mt-0">
                <label htmlFor="mobileNumber" className="inputLabel">
                  Mobile
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <FaMobileAlt className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="mobileNumber"
                    maxLength={10}
                    id="mobileNumber"
                    disabled
                    value={seniorManagerMobile}
                    className="stdInputField bg-gray-100"
                    placeholder="Mobile Number"
                  />
                </div>
              </div>
              <div className="flex-1 mt-4 lg:mt-0">
                <label htmlFor="email" className="inputLabel">
                  Email
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <MdOutlineEmail className="icon" />
                    </span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={seniorManagerEmail}
                    className="stdInputField bg-gray-100"
                    disabled
                    placeholder="Email"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="formButtons mt-5"
                onClick={handleSubmit}
              >
                {params._id ? "Update" : "Submit"}
              </button>
            </div>
          </div>

          <Modal
            show={centerCreateModal}
            size="md"
            onClose={() => {
              setCenterCreateModal(false);
              window.open(
                "/admin/master-data/center-details/center-details-list",
              "_blank",
              "noopener,noreferrer"
              );
            }}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => {
                  setCenterCreateModal(false);
                  window.open(
                    "/admin/master-data/center-details/center-details-list",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                {/* <MdClose className="icon text-white font-medium" /> */}
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                <h3 className="modalText">Center added successfully</h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => {
                      setCenterCreateModal(false);
                      window.open(
                        "/admin/master-data/center-details/center-details-list",
                        '_self'
                        // "noopener,noreferrer"
                      );
                    }}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            show={centerErrorModal}
            size="md"
            onClose={() => setCenterErrorModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setCenterErrorModal(false)}
              >
                {/* <MdClose className="icon text-white font-medium" /> */}
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                <h3 className="modalText">Oops!</h3>
                <h3 className="modalText">Something went wrong!</h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => setCenterErrorModal(false)}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            show={centerModifyModal}
            size="md"
            onClose={() => setCenterModifyModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setCenterModifyModal(false)}
              >
                {/* <MdClose className="icon text-white font-medium" /> */}
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                <h3 className="modalText">Center is not modified</h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => setCenterModifyModal(false)}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            show={centerUpdateModal}
            size="md"
            dismissible
            onClose={() => {
              setCenterUpdateModal(false);
              window.open(
                "/admin/master-data/center-details/center-details-list",
                "_blank",
                "noopener,noreferrer"
              );
            }}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => {
                  setCenterUpdateModal(false);
                  window.open(
                    "/admin/master-data/center-details/center-details-list",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                {/* <MdClose className="icon text-white font-medium" /> */}
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                <h3 className="modalText">Center updated successfully</h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => {
                      setCenterUpdateModal(false);
                      window.open(
                        "/admin/master-data/center-details/center-details-list",
                          '_self'
                          // "noopener,noreferrer"
                        );
                    }}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            show={centerExistModal}
            size="md"
            onClose={() => setCenterExistModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setCenterExistModal(false)}
              >
                {/* <MdClose className="icon text-white font-medium" /> */}
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                <h3 className="modalText">Center already exists</h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => setCenterExistModal(false)}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </section>
  );
};

export default CenterManagement;
