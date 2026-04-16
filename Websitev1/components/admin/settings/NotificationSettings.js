"use client";

import React from "react";
import { MdNotifications, MdMail, MdSms, MdSmartphone, MdFlashOn } from "react-icons/md";

const ToggleRow = ({ icon: Icon, label, description, enabled, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-sm hover:border-gray-300 transition-all group">
        <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-50 text-gray-400 group-hover:text-[#00a65a] transition-all">
                <Icon size={18} />
            </div>
            <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-tight">{label}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
            </div>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-4 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-[#00a65a]' : 'bg-gray-300'}`}
        >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
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
        <div className="space-y-8">
            {/* Communication Channels */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdNotifications size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Communication Channels
                    </h3>
                </div>

                <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-4">
                    <ToggleRow
                        icon={MdMail}
                        label="Email Reports"
                        description="Weekly summaries and alerts."
                        enabled={data.email}
                        onChange={(val) => handleChannelChange('email', val)}
                    />
                    <ToggleRow
                        icon={MdSms}
                        label="SMS Alerts"
                        description="Critical gateway integration."
                        enabled={data.sms}
                        onChange={(val) => handleChannelChange('sms', val)}
                    />
                    <ToggleRow
                        icon={MdSmartphone}
                        label="Push Notify"
                        description="Real-time mobile updates."
                        enabled={data.push}
                        onChange={(val) => handleChannelChange('push', val)}
                    />
                </div>
            </div>

            {/* Event Triggers */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdFlashOn size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Event Triggers
                    </h3>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-sm p-6 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-2 border-b border-gray-100 md:border-none">
                            <div className="space-y-0.5">
                                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-tight">Leave Requests</h5>
                                <p className="text-[10px] text-gray-400 italic">Alert manager on new application</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={data.events?.leaveRequest}
                                onChange={(e) => handleEventChange('leaveRequest', e.target.checked)}
                                className="w-4 h-4 rounded-sm border-gray-300 text-[#00a65a] focus:ring-[#00a65a] cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center justify-between p-2">
                            <div className="space-y-0.5">
                                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-tight">Attendance Alerts</h5>
                                <p className="text-[10px] text-gray-400 italic">Notify employee on missing logs</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={data.events?.attendanceAlerts}
                                onChange={(e) => handleEventChange('attendanceAlerts', e.target.checked)}
                                className="w-4 h-4 rounded-sm border-gray-300 text-[#00a65a] focus:ring-[#00a65a] cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="space-y-4 md:border-l md:border-gray-200 md:pl-8">
                        <div className="flex items-center justify-between p-2 border-b border-gray-100 md:border-none">
                            <div className="space-y-0.5">
                                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-tight">Payroll Processed</h5>
                                <p className="text-[10px] text-gray-400 italic">Notify staff when payslips ready</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={data.events?.payrollProcessed}
                                onChange={(e) => handleEventChange('payrollProcessed', e.target.checked)}
                                className="w-4 h-4 rounded-sm border-gray-300 text-[#00a65a] focus:ring-[#00a65a] cursor-pointer"
                            />
                        </div>
                        <div className="p-3 bg-green-50 border border-green-100 flex items-center gap-3">
                            <MdSmartphone size={16} className="text-[#00a65a] shrink-0" />
                            <p className="text-[9px] font-bold text-green-700 uppercase tracking-tight leading-normal">
                                Standard notification rules applied based on organizational hierarchy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
