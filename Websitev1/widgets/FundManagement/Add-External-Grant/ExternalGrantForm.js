"use client";

import { useState, useEffect } from "react";
import validator from "validator";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";

import { GoProjectRoadmap } from "react-icons/go";
import { RxActivityLog } from "react-icons/rx";
import { FaCalendarAlt, FaFileUpload, FaSpinner } from "react-icons/fa";
import { Md123 } from "react-icons/md";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { CiBank, CiViewList } from "react-icons/ci";
import { GrMoney } from "react-icons/gr";
import moment from "moment";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";

const fundTypeList = ["External Grant", "Community Contribution"];
const paymentTypeList = ["Cash", "UPI", "Online E-Mitra"];
const lhwrfBankNameList = ["SBI", "Kotak Mahindra Bank", "Bank  of Baroda"];
const branchList = ["Nashik", "Pune", "Mumbai"];
const accNumberList = ["55115151455", "34844745412", "87494211245"];

const AddExternalGrant = () => {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  // console.log("userDetails  =>", userDetails);

  // const [fundType, setFundType] = useState("");
  // const [paymentType, setPaymentType] = useState("");
  const [centerName, setCenterName] = useState("");
  const [center_id, setCenter_id] = useState("");
  const [program, setProgram] = useState("");
  const [program_id, setProgram_id] = useState("");
  const [project, setProject] = useState("");
  const [project_id, setProject_id] = useState("");
  const [activityName, setActivityName] = useState("");
  const [activityName_id, setActivityName_id] = useState(null);
  const [subactivityName_id, setSubActivityName_id] = useState(null);
  const [subactivityName, setSubActivityName] = useState("");
  const [fundingAgencyName, setFundingAgencyName] = useState("");
  // const [fundReceiptNumber, setFundReceiptNumber] = useState("");
  const [amountReceivedDate, setAmountReceivedDate] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [plainAmountReceived, setPlainAmountReceived] = useState("");
  // const [depositSlipNumber, setDepositSlipNumber] = useState("");
  const [utrTransactionNumber, setUtrTransactionNumber] = useState("");
  const [bank_id, setBank_id] = useState([]);
  const [lhwrfBankName, setLhwrfBankName] = useState("");
  const [lhwrfBranchName, setLhwrfBranchName] = useState("");
  const [lhwrfAccountNumber, setLhwrfAccountNumber] = useState("");
  const [centerNameList, setCenterNameList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [ActivityNameList, setActivityNameList] = useState([]);
  const [SubActivityNameList, setSubActivityNameList] = useState([]);
  const [bankDataList, setBankDataList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [accNumberList, setAccNumberList] = useState([]);
  const [branchIndex, setBranchIndex] = useState("");
  const [user_id, setUser_id] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const router = useRouter();
  const params = useParams();

  const button = params._id ? "Update" : "Submit";

  const getCurrentDate = () => {
    return moment().format("YYYY-MM-DD");
  };

  useEffect(() => {
    setUser_id(userDetails?.user_id);
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
      setCenter_id("all");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
      setCenter_id(userDetails.center_id);
    }

    const currentDate = getCurrentDate();
    setAmountReceivedDate(currentDate);

    getCenterNameList();
    getProgramList();
    getBankList();
  }, []);

  useEffect(() => {
    getProjectList();
  }, [program_id]);

  useEffect(() => {
    if (program_id && project_id) {
      getActivityNameList(program_id, project_id);
    }
  }, [project_id]);

  const getBankList = () => {
    axios
      .get("/api/bank-details/list")
      .then((response) => {
        // setBankDataList(response.data);

        // response.data.filter((bank, index) => {
        //   const bankID = bank._id;
        //   if (bank !== bank_id) {
        //     setBankDataList(response.data);
        //   }
        //   console.log(bankID);
        // })
        const bankMap = new Map();

        response.data.forEach((bank) => {
          const { bankName, _id, branchName, bankAccountNumber } = bank;

          if (bankMap.has(bankName)) {
            const existingBank = bankMap.get(bankName);
            existingBank.ids.push(_id);
            existingBank.branches.push(branchName);
            existingBank.accountNumbers.push(bankAccountNumber);
          } else {
            bankMap.set(bankName, {
              ids: [_id],
              branches: [branchName],
              accountNumbers: [bankAccountNumber],
            });
          }
        });

        const uniqueBankData = Array.from(bankMap.entries()).map(
          ([name, data]) => ({
            name,
            ids: data.ids,
            branches: [...new Set(data.branches)],
            accountNumbers: [...new Set(data.accountNumbers)],
          })
        );

        setBankDataList(uniqueBankData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (bank_id) {
      fetchBankBranches(bank_id);
      fetchBankAccountNos(bank_id);
    }
  }, [bank_id]);

  const fetchBankBranches = (selectedBankIds) => {
    // const selectedBranch = bankDataList.filter(
    //   (lhwrfBank) => lhwrfBank._id === bank_id
    // );
    const selectedBranches = bankDataList
      .filter((bank) => selectedBankIds.some((id) => bank.ids.includes(id)))
      .flatMap((bank) => bank.branches);

    if (selectedBranches) {
      setBranchList(selectedBranches);
    }

    setBranchIndex("");
    // selectedBranch.map((sb) => {
    //   console.log(sb.branchName);
    // });
  };

  const fetchBankAccountNos = (selectedBankIds) => {
    const selectedAccountNumbers = bankDataList
      .filter((bank) => selectedBankIds.some((id) => bank.ids.includes(id)))
      .flatMap((bank) => bank.accountNumbers);

    setAccNumberList(selectedAccountNumbers);

    // const selectedBranch = bankDataList.map((data, i) => {
    //   let accountNumber;
    //   const fetchedAccNo = data.accountNumbers.filter((accNo, i) => {
    //     if (i === branchIndex) {
    //       accountNumber = accNo;
    //     }
    //   });
    //   return accountNumber;
    // });
    // console.log(selectedBranch);
    // setAccNumberList(selectedBranch);
    // const selectedBranchName =
    // selectedBranch.map((sb) => {
    //   console.log(sb.branchName);
    // });
  };

  const getProgramList = () => {
    axios
      .get("/api/programs/get")
      .then((response) => {
        const ProgramList = response.data;

        if (Array.isArray(ProgramList)) {
          setProgramList(
            ProgramList.sort((a, b) => {
              return a.fieldValue.localeCompare(b.fieldValue);
            })
          );
          if (ProgramList.length === 0) {
            error.programError = "Please add data in Masters";
          }
        } else {
          console.error("Expected data to be an array but got:", ProgramList);
          setProgramList([]);
        }
      })
      .catch((error) => {
        console.log("Error while gettProgramList List => ", error);
      });
  };

  const getProjectList = () => {
    if(program_id){
      axios
        .get("/api/subactivity-mapping/get/list/" + program_id)
        .then((response) => {
          const ProjectList = response.data;

          if (Array.isArray(ProjectList)) {
            setProjectList(
              ProjectList.sort((a, b) => {
                return a.field2Value.localeCompare(b.field2Value);
              })
            );
          } else {
            console.error("Expected data to be an array but got:", ProjectList);
            setProjectList([]);
          }
        })
        .catch((error) => {
          console.log("Error while gettProjectList List => ", error);
        });
    }
  };

  const getActivityNameList = async(program_id, project_id) => {
    
    console.log("getActivityNameList project_id", project_id);
    console.log("getActivityNameList program_id", program_id);
    if(program_id && project_id){
      axios
        .get("/api/subactivity-mapping/get/list/" + program_id + "/" + project_id)
        .then((response) => {
          const ActivityNameList = response.data;

          if (Array.isArray(ActivityNameList)) {
            setActivityNameList(
              ActivityNameList.sort((a, b) => {
                return a.field3Value.localeCompare(b.field3Value);
              })
            );
          } else {
            console.error(
              "Expected data to be an array but got:",
              ActivityNameList
            );
            setActivityNameList([]);
          }
        })
        .catch((error) => {
          console.log("Error while gettActivityNameList List => ", error);
        });
    }
  };

  const getCenterNameList = () => {
    axios
      .get("/api/centers/list")
      .then((response) => {
        const CenterNameList = response.data;

        if (Array.isArray(CenterNameList)) {
          setCenterNameList(
            CenterNameList.sort((a, b) => {
              return a.centerName.localeCompare(b.centerName);
            })
          );
        } else {
          console.error(
            "Expected data to be an array but got:",
            CenterNameList
          );
          setCenterNameList([]);
        }
      })
      .catch((error) => {
        console.log("Error while getting CenterName List => ", error);
      });
  };

  useEffect(() => {
    fetchSubActivities(activityName_id);
  }, [activityName_id]);

  const fetchSubActivities = async (activityName_id) => {
    try {
      if (program_id && project_id && activityName_id) {
        const response = await axios.get(
          "/api/subactivity-mapping/get/list/" +
            program_id +
            "/" +
            project_id +
            "/" +
            activityName_id
        );

        setSubActivityNameList(
          response.data.sort((a, b) => {
            return a.inputValue.localeCompare(b.inputValue);
          })
        );
      }
    } catch (error) {
      console.error("Error fetching subactivities:", error);
    }
  };

  useEffect(() => {
    if (params._id) {
      axios
        .get("/api/fund-receipts/get/one/" + params._id)
        .then(async (response) => {
          console.log("response.data[0]",response.data[0]);
          setCenterName(response.data[0].centerName);
          setCenter_id(response.data[0].center_id);
          setProgram(response.data[0].program);
          setProgram_id(response.data[0].program_id);
          setProject(response.data[0].project);
          setProject_id(response.data[0].project_id);
          setActivityName(response.data[0].activityName);
          setActivityName_id(response.data[0].activityName_id);
          // setSubActivityName(response.data[0].subactivityName);
          // setSubActivityName_id(response.data[0].subactivityName_id);
          setFundingAgencyName(response.data[0].fundingAgencyName);
          // setFundReceiptNumber(response.data[0].fundReceiptNumber);
          setAmountReceivedDate(response.data[0].amountReceivedDate);
          setAmountReceived(
            formatNumberWithCommas(response.data[0].amountReceived)
          );
          setPlainAmountReceived(response.data[0].amountReceived);
          setUtrTransactionNumber(response.data[0].utrTransactionNumber);
          setBank_id(response.data[0].bank_id);
          setLhwrfBankName(response.data[0].lhwrfBankName);
          setLhwrfBranchName(response.data[0].lhwrfBranchName);
          setLhwrfAccountNumber(response.data[0].lhwrfAccountNumber);

          await fetchSubActivities(response.data[0].activityName_id);

          // Set the subactivity name and ID after fetching subactivities
          setSubActivityName(response.data[0].subactivityName);
          setSubActivityName_id(response.data[0].subactivityName_id);
        })
        .catch((error) => {
          console.log("Error Message => ", error);
          Swal.fire(" ", "Something went wrong");
        });
    }
  }, []);

  const validation = () => {
    const errorMsg = {};
    let inputIsValid = true;

    if (loggedInRole === "admin") {
      if (validator.isEmpty(centerName)) {
        inputIsValid = false;
        errorMsg.centerNameError = "This field is required.";
      }
    }

    if (validator.isEmpty(program)) {
      inputIsValid = false;
      errorMsg.programError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(project)) {
      inputIsValid = false;
      errorMsg.projectError = "This field is required.";
      setError(errorMsg);
    }

    if (
      validator.isEmpty(fundingAgencyName.replace(/\s/g, ""))
      // fundType !== "Community Contribution"
    ) {
      inputIsValid = false;
      errorMsg.fundingAgencyNameError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isAlpha(fundingAgencyName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.fundingAgencyNameError = "Only alphabets allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(amountReceivedDate)) {
      inputIsValid = false;
      errorMsg.amountReceivedDateError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(plainAmountReceived.toString())) {
      inputIsValid = false;
      errorMsg.amountReceivedError = "This field is required.";
      setError(errorMsg);
    } else if (validator.isAlpha(plainAmountReceived.toString())) {
      inputIsValid = false;
      errorMsg.amountReceivedError = "Only numerics allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(utrTransactionNumber.toString())) {
      inputIsValid = false;
      errorMsg.utrTransactionNumberError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(lhwrfBankName)) {
      inputIsValid = false;
      errorMsg.lhwrfBankNameError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(lhwrfBranchName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.lhwrfBranchNameError = "This field is required.";
      setError(errorMsg);
    }

    const bankAccountNumberRegex = new RegExp(/^[0-9]{9,18}$/);

    if (validator.isEmpty(lhwrfAccountNumber.toString())) {
      inputIsValid = false;
      errorMsg.lhwrfAccountNumberError = "This field is required.";
      setError(errorMsg);
    }

    console.log("inputIsValid in Validation => ", inputIsValid);

    return inputIsValid;
  };

  useEffect(() => {
    console.log("Error in Validation => ", error);
  }, [error]);

  const handleActivityChange = async (e) => {
    const [activityName_id, activityName] = e.target.value.split("|");
    setActivityName(activityName);
    setActivityName_id(activityName_id);
    setError((prevState) => ({
      ...prevState,
      activityNameError: "",
    }));

    // Fetch subactivities for the selected activity
    await fetchSubActivities(activityName_id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Inside handleSubmit");
    if (validation()) {
      console.log("When Validation is Successful!");

      let formValues = {
        fundType: "External Grant",
        center_id: center_id ? center_id : userDetails.center_id,
        centerName: centerName ? centerName : userDetails.centerName,
        program_id,
        program,
        project_id,
        project,
        activityName_id: activityName_id,
        activityName: activityName ? activityName : "--NA--",
        subactivityName_id: subactivityName_id,
        subactivityName: subactivityName ? subactivityName : "--NA--",
        fundingAgencyName,
        // fundReceiptNumber,
        amountReceivedDate,
        amountReceived: plainAmountReceived,
        utrTransactionNumber,
        bank_id,
        lhwrfBankName,
        lhwrfBranchName,
        lhwrfAccountNumber,
        user_id,
      };

      if (params._id) {
        //==== This is Update case ====

        formValues.ID = params._id;
        axios
          .patch("/api/fund-receipts/patch", formValues)
          .then((updatedFund) => {
            if (updatedFund.data) {
              if (updatedFund.data.data.modifiedCount > 0) {
                Swal.fire(" ", "External grant updated successfully!!");
                setLoading3(true);
                router.push(
                  "/" + loggedInRole + "/fund-management/external-grant-list"
                );
              } else {
                Swal.fire(
                  " ",
                  "External grant details were not changed hence no update!!"
                );
              }
            }
          })
          .catch((error) => {
            console.log("API Error => ", error);
            Swal.fire(" ", "Something went wrong!!");
          });
      } else {
        // API for posting the data
        const response = axios
          .post("/api/fund-receipts/post", formValues)
          .then((response) => {
            console.log("Inside then of external grant");
            if (response.data.success) {
              let ID = response.data.insertedLevel._id;

              // Swal popup
              Swal.fire({
                title: " ",
                text: "External grant details submitted successfully!!",
              });
              setLoading3(true);
              router.push(
                "/" + loggedInRole + "/fund-management/external-grant-list"
              );
              // getData();
            } else {
              Swal.fire(" ", response.data.message);
            }
          })
          .catch((error) => {
            Swal.fire(" ", "Something went wrong!!");
          });

        console.log("api call ", response);
      }
    } else {
      console.log("error => ", error);
    }
  };

  // let nonDuplicateBankNames = [];

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

  const handleAmountReceivedChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      setPlainAmountReceived(value); // Update plain numeric value
      setAmountReceived(formatNumberWithCommas(value)); // Update displayed value

      setError((prevState) => ({
        ...prevState,
        unitCostError: "",
      }));
    }
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Add External Grant</h1>

            {loggedInRole === "admin" || loggedInRole === "center" ? (
              <div className="flex gap-3 my-6 me-10">
                <Tooltip
                  content="Bulk Upload"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                  ) : (
                    <FaFileUpload
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      // onClick={() => {
                      //   setLoading(true);
                      //   router.push(
                      //     "/" +
                      //       loggedInRole +
                      //       "/fund-management/add-external-grant/bulk-upload"
                      //   );
                      // }}                                         
                      onClick={() => {
                        window.open(
                          "/" + loggedInRole + "/fund-management/add-external-grant/bulk-upload",
                          '_self'
                          // "noopener,noreferrer"
                        );
                      }}
                    />
                  )}
                </Tooltip>
                <Tooltip
                  content="External Grant List"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  {loading2 ? (
                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                  ) : (
                    <CiViewList
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      // onClick={() => {
                      //   setLoading2(true);
                      //   router.push(
                      //     "/" +
                      //       loggedInRole +
                      //       "/fund-management/external-grant-list"
                      //   );
                      // }}
                      onClick={() => {
                        window.open(
                          "/" + loggedInRole + "/fund-management/external-grant-list",
                          '_self'
                          // "noopener,noreferrer"
                        );
                      }}
                    />
                  )}
                </Tooltip>
              </div>
            ) : null}
          </div>
        </div>
        <div className="px-10 py-6">
          <div className="bg-white text-secondary">
            <div>
              <div className="rounded-md">
                <div className="w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                  {/* <div className="flex lg:flex-row md:flex-row flex-col my-4 w-full lg:w-1/4"> */}
                  {loggedInRole === "admin" ? (
                    <div className="flex-1 lg:me-3 mt-5 lg:mt-0">
                      <label htmlFor="centerName" className="inputLabel">
                        Center Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                            <GoProjectRoadmap className="icon" />
                          </span>
                        </div>
                        <select
                          name="centerName"
                          id="centerName"
                          className={`
          ${error.centerNameError ? "stdSelectField" : "stdSelectField"} ${
                            centerName ? "text-black" : "text-gray-400"
                          }
        `}
                          value={center_id ? `${center_id}|${centerName}` : ""}
                          // value={centerName}
                          onChange={(e) => {
                            const [center_id, centerName] =
                              e.target.value.split("|");
                            setCenterName(centerName);
                            setCenter_id(center_id);
                            setError((prevState) => ({
                              ...prevState,
                              centerNameError: "",
                            }));
                          }}
                        >
                          <option value="" className="text-gray-400">
                            Select Center
                          </option>
                          {centerNameList?.map((center, i) => (
                            <option
                              className="text-black"
                              key={i}
                              value={`${center._id}|${center.centerName}`}
                            >
                              {center.centerName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div
                        className="text-red-500"
                        style={{ fontSize: "12px", fontWeight: "normal" }}
                      >
                        {error.centerNameError}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="flex lg:flex-row md:flex-row flex-col my-4">
                  <div className="flex-1 lg:me-4 lg:mt-2">
                    <label htmlFor="program" className="inputLabel">
                      Program <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <GoProjectRoadmap className="icon" />
                        </span>
                      </div>
                      <select
                        name="program"
                        id="program"
                        className={`
        ${error.programError ? "stdSelectField" : "stdSelectField"}
        ${program ? "text-black" : "text-gray-400"}
      `}
                        value={program_id ? `${program_id}|${program}` : ""}
                        onChange={(e) => {
                          const [program_id, program] =
                            e.target.value.split("|");

                          setProgram(program);
                          setProgram_id(program_id);
                          setError((prevState) => ({
                            ...prevState,
                            programError: "",
                          }));
                        }}
                        disabled={!!params._id && !!program_id}
                      >
                        <option value="" disabled className="text-gray-400">
                          Select Program
                        </option>
                        {programList?.map((program, i) => {
                          return (
                            <option
                              className="text-black"
                              key={i}
                              value={`${program._id}|${program.fieldValue}`}
                            >
                              {program.fieldValue}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.programError}
                    </div>
                  </div>

                  <div className="flex-1 lg:me-4 mt-4 lg:mt-2">
                    <label htmlFor="project" className="inputLabel">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <GoProjectRoadmap className="icon" />
                        </span>
                      </div>
                      <select
                        name="project"
                        id="project"
                        className={`
        ${error.projectError ? "stdSelectField" : "stdSelectField"}
        ${project ? "text-black" : "text-gray-400"}
      `}
                        value={project_id ? `${project_id}|${project}` : ""}
                        onChange={(e) => {
                          const [project_id, project] =
                            e.target.value.split("|");

                          setProject(project);
                          setProject_id(project_id);
                          setError((prevState) => ({
                            ...prevState,
                            projectError: "",
                          }));
                        }}
                        disabled={!!params._id && !!project_id}
                      >
                        <option value="" className="text-gray-400">
                          Select Project
                        </option>
                        {projectList?.map((project, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={`${project.field2_id}|${project.field2Value}`}
                          >
                            {project.field2Value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.projectError}
                    </div>
                  </div>
                  <div className="flex-1 lg:me-4 mt-4 lg:mt-2">
                    <label htmlFor="activityName" className="inputLabel">
                      Activity
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <RxActivityLog className="icon" />
                        </span>
                      </div>
                      <select
                        name="activityName"
                        id="activityName"
                        className={`
        ${error.activityNameError ? "stdSelectField" : "stdSelectField"}
        ${activityName ? "text-black" : "text-gray-400"}
    `}
                        value={
                          activityName_id
                            ? `${activityName_id}|${activityName}`
                            : ""
                        }
                        onChange={handleActivityChange}
                        disabled={!!params._id && !!activityName_id}
                      >
                        <option value="" className="text-gray-400">
                          Select Activity
                        </option>
                        {ActivityNameList?.map((activity, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={`${activity.field3_id}|${activity.field3Value}`}
                          >
                            {activity.field3Value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.activityNameError}
                    </div>
                  </div>

                  <div className="flex-1 mt-4 lg:mt-2">
                    <label htmlFor="subactivityName" className="inputLabel">
                      Sub Activity
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <RxActivityLog className="icon" />
                        </span>
                      </div>
                      <select
                        name="subactivityName"
                        id="subactivityName"
                        className={`
                ${
                  error.subactivityNameError
                    ? "stdSelectField"
                    : "stdSelectField"
                }
                ${subactivityName ? "text-black" : "text-gray-400"}
            `}
                        value={
                          subactivityName_id
                            ? `${subactivityName_id}|${subactivityName}`
                            : null
                        }
                        onChange={(e) => {
                          const [subActivityName_id, subActivityName] =
                            e.target.value.split("|");

                          setSubActivityName(subActivityName);
                          setSubActivityName_id(subActivityName_id);
                          setError((prevState) => ({
                            ...prevState,
                            subactivityNameError: "",
                          }));
                        }}
                        disabled={!!params._id && !!subactivityName_id}
                      >
                        <option value="" className="text-gray-400">
                          Select Sub Activity
                        </option>
                        {Array.isArray(SubActivityNameList) &&
                          SubActivityNameList.map((subactivity, i) => (
                            <option
                              className="text-black"
                              key={i}
                              value={`${subactivity._id}|${subactivity.inputValue}`}
                            >
                              {subactivity.inputValue}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.subactivityNameError}
                    </div>
                  </div>
                </div>
                <div className="flex lg:flex-row md:flex-row flex-col mt-4">
                  {/* {fundType !== "Community Contribution" ? ( */}
                  <div className="flex-1 lg:me-4 lg:my-2">
                    <label htmlFor="center-name" className="inputLabel">
                      Funding Agency Name{" "}
                      <span className="text-red-500">*</span>
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
                        value={fundingAgencyName}
                        className={
                          error.fundingAgencyNameError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter Funding Agency Name"
                        onChange={(e) => {
                          setFundingAgencyName(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            fundingAgencyNameError: "",
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
                      {error.fundingAgencyNameError}
                    </div>
                  </div>
                  <div className="flex-1 lg:me-4 mt-4 lg:mt-2">
                    <label htmlFor="productId" className="inputLabel">
                      Amount Received Date{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <FaCalendarAlt className="icon" />
                        </span>
                      </div>
                      <input
                        type="date"
                        name="productId"
                        id="productId"
                        // max={moment().format("YYYY-MM-DD")}
                        max={getCurrentDate()}
                        value={amountReceivedDate}
                        className={
                          error.amountReceivedDateError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder=""
                        onChange={(e) => {
                          setAmountReceivedDate(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            amountReceivedDateError: "",
                          }));
                        }}
                        disabled={!!params._id}
                      />
                    </div>
                    <div
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.amountReceivedDateError}
                    </div>
                  </div>
                  <div className="flex-1 mt-4 lg:mt-2 lg:me-4">
                    <label htmlFor="productId" className="inputLabel">
                      Amount Received <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <FaIndianRupeeSign className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="productId"
                        id="productId"
                        value={amountReceived}
                        className={
                          error.amountReceivedError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter Grant Received"
                        // onChange={(e) => {
                        //   setAmountReceived(e.target.value);
                        //   setError((prevState) => ({
                        //     ...prevState,
                        //     amountReceivedError: "",
                        //   }));
                        // }}
                        onChange={handleAmountReceivedChange}
                      />
                    </div>
                    <div
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.amountReceivedError}
                    </div>
                  </div>

                  <div className="flex-1 mt-4 lg:mt-2">
                    <label htmlFor="productId" className="inputLabel">
                      UTR/Transaction No.{" "}
                      <span className="text-red-500">*</span>
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
                        value={utrTransactionNumber}
                        className={
                          error.utrTransactionNumberError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter UTR/Transaction No."
                        onChange={(e) => {
                          setUtrTransactionNumber(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            utrTransactionNumberError: "",
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
                      {error.utrTransactionNumberError}
                    </div>
                  </div>

                  {/* {fundType === "Community Contribution" ? (
                    <div className="flex-1 me-2 my-2">
                      <label
                        htmlFor="productId"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Deposit Slip No. <span className="text-red-500">*</span>
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
                          value={depositSlipNumber}
                          className={
                            error.depositSlipNumberError
                              ? "stdInputField"
                              : "stdInputField"
                            // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                            // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          }
                          placeholder="Enter Deposit Slip No."
                          onChange={(e) => {
                            setDepositSlipNumber(e.target.value);
                            setError((prevState) => ({
                              ...prevState,
                              depositSlipNumberError: "",
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
                        {error.depositSlipNumberError}
                      </div>
                    </div>
                  ) : (
                    ""
                  )} */}
                </div>
                <div className="flex lg:flex-row md:flex-row flex-col mt-4 lg:mt-3 w-full lg:w-3/4">
                  {/* {fundType === "Community Contribution" ? ( */}
                  <div className="flex-1 lg:me-4 mt-0 lg:mt-2">
                    <label htmlFor="center-name" className="inputLabel">
                      LHWRF Bank Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <CiBank className="icon" />
                        </span>
                      </div>
                      <select
                        name="subactivityName"
                        id="subactivityName"
                        className={`
                          ${
                            error.lhwrfBankNameError
                              ? "stdSelectField font-normal"
                              : "stdSelectField font-normal"
                          } ${lhwrfBankName ? "text-black" : "text-gray-400"}
                    `}
                        value={bank_id ? `${bank_id}|${lhwrfBankName}` : ""}
                        onChange={(e) => {
                          const [bankName_id, bankName] =
                            e.target.value.split("|");
                          const bankIds = bankName_id.split(",");
                          setBank_id(bankIds);
                          setLhwrfBankName(bankName);
                          setError((prevState) => ({
                            ...prevState,
                            lhwrfBankNameError: "",
                          }));
                        }}
                      >
                        <option value="" className="text-gray-400">
                          Select LHWRF Bank
                        </option>
                        {bankDataList?.map(
                          (lhwrfBank, i) => (
                            // lhwrfBank.ids.map((id, j) => (
                            <option
                              className="text-black"
                              key={i}
                              value={`${lhwrfBank.ids.join(",")}|${
                                lhwrfBank.name
                              }`}
                            >
                              {lhwrfBank.name}
                            </option>
                          )
                          // ))
                        )}
                      </select>
                    </div>
                    <div
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.lhwrfBranchNameError}
                    </div>
                  </div>

                  <div className="flex-1 lg:me-4 mt-4 lg:mt-2">
                    <label htmlFor="center-name" className="inputLabel">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <CiBank className="icon" />
                        </span>
                      </div>

                      <select
                        name="subactivityName"
                        id="subactivityName"
                        className={`
                          ${
                            error.lhwrfBranchNameError
                              ? "stdSelectField font-normal"
                              : "stdSelectField font-normal"
                          } ${lhwrfBranchName ? "text-black" : "text-gray-400"}
                    `}
                        value={
                          bank_id ? `${branchIndex}|${lhwrfBranchName}` : ""
                        }
                        onChange={(e) => {
                          const [branchIndex, branchName] =
                            e.target.value.split("|");
                          setBranchIndex(branchIndex);
                          setLhwrfBranchName(branchName);
                          setError((prevState) => ({
                            ...prevState,
                            lhwrfBranchNameError: "",
                          }));
                        }}
                      >
                        <option value="" className="text-gray-400">
                          Select Branch
                        </option>
                        {/* {branchList?.map((lhwrfBranchName, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={lhwrfBranchName}
                          >
                            {lhwrfBranchName}
                          </option>
                        ))} */}
                        {branchList.map((branch, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={`${i}|${branch}`}
                          >
                            {branch}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.lhwrfBranchNameError}
                    </div>
                  </div>

                  {/* <div className="flex-1 me-2 my-2">
                    <label
                      htmlFor="productId"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      LHWRF Branch Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <CiBank size={20} />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="productId"
                        id="productId"
                        value={lhwrflhwrfBranchName}
                        className={
                          error.lhwrflhwrfBranchNameError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter LHWRF Branch Name"
                        onChange={(e) => {
                          setLhwrflhwrfBranchName(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            lhwrflhwrfBranchNameError: "",
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
                      {error.lhwrflhwrfBranchNameError}
                    </div>
                  </div> */}

                  <div className="flex-1 mt-4 lg:mt-2 lg:me-1">
                    <label htmlFor="center-name" className="inputLabel">
                      Account No. <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <CiBank className="icon" />
                        </span>
                      </div>
                      <select
                        name="subactivityName"
                        id="subactivityName"
                        className={`
                          ${
                            error.lhwrfAccountNumberError
                              ? "stdSelectField"
                              : "stdSelectField"
                          } ${
                          lhwrfAccountNumber ? "text-black" : "text-gray-400"
                        }
                    `}
                        value={lhwrfAccountNumber}
                        onChange={(e) => {
                          setLhwrfAccountNumber(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            lhwrfAccountNumberError: "",
                          }));
                        }}
                      >
                        <option value="" className="text-gray-400">
                          Select Account No.
                        </option>
                        {/* {accNumberList?.map((lhwrfAccountNumber, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={lhwrfAccountNumber}
                          >
                            {lhwrfAccountNumber}
                          </option>
                        ))} */}
                        {/* {accNumberList.map((accNo, i) => ( */}
                        {branchIndex !== "" && (
                          <option
                            className="text-black"
                            key={branchIndex}
                            value={accNumberList[branchIndex]}
                          >
                            {accNumberList[branchIndex]}
                          </option>
                        )}
                      </select>
                    </div>
                    <div
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.lhwrfAccountNumberError}
                    </div>
                  </div>

                  {/* <div className="flex-1 me-2 my-2">
                    <label
                      htmlFor="productId"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Account No. <span className="text-red-500">*</span>
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
                        maxLength={18}
                        value={lhwrflhwrfAccountNumber}
                        className={
                          error.lhwrflhwrfAccountNumberError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter LHWRF Account No."
                        onChange={(e) => {
                          setLhwrflhwrfAccountNumber(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            lhwrflhwrfAccountNumberError: "",
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
                      {error.lhwrflhwrfAccountNumberError}
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* <div className="flex justify-end">
            <button
              type="submit"
              onClick={handleSumbit}
              className="flex my-5 px-4 h-['32px] me-2 text-sm font-bold text-light bg-blue-500 border border-transparent rounded-sm hover:primary focus:outline-none focus-visible:ring-2 focus-visible:primary focus-visible:ring-opacity-75"
            >
              <span>Submit &nbsp;</span>
              <span className="py-1">
                <BsChevronDoubleRight />
              </span>
            </button>
          </div> */}
            {/* {update?"Update":"Submit"} */}
            <div className="flex w-full mt-5 lg:mt-0 justify-end">
              <button
                type="submit"
                className="formButtons"
                // className="px-24 my-10 text-white hover:bg-blue-800 active:scale-75 font-bold rounded-lg text-sm sm:w-auto py-2.5 text-center  bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={handleSubmit}
              >
                {/* Submit */}
                {loading3 && params._id ? (
                  <span>
                    Update
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                  </span>
                ) : loading3 ? (
                  <span>
                    Submit
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                  </span>
                ) : (
                  button
                )}
              </button>
            </div>
          </div>{" "}
        </div>
      </div>
    </section>
  );
};

export default AddExternalGrant;
