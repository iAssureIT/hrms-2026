"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import {
    MdOutlineLibraryAdd,
    MdInfo,
    MdGavel,
    MdCheckCircle,
    MdFilterList,
    MdExpandMore
} from "react-icons/md";
import { Tooltip } from "flowbite-react";
import GenericTable from "@/widgets/GenericTable/FilterTable";

const AssetAudit = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }) || {});

    // Table State
    const [allData, setAllData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recsPerPage, setRecsPerPage] = useState(10);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalRecs, setTotalRecs] = useState(0);
    const [numOfPages, setNumOfPages] = useState(0);
    const [runCount, setRunCount] = useState(1);
    const [searchText, setSearchText] = useState("");

    // Role-based prefix
    const rolePath = pathname.split("/")[1];
    const middlePath = pathname.split("/")[2];

    useEffect(() => {
        fetchAuditList();
    }, [runCount]);

    useEffect(() => {
        if (allData.length === 0) return;

        // 1. Filter by search text
        const filtered = allData.filter(item =>
            item.auditTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.auditNo?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.centerName?.toLowerCase().includes(searchText.toLowerCase())
        );

        setTotalRecs(filtered.length);

        // 2. Slice for pagination
        const startIndex = (pageNumber - 1) * recsPerPage;
        const sliced = filtered.slice(startIndex, startIndex + recsPerPage);

        // 3. Transform data for GenericTable
        const transformed = sliced.map(audit => ({
            ...audit,
            auditTitle_fixed: `
                <div class="flex flex-col">
                    <span class="text-[13px] font-bold text-slate-700">${audit.auditTitle}</span>
                    <span class="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">${audit.auditNo}</span>
                </div>
            `,
            scope: `
                <div class="flex flex-col">
                    <span class="text-[11px] font-bold text-slate-600">${audit.centerName || "All Centers"}</span>
                    <span class="text-[10px] text-slate-400 font-medium uppercase italic">${moment(audit.auditDate).format("DD MMM, YYYY")}</span>
                </div>
            `,
            progress: `
                <div class="flex flex-col items-center gap-1.5 py-1">
                    <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-[#3c8dbc] transition-all duration-1000" style="width: ${audit.summary.totalAssets > 0 ? Math.min(100, (audit.summary.verifiedAssets / audit.summary.totalAssets) * 100) : 0}%"></div>
                    </div>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        ${audit.summary.verifiedAssets} / ${audit.summary.totalAssets} VERIFIED
                    </span>
                </div>
            `,
            statusBadge: `
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border ${audit.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }">${audit.status}</span>
            `,
            action: `
                <div class="flex gap-2">
                    <button 
                        onclick="window.location.href='/${rolePath}/${middlePath}/${audit.status === 'Completed' ? 'asset-audit/report' : 'asset-reconciliation'}?auditId=${audit._id}'"
                        class="px-5 py-2 bg-white border border-slate-200 hover:bg-[#3c8dbc] hover:text-white hover:border-[#3c8dbc] rounded-xl text-[10px] font-black uppercase transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    >
                        ${audit.status === 'Completed' ? 'Full Report' : (userDetails?.roles?.includes("fa-accounts") ? 'View Details' : 'Resume Verify')}
                    </button>
                </div>
            `
        }));
        setTableData(transformed);
    }, [allData, searchText, pageNumber, recsPerPage]);

    const fetchAuditList = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-audit/get/list`, {
                center_id: userDetails?.center_id === "all" ? "all" : userDetails?.center_id
            });
            if (res.data.success) {
                setAllData(res.data.tableData || []);
            }
        } catch (err) {
            console.error("Error fetching audits:", err);
        } finally {
            setLoading(false);
        }
    };

    const tableHeading = {
        auditTitle_fixed: "Audit Identification",
        scope: "Scope & Date",
        progress: "Verification Progress",
        statusBadge: "Status",
        action: "Actions"
    };

    const tableObjects = {
        apiURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-audit`,
        paginationApply: true,
        searchApply: true,
        downloadApply: true,
        tableName: "Asset Verification Logs"
    };

    return (
        <section className="section admin-box box-primary">
            <div className="hr-card hr-fade-in">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Asset Operations</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Asset <span className="text-[#3c8dbc] font-black">Audits</span>
                            </h1>
                        </div>
                        <div className="flex gap-4 pt-4 md:pt-0 mb-1">
                            {rolePath === "asset" && !(userDetails?.roles?.includes("fa-accounts")) && (
                                <Tooltip content="Initialize New Audit" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                                    <MdOutlineLibraryAdd
                                        className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px]"
                                        onClick={() => router.push(`/${rolePath}/management/asset-audit/initialize`)}
                                    />
                                </Tooltip>
                            )}
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-[11px] leading-relaxed mt-2 pl-1">
                        Formally verify physical assets across enterprise locations. Ensure data integrity between digital records and floor reality.
                    </p>
                </div>


                <div className="space-y-6">
                    {/* Table Section */}
                    <div className="table-professional">
                        <GenericTable
                            tableObjects={tableObjects}
                            tableHeading={tableHeading}
                            setRunCount={setRunCount}
                            runCount={runCount}
                            recsPerPage={recsPerPage}
                            setRecsPerPage={setRecsPerPage}
                            getData={fetchAuditList}
                            tableData={tableData}
                            setTableData={setTableData}
                            numOfPages={numOfPages}
                            setNumOfPages={setNumOfPages}
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            totalRecs={totalRecs}
                            setTotalRecs={setTotalRecs}
                            loading={loading}
                        />
                    </div>

                    {/* Footer Info Cards */}
                    <div className="grid lg:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 flex gap-6 items-start hover:shadow-sm transition-all">
                            <div className="p-3 bg-blue-50 text-[#3c8dbc] rounded-2xl shrink-0">
                                <MdInfo size={24} />
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Audit Protocol</h3>
                                <div className="space-y-3">
                                    {[
                                        "Assets marked as 'Missing' trigger immediate discrepancy reports.",
                                        "Verify both physical condition and asset tag integrity.",
                                        "Damaged assets must be flagged for technical review."
                                    ].map((text, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-1 h-1 rounded-full bg-[#3c8dbc] mt-1.5 shrink-0" />
                                            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">{text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#3c8dbc] rounded-3xl p-8 text-white relative overflow-hidden group shadow-lg shadow-blue-100">
                            <div className="absolute -top-6 -right-6 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-white">
                                <MdGavel size={160} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 text-white rounded-lg">
                                        <MdCheckCircle size={20} />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/90">Compliance Standards</h3>
                                </div>
                                <p className="text-[13px] text-white/70 leading-relaxed font-semibold max-w-md">
                                    Adheres to Companies Act guidelines for annual physical verification of fixed assets.
                                </p>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .table-professional .GenericTable section {
                    padding-top: 0 !important;
                    margin-top: 0 !important;
                }
                .table-professional .GenericTable h1 {
                    display: none !important;
                }
                .table-professional .GenericTable .table-container {
                    border: none !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                }
                .table-professional .GenericTable table thead tr th:first-child,
                .table-professional .GenericTable table tbody tr td:first-child {
                    text-align: center !important;
                    width: 60px !important;
                }
                .table-professional .GenericTable table thead th,
                .table-professional .GenericTable table tbody td {
                    padding: 16px 20px !important;
                    white-space: nowrap !important;
                }
                .table-professional .GenericTable table thead th {
                    background-color: #f8fafc !important;
                    color: #64748b !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    border-bottom: 2px solid #f1f5f9 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                }
                .table-professional .GenericTable table tbody td {
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    color: #334155 !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }
                .table-professional .GenericTable table tbody tr:hover {
                    background-color: #f8fafc !important;
                }
            `}</style>
        </section>
    );
};

export default AssetAudit;
