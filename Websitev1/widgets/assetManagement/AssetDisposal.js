"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import { FaSearch, FaCloudUploadAlt, FaTrashAlt, FaSpinner, FaCheck, FaExclamationTriangle, FaHistory, FaBuilding, FaRupeeSign } from "react-icons/fa";
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
            .then((res) => setCenterNameList(res.data))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        // Form init logic if any
    }, [center_id]);

    useEffect(() => {
        const impact = parseFloat(formData.disposalValue) - parseFloat(formData.nbvAtDisposal);
        setFinancialImpact(impact || 0);
    }, [formData.disposalValue, formData.nbvAtDisposal]);

    const fetchRecentDisposals = async () => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-disposal/get/list`, {
                center_id: center_id === "all" ? undefined : center_id,
                status: "APPROVED"
            });
            if (res.data.success) {
                setRecentDisposals(res.data.tableData.slice(0, 5));
            }
        } catch (err) {
            console.error("Error fetching recent disposals:", err);
        }
    };

    const fetchPendingDisposals = async () => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-disposal/get/list`, {
                center_id: center_id === "all" ? undefined : center_id,
                status: "PENDING"
            });
            if (res.data.success) {
                setPendingDisposals(res.data.tableData);
            }
        } catch (err) {
            console.error("Error fetching pending disposals:", err);
        }
    };

    const searchAssets = async (text) => {
        setFormData({ ...formData, assetCode: text, asset_id: "" });
        const trimmedText = text.trim();
        if (trimmedText.length > 2) {
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/post/list`, {
                    searchText: trimmedText,
                    pageNumber: 1,
                    recsPerPage: 20,
                    center_ID: center_id,
                    assetStatus: "INACTIVE"
                });
                if (res.data.success) {
                    setAssetSuggestions(res.data.tableData);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Error searching assets:", err);
            }
        } else {
            setAssetSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleAssetSelect = (asset) => {
        const annualDepr = asset.purchaseCost / (asset.usefulLife || 10);
        const yearsHeld = moment(formData.disposalDate).diff(moment(asset.purchaseDate), 'years', true);
        const nbv = Math.max(0, asset.purchaseCost - (annualDepr * Math.max(0, yearsHeld)));

        setFormData({
            ...formData,
            assetName: asset.assetName,
            assetCode: asset.assetID,
            assetCategory: asset.category,
            assetModel: asset.model,
            asset_id: asset._id,
            purchaseCost: asset.purchaseCost,
            nbvAtDisposal: parseFloat(nbv.toFixed(2))
        });

        // Pre-populate center_id from asset if available, but NOT if user is an incharge (who is restricted)
        if (!isIncharge) {
            if (asset.currentAllocation?.center?._id) {
                setCenter_id(asset.currentAllocation.center._id);
            } else if (asset.center_id) {
                setCenter_id(asset.center_id);
            }
        }

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
                fetchRecentDisposals();
            }
        } catch (err) {
            Swal.fire("Error", "Failed to submit disposal request", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprovalAction = () => {
        // Redirection logic
        const targetPath = pathname.includes("admin") || pathname.includes("asset") || pathname.includes("management")
            ? `/${loggedInRole}/management/disposal-approval`
            : `/${loggedInRole}/asset-management/disposal-approval`;
        router.push(targetPath);
    };

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md">
                {/* ── Page Header ── */}
                <div className="border-b-2 border-slate-100 flex justify-between px-10 py-5 uppercase text-xl font-semibold">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                            <span className="text-green-600">Asset Management</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                            Asset <span className="text-green-600 font-black">Disposal</span>
                        </h1>
                    </div>
                    <div className="flex gap-3 my-5">
                        {(isApprover || isIncharge) && (
                            <Tooltip content="Disposal Approval List" placement="bottom" className="bg-green" arrow={false}>
                                <CiViewList
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={handleApprovalAction}
                                />
                            </Tooltip>
                        )}
                    </div>
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
                                                                    <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-tight">
                                                                        {asset.assetID} | {asset.category} {asset.serialNumber ? `| SN: ${asset.serialNumber}` : ""}
                                                                    </p>
                                                                </div>
                                                                <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${asset.assetStatus === "INACTIVE" || asset.assetStatus === "ASSET_APPROVAL_REJECTED"
                                                                    ? "bg-red-50 text-red-600 border-red-200"
                                                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                                                    }`}>
                                                                    {asset.assetStatus}
                                                                </div>
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
                                                        className="stdSelectField h-10 pl-12"
                                                        value={center_id}
                                                        onChange={(e) => setCenter_id(e.target.value)}
                                                        disabled={loggedInRole === "center" || isIncharge}
                                                    >
                                                        <option value="" disabled>-- Select Center --</option>
                                                        {centerNameList.map((center) => (
                                                            <option key={center._id} value={center._id}>
                                                                {center.centerName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {formData.asset_id && (
                                            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
                                                <div className="p-3 bg-green-50 text-green rounded-lg shrink-0">
                                                    <FaTrashAlt size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{formData.assetName}</h4>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{formData.assetCode}</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Valuation:</span>
                                                        <span className="text-xs font-bold text-green">₹{formData.nbvAtDisposal.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 2: Disposal Details */}
                                    <div className="border border-gray-200 rounded-lg p-5 mt-5 shadow-md">
                                        <SectionHeader
                                            title="Disposal Configuration"
                                            subtitle="Setup recovery value and disposal method."
                                        />

                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Disposal Type *</label>
                                                <select
                                                    name="disposalType"
                                                    className="stdSelectField mt-2"
                                                    value={formData.disposalType}
                                                    onChange={handleInputChange}
                                                >
                                                    <option>Public/Private Sale</option>
                                                    <option>Scrap</option>
                                                    <option>Donation</option>
                                                    <option>Lost/Damage</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Disposal Date *</label>
                                                <input
                                                    type="date"
                                                    name="disposalDate"
                                                    className="stdInputField mt-2"
                                                    value={formData.disposalDate}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Recovery Value (₹) *</label>
                                                <input
                                                    type="number"
                                                    name="disposalValue"
                                                    className="stdInputField mt-2"
                                                    value={formData.disposalValue}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        {formData.asset_id && (
                                            <div className={`mt-6 p-4 rounded-lg flex items-center justify-between border ${financialImpact >= 0 ? "bg-green/5 border-green/20" : "bg-red-50 border-red-100"}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`${financialImpact >= 0 ? "text-green" : "text-red-500"}`}>
                                                        {financialImpact >= 0 ? <MdCheckCircle size={24} /> : <FaExclamationTriangle size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Impact Analysis</p>
                                                        <h4 className={`text-sm font-bold ${financialImpact >= 0 ? "text-green" : "text-red-700"}`}>
                                                            {financialImpact >= 0 ? `+₹${financialImpact.toLocaleString()} Gain` : `-₹${Math.abs(financialImpact).toLocaleString()} Loss`}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Book Value</p>
                                                    <p className="text-xs font-bold text-gray-700">₹{formData.nbvAtDisposal.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 3: Documentation */}
                                    <div className="border border-gray-200 rounded-lg p-5 mt-5 shadow-md">
                                        <SectionHeader
                                            title="Remarks & Evidence"
                                            subtitle="Provide justification and supporting documents."
                                        />

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Maker Remarks *</label>
                                                <textarea
                                                    name="makerRemarks"
                                                    rows="4"
                                                    className="stdInputField w-full h-auto py-3 leading-relaxed"
                                                    placeholder="Reason for disposal..."
                                                    value={formData.makerRemarks}
                                                    onChange={handleInputChange}
                                                    required
                                                ></textarea>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Upload Proof / Certificate</label>
                                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-green hover:bg-green/5 transition-all cursor-pointer group h-[calc(100%-24px)] flex flex-col justify-center">
                                                    <FaCloudUploadAlt className="text-gray-300 mb-2 mx-auto group-hover:text-green transition-all" size={32} />
                                                    <p className="text-xs font-bold text-gray-500">Drop files here</p>
                                                </div>
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

                            {/* Bottom Information (Compliance) */}
                            <div className="pt-10 border-t-2 border-gray-100">
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
                    border-color: #50c878;
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
