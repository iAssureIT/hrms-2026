"use client";

import React from "react";
import { MdEventNote, MdRefresh, MdTimeline, MdAdd } from "react-icons/md";

const LeaveTypeCard = ({ type, onUpdate, onDelete }) => (
    <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div>
                <input
                    type="text"
                    value={type.name}
                    onChange={(e) => onUpdate({ ...type, name: e.target.value })}
                    className="text-sm font-black text-slate-800 outline-none border-b-2 border-transparent focus:border-green-500 bg-transparent transition-all px-1"
                    placeholder="Leave Name (e.g. Sick Leave)"
                />
            </div>
            <button 
                onClick={onDelete}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
            >
                <MdRefresh className="rotate-45" size={18} />
            </button>
        </div>
        
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Limit</span>
                <input
                    type="number"
                    value={type.maxLeaves}
                    onChange={(e) => onUpdate({ ...type, maxLeaves: parseInt(e.target.value) })}
                    className="w-16 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-center outline-none focus:border-green-500"
                />
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carry Forward</span>
                <button
                    onClick={() => onUpdate({ ...type, carryForward: !type.carryForward })}
                    className={`h-5 w-10 rounded-full transition-colors relative ${type.carryForward ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white h-3 w-3 rounded-full transition-transform ${type.carryForward ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>
            {type.carryForward && (
                <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Limit (Days)</span>
                    <input
                        type="number"
                        value={type.carryForwardLimit}
                        onChange={(e) => onUpdate({ ...type, carryForwardLimit: parseInt(e.target.value) })}
                        className="w-16 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-center outline-none focus:border-green-500"
                    />
                </div>
            )}
        </div>
    </div>
);

const LeavePolicySetup = ({ data, updateData }) => {
    const handleLeaveTypesChange = (newTypes) => {
        updateData('leave', { ...data, leaveTypes: newTypes });
    };

    const addLeaveType = () => {
        const newTypes = [...(data.leaveTypes || []), { name: '', maxLeaves: 0, carryForward: false, carryForwardLimit: 0 }];
        handleLeaveTypesChange(newTypes);
    };

    const updateLeaveType = (index, updatedType) => {
        const newTypes = [...data.leaveTypes];
        newTypes[index] = updatedType;
        handleLeaveTypesChange(newTypes);
    };

    const deleteLeaveType = (index) => {
        const newTypes = data.leaveTypes.filter((_, i) => i !== index);
        handleLeaveTypesChange(newTypes);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Leave Types Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                <MdEventNote size={20} />
                            </div>
                            Leave Types & Entitlements
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Configure different leave categories and their yearly limits.</p>
                    </div>
                    <button 
                        onClick={addLeaveType}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                    >
                        <MdAdd size={16} /> Add Type
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                    {data.leaveTypes?.map((type, idx) => (
                        <LeaveTypeCard 
                            key={idx}
                            type={type}
                            onUpdate={(updated) => updateLeaveType(idx, updated)}
                            onDelete={() => deleteLeaveType(idx)}
                        />
                    ))}
                </div>
            </div>

            {/* Workflow Section */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                            <MdTimeline size={20} />
                        </div>
                        Approval Workflow
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Define the sequence of approvals required for leave requests.</p>
                </div>

                <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="px-5 py-2.5 bg-white border-2 border-green-200 rounded-2xl shadow-sm text-xs font-black text-slate-700">Employee</div>
                        <div className="h-0.5 w-8 bg-slate-200 relative">
                            <div className="absolute -right-1 -top-1 border-4 border-transparent border-l-slate-200" />
                        </div>
                        <select
                            value={data.approvalWorkflow}
                            onChange={(e) => updateData('leave', { ...data, approvalWorkflow: e.target.value })}
                            className="px-5 py-2.5 bg-green-600 text-white border-none rounded-2xl shadow-lg shadow-green-500/20 text-xs font-black outline-none appearance-none cursor-pointer hover:bg-green-700 transition-colors"
                        >
                            <option>Manager {"->"} HR</option>
                            <option>Manager Only</option>
                            <option>HR Only</option>
                            <option>Manager {"->"} Dept Head {"->"} HR</option>
                        </select>
                        <div className="h-0.5 w-8 bg-slate-200 relative">
                            <div className="absolute -right-1 -top-1 border-4 border-transparent border-l-slate-200" />
                        </div>
                        <div className="px-5 py-2.5 bg-white border-2 border-green-200 rounded-2xl shadow-sm text-xs font-black text-slate-700">Approved</div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selected multi-level approval flow</p>
                </div>
            </div>
        </div>
    );
};

export default LeavePolicySetup;
