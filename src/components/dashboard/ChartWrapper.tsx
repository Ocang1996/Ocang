import React, { ReactNode } from 'react';
import { useTheme } from '../../lib/ThemeContext';

interface ChartWrapperProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * ChartWrapper - Komponen pembungkus untuk chart dengan judul dan styling konsisten
 */
const ChartWrapper: React.FC<ChartWrapperProps> = ({ title, children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${isDark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white border border-gray-200'} ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default ChartWrapper;
