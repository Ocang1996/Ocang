import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Menggunakan localStorage untuk menjaga konsistensi di semua halaman
  const savedExpanded = localStorage.getItem('sidebarExpanded') === 'true';
  const [expanded, setExpandedState] = useState(savedExpanded);

  // Setter untuk expanded state dengan penyimpanan ke localStorage
  const setExpanded = (value: boolean) => {
    setExpandedState(value);
    localStorage.setItem('sidebarExpanded', value ? 'true' : 'false');
  };

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
