"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ls from "localstorage-slim";
import moment from "moment";
import Swal from "sweetalert2";
import { FaHome, FaArrowLeft, FaSave, FaCloudUploadAlt, FaFileAlt, FaTimes } from "react-icons/fa";

const AddTicketPage = () => {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [formData, setFormData] = useState({
        subject: "",
        category: "General",
        priority: "Medium",
        description: "",
        attachments: [],
    });

    useEffect(() => {
        const details = ls.get("userDetails", { decrypt: true });
        setCurrentUser(details);
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => ({
            fileName: file.name,
            fileType: file.type,
            fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
            _file: file
        }));
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newAttachments]
        }));
    };

    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const cleanedAttachments = formData.attachments.map(att => ({
                fileName: att.fileName,
                fileUrl: "uploads/" + att.fileName
            }));

            const res = await axios.post("/api/tickets/create", {
                ...formData,
                attachments: cleanedAttachments,
                employeeId: currentUser?.employeeId || currentUser?.user_id,
                createdBy: currentUser?.user_id,
            });

            if (res.data.success) {
                Swal.fire({
                    title: "Success",
                    text: "Ticket created successfully",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });
                router.push("/admin/helpdesk");
            }
        } catch (err) {
            console.error("Submission Error:", err.response?.data);
            Swal.fire("Error", err.response?.data?.error || err.response?.data?.message || "Error creating ticket", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Create Ticket</h1>
                        <span className="text-sm font-light text-gray-500">Support center</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-normal text-gray-700 mt-4 md:mt-0">
                        <FaHome className="text-gray-400" />
                        <span>Home</span>
                        <span className="text-gray-400">&gt;</span>
                        <span>Helpdesk</span>
                        <span className="text-gray-400">&gt;</span>
                        <span className="text-gray-400">Add</span>
                    </div>
                </div>

                <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm mb-6 rounded-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">New Inquiry Registration</h3>
                        <button
                            onClick={() => router.push("/admin/helpdesk")}
                            className="text-xs text-gray-500 hover:text-gray-700 font-bold flex items-center gap-1"
                        >
                            <FaArrowLeft size={10} /> Back
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-tight">Subject <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all"
                                        placeholder="e.g. Cannot access payroll dashboard..."
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-tight">Category <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all appearance-none cursor-pointer"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.8rem center', backgroundSize: '0.8em 0.8em', backgroundRepeat: 'no-repeat' }}
                                        >
                                            <option value="Attendance Issues">Attendance Issues</option>
                                            <option value="Payroll Issues">Payroll Issues</option>
                                            <option value="Leave Issues">Leave Issues</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-tight">Priority <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all appearance-none cursor-pointer"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.8rem center', backgroundSize: '0.8em 0.8em', backgroundRepeat: 'no-repeat' }}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-tight">Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all min-h-[150px] resize-none"
                                        placeholder="Please provide details regarding your inquiry..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="space-y-6 text-center md:text-left">
                                <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-tight">Supporting Documents</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="border border-dashed border-gray-300 rounded-sm p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                                >
                                    <FaCloudUploadAlt size={32} className="text-gray-400 group-hover:text-[#3c8dbc] mb-4" />
                                    <p className="text-sm font-bold text-gray-700">Click to upload or drag and drop</p>
                                    <p className="text-[11px] text-gray-500 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {formData.attachments.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Attached Files</p>
                                        {formData.attachments.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-sm bg-gray-100 text-[#3c8dbc] flex items-center justify-center">
                                                        <FaFileAlt size={14} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-gray-700">{file.fileName}</p>
                                                        <p className="text-[10px] text-gray-400">{file.fileSize}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(idx)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 flex gap-3 border-t border-gray-100 justify-end md:justify-start">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#00a65a] border border-[#008d4c] text-white px-10 py-2 rounded-sm font-bold text-xs hover:bg-[#008d4c] shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <FaSave size={14} />
                                {loading ? "Processing..." : "Create Ticket"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/admin/helpdesk")}
                                className="bg-white border border-gray-300 text-gray-700 px-10 py-2 rounded-sm font-bold text-xs hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTicketPage;
