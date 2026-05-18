"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function PayrollMultiStepForm() {

  const [step, setStep] = useState(1);

  // DEPARTMENTS
  const [departments, setDepartments] =
    useState([]);

  // EMPLOYEES
  const [employees, setEmployees] =
    useState([]);

  // SELECTED DATA
  const [selectedDepartments, setSelectedDepartments] =
    useState([]);

  const [selectedEmployees, setSelectedEmployees] =
    useState([]);

  // PAYROLL DATA
  const [payrollData, setPayrollData] =
    useState({
      payrollDate: "",
    });

  // EMPLOYEE PAYROLL DETAILS
  const [employeePayrollDetails,
    setEmployeePayrollDetails] =
    useState([]);

  // FETCH DEPARTMENTS
  const fetchDepartments = async () => {

    try {

      const response = await axios.get(
        "http://localhost:3050/api/payroll/prdept"
      );
      setDepartments(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // FETCH EMPLOYEES BASED ON DEPARTMENT
  const fetchEmployees = async () => {

    try {

      const response = await axios.post(
        "http://localhost:3050/api/payroll/prdept/premp",
          {
            departments: selectedDepartments,
          }
      );
      console.log("employees response", selectedDepartments);
      setEmployees(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {

    if (
      selectedDepartments.length > 0
    ) {
      fetchEmployees();
    }

  }, [selectedDepartments]);

  // HANDLE DEPARTMENT CHECKBOX
  const handleDepartmentChange = (
    department
  ) => {

    setSelectedDepartments((prev) => {

      if (prev.includes(department)) {

        return prev.filter(
          (item) => item !== department
        );
      }

      return [...prev, department];
    });
  };

  // HANDLE EMPLOYEE CHECKBOX
  const handleEmployeeChange = (
    employee
  ) => {

    setSelectedEmployees((prev) => {

      if (prev.includes(employee)) {

        return prev.filter(
          (item) => item !== employee
        );
      }

      return [...prev, employee];
    });
  };

  // NEXT STEP
  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  // PREVIOUS STEP
  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  // RUN PAYROLL
  const runPayroll = () => {

    const payrollEmployees =
      selectedEmployees.map((emp) => ({
        employee: emp,
        attendance: "",
        leave: "",
        otHours: "",
      }));

    setEmployeePayrollDetails(
      payrollEmployees
    );

    nextStep();
  };

  // HANDLE PAYROLL DETAIL CHANGE
  const handlePayrollDetailChange = (
    index,
    field,
    value
  ) => {

    const updated =
      [...employeePayrollDetails];

    updated[index][field] = value;

    setEmployeePayrollDetails(updated);
  };

  // SUBMIT
  const handleSubmit = async () => {

    const payload = {
      departments: selectedDepartments,
      employees: selectedEmployees,
      payrollDate:
        payrollData.payrollDate,
      payrollDetails:
        employeePayrollDetails,
    };

    console.log(payload);

    try {

      await axios.post(
        "http://localhost:3050/api/run-payroll",
        payload
      );

      alert("Payroll Run Successfully");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-black text-white p-6">

          <h1 className="text-3xl font-bold">
            Payroll Process
          </h1>

          <p className="mt-2 text-gray-300">
            Step {step} of 4
          </p>

          {/* STEP BAR */}
          <div className="flex gap-3 mt-5">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className={`h-2 flex-1 rounded-full
                ${
                  step >= item
                    ? "bg-green-400"
                    : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="p-8">

          {/* STEP 1 */}
          {step === 1 && (

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Select Departments
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {departments.map(
                  (item, index) => {

                    const department = item.fieldValue;

                    const checked = selectedDepartments.includes(
                        department
                      );

                    return (
                      <label
                        key={index}
                        className={`border rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition
                        ${
                          checked
                            ? "bg-indigo-50 border-indigo-500"
                            : "border-gray-200"
                        }`}
                      >

                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            handleDepartmentChange(
                              department
                            )
                          }
                          className="w-5 h-5"
                        />

                        <div>

                          <h3 className="font-bold text-lg">
                            {department}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Department Selection
                          </p>
                        </div>
                      </label>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (

            <div>

              <h2 className="text-2xl font-bold mb-2">
                Select Employees
              </h2>

              <p className="text-gray-500 mb-6">
                Selected Departments :
                {" "}
                {selectedDepartments.join(", ")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {employees.map(
                  (item, index) => {

                    const employeeName =
                      item.employeeName;

                    const checked =
                      selectedEmployees.includes(
                        employeeName
                      );

                    return (

                      <label
                        key={index}
                        className={`border rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition
                        ${
                          checked
                            ? "bg-green-50 border-green-500"
                            : "border-gray-200"
                        }`}
                      >

                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            handleEmployeeChange(
                              employeeName
                            )
                          }
                          className="w-5 h-5"
                        />

                        <div>

                          <h3 className="font-bold">
                            {employeeName}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {item.department}
                          </p>
                        </div>
                      </label>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Payroll Run
              </h2>

              <div className="bg-gray-50 rounded-3xl p-6 border">

                <div className="mb-6">

                  <label className="block font-medium mb-2">
                    Payroll Date
                  </label>

                  <input
                    type="date"
                    value={
                      payrollData.payrollDate
                    }
                    onChange={(e) =>
                      setPayrollData({
                        ...payrollData,
                        payrollDate:
                          e.target.value,
                      })
                    }
                    className="border rounded-xl px-4 py-3 w-72"
                  />
                </div>

                <div>

                  <h3 className="font-bold mb-3">
                    Selected Employees
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {selectedEmployees.map(
                      (emp, index) => (

                        <div
                          key={index}
                          className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full"
                        >
                          {emp}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <button
                  onClick={runPayroll}
                  type="button"
                  className="mt-8 bg-black text-white px-8 py-3 rounded-2xl"
                >
                  Run Payroll
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Attendance / Leave / OT
              </h2>

              <div className="space-y-5">

                {employeePayrollDetails.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="bg-gray-50 border rounded-3xl p-6"
                    >

                      <h3 className="text-xl font-bold mb-5">
                        {item.employee}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* ATTENDANCE */}
                        <div>

                          <label className="block mb-2 font-medium">
                            Attendance Days
                          </label>

                          <input
                            type="number"
                            value={
                              item.attendance
                            }
                            onChange={(e) =>
                              handlePayrollDetailChange(
                                index,
                                "attendance",
                                e.target.value
                              )
                            }
                            className="w-full border rounded-xl px-4 py-3"
                          />
                        </div>

                        {/* LEAVE */}
                        <div>

                          <label className="block mb-2 font-medium">
                            Leave Days
                          </label>

                          <input
                            type="number"
                            value={
                              item.leave
                            }
                            onChange={(e) =>
                              handlePayrollDetailChange(
                                index,
                                "leave",
                                e.target.value
                              )
                            }
                            className="w-full border rounded-xl px-4 py-3"
                          />
                        </div>

                        {/* OT */}
                        <div>

                          <label className="block mb-2 font-medium">
                            OT Hours
                          </label>

                          <input
                            type="number"
                            value={
                              item.otHours
                            }
                            onChange={(e) =>
                              handlePayrollDetailChange(
                                index,
                                "otHours",
                                e.target.value
                              )
                            }
                            className="w-full border rounded-xl px-4 py-3"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* FINAL SUBMIT */}
              <div className="mt-8 flex justify-end">

                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold"
                >
                  Final Submit Payroll
                </button>
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex justify-between mt-10">

            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl
              ${
                step === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gray-800 text-white"
              }`}
            >
              Previous
            </button>

            {step < 3 && (

              <button
                onClick={nextStep}
                className="bg-black text-white px-8 py-3 rounded-xl"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}