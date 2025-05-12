import { useState, useEffect } from 'react';
import { X, Calendar, Mail, Phone, MapPin, BookOpen, Briefcase, Building, Award, Tag, User, UserCheck, Clock, Download, Edit, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

interface EmployeeDetailProps {
  employee: any;
  onClose: () => void;
  onEdit?: (employee: any) => void;
  refreshTrigger?: number;
}

// Helper function to calculate service period
const calculateServicePeriod = (startDate: string | Date | null) => {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;
  
  return {
    years,
    months,
    days,
    formatted: `${years} tahun ${months} bulan ${days} hari`
  };
};

// Helper function to calculate remaining service period
const calculateRemainingServicePeriod = (retirementDate: string | Date | null) => {
  if (!retirementDate) return null;
  
  const retirement = new Date(retirementDate);
  const now = new Date();
  const diffTime = Math.abs(retirement.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;
  
  return {
    years,
    months,
    days,
    formatted: `${years} tahun ${months} bulan ${days} hari`
  };
};

// Helper function to format date to 'DD MMMM YYYY' in Indonesian
const formatDateIndo = (dateString: string | Date | null) => {
  if (!dateString) return '-';
  let date: Date;
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Manual parsing to avoid timezone/locale issues
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(dateString);
  }
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Helper function to get BUP based on jobType
const getBUP = (jobType: string | undefined) => {
  switch (jobType) {
    case 'administrasi':
    case 'fungsional_ahli_pertama':
    case 'fungsional_ahli_muda':
    case 'fungsional_keterampilan':
      return 58;
    case 'pimpinan_tinggi':
    case 'fungsional_ahli_madya':
      return 60;
    case 'fungsional_ahli_utama':
      return 65;
    default:
      return 58; // fallback default
  }
};

// Helper function to calculate retirement date based on birthDate and jobType
const getRetirementDate = (birthDate: string | Date | null, jobType: string | undefined) => {
  if (!birthDate) return null;
  const bup = getBUP(jobType);
  let date: Date;
  if (typeof birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    const [year, month, day] = birthDate.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(birthDate);
  }
  if (isNaN(date.getTime())) return null;
  const retirement = new Date(date);
  retirement.setFullYear(retirement.getFullYear() + bup);
  return retirement;
};

const EmployeeDetail = ({ employee, onClose, onEdit, refreshTrigger = 0 }: EmployeeDetailProps) => {
  const [downloading, setDownloading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  
  // Update local employee data when employee prop changes or refreshTrigger changes
  useEffect(() => {
    if (employee) {
      // In a real application, we would fetch the latest data from the server here
      // For now, we'll just update our local state with the prop
      setEmployeeData(employee);
      console.log('Employee detail data refreshed');
    }
  }, [employee, refreshTrigger]);
  
  // Listen for sidebar collapse state changes
  useEffect(() => {
    // Function to check if sidebar is collapsed
    const checkSidebarState = () => {
      const sidebarElement = document.querySelector('aside');
      if (sidebarElement) {
        // Check if sidebar has the w-20 class (collapsed state)
        setSidebarCollapsed(sidebarElement.classList.contains('w-20'));
      }
    };
    
    // Check initial state
    checkSidebarState();
    
    // Create observer to detect changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        checkSidebarState();
      });
    });
    
    // Target the sidebar element for observation
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  // Updated function to download employee biodata as PDF
  const handleDownloadBiodata = () => {
    if (!employeeData) return;
    
    setDownloading(true);
    
    try {
      // Tentukan content foto
      let photoContent;
      if (employeeData.photo) {
        // Jika ada foto, gunakan foto asli
        photoContent = `<img src="${employeeData.photo}" alt="${employeeData.name || 'Pegawai'}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 20px;">`;
      } else {
        // Jika tidak ada foto, gunakan placeholder dengan inisial
        photoContent = `<div class="photo-placeholder">${employeeData.name ? employeeData.name.charAt(0).toUpperCase() : 'P'}</div>`;
      }
      
      // In a real application, this would use a PDF generation library
      // Create a nicer formatted HTML document that can be printed to PDF
      const biodataHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Biodata ${employeeData.name || 'Pegawai'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.5; }
    h1 { color: #2563eb; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1f2937; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
    .info-grid { display: grid; grid-template-columns: 150px auto; row-gap: 10px; margin-bottom: 20px; }
    .label { font-weight: bold; }
    .value { }
    .photo-placeholder { width: 120px; height: 120px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #2563eb; margin: 0 auto 20px; }
    .status { display: inline-block; padding: 5px 10px; border-radius: 20px; font-size: 14px; }
    .status-active { background-color: #d1fae5; color: #065f46; }
    .status-leave { background-color: #fef3c7; color: #92400e; }
    .status-sick { background-color: #fee2e2; color: #b91c1c; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; }
    .section { margin-bottom: 25px; }
    .pre-line { white-space: pre-line; }
  </style>
</head>
<body>
  <h1>BIODATA PEGAWAI</h1>
  
  ${photoContent}
  
  <h2>Informasi Pribadi</h2>
  <div class="info-grid">
    <div class="label">Nama Lengkap:</div>
    <div class="value">${employeeData.name || '-'}</div>
    
    <div class="label">NIP:</div>
    <div class="value">${employeeData.nip || '-'}</div>
    
    <div class="label">Jenis Kelamin:</div>
    <div class="value">${employeeData.gender === 'male' ? 'Laki-laki' : employeeData.gender === 'female' ? 'Perempuan' : '-'}</div>
    
    <div class="label">Tanggal Lahir:</div>
    <div class="value">${formatDateIndo(employeeData.birthDate)}</div>
  </div>
  
  <h2>Informasi Kepegawaian</h2>
  <div class="info-grid">
    <div class="label">Status:</div>
    <div class="value">
      <span class="status ${
        employeeData.status === 'Aktif' ? 'status-active' : 
        employeeData.status === 'Cuti' ? 'status-leave' : 
        employeeData.status === 'Sakit' ? 'status-sick' : ''
      }">${employeeData.status || 'Aktif'}</span>
    </div>
    
    <div class="label">Tipe Pegawai:</div>
    <div class="value">${formatEmployeeType(employeeData.employeeType)}</div>
    
    <div class="label">Unit Kerja:</div>
    <div class="value">${employeeData.workUnit || '-'}</div>
    
    <div class="label">Jabatan:</div>
    <div class="value">${employeeData.position || '-'}</div>
    
    <div class="label">Pangkat/Golongan:</div>
    <div class="value">${employeeData.rank || '-'}</div>
  </div>
  
  <div class="section">
    <h3>Riwayat Jabatan</h3>
    <div class="pre-line">${employeeData.positionHistory || 'Tidak ada riwayat jabatan yang tercatat'}</div>
  </div>
  
  <h2>Pendidikan</h2>
  <div class="info-grid">
    <div class="label">Tingkat Pendidikan:</div>
    <div class="value">${formatEducation(employeeData.educationLevel)}</div>
    
    <div class="label">Jurusan:</div>
    <div class="value">${employeeData.educationMajor || '-'}</div>
    
    <div class="label">Institusi:</div>
    <div class="value">${employeeData.educationInstitution || '-'}</div>
    
    <div class="label">Tahun Lulus:</div>
    <div class="value">${employeeData.graduationYear || '-'}</div>
  </div>
  
  <h2>Kontak</h2>
  <div class="info-grid">
    <div class="label">Email:</div>
    <div class="value">${employeeData.email || '-'}</div>
    
    <div class="label">Nomor Telepon:</div>
    <div class="value">${employeeData.phoneNumber || '-'}</div>
    
    <div class="label">Alamat:</div>
    <div class="value">${employeeData.address || '-'}</div>
  </div>
  
  <div class="section">
    <h3>Catatan Tambahan</h3>
    <div class="pre-line">${employeeData.notes || '-'}</div>
  </div>
  
  <div class="footer">
    Data diambil pada tanggal ${new Date().toLocaleDateString('id-ID')} pukul ${new Date().toLocaleTimeString('id-ID')}
  </div>
</body>
</html>
      `;
      
      // Create blob and open in new window for printing
      const blob = new Blob([biodataHtml], {type: 'text/html'});
      const url = URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.href = url;
      element.download = `Biodata_${(employeeData.name || 'Pegawai').replace(/\s+/g, '_')}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 500);
    } catch (error) {
      console.error('Error generating biodata:', error);
      setDownloading(false);
    }
  };
  
  // Format employee type for display
  const formatEmployeeType = (type?: string) => {
    if (!type) return '-';
    
    switch(type) {
      case 'pns': return 'PNS';
      case 'pppk': return 'PPPK';
      case 'honorer': return 'Honorer';
      default: return type.toUpperCase();
    }
  };
  
  // Format education level for display
  const formatEducation = (level?: string) => {
    if (!level) return '-';
    
    switch(level) {
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

  // Tambahkan fungsi untuk download PDF biodata rapi
  const handleDownloadBiodataPDF = async () => {
    if (!employeeData) return;
    setDownloading(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      doc.setFontSize(16);
      doc.text('Biodata Pegawai', 40, 40);
      doc.setFontSize(12);
      let y = 70;
      const lineHeight = 22;
      const addField = (label: string, value: string) => {
        doc.setFont(undefined, 'bold');
        doc.text(label, 40, y);
        doc.setFont(undefined, 'normal');
        doc.text(value, 180, y);
        y += lineHeight;
      };
      addField('Nama', String(employeeData.name || '-'));
      addField('NIP', String(employeeData.nip || '-'));
      addField('Jabatan', String(employeeData.position || '-'));
      addField('Unit Kerja', String(employeeData.workUnit || '-'));
      addField('Status', String(employeeData.status || '-'));
      addField('Tipe Pegawai', String(formatEmployeeType(employeeData.employeeType) || '-'));
      addField('Pangkat/Golongan', String(employeeData.rank || '-'));
      addField('TMT Pengangkatan', String(formatDateIndo(employeeData.appointmentDate) || '-'));
      addField('Masa Kerja', (() => {
        const start = employeeData.appointmentDate || employeeData.joinDate;
        const period = calculateServicePeriod(start);
        return String((period ? period.formatted : '-') || '-');
      })());
      addField('Sisa Masa Kerja', (() => {
        const retirement = getRetirementDate(employeeData.birthDate, employeeData.jobType);
        const period = calculateRemainingServicePeriod(retirement);
        return String((period ? period.formatted : '-') || '-');
      })());
      addField('Tingkat Pendidikan', String(formatEducation(employeeData.educationLevel) || '-'));
      addField('Jurusan', String(employeeData.educationMajor || '-'));
      addField('Institusi', String(employeeData.educationInstitution || '-'));
      addField('Tahun Lulus', String(employeeData.graduationYear || '-'));
      addField('Email', String(employeeData.email || '-'));
      addField('No. Telepon', String(employeeData.phoneNumber || '-'));
      addField('Alamat', String(employeeData.address || '-'));
      addField('Catatan', String(employeeData.notes || '-'));
      doc.save(`Biodata_${(employeeData.name || 'Pegawai').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert('Gagal mengunduh PDF.');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-gray-900/40 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className={`fixed inset-0 ${sidebarCollapsed ? 'modal-container-collapsed' : 'modal-container'} flex items-center justify-center`}>
        <div className="fixed inset-0 transition-opacity" 
          aria-hidden="true" onClick={onClose}>
        </div>
        
        <div className="relative z-50 bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl w-full mx-4 my-4 border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              Detail Pegawai
            </h3>
            <div className="flex items-center gap-2">
              {/* Hapus tombol download HTML, hanya tampilkan tombol Edit jika ada */}
              {onEdit && employeeData && (
                <button
                  type="button"
                  className="bg-amber-100 dark:bg-amber-700/30 text-amber-600 dark:text-amber-300 rounded-full p-1 hover:bg-amber-200 dark:hover:bg-amber-700/50 transition-colors"
                  onClick={() => onEdit(employeeData)}
                >
                  <Edit size={18} />
                </button>
              )}
              <button
                type="button"
                className="bg-white dark:bg-gray-700 rounded-full p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {employeeData ? (
            <div id="biodata-print-area">
              <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 flex items-center justify-center text-white font-medium text-2xl shadow-md flex-shrink-0">
                    {employeeData.photo ? (
                      <img src={employeeData.photo} alt={employeeData.name || 'Profil'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{employeeData.name && employeeData.name.length > 0 ? employeeData.name.charAt(0).toUpperCase() : 'P'}</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center sm:items-start">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{employeeData.name || 'Nama tidak tersedia'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{employeeData.position || '-'}</p>
                    
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mt-1">
                      {formatEmployeeType(employeeData.employeeType)}
                    </div>
                    
                    <div className="flex items-center mt-4 space-x-3">
                      <button
                        onClick={handleDownloadBiodataPDF}
                        disabled={downloading}
                        className="flex items-center space-x-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                      >
                        <FileText size={16} />
                        <span>{downloading ? 'Mengunduh...' : 'Unduh PDF'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informasi Pribadi */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                      <User className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                      Informasi Pribadi
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">NIP</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.nip || '-'}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Jenis Kelamin</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {employeeData.gender === 'male' ? 'Laki-laki' : employeeData.gender === 'female' ? 'Perempuan' : '-'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tanggal Lahir</span>
                        <span className="text-sm text-gray-900 dark:text-white flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                          {formatDateIndo(employeeData.birthDate)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</span>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            employeeData.status === 'Aktif' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            employeeData.status === 'Cuti' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full mr-1 ${
                              employeeData.status === 'Aktif' ? 'bg-green-500' :
                              employeeData.status === 'Cuti' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></span>
                            {employeeData.status || 'Aktif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informasi Kepegawaian */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                      <Briefcase className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                      Informasi Kepegawaian
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Unit Kerja</span>
                        <span className="text-sm text-gray-900 dark:text-white flex items-center">
                          <Building className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                          {employeeData.workUnit || '-'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Jabatan</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.position || '-'}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pangkat/Golongan</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.rank || '-'}</span>
                      </div>

                      {/* TMT Pengangkatan untuk ASN */}
                      {(employeeData.employeeType === 'pns' || employeeData.employeeType === 'pppk') && (
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">TMT Pengangkatan</span>
                          <span className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                            {formatDateIndo(employeeData.appointmentDate)}
                          </span>
                        </div>
                      )}

                      {/* Tanggal Masuk Kerja untuk Non-ASN */}
                      {employeeData.employeeType === 'nonAsn' && (
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tanggal Masuk Kerja</span>
                          <span className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                            {formatDateIndo(employeeData.joinDate)}
                          </span>
                        </div>
                      )}

                      {/* Masa Kerja */}
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Masa Kerja</span>
                        <span className="text-sm text-gray-900 dark:text-white flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                          {(() => {
                            const start = employeeData.appointmentDate || employeeData.joinDate;
                            const period = calculateServicePeriod(start);
                            return period ? period.formatted : '-';
                          })()}
                        </span>
                      </div>

                      {/* Sisa Masa Kerja (hanya untuk ASN) */}
                      {(employeeData.employeeType === 'pns' || employeeData.employeeType === 'pppk') && (
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sisa Masa Kerja</span>
                          <span className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                            {(() => {
                              const retirement = getRetirementDate(employeeData.birthDate, employeeData.jobType);
                              const period = calculateRemainingServicePeriod(retirement);
                              return period ? period.formatted : '-';
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Riwayat Jabatan */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                      <Award className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                      Riwayat Jabatan
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                          {employeeData.positionHistory || 'Tidak ada riwayat jabatan yang tercatat'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pendidikan */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                      Pendidikan
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tingkat Pendidikan</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {employeeData.educationLevel ? formatEducation(employeeData.educationLevel) : '-'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Jurusan/Program Studi</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.educationMajor || '-'}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Institusi Pendidikan</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.educationInstitution || '-'}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tahun Lulus</span>
                        <span className="text-sm text-gray-900 dark:text-white">{employeeData.graduationYear || '-'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Kontak */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                      <Phone className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                      Kontak
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</span>
                        <span className="text-sm text-gray-900 dark:text-white flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                          {employeeData.email || '-'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Telepon</span>
                        <span className="text-sm text-gray-900 dark:text-white flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                          {employeeData.phoneNumber || '-'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Alamat</span>
                        <span className="text-sm text-gray-900 dark:text-white flex items-start">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500 mt-0.5" />
                          <span>{employeeData.address || '-'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Catatan Tambahan */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                      <FileText className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                      Catatan Tambahan
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                          {employeeData.notes || 'Tidak ada catatan tambahan'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center">
              <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400">Memuat data pegawai...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail; 