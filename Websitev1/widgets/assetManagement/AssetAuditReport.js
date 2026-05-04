"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import {
    MdInfo,
    MdArrowBack,
    MdCheckCircle,
    MdLayers,
    MdPin,
    MdLabel
} from "react-icons/md";
import {
    HiSquares2X2,
    HiUserGroup,
    HiShieldCheck,
    HiClock
} from "react-icons/hi2";
import { FaSpinner } from "react-icons/fa";
import { Tooltip } from "flowbite-react";
import GenericTable from "@/widgets/GenericTable/FilterTable";

const getStatusColor = (colorClass) => {
    const colors = {
        'bg-aqua': '#00c0ef',
        'bg-green': '#00a65a',
        'bg-red': '#dd4b39',
        'bg-yellow': '#f39c12',
        'bg-cyan': '#00c0ef'
    };
    return colors[colorClass] || colors['bg-aqua'];
};

const StatusCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className={`flex bg-white shadow-sm transition-all duration-300 rounded-none md:rounded-sm overflow-hidden h-24 border border-gray-200`}>
        <div
            style={{ backgroundColor: getStatusColor(colorClass) }}
            className="w-20 md:w-24 flex items-center justify-center text-white shrink-0"
        >
            <Icon size={36} className="text-white opacity-90" />
        </div>
        <div className="flex flex-col justify-center px-4 py-2 flex-grow overflow-hidden relative">
            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1 line-clamp-2 leading-snug whitespace-normal break-words">
                {label}
            </span>
            <h3 className="text-2xl font-extrabold text-gray-800 leading-none items-baseline flex gap-1">
                {value}
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Units</span>
            </h3>
        </div>
    </div>
);


const ReportContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auditId = searchParams.get("auditId");

    const [activeAudit, setActiveAudit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState([]);
    
    // Table Pagination/State
    const [recsPerPage, setRecsPerPage] = useState(10);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalRecs, setTotalRecs] = useState(0);
    const [numOfPages, setNumOfPages] = useState(0);
    const [runCount, setRunCount] = useState(1);
    const [searchText, setSearchText] = useState("");

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
            item.assetID?.toLowerCase().includes(searchText.toLowerCase())
        );

        setTotalRecs(filtered.length);

        // 2. Slice for pagination
        const startIndex = (pageNumber - 1) * recsPerPage;
        const sliced = filtered.slice(startIndex, startIndex + recsPerPage);

        // 3. Transform data for GenericTable
        const transformed = sliced.map(item => ({
            _id: item.asset_id,
            assetID_fixed: `<span class="font-black text-gray-400 text-[10px] uppercase">${item.assetID}</span>`,
            assetName_fixed: `<span class="font-bold text-slate-700 text-[13px]">${item.assetName}</span>`,
            physicalStatus: `
                <span class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                    item.physicalStatus === 'Found' ? 'bg-green-50 text-green-600 border-green-200' :
                    item.physicalStatus === 'Missing' ? 'bg-red-50 text-red-600 border-red-200' :
                    item.physicalStatus === 'Damaged' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-slate-50 text-slate-400 border-slate-200 border-dashed'
                }">
                    ${item.physicalStatus}
                </span>
            `,
            locationMatch: `
                <div class="flex items-center gap-1">
                    ${item.locationMatch 
                        ? '<span class="text-green-600 font-bold text-[11px]">MATCHED</span>' 
                        : '<span class="text-red-500 font-bold text-[11px]">MISMATCHED</span>'}
                </div>
            `,
            verifiedAt: item.verifiedAt ? moment(item.verifiedAt).format("DD MMM YYYY, hh:mm A") : "-"
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
            console.error("Error loading audit:", err);
            router.back();
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <FaSpinner className="animate-spin text-[#3c8dbc] mb-4" size={48} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest text-center">Generating Audit Report...</p>
            </div>
        );
    }

    if (!activeAudit) return null;

    const tableHeading = {
        assetID_fixed: "Asset ID",
        assetName_fixed: "Asset Name",
        physicalStatus: "Final Status",
        locationMatch: "Location Integrity",
        verifiedAt: "Verification Date"
    };

    const tableObjects = {
        paginationApply: true,
        searchApply: true,
        downloadApply: true,
        tableName: "Detailed Findings",
    };

    return (
        <section className="section admin-box box-primary no-print">
            <div className="hr-card hr-fade-in">
                {/* ── Page Header ── */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Verification Report • {activeAudit.auditNo}</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Audit <span className="text-[#3c8dbc] font-black">Findings</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-6 pt-4 md:pt-0 mb-1">
                            <div className="flex items-center gap-4 bg-slate-50 px-6 py-2.5 rounded-[22px] border border-slate-100 shadow-sm">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance</p>
                                    <p className="text-lg font-black text-slate-800 leading-none">VERIFIED</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border-[3px] border-emerald-500 flex items-center justify-center text-emerald-600">
                                    <MdCheckCircle size={22} />
                                </div>
                            </div>

                            <Tooltip content="Back to List" placement="bottom" className="bg-slate-600" arrow={false}>
                                <div onClick={() => router.back()}
                                    className="text-slate-400 border border-slate-200 p-1.5 rounded cursor-pointer hover:bg-slate-400 hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[32px] w-[32px]">
                                    <MdArrowBack size={20} />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-[12px] leading-relaxed mt-2 pl-1 italic">
                        {activeAudit.auditTitle}
                    </p>
                </div>


                {/* ── Metric Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatusCard
                        label="Audit Scope"
                        value={activeAudit.summary.totalAssets}
                        icon={HiSquares2X2}
                        colorClass="bg-yellow"
                    />
                    <StatusCard
                        label="Verified Found"
                        value={activeAudit.summary.verifiedAssets - activeAudit.summary.missingAssets}
                        icon={HiShieldCheck}
                        colorClass="bg-green"
                    />
                    <StatusCard
                        label="Missing Assets"
                        value={activeAudit.summary.missingAssets}
                        icon={HiClock}
                        colorClass="bg-red"
                    />
                    <StatusCard
                        label="Discrepancies"
                        value={activeAudit.summary.discrepancyCount}
                        icon={MdLayers}
                        colorClass="bg-cyan"
                    />
                </div>


                {/* ── Detailed Table Section ── */}
                <div className="px-10 pb-10">
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm overflow-hidden">
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

                {/* ── Professional Footer ── */}
                <div className="px-10 py-6 border-t border-slate-50 bg-white flex items-center gap-6 no-print">
                    <div className="w-12 h-12 bg-blue-50 text-[#3c8dbc] rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <MdInfo size={24} />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-1">Official Verification Record</h4>
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed max-w-4xl italic">
                            This report summarizes the final physical verification findings for the selected audit scope. All records are locked and validated in the master asset registry. Generated on {moment().format('DD MMM YYYY')}.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .box { 
                        border: none !important; 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        width: 100% !important; 
                        max-width: 100% !important; 
                    }
                    .section { padding: 0 !important; }
                    .GenericTable section { padding: 0 !important; }
                    .GenericTable .flex.justify-between, .GenericTable nav { display: none !important; }
                    .bg-slate-50\/20 { background-color: white !important; }
                    .rounded-3xl { border-radius: 0 !important; }
                }
            `}</style>
        </section>
    );
};

const AssetAuditReport = () => {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <FaSpinner className="animate-spin text-[#3c8dbc] mb-4" size={48} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Waking Report Engine...</p>
            </div>
        }>
            <ReportContent />
        </Suspense>
    );
};

export default AssetAuditReport;
