"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Tooltip } from "flowbite-react";
import moment from "moment";
import {
    MdOutlineMoveToInbox,
    MdAccessTime,
    MdHistory,
    MdAssignmentTurnedIn,
    MdOutlineFactCheck,
    MdChevronRight,
    MdBuild,
    MdAttachMoney,
    MdCheckCircle,
    MdCancel,
    MdInfoOutline,
    MdListAlt
} from "react-icons/md";
import { FaUserCircle, FaSpinner, FaTools, FaRegFileAlt } from "react-icons/fa";
import { BsTools, BsHandThumbsUp, BsCpu } from "react-icons/bs";
import { FiDollarSign, FiClock } from "react-icons/fi";
import ls from "localstorage-slim";

const MaintenanceApproval = () => {
    const router = useRouter();
    const [loggedInRole, setLoggedInRole] = useState("admin");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [history, setHistory] = useState([]);

    const userDetails = ls.get("userDetails", { decrypt: true }) || {};

    useEffect(() => {
        const role = ls.get("role") || "admin";
        setLoggedInRole(role);
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance/post/list`,
                { status: "AWAITING_APPROVAL", recsPerPage: 100, pageNumber: 1 }
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

    const handleSelection = async (request) => {
        setSelectedRequest(request);
        setRemarks("");
        // Fetch history for this specific asset
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance/post/list`,
                { asset_id: request.asset_id, recsPerPage: 5, pageNumber: 1 }
            );
            if (response.data && response.data.tableData) {
                // Filter out the current request from history
                setHistory(response.data.tableData.filter(h => h._id !== request._id));
            }
        } catch (error) {
            console.error("Error fetching asset history:", error);
        }
    };

    const handleApproval = async (status) => {
        const roles = userDetails?.roles || [];
        const isIncharge = roles.includes("account-incharge") || roles.includes("center-incharge");
        const isAuthorized = roles.includes("admin") || roles.includes("account-admin") || roles.includes("account-manager") || roles.includes("asset-manager") || roles.includes("asset-admin");

        if (isIncharge && !isAuthorized) {
            Swal.fire("Access Denied", "You do not have permission to perform approvals.", "error");
            return;
        }

        if (status === "Rejected" && !remarks) {
            Swal.fire("Required", "Please provide remarks for rejection.", "warning");
            return;
        }

        try {
            setSubmitting(true);
            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance/patch/status/${selectedRequest._id}`,
                {
                    status: status === "Approved" ? "Scheduled" : "Rejected",
                    remarks,
                    user_id: userDetails.user_id || userDetails.userId || userDetails._id,
                    userName: userDetails.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails.fullName || userDetails.name || "System")
                }
            );

            if (res.data.success) {
                Swal.fire("Success", `Request has been ${status.toLowerCase()} successfully.`, "success");
                const updatedRequests = pendingRequests.filter(r => r._id !== selectedRequest._id);
                setPendingRequests(updatedRequests);
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
                <FaSpinner className="animate-spin text-green-600 text-4xl" />
            </div>
        );
    }

    return (
        <section className="section admin-box box-primary">
            <div className="hr-card hr-fade-in">
                {/* --- Page Header --- */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Maintenance Operations</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Service <span className="text-[#3c8dbc] font-black">Authorization</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 pt-4 md:pt-0 mb-1">
                            <Tooltip content="Asset List" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                                <div onClick={() => router.push(`/${loggedInRole}/management/asset-list`)}
                                    className="text-[#3c8dbc] border border-[#3c8dbc] p-1.5 rounded cursor-pointer hover:bg-[#3c8dbc] hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[32px] w-[32px]">
                                    <MdListAlt size={20} />
                                </div>
                            </Tooltip>
                            <span className="text-[10px] font-black text-[#f39c12] bg-amber-50 px-3 py-1 rounded border border-amber-100 uppercase tracking-widest">
                                {pendingRequests.length} Pending Requests
                            </span>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                        Verify technical service reports, authorize spare part costs, and schedule maintenance activities for reported breakdowns.
                    </p>
                </div>


                    <div className="grid lg:grid-cols-12 gap-8 min-h-[600px]">
                        {/* Left Sidebar: Worklist */}
                        <div className="lg:col-span-3 bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col h-fit">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Worklist</h3>
                            </div>
                            <div className="overflow-y-auto max-h-[700px] no-scrollbar">
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
                                                ${selectedRequest?._id === req._id ? "bg-green-50 border-l-4 border-l-green-600" : "border-l-4 border-l-transparent"}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">{req.maintenanceID}</span>
                                                <span className="text-[8px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase">Emergency</span>
                                            </div>
                                            <h4 className={`text-xs font-bold truncate ${selectedRequest?._id === req._id ? "text-green-600" : "text-gray-900"}`}>{req.assetName}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{moment(req.issue?.reportedDate).format("DD MMM YYYY")}</p>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="text-[11px] font-black text-gray-900">₹{req.costs?.totalAmount?.toLocaleString()}</span>
                                                <MdChevronRight className={selectedRequest?._id === req._id ? "text-green-600" : "text-gray-300"} size={16} />
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
                                    {/* Asset Info Card */}
                                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">1. Reported Incident Details</h3>
                                        </div>
                                        <div className="grid md:grid-cols-4 gap-6">
                                            <div>
                                                <label className="inputLabel">Asset ID</label>
                                                <p className="text-xs font-bold text-gray-900 mt-1 uppercase">{selectedRequest.assetID}</p>
                                            </div>
                                            <div>
                                                <label className="inputLabel">Asset Name</label>
                                                <p className="text-xs font-bold text-gray-900 mt-1 uppercase">{selectedRequest.assetName}</p>
                                            </div>
                                            <div>
                                                <label className="inputLabel">Reported On</label>
                                                <p className="text-xs font-bold text-gray-900 mt-1 uppercase">{moment(selectedRequest.issue?.reportedDate).format("DD MMM YYYY")}</p>
                                            </div>
                                            <div>
                                                <label className="inputLabel">Policy Type</label>
                                                <p className="text-xs font-bold text-green mt-1">{(selectedRequest.issue?.isAMC ? "AMC Covered" : "Out of Warranty")?.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <label className="inputLabel mb-2 block">Technician Breakdown Description</label>
                                            <p className="text-xs font-semibold text-gray-600 leading-relaxed bg-white p-4 rounded-lg border border-gray-100 italic">
                                                "{selectedRequest.issue?.description || "No detailed summary provided and verified by technician."}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">2. Spare Parts & Service Costing</h3>
                                        </div>
                                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50">
                                                    <tr className="border-b border-gray-100">
                                                        <th className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Part/Service Name</th>
                                                        <th className="p-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount (₹)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedRequest.costs?.spareParts?.map((part, i) => (
                                                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                                            <td className="p-3 text-xs font-bold text-gray-700 uppercase">{part.partName}</td>
                                                            <td className="p-3 text-xs font-black text-gray-900 text-right">₹{part.totalAmount?.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td className="p-3 text-xs font-bold text-gray-500 italic uppercase">Technical Service Fee</td>
                                                        <td className="p-3 text-xs font-black text-gray-900 text-right">₹{selectedRequest.costs?.serviceFee?.toLocaleString()}</td>
                                                    </tr>
                                                </tbody>
                                                <tfoot className="bg-green-50/50 font-black">
                                                    <tr>
                                                        <td className="p-4 text-[10px] font-black text-green-600 uppercase tracking-widest">Authorized Total</td>
                                                        <td className="p-4 text-sm font-black text-green-600 text-right">₹{selectedRequest.costs?.totalAmount?.toLocaleString()}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Asset History */}
                                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">3. Recent Service History</h3>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{history.length} Previous Records</span>
                                        </div>
                                        <div className="space-y-3">
                                            {history.length > 0 ? (
                                                history.map((h, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-green-200 transition-all">
                                                        <div>
                                                            <p className="text-[11px] font-bold text-gray-800 uppercase truncate max-w-lg">{h.issue?.description?.substring(0, 80)}...</p>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <span className="text-[9px] font-bold text-gray-400 uppercase">{moment(h.issue?.reportedDate).format("DD MMM YYYY")}</span>
                                                                <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter">SUCCESSFULLY CLOSED</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-black text-gray-900">₹{h.costs?.totalAmount?.toLocaleString()}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-10 text-center opacity-40">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Recurring Issues</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Authorization Decision Section */}
                                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">4. Authorization Decision</h3>
                                            </div>

                                            <div className="mb-8">
                                                <label className="inputLabel mb-2 block">Approver Remarks / Instructions</label>
                                                <textarea
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg p-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-green-400 outline-none transition-all placeholder:text-gray-400 min-h-[100px]"
                                                    placeholder="Enter approval details or reason for rejection..."
                                                />
                                                <p className="text-[9px] text-gray-500 mt-2 italic">* Remarks are mandatory for rejection requests.</p>
                                            </div>

                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-6">
                                                {/* <p className="text-[11px] text-gray-500 font-bold leading-relaxed max-w-sm">
                                                    Authorized maintenance will update the asset status to "Scheduled" and trigger logistics workflows.
                                                </p> */}
                                                <div className="flex gap-4 w-full md:w-auto">
                                                    <button
                                                        disabled={submitting}
                                                        onClick={() => handleApproval("Rejected")}
                                                        className="flex-1 md:flex-none px-8 py-3 bg-white hover:bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-red-100"
                                                    >
                                                        Reject Request
                                                    </button>
                                                    <button
                                                        disabled={submitting}
                                                        onClick={() => handleApproval("Approved")}
                                                        className="flex-1 md:flex-none px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                                    >
                                                        {submitting ? <FaSpinner className="animate-spin" /> : <><MdCheckCircle size={14} /> Approve</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-[500px] text-center bg-gray-50/50 border border-gray-100 rounded-xl p-20">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                                        <MdCheckCircle size={40} className="text-gray-100" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Zero Pending Approvals</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">All Maintenance tasks consolidated</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            <style jsx global>{`
                .stdInputField {
                    height: 42px;
                    border: 1px solid #e5e7eb;
                    background: #ffffff;
                    border-radius: 8px;
                    width: 100%;
                    padding: 0 12px;
                    font-size: 13px;
                    font-weight: 700;
                    outline: none;
                }
                .inputLabel {
                    font-size: 10px;
                    font-weight: 800;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .heading {
                    color: #333;
                }
            `}</style>
        </section>
    );
};

export default MaintenanceApproval;
