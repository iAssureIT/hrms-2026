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
import { FaCalendarAlt, FaSpinner } from "react-icons/fa";
import { Md123, MdClose, MdOutlineEdit } from "react-icons/md";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { CiBank, CiViewList } from "react-icons/ci";
import { GrMoney } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaFileUpload } from "react-icons/fa";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";

const fundTypeList = ["External Grant", "Community Contribution"];
const paymentTypeList = ["Cash", "UPI", "Online E-Mitra"];
const lhwrfBankNameList = ["SBI", "Kotak Mahindra Bank", "Bank  of Baroda"];
const branchList = ["Nashik", "Pune", "Mumbai"];
const accNumberList = ["55115151455", "34844745412", "87494211245"];

const AddCCForm = () => {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  // console.log("userDetails  =>", userDetails);

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
  // const [fundReceiptNumber, setFundReceiptNumber] = useState("");
  const [amountReceivedDate, setAmountReceivedDate] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [plainAmountReceived, setPlainAmountReceived] = useState("");
  const [depositSlipNumber, setDepositSlipNumber] = useState("");
  const [utrTransactionNumber, setUtrTransactionNumber] = useState("");
  const [bank_id, setBank_id] = useState([]);
  const [lhwrfBankName, setLhwrfBankName] = useState("");
  const [lhwrfBranchName, setLhwrfBranchName] = useState("");
  const [lhwrfAccountNumber, setLhwrfAccountNumber] = useState("");
  const [totalAmountData, setTotalAmountData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [contributorData, setContributorData] = useState([]);
  const [contributorId, setContributorId] = useState("");
  const [user_id, setUser_id] = useState("");
  const [plainAadhaarNo, setPlainAadhaarNo] = useState("");
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
  const [branchIndex, setBranchIndex] = useState("");
  const [approvalNoList, setApprovalNoList] = useState([]);
  const [error, setError] = useState({});

  const [addContributorsModal, setAddContributorsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  
  const [maxDate, setMaxDate] = useState("");

  const router = useRouter();
  const params = useParams();

  const button = params._id ? "Update" : "Submit";

  // const formatAadhaarNumber = (value) => {
  //   console.log(value);
  //   return value.replace(/(\d{4})(?=\d)/g, "$1 ");
  // };

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
    getBankList();
  }, []);

  useEffect(() => {
    if (params._id) {
      axios
        .get("/api/fund-receipts/get/one/" + params._id)
        .then(async (response) => {
        
          console.log("response.data[0].center_id", response.data[0].center_id);
          console.log("response.data[0]", response.data[0]);
          setApprovalNo(response.data[0].approvalNo);
          
          getProgramList(response.data[0].approvalNo);
          getProjectList(response.data[0].approvalNo);
          getActivityNameList(response.data[0].approvalNo);

          setPaymentType(response.data[0].paymentType);
          setCenterName(response.data[0].centerName);
          setCenter_id(response.data[0].center_id);
          setProgram(response.data[0].program);
          setProgram_id(response.data[0].program_id);
          // `${program_id}|${program}`;
          setProject(response.data[0].project);
          setProject_id(response.data[0].project_id);
          setActivityName(response.data[0].activityName);
          setActivityName_id(response.data[0].activityName_id);

          // setSubActivityName(response.data[0].subactivityName);
          // setSubActivityName_id(response.data[0].subactivityName_id);
          // setFundReceiptNumber(response.data[0].fundReceiptNumber);
          setAmountReceivedDate(response.data[0].amountReceivedDate);
          setAmountReceived(
            formatNumberWithCommas(response.data[0].amountReceived)
          );
          setPlainAmountReceived(response.data[0].amountReceived);
          setDepositSlipNumber(response.data[0].depositSlipNumber);
          setUtrTransactionNumber(response.data[0].utrTransactionNumber);
          setBank_id(response.data[0].bank_id);
          setLhwrfBankName(response.data[0].lhwrfBankName);
          setLhwrfBranchName(response.data[0].lhwrfBranchName);
          setLhwrfAccountNumber(response.data[0].lhwrfAccountNumber);
          setContributorData(response.data[0].contributorData);
          await fetchSubActivities(response.data[0].approvalNo);

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

  useEffect(() => {
    if (pathname.includes("center")) {
      getApprovalNoList(userDetails?.center_id);
    } else {
      getApprovalNoList(center_id);
    }
  }, [center_id, approvalNo, userDetails?.center_id]);

  useEffect(() => {
    console.log("approval No", approvalNo);
    if (approvalNo) {
      getProgramList(approvalNo);
      setError((prevState) => ({
        ...prevState,
        programError: "",
      }));
    } else {
      setError((prevState) => ({
        ...prevState,
        programError: "Please select Approval No.",
      }));
    }
  }, [approvalNo]);

  useEffect(() => {
    if (approvalNo) {
      getProjectList(approvalNo);
    }
  }, [approvalNo]);

  useEffect(() => {
    if (approvalNo) {
      getActivityNameList(approvalNo);
    }
  }, [approvalNo]);

  useEffect(() => {
    if (approvalNo) {
      fetchSubActivities(approvalNo);
    }
  }, [approvalNo]);

  const getApprovalNoList = (center_ID) => {
    axios
      .get("/api/approval-details/get/list/" + center_ID)
      .then((response) => {
        const ApprovalNoList = response.data.data;

        // console.log("approval Nos", ApprovalNoList);

        if (Array.isArray(ApprovalNoList)) {
          setApprovalNoList(ApprovalNoList);

          // if (params?._id) {
          //   // Find the approvalNo from list based on _id (adjust logic if needed)
          //   const selected = ApprovalNoList.find(
          //     (item) => item.approvalNo === approvalNo
          //   );

          //   console.log("selected approval no in params._id", selected);
          //   console.log("fetched approval no in params._id", approvalNo);
          //   if (selected) {
          //     setApprovalNo(selected.approvalNo);
          //   }
          // }
        } else {
          console.error(
            "Expected data to be an array but got:",
            ApprovalNoList
          );
          setApprovalNoList([]);
        }
      })
      .catch((error) => {
        console.log("Error while getting ApprovalNo List => ", error);
      });
  };

  const getBankList = () => {
    axios
      .get("/api/bank-details/list")
      .then((response) => {
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
    // setBranchList(selectedBranch);

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
    // const selectedAccountNumber = bankDataList.filter(
    //   (lhwrfBank) => lhwrfBank._id === bank_id
    // );
    // setAccNumberList(selectedAccountNumber);

    const selectedAccountNumbers = bankDataList
      .filter((bank) => selectedBankIds.some((id) => bank.ids.includes(id)))
      .flatMap((bank) => bank.accountNumbers);

    setAccNumberList(selectedAccountNumbers);

    // selectedBranch.map((sb) => {
    //   console.log(sb.branchName);
    // });
  };

  // useEffect(() => {
  //   fetchSubActivities(activityName_id);
  // }, [approvalNo]);

  const fetchSubActivities = async (approvalNumber) => {
    // console.log("fetchSubActivity activity_id = ", activityName_id);
    // console.log("fetchSubActivity called");
   

    let element = "";

    const subactivityList = approvalNoList.filter((approval, index) => {
      if (approval.approvalNo === approvalNumber) {
        element = approval.approvalNo === approvalNumber;
        return element;
      }
    });

    console.log("subactivityList", subactivityList);

    if (subactivityList.length > 0) {
      const selectedApproval = subactivityList[0]; // Assuming approvalNo is unique
      setSubActivityName(selectedApproval.subactivityName);
      setSubActivityName_id(selectedApproval.subactivityName_id);
      console.log(
        "selectedApproval.subactivityName",
        selectedApproval.subactivityName
      );
      // setSubActivityNameList(subactivityList); // Set the filtered programList
    } else {
      // setSubActivityName(""); // Reset if no match found
      // setSubActivityName_id("");
      try {
        const response = await axios.get(
          "/api/subactivity-mapping/get/list/" +
            program_id +
            "/" +
            project_id +
            "/" +
            activityName_id
        );
        console.log("fetchSubActivities response.data", response.data);
        console.log("response.data type", typeof response.data);
        setSubActivityNameList(
          response.data.sort((a, b) => {
            return a.inputValue.localeCompare(b.inputValue);
          })
        );
      } catch (error) {
        console.error("Error fetching subactivities:", error);
      }
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

  const getProgramList = (approvalNumber) => {
    console.log("approval Number in program list", approvalNumber);
     let element = "";

    const programList = approvalNoList.filter((approval) => {
      element = approval.approvalNo === approvalNumber;
      return element;
    });

    console.log("programList", programList);
    if (programList.length > 0) {
      const selectedApproval = programList[0]; // Assuming approvalNo is unique
      setProgram(selectedApproval.program);
      setProgram_id(selectedApproval.program_id);
      console.log("selectedApproval.program", selectedApproval.program);
      // setProgramList(programList); // Set the filtered programList
    } else {
      // setProgram(""); // Reset if no match found
      // setProgram_id("");
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
    }
  };

  const getProjectList = (approvalNumber) => {
    

    let element = "";

    const projectList = approvalNoList.filter((approval, index) => {
      if (approval.approvalNo === approvalNumber) {
        element = approval.approvalNo === approvalNumber;
        return element;
      }
    });
    console.log("approvalNoList",approvalNoList)
    console.log("projectList",projectList)

    if (projectList.length > 0) {
      const selectedApproval = projectList[0]; // Assuming approvalNo is unique
      setProject(selectedApproval.project);
      setProject_id(selectedApproval.project_id);
      // setProjectList(projectList); // Set the filtered programList
    } else {
      // setProject(""); // Reset if no match found
      // setProject_id("");
      axios
      .get("/api/subactivity-mapping/get/list/" + program_id)
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
    }
  };

  const getActivityNameList = (approvalNumber) => {
    
    let element = "";

    const activityList = approvalNoList.filter((approval, index) => {
      if (approval.approvalNo === approvalNumber) {
        element = approval.approvalNo === approvalNumber;
        return element;
      }
    });
    if (activityList.length > 0) {
      const selectedApproval = activityList[0]; // Assuming approvalNo is unique
      setActivityName(selectedApproval.activityName);
      setActivityName_id(selectedApproval.activityName_id);
      // setActivityNameList(activityList); // Set the filtered programList
    } else {
      // setActivityName(""); // Reset if no match found
      // setActivityName_id("");
      axios
      .get("/api/subactivity-mapping/get/list/" + program_id + "/" + project_id)
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

    }
  };

  const getCenterNameList = () => {
    axios
      .get("/api/centers/list")
      .then((response) => {
        const CenterNameList = response.data;

        if (Array.isArray(CenterNameList)) {
          console.log("Setting CenterNameList:", CenterNameList);
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

    // if (validator.isEmpty(fundReceiptNumber.toString())) {
    //   inputIsValid = false;
    //   errorMsg.fundReceiptNumberError = "This field is required.";
    //   setError(errorMsg);
    // } else if (!validator.isNumeric(fundReceiptNumber.toString())) {
    //   inputIsValid = false;
    //   errorMsg.fundReceiptNumberError = "Only numerics allowed.";
    //   setError(errorMsg);
    // }

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

    if (
      parseInt(totalAmount) !== parseInt(plainAmountReceived) &&
      plainAmountReceived
    ) {
      inputIsValid = false;
      errorMsg.totalAmountError = "Please add contributors data.";
      setError(errorMsg);
    } else if (parseInt(totalAmount) === parseInt(plainAmountReceived)) {
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
  };

  const handleActivityChange = async (e) => {
    // const [activityName_id, activityName] = e.target.value.split("|");
    // setActivityName(activityName);
    // setActivityName_id(activityName_id);
    setError((prevState) => ({
      ...prevState,
      activityNameError: "",
    }));

    // Fetch subactivities for the selected activity
    // await fetchSubActivities(approvalNo);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      validation() &&
      parseInt(totalAmount) == parseInt(plainAmountReceived) &&
      modalValidation()
    ) {
      let formValues = {
        fundType: "Community Contribution",
        approvalNo,
        paymentType,
        center_id: center_id ? center_id : userDetails.center_id,
        centerName: centerName ? centerName : userDetails.centerName,
        program_id,
        program,
        project_id,
        project,
        activityName_id,
        activityName,
        subactivityName_id,
        subactivityName,
        // fundReceiptNumber,
        amountReceivedDate,
        amountReceived: plainAmountReceived,
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
        //==== This is Update case ====

        formValues.ID = params._id;
        axios
          .patch("/api/fund-receipts/patch", formValues)
          .then((updatedFund) => {
            if (updatedFund.data.success) {
              if (updatedFund.data.data.modifiedCount > 0) {
                Swal.fire(" ", "CC updated successfully!!");
                // setFundUpdateModal(true);
                setLoading3(true);
                router.push("/" + loggedInRole + "/fund-management/cc-list");

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
            if (response.data.success) {
              let ID = response.data.insertedLevel._id;

              // Swal popup
              Swal.fire({
                title: " ",
                text: "CC details submitted successfully!!",
              });
              // setFundCreateModal(true);
              modalValidation();
              setLoading3(true);
              router.push("/" + loggedInRole + "/fund-management/cc-list");
              // getData();
            } else {
              Swal.fire(" ", response.data.message);
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

    // if (name === "aadhaarNo") {
    //   const plainAadhaarNo = value.replace(/\s+/g, "");
    //   setPlainAadhaarNo(plainAadhaarNo);
    //   const formattedAadhaar = formatAadhaarNumber(plainAadhaarNo);

    //   setContributorDetails((prevState) => ({
    //     ...prevState,
    //     [name]: formattedAadhaar,
    //   }));
    // } else {
    setContributorDetails({
      ...contributorDetails,
      [name]: value,
    });
    // }

    setError((prevState) => ({
      ...prevState,
      nameError: "",
      villageError: "",
      aadhaarNoError: "",
      amountDepositedError: "",
    }));
  };

  // let inputIsValid;

  const inputValidation = () => {
    const errorMsg = {};
    let inputIsValid = true;

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
    } else if (!validator.isAlpha(contributorDetails.village.trim())) {
      inputIsValid = false;
      errorMsg.villageError = "Only Alphabetic Values";
      setError(errorMsg);
    }

    if (validator.isEmpty(contributorDetails.amountDeposited.toString())) {
      inputIsValid = false;
      errorMsg.amountDepositedError = "This field is required.";
      setError(errorMsg);
    } else if (
      !validator.isNumeric(contributorDetails.amountDeposited.toString())
    ) {
      inputIsValid = false;
      errorMsg.amountDepositedError = "Only Numeric Values";
      setError(errorMsg);
    }

    if (validator.isEmpty(contributorDetails.aadhaarNo.toString())) {
      inputIsValid = false;
      errorMsg.aadhaarNoError = "This field is required.";
      setError(errorMsg);
    } else if (
      !validator.isNumeric(contributorDetails.aadhaarNo.toString()) ||
      !validator.isLength(contributorDetails.aadhaarNo.toString(), {
        min: 12,
        max: 12,
      })
    ) {
      inputIsValid = false;
      errorMsg.aadhaarNoError =
        "Input must be 12 digits only numeric values allowed";
      setError(errorMsg);
    }
    console.log("errorMsg", errorMsg);
    return inputIsValid;
  };

  const modalValidation = () => {
    const errorMsg = {};
    let inputIsValid = true;

    if (parseInt(totalAmount) < parseInt(plainAmountReceived)) {
      inputIsValid = false;
      errorMsg.totalAmountError =
        "Total Contribution should match the received amount.";
      setError(errorMsg);
    } else if (parseInt(totalAmount) == parseInt(plainAmountReceived)) {
      inputIsValid = true;
      errorMsg.totalAmountError =
        "Total Contribution matched the received amount.";
      setError(errorMsg);
    } else if (parseInt(totalAmount) > parseInt(plainAmountReceived)) {
      inputIsValid = false;
      errorMsg.totalAmountError =
        "Total Contribution exceeded the received amount.";
      setError(errorMsg);
    } else if (
      !validator.isEmpty(plainAmountReceived.toString()) &&
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

    let index = contributorId;

    let updatedContributorData;

    if (inputValidation()) {
      updatedContributorData = contributorData?.map((item, i) => {
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

    // Update the state with the new array
    setContributorData(updatedContributorData);
    const totalAmountArr = [];
    for (let j = 0; j < updatedContributorData?.length; j++) {
      const element = updatedContributorData[j];
      totalAmountArr.push(updatedContributorData[j].amountDeposited);
    }

    setTotalAmountData(totalAmountArr);
    let sum = 0;
    for (let i = 0; i < totalAmountArr?.length; i++) {
      sum += parseInt(totalAmountArr[i]);
    }
    setTotalAmount(sum);

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

    if (inputValidation()) {
      const totalAmountArr = [...totalAmountData];
      totalAmountArr.push(contributorDetails.amountDeposited);
      setTotalAmountData(totalAmountArr);
      let sum = 0;
      for (let i = 0; i < totalAmountArr.length; i++) {
        sum += parseInt(totalAmountArr[i]);
      }

      setTotalAmount(sum);

      setContributorData([...contributorData, contributorDetails]);

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

  // console.log(contributorData);

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Add Community Contribution</h1>
            {loggedInRole === "admin" || loggedInRole === "center" ? (
              <div className="flex flex-wrap gap-3 my-5 me-10">
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
                      //       "/fund-management/add-cc/bulk-upload"
                      //   );
                      // }}
                        
                      onClick={() => {
                        window.open(
                          `/${loggedInRole}/fund-management/add-cc/bulk-upload`,
                          '_self'
                          // "noopener,noreferrer"
                        );
                      }}
                    />
                  )}
                </Tooltip>
                <Tooltip
                  content="Community Contribution List"
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
                      //     "/" + loggedInRole + "/fund-management/cc-list"
                      //   );
                      // }}
                      onClick={() => {
                        window.open(
                          "/" + loggedInRole + "/fund-management/cc-list",
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
                  {/* <div className="flex lg:flex-row md:flex-row flex-col lg:my-6 lg:w-3/4 justify-between"> */}
                  {loggedInRole === "admin" ? (
                    <div className="flex-1 lg:mt-2">
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

                  <div className="flex-1 mt-4 lg:mt-2">
                    <label htmlFor="approvalNo" className="inputLabel">
                      Approval No. <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <Md123 className="icon" />
                        </span>
                      </div>
                      {/* <input
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
                      /> */}
                      <select
                        name="approvalNo"
                        id="approvalNo"
                        className={`
        ${error.approvalNoError ? "stdSelectField" : "stdSelectField"} ${
                          approvalNo ? "text-black" : "text-gray-400"
                        }
      `}
                        value={approvalNo}
                        // value={centerName}
                        onChange={(e) => {
                          setApprovalNo(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            approvalNoError: "",
                          }));
                          // getProgramList(e.target.value);
                          // getProjectList(e.target.value);
                          // getActivityNameList(e.target.value);
                          // fetchSubActivities(e.target.value);
                        }}
                      >
                        <option value="" className="text-gray-400">
                          Select Approval No.
                        </option>
                        {approvalNoList?.map((item, i) => (
                          <option
                            className="text-black"
                            key={i}
                            value={item.approvalNo}
                          >
                            {item.approvalNo}
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
                      {error.approvalNoError}
                    </div>
                  </div>

                  <div className="flex-1 mt-4 lg:mt-2 lg:me-1">
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
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.paymentTypeError}
                    </div>
                  </div>
                </div>
                <div className="flex lg:flex-row md:flex-row flex-col lg:my-4">
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
                          // const [program_id, program] =
                          //   e.target.value.split("|");

                          // setProgram(program);
                          // setProgram_id(program_id);
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
                        {/* {programList?.map((program, i) => { */}
                        {/* return ( */}
                        {program_id && program ? (
                          <option
                            className="text-black"
                            // key={i}
                            value={program_id && `${program_id}|${program}`}
                          >
                            {program}
                          </option>
                        ) : (
                          ""
                        )}

                        {/* );
                        })} */}
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
                          // const [project_id, project] =
                          //   e.target.value.split("|");

                          // setProject(project);
                          // setProject_id(project_id);
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
                        {/* {projectList?.map((project, i) => ( */}
                        {project_id && project ? (
                          <option
                            className="text-black"
                            // key={i}
                            value={project_id && `${project_id}|${project}`}
                          >
                            {project}
                          </option>
                        ) : (
                          ""
                        )}

                        {/* ))} */}
                      </select>
                    </div>
                    <div
                      className="text-red-500"
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
                    className="text-red-500"
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
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.subactivityNameError}
                  </div>
                </div> */}
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
                            : null
                        }
                        onChange={handleActivityChange}
                        disabled={!!params._id && !!activityName_id}
                      >
                        <option value="" className="text-gray-400">
                          Select Activity
                        </option>
                        {/* {ActivityNameList?.map((activity, i) => ( */}
                        {activityName_id && activityName ? (
                          <option
                            className="text-black"
                            // key={i}
                            value={
                              activityName_id &&
                              `${activityName_id}|${activityName}`
                            }
                          >
                            {activityName}
                          </option>
                        ) : (
                          ""
                        )}

                        {/* ))} */}
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
                                ${
                                  subactivityName
                                    ? "text-black"
                                    : "text-gray-400"
                                }
                            `}
                        value={
                          subactivityName_id
                            ? `${subactivityName_id}|${subactivityName}`
                            : null
                        }
                        onChange={(e) => {
                          // const [subActivityName_id, subActivityName] =
                          //   e.target.value.split("|");

                          // setSubActivityName(subActivityName);
                          // setSubActivityName_id(subActivityName_id);
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
                        {/* {Array.isArray(SubActivityNameList) && */}
                        {/* SubActivityNameList.map((subactivity, i) => ( */}
                        {subactivityName && subactivityName_id ? (
                          <option
                            className="text-black"
                            // key={i}
                            value={
                              subactivityName_id &&
                              `${subactivityName_id}|${subactivityName}`
                            }
                          >
                            {subactivityName}
                          </option>
                        ) : (
                          ""
                        )}

                        {/* ))} */}
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
                <div className="flex lg:flex-row md:flex-row flex-col lg:mt-4">
                  {/* {fundType !== "Community Contribution" ? ( */}

                  {/* ) : ( */}
                  {/* "" */}
                  {/* )} */}

                  {/* <div className="flex-1 lg:me-4 my-2">
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
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.fundReceiptNumberError}
                    </div>
                  </div> */}
                  <div className="flex-1 lg:me-4 mt-2">
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
                  <div className="flex-1 lg:me-4 mt-4 lg:mt-2">
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
                        // onChange={(e) => {
                        //   setAmountReceived(e.target.value);
                        //   setError((prevState) => ({
                        //     ...prevState,
                        //     amountReceivedError: "",
                        //     totalAmountError: "",
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

                  {/* {fundType === "Community Contribution" ? ( */}
                  <div className="flex-1 lg:me-4 mt-4 lg:mt-2">
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
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.depositSlipNumberError}
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

                  {/* ) : ( */}
                  {/* "" */}
                  {/* )} */}
                </div>

                <div className="flex w-full lg:w-3/4 lg:flex-row md:flex-row flex-col mt-2 lg:mt-3">
                  {/* {fundType === "Community Contribution" ? ( */}
                  <div className="flex-1 lg:me-4 my-2">
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
                        className="text-red-500"
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
                        value={
                          bank_id || params._id
                            ? `${branchIndex}|${lhwrfBranchName}`
                            : ""
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
                      className="text-red-500"
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                      }}
                    >
                      {error.lhwrfBranchNameError}
                    </div>
                  </div> */}

                  <div className="flex-1 my-2 lg:me-1">
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
                        <option value="" className="text-gray-400">
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
                      className="text-red-500"
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
            <div className="block mt-5 lg:mt-0 lg:flex w-full justify-between">
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
            <div
              className={`${
                parseInt(totalAmount) == parseInt(plainAmountReceived)
                  ? "text-green font-normal"
                  : "text-red-500 font-normal"
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
                  className="text-red-500"
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
                  className="text-red-500"
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
                    maxLength={12}
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
                  className="text-red-500"
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
                  className="text-red-500"
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
                  parseInt(totalAmount) == parseInt(plainAmountReceived)
                    ? "text-green"
                    : "text-red-500"
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
