import { useState, useEffect, useMemo } from 'react';
import { Employee } from '../../lib/EmployeeContext';
import { useSidebar } from '../../lib/SidebarContext';
import { X, Check, User, Upload } from 'lucide-react';
import { compressImage, validateImageFile } from '../../lib/imageUtils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale/id';
registerLocale('id', id);

interface AddEmployeeFormProps {
  onClose: () => void;
  onSubmit: (employeeData: Omit<Employee, 'id'>) => Promise<Employee>;
}

const AddEmployeeForm = ({ onClose, onSubmit }: AddEmployeeFormProps) => {
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    gender: 'male',
    birthDate: '',
    employeeType: 'pns',
    joinDate: '', // Tanggal masuk kerja untuk NON ASN
    appointmentDate: '', // TMT Pengangkatan untuk ASN
    workUnit: '',
    position: '',
    rank: '',
    class: '',
    educationLevel: 's1',
    educationMajor: '',
    educationInstitution: '',
    graduationYear: '',
    email: '',
    phoneNumber: '',
    address: '',
    photo: null as File | null,
    status: 'Aktif',
    positionHistory: '',
    notes: '',
    jobType: '', // Jenis Jabatan
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tempProfilePhoto, setTempProfilePhoto] = useState<string | null>(null);
  
  // Get sidebar state from context
  const { expanded } = useSidebar();
  
  // Compute modal container class based on sidebar state
  const modalContainerClass = useMemo(() => 
    expanded ? 'modal-container' : 'modal-container-collapsed'
  , [expanded]);
  
  // Track sidebar changes
  useEffect(() => {
    // Create a mutation observer to watch for sidebar class changes
    const observer = new MutationObserver(() => {
      // Re-render the component when sidebar class changes
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

  // Helper function to get BUP based on jobType
  const getBUP = (jobType: string): number => {
    switch (jobType) {
      case 'pimpinan_tinggi_madya':
      case 'pimpinan_tinggi_pratama':
      case 'fungsional_ahli_madya':
        return 60;
      case 'fungsional_ahli_utama':
        return 65;
      case 'fungsional_ahli_pertama_muda':
      case 'administrasi':
      default:
        return 58;
    }
  };

  // Helper function to calculate remaining service period
  const calculateRemainingService = (birthDate: string, jobType: string): number | null => {
    if (!birthDate || !jobType) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    const bup = getBUP(jobType);
    
    // Calculate age
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, bup - age);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validasi umum untuk semua tipe pegawai
    if (!formData.name.trim()) {
      newErrors.name = 'Nama pegawai harus diisi';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Jabatan harus diisi';
    }
    
    if (!formData.workUnit.trim()) {
      newErrors.workUnit = 'Unit kerja harus diisi';
    }
    
    if (formData.birthDate && !isValidDate(formData.birthDate)) {
      newErrors.birthDate = 'Format tanggal lahir tidak valid';
    }
    
    // NIP dan TMT Pengangkatan wajib untuk PNS dan PPPK
    if (formData.employeeType === 'pns' || formData.employeeType === 'pppk') {
      if (!formData.nip || !formData.nip.trim()) {
        newErrors.nip = 'NIP harus diisi';
      } else if (!/^\d{18}$/.test(formData.nip)) {
        newErrors.nip = 'NIP harus terdiri dari 18 digit angka';
      }
      
      if (!formData.appointmentDate) {
        newErrors.appointmentDate = 'TMT Pengangkatan harus diisi';
      } else if (!isValidDate(formData.appointmentDate)) {
        newErrors.appointmentDate = 'Format TMT Pengangkatan tidak valid';
      }
      
      // Validate jobType for ASN
      if (!formData.jobType) {
        newErrors.jobType = 'Jenis Jabatan harus dipilih';
      }
      
      // Calculate and validate remaining service period
      if (formData.birthDate && formData.jobType) {
        const remainingService = calculateRemainingService(formData.birthDate, formData.jobType);
        if (remainingService !== null && remainingService <= 0) {
          newErrors.birthDate = 'Pegawai sudah mencapai batas usia pensiun';
        }
      }
      
      // Validasi opsional untuk rank/pangkat untuk ASN
      if (formData.rank && formData.rank.trim() === '') {
        setFormData(prev => ({
          ...prev,
          rank: '' // Gunakan string kosong sebagai penanda
        }));
      }
      
      // Validasi opsional untuk class/golongan untuk ASN
      if (formData.class && formData.class.trim() === '') {
        setFormData(prev => ({
          ...prev,
          class: '' // Gunakan string kosong sebagai penanda
        }));
      }
    }
    
    // Tanggal Mulai Bekerja wajib untuk Non-ASN
    if (formData.employeeType === 'honorer') {
      // Reset fields khusus PNS/PPPK jika tipe pegawai adalah honorer
      setFormData(prev => ({
        ...prev,
        nip: '',
        rank: '',
        class: '',
        positionHistory: '',
        appointmentDate: ''
      }));
      
      if (!formData.joinDate) {
        newErrors.joinDate = 'Tanggal Mulai Bekerja harus diisi';
      } else if (!isValidDate(formData.joinDate)) {
        newErrors.joinDate = 'Format Tanggal Mulai Bekerja tidak valid';
      }
    }
    
    // Validasi fields pendidikan
    if (formData.educationLevel === '') {
      newErrors.educationLevel = 'Tingkat pendidikan harus dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper untuk validasi format tanggal
  const isValidDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate the image file using our utility function
      const validation = validateImageFile(file);
      
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          photo: validation.errorMessage || 'File tidak valid'
        }));
        return;
      }
      
      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });
      
      // Show processing indicator
      setErrors(prev => ({
        ...prev,
        photo: 'Sedang memproses gambar...'
      }));
      
      // Compress and set the image
      const processImage = async () => {
        try {
          // Set temporary file while processing
          setFormData(prev => ({
            ...prev,
            photo: file
          }));
          
          console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2) + ' MB');
          
          // Compress the image
          const { compressedFile, dataUrl } = await compressImage(file);
          
          console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2) + ' MB');
          
          // Update form data with compressed image
          setFormData(prev => ({
            ...prev,
            photo: compressedFile
          }));
          
          // Set preview image
          setTempProfilePhoto(dataUrl);
          
          // Clear processing message
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.photo;
            return newErrors;
          });
          
          // If compression was significant, show a success message
          if (file.size > compressedFile.size * 1.25) { // At least 25% smaller
            setErrors(prev => ({
              ...prev,
              photo: `Foto berhasil dikompresi ke ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
            }));
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              setErrors(prev => {
                const newErrors = { ...prev };
                if (newErrors.photo && newErrors.photo.includes('berhasil dikompresi')) {
                  delete newErrors.photo;
                }
                return newErrors;
              });
            }, 3000);
          }
        } catch (err) {
          console.error('Error processing image:', err);
          // Fallback to simple FileReader
          const reader = new FileReader();
          reader.onloadend = () => {
            setTempProfilePhoto(reader.result as string);
          };
          reader.readAsDataURL(file);
          
          setErrors(prev => ({
            ...prev,
            photo: 'Gagal memproses gambar, menggunakan file asli'
          }));
        }
      };
      
      processImage();
    }
  };

  // Helper to convert Date to yyyy-mm-dd
  const toYMD = (date: Date | null) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Format data sebelum dikirim
      const preparedData = prepareFormData();
      
      // Debug: log formData before submit
      console.log('Data yang dikirim ke Supabase:', preparedData);
      
      // Panggil onSubmit dan tangkap hasilnya
      try {
        const result = await onSubmit(preparedData);
        console.log('Data berhasil disimpan:', result);
        onClose();
      } catch (err: any) {
        console.error('Error saat menyimpan data:', err);
        setErrors(prev => ({
          ...prev,
          form: err.message || 'Terjadi kesalahan saat menyimpan data'
        }));
      }
    } catch (err: any) {
      console.error('Error unexpected dalam handleSubmit:', err);
      setErrors(prev => ({
        ...prev,
        form: err.message || 'Terjadi kesalahan saat menyimpan data'
      }));
    } finally {
      setSaving(false);
    }
  };
  
  // Helper to prepare form data before sending to Supabase
  const prepareFormData = () => {
    // Create a copy to avoid mutating the original
    let preparedData: Record<string, any> = { ...formData };
    
    // Make sure all dates are in ISO format
    if (preparedData.birthDate) {
      preparedData.birthDate = new Date(preparedData.birthDate).toISOString();
    }
    
    if (preparedData.appointmentDate) {
      preparedData.appointmentDate = new Date(preparedData.appointmentDate).toISOString();
    }
    
    if (preparedData.joinDate) {
      preparedData.joinDate = new Date(preparedData.joinDate).toISOString();
    }
    
    // Handle employee type specific data for Non-ASN
    if (preparedData.employeeType === 'honorer') {
      // Filter out fields specific to PNS/PPPK
      const fieldsToExclude = ['nip', 'rank', 'class', 'positionHistory', 'appointmentDate', 'jobType'];
      preparedData = Object.fromEntries(
        Object.entries(preparedData).filter(([key]) => !fieldsToExclude.includes(key))
      );
    }
    
    // Filter out empty string values
    preparedData = Object.fromEntries(
      Object.entries(preparedData).filter(([_, value]) => value !== '')
    );
    
    return preparedData as Omit<Employee, 'id'>;
  }
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-60 overflow-hidden bg-gray-900/40 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className={`fixed inset-0 ${modalContainerClass} flex items-center justify-center`}>
        <div className="fixed inset-0 transition-opacity" 
          aria-hidden="true" onClick={onClose}>
        </div>
        
        <div className="relative z-70 bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl w-full animate-scaleIn mx-4 my-4 border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              Tambah Pegawai Baru
            </h3>
            <button
              type="button"
              className="bg-white dark:bg-gray-700 rounded-full p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          
          {errors.form && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md text-sm flex items-center border border-red-200 dark:border-red-800">
              <X className="h-4 w-4 mr-2 flex-shrink-0" />
              {errors.form}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Left Column */}
              <div className="space-y-5">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <Upload className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                    Foto Profil
                  </h4>
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-3 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 flex items-center justify-center text-white font-medium shadow-md">
                      {tempProfilePhoto ? (
                        <img src={tempProfilePhoto} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">
                          {formData.name.charAt(0).toUpperCase() || 'A'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="rounded-md bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 cursor-pointer transition-colors border border-blue-200 dark:border-blue-800 text-center">
                        Pilih Foto
                        <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                      </label>
                      {tempProfilePhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempProfilePhoto(null);
                            setFormData(prev => ({
                              ...prev,
                              photo: null
                            }));
                          }}
                          className="rounded-md bg-red-50 dark:bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors border border-red-200 dark:border-red-800"
                        >
                          Hapus
                        </button>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ukuran maks. 5MB (akan dikompresi ke maks. 1MB)</p>
                      {errors.photo && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.photo}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Tipe Pegawai</h4>
                  
                  <div>
                    <label htmlFor="employeeType" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipe Pegawai <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="employeeType"
                      name="employeeType"
                      value={formData.employeeType}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                    >
                      <option value="pns">PNS</option>
                      <option value="pppk">PPPK</option>
                      <option value="honorer">Honorer (NON ASN)</option>
                    </select>
                  </div>

                  {/* Add jobType dropdown after employeeType */}
                  {(formData.employeeType === 'pns' || formData.employeeType === 'pppk') && (
                    <div>
                      <label htmlFor="jobType" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jenis Jabatan <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="jobType"
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        required
                        className={`block w-full rounded-md border ${errors.jobType ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm`}
                      >
                        <option value="">Pilih Jenis Jabatan</option>
                        <option value="pimpinan_tinggi_madya">Pimpinan Tinggi Ahli Madya</option>
                        <option value="pimpinan_tinggi_pratama">Pimpinan Tinggi Pratama</option>
                        <option value="fungsional_ahli_utama">Fungsional Ahli Utama</option>
                        <option value="fungsional_ahli_madya">Fungsional Ahli Madya</option>
                        <option value="fungsional_ahli_pertama">Fungsional Ahli Pertama</option>
                        <option value="fungsional_ahli_muda">Fungsional Ahli Muda</option>
                        <option value="administrasi">Administrasi</option>
                      </select>
                      {errors.jobType && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.jobType}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Informasi Pribadi</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full rounded-md border ${errors.name ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
                      )}
                    </div>
                    
                    {/* NIP hanya ditampilkan untuk PNS dan PPPK */}
                    {(formData.employeeType === 'pns' || formData.employeeType === 'pppk') && (
                      <div>
                        <label htmlFor="nip" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          NIP <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="nip"
                          name="nip"
                          value={formData.nip}
                          onChange={handleChange}
                          className={`block w-full rounded-md border ${errors.nip ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
                          placeholder="Contoh: 199201012020011001"
                        />
                        {errors.nip && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.nip}</p>
                        )}
                      </div>
                    )}
                    
                    {/* TMT Pengangkatan hanya untuk PNS dan PPPK */}
                    {(formData.employeeType === 'pns' || formData.employeeType === 'pppk') && (
                      <div>
                        <label htmlFor="appointmentDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          TMT Pengangkatan <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          id="appointmentDate"
                          locale="id"
                          dateFormat="dd MMMM yyyy"
                          selected={formData.appointmentDate ? new Date(formData.appointmentDate) : null}
                          onChange={(date: Date | null) => {
                            // @ts-ignore
                            handleChange({ target: { name: 'appointmentDate', value: toYMD(date) } });
                          }}
                          placeholderText="Pilih TMT Pengangkatan"
                          className={`block w-full rounded-md border ${errors.appointmentDate ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm`}
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          readOnly={false}
                        />
                        {errors.appointmentDate && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.appointmentDate}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Tanggal Mulai Bekerja untuk Non-ASN */}
                    {formData.employeeType === 'honorer' && (
                      <div>
                        <label htmlFor="joinDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tanggal Mulai Bekerja <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          id="joinDate"
                          locale="id"
                          dateFormat="dd MMMM yyyy"
                          selected={formData.joinDate ? new Date(formData.joinDate) : null}
                          onChange={(date: Date | null) => {
                            // @ts-ignore
                            handleChange({ target: { name: 'joinDate', value: toYMD(date) } });
                          }}
                          placeholderText="Pilih tanggal mulai bekerja"
                          className={`block w-full rounded-md border ${errors.joinDate ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm`}
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          readOnly={false}
                        />
                        {errors.joinDate && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.joinDate}</p>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="gender" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jenis Kelamin
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      >
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="birthDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tanggal Lahir
                      </label>
                      <DatePicker
                        selected={formData.birthDate ? new Date(formData.birthDate) : null}
                        onChange={(date) => {
                          setFormData(prev => ({
                            ...prev,
                            birthDate: date ? toYMD(date) : ''
                          }));
                          if (errors.birthDate) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.birthDate;
                              return newErrors;
                            });
                          }
                        }}
                        dateFormat="dd/MM/yyyy"
                        locale="id"
                        className={`block w-full rounded-md border ${errors.birthDate ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm`}
                        placeholderText="Pilih tanggal"
                        readOnly={false}
                      />
                      {errors.birthDate && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.birthDate}</p>
                      )}
                    </div>

                    {/* Add remaining service period display for ASN */}
                    {(formData.employeeType === 'pns' || formData.employeeType === 'pppk') && formData.birthDate && formData.jobType && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sisa Masa Kerja
                        </label>
                        <div className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm">
                          {(() => {
                            const remainingService = calculateRemainingService(formData.birthDate, formData.jobType);
                            if (remainingService === null) return 'Tidak dapat dihitung';
                            return `${remainingService} tahun`;
                          })()}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="status" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Cuti">Cuti</option>
                        <option value="Sakit">Sakit</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-5">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Informasi Kepegawaian</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="workUnit" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unit Kerja <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="workUnit"
                        name="workUnit"
                        value={formData.workUnit}
                        onChange={handleChange}
                        className={`block w-full rounded-md border ${errors.workUnit ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
                      />
                      {errors.workUnit && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.workUnit}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="position" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jabatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className={`block w-full rounded-md border ${errors.position ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
                      />
                      {errors.position && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.position}</p>
                      )}
                    </div>
                    
                    {/* Riwayat Jabatan hanya untuk PNS/PPPK */}
                    {(formData.employeeType === 'pns' || formData.employeeType === 'pppk') && (
                      <div>
                        <label htmlFor="positionHistory" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Riwayat Jabatan
                        </label>
                        <textarea
                          id="positionHistory"
                          name="positionHistory"
                          rows={2}
                          value={formData.positionHistory}
                          onChange={handleChange}
                          placeholder="Contoh: Kepala Seksi (2018-2020), Kepala Bidang (2020-sekarang)"
                          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                        />
                      </div>
                    )}
                    
                    {/* Pangkat/Golongan hanya untuk PNS/PPPK */}
                    {(formData.employeeType === 'pns' || formData.employeeType === 'pppk') && (
                      <div>
                        <label htmlFor="rank" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Pangkat/Golongan
                        </label>
                        <input
                          type="text"
                          id="rank"
                          name="rank"
                          value={formData.rank}
                          onChange={handleChange}
                          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Pendidikan</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="educationLevel" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tingkat Pendidikan
                      </label>
                      <select
                        id="educationLevel"
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      >
                        <option value="sd">SD</option>
                        <option value="smp">SMP</option>
                        <option value="sma">SMA/SMK</option>
                        <option value="d1">D1</option>
                        <option value="d2">D2</option>
                        <option value="d3">D3</option>
                        <option value="d4">D4</option>
                        <option value="s1">S1</option>
                        <option value="s2">S2</option>
                        <option value="s3">S3</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="educationMajor" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jurusan/Program Studi
                      </label>
                      <input
                        type="text"
                        id="educationMajor"
                        name="educationMajor"
                        value={formData.educationMajor}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="educationInstitution" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Institusi Pendidikan
                      </label>
                      <input
                        type="text"
                        id="educationInstitution"
                        name="educationInstitution"
                        value={formData.educationInstitution}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="graduationYear" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tahun Lulus
                      </label>
                      <input
                        type="text"
                        id="graduationYear"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        placeholder="Contoh: 2018"
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Kontak</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Alamat
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="notes" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Catatan Tambahan
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={2}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Catatan tambahan atau informasi penting lainnya"
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors inline-flex items-center"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeForm;