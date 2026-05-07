"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaCloudUploadAlt, FaFileAlt, FaChevronRight, FaInfoCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import ls from "localstorage-slim";

const CreateTicketModal = ({ isOpen, onClose, onRefresh }) => {
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

  if (!isOpen) return null;

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
      const cleanedAttachments = formData.attachments.map((att) => ({
        fileName: att.fileName,
        fileUrl: "uploads/" + att.fileName,
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
        onRefresh();
        onClose();
        setFormData({
            subject: "",
            category: "General",
            priority: "Medium",
            description: "",
            attachments: [],
        });
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
    { id: "General", label: "General Feedback", icon: "📝" },
  ];

  const priorities = [
    { id: "Low", label: "Low", color: "bg-slate-100 text-slate-600" },
    { id: "Medium", label: "Medium", color: "bg-blue-50 text-blue-600" },
    { id: "High", label: "High", color: "bg-orange-50 text-orange-600", info: "High priority" },
    { id: "Urgent", label: "Urgent", color: "bg-red-50 text-red-600", info: "Critical issues only" },
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Create New Ticket</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Fill in the details below to raise a support request.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Subject <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder="Brief summary of the issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          {/* Department & Priority Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Selection */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Department <span className="text-red-500">*</span></label>
              <div className="space-y-1.5">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: dept.id })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left ${
                      formData.category === dept.id
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                        <span className="text-sm">{dept.icon}</span>
                        <span className={`text-[12px] font-semibold ${formData.category === dept.id ? "text-blue-700" : "text-slate-600"}`}>
                            {dept.label}
                        </span>
                    </div>
                    {formData.category === dept.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Priority <span className="text-red-500">*</span></label>
              <div className="space-y-1.5">
                {priorities.map((prio) => (
                  <button
                    key={prio.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: prio.id })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left ${
                      formData.priority === prio.id
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`text-[12px] font-semibold ${formData.priority === prio.id ? "text-blue-700" : "text-slate-600"}`}>
                        {prio.label}
                    </span>
                    {formData.priority === prio.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Description <span className="text-red-500">*</span></label>
            <textarea
              required
              className="w-full px-3 py-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 transition-all min-h-[120px] resize-none leading-relaxed placeholder:text-slate-300"
              placeholder="Describe your issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Attachments</label>
            <div
              onClick={() => fileInputRef.current.click()}
              className="border border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer group"
            >
              <FaCloudUploadAlt size={20} className="text-slate-300 group-hover:text-blue-500 mb-2" />
              <p className="text-[12px] font-bold text-slate-600">Upload files</p>
              <p className="text-[10px] text-slate-400 mt-0.5">SVG, PNG, JPG or PDF (max. 10MB)</p>
            </div>
            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {formData.attachments.length > 0 && (
              <div className="space-y-1.5 mt-3">
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-blue-50 text-blue-500 flex items-center justify-center">
                        <FaFileAlt size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-slate-700 truncate max-w-[180px]">{file.fileName}</span>
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
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CreateTicketModal;
