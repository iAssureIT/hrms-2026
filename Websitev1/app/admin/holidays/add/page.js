"use client";

import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { MdEventAvailable, MdSave, MdRefresh } from "react-icons/md";

const AddHolidayPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    holidayName: "",
    date: "",
    type: "Mandatory",
    locations: [],
  });
  const [loading, setLoading] = useState(false);

  const availableLocations = ["Global", "New York", "London", "Bangalore", "Chicago", "Dubai"];

  const handleLocationChange = (loc) => {
    let updatedLocations = [...formData.locations];
    if (updatedLocations.includes(loc)) {
      updatedLocations = updatedLocations.filter((l) => l !== loc);
    } else {
      updatedLocations.push(loc);
    }
    setFormData({ ...formData, locations: updatedLocations });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.locations.length === 0) {
      Swal.fire("Error", "Please select at least one location", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/holidays/create", formData);
      if (res.data.success) {
        Swal.fire({
          title: "Success",
          text: "Holiday added successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
        router.push("/admin/holidays");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to create holiday", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-green-600 mb-2">
              <span className="w-8 h-[1px] bg-green-600"></span>
              Management Section
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
              Add New <span className="text-green-600">Holiday</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium">Define organizational time-off and location-based rules.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/admin/holidays")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-slate-300 hover:text-slate-700 transition-all active:scale-95 shadow-sm"
            >
              <MdRefresh size={18} /> Cancel
            </button>
          </div>
        </header>

        {/* Form Section */}
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm overflow-hidden p-8 lg:p-12 relative transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            
            <div className="grid md:grid-cols-2 gap-10">
              {/* Left Column */}
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Holiday Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500 rounded-[1.5rem] text-sm font-bold text-slate-800 transition-all outline-none"
                    placeholder="e.g. Thanksgiving, Diwali..."
                    value={formData.holidayName}
                    onChange={(e) => setFormData({ ...formData, holidayName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500 rounded-[1.5rem] text-sm font-bold text-slate-800 transition-all outline-none"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Holiday Type</label>
                    <div className="relative">
                      <select
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-green-500 rounded-[1.5rem] text-sm font-bold text-slate-800 transition-all outline-none appearance-none cursor-pointer"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="Mandatory">Mandatory</option>
                        <option value="Optional">Optional</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Locations */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Applicable Locations</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLocationChange(loc)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.locations.includes(loc) 
                          ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/20" 
                          : "bg-slate-50 border-transparent text-slate-600 hover:border-slate-200"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        formData.locations.includes(loc) ? "bg-white text-green-600" : "bg-white border-2 border-slate-200"
                      }`}>
                        {formData.locations.includes(loc) && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider">
                        {loc === "Global" ? "Global (All)" : loc}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select one or more regions affected by this holiday.</p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-10 flex gap-4 border-t border-slate-50">
               <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-12 py-5 bg-green-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-green-700 hover:shadow-2xl hover:shadow-green-500/30 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-green-500/10 flex items-center justify-center gap-3"
                >
                  <MdSave size={20} />
                  {loading ? "Processing..." : "Save Holiday Definition"}
                </button>
            </div>
          </form>

          {/* Decorative Background */}
          <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none select-none rotate-12">
            <MdEventAvailable size={400} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddHolidayPage;
