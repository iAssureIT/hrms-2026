"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import moment from "moment";
import {
  FaFileDownload,
  FaFileUpload,
  FaImage,
  FaSpinner,
  FaWpforms,
} from "react-icons/fa";
// import GenericReport from "@/widgets/GenericTable/FilterTable.js";
import GenericReport from "./ReportTable";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
import { FaSearch } from "react-icons/fa";
import { Modal, Tooltip } from "flowbite-react";
import * as XLSX from "xlsx";
import Image from "next/image";

function PlantationReport() {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  // console.log("userDetails  =>", userDetails);

  const [centerName, setCenterName] = useState("all");
  const [center_id, setCenter_id] = useState("all");
  const [fromDate, setFromDate] = useState("all");
  const [toDate, setToDate] = useState("all");
  const [district, setDistrict] = useState("all");
  const [block, setBlock] = useState("all");
  const [speciesName, setSpeciesName] = useState("all");
  const [centerNameList, setCenterNameList] = useState([]);
  const [plantationData, setPlantationData] = useState([]);
  const [sitePhotosIndex, setSitePhotosIndex] = useState("");

  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);

  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [photosModal, setPhotosModal] = useState(false);
  const router = useRouter();

  const twoLevelHeader = {
    apply: true,
    firstHeaderData: [
      {
        heading: "-",
        mergedColoums: 5,
        hide: true,
      },
      {
        heading: "Plantation Details",
        mergedColoums: 8,
        hide: false,
      },
    ],
  };

  const tableHeading = {
    centerName: "Center Name",
    project: "Project",
    "farmerDetails.farmerName": "Farmer Name",
    "farmerDetails.aadharCard": "Aadhar Card",
    "locationDetails.gatKasara": "Gat Kasara",
    "locationDetails.village": "Village",
    "locationDetails.block": "Block",
    "locationDetails.district": "District",
    "locationDetails.state": "State",
    "locationDetails.country": "Country",
    "locationDetails.latitude": "Latitude",
    "locationDetails.longitude": "Longitude",
    "plantationDetails[0].plantationDate": "Plantation Date",
    "plantationDetails[0].speciesDetails[0].speciesName": "Species Name",
    "plantationDetails[0].speciesDetails[0].numberOfSaplings":
      "No. of Saplings",
    "plantationDetails[0].speciesDetails[0].avgHeight": "Avg. Height",
    "plantationDetails[0].speciesDetails[0].avgDiameter": "Avg. Diameter",
    "plantationDetails[0].speciesDetails[0].yeild": "Yield",
    "plantationDetails[0].speciesDetails[0].income": "Income",
  };
  // const exportToExcel = () => {
  //   // Create a new workbook and a worksheet
  //   const workbook = XLSX.utils.book_new();
  //   const worksheetData = [Object.values(tableHeading)];
  //   const formvalues = { ...filterData, removePagination: true };
  //   // console.log("formvalues",formvalues)
  //   axios({
  //     method: "get",
  //     url: "/api/reports/post/list/P",
  //   })
  //     .then((response) => {
  //       var downloadData = response.data.tableData;

  //       // Add data to the worksheet
  //       downloadData.forEach((row) => {
  //         const rowData = Object.keys(tableHeading).map((key) => row[key]);
  //         worksheetData.push(rowData);
  //       });

  //       const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  //       XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  //       // Generate Excel file and download
  //       XLSX.writeFile(workbook, tableObjects?.titleMsg + ".xlsx");
  //     })
  //     .catch((error) => {
  //       console.log("Error Message => ", error);
  //       Swal.fire(" ", "Something went wrong");
  //       // setErrorModal(true);
  //     });
  // };

  const getNestedValue = (obj, path) => {
    return path.split(/[.[\]]+/).reduce((acc, part) => {
      if (part && acc) return acc[part];
      return undefined;
    }, obj);
  };

  // useEffect(() => {
  //   getDataExample();
  // }, []);

  // const getDataExample = async () => {
  //   const formValues = {
  //     center_ID: center_id,
  //     fromDate: fromDate,
  //     toDate: toDate,
  //   };

  //   try {
  //     const response = await axios.post(
  //       "/api/plantation/post/list",
  //       formValues
  //     );

  //     console.log("response", response);
  //     console.log("totalRecs", response.data.totalRecs);

  //     if (response.data.success) {
  //       setTotalRecs(response.data.totalRecs);
  //       setTableData(response.data.tableData);
  //     } else {
  //       console.log(response.data.errorMsg);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching filtered data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [Object.values(tableHeading)];
    const formvalues = { ...filterData };

    axios({
      method: "post",
      url: "/api/reports/post/plantation-report",
      data: formvalues,
    })
      .then((response) => {
        const downloadData = response.data.tableData;

        downloadData.forEach((row) => {
          const rowData = Object.keys(tableHeading).map((key) =>
            getNestedValue(row, key)
          );
          worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Plantation Report");
        XLSX.writeFile(workbook, "plantation-report.xlsx");
      })
      .catch((error) => {
        console.log("Error Message => ", error);
        Swal.fire(" ", "Something went wrong");
      });
  };

  const getCurrentDate = () => {
    return moment().format("YYYY-MM-DD");
  };

  useEffect(() => {
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
      setCenter_id("all");
      setCenterName("all");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
      setCenter_id(userDetails.center_id);
      setCenterName(userDetails.centerName);
    } else {
      setLoggedInRole("executive");
      setCenter_id("all");
      setCenterName("all");
    }

    const { startDate, endDate } = getCurrentFinancialYearRange();
    // console.log("startDate",startDate);
    // console.log("endDate",endDate);
    setFromDate(startDate);
    setToDate(endDate);
  }, []);

  const getCurrentFinancialYearRange = () => {
    const today = new Date();

    let financialYearStart = new Date(today.getFullYear(), 3, 1); // April 1st of the current year
    let financialYearEnd = new Date(today.getFullYear() + 1, 2, 31); // March 31st of the next year

    // If today is before April 1st, adjust the financial year range to the previous year
    if (today < financialYearStart) {
      financialYearStart = new Date(today.getFullYear() - 1, 3, 1); // April 1st of the previous year
      financialYearEnd = new Date(today.getFullYear(), 2, 31); // March 31st of the current year
    }

    return {
      startDate: moment(financialYearStart).format("YYYY-MM-DD"),
      endDate: moment(financialYearEnd).format("YYYY-MM-DD"),
    };
  };

  useEffect(() => {
    getPlantationData();
  }, [centerName]);

  const getPlantationData = async () => {
    try {
      const response = await axios.get(
        "/api/plantation/get/list/" + centerName
      );

      setPlantationData(response.data.list);

      console.log(response);
    } catch (error) {
      console.error("Error fetching plantation data:", error);
    }
  };

  const getData = async () => {
    const formValues = {
      searchText: searchText,
      center_ID: center_id,
      centerName: centerName,
      district: district,
      block: block,
      speciesName: speciesName,
      fromDate: moment(fromDate).format("YYYY/MM/DD"),
      toDate: moment(toDate).format("YYYY/MM/DD"),
    };
    setFilterData(formValues);
    console.log("formValues", formValues);
    try {
      const response = await axios.post(
        "/api/reports/post/plantation-report",
        formValues
      );

      console.log("response", response);
      console.log("totalRecs", response.data.totalRecs);

      if (response.data.success) {
        setTotalRecs(response.data.totalRecs);
        setTableData(response.data.tableData);
      } else {
        console.log(response.data.errorMsg);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("center id", center_id);
  console.log("center name", centerName);

  useEffect(() => {
    getData();
  }, [
    // center_id,
    centerName,
    district,
    block,
    speciesName,
    fromDate,
    toDate,
    runCount,
    searchText,
  ]);

  useEffect(() => {
    getCenterNameList();
  }, []);

  const getCenterNameList = () => {
    axios
      .get("/api/centers/list")
      .then((response) => {
        const CenterNameList = response.data;

        if (Array.isArray(CenterNameList)) {
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

  const formatToINR = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(num)
      .replace(/^(\D+)/, "$1 ");
  };

  const formatNumberToCommas = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  function formatAadhaarNumber(aadhaar) {
    // Use regex to add a space after every 4 digits
    return aadhaar.replace(/(.{4})/g, "$1 ");
  }

  const uniqueDistrictNames = [
    ...new Set(plantationData?.map((item) => item?.locationDetails?.district)),
  ];

  const uniqueBlockNames = [
    ...new Set(
      plantationData?.flatMap((item) =>
        item?.plantationDetails?.flatMap((plantation) =>
          plantation?.speciesDetails?.map((specie) => specie.speciesName)
        )
      )
    ),
  ];

  const uniqueSpeciesNames = [
    ...new Set(
      plantationData?.flatMap((item) =>
        item?.plantationDetails?.flatMap((plantation) =>
          plantation?.speciesDetails?.map((specie) => specie.speciesName)
        )
      )
    ),
  ];

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading h-auto content-center">Plantation Report</h1>
          </div>
        </div>

        <div className="px-10">
          <div className="mt-4 mb-0 lg:mb-5 w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
            {loggedInRole === "admin" || loggedInRole === "executive" ? (
              <div className="">
                <label htmlFor="centerName" className="inputLabel">
                  Center
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <select
                    name="centerName"
                    id="centerName"
                    className="stdSelectField  pl-3"
                    value={center_id ? `${center_id}|${centerName}` : ""}
                    onChange={(e) => {
                      const [center_id, centerName] = e.target.value.split("|");
                      setCenterName(centerName?centerName:"all");
                      setCenter_id(center_id?center_id:"all");
                    }}
                  >
                    <option value="" disabled className="text-gray-400">
                      -- Select Center --
                    </option>
                    <option value="all">All</option>
                    {centerNameList?.map((center, i) => (
                      <option
                        className="text-black"
                        key={i}
                        value={`${center?._id}|${center?.centerName}`}
                      >
                        {center?.centerName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}
            <div className="">
              <label htmlFor="program" className="inputLabel">
                District
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="program"
                  id="program"
                  className="stdSelectField pl-3"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select District --
                  </option>
                  <option value="all">All</option>
                  {/* {plantationData?.map((item, i) => {
                    return (
                      <option
                        className="text-black"
                        key={i}
                        value={item?.locationDetails?.district}
                      >
                        {item?.locationDetails?.district}
                      </option>
                    );
                  })} */}
                  {uniqueDistrictNames.map((district, i) => {
                    return (
                      <option className="text-black" key={i} value={district}>
                        {district}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="">
              <label htmlFor="project" className="inputLabel">
                Block
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="project"
                  id="project"
                  className="stdSelectField pl-3"
                  value={block}
                  onChange={(e) => {
                    setBlock(e.target.value);
                  }}
                >
                  <option value="" selected disabled className="text-gray-400">
                    -- Select Block --
                  </option>
                  <option value="all">All</option>
                  {plantationData?.map((item, i) => (
                    <option
                      className="text-black"
                      key={i}
                      value={item.locationDetails?.block}
                    >
                      {item.locationDetails?.block}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="">
              <label htmlFor="activity" className="inputLabel">
                Species
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="activity"
                  id="activity"
                  className="stdSelectField pl-3"
                  value={speciesName}
                  onChange={(e) => {
                    setSpeciesName(e.target.value);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Specie Name --
                  </option>
                  <option value="all">All</option>
                  {uniqueSpeciesNames.map((specie, i) => (
                    <option className="text-black" key={i} value={specie}>
                      {specie}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="">
              <label htmlFor="fromDate" className="inputLabel">
                From Date
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  type="date"
                  name="fromDate"
                  id="fromDate"
                  className="stdInputField pl-3"
                  // max={moment().format("YYYY-MM-DD")}
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="">
              <label htmlFor="toDate" className="inputLabel">
                To Date
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input
                  type="date"
                  name="toDate"
                  id="toDate"
                  className="stdInputField pl-3"
                  // max={moment().format("YYYY-MM-DD")}
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          <section className="mt-5 pt-5 w-full">
            <h1 className="text-xl pb-2 font-semibold  mb-2">
              {/* {tableObjects?.tableName} */}
            </h1>

            <div className="">
              <div className="flex lg:flex-row md:flex-col flex-col mt-2 justify-between w-full">
                <div className="text-sm">
                  <div className="">
                    <label
                      htmlFor="recsPerPage"
                      // className="mb-4 font-semibold"
                      className="inputLabel"
                    >
                      Records per Page
                    </label>
                    <div className="relative mt-2 rounded-md text-gray-500 w-full">
                      <select
                        // className="w-full border mt-2 text-sm"
                        // className="stdSelectField py-1.5"
                        className="stdSelectField pl-3 w-3/4"
                        onChange={(event) => {
                          setRecsPerPage(event.target.value);
                        }}
                      >
                        <option value={10} className="font-normal">
                          10
                        </option>
                        <option value={20} className="font-normal">
                          20
                        </option>
                        <option value={50} className="font-normal">
                          50
                        </option>
                        <option value={100} className="font-normal">
                          100
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex  text-sm lg:-mt-1 mt-5 pl-5 w-1/2 justify-between">
                  <div className="w-full">
                    <label
                      htmlFor="search"
                      //  className="mb-4 font-semibold"
                      className="inputLabel"
                    >
                      Search
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="pr-2 border-r-2">
                          <FaSearch className="icon" />
                        </span>
                      </div>
                      <input
                        type="text"
                        // className="w-full border mt-2 text-sm ps-1 pb-1"
                        className="stdInputField"
                        placeholder="Search"
                        name="search"
                        onChange={(event) => {
                          // console.log("event.target.value => ", event.target.value);
                          setSearchText(event.target.value);
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-7 ml-4">
                    <Tooltip
                      content="Download as Excel"
                      placement="top"
                      className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
                      arrow={false}
                    >
                      <FaFileDownload
                        onClick={exportToExcel}
                        size={"2rem"}
                        className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>

              <div className="table-responsive relative overflow-hidden hover:overflow-auto w-full mt-3">
                {/* <table className="table-auto text-sm text-left rtl:text-right  dark: w-full"> */}
                <table className="table-auto text-sm bottom  border-separate border-spacing-y-2 w-full dark:w-full">
                  <thead className="text-xs uppercase text-wrap bg-white dark:bg-white">
                    <tr className="">
                      {twoLevelHeader.apply === true
                        ? twoLevelHeader.firstHeaderData.map((data, index) => {
                            // console.log('dataIIIIIIIIIIIIIIIIIII',data,index);

                            var lastIndex =
                              twoLevelHeader.firstHeaderData.length;
                            return (
                              <th
                                key={index}
                                colSpan={data.mergedColoums}
                                className={`px-4 py-3 border  ${
                                  index !== lastIndex - 1 && index !== 0
                                    ? "border-l-0"
                                    : index === lastIndex - 1
                                    ? "border-l-0"
                                    : ""
                                } border-grayTwo`}
                              >
                                {data.heading}
                              </th>
                            );
                          })
                        : null}
                    </tr>
                    <tr className="text-left">
                      <th className="text-center px-4 py-3 border border-grayTwo">
                        Sr. No
                      </th>
                      <th className="px-4 py-3 border border-l-0 border-grayTwo">
                        Center Name
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Project Details
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Farmer Details
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Location Details
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Plantation Date
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Species of tree
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        No of Saplings (Nos)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Avg Height of Tree (Feet)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Avg Diameter of Tree (Inches)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Yield (Kg)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Income (Rs)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Site Photos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="border border-grayTwo text-nowrap text-sm">
                    {
                      tableData && tableData.length > 0 ? (
                        tableData.map((value, i) => {
                          return (
                            <tr
                              key={i}
                              className="odd: bg-grayOne  even:bg-white border border-grayTwo  text-gray-900 font-normal"
                            >
                              <td className="text-center px-4 py-2 font-normal border border-grayTwo">
                                {++i}
                              </td>

                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {value?.centerName
                                  ? value?.centerName
                                  : "--NA--"}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {value?.project ? value?.project : "--NA--"}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  {value?.farmerDetails?.farmerName
                                    ? value?.farmerDetails?.farmerName
                                    : "--NA--"}
                                </div>
                                <div>
                                  <span>
                                    <span className="font-semibold">
                                      Aadhaar No.:
                                    </span>{" "}
                                    &nbsp;
                                    {value?.farmerDetails?.aadharCard
                                      ? formatAadhaarNumber(
                                          value?.farmerDetails?.aadharCard
                                        )
                                      : "--NA--"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    <span className="font-semibold">
                                      Gat/Khasra No.:
                                    </span>{" "}
                                    &nbsp;
                                    {value?.locationDetails?.gatKasara
                                      ? value?.locationDetails?.gatKasara
                                      : "--NA--"}
                                  </span>
                                </div>
                                <div>
                                  <span>
                                    <span className="font-semibold">
                                      Village:
                                    </span>{" "}
                                    &nbsp;
                                    {value?.locationDetails?.village
                                      ? value?.locationDetails?.village
                                      : "--NA--"}
                                  </span>
                                </div>
                                <div>
                                  <span>
                                    <span className="font-semibold">
                                      Block:
                                    </span>{" "}
                                    &nbsp;
                                    {value?.locationDetails?.block
                                      ? value?.locationDetails?.block
                                      : "--NA--"}
                                  </span>
                                </div>
                                <div>
                                  <span>
                                    <span className="font-semibold">
                                      Latitude:
                                    </span>{" "}
                                    &nbsp;
                                    {value?.locationDetails?.latitude
                                      ? value?.locationDetails?.latitude
                                      : "--NA--"}
                                  </span>
                                </div>
                                <div>
                                  <span>
                                    <span className="font-semibold">
                                      Longitude:
                                    </span>{" "}
                                    &nbsp;
                                    {value?.locationDetails?.longitude
                                      ? value?.locationDetails?.longitude
                                      : "--NA--"}
                                  </span>
                                </div>
                                <span>
                                  {value?.locationDetails?.district
                                    ? value?.locationDetails?.district
                                    : "--NA--"}
                                  , &nbsp;
                                  {value?.locationDetails?.state
                                    ? value?.locationDetails?.state
                                    : "--NA--"}
                                  , &nbsp;
                                  {value?.locationDetails?.country
                                    ? value?.locationDetails?.country
                                    : "--NA--"}
                                </span>
                              </td>

                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <>
                                  <div className="font-semibold">
                                    Plantation Date
                                  </div>
                                  <div>
                                    {value?.plantationDetails[0]?.plantationDate
                                      ? moment(
                                          value?.plantationDetails[0]
                                            ?.plantationDate
                                        ).format("DD/MM/YYYY")
                                      : "--NA--"}
                                  </div>
                                </>

                                {value?.plantationDetails?.length > 1 && (
                                  <>
                                    <div className="font-semibold">
                                      Inspection Dates
                                    </div>
                                    {value?.plantationDetails
                                      ?.slice(1)
                                      .map((item, index) => (
                                        <div key={index}>
                                          {item?.plantationDate
                                            ? moment(
                                                item?.plantationDate
                                              ).format("DD/MM/YYYY")
                                            : "--NA--"}
                                        </div>
                                      ))}
                                  </>
                                )}
                              </td>

                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {value?.plantationDetails?.map(
                                  (item, index) => {
                                    return item?.speciesDetails?.map(
                                      (specie, index) => {
                                        return (
                                          <div>
                                            {specie?.speciesName
                                              ? specie?.speciesName
                                              : "--NA--"}
                                          </div>
                                        );
                                      }
                                    );
                                  }
                                )}
                              </td>

                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                {value?.plantationDetails?.map(
                                  (item, index) => {
                                    return item?.speciesDetails?.map(
                                      (specie, index) => {
                                        return (
                                          <div>
                                            {specie?.numberOfSaplings
                                              ? formatNumberToCommas(
                                                  specie?.numberOfSaplings
                                                )
                                              : 0}
                                          </div>
                                        );
                                      }
                                    );
                                  }
                                )}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                {value?.plantationDetails?.map(
                                  (item, index) => {
                                    return item?.speciesDetails?.map(
                                      (specie, index) => {
                                        return (
                                          <div>
                                            {specie?.avgHeight
                                              ? formatNumberToCommas(
                                                  specie?.avgHeight
                                                )
                                              : 0}
                                          </div>
                                        );
                                      }
                                    );
                                  }
                                )}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                {value?.plantationDetails?.map(
                                  (item, index) => {
                                    return item?.speciesDetails?.map(
                                      (specie, index) => {
                                        return (
                                          <div>
                                            {specie?.avgDiameter
                                              ? formatNumberToCommas(
                                                  specie?.avgDiameter
                                                )
                                              : 0}
                                          </div>
                                        );
                                      }
                                    );
                                  }
                                )}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                {value?.plantationDetails?.map(
                                  (item, index) => {
                                    return item?.speciesDetails?.map(
                                      (specie, index) => {
                                        return (
                                          <div>
                                            {specie?.yeild
                                              ? formatNumberToCommas(
                                                  specie?.yeild
                                                )
                                              : 0}
                                          </div>
                                        );
                                      }
                                    );
                                  }
                                )}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                {value?.plantationDetails?.map(
                                  (item, index) => {
                                    return item?.speciesDetails?.map(
                                      (specie, index) => {
                                        return (
                                          <div>
                                            {specie.income
                                              ? formatToINR(specie?.income)
                                              : formatToINR(0)}
                                          </div>
                                        );
                                      }
                                    );
                                  }
                                )}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                <div className="flex justify-center">
                                  <Tooltip
                                    content="View Photos"
                                    placement="bottom"
                                    className="bg-green"
                                    arrow={false}
                                  >
                                    <FaImage
                                      className="border me-2 border-gray-500 text-gray-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                      size={"1.3rem"}
                                      onClick={() => {
                                        setPhotosModal(true);
                                        if (i === 1) {
                                          i = 0;
                                          i++;
                                        }
                                        setSitePhotosIndex(i);
                                      }}
                                    />
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : loading ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="text-center text-green text-lg"
                          >
                            <FaSpinner className="animate-spin inline-flex mx-2" />
                          </td>
                        </tr>
                      ) : (
                        <tr className="">
                          <td colSpan={10} className="text-center">
                            No Record Found!
                          </td>
                        </tr>
                      )

                      // ) : (
                      //   <tr>
                      //     <td colSpan="11">
                      //       <h2 className="text-center text-danger py-5  font-semibold ">Data Not Found!</h2>
                      //     </td>
                      //   </tr>
                      // )
                    }
                  </tbody>
                </table>

                <Modal
                  show={photosModal}
                  size="5xl"
                  onClose={() => setPhotosModal(false)}
                  popup
                >
                  <Modal.Header className="modalHeader justify-center">
                    <div className="flex justify-between gap-5">
                      <h1 className="text-white mx-auto">Site Photos</h1>
                      <div
                        className="modalCloseButton"
                        onClick={() => setPhotosModal(false)}
                      >
                        {/* <MdClose className="icon text-white font-medium" /> */}
                      </div>
                    </div>
                  </Modal.Header>
                  <Modal.Body>
                    <div>
                      {console.log(sitePhotosIndex)}
                      {console.log(
                        tableData[sitePhotosIndex]?.plantationDetails
                      )}
                      {tableData
                        ? tableData[sitePhotosIndex]?.plantationDetails?.map(
                            (plantation, i) => {
                              return plantation.sitePhotos.map((photo, i) => {
                                return (
                                  <div className="flex h-auto content-center mt-5">
                                    <img
                                      src={photo}
                                      alt="Site-Photo"
                                      width={150}
                                      height={150}
                                    />
                                  </div>
                                );
                              });
                              // return plantation?.sitePhotos?.map((photo, i) => {
                              //   return (
                              //     <div className="flex">
                              //       <img src={photo} alt="Site-Photo" />
                              //     </div>
                              //   );
                              // });
                              // });
                            }
                          )
                        : "No record found!"}
                    </div>
                  </Modal.Body>
                </Modal>
                {/* <div className="flex justify-center mt-8">
                  <nav aria-label="Page navigation flex">
                    {numOfPages.length > 1 && totalRecs > recsPerPage ? (
                      <ul className="pagination mx-auto ps-5 flex">
                        {pageNumber !== 1 ? (
                          <li
                            className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
                            onClick={() => setPageNumber(--pageNumber)}
                          >
                            <a className="page-link ">
                              &nbsp; <FontAwesomeIcon icon={faAngleLeft} />
                            </a>
                          </li>
                        ) : null}
                        {numOfPages.map((item, i) => {
                          return (
                            <li
                              key={i}
                              className={
                                "page-item hover px-3 border border-gray-400 cursor-pointer text-center border-e-0 font-semibold " +
                                (pageNumber === item ? " active" : "")
                              }
                              onClick={() => {
                                setPageNumber(item);
                              }}
                            >
                              <a className="page-link">{item}</a>
                            </li>
                          );
                        })}
                        {pageNumber !== numOfPages.length ? (
                          <li
                            className="page-item hover px-3 border border-gray-400 cursor-pointer"
                            onClick={() => {
                              setPageNumber(++pageNumber);
                            }}
                          >
                            <a className="page-link ">
                              <FontAwesomeIcon icon={faAngleRight} />
                            </a>
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </nav>
                </div> */}
              </div>
            </div>
          </section>

          {/* <GenericReport
            tableObjects={tableObjects ? tableObjects : {}}
            twoLevelHeader={twoLevelHeader}
            tableHeading={tableHeading}
            setRunCount={setRunCount}
            runCount={runCount}
            recsPerPage={recsPerPage}
            setRecsPerPage={setRecsPerPage}
            filterData={filterData}
            getData={getData}
            tableData={tableData}
            setTableData={setTableData}
            numOfPages={numOfPages}
            setNumOfPages={setNumOfPages}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            searchText={searchText}
            setSearchText={setSearchText}
            totalRecs={totalRecs}
            setTotalRecs={setTotalRecs}
            search={search}
            setSearch={setSearch}
            loading={loading}
          /> */}
        </div>
      </div>
    </section>
  );
}

export default PlantationReport;