"use client";
import React, { useState } from "react";
import ProcessingFlow from "@/widgets/payrollManagement/ProcessingFlow";
import SalaryStructure from "@/widgets/payrollManagement/SalaryStructure";

const PayrollManagementPage = () => {
    const [activeTab, setActiveTab] = useState("processing");

    return (
        <section className="section bg-[#f4f6f9] min-h-screen">
            <div className="mx-auto w-full px-4 mb-10">

                {/* ── Page Header ── */}
                <section className="content-header mb-4 pt-4">
                    <h1 className="admin-heading">Payroll Management</h1>
                </section>

                {/* ── Module Tab Toggle ── */}
                <div className="flex mb-6 border-b border-[#d2d6de]">
                    {[
                        { id: "processing", label: "Processing Flow" },
                        { id: "structures", label: "Salary Structures" },
                        { id: "compliance", label: "Compliance & Exports" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2 text-[13px] font-bold uppercase tracking-wide transition-colors ${
                                activeTab === tab.id
                                    ? "bg-white text-[#3c8dbc] border-t-[3px] border-l border-r border-[#d2d6de] border-t-[#3c8dbc] border-b-white -mb-[1px]"
                                    : "text-[#555] hover:text-[#3c8dbc] bg-[#f4f6f9] border border-transparent"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                <div className="w-full">
                    {activeTab === "processing" && <ProcessingFlow />}
                    {activeTab === "structures" && <SalaryStructure />}
                    {activeTab === "compliance" && (
                        <div className="admin-box box-primary p-16 flex flex-col items-center justify-center text-center">
                            <div className="text-[#3c8dbc] mb-4">
                                <span className="text-5xl">📄</span>
                            </div>
                            <h3 className="text-[18px] font-normal text-[#444] mb-2" style={{fontFamily: "'Source Sans Pro', sans-serif"}}>Statutory Reporting Hub</h3>
                            <p className="text-[#666] text-sm max-w-sm leading-relaxed">
                                PF registers, ESIC contribution sheets, and Pro-Tax reports will be generated here after batch finalization.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default PayrollManagementPage;
