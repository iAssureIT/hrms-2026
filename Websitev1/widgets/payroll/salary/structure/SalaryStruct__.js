"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function EmployeeSalaryForm() {  
  //const [employeeId, setEmployeeId] = useState("");
  const [ctc, setCtc] = useState("");
  const [components, setComponents] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState([]);
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("empId");  
  const router = useRouter();

  // FETCH COMPONENTS
  const fetchComponents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3050/api/salary-components"
      );

      const sorted = res.data.sort(
        (a, b) => Number(a.sequence) - Number(b.sequence)
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
      (a, b) => Number(a.sequence) - Number(b.sequence)
    );

    const calculatedMap = {};

    const calculatedData = sortedComponents.map(
      (item) => {
        let amount = 0;

        const byValue = Number(item.byValue);

        const componentKey = item.component
          ?.trim()
          .toLowerCase();

        const basedOnKey = item.basedOn
          ?.trim()
          .toLowerCase();

        // FIXED
        if (item.formula === "fixed") {
          amount = byValue;
        }

        // PERCENTAGE
        else if (item.formula === "percentage") {

          // BASED ON COMPONENT
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
          }

          // DIRECT CTC PERCENTAGE
          else {
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

    // ADD CTC ROW
    calculatedData.unshift({
      component: "CTC",
      type: "earning",
      amount: ctcValue,
    });

    // TOTAL
  const total = calculatedData
    .filter(
      (item) =>
        item.component
          ?.trim()
          .toLowerCase() !== "ctc"
    )
    .reduce(
      (acc, item) => acc + item.amount,
      0
    );

    // ADD TOTAL ROW
    calculatedData.push({
      component: "Total",
      type: "earning",
      amount: total,
    });

    setSalaryStructure(calculatedData);
  };

  // HANDLE CTC CHANGE
  const handleCtcChange = (e) => {
    const value = e.target.value;
    setCtc(value);
    calculateSalary(value);
  };

  // SAVE TO MONGODB
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        employeeId,
        salaryData: salaryStructure.map((item) => ({
          components: item.component,
          amount: item.amount,
        })),
      };

      await axios.post(
        "http://localhost:3050/api/employee-salary",
        payload
      );

      //alert("Salary saved successfully");

      setCtc("");
      setSalaryStructure([]);

      router.push(`/admin/payroll/salary/salaryslip?empId=${employeeId}`);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow"
      >
        <div className="flex flex-wrap gap-4 items-end">

          {/* EMPLOYEE ID */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Employee ID
            </label>

            <input
              type="text"
              defaultValue={employeeId}
              // onChange={(e) =>
              //   setEmployeeId(e.target.value)
              // }
              placeholder="Enter employee id"
              className="border rounded-lg px-4 py-2 w-52 outline-none border-gray-300"
            />
          </div>

          {/* CTC */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Annual CTC
            </label>

            <input
              type="number"
              value={ctc}
              onChange={handleCtcChange}
              placeholder="Enter CTC"
              className="border rounded-lg px-4 py-2 w-52 outline-none border-gray-300"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Save Salary
          </button>
        </div>

        {/* SALARY STRUCTURE */}
        <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left">
                  Components
                </th>

                <th className="border p-3 text-left">
                  Type
                </th>

                <th className="border p-3 text-left">
                  Yearly Amount
                </th>

                <th className="border p-3 text-left">
                  Monthly Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {salaryStructure.length > 0 ? (
                salaryStructure.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-3">
                      {item.component}
                    </td>

                    <td className="border p-3 capitalize">
                      {item.type}
                    </td>

                    <td className="border p-3 font-medium">
                      ₹ {item.amount.toLocaleString()}
                    </td>

                    <td className="border p-3 font-medium">
                      ₹{" "}
                      {Math.round(
                        item.amount / 12
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center p-5 text-gray-500"
                  >
                    Enter CTC to calculate salary
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}

