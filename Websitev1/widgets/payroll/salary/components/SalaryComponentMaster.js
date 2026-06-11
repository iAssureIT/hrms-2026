"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function SalaryComponentForm() {
  const [records, setRecords] = useState([]);

  const [formData, setFormData] = useState({
    sequence: "",
    component: "",
    type: "",
    formula: "",
    byValue: "",
    basedOn: "",
  });

  // FETCH ALL RECORDS FROM MONGODB
  const fetchRecords = async () => {
    try {
      const res = await axios.get(
        "/api/salary-components"
      );
      console.log("Fetched Records:", res.data);
      setRecords(res.data || [])
    } catch (error) {
      console.log(error);
    }
  };

  // LOAD DATA AFTER PAGE REFRESH
  useEffect(() => {
    fetchRecords();
  }, []);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT FORM DATA TO MONGODB
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "/api/salary-components",
        formData
      );

      // FETCH UPDATED DATA FROM DB
      fetchRecords();

      // RESET FORM
      setFormData({
        sequence: "",
        component: "",
        type: "",
        formula: "",
        byValue: "",
        basedOn: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // DELETE RECORD
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `/api/salary-components/${id}`
      );

      // REFRESH DATA AFTER DELETE
      fetchRecords();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Components Master</h2>
      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-xl shadow"
      >
        <div className="flex flex-wrap gap-4 items-end">
          {/* Sequence */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Sequence
            </label>

            <input
              type="number"
              name="sequence"
              value={formData.sequence}
              onChange={handleChange}
              placeholder="Enter sequence"
              className="border border-gray-300 text-sm font-medium mb-1 rounded-lg px-3 py-2 w-28 outline-none"
            />
          </div>

          {/* Component */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Component
            </label>

            <input
              type="text"
              name="component"
              value={formData.component}
              onChange={handleChange}
              placeholder="Enter component"
              className="border border-gray-300 text-sm font-medium mb-1 rounded-lg px-3 py-2 w-52 outline-none"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="border border-gray-300 text-sm font-medium mb-1 rounded-lg px-3 py-2 w-40 outline-none"
            >
              <option value="">Select Type</option>
              <option value="earning">Earning</option>
              <option value="deduction">Deduction</option>
            </select>
          </div>

          {/* Formula */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Formula
            </label>

            <select
              name="formula"
              value={formData.formula}
              onChange={handleChange}
              className="border border-gray-300 text-sm font-medium mb-1 rounded-lg px-3 py-2 w-40 outline-none"
            >
              <option value="">Select Formula</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">
                Percentage
              </option>
            </select>
          </div>

          {/* By Value */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              By Value
            </label>

            <input
              type="number"
              name="byValue"
              value={formData.byValue}
              onChange={handleChange}
              placeholder="Enter value"
              className="border border-gray-300 text-sm font-medium mb-1 rounded-lg px-3 py-2 w-32 outline-none"
            />
          </div>

          {/* Based On */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Based On
            </label>

            <select
              name="basedOn"
              value={formData.basedOn}
              onChange={handleChange}
              className="border border-gray-300 text-sm font-medium mb-1 rounded-lg px-3 py-2 w-52 outline-none"
            >
              <option value="">
                Select
              </option>
              <option value="ctc">
                CTC
              </option>
              {/* OPTIONS COMING FROM MONGODB */}
              {records.length > 0 ? (
                records.map((item) => (
                  <option
                    key={item._id}
                    value={item.component}
                  >
                    {item.component}
                  </option>
                ))
              ) : (
                <option>No Records</option>
              )}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Submit
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">
                Sequence
              </th>

              <th className="border p-3 text-left">
                Component
              </th>

              <th className="border p-3 text-left">
                Type
              </th>

              <th className="border p-3 text-left">
                Formula
              </th>

              <th className="border p-3 text-left">
                By Value
              </th>

              <th className="border p-3 text-left">
                Based On
              </th>

              <th className="border p-3 text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {records.length > 0 ? (
              records.map((item) => (
                <tr key={item._id}>
                  <td className="border p-3">
                    {item.sequence}
                  </td>

                  <td className="border p-3">
                    {item.component}
                  </td>

                  <td className="border p-3">
                    {item.type}
                  </td>

                  <td className="border p-3">
                    {item.formula}
                  </td>

                  <td className="border p-3">
                    {item.byValue}
                  </td>

                  <td className="border p-3">
                    {item.basedOn}
                  </td>

                  <td className="border p-3">
                    {/* <button
                      onClick={() =>
                        handleDelete(item._id)
                      }
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button> */}
<button
  onClick={() =>
    handleDelete(item._id)
  }
  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0115.916 21H8.084a2.25 2.25 0 01-2.244-1.327L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0V4.5A2.25 2.25 0 0014.25 2.25h-4.5A2.25 2.25 0 007.5 4.5v1.29"
    />
  </svg>
</button>                    
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center p-5 text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}