"use client";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldAlert,
  Bell,
  Users,
  Clock3,
  Wallet,
  Landmark,
  BadgeAlert,
  AlertTriangle,
  CircleDollarSign,
  FileWarning,
  Building2,
  ChevronDown,
  Play,
  RotateCcw,
  FileText,
  Download,
  MoreVertical,
  Settings,
  LifeBuoy,
  Briefcase,
  Globe,
  Banknote,
  ClipboardList,
  UserRound,
} from "lucide-react";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const metrics = [
  {
    title: "Total Employees",
    value: "1,248",
    icon: Users,
    note: "+12 NEW",
  },
  {
    title: "Processed",
    value: "984",
    icon: Clock3,
    note: "79% COMPLETE",
    active: true,
  },
  {
    title: "Pending",
    value: "264",
    icon: Clock3,
    note: "IN QUEUE",
  },
  {
    title: "Gross Salary",
    value: "$5.2M",
    icon: CircleDollarSign,
    note: "CURRENT MONTH",
  },
  {
    title: "Deductions",
    value: "$1.1M",
    icon: Landmark,
    note: "TAX/BENEFITS",
  },
  {
    title: "Net Payable",
    value: "$4.1M",
    icon: Wallet,
    note: "TAKE HOME",
    active: true,
  },
  {
    title: "Overtime",
    value: "$245K",
    icon: Clock3,
    note: "+15% VS LY",
  },
  {
    title: "Incentives",
    value: "$380K",
    icon: BadgeAlert,
    note: "PERFORMANCE",
  },
  {
    title: "Arrears",
    value: "$42K",
    icon: RotateCcw,
    note: "ADJ. REQUIRED",
  },
  {
    title: "Employer Cont.",
    value: "$620K",
    icon: Landmark,
    note: "SS/PENSION",
  },
  {
    title: "Total CTC",
    value: "$6.4M",
    icon: Building2,
    note: "EST. FINAL",
  },
  {
    title: "Compliance Liab.",
    value: "$115K",
    icon: ShieldAlert,
    note: "RESERVED",
  },
  {
    title: "Failed Records",
    value: "14",
    icon: FileWarning,
    note: "NEEDS REVIEW",
    danger: true,
  },
  {
    title: "Pending Appr.",
    value: "8",
    icon: ClipboardList,
    note: "ADMIN ACTION",
  },
];

const trendData = [
  { month: "Jan", gross: 5.8, net: 4.2 },
  { month: "Feb", gross: 5.9, net: 4.3 },
  { month: "Mar", gross: 5.7, net: 4.25 },
  { month: "Apr", gross: 6.0, net: 4.4 },
  { month: "May", gross: 6.2, net: 4.55 },
  { month: "Jun", gross: 6.15, net: 4.5 },
];

const overtimeData = [
  { name: "W1", value: 45000 },
  { name: "W2", value: 52000 },
  { name: "W3", value: 48000 },
  { name: "W4", value: 61000 },
];

const deptData = [
  { name: "Engineering", value: 90 },
  { name: "Sales", value: 65 },
  { name: "Marketing", value: 40 },
  { name: "HR", value: 18 },
  { name: "Finance", value: 24 },
];

const splitData = [
  { name: "Full-time", value: 72, color: "#6D4AFF" },
  { name: "Contract", value: 12, color: "#27D5B5" },
  { name: "Part-time", value: 8, color: "#B67BFF" },
  { name: "Interns", value: 8, color: "#FFB545" },
];

const alerts = [
  {
    title: "Missing Attendance Records",
    desc: "14 employees in Engineering haven't submitted timesheets for Week 4.",
    icon: Clock3,
  },
  {
    title: "Salary Mismatch Detected",
    desc: "3 records in Sales show 20% variance from contractual base salary.",
    icon: BadgeAlert,
  },
  {
    title: "Compliance Risk Alert",
    desc: "New tax regulations for Berlin region require update before processing.",
    icon: ShieldAlert,
  },
  {
    title: "Failed Bank Accounts",
    desc: "2 accounts in Marketing returned invalid routing numbers.",
    icon: AlertTriangle,
  },
  {
    title: "Negative Salary Warning",
    desc: "Executive recovery in IT Ops resulting in sub-zero net payable.",
    icon: FileWarning,
  },
];

const payrollRows = [
  {
    id: "PAY-2024-06-01",
    month: "June 2024",
    entity: "Global Tech Corp",
    dept: "Engineering • New York, US",
    emp: 420,
    gross: "$1,250,000",
    net: "$980,000",
    status: "Processed",
    statusColor: "bg-gray-100 text-gray-700",
    manager: "M: Alice Chen",
    checker: "C: David Ross",
    date: "2024-06-28",
    payment: "2024-06-30",
  },
  {
    id: "PAY-2024-06-02",
    month: "June 2024",
    entity: "Global Tech Corp",
    dept: "Sales • London, UK",
    emp: 180,
    gross: "$840,000",
    net: "$650,000",
    status: "Pending Approval",
    statusColor: "bg-yellow-100 text-yellow-700",
    manager: "M: Robert Smith",
    checker: "C: David Ross",
    date: "2024-06-26",
    payment: "-",
  },
  {
    id: "PAY-2024-06-03",
    month: "June 2024",
    entity: "Global Tech Corp",
    dept: "Marketing • Berlin, DE",
    emp: 55,
    gross: "$210,000",
    net: "$165,000",
    status: "Draft",
    statusColor: "bg-gray-100 text-gray-600",
    manager: "M: Sarah Jenkins",
    checker: "C: David Ross",
    date: "2024-07-02",
    payment: "-",
  },
  {
    id: "PAY-2024-06-04",
    month: "June 2024",
    entity: "Global Tech Corp",
    dept: "Finance • Singapore",
    emp: 32,
    gross: "$185,000",
    net: "$142,000",
    status: "Failed",
    statusColor: "bg-red-100 text-red-600",
    manager: "M: Alice Chen",
    checker: "C: David Ross",
    date: "-",
    payment: "-",
  },
  {
    id: "PAY-2024-05-01",
    month: "May 2024",
    entity: "Global Tech Corp",
    dept: "IT Ops • New York, US",
    emp: 110,
    gross: "$450,000",
    net: "$360,000",
    status: "Processed",
    statusColor: "bg-gray-100 text-gray-700",
    manager: "M: Robert Smith",
    checker: "C: David Ross",
    date: "2024-05-28",
    payment: "2024-05-30",
  },
];

export default function ZenithPayrollDashboard() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#F7F7FA] flex text-[#1B1B1D]">


      {/* MAIN */}
      <main className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="h-[78px] border-b border-[#E8E8EE] bg-white px-8 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight leading-none">
              Executive Payroll Dashboard
            </h2>

            <p className="text-[13px] text-gray-500 mt-1">
              Monitoring Cycle: June 2024 (Active)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-[260px] h-[48px] rounded-xl border border-[#ccc] bg-[#FAFAFC] px-4 flex items-center gap-3">
              <Search className="w-4 h-4 text-gray-400" />

              <input
                placeholder="Search records or batches..."
                className="bg-transparent outline-none w-full text-[14px]"
              />
            </div>

            <TopButton icon={FileText} label="Audit Logs" />
            <TopButton icon={UserRound} label="Approvals" />

<button
  onClick={() =>
    router.push(
      "/admin/payroll/process"
    )
  }
  className="h-[48px] px-6 rounded-xl bg-[#6F56FF] text-white flex items-center gap-2 font-medium shadow-md"
>
  <Play className="w-4 h-4" />
  Execute Payroll
</button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-8">
          {/* FILTERS */}
          <div className="bg-[#FBFBFD] border border-[#ECECF2] rounded-2xl p-6 mb-10">
            <div className="flex gap-4 flex-wrap">
              {[
                "June 2024",
                "All Units",
                "Multi (4)",
                "All Types",
                "US, UK, DE",
              ].map((item) => (
                <FilterBox key={item} label={item} />
              ))}

              <button className="h-[50px] px-6 rounded-xl border border-[#E5E7EB] bg-white flex items-center gap-2 font-medium">
                Apply
              </button>

              <button className="w-[50px] h-[50px] rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-center">
                ↻
              </button>
            </div>
          </div>

          {/* METRICS */}
          <SectionTitle title="System-wide Financial Metrics" />

          <div className="grid grid-cols-7 gap-4">
            {metrics.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className={`rounded-2xl border p-5 min-h-[128px] ${
                    item.active
                      ? "bg-[#F4F1FF] border-[#E7E0FF]"
                      : item.danger
                      ? "bg-[#FFF2F4] border-[#FFD8DF]"
                      : "bg-white border-[#ECECF2]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 text-gray-500" />

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide ${
                        item.danger
                          ? "text-[#F0526D]"
                          : "text-gray-400"
                      }`}
                    >
                      {item.note}
                    </span>
                  </div>

                  <p className="text-[13px] text-gray-500 mt-5">
                    {item.title}
                  </p>

                  <h3
                    className={`text-[25px] font-semibold mt-1 tracking-tight ${
                      item.danger
                        ? "text-[#E93D5B]"
                        : ""
                    }`}
                  >
                    {item.value}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* ANALYTICS */}
          <div className="grid grid-cols-[1fr_360px] gap-6 mt-10">
            {/* LEFT */}
            <div>
              <SectionTitle title="Performance & Trend Analytics" />

              <div className="grid grid-cols-2 gap-5">
                {/* AREA */}
                <Card title="Monthly Payroll Trend">
                  <p className="text-[12px] text-gray-500 mb-4">
                    Gross vs Net distribution over last
                    6 months
                  </p>

                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />

                        <Area
                          type="monotone"
                          dataKey="gross"
                          stroke="#4ED7C5"
                          fill="#D7FAF5"
                          strokeWidth={2}
                        />

                        <Area
                          type="monotone"
                          dataKey="net"
                          stroke="#7B61FF"
                          fill="#E5DDFF"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* BAR HORIZONTAL */}
                <Card title="Department Salary Distribution">
                  <p className="text-[12px] text-gray-500 mb-4">
                    Current month allocation by business
                    unit
                  </p>

                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={deptData}
                      >
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                        />

                        <Bar
                          dataKey="value"
                          fill="#B66BFF"
                          radius={[0, 6, 6, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* LINE */}
                <Card title="Weekly Overtime Trend">
                  <p className="text-[12px] text-gray-500 mb-4">
                    Fluctuations across June 2024
                  </p>

                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={overtimeData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#F5A623"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* PIE */}
                <Card title="Employee Category Payroll Split">
                  <p className="text-[12px] text-gray-500 mb-4">
                    Workforce composition impact
                  </p>

                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={splitData}
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {splitData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex justify-center gap-4 text-[12px] flex-wrap">
                    {splitData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: item.color,
                          }}
                        />

                        {item.name}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* RIGHT */}
            <div>
              <SectionTitle title="Risks & Alerts" badge="5" />

              <div className="space-y-4">
                {alerts.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#ECECF2] bg-white p-5"
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF4F6] flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#F0627B]" />
                        </div>

                        <div>
                          <h4 className="font-semibold text-[15px]">
                            {item.title}
                          </h4>

                          <p className="text-[13px] text-gray-500 mt-1 leading-5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* COMPLIANCE */}
                <div className="rounded-2xl bg-[#F4F1FF] border border-[#E4DDFF] p-6">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-[#6D58FF]" />

                    <h4 className="font-semibold">
                      Compliance Health
                    </h4>
                  </div>

                  <div className="text-[54px] font-semibold text-[#6D58FF] mt-3 leading-none">
                    98.4%
                  </div>

                  <p className="text-[11px] font-bold text-gray-500 tracking-wide mt-1">
                    AUDIT READINESS SCORE
                  </p>

                  <div className="mt-5 w-full h-2 rounded-full bg-[#DDD5FF] overflow-hidden">
                    <div className="w-[98%] h-full bg-[#6D58FF]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <SectionTitle title="Payroll Execution Summary" />

              <div className="flex gap-3">
                <SmallBtn
                  icon={Download}
                  label="Bank File"
                />

                <SmallBtn
                  icon={RotateCcw}
                  label="Reprocess"
                />

                <SmallBtn
                  icon={FileText}
                  label="Summary Report"
                />
              </div>
            </div>

            <div className="bg-white border border-[#ECECF2] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#FAFAFC] border-b border-[#ECECF2]">
                  <tr className="text-left text-[12px] uppercase tracking-wide text-gray-400">
                    <th className="px-5 py-4">
                      Batch ID
                    </th>

                    <th className="px-5 py-4">
                      Month / Cycle
                    </th>

                    <th className="px-5 py-4">
                      Entity & Location
                    </th>

                    <th className="px-5 py-4">
                      Emp Count
                    </th>

                    <th className="px-5 py-4">
                      Gross Total
                    </th>

                    <th className="px-5 py-4">
                      Net Total
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Personnel (M/C)
                    </th>

                    <th className="px-5 py-4">
                      Exec. Date
                    </th>

                    <th className="px-5 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payrollRows.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#F0F0F4] hover:bg-[#FAFAFC]"
                    >
                      <td className="px-5 py-5">
                        <div className="text-[#6D58FF] font-semibold text-[13px] leading-5">
                          {row.id}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="font-semibold">
                          {row.month}
                        </div>

                        <div className="text-[12px] text-gray-500">
                          Monthly
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="font-semibold">
                          {row.entity}
                        </div>

                        <div className="text-[12px] text-gray-500">
                          {row.dept}
                        </div>
                      </td>

                      <td className="px-5 py-5 font-semibold">
                        {row.emp}
                      </td>

                      <td className="px-5 py-5 font-semibold">
                        {row.gross}
                      </td>

                      <td className="px-5 py-5 font-semibold">
                        {row.net}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] font-medium ${row.statusColor}`}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-[12px] text-gray-600 leading-5">
                        <div>{row.manager}</div>
                        <div>{row.checker}</div>
                      </td>

                      <td className="px-5 py-5 text-[12px] text-gray-600 leading-5">
                        <div>{row.date}</div>

                        <div>
                          Payment: {row.payment}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between text-[12px] text-gray-500 mt-8">
            <div className="flex gap-6">
              <span>
                © 2024 Zenith Financial Systems
              </span>

              <span>Data Privacy Policy</span>

              <span>System Health: Normal</span>
            </div>

            <div className="flex gap-6">
              <span>● Server Sync: Live</span>

              <span>Last Updated: 2 mins ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* COMPONENTS */

function SidebarItem({
  icon: Icon,
  label,
  active,
}) {
  return (
    <button
      className={`w-full h-[52px] rounded-xl flex items-center gap-3 px-4 text-[15px] transition ${
        active
          ? "bg-[#EEE9FF] text-[#6D58FF] font-semibold"
          : "hover:bg-gray-100 text-gray-600"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function TopButton({ icon: Icon, label }) {
  return (
    <button className="h-[48px] px-5 rounded-xl border border-[#E5E7EB] bg-white flex items-center gap-2 font-medium">
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function FilterBox({ label }) {
  return (
    <button className="h-[50px] min-w-[160px] px-5 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-between text-[14px]">
      {label}

      <ChevronDown className="w-4 h-4 text-gray-500" />
    </button>
  );
}

function SectionTitle({ title, badge }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h3 className="text-[30px] font-semibold tracking-tight">
        {title}
      </h3>

      {badge && (
        <span className="px-2 py-1 rounded-full bg-[#F0F0F5] text-[11px] font-semibold">
          {badge}
        </span>
      )}

      <div className="flex-1 h-px bg-[#ECECF2]" />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-[#ECECF2] rounded-2xl p-5">
      <h4 className="font-semibold text-[18px]">
        {title}
      </h4>

      {children}
    </div>
  );
}

function SmallBtn({ icon: Icon, label }) {
  return (
    <button className="h-[42px] px-4 rounded-xl border border-[#E5E7EB] bg-white flex items-center gap-2 text-[14px] font-medium">
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}