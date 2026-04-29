"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tooltip } from "flowbite-react";
import { MdLayers, MdBusiness, MdPersonOutline, MdPersonAddAlt1 } from "react-icons/md";
import { FaPhoneAlt, FaUserTie, FaFileUpload, FaUsers, FaChevronRight, FaChevronLeft, FaSpinner, FaTimes } from "react-icons/fa";
import { BsPersonVcard } from "react-icons/bs";
import Swal from "sweetalert2";

const AddEmployee = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const employeeId = searchParams.get("id");
    const fileInputRef = useRef(null);

    const [loggedInRole, setLoggedInRole] = useState("admin");
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [prevStep, setPrevStep] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationType, setAnimationType] = useState("");
    const [skillInput, setSkillInput] = useState("");

    const sections = [
        { id: 1, name: "Basic Information", icon: MdPersonOutline },
        { id: 2, name: "Contact Details", icon: FaPhoneAlt },
        { id: 3, name: "Employment Details", icon: FaUserTie },
        { id: 4, name: "Identification Details", icon: BsPersonVcard },
        { id: 5, name: "Additional Info", icon: MdPersonAddAlt1 },
    ];

    // Master Data State
    const [centerList, setCenterList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [roleList, setRoleList] = useState(["Admin", "Manager", "Employee", "HR"]);
    const [managerList, setManagerList] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        employeeName: "",
        firstName: "",
        lastName: "",
        gender: "",
        dob: "",
        profilePhoto: "",
        employeeID: "",
        employeeEmail: "",
        personalEmail: "",
        employeeMobile: "",
        alternateContact: "",
        currentAddress: "",
        permanentAddress: "",
        isSameAddress: false,
        employeeDesignation: "",
        department_id: "",
        systemRole: "",
        doj: "",
        employmentType: "",
        reportingManager_id: "",
        center_id: "",
        assignedProjects: [],
        assignedClients: [],
        panNumber: "",
        aadhaarNumber: "",
        passportNumber: "",
        username: "",
        accessLevel: "",
        password: "",
        confirmPassword: "",
        skills: [],
        certifications: "",
        notes: ""
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (pathname.includes("admin")) setLoggedInRole("admin");
        getCenterList();
        getDepartmentList();
        getManagerList();
        if (employeeId) fetchEmployeeData(employeeId);
    }, [pathname, employeeId]);

    const fetchEmployeeData = async (id) => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/get/${id}`);
            if (res.data) {
                const data = res.data;
                setFormData({ 
                    ...formData, 
                    ...data,
                    doj: data.doj ? moment(data.doj).format("YYYY-MM-DD") : "",
                    dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : "",
                    skills: data.skills || []
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getCenterList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
            .then(res => setCenterList(res.data?.value || res.data || []))
            .catch(console.error);
    };

    const getDepartmentList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
            .then(res => setDepartmentList(res.data?.data || res.data?.value || res.data || []))
            .catch(console.error);
    };

    const getManagerList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/get/list`)
            .then(res => setManagerList(res.data?.value || res.data || []))
            .catch(console.error);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, profilePhoto: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput("");
        }
    };

    const removeSkill = (skill) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const triggerAnimation = (nextStep, type) => {
        setAnimationType(type);
        setPrevStep(currentStep);
        setCurrentStep(nextStep); // Move immediately for sidebar sync
        setIsAnimating(true);

        // Clear animation state after duration
        setTimeout(() => {
            setIsAnimating(false);
            setPrevStep(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
    };

    const checkStepValidity = (step) => {
        const errors = {};
        if (step === 1) {
            if (!formData.employeeID) errors.employeeID = "Required";
            if (!formData.firstName) errors.firstName = "Required";
            if (!formData.lastName) errors.lastName = "Required";
            if (!formData.gender) errors.gender = "Required";
        }
        if (step === 2) {
            if (!formData.employeeMobile) errors.employeeMobile = "Required";
            if (!formData.employeeEmail) errors.employeeEmail = "Required";
            if (!formData.currentAddress) errors.currentAddress = "Required";
        }
        if (step === 3) {
            if (!formData.department_id) errors.department_id = "Required";
            if (!formData.employeeDesignation) errors.employeeDesignation = "Required";
            if (!formData.systemRole) errors.systemRole = "Required";
            if (!formData.doj) errors.doj = "Required";
        }
        if (step === 4) {
            if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
                errors.panNumber = "Invalid PAN format (e.g. ABCDE1234F)";
            }
            if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber.replace(/\s/g, ""))) {
                errors.aadhaarNumber = "Aadhaar must be 12 digits";
            }
            if (formData.passportNumber && !/^[A-Z][0-9]{7}$/.test(formData.passportNumber)) {
                errors.passportNumber = "Invalid Passport format (e.g. A1234567)";
            }
        }
        if (step === 5) {
            // No mandatory fields as requested
        }
        return errors;
    };

    const validateStep = (step) => {
        const errors = checkStepValidity(step);
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleStepClick = (stepId) => {
        if (stepId < currentStep) triggerAnimation(stepId, "back");
        else if (stepId > currentStep && validateStep(currentStep)) triggerAnimation(stepId, "next");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            setLoading(true);
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/post`, {
                    ...formData,
                    employeeName: `${formData.firstName} ${formData.lastName}`
                });
                if (res.data) {
                    Swal.fire("Success!", "Employee saved.", "success");
                    router.push(`/${loggedInRole}/asset-management/employee-master`);
                }
            } catch (err) {
                Swal.fire("Error!", "Failed to save.", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const renderInput = (label, field, type = "text", placeholder = "", required = false) => (
        <div className="mb-4">
            <label className="admin-label">{label} {required && <span className="text-red-500">*</span>}</label>
            <input
                type={type}
                className="admin-input"
                placeholder={placeholder}
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            />
            {formErrors[field] && <p className="text-[10px] text-red-600 mt-1">{formErrors[field]}</p>}
        </div>
    );

    const renderStepContent = (step) => {
        switch (step) {
            case 1:
                return (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 md:col-span-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <div className="col-span-full">{renderInput("Employee ID", "employeeID", "text", "e.g. EMP1001", true)}</div>
                                {renderInput("First Name", "firstName", "text", "John", true)}
                                {renderInput("Last Name", "lastName", "text", "Doe", true)}
                                <div className="mb-4">
                                    <label className="admin-label">Gender <span className="text-red-500">*</span></label>
                                    <select className="admin-select" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    {formErrors.gender && <p className="text-[10px] text-red-600 mt-1">{formErrors.gender}</p>}
                                </div>
                                {renderInput("Date of Birth", "dob", "date")}
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4 flex flex-col items-center pt-6">
                            <label className="admin-label mb-2">Profile Photo</label>
                            <div onClick={() => fileInputRef.current.click()} className="w-40 h-40 border border-[#d2d6de] bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#3c8dbc] transition-all relative overflow-hidden group">
                                {formData.profilePhoto ? <img src={formData.profilePhoto} className="w-full h-full object-cover" /> : <div className="text-center"><FaFileUpload className="text-2xl text-gray-300 mx-auto mb-1" /><span className="text-[9px] font-bold text-gray-400 uppercase">Upload Photo</span></div>}
                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><span className="text-white text-[9px] font-bold uppercase tracking-widest">Change</span></div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 border-b border-[#eee] pb-3 mb-4">
                            <h3 className="text-lg font-bold text-[#333] m-0 uppercase tracking-tight">Step 2: Contact Information</h3>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Communication and address information.</p>
                        </div>
                        <div className="col-span-6">{renderInput("Mobile Number", "employeeMobile", "text", "+91 (555) 000-0000", true)}</div>
                        <div className="col-span-6">{renderInput("Alternate Contact", "alternateContact", "text", "+91 (555) 000-0000")}</div>
                        <div className="col-span-6">{renderInput("Official Email", "employeeEmail", "email", "jane.doe@company.com", true)}</div>
                        <div className="col-span-6">{renderInput("Personal Email", "personalEmail", "email", "jane.doe@gmail.com")}</div>

                        <div className="col-span-12">
                            <label className="admin-label">Current Address <span className="text-red-500">*</span></label>
                            <textarea
                                className="admin-input !h-24 py-2"
                                placeholder="Enter full current address"
                                value={formData.currentAddress}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        currentAddress: val,
                                        permanentAddress: prev.isSameAddress ? val : prev.permanentAddress
                                    }));
                                }}
                            />
                            {formErrors.currentAddress && <p className="text-[10px] text-red-600 mt-1">{formErrors.currentAddress}</p>}
                        </div>

                        <div className="col-span-12">
                            <div className="flex justify-between items-center mb-1">
                                <label className="admin-label !mb-0">Permanent Address</label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#3c8dbc] focus:ring-[#3c8dbc]"
                                        checked={formData.isSameAddress}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setFormData(prev => ({
                                                ...prev,
                                                isSameAddress: checked,
                                                permanentAddress: checked ? prev.currentAddress : prev.permanentAddress
                                            }));
                                        }}
                                    />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Same as Current Address</span>
                                </label>
                            </div>
                            <textarea
                                className="admin-input !h-24 py-2"
                                placeholder="Enter full permanent address"
                                value={formData.permanentAddress}
                                disabled={formData.isSameAddress}
                                onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 border-b border-[#eee] pb-3 mb-4">
                            <h3 className="text-lg font-bold text-[#333] m-0 uppercase tracking-tight">Step 3: Employment Details</h3>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Work role, location, and reporting structure.</p>
                        </div>

                        <div className="col-span-6">
                            <label className="admin-label">Department <span className="text-red-500">*</span></label>
                            <select className="admin-select" value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}>
                                <option value="">Select Department</option>
                                {departmentList.map(d => <option key={d._id} value={d._id}>{d.departmentName || d.department}</option>)}
                            </select>
                        </div>
                        <div className="col-span-6">{renderInput("Designation", "employeeDesignation", "text", "e.g. Senior Frontend Engineer", true)}</div>

                        <div className="col-span-6">
                            <label className="admin-label">System Role <span className="text-red-500">*</span></label>
                            <select className="admin-select" value={formData.systemRole} onChange={(e) => setFormData({ ...formData, systemRole: e.target.value })}>
                                <option value="">Select Role</option>
                                {roleList.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="col-span-6">{renderInput("Date of Joining", "doj", "date", "", true)}</div>

                        <div className="col-span-6">
                            <label className="admin-label">Employment Type <span className="text-red-500">*</span></label>
                            <select className="admin-select" value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}>
                                <option value="">Select Type</option>
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div className="col-span-6">
                            <label className="admin-label">Reporting Manager</label>
                            <select className="admin-select" value={formData.reportingManager_id} onChange={(e) => setFormData({ ...formData, reportingManager_id: e.target.value })}>
                                <option value="">Select Manager</option>
                                {managerList.map(m => <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>)}
                            </select>
                        </div>

                        <div className="col-span-12">
                            <label className="admin-label">Work Location</label>
                            <select className="admin-select" value={formData.center_id} onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}>
                                <option value="">Select Location (Center)</option>
                                {centerList.map(c => <option key={c._id} value={c._id}>{c.centerName || c.center}</option>)}
                            </select>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 border-b border-[#eee] pb-3 mb-4">
                            <h3 className="text-lg font-bold text-[#333] m-0 uppercase tracking-tight">Step 4: Identification Details</h3>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Government IDs and documentation.</p>
                        </div>
                        <div className="col-span-6">{renderInput("PAN Number", "panNumber", "text", "ABCDE1234F")}</div>
                        <div className="col-span-6">{renderInput("Aadhaar Number", "aadhaarNumber", "text", "1234 5678 9012")}</div>
                        <div className="col-span-6">{renderInput("Passport Number", "passportNumber", "text", "A1234567")}</div>
                    </div>
                );

            case 5:
                return (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 border-b border-[#eee] pb-3 mb-4">
                            <h3 className="text-lg font-bold text-[#333] m-0 uppercase tracking-tight">Step 5: Additional Info</h3>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Skills, certifications, and internal notes.</p>
                        </div>

                        <div className="col-span-12">
                            <label className="admin-label">Skills</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="admin-input flex-1"
                                    placeholder="Type a skill and press Enter..."
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                                />
                                <button type="button" onClick={addSkill} className="btn btn-default px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider border-[#d2d6de]">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map(skill => (
                                    <div key={skill} className="flex items-center gap-2 bg-[#f0f7ff] text-[#3c8dbc] border border-[#d6eaff] px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all hover:bg-[#d6eaff]">
                                        {skill}
                                        <FaTimes className="cursor-pointer hover:text-red-500" onClick={() => removeSkill(skill)} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-12">
                            <label className="admin-label">Certifications (Links or Titles)</label>
                            <textarea
                                className="admin-input !h-24 py-2"
                                placeholder="List relevant certifications..."
                                value={formData.certifications}
                                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                            />
                        </div>

                        <div className="col-span-12">
                            <label className="admin-label">Notes / Remarks</label>
                            <textarea
                                className="admin-input !h-24 py-2"
                                placeholder="Any internal notes regarding this employee..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section className="section admin-box box-primary overflow-hidden" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>

            {/* Theme-aligned Header */}
            <div className="mb-8 border-b border-slate-100 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1 text-[#3c8dbc]">
                            <span>Human Resources</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                            Add <span className="text-[#3c8dbc] font-black">Employee</span>
                        </h1>
                    </div>
                    <div className="flex gap-4 pt-4 md:pt-0">
                        <Tooltip content="Back to List" arrow={false} placement="bottom" className="bg-[#3c8dbc]">
                            <div
                                className="cursor-pointer text-[#3c8dbc] hover:text-white hover:bg-[#3c8dbc] border border-[#3c8dbc] p-2 rounded transition-all active:scale-95 shadow-sm flex items-center gap-2 text-xs font-bold uppercase"
                                onClick={() => router.push(`/${loggedInRole}/asset-management/employee-master`)}
                            >
                                <FaUsers className="text-lg" />
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                    Complete the wizard below to register a new employee into the system.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[600px] border border-[#eee] bg-[#f9f9f9]">
                {/* Sidebar Navigation with Smooth Sliding Indicator */}
                <div className="w-full lg:w-64 bg-[#fdfdfd] border-r border-[#eee] z-20 shadow-sm relative overflow-hidden">
                    <div className="p-5 border-b border-[#eee] bg-[#f9f9f9]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-gray-800 uppercase tracking-widest">Progress</span>
                            <span className="text-[10px] font-black text-[#3c8dbc]">{Math.round(((currentStep - 1) / (sections.length - 1)) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#eee] rounded-full overflow-hidden">
                            <div className="h-full bg-[#3c8dbc] transition-all duration-[0.8s] cubic-bezier(0.4, 0, 0.2, 1)" style={{ width: `${((currentStep - 1) / (sections.length - 1)) * 100}%` }} />
                        </div>
                    </div>

                    <div className="relative">
                        {/* Sliding Background Indicator */}
                        <div
                            className="absolute left-0 w-full bg-[#3c8dbc] transition-all duration-[0.8s] cubic-bezier(0.4, 0, 0.2, 1)"
                            style={{
                                height: '48px',
                                top: `${(currentStep - 1) * 48}px`,
                                zIndex: 0
                            }}
                        />

                        <div className="flex flex-col relative z-10">
                            {sections.map(s => {
                                const isDone = currentStep > s.id;
                                const isCurrent = currentStep === s.id;
                                const isClickable = isDone || isCurrent || (s.id === currentStep + 1 && Object.keys(checkStepValidity(currentStep)).length === 0);
                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => isClickable && handleStepClick(s.id)}
                                        className={`px-6 h-[48px] border-b border-[#f4f4f4] flex items-center gap-3 transition-colors duration-[0.8s] ${isCurrent ? 'text-white' : isDone ? 'bg-[#f0fff4]/60 text-green-700' : isClickable ? 'hover:bg-gray-50/50 cursor-pointer text-gray-600' : 'opacity-40 grayscale cursor-not-allowed text-gray-400'}`}
                                    >
                                        <div className={`w-5 h-5 flex items-center justify-center text-[9px] font-black border transition-all duration-[0.8s] ${isCurrent ? 'bg-white text-[#3c8dbc] border-white scale-110' : isDone ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {isDone ? '✓' : s.id}
                                        </div>
                                        <span className="text-[11px] font-bold uppercase tracking-tight flex-1">{s.name}</span>
                                        {isClickable && !isCurrent && <FaChevronRight className="text-[8px] opacity-30" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content Area with Dual Layer Animation */}
                <div className="flex-1 bg-white relative overflow-hidden">
                    {/* Previous Content Layer (Animating Out) */}
                    {prevStep && (
                        <div className={`absolute inset-0 p-8 ${animationType === "next" ? "stack-next-out" : "stack-back-out"}`}>
                            {renderStepContent(prevStep)}
                        </div>
                    )}

                    {/* Current Content Layer (Animating In) */}
                    <div className={`h-full flex flex-col p-8 ${isAnimating ? (animationType === "next" ? "stack-next-in" : "stack-back-in") : "opacity-100"}`}>
                        <form onSubmit={handleSubmit} className="h-full flex flex-col">
                            <div className="flex-1">
                                {renderStepContent(currentStep)}
                            </div>

                            <div className="mt-auto pt-6 border-t border-[#f4f4f4] flex justify-between items-center bg-white z-30">
                                {currentStep > 1 ? (
                                    <button type="button" onClick={() => triggerAnimation(currentStep - 1, "back")} className="btn btn-default px-4 py-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider border-[#d2d6de] shadow-sm">
                                        <FaChevronLeft /> Back
                                    </button>
                                ) : <div />}

                                <div className="flex gap-4 items-center">
                                    <button type="button" onClick={() => router.push(`/${loggedInRole}/asset-management/employee-master`)} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#3c8dbc]">Discard</button>
                                    {currentStep < 5 ? (
                                        <button 
                                            type="button" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if(validateStep(currentStep)) triggerAnimation(currentStep + 1, "next");
                                            }} 
                                            className="btn btn-primary !bg-[#3c8dbc] px-6 py-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider shadow-sm"
                                        >
                                            Proceed <FaChevronRight className="text-[10px]" />
                                        </button>
                                    ) : (
                                        <button type="submit" disabled={loading} className="btn btn-success !bg-[#00a65a] px-6 py-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                                            {loading ? <FaSpinner className="animate-spin" /> : <MdPersonAddAlt1 />} Submit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AddEmployee;
