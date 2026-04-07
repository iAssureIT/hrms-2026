"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
// import S3UploadComponent from "../S3Upload/S3Upload";
import S3FileUpload from "react-s3";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import validator from "validator";
import { Modal, Tooltip } from "flowbite-react";
import { MdClose } from "react-icons/md";
import { IoPersonCircleOutline } from "react-icons/io5";
import { CiBank, CiViewList } from "react-icons/ci";
import { MdOutlineDateRange } from "react-icons/md";
import { GoProjectRoadmap } from "react-icons/go";
import { RxActivityLog } from "react-icons/rx";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { ImListNumbered } from "react-icons/im";
import { FaFileUpload, FaRegFileAlt, FaSpinner } from "react-icons/fa";
import moment from "moment";
import { IoCloseCircleSharp } from "react-icons/io5";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
import { GrDocument } from "react-icons/gr";
import { PiBuildingOfficeThin } from "react-icons/pi";

const AddUtilization = () => {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  // console.log("userDetails  =>", userDetails);

  const [centerName, setCenterName] = useState("");
  const [center_id, setCenter_id] = useState("");
  const [approvalDate, setApprovalDate] = useState("");
  const [approvalNo, setApprovalNo] = useState("");
  const [voucherDate, setVoucherDate] = useState("");
  const [program_id, setProgram_id] = useState("");
  const [program, setProgram] = useState("");
  const [project_id, setProject_id] = useState("");
  const [project, setProject] = useState("");
  const [activityName_id, setActivityName_id] = useState("");
  const [activityName, setActivityName] = useState("");
  const [subactivityName_id, setSubActivityName_id] = useState("");
  const [subactivityName, setSubActivityName] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [plainUnitCost, setPlainUnitCost] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [plainTotalCost, setPlainTotalCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [grant, setGrant] = useState("");
  const [plainGrant, setPlainGrant] = useState("");
  const [CC, setCC] = useState("");
  const [plainCC, setPlainCC] = useState("");
  const [LHWRF, setLHWRF] = useState("");
  const [plainLHWRF, setPlainLHWRF] = useState("");
  const [convergence, setConvergence] = useState("");
  const [plainConvergence, setPlainConvergence] = useState("");
  const [noOfHouseholds, setNoOfHouseholds] = useState("");
  const [plainNoOfHouseholds, setPlainNoOfHouseholds] = useState("");
  const [noOfBeneficiaries, setNoOfBeneficiaries] = useState("");
  const [plainNoOfBeneficiaries, setPlainNoOfBeneficiaries] = useState("");
  const [activityStatus, setActivityStatus] = useState("");
  const [convergenceAgencyName, setConvergenceAgencyName] = useState("");
  const [convergenceDocumentName, setConvergenceDocumentName] = useState("");
  const [convergenceNote, setConvergenceNote] = useState("");
  const [centerNameList, setCenterNameList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [ActivityNameList, setActivityNameList] = useState([]);
  const [SubActivityNameList, setSubActivityNameList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [user_id, setUser_id] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const router = useRouter();
  const params = useParams();
  const [voucherDocumentName, setVoucherDocumentName] = useState("");
  const [voucherDocumentUrl, setVoucherDocumentUrl] = useState("");
  const [convergenceDocumentUrl, setConvergenceDocumentUrl] = useState("");
  const [S3ConvergenceDocumentName, setS3ConvergenceDocumentName] =
    useState("");
  const [edit, setEdit] = useState(false);

  const button = params._id && edit ? "Update" : "Submit";

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
    setApprovalDate(currentDate);
    setVoucherDate(currentDate);
  }, []);

  useEffect(() => {
    if (
      validator.isNumeric(quantity.toString()) &&
      validator.isNumeric(plainUnitCost.toString())
    ) {
      let calculatedTotalCost =
        parseFloat(quantity) * parseFloat(plainUnitCost).toFixed(2);

      setTotalCost(formatNumberWithCommas(calculatedTotalCost));
      setPlainTotalCost(calculatedTotalCost);
    } else {
      setTotalCost("");
      setPlainTotalCost("");
    }
  }, [quantity, unitCost]);

  useEffect(() => {
    getCenterNameList();
    getProgramList();
    getunitList();
  }, []);

  useEffect(() => {
    getProjectList();
  }, [program_id]);

  useEffect(() => {
    getActivityNameList();
  }, [project_id]);

  const getProgramList = () => {
    axios
      .get("/api/programs/get")
      .then((response) => {
        const ProgramList = response.data;

        if (Array.isArray(ProgramList)) {
          // console.log("Setting ProgramList:", ProgramList);
          setProgramList(
            ProgramList.sort((a, b) => {
              return a.fieldValue.localeCompare(b.fieldValue);
            })
          );
          if (ProgramList.length === 0) {
            error.programError = "Please add data in Masters";
          }
        } else {
          // console.error("Expected data to be an array but got:", ProgramList);
          setProgramList([]);
        }
      })
      .catch((error) => {
        console.log("Error while gettProgramList List => ", error);
      });
  };

  const getProjectList = () => {
    if (program_id) {
      axios
        .get("/api/subactivity-mapping/get/list/" + program_id)
        .then((response) => {
          // console.log("REsponsedata", response.data);
          const ProjectList = response.data;

          if (Array.isArray(ProjectList)) {
            // console.log("Setting ProjectList:", ProjectList);
            setProjectList(
              ProjectList.sort((a, b) => {
                return a.field2Value.localeCompare(b.field2Value);
              })
            );
          } else {
            // console.error("Expected data to be an array but got:", ProjectList);
            setProjectList([]);
          }
        })
        .catch((error) => {
          console.log("Error while gettProjectList List => ", error);
        });
    }
  };

  const getActivityNameList = () => {
    axios
      .get("/api/subactivity-mapping/get/list/" + program_id + "/" + project_id)
      .then((response) => {
        const ActivityNameList = response.data;

        if (Array.isArray(ActivityNameList)) {
          // console.log("Setting ActivityNameList:", ActivityNameList);
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

  const getunitList = () => {
    axios
      .get("/api/units/get")
      .then((response) => {
        const unitList = response.data;

        if (Array.isArray(unitList)) {
          // console.log("Setting unitList:", unitList);
          setUnitList(unitList);
        } else {
          // console.error("Expected data to be an array but got:", unitList);
          setUnitList([]);
        }
      })
      .catch((error) => {
        console.log("Error while gettunitList List => ", error);
      });
  };

  const getCenterNameList = () => {
    axios
      .get("/api/centers/list")
      .then((response) => {
        const CenterNameList = response.data;

        if (Array.isArray(CenterNameList)) {
          // console.log("Setting CenterNameList:", CenterNameList);
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
    } catch (error) {
      console.error("Error fetching subactivities:", error);
    }
  };

  useEffect(() => {
    if (params._id) {
      if (params._id && params._id.includes("_")) {
        var ID = params._id.split("_")[1];
        var URL = "/api/approval-details/get/one/";
        setEdit(false);
      } else {
        var ID = params._id;
        var URL = "/api/utilization-details/get/one/";
        setEdit(true);
      }
      axios
        .get(URL + ID)
        // .get("/api/utilization-details/get/one/" + params._id)
        .then(async (response) => {
          setCenterName(response.data[0]?.centerName ? response.data[0]?.centerName : "" );
          setCenter_id(response.data[0]?.center_id ? response.data[0]?.center_id : "" );
          setApprovalDate(moment(response.data[0].approvalDate).format("YYYY-MM-DD") );

          setApprovalNo(response.data[0]?.approvalNo ? response.data[0]?.approvalNo : "" );

          setVoucherDate(response.data[0]?.voucherDate ? response.data[0]?.voucherDate : "" );
          setProgram(response.data[0]?.program ? response.data[0]?.program : "" );
          setProgram_id(response.data[0]?.program_id ? response.data[0]?.program_id : "" );
          setProject(response.data[0]?.project ? response.data[0]?.project : "" );
          setProject_id(response.data[0]?.project_id ? response.data[0]?.project_id : "" );
          setActivityName(response.data[0]?.activityName ? response.data[0]?.activityName : "" );
          setActivityName_id(response.data[0]?.activityName_id  ? response.data[0]?.activityName_id  : "" );
          // setSubActivityName(response.data[0]?.subactivityName ? response.data[0]?.subactivityName:"");
          // setSubActivityName_id(response.data[0]?.subactivityName_id ? response.data[0]?.subactivityName_id:"");
          setUnit(response.data[0]?.unit ? response.data[0]?.unit : "");
          setUnitCost(response.data[0]?.unitCost  ? formatNumberWithCommas(response.data[0]?.unitCost)  : 0 );
          setPlainUnitCost(response.data[0]?.unitCost ? response.data[0]?.unitCost : 0 );
          setTotalCost(response.data[0]?.totalCost  ? formatNumberWithCommas(response.data[0]?.totalCost)  : 0 );
          setPlainTotalCost(response.data[0]?.totalCost ? response.data[0]?.totalCost : 0 );
          setQuantity(response.data[0]?.quantity ? response.data[0]?.quantity : 0 );
          setGrant(response.data[0]?.sourceofFund.grant  ? formatNumberWithCommas(response.data[0]?.sourceofFund.grant)  : 0 );
          setPlainGrant(response.data[0]?.sourceofFund.grant  ? response.data[0]?.sourceofFund.grant  : 0 );
          setCC(response.data[0]?.sourceofFund.CC  ? formatNumberWithCommas(response.data[0]?.sourceofFund.CC)  : 0 );
          setPlainCC(response.data[0]?.sourceofFund.CC  ? response.data[0]?.sourceofFund.CC  : 0 );
          setLHWRF(response.data[0]?.sourceofFund.LHWRF  ? formatNumberWithCommas(response.data[0]?.sourceofFund.LHWRF)  : 0 );
          setPlainLHWRF(response.data[0]?.sourceofFund.LHWRF  ? response.data[0]?.sourceofFund.LHWRF  : 0 );
          setConvergence(response.data[0]?.convergence  ? formatNumberWithCommas(response.data[0]?.convergence)  : 0 );
          setPlainConvergence(response.data[0]?.convergence ? response.data[0]?.convergence : 0 );
          setNoOfHouseholds(response.data[0]?.noOfHouseholds  ? formatNumberWithCommas(response.data[0]?.noOfHouseholds)  : 0 );
          setPlainNoOfHouseholds(response.data[0]?.noOfHouseholds  ? response.data[0]?.noOfHouseholds  : 0 );
          setNoOfBeneficiaries(response.data[0]?.noOfBeneficiaries  ? formatNumberWithCommas(response.data[0]?.noOfBeneficiaries)  : 0 );
          setPlainNoOfBeneficiaries(response.data[0]?.noOfBeneficiaries  ? response.data[0]?.noOfBeneficiaries  : 0 );
          setActivityStatus(response.data[0]?.activityStatus  ? response.data[0]?.activityStatus  : "" );
          setConvergenceAgencyName(response.data[0]?.convergenceAgencyName  ? response.data[0]?.convergenceAgencyName  : "" );
          setConvergenceDocumentName(response.data[0]?.convergenceDocumentName  ? response.data[0]?.convergenceDocumentName  : "" );
          setConvergenceNote(response.data[0]?.convergenceNote  ? response.data[0]?.convergenceNote  : "" );
          setVoucherDocumentUrl(response.data[0]?.voucherDocumentUrl  ? response.data[0]?.voucherDocumentUrl  : "" );
          setVoucherDocumentName(response.data[0]?.voucherDocumentName  ? response.data[0]?.voucherDocumentName  : "" );
          setConvergenceDocumentUrl(response.data[0]?.convergenceDocumentUrl  ? response.data[0]?.convergenceDocumentUrl  : "" );
          setS3ConvergenceDocumentName(response.data[0]?.S3ConvergenceDocumentName  ? response.data[0]?.S3ConvergenceDocumentName  : "" );
          // const newDocumentUrls = response.data[0].documentUrl.filter(
          //   (item) => item.trim() !== ""
          // );

          // setDocumentUrl(newDocumentUrls);

          // setDocumentUrl(
          //   response.data[0]?.documentUrl ? response.data[0]?.documentUrl : ""
          // );

          // const newDocumentName = response.data[0].documentName.filter(
          //   (item) => item.trim() !== ""
          // );

          // setDocumentName(newDocumentName);

          // Fetch subactivities for the selected activity
          await fetchSubActivities(
            response.data[0]?.activityName_id
              ? response.data[0]?.activityName_id
              : ""
          );

          // Set the subactivity name and ID after fetching subactivities
          setSubActivityName(
            response.data[0]?.subactivityName
              ? response.data[0]?.subactivityName
              : ""
          );
          setSubActivityName_id(
            response.data[0]?.subactivityName_id
              ? response.data[0]?.subactivityName_id
              : ""
          );
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

    if (validator.isEmpty(approvalDate)) {
      inputIsValid = false;
      errorMsg.approvalDateError = "This field is required.";
    }

    if (validator.isEmpty(approvalNo)) {
      inputIsValid = false;
      errorMsg.approvalNoError = "This field is required.";
    }

    if (validator.isEmpty(voucherDate)) {
      inputIsValid = false;
      errorMsg.voucherDateError = "This field is required.";
    }

    if (validator.isEmpty(program)) {
      inputIsValid = false;
      errorMsg.programError = "This field is required.";
    }

    if (validator.isEmpty(project)) {
      inputIsValid = false;
      errorMsg.projectError = "This field is required.";
    }

    if (validator.isEmpty(activityName)) {
      inputIsValid = false;
      errorMsg.activityNameError = "This field is required.";
    }

    if (validator.isEmpty(subactivityName)) {
      inputIsValid = false;
      errorMsg.subactivityNameError = "This field is required.";
    }

    if (validator.isEmpty(unit)) {
      inputIsValid = false;
      errorMsg.unitError = "This field is required.";
    }

    if (validator.isEmpty(plainUnitCost.toString())) {
      inputIsValid = false;
      errorMsg.unitCostError = "This field is required.";
    } else if (!validator.isNumeric(plainUnitCost.toString())) {
      inputIsValid = false;
      errorMsg.unitCostError = "Only Numeric Values";
    }

    if (validator.isEmpty(totalCost.toString())) {
      inputIsValid = false;
      errorMsg.totalCostError = "This field is required.";
    } else if (!validator.isNumeric(parseInt(totalCost).toString())) {
      inputIsValid = false;
      errorMsg.totalCostError = "Only Numeric Values";
    }

    if (validator.isEmpty(quantity.toString())) {
      inputIsValid = false;
      errorMsg.quantityError = "This field is required.";
    } else if (!validator.isNumeric(quantity.toString())) {
      inputIsValid = false;
      errorMsg.quantityError = "Only Numeric Values";
    }

    if (validator.isEmpty(plainGrant.toString())) {
      inputIsValid = false;
      errorMsg.grantError = "This field is required.";
    } else if (!validator.isNumeric(plainGrant.toString())) {
      inputIsValid = false;
      errorMsg.grantError = "Only Numeric Values";
    }

    if (validator.isEmpty(plainCC.toString())) {
      inputIsValid = false;
      errorMsg.CCError = "This field is required.";
    } else if (!validator.isNumeric(plainCC.toString())) {
      inputIsValid = false;
      errorMsg.CCError = "Only Numeric Values";
    }

    if (validator.isEmpty(plainLHWRF.toString())) {
      inputIsValid = false;
      errorMsg.LHWRFError = "This field is required.";
    } else if (!validator.isNumeric(plainLHWRF.toString())) {
      inputIsValid = false;
      errorMsg.LHWRFError = "Only Numeric Values";
    }

    if (validator.isEmpty(plainNoOfHouseholds.toString())) {
      inputIsValid = false;
      errorMsg.noOfHouseholdsError = "This field is required.";
    } else if (!validator.isNumeric(plainNoOfHouseholds.toString())) {
      inputIsValid = false;
      errorMsg.noOfHouseholdsError = "Only Numeric Values";
    }

    if (validator.isEmpty(plainNoOfBeneficiaries.toString())) {
      inputIsValid = false;
      errorMsg.noOfBeneficiariesError = "This field is required.";
    } else if (!validator.isNumeric(plainNoOfBeneficiaries.toString())) {
      inputIsValid = false;
      errorMsg.noOfBeneficiariesError = "Only Numeric Values";
    }

    // if (!validator.isNumeric(convergence.toString())) {
    //   inputIsValid = false;
    //   errorMsg.convergenceError = "Only Numeric Values";
    // }

    if (validator.isEmpty(activityStatus)) {
      inputIsValid = false;
      errorMsg.statusError = "This field is required.";
    }

    const totalCostValue = parseFloat(plainTotalCost);
    const sumOfContributions =
      parseFloat(plainGrant) + parseFloat(plainCC) + parseFloat(plainLHWRF);

    if (
      !isNaN(totalCostValue) &&
      !isNaN(sumOfContributions) &&
      totalCostValue !== sumOfContributions
    ) {
      inputIsValid = false;
      errorMsg.contributionError =
        "The sum of Grant, Community Contribution, and LHWRF must equal the total cost.";
    }

    console.log("errors", errorMsg);

    setError(errorMsg);
    return inputIsValid;
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
    if (validation()) {
      console.log("validation success");
      let formValues = {
        center_id: center_id ? center_id : userDetails.center_id,
        centerName: centerName ? centerName : userDetails.centerName,
        approvalDate,
        approvalNo,
        voucherDate,
        program_id,
        program,
        project_id,
        project,
        activityName_id,
        activityName,
        subactivityName_id,
        subactivityName,
        unit,
        unitCost: plainUnitCost,
        totalCost: plainTotalCost,
        quantity,
        grant: plainGrant,
        CC: plainCC,
        LHWRF: plainLHWRF,
        convergence: plainConvergence ? plainConvergence : 0,
        activityStatus,
        noOfHouseholds: plainNoOfHouseholds,
        noOfBeneficiaries: plainNoOfBeneficiaries,
        convergenceAgencyName: convergenceAgencyName,
        convergenceDocumentName: convergenceDocumentName,
        convergenceNote,
        voucherDocumentUrl,
        voucherDocumentName,
        convergenceDocumentUrl,
        S3ConvergenceDocumentName,
        user_id,
      };

      if (params._id && edit) {
        formValues.ID = params._id;
        axios
          .patch("/api/utilization-details/patch", formValues)
          .then((response) => {
            if (response.data.success) {
              if (response.data.data.modifiedCount > 0) {
                Swal.fire(" ", "Utilization details updated successfully!!");
                localStorage.removeItem("approval_id");
                setLoading3(true);
                router.push(
                  "/" +
                    loggedInRole +
                    "/utilization-management/utilization-list"
                );
              } else {
                Swal.fire(
                  " ",
                  "Utilization details data was not changed hence no update!!"
                );
              }
            }
          })
          .catch((error) => {
            console.log("API Error => ", error);
            Swal.fire(" ", "Something went wrong!!");
          });
      } else {
        axios
          .post("/api/utilization-details/post", formValues)
          .then((response) => {
            if (response.data.success) {
              let ID = response.data.insertedLevel._id;
              Swal.fire({
                title: " ",
                text: "Utilization details submitted successfully!!",
              });

              localStorage.removeItem("approval_id");
              setLoading3(true);

              router.push(
                `/${loggedInRole}/utilization-management/utilization-details/${ID}`
              );
            } else {
              Swal.fire(" ", response.data.message);
            }
          })
          .catch((error) => {
            console.log(error);
            setError((prevState) => ({
              ...prevState,
              contributionError: error.response.data.error,
            }));
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

  const handleUnitCostChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      setPlainUnitCost(value); // Update plain numeric value
      setUnitCost(formatNumberWithCommas(value)); // Update displayed value

      setError((prevState) => ({
        ...prevState,
        unitCostError: "",
      }));
    }
  };

  const handleTotalCostChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      // setPlainTotalCost(value); // Update plain numeric value
      // setTotalCost(totalCost); // Update displayed value
      setError((prevState) => ({
        ...prevState,
        totalCostError: "",
      }));
    }
  };

  const handleGrantChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      setPlainGrant(value); // Update plain numeric value
      setGrant(formatNumberWithCommas(value)); // Update displayed value
      setError((prevState) => ({
        ...prevState,
        grantError: "",
      }));
    }
  };

  const handleCCChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      setPlainCC(value); // Update plain numeric value
      setCC(formatNumberWithCommas(value)); // Update displayed value
      setError((prevState) => ({
        ...prevState,
        CCError: "",
      }));
    }
  };

  const handleLHWRFChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      setPlainLHWRF(value); // Update plain numeric value
      setLHWRF(formatNumberWithCommas(value)); // Update displayed value
      setError((prevState) => ({
        ...prevState,
        LHWRFError: "",
      }));
    }
  };

  const handleConvergenceChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      setPlainConvergence(value); // Update plain numeric value
      setConvergence(formatNumberWithCommas(value)); // Update displayed value
      setError((prevState) => ({
        ...prevState,
        LHWRFError: "",
      }));
    }
  };

  const handleNoOfHouseholdsChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      setPlainNoOfHouseholds(value); // Update plain numeric value
      setNoOfHouseholds(formatNumberWithCommas(value)); // Update displayed value
      setError((prevState) => ({
        ...prevState,
        noOfHouseholdsError: "",
      }));
    }
  };

  const handleNoOfBeneficiaryChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(value)) {
      setPlainNoOfBeneficiaries(value); // Update plain numeric value
      setNoOfBeneficiaries(formatNumberWithCommas(value)); // Update displayed value
      setError((prevState) => ({
        ...prevState,
        noOfBeneficiariesError: "",
      }));
    }
  };

  const s3Config = {
    bucketName: process.env.NEXT_PUBLIC_BUCKET_NAME,
    region: process.env.NEXT_PUBLIC_REGION,
    accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_SECRET_KEY,
  };

  // const handleFileChange = (event) => {
  //   event.preventDefault();
  //   var image = [];

  //   if (event.currentTarget.files && event.currentTarget.files[0]) {
  //     for (var i = 0; i < event.currentTarget.files.length; i++) {
  //       var file = event.currentTarget.files[i];
  //       if (file) {
  //         var documentName = file.name;
  //         var fileSize = file.size;
  //         var ext = documentName.split(".").pop();
  //         //   if (
  //         //     ext === "jpg" ||
  //         //     ext === "png" ||
  //         //     ext === "jpeg" ||
  //         //     ext === "JPG" ||
  //         //     ext === "PNG" ||
  //         //     ext === "JPEG" ||
  //         //     ext === "WEBP" ||
  //         //     ext === "webp" ||
  //         //     ext === "pdf" ||
  //         //     ext === "docx"
  //         //   ) {
  //         if (fileSize > 2097152) {
  //           Swal.fire(" ", "Allowed file size is 2 MB");
  //         } else {
  //           if (file) {
  //             var objTitle = { fileInfo: file };
  //             // setImage(objTitle);
  //             image.push(objTitle);
  //           } else {
  //             Swal.fire("File not uploaded");
  //           }
  //         }
  //         //   } else {
  //         //     Swal.fire(
  //         //       "oops",
  //         //       "Allowed file formats are (jpg, png, jpeg, webp)",
  //         //       error
  //         //     );
  //         //     Swal.fire(
  //         //       "Not Supported!",
  //         //       "Allowed file formats are (jpg, png, jpeg, webp, pdf and docx)",
  //         //       "error"
  //         //     );
  //         //   } file types
  //       } //file
  //     } //for
  //     if (event.currentTarget.files) {
  //       main(image).then((formValues) => {
  //         setDocumentUrl((prevImages) => [
  //           ...prevImages,
  //           ...formValues.documentUrls,
  //         ]);
  //         setDocumentName((prevNames) => [
  //           ...prevNames,
  //           ...formValues.documentNames,
  //         ]);
  //         // console.log("formValues",formValues);
  //         //   setDocumentUrl(formValues.image)
  //         //   console.log("New File URl", documentUrl)
  //         // setDelFile(formValues.image);
  //       });
  //     }
  //   }
  //   async function main() {
  //     var formValues = null;
  //     let documentUrls = [];
  //     let documentNames = [];
  //     // for (var j = 0; j < image.length; j++) {
  //     //   const config = {
  //     //     bucketName: process.env.BUCKETNAME,
  //     //     // dirName: response.data.dir,
  //     //     region: process.env.REGION,
  //     //     accessKeyId: process.env.ACCESSKEYID,
  //     //     secretAccessKey: process.env.SECRETACCESSKEY,
  //     //   };
  //     var s3url = await s3upload(image[0]?.fileInfo, s3Config, this);

  //     documentNames.push(image[0].fileInfo.name);
  //     documentUrls.push(s3url);
  //     const formValue = {
  //       documentUrls: documentUrls,
  //       documentNames: documentNames,
  //       activityStatus: "New",
  //     };
  //     formValues = formValue;

  //     // setDocumentUrl(formValues.image)
  //     return Promise.resolve(formValues);
  //   }
  //   function s3upload(image, configuration) {
  //     return new Promise(function (resolve, reject) {
  //       S3FileUpload.uploadFile(image, configuration)
  //         .then((Data) => {
  //           resolve(Data.location);
  //         })
  //         .catch((error) => {
  //           console.log("error", error);
  //         });
  //     });
  //   }
  // };

  const handleVoucherFileChange = async (event) => {
    event.preventDefault();

    const file = event.currentTarget.files?.[0]; // Get only the first file
    if (!file) {
      Swal.fire(" ", "No File Selected, Please select a file to upload.");
      return;
    }

    const fileSize = file.size;
    const allowedSize = 15 * 1024 * 1024; // 2MB
    const allowedExtensions = [
      "jpg",
      "png",
      "jpeg",
      "webp",
      "pdf",
      "docx",
      "xlsx",
    ];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    // Check file size
    if (fileSize > allowedSize) {
      Swal.fire(" ", "File too large, Allowed file size is 15 MB");
      return;
    }

    // Check file type
    if (!allowedExtensions.includes(fileExtension)) {
      Swal.fire(
        " ",
        "Invalid file type, Allowed file formats are jpg, png, jpeg, webp, pdf, xlsx and docx"
      );
      return;
    }

    try {
      const s3url = await s3upload(file, s3Config);

      setVoucherDocumentUrl(s3url); // Store single file URL
      setVoucherDocumentName(file.name); // Store single file name

      Swal.fire(" ", "File uploaded successfully!");
    } catch (error) {
      Swal.fire(" ", "Something went wrong. Try again.");
    }
  };

  const handleConvergenceFileChange = async (event) => {
    event.preventDefault();

    const file = event.currentTarget.files?.[0]; // Get only the first file
    if (!file) {
      Swal.fire(" ", "No File Selected, Please select a file to upload.");
      return;
    }

    const fileSize = file.size;
    const allowedSize = 2 * 1024 * 1024; // 2MB
    const allowedExtensions = [
      "jpg",
      "png",
      "jpeg",
      "webp",
      "pdf",
      "docx",
      "xlsx",
    ];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    // Check file size
    if (fileSize > allowedSize) {
      Swal.fire(" ", "File too large, Allowed file size is 2 MB");
      return;
    }

    // Check file type
    if (!allowedExtensions.includes(fileExtension)) {
      Swal.fire(
        " ",
        "Invalid file type, Allowed file formats are jpg, png, jpeg, webp, pdf, xlsx and docx"
      );
      return;
    }

    try {
      const s3url = await s3upload(file, s3Config);

      setConvergenceDocumentUrl(s3url); // Store single file URL

      setS3ConvergenceDocumentName(file.name);

      Swal.fire(" ", "File uploaded successfully!");
    } catch (error) {
      Swal.fire(" ", "Something went wrong. Try again.");
    }
  };

  // Function to upload to S3
  const s3upload = (file, config) => {
    return new Promise((resolve, reject) => {
      S3FileUpload.uploadFile(file, config)
        .then((data) => resolve(data.location))
        .catch((error) => {
          console.error("S3 Upload Error:", error);
          reject(error);
        });
    });
  };

  // const deleteFile = (index) => {
  //   // setImage(null);
  //   setDocumentUrl((prevImages) => {
  //     return prevImages.filter((_, i) => i !== index);
  //   });

  //   setDocumentName((prevName) => {
  //     return prevName.filter((_, i) => i !== index);
  //   });
  // };

  const deleteVoucherFile = () => {
    setVoucherDocumentUrl("");
    setVoucherDocumentName("");
  };

  const deleteConvergenceFile = () => {
    setConvergenceDocumentUrl("");
    setS3ConvergenceDocumentName("");
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Utilization Form</h1>

            {loggedInRole === "admin" || loggedInRole === "center" ? (
              <div className="flex gap-3 my-6 me-10">
              {loggedInRole === "admin" ?
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
                      //       "/utilization-management/bulk-upload"
                      //   );
                      // }}
                      onClick={() => {
                        // setLoading(true);
                        window.open(
                          `/${loggedInRole}/utilization-management/bulk-upload`,
                          '_self'
                          // "noopener,noreferrer"
                        );
                      }}
                    />
                  )}
                </Tooltip>
                :null}
                <Tooltip
                  content="Utilization List"
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
                      //       "/utilization-management/utilization-list"
                      //   );
                      // }}
                      onClick={() => {
                        // setLoading2(true);
                        window.open(
                          `/${loggedInRole}/utilization-management/utilization-list`,
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
            <div className="rounded-md">
              <div className="w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                {/* <div className="mt-5 mb-0 lg:mb-5 flex lg:flex-row md:flex-col flex-col w-full lg:w-3/4 lg:pe-1.5"> */}
                {loggedInRole === "admin" ? (
                  <div className="flex-1">
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
                          -- Select Center --
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
                <div className="flex-1 mt-4 lg:mt-0">
                  <label htmlFor="approvalDate" className="inputLabel">
                    Approval Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <MdOutlineDateRange className="icon" />
                      </span>
                    </div>
                    <input
                      type="date"
                      name="approvalDate"
                      id="approvalDate"
                      // max={moment().format("YYYY-MM-DD")}
                      max={getCurrentDate()}
                      className={`
                      ${
                        error.approvalDateError
                          ? "stdSelectField py-1.5"
                          : "stdSelectField py-1.5"
                      }
                      ${approvalDate ? "text-black" : "text-gray-400"}
                    `}
                      value={approvalDate}
                      onChange={(e) => {
                        //  if (e.target.value.length > 4) {
                        //    e.target.value = e.target.value.slice(0, 4);
                        //  }
                        setApprovalDate(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          approvalDateError: "",
                        }));
                      }}
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.approvalDateError}
                  </div>
                </div>
                <div className="flex-1 mt-4 lg:mt-0">
                  <label htmlFor="quantity" className="inputLabel">
                    Approval Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <ImListNumbered className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="approvalNo"
                      id="approvalNo"
                      className={
                        error.approvalNoError
                          ? "stdInputField"
                          : "stdInputField"
                      }
                      placeholder="Enter Approval Number"
                      value={approvalNo}
                      onChange={(e) => {
                        setApprovalNo(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          approvalNoError: "",
                        }));
                      }}
                      disabled={!!params._id && edit }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center"></div>
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {/* {error.quantityError} */}
                    {error.approvalNoError && (
                      <span>{error.approvalNoError}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 lg:mt-5 mb-0 lg:mb-5 flex lg:flex-row md:flex-col flex-col ">
                <div className="flex-1 lg:me-4">
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
                        const [program_id, program] = e.target.value.split("|");

                        setProgram(program);
                        setProgram_id(program_id);
                        setError((prevState) => ({
                          ...prevState,
                          programError: "",
                        }));
                      }}
                    >
                      <option value="" disabled className="text-gray-400">
                        -- Select Program --
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
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.programError}
                  </div>
                </div>

                <div className="flex-1 mt-4 lg:mt-0 lg:me-4">
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
                        const [project_id, project] = e.target.value.split("|");
                        // console.log(project);
                        setProject(project);
                        setProject_id(project_id);
                        setError((prevState) => ({
                          ...prevState,
                          projectError: "",
                        }));
                      }}
                    >
                      <option value="" className="text-gray-400">
                        -- Select Project --
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

                <div className="flex-1 mt-4 lg:mt-0 lg:me-4">
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
                      <option value="" className="text-gray-400">
                        -- Select Activity --
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
                <div className="flex-1 mt-4 lg:mt-0">
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
                        // console.log(subActivityName);
                        setSubActivityName(subActivityName);
                        setSubActivityName_id(subActivityName_id);
                        setError((prevState) => ({
                          ...prevState,
                          subactivityNameError: "",
                        }));
                      }}
                    >
                      <option value="" className="text-gray-400">
                        -- Select Sub Activity --
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
              <div className="mt-4 lg:mt-5 mb-0 lg:mb-5 flex lg:flex-row md:flex-col flex-col w-full">
                <div className="lg:flex-1 block lg:flex w-full gap-2 lg:me-4">
                  <div className="w-full">
                    <label htmlFor="quantity" className="inputLabel">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <ImListNumbered className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="quantity"
                        id="quantity"
                        className={
                          error.quantityError
                            ? "stdInputField"
                            : "stdInputField"
                        }
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            quantityError: "",
                          }));
                        }}
                      />
                    </div>
                    <div
                      className="text-red-500 "
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.quantityError && (
                        <span>{error.quantityError}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:flex-1 block lg:flex w-full gap-2 lg:me-4">
                  <div className="w-full mt-4 lg:mt-0">
                    <label htmlFor="subactivityName" className="inputLabel">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      <div className="absolute inset-y-0 left-0 flex lg:hidden items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <RxActivityLog className="icon" />
                        </span>
                      </div>
                      <select
                        name="unit"
                        id="unit"
                        className={`
                          ${
                            error.unitError
                              ? "stdSelectField pl-12 lg:pl-1"
                              : "stdSelectField pl-12 lg:pl-1"
                          } ${unit ? "text-black" : "text-gray-400 font-normal"}
                    `}
                        value={unit}
                        onChange={(e) => {
                          setUnit(e.target.value);
                          setError((prevState) => ({
                            ...prevState,
                            unitError: "",
                          }));
                        }}
                      >
                        <option
                          value=""
                          // selected
                          disabled
                          className="text-gray-400"
                        >
                          -- Select Unit --
                        </option>
                        {unitList?.map((unit, i) => {
                          return (
                            <option
                              className="text-black"
                              key={i}
                              value={`${unit.fieldValue}`}
                            >
                              {unit.fieldValue}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error.unitError}
                    </div>
                  </div>
                </div>

                <div className="flex-1 mt-4 lg:mt-0 lg:me-4">
                  <label htmlFor="unitCost" className="inputLabel">
                    Unit Cost <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <FaIndianRupeeSign className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="unitCost"
                      id="unitCost"
                      className={
                        error.unitCostError ? "stdInputField" : "stdInputField"
                      }
                      placeholder="Enter Unit Cost"
                      value={unitCost}
                      // onChange={(e) => {
                      //   setUnitCost(e.target.value);
                      //   setError((prevState) => ({
                      //     ...prevState,
                      //     unitCostError: "",
                      //   }));
                      // }}
                      onChange={handleUnitCostChange}
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {/* {error.unitCostError} */}
                    {error.unitCostError && <span>{error.unitCostError}</span>}
                  </div>
                </div>

                <div className="flex-1 mt-4 lg:mt-0">
                  <label htmlFor="approvalDate" className="inputLabel">
                    Voucher Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <MdOutlineDateRange className="icon" />
                      </span>
                    </div>
                    <input
                      type="date"
                      name="voucherDate"
                      id="voucherDate"
                      // max={moment().format("YYYY-MM-DD")}
                      max={getCurrentDate()}
                      className={`
                      ${
                        error.voucherDateError
                          ? "stdSelectField"
                          : "stdSelectField"
                      }
                      ${voucherDate ? "text-black" : "text-gray-400"}
                    `}
                      value={voucherDate}
                      onChange={(e) => {
                        setVoucherDate(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          voucherDateError: "",
                        }));
                      }}
                      disabled={!!params._id && edit }
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.voucherDateError}
                  </div>
                </div>

                {/* <div className="flex-1 mt-4 lg:mt-0">
                  <label htmlFor="quantity" className="inputLabel">
                    Voucher Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <ImListNumbered className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="voucherNumber"
                      id="voucherNumber"
                      className={
                        error.voucherNumberError
                          ? "stdInputField"
                          : "stdInputField"
                      }
                      placeholder="Enter Voucher Number"
                      value={voucherNumber}
                      onChange={(e) => {
                        setVoucherNumber(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          voucherNumberError: "",
                        }));
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center"></div>
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.voucherNumberError && (
                      <span>{error.voucherNumberError}</span>
                    )}
                  </div>
                </div> */}
              </div>
              <div className="mt-4 lg:mt-5 mb-0 lg:mb-5 flex lg:flex-row md:flex-col flex-col ">
                <div className="flex-1 lg:me-4">
                  <label htmlFor="totalCost" className="inputLabel">
                    Total Cost <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <FaIndianRupeeSign className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="totalCost"
                      id="totalCost"
                      disabled
                      className={
                        error.totalCostError
                          ? "stdInputField bg-gray-100"
                          : "stdInputField bg-gray-100"
                      }
                      placeholder="Utilization Cost"
                      value={totalCost}
                      // onChange={(e) => {
                      //   setTotalCost(e.target.value);
                      //   setError((prevState) => ({
                      //     ...prevState,
                      //     totalCostError: "",
                      //   }));
                      // }}
                      onChange={handleTotalCostChange}
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.totalCostError && (
                      <span>{error.totalCostError}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 mt-4 lg:mt-0 lg:me-4">
                  <label htmlFor="grant" className="inputLabel">
                    Utilization External Grant{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <FaIndianRupeeSign className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="grant"
                      id="grant"
                      className={
                        error.grantError ? "stdInputField" : "stdInputField"
                      }
                      placeholder="Enter Grant Cost"
                      value={grant}
                      // onChange={(e) => {
                      //   setGrant(e.target.value);
                      //   setError((prevState) => ({
                      //     ...prevState,
                      //     grantError: "",
                      //   }));
                      // }}
                      onChange={handleGrantChange}
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.grantError && <span>{error.grantError}</span>}
                  </div>
                </div>
                <div className="flex-1 mt-4 lg:mt-0 lg:me-4">
                  <label htmlFor="CC" className="inputLabel">
                    Utilization CC <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <FaIndianRupeeSign className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="CC"
                      id="CC"
                      className={
                        error.CCError ? "stdInputField" : "stdInputField"
                      }
                      placeholder="Enter CC Cost"
                      value={CC}
                      // onChange={(e) => {
                      //   setCC(e.target.value);
                      //   setError((prevState) => ({
                      //     ...prevState,
                      //     CCError: "",
                      //   }));
                      // }}
                      onChange={handleCCChange}
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.CCError && <span>{error.CCError}</span>}
                  </div>
                </div>
                <div className="flex-1 mt-4 lg:mt-0">
                  <label htmlFor="LHWRF" className="inputLabel">
                    Utilization LHWRF <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <FaIndianRupeeSign className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="LHWRF"
                      id="LHWRF"
                      className={
                        error.LHWRFError ? "stdInputField" : "stdInputField"
                      }
                      placeholder="Enter LHWRF Cost"
                      value={LHWRF}
                      // onChange={(e) => {
                      //   setLHWRF(e.target.value);
                      //   setError((prevState) => ({
                      //     ...prevState,
                      //     LHWRFError: "",
                      //   }));
                      // }}
                      onChange={handleLHWRFChange}
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.LHWRFError && <span>{error.LHWRFError}</span>}
                  </div>
                </div>
              </div>

              <div
                className="text-red-500"
                style={{ fontSize: "12px", fontWeight: "normal" }}
              >
                {error.contributionError && (
                  <span>{error.contributionError}</span>
                )}
              </div>
              <div className="mt-4 lg:mt-5 mb-0 lg:mb-5 flex lg:flex-row md:flex-col flex-col ">
                <div className="flex-1 mt-4 lg:mt-0 lg:me-4">
                  <label htmlFor="noOfHouseholds" className="inputLabel">
                    Impacted Households <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <CiBank className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="noOfHouseholds"
                      id="noOfHouseholds"
                      className={
                        error.noOfHouseholdsError
                          ? "stdInputField"
                          : "stdInputField"
                      }
                      placeholder="Enter Impacted Households"
                      value={noOfHouseholds}
                      // onChange={(e) => {
                      //   setNoOfHouseholds(e.target.value);
                      //   setError((prevState) => ({
                      //     ...prevState,
                      //     noOfHouseholdsError: "",
                      //   }));
                      // }}
                      onChange={handleNoOfHouseholdsChange}
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.noOfHouseholdsError}
                  </div>
                </div>
                <div className="flex-1 mt-4 lg:mt-0 lg:me-4">
                  <label htmlFor="noOfBeneficiaries" className="inputLabel">
                    Reach (Beneficiaries){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <IoPersonCircleOutline className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="noOfBeneficiaries"
                      id="noOfBeneficiaries"
                      className={
                        error.noOfBeneficiariesError
                          ? "stdInputField"
                          : "stdInputField"
                      }
                      placeholder="Enter Reach (Beneficiaries)"
                      value={noOfBeneficiaries}
                      // onChange={(e) => {
                      //   setNoOfBeneficiaries(e.target.value);
                      //   setError((prevState) => ({
                      //     ...prevState,
                      //     noOfBeneficiariesError: "",
                      //   }));
                      // }}
                      onChange={handleNoOfBeneficiaryChange}
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.noOfBeneficiariesError}
                  </div>
                </div>

                <div className="flex-1 mt-4 lg:mt-0 lg:me-4">
                  <label htmlFor="subactivityName" className="inputLabel">
                    Activity Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <RxActivityLog className="icon" />
                      </span>
                    </div>

                    <select
                      name="activityStatus"
                      id="activityStatus"
                      className={`
                          ${
                            error.statusError
                              ? "stdSelectField"
                              : "stdSelectField"
                          } ${activityStatus ? "text-black" : "text-gray-400"}
                    `}
                      value={activityStatus}
                      onChange={(e) => {
                        setActivityStatus(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          statusError: "",
                        }));
                      }}
                    >
                      <option
                        value=""
                        // selected
                        disabled
                        className="text-gray-400"
                      >
                        Select Status
                      </option>
                      <option className="text-black" value="Yet to Start">
                        Yet to Start
                      </option>
                      <option className="text-black" value="In Progress">
                        In Progress
                      </option>
                      <option className="text-black" value="Completed">
                        Completed
                      </option>
                    </select>
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.statusError}
                  </div>
                </div>
                <div className="flex-1 mt-4 lg:mt-0">
                  <label htmlFor="LHWRF" className="inputLabel">
                    Convergence
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <FaIndianRupeeSign className="icon" />
                      </span>
                    </div>
                    <input
                      type="text"
                      name="convergence"
                      id="convergence"
                      className={
                        error.convergenceError
                          ? "stdInputField"
                          : "stdInputField"
                      }
                      placeholder="Enter Convergence"
                      value={convergence}
                      // onChange={(e) => {
                      //   setConvergence(e.target.value);
                      //   setError((prevState) => ({
                      //     ...prevState,
                      //     convergenceError: "",
                      //   }));
                      // }}
                      onChange={handleConvergenceChange}
                    />
                  </div>
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.convergenceError}
                  </div>
                </div>
              </div>
              {convergence ? (
                <div className="mt-4 w-1/2 lg:mt-5 mb-0 lg:mb-5 flex lg:flex-row md:flex-col flex-col ">
                  <div className="flex-1 mt-4 lg:mt-0 lg:me-4">
                    <label
                      htmlFor="convergenceAgencyName"
                      className="inputLabel"
                    >
                      Convergence Agency Name
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <PiBuildingOfficeThin className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="convergenceAgencyName"
                        id="convergenceAgencyName"
                        className={
                          error.convergenceError
                            ? "stdInputField"
                            : "stdInputField"
                        }
                        placeholder="Convergence Agency"
                        value={convergenceAgencyName}
                        // onChange={(e) => {
                        //   setConvergence(e.target.value);
                        //   setError((prevState) => ({
                        //     ...prevState,
                        //     convergenceError: "",
                        //   }));
                        // }}
                        onChange={(e) => {
                          setConvergenceAgencyName(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 mt-4 lg:mt-0 lg:me-2">
                    <label
                      htmlFor="convergenceDocumentName"
                      className="inputLabel"
                    >
                      Convergence Document
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <GrDocument className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="convergenceDocumentName"
                        id="convergenceDocumentName"
                        className={
                          error.convergenceError
                            ? "stdInputField"
                            : "stdInputField"
                        }
                        placeholder="Convergence Document"
                        value={convergenceDocumentName}
                        // onChange={(e) => {
                        //   setConvergence(e.target.value);
                        //   setError((prevState) => ({
                        //     ...prevState,
                        //     convergenceError: "",
                        //   }));
                        // }}
                        onChange={(e) => {
                          setConvergenceDocumentName(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              <div className="mt-4 lg:mt-5 mb-0 lg:mb-5 flex w-full lg:flex-row md:flex-row flex-col">
                <div className="flex-1">
                  <label
                    htmlFor="LHWRF"
                    className="inputLabel"
                    // className="block text-sm font-medium mt-3 me-3 leading-6 text-gray-900"
                  >
                    Remarks
                  </label>
                  {/* <div className="relative mt-2 rounded-md shadow-sm"> */}
                  {/* <input
                      type="textarea"
                      name="convergenceNote"
                      id="convergenceNote"
                      className={
                        error.convergenceNoteError
                          ? "stdInputField w-full h-20"
                          : "stdInputField w-full h-20"
                      }
                      value={convergenceNote}
                      onChange={(e) => {
                        setConvergenceNote(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          convergenceNoteError: "",
                        }));
                      }}
                    /> */}
                  <textarea
                    className="stdInputField pl-2 mt-2"
                    rows={5}
                    value={convergenceNote}
                    onChange={(e) => {
                      setConvergenceNote(e.target.value);
                    }}
                    placeholder="Convergence/Activity details"
                  ></textarea>
                  {/* </div> */}
                  <div
                    className="text-red-500"
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.LHWRFError && (
                      <span>{error.convergenceNoteError}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 mb-5 lg:mb-0">
              <label
                htmlFor="LHWRF"
                className="inputLabel"
                // className="block text-sm font-medium mt-3 me-3 leading-6 text-gray-900"
              >
                Add Voucher attachment
              </label>

              <div className="h-auto">
                <div className="w-fit">
                  <div className="my-3 w-fit">
                    <div
                      className={`flex items-center border border-dashed p-4 rounded-md border-[#c5c5c5]`}
                      // className={`flex items-center border ${
                      //   voucherDocumentUrl.length > 5
                      //     ? "overflow-x-scroll"
                      //     : "overflow-x-hidden"
                      // } border-dashed p-4 rounded-md border-[#c5c5c5]`}
                    >
                      <Tooltip
                        content="Upload files"
                        placement="bottom"
                        arrow={false}
                        className="bg-green"
                      >
                        <label
                          class="flex mt-1 cursor-pointer appearance-none rounded-md text-sm transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-75 w-16 "
                          tabindex="0"
                        >
                          <span
                            for="photo-dropbox"
                            class="flex items-center space-x-2"
                          >
                            <div className="p-3 bg-green rounded-md hover:bg-Green">
                              <svg
                                class="h-8 w-8 stroke-white text-white"
                                viewBox="0 0 256 256"
                              >
                                <path
                                  d="M96,208H72A56,56,0,0,1,72,96a57.5,57.5,0,0,1,13.9,1.7"
                                  fill="none"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  strokeWidth="24"
                                ></path>
                                <path
                                  d="M80,128a80,80,0,1,1,144,48"
                                  fill="none"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  strokeWidth="24"
                                ></path>
                                <polyline
                                  points="118.1 161.9 152 128 185.9 161.9"
                                  fill="none"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  strokeWidth="24"
                                ></polyline>
                                <line
                                  x1="152"
                                  y1="208"
                                  x2="152"
                                  y2="128"
                                  fill="none"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  strokeWidth="24"
                                ></line>
                              </svg>
                            </div>
                          </span>

                          <input
                            id="photo-dropbox"
                            type="file"
                            class="sr-only"
                            onChange={handleVoucherFileChange}
                          />
                        </label>
                      </Tooltip>
                      <div class="font-normal text-gray-600 text-md ps-3 flex items-center w-full">
                        {voucherDocumentUrl !== "" ? ( // &&  voucherDocumentUrl.length > 0
                          // ? voucherDocumentUrl.map((url, index) => {

                          // return (
                          <div className="flex mt-2 px-3">
                            <div className="flex items-center">
                              <div className="text-center w-full border border-dashed border-gray-400 p-1 rounded-md relative">
                                <div className="w-full flex justify-end">
                                  <Tooltip
                                    content="Remove"
                                    className="bg-red-500"
                                    arrow={false}
                                    placement="top"
                                  >
                                    <IoCloseCircleSharp
                                      onClick={() => {
                                        // deleteFile(index);
                                        deleteVoucherFile();
                                      }}
                                      className="hover:text-red-600 cursor-pointer  text-red-500 bg-white text-[18px] z-[2]"
                                    />
                                  </Tooltip>
                                </div>
                                <div className="flex justify-center relative">
                                  <FaRegFileAlt className="text-2xl text-green content-center z-[1]" />
                                </div>
                                <div className="w-full text-center text-nowrap flex pt-1 text-xs">
                                  {/* {voucherDocumentName[index]} */}
                                  {voucherDocumentName}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // );
                          // })
                          "Select files to Attach"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {convergence ? (
              <div className="mt-4 lg:mt-5 mb-5 lg:mb-0">
                <label
                  htmlFor="LHWRF"
                  className="inputLabel"
                  // className="block text-sm font-medium mt-3 me-3 leading-6 text-gray-900"
                >
                  Add Convergence attachment
                </label>

                <div className="h-auto">
                  <div className="w-fit">
                    <div className="my-3 w-fit">
                      <div
                        className={`flex items-center border border-dashed p-4 rounded-md border-[#c5c5c5]`}
                      >
                        <Tooltip
                          content="Upload files"
                          placement="bottom"
                          arrow={false}
                          className="bg-green"
                        >
                          <label
                            class="flex mt-1 cursor-pointer appearance-none rounded-md text-sm transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-75 w-16 "
                            tabindex="0"
                          >
                            <span
                              for="photo-dropbox"
                              class="flex items-center space-x-2"
                            >
                              <div className="p-3 bg-green rounded-md hover:bg-Green">
                                <svg
                                  class="h-8 w-8 stroke-white text-white"
                                  viewBox="0 0 256 256"
                                >
                                  <path
                                    d="M96,208H72A56,56,0,0,1,72,96a57.5,57.5,0,0,1,13.9,1.7"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    strokeWidth="24"
                                  ></path>
                                  <path
                                    d="M80,128a80,80,0,1,1,144,48"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    strokeWidth="24"
                                  ></path>
                                  <polyline
                                    points="118.1 161.9 152 128 185.9 161.9"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    strokeWidth="24"
                                  ></polyline>
                                  <line
                                    x1="152"
                                    y1="208"
                                    x2="152"
                                    y2="128"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    strokeWidth="24"
                                  ></line>
                                </svg>
                              </div>
                            </span>

                            <input
                              id="photo-dropbox"
                              type="file"
                              class="sr-only"
                              onChange={handleConvergenceFileChange}
                            />
                          </label>
                        </Tooltip>
                        <div class="font-normal text-gray-600 text-md ps-3 flex items-center w-full">
                          {convergenceDocumentUrl !== "" ? (
                            // ? convergenceDocumentUrl.map((url, index) => {
                            <div className="flex mt-2 px-3">
                              <div className="flex items-center">
                                <div className="text-center w-full border border-dashed border-gray-400 p-1 rounded-md relative">
                                  <div className="w-full flex justify-end">
                                    <Tooltip
                                      content="Remove"
                                      className="bg-red-500"
                                      arrow={false}
                                      placement="top"
                                    >
                                      <IoCloseCircleSharp
                                        onClick={() => {
                                          // deleteFile(index);
                                          deleteConvergenceFile();
                                        }}
                                        className="hover:text-red-600 cursor-pointer  text-red-500 bg-white text-[18px] z-[2]"
                                      />
                                    </Tooltip>
                                  </div>
                                  <div className="flex justify-center relative">
                                    <FaRegFileAlt className="text-2xl text-green content-center z-[1]" />
                                  </div>
                                  <div className="w-full text-center text-nowrap flex pt-1 text-xs">
                                    {S3ConvergenceDocumentName}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            "Select files to Attach"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            <div className="flex justify-end mb-6">
              <button
                type="submit"
                onClick={handleSubmit}
                className="formButtons"
                style={{ transition: "background-color 0.3s" }}
              >
                {loading3 && params._id && edit ? (
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddUtilization;
