import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  Menu, 
  X,
  HelpCircle
} from 'lucide-react';
import { UserRole } from '../../types/auth';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

interface SidebarProps {
  onLogout: () => void;
  activeItem?: string;
  userRole?: UserRole;
}

const Sidebar = ({ onLogout, activeItem = 'dashboard', userRole = 'user' }: SidebarProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, language, profilePhoto } = useTheme();
  const { t } = useTranslation();
  
  // For re-render when language changes
  const [, setRefreshKey] = useState(0);
  
  const username = localStorage.getItem('username') || 'Admin';
  
  // Observer for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // ThemeContext handles dark mode state
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);
  
  // Re-render when language changes
  useEffect(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, [language]);
  
  // Navigation items
  const navItems = [
    { path: '/dashboard', name: t('nav_dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/employees', name: t('nav_employees'), icon: <Users size={20} /> },
    { path: '/reports', name: t('nav_reports'), icon: <FileText size={20} /> },
    { path: '/settings', name: t('nav_settings'), icon: <Settings size={20} /> },
    { path: '/help', name: t('nav_help'), icon: <HelpCircle size={20} /> },
  ];

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  // Check if link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="p-2 mr-2 bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 rounded-full hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20"
          >
            <Menu size={20} />
          </button>
          <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">EmpDash</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 rounded-full hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 relative">
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>
          <Link to="/profile" className="p-1 text-gray-600 dark:text-gray-300 rounded-full hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center text-white font-medium">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={toggleMobileMenu}></div>
        <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl flex flex-col h-full rounded-r-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">EmpDash</h2>
            <button onClick={toggleMobileMenu} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-2.5 text-base font-medium rounded-xl ${
                      isActive(item.path)
                        ? 'bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-700/70 shadow-sm">
                      {item.icon}
                    </div>
                    <span className="ml-3">{item.name}</span>
                    {isActive(item.path) && (
                      <span className="ml-auto w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => {
                onLogout();
                toggleMobileMenu();
              }}
              className="flex items-center w-full p-2.5 text-base font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-700/70 shadow-sm">
                <LogOut size={20} />
              </div>
              <span className="ml-3">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Fixed-width Sidebar with Tooltips */}
      <aside
        className="hidden lg:flex flex-col fixed left-6 top-1/2 -translate-y-1/2 z-30 w-16"
      >
        <div className="py-6 px-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="mb-4 text-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center text-white">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{username.charAt(0).toUpperCase()}</span>
              )}
              </div>
            </div>
            
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center justify-center w-10 h-10 rounded-full 
                ${isActive(item.path) 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
                title={item.name}
              >
                {item.icon}
                
                {/* Active Indicator */}
                {isActive(item.path) && (
                  <div className="absolute -right-1 transform translate-x-1/2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 dark:bg-emerald-400/70 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white dark:bg-emerald-300 shadow-md shadow-emerald-500/30 dark:shadow-emerald-500/50"></span>
                    </span>
                  </div>
                )}
                
                {/* Tooltip */}
                <span className="absolute left-14 px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 shadow-md transition-opacity duration-200 pointer-events-none">
                  {item.name}
                </span>
              </Link>
            ))}
            
            <button
              onClick={onLogout}
              className="group relative flex items-center justify-center w-10 h-10 mt-4 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
              title={t('logout')}
            >
              <LogOut size={18} />
              
              {/* Tooltip */}
              <span className="absolute left-14 px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 shadow-md transition-opacity duration-200 pointer-events-none">
                {t('logout')}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;