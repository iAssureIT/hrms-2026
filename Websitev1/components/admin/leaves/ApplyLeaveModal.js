"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import moment from "moment";
import ls from "localstorage-slim";

const ApplyLeaveModal = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
    status: "PENDING", // Initial Status
  });

  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setCurrentUser(details);
    fetchEmployees();
    fetchLeaveTypes();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/employees/get");
      console.log("FETCH EMPLOYEES DATA:", res.data);
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      } else if (res.data && Array.isArray(res.data.tableData)) {
        setEmployees(res.data.tableData);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get("/api/leave-types");
      console.log("FETCH LEAVE TYPES DATA:", res.data);
      if (res.data.success && Array.isArray(res.data.data)) {
        setLeaveTypes(res.data.data);
      } else if (Array.isArray(res.data)) {
        setLeaveTypes(res.data);
      }
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/leave-applications", {
        ...formData,
        createdBy: currentUser?._id,
      });
      if (res.data.success) {
        onSuccess();
      } else {
        alert(res.data.message || "Failed to apply leave");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error applying leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-green-600 mb-1">
              <span className="w-4 h-[2px] bg-green-600"></span> Management
              Suite
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Apply <span className="text-green-600">Leave</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Coordinate time-off requests with automated balance tracking.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-all p-2.5 hover:bg-white hover:shadow-sm rounded-xl border border-transparent hover:border-slate-100"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
              Target Employee <span className="text-rose-500">*</span>
            </label>
            <select
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1.2rem_center] bg-[length:1em_1em] shadow-sm"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              }}
            >
              <option value="">Select an employee...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.employeeName} ({emp.employeeID})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1.2rem_center] bg-[length:1em_1em] shadow-sm"
                value={formData.leaveTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, leaveTypeId: e.target.value })
                }
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                }}
              >
                <option value="">Select type</option>
                {leaveTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.leaveTypeName} ({type.leaveCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                Status
              </label>
              <select
                className="w-full px-5 py-3.5 bg-white border-2 border-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1.2rem_center] bg-[length:1em_1em] shadow-sm"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                }}
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Pre-Approved</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                Start <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all shadow-sm"
                value={formData.fromDate}
                onChange={(e) =>
                  setFormData({ ...formData, fromDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                End <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all shadow-sm"
                value={formData.toDate}
                onChange={(e) =>
                  setFormData({ ...formData, toDate: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
              Statement of Reason
            </label>
            <textarea
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all min-h-[120px] resize-none shadow-sm placeholder:text-slate-300"
              placeholder="Provide context for this leave application..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-700 shadow-xl shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Synchronizing..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;
