import { useState, useEffect } from 'react';
import { X, Calendar, Check, User } from 'lucide-react';
import { compressImage, validateImageFile } from '../../lib/imageUtils';

interface EditEmployeeFormProps {
  employee: any;
  onClose: () => void;
  onSubmit: (updatedEmployee: any) => Promise<any>;
}

const EditEmployeeForm = ({ employee, onClose, onSubmit }: EditEmployeeFormProps) => {
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    gender: 'male',
    birthDate: '',
    employeeType: 'pns',
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
    notes: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempProfilePhoto, setTempProfilePhoto] = useState<string | null>(null);
  
  // Add state to track sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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
  
  // Initialize form with employee data
  useEffect(() => {
    if (employee) {
      setFormData({
        nip: employee.nip || '',
        name: employee.name || '',
        gender: employee.gender || 'male',
        birthDate: employee.birthDate || '',
        employeeType: employee.employeeType || 'pns',
        workUnit: employee.workUnit || '',
        position: employee.position || '',
        rank: employee.rank || '',
        class: employee.class || '',
        educationLevel: employee.educationLevel || 's1',
        educationMajor: employee.educationMajor || '',
        educationInstitution: employee.educationInstitution || '',
        graduationYear: employee.graduationYear || '',
        email: employee.email || '',
        phoneNumber: employee.phoneNumber || '',
        address: employee.address || '',
        photo: null,
        status: employee.status || 'Aktif',
        positionHistory: employee.positionHistory || '',
        notes: employee.notes || ''
      });
      
      // Set temp photo if available
      if (employee.photo) {
        setTempProfilePhoto(employee.photo);
      }
    }
  }, [employee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate the image file using our utility function
      const validation = validateImageFile(file);
      
      if (!validation.isValid) {
        setError(validation.errorMessage || 'File tidak valid');
        return;
      }
      
      // Clear any previous errors
      setError(null);
      
      // Show processing indicator
      setError('Sedang memproses gambar...');
      
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
          setError(null);
          
          // If compression was significant, show a success message
          if (file.size > compressedFile.size * 1.25) { // At least 25% smaller
            setError(`Foto berhasil dikompresi ke ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              setError(prev => {
                if (prev && prev.includes('berhasil dikompresi')) {
                  return null;
                }
                return prev;
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
          
          setError('Gagal memproses gambar, menggunakan file asli');
        }
      };
      
      processImage();
    }
  };
  
  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: null
    }));
    setTempProfilePhoto(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Validasi tanggal
      if (formData.birthDate && !isValidDate(formData.birthDate)) {
        setError('Format tanggal lahir tidak valid');
        setSaving(false);
        return;
      }
      
      // Create updated employee data
      const updatedEmployee = {
        ...employee,
        nip: formData.nip,
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.birthDate,
        employeeType: formData.employeeType,
        workUnit: formData.workUnit,
        position: formData.position,
        rank: formData.rank,
        class: formData.class,
        educationLevel: formData.educationLevel,
        educationMajor: formData.educationMajor,
        educationInstitution: formData.educationInstitution,
        graduationYear: formData.graduationYear,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        status: formData.status,
        positionHistory: formData.positionHistory,
        notes: formData.notes,
        // Only update photo if there's a new one
        photo: tempProfilePhoto
      };
      
      await onSubmit(updatedEmployee);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
      setSaving(false);
    }
  };
  
  // Helper untuk validasi format tanggal
  const isValidDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  return (
    <div className="fixed inset-0 z-60 overflow-hidden bg-gray-900/40 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className={`fixed inset-0 ${sidebarCollapsed ? 'modal-container-collapsed' : 'modal-container'} flex items-center justify-center`}>
        <div className="fixed inset-0 transition-opacity" 
          aria-hidden="true" onClick={onClose}>
        </div>
        
        <div className="relative z-70 bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl w-full animate-scaleIn mx-4 my-4 border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              Edit Pegawai
            </h3>
            <button
              type="button"
              className="bg-white dark:bg-gray-700 rounded-full p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          
          {error && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md text-sm flex items-center border border-red-200 dark:border-red-800">
              <X className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Left Column */}
              <div className="space-y-5 md:col-span-1">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
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
                    <div className="flex space-x-2">
                      <label className="rounded-md bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 cursor-pointer transition-colors border border-blue-200 dark:border-blue-800">
                        Pilih Foto
                        <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                      </label>
                      {tempProfilePhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="rounded-md bg-red-50 dark:bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors border border-red-200 dark:border-red-800"
                        >
                          Hapus
                        </button>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ukuran maks. 5MB (akan dikompresi ke maks. 1MB)</p>
                      {error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
                      )}
                    </div>
                  </div>
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
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="nip" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        NIP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nip"
                        name="nip"
                        value={formData.nip}
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="gender" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jenis Kelamin
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      >
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Cuti">Cuti</option>
                        <option value="Sakit">Sakit</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="employeeType" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipe Pegawai
                      </label>
                      <select
                        id="employeeType"
                        name="employeeType"
                        value={formData.employeeType}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      >
                        <option value="pns">PNS</option>
                        <option value="pppk">PPPK</option>
                        <option value="honorer">Honorer</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-5 md:col-span-1">
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
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
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
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="positionHistory" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Riwayat Jabatan
                      </label>
                      <textarea
                        id="positionHistory"
                        name="positionHistory"
                        rows={2}
                        value={formData.positionHistory}
                        onChange={handleInputChange}
                        placeholder="Contoh: Kepala Seksi (2018-2020), Kepala Bidang (2020-sekarang)"
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="rank" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pangkat/Golongan
                      </label>
                      <input
                        type="text"
                        id="rank"
                        name="rank"
                        value={formData.rank}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        placeholder="Contoh: 2018"
                        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/30 flex justify-end space-x-3 px-6 py-4 mt-6 -mx-6 -mb-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 inline-flex items-center transition-colors"
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
                    Simpan Perubahan
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

export default EditEmployeeForm; 