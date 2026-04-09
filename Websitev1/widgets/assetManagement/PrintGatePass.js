"use client";

import React, { useState, useEffect, useRef } from "react";
import ls from "localstorage-slim";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaSpinner, FaPrint, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import moment from "moment";
import html2pdf from "html2pdf.js";

const PrintGatePass = ({ passId }) => {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [loggedInRole, setLoggedInRole] = useState("");
    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }));
    const printRef = useRef(null);

    useEffect(() => {
        const path = window.location.pathname;
        const role = path.includes("admin") ? "admin" :
            path.includes("center") ? "center" :
                path.includes("asset") ? "asset" :
                    path.includes("account") ? "account" : "executive";
        setLoggedInRole(role);
    }, []);

    useEffect(() => {
        if (passId) {
            fetchDetails();
        }
    }, [passId]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gate-pass/get/details/${passId}`);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        const confirm = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${action} this gate pass?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Yes, ${action} it!`,
            confirmButtonColor: action === 'approve' ? '#10b981' : '#ef4444'
        });

        if (confirm.isConfirmed) {
            setIsActionLoading(true);
            try {
                const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gate-pass/patch/${action}/${passId}`, {
                    user_id: userDetails?._id
                });
                if (res.data.success) {
                    Swal.fire("Success", `Gate pass ${action}d successfully`, "success");
                    fetchDetails();
                }
            } catch (error) {
                console.error(`Error ${action}ing gate pass:`, error);
                Swal.fire("Error", `Failed to ${action} gate pass`, "error");
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    const handlePrint = () => {
        const element = printRef.current;
        const opt = {
            margin: [0.2, 0.2, 0.2, 0.2],
            filename: `GatePass_${data?.passNo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FaSpinner className="animate-spin text-green-600" size={40} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Generating Secure Data...</p>
        </div>
    );

    if (!data) return <div className="p-20 text-center font-bold text-red-500">Gate Pass Not Found</div>;

    return (
        <div className="bg-slate-50 min-h-screen p-4 md:p-8">
            {/* Control Bar */}
            <div className="max-w-[800px] mx-auto mb-6 flex flex-wrap justify-between items-center gap-4 no-print">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                    <FaArrowLeft /> Exit View
                </button>

                <div className="flex items-center gap-2">
                    {data.status === "Pending" && (loggedInRole === "admin" || loggedInRole === "center") && (
                        <>
                            <button
                                onClick={() => handleAction('approve')}
                                disabled={isActionLoading}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isActionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Approve Pass
                            </button>
                            <button
                                onClick={() => handleAction('reject')}
                                disabled={isActionLoading}
                                className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs shadow-md shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isActionLoading ? <FaSpinner className="animate-spin" /> : <span className="text-lg">×</span>} Reject Pass
                            </button>
                        </>
                    )}
                    <button
                        onClick={handlePrint}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-95"
                    >
                        <FaPrint size={12} /> Print/Download
                    </button>
                </div>
            </div>

            {/* Printable Area */}
            <div
                ref={printRef}
                className="max-w-[800px] mx-auto bg-white shadow-2xl border border-slate-200 p-8 md:p-10 relative overflow-hidden"
                style={{ width: '100%', minHeight: 'auto' }}
            >
                {/* Logo & Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <img
                            src="/images/specific/logo.webp"
                            alt="Lupin Foundation Logo"
                            className="h-16 w-auto object-contain"
                        />
                        <div className="hidden">
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">LUPIN FOUNDATION</h1>
                        </div>
                        <div className="border-l-2 border-slate-100 pl-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Management</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Official Security Document</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${data.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {data.status === 'Approved' && <FaCheckCircle size={10} />}
                            Status: {data.status}
                        </div>
                    </div>
                </div>

                <div className="bg-green overflow-hidden relative shadow-2xl text-center py-4 px-6 rounded-xl mb-10 text-white">
                    <div className="absolute top-0 left-0 w-2 h-full bg-white/20"></div>
                    <h2 className="text-xl font-black tracking-[0.15em] mb-1">ASSET GATE PASS</h2>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-none">Voucher ID: {data.passNo}</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 border-l-4 border-green-600 pl-2">Pass Details</h3>
                            <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                                <span className="text-slate-400 font-bold">Pass ID:</span>
                                <span className="text-slate-800 font-extrabold">{data.passNo}</span>
                                <span className="text-slate-400 font-bold">Issued At:</span>
                                <span className="text-slate-800 font-extrabold">{moment(data.createdAt).format("DD-MMM-YYYY HH:mm")}</span>
                                <span className="text-slate-400 font-bold">Gate Loc:</span>
                                <span className="text-slate-800 font-extrabold">{data.gateLocation || "Main Gate"}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 border-l-4 border-slate-300 pl-2">Bearer Details</h3>
                            <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                                <span className="text-slate-400 font-bold">Full Name:</span>
                                <span className="text-slate-800 font-extrabold">{data.bearerDetails.fullName}</span>
                                <span className="text-slate-400 font-bold">Emp ID:</span>
                                <span className="text-slate-800 font-extrabold">{data.bearerDetails.empID}</span>
                                <span className="text-slate-400 font-bold">Department:</span>
                                <span className="text-slate-800 font-extrabold">{data.bearerDetails.department || "NA"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3">Authorization</h3>
                        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm mb-3">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Range</p>
                            <p className="text-[11px] font-black text-slate-800">
                                {moment(data.bearerDetails.validFrom).format("DD MMM YY (hh:mm A)")}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 italic">to</p>
                            <p className="text-[11px] font-black text-red-500">
                                {moment(data.bearerDetails.validTo).format("DD MMM YY (hh:mm A)")}
                            </p>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium italic leading-snug">
                            Valid for mentioned duration. Security must verify physical assets before exit.
                        </div>
                    </div>
                </div>

                {/* Asset Table */}
                <div className="mb-6">
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2">Asset Manifest</h3>
                    <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">S.No</th>
                                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Name & ID</th>
                                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Model</th>
                                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.assets.map((asset, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                                        <td className="px-4 py-2 text-[10px] font-bold text-slate-400">{idx + 1}</td>
                                        <td className="px-4 py-2">
                                            <p className="text-[11px] font-extrabold text-slate-800 leading-tight">{asset.assetName}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{asset.assetID}</p>
                                        </td>
                                        <td className="px-4 py-2 text-[10px] font-bold text-slate-700">{asset.model || "NA"}</td>
                                        <td className="px-4 py-2 text-[10px] font-black text-slate-800 text-center">{asset.quantity}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${asset.type === 'RETURNABLE' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                                                {asset.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Remarks */}
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization Notes</h3>
                    <p className="text-[11px] font-bold text-slate-700 leading-normal italic">
                        {data.remarks || "No additional remarks mentioned."}
                    </p>
                </div>

                {/* Authorization Footer */}
                <div className="grid grid-cols-3 gap-8 mt-auto">
                    <div className="border-t border-slate-100 pt-2">
                        <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mb-0.5">Bearer Signature</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">({data.bearerDetails.fullName})</p>
                        <div className="h-8"></div>
                    </div>
                    <div className="border-t border-slate-100 pt-2 text-center">
                        <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mb-0.5">Security Clearance</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">(Entry/Exit)</p>
                        <div className="h-8"></div>
                    </div>
                    <div className="border-t border-slate-100 pt-2 text-right">
                        <div className="relative inline-block">
                            {data.status === 'Approved' && (
                                <div className="absolute -top-10 right-0 w-20 h-20 border-4 border-emerald-500/20 rounded-full flex items-center justify-center -rotate-12">
                                    <div className="border-2 border-emerald-500/20 rounded-full p-1">
                                        <span className="text-[8px] font-black text-emerald-500/40 uppercase">APPROVED</span>
                                    </div>
                                </div>
                            )}
                            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mb-0.5">Authorizer Sign</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">({data.authorizedBy || "Admin Authority"})</p>
                        </div>
                    </div>
                </div>

                {/* Barcode Placeholder */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-slate-300">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex gap-0.5">
                            {[2, 4, 2, 8, 2, 6, 4, 2, 6, 8, 2, 4, 2, 6, 4, 2, 8, 2, 4, 6].map((w, i) => (
                                <div key={i} className="bg-slate-900 h-8" style={{ width: `${w}px` }}></div>
                            ))}
                        </div>
                        <p className="text-[9px] font-black text-slate-900 font-mono tracking-[0.2em]">{data.passNo}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">System Generated Document</p>
                        <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Page 1 of 1 • Rev-3.1</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    .no-print { display: none; }
                    body { background: white; margin: 0; padding: 0; }
                    .bg-slate-50 { background: white; }
                    .shadow-2xl { box-shadow: none !important; }
                    .border-slate-200 { border: none !important; }
                    .max-w-[800px] { max-width: 100% !important; border: none !important; margin: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default PrintGatePass;
