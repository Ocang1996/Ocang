import React, { useEffect, useState } from 'react';
import { useEmployees } from '../../lib/EmployeeContext';
import { generateReportFromEmployeeData } from './ReportsUtil';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
} from 'chart.js';
import ReportExportMenu from './ReportExportMenu';
import { useTranslation } from '../../lib/useTranslation';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement
);

interface ReportChartsProps {
  reportType: string;
}

const ReportCharts: React.FC<ReportChartsProps> = ({ reportType }) => {
  const { employees, loading, error } = useEmployees();
  const [chartData, setChartData] = useState<any>(null);
  const [chartTitle, setChartTitle] = useState<string>('');
  const { t } = useTranslation();

  // Chart colors with dark mode compatibility
  const chartColors = [
    'rgba(16, 185, 129, 0.8)',  // emerald-500
    'rgba(5, 150, 105, 0.8)',   // emerald-600
    'rgba(4, 120, 87, 0.8)',    // emerald-700
    'rgba(6, 95, 70, 0.8)',     // emerald-800
    'rgba(6, 78, 59, 0.8)',     // emerald-900
    'rgba(52, 211, 153, 0.8)',  // emerald-400
    'rgba(110, 231, 183, 0.8)', // emerald-300
    'rgba(167, 243, 208, 0.8)', // emerald-200
    'rgba(209, 250, 229, 0.8)', // emerald-100
    'rgba(236, 253, 245, 0.8)', // emerald-50
  ];

  useEffect(() => {
    if (!loading && employees && employees.length > 0) {
      const reportData = generateReportFromEmployeeData(reportType, employees);
      
      if (reportData.length === 0) return;

      let labels: string[] = [];
      let values: number[] = [];
      let title = '';

      switch (reportType) {
        case 'gender-distribution':
          title = t('gender_distribution');
          labels = reportData.map((item: any) => item.Gender);
          values = reportData.map((item: any) => item.Jumlah);
          break;
        
        case 'rank-distribution':
          title = t('chart_rank_distribution');
          labels = reportData.map((item: any) => item.Golongan);
          values = reportData.map((item: any) => item.Jumlah);
          break;
        
        case 'education-distribution':
          title = t('chart_education_level');
          // Sort by education level
          const sortOrder: Record<string, number> = { 
            'SD': 1, 'SMP': 2, 'SMA/SMK': 3, 
            'D1': 4, 'D2': 5, 'D3': 6, 'D4': 7, 
            'S1': 8, 'S2': 9, 'S3': 10 
          };
          
          reportData.sort((a: any, b: any) => {
            const aOrder = sortOrder[a['Tingkat Pendidikan']] || 99;
            const bOrder = sortOrder[b['Tingkat Pendidikan']] || 99;
            return aOrder - bOrder;
          });
          
          labels = reportData.map((item: any) => item['Tingkat Pendidikan']);
          values = reportData.map((item: any) => item.Jumlah);
          break;
        
        case 'unit-distribution':
          title = t('chart_position_distribution');
          labels = reportData.map((item: any) => item['Unit Kerja']);
          values = reportData.map((item: any) => item.Jumlah);
          break;
        
        case 'age-distribution':
          title = t('chart_age_distribution');
          // Sort by age group
          reportData.sort((a: any, b: any) => {
            const aAge = parseInt(a['Kelompok Usia'].split('-')[0]);
            const bAge = parseInt(b['Kelompok Usia'].split('-')[0]);
            return aAge - bAge;
          });
          
          labels = reportData.map((item: any) => item['Kelompok Usia']);
          values = reportData.map((item: any) => item.Jumlah);
          break;
        
        case 'employee-count':
        default:
          title = t('total_employees');
          // For employee count, create a simple count by status
          const statusGroups: Record<string, number> = {};
          
          employees.forEach(emp => {
            statusGroups[emp.status] = (statusGroups[emp.status] || 0) + 1;
          });
          
          labels = Object.keys(statusGroups);
          values = Object.values(statusGroups);
          break;
      }

      setChartTitle(title);
      setChartData({
        labels,
        datasets: [
          {
            label: t('employee_count'),
            data: values,
            backgroundColor: chartColors.slice(0, labels.length),
            borderColor: chartColors.map(color => color.replace('0.8', '1')),
            borderWidth: 1,
          },
        ],
      });
    }
  }, [reportType, employees, loading, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">{t('loading_data')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 dark:text-red-400 mb-2">{t('error_general')}:</div>
        <div className="text-gray-600 dark:text-gray-400">{error}</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400">
        {t('no_data')}
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(107, 114, 128)', // text-gray-500
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: chartTitle,
        color: 'rgb(107, 114, 128)', // text-gray-500
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        },
        backgroundColor: 'rgba(6, 78, 59, 0.8)', // emerald-900 with opacity
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(16, 185, 129, 1)', // emerald-500
        borderWidth: 1,
        caretSize: 6,
        cornerRadius: 4,
        displayColors: true,
        boxPadding: 4
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(167, 243, 208, 0.2)', // emerald-200 with opacity
          borderColor: 'rgba(16, 185, 129, 0.3)', // emerald-500 with opacity
          borderWidth: 1
        },
        ticks: {
          color: 'rgb(107, 114, 128)', // text-gray-500
        }
      },
      y: {
        grid: {
          color: 'rgba(167, 243, 208, 0.2)', // emerald-200 with opacity
          borderColor: 'rgba(16, 185, 129, 0.3)', // emerald-500 with opacity
          borderWidth: 1
        },
        ticks: {
          color: 'rgb(107, 114, 128)', // text-gray-500
        }
      }
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 2,
        borderColor: 'rgba(16, 185, 129, 1)', // emerald-500
        fill: true,
        backgroundColor: 'rgba(209, 250, 229, 0.5)' // emerald-100 with opacity (gradient fill)
      },
      point: {
        radius: 4,
        backgroundColor: 'rgba(16, 185, 129, 1)', // emerald-500
        borderColor: '#fff',
        borderWidth: 2,
        hoverRadius: 6
      },
      arc: {
        borderWidth: 1,
        borderColor: '#fff',
        hoverBorderWidth: 2,
        hoverBorderColor: '#fff'
      }
    }
  };

  // Choose chart type based on report type
  const getChartComponent = () => {
    switch (reportType) {
      case 'gender-distribution':
        return <Pie data={chartData} options={chartOptions} />;
      
      case 'rank-distribution':
        return <Doughnut data={chartData} options={chartOptions} />;
      
      case 'unit-distribution':
        // For many units, use a horizontal bar chart
        if (chartData.labels.length > 5) {
          return (
            <Bar 
              data={chartData} 
              options={{
                ...chartOptions,
                indexAxis: 'y' as const,
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(107, 114, 128, 0.1)',
                    },
                    ticks: {
                      color: 'rgb(107, 114, 128)',
                    }
                  },
                  y: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: 'rgb(107, 114, 128)',
                    }
                  }
                }
              }} 
            />
          );
        }
        return <Pie data={chartData} options={chartOptions} />;
      
      case 'age-distribution':
        return <Bar data={chartData} options={{
          ...chartOptions,
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: 'rgb(107, 114, 128)',
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(107, 114, 128, 0.1)',
              },
              ticks: {
                color: 'rgb(107, 114, 128)',
              }
            }
          }
        }} />;
      
      case 'education-distribution':
        return <Bar data={chartData} options={{
          ...chartOptions,
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: 'rgb(107, 114, 128)',
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(107, 114, 128, 0.1)',
              },
              ticks: {
                color: 'rgb(107, 114, 128)',
              }
            }
          }
        }} />;
      
      case 'employee-count':
      default:
        return <Doughnut data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <ReportExportMenu chartElementId="report-chart" className="ml-2" />
      </div>
      
      <div className="w-full h-[500px] flex items-center justify-center pt-8" id="report-chart">
        {getChartComponent()}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Data berdasarkan {employees.length} pegawai terdaftar
      </div>
    </div>
  );
};

export default ReportCharts; 