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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const MetricCard = ({ label, value, sub, icon: Icon, gradient, secondaryColor }) => (
    <div className="relative overflow-hidden rounded-[32px] transition-all duration-500 cursor-pointer group h-[160px] p-[1.5px] bg-gradient-to-br from-slate-100 to-slate-200 hover:from-green-400 hover:to-green-600 hover:scale-[1.02] shadow-sm hover:shadow-2xl hover:shadow-green-100 active:scale-95">
        <div className="w-full h-full rounded-[30.5px] p-6 relative overflow-hidden transition-colors duration-500 bg-white group-hover:bg-white/95 flex flex-col justify-between">
            {/* Subtle Background Icon */}
            <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 transform group-hover:scale-110 group-hover:-rotate-12 ${secondaryColor}`}>
                <Icon size={140} />
            </div>

            {/* Top Row: Label & Icon */}
            <div className="flex justify-between items-start relative z-10">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] block group-hover:text-green-600 transition-colors duration-300">
                    {label}
                </span>
                <div className={`p-3.5 rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${gradient} text-white`}>
                    <Icon size={18} />
                </div>
            </div>

            {/* Middle Row: Value (Horizontally aligned across all cards) */}
            <div className="relative z-10 flex items-center h-10">
                <h3 className={`${value?.toString().length > 5 ? 'text-lg' : 'text-3xl'} font-black text-slate-800 tracking-tighter transition-all duration-300`}>
                    {value}
                </h3>
            </div>

            {/* Bottom Row: Pinned Sub-text (Aligned across all cards) */}
            <div className="relative z-10 border-t border-slate-50 pt-2">
                <p className={`text-[10px] font-bold transition-colors duration-300 ${label === 'Absent' ? 'text-red-500' : label === 'Late pulse' ? 'text-amber-500' : label === 'Payroll Status' ? 'text-indigo-500' : 'text-green-500'} group-hover:text-green-600`}>
                    {sub}
                </p>
            </div>
            
            <div className="absolute top-4 right-16 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-25"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500/20"></span>
            </div>
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

    const handleGenerateReport = () => {
        if (!data) return;
        const doc = new jsPDF();
        const timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");

        // Header
        doc.setFillColor(22, 163, 74); // green-600
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("HRMS Dashboard Report", 15, 25);
        doc.setFontSize(10);
        doc.text(`Generated on: ${timestamp}`, 15, 32);

        // KPI Summary
        doc.setTextColor(51, 65, 85); // slate-700
        doc.setFontSize(16);
        doc.text("Summary KPIs", 15, 55);
        
        autoTable(doc, {
            startY: 60,
            head: [['Indicator', 'Value', 'Details']],
            body: [
                ['Total Employees', kpis.totalEmployees, 'Active in system'],
                ['Present Today', kpis.presentToday, `${((kpis.presentToday/kpis.totalEmployees)*100).toFixed(1)}% attendance`],
                ['Absent Today', kpis.absentToday, 'Including leaves'],
                ['Late Arrivals', kpis.lateToday, '> 15 mins late'],
                ['Payroll Status', kpis.payrollStatus, 'Current cycle']
            ],
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] }
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
            headStyles: { fillColor: [22, 163, 74] }
        });

        doc.save(`HRMS_Dashboard_Report_${moment().format("YYYYMMDD")}.pdf`);
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
                        <button onClick={handleGenerateReport} className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                             <FaFileAlt /> Generate Report
                        </button>
                        <button onClick={() => window.location.href='/admin/payroll-management'} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-green-200 transition-all flex items-center gap-2">
                             <FaMoneyCheckAlt /> Run Payroll
                        </button>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                    <MetricCard 
                        label="Total Employees" 
                        value={kpis.totalEmployees} 
                        sub="+12 this month" 
                        icon={FaUsers} 
                        gradient="bg-gradient-to-br from-teal-400 to-teal-600" 
                        secondaryColor="text-teal-600"
                    />
                    <MetricCard 
                        label="Present Today" 
                        value={kpis.presentToday} 
                        sub={`${((kpis.presentToday/kpis.totalEmployees)*100).toFixed(1)}% Attendance`} 
                        icon={FaUserCheck} 
                        gradient="bg-gradient-to-br from-green-400 to-green-600" 
                        secondaryColor="text-green-600"
                    />
                    <MetricCard 
                        label="Absent" 
                        value={kpis.absentToday} 
                        sub="Leaves + Unplanned" 
                        icon={FaUserTimes} 
                        gradient="bg-gradient-to-br from-rose-400 to-rose-600" 
                        secondaryColor="text-rose-600"
                    />
                    <MetricCard 
                        label="Late pulse" 
                        value={kpis.lateToday} 
                        sub="> 15 mins late" 
                        icon={FaClock} 
                        gradient="bg-gradient-to-br from-amber-400 to-amber-600" 
                        secondaryColor="text-amber-600"
                    />
                    <MetricCard 
                        label="Payroll Status" 
                        value={kpis.payrollStatus} 
                        sub="Due in 3 days" 
                        icon={FaMoneyCheckAlt} 
                        gradient="bg-gradient-to-br from-indigo-400 to-indigo-600" 
                        secondaryColor="text-indigo-600"
                    />
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
                                                <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest ${leave.status === 'APPROVED' ? 'bg-green-50 text-green-600' : leave.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
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
