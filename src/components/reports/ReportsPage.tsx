import { useState, useEffect, useRef } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useSidebar } from '../../lib/SidebarContext';
import { 
  FileText, Download, Users, Award, BookOpen, Building, Calendar, 
  ChevronDown, Check, PresentationIcon, 
  FileText as FileTextIcon, FileSpreadsheet, X, Info
} from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { useEmployees } from '../../lib/EmployeeContext';
// Employee type imported from EmployeeContext
import PptxGenJS from "pptxgenjs";
// html2canvas may be needed in future features

// Add TypeScript interface declaration for msSaveOrOpenBlob
declare global {
  interface Navigator {
    msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
  }
  interface Window {
    saveAs?: (blob: Blob, name: string) => void;
  }
}

interface ReportsPageProps {
  onLogout: () => void;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  formats: string[];
}

interface FormatOption {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
}

const ReportsPage = ({ onLogout }: ReportsPageProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('excel');
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState<boolean>(false);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState<boolean>(false);
  const { expanded } = useSidebar();  
  const reportDropdownRef = useRef<HTMLDivElement>(null);
  const formatDropdownRef = useRef<HTMLDivElement>(null);

  // Get theme and translations
  const { } = useTheme(); // We'll use theme context later if needed
  const { t } = useTranslation();
  
  // Get employee data from context
  const { employees, loading } = useEmployees();
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reportDropdownRef.current && !reportDropdownRef.current.contains(event.target as Node)) {
        setIsReportDropdownOpen(false);
      }
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target as Node)) {
        setIsFormatDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Generate dashboard data from employees
  useEffect(() => {
    // Wait until employees data is loaded
    if (loading) {
      setIsLoading(true);
      return;
    }
    
    if (!employees || employees.length === 0) {
      setIsLoading(false);
      return;
    }
    
    // Generate data from actual employees
    const totalEmployees = employees.length;
    
    // Count employees by type
    const employeeTypeCounts = {
      pns: 0,
      p3k: 0,
      nonAsn: 0
    };
    
    employees.forEach(emp => {
      if (emp.employeeType === 'pns') employeeTypeCounts.pns++;
      else if (emp.employeeType === 'p3k') employeeTypeCounts.p3k++;
      else employeeTypeCounts.nonAsn++;
    });
    
    // Count by gender
    const maleCount = employees.filter(emp => emp.gender === 'male').length;
    const femaleCount = employees.filter(emp => emp.gender === 'female').length;
    
    // Count by work unit
    const workUnitCounts: Record<string, number> = {};
    employees.forEach(emp => {
      if (emp.workUnit) {
        workUnitCounts[emp.workUnit] = (workUnitCounts[emp.workUnit] || 0) + 1;
      }
    });
    
    const workUnitData = Object.entries(workUnitCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Count by rank/golongan
    const rankCounts: Record<string, number> = {};
    employees.forEach(emp => {
      if (emp.rank) {
        // Extract golongan
        const match = emp.rank.match(/\(([IVX]+[a-d]?)\)/i);
        if (match) {
          const golongan = match[1];
          rankCounts[golongan] = (rankCounts[golongan] || 0) + 1;
        } else {
          // If pattern doesn't match, use the entire rank as golongan
          rankCounts[emp.rank] = (rankCounts[emp.rank] || 0) + 1;
        }
      }
    });
    
    // Log golongan data untuk debugging
    console.log('Rank Raw Data:', employees.map(emp => emp.rank));
    console.log('Rank Counts:', rankCounts);
    
    const rankData = Object.entries(rankCounts)
      .map(([golongan, count]) => ({ golongan, count }))
      .sort((a, b) => {
        // Sort by roman numeral (I, II, III, IV)
        const getRankValue = (rank: string) => {
          if (rank.toLowerCase().includes('iv')) return 4;
          if (rank.toLowerCase().includes('iii')) return 3;
          if (rank.toLowerCase().includes('ii')) return 2;
          if (rank.toLowerCase().includes('i')) return 1;
          return 0;
        };
        return getRankValue(a.golongan) - getRankValue(b.golongan);
      });
    
    // Log rank data setelah pengolahan
    console.log('Rank Processed Data:', rankData);
    
    // Count by education level
    const educationCounts: Record<string, number> = {};
    employees.forEach(emp => {
      if (emp.educationLevel) {
        // Normalize education level to uppercase for consistent comparison
        const normalizedLevel = emp.educationLevel.toUpperCase();
        educationCounts[normalizedLevel] = (educationCounts[normalizedLevel] || 0) + 1;
      }
    });
    
    const educationData = Object.entries(educationCounts)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => {
        // Sort by education level (SD, SMP, SMA, D1, D2, D3, D4, S1, S2, S3)
        const getEducationValue = (edu: string) => {
          if (edu.includes('SD')) return 1;
          if (edu.includes('SMP')) return 2;
          if (edu.includes('SMA') || edu.includes('SMK')) return 3;
          if (edu.includes('D1')) return 4;
          if (edu.includes('D2')) return 5;
          if (edu.includes('D3')) return 6;
          if (edu.includes('D4') || edu.includes('S1')) return 7;
          if (edu.includes('S2')) return 8;
          if (edu.includes('S3')) return 9;
          return 0;
        };
        return getEducationValue(a.level) - getEducationValue(b.level);
      });
    
    // Log education data for debugging
    console.log('Education Data:', educationData);
    console.log('Education Counts:', educationCounts);
    
    // Count by age groups
    const ageGroups: Record<string, number> = {
      'Di bawah 30': 0,
      '30-40': 0,
      '41-50': 0,
      '51-60': 0,
      'Di atas 60': 0
    };
    
    const currentYear = new Date().getFullYear();
    
    employees.forEach(emp => {
      if (emp.birthDate) {
        const birthYear = new Date(emp.birthDate).getFullYear();
        const age = currentYear - birthYear;
        
        if (age < 30) ageGroups['Di bawah 30']++;
        else if (age >= 30 && age <= 40) ageGroups['30-40']++;
        else if (age >= 41 && age <= 50) ageGroups['41-50']++;
        else if (age >= 51 && age <= 60) ageGroups['51-60']++;
        else ageGroups['Di atas 60']++;
      }
    });
    
    const ageData = Object.entries(ageGroups)
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => {
        const getAgeValue = (ageGroup: string) => {
          if (ageGroup === 'Di bawah 30') return 1;
          if (ageGroup === '30-40') return 2;
          if (ageGroup === '41-50') return 3;
          if (ageGroup === '51-60') return 4;
          if (ageGroup === 'Di atas 60') return 5;
          return 0;
        };
        return getAgeValue(a.group) - getAgeValue(b.group);
      });
    
    // Create a new dashboard data object
    const generatedDashboardData = {
          stats: {
        totalEmployees,
        newEmployees: employees.filter(emp => {
          const created = new Date(emp.createdAt || '');
          const now = new Date();
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
          return created >= thirtyDaysAgo;
        }).length,
        pendingApprovals: 0, // Not implemented
        totalDepartments: workUnitData.length
          },
          employeeTypesData: {
        pns: employeeTypeCounts.pns,
        p3k: employeeTypeCounts.p3k,
        nonAsn: employeeTypeCounts.nonAsn
          },
          genderData: {
        male: maleCount,
        female: femaleCount
      },
      workUnitData,
      rankData,
      educationData,
      ageData
    };
    
    setDashboardData(generatedDashboardData);
        setIsLoading(false);
    
  }, [employees, loading]);

  // Available report types
  const availableReports: ReportType[] = [
    { 
      id: 'gender-distribution', 
      name: t('gender_distribution'),
      description: t('employee_distribution_desc'),
      icon: <Users size={20} className="text-emerald-600" />,
      formats: ['pdf', 'excel', 'csv', 'docx', 'pptx', 'jpg', 'png']
    },
    { 
      id: 'rank-distribution', 
      name: t('rank_distribution'),
      description: t('rank_distribution_desc'),
      icon: <Award size={20} className="text-yellow-600" />,
      formats: ['pdf', 'excel', 'csv', 'docx', 'pptx', 'jpg', 'png']
    },
    { 
      id: 'education-distribution', 
      name: t('chart_education_level'),
      description: t('education_summary'),
      icon: <BookOpen size={20} className="text-green-600" />,
      formats: ['pdf', 'excel', 'csv', 'docx', 'pptx', 'jpg', 'png']
    },
    { 
      id: 'department-distribution', 
      name: t('chart_position_distribution'),
      description: t('position_summary'),
      icon: <Building size={20} className="text-purple-600" />,
      formats: ['pdf', 'excel', 'csv', 'docx', 'pptx', 'jpg', 'png']
    },
    { 
      id: 'age-distribution', 
      name: t('chart_age_distribution'),
      description: t('demographic_data_summary'),
      icon: <Calendar size={20} className="text-red-600" />,
      formats: ['pdf', 'excel', 'csv', 'docx', 'pptx', 'jpg', 'png']
    },
    { 
      id: 'full-report', 
      name: t('demographic_report'),
      description: t('demographic_report_desc'),
      icon: <FileText size={20} className="text-gray-600" />,
      formats: ['pdf', 'excel', 'docx', 'pptx']
    },
  ];

  // Format dropdown options
  const formatOptions: FormatOption[] = [
    { id: 'excel', name: 'Excel', icon: <FileSpreadsheet size={16} />, color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50' },
    { id: 'docx', name: 'Word', icon: <FileTextIcon size={16} />, color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50' },
    { id: 'pptx', name: 'PowerPoint', icon: <PresentationIcon size={16} />, color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50' },
    { id: 'pdf', name: 'PDF', icon: <FileTextIcon size={16} />, color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' }
  ];

  // Fungsi untuk mendapatkan informasi laporan berdasarkan ID
  const getReportInfo = (reportId: string): ReportType | undefined => {
    return availableReports.find(report => report.id === reportId);
  };

  // Toggle pilihan laporan
  const toggleReportSelection = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  // Fungsi untuk menghapus laporan dari seleksi
  const removeReport = (reportId: string) => {
    setSelectedReports(selectedReports.filter(id => id !== reportId));
  };

  // Cek apakah format valid untuk semua laporan yang dipilih
  const isFormatValidForSelectedReports = (formatId: string): boolean => {
    if (selectedReports.length === 0) return true;
    return selectedReports.every(reportId => {
      const report = getReportInfo(reportId);
      return report?.formats.includes(formatId) || false;
    });
  };

  // Daftar format yang valid untuk laporan yang dipilih
  const getValidFormats = (): FormatOption[] => {
    if (selectedReports.length === 0) return formatOptions;
    
    const validFormatIds = formatOptions
      .filter(format => isFormatValidForSelectedReports(format.id))
      .map(format => format.id);
    
    return formatOptions.filter(format => validFormatIds.includes(format.id));
  };

  // Cek apakah format yang dipilih valid untuk laporan yang dipilih
  useEffect(() => {
    if (selectedReports.length > 0 && !isFormatValidForSelectedReports(selectedFormat)) {
      // Jika format tidak valid, pilih format pertama yang valid
      const validFormats = getValidFormats();
      if (validFormats.length > 0) {
        setSelectedFormat(validFormats[0].id);
      }
    }
  }, [selectedReports, selectedFormat]);

  // Fungsi untuk mengunduh laporan
  const handleDownload = async () => {
    if (selectedReports.length === 0) {
      alert('Silakan pilih minimal satu jenis laporan untuk diunduh');
      return;
    }

    if (isLoading || !dashboardData) {
      alert('Data sedang dimuat, silakan tunggu...');
      return;
    }
    
    // Fungsi bantuan untuk mengunduh file
    const downloadFile = (data: string | Blob, fileName: string, type: string) => {
      const blob = data instanceof Blob ? data : new Blob([data], { type });
      downloadBlob(blob, fileName);
    };

    // Fungsi untuk mengunduh blob
    const downloadBlob = (blob: Blob, fileName: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
        document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    // Fungsi bantuan untuk memformat tingkat pendidikan
    const formatEducationLevel = (level: string): string => {
      const normalizedLevel = level.toLowerCase();
      switch(normalizedLevel) {
        case 'sd': return 'SD';
        case 'smp': return 'SMP';
        case 'sma': return 'SMA/SMK';
        case 'd1': return 'D1';
        case 'd2': return 'D2';
        case 'd3': return 'D3';
        case 'd4': return 'D4';
        case 's1': return 'S1';
        case 's2': return 'S2';
        case 's3': return 'S3';
        default: return level.toUpperCase();
      }
    };
    
    // Fungsi bantuan untuk memformat tampilan golongan
    const formatGolongan = (golongan: string): string => {
      // Pastikan golongan tampil dengan benar, format: [Angka Romawi]/[Huruf]
      // Periksa apakah memerlukan transformasi khusus
      if (golongan.includes('Pembina') || 
          golongan.includes('Penata') || 
          golongan.includes('Pengatur')) {
        // Ekstrak angka romawi dan huruf dari format lengkap
        const match = golongan.match(/\(([IVX]+[a-d]?)\)/i);
        if (match) {
          return match[1];
        }
      }
      return golongan;
    };
    
    // Dapatkan data dari dashboardData
    const reportData = dashboardData || {
      stats: {
        totalEmployees: employees?.length || 0,
        newEmployees: 0,
        pendingApprovals: 0,
        totalDepartments: 0
      },
      employeeTypesData: {
        pns: 0,
        p3k: 0,
        nonAsn: 0
      },
      genderData: {
        male: 0,
        female: 0
      },
      workUnitData: [],
      rankData: [],
      educationData: [],
      ageData: []
    };
    
    // Log all data for debugging
    console.log('Report Data:', reportData);
    
    // Tentukan format file dan nama file
    const timestamp = new Date().toISOString().slice(0, 10);
    let fileName = `Laporan_Pegawai_BSKDN_${timestamp}`;
    
    if (selectedReports.length === 1) {
      fileName = `${getReportInfo(selectedReports[0])?.name}_${timestamp}`;
    }
    
    // Proses berdasarkan format yang dipilih
    switch (selectedFormat) {
      case 'csv': {
        // Generate CSV data
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Header CSV
        csvContent += `Laporan Demografi Pegawai BSKDN - ${timestamp}\n`;
        csvContent += `Total Pegawai: ${reportData.stats.totalEmployees}\n\n`;
        
        // Gender distribution
        if (selectedReports.includes('gender-distribution') || selectedReports.includes('full-report')) {
          csvContent += 'Distribusi Gender\n';
          csvContent += 'Gender,Jumlah,Persentase\n';
          csvContent += `Laki-laki,${reportData.genderData.male},${((reportData.genderData.male / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          csvContent += `Perempuan,${reportData.genderData.female},${((reportData.genderData.female / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n\n`;
        }
        
        // Employee types
        if (selectedReports.includes('employee-count') || selectedReports.includes('full-report')) {
          csvContent += 'Distribusi Jenis Pegawai\n';
          csvContent += 'Jenis,Jumlah,Persentase\n';
          csvContent += `PNS,${reportData.employeeTypesData.pns},${((reportData.employeeTypesData.pns / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          csvContent += `P3K,${reportData.employeeTypesData.p3k},${((reportData.employeeTypesData.p3k / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          csvContent += `Non BSKDN,${reportData.employeeTypesData.nonAsn},${((reportData.employeeTypesData.nonAsn / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n\n`;
        }
        
        // Work unit distribution
        if (selectedReports.includes('unit-distribution') || selectedReports.includes('full-report')) {
          csvContent += 'Distribusi Unit Kerja\n';
          csvContent += 'Unit Kerja,Jumlah,Persentase\n';
          
          reportData.workUnitData.forEach((item: { name: string; count: number }) => {
            csvContent += `${item.name},${item.count},${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          });
          
          csvContent += '\n';
        }
        
        // Rank distribution
        if (selectedReports.includes('rank-distribution') || selectedReports.includes('full-report')) {
          csvContent += 'Distribusi Golongan\n';
          csvContent += 'Golongan,Jumlah,Persentase\n';
          
          reportData.rankData.forEach((item: { golongan: string; count: number }) => {
            csvContent += `${formatGolongan(item.golongan)},${item.count},${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          });
          
          csvContent += '\n';
        }
        
        // Education distribution
        if (selectedReports.includes('education-distribution') || selectedReports.includes('full-report')) {
          csvContent += 'Distribusi Tingkat Pendidikan\n';
          csvContent += 'Tingkat Pendidikan,Jumlah,Persentase\n';
          
          reportData.educationData.forEach((item: { level: string; count: number }) => {
            csvContent += `${formatEducationLevel(item.level)},${item.count},${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          });
          
          csvContent += '\n';
        }
        
        // Age distribution
        if (selectedReports.includes('age-distribution') || selectedReports.includes('full-report')) {
          csvContent += 'Distribusi Usia\n';
          csvContent += 'Kelompok Usia,Jumlah,Persentase\n';
          
          reportData.ageData.forEach((item: { group: string; count: number }) => {
            csvContent += `${item.group},${item.count},${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          });
        }
        
        // Convert CSV data to excel-compatible format
        const excelCSV = csvContent.replace('data:text/csv;charset=utf-8,', '');
        
        downloadFile(excelCSV, `${fileName}.csv`, 'text/csv');
        break;
      }
        
      case 'pdf': {
        // Buat HTML untuk konversi ke PDF
        // Dalam aplikasi nyata, gunakan jsPDF atau PDF.js
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Laporan Pegawai BSKDN</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
              body { 
                font-family: 'Roboto', Arial, sans-serif; 
                margin: 0; 
                padding: 0;
                color: #333;
                background-color: #fff;
              }
              .container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 30px;
                background-color: #fff;
              }
              .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 20px;
                border-bottom: 2px solid #1e40af;
                margin-bottom: 30px;
              }
              .logo-container {
                display: flex;
                align-items: center;
              }
              .logo-icon {
                width: 50px;
                height: 50px;
                background-color: #1e40af;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 20px;
                margin-right: 15px;
              }
              .title-container {
                display: flex;
                flex-direction: column;
              }
              .title {
                font-size: 24px;
                margin: 0;
                color: #1e40af;
              }
              .subtitle {
                font-size: 16px;
                color: #6b7280;
                margin: 5px 0 0;
              }
              h1 { color: #1e40af; }
              h2 { color: #1e40af; margin-top: 20px; }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin-top: 10px; 
                margin-bottom: 30px;
              }
              th { 
                background-color: #1e40af; 
                color: white;
                padding: 8px;
                text-align: left;
              }
              td { 
                padding: 8px; 
                border-bottom: 1px solid #e5e7eb;
              }
              .footer {
                margin-top: 30px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
                font-size: 12px;
                color: #6b7280;
              }
              .highlight {
                font-weight: 500;
                color: #1e40af;
              }
              .stat-card {
                background-color: #f3f4f6;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 25px;
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
              .stat-info {
                flex: 1;
              }
              .stat-label {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 8px;
              }
              .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #1e40af;
              }
              .percentage-bar-container {
                background-color: #e5e7eb;
                height: 6px;
                width: 100%;
                border-radius: 3px;
                margin-top: 8px;
              }
              .percentage-bar {
                height: 100%;
                border-radius: 3px;
                background-color: #3b82f6;
              }
            </style>
          </head>
          <body>
            <div class="container">
            <div class="header">
                <div class="logo-container">
                  <div class="logo-icon">BSKDN</div>
                  <div class="title-container">
                    <h1 class="title">Laporan Demografi Pegawai BSKDN</h1>
                    <p class="subtitle">Dashboard Pegawai Badan Strategi Kebijakan Dalam Negeri</p>
            </div>
                </div>
                <p>Tanggal: ${new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</p>
              </div>

              <div class="stat-card">
                <div class="stat-info">
                  <div class="stat-label">Total Pegawai</div>
                  <div class="stat-value">${reportData.stats.totalEmployees}</div>
                </div>
                <div class="stat-info">
                  <div class="stat-label">Pegawai Baru (30 hari terakhir)</div>
                  <div class="stat-value">${reportData.stats.newEmployees}</div>
                </div>
                <div class="stat-info">
                  <div class="stat-label">Unit Kerja</div>
                  <div class="stat-value">${reportData.stats.totalDepartments}</div>
                </div>
              </div>
        `;
        
        // Gender distribution
        if (selectedReports.includes('gender-distribution') || selectedReports.includes('full-report')) {
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
                <td>${reportData.genderData.male}</td>
                <td>
                  <div>${((reportData.genderData.male / reportData.stats.totalEmployees) * 100).toFixed(2)}%</div>
                  <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${((reportData.genderData.male / reportData.stats.totalEmployees) * 100).toFixed(2)}%"></div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Perempuan</td>
                <td>${reportData.genderData.female}</td>
                <td>
                  <div>${((reportData.genderData.female / reportData.stats.totalEmployees) * 100).toFixed(2)}%</div>
                  <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${((reportData.genderData.female / reportData.stats.totalEmployees) * 100).toFixed(2)}%"></div>
                  </div>
                </td>
              </tr>
            </table>
          `;
        }
        
        // Employee types
        if (selectedReports.includes('employee-count') || selectedReports.includes('full-report')) {
          htmlContent += `
            <h2>Distribusi Jenis Pegawai</h2>
            <table>
              <tr>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
              <tr>
                <td>PNS</td>
                <td>${reportData.employeeTypesData.pns}</td>
                <td>
                  <div>${((reportData.employeeTypesData.pns / reportData.stats.totalEmployees) * 100).toFixed(2)}%</div>
                  <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${((reportData.employeeTypesData.pns / reportData.stats.totalEmployees) * 100).toFixed(2)}%"></div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>P3K</td>
                <td>${reportData.employeeTypesData.p3k}</td>
                <td>
                  <div>${((reportData.employeeTypesData.p3k / reportData.stats.totalEmployees) * 100).toFixed(2)}%</div>
                  <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${((reportData.employeeTypesData.p3k / reportData.stats.totalEmployees) * 100).toFixed(2)}%"></div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Non BSKDN</td>
                <td>${reportData.employeeTypesData.nonAsn}</td>
                <td>
                  <div>${((reportData.employeeTypesData.nonAsn / reportData.stats.totalEmployees) * 100).toFixed(2)}%</div>
                  <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${((reportData.employeeTypesData.nonAsn / reportData.stats.totalEmployees) * 100).toFixed(2)}%"></div>
                  </div>
                </td>
              </tr>
            </table>
          `;
        }
        
        // Work unit distribution
        if (selectedReports.includes('unit-distribution') || selectedReports.includes('full-report')) {
          htmlContent += `
            <h2>Distribusi Unit Kerja</h2>
            <table>
              <tr>
                <th>Unit Kerja</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
          `;
          
          reportData.workUnitData.forEach((item: { name: string; count: number }) => {
            htmlContent += `
              <tr>
                <td>${item.name}</td>
                <td>${item.count}</td>
                <td>
                  <div>${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%</div>
                  <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%"></div>
                  </div>
                </td>
              </tr>
            `;
          });
          
          htmlContent += `</table>`;
        }
        
        // Rank distribution
        if (selectedReports.includes('rank-distribution') || selectedReports.includes('full-report')) {
          htmlContent += `
            <h2>Distribusi Golongan</h2>
            <table>
              <tr>
                <th>Golongan</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
          `;
          
          reportData.rankData.forEach((item: { golongan: string; count: number }) => {
            htmlContent += `
              <tr>
                <td>${formatGolongan(item.golongan)}</td>
                <td>${item.count}</td>
                <td>
                  <div>${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%</div>
                  <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%"></div>
                  </div>
                </td>
              </tr>
            `;
          });
          
          htmlContent += `</table>`;
        }
        
        // Education distribution
        if (selectedReports.includes('education-distribution') || selectedReports.includes('full-report')) {
          htmlContent += `
            <h2>Distribusi Tingkat Pendidikan</h2>
            <table>
              <tr>
                <th>Tingkat Pendidikan</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
          `;
          
          reportData.educationData.forEach((item: { level: string; count: number }) => {
            htmlContent += `
              <tr>
                <td>${formatEducationLevel(item.level)}</td>
                <td>${item.count}</td>
                <td>
                  <div>${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%</div>
                  <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%"></div>
                  </div>
                </td>
              </tr>
            `;
          });
          
          htmlContent += `</table>`;
        }
        
        // Age distribution
        if (selectedReports.includes('age-distribution') || selectedReports.includes('full-report')) {
        htmlContent += `
            <h2>Distribusi Usia</h2>
            <table>
              <tr>
                <th>Kelompok Usia</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
          `;
          
          reportData.ageData.forEach((item: { group: string; count: number }) => {
            htmlContent += `
              <tr>
                <td>${item.group}</td>
                <td>${item.count}</td>
                <td>
                  <div>${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%</div>
                  <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%"></div>
                  </div>
                </td>
              </tr>
            `;
          });
          
          htmlContent += `</table>`;
        }
        
        htmlContent += `
              <div class="footer">
                <div class="footer-left">
                  <p>Laporan ini dibuat secara otomatis dari <span class="highlight">Sistem Dashboard Pegawai BSKDN</span> pada ${new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}.</p>
                </div>
                <div class="footer-right">
                  <p>Untuk informasi lebih lanjut, silakan hubungi <span class="highlight">admin@bskdn.go.id</span></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;
        
        // Gunakan print ke PDF untuk mengunduh
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          // Tunggu sebentar sebelum mencetak
          setTimeout(() => {
            printWindow.print();
            // Tutup setelah beberapa detik
            setTimeout(() => printWindow.close(), 1000);
          }, 500);
        } else {
          alert('Silakan aktifkan popup untuk mengunduh PDF');
        }
        break;
      }
      
      case 'excel': {
        // Buat data Excel menggunakan format CSV
        let excelData = `Laporan Demografi Pegawai BSKDN - ${timestamp}\n`;
        excelData += `Total Pegawai: ${reportData.stats.totalEmployees}\n\n`;
        
        // Gender distribution
        if (selectedReports.includes('gender-distribution') || selectedReports.includes('full-report')) {
          excelData += 'Distribusi Gender\n';
          excelData += 'Gender,Jumlah,Persentase\n';
          excelData += `Laki-laki,${reportData.genderData.male},${((reportData.genderData.male / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          excelData += `Perempuan,${reportData.genderData.female},${((reportData.genderData.female / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n\n`;
        }
        
        // Employee types
        if (selectedReports.includes('employee-count') || selectedReports.includes('full-report')) {
          excelData += 'Distribusi Jenis Pegawai\n';
          excelData += 'Jenis,Jumlah,Persentase\n';
          excelData += `PNS,${reportData.employeeTypesData.pns},${((reportData.employeeTypesData.pns / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          excelData += `P3K,${reportData.employeeTypesData.p3k},${((reportData.employeeTypesData.p3k / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          excelData += `Non BSKDN,${reportData.employeeTypesData.nonAsn},${((reportData.employeeTypesData.nonAsn / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n\n`;
        }
        
        // Work unit distribution
        if (selectedReports.includes('unit-distribution') || selectedReports.includes('full-report')) {
          excelData += 'Distribusi Unit Kerja\n';
          excelData += 'Unit Kerja,Jumlah,Persentase\n';
          
          reportData.workUnitData.forEach((item: { name: string; count: number }) => {
            excelData += `${item.name},${item.count},${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          });
          
          excelData += '\n';
        }
        
        // Rank distribution
        if (selectedReports.includes('rank-distribution') || selectedReports.includes('full-report')) {
          excelData += 'Distribusi Golongan\n';
          excelData += 'Golongan,Jumlah,Persentase\n';
          
          reportData.rankData.forEach((item: { golongan: string; count: number }) => {
            excelData += `${formatGolongan(item.golongan)},${item.count},${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          });
          
          excelData += '\n';
        }
        
        // Education distribution
        if (selectedReports.includes('education-distribution') || selectedReports.includes('full-report')) {
          excelData += 'Distribusi Tingkat Pendidikan\n';
          excelData += 'Tingkat Pendidikan,Jumlah,Persentase\n';
          
          reportData.educationData.forEach((item: { level: string; count: number }) => {
            excelData += `${formatEducationLevel(item.level)},${item.count},${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          });
          
          excelData += '\n';
        }
        
        // Age distribution
        if (selectedReports.includes('age-distribution') || selectedReports.includes('full-report')) {
          excelData += 'Distribusi Usia\n';
          excelData += 'Kelompok Usia,Jumlah,Persentase\n';
          
          reportData.ageData.forEach((item: { group: string; count: number }) => {
            excelData += `${item.group},${item.count},${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%\n`;
          });
        }
        
        // Gunakan Blob API untuk membuat file Excel
        const blob = new Blob(["\ufeff" + excelData], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' 
        });
        
        downloadBlob(blob, `${fileName}.xlsx`);
        break;
      }
        
      case 'docx': {
        // Create Word document content with proper structure
        let docContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Laporan Pegawai BSKDN</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px;
                color: #333;
                background-color: #fff;
              }
              .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 20px;
                border-bottom: 2px solid #1e40af;
                margin-bottom: 30px;
              }
              .title {
                font-size: 24px;
                margin: 0;
                color: #1e40af;
                font-weight: bold;
              }
              .subtitle {
                font-size: 16px;
                color: #6b7280;
                margin: 5px 0 0;
              }
              h1 { color: #1e40af; font-size: 24px; margin-top: 20px; }
              h2 { color: #1e40af; font-size: 18px; margin-top: 20px; }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 15px 0 30px;
              }
              th { 
                background-color: #1e40af; 
                color: white;
                padding: 8px;
                text-align: left;
                border: 1px solid #1e40af;
              }
              td { 
                padding: 8px; 
                border: 1px solid #e5e7eb;
              }
              .footer {
                margin-top: 30px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
                font-size: 12px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="title">Laporan Demografi Pegawai BSKDN</h1>
                <p class="subtitle">Dashboard Pegawai Badan Strategi Kebijakan Dalam Negeri</p>
            </div>
              <p>Tanggal: ${new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</p>
            </div>

            <div>
              <h2>Informasi Umum</h2>
              <table>
                <tr>
                  <th>Total Pegawai</th>
                  <th>Pegawai Baru (30 hari terakhir)</th>
                  <th>Unit Kerja</th>
                </tr>
                <tr>
                  <td>${reportData.stats.totalEmployees}</td>
                  <td>${reportData.stats.newEmployees}</td>
                  <td>${reportData.stats.totalDepartments}</td>
                </tr>
              </table>
        `;
        
        // Gender distribution
        if (selectedReports.includes('gender-distribution') || selectedReports.includes('full-report')) {
          docContent += `
            <h2>Distribusi Gender</h2>
            <table>
              <tr>
                <th>Gender</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
              <tr>
                <td>Laki-laki</td>
                <td>${reportData.genderData.male}</td>
                <td>${((reportData.genderData.male / reportData.stats.totalEmployees) * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>Perempuan</td>
                <td>${reportData.genderData.female}</td>
                <td>${((reportData.genderData.female / reportData.stats.totalEmployees) * 100).toFixed(2)}%</td>
              </tr>
            </table>
          `;
        }
        
        // Employee types
        if (selectedReports.includes('employee-count') || selectedReports.includes('full-report')) {
          docContent += `
            <h2>Distribusi Jenis Pegawai</h2>
            <table>
              <tr>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
              <tr>
                <td>PNS</td>
                <td>${reportData.employeeTypesData.pns}</td>
                <td>${((reportData.employeeTypesData.pns / reportData.stats.totalEmployees) * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>P3K</td>
                <td>${reportData.employeeTypesData.p3k}</td>
                <td>${((reportData.employeeTypesData.p3k / reportData.stats.totalEmployees) * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>Non BSKDN</td>
                <td>${reportData.employeeTypesData.nonAsn}</td>
                <td>${((reportData.employeeTypesData.nonAsn / reportData.stats.totalEmployees) * 100).toFixed(2)}%</td>
              </tr>
            </table>
          `;
        }
        
        // Work unit distribution
        if (selectedReports.includes('unit-distribution') || selectedReports.includes('full-report')) {
          docContent += `
            <h2>Distribusi Unit Kerja</h2>
            <table>
              <tr>
                <th>Unit Kerja</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
          `;
          
          reportData.workUnitData.forEach((item: { name: string; count: number }) => {
            docContent += `
              <tr>
                <td>${item.name}</td>
                <td>${item.count}</td>
                <td>${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%</td>
              </tr>
            `;
          });
          
          docContent += `</table>`;
        }
        
        // Rank distribution
        if (selectedReports.includes('rank-distribution') || selectedReports.includes('full-report')) {
          docContent += `
            <h2>Distribusi Golongan</h2>
            <table>
              <tr>
                <th>Golongan</th>
                <th>Jumlah</th>
                <th>Persentase</th>
              </tr>
          `;
          
          reportData.rankData.forEach((item: { golongan: string; count: number }) => {
            docContent += `
              <tr>
                <td>${formatGolongan(item.golongan)}</td>
                <td>${item.count}</td>
                <td>${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%</td>
              </tr>
            `;
          });
          
          docContent += `</table>`;
        }
        
        // Education distribution
        if (selectedReports.includes('education-distribution') || selectedReports.includes('full-report')) {
          docContent += `
            <h2>Distribusi Tingkat Pendidikan</h2>
                <table>
                  <tr>
                <th>Tingkat Pendidikan</th>
                    <th>Jumlah</th>
                    <th>Persentase</th>
                  </tr>
          `;
          
          reportData.educationData.forEach((item: { level: string; count: number }) => {
            docContent += `
              <tr>
                <td>${formatEducationLevel(item.level)}</td>
                <td>${item.count}</td>
                <td>${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%</td>
                  </tr>
            `;
          });
          
          docContent += `</table>`;
        }
        
        // Age distribution
        if (selectedReports.includes('age-distribution') || selectedReports.includes('full-report')) {
          docContent += `
            <h2>Distribusi Usia</h2>
            <table>
              <tr>
                <th>Kelompok Usia</th>
                <th>Jumlah</th>
                <th>Persentase</th>
                  </tr>
          `;
          
          reportData.ageData.forEach((item: { group: string; count: number }) => {
            docContent += `
              <tr>
                <td>${item.group}</td>
                <td>${item.count}</td>
                <td>${((item.count / reportData.stats.totalEmployees) * 100).toFixed(2)}%</td>
              </tr>
            `;
          });
          
          docContent += `</table>`;
        }
        
        docContent += `
            <div class="footer">
              <p>Laporan ini dibuat secara otomatis dari Sistem Dashboard Pegawai BSKDN pada ${new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}.</p>
              <p>Untuk informasi lebih lanjut, silakan hubungi admin@bskdn.go.id</p>
            </div>
          </body>
          </html>
        `;
        
        // For Word documents in browser, we'll create a downloadable HTML file
        // that can be opened in Word (Word will handle the conversion)
        const blob = new Blob([docContent], { type: 'text/html' });
        downloadBlob(blob, `${fileName}.doc`);
        break;
      }
        
      case 'pptx': {
        const pptx = new PptxGenJS();
        const slide = pptx.addSlide();
        // Judul slide
        slide.addText('Laporan Demografi Pegawai BSKDN', { x: 0.5, y: 0.3, fontSize: 20, bold: true });
        slide.addText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { x: 0.5, y: 0.8, fontSize: 12 });
        // Pilih data tabel sesuai laporan yang dipilih
        let tableRows = [];
        let tableHeaders = [];
        let tableTitle = '';
        if (selectedReports.includes('gender-distribution')) {
          tableTitle = 'Distribusi Gender';
          tableHeaders = ['Gender', 'Jumlah', 'Persentase'];
          tableRows = [
            ['Laki-laki', reportData.genderData.male, ((reportData.genderData.male / reportData.stats.totalEmployees) * 100).toFixed(2) + '%'],
            ['Perempuan', reportData.genderData.female, ((reportData.genderData.female / reportData.stats.totalEmployees) * 100).toFixed(2) + '%'],
          ];
        } else if (selectedReports.includes('rank-distribution')) {
          tableTitle = 'Distribusi Golongan';
          tableHeaders = ['Golongan', 'Jumlah', 'Persentase'];
          tableRows = reportData.rankData.map((item: { golongan: string; count: number }) => [
            formatGolongan(item.golongan),
            item.count,
            ((item.count / reportData.stats.totalEmployees) * 100).toFixed(2) + '%',
          ]);
        } else if (selectedReports.includes('education-distribution')) {
          tableTitle = 'Distribusi Tingkat Pendidikan';
          tableHeaders = ['Tingkat Pendidikan', 'Jumlah', 'Persentase'];
          tableRows = reportData.educationData.map((item: { level: string; count: number }) => [
            formatEducationLevel(item.level),
            item.count,
            ((item.count / reportData.stats.totalEmployees) * 100).toFixed(2) + '%',
          ]);
        } else if (selectedReports.includes('department-distribution')) {
          tableTitle = 'Distribusi Unit Kerja';
          tableHeaders = ['Unit Kerja', 'Jumlah', 'Persentase'];
          tableRows = reportData.workUnitData.map((item: { name: string; count: number }) => [
            item.name,
            item.count,
            ((item.count / reportData.stats.totalEmployees) * 100).toFixed(2) + '%',
          ]);
        } else if (selectedReports.includes('age-distribution')) {
          tableTitle = 'Distribusi Usia';
          tableHeaders = ['Kelompok Usia', 'Jumlah', 'Persentase'];
          tableRows = reportData.ageData.map((item: { group: string; count: number }) => [
            item.group,
            item.count,
            ((item.count / reportData.stats.totalEmployees) * 100).toFixed(2) + '%',
          ]);
        } else {
          tableTitle = 'Statistik Pegawai';
          tableHeaders = ['Total Pegawai'];
          tableRows = [[reportData.stats.totalEmployees]];
        }
        // Tambahkan judul tabel
        slide.addText(tableTitle, { x: 0.5, y: 1.2, fontSize: 16, bold: true });
        // Tambahkan tabel ke slide
        slide.addTable([
          tableHeaders,
          ...tableRows
        ], { x: 0.5, y: 1.7, w: 8, fontSize: 12 });
        await pptx.writeFile({ fileName: fileName + '.pptx' });
        break;
      }
        
      // ... rest of the function
    }
  };

  // Refs untuk chart dashboard (akan digunakan untuk fitur export chart)
  /* const genderChartRef = useRef<HTMLDivElement>(null);
  const rankChartRef = useRef<HTMLDivElement>(null);
  const educationChartRef = useRef<HTMLDivElement>(null);
  const unitChartRef = useRef<HTMLDivElement>(null);
  const ageChartRef = useRef<HTMLDivElement>(null); */

  return (
    <div className="flex">
      <Sidebar activeItem="reports" onLogout={onLogout} />
      
      <div className={`flex-1 transition-all duration-400 ease-out transform-gpu ${expanded ? 'ml-[240px]' : 'ml-[88px] lg:ml-[104px]'} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
        <Header title={t('reports_title')} onLogout={onLogout} />
        
        <div className="w-full px-4 sm:px-6 md:px-10 pt-24 pb-8">
          <div className="mb-6 mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">
              {t('available_reports')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('reports_description')}</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Reports selection and download section */}
            <div className="xl:col-span-2 space-y-6">
              {/* Reports selector */}
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('select_report_type')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('combine_reports')}</p>
                  </div>
                  
                  {/* Report dropdown */}
                  <div className="relative mt-4 md:mt-0" ref={reportDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                      className="flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <span>{t('select_report')}</span>
                      <ChevronDown size={16} className={`ml-2 transition-transform duration-200 ${isReportDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {/* Report Selection Dropdown */}
                    {isReportDropdownOpen && (
                      <div
                        ref={reportDropdownRef}
                        className="absolute z-10 mt-1 right-0 left-auto w-full min-w-[220px] bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                      >
                        {availableReports.map((report) => (
                          <button 
                            key={report.id}
                            onClick={() => {
                              toggleReportSelection(report.id); 
                              setIsReportDropdownOpen(false);
                            }}
                            className={`flex items-start w-full px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedReports.includes(report.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          >
                            <div className="flex-shrink-0 mr-3 mt-0.5">
                              {report.icon}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-800 dark:text-white">{report.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{report.description}</p>
                            </div>
                            {selectedReports.includes(report.id) && (
                              <div className="ml-auto">
                                <Check size={16} className="text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Selected reports */}
                <div className="space-y-3">
                  {selectedReports.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText size={40} className="mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">{t('report_info')}</p>
                    </div>
                  ) : (
                    selectedReports.map((reportId: string) => {
                      const report = getReportInfo(reportId);
                      return report ? (
                        <div key={reportId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-md p-3">
                          <div className="flex items-center">
                            <div className="mr-3">
                              {report.icon}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{report.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{report.description}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeReport(reportId)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>
              
              {/* Format selector */}
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('file_format')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('various_formats')}</p>
                  </div>
                  
                  {/* Format dropdown */}
                  <div className="relative mt-4 md:mt-0" ref={formatDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                      className="flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <span>{selectedFormat === 'pdf' && t('select_format_pdf')}
                            {selectedFormat === 'excel' && (t('select_format_xlsx') || 'Excel')}
                            {selectedFormat === 'docx' && t('select_format_docx')}
                            {selectedFormat === 'pptx' && ('PowerPoint')}
                            {!['pdf','excel','docx','pptx'].includes(selectedFormat) && t('select_format')}</span>
                      <ChevronDown size={16} className={`ml-2 transition-transform duration-200 ${isFormatDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {/* Format Selection Dropdown */}
                    {isFormatDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full min-w-[180px] bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {formatOptions.map((format) => (
                          <button 
                            key={format.id}
                            onClick={() => {
                              setSelectedFormat(format.id);
                              setIsFormatDropdownOpen(false);
                            }}
                            className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedFormat === format.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          >
                            {format.icon}
                            <span className="ml-2">{format.name}</span>
                            {selectedFormat === format.id && (
                              <Check size={16} className="ml-auto text-blue-600 dark:text-blue-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Image format hint */}
                {(['jpg', 'png'].includes(selectedFormat)) && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-md">
                    <div className="flex items-start">
                      <Info size={16} className="text-yellow-700 dark:text-yellow-500 mr-2 mt-0.5" />
                      <p className="text-xs text-yellow-700 dark:text-yellow-500">
                        {t('image_formats')}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Download button */}
                <button
                  onClick={handleDownload}
                  disabled={selectedReports.length === 0 || isLoading}
                  className={`flex items-center justify-center w-full py-3 px-4 rounded-md font-medium ${selectedReports.length === 0 || isLoading ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white'} transition-colors`}
                >
                  <Download size={16} className="mr-2" />
                  {t('download_report_btn')}
                </button>
              </div>
            </div>
            
            {/* Information panel */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl h-fit p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('report_info')}</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('last_updated')}: {new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                    <Check size={14} className="text-green-500 mr-1.5" />
                    {t('realtime_data')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                    <Check size={14} className="text-green-500 mr-1.5" />
                    {t('various_formats')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Check size={14} className="text-green-500 mr-1.5" />
                    {t('combine_reports')}
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex flex-col items-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="mt-3 text-sm text-gray-600 dark:text-gray-400">{t('loading_data')}</span>
                  </div>
                ) : (
                  <div>
                    {/* Summary stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('total_employees')}</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white mt-1">
                          {dashboardData?.stats.totalEmployees || 0}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t('total_departments')}</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white mt-1">
                          {Object.keys(dashboardData?.workUnitCounts || {}).length || 0}
                        </div>
                      </div>
                    </div>
                  </div>  
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;