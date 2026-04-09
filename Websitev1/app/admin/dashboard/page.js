"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaUserCheck, FaUserTimes, FaClock, FaCheckCircle, FaMoneyCheckAlt, FaChevronRight, FaFileAlt, FaBell } from "react-icons/fa";
import moment from "moment";
import {
  Chart as ChartJS,
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

const HRMSDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/get/stats`);
            if (res.data.success) setData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading || !data) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const { kpis, trends, departmentDistribution, pendingLeaves, recentLeaves } = data;

    // Charts Config
    const trendData = {
        labels: trends.map(t => moment(t._id).format("D MMM")),
        datasets: [
            {
                type: 'line',
                label: 'Present Trends',
                borderColor: '#ef4444',
                borderWidth: 2,
                fill: false,
                data: trends.map(t => t.present),
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ef4444'
            },
            {
                type: 'bar',
                label: 'Present Count',
                backgroundColor: '#16a34a',
                data: trends.map(t => t.present),
                borderRadius: 8,
                barThickness: 30
            }
        ]
    };

    const deptData = {
        labels: departmentDistribution.map(d => d._id),
        datasets: [{
            data: departmentDistribution.map(d => d.count),
            backgroundColor: ['#16a34a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'],
            borderWidth: 0,
            cutout: '75%'
        }]
    };

    return (
        <section className="p-6 md:p-10 bg-slate-50/30 min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                
                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Dashboard <span className="text-green-600">Overview</span></h1>
                        <p className="text-slate-400 font-bold text-sm">Here's what's happening today, {moment().format("dddd, MMMM D")}.</p>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <button className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                             <FaFileAlt /> Generate Report
                        </button>
                        <button onClick={() => window.location.href='/admin/payroll-management'} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-green-200 transition-all flex items-center gap-2">
                             <FaMoneyCheckAlt /> Run Payroll
                        </button>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                    {[
                        { label: "Total Employees", value: kpis.totalEmployees, sub: "+12 this month", icon: <FaUsers />, color: "green" },
                        { label: "Present Today", value: kpis.presentToday, sub: `${((kpis.presentToday/kpis.totalEmployees)*100).toFixed(1)}% Attendance`, icon: <FaUserCheck />, color: "green" },
                        { label: "Absent", value: kpis.absentToday, sub: "Leaves + Unplanned", icon: <FaUserTimes />, color: "red" },
                        { label: "Late Arrivals", value: kpis.lateToday, sub: "> 15 mins late", icon: <FaClock />, color: "amber" },
                        { label: "Payroll Status", value: kpis.payrollStatus, sub: "Due in 3 days", icon: <FaMoneyCheckAlt />, color: "slate" }
                    ].map((kpi, i) => (
                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 group hover:scale-[1.02] transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-${kpi.color}-500 bg-${kpi.color}-50`}>
                                    {kpi.icon}
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-1">{kpi.value}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                                <p className="text-[11px] font-bold text-slate-400 mt-3 flex items-center gap-1">
                                    <span className={`text-${kpi.color}-500`}>{kpi.sub}</span>
                                </p>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    
                    {/* Attendance Trends (2/3 width) */}
                    <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-2xl p-10 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Attendance Trends</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Daily present vs absent over the last 14 days</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-600"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Present</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Absent</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[350px]">
                                <Bar data={trendData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }} />
                            </div>
                        </div>
                    </div>

                    {/* Action Needed Panel (1/3 width) */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-8 pb-4 border-b border-slate-50">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <FaBell className="text-amber-500" /> Action Needed
                            </h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{pendingLeaves.length + (kpis.lateToday > 0 ? 1 : 0)} pending alerts require attention</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                             {/* Late Alert */}
                             {kpis.lateToday > 0 && (
                                <div className="p-4 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                                        <FaClock size={16} />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black text-amber-900 uppercase tracking-tight">Late Pulse Detected</h5>
                                        <p className="text-[11px] font-bold text-amber-700/80 leading-tight mt-0.5">{kpis.lateToday} employees arrived &gt; 15 mins late today.</p>
                                    </div>
                                </div>
                             )}

                             {/* Pending Leaves */}
                             {pendingLeaves.map(leave => (
                                <div key={leave._id} className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 flex gap-4 items-start hover:bg-green-50/30 transition-colors group">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all">
                                        <FaFileAlt size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">{leave.employeeName}</h5>
                                        <p className="text-[11px] font-bold text-slate-400/80 leading-tight mt-0.5">Pending: {leave.leaveType} request for {moment(leave.startDate).format("MMM D")}.</p>
                                    </div>
                                    <FaChevronRight className="text-slate-200 mt-3 shrink-0" size={12} />
                                </div>
                             ))}

                             {pendingLeaves.length === 0 && !kpis.lateToday && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                                    <FaCheckCircle size={48} className="text-green-500 mb-4" />
                                    <p className="font-black text-xs uppercase tracking-widest">All caught up!</p>
                                </div>
                             )}
                        </div>
                        <div className="p-8 pt-4">
                            <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[3px] transition-all border border-slate-100">Open Helpdesk Tickets</button>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Recent Leave Requests Table (2/3 width) */}
                    <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Recent Leave Requests</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Latest applications needing attention</p>
                            </div>
                            <button className="text-green-600 font-black text-[10px] uppercase tracking-widest hover:underline">View All &rarr;</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Type</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLeaves.length === 0 ? (
                                        <tr><td colSpan={4} className="py-16 text-center font-bold text-slate-300">No recent applications</td></tr>
                                    ) : recentLeaves.map(leave => (
                                        <tr key={leave._id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-4 font-extrabold text-sm text-slate-700">{leave.employeeName}</td>
                                            <td className="px-6 py-4 font-bold text-slate-500 text-xs">{leave.leaveType}</td>
                                            <td className="px-6 py-4 font-bold text-slate-500 text-xs">{moment(leave.startDate).format("MMM D")} - {moment(leave.endDate).format("MMM D")}</td>
                                            <td className="px-8 py-4 text-right">
                                                <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest ${leave.status === 'Approved' ? 'bg-green-50 text-green-600' : leave.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
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
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-8 py-10 flex flex-col items-center">
                        <div className="w-full text-left mb-10">
                            <h3 className="text-lg font-black text-slate-800">Department Headcount</h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Distribution of active employees</p>
                        </div>
                        <div className="w-56 h-56 relative mb-10">
                            <Doughnut data={deptData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-black text-slate-800 tracking-tighter">{kpis.totalEmployees}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Active</span>
                            </div>
                        </div>
                        <div className="w-full space-y-3 px-4">
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
                </div>

            </div>
        </section>
    );
};

export default HRMSDashboard;
