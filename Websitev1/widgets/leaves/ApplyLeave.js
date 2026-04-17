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
    <section className="section">
      <main className="p-4 min-h-screen">
        <div className="mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-normal text-gray-800 tracking-tight">
                Apply Leave
              </h1>
              <span className="text-sm font-light text-gray-500">
                Submit Application
              </span>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => router.push("/admin/leaves")}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-sm font-normal text-xs hover:bg-gray-50 shadow-sm flex items-center gap-2"
              >
                <FaArrowLeft size={12} /> Back to Dashboard
              </button>
            </div>
          </div>

          {/* Form Container (AdminLTE Box) */}
          <div className="max-w-2xl mx-auto bg-white border-t-[3px] border-[#00a65a] shadow-sm overflow-hidden mt-6">
            <div className="px-5 py-3 border-b border-gray-100 bg-white">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                Application Form
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Target Employee */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Target Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-normal text-gray-700 focus:outline-none focus:border-[#3c8dbc] bg-white"
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
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-normal text-gray-700 focus:outline-none focus:border-[#3c8dbc] bg-white"
                    value={formData.leaveTypeId}
                    onChange={(e) =>
                      setFormData({ ...formData, leaveTypeId: e.target.value })
                    }
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
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Approval Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-normal text-gray-700 focus:outline-none focus:border-[#3c8dbc] bg-white"
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
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-normal text-gray-700 focus:outline-none focus:border-[#3c8dbc]"
                    value={formData.fromDate}
                    onChange={(e) =>
                      setFormData({ ...formData, fromDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-normal text-gray-700 focus:outline-none focus:border-[#3c8dbc]"
                    value={formData.toDate}
                    onChange={(e) =>
                      setFormData({ ...formData, toDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Statement of Reason
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-normal text-gray-700 focus:outline-none focus:border-[#3c8dbc] min-h-[100px] resize-none"
                  placeholder="Provide detailed context..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => router.push("/admin/leaves")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-sm text-xs font-normal text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#00a65a] border border-[#008d4c] text-white rounded-sm text-xs font-normal hover:bg-[#008d4c] shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </section>
  );
};

export default ApplyLeave;
