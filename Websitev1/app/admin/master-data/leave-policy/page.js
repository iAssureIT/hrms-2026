"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaShieldAlt } from "react-icons/fa";

const LeavePolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    policyName: "",
    maxConsecutiveDays: 3,
    minNoticeDays: 1,
    isProbationEligible: false,
    accrualType: "YEARLY",
    accrualDays: 0,
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchPolicies();
    fetchLeaveTypes();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/leave-policy");
      if (res.data.success) {
        setPolicies(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching policies:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get("/api/leave-types");
      if (res.data.success) {
        setLeaveTypes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`/api/leave-policy/${editingId}`, formData);
      } else {
        await axios.post("/api/leave-policy", formData);
      }
      setShowModal(false);
      fetchPolicies();
      resetForm();
    } catch (err) {
      alert("Error saving leave policy");
    }
  };

  const handleEdit = (policy) => {
    setEditingId(policy._id);
    setFormData({
      leaveTypeId: policy.leaveTypeId?._id || policy.leaveTypeId,
      policyName: policy.policyName,
      maxConsecutiveDays: policy.maxConsecutiveDays,
      minNoticeDays: policy.minNoticeDays,
      isProbationEligible: policy.isProbationEligible,
      accrualType: policy.accrualType,
      accrualDays: policy.accrualDays,
      status: policy.status || "ACTIVE",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      try {
        await axios.delete(`/api/leave-policy/${id}`);
        fetchPolicies();
      } catch (err) {
        alert("Error deleting policy");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      leaveTypeId: "",
      policyName: "",
      maxConsecutiveDays: 3,
      minNoticeDays: 1,
      isProbationEligible: false,
      accrualType: "YEARLY",
      accrualDays: 0,
      status: "ACTIVE",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Policies</h1>
          <p className="text-gray-500 text-sm">Define specific usage and accrual rules for each leave type.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md font-semibold"
        >
          <FaPlus size={12} /> Create Policy
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Policy Name</th>
              <th className="px-6 py-4">Leave Type</th>
              <th className="px-6 py-4">Max Consecutive</th>
              <th className="px-6 py-4">Accrual</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
            ) : policies.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No policies defined</td></tr>
            ) : (
              policies.map((policy) => (
                <tr key={policy._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FaShieldAlt size={14} />
                      </div>
                      <div className="text-sm font-bold text-gray-800">{policy.policyName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600 uppercase">{policy.leaveTypeId?.leaveCode || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{policy.maxConsecutiveDays} Days</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-700">{policy.accrualType}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase">{policy.accrualDays} days per cycle</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      policy.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(policy)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><FaEdit size={14} /></button>
                      <button onClick={() => handleDelete(policy._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><FaTrash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 text-gray-800">
              <h2 className="text-xl font-bold">{editingId ? "Edit" : "Create"} Policy</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Policy Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                  placeholder="e.g. Standard Casual Leave Policy 2026"
                  value={formData.policyName}
                  onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Leave Type <span className="text-red-500">*</span></label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type._id}>{type.leaveTypeName} ({type.leaveCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Max Consecutive Days</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={formData.maxConsecutiveDays}
                    onChange={(e) => setFormData({ ...formData, maxConsecutiveDays: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Min Notice Days</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={formData.minNoticeDays}
                    onChange={(e) => setFormData({ ...formData, minNoticeDays: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Accrual Type</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                    value={formData.accrualType}
                    onChange={(e) => setFormData({ ...formData, accrualType: e.target.value })}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="NONE">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Accrual Days</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={formData.accrualDays}
                    onChange={(e) => setFormData({ ...formData, accrualDays: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.isProbationEligible}
                    onChange={(e) => setFormData({ ...formData, isProbationEligible: e.target.checked })}
                  />
                  <span className="text-sm font-semibold text-gray-700">Probation employees eligible?</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all">Save Policy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePolicyManagement;
