"use client";
import React, { useState } from "react";
import ProcessingFlow from "@/widgets/payrollManagement/ProcessingFlow";
import SalaryStructure from "@/widgets/payrollManagement/SalaryStructure";

const PayrollManagementPage = () => {
    const [activeTab, setActiveTab] = useState("processing");

    return (
        <section className="p-6 md:p-10 bg-slate-50/30 min-h-screen">
            {/* Header Area */}
            <div className="max-w-[1400px] mx-auto mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-slate-200">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Payroll <span className="text-green-600">Command Center</span></h1>
                        <p className="text-slate-400 font-bold text-sm mt-1">Manage salary structures, monthly disbursements, and compliance.</p>
                    </div>
                </div>

                {/* Module Tabs */}
                <div className="flex gap-1 bg-slate-200/50 p-1.5 rounded-[22px] w-fit mt-10 shadow-inner border border-slate-200">
                    <button 
                         onClick={() => setActiveTab("processing")}
                         className={`px-10 py-3 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'processing' ? 'bg-white text-green-600 shadow-xl shadow-green-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >Processing Flow</button>
                    <button 
                         onClick={() => setActiveTab("structures")}
                         className={`px-10 py-3 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'structures' ? 'bg-white text-green-600 shadow-xl shadow-green-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >Salary Structures</button>
                    <button 
                         onClick={() => setActiveTab("compliance")}
                         className={`px-10 py-3 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'compliance' ? 'bg-white text-green-600 shadow-xl shadow-green-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >Compliance & Exports</button>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto">
                {activeTab === 'processing' && <ProcessingFlow />}
                {activeTab === 'structures' && <SalaryStructure />}
                {activeTab === 'compliance' && (
                    <div className="bg-white rounded-[40px] border border-slate-100 border-dashed p-20 flex flex-col items-center justify-center text-center shadow-xl">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                            <span className="text-4xl">📄</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Statutory Reporting Hub</h3>
                        <p className="text-slate-400 font-bold text-sm max-w-sm">PF registers, ESIC contribution sheets, and Pro-Tax reports will be generated here after batch finalization.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PayrollManagementPage;
