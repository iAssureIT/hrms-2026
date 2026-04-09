"use client";
import React, { useState, useEffect } from "react";
import { MdOutlineEdit } from "react-icons/md";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import { Tooltip } from "@material-tailwind/react";
import { FaFileDownload } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";

const VendorDetails = () => {
    const router = useRouter();
    const params = useParams();
    const vendorId = params?.id;

    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDownload, setLoadingDownload] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [loadingList, setLoadingList] = useState(false);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                if (vendorId) {
                    const res = await axios.get(`/api/vendor-master/get/${vendorId}`);
                    console.log("vendor res -->", res.data);

                    if (res.data?.success) {
                        setVendor(res.data.data);
                    }
                }
            } catch (err) {
                setVendor(null);
            } finally {
                setLoading(false);
            }
        };

        fetchVendor();
    }, [vendorId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FaSpinner className="animate-spin text-3xl text-green-600" />
                <p className="mt-3">Loading Vendor Details...</p>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="text-center text-red-500 font-semibold py-20">
                Vendor not found
            </div>
        );
    }

    const v = vendor.vendorInfo || {};
    const b = vendor.bankDetails || {};
    const a = vendor.addressDetails || {};

    const downloadVendorPDF = () => {
        setLoadingDownload(true);

        setTimeout(() => {
            window.print(); // or your html2pdf logic
            setLoadingDownload(false);
        }, 500);
    };

    return (
        <section className="section">
            <div className="border rounded-md bg-white shadow">

                {/* Header */}
                <div className="flex justify-between items-center border-b p-5">

                    <h1 className="text-2xl font-semibold tracking-wide uppercase">
                        Vendor Details
                    </h1>

                    <div className="flex gap-3  hide-in-pdf">

                        {/* Download PDF */}
                        {/* <Tooltip
                            content="Download as PDF"
                            placement="bottom"
                            className="bg-green"
                            arrow={false}
                        >
                            {loadingDownload ? (
                                <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                            ) : (
                                <FaFileDownload
                                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                    onClick={downloadVendorPDF}
                                />
                            )}
                        </Tooltip> */}



                        <Tooltip
                            content="Edit Vendor"
                            placement="bottom"
                            className="bg-green"
                            arrow={false}
                        >
                            {loadingEdit ? (
                                <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                            ) : (
                                <MdOutlineEdit
                                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        window.open(
                                            `/admin/master-data/vendor-master/add-vendor/${vendorId}`,
                                            "_self"
                                        );
                                    }}
                                />
                            )}
                        </Tooltip>



                        {/* Vendor List */}
                        <Tooltip
                            content="Vendor List"
                            placement="bottom"
                            className="bg-green"
                            arrow={false}
                        >
                            {loadingList ? (
                                <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                            ) : (
                                <CiViewList
                                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                    onClick={() => {
                                        window.open(
                                            `/admin/master-data/vendor-master/vendor-list`,
                                            "_self"
                                        );
                                    }}
                                />
                            )}
                        </Tooltip>

                    </div>

                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* ================= Vendor Information ================= */}
                    <div className="border rounded-lg p-6 shadow-lg bg-white">
                        <h2 className="text-lg font-semibold mb-6 border-b pb-2">
                            Vendor Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            <div>
                                <p className="text-gray-500 text-sm">Company Name</p>
                                <p className="font-semibold">{v.nameOfCompany}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Vendor ID</p>
                                <p className="font-semibold">{vendor.vendorID}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Vendor Category</p>
                                <p className="font-semibold">{v.vendorCategory}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Vendor SubCategory</p>
                                <p className="font-semibold">{v.vendorSubCategory}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">PAN Number</p>
                                <p className="font-semibold">{v.panNumber}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">GSTIN</p>
                                <p className="font-semibold">{v.gstin}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Registered Center</p>
                                <p className="font-semibold">{v.lupinFoundationCenterName}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">TDS Applicable</p>
                                <p className="font-semibold">
                                    {v.tdsApplicable ? "Yes" : "No"}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* <div className="border-b "></div> */}

                    {/* ================= Contact Person Details ================= */}
                    <div className="border rounded-lg p-6 shadow-lg bg-white">
                        <h2 className="text-lg font-semibold mb-6 border-b pb-2">
                            Contact Person Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-gray-500 text-sm">Primary Contact</p>
                                <p className="font-semibold">{v.primaryContactPersonName}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Designation</p>
                                <p className="font-semibold">{v.designation}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Mobile Number</p>
                                <p className="font-semibold">{v.mobileNumber}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Email</p>
                                <p className="font-semibold">{v.officialEmailId}</p>
                            </div>

                        </div>
                    </div>


                    {/* ================= Bank Details ================= */}
                    <div className="border rounded-lg p-6 shadow-lg bg-white">
                        <h2 className="text-lg font-semibold mb-6 border-b pb-2">
                            Bank Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            <div>
                                <p className="text-gray-500 text-sm">Bank Name</p>
                                <p className="font-semibold">{b.bankName}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Branch Name</p>
                                <p className="font-semibold">{b.branchName}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Account Holder</p>
                                <p className="font-semibold">{b.accountHolderName}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Account Number</p>
                                <p className="font-semibold">{b.accountNumber}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">IFSC Code</p>
                                <p className="font-semibold">{b.ifscCode}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Account Type</p>
                                <p className="font-semibold">{b.accountType}</p>
                            </div>

                        </div>
                    </div>


                    {/* ================= Address Details ================= */}
                    <div className="border rounded-lg p-6 shadow-lg bg-white">
                        <h2 className="text-lg font-semibold mb-6 border-b pb-2">
                            Address Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            <div>
                                <p className="text-gray-500 text-sm">Address Line</p>
                                <p className="font-semibold">{a.addressLine1}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">City</p>
                                <p className="font-semibold">{a.city}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">District</p>
                                <p className="font-semibold">{a.district}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">State</p>
                                <p className="font-semibold">{a.state}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">Country</p>
                                <p className="font-semibold">{a.country}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">PIN Code</p>
                                <p className="font-semibold">{a.pinCode}</p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default VendorDetails;