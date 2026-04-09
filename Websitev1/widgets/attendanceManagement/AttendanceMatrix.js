"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { FaPlus, FaFilter, FaDownload, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import moment from "moment";
import ls from "localstorage-slim";

const AttendanceMatrix = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [matrixData, setMatrixData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [center_id, setCenter_id] = useState("all");
    const [department_id, setDepartment_id] = useState("all");
    const [centers, setCenters] = useState([]);
    const [departments, setDepartments] = useState([]);

    const months = moment.months().map((m, i) => ({ value: i + 1, label: m }));
    const years = Array.from({ length: 5 }, (_, i) => moment().year() - i);

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchMatrix();
    }, [selectedMonth, selectedYear, center_id, department_id]);

    const fetchFilters = async () => {
        try {
            const [cRes, dRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`),
                axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
            ]);
            setCenters(cRes.data);
            setDepartments(dRes.data);
        } catch (err) {
            console.error("Filter Fetch Error:", err);
        }
    };

    const fetchMatrix = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/post/matrix`, {
                year: selectedYear,
                month: selectedMonth,
                center_id,
                department_id
            });
            if (res.data.success) {
                setMatrixData(res.data.data);
            }
        } catch (err) {
            console.error("Matrix Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = moment([selectedYear, selectedMonth - 1]).daysInMonth();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getStatusColor = (status) => {
        switch (status) {
            case 'P': return 'bg-green-100 text-green-700 border-green-200';
            case 'A': return 'bg-red-100 text-red-700 border-red-200';
            case 'L': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'H': return 'bg-green-100 text-green-700 border-green-200';
            case 'W': return 'bg-slate-100 text-slate-500 border-slate-200';
            case 'F': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-white text-slate-300 border-slate-100';
        }
    };

    return (
        <section className="section p-6 md:p-10 bg-white min-h-screen">
            <div className="max-w-[100%] mx-auto">
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-green-600">Attendance Management</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Monthly <span className="text-green-600 font-black">Matrix</span>
                            </h1>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-200 shadow-sm">
                                <select 
                                    className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer px-3 py-2"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                >
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>
                                <select 
                                    className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer px-3 py-2"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <button 
                                onClick={() => router.push('/admin/attendance-management/data-entry')}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-green-200 active:scale-95 font-bold text-sm"
                            >
                                <FaPlus size={14} />
                                <span>Data Entry</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Center</label>
                        <select 
                            className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-green-500/20"
                            value={center_id}
                            onChange={(e) => setCenter_id(e.target.value)}
                        >
                            <option value="all">All Centers</option>
                            {centers.map(c => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                        <select 
                            className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-green-500/20"
                            value={department_id}
                            onChange={(e) => setDepartment_id(e.target.value)}
                        >
                            <option value="all">All Departments</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.fieldValue}</option>)}
                        </select>
                    </div>
                </div>

                {/* Matrix Content */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="sticky left-0 z-20 bg-white/95 backdrop-blur-sm px-6 py-5 text-left border-b border-slate-100 min-w-[250px] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Details</span>
                                    </th>
                                    {daysArray.map(day => (
                                        <React.Fragment key={day}>
                                            <th className="px-2 py-5 text-center border-b border-slate-100 min-w-[48px]">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
                                            </th>
                                            {day % 7 === 0 && (
                                                <th className="px-2 py-5 text-center border-b border-slate-100 min-w-[60px] bg-green-50/30">
                                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">W{day / 7}</span>
                                                </th>
                                            )}
                                            {day === daysInMonth && daysInMonth % 7 !== 0 && (
                                                <th className="px-2 py-5 text-center border-b border-slate-100 min-w-[60px] bg-green-50/30">
                                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">W5</span>
                                                </th>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <th className="px-4 py-5 text-center border-b border-slate-100 min-w-[80px] bg-slate-50/50 font-black text-[10px] uppercase tracking-widest text-slate-500">P/A/L/E</th>
                                    <th className="px-4 py-5 text-center border-b border-slate-100 min-w-[80px] bg-slate-50/50 font-black text-[10px] uppercase tracking-widest text-slate-500">Total Hrs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={daysInMonth + 2} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-slate-400 font-bold text-sm tracking-tight">Syncing attendance data...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : matrixData.length === 0 ? (
                                    <tr>
                                        <td colSpan={daysInMonth + 2} className="py-20 text-center">
                                            <p className="text-slate-400 font-bold text-sm tracking-tight text-center">No records found for this criteria</p>
                                        </td>
                                    </tr>
                                ) : matrixData.map(emp => (
                                    <tr key={emp.employee_id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="sticky left-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-slate-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-extrabold text-slate-700 group-hover:text-green-600 transition-colors">{emp.employeeName}</span>
                                                <span className="text-[10px] font-bold text-slate-400 tracking-tight">{emp.employeeID} • {emp.departmentName}</span>
                                            </div>
                                        </td>
                                        {daysArray.map(day => (
                                            <React.Fragment key={day}>
                                                <td className="px-1 py-4 border-b border-slate-50 text-center">
                                                    <Tooltip 
                                                        content={emp.timings[day] ? (
                                                            <div className="p-2 space-y-1">
                                                                <p className="font-black text-[10px] uppercase border-b border-slate-600 pb-1 mb-1">{moment([selectedYear, selectedMonth - 1, day]).format("DD MMM")}</p>
                                                                <p className="flex justify-between gap-4"><span>In:</span><b>{emp.timings[day].in}</b></p>
                                                                <p className="flex justify-between gap-4"><span>Out:</span><b>{emp.timings[day].out}</b></p>
                                                                <p className="flex justify-between gap-4 pt-1 border-t border-slate-600"><span>Total:</span><b>{(emp.timings[day].total / 60).toFixed(1)} hrs</b></p>
                                                            </div>
                                                        ) : moment([selectedYear, selectedMonth - 1, day]).format("DD MMM")} 
                                                        arrow={false} 
                                                        className="bg-slate-800 text-[10px] font-bold"
                                                    >
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all hover:scale-110 cursor-default mx-auto ${getStatusColor(emp.attendance[day])}`}>
                                                            {emp.attendance[day]}
                                                        </div>
                                                    </Tooltip>
                                                </td>
                                                {day % 7 === 0 && (
                                                    <td className="px-1 py-4 border-b border-slate-50 text-center bg-green-50/10 font-black text-[10px] text-green-600">
                                                        {(emp.weeklyHours[`W${day / 7}`] / 60).toFixed(1)}h
                                                    </td>
                                                )}
                                                {day === daysInMonth && daysInMonth % 7 !== 0 && (
                                                    <td className="px-1 py-4 border-b border-slate-50 text-center bg-green-50/10 font-black text-[10px] text-green-600">
                                                        {(emp.weeklyHours[`W5`] / 60).toFixed(1)}h
                                                    </td>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        <td className="px-4 py-4 border-b border-slate-50 bg-slate-50/20 text-center font-black text-[10px] text-slate-600">
                                            {emp.monthlyStats.P}/{emp.monthlyStats.A}/{emp.monthlyStats.L}/{emp.monthlyStats.E}
                                        </td>
                                        <td className="px-4 py-4 border-b border-slate-50 bg-slate-50/20 text-center font-black text-[10px] text-green-700">
                                            {(emp.monthlyStats.totalHours / 60).toFixed(1)}h
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-8 flex flex-wrap gap-4 px-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Legend:</span>
                    {[
                        { s: 'P', l: 'Present', c: 'bg-green-100 text-green-700' },
                        { s: 'A', l: 'Absent', c: 'bg-red-100 text-red-700' },
                        { s: 'L', l: 'Late', c: 'bg-amber-100 text-amber-700' },
                        { s: 'E', l: 'Early Exit', c: 'bg-rose-100 text-rose-700' },
                        { s: 'H', l: 'Holiday', c: 'bg-green-100 text-green-700' },
                        { s: 'W', l: 'Weekly Off', c: 'bg-slate-100 text-slate-500' },
                        { s: 'F', l: 'Half Day', c: 'bg-orange-100 text-orange-700' },
                    ].map(item => (
                        <div key={item.s} className="flex items-center gap-2">
                             <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black ${item.c}`}>{item.s}</div>
                             <span className="text-xs font-bold text-slate-500">{item.l}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </section>
    );
};

export default AttendanceMatrix;
