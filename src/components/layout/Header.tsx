import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, LogOut, Settings, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';
import LoginNotificationComponent from '../notifications/LoginNotification';
import { hasUnreadNotifications, markNotificationsAsRead } from '../../lib/notificationUtils';

interface HeaderProps {
  title: string;
  onLogout: () => void;
}

const Header = ({ title, onLogout }: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Use the theme context
  const { isDark, toggleTheme, language, toggleLanguage, profilePhoto } = useTheme();
  const { t } = useTranslation();
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  // State for re-rendering when language changes
  const [, setRefreshKey] = useState(0);
  
  const username = localStorage.getItem('username') || 'Admin';
  
  // Re-render when language changes
  useEffect(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, [language]);
  
  // Check for unread notifications
  useEffect(() => {
    // Initial check
    setHasUnread(hasUnreadNotifications());
    
    // Check for unread notifications periodically
    const interval = setInterval(() => {
      setHasUnread(hasUnreadNotifications());
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // Clear unread notifications when opening
    if (!showNotifications) {
      markNotificationsAsRead();
      setHasUnread(false);
    }
  };

  // Force refresh notification badge state
  const refreshUnreadStatus = () => {
    setHasUnread(hasUnreadNotifications());
  };

  return (
    <header className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg shadow-sm px-6 py-3 flex items-center justify-between fixed top-4 left-6 right-6 lg:left-28 z-50 border border-gray-200/30 dark:border-gray-700/30 rounded-xl">
      <div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">
          EmpDash
        </h1>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-colors"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        {/* Notifications */}
        <div className="relative" ref={notificationMenuRef}>
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-full bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 relative transition-colors"
          >
            <Bell size={18} />
            {hasUnread && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg py-2 z-10 border border-gray-200/30 dark:border-gray-700/30">
              <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('notifications')}
                </h3>
              </div>
              <LoginNotificationComponent onNotificationsChanged={refreshUnreadStatus} />
            </div>
          )}
        </div>
        
        {/* Profile dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={toggleProfileMenu}
            className="flex items-center space-x-2 p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center text-white font-medium">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="hidden md:block text-sm font-medium">{username}</span>
            <ChevronDown size={16} className="hidden md:block" />
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg py-2 z-10 border border-gray-200/30 dark:border-gray-700/30">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/30"
              >
                <User size={16} className="mr-2" />
                {t('profile')}
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/30"
              >
                <Settings size={16} className="mr-2" />
                {t('settings')}
              </Link>
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-1"></div>
              <button
                onClick={onLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50/70 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut size={16} className="mr-2" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;