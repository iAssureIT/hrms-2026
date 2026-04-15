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
            // 1. Save mapping for future use
            await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/post/mapping`, {
                mappingName: `Mapping_${file.name}`,
                mappings: Object.entries(mappings).map(([k, v]) => ({ systemField: k, excelHeader: v })),
                user_id: userDetails._id
            });

            // 2. Prepare data for import
            const headers = excelHeaders;
            const dataToImport = [];

            // Find column indices
            const colIdx = {};
            Object.entries(mappings).forEach(([sysField, excelHeader]) => {
                colIdx[sysField] = headers.indexOf(excelHeader);
            });

            // Get raw data from XLSX (re-reading if necessary, but we already have it in excelData? Wait, I didn't set it in the new version)
            // Let's re-read the file to be safe or ensure excelData is populated.
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const wb = XLSX.read(evt.target.result, { type: "binary" });
                const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                
                rows.forEach(row => {
                    const logDateRaw = row[mappings.logDate];
                    const inTimeRaw = row[mappings.inTime];
                    const outTimeRaw = row[mappings.outTime];
                    
                    if (logDateRaw && row[mappings.employeeID]) {
                        // Date formatting help
                        const logDate = moment(logDateRaw).format("YYYY-MM-DD");
                        const inTime = inTimeRaw ? moment(`${logDate} ${inTimeRaw}`).toDate() : null;
                        const outTime = outTimeRaw ? moment(`${logDate} ${outTimeRaw}`).toDate() : null;

                        dataToImport.push({
                            employeeID: row[mappings.employeeID],
                            date: logDate,
                            inTime,
                            outTime,
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
        <section className="section p-6 md:p-10 bg-white min-h-screen">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-8 pl-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-1 text-green-600">
                        Attendance System
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        Attendance <span className="text-green-600 font-black">Data Entry</span>
                    </h1>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-[20px] w-fit mb-10 shadow-inner border border-slate-200/50">
                    {[
                        { id: "upload", label: "Bulk Upload Wizard", icon: FaCloudUploadAlt },
                        { id: "manual", label: "Manual Grid Entry", icon: FaRegAddressCard }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setStep(1); }}
                            className={`flex items-center gap-2 px-8 py-3 rounded-[14px] font-bold text-sm transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-green-600 shadow-xl shadow-green-100 border border-green-50' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <tab.icon className={activeTab === tab.id ? "text-green-600" : "text-slate-400"} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'upload' ? (
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/40 p-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Stepper UI ... (Keeping previous logic but with cleaner design) */}
                        <div className="flex items-center justify-center gap-4 mb-16">
                            {[1, 2, 3].map(n => (
                                <React.Fragment key={n}>
                                    <div className={`flex flex-col items-center gap-2 ${step >= n ? 'opacity-100' : 'opacity-30'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${step >= n ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-slate-100 text-slate-400'}`}>
                                            {n}
                                        </div>
                                    </div>
                                    {n < 3 && <div className={`h-[2px] w-20 rounded-full ${step > n ? 'bg-green-600' : 'bg-slate-100'}`}></div>}
                                </React.Fragment>
                            ))}
                        </div>

                        {step === 1 && (
                            <div className="flex flex-col items-center justify-center p-16 border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30 group hover:border-green-100 transition-all">
                                <div className="w-24 h-24 bg-white rounded-[28px] shadow-2xl flex items-center justify-center text-slate-200 group-hover:text-green-500 transition-all mb-8">
                                    <FaCloudUploadAlt size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Upload Biometric Source</h3>
                                <p className="text-slate-400 text-xs font-bold mb-10 tracking-widest uppercase">Support for Door Access & WFH CSV/XLSX</p>
                                <label className="bg-green-600 hover:bg-green-700 text-white px-12 py-4.5 rounded-[18px] transition-all shadow-xl shadow-green-200 active:scale-95 font-bold text-sm cursor-pointer border-b-4 border-blue-800">
                                    Browse Files
                                    <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                                </label>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-10">
                                <div className="bg-green-600 rounded-[28px] p-8 text-white flex items-center justify-between shadow-xl shadow-green-100">
                                    <div>
                                        <h4 className="text-lg font-black tracking-tight">Column Mapping Engine</h4>
                                        <p className="text-green-100 text-xs font-bold opacity-80 uppercase tracking-widest mt-1">Source: {file?.name}</p>
                                    </div>
                                    <FaExchangeAlt size={32} className="opacity-40" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {systemFields.map(field => (
                                        <div key={field.key} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label} {field.required && '*'}</label>
                                            <select 
                                                className="w-full bg-slate-50 border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:ring-green-500/20"
                                                value={mappings[field.key] || ""}
                                                onChange={(e) => setMappings(p => ({...p, [field.key]: e.target.value}))}
                                            >
                                                <option value="">Select Excel Header</option>
                                                {excelHeaders.map((h, i) => <option key={i} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between pt-10 border-t border-slate-100">
                                    <button onClick={() => setStep(1)} className="text-slate-400 font-bold hover:text-slate-600 transition-all font-black text-xs uppercase tracking-widest px-8">Back</button>
                                    <button onClick={saveAndImport} className="bg-green-600 text-white px-12 py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-100 hover:bg-green-700">Process Data</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center py-20 animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-green-50/50">
                                    <FaCheckCircle size={56} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Sync Completed!</h2>
                                <p className="text-slate-500 font-bold max-w-sm mx-auto mb-12">Biometric data has been normalized and applied to the monthly matrix.</p>
                                <button onClick={() => window.location.href='/admin/attendance-management/matrix'} className="bg-green-600 text-white px-12 py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-100">View Matrix</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
                        {/* Manual Filters */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Date</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Center</label>
                                <select className="w-full bg-slate-50 border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700" value={center_id} onChange={(e) => setCenter_id(e.target.value)}>
                                    <option value="all">All Centers</option>
                                    {centers.map(c => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                <select className="w-full bg-slate-50 border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold text-slate-700" value={department_id} onChange={(e) => setDepartment_id(e.target.value)}>
                                    <option value="all">All Departments</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.fieldValue}</option>)}
                                </select>
                            </div>
                            <button onClick={fetchEmployees} className="bg-slate-800 text-white h-[50px] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                <FaFilter /> Apply Filter
                            </button>
                        </div>

                        {/* Manual Grid */}
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">In Time</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Out Time</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">Loading roster...</td></tr>
                                    ) : employees.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">No employees found for selection</td></tr>
                                    ) : employees.map(emp => (
                                        <tr key={emp.employee_id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-extrabold text-slate-800">{emp.employeeName}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{emp.employeeID}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="relative group">
                                                    <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                                                    <input 
                                                        type="time" 
                                                        className="bg-slate-50 border-slate-100 rounded-xl py-2 pl-12 pr-4 text-xs font-black text-slate-700 focus:ring-green-500/20 w-36"
                                                        value={manualData[emp.employee_id]?.inTime || ""}
                                                        onChange={(e) => handleManualChange(emp.employee_id, "inTime", e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="relative group">
                                                    <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                                                    <input 
                                                        type="time" 
                                                        className="bg-slate-50 border-slate-100 rounded-xl py-2 pl-12 pr-4 text-xs font-black text-slate-700 focus:ring-green-500/20 w-36"
                                                        value={manualData[emp.employee_id]?.outTime || ""}
                                                        onChange={(e) => handleManualChange(emp.employee_id, "outTime", e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <select 
                                                    className="bg-slate-50 border-none rounded-xl py-2 text-[10px] font-black text-slate-600 focus:ring-0 w-24 mx-auto"
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
                                            <td className="px-8 py-5 text-right">
                                                <input type="text" placeholder="Add remark..." className="bg-transparent border-b border-slate-200 text-[10px] font-bold text-slate-400 focus:border-blue-400 focus:bg-white px-2 py-1 w-32 focus:outline-none" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-8 bg-slate-50/50 flex justify-end">
                                <button 
                                    onClick={saveManualAttendance}
                                    disabled={loading || employees.length === 0}
                                    className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-2xl flex items-center gap-3 font-black text-sm shadow-xl shadow-green-200 transition-all active:scale-95 disabled:bg-slate-300"
                                >
                                    <FaSave /> Save Changes
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
