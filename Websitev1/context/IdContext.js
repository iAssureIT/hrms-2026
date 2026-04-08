"use client";
import React, { createContext, useContext, useState } from 'react';

export const idContext = createContext();

export const IdProvider = ({ children }) => {
    const [approvalId, setApprovalId] = useState("");
    
    return (
        <idContext.Provider value={{ approvalId, setApprovalId }}>
            {children}
        </idContext.Provider>
    );
};

export const useId = () => useContext(idContext);
