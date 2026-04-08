"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import S3FileUpload from "react-s3";
import { useRouter, useParams, usePathname } from "next/navigation";
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
    window.Buffer = window.Buffer || Buffer;
}
import {
    MdWidgets,
    MdLabel,
    MdInventory,
    MdBrandingWatermark,
    MdSettings,
    MdPin,
    MdBusiness,
    MdAttachMoney,
    MdEventNote,
    MdFileUpload,
    MdDescription,
    MdReceiptLong,
    MdCalendarMonth,
    MdSavings,
    MdTimelapse,
    MdTrendingDown,
    MdCloudUpload,
    MdPictureAsPdf,
    MdClose,
    MdImage,
    MdAssignmentTurnedIn,
    MdOutlineFactCheck,
    MdInfoOutline
} from "react-icons/md";
import { FaFileUpload, FaSpinner, FaTools, FaRupeeSign, FaListUl, FaUserPlus } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import { CiViewList } from "react-icons/ci";
import { Tooltip } from "flowbite-react";
import ls from "localstorage-slim";

const AddAsset = () => {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const fileInputRef = useRef(null);

    const [loggedInRole, setLoggedInRole] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    // ── Core Hierarchy ──
    const [assetCategory, setAssetCategory] = useState("");
    const [assetSubCategory, setAssetSubCategory] = useState("");
    const [center, setCenter] = useState("");
    const [centerList, setCenterList] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAssetIncharge, setIsAssetIncharge] = useState(false);

    // ── Basic Information ──
    const [assetName, setAssetName] = useState("");
    const [assetID, setAssetID] = useState("");
    const [assetImage, setAssetImage] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [serialNumbers, setSerialNumbers] = useState([""]);
    const [description, setDescription] = useState("");

    // ── Specifications ──
    const [specifications, setSpecifications] = useState([]);
    const [specLabel, setSpecLabel] = useState("");
    const [specValue, setSpecValue] = useState("");

    // ── Purchase Details ──
    const [vendor, setVendor] = useState("");
    const [vendorID, setVendorID] = useState("");
    const [vendorDropdownOptions, setVendorDropdownOptions] = useState([]);
    const [cost, setCost] = useState("");
    const [warrantyDate, setWarrantyDate] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");



    // ── Document Upload ──
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // ── Lists ──
    const [assetCategoryList, setAssetCategoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assetSubCategoryList, setAssetSubCategoryList] = useState([]);

    const buttonText = params._id ? "Update" : "Submit";



    useEffect(() => {
        const userDetails = ls.get("userDetails", { decrypt: true });
        const roles = userDetails?.roles || [];
        setIsAdmin(roles.includes("admin") || roles.includes("asset-admin"));
        setIsAssetIncharge(roles.includes("asset-incharge"));

        if (pathname.includes("admin")) {
            setLoggedInRole("admin");
        } else if (pathname.includes("center")) {
            setLoggedInRole("center");
        } else if (pathname.includes("asset")) {
            setLoggedInRole("asset");
        } else if (pathname.includes("account")) {
            setLoggedInRole("account");
        } else {
            setLoggedInRole("executive");
        }
    }, [pathname]);

    useEffect(() => {
        getAssetCategoryList();
        getVendorsList();
        getCentersList();
    }, []);

    useEffect(() => {
        if (params._id) {
            axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/get/${params._id}`).then((res) => {
                const data = res.data;
                if (data.category) {
                    const catId = data.category_id || data.assetCategory_id;
                    if (catId) {
                        setAssetCategory(data.category + "|" + catId);
                        getAssetSubCategoryList(catId);
                    }
                }
                if (data.subCategory) {
                    setAssetSubCategory(data.subCategory);
                }
                setAssetName(data.assetName || "");
                setAssetID(data.assetID || "");
                setAssetImage(data.assetImage?.[0]?.url || "");
                setBrand(data.brand || "");
                setModel(data.model || "");
                setSerialNo(data.serialNumber || "");
                setSerialNumbers([data.serialNumber || ""]);
                setVendor(data.vendor?.name || "");
                setVendorID(data.vendor?.id || "");
                setCost(data.purchaseCost || "");
                setDescription(data.description || "");
                setInvoiceNumber(data.invoiceNumber || "");

                setSpecifications(data.specifications || []);

                if (data.docs && Array.isArray(data.docs)) {
                    setUploadedFiles(data.docs.map(name => ({ fileName: name, fileData: name, isExisting: true })));
                }
                if (data.warrantyDate) {
                    setWarrantyDate(new Date(data.warrantyDate).toISOString().split('T')[0]);
                }
                if (data.purchaseDate) {
                    setPurchaseDate(new Date(data.purchaseDate).toISOString().split('T')[0]);
                }
                if (data.currentAllocation?.center) {
                    setCenter(data.currentAllocation.center.name + "|" + data.currentAllocation.center._id);
                }
            });
        }
    }, [params._id]);

    const s3Config = {
        bucketName: process.env.BUCKETNAME || process.env.NEXT_PUBLIC_BUCKET_NAME,
        region: process.env.REGION || process.env.NEXT_PUBLIC_REGION,
        accessKeyId: process.env.ACCESSKEYID || process.env.NEXT_PUBLIC_ACCESS_KEY,
        secretAccessKey: process.env.SECRETACCESSKEY || process.env.NEXT_PUBLIC_SECRET_KEY,
    };

    const s3upload = (file) => {
        return new Promise((resolve, reject) => {
            S3FileUpload.uploadFile(file, s3Config)
                .then((data) => resolve(data.location))
                .catch((error) => {
                    console.error("S3 Upload Error:", error);
                    reject(error);
                });
        });
    };

    const handleAssetCategoryChange = (e) => {
        const value = e.target.value;
        setAssetCategory(value);
        setAssetSubCategory("");
        if (value) {
            const [, cat_id] = value.split("|");
            getAssetSubCategoryList(cat_id);
        } else {
            setAssetSubCategoryList([]);
        }
    };

    const getAssetCategoryList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-category/get`)
            .then((res) => setAssetCategoryList(Array.isArray(res.data) ? res.data : []))
            .catch(() => setAssetCategoryList([]));
    };

    const getAssetSubCategoryList = (cat_id) => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-master-subcategory/get`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setAssetSubCategoryList(data.filter(item => item.dropdown_id?.toString() === cat_id?.toString()));
            })
            .catch(() => setAssetSubCategoryList([]));
    };

    const getCentersList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
            .then((res) => {
                setCenterList(Array.isArray(res.data) ? res.data : []);

                // For Incharge, pre-fill center from userDetails
                const userDetails = ls.get("userDetails", { decrypt: true });
                const roles = userDetails?.roles || [];
                if (roles.includes("asset-incharge") && userDetails.center_id) {
                    setCenter(userDetails.centerName + "|" + userDetails.center_id);
                }
            })
            .catch(() => setCenterList([]));
    };

    const getVendorsList = async () => {
        try {
            const userDetails = ls.get("userDetails", { decrypt: true });
            const centerId = userDetails?.center_id;

            const url = (centerId && centerId !== "all")
                ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/vendor-master/get/vendors/list/${centerId}`
                : `${process.env.NEXT_PUBLIC_BASE_URL}/api/vendor-master/get/vendors/list`;

            const res = await axios.get(url);
            setVendorDropdownOptions(res.data.data || []);
        } catch (error) {
            console.error("Error fetching vendors:", error);
            setVendorDropdownOptions([]);
        }
    };

    const handleQuantityChange = (e) => {
        const val = e.target.value.replace(/\D/g, ""); // Allow only digits
        setQuantity(val);
        const numVal = parseInt(val) || 0;
        if (numVal >= 0) {
            const newSerials = [...serialNumbers];
            if (numVal > newSerials.length) {
                for (let i = newSerials.length; i < numVal; i++) {
                    newSerials.push("");
                }
            } else {
                newSerials.length = numVal;
            }
            setSerialNumbers(newSerials);
        }
    };

    const handleSerialNoChange = (index, value) => {
        const newSerials = [...serialNumbers];
        newSerials[index] = value;
        setSerialNumbers(newSerials);
        if (index === 0) setSerialNo(value); // Keep legacy serialNo in sync for single entry
    };


    // ── Specification Helpers ──
    const addSpecification = () => {
        if (specLabel.trim() && specValue.trim()) {
            setSpecifications([...specifications, { label: specLabel, value: specValue }]);
            setSpecLabel("");
            setSpecValue("");
        } else {
            Swal.fire(" ", "Please enter both title and value for the specification");
        }
    };

    const removeSpecification = (index) => {
        setSpecifications(specifications.filter((_, i) => i !== index));
    };

    const handleSpecUpdate = (index, field, value) => {
        const updatedSpecs = [...specifications];
        updatedSpecs[index][field] = value;
        setSpecifications(updatedSpecs);
    };

    // ── File Upload Helpers ──
    const processFiles = async (files) => {
        const maxSize = 10 * 1024 * 1024;
        const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!allowedTypes.includes(file.type)) {
                Swal.fire(" ", `File type not supported: ${file.name}. Only PDF, Word, Excel, PNG, JPG allowed.`);
                continue;
            }
            if (file.size > maxSize) {
                Swal.fire(" ", `File too large: ${file.name}. Max 10MB per file.`);
                continue;
            }

            try {
                // Upload to S3
                const s3url = await s3upload(file);

                // Store S3 URL instead of base64
                setUploadedFiles((prev) => [...prev, {
                    fileName: file.name,
                    fileData: s3url,
                    fileType: file.type,
                    fileSize: file.size,
                }]);
            } catch (error) {
                Swal.fire(" ", `Failed to upload ${file.name} to S3`);
            }
        }
    };

    const handleFileSelect = (e) => { processFiles(e.target.files); e.target.value = ""; };
    const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); processFiles(e.dataTransfer.files); };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);
    const removeFile = (index) => {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    };

    const handleAssetImageSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                Swal.fire(" ", "Image size exceeds 5MB limit.");
                return;
            }

            try {
                // Upload image locally directly to S3
                const s3url = await s3upload(file);
                setAssetImage(s3url);
            } catch (error) {
                Swal.fire(" ", "Image upload to S3 failed.");
            }
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!assetCategory || !assetSubCategory || !assetName || !purchaseDate || !cost || (isAdmin && !center)) {
            Swal.fire(" ", "Please fill all required fields (Center, Category, Sub-Category, Asset Name, Purchase Date, Purchase Cost)");
            return;
        }
        const [dropdownValue, category_id] = assetCategory.split("|");
        const subCatObj = assetSubCategoryList.find(sub => sub.inputValue === assetSubCategory);
        const subCategory_id = subCatObj ? subCatObj._id : null;
        const userDetails = ls.get("userDetails", { decrypt: true });

        const roles = userDetails?.roles || [];
        const isAssetIncharge = roles.includes("asset-incharge");
        const isAssetAdmin = roles.includes("admin") || roles.includes("asset-admin");

        const baseValues = {
            category: dropdownValue,
            category_id: category_id,
            subCategory: assetSubCategory,
            subCategory_id,
            assetID: assetID || undefined,
            assetName,
            brand,
            model,
            vendor: { name: vendor, id: vendorID },
            purchaseCost: cost,
            warrantyDate,
            description,
            purchaseDate,
            invoiceNumber,

            docs: uploadedFiles.map(f => f.fileData),
            specifications,
            assetImage: [{ url: assetImage, fileName: "asset_image" }],
            user_id: userDetails?.user_id || userDetails?.userId || userDetails?._id,
            userName: userDetails?.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails?.fullName || userDetails?.name || "System"),
            currentAllocation: center ? {
                center: {
                    _id: center.split("|")[1],
                    name: center.split("|")[0]
                }
            } : undefined
        };

        setLoading(true);
        const apiUrl = params._id
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/patch/${params._id}`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new`;

        try {
            if (params._id) {
                // Update mode
                await axios.patch(apiUrl, { ...baseValues, serialNumber: serialNo });
            } else {
                // Add mode with quantity support
                const totalQty = parseInt(quantity) || 1;
                for (let i = 0; i < totalQty; i++) {
                    await axios.post(apiUrl, { ...baseValues, serialNumber: serialNumbers[i] });
                }
            }
            Swal.fire(" ", `Asset ${params._id ? 'updated' : 'added'} successfully`);
            router.push(`/${loggedInRole}/management`);
        } catch (error) {
            console.error("Submission error:", error);
            Swal.fire(" ", "Something went wrong during submission");
        } finally {
            setLoading(false);
        }
    };

    // ── Section Header ──
    const SectionHeader = ({ title, subtitle }) => (
        <div className="mb-5 border-b border-gray-100 pb-2">
            <h3 className="text-[15px] font-bold text-black uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] font-normal text-gray-500">{subtitle}</p>
        </div>
    );

    // ── Icon Input Wrapper ──
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
                {/* ── Page Header ── */}
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300 flex justify-between">
                        <h1 className="heading">Central Asset Registry</h1>
                        <div className="flex gap-3 my-5 me-10">
                            <Tooltip content="Asset List" placement="bottom" className="bg-green" arrow={false}>
                                <CiViewList
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={() => window.open(`/${loggedInRole}/management`, '_self')}
                                />
                            </Tooltip>
                            <Tooltip
                                content="Allocate Asset"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                            >
                                <FaUserPlus
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        router.push(`/${loggedInRole}/management/asset-allocation`);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip
                                content="Allocation Approval List"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                            >
                                <FaListUl
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        router.push(`/${loggedInRole}/management/allocation-approval-list`);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip content="Bulk Upload" placement="bottom" className="bg-green" arrow={false}>
                                <FaFileUpload
                                    className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                    onClick={() => window.open(`/${loggedInRole}/management/bulk-upload`, '_self')}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* ── Form ── */}
                <div className="px-10 py-6">
                    <div className="bg-white text-secondary">
                        <form onSubmit={handleSubmit}>

                            {/* ══════════════════════════════════════════
                                SECTION 1 — Basic Information
                                (includes center/location/category/dept)
                            ══════════════════════════════════════════ */}
                            <div className="border border-gray-200 rounded-lg p-5 mt-2 shadow-md">
                                <SectionHeader
                                    title="Basic Information"
                                    subtitle="Primary asset identification details."
                                />




                                <div className="grid lg:grid-cols-12 grid-cols-1 gap-8 mt-4">
                                    {/* Left 70%: Inputs */}
                                    <div className="lg:col-span-8 space-y-4">
                                        {/* Row: Center Dropdown */}
                                        <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                            <div className="flex-1">
                                                <label className="inputLabel mb-1">Center<span className="text-red-500">*</span></label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdBusiness} />
                                                    <select
                                                        value={center}
                                                        onChange={(e) => setCenter(e.target.value)}
                                                        className="stdSelectField w-full pl-12"
                                                        required={isAdmin}
                                                        disabled={isAssetIncharge}
                                                    >
                                                        <option value="" disabled>-- Select Center --</option>
                                                        {centerList.map((c) => (
                                                            <option key={c._id} value={`${c.centerName}|${c._id}`}>{c.centerName}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex-1"></div>
                                        </div>
                                        {/* Row: Asset Name */}
                                        <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                            <div className="flex-1">
                                                <label className="inputLabel mb-1">Asset Name <span className="text-red-500">*</span></label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdLabel} />
                                                    <input type="text" className="stdInputField w-full pl-12"
                                                        placeholder="e.g. MacBook Pro 16 – IT Dept"
                                                        value={assetName} onChange={(e) => setAssetName(e.target.value)} required />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="inputLabel mb-1 flex items-center gap-1">
                                                    Asset ID
                                                    <Tooltip content="Asset ID will be auto-generated if not provided manually." placement="top" className="bg-green">
                                                        <MdInfoOutline className="text-gray-400 cursor-help" />
                                                    </Tooltip>
                                                </label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdPin} />
                                                    <input type="text" className="stdInputField w-full pl-12"
                                                        placeholder="Optional (e.g. AST-001)"
                                                        value={assetID} onChange={(e) => setAssetID(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row: Category + Sub-Category */}
                                        <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                            <div className="flex-1">
                                                <label className="inputLabel mb-1">Asset Category <span className="text-red-500">*</span></label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdWidgets} />
                                                    <select value={assetCategory}
                                                        onChange={handleAssetCategoryChange}
                                                        className="stdSelectField w-full pl-12" required>
                                                        <option value="" disabled>-- Select Category --</option>
                                                        {assetCategoryList.map((cat) => (
                                                            <option key={cat._id} value={`${cat.fieldValue}|${cat._id}`}>{cat.fieldValue}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="inputLabel mb-1">Asset Sub-Category <span className="text-red-500">*</span></label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdLabel} />
                                                    <select
                                                        value={assetSubCategory}
                                                        onChange={(e) => setAssetSubCategory(e.target.value)}
                                                        className="stdSelectField w-full pl-12"
                                                        required
                                                    >
                                                        <option value="" disabled>-- Select Sub-Category --</option>
                                                        {assetSubCategoryList.map((sub) => (
                                                            <option key={sub._id} value={sub.inputValue}>{sub.inputValue}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row: Brand + Model */}
                                        <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                            <div className="flex-1">
                                                <label className="inputLabel mb-1">Brand</label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdBrandingWatermark} />
                                                    <input type="text" className="stdInputField w-full pl-12"
                                                        placeholder="e.g., Apple, Dell"
                                                        value={brand} onChange={(e) => setBrand(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="inputLabel mb-1">Model / Variation</label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdSettings} />
                                                    <input type="text" className="stdInputField w-full pl-12"
                                                        placeholder="e.g., XPS 15"
                                                        value={model} onChange={(e) => setModel(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row: Quantity + Serial No */}
                                        <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                            {!params._id && (
                                                <div className="flex-1">
                                                    <label className="inputLabel mb-1">Quantity <span className="text-red-500">*</span></label>
                                                    <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                        <IconWrapper icon={MdInventory} />
                                                        <input type="text" className="stdInputField w-full pl-12"
                                                            placeholder="0"
                                                            value={quantity} onChange={handleQuantityChange} required />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex-1"></div>
                                        </div>

                                        {/* Dynamic Serial Numbers */}
                                        <div className="space-y-4">
                                            {serialNumbers.map((sn, index) => (
                                                <div key={index} className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                                    <div className="flex-1">
                                                        <label className="inputLabel mb-1">
                                                            Serial Number {quantity > 1 ? `#${index + 1}` : ""}
                                                        </label>
                                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                            <IconWrapper icon={MdInventory} />
                                                            <input type="text" className="stdInputField w-full pl-12"
                                                                placeholder="Product Serial No"
                                                                value={sn} onChange={(e) => handleSerialNoChange(index, e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right 30%: Image Upload */}
                                    <div className="lg:col-span-4 flex flex-col">
                                        <label className="inputLabel mb-1 text-center">Asset Image</label>
                                        <div className="flex-1 mt-2 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer relative group overflow-hidden min-h-[250px]">
                                            {assetImage ? (
                                                <>
                                                    <img src={assetImage} alt="Asset" className="w-full h-full object-contain rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <button
                                                            type="button"
                                                            onClick={() => setAssetImage("")}
                                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                                                        >
                                                            <MdClose />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                                    <MdImage className="text-5xl text-gray-300 mb-2" />
                                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest text-center">Upload Photo</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 italic text-center">JPG, PNG up to 2MB</p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleAssetImageSelect}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Row: Description */}
                                <div className="mt-4">
                                    <label className="inputLabel mb-1">Description</label>
                                    <textarea
                                        className="block rounded-md border-0 py-2 px-3 w-full font-normal text-gray-900 ring-1 ring-inset ring-grayThree text-[13px] placeholder:text-[14px] placeholder:text-grayThree focus:ring-2 focus:ring-inset focus:ring-green resize-none mt-2"
                                        placeholder="Provide detailed specifications, model numbers, etc."
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                {/* ── Specifications ── */}
                                <div className="mt-6 mb-4 border-t border-dashed border-gray-200 pt-4">
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Specifications</p>

                                    <div className="grid lg:grid-cols-[1fr_1fr_auto] grid-cols-1 gap-3 items-center mt-2">
                                        <div className="w-full">
                                            <input
                                                type="text"
                                                className="stdInputField py-2 w-full"
                                                placeholder="Enter Specification"
                                                value={specLabel}
                                                onChange={(e) => setSpecLabel(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full">
                                            <input
                                                type="text"
                                                className="stdInputField py-2 w-full"
                                                placeholder="Specification Value"
                                                value={specValue}
                                                onChange={(e) => setSpecValue(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                type="button"
                                                onClick={addSpecification}
                                                className="formButtons h-[32px] px-6 min-w-[80px]"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Specifications List */}
                                <div className="mt-2 space-y-2">
                                    {specifications.map((spec, index) => (
                                        <div key={index} className="grid lg:grid-cols-[1fr_1fr_auto] grid-cols-1 gap-3 items-center">
                                            <div className="w-full">
                                                <input
                                                    type="text"
                                                    className="stdInputField py-2 w-full border-gray-200 bg-white"
                                                    placeholder="Enter Specification"
                                                    value={spec.label}
                                                    onChange={(e) => handleSpecUpdate(index, 'label', e.target.value)}
                                                />
                                            </div>
                                            <div className="w-full">
                                                <input
                                                    type="text"
                                                    className="stdInputField py-2 w-full border-gray-200 bg-white"
                                                    placeholder="Specification Value"
                                                    value={spec.value}
                                                    onChange={(e) => handleSpecUpdate(index, 'value', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-center min-w-[80px]">
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpecification(index)}
                                                    className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    <MdClose className="text-xl" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* ══════════════════════════════════════════
                                SECTION 2 — Purchase Details
                            ══════════════════════════════════════════ */}
                            <div className="border border-gray-200 rounded-lg p-5 mt-5 shadow-md">
                                <SectionHeader
                                    title="Purchase Details"
                                    subtitle="Procurement history and vendor data."
                                />

                                {/* Row: Purchase Date + Invoice Number */}
                                <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                    <div className="flex-1 mt-2">
                                        <label className="inputLabel mb-1">Purchase Date <span className="text-red-500">*</span></label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdCalendarMonth} />
                                            <input type="date" className="stdInputField w-full pl-12"
                                                value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="flex-1 mt-2">
                                        <label className="inputLabel mb-1">Invoice Number</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdReceiptLong} />
                                            <input type="text" className="stdInputField w-full pl-12"
                                                placeholder="INV/8923/24"
                                                value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Row: Vendor + Cost */}
                                <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                    <div className="flex-1 mt-4">
                                        <label className="inputLabel mb-1">Vendor / Supplier</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdBusiness} />
                                            <select
                                                className="stdSelectField w-full pl-12"
                                                value={vendorID}
                                                onChange={(e) => {
                                                    const selectedID = e.target.value;
                                                    setVendorID(selectedID);
                                                    const selectedVendor = vendorDropdownOptions.find(v => v._id === selectedID);
                                                    setVendor(selectedVendor ? selectedVendor.vendorInfo?.nameOfCompany : "");
                                                }}
                                            >
                                                <option value="">-- Select Vendor --</option>
                                                {vendorDropdownOptions.map((v) => (
                                                    <option key={v._id} value={v._id}>
                                                        {v.vendorInfo?.nameOfCompany} {v.vendorID ? `(${v.vendorID})` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex-1 mt-4">
                                        <label className="inputLabel mb-1">Purchase Cost (INR) <span className="text-red-500">*</span></label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={FaRupeeSign} />
                                            <input type="number" className="stdInputField w-full pl-12"
                                                placeholder="0.00"
                                                value={cost} onChange={(e) => setCost(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                {/* Row: Warranty */}
                                <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                    <div className="flex-1 mt-4">
                                        <label className="inputLabel mb-1">Warranty Expiry Date</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdEventNote} />
                                            <input type="date" className="stdInputField w-full pl-12"
                                                value={warrantyDate} onChange={(e) => setWarrantyDate(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex-1 mt-4"></div>
                                </div>
                            </div>



                            {/* ══════════════════════════════════════════
                                SECTION 4 — Document Upload
                            ══════════════════════════════════════════ */}
                            <div className="border border-gray-200 rounded-lg p-5 mt-5 shadow-md">
                                <SectionHeader
                                    title="Document Upload"
                                    subtitle="Upload invoices, warranties, or asset photos."
                                />

                                <div className="flex lg:flex-row md:flex-col flex-col gap-5">
                                    {/* Drop Zone */}
                                    <div
                                        className={`flex-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all
                                            ${isDragOver ? "border-green bg-green/5" : "border-gray-300 bg-gray-50 hover:border-green hover:bg-green/5"}`}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <MdFileUpload className={`text-4xl mb-2 ${isDragOver ? "text-green" : "text-gray-400"}`} />
                                        <p className="text-[13px] font-semibold text-gray-600 text-center">Drop documents here to upload</p>
                                        <p className="text-[11px] text-gray-400 mt-1 text-center">Supports PDF, PNG, JPG (Max 10MB per file)</p>
                                        <button
                                            type="button"
                                            className="mt-4 px-4 py-1.5 border border-gray-300 rounded text-[12px] font-medium text-gray-600 bg-white hover:bg-gray-100 transition-all"
                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                        >
                                            Select Files from Computer
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </div>

                                    {/* Uploaded File List */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="flex-1 flex flex-col gap-2">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index}
                                                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {file.fileType === "application/pdf"
                                                            ? <MdPictureAsPdf className="text-red-500 text-lg flex-shrink-0" />
                                                            : <MdImage className="text-blue-500 text-lg flex-shrink-0" />
                                                        }
                                                        <div className="min-w-0">
                                                            <p className="text-[12px] font-semibold text-gray-700 truncate max-w-[160px]">{file.fileName}</p>
                                                            <p className="text-[10px] text-gray-400">{formatFileSize(file.fileSize)} • Uploaded just now</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="ml-3 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                                    >
                                                        <MdClose className="text-base" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Submit ── */}
                            <div className="mt-6 flex justify-end mb-4">
                                <button type="submit" className="formButtons" disabled={loading}>
                                    {loading ? (
                                        <span>Processing... <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white" /></span>
                                    ) : (
                                        buttonText
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AddAsset;
