import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RefreshCcw, User, Lock, EyeOff, Eye } from 'lucide-react';
import Captcha from './Captcha';
import { UserRole } from '../../types/auth';
import api from '../../lib/api';
import { addLoginNotification, getUserDeviceInfo } from '../../lib/notificationUtils';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { authenticateUser, cleanupInvalidCredentials } from '../../lib/auth';

interface LoginProps {
  onLogin: (username: string, password: string, role: UserRole) => boolean;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<any>(null);
  const navigate = useNavigate();
  const [showMockNotice, setShowMockNotice] = useState(false);
  const { language } = useTheme();
  const { t } = useTranslation();
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clean up invalid credentials when login page loads
    try {
      const result = cleanupInvalidCredentials();
      console.log('Cleaned up invalid credentials:', result);
    } catch (e) {
      console.error('Error cleaning up credentials:', e);
    }
    
    // Focus username input
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  const handleCaptchaChange = (value: string) => {
    setCaptchaText(value);
  };

  const refreshCaptcha = () => {
    if (captchaRef.current) {
      captchaRef.current.refresh();
      setUserCaptcha('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate input fields
    if (!username.trim()) {
      setError('Username harus diisi');
      return;
    }

    if (!password) {
      setError('Password harus diisi');
      return;
    }

    if (userCaptcha.toLowerCase() !== captchaText.toLowerCase()) {
      setError('CAPTCHA tidak valid');
      refreshCaptcha();
      return;
    }

    setLoading(true);

    try {
      // Gunakan fungsi authenticateUser untuk login
      const authResult = authenticateUser(username, password);
      
      // Rekam notifikasi login (berhasil atau gagal)
      addLoginNotification({
        username,
        success: authResult.success,
        userAgent: getUserDeviceInfo(),
        location: 'Jakarta, Indonesia', // Dalam implementasi nyata, bisa menggunakan geolocation API
        ip: '127.0.0.1' // Dalam implementasi nyata, bisa didapatkan dari backend
      });
      
      if (authResult.success && authResult.role) {
        // Generate token
        const mockToken = 'mock-token-' + Math.random().toString(36).substring(2);
        
        // Store token in localStorage
        localStorage.setItem('auth_token', mockToken);
        
        // Simpan password yang digunakan untuk login
        localStorage.setItem('demoPassword', password);
        localStorage.setItem('userPassword', password);
        
        // Log password tersimpan ke konsol
        console.log('Login successful, password saved:', {
          passwordLength: password.length,
          savedAs: {
            demoPassword: localStorage.getItem('demoPassword')?.length,
            userPassword: localStorage.getItem('userPassword')?.length
          }
        });
        
        // If app_settings doesn't exist in localStorage yet, create it
        // with default values including 2FA status (initially disabled)
        if (!localStorage.getItem('app_settings')) {
          const defaultSettings = {
            notifications: {
              email: true,
              browser: true,
              mobile: false,
              updates: true,
              newsletter: false
            },
            appearance: {
              theme: 'light',
              fontSize: 'sedang',
              language: 'id'
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
              sessionTimeout: 30
            },
            storage: {
              cacheEnabled: true,
              offlineMode: false,
              autoBackup: true,
              storageQuota: 100,
              dataRetention: 90
            }
          };
          
          localStorage.setItem('app_settings', JSON.stringify(defaultSettings));
        }
        
        onLogin(username, password, authResult.role);
      } else {
        setError(authResult.message || 'Username atau password salah');
      }
    } catch (error) {
      setError('Terjadi kesalahan pada server. Silahkan coba lagi nanti.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:bg-gray-900 dark:bg-none relative">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-30 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-20 h-96 w-96 rounded-full bg-emerald-300 mix-blend-multiply blur-3xl"></div>
        <div className="absolute top-40 -left-20 h-96 w-96 rounded-full bg-emerald-200 mix-blend-multiply blur-3xl"></div>
      </div>
      
      {showMockNotice && (
        <div className="fixed top-0 left-0 right-0 bg-emerald-100 text-emerald-800 p-3 z-50 flex items-center justify-between">
          <div className="flex-1 text-center">
            <span className="font-medium">{t('demo_mode')}:</span> {t('login_demo_message')}
          </div>
          <button 
            onClick={() => setShowMockNotice(false)}
            className="p-1 hover:bg-emerald-200 rounded-full"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="w-full max-w-md z-10 relative">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 border border-emerald-200 dark:border-emerald-800">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">EmpDash</h1>
            <p className="text-gray-700 dark:text-gray-300 font-medium">{t('app_name')}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('login_message')}</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('username')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                  placeholder={language === 'id' ? "Masukkan username" : "Enter username"}
                  ref={usernameInputRef}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                  placeholder={language === 'id' ? "Masukkan password" : "Enter password"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400 hover:text-emerald-500" />
                  ) : (
                    <Eye size={18} className="text-gray-400 hover:text-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="captcha" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                CAPTCHA {t('verification')}
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm">
                    <Captcha 
                      ref={captchaRef} 
                      onChange={handleCaptchaChange} 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors text-emerald-600 dark:text-emerald-300"
                  >
                    <RefreshCcw size={20} />
                  </button>
                </div>
                <input
                  id="captcha"
                  type="text"
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                  placeholder="Masukkan kode diatas"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t('remember_me')}
                </label>
              </div>

              <div className="text-sm">
                <Link to="#" className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500">
                  {t('forgot_password')}
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? (language === 'id' ? "Memproses..." : "Processing...") : t('login')}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('no_account')}? 
            <Link to="/register" className="ml-1 font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;