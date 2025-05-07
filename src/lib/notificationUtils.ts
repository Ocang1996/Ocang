/**
 * Notifikasi Login - Utility Functions
 * 
 * Mengelola penyimpanan dan interaksi dengan notifikasi login
 */

import { APP_CONFIG } from './config';

// Key untuk penyimpanan notifikasi login di localStorage
const LOGIN_NOTIFICATIONS_KEY = 'asn_login_notifications';

// Interface untuk data login
export interface LoginNotification {
  id: string;
  timestamp: number;
  username: string;
  ip?: string;
  userAgent?: string;
  location?: string;
  success: boolean;
}

/**
 * Tambahkan notifikasi login baru
 */
export const addLoginNotification = (notification: Omit<LoginNotification, 'id' | 'timestamp'>): void => {
  // Cek apakah notifikasi diaktifkan
  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  const notifications = getLoginNotifications();
  
  const newNotification: LoginNotification = {
    id: generateId(),
    timestamp: Date.now(),
    ...notification
  };
  
  // Tambahkan notifikasi baru di depan array
  notifications.unshift(newNotification);
  
  // Batasi jumlah notifikasi yang disimpan (misal: 20 terakhir)
  const limitedNotifications = notifications.slice(0, 20);
  
  localStorage.setItem(LOGIN_NOTIFICATIONS_KEY, JSON.stringify(limitedNotifications));
};

/**
 * Ambil semua notifikasi login dari localStorage
 */
export const getLoginNotifications = (): LoginNotification[] => {
  const storedNotifications = localStorage.getItem(LOGIN_NOTIFICATIONS_KEY);
  if (!storedNotifications) return [];
  
  try {
    return JSON.parse(storedNotifications);
  } catch (error) {
    console.error('Error parsing login notifications:', error);
    return [];
  }
};

/**
 * Hapus notifikasi login berdasarkan ID
 */
export const removeLoginNotification = (id: string): void => {
  const notifications = getLoginNotifications();
  const filteredNotifications = notifications.filter(notification => notification.id !== id);
  localStorage.setItem(LOGIN_NOTIFICATIONS_KEY, JSON.stringify(filteredNotifications));
};

/**
 * Hapus semua notifikasi login
 */
export const clearAllLoginNotifications = (): void => {
  localStorage.setItem(LOGIN_NOTIFICATIONS_KEY, JSON.stringify([]));
};

/**
 * Tandai notifikasi sebagai telah dibaca
 */
export const markNotificationsAsRead = (): void => {
  const readNotificationsKey = 'asn_login_notifications_read';
  const notifications = getLoginNotifications();
  
  if (notifications.length > 0) {
    const latestTimestamp = notifications[0].timestamp;
    localStorage.setItem(readNotificationsKey, latestTimestamp.toString());
  }
};

/**
 * Cek apakah ada notifikasi yang belum dibaca
 */
export const hasUnreadNotifications = (): boolean => {
  const readNotificationsKey = 'asn_login_notifications_read';
  const lastReadTimestamp = localStorage.getItem(readNotificationsKey);
  
  if (!lastReadTimestamp) return true;
  
  const notifications = getLoginNotifications();
  if (notifications.length === 0) return false;
  
  // Cek apakah ada notifikasi setelah timestamp terakhir dibaca
  return notifications[0].timestamp > parseInt(lastReadTimestamp);
};

/**
 * Dapatkan pengaturan notifikasi
 */
export const getNotificationSettings = () => {
  const settingsKey = APP_CONFIG.STORAGE_KEYS.SETTINGS || 'asn_settings';
  const settingsString = localStorage.getItem(settingsKey);
  
  if (!settingsString) {
    // Default settings jika belum ada
    return { enabled: true };
  }
  
  try {
    const settings = JSON.parse(settingsString);
    return {
      enabled: settings.account?.loginNotifications !== false // Default true jika tidak ada
    };
  } catch (error) {
    console.error('Error parsing settings:', error);
    return { enabled: true };
  }
};

/**
 * Generate ID unik untuk notifikasi
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Dapatkan informasi tentang perangkat pengguna
 */
export const getUserDeviceInfo = (): string => {
  const userAgent = navigator.userAgent;
  let deviceInfo = 'Unknown device';
  
  // Deteksi sistem operasi
  if (userAgent.indexOf('Windows') !== -1) deviceInfo = 'Windows';
  else if (userAgent.indexOf('Mac') !== -1) deviceInfo = 'Mac';
  else if (userAgent.indexOf('Android') !== -1) deviceInfo = 'Android';
  else if (userAgent.indexOf('iOS') !== -1 || userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) 
    deviceInfo = 'iOS';
  else if (userAgent.indexOf('Linux') !== -1) deviceInfo = 'Linux';
  
  // Deteksi browser
  if (userAgent.indexOf('Chrome') !== -1) deviceInfo += ' - Chrome';
  else if (userAgent.indexOf('Firefox') !== -1) deviceInfo += ' - Firefox';
  else if (userAgent.indexOf('Safari') !== -1) deviceInfo += ' - Safari';
  else if (userAgent.indexOf('Edge') !== -1) deviceInfo += ' - Edge';
  else if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1) 
    deviceInfo += ' - Internet Explorer';
  
  return deviceInfo;
};

/**
 * Format waktu notifikasi menjadi relatif terhadap sekarang (mis. "5 menit yang lalu")
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Konversi ke detik, menit, jam, dan hari
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} hari yang lalu`;
  } else if (hours > 0) {
    return `${hours} jam yang lalu`;
  } else if (minutes > 0) {
    return `${minutes} menit yang lalu`;
  } else {
    return 'baru saja';
  }
}; 