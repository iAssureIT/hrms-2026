"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function EmployeeSalaryForm({
  empId,
}) {

  const [ctc, setCtc] = useState("");
  const [components, setComponents] =
    useState([]);
  const [salaryStructure, setSalaryStructure] =
    useState([]);

  const employeeId = empId;

  const router = useRouter();

  // FETCH COMPONENTS
  const fetchComponents = async () => {

    try {

      const res = await axios.get(
        "http://localhost:3050/api/salary-components"
      );

      const sorted = res.data.sort(
        (a, b) =>
          Number(a.sequence) -
          Number(b.sequence)
      );

      setComponents(sorted);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  // CALCULATE SALARY
  const calculateSalary = (value) => {

    const ctcValue = Number(value);

    if (!ctcValue) {
      setSalaryStructure([]);
      return;
    }

    const sortedComponents = [...components].sort(
      (a, b) =>
        Number(a.sequence) -
        Number(b.sequence)
    );

    const calculatedMap = {};

    const calculatedData =
      sortedComponents.map((item) => {

        let amount = 0;

        const byValue = Number(
          item.byValue
        );

        const componentKey =
          item.component
            ?.trim()
            .toLowerCase();

        const basedOnKey =
          item.basedOn
            ?.trim()
            .toLowerCase();

        // FIXED
        if (item.formula === "fixed") {
          amount = byValue;
        }

        // PERCENTAGE
        else if (
          item.formula === "percentage"
        ) {

          if (basedOnKey) {

            const baseAmount =
              calculatedMap[
                basedOnKey
              ] || 0;

            if (basedOnKey === "ctc") {

              amount =
                (ctcValue * byValue) /
                100;

            } else {

              amount =
                (baseAmount * byValue) /
                100;
            }

          } else {

            amount =
              (ctcValue * byValue) /
              100;
          }
        }

        // DEDUCTION
        if (
          item.type
            ?.trim()
            .toLowerCase() ===
          "deduction"
        ) {
          amount = -amount;
        }

        calculatedMap[componentKey] =
          amount;

        return {
          component: item.component,
          type: item.type,
          amount: Math.round(amount),
        };
      });

    setSalaryStructure(calculatedData);
  };

  // HANDLE CTC
  const handleCtcChange = (e) => {

    const value = e.target.value;

    setCtc(value);

    calculateSalary(value);
  };

  // GROUP BY TYPE
  const groupedData =
    salaryStructure.reduce(
      (acc, item) => {

        const type =
          item.type?.toLowerCase() ||
          "others";

        if (!acc[type]) {
          acc[type] = [];
        }

        acc[type].push(item);

        return acc;
      },
      {}
    );

  // TOTALS
  const earningsTotal =
    salaryStructure
      .filter(
        (item) =>
          item.type
            ?.toLowerCase() !==
          "deduction"
      )
      .reduce(
        (acc, item) =>
          acc + item.amount,
        0
      );

  const deductionTotal =
    salaryStructure
      .filter(
        (item) =>
          item.type
            ?.toLowerCase() ===
          "deduction"
      )
      .reduce(
        (acc, item) =>
          acc + Math.abs(item.amount),
        0
      );

  const grandTotal =
    earningsTotal - deductionTotal;

  // SAVE
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const payload = {
        employeeId,
        salaryData:
          salaryStructure.map(
            (item) => ({
              components:
                item.component,
              amount: item.amount,
            })
          ),
      };

      await axios.post(
        "http://localhost:3050/api/employee-salary",
        payload
      );

      router.push(
        `/admin/payroll/salary/salaryslip?empId=${employeeId}`
      );

    } catch (error) {
      console.log(error);
    }
  };

  return (

    <div className="min-h-screen bg-gray-100 py-6 px-4">

      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto bg-white rounded-2xl shadow border border-gray-300 overflow-hidden"
      >

        {/* HEADER */}
        <div className="border-b border-gray-300 px-6 py-4 bg-gray-50">

          <h1 className="text-2xl font-semibold text-gray-800">
            Salary Structure
          </h1>

        </div>

        {/* FORM SECTION */}
        <div className="p-6 border-b border-gray-300">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* EMPLOYEE ID */}
            <div>

              <label className="block text-sm font-medium mb-2">
                Employee ID
              </label>

              <input
                type="text"
                value={employeeId}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 outline-none"
              />

            </div>

            {/* CTC */}
            <div>

              <label className="block text-sm font-medium mb-2">
                Annual CTC
              </label>

              <input
                type="number"
                value={ctc}
                onChange={
                  handleCtcChange
                }
                placeholder="Enter Annual CTC"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
              />

            </div>

            {/* SAVE BUTTON */}
            <div className="flex items-end">

              <button
                type="submit"
                className="bg-[#3c8dbc] text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Salary
              </button>

            </div>

          </div>

        </div>

        {/* SALARY STRUCTURE */}
        {salaryStructure.length > 0 && (

          <div className="p-6">

            {/* SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

              <div className="border border-gray-300 rounded-xl p-4 bg-white">

                <p className="text-sm text-gray-500">
                  Annual CTC
                </p>

                <h2 className="text-2xl font-semibold mt-2">
                  ₹{" "}
                  {Number(
                    ctc
                  ).toLocaleString()}
                </h2>

              </div>

              <div className="border border-gray-300 rounded-xl p-4 bg-green-50">

                <p className="text-sm text-gray-500">
                  Total Earnings
                </p>

                <h2 className="text-2xl font-semibold mt-2 text-green-700">
                  ₹{" "}
                  {earningsTotal.toLocaleString()}
                </h2>

              </div>

              <div className="border border-gray-300 rounded-xl p-4 bg-red-50">

                <p className="text-sm text-gray-500">
                  Total Deductions
                </p>

                <h2 className="text-2xl font-semibold mt-2 text-red-600">
                  ₹{" "}
                  {deductionTotal.toLocaleString()}
                </h2>

              </div>

            </div>

            {/* GROUPED TABLES */}
            <div className="space-y-8">

              {Object.entries(groupedData).map(
                ([type, items]) => {

                  const typeTotal =
                    items.reduce(
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

                  const isDeduction =
                    type ===
                    "deduction";

                  return (

                    <div
                      key={type}
                      className="border border-gray-300 rounded-2xl overflow-hidden"
                    >

                      {/* GROUP HEADER */}
                      <div
                        className={`px-5 py-4 flex justify-between items-center
                        ${
                          isDeduction
                            ? "bg-red-50"
                            : "bg-green-50"
                        }`}
                      >

                        <h2 className="text-lg font-semibold capitalize">

                          {type}

                        </h2>

                        <h3
                          className={`font-semibold
                          ${
                            isDeduction
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >

                          Total :
                          ₹{" "}

                          {typeTotal.toLocaleString()}

                        </h3>

                      </div>

                      {/* TABLE */}
                      <div className="overflow-x-auto">

                        <table className="w-full border-collapse">

                          <thead className="bg-gray-100">

                            <tr>

                              <th className="border-b border-gray-300 px-4 py-3 text-left">
                                Component
                              </th>

                              <th className="border-b border-gray-300 px-4 py-3 text-right">
                                Monthly
                              </th>

                              <th className="border-b border-gray-300 px-4 py-3 text-right">
                                Annual
                              </th>

                            </tr>

                          </thead>

                          <tbody>

                            {items.map(
                              (
                                item,
                                index
                              ) => (

                                <tr
                                  key={index}
                                  className="hover:bg-gray-50"
                                >

                                  {/* COMPONENT */}
                                  <td className="border-b border-gray-200 px-4 py-3">

                                    {
                                      item.component
                                    }

                                  </td>

                                  {/* MONTHLY */}
                                  <td className="border-b border-gray-200 px-4 py-3 text-right">

                                    ₹{" "}

                                    {Math.abs(
                                      Math.round(
                                        item.amount /
                                          12
                                      )
                                    ).toLocaleString()}

                                  </td>

                                  {/* ANNUAL */}
                                  <td
                                    className={`border-b border-gray-200 px-4 py-3 text-right font-medium
                                    ${
                                      item.amount <
                                      0
                                        ? "text-red-600"
                                        : "text-green-700"
                                    }`}
                                  >

                                    ₹{" "}

                                    {Math.abs(
                                      item.amount
                                    ).toLocaleString()}

                                  </td>

                                </tr>
                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* GRAND TOTAL */}
            <div className="mt-8 border border-gray-300 rounded-2xl overflow-hidden">

              <div className="bg-[#3c8dbc] text-white px-6 py-4">

                <h2 className="text-xl font-semibold">
                  Net Salary Summary
                </h2>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">

                <div className="p-6 border-b md:border-b-0 md:border-r border-gray-300">

                  <p className="text-sm text-gray-500">
                    Annual Net Salary
                  </p>

                  <h1 className="text-3xl font-bold text-blue-700 mt-2">

                    ₹{" "}

                    {grandTotal.toLocaleString()}

                  </h1>

                </div>

                <div className="p-6">

                  <p className="text-sm text-gray-500">
                    Monthly Net Salary
                  </p>

                  <h1 className="text-3xl font-bold text-green-700 mt-2">

                    ₹{" "}

                    {Math.round(
                      grandTotal / 12
                    ).toLocaleString()}

                  </h1>

                </div>

              </div>

            </div>

          </div>
        )}

      </form>

    </div>
  );
}