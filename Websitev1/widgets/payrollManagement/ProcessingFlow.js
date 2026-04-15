"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaCalculator, FaCheckCircle, FaChevronRight, FaChevronLeft, FaSearch, FaFilter, FaFilePdf, FaCog, FaUndo } from "react-icons/fa";
import moment from "moment";
import Swal from "sweetalert2";
import ls from "localstorage-slim";
import PayslipPreview from "./PayslipPreview";

const ProcessingFlow = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [payrollData, setPayrollData] = useState([]);
    const [batchInfo, setBatchInfo] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [userDetails, setUserDetails] = useState(null);
    const [previewData, setPreviewData] = useState(null);

    const months = moment.months().map((m, i) => ({ value: i + 1, label: m }));
    const years = Array.from({ length: 5 }, (_, i) => moment().year() - i);

    useEffect(() => {
        const details = ls.get("userDetails", { decrypt: true });
        setUserDetails(details);
    }, []);

    const fetchBatchData = async (m, y) => {
        try {
            setLoading(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payroll/post/batch-data`, { month: m, year: y });
            if (res.data.success) {
                setPayrollData(res.data.data);
                setBatchInfo(res.data.batch);
                setStep(2);
            } else {
                setPayrollData([]);
                setBatchInfo(null);
                setStep(1);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const initiateRun = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payroll/post/initiate`, {
                month: selectedMonth,
                year: selectedYear,
                user_id: userDetails._id
            });
            if (res.data.success) {
                Swal.fire("Calculated", `Processed ${res.data.totalRecords} employee records.`, "success");
                fetchBatchData(selectedMonth, selectedYear);
            }
        } catch (err) {
            Swal.fire("Error", "Payroll calculation failed", "error");
        } finally { setLoading(false); }
    };

    const approveBatch = async () => {
        const result = await Swal.fire({
            title: "Finalize Payroll?",
            text: "This will mark salaries as approved for payment.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            confirmButtonText: "Yes, Approve & Finalize"
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payroll/post/approve`, {
                    batch_id: batchInfo._id,
                    user_id: userDetails._id
                });
                if (res.data.success) {
                    Swal.fire("Success", "Payroll batch finalized!", "success");
                    setStep(3);
                    setBatchInfo(res.data.batch);
                }
            } catch (err) {
                Swal.fire("Error", "Approval failed", "error");
            } finally { setLoading(false); }
        }
    };

    const filteredData = payrollData.filter(p => 
        p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.employeeID.includes(searchQuery)
    );

    const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

    return (
        <section className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 mb-10 overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto">
                {/* Stepper Wizard */}
                <div className="flex items-center justify-center gap-6 mb-16 px-10">
                        {[
                            { n: 1, l: "Select Month", i: FaCalendarAlt },
                            { n: 2, l: "Review & Calculate", i: FaCalculator },
                            { n: 3, l: "Finalize & Payout", i: FaCheckCircle },
                        ].map((s, idx) => (
                            <React.Fragment key={s.n}>
                                <div className={`flex flex-col items-center gap-4 transition-all duration-500 ${step >= s.n ? 'opacity-100 scale-110' : 'opacity-30 scale-100'}`}>
                                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 ${step >= s.n ? 'bg-green-600 text-white shadow-xl shadow-green-200 ring-4 ring-green-50' : 'bg-slate-100 text-slate-400'}`}>
                                        <s.i size={24} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.n ? 'text-green-600' : 'text-slate-400'}`}>{s.n}. {s.l}</span>
                                </div>
                                {idx < 2 && <div className={`h-[2px] w-24 md:w-40 rounded-full transition-colors duration-700 ${step > s.n ? 'bg-green-600' : 'bg-slate-100'}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1: Selection */}
                    {step === 1 && (
                        <div className="flex flex-col items-center py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="flex flex-col md:flex-row gap-6 mb-12">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payroll Month</label>
                                    <select 
                                        className="w-full md:w-64 bg-slate-50 border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:ring-green-500/20"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    >
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payroll Year</label>
                                    <select 
                                        className="w-full md:w-64 bg-slate-50 border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:ring-green-500/20"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    >
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={initiateRun} disabled={loading} className="bg-green-600 text-white px-12 py-4.5 rounded-[20px] font-black text-sm shadow-2xl shadow-green-200 hover:bg-green-700 transition-all active:scale-95 disabled:bg-slate-300">
                                    {loading ? 'Processing...' : 'Generate New Batch'}
                                </button>
                                <button onClick={() => fetchBatchData(selectedMonth, selectedYear)} className="bg-slate-800 text-white px-12 py-4.5 rounded-[20px] font-black text-sm shadow-xl hover:bg-slate-900 transition-all active:scale-95">
                                    Load Existing Batch
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Review Table */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-700">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                                <div className="text-center md:text-left">
                                    <h2 className="text-xl font-black text-slate-800">{moment([selectedYear, selectedMonth - 1]).format("MMMM YYYY")} Payroll Batch</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Reviewing {payrollData.length} records</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input 
                                            type="text" 
                                            placeholder="Search employee..." 
                                            className="bg-slate-50 border-slate-200 pl-12 pr-6 py-3 rounded-2xl text-sm font-bold w-64 focus:ring-green-500/20"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button onClick={initiateRun} className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                                        <FaUndo /> Recalculate All
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-slate-100 rounded-[32px]">
                                <table className="w-full text-left bg-white border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Employee</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Paid/LOP</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Gross Salary</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right text-red-400">Deductions</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right text-green-600 font-extrabold">Net Salary</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map(p => (
                                            <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                                <td className="px-8 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-extrabold text-slate-700">{p.employeeName}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">{p.employeeID} • {p.departmentName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg font-black text-[10px]">{p.paidDays}</span>
                                                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-black text-[10px]">{p.lopDays}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-600 text-sm">{formatter.format(p.grossSalary)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-red-400 text-sm">-{formatter.format(p.totalDeductions)}</td>
                                                <td className="px-6 py-4 text-right font-black text-green-600 text-sm">{formatter.format(p.netSalary)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => setPreviewData(p)}
                                                        className="text-green-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 mx-auto hover:underline"
                                                    >
                                                        <FaFilePdf size={12}/> Preview
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-12 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 p-8 rounded-[32px] border border-dashed border-slate-200">
                                <div>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Total Net Payout</p>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{formatter.format(batchInfo?.totalNetPayout)}</h3>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="px-8 font-black text-slate-400 hover:text-slate-600 text-[10px] uppercase tracking-widest">Back</button>
                                    <button onClick={approveBatch} className="bg-green-600 text-white px-12 py-4.5 rounded-[20px] font-black text-sm shadow-2xl shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex items-center gap-3">
                                        Approve & Finalize <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payout */}
                    {step === 3 && (
                        <div className="text-center py-20 animate-in zoom-in duration-700 flex flex-col items-center">
                            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[28px] flex items-center justify-center mb-10 ring-8 ring-green-50/50">
                                <FaCheckCircle size={56} />
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Payroll Finalized!</h2>
                            <p className="text-slate-400 font-bold max-w-sm mx-auto mb-12">Total payout of <span className="text-slate-800">{formatter.format(batchInfo?.totalNetPayout)}</span> has been approved for {moment([batchInfo?.year, batchInfo?.month - 1]).format("MMMM YYYY")}.</p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button className="bg-slate-800 text-white px-10 py-4.5 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-900 transition-all">Download All Payslips</button>
                                <button className="bg-green-600 text-white px-10 py-4.5 rounded-2xl font-black text-sm shadow-2xl shadow-green-200 hover:bg-green-700 transition-all">Export Bank Sheet</button>
                            </div>
                        </div>
                    )}
                </div>

                {previewData && <PayslipPreview data={previewData} onClose={() => setPreviewData(null)} />}
        </section>
    );
};

export default ProcessingFlow;
