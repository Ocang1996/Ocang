import { useState, useEffect } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useSidebar } from '../../lib/SidebarContext';
import { Bell, Globe, Moon, Sun, User, Shield, Database, Save, AlertTriangle, Type, Key, Lock, Smartphone, FileText, LogOut, RefreshCw, Check, X, Eye, EyeOff, Fingerprint, UserCog } from 'lucide-react';
import { 
  applyTheme, 
  applyLanguage, 
  applyFontSize,
  getCurrentTheme, 
  getCurrentLanguage,
  getCurrentFontSize,
  initThemeListener, 
  ThemeType,
  Language,
  FontSize
} from '../../lib/theme';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { saveRecoveryEmail, verifyRecoveryEmail, clearAllSessions, logoutAllDevices, downloadUserData } from '../../lib/sessionUtils';
import UserManagementTab from './UserManagementTab';
import { isAdmin, isSuperAdmin, changePassword } from '../../lib/auth';

interface SettingsProps {
  onLogout: () => void;
}

type TabType = 'notifications' | 'appearance' | 'privacy' | 'account' | 'storage' | 'users';

const Settings = ({ onLogout }: SettingsProps) => {
  // Use our theme context and translation hook
  const { theme, language, fontSize, setTheme, setLanguage, setFontSize } = useTheme();
  const { t } = useTranslation();
  const { expanded } = useSidebar(); // Menggunakan sidebar context
  
  const [activeTab, setActiveTab] = useState<TabType>('appearance'); // Default to appearance tab
  const [passwordChangeCount, setPasswordChangeCount] = useState(0); // Track password changes
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      updates: true,
      newsletter: false
    },
    appearance: {
      theme: theme as string,
      fontSize: fontSize,
      language: language
    },
    privacy: {
      activityLogging: true,
      dataSharingConsent: false,
      useBiometrics: false,
      showLoginHistory: true,
      saveLoginInfo: true
    },
    account: {
      twoFactorEnabled: false,
      lastPasswordChange: '2023-04-15',
      loginNotifications: true,
      recoveryEmail: 'backup@example.com',
      sessionTimeout: 30, // minutes
      recoveryEmailVerified: false
    },
    storage: {
      cacheEnabled: true,
      offlineMode: false,
      autoBackup: true,
      storageQuota: 100, // in MB
      autoCleanup: false,
      dataRetention: 90 // days
    }
  });
  
  // Function to format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Format tanggal menjadi DD-MM-YYYY
      return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  useEffect(() => {
    // Load settings from local storage on mount
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        setSettings(prev => {
          const parsed = JSON.parse(savedSettings);
          
          // Jika format tanggal perubahan password tidak sesuai, konversi
          if (parsed.account && parsed.account.lastPasswordChange) {
            try {
              // Coba parse sebagai tanggal
              new Date(parsed.account.lastPasswordChange);
            } catch (e) {
              // Jika gagal, gunakan format tanggal saat ini
              parsed.account.lastPasswordChange = new Date().toISOString().split('T')[0];
            }
          }
          
          return {
            ...parsed,
            appearance: {
              ...parsed.appearance,
              theme: getCurrentTheme()
            }
          };
        });
      } catch (error) {
        console.error('Error parsing settings from localStorage:', error);
      }
    }
    
    // Initialize theme listener for system theme changes
    const cleanupListener = initThemeListener();
    return cleanupListener;
  }, []);
  
  // Refresh the account tab data when it becomes active or after password change
  useEffect(() => {
    if (activeTab === 'account') {
      // Check for updated password change date
      try {
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.account) {
            // Always update with the latest from localStorage
            setSettings(prev => ({
              ...prev,
              account: {
                ...prev.account,
                lastPasswordChange: parsed.account.lastPasswordChange || prev.account.lastPasswordChange
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error refreshing account data:', error);
      }
    }
  }, [activeTab, passwordChangeCount]);
  
  // Save settings to local storage when changed
  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);
  
  const handleToggleNotification = (type: string) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type as keyof typeof prev.notifications]
      }
    }));
  };
  
  const handleAppearanceChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }));
    
    // Apply settings changes immediately
    if (field === 'theme') {
      const themeValue = value as ThemeType;
      setTheme(themeValue);
    } else if (field === 'language') {
      const langValue = value as Language;
      setLanguage(langValue);
    } else if (field === 'fontSize') {
      const sizeValue = value as FontSize;
      setFontSize(sizeValue);
    }
  };
  
  const handleChangePassword = () => {
    // Reset state modal ubah kata sandi
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordErrors({});
    
    if (!currentPassword) {
      alert('Mohon masukkan password saat ini untuk melanjutkan');
      return;
    }
    
    // Tampilkan modal ubah kata sandi
    setShowChangePasswordModal(true);
  };
  
  const handleSaveNewPassword = () => {
    // Reset error
    const errors: {currentPassword?: string; newPassword?: string; confirmPassword?: string} = {};
    
    // Validasi password saat ini
    if (!currentPassword) {
      errors.currentPassword = 'Password saat ini diperlukan';
    }
    
    // Validasi password baru
    if (!newPassword) {
      errors.newPassword = 'Password baru diperlukan';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password minimal 6 karakter';
    }
    
    // Validasi konfirmasi password
    if (!confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password diperlukan';
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    
    // Jika ada error, tampilkan dan hentikan proses
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    // Gunakan fungsi changePassword untuk mengganti password
    const result = changePassword(currentPassword, newPassword);
    
    if (result.success) {
      // Setelah password berhasil diubah, ambil data terbaru dari localStorage
      try {
        const appSettings = localStorage.getItem('app_settings');
        if (appSettings) {
          const parsed = JSON.parse(appSettings);
          if (parsed.account && parsed.account.lastPasswordChange) {
            // Update state settings dengan data dari localStorage
            setSettings(prev => ({
              ...prev,
              account: {
                ...prev.account,
                lastPasswordChange: parsed.account.lastPasswordChange
              }
            }));
            
            // Increment the password change counter to trigger the useEffect
            setPasswordChangeCount(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error('Error refreshing password change date:', error);
      }
      
      // Tutup modal
      setShowChangePasswordModal(false);
      alert(result.message);
      
      // Make sure we're on the account tab to see the updated date
      setActiveTab('account');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      // Tampilkan pesan error
      errors.currentPassword = result.message;
      setPasswordErrors(errors);
    }
  };
  
  // 2FA states
  const [twoFAStatus, setTwoFAStatus] = useState<'inactive' | 'setup' | 'active'>('inactive');
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupStep, setSetupStep] = useState<'scan' | 'verify'>('scan');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  
  // State untuk modal ubah kata sandi
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{currentPassword?: string; newPassword?: string; confirmPassword?: string}>({});
  
  // Login attempt detection (simplified for demo)
  const [recentLoginAttempts, setRecentLoginAttempts] = useState([
    { date: '2023-05-10 08:32:15', ip: '192.168.1.1', location: 'Jakarta, Indonesia', status: 'success', device: 'Chrome on Windows' },
    { date: '2023-05-09 17:45:22', ip: '203.142.114.89', location: 'Bandung, Indonesia', status: 'success', device: 'Mobile Android' },
    { date: '2023-05-07 23:14:08', ip: '115.178.220.45', location: 'Unknown', status: 'failed', device: 'Firefox on Mac' }
  ]);
  
  const handleTwoFASetup = () => {
    if (!currentPassword) {
      alert('Mohon masukkan password saat ini untuk melanjutkan');
      return;
    }
    // In a real app, validate the password on the server first
    setTwoFAStatus('setup');
    setShowTwoFAModal(true);
    setSetupStep('scan');
  };
  
  const handleTwoFAVerify = () => {
    // In a real app, validate the verification code with the backend
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      setTwoFAStatus('active');
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        account: {
          ...prev.account,
          twoFactorEnabled: true
        }
      }));
      
      // Make sure to also update localStorage immediately to ensure changes are persisted
      try {
        const appSettings = localStorage.getItem('app_settings');
        if (appSettings) {
          const parsedSettings = JSON.parse(appSettings);
          parsedSettings.account.twoFactorEnabled = true;
          localStorage.setItem('app_settings', JSON.stringify(parsedSettings));
        }
      } catch (error) {
        console.error('Error updating 2FA settings in localStorage:', error);
      }
      
      setShowTwoFAModal(false);
      alert('Autentikasi dua faktor telah berhasil diaktifkan!');
    } else {
      alert('Kode verifikasi tidak valid. Pastikan kode 6 digit dari aplikasi Google Authenticator.');
    }
  };
  
  const handleTwoFADisable = () => {
    if (!currentPassword) {
      alert('Mohon masukkan password saat ini untuk melanjutkan');
      return;
    }
    // In a real app, validate the password on the server first
    setTwoFAStatus('inactive');
    
    // Update local state
    setSettings(prev => ({
      ...prev,
      account: {
        ...prev.account,
        twoFactorEnabled: false
      }
    }));
    
    // Make sure to also update localStorage immediately to ensure changes are persisted
    try {
      const appSettings = localStorage.getItem('app_settings');
      if (appSettings) {
        const parsedSettings = JSON.parse(appSettings);
        parsedSettings.account.twoFactorEnabled = false;
        localStorage.setItem('app_settings', JSON.stringify(parsedSettings));
      }
    } catch (error) {
      console.error('Error updating 2FA settings in localStorage:', error);
    }
    
    alert('Autentikasi dua faktor telah dinonaktifkan');
  };
  
  const generateQRCode = () => {
    // In a real app, this QR code URL would be generated by the backend
    // Format for OTP Auth: otpauth://totp/Label?secret=SECRETKEY&issuer=IssuerName
    const username = localStorage.getItem('username') || 'admin@asn-dashboard.com';
    const secret = 'JBSWY3DPEHPK3PXP'; // Example secret key, should be from backend
    const issuer = 'ASN Dashboard';
    const otpAuthURL = `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;
    
    // In a real implementation, we would use a QR code library to generate this
    // This is a placeholder image for demonstration
    return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(otpAuthURL);
  };
  
  const handlePrivacyToggle = (type: string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type as keyof typeof prev.privacy]
      }
    }));
  };
  
  const handleStorageChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      storage: {
        ...prev.storage,
        [field]: value
      }
    }));
    
    // Display notification for low storage quota
    if (field === 'storageQuota' && value < 100) {
      alert('Peringatan: Kuota penyimpanan rendah dapat menyebabkan keterbatasan fitur aplikasi.');
    }
    
    // Simpan ke localStorage saat pengaturan berubah
    setTimeout(() => {
      localStorage.setItem('app_settings', JSON.stringify({
        ...settings,
        storage: {
          ...settings.storage,
          [field]: value
        }
      }));
    }, 100);
  };

  // Save settings
  const handleSaveSettings = () => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    alert('Pengaturan berhasil disimpan!');
  };

  // Pada bagian akun dan pengaturan waktu habis sesi
  const handleSessionTimeoutChange = (minutes: number) => {
    setSettings(prev => ({
      ...prev,
      account: {
        ...prev.account,
        sessionTimeout: minutes
      }
    }));
    
    // Simpan ke localStorage segera
    try {
      const appSettings = localStorage.getItem('app_settings');
      if (appSettings) {
        const parsedSettings = JSON.parse(appSettings);
        parsedSettings.account.sessionTimeout = minutes;
        localStorage.setItem('app_settings', JSON.stringify(parsedSettings));
      }
    } catch (error) {
      console.error('Error updating session timeout in localStorage:', error);
    }
  };

  // Fungsi untuk menangani verifikasi email
  const handleVerifyEmail = async () => {
    const email = settings.account.recoveryEmail;
    
    if (!email || !email.includes('@')) {
      alert('Masukkan alamat email yang valid.');
      return;
    }
    
    try {
      // Simpan email terlebih dahulu
      saveRecoveryEmail(email);
      
      // Tampilkan loading state
      const verifyButton = document.getElementById('verify-email-button');
      if (verifyButton) {
        verifyButton.textContent = 'Memverifikasi...';
        verifyButton.setAttribute('disabled', 'true');
      }
      
      // Panggil verifikasi email
      const success = await verifyRecoveryEmail(email);
      
      if (success) {
        alert('Email verifikasi telah dikirim ke ' + email);
        // Update UI untuk menunjukkan email sudah diverifikasi
        setSettings(prev => ({
          ...prev,
          account: {
            ...prev.account,
            recoveryEmailVerified: true
          }
        }));
      } else {
        alert('Gagal mengirim email verifikasi. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error during email verification:', error);
      alert('Terjadi kesalahan saat memverifikasi email.');
    } finally {
      // Reset button state
      const verifyButton = document.getElementById('verify-email-button');
      if (verifyButton) {
        verifyButton.textContent = 'Verifikasi';
        verifyButton.removeAttribute('disabled');
      }
    }
  };

  // Tambahkan fungsi untuk handle aksi akun
  const handleClearAllSessions = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua sesi aktif? Anda perlu login kembali setelah ini.')) {
      clearAllSessions();
      alert('Semua sesi telah dihapus. Anda akan dialihkan ke halaman login.');
      setTimeout(() => {
        onLogout();
      }, 1500);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari semua perangkat?')) {
      try {
        const success = await logoutAllDevices();
        if (success) {
          alert('Anda telah keluar dari semua perangkat. Anda akan dialihkan ke halaman login.');
          setTimeout(() => {
            onLogout();
          }, 1500);
        }
      } catch (error) {
        console.error('Error logging out from all devices:', error);
        alert('Terjadi kesalahan saat mencoba keluar dari semua perangkat.');
      }
    }
  };

  return (
    <div className="flex">
      <Sidebar onLogout={onLogout} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-[240px]' : 'ml-[88px] lg:ml-[104px]'} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
        <Header title={t('settings_title')} onLogout={onLogout} />
        
        <div className="w-full px-4 sm:px-6 md:px-10 pt-24 pb-8">
          <div className="mb-6 mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">
              {t('settings_title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Konfigurasi dan kelola pengaturan aplikasi ASN Dashboard
            </p>
          </div>

          {/* Settings Content */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
            <div className="md:flex">
              {/* Sidebar Settings */}
              <div className="md:w-64 p-5 border-r border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">{t('settings_title')}</h2>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => setActiveTab('notifications')}
                      className={`flex items-center w-full px-4 py-3 text-left rounded-lg ${activeTab === 'notifications' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <Bell size={18} className="mr-3" />
                      <span>{t('settings_notifications')}</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('appearance')}
                      className={`flex items-center w-full px-4 py-3 text-left rounded-lg ${activeTab === 'appearance' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      {settings.appearance.theme === 'dark' ? 
                        <Moon size={18} className="mr-3" /> : 
                        <Sun size={18} className="mr-3" />
                      }
                      <span>{t('settings_appearance')}</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('privacy')}
                      className={`flex items-center w-full px-4 py-3 text-left rounded-lg ${activeTab === 'privacy' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <Shield size={18} className="mr-3" />
                      <span>{t('settings_privacy')}</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('account')}
                      className={`flex items-center w-full px-4 py-3 text-left rounded-lg ${activeTab === 'account' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <User size={18} className="mr-3" />
                      <span>{t('settings_account')}</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('storage')}
                      className={`flex items-center w-full px-4 py-3 text-left rounded-lg ${activeTab === 'storage' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <Database size={18} className="mr-3" />
                      <span>{t('settings_storage')}</span>
                    </button>
                  </li>
                  {isSuperAdmin() && (
                    <li>
                      <button 
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center w-full px-4 py-3 text-left rounded-lg ${activeTab === 'users' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <UserCog size={18} className="mr-3" />
                        <span>{t('user_management')}</span>
                      </button>
                    </li>
                  )}
                </ul>
              </div>
              
              {/* Settings Content */}
              <div className="flex-1 p-6 pb-8">
                {/* Tab content heading */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {activeTab === 'notifications' && `${t('settings_notifications')}`}
                    {activeTab === 'appearance' && `${t('settings_appearance')}`}
                    {activeTab === 'privacy' && `${t('settings_privacy')}`}
                    {activeTab === 'account' && `${t('settings_account')}`}
                    {activeTab === 'storage' && `${t('settings_storage')}`}
                    {activeTab === 'users' && t('user_management')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activeTab === 'notifications' && 'Atur bagaimana Anda ingin diberitahu tentang aktivitas penting.'}
                    {activeTab === 'appearance' && 'Sesuaikan tampilan aplikasi sesuai preferensi Anda.'}
                    {activeTab === 'privacy' && 'Kelola bagaimana data Anda digunakan dan disimpan.'}
                    {activeTab === 'account' && 'Kelola informasi dan keamanan akun Anda.'}
                    {activeTab === 'storage' && 'Kelola penggunaan penyimpanan dan data offline.'}
                    {activeTab === 'users' && 'Kelola dan manajemen pengguna.'}
                  </p>
                </div>
                
                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifikasi Email</h3>
                      <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Notifikasi via Email</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Kirim pemberitahuan ke alamat email terdaftar</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.notifications.email} onChange={() => handleToggleNotification('email')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifikasi Browser</h3>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Notifikasi Desktop</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tampilkan notifikasi di browser Anda</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.notifications.browser} onChange={() => handleToggleNotification('browser')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Notifikasi Mobile</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Kirim notifikasi ke perangkat mobile</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.notifications.mobile} onChange={() => handleToggleNotification('mobile')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifikasi Lainnya</h3>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Update Aplikasi</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi saat ada versi baru aplikasi</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.notifications.updates} onChange={() => handleToggleNotification('updates')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Newsletter</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Berlangganan berita ASN dan fitur terbaru</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.notifications.newsletter} onChange={() => handleToggleNotification('newsletter')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings_theme')}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div 
                          className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${settings.appearance.theme === 'light' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          onClick={() => handleAppearanceChange('theme', 'light')}
                        >
                          <div className="flex items-center justify-center mb-3 h-14">
                            <Sun size={30} className="text-gray-800 dark:text-gray-200" />
                          </div>
                          <p className="font-medium text-center text-gray-800 dark:text-gray-200">{t('settings_theme_light')}</p>
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${settings.appearance.theme === 'dark' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          onClick={() => handleAppearanceChange('theme', 'dark')}
                        >
                          <div className="flex items-center justify-center mb-3 h-14">
                            <Moon size={30} className="text-gray-800 dark:text-gray-200" />
                          </div>
                          <p className="font-medium text-center text-gray-800 dark:text-gray-200">{t('settings_theme_dark')}</p>
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${settings.appearance.theme === 'system' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          onClick={() => handleAppearanceChange('theme', 'system')}
                        >
                          <div className="flex items-center justify-center mb-3 h-14">
                            <div className="relative">
                              <Sun size={24} className="text-gray-800 dark:text-gray-200 absolute -left-4" />
                              <Moon size={24} className="text-gray-800 dark:text-gray-200 absolute left-4" />
                            </div>
                          </div>
                          <p className="font-medium text-center text-gray-800 dark:text-gray-200">{t('settings_theme_system')}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings_language')}</h3>
                      <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Globe size={20} className="text-gray-600 dark:text-gray-400" />
                          <select 
                            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                            value={settings.appearance.language}
                            onChange={(e) => handleAppearanceChange('language', e.target.value)}
                          >
                            <option value="id">Bahasa Indonesia</option>
                            <option value="en">Inggris</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings_font_size')}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <button 
                          className={`border text-sm p-3 rounded-lg transition-all hover:shadow-sm ${settings.appearance.fontSize === 'kecil' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          onClick={() => handleAppearanceChange('fontSize', 'kecil')}
                        >
                          <Type size={14} className="inline-block mr-1" />
                          {t('settings_font_small')}
                        </button>
                        <button 
                          className={`border text-base p-3 rounded-lg transition-all hover:shadow-sm ${settings.appearance.fontSize === 'sedang' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          onClick={() => handleAppearanceChange('fontSize', 'sedang')}
                        >
                          <Type size={16} className="inline-block mr-1" />
                          {t('settings_font_medium')}
                        </button>
                        <button 
                          className={`border text-lg p-3 rounded-lg transition-all hover:shadow-sm ${settings.appearance.fontSize === 'besar' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          onClick={() => handleAppearanceChange('fontSize', 'besar')}
                        >
                          <Type size={18} className="inline-block mr-1" />
                          {t('settings_font_large')}
                        </button>
                      </div>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {t('settings_appearance')} - {t('settings_theme')}: {
                          settings.appearance.theme === 'light' ? t('settings_theme_light') :
                          settings.appearance.theme === 'dark' ? t('settings_theme_dark') :
                          t('settings_theme_system')
                        } | 
                        {t('settings_language')}: {settings.appearance.language === 'id' ? 'Bahasa Indonesia' : 'Inggris'} | 
                        {t('settings_font_size')}: {
                          settings.appearance.fontSize === 'kecil' ? t('settings_font_small') :
                          settings.appearance.fontSize === 'sedang' ? t('settings_font_medium') :
                          t('settings_font_large')
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data & Privasi</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Pencatatan Aktivitas</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Izinkan sistem mencatat aktivitas login dan penggunaan aplikasi</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.privacy.activityLogging} onChange={() => handlePrivacyToggle('activityLogging')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Persetujuan Berbagi Data</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Izinkan sistem berbagi data anonim untuk peningkatan layanan</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.privacy.dataSharingConsent} onChange={() => handlePrivacyToggle('dataSharingConsent')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Gunakan Biometrik</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Aktifkan login dengan sidik jari atau wajah (jika didukung perangkat)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.privacy.useBiometrics} onChange={() => handlePrivacyToggle('useBiometrics')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pengaturan Login</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Tampilkan Riwayat Login</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tampilkan daftar upaya login ke akun Anda</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.privacy.showLoginHistory} onChange={() => handlePrivacyToggle('showLoginHistory')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Simpan Informasi Login</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Simpan perangkat terpercaya untuk login yang lebih cepat</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.privacy.saveLoginInfo} onChange={() => handlePrivacyToggle('saveLoginInfo')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    {settings.privacy.showLoginHistory && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Riwayat Login Terakhir</h3>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Waktu</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lokasi</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Perangkat</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {recentLoginAttempts.map((attempt, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/30'}>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{attempt.date}</td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    {attempt.location} <span className="text-xs text-gray-500 dark:text-gray-400">({attempt.ip})</span>
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{attempt.device}</td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      attempt.status === 'success' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                      {attempt.status === 'success' ? 'Berhasil' : 'Gagal'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Keamanan Akun</h3>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Password</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Terakhir diubah: {formatDate(settings.account.lastPasswordChange)}
                            </p>
                          </div>
                          <button 
                            onClick={handleChangePassword}
                            className="px-3 py-1 text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/30"
                          >
                            Ubah Password
                          </button>
                        </div>
                        
                        <div className="mt-3">
                          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password Saat Ini
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock size={16} className="text-gray-400" />
                            </div>
                            <input
                              id="current-password"
                              type={showPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Masukkan password untuk mengubah pengaturan keamanan"
                              className="pl-10 pr-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 dark:bg-gray-700"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Autentikasi Dua Faktor</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {settings.account.twoFactorEnabled ? 
                                'Aktif - Login Anda dilindungi dengan Google Authenticator' : 
                                'Nonaktif - Aktifkan untuk keamanan tambahan'}
                            </p>
                          </div>
                          {settings.account.twoFactorEnabled ? (
                            <button 
                              onClick={handleTwoFADisable}
                              className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30"
                            >
                              Nonaktifkan
                            </button>
                          ) : (
                            <button 
                              onClick={handleTwoFASetup}
                              className="px-3 py-1 text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/30"
                            >
                              Aktifkan
                            </button>
                          )}
                        </div>
                        
                        <div className="mt-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                Autentikasi dua faktor menambahkan lapisan keamanan tambahan untuk akun Anda. Setelah diaktifkan, Anda akan memerlukan kode dari aplikasi Google Authenticator di samping password Anda untuk login.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pengaturan Lanjutan</h3>
                      
                      <div className="px-4 py-5 bg-white dark:bg-gray-800 space-y-6 rounded-lg shadow-sm">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2">
                            <div className="flex justify-between">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notifikasi Login
                              </label>
                              <button
                                type="button"
                                className={`${
                                  settings.account.loginNotifications
                                    ? 'bg-emerald-600 dark:bg-emerald-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
                                role="switch"
                                aria-checked={settings.account.loginNotifications}
                                onClick={() => 
                                  setSettings(prev => ({
                                    ...prev,
                                    account: {
                                      ...prev.account,
                                      loginNotifications: !prev.account.loginNotifications
                                    }
                                  }))
                                }
                              >
                                <span
                                  className={`${
                                    settings.account.loginNotifications ? 'translate-x-5' : 'translate-x-0'
                                  } pointer-events-none inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-100 shadow transform ring-0 transition ease-in-out duration-200`}
                                />
                              </button>
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Dapatkan notifikasi saat ada login baru di akun Anda.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pengaturan Lanjutan</h3>
                      
                      <div className="mb-4">
                        <label htmlFor="session-timeout" className="block text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
                          Waktu Habis Sesi
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Waktu tidak aktif sebelum diminta login kembali (dalam menit)
                        </p>
                        <select
                          id="session-timeout"
                          value={settings.account.sessionTimeout}
                          onChange={(e) => handleSessionTimeoutChange(parseInt(e.target.value))}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        >
                          <option value="15">15 menit</option>
                          <option value="30">30 menit</option>
                          <option value="60">1 jam</option>
                          <option value="120">2 jam</option>
                          <option value="240">4 jam</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="recovery-email" className="block text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
                          Email Pemulihan
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Email cadangan untuk pemulihan akun
                        </p>
                        <div className="flex">
                          <input
                            id="recovery-email"
                            type="email"
                            value={settings.account.recoveryEmail}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              account: {
                                ...prev.account,
                                recoveryEmail: e.target.value
                              }
                            }))}
                            className="flex-grow rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700"
                          />
                          <button
                            id="verify-email-button"
                            type="button"
                            onClick={handleVerifyEmail}
                            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Verifikasi
                          </button>
                        </div>
                        {settings.account.recoveryEmailVerified && (
                          <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                            <span className="inline-block w-4 h-4 mr-1 bg-green-500 rounded-full flex items-center justify-center text-white">✓</span>
                            Email terverifikasi
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tindakan Akun</h3>
                      
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={downloadUserData}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <FileText size={16} className="mr-2" />
                          Unduh Data Saya
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleClearAllSessions}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <RefreshCw size={16} className="mr-2" />
                          Hapus Semua Sesi
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleLogoutAllDevices}
                          className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/60"
                        >
                          <LogOut size={16} className="mr-2" />
                          Keluar Dari Semua Perangkat
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Storage Settings */}
                {activeTab === 'storage' && (
                  <div className="space-y-6">
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Penyimpanan Aplikasi</h3>
                      
                      <div className="bg-white dark:bg-gray-700/50 rounded-lg p-5 mb-6">
                        <label htmlFor="storage-slider" className="flex justify-between items-center mb-2">
                          <span className="text-base font-medium text-gray-800 dark:text-gray-200">Kuota Penyimpanan</span>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{settings.storage.storageQuota} MB</span>
                        </label>
                        <input
                          id="storage-slider"
                          type="range"
                          min="50"
                          max="500"
                          step="10"
                          value={settings.storage.storageQuota}
                          onChange={(e) => handleStorageChange('storageQuota', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>50 MB</span>
                          <span>250 MB</span>
                          <span>500 MB</span>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700/50 rounded-lg p-5 mb-6">
                        <label htmlFor="retention-slider" className="flex justify-between items-center mb-2">
                          <span className="text-base font-medium text-gray-800 dark:text-gray-200">Retensi Data</span>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{settings.storage.dataRetention} hari</span>
                        </label>
                        <input
                          id="retention-slider"
                          type="range"
                          min="30"
                          max="365"
                          step="30"
                          value={settings.storage.dataRetention}
                          onChange={(e) => handleStorageChange('dataRetention', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>30 hari</span>
                          <span>180 hari</span>
                          <span>365 hari</span>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700/50 rounded-lg p-5 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Aktifkan Cache</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Simpan data dalam cache untuk performa yang lebih baik</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={settings.storage.cacheEnabled} 
                              onChange={() => handleStorageChange('cacheEnabled', !settings.storage.cacheEnabled)} 
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-b pb-6 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Mode Offline</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Aktifkan Mode Offline</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Akses aplikasi saat tidak ada koneksi internet</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.storage.offlineMode} 
                            onChange={() => handleStorageChange('offlineMode', !settings.storage.offlineMode)} 
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Backup Otomatis Data</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Buat backup data secara otomatis saat bekerja offline</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.storage.autoBackup} 
                            onChange={() => handleStorageChange('autoBackup', !settings.storage.autoBackup)} 
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Manajemen Data</h3>
                      
                      <div className="bg-white dark:bg-gray-700/50 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Pembersihan Otomatis Cache</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Bersihkan cache secara otomatis saat kuota penyimpanan hampir penuh</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={settings.storage.autoCleanup} 
                              onChange={() => handleStorageChange('autoCleanup', !settings.storage.autoCleanup)} 
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus semua cache? Ini mungkin memperlambat aplikasi saat pertama kali memuat.')) {
                                alert('Cache telah dihapus');
                              }
                            }}
                            className="inline-flex items-center px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            Hapus Cache
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus semua data offline? Data yang belum disinkronkan akan hilang.')) {
                                alert('Data offline telah dihapus');
                              }
                            }}
                            className="inline-flex items-center px-5 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                          >
                            Hapus Data Offline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* User Management Tab */}
                {activeTab === 'users' && (
                  <UserManagementTab />
                )}
                
                {/* Simpan Pengaturan Button */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800 shadow-sm transition-colors"
                  >
                    <Save size={18} className="mr-2" />
                    {t('save')} {t('settings_title')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 2FA Setup Modal */}
      {showTwoFAModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-70 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                  onClick={() => setShowTwoFAModal(false)}
                >
                  <span className="sr-only">Tutup</span>
                  <X size={24} aria-hidden="true" />
                </button>
              </div>
              <div className="px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      {setupStep === 'scan' ? 'Aktifkan Autentikasi Dua Faktor' : 'Verifikasi Kode'}
                    </h3>
                    <div className="mt-4">
                      {setupStep === 'scan' ? (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Pindai kode QR ini dengan aplikasi Google Authenticator di ponsel Anda:
                          </p>
                          
                          <div className="flex justify-center mb-4">
                            <img src={generateQRCode()} alt="QR Code untuk Google Authenticator" className="h-48 w-48 bg-white p-2 rounded-lg" />
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Setelah memindai kode QR, Anda akan menerima kode 6 digit di aplikasi Google Authenticator. Kode ini akan berubah setiap 30 detik.
                          </p>
                          
                          <button
                            type="button"
                            onClick={() => setSetupStep('verify')}
                            className="w-full inline-flex justify-center items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            Lanjutkan ke Verifikasi
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Masukkan kode 6 digit dari aplikasi Google Authenticator:
                          </p>
                          
                          <div className="mb-4">
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                              placeholder="Kode 6 digit"
                              className="w-full px-3 py-2 text-lg text-center tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 dark:bg-gray-700"
                              maxLength={6}
                              pattern="[0-9]*"
                              inputMode="numeric"
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setSetupStep('scan')}
                              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              Kembali
                            </button>
                            <button
                              type="button"
                              onClick={handleTwoFAVerify}
                              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                              Verifikasi & Aktifkan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Ubah Kata Sandi */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Ubah Kata Sandi</h3>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Password Saat Ini */}
              <div>
                <label htmlFor="modal-current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="modal-current-password"
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`pl-10 pr-10 w-full rounded-lg border ${passwordErrors.currentPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 dark:bg-gray-700`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>
              
              {/* Password Baru */}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`pl-10 pr-10 w-full rounded-lg border ${passwordErrors.newPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 dark:bg-gray-700`}
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
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              
              {/* Konfirmasi Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 w-full rounded-lg border ${passwordErrors.confirmPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400`}
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
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewPassword}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;