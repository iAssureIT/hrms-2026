"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import moment from "moment";
import {
  FaFileDownload,
  FaImage,
  FaSpinner,
} from "react-icons/fa";
import {
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
import { FaSearch } from "react-icons/fa";
import { Modal, Tooltip } from "flowbite-react";
import * as XLSX from "xlsx";

function WRDReport() {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true })
  );
  const SOIL_TYPES = process.env.SOIL_TYPES;
  const soilTypesArray = SOIL_TYPES?.split(",")?.map((event) => event?.trim());
  const [soilTypes, setSoilTypes] = useState(soilTypesArray);
  
  // console.log("userDetails  =>", userDetails);
  const [centerName, setCenterName] = useState("all");
  const [center_id, setCenter_id] = useState("all");
  const [fromDate, setFromDate] = useState("all");
  const [toDate, setToDate] = useState("all");
  const [district, setDistrict] = useState("all");
  const [block, setBlock] = useState("all");
  
  const [uniqueDistricts,setUniqueDistricts]  = useState([]);  
  const [uniqueBlocks,setUniqueBlocks]= useState([]);  
  const [soilType, setSoilType] = useState("all");
  const [centerNameList, setCenterNameList] = useState([]);
  const [wrdData, setWRDData] = useState([]);
  const [sitePhotosIndex, setSitePhotosIndex] = useState("");
  const [photosType, setPhotosType] = useState("");
  
  const [filterData, setFilterData] = useState([]);
  let [runCount, setRunCount] = useState(0);

  const [tableData, setTableData] = useState([]);
  let [recsPerPage, setRecsPerPage] = useState(10);
  let [numOfPages, setNumOfPages] = useState([1]);
  let [pageNumber, setPageNumber] = useState(1);
  let [searchText, setSearchText] = useState("-");
  let [totalRecs, setTotalRecs] = useState("-");
  let [search, setSearch] = useState("");
  let [loading, setLoading] = useState(true);
  let startSerialNumber = (pageNumber - 1) * recsPerPage + 1;
  const router = useRouter();
  const [photosModal, setPhotosModal] = useState(false);

  const twoLevelHeader = {
    apply: true,
    firstHeaderData: [
      {
        heading: "Project & Farmer Details",
        mergedColoums: 16,
        hide: true,
      },
      {
        heading: "Cost of Structure (Rs)",
        mergedColoums: 4,
        hide: false,
      },
      {
        heading: "Measurement of structure (Meter)",
        mergedColoums: 3,
        hide: false,
      },
      
      {
        heading: "Construction Year Details",
        mergedColoums: 7,
        hide: false,
      },
      {
        heading: "Inspection Details",
        mergedColoums: 9,
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
    "wrdDetails[0].constructionDate": "Construction Date",
    "wrdDetails[0].costOfStructure.LHWRF": "LHWRF",
    "wrdDetails[0].costOfStructure.beneficiary": "Beneficiary",
    "wrdDetails[0].costOfStructure.other": "Other",
    "wrdDetails[0].measurementOfStructure.height": "Height",
    "wrdDetails[0].measurementOfStructure.length": "Length",
    "wrdDetails[0].measurementOfStructure.width": "Width",
    "wrdDetails[0].measurementOfSubmergence.length": "Length",
    "wrdDetails[0].measurementOfSubmergence.width": "Width",
    "wrdDetails[0].measurementOfSubmergence.depth": "Depth",
    "wrdDetails[0].soilType": "Soil Type / Strata of Submergence Area",
    "wrdDetails[0].currentStatus": "Current Status of Structure",
    "wrdDetails[0].beneficiaryNos": "Beneficiary Nos",
    "wrdDetails[0].areaIrrigated": "Area Irrigated (Acre)",
  };
  
  const getNestedValue = (obj, path) => {
    return path.split(/[.[\]]+/).reduce((acc, part) => {
      if (part && acc) return acc[part];
      return undefined;
    }, obj);
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
      getCenterData(userDetails.center_id)
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

  const getCenterData = (center_id) => {
    axios
      .get("/api/centers/get/one/" + center_id)
      .then((response) => {
        const uniqueDistricts = [
          ...new Set(response.data[0].villagesCovered.map((item) => item.district)),
        ];
        console.log("uniqueDistricts",uniqueDistricts)
        setUniqueDistricts(uniqueDistricts)
        const uniqueBlocks = [
          ...new Set(response.data[0].villagesCovered.map((item) => item.block)),
        ];
        setUniqueBlocks(uniqueBlocks)
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
    if(centerName!=="all"){
      getCenterData(center_id)
    }
  }, [centerName]);

  const getData = async () => {
    const formValues = {
      searchText: searchText,
      centerName: centerName,
      district: district,
      block: block,
      soilType: soilType,
      fromDate: moment(fromDate).format("YYYY/MM/DD"),
      toDate: moment(toDate).format("YYYY/MM/DD"),
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
    };
    setFilterData(formValues);
    try {
      const response = await axios.post(
        "/api/reports/post/wrd-report",
        formValues
      );
      // console.log("response", response);
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

  useEffect(() => {
    getData();
  }, [
    // center_id,
    centerName,
    district,
    block,
    soilType,
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
        // console.log("numOfPages before", numOfPages);
        setNumOfPages([...new Set(pages)]);
      }
    }
  }, [totalRecs, recsPerPage, pageNumber]);

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
  const handlePageClick = (page) => {
    if (page === "...") return;
    setPageNumber(page);
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
    // Use regex to add a spce after every 4 digits
    return aadhaar.replace(/(.{4})/g, "$1 ");
  }

  // const downloadExcel = () => {
  //   const table = document.getElementById("wrdtable"); // Table ID
  //   if (!table) {
  //     alert("Table not found!");
  //     return;
  //   }
  
  //   // Convert HTML Table to Worksheet
  //   const ws = XLSX.utils.table_to_sheet(table);
  
  //   // Create Workbook and Append Sheet
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Table Data");
  
  //   // Write & Download Excel File
  //   XLSX.writeFile(wb, "wrd_table.xlsx");
  // };
    
  
  const downloadExcel1 = () => {
    const table = document.getElementById("wrdtable");
    if (!table) {
      alert("Table not found!");
      return;
    }
  
    const rows = Array.from(table.querySelectorAll("tr")).map((row) => {
      return Array.from(row.querySelectorAll("td, th")).map((cell) => {
        const s3Urls = cell.getAttribute("data-s3-urls"); // Extract S3 URLs stored in the <td>
  
        if (s3Urls) {
          try {
            const urlsArray = JSON.parse(s3Urls); // Convert JSON string back to an array
            return urlsArray.length > 0 ? urlsArray.join("\n") : "--NA--"; // Show URLs or --NA-- if empty
          } catch (e) {
            console.error("Error parsing S3 URLs:", e);
            return "--NA--"; // If parsing fails, return a placeholder
          }
        }
  
        return cell.innerText.trim(); // Default to text content if no S3 URLs found
      });
    });
  
    // Convert extracted table data to worksheet
    const ws = XLSX.utils.aoa_to_sheet(rows);
  
    // Create a workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Table Data");
  
    // Save the file
    XLSX.writeFile(wb, "wrd_table.xlsx");
  };
  const downloadExcel = async () => {
    try {
      // 1️⃣ Fetch All Data (Remove Pagination)
      const formvalues = { ...filterData, removePagination: true };
      const response = await axios.post(
        "/api/reports/post/wrd-report",
        formvalues
      );
      const fullData = response.data.tableData;
  
      if (!fullData || fullData.length === 0) {
        alert("No data available!");
        return;
      }
  
      // 2️⃣ Define Headers
      const headers = [
        "Sr. No",
        "Center Name",
        "Program",
        "Project",
        "Activity",
        "SubActivity",
        "Farmer Name",
        "Aadhaar Card",
        "Gat/Khasra No",
        "Village",
        "Block",
        "District",
        "State",
        "Country",
        "Latitude",
        "Longitude",
        "LHWRF",
        "Beneficiary",
        "Other",
        "Total Cost",
        "Height (Meter)",
        "Length (Meter)",
        "Width (Meter)",
        "Construction Date",
        "Main Approx Water Storage (L/W/D)",
        "Soil Type",
        "Current Status (Main)",
        "Beneficiary Nos (Main)",
        "Area Irrigated (Main)",
        "Construction Photos (URIs)",
        "Inspection Date(s)",
        "Inspection Approx Water Storage (L/W/D)",
        "Inspection Status(es)",
        "Inspection Beneficiary Nos",
        "Inspection Area Irrigated",
        "Inspection Photos (URIs)",
      ];
  
      // 3️⃣ Prepare Data for Export
      let dataToExport = [];
  
      fullData.forEach((record, index) => {
        const srNo = index + 1;
        const centerName = record.centerName || "--NA--";
        const program = record.program || "--NA--";
        const project = record.project || "--NA--";
        const activity = record.activity || "--NA--";
        const subActivity = record.subActivity || "--NA--";
        const farmerName = record.farmerDetails?.farmerName || "--NA--";
        const aadhaarCard = record.farmerDetails?.aadharCard
          ? formatAadhaarNumber(record.farmerDetails.aadharCard)
          : "--NA--";
        const gatNo = record.locationDetails?.gatKasara || "--NA--";
        const village = record.locationDetails?.village || "--NA--";
        const block = record.locationDetails?.block || "--NA--";
        const district = record.locationDetails?.district || "--NA--";
        const state = record.locationDetails?.state || "--NA--";
        const country = record.locationDetails?.country || "--NA--";
        const latitude = record.locationDetails?.latitude || "--NA--";
        const longitude = record.locationDetails?.longitude || "--NA--";
  
        // Main construction details => wrdDetails[0]
        const mainConstruction = record.wrdDetails?.[0] || {};
        const mainCost = mainConstruction.costOfStructure || {};
        const mainMeasStruct = mainConstruction.measurementOfStructure || {};
        const mainMeasSubm = mainConstruction.measurementOfSubmergence || {};
  
        const LHWRF = formatToINR(mainCost.LHWRF || 0);
        const beneficiary = formatToINR(mainCost.beneficiary || 0);
        const other = formatToINR(mainCost.other || 0);
        const totalCost = formatToINR(
          (mainCost.LHWRF || 0) +
            (mainCost.beneficiary || 0) +
            (mainCost.other || 0)
        );
  
        const height = formatNumberToCommas(mainMeasStruct.height || 0);
        const lengthM = formatNumberToCommas(mainMeasStruct.length || 0);
        const widthM = formatNumberToCommas(mainMeasStruct.width || 0);
  
        const constructionDate = mainConstruction.constructionDate
          ? moment(mainConstruction.constructionDate).format("DD/MM/YYYY")
          : "--NA--";
  
        // Combine main submergence into one string (L/W/D)
        const mainApproxWaterStorage = `Length: ${formatNumberToCommas(
          mainMeasSubm.length || 0
        )}, Width: ${formatNumberToCommas(mainMeasSubm.width || 0)}, Depth: ${formatNumberToCommas(
          mainMeasSubm.depth || 0
        )}`;
  
        const soilType = mainConstruction.soilType || "--NA--";
        const mainStatus = mainConstruction.currentStatus || "--NA--";
        const mainBeneficiaryNos = formatNumberToCommas(
          mainConstruction.beneficiaryNos || 0
        );
        const mainAreaIrrigated = formatNumberToCommas(
          mainConstruction.areaIrrigated || 0
        );
  
        // Main construction photos => newline separated
        const constructionPhotos = Array.isArray(mainConstruction.sitePhotos)
          ? mainConstruction.sitePhotos.map((p) => p.uri).join("\n")
          : "--NA--";
  
        // 4️⃣ Inspection Details => wrdDetails.slice(1)
        const inspections = record.wrdDetails.slice(1);
  
        // For each column that can have multiple inspection entries, we build multiline strings
        // (If no inspections, it’ll just be "--NA--")
        let inspDates = "--NA--";
        let inspWaterStorage = "--NA--";
        let inspStatuses = "--NA--";
        let inspBeneficiaryNos = "--NA--";
        let inspAreaIrrigated = "--NA--";
        let inspPhotos = "--NA--";
  
        if (inspections.length > 0) {
          // Join each inspection’s data with newlines
          inspDates = inspections
            .map((insp) =>
              insp.constructionDate
                ? moment(insp.constructionDate).format("DD/MM/YYYY")
                : "--NA--"
            )
            .join("\n");
  
          inspWaterStorage = inspections
            .map((insp) => {
              const l = insp.measurementOfSubmergence?.length || 0;
              const w = insp.measurementOfSubmergence?.width || 0;
              const d = insp.measurementOfSubmergence?.depth || 0;
              return `Length: ${formatNumberToCommas(l)}, Width: ${formatNumberToCommas(
                w
              )}, Depth: ${formatNumberToCommas(d)}`;
            })
            .join("\n\n");
  
          inspStatuses = inspections
            .map((insp) => insp.currentStatus || "--NA--")
            .join("\n");
  
          inspBeneficiaryNos = inspections
            .map((insp) => formatNumberToCommas(insp.beneficiaryNos || 0))
            .join("\n");
  
          inspAreaIrrigated = inspections
            .map((insp) => formatNumberToCommas(insp.areaIrrigated || 0))
            .join("\n");
  
          // Flatten all inspection photos
          const allInspectionPhotos = inspections.flatMap((insp) =>
            insp.sitePhotos?.map((p) => p.uri) || []
          );
          inspPhotos =
            allInspectionPhotos.length > 0
              ? allInspectionPhotos.join("\n")
              : "--NA--";
        }
  
        // 5️⃣ Push a single row for this record
        dataToExport.push([
          srNo,
          centerName,
          program,
          project,
          activity,
          subActivity,
          farmerName,
          aadhaarCard,
          gatNo,
          village,
          block,
          district,
          state,
          country,
          latitude,
          longitude,
          LHWRF,
          beneficiary,
          other,
          totalCost,
          height,
          lengthM,
          widthM,
          constructionDate,
          mainApproxWaterStorage,
          soilType,
          mainStatus,
          mainBeneficiaryNos,
          mainAreaIrrigated,
          constructionPhotos,
          inspDates,
          inspWaterStorage,
          inspStatuses,
          inspBeneficiaryNos,
          inspAreaIrrigated,
          inspPhotos,
        ]);
      });
  
      // 6️⃣ Create Worksheet & Append Headers + Data
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataToExport]);
  
      // Optionally set column widths (auto-fit approximation)
      const wsCols = headers.map(() => ({ wch: 25 }));
      ws["!cols"] = wsCols;
  
      // 7️⃣ Create Workbook & Download
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "WRD Report");
      XLSX.writeFile(wb, "WRD_Report.xlsx");
  
      // alert("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Error downloading WRD data:", error);
      alert("Failed to export data.");
    } finally {
      setLoading(false);
    }
  };


  const handleDownload = async (url, filename) => {
    // console.log("handleDownload url",url)
    try {
      axios.get(url, { responseType: "blob" })
      .then(response => {
        const imageBlob = response.data;
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Ensure the image element exists
        const imgElement = document.getElementById("imageDisplay");
        if (imgElement) {
          imgElement.src = imageUrl;
          // console.log("Image loaded successfully");
        } else {
          console.error("Element with id 'imageDisplay' not found");
        }
        const a = document.createElement("a");
        a.href = imageUrl;
        a.download = filename || "downloaded-image.jpg"; // Set default filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // console.log("Download triggered successfully");

      })
      .catch(error => console.error("CORS Error:", error));
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
//   const handleDownload = (url, filename) => {
//     console.log("Downloading:", url);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", filename || "download.jpg");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading h-auto content-center">WRD Report</h1>
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
                        value={`${center._id}|${center.centerName}`}
                      >
                        {center.centerName}
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
                  name="block"
                  id="block"
                  className="stdSelectField pl-3"
                  value={block}
                  onChange={(e) => {
                    setBlock(e.target.value);
                  }}
                >
                  <option value=""  disabled className="text-gray-400">
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
              <label htmlFor="activity" className="inputLabel">
                Soil Type
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                <select
                  name="activity"
                  id="activity"
                  className="stdSelectField pl-3"
                  value={soilType}
                  onChange={(e) => {
                    setSoilType(e.target.value);
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    -- Select Soil Type --
                  </option>
                  <option value="all">All</option>
                  {soilTypes.map((soilType, i) => (
                    <option className="text-black" key={i} value={soilType}>
                      {soilType}
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
                        className={`${
                          recsPerPage
                            ? "stdSelectField pl-3 w-3/4"
                            : "stdSelectField pl-3 w-3/4"
                        } ${recsPerPage ? "selectOption" : "font-normal"}
              `}
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
                  {/* {tableObjects?.searchApply ? ( */}
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
                  {/* ) : null} */}
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

              <div className="table-responsive relative overflow-hidden hover:overflow-auto w-full mt-3">
                {/* <table className="table-auto text-sm text-left rtl:text-right  dark: w-full"> */}
                <table id="wrdtable" className="table-auto text-sm bottom  border-separate border-spacing-y-2 w-full dark:w-full">
                  <thead className="text-xs uppercase text-nowrap bg-white dark:bg-white">
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
                        Program
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Project
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Activity
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Subactivity
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Farmer Name
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Aadhaar Card
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Gat/Kasara No
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Village
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Block
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        District
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        State
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Country
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Latitude
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Longitude
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        LHWRF
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Beneficiary
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Other
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Total
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Height (Meter)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Length (Meter)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Width (Meter)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Construction Date
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Approx Water Storage (Meter)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Soil type
                         {/* / strata of submergence area */}
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Current Status of Structure
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Beneficiary Nos (Number)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Area Irrigated (Acre)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Site Photos
                      </th>
                      
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Inspection Date
                      </th>
                      {/* <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Cost of Structure (Rs)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Measurement of Structure (Meter)
                      </th> */}
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Approx Water Storage (Meter)
                      </th>
                      {/* <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Soil type / strata of submergence area
                      </th> */}
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Current Status of Structure
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Beneficiary Nos (Number)
                      </th>
                      <th className="px-4 py-3 border border-grayTwo border-l-0">
                        Area Irrigated (Acre)
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
                          const serialNumber = startSerialNumber + i;

                          const constructions = value.wrdDetails[0];
                          const inspections = value.wrdDetails.slice(1);
                      

                          return (
                            <tr
                              key={i}
                              className="odd: bg-grayOne  even:bg-white border border-grayTwo  text-gray-900 font-normal"
                            >
                              <td className="text-center px-4 py-2 font-normal border border-grayTwo">
                                {serialNumber}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {value?.centerName}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {value?.program || "--NA--"}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black whitespace-normal break-words max-w-xs overflow-hidden">
                                {value?.project || "--NA--"}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black whitespace-normal break-words max-w-xs overflow-hidden">
                                {value?.activity || "--NA--"}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black whitespace-normal break-words max-w-xs overflow-hidden">
                                {value?.subActivity || "--NA--"}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>{value?.farmerDetails?.farmerName}</div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    {value?.farmerDetails?.aadharCard
                                    ?
                                    formatAadhaarNumber(
                                      value?.farmerDetails?.aadharCard
                                    )
                                    :"--NA--"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    {value?.locationDetails?.gatKasara}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    {value?.locationDetails?.village}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    {value?.locationDetails?.block}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    {value?.locationDetails?.district}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    {value?.locationDetails?.state}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    {value?.locationDetails?.country}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    {value?.locationDetails?.latitude}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    {value?.locationDetails?.longitude}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <span>
                                  {formatToINR(
                                    constructions?.costOfStructure?.LHWRF
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <span>
                                  {formatToINR(
                                    constructions?.costOfStructure?.beneficiary
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <span>
                                  {formatToINR(
                                    constructions?.costOfStructure?.other
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {formatToINR(
                                  (constructions?.costOfStructure?.LHWRF ? constructions?.costOfStructure?.LHWRF : 0)
                                  +(constructions?.costOfStructure?.beneficiary ? constructions?.costOfStructure?.beneficiary : 0)
                                  +(constructions?.costOfStructure?.other ? constructions?.costOfStructure?.other : 0)
                                )}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <span>
                                  {formatNumberToCommas(
                                    constructions?.measurementOfStructure?.height
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <span>
                                  {formatNumberToCommas(
                                    constructions?.measurementOfStructure?.length
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <span>
                                  {formatNumberToCommas(
                                    constructions?.measurementOfStructure?.width
                                  )}
                                </span>
                              </td>
                              {/* Construction */}
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  {constructions?.constructionDate
                                    ? moment(
                                        constructions?.constructionDate
                                      ).format("DD/MM/YYYY")
                                    : "--NA--"}
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>
                                  <span>
                                    <span className="font-semibold">
                                      Length:
                                    </span>{" "}
                                    &nbsp;
                                    {formatNumberToCommas(
                                      constructions?.measurementOfSubmergence
                                        ?.length
                                    )}
                                  </span>
                                  &nbsp; &nbsp;
                                  <span>
                                    <span className="font-semibold">
                                      Width:
                                    </span>{" "}
                                    &nbsp;
                                    {formatNumberToCommas(
                                      constructions?.measurementOfSubmergence
                                        ?.width
                                    )}
                                  </span>
                                  &nbsp; &nbsp;
                                  <span>
                                    <span className="font-semibold">
                                      Depth:
                                    </span>{" "}
                                    &nbsp;
                                    {formatNumberToCommas(
                                      constructions?.measurementOfSubmergence
                                        ?.depth
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>{constructions?.soilType}</div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                <div>{constructions?.currentStatus}</div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                <div>
                                  {formatNumberToCommas(
                                    constructions?.beneficiaryNos
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                <div>
                                  {formatNumberToCommas(
                                    constructions?.areaIrrigated
                                  )}
                                </div>
                              </td>
                              {/* Construction Photos */}
                              {/* <td className="px-4 py-2 border border-grayTwo text-center">
                                <Tooltip content="View Construction Photos" placement="bottom" className="bg-green">
                                  <FaImage
                                    className="border border-gray-500 text-gray-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                    size={"1.3rem"}
                                    data-s3-urls={}
                                    onClick={() => {
                                      setPhotosModal(true);
                                      setPhotosType("construction"); // Set type to "construction"
                                      setSitePhotosIndex(i);
                                    }}
                                  />
                                </Tooltip>
                              </td> */}
                              <td 
                                className="px-4 py-2 border border-grayTwo text-center"
                                data-s3-urls={JSON.stringify(
                                  tableData[sitePhotosIndex]?.wrdDetails[0]?.sitePhotos?.map(photo => photo.uri) || []
                                )}
                              >
                                {tableData[sitePhotosIndex]?.wrdDetails[0]?.sitePhotos?.map((photo, i) => (
                                  <img
                                    key={i}
                                    src={photo.uri}
                                    alt="Construction Photo"
                                    width={150}
                                    height={150}
                                    className="cursor-pointer"
                                    onClick={() => handleDownload(photo.uri, `site-photo-${i}.jpg`)}
                                  />
                                ))}
                                <Tooltip content="View Construction Photos" placement="bottom" className="bg-green">
                                  <FaImage
                                    className="border border-gray-500 text-gray-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                    size={"1.3rem"}
                                    onClick={() => {
                                      setPhotosModal(true);
                                      setPhotosType("construction"); // Set type to "construction"
                                      setSitePhotosIndex(i);
                                    }}
                                  />
                                </Tooltip>
                              </td>

                              {/* Inspection */}

                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">                                
                                {inspections?.length > 1 ? (
                                  <>
                                    {inspections
                                      .map((item, index) => (
                                        <div key={index}>
                                          {item?.constructionDate
                                            ? moment(
                                                item?.constructionDate
                                              ).format("DD/MM/YYYY")
                                            : "--NA--"}
                                            &nbsp;
                                            &nbsp;
                                        </div>
                                      ))}
                                  </>
                                ): "--NA--"}
                              </td>

                              {/* <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {inspections?.map((item, index) => {
                                  if (inspections?.length > 1) {
                                    return (
                                      <div className="w-full">
                                        <span>
                                          <span className="font-semibold">
                                            LHWRF:
                                          </span>{" "}
                                          &nbsp;
                                          {formatToINR(
                                            item?.costOfStructure?.LHWRF
                                          )}
                                        </span>
                                        &nbsp; &nbsp;
                                        <span>
                                          <span className="font-semibold">
                                            Beneficiary:
                                          </span>{" "}
                                          &nbsp;
                                          {formatToINR(
                                            item?.costOfStructure?.beneficiary
                                          )}
                                        </span>
                                        &nbsp; &nbsp;
                                        <span>
                                          <span className="font-semibold">
                                            Other:
                                          </span>{" "}
                                          &nbsp;
                                          {formatToINR(
                                            item?.costOfStructure?.other
                                          )}
                                        </span>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div>
                                        <div>
                                          <span>
                                            <span className="font-semibold">
                                              LHWRF:
                                            </span>{" "}
                                            &nbsp;
                                            {formatToINR(
                                              item?.costOfStructure?.LHWRF
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          <span>
                                            <span className="font-semibold">
                                              Beneficiary:
                                            </span>{" "}
                                            &nbsp;
                                            {formatToINR(
                                              item?.costOfStructure?.beneficiary
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          <span>
                                            <span className="font-semibold">
                                              Other:
                                            </span>{" "}
                                            &nbsp;
                                            {formatToINR(
                                              item?.costOfStructure?.other
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                })}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {inspections?.map((item, index) => {
                                  if (inspections?.length > 1) {
                                    return (
                                      <div>
                                        <span>
                                          <span className="font-semibold">
                                            Height:
                                          </span>{" "}
                                          &nbsp;
                                          {formatNumberToCommas(
                                            item?.measurementOfStructure?.height
                                          )}
                                        </span>
                                        &nbsp; &nbsp;
                                        <span>
                                          <span className="font-semibold">
                                            Length:
                                          </span>{" "}
                                          &nbsp;
                                          {formatNumberToCommas(
                                            item?.measurementOfStructure?.length
                                          )}
                                        </span>
                                        &nbsp; &nbsp;
                                        <span>
                                          <span className="font-semibold">
                                            Width:
                                          </span>{" "}
                                          &nbsp;
                                          {formatNumberToCommas(
                                            item?.measurementOfStructure?.width
                                          )}
                                        </span>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div>
                                        <div>
                                          <span>
                                            <span className="font-semibold">
                                              Height:
                                            </span>{" "}
                                            &nbsp;
                                            {formatNumberToCommas(
                                              item?.measurementOfStructure
                                                ?.height
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          <span>
                                            <span className="font-semibold">
                                              Length:
                                            </span>{" "}
                                            &nbsp;
                                            {formatNumberToCommas(
                                              item?.measurementOfStructure
                                                ?.length
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          <span>
                                            <span className="font-semibold">
                                              Width:
                                            </span>{" "}
                                            &nbsp;
                                            {formatNumberToCommas(
                                              item?.measurementOfStructure
                                                ?.width
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                })}
                              </td> */}
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {inspections.length>0
                                ?
                                inspections?.map((item, index) => {
                                  if (inspections?.length > 1) {
                                    return (
                                      <div>
                                        <span>
                                          <span className="font-semibold">
                                            Length:
                                          </span>{" "}
                                          &nbsp;
                                          {formatNumberToCommas(
                                            item?.measurementOfSubmergence
                                              ?.length
                                          )}
                                        </span>
                                        &nbsp; &nbsp;
                                        <span>
                                          <span className="font-semibold">
                                            Width:
                                          </span>{" "}
                                          &nbsp;
                                          {formatNumberToCommas(
                                            item?.measurementOfSubmergence
                                              ?.width
                                          )}
                                        </span>
                                        &nbsp; &nbsp;
                                        <span>
                                          <span className="font-semibold">
                                            Depth:
                                          </span>{" "}
                                          &nbsp;
                                          {formatNumberToCommas(
                                            item?.measurementOfSubmergence
                                              ?.depth
                                          )}
                                        </span>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div>
                                        <div>
                                          <span>
                                            <span className="font-semibold">
                                              Length:
                                            </span>{" "}
                                            &nbsp;
                                            {formatNumberToCommas(
                                              item?.measurementOfSubmergence
                                                ?.length
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          <span>
                                            <span className="font-semibold">
                                              Width:
                                            </span>{" "}
                                            &nbsp;
                                            {formatNumberToCommas(
                                              item?.measurementOfSubmergence
                                                ?.width
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          <span>
                                            <span className="font-semibold">
                                              Depth:
                                            </span>{" "}
                                            &nbsp;
                                            {formatNumberToCommas(
                                              item?.measurementOfSubmergence
                                                ?.depth
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                })
                                : "--NA--"
                                }
                              </td>
                              {/* <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {inspections?.map((item, index) => {
                                  return <div>{item?.soilType}</div>;
                                })}
                              </td> */}
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-black">
                                {inspections.length>0 ? 
                                  inspections?.map((item, index) => {
                                  return <div>{item?.currentStatus}</div>;
                                })
                                : "--NA--"}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                {inspections.length>0 ? 
                                  inspections?.map((item, index) => {
                                  return (
                                    <div>
                                      {formatNumberToCommas(
                                        item?.beneficiaryNos
                                      )}
                                    </div>
                                  );
                                })
                                : "--NA--"}
                              </td>
                              <td className="px-4 py-2 border border-grayTwo border-l-0 text-right text-black">
                                {inspections.length>0 ? 
                                  inspections?.map((item, index) => {
                                  return (
                                    <div>
                                      {formatNumberToCommas(
                                        item?.areaIrrigated
                                      )}
                                    </div>
                                  );
                                })
                                : "--NA--"}
                              </td>
                              {/* Inspection Photos */}
                              <td className="px-4 py-2 border border-grayTwo text-center">
                                <Tooltip content="View Inspection Photos" placement="bottom" className="bg-green">
                                  <FaImage
                                    className="border border-gray-500 text-gray-500 px-1 py-0.5 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                    size={"1.3rem"}
                                    onClick={() => {
                                      setPhotosModal(true);
                                      setPhotosType("inspection"); // Set type to "inspection"
                                      setSitePhotosIndex(i);
                                    }}
                                  />
                                </Tooltip>
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
                <Modal show={photosModal} size="5xl" onClose={() => setPhotosModal(false)} popup>
                  <Modal.Header className="modalHeader justify-center">
                    <div className="flex justify-between gap-5">
                      <h1 className="text-white mx-auto">Site Photos</h1>
                      <div className="modalCloseButton" onClick={() => setPhotosModal(false)}>
                        {/* Close Button */}
                      </div>
                    </div>
                  </Modal.Header>
                  
                  <Modal.Body>
                    <div>
                      {tableData && tableData.length > 0 ? (
                        <>
                          {/* Show Construction Photos */}
                          {photosType === "construction" &&
                            tableData[sitePhotosIndex]?.wrdDetails[0]?.sitePhotos?.map((photo, i) => (
                              <div key={i} className="flex h-auto content-center mt-5">
                                <Tooltip
                                  content="Click here to Download"
                                  placement="bottom"
                                  className="bg-green"
                                >
                                  <img src={photo.uri} id="imageDisplay" alt="Construction Photo" width={150} height={150}
                                    className="cursor-pointer"
                                    onClick={() => handleDownload(photo.uri, `site-photo-${i}.jpg`)}
                                 />
                                </Tooltip>
                              </div>
                            ))}

                          {/* Show Inspection Photos */}
                          {photosType === "inspection" &&
                            tableData[sitePhotosIndex]?.wrdDetails.slice(1)?.flatMap((inspection) =>
                              inspection.sitePhotos?.map((photo, i) => (
                                <div key={i} className="flex h-auto content-center mt-5">
                                  <Tooltip
                                    content="Click here to Download"
                                    placement="bottom"
                                    className="bg-green"
                                    >
                                    <img src={photo.uri} id="imageDisplay" alt="Inspection Photo" width={150} height={150} 
                                      className="cursor-pointer"
                                      onClick={() => handleDownload(photo.uri, `site-photo-${i}.jpg`)}
                                    />
                                </Tooltip>
                                </div>
                              ))
                            )}
                        </>
                      ) : (
                        "No record found!"
                      )}
                    </div>
                  </Modal.Body>
                </Modal>
                {/* {console.log("numOfPages:", numOfPages)}
                {console.log("totalRecs:",
                  totalRecs,
                  "recsPerPage:",
                  recsPerPage,"pageNumber",pageNumber)} */}
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
    </section>
  );
}

export default WRDReport;
