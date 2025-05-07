import { useState, useEffect, useRef } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { User, Mail, Phone, MapPin, Calendar, Shield, Key, Save, X, Upload, Camera, Trash2, Image, Eye, EyeOff, UserCheck, CheckCircle } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { changePassword, changeUsername } from '../../lib/auth';

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage = ({ onLogout }: ProfilePageProps) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Administrator',
    email: 'admin@employee-management.gov.id',
    phone: '021-5550123',
    address: 'Jl. Merdeka No. 123, Jakarta Pusat',
    birthDate: '1985-05-15',
    role: 'Administrator',
    joinDate: formatCurrentDate()
  });
  
  // State untuk password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State untuk mengubah username
  const [usernameData, setUsernameData] = useState({
    newUsername: '',
    password: ''
  });
  const [usernameErrors, setUsernameErrors] = useState<{
    newUsername?: string;
    password?: string;
  }>({});
  const [showUsernamePassword, setShowUsernamePassword] = useState(false);
  
  const [originalData, setOriginalData] = useState({...formData});
  const [tempProfilePhoto, setTempProfilePhoto] = useState<string | null>(null);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoMenuRef = useRef<HTMLDivElement>(null);
  
  // Get theme and translations
  const { language, profilePhoto, updateProfilePhoto } = useTheme();
  const { t } = useTranslation();
  
  // Load profile data from localStorage on component mount
  useEffect(() => {
    // Variabel untuk menyimpan data yang akan digunakan
    let updatedFormData = {...formData};
    let userProfileLoaded = false;
    
    // Coba ambil data dari user_profile terlebih dahulu (prioritas tertinggi)
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        updatedFormData = {
          ...updatedFormData,
          ...profileData
        };
        userProfileLoaded = true;
        console.log('Loaded profile data from user_profile:', profileData);
      } catch (error) {
        console.error('Error loading profile data from localStorage:', error);
      }
    }

    // Ambil username dan role hanya jika belum ada di user_profile
    const username = localStorage.getItem('username');
    if (username && (!userProfileLoaded || !updatedFormData.name)) {
      updatedFormData.name = username;
      console.log('Using username from login data:', username);
    }
    
    // Ambil role jika belum ada
    const userRole = localStorage.getItem('userRole');
    if (userRole && (!userProfileLoaded || !updatedFormData.role)) {
      updatedFormData.role = userRole;
      console.log('Using role from login data:', userRole);
    }
    
    // Update state dengan data yang telah dikumpulkan
    setFormData(updatedFormData);
    setOriginalData(updatedFormData);
    
  }, []);
  
  // Initialize tempProfilePhoto from global state when entering edit mode
  useEffect(() => {
    if (editMode) {
      setTempProfilePhoto(profilePhoto);
    }
  }, [editMode, profilePhoto]);
  
  // Force re-render when language changes
  useEffect(() => {
    // This will re-render the component when language changes
  }, [language]);
  
  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit, revert changes
      setFormData({...originalData});
      setTempProfilePhoto(profilePhoto); // Revert photo changes
      setUploadError(null);
    } else {
      // Enter edit mode, save original data
      setOriginalData({...formData});
      setTempProfilePhoto(profilePhoto); // Store current photo
    }
    setEditMode(!editMode);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = (e?: React.FormEvent) => {
    // Prevent default form submission if called from form
    if (e) e.preventDefault();
    
    // Pastikan struktur data valid
    const dataToSave = {
      ...formData
    };
    
    // Jangan paksa name selalu sama dengan username
    // Ini agar user bisa mengubah nama lengkap tanpa terpengaruh username
    
    // Save to localStorage
    try {
      localStorage.setItem('user_profile', JSON.stringify(dataToSave));
      console.log('Profile data saved successfully:', dataToSave);
    } catch (error) {
      console.error('Error saving profile data to localStorage:', error);
    }
    
    // In a real app, save changes to server
    setFormData(dataToSave);
    setOriginalData(dataToSave);
    updateProfilePhoto(tempProfilePhoto); // Update global profile photo state
    setEditMode(false);
    
    // Show success message
    alert('Profil berhasil disimpan!');
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("File selected:", file.name, "size:", file.size, "type:", file.type);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG, PNG, GIF, dll)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar (maks 5MB)');
      return;
    }
    
    // Create a URL for the selected image
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          console.log("File loaded successfully");
          setTempProfilePhoto(e.target.result as string); // Only update temp photo
          setIsPhotoMenuOpen(false);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setUploadError('Gagal membaca file. Silakan coba lagi.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadError('Terjadi kesalahan. Silakan coba lagi.');
    }
  };
  
  const openFileSelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Opening file selector");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Removing photo");
    setTempProfilePhoto(null); // Only update temp photo
    setIsPhotoMenuOpen(false);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const togglePhotoMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Toggling photo menu");
    setIsPhotoMenuOpen(!isPhotoMenuOpen);
  };
  
  // Close the photo menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(event.target as Node)) {
        setIsPhotoMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Tambahkan fungsi untuk handle perubahan input password
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset error untuk field ini saat user mengetik
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Fungsi untuk handle perubahan password
  const handleChangePassword = () => {
    // Reset errors
    setPasswordErrors({});
    
    // Validate passwords
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Password saat ini diperlukan';
      setPasswordErrors(errors);
      return;
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Password baru diperlukan';
      setPasswordErrors(errors);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password minimal 6 karakter';
      setPasswordErrors(errors);
      return;
    }
    
    if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = 'Password baru harus berbeda dengan password lama';
      setPasswordErrors(errors);
      return;
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password diperlukan';
      setPasswordErrors(errors);
      return;
    }
    
    if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
      setPasswordErrors(errors);
      return;
    }
    
    // All validations passed, change password
    console.log('Attempting to change password, current length:', passwordData.currentPassword.length);
    
    const result = changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.success) {
      // Tampilkan pesan sukses
      alert(result.message);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else {
      // Tampilkan pesan error
      setPasswordErrors({
        currentPassword: result.message
      });
    }
  };
  
  // Fungsi untuk handle perubahan input username
  const handleUsernameDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUsernameData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset error untuk field ini saat user mengetik
    if (usernameErrors[name as keyof typeof usernameErrors]) {
      setUsernameErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Fungsi untuk handle perubahan username
  const handleChangeUsername = () => {
    // Reset errors
    setUsernameErrors({});
    
    // Validate inputs
    const errors: {
      newUsername?: string;
      password?: string;
    } = {};
    
    if (!usernameData.newUsername) {
      errors.newUsername = 'Username baru diperlukan';
      setUsernameErrors(errors);
      return;
    }
    
    if (usernameData.newUsername.length < 3) {
      errors.newUsername = 'Username minimal 3 karakter';
      setUsernameErrors(errors);
      return;
    }
    
    if (!usernameData.password) {
      errors.password = 'Password diperlukan untuk verifikasi';
      setUsernameErrors(errors);
      return;
    }
    
    // All validations passed, change username
    console.log('Attempting to change username:', usernameData.newUsername);
    
    const result = changeUsername(usernameData.password, usernameData.newUsername);
    
    if (result.success) {
      // Tampilkan pesan sukses
      alert(result.message);
      
      // Dapatkan data profil saat ini
      let updatedProfileData = null;
      try {
        const existingProfile = localStorage.getItem('user_profile');
        updatedProfileData = existingProfile ? JSON.parse(existingProfile) : {...formData};
      } catch (error) {
        console.error('Error parsing existing profile data:', error);
        updatedProfileData = {...formData};
      }
      
      // Update nama dengan username baru
      updatedProfileData.name = usernameData.newUsername;
      
      // Simpan ke localStorage
      try {
        localStorage.setItem('user_profile', JSON.stringify(updatedProfileData));
        console.log('Profile data updated after username change:', updatedProfileData);
      } catch (error) {
        console.error('Error saving updated profile after username change:', error);
      }
      
      // Update state form data
      setFormData({
        ...formData,
        name: usernameData.newUsername
      });
      
      setOriginalData({
        ...formData,
        name: usernameData.newUsername
      });
      
      // Reset form
      setUsernameData({
        newUsername: '',
        password: ''
      });
      setShowUsernamePassword(false);
    } else {
      // Tampilkan pesan error
      if (result.message.toLowerCase().includes('password')) {
        setUsernameErrors({
          password: result.message
        });
      } else {
        setUsernameErrors({
          newUsername: result.message
        });
      }
    }
  };
  
  // Fungsi untuk mendapatkan tanggal saat ini dalam format YYYY-MM-DD
  function formatCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  
  // Fungsi untuk memformat tanggal ke format yang lebih mudah dibaca
  function formatDisplayDate(dateString: string) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Daftar nama bulan dalam Bahasa Indonesia
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      
      // Format: DD Bulan YYYY
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar onLogout={onLogout} />
      
      <div className="lg:ml-64 flex-1 flex flex-col overflow-hidden">
        <Header title={t('profile_title')} onLogout={onLogout} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('profile_title')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('profile_description')}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile summary card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden col-span-1">
              <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700">
                <div className="relative mx-auto w-24 h-24 rounded-full mb-4 overflow-hidden group" ref={photoMenuRef}>
                  {editMode ? (
                    // Show temp photo during edit mode
                    tempProfilePhoto ? (
                      <img 
                        src={tempProfilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-gray-300 dark:bg-gray-600">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                    )
                  ) : (
                    // Show actual profile photo in view mode
                    profilePhoto ? (
                      <img 
                        src={profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-gray-300 dark:bg-gray-600">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                    )
                  )}
                  
                  {/* Photo edit button - only shown in edit mode */}
                  {editMode && (
                    <button 
                      onClick={togglePhotoMenu}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      type="button"
                    >
                      <Camera className="text-white" size={24} />
                    </button>
                  )}
                  
                  {/* Photo menu dropdown */}
                  {isPhotoMenuOpen && editMode && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg overflow-hidden z-10">
                      <div className="py-1">
                        <button
                          onClick={openFileSelector}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          type="button"
                        >
                          <Upload size={16} className="mr-2" />
                          {tempProfilePhoto ? 'Ganti Foto' : 'Unggah Foto'}
                        </button>
                        
                        {tempProfilePhoto && (
                          <button
                            onClick={removePhoto}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                            type="button"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Hapus Foto
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {/* Direct upload button - only shown in edit mode */}
                {editMode && (
                  <button 
                    onClick={openFileSelector}
                    className="mt-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 text-sm flex items-center justify-center mx-auto"
                    type="button"
                  >
                    <Image size={16} className="mr-2" />
                    {tempProfilePhoto ? 'Ganti Foto' : 'Tambah Foto Profil'}
                  </button>
                )}

                {/* Display upload error if any */}
                {uploadError && (
                  <div className="mt-2 text-sm text-red-500 dark:text-red-400">
                    {uploadError}
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-4">{formData.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{formData.role}</p>
                <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">Administrator</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mt-0.5 text-gray-400 dark:text-gray-500 w-6">
                      <Mail size={16} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('email')}</p>
                      <p className="text-gray-800 dark:text-white">{formData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-0.5 text-gray-400 dark:text-gray-500 w-6">
                      <Phone size={16} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('phone')}</p>
                      <p className="text-gray-800 dark:text-white">{formData.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-0.5 text-gray-400 dark:text-gray-500 w-6">
                      <MapPin size={16} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('address')}</p>
                      <p className="text-gray-800 dark:text-white">{formData.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-0.5 text-gray-400 dark:text-gray-500 w-6">
                      <Calendar size={16} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('birth_date')}</p>
                      <p className="text-gray-800 dark:text-white">{formatDisplayDate(formData.birthDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-0.5 text-gray-400 dark:text-gray-500 w-6">
                      <Calendar size={16} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('join_date')}</p>
                      <p className="text-gray-800 dark:text-white">{formatDisplayDate(formData.joinDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile edit form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden lg:col-span-2">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('profile_info')}</h2>
                <button
                  onClick={handleEditToggle}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    editMode 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' 
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30'
                  }`}
                >
                  {editMode ? t('cancel_edit') : t('edit_profile')}
                </button>
              </div>
              
              <div className="p-6">
                <form className="space-y-6" onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!editMode}
                          className={`pl-10 w-full rounded-lg border ${
                            editMode 
                              ? 'border-gray-300 dark:border-gray-600' 
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                          } py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!editMode}
                          className={`pl-10 w-full rounded-lg border ${
                            editMode 
                              ? 'border-gray-300 dark:border-gray-600' 
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                          } py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editMode}
                          className={`pl-10 w-full rounded-lg border ${
                            editMode 
                              ? 'border-gray-300 dark:border-gray-600' 
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                          } py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('birth_date')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleChange}
                          disabled={!editMode}
                          className={`pl-10 w-full rounded-lg border ${
                            editMode 
                              ? 'border-gray-300 dark:border-gray-600' 
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                          } py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          disabled={!editMode}
                          className={`pl-10 w-full rounded-lg border ${
                            editMode 
                              ? 'border-gray-300 dark:border-gray-600' 
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                          } py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {editMode && (
                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save size={16} />
                        <span>{t('save_changes')}</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-800/70 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('change_password')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('current_password')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key size={16} className="text-gray-400" />
                      </div>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 w-full rounded-lg border ${passwordErrors.currentPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('new_password')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key size={16} className="text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 w-full rounded-lg border ${passwordErrors.newPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield size={16} className="text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 w-full rounded-lg border ${passwordErrors.confirmPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('change_password')}
                  </button>
                </div>
              </div>
              
              {/* Username change section */}
              <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                  <UserCheck className="mr-2 text-blue-500" size={20} />
                  Ubah Username
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username Baru</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="newUsername"
                        value={usernameData.newUsername}
                        onChange={handleUsernameDataChange}
                        placeholder="username_baru"
                        className={`pl-10 w-full rounded-lg border ${usernameErrors.newUsername ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                      />
                    </div>
                    {usernameErrors.newUsername && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{usernameErrors.newUsername}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password untuk Verifikasi</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key size={16} className="text-gray-400" />
                      </div>
                      <input
                        type={showUsernamePassword ? "text" : "password"}
                        name="password"
                        value={usernameData.password}
                        onChange={handleUsernameDataChange}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 w-full rounded-lg border ${usernameErrors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowUsernamePassword(!showUsernamePassword)}
                      >
                        {showUsernamePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {usernameErrors.password && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{usernameErrors.password}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleChangeUsername}
                    className="px-4 py-2 flex items-center bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Ubah Username
                  </button>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Setelah mengubah username, Anda akan perlu login kembali dengan username baru.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;