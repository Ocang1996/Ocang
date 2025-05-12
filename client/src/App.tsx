import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfilePage from './components/profile/ProfilePage';
import EmployeeList from './components/employees/EmployeeList';
import ReportsPage from './components/reports/ReportsPage';
import Settings from './components/settings/Settings';
import LandingPage from './components/landing/LandingPage';
import SettingsIndicator from './components/ui/SettingsIndicator';
import TwoFactorAuth from './components/auth/TwoFactorAuth';
import HelpPage from './components/help/HelpPage';
import ResetPassword from './components/auth/ResetPassword';
import LeavePage from './pages/leave';
import { UserRole } from './types/auth';
import { initSessionTimeout } from './lib/sessionUtils';
import { isAdmin, authenticateUser } from './lib/auth';
import { addLoginNotification, getUserDeviceInfo } from './lib/notificationUtils';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [requireTwoFA, setRequireTwoFA] = useState<boolean>(false);
  const [pendingUser, setPendingUser] = useState<string>('');
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('asnToken');
    const storedRole = localStorage.getItem('userRole');
    
    // Check if username has been changed
    const usernameChanged = localStorage.getItem('username_changed');
    
    if (usernameChanged === 'true') {
      // Clear the flag
      localStorage.removeItem('username_changed');
      
      // Show notification
      alert('Username telah diubah. Silakan login kembali dengan username baru Anda.');
      
      // Force logout
      handleLogout();
      return;
    }
    
    if (token) {
      setIsAuthenticated(true);
      if (storedRole) {
        setUserRole(storedRole as UserRole);
      }
    }
  }, []);

  // Setup session timeout
  useEffect(() => {
    if (isAuthenticated) {
      // Inisialisasi session timeout dengan callback logout
      const cleanupSessionTimeout = initSessionTimeout(() => {
        // Tandai sesi sudah berakhir
        setSessionExpired(true);
        // Logout user
        handleLogout();
      });

      // Bersihkan event listener saat komponen unmount
      return cleanupSessionTimeout;
    }
  }, [isAuthenticated]);

  const handleLogin = (username: string, password: string, role: UserRole) => {
    // Reset session expired state
    setSessionExpired(false);
    
    // Menggunakan role yang diberikan dari halaman login yang sudah divalidasi
    // oleh fungsi authenticateUser
    if (username && password) {
      // Check if 2FA is enabled for this user
      const twoFAEnabled = checkIfTwoFAEnabled(username);
      
      if (twoFAEnabled) {
        // Don't authenticate yet, require 2FA verification first
        setPendingUser(username);
        setUserRole(role);
        setRequireTwoFA(true);
        return true;
      } else {
        // No 2FA required, complete login immediately
        completeLogin(username, role);
        return true;
      }
    }
    return false;
  };
  
  const checkIfTwoFAEnabled = (username: string): boolean => {
    // This would typically be an API call to check if 2FA is enabled
    // For demo, check if it's enabled in localStorage based on settings
    try {
      const appSettings = localStorage.getItem('app_settings');
      if (appSettings) {
        const settings = JSON.parse(appSettings);
        return settings?.account?.twoFactorEnabled || false;
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
    return false;
  };
  
  const completeLogin = (username: string, role: UserRole) => {
    // Set a dummy token and authenticate the user
    localStorage.setItem('asnToken', 'mock-jwt-token');
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
    
    console.log('Login completed for:', username, 'with role:', role);
    
    setIsAuthenticated(true);
  };
  
  const handleVerifyTwoFA = async (code: string): Promise<boolean> => {
    // This would typically be an API call to verify the 2FA code
    // For demo purposes, accept any 6-digit code
    if (code.length === 6 && /^\d+$/.test(code)) {
      // Verification successful, complete login
      completeLogin(pendingUser, userRole);
      setRequireTwoFA(false);
      setPendingUser('');
      return true;
    }
    return false;
  };
  
  const handleCancelTwoFA = () => {
    // Cancel 2FA verification and return to login
    setRequireTwoFA(false);
    setPendingUser('');
  };

  const handleLogout = () => {
    localStorage.removeItem('asnToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    // Jangan hapus demoPassword agar pengguna bisa login dengan password yang baru
    setIsAuthenticated(false);
    setUserRole('user');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {sessionExpired && (
        <div className="fixed top-0 left-0 right-0 bg-red-100 text-red-800 p-3 z-50 flex items-center justify-between">
          <div className="flex-1 text-center">
            <span className="font-medium">Sesi Anda telah berakhir:</span> Silakan login kembali untuk melanjutkan.
          </div>
          <button 
            onClick={() => setSessionExpired(false)}
            className="p-1 hover:bg-red-200 rounded-full"
          >
            ×
          </button>
        </div>
      )}

      {requireTwoFA ? (
        <TwoFactorAuth 
          username={pendingUser}
          onVerify={handleVerifyTwoFA}
          onCancel={handleCancelTwoFA}
        />
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : 
            <Login onLogin={handleLogin} />
          } />
          
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : 
            <Register />
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} userRole={userRole} />
            </ProtectedRoute>
          } />
          
          <Route path="/employees" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EmployeeList onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ReportsPage onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfilePage onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Settings onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          
          <Route path="/help" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <HelpPage onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/leave" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <LeavePage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
        </Routes>
      )}
      
      {/* Display the settings indicator when user is authenticated */}
      {isAuthenticated && (
        <SettingsIndicator />
      )}
    </div>
  );
}

export default App;