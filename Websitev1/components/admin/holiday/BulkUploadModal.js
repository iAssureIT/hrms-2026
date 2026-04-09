import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";

const BulkUploadModal = ({ onClose, onSuccess }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws);
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (data.length === 0) {
      Swal.fire("Error", "No data to upload", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/holidays/bulk-upload", { holidayData: data });
      if (res.data.success) {
        Swal.fire("Success", `Uploaded ${res.data.inserted} holidays successfully`, "success");
        onSuccess();
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Bulk upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Bulk Upload Holidays</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-70">Import multiple days via CSV/Excel</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
           <div className="p-10 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50 flex flex-col items-center justify-center text-center group hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer relative">
             <input 
               type="file" 
               accept=".csv, .xlsx, .xls"
               onChange={handleFileUpload}
               className="absolute inset-0 opacity-0 cursor-pointer"
             />
             <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-blue-600 mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
               </svg>
             </div>
             <p className="text-sm font-bold text-gray-700">{fileName || "Click or drag file to upload"}</p>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 px-10">Supports: holidayName, date (YYYY-MM-DD), location (comma separated), type (Mandatory/Optional)</p>
           </div>

           {data.length > 0 && (
             <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Preview ({data.length} records)</h3>
               </div>
               <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-100 bg-white custom-scrollbar">
                 <table className="w-full text-left text-xs">
                   <thead className="bg-gray-50 sticky top-0 font-black uppercase text-gray-400 tracking-tighter">
                     <tr>
                       <th className="px-4 py-3">Holiday</th>
                       <th className="px-4 py-3">Date</th>
                       <th className="px-4 py-3">Location</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {data.slice(0, 50).map((row, i) => (
                       <tr key={i} className="hover:bg-gray-50/50">
                         <td className="px-4 py-3 font-bold text-gray-700">{row.holidayName}</td>
                         <td className="px-4 py-3 font-medium text-gray-500">{row.date}</td>
                         <td className="px-4 py-3 font-medium text-gray-500">{row.location}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {data.length > 50 && <p className="p-3 text-center text-[10px] text-gray-400 italic">Showing first 50 records...</p>}
               </div>
             </div>
           )}

           <div className="flex gap-4">
             <button
               onClick={onClose}
               className="flex-1 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
             >
               Cancel
             </button>
             <button
               onClick={handleUpload}
               disabled={data.length === 0 || loading}
               className="flex-1 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
             >
               {loading ? "Uploading..." : `Upload ${data.length} Records`}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
