"use client";

import { useState, useEffect } from "react";
import validator from "validator";
import axios from "axios";
import moment from "moment";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Modal, Tooltip } from "flowbite-react";

import { GoProjectRoadmap } from "react-icons/go";
import { RxActivityLog } from "react-icons/rx";
import { FaCalendarAlt } from "react-icons/fa";
import { Md123, MdClose, MdOutlineEdit } from "react-icons/md";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { CiBank, CiViewList } from "react-icons/ci";
import { GrMoney } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";

const fundTypeList = ["External Grant", "Community Contribution"];
const paymentTypeList = ["Cash", "UPI", "Online E-Mitra"];
const lhwrfBankNameList = ["SBI", "Kotak Mahindra Bank", "Bank  of Baroda"];
const branchList = ["Nashik", "Pune", "Mumbai"];
const accNumberList = ["55115151455", "34844745412", "87494211245"];

const AddCCForm = () => {
  const [approvalNo, setApprovalNo] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [centerName, setCenterName] = useState("");
  const [center_id, setCenter_id] = useState("");
  const [program, setProgram] = useState("");
  const [program_id, setProgram_id] = useState("");
  const [project, setProject] = useState("");
  const [project_id, setProject_id] = useState("");
  const [activityName, setActivityName] = useState("");
  const [activityName_id, setActivityName_id] = useState("");
  const [subactivityName_id, setSubActivityName_id] = useState("");
  const [subactivityName, setSubActivityName] = useState("");
  const [fundReceiptNumber, setFundReceiptNumber] = useState("");
  const [amountReceivedDate, setAmountReceivedDate] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [depositSlipNumber, setDepositSlipNumber] = useState("");
  const [utrTransactionNumber, setUtrTransactionNumber] = useState("");
  const [bank_id, setBank_id] = useState("");
  const [lhwrfBankName, setLhwrfBankName] = useState("");
  const [lhwrfBranchName, setLhwrfBranchName] = useState("");
  const [lhwrfAccountNumber, setLhwrfAccountNumber] = useState("");
  const [totalAmountData, setTotalAmountData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [contributorData, setContributorData] = useState([]);
  const [contributorId, setContributorId] = useState("");
  const [user_id, setUser_id] = useState("");
  const [contributorDetails, setContributorDetails] = useState({
    contributorName: "",
    village: "",
    aadhaarNo: "",
    amountDeposited: "",
  });
  const [totalContributors, setTotalContributors] = useState(0);
  const [update, setUpdate] = useState(false);
  // const [contributorName, setContributorName] = useState("");
  // const [village, setVillage] = useState("");
  // const [aadhaarNo, setAadhaarNo] = useState("");
  // const [amountDeposited, setAmountDeposited] = useState("");
  const [centerNameList, setCenterNameList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [ActivityNameList, setActivityNameList] = useState([]);
  const [SubActivityNameList, setSubActivityNameList] = useState([]);
  const [bankDataList, setBankDataList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [accNumberList, setAccNumberList] = useState([]);
  const [error, setError] = useState({});

  const [addContributorsModal, setAddContributorsModal] = useState(false);

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
  let formValues = {};

  useEffect(() => {
    getCenterNameList();
    getProgramList();
    getProjectList();
    getActivityNameList();
    getBankList();
  }, []);

  const getBankList = () => {
    axios
      .get("/api/bank-details/list")
      .then((response) => {
        console.log(response);
        setBankDataList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchBankBranches();
    fetchBankAccountNos();
  }, [bank_id]);

  const fetchBankBranches = () => {
    const selectedBranch = bankDataList.filter(
      (lhwrfBank) => lhwrfBank._id === bank_id
    );
    setBranchList(selectedBranch);
    // selectedBranch.map((sb) => {
    //   console.log(sb.branchName);
    // });
  };

  const fetchBankAccountNos = () => {
    const selectedAccountNumber = bankDataList.filter(
      (lhwrfBank) => lhwrfBank._id === bank_id
    );
    setAccNumberList(selectedAccountNumber);
    // selectedBranch.map((sb) => {
    //   console.log(sb.branchName);
    // });
  };

  const fetchSubActivities = async (id) => {
    console.log("fetchSubActivity id", id);
    console.log("fetchSubActivity called");
    try {
      const response = await axios.get("/api/subactivity/get/" + id);
      console.log("response.data", response.data);
      console.log("response.data type", typeof response.data);
      setSubActivityNameList(response.data.subactivities);
    } catch (error) {
      console.error("Error fetching subactivities:", error);
    }
  };

  useEffect(() => {
    modalValidation();
    if (contributorData?.length === 0) {
      setTotalAmount(0);
      setTotalAmountData([]);
    }
  }, [totalAmount]);

  useEffect(() => {
    setTotalContributors(contributorData?.length);
  }, [contributorData]);

  // const rowExtendHandler = () => {
  //   const extendedDiv = [
  //     ...beneficiaryDetails,
  //     { beneficiaryName: "", village: "", aadhaarNo: "", amountDeposited: "" },
  //   ];
  //   setBeneficiaryDetails(extendedDiv);
  // };

  const getProgramList = () => {
    axios
      .get("/api/programs/get")
      .then((response) => {
        const ProgramList = response.data;

        if (Array.isArray(ProgramList)) {
          console.log("Setting ProgramList:", ProgramList);
          setProgramList(
            ProgramList.sort((a, b) => {
              return a.fieldValue.localeCompare(b.fieldValue);
            })
          );
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
    axios
      .get("/api/projects/get")
      .then((response) => {
        console.log("REsponsedata", response.data);
        const ProjectList = response.data;

        if (Array.isArray(ProjectList)) {
          console.log("Setting ProjectList:", ProjectList);
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
  };

  const getActivityNameList = () => {
    axios
      .get("/api/activity/get")
      .then((response) => {
        const ActivityNameList = response.data;

        if (Array.isArray(ActivityNameList)) {
          console.log("Setting ActivityNameList:", ActivityNameList);
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
  };

  const getCenterNameList = () => {
    axios
      .get("/api/centers/list")
      .then((response) => {
        const CenterNameList = response.data;

        if (Array.isArray(CenterNameList)) {
          console.log("Setting CenterNameList:", CenterNameList);
          setCenterNameList(CenterNameList);
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

  const fetchBranchNames = async (id) => {
    // console.log("fetchSubActivity id", id);
    // console.log("fetchSubActivity called");
    // try {
    //   const response = await axios.get("/api/subactivity/get/" + id);
    //   console.log("response.data", response.data);
    //   console.log("response.data type", typeof response.data);
    //   setSubActivityNameList(response.data.subactivities);
    // } catch (error) {
    //   console.error("Error fetching subactivities:", error);
    // }
  };

  const handleBankNameChange = async (e) => {
    // const [activityName_id, activityName] = e.target.value.split("|");
    // setActivityName(activityName);
    // setActivityName_id(activityName_id);
    // setError((prevState) => ({
    //   ...prevState,
    //   activityNameError: "",
    // }));

    // Fetch subactivities for the selected activity
    await fetchBranchNames(activityName_id);
  };

  useEffect(() => {
    if (params._id) {
      axios
        .get("/api/fund-receipts/get/one/" + params._id)
        .then(async (response) => {
          console.log("response", response);
          // console.log("response.data[0].centerName",response.data[0].centerName);
          setApprovalNo(response.data[0].approvalNo);
          setPaymentType(response.data[0].paymentType);
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
          setFundReceiptNumber(response.data[0].fundReceiptNumber);
          setAmountReceivedDate(response.data[0].amountReceivedDate);
          setAmountReceived(response.data[0].amountReceived);
          setDepositSlipNumber(response.data[0].depositSlipNumber);
          setUtrTransactionNumber(response.data[0].utrTransactionNumber);
          setBank_id(response.data[0].bank_id);
          setLhwrfBankName(response.data[0].lhwrfBankName);
          setLhwrfBranchName(response.data[0].lhwrfBranchName);
          setLhwrfAccountNumber(response.data[0].lhwrfAccountNumber);
          setContributorData(response.data[0].contributorData);
          await fetchSubActivities(response.data[0].activityName_id);

          // Set the subactivity name and ID after fetching subactivities
          setSubActivityName(response.data[0].subactivityName);
          setSubActivityName_id(response.data[0].subactivityName_id);
          if (params._id || update) {
            setTotalAmount(response.data[0].amountReceived);
          }
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

    if (validator.isEmpty(approvalNo.toString())) {
      inputIsValid = false;
      errorMsg.approvalNoError = "This field is required.";
      setError(errorMsg);
    } else if (validator.isAlpha(approvalNo.toString())) {
      inputIsValid = false;
      errorMsg.approvalNoError =
        "Only numerics and special characters allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(paymentType)) {
      inputIsValid = false;
      errorMsg.paymentTypeError = "This field is required.";
    }

    if (validator.isEmpty(centerName)) {
      inputIsValid = false;
      errorMsg.centerNameError = "This field is required.";
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

    if (validator.isEmpty(activityName)) {
      inputIsValid = false;
      errorMsg.activityNameError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(subactivityName)) {
      inputIsValid = false;
      errorMsg.subactivityNameError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(fundReceiptNumber.toString())) {
      inputIsValid = false;
      errorMsg.fundReceiptNumberError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isNumeric(fundReceiptNumber.toString())) {
      inputIsValid = false;
      errorMsg.fundReceiptNumberError = "Only numerics allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(amountReceivedDate)) {
      inputIsValid = false;
      errorMsg.amountReceivedDateError = "This field is required.";
      setError(errorMsg);
    }

    if (validator.isEmpty(amountReceived.toString())) {
      inputIsValid = false;
      errorMsg.amountReceivedError = "This field is required.";
      setError(errorMsg);
    } else if (validator.isAlpha(amountReceived.toString())) {
      inputIsValid = false;
      errorMsg.amountReceivedError = "Only numerics values allowed.";
      setError(errorMsg);
    }
    //  else if (
    //   !validator.isEmpty(amountReceived.toString()) &&
    //   validator.isEmpty(contributorDetails.amountDeposited)
    // ) {
    //   inputIsValid = false;
    //   errorMsg.totalAmountError =
    //     "Total Contribution should match the received amount.";
    //   setError(errorMsg);
    // }

    console.log(totalAmount);
    console.log(parseInt(amountReceived));

    if (
      validator.isEmpty(depositSlipNumber.toString()) &&
      fundType === "Community Contribution"
    ) {
      inputIsValid = false;
      errorMsg.depositSlipNumberError = "This field is required.";
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
    } else if (!validator.isAlpha(lhwrfBankName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.lhwrfBankNameError = "Only alphabets allowed.";
      setError(errorMsg);
    }

    if (validator.isEmpty(lhwrfBranchName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.lhwrfBranchNameError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isAlpha(lhwrfBranchName.replace(/\s/g, ""))) {
      inputIsValid = false;
      errorMsg.lhwrfBranchNameError = "Only alphabets allowed.";
      setError(errorMsg);
    }

    const bankAccountNumberRegex = new RegExp(/^[0-9]{9,18}$/);

    if (validator.isEmpty(lhwrfAccountNumber.toString())) {
      inputIsValid = false;
      errorMsg.lhwrfAccountNumberError = "This field is required.";
      setError(errorMsg);
    }

    if (parseInt(totalAmount) !== parseInt(amountReceived) && amountReceived) {
      inputIsValid = false;
      errorMsg.totalAmountError = "Please add contributors data.";
      setError(errorMsg);
    } else if (parseInt(totalAmount) === parseInt(amountReceived)) {
      inputIsValid = true;
      errorMsg.totalAmountError =
        "Total Contribution matched the received amount.";
      setError(errorMsg);
    }
    // if (
    //   validator.isEmpty(contributorDetails.amountDeposited) &&
    //   !validator.isEmpty(amountReceived)
    // ) {
    //   inputIsValid = false;
    //   errorMsg.totalAmountError = "Please add Contribution data.";
    //   setError(errorMsg);
    // }

    // else if (!validator.isNumeric(accountNumber.toString())) {
    //   inputIsValid = false;
    //   errorMsg.accountNumberError = "Only numerics allowed.";
    //   setError(errorMsg);
    // } else if (!bankAccountNumberRegex.test(accountNumber)) {
    //   inputIsValid = false;
    //   errorMsg.accountNumberError = "Invalid Input";
    //   setError(errorMsg);
    // } else if (!validator.isLength(accountNumber, [{ min: 9, max: 18 }])) {
    //   inputIsValid = false;
    //   errorMsg.accountNumberError = "Invalid Input";
    //   setError(errorMsg);
    // }

    return inputIsValid;
    console.log("inputIsValid", inputIsValid);
  };

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
    console.log("validation()", validation());
    console.log("error", error);

    if (
      validation() &&
      parseInt(totalAmount) == parseInt(amountReceived) &&
      modalValidation()
    ) {
      formValues = {
        fundType: "Community Contribution",
        approvalNo,
        paymentType,
        center_id,
        centerName,
        program_id,
        program,
        project_id,
        project,
        activityName_id,
        activityName,
        subactivityName_id,
        subactivityName,
        fundReceiptNumber,
        amountReceivedDate,
        amountReceived,
        depositSlipNumber,
        utrTransactionNumber,
        bank_id,
        lhwrfBankName,
        lhwrfBranchName,
        lhwrfAccountNumber,
        totalContributors,
        contributorData,
        user_id,
      };

      // console.log("params._id",params._id)
      if (params._id) {
        console.log("parammmmms", params);
        //==== This is Update case ====
        console.log("You are in Update Zone", formValues);
        formValues.ID = params._id;
        axios
          .patch("/api/fund-receipts/patch", formValues)
          .then((updatedFund) => {
            console.log("updated product => ", updatedFund);
            if (updatedFund.data.success) {
              if (updatedFund.data.data.modifiedCount > 0) {
                Swal.fire(" ", "CC updated successfully!!");
                // setFundUpdateModal(true);
                router.push("/admin/fund-management/cc-list");

                modalValidation();
              } else {
                Swal.fire(" ", "CC details were not changed hence no update!!");
                // setFundModifyModal(true);
              }
            }
          })
          .catch((error) => {
            console.log("API Error => ", error);
            Swal.fire(" ", "Something went wrong!!");
            // setFundErrorModal(true);
          });
      } else {
        // API for posting the data
        axios
          .post("/api/fund-receipts/post", formValues)
          .then((response) => {
            console.log("response while post", response);

            if (response.data.success) {
              let ID = response.data.insertedLevel._id;
              console.log("id", ID);
              // Swal popup
              Swal.fire({
                title: " ",
                text: "CC details submitted successfully!!",
              });
              // setFundCreateModal(true);
              modalValidation();
              router.push("/admin/fund-management/cc-list");
              // getData();
            } else {
              Swal.fire(" ", "Something went wrong!!");
              // setFundErrorModal(true);
            }
          })
          .catch((error) => {
            console.log("error", error);
            Swal.fire(" ", "Something went wrong!!");
            // setFundErrorModal(true);
          });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContributorDetails({
      ...contributorDetails,
      [name]: value,
    });
    setError((prevState) => ({
      ...prevState,
      nameError: "",
      villageError: "",
      amountDepositedError: "",
    }));
  };

  // let inputIsValid;

  const inputValidation = () => {
    const errorMsg = {};
    let inputIsValid = true;
    console.log(
      "parseInt(totalAmount),parseInt(amountReceived)",
      parseInt(totalAmount),
      parseInt(amountReceived),
      contributorDetails
    );

    if (validator.isEmpty(contributorDetails.contributorName)) {
      inputIsValid = false;
      errorMsg.nameError = "This field is required.";
      setError(errorMsg);
    }
    //  else if (!validator.isAlpha((contributorDetails.contributorName).trim())) {
    //   inputIsValid = false;
    //   errorMsg.nameError = "Only Alphabetic Values";
    //   setError(errorMsg);
    // }

    if (validator.isEmpty(contributorDetails.village)) {
      inputIsValid = false;
      errorMsg.villageError = "This field is required.";
      setError(errorMsg);
    }
    //  else if (!validator.isAlpha((contributorDetails.village).trim())) {
    //   inputIsValid = false;
    //   errorMsg.villageError = "Only Alphabetic Values";
    //   setError(errorMsg);
    // }

    if (validator.isEmpty(contributorDetails.amountDeposited.toString())) {
      inputIsValid = false;
      errorMsg.amountDepositedError = "This field is required.";
      setError(errorMsg);
    } else if (
      !validator.isNumeric(contributorDetails.amountDeposited.toString())
    ) {
      inputIsValid = false;
      errorMsg.quantityError = "Only Numeric Values";
      setError(errorMsg);
    }

    if (validator.isEmpty(contributorDetails.aadhaarNo.toString())) {
      inputIsValid = false;
      errorMsg.aadhaarNoError = "This field is required.";
      setError(errorMsg);
    } else if (!validator.isNumeric(contributorDetails.aadhaarNo.toString())) {
      inputIsValid = false;
      errorMsg.aadhaarNoError = "Only Numeric Values";
      setError(errorMsg);
    }
    console.log("errorMsg", errorMsg);
    return inputIsValid;
  };

  const modalValidation = () => {
    const errorMsg = {};
    let inputIsValid = true;
    console.log(
      "parseInt(totalAmount),parseInt(amountReceived)",
      parseInt(totalAmount),
      parseInt(amountReceived)
    );

    if (parseInt(totalAmount) < parseInt(amountReceived)) {
      inputIsValid = false;
      errorMsg.totalAmountError =
        "Total Contribution should match the received amount.";
      setError(errorMsg);
    } else if (parseInt(totalAmount) == parseInt(amountReceived)) {
      inputIsValid = true;
      errorMsg.totalAmountError =
        "Total Contribution matched the received amount.";
      setError(errorMsg);
    } else if (parseInt(totalAmount) > parseInt(amountReceived)) {
      inputIsValid = false;
      errorMsg.totalAmountError =
        "Total Contribution exceeded the received amount.";
      setError(errorMsg);
    } else if (
      !validator.isEmpty(amountReceived) &&
      validator.isEmpty(totalAmount)
    ) {
      inputIsValid = false;
      errorMsg.totalAmountError = "Please add Contribution Data";
      setError(errorMsg);
    }

    return inputIsValid;
  };

  const updateCC = (e) => {
    e.preventDefault();
    console.log("contributorData", contributorData);

    let index = contributorId;
    console.log("index", index, "inputValidation()", inputValidation());

    let updatedContributorData;
    console.log("contributorData.length", contributorData.length);
    console.log("contributorDetails", contributorDetails);
    if (inputValidation()) {
      updatedContributorData = contributorData?.map((item, i) => {
        console.log("index === i", index, i, index === i);
        if (index === i) {
          return {
            ...item,
            contributorName: contributorDetails.contributorName,
            village: contributorDetails.village,
            aadhaarNo: contributorDetails.aadhaarNo,
            amountDeposited: contributorDetails.amountDeposited,
          };
        }
        return item; // Return the original item for all other indices
      });

      // setContributorDetails({
      //   contributorName: "",
      //   village: "",
      //   aadhaarNo: "",
      //   amountDeposited: "",
      // });
    }
    console.log("updatedContributorData", updatedContributorData);
    // Update the state with the new array
    setContributorData(updatedContributorData);
    const totalAmountArr = [];
    for (let j = 0; j < updatedContributorData?.length; j++) {
      const element = updatedContributorData[j];
      totalAmountArr.push(updatedContributorData[j].amountDeposited);
    }
    console.log("totalAmountArr", totalAmountArr);
    setTotalAmountData(totalAmountArr);
    let sum = 0;
    for (let i = 0; i < totalAmountArr?.length; i++) {
      sum += parseInt(totalAmountArr[i]);
    }
    setTotalAmount(sum);
    console.log("totalAmount", totalAmount);

    setContributorId("");
    setUpdate(false);
    setContributorDetails({
      contributorName: "",
      village: "",
      aadhaarNo: "",
      amountDeposited: "",
    });
  };

  const addCC = (e) => {
    e.preventDefault();
    console.log("inputValidation() addCC", inputValidation());
    if (inputValidation()) {
      const totalAmountArr = [...totalAmountData];
      totalAmountArr.push(contributorDetails.amountDeposited);
      setTotalAmountData(totalAmountArr);
      let sum = 0;
      for (let i = 0; i < totalAmountArr.length; i++) {
        sum += parseInt(totalAmountArr[i]);
      }
      console.log(
        "contributorData.length",
        contributorData.length,
        "totalAmountData",
        totalAmountData
      );

      setTotalAmount(sum);

      setContributorData([...contributorData, contributorDetails]);
      console.log("contributorData", contributorData);
      setContributorDetails({
        contributorName: "",
        village: "",
        aadhaarNo: "",
        amountDeposited: "",
      });
    }
  };

  const handleEditClick = (contribution) => {
    setUpdate(true);
    setContributorDetails({
      contributorName: contribution.contributorName,
      village: contribution.village,
      aadhaarNo: contribution.aadhaarNo,
      amountDeposited: contribution.amountDeposited,
    });
  };

  const handleDeleteClick = (index) => {
    // index = contributorId;
    // if ((index = 0)) {
    //   index = 1;
    // }
    const updatedData = contributorData.filter((_, i) => i !== index);
    setContributorData(updatedData);
    setTotalAmount(
      (prevTotalAmount) =>
        parseInt(prevTotalAmount) -
        parseInt(contributorData[index].amountDeposited)
    );
  };

  // console.log(contributorData);
  // console.log(totalAmountData);

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Add Community Contribution</h1>
            <div className="flex gap-3 my-6 me-10">
              <Tooltip content="Community Contribution List" placement="bottom">
                <CiViewList
                  className="icon hover:text-gray-800 border border-gray-400 p-0.5 hover:border-gray-700 rounded text-[30px]"
                  onClick={() => {
                    router.push("/admin/fund-management/cc-list");
                  }}
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="px-10 py-6">
          <div className="bg-white text-secondary">
            <div>
              <div className="rounded-md">
                <div className="flex lg:flex-row md:flex-row flex-col my-4 lg:my-6 lg:w-1/2 justify-between gap-2">
                  {/* <div
                    className={`flex-1  ${
                      fundType === "Community Contribution" ? "w-1/4" : "w-1/2"
                    }`}
                  >
                    <label htmlFor="fundType" className="inputLabel">
                      Fund Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <GoProjectRoadmap className="icon" />
                        </span>
                      </div>
                      <select
                        name="centerName"
                        id="fundType"
                        className={`
        ${error.fundTypeError ? "stdSelectField" : "stdSelectField"} ${
                          fundType ? "text-black" : "text-gray-400"
                        }
      `}
                        value={fundType}
                        // value={centerName}
                        onChange={(e) => {
                          setFundType(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            fundTypeError: "",
                          }));
                        }}
                      >
                        <option value="" disabled className="text-gray-400">
                          Select Fund Type
                        </option>
                        {fundTypeList?.map((fundType, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={fundType}
                          >
                            {fundType}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="text-red-700"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.fundTypeError}
                    </div>
                  </div> */}

                  <div className="flex-1 me-2 w-full mb-2 lg:mb-0">
                    <label htmlFor="center-name" className="inputLabel">
                      Approval No. <span className="text-red-500">*</span>
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
                        value={approvalNo}
                        className={
                          error.approvalNoError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter Approval No."
                        onChange={(e) => {
                          setApprovalNo(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            approvalNoError: "",
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
                      {error.approvalNoError}
                    </div>
                  </div>

                  <div className="flex-1 w-full lg:w-1/2">
                    <label htmlFor="centerName" className="inputLabel">
                      Payment Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <GoProjectRoadmap size={20} />
                        </span>
                      </div>
                      <select
                        name="centerName"
                        id="fundType"
                        className={`
        ${error.paymentTypeError ? "stdSelectField" : "stdSelectField"} ${
                          paymentType ? "text-black" : "text-gray-400"
                        }
      `}
                        value={paymentType}
                        // value={centerName}
                        onChange={(e) => {
                          setPaymentType(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            fundTypeError: "",
                          }));
                        }}
                      >
                        <option value="" disabled className="text-gray-400">
                          Select Payment Type
                        </option>
                        {paymentTypeList?.map((paymentType, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={paymentType}
                          >
                            {paymentType}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="text-red-700"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.paymentTypeError}
                    </div>
                  </div>
                </div>
                <div className="flex lg:flex-row md:flex-row flex-col my-1 lg:my-4">
                  <div className="flex-1 lg:me-4">
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
                        <option value="" disabled className="text-gray-400">
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
                      className="text-red-700"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.centerNameError}
                    </div>
                  </div>

                  <div className="flex-1 lg:me-4 my-3 lg:my-0">
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
                          console.log(program_id);
                          setProgram(program);
                          setProgram_id(program_id);
                          setError((prevState) => ({
                            ...prevState,
                            programError: "",
                          }));
                        }}
                      >
                        <option value="" disabled className="text-gray-400">
                          Select Program
                        </option>
                        {programList?.map((program, i) => {
                          // console.log("programmmmmm", program._id);
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
                      className="text-red-700"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.programError}
                    </div>
                  </div>

                  <div className="flex-1 lg:me-4 my-1 lg:my-0">
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
                          console.log(project);
                          setProject(project);
                          setProject_id(project_id);
                          setError((prevState) => ({
                            ...prevState,
                            projectError: "",
                          }));
                        }}
                      >
                        <option value="" disabled className="text-gray-400">
                          Select Project
                        </option>
                        {projectList?.map((project, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={`${project._id}|${project.fieldValue}`}
                          >
                            {project.fieldValue}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="text-red-700"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.projectError}
                    </div>
                  </div>

                  {/* <div className="flex-1 lg:me-4">
                  <label
                    htmlFor="activityName"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Activity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <RxActivityLog size={20} />
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
                      onChange={(e) => {
                        const [activityName_id, activityName] =
                          e.target.value.split("|");
                        console.log(activityName);
                        setActivityName(activityName);
                        setActivityName_id(activityName_id);
                        setError((prevState) => ({
                          ...prevState,
                          activityNameError: "",
                        }));
                      }}
                    >
                      <option value="" disabled className="text-gray-400">
                        Select Activity
                      </option>
                      {ActivityNameList?.map((activity, i) => (
                        <option
                          className="text-black"
                          key={i}
                          value={`${activity._id}|${activity.fieldValue}`}
                        >
                          {activity.fieldValue}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="text-red-700"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.activityNameError}
                  </div>
                </div>
                <div className="flex-1 lg:me-4">
                  <label
                    htmlFor="subactivityName"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Sub Activity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <RxActivityLog size={20} />
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
                          } ${subactivityName ? "text-black" : "text-gray-400"}
                    `}
                      value={
                        subactivityName_id
                          ? `${subactivityName_id}|${subactivityName}`
                          : ""
                      }
                      onChange={(e) => {
                        const [subActivityName_id, subActivityName] =
                          e.target.value.split("|");
                        console.log(subActivityName);
                        setSubActivityName(subActivityName);
                        setSubActivityName_id(subActivityName_id);
                        setError((prevState) => ({
                          ...prevState,
                          subactivityNameError: "",
                        }));
                      }}
                    >
                      <option
                        value=""
                        selected
                        disabled
                        className="text-gray-400"
                      >
                        Select Sub Activity
                      </option>
                      {SubActivityNameList?.map((subactivity, i) => (
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
                    className="text-red-700"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.subactivityNameError}
                  </div>
                </div> */}
                  <div className="flex-1 lg:me-4 my-2.5 lg:my-0">
                    <label htmlFor="activityName" className="inputLabel">
                      Activity <span className="text-red-500">*</span>
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
                      >
                        <option value="" disabled className="text-gray-400">
                          Select Activity
                        </option>
                        {ActivityNameList?.map((activity, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={`${activity._id}|${activity.fieldValue}`}
                          >
                            {activity.fieldValue}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="text-red-700"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.activityNameError}
                    </div>
                  </div>

                  <div className="flex-1 my-2 lg:my-0">
                    <label htmlFor="subactivityName" className="inputLabel">
                      Sub Activity <span className="text-red-500">*</span>
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
                            : ""
                        }
                        onChange={(e) => {
                          const [subActivityName_id, subActivityName] =
                            e.target.value.split("|");
                          console.log(subActivityName);
                          setSubActivityName(subActivityName);
                          setSubActivityName_id(subActivityName_id);
                          setError((prevState) => ({
                            ...prevState,
                            subactivityNameError: "",
                          }));
                        }}
                      >
                        <option value="" disabled className="text-gray-400">
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
                      className="text-red-700"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.subactivityNameError}
                    </div>
                  </div>
                </div>
                <div className="flex lg:flex-row md:flex-row flex-col mt-2 lg:mt-4">
                  {/* {fundType !== "Community Contribution" ? ( */}

                  {/* ) : ( */}
                  {/* "" */}
                  {/* )} */}

                  <div className="flex-1 lg:me-4 my-2">
                    <label htmlFor="center-name" className="inputLabel">
                      Voucher Receipt No.{" "}
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
                        value={fundReceiptNumber}
                        className={
                          error.fundReceiptNumberError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter Voucher/Fund Receipt No."
                        onChange={(e) => {
                          setFundReceiptNumber(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            fundReceiptNumberError: "",
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
                      {error.fundReceiptNumberError}
                    </div>
                  </div>
                  <div className="flex-1 lg:me-4 my-2">
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
                        max={moment().format("YYYY-MM-DD")}
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
                      />
                    </div>
                    <div
                      className="text-red-700"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.amountReceivedDateError}
                    </div>
                  </div>
                  <div className="flex-1 lg:me-4 my-2">
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
                        placeholder="Enter Amount Received"
                        onChange={(e) => {
                          setAmountReceived(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            amountReceivedError: "",
                            totalAmountError: "",
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
                      {error.amountReceivedError}
                    </div>
                  </div>

                  {/* {fundType === "Community Contribution" ? ( */}
                  <div className="flex-1 my-2">
                    <label htmlFor="productId" className="inputLabel">
                      Deposit Slip No.
                      {/* <span className="text-red-500">*</span> */}
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
                      className="text-red-700"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.depositSlipNumberError}
                    </div>
                  </div>
                  {/* ) : ( */}
                  {/* "" */}
                  {/* )} */}
                </div>
                <div className="flex lg:flex-row md:flex-row flex-col mt-2 lg:mt-3">
                  <div className="flex-1 lg:me-4 my-2">
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
                      className="text-red-700"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.utrTransactionNumberError}
                    </div>
                  </div>

                  {/* {fundType === "Community Contribution" ? ( */}
                  <div className="flex-1 lg:me-4 my-2">
                    <label htmlFor="center-name" className="inputLabel">
                      LHWRF Bank Account <span className="text-red-500">*</span>
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
                        // value={lhwrfBankName}
                        // onChange={(e) => {
                        //   setLhwrfBankName(e.target.value);
                        //   setError((prevState) => ({
                        //     ...prevState,
                        //     lhwrfBankNameError: "",
                        //   }));
                        // }}
                        value={bank_id ? `${bank_id}|${lhwrfBankName}` : ""}
                        onChange={(e) => {
                          const [bankName_id, bankName] =
                            e.target.value.split("|");
                          setBank_id(bankName_id);
                          setLhwrfBankName(bankName);
                          setError((prevState) => ({
                            ...prevState,
                            lhwrfBankNameError: "",
                          }));
                        }}
                      >
                        <option
                          value=""
                          selected
                          disabled
                          className="text-gray-400"
                        >
                          Select LHWRF Bank Account
                        </option>
                        {/* {lhwrfBankNameList?.map((lhwrfBankName, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={lhwrfBankName}
                          >
                            {lhwrfBankName}
                          </option>
                        ))} */}
                        {/* {bankDataList?.map((lhwrfBank, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={lhwrfBank.bankName}
                          >
                            {lhwrfBank.bankName}
                          </option>
                        ))} */}
                        {bankDataList?.map((lhwrfBank, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={`${lhwrfBank._id}|${lhwrfBank.bankName}`}
                          >
                            {lhwrfBank.bankName}
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
                      {error.lhwrfBranchNameError}
                    </div>
                  </div>
                  {/* ) : ( */}
                  {/* <div className="flex-1 me-2 my-2">
                      <label
                        htmlFor="productId"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        LHWRF Bank Account Name{" "}
                        <span className="text-red-500">*</span>
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
                          value={lhwrfBankName}
                          className={
                            error.lhwrfBankNameError
                              ? "stdInputField"
                              : "stdInputField"
                            // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                            // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          }
                          placeholder="Enter LHWRF Branch Name"
                          onChange={(e) => {
                            setLhwrfBankName(e.target.value);
                            setError((prevState) => ({
                              ...prevState,
                              lhwrfBankNameError: "",
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
                        {error.lhwrfBankNameError}
                      </div>
                    </div>
                  )} */}

                  <div className="flex-1 lg:me-4 my-2">
                    <label htmlFor="center-name" className="inputLabel">
                      LHWRF Branch Name <span className="text-red-500">*</span>
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
                        value={lhwrfBranchName}
                        onChange={(e) => {
                          setLhwrfBranchName(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            lhwrfBranchNameError: "",
                          }));
                        }}
                      >
                        <option
                          value=""
                          selected
                          disabled
                          className="text-gray-400"
                        >
                          Select LHWRF Branch
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
                        {/* {bankDataList?.map((lhwrfBank, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={lhwrfBank.branchName}
                          >
                            {lhwrfBank.branchName}
                          </option>
                        ))} */}
                        {branchList.map((branch, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={branch.branchName}
                          >
                            {branch.branchName}
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
                        value={lhwrfBranchName}
                        className={
                          error.lhwrfBranchNameError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter LHWRF Branch Name"
                        onChange={(e) => {
                          setLhwrfBranchName(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            lhwrfBranchNameError: "",
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
                      {error.lhwrfBranchNameError}
                    </div>
                  </div> */}

                  <div className="flex-1 my-2">
                    <label htmlFor="center-name" className="inputLabel">
                      LHWRF Account No. <span className="text-red-500">*</span>
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
                        <option
                          value=""
                          selected
                          disabled
                          className="text-gray-400"
                        >
                          Select LHWRF Account No.
                        </option>
                        {/* {bankDataList?.map((lhwrfBank, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={lhwrfBank.bankAccountNumber}
                          >
                            {lhwrfBank.bankAccountNumber}
                          </option>
                        ))} */}
                        {accNumberList.map((accNo, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={accNo.bankAccountNumber}
                          >
                            {accNo.bankAccountNumber}
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
                        value={lhwrfAccountNumber}
                        className={
                          error.lhwrfAccountNumberError
                            ? "stdInputField"
                            : "stdInputField"
                          // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        }
                        placeholder="Enter LHWRF Account No."
                        onChange={(e) => {
                          setLhwrfAccountNumber(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            lhwrfAccountNumberError: "",
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
                      {error.lhwrfAccountNumberError}
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
            <div className="block lg:flex w-full justify-between">
              <button
                type="submit"
                className="formButtons me-2 mb-3 lg:mb-0"
                // className="px-24 my-10 text-white hover:bg-blue-800 active:scale-75 font-bold rounded-lg text-sm sm:w-auto py-2.5 text-center  bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={() => setAddContributorsModal(true)}
              >
                + Add Contributors
              </button>
              <button
                type="submit"
                className="formButtons"
                // className="px-24 my-10 text-white hover:bg-blue-800 active:scale-75 font-bold rounded-lg text-sm sm:w-auto py-2.5 text-center  bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={handleSubmit}
              >
                {/* Submit */}
                {params._id ? "Update" : "Submit"}
              </button>
            </div>
            <div
              className={`${
                parseInt(totalAmount) == parseInt(amountReceived)
                  ? "text-green font-normal"
                  : "text-red-700 font-normal"
              }`}
            >
              {error.totalAmountError}
            </div>
          </div>{" "}
          {/* <GenericTable
          tableObjects={tableObjects}
          tableHeading={tableHeading}
          runCount={runCount}
        /> */}
        </div>
      </div>

      <Modal
        show={addContributorsModal}
        size="5xl"
        onClose={() => setAddContributorsModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-center">
          <div className="flex justify-between gap-5">
            <h1 className="text-white mx-auto">Total Contributors</h1>
            <div
              className="modalCloseButton"
              onClick={() => setAddContributorsModal(false)}
            >
              {/* <MdClose className="icon text-white font-medium" /> */}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody text-start">
            <div className="flex lg:flex-row md:flex-row flex-col mt-4">
              {/* {fundType !== "Community Contribution" ? ( */}

              {/* ) : ( */}
              {/* "" */}
              {/* )} */}

              <div className="flex-1 me-2 my-2">
                <label htmlFor="center-name" className="inputLabel">
                  Contributor Name
                  <span className="text-red-500 ps-1">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <Md123 className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="contributorName"
                    id="productId"
                    value={contributorDetails.contributorName}
                    // value={contributorDetails[index].contributorName}
                    className={
                      error.contributorNameError
                        ? "stdInputField"
                        : "stdInputField"
                      // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    }
                    placeholder="Enter Contributor Name."
                    onChange={handleChange}
                  />
                </div>
                {/* setError((prevState) => ({
                        ...prevState,
                        contributorNameError: "",
                      })); */}

                <div
                  className="text-red-700"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {error.nameError}
                </div>
              </div>
              <div className="flex-1 me-2 my-2">
                <label htmlFor="productId" className="inputLabel">
                  Village/City <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <FaCalendarAlt className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="village"
                    id="productId"
                    value={contributorDetails.village}
                    // value={contributorDetails[index].village}
                    className={
                      error.villageError ? "stdInputField" : "stdInputField"
                      // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    }
                    placeholder="Enter Village/City"
                    onChange={handleChange}
                  />
                  {/* setError((prevState) => ({
                      ...prevState,
                      villageError: "",
                    })); */}
                </div>
                <div
                  className="text-red-700"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {error.villageError}
                </div>
              </div>
              <div className="flex-1 me-2 my-2">
                <label htmlFor="productId" className="inputLabel">
                  Aadhaar No.
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <FaIndianRupeeSign className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="aadhaarNo"
                    id="productId"
                    maxLength={14}
                    // value={contributorDetails[index].aadhaarNo}
                    className={
                      error.aadhaarNoError ? "stdInputField" : "stdInputField"
                      // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    }
                    placeholder="Enter Aadhaar No."
                    value={contributorDetails.aadhaarNo}
                    onChange={handleChange}
                    // setError((prevState) => ({
                    //   ...prevState,
                    //   aadhaarNoError: "",
                    // }));
                  />
                </div>
                <div
                  className="text-red-700"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {error.aadhaarNoError}
                </div>
              </div>

              {/* {fundType === "Community Contribution" ? ( */}
              <div className="flex-1 me-2 my-2">
                <label htmlFor="productId" className="inputLabel">
                  Amount Deposited <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                      <Md123 size={20} />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="amountDeposited"
                    id="productId"
                    value={contributorDetails.amountDeposited}
                    className={
                      error.amountDepositedError
                        ? "stdInputField"
                        : "stdInputField"
                      // ? "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      // : "block h-9 rounded-md border-0 py-1.5 pl-12 w-full text-gray-900 ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    }
                    placeholder="Enter Amount Deposited"
                    onChange={
                      handleChange
                      // const { name, value } = e.target;
                      // setContributorDetails({
                      //   ...contributorDetails,
                      //   [name]: value,
                      // });
                    }
                    // setError((prevState) => ({
                    //   ...prevState,
                    //   amountDepositedError: "",
                    // }));
                  />
                </div>
                <div
                  className="text-red-700"
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  {error.amountDepositedError}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                id="ccModal"
                className="formButtons me-2"
                // className={"formButtons me-2"+disabled ? "cursor-not-allowed":""}
                // disabled={parseInt(totalAmount) == parseInt(amountReceived)}
                // className="px-24 my-10 text-white hover:bg-blue-800 active:scale-75 font-bold rounded-lg text-sm sm:w-auto py-2.5 text-center  bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={
                  params._id && update ? updateCC : update ? updateCC : addCC
                }
              >
                {update ? "Update" : "Submit"}
              </button>
            </div>
            <table className="table-auto border-separate border-spacing-y-2 w-full ">
              {/* <thead>
                <tr>
                  <th className="border border-slate-300">State</th>
                  <th className="border border-slate-300">City</th>
                </tr>
              </thead> */}
              <tbody>
                {contributorData?.map((contribution, index) => {
                  return (
                    <tr className="hover:bg-[#f4f4f4]" key={index}>
                      <td className="border-2 border-r-0 rounded rounded-r-none border-gray-300 ps-5">
                        {1 + index}. &nbsp;
                        {contribution.contributorName}
                      </td>
                      <td className="border-2 border-r-0 border-l-0 border-gray-300">
                        {contribution.village}
                      </td>
                      <td className="border-2 border-r-0 border-l-0 border-gray-300 pe-10">
                        {contribution.aadhaarNo}
                      </td>
                      <td className="border-2 border-r-0 border-l-0 rounded-r-none border-gray-300 pe-5">
                        {contribution.amountDeposited}
                      </td>
                      <td className="border-2 border-l-0 rounded rounded-l-none border-gray-300 pe-5 flex text-center pt-1">
                        <MdOutlineEdit
                          className="border flex justify-center border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                          size={"1.3rem"}
                          onClick={() => {
                            handleEditClick(contribution);
                            setContributorId(index);
                          }}
                        />
                        &nbsp;
                        <RiDeleteBin6Line
                          className="border flex justify-center border-red-500 p-1 text-red-500 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                          size={"1.3rem"}
                          onClick={() => {
                            setContributorId(index);
                            handleDeleteClick(index);
                            // redirect("delete", value._id);
                            // setDeleteId(value._id);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-between pe-[1rem]">
              <div
                className={`${
                  parseInt(totalAmount) == parseInt(amountReceived)
                    ? "text-green"
                    : "text-red-700"
                }`}
              >
                {error.totalAmountError}
              </div>
              <div className="">Total Rs. {totalAmount}</div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default AddCCForm;
