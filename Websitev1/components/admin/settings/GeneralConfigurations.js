"use client";

import React from "react";
import { MdSettings, MdPublic, MdUpdate, MdTranslate } from "react-icons/md";

const SelectionField = ({ icon: Icon, label, value, options, onChange, color }) => (
    <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1 flex items-center gap-2">
            <div className={`p-1 rounded-md ${color}`}>
                <Icon size={12} />
            </div>
            {label}
        </label>
        <div className="relative group">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-300 outline-none appearance-none cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400 group-hover:text-green-600 transition-colors">
                <MdUpdate size={20} className="rotate-90" />
            </div>
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Working Days */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                            <MdSettings size={20} />
                        </div>
                        Business Hours
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Specify which days are officially counted as working days for the organization.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    {days.map((day) => {
                        const isWorking = data.companyWorkingDays?.includes(day.substring(0, 3));
                        return (
                            <button
                                key={day}
                                onClick={() => toggleWorkDay(day.substring(0, 3))}
                                className={`px-6 py-3 rounded-2xl border-2 transition-all duration-300 font-black text-xs uppercase tracking-widest ${
                                    isWorking
                                    ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/20 scale-105'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Region & Formats */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                            <MdPublic size={20} />
                        </div>
                        Regional Settings
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Configure timezones, date formats, and localization.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <SelectionField
                        icon={MdUpdate}
                        label="System Timezone"
                        value={data.timeZone}
                        options={timezones}
                        onChange={(val) => handleChange('timeZone', val)}
                        color="bg-purple-50 text-purple-600"
                    />
                    <SelectionField
                        icon={MdUpdate}
                        label="Date Format"
                        value={data.dateFormat}
                        options={[
                            { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
                            { label: 'MM-DD-YYYY', value: 'MM-DD-YYYY' },
                            { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
                        ]}
                        onChange={(val) => handleChange('dateFormat', val)}
                        color="bg-blue-50 text-blue-600"
                    />
                    <SelectionField
                        icon={MdTranslate}
                        label="Default Language"
                        value={data.defaultLanguage}
                        options={[
                            { label: 'English (US)', value: 'English' },
                            { label: 'Hindi', value: 'Hindi' },
                            { label: 'Marathi', value: 'Marathi' }
                        ]}
                        onChange={(val) => handleChange('defaultLanguage', val)}
                        color="bg-rose-50 text-rose-600"
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralConfigurations;
