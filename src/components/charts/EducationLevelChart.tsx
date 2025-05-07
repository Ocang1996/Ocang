import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartEvent, Plugin } from 'chart.js';
import { ArrowUpRight, GraduationCap, X, ChevronRight } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface EducationLevelChartProps {
  data: {
    sd: number;
    smp: number;
    sma: number;
    d1: number;
    d2: number;
    d3: number;
    d4: number;
    s1: number;
    s2: number;
    s3: number;
  };
  onViewDetails?: () => void;
  detailsPosition?: 'side' | 'bottom';
}

// Detail Panel Component
const DetailPanel = ({ 
  groupId,
  details,
  total, 
  onClose,
  t
}: { 
  groupId: string,
  details: { name: string; value: number; color: string }[],
  total: number,
  onClose: () => void,
  t: (key: any) => string
}) => {
  const { isDark, language } = useTheme();
  
  const getTitle = () => {
    switch(groupId) {
      case 'dasar': return language === 'id' ? 'Pendidikan Dasar' : 'Basic Education';
      case 'menengah': return language === 'id' ? 'Pendidikan Menengah' : 'Secondary Education';
      case 'diploma': return language === 'id' ? 'Diploma' : 'Diploma';
      case 'sarjana': return language === 'id' ? 'Sarjana' : 'Bachelor';
      case 'pascasarjana': return language === 'id' ? 'Pascasarjana' : 'Postgraduate';
      default: return language === 'id' ? 'Detail Pendidikan' : 'Education Details';
    }
  };
  
  const getGroupIcon = () => {
    switch(groupId) {
      case 'dasar': return '🏫';
      case 'menengah': return '🏫';
      case 'diploma': return '🎓';
      case 'sarjana': return '🎓';
      case 'pascasarjana': return '🎓';
      default: return '📚';
    }
  };
  
  const groupTotal = details.reduce((sum, item) => sum + item.value, 0);
  const groupPercentage = ((groupTotal / total) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden w-full max-w-lg animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-xl">
              {getGroupIcon()}
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{getTitle()}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">{t('total_employees')}</span>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(groupTotal)}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {groupPercentage}% {language === 'id' ? 'dari total' : 'of total'}
                </span>
              </div>
            </div>
          </div>
          
          {details.length > 0 ? (
            <>
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-4">
                {language === 'id' ? 'Rincian Jenjang Pendidikan' : 'Education Level Details'}
              </h4>
              <div className="space-y-3 mt-4 max-h-80 overflow-y-auto pr-2">
                {details.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors animate-slideInUp"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="font-medium text-gray-800 dark:text-white">{item.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-700/30 text-emerald-600 dark:text-emerald-300 rounded-full font-medium">
                          {formatNumber(item.value)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {((item.value / total) * 100).toFixed(1)}% {language === 'id' ? 'dari total' : 'of total'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Tidak ada rincian pendidikan untuk ditampilkan' : 'No education details to display'}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button 
            onClick={onClose}
            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

const EducationLevelChart = ({ data, onViewDetails, detailsPosition = 'bottom' }: EducationLevelChartProps) => {
  const { isDark, language } = useTheme();
  const { t } = useTranslation();
  
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [clickedSegment, setClickedSegment] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Translate labels based on language
  const getEducationLevelLabels = () => {
    if (language === 'id') {
      return ['SD/MI', 'SMP/MTs', 'SMA/SMK/MA', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'];
    } else {
      return ['Elementary', 'Junior High', 'High School', 'Dipl.1', 'Dipl.2', 'Dipl.3', 'Dipl.4', 'Bachelor', 'Master', 'Doctoral'];
    }
  };
  
  const labels = getEducationLevelLabels();
  
  const values = [
    data.sd, data.smp, data.sma, data.d1, data.d2, data.d3, data.d4, data.s1, data.s2, data.s3
  ];
  
  const colors = [
    '#064E3B', // Emerald 900
    '#065F46', // Emerald 800
    '#047857', // Emerald 700
    '#059669', // Emerald 600
    '#10B981', // Emerald 500
    '#34D399', // Emerald 400
    '#6EE7B7', // Emerald 300
    '#A7F3D0', // Emerald 200
    '#D1FAE5', // Emerald 100
    '#ECFDF5'  // Emerald 50
  ];
  
  const backgroundColors = colors.map((color, index) => 
    hoveredSegment === index || clickedSegment === index 
      ? `${color}` 
      : `${color}dd`
  );
  const borderColors = isDark 
    ? colors.map(color => color) 
    : colors.map(color => color);
  
  const total = values.reduce((sum, value) => sum + value, 0);
  
  // Group education levels by category with translated names
  const getGroups = () => {
    if (language === 'id') {
      return {
        dasar: { name: 'Pendidikan Dasar', value: data.sd + data.smp },
        menengah: { name: 'Pendidikan Menengah', value: data.sma },
        diploma: { name: 'Diploma', value: data.d1 + data.d2 + data.d3 + data.d4 },
        sarjana: { name: 'Sarjana', value: data.s1 },
        pascasarjana: { name: 'Pascasarjana', value: data.s2 + data.s3 }
      };
    } else {
      return {
        dasar: { name: 'Basic Education', value: data.sd + data.smp },
        menengah: { name: 'Secondary Education', value: data.sma },
        diploma: { name: 'Diploma', value: data.d1 + data.d2 + data.d3 + data.d4 },
        sarjana: { name: 'Bachelor', value: data.s1 },
        pascasarjana: { name: 'Postgraduate', value: data.s2 + data.s3 }
      };
    }
  };
  
  const groupsWithNames = getGroups();
  const groups = {
    dasar: groupsWithNames.dasar.value,
    menengah: groupsWithNames.menengah.value,
    diploma: groupsWithNames.diploma.value,
    sarjana: groupsWithNames.sarjana.value,
    pascasarjana: groupsWithNames.pascasarjana.value
  };
  
  // Translate education details
  const getEduDetails = () => {
    const translatedLabels = getEducationLevelLabels();
    
    return {
      dasar: [
        { name: translatedLabels[0], value: data.sd, color: '#064E3B' },
        { name: translatedLabels[1], value: data.smp, color: '#065F46' },
      ],
      menengah: [
        { name: translatedLabels[2], value: data.sma, color: '#047857' },
      ],
      diploma: [
        { name: translatedLabels[3], value: data.d1, color: '#059669' },
        { name: translatedLabels[4], value: data.d2, color: '#10B981' },
        { name: translatedLabels[5], value: data.d3, color: '#34D399' },
        { name: translatedLabels[6], value: data.d4, color: '#6EE7B7' },
      ],
      sarjana: [
        { name: translatedLabels[7], value: data.s1, color: '#34D399' },
      ],
      pascasarjana: [
        { name: translatedLabels[8], value: data.s2, color: '#6EE7B7' },
        { name: translatedLabels[9], value: data.s3, color: '#A7F3D0' },
      ]
    };
  };
  
  const eduDetails = getEduDetails();
  
  const colorsByGroup = {
    dasar: '#047857',      // Emerald 700
    menengah: '#059669',   // Emerald 600
    diploma: '#10B981',    // Emerald 500
    sarjana: '#34D399',    // Emerald 400
    pascasarjana: '#6EE7B7' // Emerald 300
  };
  
  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };
  
  // Handle mouse move for tooltips
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  
  // Plugin to handle tooltips and click events
  const interactionPlugin: Plugin<'doughnut'> = {
    id: 'interactionPlugin',
    beforeEvent(chart, args) {
      const event = args.event;
      
      if (event.type === 'mouseout') {
        setHoveredSegment(null);
      }
      else if (event.type === 'mousemove') {
        const points = chart.getElementsAtEventForMode(
          event.native as MouseEvent,
          'nearest',
          { intersect: true },
          false
        );
        
        if (points.length) {
          setHoveredSegment(points[0].index);
        } else {
          setHoveredSegment(null);
        }
      }
      else if (event.type === 'click') {
        const points = chart.getElementsAtEventForMode(
          event.native as MouseEvent,
          'nearest',
          { intersect: true },
          false
        );
        
        if (points.length) {
          const index = points[0].index;
          handleChartClick(index);
        }
      }
    },
  };

  const handleChartClick = (index: number) => {
    setClickedSegment(index);
    
    // Map chart index to education group
    let selectedGroup: string | null = null;
    const eduLevel = labels[index];
    
    if (eduLevel === 'SD/MI' || eduLevel === 'SMP/MTs') {
      selectedGroup = 'dasar';
    } else if (eduLevel === 'SMA/SMK/MA') {
      selectedGroup = 'menengah';
    } else if (['D1', 'D2', 'D3', 'D4'].includes(eduLevel)) {
      selectedGroup = 'diploma';
    } else if (eduLevel === 'S1') {
      selectedGroup = 'sarjana';
    } else if (['S2', 'S3'].includes(eduLevel)) {
      selectedGroup = 'pascasarjana';
    }
    
    // Add slight delay to show animation before opening the popup
    setTimeout(() => {
      if (selectedGroup) {
        setSelectedEducation(selectedGroup);
        setShowDetails(true);
      }
      setClickedSegment(null);
    }, 300);
  };
  
  const handleSummaryClick = (id: string) => {
    setSelectedEducation(id);
    setShowDetails(true);
  };
  
  // Get tooltip content
  const getTooltipContent = (index: number) => {
    const value = values[index];
    const label = labels[index];
            const percentage = ((value / total) * 100).toFixed(1);
    
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: colors[index] }}
          ></span>
          <span className="font-medium text-gray-900 dark:text-white">{label}</span>
        </div>
        <div className="text-sm flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-300">Jumlah:</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{formatNumber(value)}</span>
        </div>
        <div className="text-sm flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-300">Persentase:</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{percentage}%</span>
        </div>
      </div>
    );
  };

  // Education summary items
  const summaryItems = [
    {
      id: 'dasar',
      label: 'Pendidikan Dasar',
      value: groups.dasar,
      percentage: ((groups.dasar / total) * 100).toFixed(1),
      color: colorsByGroup.dasar
    },
    {
      id: 'menengah',
      label: 'Pendidikan Menengah',
      value: groups.menengah,
      percentage: ((groups.menengah / total) * 100).toFixed(1),
      color: colorsByGroup.menengah
    },
    {
      id: 'diploma',
      label: 'Diploma',
      value: groups.diploma,
      percentage: ((groups.diploma / total) * 100).toFixed(1),
      color: colorsByGroup.diploma
    },
    {
      id: 'sarjana',
      label: 'Sarjana (S1)',
      value: groups.sarjana,
      percentage: ((groups.sarjana / total) * 100).toFixed(1),
      color: colorsByGroup.sarjana
    },
    {
      id: 'pascasarjana',
      label: 'Pascasarjana (S2/S3)',
      value: groups.pascasarjana,
      percentage: ((groups.pascasarjana / total) * 100).toFixed(1),
      color: colorsByGroup.pascasarjana
    }
  ];
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Disable default tooltip
      },
    },
    cutout: '60%',
    events: ['click', 'mousemove', 'mouseout'] as unknown as (keyof ChartEvent)[],
  };
  
  return (
    <div 
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col" 
      onMouseMove={handleMouseMove}
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              {language === 'id' ? 'Ringkasan Pendidikan' : 'Education Summary'}
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
      
      <div className="p-4 flex-1 dark:bg-gray-800 flex flex-col">
        {detailsPosition === 'side' ? (
          <div className="flex flex-col md:flex-row h-full">
            <div className="md:w-1/2 relative min-h-[220px]">
              <Doughnut 
                ref={chartRef}
                data={chartData} 
                options={chartOptions}
                plugins={[interactionPlugin]}
              />
              {hoveredSegment !== null && (
                <div 
                  className="absolute pointer-events-none z-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-3 py-2 text-sm border border-gray-200 dark:border-gray-700"
                  style={{
                    left: tooltipPosition.x + 10, 
                    top: tooltipPosition.y - 10,
                    opacity: 0.98
                  }}
                >
                  {getTooltipContent(hoveredSegment)}
                </div>
              )}
            </div>
            
            <div className="md:w-1/2 md:border-l border-gray-100 dark:border-gray-700 md:pl-4 mt-4 md:mt-0 flex flex-col">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {language === 'id' ? 'Kategori Pendidikan' : 'Education Categories'}
              </h4>
              
              <div className="space-y-3 overflow-auto">
                {Object.entries(groupsWithNames).map(([key, item]) => {
                  const isHighlighted = selectedEducation === key;
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  
                  return (
                    <div 
                      key={key}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                        isHighlighted 
                          ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-sm' 
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleSummaryClick(key)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: colorsByGroup[key as keyof typeof colorsByGroup] }}
                          ></div>
                          <span className="font-medium text-gray-800 dark:text-white text-sm">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatNumber(item.value)}
                        </span>
                      </div>
                      
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: colorsByGroup[key as keyof typeof colorsByGroup]
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between mt-1 items-center">
                        <button 
                          className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEducation(key);
                            setShowDetails(true);
                          }}
                        >
                          {language === 'id' ? 'Detail' : 'Details'}
                          <ChevronRight size={12} className="ml-0.5" />
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="relative min-h-[220px] mb-4">
              <Doughnut 
                ref={chartRef}
                data={chartData} 
                options={chartOptions}
                plugins={[interactionPlugin]}
              />
              {hoveredSegment !== null && (
                <div 
                  className="absolute pointer-events-none z-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-3 py-2 text-sm border border-gray-200 dark:border-gray-700"
                  style={{
                    left: tooltipPosition.x + 10, 
                    top: tooltipPosition.y - 10,
                    opacity: 0.98
                  }}
                >
                  {getTooltipContent(hoveredSegment)}
                </div>
              )}
            </div>
            
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              {language === 'id' ? 'Kategori Pendidikan' : 'Education Categories'}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(groupsWithNames).map(([key, item]) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                const isHighlighted = selectedEducation === key;
                
                return (
                  <div 
                    key={key}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      isHighlighted 
                        ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-sm' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleSummaryClick(key)}
                  >
                    <div 
                      className="h-1.5 w-12 mx-auto mb-2 rounded-full"
                      style={{ backgroundColor: colorsByGroup[key as keyof typeof colorsByGroup] }}
                    ></div>
                    
                    <h5 className="text-center text-sm font-medium text-gray-800 dark:text-white mb-1">
                      {item.name}
                    </h5>
                    
                    <p className="text-center font-bold text-gray-900 dark:text-white text-xl">
                      {formatNumber(item.value)}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2">
                      <button 
                        className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEducation(key);
                          setShowDetails(true);
                        }}
                      >
                        {language === 'id' ? 'Detail' : 'Details'}
                        <ChevronRight size={12} className="ml-0.5" />
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Detail Panel */}
      {showDetails && selectedEducation && (
        <DetailPanel 
          groupId={selectedEducation}
          details={eduDetails[selectedEducation as keyof typeof eduDetails]} 
          total={total}
          onClose={() => setShowDetails(false)}
          t={t}
        />
      )}
    </div>
  );
};

export default EducationLevelChart; 