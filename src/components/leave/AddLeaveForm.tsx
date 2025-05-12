import { useState, useEffect } from 'react';
import { useLeave, LeaveType, LEAVE_REGULATIONS } from '../../lib/LeaveContext';
import { useEmployees } from '../../lib/EmployeeContext';
import { useTheme } from '../../lib/ThemeContext';
import { X, Calendar, FileCheck, AlertCircle, Info, HelpCircle, AlertTriangle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { id } from 'date-fns/locale/id';
import { differenceInCalendarDays, addDays, format } from 'date-fns';
import { calculateEndDateWithWorkingDays, isNonWorkingDay, getHolidaysInRange } from '../../lib/dateUtils';

// Initialize date picker locale
registerLocale('id', id);
setDefaultLocale('id');

// Definisi tipe untuk status cuti
type LeaveStatus = 'Approved' | 'Pending' | 'Rejected' | 'Completed';

interface AddLeaveFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddLeaveForm = ({ onClose, onSuccess }: AddLeaveFormProps) => {
  const { addLeave, leaveQuotas } = useLeave();
  const { employees } = useEmployees();
  const { language } = useTheme();
  
  // State untuk data form
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    employeeNip: '',
    leaveType: 'Tahunan' as LeaveType,
    duration: 0,
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Pending' as LeaveStatus,
    documentRequired: false,
    document: '',
    serviceYears: 0,
    inputBy: 'Admin Sistem',
    year: currentYear,
    accumulatedFromPrevYear: false,
    extendedLeave: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [nonWorkingDaysInRange, setNonWorkingDaysInRange] = useState<{date: string; isWeekend: boolean; isHoliday: boolean; isCollectiveLeave: boolean}[]>([]);
  const [showNonWorkingDays, setShowNonWorkingDays] = useState(false);
  const [showRegulationInfo, setShowRegulationInfo] = useState(false);
  const [leaveQuota, setLeaveQuota] = useState<any>(null);
  
  // Efek untuk mendapatkan informasi quota dan eligibility pegawai yang dipilih
  useEffect(() => {
    if (formData.employeeId) {
      const selectedEmployee = employees.find(emp => emp.id.toString() === formData.employeeId);
      const employeeQuota = leaveQuotas.find(q => 
        q.employeeId.toString() === formData.employeeId && 
        q.year === formData.year
      );
      
      if (selectedEmployee) {
        // Ambil masa kerja dari data pegawai atau hitung jika tidak ada
        let serviceYears = 0;
        
        // Gunakan appointmentDate jika ada (untuk PNS/PPPK), jika tidak gunakan joinDate
        const startDate = selectedEmployee.appointmentDate || selectedEmployee.joinDate || '';
        
        if (startDate) {
          const start = new Date(startDate);
          const now = new Date();
          serviceYears = Math.floor((now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          
          // Pastikan minimal 0
          serviceYears = Math.max(0, serviceYears);
        }
        
        setFormData(prev => ({
          ...prev,
          employeeName: selectedEmployee.name,
          employeeNip: selectedEmployee.nip || '',
          serviceYears: serviceYears
        }));
        
        if (employeeQuota) {
          setLeaveQuota(employeeQuota);
        }
      }
    }
  }, [formData.employeeId, employees, leaveQuotas, formData.year]);
  
  // Efek untuk mengatur document required berdasarkan jenis cuti
  useEffect(() => {
    if (!formData.leaveType) return;
    
    const leaveTypeInfo = LEAVE_REGULATIONS[formData.leaveType];
    
    if (leaveTypeInfo) {
      // Update requiresDocument based on leave type
      const requires = 'requiresDocument' in leaveTypeInfo ? leaveTypeInfo.requiresDocument : false;
      
      setFormData(prev => ({
        ...prev,
        documentRequired: requires
      }));
      
      // Validate minimum service years
      if ('minServiceYears' in leaveTypeInfo && 
          formData.serviceYears < (leaveTypeInfo.minServiceYears || 0)) {
        setErrors(prev => ({
          ...prev,
          serviceYears: language === 'id' 
            ? `Pegawai belum memenuhi syarat masa kerja minimum ${leaveTypeInfo.minServiceYears} tahun untuk jenis cuti ini.`
            : `Employee does not meet the minimum service requirement of ${leaveTypeInfo.minServiceYears} years for this leave type.`
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.serviceYears;
          return newErrors;
        });
      }
      
      // Set default duration for specific leave types
      if (formData.leaveType === 'Melahirkan' && !formData.duration) {
        setFormData(prev => ({
          ...prev,
          duration: 90 // 3 bulan
        }));
      } else if (formData.leaveType === 'Besar' && !formData.duration) {
        setFormData(prev => ({
          ...prev,
          duration: 90 // 3 bulan
        }));
      }
    }
  }, [formData.leaveType, formData.serviceYears]);
  
  // Efek untuk menghitung durasi otomatis berdasarkan tanggal
  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      const daysDiff = differenceInCalendarDays(selectedEndDate, selectedStartDate) + 1;
      if (daysDiff > 0) {
        setFormData(prev => ({
          ...prev,
          duration: daysDiff
        }));
      }
    }
  }, [selectedStartDate, selectedEndDate]);
  
  // Handler untuk mengubah input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'duration') {
      // Convert to number for numeric fields
      const numValue = parseInt(value, 10) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
      
      // Jika mengubah durasi, perbarui tanggal selesai dengan perhitungan hari kerja
      if (selectedStartDate && numValue > 0) {
        const newEndDate = calculateEndDateWithWorkingDays(selectedStartDate, numValue);
        setSelectedEndDate(newEndDate);
        setFormData(prev => ({
          ...prev,
          endDate: format(newEndDate, 'yyyy-MM-dd')
        }));
        
        // Update list of holidays in the date range
        updateNonWorkingDaysInRange(selectedStartDate, newEndDate);
      }
    } else if (name === 'employeeId') {
      // Ketika pegawai dipilih, auto-fill data pegawai dari useEffect
      setFormData(prev => ({
        ...prev,
        employeeId: value
      }));
    } else if (name === 'leaveType') {
      // Mengubah jenis cuti
      setFormData(prev => ({
        ...prev,
        leaveType: value as LeaveType
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Function untuk mengubah tanggal mulai
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      // Reset tanggal yang tidak bisa dipilih (hari libur/akhir pekan)
      const isStartDateNonWorkingDay = isNonWorkingDay(date);
      
      // Set tanggal mulai
      setSelectedStartDate(date);
      setFormData(prev => ({
        ...prev,
        startDate: format(date, 'yyyy-MM-dd')
      }));
      
      // Kalkulasi ulang tanggal selesai berdasarkan durasi yang ada
      if (formData.duration > 0) {
        const newEndDate = calculateEndDateWithWorkingDays(date, formData.duration);
        setSelectedEndDate(newEndDate);
        setFormData(prev => ({
          ...prev,
          endDate: format(newEndDate, 'yyyy-MM-dd')
        }));
        
        // Update list of holidays in the date range
        updateNonWorkingDaysInRange(date, newEndDate);
      }
      
      // Tampilkan peringatan jika tanggal mulai adalah hari libur/akhir pekan
      if (isStartDateNonWorkingDay) {
        setErrors(prev => ({
          ...prev,
          startDate: 'Tanggal yang dipilih adalah hari libur atau akhir pekan. Perhitungan cuti akan dimulai dari hari kerja berikutnya.'
        }));
      } else {
        // Hapus error jika sebelumnya ada
        if (errors.startDate) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.startDate;
            return newErrors;
          });
        }
      }
    }
  };
  
  // Function untuk mengubah tanggal selesai
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      // Check jika tanggal akhir lebih awal dari tanggal mulai
      if (selectedStartDate && date < selectedStartDate) {
        setErrors(prev => ({
          ...prev,
          endDate: 'Tanggal selesai tidak boleh sebelum tanggal mulai'
        }));
        return;
      }
      
      setSelectedEndDate(date);
      setFormData(prev => ({
        ...prev,
        endDate: format(date, 'yyyy-MM-dd')
      }));
      
      // Update durasi berdasarkan rentang hari kerja
      if (selectedStartDate) {
        // Hitung durasi dengan memperhitungkan hari libur dan akhir pekan
        let workingDays = 0;
        let currentDate = new Date(selectedStartDate);
        
        while (currentDate <= date) {
          if (!isNonWorkingDay(currentDate)) {
            workingDays++;
          }
          currentDate = addDays(currentDate, 1);
        }
        
        // Update form dengan durasi yang dihitung
        setFormData(prev => ({
          ...prev,
          duration: workingDays
        }));
        
        // Update list of holidays in the date range
        updateNonWorkingDaysInRange(selectedStartDate, date);
      }
    }
  };
  
  // Function untuk memperbarui daftar hari libur dalam rentang tanggal
  const updateNonWorkingDaysInRange = (startDate: Date, endDate: Date) => {
    const holidays = getHolidaysInRange(startDate, endDate);
    setNonWorkingDaysInRange(holidays);
    
    // Tampilkan informasi hari libur jika ada
    if (holidays.length > 0) {
      setShowNonWorkingDays(true);
    }
  };
  
  // Toggle tampilan informasi hari libur
  const toggleNonWorkingDaysInfo = () => {
    setShowNonWorkingDays(!showNonWorkingDays);
  };    
  
  // Tampilkan info regulasi
  const toggleRegulationInfo = () => {
    setShowRegulationInfo(!showRegulationInfo);
  };
  
  // Validasi form
  const validateForm = () => {
    // Mengambil informasi regulasi untuk jenis cuti yang dipilih
    const leaveTypeInfo = formData.leaveType ? LEAVE_REGULATIONS[formData.leaveType as keyof typeof LEAVE_REGULATIONS] : null;
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.employeeId) {
      newErrors.employeeId = 'Pegawai harus dipilih';
    }
    
    if (!formData.leaveType) {
      newErrors.leaveType = 'Jenis cuti harus dipilih';
    }
    
    // Validasi NIP untuk pegawai ASN (PNS/PPPK)
    const selectedEmployee = employees.find(emp => emp.id.toString() === formData.employeeId);
    if (selectedEmployee && (selectedEmployee.employeeType === 'pns' || selectedEmployee.employeeType === 'pppk' || selectedEmployee.employeeType === 'p3k')) {
      if (!formData.employeeNip || formData.employeeNip.length !== 18) {
        newErrors.employeeNip = 'NIP ASN harus berisi 18 digit';
      }
    }
    
    // Validasi masa kerja
    if (leaveTypeInfo) {
      // Gunakan operator in untuk memeriksa properti yang mungkin tidak ada di semua jenis cuti
      if ('minServiceYears' in leaveTypeInfo) {
        const minYears = leaveTypeInfo.minServiceYears || 0;
        if (formData.serviceYears < minYears) {
          newErrors.serviceYears = language === 'id' 
        ? `Pegawai belum memenuhi syarat masa kerja minimum ${minYears} tahun untuk jenis cuti ini.`
        : `Employee does not meet the minimum service requirement of ${minYears} years for this leave type.`;
        }
      }
    }
    
    // Validasi durasi
    if (formData.duration <= 0) {
      newErrors.duration = language === 'id' ? 'Durasi cuti harus lebih dari 0' : 'Leave duration must be greater than 0';
    } else if (leaveTypeInfo && formData.duration > leaveTypeInfo.maxDuration) {
      newErrors.duration = language === 'id'
        ? `Durasi cuti tidak boleh melebihi ${leaveTypeInfo.maxDuration} hari untuk jenis cuti ${formData.leaveType}`
        : `Leave duration cannot exceed ${leaveTypeInfo.maxDuration} days for ${formData.leaveType} leave type`;
    }
    
    if ((formData.startDate && !formData.endDate) || (!formData.startDate && formData.endDate)) {
      newErrors.endDate = language === 'id' ? 'Tanggal mulai dan selesai harus diisi keduanya' : 'Both start and end dates must be filled';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) {
        newErrors.endDate = language === 'id' ? 'Tanggal selesai tidak boleh sebelum tanggal mulai' : 'End date cannot be before start date';
      }
    }
    
    // Validasi alasan/dokumen
    if (!formData.reason) {
      newErrors.reason = language === 'id' ? 'Alasan cuti harus diisi' : 'Leave reason must be filled';
    }
    
    if (formData.documentRequired && !formData.document) {
      newErrors.document = language === 'id' ? 'Dokumen pendukung diperlukan untuk jenis cuti ini' : 'Supporting document is required for this leave type';
    }
    
    // Validasi khusus untuk cuti tahunan
    if (formData.leaveType === 'Tahunan' && leaveQuota) {
      if (formData.duration > leaveQuota.annualRemaining) {
        newErrors.duration = language === 'id'
          ? `Durasi cuti melebihi sisa cuti tahunan (${leaveQuota.annualRemaining} hari)`
          : `Leave duration exceeds remaining annual leave (${leaveQuota.annualRemaining} days)`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handler submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Persiapkan data yang akan disimpan
      const leaveData = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        employeeNip: formData.employeeNip,
        leaveType: formData.leaveType,
        duration: formData.duration,
        startDate: formData.startDate,
        endDate: formData.endDate,
        documentRequired: formData.documentRequired,
        document: formData.document,
        reason: formData.reason,
        status: formData.status,
        serviceYears: formData.serviceYears,
        inputBy: formData.inputBy,
        year: formData.year,
        accumulatedFromPrevYear: formData.accumulatedFromPrevYear,
        extendedLeave: formData.extendedLeave
      };
      
      addLeave(leaveData);
      onSuccess();
    }
  };
  
  // Rendering UI
  return (
    <div className="fixed inset-0 bg-gray-800/70 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'id' ? 'Tambah Data Cuti' : 'Add Leave Data'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pegawai */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {language === 'id' ? 'Pegawai' : 'Employee'}
              </label>
              <select 
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className={`w-full rounded border ${errors.employeeId ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                <option value="">{language === 'id' ? 'Pilih Pegawai' : 'Select Employee'}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id.toString()}>
                    {emp.name} {emp.nip ? `(${emp.nip})` : ''}
                  </option>
                ))}
              </select>
              {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
            </div>
            
            {/* Jenis Cuti */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {language === 'id' ? 'Jenis Cuti' : 'Leave Type'}
                <button 
                  type="button" 
                  title={language === 'id' ? 'Lihat Ketentuan' : 'View Regulations'}
                  onClick={toggleRegulationInfo}
                  className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Info className="w-4 h-4 inline" />
                </button>
              </label>
              <select 
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className={`w-full rounded border ${errors.leaveType ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                <option value="">{language === 'id' ? 'Pilih Jenis Cuti' : 'Select Leave Type'}</option>
                <option value="Tahunan">{language === 'id' ? 'Cuti Tahunan' : 'Annual Leave'}</option>
                <option value="Sakit">{language === 'id' ? 'Cuti Sakit' : 'Sick Leave'}</option>
                <option value="Besar">{language === 'id' ? 'Cuti Besar' : 'Long Leave'}</option>
                <option value="Melahirkan">{language === 'id' ? 'Cuti Melahirkan' : 'Maternity Leave'}</option>
                <option value="Alasan Penting">{language === 'id' ? 'Cuti Alasan Penting' : 'Important Reason Leave'}</option>
                <option value="Di Luar Tanggungan Negara">{language === 'id' ? 'Cuti Di Luar Tanggungan Negara (CLTN)' : 'Unpaid Leave (CLTN)'}</option>
              </select>
              {errors.leaveType && <p className="text-red-500 text-sm mt-1">{errors.leaveType}</p>}
            </div>
            
            {/* Informasi Regulasi */}
            {showRegulationInfo && formData.leaveType && (
              <div className="col-span-1 md:col-span-2 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md mb-4 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start">
                  <HelpCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">
                      {language === 'id' ? `Ketentuan ${formData.leaveType}` : `${formData.leaveType} Regulations`}
                    </h3>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                      {LEAVE_REGULATIONS[formData.leaveType]?.description || (language === 'id' ? 'Informasi tidak tersedia' : 'Information not available')}
                    </p>
                    <div className="mt-2 text-xs text-blue-700 dark:text-blue-300 grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">{language === 'id' ? 'Durasi Maksimal:' : 'Maximum Duration:'}</span> {LEAVE_REGULATIONS[formData.leaveType]?.maxDuration} {language === 'id' ? 'hari' : 'days'}
                      </div>
                      {'minServiceYears' in LEAVE_REGULATIONS[formData.leaveType as keyof typeof LEAVE_REGULATIONS] && (
                        <div>
                          <span className="font-medium">{language === 'id' ? 'Masa Kerja Minimal:' : 'Minimum Service:'}</span> {(LEAVE_REGULATIONS[formData.leaveType as keyof typeof LEAVE_REGULATIONS] as any).minServiceYears} {language === 'id' ? 'tahun' : 'years'}
                        </div>
                      )}
                      {'requiresDocument' in LEAVE_REGULATIONS[formData.leaveType as keyof typeof LEAVE_REGULATIONS] && 
                       (LEAVE_REGULATIONS[formData.leaveType as keyof typeof LEAVE_REGULATIONS] as any).requiresDocument && (
                        <div>
                          <span className="font-medium">{language === 'id' ? 'Dokumen Pendukung:' : 'Supporting Document:'}</span> {language === 'id' ? 'Diperlukan' : 'Required'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Durasi */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {language === 'id' ? 'Durasi (hari kerja)' : 'Duration (working days)'}
                <button 
                  type="button" 
                  title={language === 'id' ? 'Lihat Informasi Hari Kerja' : 'View Working Days Information'}
                  onClick={toggleNonWorkingDaysInfo}
                  className="ml-2 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  <AlertTriangle className="w-4 h-4 inline" />
                </button>
              </label>
              <input 
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                className={`w-full rounded border ${errors.duration ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              
              {/* Informasi Hari Libur dan Akhir Pekan */}
              {showNonWorkingDays && nonWorkingDaysInRange.length > 0 && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-md border border-amber-100 dark:border-amber-800/50">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-700 dark:text-amber-300">
                        {language === 'id' ? 'Hari Libur dalam Rentang Tanggal' : 'Holidays in Date Range'}
                      </h3>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                        {language === 'id'
                          ? 'Durasi cuti hanya menghitung hari kerja dan mengabaikan hari libur dan akhir pekan berikut:'
                          : 'Leave duration only counts working days and excludes the following holidays and weekends:'}
                      </p>
                      <div className="mt-2 text-xs text-gray-700 dark:text-gray-300 flex flex-wrap gap-1">
                        {nonWorkingDaysInRange.map((day, index) => (
                          <span key={index} className={`px-1.5 py-0.5 rounded-sm ${day.isWeekend ? 'bg-gray-100 dark:bg-gray-700' : day.isHoliday ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                            {day.date} 
                            {day.isWeekend 
                              ? (language === 'id' ? '(Akhir Pekan)' : '(Weekend)') 
                              : day.isHoliday 
                                ? (language === 'id' ? '(Libur Nasional)' : '(National Holiday)') 
                                : (language === 'id' ? '(Cuti Bersama)' : '(Collective Leave)')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* NIP */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{language === 'id' ? 'NIP' : 'Employee ID'}</label>
              <input
                type="text"
                name="employeeNip"
                value={formData.employeeNip}
                onChange={handleChange}
                readOnly
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 p-2"
              />
              {errors.employeeNip && <p className="text-red-500 text-sm mt-1">{errors.employeeNip}</p>}
            </div>
            
            {/* Masa Kerja */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {language === 'id' ? 'Masa Kerja (tahun)' : 'Service Period (years)'}
              </label>
              <input
                type="text"
                value={formData.serviceYears}
                readOnly
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 p-2"
              />
              {errors.serviceYears && (
                <p className="text-amber-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.serviceYears}
                </p>
              )}
            </div>
            
            {/* Quota Cuti Tahunan */}
            {formData.leaveType === 'Tahunan' && leaveQuota && (
              <div className="form-group">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {language === 'id' ? 'Quota Cuti Tahunan' : 'Annual Leave Quota'}
                </label>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md border border-blue-100 dark:border-blue-700/50">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">Total: {leaveQuota.annualTotal} {language === 'id' ? 'hari' : 'days'}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'id' ? 'Alokasi cuti tahunan' : 'Annual leave allocation'}</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md border border-amber-100 dark:border-amber-700/50">
                    <div className="font-semibold text-amber-700 dark:text-amber-300">{language === 'id' ? 'Terpakai: ' : 'Used: '}{leaveQuota.annualUsed} {language === 'id' ? 'hari' : 'days'}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'id' ? 'Cuti yang sudah digunakan' : 'Leave already taken'}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-md border border-green-100 dark:border-green-700/50">
                    <div className="font-semibold text-green-700 dark:text-green-300">{language === 'id' ? 'Sisa: ' : 'Remaining: '}{leaveQuota.annualRemaining} {language === 'id' ? 'hari' : 'days'}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'id' ? 'Cuti yang masih tersedia' : 'Available leave balance'}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tanggal Mulai */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {language === 'id' ? 'Tanggal Mulai' : 'Start Date'}
              </label>
              <div className="relative flex items-center">
                <DatePicker
                  selected={selectedStartDate}
                  onChange={handleStartDateChange}
                  dateFormat="dd/MM/yyyy"
                  className={`w-full rounded-l border ${errors.startDate ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  customInput={<input placeholder={language === 'id' ? 'Pilih tanggal' : 'Select date'} />}
                  highlightDates={[
                    {
                      "react-datepicker__day--highlighted-custom-1": nonWorkingDaysInRange.map(d => new Date(d.date))
                    }
                  ]}
                />
                <div className="p-2 rounded-r border border-l-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {errors.startDate && <p className="text-amber-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" /> {errors.startDate}
              </p>}
            </div>
            
            {/* Tanggal Selesai */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {language === 'id' ? 'Tanggal Selesai (Otomatis)' : 'End Date (Automatic)'}
              </label>
              <div className="relative flex items-center">
                <DatePicker
                  selected={selectedEndDate}
                  onChange={handleEndDateChange}
                  minDate={selectedStartDate || undefined}
                  dateFormat="dd/MM/yyyy"
                  className={`w-full rounded-l border ${errors.endDate ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  customInput={<input placeholder={language === 'id' ? 'Tanggal selesai otomatis' : 'Automatic end date'} />}
                  highlightDates={[
                    {
                      "react-datepicker__day--highlighted-custom-1": nonWorkingDaysInRange.map(d => new Date(d.date))
                    }
                  ]}
                  disabled={formData.duration > 0} // Disable tanggal akhir jika durasi sudah diisi
                />
                <div className="p-2 rounded-r border border-l-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              {formData.duration > 0 && selectedEndDate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                  {language === 'id' 
                    ? 'Tanggal selesai dihitung otomatis berdasarkan durasi dan tanggal mulai, dengan mempertimbangkan hari libur dan akhir pekan.'
                    : 'End date is calculated automatically based on duration and start date, considering holidays and weekends.'}
                </p>
              )}
            </div>
            
            {/* Alasan */}
            <div className="form-group col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {language === 'id' ? 'Alasan Cuti' : 'Leave Reason'}
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={`w-full rounded border ${errors.reason ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} p-2 h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder={language === 'id' ? 'Masukkan alasan cuti' : 'Enter leave reason'}
              ></textarea>
              {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
            </div>
            
            {/* Dokumen */}
            {formData.documentRequired && (
              <div className="form-group col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {language === 'id' ? 'Dokumen Pendukung' : 'Supporting Document'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    className={`w-full rounded border ${errors.document ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} p-2 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder={language === 'id' ? 'Nomor Dokumen / Keterangan' : 'Document Number / Description'}
                  />
                  <button
                    type="button"
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 flex items-center dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    <FileCheck className="w-4 h-4 mr-1" /> {language === 'id' ? 'Upload' : 'Upload'}
                  </button>
                </div>
                {errors.document && <p className="text-red-500 text-sm mt-1">{errors.document}</p>}
                <p className="text-gray-500 text-xs mt-1 dark:text-gray-400">
                  * {language === 'id' 
                      ? 'Dokumen pendukung seperti surat keterangan dokter untuk cuti sakit, atau surat keterangan lainnya.'
                      : 'Supporting documents such as medical certificates for sick leave, or other official documents.'}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {language === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-md hover:bg-emerald-600 dark:hover:bg-emerald-500 flex items-center transition-colors"
            >
              <FileCheck className="w-4 h-4 mr-1" /> {language === 'id' ? 'Simpan' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveForm;
