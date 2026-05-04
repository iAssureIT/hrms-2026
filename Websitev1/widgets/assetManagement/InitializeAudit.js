"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter, usePathname } from "next/navigation";
import ls from "localstorage-slim";
import dynamic from "next/dynamic";
const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default || mod),
  {
    ssr: false,
    loading: () => <div className="h-10 w-full animate-pulse bg-slate-50 rounded-xl border border-slate-100" />
  }
);
import "react-datepicker/dist/react-datepicker.css";
import { 
  MdOutlineLibraryAdd, 
  MdBusiness, 
  MdCalendarToday, 
  MdAccessTime, 
  MdPerson 
} from "react-icons/md";
import { CiViewList } from "react-icons/ci";
import { FaSpinner } from "react-icons/fa";
import { Tooltip } from "flowbite-react";

const InitializeAudit = () => {
    const router = useRouter();
    const pathname = usePathname();
    const rolePath = pathname.split("/")[1];
    const [userDetails] = useState(ls.get("userDetails", { decrypt: true }) || {});
    const [centerList, setCenterList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        auditTitle: "",
        center_id: "",
        auditDate: new Date(),
        auditTime: new Date(),
    });

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`);
            setCenterList(res.data || []);
        } catch (err) {
            console.error("Error fetching centers:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Combine Date and Time
            const combinedDate = new Date(formData.auditDate);
            combinedDate.setHours(formData.auditTime.getHours());
            combinedDate.setMinutes(formData.auditTime.getMinutes());

            const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-audit/post`, {
                auditTitle: formData.auditTitle,
                center_id: formData.center_id,
                auditDate: combinedDate,
                user_id: userDetails?.user_id || userDetails?.userId || userDetails?._id
            });

            if (res.data.success) {
                Swal.fire({
                    title: "Initialized!",
                    text: "New audit session started successfully.",
                    icon: "success",
                    confirmButtonColor: "#10b981"
                });
                router.push(`/${rolePath}/management/asset-audit`);
            }
        } catch (err) {
            Swal.fire("Error", "Failed to initialize audit session.", "error");
        } finally {
            setLoading(false);
        }
    };

    // ── Section Header ──
    const SectionHeader = ({ title, subtitle }) => (
        <div className="mb-5 border-b border-gray-100 pb-2">
            <h3 className="text-[15px] font-bold text-black uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] font-normal text-gray-500">{subtitle}</p>
        </div>
    );

    // ── Icon Input Wrapper ──
    const IconWrapper = ({ icon: Icon }) => (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                <Icon className="icon text-gray-400" />
            </span>
        </div>
    );

    return (
        <section className="section admin-box box-primary">
            <div className="hr-card hr-fade-in">
                {/* --- Page Header --- */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                                <span className="text-[#3c8dbc]">Asset Audit Operations</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                                Initialize <span className="text-[#3c8dbc] font-black">Audit</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 pt-4 md:pt-0 mb-1">
                            <Tooltip content="Audit List" placement="bottom" className="bg-[#3c8dbc]" arrow={false}>
                                <div onClick={() => router.push(`/${rolePath}/management/asset-audit`)}
                                    className="text-[#3c8dbc] border border-[#3c8dbc] p-1.5 rounded cursor-pointer hover:bg-[#3c8dbc] hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[32px] w-[32px]">
                                    <CiViewList size={20} />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
                        Define the scope and timeline for a new physical verification session.
                    </p>
                </div>


                {/* ── Form ── */}
                <div className="px-10 py-8">
                    <div className="bg-white text-secondary">
                        <form onSubmit={handleSubmit}>
                            <div className="border border-gray-200 rounded-lg p-5 shadow-sm">
                                <SectionHeader
                                    title="Audit Configuration"
                                    subtitle="Define the scope and timeline for a new physical verification session."
                                />

                                <div className="grid lg:grid-cols-12 grid-cols-1 gap-8 mt-4">
                                    <div className="lg:col-span-12 space-y-6">
                                        {/* Audit Title */}
                                        <div>
                                            <label className="inputLabel mb-1">Audit Session Title <span className="text-red-500">*</span></label>
                                            <div className="relative mt-2 rounded-md shadow-sm">
                                                <IconWrapper icon={MdOutlineLibraryAdd} />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Annual IT Infrastructure Audit 2024"
                                                    className="stdInputField w-full pl-12"
                                                    value={formData.auditTitle}
                                                    onChange={(e) => setFormData({ ...formData, auditTitle: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
                                            {/* Target Center */}
                                            <div>
                                                <label className="inputLabel mb-1">Target Center <span className="text-red-500">*</span></label>
                                                <div className="relative mt-2 rounded-md shadow-sm">
                                                    <IconWrapper icon={MdBusiness} />
                                                    <select
                                                        required
                                                        className="stdSelectField w-full pl-12"
                                                        value={formData.center_id}
                                                        onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}
                                                    >
                                                        <option value="" disabled>-- Select Center --</option>
                                                        <option value="all">Enterprise Wide (All Centers)</option>
                                                        {centerList.map(c => (
                                                            <option key={c._id} value={c._id}>{c.centerName}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Initialized By */}
                                            <div>
                                                <label className="inputLabel mb-1 text-slate-400">Initialized By</label>
                                                <div className="relative mt-2 rounded-md shadow-sm">
                                                    <IconWrapper icon={MdPerson} />
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        className="stdInputField w-full pl-12 bg-slate-50 text-slate-500 cursor-not-allowed border-slate-100 shadow-none"
                                                        value={userDetails?.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails?.fullName || userDetails?.name || "System Admin")}
                                                    />
                                                </div>
                                            </div>

                                            {/* Audit Date */}
                                            <div>
                                                <label className="inputLabel mb-1">Audit Date <span className="text-red-500">*</span></label>
                                                <div className="relative mt-2 rounded-md shadow-sm z-20">
                                                    <IconWrapper icon={MdCalendarToday} />
                                                    <DatePicker
                                                        selected={formData.auditDate}
                                                        onChange={(date) => setFormData({ ...formData, auditDate: date })}
                                                        dateFormat="dd MMM, yyyy"
                                                        className="stdInputField w-full pl-12"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Audit Time */}
                                            <div>
                                                <label className="inputLabel mb-1">Audit Time <span className="text-red-500">*</span></label>
                                                <div className="relative mt-2 rounded-md shadow-sm z-20">
                                                    <IconWrapper icon={MdAccessTime} />
                                                    <DatePicker
                                                        selected={formData.auditTime}
                                                        onChange={(time) => setFormData({ ...formData, auditTime: time })}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Time"
                                                        dateFormat="h:mm aa"
                                                        className="stdInputField w-full pl-12"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-8 flex justify-center">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="formButtons"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <FaSpinner className="animate-spin" /> Initializing...
                                        </div>
                                    ) : (
                                        "Initialize Audit Session"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InitializeAudit;
