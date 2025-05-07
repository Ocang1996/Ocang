import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { ArrowUpRight, Clock } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RetirementPredictionData {
  thisYear: number;
  nextYear: number;
  next5Years: number;
  yearlyData: {
    year: number;
    count: number;
  }[];
}

interface RetirementPredictionChartProps {
  data: { year: number; count: number }[];
  onViewDetails?: () => void;
}

const RetirementPredictionChart = ({ data, onViewDetails }: RetirementPredictionChartProps) => {
  const currentYear = new Date().getFullYear();
  
  // Get retirement data for this year, next year and next 5 years
  const thisYear = data.find(item => item.year === currentYear)?.count || 0;
  const nextYear = data.find(item => item.year === currentYear + 1)?.count || 0;
  
  // Sum of retirements for next 5 years
  const next5Years = data
    .filter(item => item.year >= currentYear && item.year < currentYear + 5)
    .reduce((sum, item) => sum + item.count, 0);
  
  // Create array of next 10 years
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  // Create a mapping of years to retirement counts
  const yearMap = data.reduce((acc, { year, count }) => {
    acc[year] = count;
    return acc;
  }, {} as Record<number, number>);
  
  // Map the retirement counts to the years array
  const retirementCounts = years.map(year => yearMap[year] || 0);
  
  // Calculate cumulative counts for area chart
  const cumulativeCounts = retirementCounts.reduce((acc, count, index) => {
    acc.push((acc[index - 1] || 0) + count);
    return acc;
  }, [] as number[]);
  
  // Get gradient for area fill
  const getGradient = (ctx: any, chartArea: any) => {
    if (!chartArea) return null;
    
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.05)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.3)');
    
    return gradient;
  };

  const chartData = {
    labels: years.map(year => year.toString()),
    datasets: [
      {
        label: 'Prediksi Pensiun',
        data: retirementCounts,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        pointBorderColor: 'rgb(16, 185, 129)',
        pointBackgroundColor: 'white',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
      },
      {
        label: 'Kumulatif',
        data: cumulativeCounts,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.3,
        fill: true,
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return 'rgba(16, 185, 129, 0.1)';
          }
          
          return getGradient(ctx, chartArea);
        },
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const datasetLabel = context.dataset.label || '';
            return `${datasetLabel}: ${formatNumber(value)} pegawai`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Tahun',
          color: '#6b7280',
          font: {
            size: 10,
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          callback: (value: any) => formatNumber(value)
        },
        title: {
          display: true,
          text: 'Jumlah Pegawai',
          color: '#6b7280',
          font: {
            size: 10,
          }
        }
      }
    }
  };

  // Calculate total retirements in next 5 years
  const totalNext5Years = next5Years;
  const totalNext10Years = cumulativeCounts[9];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-800">Prediksi Pensiun</h3>
          </div>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center"
            >
              Lihat Detail
              <ArrowUpRight size={16} className="ml-1" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-indigo-50 to-white p-4 rounded-lg border border-indigo-100">
            <h4 className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Tahun Ini</h4>
            <p className="text-2xl font-bold text-emerald-900">{formatNumber(thisYear)}</p>
            <p className="text-xs text-emerald-600 mt-1">ASN yang akan pensiun tahun {currentYear}</p>
          </div>
          
          <div className="bg-gradient-to-r from-violet-50 to-white p-4 rounded-lg border border-violet-100">
            <h4 className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Tahun Depan</h4>
            <p className="text-2xl font-bold text-emerald-900">{formatNumber(nextYear)}</p>
            <p className="text-xs text-emerald-600 mt-1">ASN yang akan pensiun tahun {currentYear + 1}</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100">
            <h4 className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">5 Tahun Kedepan</h4>
            <p className="text-2xl font-bold text-emerald-900">{formatNumber(next5Years)}</p>
            <p className="text-xs text-emerald-600 mt-1">Total ASN yang akan pensiun dalam 5 tahun kedepan</p>
          </div>
        </div>
        
        <div className="h-64 mb-6">
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="mb-4 md:mb-0">
            <h5 className="text-sm font-medium text-gray-700">Analisis Prediksi Pensiun</h5>
            <p className="text-sm text-gray-500 mt-1">
              {totalNext5Years > 20 ? (
                `Dalam 5 tahun ke depan, ${formatNumber(totalNext5Years)} ASN akan memasuki masa pensiun.`
              ) : (
                `Hanya ${formatNumber(totalNext5Years)} ASN yang akan pensiun dalam 5 tahun ke depan.`
              )}
            </p>
          </div>
          <div className="flex items-center md:flex-col md:items-end">
            <div className="text-xs text-gray-500 mr-2 md:mr-0 md:mb-1">Total 10 Tahun:</div>
            <div className="text-sm font-semibold text-indigo-700">
              {formatNumber(totalNext10Years)} ASN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementPredictionChart; 