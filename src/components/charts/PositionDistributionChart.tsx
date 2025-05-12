import { useState } from 'react';
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
import { ArrowUpRight, Briefcase, X } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { useTheme } from '../../lib/ThemeContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Interface for position data
interface PositionData {
  type: string;
  count: number;
  subPositions?: { name: string; count: number; unit?: string }[];
}

interface PositionDistributionChartProps {
  data: PositionData[];
  onViewDetails?: () => void;
}

// Detail Panel Component
const DetailPanel = ({ 
  position, 
  onClose,
  positionIndex
}: { 
  position: PositionData, 
  onClose: () => void,
  positionIndex: number
}) => {
  const { language } = useTheme();
  
  return (
    <div className="mt-2 z-40 w-full overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700" 
         onClick={(e) => e.stopPropagation()}
    >
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              {language === 'id' ? 'Detail Jabatan' : 'Position Details'}: {position.type}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="px-6 py-4">
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {language === 'id' ? 'Total Pegawai' : 'Total Employees'}
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {formatNumber(position.count)}
                  </span>
                </div>
              </div>
            </div>
            
            {position.subPositions && position.subPositions.length > 0 ? (
              <>
                <h4 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {language === 'id' ? 'Rincian Jabatan' : 'Position Breakdown'}
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {position.subPositions.map((subPosition, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {subPosition.name}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {formatNumber(subPosition.count)}
                        </span>
                      </div>
                      {subPosition.unit && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {language === 'id' ? 'Unit' : 'Unit'}: {subPosition.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">
                  {language === 'id' ? 'Tidak ada detail tambahan untuk ditampilkan' : 'No additional details to display'}
                </p>
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-right">
            <button
              type="button"
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none"
              onClick={onClose}
            >
              {language === 'id' ? 'Tutup' : 'Close'}
            </button>
          </div>
    </div>
  );
};

const PositionDistributionChart = ({ data, onViewDetails }: PositionDistributionChartProps) => {
  const { isDark, language } = useTheme();
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const labels = data.map(item => item.type);
  const values = data.map(item => item.count);
  // Calculate total count of all positions
  const total = data.reduce((acc, item) => acc + item.count, 0);
  
  // Basic colors for each position type - menggunakan warna simpel yang mirip dengan versi sebelumnya
  const positionColors = [
    '#10B981', // Emerald 500 untuk Struktural
    '#34D399', // Emerald 400 untuk Fungsional
    '#6EE7B7'  // Emerald 300 untuk Administrasi/lainnya
  ];
  
  // Chart data untuk bar chart horizontal
  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: positionColors,
        borderColor: isDark ? '#1f2937' : '#ffffff',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 30,
        maxBarThickness: 35
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f3f4f6' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#4b5563',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        displayColors: true,
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${formatNumber(value)} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true,
          color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.7)',
        },
        ticks: {
          color: isDark ? '#d1d5db' : '#4b5563',
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#f3f4f6' : '#111827',
          font: {
            weight: 'bold',
            size: 12
          }
        }
      }
    },
    onClick: (_event: any, elements: any) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const positionType = data[index].type;
        setSelectedPosition(positionType);
        setShowDetail(true);
      }
    },
    onHover: (_event: any, elements: any) => {
      if (elements && elements.length > 0) {
        setHoveredIndex(elements[0].index);
      } else {
        setHoveredIndex(null);
      }
    }
  };
  
  // Selected position should be highlighted in UI
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col relative">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              {language === 'id' ? 'Distribusi Jabatan' : 'Position Distribution'}
            </h3>
          </div>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center transition-colors duration-300"
            >
              {language === 'id' ? 'Lihat Detail' : 'View Details'}
              <ArrowUpRight size={14} className="ml-1" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 flex-1 relative">
        <div className="h-60 mb-4 relative">
          <Bar 
            data={chartData} 
            options={chartOptions as any}
          />
        </div>
        
        <div className="mt-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800 mb-4">
            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {language === 'id' ? 'Ringkasan Jabatan' : 'Position Summary'}
            </h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
              {language === 'id' 
                ? `Total ${formatNumber(total)} pegawai terdistribusi dalam ${data.length} jenis jabatan.` 
                : `Total ${formatNumber(total)} employees distributed across ${data.length} position types.`}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {data.map((position, i) => {
              const percentage = ((position.count / total) * 100).toFixed(1);
              const isHovered = hoveredIndex === i;
              const isSelected = selectedPosition === position.type;
              
              return (
                <div key={i}>
                  <div 
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-150 border ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700' 
                        : isHovered 
                          ? 'bg-gray-50 dark:bg-gray-700 shadow-sm border-gray-200 dark:border-gray-600' 
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      // Toggle detail if clicking the same position again
                      if (selectedPosition === position.type) {
                        setShowDetail(!showDetail);
                      } else {
                        setSelectedPosition(position.type);
                        setShowDetail(true); 
                      }
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: positionColors[i % positionColors.length] }}
                      ></div>
                      <span className="font-medium text-gray-800 dark:text-white truncate">
                        {position.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(position.count)}
                      </span>
                      <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  
                  {showDetail && selectedPosition === position.type && (
                    <DetailPanel 
                      position={position} 
                      onClose={() => setShowDetail(false)}
                      positionIndex={i}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionDistributionChart; 