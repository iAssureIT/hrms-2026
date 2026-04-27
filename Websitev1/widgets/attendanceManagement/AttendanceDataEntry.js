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
            // Fix for Centers: Check for .value, .data, or direct array
            const centersList = cRes.data?.value || cRes.data?.data || (Array.isArray(cRes.data) ? cRes.data : []);
            setCenters(centersList);

            // Fix for Departments: Check for .value, .data, or direct array
            const deptsList = dRes.data?.value || dRes.data?.data || (Array.isArray(dRes.data) ? dRes.data : []);
            setDepartments(deptsList);

        } catch (err) {
            console.error("Filter Fetch Error:", err);
            // Fallback to empty arrays on error to prevent crash
            setCenters([]);
            setDepartments([]);
        }
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
        <section className="section">
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
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= n ? 'bg-[#3c8dbc] text-white border-[#3c8dbc]' : 'bg-white text-gray-400 border-gray-200'}`}>
                                                {n}
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold ${step >= n ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {n === 1 ? 'Upload' : n === 2 ? 'Mapping' : 'Done'}
                                            </span>
                                        </div>
                                        {n < 3 && <div className={`h-[2px] w-20 ${step > n ? 'bg-[#3c8dbc]' : 'bg-gray-200'}`}></div>}
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
                                    <div className="bg-[#3c8dbc] p-4 text-white flex items-center justify-between shadow-sm">
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
                        <div className="admin-box mb-6 border-b border-gray-200">
                            <div className="p-6 bg-gray-50/30">
                                <div className="flex flex-wrap items-center gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Select Date</label>
                                        <input
                                            type="date"
                                            className="bg-white border border-gray-300 text-gray-700 text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-44 p-1.5 h-9 outline-none transition-all shadow-sm hover:border-gray-400"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Center</label>
                                        <select
                                            className="bg-white border border-gray-300 text-gray-700 text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-52 p-1.5 h-9 outline-none transition-all shadow-sm hover:border-gray-400"
                                            value={center_id}
                                            onChange={(e) => setCenter_id(e.target.value)}
                                        >
                                            <option value="all">All Centers</option>
                                            {centers.map(c => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Department</label>
                                        <select
                                            className="bg-white border border-gray-300 text-gray-700 text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-52 p-1.5 h-9 outline-none transition-all shadow-sm hover:border-gray-400"
                                            value={department_id}
                                            onChange={(e) => setDepartment_id(e.target.value)}
                                        >
                                            <option value="all">All Departments</option>
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.fieldValue}</option>)}
                                        </select>
                                    </div>
                                    <div className="pt-6">
                                        <button
                                            onClick={fetchEmployees}
                                            className="bg-[#3c8dbc] border border-[#367fa9] text-white px-8 py-1.5 h-9 rounded-sm font-bold text-xs hover:bg-[#367fa9] shadow-md flex items-center gap-2 transform active:scale-95 transition-all"
                                        >
                                            <FaFilter className="text-[10px]" /> Apply Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-box">
                            <div className="admin-box-header bg-gray-50/50">
                                <h3 className="admin-box-title">Manual Data Entry Grid</h3>
                            </div>
                            <div className="admin-content-area overflow-x-auto border border-gray-200">
                                <table className="admin-table border-collapse">
                                    <thead className="admin-table-thead bg-gray-50/50">
                                        <tr>
                                            <th className="admin-table-th p-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider min-w-[250px]">Employee Profile</th>
                                            <th className="admin-table-th p-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider min-w-[150px]">In Time</th>
                                            <th className="admin-table-th p-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider min-w-[150px]">Out Time</th>
                                            <th className="admin-table-th p-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider min-w-[180px]">Attendance Status</th>
                                            <th className="admin-table-th p-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Remarks / Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">Loading roster...</td></tr>
                                        ) : employees.length === 0 ? (
                                            <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">No employees found for selection</td></tr>
                                         ) : employees.map(emp => (
                                            <tr key={emp.employee_id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-0 group">
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#3c8dbc] font-bold text-xs border border-gray-200 uppercase">
                                                            {emp.employeeName?.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-bold text-gray-800 leading-tight group-hover:text-[#3c8dbc] transition-colors">{emp.employeeName}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">{emp.employeeID}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2 w-fit bg-white border border-gray-200 rounded px-2 py-1 shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                                                        <FaClock className="text-gray-300 text-[10px]" />
                                                        <input
                                                            type="time"
                                                            className="bg-transparent border-0 text-[12px] p-0 w-24 outline-none text-gray-700"
                                                            value={manualData[emp.employee_id]?.inTime || ""}
                                                            onChange={(e) => handleManualChange(emp.employee_id, "inTime", e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2 w-fit bg-white border border-gray-200 rounded px-2 py-1 shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                                                        <FaClock className="text-gray-300 text-[10px]" />
                                                        <input
                                                            type="time"
                                                            className="bg-transparent border-0 text-[12px] p-0 w-24 outline-none text-gray-700"
                                                            value={manualData[emp.employee_id]?.outTime || ""}
                                                            onChange={(e) => handleManualChange(emp.employee_id, "outTime", e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-center">
                                                    <select
                                                        className="bg-white border border-gray-200 text-gray-700 text-[11px] font-bold rounded px-2 py-1.5 w-32 shadow-sm focus:border-blue-400 outline-none transition-all cursor-pointer"
                                                        value={manualData[emp.employee_id]?.status || "X"}
                                                        onChange={(e) => handleManualChange(emp.employee_id, "status", e.target.value)}
                                                    >
                                                        <option value="X">Select Status</option>
                                                        <option value="P">Present (Full Day)</option>
                                                        <option value="A">Absent</option>
                                                        <option value="L">Late Entry</option>
                                                        <option value="E">Early Exit</option>
                                                        <option value="F">Half Day</option>
                                                        <option value="H">Holiday</option>
                                                        <option value="W">Weekly Off</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <input type="text" placeholder="Add remark..." className="bg-transparent border-b border-gray-200 text-[11px] text-gray-600 focus:border-[#3c8dbc] px-2 py-1 w-full max-w-[150px] outline-none transition-colors" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={saveManualAttendance}
                                    disabled={loading || employees.length === 0}
                                    className="bg-[#3c8dbc] border border-[#367fa9] text-white px-10 py-2 rounded-sm font-normal text-xs hover:bg-[#367fa9] shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaSave className="text-[12px]" /> Save Changes
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
