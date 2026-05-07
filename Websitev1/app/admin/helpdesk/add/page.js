"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaCloudUploadAlt, FaFileAlt, FaChevronLeft, FaInfoCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import ls from "localstorage-slim";
import { useRouter } from "next/navigation";

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
    const newAttachments = files.map((file) => ({
      fileName: file.name,
      fileType: file.type,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
      _file: file,
    }));
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
        Swal.fire("Warning", "Please fill in all required fields", "warning");
        return;
    }
    try {
      setLoading(true);
      
      let uploadedAttachments = [];
      if (formData.attachments.length > 0) {
        const uploadFormData = new FormData();
        formData.attachments.forEach((att) => {
          if (att._file) {
            uploadFormData.append("files", att._file);
          }
        });

        const uploadRes = await axios.post("/api/ticket-upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadRes.data.success) {
          uploadedAttachments = uploadRes.data.data.map(file => ({
            fileName: file.fileName,
            fileUrl: (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3050") + file.fileUrl
          }));
        }
      }

      const res = await axios.post("/api/tickets/create", {
        ...formData,
        attachments: uploadedAttachments,
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
      Swal.fire(
        "Error",
        err.response?.data?.error || err.response?.data?.message || "Error creating ticket",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    { id: "Technical Support", label: "Technical Support", icon: "🛠️" },
    { id: "Billing Issues", label: "Billing & Payments", icon: "💳" },
    { id: "Payroll Issues", label: "Payroll Inquiries", icon: "💰" },
    { id: "Attendance Issues", label: "Attendance Issues", icon: "📅" },
    { id: "Leave Issues", label: "Leave Inquiries", icon: "🏖️" },
    { id: "General", label: "General Feedback", icon: "📝" },
  ];

  const priorities = [
    { id: "Low", label: "Low" },
    { id: "Medium", label: "Medium" },
    { id: "High", label: "High" },
    { id: "Urgent", label: "Urgent" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 p-4 lg:p-6 animate-fadeIn flex flex-col items-center">
      <div className="w-full max-w-[640px]">
        {/* Header Section */}
        <div className="mb-6">
            <button 
                onClick={() => router.push("/admin/helpdesk")}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors mb-3 text-[12px] font-bold group uppercase tracking-wider"
            >
                <FaChevronLeft size={9} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to List
            </button>
            <h1 className="text-xl font-bold text-slate-800">Create New Ticket</h1>
            <p className="text-slate-400 text-[13px] mt-0.5 font-medium">Fill in the details below to raise a support request.</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
                {/* Subject */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Subject <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-[#3c8dbc] transition-all placeholder:text-slate-300"
                        placeholder="Brief summary of the issue"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>

                {/* Department & Priority Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department Selection */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Department <span className="text-red-500">*</span></label>
                        <div className="space-y-1.5">
                            {departments.map((dept) => (
                            <button
                                key={dept.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: dept.id })}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left ${
                                formData.category === dept.id
                                    ? "border-[#3c8dbc] bg-sky-50/30"
                                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-sm">{dept.icon}</span>
                                    <span className={`text-[12px] font-semibold ${formData.category === dept.id ? "text-[#3c8dbc]" : "text-slate-600"}`}>
                                        {dept.label}
                                    </span>
                                </div>
                                {formData.category === dept.id && <div className="w-1.5 h-1.5 rounded-full bg-[#3c8dbc]" />}
                            </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority Selection */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Priority <span className="text-red-500">*</span></label>
                        <div className="space-y-1.5">
                            {priorities.map((prio) => (
                            <button
                                key={prio.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, priority: prio.id })}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left ${
                                formData.priority === prio.id
                                    ? "border-[#3c8dbc] bg-sky-50/30"
                                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <span className={`text-[12px] font-semibold ${formData.priority === prio.id ? "text-[#3c8dbc]" : "text-slate-600"}`}>
                                    {prio.label}
                                </span>
                                {formData.priority === prio.id && <div className="w-1.5 h-1.5 rounded-full bg-[#3c8dbc]" />}
                            </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Description <span className="text-red-500">*</span></label>
                    <textarea
                        required
                        className="w-full px-3 py-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-[#3c8dbc] transition-all min-h-[120px] resize-none leading-relaxed placeholder:text-slate-300"
                        placeholder="Describe your issue in detail..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Attachments</label>
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="border border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 hover:border-[#3c8dbc] transition-all cursor-pointer group"
                    >
                        <FaCloudUploadAlt size={20} className="text-slate-300 group-hover:text-[#3c8dbc] mb-2 transition-colors" />
                        <p className="text-[12px] font-bold text-slate-600">Upload documents</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">SVG, PNG, JPG or PDF (max. 10MB)</p>
                    </div>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                    {formData.attachments.length > 0 && (
                    <div className="space-y-1.5 mt-4">
                        {formData.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded bg-sky-50 text-[#3c8dbc] flex items-center justify-center">
                                    <FaFileAlt size={12} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-slate-700 truncate max-w-[200px]">{file.fileName}</span>
                                    <span className="text-[10px] text-slate-400">{file.fileSize}</span>
                                </div>
                            </div>
                            <button type="button" onClick={() => removeAttachment(idx)} className="p-1.5 text-slate-300 hover:text-red-500 rounded-md transition-all">
                                <FaTimes size={12} />
                            </button>
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="pt-6 flex items-center justify-end gap-2.5 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/helpdesk")}
                        className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-[#3c8dbc] text-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-[#367fa9] transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit Ticket"}
                    </button>
                </div>
            </form>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AddTicketPage;
