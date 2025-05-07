import React, { useState, useEffect } from 'react';
import { Bell, Clock, X, Shield, AlertTriangle, CheckCircle, Trash2, MapPin, Monitor, RefreshCw } from 'lucide-react';
import { 
  getLoginNotifications, 
  removeLoginNotification, 
  clearAllLoginNotifications,
  markNotificationsAsRead,
  hasUnreadNotifications,
  formatRelativeTime,
  LoginNotification
} from '../../lib/notificationUtils';

interface LoginNotificationProps {
  className?: string;
  onNotificationsChanged?: () => void;
}

const LoginNotificationComponent: React.FC<LoginNotificationProps> = ({ 
  className = '',
  onNotificationsChanged
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<LoginNotification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  // Load notifications when component mounts or when opened
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      markNotificationsAsRead();
      setHasUnread(false);
      // Notify parent component about the status change
      if (onNotificationsChanged) {
        onNotificationsChanged();
      }
    } else {
      // Check for unread notifications periodically when dropdown is closed
      const interval = setInterval(() => {
        const unreadStatus = hasUnreadNotifications();
        setHasUnread(unreadStatus);
        // Notify parent if status changed
        if (onNotificationsChanged) {
          onNotificationsChanged();
        }
      }, 60000); // Check every minute
      
      // Initial check
      setHasUnread(hasUnreadNotifications());
      
      return () => clearInterval(interval);
    }
  }, [isOpen, onNotificationsChanged]);

  const loadNotifications = () => {
    const loadedNotifications = getLoginNotifications();
    setNotifications(loadedNotifications);
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeLoginNotification(id);
    loadNotifications();
    // Notify parent about notification changes
    if (onNotificationsChanged) {
      onNotificationsChanged();
    }
  };

  const handleClearAll = () => {
    clearAllLoginNotifications();
    loadNotifications();
    // Notify parent about notification changes
    if (onNotificationsChanged) {
      onNotificationsChanged();
    }
  };

  const refreshNotifications = () => {
    loadNotifications();
    markNotificationsAsRead();
    setHasUnread(false);
    // Notify parent about notification changes
    if (onNotificationsChanged) {
      onNotificationsChanged();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell icon with indicator */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifikasi Login"
      >
        <Bell size={20} />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Bell size={16} className="mr-2 text-blue-500" />
              Notifikasi Login
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={refreshNotifications}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Muat ulang"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                <Shield size={24} className="mx-auto mb-2 opacity-50" />
                <p>Belum ada notifikasi login</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-750 relative"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3">
                        {notification.success ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <AlertTriangle size={20} className="text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {notification.success ? 'Login Berhasil' : 'Login Gagal'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          Username: {notification.username}
                        </p>
                        {notification.userAgent && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
                            <Monitor size={12} className="mr-1 inline" />
                            {notification.userAgent}
                          </p>
                        )}
                        {notification.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center mt-0.5">
                            <MapPin size={12} className="mr-1 inline" />
                            {notification.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
                          <Clock size={12} className="mr-1 inline" />
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full"
                        title="Hapus notifikasi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              >
                Hapus Semua Notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginNotificationComponent; 