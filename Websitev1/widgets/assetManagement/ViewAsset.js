"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";
import moment from "moment";
import {
    MdArrowBack,
    MdFileDownload,
    MdCheckCircle,
    MdCancel,
    MdSend,
    MdKeyboardArrowLeft,
    MdChevronRight,
    MdAssignmentTurnedIn,
    MdOutlineFactCheck,
    MdClose,
    MdInfoOutline,
    MdLocationOn,
    MdBusiness
} from "react-icons/md";
import ls from "localstorage-slim";
import { FaUserCircle } from "react-icons/fa";

const ViewAsset = () => {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [assetData, setAssetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [decision, setDecision] = useState("Approve");
    const [remarks, setRemarks] = useState("");
    const [loggedInRole, setLoggedInRole] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (pathname.includes("admin")) {
            setLoggedInRole("admin");
        } else if (pathname.includes("center")) {
            setLoggedInRole("center");
        } else {
            setLoggedInRole("executive");
        }
    }, [pathname]);

    useEffect(() => {
        if (params._id) {
            fetchAssetDetails();
        }
    }, [params._id]);

    const fetchAssetDetails = () => {
        setLoading(true);
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management/get/${params._id}`)
            .then((res) => {
                setAssetData(res.data);
                setRemarks(res.data.reviewRemarks || "");
                setDecision(res.data.assetStatus === "ASSET_APPROVAL_REJECTED" ? "Reject" : "Approve");
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching asset details:", err);
                setLoading(false);
            });
    };

    const handleAction = async (status, remarks) => {
        if (!params._id) return;
        setSubmitting(true);
        // Map status to endpoint terms if needed
        const endpoint = (status === "Active" || status === "APPROVED" || status === "Approve") ? "approve" : "reject";
        // Map UI status to backend status
        const backendStatus = (status === "Active" || status === "Approve" || status === "APPROVED") ? "APPROVED" : (status === "Rejected" || status === "REJECTED" || status === "Reject") ? "REJECTED" : status;
        const type = (assetData.assetStatus === "ASSET_APPROVAL_PENDING" || assetData.assetStatus === "ASSET_APPROVAL_REJECTED") ? "registry" : "allocation";

        try {
            const userDetails = ls.get("userDetails", { decrypt: true }) || {};
            const user_id = userDetails.user_id || userDetails._id;

            const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-allocation/patch/${endpoint}/${params._id}`, {
                remarks,
                user_id,
                type,
                status: backendStatus
            });
            if (res.data.success) {
                Swal.fire("Success!", `Asset action processed successfully.`, "success");
                fetchAssetDetails();
            }
        } catch (error) {
            console.error("Action error:", error);
            Swal.fire("Error!", error.response?.data?.message || "Something went wrong.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeallocate = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to deallocate this asset from the current employee?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#00af50",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, deallocate!"
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const userDetails = ls.get("userDetails", { decrypt: true }) || {};
                const user_id = userDetails.user_id || userDetails._id;
                const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-allocation/patch/deallocate/${params._id}`, {
                    user_id
                });
                if (res.data.success) {
                    Swal.fire("Deallocated!", "Asset has been deallocated.", "success");
                    fetchAssetDetails();
                }
            } catch (err) {
                console.error("Deallocation error:", err);
                Swal.fire("Error!", "Failed to deallocate asset.", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
            </div>
        );
    }

    if (!assetData) {
        return <div className="p-5 text-center text-red-500 font-bold">Asset not found.</div>;
    }

    // Calculation for monthly depreciation (matching AddAsset.js logic)
    const cost = parseFloat(assetData.cost) || 0;
    const resValue = parseFloat(assetData.residualValue) || 0;
    const life = parseInt(assetData.usefulLife) || 0;
    const monthlyDepr = (life > 0) ? ((cost - resValue) / (life * 12)).toFixed(2) : "0.00";

    const DetailItem = ({ label, value }) => (
        <div className="flex-1 lg:me-4 mb-4">
            <label className="inputLabel">{label}</label>
            <div className="relative mt-2 font-normal text-[15px] text-gray-800 break-words">
                {value || "-"}
            </div>
        </div>
    );

    return (
        <section className="section bg-white p-6">
            <div className="box border-2 rounded-md shadow-md overflow-hidden bg-white">
                {/* Header Section */}
                <div className="border-b-2 border-gray-200 p-6 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => router.back()}
                            className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white"
                        >
                            <MdKeyboardArrowLeft size={24} />
                        </div>
                        <h1 className="heading mb-0 text-xl font-bold uppercase tracking-wide">
                            Asset Analysis: <span className="text-green">{assetData.assetName}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Allocation Icon (Top Right) - Visible only if Active */}
                        {assetData.assetStatus === "ACTIVE" && (
                            <div
                                onClick={() => router.push(`/${loggedInRole}/asset-management/asset-allocation?assetID=${assetData.assetID}`)}
                                className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center gap-2 px-3"
                                title="Allocate Asset"
                            >
                                <MdAssignmentTurnedIn size={20} />
                                <span className="text-[10px] font-bold uppercase">Allocate</span>
                            </div>
                        )}
                        {/* Registry Status Badge */}
                        <div className={`px-4 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white shadow-sm ${assetData.assetStatus === "ASSET_APPROVAL_PENDING" ? "bg-yellow-400" :
                                assetData.assetStatus === "ASSET_APPROVAL_REJECTED" ? "bg-red-500" : "bg-green"
                            }`}>
                            Registry: {
                                assetData.assetStatus === "ASSET_APPROVAL_PENDING" ? "Pending" :
                                    assetData.assetStatus === "ASSET_APPROVAL_REJECTED" ? "Rejected" : "Approved"
                            }
                        </div>

                        {/* Allocation/Asset Status Badge */}
                        <div className={`px-4 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white shadow-sm ${assetData.assetStatus === "ALLOCATED" ? "bg-green" :
                                (assetData.assetStatus === "ASSET_APPROVAL_REJECTED" || assetData.assetStatus === "ALLOCATION_APPROVAL_REJECTED") ? "bg-red-500" : "bg-yellow-400"
                            }`}>
                            Status: {
                                assetData.assetStatus === "ALLOCATED" ? "Active" :
                                    (assetData.assetStatus === "ASSET_APPROVAL_REJECTED" || assetData.assetStatus === "ALLOCATION_APPROVAL_REJECTED") ? "Rejected" : "Pending"
                            }
                        </div>
                    </div>
                </div>

                <div className="px-10 py-8">
                    {/* SECTION 1 — Basic Information */}
                    <div className="mb-8">
                        <h2 className="heading mb-6 border-b pb-2 text-md">Basic Information</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
                            <DetailItem label="Asset Category" value={assetData.category} />
                            <DetailItem label="Asset Sub-Category" value={assetData.subCategory} />
                            <DetailItem label="Asset Name" value={assetData.assetName} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
                            <DetailItem label="Brand" value={assetData.brand} />
                            <DetailItem label="Model / Variation" value={assetData.model} />
                            <DetailItem label="Serial Number" value={assetData.serialNo} />
                            <DetailItem label="Asset ID" value={assetData.assetID} />
                        </div>
                        <div className="mt-2">
                            <label className="inputLabel">Description</label>
                            <div className="mt-2 text-[14px] text-gray-700 bg-gray-50 p-4 border rounded font-medium">
                                {assetData.description || "No description available."}
                            </div>
                        </div>
                    </div>

                    {/* SECTION — Location & Assignment */}
                    <div className="mb-8">
                        <h2 className="heading mb-6 border-b pb-2 text-md">Location & Assignment</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
                            <DetailItem label="Center Name" value={assetData.centerName} />
                            <DetailItem label="Sub-Location" value={assetData.sublocationName} />
                            <DetailItem label="Department" value={assetData.departmentName} />
                            <DetailItem label="Sub-Department" value={assetData.subdepartmentName} />
                        </div>
                    </div>

                    {/* SECTION 2 — Purchase Details */}
                    <div className="mb-8">
                        <h2 className="heading mb-6 border-b pb-2 text-md">Purchase Details</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
                            <DetailItem label="Purchase Date" value={assetData.purchaseDate ? moment(assetData.purchaseDate).format("DD-MM-YYYY") : "-"} />
                            <DetailItem label="Invoice Number" value={assetData.invoiceNumber} />
                            <DetailItem label="Vendor / Supplier" value={assetData.vendor} />
                            <DetailItem label="Purchase Cost (USD)" value={assetData.cost ? `$ ${assetData.cost}` : "0.00"} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
                            <DetailItem label="Warranty Expiry Date" value={assetData.warrantyDate ? moment(assetData.warrantyDate).format("DD-MM-YYYY") : "-"} />
                        </div>
                    </div>

                    {/* SECTION 3 — Financial Details */}
                    <div className="mb-8">
                        <h2 className="heading mb-6 border-b pb-2 text-md">Financial Details</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
                            <DetailItem label="Residual Value (USD)" value={assetData.residualValue ? `$ ${assetData.residualValue}` : "0.00"} />
                            <DetailItem label="Useful Life (Years)" value={assetData.usefulLife ? `${assetData.usefulLife} Years` : "NA"} />
                            <DetailItem label="Monthly Depreciation" value={`$ ${monthlyDepr}`} />
                        </div>
                    </div>

                    {/* Other Specifications */}
                    {assetData.specifications?.length > 0 && (
                        <div className="mb-8">
                            <h2 className="heading mb-6 border-b pb-2 text-md">Other Specifications</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
                                {assetData.specifications.map((spec, i) => (
                                    <div key={i} className="flex-1">
                                        <p className="inputLabel text-blue-600 mb-1">{spec.label}</p>
                                        <p className="text-[14px] font-bold text-gray-800 uppercase leading-snug">{spec.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attached Documents */}
                    {assetData.uploadedFiles?.length > 0 && (
                        <div className="mb-10">
                            <h2 className="heading mb-6 border-b pb-2 text-md">Attached Documents</h2>
                            <div className="flex flex-wrap gap-4">
                                {assetData.uploadedFiles.map((file, index) => (
                                    <a
                                        key={index}
                                        href={file.fileData}
                                        download={file.fileName}
                                        className="flex items-center px-4 py-2 border border-green text-green rounded-md text-xs font-bold hover:bg-green hover:text-white transition-all shadow-sm bg-white"
                                    >
                                        <MdFileDownload size={18} className="mr-2" />
                                        {file.fileName}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ──── APPROVAL CARD ──── */}
                    {(assetData.assetStatus === "ASSET_APPROVAL_PENDING" || assetData.assetStatus === "ALLOCATION_APPROVAL_PENDING") && (
                        <div className="mt-12 bg-white border border-gray-100 rounded-xl shadow-lg flex flex-col max-w-4xl mx-auto overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <MdOutlineFactCheck className="text-blue-500" />
                                        {assetData.assetStatus === "ASSET_APPROVAL_PENDING" ? "Asset Content Approval" : "Allocation Request Approval"}
                                    </h3>
                                    <span className="px-3 py-1 bg-yellow-400 text-white text-[10px] font-bold uppercase rounded shadow-sm">
                                        Pending Review
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {assetData.assetStatus === "ALLOCATION_APPROVAL_PENDING" && (
                                    <>
                                        {/* Movement Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-50/30 p-6 rounded-xl border border-blue-100">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Movement Details</h4>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Source (Dept)</p>
                                                        <p className="text-[12px] font-bold text-gray-800">{assetData.departmentName || "-"}</p>
                                                    </div>
                                                    <div className="flex-1 border-t-2 border-dashed border-gray-200 flex justify-center items-center relative">
                                                        <div className="bg-white/0 px-2 -mt-[2px]">
                                                            <MdChevronRight className="text-blue-500 text-xl" />
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Destination (Center)</p>
                                                        <p className="text-[12px] font-bold text-gray-800">{assetData.centerName || "-"}</p>
                                                        <p className="text-[9px] text-gray-400 font-medium">{assetData.sublocationName}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recipient Profile */}
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Recipient Employee</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold overflow-hidden border-2 border-white shadow-md">
                                                        <FaUserCircle className="text-4xl text-blue-200" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-gray-800">{assetData.employeeName}</p>
                                                        <p className="text-[11px] text-gray-500 font-medium">{assetData.employeeDesignation || "Employee"}</p>
                                                        <p className="text-[10px] font-bold text-blue-500 uppercase mt-0.5">{assetData.employeeEmail}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Initiator Notes */}
                                        <div className="bg-orange-50/30 p-4 border-l-4 border-orange-200 rounded-r-xl">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Initiator Notes</p>
                                            <p className="text-[12px] text-gray-600 italic leading-relaxed">
                                                "{assetData.remarks || "No remarks provided"}"
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Checker Remarks (Interactive) */}
                                <div className="">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Checker Remarks</h4>
                                        <p className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">* Required for rejection</p>
                                    </div>
                                    <textarea
                                        className="w-full stdSelectField p-4 min-h-[100px] bg-white border-2 border-gray-100 placeholder:text-gray-300 placeholder:italic resize-none focus:border-blue-500 font-medium outline-none transition-all"
                                        placeholder="Add verification notes or reason for rejection..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-6 grid grid-cols-2 gap-6 border-t border-gray-100 bg-gray-50/30">
                                <button
                                    onClick={() => handleAction("Rejected", remarks)}
                                    disabled={submitting}
                                    className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    <MdClose size={18} /> {submitting ? "Processing..." : (assetData.assetStatus === "ASSET_APPROVAL_PENDING" ? "Reject Registry" : "Reject Allocation")}
                                </button>
                                <button
                                    onClick={() => handleAction("Active", remarks)}
                                    disabled={submitting}
                                    className="px-6 py-3 bg-green text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-Green transition-all flex items-center justify-center gap-2 shadow-lg shadow-green/20 disabled:opacity-50"
                                >
                                    <MdOutlineFactCheck size={18} /> {submitting ? "Processing..." : (assetData.assetStatus === "ASSET_APPROVAL_PENDING" ? "Approve Registry" : "Approve Allocation")}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bottom Actions - Visible only if Allocated or Allocation Pending */}
                    {(assetData.assetStatus === "ALLOCATED" || assetData.assetStatus === "ALLOCATION_APPROVAL_PENDING" || assetData.assetStatus === "ALLOCATION_APPROVAL_REJECTED") && (
                        <div className="mt-12 flex flex-wrap justify-center gap-6">
                            {assetData.assetStatus === "ALLOCATED" && (
                                <button
                                    onClick={handleDeallocate}
                                    className="px-8 py-2 bg-red-50 text-red-600 border border-red-200 rounded font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 h-[45px] min-w-[200px]"
                                >
                                    <MdClose size={18} /> Deallocate Asset
                                </button>
                            )}
                            <button
                                onClick={() => router.push(`/${loggedInRole}/asset-management/movement-authorization`)}
                                className="formButtons min-w-[280px] flex items-center justify-center gap-3 px-8"
                            >
                                <MdOutlineFactCheck size={24} />
                                Asset Allocation Approval
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ViewAsset;
