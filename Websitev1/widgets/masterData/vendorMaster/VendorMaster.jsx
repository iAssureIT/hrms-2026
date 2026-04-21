"use client";

import { useState, useEffect, useRef } from "react";
import validator from "validator";
import Swal from "sweetalert2";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { CiViewList, CiBank } from "react-icons/ci";
import { Tooltip } from "flowbite-react";
import { FaFileUpload } from "react-icons/fa";
import {
    MdBusiness,
    MdCategory,
    MdLayers,
    MdFingerprint,
    MdConfirmationNumber,
    MdLocationCity,
    MdPerson,
    MdWork,
    MdPhone,
    MdEmail,
    MdAccountBalance,
    MdNumbers,
    MdQrCode,
    MdHome,
    MdLocationOn,
    MdPublic,
    MdLocalPostOffice,
    MdFileUpload,
    MdPictureAsPdf,
    MdImage,
    MdClose
} from "react-icons/md";
import S3FileUpload from "react-s3";

// === Style Helpers ===
const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-5 border-b border-gray-100 pb-2">
        <h3 className="hr-subheading">{title}</h3>
        <p className="hr-section-subtitle">{subtitle}</p>
    </div>
);

const IconWrapper = ({ icon: Icon }) => (
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <span className="text-gray-500 sm:text-sm pr-2 border-r-2" style={{ borderColor: '#e2e8f0' }}>
            <Icon className="icon" style={{ color: '#3c8dbc' }} />
        </span>
    </div>
);

const initialState = {
    vendorStatus: "Active",
    vendorInfo: {
        nameOfCompany: "",
        vendorCategory: "",
        vendorCategory_id: "",
        vendorSubCategory: "",
        vendorSubCategory_id: "",
        panNumber: "",
        gstin: "",
        tdsApplicable: false,
        centerName: "",
        primaryContactPersonName: "",
        designation: "",
        mobileNumber: "",
        officialEmailId: "",
    },
    bankDetails: {
        bankName: "",
        branchName: "",
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "",
    },
    addressDetails: {
        addressLine1: "",
        city: "",
        district: "",
        state: "",
        country: "",
        pinCode: "",
    },
};

export default function VendorFormPage() {
    const params = useParams();
    const router = useRouter();
    const pid = params?.id;

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState({
        vendorCategories: [],
        vendorSubCategories: [],
        centers: [],
    });
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const bankAccountTypes = [
        { label: "Saving Account", value: "Saving Account" },
        { label: "Current Account", value: "Current Account" },
        { label: "Salary Account", value: "Salary Account" },
        { label: "Fixed Deposit Account", value: "Fixed Deposit Account" },
        { label: "Recurring Deposit Account", value: "Recurring Deposit Account" },
        { label: "NRI Account", value: "NRI Account" },
        { label: "Joint Account", value: "Joint Account" },
        { label: "Business Account", value: "Business Account" }
    ];

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

    const processFiles = async (files) => {
        const maxSize = 10 * 1024 * 1024;
        const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!allowedTypes.includes(file.type)) {
                Swal.fire("", `File type not supported: ${file.name}`);
                continue;
            }
            if (file.size > maxSize) {
                Swal.fire("", `File too large: ${file.name}`);
                continue;
            }
            try {
                const s3url = await s3upload(file);
                setUploadedFiles((prev) => [
                    ...prev,
                    {
                        fileName: file.name,
                        fileData: s3url,
                        fileType: file.type,
                        fileSize: file.size,
                    },
                ]);
            } catch (error) {
                Swal.fire("", `Failed to upload ${file.name}`);
            }
        }
    };

    const handleFileSelect = (e) => {
        processFiles(e.target.files);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        processFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const removeFile = (index) => {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                const res = await axios.get("/api/vendor-master/dropdown-options");
                const data = res?.data?.data || {};
                setDropdownOptions({
                    vendorCategories: data.vendorCategories || [],
                    vendorSubCategories: data.vendorSubCategories || [],
                    centers: data.centers || [],
                });
            } catch (error) {
                console.error("Error fetching vendor dropdown options:", error);
            }
        };
        fetchDropdownOptions();
    }, []);

    const handleCategoryChange = async (categoryId) => {
        if (!categoryId) return;
        const selectedCategory = dropdownOptions.vendorCategories.find((cat) => cat._id === categoryId);
        try {
            const res = await axios.get(`/api/vendor-master/subcategory/${categoryId}`);
            setFilteredSubCategories(res?.data?.data || []);
            setFormData((prev) => ({
                ...prev,
                vendorInfo: {
                    ...prev.vendorInfo,
                    vendorCategory_id: categoryId,
                    vendorCategory: selectedCategory?.name || "",
                    vendorSubCategory_id: "",
                    vendorSubCategory: ""
                }
            }));
        } catch (error) {
            console.error("Subcategory fetch error:", error);
        }
    };

    const handleSubCategoryChange = (subCategoryId) => {
        const selectedSub = filteredSubCategories.find((sub) => sub._id === subCategoryId);
        setFormData((prev) => ({
            ...prev,
            vendorInfo: {
                ...prev.vendorInfo,
                vendorSubCategory_id: subCategoryId,
                vendorSubCategory: selectedSub?.name || ""
            }
        }));
    };

    const handleChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    useEffect(() => {
        if (!pid) return;
        const fetchVendorData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/vendor-master/get/${pid}`);
                const vendor = response.data?.data;
                if (vendor) {
                    setFormData({
                        vendorStatus: vendor.vendorStatus || "Active",
                        vendorInfo: { ...initialState.vendorInfo, ...vendor.vendorInfo },
                        bankDetails: { ...initialState.bankDetails, ...vendor.bankDetails },
                        addressDetails: { ...initialState.addressDetails, ...vendor.addressDetails },
                    });
                    if (vendor.vendorInfo?.vendorCategory_id) {
                        const subRes = await axios.get(`/api/vendor-master/subcategory/${vendor.vendorInfo.vendorCategory_id}`);
                        setFilteredSubCategories(subRes?.data?.data || []);
                    }
                    if (vendor.docs && vendor.docs.length > 0) {
                        setUploadedFiles(vendor.docs.map((url) => {
                            const name = url.split("/").pop();
                            return {
                                fileName: name,
                                fileData: url,
                                fileType: name.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
                                fileSize: 0,
                            };
                        }));
                    }
                }
            } catch (error) {
                console.error("Fetch Vendor Error:", error);
                Swal.fire({ icon: "error", title: "Error", text: "Failed to load vendor data." });
            } finally {
                setLoading(false);
            }
        };
        fetchVendorData();
    }, [pid]);

    const validateForm = () => {
        const newErrors = {};
        const { vendorInfo, bankDetails, addressDetails } = formData;
        if (!vendorInfo.nameOfCompany?.trim()) newErrors.nameOfCompany = "Company Name is required";
        if (!vendorInfo.panNumber?.trim()) {
            newErrors.panNumber = "PAN Number is required";
        } else if (!validator.matches(vendorInfo.panNumber, /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
            newErrors.panNumber = "Invalid PAN format";
        }
        if (vendorInfo.gstin?.trim()) {
            if (!validator.matches(vendorInfo.gstin, /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)) {
                newErrors.gstin = "Invalid GSTIN format";
            }
        }
        if (!vendorInfo.primaryContactPersonName?.trim()) newErrors.primaryContactPersonName = "Primary Contact Person is required";
        if (!vendorInfo.designation?.trim()) newErrors.designation = "Designation is required";
        if (!vendorInfo.mobileNumber?.trim()) {
            newErrors.mobileNumber = "Mobile Number is required";
        } else if (!validator.isMobilePhone(vendorInfo.mobileNumber, "en-IN")) {
            newErrors.mobileNumber = "Invalid Mobile Number";
        }
        if (!vendorInfo.officialEmailId?.trim()) {
            newErrors.officialEmailId = "Official Email is required";
        } else if (!validator.isEmail(vendorInfo.officialEmailId)) {
            newErrors.officialEmailId = "Invalid Email Address";
        }
        if (!bankDetails.bankName?.trim()) newErrors.bankName = "Bank Name is required";
        if (!bankDetails.branchName?.trim()) newErrors.branchName = "Branch Name is required";
        if (!bankDetails.accountHolderName?.trim()) newErrors.accountHolderName = "Account Holder Name is required";
        if (!bankDetails.accountNumber?.trim()) {
            newErrors.accountNumber = "Account Number is required";
        } else if (!validator.isNumeric(bankDetails.accountNumber)) {
            newErrors.accountNumber = "Account Number must be numeric";
        }
        if (!bankDetails.ifscCode?.trim()) {
            newErrors.ifscCode = "IFSC Code is required";
        } else if (!validator.matches(bankDetails.ifscCode, /^[A-Z]{4}0[A-Z0-9]{6}$/)) {
            newErrors.ifscCode = "Invalid IFSC Code";
        }
        if (!bankDetails.accountType?.trim()) newErrors.accountType = "Account Type is required";
        if (!addressDetails.addressLine1?.trim()) newErrors.addressLine1 = "Address Line 1 is required";
        if (!addressDetails.city?.trim()) newErrors.city = "City is required";
        if (!addressDetails.district?.trim()) newErrors.district = "District is required";
        if (!addressDetails.state?.trim()) newErrors.state = "State is required";
        if (!addressDetails.country?.trim()) newErrors.country = "Country is required";
        if (!addressDetails.pinCode?.trim()) {
            newErrors.pinCode = "PIN Code is required";
        } else if (!validator.isLength(addressDetails.pinCode, { min: 6, max: 6 }) || !validator.isNumeric(addressDetails.pinCode)) {
            newErrors.pinCode = "PIN Code must be 6 digits";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        const payload = { ...formData, docs: uploadedFiles.map((f) => f.fileData) };
        try {
            setLoading(true);
            let response;
            if (pid) {
                response = await axios.put(`/api/vendor-master/update/${pid}`, payload);
                if (response.status === 200 || response.status === 201) {
                    await Swal.fire({ icon: "success", title: "Updated!", text: "Vendor updated successfully.", confirmButtonColor: "#3c8dbc" });
                }
            } else {
                response = await axios.post("/api/vendor-master/create", payload);
                if (response.status === 200 || response.status === 201) {
                    await Swal.fire({ icon: "success", title: "Created!", text: "Vendor created successfully.", confirmButtonColor: "#3c8dbc" });
                    setFormData(initialState);
                    setErrors({});
                }
            }
            const basePath = window.location.pathname.includes("admin") ? "/admin" : "/asset";
            router.push(`${basePath}/master-data/vendor-master/vendor-list`);
        } catch (error) {
            Swal.fire({ icon: "error", title: "Submission Failed", text: error?.response?.data?.message || "Something went wrong.", confirmButtonColor: "#dc2626" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="p-4">
            <h3 className="admin-heading mb-4 px-2">Vendor Management</h3>
            
            <div className="admin-box box-primary">
                <div className="admin-box-header border-b border-gray-100 mb-4 p-4">
                    <h3 className="admin-box-title">Vendor Registration</h3>
                    <div className="flex items-center gap-4">
                        <Tooltip content="Bulk Upload" placement="bottom" arrow={false} className="z-50 bg-[#3c8dbc] text-white text-xs px-2 py-1 rounded">
                            <button
                                className="p-1.5 text-[#3c8dbc] border border-[#3c8dbc] rounded hover:bg-blue-50 transition-colors"
                                onClick={() => {
                                    const basePath = window.location.pathname.includes("admin") ? "/admin" : "/asset";
                                    router.push(`${basePath}/master-data/vendor-master/bulk-upload`);
                                }}
                            >
                                <FaFileUpload size={24} />
                            </button>
                        </Tooltip>
                        <Tooltip content="Vendor List" placement="bottom" className="z-50 bg-[#3c8dbc] text-white text-xs px-2 py-1 rounded" arrow={false}>
                            <button
                                className="p-1.5 text-[#3c8dbc] border border-[#3c8dbc] rounded hover:bg-blue-50 transition-colors"
                                onClick={() => {
                                    const basePath = window.location.pathname.includes("admin") ? "/admin" : "/asset";
                                    router.push(`${basePath}/master-data/vendor-master/vendor-list`);
                                }}
                            >
                                <CiViewList size={22} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Vendor information */}
                        <div className="border border-gray-200 rounded-sm mb-6">
                            <div className="bg-gray-50 border-b border-gray-200 p-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase m-0">Vendor Information</h4>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="admin-form-group">
                                    <label className="admin-label">Vendor Name <span className="text-red-500">*</span></label>
                                    <input value={formData.vendorInfo.nameOfCompany} onChange={(e) => handleChange("vendorInfo", "nameOfCompany", e.target.value)} placeholder="Enter Vendor Name" className="admin-input" />
                                    {errors.nameOfCompany && <p className="error">{errors.nameOfCompany}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Vendor Category</label>
                                    <select value={formData.vendorInfo.vendorCategory_id || ""} onChange={(e) => handleCategoryChange(e.target.value)} className="admin-select">
                                        <option value="">Select Vendor Category</option>
                                        {dropdownOptions.vendorCategories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Vendor SubCategory</label>
                                    <select value={formData.vendorInfo.vendorSubCategory_id || ""} onChange={(e) => handleSubCategoryChange(e.target.value)} className="admin-select">
                                        <option value="">Select Vendor SubCategory</option>
                                        {filteredSubCategories.map((sub) => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">PAN Number <span className="text-red-500">*</span></label>
                                    <input maxLength={10} value={formData.vendorInfo.panNumber} onChange={(e) => handleChange("vendorInfo", "panNumber", e.target.value.toUpperCase())} placeholder="Enter PAN Number" className="admin-input" />
                                    {errors.panNumber && <p className="error">{errors.panNumber}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">GSTIN</label>
                                    <input maxLength={15} value={formData.vendorInfo.gstin} onChange={(e) => handleChange("vendorInfo", "gstin", e.target.value.toUpperCase())} placeholder="Enter GSTIN" className="admin-input" />
                                    {errors.gstin && <p className="error">{errors.gstin}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Center Name</label>
                                    <select value={formData.vendorInfo.centerName} onChange={(e) => handleChange("vendorInfo", "centerName", e.target.value)} disabled={!!pid} className={`admin-select ${pid ? "bg-gray-100 cursor-not-allowed border-gray-200" : ""}`}>
                                        <option value="">Select Center Name</option>
                                        {dropdownOptions.centers.map((center) => (
                                            <option key={center._id} value={center.centerName}>{center.centerName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="tdsApplicable" checked={formData.vendorInfo.tdsApplicable} onChange={(e) => handleChange("vendorInfo", "tdsApplicable", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#3c8dbc] focus:ring-[#3c8dbc] cursor-pointer" />
                                        <label htmlFor="tdsApplicable" className="text-sm font-bold text-gray-700 cursor-pointer">TDS Applicable <span className="text-red-500 ml-1">*</span></label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact details */}
                        <div className="border border-gray-200 rounded-sm mb-6">
                            <div className="bg-gray-50 border-b border-gray-200 p-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase m-0">Contact Person Details</h4>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="admin-form-group">
                                    <label className="admin-label">Primary Contact Person <span className="text-red-500">*</span></label>
                                    <input value={formData.vendorInfo.primaryContactPersonName} onChange={(e) => handleChange("vendorInfo", "primaryContactPersonName", e.target.value)} placeholder="Enter Person Name" className="admin-input" />
                                    {errors.primaryContactPersonName && <p className="error">{errors.primaryContactPersonName}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Designation <span className="text-red-500">*</span></label>
                                    <input value={formData.vendorInfo.designation} onChange={(e) => handleChange("vendorInfo", "designation", e.target.value)} placeholder="Enter Designation" className="admin-input" />
                                    {errors.designation && <p className="error">{errors.designation}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Mobile Number <span className="text-red-500">*</span></label>
                                    <input maxLength={10} value={formData.vendorInfo.mobileNumber} onChange={(e) => handleChange("vendorInfo", "mobileNumber", e.target.value)} placeholder="Enter Mobile Number" className="admin-input" />
                                    {errors.mobileNumber && <p className="error">{errors.mobileNumber}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Official Email <span className="text-red-500">*</span></label>
                                    <input type="email" value={formData.vendorInfo.officialEmailId} onChange={(e) => handleChange("vendorInfo", "officialEmailId", e.target.value)} placeholder="Enter Email" className="admin-input" />
                                    {errors.officialEmailId && <p className="error">{errors.officialEmailId}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Bank details */}
                        <div className="border border-gray-200 rounded-sm mb-6">
                            <div className="bg-gray-50 border-b border-gray-200 p-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase m-0">Bank Details</h4>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="admin-form-group">
                                    <label className="admin-label">Bank Name <span className="text-red-500">*</span></label>
                                    <input value={formData.bankDetails.bankName} onChange={(e) => handleChange("bankDetails", "bankName", e.target.value)} placeholder="Enter Bank Name" className="admin-input" />
                                    {errors.bankName && <p className="error">{errors.bankName}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Branch Name <span className="text-red-500">*</span></label>
                                    <input value={formData.bankDetails.branchName} onChange={(e) => handleChange("bankDetails", "branchName", e.target.value)} placeholder="Enter Branch Name" className="admin-input" />
                                    {errors.branchName && <p className="error">{errors.branchName}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Account Holder <span className="text-red-500">*</span></label>
                                    <input value={formData.bankDetails.accountHolderName} onChange={(e) => handleChange("bankDetails", "accountHolderName", e.target.value)} placeholder="Enter Holder Name" className="admin-input" />
                                    {errors.accountHolderName && <p className="error">{errors.accountHolderName}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Account Number <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.bankDetails.accountNumber} onChange={(e) => handleChange("bankDetails", "accountNumber", e.target.value)} placeholder="Enter Account Number" className="admin-input" />
                                    {errors.accountNumber && <p className="error">{errors.accountNumber}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">IFSC Code <span className="text-red-500">*</span></label>
                                    <input value={formData.bankDetails.ifscCode} onChange={(e) => handleChange("bankDetails", "ifscCode", e.target.value)} placeholder="Enter IFSC Code" className="admin-input" />
                                    {errors.ifscCode && <p className="error">{errors.ifscCode}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Account Type <span className="text-red-500">*</span></label>
                                    <select value={formData.bankDetails.accountType} onChange={(e) => handleChange("bankDetails", "accountType", e.target.value)} className="admin-select">
                                        <option value="">Select Account Type</option>
                                        {bankAccountTypes.map((type, i) => (
                                            <option key={i} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    {errors.accountType && <p className="error">{errors.accountType}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Address details */}
                        <div className="border border-gray-200 rounded-sm mb-6">
                            <div className="bg-gray-50 border-b border-gray-200 p-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase m-0">Address Details</h4>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="admin-form-group">
                                    <label className="admin-label">Address Line 1 <span className="text-red-500">*</span></label>
                                    <input value={formData.addressDetails.addressLine1} onChange={(e) => handleChange("addressDetails", "addressLine1", e.target.value)} placeholder="Enter Address" className="admin-input" />
                                    {errors.addressLine1 && <p className="error">{errors.addressLine1}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">City <span className="text-red-500">*</span></label>
                                    <input value={formData.addressDetails.city} onChange={(e) => handleChange("addressDetails", "city", e.target.value)} placeholder="Enter City" className="admin-input" />
                                    {errors.city && <p className="error">{errors.city}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">District <span className="text-red-500">*</span></label>
                                    <input value={formData.addressDetails.district} onChange={(e) => handleChange("addressDetails", "district", e.target.value)} placeholder="Enter District" className="admin-input" />
                                    {errors.district && <p className="error">{errors.district}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">State <span className="text-red-500">*</span></label>
                                    <input value={formData.addressDetails.state} onChange={(e) => handleChange("addressDetails", "state", e.target.value)} placeholder="Enter State" className="admin-input" />
                                    {errors.state && <p className="error">{errors.state}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Country <span className="text-red-500">*</span></label>
                                    <input value={formData.addressDetails.country} onChange={(e) => handleChange("addressDetails", "country", e.target.value)} placeholder="Enter Country" className="admin-input" />
                                    {errors.country && <p className="error">{errors.country}</p>}
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">PIN Code <span className="text-red-500">*</span></label>
                                    <input type="text" maxLength={6} value={formData.addressDetails.pinCode} onChange={(e) => handleChange("addressDetails", "pinCode", e.target.value)} placeholder="Enter PIN" className="admin-input" />
                                    {errors.pinCode && <p className="error">{errors.pinCode}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Document upload */}
                        <div className="border border-gray-200 rounded-sm mb-6">
                            <div className="bg-gray-50 border-b border-gray-200 p-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase m-0">Document Upload</h4>
                            </div>
                            <div className="p-6 flex flex-col lg:flex-row gap-8">
                                <div
                                    className={`flex-1 border-2 border-dashed rounded-sm p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                                                ${isDragOver ? "border-[#3c8dbc] bg-[#3c8dbc]/5" : "border-slate-200 bg-slate-50 hover:border-[#3c8dbc]"}`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <MdFileUpload className="text-4xl text-[#3c8dbc] mb-2" />
                                    <p className="text-sm font-bold text-gray-700 text-center">Drag & drop files here</p>
                                    <p className="text-xs text-slate-400 mt-1 mb-6 text-center">or click to browse (.pdf, .png, .jpg, .jpeg)</p>
                                    <button type="button" className="px-6 py-2 bg-white border border-[#d2d6de] rounded-sm text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
                                        Select Files
                                    </button>
                                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileSelect} />
                                </div>
                                {uploadedFiles.length > 0 && (
                                    <div className="flex-1 space-y-3">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Uploaded Files ({uploadedFiles.length})</h4>
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-white border border-gray-100 rounded-sm px-4 py-2 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    {file.fileType === "application/pdf" ? <MdPictureAsPdf className="text-red-500 text-xl" /> : <MdImage className="text-blue-500 text-xl" />}
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-700 truncate max-w-[200px]">{file.fileName}</p>
                                                        {file.fileSize > 0 && <p className="text-[10px] text-slate-400">{formatFileSize(file.fileSize)}</p>}
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeFile(index)} className="p-1 text-slate-300 hover:text-red-500 transition-all">
                                                    <MdClose size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button type="submit" className="admin-btn-primary min-w-[150px]" disabled={loading}>
                                {loading ? "Processing..." : pid ? "Update Vendor Profile" : "Register Vendor"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .error {
                    color: #ef4444;
                    font-size: 11px;
                    margin-top: 2px;
                    font-weight: 600;
                }
            `}</style>
        </section>
    );
}
