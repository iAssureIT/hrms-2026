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
  const [
    selectedDepartments,
    setSelectedDepartments,
  ] = useState([]);

  const [
    selectedEmployees,
    setSelectedEmployees,
  ] = useState([]);

  // PAYROLL DATA
  const [payrollData, setPayrollData] =
    useState({
      payrollDate: "",
    });

  // EMPLOYEE PAYROLL DETAILS
  const [
    employeePayrollDetails,
    setEmployeePayrollDetails,
  ] = useState([]);

  // FETCH DEPARTMENTS
  const fetchDepartments = async () => {

    try {

      const response = await axios.get(
        "http://localhost:3050/api/payroll/prdept"
      );
      console.log(response.data);
      setDepartments(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {

    try {

      const response = await axios.post(
        "http://localhost:3050/api/payroll/prdept/premp",
        {
          departments: selectedDepartments.map((item) => item.id),
        }
      );
      console.log(selectedDepartments);
      console.log("Employees by Departments:", response);
      setEmployees(response.data.data);

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

  // HANDLE DEPARTMENT
  //   const handleDepartmentChange = (
  //     department,id
  //   ) => {
  // //console.log("handleDepartmentChange:", department, id);
  //     setSelectedDepartments((prev) => {

  //       if (
  //         prev.includes(department)
  //       ) {

  //         return prev.filter(
  //           (item) =>
  //             item !== department
  //         );
  //       }

  //       return [...prev, department];
  //     });
  //   };

  const handleDepartmentChange = (
    department,
    id
  ) => {

    setSelectedDepartments((prev) => {

      const alreadyExists =
        prev.find(
          (item) => item.id === id
        );

      // REMOVE
      if (alreadyExists) {

        return prev.filter(
          (item) => item.id !== id
        );
      }

      // ADD
      return [
        ...prev,
        {
          id,
          department,
        },
      ];
    });
  };

  // HANDLE EMPLOYEE
  const handleEmployeeChange = (
    employee
  ) => {

    setSelectedEmployees((prev) => {

      if (prev.includes(employee)) {

        return prev.filter(
          (item) =>
            item !== employee
        );
      }

      return [...prev, employee];
    });
  };

  // NEXT
  const nextStep = () => {
    setStep((prev) => prev + 1);
    fetchEmployees();
  };

  // PREVIOUS
  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  // RUN PAYROLL
  const runPayroll = () => {

    const payrollEmployees =
      selectedEmployees.map(
        (emp) => ({
          employee: emp,
          attendance: "",
          leave: "",
          otHours: "",
        })
      );

    setEmployeePayrollDetails(
      payrollEmployees
    );

    nextStep();
  };

  // HANDLE DETAILS
  const handlePayrollDetailChange = (
    index,
    field,
    value
  ) => {

    const updated = [
      ...employeePayrollDetails,
    ];

    updated[index][field] = value;

    setEmployeePayrollDetails(
      updated
    );
  };

  // SUBMIT
  const handleSubmit = async () => {

    const payload = {
      // departments:
      //   selectedDepartments,
      departments: selectedDepartments.map(
        (item) => item.id
      ),
      employees:
        selectedEmployees,
      payrollDate:
        payrollData.payrollDate,
      payrollDetails:
        employeePayrollDetails,
    };

    try {

      await axios.post(
        "http://localhost:3050/api/run-payroll",
        payload
      );

      alert(
        "Payroll Run Successfully"
      );

    } catch (error) {
      console.log(error);
    }
  };

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        {/* PAGE HEADER */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>

              <h1 className="text-2xl font-semibold text-gray-800">
                Payroll Processing
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Execute monthly payroll process
              </p>

            </div>

            <div className="flex gap-3">

              {[1, 2, 3, 4].map(
                (item) => (

                  <div
                    key={item}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-medium
                    ${step >= item
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-500 border-gray-300"
                      }`}
                  >

                    {item}

                  </div>
                )
              )}

            </div>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* TOP BAR */}
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>

                <h2 className="text-lg font-semibold text-gray-800">

                  {step === 1 &&
                    "Department Selection"}

                  {step === 2 &&
                    "Employee Selection"}

                  {step === 3 &&
                    "Payroll Run"}

                  {step === 4 &&
                    "Attendance Details"}

                </h2>

              </div>

              <div className="text-sm text-gray-500">

                Step {step} of 4

              </div>

            </div>

          </div>

          {/* BODY */}
          <div className="p-6">

            {/* STEP 1 */}
            {step === 1 && (

              <div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl">

                  <table className="w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-4 py-3 text-left text-sm font-semibold border-b">
                          Select
                        </th>

                        <th className="px-4 py-3 text-left text-sm font-semibold border-b">
                          Department Name
                        </th>

                        <th className="px-4 py-3 text-left text-sm font-semibold border-b">
                          Status
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {departments.map(
                        (
                          item,
                          index
                        ) => {

                          const department =
                            item.fieldValue;

                          // const checked =
                          //   selectedDepartments.includes(
                          //     department
                          //   );
                          const checked =
                            selectedDepartments.some(
                              (dept) => dept.id === item._id
                            );

                          return (

                            <tr
                              key={index}
                              className="hover:bg-gray-50"
                            >

                              <td className="px-4 py-3 border-b">

                                <input
                                  type="checkbox"
                                  checked={
                                    checked
                                  }
                                  onChange={() =>
                                    handleDepartmentChange(
                                      department, item._id
                                    )
                                  }
                                />

                              </td>

                              <td className="px-4 py-3 border-b">

                                {
                                  department
                                }

                              </td>

                              <td className="px-4 py-3 border-b">

                                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">

                                  Active

                                </span>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (

              <div>

                <div className="mb-5">

                  <p className="text-sm text-gray-500">

                    Selected Departments :

                    {" "}

                    {/* {selectedDepartments.join(
                      ", "
                    )} */}
                    {
                      selectedDepartments
                        .map((item) => item.department)
                        .join(", ")
                    }

                  </p>

                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl">

                  <table className="w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-4 py-3 text-left text-sm font-semibold border-b">
                          Select
                        </th>

                        <th className="px-4 py-3 text-left text-sm font-semibold border-b">
                          Employee Name
                        </th>

                        <th className="px-4 py-3 text-left text-sm font-semibold border-b">
                          Department
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {employees.map(
                        (
                          item,
                          index
                        ) => {

                          const employeeName =
                            item.employeeName;

                          const checked =
                            selectedEmployees.includes(
                              employeeName
                            );

                          return (

                            <tr
                              key={index}
                              className="hover:bg-gray-50"
                            >

                              <td className="px-4 py-3 border-b">

                                <input
                                  type="checkbox"
                                  checked={
                                    checked
                                  }
                                  onChange={() =>
                                    handleEmployeeChange(
                                      employeeName
                                    )
                                  }
                                />

                              </td>

                              <td className="px-4 py-3 border-b">

                                {
                                  employeeName
                                }

                              </td>

                              <td className="px-4 py-3 border-b">

                                {
                                  item.department
                                }

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (

              <div>

                {/* FORM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

                  <div>

                    <label className="block text-sm font-medium mb-2">
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />

                  </div>

                </div>

                {/* SELECTED EMPLOYEES */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">

                  <div className="bg-gray-50 px-4 py-3 border-b">

                    <h3 className="font-semibold">
                      Selected Employees
                    </h3>

                  </div>

                  <div className="p-4">

                    <div className="flex flex-wrap gap-2">

                      {selectedEmployees.map(
                        (
                          emp,
                          index
                        ) => (

                          <div
                            key={index}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm"
                          >

                            {emp}

                          </div>
                        )
                      )}

                    </div>

                  </div>

                </div>

                <button
                  onClick={runPayroll}
                  type="button"
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Run Payroll
                </button>

              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (

              <div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl">

                  <table className="w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-4 py-3 text-left border-b">
                          Employee
                        </th>

                        <th className="px-4 py-3 text-left border-b">
                          Attendance
                        </th>

                        <th className="px-4 py-3 text-left border-b">
                          Leave
                        </th>

                        <th className="px-4 py-3 text-left border-b">
                          OT Hours
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {employeePayrollDetails.map(
                        (
                          item,
                          index
                        ) => (

                          <tr
                            key={index}
                            className="hover:bg-gray-50"
                          >

                            <td className="px-4 py-3 border-b font-medium">

                              {
                                item.employee
                              }

                            </td>

                            <td className="px-4 py-3 border-b">

                              <input
                                type="number"
                                value={
                                  item.attendance
                                }
                                onChange={(
                                  e
                                ) =>
                                  handlePayrollDetailChange(
                                    index,
                                    "attendance",
                                    e.target
                                      .value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                              />

                            </td>

                            <td className="px-4 py-3 border-b">

                              <input
                                type="number"
                                value={
                                  item.leave
                                }
                                onChange={(
                                  e
                                ) =>
                                  handlePayrollDetailChange(
                                    index,
                                    "leave",
                                    e.target
                                      .value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                              />

                            </td>

                            <td className="px-4 py-3 border-b">

                              <input
                                type="number"
                                value={
                                  item.otHours
                                }
                                onChange={(
                                  e
                                ) =>
                                  handlePayrollDetailChange(
                                    index,
                                    "otHours",
                                    e.target
                                      .value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                              />

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {/* FINAL BUTTON */}
                <div className="mt-6 flex justify-end">

                  <button
                    onClick={
                      handleSubmit
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
                  >
                    Final Submit Payroll
                  </button>

                </div>

              </div>
            )}

          </div>

          {/* FOOTER BUTTONS */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between">

            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-5 py-2 rounded-lg border
              ${step === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
                }`}
            >
              Previous
            </button>

            {step < 3 && (

              <button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
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