"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
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
            setSettings(res.data);
            setOriginalSettings(res.data);
        } catch (error) {
            console.error("Error fetching settings:", error);
            Swal.fire('Error', 'Failed to load settings', 'error');
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
        <main className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
            <div className="max-w-[1440px] mx-auto space-y-8">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-green-600 mb-2">
                            <span className="w-8 h-[1px] bg-green-600"></span>
                            System Administration
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
                            System <span className="text-green-600">Settings</span>
                        </h1>
                        <p className="text-sm text-slate-400 font-medium">Configure global rules, policies, and parameters for the portal.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleDiscard}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-slate-300 hover:text-slate-700 transition-all active:scale-95 shadow-sm"
                        >
                            <MdRefresh size={18} /> Discard
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 hover:shadow-xl hover:shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-green-500/10`}
                        >
                            <MdSave size={18} /> 
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Sidebar Nav */}
                    <aside className="lg:w-80 shrink-0">
                        <nav className="flex flex-col gap-2 sticky top-10">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                                            isActive 
                                            ? 'bg-green-600 text-white shadow-xl shadow-green-500/20 translate-x-2' 
                                            : 'bg-white text-slate-500 hover:bg-slate-100 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-green-50 group-hover:text-green-600'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <span className={`text-sm font-black transition-all ${isActive ? 'tracking-normal' : 'tracking-tight'}`}>
                                                {tab.label}
                                            </span>
                                        </div>
                                        <MdChevronRight size={20} className={`transition-transform duration-500 ${isActive ? 'rotate-90 opacity-100' : 'opacity-0 -translate-x-2'}`} />
                                    </button>
                                );
                            })}
                            
                            {/* Support Card */}
                            <div className="mt-8 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden relative group">
                                <div className="absolute -right-4 -bottom-4 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700">
                                    <MdSettings size={120} />
                                </div>
                                <h4 className="text-white text-sm font-black relative z-10">VeriTime Support</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1 relative z-10">Need help? Contact our HR Tech team.</p>
                                <button className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/10 transition-all relative z-10">
                                    Open Ticket
                                </button>
                            </div>
                        </nav>
                    </aside>

                    {/* Content Section */}
                    <section className="flex-1 min-w-0">
                        <div className="bg-white rounded-[3rem] p-8 lg:p-12 border-2 border-slate-100 shadow-sm relative overflow-hidden transition-all duration-500">
                            {/* Section Wrapper */}
                            <div className="relative z-10">
                                {activeTab === "attendance" && <AttendanceRules data={settings.attendance} updateData={updateSection} />}
                                {activeTab === "leave" && <LeavePolicySetup data={settings.leave} updateData={updateSection} />}
                                {activeTab === "payroll" && <PayrollSettings data={settings.payroll} updateData={updateSection} />}
                                {activeTab === "holidays" && <HolidayMapping />}
                                {activeTab === "notifications" && <NotificationSettings data={settings.notifications} updateData={updateSection} />}
                                {activeTab === "general" && <GeneralConfigurations data={settings.general} updateData={updateSection} />}
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none select-none">
                                <MdSettings size={400} />
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-10 flex justify-between items-center px-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                © 2026 VeriTime Admin. All rights reserved.
                            </p>
                            <div className="flex gap-6">
                                <a href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-green-600 transition-colors">Privacy Policy</a>
                                <a href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-green-600 transition-colors">Terms of Service</a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;
