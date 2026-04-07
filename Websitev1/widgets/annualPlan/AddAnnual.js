"use client";
import React, { useState, useEffect } from "react";
import { Tooltip } from "flowbite-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import validator from "validator";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";
import { IoPersonCircleOutline } from "react-icons/io5";
import { CiBank, CiViewList } from "react-icons/ci";
import { FaFileUpload, FaSpinner } from "react-icons/fa";
import { GoProjectRoadmap } from "react-icons/go";
import { RxActivityLog } from "react-icons/rx";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { ImListNumbered } from "react-icons/im";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";

const AddAnnual = () => {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  // console.log("userDetails  =>", userDetails);

  const [centerName, setCenterName] = useState("");
  const [center_id, setCenter_id] = useState("");
  const [year, setYear] = useState("");
  const [quarter, setQuarter] = useState("");
  const [program_id, setProgram_id] = useState("");
  const [program, setProgram] = useState("");
  const [project_id, setProject_id] = useState("");
  const [project, setProject] = useState("");
  const [activityName_id, setActivityName_id] = useState("");
  const [activityName, setActivityName] = useState("");
  const [subactivityName_id, setSubActivityName_id] = useState("");
  const [subactivityName, setSubActivityName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [plainUnitCost, setPlainUnitCost] = useState("");
  const [noOfHouseholds, setNoOfHouseholds] = useState("");
  const [plainNoOfHouseholds, setPlainNoOfHouseholds] = useState("");
  const [noOfBeneficiaries, setNoOfBeneficiaries] = useState("");
  const [plainNoOfBeneficiaries, setPlainNoOfBeneficiaries] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [plainTotalCost, setPlainTotalCost] = useState("");
  const [grant, setGrant] = useState("");
  const [plainGrant, setPlainGrant] = useState("");
  const [CC, setCC] = useState("");
  const [plainCC, setPlainCC] = useState("");
  const [LHWRF, setLHWRF] = useState("");
  const [plainLHWRF, setPlainLHWRF] = useState("");
  const [convergence, setConvergence] = useState("");
  const [plainConvergence, setPlainConvergence] = useState("");
  const [centerNameList, setCenterNameList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [ActivityNameList, setActivityNameList] = useState([]);
  const [subActivityList, setSubActivityList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [error, setError] = useState({});
  const [user_id, setUser_id] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const router = useRouter();
  const params = useParams();

  // const [annualCreateModal, setAnnualCreateModal] = useState(false);
  // const [annualUpdateModal, setAnnualUpdateModal] = useState(false);
  // const [annualModifyModal, setAnnualModifyModal] = useState(false);
  // const [annualErrorModal, setAnnualErrorModal] = useState(false);

  const button = params._id ? "Update" : "Submit";

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const getCurrentQuarter = () => {
    const month = new Date().getMonth() + 1;
    return `Q${Math.ceil(month / 3)}`;
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

    getCenterNameList();
    getunitList();
    getProgramList();
  }, []);

  useEffect(() => {
    const currentFinancialYear = getCurrentFinancialYear();
    const currentFinancialQuarter = getCurrentFinancialQuarter();

    setYear(currentFinancialYear);
    setQuarter(currentFinancialQuarter);
  }, []);

  const getCurrentFinancialYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const isBeforeApril = today < new Date(currentYear, 3, 1); // Before April 1st
    const startYear = isBeforeApril ? currentYear - 1 : currentYear;
    const endYear = startYear + 1;
    return `${startYear}-${endYear.toString().slice(-2)}`;
  };

  const getCurrentFinancialQuarter = () => {
    const today = new Date();
    const currentMonth = today.getMonth();

    // Financial quarters mapping
    if (currentMonth >= 3 && currentMonth <= 5) return "Q1";
    if (currentMonth >= 6 && currentMonth <= 8) return "Q2";
    if (currentMonth >= 9 && currentMonth <= 11) return "Q3";
    return "Q4";
  };

  // useEffect(() => {
  //   if (
  //     validator.isNumeric(quantity.toString()) &&
  //     validator.isNumeric(plainUnitCost.toString())
  //   ) {
  //     let calculatedTotalCost =
  //       parseFloat(quantity) * parseFloat(plainUnitCost).toFixed(2);

  //     setTotalCost(formatNumberWithCommas(calculatedTotalCost));
  //     setPlainTotalCost(calculatedTotalCost);
  //   } else {
  //     setTotalCost(0);
  //     setPlainTotalCost(0);
  //   }
  // }, [quantity, plainUnitCost]);
  useEffect(() => {
    if (
      validator.isNumeric(quantity.toString()) &&
      validator.isNumeric(plainUnitCost.toString())
    ) {
      let calculatedTotalCost =
        parseFloat(quantity) * parseFloat(plainUnitCost);

      // Round to 2 decimals **after** multiplication
      calculatedTotalCost = parseFloat(calculatedTotalCost.toFixed(2));
      console.log("calculatedTotalCost", calculatedTotalCost)

      setTotalCost(formatNumberWithCommas(calculatedTotalCost.toString()));
      setPlainTotalCost(calculatedTotalCost);
    } else {
      setTotalCost(0);
      setPlainTotalCost(0);
    }
  }, [quantity, plainUnitCost]);

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
          setProjectList([]);
          setActivityNameList([]);
          setSubActivityList([]);
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
    if (program_id) {
      axios
        .get("/api/subactivity-mapping/get/list/" + program_id)
        .then((response) => {
          // console.log("getProjectList REsponsedata => ", response.data);
          const ProjectList = response.data;

          if (Array.isArray(ProjectList)) {
            // console.log("Setting ProjectList:", ProjectList);
            setProjectList(
              ProjectList.sort((a, b) => {
                return a.field2Value.localeCompare(b.field2Value);
              })
            );

            setActivityNameList([]);
            setSubActivityList([]);
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

  const getActivityNameList = () => {
    if (program_id && project_id) {
      axios
        .get(
          "/api/subactivity-mapping/get/list/" + program_id + "/" + project_id
        )
        .then((response) => {
          const ActivityNameList = response.data;

          if (Array.isArray(ActivityNameList)) {
            // console.log("Setting ActivityNameList:", ActivityNameList);
            setActivityNameList(
              ActivityNameList.sort((a, b) => {
                return a.field3Value.localeCompare(b.field3Value);
              })
            );
            // setSubActivityList([]);
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

  const getunitList = () => {
    axios
      .get("/api/units/get")
      .then((response) => {
        const unitList = response.data;
        if (Array.isArray(unitList)) {
          // console.log("Setting unitList:", unitList);
          setUnitList(
            unitList.sort((a, b) => {
              return a.fieldValue.localeCompare(b.fieldValue);
            })
          );
        } else {
          console.error("Expected data to be an array but got:", unitList);
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
    fetchSubActivities(program_id, project_id, activityName_id);
  }, [program_id, project_id, activityName_id]);

  const fetchSubActivities = async (
    program_id,
    project_id,
    activityName_id
  ) => {
    // console.log(
    //   "fetchSubActivity activity_id = ",
    //   program_id,
    //   "|",
    //   project_id,
    //   "|",
    //   activityName_id
    // );
    if (program_id && project_id && activityName_id) {
      try {
        const response = await axios.get(
          "/api/subactivity-mapping/get/list/" +
            program_id +
            "/" +
            project_id +
            "/" +
            activityName_id
        );
        // console.log("fetchSubActivities response.data", response);

        if (response.data) {
          setSubActivityList(
            response.data
              ? response.data.sort((a, b) => {
                  return a.inputValue.localeCompare(b.inputValue);
                })
              : response.data
          );
        }
        // console.log("subActivityList", subActivityList.length);
      } catch (error) {
        console.error("Error fetching subactivities:", error);
      }
    }
  };

  useEffect(() => {
    if (params._id) {
      axios
        .get("/api/annual-plans/get/one/" + params._id)
        .then(async (response) => {
          setCenterName(response.data[0].centerName);
          setCenter_id(response.data[0].center_id);
          setYear(response.data[0].year);
          setQuarter(response.data[0].quarter);
          setProgram(response.data[0].program);
          setProgram_id(response.data[0].program_id);
          setProject(response.data[0].project);
          setProject_id(response.data[0].project_id);
          setActivityName(response.data[0].activityName);
          setActivityName_id(response.data[0].activityName_id);
          setQuantity(response.data[0].quantity ? response.data[0].quantity : 0);
          setUnit(response.data[0].unit);
          setUnitCost(formatNumberWithCommas(response.data[0].unitCost) ? formatNumberWithCommas(response.data[0].unitCost) :0);
          setPlainUnitCost(response.data[0].unitCost ? response.data[0].unitCost : 0);

          setNoOfHouseholds(formatNumberWithCommas(response.data[0].noOfHouseholds) ? formatNumberWithCommas(response.data[0].noOfHouseholds) : 0);
          setPlainNoOfHouseholds(response.data[0].noOfHouseholds ? response.data[0].noOfHouseholds : 0);
          setNoOfBeneficiaries(formatNumberWithCommas(response.data[0].noOfBeneficiaries) ? formatNumberWithCommas(response.data[0].noOfBeneficiaries) : 0);;
          setPlainNoOfBeneficiaries(response.data[0].noOfBeneficiaries ? response.data[0].noOfBeneficiaries : 0);
          setTotalCost(formatNumberWithCommas(response.data[0].totalCost) ? formatNumberWithCommas(response.data[0].totalCost) : 0);
          setPlainTotalCost(response.data[0].totalCost ? response.data[0].totalCost : 0);
          setGrant(formatNumberWithCommas(response.data[0].sourceofFund.grant) ? formatNumberWithCommas(response.data[0].sourceofFund.grant) : 0);
          setPlainGrant(response.data[0].sourceofFund.grant ? response.data[0].sourceofFund.grant : 0);
          setCC(formatNumberWithCommas(response.data[0].sourceofFund.CC) ? formatNumberWithCommas(response.data[0].sourceofFund.CC) : 0);
          setPlainCC(response.data[0].sourceofFund.CC  ? response.data[0].sourceofFund.CC : 0);
          setLHWRF(formatNumberWithCommas(response.data[0].sourceofFund.LHWRF) ? formatNumberWithCommas(response.data[0].sourceofFund.LHWRF) : 0);
          setPlainLHWRF(response.data[0].sourceofFund.LHWRF ? response.data[0].sourceofFund.LHWRF : 0);
          setConvergence(formatNumberWithCommas(response.data[0].convergence) ? formatNumberWithCommas(response.data[0].convergence) : 0);
          setPlainConvergence(response.data[0].convergence ? response.data[0].convergence : 0);

          // Fetch subactivities for the selected activity
          if (
            response.data[0].program_id &&
            response.data[0].project_id &&
            response.data[0].activityName_id
          ) {
            await fetchSubActivities(
              response.data[0].program_id,
              response.data[0].project_id,
              response.data[0].activityName_id
            );
          }

          // Set the subactivity name and ID after fetching subactivities

          setSubActivityName(response.data[0].subactivityName);
          setSubActivityName_id(response.data[0].subactivityName_id);
        })
        .catch((error) => {
          console.log("Error Message => ", error);
          Swal.fire(" ", "Something went wrong");
          // setAnnualErrorModal(true);
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

    if (validator.isEmpty(year)) {
      inputIsValid = false;
      errorMsg.yearError = "This field is required.";
    }

    if (validator.isEmpty(quarter)) {
      inputIsValid = false;
      errorMsg.quarterError = "This field is required.";
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

    if (validator.isEmpty(quantity.toString())) {
      inputIsValid = false;
      errorMsg.quantityError = "This field is required.";
    } else if (!validator.isNumeric(quantity.toString())) {
      inputIsValid = false;
      errorMsg.quantityError = "Only Numeric Values";
    }

    if (validator.isEmpty(plainUnitCost.toString())) {
      inputIsValid = false;
      errorMsg.unitCostError = "This field is required.";
    } else if (!validator.isNumeric(plainUnitCost.toString())) {
      inputIsValid = false;
      errorMsg.unitCostError = "Only Numeric Values";
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

    if (validator.isEmpty(totalCost)) {
      inputIsValid = false;
      errorMsg.totalCostError = "This field is required.";
    } else if (!validator.isNumeric(parseInt(totalCost).toString())) {
      inputIsValid = false;
      errorMsg.totalCostError = "Only Numeric Values";
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
    await fetchSubActivities(program_id, project_id, activityName_id);
  };

  const getFinancialYears = () => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Check if today is before April 1st
    const isBeforeApril = today < new Date(currentYear, 3, 1); // April is month 3 (zero-indexed)

    const baseYear = isBeforeApril ? currentYear - 1 : currentYear;

    const years = [];
    for (let i = -2; i <= 2; i++) {
      const startYear = baseYear + i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }

    return years;
  };

  const handleSumbit = (e) => {
    e.preventDefault();
    if (validation()) {
      let formValues = {
        center_id: center_id ? center_id : userDetails.center_id,
        centerName: centerName ? centerName : userDetails.centerName,
        year,
        quarter,
        program_id,
        program,
        project_id,
        project,
        activityName_id,
        activityName,
        subactivityName_id,
        subactivityName,
        quantity,
        unit,
        unitCost: plainUnitCost,
        noOfHouseholds: plainNoOfHouseholds,
        noOfBeneficiaries: plainNoOfBeneficiaries,
        totalCost: plainTotalCost,
        grant: plainGrant,
        CC: plainCC,
        LHWRF: plainLHWRF,
        convergence: plainConvergence ? plainConvergence : 0,
        user_id,
      };

      if (params._id) {
        formValues.ID = params._id;
        axios
          .patch("/api/annual-plans/patch", formValues)
          .then((response) => {
            if (response.data.success) {
              if (response.data.data.modifiedCount > 0) {
                Swal.fire(" ", "Annual plan updated successfully!");
                // setAnnualUpdateModal(true);
                setLoading3(true);
                router.push(
                  "/" + loggedInRole + "/annual-plan-management/annual-list"
                );
              } else {
                Swal.fire(" ", "Annual plan was not changed hence no update!");
                // setAnnualModifyModal(true);
              }
            }
          })
          .catch((error) => {
            console.log("API Error => ", error);
            Swal.fire(" ", "Something went wrong!!");
            // setAnnualErrorModal(true);
          });
      } else {
        axios
          .post("/api/annual-plans/post", formValues)
          .then((response) => {
            if (response.data.success) {
              let ID = response.data.insertedLevel._id;

              Swal.fire(" ", response.data.message);

              setLoading3(true);
              router.push(
                "/" + loggedInRole + "/annual-plan-management/annual-list"
              );

              // setAnnualCreateModal(true);
            } else {
              Swal.fire(" ", response.data.message);
            }
          })
          .catch((error) => {
            Swal.fire(" ", "Something went wrong!!");
            // setAnnualErrorModal(true);
          });
      }
    }
  };

  const formatNumberWithCommas = (number) => {
    if (number) {
      const x = number?.toString()?.split(".");
      const y = x[0];
      let lastThree = y.substring(y.length - 3);
      const otherNumbers = y.substring(0, y.length - 3);
      if (otherNumbers !== "") {
        lastThree = "," + lastThree;
      }
      const formattedNumber =
        otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
      return x.length > 1 ? formattedNumber + "." + x[1] : formattedNumber;
    }
  };

  const handleUnitCostChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (!isNaN(value)) {
      setPlainUnitCost(value);
      setUnitCost(formatNumberWithCommas(value));

      setError((prevState) => ({
        ...prevState,
        unitCostError: "",
      }));
    }
  };

  const handleTotalCostChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (!isNaN(value)) {
      setError((prevState) => ({
        ...prevState,
        totalCostError: "",
      }));
    }
  };

  const handleGrantChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (!isNaN(value)) {
      setPlainGrant(value);
      setGrant(formatNumberWithCommas(value));
      setError((prevState) => ({
        ...prevState,
        grantError: "",
      }));
    }
  };

  const handleCCChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (!isNaN(value)) {
      setPlainCC(value);
      setCC(formatNumberWithCommas(value));
      setError((prevState) => ({
        ...prevState,
        CCError: "",
      }));
    }
  };

  const handleLHWRFChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (!isNaN(value)) {
      setPlainLHWRF(value);
      setLHWRF(formatNumberWithCommas(value));
      setError((prevState) => ({
        ...prevState,
        LHWRFError: "",
      }));
    }
  };

  const handleConvergenceChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (!isNaN(value)) {
      setPlainConvergence(value);
      setConvergence(formatNumberWithCommas(value));
      setError((prevState) => ({
        ...prevState,
        convergenceError: "",
      }));
    }
  };

  const handleNoOfHouseholdsChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (!isNaN(value)) {
      setPlainNoOfHouseholds(value);
      setNoOfHouseholds(formatNumberWithCommas(value));
      setError((prevState) => ({
        ...prevState,
        noOfHouseholdsError: "",
      }));
    }
  };

  const handleNoOfBeneficiaryChange = (e) => {
    let value = e.target.value.replace(/,/g, "");
    if (!isNaN(value)) {
      setPlainNoOfBeneficiaries(value);
      setNoOfBeneficiaries(formatNumberWithCommas(value));
      setError((prevState) => ({
        ...prevState,
        noOfBeneficiariesError: "",
      }));
    }
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Annual Plan</h1>
            {loggedInRole === "admin" || loggedInRole === "center" ? (
              <div className="flex gap-3 my-5 me-10">
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
                      //       "/annual-plan-management/bulk-upload"
                      //   );
                      // }}
                      onClick={() => {
                        // setLoading(true);
                        window.open(
                          `/${loggedInRole}/annual-plan-management/bulk-upload`,
                          '_self'
                          // "noopener,noreferrer"
                        );
                      }}

                    />
                  )}
                </Tooltip>
                <Tooltip
                  content="Annual Plan List"
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
                      //       "/annual-plan-management/annual-list"
                      //   );
                      // }}
                      onClick={() => {
                        // setLoading2(true);
                        window.open(
                          `/${loggedInRole}/annual-plan-management/annual-list`,
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
                {/* <div className="flex lg:flex-row md:flex-col flex-col lg:w-3/4 w-full"> */}
                {loggedInRole === "admin" ? (
                  <div className="flex-1 lg:me-4 mt-5">
                    <label
                      htmlFor="centerName"
                      className="inputLabel"
                      // className="inputLabel"
                    >
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
                          ${
                            error.centerNameError
                              ? "stdSelectField"
                              : "stdSelectField"
                          } ${
                          centerName
                            ? "text-black "
                            : "text-gray-400 font-normal"
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

                <div className="flex-1 lg:me-4 mt-5">
                  <label htmlFor="year" className="inputLabel">
                    Financial Year <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <GoProjectRoadmap className="icon" />
                      </span>
                    </div>
                    <select
                      name="year"
                      id="year"
                      className={`
                          ${
                            error.yearError
                              ? "stdSelectField"
                              : "stdSelectField"
                          } ${year ? "text-black" : "text-gray-400 font-normal"}
                    `}
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          yearError: "",
                        }));
                      }}
                    >
                      <option
                        value=""
                        selected
                        disabled
                        className="text-gray-400"
                      >
                        -- Select Financial Year --
                      </option>
                      {getFinancialYears().map((financialYear) => (
                        <option
                          key={financialYear}
                          value={financialYear}
                          className="text-black"
                        >
                          {financialYear}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="text-red-500 "
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.yearError}
                  </div>
                </div>
                <div className="flex-1 mt-5">
                  <label
                    htmlFor="quarter"
                    // className="inputLabel"
                    className="inputLabel"
                  >
                    Quarter <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                        <GoProjectRoadmap className="icon" />
                      </span>
                    </div>

                    <select
                      name="quarter"
                      id="quarter"
                      className={`
                          ${
                            error.quarterError
                              ? "stdSelectField"
                              : "stdSelectField"
                          } ${
                        quarter ? "text-black" : "text-gray-400 font-normal"
                      }
                    `}
                      value={quarter}
                      onChange={(e) => {
                        setQuarter(e.target.value);
                        setError((prevState) => ({
                          ...prevState,
                          quarterError: "",
                        }));
                      }}
                    >
                      <option
                        value=""
                        selected
                        disabled
                        className="text-gray-400"
                      >
                        -- Select Quarter --
                      </option>

                      <option value="Q1" className="text-black">
                        Q1
                      </option>
                      <option value="Q2" className="text-black">
                        Q2
                      </option>
                      <option value="Q3" className="text-black">
                        Q3
                      </option>
                      <option value="Q4" className="text-black">
                        Q4
                      </option>
                    </select>
                  </div>
                  <div
                    className="text-red-500 "
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.quarterError}
                  </div>
                </div>
              </div>
              <div className="flex lg:flex-row md:flex-col flex-col">
                <div className="flex-1 lg:me-4 mt-5">
                  <label
                    htmlFor="program"
                    // className="inputLabel"
                    className="inputLabel"
                  >
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
        ${program ? "text-black" : "text-gray-400 font-normal"}
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
                      <option value="" className="text-gray-400">
                        -- Select Program --
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

                <div className="flex-1 lg:me-4 mt-5">
                  <label
                    htmlFor="project"
                    // className="inputLabel"
                    className="inputLabel"
                  >
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
        ${project ? "text-black" : "text-gray-400 font-normal"}
      `}
                      value={project_id ? `${project_id}|${project}` : ""}
                      onChange={(e) => {
                        const [project_id, project] = e.target.value.split("|");

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

                <div className="flex-1 lg:me-4 mt-5">
                  <label
                    htmlFor="activityName"
                    // className="inputLabel"
                    className="inputLabel"
                  >
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
        ${activityName ? "text-black" : "text-gray-400 font-normal"}
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

                <div className="flex-1 mt-5">
                  <label htmlFor="subactivityName" className="inputLabel">
                    Sub Activity<span className="text-red-500">*</span>
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
                ${subactivityName ? "text-black" : "text-gray-400 font-normal"}
            `}
                      value={
                        subactivityName_id
                          ? `${subactivityName_id}|${subactivityName}`
                          : ""
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
                    >
                      <option value="" className="text-gray-400">
                        -- Select Sub Activity --
                      </option>
                      {Array.isArray(subActivityList) &&
                        subActivityList.map((subactivity, i) => (
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
              <div className="flex lg:flex-row md:flex-col flex-col">
                <div className="flex-1 flex w-full gap-2 lg:me-4 mt-5">
                  <div className="w-1/2">
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
                      {/* <div className="absolute inset-y-0 right-0 flex items-center"></div> */}
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

                  <div className="w-1/2">
                    <label htmlFor="subactivityName" className="inputLabel">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                      {/* <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                          <RxActivityLog className="icon" />
                        </span>
                      </div> */}
                      <select
                        name="unit"
                        id="unit"
                        className={`
                              ${
                                error.unitError
                                  ? "stdSelectField  pl-12 lg:pl-2"
                                  : "stdSelectField  pl-12 lg:pl-2"
                              } ${
                          unit ? "text-black" : "text-gray-400 font-normal"
                        }
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
                          selected
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

                <div className="flex-1 lg:me-4 mt-5">
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
                    className="text-red-500 "
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.unitCostError && <span>{error.unitCostError}</span>}
                  </div>
                </div>
                <div className="flex-1 lg:me-4 mt-5">
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
                    className="text-red-500 "
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.noOfHouseholdsError}
                  </div>
                </div>
                <div className="flex-1 mt-5">
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
                    className="text-red-500 "
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.noOfBeneficiariesError}
                  </div>
                </div>
              </div>

              <div className="flex lg:flex-row md:flex-col flex-col">
                <div className="flex-1 lg:me-4 mt-5">
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
                      placeholder="Total Cost"
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
                    className="text-red-500 "
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.totalCostError && (
                      <span>{error.totalCostError}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 lg:me-4 mt-5">
                  <label htmlFor="grant" className="inputLabel">
                    External Grant <span className="text-red-500">*</span>
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
                    className="text-red-500 "
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.grantError && <span>{error.grantError}</span>}
                  </div>
                </div>
                <div className="flex-1 lg:me-4 mt-5">
                  <label htmlFor="CC" className="inputLabel">
                    Community Contribution{" "}
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
                    className="text-red-500 "
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.CCError && <span>{error.CCError}</span>}
                  </div>
                </div>
                <div className="flex-1 mt-5">
                  <label htmlFor="LHWRF" className="inputLabel">
                    LHWRF <span className="text-red-500">*</span>
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
                    className="text-red-500 "
                    style={{ fontSize: "12px", fontWeight: "normal" }}
                  >
                    {error.LHWRFError && <span>{error.LHWRFError}</span>}
                  </div>
                </div>
              </div>
              <div
                className="text-red-500 "
                style={{ fontSize: "12px", fontWeight: "normal" }}
              >
                {error.contributionError && (
                  <span>{error.contributionError}</span>
                )}
              </div>
              <div className="mt-5 lg:w-[24%] w-full  flex lg:flex-row md:flex-row flex-col">
                <div className="flex-1">
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
                    {error.LHWRFError && <span>{error.convergenceError}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end mb-6">
              <button
                type="submit"
                onClick={handleSumbit}
                className="formButtons"
                style={{ transition: "background-color 0.3s" }}
              >
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddAnnual;
