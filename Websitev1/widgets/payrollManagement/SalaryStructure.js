"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSave, FaUserEdit, FaTrash, FaCheckCircle, FaMoneyBillWave, FaBuilding, FaUniversity } from "react-icons/fa";
import Swal from "sweetalert2";

const SalaryStructure = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [salaryInfo, setSalaryInfo] = useState({
        grossSalary: 0,
        panNumber: "",
        pfNumber: "",
        esicNumber: "",
        uanNumber: "",
        bankName: "",
        accountNumber: "",
        ifscCode: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/get`);
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setEmployees(data);
        } catch (err) { console.error(err); }
    };

    const handleEmpSelect = async (emp) => {
        setSelectedEmp(emp);
        try {
            // In a real scenario, fetch existing salary master for this emp
            // For now, resetting or fetching if endpoint existed
            setSalaryInfo({
                employee_id: emp._id,
                grossSalary: 0,
                panNumber: "",
                pfNumber: "",
                esicNumber: "",
                uanNumber: "",
                bankName: "",
                accountNumber: "",
                ifscCode: ""
            });
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        if (!selectedEmp) return;
        try {
            setLoading(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payroll/post/salary-master`, {
                ...salaryInfo,
                employee_id: selectedEmp._id
            });
            if (res.data.success) {
                Swal.fire("Saved", "Salary structure updated for " + selectedEmp.employeeName, "success");
            }
        } catch (err) {
            Swal.fire("Error", "Save failed", "error");
        } finally { setLoading(false); }
    };

    return (
        <section className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
            {/* Left Column: Emp List */}
            <div className="w-full md:w-80 border-r border-slate-100 bg-slate-50/30">
                <div className="p-8 border-b border-slate-100 bg-white">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Select Employee</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-2">
                    {employees.map(emp => (
                        <div 
                            key={emp._id} 
                            onClick={() => handleEmpSelect(emp)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all ${selectedEmp?._id === emp._id ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'hover:bg-white text-slate-600'}`}
                        >
                            <p className="font-extrabold text-sm">{emp.employeeName}</p>
                            <p className={`text-[10px] font-bold ${selectedEmp?._id === emp._id ? 'text-green-100' : 'text-slate-400'}`}>{emp.employeeID}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Editor */}
            <div className="flex-1 p-10">
                {!selectedEmp ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <FaUserEdit size={64} className="mb-6 opacity-20" />
                        <p className="font-black text-xs uppercase tracking-widest text-slate-400">Select an employee to configure salary</p>
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                            <div>
                                <h4 className="text-2xl font-black text-slate-800">{selectedEmp.employeeName}</h4>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{selectedEmp.departmentName} • {selectedEmp.employeeDesignation}</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleSave} disabled={loading} className="bg-green-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 active:scale-95 transition-all">
                                    {loading ? 'Saving...' : 'Save Structure'}
                                </button>
                            </div>
                        </div>

                        {/* Form Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Salary Info */}
                            <div className="space-y-6">
                                <h5 className="flex items-center gap-2 font-black text-slate-400 text-[10px] uppercase tracking-widest"><FaMoneyBillWave className="text-green-500" /> Fixed Salary Components</h5>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">CTC / Monthly Gross Salary (INR)</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-lg font-black text-slate-700 focus:ring-green-500/20"
                                            value={salaryInfo.grossSalary}
                                            onChange={(e) => setSalaryInfo({...salaryInfo, grossSalary: e.target.value})}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold italic">* Deductions (PF, ESIC, PT) will be auto-calculated during payroll run based on this Gross value.</p>
                                </div>
                            </div>

                            {/* Statutory IDs */}
                            <div className="space-y-6">
                                <h5 className="flex items-center gap-2 font-black text-slate-400 text-[10px] uppercase tracking-widest"><FaBuilding className="text-green-500" /> Statutory Details</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">PAN Number</label>
                                        <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold" value={salaryInfo.panNumber} onChange={(e) => setSalaryInfo({...salaryInfo, panNumber: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">PF Number</label>
                                        <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold" value={salaryInfo.pfNumber} onChange={(e) => setSalaryInfo({...salaryInfo, pfNumber: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">UAN Number</label>
                                        <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold" value={salaryInfo.uanNumber} onChange={(e) => setSalaryInfo({...salaryInfo, uanNumber: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ESIC Number</label>
                                        <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-xl p-3 text-xs font-bold" value={salaryInfo.esicNumber} onChange={(e) => setSalaryInfo({...salaryInfo, esicNumber: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="col-span-full space-y-6 pt-6 border-t border-slate-100">
                                <h5 className="flex items-center gap-2 font-black text-slate-400 text-[10px] uppercase tracking-widest"><FaUniversity className="text-green-500" /> Bank Disbursement Details</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Bank Name</label>
                                        <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold" value={salaryInfo.bankName} onChange={(e) => setSalaryInfo({...salaryInfo, bankName: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Account Number</label>
                                        <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold" value={salaryInfo.accountNumber} onChange={(e) => setSalaryInfo({...salaryInfo, accountNumber: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">IFSC Code</label>
                                        <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold" value={salaryInfo.ifscCode} onChange={(e) => setSalaryInfo({...salaryInfo, ifscCode: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SalaryStructure;
