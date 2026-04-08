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
        employeeName: "Full Name",
        employeeID: "Employee ID",
        employeeEmail: "Email",
        employeeMobile: "Mobile",
        employeeDesignation: "Designation",
        centerName: "Center",
        subLocationName: "Sub-Location",
        departmentName: "Department",
        subDepartmentName: "Sub-Department",
    });

    const [failedtableHeading, setFailedtableHeading] = useState({
        employeeName: "Full Name",
        employeeID: "Employee ID",
        employeeEmail: "Email",
        employeeMobile: "Mobile",
        employeeDesignation: "Designation",
        centerName: "Center",
        subLocationName: "Sub-Location",
        departmentName: "Department",
        subDepartmentName: "Sub-Department",
        failedRemark: "Failed Data Remark",
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
                        employeeEmail: a.employeeEmail || "-NA-",
                        employeeMobile: a.employeeMobile || "-NA-",
                        employeeDesignation: a.employeeDesignation || "-NA-",
                        centerName: a.centerName || "-NA-",
                        subLocationName: a.subLocationName || "-NA-",
                        departmentName: a.departmentName || "-NA-",
                        subDepartmentName: a.subDepartmentName || "-NA-",
                    }));

                    const fRecords = response.data.failedRecords.map(a => ({
                        employeeName: a.employeeName || "-NA-",
                        employeeID: a.employeeID || "-NA-",
                        employeeEmail: a.employeeEmail || "-NA-",
                        employeeMobile: a.employeeMobile || "-NA-",
                        employeeDesignation: a.employeeDesignation || "-NA-",
                        centerName: a.centerName || "-NA-",
                        subLocationName: a.subLocationName || "-NA-",
                        departmentName: a.departmentName || "-NA-",
                        subDepartmentName: a.subDepartmentName || "-NA-",
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
                "Full Name",
                "Employee ID",
                "Email",
                "Mobile",
                "Designation",
                "Center",
                "Sub-Location",
                "Department",
                "Sub-Department"
            ],
            [
                "John Doe",
                "EMP001",
                "john.doe@example.com",
                "9876543210",
                "Process Manager",
                "Mumbai",
                "Andheri",
                "Operations",
                "Production"
            ],
            [
                "Jane Smith",
                "EMP002",
                "jane.smith@example.com",
                "9876543211",
                "Assistant Manager",
                "Pune",
                "Hinjewadi",
                "HR",
                "Recruitment"
            ]
        ];
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, "Employee-Bulk-Upload-Template.xlsx");
    };

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md bg-white">
                <div className="uppercase text-xl font-semibold border-b-2 border-gray-300 flex justify-between px-10">
                    <div className="flex items-center gap-3 py-5">
                        <h1 className="text-2xl text-gray-900 tracking-tight">Employee Bulk Upload</h1>
                    </div>
                    <div className="flex gap-3 my-5 items-center">
                        <Tooltip content="Employee Master" placement="bottom" className="bg-green" arrow={false}>
                            <FaUsers
                                className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                onClick={() => {
                                    router.push(`/${loggedInRole}/management/employee-master`);
                                }}
                            />
                        </Tooltip>
                        <Tooltip content="Add Employee" placement="bottom" className="bg-green" arrow={false}>
                            <FaUserPlus
                                className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                onClick={() => {
                                    router.push(`/${loggedInRole}/management/add-employee`);
                                }}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div className="p-5">
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
            </div>
        </section>
    );
};

export default EmployeeBulkUpload;
