import { useState, useEffect } from 'react';
import { KeyRound, User, RefreshCw, Info, RefreshCcw, AlertTriangle } from 'lucide-react';
import { changePassword, getCurrentUser, changeUsername, getCredentialsDebugInfo, cleanupInvalidCredentials, resetAllData } from '../../lib/auth';
import { useTranslation } from '../../lib/useTranslation'; 

const AccountTab = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [lastPasswordChange, setLastPasswordChange] = useState('');
  const [passwordChangeCount, setPasswordChangeCount] = useState(0);

  const { t } = useTranslation();
  
  // Load initial user data and password change date
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUsername(user.username);
    }
    
    loadPasswordChangeDate();
  }, []);
  
  // Refresh password change date when password is changed
  useEffect(() => {
    loadPasswordChangeDate();
  }, [passwordChangeCount]);
  
  // Function to load password change date from localStorage
  const loadPasswordChangeDate = () => {
    try {
      const appSettings = localStorage.getItem('app_settings');
      if (appSettings) {
        const settings = JSON.parse(appSettings);
        if (settings.account && settings.account.lastPasswordChange) {
          setLastPasswordChange(settings.account.lastPasswordChange);
        }
      }
    } catch (error) {
      console.error('Error loading last password change date:', error);
    }
  };
  
  // Format date for display from YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Password baru dan konfirmasi password tidak cocok');
      return;
    }
    
    const result = changePassword(oldPassword, newPassword);
    
    if (result.success) {
      setPasswordSuccess(result.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Increment counter to trigger useEffect for reloading password change date
      setPasswordChangeCount(prev => prev + 1);
      
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
      }, 2000);
    } else {
      setPasswordError(result.message);
    }
  };
  
  const handleSubmitUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess('');
    
    if (!newUsername || newUsername.trim().length < 3) {
      setUsernameError('Username baru harus minimal 3 karakter');
      return;
    }
    
    if (!usernamePassword) {
      setUsernameError('Password diperlukan untuk verifikasi');
      return;
    }
    
    const result = changeUsername(usernamePassword, newUsername);
    
    if (result.success) {
      setUsernameSuccess(result.message);
      setCurrentUsername(newUsername);
      setNewUsername('');
      setUsernamePassword('');
      
      setTimeout(() => {
        setShowUsernameForm(false);
        setUsernameSuccess('');
        window.location.reload(); // Reload untuk mengupdate UI
      }, 2000);
    } else {
      setUsernameError(result.message);
    }
  };
  
  const toggleDiagnostics = () => {
    setShowDiagnostics(!showDiagnostics);
    if (!showDiagnostics) {
      setDiagnosticInfo(getCredentialsDebugInfo());
    }
  };
  
  const handleCleanupCredentials = () => {
    const result = cleanupInvalidCredentials();
    setCleanupResult(result);
    
    // Refresh diagnostic info
    setDiagnosticInfo(getCredentialsDebugInfo());
  };
  
  const handleResetAll = () => {
    if (window.confirm('PERINGATAN: Ini akan menghapus semua data aplikasi dan mengembalikan ke kondisi awal. Lanjutkan?')) {
      const result = resetAllData();
      
      if (result.success) {
        alert(result.message);
        window.location.href = '/';
      } else {
        alert('Gagal: ' + result.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('settings_account')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings_title_notification')}</p>
      </div>
    
      <div className="space-y-4">
        {/* Password Change Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <div className="flex items-center">
                <KeyRound className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mr-2" />
                <h4 className="text-md font-medium text-gray-900 dark:text-white">{t('change_password')}</h4>
              </div>
              {lastPasswordChange && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                  Terakhir diubah: {formatDate(lastPasswordChange)}
                </p>
              )}
            </div>
            <button 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
            >
              {showPasswordForm ? 'Batal' : 'Ubah'}
            </button>
          </div>
          
          {passwordError && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-md">
              {passwordSuccess}
            </div>
          )}
          
          {showPasswordForm && (
            <form onSubmit={handleSubmitPassword} className="space-y-3">
              <div>
                <label htmlFor="old-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password Lama
                </label>
                <input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password Baru
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Konfirmasi Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Username Change Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Ubah Username</h4>
            </div>
            <button 
              onClick={() => setShowUsernameForm(!showUsernameForm)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {showUsernameForm ? 'Batal' : 'Ubah'}
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Username saat ini: <span className="font-medium text-gray-700 dark:text-gray-300">{currentUsername}</span>
          </p>
          
          {usernameError && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
              {usernameError}
            </div>
          )}
          
          {usernameSuccess && (
            <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-md">
              {usernameSuccess}
            </div>
          )}
          
          {showUsernameForm && (
            <form onSubmit={handleSubmitUsername} className="space-y-3">
              <div>
                <label htmlFor="new-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username Baru
                </label>
                <input
                  id="new-username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="username-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password (untuk verifikasi)
                </label>
                <input
                  id="username-password"
                  type="password"
                  value={usernamePassword}
                  onChange={(e) => setUsernamePassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Simpan Username
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Advanced Settings */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" /> 
            Pengaturan Lanjutan
          </h4>
          
          <div className="space-y-3">
            <button
              onClick={toggleDiagnostics}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Info className="h-4 w-4 mr-2" />
              {showDiagnostics ? 'Sembunyikan Diagnostik' : 'Tampilkan Diagnostik'}
            </button>
            
            {showDiagnostics && (
              <div className="mt-4">
                <div className="mb-3 flex space-x-2">
                  <button
                    onClick={handleCleanupCredentials}
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 dark:border-yellow-700 rounded-md shadow-sm text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Bersihkan Kredensial
                  </button>
                  
                  <button
                    onClick={handleResetAll}
                    className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Reset Semua Data
                  </button>
                </div>
                
                {cleanupResult && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-md">
                    <p>Hasil pembersihan:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Dihapus: {cleanupResult.cleaned}</li>
                      <li>Tersisa: {cleanupResult.remaining}</li>
                    </ul>
                  </div>
                )}
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 overflow-auto max-h-64">
                  <pre className="text-xs text-gray-700 dark:text-gray-300">
                    {JSON.stringify(diagnosticInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTab; 