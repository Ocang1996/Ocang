import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, EyeOff, Eye, ShieldAlert } from 'lucide-react';
import { isSuperAdmin } from '../../lib/auth';
import { useTranslation } from '../../lib/useTranslation';

interface AddUserFormProps {
  onClose: () => void;
  onSubmit: (userData: {
    username: string;
    email: string;
    name: string;
    role: 'superadmin' | 'admin' | 'user';
    password: string;
  }) => void;
}

const AddUserForm = ({ onClose, onSubmit }: AddUserFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    role: 'user' as 'superadmin' | 'admin' | 'user',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password dan konfirmasi password tidak cocok';
    }
    
    // Check if username already exists
    const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    if (existingUsers.some((user: any) => user.username === formData.username)) {
      newErrors.username = 'Username sudah digunakan';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Submit the form
      const { confirmPassword, ...userData } = formData;
      onSubmit(userData);
    }
  };
  
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full`}>
          <div className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              {t('add_user')}
            </h3>
            <button
              type="button"
              className="bg-white dark:bg-gray-700 rounded-full p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('user_username')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-lg border ${errors.username ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
                    placeholder={`Masukkan ${t('user_username').toLowerCase()}`}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.username}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('user_email')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-lg border ${errors.email ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
                    placeholder={`Masukkan ${t('user_email').toLowerCase()}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
                )}
              </div>
              
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('user_name')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-lg border ${errors.name ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
                    placeholder={`Masukkan ${t('user_name').toLowerCase()}`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
                )}
              </div>
              
              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('user_role')}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 text-sm"
                >
                  <option value="user">{t('user_role_user')}</option>
                  <option value="admin">{t('user_role_admin')}</option>
                  {/* Only superadmin can create another superadmin */}
                  {isSuperAdmin() && <option value="superadmin">{t('user_role_superadmin')}</option>}
                </select>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-lg border ${errors.password ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
                    placeholder={`Masukkan ${t('password').toLowerCase()}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye size={18} className="text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Password minimal 6 karakter</p>
              </div>
              
              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('confirm_password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-lg border ${errors.confirmPassword ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
                    placeholder={t('confirm_password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye size={18} className="text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm; 