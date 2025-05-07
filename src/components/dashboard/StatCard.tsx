import React from 'react';
import { formatNumber } from '../../lib/utils';
import { theme } from '../../lib/theme';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  change?: number;
  period?: string;
}

const StatCard = ({ title, value, icon, change = 0, period = "bulan" }: StatCardProps) => {
  // Determine if the change is positive, negative, or neutral
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;
  
  // Get theme context
  const isDark = document.documentElement.classList.contains('dark');
  
  // Dynamic gradient based on change direction
  const getGradientBackground = () => {
    if (isDark) {
      if (isPositive) {
        return `linear-gradient(to bottom right, rgba(31, 41, 55, 0.6), rgba(31, 41, 55, 0.6), rgba(16, 185, 129, 0.2))`;
      } else if (isNeutral) {
        return `linear-gradient(to bottom right, rgba(31, 41, 55, 0.6), rgba(31, 41, 55, 0.6), rgba(16, 185, 129, 0.2))`;
      } else {
        return `linear-gradient(to bottom right, rgba(31, 41, 55, 0.6), rgba(31, 41, 55, 0.6), rgba(16, 185, 129, 0.2))`;
      }
    } else {
      if (isPositive) {
        return `linear-gradient(to bottom right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7), ${theme.primary.light}30)`;
      } else if (isNeutral) {
        return `linear-gradient(to bottom right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7), ${theme.primary.light}30)`;
      } else {
        return `linear-gradient(to bottom right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7), ${theme.primary.light}30)`;
      }
    }
  };

  return (
    <div
      className="backdrop-blur-md rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-6 shadow-sm hover:shadow-md transition-all duration-300"
      style={{
        background: getGradientBackground(),
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h2>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">{formatNumber(value)}</p>
        </div>
        
        {icon && (
          <div className="p-2.5 bg-white/80 dark:bg-gray-700/80 rounded-full text-emerald-600 dark:text-emerald-400 shadow-sm">
            {icon}
          </div>
        )}
      </div>
      
      {change !== null && (
        <div className="mt-4 flex items-center text-xs">
          <span className={`mr-1 ${
              isPositive 
                ? 'text-emerald-500 dark:text-emerald-400' 
                : isNegative 
                  ? 'text-emerald-500 dark:text-emerald-400' 
                  : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {isPositive ? '↑' : isNegative ? '↓' : '·'} 
            {Math.abs(change)}%
          </span>
          
          <span className="text-gray-500 dark:text-gray-400">
            dari {period} lalu
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;