"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import {
    MdOutlinePlaylistAddCheck,
    MdGavel,
    MdInfo,
    MdAssignmentTurnedIn,
    MdArrowBack,
} from "react-icons/md";
import { FaCheck, FaExclamationTriangle, FaSearch, FaSpinner, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import { Tooltip } from "flowbite-react";
import GenericTable from "@/widgets/GenericTable/FilterTable";

const ReconciliationContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auditId = searchParams.get("auditId");

    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }));
    const [activeAudit, setActiveAudit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [tableData, setTableData] = useState([]);

    // Table Pagination/State - Required by GenericTable to prevent NaN error
    const [recsPerPage, setRecsPerPage] = useState(10);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalRecs, setTotalRecs] = useState(0);
    const [numOfPages, setNumOfPages] = useState(0);
    const [runCount, setRunCount] = useState(1);

    useEffect(() => {
        if (auditId) {
            fetchAuditDetails();
        } else {
            router.back();
        }
    }, [auditId]);

    useEffect(() => {
        if (!activeAudit?.auditResults) return;

        // 1. Filter by search text
        const filtered = activeAudit.auditResults.filter(item =>
            item.assetName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.assetID?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.assetCategory?.toLowerCase().includes(searchText.toLowerCase())
        );

        setTotalRecs(filtered.length);

        // 2. Slice for pagination (Client-side)
        const startIndex = (pageNumber - 1) * recsPerPage;
        const sliced = filtered.slice(startIndex, startIndex + recsPerPage);

        // 3. Transform data for GenericTable
        const transformed = sliced.map(item => ({
            _id: item.asset_id,
            assetID_fixed: `<span class="font-black text-gray-400 text-[10px] uppercase">${item.assetID}</span>`,
            assetName_fixed: `<span class="font-bold text-slate-700 text-[13px]">${item.assetName}</span>`,
            category: item.assetCategory || "-",
            statusBadge: `
                <span class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${item.physicalStatus === 'Found' ? 'bg-green-50 text-green-600 border-green-200' :
                    item.physicalStatus === 'Missing' ? 'bg-red-50 text-red-600 border-red-200' :
                        item.physicalStatus === 'Damaged' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            'bg-slate-50 text-slate-400 border-slate-200 border-dashed'}">
                    ${item.physicalStatus}
                </span>
            `,
            verifyAction: `
                <div class="flex gap-2 justify-center">
                    <button 
                        data-action="Found" data-id="${item.asset_id}"
                        class="p-2 rounded-lg border border-slate-200 hover:bg-green-600 hover:text-white transition-all shadow-sm ${item.physicalStatus === 'Found' ? 'bg-green-600 text-white border-green-600' : 'bg-white'}"
                        title="Mark as Found"
                    >
                        <i class="fa fa-check"></i>
                    </button>
                    <button 
                        data-action="Missing" data-id="${item.asset_id}"
                        class="p-2 rounded-lg border border-slate-200 hover:bg-red-600 hover:text-white transition-all shadow-sm ${item.physicalStatus === 'Missing' ? 'bg-red-600 text-white border-red-600' : 'bg-white'}"
                        title="Mark as Missing"
                    >
                        <i class="fa fa-exclamation-triangle"></i>
                    </button>
                </div>
            `
        }));
        setTableData(transformed);
    }, [activeAudit, searchText, pageNumber, recsPerPage]);

    const fetchAuditDetails = async () => {
        if (!activeAudit) setLoading(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-audit/get/one/${auditId}`);
            if (res.data.success) {
                setActiveAudit(res.data.data);
            }
        } catch (err) {
            Swal.fire("Error", "Failed to load audit details", "error");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // Use event delegation for GenericTable buttons
    useEffect(() => {
        const handleTableClick = (e) => {
            const btn = e.target.closest('button[data-action]');
            if (btn) {
                const id = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-action');
                if (activeAudit?.status !== 'Completed') {
                    updateStatus(id, action);
                }
            }
        };
        document.addEventListener('click', handleTableClick);
        return () => document.removeEventListener('click', handleTableClick);
    }, [activeAudit]);

    const updateStatus = async (asset_id, status) => {
        const roles = userDetails?.roles || [];
        if (roles.includes("fa-accounts")) {
            Swal.fire("Access Denied", "You do not have permission to update audit results.", "error");
            return;
        }
        try {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-audit/patch/result`, {
                audit_id: activeAudit._id,
                asset_id,
                physicalStatus: status,
                locationMatch: true,
                user_id: userDetails?.user_id
            });
            if (res.data.success) {
                const updatedResults = activeAudit.auditResults.map(i => i.asset_id === asset_id ? { ...i, physicalStatus: status } : i);
                setActiveAudit({ ...activeAudit, auditResults: updatedResults, summary: res.data.summary });
            }
        } catch (err) {
            Swal.fire("Error", "Failed to update status", "error");
        }
    };

    const finalizeAudit = async () => {
        const roles = userDetails?.roles || [];
        const isAuthorized = roles.includes("admin") || roles.includes("account-admin") || roles.includes("account-manager") || roles.includes("asset-manager") || roles.includes("asset-admin");
        const isFaAccounts = roles.includes("fa-accounts");

        if (!isAuthorized || isFaAccounts) {
            Swal.fire("Access Denied", "You do not have permission to finalize audits.", "error");
            return;
        }

        const result = await Swal.fire({
            title: 'Finalize Audit?',
            text: "This will lock the results and move the audit to 'Completed' status.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            confirmButtonText: 'Yes, Finalize it!'
        });

        if (result.isConfirmed) {
            try {
                const userName = userDetails.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails.name || "System");
                const res = await axios.patch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-audit/patch/finalize`,
                    {
                        audit_id: activeAudit._id,
                        userName: userName
                    }
                );
                if (res.data.success) {
                    Swal.fire("Success", "Audit has been finalized.", "success");
                    router.back();
                }
            } catch (err) {
                Swal.fire("Error", "Failed to finalize audit", "error");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FB]">
                <FaSpinner className="animate-spin text-[#3c8dbc] mb-4" size={48} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest text-center">Waking Verification Engine...</p>
            </div>
        );
    }

    if (!activeAudit) return null;

    const tableHeading = {
        assetID_fixed: "Asset ID",
        assetName_fixed: "Asset Name",
        category: "Category",
        statusBadge: "Physical Status",
        ...(!(userDetails?.roles?.includes("fa-accounts")) ? { verifyAction: "Quick Verify" } : {}),
    };

    const tableObjects = {
        paginationApply: true,
        searchApply: true,
        downloadApply: true,
        tableName: "Verification Workspace",
    };

    return (
        <section className="section bg-white min-h-screen">
            <div className="box border-2 rounded-md shadow-md max-w-[1400px] mx-auto mt-4 overflow-hidden">
                {/* ── Page Header ── */}
                <div className="border-b-2 border-gray-100 flex justify-between px-10 bg-white">
                    <div className="py-5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            <span>Audit No</span>
                            <span className="text-[#3c8dbc]">{activeAudit.auditNo}</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                            Asset <span className="text-[#3c8dbc]">Reconciliation</span>
                        </h1>
                        <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-tight italic">
                            {activeAudit.auditTitle}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 my-5">
                        {/* Progress Indicator */}
                        <div className="flex items-center gap-4 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completion</p>
                                <p className="text-lg font-black text-slate-800 leading-none">
                                    {activeAudit.summary.verifiedAssets}<span className="text-slate-300 mx-1">/</span>{activeAudit.summary.totalAssets}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full border-[4px] border-slate-200 border-t-[#3c8dbc] flex items-center justify-center font-black text-[10px] text-[#3c8dbc]">
                                {activeAudit.summary.totalAssets > 0 ? Math.round((activeAudit.summary.verifiedAssets / activeAudit.summary.totalAssets) * 100) : 0}%
                            </div>
                        </div>

                        {/* Standard Icon Buttons */}
                        <div className="flex gap-3">
                            {activeAudit.status !== 'Completed' && !(userDetails?.roles?.includes("fa-accounts")) && (
                                <Tooltip content="Finalize Audit" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                                    <MdAssignmentTurnedIn
                                        className="cursor-pointer text-[#3c8dbc] hover:text-white hover:bg-[#3c8dbc] border border-[#3c8dbc] p-1.5 rounded-lg text-[36px] shadow-sm transition-all"
                                        onClick={finalizeAudit}
                                    />
                                </Tooltip>
                            )}
                            <Tooltip content="Back to List" placement="bottom" className="bg-slate-600" arrow={false}>
                                <MdArrowBack
                                    className="cursor-pointer text-slate-400 hover:text-white hover:bg-slate-400 border border-slate-200 p-1.5 rounded-lg text-[36px] shadow-sm transition-all"
                                    onClick={() => router.back()}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* ── Filter Table ── */}
                <div className="px-6 py-6 bg-slate-50/30">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                        <GenericTable
                            tableHeading={tableHeading}
                            tableData={tableData}
                            tableObjects={tableObjects}
                            getData={fetchAuditDetails}
                            recsPerPage={recsPerPage}
                            setRecsPerPage={setRecsPerPage}
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            totalRecs={totalRecs}
                            setTotalRecs={setTotalRecs}
                            numOfPages={numOfPages}
                            setNumOfPages={setNumOfPages}
                            runCount={runCount}
                            setRunCount={setRunCount}
                            searchText={searchText}
                            setSearchText={setSearchText}
                        />
                    </div>
                </div>

                {/* ── Footer Info ── */}
                <div className="px-10 py-6 border-t border-slate-50 bg-white flex items-center gap-6">
                    <div className="w-12 h-12 bg-blue-50 text-[#3c8dbc] rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                        <MdInfo size={24} />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-1">Live Verification Sync</h4>
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed max-w-4xl italic">
                            All changes are updated instantly. Finalizing the audit will freeze these records and generate the discrepancy report for management review.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

const AssetReconciliation = () => {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FB]">
                <FaSpinner className="animate-spin text-[#3c8dbc] mb-4" size={48} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Waking Verification Engine...</p>
            </div>
        }>
            <ReconciliationContent />
        </Suspense>
    );
};

export default AssetReconciliation;
