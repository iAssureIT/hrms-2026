"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import S3FileUpload from "react-s3";
import { useRouter, useParams, usePathname } from "next/navigation";
import { Buffer } from "buffer";
import { Tooltip } from "flowbite-react";
import ls from "localstorage-slim";
import {
    MdSettings,
    MdPictureAsPdf,
    MdClose,
    MdImage,
    MdOutlineDescription,
    MdCalendarToday,
    MdBusiness,
    MdCall,
    MdAssignmentTurnedIn
} from "react-icons/md";
import { FaFileUpload, FaTools, FaRupeeSign, FaSpinner } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";
import { FiTrash2 } from "react-icons/fi";
import moment from "moment";

if (typeof window !== "undefined") {
    window.Buffer = window.Buffer || Buffer;
}

const AddMaintenance = () => {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const fileInputRef = useRef(null);

    const [loggedInRole, setLoggedInRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingAssets, setFetchingAssets] = useState(false);

    // ── Asset Identification ──
    const [assetList, setAssetList] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [assetSearch, setAssetSearch] = useState("");
    const [showAssetDropdown, setShowAssetDropdown] = useState(false);

    // ── Issue Diagnostic & Vendor ──
    const [issueDescription, setIssueDescription] = useState("");
    const [reportedDate, setReportedDate] = useState(moment().format("YYYY-MM-DD"));
    const [vendorName, setVendorName] = useState("");
    const [vendorContact, setVendorContact] = useState("");
    const [isAMC, setIsAMC] = useState(false);

    // ── Materials & Labor ──
    const [spareParts, setSpareParts] = useState([{ partName: "", qty: 0, unitPrice: 0, totalAmount: 0 }]);
    const [serviceFee, setServiceFee] = useState(0);

    // ── Service Documentation ──
    const [maintenanceDate, setMaintenanceDate] = useState("");
    const [status, setStatus] = useState("Awaiting Approval");
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // ── Calculations ──
    const [subtotal, setSubtotal] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    const s3Config = {
        bucketName: process.env.NEXT_PUBLIC_BUCKET_NAME,
        region: process.env.NEXT_PUBLIC_REGION,
        accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_SECRET_KEY,
    };

    const s3upload = (file) => {
        return new Promise((resolve, reject) => {
            S3FileUpload.uploadFile(file, s3Config)
                .then((data) => resolve(data.location))
                .catch((error) => reject(error));
        });
    };

    useEffect(() => {
        if (pathname.includes("admin")) setLoggedInRole("admin");
        else if (pathname.includes("center")) setLoggedInRole("center");
        else if (pathname.includes("asset")) setLoggedInRole("asset");
        else if (pathname.includes("account")) setLoggedInRole("account");
        else setLoggedInRole("executive");
    }, [pathname]);

    useEffect(() => {
        getAssets();
    }, []);

    const getAssets = async (search = "") => {
        try {
            const userDetails = ls.get("userDetails", { decrypt: true });
            const roles = userDetails?.roles || [];
            const isAssetIncharge = roles.includes("asset-incharge");
            const isAssetAdmin = roles.includes("admin") || roles.includes("asset-admin");

            setFetchingAssets(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/post/list`, {
                searchText: search || "-",
                recsPerPage: 50,
                pageNumber: 1,
                excludeStatus: "DISPOSED",
                center_ID: (isAssetIncharge && !isAssetAdmin) ? userDetails?.center_id : "all"
            });
            setAssetList(res.data.tableData || []);
        } catch (error) {
            console.error("Error fetching assets:", error);
        } finally {
            setFetchingAssets(false);
        }
    };

    useEffect(() => {
        const partsTotal = spareParts.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0);
        const fee = parseFloat(serviceFee) || 0;
        const total = partsTotal + fee;
        setSubtotal(total);
        setTotalCost(total);
    }, [spareParts, serviceFee]);

    const handlePartChange = (index, field, value) => {
        const updatedParts = [...spareParts];
        updatedParts[index][field] = value;
        if (field === "qty" || field === "unitPrice") {
            updatedParts[index].totalAmount = (parseFloat(updatedParts[index].qty) || 0) * (parseFloat(updatedParts[index].unitPrice) || 0);
        }
        setSpareParts(updatedParts);
    };

    const addPartRow = () => setSpareParts([...spareParts, { partName: "", qty: 0, unitPrice: 0, totalAmount: 0 }]);
    const removePartRow = (index) => setSpareParts(spareParts.filter((_, i) => i !== index));

    const handleAssetSelect = (asset) => {
        setSelectedAsset(asset);
        setAssetSearch(asset.assetID + " - " + asset.assetName);
        setShowAssetDropdown(false);
    };

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        for (let file of files) {
            try {
                const url = await s3upload(file);
                setUploadedFiles(prev => [...prev, { fileName: file.name, url }]);
            } catch (error) {
                Swal.fire(" ", "Upload failed for " + file.name);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAsset) return Swal.fire(" ", "Please select an asset");

        const userDetails = ls.get("userDetails", { decrypt: true });
        const formValues = {
            asset_id: selectedAsset._id,
            assetID: selectedAsset.assetID,
            assetName: selectedAsset.assetName,
            category: selectedAsset.category,
            subCategory: selectedAsset.subCategory,
            location: {
                center: selectedAsset.currentAllocation?.center,
                subLocation: selectedAsset.currentAllocation?.subLocation
            },
            department: {
                department: selectedAsset.currentAllocation?.department,
                subDepartment: selectedAsset.currentAllocation?.subDepartment
            },
            issue: {
                description: issueDescription,
                reportedDate: reportedDate || new Date(),
                isAMC: isAMC
            },
            vendor: { name: vendorName, contact: vendorContact },
            costs: {
                spareParts: spareParts,
                serviceFee: serviceFee,
                totalAmount: totalCost
            },
            docs: uploadedFiles.map(f => f.url),
            status: "AWAITING_APPROVAL",
            user_id: userDetails?.userId || userDetails?._id,
            userName: userDetails?.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails?.name || "System")
        };

        setLoading(true);
        try {
            if (params._id) {
                await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance/patch/${params._id}`, formValues);
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance`, formValues);
            }
            Swal.fire(" ", `Maintenance record ${params._id ? "updated" : "logged"} successfully`);
            router.push(`/${loggedInRole}/management/maintenance-list`);
        } catch (error) {
            Swal.fire(" ", "Failed to process maintenance record");
        } finally {
            setLoading(false);
        }
    };

    const SectionHeader = ({ title, subtitle }) => (
        <div className="mb-5 border-b border-gray-100 pb-2">
            <h3 className="text-[15px] font-bold text-black uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] font-normal text-gray-500">{subtitle}</p>
        </div>
    );

    const IconWrapper = ({ icon: Icon }) => (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                <Icon className="icon" />
            </span>
        </div>
    );

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md">
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300 flex justify-between px-10 py-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-green-600">Asset Management</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Log <span className="text-green-600 font-black">Maintenance</span>
                            </h1>
                        </div>
                        <div className="flex gap-3 my-5">
                            <Tooltip content="Maintenance List" placement="bottom" className="bg-green" arrow={false}>
                                <CiViewList
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={() => router.push(`/${loggedInRole}/management/maintenance-list`)}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-6">
                    <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 grid-cols-1 gap-8">
                        <div className="lg:col-span-12 space-y-8">

                            {/* SECTION 1: Asset Identification */}
                            <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50/30">
                                <SectionHeader title="Asset Identification" subtitle="Select the asset requiring maintenance." />
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="inputLabel mb-1">Select Asset <span className="text-red-500">*</span></label>
                                        <div className="relative mt-2 rounded-md shadow-sm">
                                            <IconWrapper icon={FaTools} />
                                            <input
                                                type="text"
                                                className="stdInputField w-full pl-12"
                                                placeholder="Search by Asset ID or Name..."
                                                value={assetSearch}
                                                onChange={(e) => {
                                                    setAssetSearch(e.target.value);
                                                    setShowAssetDropdown(true);
                                                    getAssets(e.target.value);
                                                }}
                                                onFocus={() => setShowAssetDropdown(true)}
                                            />
                                            {showAssetDropdown && assetList.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto">
                                                    {assetList.map(asset => (
                                                        <div
                                                            key={asset._id}
                                                            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-0"
                                                            onClick={() => handleAssetSelect(asset)}
                                                        >
                                                            <p className="font-bold text-sm text-gray-800">{asset.assetID} - {asset.assetName}</p>
                                                            <p className="text-[10px] text-gray-500 lowercase">{asset.category} / {asset.subCategory}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedAsset && (
                                        <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded border border-green/20">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Location</p>
                                                <p className="text-sm font-semibold">{selectedAsset.currentAllocation?.center?.name || "Not Allocated"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Department</p>
                                                <p className="text-sm font-semibold">{selectedAsset.currentAllocation?.department?.name || "Global"}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECTION 2: Issue Diagnostic & Vendor */}
                            <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50/30">
                                <SectionHeader title="Issue Diagnostic & Vendor" subtitle="Details about the fault and service provider." />
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="inputLabel">Issue Description</label>
                                            <div className="relative mt-2">
                                                <IconWrapper icon={MdOutlineDescription} />
                                                <input type="text" className="stdInputField w-full pl-12"
                                                    placeholder="Short summary of issue"
                                                    value={issueDescription} onChange={e => setIssueDescription(e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="inputLabel">Reported Date</label>
                                            <div className="relative mt-2">
                                                <IconWrapper icon={MdCalendarToday} />
                                                <input type="date" className="stdInputField w-full pl-12"
                                                    value={reportedDate} onChange={e => setReportedDate(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="inputLabel">Vendor Name</label>
                                            <div className="relative mt-2">
                                                <IconWrapper icon={MdBusiness} />
                                                <input type="text" className="stdInputField w-full pl-12"
                                                    placeholder="Service center or vendor"
                                                    value={vendorName} onChange={e => setVendorName(e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="inputLabel">Vendor Contact <span className="text-red-500">*</span></label>
                                            <div className="relative mt-2">
                                                <IconWrapper icon={MdCall} />
                                                <input 
                                                    type="text" 
                                                    className="stdInputField w-full pl-12"
                                                    placeholder="10-digit phone number"
                                                    maxLength={10}
                                                    value={vendorContact} 
                                                    onChange={e => setVendorContact(e.target.value.replace(/[^0-9]/g, ""))} 
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="amc"
                                            checked={isAMC}
                                            onChange={e => setIsAMC(e.target.checked)}
                                            className="w-4 h-4 text-green border-gray-300 rounded focus:ring-green"
                                        />
                                        <label htmlFor="amc" className="text-sm font-medium text-gray-700">Covered under AMC / Warranty</label>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: Materials & Labor */}
                            <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50/30">
                                <SectionHeader title="Materials & Labor" subtitle="Breakdown of parts and service fees." />
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 italic font-normal text-[11px] text-gray-400">
                                                <th className="pb-2 min-w-[250px]">Part/Material Description</th>
                                                <th className="pb-2 w-28 text-center">Qty</th>
                                                <th className="pb-2 w-44">Unit Price</th>
                                                <th className="pb-2 w-44">Total</th>
                                                <th className="pb-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {spareParts.map((part, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-3">
                                                        <input type="text" className="stdInputField w-full !p-1"
                                                            placeholder="e.g. Battery replacement"
                                                            value={part.partName} onChange={e => handlePartChange(idx, "partName", e.target.value)} />
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <input type="number" className="stdInputField w-full text-center !p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            value={part.qty} onChange={e => handlePartChange(idx, "qty", e.target.value)} />
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <input type="number" className="stdInputField w-full text-center !p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            value={part.unitPrice} onChange={e => handlePartChange(idx, "unitPrice", e.target.value)} />
                                                    </td>
                                                    <td className="py-3 px-2 font-bold text-gray-700 text-right pr-10">
                                                        ₹ {part.totalAmount?.toLocaleString()}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <FiTrash2 className="text-red-400 cursor-pointer hover:text-red-600" onClick={() => removePartRow(idx)} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button
                                        type="button"
                                        onClick={addPartRow}
                                        className="mt-3 text-[11px] font-bold text-green uppercase tracking-widest flex items-center gap-1 hover:text-Green"
                                    >
                                        <MdSettings /> Add Spare Part
                                    </button>
                                </div>

                                <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="inputLabel">Service / Labor Fee</label>
                                            <div className="relative mt-2">
                                                <IconWrapper icon={FaRupeeSign} />
                                                <input type="number" className="stdInputField w-full pl-12"
                                                    value={serviceFee} onChange={e => setServiceFee(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: Cost Breakdown & Status */}
                            <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50/30 mt-8">
                                <SectionHeader title="Cost Breakdown & Status" subtitle="Finalize expenses and activity state." />
                                
                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Left side: Money */}
                                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium tracking-tight">Subtotal (Parts + Service)</span>
                                            <span className="text-gray-900 font-bold">₹ {subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-4">
                                            <span className="text-gray-500 font-medium tracking-tight">Tax / VAT (0%)</span>
                                            <span className="text-gray-900 font-bold">₹ 0</span>
                                        </div>
                                        <div className="pt-2">
                                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 block">Net Payable Amount</span>
                                            <p className="text-4xl font-black text-green tracking-tighter">₹ {totalCost.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Right side: Status & Date */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="inputLabel">Maintenance Date</label>
                                                <div className="relative mt-2">
                                                    <IconWrapper icon={MdCalendarToday} />
                                                    <input type="date" className="stdInputField w-full pl-12"
                                                        value={maintenanceDate} onChange={e => setMaintenanceDate(e.target.value)} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="inputLabel">Process Status</label>
                                                <div className="relative mt-2 text-green">
                                                    <IconWrapper icon={MdAssignmentTurnedIn} />
                                                    <select className="stdSelectField w-full pl-12 font-bold" value={status} onChange={e => setStatus(e.target.value)}>
                                                        <option value="Awaiting Approval">Awaiting Approval</option>
                                                        <option value="Scheduled">Scheduled</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Under Observation">Under Observation</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Documentation */}
                                        <div>
                                            <label className="inputLabel mb-2 block">Service Reports / Invoices</label>
                                            <div
                                                className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 cursor-pointer transition-all hover:border-green group"
                                                onClick={() => fileInputRef.current.click()}
                                            >
                                                <FaFileUpload className="mx-auto text-gray-300 text-2xl mb-1 group-hover:text-green transition-colors" />
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Click to upload documents</p>
                                                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {uploadedFiles.map((file, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm text-[11px] font-bold text-gray-600">
                                                        {file.fileName.endsWith('.pdf') ? <MdPictureAsPdf className="text-red-500" /> : <MdImage className="text-blue-500" />}
                                                        <span className="truncate max-w-[120px]">{file.fileName}</span>
                                                        <MdClose className="text-gray-400 cursor-pointer hover:text-red-500 ml-1" onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Submission */}
                            <div className="flex justify-end pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="formButtons"
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : (params._id ? "Update Record" : "Log Maintenance")}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AddMaintenance;
