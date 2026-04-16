"use client";

import React from "react";
import { MdPayments, MdCalculate, MdDescription } from "react-icons/md";

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

    const Toggle = ({ label, description, enabled, onChange }) => (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-sm hover:border-green-300 transition-all duration-200">
            <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-tight">{label}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-[#00a65a]' : 'bg-gray-300'}`}
            >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Cycle and Overtime */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdPayments size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Payroll Cycle & Overtime
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Salary Cycle</label>
                        <select
                            value={data.salaryCycle}
                            onChange={(e) => handleChange('salaryCycle', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all appearance-none cursor-pointer"
                        >
                            <option>Monthly</option>
                            <option>Bi-weekly</option>
                            <option>Weekly</option>
                        </select>
                    </div>
                    <Toggle
                        label="Enable Overtime"
                        description="Calculate pay for extra hours worked."
                        enabled={data.overtimeCalculation}
                        onChange={(val) => handleChange('overtimeCalculation', val)}
                    />
                </div>
            </div>

            {/* Tax Settings */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdCalculate size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Tax Deduction Settings
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Standard Deduction</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.taxDeductionSettings?.standardDeduction}
                                onChange={(e) => handleTaxChange('standardDeduction', parseInt(e.target.value))}
                                className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all"
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Per Year</span>
                            </div>
                        </div>
                    </div>
                    <Toggle
                        label="Professional Tax (PT)"
                        description="Automate state-specific PT deductions."
                        enabled={data.taxDeductionSettings?.ptaxEnabled}
                        onChange={(val) => handleTaxChange('ptaxEnabled', val)}
                    />
                </div>
            </div>

            {/* Distribution */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdDescription size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Payslip Generation
                    </h3>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 inline-block shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase tracking-tight text-gray-400">Generation Date</h4>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={data.payslipGenerationDate}
                                    onChange={(e) => handleChange('payslipGenerationDate', parseInt(e.target.value))}
                                    className="w-14 bg-white border border-gray-300 rounded-sm px-2 py-1 text-sm font-bold text-gray-800 outline-none focus:border-[#3c8dbc]"
                                />
                                <span className="text-xs font-bold text-gray-500 uppercase">of every month</span>
                            </div>
                        </div>
                        <div className="hidden sm:block h-10 w-[1px] bg-gray-200" />
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#00a65a] bg-green-50 px-2 py-0.5 rounded-sm border border-green-100 italic">Automated Distribution</span>
                            <p className="text-[10px] text-gray-400 mt-1">Next schedule: May {data.payslipGenerationDate}, 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollSettings;
