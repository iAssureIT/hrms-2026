"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdCalendarMonth, MdLocationOn, MdFileUpload, MdAdd, MdDelete, MdChevronRight } from "react-icons/md";
import Swal from "sweetalert2";

const HolidayMapping = () => {
    const [locations, setLocations] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('Global');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLocations();
        fetchHolidays();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`);
            setLocations(['Global', ...res.data.map(c => c.centerName)]);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/holidays/get/list`);
            // The API returns { success: true, count: X, data: [...] }
            setHolidays(res.data.data || []);
        } catch (error) {
            console.error("Error fetching holidays:", error);
            setHolidays([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteHoliday = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/holidays/delete/${id}`);
                Swal.fire('Deleted!', 'Holiday has been deleted.', 'success');
                fetchHolidays();
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete holiday.', 'error');
            }
        }
    };

    const filteredHolidays = Array.isArray(holidays) ? holidays.filter(h => 
        selectedLocation === 'Global' || h.locations.includes(selectedLocation) || h.locations.includes('Global')
    ) : [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Location Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                            <MdCalendarMonth size={20} />
                        </div>
                        Holiday Calendars
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Manage public holidays and regional calendar mappings.</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
                    {['Global', 'Bangalore', 'Mumbai'].map((loc) => (
                        <button
                            key={loc}
                            onClick={() => setSelectedLocation(loc)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                selectedLocation === loc 
                                ? 'bg-white text-green-600 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {loc}
                        </button>
                    ))}
                    <button className="p-2 text-slate-400 hover:text-green-600 transition-colors">
                        <MdChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-3xl hover:border-green-400 hover:shadow-xl hover:shadow-green-500/5 transition-all group">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-500">
                        <MdAdd size={24} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-black text-slate-800">Add Holiday</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manual Entry</p>
                    </div>
                </button>
                <button className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-3xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                        <MdFileUpload size={24} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-black text-slate-800">Bulk Upload</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CSV/Excel Format</p>
                    </div>
                </button>
            </div>

            {/* Holiday List */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Upcoming Holidays</h4>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500">
                        {filteredHolidays.length} Records Found
                    </span>
                </div>
                <div className="divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 animate-pulse">Loading holidays...</div>
                    ) : filteredHolidays.length > 0 ? (
                        filteredHolidays.map((holiday) => (
                            <div key={holiday._id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className="text-center min-w-[60px]">
                                        <div className="text-xs font-black text-slate-400 uppercase">{new Date(holiday.date).toLocaleString('default', { month: 'short' })}</div>
                                        <div className="text-2xl font-black text-slate-800 tracking-tighter">{new Date(holiday.date).getDate()}</div>
                                    </div>
                                    <div className="h-10 w-[1px] bg-slate-100" />
                                    <div>
                                        <h5 className="text-sm font-black text-slate-800">{holiday.holidayName}</h5>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${holiday.type === 'Mandatory' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {holiday.type}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                                <MdLocationOn size={10} /> {holiday.locations.join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                                        <MdChevronRight size={20} />
                                    </button>
                                    <button 
                                        onClick={() => deleteHoliday(holiday._id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-100 rounded-full text-slate-300">
                                <MdCalendarMonth size={48} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No holidays assigned to {selectedLocation}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HolidayMapping;
