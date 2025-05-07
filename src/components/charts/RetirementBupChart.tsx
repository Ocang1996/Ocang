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
import { ArrowUpRight, CalendarClock, ChevronRight, X } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { useState, useEffect, useRef } from 'react';
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

// Interface for ASN employee data
interface AsnEmployee {
  id: string;
  name: string;
  nip: string;
  position: string;
  rank: string;
  unit: string;
  retirementDate: string;
  age: number;
  employeeType: 'PNS' | 'PPPK';
  gender: 'L' | 'P';
  category: 'administrasi' | 'fungsionalPertamaMuda' | 'fungsionalKeterampilan' | 'penelitiPerekayasaPertamaMuda' | 'pimpinanTinggi' | 'fungsionalMadya' | 'fungsionalUtama';
}

// Data berdasarkan jenis jabatan dan BUP
interface RetirementDataByPosition {
  // BUP 58 tahun
  administrasi: number[];
  fungsionalPertamaMuda: number[];
  fungsionalKeterampilan: number[];
  penelitiPerekayasaPertamaMuda: number[];
  
  // BUP 60 tahun
  pimpinanTinggi: number[];
  fungsionalMadya: number[];
  
  // BUP 65 tahun
  fungsionalUtama: number[];
  
  // Tahun-tahun untuk prediksi
  years: number[];
  
  // Data pegawai per kategori per tahun
  // Format: employeeData[year][category] = employee[]
  employeeData?: Record<number, Record<string, AsnEmployee[]>>;
}

interface RetirementBupChartProps {
  data: RetirementDataByPosition;
  onViewDetails?: () => void;
}

const RetirementBupChart = ({ data, onViewDetails }: RetirementBupChartProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const chartRef = useRef<ChartJS<"bar">>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedYearIndex, setSelectedYearIndex] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { language } = useTheme();
  const { t } = useTranslation();
  
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
  
  // Menggabungkan data untuk setiap kategori BUP
  const bup58Data = Array.from({ length: data.years.length }, (_, i) => 
    data.administrasi[i] + 
    data.fungsionalPertamaMuda[i] + 
    data.fungsionalKeterampilan[i] + 
    data.penelitiPerekayasaPertamaMuda[i]
  );
  
  const bup60Data = Array.from({ length: data.years.length }, (_, i) => 
    data.pimpinanTinggi[i] + 
    data.fungsionalMadya[i]
  );
  
  const bup65Data = data.fungsionalUtama;
  
  const totalByYear = Array.from({ length: data.years.length }, (_, i) => 
    bup58Data[i] + bup60Data[i] + bup65Data[i]
  );
  
  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    const elements = chart.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest', 
      { intersect: true },
      false
    );
    
    if (elements.length === 0) return;
    
    const { datasetIndex, index } = elements[0];
    const year = data.years[index];
    
    setSelectedYear(year);
    setSelectedYearIndex(index);
    setSelectedCategory(null); // Reset selected category when opening a new year
    setShowDetailModal(true);
  };
  
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedYear(null);
    setSelectedYearIndex(null);
    setSelectedCategory(null);
  };
  
  const chartData = {
    labels: data.years.map(year => year.toString()),
    datasets: [
      {
        label: 'BUP 58 Tahun',
        data: bup58Data,
        backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.7)' : 'rgb(16, 185, 129)',
        borderColor: isDarkMode ? 'rgb(16, 185, 129)' : 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0',
      },
      {
        label: 'BUP 60 Tahun',
        data: bup60Data,
        backgroundColor: isDarkMode ? 'rgba(5, 150, 105, 0.7)' : 'rgb(5, 150, 105)',
        borderColor: isDarkMode ? 'rgb(5, 150, 105)' : 'rgb(5, 150, 105)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0',
      },
      {
        label: 'BUP 65 Tahun',
        data: bup65Data,
        backgroundColor: isDarkMode ? 'rgba(4, 120, 87, 0.7)' : 'rgb(4, 120, 87)',
        borderColor: isDarkMode ? 'rgb(4, 120, 87)' : 'rgb(4, 120, 87)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0',
      }
    ]
  };
  
  // Chart configuration options with enhanced interactivity
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Tahun',
          color: isDarkMode ? '#e5e7eb' : '#6b7280',
          font: {
            size: 12
          }
        },
        ticks: {
          color: isDarkMode ? '#e5e7eb' : '#4b5563'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          callback: (value: any) => formatNumber(value),
          color: isDarkMode ? '#e5e7eb' : '#4b5563'
        },
        title: {
          display: true,
          text: 'Jumlah Pegawai',
          color: isDarkMode ? '#e5e7eb' : '#6b7280',
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#4b5563',
          font: {
            size: 12
          },
          usePointStyle: true,
          boxWidth: 10,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const datasetLabel = context.dataset.label;
            const totalValue = totalByYear[context.dataIndex];
            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0';
            
            return `${datasetLabel}: ${formatNumber(value)} (${percentage}%)`;
          },
          footer: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            const total = totalByYear[index];
            return `Total: ${formatNumber(total)}`;
          }
        },
        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#e5e7eb' : '#2C3E50',
        bodyColor: isDarkMode ? '#d1d5db' : '#4B5563',
        borderColor: isDarkMode ? '#4b5563' : '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        usePointStyle: true
      }
    }
  };
  
  // Hitung total pegawai untuk masing-masing BUP
  const totalBup58 = bup58Data.reduce((sum, value) => sum + value, 0);
  const totalBup60 = bup60Data.reduce((sum, value) => sum + value, 0);
  const totalBup65 = bup65Data.reduce((sum, value) => sum + value, 0);
  const totalAllBup = totalBup58 + totalBup60 + totalBup65;
  
  // Hitung data untuk 5 tahun ke depan
  const next5YearsTotal = totalByYear.slice(0, 5).reduce((sum, value) => sum + value, 0);
  
  // Hitung data untuk tahun ini
  const currentYearTotal = totalByYear[0] || 0;
  
  // Hitung tahun dengan pensiun terbanyak
  let maxPensionYear = 0;
  let maxPensionCount = 0;
  
  totalByYear.forEach((count, index) => {
    if (count > maxPensionCount) {
      maxPensionCount = count;
      maxPensionYear = data.years[index];
    }
  });
  
  const getCategoryEmployees = (category: string) => {
    if (!selectedYear || !data.employeeData || !data.employeeData[selectedYear]) return [];
    return data.employeeData[selectedYear][category] || [];
  };
  
  const renderEmployeeList = (category: string) => {
    const employees = getCategoryEmployees(category);
    
    if (!employees || employees.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <p>Data ASN tidak tersedia atau sedang dimuat.</p>
          <p className="text-xs mt-2">Kategori: {category}</p>
        </div>
      );
    }
    
    return (
      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Daftar ASN yang Pensiun ({employees.length})
          </h3>
          <button
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            onClick={() => setSelectedCategory(null)}
          >
            Kembali
          </button>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {employees.map((employee) => (
            <div 
              key={employee.id} 
              className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm mb-2 border border-gray-100 dark:border-gray-600"
            >
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{employee.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    NIP: {employee.nip}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    employee.employeeType === 'PNS' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {employee.employeeType}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 mt-2 gap-y-1 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Jabatan:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.position}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Pangkat:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.rank}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Unit Kerja:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.unit}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Usia:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.age} tahun</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Tanggal Pensiun:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300">{employee.retirementDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const getDetailModalContent = () => {
    if (selectedYearIndex === null || selectedYear === null) return null;
    
    const idx = selectedYearIndex;
    const year = selectedYear;
    
    // Detailed breakdown for the selected year
    const administrasiCount = data.administrasi[idx];
    const fungsionalPertamaMudaCount = data.fungsionalPertamaMuda[idx];
    const fungsionalKeterampilanCount = data.fungsionalKeterampilan[idx];
    const penelitiPerekayasaCount = data.penelitiPerekayasaPertamaMuda[idx];
    const pimpinanTinggiCount = data.pimpinanTinggi[idx];
    const fungsionalMadyaCount = data.fungsionalMadya[idx];
    const fungsionalUtamaCount = data.fungsionalUtama[idx];
    
    const totalForYear = totalByYear[idx];
    const previousYearIndex = idx > 0 ? idx - 1 : null;
    const previousYearTotal = previousYearIndex !== null ? totalByYear[previousYearIndex] : null;
    const percentChange = previousYearTotal ? ((totalForYear - previousYearTotal) / previousYearTotal * 100).toFixed(1) : '-';
    
    // Get employee data for the selected year if available
    const hasEmployeeData = data.employeeData && data.employeeData[year];
    
    // Show employee list if a category is selected
    if (selectedCategory) {
      return (
        <div className="p-5">
          {renderEmployeeList(selectedCategory)}
        </div>
      );
    }
    
    return (
      <div className="p-5 max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {language === 'id' ? 'Detail Pensiun Tahun' : 'Retirement Details for'} {year}
          </h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={closeDetailModal}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg mb-4 border border-emerald-100 dark:border-emerald-800">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-emerald-700 dark:text-emerald-400">Total Pensiun</span>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">{formatNumber(totalForYear)}</p>
            </div>
            {previousYearTotal !== null && (
              <div className={`text-sm ${parseFloat(percentChange) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {parseFloat(percentChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(percentChange))}%
                <div className="text-xs text-gray-500 dark:text-gray-400">dari tahun sebelumnya</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
            {language === 'id' ? 'Rincian Berdasarkan Kategori BUP' : 'Retirement Age Categories Breakdown'}
          </h3>
          
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-3">
              <h4 className="text-sm font-semibold flex items-center text-emerald-600 dark:text-emerald-400 mb-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                {language === 'id' ? 'BUP 58 Tahun' : '58-Year Retirement Age'}
              </h4>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Pejabat Administrasi</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-white">{formatNumber(administrasiCount)}</span>
                    {hasEmployeeData && (
                      <button 
                        className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline" 
                        onClick={() => setSelectedCategory('administrasi')}
                      >
                        {language === 'id' ? 'Lihat' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fungsional Pertama/Muda</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-white">{formatNumber(fungsionalPertamaMudaCount)}</span>
                    {hasEmployeeData && (
                      <button 
                        className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline" 
                        onClick={() => setSelectedCategory('fungsionalPertamaMuda')}
                      >
                        {language === 'id' ? 'Lihat' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fungsional Keterampilan</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-white">{formatNumber(fungsionalKeterampilanCount)}</span>
                    {hasEmployeeData && (
                      <button 
                        className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline" 
                        onClick={() => setSelectedCategory('fungsionalKeterampilan')}
                      >
                        {language === 'id' ? 'Lihat' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Peneliti/Perekayasa (P/M)</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-white">{formatNumber(penelitiPerekayasaCount)}</span>
                    {hasEmployeeData && (
                      <button 
                        className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline" 
                        onClick={() => setSelectedCategory('penelitiPerekayasaPertamaMuda')}
                      >
                        {language === 'id' ? 'Lihat' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-span-2 mt-1 pt-2 border-t border-gray-100 dark:border-gray-600 flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total BUP 58</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatNumber(bup58Data[idx])}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-3">
              <h4 className="text-sm font-semibold flex items-center text-emerald-600 dark:text-emerald-400 mb-2">
                <div className="w-3 h-3 rounded-full bg-emerald-600 mr-2"></div>
                {language === 'id' ? 'BUP 60 Tahun' : '60-Year Retirement Age'}
              </h4>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Pejabat Pimpinan Tinggi</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-white">{formatNumber(pimpinanTinggiCount)}</span>
                    {hasEmployeeData && (
                      <button 
                        className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline" 
                        onClick={() => setSelectedCategory('pimpinanTinggi')}
                      >
                        {language === 'id' ? 'Lihat' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fungsional Madya</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-white">{formatNumber(fungsionalMadyaCount)}</span>
                    {hasEmployeeData && (
                      <button 
                        className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline" 
                        onClick={() => setSelectedCategory('fungsionalMadya')}
                      >
                        {language === 'id' ? 'Lihat' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-span-2 mt-1 pt-2 border-t border-gray-100 dark:border-gray-600 flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total BUP 60</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatNumber(bup60Data[idx])}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-3">
              <h4 className="text-sm font-semibold flex items-center text-emerald-600 dark:text-emerald-400 mb-2">
                <div className="w-3 h-3 rounded-full bg-emerald-700 mr-2"></div>
                {language === 'id' ? 'BUP 65 Tahun' : '65-Year Retirement Age'}
              </h4>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fungsional Utama</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-white">{formatNumber(fungsionalUtamaCount)}</span>
                    {hasEmployeeData && (
                      <button 
                        className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline" 
                        onClick={() => setSelectedCategory('fungsionalUtama')}
                      >
                        {language === 'id' ? 'Lihat' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-span-2 mt-1 pt-2 border-t border-gray-100 dark:border-gray-600 flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total BUP 65</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatNumber(bup65Data[idx])}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <p><span className="font-medium">{language === 'id' ? 'Catatan:' : 'Note:'}</span> {language === 'id' ? 'Klik pada bagian grafik lain untuk melihat detail tahun yang berbeda.' : 'Click on other parts of the chart to view details for different years.'}</p>
          {!hasEmployeeData && (
            <p className="mt-1 font-medium text-yellow-600 dark:text-yellow-400">
              {language === 'id' 
                ? `Data detail ASN tidak tersedia untuk tahun ${year}.`
                : `Detailed civil servant data is not available for ${year}.`}
            </p>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarClock className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              {language === 'id' ? 'Prediksi Pensiun Berdasarkan BUP' : 'Retirement Prediction by Age Limit'}
            </h3>
          </div>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center"
            >
              {language === 'id' ? 'Lihat Detail' : 'View Details'}
              <ArrowUpRight size={14} className="ml-1" />
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {language === 'id' 
            ? 'Menampilkan proyeksi jumlah ASN yang akan pensiun berdasarkan batas usia pensiun (BUP) dan jenis jabatan'
            : 'Displaying projection of civil servants who will retire based on retirement age limit and position type'}
        </p>
      </div>
      
      <div className="p-4 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/30 dark:to-gray-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <h4 className="text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-1">
              {language === 'id' ? 'Tahun Ini' : 'This Year'}
            </h4>
            <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300">{formatNumber(currentYearTotal)}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {language === 'id' 
                ? `Pegawai yang pensiun tahun ${data.years[0]}`
                : `Employees retiring in ${data.years[0]}`}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/30 dark:to-gray-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <h4 className="text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-1">
              {language === 'id' ? '5 Tahun Kedepan' : 'Next 5 Years'}
            </h4>
            <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300">{formatNumber(next5YearsTotal)}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {language === 'id' 
                ? 'Total pegawai yang pensiun dalam 5 tahun'
                : 'Total employees retiring in 5 years'}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/30 dark:to-gray-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <h4 className="text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-1">
              {language === 'id' ? 'Puncak Pensiun' : 'Peak Retirement'}
            </h4>
            <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300">{maxPensionYear}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {language === 'id'
                ? `${formatNumber(maxPensionCount)} pegawai akan pensiun`
                : `${formatNumber(maxPensionCount)} employees will retire`}
            </p>
          </div>
        </div>
        
        <div className="h-[260px] mb-4 cursor-pointer" title="Klik pada grafik untuk melihat detail">
          <Bar 
            ref={chartRef}
            data={chartData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  ...chartOptions.plugins.tooltip,
                  titleFont: {
                    size: 12
                  },
                  bodyFont: {
                    size: 11
                  },
                  padding: 8
                }
              }
            }}
            onClick={handleChartClick}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">BUP 58 Tahun</h5>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(totalBup58)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pejabat Administrasi, Fungsional Ahli Pertama/Muda, Keterampilan
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600 mr-2"></div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">BUP 60 Tahun</h5>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(totalBup60)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pejabat Pimpinan Tinggi, Fungsional Ahli Madya
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-700 mr-2"></div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">BUP 65 Tahun</h5>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(totalBup65)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fungsional Ahli Utama
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
          <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">
            {language === 'id' ? 'Interpretasi Data' : 'Data Interpretation'}
          </h4>
          <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1 list-disc pl-4">
            {language === 'id' ? (
              <>
                <li>Kategori BUP berdasarkan PP No. 11 Tahun 2017 dan perubahannya pada PP No. 17 Tahun 2020</li>
                <li>Dari keseluruhan prediksi pensiun {data.years[0]}-{data.years[data.years.length-1]}, sebanyak {((totalBup58/totalAllBup)*100).toFixed(1)}% adalah pegawai dengan BUP 58 tahun</li>
                <li>Puncak pensiun terjadi pada tahun {maxPensionYear} dengan {formatNumber(maxPensionCount)} pegawai</li>
                <li>Persiapkan strategi pengembangan talenta dan rekrutmen untuk mengantisipasi kekosongan jabatan yang akan terjadi</li>
              </>
            ) : (
              <>
                <li>Retirement age categories based on Government Regulation No. 11/2017 and its amendment No. 17/2020</li>
                <li>From all retirement predictions {data.years[0]}-{data.years[data.years.length-1]}, {((totalBup58/totalAllBup)*100).toFixed(1)}% are employees with 58-year retirement age</li>
                <li>Peak retirement occurs in {maxPensionYear} with {formatNumber(maxPensionCount)} employees</li>
                <li>Prepare talent development and recruitment strategies to anticipate upcoming position vacancies</li>
              </>
            )}
          </ul>
        </div>
        
        <div className="mt-4 text-center">
          <button 
            className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            onClick={() => {
              // Set the current year (first year in the data) when clicking the button
              setSelectedYear(data.years[0]);
              setSelectedYearIndex(0);
              setSelectedCategory(null);
              setShowDetailModal(true);
            }}
          >
            <span className="mr-1">{language === 'id' ? 'Lihat Detail Per Tahun' : 'View Yearly Details'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Modal for showing detailed data */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {getDetailModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetirementBupChart; 