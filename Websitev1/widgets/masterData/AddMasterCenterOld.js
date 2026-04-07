"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import validator from "validator";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import "animate.css";

import { IoLocationOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineEmail } from "react-icons/md";
import { IoPersonCircleOutline } from "react-icons/io5";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { FaMobileAlt } from "react-icons/fa";
import { Md123 } from "react-icons/md";
import GenericTable from "@/widgets/GenericTable/Table";

const districtList = ["Pune", "Nashik", "Mumbai"];
const stateList = ["Maharashtra", "Karnataka", "Goa"];

const CenterManagement = (props) => {
  const [centerName, setCenterName] = useState("");
  const [addressLine, setAddressLine] = useState("");

  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [centerInchargeDetails, setCenterInchargeDetails] = useState([
    { centerInchargeName: "", mobileNumber: "", email: "" },
  ]);
  const [onRoll, setOnRoll] = useState("");
  const [thirdParty, setThirdParty] = useState("");
  const [totalEmp, setTotalEmp] = useState("");
  
  const [error, setError] = useState({});
  const router = useRouter();

  const [runCount, setRunCount] = useState(0);
  const params = useParams();
  const tableHeading = {
    centerName: "Center Name",
    address: "Address",
    centerInchargeName: "Center Incharge Name",
    mobileNumber: "Center Incharge Mobile",
    email: "Center Incharge  Email",
    onRoll : "On Roll Employee",
    thirdParty:"Third Party Employee",
    totalEmp:"Total Employee",
    actions: "Actions",
  };
  const tableObjects = {
    tableName: "Centers List",
    deleteMethod: "delete",
    getListMethod: "get",
    apiURL: "/api/centers",
    editURL: "/admin/master-data/center-management/",
    searchApply: false,
    downloadApply: true,
    titleMsg: "Center Details",
  };

  const inputExtendHandler = () => {
    const extendedDiv = [
      ...centerInchargeDetails,
      { centerInchargeName: "", mobileNumber: "", email: "" },
    ];
    setCenterInchargeDetails(extendedDiv);
  };

  const inputReduceHandler = () => {
    setCenterInchargeDetails((prevDetails) => {
      if (prevDetails.length === 0) return prevDetails;
      return prevDetails.slice(0, -1);
    });
  };

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
          console.log("Center Data id", centerData.data[0]._id);
          console.log("Center Data", centerData.data);
          setCenterName(centerData.data[0].centerName);
          setAddressLine(centerData.data[0].address.addressLine);

          setDistrict(centerData.data[0].address.district);
          setState(centerData.data[0].address.state);
          setPincode(centerData.data[0].address.pincode);
          setCenterInchargeDetails(centerData.data[0].centerInchargeDetails);
          console.log(centerData.data[0].centerInchargeDetails);

          setOnRoll(centerData.data[0].onRoll);
          setThirdParty(centerData.data[0].thirdParty);
          setTotalEmp(centerData.data[0].totalEmp);
        });
    }
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axios
      .get("/api/centers/list")
      .then((centerData) => {
        console.log("Center Data", centerData);
      })
      .catch((error) => {
        console.log("Error while getting approver List => ", error);
        Swal.fire(
          "Oops!",
          "Something went wrong! <br/>" + error.message,
          "error"
        );
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

    centerInchargeDetails.map((obj) => {
      if (validator.isEmpty(obj.centerInchargeName)) {
        inputIsValid = false;
        errorMsg.centerInchargeNameError = "This field is required.";
        setError(errorMsg);
      } else if (
        !validator.isAlpha(obj.centerInchargeName.replace(/\s/g, ""))
      ) {
        inputIsValid = false;
        errorMsg.centerInchargeNameError = "Only alphabets allowed.";
        setError(errorMsg);
      }

      if (validator.isEmpty(obj.mobileNumber)) {
        inputIsValid = false;
        errorMsg.mobileNumberError = "This field is required.";
        setError(errorMsg);
      } else if (!validator.isNumeric(obj.mobileNumber)) {
        inputIsValid = false;
        errorMsg.mobileNumberError = "Only numerics allowed.";
        setError(errorMsg);
      }

      if (validator.isEmpty(obj.email)) {
        inputIsValid = false;
        errorMsg.emailError = "This field is required.";
        setError(errorMsg);
      } else if (!validator.isEmail(obj.email)) {
        inputIsValid = false;
        errorMsg.emailError = "Invalid input.";
        setError(errorMsg);
      }
    });

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
        centerInchargeDetails: centerInchargeDetails,
        onRoll:onRoll,
        thirdParty:thirdParty,
        totalEmp:totalEmp,
      };

      if (params._id) {
        formValues.center_ID = params._id;
        axios
          .patch("/api/centers/patch/update", formValues)
          .then((updatedProduct) => {
            setRunCount((count) => count + 1);
            if (updatedProduct.data.success) {
              Swal.fire(
                "Congratulations!",
                "Your Center Details Updated Successfully!!",
                "success"
              );
              getData();
              router.push("/admin/master-data/center-management");
            } else {
              Swal.fire(
                "Warning!",
                "Your Center Details was not changed hence no update!!",
                "warning"
              );
            }
          })
          .catch((error) => {
            console.log("API Error => ", error);
            Swal.fire("Oops!", "Something Went Wrong!!", "error");
          });
      } else {
        axios
          .post("api/centers/post", formValues)

          .then((response) => {
            setRunCount((count) => count + 1);
            if (response.data.message !== "Center already exists") {
              Swal.fire({
                title: "Congratulations!",
                text: "Center Details Submitted Successfully!!",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
              });
              console.log("response after post",response)
              // Reset form values after successful submission
              setCenterName("");
              setAddressLine("");

              setDistrict("");
              setState("");
              setPincode("");
              setCenterInchargeDetails([
                { centerInchargeName: "", mobileNumber: "", email: "" },
              ]);
              setOnRoll("");
              setThirdParty("");
              setTotalEmp("");

              // Uncomment these lines if needed
              // getData();
              // router.push("/admin/master-data/center-management");
            } else {
              Swal.fire(
                "Oops",
                response.data.message + "! Please enter another Center",
                "error"
              );
            }
          })
          .catch((error) => {
            console.log("post API Error => ", error);
            Swal.fire("Oops!", "Something Went Wrong!!", "error");
          });
      }
    }
  };

  return (
    <section className="p-10 font-body bg-white">
      <div className="border-b pb-2 uppercase  text-xl font-semibold">
        <h1>Center Details</h1>
      </div>
      <div>
        <div className="bg-white text-secondary">
          <div>
            <div className="rounded-md">
              <div className="mt-5">
                <div className="flex-1 me-2 my-2">
                  <label
                    htmlFor="center-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Center Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <HiBuildingOffice2 size={20} />
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
                    className="text-red-700"
                    style={{
                      fontSize: "12px",
                      fontWeight: "normal",
                    }}
                  >
                    {error.centerNameError}
                  </div>
                </div>
                <div className="flex-1 me-2 mt-4 my-2">
                  <label
                    htmlFor="productId"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <IoLocationOutline size={20} />
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
                        // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
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
                    className="text-red-700"
                    style={{
                      fontSize: "12px",
                      fontWeight: "normal",
                    }}
                  >
                    {error.addressLineError}
                  </div>
                </div>
                <div className="flex lg:flex-row md:flex-row flex-col mt-4 my-2">
                  <div className="flex-1 me-2 mt-4 lg:mt-0">
                    <label
                      htmlFor="productId"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      District <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <IoLocationOutline size={20} />
                        </span>
                      </div>
                      <select
                        name="activityName"
                        id="activityName"
                        className={
                          `
                          ${
                            error.districtError
                              ? "stdSelectField"
                              : "stdSelectField"
                          } ${district ? "text-black" : "text-gray-400"}
`
                          // ? "h-9 block text-black bg-white rounded-md border-0 py-2.5 sm:py-2.5 pl-12 w-full ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs lg:text-xs"
                          // : "h-9 block text-black bg-white rounded-md border-0 py-2.5 sm:py-2.5 pl-12 w-full ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs lg:text-xs"
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
                          className="text-gray-500"
                        >
                          Select District
                        </option>
                        {districtList.map((district, index) => (
                          <option
                            className="text-black"
                            key={index}
                            value={district}
                          >
                            {district}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="text-red-700"
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
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      State <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <IoLocationOutline size={20} />
                        </span>
                      </div>
                      <select
                        name="activityName"
                        id="activityName"
                        className={`
                         ${
                           error.stateError
                             ? "stdSelectField"
                             : "stdSelectField"
                         } ${state ? "text-black" : "text-gray-400"}
                        `}
                        // ? "h-9 block bg-white text-black  rounded-md border-0 py-2.5 sm:py-2.5 pl-12 w-full ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs lg:text-xs"
                        // : "h-9 block bg-white text-black rounded-md border-0 py-2.5 sm:py-2.5 pl-12 w-full ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs lg:text-xs"

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
                          <option className="text-black" value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="text-red-700"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.stateError}
                    </div>
                  </div>
                  <div className="flex-1 me-2 mt-4 lg:mt-0">
                    <label
                      htmlFor="productId"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <Md123 size={20} />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="productId"
                        id="productId"
                        maxLength={6}
                        value={pincode}
                        className={
                          error.pincodeError ? "stdInputField" : "stdInputField"
                          // ? "block h-9  rounded-md border-0 py-1.5 pl-12 w-full    text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9  rounded-md border-0 py-1.5 pl-12 w-full    text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
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
                      className="text-red-700"
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

          <div className="flex my-5 mt-10">
            <div className="text-lg me-5">Center Incharge Details</div>
            <button
              className="w-16 h-7 bg-site text-white rounded text-sm text-center content-center hover:bg-blue-800 active:scale-75"
              type="submit"
              onClick={inputExtendHandler}
            >
              + Add
            </button>
          </div>

          {centerInchargeDetails.map((obj, key) => (
            <div key={key} className="md:flex lg:flex justify-between my-2">
              <div className="flex-1 me-3">
                <label
                  htmlFor="productId"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Name
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <IoPersonCircleOutline size={20} />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="productId"
                    id="productId"
                    // value={props.center_id ? centerInchargeDetails.centerInchargeName : obj.centerInchargeName}
                    value={obj.centerInchargeName}
                    className="stdInputField"
                    // className="block h-9  rounded-md border-0 py-1.5 pl-12 w-full    text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Enter Center Incharge Name"
                    onChange={(e) => {
                      const newDetails = [...centerInchargeDetails];
                      newDetails[key].centerInchargeName = e.target.value;
                      setCenterInchargeDetails(newDetails);
                      setError((prevState) => ({
                        ...prevState,
                        centerNameError: "",
                      }));
                    }}
                  />
                </div>
                <div
                  className="text-red-700"
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
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Mobile
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <FaMobileAlt size={20} />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="productId"
                    maxLength={10}
                    id="productId"
                    // value={props.center_id ? centerInchargeDetails.mobileNumber : obj.mobileNumber}
                    value={obj.mobileNumber}
                    className="stdInputField"
                    // className="block h-9  rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Enter Mobile Number"
                    onChange={(e) => {
                      const newDetails = [...centerInchargeDetails];
                      newDetails[key].mobileNumber = e.target.value;
                      setCenterInchargeDetails(newDetails);
                      setError((prevState) => ({
                        ...prevState,
                        mobileNumberError: "",
                      }));
                    }}
                  />
                </div>
                <div
                  className="text-red-700"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {error.mobileNumberError}
                </div>
              </div>
              <div className="flex-1 me-3 mt-4 lg:mt-0">
                <label
                  htmlFor="productId"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <MdOutlineEmail size={20} />
                    </span>
                  </div>
                  <input
                    type="email"
                    name="productId"
                    id="productId"
                    // value={props.center_id ? centerInchargeDetails.email: obj.email}
                    value={obj.email}
                    className="stdInputField"
                    // className="block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Enter Email"
                    onChange={(e) => {
                      const newDetails = [...centerInchargeDetails];
                      newDetails[key].email = e.target.value;
                      setCenterInchargeDetails(newDetails);
                      setError((prevState) => ({
                        ...prevState,
                        emailError: "",
                      }));
                    }}
                  />
                </div>
                <div
                  className="text-red-700"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {error.emailError}
                </div>
              </div>
              {centerInchargeDetails.length > 1 && key >= 1 ? (
                <div>
                  <RiDeleteBin6Line
                    className={`${
                      centerInchargeDetails.length > 1 && "w-10"
                    } mt-10 text-red-500 hover:text-red-700 active:scale-75 cursor-pointer`}
                    size={20}
                    onClick={inputReduceHandler}
                  />
                </div>
              ) : (
                <div>
                  <div
                    className={`${
                      centerInchargeDetails.length > 1 && "w-10"
                    } mt-10`}
                  ></div>
                </div>
              )}
            </div>
          ))}
          <div className="text-lg me-5 mt-10">Number of Employees</div>
          <div className="flex lg:flex-row md:flex-row flex-col mt-4 my-2">
            <div className="flex-1 me-2 mt-4 lg:mt-0">
              <label
                htmlFor="onRoll"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                On Roll Employee <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                    <IoLocationOutline size={20} />
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
                className="text-red-700"
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
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                3 rd Party Employee <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                    <IoLocationOutline size={20} />
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
                className="text-red-700"
                style={{
                  fontSize: "12px",
                  fontWeight: "normal",
                }}
              >
                {error.thirdPartyError}
              </div>
            </div>
            <div className="flex-1 me-2 mt-4 lg:mt-0">
              <label
                htmlFor="totalEmp"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Total Employees <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                    <Md123 size={20} />
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
                className="text-red-700"
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
              className="formButtons me-2"
              onClick={handleSubmit}
            >
              {params._id ? "Update" : "Submit"}
            </button>
          </div>
        </div>

        <GenericTable
          tableObjects={tableObjects}
          tableHeading={tableHeading}
          runCount={runCount}
        />
      </div>
    </section>
  );
};

export default CenterManagement;
