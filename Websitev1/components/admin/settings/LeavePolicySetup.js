"use client";

import React from "react";
import { MdEventNote, MdRefresh, MdTimeline, MdAdd } from "react-icons/md";

const LeaveTypeCard = ({ type, onUpdate, onDelete }) => (
    <div className="bg-white border border-gray-200 rounded-sm p-4 hover:border-[#00a65a] shadow-sm transition-all group">
        <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-2">
            <div className="flex-1">
                <input
                    type="text"
                    value={type.name}
                    onChange={(e) => onUpdate({ ...type, name: e.target.value })}
                    className="w-full text-xs font-bold text-gray-800 uppercase tracking-tight outline-none border-b border-transparent focus:border-[#00a65a] bg-transparent transition-all"
                    placeholder="e.g. Sick Leave"
                />
            </div>
            <button 
                onClick={onDelete}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                title="Remove Leave Type"
            >
                <MdRefresh className="rotate-45" size={16} />
            </button>
        </div>
        
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Annual Limit</span>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={type.maxLeaves}
                        onChange={(e) => onUpdate({ ...type, maxLeaves: parseInt(e.target.value) })}
                        className="w-14 bg-gray-50 border border-gray-300 rounded-sm px-2 py-1 text-xs font-bold text-gray-800 text-center outline-none focus:border-[#3c8dbc]"
                    />
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Days</span>
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Carry Forward</span>
                <button
                    onClick={() => onUpdate({ ...type, carryForward: !type.carryForward })}
                    className={`relative inline-flex h-4 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${type.carryForward ? 'bg-[#00a65a]' : 'bg-gray-300'}`}
                >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${type.carryForward ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
            </div>
            {type.carryForward && (
                <div className="flex items-center justify-between bg-green-50/50 p-2 rounded-sm border border-green-100">
                    <span className="text-[9px] font-bold text-green-700 uppercase tracking-tight">Max Carry Limit</span>
                    <input
                        type="number"
                        value={type.carryForwardLimit}
                        onChange={(e) => onUpdate({ ...type, carryForwardLimit: parseInt(e.target.value) })}
                        className="w-12 bg-white border border-green-200 rounded-sm px-1.5 py-0.5 text-[10px] font-bold text-gray-800 text-center outline-none focus:border-[#3c8dbc]"
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
        <div className="space-y-8">
            {/* Leave Types Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                        <MdEventNote size={18} className="text-[#00a65a]" />
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                            Leave Entitlements
                        </h3>
                    </div>
                    <button 
                        onClick={addLeaveType}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a65a] border border-[#008d4c] text-white text-xs font-bold uppercase tracking-tight rounded-sm hover:bg-[#008d4c] shadow-sm transition-all active:scale-95"
                    >
                        <MdAdd size={14} /> Add Type
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
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
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MdTimeline size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Approval Workflow
                    </h3>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-sm p-6 flex flex-col items-center justify-center space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white border border-gray-200 rounded-sm shadow-sm text-[10px] font-bold text-gray-600 uppercase">Employee</div>
                        <div className="w-6 h-[1px] bg-gray-300 relative">
                            <div className="absolute -right-1 -top-1 border-4 border-transparent border-l-gray-300" />
                        </div>
                        <div className="relative">
                            <select
                                value={data.approvalWorkflow}
                                onChange={(e) => updateData('leave', { ...data, approvalWorkflow: e.target.value })}
                                className="px-4 py-2 bg-[#00a65a] text-white border-none rounded-sm shadow-sm text-[10px] font-bold uppercase outline-none appearance-none cursor-pointer hover:bg-[#008d4c] transition-colors"
                            >
                                <option value="Manager -> HR">Manager {"->"} HR</option>
                                <option value="Manager Only">Manager Only</option>
                                <option value="HR Only">HR Only</option>
                                <option value="Manager -> Dept Head -> HR">Manager {"->"} Dept Head {"->"} HR</option>
                            </select>
                        </div>
                        <div className="w-6 h-[1px] bg-gray-300 relative">
                            <div className="absolute -right-1 -top-1 border-4 border-transparent border-l-gray-300" />
                        </div>
                        <div className="px-4 py-2 bg-white border border-[#00a65a] rounded-sm shadow-sm text-[10px] font-bold text-[#00a65a] uppercase">Approved</div>
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Configure the sequence of authority for leave requests.</p>
                </div>
            </div>
        </div>
    );
};

export default LeavePolicySetup;
