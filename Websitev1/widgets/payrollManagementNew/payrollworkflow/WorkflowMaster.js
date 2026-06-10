"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const PayrollWorkflowForm = () => {

  const [employees, setEmployees] = useState([]);

  const [workflowData, setWorkflowData] = useState([
    {
      approvalLevel: 1,
      processName: "",
      approverRole: "",
    },
    {
      approvalLevel: 2,
      processName: "",
      approverRole: "",
    },
    {
      approvalLevel: 3,
      processName: "",
      approverRole: "",
    },
  ]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/payroll-management/patroll-workflow-approvers");
      setEmployees(res.data.data || []);
      console.log('users ',res.data.data)
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...workflowData];
    updated[index][field] = value;
    setWorkflowData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = workflowData.filter(
        (item) => item.processName && item.approverRole
      );

      await axios.post(
        "/api/payroll-management/createPayrollWorkflow",
        payload
      );

      Swal.fire({
        icon: "",
        title: "Workflow Master",
        text: "Workflow Saved Successfully",
      });      

    } catch (error) {
      console.error(error);
      alert("Error while saving");
    }
  };

  return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">
            Payroll Workflow Master
            </h2>
        </div>

        <div className="space-y-4">
            {[1, 2, 3].map((level, index) => (
            <div
                key={level}
                className="grid grid-cols-3 gap-5 border border-gray-100 rounded-xl p-4"
            >
                {/* Level */}
                <div>
                <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                    Approval Level
                </label>

                <input
                    type="text"
                    value={`Level ${level}`}
                    disabled
                    className="mt-2 w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm"
                />
                </div>

                {/* Process Name */}
                <div>
                <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                    Process Name
                </label>

                <input
                    type="text"
                    placeholder="Enter Process Name"
                    value={workflowData[index].processName}
                    onChange={(e) =>
                    handleChange(
                        index,
                        "processName",
                        e.target.value
                    )
                    }
                    className="mt-2 w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
                />
                </div>

                {/* Approver */}
                <div>
                <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                    Approver
                </label>

                <select
                    value={workflowData[index].approverRole}
                    onChange={(e) =>
                    handleChange(
                        index,
                        "approverRole",
                        e.target.value
                    )
                    }
                    className="mt-2 w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
                >
                    <option value="">
                        Select Employee
                    </option>

                    {employees.map((user) => (
                        <option
                            key={user._id}
                            value={user.employeeID}
                        >
                        {user.employeeName}
                    </option>
                    ))}
                </select>
                </div>
            </div>
            ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
            <button
            onClick={handleSubmit}
            className="px-6 h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
            Save Workflow
            </button>
        </div>
        </div>
  );
};

export default PayrollWorkflowForm;