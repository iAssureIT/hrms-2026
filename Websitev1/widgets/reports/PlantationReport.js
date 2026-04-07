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

    const [centerName, setCenterName] = useState("");
    const [center_id, setCenter_id] = useState("");
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

    const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
    const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
    const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);
    const [speciesDropdownOpen, setSpeciesDropdownOpen] = useState(false);
    const [recsPerPageDropdownOpen, setRecsPerPageDropdownOpen] = useState(false);

    const toggleDropdown = (setter, state) => {
        setCenterDropdownOpen(false);
        setDistrictDropdownOpen(false);
        setBlockDropdownOpen(false);
        setSpeciesDropdownOpen(false);
        setRecsPerPageDropdownOpen(false);
        setter(!state);
    };

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
        program: "Program",
        project: "Project",
        activity: "Activity",
        subActivity: "Subactivity",
        "farmerDetails.farmerName": "Farmer Name",
        "farmerDetails.aadharCard": "Aadhaar Card No",
        "locationDetails.gatKasara": "Gat/Kasara No",
        "locationDetails.village": "Village",
        "locationDetails.block": "Block",
        "locationDetails.district": "District",
        "locationDetails.state": "State",
        "locationDetails.country": "Country",
        "locationDetails.latitude": "Latitude",
        "locationDetails.longitude": "Longitude",
        "plantationDetails[0].plantationDate": "Plantation Date",
        "plantationDetails[0].speciesDetails[0].speciesName": "Plantation Species Name",
        "plantationDetails[0].speciesDetails[0].numberOfSaplings": "Planted Sapling No (Nos)",
        "plantationDetails[0].speciesDetails[0].avgHeight": "Avg. Height (ft)",
        "plantationDetails[0].speciesDetails[0].avgDiameter": "Avg. Diameter (inch)",
        "plantationDetails[0].speciesDetails[0].yeild": "Yield (kg)",
        "plantationDetails[0].speciesDetails[0].income": "Income (Rs.)",
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

        let financialYearStart = new Date(today.getFullYear(), 3, 1);
        let financialYearEnd = new Date(today.getFullYear() + 1, 2, 31);

        if (today < financialYearStart) {
            financialYearStart = new Date(today.getFullYear() - 1, 3, 1);
            financialYearEnd = new Date(today.getFullYear(), 2, 31);
        }

        return {
            startDate: moment(financialYearStart).format("YYYY-MM-DD"),
            endDate: moment(financialYearEnd).format("YYYY-MM-DD"),
        };
    };

    useEffect(() => {
        if (centerName !== "all" && center_id !== "all" && center_id !== "") {
            getCenterData(center_id);
        }
    }, [centerName, center_id]);

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
        try {
            const response = await axios.post(
                "/api/reports/post/plantation-report",
                formValues
            );

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
        return aadhaar.replace(/(.{4})/g, "$1 ");
    }

    const getCenterData = (center_id) => {
        axios
            .get("/api/centers/get/one/" + center_id)
            .then((response) => {
                if (response.data && response.data[0]) {
                    const uniqueDistricts = [
                        ...new Set(
                            response.data[0].villagesCovered.map((item) => item.district)
                        ),
                    ];
                    setUniqueDistricts(uniqueDistricts);
                    const uniqueBlocks = [
                        ...new Set(
                            response.data[0].villagesCovered.map((item) => item.block)
                        ),
                    ];
                    setUniqueBlocks(uniqueBlocks);
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDownload = async (url, filename) => {
        try {
            axios
                .get(url, { responseType: "blob" })
                .then((response) => {
                    const imageBlob = response.data;
                    const imageUrl = URL.createObjectURL(imageBlob);

                    const imgElement = document.getElementById("imageDisplay");
                    if (imgElement) {
                        imgElement.src = imageUrl;
                    } else {
                        console.error("Element with id 'imageDisplay' not found");
                    }
                    const a = document.createElement("a");
                    a.href = imageUrl;
                    a.download = filename || "downloaded-image.jpg";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                })
                .catch((error) => console.error("CORS Error:", error));
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const downloadExcel = async () => {
        try {
            setLoading(true);
            const formvalues = { ...filterData, removePagination: true };
            const response = await axios.post("/api/reports/post/plantation-report", formvalues);
            const fullData = response.data.tableData;

            if (!fullData || fullData.length === 0) {
                alert("No data to export!");
                return;
            }

            const wb = XLSX.utils.book_new();

            // === HEADER ROWS ===
            const headerRow1 = [
                "Sr.", "Center Name", "Program", "Project", "Activity", "Subactivity",
                "Farmer Name", "Aadhaar Card No", "Gat/Kasara No", "Village", "Block",
                "District", "State", "Country", "Latitude", "Longitude",
                "PLANTATION / INSPECTION DETAILS"
            ];

            const headerRow2 = [
                "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
                "Date", "Species", "Planted", "Survived", "Avg. Ht (ft)", "Avg. Dia (in)", "Yield (kg)", "Income (₹)", "Photos"
            ];

            const rows = [headerRow1, headerRow2];

            // === DATA ROWS ===
            fullData.forEach((record, recIdx) => {
                const events = record.plantationDetails || [];
                const totalSpeciesRows = events.reduce((sum, e) => sum + (e.speciesDetails?.length || 1), 0);

                let speciesRowIndex = 0;

                events.forEach((event, eventIdx) => {
                    const speciesList = event.speciesDetails || [];
                    const isPlantation = eventIdx === 0;

                    speciesList.forEach((species, spIdx) => {
                        const isFirstSpecies = spIdx === 0;
                        const globalRowIndex = speciesRowIndex++;

                        const row = [];

                        // Farmer Info (only on first row of record)
                        if (globalRowIndex === 0) {
                            row.push(
                                recIdx + 1,
                                record.centerName || "--NA--",
                                record.program || "--NA--",
                                record.project || "--NA--",
                                record.activity || "--NA--",
                                record.subActivity || "--NA--",
                                record.farmerDetails?.farmerName || "--NA--",
                                record.farmerDetails?.aadharCard ? formatAadhaarNumber(record.farmerDetails.aadharCard) : "--NA--",
                                record.locationDetails?.gatKasara || "--NA--",
                                record.locationDetails?.village || "--NA--",
                                record.locationDetails?.block || "--NA--",
                                record.locationDetails?.district || "--NA--",
                                record.locationDetails?.state || "--NA--",
                                record.locationDetails?.country || "--NA--",
                                record.locationDetails?.latitude || "--NA--",
                                record.locationDetails?.longitude || "--NA--"
                            );
                        } else {
                            row.push(...Array(16).fill("")); // blank for rowspan
                        }

                        // Date (rowspan if multiple species)
                        if (isFirstSpecies) {
                            row.push(moment(event.plantationDate).format("DD/MM/YYYY"));
                        } else {
                            row.push("");
                        }

                        // Species + Data
                        row.push(
                            species.speciesName || "--NA--",
                            isPlantation ? (species.numberOfSaplings || 0) : "",
                            !isPlantation ? (species.numberOfTreesSurvived || 0) : "",
                            species.avgHeight ? parseFloat(species.avgHeight).toFixed(1) : "",
                            species.avgDiameter ? parseFloat(species.avgDiameter).toFixed(1) : "",
                            species.yeild || 0,
                            formatToINR(species.income || 0),
                            // event.sitePhotos?.length > 0 ? "Photo Available" : "",
                            Array.isArray(event.sitePhotos) ? event.sitePhotos.map((p) => p.uri).join(", ") : "--NA--",
                        );

                        rows.push(row);
                    });
                });
            });

            // === TOTAL ROW ===
            const totalPlanted = fullData
                .flatMap(r => r.plantationDetails?.[0]?.speciesDetails || [])
                .reduce((sum, s) => sum + (s.numberOfSaplings || 0), 0);

            const totalSurvived = fullData
                .flatMap(r => r.plantationDetails?.slice(1) || [])
                .flatMap(e => e.speciesDetails || [])
                .reduce((sum, s) => sum + (s.numberOfTreesSurvived || 0), 0);

            rows.push([
                ...Array(16).fill(""),
                "TOTAL", "", totalPlanted, totalSurvived, "", "", "", "", ""
            ]);

            const ws = XLSX.utils.aoa_to_sheet(rows);

            // === MERGES (rowspan & colspan) ===
            const merges = [
                // Main header merge
                { s: { r: 0, c: 16 }, e: { r: 0, c: 24 } },
            ];

            // Add rowspan merges for farmer info
            let currentRow = 2;
            fullData.forEach(record => {
                const totalRows = record.plantationDetails?.reduce((sum, e) => sum + (e.speciesDetails?.length || 1), 0) || 1;
                if (totalRows > 1) {
                    for (let i = 0; i < 16; i++) {
                        merges.push({ s: { r: currentRow, c: i }, e: { r: currentRow + totalRows - 1, c: i } });
                    }
                }
                currentRow += totalRows;
            });

            // Date rowspan
            currentRow = 2;
            fullData.forEach(record => {
                record.plantationDetails?.forEach(event => {
                    const speciesCount = event.speciesDetails?.length || 1;
                    if (speciesCount > 1) {
                        merges.push({ s: { r: currentRow, c: 16 }, e: { r: currentRow + speciesCount - 1, c: 16 } });
                        merges.push({ s: { r: currentRow, c: 24 }, e: { r: currentRow + speciesCount - 1, c: 24 } }); // Photos
                    }
                    currentRow += speciesCount;
                });
            });

            ws["!merges"] = merges;

            // === STYLING ===
            const headerStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "1E6B52" } },
                alignment: { horizontal: "center", vertical: "center", wrapText: true },
                border: { top: "thin", bottom: "thin", left: "thin", right: "thin" }
            };

            const subHeaderStyle = {
                font: { bold: true },
                fill: { fgColor: { rgb: "D9EAD3" } },
                alignment: { horizontal: "center", vertical: "center" }
            };

            const totalStyle = {
                font: { bold: true },
                fill: { fgColor: { rgb: "D9EAD3" } }
            };

            // Apply styles
            for (let c = 0; c < 25; c++) {
                const cell1 = ws[XLSX.utils.encode_cell({ r: 0, c })];
                const cell2 = ws[XLSX.utils.encode_cell({ r: 1, c })];
                if (cell1) cell1.s = headerStyle;
                if (cell2) cell2.s = subHeaderStyle;
            }

            // Total row
            const totalRowIdx = rows.length - 1;
            for (let c = 0; c < 25; c++) {
                const cell = ws[XLSX.utils.encode_cell({ r: totalRowIdx, c })];
                if (cell) cell.s = totalStyle;
            }

            ws["!cols"] = Array(25).fill({ wch: 14 });

            XLSX.utils.book_append_sheet(wb, ws, "Plantation Report");
            XLSX.writeFile(wb, `Plantation_Report_${moment().format("DD-MMM-YYYY")}.xlsx`);

            alert("Excel downloaded successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export Excel");
        } finally {
            setLoading(false);
        }
    };
    // Calculate totals for numeric fields
    const calculateTotals = () => {
        let totalPlantationSaplings = 0;
        let totalPlantationHeight = 0;
        let totalPlantationDiameter = 0;
        let totalPlantationYield = 0;
        let totalPlantationIncome = 0;
        let totalInspectionSurvived = 0;
        let totalInspectionHeight = 0;
        let totalInspectionDiameter = 0;
        let totalInspectionYield = 0;
        let totalInspectionIncome = 0;

        tableData.forEach((value) => {
            const mainDetail = value.plantationDetails?.[0];
            const plantationSpecies = mainDetail?.speciesDetails || [{}];
            const plantationRow = plantationSpecies[0] || {};

            totalPlantationSaplings += Number(plantationRow.numberOfSaplings) || 0;
            totalPlantationHeight += Number(plantationRow.avgHeight) || 0;
            totalPlantationDiameter += Number(plantationRow.avgDiameter) || 0;
            totalPlantationYield += Number(plantationRow.yeild) || 0;
            totalPlantationIncome += Number(plantationRow.income) || 0;

            const inspections = value.plantationDetails.slice(1) || [];
            inspections.forEach((insp) => {
                const species = insp.speciesDetails?.[0] || {};
                totalInspectionSurvived += Number(species.numberOfTreesSurvived) || 0;
                totalInspectionHeight += Number(species.avgHeight) || 0;
                totalInspectionDiameter += Number(species.avgDiameter) || 0;
                totalInspectionYield += Number(species.yeild) || 0;
                totalInspectionIncome += Number(species.income) || 0;
            });
        });

        return {
            totalPlantationSaplings,
            totalPlantationHeight,
            totalPlantationDiameter,
            totalPlantationYield,
            totalPlantationIncome,
            totalInspectionSurvived,
            totalInspectionHeight,
            totalInspectionDiameter,
            totalInspectionYield,
            totalInspectionIncome,
        };
    };

    return (
      <section className="section">
        <div className="container mx-auto transition-all duration-300">
          <style jsx>{`
            .resizing {
              cursor: col-resize !important;
            }
            .resizing th {
              background-color: rgba(59, 130, 246, 0.1);
            }
            .table-container {
              max-height: 500px;
              overflow-y: auto;
              position: relative;
            }
            thead {
              position: sticky;
              top: 0;
              z-index: 10;
            }
            thead.header2 {
              top: ${twoLevelHeader && twoLevelHeader.firstHeaderData.length > 0
                ? "48px"
                : "-4px"};
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
            <div className="uppercase text-xl font-semibold">
              <div className="border-b-2 border-gray-300 flex justify-between">
                <h1 className="heading h-auto content-center">
                  Plantation Report
                </h1>
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
                        className="stdSelectField pl-3 text-left flex justify-between items-center"
                      >
                        {centerName === "all"
                          ? "All"
                          : centerName || "-- Select Center --"}
                        <svg
                          className="w-4 h-4 ml-2"
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
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
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
                  <label htmlFor="district" className="inputLabel">
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
                      className="stdSelectField pl-3 text-left flex justify-between items-center"
                    >
                      {district === "all"
                        ? "All"
                        : district || "-- Select District --"}
                      <svg
                        className="w-4 h-4 ml-2"
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
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                          All
                        </div>
                        {uniqueDistricts.map((d, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setDistrict(d);
                              setDistrictDropdownOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="">
                  <label htmlFor="block" className="inputLabel">
                    Block
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                    <button
                      type="button"
                      onClick={() =>
                        toggleDropdown(setBlockDropdownOpen, blockDropdownOpen)
                      }
                      className="stdSelectField pl-3 text-left flex justify-between items-center"
                    >
                      {block === "all" ? "All" : block || "-- Select Block --"}
                      <svg
                        className="w-4 h-4 ml-2"
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
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                          All
                        </div>
                        {uniqueBlocks.map((b, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setBlock(b);
                              setBlockDropdownOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                          >
                            {b}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="">
                  <label htmlFor="speciesName" className="inputLabel">
                    Species
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                    <button
                      type="button"
                      onClick={() =>
                        toggleDropdown(
                          setSpeciesDropdownOpen,
                          speciesDropdownOpen,
                        )
                      }
                      className="stdSelectField pl-3 text-left flex justify-between items-center"
                    >
                      {speciesName === "all"
                        ? "All"
                        : speciesName || "-- Select Species Name --"}
                      <svg
                        className="w-4 h-4 ml-2"
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
                    {speciesDropdownOpen && (
                      <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                        <div
                          onClick={() => {
                            setSpeciesName("");
                            setSpeciesDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-400"
                        >
                          -- Select Species Name --
                        </div>
                        <div
                          onClick={() => {
                            setSpeciesName("all");
                            setSpeciesDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                          All
                        </div>
                        {speciesData?.map((specie, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setSpeciesName(specie);
                              setSpeciesDropdownOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black"
                          >
                            {specie}
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
                        <label htmlFor="recsPerPage" className="inputLabel">
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
                      <div className="flex-1">
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

                  <div className="table-responsive table-container relative overflow-hidden hover:overflow-auto w-full mt-3">
                    <table className="min-w-full table-fixed border-collapse text-base border-separate w-full leading-tight">
                      <thead className="text-[13px] uppercase bg-white">
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
                            colSpan={9}
                            className="px-2 py-2 border border-grayTwo text-center align-middle"
                          >
                            Plantation / Inspection Details
                          </th>
                        </tr>
                        <tr className="text-left">
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

                      <tbody className="text-[13px] border border-grayTwo">
                        {tableData.map((record, recIdx) => {
                          const events = record.plantationDetails || [];
                          const totalSpeciesRows = events.reduce(
                            (sum, e) => sum + (e.speciesDetails?.length || 1),
                            0,
                          );

                          let speciesRowIndex = 0;

                          return events.map((event, eventIdx) => {
                            const speciesList = event.speciesDetails || [];
                            const isPlantation = eventIdx === 0;

                            return speciesList.map((species, spIdx) => {
                              const isFirstSpeciesInEvent = spIdx === 0;
                              const speciesInEvent = speciesList.length;
                              const globalRowIndex = speciesRowIndex++;

                              return (
                                <tr
                                  key={`${recIdx}-${eventIdx}-${spIdx}`}
                                  className="odd:bg-gray-50 even:bg-white border border-grayTwo"
                                >
                                  {/* Farmer Info - Only on very first row */}
                                  {globalRowIndex === 0 && (
                                    <>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="text-center px-2 py-2 border border-grayTwo"
                                      >
                                        {(pageNumber - 1) * recsPerPage +
                                          recIdx +
                                          1}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.centerName || "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.program || "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo whitespace-normal break-words max-w-xs overflow-hidden"
                                      >
                                        {record?.project || "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo whitespace-normal break-words max-w-xs overflow-hidden"
                                      >
                                        {record?.activity || "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo whitespace-normal break-words max-w-xs overflow-hidden"
                                      >
                                        {record?.subActivity || "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.farmerDetails?.farmerName ||
                                          "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.farmerDetails?.aadharCard
                                          ? formatAadhaarNumber(
                                              record.farmerDetails.aadharCard,
                                            )
                                          : "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.locationDetails?.gatKasara ||
                                          "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.locationDetails?.village ||
                                          "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.locationDetails?.block ||
                                          "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.locationDetails?.district ||
                                          "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.locationDetails?.state ||
                                          "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.locationDetails?.country ||
                                          "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.locationDetails?.latitude ||
                                          "--NA--"}
                                      </td>
                                      <td
                                        rowSpan={totalSpeciesRows}
                                        className="px-2 py-2 border border-grayTwo"
                                      >
                                        {record?.locationDetails?.longitude ||
                                          "--NA--"}
                                      </td>
                                    </>
                                  )}

                                  {/* Date - rowspan if multiple species */}
                                  {isFirstSpeciesInEvent && (
                                    <td
                                      rowSpan={speciesInEvent}
                                      className="text-center px-2 py-2 border border-grayTwo font-medium"
                                    >
                                      {moment(event.plantationDate).format(
                                        "DD/MM/YYYY",
                                      )}
                                    </td>
                                  )}

                                  {/* Species Name */}
                                  <td className="px-2 py-2 border border-grayTwo text-left pl-4">
                                    {species.speciesName || "--NA--"}
                                  </td>

                                  {/* Planted (only for plantation) */}
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {isPlantation
                                      ? formatNumberToCommas(
                                          species.numberOfSaplings || 0,
                                        )
                                      : "-"}
                                  </td>

                                  {/* Survived (only for inspection) */}
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {!isPlantation
                                      ? formatNumberToCommas(
                                          species.numberOfTreesSurvived || 0,
                                        )
                                      : "-"}
                                  </td>

                                  {/* Height & Diameter */}
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {species.avgHeight
                                      ? parseFloat(species.avgHeight).toFixed(1)
                                      : "-"}
                                  </td>
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {species.avgDiameter
                                      ? parseFloat(species.avgDiameter).toFixed(
                                          1,
                                        )
                                      : "-"}
                                  </td>

                                  {/* Yield & Income */}
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {formatNumberToCommas(species.yeild || 0)}
                                  </td>
                                  <td className="px-2 py-2 border border-grayTwo text-right">
                                    {formatToINR(species.income || 0)}
                                  </td>

                                  {/* Photos - rowspan if multiple species */}
                                  {isFirstSpeciesInEvent && (
                                    <td
                                      rowSpan={speciesInEvent}
                                      className="text-center px-2 py-2 border border-grayTwo"
                                    >
                                      {event.sitePhotos?.length > 0 ? (
                                        <Tooltip
                                          content="View Photos"
                                          placement="bottom"
                                        >
                                          <FaImage
                                            className="inline text-gray-600 hover:text-green-600 cursor-pointer"
                                            size={20}
                                            onClick={() => {
                                              setPhotosModal(true);
                                              setSitePhotosIndex(recIdx);
                                              setInspectionPhotoIndex(eventIdx);
                                              setPhotoType(
                                                isPlantation
                                                  ? "plantation"
                                                  : "inspection",
                                              );
                                            }}
                                          />
                                        </Tooltip>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                  )}
                                </tr>
                              );
                            });
                          });
                        })}

                        {/* Total Row */}
                        {tableData.length > 0 && (
                          <tr className="bg-green-50 text-[14px]">
                            <td
                              colSpan={18}
                              className="px-2 py-3 border border-grayTwo text-right"
                            >
                              Total
                            </td>
                            <td className="px-2 py-3 border border-grayTwo text-right">
                              {formatNumberToCommas(
                                tableData
                                  .flatMap(
                                    (r) =>
                                      r.plantationDetails?.[0]
                                        ?.speciesDetails || [],
                                  )
                                  .reduce(
                                    (sum, s) => sum + (s.numberOfSaplings || 0),
                                    0,
                                  ),
                              )}
                            </td>
                            <td className="px-2 py-3 border border-grayTwo text-right">
                              {formatNumberToCommas(
                                tableData
                                  .flatMap(
                                    (r) => r.plantationDetails?.slice(1) || [],
                                  )
                                  .flatMap((e) => e.speciesDetails || [])
                                  .reduce(
                                    (sum, s) =>
                                      sum + (s.numberOfTreesSurvived || 0),
                                    0,
                                  ),
                              )}
                            </td>
                            <td
                              colSpan={5}
                              className="px-2 py-3 border border-grayTwo text-center"
                            >
                              -
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
                            <div className="grid grid-cols-3 justify-center mx-auto h-auto content-center mt-5 px-2 gap-3">
                              {tableData[sitePhotosIndex]?.plantationDetails[0]
                                ?.sitePhotos.length > 0
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
                                              `plantation-site-photo-${k}.jpg`,
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
                                  )
                                : "No record found!"}
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 justify-center mx-auto h-auto content-center mt-5 px-2 gap-3">
                              {tableData[
                                sitePhotosIndex
                              ]?.plantationDetails.slice(1)?.[
                                inspectionPhotoIndex
                              ]?.sitePhotos.length > 0
                                ? tableData[sitePhotosIndex]?.plantationDetails
                                    .slice(1)
                                    ?.[
                                      inspectionPhotoIndex
                                    ]?.sitePhotos?.map((photo, k) => (
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
                                              `inspection-site-photo-${inspectionPhotoIndex}-${k}.jpg`,
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
                                    ))
                                : "No record found!"}
                            </div>
                          )}
                        </div>
                      </Modal.Body>
                    </Modal>

                    <div className="flex justify-center my-5 overflow-x-auto">
                      <nav
                        aria-label="Page navigation flex"
                        className="min-w-max"
                      >
                        {numOfPages.length > 1 && totalRecs > recsPerPage ? (
                          <ul className="pagination mx-auto flex justify-center items-center gap-1 mb-4 whitespace-nowrap">
                            {pageNumber !== 1 ? (
                              <li
                                className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
                                onClick={() => setPageNumber(--pageNumber)}
                              >
                                <a className="page-link">
                                  <FontAwesomeIcon icon={faAngleLeft} />
                                </a>
                              </li>
                            ) : null}
                            {numOfPages.map((item, i) => (
                              <li
                                key={i}
                                className={
                                  "page-item hover px-3 border border-gray-400 cursor-pointer text-center border-e-0 font-semibold " +
                                  (pageNumber === item ? " active" : "")
                                }
                                onClick={() => handlePageClick(item)}
                              >
                                <a className="page-link">{item}</a>
                              </li>
                            ))}
                            {pageNumber !== numOfPages.length &&
                            numOfPages.length > 0 ? (
                              <li
                                className="page-item hover px-3 border border-gray-400 cursor-pointer"
                                onClick={() => setPageNumber(++pageNumber)}
                              >
                                <a className="page-link">
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











// original code
// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { useRouter } from "next/navigation";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import moment from "moment";
// import { MdFileDownload } from "react-icons/md";
// import {
//   FaFileDownload,
//   FaFileUpload,
//   FaImage,
//   FaSpinner,
//   FaWpforms,
// } from "react-icons/fa";
// import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
// import { usePathname } from "next/navigation";
// import ls from "localstorage-slim";
// import { FaSearch } from "react-icons/fa";
// import { Modal, Tooltip } from "flowbite-react";
// import * as XLSX from "sheetjs-style";

// function PlantationReport() {
//   const pathname = usePathname();
//   const [loggedInRole, setLoggedInRole] = useState("");
//   const [userDetails, setUserDetails] = useState(
//     ls.get("userDetails", { decrypt: true })
//   );
//   const SPECIES_NAMES = process.env.SPECIES_NAMES;
//   const speciesArray = SPECIES_NAMES?.split(",")?.map((event) => event?.trim());
//   const [speciesData, setSpeciesData] = useState(speciesArray);

//   const [centerName, setCenterName] = useState("all");
//   const [center_id, setCenter_id] = useState("all");
//   const [fromDate, setFromDate] = useState("all");
//   const [toDate, setToDate] = useState("all");
//   const [district, setDistrict] = useState("all");
//   const [block, setBlock] = useState("all");
//   const [speciesName, setSpeciesName] = useState("all");
//   const [centerNameList, setCenterNameList] = useState([]);
//   const [sitePhotosIndex, setSitePhotosIndex] = useState("");
//   const [photoType, setPhotoType] = useState("");
//   const [inspectionPhotoIndex, setInspectionPhotoIndex] = useState("");
//   const [uniqueDistricts, setUniqueDistricts] = useState([]);
//   const [uniqueBlocks, setUniqueBlocks] = useState([]);
//   const [filterData, setFilterData] = useState([]);

//   let [recsPerPage, setRecsPerPage] = useState(10);
//   let [numOfPages, setNumOfPages] = useState([1]);
//   let [pageNumber, setPageNumber] = useState(1);
//   let [runCount, setRunCount] = useState(0);
//   const [tableData, setTableData] = useState([]);
//   const [searchText, setSearchText] = useState("-");
//   const [totalRecs, setTotalRecs] = useState("-");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [photosModal, setPhotosModal] = useState(false);
//   const router = useRouter();

//   const twoLevelHeader = {
//     apply: true,
//     firstHeaderData: [
//       {
//         heading: "-",
//         mergedColoums: 16,
//         hide: true,
//       },
//       {
//         heading: "Plantation Details",
//         mergedColoums: 8,
//         hide: false,
//       },
//       {
//         heading: "Inspection Details",
//         mergedColoums: 8,
//         hide: false,
//       },
//     ],
//   };

//   const tableHeading = {
//     centerName: "Center Name",
//     program: "Program",
//     project: "Project",
//     activity: "Activity",
//     subActivity: "Subactivity",
//     "farmerDetails.farmerName": "Farmer Name",
//     "farmerDetails.aadharCard": "Aadhaar Card No",
//     "locationDetails.gatKasara": "Gat/Kasara No",
//     "locationDetails.village": "Village",
//     "locationDetails.block": "Block",
//     "locationDetails.district": "District",
//     "locationDetails.state": "State",
//     "locationDetails.country": "Country",
//     "locationDetails.latitude": "Latitude",
//     "locationDetails.longitude": "Longitude",
//     "plantationDetails[0].plantationDate": "Plantation Date",
//     "plantationDetails[0].speciesDetails[0].speciesName": "Plantation Species Name",
//     "plantationDetails[0].speciesDetails[0].numberOfSaplings": "Planted Sapling No (Nos)",
//     "plantationDetails[0].speciesDetails[0].avgHeight": "Avg. Height (ft)",
//     "plantationDetails[0].speciesDetails[0].avgDiameter": "Avg. Diameter (inch)",
//     "plantationDetails[0].speciesDetails[0].yeild": "Yield (kg)",
//     "plantationDetails[0].speciesDetails[0].income": "Income (Rs.)",
//   };

//   const getNestedValue = (obj, path) => {
//     return path.split(/[.[\]]+/).reduce((acc, part) => {
//       if (part && acc) return acc[part];
//       return undefined;
//     }, obj);
//   };

//   const exportToExcel = () => {
//     const workbook = XLSX.utils.book_new();
//     const worksheetData = [Object.values(tableHeading)];
//     const formvalues = { ...filterData };

//     axios({
//       method: "post",
//       url: "/api/reports/post/plantation-report",
//       data: formvalues,
//     })
//       .then((response) => {
//         const downloadData = response.data.tableData;

//         downloadData.forEach((row) => {
//           const rowData = Object.keys(tableHeading).map((key) =>
//             getNestedValue(row, key)
//           );
//           worksheetData.push(rowData);
//         });

//         const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
//         XLSX.utils.book_append_sheet(workbook, worksheet, "Plantation Report");
//         XLSX.writeFile(workbook, "plantation-report.xlsx");
//       })
//       .catch((error) => {
//         console.log("Error Message => ", error);
//         Swal.fire(" ", "Something went wrong");
//       });
//   };

//   const getCurrentDate = () => {
//     return moment().format("YYYY-MM-DD");
//   };

//   useEffect(() => {
//     getCenterNameList();

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
//     setFromDate(startDate);
//     setToDate(endDate);
//   }, []);

//   const getCurrentFinancialYearRange = () => {
//     const today = new Date();

//     let financialYearStart = new Date(today.getFullYear(), 3, 1);
//     let financialYearEnd = new Date(today.getFullYear() + 1, 2, 31);

//     if (today < financialYearStart) {
//       financialYearStart = new Date(today.getFullYear() - 1, 3, 1);
//       financialYearEnd = new Date(today.getFullYear(), 2, 31);
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

//   const getData = async () => {
//     const formValues = {
//       searchText: searchText,
//       center_ID: center_id,
//       centerName: centerName,
//       district: district,
//       block: block,
//       speciesName: speciesName,
//       fromDate: moment(fromDate).format("YYYY/MM/DD"),
//       toDate: moment(toDate).format("YYYY/MM/DD"),
//       recsPerPage: recsPerPage,
//       pageNumber: pageNumber,
//     };
//     setFilterData(formValues);
//     try {
//       const response = await axios.post(
//         "/api/reports/post/plantation-report",
//         formValues
//       );

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

//   useEffect(() => {
//     getData();
//   }, [
//     centerName,
//     district,
//     block,
//     speciesName,
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
//         setNumOfPages([...new Set(pages)]);
//       }
//     }
//   }, [totalRecs, recsPerPage, pageNumber]);

//   const handlePageClick = (page) => {
//     if (page === "...") return;
//     setPageNumber(page);
//   };

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

//   const formatToINR = (num) => {
//     const validNum = isNaN(num) || num === null || num === undefined ? 0 : num;

//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     })
//       .format(validNum)
//       .replace(/^(\D+)/, "$1 ");
//   };

//   const formatNumberToCommas = (num) => {
//     return num ? new Intl.NumberFormat("en-IN").format(num) : 0;
//   };

//   function formatAadhaarNumber(aadhaar) {
//     return aadhaar.replace(/(.{4})/g, "$1 ");
//   }

//   const getCenterData = (center_id) => {
//     axios
//       .get("/api/centers/get/one/" + center_id)
//       .then((response) => {
//         const uniqueDistricts = [
//           ...new Set(
//             response.data[0].villagesCovered.map((item) => item.district)
//           ),
//         ];
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

//   const handleDownload = async (url, filename) => {
//     try {
//       axios
//         .get(url, { responseType: "blob" })
//         .then((response) => {
//           const imageBlob = response.data;
//           const imageUrl = URL.createObjectURL(imageBlob);

//           const imgElement = document.getElementById("imageDisplay");
//           if (imgElement) {
//             imgElement.src = imageUrl;
//           } else {
//             console.error("Element with id 'imageDisplay' not found");
//           }
//           const a = document.createElement("a");
//           a.href = imageUrl;
//           a.download = filename || "downloaded-image.jpg";
//           document.body.appendChild(a);
//           a.click();
//           document.body.removeChild(a);
//         })
//         .catch((error) => console.error("CORS Error:", error));
//     } catch (error) {
//       console.error("Download failed:", error);
//     }
//   };

//   const downloadExcel = async () => {
//     try {
//       setLoading(true);
//       const formvalues = { ...filterData, removePagination: true };
//       const response = await axios.post("/api/reports/post/plantation-report", formvalues);
//       const fullData = response.data.tableData;

//       if (!fullData || fullData.length === 0) {
//         alert("No data to export!");
//         return;
//       }

//       const wb = XLSX.utils.book_new();

//       // === HEADER ROWS ===
//       const headerRow1 = [
//         "Sr.", "Center Name", "Program", "Project", "Activity", "Subactivity",
//         "Farmer Name", "Aadhaar Card No", "Gat/Kasara No", "Village", "Block",
//         "District", "State", "Country", "Latitude", "Longitude",
//         "PLANTATION / INSPECTION DETAILS"
//       ];

//       const headerRow2 = [
//         "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
//         "Date", "Species", "Planted", "Survived", "Avg. Ht (ft)", "Avg. Dia (in)", "Yield (kg)", "Income (₹)", "Photos"
//       ];

//       const rows = [headerRow1, headerRow2];

//       // === DATA ROWS ===
//       fullData.forEach((record, recIdx) => {
//         const events = record.plantationDetails || [];
//         const totalSpeciesRows = events.reduce((sum, e) => sum + (e.speciesDetails?.length || 1), 0);

//         let speciesRowIndex = 0;

//         events.forEach((event, eventIdx) => {
//           const speciesList = event.speciesDetails || [];
//           const isPlantation = eventIdx === 0;

//           speciesList.forEach((species, spIdx) => {
//             const isFirstSpecies = spIdx === 0;
//             const globalRowIndex = speciesRowIndex++;

//             const row = [];

//             // Farmer Info (only on first row of record)
//             if (globalRowIndex === 0) {
//               row.push(
//                 recIdx + 1,
//                 record.centerName || "--NA--",
//                 record.program || "--NA--",
//                 record.project || "--NA--",
//                 record.activity || "--NA--",
//                 record.subActivity || "--NA--",
//                 record.farmerDetails?.farmerName || "--NA--",
//                 record.farmerDetails?.aadharCard ? formatAadhaarNumber(record.farmerDetails.aadharCard) : "--NA--",
//                 record.locationDetails?.gatKasara || "--NA--",
//                 record.locationDetails?.village || "--NA--",
//                 record.locationDetails?.block || "--NA--",
//                 record.locationDetails?.district || "--NA--",
//                 record.locationDetails?.state || "--NA--",
//                 record.locationDetails?.country || "--NA--",
//                 record.locationDetails?.latitude || "--NA--",
//                 record.locationDetails?.longitude || "--NA--"
//               );
//             } else {
//               row.push(...Array(16).fill("")); // blank for rowspan
//             }

//             // Date (rowspan if multiple species)
//             if (isFirstSpecies) {
//               row.push(moment(event.plantationDate).format("DD/MM/YYYY"));
//             } else {
//               row.push("");
//             }

//             // Species + Data
//             row.push(
//               species.speciesName || "--NA--",
//               isPlantation ? (species.numberOfSaplings || 0) : "",
//               !isPlantation ? (species.numberOfTreesSurvived || 0) : "",
//               species.avgHeight ? parseFloat(species.avgHeight).toFixed(1) : "",
//               species.avgDiameter ? parseFloat(species.avgDiameter).toFixed(1) : "",
//               species.yeild || 0,
//               formatToINR(species.income || 0),
//               // event.sitePhotos?.length > 0 ? "Photo Available" : "",
//               Array.isArray(event.sitePhotos) ? event.sitePhotos.map((p) => p.uri).join(", ") : "--NA--",
//             );

//             rows.push(row);
//           });
//         });
//       });

//       // === TOTAL ROW ===
//       const totalPlanted = fullData
//         .flatMap(r => r.plantationDetails?.[0]?.speciesDetails || [])
//         .reduce((sum, s) => sum + (s.numberOfSaplings || 0), 0);

//       const totalSurvived = fullData
//         .flatMap(r => r.plantationDetails?.slice(1) || [])
//         .flatMap(e => e.speciesDetails || [])
//         .reduce((sum, s) => sum + (s.numberOfTreesSurvived || 0), 0);

//       rows.push([
//         ...Array(16).fill(""),
//         "TOTAL", "", totalPlanted, totalSurvived, "", "", "", "", ""
//       ]);

//       const ws = XLSX.utils.aoa_to_sheet(rows);

//       // === MERGES (rowspan & colspan) ===
//       const merges = [
//         // Main header merge
//         { s: { r: 0, c: 16 }, e: { r: 0, c: 24 } },
//       ];

//       // Add rowspan merges for farmer info
//       let currentRow = 2;
//       fullData.forEach(record => {
//         const totalRows = record.plantationDetails?.reduce((sum, e) => sum + (e.speciesDetails?.length || 1), 0) || 1;
//         if (totalRows > 1) {
//           for (let i = 0; i < 16; i++) {
//             merges.push({ s: { r: currentRow, c: i }, e: { r: currentRow + totalRows - 1, c: i } });
//           }
//         }
//         currentRow += totalRows;
//       });

//       // Date rowspan
//       currentRow = 2;
//       fullData.forEach(record => {
//         record.plantationDetails?.forEach(event => {
//           const speciesCount = event.speciesDetails?.length || 1;
//           if (speciesCount > 1) {
//             merges.push({ s: { r: currentRow, c: 16 }, e: { r: currentRow + speciesCount - 1, c: 16 } });
//             merges.push({ s: { r: currentRow, c: 24 }, e: { r: currentRow + speciesCount - 1, c: 24 } }); // Photos
//           }
//           currentRow += speciesCount;
//         });
//       });

//       ws["!merges"] = merges;

//       // === STYLING ===
//       const headerStyle = {
//         font: { bold: true, color: { rgb: "FFFFFF" } },
//         fill: { fgColor: { rgb: "1E6B52" } },
//         alignment: { horizontal: "center", vertical: "center", wrapText: true },
//         border: { top: "thin", bottom: "thin", left: "thin", right: "thin" }
//       };

//       const subHeaderStyle = {
//         font: { bold: true },
//         fill: { fgColor: { rgb: "D9EAD3" } },
//         alignment: { horizontal: "center", vertical: "center" }
//       };

//       const totalStyle = {
//         font: { bold: true },
//         fill: { fgColor: { rgb: "D9EAD3" } }
//       };

//       // Apply styles
//       for (let c = 0; c < 25; c++) {
//         const cell1 = ws[XLSX.utils.encode_cell({ r: 0, c })];
//         const cell2 = ws[XLSX.utils.encode_cell({ r: 1, c })];
//         if (cell1) cell1.s = headerStyle;
//         if (cell2) cell2.s = subHeaderStyle;
//       }

//       // Total row
//       const totalRowIdx = rows.length - 1;
//       for (let c = 0; c < 25; c++) {
//         const cell = ws[XLSX.utils.encode_cell({ r: totalRowIdx, c })];
//         if (cell) cell.s = totalStyle;
//       }

//       ws["!cols"] = Array(25).fill({ wch: 14 });

//       XLSX.utils.book_append_sheet(wb, ws, "Plantation Report");
//       XLSX.writeFile(wb, `Plantation_Report_${moment().format("DD-MMM-YYYY")}.xlsx`);

//       alert("Excel downloaded successfully!");
//     } catch (error) {
//       console.error("Export failed:", error);
//       alert("Failed to export Excel");
//     } finally {
//       setLoading(false);
//     }
//   };
//   // Calculate totals for numeric fields
//   const calculateTotals = () => {
//     let totalPlantationSaplings = 0;
//     let totalPlantationHeight = 0;
//     let totalPlantationDiameter = 0;
//     let totalPlantationYield = 0;
//     let totalPlantationIncome = 0;
//     let totalInspectionSurvived = 0;
//     let totalInspectionHeight = 0;
//     let totalInspectionDiameter = 0;
//     let totalInspectionYield = 0;
//     let totalInspectionIncome = 0;

//     tableData.forEach((value) => {
//       const mainDetail = value.plantationDetails?.[0];
//       const plantationSpecies = mainDetail?.speciesDetails || [{}];
//       const plantationRow = plantationSpecies[0] || {};

//       totalPlantationSaplings += Number(plantationRow.numberOfSaplings) || 0;
//       totalPlantationHeight += Number(plantationRow.avgHeight) || 0;
//       totalPlantationDiameter += Number(plantationRow.avgDiameter) || 0;
//       totalPlantationYield += Number(plantationRow.yeild) || 0;
//       totalPlantationIncome += Number(plantationRow.income) || 0;

//       const inspections = value.plantationDetails.slice(1) || [];
//       inspections.forEach((insp) => {
//         const species = insp.speciesDetails?.[0] || {};
//         totalInspectionSurvived += Number(species.numberOfTreesSurvived) || 0;
//         totalInspectionHeight += Number(species.avgHeight) || 0;
//         totalInspectionDiameter += Number(species.avgDiameter) || 0;
//         totalInspectionYield += Number(species.yeild) || 0;
//         totalInspectionIncome += Number(species.income) || 0;
//       });
//     });

//     return {
//       totalPlantationSaplings,
//       totalPlantationHeight,
//       totalPlantationDiameter,
//       totalPlantationYield,
//       totalPlantationIncome,
//       totalInspectionSurvived,
//       totalInspectionHeight,
//       totalInspectionDiameter,
//       totalInspectionYield,
//       totalInspectionIncome,
//     };
//   };

//   return (
//     <section className="section">
//       <div className="container mx-auto transition-all duration-300">
//         <style jsx>{`
//           .resizing {
//             cursor: col-resize !important;
//           }
//           .resizing th {
//             background-color: rgba(59, 130, 246, 0.1);
//           }
//           .table-container {
//             max-height: 500px;
//             overflow-y: auto;
//             position: relative;
//           }
//           thead {
//             position: sticky;
//             top: 0;
//             z-index: 10;
//           }
//           thead.header2 {
//             top: ${twoLevelHeader && twoLevelHeader.firstHeaderData.length > 0 ? '48px' : '-4px'};
//             z-index: 9;
//           }
//           table {
//             width: 100%;
//             table-layout: auto;
//           }
//           th, td {
//             box-sizing: border-box;
//           }
//         `}</style>
//         <div className="box border-2 rounded-md shadow-md">
//           <div className="uppercase text-xl font-semibold">
//             <div className="border-b-2 border-gray-300 flex justify-between">
//               <h1 className="heading h-auto content-center">Plantation Report</h1>
//             </div>
//           </div>

//           <div className="px-10">
//             <div className="mt-4 mb-0 lg:mb-5 w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
//               {loggedInRole === "admin" || loggedInRole === "executive" ? (
//                 <div className="">
//                   <label htmlFor="centerName" className="inputLabel">
//                     Center
//                   </label>
//                   <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                     <select
//                       name="centerName"
//                       id="centerName"
//                       className="stdSelectField pl-3"
//                       value={center_id ? `${center_id}|${centerName}` : ""}
//                       onChange={(e) => {
//                         const [center_id, centerName] = e.target.value.split("|");
//                         setCenterName(centerName ? centerName : "all");
//                         setCenter_id(center_id ? center_id : "all");
//                       }}
//                     >
//                       <option value="" disabled className="text-gray-400">
//                         -- Select Center --
//                       </option>
//                       <option value="all">All</option>
//                       {centerNameList?.map((center, i) => (
//                         <option
//                           className="text-black"
//                           key={i}
//                           value={`${center?._id}|${center?.centerName}`}
//                         >
//                           {center?.centerName}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               ) : null}
//               <div className="">
//                 <label htmlFor="program" className="inputLabel">
//                   District
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                   <select
//                     name="program"
//                     id="program"
//                     className="stdSelectField pl-3"
//                     value={district}
//                     onChange={(e) => {
//                       setDistrict(e.target.value);
//                     }}
//                   >
//                     <option value="" disabled className="text-gray-400">
//                       -- Select District --
//                     </option>
//                     <option value="all">All</option>
//                     {uniqueDistricts.map((district, i) => (
//                       <option className="text-black" key={i} value={district}>
//                         {district}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="">
//                 <label htmlFor="project" className="inputLabel">
//                   Block
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                   <select
//                     name="project"
//                     id="project"
//                     className="stdSelectField pl-3"
//                     value={block}
//                     onChange={(e) => {
//                       setBlock(e.target.value);
//                     }}
//                   >
//                     <option value="" disabled className="text-gray-400">
//                       -- Select Block --
//                     </option>
//                     <option value="all">All</option>
//                     {uniqueBlocks.map((block, i) => (
//                       <option className="text-black" key={i} value={block}>
//                         {block}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="">
//                 <label htmlFor="speciesName" className="inputLabel">
//                   Species
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
//                   <select
//                     name="speciesName"
//                     id="speciesName"
//                     className="stdSelectField pl-3"
//                     value={speciesName}
//                     onChange={(e) => {
//                       setSpeciesName(e.target.value);
//                     }}
//                   >
//                     <option value="" disabled className="text-gray-400">
//                       -- Select Species Name --
//                     </option>
//                     <option value="all">All</option>
//                     {speciesData?.map((specie, i) => (
//                       <option className="text-black" key={i} value={specie}>
//                         {specie}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="">
//                 <label htmlFor="fromDate" className="inputLabel">
//                   From Date
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <input
//                     type="date"
//                     name="fromDate"
//                     id="fromDate"
//                     className="stdInputField pl-3"
//                     value={fromDate}
//                     onChange={(e) => {
//                       setFromDate(e.target.value);
//                     }}
//                   />
//                 </div>
//               </div>
//               <div className="">
//                 <label htmlFor="toDate" className="inputLabel">
//                   To Date
//                 </label>
//                 <div className="relative mt-2 rounded-md shadow-sm">
//                   <input
//                     type="date"
//                     name="toDate"
//                     id="toDate"
//                     className="stdInputField pl-3"
//                     value={toDate}
//                     onChange={(e) => {
//                       setToDate(e.target.value);
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>

//             <section className="mt-5 pt-5 w-full">
//               <div className="">
//                 <div className="flex lg:flex-row md:flex-col flex-col mt-2 justify-between w-full">
//                   <div className="text-[13px]">
//                     <div className="">
//                       <label htmlFor="recsPerPage" className="inputLabel">
//                         Records per Page
//                       </label>
//                       <div className="relative mt-2 rounded-md text-gray-500 w-full">
//                         <select
//                           className="stdSelectField pl-3 w-3/4"
//                           onChange={(event) => {
//                             setRecsPerPage(event.target.value);
//                             setPageNumber(1);
//                           }}
//                         >
//                           <option value={10} className="font-normal">10</option>
//                           <option value={50} className="font-normal">50</option>
//                           <option value={100} className="font-normal">100</option>
//                           <option value={500} className="font-normal">500</option>
//                           <option value={1000} className="font-normal">1000</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex text-[13px] lg:-mt-1 mt-5 pl-5 w-1/2 justify-between">
//                     <div className="w-full">
//                       <label htmlFor="search" className="inputLabel">
//                         Search
//                       </label>
//                       <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
//                         <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//                           <span className="pr-2 border-r-2">
//                             <FaSearch className="icon" />
//                           </span>
//                         </div>
//                         <input
//                           type="text"
//                           className="stdInputField"
//                           placeholder="Search"
//                           name="search"
//                           onChange={(event) => {
//                             setSearchText(event.target.value);
//                           }}
//                         />
//                       </div>
//                     </div>

//                     <div className="mt-7 ml-4">
//                       <Tooltip
//                         content="Download as Excel"
//                         placement="top"
//                         className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
//                         arrow={false}
//                       >
//                         <FaFileDownload
//                           onClick={downloadExcel}
//                           size={"2rem"}
//                           className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
//                         />
//                       </Tooltip>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="table-responsive table-container relative overflow-hidden hover:overflow-auto w-full mt-3">
              

//                   <table className="min-w-full table-fixed border-collapse text-base border-separate w-full leading-tight">
//                     <thead className="text-[13px] uppercase bg-white">
//                       <tr>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Sr. No</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Center Name</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Program</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Project</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Activity</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Subactivity</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Farmer Name</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Aadhaar Card No</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Gat/Kasara No</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Village</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Block</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">District</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">State</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Country</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Latitude</th>
//                         <th rowSpan={2} className="px-2 py-2 border border-grayTwo text-center align-middle">Longitude</th>
//                         <th colSpan={9} className="px-2 py-2 border border-grayTwo text-center align-middle">
//                           Plantation / Inspection Details
//                         </th>
//                       </tr>
//                       <tr className="text-left">
//                         <th className="px-2 py-2 border border-grayTwo text-center align-middle">Date</th>
//                         <th className="px-2 py-2 border border-grayTwo text-center align-middle">Species Name</th>
//                         <th className="px-2 py-2 border border-grayTwo text-center align-middle">Planted Sapling No (Nos)</th>
//                         <th className="px-2 py-2 border border-grayTwo text-center align-middle">Survived Sapling No (Nos)</th>
//                         <th className="px-2 py-2 border border-grayTwo text-center align-middle">Avg. Height (ft)</th>
//                         <th className="px-2 py-2 border border-grayTwo text-center align-middle">Avg. Diameter (inch)</th>
//                         <th className="px-2 py-2 border border-grayTwo text-center align-middle">Yield (kg)</th>
//                         <th className="px-2 py-2 border border-grayTwo text-center align-middle">Income (Rs.)</th>
//                         <th className="px-2 py-2 border border-grayTwo text-center align-middle">Site Photos</th>
//                       </tr>
//                     </thead>

//                     <tbody className="text-[13px] border border-grayTwo">
//                       {tableData.map((record, recIdx) => {
//                         const events = record.plantationDetails || [];
//                         const totalSpeciesRows = events.reduce((sum, e) => sum + (e.speciesDetails?.length || 1), 0);

//                         let speciesRowIndex = 0;

//                         return events.map((event, eventIdx) => {
//                           const speciesList = event.speciesDetails || [];
//                           const isPlantation = eventIdx === 0;

//                           return speciesList.map((species, spIdx) => {
//                             const isFirstSpeciesInEvent = spIdx === 0;
//                             const speciesInEvent = speciesList.length;
//                             const globalRowIndex = speciesRowIndex++;

//                             return (
//                               <tr
//                                 key={`${recIdx}-${eventIdx}-${spIdx}`}
//                                 className="odd:bg-gray-50 even:bg-white border border-grayTwo"
//                               >
//                                 {/* Farmer Info - Only on very first row */}
//                                 {globalRowIndex === 0 && (
//                                   <>
//                                     <td rowSpan={totalSpeciesRows} className="text-center px-2 py-2 border border-grayTwo">
//                                       {(pageNumber - 1) * recsPerPage + recIdx + 1}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.centerName || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.program || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo whitespace-normal break-words max-w-xs overflow-hidden">
//                                       {record?.project || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo whitespace-normal break-words max-w-xs overflow-hidden">
//                                       {record?.activity || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo whitespace-normal break-words max-w-xs overflow-hidden">
//                                       {record?.subActivity || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.farmerDetails?.farmerName || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.farmerDetails?.aadharCard
//                                         ? formatAadhaarNumber(record.farmerDetails.aadharCard)
//                                         : "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.locationDetails?.gatKasara || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.locationDetails?.village || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.locationDetails?.block || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.locationDetails?.district || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.locationDetails?.state || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.locationDetails?.country || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.locationDetails?.latitude || "--NA--"}
//                                     </td>
//                                     <td rowSpan={totalSpeciesRows} className="px-2 py-2 border border-grayTwo">
//                                       {record?.locationDetails?.longitude || "--NA--"}
//                                     </td>
//                                   </>
//                                 )}

//                                 {/* Date - rowspan if multiple species */}
//                                 {isFirstSpeciesInEvent && (
//                                   <td rowSpan={speciesInEvent} className="text-center px-2 py-2 border border-grayTwo font-medium">
//                                     {moment(event.plantationDate).format("DD/MM/YYYY")}
//                                   </td>
//                                 )}

//                                 {/* Species Name */}
//                                 <td className="px-2 py-2 border border-grayTwo text-left pl-4">
//                                   {species.speciesName || "--NA--"}
//                                 </td>

//                                 {/* Planted (only for plantation) */}
//                                 <td className="px-2 py-2 border border-grayTwo text-right">
//                                   {isPlantation ? formatNumberToCommas(species.numberOfSaplings || 0) : "-"}
//                                 </td>

//                                 {/* Survived (only for inspection) */}
//                                 <td className="px-2 py-2 border border-grayTwo text-right">
//                                   {!isPlantation ? formatNumberToCommas(species.numberOfTreesSurvived || 0) : "-"}
//                                 </td>

//                                 {/* Height & Diameter */}
//                                 <td className="px-2 py-2 border border-grayTwo text-right">
//                                   {species.avgHeight ? parseFloat(species.avgHeight).toFixed(1) : "-"}
//                                 </td>
//                                 <td className="px-2 py-2 border border-grayTwo text-right">
//                                   {species.avgDiameter ? parseFloat(species.avgDiameter).toFixed(1) : "-"}
//                                 </td>

//                                 {/* Yield & Income */}
//                                 <td className="px-2 py-2 border border-grayTwo text-right">
//                                   {formatNumberToCommas(species.yeild || 0)}
//                                 </td>
//                                 <td className="px-2 py-2 border border-grayTwo text-right">
//                                   {formatToINR(species.income || 0)}
//                                 </td>

//                                 {/* Photos - rowspan if multiple species */}
//                                 {isFirstSpeciesInEvent && (
//                                   <td rowSpan={speciesInEvent} className="text-center px-2 py-2 border border-grayTwo">
//                                     {event.sitePhotos?.length > 0 ? (
//                                       <Tooltip content="View Photos" placement="bottom">
//                                         <FaImage
//                                           className="inline text-gray-600 hover:text-green-600 cursor-pointer"
//                                           size={20}
//                                           onClick={() => {
//                                             setPhotosModal(true);
//                                             setSitePhotosIndex(recIdx);
//                                             setInspectionPhotoIndex(eventIdx);
//                                             setPhotoType(isPlantation ? "plantation" : "inspection");
//                                           }}
//                                         />
//                                       </Tooltip>
//                                     ) : "-"}
//                                   </td>
//                                 )}
//                               </tr>
//                             );
//                           });
//                         });
//                       })}

//                       {/* Total Row */}
//                       {tableData.length > 0 && (
//                         <tr className="bg-green-50 text-[14px]">
//                           <td colSpan={18} className="px-2 py-3 border border-grayTwo text-right">Total</td>
//                           <td className="px-2 py-3 border border-grayTwo text-right">
//                             {formatNumberToCommas(
//                               tableData.flatMap(r => r.plantationDetails?.[0]?.speciesDetails || [])
//                                 .reduce((sum, s) => sum + (s.numberOfSaplings || 0), 0)
//                             )}
//                           </td>
//                           <td className="px-2 py-3 border border-grayTwo text-right">
//                             {formatNumberToCommas(
//                               tableData.flatMap(r => r.plantationDetails?.slice(1) || [])
//                                 .flatMap(e => e.speciesDetails || [])
//                                 .reduce((sum, s) => sum + (s.numberOfTreesSurvived || 0), 0)
//                             )}
//                           </td>
//                           <td colSpan={5} className="px-2 py-3 border border-grayTwo text-center">-</td>
//                         </tr>
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
//                         ></div>
//                       </div>
//                     </Modal.Header>
//                     <Modal.Body className="bg-white">
//                       <div>
//                         {photoType === "plantation" ? (
//                           <div className="grid grid-cols-3 justify-center mx-auto h-auto content-center mt-5 px-2 gap-3">
//                             {tableData[sitePhotosIndex]?.plantationDetails[0]?.sitePhotos.length > 0
//                               ? tableData[sitePhotosIndex]?.plantationDetails[0].sitePhotos.map((photo, k) => (
//                                   <div
//                                     key={k}
//                                     className="flex flex-col items-center justify-center w-full h-auto mt-5 gap-3 mx-3"
//                                   >
//                                     <img
//                                       key={k}
//                                       id="imageDisplay"
//                                       src={photo.uri}
//                                       alt="Plantation Site Photo"
//                                       width={150}
//                                       height={150}
//                                       className="cursor-pointer hover:opacity-70 rounded-lg h-60 w-60"
//                                       onClick={() =>
//                                         handleDownload(
//                                           photo.uri,
//                                           `plantation-site-photo-${k}.jpg`
//                                         )
//                                       }
//                                     />
//                                     <Tooltip
//                                       content="Click here to Download"
//                                       placement="top"
//                                       className="bg-green dark:bg-green"
//                                       arrow={false}
//                                     >
//                                       <div className="bg-white cursor-pointer mx-auto hover:bg-green text-green hover:text-white font-bold py-2 px-2 rounded border-2 border-green">
//                                         <a
//                                           href={photo.uri}
//                                           target="_blank"
//                                           download
//                                           className=""
//                                         >
//                                           <MdFileDownload size={20} />
//                                         </a>
//                                       </div>
//                                     </Tooltip>
//                                   </div>
//                                 ))
//                               : "No record found!"}
//                           </div>
//                         ) : (
//                           <div className="grid grid-cols-3 justify-center mx-auto h-auto content-center mt-5 px-2 gap-3">
//                             {tableData[sitePhotosIndex]?.plantationDetails.slice(1)?.[inspectionPhotoIndex]?.sitePhotos.length > 0
//                               ? tableData[sitePhotosIndex]?.plantationDetails.slice(1)?.[inspectionPhotoIndex]?.sitePhotos?.map((photo, k) => (
//                                   <div
//                                     key={k}
//                                     className="flex flex-col items-center justify-center w-full h-auto mt-5 gap-3 mx-3"
//                                   >
//                                     <img
//                                       key={k}
//                                       id="imageDisplay"
//                                       src={photo.uri}
//                                       alt="Inspection Site Photo"
//                                       width={150}
//                                       height={150}
//                                       className="cursor-pointer hover:opacity-70 rounded-lg h-60 w-60"
//                                       onClick={() =>
//                                         handleDownload(
//                                           photo.uri,
//                                           `inspection-site-photo-${inspectionPhotoIndex}-${k}.jpg`
//                                         )
//                                       }
//                                     />
//                                     <Tooltip
//                                       content="Click here to Download"
//                                       placement="top"
//                                       className="bg-green dark:bg-green"
//                                       arrow={false}
//                                     >
//                                       <div className="bg-white cursor-pointer mx-auto hover:bg-green text-green hover:text-white font-bold py-2 px-2 rounded border-2 border-green">
//                                         <a
//                                           href={photo.uri}
//                                           target="_blank"
//                                           download
//                                           className=""
//                                         >
//                                           <MdFileDownload size={20} />
//                                         </a>
//                                       </div>
//                                     </Tooltip>
//                                   </div>
//                                 ))
//                               : "No record found!"}
//                           </div>
//                         )}
//                       </div>
//                     </Modal.Body>
//                   </Modal>

//                   <div className="flex justify-center my-5">
//                     <nav aria-label="Page navigation flex">
//                       {numOfPages.length > 1 && totalRecs > recsPerPage ? (
//                         <ul className="pagination mx-auto ps-5 flex">
//                           {pageNumber !== 1 ? (
//                             <li
//                               className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
//                               onClick={() => setPageNumber(--pageNumber)}
//                             >
//                               <a className="page-link">
//                                 &nbsp; <FontAwesomeIcon icon={faAngleLeft} />
//                               </a>
//                             </li>
//                           ) : null}
//                           {numOfPages.map((item, i) => (
//                             <li
//                               key={i}
//                               className={
//                                 "page-item hover px-3 border border-gray-400 cursor-pointer text-center border-e-0 font-semibold " +
//                                 (pageNumber === item ? " active" : "")
//                               }
//                               onClick={() => handlePageClick(item)}
//                             >
//                               <a className="page-link">{item}</a>
//                             </li>
//                           ))}
//                           {pageNumber !== numOfPages.length ? (
//                             <li
//                               className="page-item hover px-3 border border-gray-400 cursor-pointer"
//                               onClick={() => setPageNumber(++pageNumber)}
//                             >
//                               <a className="page-link">
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
//             </section>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default PlantationReport;





