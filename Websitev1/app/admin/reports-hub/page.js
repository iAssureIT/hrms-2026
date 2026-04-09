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
            setCenters(cRes.data);
            setDepartments(dRes.data);
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
        <section className="section p-6 md:p-10 bg-slate-50/30 min-h-screen">
            <div className="max-w-[1500px] mx-auto">
                {/* Header */}
                <div className="mb-10 pl-1">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Reports <span className="text-green-600">Hub</span></h1>
                    <p className="text-slate-400 font-bold text-sm mt-1">Generate, configure, and export standard and custom reports.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side: Report Categories */}
                    <div className="flex-1 space-y-12">
                        {reportCategories.map((cat, idx) => (
                            <div key={idx} className="space-y-6">
                                <h3 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[3px] text-slate-400 pl-2">
                                    <span className="text-green-500">{cat.icon}</span> {cat.title}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cat.reports.map(rep => (
                                        <div 
                                            key={rep.id} 
                                            onClick={() => setSelectedReport(rep)}
                                            className={`group relative p-6 bg-white rounded-[28px] border transition-all cursor-pointer ${selectedReport?.id === rep.id ? 'border-green-500 shadow-xl shadow-green-100 ring-1 ring-green-50' : 'border-slate-100 hover:border-green-200 hover:shadow-lg'}`}
                                        >
                                            <div className="flex gap-5 items-start">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedReport?.id === rep.id ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-green-50 group-hover:text-green-500'}`}>
                                                    {rep.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-black text-slate-800">{rep.name}</h4>
                                                        {rep.popular && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase">Popular</span>}
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed pr-4">{rep.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Side: Filter & Action Panel */}
                    <div className="w-full lg:w-96">
                        <div className="sticky top-10 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
                             <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shadow-sm">
                                        <FaFilter size={14}/>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Filters</h4>
                                </div>
                                {selectedReport && <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">ID: {selectedReport.id}</span>}
                             </div>

                             {/* Filter Inputs */}
                             <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="date" className="w-full bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                        <input type="date" className="w-full bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Center / Location</label>
                                    <select className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3 px-5 text-[11px] font-bold text-slate-700">
                                        <option value="all">All Locations</option>
                                        {centers.map(c => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Export Format</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setExportFormat("Excel")} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${exportFormat === 'Excel' ? 'border-green-500 bg-green-50' : 'border-slate-50 bg-slate-50'}`}>
                                            <FaFileExcel className={exportFormat === 'Excel' ? 'text-green-600' : 'text-slate-300'} size={20}/>
                                            <span className={`text-[9px] font-black uppercase ${exportFormat === 'Excel' ? 'text-green-600' : 'text-slate-400'}`}>MS Excel</span>
                                        </button>
                                        <button onClick={() => setExportFormat("PDF")} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${exportFormat === 'PDF' ? 'border-green-500 bg-green-50' : 'border-slate-50 bg-slate-50'}`}>
                                            <FaFilePdf className={exportFormat === 'PDF' ? 'text-green-600' : 'text-slate-300'} size={20}/>
                                            <span className={`text-[9px] font-black uppercase ${exportFormat === 'PDF' ? 'text-green-600' : 'text-slate-400'}`}>PDF Document</span>
                                        </button>
                                    </div>
                                </div>
                             </div>

                             <div className="space-y-3 pt-6">
                                <button 
                                    onClick={() => generateReport(true)}
                                    disabled={!selectedReport || loading}
                                    className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
                                >
                                    <FaDownload /> Generate & Download
                                </button>
                                <button 
                                    onClick={() => generateReport(false)}
                                    disabled={!selectedReport || loading}
                                    className="w-full bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <FaEye /> Preview Report Data
                                </button>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                {reportData.length > 0 && (
                    <div className="mt-16 bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700 mb-20">
                         <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest pl-2">Report Preview: {selectedReport?.name}</h3>
                            <button onClick={() => setReportData([])} className="text-slate-400 hover:text-red-500 font-bold text-xs">Clear Preview</button>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {Object.keys(reportData[0]).map((h, i) => (
                                            <th key={i} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((row, ridx) => (
                                        <tr key={ridx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            {Object.values(row).map((val, vidx) => (
                                                <td key={vidx} className="px-8 py-4 text-xs font-extrabold text-slate-700">
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
