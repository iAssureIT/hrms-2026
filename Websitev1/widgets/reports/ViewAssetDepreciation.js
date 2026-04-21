"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import { FaSpinner, FaPrint, FaArrowLeft } from "react-icons/fa";
import { MdDescription, MdDateRange, MdTimeline, MdInfo, MdAccountBalance, MdTrendingDown, MdCurrencyRupee } from "react-icons/md";
import {
    HiCurrencyRupee
} from "react-icons/hi2";



const ViewAssetDepreciation = ({ assetId }) => {
    const router = useRouter();
    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }));
    const [assetData, setAssetData] = useState(null);
    const [projectionData, setProjectionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const printRef = useRef(null);

    useEffect(() => {
        if (assetId) {
            fetchProjections();
        }
    }, [assetId]);

    const fetchProjections = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reports/get/asset-projection/${assetId}`);
            if (response.data.success) {
                setAssetData(response.data.assetData);
                setProjectionData(response.data.projections);
            }
        } catch (error) {
            console.error("Error fetching projections:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatToINR = (num) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const handlePrint = async () => {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = printRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Depreciation_${assetData?.assetID}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                letterRendering: true,
                scrollY: 0,
                scrollX: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        // Add a temporary class to fix dimensions during capture
        element.classList.add('pdf-capture');
        
        // Hide the absolute green bar at the bottom during capture to prevent overlap
        const footerBar = element.querySelector('.absolute.bottom-0');
        if (footerBar) footerBar.style.display = 'none';

        html2pdf().from(element).set(opt).save().then(() => {
            element.classList.remove('pdf-capture');
            if (footerBar) footerBar.style.display = 'block';
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FaSpinner className="animate-spin text-[#3c8dbc]" size={40} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Generating Valuation Report...</p>
        </div>
    );

    if (!assetData) return <div className="p-20 text-center font-bold text-red-500">Asset Data Not Found</div>;

    return (
        <div className="bg-slate-50 min-h-screen p-4 md:p-8">
            {/* Control Bar */}
            <div className="max-w-[1000px] mx-auto mb-6 flex flex-wrap justify-between items-center gap-4 no-print">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                    <FaArrowLeft /> Back to Report
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-95"
                    >
                        <FaPrint size={14} /> Download PDF Report
                    </button>
                </div>
            </div>

            {/* Printable Report Area */}
            <div
                ref={printRef}
                className="max-w-[850px] mx-auto bg-white shadow-2xl border border-slate-200 p-8 md:p-12 relative overflow-hidden rounded-3xl print-container"
            >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#3c8dbc] rounded-xl flex items-center justify-center shadow-lg">
                             <span className="text-white font-black text-2xl italic tracking-tighter">H</span>
                        </div>
                        <div className="border-l-2 border-slate-100 pl-4">
                            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">HRMS 2026</h1>
                            <p className="text-[10px] font-black text-[#3c8dbc] uppercase tracking-[0.2em] mt-1.5">Asset Depreciation Detail</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Written Down Value (WDV) Analysis</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 italic">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Generated On</p>
                            <p className="text-[10px] font-black text-slate-700">{moment().format("DD MMMM YYYY")}</p>
                        </div>
                    </div>
                </div>

                {/* Asset Identity Banner */}
                <div className="bg-[#3c8dbc] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl mb-10">
                    <div className="absolute -right-6 -bottom-6 text-white/10 rotate-12">
                         <MdAccountBalance size={140} />
                    </div>
                    <div className="relative z-10 flex justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner">
                                <MdDescription size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight leading-none">{assetData.assetName}</h2>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-3 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-white/20 rounded text-white italic">REGISTRY ID</span>
                                    <span className="font-mono text-white text-xs">{assetData.assetID}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Depreciation Rate</p>
                             <p className="text-[12px] font-black text-white px-2 py-1 bg-white/10 rounded-lg mt-1 inline-block italic">
                                 {assetData.appliedRatePercent ? `${assetData.appliedRatePercent}%` : "No depreciation added"}
                             </p>
                        </div>
                    </div>
                </div>

                {/* Projection Table Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-1.5 bg-amber-50 text-amber-500 rounded-xl border border-amber-100">
                            <MdTimeline size={16} />
                        </div>
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Depreciation Projections (WDV)</h3>
                    </div>

                    <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-100">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f8fafc]">
                                <tr>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Financial Period</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Opening NBV</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Depreciation</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Closing Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-emerald-50/30">
                                    <td className="px-6 py-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-black text-emerald-800 uppercase">Current Status</span>
                                            <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[7px] font-black rounded uppercase">Live</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-b border-slate-100 text-right">
                                        <span className="text-[11px] font-black text-slate-800">{formatToINR(assetData.originalCost)}</span>
                                    </td>
                                    <td className="px-6 py-4 border-b border-slate-100 text-right">
                                        <span className="text-[11px] font-black text-amber-600 italic">({formatToINR(assetData.originalCost - assetData.currentValue)})</span>
                                    </td>
                                    <td className="px-6 py-4 border-b border-slate-100 text-right">
                                        <span className="text-[13px] font-black text-emerald-700">{formatToINR(assetData.currentValue)}</span>
                                    </td>
                                </tr>

                                {projectionData.map((proj, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-all border-b border-slate-100">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                <span className="text-[11px] font-extrabold text-slate-700">{proj.financialYear}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-500">
                                            {formatToINR(proj.openingNBV)}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <span className="text-[11px] font-black text-amber-500">({formatToINR(proj.depreciation)})</span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <span className="text-[11px] font-black text-slate-800">{formatToINR(proj.closingNBV)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="flex justify-between items-end gap-10 footer-notes">
                    <div className="flex-1">
                        <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <MdInfo className="text-[#3c8dbc] shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Valuation Principles</h4>
                                <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">
                                    Depreciation is calculated using the Reducing Balance Method (WDV) based on statutory rates.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right min-w-[200px]">
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-2">End of Valuation Report</p>
                        <p className="text-[9px] font-black text-slate-400 font-mono tracking-tighter opacity-60">REF: HRMS-{assetData.assetID}-WDV</p>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#3c8dbc]"></div>
            </div>

            <style jsx>{`
                .no-print { display: flex; }
                .pdf-capture { 
                    width: 700px !important; 
                    margin: 0 !important;
                    padding: 30px !important;
                    box-shadow: none !important;
                    border: none !important;
                    border-radius: 0 !important;
                }
                .pdf-capture table td, .pdf-capture table th {
                    padding-top: 8px !important;
                    padding-bottom: 8px !important;
                }
                .pdf-capture .footer-notes {
                    margin-top: 20px !important;
                }
                
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                    .print-container { 
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ViewAssetDepreciation;
