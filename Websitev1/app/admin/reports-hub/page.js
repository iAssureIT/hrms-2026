"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFileAlt, FaCalendarCheck, FaMoneyCheckAlt, FaChevronRight, FaFilter, FaDownload, FaEye, FaFileExcel, FaFilePdf, FaClock, FaExclamationTriangle, FaListUl, FaUniversity, FaBalanceScale } from "react-icons/fa";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";

const ReportsHub = () => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState(moment().startOf('month').format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [exportFormat, setExportFormat] = useState("Excel");
    const [centers, setCenters] = useState([]);
    const [departments, setDepartments] = useState([]);

    const reportCategories = [
        {
            title: "Attendance Reports",
            icon: <FaCalendarCheck />,
            reports: [
                { id: "daily_log", name: "Daily Attendance Log", desc: "Detailed IN/OUT punches for a specific date.", popular: true, icon: <FaClock /> },
                { id: "absenteeism", name: "Absenteeism Report", desc: "List of employees absent without approved leave.", popular: false, icon: <FaExclamationTriangle /> },
                { id: "muster_roll", name: "Monthly Muster Roll", desc: "Comprehensive grid view of daily status for the entire month.", popular: true, icon: <FaListUl /> }
            ]
        },
        {
            title: "Leave Reports",
            icon: <FaBalanceScale />,
            reports: [
                { id: "leave_balance", name: "Leave Balance Summary", desc: "Current available balances for all leave types.", popular: true, icon: <FaBalanceScale /> },
                { id: "leave_history", name: "Leave Availment History", desc: "Detailed log of all approved and taken leaves.", popular: false, icon: <FaFileAlt /> }
            ]
        },
        {
            title: "Payroll Reports",
            icon: <FaMoneyCheckAlt />,
            reports: [
                { id: "salary_register", name: "Monthly Salary Register", desc: "Master sheet containing earnings, deductions, and net.", popular: true, icon: <FaMoneyCheckAlt /> },
                { id: "bank_sheet", name: "Bank Transfer Sheet", desc: "Formatted list of net salaries and bank details.", popular: false, icon: <FaUniversity /> },
                { id: "compliance", name: "Tax & Compliance Summary", desc: "Consolidated report for PF, PT, and ESIC contributions.", popular: false, icon: <FaFileAlt /> }
            ]
        }
    ];

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            const [cRes, dRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`),
                axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
            ]);
            const centersData = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data || []);
            const deptsData = Array.isArray(dRes.data) ? dRes.data : (dRes.data?.data || []);
            setCenters(centersData);
            setDepartments(deptsData);
        } catch (err) { console.error(err); }
    };

    const generateReport = async (download = false) => {
        if (!selectedReport) return;
        try {
            setLoading(true);
            let endpoint = "/api/reports/post/attendance";
            if (['salary_register', 'bank_sheet'].includes(selectedReport.id)) endpoint = "/api/reports/post/payroll";
            if (selectedReport.id === 'compliance') endpoint = "/api/reports/get/compliance";

            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`, {
                reportType: selectedReport.id,
                startDate,
                endDate,
                month: moment(startDate).month() + 1,
                year: moment(startDate).year()
            });

            if (res.data.success) {
                setReportData(res.data.data);
                if (download) handleExport(res.data.data);
                else Swal.fire("Report Generated", `Found ${res.data.data.length} records. Scroll down to preview.`, "success");
            }
        } catch (err) {
            Swal.fire("Error", "Failed to generate report", "error");
        } finally { setLoading(false); }
    };

    const handleExport = (data) => {
        if (exportFormat === "Excel") {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Report");
            XLSX.writeFile(wb, `${selectedReport.name}_${moment().format("YYYYMMDD")}.xlsx`);
        } else {
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.text(selectedReport.name, 14, 15);
            doc.autoTable({
                head: [Object.keys(data[0])],
                body: data.map(obj => Object.values(obj)),
                startY: 20,
                styles: { fontSize: 8 }
            });
            doc.save(`${selectedReport.name}_${moment().format("YYYYMMDD")}.pdf`);
        }
    };

    return (
        <section className="section admin-box box-primary">
            <div className="mx-auto w-full px-4 mb-10">
                {/* Theme-aligned Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Reports Management</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Reports <span className="text-[#3c8dbc] font-black">Hub</span>
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
                            {/* Icons already present in the right panel, but we can add secondary actions here if needed */}
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                        Centralized repository for attendance, payroll, and compliance reports with comprehensive filtering and export options.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Side: Report Categories */}
                    <div className="flex-1 space-y-6">
                        {reportCategories.map((cat, idx) => (
                            <div key={idx} className="admin-box box-primary">
                                <div className="admin-box-header">
                                    <h3 className="admin-box-title flex items-center gap-2">
                                        <span className="text-[#3c8dbc]">{cat.icon}</span> {cat.title}
                                    </h3>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cat.reports.map(rep => (
                                        <div
                                            key={rep.id}
                                            onClick={() => setSelectedReport(rep)}
                                            className={`flex gap-4 p-3 border transition-all cursor-pointer ${selectedReport?.id === rep.id ? 'border-[#3c8dbc] shadow-md bg-blue-50' : 'border-[#d2d6de] hover:border-[#3c8dbc] bg-white'}`}
                                        >
                                            <div className={`mt-1 text-xl ${selectedReport?.id === rep.id ? 'text-[#3c8dbc]' : 'text-gray-500'}`}>
                                                {rep.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`text-sm font-bold ${selectedReport?.id === rep.id ? 'text-[#3c8dbc]' : 'text-[#333]'}`}>{rep.name}</h4>
                                                    {rep.popular && <span className="bg-[#f39c12] text-white px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase">Popular</span>}
                                                </div>
                                                <p className="text-[11px] text-[#555] leading-snug">{rep.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Side: Filter & Action Panel */}
                    <div className="w-full lg:w-96">
                        <div className="admin-box border-t-[#00a65a] sticky top-10">
                            <div className="admin-box-header">
                                <h3 className="admin-box-title flex items-center gap-2 font-bold text-[#333]">
                                    <FaFilter className="text-[#00a65a]" size={14} /> Filters
                                </h3>
                                {selectedReport && <span className="text-[11px] font-bold text-[#00a65a]">ID: {selectedReport.id}</span>}
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="admin-form-group">
                                    <label className="admin-label">Date Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="date" className="admin-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                        <input type="date" className="admin-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-label">Center / Location</label>
                                    <select className="admin-select" onChange={(e) => { /* Handle center filter if needed */ }}>
                                        <option value="all">All Locations</option>
                                        {centers.map(c => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                                    </select>
                                </div>

                                <div className="admin-form-group flex flex-col gap-1">
                                    <label className="admin-label mb-2">Export Format</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setExportFormat("Excel")} className={`p-2 border transition-all flex flex-col items-center gap-1 ${exportFormat === 'Excel' ? 'border-[#00a65a] bg-green-50' : 'border-[#d2d6de] bg-white'}`}>
                                            <FaFileExcel className={exportFormat === 'Excel' ? 'text-[#00a65a]' : 'text-gray-400'} size={20} />
                                            <span className={`text-[11px] font-bold uppercase ${exportFormat === 'Excel' ? 'text-[#00a65a]' : 'text-gray-500'}`}>MS Excel</span>
                                        </button>
                                        <button onClick={() => setExportFormat("PDF")} className={`p-2 border transition-all flex flex-col items-center gap-1 ${exportFormat === 'PDF' ? 'border-[#00a65a] bg-green-50' : 'border-[#d2d6de] bg-white'}`}>
                                            <FaFilePdf className={exportFormat === 'PDF' ? 'text-[#00a65a]' : 'text-gray-400'} size={20} />
                                            <span className={`text-[11px] font-bold uppercase ${exportFormat === 'PDF' ? 'text-[#00a65a]' : 'text-gray-500'}`}>PDF Document</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                                    <button
                                        onClick={() => generateReport(true)}
                                        disabled={!selectedReport || loading}
                                        className="admin-btn-primary flex justify-center items-center gap-2 !bg-[#00a65a] !border-[#008d4c] hover:!bg-[#008d4c] w-full"
                                    >
                                        <FaDownload /> Generate & Download
                                    </button>
                                    <button
                                        onClick={() => generateReport(false)}
                                        disabled={!selectedReport || loading}
                                        className="admin-btn-primary flex justify-center items-center gap-2 !bg-white !text-[#3c8dbc] !border-[#d2d6de] hover:!bg-gray-50 w-full"
                                    >
                                        <FaEye /> Preview Report Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                {reportData.length > 0 && (
                    <div className="admin-box border-t-[#f39c12] mt-6">
                        <div className="admin-box-header">
                            <h3 className="admin-box-title text-[15px]">Report Preview: <span className="font-bold">{selectedReport?.name}</span></h3>
                            <button onClick={() => setReportData([])} className="text-[12px] text-red-500 hover:underline">Clear Preview</button>
                        </div>
                        <div className="overflow-x-auto p-4">
                            <table className="admin-table">
                                <thead className="admin-table-thead bg-gray-50">
                                    <tr>
                                        {Object.keys(reportData[0]).map((h, i) => (
                                            <th key={i} className="admin-table-th">
                                                {h.toUpperCase()}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((row, ridx) => (
                                        <tr key={ridx}>
                                            {Object.values(row).map((val, vidx) => (
                                                <td key={vidx} className="admin-table-td">
                                                    {val}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ReportsHub;
