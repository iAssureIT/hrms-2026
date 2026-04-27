"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaUserCheck, FaUserTimes, FaClock, FaCheckCircle, FaMoneyCheckAlt, FaChevronRight, FaFileAlt, FaBell } from "react-icons/fa";
import moment from "moment";
import {
    Chart as ChartJS,
    BarController,
    LineController,
    DoughnutController,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
    BarController,
    LineController,
    DoughnutController,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const getStatusColor = (colorClass) => {
    const colors = {
        'bg-aqua': '#00c0ef',
        'bg-green': '#00a65a',
        'bg-red': '#dd4b39',
        'bg-yellow': '#f39c12'
    };
    return colors[colorClass] || colors['bg-aqua'];
};

const MetricCard = ({ label, value, sub, icon: Icon, colorClass }) => (
    <div className="flex bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-none md:rounded-sm overflow-hidden h-24 border border-gray-200">
        <div
            style={{ backgroundColor: getStatusColor(colorClass) }}
            className="w-20 md:w-24 flex items-center justify-center text-white shrink-0"
        >
            <Icon size={36} className="text-white opacity-90" />
        </div>
        <div className="flex flex-col justify-center px-4 py-2 flex-grow overflow-hidden">
            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1 line-clamp-2 leading-snug whitespace-normal break-words">
                {label}
            </span>
            <h3 className="text-2xl font-extrabold text-gray-800 leading-none">
                {value}
            </h3>
            {sub && (
                <p className="text-[10px] text-gray-400 mt-1 truncate font-bold uppercase tracking-wider">
                    {sub}
                </p>
            )}
        </div>
    </div>
);

const HRMSDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Remove the env variable from the template literal because axios.defaults.baseURL is already set in layout.js
            const res = await axios.get(`/api/dashboard/get/stats`);

            if (res.data && res.data.success) {
                setData(res.data);
            } else {
                console.log("Invalid API Response:", res.data);
                setError(`API reached but returned unexpected format: ${JSON.stringify(res.data).substring(0, 100)}...`);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "A network error occurred while fetching dashboard data.");
        }
        finally { setLoading(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
            <FaUserTimes size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-black text-slate-800">Failed to Load Dashboard</h2>
            <p className="text-red-500 font-bold text-sm mt-2">{error}</p>
            <p className="text-slate-400 text-xs mt-4 max-w-lg text-center">
                Check the developer console (F12) for the full response payload.
            </p>
        </div>
    );

    if (!data) return null;

    const { kpis, trends, departmentDistribution, pendingLeaves, recentLeaves } = data;

    // Charts Config
    const trendData = {
        labels: trends.map(t => moment(t._id).format("D MMM")),
        datasets: [
            {
                type: 'line',
                label: 'Present Trends',
                borderColor: '#3c8dbc',
                backgroundColor: 'rgba(60, 141, 188, 0.4)',
                borderWidth: 2,
                fill: true,
                data: trends.map(t => t.present),
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#3c8dbc',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                type: 'bar',
                label: 'Attendance Count',
                backgroundColor: '#f39c12',
                data: trends.map(t => t.count || 0),
                borderRadius: 0,
                barThickness: 20
            }
        ]
    };

    const deptData = {
        labels: departmentDistribution.map(d => d._id),
        datasets: [{
            data: departmentDistribution.map(d => d.count),
            backgroundColor: ['#00c0ef', '#00a65a', '#f39c12', '#dd4b39', '#3c8dbc', '#d2d6de'],
            borderWidth: 1,
            cutout: '70%'
        }]
    };

    const handleGenerateReport = async () => {
        if (!data) return;

        // Dynamically import jsPDF and autoTable exactly when needed to prevent Next.js SSR crashes
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF();
        const timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");

        // Header
        doc.setFillColor(60, 141, 188); // #3c8dbc (AdminLTE blue)
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("HRMS Dashboard Report", 15, 25);
        doc.setFontSize(10);
        doc.text(`Generated on: ${timestamp}`, 15, 32);

        // KPI Summary
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(16);
        doc.text("Summary KPIs", 15, 55);

        autoTable(doc, {
            startY: 60,
            head: [['Indicator', 'Value', 'Details']],
            body: [
                ['Total Employees', kpis.totalEmployees, 'Active in system'],
                ['Present Today', kpis.presentToday, `${((kpis.presentToday / kpis.totalEmployees) * 100).toFixed(1)}% attendance`],
                ['Absent Today', kpis.absentToday, 'Including leaves'],
                ['Late Arrivals', kpis.lateToday, '> 15 mins late'],
                ['Payroll Status', kpis.payrollStatus, 'Current cycle']
            ],
            theme: 'striped',
            headStyles: { fillColor: [60, 141, 188] }
        });

        // Department Distribution
        doc.text("Department Headcount", 15, doc.lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Department', 'Employee Count']],
            body: departmentDistribution.map(d => [d._id || "Unassigned", d.count]),
            theme: 'grid',
            headStyles: { fillColor: [51, 65, 85] }
        });

        // Recent Leaves
        doc.text("Recent Leave Requests", 15, doc.lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Employee', 'Leave Type', 'Period', 'Status']],
            body: recentLeaves.map(l => [
                l.employeeName,
                l.leaveType,
                `${moment(l.startDate).format("MMM D")} - ${moment(l.endDate).format("MMM D")}`,
                l.status
            ]),
            theme: 'striped',
            headStyles: { fillColor: [60, 141, 188] }
        });

        doc.save(`HRMS_Dashboard_Report_${moment().format("YYYYMMDD")}.pdf`);
    };

    return (
        <section className="section admin-box box-primary">
            <div className="mx-auto">

                {/* Theme-aligned Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Dashboard Management</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                HRMS <span className="text-[#3c8dbc] font-black">Dashboard</span>
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">

                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                        Comprehensive overview of organizational health, employee attendance metrics, and critical administrative alerts.
                    </p>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        label="Total Employees"
                        value={kpis.totalEmployees}
                        sub="+12 this month"
                        icon={FaUsers}
                        colorClass="bg-aqua"
                    />
                    <MetricCard
                        label="Present Today"
                        value={kpis.presentToday}
                        sub={`${((kpis.presentToday / kpis.totalEmployees) * 100).toFixed(1)}% Attendance`}
                        icon={FaUserCheck}
                        colorClass="bg-green"
                    />
                    <MetricCard
                        label="Absent"
                        value={kpis.absentToday}
                        sub="Leaves + Unplanned"
                        icon={FaUserTimes}
                        colorClass="bg-red"
                    />
                    <MetricCard
                        label="Late pulse"
                        value={kpis.lateToday}
                        sub="> 15 mins late"
                        icon={FaClock}
                        colorClass="bg-yellow"
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

                    {/* Attendance Trends (2/3 width) */}
                    <div className="lg:col-span-2 bg-white border-t-[3px] border-[#3c8dbc] shadow-md flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-800">Monthly Recap Report</h3>
                            <div className="flex gap-2 text-gray-400">
                                <span className="cursor-pointer hover:text-gray-600">−</span>
                                <span className="cursor-pointer hover:text-gray-600">×</span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-center w-full">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Attendance: 1 Nov, 2026 - 16 Nov, 2026</p>
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <Bar data={trendData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: "#f4f4f4" } } } }} />
                            </div>
                        </div>
                    </div>

                    {/* Action Needed Panel (1/3 width) */}
                    <div className="bg-white border-t-[3px] border-[#f39c12] shadow-md flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <FaBell className="text-[#f39c12]" /> Alerts & Notices
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Late Alert */}
                            {kpis.lateToday > 0 && (
                                <div className="p-3 bg-yellow-50/50 border-l-4 border-[#f39c12] flex gap-3 items-start">
                                    <div className="text-[#f39c12] mt-1"><FaClock size={14} /></div>
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-800 uppercase tracking-tight">Late Pulse Detected</h5>
                                        <p className="text-[10px] text-gray-600 mt-0.5">{kpis.lateToday} employees arrived late today.</p>
                                    </div>
                                </div>
                            )}

                            {/* Pending Leaves */}
                            {pendingLeaves.map(leave => (
                                <div key={leave._id} className="p-3 bg-gray-50 border-l-4 border-gray-200 flex gap-3 items-start hover:bg-gray-100 transition-colors">
                                    <div className="text-gray-400 mt-1"><FaFileAlt size={14} /></div>
                                    <div className="flex-1">
                                        <h5 className="text-xs font-bold text-gray-800 uppercase tracking-tight">{leave.employeeName}</h5>
                                        <p className="text-[10px] text-gray-500 truncate">Pending: {leave.leaveType} for {moment(leave.startDate).format("MMM D")}.</p>
                                    </div>
                                </div>
                            ))}

                            {pendingLeaves.length === 0 && !kpis.lateToday && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                                    <FaCheckCircle size={32} className="text-green-500 mb-2" />
                                    <p className="font-bold text-xs uppercase text-gray-400">No pending alerts</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50">
                            <button className="w-full text-center text-[10px] text-gray-400 font-bold uppercase hover:text-gray-600">View Details</button>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Leave Requests Table (2/3 width) */}
                    <div className="lg:col-span-2 bg-white border-t-[3px] border-[#00a65a] shadow-md flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-800">Recent Leave Requests</h3>
                            <button className="text-xs text-[#00a65a] font-bold border border-[#00a65a] px-3 py-1 rounded hover:bg-[#00a65a] hover:text-white transition-all">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f9f9f9]">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200">Employee</th>
                                        <th className="px-5 py-3 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200">Leave Type</th>
                                        <th className="px-5 py-3 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200 text-center">Duration</th>
                                        <th className="px-5 py-3 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLeaves.length === 0 ? (
                                        <tr><td colSpan={4} className="py-10 text-center text-gray-400 italic">No recent applications</td></tr>
                                    ) : recentLeaves.map(leave => (
                                        <tr key={leave._id} className="border-b border-gray-100 hover:bg-[#f5f5f5] transition-colors">
                                            <td className="px-5 py-3 text-xs font-bold text-gray-700">{leave.employeeName}</td>
                                            <td className="px-5 py-3 text-xs text-gray-500">{leave.leaveType}</td>
                                            <td className="px-5 py-3 text-xs text-gray-500 text-center">{moment(leave.startDate).format("MMM D")} - {moment(leave.endDate).format("MMM D")}</td>
                                            <td className="px-5 py-3 text-right">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight text-white ${leave.status === 'APPROVED' ? 'bg-green' : leave.status === 'REJECTED' ? 'bg-red' : 'bg-yellow'}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Department Distribution (1/3 width) */}
                    <div className="bg-white border-t-[3px] border-[#dd4b39] shadow-md flex flex-col">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-800">Department Headcount</h3>
                        </div>
                        <div className="p-6 flex flex-col items-center">
                            <div className="w-full text-center mb-6">
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Distribution of active employees</p>
                            </div>
                            <div className="w-48 h-48 relative mb-8">
                                <Doughnut data={deptData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-slate-800 tracking-tighter">{kpis.totalEmployees}</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Active</span>
                                </div>
                            </div>
                            <div className="w-full space-y-2 px-2">
                                {departmentDistribution.map((dept, i) => (
                                    <div key={i} className="flex justify-between items-center text-[11px] font-bold">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: deptData.datasets[0].backgroundColor[i] }}></div>
                                            <span className="text-slate-500">{dept._id}</span>
                                        </div>
                                        <span className="text-slate-800 font-black">{dept.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div> {/* Added this missing closing div for the Department Card */}
                </div> {/* Closing Main Content Grid */}

            </div> {/* Closing the mx-auto wrapper */}
        </section>
    );
};

export default HRMSDashboard;
