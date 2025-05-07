import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { 
  BarChart, PieChart, FileText, Filter
} from 'lucide-react';
import { EmployeeProvider } from '../../lib/EmployeeContext';
import ReportCharts from './ReportCharts';

interface SimpleReportsPageProps {
  onLogout: () => void;
}

const SimpleReportsPage: React.FC<SimpleReportsPageProps> = ({ onLogout }) => {
  const [activeReport, setActiveReport] = useState<string>('employee-count');

  const reportTypes = [
    { id: 'employee-count', name: 'Jumlah Pegawai', icon: <BarChart size={18} className="text-emerald-500" /> },
    { id: 'gender-distribution', name: 'Distribusi Gender', icon: <PieChart size={18} className="text-purple-500" /> },
    { id: 'rank-distribution', name: 'Distribusi Golongan', icon: <FileText size={18} className="text-yellow-500" /> },
    { id: 'education-distribution', name: 'Distribusi Pendidikan', icon: <FileText size={18} className="text-green-500" /> },
    { id: 'unit-distribution', name: 'Distribusi Unit Kerja', icon: <BarChart size={18} className="text-indigo-500" /> },
    { id: 'age-distribution', name: 'Distribusi Usia', icon: <BarChart size={18} className="text-red-500" /> },
  ];

  return (
    <EmployeeProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar activePage="reports" onLogout={onLogout} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Laporan" subtitle="Lihat berbagai laporan kepegawaian" />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 dark:bg-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Sidebar Filter */}
              <div className="md:col-span-3 lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-4">
                  <Filter size={14} className="mr-2 text-emerald-500" />
                  Jenis Laporan
                </h3>
                
                <div className="space-y-1">
                  {reportTypes.map(report => (
                    <button
                      key={report.id}
                      onClick={() => setActiveReport(report.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center
                        ${activeReport === report.id 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                      {report.icon}
                      <span className="ml-2">{report.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Main Content */}
              <div className="md:col-span-9 lg:col-span-10">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
                  <ReportCharts reportType={activeReport} />
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  * Data laporan ini diambil langsung dari data pegawai yang tersimpan di sistem.
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </EmployeeProvider>
  );
};

export default SimpleReportsPage; 