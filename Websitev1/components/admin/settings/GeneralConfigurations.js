"use client";

import React from "react";
import { MdSettings, MdPublic } from "react-icons/md";

const SelectionField = ({ label, value, options, onChange }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-tight pl-1">
            {label}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3c8dbc] transition-all appearance-none cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    </div>
);

const GeneralConfigurations = ({ data, updateData }) => {
    const handleChange = (field, value) => {
        updateData('general', { ...data, [field]: value });
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timezones = [
        { label: '(UTC+05:30) Chennai, Kolkata, Mumbai, Delhi', value: 'Asia/Kolkata' },
        { label: '(UTC+00:00) London, Dublin, Edinburgh', value: 'Europe/London' },
        { label: '(UTC-05:00) Eastern Time (US & Canada)', value: 'America/New_York' }
    ];

    const toggleWorkDay = (day) => {
        const currentDays = data.companyWorkingDays || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        handleChange('companyWorkingDays', newDays);
    };

    return (
        <div className="space-y-8">
            {/* Working Days */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdSettings size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Business Hours
                    </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    {days.map((day) => {
                        const isWorking = data.companyWorkingDays?.includes(day.substring(0, 3));
                        return (
                            <button
                                key={day}
                                onClick={() => toggleWorkDay(day.substring(0, 3))}
                                className={`px-4 py-2 rounded-sm border transition-all duration-200 font-bold text-[10px] uppercase tracking-wider ${
                                    isWorking
                                    ? 'bg-[#00a65a] border-[#008d4c] text-white shadow-sm'
                                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
                <p className="text-[10px] text-gray-400 italic">Select days counted as organizational working days.</p>
            </div>

            {/* Region & Formats */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdPublic size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Regional Settings
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <SelectionField
                        label="System Timezone"
                        value={data.timeZone}
                        options={timezones}
                        onChange={(val) => handleChange('timeZone', val)}
                    />
                    <SelectionField
                        label="Date Format"
                        value={data.dateFormat}
                        options={[
                            { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
                            { label: 'MM-DD-YYYY', value: 'MM-DD-YYYY' },
                            { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
                        ]}
                        onChange={(val) => handleChange('dateFormat', val)}
                    />
                    <SelectionField
                        label="Default Language"
                        value={data.defaultLanguage}
                        options={[
                            { label: 'English (US)', value: 'English' },
                            { label: 'Hindi', value: 'Hindi' },
                            { label: 'Marathi', value: 'Marathi' }
                        ]}
                        onChange={(val) => handleChange('defaultLanguage', val)}
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralConfigurations;
