"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function DepartmentForm() {

  const [departments, setDepartments] = useState([]);

  // STORE SELECTED CHECKBOXES
  const [selectedDepartments, setSelectedDepartments] =
    useState([]);

  // FETCH DEPARTMENTS
  const fetchDepartments = async () => {

    try {

      const response = await axios.get(
        "http://localhost:3050/api/pr-department-master"
      );
      setDepartments(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // HANDLE CHECKBOX
  const handleCheckboxChange = (
    departmentName
  ) => {

    setSelectedDepartments((prev) => {

      // REMOVE IF ALREADY EXISTS
      if (prev.includes(departmentName)) {

        return prev.filter(
          (item) => item !== departmentName
        );
      }

      // ADD
      return [...prev, departmentName];
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const payload = {
        departments: selectedDepartments,
      };

      console.log(payload);

      // SAVE API
      await axios.post(
        "http://localhost:3050/api/save-departments",
        payload
      );

      alert("Departments Saved");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Department Selection
          </h1>

          <p className="text-gray-500 mt-2">
            Select departments using checkboxes
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* CHECKBOX GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {departments.length > 0 ? (

              departments.map((item, index) => {

                const departmentName =
                  item.departmentName;

                const checked =
                  selectedDepartments.includes(
                    departmentName
                  );

                return (

                  <label
                    key={index}
                    className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer transition
                    ${
                      checked
                        ? "bg-indigo-50 border-indigo-500"
                        : "bg-white border-gray-200 hover:border-indigo-300"
                    }`}
                  >

                    {/* CHECKBOX */}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        handleCheckboxChange(
                          departmentName
                        )
                      }
                      className="w-5 h-5 accent-indigo-600"
                    />

                    {/* NAME */}
                    <div>

                      <h2 className="font-semibold text-lg">
                        {departmentName}
                      </h2>

                      <p className="text-sm text-gray-500">
                        Department Access
                      </p>
                    </div>
                  </label>
                );
              })

            ) : (

              <p className="text-gray-500">
                No Departments Found
              </p>
            )}
          </div>

          {/* SELECTED */}
          <div className="bg-gray-50 rounded-2xl p-5 border">

            <h2 className="font-bold text-lg mb-3">
              Selected Departments
            </h2>

            {selectedDepartments.length > 0 ? (

              <div className="flex flex-wrap gap-3">

                {selectedDepartments.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>

            ) : (

              <p className="text-gray-500 text-sm">
                No Department Selected
              </p>
            )}
          </div>

          {/* BUTTON */}
          <div className="flex justify-end">

            <button
              type="submit"
              className="bg-black text-white px-8 py-3 rounded-2xl hover:bg-gray-800 transition"
            >
              Save Departments
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}