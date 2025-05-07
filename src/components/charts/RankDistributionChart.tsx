import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ArrowUpRight, Award } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { theme } from '../../lib/theme';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RankData {
  golongan: string;
  count: number;
  subGroups?: { pangkat: string; count: number }[];
}

interface RankDistributionChartProps {
  data: RankData[];
  onViewDetails?: () => void;
  detailsPosition?: 'side' | 'bottom';
}

const RankDistributionChart = ({ data, onViewDetails, detailsPosition = 'side' }: RankDistributionChartProps) => {
  const [activeGolongan, setActiveGolongan] = useState<string | null>(null);
  const [selectedGolonganClass, setSelectedGolonganClass] = useState<string | null>(null);
  
  // Use the ThemeContext hook instead of direct detection
  const { isDark, language } = useTheme();
  const { t } = useTranslation();
  
  // Consistent ordering helper function
  const getGolonganValue = (gol: string) => {
    const romanToNum: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
    const matches = gol.match(/^([IVX]+)\/([a-e])$/i) || gol.match(/^([IVX]+)([a-e])$/i);
    
    if (!matches) return 0;
    
    const baseValue = romanToNum[matches[1]] || 0;
    const subValue = matches[2] ? matches[2].toLowerCase().charCodeAt(0) - 96 : 0; // a=1, b=2, etc.
    
    return baseValue * 10 + subValue;
  };
  
  // Sort data by golongan in proper sequence (Ia to IVe)
  const sortedData = [...data].sort((a, b) => {
    return getGolonganValue(a.golongan) - getGolonganValue(b.golongan);
  });
  
  const labels = sortedData.map(item => item.golongan);
  const values = sortedData.map(item => item.count);
  const total = values.reduce((sum, value) => sum + value, 0);
  
  // Colors for each golongan category with emerald theme colors
  const golonganColors: Record<string, string> = {
    'I': '#10B981',    // Emerald 500
    'II': '#34D399',   // Emerald 400
    'III': '#6EE7B7',  // Emerald 300
    'IV': '#059669'    // Emerald 600
  };
  
  // Get color based on golongan
  const getGolonganColor = (golongan: string) => {
    const baseGolongan = golongan.match(/^([IVX]+)/)?.[1] || '';
    return golonganColors[baseGolongan] || '#94a3b8';
  };
  
  const backgroundColors = labels.map((label) => 
    activeGolongan === label 
      ? `${getGolonganColor(label)}` 
      : (selectedGolonganClass && label.startsWith(selectedGolonganClass) 
        ? `${getGolonganColor(label)}dd` 
        : selectedGolonganClass 
          ? `${getGolonganColor(label)}55` 
          : `${getGolonganColor(label)}cc`)
  );
  
  const borderColors = labels.map(label => getGolonganColor(label));
  
  const chartData = {
    labels,
    datasets: [
      {
        label: language === 'id' ? 'Jumlah Pegawai' : 'Employee Count',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 24,
        maxBarThickness: 40
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#E5E7EB' : '#2C3E50',
        bodyColor: isDark ? '#D1D5DB' : '#4B5563',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${language === 'id' ? 'Jumlah' : 'Count'}: ${formatNumber(value)} (${percentage}%)`;
          },
          footer: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            const item = sortedData[index];
            
            if (item.subGroups && item.subGroups.length > 0) {
              return [
                '',
                language === 'id' ? 'Pangkat:' : 'Rank:',
                ...item.subGroups.map(sub => 
                  `${sub.pangkat}: ${formatNumber(sub.count)}`
                )
              ];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#E5E7EB' : '#4B5563'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatNumber(value),
          color: isDark ? '#E5E7EB' : '#4B5563'
        },
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
        }
      }
    },
    onClick: (e: any, elements: any) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const label = labels[index];
        setActiveGolongan(activeGolongan === label ? null : label);
      }
    }
  } as any;
  
  // Group data by major golongan (I, II, III, IV)
  const golonganGroups: Record<string, number> = {};
  for (const item of sortedData) {
    const baseGolongan = item.golongan.match(/^([IVX]+)/)?.[1] || '';
    if (!golonganGroups[baseGolongan]) {
      golonganGroups[baseGolongan] = 0;
    }
    golonganGroups[baseGolongan] += item.count;
  }

  // Create ordered golongan class array
  const orderedGolonganClasses = ['I', 'II', 'III', 'IV'];
  
  // Get subgroups for the selected golongan class in proper order (a-e)
  const getSelectedClassDetails = () => {
    if (!selectedGolonganClass) return [];
    
    const isRoman = (str: string) => /^[IVX]+$/.test(str);
    
    return sortedData
      .filter(item => {
        // Extract the roman numeral part of the golongan
        const baseGolongan = item.golongan.match(/^([IVX]+)/)?.[1] || '';
        
        // Check if it exactly matches the selected class
        return isRoman(baseGolongan) && baseGolongan === selectedGolonganClass;
      })
      .map(item => ({
        golongan: item.golongan,
        count: item.count,
        percentage: ((item.count / total) * 100).toFixed(1),
        color: getGolonganColor(item.golongan),
        pangkat: item.subGroups && item.subGroups.length > 0 ? item.subGroups[0].pangkat : null
      }));
  };

  // Create an array for summary items
  const summaryItems = orderedGolonganClasses.map(golongan => ({
    label: golongan,
    value: golonganGroups[golongan] || 0,
    percentage: ((golonganGroups[golongan] || 0) / total * 100).toFixed(1),
    color: golonganColors[golongan] || '#94a3b8'
  }));

  // Handle golongan class selection
  const handleGolonganClassClick = (golonganClass: string) => {
    setSelectedGolonganClass(selectedGolonganClass === golonganClass ? null : golonganClass);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col border border-gray-100 dark:border-gray-700">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              {language === 'id' ? 'Pangkat & Golongan' : 'Rank & Class'}
            </h3>
          </div>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-xs text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center transition-colors duration-300"
            >
              {language === 'id' ? 'Lihat Detail' : 'View Details'}
              <ArrowUpRight size={14} className="ml-1" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col dark:bg-gray-800">
        {detailsPosition === 'side' ? (
          <div className="flex flex-col md:flex-row flex-1">
            <div className="flex-1 min-h-[260px] relative">
              <Bar 
                data={chartData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y'
                }}
              />
            </div>
            
            <div className="md:w-60 md:pl-4 md:border-l border-gray-100 dark:border-gray-700 mt-4 md:mt-0 flex flex-col">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {language === 'id' ? 'Ringkasan Kelas Golongan' : 'Class Summary'}
              </h4>
              
              <div className="space-y-3 overflow-y-auto flex-1">
                {summaryItems.map((item, i) => (
                  <div 
                    key={`summary-${i}`}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedGolonganClass === item.label
                        ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-sm' 
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleGolonganClassClick(item.label)}
                  >
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm font-medium ${selectedGolonganClass === item.label ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {language === 'id' ? 'Golongan' : 'Class'} {item.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{formatNumber(item.value)}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${(item.value / Math.max(...Object.values(golonganGroups))) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                    <div className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                      {item.percentage}%
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedGolonganClass && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    {language === 'id' ? `Detail Golongan ${selectedGolonganClass}` : `Class ${selectedGolonganClass} Details`}
                  </h4>
                  
                  <div className="space-y-2">
                    {getSelectedClassDetails().map((item, i) => (
                      <div 
                        key={`detail-${i}`} 
                        className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.golongan}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(item.count)}</span>
                        </div>
                        {item.pangkat && (
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 ml-5">
                            {language === 'id' ? 'Pangkat:' : 'Rank:'} {item.pangkat}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {item.percentage}% {language === 'id' ? 'dari total' : 'of total'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-[260px] relative">
              <Bar 
                data={chartData} 
                options={chartOptions}
              />
            </div>
            
            <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {language === 'id' ? 'Kategori Golongan' : 'Class Categories'}
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {summaryItems.map((item, i) => (
                  <div 
                    key={`summary-bottom-${i}`}
                    className={`p-3 rounded-lg border text-center cursor-pointer transition-all duration-200 ${
                      selectedGolonganClass === item.label
                        ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-sm' 
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleGolonganClassClick(item.label)}
                  >
                    <div 
                      className="w-8 h-1 mx-auto mb-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'id' ? 'Golongan' : 'Class'} {item.label}
                    </h5>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(item.value)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}%</p>
                  </div>
                ))}
              </div>
              
              {selectedGolonganClass && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {language === 'id' ? `Detail Golongan ${selectedGolonganClass}` : `Class ${selectedGolonganClass} Details`}
                    </h4>
                    <button 
                      onClick={() => setSelectedGolonganClass(null)}
                      className="text-xs text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      {language === 'id' ? 'Tutup' : 'Close'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {getSelectedClassDetails().map((item, i) => (
                      <div 
                        key={`detail-bottom-${i}`} 
                        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center"
                      >
                        <div 
                          className="w-6 h-1 mx-auto mb-1 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.golongan}</h5>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatNumber(item.count)}</p>
                        {item.pangkat && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {item.pangkat}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankDistributionChart; 