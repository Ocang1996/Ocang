import { useState, useEffect, useRef, useMemo } from 'react';
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
import { ArrowUpRight, CalendarClock } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { theme } from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AgeDistributionData {
  under30: number;
  between30And40: number;
  between41And50: number;
  above50: number;
}

interface AgeDistributionChartProps {
  data: AgeDistributionData;
  onViewDetails?: () => void;
}

// Wrapper component untuk memaksa rerender
const AgeDistributionChartWrapper = (props: AgeDistributionChartProps) => {
  // Selalu generate key baru setiap kali data berubah
  const key = useMemo(() => `age-chart-${JSON.stringify(props.data)}-${Date.now()}`, [props.data]);

  // Log data untuk debug
  console.log('AgeDistributionChartWrapper rendering with data:', {
    ...props.data,
    total: props.data.under30 + props.data.between30And40 + props.data.between41And50 + props.data.above50,
    key,
    timestamp: new Date().toISOString()
  });

  // Render komponen dengan key yang selalu baru
  return <AgeDistributionChart {...props} key={key} />;
};

const AgeDistributionChart = ({ data, onViewDetails }: AgeDistributionChartProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [rotateX, setRotateX] = useState(10);
  const [rotateY, setRotateY] = useState(5);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark, language } = useTheme();
  const { t } = useTranslation();
  
  // Force re-render when the data changes
  const chartKey = useMemo(() => `age-chart-${JSON.stringify(data)}-${Date.now()}`, [data]);
  
  // Log data untuk debugging
  console.log('AgeDistributionChart rendered with data:', {
    under30: data.under30,
    between30And40: data.between30And40,
    between41And50: data.between41And50,
    above50: data.above50,
    total: data.under30 + data.between30And40 + data.between41And50 + data.above50,
    chartKey,
    timestamp: new Date().toISOString()
  });

  // Detect dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const labels = language === 'id' 
    ? ['<30 Tahun', '30-40 Tahun', '41-50 Tahun', '>50 Tahun'] 
    : ['<30 Years', '30-40 Years', '41-50 Years', '>50 Years'];
  const dataValues = [
    data.under30,
    data.between30And40,
    data.between41And50,
    data.above50
  ];
  
  // Gunakan warna dari tema
  const ageColors = [
    theme.chart.categoryColors[0], // Emerald 500
    theme.chart.categoryColors[1], // Emerald 400
    theme.chart.categoryColors[2], // Emerald 300
    theme.chart.categoryColors[3], // Emerald 200
  ];
  
  // Calculated values
  const total = dataValues.reduce((acc, curr) => acc + curr, 0);
  const highestGroup = Math.max(...dataValues);
  const highestGroupIndex = dataValues.indexOf(highestGroup);
  
  // Prepare colors for the bars
  const getGradients = (ctx: any, chartArea: any) => {
    if (!chartArea) return Array(4).fill(theme.secondary.main);
    
    const gradients = ageColors.map((color) => {
      const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      // Create lighter and darker versions of the color
      const colorObj = hexToRgb(color);
      const lighterColor = `rgba(${colorObj.r + 30}, ${colorObj.g + 30}, ${colorObj.b + 30}, 0.8)`;
      const darkerColor = `rgba(${colorObj.r - 10}, ${colorObj.g - 10}, ${colorObj.b - 10}, 0.9)`;
      
      gradient.addColorStop(0, lighterColor);
      gradient.addColorStop(1, darkerColor);
      return gradient;
    });
    
    return gradients;
  };
  
  // Helper to convert hex to rgb
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
        label: language === 'id' ? 'Jumlah Pegawai' : 'Employee Count',
        data: dataValues,
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return Array(4).fill(theme.secondary.main);
          }
          
          return getGradients(ctx, chartArea)[context.dataIndex];
        },
        borderWidth: 1,
        borderColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return Array(4).fill(theme.secondary.dark);
          }
          
          const index = context.dataIndex;
          return ageColors[index];
        } as any,
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0
        },
        borderSkipped: false,
        barThickness: 40,
        maxBarThickness: 50,
        hoverBackgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return Array(4).fill(theme.secondary.dark);
          }
          
          // Brighter version for hover
          const index = context.dataIndex;
          const colorObj = hexToRgb(ageColors[index]);
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, `rgba(${colorObj.r + 40}, ${colorObj.g + 40}, ${colorObj.b + 40}, 0.9)`);
          gradient.addColorStop(1, `rgba(${colorObj.r + 10}, ${colorObj.g + 10}, ${colorObj.b + 10}, 1)`);
          return gradient;
        },
        hoverBorderWidth: 2,
        hoverBorderColor: isDarkMode ? '#374151' : theme.neutral.white,
      }
    ]
  };

  // Add 3D shadow plugin with enhanced depth
  const shadowPlugin = {
    id: '3DShadow',
    beforeDraw: (chart: any) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 6;
      ctx.shadowOffsetY = 6;
    },
    afterDraw: (chart: any) => {
      chart.ctx.restore();
      
      // Add floating label for hovered bar
      if (hoveredIndex !== null && chart.getDatasetMeta(0).data[hoveredIndex]) {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        const rect = meta.data[hoveredIndex].getProps(['x', 'y', 'width', 'height']);
        
        const value = dataValues[hoveredIndex];
        const percentage = ((value / total) * 100).toFixed(1);
        const label = `${formatNumber(value)} (${percentage}%)`;
        
        // Draw floating label
        ctx.save();
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isDarkMode ? '#1F2937' : theme.neutral.white;
        ctx.strokeStyle = ageColors[hoveredIndex];
        ctx.lineWidth = 2;
        
        const labelWidth = ctx.measureText(label).width + 20;
        const labelHeight = 28;
        const labelX = rect.x;
        const labelY = rect.y - 20;
        
        // Draw background with a subtle glow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.beginPath();
        ctx.roundRect(labelX - labelWidth/2, labelY - labelHeight/2, labelWidth, labelHeight, 8);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = isDarkMode ? '#FFF' : ageColors[hoveredIndex];
        ctx.fillText(label, labelX, labelY + 5);
        ctx.restore();
      }
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30,
        right: 30,
        bottom: 20,
        left: 20
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? theme.primary.light : theme.primary.main,
        bodyColor: isDarkMode ? '#D1D5DB' : theme.neutral.text.primary,
        titleFont: {
          size: 13,
          weight: 'bold',
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          size: 12,
          family: 'Inter, sans-serif'
        },
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        borderColor: isDarkMode ? '#374151' : theme.neutral.border,
        borderWidth: 1,
        callbacks: {
          title: (tooltipItems: any) => {
            return labels[tooltipItems[0].dataIndex];
          },
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${formatNumber(value)} pegawai (${percentage}%)`;
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
          color: isDarkMode ? '#E5E7EB' : theme.neutral.text.secondary
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          callback: (value: any) => formatNumber(value),
          color: isDarkMode ? '#E5E7EB' : theme.neutral.text.secondary
        }
      }
    },
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setHoveredIndex(hoveredIndex === index ? null : index);
      } else {
        setHoveredIndex(null);
      }
    },
    onHover: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setHoveredIndex(index);
      } else {
        setHoveredIndex(null);
      }
    }
  } as any;
  
  // Enhanced function to get age distribution insight based on data
  const getAgeInsight = () => {
    const ageBrackets = language === 'id' 
      ? ['kurang dari 30 tahun', '30-40 tahun', '41-50 tahun', 'di atas 50 tahun']
      : ['under 30 years', '30-40 years', '41-50 years', 'over 50 years'];
    
    const highestPercentage = ((highestGroup / total) * 100).toFixed(1);
    const lowestGroup = Math.min(...dataValues.filter(val => val > 0));
    const lowestGroupIndex = dataValues.indexOf(lowestGroup);
    const lowestPercentage = ((lowestGroup / total) * 100).toFixed(1);
    
    const youngGroup = data.under30;
    const seniorGroup = data.above50;
    const youngPercentage = ((youngGroup / total) * 100).toFixed(1);
    const seniorPercentage = ((seniorGroup / total) * 100).toFixed(1);
    
    // Determine the distribution type
    if (seniorGroup > youngGroup && seniorPercentage > 40) {
      return {
        title: language === 'id' ? "Populasi Menua" : "Aging Population",
        description: language === 'id'
          ? `Terdapat ${seniorPercentage}% pegawai berusia di atas 50 tahun, menunjukkan populasi yang menua.`
          : `There are ${seniorPercentage}% employees over 50 years old, indicating an aging population.`
      };
    } else if (youngGroup > seniorGroup && youngPercentage > 40) {
      return {
        title: language === 'id' ? "Populasi Muda" : "Young Population",
        description: language === 'id'
          ? `Terdapat ${youngPercentage}% pegawai berusia di bawah 30 tahun, menunjukkan populasi yang muda.`
          : `There are ${youngPercentage}% employees under 30 years old, indicating a young population.`
      };
    } else {
      return {
        title: language === 'id' ? "Distribusi Seimbang" : "Balanced Distribution",
        description: language === 'id'
          ? `Kelompok usia ${ageBrackets[highestGroupIndex]} memiliki persentase tertinggi (${highestPercentage}%), sementara kelompok usia ${ageBrackets[lowestGroupIndex]} memiliki persentase terendah (${lowestPercentage}%).`
          : `The ${ageBrackets[highestGroupIndex]} age group has the highest percentage (${highestPercentage}%), while the ${ageBrackets[lowestGroupIndex]} age group has the lowest (${lowestPercentage}%).`
      };
    }
  };
  
  const ageInsight = getAgeInsight();
  
  // Add 3D perspective effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    // Limit rotation to a small amount
    const maxRotate = 2;
    setRotateX(maxRotate - y * maxRotate * 2); // -maxRotate to +maxRotate
    setRotateY(x * maxRotate * 2 - maxRotate); // -maxRotate to +maxRotate
  };
  
  // Detect when chart comes into view
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const isInView = rect.top <= window.innerHeight && rect.bottom >= 0;
        
        if (isInView) {
          setIsVisible(true);
        }
        
        setScrollOffset(window.scrollY);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Simulate loading effect
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);
  
  // Initialize animation state
  useEffect(() => {
    setIsLoading(false);
    const timer = setTimeout(() => setIsLoading(true), 100);
    
    console.log('AgeDistributionChart data updated:', {
      under30: data.under30,
      between30And40: data.between30And40,
      between41And50: data.between41And50, 
      above50: data.above50,
      total: data.under30 + data.between30And40 + data.between41And50 + data.above50,
      timestamp: new Date().toISOString()
    });
    
    return () => clearTimeout(timer);
  }, [data, data.under30, data.between30And40, data.between41And50, data.above50]);
  
  return (
    <div 
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col relative"
      onMouseMove={handleMouseMove}
      key={chartKey}
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarClock className="mr-2 h-5 w-5 text-[#10B981] dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {language === 'id' ? 'Distribusi Usia' : 'Age Distribution'}
            </h3>
          </div>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-xs text-[#10B981] hover:text-[#059669] dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center transition-colors duration-300"
            >
              {language === 'id' ? 'Lihat Detail' : 'View Details'}
              <ArrowUpRight size={14} className="ml-1" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-h-[240px] relative">
          <div 
            className="chart-container w-full h-full relative perspective-800"
            style={{ 
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, 
              transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {isLoading && (
                <div className="loading-spinner"></div>
              )}
            </div>
            <Bar 
              ref={chartRef}
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: isDark ? '#E5E7EB' : theme.neutral.text.secondary
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value: any) => formatNumber(value),
                      color: isDark ? '#E5E7EB' : theme.neutral.text.secondary
                    },
                    grid: {
                      color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.8)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDark ? '#E5E7EB' : theme.neutral.text.primary,
                    bodyColor: isDark ? '#D1D5DB' : theme.neutral.text.secondary,
                    borderColor: isDark ? '#374151' : theme.neutral.border,
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                      label: (context: any) => {
                        const value = context.raw;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${language === 'id' ? 'Jumlah' : 'Count'}: ${formatNumber(value)} (${percentage}%)`;
                      }
                    }
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeOutQuart'
                },
                onHover: (event: any, elements: any) => {
                  if (elements && elements.length) {
                    setHoveredIndex(elements[0].index);
                  } else {
                    setHoveredIndex(null);
                  }
                },
                onAnimationComplete: () => {
                  setIsLoading(false);
                }
              }}
            />
          </div>
        </div>
        
        <div className="md:w-64 flex flex-col">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg mb-4 border border-emerald-100 dark:border-emerald-800">
            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
              {getAgeInsight().title}
            </h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-300">
              {getAgeInsight().description}
            </p>
          </div>
          
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            {language === 'id' ? 'Ringkasan Usia' : 'Age Summary'}
          </h4>
          
          <div className="space-y-3 flex-1">
            {labels.map((label, i) => (
              <div 
                key={i}
                className={`p-3 rounded-lg transition-all duration-200 cursor-pointer border ${
                  hoveredIndex === i 
                    ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatNumber(dataValues[i])}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${(dataValues[i] / Math.max(...dataValues)) * 100}%`,
                      backgroundColor: getGradients(null, null)[i]
                    }}
                  ></div>
                </div>
                <div className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                  {((dataValues[i] / total) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeDistributionChartWrapper; 