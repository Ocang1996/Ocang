import { useState, useEffect, useRef } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { Search, Download, UserPlus, ChevronLeft, ChevronRight, X, Eye, Edit, FileText, FileSpreadsheet, ChevronDown, List, Grid, RefreshCw, Check } from 'lucide-react';
import AddEmployeeForm from './AddEmployeeForm';
import EmployeeDetail from './EmployeeDetail';
import EditEmployeeForm from './EditEmployeeForm';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { useEmployees } from '../../lib/EmployeeContext';
import { useSidebar } from '../../lib/SidebarContext';
import { isAdmin } from '../../lib/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import Employee interface from EmployeeContext
import { Employee } from '../../lib/EmployeeContext';

interface EmployeeListProps {
  onLogout: () => void;
}

// CSS for responsivitas diterapkan langsung di elemen style pada render

const EmployeeList = ({ onLogout }: EmployeeListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const itemsPerPage = 7;
  
  // Get theme and translations
  const { language } = useTheme();
  const { t } = useTranslation();
  const { expanded } = useSidebar(); // Get sidebar expanded state

  // Use our employee context for real-time data
  const { 
    employees, 
    selectedEmployee, 
    setSelectedEmployee, 
    loading, 
    error, 
    updateEmployeeData, 
    addEmployee,
    refreshData,
    syncStatus
  } = useEmployees();

  // Force re-render when language changes
  useEffect(() => {
    // This will re-render the component when language changes
  }, [language]);
  
  // Menghapus useEffect untuk sidebar collapse yang tidak diperlukan

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.nip.includes(searchQuery) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
      employee.workUnit === selectedDepartment;
    
    const matchesStatus = selectedStatus === 'all' || 
      employee.status.toLowerCase() === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Paginate
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Get unique departments for filter
  const departments = ['all', ...Array.from(new Set(employees.map(e => e.workUnit)))];
  
  // Get unique statuses for filter
  const statuses = ['all', ...Array.from(new Set(employees.map(e => e.status)))];

  // Add state for export menu
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Add click outside handler for export menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Tambahkan helper untuk masa kerja dan sisa pensiun
  const getBUP = (jobType: string | undefined): number => {
    switch (jobType) {
      case 'pimpinan_tinggi_madya':
      case 'pimpinan_tinggi_pratama':
      case 'fungsional_ahli_madya':
        return 60;
      case 'fungsional_ahli_utama':
        return 65;
      case 'fungsional_ahli_pertama':
      case 'fungsional_ahli_muda':
      case 'administrasi':
      default:
        return 58;
    }
  };
  const calculateServicePeriod = (startDate: string | undefined): string => {
    if (!startDate) return '-';
    const start = new Date(startDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} tahun ${months} bulan ${days} hari`;
  };
  const calculateRemainingService = (birthDate: string | undefined, jobType: string | undefined): string => {
    if (!birthDate || !jobType) return '-';
    const birth = new Date(birthDate);
    const now = new Date();
    const bup = getBUP(jobType);
    let years = bup - (now.getFullYear() - birth.getFullYear());
    let months = birth.getMonth() - now.getMonth();
    let days = birth.getDate() - now.getDate();
    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return '0 tahun 0 bulan 0 hari';
    return `${years} tahun ${months} bulan ${days} hari`;
  };
  const formatDateIndo = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    let date: Date;
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Helper untuk label jenis jabatan
  const formatJobType = (jobType?: string) => {
    switch (jobType) {
      case 'pimpinan_tinggi_madya': return 'Pimpinan Tinggi Ahli Madya';
      case 'pimpinan_tinggi_pratama': return 'Pimpinan Tinggi Pratama';
      case 'fungsional_ahli_utama': return 'Fungsional Ahli Utama';
      case 'fungsional_ahli_madya': return 'Fungsional Ahli Madya';
      case 'fungsional_ahli_pertama': return 'Fungsional Ahli Pertama';
      case 'fungsional_ahli_muda': return 'Fungsional Ahli Muda';
      case 'administrasi': return 'Administrasi';
      default: return jobType || '-';
    }
  };

  // Function to export employee data to CSV
  const exportToCSV = () => {
    setExportLoading(true);
    
    // Use all employees data instead of just filtered data for complete export
    const dataToExport = employees;
    
    if (dataToExport.length === 0) {
      alert(t('no_employees_data_for_export'));
      setExportLoading(false);
      setShowExportMenu(false);
      return;
    }
    
    // Define comprehensive CSV headers
    const headers = [
      t('employee_name'), 
      t('employee_id'), 
      'Gender',
      'Birth Date',
      'Employee Type',
      t('employee_position'), 
      t('employee_department'), 
      t('employee_rank'),
      'Class',
      t('employee_status'),
      'Education Level',
      'Education Major',
      'Education Institution',
      'Graduation Year',
      'Email',
      'Phone Number',
      'Address',
      'Notes',
      'Job Type',
      'Appointment Date',
      'Join Date',
      'Service Period',
      'Remaining Service Period',
      'Created Date',
      'Updated Date'
    ];
    
    // Convert employee data to CSV rows with all available fields
    const csvRows = [
      headers.join(','), // Add headers as first row
      ...dataToExport.map(emp => {
        const employee = emp as Employee;
        return [
          `"${employee.name || ''}"`,
          `"${employee.nip || ''}"`,
          `"${employee.gender || ''}"`,
          `"${formatDateIndo(employee.birthDate) || ''}"`,
          `"${employee.employeeType || ''}"`,
          `"${employee.position || ''}"`,
          `"${employee.workUnit || ''}"`,
          `"${employee.rank || ''}"`,
          `"${employee.class || ''}"`,
          `"${employee.status || ''}"`,
          `"${employee.educationLevel || ''}"`,
          `"${employee.educationMajor || ''}"`,
          `"${employee.educationInstitution || ''}"`,
          `"${employee.graduationYear || ''}"`,
          `"${employee.email || ''}"`,
          `"${employee.phoneNumber || ''}"`,
          `"${employee.address || ''}"`,
          `"${employee.notes || ''}"`,
          `"${formatJobType(employee.jobType) || ''}"`,
          `"${formatDateIndo(employee.appointmentDate) || ''}"`,
          `"${formatDateIndo(employee.joinDate) || ''}"`,
          `"${calculateServicePeriod(employee.appointmentDate || employee.joinDate)}"`,
          `"${calculateRemainingService(employee.birthDate, employee.jobType)}"`,
          `"${employee.createdAt || ''}"`,
          `"${employee.updatedAt || ''}"`,
        ].join(',');
      })
    ];
    
    // Combine all rows into a CSV string
    const csvString = csvRows.join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set download attributes and trigger download
    link.setAttribute('href', url);
    link.setAttribute('download', `employee-data-complete-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportLoading(false);
    setShowExportMenu(false);
  };

  // Function to export employee data to Excel
  const exportToExcel = () => {
    setExportLoading(true);
    
    // Use all employees data instead of just filtered data
    const dataToExport = employees;
    
    if (dataToExport.length === 0) {
      alert(t('no_employees_data_for_export'));
      setExportLoading(false);
      setShowExportMenu(false);
      return;
    }
    
    // Define comprehensive Excel headers
    const headers = [
      t('employee_name'), 
      t('employee_id'), 
      'Gender',
      'Birth Date',
      'Employee Type',
      t('employee_position'), 
      t('employee_department'), 
      t('employee_rank'),
      'Class',
      t('employee_status'),
      'Education Level',
      'Education Major',
      'Education Institution',
      'Graduation Year',
      'Email',
      'Phone Number',
      'Address',
      'Notes',
      'Job Type',
      'Appointment Date',
      'Join Date',
      'Service Period',
      'Remaining Service Period',
      'Created Date',
      'Updated Date'
    ];
    
    // Convert employee data to Excel rows with all available fields
    const csvRows = [
      headers.join('\t'), // Use tabs for Excel compatibility
      ...dataToExport.map(emp => {
        const employee = emp as Employee;
        return [
          employee.name || '',
          employee.nip || '',
          employee.gender || '',
          employee.birthDate || '',
          employee.employeeType || '',
          employee.position || '',
          employee.workUnit || '',
          employee.rank || '',
          employee.class || '',
          employee.status || '',
          employee.educationLevel || '',
          employee.educationMajor || '',
          employee.educationInstitution || '',
          employee.graduationYear || '',
          employee.email || '',
          employee.phoneNumber || '',
          employee.address || '',
          employee.notes || '',
          formatJobType(employee.jobType),
          employee.appointmentDate || '',
          employee.joinDate || '',
          calculateServicePeriod(employee.appointmentDate || employee.joinDate),
          calculateRemainingService(employee.birthDate, employee.jobType),
          employee.createdAt || '',
          employee.updatedAt || ''
        ].join('\t');
      })
    ];
    
    // Combine all rows into a CSV string
    const csvString = csvRows.join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvString], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set download attributes and trigger download
    link.setAttribute('href', url);
    link.setAttribute('download', `employee-data-complete-${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportLoading(false);
    setShowExportMenu(false);
  };

  // Function to export employee data to PDF
  const exportToPDF = () => {
    setExportLoading(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'legal' });
      doc.setFontSize(12);
      const pageWidth = doc.internal.pageSize.getWidth();
      const title = 'Daftar Lengkap Pegawai';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, 32);
      const headers = [[
        'Nama',
        'NIP',
        'Jabatan',
        'Pangkat/Golongan',
        'Unit Kerja',
        'Jenis Kepegawaian',
        'Umur',
        'Masa Kerja',
        'Sisa Masa Kerja',
        'Jenis Kelamin',
      ]];
      const data = employees.map(emp => [
        String(emp.name || '-'),
        String(emp.nip || '-'),
        String(emp.position || '-'),
        String(emp.rank || '-'),
        String(emp.workUnit || '-'),
        String(emp.employeeType || '-'),
        (() => {
          if (!emp.birthDate) return '-';
          const birth = new Date(emp.birthDate);
          const now = new Date();
          let years = now.getFullYear() - birth.getFullYear();
          let months = now.getMonth() - birth.getMonth();
          let days = now.getDate() - birth.getDate();
          if (days < 0) { months--; days += 30; }
          if (months < 0) { years--; months += 12; }
          return `${years} tahun ${months} bulan`;
        })(),
        (() => {
          const start = emp.appointmentDate || emp.joinDate;
          if (!start) return '-';
          const startDate = new Date(start);
          const now = new Date();
          let years = now.getFullYear() - startDate.getFullYear();
          let months = now.getMonth() - startDate.getMonth();
          let days = now.getDate() - startDate.getDate();
          if (days < 0) { months--; days += 30; }
          if (months < 0) { years--; months += 12; }
          return `${years} tahun ${months} bulan`;
        })(),
        (() => {
          if (!emp.birthDate || !emp.jobType) return '-';
          const getBUP = (jobType: string): number => {
            switch (jobType) {
              case 'pimpinan_tinggi_madya':
              case 'pimpinan_tinggi_pratama':
              case 'fungsional_ahli_madya': return 60;
              case 'fungsional_ahli_utama': return 65;
              case 'fungsional_ahli_pertama':
              case 'fungsional_ahli_muda':
              case 'administrasi':
              default: return 58;
            }
          };
          const birth = new Date(emp.birthDate);
          const now = new Date();
          const bup = getBUP(emp.jobType);
          let years = bup - (now.getFullYear() - birth.getFullYear());
          let months = birth.getMonth() - now.getMonth();
          let days = birth.getDate() - now.getDate();
          if (days < 0) { months--; days += 30; }
          if (months < 0) { years--; months += 12; }
          if (years < 0) return '0 tahun 0 bulan';
          return `${years} tahun ${months} bulan`;
        })(),
        emp.gender === 'male' ? 'Laki-laki' : emp.gender === 'female' ? 'Perempuan' : '-',
      ]);
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 48,
        styles: { fontSize: 7, halign: 'center' },
        headStyles: { fillColor: [22, 160, 133], halign: 'center' },
        bodyStyles: { halign: 'center' },
        margin: { left: 40, right: 40 },
        tableWidth: 'wrap',
      });
      doc.save(`Daftar_Pegawai_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      alert('Gagal mengekspor PDF.');
      console.error(err);
    } finally {
      setExportLoading(false);
      setShowExportMenu(false);
    }
  };

  // Perbaiki ekspor Word agar sama dengan PDF dan rata tengah
  const exportToWord = () => {
    setExportLoading(true);
    const dataToExport = employees;
    if (dataToExport.length === 0) {
      alert('Tidak ada data pegawai untuk diekspor!');
      setExportLoading(false);
      setShowExportMenu(false);
      return;
    }
    const headers = [
      'Nama',
      'NIP',
      'Jabatan',
      'Pangkat/Golongan',
      'Unit Kerja',
      'Jenis Kepegawaian',
      'Umur',
      'Masa Kerja',
      'Sisa Masa Kerja',
      'Jenis Kelamin',
    ];
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Daftar Lengkap Pegawai</title>
        <style>
          body { font-family: 'Calibri', sans-serif; margin: 2cm; }
          h1 { color: #2563eb; text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center; }
          th { background-color: #16a085; color: #fff; text-align: center; padding: 8px; border: 1px solid #e5e7eb; }
          td { padding: 8px; border: 1px solid #e5e7eb; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Daftar Lengkap Pegawai</h1>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;
    dataToExport.forEach(emp => {
      htmlContent += `
        <tr>
          <td>${emp.name || '-'}</td>
          <td>${emp.nip || '-'}</td>
          <td>${emp.position || '-'}</td>
          <td>${emp.rank || '-'}</td>
          <td>${emp.workUnit || '-'}</td>
          <td>${emp.employeeType || '-'}</td>
          <td>${(() => {
            if (!emp.birthDate) return '-';
            const birth = new Date(emp.birthDate);
            const now = new Date();
            let years = now.getFullYear() - birth.getFullYear();
            let months = now.getMonth() - birth.getMonth();
            let days = now.getDate() - birth.getDate();
            if (days < 0) { months--; days += 30; }
            if (months < 0) { years--; months += 12; }
            return `${years} tahun ${months} bulan`;
          })()}</td>
          <td>${(() => {
            const start = emp.appointmentDate || emp.joinDate;
            if (!start) return '-';
            const startDate = new Date(start);
            const now = new Date();
            let years = now.getFullYear() - startDate.getFullYear();
            let months = now.getMonth() - startDate.getMonth();
            let days = now.getDate() - startDate.getDate();
            if (days < 0) { months--; days += 30; }
            if (months < 0) { years--; months += 12; }
            return `${years} tahun ${months} bulan`;
          })()}</td>
          <td>${(() => {
            if (!emp.birthDate || !emp.jobType) return '-';
            const getBUP = (jobType: string) => {
              switch (jobType) {
                case 'pimpinan_tinggi_madya':
                case 'pimpinan_tinggi_pratama':
                case 'fungsional_ahli_madya': return 60;
                case 'fungsional_ahli_utama': return 65;
                case 'fungsional_ahli_pertama':
                case 'fungsional_ahli_muda':
                case 'administrasi':
                default: return 58;
              }
            };
            const birth = new Date(emp.birthDate);
            const now = new Date();
            const bup = getBUP(emp.jobType);
            let years = bup - (now.getFullYear() - birth.getFullYear());
            let months = birth.getMonth() - now.getMonth();
            let days = birth.getDate() - now.getDate();
            if (days < 0) { months--; days += 30; }
            if (months < 0) { years--; months += 12; }
            if (years < 0) return '0 tahun 0 bulan';
            return `${years} tahun ${months} bulan`;
          })()}</td>
          <td>${emp.gender === 'male' ? 'Laki-laki' : emp.gender === 'female' ? 'Perempuan' : '-'}</td>
        </tr>
      `;
    });
    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Daftar_Pegawai_${new Date().toISOString().slice(0, 10)}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportLoading(false);
    setShowExportMenu(false);
  };

  // Add function to handle adding a new employee
  const handleAddEmployee = async (employeeData: any) => {
    try {
      // Show loading indicator
      setExportLoading(true);
      
      // Panggil addEmployee dan simpan hasilnya
      const newEmployee = await addEmployee(employeeData);
      
      // Tampilkan notifikasi sukses
        setNotification({
          type: 'success',
        message: 'Data pegawai berhasil ditambahkan'
        });
        
      // Tutup form
        setShowAddForm(false);
        
      // Reset ke halaman pertama
      setCurrentPage(1);
      
      // Bersihkan notifikasi setelah 3 detik
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      
      return newEmployee;
    } catch (error: any) {
      console.error('Error adding employee:', error);
      
      // Tampilkan pesan error
      setNotification({
        type: 'error',
        message: error.message || t('error_general')
      });
      
      // Bersihkan notifikasi setelah 3 detik
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      // Teruskan error ke form
      throw error;
    } finally {
      setExportLoading(false);
    }
  };

  // Function to handle viewing an employee
  const handleViewEmployee = (employee: any) => {
    // Pastikan properti minimal yang diperlukan ada sebelum menampilkan detail
    if (!employee || !employee.id) {
      console.error('Data pegawai tidak valid atau tidak lengkap');
      setNotification({
        type: 'error',
        message: 'Data pegawai tidak valid atau tidak lengkap'
      });
      return;
    }
    
    setSelectedEmployee(employee);
  };

  // Function to handle editing an employee
  const handleEditEmployee = (employee: any) => {
    // Validasi data sebelum masuk ke form edit
    if (!employee || !employee.id) {
      console.error('Data pegawai tidak valid untuk diedit');
      setNotification({
        type: 'error',
        message: 'Data pegawai tidak valid untuk diedit'
      });
      return;
    }
    
    setSelectedEmployee(null);
    setEditingEmployee(employee);
  };

  // Function to save edited employee
  const handleSaveEditedEmployee = async (updatedEmployee: any) => {
    try {
      // Show loading indicator
      setExportLoading(true);
      
      // Check if we have an ID
      if (!updatedEmployee || !updatedEmployee.id) {
        throw new Error('ID pegawai tidak ditemukan');
      }
      
      // Update using our context
      await updateEmployeeData(updatedEmployee.id, updatedEmployee);
      
      // Close edit form and show success message
      setEditingEmployee(null);
      setNotification({
        type: 'success',
        message: 'Data pegawai berhasil diperbarui'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || t('error_general')
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      // Re-throw to let the form component handle the error state
      throw err;
    } finally {
      setExportLoading(false);
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch(status.toLowerCase()) {
      case 'aktif':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-400">
            {status}
          </span>
        );
      case 'cuti':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-400">
            {status}
          </span>
        );
      case 'sakit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-400">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex">
      <Sidebar onLogout={onLogout} />
      
      <div className={`flex-1 transition-all duration-400 ease-out transform-gpu ${expanded ? 'ml-[240px]' : 'ml-[88px] lg:ml-[104px]'} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
        <Header title={t('employee_list')} onLogout={onLogout} />
        
        <div className="w-full px-4 sm:px-6 md:px-10 pt-24 pb-8">
          {/* Notification */}
          {notification && (
            <div className={`mb-4 p-3 rounded-md text-sm flex items-center ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {notification.type === 'success' ? (
                <Check className="h-4 w-4 mr-2 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 mr-2 flex-shrink-0" />
              )}
              {notification.message}
            </div>
          )}
          
          <div className="mb-6 mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">
              {t('employee_list')}
            </h1>
            <div className="flex items-center mt-1">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Daftar pegawai aktif dan informasi status
              </span>
              {syncStatus === 'syncing' && (
                <span className="ml-2">
                  <RefreshCw size={14} className="text-blue-500 animate-spin" />
                </span>
              )}
              {syncStatus === 'idle' && employees.length > 0 && (
                <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
                  <Check size={12} className="mr-1" />
                  {t('synchronized')}
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="ml-2 text-xs text-red-600 dark:text-red-400 flex items-center">
                  <X size={12} className="mr-1" />
                  {t('sync_failed')}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
            <div className="flex space-x-2">
              <button
                onClick={refreshData}
                className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors duration-200 ${
                  syncStatus === 'syncing' 
                    ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                    : syncStatus === 'error'
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
                disabled={loading || syncStatus === 'syncing'}
              >
                <RefreshCw size={16} className={`mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                {syncStatus === 'syncing' ? t('syncing') : t('sync')}
              </button>
              
              {/* Add employee button - only visible to admin/superadmin */}
              {isAdmin() && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('add_employee')}
                </button>
              )}
            </div>
            
            {/* Export button */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exportLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportLoading ? t('exporting') : t('export')}
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {showExportMenu && (
                <>
                  {/* Backdrop to ensure dropdown covers content behind it */}
                  <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)}></div>
                  
                  <div className="absolute right-0 mt-1 w-56 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-md shadow-lg border border-gray-200/30 dark:border-gray-700/30 z-40">
                    <div className="py-1 rounded-md overflow-hidden">
                      <button
                        onClick={exportToPDF}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100/50 dark:border-gray-700/50"
                      >
                        <FileText className="h-4 w-4 mr-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <span>{t('export_to_pdf')}</span>
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100/50 dark:border-gray-700/50"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>{t('export_to_excel')}</span>
                      </button>
                      <button
                        onClick={exportToCSV}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100/50 dark:border-gray-700/50"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span>{t('export_to_csv')}</span>
                      </button>
                      <button
                        onClick={exportToWord}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FileText className="h-4 w-4 mr-3 text-blue-700 dark:text-blue-500 flex-shrink-0" />
                        <span>{t('export_to_word')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
            
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
            {/* Filter bar */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex flex-wrap gap-4 items-center">
              {/* Search input */}
              <div className="relative flex-grow max-w-md">
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex gap-4 flex-wrap">
                {/* Department filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('department')}:
                  </span>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="rounded-md border border-gray-300 dark:border-gray-600 text-sm py-2 px-3 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === 'all' ? t('all_departments') : dept}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Status filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('status')}:
                  </span>
                  <select
                    id="status-filter"
                    className="rounded-md border border-gray-300 dark:border-gray-600 text-sm py-2 px-3 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">{t('all_statuses')}</option>
                    {statuses.filter(s => s !== 'all').map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                {/* Toggle view mode */}
                <div className="flex ml-auto">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg flex p-1">
                    <button
                      className={`rounded-md p-1.5 ${viewMode === 'table' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      onClick={() => setViewMode('table')}
                      title={t('table_view')}
                    >
                      <List size={18} />
                    </button>
                    <button
                      className={`rounded-md p-1.5 ${viewMode === 'card' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      onClick={() => setViewMode('card')}
                      title={t('card_view')}
                    >
                      <Grid size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Loading indicator */}
            {loading && paginatedEmployees.length === 0 && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">{t('loading_data')}</span>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="p-8 text-center text-red-600 dark:text-red-400">
                <X size={24} className="mx-auto mb-2" />
                <p>{error}</p>
                <button 
                  onClick={refreshData}
                  className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                >
                  {t('try_again')}
                </button>
              </div>
            )}
            
            {/* Conditional render based on view mode */}
            {!loading && !error && viewMode === 'table' ? (
              /* Employees Table with improved spacing */
              <div className="w-full">
                <div id="employee-table-area" className="overflow-x-auto">
                  <table className="employee-table w-full table-fixed border-collapse text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%]">
                          {t('employee_name')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">
                          {t('employee_id')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%]">
                          {t('employee_position')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%]">
                          {t('employee_department')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%] hide-sm">
                          {t('employee_status')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">
                          {t('actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white" title={employee.name}>{employee.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500 dark:text-gray-300" title={employee.nip}>{employee.nip}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500 dark:text-gray-300 break-words line-clamp-2" title={employee.position}>
                              {employee.position}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500 dark:text-gray-300 break-words line-clamp-2" title={employee.workUnit}>
                              {employee.workUnit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hide-sm">
                            {formatStatus(employee.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewEmployee(employee)}
                                className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                                aria-label="View details"
                                title={t('view_details')}
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleEditEmployee(employee)}
                                className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                                aria-label="Edit employee"
                                title={t('edit_employee')}
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {paginatedEmployees.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            {t('no_employees_found')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : !loading && !error ? (
              /* Card view layout */
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedEmployees.map((employee) => (
                    <div key={employee.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                          {employee.photo ? (
                            <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{employee.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-md font-semibold text-gray-900 dark:text-white truncate" title={employee.name}>
                            {employee.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={employee.position}>
                            {employee.position}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('employee_id')}</span>
                          <span className="text-xs text-gray-900 dark:text-white">{employee.nip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('employee_department')}
                          </span>
                          <span className="text-xs text-gray-900 dark:text-white truncate max-w-[65%]" title={employee.workUnit}>
                            {employee.workUnit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('employee_rank')}
                          </span>
                          <span className="text-xs text-gray-900 dark:text-white truncate max-w-[65%]" title={employee.rank}>
                            {employee.rank}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('employee_status')}
                          </span>
                          {formatStatus(employee.status)}
                        </div>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
                        <button 
                          onClick={() => handleViewEmployee(employee)}
                          className="p-1.5 rounded-md text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          aria-label="View details"
                          title={t('view_details')}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditEmployee(employee)}
                          className="p-1.5 rounded-md text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          aria-label="Edit employee"
                          title={t('edit_employee')}
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {paginatedEmployees.length === 0 && (
                    <div className="col-span-3 p-8 text-center text-gray-500 dark:text-gray-400">
                      {t('no_employees_found')}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            
            {/* Pagination */}
            {!loading && !error && paginatedEmployees.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-y-4 px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('showing')} <span className="font-medium">{Math.min(startIndex + 1, filteredEmployees.length)}</span> {t('to')} <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredEmployees.length)}</span> {t('of')} <span className="font-medium">{filteredEmployees.length}</span> {t('employees')}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('previous')}
                  </button>
                  <div className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                    {currentPage} / {totalPages || 1}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    {t('next')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Employee Form Modal */}
      {showAddForm && (
        <AddEmployeeForm 
          onClose={() => setShowAddForm(false)} 
          onSubmit={handleAddEmployee} 
        />
      )}
      
      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetail 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)}
          onEdit={isAdmin() ? handleEditEmployee : undefined}
          refreshTrigger={syncStatus === 'syncing' ? 1 : 0}
        />
      )}
      
      {/* Edit Employee Form Modal */}
      {editingEmployee && (
        <EditEmployeeForm 
          employee={editingEmployee} 
          onClose={() => setEditingEmployee(null)} 
          onSubmit={handleSaveEditedEmployee} 
        />
      )}
    </div>
  );
};

export default EmployeeList;