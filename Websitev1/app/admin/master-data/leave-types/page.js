"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const LeaveTypesManagement = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    leaveTypeName: "",
    leaveCode: "",
    maxDaysPerYear: 0,
    isPaid: true,
    carryForward: false,
    carryForwardLimit: 0,
    applicableGender: "ALL",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/leave-types");
      if (res.data.success) {
        setLeaveTypes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching leave types:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`/api/leave-types/${editingId}`, formData);
      } else {
        await axios.post("/api/leave-types", formData);
      }
      setShowModal(false);
      fetchLeaveTypes();
      resetForm();
    } catch (err) {
      alert("Error saving leave type");
    }
  };

  const handleEdit = (type) => {
    setEditingId(type._id);
    setFormData({
      leaveTypeName: type.leaveTypeName,
      leaveCode: type.leaveCode,
      maxDaysPerYear: type.maxDaysPerYear,
      isPaid: type.isPaid,
      carryForward: type.carryForward,
      carryForwardLimit: type.carryForwardLimit,
      applicableGender: type.applicableGender || "ALL",
      status: type.status || "ACTIVE",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this leave type?")) {
      try {
        await axios.delete(`/api/leave-types/${id}`);
        fetchLeaveTypes();
      } catch (err) {
        alert("Error deleting leave type");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      leaveTypeName: "",
      leaveCode: "",
      maxDaysPerYear: 0,
      isPaid: true,
      carryForward: false,
      carryForwardLimit: 0,
      applicableGender: "ALL",
      status: "ACTIVE",
    });
  };

  return (
    <section className="section admin-box box-primary">
      <div className="hr-card hr-fade-in">
        {/* Theme-aligned Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Human Resources</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Leave Type <span className="text-[#3c8dbc] font-black">Master</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="admin-btn-primary flex items-center gap-2"
              >
                <FaPlus size={14} /> Add Leave Type
              </button>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Configure different types of leaves available for employees, including paid/unpaid status and carry-forward policies.
          </p>
        </div>

        <div className="admin-box box-primary mt-6 !border-none !shadow-none">
          <div className="admin-box-header border-b border-gray-100 !px-0">
            <h3 className="admin-box-title uppercase">Leave Types List</h3>
          </div>

          <div className="py-6 px-0 overflow-x-auto">
            <table className="admin-table">
              <thead className="admin-table-thead">
                <tr>
                  <th className="admin-table-th">Name</th>
                  <th className="admin-table-th">Code</th>
                  <th className="admin-table-th text-center">Paid</th>
                  <th className="admin-table-th">Carry Forward</th>
                  <th className="admin-table-th w-32 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="admin-table-td text-center py-10 text-[#3c8dbc]">
                      <FaSpinner className="animate-spin text-3xl inline-block" />
                    </td>
                  </tr>
                ) : leaveTypes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="admin-table-td text-center py-10 text-gray-400 font-bold italic">
                      No leave types configured
                    </td>
                  </tr>
                ) : (
                  leaveTypes.map((type) => (
                    <tr key={type._id} className="hover:bg-gray-50 transition-colors">
                      <td className="admin-table-td font-bold text-gray-900">
                        {type.leaveTypeName}
                      </td>
                      <td className="admin-table-td">
                        <span className="bg-blue-50 text-[#3c8dbc] text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                          {type.leaveCode}
                        </span>
                      </td>
                      <td className="admin-table-td text-center">
                        {type.isPaid ? (
                          <span className="text-green-600 font-bold text-xs uppercase flex items-center justify-center gap-1">
                            <FaCheck size={10} /> Paid
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold text-xs uppercase flex items-center justify-center gap-1">
                            <FaTimes size={10} /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="admin-table-td">
                        {type.carryForward ? (
                          <div>
                            <span className="text-green-600 font-bold text-xs uppercase">Yes</span>
                            {type.carryForwardLimit > 0 && (
                              <div className="text-[10px] text-gray-400 font-bold">
                                Limit: {type.carryForwardLimit}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-bold text-xs uppercase">No</span>
                        )}
                      </td>
                      <td className="admin-table-td">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(type)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(type._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit" : "Add"} Leave Type
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="e.g. Casual Leave"
                    value={formData.leaveTypeName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leaveTypeName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase placeholder:text-gray-300"
                    placeholder="CL"
                    value={formData.leaveCode}
                    onChange={(e) =>
                      setFormData({ ...formData, leaveCode: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="hidden">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">
                    Max Days / Year
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none"
                    value={formData.maxDaysPerYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDaysPerYear: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">
                    Applicable Gender
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                    value={formData.applicableGender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicableGender: e.target.value,
                      })
                    }
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    }}
                  >
                    <option value="ALL">All</option>
                    <option value="MALE">Male Only</option>
                    <option value="FEMALE">Female Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 py-2 bg-gray-50/50 px-4 rounded-xl border border-dashed border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.isPaid}
                      onChange={(e) =>
                        setFormData({ ...formData, isPaid: e.target.checked })
                      }
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${formData.isPaid ? "bg-blue-600" : "bg-gray-300"}`}
                    ></div>
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPaid ? "translate-x-5" : "translate-x-0"}`}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Is Paid?
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.carryForward}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          carryForward: e.target.checked,
                        })
                      }
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${formData.carryForward ? "bg-blue-600" : "bg-gray-300"}`}
                    ></div>
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.carryForward ? "translate-x-5" : "translate-x-0"}`}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Carry Forward?
                  </span>
                </label>
              </div>

              {formData.carryForward && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">
                    Carry Forward Limit
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="Max days to carry forward"
                    value={formData.carryForwardLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        carryForwardLimit: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all"
                >
                  Save Leave Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default LeaveTypesManagement;
