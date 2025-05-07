import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, BarChart3 } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

// Register the required components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface WorkloadMetrics {
  name: string;
  employeeCount: number;
  taskCount: number;
  completionRate: number;
  averageTime: number;
  workload: number; // Workload score (0-100)
  subUnits?: WorkloadMetrics[];
}

interface WorkloadAnalysisChartProps {
  data: WorkloadMetrics[];
  onViewDetails?: () => void;
}

const WorkloadAnalysisChart = ({
  data,
  onViewDetails
}: WorkloadAnalysisChartProps) => {
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Toggle expansion state of a unit
  const toggleExpand = (unitName: string) => {
    if (expandedUnits.includes(unitName)) {
      setExpandedUnits(expandedUnits.filter(name => name !== unitName));
    } else {
      setExpandedUnits([...expandedUnits, unitName]);
    }
  };
  
  // Helper to determine workload color
  const getWorkloadColor = (workload: number) => {
    if (workload < 30) return 'bg-green-500';
    if (workload < 70) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Helper to determine workload status text
  const getWorkloadStatus = (workload: number) => {
    if (workload < 30) return 'Ringan';
    if (workload < 70) return 'Sedang';
    return 'Berat';
  };
  
  // Helper to determine workload status color
  const getWorkloadStatusColor = (workload: number) => {
    if (workload < 30) return 'text-green-700 bg-green-100';
    if (workload < 70) return 'text-amber-700 bg-amber-100';
    return 'text-red-700 bg-red-100';
  };
  
  // Calculate organization-wide metrics
  const totalEmployees = data.reduce((sum, unit) => sum + unit.employeeCount, 0);
  const totalTasks = data.reduce((sum, unit) => sum + unit.taskCount, 0);
  const averageCompletionRate = data.reduce((sum, unit) => sum + (unit.completionRate * unit.taskCount), 0) / totalTasks;
  const averageWorkload = data.reduce((sum, unit) => sum + (unit.workload * unit.employeeCount), 0) / totalEmployees;
  
  // Find units with highest and lowest workload
  const sortedByWorkload = [...data].sort((a, b) => b.workload - a.workload);
  const highestWorkloadUnit = sortedByWorkload[0];
  const lowestWorkloadUnit = sortedByWorkload[sortedByWorkload.length - 1];
  
  // Group data by workload category
  const workloadCategories = {
    high: data.filter(unit => unit.workload >= 70),
    medium: data.filter(unit => unit.workload >= 30 && unit.workload < 70),
    low: data.filter(unit => unit.workload < 30)
  };

  // Prepare data for 3D stacked bar chart - limit to top 5 units for better visualization
  const chartData = {
    labels: data.slice(0, 5).map(unit => unit.name),
    datasets: [
      {
        label: 'Beban Tinggi',
        data: data.slice(0, 5).map(unit => unit.workload >= 70 ? unit.workload : 0),
        backgroundColor: 'rgba(128, 0, 0, 0.8)',
        borderColor: 'rgba(100, 0, 0, 1)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        hoverBackgroundColor: 'rgba(128, 0, 0, 1)'
      },
      {
        label: 'Beban Sedang',
        data: data.slice(0, 5).map(unit => unit.workload >= 30 && unit.workload < 70 ? unit.workload : 0),
        backgroundColor: 'rgba(208, 28, 31, 0.8)',
        borderColor: 'rgba(180, 20, 25, 1)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        hoverBackgroundColor: 'rgba(208, 28, 31, 1)'
      },
      {
        label: 'Beban Rendah',
        data: data.slice(0, 5).map(unit => unit.workload < 30 ? unit.workload : 0),
        backgroundColor: 'rgba(107, 147, 176, 0.8)',
        borderColor: 'rgba(80, 120, 150, 1)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        hoverBackgroundColor: 'rgba(107, 147, 176, 1)'
      }
    ]
  };

  // Create 3D Bar chart with shadow effects
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    scales: {
      x: {
        stacked: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.3)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
          },
          color: 'rgba(75, 85, 99, 0.8)'
        },
        max: 100
      },
      y: {
        stacked: true,
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold' as const
          },
          color: 'rgba(55, 65, 81, 0.9)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 20,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        titleFont: {
          size: 13,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        borderColor: 'rgba(226, 232, 240, 1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            if (value === 0) return '';
            const dataset = context.dataset;
            return `${dataset.label}: ${value}%`;
          },
          afterLabel: (context: any) => {
            const index = context.dataIndex;
            const unit = data[index];
            return [
              `Pegawai: ${formatNumber(unit.employeeCount)}`,
              `Tugas: ${formatNumber(unit.taskCount)}`,
              `Penyelesaian: ${unit.completionRate}%`
            ];
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const
    },
    onHover: (_: any, elements: any) => {
      if (elements && elements.length) {
        setHoveredIndex(elements[0].index);
      } else {
        setHoveredIndex(null);
      }
    }
  };

  // Function to create shadow plugin for 3D effect
  const shadowPlugin = {
    id: '3DShadow',
    beforeDraw: (chart: any) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;
    },
    afterDraw: (chart: any) => {
      chart.ctx.restore();
    }
  };

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInView) {
        setIsVisible(true);
        const offset = (window.innerHeight - rect.top) * 0.05;
        setScrollOffset(offset);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation to show chart when in view
  const animationClass = isVisible 
    ? 'opacity-100 translate-y-0 transition-all duration-1000 ease-out' 
    : 'opacity-0 translate-y-10';

  // Gradient background with parallax effect
  const gradientStyle = {
    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(243,244,246,1) 50%, rgba(229,231,235,1) 100%)',
    transform: `translateY(${scrollOffset}px)`,
    transition: 'transform 0.3s ease-out',
  };

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-800">Analisis Beban Kerja</h3>
          </div>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center transition-colors duration-300"
            >
              Lihat Detail
              <ArrowUpRight size={16} className="ml-1" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6" style={gradientStyle}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm transform transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <h4 className="text-xs font-medium text-blue-500 uppercase tracking-wider mb-1">Rata-rata Beban Kerja</h4>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-blue-900">{averageWorkload.toFixed(1)}%</p>
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getWorkloadStatusColor(averageWorkload)}`}>
                {getWorkloadStatus(averageWorkload)}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">Seluruh organisasi</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm transform transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <h4 className="text-xs font-medium text-amber-500 uppercase tracking-wider mb-1">Beban Kerja Tertinggi</h4>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-amber-900">{highestWorkloadUnit.workload}%</p>
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getWorkloadStatusColor(highestWorkloadUnit.workload)}`}>
                {getWorkloadStatus(highestWorkloadUnit.workload)}
              </span>
            </div>
            <p className="text-xs text-amber-600 mt-1">{highestWorkloadUnit.name}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 p-4 rounded-lg border border-green-200 shadow-sm transform transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <h4 className="text-xs font-medium text-green-500 uppercase tracking-wider mb-1">Beban Kerja Terendah</h4>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-green-900">{lowestWorkloadUnit.workload}%</p>
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getWorkloadStatusColor(lowestWorkloadUnit.workload)}`}>
                {getWorkloadStatus(lowestWorkloadUnit.workload)}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">{lowestWorkloadUnit.name}</p>
          </div>
        </div>
        
        <div className={`mb-8 ${animationClass}`}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-gray-700">Distribusi Beban Kerja Unit</h4>
            <div className="flex space-x-2">
              <span className="text-xs text-gray-500">Geser untuk melihat detail</span>
            </div>
          </div>
          
          <div className="h-80 relative" style={{ perspective: '1000px' }}>
            <div className="h-full w-full" style={{ transform: 'rotateX(5deg)' }}>
              <Bar 
                data={chartData} 
                options={chartOptions} 
                plugins={[shadowPlugin]}
                ref={chartRef}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Distribusi Beban Kerja Pegawai</h4>
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div className="flex h-full transition-all duration-1000">
              <div 
                className="bg-gradient-to-r from-red-400 to-red-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${(workloadCategories.high.reduce((sum, unit) => sum + unit.employeeCount, 0) / totalEmployees * 100).toFixed(1)}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${(workloadCategories.medium.reduce((sum, unit) => sum + unit.employeeCount, 0) / totalEmployees * 100).toFixed(1)}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${(workloadCategories.low.reduce((sum, unit) => sum + unit.employeeCount, 0) / totalEmployees * 100).toFixed(1)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600 mr-1"></div>
              <span>Berat ({formatNumber(workloadCategories.high.reduce((sum, unit) => sum + unit.employeeCount, 0))} pegawai)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 mr-1"></div>
              <span>Sedang ({formatNumber(workloadCategories.medium.reduce((sum, unit) => sum + unit.employeeCount, 0))} pegawai)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 mr-1"></div>
              <span>Ringan ({formatNumber(workloadCategories.low.reduce((sum, unit) => sum + unit.employeeCount, 0))} pegawai)</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md transform hover:shadow-lg transition-all duration-300">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Kerja
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pegawai
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beban Kerja
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penyelesaian
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rata-rata Waktu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((unit, index) => (
                <>
                  <tr 
                    key={unit.name} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150 ease-in-out`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {unit.subUnits && unit.subUnits.length > 0 && (
                          <button 
                            onClick={() => toggleExpand(unit.name)}
                            className="mr-2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors"
                          >
                            {expandedUnits.includes(unit.name) ? '−' : '+'}
                          </button>
                        )}
                        <div className="font-medium text-gray-900">{unit.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(unit.employeeCount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2 overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${
                              unit.workload < 30 
                                ? 'from-green-400 to-green-600' 
                                : unit.workload < 70 
                                  ? 'from-amber-400 to-amber-600' 
                                  : 'from-red-400 to-red-600'
                            }`}
                            style={{ width: `${unit.workload}%` }}
                          ></div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getWorkloadStatusColor(unit.workload)}`}>
                          {unit.workload}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.completionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.averageTime} hari
                    </td>
                  </tr>
                  
                  {/* Sub-units if expanded */}
                  {unit.subUnits && 
                   expandedUnits.includes(unit.name) && 
                   unit.subUnits.map((subUnit, subIndex) => (
                    <tr 
                      key={`${unit.name}-${subUnit.name}`} 
                      className="bg-gray-50 hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                      style={{
                        animation: `fadeIn 0.3s ease-in-out ${subIndex * 0.05}s both`
                      }}
                    >
                      <td className="px-6 py-3 whitespace-nowrap pl-12">
                        <div className="text-sm text-gray-700">— {subUnit.name}</div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(subUnit.employeeCount)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2 overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${
                                subUnit.workload < 30 
                                  ? 'from-green-400 to-green-600' 
                                  : subUnit.workload < 70 
                                    ? 'from-amber-400 to-amber-600' 
                                    : 'from-red-400 to-red-600'
                              }`}
                              style={{ width: `${subUnit.workload}%` }}
                            ></div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getWorkloadStatusColor(subUnit.workload)}`}>
                            {subUnit.workload}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {subUnit.completionRate}%
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {subUnit.averageTime} hari
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p className="mb-2"><strong>Catatan:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Beban kerja dihitung berdasarkan jumlah tugas dibagi jumlah pegawai relatif terhadap target standar</li>
            <li>Tingkat penyelesaian menunjukkan persentase tugas yang selesai tepat waktu</li>
            <li>Rata-rata waktu penyelesaian dihitung dari tugas yang sudah selesai</li>
          </ul>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
    </div>
  );
};

export default WorkloadAnalysisChart; 