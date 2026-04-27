"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaHome } from "react-icons/fa";
import { Tooltip } from "flowbite-react";
import {
  MdSettings,
  MdWatchLater,
  MdEventAvailable,
  MdPayments,
  MdCalendarMonth,
  MdNotificationsActive,
} from "react-icons/md";
import { BsCheckSquare, BsArrowRepeat } from "react-icons/bs";

// Import sections
import AttendanceRules from "@/components/admin/settings/AttendanceRules";
import LeavePolicySetup from "@/components/admin/settings/LeavePolicySetup";
import PayrollSettings from "@/components/admin/settings/PayrollSettings";
import HolidayMapping from "@/components/admin/settings/HolidayMapping";
import NotificationSettings from "@/components/admin/settings/NotificationSettings";
import GeneralConfigurations from "@/components/admin/settings/GeneralConfigurations";

const Settings = () => {
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
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/system-configurations/get`,
      );
      const data = res.data && typeof res.data === "object" ? res.data : {};
      setSettings(data);
      setOriginalSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      Swal.fire("Error", "Failed to load settings", "error");
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
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/system-configurations/update`,
        settings,
      );
      setOriginalSettings(settings);
      Swal.fire({
        title: "Success!",
        text: "Settings have been updated globally.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      Swal.fire("Error", "Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setSettings(originalSettings);
    Swal.fire({
      title: "Changes Discarded",
      icon: "info",
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  };

  const tabs = [
    { id: "attendance", label: "Attendance Rules", icon: MdWatchLater },
    { id: "leave", label: "Leave Policies", icon: MdEventAvailable },
    { id: "payroll", label: "Payroll Configuration", icon: MdPayments },
    { id: "holidays", label: "Holiday Calendars", icon: MdCalendarMonth },
    {
      id: "notifications",
      label: "Notification Settings",
      icon: MdNotificationsActive,
    },
    { id: "general", label: "General Config", icon: MdSettings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
            Initializing Environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans w-full">
      {/* Standardized Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
              <span className="text-[#3c8dbc]">System Administration</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
              System <span className="text-[#3c8dbc] font-black">Settings</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
            <Tooltip content="Discard Changes" arrow={false} placement="bottom" className="bg-[#3c8dbc]">
              <div className="relative group">
                <BsArrowRepeat
                  className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                  onClick={handleDiscard}
                />
              </div>
            </Tooltip>
            <Tooltip content={saving ? "Saving..." : "Save Changes"} arrow={false} placement="bottom" className="bg-[#3c8dbc]">
              <div className="relative group">
                <div
                  className={`relative ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={!saving ? handleSave : undefined}
                >
                  <BsCheckSquare
                    className={`cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm ${saving ? 'animate-pulse' : ''}`}
                  />
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
        <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
          Configure global system rules, attendance policies, payroll structures, and notification triggers to align with organizational standards.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav - AdminLTE Box Style */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white border-t-[3px] border-[#3c8dbc] shadow-sm rounded-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-tight">
                Navigation
              </h3>
            </div>
            <nav className="flex flex-col">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 p-4 text-left transition-all border-l-4 ${isActive
                        ? "bg-[#f4f7f6] border-[#00a65a] text-[#00a65a]"
                        : "bg-white border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-[#00a65a]" : "text-gray-400"}
                    />
                    <span
                      className={`text-xs font-bold uppercase tracking-tight`}
                    >
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
                {tabs.find((t) => t.id === activeTab)?.label} Definition
              </h3>
            </div>
            <div className="p-6 lg:p-8">
              {activeTab === "attendance" && (
                <AttendanceRules
                  data={settings.attendance}
                  updateData={updateSection}
                />
              )}
              {activeTab === "leave" && (
                <LeavePolicySetup
                  data={settings.leave}
                  updateData={updateSection}
                />
              )}
              {activeTab === "payroll" && (
                <PayrollSettings
                  data={settings.payroll}
                  updateData={updateSection}
                />
              )}
              {activeTab === "holidays" && <HolidayMapping />}
              {activeTab === "notifications" && (
                <NotificationSettings
                  data={settings.notifications}
                  updateData={updateSection}
                />
              )}
              {activeTab === "general" && (
                <GeneralConfigurations
                  data={settings.general}
                  updateData={updateSection}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
