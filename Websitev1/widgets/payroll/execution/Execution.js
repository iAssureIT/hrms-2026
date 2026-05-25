"use client";

import {
  Bell,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
  Wallet,
  Users,
  Receipt,
  Landmark,
  FileText,
  MoreVertical,
  Printer,
  Mail,
  Building2,
  Clock3,
  BarChart3,
  ChevronRight
} from "lucide-react";

const employees = [
  {
    id: 1,
    name: "Alexander Wright",
    empId: "EMP-1024",
    role: "Senior VP",
    unit: "Enterprise Sales",
    dept: "Commercial",
    netDays: 30,
    gross: "12,500",
    paid: "11,300",
    bank: "Global Trust Bank",
    status: "Processed",
  },
  {
    id: 2,
    name: "Elena Rodriguez",
    empId: "EMP-1102",
    role: "Lead Architect",
    unit: "Engineering",
    dept: "Software",
    netDays: 30,
    gross: "9,800",
    paid: "8,820",
    bank: "NeoBank Digital",
    status: "Processed",
  },
  {
    id: 3,
    name: "Marcus Thorne",
    empId: "EMP-0945",
    role: "Facility Manager",
    unit: "Corporate Services",
    dept: "Operations",
    netDays: 28,
    gross: "4,500",
    paid: "4,050",
    bank: "Standard Chartered",
    status: "Pending",
  },
  {
    id: 4,
    name: "Sophia Kim",
    empId: "EMP-1088",
    role: "Strategy Director",
    unit: "Marketing Operations",
    dept: "Growth",
    netDays: 30,
    gross: "8,200",
    paid: "7,380",
    bank: "Global Trust Bank",
    status: "Processed",
  },
  {
    id: 5,
    name: "Julian Vance",
    empId: "EMP-1215",
    role: "Principal Researcher",
    unit: "Research & Dev",
    dept: "AI Labs",
    netDays: 30,
    gross: "11,000",
    paid: "9,900",
    bank: "First National Bank",
    status: "Processed",
  },
];

function Step({
  title,
  completed,
  active,
}) {
  return (
    <div className="flex items-center flex-1">
      <div className="flex flex-col items-center min-w-fit">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            completed || active
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <p
          className={`text-xs font-semibold mt-3 ${
            active
              ? "text-blue-600"
              : "text-green-600"
          }`}
        >
          {title}
        </p>
      </div>

      {title !== "Payroll Execution" && (
        <div className="flex-1 h-[2px] bg-green-400 mx-6 mb-8" />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
  color,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${color}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">
            {title}
          </p>

          <h3 className="text-4xl font-bold text-gray-900 mt-3">
            {value}
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            {sub}
          </p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function FinalPayrollExecution() {
  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      {/* Header */}
      <div className="h-20 bg-white border-b border-gray-200 px-12 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-5">
          <h1 className="text-3xl font-bold text-gray-900">
            Final Payroll Execution
          </h1>

          <div className="px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
            Batch ID: PAY-2024-0012
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              placeholder="Search Employee ID..."
              className="h-11 w-[320px] pl-11 pr-4 rounded-xl border border-gray-200 bg-white outline-none text-sm"
            />
          </div>

          <button className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center relative bg-white">
            <Bell className="w-5 h-5 text-gray-600" />

            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>

          <button className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 shadow">
            <Download className="w-4 h-4" />
            Export Summary
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-10">
        <div className="bg-white border-b border-gray-200 px-8 py-5 mb-10">
        <div className="flex items-center justify-between">
        {/* Steps */}
        <div className="flex items-center gap-4">
            {[
              "Employee Selection",
              "Payroll Preview",
              "Approval Workflow",
              "Execution",
            ].map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index === 3
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`text-sm font-medium ${
                      index === 1
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {index !== 3 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
          </div>
          </div>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Payroll Process Locked Successfully
              </h2>

              <p className="text-gray-600 mt-2">
                Execution completed on Oct 24,
                2024 at 14:30 PM. All records are
                non-editable.
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase text-gray-500 font-semibold">
              Payroll Month
            </p>

            <h3 className="text-xl font-bold mt-1">
              October 2024
            </h3>

            <span className="inline-flex mt-3 px-4 py-2 rounded-full bg-green-500 text-white text-xs font-bold">
              EXECUTED
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-5 mt-8">
          <StatCard
            title="Total Paid"
            value="450"
            sub="Full active roster"
            icon={<Users className="w-5 h-5" />}
            color="bg-white border-gray-200"
          />

          <StatCard
            title="Gross Amount"
            value="₹1.45M"
            sub="+2.4% vs last month"
            icon={
              <Wallet className="w-5 h-5 text-blue-600" />
            }
            color="bg-blue-50 border-blue-100"
          />

          <StatCard
            title="Net Salary"
            value="₹1.24M"
            sub="Total bank outflow"
            icon={
              <Landmark className="w-5 h-5 text-green-600" />
            }
            color="bg-green-50 border-green-100"
          />

          <StatCard
            title="Total Deductions"
            value="₹204K"
            sub="Tax & Statutory"
            icon={
              <Clock3 className="w-5 h-5 text-purple-600" />
            }
            color="bg-purple-50 border-purple-100"
          />

          <StatCard
            title="Compliance"
            value="₹88K"
            sub="Liability generated"
            icon={
              <ShieldCheck className="w-5 h-5 text-gray-700" />
            }
            color="bg-white border-gray-200"
          />

          <StatCard
            title="Incentives"
            value="₹12K"
            sub="Bonuses & Overtime"
            icon={
              <BarChart3 className="w-5 h-5 text-gray-700" />
            }
            color="bg-white border-gray-200"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6 mt-8">
          {/* Left */}
          <div className="col-span-9">
            {/* Bank Summary */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Bank File Generation Summary
                  </h3>

                  <p className="text-gray-500 mt-1">
                    Treasury settlement status
                    for current batch ID:
                    PAY-2024-0012
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 mt-8">
                <div>
                  <p className="text-[11px] uppercase font-semibold text-gray-500">
                    Total Payment Amount
                  </p>

                  <h3 className="text-4xl font-bold mt-3">
                    ₹1,245,890
                  </h3>
                </div>

                <div>
                  <p className="text-[11px] uppercase font-semibold text-gray-500">
                    Successful Records
                  </p>

                  <h3 className="text-4xl font-bold text-green-600 mt-3">
                    442 / 450
                  </h3>
                </div>

                <div>
                  <p className="text-[11px] uppercase font-semibold text-gray-500">
                    Failed Records
                  </p>

                  <h3 className="text-4xl font-bold text-red-500 mt-3">
                    0
                  </h3>
                </div>

                <div>
                  <p className="text-[11px] uppercase font-semibold text-gray-500">
                    Pending Records
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <h3 className="text-4xl font-bold text-yellow-500">
                      8
                    </h3>

                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                      Waiting API
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registry */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden mt-6">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Executed Payroll Registry
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Individual record breakdown
                    for Batch PAY-2024-0012
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium">
                    Filter View
                  </button>

                  <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium">
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div>
                {/* Head */}
                <div className="grid grid-cols-9 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wide font-semibold text-gray-500">
                  <div>SN</div>
                  <div className="col-span-2">
                    Employee Details
                  </div>
                  <div>Role & Unit</div>
                  <div>Net Days</div>
                  <div>Gross (₹)</div>
                  <div>Net Paid (₹)</div>
                  <div>Bank / Status</div>
                  <div>Actions</div>
                </div>

                {/* Rows */}
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="grid grid-cols-9 gap-4 px-6 py-6 border-b border-gray-100 items-center hover:bg-gray-50"
                  >
                    <div className="text-sm font-medium">
                      {emp.id}
                    </div>

                    {/* Employee */}
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gray-300" />

                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          {emp.name}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          {emp.empId}
                        </p>
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <h3 className="text-sm font-semibold">
                        {emp.role}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {emp.unit}
                      </p>

                      <p className="text-[11px] uppercase text-gray-400 mt-1">
                        {emp.dept}
                      </p>
                    </div>

                    <div className="text-sm font-medium">
                      {emp.netDays}
                    </div>

                    <div className="text-sm font-bold">
                      {emp.gross}
                    </div>

                    <div className="text-sm font-bold text-blue-600">
                      {emp.paid}
                    </div>

                    {/* Bank */}
                    <div>
                      <h3 className="text-sm font-medium">
                        {emp.bank}
                      </h3>

                      <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          emp.status ===
                          "Processed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 text-gray-500">
                      <FileText className="w-4 h-4 cursor-pointer" />

                      <Receipt className="w-4 h-4 cursor-pointer" />

                      <MoreVertical className="w-4 h-4 cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="col-span-3">
            <div className="bg-white border border-gray-200 rounded-3xl p-6">
              <h3 className="text-sm uppercase font-bold tracking-wide text-gray-700">
                Payroll Lifecycle
              </h3>

              <div className="mt-8 space-y-8">
                {[
                  "Payroll Locked",
                  "Compliance Verified",
                  "Bank File Generated",
                  "Payslips Archived",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {item}
                      </h4>

                      <p className="text-xs text-gray-500 mt-1">
                        Oct 24, 2024 • 14:25 PM
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full h-11 rounded-xl border border-gray-200 bg-white text-sm font-medium mt-8">
                View Full Audit Log
              </button>

              {/* Compliance */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-[11px] uppercase tracking-wide font-semibold text-gray-500 mb-5">
                  Compliance Bundle
                </h3>

                <div className="space-y-3">
                  {[
                    "Statutory Reports",
                    "Bank Settlement File",
                    "Salary Register",
                    "Tax Filings (Form 16)",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="h-12 rounded-xl border border-gray-200 px-4 flex items-center justify-between text-sm"
                    >
                      <span>{item}</span>

                      <span className="text-xs text-gray-400">
                        2.4 MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border border-gray-200 rounded-3xl px-6 py-5 flex items-center justify-between mt-6">
          {/* Left */}
          <div className="flex items-center gap-10">
            <div>
              <p className="text-[11px] uppercase font-semibold text-gray-500">
                Total Net Outflow
              </p>

              <h3 className="text-3xl font-bold mt-2">
                ₹1,245,890
              </h3>
            </div>

            <div>
              <p className="text-[11px] uppercase font-semibold text-gray-500">
                Payment Mode
              </p>

              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 text-purple-600" />

                <span className="font-semibold">
                  Direct Treasury (NEFT)
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print Registry
            </button>

            <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Notify Employees
            </button>

            <button className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 shadow">
              <Download className="w-4 h-4" />
              Download All Payslips (ZIP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}