import { useState, useEffect, useRef, useMemo } from 'react';
import { formatNumber } from '../../lib/utils';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

// Define the EmployeeType to match the interface in EmployeeContext
type EmployeeType = 'pns' | 'p3k' | 'nonAsn';

interface EmployeeTypeData {
  pns: number;
  p3k: number;
  nonAsn: number;
}

interface EmployeeTypeChartProps {
  data: EmployeeTypeData;
  onViewDetails?: (type: EmployeeType | 'all') => void;
  detailsPosition?: 'side' | 'bottom';
}

// Buat wrapper component untuk memaksa rerender
const EmployeeTypeChartWrapper = (props: EmployeeTypeChartProps) => {
  // Selalu generate key baru setiap kali data berubah
  const key = useMemo(() => `employee-chart-${JSON.stringify(props.data)}-${Date.now()}`, [props.data]);

  // Log data untuk debug
  console.log('EmployeeTypeChartWrapper rendering with data:', {
    ...props.data,
    total: props.data.pns + props.data.p3k + props.data.nonAsn,
    key,
    timestamp: new Date().toISOString()
  });

  // Render komponen dengan key yang selalu baru
  return <EmployeeTypeChart {...props} key={key} />;
};

const EmployeeTypeChart = ({ data, onViewDetails, detailsPosition = 'side' }: EmployeeTypeChartProps) => {
  const [selectedType, setSelectedType] = useState<EmployeeType | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [animateCards, setAnimateCards] = useState(false);
  // Add internal state to track the latest data
  const [chartData, setChartData] = useState<EmployeeTypeData>(data);
  const { isDark, language } = useTheme();
  const { t } = useTranslation();
  
  const totalEmployees = data.pns + data.p3k + data.nonAsn;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Force re-render when the data changes
  const chartKey = useMemo(() => `employee-type-chart-${JSON.stringify(data)}-${Date.now()}`, [data]);
  
  // Enhanced premium color scheme
  const chartColors = {
    pns: isDark ? '#34D399' : '#10B981',    // Emerald 400/500
    p3k: isDark ? '#6EE7B7' : '#059669',    // Emerald 300/600
    nonAsn: isDark ? '#A7F3D0' : '#047857', // Emerald 200/700
    neutral: isDark ? '#6B7280' : '#9CA3AF',
    highlight: isDark ? '#F3F4F6' : '#1F2937',
    gradient: {
      start: '#10B981', // Emerald 500
      mid: '#34D399',   // Emerald 400
      end: '#6EE7B7'    // Emerald 300
    }
  };
  
  // Add a critical useEffect that completely resets the component when data changes
  useEffect(() => {
    // Force a complete refresh of internal state when data changes
    setChartData({...data});
    
    console.log('EmployeeTypeChart data changed:', {
      pns: data.pns,
      p3k: data.p3k,
      nonAsn: data.nonAsn,
      total: data.pns + data.p3k + data.nonAsn,
      timestamp: new Date().toISOString()
    });
    
    // Trigger animations to show the refresh
    setIsLoaded(false);
    setAnimateCards(false);
    
    // Reset animations with staggered timing
    const loadTimer = setTimeout(() => setIsLoaded(true), 100);
    const cardTimer = setTimeout(() => setAnimateCards(true), 300);
    
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(cardTimer);
    };
  }, [data, data.pns, data.p3k, data.nonAsn]); // Explicitly add individual properties to ensure any changes are detected
  
  // Definisi terjemahan untuk deskripsi jenis pegawai
  const getTranslatedDescription = (type: EmployeeType) => {
    if (language === 'id') {
      switch (type) {
        case 'pns':
          return 'Pegawai Negeri Sipil';
        case 'p3k':
          return 'Pegawai Pemerintah dengan Perjanjian Kerja';
        case 'nonAsn':
          return 'Pegawai Non Aparatur Sipil Negara';
        default:
          return '';
      }
    } else {
      switch (type) {
        case 'pns':
          return 'Civil Servants';
        case 'p3k':
          return 'Government Employee with Work Agreement';
        case 'nonAsn':
          return 'Non-Civil Service Personnel';
        default:
          return '';
      }
    }
  };
  
  // Format data for display with enhanced meta data
  const employeeTypeDetails = [
    {
      type: 'pns' as EmployeeType,
      label: 'PNS',
      count: data.pns,
      color: chartColors.pns,
      percentage: totalEmployees > 0 ? ((data.pns / totalEmployees) * 100).toFixed(1) : '0.0',
      description: getTranslatedDescription('pns'),
      growth: '+1.8%',
      trend: 'increasing',
      icon: '👨‍💼',
      sparkline: [65, 59, 80, 81, 56, 55, 70]
    },
    {
      type: 'p3k' as EmployeeType,
      label: 'P3K',
      count: data.p3k,
      color: chartColors.p3k,
      percentage: totalEmployees > 0 ? ((data.p3k / totalEmployees) * 100).toFixed(1) : '0.0',
      description: getTranslatedDescription('p3k'),
      growth: '+3.2%',
      trend: 'increasing',
      icon: '👩‍💻',
      sparkline: [41, 45, 53, 54, 61, 58, 63]
    },
    {
      type: 'nonAsn' as EmployeeType,
      label: language === 'id' ? 'Non ASN' : 'Non-CSP',
      count: data.nonAsn,
      color: chartColors.nonAsn,
      percentage: totalEmployees > 0 ? ((data.nonAsn / totalEmployees) * 100).toFixed(1) : '0.0',
      description: getTranslatedDescription('nonAsn'),
      growth: '-0.5%',
      trend: 'decreasing',
      icon: '👷‍♂️',
      sparkline: [35, 32, 29, 30, 28, 27, 28]
    }
  ];
  
  // View detail handler
  const handleTypeClick = (type: EmployeeType) => {
    setSelectedType(type === selectedType ? null : type);
    
    if (type !== selectedType) {
      onViewDetails?.(type);
    }
  };

  // Enhanced Sparkline mini chart with animations
  const createSparkline = (data: number[], color: string, height: number = 24, highlighted: boolean = false) => {
    if (!data.length) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
        {/* Enhanced gradient area fill */}
        <defs>
          <linearGradient id={`sparkGradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        
        {/* Animated area fill */}
        <path
          d={`M0,100 L0,${100 - ((data[0] - min) / range) * 100} ${points} ${100},${100 - ((data[data.length - 1] - min) / range) * 100} L100,100 Z`}
          fill={`url(#sparkGradient-${color.replace('#', '')})`}
          className={`transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transformOrigin: 'bottom' }}
        />
        
        {/* Enhanced line with animation */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={highlighted ? 2.5 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            strokeDasharray: "200",
            strokeDashoffset: isLoaded ? "0" : "200",
            transition: "stroke-dashoffset 1.5s ease-in-out, opacity 0.5s ease-in-out, stroke-width 0.3s ease-in-out" 
          }}
        />
        
        {/* Enhanced point highlights */}
        {isLoaded && data.map((value, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((value - min) / range) * 100;
          
          return (i === data.length - 1 || i === 0 || i === Math.floor(data.length / 2)) && (
            <circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r={i === data.length - 1 ? (highlighted ? 3.5 : 2.5) : (highlighted ? 2 : 0)}
              fill={i === data.length - 1 ? (highlighted ? '#fff' : color) : color}
              stroke={color}
              strokeWidth="1.5"
              className="transition-all duration-300"
              style={{ 
                opacity: i === data.length - 1 ? 1 : (highlighted ? 0.7 : 0),
                filter: highlighted && i === data.length - 1 ? 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' : 'none'
              }}
            />
          );
        })}
      </svg>
    );
  };

  // Helper to determine if card should show expanded stats
  const shouldExpandCard = (index: number) => activeIndex === index || selectedType === employeeTypeDetails[index].type;

  // Pada awal file, tambahkan console.log
  console.log('EmployeeTypeChart rendered with data:', {
    pns: data.pns,
    p3k: data.p3k,
    nonAsn: data.nonAsn,
    total: data.pns + data.p3k + data.nonAsn,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden h-full flex flex-col shadow-lg border border-gray-200/50 dark:border-gray-700/50"
         key={chartKey} 
    >
      {/* Header with simplified design */}
      <div className="relative px-5 py-4 border-b border-gray-100 dark:border-gray-700 overflow-hidden bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-emerald-900/10">
        <div className="relative z-10 flex items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full shadow-md"></div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white text-base">
                Jenis Kepegawaian
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                {formatNumber(data.pns + data.p3k + data.nonAsn)} pegawai · {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative wave pattern with reduced opacity */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] overflow-hidden pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d="M0,50 Q25,30 50,50 T100,50 V100 H0 Z" 
              fill="url(#headerGradient)"
              className="animate-slow-wave"
            />
            <defs>
              <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col space-y-4" ref={chartContainerRef}>
        {/* Card grid with consistent sizing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {employeeTypeDetails.map((item, i) => (
            <div
              key={`stat-card-${i}`}
              className={`relative rounded-lg overflow-hidden transition-all duration-500 transform
                ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                ${shouldExpandCard(i)
                  ? 'ring-2 shadow-lg scale-[1.02] z-10' 
                  : 'ring-1 hover:ring-2 hover:shadow-md'
                }
              `}
              style={{
                transitionDelay: `${i * 150}ms`,
                backgroundColor: isDark 
                  ? `${item.color}0A` 
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: isDark 
                  ? `${item.color}30` 
                  : `${item.color}20`,
                boxShadow: shouldExpandCard(i)
                  ? `0 8px 30px -5px ${item.color}30`
                  : '0 4px 10px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => handleTypeClick(item.type)}
            >
              {/* Simplified card content */}
              <div className="p-4 transition-all duration-500">
                <div className="flex items-center mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${
                      shouldExpandCard(i) 
                        ? 'scale-110 shadow-md' 
                        : ''
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${item.color}30, ${item.color}15)`,
                      border: `1px solid ${item.color}40`
                    }}
                  >
                    <span className="text-lg" style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <div className="ml-2.5">
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{item.label}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-24">{item.type === 'p3k' ? (language === 'id' ? 'Pegawai Pemerintah' : 'Government Employee') : item.description}</p>
                  </div>
                </div>
                
                <div className="flex items-baseline mt-2.5">
                  <span className={`text-2xl font-bold transition-all duration-300 ${shouldExpandCard(i) ? 'text-3xl' : ''}`} 
                    style={{ color: item.color }}
                  >
                    {formatNumber(item.count)}
                  </span>
                  <span className="ml-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {language === 'id' ? 'pegawai' : 'employees'}
                  </span>
                </div>
                
                {/* Enhanced trend line with animations */}
                <div className="mt-2">
                  {createSparkline(item.sparkline, item.color, 28, shouldExpandCard(i))}
                </div>
                
                {/* Enhanced progress bar with animation */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-500 dark:text-gray-400">{language === 'id' ? 'Persentase' : 'Percentage'}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{item.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-1500 ease-out-expo"
                      style={{ 
                        width: isLoaded ? `${item.percentage}%` : '0%',
                        background: `linear-gradient(90deg, ${item.color}CC, ${item.color})`,
                        transitionDelay: `${400 + i * 150}ms`,
                        boxShadow: `0 0 8px ${item.color}80`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced distribution comparison visualization */}
        <div className="relative bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-emerald-100/50 dark:border-emerald-900/30 backdrop-blur-sm shadow-sm">
          <h4 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <div className="h-3.5 w-1 bg-emerald-500 rounded-full mr-2"></div>
            {language === 'id' ? 'Distribusi Pegawai' : 'Employee Distribution'}
          </h4>
          
          <div className="relative h-10 rounded-lg overflow-hidden shadow-inner bg-gray-100/80 dark:bg-gray-700/80">
            {employeeTypeDetails.map((item, i) => {
              // Calculate segment positions
              const prevSegments = employeeTypeDetails.slice(0, i);
              const prevTotal = prevSegments.reduce((sum, segment) => sum + Number(segment.percentage), 0);
              
              return (
                <div
                  key={`segment-${i}-${data.pns}-${data.p3k}-${data.nonAsn}`}
                  className="absolute top-0 h-10 transition-all duration-1200 ease-out-expo flex items-center justify-center overflow-hidden"
                  style={{
                    width: isLoaded ? `${item.percentage}%` : '0%',
                    background: `linear-gradient(180deg, ${item.color}, ${item.color}CC)`,
                    left: isLoaded ? `${prevTotal}%` : '0%',
                    borderTopRightRadius: i === employeeTypeDetails.length - 1 ? '0.5rem' : 0,
                    borderBottomRightRadius: i === employeeTypeDetails.length - 1 ? '0.5rem' : 0,
                    borderTopLeftRadius: i === 0 ? '0.5rem' : 0,
                    borderBottomLeftRadius: i === 0 ? '0.5rem' : 0,
                    opacity: hoveredStat === null || hoveredStat === i ? 1 : 0.6,
                    transitionDelay: `${500 + i * 200}ms`,
                    zIndex: hoveredStat === i ? 10 : 5 - i,
                    boxShadow: hoveredStat === i ? `0 0 15px ${item.color}80` : 'none'
                  }}
                  onMouseEnter={() => setHoveredStat(i)}
                  onMouseLeave={() => setHoveredStat(null)}
                  onClick={() => handleTypeClick(employeeTypeDetails[i].type)}
                >
                  {Number(item.percentage) > 8 && (
                    <div className="text-white text-xs font-semibold px-2 py-0.5 rounded-full bg-black/10 backdrop-blur-sm">
                      {item.label} • {item.percentage}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Enhanced distribution legends */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {employeeTypeDetails.map((item, i) => (
              <div 
                key={`legend-${i}`}
                className={`flex items-center cursor-pointer transition-all duration-300 ${
                  hoveredStat === i ? 'transform scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                onClick={() => handleTypeClick(item.type)}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-sm mr-1.5 shadow-sm"
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: hoveredStat === i ? `0 0 8px ${item.color}80` : 'none'
                  }}
                />
                <span className={`text-xs font-medium ${
                  hoveredStat === i 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {item.label} ({formatNumber(item.count)})
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* View details button with enhanced styling */}
        {onViewDetails && (
          <div className="mt-auto pt-1 flex justify-center">
            <button
              onClick={() => onViewDetails('all')}
              className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-all duration-300 
                bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-700 
                shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800
                active:shadow-inner active:translate-y-0.5"
            >
              {language === 'id' ? 'Lihat Detail Lengkap' : 'View Complete Details'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTypeChartWrapper; 