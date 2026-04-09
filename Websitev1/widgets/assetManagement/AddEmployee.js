"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { CiViewList } from "react-icons/ci";
import { MdLayers, MdLocationOn, MdBusiness, MdPersonOutline, MdPersonAddAlt1 } from "react-icons/md";
import { FaSearch, FaEnvelope, FaPhoneAlt, FaUserTie, FaFileUpload, FaListUl, FaUserPlus, FaUsers } from "react-icons/fa";
import { BsPersonVcard, BsPlusSquare } from "react-icons/bs";
import ls from "localstorage-slim";
import Swal from "sweetalert2";
import { FaSpinner } from "react-icons/fa";

const AddEmployee = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const employeeId = searchParams.get("id");

    const [loggedInRole, setLoggedInRole] = useState("admin");
    const [loading, setLoading] = useState(false);

    // ── Master Data State ──
    const [centerList, setCenterList] = useState([]);
    const [subLocationList, setSubLocationList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [subDepartmentList, setSubDepartmentList] = useState([]);

    // ── Form State ──
    const [formData, setFormData] = useState({
        employeeName: "",
        employeeID: "",
        employee_id: "",
        employeeEmail: "",
        employeeMobile: "",
        employeeDesignation: "",
        center_id: "",
        centerName: "",
        subLocation_id: "",
        subLocationName: "",
        department_id: "",
        departmentName: "",
        subDepartment_id: "",
        subDepartmentName: ""
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (pathname.includes("admin")) {
            setLoggedInRole("admin");
        } else if (pathname.includes("center")) {
            setLoggedInRole("center");
        } else if (pathname.includes("asset")) {
            setLoggedInRole("asset");
        } else if (pathname.includes("account")) {
            setLoggedInRole("account");
        } else {
            setLoggedInRole("executive");
        }

        getCenterList();
        getDepartmentList();

        if (employeeId) {
            fetchEmployeeData(employeeId);
        }
    }, [pathname, employeeId]);

    const fetchEmployeeData = async (id) => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/get/${id}`);
            if (res.data) {
                const data = res.data;
                setFormData({
                    ...data,
                    center_id: data.center_id || "",
                    subLocation_id: data.subLocation_id || "",
                    department_id: data.department_id || "",
                    subDepartment_id: data.subDepartment_id || ""
                });

                if (data.center_id) getSubLocationList(data.center_id);
                if (data.department_id) getSubDepartmentList(data.department_id);
            }
        } catch (err) {
            console.error("Error fetching employee:", err);
        } finally {
            setLoading(false);
        }
    };

    const getCenterList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
            .then(res => setCenterList(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Error fetching centers:", err));
    };

    const getSubLocationList = (center_id) => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/location-subcategory/get`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setSubLocationList(data.filter(item => item.dropdown_id === center_id));
            })
            .catch(err => console.error("Error fetching sub-locations:", err));
    };

    const getDepartmentList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
            .then(res => setDepartmentList(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Error fetching departments:", err));
    };

    const getSubDepartmentList = (dept_id) => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subdepartment-master/get`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setSubDepartmentList(data.filter(item => item.dropdown_id === dept_id));
            })
            .catch(err => console.error("Error fetching sub-departments:", err));
    };

    const handleCenterChange = (e) => {
        const id = e.target.value;
        const center = centerList.find(c => c._id === id);
        setFormData({
            ...formData,
            center_id: id,
            centerName: center ? center.centerName : "",
            subLocation_id: "",
            subLocationName: ""
        });
        if (id) {
            getSubLocationList(id);
        } else {
            setSubLocationList([]);
        }
    };

    const handleDeptChange = (e) => {
        const id = e.target.value;
        const dept = departmentList.find(d => d._id === id);
        setFormData({
            ...formData,
            department_id: id,
            departmentName: dept ? dept.fieldValue : "",
            subDepartment_id: "",
            subDepartmentName: ""
        });
        if (id) {
            getSubDepartmentList(id);
        } else {
            setSubDepartmentList([]);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.employeeName) errors.employeeName = "Name is required";
        if (!formData.employeeID) errors.employeeID = "Employee ID is required";
        if (!formData.employeeEmail) errors.employeeEmail = "Email is required";
        if (!formData.employeeMobile) errors.employeeMobile = "Mobile is required";
        if (!formData.employeeDesignation) errors.employeeDesignation = "Designation is required";
        if (!formData.center_id) errors.center_id = "Center / Location is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/post`, {
                    ...formData,
                    _id: employeeId || undefined
                });
                if (res.data.employee_id) {
                    Swal.fire("Success!", `Employee ${employeeId ? "updated" : "added"} successfully.`, "success");
                    router.push(`/${loggedInRole}/management/employee-master`);
                }
            } catch (err) {
                console.error("Submit error:", err);
                Swal.fire("Error!", "Failed to save employee details.", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const SectionHeader = ({ title, subtitle }) => (
        <div className="mb-5 border-b border-gray-100 pb-2">
            <h3 className="text-[15px] font-bold text-black uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] font-normal text-gray-500">{subtitle}</p>
        </div>
    );

    const IconWrapper = ({ icon: Icon }) => (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm pr-2 border-r-2 border-gray-300">
                <Icon className="icon" />
            </span>
        </div>
    );

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md bg-white">
                <div className="uppercase text-xl font-semibold border-b-2 border-gray-300 flex justify-between px-10">
                    <div className="flex items-center gap-3 py-5">
                        {/* <FaUserPlus className="text-green-600" size={24} /> */}
                        <h1 className="text-2xl  text-gray-900 tracking-tight">{employeeId ? "Edit" : "Add"} Employee</h1>
                    </div>
                    <div className="flex gap-3 my-5 items-center">
                        <Tooltip content="Employee List" placement="bottom" className="bg-green" arrow={false}>
                            <FaUsers
                                className="cursor-pointer text-green hover:text-Green border border-green p-1 hover:border-Green rounded text-[30px]"
                                onClick={() => {
                                    router.push(`/${loggedInRole}/management/employee-master`);
                                }}
                            />
                        </Tooltip>
                    </div>
                </div>

                <div className="px-10 py-8 max-w-5xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Details */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-sm">
                            <SectionHeader title="Personal Details" subtitle="Enter employee identity and contact details." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="inputLabel mb-2 block">Full Name <span className="text-red-500">*</span></label>
                                    <div className="relative rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={MdPersonOutline} />
                                        <input
                                            type="text"
                                            className="stdInputField w-full pl-12"
                                            placeholder="Enter full name"
                                            value={formData.employeeName}
                                            onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                                        />
                                    </div>
                                    {formErrors.employeeName && <p className="text-xs text-red-500 mt-1">{formErrors.employeeName}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="inputLabel mb-2 block">Employee ID <span className="text-red-500">*</span></label>
                                        <div className="relative rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={MdPersonAddAlt1} />
                                            <input
                                                type="text"
                                                className="stdInputField w-full pl-12"
                                                placeholder="EMP-001"
                                                value={formData.employeeID}
                                                onChange={(e) => setFormData({ ...formData, employeeID: e.target.value })}
                                            />
                                        </div>
                                        {formErrors.employeeID && <p className="text-xs text-red-500 mt-1">{formErrors.employeeID}</p>}
                                    </div>
                                    <div>
                                        <label className="inputLabel mb-2 block">Internal ID</label>
                                        <div className="relative rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={BsPersonVcard} />
                                            <input
                                                type="text"
                                                className="stdInputField w-full pl-12"
                                                placeholder="INT-001"
                                                value={formData.employee_id}
                                                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-2 block">Email Address <span className="text-red-500">*</span></label>
                                    <div className="relative rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={FaEnvelope} />
                                        <input
                                            type="email"
                                            className="stdInputField w-full pl-12"
                                            placeholder="employee@hrms.com"
                                            value={formData.employeeEmail}
                                            onChange={(e) => setFormData({ ...formData, employeeEmail: e.target.value })}
                                        />
                                    </div>
                                    {formErrors.employeeEmail && <p className="text-xs text-red-500 mt-1">{formErrors.employeeEmail}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="inputLabel mb-2 block">Mobile No. <span className="text-red-500">*</span></label>
                                        <div className="relative rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={FaPhoneAlt} />
                                            <input
                                                type="text"
                                                className="stdInputField w-full pl-12"
                                                placeholder="10 digit mobile"
                                                value={formData.employeeMobile}
                                                maxLength={10}
                                                onChange={(e) => setFormData({ ...formData, employeeMobile: e.target.value.replace(/\D/g, "") })}
                                            />
                                        </div>
                                        {formErrors.employeeMobile && <p className="text-xs text-red-500 mt-1">{formErrors.employeeMobile}</p>}
                                    </div>
                                    <div>
                                        <label className="inputLabel mb-2 block">Designation <span className="text-red-500">*</span></label>
                                        <div className="relative rounded-md shadow-sm text-gray-500">
                                            <IconWrapper icon={FaUserTie} />
                                            <input
                                                type="text"
                                                className="stdInputField w-full pl-12"
                                                placeholder="e.g. Manager"
                                                value={formData.employeeDesignation}
                                                onChange={(e) => setFormData({ ...formData, employeeDesignation: e.target.value })}
                                            />
                                        </div>
                                        {formErrors.employeeDesignation && <p className="text-xs text-red-500 mt-1">{formErrors.employeeDesignation}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="border border-gray-200 rounded-lg p-5 shadow-sm">
                            <SectionHeader title="Work Location" subtitle="Assign the employee to specific operational areas." />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="inputLabel mb-2 block">Center / Location <span className="text-red-500">*</span></label>
                                    <div className="relative rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={MdLocationOn} />
                                        <select
                                            className="stdSelectField w-full pl-12"
                                            value={formData.center_id}
                                            onChange={(e) => {
                                                handleCenterChange(e);
                                                if (e.target.value) {
                                                    setFormErrors(prev => ({ ...prev, center_id: "" }));
                                                }
                                            }}
                                        >
                                            <option value="">-- Select Center --</option>
                                            {centerList.map(c => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                                        </select>
                                    </div>
                                    {formErrors.center_id && <p className="text-xs text-red-500 mt-1">{formErrors.center_id}</p>}
                                </div>
                                <div>
                                    <label className="inputLabel mb-2 block">Sub-Location</label>
                                    <div className="relative rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={MdLayers} />
                                        <select
                                            className="stdSelectField w-full pl-12"
                                            value={formData.subLocation_id}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                const sl = subLocationList.find(s => s._id === id);
                                                setFormData({ ...formData, subLocation_id: id, subLocationName: sl ? sl.inputValue : "" });
                                            }}
                                            disabled={!formData.center_id}
                                        >
                                            <option value="">-- Select Sub-Location --</option>
                                            {subLocationList.map(sl => <option key={sl._id} value={sl._id}>{sl.inputValue}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-2 block">Department</label>
                                    <div className="relative rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={MdBusiness} />
                                        <select
                                            className="stdSelectField w-full pl-12"
                                            value={formData.department_id}
                                            onChange={handleDeptChange}
                                        >
                                            <option value="">-- Select Department --</option>
                                            {departmentList.map(d => <option key={d._id} value={d._id}>{d.fieldValue}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="inputLabel mb-2 block">Sub-Department</label>
                                    <div className="relative rounded-md shadow-sm text-gray-500">
                                        <IconWrapper icon={MdLayers} />
                                        <select
                                            className="stdSelectField w-full pl-12"
                                            value={formData.subDepartment_id}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                const sd = subDepartmentList.find(s => s._id === id);
                                                setFormData({ ...formData, subDepartment_id: id, subDepartmentName: sd ? sd.inputValue : "" });
                                            }}
                                            disabled={!formData.department_id}
                                        >
                                            <option value="">-- Select Sub-Department --</option>
                                            {subDepartmentList.map(sd => <option key={sd._id} value={sd._id}>{sd.inputValue}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
                                {employeeId ? "Update" : "Add"} Employee
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AddEmployee;
