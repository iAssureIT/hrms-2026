"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EmployeePaySlipHistory() {
  const [employeeIds, setEmployeeIds] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedYear, setSelectedYear] =
    useState(
        new Date().toISOString().slice(0, 7)
    );
  const [paySlips, setPaySlips] = useState([]);

  // FETCH EMPLOYEE IDS
  const fetchEmployeeIds = async () => {
    try {

        const res = await axios.get(
            "http://localhost:3050/api/employee-salary"
        );

        const ids = res.data.map(
            (item) => item.employeeId
        );

        setEmployeeIds(ids);

    } catch (error) {
        console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployeeIds();
  }, []);

  // FETCH PAYSLIPS
  const fetchPaySlips = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3050/api/salary-slip/${selectedEmployee}/${selectedYear}`
      );

      setPaySlips(res.data.data || []);

    } catch (error) {
      console.log(error);
      setPaySlips([]);
    }
  };

  // DOWNLOAD PDF
  const downloadPDF = (slip) => {

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Salary Slip", 14, 20);

    doc.setFontSize(12);

    doc.text(
      `Employee ID: ${slip.employeeId}`,
      14,
      35
    );

    doc.text(
      `Salary Month: ${slip.salaryMonth}`,
      14,
      43
    );

    doc.text(
      `Generated Date: ${new Date().toLocaleDateString()}`,
      14,
      51
    );

    autoTable(doc, {
      startY: 60,

      head: [
        [
          "Components",
          "Amount",
        ],
      ],

      body: slip.salaryData.map((item) => [
        item.components,
        `₹ ${Math.abs(item.amount).toLocaleString()}`,
      ]),
    });

    doc.text(
      `Total Earnings: ₹ ${slip.totalEarnings.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 15
    );

    doc.text(
      `Total Deductions: ₹ ${slip.totalDeductions.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 25
    );

    doc.text(
      `Net Salary: ₹ ${slip.netSalary.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 35
    );

    doc.save(
      `${slip.employeeId}-${slip.salaryMonth}.pdf`
    );
  };

  return (
    <div className="p-6">

      {/* FILTER SECTION */}
      <div className="bg-white p-6 rounded-xl shadow">

        <div className="flex flex-wrap gap-4 items-end">

          {/* EMPLOYEE DROPDOWN */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Employee ID
            </label>

            <select
              value={selectedEmployee}
              onChange={(e) =>
                setSelectedEmployee(e.target.value)
              }
              className="border rounded-lg px-4 py-2 w-60 outline-none"
            >
              <option value="">
                Select Employee
              </option>

              {employeeIds.map((id, index) => (
                <option
                  key={index}
                  value={id}
                >
                  {id}
                </option>
              ))}
            </select>
          </div>

          {/* YEAR */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Year
            </label>

            <input
            type="month"
            value={selectedYear}
            onChange={(e) =>
                setSelectedYear(e.target.value)
            }
            className="border rounded-lg px-4 py-2 outline-none"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={fetchPaySlips}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            View Pay Slips
          </button>
        </div>
      </div>

      {/* PAYSLIPS */}
      <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">
                Employee ID
              </th>

              <th className="border p-3 text-left">
                Salary Month
              </th>

              <th className="border p-3 text-left">
                Earnings
              </th>

              <th className="border p-3 text-left">
                Deductions
              </th>

              <th className="border p-3 text-left">
                Net Salary
              </th>

              <th className="border p-3 text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {paySlips.length > 0 ? (
              paySlips.map((slip) => (
                <tr key={slip._id}>
                  <td className="border p-3">
                    {slip.employeeId}
                  </td>

                  <td className="border p-3">
                    {slip.salaryMonth}
                  </td>

                  <td className="border p-3">
                    ₹ {slip.totalEarnings.toLocaleString()}
                  </td>

                  <td className="border p-3">
                    ₹ {slip.totalDeductions.toLocaleString()}
                  </td>

                  <td className="border p-3 font-semibold">
                    ₹ {slip.netSalary.toLocaleString()}
                  </td>

                  <td className="border p-3">
                    <button
                      onClick={() =>
                        downloadPDF(slip)
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-5 text-gray-500"
                >
                  No pay slips found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

