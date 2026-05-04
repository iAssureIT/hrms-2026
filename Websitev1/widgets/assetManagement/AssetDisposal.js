"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import { FaSearch, FaCloudUploadAlt, FaTrashAlt, FaSpinner, FaCheck, FaExclamationTriangle, FaHistory, FaBuilding, FaRupeeSign, FaListUl } from "react-icons/fa";
import { Tooltip } from "flowbite-react";
import { BsPlusSquare } from "react-icons/bs";
import { MdGavel, MdOutlineFactCheck, MdInfo, MdCheckCircle, MdDescription, MdDateRange, MdLabel, MdWidgets } from "react-icons/md";
import { CiViewList } from "react-icons/ci";

import Swal from "sweetalert2";

const AssetDisposal = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }));
    const [center_id, setCenter_id] = useState("");
    const [centerNameList, setCenterNameList] = useState([]);
    const [loggedInRole, setLoggedInRole] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        asset_id: "",
        assetName: "",
        assetCode: "",
        assetCategory: "",
        assetModel: "",
        nbvAtDisposal: 0,
        purchaseCost: 0,
        disposalType: "Public/Private Sale",
        disposalDate: moment().format("YYYY-MM-DD"),
        disposalValue: 0,
        makerRemarks: "",
        uploadProof: []
    });

    const [financialImpact, setFinancialImpact] = useState(0);
    const [assetSuggestions, setAssetSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isApprover, setIsApprover] = useState(false);
    const [isIncharge, setIsIncharge] = useState(false);

    useEffect(() => {
        let role = "executive";
        let c_id = "all";

        if (pathname.includes("admin")) {
            role = "admin";
            c_id = "all";
        } else if (pathname.includes("center")) {
            role = "center";
            c_id = userDetails?.center_id;
        } else if (pathname.includes("asset")) {
            role = "asset";
            c_id = "all";
        } else if (pathname.includes("account")) {
            role = "account";
            c_id = "all";
        }
        setLoggedInRole(role);

        // Check if user is an approver (admin or manager) or incharge
        const roles = userDetails?.role || userDetails?.roles || [];
        const roleArray = Array.isArray(roles) ? roles : [roles];

        const isAppr = roleArray.some(r =>
            r.toLowerCase().includes("admin") ||
            r.toLowerCase().includes("manager")
        );
        setIsApprover(isAppr);

        const isInch = roleArray.some(r =>
            r.toLowerCase().includes("incharge")
        );
        setIsIncharge(isInch);

        // If user is an incharge, pre-fill center_id and it should not be "all"
        if (isInch && userDetails?.center_id) {
            setCenter_id(userDetails.center_id);
        } else {
            setCenter_id(c_id);
        }

        getCenterList();
    }, [pathname, userDetails]);

    const getCenterList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setCenterNameList(data);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        const impact = (formData.disposalValue || 0) - (formData.nbvAtDisposal || 0);
        setFinancialImpact(impact);
    }, [formData.disposalValue, formData.nbvAtDisposal]);

    const searchAssets = async (searchText) => {
        setFormData({ ...formData, assetCode: searchText });
        if (searchText.length < 2) {
            setAssetSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/get/list`, {
                searchText: searchText,
                center_id: center_id,
                recsPerPage: 10,
                pageNumber: 1
            });
            if (res.data && res.data.tableData) {
                setAssetSuggestions(res.data.tableData);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error("Asset search error:", error);
        }
    };

    const handleAssetSelect = (asset) => {
        setFormData({
            ...formData,
            asset_id: asset._id,
            assetName: asset.assetName,
            assetCode: asset.assetID,
            assetCategory: asset.category,
            assetModel: asset.model || "N/A",
            purchaseCost: asset.purchaseValue || 0,
            nbvAtDisposal: asset.netBookValue || 0
        });
        setShowSuggestions(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ── Section Header ──
    const SectionHeader = ({ title, subtitle }) => (
        <div className="mb-5 border-b border-gray-100 pb-2">
            <h3 className="text-[15px] font-bold text-black uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] font-normal text-gray-500">{subtitle}</p>
        </div>
    );

    const IconWrapper = ({ icon: Icon }) => (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm pr-2 border-r-2 border-gray-300">
                <Icon className="icon" />
            </span>
        </div>
    );


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.asset_id) {
            Swal.fire("Error", "Please select a valid asset", "error");
            return;
        }
        if (!center_id || center_id === "all") {
            Swal.fire("Error", "Please select a center for disposal", "error");
            return;
        }
        if (!formData.makerRemarks || formData.makerRemarks.trim() === "") {
            Swal.fire("Error", "Please provide remarks for disposal", "error");
            return;
        }
        if (formData.disposalValue < 0) {
            Swal.fire("Error", "Disposal value cannot be negative", "error");
            return;
        }
        setSubmitting(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-disposal/post`, {
                ...formData,
                center_id: center_id,
                user_id: userDetails?.user_id || userDetails?.userId || userDetails?._id
            });
            if (res.data.success) {
                Swal.fire({
                    title: "Request Created",
                    text: "Asset Disposal Request has been submitted for approval.",
                    icon: "success",
                    confirmButtonColor: "#16a34a"
                });
                setFormData({
                    asset_id: "",
                    assetName: "",
                    assetCode: "",
                    assetCategory: "",
                    assetModel: "",
                    nbvAtDisposal: 0,
                    purchaseCost: 0,
                    disposalType: "Public/Private Sale",
                    disposalDate: moment().format("YYYY-MM-DD"),
                    disposalValue: 0,
                    makerRemarks: "",
                    uploadProof: []
                });
            }
        } catch (error) {
            console.error("Disposal error:", error);
            Swal.fire("Error", "Failed to initialize disposal request", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="section admin-box box-primary">
            <div className="hr-card hr-fade-in">
                {/* --- Page Header --- */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Asset Management</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Asset <span className="text-[#3c8dbc] font-black">Disposal</span>
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-4 me-10 pt-4 md:pt-0 mb-1">
                            <Tooltip content="Asset List" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                                <div onClick={() => router.push(`/${loggedInRole}/management`)}
                                    className="text-[#3c8dbc] border border-[#3c8dbc] p-1.5 rounded cursor-pointer hover:bg-[#3c8dbc] hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[32px] w-[32px]">
                                    <CiViewList size={20} />
                                </div>
                            </Tooltip>
                            <Tooltip content="Disposal Approval List" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                                <div onClick={() => router.push(`/${loggedInRole}/management/disposal-approval`)}
                                    className="text-[#3c8dbc] border border-[#3c8dbc] p-1.5 rounded cursor-pointer hover:bg-[#3c8dbc] hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[32px] w-[32px]">
                                    <FaListUl size={20} />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                        Manage the decommissioning and disposal of enterprise assets with proper documentation and approval workflows.
                    </p>
                </div>

                <div className="px-10 py-6">
                    <div className="bg-white text-secondary">
                        <div className="space-y-10">
                            {/* Main Form Area */}
                            <div className="w-full space-y-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Section 1: Asset Selection */}
                                    <div className="border border-gray-200 rounded-lg p-5 mt-2 shadow-md">
                                        <SectionHeader
                                            title="Asset Selection"
                                            subtitle="Select an inactive asset for disposal."
                                        />

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="relative">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Search Inactive Asset *</label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={FaSearch} />
                                                    <input
                                                        type="text"
                                                        className="stdInputField pl-12 h-10"
                                                        placeholder="Search by ID or Name..."
                                                        value={formData.assetCode}
                                                        onChange={(e) => searchAssets(e.target.value)}
                                                    />
                                                </div>
                                                {showSuggestions && assetSuggestions.length > 0 && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                                                        {assetSuggestions.map(asset => (
                                                            <div
                                                                key={asset._id}
                                                                className="px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 flex justify-between items-center"
                                                                onClick={() => handleAssetSelect(asset)}
                                                            >
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-900">{asset.assetName}</p>
                                                                    <p className="text-[9px] text-gray-400 font-black uppercase">{asset.assetID}</p>
                                                                </div>
                                                                <span className="text-[9px] font-black text-gray-400 uppercase">{asset.category}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Center *</label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={FaBuilding} />
                                                    <select
                                                        className="stdSelectField pl-12"
                                                        value={center_id}
                                                        onChange={(e) => setCenter_id(e.target.value)}
                                                        disabled={isIncharge}
                                                    >
                                                        <option value="all">All Centers</option>
                                                        {centerNameList.map(c => (
                                                            <option key={c._id} value={c._id}>{c.centerName}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {formData.asset_id && (
                                            <div className="mt-8 grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-500">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase">Selected Asset</p>
                                                    <p className="text-xs font-bold text-[#3c8dbc] uppercase">{formData.assetName}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase">Original Cost</p>
                                                    <p className="text-xs font-bold text-gray-900">₹{formData.purchaseCost.toLocaleString()}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase">Book Value</p>
                                                    <p className="text-xs font-bold text-gray-900">₹{formData.nbvAtDisposal.toLocaleString()}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase">Category</p>
                                                    <p className="text-xs font-black text-gray-400 uppercase">{formData.assetCategory}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 2: Disposal Terms */}
                                    <div className="border border-gray-200 rounded-lg p-5 shadow-md">
                                        <SectionHeader
                                            title="Disposal Terms & Valuation"
                                            subtitle="Define the financial parameters of derecognition."
                                        />

                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Disposal Method</label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdWidgets} />
                                                    <select
                                                        name="disposalType"
                                                        className="stdSelectField pl-12"
                                                        value={formData.disposalType}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="Public/Private Sale">Public/Private Sale</option>
                                                        <option value="Scrap/Destruction">Scrap/Destruction</option>
                                                        <option value="Donation">Donation</option>
                                                        <option value="Trade-in">Trade-in</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Effective Date</label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdDateRange} />
                                                    <input
                                                        type="date"
                                                        name="disposalDate"
                                                        className="stdInputField pl-12"
                                                        value={formData.disposalDate}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Realization Value (₹) *</label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={FaRupeeSign} />
                                                    <input
                                                        type="number"
                                                        name="disposalValue"
                                                        className="stdInputField pl-12"
                                                        placeholder="0.00"
                                                        value={formData.disposalValue}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center gap-6 p-6 bg-slate-900 rounded-xl text-white">
                                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                                                <MdOutlineFactCheck className="text-amber-400" size={24} />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Projected Financial Impact</p>
                                                <div className="flex items-baseline gap-2">
                                                    <h2 className={`text-2xl font-black ${financialImpact >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                        {financialImpact >= 0 ? "+" : "-"}₹{Math.abs(financialImpact).toLocaleString()}
                                                    </h2>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                        ({financialImpact >= 0 ? "Gain" : "Loss"} on Sale)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="hidden md:block text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Audit Compliant</p>
                                                <MdCheckCircle className="text-green-500 ml-auto" size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Justification */}
                                    <div className="border border-gray-200 rounded-lg p-5 shadow-md">
                                        <SectionHeader
                                            title="Justification & Proofs"
                                            subtitle="Provide reasoning and attach supporting evidence."
                                        />

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Disposal Remarks *</label>
                                                <textarea
                                                    name="makerRemarks"
                                                    className="w-full border border-gray-200 rounded-lg p-4 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-[#3c8dbc] outline-none min-h-[100px] transition-all bg-gray-50/30"
                                                    placeholder="Provide detailed reasoning for derecognizing this asset from the registry..."
                                                    value={formData.makerRemarks}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="formButtons"
                                        >
                                            {submitting ? <FaSpinner className="animate-spin" /> : "Dispose"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
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
                    padding-left: 48px; /* Added for icons */
                    font-size: 13px;
                    font-weight: 700;
                    outline: none;
                    transition: all 0.2s;
                }
                .stdInputField:focus {
                    border-color: #3c8dbc;
                    box-shadow: 0 0 0 4px rgba(80, 200, 120, 0.05);
                }
                .stdSelectField {
                    height: 42px;
                    border: 1px solid #e5e7eb;
                    background: #ffffff;
                    border-radius: 8px;
                    width: 100%;
                    padding: 0 12px;
                    padding-left: 48px; /* Added for icons */
                    font-size: 13px;
                    font-weight: 700;
                    outline: none;
                }
                .heading {
                    color: #333;
                }
            `}</style>
        </section>
    );
};

export default AssetDisposal;
