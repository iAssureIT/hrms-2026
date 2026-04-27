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
        <div className="admin-box box-primary mb-10 overflow-hidden relative">
            <div className="p-6">
                {/* Stepper Wizard */}
                <div className="flex items-center justify-center gap-6 mb-10">
                    {[
                        { n: 1, l: "Select Month", i: FaCalendarAlt },
                        { n: 2, l: "Review & Calculate", i: FaCalculator },
                        { n: 3, l: "Finalize & Payout", i: FaCheckCircle },
                    ].map((s, idx) => (
                        <React.Fragment key={s.n}>
                            <div className={`flex flex-col items-center gap-2 ${step >= s.n ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= s.n ? 'bg-[#3c8dbc] border-[#3c8dbc] text-white' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                                    <s.i size={16} />
                                </div>
                                <span className={`text-[12px] font-bold uppercase tracking-wide ${step >= s.n ? 'text-[#3c8dbc]' : 'text-gray-400'}`}>{s.n}. {s.l}</span>
                            </div>
                            {idx < 2 && <div className={`h-[2px] w-16 md:w-32 ${step > s.n ? 'bg-[#3c8dbc]' : 'bg-gray-200'}`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Selection */}
                {step === 1 && (
                    <div className="flex flex-col items-center py-6">
                        <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-2xl justify-center">
                            <div className="admin-form-group w-full md:w-1/2">
                                <label className="admin-label">Payroll Month</label>
                                <select
                                    className="admin-select"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                >
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group w-full md:w-1/2">
                                <label className="admin-label">Payroll Year</label>
                                <select
                                    className="admin-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={initiateRun} disabled={loading} className="admin-btn-primary px-8 py-2 font-bold disabled:opacity-50">
                                {loading ? 'Processing...' : 'Generate New Batch'}
                            </button>
                            <button onClick={() => fetchBatchData(selectedMonth, selectedYear)} className="border border-[#d2d6de] bg-white text-[#444] hover:bg-gray-50 px-8 py-2 rounded-sm font-bold shadow-sm transition-all active:scale-95 text-sm">
                                Load Existing Batch
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Review Table */}
                {step === 2 && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-t border-slate-100 pt-6">
                            <div className="text-center md:text-left">
                                <h2 className="admin-heading mb-1">{moment([selectedYear, selectedMonth - 1]).format("MMMM YYYY")} Payroll Batch</h2>
                                <p className="admin-subheading">Reviewing {payrollData.length} records</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                    <input
                                        type="text"
                                        placeholder="Search employee..."
                                        className="admin-input pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button onClick={initiateRun} className="border border-[#d2d6de] bg-white text-[#444] hover:bg-gray-50 px-4 py-1.5 rounded-sm font-bold shadow-sm flex items-center gap-2 text-sm transition-all active:scale-95">
                                    <FaUndo size={12} /> Recalculate All
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-[#d2d6de]">
                            <table className="admin-table">
                                <thead className="admin-table-thead bg-gray-50">
                                    <tr>
                                        <th className="admin-table-th">Employee</th>
                                        <th className="admin-table-th text-center">Paid/LOP</th>
                                        <th className="admin-table-th text-right">Gross Salary</th>
                                        <th className="admin-table-th text-right text-red-500">Deductions</th>
                                        <th className="admin-table-th text-right text-[#3c8dbc]">Net Salary</th>
                                        <th className="admin-table-th text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map(p => (
                                        <tr key={p._id} className="hover:bg-gray-50 border-b border-[#f4f4f4]">
                                            <td className="admin-table-td">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800">{p.employeeName}</span>
                                                    <span className="text-[11px] text-gray-500">{p.employeeID} • {p.departmentName}</span>
                                                </div>
                                            </td>
                                            <td className="admin-table-td text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[11px] font-bold" title="Paid Days">{p.paidDays}</span>
                                                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px] font-bold" title="LOP Days">{p.lopDays}</span>
                                                </div>
                                            </td>
                                            <td className="admin-table-td text-right font-bold text-gray-700">{formatter.format(p.grossSalary)}</td>
                                            <td className="admin-table-td text-right font-bold text-red-500">-{formatter.format(p.totalDeductions)}</td>
                                            <td className="admin-table-td text-right font-bold text-[#3c8dbc]">{formatter.format(p.netSalary)}</td>
                                            <td className="admin-table-td text-center">
                                                <button
                                                    onClick={() => setPreviewData(p)}
                                                    className="text-[#3c8dbc] font-bold text-[11px] flex items-center gap-1 mx-auto hover:underline"
                                                >
                                                    <FaFilePdf size={12} /> Preview
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 border border-[#d2d6de]">
                            <div>
                                <p className="admin-subheading">Total Net Payout</p>
                                <h3 className="text-2xl font-bold text-gray-800">{formatter.format(batchInfo?.totalNetPayout)}</h3>
                            </div>
                            <div className="flex gap-4 items-center">
                                <button onClick={() => setStep(1)} className="font-bold text-[#3c8dbc] hover:underline text-sm">Back to Selection</button>
                                <button onClick={approveBatch} disabled={loading} className="admin-btn-primary px-8 py-2 disabled:opacity-50 flex items-center gap-2">
                                    Approve & Finalize <FaChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Payout */}
                {step === 3 && (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#00a65a] text-white rounded-full flex items-center justify-center mb-6">
                            <FaCheckCircle size={40} />
                        </div>
                        <h2 className="admin-heading text-2xl mb-2">Payroll Finalized!</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Total payout of <span className="font-bold text-gray-800">{formatter.format(batchInfo?.totalNetPayout)}</span> has been approved for {moment([batchInfo?.year, batchInfo?.month - 1]).format("MMMM YYYY")}.</p>
                        <div className="flex gap-4 justify-center">
                            <button className="border border-[#d2d6de] bg-white text-[#444] hover:bg-gray-50 px-6 py-2 rounded-sm font-bold shadow-sm text-sm active:scale-95 transition-all">Download All Payslips</button>
                            <button className="admin-btn-primary px-6 py-2">Export Bank Sheet</button>
                        </div>
                    </div>
                )}
            </div>

            {previewData && <PayslipPreview data={previewData} onClose={() => setPreviewData(null)} />}
        </div>
    );
};

export default ProcessingFlow;
