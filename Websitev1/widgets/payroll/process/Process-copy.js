"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Loader2,
  Check,
} from "lucide-react";

export default function PayrollProcessPage() {

  // STEP
  const [step, setStep] =
    useState(1);

  // STEP LIST
  const stepList = [
    "Departments",
    "Employees",
    "Attendance",
    "Run Payroll",
    "Salary Slips",
  ];

  // DATA
  const [departments, setDepartments] =
    useState([]);

  const [employees, setEmployees] =
    useState([]);

  // SELECTED
  const [
    selectedDepartments,
    setSelectedDepartments,
  ] = useState([]);

  const [
    selectedEmployees,
    setSelectedEmployees,
  ] = useState([]);

  // ATTENDANCE
  const [
    employeeAttendance,
    setEmployeeAttendance,
  ] = useState([]);

  // PAYROLL
  const [payrollMonth, setPayrollMonth] =
    useState("");

  const [payrollDate, setPayrollDate] =
    useState("");

  // PROCESS
  const [isProcessing, setIsProcessing] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [
    currentEmployee,
    setCurrentEmployee,
  ] = useState("");

  const [
    currentEmployeeID,
    setCurrentEmployeeID,
  ] = useState("");

  // GENERATED SLIPS
  const [
    generatedSlips,
    setGeneratedSlips,
  ] = useState([]);

  // FETCH DEPARTMENTS
  useEffect(() => {

    const fetchDepartments =
      async () => {

        try {

          const response =
            await axios.get(
              "http://localhost:3050/api/payroll/prdept"
            );

          setDepartments(
            response.data || []
          );

        } catch (error) {

          console.log(error);

        }
      };

    fetchDepartments();

  }, []);

  // FETCH EMPLOYEES
  useEffect(() => {

    const fetchEmployees =
      async () => {

        try {

          const response =
            await axios.post(
              "http://localhost:3050/api/payroll/prdept/premp",
              {
                departments:
                  selectedDepartments.map(
                    (item) => item.id
                  ),
              }
            );

          setEmployees(
            response.data.data || []
          );

        } catch (error) {

          console.log(error);

        }
      };

    if (
      selectedDepartments.length > 0
    ) {

      fetchEmployees();

    } else {

      setEmployees([]);
    }

  }, [selectedDepartments]);

  // SELECT DEPARTMENT
  const handleDepartmentChange = (
    item
  ) => {

    const exists =
      selectedDepartments.find(
        (dept) =>
          dept.id === item._id
      );

    if (exists) {

      setSelectedDepartments(
        selectedDepartments.filter(
          (dept) =>
            dept.id !== item._id
        )
      );

    } else {

      setSelectedDepartments([
        ...selectedDepartments,
        {
          id: item._id,
          department:
            item.fieldValue,
        },
      ]);
    }
  };

  // SELECT EMPLOYEE
  const handleEmployeeChange = (
    employee
  ) => {

    const exists =
      selectedEmployees.find(
        (emp) =>
          emp._id === employee._id
      );

    if (exists) {

      setSelectedEmployees(
        selectedEmployees.filter(
          (emp) =>
            emp._id !==
            employee._id
        )
      );

    } else {

      setSelectedEmployees([
        ...selectedEmployees,
        employee,
      ]);
    }
  };

  // NEXT STEP
  const nextStep = () => {

    if (step === 2) {

      const attendanceData =
        selectedEmployees.map(
          (emp) => ({
            employeeId:
              emp._id,

            employeeID:
              emp.employeeID ||
              emp.employeeId ||
              emp.empId,

            employeeName:
              emp.employeeName,

            department:
              emp.departmentName,

            attendance: 28,

            leave: 2,

            otHours: 10,
          })
        );

      setEmployeeAttendance(
        attendanceData
      );
    }

    setStep(step + 1);
  };

  // PREVIOUS STEP
  const prevStep = () => {

    setStep(step - 1);

  };

  // ATTENDANCE CHANGE
  const handleAttendanceChange = (
    index,
    field,
    value
  ) => {

    const updated = [
      ...employeeAttendance,
    ];

    updated[index][field] =
      value;

    setEmployeeAttendance(
      updated
    );
  };

  // GROUP EMPLOYEES
  const groupedEmployees =
    employees.reduce(
      (acc, emp) => {

        const dept =
          emp.departmentName ||
          "Others";

        if (!acc[dept]) {

          acc[dept] = [];
        }

        acc[dept].push(emp);

        return acc;

      },
      {}
    );

  // FORMAT MONTH
  const formatSalaryMonth = (
    monthValue
  ) => {

    if (!monthValue)
      return "";

    const date =
      new Date(
        monthValue
      );

    return date.toLocaleString(
      "default",
      {
        month: "short",
        year: "numeric",
      }
    );
  };

  // RUN PAYROLL
  const handleRunPayroll =
    async () => {

      try {

        setIsProcessing(true);

        setProgress(0);

        setGeneratedSlips([]);

        for (
          let i = 0;
          i <
          employeeAttendance.length;
          i++
        ) {

          try {

            const emp =
              employeeAttendance[i];

            setCurrentEmployee(
              emp.employeeName
            );

            setCurrentEmployeeID(
              emp.employeeID
            );

            // FETCH SALARY
            const salaryResponse =
              await axios.get(
                `http://localhost:3050/api/employee-salary/${emp.employeeID}`
              );

            // MONTHLY DATA
            const monthlyData = {
              ...salaryResponse.data,

              salaryData:
                salaryResponse.data.salaryData.map(
                  (item) => ({
                    ...item,

                    amount: Math.round(
                      Number(
                        item.amount
                      ) / 12
                    ),
                  })
                ),
            };

            // EARNINGS
            const totalEarnings =
              monthlyData.salaryData
                .filter(
                  (item) =>
                    item.amount > 0
                )
                .reduce(
                  (
                    acc,
                    item
                  ) =>
                    acc +
                    item.amount,
                  0
                );

            // DEDUCTIONS
            const totalDeductions =
              monthlyData.salaryData
                .filter(
                  (item) =>
                    item.amount < 0
                )
                .reduce(
                  (
                    acc,
                    item
                  ) =>
                    acc +
                    Math.abs(
                      item.amount
                    ),
                  0
                );

            // NET SALARY
            const netSalary =
              totalEarnings -
              totalDeductions;

            // SAVE
            await axios.post(
              "http://localhost:3050/api/salary-slips",
              {
                employeeId:
                  emp.employeeID,

                salaryMonth:
                  formatSalaryMonth(
                    payrollMonth
                  ),

                salaryData:
                  monthlyData.salaryData,

                totalEarnings,

                totalDeductions,

                netSalary,
              }
            );

            // SUCCESS
            setGeneratedSlips(
              (prev) => [
                ...prev,
                {
                  employee:
                    emp.employeeName,

                  employeeID:
                    emp.employeeID,

                  department:
                    emp.department,

                  netSalary,

                  status:
                    "success",
                },
              ]
            );

          } catch (error) {

            console.log(error);

            // FAILED
            setGeneratedSlips(
              (prev) => [
                ...prev,
                {
                  employee:
                    employeeAttendance[i]
                      .employeeName,

                  employeeID:
                    employeeAttendance[i]
                      .employeeID,

                  department:
                    employeeAttendance[i]
                      .department,

                  netSalary: 0,

                  status:
                    "failed",
                },
              ]
            );
          }

          // PROGRESS
          const progressValue =
            Math.round(
              ((i + 1) /
                employeeAttendance.length) *
                100
            );

          setProgress(
            progressValue
          );
        }

        setIsProcessing(false);

        setStep(5);

      } catch (error) {

        console.log(error);

        setIsProcessing(false);
      }
    };

  return (

    <div className="min-h-screen bg-[#f5f7fb] p-4">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white border border-gray-200 rounded-md p-5 mb-4">

          <h1 className="text-2xl font-semibold text-gray-800">
            Payroll Process
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Process employee payroll
          </p>

        </div>

        {/* STEP BOXES */}
        <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

            {stepList.map(
              (
                item,
                index
              ) => {

                const stepNumber =
                  index + 1;

                const completed =
                  step > stepNumber;

                const active =
                  step === stepNumber;

                return (

                  <div
                    key={index}
                    className={`border rounded-md p-3 flex items-center gap-3
                    ${completed
                        ? "bg-blue-600 border-blue-600 text-white"
                        : active
                          ? "bg-blue-50 border-blue-600"
                          : "bg-white border-gray-200"
                      }`}
                  >

                    <div
                      className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-semibold
                      ${completed
                          ? "bg-white text-blue-600"
                          : active
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                    >

                      {completed ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        stepNumber
                      )}

                    </div>

                    <div>

                      <p className="text-xs opacity-70">
                        Step {stepNumber}
                      </p>

                      <h3 className="text-sm font-medium">
                        {item}
                      </h3>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* MAIN */}
        <div className="bg-white border border-gray-200 rounded-md">

          <div className="p-5">

          {/* STEP 1 */}
          {step === 1 && (
            <div>

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-sm font-medium">
                  Select Departments
                </h2>

                <button
                  onClick={() => {

                    if (
                      selectedDepartments.length ===
                      departments.length
                    ) {

                      setSelectedDepartments([]);

                    } else {

                      setSelectedDepartments(
                        departments.map(
                          (item) => ({
                            id: item._id,
                            department:
                              item.fieldValue,
                          })
                        )
                      );
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  {
                    selectedDepartments.length ===
                    departments.length
                      ? "Unselect All"
                      : "Select All"
                  }
                </button>

              </div>

          {/* SEARCH + SUMMARY */}
          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-3">

              <input
                type="text"
                placeholder="Search Department"
                className="border rounded-md px-3 py-2 text-sm w-[260px]"
              />

              <p className="text-sm text-blue-600 font-medium">

                Selected :
                {" "}
                {
                  selectedDepartments.length
                }

              </p>

            </div>

            <div className="text-sm text-gray-500">

              Total Departments :
              {" "}
              {
                departments.length
              }

            </div>

          </div>

              <div className="grid grid-cols-3 gap-3">
                {departments.map(
                  (
                    item,
                    index
                  ) => {

                    const checked =
                      selectedDepartments.find(
                        (dept) =>
                          dept.id === item._id
                      );

                    return (

<div
  key={index}
  onClick={() =>
    handleDepartmentChange(
      item
    )
  }
  className={`border rounded-md p-4 cursor-pointer transition hover:border-blue-500
  ${
    checked
      ? "border-blue-600 bg-blue-50"
      : "bg-white"
  }`}
>

  {/* TOP */}
  <div className="flex items-start justify-between">

    <div>

      <h3 className="text-sm font-semibold">
        {
          item.fieldValue
        }
      </h3>

      <p className="text-xs text-gray-500 mt-1">

        Employee Count :
        {" "}
        {
          employees.filter(
            (emp) =>
              emp.departmentName ===
              item.fieldValue
          ).length
        }

      </p>

    </div>

    <input
      type="checkbox"
      checked={checked}
      readOnly
    />

  </div>

  {/* BODY */}
  <div className="mt-4 space-y-2">

    {/* PAYROLL ESTIMATE */}
    <div className="flex items-center justify-between text-xs">

      <span className="text-gray-500">
        Estimated Payroll
      </span>

      <span className="font-medium text-green-600">

        ₹
        {
          (
            employees.filter(
              (emp) =>
                emp.departmentName ===
                item.fieldValue
            ).length * 45000
          ).toLocaleString()
        }

      </span>

    </div>

    {/* ATTENDANCE */}
    <div className="flex items-center justify-between text-xs">

      <span className="text-gray-500">
        Attendance Status
      </span>

      <span className="text-blue-600 font-medium">
        92%
      </span>

    </div>

    {/* PAYROLL STATUS */}
    <div className="flex items-center justify-between text-xs">

      <span className="text-gray-500">
        Payroll Status
      </span>

      <span className="bg-green-100 text-green-700 px-2 py-[2px] rounded">

        Ready

      </span>

    </div>

  </div>

</div>
                    );
                  }
                )}

              </div>

            </div>
          )}

            {/* STEP 2 */}
            {step === 2 && (

              <div>

                <div className="flex items-center justify-between mb-5">

                  <h2 className="text-sm font-medium">
                    Select Employees
                  </h2>

                  <button
                    onClick={() => {

                      if (
                        selectedEmployees.length ===
                        employees.length
                      ) {

                        setSelectedEmployees(
                          []
                        );

                      } else {

                        setSelectedEmployees(
                          employees
                        );
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Select All
                  </button>

                </div>

                <div className="space-y-5">

                  {Object.keys(
                    groupedEmployees
                  ).map((dept) => (

                    <div
                      key={dept}
                      className="border border-gray-200 rounded-md overflow-hidden"
                    >

                      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">

                        <h3 className="text-sm font-semibold text-gray-700">
                          {dept}
                        </h3>

                      </div>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">

                        {groupedEmployees[
                          dept
                        ].map(
                          (
                            item,
                            index
                          ) => {

                            const checked =
                              selectedEmployees.find(
                                (
                                  emp
                                ) =>
                                  emp._id ===
                                  item._id
                              );

                            return (

                              <div
                                key={index}
                                onClick={() =>
                                  handleEmployeeChange(
                                    item
                                  )
                                }
                                className={`border rounded-md p-3 cursor-pointer
                                ${checked
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200"
                                  }`}
                              >

                                <div className="flex items-start gap-3">

                                  <input
                                    type="checkbox"
                                    checked={
                                      checked
                                    }
                                    readOnly
                                  />

                                  <div>

                                    <h4 className="text-sm font-medium text-gray-700">
                                      {
                                        item.employeeName
                                      }
                                    </h4>

                                    <p className="text-xs text-gray-500 mt-1">
                                      Employee ID :
                                      {" "}
                                      {
                                        item.employeeID ||
                                        item.employeeId ||
                                        item.empId
                                      }
                                    </p>

                                  </div>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>
                  ))}

                </div>

              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (

              <div className="space-y-3">

                {employeeAttendance.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={index}
                      className="border border-gray-200 rounded-md p-4"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div>

                          <h3 className="text-sm font-medium text-gray-700">
                            {
                              item.employeeName
                            }
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            Employee ID :
                            {" "}
                            {
                              item.employeeID
                            }
                          </p>

                        </div>

                        <div className="grid grid-cols-3 gap-3 w-full lg:w-[420px]">

                          <input
                            type="number"
                            value={
                              item.attendance
                            }
                            onChange={(e) =>
                              handleAttendanceChange(
                                index,
                                "attendance",
                                e.target.value
                              )
                            }
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
                            placeholder="Attendance"
                          />

                          <input
                            type="number"
                            value={
                              item.leave
                            }
                            onChange={(e) =>
                              handleAttendanceChange(
                                index,
                                "leave",
                                e.target.value
                              )
                            }
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
                            placeholder="Leave"
                          />

                          <input
                            type="number"
                            value={
                              item.otHours
                            }
                            onChange={(e) =>
                              handleAttendanceChange(
                                index,
                                "otHours",
                                e.target.value
                              )
                            }
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
                            placeholder="OT"
                          />

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (

              <div>

                {!isProcessing ? (

                  <div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                      <input
                        type="month"
                        value={
                          payrollMonth
                        }
                        onChange={(e) =>
                          setPayrollMonth(
                            e.target.value
                          )
                        }
                        className="border border-gray-200 rounded-md px-4 py-3 text-sm"
                      />

                      <input
                        type="date"
                        value={
                          payrollDate
                        }
                        onChange={(e) =>
                          setPayrollDate(
                            e.target.value
                          )
                        }
                        className="border border-gray-200 rounded-md px-4 py-3 text-sm"
                      />

                    </div>

                    <div className="flex justify-end">

                      <button
                        onClick={
                          handleRunPayroll
                        }
                        className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm"
                      >
                        Run Payroll
                      </button>

                    </div>

                  </div>

                ) : (

                  <div>

                    <div className="mb-6">

                      <div className="flex justify-between mb-2">

                        <span className="text-sm">
                          Processing Payroll
                        </span>

                        <span className="text-sm font-medium text-blue-600">
                          {progress}%
                        </span>

                      </div>

                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-blue-600"
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    <div className="border border-gray-200 rounded-md p-4 flex items-center gap-3">

                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />

                      <div>

                        <p className="text-xs text-gray-500">
                          Processing Employee
                        </p>

                        <h3 className="text-sm font-medium text-gray-700">
                          {
                            currentEmployee
                          }
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          Employee ID :
                          {" "}
                          {
                            currentEmployeeID
                          }
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (

              <div>

                {/* SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

                  <div className="border border-gray-200 rounded-md p-4 bg-blue-50">

                    <p className="text-xs text-gray-500">
                      Total Employees
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-800 mt-1">

                      {
                        generatedSlips.length
                      }

                    </h2>

                  </div>

                  <div className="border border-gray-200 rounded-md p-4 bg-green-50">

                    <p className="text-xs text-gray-500">
                      Total Payroll Amount
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-800 mt-1">

                      ₹
                      {
                        generatedSlips.reduce(
                          (
                            acc,
                            item
                          ) =>
                            acc +
                            Number(
                              item.netSalary || 0
                            ),
                          0
                        ).toLocaleString()
                      }

                    </h2>

                  </div>

                </div>

                {/* TABLE */}
                <div className="border border-gray-200 rounded-md overflow-hidden">

                  {/* TABLE HEADER */}
                  <div className="grid grid-cols-5 bg-gray-100 border-b border-gray-200">

                    <div className="p-3 text-xs font-semibold text-gray-700">
                      Employee Name
                    </div>

                    <div className="p-3 text-xs font-semibold text-gray-700">
                      Employee ID
                    </div>

                    <div className="p-3 text-xs font-semibold text-gray-700">
                      Salary
                    </div>

                    <div className="p-3 text-xs font-semibold text-gray-700">
                      Payroll Status
                    </div>

                    <div className="p-3 text-xs font-semibold text-gray-700">
                      Payslip
                    </div>

                  </div>

                  {/* TABLE BODY */}
                  {generatedSlips.length > 0 ? (

                    generatedSlips.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          key={index}
                          className="grid grid-cols-5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                        >

                          <div className="p-3 text-sm text-gray-700">
                            {item.employee}
                          </div>

                          <div className="p-3 text-sm text-gray-700">
                            {item.employeeID}
                          </div>

                          <div className="p-3 text-sm font-medium text-gray-700">

                            ₹
                            {
                              Number(
                                item.netSalary || 0
                              ).toLocaleString()
                            }

                          </div>

                          <div className="p-3">

                            <span
                              className={`text-xs px-2 py-1 rounded
                              ${item.status === "success"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                                }`}
                            >

                              {item.status}

                            </span>

                          </div>

                          <div className="p-3">

                            {item.status === "success" ? (

                              <button
                                onClick={() =>
                                  window.open(
                                    `/payroll/salary/salaryslip?empId=${item.employeeID}&Salmonth=${formatSalaryMonth(payrollMonth)}`,
                                    "_blank"
                                  )
                                }
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View Slip
                              </button>

                            ) : (

                              <span className="text-xs text-gray-400">
                                Not Available
                              </span>

                            )}

                          </div>

                        </div>
                      )
                    )

                  ) : (

                    <div className="p-6 text-center text-sm text-gray-500">
                      No payroll records found
                    </div>

                  )}

                </div>

              </div>
            )}

          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 flex justify-between">

            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-5 py-2 rounded-md text-sm border
              ${step === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700"
                }`}
            >
              Previous
            </button>

            {step < 4 && (

              <button
                onClick={nextStep}
                className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm"
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