"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tooltip } from "flowbite-react";
import { MdHistory, MdFilterList, MdExpandMore } from "react-icons/md";
import { BsPlusSquare, BsInfoCircle } from "react-icons/bs";
import { FaPlus, FaFilter, FaCheck, FaTimes, FaFileUpload, FaCalendarCheck, FaHistory, FaClock, FaUser, FaDownload, FaUsers, FaUserCheck, FaUserTimes } from "react-icons/fa";
import moment from "moment";
import { useRouter, usePathname } from "next/navigation";
import ls from "localstorage-slim";
import Swal from "sweetalert2";
// import LeaveChatWidget from "./LeaveChatWidget";

const Leaves = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = React.useState("admin");
  const [activeTab, setActiveTab] = useState("Pending Requests");
  const [leaves, setLeaves] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(moment().format("MM"));
  const months = moment
    .months()
    .map((m, i) => ({ value: moment().month(i).format("MM"), label: m }));

  const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
  const years = Array.from({ length: 5 }, (_, i) =>
    (moment().year() - i).toString(),
  );

  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [summary, setSummary] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tableSearch, setTableSearch] = useState("");
  const [showCompOffModal, setShowCompOffModal] = useState(false);
  const [compOffData, setCompOffData] = useState({
    employeeId: "",
    dateWorked: moment().format("YYYY-MM-DD"),
    days: 1.0,
    reason: "",
  });

  useEffect(() => {
    const savedTab = localStorage.getItem("activeLeaveTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeLeaveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    if (pathname?.includes("admin")) setLoggedInRole("admin");
    else if (pathname?.includes("center")) setLoggedInRole("center");

    fetchEmployees();
    fetchLeaveTypes();
    fetchLeaves();
  }, [pathname]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchSummary(selectedEmployee);
    } else {
      setSummary(null);
    }
  }, [selectedEmployee, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchLedger();
    fetchMonthlyReport();
  }, [selectedEmployee, selectedMonth, selectedYear, selectedLeaveType]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/employees/get");
      if (Array.isArray(res.data)) setEmployees(res.data);
      else if (res.data?.data) setEmployees(res.data.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get("/api/leave-types");
      if (res.data.success) setLeaveTypes(res.data.data);
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/leave-applications");
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    try {
      const params = {
        month: selectedMonth,
        year: selectedYear,
      };
      const res = await axios.get("/api/leave-balance/monthly-report", {
        params,
      });
      if (res.data.success) {
        setMonthlyReport(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching monthly report:", err);
    }
  };

  const fetchLedger = async () => {
    try {
      let url = selectedEmployee
        ? `/api/leave-ledger/employee/${selectedEmployee}`
        : "/api/leave-ledger";

      const params = {
        month: selectedMonth,
        year: selectedYear,
        leaveTypeId: selectedLeaveType,
      };

      const res = await axios.get(url, { params });
      if (res.data.success) {
        setLedger(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ledger:", err);
    }
  };

  const fetchSummary = async (empId) => {
    try {
      const params = {
        month: selectedMonth,
        year: selectedYear,
      };
      const res = await axios.get(`/api/leave-balance/summary/${empId}`, {
        params,
      });
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${status.toLowerCase()} this leave request?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: status === "APPROVED" ? "#00a65a" : "#dd4b39",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${status.toLowerCase()} it!`,
      });

      if (result.isConfirmed) {
        const details = ls.get("userDetails", { decrypt: true });
        const res = await axios.patch(`/api/leave-applications/${id}`, {
          status,
          approvedBy: details?._id,
        });

        if (res.data.success) {
          Swal.fire({
            title: status === "APPROVED" ? "Approved!" : "Rejected!",
            text: `Leave request has been ${status.toLowerCase()}ed.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchLeaves();
          fetchLedger();
          fetchMonthlyReport();
          if (selectedEmployee) fetchSummary(selectedEmployee);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      Swal.fire("Error", "Something went wrong while updating status", "error");
    }
  };

  const handleCompOffSubmit = async (e) => {
    e.preventDefault();
    try {
      const details = ls.get("userDetails", { decrypt: true });
      const res = await axios.post("/api/leave-ledger/add-compoff", {
        ...compOffData,
        approvedBy: details?._id,
      });
      if (res.data.success) {
        setShowCompOffModal(false);
        fetchLedger();
        if (compOffData.employeeId) fetchSummary(compOffData.employeeId);
        setCompOffData({
          employeeId: "",
          dateWorked: moment().format("YYYY-MM-DD"),
          days: 1.0,
          reason: "",
        });
      }
    } catch (err) {
      alert(
        "Error adding Comp Off: " +
        (err.response?.data?.message || err.message),
      );
    }
  };

  const triggerManualAccrual = async () => {
    try {
      console.log("Triggering manual accrual...");
      const res = await axios.post("/api/leave-ledger/accrue-monthly");
      console.log("Accrual Response:", res.data);
      Swal.fire({
        title: "Accrual Successful",
        text: res.data.message || "Manual accrual completed successfully.",
        icon: "success",
        confirmButtonColor: "#00a65a",
      });
      fetchLedger();
      if (selectedEmployee) fetchSummary(selectedEmployee);
    } catch (err) {
      console.error("Accrual Error:", err);
      Swal.fire({
        title: "Accrual Error",
        text: err.response?.data?.message || err.message,
        icon: "error",
        confirmButtonColor: "#dd4b39",
      });
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (selectedEmployee && leave.employeeId?._id !== selectedEmployee)
      return false;
    if (
      selectedLeaveType !== "all" &&
      leave.leaveTypeId?._id !== selectedLeaveType
    )
      return false;

    if (activeTab === "Pending Requests") return leave.status === "PENDING";
    if (activeTab === "Approved") return leave.status === "APPROVED";
    if (activeTab === "Rejected") return leave.status === "REJECTED";
    return true;
  });

  const getStatusColor = (colorClass) => {
    const colors = {
      'bg-aqua': '#00c0ef',
      'bg-green': '#00a65a',
      'bg-red': '#dd4b39',
      'bg-yellow': '#f39c12'
    };
    return colors[colorClass] || colors['bg-aqua'];
  };

  const StatusCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="flex bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-none md:rounded-sm overflow-hidden h-24 border border-gray-200">
      <div
        style={{ backgroundColor: getStatusColor(colorClass) }}
        className="w-20 md:w-24 flex items-center justify-center text-white shrink-0"
      >
        <Icon size={36} className="text-white opacity-90" />
      </div>
      <div className="flex flex-col justify-center px-4 py-2 flex-grow overflow-hidden">
        <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1 line-clamp-2 leading-snug whitespace-normal break-words">
          {label}
        </span>
        <h3 className="text-2xl font-extrabold text-gray-800 leading-none">
          {value}
        </h3>
      </div>
    </div>
  );

  return (
    <section className="section admin-box box-primary ">
      <div className="hr-card hr-fade-in">
        <div className="mx-auto">
          {/* Header Row */}
          {/* Theme-aligned Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                  <span className="text-[#3c8dbc]">Leave Management</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                  Leave{" "}
                  <span className="text-[#3c8dbc] font-black">Management</span>
                </h1>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0 mb-1">
                <Tooltip
                  content="Run Accrual"
                  arrow={false}
                  placement="bottom"
                  className="bg-[#3c8dbc]"
                >
                  <div className="relative group">
                    <FaClock
                      className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1.5 hover:border-[#367fa9] rounded text-[34px] transition-all active:scale-95 shadow-sm"
                      onClick={triggerManualAccrual}
                    />
                  </div>
                </Tooltip>

                <Tooltip
                  content="Credit Comp Off"
                  arrow={false}
                  placement="bottom"
                  className="bg-[#3c8dbc]"
                >
                  <div className="relative group">
                    <FaCalendarCheck
                      className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1.5 hover:border-[#367fa9] rounded text-[34px] transition-all active:scale-95 shadow-sm"
                      onClick={() => setShowCompOffModal(true)}
                    />
                  </div>
                </Tooltip>

                <Tooltip
                  content="Apply Leave"
                  arrow={false}
                  placement="bottom"
                  className="bg-[#3c8dbc]"
                >
                  <div className="relative group">
                    <BsPlusSquare
                      className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1.5 hover:border-[#367fa9] rounded text-[34px] transition-all active:scale-95 shadow-sm"
                      onClick={() =>
                        router.push(`/${loggedInRole}/leaves/apply`)
                      }
                    />
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Monitor employee leave requests, manage balance accruals, and maintain a detailed history of all time-off transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard label="Total Requests" value={leaves.length} icon={FaUsers} colorClass="bg-aqua" />
          <StatusCard label="Pending Approval" value={leaves.filter(l => l.status === "PENDING").length} icon={FaClock} colorClass="bg-yellow" />
          <StatusCard label="Approved Leaves" value={leaves.filter(l => l.status === "APPROVED").length} icon={FaUserCheck} colorClass="bg-green" />
          <StatusCard label="Rejected Requests" value={leaves.filter(l => l.status === "REJECTED").length} icon={FaUserTimes} colorClass="bg-red" />
        </div>

        {/* Filters Bar */}
        <div className="bg-white">
          <div
            className="flex items-center gap-4 mb-2 cursor-pointer group select-none"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-2 text-slate-800 hover:text-[#3c8dbc] transition-colors">
              <MdFilterList className={`text-xl ${showFilters ? 'text-[#3c8dbc]' : 'text-slate-600'}`} />
              <span className="text-[11px] font-bold uppercase tracking-widest"> Show Filters</span>
            </div>
            <div className={`flex-1 h-[1px] ${showFilters ? 'bg-[#3c8dbc]/20' : 'bg-slate-100'} group-hover:bg-[#3c8dbc]/30 transition-colors`}></div>
            <MdExpandMore className={`text-xl transition-all duration-300 ${showFilters ? 'rotate-180 text-[#3c8dbc]' : 'text-slate-400 group-hover:text-slate-600'}`} />
          </div>

          <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100 mb-8 translate-y-0' : 'max-h-0 opacity-0 mb-0 -translate-y-4'
              }`}
          >
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 items-end pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Filter Employee
                </label>
                <select
                  className="admin-select h-10 font-bold w-full"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.employeeName} ({emp.employeeID})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Month
                </label>
                <select
                  className="admin-select h-10 w-full font-bold"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Year
                </label>
                <select
                  className="admin-select h-10 w-full font-bold"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Leave Type
                </label>
                <select
                  className="admin-select h-10 w-full font-bold uppercase"
                  value={selectedLeaveType}
                  onChange={(e) => setSelectedLeaveType(e.target.value)}
                >
                  <option value="all">All</option>
                  {leaveTypes
                    .filter((t) => ["EL", "CO"].includes(t.leaveCode))
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.leaveCode}
                      </option>
                    ))}
                </select>
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedEmployee("");
                    setSelectedMonth(moment().format("MM"));
                    setSelectedYear(moment().format("YYYY"));
                    setSelectedLeaveType("all");
                  }}
                  className="px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-[#3c8dbc] uppercase tracking-widest transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Box */}
        <div className="bg-white  shadow-sm flex flex-col mb-10">
          {/* Box Header with Tabs */}
          <div className="border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-white px-2">
            <div className="flex overflow-x-auto no-scrollbar">
              {[
                "Pending Requests",
                "Approved",
                "Rejected",
                "Employee Balances",
                "Leave Ledger",
                "All Records",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-[12px] font-bold transition-all relative whitespace-nowrap border-r border-gray-100 ${activeTab === tab
                    ? "bg-white text-gray-800 border-t-2 border-t-[#00a65a] -mt-[2px]"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                >
                  {tab}
                  {tab === "Pending Requests" &&
                    leaves.filter((l) => l.status === "PENDING").length >
                    0 && (
                      <span className="ml-2 bg-[#00a65a] text-white px-1.5 py-0.5 rounded-full text-[9px]">
                        {leaves.filter((l) => l.status === "PENDING").length}
                      </span>
                    )}
                </button>
              ))}
            </div>
            <div className="p-3 hidden md:block">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Current View: {activeTab}
              </h3>
            </div>
          </div>

          {/* DataTable Controls */}
          <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              Show
              <select className="border border-gray-300 rounded-sm px-1 py-1 focus:outline-none bg-white">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              entries
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700"></div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="admin-table">
              <thead className="admin-table-thead">
                <tr>
                  <th className="admin-table-th uppercase tracking-wider">
                    Employee
                  </th>
                  {activeTab === "Employee Balances" ? (
                    <>
                      <th className="admin-table-th uppercase tracking-wider text-center">
                        EL Balance
                      </th>
                      <th className="admin-table-th uppercase tracking-wider text-center">
                        CO Balance
                      </th>
                      <th className="admin-table-th uppercase tracking-wider text-center">
                        Net Balance
                      </th>
                      <th className="admin-table-th uppercase tracking-wider text-center text-red-600">
                        LOP
                      </th>
                      <th className="admin-table-th uppercase tracking-wider">
                        Action
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="admin-table-th uppercase tracking-wider">
                        Type
                      </th>
                      <th className="admin-table-th uppercase tracking-wider">
                        Date
                      </th>
                      <th className="admin-table-th uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="admin-table-th uppercase tracking-wider text-center">
                        Days
                      </th>
                      <th className="admin-table-th uppercase tracking-wider text-center">
                        Balance
                      </th>
                      <th className="admin-table-th uppercase tracking-wider">
                        Source
                      </th>
                      <th className="admin-table-th uppercase tracking-wider">
                        Remarks
                      </th>
                      {activeTab !== "Leave Ledger" && (
                        <th className="admin-table-th uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-5 py-20 text-center text-gray-400 text-xs italic"
                    >
                      Loading records...
                    </td>
                  </tr>
                ) : (() => {
                  let data =
                    activeTab === "Leave Ledger" ? ledger : filteredLeaves;
                  if (activeTab === "Employee Balances")
                    data = monthlyReport;

                  return data;
                })().length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-5 py-20 text-center text-gray-400 text-xs italic"
                    >
                      No records found{" "}
                      {selectedEmployee ? "for this employee" : ""}{" "}
                      {tableSearch ? `matching "${tableSearch}"` : ""}
                    </td>
                  </tr>
                ) : activeTab === "Employee Balances" ? (
                  monthlyReport
                    .filter(
                      (r) => !selectedEmployee || r._id === selectedEmployee,
                    )
                    .map((row) => (
                      <tr
                        key={row._id}
                        className="hover:bg-[#f5f5f5] transition-colors border-b border-gray-50"
                      >
                        <td className="admin-table-td">
                          <div className="text-[12px] font-bold text-slate-700">
                            {row.employeeName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {row.employeeID}
                          </div>
                        </td>
                        <td className="admin-table-td text-[12px] font-bold text-center">
                          {row.elBalance}
                        </td>
                        <td className="admin-table-td text-[12px] font-bold text-center">
                          {row.coBalance}
                        </td>
                        <td className="admin-table-td text-center">
                          <span
                            className={`text-[11px] font-bold ${row.totalBalance - row.lop < 0 ? "text-red-500" : "text-slate-800"}`}
                          >
                            {(() => {
                              const net = row.totalBalance - row.lop;
                              if (net < 0)
                                return `Deficit: ${Math.abs(net).toFixed(1)} ${Math.abs(net) === 1 ? "Day" : "Days"}`;
                              return net.toFixed(1);
                            })()}
                          </span>
                        </td>
                        <td className="admin-table-td text-center">
                          <span
                            className={`text-[11px] font-bold ${row.lop > 0 ? "text-red-600 bg-red-50 px-2 py-0.5 rounded" : "text-slate-300 italic"}`}
                          >
                            {row.lop > 0 ? row.lop : "0"}
                          </span>
                        </td>
                        <td className="admin-table-td">
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/leaves/ledger/${row._id}?month=${selectedMonth}&year=${selectedYear}`,
                              )
                            }
                            className="admin-btn-primary !px-3 !py-1 !text-[10px] font-black uppercase tracking-tight"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                ) : activeTab === "Leave Ledger" ? (
                  ledger.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-[#f5f5f5] transition-colors border-b border-gray-50"
                    >
                      <td className="admin-table-td">
                        <div className="text-[12px] font-bold text-slate-700">
                          {item.employeeId?.employeeName || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {item.employeeId?.employeeID || "N/A"}
                        </div>
                      </td>
                      <td className="admin-table-td">
                        <span className="text-[10px] font-black text-[#3c8dbc] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                          {item.leaveTypeId?.leaveCode || "Leave"}
                        </span>
                      </td>
                      <td className="admin-table-td text-[11px] text-slate-600 font-medium">
                        {moment(item.transactionDate).format("DD MMM YYYY")}
                      </td>
                      <td className="admin-table-td">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.days > 0
                            ? "bg-green-100 text-[#00a65a]"
                            : item.transactionType === "ADJUSTED"
                              ? "bg-blue-100 text-[#3c8dbc]"
                              : "bg-red-100 text-[#dd4b39]"
                            }`}
                        >
                          {item.days > 0
                            ? "Earned"
                            : item.transactionType === "ADJUSTED"
                              ? "Adjusted"
                              : "Used"}
                        </span>
                      </td>
                      <td className="admin-table-td text-center text-[12px] font-bold">
                        <span
                          className={
                            item.days > 0
                              ? "text-[#00a65a]"
                              : "text-[#dd4b39]"
                          }
                        >
                          {Math.abs(item.days)}
                        </span>
                      </td>
                      <td className="admin-table-td text-center">
                        <div className="text-[11px] font-bold text-slate-800 bg-slate-50 rounded px-2 py-1 inline-block border border-slate-200">
                          {item.balanceAfter}
                        </div>
                      </td>
                      <td className="admin-table-td">
                        <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded tracking-tighter">
                          {item.referenceType || "System"}
                        </span>
                      </td>
                      <td
                        className="admin-table-td text-[11px] text-slate-500 italic truncate max-w-[150px]"
                        title={item.remarks}
                      >
                        {item.remarks}
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredLeaves
                    .filter((item) => {
                      if (!tableSearch) return true;
                      const search = tableSearch.toLowerCase();
                      return (
                        (item.employeeId?.employeeName || "")
                          .toLowerCase()
                          .includes(search) ||
                        (item.employeeId?.employeeID || "")
                          .toLowerCase()
                          .includes(search) ||
                        (item.reason || "").toLowerCase().includes(search) ||
                        (item.leaveTypeId?.leaveCode || "")
                          .toLowerCase()
                          .includes(search)
                      );
                    })
                    .map((leave) => (
                      <tr
                        key={leave._id}
                        className="hover:bg-[#f5f5f5] transition-colors border-b border-gray-50"
                      >
                        <td className="admin-table-td">
                          <div className="text-[12px] font-bold text-slate-700">
                            {leave.employeeId?.employeeName || "Unknown"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {leave.employeeId?.employeeID || "N/A"}
                          </div>
                        </td>
                        <td className="admin-table-td">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                            {leave.leaveTypeId?.leaveCode || "Leave"}
                          </span>
                        </td>
                        <td className="admin-table-td text-[11px] text-slate-600 font-medium">
                          {moment(leave.fromDate).format("DD MMM")} -{" "}
                          {moment(leave.toDate).format("DD MMM YYYY")}
                        </td>
                        <td className="admin-table-td">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight text-white ${leave.status === "APPROVED"
                              ? "bg-[#00a65a]"
                              : leave.status === "REJECTED"
                                ? "bg-[#dd4b39]"
                                : "bg-[#f39c12]"
                              }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="admin-table-td text-center text-[12px] font-bold text-slate-700">
                          {leave.totalDays}
                        </td>
                        <td className="admin-table-td text-center">
                          <span className="text-[12px] font-bold text-slate-700">
                            {(() => {
                              const empBal = monthlyReport.find(
                                (r) => r._id === leave.employeeId?._id,
                              );
                              const code = leave.leaveTypeId?.leaveCode;
                              let balance = 0;
                              if (code === "EL")
                                balance = empBal?.elBalance ?? 0;
                              else if (code === "CO")
                                balance = empBal?.coBalance ?? 0;
                              else
                                balance =
                                  (empBal?.totalBalance || 0) -
                                  (empBal?.lop || 0);

                              if (balance < 0)
                                return `Deficit: ${Math.abs(balance).toFixed(1)}`;
                              return balance.toFixed(1);
                            })()}
                          </span>
                        </td>
                        <td className="admin-table-td">
                          <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded tracking-tighter">
                            Application
                          </span>
                        </td>
                        <td
                          className="admin-table-td text-[11px] text-slate-500 italic truncate max-w-[150px]"
                          title={leave.reason}
                        >
                          {leave.reason}
                        </td>
                        <td className="admin-table-td">
                          {leave.status === "PENDING" ? (
                            <div className="flex gap-2">
                              <Tooltip content="Approve" arrow={false} placement="top" className="bg-[#00a65a]">
                                <button
                                  onClick={() =>
                                    updateStatus(leave._id, "APPROVED")
                                  }
                                  className="bg-[#00a65a] text-white p-1.5 rounded-sm hover:shadow-md transition-all active:scale-95"
                                >
                                  <FaCheck size={12} />
                                </button>
                              </Tooltip>
                              <Tooltip content="Reject" arrow={false} placement="top" className="bg-[#dd4b39]">
                                <button
                                  onClick={() =>
                                    updateStatus(leave._id, "REJECTED")
                                  }
                                  className="bg-[#dd4b39] text-white p-1.5 rounded-sm hover:shadow-md transition-all active:scale-95"
                                >
                                  <FaTimes size={12} />
                                </button>
                              </Tooltip>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">
                              Finalized
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Area */}
          <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-50">
            <div className="text-xs text-gray-500">
              Found{" "}
              {
                (activeTab === "Leave Ledger" ? ledger : filteredLeaves)
                  .length
              }{" "}
              records
            </div>
            <div className="flex border border-gray-200 rounded-sm overflow-hidden shadow-sm">
              <button className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 border-r border-gray-200">
                Previous
              </button>
              <button className="px-3 py-1.5 text-xs bg-[#3c8dbc] text-white border-r border-gray-200">
                1
              </button>
              <button className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comp Off Modal */}
      {showCompOffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md border-t-[3px] border-[#3c8dbc]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                Credit Comp Off
              </h3>
              <button
                onClick={() => setShowCompOffModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCompOffSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Target Employee
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#3c8dbc] bg-white"
                  value={compOffData.employeeId}
                  onChange={(e) =>
                    setCompOffData({
                      ...compOffData,
                      employeeId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.employeeName} ({emp.employeeID})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Date Worked
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#3c8dbc]"
                    value={compOffData.dateWorked}
                    onChange={(e) =>
                      setCompOffData({
                        ...compOffData,
                        dateWorked: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Days to Credit
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#3c8dbc] bg-white"
                    value={compOffData.days}
                    onChange={(e) =>
                      setCompOffData({ ...compOffData, days: e.target.value })
                    }
                  >
                    <option value={1.0}>1.0 Full Day</option>
                    <option value={0.5}>0.5 Half Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Reason / Note
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#3c8dbc] min-h-[80px] resize-none"
                  placeholder="e.g. Worked on Sunday for monthly closing"
                  value={compOffData.reason}
                  onChange={(e) =>
                    setCompOffData({ ...compOffData, reason: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompOffModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#3c8dbc] text-white rounded text-xs font-bold hover:bg-[#367fa9] shadow-sm"
                >
                  Submit Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </section>
  );
};

export default Leaves;
