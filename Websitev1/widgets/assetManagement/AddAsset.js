import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter, useParams, usePathname } from "next/navigation";
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
    MdOutlineFactCheck
} from "react-icons/md";
import { FaFileUpload, FaSpinner, FaTools, FaRupeeSign } from "react-icons/fa";
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

    // ── Basic Information ──
    const [assetName, setAssetName] = useState("");
    const [assetImage, setAssetImage] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const [description, setDescription] = useState("");

    // ── Specifications ──
    const [specifications, setSpecifications] = useState([]);
    const [specLabel, setSpecLabel] = useState("");
    const [specValue, setSpecValue] = useState("");

    // ── Purchase Details ──
    const [vendor, setVendor] = useState("");
    const [cost, setCost] = useState("");
    const [warrantyDate, setWarrantyDate] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");

    // ── Financial Details ──
    const [residualValue, setResidualValue] = useState("");
    const [usefulLife, setUsefulLife] = useState("");
    const [monthlyDepreciation, setMonthlyDepreciation] = useState("0.00");

    // ── Document Upload ──
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // ── Lists ──
    const [assetCategoryList, setAssetCategoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assetSubCategoryList, setAssetSubCategoryList] = useState([]);

    const buttonText = params._id ? "Update" : "Submit";

    // ── Depreciation auto-calculation ──
    useEffect(() => {
        const c = parseFloat(cost) || 0;
        const r = parseFloat(residualValue) || 0;
        const u = parseFloat(usefulLife) || 0;
        if (u > 0) {
            setMonthlyDepreciation(((c - r) / (u * 12)).toFixed(2));
        } else {
            setMonthlyDepreciation("0.00");
        }
    }, [cost, residualValue, usefulLife]);

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
        getAssetCategoryList();
    }, []);

    useEffect(() => {
        if (params._id) {
            axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management/get/${params._id}`).then((res) => {
                if (res.data.category && res.data.category_id) {
                    setAssetCategory(res.data.category + "|" + res.data.category_id);
                    getAssetSubCategoryList(res.data.category_id);
                }
                if (res.data.subCategory) {
                    setAssetSubCategory(res.data.subCategory);
                }
                setAssetName(res.data.assetName || "");
                setAssetImage(res.data.assetImage?.[0]?.url || "");
                setBrand(res.data.brand || "");
                setModel(res.data.model || "");
                setSerialNo(res.data.serialNo || "");
                setVendor(res.data.vendorName || "");
                setCost(res.data.purchaseCost || "");
                setDescription(res.data.description || "");
                setInvoiceNumber(res.data.invoiceNumber || "");
                setResidualValue(res.data.residualValue || "");
                setUsefulLife(res.data.usefulLife || "");
                setSpecifications(res.data.specifications || []);


                if (res.data.docs && Array.isArray(res.data.docs)) {
                    setUploadedFiles(res.data.docs.map(name => ({ fileName: name, fileData: "", isExisting: true })));
                }
                if (res.data.warrantyDate) {
                    setWarrantyDate(new Date(res.data.warrantyDate).toISOString().split('T')[0]);
                }
                if (res.data.purchaseDate) {
                    setPurchaseDate(new Date(res.data.purchaseDate).toISOString().split('T')[0]);
                }
            });
        }
    }, [params._id]);

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
    const processFiles = (files) => {
        const maxSize = 10 * 1024 * 1024;
        const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
        Array.from(files).forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                Swal.fire(" ", `File type not supported: ${file.name}. Only PDF, PNG, JPG allowed.`);
                return;
            }
            if (file.size > maxSize) {
                Swal.fire(" ", `File too large: ${file.name}. Max 10MB per file.`);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedFiles((prev) => [...prev, {
                    fileName: file.name,
                    fileData: e.target.result,
                    fileType: file.type,
                    fileSize: file.size,
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = (e) => { processFiles(e.target.files); e.target.value = ""; };
    const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); processFiles(e.dataTransfer.files); };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);
    const removeFile = (index) => {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    };

    const handleAssetImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAssetImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!assetCategory || !assetSubCategory || !assetName) {
            Swal.fire(" ", "Please fill all required fields (Category, Sub-Category, Asset Name)");
            return;
        }
        const [dropdownValue, dropdown_id] = assetCategory.split("|");
        const subCatObj = assetSubCategoryList.find(sub => sub.inputValue === assetSubCategory);
        const subCategory_id = subCatObj ? subCatObj._id : null;

        const formValues = {
            dropdownvalue: dropdownValue,
            dropdown_id,
            inputValue: assetSubCategory,
            assetName, brand, model, serialNo,
            vendor, cost, warrantyDate,
            description, purchaseDate, invoiceNumber,
            residualValue, usefulLife, uploadedFiles,
            specifications,
            assetImage,
            dropdownLabel: "asset category",
            inputLabel: "asset subcategory",
            status: "Pending",
            subCategory_id,
            user_id: ls.get("userDetails", { decrypt: true })?.userId
        };

        setLoading(true);
        const apiUrl = params._id
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management/put/${params._id}`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management/post`;
        const method = params._id ? "put" : "post";

        axios[method](apiUrl, formValues)
            .then(() => {
                Swal.fire(" ", `Asset ${params._id ? 'updated' : 'added'} successfully`);
                router.push(`/${loggedInRole}/asset-management`);
            })
            .catch((error) => {
                console.error("Submission error:", error);
                Swal.fire(" ", "Something went wrong during submission");
            })
            .finally(() => setLoading(false));
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
                            <Tooltip content="Bulk Upload" placement="bottom" className="bg-green" arrow={false}>
                                {loading ? (
                                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                                ) : (
                                    <FaFileUpload
                                        className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                        onClick={() => window.open(`/${loggedInRole}/asset-management/bulk-upload`, '_self')}
                                    />
                                )}
                            </Tooltip>
                            <Tooltip
                                content="Asset Allocation Approval"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                            >
                                <MdOutlineFactCheck
                                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        router.push(`/${loggedInRole}/asset-management/movement-authorization`);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip content="Asset List" placement="bottom" className="bg-green" arrow={false}>
                                <CiViewList
                                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                    onClick={() => window.open(`/${loggedInRole}/asset-management`, '_self')}
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

                                        {/* Row: Serial No */}
                                        <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                            <div className="flex-1">
                                                <label className="inputLabel mb-1">Serial Number</label>
                                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                                    <IconWrapper icon={MdInventory} />
                                                    <input type="text" className="stdInputField w-full pl-12"
                                                        placeholder="Product Serial No"
                                                        value={serialNo} onChange={(e) => setSerialNo(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="flex-1"></div>
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
                                        <label className="inputLabel mb-1">Purchase Date</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdCalendarMonth} />
                                            <input type="date" className="stdInputField w-full pl-12"
                                                value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
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
                                            <input type="text" className="stdInputField w-full pl-12"
                                                placeholder="Vendor Name"
                                                value={vendor} onChange={(e) => setVendor(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex-1 mt-4">
                                        <label className="inputLabel mb-1">Purchase Cost (INR)</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={FaRupeeSign} />
                                            <input type="number" className="stdInputField w-full pl-12"
                                                placeholder="0.00"
                                                value={cost} onChange={(e) => setCost(e.target.value)} />
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
                                SECTION 3 — Financial Details
                            ══════════════════════════════════════════ */}
                            <div className="border border-gray-200 rounded-lg p-5 mt-5 shadow-md">
                                <SectionHeader
                                    title="Financial Details"
                                    subtitle="Useful life and depreciation configuration."
                                />

                                {/* Row: Residual Value + Useful Life */}
                                <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                    <div className="flex-1 mt-2">
                                        <label className="inputLabel mb-1">Residual Value (INR)</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={FaRupeeSign} />
                                            <input type="number" className="stdInputField w-full pl-12"
                                                placeholder="0.00"
                                                value={residualValue} onChange={(e) => setResidualValue(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex-1 mt-2">
                                        <label className="inputLabel mb-1">Useful Life (Years)</label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdTimelapse} />
                                            <input type="number" className="stdInputField w-full pl-12"
                                                placeholder="e.g. 5"
                                                value={usefulLife} onChange={(e) => setUsefulLife(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Row: Monthly Depreciation (read-only) */}
                                <div className="flex lg:flex-row md:flex-col flex-col gap-x-4">
                                    <div className="flex-1 mt-4">
                                        <label className="inputLabel mb-1">
                                            Estimated Monthly Depreciation
                                            <span className="ml-1 text-[11px] font-normal text-gray-400">(auto-calculated)</span>
                                        </label>
                                        <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdTrendingDown} />
                                            <input type="text"
                                                className="stdInputField w-full pl-12 bg-gray-50 cursor-not-allowed"
                                                value={`₹ ${monthlyDepreciation}`}
                                                readOnly />
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
