"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function EmployeeSalaryForm({
  empId,
}) {

  const [ctc, setCtc] = useState("");
  const [components, setComponents] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState([]);

  const searchParams = useSearchParams();
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
          Number(a.sequence) - Number(b.sequence)
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
        Number(a.sequence) - Number(b.sequence)
    );

    const calculatedMap = {};

    const calculatedData = sortedComponents.map(
      (item) => {

        let amount = 0;

        const byValue = Number(item.byValue);

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
              calculatedMap[basedOnKey] || 0;

            if (basedOnKey === "ctc") {

              amount =
                (ctcValue * byValue) / 100;

            } else {

              amount =
                (baseAmount * byValue) / 100;
            }
          } else {

            amount =
              (ctcValue * byValue) / 100;
          }
        }

        // DEDUCTION
        if (
          item.type
            ?.trim()
            .toLowerCase() === "deduction"
        ) {
          amount = -amount;
        }

        calculatedMap[componentKey] = amount;

        return {
          component: item.component,
          type: item.type,
          amount: Math.round(amount),
        };
      }
    );

    setSalaryStructure(calculatedData);
  };

  // HANDLE CTC
  const handleCtcChange = (e) => {

    const value = e.target.value;

    setCtc(value);

    calculateSalary(value);
  };

  // SAVE
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const payload = {
        employeeId,
        salaryData: salaryStructure.map(
          (item) => ({
            components: item.component,
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

  // GROUP BY TYPE
  const groupedData = salaryStructure.reduce(
    (acc, item) => {

      const type =
        item.type?.toLowerCase() || "others";

      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push(item);

      return acc;
    },
    {}
  );

  // GRAND TOTAL
  const grandTotal = salaryStructure.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto"
      >

        {/* TOP FORM */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">

          <div className="flex flex-wrap gap-5 items-end">

            {/* EMPLOYEE */}
            <div className="flex flex-col">

              <label className="text-sm font-medium mb-2">
                Employee ID
              </label>

              <input
                type="text"
                defaultValue={employeeId}
                className="border border-gray-300 rounded-xl px-4 py-3 w-64 outline-none"
              />
            </div>

            {/* CTC */}
            <div className="flex flex-col">

              <label className="text-sm font-medium mb-2">
                Annual CTC
              </label>

              <input
                type="number"
                value={ctc}
                onChange={handleCtcChange}
                placeholder="Enter CTC"
                className="border border-gray-300 rounded-xl px-4 py-3 w-64 outline-none"
              />
            </div>

            {/* SAVE */}
            <button
              type="submit"
              className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition"
            >
              Save Salary
            </button>
          </div>
        </div>

        {/* SALARY SLIP */}
        {salaryStructure.length > 0 && (

          <div className="bg-white rounded-[30px] shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8">

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">

                <div>

                  <h1 className="text-3xl font-bold">
                    Salary Structure
                  </h1>

                  <p className="mt-2 text-blue-100">
                    Employee ID :
                    {" "}
                    {employeeId}
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4">

                  <p className="text-sm text-blue-100">
                    Annual CTC
                  </p>

                  <h2 className="text-4xl font-bold mt-1">
                    ₹{" "}
                    {Number(ctc).toLocaleString()}
                  </h2>

                  <p className="text-sm mt-2 text-blue-100">
                    Monthly :
                    ₹{" "}
                    {Math.round(
                      Number(ctc) / 12
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="p-8 space-y-8">

              {Object.entries(groupedData).map(
                ([type, items]) => {

                  const typeTotal =
                    items.reduce(
                      (acc, item) =>
                        acc + item.amount,
                      0
                    );

                  const isDeduction =
                    type === "deduction";

                  return (

                    <div
                      key={type}
                      className={`rounded-3xl p-6 border
                      ${
                        isDeduction
                          ? "bg-red-50 border-red-100"
                          : "bg-green-50 border-green-100"
                      }`}
                    >

                      {/* SECTION HEADER */}
                      <div className="flex justify-between items-center mb-6">

                        <div>

                          <h2 className="text-2xl font-bold capitalize">
                            {type}
                          </h2>

                          <p className="text-sm text-gray-500 mt-1">
                            Salary Components
                          </p>
                        </div>

                        <div
                          className={`px-5 py-2 rounded-full text-sm font-semibold
                          ${
                            isDeduction
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {items.length} Items
                        </div>
                      </div>

                      {/* COMPONENT LIST */}
                      <div className="space-y-4">

                        {items.map(
                          (item, index) => (

                            <div
                              key={index}
                              className="bg-white rounded-2xl p-5 flex flex-col md:flex-row md:justify-between md:items-center shadow-sm"
                            >

                              {/* LEFT */}
                              <div>

                                <h3 className="text-lg font-semibold">
                                  {item.component}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                  Monthly :
                                  ₹{" "}
                                  {Math.abs(
                                    Math.round(
                                      item.amount / 12
                                    )
                                  ).toLocaleString()}
                                </p>
                              </div>

                              {/* RIGHT */}
                              <div className="mt-3 md:mt-0 text-left md:text-right">

                                <p
                                  className={`text-2xl font-bold
                                  ${
                                    item.amount < 0
                                      ? "text-red-600"
                                      : "text-green-700"
                                  }`}
                                >
                                  ₹{" "}
                                  {Math.abs(
                                    item.amount
                                  ).toLocaleString()}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                  Yearly Amount
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* TOTAL */}
                      <div
                        className={`mt-6 rounded-2xl px-6 py-5 flex justify-between items-center
                        ${
                          isDeduction
                            ? "bg-red-100"
                            : "bg-green-100"
                        }`}
                      >

                        <div>

                          <h3 className="text-xl font-bold">
                            Total {type}
                          </h3>

                          <p className="text-sm text-gray-600 mt-1">
                            Monthly :
                            ₹{" "}
                            {Math.abs(
                              Math.round(
                                typeTotal / 12
                              )
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div
                          className={`text-3xl font-bold
                          ${
                            isDeduction
                              ? "text-red-700"
                              : "text-green-700"
                          }`}
                        >
                          ₹{" "}
                          {Math.abs(
                            typeTotal
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}

              {/* GRAND TOTAL */}
              <div className="bg-black text-white rounded-3xl p-8">

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">

                  <div>

                    <p className="uppercase tracking-widest text-sm text-gray-400">
                      Final Salary
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
                      Grand Total
                    </h2>

                    <p className="text-gray-400 mt-2">
                      Net salary after all calculations
                    </p>
                  </div>

                  <div className="text-left md:text-right">

                    <h1 className="text-5xl font-bold">
                      ₹{" "}
                      {grandTotal.toLocaleString()}
                    </h1>

                    <p className="text-gray-400 mt-3">
                      Monthly :
                      ₹{" "}
                      {Math.round(
                        grandTotal / 12
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}