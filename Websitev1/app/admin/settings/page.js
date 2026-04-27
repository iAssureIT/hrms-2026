"use client";

import React from "react";
import { FaHome } from "react-icons/fa";
import Settings from "@/widgets/Settings/Settings";

const SettingsPage = () => {
  return (
    <section className="section admin-box box-primary">
      <main className="flex flex-col h-full bg-white overflow-hidden">
        <Settings />
      </main>
    </section>
  );
};

export default SettingsPage;
