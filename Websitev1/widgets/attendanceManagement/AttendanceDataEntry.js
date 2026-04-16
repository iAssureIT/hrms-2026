"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCloudUploadAlt, FaExchangeAlt, FaCheckCircle, FaChevronRight, FaChevronLeft, FaTrash, FaSave, FaFilter, FaClock, FaCheck, FaUserFriends, FaRegAddressCard } from "react-icons/fa";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import ls from "localstorage-slim";
import moment from "moment";

const AttendanceDataEntry = () => {
    const [activeTab, setActiveTab] = useState("upload");
    const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);

    // Upload Wizard State
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [excelHeaders, setExcelHeaders] = useState([]);
    const [mappings, setMappings] = useState({});
    const [savedMappings, setSavedMappings] = useState([]);

    // Manual Grid State
    const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
    const [center_id, setCenter_id] = useState("all");
    const [department_id, setDepartment_id] = useState("all");
    const [centers, setCenters] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [manualData, setManualData] = useState({}); // { empId: { inTime, outTime, status } }

    const systemFields = [
        { key: "employeeID", label: "Employee ID/Code", required: true },
        { key: "employeeName", label: "Employee Name", required: false },
        { key: "logDate", label: "Log Date", required: true },
        { key: "inTime", label: "In Time", required: true },
        { key: "outTime", label: "Out Time", required: false },
        { key: "status", label: "Status (P,A...)", required: false },
    ];

    useEffect(() => {
        const details = ls.get("userDetails", { decrypt: true });
        setUserDetails(details);
        fetchFilters();
        if (details) fetchSavedMappings(details._id);
    }, []);

    useEffect(() => {
        if (activeTab === "manual") fetchEmployees();
    }, [activeTab, center_id, department_id, selectedDate]);

    const fetchFilters = async () => {
        try {
            const [cRes, dRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`),
                axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
            ]);
            setCenters(cRes.data?.value || cRes.data || []);
            setDepartments(dRes.data?.value || dRes.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchSavedMappings = async (userId) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/get/mappings/${userId}`);
            if (res.data.success) setSavedMappings(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/post/matrix`, {
                year: moment(selectedDate).year(),
                month: moment(selectedDate).month() + 1,
                center_id,
                department_id
            });
            if (res.data.success) {
                const day = moment(selectedDate).date();
                const initialManualData = {};
                res.data.data.forEach(emp => {
                    initialManualData[emp.employee_id] = {
                        inTime: emp.timings[day]?.in || "",
                        outTime: emp.timings[day]?.out || "",
                        status: emp.attendance[day] || "X"
                    };
                });
                setEmployees(res.data.data);
                setManualData(initialManualData);
            } else {
                Swal.fire("Error", res.data.message || "Failed to fetch roster", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Server Error", "Could not connect to attendance service", "error");
        }
        finally { setLoading(false); }
    };

    const handleManualChange = (empId, field, value) => {
        setManualData(prev => ({
            ...prev,
            [empId]: { ...prev[empId], [field]: value }
        }));
    };

    const saveManualAttendance = async () => {
        try {
            setLoading(true);
            const attendanceData = Object.entries(manualData).map(([empId, data]) => ({
                employee_id: empId,
                date: selectedDate,
                inTime: data.inTime ? moment(`${selectedDate} ${data.inTime}`).toDate() : null,
                outTime: data.outTime ? moment(`${selectedDate} ${data.outTime}`).toDate() : null,
                status: data.status !== 'X' ? data.status : 'P'
            }));

            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/post/save`, {
                attendanceData,
                user_id: userDetails._id
            });

            if (res.data.success) {
                Swal.fire("Saved", "Attendance updated successfully", "success");
            }
        } catch (err) {
            Swal.fire("Error", "Failed to save attendance", "error");
        } finally {
            setLoading(false);
        }
    };

    // Upload Handlers
    const handleFileUpload = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const wb = XLSX.read(evt.target.result, { type: "binary" });
            const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
            if (data.length > 0) {
                setExcelHeaders(data[0]);
                setStep(2);
                const autoMap = {};
                data[0].forEach(h => {
                    const header = String(h).toLowerCase().trim();
                    systemFields.forEach(f => {
                        if (header.includes(f.key.toLowerCase()) || header.includes(f.label.toLowerCase())) autoMap[f.key] = h;
                    });
                });
                setMappings(autoMap);
            }
        };
        reader.readAsBinaryString(f);
    };

    const saveAndImport = async () => {
        const missing = systemFields.filter(f => f.required && !mappings[f.key]);
        if (missing.length > 0) {
            Swal.fire("Mapping Required", `Map: ${missing.map(m => m.label).join(", ")}`, "warning");
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/post/mapping`, {
                mappingName: `Mapping_${file.name}`,
                mappings: Object.entries(mappings).map(([k, v]) => ({ systemField: k, excelHeader: v })),
                user_id: userDetails._id
            });

            const reader = new FileReader();
            reader.onload = async (evt) => {
                const wb = XLSX.read(evt.target.result, { type: "binary" });
                const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                const dataToImport = [];

                rows.forEach(row => {
                    const logDateRaw = row[mappings.logDate];
                    if (logDateRaw && row[mappings.employeeID]) {
                        const logDate = moment(logDateRaw).format("YYYY-MM-DD");
                        dataToImport.push({
                            employeeID: row[mappings.employeeID],
                            date: logDate,
                            inTime: row[mappings.inTime] ? moment(`${logDate} ${row[mappings.inTime]}`).toDate() : null,
                            outTime: row[mappings.outTime] ? moment(`${logDate} ${row[mappings.outTime]}`).toDate() : null,
                            source: 'Excel_Biometric'
                        });
                    }
                });

                if (dataToImport.length > 0) {
                    await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/post/save`, {
                        attendanceData: dataToImport,
                        user_id: userDetails._id
                    });
                    Swal.fire("Success", `${dataToImport.length} records imported successfully!`, "success");
                    setStep(3);
                } else {
                    Swal.fire("No Data", "No valid records found in the file", "info");
                }
                setLoading(false);
            };
            reader.readAsBinaryString(file);

        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Import failed", "error");
            setLoading(false);
        }
    };

    return (
        <section className="p-4 bg-[#f4f6f9] min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-baseline gap-3">
                    <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Attendance Data Entry</h1>
                    <span className="text-sm font-light text-gray-500">Control panel</span>
                </div>
                <div className="flex items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <span className="hover:text-gray-600 cursor-pointer">Admin</span>
                    <FaChevronRight className="mx-2 text-[10px] opacity-30" />
                    <span className="text-gray-800">Attendance</span>
                </div>
            </div>

            <div className="admin-box border-t-0 bg-transparent shadow-none">
                <div className="admin-box-header p-0 border-b-0">
                    <div className="flex">
                        <button
                            onClick={() => { setActiveTab("upload"); setStep(1); }}
                            className={`px-6 py-3 text-sm font-bold transition-all border-r border-gray-200 ${activeTab === 'upload' ? 'border-t-[3px] border-t-[#3c8dbc] bg-white text-gray-800' : 'text-gray-500 hover:text-gray-700 bg-[#f4f4f4]'}`}
                        >
                            <FaCloudUploadAlt className="inline mr-2" /> Bulk Upload Wizard
                        </button>
                        <button
                            onClick={() => { setActiveTab("manual"); setStep(1); }}
                            className={`px-6 py-3 text-sm font-bold transition-all border-r border-gray-200 ${activeTab === 'manual' ? 'border-t-[3px] border-t-[#3c8dbc] bg-white text-gray-800 focus:outline-none' : 'text-gray-500 hover:text-gray-700 bg-[#f4f4f4]'}`}
                        >
                            <FaRegAddressCard className="inline mr-2" /> Manual Grid Entry
                        </button>
                    </div>
                </div>
            </div>

            <div className="admin-box bg-white mt-0 border-t-0 p-8 pt-10">
                {activeTab === 'upload' ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="p-8">
                            {/* Stepper UI */}
                            <div className="flex items-center justify-center gap-4 mb-12">
                                {[1, 2, 3].map(n => (
                                    <React.Fragment key={n}>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= n ? 'bg-[#00a65a] text-white border-[#00a65a]' : 'bg-white text-gray-400 border-gray-200'}`}>
                                                {n}
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold ${step >= n ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {n === 1 ? 'Upload' : n === 2 ? 'Mapping' : 'Done'}
                                            </span>
                                        </div>
                                        {n < 3 && <div className={`h-[2px] w-20 ${step > n ? 'bg-[#00a65a]' : 'bg-gray-200'}`}></div>}
                                    </React.Fragment>
                                ))}
                            </div>

                            {step === 1 && (
                                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 bg-gray-50/30">
                                    <div className="w-20 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#3c8dbc] mb-6 border border-gray-100">
                                        <FaCloudUploadAlt size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Biometric Source</h3>
                                    <p className="text-gray-500 text-xs mb-8">Click below to browse for your Attendance Excel file</p>
                                    <label className="admin-btn-primary px-10 cursor-pointer">
                                        Browse Files
                                        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-[#00a65a] p-4 text-white flex items-center justify-between shadow-sm">
                                        <div>
                                            <h4 className="font-bold">Column Mapping Engine</h4>
                                            <p className="text-xs opacity-90 mt-1">Source: {file?.name}</p>
                                        </div>
                                        <FaExchangeAlt size={24} className="opacity-40" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {systemFields.map(field => (
                                            <div key={field.key} className="admin-form-group">
                                                <label className="admin-label">{field.label} {field.required && '*'}</label>
                                                <select
                                                    className="admin-select"
                                                    value={mappings[field.key] || ""}
                                                    onChange={(e) => setMappings(p => ({ ...p, [field.key]: e.target.value }))}
                                                >
                                                    <option value="">Select Excel Header</option>
                                                    {excelHeaders.map((h, i) => <option key={i} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between pt-6 border-t border-gray-100">
                                        <button onClick={() => setStep(1)} className="admin-btn-default px-6">Back</button>
                                        <button onClick={saveAndImport} className="admin-btn-success px-10">Process & Import</button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FaCheckCircle size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sync Completed!</h2>
                                    <p className="text-gray-500 mb-8">Biometric data has been normalized and applied.</p>
                                    <button onClick={() => window.location.href = '/admin/attendance-management/matrix'} className="admin-btn-primary px-8">View Monthly Matrix</button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
                        <div className="admin-box">
                            <div className="admin-box-header">
                                <h3 className="admin-box-title">Search & Filters</h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="admin-form-group">
                                    <label className="admin-label">Date</label>
                                    <input
                                        type="date"
                                        className="admin-input"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Center</label>
                                    <select className="admin-select" value={center_id} onChange={(e) => setCenter_id(e.target.value)}>
                                        <option value="all">All Centers</option>
                                        {centers.map(c => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Department</label>
                                    <select className="admin-select" value={department_id} onChange={(e) => setDepartment_id(e.target.value)}>
                                        <option value="all">All Departments</option>
                                        {departments.map(d => <option key={d._id} value={d._id}>{d.fieldValue}</option>)}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <button onClick={fetchEmployees} className="admin-btn-primary w-full h-[34px]">
                                        <FaFilter className="mr-2" /> Apply Filter
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="admin-box">
                            <div className="admin-box-header">
                                <h3 className="admin-box-title">Manual Data Entry Grid</h3>
                            </div>
                            <table className="admin-table">
                                <thead className="admin-table-thead">
                                    <tr>
                                        <th className="admin-table-th">Employee</th>
                                        <th className="admin-table-th">In Time</th>
                                        <th className="admin-table-th">Out Time</th>
                                        <th className="admin-table-th text-center">Status</th>
                                        <th className="admin-table-th text-right">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">Loading roster...</td></tr>
                                    ) : employees.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">No employees found for selection</td></tr>
                                    ) : employees.map(emp => (
                                        <tr key={emp.employee_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="admin-table-td">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-800">{emp.employeeName}</span>
                                                    <span className="text-[10px] text-gray-400">{emp.employeeID}</span>
                                                </div>
                                            </td>
                                            <td className="admin-table-td">
                                                <div className="flex items-center gap-2">
                                                    <FaClock className="text-gray-300" />
                                                    <input
                                                        type="time"
                                                        className="admin-input py-1 px-2 w-32"
                                                        value={manualData[emp.employee_id]?.inTime || ""}
                                                        onChange={(e) => handleManualChange(emp.employee_id, "inTime", e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="admin-table-td">
                                                <div className="flex items-center gap-2">
                                                    <FaClock className="text-gray-300" />
                                                    <input
                                                        type="time"
                                                        className="admin-input py-1 px-2 w-32"
                                                        value={manualData[emp.employee_id]?.outTime || ""}
                                                        onChange={(e) => handleManualChange(emp.employee_id, "outTime", e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="admin-table-td text-center">
                                                <select
                                                    className="admin-select py-1 px-2 w-24 mx-auto"
                                                    value={manualData[emp.employee_id]?.status || "X"}
                                                    onChange={(e) => handleManualChange(emp.employee_id, "status", e.target.value)}
                                                >
                                                    <option value="X">-</option>
                                                    <option value="P">Present</option>
                                                    <option value="A">Absent</option>
                                                    <option value="H">Holiday</option>
                                                    <option value="W">Weekly Off</option>
                                                </select>
                                            </td>
                                            <td className="admin-table-td text-right">
                                                <input type="text" placeholder="Add remark..." className="bg-transparent border-b border-gray-200 text-[10px] text-gray-400 focus:border-blue-400 focus:bg-white px-2 py-1 w-32 outline-none" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={saveManualAttendance}
                                    disabled={loading || employees.length === 0}
                                    className="admin-btn-success px-10"
                                >
                                    <FaSave className="mr-2" /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AttendanceDataEntry;