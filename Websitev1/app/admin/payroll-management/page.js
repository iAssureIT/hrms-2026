"use client";
import React, { useState } from "react";
import ProcessingFlow from "@/widgets/payrollManagement/ProcessingFlow";
import SalaryStructure from "@/widgets/payrollManagement/SalaryStructure";

const PayrollManagementPage = () => {
    const [activeTab, setActiveTab] = useState("processing");

    return (
        <section className="section p-6 md:p-10 bg-white min-h-screen">
            <div className="max-w-[1400px] mx-auto">

                {/* ── Page Header ── */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-green-600">Payroll Management</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Payroll <span className="text-green-600 font-black">Command Center</span>
                            </h1>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                        Manage salary structures, monthly disbursements, and statutory compliance across the organization.
                    </p>
                </div>

                {/* ── Module Tab Toggle ── */}
                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-[22px] w-fit mb-10 shadow-inner border border-slate-200">
                    {[
                        { id: "processing", label: "Processing Flow" },
                        { id: "structures", label: "Salary Structures" },
                        { id: "compliance", label: "Compliance & Exports" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-2.5 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all duration-200 active:scale-95 ${
                                activeTab === tab.id
                                    ? "bg-white text-green-600 shadow-lg shadow-slate-200 border border-slate-100"
                                    : "text-slate-500 hover:text-green-600 hover:bg-white/60"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                {activeTab === "processing" && <ProcessingFlow />}
                {activeTab === "structures" && <SalaryStructure />}
                {activeTab === "compliance" && (
                    <div className="bg-white rounded-[40px] border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/50">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-inner border border-slate-100">
                            <span className="text-4xl">📄</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Statutory Reporting Hub</h3>
                        <p className="text-slate-400 font-bold text-sm max-w-sm leading-relaxed">
                            PF registers, ESIC contribution sheets, and Pro-Tax reports will be generated here after batch finalization.
                        </p>
                    </div>
                )}

            </div>
        </section>
    );
};

export default PayrollManagementPage;
