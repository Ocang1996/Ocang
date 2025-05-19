import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  HelpCircle,
  Briefcase
} from 'lucide-react';

import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import { useEmployees } from '../../lib/EmployeeContext';
import { useSidebar } from '../../lib/SidebarContext';
import LeaveSidebar from '../leave/LeaveSidebar';

interface SidebarProps {
  onLogout: () => void;
  onExpandChange?: (expanded: boolean) => void;
}

const Sidebar = ({ onLogout, onExpandChange }: SidebarProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language } = useTheme();
  const { t } = useTranslation();
  const { selectedEmployee } = useEmployees();
  const { expanded, setExpanded } = useSidebar();
  
  // For re-render when language changes
  const [, setRefreshKey] = useState(0);
  
  const username = localStorage.getItem('username') || 'Admin';
  
  // Get current employee info for leave sidebar
  const currentEmployeeId = selectedEmployee?.id || localStorage.getItem('employeeId');
  const currentEmployeeName = selectedEmployee?.name || localStorage.getItem('employeeName') || username;
  
  // Handle sidebar expansion - trigger callback for parent to update margin
  const handleExpand = (expand: boolean) => {
    setExpanded(expand);
    localStorage.setItem('sidebarExpanded', expand ? 'true' : 'false');
    if (onExpandChange) onExpandChange(expand); // trigger parent update
  };
  
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
    { path: '/leave', name: t('nav_leave'), icon: <Briefcase size={20} /> },
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
            className="w-10 h-10 p-2 mr-2 bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-200/80 dark:hover:bg-emerald-800/40 relative overflow-hidden transition-all duration-500 ease-in-out transform hover:scale-105"
            style={{ transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${mobileOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                 style={{ transition: 'all 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6)' }}>
              <Menu size={20} />
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${mobileOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                 style={{ transition: 'all 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6)' }}>
              <X size={20} />
            </div>
            <div className="opacity-0"><Menu size={20} /></div>
          </button>
          <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">EmpDash</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 rounded-full hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 relative">
            <Bell size={18} />
          </button>
          {/* Tampilan profil akun dihapus dari mobile header */}
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

      {/* Employee Leave Widget for Desktop */}
      {currentEmployeeId && location.pathname !== '/leave' && (
        <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-10 w-72">
          <LeaveSidebar 
            employeeId={currentEmployeeId} 
            employeeName={currentEmployeeName} 
          />
        </div>
      )}
      
      {/* Desktop Responsive Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 ${expanded ? 'w-60' : 'w-20'} transition-all duration-400 ease-out bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-r border-gray-200/30 dark:border-gray-700/30 shadow-lg`}
        style={{ minHeight: '100vh' }}
      >
        <div className="flex-1 flex flex-col items-center py-6 px-2">
          <div className="py-6 px-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg transition-shadow duration-400 ease-out hover:shadow-xl">
            <div className="flex flex-col items-center space-y-2">
              <div className="mb-4 text-center w-full flex items-center justify-center relative">
                <button 
                  onClick={() => handleExpand(!expanded)}
                  className={`w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-all duration-500 ease-in-out relative overflow-hidden group ${expanded ? 'transform hover:scale-105 shadow-md' : 'absolute left-0 transform hover:scale-105'}`}
                  style={{ transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${expanded ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                       style={{ transition: 'all 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6)' }}>
                    <Menu size={20} />
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${expanded ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                       style={{ transition: 'all 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6)' }}>
                    <X size={20} />
                  </div>
                </button>
              </div>
              
              {navItems.map((item) => (
                <div 
                  key={item.path}
                  className="relative w-full"
                >
                  {!expanded ? (
                    // Compact view - navigates properly using react-router
                    <Link
                      to={item.path}
                      onClick={() => {
                        // Saat icon di sidebar diklik dalam keadaan collapsed, 
                        // kita akan expand sidebar untuk semua menu
                        handleExpand(true);
                      }}
                      className={`group cursor-pointer flex items-center justify-center w-10 h-10 rounded-full
                      ${isActive(item.path) 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 hover:text-emerald-600 dark:hover:text-emerald-400'
                      } transition-all duration-300`}
                      title={item.name}
                    >
                      <div className="flex items-center justify-center">
                        {item.icon}
                      </div>
                      
                      {/* Tooltip */}
                      <span className="absolute left-14 px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 shadow-md transition-opacity duration-200 pointer-events-none">
                        {item.name}
                      </span>
                    </Link>
                  ) : (
                    // Expanded view - clicking navigates to the page
                    <Link
                      to={item.path}
                      onClick={() => {
                        // Jika menu yang diklik adalah menu yang aktif (sedang dibuka),
                        // tutup sidebar, jika tidak biarkan tetap terbuka
                        if (isActive(item.path)) {
                          handleExpand(false);
                        }
                      }}
                      className={`flex items-center justify-start w-full px-2.5 h-10 rounded-xl
                      ${isActive(item.path) 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 hover:text-emerald-600 dark:hover:text-emerald-400'
                      } transition-all duration-300`}
                    >
                      <div className="flex items-center justify-center min-w-[28px]">
                        {item.icon}
                      </div>
                      
                      <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-400 ease-out">{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="relative w-full mt-4">
                {!expanded ? (
                  <div
                    onClick={() => handleExpand(true)}
                    className="group cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                    title={t('logout')}
                  >
                    <LogOut size={18} />
                    
                    {/* Tooltip */}
                    <span className="absolute left-14 px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 shadow-md transition-opacity duration-200 pointer-events-none">
                      {t('logout')}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onLogout();
                      // Tutup sidebar setelah logout
                      setTimeout(() => handleExpand(false), 100);
                    }}
                    className="flex items-center justify-start w-full px-2.5 h-10 rounded-xl bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center min-w-[28px]">
                      <LogOut size={18} />
                    </div>
                    
                    <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all">{t('logout')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
