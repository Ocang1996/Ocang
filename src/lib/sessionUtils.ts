/**
 * Session Utilities
 * Mengelola sesi pengguna, timeout, dan pemulihan akun
 */

import { APP_CONFIG } from './config';

// Key untuk menyimpan informasi timeout sesi
const SESSION_TIMEOUT_KEY = 'asn_session_timeout';
const SESSION_LAST_ACTIVITY_KEY = 'asn_last_activity';
const RECOVERY_EMAIL_KEY = 'asn_recovery_email';

/**
 * Mendapatkan durasi timeout dari pengaturan
 * @returns Waktu timeout dalam milidetik
 */
export const getSessionTimeout = (): number => {
  try {
    const appSettings = localStorage.getItem('app_settings');
    if (appSettings) {
      const settings = JSON.parse(appSettings);
      // Timeout dalam menit, konversi ke milidetik
      return (settings.account?.sessionTimeout || 30) * 60 * 1000;
    }
  } catch (error) {
    console.error('Error mendapatkan durasi timeout:', error);
  }
  
  // Default 30 menit jika tidak ada pengaturan
  return 30 * 60 * 1000;
};

/**
 * Inisialisasi sistem timeout sesi
 * @param logoutCallback Fungsi yang dipanggil saat sesi berakhir
 */
export const initSessionTimeout = (logoutCallback: () => void): (() => void) => {
  // Simpan waktu aktivitas terakhir
  const updateLastActivity = () => {
    localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, Date.now().toString());
  };
  
  // Periksa sesi saat ini
  const checkSession = () => {
    const lastActivity = localStorage.getItem(SESSION_LAST_ACTIVITY_KEY);
    if (!lastActivity) {
      updateLastActivity();
      return;
    }
    
    const timeout = getSessionTimeout();
    const now = Date.now();
    const timeSinceLastActivity = now - parseInt(lastActivity);
    
    // Jika tidak ada aktivitas melebihi timeout, lakukan logout
    if (timeSinceLastActivity > timeout) {
      logoutCallback();
    }
  };
  
  // Tandai aktivitas saat ini
  updateLastActivity();
  
  // Atur event listener untuk aktivitas pengguna
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  
  // Fungsi untuk menangani aktivitas
  const handleActivity = () => {
    updateLastActivity();
  };
  
  // Tambahkan event listener
  activityEvents.forEach(event => {
    window.addEventListener(event, handleActivity);
  });
  
  // Periksa sesi setiap 60 detik
  const intervalId = setInterval(checkSession, 60 * 1000);
  
  // Fungsi untuk membersihkan event listener saat komponen unmount
  return () => {
    clearInterval(intervalId);
    activityEvents.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
  };
};

/**
 * Simpan email pemulihan
 */
export const saveRecoveryEmail = (email: string): void => {
  try {
    const appSettings = localStorage.getItem('app_settings');
    if (appSettings) {
      const settings = JSON.parse(appSettings);
      settings.account.recoveryEmail = email;
      localStorage.setItem('app_settings', JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Error menyimpan email pemulihan:', error);
  }
};

/**
 * Dapatkan email pemulihan
 */
export const getRecoveryEmail = (): string => {
  try {
    const appSettings = localStorage.getItem('app_settings');
    if (appSettings) {
      const settings = JSON.parse(appSettings);
      return settings.account?.recoveryEmail || '';
    }
  } catch (error) {
    console.error('Error mendapatkan email pemulihan:', error);
  }
  return '';
};

/**
 * Verifikasi email pemulihan (simulasi)
 * Dalam aplikasi nyata, ini akan mengirim email verifikasi
 */
export const verifyRecoveryEmail = async (email: string): Promise<boolean> => {
  // Simulasi proses verifikasi
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simpan status verifikasi
      try {
        const appSettings = localStorage.getItem('app_settings');
        if (appSettings) {
          const settings = JSON.parse(appSettings);
          settings.account.recoveryEmailVerified = true;
          localStorage.setItem('app_settings', JSON.stringify(settings));
        }
      } catch (error) {
        console.error('Error menyimpan status verifikasi email:', error);
      }
      
      resolve(true);
    }, 1500); // Simulasi delay 1.5 detik
  });
};

/**
 * Reset semua sesi aktif
 */
export const clearAllSessions = (): void => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.setItem('session_cleared', 'true');
  } catch (error) {
    console.error('Error menghapus semua sesi:', error);
  }
};

/**
 * Keluar dari semua perangkat (simulasi)
 */
export const logoutAllDevices = (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Hapus token auth dan tandai semua perangkat telah logout
      localStorage.removeItem('auth_token');
      localStorage.setItem('all_devices_logout', 'true');
      resolve(true);
    }, 1000);
  });
};

/**
 * Download user data as JSON file
 */
export const downloadUserData = (): void => {
  try {
    // Kumpulkan semua data pengguna
    const userData = {
      // Data profil
      profile: getUserProfile(),
      // Riwayat login
      loginHistory: getLoginHistory(),
      // Pengaturan
      settings: getUserSettings(),
      // Notifikasi
      notifications: getNotifications(),
      // Metadata
      meta: {
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    // Konversi ke format JSON yang mudah dibaca
    const jsonData = JSON.stringify(userData, null, 2);
    
    // Buat file untuk diunduh
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Buat link untuk mengunduh dan klik otomatis
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_pengguna_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Bersihkan setelah selesai
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  } catch (error) {
    console.error('Error downloading user data:', error);
    alert('Terjadi kesalahan saat mengunduh data pengguna.');
  }
};

/**
 * Dapatkan data profil pengguna
 */
const getUserProfile = (): Record<string, any> => {
  const username = localStorage.getItem('username') || '';
  
  // Simulasi data profil
  return {
    username,
    name: "Pengguna ASN Dashboard",
    role: localStorage.getItem('userRole') || 'user',
    createdAt: new Date().toISOString()
  };
};

/**
 * Dapatkan riwayat login pengguna
 */
const getLoginHistory = (): Record<string, any>[] => {
  try {
    // Coba dapatkan dari localStorage jika ada
    const loginNotifications = localStorage.getItem('asn_login_notifications');
    if (loginNotifications) {
      return JSON.parse(loginNotifications);
    }
  } catch (error) {
    console.error('Error parsing login history:', error);
  }
  
  // Return data kosong jika tidak ada
  return [];
};

/**
 * Dapatkan pengaturan pengguna
 */
const getUserSettings = (): Record<string, any> => {
  try {
    const appSettings = localStorage.getItem('app_settings');
    if (appSettings) {
      return JSON.parse(appSettings);
    }
  } catch (error) {
    console.error('Error parsing user settings:', error);
  }
  
  // Return data kosong jika tidak ada
  return {};
};

/**
 * Dapatkan notifikasi pengguna
 */
const getNotifications = (): Record<string, any>[] => {
  // Simulasi notifikasi
  return [
    {
      id: '1',
      type: 'system',
      message: 'Selamat datang di ASN Dashboard',
      timestamp: new Date().toISOString()
    }
  ];
}; 