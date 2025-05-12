import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define context type
interface ThrottleContextType {
  isThrottled: boolean;
  throttleLevel: 'low' | 'medium' | 'high';
  setThrottleLevel: (level: 'low' | 'medium' | 'high') => void;
  throttle: <T extends (...args: any[]) => any>(fn: T, wait?: number) => (...args: Parameters<T>) => void;
}

// Create context
const ThrottleContext = createContext<ThrottleContextType | undefined>(undefined);

// Provider props
interface ThrottleProviderProps {
  children: ReactNode;
  defaultLevel?: 'low' | 'medium' | 'high';
}

/**
 * ThrottleProvider - Konteks untuk mengatur throttling operasi berat di dashboard
 * Membantu meningkatkan performa pada perangkat dengan spesifikasi rendah
 */
export const ThrottleProvider: React.FC<ThrottleProviderProps> = ({ 
  children, 
  defaultLevel = 'medium' 
}) => {
  // State untuk throttle level
  const [throttleLevel, setThrottleLevel] = useState<'low' | 'medium' | 'high'>(
    () => {
      // Coba dapatkan dari localStorage jika ada
      const savedLevel = localStorage.getItem('dashboard_throttle_level');
      if (savedLevel && ['low', 'medium', 'high'].includes(savedLevel)) {
        return savedLevel as 'low' | 'medium' | 'high';
      }
      return defaultLevel;
    }
  );
  
  // Apakah throttling aktif
  const isThrottled = throttleLevel !== 'low';

  // Fungsi throttle untuk membatasi jumlah eksekusi fungsi
  const throttle = <T extends (...args: any[]) => any>(
    fn: T,
    wait = 300
  ) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall < wait && isThrottled) {
        return;
      }
      lastCall = now;
      return fn(...args);
    };
  };

  // Simpan ke localStorage saat berubah
  useEffect(() => {
    localStorage.setItem('dashboard_throttle_level', throttleLevel);
  }, [throttleLevel]);

  return (
    <ThrottleContext.Provider value={{ isThrottled, throttleLevel, setThrottleLevel, throttle }}>
      {children}
    </ThrottleContext.Provider>
  );
};

/**
 * useThrottle - Hook untuk menggunakan throttle di komponen
 */
export const useThrottle = (): ThrottleContextType => {
  const context = useContext(ThrottleContext);
  if (context === undefined) {
    throw new Error('useThrottle must be used within a ThrottleProvider');
  }
  return context;
};

export default ThrottleProvider;
