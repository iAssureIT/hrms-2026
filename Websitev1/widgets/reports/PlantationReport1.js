"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { MdFileDownload } from "react-icons/md";
import {
  FaFileDownload,
  FaFileUpload,
  FaImage,
  FaSpinner,
  FaWpforms,
} from "react-icons/fa";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
import { FaSearch } from "react-icons/fa";
import { Modal, Tooltip } from "flowbite-react";
// import * as XLSX from "xlsx";
import * as XLSX from "sheetjs-style";

function PlantationReport() {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  const SPECIES_NAMES = process.env.SPECIES_NAMES;
  const speciesArray = SPECIES_NAMES?.split(",")?.map((event) => event?.trim());
  const [speciesData, setSpeciesData] = useState(speciesArray);

  const [centerName, setCenterName] = useState("all");
  const [center_id, setCenter_id] = useState("all");
  const [fromDate, setFromDate] = useState("all");
  const [toDate, setToDate] = useState("all");
  const [district, setDistrict] = useState("all");
  const [block, setBlock] = useState("all");
  const [speciesName, setSpeciesName] = useState("all");
  const [centerNameList, setCenterNameList] = useState([]);
  const [sitePhotosIndex, setSitePhotosIndex] = useState("");
  const [photoType, setPhotoType] = useState("");
  const [inspectionPhotoIndex, setInspectionPhotoIndex] = useState("");
  const [uniqueDistricts, setUniqueDistricts] = useState([]);
  const [uniqueBlocks, setUniqueBlocks] = useState([]);
  const [filterData, setFilterData] = useState([]);

  let [recsPerPage, setRecsPerPage] = useState(10);
  let [numOfPages, setNumOfPages] = useState([1]);
  let [pageNumber, setPageNumber] = useState(1);
  let [runCount, setRunCount] = useState(0);
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
        mergedColoums: 16,
        hide: true,
      },
      {
        heading: "Plantation Details",
        mergedColoums: 8,
        hide: false,
      },
      {
        heading: "Inspection Details",
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

  const getNestedValue = (obj, path) => {
    return path.split(/[.[\]]+/).reduce((acc, part) => {
      if (part && acc) return acc[part];
      return undefined;
    }, obj);
  };

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
    getCenterNameList();

    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
      setCenter_id("all");
      setCenterName("all");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
      setCenter_id(userDetails.center_id);
      setCenterName(userDetails.centerName);
      getCenterData(userDetails.center_id);
    } else {
      setLoggedInRole("executive");
      setCenter_id("all");
      setCenterName("all");
    }
    const { startDate, endDate } = getCurrentFinancialYearRange();
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
    if (centerName !== "all") {
      getCenterData(center_id);
    }
  }, [centerName]);

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
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
    };
    setFilterData(formValues);
    // console.log("formValues", formValues);
    try {
      const response = await axios.post(
        "/api/reports/post/plantation-report",
        formValues
      );

      console.log("getData response => ", response);
      // console.log("totalRecs", response.data.totalRecs);

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

  // console.log("center id", center_id);
  // console.log("center name", centerName);

  useEffect(() => {
    getData();
  }, [
    centerName,
    district,
    block,
    speciesName,
    fromDate,
    toDate,
    runCount,
    searchText,
    pageNumber,
    recsPerPage,
  ]);

  useEffect(() => {
    if (totalRecs > 0) {
      const totalPages = Math.ceil(totalRecs / recsPerPage);

      if (totalPages <= 5) {
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        setNumOfPages(pages);
      } else {
        let pages = [];

        if (pageNumber <= 3) {
          pages = [1, 2, 3, "...", totalPages];
        } else if (pageNumber >= totalPages - 2) {
          pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
        } else {
          pages = [
            1,
            "...",
            pageNumber - 1,
            pageNumber,
            pageNumber + 1,
            "...",
            totalPages,
          ];
        }
        console.log("numOfPages before", numOfPages);
        setNumOfPages([...new Set(pages)]);
      }
    }
  }, [totalRecs, recsPerPage, pageNumber]);

  const handlePageClick = (page) => {
    if (page === "...") return;
    setPageNumber(page);
  };

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
    // Ensure num is a valid number
    const validNum = isNaN(num) || num === null || num === undefined ? 0 : num;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(validNum)
      .replace(/^(\D+)/, "$1 ");
  };

  const formatNumberToCommas = (num) => {
    return num ? new Intl.NumberFormat("en-IN").format(num) : 0;
  };
  function formatAadhaarNumber(aadhaar) {
    // Use regex to add a space after every 4 digits
    return aadhaar.replace(/(.{4})/g, "$1 ");
  }

  const getCenterData = (center_id) => {
    axios
      .get("/api/centers/get/one/" + center_id)
      .then((response) => {
        const uniqueDistricts = [
          ...new Set(
            response.data[0].villagesCovered.map((item) => item.district)
          ),
        ];
        console.log("uniqueDistricts", uniqueDistricts);
        setUniqueDistricts(uniqueDistricts);
        const uniqueBlocks = [
          ...new Set(
            response.data[0].villagesCovered.map((item) => item.block)
          ),
        ];
        setUniqueBlocks(uniqueBlocks);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDownload = async (url, filename) => {
    console.log("handleDownload url", url);
    try {
      axios
        .get(url, { responseType: "blob" })
        .then((response) => {
          const imageBlob = response.data;
          const imageUrl = URL.createObjectURL(imageBlob);

          // Ensure the image element exists
          const imgElement = document.getElementById("imageDisplay");
          if (imgElement) {
            imgElement.src = imageUrl;
            console.log("Image loaded successfully");
          } else {
            console.error("Element with id 'imageDisplay' not found");
          }
          const a = document.createElement("a");
          a.href = imageUrl;
          a.download = filename || "downloaded-image.jpg"; // Set default filename
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          console.log("Download triggered successfully");
        })
        .catch((error) => console.error("CORS Error:", error));
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const downloadExcel = async () => {
    try {
      const formvalues = { ...filterData, removePagination: true };
      const response = await axios.post(
        "/api/reports/post/plantation-report",
        formvalues
      );
      const fullData = response.data.tableData;

      if (!fullData || fullData.length === 0) {
        alert("No data available!");
        return;
      }

      const headers = [
        "Center Name",
        "Program",
        "Project",
        "Activity",
        "Subactivity",
        "Farmer Name",
        "Aadhaar Card No",
        "Gat/Kasara No",
        "Village",
        "Block",
        "District",
        "State",
        "Country",
        "Latitude",
        "Longitude",
        "Plantation Date",
        "Plantation Species Name",
        "Planted Sapling No (Nos)",
        "Avg. Height (ft)",
        "Avg. Diameter (inch)",
        "Yield (kg)",
        "Income (Rs.)",
        "Site Photos (Plantation)",
        "Inspection Date",
        "Inspection Species Name",
        "Survived Sapling No (Nos)",
        "Avg. Height (ft)",
        "Avg. Diameter (inch)",
        "Yield (kg)",
        "Income (Rs.)",
        "Site Photos (Inspection)",
      ];

      const headerRow1 = [
        "Center Name",
        "Program",
        "Project",
        "Activity",
        "Subactivity",
        "Farmer Name",
        "Aadhaar Card No",
        "Gat/Kasara No",
        "Village",
        "Block",
        "District",
        "State",
        "Country",
        "Latitude",
        "Longitude",
        "Plantation Details",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Inspection Details",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ];

      const headerRow2 = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Date",
        "Species Name",
        "Planted Sapling No (Nos)",
        "Avg. Height (ft)",
        "Avg. Diameter (inch)",
        "Yield (kg)",
        "Income (Rs.)",
        "Site Photos",
        "Date",
        "Species Name",
        "Survived Sapling No (Nos)",
        "Avg. Height (ft)",
        "Avg. Diameter (inch)",
        "Yield (kg)",
        "Income (Rs.)",
        "Site Photos",
      ];

      const excelRows = [];

      fullData.forEach((row, index) => {
        const {
          centerName,
          program,
          project,
          activity,
          subActivity,
          farmerDetails,
          locationDetails,
          plantationDetails = [],
        } = row;

        const plantation = plantationDetails[0] || {};
        const inspections =
          plantationDetails.length > 1 ? plantationDetails.slice(1) : [];

        const sharedFields = {
          centerName: centerName || "--NA--",
          program: program || "--NA--",
          project: project || "--NA--",
          activity: activity || "--NA--",
          subactivity: subActivity || "--NA--",
          farmerName: farmerDetails?.farmerName || "--NA--",
          aadhaarCard: farmerDetails?.aadharCard || "--NA--",
          gatNo: locationDetails?.gatKasara || "--NA--",
          village: locationDetails?.village || "--NA--",
          block: locationDetails?.block || "--NA--",
          district: locationDetails?.district || "--NA--",
          state: locationDetails?.state || "--NA--",
          country: locationDetails?.country || "--NA--",
          latitude: locationDetails?.latitude || "--NA--",
          longitude: locationDetails?.longitude || "--NA--",
          plantationDate: plantation.plantationDate || "--NA--",
          plantationSpecies: (plantation.speciesDetails || [])
            .map((s) => s.speciesName)
            .join(", "),
          plantationCount: (plantation.speciesDetails || [])
            .map((s) => s.numberOfSaplings)
            .join(", "),
          plantationHeight: (plantation.speciesDetails || [])
            .map((s) => s.avgHeight)
            .join(", "),
          plantationDiameter: (plantation.speciesDetails || [])
            .map((s) => s.avgDiameter)
            .join(", "),
          plantationYield: (plantation.speciesDetails || [])
            .map((s) => s.yeild)
            .join(", "),
          plantationIncome: (plantation.speciesDetails || [])
            .map((s) => s.income)
            .join(", "),
          plantationPhotos: Array.isArray(plantation.sitePhotos)
            ? plantation.sitePhotos.map((p) => p.uri).join(", ")
            : "--NA--",
        };

        if (inspections.length > 0) {
          inspections.forEach((insp, inspIndex) => {
            const species = insp.speciesDetails?.[0] || {};

            excelRows.push({
              ...(inspIndex === 0
                ? sharedFields
                : Object.fromEntries(
                    Object.keys(sharedFields).map((key) => [key, ""])
                  )),
              inspectionDate: insp.plantationDate || "--NA--",
              inspectionSpecies: species.speciesName || "--NA--",
              inspectionSurvived: species.numberOfTreesSurvived || 0,
              inspectionHeight: species.avgHeight || 0,
              inspectionDiameter: species.avgDiameter || 0,
              inspectionYield: species.yeild || 0,
              inspectionIncome: species.income || 0,
              inspectionPhotos: Array.isArray(insp.sitePhotos)
                ? insp.sitePhotos.map((p) => p.uri).join(", ")
                : "--NA--",
            });
          });
        } else {
          // No inspections; add full row
          excelRows.push({
            ...sharedFields,
            inspectionDate: "",
            inspectionSpecies: "",
            inspectionSurvived: "",
            inspectionHeight: "",
            inspectionDiameter: "",
            inspectionYield: "",
            inspectionIncome: "",
            inspectionPhotos: "",
          });
        }
      });

      const ws = XLSX.utils.aoa_to_sheet([
        headerRow1,
        headerRow2,
        ...excelRows.map(Object.values),
      ]);

      // Merge headers
      ws["!merges"] = [
        ...Array.from({ length: 15 }, (_, i) => ({
          s: { r: 0, c: i },
          e: { r: 1, c: i },
        })),
        { s: { r: 0, c: 15 }, e: { r: 0, c: 22 } }, // Plantation Details
        { s: { r: 0, c: 23 }, e: { r: 0, c: 30 } }, // Inspection Details
      ];

      // Style headers
      const headerCellStyle = {
        alignment: { vertical: "center", horizontal: "center", wrapText: true },
        fill: { patternType: "solid", fgColor: { rgb: "C6EFCE" } },
        font: { bold: true },
        border: {
          top: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
        },
      };

      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < headers.length; c++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c });
          if (!ws[cellAddress]) continue;
          ws[cellAddress].s = headerCellStyle;
        }
      }

      // Column widths
      ws["!cols"] = headers.map(() => ({ wch: 25 }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plantation Report");
      XLSX.writeFile(wb, "plantation_report.xlsx");

      alert("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Failed to export data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
        
    <div className={("container mx-auto transition-all duration-300 ")}>
      <style jsx>{`
        .resizing {
          cursor: col-resize !important;
        }
        .resizing th {
          background-color: rgba(59, 130, 246, 0.1);
        }
        .table-container {
          max-height: 500px; /* Adjust as needed */
          overflow-y: auto;
          position: relative;
        }
        thead {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        thead.header2 {
          top: ${twoLevelHeader && twoLevelHeader.length > 0 ? '48px' : '-4px'};
          z-index: 9;
        }
        table {
          width: 100%;
          table-layout: auto;
        }
        th, td {
          box-sizing: border-box;
        }
      `}</style>
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading h-auto content-center">Plantation Report</h1>
          </div>
        </div>

        <div className="px-10">
          <div className="mt-4 mb-0 lg:mb-5 w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-2 gap-4">
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
                      setCenterName(centerName ? centerName : "all");
                      setCenter_id(center_id ? center_id : "all");
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
                  {uniqueDistricts.map((district, i) => {
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
                  <option value="" disabled className="text-gray-400">
                    -- Select Block --
                  </option>
                  <option value="all">All</option>
                  {uniqueBlocks.map((block, i) => {
                    return (
                      <option className="text-black" key={i} value={block}>
                        {block}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="">
              <label htmlFor="speciesName" className="inputLabel">
                Species
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="speciesName"
                  id="speciesName"
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
                  {/* {console.log("speciesData",speciesData)} */}
                  {speciesData?.map((specie, i) => (
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
            <div className="">
              <div className="flex lg:flex-row md:flex-col flex-col mt-2 justify-between w-full">
                <div className="text-[13px]">
                  <div className="">
                    <label htmlFor="recsPerPage" className="inputLabel">
                      Records per Page
                    </label>
                    <div className="relative mt-2 rounded-md text-gray-500 w-full">
                      <select
                        className="stdSelectField pl-3 w-3/4"
                        onChange={(event) => {
                          setRecsPerPage(event.target.value);
                          setPageNumber(1)
                        }}
                      >
                        <option value={10} className="font-normal">
                          10
                        </option>
                        <option value={50} className="font-normal">
                          50
                        </option>
                        <option value={100} className="font-normal">
                          100
                        </option>
                        <option value={500} className="font-normal">
                          500
                        </option>
                        <option value={1000} className="font-normal">
                          1000
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex  text-[13px] lg:-mt-1 mt-5 pl-5 w-1/2 justify-between">
                  <div className="w-full">
                    <label htmlFor="search" className="inputLabel">
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
                        className="stdInputField"
                        placeholder="Search"
                        name="search"
                        onChange={(event) => {
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
                        onClick={downloadExcel}
                        size={"2rem"}
                        className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>

                  
              <div className="table-responsive table-container relative overflow-hidden hover:overflow-auto w-full mt-3">
                <table className="min-w-full table-fixed border-collapse text-base bottom  border-separate  w-full dark:w-full leading-tight">

                  {/* Two-level header */}
                  <thead className="text-[13px] uppercase bg-white">
                    {/* First row – grouped headers */}
                    <tr>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Sr. No
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Center Name
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Program
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Project
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Activity
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Subactivity
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Farmer Name
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Aadhaar Card No
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Gat/Kasara No
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Village
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Block
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        District
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        State
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Country
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Latitude
                      </th>
                      <th
                        rowSpan={2}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Longitude
                      </th>

                      <th
                        colSpan={8}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Plantation Details
                      </th>

                      <th
                        colSpan={8}
                        className="px-2 py-2 border border-grayTwo text-center align-middle"
                      >
                        Inspection Details
                      </th>
                    </tr>

                    {/* Second row – subheaders */}
                    <tr className="text-left">
                      {/* Plantation Subheaders */}
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Date
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Species Name
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Planted Sapling No (Nos)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Avg. Height (ft)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Avg. Diameter (inch)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Yield (kg)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Income (Rs.)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Site Photos
                      </th>

                      {/* Inspection Subheaders */}
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Date
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Species Name
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Survived Sapling No (Nos)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Avg. Height (ft)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Avg. Diameter (inch)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Yield (kg)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Income (Rs.)
                      </th>
                      <th className="px-2 py-2 border border-grayTwo text-center align-middle">
                        Site Photos
                      </th>
                    </tr>
                  </thead>

                  <tbody className="border border-grayTwo text-nowrap text-[13px]">
                    {tableData && tableData.length > 0 ? (
                      tableData.map((value, i) => {
                        // --------- Plantation (Main) Data ---------
                        const mainDetail = value.plantationDetails?.[0];
                        const plantationSpecies =
                          mainDetail?.speciesDetails || [
                            {
                              speciesName: "--NA--",
                              numberOfSaplings: 0,
                              avgHeight: 0,
                              avgDiameter: 0,
                              yeild: 0,
                              income: 0,
                            },
                          ];
                        const plantationRow = plantationSpecies[0];

                        // --------- Inspection Data ---------
                        const inspections =
                          value.plantationDetails.slice(1) || [];
                        const inspectionRows = inspections.flatMap((insp) => {
                          if (
                            insp?.speciesDetails &&
                            insp.speciesDetails.length > 0
                          ) {
                            return insp.speciesDetails.map((species) => ({
                              ...species,
                              inspectionDate: insp.plantationDate,
                            }));
                          }
                          return [
                            {
                              speciesName: "--NA--",
                              numberOfSaplings: 0,
                              avgHeight: 0,
                              avgDiameter: 0,
                              yeild: 0,
                              income: 0,
                              inspectionDate: insp?.plantationDate || "--NA--",
                            },
                          ];
                        });
                        const totalInspectionRows = inspectionRows.length || 1;

                        return (
                          <React.Fragment key={i}>
                            {Array.from({ length: totalInspectionRows }).map(
                              (_, rowIndex) => (
                                <tr
                                  key={`record-${i}-row-${rowIndex}`}
                                  className="odd:bg-grayOne even:bg-white border border-grayTwo text-gray-900 font-normal"
                                >
                                  {/* Left Side: Plantation Data rendered only once with rowSpan */}
                                  {rowIndex === 0 && (
                                    <>
                                      {/* Sr. No */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="text-center px-2 py-2 border border-grayTwo"
                                      >
                                        {(pageNumber - 1) * recsPerPage + i + 1}
                                      </td>
                                      {/* Center Name */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {value?.centerName || "--NA--"}
                                      </td>
                                      {/* Project Details */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>{value?.program || "--NA--"}</div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo whitespace-normal break-words max-w-xs overflow-hidden"
                                      >
                                        <div>{value?.project || "--NA--"}</div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo whitespace-normal break-words max-w-xs overflow-hidden"
                                      >
                                        <div>{value?.activity || "--NA--"}</div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo whitespace-normal break-words max-w-xs overflow-hidden"
                                      >
                                        <div>
                                          {value?.subActivity || "--NA--"}
                                        </div>
                                      </td>
                                      {/* Farmer Details */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.farmerDetails?.farmerName ||
                                            "--NA--"}
                                        </div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.farmerDetails?.aadharCard
                                            ? formatAadhaarNumber(
                                                value.farmerDetails.aadharCard
                                              )
                                            : "--NA--"}
                                        </div>
                                      </td>
                                      {/* Location Details */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.locationDetails?.gatKasara ||
                                            "--NA--"}
                                        </div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.locationDetails?.village ||
                                            "--NA--"}
                                        </div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.locationDetails?.block ||
                                            "--NA--"}
                                        </div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.locationDetails?.district ||
                                            "--NA--"}
                                        </div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.locationDetails?.state ||
                                            "--NA--"}
                                        </div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.locationDetails?.country ||
                                            "--NA--"}
                                        </div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.locationDetails?.latitude ||
                                            "--NA--"}
                                        </div>
                                      </td>
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        <div>
                                          {value?.locationDetails?.longitude ||
                                            "--NA--"}
                                        </div>
                                      </td>
                                      {/* Plantation Date */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {mainDetail?.plantationDate && mainDetail?.plantationDate !=="-"
                                          ? moment(
                                              mainDetail.plantationDate
                                            ).format("DD/MM/YYYY")
                                          : "--NA--"}
                                      </td>
                                      {/* Plantation Species */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {plantationRow?.speciesName || "--NA--"}
                                      </td>
                                      {/* Plantation No of Saplings */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo text-right"
                                      >
                                        {plantationRow?.numberOfSaplings
                                          ? formatNumberToCommas(
                                              plantationRow.numberOfSaplings
                                            )
                                          : 0}
                                      </td>
                                      {/* Plantation Avg Height */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo text-right"
                                      >
                                        {plantationRow?.avgHeight
                                          ? formatNumberToCommas(
                                              plantationRow.avgHeight
                                            )
                                          : 0}
                                      </td>
                                      {/* Plantation Avg Diameter */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo text-right"
                                      >
                                        {plantationRow?.avgDiameter
                                          ? formatNumberToCommas(
                                              plantationRow.avgDiameter
                                            )
                                          : 0}
                                      </td>
                                      {/* Plantation Yield */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo text-right"
                                      >
                                        {plantationRow?.yeild
                                          ? formatNumberToCommas(
                                              plantationRow.yeild
                                            )
                                          : 0}
                                      </td>
                                      {/* Plantation Income */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo text-right"
                                      >
                                        {isNaN(plantationRow?.income) ||
                                        plantationRow?.income == null
                                          ? "₹ 0"
                                          : formatToINR(plantationRow.income)}
                                      </td>
                                      {/* Plantation Site Photos */}
                                      <td
                                        rowSpan={totalInspectionRows}
                                        className="px-2 py-2 border border-grayTwo text-center"
                                      >
                                        <Tooltip
                                          content="View Plantation Photos"
                                          placement="bottom"
                                          className="bg-green"
                                        >
                                          <FaImage
                                            className="border border-gray-500 text-gray-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                            size={"1.5rem"}
                                            onClick={() => {
                                              setPhotosModal(true);
                                              setSitePhotosIndex(i);
                                              setPhotoType("plantation");
                                            }}
                                          />
                                        </Tooltip>
                                      </td>
                                    </>
                                  )}
                                  {/* ---------- Inspection Data (Right Side) ---------- */}
                                  {/* Inspection Date */}
                                  <td className="px-2 py-2 border border-grayTwo">
                                    {inspectionRows[rowIndex] &&
                                    inspectionRows[rowIndex].inspectionDate
                                      ? moment(
                                          inspectionRows[rowIndex]
                                            .inspectionDate
                                        ).format("DD/MM/YYYY")
                                      : "--NA--"}
                                  </td>
                                  {/* Inspection Species */}
                                  <td className="px-2 py-2 border border-grayTwo">
                                    {inspectionRows[rowIndex]?.speciesName ||
                                      "--NA--"}
                                  </td>
                                  {/* Inspection No of Saplings */}
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {inspectionRows[rowIndex]
                                      ?.numberOfTreesSurvived
                                      ? formatNumberToCommas(
                                          inspectionRows[rowIndex]
                                            .numberOfTreesSurvived
                                        )
                                      : 0}
                                  </td>
                                  {/* Inspection Avg Height */}
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {inspectionRows[rowIndex]?.avgHeight
                                      ? formatNumberToCommas(
                                          inspectionRows[rowIndex].avgHeight
                                        )
                                      : 0}
                                  </td>
                                  {/* Inspection Avg Diameter */}
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {inspectionRows[rowIndex]?.avgDiameter
                                      ? formatNumberToCommas(
                                          inspectionRows[rowIndex].avgDiameter
                                        )
                                      : 0}
                                  </td>
                                  {/* Inspection Yield */}
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {inspectionRows[rowIndex]?.yeild
                                      ? formatNumberToCommas(
                                          inspectionRows[rowIndex].yeild
                                        )
                                      : 0}
                                  </td>
                                  {/* Inspection Income */}
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {isNaN(inspectionRows[rowIndex]?.income) ||
                                    inspectionRows[rowIndex]?.income == null
                                      ? "₹ 0"
                                      : formatToINR(
                                          inspectionRows[rowIndex].income
                                        )}
                                  </td>
                                  {/* Inspection Site Photos - Render once per inspection */}
                                  {rowIndex === 0 && (
                                    <td
                                      rowSpan={totalInspectionRows}
                                      className="px-2 py-2 border border-grayTwo text-center"
                                    >
                                      <Tooltip
                                        content="View Inspection Photos"
                                        placement="bottom"
                                        className="bg-green"
                                      >
                                        <FaImage
                                          className="border border-gray-500 text-gray-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                          size={"1.5rem"}
                                          onClick={() => {
                                            setPhotosModal(true);
                                            setSitePhotosIndex(i);
                                            setInspectionPhotoIndex(0); // Use 0 or adjust based on inspection index
                                            setPhotoType("inspection");
                                          }}
                                        />
                                      </Tooltip>
                                    </td>
                                  )}
                                </tr>
                              )
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : loading ? (
                      <tr>
                        <td
                          colSpan={20}
                          className="text-center text-green text-lg"
                        >
                          <FaSpinner className="animate-spin inline-flex mx-2" />
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={20} className="text-center">
                          No Record Found!
                        </td>
                      </tr>
                    )}
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
                      ></div>
                    </div>
                  </Modal.Header>
                  <Modal.Body className="bg-white">
                    <div>
                      {photoType === "plantation" ? (
                        // Show only Plantation Photos
                        // tableData[sitePhotosIndex]?.plantationDetails[0]?.map((plantation, j) => (
                        <div className="grid grid-cols-3 justify-center mx-auto h-auto content-center mt-5 px-2 gap-3">
                          {tableData[sitePhotosIndex]?.plantationDetails[0]
                            .sitePhotos.length > 0
                            ? tableData[
                                sitePhotosIndex
                              ]?.plantationDetails[0].sitePhotos.map(
                                (photo, k) => (
                                  <div
                                    key={k}
                                    className="flex flex-col items-center justify-center w-full h-auto mt-5 gap-3 mx-3"
                                  >
                                    <img
                                      key={k}
                                      id="imageDisplay"
                                      src={photo.uri}
                                      alt="Plantation Site Photo"
                                      width={150}
                                      height={150}
                                      className="cursor-pointer hover:opacity-70 rounded-lg h-60 w-60"
                                      onClick={() =>
                                        handleDownload(
                                          photo.uri,
                                          `plantation-site-photo-${k}.jpg`
                                        )
                                      }
                                    />

                                    <Tooltip
                                      content="Click here to Download"
                                      placement="top"
                                      className="bg-green dark:bg-green"
                                      arrow={false}
                                    >
                                      <div className="bg-white cursor-pointer mx-auto hover:bg-green text-green hover:text-white font-bold py-2 px-2 rounded border-2 border-green">
                                        <a
                                          href={photo.uri}
                                          target="_blank"
                                          download
                                          className=""
                                        >
                                          <MdFileDownload size={20} />
                                        </a>
                                      </div>
                                    </Tooltip>
                                  </div>
                                )
                              )
                            : "No record found!"}
                        </div>
                      ) : (
                        // ))
                        // Show only Inspection Photos
                        <div className="grid grid-cols-3 justify-center mx-auto h-auto content-center mt-5 px-2 gap-3">
                          {tableData[sitePhotosIndex]?.plantationDetails.slice(
                            1
                          )?.[inspectionPhotoIndex]?.sitePhotos.length > 0
                            ? tableData[sitePhotosIndex]?.plantationDetails
                                .slice(1)
                                ?.[inspectionPhotoIndex]?.sitePhotos?.map(
                                  (photo, k) => (
                                    <div
                                      key={k}
                                      className="flex flex-col items-center justify-center w-full h-auto mt-5 gap-3 mx-3"
                                    >
                                      <img
                                        key={k}
                                        id="imageDisplay"
                                        src={photo.uri}
                                        alt="Inspection Site Photo"
                                        width={150}
                                        height={150}
                                        className="cursor-pointer hover:opacity-70 rounded-lg h-60 w-60"
                                        onClick={() =>
                                          handleDownload(
                                            photo.uri,
                                            `inspection-site-photo-${inspectionPhotoIndex}-${k}.jpg`
                                          )
                                        }
                                      />

                                      <Tooltip
                                        content="Click here to Download"
                                        placement="top"
                                        className="bg-green dark:bg-green"
                                        arrow={false}
                                      >
                                        <div className="bg-white cursor-pointer mx-auto hover:bg-green text-green hover:text-white font-bold py-2 px-2 rounded border-2 border-green">
                                          <a
                                            href={photo.uri}
                                            target="_blank"
                                            download
                                            className=""
                                          >
                                            <MdFileDownload size={20} />
                                          </a>
                                        </div>
                                      </Tooltip>
                                    </div>
                                  )
                                )
                            : "No record found!"}
                        </div>
                      )}
                    </div>
                  </Modal.Body>
                </Modal>

                <div className="flex justify-center my-5">
                  <nav aria-label="Page navigation flex">
                    {/* {console.log("totalRecs > recsPerPage:", totalRecs > recsPerPage)} */}

                    {numOfPages.length > 1 && totalRecs > recsPerPage ? (
                      <ul className="pagination mx-auto ps-5 flex">
                        {pageNumber !== 1 ? (
                          <li
                            className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
                            onClick={() => setPageNumber(--pageNumber)}
                          >
                            <a className="page-link ">
                               <FontAwesomeIcon icon={faAngleLeft} />
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
                                handlePageClick(item);
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
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      </div>
    </section>
  );
}

export default PlantationReport;





