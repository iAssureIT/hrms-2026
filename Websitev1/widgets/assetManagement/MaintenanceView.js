"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";
import moment from "moment";
import { Tooltip } from "flowbite-react";
import {
    MdArrowBack,
    MdFileDownload,
    MdCheckCircle,
    MdClose,
    MdInfoOutline,
    MdHistory,
    MdCalendarToday,
    MdAttachMoney,
    MdOutlineDescription,
    MdBusiness,
    MdCall,
    MdListAlt
} from "react-icons/md";
import { CiViewList } from "react-icons/ci";
import { BsPlusSquare, BsTools } from "react-icons/bs";
import { FiDollarSign, FiAward } from "react-icons/fi";
import ls from "localstorage-slim";

const MaintenanceView = () => {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const printRef = useRef();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggedInRole, setLoggedInRole] = useState("");
    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }) || {});

    useEffect(() => {
        if (pathname.includes("admin")) setLoggedInRole("admin");
        else if (pathname.includes("center")) setLoggedInRole("center");
        else if (pathname.includes("asset")) setLoggedInRole("asset");
        else if (pathname.includes("account")) setLoggedInRole("account");
        else setLoggedInRole("executive");
    }, [pathname]);

    useEffect(() => {
        if (params._id) {
            fetchDetails();
        }
    }, [params._id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance/get/one/${params._id}`);
            setData(res.data);
        } catch (error) {
            console.error("Error fetching maintenance details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (userDetails?.roles?.includes("fa-accounts")) {
            Swal.fire("Access Denied", "You do not have permission to update maintenance status.", "error");
            return;
        }
        const { value: remarks } = await Swal.fire({
            title: `Move to ${newStatus.replace(/_/g, " ")}?`,
            input: 'textarea',
            inputPlaceholder: 'Add any remarks or observations...',
            showCancelButton: true,
            confirmButtonColor: '#00a65a',
            confirmButtonText: 'Confirm Update'
        });

        if (remarks === undefined) return;

        try {
            setLoading(true);
            const user_id = userDetails?.user_id || userDetails?.userId || userDetails?._id;
            const userName = userDetails?.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails?.fullName || userDetails?.name || "System");

            await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance/patch/status/${params._id}`, {
                status: newStatus,
                remarks: remarks,
                user_id,
                userName
            });
            Swal.fire(" ", "Status updated successfully");
            fetchDetails();
        } catch (error) {
            Swal.fire(" ", "Failed to update status");
        } finally {
            setLoading(false);
        }
    };
    const handlePrint = async () => {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = printRef.current;
        if (!element) return;
        const opt = {
            margin: [0.2, 0.2, 0.2, 0.2],
            filename: `MaintenanceReport_${data?.maintenanceID}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        const noPrintElements = document.querySelectorAll(".no-print");
        noPrintElements.forEach((el) => (el.style.display = "none"));

        html2pdf()
            .from(element)
            .set(opt)
            .save()
            .then(() => {
                noPrintElements.forEach((el) => (el.style.display = ""));
            });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
        </div>
    );

    if (!data) return <div className="p-5 text-center text-red-500 font-bold">Record not found.</div>;

    const DetailItem = ({ label, value }) => (
        <div className="flex-1 lg:me-4 mb-4">
            <label className="inputLabel text-[12px] text-gray-400 font-bold mb-1 block uppercase tracking-wider">{label}</label>
            <div className="relative font-semibold text-[14px] text-gray-800 break-words">
                {value || <span className="text-gray-300 italic font-normal">NA</span>}
            </div>
        </div>
    );

    return (
        <section className="section bg-white p-6">
            <div className="max-w-6xl mx-auto" ref={printRef}>
                {/* ── HEADER SECTION (FLUSH WITH VIEWASSET) ── */}
                <div className="bg-white border-2 rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="border-b-2 border-gray-100 px-10 py-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/50 gap-4">
                        <div className="flex flex-col gap-3">
                            <h1 className="mb-0 text-xl font-bold uppercase tracking-wide text-black">
                                Maintenance Analysis: <span className="text-green">{data.maintenanceID}</span>
                            </h1>
                            <div className={`w-fit px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border shadow-sm text-center ${data.status === "COMPLETED" ? "text-green-700 bg-white border-green-500" :
                                    data.status === "IN_PROGRESS" ? "text-cyan-600 bg-white border-cyan-500" :
                                        data.status === "AWAITING_APPROVAL" ? "text-amber-500 bg-white border-amber-500" :
                                            "text-gray-700 bg-white border-gray-400"
                                }`}>
                                Status: {data.status?.replace(/_/g, " ")}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 no-print">
                            <Tooltip content="Download Report" placement="bottom" className="bg-green" arrow={false}>
                                <div onClick={handlePrint}
                                    className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[32px] w-[32px]">
                                    <MdFileDownload size={20} />
                                </div>
                            </Tooltip>
                            <Tooltip content="Maintenance List" placement="bottom" className="bg-green" arrow={false}>
                                <div onClick={() => router.push(`/${loggedInRole}/management/maintenance-list`)}
                                    className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[32px] w-[32px]">
                                    <CiViewList size={20} />
                                </div>
                            </Tooltip>
                            {/* <Tooltip content="Edit Record" placement="bottom" className="bg-green" arrow={false}>
                                <div onClick={() => router.push(`/${loggedInRole}/management/add-maintenance/${data._id}`)}
                                     className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[32px] w-[32px]">
                                    <BsPlusSquare size={16} />
                                </div>
                            </Tooltip> */}
                        </div>
                    </div>

                    {/* ── LIFECYCLE ACTIONS ── */}
                    {!(userDetails?.roles?.includes("fa-accounts")) && (data.status === "SCHEDULED" || data.status === "IN_PROGRESS" || data.status === "UNDER_OBSERVATION") && (
                        <div className="px-10 py-6 bg-green/5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 no-print">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-green/20 text-green">
                                    <BsTools size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-tight leading-none mb-1">Lifecycle Management</h3>
                                    <p className="text-[11px] text-gray-500 font-medium">Update the incident status to synchronize with the Asset Registry.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {data.status === "SCHEDULED" && (
                                    <button onClick={() => handleStatusUpdate("IN_PROGRESS")}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md">
                                        Start Repair
                                    </button>
                                )}
                                {(data.status === "IN_PROGRESS" || data.status === "UNDER_OBSERVATION") && (
                                    <>
                                        {data.status !== "UNDER_OBSERVATION" && (
                                            <button onClick={() => handleStatusUpdate("UNDER_OBSERVATION")}
                                                className="px-6 py-2 bg-amber-500 text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md">
                                                Move to Observation
                                            </button>
                                        )}
                                        <button onClick={() => handleStatusUpdate("COMPLETED")}
                                            className="px-6 py-2 bg-green text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-Green transition-all shadow-md">
                                            Mark as Completed
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="p-10 space-y-12">
                        {/* FIRST ROW: ISSUE & ASSET */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Incident Diagnosis */}
                            <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden">
                                <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between">
                                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                        <MdInfoOutline className="text-green text-lg" /> Incident Diagnosis
                                    </h2>
                                    {data.issue?.isAMC && <span className="bg-green/10 text-green px-2 py-0.5 rounded text-[9px] font-bold">AMC COVERED</span>}
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-6">
                                    <DetailItem label="Issue Description" value={data.issue?.description} />
                                    <DetailItem label="Reported Date" value={moment(data.issue?.reportedDate).format("DD-MM-YYYY")} />
                                    <DetailItem label="Priority Level" value={data.issue?.priority || "Medium"} />
                                    <DetailItem label="Target Completion" value={data.completion?.expectedDate ? moment(data.completion?.expectedDate).format("DD-MM-YYYY") : "-"} />
                                </div>
                            </div>

                            {/* Asset Linkage */}
                            <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden">
                                <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                        <MdHistory className="text-green text-lg" /> Asset Linkage
                                    </h2>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-6">
                                    <DetailItem label="Asset Name" value={data.assetName} />
                                    <DetailItem label="Asset ID" value={data.assetID} />
                                    <DetailItem label="Category" value={data.category} />
                                    <DetailItem label="Location" value={data.location?.center?.name} />
                                </div>
                            </div>
                        </div>

                        {/* SECOND ROW: VENDOR & FINANCIALS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Service Provider */}
                            <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden">
                                <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                        <MdBusiness className="text-green text-lg" /> Service Provider
                                    </h2>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-6">
                                    <DetailItem label="Vendor Name" value={data.vendor?.name} />
                                    <DetailItem label="Contact Reference" value={data.vendor?.contact} />
                                    <DetailItem label="Service Fee (INR)" value={data.costs?.serviceFee ? `₹ ${data.costs.serviceFee.toLocaleString()}` : "₹ 0"} />
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden">
                                <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                        <MdAttachMoney className="text-green text-lg" /> Financial Summary
                                    </h2>
                                </div>
                                <div className="p-8">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Expenditure</p>
                                                <p className="text-3xl font-black text-green tracking-tight">₹ {data.costs?.totalAmount?.toLocaleString() || "0"}</p>
                                            </div>
                                            <div className="pt-4 border-t border-gray-50">
                                                <p className="text-[11px] text-gray-400 font-medium italic">Includes parts and service charges.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SPARE PARTS TABLE */}
                        {data.costs?.spareParts?.length > 0 && (
                            <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden">
                                <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                        <MdListAlt className="text-green text-lg" /> Parts & Materials Replacement
                                    </h2>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-left text-[13px]">
                                        <thead className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b border-gray-100">
                                            <tr>
                                                <th className="px-8 py-4">Component Name</th>
                                                <th className="px-8 py-4 text-center">Quantity</th>
                                                <th className="px-8 py-4 text-right">Unit Price</th>
                                                <th className="px-8 py-4 text-right">Extended Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {data.costs.spareParts.map((part, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-8 py-4 font-bold text-gray-700">{part.partName}</td>
                                                    <td className="px-8 py-4 text-center font-bold text-gray-400">{part.qty}</td>
                                                    <td className="px-8 py-4 text-right font-medium text-gray-500">₹ {part.unitPrice?.toLocaleString()}</td>
                                                    <td className="px-8 py-4 text-right font-black text-gray-800">₹ {part.totalAmount?.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* DOCUMENTATION & LOGS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Service Documentation */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Service Documentation</h3>
                                <div className="flex flex-wrap gap-3">
                                    {data.docs && data.docs.length > 0 ? (
                                        data.docs.map((url, index) => (
                                            <a key={index} href={url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-6 py-3 bg-white border border-green/20 text-green rounded-xl text-[12px] font-bold hover:bg-green hover:text-white transition-all shadow-sm">
                                                <MdFileDownload size={18} /> Attachment #{index + 1}
                                            </a>
                                        ))
                                    ) : (
                                        <p className="text-[12px] text-gray-300 italic px-2">No documents added</p>
                                    )}
                                </div>
                            </div>

                            {/* Audit Trail */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Lifecycle History</h3>
                                <div className="space-y-3">
                                    {data.updateLog?.map((log, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-[11px] bg-gray-50/50 px-4 py-3 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-700">{log.updatedBy?.firstName ? `${log.updatedBy.firstName} ${log.updatedBy.lastName || ""}`.trim() : (log.updatedBy?.name || log.userName || "System")}</span>
                                                <span className="text-gray-400">
                                                    {log.action === "STATUS_CHANGE" ? `changed status to ${log.status?.replace(/_/g, " ")}` :
                                                        log.action === "EDIT" ? "edited record details" : "updated record"}
                                                </span>
                                            </div>
                                            <span className="font-semibold text-gray-400">{moment(log.updatedAt).format("DD-MM-YYYY, h:mm A")}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between text-[11px] bg-green-50/20 px-4 py-3 rounded-xl border border-green-100">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <span className="font-bold">{data.createdBy?.firstName ? `${data.createdBy.firstName} ${data.createdBy.lastName || ""}`.trim() : (data.createdBy?.name || data.userName || "System")}</span>
                                            <span className="italic">added maintenance</span>
                                        </div>
                                        <span className="font-semibold text-green-600">{moment(data.createdAt).format("DD-MM-YYYY, h:mm A")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .max-w-6xl { 
                        max-width: 100% !important; 
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .section { padding: 0 !important; }
                }
            `}</style>
        </section>
    );
};

export default MaintenanceView;
