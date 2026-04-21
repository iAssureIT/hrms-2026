"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Modal, Tooltip } from "flowbite-react";
import { MdClose } from "react-icons/md";
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
import GenericTable from "@/widgets/GenericTable/FilterTable";
import { CiViewList } from "react-icons/ci";
import { FaSpinner } from "react-icons/fa6";

const CenterManagement = (props) => {
  const [centerName, setCenterName] = useState("");

  const [centerInchargeName, setCenterInchargeName] = useState("");
  const [centerInchargeMobileNumber, setCenterInchargeMobileNumber] =
    useState("");
  const [centerInchargeEmail, setCenterInchargeEmail] = useState("");

  const [seniorManagerName, setSeniorManagerName] = useState("");
  const [seniorManagerMobileNumber, setSeniorManagerMobileNumber] =
    useState("");
  const [seniorManagerEmail, setSeniorManagerEmail] = useState("");

  const [accountPersonName, setAccountPersonName] = useState("");
  const [accountPersonMobileNumber, setAccountPersonMobileNumber] =
    useState("");
  const [accountPersonEmail, setAccountPersonEmail] = useState("");

  const [CenterInchargeList, setCenterInchargeList] = useState([]);
  const [SeniorManagerList, setSeniorManagerList] = useState([]);
  const [AccountPersonList, setAccountPersonList] = useState([]);

  const [user_id, setUser_id] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const router = useRouter();
  const params = useParams();

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
      axios.get("/api/centers/get/one/" + params._id).then((centerData) => {
        setCenterName(centerData?.data[0]?.centerName);

        setCenterInchargeName(centerData?.data[0]?.centerInchargeDetails?.Name);
        setCenterInchargeMobileNumber(
          centerData?.data[0]?.centerInchargeDetails?.mobileNumber
        );
        setCenterInchargeEmail(
          centerData?.data[0]?.centerInchargeDetails?.email
        );

        setSeniorManagerName(centerData?.data[0]?.seniorManagerDetails?.Name);
        setSeniorManagerMobileNumber(
          centerData?.data[0]?.seniorManagerDetails?.mobileNumber
        );
        setSeniorManagerEmail(centerData?.data[0]?.seniorManagerDetails?.email);

        setAccountPersonName(centerData?.data[0]?.accountPersonDetails?.Name);
        setAccountPersonMobileNumber(
          centerData?.data[0]?.accountPersonDetails?.mobileNumber
        );
        setAccountPersonEmail(centerData?.data[0]?.accountPersonDetails?.email);
      });
    }
  }, []);

  useEffect(() => {
    getCenterInchargeList();
    getSeniorManagerList();
    getAccountPersonList();
  }, []);

  const getCenterInchargeList = () => {
    axios
      .post("/api/users/get/list/center")
      .then((response) => {
        const CenterInchargeList = response.data;
        setCenterInchargeList(CenterInchargeList);
        if (response.data.length === 0) {
          error.centerInchargeNameError =
            "No Users added in User Management for this center";
        }
      })
      .catch((error) => {
        console.log("Error while getting CenterInchargeList => ", error);
      });
  };

  const handleCenterInchargeChange = (e) => {
    const selectedIncharge = CenterInchargeList.find(
      (incharge) => incharge.name === e.target.value
    );
    if (selectedIncharge) {
      setCenterInchargeName(e.target.value);
      setCenterInchargeMobileNumber(selectedIncharge.mobile);
      setCenterInchargeEmail(selectedIncharge.email);
      setError((prevState) => ({
        ...prevState,
        centerInchargeNameError: "",
      }));
    }
  };

  const getSeniorManagerList = () => {
    axios
      .post("/api/users/get/list/user/seniorManager")
      .then((response) => {
        const SeniorManagerList = response.data;
        setSeniorManagerList(SeniorManagerList);
        if (response.data.length === 0) {
          error.seniorManagerNameError =
            "No Users added in User Management for this center";
        }
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
      setSeniorManagerName(e.target.value);
      setSeniorManagerMobileNumber(selectedManager.mobile);
      setSeniorManagerEmail(selectedManager.email);
      setError((prevState) => ({
        ...prevState,
        seniorManagerNameError: "",
      }));
    }
  };

  const getAccountPersonList = () => {
    axios
      .post("/api/users/get/list/user/accountPerson")
      .then((response) => {
        const AccountPersonList = response.data;
        setAccountPersonList(AccountPersonList);
        if (response.data.length === 0) {
          error.accountPersonError =
            "No Users added in User Management for this center";
        }
      })
      .catch((error) => {
        console.log("Error while getting AccountPersonList => ", error);
      });
  };

  const handleAccountPersonChange = (e) => {
    const selectedPerson = AccountPersonList.find(
      (person) => person.name === e.target.value
    );
    if (selectedPerson) {
      setAccountPersonName(e.target.value);
      setAccountPersonMobileNumber(selectedPerson.mobile);
      setAccountPersonEmail(selectedPerson.email);
      setError((prevState) => ({
        ...prevState,
        accountPersonNameError: "",
      }));
    }
  };

  // validation for form values
  const validation = () => {
    const errorMsg = {};
    let inputIsValid = true;
    if (validator.isEmpty(centerInchargeName)) {
      inputIsValid = false;
      errorMsg.centerInchargeNameError = "This field is required.";
      setError(errorMsg);
    }
    if (validator.isEmpty(seniorManagerName)) {
      inputIsValid = false;
      errorMsg.seniorManagerNameError = "This field is required.";
      setError(errorMsg);
    }
    // if (validator.isEmpty(accountPersonName)) {
    //   inputIsValid = false;
    //   errorMsg.accountPersonNameError = "This field is required.";
    //   setError(errorMsg);
    // }
    return inputIsValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validation()) {
      let formValues = {
        center_ID: params._id,
        centerInchargeName: centerInchargeName,
        centerInchargeMobileNumber: centerInchargeMobileNumber,
        centerInchargeEmail: centerInchargeEmail,
        seniorManagerName: seniorManagerName,
        seniorManagerMobileNumber: seniorManagerMobileNumber,
        seniorManagerEmail: seniorManagerEmail,
        accountPersonName: accountPersonName,
        accountPersonMobileNumber: accountPersonMobileNumber,
        accountPersonEmail: accountPersonEmail,
        user_id,
      };

      formValues.center_ID = params._id;
      axios
        .patch("/api/centers/patch/add-center-incharge", formValues)
        .then((updatedProduct) => {
          if (updatedProduct.data.success) {
            setLoading(true);
            Swal.fire(" ", "Center Incharge details added successfully!!");
            router.push(
              "/admin/master-data/center-details/center-details-list"
            );
          } else {
            Swal.fire(" ", "Center details was not changed hence no update!!");
          }
        })
        .catch((error) => {
          console.log("API Error => ", error);
          Swal.fire(" ", "Something went wrong! <br/>" + error.message);
        });
    }
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Center Details</h1>
            <div className="flex gap-3 my-6 me-10">
              <Tooltip
                content="Center Details List"
                placement="bottom"
                className="bg-[#3c8dbc]"
                arrow={false}
              >
                {loading2 ? (
                  <FaSpinner className="animate-spin inline-flex mx-2 text-[#367fa9]" />
                ) : (
                  <CiViewList
                    className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-0.5 hover:border-[#367fa9] rounded text-[30px]"
                    onClick={() => {
                      window.open(
                        "/admin/master-data/center-details/center-details-list",
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
        <div className="px-10 py-6">
          <div className="bg-white text-secondary ">
            <div>
              <h2>
                Please provide Center Incharge & Sr. Manager Details for{" "}
                <big>
                  <span className="text-[#3c8dbc] underline">
                    {" "}
                    {centerName ? (
                      centerName
                    ) : (
                      <FaSpinner className="animate-spin inline-flex mx-2 text-[#3c8dbc]" />
                    )}{" "}
                    Center.
                  </span>
                </big>{" "}
              </h2>
            </div>

            <div className="flex mb-5 mt-10">
              <div className="subHeading">Center Incharge Details</div>
            </div>
            <div className="md:flex lg:flex justify-between mb-2">
              <div className="flex-1 me-3">
                <label htmlFor="centerInchargeName" className="inputLabel">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <IoPersonCircleOutline className="icon" />
                    </span>
                  </div>
                  <select
                    name="centerInchargeName"
                    id="centerInchargeName"
                    className={`stdSelectField ${centerInchargeName
                        ? "text-black "
                        : "text-gray-400 font-normal"
                      }`}
                    value={centerInchargeName}
                    onChange={handleCenterInchargeChange}
                  >
                    <option value="" className="text-gray-400">
                      -- Select Center Incharge --
                    </option>
                    {CenterInchargeList.map((data, i) => (
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
                  {error.centerInchargeNameError}
                </div>
              </div>
              <div className="flex-1 me-3 mt-4 lg:mt-0">
                <label
                  htmlFor="centerInchargeMobileNumber"
                  className="inputLabel"
                >
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
                    name="centerInchargeMobileNumber"
                    maxLength={10}
                    id="centerInchargeMobileNumber"
                    disabled
                    value={centerInchargeMobileNumber}
                    className="stdInputField bg-gray-100"
                    placeholder="Mobile Number"
                  />
                </div>
              </div>
              <div className="flex-1 mt-4 lg:mt-0">
                <label htmlFor="centerInchargeEmail" className="inputLabel">
                  Email
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <MdOutlineEmail className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="centerInchargeEmail"
                    id="centerInchargeEmail"
                    value={centerInchargeEmail}
                    className="stdInputField bg-gray-100"
                    disabled
                    placeholder="centerInchargeEmail"
                  />
                </div>
              </div>
            </div>

            <div className="flex my-5 mt-10">
              <div className="subHeading">Senior Manager Details</div>
            </div>

            <div className="md:flex lg:flex justify-between my-2">
              <div className="flex-1 me-3">
                <label htmlFor="seniorManagerName" className="inputLabel">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <IoPersonCircleOutline className="icon" />
                    </span>
                  </div>
                  <select
                    name="seniorManagerName"
                    id="seniorManagerName"
                    className={`stdSelectField ${seniorManagerName
                        ? "text-black "
                        : "text-gray-400 font-normal"
                      }`}
                    value={seniorManagerName}
                    onChange={handleSeniorManagerChange}
                  >
                    <option value="" className="text-gray-400">
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
                  {error.seniorManagerNameError}
                </div>
              </div>
              <div className="flex-1 me-3 mt-4 lg:mt-0">
                <label
                  htmlFor="centerInchargeMobileNumber"
                  className="inputLabel"
                >
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
                    name="centerInchargeMobileNumber"
                    maxLength={10}
                    id="centerInchargeMobileNumber"
                    disabled
                    value={seniorManagerMobileNumber}
                    className="stdInputField bg-gray-100"
                    placeholder="Mobile Number"
                  />
                </div>
              </div>
              <div className="flex-1 mt-4 lg:mt-0">
                <label htmlFor="seniorManagerEmail" className="inputLabel">
                  Email
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <MdOutlineEmail className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="seniorManagerEmail"
                    id="seniorManagerEmail"
                    value={seniorManagerEmail}
                    className="stdInputField bg-gray-100"
                    disabled
                    placeholder="Sr Manager Email"
                  />
                </div>
              </div>
            </div>

            <div className="flex my-5 mt-10">
              <div className="subHeading">Account Person Details</div>
            </div>

            <div className="md:flex lg:flex justify-between my-2">
              <div className="flex-1 me-3">
                <label htmlFor="accountPersonName" className="inputLabel">
                  Name
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <IoPersonCircleOutline className="icon" />
                    </span>
                  </div>
                  <select
                    name="accountPersonName"
                    id="accountPersonName"
                    className={`stdSelectField ${accountPersonName
                        ? "text-black "
                        : "text-gray-400 font-normal"
                      }`}
                    value={accountPersonName}
                    onChange={handleAccountPersonChange}
                  >
                    <option value="" className="text-gray-400">
                      -- Select Account Person --
                    </option>
                    {AccountPersonList.map((data, i) => (
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
                  {error.accountPersonNameError}
                </div>
              </div>
              <div className="flex-1 me-3 mt-4 lg:mt-0">
                <label
                  htmlFor="centerInchargeMobileNumber"
                  className="inputLabel"
                >
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
                    name="accountPersonMobileNumber"
                    maxLength={10}
                    id="accountPersonMobileNumber"
                    disabled
                    value={accountPersonMobileNumber}
                    className="stdInputField bg-gray-100"
                    placeholder="Mobile Number"
                  />
                </div>
              </div>
              <div className="flex-1 mt-4 lg:mt-0">
                <label htmlFor="accountPersonEmail" className="inputLabel">
                  Email
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <MdOutlineEmail className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="accountPersonEmail"
                    id="accountPersonEmail"
                    value={accountPersonEmail}
                    className="stdInputField bg-gray-100"
                    disabled
                    placeholder="Account Person Email"
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
                {loading ? (
                  <span>
                    Submit
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                  </span>
                ) : (
                  "Submit"
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
