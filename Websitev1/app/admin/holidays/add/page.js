"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FaHome, FaSave, FaArrowLeft } from "react-icons/fa";
import { HiMapPin, HiGlobeAlt, HiBuildingOffice2 } from "react-icons/hi2";

const AddHolidayPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    holidayName: "",
    date: "",
    type: "Mandatory",
    locations: [],
  });
  const [loading, setLoading] = useState(false);

  const [availableLocations, setAvailableLocations] = useState(["All", "Global"]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await axios.get("/api/centers/list");
      if (res.data) {
        setAvailableLocations(["All", "Global", ...res.data.map((c) => c.centerName)]);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleLocationChange = (loc) => {
    let updatedLocations = [...formData.locations];
    
    if (loc === "All") {
      if (updatedLocations.includes("All")) {
        updatedLocations = [];
      } else {
        updatedLocations = ["All"];
      }
    } else if (loc === "Global") {
      if (updatedLocations.includes("Global")) {
        updatedLocations = updatedLocations.filter(l => l !== "Global");
      } else {
        updatedLocations.push("Global");
      }
    } else {
      if (updatedLocations.includes(loc)) {
        updatedLocations = updatedLocations.filter((l) => l !== loc);
      } else {
        updatedLocations = updatedLocations.filter(l => l !== "All");
        updatedLocations.push(loc);
      }
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
    <div className="min-h-screen">
      <div className="mx-auto">
        
        {/* AdminLTE style Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Add Holiday</h1>
            <span className="text-sm font-light text-gray-500">Control panel</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-normal text-gray-700 mt-4 md:mt-0">
            <FaHome className="text-gray-400" />
            <span>Home</span>
            <span className="text-gray-400">&gt;</span>
            <span>Holidays</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-400">Add</span>
          </div>
        </div>

        {/* Form Box */}
        <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm mb-6 rounded-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">New Holiday Definition</h3>
            <button 
              onClick={() => router.push("/admin/holidays")}
              className="text-xs text-gray-500 hover:text-gray-700 font-bold flex items-center gap-1"
            >
              <FaArrowLeft size={10} /> Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-tight">Holiday Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all"
                    placeholder="e.g. Thanksgiving, Diwali..."
                    value={formData.holidayName}
                    onChange={(e) => setFormData({ ...formData, holidayName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-tight">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-tight">Holiday Type</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all appearance-none cursor-pointer"
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
                <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-tight">Applicable Locations</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableLocations.map((loc) => {
                    const icon = loc === "All" ? <HiMapPin size={12}/> : loc === "Global" ? <HiGlobeAlt size={12}/> : <HiBuildingOffice2 size={12}/>;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleLocationChange(loc)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-sm border transition-all duration-200 text-left ${
                          formData.locations.includes(loc) 
                            ? "bg-[#00a65a] border-[#008d4c] text-white shadow-sm" 
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-none flex items-center justify-center transition-all ${
                          formData.locations.includes(loc) ? "bg-white text-[#00a65a]" : "bg-white border border-gray-300"
                        }`}>
                          {formData.locations.includes(loc) ? (
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-gray-300 opacity-0">{icon}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tight flex-1 truncate">
                          {loc === "All" ? "All Locations" : loc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-gray-400 italic font-normal">Select one or more regions affected by this holiday.</p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-6 flex gap-2 border-t border-gray-100">
               <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#00a65a] border border-[#008d4c] text-white px-8 py-2 rounded-sm font-bold text-xs hover:bg-[#008d4c] shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <FaSave size={14} />
                  {loading ? "Processing..." : "Save Holiday"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/admin/holidays")}
                  className="bg-white border border-gray-300 text-gray-700 px-8 py-2 rounded-sm font-bold text-xs hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddHolidayPage;

