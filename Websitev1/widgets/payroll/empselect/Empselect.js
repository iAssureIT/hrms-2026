"use client";

import { useState } from "react";
import {
  ChevronRight,
  CalendarDays,
  Clock3,
  Users,
  Filter,
  Search,
  RotateCcw,
  Save,
  ShieldCheck,
  CircleAlert,
  CircleCheck,
  MoreVertical,
  CalendarRange,
  ChevronDown,
} from "lucide-react";

const employees = [
  {
    id: "E001",
    name: "Alexander Pierce",
    role: "Senior Software Engineer",
    dept: "Engineering",
    location: "San Francisco",
    designation: "Software Engineer",
    jobType: ["Regular", "Full Time"],
    attendance: "Completed",
    salary: "Active",
    eligibility: "Eligible",
  },
  {
    id: "E002",
    name: "Sarah Jenkins",
    role: "Project Manager",
    dept: "Operations",
    location: "New York",
    designation: "Project Manager",
    jobType: ["Contract", "Part Time"],
    attendance: "Missing Punches",
    salary: "Active",
    eligibility: "Eligible",
  },
  {
    id: "E003",
    name: "Michael Chen",
    role: "UX Designer",
    dept: "Engineering",
    location: "San Francisco",
    designation: "UI/UX Designer",
    jobType: ["Regular", "Flexible Hours"],
    attendance: "Completed",
    salary: "Missing Structure",
    eligibility: "Blocked",
  },
  {
    id: "E004",
    name: "Elena Rodriguez",
    role: "HR Specialist",
    dept: "HR",
    location: "Austin",
    designation: "HR Executive",
    jobType: ["Regular", "Full Time"],
    attendance: "Attendance Exception",
    salary: "Pending Approval",
    eligibility: "Eligible",
  },
];

const badgeStyles = {
  green:
    "bg-green-50 text-green-700 border border-green-200",
  orange:
    "bg-orange-50 text-orange-700 border border-orange-200",
  red:
    "bg-red-50 text-red-700 border border-red-200",
};

const getBadge = (text) => {
  if (
    text === "Completed" ||
    text === "Active" ||
    text === "Eligible"
  ) {
    return badgeStyles.green;
  }

  if (
    text === "Missing Punches" ||
    text === "Attendance Exception" ||
    text === "Pending Approval"
  ) {
    return badgeStyles.orange;
  }

  if (
    text === "Blocked" ||
    text === "Missing Structure"
  ) {
    return badgeStyles.red;
  }

  return badgeStyles.green;
};

function SelectField({
  label,
  options = [],
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <select className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none">
        {options.map((item, index) => (
          <option key={index}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxMultiSelect({
  label,
  options = [],
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] =
    useState([]);

  const toggleOption = (value) => {
    if (selected.includes(value)) {
      setSelected(
        selected.filter(
          (item) => item !== value
        )
      );
    } else {
      setSelected([
        ...selected,
        value,
      ]);
    }
  };

  return (
    <div className="relative flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm flex items-center justify-between"
      >
        <span className="truncate text-left">
          {selected.length > 0
            ? selected.join(", ")
            : `Select ${label}`}
        </span>

        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[72px] left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-4 max-h-[240px] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {options.map(
              (item, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(
                      item
                    )}
                    onChange={() =>
                      toggleOption(
                        item
                      )
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />

                  <span className="text-sm text-gray-700">
                    {item}
                  </span>
                </label>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ text }) {
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getBadge(
        text
      )}`}
    >
      {text}
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  sub,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
            {title}
          </p>

          <div className="flex items-end gap-2 mt-3">
            <h3 className="text-4xl font-bold text-gray-900">
              {value}
            </h3>

            <span className="text-[12px] text-green-600 font-medium mb-1">
              {sub}
            </span>
          </div>
        </div>

        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function PayrollEmpSelect() {
  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
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
                      index === 0
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`text-sm font-medium ${
                      index === 0
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

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save View
            </button>

            <button className="h-11 px-5 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            <button className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 shadow">
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="p-8">
        {/* Title */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-gray-900">
            Payroll Execution: Employee Selection
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="grid grid-cols-4 gap-5">
            {/* Payroll Month */}
            <SelectField
              label="Payroll Month"
              options={[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
              ]}
            />

            {/* Payroll Year */}
            <SelectField
              label="Payroll Year"
              options={[
                "2023",
                "2024",
                "2025",
              ]}
            />

            {/* Payroll Duration */}
{/* Start Date */}
<div>
  <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
    Start Date
  </p>

  <div className="mt-2 relative">
    <input
      type="date"
      defaultValue="2024-07-01"
      className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm outline-none focus:border-blue-500"
    />

    <CalendarRange className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
  </div>
</div>

{/* End Date */}
<div>
  <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
    End Date
  </p>

  <div className="mt-2 relative">
    <input
      type="date"
      defaultValue="2024-07-31"
      className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm outline-none focus:border-blue-500"
    />

    <CalendarRange className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
  </div>
</div>



            {/* Business Unit */}
            <CheckboxMultiSelect
              label="Business Unit"
              options={[
                "Corporate HQ",
                "India Operations",
                "North America",
                "Europe Division",
                "Shared Services",
              ]}
            />

            {/* Location */}
            <CheckboxMultiSelect
              label="Location"
              options={[
                "New York",
                "San Francisco",
                "Austin",
                "Pune",
                "Bangalore",
              ]}
            />

            {/* Department */}
            <CheckboxMultiSelect
              label="Department"
              options={[
                "Engineering",
                "Finance",
                "HR",
                "Operations",
                "Marketing",
              ]}
            />

            {/* Designation */}
            <CheckboxMultiSelect
              label="Designation"
              options={[
                "Software Engineer",
                "Project Manager",
                "UI/UX Designer",
                "HR Executive",
                "Finance Analyst",
              ]}
            />

            {/* Job Type */}
            <CheckboxMultiSelect
              label="Job Type"
              options={[
                "Reguler",
                "Contract",
                "Intern",
                "Freelancer",
              ]}
            />

            {/* Job Timing */}
            <CheckboxMultiSelect
              label="Job Timing"
              options={[
                "Full Time",
                "Part Time",
                "General Shift",
                "Morning Shift",
                "Evening Shift",
                "Night Shift",
                "Rotational Shift",
                "Flexible Timing",
                "Weekend Shift",
                "Split Shift",
              ]}
            />    

            {/* Search */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Search
              </label>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  placeholder="Search Employee..."
                  className="h-11 w-full pl-11 pr-4 rounded-xl border border-gray-200 bg-white outline-none text-sm"
                />
              </div>
            </div>


          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mt-6">
          <StatCard
            icon={
              <CalendarDays className="w-5 h-5" />
            }
            title="Calendar Days"
            value="30"
            sub="Fixed"
          />

          <StatCard
            icon={
              <Clock3 className="w-5 h-5" />
            }
            title="Working Days"
            value="22"
            sub="+1 vs May"
          />

          <StatCard
            icon={
              <Users className="w-5 h-5" />
            }
            title="Total Employees"
            value="840"
            sub="System Wide"
          />

          <StatCard
            icon={
              <ShieldCheck className="w-5 h-5" />
            }
            title="Applied Filter Selection"
            value="5"
            sub="Active List"
          />
        </div>

        {/* Employee Table */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-10 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50 text-[11px] uppercase font-semibold tracking-wide text-gray-500">
            <div>Select</div>
            <div>EMP ID</div>
            <div className="col-span-2">
              Name & Role
            </div>
            <div>Department</div>
            <div>Location</div>
            <div>Job Type</div>
            <div>Attendance</div>
            <div>Salary</div>
            <div>Eligibility</div>
          </div>

          {/* Rows */}
          {employees.map((emp, index) => (
            <div
              key={index}
              className="grid grid-cols-10 gap-4 px-6 py-5 border-b border-gray-100 items-center hover:bg-gray-50"
            >
              <div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
              </div>

              <div className="text-sm font-semibold text-blue-600">
                {emp.id}
              </div>

              {/* Name */}
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-200" />

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {emp.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    {emp.role}
                  </p>
                </div>
              </div>

              {/* Department */}
              <div className="text-sm text-gray-700">
                {emp.dept}
              </div>

              {/* Location */}
              <div className="text-sm text-gray-700">
                {emp.location}
              </div>

              {/* Job Type */}
              <div className="flex flex-col gap-2">
                {emp.jobType.map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700 font-medium w-fit"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>

              {/* Attendance */}
              <StatusBadge
                text={emp.attendance}
              />

              {/* Salary */}
              <StatusBadge
                text={emp.salary}
              />

              {/* Eligibility */}
              <div className="flex items-center justify-between gap-3">
                <StatusBadge
                  text={emp.eligibility}
                />

                <button>
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[11px] uppercase text-gray-500 font-semibold">
                Current Selection
              </p>

              <h3 className="text-lg font-bold text-gray-900">
                5 Employees
              </h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CircleCheck className="w-4 h-4 text-green-600" />
                1,240 Eligible
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CircleAlert className="w-4 h-4 text-red-600" />
                24 Blocked
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium">
              Save as Draft
            </button>

            <button className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium">
              Download Validation Report
            </button>

            <button className="h-11 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow">
              Proceed to Payroll Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}