import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AddHolidayModal = ({ onClose, onSuccess }) => {
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
      updatedLocations = updatedLocations.filter(l => l !== loc);
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
        Swal.fire("Success", "Holiday added successfully", "success");
        onSuccess();
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to create holiday", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Add New Holiday</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-70">Define organizational time-off</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Holiday Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-gray-800"
                placeholder="e.g. Thanksgiving, Diwali..."
                value={formData.holidayName}
                onChange={(e) => setFormData({ ...formData, holidayName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-gray-800"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Holiday Type</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-gray-800"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Mandatory">Mandatory</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Applicable Locations</label>
              <div className="grid grid-cols-2 gap-2">
                {availableLocations.map((loc) => (
                  <div 
                    key={loc}
                    onClick={() => handleLocationChange(loc)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      formData.locations.includes(loc) 
                        ? "bg-blue-50 border-blue-200" 
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      formData.locations.includes(loc) ? "bg-blue-600 border-blue-600" : "bg-gray-100 border-gray-200"
                    }`}>
                      {formData.locations.includes(loc) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-bold ${formData.locations.includes(loc) ? "text-blue-900" : "text-gray-600"}`}>
                      {loc === "Global" ? "Global (All)" : loc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHolidayModal;
