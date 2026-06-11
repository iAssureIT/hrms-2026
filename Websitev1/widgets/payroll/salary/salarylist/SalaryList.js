"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function SalaryList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await axios.get(
        `/api/salary-list/salaries-list`
      );

      setRecords(res.data.data || []);
      console.log(res.data.data)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this salary record?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `/api/salary-list/salaries-list/${id}`
      );

      setRecords((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete record");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">
        Employee Salary Records
      </h1>

      <div className="overflow-auto">
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Employee ID</th>
              <th className="border p-2">Employee Name</th>
              <th className="border p-2">Gross Salary</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {records.map((row) => (
                <tr key={row._id}>
                <td className="border p-2">{row.employeeId}</td>

                <td className="border p-2">
                    {new Date(row.createdAt).toLocaleDateString()}
                </td>

                <td className="border p-2">
                    {row.salaryData?.length}
                </td>

                <td className="border p-2">
                    <button
                    onClick={() => handleDelete(row._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                    Delete
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}