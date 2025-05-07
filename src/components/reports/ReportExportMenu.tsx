import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage, PresentationIcon, X } from 'lucide-react';
import { useEmployees } from '../../lib/EmployeeContext';
import {
  exportToExcel,
  exportToPDF,
  exportToWord,
  exportToPPTX,
  downloadChartAsImage,
  generateReportFromEmployeeData
} from './ReportsUtil';
import { useTranslation } from '../../lib/useTranslation';

interface ReportExportMenuProps {
  reportId: string;
  reportType: string;
  department?: string;
  period?: string;
  chartRef?: React.RefObject<HTMLDivElement>;
  data?: any[];
  className?: string;
}

interface FormatOption {
  id: string;
  name: string;
  icon: JSX.Element;
  fileExtension: string;
}

const ReportExportMenu: React.FC<ReportExportMenuProps> = ({
  reportId,
  reportType,
  department = 'Semua Unit',
  period = 'Seluruh Periode',
  chartRef,
  data = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(reportType || 'employee-count');
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  
  const { employees, loading } = useEmployees();

  const formatOptions: FormatOption[] = [
    { id: 'excel', name: 'Excel', icon: <FileSpreadsheet size={18} className="text-green-600" />, fileExtension: '.xlsx' },
    { id: 'pdf', name: 'PDF', icon: <FileText size={18} className="text-red-600" />, fileExtension: '.pdf' },
    { id: 'word', name: 'Word', icon: <FileText size={18} className="text-blue-700" />, fileExtension: '.docx' },
    { id: 'pptx', name: 'PowerPoint', icon: <PresentationIcon size={18} className="text-orange-600" />, fileExtension: '.pptx' },
    { id: 'image', name: t('image_formats'), icon: <FileImage size={18} className="text-purple-600" />, fileExtension: '.png' }
  ];

  const reportTypes = [
    { id: 'employee-count', name: t('total_employees') },
    { id: 'gender-distribution', name: t('gender_distribution') },
    { id: 'rank-distribution', name: t('chart_rank_distribution') },
    { id: 'education-distribution', name: t('chart_education_level') },
    { id: 'unit-distribution', name: t('chart_position_distribution') },
    { id: 'age-distribution', name: t('chart_age_distribution') },
    { id: 'full-report', name: t('demographic_report') }
  ];

  const getReportTitle = () => {
    switch (selectedReportType) {
      case 'gender-distribution':
        return t('gender_distribution');
      case 'employee-distribution':
        return t('employee_distribution');
      case 'rank-distribution':
        return t('chart_rank_distribution');
      case 'age-distribution':
        return t('chart_age_distribution');
      case 'education-distribution':
        return t('chart_education_level');
      case 'position-distribution':
        return t('chart_position_distribution');
      default:
        return t('demographic_report');
    }
  };

  const handleExport = async (formatId: string) => {
    if (isExporting) return;
    
    if (loading || !employees || employees.length === 0) {
      alert(t('no_employees_data_for_export'));
      return;
    }

    setIsExporting(true);
    
    try {
      const elementId = chartRef?.current?.id || reportId;
      
      const reportData = generateReportFromEmployeeData(selectedReportType, employees);
      
      const reportMetadata = {
        title: getReportTitle(),
        totalEmployees: employees.length,
        period: period,
        department: department,
        date: new Date().toLocaleDateString('id-ID'),
      };
      
      if (formatId === 'pdf') {
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Laporan ASN</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #2563eb; }
              h2 { color: #1e40af; margin-top: 20px; }
              table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 30px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f7ff; }
              .header { display: flex; align-items: center; justify-content: space-between; }
              .logo { font-weight: bold; font-size: 24px; color: #1e40af; }
              .date { font-style: italic; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Laporan ${getReportTitle()}</div>
              <div class="date">Tanggal: ${reportMetadata.date}</div>
            </div>
            <p>Total Pegawai: <strong>${employees.length}</strong></p>
        `;
        
        if (selectedReportType === 'gender-distribution' || selectedReportType === 'full-report') {
          const male = employees.filter(emp => emp.gender === 'male').length;
          const female = employees.filter(emp => emp.gender === 'female').length;
          
          htmlContent += `
            <h2>Distribusi Gender</h2>
            <table>
              <tr>
                <th>Gender</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
              <tr>
                <td>Laki-laki</td>
                <td>${male}</td>
                <td>${((male / employees.length) * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>Perempuan</td>
                <td>${female}</td>
                <td>${((female / employees.length) * 100).toFixed(2)}%</td>
              </tr>
            </table>
          `;
        }
        
        if (selectedReportType === 'employee-count' || selectedReportType === 'full-report') {
          const typeCount: Record<string, number> = {
            pns: 0,
            p3k: 0,
            nonAsn: 0,
            pppk: 0,
            honorer: 0
          };
          
          employees.forEach(emp => {
            if (emp.employeeType) {
              typeCount[emp.employeeType as keyof typeof typeCount] = 
                (typeCount[emp.employeeType as keyof typeof typeCount] || 0) + 1;
            }
          });
          
          htmlContent += `
            <h2>Jumlah Pegawai Berdasarkan Jenis</h2>
            <table>
              <tr>
                <th>Jenis Pegawai</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
          `;
          
          const typeLabels: Record<string, string> = {
            pns: 'PNS',
            p3k: 'P3K',
            nonAsn: 'Non ASN',
            pppk: 'PPPK',
            honorer: 'Honorer'
          };
          
          Object.entries(typeCount).forEach(([type, count]) => {
            if (count > 0) {
              htmlContent += `
                <tr>
                  <td>${typeLabels[type] || type}</td>
                  <td>${count}</td>
                  <td>${((count / employees.length) * 100).toFixed(2)}%</td>
                </tr>
              `;
            }
          });
          
          htmlContent += `</table>`;
        }
        
        htmlContent += `
            <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 12px;">
              <p>Laporan ini dibuat secara otomatis dari sistem Dashboard Pegawai pada ${reportMetadata.date}.</p>
            </div>
          </body>
          </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          setTimeout(() => {
            printWindow.print();
            setTimeout(() => printWindow.close(), 1000);
          }, 500);
        } else {
          alert('Silakan aktifkan popup untuk mengunduh PDF');
        }
      } else {
        switch (formatId) {
          case 'excel':
            exportToExcel(reportData, selectedReportType, department, period, reportMetadata);
            break;
          case 'word':
            await exportToWord(elementId, selectedReportType, department, period, reportData, reportMetadata);
            break;
          case 'pptx':
            await exportToPPTX(elementId, selectedReportType, department, period, reportData, reportMetadata);
            break;
          case 'image':
            await downloadChartAsImage(elementId, selectedReportType);
            break;
          default:
            console.error('Format tidak didukung:', formatId);
        }
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Terjadi kesalahan saat mengekspor laporan. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      >
        <Download size={16} className="mr-1" />
        <span>Ekspor Data</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ekspor Laporan</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jenis Laporan
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-1.5 px-2 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 dark:bg-gray-700 text-sm"
              disabled={isExporting}
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Pilih format untuk mengunduh laporan:
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {formatOptions.map(format => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  disabled={isExporting}
                  className="flex items-center space-x-2 rounded-md border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-sm"
                >
                  {format.icon}
                  <span>{format.name}</span>
                </button>
              ))}
            </div>
            
            {isExporting && (
              <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-1 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportExportMenu; 