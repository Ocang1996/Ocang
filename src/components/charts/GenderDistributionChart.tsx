import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ArrowUpRight, Users } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { theme } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface GenderDistributionData {
  male: number;
  female: number;
}

interface GenderDistributionChartProps {
  data: GenderDistributionData;
  previousYearData?: GenderDistributionData;
  onViewDetails?: () => void;
  detailsPosition?: 'side' | 'bottom';
}

const GenderDistributionChart = ({ data, previousYearData, onViewDetails, detailsPosition = 'side' }: GenderDistributionChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Use the useTheme hook instead of tracking dark mode directly
  const { isDark, language } = useTheme();
  const { t } = useTranslation();
  
  const chartLabels = language === 'id' ? ['Laki-laki', 'Perempuan'] : ['Male', 'Female'];
  const chartData = [data.male, data.female];
  const total = chartData.reduce((acc, cur) => acc + cur, 0);
  
  // Set chart colors (use theme colors)
  const maleColor = theme.primary.main;     // Emerald 500 for male
  const femaleColor = theme.secondary.main; // Emerald 300 for female
  
  // Enhanced 3D gradients dengan warna tema
  const createGradient = (ctx: CanvasRenderingContext2D, mainColor: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    
    // Konversi hex ke RGB
    const colorObj = hexToRgb(mainColor);
    
    // Buat versi lebih terang dan gelap
    const lighterColor = `rgba(${colorObj.r + 30}, ${colorObj.g + 30}, ${colorObj.b + 30}, 0.8)`;
    const darkerColor = `rgba(${colorObj.r - 10}, ${colorObj.g - 10}, ${colorObj.b - 10}, 0.9)`;
    
    gradient.addColorStop(0, lighterColor);
    gradient.addColorStop(0.5, mainColor);
    gradient.addColorStop(1, darkerColor);
    return gradient;
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
  
  // Get chart colors untuk background
  const getChartColors = (ctx: any) => {
    if (!ctx) return [maleColor, femaleColor];
    
    return [
      createGradient(ctx, maleColor),
      createGradient(ctx, femaleColor)
    ];
  };
  
  // Hover shadow effect
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
  
  // Center text plugin to display total
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw: (chart: any) => {
      const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
      
      ctx.save();
      
      // Draw circular background
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;
      const radius = Math.min(width, height) * 0.22; // Increased radius
      
      // Add shadow to the background circle
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(17, 24, 39, 0.9)';
      ctx.fill();
      
      // Reset shadow for the stroke and text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Add stroke around the circle
      ctx.strokeStyle = isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(55, 65, 81, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw total count with subtle shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(formatNumber(total), centerX, centerY);
      
      ctx.restore();
    }
  };

  const chartDataConfig = {
    labels: chartLabels,
    datasets: [
      {
        data: chartData,
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const { ctx } = chart;
          return getChartColors(ctx);
        } as any,
        borderColor: [maleColor, femaleColor],
        borderWidth: 2,
        hoverOffset: 15,
        hoverBorderWidth: 0,
        hoverBorderColor: '#ffffff',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        position: 'bottom' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12
          },
          color: isDark ? '#E5E7EB' : theme.neutral.text.primary,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
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
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatNumber(value)} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: 'easeOutQuart'
    },
    elements: {
      arc: {
        borderRadius: 6,
      }
    },
    cutout: '50%',
    onHover: (event: any, elements: any) => {
      if (elements && elements.length) {
        setHoveredIndex(elements[0].index);
      } else {
        setHoveredIndex(null);
      }
    }
  } as any;

  // Calculated metrics
  const malePercentage = ((data.male / total) * 100).toFixed(1);
  const femalePercentage = ((data.female / total) * 100).toFixed(1);
  
  // Gender ratio insights
  const getRatioInsight = () => {
    const diff = Math.abs(data.male - data.female);
    const diffPercentage = ((diff / total) * 100).toFixed(1);
    
    if (Math.abs(data.male - data.female) / total < 0.1) {
      return {
        title: language === 'id' ? "Rasio Seimbang" : "Balanced Ratio",
        description: language === 'id' 
          ? `Rasio gender cukup seimbang dengan selisih hanya ${diffPercentage}%.`
          : `Gender ratio is fairly balanced with only ${diffPercentage}% difference.`
      };
    } else if (data.male > data.female) {
      return {
        title: language === 'id' ? "Dominasi Laki-laki" : "Male Dominance",
        description: language === 'id'
          ? `Jumlah ASN laki-laki lebih banyak ${diffPercentage}% dibanding perempuan.`
          : `Male employees outnumber females by ${diffPercentage}%.`
      };
    } else {
      return {
        title: language === 'id' ? "Dominasi Perempuan" : "Female Dominance",
        description: language === 'id'
          ? `Jumlah ASN perempuan lebih banyak ${diffPercentage}% dibanding laki-laki.`
          : `Female employees outnumber males by ${diffPercentage}%.`
      };
    }
  };
  
  const ratioInsight = getRatioInsight();

  // Generate gender detail cards
  const genderDetails = [
    {
      label: language === 'id' ? 'Laki-laki' : 'Male',
      count: data.male,
      percentage: ((data.male / total) * 100).toFixed(1),
      color: maleColor,
      change: previousYearData 
        ? ((data.male - previousYearData.male) / previousYearData.male * 100).toFixed(1) 
        : null
    },
    {
      label: language === 'id' ? 'Perempuan' : 'Female',
      count: data.female,
      percentage: ((data.female / total) * 100).toFixed(1),
      color: femaleColor,
      change: previousYearData 
        ? ((data.female - previousYearData.female) / previousYearData.female * 100).toFixed(1) 
        : null
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden relative">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-[#10B981] dark:text-emerald-400" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              {language === 'id' ? 'Distribusi Jenis Kelamin' : 'Gender Distribution'}
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
      
      <div className="p-4 flex-1 flex flex-col dark:bg-gray-800">
        {detailsPosition === 'side' ? (
          <div className="flex flex-col md:flex-row">
            {/* Chart area */}
            <div className="flex-1 min-h-[280px] relative">
              <Pie 
                data={chartDataConfig} 
                options={{
                  ...chartOptions,
                  layout: {
                    padding: {
                      top: 15,
                      right: 15,
                      bottom: 15,
                      left: 15
                    }
                  }
                }}
                plugins={[shadowPlugin]}
              />
            </div>
            
            {/* Stats area */}
            <div className="flex-1 mt-8 md:mt-0 md:ml-6 md:border-l border-gray-100 dark:border-gray-700 md:pl-6 flex flex-col justify-center">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {language === 'id' ? 'Insight Distribusi' : 'Distribution Insight'}
                </h4>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <h5 className="text-base font-bold text-emerald-800 dark:text-emerald-300">{ratioInsight.title}</h5>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">{ratioInsight.description}</p>
                </div>
              </div>
              
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {language === 'id' ? 'Distribusi' : 'Distribution'}
              </h4>
              
              <div className="space-y-4">
                {genderDetails.map((gender, index) => {
                  const isHighlighted = hoveredIndex === index;
                  
                  return (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                        isHighlighted 
                          ? 'bg-gray-100 dark:bg-gray-700 shadow-md transform scale-[1.02] border border-gray-200 dark:border-gray-600' 
                          : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-100 dark:border-gray-700'
                      }`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div 
                          className="h-1.5 w-12 rounded-full mb-1" 
                          style={{ backgroundColor: gender.color }}
                        ></div>
                        
                        <h5 className="text-lg font-bold text-gray-800 dark:text-white">
                          {gender.label}
                        </h5>
                        
                        <span className="block text-xl font-bold text-gray-700 dark:text-white">
                          {formatNumber(gender.count)}
                        </span>
                        
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                          {gender.percentage}%
                        </span>
                        
                        {gender.change && (
                          <div className={`text-xs font-medium mt-1 px-1.5 py-0.5 rounded-sm flex items-center ${
                            parseFloat(gender.change) > 0 
                              ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40' 
                              : parseFloat(gender.change) < 0 
                                ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40' 
                                : 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/40'
                          }`}>
                            {parseFloat(gender.change) > 0 ? '↑' : parseFloat(gender.change) < 0 ? '↓' : '●'} 
                            {Math.abs(parseFloat(gender.change))}% {language === 'id' ? 'dari tahun lalu' : 'from last year'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Chart in full width */}
            <div className="flex-1 min-h-[250px] relative">
              <Pie 
                data={chartDataConfig} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'bottom'
                    }
                  },
                  layout: {
                    padding: {
                      top: 15,
                      right: 15,
                      bottom: 15,
                      left: 15
                    }
                  }
                }}
                plugins={[shadowPlugin]}
              />
            </div>
            
            {/* Bottom stats */}
            <div className="mt-6">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {language === 'id' ? 'Insight Distribusi' : 'Distribution Insight'}
                </h4>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <h5 className="text-base font-bold text-emerald-800 dark:text-emerald-300">{ratioInsight.title}</h5>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">{ratioInsight.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {genderDetails.map((gender, index) => {
                  const isHighlighted = hoveredIndex === index;
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-center ${
                        isHighlighted 
                          ? 'shadow-md border-gray-300 dark:border-gray-600' 
                          : ''
                      }`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div 
                        className="h-1.5 w-12 mx-auto rounded-full mb-2" 
                        style={{ backgroundColor: gender.color }}
                      ></div>
                      
                      <h5 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        {gender.label}
                      </h5>
                      
                      <p className="text-xl font-semibold text-gray-700 dark:text-white mb-1">
                        {formatNumber(gender.count)}
                      </p>
                      
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                        {gender.percentage}%
                      </span>
                      
                      {gender.change && (
                        <div className={`text-xs font-medium mt-2 px-1.5 py-0.5 rounded-sm inline-flex items-center ${
                          parseFloat(gender.change) > 0 
                            ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40' 
                            : parseFloat(gender.change) < 0 
                              ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40' 
                              : 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/40'
                        }`}>
                          {parseFloat(gender.change) > 0 ? '↑' : parseFloat(gender.change) < 0 ? '↓' : '●'} 
                          {Math.abs(parseFloat(gender.change))}% {language === 'id' ? 'dari tahun lalu' : 'from last year'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenderDistributionChart; 