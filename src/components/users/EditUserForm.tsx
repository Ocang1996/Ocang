import { useState, useEffect } from 'react';
import { X, User, Mail, UserCheck, ShieldAlert } from 'lucide-react';
import { isSuperAdmin, getCurrentUser } from '../../lib/auth';
import { useTranslation } from '../../lib/useTranslation';

interface EditUserFormProps {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: 'superadmin' | 'admin' | 'user';
  };
  onClose: () => void;
  onSubmit: (userData: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: 'superadmin' | 'admin' | 'user';
  }) => void;
}

const EditUserForm = ({ user, onClose, onSubmit }: EditUserFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role as 'superadmin' | 'admin' | 'user',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentUser = getCurrentUser();
  
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
    
    // If current user is editing themselves, prevent changing their own role
    if (currentUser && currentUser.username === user.username && formData.role !== user.role) {
      newErrors.role = 'Anda tidak dapat mengubah role Anda sendiri';
    }
    
    // Regular admin cannot promote user to admin or superadmin
    if (!isSuperAdmin() && 
        (formData.role === 'admin' || formData.role === 'superadmin') && 
        user.role === 'user') {
      newErrors.role = 'Anda tidak memiliki izin untuk menjadikan pengguna sebagai admin atau superadmin';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Submit the form
      onSubmit(formData);
    }
  };
  
  // Determine if role field should be disabled
  const isRoleDisabled = () => {
    // If editing self, disable role field
    if (currentUser && currentUser.username === user.username) {
      return true;
    }
    
    // If not superadmin and user is admin or superadmin, disable role field
    if (!isSuperAdmin() && (user.role === 'admin' || user.role === 'superadmin')) {
      return true;
    }
    
    return false;
  };
  
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full`}>
          <div className="bg-gradient-to-r from-amber-50 to-white dark:from-gray-700 dark:to-gray-800 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
              {t('edit_user')}
            </h3>
            <button
              type="button"
              className="bg-white dark:bg-gray-700 rounded-full p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-5">
              {/* Username (readonly) */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('user_username')}
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
                    readOnly
                    className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-500 dark:text-gray-400 shadow-sm bg-gray-50 dark:bg-gray-700 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Username tidak dapat diubah</p>
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
                    className={`pl-10 w-full rounded-lg border ${errors.email ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
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
                    className={`pl-10 w-full rounded-lg border ${errors.name ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400'} py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm`}
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
                  disabled={isRoleDisabled()}
                  className={`block w-full rounded-lg border ${
                    errors.role 
                    ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-amber-500 focus:border-amber-500'
                  } py-2 px-3 text-gray-900 dark:text-white shadow-sm focus:ring-2 dark:bg-gray-700 text-sm ${
                    isRoleDisabled() ? 'bg-gray-50 dark:bg-gray-700/70 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="user">{t('user_role_user')}</option>
                  <option value="admin">{t('user_role_admin')}</option>
                  {/* Only superadmin can assign superadmin role */}
                  {isSuperAdmin() && <option value="superadmin">{t('user_role_superadmin')}</option>}
                </select>
                {errors.role && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.role}</p>
                )}
                {isRoleDisabled() && !errors.role && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currentUser && currentUser.username === user.username 
                      ? 'Anda tidak dapat mengubah role Anda sendiri' 
                      : 'Anda tidak memiliki izin untuk mengubah role pengguna ini'}
                  </p>
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
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
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

export default EditUserForm; 