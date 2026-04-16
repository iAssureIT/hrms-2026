"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHome } from "react-icons/fa";
import { 
    MdSettings, 
    MdWatchLater, 
    MdEventAvailable, 
    MdPayments, 
    MdCalendarMonth, 
    MdNotificationsActive,
    MdSave,
    MdRefresh,
    MdChevronRight
} from "react-icons/md";

// Import sections
import AttendanceRules from "@/components/admin/settings/AttendanceRules";
import LeavePolicySetup from "@/components/admin/settings/LeavePolicySetup";
import PayrollSettings from "@/components/admin/settings/PayrollSettings";
import HolidayMapping from "@/components/admin/settings/HolidayMapping";
import NotificationSettings from "@/components/admin/settings/NotificationSettings";
import GeneralConfigurations from "@/components/admin/settings/GeneralConfigurations";

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState("attendance");
    const [settings, setSettings] = useState(null);
    const [originalSettings, setOriginalSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/system-configurations/get`);
            const data = res.data && typeof res.data === 'object' ? res.data : {};
            setSettings(data);
            setOriginalSettings(data);
        } catch (error) {
            console.error("Error fetching settings:", error);
            Swal.fire('Error', 'Failed to load settings', 'error');
            setSettings({});
            setOriginalSettings({});
        } finally {
            setLoading(false);
        }
    };

    const updateSection = (section, data) => {
        setSettings({ ...settings, [section]: data });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/system-configurations/update`, settings);
            setOriginalSettings(settings);
            Swal.fire({
                title: 'Success!',
                text: 'Settings have been updated globally.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            Swal.fire('Error', 'Failed to save changes', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setSettings(originalSettings);
        Swal.fire({
            title: 'Changes Discarded',
            icon: 'info',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const tabs = [
        { id: "attendance", label: "Attendance Rules", icon: MdWatchLater },
        { id: "leave", label: "Leave Policies", icon: MdEventAvailable },
        { id: "payroll", label: "Payroll Configuration", icon: MdPayments },
        { id: "holidays", label: "Holiday Calendars", icon: MdCalendarMonth },
        { id: "notifications", label: "Notification Settings", icon: MdNotificationsActive },
        { id: "general", label: "General Config", icon: MdSettings },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Initializing Environment...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f4f7f6] p-4 lg:p-8 font-sans">
            <div className="mx-auto">
                
                {/* AdminLTE style Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-2xl font-normal text-gray-800 tracking-tight">System Settings</h1>
                        <span className="text-sm font-light text-gray-500">Control panel</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-normal text-gray-700 mt-4 md:mt-0">
                        <FaHome className="text-gray-400" />
                        <span>Home</span>
                        <span className="text-gray-400">&gt;</span>
                        <span className="text-gray-400 font-bold">Settings</span>
                    </div>
                </div>

                {/* Main Action Bar */}
                <div className="flex justify-end gap-2 mb-6">
                    <button 
                        onClick={handleDiscard}
                        className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-sm font-bold text-xs hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <MdRefresh size={16} /> Discard
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#00a65a] border border-[#008d4c] text-white px-8 py-2 rounded-sm font-bold text-xs hover:bg-[#008d4c] shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <MdSave size={16} /> 
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Sidebar Nav - AdminLTE Box Style */}
                    <aside className="lg:w-72 shrink-0">
                        <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-tight">Navigation</h3>
                            </div>
                            <nav className="flex flex-col">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-3 p-4 text-left transition-all border-l-4 ${
                                                isActive 
                                                ? 'bg-[#f4f7f6] border-[#00a65a] text-[#00a65a]' 
                                                : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                            }`}
                                        >
                                            <Icon size={18} className={isActive ? "text-[#00a65a]" : "text-gray-400"} />
                                            <span className={`text-xs font-bold uppercase tracking-tight`}>
                                                {tab.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Content Section - AdminLTE Box Style */}
                    <section className="flex-1 min-w-0">
                        <div className="bg-white border-t-[3px] border-[#00a65a] shadow-sm rounded-sm">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-tight">
                                    {tabs.find(t => t.id === activeTab)?.label} Definition
                                </h3>
                            </div>
                            <div className="p-6 lg:p-8">
                                {activeTab === "attendance" && <AttendanceRules data={settings.attendance} updateData={updateSection} />}
                                {activeTab === "leave" && <LeavePolicySetup data={settings.leave} updateData={updateSection} />}
                                {activeTab === "payroll" && <PayrollSettings data={settings.payroll} updateData={updateSection} />}
                                {activeTab === "holidays" && <HolidayMapping />}
                                {activeTab === "notifications" && <NotificationSettings data={settings.notifications} updateData={updateSection} />}
                                {activeTab === "general" && <GeneralConfigurations data={settings.general} updateData={updateSection} />}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-8 flex justify-between items-center px-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                © 2026 Admin Portal. All rights reserved.
                            </p>
                            <div className="flex gap-6">
                                <a href="#" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#00a65a] transition-colors">Documentation</a>
                                <a href="#" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#00a65a] transition-colors">Support</a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;
