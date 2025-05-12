// Mock authentication utilities for the demo app

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
}

// Kredensial default untuk demo
const DEFAULT_CREDENTIALS = {
  'admin': 'admin123',
  'user': 'user123',
  'superadmin': 'super123'
};

// LocalStorage key untuk menyimpan kredensial yang diubah
const CUSTOM_CREDENTIALS_KEY = 'custom_credentials';

/**
 * Fungsi untuk mendapatkan kredensial custom yang sudah disimpan
 * @returns Object dengan username sebagai key dan password sebagai value
 */
function getCustomCredentials(): Record<string, string> {
  try {
    const stored = localStorage.getItem(CUSTOM_CREDENTIALS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('Error parsing custom credentials:', e);
    return {};
  }
}

/**
 * Fungsi untuk menyimpan kredensial custom
 * @param username - Username
 * @param password - Password baru
 */
function saveCustomCredential(username: string, password: string) {
  try {
    const credentials = getCustomCredentials();
    credentials[username] = password;
    localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(credentials));
    console.log('Custom credential saved:', username);
  } catch (e) {
    console.error('Error saving custom credential:', e);
  }
}

/**
 * Fungsi untuk menghapus kredensial custom untuk username tertentu
 * @param username - Username yang akan dihapus kredensialnya
 * @returns Boolean menandakan keberhasilan
 */
export function removeCustomCredential(username: string): boolean {
  try {
    const credentials = getCustomCredentials();
    
    if (!(username in credentials)) {
      console.log('No custom credentials found for:', username);
      return false;
    }
    
    delete credentials[username];
    localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(credentials));
    console.log('Custom credential removed for:', username);
    return true;
  } catch (e) {
    console.error('Error removing custom credential:', e);
    return false;
  }
}

/**
 * Cek apakah user ada dalam sistem (tidak dihapus dan tersimpan di database)
 * @param username - Username yang akan dicek
 * @returns Boolean yang menunjukkan apakah user valid
 */
function isUserValid(username: string): boolean {
  // Cek apakah user ada dalam daftar yang dihapus
  try {
    const deletedUsers = JSON.parse(localStorage.getItem('deleted_users') || '[]');
    if (deletedUsers.includes(username)) {
      console.log('User is in deleted users list:', username);
      return false;
    }
  } catch (e) {
    console.error('Error checking deleted users:', e);
  }
  
  // Cek apakah user ada dalam kredensial default
  const isDefaultUser = username === 'admin' || username === 'user' || username === 'superadmin';
  
  if (isDefaultUser) {
    return true;
  }
  
  // Cek apakah user ada dalam daftar user terdaftar
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const userExists = registeredUsers.some((user: any) => user.username === username);
    
    if (userExists) {
      return true;
    }
  } catch (e) {
    console.error('Error checking registered users:', e);
  }
  
  // Cek apakah user ada dalam custom credentials (untuk kasus perubahan username)
  try {
    const customCredentials = getCustomCredentials();
    if (Object.keys(customCredentials).includes(username)) {
      console.log('User found in custom credentials:', username);
      return true;
    }
  } catch (e) {
    console.error('Error checking custom credentials:', e);
  }
  
  console.log('User is not found in any valid user list:', username);
  return false;
}

/**
 * Mendapatkan role asli user berdasarkan riwayat perubahan username
 * @param username - Username saat ini
 * @returns Role asli dari user
 */
function getOriginalUserRole(username: string): 'superadmin' | 'admin' | 'user' {
  // Default role adalah user
  let role: 'superadmin' | 'admin' | 'user' = 'user';
  
  // Cek apakah ini adalah default user
  if (username === 'admin') {
    return 'admin';
  } else if (username === 'superadmin') {
    return 'superadmin';
  } else if (username === 'user') {
    return 'user';
  }
  
  // Cek apakah username ini adalah hasil perubahan dari default user
  try {
    const usernameChanges = JSON.parse(localStorage.getItem('username_changes') || '{}');
    
    // Cek apakah ada username default yang diubah ke username ini
    for (const [oldUsername, newUsername] of Object.entries(usernameChanges)) {
      if (newUsername === username) {
        // Jika username asli adalah default user, tetapkan rolenya
        if (oldUsername === 'admin') {
          role = 'admin';
        } else if (oldUsername === 'superadmin') {
          role = 'superadmin';
        }
        break;
      }
    }
  } catch (e) {
    console.error('Error checking username changes for role:', e);
  }
  
  // Cek juga di registered users
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const user = registeredUsers.find((u: any) => u.username === username);
    if (user && user.role) {
      role = user.role;
    }
  } catch (e) {
    console.error('Error checking registered users for role:', e);
  }
  
  return role;
}

/**
 * Fungsi autentikasi untuk login
 */
export function authenticateUser(username: string, password: string): { 
  success: boolean; 
  role?: 'superadmin' | 'admin' | 'user';
  message?: string;
} {
  console.log('Login attempt:', { username, passwordLength: password.length });
  
  // Periksa apakah ada perubahan username sebelumnya untuk username ini
  let originalUsername = username;
  try {
    const usernameChanges = JSON.parse(localStorage.getItem('username_changes') || '{}');
    const changedUsernames = Object.entries(usernameChanges);
    
    // Cek apakah username ini adalah hasil perubahan
    for (const [oldUsername, newUsername] of changedUsernames) {
      if (newUsername === username) {
        console.log('Username was changed from:', oldUsername);
        originalUsername = oldUsername;
        break;
      }
    }
  } catch (e) {
    console.error('Error checking username changes:', e);
  }
  
  // Periksa apakah username ada dalam daftar user yang dihapus atau tidak valid
  if (!isUserValid(username)) {
    console.log('User is not valid:', username);
    
    // Cek juga username asli (jika sudah diubah)
    if (originalUsername !== username && !isUserValid(originalUsername)) {
      return {
        success: false,
        message: 'Akun ini telah dihapus atau tidak valid'
      };
    }
  }
  
  // Cek apakah ada kredensial kustom yang tersimpan
  const customCredentials = getCustomCredentials();
  console.log('Custom credentials:', Object.keys(customCredentials));
  
  // Cek apakah username memiliki password kustom yang tersimpan
  const hasCustomCredential = username in customCredentials;
  
  // Jika username memiliki password kustom, HANYA gunakan password kustom
  if (hasCustomCredential) {
    const isCustomCredentialValid = customCredentials[username] === password;
    console.log('User has custom credential, valid:', isCustomCredentialValid);
    
    if (isCustomCredentialValid) {
      // Tentukan peran pengguna
      const role = getOriginalUserRole(username);
      
      return {
        success: true,
        role
      };
    } else {
      // Password kustom salah
      return {
        success: false,
        message: 'Password salah'
      };
    }
  }
  
  // Jika tidak ada password kustom, maka cek kredensial default
  // Catatan: Ini hanya berlaku jika username belum diubah
  const isDefaultUser = username === 'admin' || username === 'user' || username === 'superadmin';
  const hasDefaultCredential = isDefaultUser;
  const isDefaultCredentialValid = hasDefaultCredential && 
    DEFAULT_CREDENTIALS[username as keyof typeof DEFAULT_CREDENTIALS] === password;
  
  // Cek user terdaftar (dari fitur registrasi)
  const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
  const registeredUser = registeredUsers.find((user: any) => 
    user.username === username && user.password === password
  );
  
  // Login valid jika kredensial default cocok atau user terdaftar ada
  const isLoginValid = isDefaultCredentialValid || !!registeredUser;
  
  console.log('Auth check results:', {
    originalUsername,
    hasCustomCredential,
    hasDefaultCredential,
    isDefaultCredentialValid,
    hasRegisteredUser: !!registeredUser,
    isLoginValid
  });
  
  // Tentukan peran pengguna
  const role = getOriginalUserRole(username);
  
  if (isLoginValid) {
    return {
      success: true,
      role
    };
  }
  
  return {
    success: false,
    message: 'Username atau password salah'
  };
}

/**
 * Get the current user info from localStorage
 */
export function getCurrentUser(): User | null {
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('userRole');
  
  if (!username) return null;
  
  // Fetch from registered users if available, or create mock user
  const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
  const user = registeredUsers.find((u: any) => u.username === username);
  
  if (user) {
    return {
      id: user.id || '1',
      username: user.username,
      email: user.email || '',
      name: user.name || username,
      role: role as 'superadmin' | 'admin' | 'user' || 'user'
    };
  }
  
  // If not found in registered users, create a mock user based on current login
  return {
    id: '1',
    username: username,
    email: `${username}@example.com`,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    role: role as 'superadmin' | 'admin' | 'user' || 'user'
  };
}

/**
 * Check if current user has a specific role
 */
export function hasRole(role: string | string[]): boolean {
  const currentRole = localStorage.getItem('userRole');
  if (!currentRole) {
    return false;
  }
  
  if (Array.isArray(role)) {
    return role.includes(currentRole);
  }
  
  return currentRole === role;
}

/**
 * Cek apakah user yang login adalah admin atau superadmin
 */
export function isAdmin(): boolean {
  try {
    // Periksa peran pengguna dari localStorage
    const role = localStorage.getItem('userRole');
    return role === 'admin' || role === 'superadmin';
  } catch (e) {
    console.error('Error checking admin status:', e);
    return false; // Default ke false jika terjadi error
  }
}

/**
 * Cek apakah user yang login adalah superadmin
 */
export function isSuperAdmin(): boolean {
  try {
    // Periksa peran pengguna dari localStorage
    const role = localStorage.getItem('userRole');
    return role === 'superadmin';
  } catch (e) {
    console.error('Error checking superadmin status:', e);
    return false; // Default ke false jika terjadi error
  }
}

/**
 * Store user info for the current login session
 */
export function storeUserInfo(username: string, role: string): void {
  localStorage.setItem('app_user', JSON.stringify({
    username,
    role,
    loginTime: new Date().toISOString()
  }));
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('asnToken');
}

/**
 * Change user password
 * @param currentPassword - Current password for verification
 * @param newPassword - New password to set
 * @returns Object with success status and message
 */
export function changePassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
  const username = localStorage.getItem('username');
  
  if (!username) {
    return { success: false, message: 'Tidak ada user yang login' };
  }
  
  console.log('Change password attempt for:', username);
  
  // Cek kredensial kustom
  const customCredentials = getCustomCredentials();
  
  // Verifikasi password saat ini
  let isCurrentPasswordValid = false;
  
  // Jika sudah ada kredensial kustom, gunakan itu
  if (username in customCredentials) {
    isCurrentPasswordValid = customCredentials[username] === currentPassword;
    console.log('Checking custom credential:', { 
      hasCustomCredential: true, 
      isPasswordValid: isCurrentPasswordValid
    });
  } 
  // Jika belum, cek dengan kredensial default
  else if (username in DEFAULT_CREDENTIALS) {
    isCurrentPasswordValid = DEFAULT_CREDENTIALS[username as keyof typeof DEFAULT_CREDENTIALS] === currentPassword;
    console.log('Checking default credential:', { 
      hasDefaultCredential: true, 
      isPasswordValid: isCurrentPasswordValid,
      currentPassword
    });
  }
  
  // Cek kredensial dari user terdaftar
  if (!isCurrentPasswordValid) {
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const registeredUser = registeredUsers.find((user: any) => user.username === username);
    if (registeredUser) {
      isCurrentPasswordValid = registeredUser.password === currentPassword;
      console.log('Checking registered user:', { 
        hasRegisteredUser: true, 
        isPasswordValid: isCurrentPasswordValid
      });
    }
  }
  
  console.log('Current password validation result:', { isCurrentPasswordValid });
  
  if (!isCurrentPasswordValid) {
    return { success: false, message: 'Password saat ini tidak valid' };
  }
  
  // Validasi password baru
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'Password baru harus minimal 6 karakter' };
  }
  
  // Simpan password baru
  saveCustomCredential(username, newPassword);
  
  console.log('Password changed successfully for:', username);
  console.log('New custom credentials:', getCustomCredentials());
  
  // Update registered user jika ini adalah user terdaftar
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const userIndex = registeredUsers.findIndex((user: any) => user.username === username);
    if (userIndex !== -1) {
      registeredUsers[userIndex].password = newPassword;
      localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
      console.log('Updated password in registered users');
    }
  } catch (e) {
    console.error('Error updating registered user password:', e);
  }
  
  // Update last password change date in settings dengan format yang benar
  try {
    const today = new Date();
    // Format tanggal YYYY-MM-DD
    const formattedDate = today.toISOString().split('T')[0];
    
    const appSettings = localStorage.getItem('app_settings');
    if (appSettings) {
      const parsedSettings = JSON.parse(appSettings);
      if (parsedSettings.account) {
        // Update tanggal perubahan password
        parsedSettings.account.lastPasswordChange = formattedDate;
        localStorage.setItem('app_settings', JSON.stringify(parsedSettings));
        console.log('Updated last password change date:', formattedDate);
      }
    }
  } catch (error) {
    console.error('Error updating password change date in settings:', error);
  }
  
  return { success: true, message: 'Password berhasil diubah' };
}

/**
 * Change username for the current logged in user
 * @param currentPassword - Password untuk verifikasi
 * @param newUsername - Username baru yang akan digunakan
 * @returns Object dengan status keberhasilan dan pesan
 */
export function changeUsername(currentPassword: string, newUsername: string): { success: boolean; message: string } {
  const currentUsername = localStorage.getItem('username');
  
  if (!currentUsername) {
    return { success: false, message: 'Tidak ada user yang login' };
  }
  
  console.log('Change username attempt:', { 
    currentUsername, 
    newUsername,
    passwordLength: currentPassword.length 
  });
  
  // Validasi username baru
  if (!newUsername || newUsername.trim().length < 3) {
    return { success: false, message: 'Username baru harus minimal 3 karakter' };
  }
  
  // Cek apakah username baru sudah digunakan, kecuali jika itu username saat ini
  if (newUsername !== currentUsername) {
    // Cek di daftar default user
    const defaultUsers = ['admin', 'user', 'superadmin'];
    const isUsernameTaken = defaultUsers.includes(newUsername);
    
    // Cek juga di registered users
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const existingUser = registeredUsers.find((user: any) => 
        user.username === newUsername && user.username !== currentUsername
      );
      
      if (existingUser) {
        return { success: false, message: 'Username sudah digunakan' };
      }
    } catch (e) {
      console.error('Error checking registered users:', e);
    }
    
    if (isUsernameTaken) {
      return { success: false, message: 'Username sudah digunakan (username default)' };
    }
  }
  
  // Verifikasi password
  let isPasswordValid = false;
  
  // Cek kredensial kustom
  const customCredentials = getCustomCredentials();
  
  // Jika sudah ada kredensial kustom, gunakan itu
  if (currentUsername in customCredentials) {
    isPasswordValid = customCredentials[currentUsername] === currentPassword;
  } 
  // Jika belum, cek dengan kredensial default
  else if (currentUsername in DEFAULT_CREDENTIALS) {
    isPasswordValid = DEFAULT_CREDENTIALS[currentUsername as keyof typeof DEFAULT_CREDENTIALS] === currentPassword;
  }
  
  // Cek kredensial dari user terdaftar
  if (!isPasswordValid) {
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const registeredUser = registeredUsers.find((user: any) => user.username === currentUsername);
    if (registeredUser) {
      isPasswordValid = registeredUser.password === currentPassword;
    }
  }
  
  console.log('Password validation for username change:', { isPasswordValid });
  
  if (!isPasswordValid) {
    return { success: false, message: 'Password tidak valid' };
  }
  
  // Update username
  try {
    // Dapatkan password user saat ini dari berbagai sumber
    let userPassword = null;
    let userRole = 'user';
    
    // Simpan role user saat ini
    if (currentUsername === 'admin') {
      userRole = 'admin';
    } else if (currentUsername === 'superadmin') {
      userRole = 'superadmin';
    }
    
    // Cek apakah akun ini adalah default account
    const isDefaultAccount = currentUsername === 'admin' || currentUsername === 'superadmin' || currentUsername === 'user';
    
    // Jika ini adalah akun default, harus dibuat sebagai akun custom baru
    if (isDefaultAccount) {
      // Dapatkan password dari DEFAULT_CREDENTIALS jika user belum memiliki custom password
      if (!(currentUsername in customCredentials)) {
        userPassword = DEFAULT_CREDENTIALS[currentUsername as keyof typeof DEFAULT_CREDENTIALS];
      } else {
        userPassword = customCredentials[currentUsername];
      }
      
      // Hapus kredensial lama jika ada
      if (currentUsername in customCredentials) {
        delete customCredentials[currentUsername];
      }
      
      // Simpan kredensial baru
      customCredentials[newUsername] = userPassword || currentPassword;
      localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(customCredentials));
      console.log('Created new custom credentials for default account:', { 
        oldUsername: currentUsername, 
        newUsername: newUsername 
      });
      
      // Tambahkan ke registered users jika belum ada
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        
        // Cek apakah user sudah ada di registered users dengan username saat ini
        const userIndex = registeredUsers.findIndex((user: any) => user.username === currentUsername);
        
        if (userIndex !== -1) {
          // Update username di entry yang sudah ada
          registeredUsers[userIndex].username = newUsername;
          registeredUsers[userIndex].role = userRole;
        } else {
          // Buat entry baru
          registeredUsers.push({
            id: Date.now().toString(),
            username: newUsername,
            password: userPassword || currentPassword,
            email: `${newUsername}@example.com`,
            name: newUsername.charAt(0).toUpperCase() + newUsername.slice(1),
            role: userRole,
            createdAt: new Date().toISOString()
          });
        }
        
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
        console.log('Updated registered users for default account change');
      } catch (e) {
        console.error('Error updating registered users:', e);
      }
    } else {
      // Untuk akun non-default, ikuti proses normal
      // Cek apakah ada di custom credentials
      if (currentUsername in customCredentials) {
        userPassword = customCredentials[currentUsername];
        
        // Hapus entry lama
        delete customCredentials[currentUsername];
        
        // Tambahkan entry baru dengan username baru
        customCredentials[newUsername] = userPassword;
        
        // Simpan kembali ke localStorage
        localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(customCredentials));
        console.log('Custom credentials updated after username change:', customCredentials);
      } 
      
      // Cek di registered users
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const userIndex = registeredUsers.findIndex((user: any) => user.username === currentUsername);
      
      if (userIndex !== -1) {
        // Simpan password dari registered user jika tidak ada dari sumber lain
        if (!userPassword) {
          userPassword = registeredUsers[userIndex].password;
          
          // Simpan ke custom credentials juga
          customCredentials[newUsername] = userPassword;
          localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(customCredentials));
        }
        
        // Update username di registered users
        registeredUsers[userIndex].username = newUsername;
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
        console.log('Updated username in registered users');
      }
    }
    
    // Update username di localStorage
    localStorage.setItem('username', newUsername);
    
    // Update role di localStorage (memastikan role tetap sama setelah perubahan username)
    if (userRole !== 'user') {
      localStorage.setItem('userRole', userRole);
    }
    
    // Update app_user yang menyimpan info user saat ini
    try {
      const appUser = JSON.parse(localStorage.getItem('app_user') || '{}');
      if (appUser) {
        appUser.username = newUsername;
        localStorage.setItem('app_user', JSON.stringify(appUser));
        console.log('Updated username in app_user');
      }
    } catch (err) {
      console.error('Error updating app_user:', err);
    }
    
    // Update user_profile data jika ada
    try {
      const userProfile = localStorage.getItem('user_profile');
      if (userProfile) {
        // Parse user profile data for reference
        // const profileData = JSON.parse(userProfile); - Not used currently
        
        // Simpan username lama untuk referensi di tempat lain
        localStorage.setItem('previous_username', currentUsername);
        
        // Jangan update name/nama secara otomatis di profil
        // Biarkan name/nama di profil dikelola secara terpisah
        
        // Tapi catat di console untuk debugging
        console.log('Username changed, but profile name not automatically updated');
      }
    } catch (err) {
      console.error('Error updating user_profile:', err);
    }
    
    // Simpan riwayat perubahan username
    try {
      const usernameChanges = JSON.parse(localStorage.getItem('username_changes') || '{}');
      usernameChanges[currentUsername] = newUsername;
      localStorage.setItem('username_changes', JSON.stringify(usernameChanges));
      console.log('Saved username change history:', { from: currentUsername, to: newUsername });
    } catch (err) {
      console.error('Error saving username change history:', err);
    }
    
    // Pastikan username lama tidak ada dalam daftar user yang dihapus
    try {
      const deletedUsers = JSON.parse(localStorage.getItem('deleted_users') || '[]');
      const index = deletedUsers.indexOf(currentUsername);
      if (index !== -1) {
        deletedUsers.splice(index, 1);
        localStorage.setItem('deleted_users', JSON.stringify(deletedUsers));
        console.log('Removed old username from deleted users list:', currentUsername);
      }
    } catch (err) {
      console.error('Error updating deleted users list:', err);
    }
    
    // Setel flag yang menandakan username telah diubah untuk keperluan logout otomatis
    localStorage.setItem('username_changed', 'true');
    
    console.log('Username changed successfully:', { from: currentUsername, to: newUsername });
    
    return { success: true, message: 'Username berhasil diubah' };
  } catch (e) {
    console.error('Error updating username:', e);
    return { success: false, message: 'Terjadi kesalahan saat mengubah username' };
  }
}

/**
 * Membersihkan kredensial kustom yang tidak valid (pengguna yang sudah tidak ada)
 * @returns Object dengan informasi tentang pembersihan
 */
export function cleanupInvalidCredentials(): { cleaned: number, remaining: number } {
  try {
    const customCredentials = getCustomCredentials();
    // Commented out unused variable
    // const originalCount = Object.keys(customCredentials).length;
    const validUsernames: string[] = [];
    
    // Tambahkan default users
    validUsernames.push('admin', 'user', 'superadmin');
    
    // Tambahkan registered users
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      registeredUsers.forEach((user: any) => {
        if (user.username && !validUsernames.includes(user.username)) {
          validUsernames.push(user.username);
        }
      });
    } catch (e) {
      console.error('Error getting registered users for cleanup:', e);
    }
    
    // Hapus kredensial yang tidak valid
    let cleanedCount = 0;
    for (const username in customCredentials) {
      if (!validUsernames.includes(username)) {
        delete customCredentials[username];
        cleanedCount++;
        console.log('Removed invalid credential for:', username);
      }
    }
    
    // Simpan kembali ke localStorage
    localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(customCredentials));
    
    const remainingCount = Object.keys(customCredentials).length;
    console.log(`Cleaned ${cleanedCount} invalid credentials, ${remainingCount} remaining`);
    
    return {
      cleaned: cleanedCount,
      remaining: remainingCount
    };
  } catch (e) {
    console.error('Error cleaning up invalid credentials:', e);
    return { cleaned: 0, remaining: 0 };
  }
}

/**
 * Fungsi untuk menampilkan informasi debug tentang kredensial yang tersimpan
 * @returns Object dengan informasi kredensial
 */
interface CredentialsDebugInfo {
  customCredentialsCount: number;
  customCredentialsList: string[];
  registeredUsersCount: number;
  registeredUsersList: string[];
  deletedUsersCount: number;
  deletedUsersList: string[];
  error?: string;
}

export function getCredentialsDebugInfo(): CredentialsDebugInfo {
  try {
    const customCredentials = getCustomCredentials();
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const deletedUsers = JSON.parse(localStorage.getItem('deleted_users') || '[]');
    
    return {
      customCredentialsCount: Object.keys(customCredentials).length,
      customCredentialsList: Object.keys(customCredentials),
      registeredUsersCount: registeredUsers.length,
      registeredUsersList: registeredUsers.map((user: { username: string }) => user.username),
      deletedUsersCount: deletedUsers.length,
      deletedUsersList: deletedUsers
    };
  } catch (e) {
    console.error('Error getting credentials debug info:', e);
    return {
      customCredentialsCount: 0,
      customCredentialsList: [],
      registeredUsersCount: 0,
      registeredUsersList: [],
      deletedUsersCount: 0,
      deletedUsersList: [],
      error: 'Error getting credentials debug info'
    };
  }
}

/**
 * Reset semua data aplikasi - hanya untuk kasus parah
 * @returns Object dengan status keberhasilan
 */
export function resetAllData(): { success: boolean; message: string } {
  try {
    // Daftar kunci localStorage yang akan dihapus
    const keysToRemove = [
      'custom_credentials',
      'registered_users',
      'deleted_users',
      'username_changes',
      'app_user',
      'username',
      'userRole',
      'asnToken',
      'auth_token',
      'username_changed',
      'demoPassword',
      'userPassword'
    ];
    
    // Hapus setiap kunci
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('All user data has been reset');
    
    return {
      success: true,
      message: 'Semua data telah direset. Silakan muat ulang aplikasi dan login dengan credentials default'
    };
  } catch (e) {
    console.error('Error resetting data:', e);
    return {
      success: false,
      message: 'Terjadi kesalahan saat mereset data'
    };
  }
}

/**
 * Update user profile data in localStorage
 */
export interface UserProfileData {
  name?: string;
  email?: string;
  avatar?: string;
  preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

export function updateUserProfile(profileData: UserProfileData): void {
  try {
    // Get existing profile data
    const existingProfileJson = localStorage.getItem('user_profile');
    let existingProfile = {};
    
    if (existingProfileJson) {
      try {
        existingProfile = JSON.parse(existingProfileJson);
      } catch (error) {
        console.error('Error parsing existing profile data:', error);
      }
    }
    
    // Merge with new data
    const updatedProfile = {
      ...existingProfile,
      ...profileData
    };
    
    // Jangan paksa name selalu sama dengan username
    // Biarkan user mengubah nama lengkap tanpa terpengaruh username
    
    // Save back to localStorage
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    console.log('Profile data updated successfully:', updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
}

/**
 * Get user profile data from localStorage
 */
export function getUserProfile(): UserProfileData | null {
  try {
    const profileJson = localStorage.getItem('user_profile');
    let profileData = null;
    
    if (profileJson) {
      profileData = JSON.parse(profileJson);
      return profileData;
    }
    
    // If no profile data exists, create default based on current user
    if (!profileData) {
      const username = localStorage.getItem('username');
      const userRole = localStorage.getItem('userRole');
      
      if (username) {
        const defaultProfile = {
          name: username, // Default awal menggunakan username
          role: userRole || 'user',
          email: `${username}@employee-management.gov.id`,
          phone: '021-5550123',
          address: 'Jl. Merdeka No. 123, Jakarta Pusat',
          birthDate: '1985-05-15',
          joinDate: new Date().toISOString().split('T')[0]
        };
        
        // Save default profile
        localStorage.setItem('user_profile', JSON.stringify(defaultProfile));
        console.log('Created default profile for user:', username);
        
        return defaultProfile;
      }
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
  }
  
  return null;
} 