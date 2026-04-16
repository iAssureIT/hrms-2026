"use client";

import React from "react";
import { MdAccessTime, MdGpsFixed } from "react-icons/md";

const Toggle = ({ label, description, enabled, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-sm hover:border-green-300 transition-all duration-200">
        <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-tight">{label}</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-[#00a65a]' : 'bg-gray-300'}`}
        >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
    </div>
);

const InputField = ({ label, description, value, onChange, type = "number", suffix }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">
            {label}
        </label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all"
            />
            {suffix && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-[10px] font-bold uppercase text-gray-400">
                        {suffix}
                    </span>
                </div>
            )}
        </div>
        <p className="text-[10px] text-gray-400 italic">
            {description}
        </p>
    </div>
);

const AttendanceRules = ({ data, updateData }) => {
    const handleChange = (field, value) => {
        updateData('attendance', { ...data, [field]: value });
    };

    return (
        <div className="space-y-8">
            {/* Clock-in Settings */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdAccessTime size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Timing Thresholds
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                        label="Standard Work Hours"
                        description="Expected total hours per day (e.g., 9.0)"
                        value={data.standardWorkHours}
                        onChange={(val) => handleChange('standardWorkHours', val)}
                        suffix="Hrs"
                    />
                    <InputField
                        label="Late Arrival Grace"
                        description="Minutes allowed after shift start."
                        value={data.lateArrivalGracePeriod}
                        onChange={(val) => handleChange('lateArrivalGracePeriod', val)}
                        suffix="Mins"
                    />
                    <InputField
                        label="Half-Day Minimum"
                        description="Minimum hours for a half-day mark."
                        value={data.halfDayMinHours}
                        onChange={(val) => handleChange('halfDayMinHours', val)}
                        suffix="Hrs"
                    />
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">
                            Early Departure Penalty
                        </label>
                        <select
                            value={data.earlyDeparturePenalty}
                            onChange={(e) => handleChange('earlyDeparturePenalty', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all appearance-none cursor-pointer"
                        >
                            <option>None</option>
                            <option>Mark Half Day</option>
                            <option>Deduct from Leave</option>
                            <option>Warning Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Enforcement Settings */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdGpsFixed size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Enforcement & Automation
                    </h3>
                </div>

                <div className="space-y-3">
                    <Toggle
                        label="Strict IP/Location Tracking"
                        description="Require employees to clock in only from approved IP addresses."
                        enabled={data.strictIPTracking}
                        onChange={(val) => handleChange('strictIPTracking', val)}
                    />
                    <Toggle
                        label="Auto-Absent on Missing Logs"
                        description="Automatically mark absent if no clock-in by end of shift."
                        enabled={data.autoAbsentMissingLogs}
                        onChange={(val) => handleChange('autoAbsentMissingLogs', val)}
                    />
                    <Toggle
                        label="Require Overtime Approval"
                        description="Overtime must be approved before payroll calculation."
                        enabled={data.requireOvertimeApproval}
                        onChange={(val) => handleChange('requireOvertimeApproval', val)}
                    />
                </div>
            </div>
        </div>
    );
};

export default AttendanceRules;
