"use client"; // For Next.js 13+ (app router)

import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaFileDownload, FaImage, FaSpinner } from "react-icons/fa";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";
import ls from "localstorage-slim";
import { FaSearch } from "react-icons/fa";
import { Modal, Tooltip } from "flowbite-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { MdFileDownload } from "react-icons/md";

// -------------------- 1) Header Definitions --------------------
// We aim for a total of 40 columns in this example.

// Level 1: Big Groups
// Let's define them as follows (sum = 40):
//  1. Sr. No (1 col)
//  2. Project & Farmer Details (15 col)
//  3. Cost of Structure (4 col)
//  4. Measurement of Structure (3 col)
//  5. Construction Water Storage (4 col)
//  6. Construction Status (3 col)
//  7. Construction Photos (1 col)
//  8. Inspection Details (9 col)
const level1UI = [
  { label: "Project & Farmer Details", colSpan: 16 },
  { label: "Cost of Structure (Rs)", colSpan: 4 },
  { label: "Measurement of Structure (Meter)", colSpan: 3 },
  { label: "Construction Details", colSpan: 10 },
  { label: "Inspection Details", colSpan: 9 },
];

// Level 2: Sub-groups
// For simplicity, let's keep them fairly high-level:
const level2UI = [
  { label: "Project & Farmer Info", colSpan: 16 },
  { label: "Cost", colSpan: 4 },
  { label: "Structure Dimensions", colSpan: 3 },
  { label: "Construction Info", colSpan: 2 },
  { label: "Approx Water Storage (m)", colSpan: 4 },
  { label: "Construction Info", colSpan: 4 },
  { label: "Inspection Date", colSpan: 1 },
  { label: "Approx Water Storage (m)", colSpan: 4 },
  { label: "Inspection Info", colSpan: 5 },
];

// Level 3: Actual column headers (40 items)
const level3 = [
  // Column 0: Sr. No
  "Sr. No",
  // 1..15: Project & Farmer
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
  // 16..19: Cost of Structure
  "LHWRF",
  "Beneficiary",
  "Other",
  "Total Cost",
  // 20..22: Measurement of Structure
  "Height (Meter)",
  "Length (Meter)",
  "Width (Meter)",
  "Construction Date",
  "Soil Type",
  // 23..26: Construction Water Storage (4 columns)
  "Length(m)",
  "Width(m)",
  "Depth(m)",
  "Total(cum)",
  // 27..29: Construction Status (3 columns)
  "Current Status",
  "Beneficiary Nos",
  "Area Irrigated  (Acre)",
  // 30: Construction Photos (1 column)
  "Construction Photos",
  // 31..39: Inspection (9 columns)
  "Inspection Date",
  "Length(m)",
  "Width(m)",
  "Depth(m)",
  "Total(cum)",
  "Status",
  "Beneficiary Nos",
  "Area Irrigated (Acre)",
  "Photos",
];

// -------------------- 2) Helper Functions --------------------
const formatAadhaarNumber = (aadhaar) =>
  aadhaar ? aadhaar.replace(/(.{4})/g, "$1 ") : "--NA--";

const formatToINR = (num) => {
  const validNum = isNaN(num) || num == null ? 0 : num;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(validNum)
    .replace(/^(\D+)/, "$1 ");
};

const formatNumberToCommas = (num) =>
  num ? new Intl.NumberFormat("en-IN").format(num) : 0;

// -------------------- 3) Component --------------------
function WRDReport() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(
    ls.get("userDetails", { decrypt: true }),
  );
  const SOIL_TYPES = process.env.SOIL_TYPES;
  const soilTypesArray = SOIL_TYPES?.split(",")?.map((event) => event?.trim());
  const [soilTypes, setSoilTypes] = useState(soilTypesArray);

  // console.log("userDetails  =>", userDetails);
  const [centerName, setCenterName] = useState("");
  const [center_id, setCenter_id] = useState("");
  const [fromDate, setFromDate] = useState("all");
  const [toDate, setToDate] = useState("all");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");

  const [uniqueDistricts, setUniqueDistricts] = useState([]);
  const [uniqueBlocks, setUniqueBlocks] = useState([]);
  const [soilType, setSoilType] = useState("");
  const [centerNameList, setCenterNameList] = useState([]);
  const [wrdData, setWRDData] = useState([]);

  // Dropdown visibility state
  const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);
  const [soilTypeDropdownOpen, setSoilTypeDropdownOpen] = useState(false);
  const [recsPerPageDropdownOpen, setRecsPerPageDropdownOpen] = useState(false);

  const [filterData, setFilterData] = useState([]);
  let [runCount, setRunCount] = useState(0);

  let [recsPerPage, setRecsPerPage] = useState(10);
  let [numOfPages, setNumOfPages] = useState([1]);
  let [pageNumber, setPageNumber] = useState(1);
  let [searchText, setSearchText] = useState("-");
  let [totalRecs, setTotalRecs] = useState("-");
  let [search, setSearch] = useState("");
  let startSerialNumber = (pageNumber - 1) * recsPerPage + 1;
  const [photosModal, setPhotosModal] = useState(false);
  const [sitePhotosIndex, setSitePhotosIndex] = useState("");
  const [inspPhotosIndex, setInspPhotosIndex] = useState("");
  const [photosType, setPhotoType] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const toggleDropdown = (setter, state) => {
    setCenterDropdownOpen(false);
    setDistrictDropdownOpen(false);
    setBlockDropdownOpen(false);
    setSoilTypeDropdownOpen(false);
    setRecsPerPageDropdownOpen(false);
    setter(!state);
  };

  useEffect(() => {
    window.handlePhotoClick = (photosJSON, index) => {
      const photos = JSON.parse(photosJSON);
      setSelectedPhotos(photos);
      setPhotosModal(true);
      setPhotoType("construction");
      setSitePhotosIndex(index);
    };
    window.handleInspectionPhotoClick = (photosJSON, index) => {
      const photos = JSON.parse(photosJSON);
      setSelectedPhotos(photos);
      setPhotosModal(true);
      setPhotoType("inspection");
      setInspPhotosIndex(index);
    };
    console.log(
      "tableData[inspPhotosIndex]?.wrdDetails.slice(1)",
      tableData[inspPhotosIndex]?.wrdDetails.slice(1),
    );
    tableData[inspPhotosIndex]?.wrdDetails.slice(1)?.flatMap((inspection) => {
      console.log("inspection", inspection);
    });
  }, [inspPhotosIndex, sitePhotosIndex]);

  // Fetch data from API
  const getReportData1 = async () => {
    try {
      const formValues = {
        block: "all",
        centerName: "all",
        district: "all",
        fromDate: "2024/04/01",
        toDate: "2025/03/31",
        pageNumber: 1,
        recsPerPage: 10,
        searchText: "-",
        soilType: "all",
        removePagination: true,
      };
      const response = await axios.post(
        "/api/reports/post/wrd-report",
        formValues,
      );
      if (response.data.success) {
        setTableData(response.data.tableData);
      } else {
        console.error(response.data.errorMsg);
      }
    } catch (error) {
      console.error("Error fetching WRD data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReportData = async () => {
    const formValues = {
      searchText: searchText,
      centerName: centerName || "all",
      district: district || "all",
      block: block || "all",
      soilType: soilType || "all",
      fromDate:
        fromDate !== "all" ? moment(fromDate).format("YYYY/MM/DD") : "all",
      toDate: toDate !== "all" ? moment(toDate).format("YYYY/MM/DD") : "all",
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
    };
    setFilterData(formValues);
    try {
      const response = await axios.post(
        "/api/reports/post/wrd-report",
        formValues,
      );
      console.log("response", response);
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

  // -------------------- 4) Build Data Rows --------------------
  // We'll build a "main" portion for columns 0..30, then 9 columns for inspection = 40 total.

  // Main portion includes:
  //   1 col: Sr. No
  //   15 col: Project & Farmer
  //   4 col: Cost
  //   3 col: Measurement
  //   4 col: Construction Water
  //   3 col: Construction Status
  //   1 col: Construction Photos
  // = 1 + 15 + 4 + 3 + 4 + 3 + 1 = 31 columns
  function buildMainColumns(record, mainDetail, srNo, index) {
    // Column 0: Sr. No
    // Next 15: Project & Farmer
    const centerName = record.centerName || "--NA--";
    const program = record.program || "--NA--";
    const project = record.project || "--NA--";
    const activity = record.activity || "--NA--";
    const subActivity = record.subActivity || "--NA--";
    const farmerName =
      mainDetail.farmerDetails?.farmerName ||
      record.farmerDetails?.farmerName ||
      "--NA--";
    const aadhaarCard = formatAadhaarNumber(record.farmerDetails?.aadharCard);
    const gatKasara = record.locationDetails?.gatKasara || "--NA--";
    const village = record.locationDetails?.village || "--NA--";
    const block = record.locationDetails?.block || "--NA--";
    const district = record.locationDetails?.district || "--NA--";
    const state = record.locationDetails?.state || "--NA--";
    const country = record.locationDetails?.country || "--NA--";
    const latitude = record.locationDetails?.latitude || "--NA--";
    const longitude = record.locationDetails?.longitude || "--NA--";

    // Cost (4 columns)
    const LHWRF = mainDetail.costOfStructure?.LHWRF || 0;
    const beneficiary = mainDetail.costOfStructure?.beneficiary || 0;
    const other = mainDetail.costOfStructure?.other || 0;
    const totalCost = LHWRF + beneficiary + other;

    // Measurement (3 columns)
    const height = mainDetail.measurementOfStructure?.height || 0;
    const lengthM = mainDetail.measurementOfStructure?.length || 0;
    const widthM = mainDetail.measurementOfStructure?.width || 0;

    // Construction Water Storage (4 columns)
    const cLength = mainDetail.measurementOfSubmergence?.length || 0;
    const cWidth = mainDetail.measurementOfSubmergence?.width || 0;
    const cDepth = mainDetail.measurementOfSubmergence?.depth || 0;
    const cTotal = mainDetail.totalVolume || cLength * cWidth * cDepth;

    // Construction Status (3 columns)
    const currentStatus = mainDetail.currentStatus || "--NA--";
    const beneficiaryNos = mainDetail.beneficiaryNos || 0;
    const areaIrrigated = mainDetail.areaIrrigated || 0;

    const constructionDate = mainDetail.constructionDate
      ? moment(mainDetail.constructionDate).format("DD/MM/YYYY")
      : "--NA--";
    const soilType = mainDetail.soilType || "--NA--";

    // Construction Photos (1 column)
    const constructionPhotos1 = Array.isArray(mainDetail.sitePhotos)
      ? mainDetail.sitePhotos.map((p) => p.uri).join("\n")
      : "--NA--";
    const constructionPhotos = Array.isArray(mainDetail.sitePhotos)
      ? `<div 
      title="Click to View Construction Photos" 
      style="cursor: pointer; color: #4A5568;" 
      class="w-full flex justify-center"
      onclick='window.handlePhotoClick(${JSON.stringify(
        JSON.stringify(mainDetail.sitePhotos),
      )}, ${index})'
    >
      🖼️
    </div>`
      : "--NA--";
    return [
      // 1 col: Sr. No
      srNo,
      // 15 col: Project & Farmer
      centerName,
      program,
      project,
      activity,
      subActivity,
      farmerName,
      aadhaarCard,
      gatKasara,
      village,
      block,
      district,
      state,
      country,
      latitude,
      longitude,
      // 4 col: Cost
      LHWRF,
      beneficiary,
      other,
      totalCost,
      // 3 col: Measurement
      height,
      lengthM,
      widthM,
      constructionDate,
      soilType,
      // 4 col: Construction Water
      cLength,
      cWidth,
      cDepth,
      cTotal,
      // 3 col: Construction Status
      currentStatus,
      beneficiaryNos,
      areaIrrigated,
      // 1 col: Construction Photos
      constructionPhotos,
    ]; // total 31 items
  }

  // Inspection columns => 9 columns: [Date, L, W, D, Total, Status, Beneficiary Nos, Area Irrigated, Photos]
  function buildInspectionColumns(insp, srNo) {
    const iDate = insp.constructionDate
      ? moment(insp.constructionDate).format("DD/MM/YYYY")
      : "--NA--";
    const iLength = insp.measurementOfSubmergence?.length || 0;
    const iWidth = insp.measurementOfSubmergence?.width || 0;
    const iDepth = insp.measurementOfSubmergence?.depth || 0;
    const iTotal = insp.totalVolume || iLength * iWidth * iDepth;
    const iStatus = insp.currentStatus || "--NA--";
    const iBeneficiaryNos = insp.beneficiaryNos || 0;
    const iAreaIrrigated = insp.areaIrrigated || 0;
    const iPhotos = Array.isArray(insp.sitePhotos)
      ? `<div 
      title="Click to View Construction Photos" 
      style="cursor: pointer; color: #4A5568;" 
      class="w-full flex justify-center text-xl"
      onclick='window.handleInspectionPhotoClick(${JSON.stringify(
        JSON.stringify(insp.sitePhotos),
      )}, ${srNo})'
    >
      🖼️
    </div>`
      : "--NA--";

    return [
      iDate,
      iLength,
      iWidth,
      iDepth,
      iTotal,
      iStatus,
      iBeneficiaryNos,
      iAreaIrrigated,
      iPhotos,
    ];
  }

  // For each record:
  // - If there is at least one inspection, the first row has 31 (main) + 9 (inspection) = 40 columns.
  // - Additional inspection rows => 31 blanks + 9 inspection columns.
  // - If no inspections => 31 main columns + 9 blanks = 40 columns.
  function buildRowsForUI(record, idx) {
    const rows = [];

    let startSerialNumber = (pageNumber - 1) * recsPerPage + 1;
    const srNo = startSerialNumber + idx;
    // const srNo = idx + 1;
    const mainDetail = record.wrdDetails?.[0] || {};
    const mainCols = buildMainColumns(record, mainDetail, srNo, idx); // 31 items
    const inspections = record.wrdDetails?.slice(1) || [];

    if (inspections.length > 0) {
      // First row => main + first inspection
      const firstInsp = inspections[0];
      const inspCols = buildInspectionColumns(firstInsp, idx);
      rows.push([...mainCols, ...inspCols]); // 31 + 9 = 40
      // subsequent => blank main + insp
      const blankMain = Array(mainCols.length).fill("");
      inspections.slice(1).forEach((insp) => {
        const inspData = buildInspectionColumns(insp, idx);
        rows.push([...blankMain, ...inspData]);
      });
    } else {
      // no inspection => main + 9 blanks
      const blankInsp = Array(9).fill("");
      rows.push([...mainCols, ...blankInsp]);
    }
    return rows;
  }

  function buildAllRowsForUI() {
    let allRows = [];
    tableData.forEach((record, idx) => {
      const rowSet = buildRowsForUI(record, idx);
      allRows.push(...rowSet);
    });
    return allRows;
  }

  // -------------------- 5) Download Excel with Same Structure --------------------
  const downloadExcel1 = async () => {
    try {
      const formValues = {
        block: "all",
        centerName: "all",
        district: "all",
        fromDate: "2024/04/01",
        toDate: "2025/03/31",
        pageNumber: 1,
        recsPerPage: 10,
        searchText: "-",
        soilType: "all",
        removePagination: true,
      };
      const response = await axios.post(
        "/api/reports/post/wrd-report",
        formValues,
      );
      const fullData = response.data.tableData;
      if (!fullData || fullData.length === 0) {
        alert("No data available!");
        return;
      }

      // Build header rows for Excel
      const excelLevel1 = level1UI.reduce((arr, group) => {
        arr.push(group.label);
        for (let i = 1; i < group.colSpan; i++) {
          arr.push("");
        }
        return arr;
      }, []);
      const excelLevel2 = level2UI.reduce((arr, group) => {
        arr.push(group.label);
        for (let i = 1; i < group.colSpan; i++) {
          arr.push("");
        }
        return arr;
      }, []);

      const excelRows = [];
      excelRows.push(excelLevel1);
      excelRows.push(excelLevel2);
      excelRows.push(level3);

      // Build data rows
      fullData.forEach((record, idx) => {
        const srNo = idx + 1;
        const mainDetail = record.wrdDetails?.[0] || {};
        const mainCols = buildMainColumns(record, mainDetail, srNo, idx); // 31
        const inspections = record.wrdDetails?.slice(1) || [];
        if (inspections.length > 0) {
          const firstInsp = inspections[0];
          const inspCols = buildInspectionColumns(firstInsp, idx); // 9
          excelRows.push([...mainCols, ...inspCols]); // 40
          const blankMain = Array(mainCols.length).fill("");
          inspections.slice(1).forEach((insp) => {
            const inspData = buildInspectionColumns(insp, idx);
            excelRows.push([...blankMain, ...inspData]);
          });
        } else {
          const blankInsp = Array(9).fill("");
          excelRows.push([...mainCols, ...blankInsp]);
        }
      });

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelRows);

      // Merge header rows
      let merges = [];
      let startCol = 0;
      level1UI.forEach((group) => {
        if (group.colSpan > 1) {
          merges.push({
            s: { r: 0, c: startCol },
            e: { r: 0, c: startCol + group.colSpan - 1 },
          });
        }
        startCol += group.colSpan;
      });
      startCol = 0;
      level2UI.forEach((group) => {
        if (group.colSpan > 1) {
          merges.push({
            s: { r: 1, c: startCol },
            e: { r: 1, c: startCol + group.colSpan - 1 },
          });
        }
        startCol += group.colSpan;
      });
      ws["!merges"] = merges;
      ws["!cols"] = level3.map(() => ({ wch: 20 }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "WRD Report");
      XLSX.writeFile(wb, "WRD_Report.xlsx");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Failed to export data.");
    }
  };

  const downloadExcel2 = async () => {
    try {
      const formValues = {
        block: "all",
        centerName: "all",
        district: "all",
        fromDate: "2024/04/01",
        toDate: "2025/03/31",
        pageNumber: 1,
        recsPerPage: 10,
        searchText: "-",
        soilType: "all",
        removePagination: true,
      };
      const response = await axios.post(
        "/api/reports/post/wrd-report",
        formValues,
      );
      const fullData = response.data.tableData;

      if (!fullData || fullData.length === 0) {
        alert("No data available!");
        return;
      }

      // 1️⃣ Initialize Workbook & Worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("WRD Report");

      // 2️⃣ Define Header Rows
      const headers1 = level1UI.map((group) => group.label);
      const headers2 = level2UI.map((group) => group.label);
      const headers3 = level3;

      // 3️⃣ Add Headers to Worksheet
      worksheet.addRow(headers1);
      worksheet.addRow(headers2);
      worksheet.addRow(headers3);

      // 4️⃣ Add Data Rows
      fullData.forEach((record, idx) => {
        const srNo = idx + 1;
        const mainDetail = record.wrdDetails?.[0] || {};
        const mainCols = buildMainColumns(record, mainDetail, srNo, idx);
        const inspections = record.wrdDetails?.slice(1) || [];

        if (inspections.length > 0) {
          const firstInsp = inspections[0];
          const inspCols = buildInspectionColumns(firstInsp, idx);
          worksheet.addRow([...mainCols, ...inspCols]);

          const blankMain = Array(mainCols.length).fill("");
          inspections.slice(1).forEach((insp) => {
            const inspData = buildInspectionColumns(insp, idx);
            worksheet.addRow([...blankMain, ...inspData]);
          });
        } else {
          const blankInsp = Array(9).fill("");
          worksheet.addRow([...mainCols, ...blankInsp]);
        }
      });

      // 5️⃣ Apply Formatting (Borders, Alignment, Colors)
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          cell.alignment = {
            vertical: "middle",
            horizontal: rowNumber <= 3 ? "center" : "left",
          };

          // Apply bold text and background color to headers
          if (rowNumber <= 3) {
            cell.font = { bold: true, color: { argb: "FFFFFF" } };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "4F81BD" },
            };
          }

          // Apply Borders to all cells
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // 6️⃣ Auto-Adjust Column Widths
      worksheet.columns.forEach((column, index) => {
        let maxLength = 10;
        column.eachCell((cell) => {
          const cellValue = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, cellValue.length);
        });
        column.width = maxLength + 2; // Add some padding
      });

      // 7️⃣ Generate Excel File
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "WRD_Report.xlsx");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Failed to export data.");
    }
  };

  const downloadExcel = async () => {
    try {
      const formValues = {
        ...filterData,
        // block: "all",
        // centerName: centerName,
        // district: "all",
        // fromDate: "2024/04/01",
        // toDate: "2025/03/31",
        // pageNumber: 1,
        // recsPerPage: 10,
        // searchText: "-",
        // soilType: "all",
        removePagination: true,
      };
      const response = await axios.post(
        "/api/reports/post/wrd-report",
        formValues,
      );
      const fullData = response.data.tableData;

      if (!fullData || fullData.length === 0) {
        alert("No data available!");
        return;
      }

      // 1️⃣ Initialize Workbook & Worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("WRD Report");

      // 2️⃣ Define Headers
      const headers1 = level1UI.map((group) => group.label);
      const headers2 = level2UI.map((group) => group.label);
      const headers3 = level3;

      const row1 = worksheet.addRow(headers1);
      const row2 = worksheet.addRow(headers2);
      const row3 = worksheet.addRow(headers3);

      // 3️⃣ Merge Header Cells (Same as UI)
      let startCol = 1;
      level1UI.forEach((group) => {
        if (group.colSpan > 1) {
          worksheet.mergeCells(1, startCol, 1, startCol + group.colSpan - 1);
          worksheet.getCell(1, startCol).value = group.label; // Set header text explicitly
        }
        startCol += group.colSpan;
      });

      startCol = 1;
      level2UI.forEach((group) => {
        if (group.colSpan > 1) {
          worksheet.mergeCells(2, startCol, 2, startCol + group.colSpan - 1);
          worksheet.getCell(2, startCol).value = group.label; // Set header text explicitly
        }
        startCol += group.colSpan;
      });

      // 4️⃣ Add Data Rows
      fullData.forEach((record, idx) => {
        const srNo = idx + 1;
        const mainDetail = record.wrdDetails?.[0] || {};
        const mainCols = buildMainColumns(record, mainDetail, srNo, idx);
        const inspections = record.wrdDetails?.slice(1) || [];

        //  Remove <a> tags from photo column
        // mainCols.forEach((col, i) => {
        //   if (typeof col === "string" && col.includes("<a")) {
        //     mainCols[i] = col.replace(/<a[^>]*>(.*?)<\/a>/g, "$1"); // Extract only text inside <a>
        //   }
        // });
        mainCols.forEach((col, i) => {
          if (
            typeof col === "string" &&
            (col.includes("<a") || col.includes("<img"))
          ) {
            // Extract URLs from href="..." or src="..."
            const match =
              col.match(/href="([^"]+)"/) || col.match(/src="([^"]+)"/);
            mainCols[i] = match ? match[1] : col;
          }
        });

        if (inspections.length > 0) {
          const firstInsp = inspections[0];
          const inspCols = buildInspectionColumns(firstInsp, idx);
          worksheet.addRow([...mainCols, ...inspCols]);

          const blankMain = Array(mainCols.length).fill("");
          inspections.slice(1).forEach((insp) => {
            const inspData = buildInspectionColumns(insp, idx);
            worksheet.addRow([...blankMain, ...inspData]);
          });
        } else {
          const blankInsp = Array(9).fill("");
          worksheet.addRow([...mainCols, ...blankInsp]);
        }
      });

      // 5️⃣ Apply Formatting (Borders, Alignment, Colors)
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          cell.alignment = {
            vertical: "middle",
            horizontal: rowNumber <= 3 ? "center" : "left",
          };

          // Apply bold text and background color to headers
          if (rowNumber <= 3) {
            cell.font = { bold: true, color: { argb: "FFFFFF" } };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "4F81BD" },
            };
          }

          // Apply Borders to all cells
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // 6️⃣ Auto-Adjust Column Widths
      worksheet.columns.forEach((column, index) => {
        let maxLength = 10;
        column.eachCell((cell) => {
          const cellValue = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, cellValue.length);
        });
        column.width = maxLength + 2; // Add some padding
      });

      // 7️⃣ Generate Excel File
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "WRD_Report.xlsx");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Failed to export data.");
    }
  };

  useEffect(() => {
    getReportData();
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
            CenterNameList,
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
  useEffect(() => {
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
          ...new Set(
            response.data[0].villagesCovered.map((item) => item.district),
          ),
        ];
        console.log("uniqueDistricts", uniqueDistricts);
        setUniqueDistricts(uniqueDistricts);
        const uniqueBlocks = [
          ...new Set(
            response.data[0].villagesCovered.map((item) => item.block),
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

  const formatNumberToCommas = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  function formatAadhaarNumber(aadhaar) {
    // Use regex to add a spce after every 4 digits
    return aadhaar.replace(/(.{4})/g, "$1 ");
  }

  const handleDownload = async (url, filename) => {
    // console.log("handleDownload url",url)
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
        .catch((error) => console.error("CORS Error:", error));
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  // -------------------- 6) Render UI Table --------------------
  return (
    <section className="section">
      <div className={"container mx-auto transition-all duration-300 "}>
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
            top: ${level2UI && level2UI.length > 0 ? "48px" : "-4px"};
            z-index: 9;
          }
          table {
            width: 100%;
            table-layout: auto;
          }
          th,
          td {
            box-sizing: border-box;
          }
        `}</style>
        <div className="box border-2 rounded-md shadow-md">
          <div className="uppercase text-xl">
            <div className="border-b-2 border-grayTwo flex justify-between">
              <h1 className="heading h-auto content-center">WRD Report</h1>
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
                    <button
                      type="button"
                      onClick={() =>
                        toggleDropdown(
                          setCenterDropdownOpen,
                          centerDropdownOpen,
                        )
                      }
                      className="stdSelectField pl-3 text-left flex justify-between items-center w-full"
                    >
                      {centerName === "all"
                        ? "All"
                        : centerName || "-- Select Center --"}
                      <svg
                        className={`w-4 h-4 ml-2 transition-transform ${centerDropdownOpen ? "rotate-180" : ""}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {centerDropdownOpen && (
                      <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                        <div
                          onClick={() => {
                            setCenterName("");
                            setCenter_id("");
                            setCenterDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                        >
                          -- Select Center --
                        </div>
                        <div
                          onClick={() => {
                            setCenterName("all");
                            setCenter_id("all");
                            setCenterDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black font-semibold"
                        >
                          All
                        </div>
                        {centerNameList?.map((center, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setCenterName(center.centerName);
                              setCenter_id(center._id);
                              setCenterDropdownOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                          >
                            {center.centerName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              <div className="">
                <label htmlFor="program" className="inputLabel">
                  District
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() =>
                      toggleDropdown(
                        setDistrictDropdownOpen,
                        districtDropdownOpen,
                      )
                    }
                    className="stdSelectField pl-3 text-left flex justify-between items-center w-full"
                  >
                    {district === "all"
                      ? "All"
                      : district || "-- Select District --"}
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform ${districtDropdownOpen ? "rotate-180" : ""}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {districtDropdownOpen && (
                    <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setDistrict("");
                          setDistrictDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                      >
                        -- Select District --
                      </div>
                      <div
                        onClick={() => {
                          setDistrict("all");
                          setDistrictDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black font-semibold"
                      >
                        All
                      </div>
                      {uniqueDistricts.map((dist, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setDistrict(dist);
                            setDistrictDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                          {dist}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="">
                <label htmlFor="project" className="inputLabel">
                  Block
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() =>
                      toggleDropdown(setBlockDropdownOpen, blockDropdownOpen)
                    }
                    className="stdSelectField pl-3 text-left flex justify-between items-center w-full"
                  >
                    {block === "all" ? "All" : block || "-- Select Block --"}
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform ${blockDropdownOpen ? "rotate-180" : ""}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {blockDropdownOpen && (
                    <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setBlock("");
                          setBlockDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                      >
                        -- Select Block --
                      </div>
                      <div
                        onClick={() => {
                          setBlock("all");
                          setBlockDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black font-semibold"
                      >
                        All
                      </div>
                      {uniqueBlocks.map((blk, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setBlock(blk);
                            setBlockDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                          {blk}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="">
                <label htmlFor="activity" className="inputLabel">
                  Soil Type
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() =>
                      toggleDropdown(
                        setSoilTypeDropdownOpen,
                        soilTypeDropdownOpen,
                      )
                    }
                    className="stdSelectField pl-3 text-left flex justify-between items-center w-full"
                  >
                    {soilType === "all"
                      ? "All"
                      : soilType || "-- Select Soil Type --"}
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform ${soilTypeDropdownOpen ? "rotate-180" : ""}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {soilTypeDropdownOpen && (
                    <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setSoilType("");
                          setSoilTypeDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                      >
                        -- Select Soil Type --
                      </div>
                      <div
                        onClick={() => {
                          setSoilType("all");
                          setSoilTypeDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black font-semibold"
                      >
                        All
                      </div>
                      {soilTypes?.map((st, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setSoilType(st);
                            setSoilTypeDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                          {st}
                        </div>
                      ))}
                    </div>
                  )}
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
                  <div className="text-[13px] w-full md:w-auto">
                    <div className="">
                      <label
                        htmlFor="recsPerPage"
                        // className="mb-4 font-semibold"
                        className="inputLabel"
                      >
                        Records per Page
                      </label>
                      <div className="relative mt-2 rounded-md text-gray-500 w-full">
                        <button
                          type="button"
                          onClick={() =>
                            toggleDropdown(
                              setRecsPerPageDropdownOpen,
                              recsPerPageDropdownOpen,
                            )
                          }
                          className="stdSelectField pl-3 text-left flex justify-between items-center w-full"
                        >
                          {recsPerPage}
                          <svg
                            className={`w-4 h-4 ml-2 transition-transform ${recsPerPageDropdownOpen ? "rotate-180" : ""}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {recsPerPageDropdownOpen && (
                          <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                            {[10, 50, 100, 500, 1000].map((val) => (
                              <div
                                key={val}
                                onClick={() => {
                                  setRecsPerPage(val);
                                  setPageNumber(1);
                                  setRecsPerPageDropdownOpen(false);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black font-normal"
                              >
                                {val}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-end text-[13px] lg:-mt-1 mt-5 w-full md:w-1/2 gap-2">
                    {/* {tableObjects?.searchApply ? ( */}
                    <div className="flex-1">
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
                          // className="w-full border mt-2 text-[13px] ps-1 pb-1"
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
                    <div className="mt-0">
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

                <div className="mt-5">
                  <div className="table-responsive table-container relative overflow-hidden hover:overflow-auto w-full mt-3">
                    <table className="min-w-full table-fixed border-collapse text-base bottom  border-separate  w-full dark:w-full leading-tight">
                      <thead>
                        {/* Level 1 */}
                        <tr>
                          {level1UI.map((group, i) => (
                            <th
                              key={i}
                              colSpan={group.colSpan}
                              className="border border-grayTwo uppercase px-2 py-1 bg-white text-[13px] text-center"
                            >
                              {group.label}
                            </th>
                          ))}
                        </tr>
                        {/* Level 2 */}
                        <tr>
                          {level2UI.map((group, i) => (
                            <th
                              key={i}
                              colSpan={group.colSpan}
                              className="border border-grayTwo uppercase px-2 py-1 bg-white text-[13px] text-center"
                            >
                              {group.label}
                            </th>
                          ))}
                        </tr>
                        {/* Level 3 */}
                        <tr>
                          {level3.map((header, i) => (
                            <th
                              key={i}
                              className="border border-grayTwo uppercase px-2 py-1 bg-white text-[13px] text-center"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="border border-grayTwo text-wrap text-[13px]">
                        {loading ? (
                          <tr>
                            <td
                              colSpan={12}
                              className="text-center text-Green text-3xl"
                            >
                              <FaSpinner className="animate-spin inline-flex mx-2" />
                            </td>
                          </tr>
                        ) : tableData.length === 0 ? (
                          <tr>
                            <td
                              colSpan={40}
                              className="text-center text-[13px] py-4"
                            >
                              No data found.
                            </td>
                          </tr>
                        ) : (
                          buildAllRowsForUI().map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="odd:bg-grayOne  even:bg-white border border-grayTwo text-[#000] font-medium"
                            >
                              {row.map((cell, cidx) => (
                                <td
                                  key={cidx}
                                  className="border border-grayTwo px-1 py-1 text-[13px] whitespace-pre font-normal"
                                  dangerouslySetInnerHTML={{
                                    __html: cell,
                                  }}
                                >
                                  {/* {cell} */}
                                </td>
                              ))}
                            </tr>
                          ))
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
                          >
                            {/* Close Button */}
                          </div>
                        </div>
                      </Modal.Header>

                      <Modal.Body>
                        <div className="bg-white">
                          <div className="grid grid-cols-3 justify-center mx-auto h-auto content-center mt-5 px-2 gap-3">
                            {tableData && tableData.length > 0 ? (
                              <>
                                {/* Show Construction Photos */}
                                {photosType === "construction" &&
                                  tableData[
                                    sitePhotosIndex
                                  ]?.wrdDetails[0]?.sitePhotos?.map(
                                    (photo, i) => (
                                      <div
                                        key={i}
                                        className="flex flex-col items-center justify-center w-full h-auto mt-5 gap-3 mx-3"
                                      >
                                        <img
                                          key={i}
                                          id="imageDisplay"
                                          src={photo.uri}
                                          alt="Construction Site Photo"
                                          width={150}
                                          height={150}
                                          className="cursor-pointer hover:opacity-70 rounded-lg h-60 w-60"
                                          onClick={() =>
                                            handleDownload(
                                              photo.uri,
                                              `construction-site-photo-${sitePhotosIndex}-${i}.jpg`,
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
                                    ),
                                  )}

                                {/* Show Inspection Photos */}
                                {photosType === "inspection" &&
                                  tableData[inspPhotosIndex]?.wrdDetails
                                    .slice(1)
                                    ?.flatMap((inspection, inspIndex) =>
                                      inspection.sitePhotos?.map((photo, i) => (
                                        <div
                                          key={`${inspIndex}-${i}`}
                                          className="flex flex-col items-center justify-center w-full h-auto mt-5 gap-3 mx-3"
                                        >
                                          <img
                                            src={photo.uri}
                                            alt="Inspection Site Photo"
                                            width={150}
                                            height={150}
                                            className="cursor-pointer hover:opacity-70 rounded-lg h-60 w-60"
                                            onClick={() =>
                                              handleDownload(
                                                photo.uri,
                                                `inspection-site-photo-${inspIndex}-${i}.jpg`,
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
                                              >
                                                <MdFileDownload size={20} />
                                              </a>
                                            </div>
                                          </Tooltip>
                                        </div>
                                      )),
                                    )}
                              </>
                            ) : (
                              "No record found!"
                            )}
                          </div>
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
                                className="page-item hover pe-3 border border-grayTwo cursor-pointer text-center border-e-0"
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
                                    "page-item hover px-3 border border-grayTwo cursor-pointer text-center border-e-0 font-semibold " +
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
                                className="page-item hover px-3 border border-grayTwo cursor-pointer"
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
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WRDReport;

// original code
// "use client"; // For Next.js 13+ (app router)

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import moment from "moment";
// import * as XLSX from "xlsx";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { FaFileDownload, FaImage, FaSpinner } from "react-icons/fa";
// import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
// import { usePathname } from "next/navigation";
// import ls from "localstorage-slim";
// import { FaSearch } from "react-icons/fa";
// import { Modal, Tooltip } from "flowbite-react";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import { MdFileDownload } from "react-icons/md";

// // -------------------- 1) Header Definitions --------------------
// // We aim for a total of 40 columns in this example.

// // Level 1: Big Groups
// // Let's define them as follows (sum = 40):
// //  1. Sr. No (1 col)
// //  2. Project & Farmer Details (15 col)
// //  3. Cost of Structure (4 col)
// //  4. Measurement of Structure (3 col)
// //  5. Construction Water Storage (4 col)
// //  6. Construction Status (3 col)
// //  7. Construction Photos (1 col)
// //  8. Inspection Details (9 col)
// const level1UI = [
//   { label: "Project & Farmer Details", colSpan: 16 },
//   { label: "Cost of Structure (Rs)", colSpan: 4 },
//   { label: "Measurement of Structure (Meter)", colSpan: 3 },
//   { label: "Construction Details", colSpan: 10 },
//   { label: "Inspection Details", colSpan: 9 },
// ];

// // Level 2: Sub-groups
// // For simplicity, let's keep them fairly high-level:
// const level2UI = [
//   { label: "Project & Farmer Info", colSpan: 16 },
//   { label: "Cost", colSpan: 4 },
//   { label: "Structure Dimensions", colSpan: 3 },
//   { label: "Construction Info", colSpan: 2 },
//   { label: "Approx Water Storage (m)", colSpan: 4 },
//   { label: "Construction Info", colSpan: 4 },
//   { label: "Inspection Date", colSpan: 1 },
//   { label: "Approx Water Storage (m)", colSpan: 4 },
//   { label: "Inspection Info", colSpan: 5 },
// ];

// // Level 3: Actual column headers (40 items)
// const level3 = [
//   // Column 0: Sr. No
//   "Sr. No",
//   // 1..15: Project & Farmer
//   "Center Name",
//   "Program",
//   "Project",
//   "Activity",
//   "SubActivity",
//   "Farmer Name",
//   "Aadhaar Card",
//   "Gat/Khasra No",
//   "Village",
//   "Block",
//   "District",
//   "State",
//   "Country",
//   "Latitude",
//   "Longitude",
//   // 16..19: Cost of Structure
//   "LHWRF",
//   "Beneficiary",
//   "Other",
//   "Total Cost",
//   // 20..22: Measurement of Structure
//   "Height (Meter)",
//   "Length (Meter)",
//   "Width (Meter)",
//   "Construction Date",
//   "Soil Type",
//   // 23..26: Construction Water Storage (4 columns)
//   "Length(m)",
//   "Width(m)",
//   "Depth(m)",
//   "Total(cum)",
//   // 27..29: Construction Status (3 columns)
//   "Current Status",
//   "Beneficiary Nos",
//   "Area Irrigated  (Acre)",
//   // 30: Construction Photos (1 column)
//   "Construction Photos",
//   // 31..39: Inspection (9 columns)
//   "Inspection Date",
//   "Length(m)",
//   "Width(m)",
//   "Depth(m)",
//   "Total(cum)",
//   "Status",
//   "Beneficiary Nos",
//   "Area Irrigated (Acre)",
//   "Photos",
// ];

// // -------------------- 2) Helper Functions --------------------
// const formatAadhaarNumber = (aadhaar) =>
//   aadhaar ? aadhaar.replace(/(.{4})/g, "$1 ") : "--NA--";

// const formatToINR = (num) => {
//   const validNum = isNaN(num) || num == null ? 0 : num;
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 2,
//   })
//     .format(validNum)
//     .replace(/^(\D+)/, "$1 ");
// };

// const formatNumberToCommas = (num) =>
//   num ? new Intl.NumberFormat("en-IN").format(num) : 0;

// // -------------------- 3) Component --------------------
// function WRDReport() {
//   const [tableData, setTableData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const pathname = usePathname();
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true })
//   );
//   const SOIL_TYPES = process.env.SOIL_TYPES;
//   const soilTypesArray = SOIL_TYPES?.split(",")?.map((event) => event?.trim());
//   const [soilTypes, setSoilTypes] = useState(soilTypesArray);

//   // console.log("userDetails  =>", userDetails);
//   const [centerName, setCenterName] = useState("all");
//   const [center_id, setCenter_id] = useState("all");
//   const [fromDate, setFromDate] = useState("all");
//   const [toDate, setToDate] = useState("all");
//   const [district, setDistrict] = useState("all");
//   const [block, setBlock] = useState("all");

//   const [uniqueDistricts, setUniqueDistricts] = useState([]);
//   const [uniqueBlocks, setUniqueBlocks] = useState([]);
//   const [soilType, setSoilType] = useState("all");
//   const [centerNameList, setCenterNameList] = useState([]);
//   const [wrdData, setWRDData] = useState([]);

//   const [filterData, setFilterData] = useState([]);
//   let [runCount, setRunCount] = useState(0);

//   let [recsPerPage, setRecsPerPage] = useState(10);
//   let [numOfPages, setNumOfPages] = useState([1]);
//   let [pageNumber, setPageNumber] = useState(1);
//   let [searchText, setSearchText] = useState("-");
//   let [totalRecs, setTotalRecs] = useState("-");
//   let [search, setSearch] = useState("");
//   let startSerialNumber = (pageNumber - 1) * recsPerPage + 1;
//   const [photosModal, setPhotosModal] = useState(false);
//   const [sitePhotosIndex, setSitePhotosIndex] = useState("");
//   const [inspPhotosIndex, setInspPhotosIndex] = useState("");
//   const [photosType, setPhotoType] = useState("");
//   const [selectedPhotos, setSelectedPhotos] = useState([]);

//   useEffect(() => {
//     window.handlePhotoClick = (photosJSON, index) => {
//       const photos = JSON.parse(photosJSON);
//       setSelectedPhotos(photos);
//       setPhotosModal(true);
//       setPhotoType("construction");
//       setSitePhotosIndex(index);
//     };
//     window.handleInspectionPhotoClick = (photosJSON, index) => {
//       const photos = JSON.parse(photosJSON);
//       setSelectedPhotos(photos);
//       setPhotosModal(true);
//       setPhotoType("inspection");
//       setInspPhotosIndex(index);
//     };
//     console.log(
//       "tableData[inspPhotosIndex]?.wrdDetails.slice(1)",
//       tableData[inspPhotosIndex]?.wrdDetails.slice(1)
//     );
//     tableData[inspPhotosIndex]?.wrdDetails.slice(1)?.flatMap((inspection) => {
//       console.log("inspection", inspection);
//     });
//   }, [inspPhotosIndex, sitePhotosIndex]);

//   // Fetch data from API
//   const getReportData1 = async () => {
//     try {
//       const formValues = {
//         block: "all",
//         centerName: "all",
//         district: "all",
//         fromDate: "2024/04/01",
//         toDate: "2025/03/31",
//         pageNumber: 1,
//         recsPerPage: 10,
//         searchText: "-",
//         soilType: "all",
//         removePagination: true,
//       };
//       const response = await axios.post(
//         "/api/reports/post/wrd-report",
//         formValues
//       );
//       if (response.data.success) {
//         setTableData(response.data.tableData);
//       } else {
//         console.error(response.data.errorMsg);
//       }
//     } catch (error) {
//       console.error("Error fetching WRD data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getReportData = async () => {
//     const formValues = {
//       searchText: searchText,
//       centerName: centerName,
//       district: district,
//       block: block,
//       soilType: soilType,
//       fromDate: moment(fromDate).format("YYYY/MM/DD"),
//       toDate: moment(toDate).format("YYYY/MM/DD"),
//       recsPerPage: recsPerPage,
//       pageNumber: pageNumber,
//     };
//     setFilterData(formValues);
//     try {
//       const response = await axios.post(
//         "/api/reports/post/wrd-report",
//         formValues
//       );
//       console.log("response", response);
//       // console.log("totalRecs", response.data.totalRecs);
//       if (response.data.success) {
//         setTotalRecs(response.data.totalRecs);
//         setTableData(response.data.tableData);
//       } else {
//         console.log(response.data.errorMsg);
//       }
//     } catch (error) {
//       console.error("Error fetching filtered data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -------------------- 4) Build Data Rows --------------------
//   // We'll build a "main" portion for columns 0..30, then 9 columns for inspection = 40 total.

//   // Main portion includes:
//   //   1 col: Sr. No
//   //   15 col: Project & Farmer
//   //   4 col: Cost
//   //   3 col: Measurement
//   //   4 col: Construction Water
//   //   3 col: Construction Status
//   //   1 col: Construction Photos
//   // = 1 + 15 + 4 + 3 + 4 + 3 + 1 = 31 columns
//   function buildMainColumns(record, mainDetail, srNo, index) {
//     // Column 0: Sr. No
//     // Next 15: Project & Farmer
//     const centerName = record.centerName || "--NA--";
//     const program = record.program || "--NA--";
//     const project = record.project || "--NA--";
//     const activity = record.activity || "--NA--";
//     const subActivity = record.subActivity || "--NA--";
//     const farmerName =
//       mainDetail.farmerDetails?.farmerName ||
//       record.farmerDetails?.farmerName ||
//       "--NA--";
//     const aadhaarCard = formatAadhaarNumber(record.farmerDetails?.aadharCard);
//     const gatKasara = record.locationDetails?.gatKasara || "--NA--";
//     const village = record.locationDetails?.village || "--NA--";
//     const block = record.locationDetails?.block || "--NA--";
//     const district = record.locationDetails?.district || "--NA--";
//     const state = record.locationDetails?.state || "--NA--";
//     const country = record.locationDetails?.country || "--NA--";
//     const latitude = record.locationDetails?.latitude || "--NA--";
//     const longitude = record.locationDetails?.longitude || "--NA--";

//     // Cost (4 columns)
//     const LHWRF = mainDetail.costOfStructure?.LHWRF || 0;
//     const beneficiary = mainDetail.costOfStructure?.beneficiary || 0;
//     const other = mainDetail.costOfStructure?.other || 0;
//     const totalCost = LHWRF + beneficiary + other;

//     // Measurement (3 columns)
//     const height = mainDetail.measurementOfStructure?.height || 0;
//     const lengthM = mainDetail.measurementOfStructure?.length || 0;
//     const widthM = mainDetail.measurementOfStructure?.width || 0;

//     // Construction Water Storage (4 columns)
//     const cLength = mainDetail.measurementOfSubmergence?.length || 0;
//     const cWidth = mainDetail.measurementOfSubmergence?.width || 0;
//     const cDepth = mainDetail.measurementOfSubmergence?.depth || 0;
//     const cTotal = mainDetail.totalVolume || cLength * cWidth * cDepth;

//     // Construction Status (3 columns)
//     const currentStatus = mainDetail.currentStatus || "--NA--";
//     const beneficiaryNos = mainDetail.beneficiaryNos || 0;
//     const areaIrrigated = mainDetail.areaIrrigated || 0;

//     const constructionDate = mainDetail.constructionDate
//       ? moment(mainDetail.constructionDate).format("DD/MM/YYYY")
//       : "--NA--";
//     const soilType = mainDetail.soilType || "--NA--";

//     // Construction Photos (1 column)
//     const constructionPhotos1 = Array.isArray(mainDetail.sitePhotos)
//       ? mainDetail.sitePhotos.map((p) => p.uri).join("\n")
//       : "--NA--";
//     const constructionPhotos = Array.isArray(mainDetail.sitePhotos)
//       ? `<div
//       title="Click to View Construction Photos"
//       style="cursor: pointer; color: #4A5568;"
//       class="w-full flex justify-center"
//       onclick='window.handlePhotoClick(${JSON.stringify(
//         JSON.stringify(mainDetail.sitePhotos)
//       )}, ${index})'
//     >
//       🖼️
//     </div>`
//       : "--NA--";
//     return [
//       // 1 col: Sr. No
//       srNo,
//       // 15 col: Project & Farmer
//       centerName,
//       program,
//       project,
//       activity,
//       subActivity,
//       farmerName,
//       aadhaarCard,
//       gatKasara,
//       village,
//       block,
//       district,
//       state,
//       country,
//       latitude,
//       longitude,
//       // 4 col: Cost
//       LHWRF,
//       beneficiary,
//       other,
//       totalCost,
//       // 3 col: Measurement
//       height,
//       lengthM,
//       widthM,
//       constructionDate,
//       soilType,
//       // 4 col: Construction Water
//       cLength,
//       cWidth,
//       cDepth,
//       cTotal,
//       // 3 col: Construction Status
//       currentStatus,
//       beneficiaryNos,
//       areaIrrigated,
//       // 1 col: Construction Photos
//       constructionPhotos,
//     ]; // total 31 items
//   }

//   // Inspection columns => 9 columns: [Date, L, W, D, Total, Status, Beneficiary Nos, Area Irrigated, Photos]
//   function buildInspectionColumns(insp, srNo) {
//     const iDate = insp.constructionDate
//       ? moment(insp.constructionDate).format("DD/MM/YYYY")
//       : "--NA--";
//     const iLength = insp.measurementOfSubmergence?.length || 0;
//     const iWidth = insp.measurementOfSubmergence?.width || 0;
//     const iDepth = insp.measurementOfSubmergence?.depth || 0;
//     const iTotal = insp.totalVolume || iLength * iWidth * iDepth;
//     const iStatus = insp.currentStatus || "--NA--";
//     const iBeneficiaryNos = insp.beneficiaryNos || 0;
//     const iAreaIrrigated = insp.areaIrrigated || 0;
//     const iPhotos = Array.isArray(insp.sitePhotos)
//       ? `<div
//       title="Click to View Construction Photos"
//       style="cursor: pointer; color: #4A5568;"
//       class="w-full flex justify-center text-xl"
//       onclick='window.handleInspectionPhotoClick(${JSON.stringify(
//         JSON.stringify(insp.sitePhotos)
//       )}, ${srNo})'
//     >
//       🖼️
//     </div>`
//       : "--NA--";

//     return [
//       iDate,
//       iLength,
//       iWidth,
//       iDepth,
//       iTotal,
//       iStatus,
//       iBeneficiaryNos,
//       iAreaIrrigated,
//       iPhotos,
//     ];
//   }

//   // For each record:
//   // - If there is at least one inspection, the first row has 31 (main) + 9 (inspection) = 40 columns.
//   // - Additional inspection rows => 31 blanks + 9 inspection columns.
//   // - If no inspections => 31 main columns + 9 blanks = 40 columns.
//   function buildRowsForUI(record, idx) {
//     const rows = [];

//     let startSerialNumber = (pageNumber - 1) * recsPerPage + 1;
//     const srNo = startSerialNumber + idx;
//     // const srNo = idx + 1;
//     const mainDetail = record.wrdDetails?.[0] || {};
//     const mainCols = buildMainColumns(record, mainDetail, srNo, idx); // 31 items
//     const inspections = record.wrdDetails?.slice(1) || [];

//     if (inspections.length > 0) {
//       // First row => main + first inspection
//       const firstInsp = inspections[0];
//       const inspCols = buildInspectionColumns(firstInsp, idx);
//       rows.push([...mainCols, ...inspCols]); // 31 + 9 = 40
//       // subsequent => blank main + insp
//       const blankMain = Array(mainCols.length).fill("");
//       inspections.slice(1).forEach((insp) => {
//         const inspData = buildInspectionColumns(insp, idx);
//         rows.push([...blankMain, ...inspData]);
//       });
//     } else {
//       // no inspection => main + 9 blanks
//       const blankInsp = Array(9).fill("");
//       rows.push([...mainCols, ...blankInsp]);
//     }
//     return rows;
//   }

//   function buildAllRowsForUI() {
//     let allRows = [];
//     tableData.forEach((record, idx) => {
//       const rowSet = buildRowsForUI(record, idx);
//       allRows.push(...rowSet);
//     });
//     return allRows;
//   }

//   // -------------------- 5) Download Excel with Same Structure --------------------
//   const downloadExcel1 = async () => {
//     try {
//       const formValues = {
//         block: "all",
//         centerName: "all",
//         district: "all",
//         fromDate: "2024/04/01",
//         toDate: "2025/03/31",
//         pageNumber: 1,
//         recsPerPage: 10,
//         searchText: "-",
//         soilType: "all",
//         removePagination: true,
//       };
//       const response = await axios.post(
//         "/api/reports/post/wrd-report",
//         formValues
//       );
//       const fullData = response.data.tableData;
//       if (!fullData || fullData.length === 0) {
//         alert("No data available!");
//         return;
//       }

//       // Build header rows for Excel
//       const excelLevel1 = level1UI.reduce((arr, group) => {
//         arr.push(group.label);
//         for (let i = 1; i < group.colSpan; i++) {
//           arr.push("");
//         }
//         return arr;
//       }, []);
//       const excelLevel2 = level2UI.reduce((arr, group) => {
//         arr.push(group.label);
//         for (let i = 1; i < group.colSpan; i++) {
//           arr.push("");
//         }
//         return arr;
//       }, []);

//       const excelRows = [];
//       excelRows.push(excelLevel1);
//       excelRows.push(excelLevel2);
//       excelRows.push(level3);

//       // Build data rows
//       fullData.forEach((record, idx) => {
//         const srNo = idx + 1;
//         const mainDetail = record.wrdDetails?.[0] || {};
//         const mainCols = buildMainColumns(record, mainDetail, srNo, idx); // 31
//         const inspections = record.wrdDetails?.slice(1) || [];
//         if (inspections.length > 0) {
//           const firstInsp = inspections[0];
//           const inspCols = buildInspectionColumns(firstInsp, idx); // 9
//           excelRows.push([...mainCols, ...inspCols]); // 40
//           const blankMain = Array(mainCols.length).fill("");
//           inspections.slice(1).forEach((insp) => {
//             const inspData = buildInspectionColumns(insp, idx);
//             excelRows.push([...blankMain, ...inspData]);
//           });
//         } else {
//           const blankInsp = Array(9).fill("");
//           excelRows.push([...mainCols, ...blankInsp]);
//         }
//       });

//       // Create worksheet
//       const ws = XLSX.utils.aoa_to_sheet(excelRows);

//       // Merge header rows
//       let merges = [];
//       let startCol = 0;
//       level1UI.forEach((group) => {
//         if (group.colSpan > 1) {
//           merges.push({
//             s: { r: 0, c: startCol },
//             e: { r: 0, c: startCol + group.colSpan - 1 },
//           });
//         }
//         startCol += group.colSpan;
//       });
//       startCol = 0;
//       level2UI.forEach((group) => {
//         if (group.colSpan > 1) {
//           merges.push({
//             s: { r: 1, c: startCol },
//             e: { r: 1, c: startCol + group.colSpan - 1 },
//           });
//         }
//         startCol += group.colSpan;
//       });
//       ws["!merges"] = merges;
//       ws["!cols"] = level3.map(() => ({ wch: 20 }));

//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "WRD Report");
//       XLSX.writeFile(wb, "WRD_Report.xlsx");
//     } catch (error) {
//       console.error("Error downloading Excel:", error);
//       alert("Failed to export data.");
//     }
//   };

//   const downloadExcel2 = async () => {
//     try {
//       const formValues = {
//         block: "all",
//         centerName: "all",
//         district: "all",
//         fromDate: "2024/04/01",
//         toDate: "2025/03/31",
//         pageNumber: 1,
//         recsPerPage: 10,
//         searchText: "-",
//         soilType: "all",
//         removePagination: true,
//       };
//       const response = await axios.post(
//         "/api/reports/post/wrd-report",
//         formValues
//       );
//       const fullData = response.data.tableData;

//       if (!fullData || fullData.length === 0) {
//         alert("No data available!");
//         return;
//       }

//       // 1️⃣ Initialize Workbook & Worksheet
//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet("WRD Report");

//       // 2️⃣ Define Header Rows
//       const headers1 = level1UI.map((group) => group.label);
//       const headers2 = level2UI.map((group) => group.label);
//       const headers3 = level3;

//       // 3️⃣ Add Headers to Worksheet
//       worksheet.addRow(headers1);
//       worksheet.addRow(headers2);
//       worksheet.addRow(headers3);

//       // 4️⃣ Add Data Rows
//       fullData.forEach((record, idx) => {
//         const srNo = idx + 1;
//         const mainDetail = record.wrdDetails?.[0] || {};
//         const mainCols = buildMainColumns(record, mainDetail, srNo, idx);
//         const inspections = record.wrdDetails?.slice(1) || [];

//         if (inspections.length > 0) {
//           const firstInsp = inspections[0];
//           const inspCols = buildInspectionColumns(firstInsp, idx);
//           worksheet.addRow([...mainCols, ...inspCols]);

//           const blankMain = Array(mainCols.length).fill("");
//           inspections.slice(1).forEach((insp) => {
//             const inspData = buildInspectionColumns(insp, idx);
//             worksheet.addRow([...blankMain, ...inspData]);
//           });
//         } else {
//           const blankInsp = Array(9).fill("");
//           worksheet.addRow([...mainCols, ...blankInsp]);
//         }
//       });

//       // 5️⃣ Apply Formatting (Borders, Alignment, Colors)
//       worksheet.eachRow((row, rowNumber) => {
//         row.eachCell((cell, colNumber) => {
//           cell.alignment = {
//             vertical: "middle",
//             horizontal: rowNumber <= 3 ? "center" : "left",
//           };

//           // Apply bold text and background color to headers
//           if (rowNumber <= 3) {
//             cell.font = { bold: true, color: { argb: "FFFFFF" } };
//             cell.fill = {
//               type: "pattern",
//               pattern: "solid",
//               fgColor: { argb: "4F81BD" },
//             };
//           }

//           // Apply Borders to all cells
//           cell.border = {
//             top: { style: "thin" },
//             left: { style: "thin" },
//             bottom: { style: "thin" },
//             right: { style: "thin" },
//           };
//         });
//       });

//       // 6️⃣ Auto-Adjust Column Widths
//       worksheet.columns.forEach((column, index) => {
//         let maxLength = 10;
//         column.eachCell((cell) => {
//           const cellValue = cell.value ? cell.value.toString() : "";
//           maxLength = Math.max(maxLength, cellValue.length);
//         });
//         column.width = maxLength + 2; // Add some padding
//       });

//       // 7️⃣ Generate Excel File
//       const buffer = await workbook.xlsx.writeBuffer();
//       const blob = new Blob([buffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });
//       saveAs(blob, "WRD_Report.xlsx");
//     } catch (error) {
//       console.error("Error downloading Excel:", error);
//       alert("Failed to export data.");
//     }
//   };

//   const downloadExcel = async () => {
//     try {
//       const formValues = {
//         ...filterData,
//         // block: "all",
//         // centerName: centerName,
//         // district: "all",
//         // fromDate: "2024/04/01",
//         // toDate: "2025/03/31",
//         // pageNumber: 1,
//         // recsPerPage: 10,
//         // searchText: "-",
//         // soilType: "all",
//         removePagination: true,
//       };
//       const response = await axios.post(
//         "/api/reports/post/wrd-report",
//         formValues
//       );
//       const fullData = response.data.tableData;

//       if (!fullData || fullData.length === 0) {
//         alert("No data available!");
//         return;
//       }

//       // 1️⃣ Initialize Workbook & Worksheet
//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet("WRD Report");

//       // 2️⃣ Define Headers
//       const headers1 = level1UI.map((group) => group.label);
//       const headers2 = level2UI.map((group) => group.label);
//       const headers3 = level3;

//       const row1 = worksheet.addRow(headers1);
//       const row2 = worksheet.addRow(headers2);
//       const row3 = worksheet.addRow(headers3);

//       // 3️⃣ Merge Header Cells (Same as UI)
//       let startCol = 1;
//       level1UI.forEach((group) => {
//         if (group.colSpan > 1) {
//           worksheet.mergeCells(1, startCol, 1, startCol + group.colSpan - 1);
//           worksheet.getCell(1, startCol).value = group.label; // Set header text explicitly
//         }
//         startCol += group.colSpan;
//       });

//       startCol = 1;
//       level2UI.forEach((group) => {
//         if (group.colSpan > 1) {
//           worksheet.mergeCells(2, startCol, 2, startCol + group.colSpan - 1);
//           worksheet.getCell(2, startCol).value = group.label; // Set header text explicitly
//         }
//         startCol += group.colSpan;
//       });

//       // 4️⃣ Add Data Rows
//       fullData.forEach((record, idx) => {
//         const srNo = idx + 1;
//         const mainDetail = record.wrdDetails?.[0] || {};
//         const mainCols = buildMainColumns(record, mainDetail, srNo, idx);
//         const inspections = record.wrdDetails?.slice(1) || [];

//         //  Remove <a> tags from photo column
//         // mainCols.forEach((col, i) => {
//         //   if (typeof col === "string" && col.includes("<a")) {
//         //     mainCols[i] = col.replace(/<a[^>]*>(.*?)<\/a>/g, "$1"); // Extract only text inside <a>
//         //   }
//         // });
//         mainCols.forEach((col, i) => {
//           if (
//             typeof col === "string" &&
//             (col.includes("<a") || col.includes("<img"))
//           ) {
//             // Extract URLs from href="..." or src="..."
//             const match =
//               col.match(/href="([^"]+)"/) || col.match(/src="([^"]+)"/);
//             mainCols[i] = match ? match[1] : col;
//           }
//         });

//         if (inspections.length > 0) {
//           const firstInsp = inspections[0];
//           const inspCols = buildInspectionColumns(firstInsp, idx);
//           worksheet.addRow([...mainCols, ...inspCols]);

//           const blankMain = Array(mainCols.length).fill("");
//           inspections.slice(1).forEach((insp) => {
//             const inspData = buildInspectionColumns(insp, idx);
//             worksheet.addRow([...blankMain, ...inspData]);
//           });
//         } else {
//           const blankInsp = Array(9).fill("");
//           worksheet.addRow([...mainCols, ...blankInsp]);
//         }
//       });

//       // 5️⃣ Apply Formatting (Borders, Alignment, Colors)
//       worksheet.eachRow((row, rowNumber) => {
//         row.eachCell((cell, colNumber) => {
//           cell.alignment = {
//             vertical: "middle",
//             horizontal: rowNumber <= 3 ? "center" : "left",
//           };

//           // Apply bold text and background color to headers
//           if (rowNumber <= 3) {
//             cell.font = { bold: true, color: { argb: "FFFFFF" } };
//             cell.fill = {
//               type: "pattern",
//               pattern: "solid",
//               fgColor: { argb: "4F81BD" },
//             };
//           }

//           // Apply Borders to all cells
//           cell.border = {
//             top: { style: "thin" },
//             left: { style: "thin" },
//             bottom: { style: "thin" },
//             right: { style: "thin" },
//           };
//         });
//       });

//       // 6️⃣ Auto-Adjust Column Widths
//       worksheet.columns.forEach((column, index) => {
//         let maxLength = 10;
//         column.eachCell((cell) => {
//           const cellValue = cell.value ? cell.value.toString() : "";
//           maxLength = Math.max(maxLength, cellValue.length);
//         });
//         column.width = maxLength + 2; // Add some padding
//       });

//       // 7️⃣ Generate Excel File
//       const buffer = await workbook.xlsx.writeBuffer();
//       const blob = new Blob([buffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });
//       saveAs(blob, "WRD_Report.xlsx");
//     } catch (error) {
//       console.error("Error downloading Excel:", error);
//       alert("Failed to export data.");
//     }
//   };

//   useEffect(() => {
//     getReportData();
//   }, [
//     // center_id,
//     centerName,
//     district,
//     block,
//     soilType,
//     fromDate,
//     toDate,
//     runCount,
//     searchText,
//     pageNumber,
//     recsPerPage,
//   ]);

//   useEffect(() => {
//     if (totalRecs > 0) {
//       const totalPages = Math.ceil(totalRecs / recsPerPage);

//       if (totalPages <= 5) {
//         const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//         setNumOfPages(pages);
//       } else {
//         let pages = [];

//         if (pageNumber <= 3) {
//           pages = [1, 2, 3, "...", totalPages];
//         } else if (pageNumber >= totalPages - 2) {
//           pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
//         } else {
//           pages = [
//             1,
//             "...",
//             pageNumber - 1,
//             pageNumber,
//             pageNumber + 1,
//             "...",
//             totalPages,
//           ];
//         }
//         // console.log("numOfPages before", numOfPages);
//         setNumOfPages([...new Set(pages)]);
//       }
//     }
//   }, [totalRecs, recsPerPage, pageNumber]);

//   useEffect(() => {
//     getCenterNameList();
//   }, []);

//   const getCenterNameList = () => {
//     axios
//       .get("/api/centers/list")
//       .then((response) => {
//         const CenterNameList = response.data;

//         if (Array.isArray(CenterNameList)) {
//           setCenterNameList(CenterNameList);
//         } else {
//           console.error(
//             "Expected data to be an array but got:",
//             CenterNameList
//           );
//           setCenterNameList([]);
//         }
//       })
//       .catch((error) => {
//         console.log("Error while getting CenterName List => ", error);
//       });
//   };
//   const handlePageClick = (page) => {
//     if (page === "...") return;
//     setPageNumber(page);
//   };
//   const formatToINR = (num) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     })
//       .format(num)
//       .replace(/^(\D+)/, "$1 ");
//   };
//   useEffect(() => {
//     if (pathname.includes("admin")) {
//       setLoggedInRole("admin");
//       setCenter_id("all");
//       setCenterName("all");
//     } else if (pathname.includes("center")) {
//       setLoggedInRole("center");
//       setCenter_id(userDetails.center_id);
//       setCenterName(userDetails.centerName);
//       getCenterData(userDetails.center_id);
//     } else {
//       setLoggedInRole("executive");
//       setCenter_id("all");
//       setCenterName("all");
//     }

//     const { startDate, endDate } = getCurrentFinancialYearRange();
//     // console.log("startDate",startDate);
//     // console.log("endDate",endDate);
//     setFromDate(startDate);
//     setToDate(endDate);
//   }, []);

//   const getCenterData = (center_id) => {
//     axios
//       .get("/api/centers/get/one/" + center_id)
//       .then((response) => {
//         const uniqueDistricts = [
//           ...new Set(
//             response.data[0].villagesCovered.map((item) => item.district)
//           ),
//         ];
//         console.log("uniqueDistricts", uniqueDistricts);
//         setUniqueDistricts(uniqueDistricts);
//         const uniqueBlocks = [
//           ...new Set(
//             response.data[0].villagesCovered.map((item) => item.block)
//           ),
//         ];
//         setUniqueBlocks(uniqueBlocks);
//       })
//       .catch((error) => {
//         console.log(error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   const getCurrentFinancialYearRange = () => {
//     const today = new Date();

//     let financialYearStart = new Date(today.getFullYear(), 3, 1); // April 1st of the current year
//     let financialYearEnd = new Date(today.getFullYear() + 1, 2, 31); // March 31st of the next year

//     // If today is before April 1st, adjust the financial year range to the previous year
//     if (today < financialYearStart) {
//       financialYearStart = new Date(today.getFullYear() - 1, 3, 1); // April 1st of the previous year
//       financialYearEnd = new Date(today.getFullYear(), 2, 31); // March 31st of the current year
//     }

//     return {
//       startDate: moment(financialYearStart).format("YYYY-MM-DD"),
//       endDate: moment(financialYearEnd).format("YYYY-MM-DD"),
//     };
//   };

//   useEffect(() => {
//     if (centerName !== "all") {
//       getCenterData(center_id);
//     }
//   }, [centerName]);

//   const formatNumberToCommas = (num) => {
//     return new Intl.NumberFormat("en-IN").format(num);
//   };

//   function formatAadhaarNumber(aadhaar) {
//     // Use regex to add a spce after every 4 digits
//     return aadhaar.replace(/(.{4})/g, "$1 ");
//   }

//   const handleDownload = async (url, filename) => {
//     // console.log("handleDownload url",url)
//     try {
//       axios
//         .get(url, { responseType: "blob" })
//         .then((response) => {
//           const imageBlob = response.data;
//           const imageUrl = URL.createObjectURL(imageBlob);

//           // Ensure the image element exists
//           const imgElement = document.getElementById("imageDisplay");
//           if (imgElement) {
//             imgElement.src = imageUrl;
//             // console.log("Image loaded successfully");
//           } else {
//             console.error("Element with id 'imageDisplay' not found");
//           }
//           const a = document.createElement("a");
//           a.href = imageUrl;
//           a.download = filename || "downloaded-image.jpg"; // Set default filename
//           document.body.appendChild(a);
//           a.click();
//           document.body.removeChild(a);

//           // console.log("Download triggered successfully");
//         })
//         .catch((error) => console.error("CORS Error:", error));
//     } catch (error) {
//       console.error("Download failed:", error);
//     }
//   };
//   // -------------------- 6) Render UI Table --------------------
//   return (
//     <section className="section">
//     <div className={("container mx-auto transition-all duration-300 ")}>
//       <style jsx>{`
//         .resizing {
//           cursor: col-resize !important;
//         }
//         .resizing th {
//           background-color: rgba(59, 130, 246, 0.1);
//         }
//         .table-container {
//           max-height: 500px; /* Adjust as needed */
//           overflow-y: auto;
//           position: relative;
//         }
//         thead {
//           position: sticky;
//           top: 0;
//           z-index: 10;
//         }
//         thead.header2 {
//           top: ${level2UI && level2UI.length > 0 ? '48px' : '-4px'};
//           z-index: 9;
//         }
//         table {
//           width: 100%;
//           table-layout: auto;
//         }
//         th, td {
//           box-sizing: border-box;
//         }
//       `}</style>
//       <div className="box border-2 rounded-md shadow-md">
//         <div className="uppercase text-xl">
//           <div className="border-b-2 border-grayTwo flex justify-between">
//             <h1 className="heading h-auto content-center">WRD Report</h1>
//           </div>
//         </div>

//         <div className="px-10">
//           <div className="mt-4 mb-0 lg:mb-5 w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
//             {loggedInRole === "admin" || loggedInRole === "executive" ? (
//               <div className="">
//                 <label htmlFor="centerName" className="inputLabel">
//                   Center
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                   <select
//                     name="centerName"
//                     id="centerName"
//                     className="stdSelectField  pl-3"
//                     value={center_id ? `${center_id}|${centerName}` : ""}
//                     onChange={(e) => {
//                       const [center_id, centerName] = e.target.value.split("|");
//                       setCenterName(centerName ? centerName : "all");
//                       setCenter_id(center_id ? center_id : "all");
//                     }}
//                   >
//                     <option value="" disabled className="text-gray-400">
//                       -- Select Center --
//                     </option>
//                     <option value="all">All</option>
//                     {centerNameList?.map((center, i) => (
//                       <option
//                         className="text-black"
//                         key={i}
//                         value={`${center._id}|${center.centerName}`}
//                       >
//                         {center.centerName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             ) : null}
//             <div className="">
//               <label htmlFor="program" className="inputLabel">
//                 District
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                 <select
//                   name="program"
//                   id="program"
//                   className="stdSelectField pl-3"
//                   value={district}
//                   onChange={(e) => {
//                     setDistrict(e.target.value);
//                   }}
//                 >
//                   <option value="" disabled className="text-gray-400">
//                     -- Select District --
//                   </option>
//                   <option value="all">All</option>
//                   {uniqueDistricts.map((district, i) => {
//                     return (
//                       <option className="text-black" key={i} value={district}>
//                         {district}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="project" className="inputLabel">
//                 Block
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                 <select
//                   name="block"
//                   id="block"
//                   className="stdSelectField pl-3"
//                   value={block}
//                   onChange={(e) => {
//                     setBlock(e.target.value);
//                   }}
//                 >
//                   <option value="" disabled className="text-gray-400">
//                     -- Select Block --
//                   </option>
//                   <option value="all">All</option>
//                   {uniqueBlocks.map((block, i) => {
//                     return (
//                       <option className="text-black" key={i} value={block}>
//                         {block}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="activity" className="inputLabel">
//                 Soil Type
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                 <select
//                   name="activity"
//                   id="activity"
//                   className="stdSelectField pl-3"
//                   value={soilType}
//                   onChange={(e) => {
//                     setSoilType(e.target.value);
//                   }}
//                 >
//                   <option value="" disabled className="text-gray-400">
//                     -- Select Soil Type --
//                   </option>
//                   <option value="all">All</option>
//                   {soilTypes?.map((soilType, i) => (
//                     <option className="text-black" key={i} value={soilType}>
//                       {soilType}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div className="">
//               <label htmlFor="fromDate" className="inputLabel">
//                 From Date
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm">
//                 <input
//                   type="date"
//                   name="fromDate"
//                   id="fromDate"
//                   className="stdInputField pl-3"
//                   // max={moment().format("YYYY-MM-DD")}
//                   value={fromDate}
//                   onChange={(e) => {
//                     setFromDate(e.target.value);
//                   }}
//                 />
//               </div>
//             </div>
//             <div className="">
//               <label htmlFor="toDate" className="inputLabel">
//                 To Date
//               </label>
//               <div className="relative mt-2 rounded-md shadow-sm">
//                 <input
//                   type="date"
//                   name="toDate"
//                   id="toDate"
//                   className="stdInputField pl-3"
//                   // max={moment().format("YYYY-MM-DD")}
//                   value={toDate}
//                   onChange={(e) => {
//                     setToDate(e.target.value);
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//           <section className="mt-5 pt-5 w-full">
//             <div className="">
//               <div className="flex lg:flex-row md:flex-col flex-col mt-2 justify-between w-full">
//                 <div className="text-[13px]">
//                   <div className="">
//                     <label
//                       htmlFor="recsPerPage"
//                       // className="mb-4 font-semibold"
//                       className="inputLabel"
//                     >
//                       Records per Page
//                     </label>
//                     <div className="relative mt-2 rounded-md text-gray-500 w-full">
//                       <select
//                         // className="w-full border mt-2 text-[13px]"
//                         // className="stdSelectField py-1.5"
//                         className={`${
//                           recsPerPage
//                             ? "stdSelectField pl-3 w-3/4"
//                             : "stdSelectField pl-3 w-3/4"
//                         } ${recsPerPage ? "selectOption" : "font-normal"}
//                 `}
//                         onChange={(event) => {
//                           setRecsPerPage(event.target.value);
//                           setPageNumber(1)
//                         }}
//                       >
//                         <option value={10} className="font-normal">
//                           10
//                         </option>
//                         <option value={50} className="font-normal">
//                           50
//                         </option>
//                         <option value={100} className="font-normal">
//                           100
//                         </option>
//                         <option value={500} className="font-normal">
//                           500
//                         </option>
//                         <option value={1000} className="font-normal">
//                           1000
//                         </option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex  text-[13px] lg:-mt-1 mt-5 pl-5 w-1/2 justify-between">
//                   {/* {tableObjects?.searchApply ? ( */}
//                   <div className="w-full">
//                     <label
//                       htmlFor="search"
//                       //  className="mb-4 font-semibold"
//                       className="inputLabel"
//                     >
//                       Search
//                     </label>
//                     <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
//                       <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                         <span className="pr-2 border-r-2">
//                           <FaSearch className="icon" />
//                         </span>
//                       </div>
//                       <input
//                         type="text"
//                         // className="w-full border mt-2 text-[13px] ps-1 pb-1"
//                         className="stdInputField"
//                         placeholder="Search"
//                         name="search"
//                         onChange={(event) => {
//                           // console.log("event.target.value => ", event.target.value);
//                           setSearchText(event.target.value);
//                         }}
//                       />
//                     </div>
//                   </div>
//                   {/* ) : null} */}
//                   <div className="mt-7 ml-4">
//                     <Tooltip
//                       content="Download as Excel"
//                       placement="top"
//                       className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
//                       arrow={false}
//                     >
//                       <FaFileDownload
//                         onClick={downloadExcel}
//                         size={"2rem"}
//                         className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                       />
//                     </Tooltip>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5">

//               <div className="table-responsive table-container relative overflow-hidden hover:overflow-auto w-full mt-3">
//                 <table className="min-w-full table-fixed border-collapse text-base bottom  border-separate  w-full dark:w-full leading-tight">

//                     <thead>
//                       {/* Level 1 */}
//                       <tr>
//                         {level1UI.map((group, i) => (
//                           <th
//                             key={i}
//                             colSpan={group.colSpan}
//                             className="border border-grayTwo uppercase px-2 py-1 bg-white text-[13px] text-center"
//                           >
//                             {group.label}
//                           </th>
//                         ))}
//                       </tr>
//                       {/* Level 2 */}
//                       <tr>
//                         {level2UI.map((group, i) => (
//                           <th
//                             key={i}
//                             colSpan={group.colSpan}
//                             className="border border-grayTwo uppercase px-2 py-1 bg-white text-[13px] text-center"
//                           >
//                             {group.label}
//                           </th>
//                         ))}
//                       </tr>
//                       {/* Level 3 */}
//                       <tr>
//                         {level3.map((header, i) => (
//                           <th
//                             key={i}
//                             className="border border-grayTwo uppercase px-2 py-1 bg-white text-[13px] text-center"
//                           >
//                             {header}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody className="border border-grayTwo text-wrap text-[13px]">
//                       {loading ? (
//                         <tr>
//                           <td
//                             colSpan={12}
//                             className="text-center text-Green text-3xl"
//                           >
//                             <FaSpinner className="animate-spin inline-flex mx-2" />
//                           </td>
//                         </tr>
//                       ) : tableData.length === 0 ? (
//                         <tr>
//                           <td colSpan={40} className="text-center text-[13px] py-4">
//                             No data found.
//                           </td>
//                         </tr>
//                       ) : (
//                         buildAllRowsForUI().map((row, rowIndex) => (
//                           <tr key={rowIndex}
//                             className="odd:bg-grayOne  even:bg-white border border-grayTwo text-[#000] font-medium"
//                           >
//                             {row.map((cell, cidx) => (
//                               <td
//                                 key={cidx}
//                                 className="border border-grayTwo px-1 py-1 text-[13px] whitespace-pre font-normal"
//                                 dangerouslySetInnerHTML={{
//                                   __html: cell,
//                                 }}
//                               >
//                                 {/* {cell} */}
//                               </td>
//                             ))}
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>

//                   <Modal
//                     show={photosModal}
//                     size="5xl"
//                     onClose={() => setPhotosModal(false)}
//                     popup
//                   >
//                     <Modal.Header className="modalHeader justify-center">
//                       <div className="flex justify-between gap-5">
//                         <h1 className="text-white mx-auto">Site Photos</h1>
//                         <div
//                           className="modalCloseButton"
//                           onClick={() => setPhotosModal(false)}
//                         >
//                           {/* Close Button */}
//                         </div>
//                       </div>
//                     </Modal.Header>

//                     <Modal.Body>
//                       <div className="bg-white">
//                         <div className="grid grid-cols-3 justify-center mx-auto h-auto content-center mt-5 px-2 gap-3">
//                           {tableData && tableData.length > 0 ? (
//                             <>
//                               {/* Show Construction Photos */}
//                               {photosType === "construction" &&
//                                 tableData[
//                                   sitePhotosIndex
//                                 ]?.wrdDetails[0]?.sitePhotos?.map(
//                                   (photo, i) => (
//                                     <div
//                                       key={i}
//                                       className="flex flex-col items-center justify-center w-full h-auto mt-5 gap-3 mx-3"
//                                     >
//                                       <img
//                                         key={i}
//                                         id="imageDisplay"
//                                         src={photo.uri}
//                                         alt="Construction Site Photo"
//                                         width={150}
//                                         height={150}
//                                         className="cursor-pointer hover:opacity-70 rounded-lg h-60 w-60"
//                                         onClick={() =>
//                                           handleDownload(
//                                             photo.uri,
//                                             `construction-site-photo-${sitePhotosIndex}-${i}.jpg`
//                                           )
//                                         }
//                                       />

//                                       <Tooltip
//                                         content="Click here to Download"
//                                         placement="top"
//                                         className="bg-green dark:bg-green"
//                                         arrow={false}
//                                       >
//                                         <div className="bg-white cursor-pointer mx-auto hover:bg-green text-green hover:text-white font-bold py-2 px-2 rounded border-2 border-green">
//                                           <a
//                                             href={photo.uri}
//                                             target="_blank"
//                                             download
//                                             className=""
//                                           >
//                                             <MdFileDownload size={20} />
//                                           </a>
//                                         </div>
//                                       </Tooltip>
//                                     </div>
//                                   )
//                                 )}

//                               {/* Show Inspection Photos */}
//                               {photosType === "inspection" &&
//                                 tableData[inspPhotosIndex]?.wrdDetails
//                                   .slice(1)
//                                   ?.flatMap((inspection, inspIndex) =>
//                                     inspection.sitePhotos?.map((photo, i) => (
//                                       <div
//                                         key={`${inspIndex}-${i}`}
//                                         className="flex flex-col items-center justify-center w-full h-auto mt-5 gap-3 mx-3"
//                                       >
//                                         <img
//                                           src={photo.uri}
//                                           alt="Inspection Site Photo"
//                                           width={150}
//                                           height={150}
//                                           className="cursor-pointer hover:opacity-70 rounded-lg h-60 w-60"
//                                           onClick={() =>
//                                             handleDownload(
//                                               photo.uri,
//                                               `inspection-site-photo-${inspIndex}-${i}.jpg`
//                                             )
//                                           }
//                                         />
//                                         <Tooltip
//                                           content="Click here to Download"
//                                           placement="top"
//                                           className="bg-green dark:bg-green"
//                                           arrow={false}
//                                         >
//                                           <div className="bg-white cursor-pointer mx-auto hover:bg-green text-green hover:text-white font-bold py-2 px-2 rounded border-2 border-green">
//                                             <a
//                                               href={photo.uri}
//                                               target="_blank"
//                                               download
//                                             >
//                                               <MdFileDownload size={20} />
//                                             </a>
//                                           </div>
//                                         </Tooltip>
//                                       </div>
//                                     ))
//                                   )}
//                             </>
//                           ) : (
//                             "No record found!"
//                           )}
//                         </div>
//                       </div>
//                     </Modal.Body>
//                   </Modal>
//                   {/* {console.log("numOfPages:", numOfPages)}
//                       {console.log("totalRecs:",
//                         totalRecs,
//                         "recsPerPage:",
//                         recsPerPage,"pageNumber",pageNumber)} */}
//                   <div className="flex justify-center my-5">
//                     <nav aria-label="Page navigation flex">
//                       {/* {console.log("totalRecs > recsPerPage:", totalRecs > recsPerPage)} */}

//                       {numOfPages.length > 1 && totalRecs > recsPerPage ? (
//                         <ul className="pagination mx-auto ps-5 flex">
//                           {pageNumber !== 1 ? (
//                             <li
//                               className="page-item hover pe-3 border border-grayTwo cursor-pointer text-center border-e-0"
//                               onClick={() => setPageNumber(--pageNumber)}
//                             >
//                               <a className="page-link ">
//                                 &nbsp; <FontAwesomeIcon icon={faAngleLeft} />
//                               </a>
//                             </li>
//                           ) : null}
//                           {numOfPages.map((item, i) => {
//                             return (
//                               <li
//                                 key={i}
//                                 className={
//                                   "page-item hover px-3 border border-grayTwo cursor-pointer text-center border-e-0 font-semibold " +
//                                   (pageNumber === item ? " active" : "")
//                                 }
//                                 onClick={() => {
//                                   handlePageClick(item);
//                                 }}
//                               >
//                                 <a className="page-link">{item}</a>
//                               </li>
//                             );
//                           })}
//                           {pageNumber !== numOfPages.length ? (
//                             <li
//                               className="page-item hover px-3 border border-grayTwo cursor-pointer"
//                               onClick={() => {
//                                 setPageNumber(++pageNumber);
//                               }}
//                             >
//                               <a className="page-link ">
//                                 <FontAwesomeIcon icon={faAngleRight} />
//                               </a>
//                             </li>
//                           ) : null}
//                         </ul>
//                       ) : null}
//                     </nav>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>
//       </div>
//     </section>
//   );
// }

// export default WRDReport;
