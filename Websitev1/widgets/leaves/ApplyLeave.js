"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaArrowLeft } from "react-icons/fa";
import moment from "moment";
import ls from "localstorage-slim";
import { useRouter } from "next/navigation";

const ApplyLeave = () => {
  const router = useRouter();
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
    status: "PENDING",
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
        router.push("/admin/leaves");
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
    <section className="section p-6 md:p-10 bg-white min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-green-600">Administrative Suite</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Apply <span className="text-green-600 font-black">Leave</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4 mt-6 md:mt-0 mb-1">
               <button
                onClick={() => router.push("/admin/leaves")}
                className="flex items-center gap-3 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 px-6 py-3.5 rounded-2xl shadow-sm transition-all active:scale-95 font-black uppercase tracking-[0.2em] text-[10px]"
              >
                <FaArrowLeft size={12} /> Back to Dashboard
              </button>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-[11px] leading-relaxed mt-3 pl-1">
            Fill out the form below to submit a new leave application. Ensure all fields marked with an asterisk are completed accurately.
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border-2 border-slate-50 shadow-xl overflow-hidden mt-12 animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Application Form</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Submit request for approval</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {/* Target Employee */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Target Employee <span className="text-rose-500">*</span></label>
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500/20 bg-clip-padding rounded-2xl text-xs font-bold text-slate-700 outline-none transition-all appearance-none bg-no-repeat bg-[right_1.5rem_center] bg-[length:1em_1em] shadow-inner"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                >
                  <option value="">Select an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.employeeName} ({emp.employeeID})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Category <span className="text-rose-500">*</span></label>
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500/20 rounded-2xl text-xs font-bold text-slate-700 outline-none transition-all appearance-none bg-no-repeat bg-[right_1.5rem_center] bg-[length:1em_1em] shadow-inner"
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                >
                  <option value="">Select type</option>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type._id}>{type.leaveTypeName} ({type.leaveCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Approval Status</label>
                <select
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1.5rem_center] bg-[length:1em_1em] shadow-inner"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                >
                  <option value="PENDING">Pending Approval</option>
                  <option value="APPROVED">Pre-Approved</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Start Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500/20 rounded-2xl text-xs font-bold text-slate-700 outline-none transition-all shadow-inner"
                  value={formData.fromDate}
                  onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">End Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500/20 rounded-2xl text-xs font-bold text-slate-700 outline-none transition-all shadow-inner"
                  value={formData.toDate}
                  onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Statement of Reason</label>
              <textarea
                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-green-500/20 rounded-2xl text-xs font-bold text-slate-700 outline-none transition-all min-h-[150px] resize-none shadow-inner placeholder:text-slate-300"
                placeholder="Provide detailed context for this leave application..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/admin/leaves")}
                className="flex-1 px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm active:scale-95"
              >
                Cancel Process
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-700 shadow-xl shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Synchronizing..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ApplyLeave;
