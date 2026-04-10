"use client";

import React from "react";
import { MdPayments, MdCalculate, MdDescription, MdAccountBalance } from "react-icons/md";

const PayrollSettings = ({ data, updateData }) => {
    const handleChange = (field, value) => {
        updateData('payroll', { ...data, [field]: value });
    };

    const handleTaxChange = (field, value) => {
        updateData('payroll', {
            ...data,
            taxDeductionSettings: { ...(data.taxDeductionSettings || {}), [field]: value }
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Cycle and Overtime */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                            <MdPayments size={20} />
                        </div>
                        Payroll Cycle & Overtime
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Configure when and how payroll is processed.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pl-1">Salary Cycle</label>
                        <select
                            value={data.salaryCycle}
                            onChange={(e) => handleChange('salaryCycle', e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-300 outline-none"
                        >
                            <option>Monthly</option>
                            <option>Bi-weekly</option>
                            <option>Weekly</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">Enable Overtime</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Calculate pay for extra hours worked.</p>
                        </div>
                        <button
                            onClick={() => handleChange('overtimeCalculation', !data.overtimeCalculation)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.overtimeCalculation ? 'bg-green-600' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.overtimeCalculation ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tax Settings */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                            <MdCalculate size={20} />
                        </div>
                        Tax Deduction Settings
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Configure statutory deductions and tax rules.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pl-1">Standard Deduction</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.taxDeductionSettings?.standardDeduction}
                                onChange={(e) => handleTaxChange('standardDeduction', parseInt(e.target.value))}
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:border-green-500 outline-none"
                            />
                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Per Year</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">Professional Tax (PT)</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Automate state-specific PT deductions.</p>
                        </div>
                        <button
                            onClick={() => handleTaxChange('ptaxEnabled', !data.taxDeductionSettings?.ptaxEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.taxDeductionSettings?.ptaxEnabled ? 'bg-green-600' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.taxDeductionSettings?.ptaxEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Distribution */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                            <MdDescription size={20} />
                        </div>
                        Payslip Generation
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Automate payslip distribution to employees.</p>
                </div>

                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 inline-block">
                    <div className="flex items-center gap-6">
                        <div className="space-y-1">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Generation Date</h4>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={data.payslipGenerationDate}
                                    onChange={(e) => handleChange('payslipGenerationDate', parseInt(e.target.value))}
                                    className="w-16 bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-black text-slate-800 outline-none focus:border-green-500"
                                />
                                <span className="text-sm font-bold text-slate-500">of every month</span>
                            </div>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-200" />
                        <div className="space-y-1 text-center">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">Automated</h4>
                            <p className="text-[10px] text-slate-400 mt-1">Next: May {data.payslipGenerationDate}, 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollSettings;
