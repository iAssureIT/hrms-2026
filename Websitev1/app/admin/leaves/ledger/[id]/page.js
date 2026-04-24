"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import moment from "moment";
import { FaArrowLeft, FaDownload, FaSearch, FaFilter } from "react-icons/fa";

const EmployeeLeaveLedger = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const month = searchParams.get("month") || moment().format("MM");
  const year = searchParams.get("year") || moment().format("YYYY");

  const [employee, setEmployee] = useState(null);
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [id, month, year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Employee Basic Info
      const empRes = await axios.get(`/api/employees/get/${id}`);
      setEmployee(empRes.data);

      // Fetch Summary Matrix
      const summaryRes = await axios.get(`/api/leave-balance/summary/${id}`, {
        params: { month, year }
      });
      if (summaryRes.data.success) setSummary(summaryRes.data.data);

      // Fetch Ledger Transactions
      const ledgerRes = await axios.get(`/api/leave-ledger/employee/${id}`, {
        params: { month, year }
      });
      if (ledgerRes.data.success) setLedger(ledgerRes.data.data);

    } catch (err) {
      console.error("Error fetching ledger data:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!ledger.length) return;
    
    const headers = ["Date", "Type", "Transaction", "Days", "Balance", "Source", "Remarks"];
    const rows = ledger.map(tx => [
      moment(tx.transactionDate).format("DD MMM YYYY"),
      tx.leaveTypeId?.leaveCode || "N/A",
      tx.days > 0 ? "EARNED" : "USED",
      tx.days,
      tx.balanceAfter,
      tx.referenceType || "SYSTEM",
      tx.remarks || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leave_Ledger_${employee?.employeeName || "Employee"}_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLedger = ledger.filter(tx => 
    tx.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.leaveTypeId?.leaveCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center text-gray-500 italic">Loading detailed ledger...</div>;

  return (
    <main className="p-6 min-h-screen bg-[#f4f7f6]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {employee?.employeeName || "Employee"}'s Leave Ledger
              </h1>
              <p className="text-sm text-gray-500">
                {moment().month(parseInt(month) - 1).format("MMMM")} {year} | {employee?.employeeID}
              </p>
            </div>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-[#00a65a] text-white px-4 py-2 rounded shadow hover:bg-[#008d4c] transition-all text-sm font-bold"
          >
            <FaDownload /> Export CSV
          </button>
        </div>

        {/* Matrix Summary Table */}
        <div className="bg-white rounded-sm shadow-sm border-t-[3px] border-[#3c8dbc] mb-8 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monthly Matrix Summary</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-[11px] font-bold text-gray-600 uppercase border-b">Leave Type</th>
                <th className="px-6 py-3 text-[11px] font-bold text-gray-600 uppercase border-b text-center">Opening Balance</th>
                <th className="px-6 py-3 text-[11px] font-bold text-gray-600 uppercase border-b text-center">Earned (Month)</th>
                <th className="px-6 py-3 text-[11px] font-bold text-gray-600 uppercase border-b text-center">Used (Month)</th>
                <th className="px-6 py-3 text-[11px] font-bold text-gray-600 uppercase border-b text-center">Closing Balance / LOP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Earned Leave (EL) */}
              <tr>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">Earned Leave (EL)</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-gray-500">{summary?.earnedLeave?.opening || 0}</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-[#00a65a]">+{summary?.earnedLeave?.monthlyEarned || 0}</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-[#dd4b39]">-{summary?.earnedLeave?.monthlyUsed || 0}</td>
                <td className="px-6 py-4 text-center">
                   <span className={`text-sm font-bold ${summary?.earnedLeave?.balance < 0 ? "text-red-600" : "text-gray-800"}`}>
                     {summary?.earnedLeave?.balance || 0}
                   </span>
                </td>
              </tr>
              {/* Comp Off (CO) */}
              <tr>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">Comp Off (CO)</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-gray-500">{summary?.compOff?.opening || 0}</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-[#3c8dbc]">+{summary?.compOff?.monthlyEarned || 0}</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-[#dd4b39]">-{summary?.compOff?.monthlyUsed || 0}</td>
                <td className="px-6 py-4 text-center">
                   <span className={`text-sm font-bold ${summary?.compOff?.balance < 0 ? "text-red-600" : "text-gray-800"}`}>
                     {summary?.compOff?.balance || 0}
                   </span>
                </td>
              </tr>
              {/* LOP Row */}
              <tr className={summary?.lop > 0 ? "bg-red-50" : ""}>
                <td className={`px-6 py-4 text-sm font-bold ${summary?.lop > 0 ? "text-red-600" : "text-gray-700"}`}>Loss of Pay (LOP)</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-gray-400">---</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-gray-400">---</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-[#dd4b39]">
                   {summary?.lop > 0 ? `+${summary?.lop}` : "0"}
                </td>
                <td className="px-6 py-4 text-center">
                   <span className={`text-sm font-bold ${summary?.lop > 0 ? "text-red-600" : "text-gray-400"}`}>
                     {summary?.lop || 0}
                   </span>
                </td>
              </tr>
              {/* Total Paid Balance Row */}
              <tr className="bg-blue-50/30 border-t-2 border-gray-100">
                <td className="px-6 py-4 text-sm font-extrabold text-[#3c8dbc]">Total Paid Balance (EL + CO)</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-gray-400">---</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-gray-400">---</td>
                <td className="px-6 py-4 text-sm text-center font-bold text-gray-400">---</td>
                <td className="px-6 py-4 text-center">
                   <span className={`text-base font-black ${summary?.totalBalance < 0 ? "text-red-600" : "text-[#3c8dbc]"}`}>
                     {summary?.totalBalance || 0}
                   </span>
                </td>
              </tr>
              {/* LOP Row */}
            </tbody>
          </table>
        </div>

        {/* Detailed Ledger Section */}
        <div className="bg-white rounded-sm shadow-sm border-t-[3px] border-[#00a65a]">
          <div className="px-4 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transaction History</h3>
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input 
                type="text" 
                placeholder="Search remarks or type..."
                className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-sm text-xs focus:outline-none focus:border-[#00a65a]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f9f9f9]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200">Date</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200">Type</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200">Transaction</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200 text-center">Days</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200 text-center">Balance</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200">Source</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-20 text-center text-gray-400 italic text-xs">
                      No transactions found for the selected period.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="px-4 py-4 text-[10px] text-gray-600">
                        {moment(tx.transactionDate).format("DD MMM YYYY")}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-bold text-[#3c8dbc] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                          {tx.leaveTypeId?.leaveCode || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          tx.days > 0 ? "bg-green-100 text-[#00a65a]" : "bg-red-100 text-[#dd4b39]"
                        }`}>
                          {tx.days > 0 ? "Earned" : "Used"}
                        </span>
                      </td>
                      <td className={`px-4 py-4 text-center font-bold text-[11px] ${
                        tx.days > 0 ? "text-[#00a65a]" : "text-[#dd4b39]"
                      }`}>
                        {tx.days > 0 ? "+" : ""}{tx.days}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-[11px] font-bold text-gray-800 bg-gray-50 rounded px-2 py-1 inline-block border border-gray-100">
                          {tx.balanceAfter}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                          {tx.referenceType || "SYSTEM"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[10px] text-gray-500 italic max-w-[200px] truncate" title={tx.remarks}>
                        {tx.remarks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-50 bg-gray-50">
            <p className="text-[10px] text-gray-400 italic">
              * Note: Running balance represents the remaining balance for that specific leave type after the transaction.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EmployeeLeaveLedger;
