import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import type { Employee } from '../../lib/EmployeeContext';

// Shared utilities
const formatDate = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const getReportTitle = (reportType: string): string => {
  switch (reportType) {
    case 'employee-count':
      return 'Jumlah Pegawai';
    case 'gender-distribution':
      return 'Distribusi Gender';
    case 'rank-distribution':
      return 'Distribusi Golongan';
    case 'education-distribution':
      return 'Distribusi Pendidikan';
    case 'unit-distribution':
      return 'Distribusi Unit Kerja';
    case 'age-distribution':
      return 'Distribusi Usia';
    case 'full-report':
      return 'Demografi Lengkap';
    default:
      return 'Laporan ASN';
  }
};

// Excel Export
export const exportToExcel = (
  data: any[],
  reportType: string,
  department: string = 'Semua Unit',
  period: string = 'Tahunan',
  reportMetadata?: { 
    title: string; 
    totalEmployees: number; 
    period: string; 
    department: string; 
    date: string;
  }
) => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  const title = reportMetadata?.title || getReportTitle(reportType);
  const actualPeriod = reportMetadata?.period || period;
  const actualDepartment = reportMetadata?.department || department;
  const actualDate = reportMetadata?.date || formatDate();

  // Add title rows (merged cells with metadata)
  XLSX.utils.sheet_add_aoa(
    ws,
    [
      [`Laporan ${title}`],
      [`Total Pegawai: ${reportMetadata?.totalEmployees || data.length}`],
      [`Periode: ${actualPeriod}`],
      [`Unit: ${actualDepartment}`],
      [`Tanggal Export: ${actualDate}`],
      [''], // Empty row before data
    ],
    { origin: 'A1' }
  );

  // Set column widths
  const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, title);

  // Generate the Excel file
  const filename = `${title}_${formatDate()}.xlsx`;
  // Browser-compatible way to save Excel files
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  
  // Convert binary string to ArrayBuffer
  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }
  
  // Create a blob and save it
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  saveAs(blob, filename);
};

// PDF Export
export const exportToPDF = async (
  elementId: string,
  reportType: string,
  department: string = 'Semua Unit',
  period: string = 'Tahunan',
  data?: any[],
  reportMetadata?: { 
    title: string; 
    totalEmployees: number; 
    period: string; 
    department: string; 
    date: string;
  }
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF();
    
    const title = reportMetadata?.title || getReportTitle(reportType);
    const totalEmployees = reportMetadata?.totalEmployees || (data ? data.length : 0);
    const actualPeriod = reportMetadata?.period || period;
    const actualDepartment = reportMetadata?.department || department;
    const actualDate = reportMetadata?.date || formatDate();
    
    // Add title
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Laporan ${title}`, 105, 20, { align: 'center' });
    
    // Add total employees
    pdf.setFontSize(14);
    pdf.text(`Total Pegawai: ${totalEmployees}`, 105, 30, { align: 'center' });
    
    // Add metadata
    pdf.setFontSize(11);
    pdf.text(`Periode: ${actualPeriod}`, 105, 40, { align: 'center' });
    pdf.text(`Unit: ${actualDepartment}`, 105, 45, { align: 'center' });
    pdf.text(`Tanggal Export: ${actualDate}`, 105, 50, { align: 'center' });
    
    // Convert the chart to an image
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    // Add chart image to PDF
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 180;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgX = (pageWidth - imgWidth) / 2;
    
    pdf.addImage(imgData, 'PNG', imgX, 60, imgWidth, imgHeight);
    
    // Add table with data if provided
    if (data && data.length > 0) {
      // Add a new page for the data table if the chart takes too much space
      if (60 + imgHeight > pageHeight - 50) {
        pdf.addPage();
      } else {
        pdf.text('Data Laporan:', 14, 60 + imgHeight + 10);
      }
      
      // Create table
      const startY = 60 + imgHeight + 15 > pageHeight - 50 ? 20 : 60 + imgHeight + 15;
      
      // Get headers from first data item
      const headers = Object.keys(data[0]);
      
      // Convert data to array format for autoTable
      const tableData = data.map(item => Object.values(item));

      // Add table
      (pdf as any).autoTable({
        head: [headers],
        body: tableData,
        startY: startY,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { top: 20 },
      });
    }

    // Save the PDF as a direct download instead of opening print dialog
    const pdfOutput = pdf.output('blob');
    
    // Create a download link
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(pdfOutput);
    
    // Set up download attributes
    downloadLink.href = url;
    downloadLink.download = `${title}_${formatDate()}.pdf`;
    
    // Append to body, click to download, then remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// PowerPoint Export
export const exportToPPTX = async (
  elementId: string,
  reportType: string,
  department: string = 'Semua Unit',
  period: string = 'Tahunan',
  data?: any[],
  reportMetadata?: { 
    title: string; 
    totalEmployees: number; 
    period: string; 
    department: string; 
    date: string;
  }
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Create a new presentation
    const pptx = new pptxgen();
    
    const title = reportMetadata?.title || getReportTitle(reportType);
    const totalEmployees = reportMetadata?.totalEmployees || (data ? data.length : 0);
    const actualPeriod = reportMetadata?.period || period;
    const actualDepartment = reportMetadata?.department || department;
    const actualDate = reportMetadata?.date || formatDate();
    
    // Add title slide
    const titleSlide = pptx.addSlide();
    
    titleSlide.addText(`Laporan ${title}`, {
      x: 1,
      y: 1,
      w: '80%',
      h: 1.5,
      fontSize: 24,
      color: '363636',
      bold: true,
    });
    
    titleSlide.addText(`Total Pegawai: ${totalEmployees}`, {
      x: 1,
      y: 2.2,
      fontSize: 16,
      color: '363636',
    });
    
    titleSlide.addText(`Periode: ${actualPeriod}`, {
      x: 1,
      y: 3,
      fontSize: 14,
      color: '363636',
    });
    
    titleSlide.addText(`Unit: ${actualDepartment}`, {
      x: 1,
      y: 3.5,
      fontSize: 14,
      color: '363636',
    });
    
    titleSlide.addText(`Tanggal Export: ${actualDate}`, {
      x: 1,
      y: 4,
      fontSize: 14,
      color: '363636',
    });

    // Add charts slide
    const chartsSlide = pptx.addSlide();
    chartsSlide.addText(`Visualisasi Data: ${title}`, {
      x: 1,
      y: 0.5,
      fontSize: 18,
      color: '363636',
      bold: true,
    });

    // Capture the chart as an image and add to slide
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const chartImageData = canvas.toDataURL('image/png').split(',')[1];
    
    chartsSlide.addImage({
      data: chartImageData,
      x: 1,
      y: 1.5,
      w: 8,
      h: 4.5,
    });

    // Add data slide if data is provided
    if (data && data.length > 0) {
      const dataSlide = pptx.addSlide();
      
      dataSlide.addText(`Data ${title}`, {
        x: 1,
        y: 0.5,
        fontSize: 18,
        color: '363636',
        bold: true,
      });
      
      // Add table with data
      const keys = Object.keys(data[0]);
      const rows = [
        keys,
        ...data.map(item => keys.map(key => item[key]?.toString() || '')),
      ];
      
      dataSlide.addTable(rows, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 4.5,
        fontSize: 10,
        border: { pt: 1, color: '363636' },
      });
    }

    // Save the presentation with filename
    const filename = `${title}_${formatDate()}`;
    await pptx.writeFile({ fileName: filename });
  } catch (error) {
    console.error('Error generating PPTX:', error);
  }
};

// Word Export (actually HTML that can be opened in Word)
export const exportToWord = async (
  elementId: string,
  reportType: string,
  department: string = 'Semua Unit',
  period: string = 'Tahunan',
  data?: any[],
  reportMetadata?: { 
    title: string; 
    totalEmployees: number; 
    period: string; 
    department: string; 
    date: string;
  }
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Capture the chart as image
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const chartImageData = canvas.toDataURL('image/png');
    
    const title = reportMetadata?.title || getReportTitle(reportType);
    const totalEmployees = reportMetadata?.totalEmployees || (data ? data.length : 0);
    const actualPeriod = reportMetadata?.period || period;
    const actualDepartment = reportMetadata?.department || department;
    const actualDate = reportMetadata?.date || formatDate();
    
    // Create an HTML document structured for Word
    const htmlTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>Laporan ${title}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .total { font-size: 18px; margin-bottom: 8px; }
            .metadata { font-size: 14px; margin-bottom: 5px; }
            .chart { margin: 20px 0; max-width: 100%; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Laporan ${title}</div>
            <div class="total">Total Pegawai: ${totalEmployees}</div>
            <div class="metadata">Periode: ${actualPeriod}</div>
            <div class="metadata">Unit: ${actualDepartment}</div>
            <div class="metadata">Tanggal Export: ${actualDate}</div>
          </div>
          
          <div class="chart">
            <img src="${chartImageData}" alt="Chart" style="max-width:100%;" />
          </div>
          
          ${data && data.length > 0 ? `
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}
        </body>
      </html>
    `;
    
    // Convert the HTML to a Blob and save
    const blob = new Blob([htmlTemplate], { type: 'application/msword' });
    saveAs(blob, `${title}_${formatDate()}.doc`);
  } catch (error) {
    console.error('Error generating Word document:', error);
  }
};

// Function to download the current chart as an image
export const downloadChartAsImage = async (elementId: string, reportType: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imageData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    
    link.href = imageData;
    link.download = `${getReportTitle(reportType)}_${formatDate()}.png`;
    link.click();
  } catch (error) {
    console.error('Error downloading chart image:', error);
  }
};

// Convert dashboard data to report format
export const prepareReportData = (reportType: string, dashboardData: any) => {
  // Jika dashboardData tidak valid, kembalikan array kosong
  if (!dashboardData) {
    return [];
  }

  switch (reportType) {
    case 'employee-distribution':
      // Gunakan data workUnit dari dashboardData jika tersedia
      if (dashboardData.workUnitData && Array.isArray(dashboardData.workUnitData)) {
        return dashboardData.workUnitData.map((unitData: any) => ({
          unit: unitData.name,
          jumlah: unitData.count || 0,
          persentase: dashboardData.stats && dashboardData.stats.totalEmployees 
            ? ((unitData.count / dashboardData.stats.totalEmployees) * 100).toFixed(1) + '%'
            : '0%'
        }));
      }
      return [];
      
    case 'employee-growth':
      // Gunakan data real atau data dinamis jika tersedia
      if (dashboardData.growthData && Array.isArray(dashboardData.growthData)) {
        return dashboardData.growthData;
      }
      // Default data minimal untuk format laporan
      return [
        { tahun: new Date().getFullYear(), jumlah: dashboardData.stats?.totalEmployees || 0, pertumbuhan: '-' }
      ];
      
    case 'rank-distribution':
      // Gunakan rankData jika tersedia
      if (dashboardData.rankData && Array.isArray(dashboardData.rankData)) {
        const totalEmployees = dashboardData.stats?.totalEmployees || 
          dashboardData.rankData.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
          
        return dashboardData.rankData.map((item: any) => ({
          golongan: item.golongan || 'Tidak ada',
          jumlah: item.count || 0,
          persentase: totalEmployees > 0 
            ? ((item.count / totalEmployees) * 100).toFixed(1) + '%' 
            : '0%'
        }));
      }
      return [];
      
    case 'performance-report':
      // Data kinerja minimal
      if (dashboardData.performanceData && Array.isArray(dashboardData.performanceData)) {
        return dashboardData.performanceData;
      }
      return [];
      
    default:
      return [];
  }
};

/**
 * Generate report data directly from employees data
 * @param reportType The type of report to generate
 * @param employees Array of employee data
 * @returns Formatted data for the report
 */
type GenderDistributionItem = {
  Gender: string;
  Jumlah: number;
  Persentase: string;
};

export const generateReportFromEmployeeData = (reportType: string, employees: Employee[]): any[] => {
  // Ensure we have employees data
  if (!employees || employees.length === 0) {
    return [];
  }

  switch (reportType) {
    case 'employee-count':
      // Basic employee listing with key information
      return employees.map(emp => ({
        NIP: emp.nip,
        Nama: emp.name,
        'Jenis Kelamin': emp.gender === 'male' ? 'Laki-laki' : 'Perempuan',
        'Unit Kerja': emp.workUnit,
        Jabatan: emp.position,
        Golongan: emp.rank || '-',
        Status: emp.status
      }));

    case 'gender-distribution':
      // Count employees by gender
      const genderCounts = employees.reduce((acc, emp) => {
        const gender = emp.gender === 'male' ? 'Laki-laki' : 'Perempuan';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convert to array format
      return Object.entries(genderCounts).map(([gender, count]) => ({
        Gender: gender,
        Jumlah: count,
        Persentase: ((count / employees.length) * 100).toFixed(1) + '%'
      }));
      
    case 'employee-distribution':
      // Get unique work units
      const workUnits = [...new Set(employees.map(emp => emp.workUnit))];
      
      // Count employees by work unit
      return workUnits.map(unit => {
        const count = employees.filter(emp => emp.workUnit === unit).length;
        return {
          'Unit Kerja': unit,
          Jumlah: count,
          Persentase: ((count / employees.length) * 100).toFixed(1) + '%'
        };
      }).sort((a, b) => b.Jumlah - a.Jumlah); // Sort by count descending

    case 'rank-distribution':
      // Get employees by rank/class
      const rankGroups: Record<string, number> = {};
      
      employees.forEach(emp => {
        if (emp.rank) {
          // Extract golongan (I, II, III, IV) from the rank string
          const golonganMatch = emp.rank.match(/^([IVX]+)/);
          if (golonganMatch) {
            const golongan = golonganMatch[1];
            rankGroups[golongan] = (rankGroups[golongan] || 0) + 1;
          }
          }
        });
        
      return Object.entries(rankGroups).map(([golongan, jumlah]) => ({
        Golongan: golongan,
        Jumlah: jumlah,
        Persentase: ((jumlah / employees.length) * 100).toFixed(1) + '%'
      }));
      
    case 'education-distribution':
      // Map education levels
      const educationMap: Record<string, string> = {
        'sd': 'SD/MI',
        'smp': 'SMP/MTs',
        'sma': 'SMA/SMK/MA',
        'd1': 'D1',
        'd2': 'D2',
        'd3': 'D3',
        'd4': 'D4',
        's1': 'S1',
        's2': 'S2',
        's3': 'S3'
      };
      
      // Count by education level
      const educationCounts: Record<string, number> = {};
      
      employees.forEach(emp => {
        if (emp.educationLevel) {
          const level = emp.educationLevel;
          educationCounts[level] = (educationCounts[level] || 0) + 1;
        }
      });
      
      return Object.entries(educationCounts).map(([level, count]) => ({
        'Tingkat Pendidikan': educationMap[level] || level,
        Jumlah: count,
        Persentase: ((count / employees.length) * 100).toFixed(1) + '%'
        }));
      
    case 'age-distribution':
      // Calculate age for each employee
      const now = new Date();
      const ageGroups = {
        'Dibawah 30': 0,
        '30-40': 0,
        '41-50': 0,
        'Diatas 50': 0
      };
      
      employees.forEach(emp => {
        if (emp.birthDate) {
          const birthDate = new Date(emp.birthDate);
          const age = now.getFullYear() - birthDate.getFullYear();
          
          if (age < 30) ageGroups['Dibawah 30']++;
          else if (age >= 30 && age <= 40) ageGroups['30-40']++;
          else if (age >= 41 && age <= 50) ageGroups['41-50']++;
          else ageGroups['Diatas 50']++;
        }
      });
      
      return Object.entries(ageGroups).map(([range, count]) => ({
        'Rentang Usia': range,
        Jumlah: count,
        Persentase: ((count / employees.length) * 100).toFixed(1) + '%'
      }));
      
    case 'position-distribution':
      // Find unique position types
      const positionTypes = [...new Set(employees.map(emp => {
        // Simple position type detection based on common prefixes
        if (emp.position.includes('Kepala') || emp.position.includes('Direktur')) return 'Pejabat Struktural';
        if (emp.position.includes('Fungsional')) return 'Fungsional Tertentu';
        if (emp.position.includes('Analis') || emp.position.includes('Pengolah')) return 'Fungsional Umum';
        return 'Lainnya';
      }))];
      
      // Count employees by position type
      return positionTypes.map(type => {
        const count = employees.filter(emp => {
          if (type === 'Pejabat Struktural') 
            return emp.position.includes('Kepala') || emp.position.includes('Direktur');
          if (type === 'Fungsional Tertentu')
            return emp.position.includes('Fungsional');
          if (type === 'Fungsional Umum')
            return emp.position.includes('Analis') || emp.position.includes('Pengolah');
          return true; // 'Lainnya'
        }).length;
        
        return {
          'Jenis Jabatan': type,
          Jumlah: count,
          Persentase: ((count / employees.length) * 100).toFixed(1) + '%'
        };
      });
      
    case 'demographic-dashboard':
      // Buat laporan demografis lengkap untuk ekspor PDF
      const genderDistribution = generateReportFromEmployeeData('gender-distribution', employees) as GenderDistributionItem[];
      
      // Hitung jumlah pegawai berdasarkan jenis
      const employeeTypeCount: Record<string, number> = {};
      employees.forEach(emp => {
        const type = emp.employeeType;
        employeeTypeCount[type] = (employeeTypeCount[type] || 0) + 1;
      });
      
      const typeDistribution = Object.entries(employeeTypeCount).map(([type, count]) => ({
        'Jenis Pegawai': type === 'pns' ? 'PNS' : 
                       type === 'p3k' ? 'P3K' : 
                       type === 'pppk' ? 'PPPK' : 
                       type === 'honorer' ? 'Honorer' : 'Non ASN',
        Jumlah: count,
        Persentase: ((count / employees.length) * 100).toFixed(1) + '%'
      }));
      
      return [
        { 'Laporan Demografi ASN': '' },
        { 'Total Pegawai:': employees.length },
        { '': '' }, // baris kosong
        { 'Distribusi Gender': '' },
        ...genderDistribution,
        { '': '' }, // baris kosong
        { 'Jumlah Pegawai Berdasarkan Jenis': '' },
        ...typeDistribution
      ];
      
    default:
      return employees.map(emp => ({
        NIP: emp.nip,
        Nama: emp.name,
        Jabatan: emp.position,
        'Unit Kerja': emp.workUnit
      }));
  }
}; 