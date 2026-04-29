"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FaUserCircle, FaBriefcase, FaBuilding, FaIdCard, FaHistory, FaCheckCircle, FaTimes, FaEdit, FaUserSlash, FaUsers, FaPhoneAlt, FaCalendarCheck, FaGraduationCap, FaMapMarkerAlt, FaIdBadge, FaUserTie } from "react-icons/fa";
import { MdInfoOutline, MdContactPage, MdWork, MdLayers, MdVpnKey, MdAddCircleOutline, MdPersonOutline } from "react-icons/md";
import { BsPersonVcard } from "react-icons/bs";
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

    const InfoItem = ({ label, value, colSpan = 4 }) => (
        <div className={`mb-10 col-span-${colSpan}`}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">{label}</label>
            <p className="text-[13px] font-bold text-[#333] leading-tight">{value || "—"}</p>
        </div>
    );

    return (
        <section className="section admin-box box-primary !p-8 min-h-screen" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>

            {/* Top Navigation / Breadcrumb Area */}
            <div className="mb-6 flex justify-between items-end border-b border-gray-200 pb-4">
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

            {/* Header Profile Card - MATCHING PHOTO EXACTLY */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-[#fce7f3] flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                        {employeeData.profilePhoto ? (
                            <img src={employeeData.profilePhoto} className="w-full h-full object-cover" />
                        ) : (
                            <FaUserCircle className="w-20 h-20 text-[#f9a8d4]" />
                        )}
                    </div>
                    <div className="absolute bottom-1 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-[#333] m-0 tracking-tight">{employeeData.firstName} {employeeData.lastName}</h1>
                        <span className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tight">Active</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-500 text-sm font-semibold">
                        <div className="flex items-center gap-2"><FaBriefcase className="text-gray-300" /> {employeeData.employeeDesignation}</div>
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-6"><FaBuilding className="text-gray-300" /> {employeeData.departmentName}</div>
                        <div className="bg-[#f3f4f6] px-3 py-1 rounded text-[11px] font-bold text-gray-700 ml-2 tracking-tight uppercase">ID: {employeeData.employeeID}</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-300 mb-0 bg-transparent px-2 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-[13px] font-bold tracking-tight transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-[#3c8dbc]' : 'text-gray-500 hover:text-black'}`}
                    >
                        <span className="text-lg opacity-60">{tab.icon}</span>
                        {tab.id}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#3c8dbc]"></div>}
                    </button>
                ))}
            </div>

            {/* Content Box */}
            <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0 p-10 min-h-[500px]">
                <div className="mb-12">
                    <h2 className="text-[18px] font-bold text-black m-0 tracking-tight">
                        {activeTab === "Basic Info" ? "Personal Details" :
                            activeTab === "Contact Info" ? "Contact Details" :
                                activeTab === "Employment" ? "Employment Details" :
                                    activeTab === "Identification" ? "Identification Details" : "Additional Information"}
                    </h2>
                </div>

                <div className="grid grid-cols-12 gap-x-8">
                    {activeTab === "Basic Info" && (
                        <>
                            <InfoItem label="First Name" value={employeeData.firstName} />
                            <InfoItem label="Last Name" value={employeeData.lastName} />
                            <InfoItem label="Date of Birth" value={employeeData.dob ? moment(employeeData.dob).format("DD MMM YYYY") : "—"} />
                            <InfoItem label="Gender" value={employeeData.gender} />
                            <InfoItem label="Marital Status" value={employeeData.maritalStatus} />
                            <InfoItem label="Nationality" value={employeeData.nationality} />
                            <InfoItem label="Blood Group" value={employeeData.bloodGroup} />
                        </>
                    )}

                    {activeTab === "Contact Info" && (
                        <>
                            <InfoItem label="Mobile Number" value={employeeData.employeeMobile} />
                            <InfoItem label="Alternate Contact" value={employeeData.alternateContact} />
                            <InfoItem label="Official Email" value={employeeData.employeeEmail} />
                            <InfoItem label="Personal Email" value={employeeData.personalEmail} />
                            <div className="col-span-12 mt-4 grid grid-cols-12 gap-8">
                                <InfoItem label="Current Address" value={employeeData.currentAddress} colSpan={6} />
                                <InfoItem label="Permanent Address" value={employeeData.permanentAddress} colSpan={6} />
                            </div>
                        </>
                    )}

                    {activeTab === "Employment" && (
                        <>
                            <InfoItem label="Department" value={employeeData.departmentName} />
                            <InfoItem label="Designation" value={employeeData.employeeDesignation} />
                            <InfoItem label="Date of Joining" value={employeeData.doj ? moment(employeeData.doj).format("DD MMM YYYY") : "—"} />
                            <InfoItem label="Employment Type" value={employeeData.employmentType} />
                            <InfoItem label="Reporting Manager" value={employeeData.reportingManager_id} />
                            <InfoItem label="Work Location" value={employeeData.centerName} />
                        </>
                    )}

                    {activeTab === "Identification" && (
                        <>
                            <InfoItem label="PAN Card Number" value={employeeData.panNumber} />
                            <InfoItem label="Aadhaar Card Number" value={employeeData.aadhaarNumber} />
                            <InfoItem label="Passport Number" value={employeeData.passportNumber} />
                        </>
                    )}

                    {activeTab === "Additional Info" && (
                        <div className="col-span-12">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 block">Skills & Expertise</label>
                            <div className="flex flex-wrap gap-2 mb-12">
                                {(employeeData.skills && employeeData.skills.length > 0 ? employeeData.skills : ["General Skills"]).map(skill => (
                                    <span key={skill} className="bg-[#f0f7ff] text-[#3c8dbc] border border-[#d6eaff] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{skill}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-12 gap-8">
                                <div className="col-span-6">
                                    <InfoItem label="Certifications" value={employeeData.certifications} colSpan={12} />
                                </div>
                                <div className="col-span-6">
                                    <InfoItem label="Internal Notes" value={employeeData.notes} colSpan={12} />
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



