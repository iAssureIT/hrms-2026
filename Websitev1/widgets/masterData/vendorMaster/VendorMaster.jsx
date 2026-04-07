"use client";

import { useState, useEffect } from "react";
import validator from "validator";
import Swal from "sweetalert2";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { FaList } from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";
import BulkUpload from "./BulkUpload.jsx";

const initialState = {
    vendorStatus: "Active",
    vendorInfo: {
        nameOfCompany: "",
        vendorCategory: "",
        vendorType: "",
        panNumber: "",
        gstin: "",
        tdsApplicable: false,
        lupinFoundationCenterName: "",
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
    const [isBulkUpload, setIsBulkUpload] = useState(false)

    /* ================= HANDLE CHANGE ================= */

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
        if (!pid) return;   // Only run in edit mode

        const fetchVendorData = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    `/api/vendor-master/get/${pid}`
                );

                const vendor = response.data?.data;

                if (vendor) {
                    setFormData({
                        vendorStatus: vendor.vendorStatus || "Active",

                        vendorInfo: {
                            ...initialState.vendorInfo,
                            ...vendor.vendorInfo,
                        },

                        bankDetails: {
                            ...initialState.bankDetails,
                            ...vendor.bankDetails,
                        },

                        addressDetails: {
                            ...initialState.addressDetails,
                            ...vendor.addressDetails,
                        },
                    });
                }

            } catch (error) {
                console.error("Fetch Vendor Error:", error);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to load vendor data.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchVendorData();

    }, [pid]);

    /* ================= VALIDATION ================= */

    const validateForm = () => {
        const newErrors = {};
        const { vendorInfo, bankDetails, addressDetails } = formData;

        /* ================= VENDOR INFO ================= */

        // Company Name
        if (!vendorInfo.nameOfCompany?.trim()) {
            newErrors.nameOfCompany = "Company Name is required";
        }

        // Vendor Category
        if (!vendorInfo.vendorCategory?.trim()) {
            newErrors.vendorCategory = "Vendor Category is required";
        }

        // Vendor Type
        if (!vendorInfo.vendorType?.trim()) {
            newErrors.vendorType = "Vendor Type is required";
        }

        // PAN Number
        if (!vendorInfo.panNumber?.trim()) {
            newErrors.panNumber = "PAN Number is required";
        } else if (
            !validator.matches(
                vendorInfo.panNumber,
                /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
            )
        ) {
            newErrors.panNumber = "Invalid PAN format";
        }

        // GSTIN
        if (!vendorInfo.gstin?.trim()) {
            newErrors.gstin = "GSTIN is required";
        } else if (
            !validator.matches(
                vendorInfo.gstin,
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
            )
        ) {
            newErrors.gstin = "Invalid GSTIN format";
        }

        // Lupin Foundation Center Name
        if (!vendorInfo.lupinFoundationCenterName?.trim()) {
            newErrors.lupinFoundationCenterName =
                "Lupin Foundation Center Name is required";
        }

        // Primary Contact Person
        if (!vendorInfo.primaryContactPersonName?.trim()) {
            newErrors.primaryContactPersonName =
                "Primary Contact Person is required";
        }

        // Designation
        if (!vendorInfo.designation?.trim()) {
            newErrors.designation = "Designation is required";
        }

        // Mobile Number
        if (!vendorInfo.mobileNumber?.trim()) {
            newErrors.mobileNumber = "Mobile Number is required";
        } else if (!validator.isMobilePhone(vendorInfo.mobileNumber, "en-IN")) {
            newErrors.mobileNumber = "Invalid Mobile Number";
        }

        // Official Email
        if (!vendorInfo.officialEmailId?.trim()) {
            newErrors.officialEmailId = "Official Email is required";
        } else if (!validator.isEmail(vendorInfo.officialEmailId)) {
            newErrors.officialEmailId = "Invalid Email Address";
        }

        /* ================= BANK DETAILS ================= */

        if (!bankDetails.bankName?.trim()) {
            newErrors.bankName = "Bank Name is required";
        }

        if (!bankDetails.branchName?.trim()) {
            newErrors.branchName = "Branch Name is required";
        }

        if (!bankDetails.accountHolderName?.trim()) {
            newErrors.accountHolderName = "Account Holder Name is required";
        }

        // Account Number
        if (!bankDetails.accountNumber?.trim()) {
            newErrors.accountNumber = "Account Number is required";
        } else if (!validator.isNumeric(bankDetails.accountNumber)) {
            newErrors.accountNumber = "Account Number must be numeric";
        }

        // IFSC Code
        if (!bankDetails.ifscCode?.trim()) {
            newErrors.ifscCode = "IFSC Code is required";
        } else if (
            !validator.matches(
                bankDetails.ifscCode,
                /^[A-Z]{4}0[A-Z0-9]{6}$/
            )
        ) {
            newErrors.ifscCode = "Invalid IFSC Code";
        }

        if (!bankDetails.accountType?.trim()) {
            newErrors.accountType = "Account Type is required";
        }

        /* ================= ADDRESS DETAILS ================= */

        if (!addressDetails.addressLine1?.trim()) {
            newErrors.addressLine1 = "Address Line 1 is required";
        }

        if (!addressDetails.city?.trim()) {
            newErrors.city = "City is required";
        }

        if (!addressDetails.district?.trim()) {
            newErrors.district = "District is required";
        }

        if (!addressDetails.state?.trim()) {
            newErrors.state = "State is required";
        }

        if (!addressDetails.country?.trim()) {
            newErrors.country = "Country is required";
        }

        if (!addressDetails.pinCode?.trim()) {
            newErrors.pinCode = "PIN Code is required";
        } else if (
            !validator.isLength(addressDetails.pinCode, { min: 6, max: 6 }) ||
            !validator.isNumeric(addressDetails.pinCode)
        ) {
            newErrors.pinCode = "PIN Code must be 6 digits";
        }

        /* ================= FINAL ================= */

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    /* ================= SUBMIT ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) return; // Stop if form invalid

        try {
            setLoading(true);
            let response;
            if (pid) {
                // ===== UPDATE =====
                response = await axios.put(`/api/vendor-master/update/${pid}`, formData);

                if (response.status === 200 || response.status === 201) {
                    await Swal.fire({
                        icon: "success",
                        title: "Updated!",
                        text: "Vendor updated successfully.",
                        confirmButtonColor: "#059669",
                    });
                }
            } else {
                // ===== CREATE =====
                response = await axios.post("/api/vendor-master/create", formData);

                if (response.status === 200 || response.status === 201) {
                    await Swal.fire({
                        icon: "success",
                        title: "Created!",
                        text: "Vendor created successfully.",
                        confirmButtonColor: "#059669",
                    });

                    // Reset form after success
                    setFormData(initialState);
                    setErrors({});
                }
            }

            // Redirect to list page after create/update
            router.push("/admin/master-data/vendor-master/vendor-list");

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: error?.response?.data?.message || "Something went wrong. Please try again.",
                confirmButtonColor: "#dc2626",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-10">

                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold">
                        Vendor Registration
                    </h1>

                    <div className="flex gap-2">
                        <button
                            className="flex items-center gap-2 text-white  hover:bg-green-100 px-4 py-2 rounded-md border"
                            onClick={() => router.push("/admin/master-data/vendor-master/vendor-list")}
                        >
                            <FaList className="w-5 h-5  text-green-400" />

                        </button>
                        <button
                            className="flex items-center gap-2 text-white  hover:bg-green-100 px-4 py-2 rounded-md border"
                            onClick={() => { setIsBulkUpload(!isBulkUpload) }}
                        >
                            <FiUploadCloud className="w-5 h-5  text-green-400" />

                        </button>
                    </div>
                </div>

                {
                    isBulkUpload ?

                        <form onSubmit={handleSubmit} className="space-y-12">

                            {/* ================= VENDOR INFO ================= */}
                            <div className="border p-6 rounded-lg">
                                <h2 className="text-lg font-semibold mb-6">Vendor Information</h2>


                                {/* <div className="grid md:grid-cols-3 gap-6"> */}
                                <div className="grid md:grid-cols-3 gap-6">

                                    {/* Company Name */}
                                    <div>
                                        <label className="text-sm font-medium">Company Name</label>
                                        <span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.vendorInfo.nameOfCompany}
                                            onChange={(e) =>
                                                handleChange("vendorInfo", "nameOfCompany", e.target.value)
                                            }
                                            className={`input ${errors.nameOfCompany ? "border-red-500" : ""}`}
                                        />
                                        {errors.nameOfCompany && (
                                            <p className="error">{errors.nameOfCompany}</p>
                                        )}
                                    </div>

                                    {/* Vendor Category */}
                                    <div>
                                        <label className="text-sm font-medium">Vendor Category</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.vendorInfo.vendorCategory}
                                            onChange={(e) =>
                                                handleChange("vendorInfo", "vendorCategory", e.target.value)
                                            }
                                            className={`input ${errors.vendorCategory ? "border-red-500" : ""}`}
                                        />
                                        {errors.vendorCategory && (
                                            <p className="error">{errors.vendorCategory}</p>
                                        )}
                                    </div>

                                    {/* Vendor Type */}
                                    <div>
                                        <label className="text-sm font-medium">Vendor Type</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.vendorInfo.vendorType}
                                            onChange={(e) =>
                                                handleChange("vendorInfo", "vendorType", e.target.value)
                                            }
                                            className={`input ${errors.vendorType ? "border-red-500" : ""}`}
                                        />
                                        {errors.vendorType && (
                                            <p className="error">{errors.vendorType}</p>
                                        )}
                                    </div>

                                    {/* PAN Number */}
                                    <div>
                                        <label className="text-sm font-medium">PAN Number</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            maxLength={10}
                                            value={formData.vendorInfo.panNumber}
                                            onChange={(e) =>
                                                handleChange(
                                                    "vendorInfo",
                                                    "panNumber",
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            className={`input ${errors.panNumber ? "border-red-500" : ""}`}
                                        />
                                        {errors.panNumber && (
                                            <p className="error">{errors.panNumber}</p>
                                        )}
                                    </div>

                                    {/* GSTIN */}
                                    <div>
                                        <label className="text-sm font-medium">GSTIN</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            maxLength={15}
                                            value={formData.vendorInfo.gstin}
                                            onChange={(e) =>
                                                handleChange(
                                                    "vendorInfo",
                                                    "gstin",
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            className={`input ${errors.gstin ? "border-red-500" : ""}`}
                                        />
                                        {errors.gstin && (
                                            <p className="error">{errors.gstin}</p>
                                        )}
                                    </div>

                                    {/* Lupin Foundation Center */}
                                    <div>
                                        <label className="text-sm font-medium">
                                            Lupin Foundation Center Name
                                        </label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.vendorInfo.lupinFoundationCenterName}
                                            onChange={(e) =>
                                                handleChange(
                                                    "vendorInfo",
                                                    "lupinFoundationCenterName",
                                                    e.target.value
                                                )
                                            }
                                            className={`input ${errors.lupinFoundationCenterName ? "border-red-500" : ""
                                                }`}
                                        />
                                        {errors.lupinFoundationCenterName && (
                                            <p className="error">
                                                {errors.lupinFoundationCenterName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Primary Contact Person */}
                                    <div>
                                        <label className="text-sm font-medium">
                                            Primary Contact Person
                                        </label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.vendorInfo.primaryContactPersonName}
                                            onChange={(e) =>
                                                handleChange(
                                                    "vendorInfo",
                                                    "primaryContactPersonName",
                                                    e.target.value
                                                )
                                            }
                                            className={`input ${errors.primaryContactPersonName ? "border-red-500" : ""
                                                }`}
                                        />
                                        {errors.primaryContactPersonName && (
                                            <p className="error">
                                                {errors.primaryContactPersonName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Designation */}
                                    <div>
                                        <label className="text-sm font-medium">Designation</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.vendorInfo.designation}
                                            onChange={(e) =>
                                                handleChange("vendorInfo", "designation", e.target.value)
                                            }
                                            className={`input ${errors.designation ? "border-red-500" : ""}`}
                                        />
                                        {errors.designation && (
                                            <p className="error">{errors.designation}</p>
                                        )}
                                    </div>

                                    {/* Mobile Number */}
                                    <div>
                                        <label className="text-sm font-medium">Mobile Number</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            maxLength={10}
                                            value={formData.vendorInfo.mobileNumber}
                                            onChange={(e) =>
                                                handleChange("vendorInfo", "mobileNumber", e.target.value)
                                            }
                                            className={`input ${errors.mobileNumber ? "border-red-500" : ""}`}
                                        />
                                        {errors.mobileNumber && (
                                            <p className="error">{errors.mobileNumber}</p>
                                        )}
                                    </div>

                                    {/* Official Email */}
                                    <div>
                                        <label className="text-sm font-medium">Official Email</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            type="email"
                                            value={formData.vendorInfo.officialEmailId}
                                            onChange={(e) =>
                                                handleChange(
                                                    "vendorInfo",
                                                    "officialEmailId",
                                                    e.target.value
                                                )
                                            }
                                            className={`input ${errors.officialEmailId ? "border-red-500" : ""
                                                }`}
                                        />
                                        {errors.officialEmailId && (
                                            <p className="error">
                                                {errors.officialEmailId}
                                            </p>
                                        )}
                                    </div>

                                    {/* TDS Applicable */}
                                    <div className="flex items-center gap-2 mt-6">
                                        <input
                                            type="checkbox"
                                            checked={formData.vendorInfo.tdsApplicable}
                                            onChange={(e) =>
                                                handleChange(
                                                    "vendorInfo",
                                                    "tdsApplicable",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <label className="text-sm font-medium">
                                            TDS Applicable
                                        </label><span className="text-red-500 ml-1">*</span>
                                    </div>

                                </div>


                            </div>

                            {/* ================= BANK ================= */}
                            <div className="border p-6 rounded-lg">
                                <h2 className="text-lg font-semibold mb-6">Bank Details</h2>

                                <div className="grid md:grid-cols-3 gap-6">

                                    {/* Bank Name */}
                                    <div>
                                        <label className="text-sm font-medium">Bank Name</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.bankDetails.bankName}
                                            onChange={(e) =>
                                                handleChange("bankDetails", "bankName", e.target.value)
                                            }
                                            className={`input ${errors.bankName ? "border-red-500" : ""}`}
                                        />
                                        {errors.bankName && (
                                            <p className="error">{errors.bankName}</p>
                                        )}
                                    </div>

                                    {/* Branch Name */}
                                    <div>
                                        <label className="text-sm font-medium">Branch Name</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.bankDetails.branchName}
                                            onChange={(e) =>
                                                handleChange("bankDetails", "branchName", e.target.value)
                                            }
                                            className={`input ${errors.branchName ? "border-red-500" : ""}`}
                                        />
                                        {errors.branchName && (
                                            <p className="error">{errors.branchName}</p>
                                        )}
                                    </div>

                                    {/* Account Holder Name */}
                                    <div>
                                        <label className="text-sm font-medium">Account Holder Name</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.bankDetails.accountHolderName}
                                            onChange={(e) =>
                                                handleChange("bankDetails", "accountHolderName", e.target.value)
                                            }
                                            className={`input ${errors.accountHolderName ? "border-red-500" : ""
                                                }`}
                                        />
                                        {errors.accountHolderName && (
                                            <p className="error">{errors.accountHolderName}</p>
                                        )}
                                    </div>

                                    {/* Account Number */}
                                    <div>
                                        <label className="text-sm font-medium">Account Number</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            type="number"
                                            value={formData.bankDetails.accountNumber}
                                            onChange={(e) =>
                                                handleChange("bankDetails", "accountNumber", e.target.value)
                                            }
                                            className={`input ${errors.accountNumber ? "border-red-500" : ""}`}
                                        />
                                        {errors.accountNumber && (
                                            <p className="error">{errors.accountNumber}</p>
                                        )}
                                    </div>

                                    {/* IFSC Code */}
                                    <div>
                                        <label className="text-sm font-medium">IFSC Code</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            maxLength={11}
                                            value={formData.bankDetails.ifscCode}
                                            onChange={(e) =>
                                                handleChange(
                                                    "bankDetails",
                                                    "ifscCode",
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            className={`input ${errors.ifscCode ? "border-red-500" : ""}`}
                                        />
                                        {errors.ifscCode && (
                                            <p className="error">{errors.ifscCode}</p>
                                        )}
                                    </div>

                                    {/* Account Type */}
                                    <div>
                                        <label className="text-sm font-medium">Account Type</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.bankDetails.accountType}
                                            onChange={(e) =>
                                                handleChange("bankDetails", "accountType", e.target.value)
                                            }
                                            className={`input ${errors.accountType ? "border-red-500" : ""}`}
                                        />
                                        {errors.accountType && (
                                            <p className="error">{errors.accountType}</p>
                                        )}
                                    </div>

                                </div>

                            </div>

                            {/* ================= BANK ================= */}
                            <div className="border p-6 rounded-lg">
                                <h2 className="text-lg font-semibold mb-6">Bank Details</h2>

                                <div className="grid md:grid-cols-3 gap-6">

                                    {/* Address Line 1 */}
                                    <div>
                                        <label className="text-sm font-medium">Address Line 1</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.addressDetails.addressLine1}
                                            onChange={(e) =>
                                                handleChange("addressDetails", "addressLine1", e.target.value)
                                            }
                                            className={`input ${errors.addressLine1 ? "border-red-500" : ""}`}
                                        />
                                        {errors.addressLine1 && (
                                            <p className="error">{errors.addressLine1}</p>
                                        )}
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="text-sm font-medium">City</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.addressDetails.city}
                                            onChange={(e) =>
                                                handleChange("addressDetails", "city", e.target.value)
                                            }
                                            className={`input ${errors.city ? "border-red-500" : ""}`}
                                        />
                                        {errors.city && (
                                            <p className="error">{errors.city}</p>
                                        )}
                                    </div>

                                    {/* District */}
                                    <div>
                                        <label className="text-sm font-medium">District</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.addressDetails.district}
                                            onChange={(e) =>
                                                handleChange("addressDetails", "district", e.target.value)
                                            }
                                            className={`input ${errors.district ? "border-red-500" : ""}`}
                                        />
                                        {errors.district && (
                                            <p className="error">{errors.district}</p>
                                        )}
                                    </div>

                                    {/* State */}
                                    <div>
                                        <label className="text-sm font-medium">State</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.addressDetails.state}
                                            onChange={(e) =>
                                                handleChange("addressDetails", "state", e.target.value)
                                            }
                                            className={`input ${errors.state ? "border-red-500" : ""}`}
                                        />
                                        {errors.state && (
                                            <p className="error">{errors.state}</p>
                                        )}
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="text-sm font-medium">Country</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            value={formData.addressDetails.country}
                                            onChange={(e) =>
                                                handleChange("addressDetails", "country", e.target.value)
                                            }
                                            className={`input ${errors.country ? "border-red-500" : ""}`}
                                        />
                                        {errors.country && (
                                            <p className="error">{errors.country}</p>
                                        )}
                                    </div>

                                    {/* PIN Code */}
                                    <div>
                                        <label className="text-sm font-medium">PIN Code</label><span className="text-red-500 ml-1">*</span>
                                        <input
                                            maxLength={6}
                                            type="number"
                                            value={formData.addressDetails.pinCode}
                                            onChange={(e) =>
                                                handleChange("addressDetails", "pinCode", e.target.value)
                                            }
                                            className={`input ${errors.pinCode ? "border-red-500" : ""}`}
                                        />
                                        {errors.pinCode && (
                                            <p className="error">{errors.pinCode}</p>
                                        )}
                                    </div>

                                </div>



                            </div>

                            {/* ================= SUBMIT ================= */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl"
                                >
                                    {loading ? "Saving..." : pid ? "Update" : "Submit"}
                                </button>
                            </div>

                        </form>
                        :
                        <BulkUpload
                            // fieldLabel={fieldLabel}
                            // goodRecordsHeading={goodRecordsHeading}
                            // failedtableHeading={failedtableHeading}
                            // fileDetailUrl={fileDetailUrl}
                        />
                    // <h1>Hrllo</h1>
                }



            </div>

            {/* Small utility styles */}
            <style jsx>{`
        .input {
          width: 100%;
          margin-top: 6px;
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          height: 32px;
          outline: none;
        }
        .error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>

        </div>
    );
}
