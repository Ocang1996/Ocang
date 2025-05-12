import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Menggunakan localStorage untuk menjaga konsistensi di semua halaman
  // Default ke true jika tidak ada nilai tersimpan (first-time user)
  const savedExpanded = localStorage.getItem('sidebarExpanded') !== 'false';
  const [expanded, setExpandedState] = useState(savedExpanded);

  // Effect untuk sinkronisasi state antar tab/window
  useEffect(() => {
    // Handler untuk storage events
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'sidebarExpanded' && event.newValue !== null) {
        setExpandedState(event.newValue === 'true');
      }
    };

    // Pastikan state tersimpan saat pertama kali load
    if (localStorage.getItem('sidebarExpanded') === null) {
      localStorage.setItem('sidebarExpanded', 'true');
    }

    // Subscribe ke storage events untuk sinkronisasi antar tab/window
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
