"use client";

import React, { useState, useEffect } from "react";
import BulkUpload from "./BulkUpload_Employee";
import axios from "axios";
import { Tooltip } from "flowbite-react";
import { FaUserPlus, FaUsers } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import * as XLSX from "xlsx";

const EmployeeBulkUpload = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [loggedInRole, setLoggedInRole] = useState("admin");

    useEffect(() => {
        if (pathname?.includes("admin")) {
            setLoggedInRole("admin");
        } else if (pathname?.includes("center")) {
            setLoggedInRole("center");
        } else if (pathname?.includes("asset")) {
            setLoggedInRole("asset");
        } else if (pathname?.includes("account")) {
            setLoggedInRole("account");
        }
    }, [pathname]);

    const [goodRecordsTable, setGoodRecordsTable] = useState([]);
    const [failedRecordsTable, setFailedRecordsTable] = useState([]);

    const [goodRecordsHeading, setGoodRecordsHeading] = useState({
        employeeName: "Full Name*",
        employeeID: "Employee ID*",
        gender: "Gender*",
        employeeEmail: "Email*",
        employeeMobile: "Mobile*",
        currentAddress: "Current Address*",
        departmentName: "Department*",
        employeeDesignation: "Designation*",
        systemRole: "System Role*",
        doj: "Date of Joining*",
        employmentType: "Employment Type",
        centerName: "Center",
        subLocationName: "Sub-Location",
        subDepartmentName: "Sub-Department",
        maritalStatus: "Marital Status",
        bloodGroup: "Blood Group",
        nationality: "Nationality",
        panNumber: "PAN Number",
        aadhaarNumber: "Aadhaar Number",
        passportNumber: "Passport Number"
    });

    const [failedtableHeading, setFailedtableHeading] = useState({
        employeeName: "Full Name*",
        employeeID: "Employee ID*",
        gender: "Gender*",
        employeeEmail: "Email*",
        employeeMobile: "Mobile*",
        currentAddress: "Current Address*",
        departmentName: "Department*",
        employeeDesignation: "Designation*",
        systemRole: "System Role*",
        doj: "Date of Joining*",
        employmentType: "Employment Type",
        centerName: "Center",
        subLocationName: "Sub-Location",
        subDepartmentName: "Sub-Department",
        maritalStatus: "Marital Status",
        bloodGroup: "Blood Group",
        nationality: "Nationality",
        panNumber: "PAN Number",
        aadhaarNumber: "Aadhaar Number",
        passportNumber: "Passport Number",
        failedRemark: "Failed Data Remark"
    });

    const [tableObjects, setTableObjects] = useState({
        deleteMethod: "delete",
        apiLink: "/api/employees",
        downloadApply: true,
        paginationApply: false,
        searchApply: false,
    });

    const [fileDetails, setFileDetails] = useState();
    const [goodDataCount, setGoodDataCount] = useState(0);
    const [failedRecordsCount, setFailedRecordsCount] = useState(0);

    const uploadedData = (data) => {
        // Refresh or handle post-upload
    };

    const getData = () => {
        // Can be used to refresh the main list if component shows it
    };

    const getFileDetails = (fileName) => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/filedetails/${fileName}`)
            .then((response) => {
                if (response.data) {
                    setFileDetails(response.data);
                    setGoodDataCount(response.data.goodrecords.length);
                    setFailedRecordsCount(response.data.failedRecords.length);

                    const gRecords = response.data.goodrecords.map(a => ({
                        employeeName: a.employeeName || "-NA-",
                        employeeID: a.employeeID || "-NA-",
                        gender: a.gender || "-NA-",
                        employeeEmail: a.employeeEmail || "-NA-",
                        employeeMobile: a.employeeMobile || "-NA-",
                        currentAddress: a.currentAddress || "-NA-",
                        departmentName: a.departmentName || "-NA-",
                        employeeDesignation: a.employeeDesignation || "-NA-",
                        systemRole: a.systemRole || "-NA-",
                        doj: a.doj ? new Date(a.doj).toLocaleDateString() : "-NA-",
                        employmentType: a.employmentType || "-NA-",
                        centerName: a.centerName || "-NA-",
                        subLocationName: a.subLocationName || "-NA-",
                        subDepartmentName: a.subDepartmentName || "-NA-",
                        maritalStatus: a.maritalStatus || "-NA-",
                        bloodGroup: a.bloodGroup || "-NA-",
                        nationality: a.nationality || "-NA-",
                        panNumber: a.panNumber || "-NA-",
                        aadhaarNumber: a.aadhaarNumber || "-NA-",
                        passportNumber: a.passportNumber || "-NA-",
                    }));

                    const fRecords = response.data.failedRecords.map(a => ({
                        employeeName: a.employeeName || "-NA-",
                        employeeID: a.employeeID || "-NA-",
                        gender: a.gender || "-NA-",
                        employeeEmail: a.employeeEmail || "-NA-",
                        employeeMobile: a.employeeMobile || "-NA-",
                        currentAddress: a.currentAddress || "-NA-",
                        departmentName: a.departmentName || "-NA-",
                        employeeDesignation: a.employeeDesignation || "-NA-",
                        systemRole: a.systemRole || "-NA-",
                        doj: a.doj ? new Date(a.doj).toLocaleDateString() : "-NA-",
                        employmentType: a.employmentType || "-NA-",
                        centerName: a.centerName || "-NA-",
                        subLocationName: a.subLocationName || "-NA-",
                        subDepartmentName: a.subDepartmentName || "-NA-",
                        maritalStatus: a.maritalStatus || "-NA-",
                        bloodGroup: a.bloodGroup || "-NA-",
                        nationality: a.nationality || "-NA-",
                        panNumber: a.panNumber || "-NA-",
                        aadhaarNumber: a.aadhaarNumber || "-NA-",
                        passportNumber: a.passportNumber || "-NA-",
                        failedRemark: a.failedRemark || "-NA-",
                    }));

                    setGoodRecordsTable(gRecords);
                    setFailedRecordsTable(fRecords);
                }
            })
            .catch((error) => {
                console.error("Error fetching file details:", error);
            });
    };

    const downloadTemplate = (e) => {
        e.preventDefault();
        const templateData = [
            [
                "Full Name*", "Employee ID*", "Gender*", "Email*", "Mobile*", "Current Address*",
                "Department*", "Designation*", "System Role*", "Date of Joining*", "Employment Type",
                "Center", "Sub-Location", "Sub-Department", 
                "Marital Status", "Blood Group", "Nationality", 
                "PAN Number", "Aadhaar Number", "Passport Number"
            ],
            [
                "John Doe", "EMP001", "Male", "john.doe@example.com", "9876543210", "123 Main St, Mumbai",
                "Operations", "Process Manager", "employee", "2024-01-15", "Full-Time",
                "Mumbai", "Andheri", "Production", 
                "Single", "O+", "Indian", 
                "ABCDE1234F", "123456789012", "A1234567"
            ]
        ];
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, "Employee-Bulk-Upload-Template.xlsx");
    };

    return (
        <section className="section admin-box box-primary !p-6" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            {/* Theme-aligned Header */}
            <div className="mb-8 border-b border-slate-100 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1 text-[#3c8dbc]">
                            <span>Human Resources</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                            Employee <span className="text-[#3c8dbc] font-black uppercase">Bulk Upload</span>
                        </h1>
                    </div>
                    <div className="flex gap-4 pt-4 md:pt-0">
                        <Tooltip content="Employee Master" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                            <div
                                className="cursor-pointer text-[#3c8dbc] hover:text-white hover:bg-[#3c8dbc] border border-[#3c8dbc] p-2 rounded transition-all active:scale-95 shadow-sm"
                                onClick={() => {
                                    router.push(`/${loggedInRole}/asset-management/employee-master`);
                                }}
                            >
                                <FaUsers className="text-lg" />
                            </div>
                        </Tooltip>
                        <Tooltip content="Add Employee" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                            <div
                                className="cursor-pointer text-[#3c8dbc] hover:text-white hover:bg-[#3c8dbc] border border-[#3c8dbc] p-2 rounded transition-all active:scale-95 shadow-sm"
                                onClick={() => {
                                    router.push(`/${loggedInRole}/asset-management/add-employee`);
                                }}
                            >
                                <FaUserPlus className="text-lg" />
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                    Upload employee data in bulk using Excel templates to quickly populate your organizational directory.
                </p>
            </div>

            <div className="p-0">
                <BulkUpload
                    url={process.env.NEXT_PUBLIC_BASE_URL + "/api/employees/bulk-upload"}
                    fileurl="" // S3 URL no longer needed
                    downloadTemplate={downloadTemplate}
                    data={[]}
                    uploadedData={uploadedData}
                    getData={getData}
                    getFileDetails={getFileDetails}
                    fileDetails={fileDetails}
                    tableObjects={tableObjects}
                    goodRecordsHeading={goodRecordsHeading}
                    failedtableHeading={failedtableHeading}
                    failedRecordsTable={failedRecordsTable}
                    failedRecordsCount={failedRecordsCount}
                    goodRecordsTable={goodRecordsTable}
                    goodDataCount={goodDataCount}
                />
            </div>
        </section>
    );
};

export default EmployeeBulkUpload;
