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
            confirmButtonColor: '#00a65a',
            cancelButtonColor: '#d33',
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
        <div className="space-y-8">
            {/* Header with Location Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                    <MdCalendarMonth size={18} className="text-[#00a65a]" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                        Holiday Calendars
                    </h3>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-sm">
                    {['Global', 'Mumbai', 'Pune', 'Bangalore'].map((loc) => (
                        <button
                            key={loc}
                            onClick={() => setSelectedLocation(loc)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-tight rounded-sm transition-all ${
                                selectedLocation === loc 
                                ? 'bg-white text-[#00a65a] shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {loc}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-sm hover:border-[#00a65a] transition-all group">
                    <div className="p-2 bg-gray-50 text-[#00a65a] rounded-sm group-hover:bg-[#00a65a] group-hover:text-white transition-colors">
                        <MdAdd size={20} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-tight">Add Holiday</h4>
                        <p className="text-[10px] text-gray-400 italic">Manual entry for single holiday</p>
                    </div>
                </button>
                <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-sm hover:border-[#3c8dbc] transition-all group">
                    <div className="p-2 bg-gray-50 text-[#3c8dbc] rounded-sm group-hover:bg-[#3c8dbc] group-hover:text-white transition-colors">
                        <MdFileUpload size={20} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-tight">Bulk Upload</h4>
                        <p className="text-[10px] text-gray-400 italic">Import from CSV/Excel</p>
                    </div>
                </button>
            </div>

            {/* Holiday List */}
            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Upcoming Holidays ({selectedLocation})</h4>
                    <span className="text-[10px] font-bold text-gray-400">
                        {filteredHolidays.length} Records
                    </span>
                </div>
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400 italic text-sm">Loading holidays...</div>
                    ) : filteredHolidays.length > 0 ? (
                        filteredHolidays.map((holiday) => (
                            <div key={holiday._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="text-center min-w-[50px] border-r border-gray-100 pr-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">{new Date(holiday.date).toLocaleString('default', { month: 'short' })}</div>
                                        <div className="text-xl font-bold text-gray-800 tracking-tighter">{new Date(holiday.date).getDate()}</div>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-800 uppercase tracking-tight">{holiday.holidayName}</h5>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${holiday.type === 'Mandatory' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-500'}`}>
                                                {holiday.type}
                                            </span>
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase">
                                                <MdLocationOn size={10} /> {holiday.locations.join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 text-gray-400 hover:text-[#00a65a] hover:bg-green-50 rounded-sm transition-all">
                                        <MdChevronRight size={18} />
                                    </button>
                                    <button 
                                        onClick={() => deleteHoliday(holiday._id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                                    >
                                        <MdDelete size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center flex flex-col items-center gap-2">
                            <MdCalendarMonth size={32} className="text-gray-200" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">No holidays found for this location</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HolidayMapping;
