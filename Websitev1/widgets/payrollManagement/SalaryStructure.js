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
        <div className="admin-box box-primary flex flex-col md:flex-row min-h-[600px] mb-10 overflow-hidden">
            {/* Left Column: Emp List */}
            <div className="w-full md:w-80 border-r border-[#d2d6de] bg-[#f4f6f9]">
                <div className="admin-box-header rounded-none border-b border-[#d2d6de]">
                    <h3 className="admin-box-title">Select Employee</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto p-0">
                    <ul className="divide-y divide-[#d2d6de]">
                        {employees.map(emp => (
                            <li
                                key={emp._id}
                                onClick={() => handleEmpSelect(emp)}
                                className={`p-3 cursor-pointer transition-colors ${selectedEmp?._id === emp._id ? 'bg-[#3c8dbc] text-white border-l-4 border-[#367fa9]' : 'hover:bg-white text-[#444] border-l-4 border-transparent'}`}
                            >
                                <p className="font-bold text-[13px]">{emp.employeeName}</p>
                                <p className={`text-[11px] ${selectedEmp?._id === emp._id ? 'text-blue-100' : 'text-gray-500'}`}>{emp.employeeID}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Column: Editor */}
            <div className="flex-1 p-6">
                {!selectedEmp ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <FaUserEdit size={48} className="mb-4 opacity-30" />
                        <p className="admin-subheading">Select an employee to configure salary</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#d2d6de] pb-4">
                            <div>
                                <h4 className="text-xl font-bold text-gray-800">{selectedEmp.employeeName}</h4>
                                <p className="text-[#3c8dbc] text-xs font-bold uppercase mt-1">{selectedEmp.departmentName} • {selectedEmp.employeeDesignation}</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <button onClick={handleSave} disabled={loading} className="admin-btn-primary px-8 py-2 disabled:opacity-50 text-[13px]">
                                    {loading ? 'Saving...' : 'Save Structure'}
                                </button>
                            </div>
                        </div>

                        {/* Form Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Salary Info */}
                            <div className="space-y-4">
                                <h5 className="flex items-center gap-2 font-bold text-gray-700 text-sm border-b border-[#d2d6de] pb-2"><FaMoneyBillWave className="text-[#3c8dbc]" /> Fixed Salary Components</h5>
                                <div className="admin-form-group">
                                    <label className="admin-label">CTC / Monthly Gross Salary (INR)</label>
                                    <input
                                        type="number"
                                        className="admin-input font-bold text-lg"
                                        value={salaryInfo.grossSalary}
                                        onChange={(e) => setSalaryInfo({ ...salaryInfo, grossSalary: e.target.value })}
                                    />
                                    <p className="help-block text-[11px] text-gray-500 mt-1 italic">* Deductions (PF, ESIC, PT) will be auto-calculated during payroll run based on this Gross value.</p>
                                </div>
                            </div>

                            {/* Statutory IDs */}
                            <div className="space-y-4">
                                <h5 className="flex items-center gap-2 font-bold text-gray-700 text-sm border-b border-[#d2d6de] pb-2"><FaBuilding className="text-[#3c8dbc]" /> Statutory Details</h5>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div className="admin-form-group">
                                        <label className="admin-label">PAN Number</label>
                                        <input type="text" className="admin-input" value={salaryInfo.panNumber} onChange={(e) => setSalaryInfo({ ...salaryInfo, panNumber: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">PF Number</label>
                                        <input type="text" className="admin-input" value={salaryInfo.pfNumber} onChange={(e) => setSalaryInfo({ ...salaryInfo, pfNumber: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">UAN Number</label>
                                        <input type="text" className="admin-input" value={salaryInfo.uanNumber} onChange={(e) => setSalaryInfo({ ...salaryInfo, uanNumber: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">ESIC Number</label>
                                        <input type="text" className="admin-input" value={salaryInfo.esicNumber} onChange={(e) => setSalaryInfo({ ...salaryInfo, esicNumber: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="col-span-full space-y-4 pt-2">
                                <h5 className="flex items-center gap-2 font-bold text-gray-700 text-sm border-b border-[#d2d6de] pb-2"><FaUniversity className="text-[#3c8dbc]" /> Bank Disbursement Details</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="admin-form-group">
                                        <label className="admin-label">Bank Name</label>
                                        <input type="text" className="admin-input" value={salaryInfo.bankName} onChange={(e) => setSalaryInfo({ ...salaryInfo, bankName: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Account Number</label>
                                        <input type="text" className="admin-input" value={salaryInfo.accountNumber} onChange={(e) => setSalaryInfo({ ...salaryInfo, accountNumber: e.target.value })} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">IFSC Code</label>
                                        <input type="text" className="admin-input" value={salaryInfo.ifscCode} onChange={(e) => setSalaryInfo({ ...salaryInfo, ifscCode: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalaryStructure;
