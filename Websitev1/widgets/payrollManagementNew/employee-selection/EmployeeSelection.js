"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
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
import FilterTable from "@/widgets/GenericTable/FilterTableWithCheckBox";
import { FaUser } from "react-icons/fa";
import Swal from "sweetalert2";

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
  options,
  value,
  onChange,
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
        {label}
      </p>

      <select
        value={value}
        onChange={onChange}
        className="mt-2 w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
      >
        <option value="">
          - Select -
        </option>

        {options.map((option) => (
          <option
            key={option.label}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxMultiSelect({
  label,
  options = [],
  selectedValues = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef();

  const toggleOption = (value) => {

    let updatedValues = [];

    if (selectedValues.includes(value)) {
      updatedValues = selectedValues.filter(
        (item) => item !== value
      );
    } else {
      updatedValues = [
        ...selectedValues,
        value,
      ];
    }
    onChange(updatedValues);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <label className="block mb-1 text-sm font-medium">
        {label}
      </label>

      <div
        onClick={() => setOpen(!open)}
        className="border rounded-lg px-3 py-2 cursor-pointer"
      >
        {selectedValues.length > 0
          ? selectedValues.join(", ")
          : "Select"}
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full border rounded-lg bg-white shadow">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(
                  option
                )}
                onChange={() =>
                  toggleOption(option)
                }
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// function CheckboxMultiSelect({
//   label,
//   options = [],
// }) {
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState([]);

//   const dropdownRef = useRef();

//   const toggleOption = (value) => {
//     if (selected.includes(value)) {
//       setSelected(
//         selected.filter(
//           (item) => item !== value
//         )
//       );
//     } else {
//       setSelected([
//         ...selected,
//         value,
//       ]);
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target)
//       ) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);


//   return (
//     <div className="relative flex flex-col gap-2" ref={dropdownRef}>
//       <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
//         {label}
//       </label>

//       {/* Trigger */}
//       <button
//         type="button"
//         onClick={() =>
//           setOpen(!open)
//         }
//         className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm flex items-center justify-between"
//       >
//         <span className="truncate text-left">
//           {selected.length > 0
//             ? selected.join(", ")
//             : `Select ${label}`}
//         </span>

//         <ChevronDown className="w-4 h-4 text-gray-500" />
//       </button>

//       {/* Dropdown */}
//       {open && (
//         <div className="absolute top-[72px] left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-4 max-h-[240px] overflow-y-auto">
//           <div className="flex flex-col gap-3">
//             {options.map(
//               (item, index) => (
//                 <label
//                   key={index}
//                   className="flex items-center gap-3 cursor-pointer"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selected.includes(
//                       item
//                     )}
//                     onChange={() =>
//                       toggleOption(
//                         item
//                       )
//                     }
//                     className="w-4 h-4 rounded border-gray-300 text-blue-600"
//                   />

//                   <span className="text-sm text-gray-700">
//                     {item}
//                   </span>
//                 </label>
//               )
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

function StatusBadge({ text }) {
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap max-w-fit ${getBadge(
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

export default function EmployeeSelection() {

  const router = useRouter();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // First day of current month
  const firstDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  //console.log("firstDate:", firstDate);
  // Last day of current month
  const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  //console.log("lastDate:", lastDate);

  // Format as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const firstDateISO = formatDate(firstDate);
  const lastDateISO = formatDate(lastDate);

  // console.log("firstDateISO:", firstDateISO);
  // console.log("lastDateISO:", lastDateISO);

  const [payrollMonth, setPayrollMonth] = useState(currentMonth);
  const [payrollYear, setPayrollYear] = useState(currentYear);
  const [startDate, setStartDate] = useState(firstDateISO);
  const [endDate, setEndDate] = useState(lastDateISO);

  const [businessUnits, setBusinessUnits] = useState([]);
  const [centerLocation, setcenterLocation] = useState([]);
  const [department, setDepartment] = useState([]);
  const [jobType, setJobType] = useState([]);
  const [jobTiming, setJobTiming] = useState([]);
  const [designation, setDesignation] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [employeeDataCount, setEmployeeDataCount] = useState(0);
  // ── Stores array of {employeeID, employeeName} objects for selected employees ──
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedEmployeesCount, setSelectedEmployeesCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [workingDays, setWorkingDays] = useState([]);
  // const [selectedEmployees, setSelectedEmployees] = useState([]);   

  // ── FilterTable required states ──
  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState({});


  const [filters, setFilters] = useState({
    payrollMonth: payrollMonth,
    payrollYear: payrollYear,
    startDate: startDate,
    endDate: endDate,
    businessUnit: [],
    location: [],
    department: [],
    designation: [],
    jobtype: [],
    jobtiming: [],
  });

  const [appliedFilters, setAppliedFilters] = useState(null);

  const applyFilters = () => {
    setAppliedFilters(filters);
    getMonthDetails(filters.payrollmonth);
    getEmployeeList();
  };

  // Total Month & Working days

  const [monthDetails, setMonthDetails] =
    useState({
      totalDays: 0,
      workingDays: 0,
    });

  const getMonthDetails = (
    monthName
  ) => {
    const monthIndex = new Date(
      `${monthName} 1`
    ).getMonth();

    // Total Days
    const totalDays = new Date(
      2026,
      monthIndex + 1,
      0
    ).getDate();

    // Working Days
    let workingDays = 0;

    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {
      const date = new Date(
        2026,
        monthIndex,
        day
      );

      const weekDay =
        date.getDay();

      if (
        weekDay !== 0 &&
        weekDay !== 6
      ) {
        workingDays++;
      }
    }

    setMonthDetails({
      totalDays,
      workingDays,
    });
  };


  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const getBusinessUnits = async () => {
    try {
      const response = await axios.get(
        "/api/business-unit-master/get"
      );
      setBusinessUnits(response.data);
    } catch (error) {
      console.log(error);
    }
  };


  const getLocations = async () => {
    try {
      const response = await axios.get(
        "/api/centers/list"
      );
      setcenterLocation(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getDepartment = async () => {
    try {
      const response = await axios.get(
        "/api/payroll/prdept"
      );
      setDepartment(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getJobType = async () => {
    try {
      const response = await axios.get(
        "/api/job-type-master/get"
      );
      setJobType(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getJobTiming = async () => {
    try {
      const response = await axios.get(
        "/api/job-timing-master/get"
      );
      setJobTiming(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getDesignation = async () => {
    try {
      const response = await axios.get(
        "/api/designation-master/get"
      );
      setDesignation(response.data);
    } catch (error) {
      console.log(error);
    }
  };


  const getEmployeeCount = () => {
    axios.get("/api/employees/get").then((res) => {
      setEmployeeDataCount(res.data.length);
    }).catch((err) => {
      Swal.fire({
        icon: "error",
        title: "Error fetching employee count",
        text: err.message,
      });
    });
  }

  //  old api 
  // const getEmployeeList = () => {
  //   axios.post("/api/employees/filter", { ...filters }).then((res) => {
  //     let empData = res.data.data;
  //     setEmployeeData(empData || []);
  //     setSelectedEmployeesCount(empData.length || 0);
  //     const allEmployeeIds = empData.map((emp) => { return { employeeID: emp.employeeID, employeeName: emp.employeeName }; });
  //     setSelectedEmployees(allEmployeeIds);
  //   }).catch((err) => {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error fetching employee count",
  //       text: err.message,
  //     });


  useEffect(() => {
    getEmployeeList();
    getMonthDetails(payrollMonth);
  }, [pageNumber, recsPerPage, runCount, searchText, filters]);


  const getEmployeeList = async () => {
    setLoading(true);
    const formValues = {
      searchText: searchText,
      pageNumber: pageNumber,
      recsPerPage: recsPerPage,
      ...filters,
    };
    setFilterData(formValues);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/list/${recsPerPage}/${pageNumber}`,
        formValues
      );

      if (response.data) {
        const formattedData = (response.data.tableData || []).map((emp) => ({
          ...emp,
          employeeID: emp.employeeID || "-", // Handle null/undefined employeeID
          formattedEmpID: `<span style="color:#3b82f6; font-weight:600;">${emp.employeeID || "-"}</span>`,
          employeeEmail: `
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:13px; color:#111827; font-weight:500;">${emp.employeeEmail || "-"}</span>
              <span style="font-size:12px; color:#6b7280;">${emp.employeeMobile || "-"}</span>
            </div>
          `,
        }));
        setTableData(formattedData);
        setTotalRecs(response.data.totalRecs || 0);
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error fetching employees", text: err.message });
    } finally {
      setLoading(false);
    }
  };


  // ── Reset filters ──

  const resetFilters = () => {
    setFilters({
      payrollmonth: "",
      payrollyear: "",
      startdate: "",
      enddate: "",
      businessunit: [],
      location: [],
      department: [],
      designation: [],
      jobtype: [],
      jobtiming: [],
    });
    setPageNumber(1);
    setSearchText("-");
  };

  useEffect(() => {
    getBusinessUnits();
    getLocations();
    getDepartment();
    getJobType();
    getJobTiming();
    getDesignation();
    getEmployeeCount();

  }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        payrollMonth: payrollMonth,
        payrollYear: payrollYear,
        payrollStartDate: startDate,
        payrollEndDate: endDate,
        businessUnits: filters.businessunit,
        locations: filters.location,
        departments: filters.department,
        designations: filters.designation,
        jobTypes: filters.jobtype,
        jobTimings: filters.jobtiming,
        remarks: "",  
        createdBy: {
          userId: 101, // replace with logged-in user id
          userName: "Admin", // replace with logged-in username
        },
        employeeData: selectedEmployees,
      };

      const response = await axios.post(
        `/api/payroll-management/create-payroll-batch?month=${payrollMonth}&year=${payrollYear}`,
        payload
      );

      console.log("Payroll Batch Created:", selectedEmployees);

      // Save batch id for next step

      const batchId = response.data.payrollBatchId; // adjust according to API response
      console.log('bid', batchId)

      if (batchId) {
        router.push(`/admin/payrollManagementNew/preview/${batchId}`);
      }

      localStorage.setItem(
        "payrollBatchId",
        batchId
      );

      alert("Payroll Batch Created Successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const tableHeading = {
    formattedEmpID: "Employee ID",
    employeeName: "Employee Name",
    employeeEmail: "Email & Mobile",
    businessUnit: "Business Unit",
    departmentName: "Department",
    subDepartmentName: "Sub Department",
    // employeeDesignation: "Designation",
    centerName: "Location",
    jobType: "Job Type",
    jobTiming: "Job Timing",
    reportingManagerName: "Reporting Manager",
    // employeeEmail: "Email",
    // employeeMobile: "Mobile",
  };

  const excelHeading = {
    employeeName: "Employee Name",
    employeeID: "Employee ID",
    businessUnit: "Business Unit",
    departmentName: "Department",
    employeeDesignation: "Designation",
    centerName: "Location",
    jobType: "Job Type",
    jobTiming: "Job Timing",
    employeeEmail: "Email",
    employeeMobile: "Mobile",
  };

  const tableObjects = {
    apiURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/employees`,
    downloadURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/list/${recsPerPage}/${pageNumber}`,
    getListMethod: "post",
    searchApply: true,
    downloadApply: true,
    titleMsg: "Payroll Employee Selection",
    tableName: "Employee List",
  };


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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${index === 0
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`text-sm font-medium ${index === 0
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
        </div >
      </div >

      {/* Main */}
      < div className="p-8" >
        {/* Title */}
        <div className="mb-7" >
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
                { label: "January", value: 1 },
                { label: "February", value: 2 },
                { label: "March", value: 3 },
                { label: "April", value: 4 },
                { label: "May", value: 5 },
                { label: "June", value: 6 },
                { label: "July", value: 7 },
                { label: "August", value: 8 },
                { label: "September", value: 9 },
                { label: "October", value: 10 },
                { label: "November", value: 11 },
                { label: "December", value: 12 },
              ]}

              value={filters.payrollMonth}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  payrollMonth: e.target.value,
                }))
              }
            />

            {/* Payroll Year */}
            <SelectField
              label="Payroll Year"
              options={Array.from(
                { length: 7 },
                (_, index) => ({
                  value: (
                    new Date().getFullYear() - 3 + index
                  ).toString(),
                  label: (
                    new Date().getFullYear() - 3 + index
                  ).toString(),
                })
              )}
              value={payrollYear}
              onChange={(e) =>
                setPayrollYear(e.target.value)
              }

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
                  value={startDate}
                  onChange={(e) =>
                    setStartDate((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
                />
                {/* <CalendarRange className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" /> */}
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
                  value={endDate}
                  onChange={(e) =>
                    setEndDate((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
                />

                {/* <CalendarRange className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" /> */}
              </div>
            </div>
          </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-5">
            <div className="grid grid-cols-4 gap-5">
            {/* Business Unit */}
            <CheckboxMultiSelect
              label="Business Unit"
              name="businessUnit"
              options={businessUnits.map(
                (item) => item.fieldValue
              )}
              selectedValues={filters.businessunit}
              onChange={(values) =>
                setFilters((prev) => ({
                  ...prev,
                  businessunit: values,
                }))
              }
            />

            {/* Location */}
            <CheckboxMultiSelect
              label="Location"
              name="location"
              options={centerLocation.map(
                (item) => item.centerName
              )}
              selectedValues={filters.location}
              onChange={(values) =>
                setFilters((prev) => ({
                  ...prev,
                  location: values,
                }))
              }
            />

            {/* Department */}

            <CheckboxMultiSelect
              label="Department"
              name="department"
              options={department.map(
                (item) => item.fieldValue
              )}
              selectedValues={filters.department}
              onChange={(values) =>
                setFilters((prev) => ({
                  ...prev,
                  department: values,
                }))
              }
            />

            {/* Designation */}
            <CheckboxMultiSelect
              label="Designation"
              name="designation"
              options={designation.map(
                (item) => item.fieldValue
              )}
              selectedValues={filters.designation}
              onChange={(values) =>
                setFilters((prev) => ({
                  ...prev,
                  designation: values,
                }))
              }
            />

            {/* Job Type */}
            <CheckboxMultiSelect
              label="Job Type"
              name="jobType"
              options={jobType.map(
                (item) => item.fieldValue
              )}
              selectedValues={filters.jobtype}
              onChange={(values) =>
                setFilters((prev) => ({
                  ...prev,
                  jobtype: values,
                }))
              }
            />

            {/* Job Timing */}
            <CheckboxMultiSelect
              label="Job Timing"
              name="jobTiming"
              options={jobTiming.map(
                (item) => item.fieldValue
              )}
              selectedValues={filters.jobtiming}
              onChange={(values) =>
                setFilters((prev) => ({
                  ...prev,
                  jobtiming: values,
                }))
              }
            />


            {/* Search */}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium  tracking-wide ">
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
          </div >

          <div className="mt-6">
            <button
              onClick={applyFilters}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mt-6" >
          <StatCard
            icon={
              <CalendarDays className="w-5 h-5" />
            }
            title="Calendar Days"
            value={monthDetails.totalDays}
            sub="Fixed"
          />

          <StatCard
            icon={
              <Clock3 className="w-5 h-5" />
            }
            title="Working Days"
            value={monthDetails.workingDays}
            sub="+1 vs May"
          />

          <StatCard
            icon={
              <Users className="w-5 h-5" />
            }
            title="Total Employees"
            value={employeeDataCount || "0"}
            sub="System Wide"
          />

          <StatCard
            icon={
              <ShieldCheck className="w-5 h-5" />
            }
            title="Filtered Employees"
            value={totalRecs || "0"}
            sub="Selected for Payroll"
          />
        </div>

        {/* Employee Table */}
        < div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden" >
          <div className="overflow-x-auto">

            <div className="p-6 border-b border-gray-200">
              <FilterTable
                tableHeading={tableHeading}
                excelHeading={excelHeading}
                tableObjects={tableObjects}
                getData={getEmployeeList}
                tableData={tableData}
                setTableData={setTableData}
                recsPerPage={recsPerPage}
                setRecsPerPage={setRecsPerPage}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                searchText={searchText}
                setSearchText={setSearchText}
                totalRecs={totalRecs}
                setTotalRecs={setTotalRecs}
                numOfPages={numOfPages}
                setNumOfPages={setNumOfPages}
                runCount={runCount}
                setRunCount={setRunCount}
                filterData={filterData}
                loading={loading}
                checkboxSelection={true}
                // selectedRows={selectedEmployees}
                // ── Extract just IDs for GenericTable to compare against rowIdKey ──
                selectedRows={selectedEmployees.map((e) => e.employeeID)}
                rowIdKey="employeeID"
                // onSelectAll={(e) => {
                //   // Select or deselect all rows on current page
                //   if (e.target.checked) {
                //     setSelectedEmployees(tableData.map((emp) => emp.employeeID));
                //   } else {
                //     setSelectedEmployees([]);
                //   }
                // }}
                onSelectAll={(e) => {
                  if (e.target.checked) {
                    // ── Store full objects {employeeID, employeeName} for all rows ──
                    const allEmployees = tableData.map((emp) => ({
                      employeeID: emp.employeeID,
                      employeeName: emp.employeeName,
                    }));
                    // console.log("All Employees:", allEmployees);
                    setSelectedEmployees(allEmployees);
                  } else {
                    // ── Deselect all ──
                    setSelectedEmployees([]);
                  }
                }}
                // onRowSelect={(id) => {
                //   // Toggle individual row selection
                //   setSelectedEmployees((prev) =>
                //     prev.includes(id)
                //       ? prev.filter((empId) => empId !== id)
                //       : [...prev, id]
                //   );
                // }}
                onRowSelect={(id) => {
                  // ── Find the full employee record from tableData using employeeID ──
                  const emp = tableData.find((e) => e.employeeID === id);
                  // console.log("Selected Employee:", emp);
                  if (!emp) return;

                  setSelectedEmployees((prev) => {
                    const alreadySelected = prev.some((e) => e.employeeID === id);
                    // console.log("Already Selected:", alreadySelected);
                    if (alreadySelected) {
                      // ── Remove from array if already selected ──
                      return prev.filter((e) => e.employeeID !== id);
                    } else {
                      // ── Add {employeeID, employeeName} object to array ──
                      return [...prev, { employeeID: emp.employeeID, employeeName: emp.employeeName }];
                    }
                  });
                }}
              />
            </div>

            {/* old table with checkbox  */}
            {/* <table className="w-full min-w-[1600px] border-collapse table-auto">
              Head
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left ">
                    <input
                      type="checkbox"
                      checked={
                        employeeData.length > 0 &&
                        selectedEmployees.length === employeeData.length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    EMP ID
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Name & Role
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Email & Mobile
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Department
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Business Unit
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Job Timing
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Job Type
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Location
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Attendance
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Salary
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Eligibility
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              Body
              <tbody>
                {employeeData.map((emp, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        // defaultChecked
                        checked={selectedEmployees.includes(emp.employeeID)}
                        onChange={() => handleSelectEmployee(emp.employeeID)}
                        className="w-4 h-4 rounded"
                      />
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-blue-600 whitespace-nowrap">
                      {emp?.employeeID || "EMP001"}
                    </td>

                    <td className="px-6 py-5 min-w-[260px]">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" >
                          <FaUser className="w-6 h-6 text-blue-500 mx-auto mt-2" />
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {emp?.employeeName || "John Doe"}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            {emp?.employeeDesignation || "Software Engineer"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                          {emp?.employeeEmail || "-"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {emp?.employeeMobile || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700 whitespace-nowrap">
                      {emp?.departmentName || "Engineering"}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700 whitespace-nowrap">
                      {emp?.businessUnit || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700 whitespace-nowrap">
                      {emp?.jobTiming || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700 whitespace-nowrap">
                      {emp?.jobType || "Intern"}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700 whitespace-nowrap">
                      {emp?.centerName || "Pune"}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        {emp.jobType.map((item, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700 font-medium w-fit whitespace-nowrap"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <StatusBadge text={emp?.attendance || "Completed"} />
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <StatusBadge text={emp?.salary || "Active"} />
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <StatusBadge text={emp?.eligibility || "Eligible"} />
                    </td>

                    <td className="px-6 py-5">
                      <button>
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> */}
          </div >
        </div >

        {/* Footer */}
        < div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between" >
          {/* Left */}
          < div className="flex items-center gap-8" >
            <div>
              <p className="text-[11px] uppercase text-gray-500 font-semibold">
                Current Selection
              </p>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedEmployees.length}{" "}
                {selectedEmployees.length === 1
                  ? "Employee"
                  : "Employees"}{" "}
                Selected
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
          </div >

          {/* Right */}
          <div className="flex items-center gap-4" >
            <button
              onClick={handleSubmit}
              // onClick={() => {
              //    // ── Log selected employees array for verification ──
              //   console.log("Selected Employees for Payroll:", selectedEmployees);
              // }} 
              className="h-11 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow">
              Proceed to Payroll Preview
            </button>
          </div>
        </div >
      </div >
    </div >

  );
}