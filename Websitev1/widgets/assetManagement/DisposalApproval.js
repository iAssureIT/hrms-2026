"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter, usePathname } from "next/navigation";
import moment from "moment";
import {
    MdOutlineMoveToInbox,
    MdHistory,
    MdAssignmentTurnedIn,
    MdOutlineFactCheck,
    MdChevronRight,
    MdAttachMoney,
    MdCheckCircle,
    MdInfoOutline,
    MdGavel,
    MdVerified
} from "react-icons/md";
import { FaSpinner, FaHistory } from "react-icons/fa";
import ls from "localstorage-slim";

const DisposalApproval = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [recentDisposals, setRecentDisposals] = useState([]);
    const [isApprover, setIsApprover] = useState(false);
    const [center_id, setCenter_id] = useState("all");

    const userDetails = ls.get("userDetails", { decrypt: true }) || {};

    useEffect(() => {
        // Role Detection
        const roles = userDetails?.role || userDetails?.roles || [];
        const roleArray = Array.isArray(roles) ? roles : [roles];
        const isAppr = roleArray.some(r =>
            r.toLowerCase().includes("admin") ||
            r.toLowerCase().includes("manager")
        );
        setIsApprover(isAppr);

        // Center Detection
        if (pathname.includes("admin")) {
            setCenter_id("all");
        } else {
            const userCenter = userDetails?.center_id?._id || userDetails?.center_id || "all";
            setCenter_id(userCenter);
        }
    }, [pathname, userDetails]);

    useEffect(() => {
        if (center_id) {
            fetchPendingRequests();
            fetchRecentDisposals();
        }
    }, [center_id]);

    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-disposal/get/list`,
                {
                    status: "PENDING",
                    center_ID: center_id,
                    recsPerPage: 100,
                    pageNumber: 1
                }
            );
            if (response.data && response.data.tableData) {
                setPendingRequests(response.data.tableData);
                if (response.data.tableData.length > 0 && !selectedRequest) {
                    handleSelection(response.data.tableData[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentDisposals = async () => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-disposal/get/list`,
                {
                    status: "APPROVED",
                    center_ID: center_id,
                    recsPerPage: 10,
                    pageNumber: 1
                }
            );
            if (response.data && response.data.tableData) {
                setRecentDisposals(response.data.tableData);
            }
        } catch (error) {
            console.error("Error fetching recent disposals:", error);
        }
    };

    const handleSelection = (request) => {
        setSelectedRequest(request);
        setRemarks("");
    };

    const handleApproval = async (status) => {
        if (!isApprover) {
            Swal.fire("Access Denied", "You do not have permission to perform approvals.", "error");
            return;
        }

        if (status === "REJECTED" && !remarks) {
            Swal.fire("Required", "Please provide remarks for rejection.", "warning");
            return;
        }

        try {
            setSubmitting(true);
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-disposal/patch/approve`,
                {
                    disposalId: selectedRequest._id,
                    status: status,
                    remarks: remarks,
                    user_id: userDetails.user_id || userDetails.userId || userDetails._id,
                }
            );


            if (res.data.success) {
                Swal.fire("Success", `Disposal request has been ${status.toLowerCase()} successfully.`, "success");
                const updatedRequests = pendingRequests.filter(r => r._id !== selectedRequest._id);
                setPendingRequests(updatedRequests);
                fetchRecentDisposals();
                if (updatedRequests.length > 0) {
                    handleSelection(updatedRequests[0]);
                } else {
                    setSelectedRequest(null);
                }
            }
        } catch (error) {
            console.error("Approval error:", error);
            Swal.fire("Error", "Failed to process approval.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && pendingRequests.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <FaSpinner className="animate-spin text-red-600 text-4xl" />
            </div>
        );
    }

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md bg-white">
                {/* Header */}
                <div className="uppercase text-xl font-semibold border-b-2 border-gray-300 px-10 py-5 flex justify-between items-center">
                    <h1 className="heading h-auto content-center p-0">Asset Disposal Approval</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded border border-red-100 uppercase tracking-widest">{pendingRequests.length} Pending</span>
                    </div>
                </div>

                <div className="px-10 py-8">
                    <p className="text-[13px] text-gray-500 mb-8 leading-relaxed">
                        Assess financial impacts, verify disposal reasons, and authorize asset derecognition from the enterprise registry.
                    </p>

                    <div className="grid lg:grid-cols-12 gap-8 min-h-[600px]">
                        {/* Left Sidebar: Worklist */}
                        <div className="lg:col-span-3 bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col h-fit">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Disposal Queue</h3>
                            </div>
                            <div className="overflow-y-auto max-h-[700px] custom-scrollbar">
                                {pendingRequests.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <MdOutlineMoveToInbox className="mx-auto text-gray-200 text-4xl mb-2" />
                                        <p className="text-gray-400 text-[10px] font-bold uppercase">No pending reviews</p>
                                    </div>
                                ) : (
                                    pendingRequests.map((req) => (
                                        <div
                                            key={req._id}
                                            onClick={() => handleSelection(req)}
                                            className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50
                                                ${selectedRequest?._id === req._id ? "bg-red-50 border-l-4 border-l-red-600" : "border-l-4 border-l-transparent"}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">{req.assetID}</span>
                                                <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase">Awaiting</span>
                                            </div>
                                            <h4 className={`text-xs font-bold truncate ${selectedRequest?._id === req._id ? "text-red-600" : "text-gray-900"}`}>{req.asset_id?.assetName || "Unknown Asset"}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{moment(req.disposalDate).format("DD MMM YYYY")}</p>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="text-[11px] font-black text-gray-900">₹{req.disposalValue?.toLocaleString()}</span>
                                                <MdChevronRight className={selectedRequest?._id === req._id ? "text-red-600" : "text-gray-300"} size={16} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-9 space-y-8">
                            {selectedRequest ? (
                                <>
                                    {/* Disposal Details Card */}
                                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                                            <MdInfoOutline className="text-red-500" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">1. Disposal Specification & Reasoning</h3>
                                        </div>
                                        <div className="grid md:grid-cols-4 gap-6">
                                            <div>
                                                <label className="inputLabel">Asset ID</label>
                                                <p className="text-xs font-bold text-gray-900 mt-1 uppercase">{selectedRequest.asset_id?.assetID}</p>
                                            </div>
                                            <div>
                                                <label className="inputLabel">Asset Name</label>
                                                <p className="text-xs font-bold text-gray-900 mt-1 uppercase">{selectedRequest.asset_id?.assetName}</p>
                                            </div>
                                            <div>
                                                <label className="inputLabel">Disposed On</label>
                                                <p className="text-xs font-bold text-gray-900 mt-1 uppercase">{moment(selectedRequest.disposalDate).format("DD MMM YYYY")}</p>
                                            </div>
                                            <div>
                                                <label className="inputLabel">Disposal Type</label>
                                                <p className="text-xs font-black text-amber-600 mt-1 uppercase">{selectedRequest.disposalType}</p>
                                            </div>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-gray-100">
                                            <label className="inputLabel mb-2 block">Disposal Justification</label>
                                            <p className="text-xs font-semibold text-gray-600 leading-relaxed bg-white p-4 rounded-lg border border-gray-100 italic">
                                                "{selectedRequest.remarks || "No justification recorded during disposal initialization."}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Financial Valuation Card */}
                                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                                            <MdAttachMoney className="text-red-500" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">2. Financial Derecognition Summary</h3>
                                        </div>
                                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50">
                                                    <tr className="border-b border-gray-100">
                                                        <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Parameter</th>
                                                        <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Value (₹)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td className="p-4 text-xs font-bold text-gray-700 uppercase">Gross Cost</td>
                                                        <td className="p-4 text-xs font-black text-gray-900 text-right">₹{selectedRequest.asset_id?.purchaseValue?.toLocaleString() || "0"}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td className="p-4 text-xs font-bold text-gray-700 uppercase italic">Net Book Value (NBV)</td>
                                                        <td className="p-4 text-xs font-black text-gray-900 text-right">₹{selectedRequest.nbvAtDisposal?.toLocaleString()}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td className="p-4 text-xs font-bold text-amber-600 uppercase">Disposal Realization</td>
                                                        <td className="p-4 text-xs font-black text-amber-600 text-right">₹{selectedRequest.disposalValue?.toLocaleString()}</td>
                                                    </tr>
                                                </tbody>
                                                <tfoot className={`${selectedRequest.financialImpact >= 0 ? "bg-green-50/50" : "bg-red-50/50"} font-black`}>
                                                    <tr>
                                                        <td className={`p-5 text-[10px] font-black ${selectedRequest.financialImpact >= 0 ? "text-green-600" : "text-red-600"} uppercase tracking-widest`}>
                                                            {selectedRequest.financialImpact >= 0 ? "Gain on Disposal" : "Loss on Disposal"} (IFRS IMPACT)
                                                        </td>
                                                        <td className={`p-5 text-sm font-black ${selectedRequest.financialImpact >= 0 ? "text-green-600" : "text-red-600"} text-right uppercase tracking-tight`}>
                                                            {selectedRequest.financialImpact >= 0 ? "+" : "-"}₹{Math.abs(selectedRequest.financialImpact)?.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Approval Actions Card - Decision Area */}
                                    <div className="bg-[#0f172a] rounded-xl p-8 text-white relative overflow-hidden shadow-xl">
                                        <MdGavel className="absolute -right-6 -bottom-6 text-white/5" size={120} />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                                <MdOutlineFactCheck className="text-red-400" size={20} />
                                                <h3 className="text-xs font-black uppercase tracking-widest tracking-widest">Enterprise Authorization Decision</h3>
                                            </div>

                                            <div className="mb-8">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Approver's Final Remarks</label>
                                                <textarea
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm font-medium text-white focus:ring-2 focus:ring-red-400 outline-none transition-all placeholder:text-gray-600 min-h-[120px]"
                                                    placeholder="Validate the disposal value and net impact before authorizing..."
                                                />
                                                <p className="text-[9px] text-gray-500 mt-2 italic">* Mandatory audit trail requirements apply for rejection.</p>
                                            </div>

                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10 pt-6">
                                                <div className="flex items-start gap-3 max-w-md">
                                                    <MdVerified className="text-green-400 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                                                        Authorizing this disposal will trigger an automated update to the asset register and move the item to the "Invoiced/Derecognized" sub-registry.
                                                    </p>
                                                </div>
                                                <div className="flex gap-4 w-full md:w-auto">
                                                    <button
                                                        disabled={submitting}
                                                        onClick={() => handleApproval("REJECTED")}
                                                        className="flex-1 md:flex-none px-8 py-3 bg-white/5 hover:bg-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        disabled={submitting}
                                                        onClick={() => handleApproval("APPROVED")}
                                                        className="flex-1 md:flex-none px-12 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                                                    >
                                                        {submitting ? <FaSpinner className="animate-spin" /> : <><MdCheckCircle size={14} /> Authorize</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity Stack at Bottom */}
                                    <div className="bg-white rounded-xl border-2 border-gray-50 p-8 shadow-sm">
                                        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <FaHistory className="text-gray-300" />
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Audit History / Recent Disposals</h3>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{recentDisposals.length} Completed</span>
                                        </div>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {recentDisposals.length === 0 ? (
                                                <div className="col-span-full py-12 text-center opacity-30">
                                                    <MdOutlineMoveToInbox size={40} className="mx-auto mb-3" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No recent audit logs</p>
                                                </div>
                                            ) : (
                                                recentDisposals.map((item, idx) => (
                                                    <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-100 transition-all duration-300 group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="max-w-[150px]">
                                                                <p className="text-[10px] font-black text-gray-900 truncate leading-tight group-hover:text-red-600 transition-colors uppercase">{item.asset_id?.assetName}</p>
                                                                <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{item.asset_id?.assetID}</p>
                                                            </div>
                                                            <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-widest">
                                                                Verified
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50">
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase">{moment(item.disposalDate).format("DD MMM YYYY")}</span>
                                                            <span className="text-[11px] font-black text-gray-900">₹{item.disposalValue?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-[500px] text-center bg-gray-50/50 border border-gray-100 rounded-xl p-20">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                                        <MdGavel size={40} className="text-gray-100" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Worklist Cleared</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">All disposal requests have been adjudicated</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .inputLabel {
                    font-size: 10px;
                    font-weight: 800;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </section>
    );
};

export default DisposalApproval;
