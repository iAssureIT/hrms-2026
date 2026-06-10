"use client";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  ShieldCheck,
  Wallet,
  Users,
  CalendarDays,
  CircleDollarSign,
  Play,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

const employees = [
  {
    id: 1,
    name: "Marcus Sterling",
    empId: "EMP-0012",
    dept: "Engineering",
    role: "Staff Engineer",
    location: "San Francisco",
    calDays: 31,
    paidDays: 22,
    gross: "₹12,500",
    overtime: "₹450",
    deduction: "₹3,105",
    net: "₹9,845",
    approver: "Jonathan Wick",
    remark: "Verified by HR Manager",
  },
  {
    id: 2,
    name: "Sarah Chen",
    empId: "EMP-0045",
    dept: "Finance",
    role: "Treasury Lead",
    location: "Singapore",
    calDays: 31,
    paidDays: 22,
    gross: "₹11,200",
    overtime: "₹0",
    deduction: "₹2,280",
    net: "₹8,920",
    approver: "Alice Vance",
    remark: "Financial audit complete",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    empId: "EMP-0231",
    dept: "Operations",
    role: "Manager",
    location: "Madrid",
    calDays: 31,
    paidDays: 22,
    gross: "₹7,800",
    overtime: "₹890",
    deduction: "₹2,540",
    net: "₹6,150",
    approver: "Mark Sloan",
    remark: "Overtime approved by HOD",
  },
  {
    id: 4,
    name: "David Kim",
    empId: "EMP-0552",
    dept: "Marketing",
    role: "Creative Director",
    location: "Seoul",
    calDays: 31,
    paidDays: 22,
    gross: "₹9,400",
    overtime: "₹120",
    deduction: "₹2,290",
    net: "₹7,230",
    approver: "Sarah Chen",
    remark: "Bonus included in cycle",
  },
  {
    id: 5,
    name: "Aisha Buhari",
    empId: "EMP-0912",
    dept: "Recruitment",
    role: "Senior Partner",
    location: "Lagos",
    calDays: 31,
    paidDays: 22,
    gross: "₹8,200",
    overtime: "₹0",
    deduction: "₹1,800",
    net: "₹6,400",
    approver: "Alice Vance",
    remark: "Standard calculation",
  },
];

function Step({
  number,
  title,
  active,
  completed,
}) {
  return (
    <div className="flex items-center flex-1">
      <div className="flex flex-col items-center min-w-fit">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 text-sm font-bold ${
            completed
              ? "bg-blue-600 border-blue-600 text-white"
              : active
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-gray-300 text-gray-400 bg-white"
          }`}
        >
          {completed ? "✓" : number}
        </div>

        <span
          className={`mt-3 text-xs font-semibold ${
            active
              ? "text-blue-600"
              : completed
              ? "text-gray-900"
              : "text-gray-400"
          }`}
        >
          {title}
        </span>
      </div>

      {number !== 4 && (
        <div className="flex-1 h-[2px] bg-gray-200 mx-4 mb-8" />
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  highlight,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          highlight
            ? "bg-blue-500"
            : "bg-blue-50 text-blue-600"
        }`}
      >
        {icon}
      </div>

      <p
        className={`text-[11px] uppercase font-semibold mt-5 ${
          highlight
            ? "text-blue-100"
            : "text-gray-500"
        }`}
      >
        {title}
      </p>

      <h3 className="text-2xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}

export default function PayrollApprovalPage() {

  const router = useRouter();

  const handleSubmit = async () => {
        router.push(`/admin/payrollManagementNew/execution`);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-blue-600">
              PayGovernance
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400" />

            <div className="text-sm text-gray-500">
              Payroll Ops
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400" />

            <div className="text-sm font-semibold text-gray-900">
              Batch Approval #9928
            </div>
          </div>

          {/* Right */}

        </div>
      </div>

      {/* Main */}
      <div className="p-6">
        {/* Stepper */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex items-center justify-between">
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
                      index === 2
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

        {/* Summary Cards */}
        <div className="grid grid-cols-7 gap-4 mt-6">
          <SummaryCard
            icon={<Wallet className="w-5 h-5" />}
            title="Payroll Batch ID"
            value="PAY-2023-OCT-01"
          />

          <SummaryCard
            icon={
              <CalendarDays className="w-5 h-5" />
            }
            title="Payroll Month"
            value="October 2023"
          />

          <SummaryCard
            icon={
              <ShieldCheck className="w-5 h-5" />
            }
            title="Approval Level"
            value="Level 3"
          />

          <SummaryCard
            icon={<Users className="w-5 h-5" />}
            title="Pending With"
            value="Payroll Head"
          />

          <SummaryCard
            icon={<Clock3 className="w-5 h-5" />}
            title="Approval Deadline"
            value="Oct 28"
          />

          <SummaryCard
            icon={<Users className="w-5 h-5" />}
            title="Total Employees"
            value="1,245"
          />

          <SummaryCard
            icon={
              <CircleDollarSign className="w-5 h-5" />
            }
            title="Total Payroll"
            value="$2.45M"
            highlight
          />
        </div>

        {/* Employee Table */}
        <div className="bg-white border border-gray-200 rounded-3xl mt-6 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-8">
              <button className="pb-4 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">
                Approved Employees
                <span className="ml-2 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                  1,238
                </span>
              </button>

              <button className="text-gray-500 font-semibold text-sm">
                Excluded Employees
                <span className="ml-2 px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs">
                  7
                </span>
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-10 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-[11px] uppercase font-semibold tracking-wide text-gray-500">
            <div>#</div>
            <div className="col-span-3">
              Employee Information
            </div>
            <div>Calendar Days</div>
            <div>Net Paid Days</div>
            <div>Gross Salary</div>
            <div>Deductions</div>
            <div>Net Payable</div>
            <div>Approval Insight</div>
          </div>

          {/* Rows */}
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="grid grid-cols-10 gap-4 px-6 py-6 border-b border-gray-100 items-center hover:bg-gray-50"
            >
              <div className="text-sm font-medium">
                {emp.id}
              </div>

              {/* Employee */}
              <div className="col-span-3 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-200" />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      {emp.name}
                    </h3>

                    <span className="text-xs text-gray-500 font-medium">
                      {emp.empId}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {emp.dept} • {emp.role}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-1 uppercase">
                    {emp.location}
                  </p>
                </div>
              </div>

              <div className="text-sm font-medium">
                {emp.calDays}
              </div>

              <div className="text-sm font-medium">
                {emp.paidDays}
              </div>

              <div className="text-sm font-bold text-gray-900">
                {emp.gross}
              </div>

              <div className="text-sm font-semibold text-red-500">
                {emp.deduction}
              </div>

              <div className="text-sm font-bold text-blue-600">
                {emp.net}
              </div>

              {/* Approval */}
              <div>
                <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Approved
                </div>

                <p className="text-xs text-gray-700 mt-2">
                  {emp.approver}
                </p>

                <p className="text-[11px] text-gray-400 mt-1">
                  {emp.remark}
                </p>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-5">
            <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Previous Step
            </button>

            <div className="flex items-center gap-4">
              <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Approved Payroll
              </button>

              <button onClick={handleSubmit} className="h-11 px-6 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold shadow flex items-center gap-2">
                <Play className="w-4 h-4" />
                Execute Payroll
              </button>
            </div>
          </div>
        </div>

        {/* Approval Chain */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 mt-6">
          {/* Heading */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Approval Chain
            </h2>

            <button className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium">
              Audit Logs
            </button>
          </div>

          {/* Approval Cards */}
          <div className="grid grid-cols-3 gap-5">
            {/* HR Approval */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      HR Manager Approval
                    </h3>

                    <p className="text-sm mt-2 font-medium">
                      Sarah Jenkins
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Oct 24, 2023 • 09:15 AM
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  Verified
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-4 italic leading-5">
                All attendance records verified and synced.
              </p>
            </div>

            {/* Finance Approval */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Finance Manager Approval
                    </h3>

                    <p className="text-sm mt-2 font-medium">
                      Marcus Aurelius
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Oct 24, 2023 • 02:45 PM
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  Verified
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-4 italic leading-5">
                Funds allocation confirmed for treasury.
              </p>
            </div>

            {/* Final Approval */}
            <div className="border-2 border-blue-200 rounded-2xl p-5 bg-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Clock3 className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-blue-700">
                      Payroll Head Approval
                    </h3>

                    <p className="text-sm mt-2 font-medium">
                      Jonathan Sterling
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Action Required
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                  Pending
                </span>
              </div>

              {/* Remark */}
              {/* <div className="mt-5">
                <label className="text-xs font-semibold text-gray-600">
                  Approval Remark
                </label>

                <textarea
                  rows={4}
                  placeholder="Enter final approval comments..."
                  className="w-full mt-2 rounded-xl border border-gray-200 p-3 text-sm outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button className="flex-1 h-10 rounded-xl border border-gray-200 bg-white text-sm font-medium">
                  Send Back
                </button>

                <button className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
                  Final Approve
                </button>
              </div> */}
            </div>
          </div>

          {/* Bottom Actions */}

        </div>
      </div>
    </div>
  );
}