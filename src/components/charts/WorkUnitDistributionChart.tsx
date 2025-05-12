import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ArrowUpRight, Building } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { theme } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface WorkUnitData {
  name: string;
  count: number;
}

interface WorkUnitDistributionChartProps {
  data: WorkUnitData[];
  maxDisplay?: number;
  onViewDetails?: () => void;
  onWorkUnitClick?: (unitName: string) => void;
  interactive?: boolean;
  parentUnit?: string;
}

const WorkUnitDistributionChart = ({ 
  data, 
  maxDisplay = 5,
  onViewDetails,
  onWorkUnitClick,
  interactive = false,
  parentUnit
}: WorkUnitDistributionChartProps) => {
  const [highlightedUnit, setHighlightedUnit] = useState<number | null>(null);
  
  // Use the ThemeContext hook instead of detecting dark mode manually
  const { isDark, language } = useTheme();
  const { t } = useTranslation();
  
  // Sort data by count in descending order
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  
  // Take top N units plus create "Lainnya" category if needed
  let displayData: WorkUnitData[] = [];
  const total = data.reduce((sum, unit) => sum + unit.count, 0);
  
  if (sortedData.length <= maxDisplay) {
    displayData = sortedData;
  } else {
    // Take top maxDisplay-1 items
    const topUnits = sortedData.slice(0, maxDisplay - 1);
    
    // Combine the rest into "Lainnya"/"Others"
    const otherUnits = sortedData.slice(maxDisplay - 1);
    const otherCount = otherUnits.reduce((sum, unit) => sum + unit.count, 0);
    
    displayData = [
      ...topUnits,
      { name: language === 'id' ? 'Lainnya' : 'Others', count: otherCount }
    ];
  }
  
  const labels = displayData.map(unit => unit.name);
  const counts = displayData.map(unit => unit.count);
  
  // Gunakan warna dari tema
  const chartColors = [
    ...theme.chart.categoryColors.slice(0, maxDisplay),
    theme.neutral.text.secondary // Untuk "Unit Lainnya"
  ];
  
  // Fungsi untuk membuat gradient warna
  const getGradientColors = (ctx: any) => {
    if (!ctx) return chartColors;
    
    return chartColors.map((color, index) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      const colorObj = hexToRgb(color);
      
      // Buat versi lebih terang dan gelap
      const lighterColor = `rgba(${colorObj.r + 30}, ${colorObj.g + 30}, ${colorObj.b + 30}, 0.8)`;
      const darkerColor = `rgba(${colorObj.r - 10}, ${colorObj.g - 10}, ${colorObj.b - 10}, 0.9)`;
      
      gradient.addColorStop(0, lighterColor);
      gradient.addColorStop(1, darkerColor);
      return gradient;
    });
  };
  
  // Helper untuk konversi hex ke RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx} = chart;
          return getGradientColors(ctx);
        } as any,
        borderColor: chartColors,
        borderWidth: 2,
        hoverOffset: 15,
        hoverBorderWidth: 0,
        hoverBorderColor: isDark ? '#1F2937' : theme.neutral.white,
      },
    ],
  };

  // Plugin untuk efek shadow dan texture
  const shadowPlugin = {
    id: 'shadow',
    beforeDraw: (chart: any) => {
      const { ctx } = chart;
      ctx.save();
      ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
    },
    afterDraw: (chart: any) => {
      chart.ctx.restore();
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? theme.primary.light : theme.primary.main,
        bodyColor: isDark ? '#D1D5DB' : theme.neutral.text.primary,
        borderColor: isDark ? '#374151' : theme.neutral.border,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          size: 13,
          family: 'Inter, sans-serif'
        },
        callbacks: {
          title: (tooltipItems: any) => {
            return tooltipItems[0].label;
          },
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${formatNumber(value)} ${language === 'id' ? 'pegawai' : 'employees'} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: 'easeOutQuart',
    },
    hover: {
      mode: 'index',
      intersect: true,
    },
    elements: {
      arc: {
        borderRadius: 6,
      }
    },
    onHover: (event: any, elements: any) => {
      if (elements && elements.length) {
        setHighlightedUnit(elements[0].index);
        
        // Add data attribute for interactive elements
        if (interactive && event && event.native) {
          const canvas = event.native.target;
          canvas.style.cursor = 'pointer';
          
          // Set data attribute for unit name
          if (elements[0].index < labels.length) {
            canvas.setAttribute('data-unit-name', labels[elements[0].index]);
          }
        }
      } else {
        setHighlightedUnit(null);
        
        // Reset cursor when not hovering over a segment
        if (interactive && event && event.native) {
          event.native.target.style.cursor = 'default';
        }
      }
    },
    // Add onClick handler if interactive
    onClick: interactive ? (event: any, elements: any) => {
      if (elements && elements.length > 0 && onWorkUnitClick) {
        const clickedIndex = elements[0].index;
        if (clickedIndex < labels.length) {
          onWorkUnitClick(labels[clickedIndex]);
        }
      }
    } : undefined
  } as any;
  
  // Informasi insight tentang distribusi unit kerja
  const getUnitInsight = () => {
    // Cek apakah data tersedia
    if (!displayData || displayData.length === 0) {
      return {
        topUnit: '-',
        topPercentage: '0',
        type: language === 'id' ? 'Tidak Ada Data' : 'No Data',
        description: language === 'id' 
          ? 'Belum ada data pegawai yang tersedia untuk ditampilkan.' 
          : 'No employee data available to display.'
      };
    }

    // Unit dengan pegawai terbanyak
    const topUnit = displayData[0];
    const topPercentage = ((topUnit.count / total) * 100).toFixed(1);
    
    // Hitung tingkat penyebaran (Coefficient of Variation)
    const mean = total / displayData.length;
    const variance = displayData.reduce((sum, unit) => sum + Math.pow(unit.count - mean, 2), 0) / displayData.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;
    
    let distributionType = "";
    let description = "";
    
    if (cv < 0.3) {
      distributionType = language === 'id' ? "Distribusi Merata" : "Even Distribution";
      description = language === 'id' 
        ? `Pegawai cukup merata di berbagai unit kerja dengan variasi sebaran rendah.`
        : `Employees are evenly distributed across work units with low variance.`;
    } else if (cv < 0.7) {
      distributionType = language === 'id' ? "Distribusi Cukup Merata" : "Moderately Even Distribution";
      description = language === 'id'
        ? `Terdapat variasi sedang dalam jumlah pegawai antar unit kerja.`
        : `There is moderate variation in employee count between work units.`;
    } else {
      distributionType = language === 'id' ? "Distribusi Tidak Merata" : "Uneven Distribution";
      description = language === 'id'
        ? `Terdapat ketimpangan yang signifikan dalam distribusi pegawai antar unit kerja.`
        : `There is significant imbalance in employee distribution across work units.`;
    }
    
    return {
      topUnit: topUnit.name,
      topPercentage: topPercentage,
      type: distributionType,
      description: description
    };
  };
  
  const unitInsight = getUnitInsight();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building className="mr-2 h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              {language === 'id' ? 'Distribusi Unit Kerja' : 'Work Unit Distribution'}
              {parentUnit && ` - ${parentUnit}`}
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
      
      <div className="p-4 flex-1 flex flex-col md:flex-row dark:bg-gray-800">
        <div className="md:w-1/2 flex-shrink-0 flex flex-col">
          <div className="relative h-60 md:h-64 flex items-center justify-center">
            <Doughnut 
              data={chartData}
              options={chartOptions}
              plugins={[shadowPlugin]}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'id' ? 'Total' : 'Total'}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{formatNumber(total)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'id' ? 'pegawai' : 'employees'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2 md:pl-4 mt-4 md:mt-0 flex flex-col">
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{unitInsight.type}</h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">{unitInsight.description}</p>
          </div>
          
          <div className="flex-1 overflow-auto">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              {language === 'id' ? 'Unit Kerja Teratas' : 'Top Work Units'}
            </h4>
            
            <ul className="space-y-2 text-sm">
              {displayData.map((unit, i) => {
                const percentage = ((unit.count / total) * 100).toFixed(1);
                const isHighlighted = highlightedUnit === i;
                // Get dynamic color from chart colors array
                const unitColor = i < chartColors.length ? chartColors[i] : chartColors[chartColors.length - 1];
                
                return (
                  <li 
                    key={i}
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isHighlighted 
                        ? 'bg-gray-100 dark:bg-gray-700' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${
                      interactive ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    onMouseEnter={() => setHighlightedUnit(i)}
                    onMouseLeave={() => setHighlightedUnit(null)}
                    onClick={() => {
                      if (interactive && onWorkUnitClick && unit.name !== (language === 'id' ? 'Lainnya' : 'Others')) {
                        onWorkUnitClick(unit.name);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: unitColor }}
                        ></div>
                        <span className={`font-medium truncate max-w-[120px] ${
                          isHighlighted 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {unit.name}
                        </span>
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatNumber(unit.count)}
                      </span>
                    </div>
                    
                    <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${percentage}%`, backgroundColor: unitColor }}
                      ></div>
                    </div>
                    
                    <div className="mt-1 text-right">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkUnitDistributionChart; 