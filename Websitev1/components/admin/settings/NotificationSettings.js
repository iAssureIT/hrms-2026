"use client";

import React from "react";
import { MdNotifications, MdMail, MdSms, MdSmartphone, MdFlashOn } from "react-icons/md";

const ToggleRow = ({ icon: Icon, label, description, enabled, onChange, color }) => (
    <div className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-3xl hover:border-slate-300 transition-all group">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${color} transition-all group-hover:scale-110`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className="text-sm font-black text-slate-800">{label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>
            </div>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-green-600' : 'bg-slate-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const NotificationSettings = ({ data, updateData }) => {
    const handleChannelChange = (channel, value) => {
        updateData('notifications', { ...data, [channel]: value });
    };

    const handleEventChange = (event, value) => {
        updateData('notifications', {
            ...data,
            events: { ...(data.events || {}), [event]: value }
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Communication Channels */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <MdNotifications size={20} />
                        </div>
                        Communication Channels
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Select the primary ways the system will communicate with staff.</p>
                </div>

                <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-6">
                    <ToggleRow
                        icon={MdMail}
                        label="Email Reports"
                        description="Send weekly summaries and alerts to official email IDs."
                        enabled={data.email}
                        onChange={(val) => handleChannelChange('email', val)}
                        color="bg-blue-50 text-blue-600"
                    />
                    <ToggleRow
                        icon={MdSms}
                        label="SMS Alerts"
                        description="Critical alerts sent via standard SMS gateway."
                        enabled={data.sms}
                        onChange={(val) => handleChannelChange('sms', val)}
                        color="bg-orange-50 text-orange-600"
                    />
                    <ToggleRow
                        icon={MdSmartphone}
                        label="Push Notify"
                        description="App notifications for real-time mobile updates."
                        enabled={data.push}
                        onChange={(val) => handleChannelChange('push', val)}
                        color="bg-indigo-50 text-indigo-600"
                    />
                </div>
            </div>

            {/* Event Triggers */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                            <MdFlashOn size={20} />
                        </div>
                        Event Triggers
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Enable notifications for specific system events.</p>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-2">
                            <div className="space-y-0.5">
                                <h5 className="text-sm font-bold text-slate-700">Leave Requests</h5>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Alert manager on new application</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={data.events?.leaveRequest}
                                onChange={(e) => handleEventChange('leaveRequest', e.target.checked)}
                                className="w-5 h-5 rounded-lg border-2 border-slate-200 text-green-600 focus:ring-green-500/10 cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center justify-between p-2">
                            <div className="space-y-0.5">
                                <h5 className="text-sm font-bold text-slate-700">Attendance Alerts</h5>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Notify employee on missing logs</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={data.events?.attendanceAlerts}
                                onChange={(e) => handleEventChange('attendanceAlerts', e.target.checked)}
                                className="w-5 h-5 rounded-lg border-2 border-slate-200 text-green-600 focus:ring-green-500/10 cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="space-y-4 border-l border-slate-200 pl-8">
                        <div className="flex items-center justify-between p-2">
                            <div className="space-y-0.5">
                                <h5 className="text-sm font-bold text-slate-700">Payroll Processed</h5>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Notify staff when payslips are ready</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={data.events?.payrollProcessed}
                                onChange={(e) => handleEventChange('payrollProcessed', e.target.checked)}
                                className="w-5 h-5 rounded-lg border-2 border-slate-200 text-green-600 focus:ring-green-500/10 cursor-pointer"
                            />
                        </div>
                        <div className="p-4 bg-green-500/[0.03] rounded-2xl border border-green-100 flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-xl text-white">
                                <MdSmartphone size={16} />
                            </div>
                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest leading-normal">
                                Standard notification rules applied based on role hierarchy
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
