"use client";

import React from "react";
import html2pdf from "html2pdf.js";
import { FaDownload, FaTimes } from "react-icons/fa";
import moment from "moment";

const PayslipPreview = ({ data, onClose }) => {
    const downloadPDF = () => {
        const element = document.getElementById('payslip-content');
        const opt = {
            margin: 10,
            filename: `Payslip_${data.employeeName}_${moment().format("MMM_YYYY")}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    if (!data) return null;

    const netSalaryWords = (n) => {
        // Simple placeholder for words conversion
        return "Only";
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[850px] rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest pl-2">Payslip Preview</h3>
                    <div className="flex gap-4">
                        <button onClick={downloadPDF} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100">
                            <FaDownload /> Download PDF
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2"><FaTimes /></button>
                    </div>
                </div>

                <div className="overflow-y-auto p-10 bg-slate-100/50">
                    <div id="payslip-content" className="bg-white p-12 border border-slate-200 shadow-sm mx-auto" style={{ width: '210mm', minHeight: '200mm' }}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-10 border-b-2 border-slate-800 pb-8">
                            <div>
                                <h1 className="text-[28px] font-black tracking-tighter text-slate-900">HRMS 2026</h1>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Human Resource Management Solutions</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-lg font-black text-slate-900 uppercase">Payslip</h2>
                                <p className="text-sm font-bold text-slate-500">{moment().format("MMMM YYYY")}</p>
                            </div>
                        </div>

                        {/* Employee Details */}
                        <div className="grid grid-cols-2 gap-y-4 mb-10 text-[11px]">
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Employee Name</span>
                                <span className="font-black text-slate-800 text-sm">{data.employeeName}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Employee ID</span>
                                <span className="font-black text-slate-800 text-sm">{data.employeeID}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Department</span>
                                <span className="font-black text-slate-800">{data.departmentName}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Paid Days</span>
                                <span className="font-black text-slate-800">{data.paidDays} (LOP: {data.lopDays})</span>
                            </div>
                        </div>

                        {/* Salary Table */}
                        <div className="grid grid-cols-2 gap-x-12 mb-10">
                            {/* Earnings */}
                            <div className="space-y-4">
                                <h4 className="font-black text-[10px] uppercase border-b border-slate-200 pb-2 text-slate-400 tracking-widest">Earnings</h4>
                                {data.earnings.map((e, index) => (
                                    <div key={index} className="flex justify-between text-[11px] font-bold text-slate-700">
                                        <span>{e.name}</span>
                                        <span>{e.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-[12px] font-black text-slate-900 pt-4 border-t border-slate-100 mt-4">
                                    <span>Gross Total</span>
                                    <span>{data.grossSalary.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="space-y-4">
                                <h4 className="font-black text-[10px] uppercase border-b border-slate-200 pb-2 text-slate-400 tracking-widest">Deductions</h4>
                                {data.deductions.map((d, index) => (
                                    <div key={index} className="flex justify-between text-[11px] font-bold text-slate-700">
                                        <span>{d.name}</span>
                                        <span>{d.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-[12px] font-black text-red-600 pt-4 border-t border-slate-100 mt-4">
                                    <span>Total Deductions</span>
                                    <span>{data.totalDeductions.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Salary Box */}
                        <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center mb-10">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Net Pay Amount</p>
                                <p className="text-xs font-bold italic opacity-80">{netSalaryWords(data.netSalary)}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-2xl font-black tracking-tight">{data.netSalary.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h3>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="flex justify-between items-end mt-20 pt-10 border-t border-slate-100">
                            <div className="text-center w-40">
                                <div className="h-[1px] bg-slate-300 mb-4"></div>
                                <p className="text-[9px] font-black uppercase text-slate-400">Employee Signature</p>
                            </div>
                            <div className="text-center w-40">
                                <div className="h-[1px] bg-slate-300 mb-4"></div>
                                <p className="text-[9px] font-black uppercase text-slate-400">Authorized Signatory</p>
                            </div>
                        </div>

                        <p className="text-center text-[9px] font-bold text-slate-300 mt-20 uppercase tracking-[4px]">Private & Confidential</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayslipPreview;
