"use client";

import { useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function SalarySlipPage({empId}) {

  //const [employeeId, setEmployeeId] = useState("");
  const [salaryMonth, setSalaryMonth] = useState("");
  const [salaryData, setSalaryData] = useState(null);
  const searchParams = useSearchParams();
  const employeeId = empId;
  const router = useRouter();  

  // SEARCH EMPLOYEE SALARY
  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3050/api/employee-salary/${employeeId}`
      );

      // MONTHLY CONVERSION
      const monthlyData = {
        ...res.data,

        salaryData: res.data.salaryData.map(
          (item) => ({
            ...item,
            amount: Math.round(
              Number(item.amount) / 12
            ),
          })
        ),
      };

      setSalaryData(monthlyData);

    } catch (error) {
      console.log(error);
      alert("Employee salary not found");
      setSalaryData(null);
    }
  };

  // TOTAL EARNINGS
  const totalEarnings =
    salaryData?.salaryData
      ?.filter(
        (item) =>
          item.amount > 0 &&
          item.components.toLowerCase() !== "ctc" &&
          item.components.toLowerCase() !== "total"
      )
      .reduce((acc, item) => acc + item.amount, 0) || 0;

  // TOTAL DEDUCTIONS
  const totalDeductions =
    salaryData?.salaryData
      ?.filter((item) => item.amount < 0)
      .reduce(
        (acc, item) =>
          acc + Math.abs(item.amount),
        0
      ) || 0;

  // NET SALARY
  const netSalary =
    totalEarnings - totalDeductions;

  // SAVE SLIP IN MONGODB
  const handleSaveSlip = async () => {
    try {

      const payload = {
        employeeId,
        salaryMonth,
        salaryData: salaryData.salaryData,
        totalEarnings,
        totalDeductions,
        netSalary,
      };

      await axios.post(
        "http://localhost:3050/api/salary-slips",
        payload
      );

      alert("Salary slip saved successfully");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6">

      {/* SEARCH SECTION */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex flex-wrap gap-4 items-end rounded-xl">

          {/* EMPLOYEE ID */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Employee ID
            </label>

            <input
              type="text"
              defaultValue={employeeId}
              // onChange={(e) =>
              //   //setEmployeeId(e.target.value)
              // }
              placeholder="Enter employee id"
              className="border rounded-lg px-4 py-2 w-56 border-gray-300 outline-none"
            />
          </div>

          {/* MONTH */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Salary Month
            </label>

            <input
              type="month"
              value={salaryMonth}
              onChange={(e) =>
                setSalaryMonth(e.target.value)
              }
              className="border rounded-lg px-4 py-2 border-gray-300 outline-none"
            />
          </div>

          {/* GENERATE */}
          <button
            onClick={handleSearch}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Generate Slip
          </button>

          {/* SAVE */}
          {salaryData && (
            <button
              onClick={handleSaveSlip}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Save Slip
            </button>
          )}
        </div>
      </div>

      {/* SALARY SLIP */}
      {salaryData && (
        <div className="mt-8 bg-white p-8 shadow border rounded-xl mx-auto">

          {/* HEADER */}
          <div className="text-center border-b pb-4">
            <h1 className="text-4xl font-bold">
              Company Name
            </h1>

            <h2 className="text-2xl mt-2">
              Salary Slip for {salaryMonth}
            </h2>
          </div>

          {/* DETAILS */}
          <div className="grid grid-cols-2 border border-t-0">

            <div className="border-r p-3">
              <p className="py-2 border-b">
                <span className="font-semibold">
                  Employee ID:
                </span>{" "}
                {salaryData.employeeId}
              </p>

              <p className="py-2">
                <span className="font-semibold">
                  Generated Date:
                </span>{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="p-3">
              <p className="py-2">
                <span className="font-semibold">
                  Salary Month:
                </span>{" "}
                {salaryMonth}
              </p>
            </div>
          </div>

          {/* TABLE */}
          <div className="grid grid-cols-2 border border-t-0">

            {/* EARNINGS */}
            <div className="border-r">

              <div className="grid grid-cols-2 bg-gray-100 font-bold border-b">
                <div className="p-3 border-r">
                  Earnings
                </div>

                <div className="p-3">
                  Amount
                </div>
              </div>

              {salaryData.salaryData
                .filter(
                  (item) =>
                    item.amount > 0 &&
                    item.components.toLowerCase() !==
                      "ctc" &&
                    item.components.toLowerCase() !==
                      "total"
                )
                .map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 border-b"
                  >
                    <div className="p-3 border-r">
                      {index + 1}.{" "}
                      {item.components}
                    </div>

                    <div className="p-3">
                      ₹{" "}
                      {item.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>

            {/* DEDUCTIONS */}
            <div>

              <div className="grid grid-cols-2 bg-gray-100 font-bold border-b">
                <div className="p-3 border-r">
                  Deductions
                </div>

                <div className="p-3">
                  Amount
                </div>
              </div>

              {salaryData.salaryData
                .filter(
                  (item) => item.amount < 0
                )
                .map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 border-b"
                  >
                    <div className="p-3 border-r">
                      {index + 1}.{" "}
                      {item.components}
                    </div>

                    <div className="p-3">
                      ₹{" "}
                      {Math.abs(
                        item.amount
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}

            </div>
          </div>

{/* COMMON TOTAL ROW */}
<div className="grid grid-cols-2 border border-t-0 mt-1">

  {/* GROSS SALARY */}
  <div className="grid grid-cols-2 font-bold bg-gray-100 border-r">
    <div className="p-3 border-r">
      Gross Salary
    </div>

    <div className="p-3">
      ₹ {totalEarnings.toLocaleString()}
    </div>
  </div>

  {/* TOTAL DEDUCTION */}
  <div className="grid grid-cols-2 font-bold bg-gray-100">
    <div className="p-3 border-r">
      Total Deduction
    </div>

    <div className="p-3">
      ₹ {totalDeductions.toLocaleString()}
    </div>
  </div>
</div>


          {/* NET */}
          <div className="border border-t-0">
            <div className="grid grid-cols-2 font-bold text-xl">
              <div className="p-4 border-r">
                Net Salary
              </div>

              <div className="p-4">
                ₹ {netSalary.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}