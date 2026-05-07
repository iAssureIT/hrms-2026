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
    { id: "Urgent", label: "Urgent" },
  ];

  return (
    <section className="section p-6 md:p-10 bg-slate-50/30 min-h-screen border-t-[3px] border-[#3c8dbc] shadow-md">
      <div className="max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-200/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Helpdesk Management / Tickets</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Create <span className="text-[#3c8dbc] font-black">Ticket</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
              <button
                onClick={() => router.push("/admin/helpdesk")}
                className="admin-btn-primary flex items-center gap-2 !px-4 !py-1.5"
              >
                <FaChevronLeft size={12} /> Back to List
              </button>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Submit a new support ticket for assistance. Please ensure all details are accurate before submission.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="max-w-2xl mx-auto bg-white border-t-[3px] border-[#3c8dbc] shadow-lg overflow-hidden mt-10 rounded-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Ticket Form
                </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Subject */}
                <div>
                    <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        className="admin-input h-10 font-bold"
                        placeholder="Brief summary of the issue"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>

                {/* Department & Priority Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
                            Department <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            className="admin-select h-10 font-bold"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
                            Priority <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            className="admin-select h-10 font-bold"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            {priorities.map((prio) => (
                                <option key={prio.id} value={prio.id}>{prio.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">
                        Statement of Issue <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        required
                        className="admin-input min-h-[120px] resize-none py-3 font-medium"
                        placeholder="Describe your issue in detail..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Attachments */}
                <div className="space-y-3">
                    <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400">Attachments</label>
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="border border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 hover:border-[#3c8dbc] transition-all cursor-pointer group"
                    >
                        <FaCloudUploadAlt size={24} className="text-slate-300 group-hover:text-[#3c8dbc] mb-2 transition-colors" />
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Upload documents</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">SVG, PNG, JPG or PDF (MAX. 10MB)</p>
                    </div>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                    {formData.attachments.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-4">
                        {formData.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-sky-50 text-[#3c8dbc] flex items-center justify-center">
                                    <FaFileAlt size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-black text-slate-700 truncate max-w-[200px]">{file.fileName}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{file.fileSize}</span>
                                </div>
                            </div>
                            <button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-slate-300 hover:text-red-500 rounded-md transition-all">
                                <FaTimes size={14} />
                            </button>
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/helpdesk")}
                        className="px-6 py-2 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="admin-btn-primary !px-10 !py-2.5 !text-xs !font-black uppercase tracking-widest shadow-lg shadow-sky-100"
                    >
                        {loading ? "Submitting..." : "Submit Ticket"}
                    </button>
                </div>
            </form>
        </div>
      </div>
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default AddTicketPage;
