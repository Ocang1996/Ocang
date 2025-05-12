import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage, PresentationIcon, X } from 'lucide-react';
import { useEmployees } from '../../lib/EmployeeContext';
import {
  downloadChartAsImage,
  generateReportFromEmployeeData
} from './ReportsUtil';
import { useTranslation } from '../../lib/useTranslation';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';

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

interface ReportData {
  [key: string]: string | number;
}

const ReportExportMenu: React.FC<ReportExportMenuProps> = ({
  reportId,
  reportType,
  department = 'Semua Unit',
  period = 'Seluruh Periode',
  chartRef,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(reportType || 'employee-count');
  const { t } = useTranslation();
  
  const { employees, loading } = useEmployees();
  const [lastSelectedFormat, setLastSelectedFormat] = useState<string>('');

  const formatOptions: FormatOption[] = [
    { id: 'excel', name: 'Excel', icon: <FileSpreadsheet size={18} className="text-green-600" />, fileExtension: '.xlsx' },
    { id: 'word', name: 'Word', icon: <FileText size={18} className="text-blue-700" />, fileExtension: '.docx' },
    { id: 'pptx', name: 'PPTX', icon: <PresentationIcon size={18} className="text-orange-600" />, fileExtension: '.pptx' },
    { id: 'image', name: t('image_formats'), icon: <FileImage size={18} className="text-purple-600" />, fileExtension: '.png' },
    { id: 'csv', name: 'CSV', icon: <FileText size={18} className="text-gray-700" />, fileExtension: '.csv' },
    { id: 'pdf', name: 'PDF', icon: <FileText size={18} className="text-red-600" />, fileExtension: '.pdf' }
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
      
      const reportData = generateReportFromEmployeeData(selectedReportType, employees) as ReportData[];
      
      const reportMetadata = {
        title: getReportTitle(),
        totalEmployees: employees.length,
        period: period,
        department: department,
        date: new Date().toLocaleDateString('id-ID'),
      };
      
      if (formatId === 'pdf') {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Add title
        doc.setFontSize(16);
        doc.text(reportMetadata.title, doc.internal.pageSize.width / 2, 20, { align: 'center' });

        // Add period and department info
        doc.setFontSize(10);
        doc.text(`Periode: ${reportMetadata.period}`, 14, 30);
        doc.text(`Unit: ${reportMetadata.department}`, 14, 35);

        // Prepare table data
        const tableData = reportData.map((item: ReportData) => Object.values(item));
        const headers = Object.keys(reportData[0]);

        // Add table
        autoTable(doc, {
          head: [headers],
          body: tableData,
          startY: 40,
          margin: { top: 40 },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' }
          }
        });

        // Save the PDF
        const fileName = `${reportMetadata.title}_${new Date().toISOString().split('T')[0]}`;
        doc.save(`${fileName}.pdf`);
      } else if (formatId === 'word') {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${reportMetadata.title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                font-size: 10pt;
              }
              h1 {
                text-align: center;
                color: #2563eb;
                font-size: 16pt;
                margin-bottom: 20px;
              }
              .info {
                margin-bottom: 20px;
                font-size: 9pt;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 6px;
                text-align: left;
                font-size: 9pt;
              }
              th {
                background-color: #f2f7ff;
                font-weight: bold;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
            </style>
          </head>
          <body>
            <h1>${reportMetadata.title}</h1>
            <div class="info">
              <p>Periode: ${reportMetadata.period}</p>
              <p>Unit: ${reportMetadata.department}</p>
            </div>
            <table>
              <thead>
                <tr>
                  ${Object.keys(reportData[0]).map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${reportData.map(row => `
                  <tr>
                    ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
          </html>
        `;

        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportMetadata.title}_${new Date().toISOString().split('T')[0]}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (formatId === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        
        // Set column widths
        const colWidths = Object.keys(reportData[0]).map(key => ({
          wch: Math.max(key.length, 15)
        }));
        worksheet['!cols'] = colWidths;

        // Add title and metadata
        XLSX.utils.sheet_add_aoa(worksheet, [[reportMetadata.title]], { origin: 'A1' });
        XLSX.utils.sheet_add_aoa(worksheet, [
          ['Periode:', reportMetadata.period],
          ['Unit:', reportMetadata.department]
        ], { origin: 'A2' });

        // Add empty row before data
        XLSX.utils.sheet_add_aoa(worksheet, [['']], { origin: 'A4' });

        // Create workbook and add worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');

        // Save file
        const fileName = `${reportMetadata.title}_${new Date().toISOString().split('T')[0]}`;
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      } else if (formatId === 'csv') {
        // Add title and metadata as comments
        let csvContent = `# ${reportMetadata.title}\n`;
        csvContent += `# Periode: ${reportMetadata.period}\n`;
        csvContent += `# Unit: ${reportMetadata.department}\n\n`;

        // Add headers
        const headers = Object.keys(reportData[0]);
        csvContent += headers.join(',') + '\n';

        // Add data rows
        reportData.forEach(row => {
          const values = Object.values(row).map(value => {
            // Escape commas and quotes in values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvContent += values.join(',') + '\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportMetadata.title}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (formatId === 'pptx') {
        const pptx = new pptxgen();
        
        // Set presentation properties
        pptx.author = 'Dashboard ASN';
        pptx.company = 'BSKDN';
        pptx.title = reportMetadata.title;
        
        // Add title slide
        const titleSlide = pptx.addSlide();
        titleSlide.background = { color: 'FFFFFF' };
        titleSlide.addText(reportMetadata.title, {
          x: 0.5,
          y: 1,
          w: '90%',
          h: 1,
          fontSize: 24,
          color: '2563EB',
          bold: true,
          align: 'center'
        });
        
        titleSlide.addText([
          { text: 'Periode: ', options: { bold: true } },
          { text: reportMetadata.period },
          { text: '\nUnit: ', options: { bold: true } },
          { text: reportMetadata.department }
        ], {
          x: 0.5,
          y: 2,
          w: '90%',
          h: 1,
          fontSize: 14,
          color: '666666'
        });

        // Add chart slide
        const chartSlide = pptx.addSlide();
        chartSlide.background = { color: 'FFFFFF' };

        // Capture chart as image
        if (chartRef?.current) {
          const canvas = await html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#FFFFFF'
          });
          
          const imageData = canvas.toDataURL('image/png');
          
          // Add chart image to slide
          chartSlide.addImage({
            data: imageData,
            x: 0.5,
            y: 0.5,
            w: '90%',
            h: '70%'
          });
        }

        // Add data table slide
        const tableSlide = pptx.addSlide();
        tableSlide.background = { color: 'FFFFFF' };

        // Prepare table data with proper types
        const headers = Object.keys(reportData[0]).map(header => ({
          text: header,
          options: { bold: true, fill: { type: 'solid' as const, color: 'F3F4F6' } }
        }));

        const rows = reportData.map(row => 
          Object.values(row).map(value => ({
            text: String(value),
            options: { fill: { type: 'solid' as const, color: 'FFFFFF' } }
          }))
        );

        const tableData = [headers, ...rows];

        // Add table to slide
        tableSlide.addTable(tableData, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          colW: [3, 2, 2],
          border: { type: 'solid', pt: 1, color: 'E5E7EB' },
          align: 'left',
          fontSize: 10,
          color: '1F2937'
        });

        // Save the presentation
        const fileName = `${reportMetadata.title}_${new Date().toISOString().split('T')[0]}`;
        await pptx.writeFile({ fileName: `${fileName}.pptx` });
      } else {
        switch (formatId) {
          case 'image':
            await downloadChartAsImage(elementId, selectedReportType);
            break;
          default:
            console.error('Format tidak didukung:', formatId);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(t('error_general'));
    } finally {
      setIsExporting(false);
      setIsOpen(false);
      setLastSelectedFormat(formatId);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-lg px-6 py-2 min-w-[120px] text-base font-medium transition-colors"
      >
        <Download size={16} className="mr-1" />
        <span>Ekspor Data</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] max-w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn">
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
              Pilih format untuk mengunduh laporan:
            </p>
            
            <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
              {formatOptions.map(format => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  disabled={isExporting}
                  className={`flex items-center space-x-2 rounded-md border border-gray-200 dark:border-gray-700 p-3 text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-base font-medium w-full text-left hover:font-bold ${lastSelectedFormat === format.id ? 'bg-emerald-100 dark:bg-emerald-900/40 font-bold' : ''}`}
                >
                  {format.icon}
                  <span className="truncate">{format.name}</span>
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