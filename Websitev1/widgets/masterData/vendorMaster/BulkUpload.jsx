"use client";

import { useState } from "react";
import { FaFileExcel, FaUpload } from "react-icons/fa";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import axios from "axios";

export default function BulkUpload() {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [successRecords, setSuccessRecords] = useState([]);
    const [failedRecords, setFailedRecords] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setSuccessRecords([]);
        setFailedRecords([]);
        setUploadProgress(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            Swal.fire({
                icon: "warning",
                title: "No file selected",
                text: "Please select a file to upload.",
            });
            return;
        }

        try {
            setLoading(true);
            setUploadProgress(0);

            // Read Excel file and convert to JSON
            const data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const bstr = evt.target.result;
                    const workbook = XLSX.read(bstr, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                    resolve(jsonData);
                };
                reader.onerror = (err) => reject(err);
                reader.readAsBinaryString(file);
            });

            // Create FormData for real upload if file is sent directly
            // But here we just send JSON
            const response = await axios.post(
                "/api/vendor-master/bulk-upload",
                { data, fileName: file.name, createdBy: "Admin" },
                {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / (progressEvent.total || 1)
                        );
                        setUploadProgress(percentCompleted);
                    },
                }
            );

            setUploadProgress(100);

            Swal.fire({
                icon: "success",
                title: "Upload Finished",
                text: `Records processed! ${response.data.validRecords} successful, ${response.data.invalidRecords} failed.`,
                confirmButtonColor: "#059669",
            });

            // Set tables data
            setSuccessRecords(response.data.validData || []);
            setFailedRecords(response.data.failedRecords?.FailedRecords || []);

            setFile(null);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: error.response?.data?.message || error.message || "Something went wrong",
                confirmButtonColor: "#dc2626",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white rounded-2xl shadow-md p-10">
            <h1 className="text-2xl font-bold mb-6">Bulk Upload</h1>

            {/* Instructions & Icon */}
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-6">
                <div className="flex gap-4 items-start">
                    <FaFileExcel className="w-12 h-12 text-green-500 mt-1" />
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>Use attached file format for bulk upload into system.</li>
                        <li>Do not change the headings of the file.</li>
                        <li>File format must be .xlsx or .xls.</li>
                        <li>Date format should be DD/MM/YYYY.</li>
                    </ul>
                </div>

                {/* Upload Progress */}
                <div className="bg-gray-100 p-4 rounded-md w-full md:w-60">
                    <p className="text-sm font-semibold mb-2">Upload Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-green-400 h-3 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{uploadProgress}%</p>
                </div>
            </div>

            {/* File Input */}
            <form onSubmit={handleSubmit}>
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-md px-4 py-4 mb-6 hover:border-green-500">
                    <FaUpload className="w-6 h-6 text-green-500" />
                    <span className="text-gray-600">{file ? file.name : "Select file for upload"}</span>
                    <input type="file" accept=".xls,.xlsx" className="hidden" onChange={handleFileChange} />
                </label>

                {/* Submit Button */}
                <div className="flex justify-end mb-6">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                        disabled={loading}
                    >
                        {loading ? "Uploading..." : "Submit"}
                    </button>
                </div>
            </form>

            {/* Success Records Table */}
            {successRecords.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Successful Records</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="border px-3 py-2">Vendor Code</th>
                                    <th className="border px-3 py-2">Company Name</th>
                                    <th className="border px-3 py-2">Vendor Status</th>
                                    <th className="border px-3 py-2">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {successRecords.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-green-50">
                                        <td className="border px-3 py-2">{row.vendorCode}</td>
                                        <td className="border px-3 py-2">{row.vendorInfo?.nameOfCompany}</td>
                                        <td className="border px-3 py-2">{row.vendorStatus}</td>
                                        <td className="border px-3 py-2">{row.createdBy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Failed Records Table */}
            {failedRecords.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-2">Failed Records</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead className="bg-red-100">
                                <tr>
                                    <th className="border px-3 py-2">Row Data</th>
                                    <th className="border px-3 py-2">Failed Remark</th>
                                </tr>
                            </thead>
                            <tbody>
                                {failedRecords.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-red-50">
                                        <td className="border px-3 py-2">
                                            {JSON.stringify(row, null, 2)}
                                        </td>
                                        <td className="border px-3 py-2">{row.failedRemark}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}