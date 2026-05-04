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
    <section className="section p-6 md:p-10 bg-white min-h-screen border-t-[3px] border-[#3c8dbc] shadow-md">
      <div className="max-w-[1440px] mx-auto">
        {/* Theme-aligned Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Human Resources / Leaves</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Apply <span className="text-[#3c8dbc] font-black">Leave</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
              <button
                onClick={() => router.push("/admin/leaves")}
                className="admin-btn-primary flex items-center gap-2 !px-4 !py-1.5"
              >
                <FaArrowLeft size={12} /> Back to Dashboard
              </button>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Submit a new leave application for approval. Please ensure all details are accurate before submission.
          </p>
        </div>

          {/* Form Container (AdminLTE Box) */}
          <div className="max-w-2xl mx-auto bg-white border-t-[3px] border-[#3c8dbc] shadow-lg overflow-hidden mt-8 rounded-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Application Form
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Target Employee */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400">
                    Target Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="admin-select h-10 font-bold"
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                  >
                    <option value="">Select an employee...</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.employeeName} ({emp.employeeID})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="admin-select h-10 font-bold"
                    value={formData.leaveTypeId}
                    onChange={(e) =>
                      setFormData({ ...formData, leaveTypeId: e.target.value })
                    }
                  >
                    <option value="">Select type</option>
                    {leaveTypes
                      .filter((type) => !["CO", "EL"].includes(type.leaveCode))
                      .map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.leaveTypeName} ({type.leaveCode})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400">
                    Approval Status
                  </label>
                  <select
                    className="admin-select h-10 font-bold"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="PENDING">Pending Approval</option>
                    <option value="APPROVED">Pre-Approved</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="admin-input h-10 font-bold"
                    value={formData.fromDate}
                    onChange={(e) =>
                      setFormData({ ...formData, fromDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="admin-input h-10 font-bold"
                    value={formData.toDate}
                    onChange={(e) =>
                      setFormData({ ...formData, toDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="admin-label text-[10px] uppercase tracking-widest text-slate-400">
                  Statement of Reason
                </label>
                <textarea
                  className="admin-input min-h-[100px] resize-none py-3 font-medium"
                  placeholder="Provide detailed context..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => router.push("/admin/leaves")}
                  className="px-6 py-2 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn-primary !px-8 !py-2 !text-xs !font-black uppercase tracking-widest"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
      </div>
    </section>
  );
};

export default ApplyLeave;
