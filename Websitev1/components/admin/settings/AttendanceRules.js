"use client";

import React from "react";
import { MdAccessTime, MdLocationOn, MdGpsFixed, MdBlock, MdCheckCircle } from "react-icons/md";

const Toggle = ({ label, description, enabled, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-green-200 transition-all duration-300">
        <div>
            <h4 className="text-sm font-bold text-slate-800">{label}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-green-600' : 'bg-slate-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const InputField = ({ label, description, value, onChange, type = "number", suffix }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pl-1">
            {label}
        </label>
        <div className="group">
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-300 outline-none placeholder:text-slate-300"
                />
                {suffix && (
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            {suffix}
                        </span>
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 pl-1 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                {description}
            </p>
        </div>
    </div>
);

const AttendanceRules = ({ data, updateData }) => {
    const handleChange = (field, value) => {
        updateData('attendance', { ...data, [field]: value });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Clock-in Settings */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                            <MdAccessTime size={20} />
                        </div>
                        Clock-in & Timing Thresholds
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Define grace periods and penalties for daily attendance logging.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                        label="Standard Work Hours"
                        description="Expected total hours per day (e.g., 9.0)"
                        value={data.standardWorkHours}
                        onChange={(val) => handleChange('standardWorkHours', val)}
                        suffix="Hours"
                    />
                    <InputField
                        label="Late Arrival Grace Period"
                        description="Minutes allowed after shift start before marked Late."
                        value={data.lateArrivalGracePeriod}
                        onChange={(val) => handleChange('lateArrivalGracePeriod', val)}
                        suffix="Mins"
                    />
                    <InputField
                        label="Half-Day Minimum Hours"
                        description="Minimum hours required to avoid a full absent mark."
                        value={data.halfDayMinHours}
                        onChange={(val) => handleChange('halfDayMinHours', val)}
                        suffix="Hours"
                    />
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pl-1">
                            Early Departure Penalty
                        </label>
                        <select
                            value={data.earlyDeparturePenalty}
                            onChange={(e) => handleChange('earlyDeparturePenalty', e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-300 outline-none"
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
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                            <MdGpsFixed size={20} />
                        </div>
                        Enforcement & Automation
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Configure system behaviors for missing logs and overtime.</p>
                </div>

                <div className="space-y-4">
                    <Toggle
                        label="Strict IP/Location Tracking"
                        description="Require employees to clock in only from approved IP addresses or geofences."
                        enabled={data.strictIPTracking}
                        onChange={(val) => handleChange('strictIPTracking', val)}
                    />
                    <Toggle
                        label="Auto-Absent on Missing Logs"
                        description="Automatically mark absent if no clock-in is registered by end of shift."
                        enabled={data.autoAbsentMissingLogs}
                        onChange={(val) => handleChange('autoAbsentMissingLogs', val)}
                    />
                    <Toggle
                        label="Require Overtime Approval"
                        description="Overtime hours must be approved by manager before payroll calculation."
                        enabled={data.requireOvertimeApproval}
                        onChange={(val) => handleChange('requireOvertimeApproval', val)}
                    />
                </div>
            </div>
        </div>
    );
};

export default AttendanceRules;
