import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCcw, User, Lock, Mail, EyeOff, Eye, ArrowLeft } from 'lucide-react';
import Captcha from './Captcha';
import { UserRole } from '../../types/auth';
import { registerUser } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

interface RegisterProps {
  onRegister?: (username: string, email: string, password: string) => boolean;
}

const Register = ({ onRegister }: RegisterProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<any>(null);
  const navigate = useNavigate();
  
  const { isDark, language } = useTheme();
  const { t } = useTranslation();

  const handleCaptchaChange = (value: string) => {
    setCaptchaText(value);
  };

  const refreshCaptcha = () => {
    if (captchaRef.current) {
      captchaRef.current.refresh();
      setUserCaptcha('');
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate input fields
    if (!username.trim()) {
      setError('Username harus diisi');
      return;
    }

    if (!email.trim()) {
      setError('Email harus diisi');
      return;
    }

    if (!validateEmail(email)) {
      setError('Format email tidak valid');
      return;
    }

    if (!name.trim()) {
      setError('Nama harus diisi');
      return;
    }

    if (!password) {
      setError('Password harus diisi');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (userCaptcha.toLowerCase() !== captchaText.toLowerCase()) {
      setError('CAPTCHA tidak valid');
      refreshCaptcha();
      return;
    }

    setLoading(true);

    try {
      // Menggunakan API service untuk pendaftaran
      const response = await registerUser({
        username,
        email,
        password,
        name
      });

      if (response.success) {
        setSuccess(response.message || 'Registrasi berhasil! Anda dapat login sekarang.');
        
        // Clear form
        setUsername('');
        setEmail('');
        setName('');
        setPassword('');
        setConfirmPassword('');
        setUserCaptcha('');
        refreshCaptcha();
        
        // Store new user in localStorage for demo purposes
        const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        existingUsers.push({
          username,
          email,
          name,
          password, // In a real app, this would be hashed
          role: 'user', // Default role
          created: new Date().toISOString()
        });
        localStorage.setItem('registered_users', JSON.stringify(existingUsers));
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || 'Terjadi kesalahan saat registrasi. Silahkan coba lagi.');
      }
    } catch (error) {
      setError('Terjadi kesalahan pada server. Silahkan coba lagi nanti.');
      console.error('Registration error:', error);
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

      <div className="w-full max-w-md z-10 relative">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 border border-emerald-200 dark:border-emerald-800">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">EmpDash</h1>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Buat Akun Baru</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Daftar untuk memulai menggunakan aplikasi</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
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
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                  placeholder="Masukkan email"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
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
                  placeholder="Masukkan password"
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimal 6 karakter</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                  placeholder="Konfirmasi password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} className="text-gray-400 hover:text-emerald-500" />
                  ) : (
                    <Eye size={18} className="text-gray-400 hover:text-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="captcha" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                CAPTCHA Verifikasi
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
                  placeholder="Masukkan kode di atas"
                />
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
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun? 
            <Link to="/login" className="ml-1 font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 