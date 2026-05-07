"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaTimes, FaSpinner } from "react-icons/fa";
import GenericTable from "@/widgets/GenericTable/FilterTable";
import Swal from "sweetalert2";

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

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState(0);
  const [runCount, setRunCount] = useState(0);

  const tableHeading = {
    leaveTypeName: "Name",
    leaveCode: "Code",
    isPaid: "Paid",
    carryForward: "Carry Forward",
    actions: "Actions",
  };

  const tableObjects = {
    apiURL: "/api/leave-types",
    deleteMethod: "delete",
    getListMethod: "post",
    editURL: "",
    downloadApply: true,
    searchApply: true,
    showButton: false,
    titleMsg: "Leave Type",
    tableName: "Leave Types List",
  };

  const getData = async () => {
    try {
      setLoading(true);
      const formValues = {
        recsPerPage,
        pageNumber,
        searchText,
      };
      const res = await axios.post("/api/leave-types/post/list", formValues);
      if (res.data.success) {
        setTableData(res.data.tableData);
        setTotalRecs(res.data.totalRecs);
      }
    } catch (err) {
      console.error("Error fetching leave types:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [pageNumber, recsPerPage, searchText, runCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`/api/leave-types/${editingId}`, formData);
        Swal.fire("Success", "Leave type updated successfully", "success");
      } else {
        await axios.post("/api/leave-types", formData);
        Swal.fire("Success", "Leave type added successfully", "success");
      }
      setShowModal(false);
      setRunCount(runCount + 1);
      resetForm();
    } catch (err) {
      Swal.fire("Error", "Error saving leave type", "error");
    }
  };

  const handleAction = async (action, id) => {
    if (action === "edit") {
      try {
        const res = await axios.get(`/api/leave-types/${id}`);
        if (res.data) {
          const type = res.data;
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
        }
      } catch (err) {
        Swal.fire("Error", "Error fetching leave type details", "error");
      }
    }
    if (action === "delete") {
      // GenericTable handles delete confirmation and API call if handled by built-in logic.
      // But we need to refresh the local runCount if GenericTable doesn't do it automatically.
      // Actually FilterTable.js calls getData() which we've mapped.
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
                Leave Type{" "}
                <span className="text-[#3c8dbc] font-black">Master</span>
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
            Configure different types of leaves available for employees,
            including paid/unpaid status and carry-forward policies.
          </p>
        </div>

        <div className="mt-6">
          <GenericTable
            tableHeading={tableHeading}
            tableObjects={tableObjects}
            tableData={tableData}
            setTableData={setTableData}
            recsPerPage={recsPerPage}
            setRecsPerPage={setRecsPerPage}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            searchText={searchText}
            setSearchText={setSearchText}
            totalRecs={totalRecs}
            setTotalRecs={setTotalRecs}
            numOfPages={numOfPages}
            setNumOfPages={setNumOfPages}
            runCount={runCount}
            setRunCount={setRunCount}
            getData={getData}
            handleAction={handleAction}
            loading={loading}
          />
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
