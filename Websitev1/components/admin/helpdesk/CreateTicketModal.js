"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaTimes, FaCloudUploadAlt, FaFileAlt } from "react-icons/fa";
import ls from "localstorage-slim";

const CreateTicketModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    subject: "",
    category: "General",
    priority: "Medium",
    description: "",
    attachments: [],
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      fileName: file.name,
      fileType: file.type,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
      _file: file // Store the actual file object
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

  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setCurrentUser(details);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Clean attachments for API
      const cleanedAttachments = formData.attachments.map(att => ({
        fileName: att.fileName,
        fileUrl: "uploads/" + att.fileName // Placeholder until actual upload logic is integrated
      }));

      const res = await axios.post("/api/tickets/create", {
        ...formData,
        attachments: cleanedAttachments,
        employeeId: currentUser?.employeeId || currentUser?.user_id,
        createdBy: currentUser?.user_id,
      });
      if (res.data.success) {
        onSuccess();
      }
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      alert(err.response?.data?.error || err.response?.data?.message || "Error creating ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl my-auto animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-100">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-green-600 mb-1">
              <span className="w-4 h-[2px] bg-green-600"></span> Management Suite
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create <span className="text-green-600">Ticket</span></h2>
            <p className="text-[11px] text-slate-400 font-medium">Please provide details so we can synchronize your request.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-all p-2.5 hover:bg-white hover:shadow-sm rounded-xl border border-transparent hover:border-slate-100">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Subject <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all placeholder:text-slate-300 shadow-inner"
              placeholder="e.g., Cannot access team dashboard..."
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Category <span className="text-rose-500">*</span></label>
              <select
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1.2rem_center] bg-[length:1em_1em] shadow-inner"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
              >
                <option value="Attendance Issues">Attendance Issues</option>
                <option value="Payroll Issues">Payroll Issues</option>
                <option value="Leave Issues">Leave Issues</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Priority <span className="text-rose-500">*</span></label>
              <select
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1.2rem_center] bg-[length:1em_1em] shadow-inner"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Description <span className="text-rose-500">*</span></label>
            <textarea
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all min-h-[120px] resize-none placeholder:text-slate-300 shadow-inner"
              placeholder="Describe your issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments</label>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-green-500 transition-colors mb-3">
                <FaCloudUploadAlt size={24} />
              </div>
              <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
            </div>

            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
                        <FaFileAlt size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">{file.fileName}</p>
                        <p className="text-[10px] text-gray-400">{file.fileSize}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm active:scale-95"
            >
              Cancel Process
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-700 shadow-xl shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Synchronizing..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
