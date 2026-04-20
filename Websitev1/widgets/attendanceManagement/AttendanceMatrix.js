"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { FaPlus, FaFilter, FaDownload, FaChevronLeft, FaChevronRight, FaUsers, FaUserCheck, FaUserTimes, FaClock, FaCalendarTimes } from "react-icons/fa";
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
            const centersData = cRes.data?.value || cRes.data?.data || (Array.isArray(cRes.data) ? cRes.data : []);
            const deptsData = dRes.data?.value || dRes.data?.data || (Array.isArray(dRes.data) ? dRes.data : []);
            setCenters(centersData);
            setDepartments(deptsData);
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

    const getStatusColorTable = (status) => {
        switch (status) {
            case 'P': return 'bg-[#00a65a] text-white border-[#008d4c]';
            case 'A': return 'bg-[#dd4b39] text-white border-[#d73925]';
            case 'L': return 'bg-[#f39c12] text-white border-[#e08e0b]';
            case 'H': return 'bg-[#00c0ef] text-white border-[#00add7]';
            case 'W': return 'bg-gray-100 text-gray-500 border-gray-200';
            case 'F': return 'bg-[#00a65a] text-white border-[#008d4c]';
            default: return 'bg-white text-gray-300 border-gray-100';
        }
    };

    const getStatusColor = (colorClass) => {
        const colors = {
            'bg-aqua': '#00c0ef',
            'bg-green': '#00a65a',
            'bg-red': '#dd4b39',
            'bg-yellow': '#f39c12'
        };
        return colors[colorClass] || colors['bg-aqua'];
    };

    const StatusCard = ({ label, value, icon: Icon, colorClass }) => (
        <div className="flex bg-white shadow-sm rounded-none overflow-hidden h-24 border border-gray-200 flex-grow min-w-[240px]">
            <div
                style={{ backgroundColor: getStatusColor(colorClass) }}
                className="w-24 flex items-center justify-center text-white shrink-0"
            >
                <Icon size={40} className="text-white opacity-90" />
            </div>
            <div className="flex flex-col justify-center px-5 py-2 flex-grow">
                <span className="text-gray-600 text-[12px] font-bold uppercase tracking-tight mb-1 truncate">
                    {label}
                </span>
                <h3 className="text-xl font-bold text-gray-800 leading-tight">
                    {value}
                </h3>
            </div>
        </div>
    );

    return (
        <section className="section">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex items-baseline gap-3">
                    <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Attendance Matrix</h1>
                    <span className="text-sm font-light text-gray-500">Control panel</span>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <button
                        onClick={() => router.push('/admin/attendance-management/data-entry')}
                        className="bg-[#3c8dbc] border border-[#367fa9] text-white px-6 py-1.5 rounded-sm font-normal text-xs hover:bg-[#367fa9] shadow-sm flex items-center gap-2"
                    >
                        <FaPlus className="text-[10px]" /> Data Entry
                    </button>
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-gray-50 shadow-sm flex items-center gap-2">
                        <FaDownload className="text-[10px]" /> Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatusCard label="Total Staff" value={matrixData.length} icon={FaUsers} colorClass="bg-aqua" />
                <StatusCard label="Current Month" value={months.find(m => m.value === selectedMonth)?.label} icon={FaUserCheck} colorClass="bg-green" />
                <StatusCard label="Attendance Recorded" value={`${matrixData.filter(e => Object.keys(e.attendance).length > 0).length}`} icon={FaClock} colorClass="bg-yellow" />
                <StatusCard label="Year" value={selectedYear} icon={FaCalendarTimes} colorClass="bg-red" />
            </div>

            <div className="admin-box box-primary">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Month</label>
                            <select
                                className="bg-white border border-gray-300 text-gray-700 text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-36 p-1.5 h-9 outline-none transition-all shadow-sm hover:border-gray-400"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Year</label>
                            <select
                                className="bg-white border border-gray-300 text-gray-700 text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-28 p-1.5 h-9 outline-none transition-all shadow-sm hover:border-gray-400"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Center</label>
                            <select
                                className="bg-white border border-gray-300 text-gray-700 text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-56 p-1.5 h-9 outline-none transition-all shadow-sm hover:border-gray-400"
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
                                className="bg-white border border-gray-300 text-gray-700 text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-56 p-1.5 h-9 outline-none transition-all shadow-sm hover:border-gray-400"
                                value={department_id}
                                onChange={(e) => setDepartment_id(e.target.value)}
                            >
                                <option value="all">All Departments</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.fieldValue}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="admin-box-header bg-gray-50/50">
                    {/* <h3 className="admin-box-title">Monthly Attendance Roster</h3> */}
                </div>
                <div className="admin-content-area overflow-x-auto border border-gray-200">
                    <table className="admin-table border-collapse">
                        <thead className="admin-table-thead">
                            <tr className="border-b border-gray-200">
                                <th className="admin-table-th sticky left-0 z-20 bg-[#f9f9f9] min-w-[180px] border-r border-gray-200 !text-[12px] uppercase">
                                    Employee
                                </th>
                                {daysArray.map(day => (
                                    <React.Fragment key={day}>
                                        <th className="admin-table-th text-center min-w-[40px] !text-[12px]">
                                            {day}
                                        </th>
                                        {day % 7 === 0 && (
                                            <th className="admin-table-th text-center min-w-[50px] bg-blue-50 text-[#3c8dbc] !text-[12px]">
                                                W{day / 7}
                                            </th>
                                        )}
                                        {day === daysInMonth && daysInMonth % 7 !== 0 && (
                                            <th className="admin-table-th text-center min-w-[50px] bg-blue-50 text-[#3c8dbc] !text-[12px]">
                                                W5
                                            </th>
                                        )}
                                    </React.Fragment>
                                ))}
                                <th className="admin-table-th text-center min-w-[70px] !text-[12px] uppercase">P/A/L/E</th>
                                <th className="admin-table-th text-center min-w-[70px] !text-[11px] uppercase">Total Hrs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={daysInMonth + 10} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-bold text-sm tracking-tight">Syncing attendance data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : matrixData.length === 0 ? (
                                <tr>
                                    <td colSpan={daysInMonth + 10} className="py-20 text-center">
                                        <p className="text-slate-400 font-bold text-sm tracking-tight text-center">No records found for this criteria</p>
                                    </td>
                                </tr>
                            ) : matrixData.map(emp => (
                                <tr key={emp.employee_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="admin-table-td sticky left-0 z-10 bg-white min-w-[200px] border-r border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-800">{emp.employeeName}</span>
                                            <span className="text-[10px] text-gray-400">{emp.employeeID} • {emp.departmentName}</span>
                                        </div>
                                    </td>
                                    {daysArray.map(day => (
                                        <React.Fragment key={day}>
                                            <td className="admin-table-td text-center p-1">
                                                <Tooltip
                                                    content={emp.timings[day] ? (
                                                        <div className="p-2 space-y-1 text-xs">
                                                            <p className="font-bold border-b border-gray-600 pb-1 mb-1">{moment([selectedYear, selectedMonth - 1, day]).format("DD MMM")}</p>
                                                            <p className="flex justify-between gap-4"><span>In:</span><b>{emp.timings[day].in}</b></p>
                                                            <p className="flex justify-between gap-4"><span>Out:</span><b>{emp.timings[day].out}</b></p>
                                                            <p className="flex justify-between gap-4 pt-1 border-t border-gray-600"><span>Total:</span><b>{(emp.timings[day].total / 60).toFixed(1)} hrs</b></p>
                                                            {emp.timings[day].overtime > 0 && <p className="flex justify-between gap-4 text-blue-400"><span>Overtime:</span><b>{(emp.timings[day].overtime / 60).toFixed(1)} hrs</b></p>}
                                                            {emp.timings[day].earlyHours > 0 && <p className="flex justify-between gap-4 text-indigo-400"><span>Early Hours:</span><b>{(emp.timings[day].earlyHours / 60).toFixed(1)} hrs</b></p>}
                                                        </div>
                                                    ) : moment([selectedYear, selectedMonth - 1, day]).format("DD MMM")}
                                                    arrow={false}
                                                >
                                                    <div className="relative mx-auto w-7 h-7">
                                                        <div className={`w-7 h-7 rounded-none flex items-center justify-center text-[10px] font-bold border transition-all cursor-default ${getStatusColorTable(emp.attendance[day])}`}>
                                                            {emp.attendance[day]}
                                                        </div>
                                                        {emp.timings[day]?.overtime > 0 && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border border-white flex items-center justify-center rounded-full" title="Overtime">
                                                                <span className="text-[6px] text-white">O</span>
                                                            </div>
                                                        )}
                                                        {emp.timings[day]?.earlyHours > 0 && (
                                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-600 border border-white flex items-center justify-center rounded-full" title="Early Hours">
                                                                <span className="text-[6px] text-white">E</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Tooltip>
                                            </td>
                                            {day % 7 === 0 && (
                                                <td className="admin-table-td text-center bg-blue-50/30 font-bold text-[10px] text-[#3c8dbc]">
                                                    {(emp.weeklyHours[`W${day / 7}`] / 60).toFixed(1)}h
                                                </td>
                                            )}
                                            {day === daysInMonth && daysInMonth % 7 !== 0 && (
                                                <td className="admin-table-td text-center bg-blue-50/30 font-bold text-[10px] text-[#3c8dbc]">
                                                    {(emp.weeklyHours[`W5`] / 60).toFixed(1)}h
                                                </td>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <td className="admin-table-td text-center font-bold text-[10px] text-gray-600 bg-gray-50/50">
                                        {emp.monthlyStats.P}/{emp.monthlyStats.A}/{emp.monthlyStats.L}/{emp.monthlyStats.E}
                                    </td>
                                    <td className="admin-table-td text-center font-bold text-[10px] text-blue-700 bg-gray-50/50">
                                        {(emp.monthlyStats.totalHours / 60).toFixed(1)}h
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="admin-box mt-4">
                <div className="admin-box-header">
                    <h3 className="admin-box-title">Legend</h3>
                </div>
                <div className="p-4 flex flex-wrap gap-4 bg-gray-50/30">
                    {[
                        { s: 'P', l: 'Present', c: 'bg-green-100 text-green-700' },
                        { s: 'A', l: 'Absent', c: 'bg-red-100 text-red-700' },
                        { s: 'L', l: 'Late', c: 'bg-amber-100 text-amber-700' },
                        { s: 'E', l: 'Early Exit', c: 'bg-rose-100 text-rose-700' },
                        { s: 'H', l: 'Holiday', c: 'bg-green-100 text-green-700' },
                        { s: 'W', l: 'Weekly Off', c: 'bg-gray-100 text-gray-500' },
                        { s: 'F', l: 'Half Day', c: 'bg-orange-100 text-orange-700' },
                        { s: 'OT', l: 'Overtime (>1hr)', c: 'bg-blue-600 text-white !text-[8px]' },
                        { s: 'EH', l: 'Early Hours (>1hr)', c: 'bg-indigo-600 text-white !text-[8px]' },
                    ].map(item => (
                        <div key={item.s} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-none flex items-center justify-center text-[9px] font-bold border ${item.c}`}>{item.s}</div>
                            <span className="text-[11px] font-bold text-gray-600">{item.l}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AttendanceMatrix;