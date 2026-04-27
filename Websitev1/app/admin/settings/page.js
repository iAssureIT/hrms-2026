"use client";

import React from "react";
import { FaHome } from "react-icons/fa";
import Settings from "@/widgets/Settings/Settings";

const SettingsPage = () => {
  return (
    <section className="section">
      <main className="min-h-screen p-4 lg:p-8 font-sans">
        <div className="mx-auto">
          {/* AdminLTE style Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-normal text-gray-800 tracking-tight">
                System Settings
              </h1>
              <span className="text-sm font-light text-gray-500">
                Control panel
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-normal text-gray-700 mt-4 md:mt-0">
              <FaHome className="text-gray-400" />
              <span>Home</span>
              <span className="text-gray-400">&gt;</span>
              <span className="text-gray-400 font-bold">Settings</span>
            </div>
          </div>

          {/* Settings Widget */}
          <Settings />

          {/* Footer Info */}
          <div className="mt-8 flex justify-between items-center px-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              © 2026 Admin Portal. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#00a65a] transition-colors"
              >
                Documentation
              </a>
              <a
                href="#"
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#00a65a] transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default SettingsPage;
