"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FaUserCircle, FaBriefcase, FaBuilding, FaIdCard, FaHistory, FaCheckCircle, FaTimes, FaEdit, FaUserSlash, FaUsers } from "react-icons/fa";
import { MdInfoOutline, MdContactPage, MdWork, MdLayers, MdVpnKey, MdAddCircleOutline } from "react-icons/md";
import moment from "moment";
import { Tooltip } from "flowbite-react";

const EmployeeProfileView = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const employeeId = searchParams.get("id");

    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Basic Info");
    const [loggedInRole, setLoggedInRole] = useState("admin");

    useEffect(() => {
        if (employeeId) {
            fetchEmployeeDetails();
        }
    }, [employeeId]);

    const fetchEmployeeDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/get/${employeeId}`);
            setEmployeeData(res.data);
        } catch (err) {
            console.error("Error fetching employee details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#3c8dbc]"></div></div>;
    if (!employeeData) return <div className="p-10 text-center text-red-500 font-bold">Employee not found.</div>;

    const tabs = [
        { id: "Basic Info", icon: <MdInfoOutline /> },
        { id: "Contact Info", icon: <MdContactPage /> },
        { id: "Employment", icon: <MdWork /> },
        { id: "Identification", icon: <FaIdCard /> },
        { id: "Additional Info", icon: <MdLayers /> }
    ];

    const InfoItem = ({ label, value, colSpan = 4, icon: Icon }) => (
        <div className={`mb-6 col-span-${colSpan} bg-gray-50/50 p-4 border border-gray-200 rounded-lg shadow-sm transition-all hover:border-[#3c8dbc]/30 group`}>
            <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className="text-[#3c8dbc] text-xs opacity-70 group-hover:opacity-100" />}
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
            </div>
            <p className="text-[13px] font-bold text-[#333] leading-tight break-words">{value || "—"}</p>
        </div>
    );

    return (
        <section className="section admin-box box-primary !p-8 min-h-screen" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>

            {/* Top Navigation / Breadcrumb Area */}
            <div className="mb-6 flex justify-between items-end border-b border-gray-300 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#3c8dbc]">
                        <span>Human Resources</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight m-0">
                        Employee <span className="text-[#3c8dbc] font-black">Profile</span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Tooltip content="Back to List" arrow={false} placement="bottom" className="bg-[#3c8dbc]">
                        <div
                            className="cursor-pointer text-[#3c8dbc] hover:text-white hover:bg-[#3c8dbc] border border-[#3c8dbc] p-2 rounded transition-all active:scale-95 shadow-sm flex items-center justify-center w-10 h-10"
                            onClick={() => router.push(`/${loggedInRole}/asset-management/employee-master`)}
                        >
                            <FaUsers className="text-lg" />
                        </div>
                    </Tooltip>
                </div>
            </div>

            {/* Header Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-[#fce7f3] flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                        {employeeData.profilePhoto ? (
                            <img src={employeeData.profilePhoto} className="w-full h-full object-cover" />
                        ) : (
                            <FaUserCircle className="w-24 h-24 text-[#f9a8d4]" />
                        )}
                    </div>
                    <div className="absolute bottom-2 right-3 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                        <h1 className="text-3xl font-bold text-[#333] m-0 tracking-tight uppercase">{employeeData.firstName} {employeeData.lastName}</h1>
                        <span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-green-200">Active</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-8 text-gray-500 text-sm">
                        <div className="flex items-center gap-2 font-bold"><FaBriefcase className="text-[#3c8dbc] opacity-50" /> {employeeData.employeeDesignation || "Designation Not Set"}</div>
                        <div className="flex items-center gap-2 font-bold"><FaBuilding className="text-[#3c8dbc] opacity-50" /> {employeeData.departmentName || "Department Not Set"}</div>
                        <div className="bg-[#f3f4f6] px-4 py-1.5 rounded text-[10px] font-black text-gray-700 border border-gray-200 tracking-widest uppercase">EMP ID: {employeeData.employeeID}</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-300 mb-0 bg-[#f9fafb] rounded-t-lg overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-8 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap border-r border-gray-200 ${activeTab === tab.id ? 'bg-white text-[#3c8dbc]' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                    >
                        <span className="text-base">{tab.icon}</span>
                        {tab.id}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#3c8dbc]"></div>}
                    </button>
                ))}
            </div>

            {/* Content Box */}
            <div className="bg-white rounded-b-lg shadow-sm border border-gray-300 border-t-0 p-10 min-h-[500px]">
                <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-100">
                    <div className="w-1.5 h-6 bg-[#3c8dbc] rounded-full"></div>
                    <h2 className="text-[15px] font-black text-black uppercase tracking-widest m-0">
                        {activeTab === "Basic Info" ? "Personal Identity" :
                            activeTab === "Contact Info" ? "Communication Details" :
                                activeTab === "Employment" ? "Career & Work Details" :
                                    activeTab === "Identification" ? "Document References" : "Additional Expertise"}
                    </h2>
                </div>

                <div className="grid grid-cols-12 gap-x-6">
                    {activeTab === "Basic Info" && (
                        <>
                            <InfoItem label="First Name" value={employeeData.firstName} icon={MdPersonOutline} />
                            <InfoItem label="Last Name" value={employeeData.lastName} icon={MdPersonOutline} />
                            <InfoItem label="Date of Birth" value={employeeData.dob ? moment(employeeData.dob).format("DD MMM YYYY") : "—"} icon={FaHistory} />
                            <InfoItem label="Gender" value={employeeData.gender} icon={FaUserCircle} />
                            <InfoItem label="Marital Status" value={employeeData.maritalStatus} />
                            <InfoItem label="Nationality" value={employeeData.nationality} />
                            <InfoItem label="Blood Group" value={employeeData.bloodGroup} />
                        </>
                    )}

                    {activeTab === "Contact Info" && (
                        <>
                            <InfoItem label="Mobile Number" value={employeeData.employeeMobile} icon={FaPhoneAlt} />
                            <InfoItem label="Alternate Contact" value={employeeData.alternateContact} />
                            <InfoItem label="Official Email" value={employeeData.employeeEmail} />
                            <InfoItem label="Personal Email" value={employeeData.personalEmail} />
                            <div className="col-span-12 mt-4 grid grid-cols-12 gap-6">
                                <InfoItem label="Current Residence" value={employeeData.currentAddress} colSpan={6} />
                                <InfoItem label="Permanent Residence" value={employeeData.permanentAddress} colSpan={6} />
                            </div>
                        </>
                    )}

                    {activeTab === "Employment" && (
                        <>
                            <InfoItem label="Department" value={employeeData.departmentName} icon={FaBuilding} />
                            <InfoItem label="Current Designation" value={employeeData.employeeDesignation} icon={FaBriefcase} />
                            <InfoItem label="Joining Date" value={employeeData.doj ? moment(employeeData.doj).format("DD MMM YYYY") : "—"} icon={FaCalendarCheck} />
                            <InfoItem label="Employment Type" value={employeeData.employmentType} />
                            <InfoItem label="Reporting Manager" value={employeeData.reportingManager_id} />
                            <InfoItem label="Work Hub / Center" value={employeeData.centerName} />
                        </>
                    )}

                    {activeTab === "Identification" && (
                        <>
                            <InfoItem label="PAN Card Number" value={employeeData.panNumber} icon={BsPersonVcard} />
                            <InfoItem label="Aadhaar Card Number" value={employeeData.aadhaarNumber} icon={FaIdCard} />
                            <InfoItem label="Passport Reference" value={employeeData.passportNumber} />
                        </>
                    )}

                    {activeTab === "Additional Info" && (
                        <div className="col-span-12">
                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 mb-8">
                                <label className="text-[10px] font-black text-[#3c8dbc] uppercase tracking-widest mb-4 block">Professional Skills & Tools</label>
                                <div className="flex flex-wrap gap-2">
                                    {(employeeData.skills && employeeData.skills.length > 0 ? employeeData.skills : ["General Skills"]).map(skill => (
                                        <span key={skill} className="bg-white text-[#3c8dbc] border border-[#d6eaff] px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 md:col-span-6">
                                    <InfoItem label="Certifications & Awards" value={employeeData.certifications} colSpan={12} icon={FaUserTie} />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <InfoItem label="Internal HR Notes" value={employeeData.notes} colSpan={12} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </section>
    );
};

export default EmployeeProfileView;


